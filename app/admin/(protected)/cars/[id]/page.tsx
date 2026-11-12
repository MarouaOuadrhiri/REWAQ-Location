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
    include: { images: { orderBy: { position: "asc" } } },
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
      <VehicleForm vehicle={JSON.parse(JSON.stringify(vehicle))} />
    </>
  );
}
