import { NextRequest, NextResponse } from "next/server";
import { compare } from "bcryptjs";
import { cookies } from "next/headers";
import { Prisma } from "@prisma/client";
import { ZodError, z } from "zod";
import { db } from "@/lib/db";
import {
  uploadVehicleImages,
  setPrimaryVehicleImage,
} from "@/lib/vehicle-images";
import { publicOperations, adminOperations } from "@/lib/operations";
import { admin, requireAdmin, sameOrigin, hash, token } from "@/lib/auth";
import {
  available,
  createBooking,
  editBooking,
  expirePending,
  lockVehicles,
  settings,
} from "@/lib/reservations";
import { rentalQuote, dates } from "@/lib/pricing";
import {
  customerSchema,
  settingsSchema,
  vehicleSchema,
} from "@/lib/validation";
export const runtime = "nodejs";
const attempts = new Map<string, { count: number; reset: number }>();
async function handler(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  try {
    const segments = (await context.params).path;
    const route = segments.join("/");
    const method = req.method;
    if (method !== "GET") await sameOrigin(req);
    if (route === "auth/login" && method === "POST") {
      const key = "login";
      const previous = attempts.get(key);
      const limit =
        previous && previous.reset > Date.now()
          ? previous
          : { count: 0, reset: Date.now() + 60000 };
      attempts.set(key, limit);
      if (++limit.count > 20)
        return NextResponse.json(
          { error: "Too many attempts. Wait a minute." },
          { status: 429 },
        );
      const data = z
        .object({ email: z.string().email(), password: z.string().max(200) })
        .parse(await req.json());
      const user = await db.admin.findUnique({ where: { email: data.email } });
      if (!user || !(await compare(data.password, user.passwordHash)))
        return NextResponse.json(
          { error: "Invalid email or password." },
          { status: 401 },
        );
      const value = token();
      await db.adminSession.create({
        data: {
          adminId: user.id,
          tokenHash: hash(value),
          expiresAt: new Date(Date.now() + 8 * 3600000),
        },
      });
      (await cookies()).set("location_session", value, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 28800,
      });
      return NextResponse.json({ ok: true });
    }
    if (route === "auth/session")
      return NextResponse.json({
        admin: await admin().then((v) =>
          v ? { name: v.name, email: v.email } : null,
        ),
      });
    if (route === "auth/logout" && method === "POST") {
      const c = await cookies(),
        value = c.get("location_session")?.value;
      if (value)
        await db.adminSession.deleteMany({ where: { tokenHash: hash(value) } });
      c.delete("location_session");
      return NextResponse.json({ ok: true });
    }
    if (route === "reservations" && method === "POST")
      return NextResponse.json(await createBooking(await req.json()), {
        status: 201,
      });
    if (route === "pricing/quote" && method === "POST") {
      const input = z
        .object({
          vehicleId: z.string(),
          pickupAt: z.string(),
          returnAt: z.string(),
          pickupLocation: z.string().max(200).optional(),
          returnLocation: z.string().max(200).optional(),
        })
        .parse(await req.json());
      const period = dates(input.pickupAt, input.returnAt);
      const vehicle = await db.vehicle.findUniqueOrThrow({
        where: { id: input.vehicleId, archived: false },
      });
      await available(db, vehicle.id, period.pickupAt, period.returnAt);
      return NextResponse.json(
        rentalQuote(
          vehicle,
          await settings(),
          period.pickupAt,
          period.returnAt,
          input.pickupLocation,
          input.returnLocation,
        ),
      );
    }
    if (route === "vehicles" && method === "GET")
      return NextResponse.json(
        await db.vehicle.findMany({
          where: { archived: false },
          include: { images: { orderBy: { position: "asc" } } },
        }),
      );
    const publicResult = await publicOperations(req, segments);
    if (publicResult) return publicResult;
    if (segments[0] !== "admin")
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    const user = await requireAdmin();
    await expirePending();
    const [, resource, id, action] = segments;
    const operationResult = await adminOperations(req, segments, user);
    if (operationResult) return operationResult;
    if (resource === "vehicles") {
      if (method === "GET")
        return NextResponse.json(
          await db.vehicle.findMany({
            include: { images: true },
            orderBy: { createdAt: "desc" },
          }),
        );
      if (method === "POST" && !id)
        return NextResponse.json(
          await db.vehicle.create({
            data: vehicleSchema.parse(await req.json()),
          }),
          { status: 201 },
        );
      if (id && !action && method === "PATCH")
        return NextResponse.json(
          await db.$transaction(async (tx) => {
            await lockVehicles(tx, [id]);
            return tx.vehicle.update({
              where: { id },
              data: vehicleSchema.parse(await req.json()),
            });
          }),
        );
      if (id && action === "images" && method === "POST")
        return uploadVehicleImages(req, id);
      if (id && action === "images" && method === "PATCH")
        return setPrimaryVehicleImage(req, id);
    }
    if (resource === "reservations") {
      if (method === "GET")
        return NextResponse.json(
          id
            ? await db.reservation.findUniqueOrThrow({
                where: { id },
                include: {
                  customer: true,
                  vehicle: true,
                  history: { orderBy: { createdAt: "desc" } },
                  payments: true,
                },
              })
            : await db.reservation.findMany({
                include: { customer: true, vehicle: true },
                orderBy: { createdAt: "desc" },
              }),
        );
      if (id && method === "PATCH")
        return NextResponse.json(
          await editBooking(id, await req.json(), user.id),
        );
    }
    if (resource === "customers") {
      if (method === "GET")
        return NextResponse.json(
          await db.customer.findMany({
            include: { _count: { select: { reservations: true } } },
          }),
        );
      if (id && method === "PATCH")
        return NextResponse.json(
          await db.customer.update({
            where: { id },
            data: customerSchema.parse(await req.json()),
          }),
        );
    }
    if (resource === "settings") {
      if (method === "GET") return NextResponse.json(await settings());
      if (method === "PATCH") {
        const data = settingsSchema.parse(await req.json());
        return NextResponse.json(
          await db.pricingSettings.upsert({
            where: { id: 1 },
            create: { id: 1, ...data },
            update: data,
          }),
        );
      }
    }
    if (resource === "calendar") {
      if (method === "GET")
        return NextResponse.json({
          reservations: await db.reservation.findMany({
            where: {
              vehicleId: req.nextUrl.searchParams.get("vehicleId") || undefined,
            },
            include: { vehicle: true },
          }),
          blocks: await db.vehicleMaintenance.findMany({
            where: { cancelledAt: null },
            include: { vehicle: true },
          }),
        });
      if (method === "POST") {
        const data = z
          .object({
            vehicleId: z.string(),
            startAt: z.string(),
            endAt: z.string(),
            kind: z.enum(["MANUAL", "MAINTENANCE"]),
            reason: z.string().min(3).max(500),
          })
          .parse(await req.json());
        const { pickupAt: startAt, returnAt: endAt } = dates(
          data.startAt,
          data.endAt,
        );
        return NextResponse.json(
          await db.$transaction(async (tx) => {
            await lockVehicles(tx, [data.vehicleId]);
            await available(tx, data.vehicleId, startAt, endAt);
            return tx.vehicleMaintenance.create({
              data: { ...data, startAt, endAt },
            });
          }),
        );
      }
      if (id && method === "PATCH")
        return NextResponse.json(
          await db.vehicleMaintenance.update({
            where: { id },
            data: { cancelledAt: new Date() },
          }),
        );
    }
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  } catch (error) {
    if (error instanceof ZodError)
      return NextResponse.json(
        {
          error: error.issues
            .map((v) => `${v.path.join(".")}: ${v.message}`)
            .join("; "),
        },
        { status: 400 },
      );
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json(
        {
          error:
            error.code === "P2002"
              ? "This unique value already exists."
              : error.code === "P2025"
                ? "Record not found."
                : "Database request failed.",
        },
        { status: error.code === "P2025" ? 404 : 409 },
      );
    }
    const message = error instanceof Error ? error.message : "Request failed";
    return NextResponse.json(
      { error: message === "UNAUTHORIZED" ? "Sign in required." : message },
      { status: message === "UNAUTHORIZED" ? 401 : 400 },
    );
  }
}
export { handler as GET, handler as POST, handler as PATCH };
