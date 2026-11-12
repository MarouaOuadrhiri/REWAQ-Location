import Link from "next/link";
import { db } from "@/lib/db";
import { expirePending } from "@/lib/reservations";
import { BlockForm, CancelBlock } from "@/components/AdminForms";
export default async function Calendar({
  searchParams,
}: {
  searchParams: Promise<{ vehicleId?: string; month?: string }>;
}) {
  await expirePending();
  const q = await searchParams;
  const today = new Date();
  const input = /^\d{4}-\d{2}$/.test(q.month || "")
    ? q.month!
    : today.toISOString().slice(0, 7);
  const start = new Date(input + "-01T00:00:00Z");
  const safe = Number.isFinite(+start)
    ? start
    : new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1));
  const end = new Date(
    Date.UTC(safe.getUTCFullYear(), safe.getUTCMonth() + 1, 1),
  );
  const cars = await db.vehicle.findMany({ orderBy: { brand: "asc" } });
  const reservations = await db.reservation.findMany({
    where: {
      vehicleId: q.vehicleId || undefined,
      pickupAt: { lt: end },
      returnAt: { gt: safe },
      status: { in: ["PENDING", "CONFIRMED", "ACTIVE"] },
    },
    include: { vehicle: true },
  });
  const blocks = await db.vehicleMaintenance.findMany({
    where: {
      vehicleId: q.vehicleId || undefined,
      cancelledAt: null,
      startAt: { lt: end },
      endAt: { gt: safe },
    },
    include: { vehicle: true },
  });
  const days = Math.round((+end - +safe) / 86400000);
  return (
    <>
      <div className="eyebrow">Room for the next journey</div>
      <h1>Fleet planning</h1>
      <p className="muted">
        Blank dates are available unless another reservation or block applies.
        End dates are exclusive.
      </p>
      <form className="admin-toolbar">
        <select
          name="vehicleId"
          defaultValue={q.vehicleId}
          style={{ maxWidth: 300 }}
        >
          <option value="">All vehicles</option>
          {cars.map((v) => (
            <option key={v.id} value={v.id}>
              {v.brand} {v.model}
              {v.archived ? " (archived)" : ""}
            </option>
          ))}
        </select>
        <input
          type="month"
          name="month"
          defaultValue={input}
          style={{ maxWidth: 200 }}
        />
        <button className="button light">Show calendar</button>
      </form>
      <div style={{ display: "flex", gap: 15, flexWrap: "wrap" }}>
        <span className="badge pending">Pending</span>
        <span className="badge confirmed">Confirmed</span>
        <span className="badge active">Active</span>
        <span className="badge expired">Maintenance / Block</span>
      </div>
      <section className="fleet-timeline-wrap">
        <h2>Fleet at a glance</h2>
        <p className="muted">
          One row per vehicle. Colored cells link to the reservation;
          maintenance cells show the blocking reason. Dates shown are
          end-exclusive.
        </p>
        <div className="table-wrap fleet-timeline">
          <table>
            <thead>
              <tr>
                <th>Vehicle</th>
                {Array.from({ length: days }, (_, i) => (
                  <th key={i}>{i + 1}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cars
                .filter((c) => !q.vehicleId || c.id === q.vehicleId)
                .map((car) => (
                  <tr key={car.id}>
                    <th>
                      {car.brand} {car.model}
                      <small>
                        {car.registration}
                        {car.archived ? " · Archived" : ""}
                      </small>
                    </th>
                    {Array.from({ length: days }, (_, i) => {
                      const day = new Date(+safe + i * 86400000),
                        next = new Date(+day + 86400000),
                        booking = reservations.find(
                          (r) =>
                            r.vehicleId === car.id &&
                            r.pickupAt < next &&
                            r.returnAt > day,
                        ),
                        block = blocks.find(
                          (b) =>
                            b.vehicleId === car.id &&
                            b.startAt < next &&
                            b.endAt > day,
                        );
                      return (
                        <td key={i}>
                          {booking ? (
                            <Link
                              title={booking.reference + " · " + booking.status}
                              aria-label={
                                car.model +
                                " day " +
                                (i + 1) +
                                " " +
                                booking.status
                              }
                              className={
                                "timeline-cell " + booking.status.toLowerCase()
                              }
                              href={"/admin/reservations/" + booking.id}
                            >
                              {booking.status === "PENDING"
                                ? "P"
                                : booking.status === "ACTIVE"
                                  ? "A"
                                  : "C"}
                            </Link>
                          ) : block ? (
                            <span
                              className="timeline-cell block"
                              title={block.reason}
                            >
                              M
                            </span>
                          ) : (
                            <span
                              className="timeline-cell free"
                              aria-label="No booking or block"
                            >
                              ·
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>
      <div className="calendar-grid">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((v) => (
          <div
            className="calendar-day"
            style={{ minHeight: "auto", background: "#f0eeea" }}
            key={v}
          >
            {v}
          </div>
        ))}
        {Array.from({ length: safe.getUTCDay() }, (_, i) => (
          <div className="calendar-day" key={"blank" + i} />
        ))}
        {Array.from({ length: days }, (_, i) => {
          const day = new Date(+safe + i * 86400000),
            next = new Date(+day + 86400000);
          return (
            <div className="calendar-day" key={i}>
              <small>{i + 1}</small>
              {reservations
                .filter((v) => v.pickupAt < next && v.returnAt > day)
                .map((v) => (
                  <Link href={"/admin/reservations/" + v.id} key={v.id}>
                    <div
                      className={"calendar-event " + v.status.toLowerCase()}
                      title={`${v.vehicle.brand} ${v.vehicle.model} · ${v.reference}`}
                    >
                      {v.vehicle.model} · {v.status}
                    </div>
                  </Link>
                ))}
              {blocks
                .filter((v) => v.startAt < next && v.endAt > day)
                .map((v) => (
                  <div
                    key={v.id}
                    className="calendar-event block"
                    title={v.reason}
                  >
                    {v.vehicle.model} · {v.kind}
                  </div>
                ))}
            </div>
          );
        })}
      </div>
      <BlockForm
        cars={JSON.parse(JSON.stringify(cars.filter((v) => !v.archived)))}
      />
      {blocks.length > 0 && (
        <div className="table-wrap" style={{ marginTop: 25 }}>
          <table>
            <thead>
              <tr>
                <th>Vehicle</th>
                <th>Period</th>
                <th>Reason</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {blocks.map((v) => (
                <tr key={v.id}>
                  <td>
                    {v.vehicle.brand} {v.vehicle.model}
                  </td>
                  <td>
                    {v.startAt.toISOString().slice(0, 10)} →{" "}
                    {v.endAt.toISOString().slice(0, 10)}
                  </td>
                  <td>{v.reason}</td>
                  <td>
                    <CancelBlock id={v.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
