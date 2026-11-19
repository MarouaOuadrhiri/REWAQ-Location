import { Prisma } from "@prisma/client";
import { calculate, rentalQuote, Rates } from "./pricing";
export const visibleVehicles = {
  archived: false,
  listingStatus: "APPROVED",
  OR: [{ agencyId: null }, { agency: { is: { status: "ACTIVE" } } }],
} satisfies Prisma.VehicleWhereInput;
export const agencyPricingSelect = {
  id: true,
  name: true,
  status: true,
  commissionOverride: true,
} as const;
type AgencyRates = Rates & {
  agencyId?: string | null;
  agency?: {
    id: string;
    name: string;
    status: string;
    commissionOverride: unknown;
  } | null;
};
type Config = Parameters<typeof rentalQuote>[1] & { partnerMarkup?: unknown };
export function markupRate(vehicle: AgencyRates, config: Config) {
  return vehicle.agencyId
    ? Number(vehicle.agency?.commissionOverride ?? config.partnerMarkup ?? 10)
    : 0;
}
export function markedRates<T extends AgencyRates>(vehicle: T, config: Config) {
  const rate = markupRate(vehicle, config);
  const add = (v: unknown) =>
    Math.round(
      (Math.round(Number(v) * 100) * (10000 + Math.round(rate * 100))) / 10000,
    ) / 100;
  return {
    ...vehicle,
    dailyPrice: add(vehicle.dailyPrice),
    weeklyPrice: add(vehicle.weeklyPrice),
    monthlyPrice: add(vehicle.monthlyPrice),
  };
}
export function publicVehicle<T extends AgencyRates>(
  vehicle: T,
  config: Config,
) {
  const { agency, agencyId, ...rest } = markedRates(vehicle, config);
  return { ...rest, agencyName: agency?.name ?? null };
}
export function marketplaceQuote(
  vehicle: AgencyRates,
  config: Config,
  ...args: Parameters<typeof rentalQuote> extends [unknown, unknown, ...infer R]
    ? R
    : never
) {
  const retail = rentalQuote(markedRates(vehicle, config), config, ...args),
    net = calculate(vehicle, config, args[0], args[1]).total;
  return {
    ...retail,
    agencyId: vehicle.agencyId ?? null,
    agencyName: vehicle.agency?.name ?? null,
    commissionRate: markupRate(vehicle, config),
    supplierSubtotal: net,
    platformMarkup: Math.round((retail.rentalTotal - net) * 100) / 100,
  };
}
export function publicQuote(quote: ReturnType<typeof marketplaceQuote>) {
  const {
    agencyId,
    agencyName,
    commissionRate,
    supplierSubtotal,
    platformMarkup,
    ...retail
  } = quote;
  return retail;
}
export function bookingSplit(quote: ReturnType<typeof marketplaceQuote>) {
  return {
    agencyId: quote.agencyId,
    commissionRate: quote.commissionRate,
    platformMarkup: quote.platformMarkup,
    supplierSubtotal: quote.supplierSubtotal,
  };
}
