const assert = require("node:assert/strict");
const { PrismaClient } = require("@prisma/client");
const db = new PrismaClient();
const base = "http://127.0.0.1:3000";
let cookie = "",
  count = 0;
function check(v, label) {
  assert.ok(v, label);
  count++;
  console.log("PASS " + label);
}
async function request(url, method = "GET", body) {
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
async function main() {
  const home = await (await fetch(base)).text();
  check(
    home.includes("when you") && home.includes("Marrakech Menara"),
    "homepage prioritizes Marrakech airport arrivals",
  );
  const car = await db.vehicle.findUniqueOrThrow({
    where: { slug: "mercedes-c-class" },
  });
  const offset = 900 + Math.floor(Math.random() * 200),
    pickup = new Date(Date.now() + offset * 86400000)
      .toISOString()
      .slice(0, 10),
    end = new Date(+new Date(pickup) + 7 * 86400000).toISOString().slice(0, 10);
  const query = new URLSearchParams({
    pickupAt: pickup,
    returnAt: end,
    location: "Marrakech Menara Airport (RAK)",
  });
  const html = await (await fetch(base + "/cars?" + query)).text();
  check(
    html.includes("2,850 DH") && html.includes("Rental total for"),
    "search results display backend period price",
  );
  check(
    html.includes(encodeURIComponent("pickupAt") + "=") ||
      html.includes("pickupAt="),
    "result links preserve trip dates",
  );
  const detail = await (
    await fetch(base + "/cars/" + car.slug + "?" + query)
  ).text();
  check(
    detail.includes('value="' + pickup + '"') &&
      detail.includes('value="' + end + '"'),
    "dates carry from results into reservation",
  );
  check(
    detail.includes("Your details") && detail.includes("Review"),
    "booking exposes three-step progress",
  );
  const invalid = await (await fetch(base + "/cars?pickupAt=" + pickup)).text();
  check(
    invalid.includes("Select both pickup and return dates"),
    "partial date search gives a clear error",
  );
  const payload = {
    vehicleId: car.id,
    pickupAt: pickup,
    returnAt: end,
    pickupLocation: "Marrakech Menara Airport (RAK)",
    returnLocation: "Marrakech city",
    flightNumber: "fr 1234",
    arrivalTime: "14:30",
    customer: {
      fullName: "Arrival UI Test",
      phone: "+212600000004",
      email: "arrival@example.invalid",
      identityNumber: "TEST-ARRIVAL",
      drivingLicense: "TEST-ARRIVAL",
    },
    notes: "Synthetic airport-arrival integration test.",
  };
  const bad = await request("/api/reservations", "POST", {
    ...payload,
    arrivalTime: "25:90",
  });
  check(bad.r.status === 400, "backend rejects invalid flight arrival time");
  const result = await request("/api/reservations", "POST", payload);
  check(result.r.status === 201, "airport booking request succeeds");
  const booking = await db.reservation.findUniqueOrThrow({
    where: { reference: result.data.reference },
  });
  check(
    booking.notes.includes("Flight: FR 1234") &&
      booking.notes.includes("14:30"),
    "flight information persists in MySQL reservation notes",
  );
  check(
    booking.pickupLocation === "Marrakech Menara Airport (RAK)" &&
      Number(booking.total) === 2850,
    "airport location and server price persist",
  );
  const login = await request("/api/auth/login", "POST", {
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
  });
  cookie = login.r.headers.get("set-cookie").split(";")[0];
  const cancelled = await request(
    "/api/admin/reservations/" + booking.id,
    "PATCH",
    {
      vehicleId: car.id,
      pickupAt: pickup,
      returnAt: end,
      pickupLocation: payload.pickupLocation,
      returnLocation: payload.returnLocation,
      status: "CANCELLED",
      internalNotes: "UI redesign test completed. History retained.",
    },
  );
  check(cancelled.r.ok, "test booking cancelled without deleting history");
  await request("/api/auth/logout", "POST", {});
  console.log(`${count} redesign integration checks passed.`);
}
main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
