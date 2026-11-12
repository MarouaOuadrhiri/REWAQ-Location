import { z } from "zod";
const text = z.string().trim().min(1).max(200);
export const customerSchema = z.object({
  fullName: text.min(3),
  phone: text.min(7),
  email: z.string().email().max(200),
  identityNumber: text,
  drivingLicense: text,
});
export const periodSchema = z.object({
  vehicleId: text,
  pickupAt: z.string().min(10),
  returnAt: z.string().min(10),
  pickupLocation: text,
  returnLocation: text,
});
export const bookingSchema = periodSchema.extend({
  customer: customerSchema,
  notes: z.string().max(2000).optional(),
  flightNumber: z
    .string()
    .trim()
    .max(20)
    .regex(/^[a-zA-Z0-9 -]*$/, "Use a valid flight number.")
    .optional(),
  arrivalTime: z
    .string()
    .regex(/^$|^([01]\d|2[0-3]):[0-5]\d$/, "Use a valid arrival time.")
    .optional(),
});
const price = z.coerce.number().positive().max(10000000);
const discount = z.coerce.number().min(0).max(100).nullable().optional();
export const vehicleSchema = z.object({
  slug: text.regex(/^[a-z0-9-]+$/),
  brand: text,
  model: text,
  year: z.coerce.number().int().min(1950).max(2100),
  registration: text,
  category: text,
  description: z.string().min(10).max(10000),
  transmission: z.enum(["Automatic", "Manual"]),
  fuel: z.enum(["Petrol", "Diesel", "Electric", "Hybrid"]),
  seats: z.coerce.number().int().min(1).max(20),
  dailyPrice: price,
  weeklyPrice: price,
  monthlyPrice: price,
  weeklyDiscount: discount,
  monthlyDiscount: discount,
  archived: z.boolean().default(false),
  featured: z.boolean().default(false),
});
export const settingsSchema = z.object({
  weeklyDiscount: z.coerce.number().min(0).max(100),
  monthlyDiscount: z.coerce.number().min(0).max(100),
  pendingExpiryHours: z.coerce.number().int().min(1).max(720),
  pendingBlocks: z.boolean(),
  airportHandoverFee: z.coerce.number().min(0).max(100000).nullable().optional(),
  securityDeposit: z.coerce.number().min(0).max(1000000).nullable().optional(),
  rentalTerms: z.string().trim().max(10000).nullable().optional(),
});
export const editSchema = periodSchema.extend({
  status: z.enum([
    "PENDING",
    "CONFIRMED",
    "ACTIVE",
    "COMPLETED",
    "CANCELLED",
    "REJECTED",
    "EXPIRED",
  ]),
  internalNotes: z.string().max(4000).optional(),
  flightNumber: z.string().trim().max(20).optional(),
  arrivalTime: z.string().regex(/^$|^([01]\d|2[0-3]):[0-5]\d$/).optional(),
  meetingPoint: z.string().trim().max(200).optional(),
});
