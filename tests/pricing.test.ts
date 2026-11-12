import { test } from "node:test";
import assert from "node:assert/strict";
import { calculate, dates } from "../lib/pricing";
const rates = { dailyPrice: 500, weeklyPrice: 3000, monthlyPrice: 9000 };
const config = { weeklyDiscount: 5, monthlyDiscount: 1 };
test("seven-day example applies weekly discount", () => {
  const q = calculate(rates, config, "2027-01-01", "2027-01-08");
  assert.equal(q.total, 2850);
  assert.equal(q.discount, 150);
});
test("30 days applies monthly rate and one percent discount", () =>
  assert.equal(
    calculate(rates, config, "2027-01-01", "2027-01-31").total,
    8910,
  ));
test("months, weeks and remaining days compose correctly", () => {
  const q = calculate(rates, config, "2027-01-01", "2027-02-09");
  assert.equal(q.days, 39);
  assert.equal(q.total, 12760);
});
test("vehicle override zero does not use default", () =>
  assert.equal(
    calculate(
      { ...rates, weeklyDiscount: 0 },
      config,
      "2027-01-01",
      "2027-01-08",
    ).total,
    3000,
  ));
test("invalid or reversed periods rejected", () => {
  assert.throws(() => dates("bad", "2027-01-02"));
  assert.throws(() => dates("2027-01-02", "2027-01-01"));
  assert.throws(() => dates("2027-01-02", "2027-01-02"));
});
test("partial days round up independently of daylight saving", () =>
  assert.equal(dates("2027-03-27T10:00:00Z", "2027-03-28T10:01:00Z").days, 2));
test("currency calculations remain at integer cents", () => {
  const q = calculate(
    { dailyPrice: 10.11, weeklyPrice: 60.29, monthlyPrice: 200.19 },
    config,
    "2027-01-01",
    "2027-01-16",
  );
  assert.equal(q.total, 124.67);
});
import { rentalQuote } from '../lib/pricing';
test('airport fees count each handover and exclude refundable deposit',()=>{
 const q=rentalQuote(rates,{...config,airportHandoverFee:75,securityDeposit:3000},'2027-01-01','2027-01-08','Marrakech Menara Airport (RAK)','Marrakech Menara Airport (RAK)');
 assert.equal(q.rentalTotal,2850);assert.equal(q.handoverFee,150);assert.equal(q.total,3000);assert.equal(q.securityDeposit,3000);
});
test('unconfigured airport fee stays explicitly unknown, not free',()=>{
 const q=rentalQuote(rates,config,'2027-01-01','2027-01-02','Marrakech Menara Airport (RAK)','Marrakech city');
 assert.equal(q.airportFeeKnown,false);assert.equal(q.total,500);assert.equal(q.securityDeposit,null);
});
test('explicit zero handover fee is configured and zero',()=>{
 const q=rentalQuote(rates,{...config,airportHandoverFee:0},'2027-01-01','2027-01-02','Marrakech Menara Airport (RAK)','Marrakech city');assert.equal(q.airportFeeKnown,true);assert.equal(q.handoverFee,0);
});
