import { ListingReview } from "@/components/PartnerForms";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { VehicleForm } from "@/components/AdminForms";
export default async function EditVehicle({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const vehicle = await db.vehicle.findUnique({
    where: { id: (await params).id },
    include: {
      agency: { select: { name: true } },
      images: { orderBy: { position: "asc" } },
    },
  });
  if (!vehicle) notFound();
  return (
    <>
      <div className="eyebrow">Fleet management</div>
      <h1>
        {vehicle.brand} {vehicle.model}
      </h1>
      <p className="muted">
        Archive or restore without removing historical reservations.
      </p>
      {vehicle.agencyId && (
        <section className="panel" style={{ marginBottom: 25 }}>
          <h3>Partner agency: {vehicle.agency?.name}</h3>
          <p>
            These prices are the agency’s net rates. Customer prices include the
            configured REWAQ markup.
          </p>
          <ListingReview vehicle={vehicle} />
        </section>
      )}
      <VehicleForm vehicle={JSON.parse(JSON.stringify(vehicle))} />
    </>
  );
}
