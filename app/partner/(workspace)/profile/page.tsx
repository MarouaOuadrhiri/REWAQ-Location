import { requirePartner } from "@/lib/partners";
import { PartnerProfileForm } from "@/components/PartnerForms";
export default async function Profile() {
  const agency = await requirePartner();
  return (
    <>
      <div className="partner-page-heading">
        <div>
          <span className="partner-kicker">VOTRE MAISON, VOTRE IDENTITÉ</span>
          <h1>
            L’agence
            <br />
            <em>derrière les clés.</em>
          </h1>
          <p>
            Gardez vos informations de contact à jour pour faciliter la
            coordination.
          </p>
        </div>
      </div>
      <PartnerProfileForm
        agency={{
          name: agency.name,
          email: agency.email,
          phone: agency.phone,
          city: agency.city,
          address: agency.address,
        }}
      />
    </>
  );
}
