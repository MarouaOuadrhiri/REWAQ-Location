import { requirePartner } from "@/lib/partners";
import { db } from "@/lib/db";
import { money } from "@/lib/pricing";
export default async function Reservations() {
  const agency = await requirePartner(),
    rows = await db.reservation.findMany({
      where: { agencyId: agency.id },
      include: {
        vehicle: { select: { brand: true, model: true, registration: true } },
        customer: { select: { fullName: true, phone: true } },
      },
      orderBy: { pickupAt: "desc" },
    });
  return (
    <>
      <div className="partner-page-heading">
        <div>
          <span className="partner-kicker">DES RENCONTRES, DES DÉPARTS</span>
          <h1>
            Chaque réservation.
            <br />
            <em>À sa place.</em>
          </h1>
          <p>
            Les demandes sont examinées et confirmées par REWAQ. Seuls les
            voyages liés à votre agence sont visibles ici.
          </p>
        </div>
      </div>
      <div className="partner-booking-list">
        {rows.map((b) => (
          <article key={b.id}>
            <div className="partner-booking-top">
              <strong>{b.reference}</strong>
              <span className={"badge " + b.status.toLowerCase()}>
                {b.status}
              </span>
            </div>
            <h2>
              {b.vehicle.brand} {b.vehicle.model}
            </h2>
            <p>
              {b.vehicle.registration} · {b.days} jours
            </p>
            <div className="partner-booking-grid">
              <div>
                <small>Client</small>
                <strong>{b.customer.fullName}</strong>
                <a href={"tel:" + b.customer.phone}>{b.customer.phone}</a>
              </div>
              <div>
                <small>Départ</small>
                <strong>{b.pickupAt.toISOString().slice(0, 10)}</strong>
                <span>{b.pickupLocation}</span>
              </div>
              <div>
                <small>Retour</small>
                <strong>{b.returnAt.toISOString().slice(0, 10)}</strong>
                <span>{b.returnLocation}</span>
              </div>
              <div>
                <small>Votre montant net</small>
                <strong>{money(b.supplierSubtotal)}</strong>
                <span>REWAQ : {money(b.platformMarkup)}</span>
              </div>
            </div>
            {(b.flightNumber || b.meetingPoint) && (
              <p className="partner-arrival-note">
                Vol : {b.flightNumber || "À préciser"} · Arrivée :{" "}
                {b.arrivalTime || "À préciser"} (Marrakech)
                {b.meetingPoint ? " · Rencontre : " + b.meetingPoint : ""}
              </p>
            )}
          </article>
        ))}
      </div>
      {!rows.length && (
        <div className="partner-empty">
          <h2>Les prochains départs se préparent.</h2>
          <p>Vos réservations apparaîtront ici une fois enregistrées.</p>
        </div>
      )}
      <p className="partner-financial-note">
        Montants issus du devis enregistré. Aucun virement n’est déclenché
        depuis cet écran.
      </p>
    </>
  );
}
