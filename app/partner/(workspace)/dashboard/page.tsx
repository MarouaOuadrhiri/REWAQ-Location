import Link from "next/link";
import {
  ArrowUpRight,
  Plus,
  CarFront,
  CalendarDays,
  Wallet,
  TrendingUp,
} from "lucide-react";
import { requirePartner } from "@/lib/partners";
import { db } from "@/lib/db";
import { settings } from "@/lib/reservations";
import { money } from "@/lib/pricing";
export default async function Dashboard() {
  const agency = await requirePartner(),
    config = await settings(),
    [cars, bookings] = await Promise.all([
      db.vehicle.findMany({
        where: { agencyId: agency.id },
        include: { images: { orderBy: { position: "asc" }, take: 1 } },
        orderBy: { createdAt: "desc" },
      }),
      db.reservation.findMany({
        where: { agencyId: agency.id },
        include: { vehicle: { select: { brand: true, model: true } } },
        orderBy: { createdAt: "desc" },
      }),
    ]);
  const rate = Number(agency.commissionOverride ?? config.partnerMarkup),
    net = bookings
      .filter((b) => b.status === "COMPLETED")
      .reduce((s, b) => s + Number(b.supplierSubtotal ?? 0), 0);
  return (
    <>
      <div className="partner-page-heading">
        <div>
          <span className="partner-kicker">
            BONJOUR, {agency.name.toUpperCase()}
          </span>
          <h1>
            Votre collection.
            <br />
            <em>De nouvelles possibilités.</em>
          </h1>
          <p>
            Vos voitures, vos prochains départs et l’essentiel de votre
            activité.
          </p>
        </div>
        {agency.status === "ACTIVE" && (
          <Link className="button partner-primary" href="/partner/cars/new">
            Ajouter une voiture <Plus size={17} />
          </Link>
        )}
      </div>
      <section className="partner-stats">
        {[
          [
            CarFront,
            "Voitures en ligne",
            cars.filter((c) => !c.archived && c.listingStatus === "APPROVED")
              .length,
          ],
          [
            CalendarDays,
            "Réservations à venir",
            bookings.filter((b) => ["PENDING", "CONFIRMED"].includes(b.status))
              .length,
          ],
          [Wallet, "Net des locations terminées", money(net)],
          [TrendingUp, "Marge REWAQ appliquée", rate + "%"],
        ].map(([Icon, label, value]: any) => (
          <article key={label}>
            <Icon size={20} />
            <span>{label}</span>
            <strong>{value}</strong>
          </article>
        ))}
      </section>
      <div className="partner-dashboard-grid">
        <section>
          <div className="partner-section-heading">
            <div>
              <span className="partner-kicker">VOTRE SÉLECTION</span>
              <h2>Les voitures qui vous représentent.</h2>
            </div>
            <Link href="/partner/cars">
              Tout voir <ArrowUpRight size={15} />
            </Link>
          </div>
          <div className="partner-mini-fleet">
            {cars.slice(0, 2).map((c) => (
              <Link key={c.id} href={"/partner/cars/" + c.id}>
                <div>
                  {c.images[0] ? (
                    <img src={c.images[0].url} alt={c.brand + " " + c.model} />
                  ) : (
                    <CarFront size={55} />
                  )}
                  <span>
                    {c.archived
                      ? "ARCHIVÉE"
                      : c.listingStatus === "APPROVED"
                        ? "EN LIGNE"
                        : c.listingStatus === "REJECTED"
                          ? "À REVOIR"
                          : "EN VALIDATION"}
                  </span>
                </div>
                <small>{c.brand}</small>
                <h3>{c.model}</h3>
                <p>
                  Votre net : <strong>{money(c.dailyPrice)}</strong> / jour
                </p>
              </Link>
            ))}
            {!cars.length && (
              <div className="partner-empty">
                <CarFront size={42} />
                <h3>Votre collection commence ici.</h3>
                <p>
                  {agency.status === "ACTIVE"
                    ? "Ajoutez votre première voiture, ses tarifs et ses photos."
                    : "Votre compte doit être activé avant l’ajout de voitures."}
                </p>
                {agency.status === "ACTIVE" && (
                  <Link className="button" href="/partner/cars/new">
                    Ajouter ma première voiture ↗
                  </Link>
                )}
              </div>
            )}
          </div>
        </section>
        <aside className="partner-margin-card">
          <span className="partner-kicker">UN PARTENARIAT CLAIR</span>
          <h2>
            Votre prix.
            <br />
            Notre visibilité.
          </h2>
          <p>
            Vous fixez vos tarifs nets. REWAQ ajoute {rate}% au tarif de
            location présenté au client.
          </p>
          <div>
            <span>Votre tarif</span>
            <strong>{money(500)}</strong>
          </div>
          <div>
            <span>Marge REWAQ · {rate}%</span>
            <strong>+{money((500 * rate) / 100)}</strong>
          </div>
          <div className="partner-margin-total">
            <span>Prix client / jour</span>
            <strong>{money(500 + (500 * rate) / 100)}</strong>
          </div>
          <small>
            Exemple indicatif. La remise de durée est calculée au devis. Les
            frais de remise et le dépôt ne sont pas majorés.
          </small>
        </aside>
      </div>
      <section className="partner-recent">
        <div className="partner-section-heading">
          <div>
            <span className="partner-kicker">LES PROCHAINS CHAPITRES</span>
            <h2>Vos dernières réservations.</h2>
          </div>
          <Link href="/partner/reservations">Toutes les réservations ↗</Link>
        </div>
        {bookings.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Référence</th>
                  <th>Voiture</th>
                  <th>Dates</th>
                  <th>Statut</th>
                  <th>Votre net</th>
                </tr>
              </thead>
              <tbody>
                {bookings.slice(0, 5).map((b) => (
                  <tr key={b.id}>
                    <td>{b.reference}</td>
                    <td>
                      {b.vehicle.brand} {b.vehicle.model}
                    </td>
                    <td>
                      {b.pickupAt.toISOString().slice(0, 10)} →{" "}
                      {b.returnAt.toISOString().slice(0, 10)}
                    </td>
                    <td>
                      <span className={"badge " + b.status.toLowerCase()}>
                        {b.status}
                      </span>
                    </td>
                    <td>{money(b.supplierSubtotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="partner-empty-row">
            Les réservations de votre collection apparaîtront ici.
          </div>
        )}
        <p className="partner-financial-note">
          Les montants nets sont des valeurs de réservation, pas une
          confirmation de virement ou d’encaissement.
        </p>
      </section>
    </>
  );
}
