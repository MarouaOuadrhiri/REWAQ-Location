import { redirect } from "next/navigation";
import { requirePartner } from "@/lib/partners";
import { VehicleForm } from "@/components/AdminForms";
export default async function NewCar() {
  const agency = await requirePartner();
  if (agency.status !== "ACTIVE") redirect("/partner/dashboard");
  return (
    <>
      <div className="partner-page-heading">
        <div>
          <span className="partner-kicker">ÉTOFFEZ VOTRE COLLECTION</span>
          <h1>
            Une nouvelle voiture.
            <br />
            <em>Un nouveau départ.</em>
          </h1>
        </div>
      </div>
      <VehicleForm partnerMode />
    </>
  );
}
