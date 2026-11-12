const assert = require("node:assert/strict");
const fs = require("node:fs");
const { PrismaClient } = require("@prisma/client");
const db = new PrismaClient();
const base = "http://127.0.0.1:3000";
let cookie = "",
  checks = 0;
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
function check(v, label) {
  assert.ok(v, label);
  checks++;
  console.log("PASS " + label);
}
async function main() {
  const login = await req("/api/auth/login", "POST", {
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
  });
  cookie = login.r.headers.get("set-cookie").split(";")[0];
  const suffix = Date.now().toString(36);
  const data = {
    slug: "test-lifecycle-" + suffix,
    brand: "TEST FIXTURE",
    model: "Lifecycle verification",
    year: 2025,
    registration: "TEST-" + suffix,
    category: "Test inventory",
    description:
      "Synthetic vehicle created for end-to-end lifecycle verification; archived after testing.",
    transmission: "Automatic",
    fuel: "Petrol",
    seats: 5,
    dailyPrice: 100,
    weeklyPrice: 600,
    monthlyPrice: 2000,
    archived: false,
    featured: false,
    weeklyDiscount: null,
    monthlyDiscount: null,
  };
  const car = await req("/api/admin/vehicles", "POST", data);
  check(car.r.status === 201, "admin creates a vehicle through REST API");
  const form = new FormData();
  form.set(
    "file",
    new Blob([fs.readFileSync("public/vehicles/mercedes.png")], {
      type: "image/png",
    }),
    "car.png",
  );
  form.set("alt", "Synthetic test vehicle photo");
  const upload = await fetch(
    base + "/api/admin/vehicles/" + car.data.id + "/images",
    { method: "POST", headers: { Origin: base, Cookie: cookie }, body: form },
  );
  check(upload.ok, "valid vehicle image upload persists");
  const image = await upload.json();
  check(
    (await fetch(base + image.url)).ok,
    "uploaded image is served by the production server",
  );
  const today = new Date().toISOString().slice(0, 10),
    end = new Date(Date.now() + 86400000).toISOString().slice(0, 10),
    later = new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10);
  const payload = {
    vehicleId: car.data.id,
    pickupAt: today,
    returnAt: end,
    pickupLocation: "Casablanca",
    returnLocation: "Casablanca",
    customer: {
      fullName: "Lifecycle Test Customer",
      phone: "+212600000003",
      email: "lifecycle@example.invalid",
      identityNumber: "TEST-LIFECYCLE",
      drivingLicense: "TEST-LIFECYCLE",
    },
  };
  const created = await req("/api/reservations", "POST", payload);
  check(created.r.ok, "guest books newly created vehicle");
  const booking = await db.reservation.findUniqueOrThrow({
    where: { reference: created.data.reference },
  });
  const edit = {
    vehicleId: car.data.id,
    pickupAt: today,
    returnAt: later,
    pickupLocation: "Casablanca",
    returnLocation: "Casablanca",
    status: "CONFIRMED",
    internalNotes: "Synthetic test retained for audit.",
  };
  const confirmed = await req(
    "/api/admin/reservations/" + booking.id,
    "PATCH",
    edit,
  );
  check(
    confirmed.r.ok &&
      Number(confirmed.data.total) === 200 &&
      confirmed.data.originalPricingSnapshot.total === 100,
    "repricing preserves immutable original price",
  );
  edit.status = "ACTIVE";
  check(
    (await req("/api/admin/reservations/" + booking.id, "PATCH", edit)).r.ok,
    "confirmed rental becomes active during selected dates",
  );
  edit.status = "COMPLETED";
  check(
    (await req("/api/admin/reservations/" + booking.id, "PATCH", edit)).r.ok,
    "active rental becomes completed",
  );
  check(
    !(await req("/api/admin/reservations/" + booking.id, "PATCH", edit)).r.ok,
    "completed booking cannot be edited",
  );
  check(
    (
      await req("/api/admin/vehicles/" + car.data.id, "PATCH", {
        ...data,
        archived: true,
      })
    ).r.ok,
    "test vehicle archived",
  );
  check(
    !!(await db.reservation.findUnique({ where: { id: booking.id } })),
    "completed reservation survives vehicle archive",
  );
  await req("/api/auth/logout", "POST", {});
  console.log(
    `${checks} lifecycle checks passed. Synthetic vehicle archived; completed history retained.`,
  );
}
main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
