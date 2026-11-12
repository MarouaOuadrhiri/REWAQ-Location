import Link from "next/link";
import { ReservationStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { expirePending } from "@/lib/reservations";
import { money } from "@/lib/pricing";
export default async function Reservations({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  await expirePending();
  const q = await searchParams;
  const status = Object.values(ReservationStatus).includes(
    q.status as ReservationStatus,
  )
    ? (q.status as ReservationStatus)
    : undefined;
  const items = await db.reservation.findMany({
    where: {
      status,
      OR: q.q
        ? [
            { reference: { contains: q.q } },
            { customer: { fullName: { contains: q.q } } },
          ]
        : undefined,
    },
    include: { customer: true, vehicle: true },
    orderBy: { createdAt: "desc" },
  });
  return (
    <>
      <div className="eyebrow">Every journey, in view</div>
      <h1>Reservations</h1>
      <p className="muted">
        Review requests, coordinate collection, and preserve every booking.
      </p>
      <form className="admin-toolbar">
        <input
          name="q"
          placeholder="Search reference or customer"
          aria-label="Search bookings"
          defaultValue={q.q}
        />
        <select name="status" defaultValue={q.status} style={{ maxWidth: 200 }}>
          <option value="">All statuses</option>
          {Object.values(ReservationStatus).map((v) => (
            <option key={v}>{v}</option>
          ))}
        </select>
        <button className="button light">Filter</button>
        <Link href="/cars" className="button">
          + Manual booking
        </Link>
      </form>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              {[
                "Reference / Created",
                "Customer / Phone",
                "Vehicle",
                "Rental dates",
                "Days",
                "Total",
                "Status",
                "",
              ].map((v) => (
                <th key={v}>{v}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((v) => (
              <tr key={v.id}>
                <td>
                  <strong>{v.reference}</strong>
                  <br />
                  <small>{v.createdAt.toISOString().slice(0, 10)}</small>
                </td>
                <td>
                  {v.customer.fullName}
                  <br />
                  <small>{v.customer.phone}</small>
                </td>
                <td>
                  {v.vehicle.brand} {v.vehicle.model}
                </td>
                <td>
                  {v.pickupAt.toISOString().slice(0, 10)}
                  <br />
                  {v.returnAt.toISOString().slice(0, 10)}
                </td>
                <td>{v.days}</td>
                <td>{money(v.total)}</td>
                <td>
                  <span className={"badge " + v.status.toLowerCase()}>
                    {v.status}
                  </span>
                </td>
                <td>
                  <Link
                    className="text-link"
                    href={"/admin/reservations/" + v.id}
                  >
                    Manage ↗
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!items.length && <p className="empty">No matching reservations.</p>}
      </div>
    </>
  );
}
