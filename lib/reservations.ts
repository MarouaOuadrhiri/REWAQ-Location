import { Prisma, ReservationStatus } from "@prisma/client";
import { randomBytes } from "node:crypto";
import { db } from "./db";
import { rentalQuote, dates } from "./pricing";
import { hash, token } from "./auth";
import { bookingSchema, editSchema } from "./validation";
type Tx = Prisma.TransactionClient;
export const settings = (tx: Tx = db) =>
  tx.pricingSettings.upsert({
    where: { id: 1 },
    create: { id: 1 },
    update: {},
  });
export async function lockVehicles(tx: Tx, ids: string[]) {
  for (const id of [...new Set(ids)].sort())
    await tx.$queryRaw`SELECT id FROM Vehicle WHERE id = ${id} FOR UPDATE`;
}
export async function available(
  tx: Tx,
  vehicleId: string,
  start: Date,
  end: Date,
  exclude?: string,
) {
  const config = await settings(tx);
  const conflict = await tx.reservation.findFirst({
    where: {
      vehicleId,
      id: exclude ? { not: exclude } : undefined,
      pickupAt: { lt: end },
      returnAt: { gt: start },
      OR: [
        { status: { in: ["CONFIRMED", "ACTIVE"] } },
        ...(config.pendingBlocks
          ? [{ status: "PENDING" as const, expiresAt: { gt: new Date() } }]
          : []),
      ],
    },
  });
  const block = await tx.vehicleMaintenance.findFirst({
    where: {
      vehicleId,
      cancelledAt: null,
      startAt: { lt: end },
      endAt: { gt: start },
    },
  });
  if (conflict || block)
    throw new Error("Vehicle unavailable for the selected dates.");
}
function snapshot(v: unknown) {
  return JSON.parse(JSON.stringify(v)) as Prisma.InputJsonValue;
}
export async function createBooking(raw: unknown) {
  const input = bookingSchema.parse(raw);
  const { pickupAt, returnAt } = dates(input.pickupAt, input.returnAt);
  if (pickupAt < new Date(new Date().toISOString().slice(0, 10)))
    throw new Error("Pickup must be today or later.");
  const accessToken = token();
  const reservation = await db.$transaction(
    async (tx) => {
      await lockVehicles(tx, [input.vehicleId]);
      const vehicle = await tx.vehicle.findUniqueOrThrow({
        where: { id: input.vehicleId },
      });
      if (vehicle.archived) throw new Error("This vehicle is archived.");
      await available(tx, vehicle.id, pickupAt, returnAt);
      const config = await settings(tx);
      const pricing = rentalQuote(
        vehicle,
        config,
        pickupAt,
        returnAt,
        input.pickupLocation,
        input.returnLocation,
      );
      const customer = await tx.customer.create({ data: input.customer });
      const result = await tx.reservation.create({
        data: {
          reference: "LOC-" + randomBytes(6).toString("hex").toUpperCase(),
          accessTokenHash: hash(accessToken),
          vehicleId: vehicle.id,
          customerId: customer.id,
          flightNumber: input.flightNumber?.toUpperCase() || null,
          arrivalTime: input.arrivalTime || null,
          pickupAt,
          returnAt,
          pickupLocation: input.pickupLocation,
          returnLocation: input.returnLocation,
          days: pricing.days,
          total: pricing.total,
          pricingSnapshot: pricing,
          originalPricingSnapshot: pricing,
          originalCustomer: input.customer,
          notes:
            [
              input.notes,
              input.flightNumber
                ? `Flight: ${input.flightNumber.toUpperCase()}`
                : "",
              input.arrivalTime
                ? `Arrival time (Marrakech local): ${input.arrivalTime}`
                : "",
            ]
              .filter(Boolean)
              .join("\n") || undefined,
          expiresAt: new Date(Date.now() + config.pendingExpiryHours * 3600000),
        },
      });
      await tx.reservationHistory.create({
        data: {
          reservationId: result.id,
          action: "CREATED",
          after: snapshot(result),
        },
      });
      return result;
    },
    {
      maxWait: 10000,
      timeout: 15000,
      isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
    },
  );
  return { reference: reservation.reference, accessToken };
}
const transitions: Record<ReservationStatus, ReservationStatus[]> = {
  PENDING: ["PENDING", "CONFIRMED", "REJECTED", "CANCELLED", "EXPIRED"],
  CONFIRMED: ["CONFIRMED", "ACTIVE", "CANCELLED"],
  ACTIVE: ["ACTIVE", "COMPLETED"],
  COMPLETED: ["COMPLETED"],
  CANCELLED: ["CANCELLED"],
  REJECTED: ["REJECTED"],
  EXPIRED: ["EXPIRED"],
};
export async function editBooking(id: string, raw: unknown, adminId: string) {
  const input = editSchema.parse(raw);
  const { pickupAt, returnAt } = dates(input.pickupAt, input.returnAt);
  return db.$transaction(
    async (tx) => {
      const initial = await tx.reservation.findUniqueOrThrow({ where: { id } });
      await lockVehicles(tx, [initial.vehicleId, input.vehicleId]);
      const before = await tx.reservation.findUniqueOrThrow({ where: { id } });
      if (before.vehicleId !== initial.vehicleId)
        throw new Error("Reservation changed concurrently. Please retry.");
      const expired =
        before.status === "PENDING" &&
        before.expiresAt &&
        before.expiresAt <= new Date();
      if (expired)
        throw new Error("Pending reservation expired; create a new booking.");
      if (!transitions[before.status].includes(input.status))
        throw new Error("Invalid reservation status transition.");
      if (
        ["COMPLETED", "CANCELLED", "REJECTED", "EXPIRED"].includes(
          before.status,
        )
      )
        throw new Error("Historical reservations are immutable.");
      const vehicle = await tx.vehicle.findUniqueOrThrow({
        where: { id: input.vehicleId },
      });
      if (
        vehicle.archived &&
        (before.vehicleId !== vehicle.id ||
          ["PENDING", "CONFIRMED", "ACTIVE"].includes(input.status))
      )
        throw new Error("Restore this archived vehicle first.");
      await available(tx, vehicle.id, pickupAt, returnAt, id);
      if (
        input.status === "ACTIVE" &&
        (pickupAt > new Date() || returnAt <= new Date())
      )
        throw new Error("An active rental must include the current time.");
      const pricing = rentalQuote(
        vehicle,
        await settings(tx),
        pickupAt,
        returnAt,
        input.pickupLocation,
        input.returnLocation,
      );
      const after = await tx.reservation.update({
        where: { id },
        data: {
          ...input,
          pickupAt,
          returnAt,
          days: pricing.days,
          total: pricing.total,
          pricingSnapshot: pricing,
          expiresAt: input.status === "PENDING" ? before.expiresAt : null,
        },
      });
      await tx.reservationHistory.create({
        data: {
          reservationId: id,
          adminId,
          action: "ADMIN_UPDATED",
          before: snapshot(before),
          after: snapshot(after),
        },
      });
      return after;
    },
    {
      maxWait: 10000,
      timeout: 15000,
      isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
    },
  );
}
export async function expirePending() {
  return db.$transaction(
    async (tx) => {
      const items = await tx.reservation.findMany({
        where: { status: "PENDING", expiresAt: { lte: new Date() } },
      });
      for (const item of items) {
        await lockVehicles(tx, [item.vehicleId]);
        const changed = await tx.reservation.updateMany({
          where: {
            id: item.id,
            status: "PENDING",
            expiresAt: { lte: new Date() },
          },
          data: { status: "EXPIRED" },
        });
        if (changed.count)
          await tx.reservationHistory.create({
            data: {
              reservationId: item.id,
              action: "EXPIRED",
              before: snapshot(item),
              after: { status: "EXPIRED" },
            },
          });
      }
      return items.length;
    },
    { timeout: 30000 },
  );
}
