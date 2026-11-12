const assert = require("node:assert/strict");
const { PrismaClient } = require("@prisma/client");
const db = new PrismaClient();
const base = "http://127.0.0.1:3000";
let cookie = "";
let checks = 0;
async function request(url, method = "GET", body, auth = false) {
  const response = await fetch(base + url, {
    method,
    headers: {
      Origin: base,
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(auth ? { Cookie: cookie } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    redirect: "manual",
  });
  let data;
  try {
    data = await response.json();
  } catch {
    data = null;
  }
  return { response, data };
}
function check(value, label) {
  assert.ok(value, label);
  checks++;
  console.log("PASS " + label);
}
async function main() {
  const anon = await request("/api/admin/reservations");
  check(anon.response.status === 401, "admin API rejects anonymous access");
  const login = await request("/api/auth/login", "POST", {
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
  });
  check(login.response.ok, "admin login works");
  cookie = login.response.headers.get("set-cookie").split(";")[0];
  const cars = (await request("/api/vehicles")).data;
  check(cars.length >= 3, "fleet loaded from database");
  const car = cars.find((v) => v.slug === "mercedes-c-class") || cars[0];
  const offset = Math.floor(Math.random() * 600) + 180;
  const pickup = new Date(Date.now() + offset * 86400000)
    .toISOString()
    .slice(0, 10);
  const end = new Date(new Date(pickup).getTime() + 7 * 86400000)
    .toISOString()
    .slice(0, 10);
  const payload = {
    vehicleId: car.id,
    pickupAt: pickup,
    returnAt: end,
    pickupLocation: "Casablanca",
    returnLocation: "Marrakech",
    customer: {
      fullName: "Integration Test Customer",
      phone: "+212600000000",
      email: "test@example.invalid",
      identityNumber: "TEST-ONLY",
      drivingLicense: "TEST-LICENSE",
    },
    total: 1,
    status: "CONFIRMED",
    notes: "Automated integration test; preserved for audit.",
  };
  const quote = await request("/api/pricing/quote", "POST", payload);
  check(
    quote.response.ok && quote.data.total === 2850,
    "backend computes 7-day price as 2,850 DH",
  );
  const [one, two] = await Promise.all([
    request("/api/reservations", "POST", payload),
    request("/api/reservations", "POST", payload),
  ]);
  check(
    [one, two].filter((v) => v.response.status === 201).length === 1,
    "concurrent overlapping requests yield exactly one booking",
  );
  const created = one.response.status === 201 ? one : two;
  const booking = await db.reservation.findUnique({
    where: { reference: created.data.reference },
  });
  check(
    booking.status === "PENDING" && Number(booking.total) === 2850,
    "browser status and price tampering ignored",
  );
  const confirmation = await fetch(
    base +
      "/booking/" +
      booking.reference +
      "?token=" +
      created.data.accessToken,
  );
  check(confirmation.ok, "private confirmation page loads");
  const detail = await request(
    "/api/admin/reservations/" + booking.id,
    "GET",
    undefined,
    true,
  );
  check(detail.data.history.length === 1, "creation history persisted");
  const update = {
    vehicleId: car.id,
    pickupAt: pickup,
    returnAt: end,
    pickupLocation: "Casablanca",
    returnLocation: "Rabat",
    status: "CONFIRMED",
    internalNotes: "Confirmed during integration verification",
  };
  check(
    (
      await request(
        "/api/admin/reservations/" + booking.id,
        "PATCH",
        update,
        true,
      )
    ).response.ok,
    "administrator confirms booking",
  );
  const conflict = await request("/api/reservations", "POST", payload);
  check(!conflict.response.ok, "confirmed reservation prevents overlap");
  const longer = new Date(new Date(end).getTime() + 86400000)
    .toISOString()
    .slice(0, 10);
  update.returnAt = longer;
  const edited = await request(
    "/api/admin/reservations/" + booking.id,
    "PATCH",
    update,
    true,
  );
  check(
    edited.response.ok && Number(edited.data.total) === 3350,
    "admin date edit recalculates price",
  );
  const history = await db.reservationHistory.count({
    where: { reservationId: booking.id },
  });
  check(history === 3, "all modifications have history records");
  update.status = "CANCELLED";
  check(
    (
      await request(
        "/api/admin/reservations/" + booking.id,
        "PATCH",
        update,
        true,
      )
    ).response.ok,
    "booking cancellation preserves record",
  );
  check(
    !!(await db.reservation.findUnique({ where: { id: booking.id } })),
    "cancelled booking retained",
  );
  const badUpload = new FormData();
  badUpload.set(
    "file",
    new Blob(["<svg>bad</svg>"], { type: "image/png" }),
    "fake.png",
  );
  const upload = await fetch(
    base + "/api/admin/vehicles/" + car.id + "/images",
    {
      method: "POST",
      headers: { Origin: base, Cookie: cookie },
      body: badUpload,
    },
  );
  check(!upload.ok, "spoofed image upload rejected");
  const cross = await fetch(base + "/api/admin/settings", {
    method: "PATCH",
    headers: {
      Origin: "https://attacker.invalid",
      Cookie: cookie,
      "Content-Type": "application/json",
    },
    body: "{}",
  });
  check(!cross.ok, "cross-origin admin mutation rejected");
  for (const url of [
    "/",
    "/cars",
    "/cars/" + car.slug,
    "/about",
    "/services",
    "/contact",
    "/admin/dashboard",
    "/admin/cars",
    "/admin/reservations",
    "/admin/customers",
    "/admin/calendar",
    "/admin/pricing",
    "/admin/settings",
  ]) {
    const r = await fetch(base + url, {
      headers: url.startsWith("/admin") ? { Cookie: cookie } : {},
    });
    check(r.ok, "page " + url + " renders");
  }
  await request("/api/auth/logout", "POST", {}, true);
  check(
    (await request("/api/admin/reservations", "GET", undefined, true)).response
      .status === 401,
    "logout revokes the database session",
  );
  console.log(
    `\n${checks} end-to-end checks passed. Test booking retained as CANCELLED.`,
  );
}
main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
