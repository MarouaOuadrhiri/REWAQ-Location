import Link from "next/link";
import { db } from "@/lib/db";
import { expirePending } from "@/lib/reservations";
import { money } from "@/lib/pricing";
export default async function Dashboard() {
  await expirePending();
  const [cars, bookings, payments, blocks] = await Promise.all([
    db.vehicle.findMany({ where: { archived: false } }),
    db.reservation.findMany({
      include: { vehicle: true, customer: true },
      orderBy: { createdAt: "desc" },
    }),
    db.payment.findMany({
      where: { kind: { in: ["RENTAL", "RENTAL_REFUND"] } },
    }),
    db.vehicleMaintenance.findMany({ where: { cancelledAt: null } }),
  ]);
  const now = new Date();
  const active = new Set(
    bookings.filter((v) => v.status === "ACTIVE").map((v) => v.vehicleId),
  );
  const reserved = new Set(
    bookings
      .filter(
        (v) =>
          v.status === "CONFIRMED" && v.pickupAt <= now && v.returnAt > now,
      )
      .map((v) => v.vehicleId),
  );
  const maintenance = new Set(
    blocks
      .filter(
        (v) => v.kind === "MAINTENANCE" && v.startAt <= now && v.endAt > now,
      )
      .map((v) => v.vehicleId),
  );
  const unavailable = new Set([
    ...active,
    ...reserved,
    ...blocks
      .filter((v) => v.startAt <= now && v.endAt > now)
      .map((v) => v.vehicleId),
    ...bookings
      .filter(
        (v) =>
          v.status === "PENDING" &&
          v.expiresAt &&
          v.expiresAt > now &&
          v.pickupAt <= now &&
          v.returnAt > now,
      )
      .map((v) => v.vehicleId),
  ]);
  const stats = [
    ["Total vehicles", cars.length],
    ["Available now", cars.filter((v) => !unavailable.has(v.id)).length],
    ["Reserved now", reserved.size],
    ["Currently rented", active.size],
    ["Under maintenance", maintenance.size],
    ["Total reservations", bookings.length],
    ["Pending requests", bookings.filter((v) => v.status === "PENDING").length],
    [
      "Confirmed reservations",
      bookings.filter((v) => v.status === "CONFIRMED").length,
    ],
    [
      "Completed rentals",
      bookings.filter((v) => v.status === "COMPLETED").length,
    ],
    [
      "Revenue received",
      money(
        payments.reduce(
          (s, p) =>
            s + (p.kind === "RENTAL_REFUND" ? -1 : 1) * Number(p.amount),
          0,
        ),
      ),
    ],
  ];
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 5 + i, 1),
    );
    const key = d.toISOString().slice(0, 7);
    return {
      label: d.toLocaleDateString("en", { month: "short", timeZone: "UTC" }),
      revenue: payments
        .filter((v) => v.receivedAt.toISOString().startsWith(key))
        .reduce((s, v) => s + Number(v.amount), 0),
      bookings: bookings.filter((v) =>
        v.createdAt.toISOString().startsWith(key),
      ).length,
    };
  });
  const most = cars
    .map((v) => ({
      ...v,
      count: bookings.filter(
        (b) =>
          b.vehicleId === v.id &&
          ["CONFIRMED", "ACTIVE", "COMPLETED"].includes(b.status),
      ).length,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
  const monthStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
  );
  const elapsed = Math.max(1, Math.ceil((+now - +monthStart) / 86400000));
  const usedDays = cars.reduce(
    (sum, v) =>
      sum +
      bookings
        .filter(
          (b) =>
            b.vehicleId === v.id && ["ACTIVE", "COMPLETED"].includes(b.status),
        )
        .reduce(
          (n, b) =>
            n +
            Math.max(
              0,
              (Math.min(+b.returnAt, +now) -
                Math.max(+b.pickupAt, +monthStart)) /
                86400000,
            ),
          0,
        ),
    0,
  );
  return (
    <>
      <div className="section-heading">
        <div>
          <div className="eyebrow">The bigger picture</div>
          <h1>Welcome to your workspace.</h1>
          <p className="muted" style={{ marginBottom: 0 }}>
            Your fleet, your customers, and every journey in between.
          </p>
        </div>
        <Link className="button" href="/admin/cars/new">
          + Add vehicle
        </Link>
      </div>
      <div className="stats">
        {stats.map(([title, value]) => (
          <div className="stat" key={title}>
            <small>{title}</small>
            <div className="value">{value}</div>
          </div>
        ))}
      </div>
      <div className="charts">
        <div className="chart">
          <h3>Monthly revenue</h3>
          <small>Received payments · DH</small>
          <div className="bars">
            {months.map((v) => (
              <div className="bar-col" key={v.label}>
                <small>{money(v.revenue)}</small>
                <i
                  style={{
                    height: Math.max(
                      2,
                      (v.revenue /
                        Math.max(1, ...months.map((v) => v.revenue))) *
                        115,
                    ),
                  }}
                />
                {v.label}
              </div>
            ))}
          </div>
        </div>
        <div className="chart">
          <h3>Reservations per month</h3>
          <small>All created reservations</small>
          <div className="bars">
            {months.map((v) => (
              <div className="bar-col" key={v.label}>
                <small>{v.bookings}</small>
                <i
                  style={{
                    height: Math.max(
                      2,
                      (v.bookings /
                        Math.max(1, ...months.map((v) => v.bookings))) *
                        115,
                    ),
                    background: "#1D5148",
                  }}
                />
                {v.label}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="charts">
        <div className="panel">
          <h3>Most reserved vehicles</h3>
          {most.map((v) => (
            <p
              key={v.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                borderBottom: "1px solid #E4DCD0",
                paddingBottom: 10,
              }}
            >
              <span>
                {v.brand} {v.model}
              </span>
              <span>{v.count} bookings</span>
            </p>
          ))}
        </div>
        <div className="panel">
          <h3>Fleet utilization</h3>
          <div
            style={{
              fontSize: 58,
              fontFamily: "Georgia",
              color: "#C86A4A",
              margin: "20px 0",
            }}
          >
            {cars.length
              ? Math.min(
                  100,
                  Math.round((usedDays / (cars.length * elapsed)) * 100),
                )
              : 0}
            %
          </div>
          <small>
            Active and completed rental days / elapsed fleet days this month.
          </small>
        </div>
      </div>
      <div className="section-heading">
        <h3>Latest reservations</h3>
        <Link href="/admin/reservations" className="text-link">
          View all ↗
        </Link>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Reference</th>
              <th>Customer</th>
              <th>Vehicle</th>
              <th>Total</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {bookings.slice(0, 6).map((v) => (
              <tr key={v.id}>
                <td>
                  <Link href={"/admin/reservations/" + v.id}>
                    {v.reference} ↗
                  </Link>
                </td>
                <td>{v.customer.fullName}</td>
                <td>
                  {v.vehicle.brand} {v.vehicle.model}
                </td>
                <td>{money(v.total)}</td>
                <td>
                  <span className={"badge " + v.status.toLowerCase()}>
                    {v.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!bookings.length && (
          <p className="empty">Your first reservation will appear here.</p>
        )}
      </div>
    </>
  );
}
