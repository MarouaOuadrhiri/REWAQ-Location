import Link from "next/link";
import { Building2, ArrowUpRight } from "lucide-react";
import { db } from "@/lib/db";
import { settings } from "@/lib/reservations";
import { AgencyAdminForm, ListingReview } from "@/components/PartnerForms";
import { money } from "@/lib/pricing";
import { markedRates } from "@/lib/marketplace";
export default async function Agencies() {
  const [agencies, config, vehicles, commissionSummary] = await Promise.all([
    db.agency.findMany({
      include: { _count: { select: { vehicles: true, reservations: true } } },
      orderBy: { createdAt: "desc" },
    }),
    settings(),
    db.vehicle.findMany({
      where: {
        agencyId: { not: null },
        archived: false,
        listingStatus: { in: ["PENDING", "REJECTED"] },
      },
      include: {
        agency: {
          select: {
            id: true,
            name: true,
            status: true,
            commissionOverride: true,
          },
        },
        images: { orderBy: { position: "asc" }, take: 1 },
      },
      orderBy: { createdAt: "asc" },
    }),
    db.reservation.aggregate({
      where: { agencyId: { not: null }, status: "COMPLETED" },
      _sum: { platformMarkup: true },
    }),
  ]);
  return (
    <>
      <div className="eyebrow">REWAQ partner network</div>
      <h1>Your next chapter. Together.</h1>
      <p className="muted">
        Approve agencies, review their cars and manage your markup. Net agency
        rates stay separate from customer prices.
      </p>
      <div className="ops-metrics">
        <div>
          <small>Markup on completed partner rentals</small>
          <strong>{money(commissionSummary._sum.platformMarkup ?? 0)}</strong>
        </div>
        <div>
          <small>Active partners</small>
          <strong>
            {agencies.filter((a) => a.status === "ACTIVE").length}
          </strong>
        </div>
        <div>
          <small>Accounts to review</small>
          <strong>
            {agencies.filter((a) => a.status === "PENDING").length}
          </strong>
        </div>
        <div>
          <small>Cars awaiting review</small>
          <strong>
            {vehicles.filter((v) => v.listingStatus === "PENDING").length}
          </strong>
        </div>
        <div>
          <small>Default markup</small>
          <strong>{Number(config.partnerMarkup)}%</strong>
        </div>
      </div>
      <div className="partner-admin-heading">
        <h2>Agency accounts</h2>
        <Link href="/admin/settings">Global markup settings ↗</Link>
      </div>
      <div className="agency-admin-grid">
        {agencies.map((a) => (
          <article key={a.id} className="panel agency-admin-card">
            <div className="agency-admin-identity">
              <span>
                <Building2 size={24} />
              </span>
              <div>
                <h3>{a.name}</h3>
                <small>
                  {a.city} · {a.email}
                </small>
              </div>
            </div>
            <p>{a.phone}</p>
            <div className="agency-admin-counts">
              <span>{a._count.vehicles} vehicles</span>
              <span>{a._count.reservations} reservations</span>
              <strong>
                +{Number(a.commissionOverride ?? config.partnerMarkup)}%
              </strong>
            </div>
            <AgencyAdminForm
              agency={{
                id: a.id,
                status: a.status,
                commissionOverride: a.commissionOverride?.toString() ?? null,
              }}
              defaultRate={Number(config.partnerMarkup)}
            />
          </article>
        ))}
      </div>
      {!agencies.length && (
        <p className="empty">
          Partner applications will appear here.{" "}
          <Link href="/partner/register">View agency registration ↗</Link>
        </p>
      )}
      <section className="ops-section">
        <div className="partner-admin-heading">
          <h2>Vehicle publication review</h2>
          <span>Only approved cars from active agencies are public.</span>
        </div>
        <div className="agency-review-grid">
          {vehicles.map((v) => (
            <article key={v.id} className="panel agency-review-card">
              {v.images[0] && (
                <img src={v.images[0].url} alt={v.brand + " " + v.model} />
              )}
              <small>
                {v.agency?.name} · {v.agency?.status}
              </small>
              <h3>
                {v.brand} {v.model}
              </h3>
              <p>
                Net: {money(v.dailyPrice)} · Customer:{" "}
                {money(markedRates(v, config).dailyPrice)} / day
              </p>
              <Link href={"/admin/cars/" + v.id} className="text-link">
                Inspect full listing <ArrowUpRight size={13} />
              </Link>
              <ListingReview vehicle={v} />
            </article>
          ))}
        </div>
        {!vehicles.length && (
          <p className="muted">No cars are waiting for publication review.</p>
        )}
      </section>
    </>
  );
}
