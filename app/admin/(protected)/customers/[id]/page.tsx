import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { CustomerForm } from "@/components/AdminForms";
export default async function Customer({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const item = await db.customer.findUnique({
    where: { id: (await params).id },
    include: { reservations: true },
  });
  if (!item) notFound();
  return (
    <>
      <div className="eyebrow">Customer profile</div>
      <h1>{item.fullName}</h1>
      <CustomerForm customer={JSON.parse(JSON.stringify(item))} />
      <div className="panel" style={{ marginTop: 25 }}>
        <h3>Rental history</h3>
        {item.reservations.map((v) => (
          <p key={v.id}>
            <Link className="text-link" href={"/admin/reservations/" + v.id}>
              {v.reference} · {v.status} ↗
            </Link>
          </p>
        ))}
      </div>
    </>
  );
}
