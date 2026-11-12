import { CustomerRequest } from "@/components/CustomerTools";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { hash } from "@/lib/auth";
import { money } from "@/lib/pricing";
import { Header, Footer } from "@/components/PublicShell";
import {
  ClipboardCheck,
  Plane,
  CalendarDays,
  ShieldCheck,
  KeyRound,
} from "lucide-react";
import Link from "next/link";
export const dynamic = "force-dynamic";
export default async function Confirmation({
  params,
  searchParams,
}: {
  params: Promise<{ reference: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const { reference } = await params;
  const { token } = await searchParams;
  if (!token) notFound();
  const item = await db.reservation.findFirst({
    where: { reference, accessTokenHash: hash(token) },
    include: { vehicle: true, requests:{orderBy:{createdAt:"desc"}}, payments:true },
  });
  if (!item) notFound();
  const status =
    item.status === "PENDING" && item.expiresAt && item.expiresAt < new Date()
      ? "EXPIRED"
      : item.status;
  return (
    <>
      <Header />
      <main id="main-content" className="container section confirmation-layout">
        <div className="confirmation-status">
          <ClipboardCheck />
          <div>
            <div className="eyebrow">Your private reservation</div>
            <h1>
              {status === "PENDING"
                ? "Request received. You’re one step closer."
                : status === "CONFIRMED"
                  ? "Your reservation is confirmed."
                  : "Your reservation, at a glance."}
            </h1>
          </div>
        </div>
        <div className="confirmation-summary">
          <div className="panel">
            <span className={"badge " + status.toLowerCase()}>{status}</span>
            <h3 style={{ marginTop: 20 }}>{item.reference}</h3>
            <p className="vehicle-location">
              <KeyRound size={16} />
              {item.vehicle.brand} {item.vehicle.model}
            </p>
            <p className="vehicle-location">
              <CalendarDays size={16} />
              {item.pickupAt.toISOString().slice(0, 10)} →{" "}
              {item.returnAt.toISOString().slice(0, 10)} · {item.days} days
            </p>
            <p className="vehicle-location">
              <Plane size={16} />
              {item.pickupLocation} → {item.returnLocation}
            </p>
            {item.meetingPoint&&<p className="success">Meeting point: {item.meetingPoint}</p>}
            {item.flightNumber&&<p>Flight: {item.flightNumber} · Arrival: {item.arrivalTime||"To arrange"} (Marrakech)</p>}
            <div className="breakdown">
              <p className="total">
                <span>Total rental price</span>
                <strong>{money(item.total)}</strong>
              </p>
              <small>
                {item.days} days · MAD / DH · No online payment taken
              </small>
            </div>
            {status === "PENDING" && (
              <p className="muted">
                Our team will review your request. This hold expires on{" "}
                {item.expiresAt?.toISOString().replace("T", " ").slice(0, 16)}{" "}
                UTC unless confirmed.
              </p>
            )}
            <small>
              Keep this private link to check your reservation status and contact our team.
            </small>
          </div>
          <aside className="panel">
            <h3>What happens next?</h3>
            <div className="confirmation-timeline">
              <div>
                <ClipboardCheck size={20} />
                <section>
                  <strong>We review your request</strong>
                  <p>
                    The team checks your reservation and coordinates the
                    details.
                  </p>
                </section>
              </div>
              <div>
                <Plane size={20} />
                <section>
                  <strong>Your airport handover</strong>
                  <p>
                    For airport pickup, our team uses your flight information to
                    plan your collection.
                  </p>
                </section>
              </div>
              <div>
                <ShieldCheck size={20} />
                <section>
                  <strong>Keep your private link</strong>
                  <p>
                    Return here to check your current status. Your booking is
                    pending until confirmed.
                  </p>
                </section>
              </div>
            </div>
            <Link
              className="button light"
              style={{ marginTop: 25 }}
              href="/contact"
            >
              Help with my arrival
            </Link>
          </aside>
        </div>
        <CustomerRequest reference={reference} token={token} enabled={["PENDING","CONFIRMED"].includes(status)} requests={JSON.parse(JSON.stringify(item.requests))}/>
      </main>
      <Footer />
    </>
  );
}
