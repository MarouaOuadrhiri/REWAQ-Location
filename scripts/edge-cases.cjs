const assert = require("node:assert/strict");
const { PrismaClient } = require("@prisma/client");
const db = new PrismaClient();
const base = "http://127.0.0.1:3000";
let cookie = "";
let count = 0;
async function req(url, method = "GET", body) {
  const r = await fetch(base + url, {
    method,
    headers: {
      Origin: base,
      Cookie: cookie,
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return { r, data: await r.json() };
}
function check(v, message) {
  assert.ok(v, message);
  console.log("PASS " + message);
  count++;
}
async function main() {
  const login = await req("/api/auth/login", "POST", {
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
  });
  cookie = login.r.headers.get("set-cookie").split(";")[0];
  const car = await db.vehicle.findFirstOrThrow({ where: { slug: "bmw-m2" } });
  const config = await db.pricingSettings.findUniqueOrThrow({
    where: { id: 1 },
  });
  const offset = 800 + Math.floor(Math.random() * 300);
  const date = new Date(Date.now() + offset * 86400000);
  const p = date.toISOString().slice(0, 10),
    r = new Date(+date + 3 * 86400000).toISOString().slice(0, 10);
  const payload = {
    vehicleId: car.id,
    pickupAt: p,
    returnAt: r,
    pickupLocation: "Rabat",
    returnLocation: "Rabat",
    customer: {
      fullName: "Edge Case Test",
      email: "edge@example.invalid",
      phone: "+212600000001",
      identityNumber: "TEST-EDGE",
      drivingLicense: "TEST-EDGE",
    },
  };
  const created = await req("/api/reservations", "POST", payload);
  check(created.r.ok, "create pending hold for edge tests");
  const item = await db.reservation.findUniqueOrThrow({
    where: { reference: created.data.reference },
  });
  await db.reservation.update({
    where: { id: item.id },
    data: { expiresAt: new Date(Date.now() - 1000) },
  });
  check(
    (await req("/api/pricing/quote", "POST", payload)).r.ok,
    "expired hold no longer blocks quote",
  );
  await req("/api/admin/reservations");
  const expired = await db.reservation.findUniqueOrThrow({
    where: { id: item.id },
    include: { history: true },
  });
  check(
    expired.status === "EXPIRED" &&
      expired.history.some((v) => v.action === "EXPIRED"),
    "expiration persists with audit history",
  );
  const block = await req("/api/admin/calendar", "POST", {
    vehicleId: car.id,
    startAt: p,
    endAt: r,
    kind: "MAINTENANCE",
    reason: "Integration maintenance test",
  });
  check(block.r.ok, "maintenance block created");
  check(
    !(await req("/api/reservations", "POST", payload)).r.ok,
    "maintenance prevents booking",
  );
  const adjacent = {
    ...payload,
    pickupAt: r,
    returnAt: new Date(+new Date(r) + 86400000).toISOString().slice(0, 10),
  };
  check(
    (await req("/api/pricing/quote", "POST", adjacent)).r.ok,
    "adjacent interval allowed at block return boundary",
  );
  await req("/api/admin/calendar/" + block.data.id, "PATCH", {});
  check(
    (await req("/api/pricing/quote", "POST", payload)).r.ok,
    "released maintenance restores availability",
  );
  const mutable = {
    ...car,
    archived: true,
    dailyPrice: Number(car.dailyPrice),
    weeklyPrice: Number(car.weeklyPrice),
    monthlyPrice: Number(car.monthlyPrice),
    weeklyDiscount:
      car.weeklyDiscount === null ? null : Number(car.weeklyDiscount),
    monthlyDiscount:
      car.monthlyDiscount === null ? null : Number(car.monthlyDiscount),
  };
  check(
    (await req("/api/admin/vehicles/" + car.id, "PATCH", mutable)).r.ok,
    "vehicle archived",
  );
  check(
    !(await req("/api/reservations", "POST", payload)).r.ok,
    "archived vehicle rejects public booking",
  );
  check(
    !!(await db.reservation.findUnique({ where: { id: item.id } })),
    "archive preserves booking history",
  );
  mutable.archived = false;
  check(
    (await req("/api/admin/vehicles/" + car.id, "PATCH", mutable)).r.ok,
    "vehicle restored",
  );
  const changed = {
    weeklyDiscount: 6,
    monthlyDiscount: 2,
    pendingExpiryHours: 12,
    pendingBlocks: false,
  };
  check(
    (await req("/api/admin/settings", "PATCH", changed)).r.ok,
    "settings are editable",
  );
  const q = await req("/api/pricing/quote", "POST", {
    ...payload,
    returnAt: new Date(+new Date(p) + 7 * 86400000).toISOString().slice(0, 10),
  });
  check(
    q.data.weeklyDiscount === 6,
    "global discount applies to inheriting vehicle",
  );
  await req("/api/admin/settings", "PATCH", {
    weeklyDiscount: Number(config.weeklyDiscount),
    monthlyDiscount: Number(config.monthlyDiscount),
    pendingExpiryHours: config.pendingExpiryHours,
    pendingBlocks: config.pendingBlocks,
  });
  let rejected = false;
  try {
    await db.vehicle.update({
      where: { id: car.id },
      data: { dailyPrice: -1 },
    });
  } catch {
    rejected = true;
  }
  check(rejected, "MySQL rejects invalid negative price");
  await req("/api/auth/logout", "POST", {});
  console.log(
    `${count} edge-case checks passed. Expired booking and released block retained.`,
  );
}
main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
