import Link from "next/link";
import { db } from "@/lib/db";
import { CarCard } from "@/components/CarCard";
export default async function Cars({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; archived?: string }>;
}) {
  const q = await searchParams;
  const cars = await db.vehicle.findMany({
    where: {
      archived: q.archived === "true",
      OR: q.q
        ? [
            { brand: { contains: q.q } },
            { model: { contains: q.q } },
            { registration: { contains: q.q } },
          ]
        : undefined,
    },
    include: { images: { orderBy: { position: "asc" } } },
    orderBy: { createdAt: "desc" },
  });
  return (
    <>
      <div className="eyebrow">Your collection</div>
      <h1>Fleet management</h1>
      <p className="muted">A considered collection, managed with precision.</p>
      <div className="admin-toolbar">
        <form style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <input
            name="q"
            aria-label="Search vehicles"
            placeholder="Search brand, model or registration"
            defaultValue={q.q}
          />
          <select
            name="archived"
            style={{ width: 150 }}
            defaultValue={q.archived}
          >
            <option value="false">Active fleet</option>
            <option value="true">Archived fleet</option>
          </select>
          <button className="button light">Search</button>
        </form>
        <Link className="button" href="/admin/cars/new">
          + Add vehicle
        </Link>
      </div>
      <div className="grid">
        {cars.map((v) => (
          <CarCard car={v} admin key={v.id} />
        ))}
      </div>
      {!cars.length && <p className="empty">No vehicles found.</p>}
    </>
  );
}
