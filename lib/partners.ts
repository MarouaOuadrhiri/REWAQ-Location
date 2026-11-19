import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { compare, hash as passwordHash } from "bcryptjs";
import { z } from "zod";
import { db } from "./db";
import { hash, token } from "./auth";
import { vehicleSchema } from "./validation";
import { lockVehicles, settings } from "./reservations";
import { uploadVehicleImages, setPrimaryVehicleImage } from "./vehicle-images";
export async function partner() {
  const raw = (await cookies()).get("rewaq_partner")?.value;
  if (!raw) return null;
  const session = await db.agencySession.findUnique({
    where: { tokenHash: hash(raw) },
    include: { agency: true },
  });
  return session &&
    session.expiresAt > new Date() &&
    session.agency.status !== "SUSPENDED"
    ? session.agency
    : null;
}
export async function requirePartner(active = false) {
  const agency = await partner();
  if (!agency) throw new Error("UNAUTHORIZED");
  if (active && agency.status !== "ACTIVE")
    throw new Error(
      "Votre compte doit être activé par REWAQ avant cette action.",
    );
  return agency;
}
const attempts = new Map<string, { count: number; reset: number }>();
function rateLimit(req: NextRequest, route: string) {
  const key =
      route +
      ":" +
      (req.headers.get("x-forwarded-for")?.split(",")[0] || "local"),
    prior = attempts.get(key),
    entry =
      prior && prior.reset > Date.now()
        ? prior
        : { count: 0, reset: Date.now() + 60000 };
  attempts.set(key, entry);
  if (++entry.count > 15)
    throw new Error("Trop de tentatives. Réessayez dans une minute.");
  if (attempts.size > 10000)
    for (const [k, v] of attempts) if (v.reset < Date.now()) attempts.delete(k);
}
async function openSession(id: string) {
  const raw = token();
  await db.agencySession.create({
    data: {
      agencyId: id,
      tokenHash: hash(raw),
      expiresAt: new Date(Date.now() + 8 * 3600000),
    },
  });
  (await cookies()).set("rewaq_partner", raw, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 28800,
  });
}
export async function partnerOperations(req: NextRequest, segments: string[]) {
  const [resource, id, action] = segments;
  if (resource === "register" && req.method === "POST") {
    rateLimit(req, "register");
    const input = z
      .object({
        name: z.string().trim().min(3).max(150),
        email: z
          .string()
          .trim()
          .email()
          .max(200)
          .transform((v) => v.toLowerCase()),
        phone: z.string().trim().min(7).max(40),
        city: z.string().trim().min(2).max(100),
        password: z
          .string()
          .min(12)
          .max(72)
          .refine(
            (v) => Buffer.byteLength(v, "utf8") <= 72,
            "Password must be at most 72 bytes.",
          ),
      })
      .parse(await req.json());
    const { password, ...data } = input;
    const agency = await db.agency.create({
      data: {
        ...data,
        passwordHash: await passwordHash(password, 12),
        status: "PENDING",
      },
    });
    await openSession(agency.id);
    return NextResponse.json(
      { ok: true, status: agency.status },
      { status: 201 },
    );
  }
  if (resource === "login" && req.method === "POST") {
    rateLimit(req, "login");
    const input = z
      .object({
        email: z
          .string()
          .trim()
          .email()
          .transform((v) => v.toLowerCase()),
        password: z.string().max(200),
      })
      .parse(await req.json());
    const agency = await db.agency.findUnique({
      where: { email: input.email },
    });
    if (
      !agency ||
      !(await compare(input.password, agency.passwordHash)) ||
      agency.status === "SUSPENDED"
    )
      return NextResponse.json(
        { error: "Identifiants invalides ou compte indisponible." },
        { status: 401 },
      );
    await openSession(agency.id);
    return NextResponse.json({ ok: true });
  }
  if (resource === "logout" && req.method === "POST") {
    const jar = await cookies(),
      raw = jar.get("rewaq_partner")?.value;
    if (raw)
      await db.agencySession.deleteMany({ where: { tokenHash: hash(raw) } });
    jar.delete("rewaq_partner");
    return NextResponse.json({ ok: true });
  }
  const agency = await requirePartner();
  if (resource === "profile") {
    if (req.method === "GET")
      return NextResponse.json({
        id: agency.id,
        name: agency.name,
        email: agency.email,
        phone: agency.phone,
        city: agency.city,
        address: agency.address,
        status: agency.status,
        commissionRate: Number(
          agency.commissionOverride ?? (await settings()).partnerMarkup,
        ),
      });
    if (req.method === "PATCH") {
      const data = z
        .object({
          name: z.string().trim().min(3).max(150),
          phone: z.string().trim().min(7).max(40),
          city: z.string().trim().min(2).max(100),
          address: z.string().trim().max(2000).optional(),
        })
        .parse(await req.json());
      await db.agency.update({ where: { id: agency.id }, data });
      return NextResponse.json({ ok: true });
    }
  }
  if (resource === "vehicles") {
    if (req.method === "GET" && id)
      return NextResponse.json(
        await db.vehicle.findFirstOrThrow({
          where: { id, agencyId: agency.id },
          include: { images: { orderBy: { position: "asc" } } },
        }),
      );
    if (req.method === "GET") {
      const rows = await db.vehicle.findMany({
        where: { agencyId: agency.id },
        include: { images: { orderBy: { position: "asc" } } },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json(rows);
    }
    await requirePartner(true);
    if (req.method === "POST" && !id) {
      const input = vehicleSchema
        .omit({ featured: true })
        .parse(await req.json());
      return NextResponse.json(
        await db.vehicle.create({
          data: {
            ...input,
            slug: agency.id.slice(-8) + "-" + input.slug,
            agencyId: agency.id,
            featured: false,
            listingStatus: "PENDING",
          },
        }),
        { status: 201 },
      );
    }
    if (id) {
      await db.vehicle.findFirstOrThrow({ where: { id, agencyId: agency.id } });
      if (action === "images" && req.method === "POST")
        return uploadVehicleImages(req, id, agency.id);
      if (action === "images" && req.method === "PATCH")
        return setPrimaryVehicleImage(req, id, agency.id);
      if (!action && req.method === "PATCH") {
        const input = vehicleSchema
          .omit({ featured: true })
          .parse(await req.json());
        return NextResponse.json(
          await db.$transaction(async (tx) => {
            await lockVehicles(tx, [id]);
            await tx.vehicle.findFirstOrThrow({
              where: { id, agencyId: agency.id },
            });
            return tx.vehicle.update({
              where: { id },
              data: { ...input, listingStatus: "PENDING", featured: false },
            });
          }),
        );
      }
    }
  }
  if (resource === "reservations" && req.method === "GET")
    return NextResponse.json(
      await db.reservation.findMany({
        where: { agencyId: agency.id },
        select: {
          id: true,
          reference: true,
          pickupAt: true,
          returnAt: true,
          pickupLocation: true,
          returnLocation: true,
          status: true,
          flightNumber: true,
          arrivalTime: true,
          meetingPoint: true,
          days: true,
          total: true,
          supplierSubtotal: true,
          platformMarkup: true,
          commissionRate: true,
          vehicle: { select: { brand: true, model: true, registration: true } },
          customer: { select: { fullName: true, phone: true } },
        },
        orderBy: { pickupAt: "desc" },
      }),
    );
  return NextResponse.json({ error: "Not found" }, { status: 404 });
}
export async function partnerAdminOperations(
  req: NextRequest,
  segments: string[],
) {
  const [, resource, id, action] = segments;
  if (resource === "agencies") {
    if (req.method === "GET")
      return NextResponse.json(
        await db.agency.findMany({
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            city: true,
            status: true,
            commissionOverride: true,
            createdAt: true,
            _count: { select: { vehicles: true, reservations: true } },
          },
          orderBy: { createdAt: "desc" },
        }),
      );
    if (id && req.method === "PATCH") {
      const data = z
        .object({
          status: z.enum(["PENDING", "ACTIVE", "SUSPENDED"]),
          commissionOverride: z.coerce
            .number()
            .min(0)
            .max(100)
            .nullable()
            .optional(),
        })
        .parse(await req.json());
      await db.$transaction(async (tx) => {
        await tx.agency.update({ where: { id }, data });
        if (data.status === "SUSPENDED")
          await tx.agencySession.deleteMany({ where: { agencyId: id } });
      });
      return NextResponse.json({ ok: true });
    }
  }
  if (
    resource === "vehicles" &&
    id &&
    action === "review" &&
    req.method === "PATCH"
  ) {
    const { listingStatus } = z
      .object({ listingStatus: z.enum(["PENDING", "APPROVED", "REJECTED"]) })
      .parse(await req.json());
    await db.$transaction(async (tx) => {
      await lockVehicles(tx, [id]);
      const vehicle = await tx.vehicle.findUniqueOrThrow({
        where: { id },
        include: { agency: { select: { status: true } } },
      });
      if (
        vehicle.agencyId &&
        listingStatus === "APPROVED" &&
        vehicle.agency?.status !== "ACTIVE"
      )
        throw new Error("Activate the agency before approving its vehicle.");
      await tx.vehicle.update({ where: { id }, data: { listingStatus } });
    });
    return NextResponse.json({ ok: true });
  }
}
