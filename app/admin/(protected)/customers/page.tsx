import Link from "next/link";
import { db } from "@/lib/db";
export default async function Customers() {
  const items = await db.customer.findMany({
    include: { _count: { select: { reservations: true } } },
    orderBy: { createdAt: "desc" },
  });
  return (
    <>
      <div className="eyebrow">People behind the journeys</div>
      <h1>Customers</h1>
      <p className="muted">Contact details and rental history, in one place.</p>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              {["Name", "Email", "Phone", "Reservations", ""].map((v) => (
                <th key={v}>{v}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((v) => (
              <tr key={v.id}>
                <td>{v.fullName}</td>
                <td>{v.email}</td>
                <td>{v.phone}</td>
                <td>{v._count.reservations}</td>
                <td>
                  <Link href={"/admin/customers/" + v.id} className="text-link">
                    View ↗
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!items.length && (
          <p className="empty">
            Customers appear here after the first reservation.
          </p>
        )}
      </div>
    </>
  );
}
