import { VehicleGallery } from "@/components/VehicleGallery";
import { notFound } from "next/navigation";
import { settings } from "@/lib/reservations";
import { db } from "@/lib/db";
import { money } from "@/lib/pricing";
import { Header, Footer } from "@/components/PublicShell";
import { BookingForm } from "@/components/BookingForm";
import { CarCard } from "@/components/CarCard";
import Link from "next/link";
import {
  Plane,
  Check,
  Users,
  Gauge,
  Fuel,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
export const dynamic = "force-dynamic";
export default async function Details({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { slug } = await params;
  const initial = await searchParams;
  const car = await db.vehicle.findUnique({
    where: { slug, archived: false },
    include: { images: { orderBy: { position: "asc" } } },
  });
  if (!car) notFound();
  const policies = await settings();
  const similar = await db.vehicle.findMany({
    where: { archived: false, category: car.category, id: { not: car.id } },
    include: { images: { orderBy: { position: "asc" } } },
    take: 3,
  });
  return (
    <>
      <Header />
      <main id="main-content" className="container section vehicle-page">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span>›</span>
          <Link href="/cars">Marrakech car rentals</Link>
          <span>›</span>
          <span>
            {car.brand} {car.model}
          </span>
        </nav>
        <div className="eyebrow">
          {car.category} · {car.year}
        </div>
        <h1>
          {car.brand} {car.model}
        </h1>
        <div className="vehicle-location">
          <Plane size={16} />
          Marrakech Menara Airport delivery <span>·</span> Guest reservations
          welcome
        </div>
        <nav className="detail-tabs" aria-label="Vehicle sections">
          <a href="#overview">Overview</a>
          <a href="#specifications">Specifications</a>
          <a href="#rates">Rental rates</a>
          <a href="#reserve">Reserve your car</a>
        </nav>
        <div className="detail-grid">
          <div id="overview">
            <VehicleGallery
              photos={car.images}
              name={car.brand + " " + car.model}
            />
            <p className="muted">{car.description}</p>
            <div id="specifications" className="specs detail-specs">
              <span>
                <Gauge size={20} />
                {car.transmission}
              </span>
              <span>
                <Fuel size={20} />
                {car.fuel}
              </span>
              <span>
                <Users size={20} />
                {car.seats} seats
              </span>
              <span>{car.year}</span>
            </div>
            <div id="rates" className="panel rates-panel">
              <h3>Rental rates</h3>
              <div className="rate-options">
                <div>
                  <small>Daily rate</small>
                  <strong>{money(car.dailyPrice)}</strong>
                  <span>per day</span>
                </div>
                <div>
                  <small>Weekly rate</small>
                  <strong>{money(car.weeklyPrice)}</strong>
                  <span>per 7 days</span>
                </div>
                <div>
                  <small>Monthly rate</small>
                  <strong>{money(car.monthlyPrice)}</strong>
                  <span>per 30 days</span>
                </div>
              </div>
              <small>
                Weekly and monthly discounts are applied in your quote.
              </small>
            </div>
            <section className="panel rental-policies">
              <h3>Before you book</h3>
              <p>
                Refundable security deposit:{" "}
                {policies.securityDeposit == null
                  ? "To arrange with our team before confirmation"
                  : money(policies.securityDeposit)}
              </p>
              <p>
                Airport delivery / collection:{" "}
                {policies.airportHandoverFee == null
                  ? "Fee and handover details to arrange before confirmation"
                  : money(policies.airportHandoverFee) +
                    " per airport handover"}
              </p>
              <p>
                {policies.rentalTerms ||
                  "Our team will confirm driver requirements, insurance cover, fuel policy and cancellation terms before confirming your reservation. Contact us if you need these details before sending a request."}
              </p>
            </section>
            <div className="panel airport-detail">
              <Plane size={28} />
              <div>
                <h3>Land, collect, explore.</h3>
                <p>
                  REWAQ Location is based in Marrakech. Share your flight number
                  and arrival time when you book so we can coordinate your
                  handover at Menara Airport.
                </p>
                <ul>
                  <li>
                    <Check size={15} />
                    Your rental total before you request
                  </li>
                  <li>
                    <Check size={15} />
                    No customer account required
                  </li>
                  <li>
                    <Check size={15} />
                    Reservation reviewed by our local team
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <BookingForm
            key={`${car.id}-${initial.pickupAt}-${initial.returnAt}`}
            vehicleId={car.id}
            initial={initial}
          />
        </div>
        {similar.length > 0 && (
          <section className="section">
            <h2>You may also enjoy.</h2>
            <div className="grid">
              {similar.map((v) => (
                <CarCard key={v.id} car={v} />
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
