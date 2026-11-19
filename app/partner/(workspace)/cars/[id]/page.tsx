import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import { requirePartner } from "@/lib/partners";
import { db } from "@/lib/db";
import { VehicleForm } from "@/components/AdminForms";
export default async function Edit({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const agency = await requirePartner(),
    vehicle = await db.vehicle.findFirst({
      where: { id: (await params).id, agencyId: agency.id },
      include: { images: { orderBy: { position: "asc" } } },
    });
  if (agency.status !== "ACTIVE") redirect("/partner/dashboard");
  if (!vehicle) notFound();
  return (
    <>
      <div className="partner-page-heading">
        <div>
          <span className="partner-kicker">
            VOTRE FICHE VOITURE · {vehicle.listingStatus}
          </span>
          <h1>
            {vehicle.brand}
            <br />
            <em>{vehicle.model}</em>
          </h1>
        </div>
      </div>
      <VehicleForm partnerMode vehicle={JSON.parse(JSON.stringify(vehicle))} />
    </>
  );
}
