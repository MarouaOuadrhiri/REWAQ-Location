import { InspectionForm, Ledger, RequestReview } from "@/components/OperationsForms";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ReservationForm } from "@/components/AdminForms";
import { money } from "@/lib/pricing";
import { expirePending } from "@/lib/reservations";
export default async function Reservation({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await expirePending();
  const item = await db.reservation.findUnique({
    where: { id: (await params).id },
    include: {
      customer: true,
      history: { orderBy: { createdAt: "desc" } },
      payments: true,
      requests: {orderBy:{createdAt:"desc"}},
      inspections: {orderBy:{createdAt:"asc"}},
    },
  });
  if (!item) notFound();
  const cars = await db.vehicle.findMany({ orderBy: { brand: "asc" } });
  return (
    <>
      <div className="eyebrow">Reservation management</div>
      <h1>{item.reference}</h1>
      <p className="muted">
        Payments received:{" "}
        {money(item.payments.reduce((s, p) => s + Number(p.amount), 0))} ·{" "}
        {item.payments.length} entries
      </p>
      <Ledger reservation={JSON.parse(JSON.stringify(item))}/>
      <section className="ops-section"><h2>Customer requests</h2>{item.requests.length ? item.requests.map(r=><RequestReview key={r.id} request={JSON.parse(JSON.stringify(r))}/>):<p className="muted">No change or cancellation requests.</p>}</section>
      <ReservationForm
        reservation={JSON.parse(JSON.stringify(item))}
        cars={JSON.parse(JSON.stringify(cars))}
      />
      <section className="ops-section"><h2>Vehicle handover reports</h2>{item.inspections.map(report=><article className="panel" key={report.id}><h3>{report.kind} · {report.adminName}</h3><p>{report.createdAt.toISOString()} · {report.odometer.toLocaleString()} km · Fuel {report.fuelPercent}%</p><p>{report.conditionNotes}</p><div className="gallery">{(report.photos as string[]).map((_,i)=><a key={i} href={`/api/admin/inspection-photo/${report.id}?index=${i}`} target="_blank" rel="noreferrer"><img alt={`${report.kind} condition photo ${i+1}`} src={`/api/admin/inspection-photo/${report.id}?index=${i}`}/></a>)}</div></article>)}{item.status==="CONFIRMED"&&!item.inspections.some(v=>v.kind==="DEPARTURE")&&<InspectionForm reservationId={item.id} kind="DEPARTURE"/>}{item.status==="ACTIVE"&&!item.inspections.some(v=>v.kind==="RETURN")&&<InspectionForm reservationId={item.id} kind="RETURN"/>}</section>
    </>
  );
}
