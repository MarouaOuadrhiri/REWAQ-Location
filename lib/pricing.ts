export type Rates = {
  dailyPrice: unknown;
  weeklyPrice: unknown;
  monthlyPrice: unknown;
  weeklyDiscount?: unknown;
  monthlyDiscount?: unknown;
};
export function dates(start: string | Date, end: string | Date) {
  const pickupAt = new Date(start),
    returnAt = new Date(end);
  if (
    !Number.isFinite(+pickupAt) ||
    !Number.isFinite(+returnAt) ||
    returnAt <= pickupAt
  )
    throw new Error("Return date must follow pickup date.");
  for (const value of [start, end])
    if (
      typeof value === "string" &&
      /^\d{4}-\d{2}-\d{2}$/.test(value) &&
      new Date(value).toISOString().slice(0, 10) !== value
    )
      throw new Error("Invalid calendar date.");
  const days = Math.ceil((+returnAt - +pickupAt) / 86400000);
  if (days > 730) throw new Error("Maximum rental duration is 730 days.");
  return { pickupAt, returnAt, days };
}
export function calculate(
  rates: Rates,
  settings: { weeklyDiscount: unknown; monthlyDiscount: unknown },
  start: string | Date,
  end: string | Date,
) {
  const { days } = dates(start, end);
  const months = Math.floor(days / 30),
    weeks = Math.floor((days % 30) / 7),
    remainder = (days % 30) % 7;
  const weeklyDiscount = Number(
      rates.weeklyDiscount ?? settings.weeklyDiscount,
    ),
    monthlyDiscount = Number(rates.monthlyDiscount ?? settings.monthlyDiscount);
  // Integer cents, with each discounted unit rounded once. No floating point totals.
  const dailyCents = Math.round(Number(rates.dailyPrice) * 100),
    weeklyCents = Math.round(Number(rates.weeklyPrice) * 100),
    monthlyCents = Math.round(Number(rates.monthlyPrice) * 100);
  const monthNet = Math.round(
      (monthlyCents * (10000 - Math.round(monthlyDiscount * 100))) / 10000,
    ),
    weekNet = Math.round(
      (weeklyCents * (10000 - Math.round(weeklyDiscount * 100))) / 10000,
    );
  const subtotalCents =
    months * monthlyCents + weeks * weeklyCents + remainder * dailyCents;
  const totalCents =
    months * monthNet + weeks * weekNet + remainder * dailyCents;
  return {
    currency: "MAD",
    days,
    months,
    weeks,
    remainder,
    dailyPrice: dailyCents / 100,
    weeklyPrice: weeklyCents / 100,
    monthlyPrice: monthlyCents / 100,
    weeklyDiscount,
    monthlyDiscount,
    subtotal: subtotalCents / 100,
    discount: (subtotalCents - totalCents) / 100,
    total: totalCents / 100,
  };
}
export const money = (n: unknown) =>
  new Intl.NumberFormat("en-MA", { maximumFractionDigits: 2 }).format(
    Number(n),
  ) + " DH";

export function rentalQuote(rates: Rates, config: {weeklyDiscount:unknown;monthlyDiscount:unknown;airportHandoverFee?:unknown;securityDeposit?:unknown;rentalTerms?:string|null}, start:string|Date, end:string|Date, pickupLocation='', returnLocation='') {
 const base=calculate(rates,config,start,end);
 const airportHandovers=[pickupLocation,returnLocation].filter(v=>v.includes('(RAK)')).length;
 const airportFeeKnown=config.airportHandoverFee!=null;
 const handoverFee=airportFeeKnown ? Math.round(Number(config.airportHandoverFee)*100)*airportHandovers/100 : 0;
 return {...base,rentalTotal:base.total,airportHandovers,handoverFee,airportFeeKnown,securityDeposit:config.securityDeposit==null?null:Number(config.securityDeposit),rentalTerms:config.rentalTerms||null,total:Math.round((base.total+handoverFee)*100)/100};
}
