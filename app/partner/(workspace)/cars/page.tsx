import Link from "next/link";
import { Plus, ArrowUpRight, CarFront } from "lucide-react";
import { requirePartner } from "@/lib/partners";
import { db } from "@/lib/db";
import { settings } from "@/lib/reservations";
import { markedRates } from "@/lib/marketplace";
import { money } from "@/lib/pricing";
export default async function Cars() {
  const agency = await requirePartner(),
    config = await settings(),
    cars = await db.vehicle.findMany({
      where: { agencyId: agency.id },
      include: { images: { orderBy: { position: "asc" }, take: 1 } },
      orderBy: { createdAt: "desc" },
    });
  return (
    <>
      <div className="partner-page-heading">
        <div>
          <span className="partner-kicker">
            LA COLLECTION {agency.name.toUpperCase()}
          </span>
          <h1>
            Vos voitures.
            <br />
            <em>Votre signature.</em>
          </h1>
          <p>
            Ajoutez vos photos, fixez vos tarifs nets et suivez la validation de
            vos fiches.
          </p>
        </div>
        {agency.status === "ACTIVE" && (
          <Link className="button partner-primary" href="/partner/cars/new">
            Ajouter une voiture <Plus size={17} />
          </Link>
        )}
      </div>
      <div className="partner-fleet-grid">
        {cars.map((c) => {
          const retail = markedRates({ ...c, agency }, config);
          return (
            <article className="partner-fleet-card" key={c.id}>
              <Link
                className="partner-fleet-photo"
                href={"/partner/cars/" + c.id}
              >
                {c.images[0] ? (
                  <img src={c.images[0].url} alt={c.brand + " " + c.model} />
                ) : (
                  <CarFront size={60} />
                )}
                <span
                  className={
                    "badge " +
                    (c.archived
                      ? "expired"
                      : c.listingStatus === "APPROVED"
                        ? "confirmed"
                        : "pending")
                  }
                >
                  {c.archived
                    ? "ARCHIVÉE"
                    : c.listingStatus === "APPROVED"
                      ? "EN LIGNE"
                      : c.listingStatus === "REJECTED"
                        ? "À REVOIR"
                        : "EN VALIDATION"}
                </span>
              </Link>
              <div>
                <small>
                  {c.brand} · {c.year}
                </small>
                <h2>{c.model}</h2>
                <p>
                  {c.registration} · {c.transmission} · {c.seats} places
                </p>
                <dl>
                  <div>
                    <dt>Votre net / jour</dt>
                    <dd>{money(c.dailyPrice)}</dd>
                  </div>
                  <div>
                    <dt>Prix client / jour</dt>
                    <dd>{money(retail.dailyPrice)}</dd>
                  </div>
                </dl>
                <Link
                  className="partner-edit-car"
                  href={"/partner/cars/" + c.id}
                >
                  Gérer cette voiture <ArrowUpRight size={17} />
                </Link>
              </div>
            </article>
          );
        })}
      </div>
      {!cars.length && (
        <div className="partner-empty">
          <CarFront size={45} />
          <h2>Une belle collection à construire.</h2>
          <p>
            {agency.status === "ACTIVE"
              ? "Ajoutez votre première voiture pour commencer."
              : "Notre équipe doit activer votre compte avant l’ajout."}
          </p>
        </div>
      )}
    </>
  );
}
