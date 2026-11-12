import { AboutPage } from "@/components/AboutPage";
import { ServicesPage } from "@/components/ServicesPage";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Plane,
  MapPin,
  ShieldCheck,
  KeyRound,
  CalendarDays,
  ClipboardCheck,
  ArrowRight,
  HelpCircle,
} from "lucide-react";
import { Header, Footer } from "@/components/PublicShell";
const content = {
  about: {
    eyebrow: "Rooted in Marrakech",
    title: "A local welcome.\nYour own way to explore.",
    body: "REWAQ Location is a Marrakech-based car rental service for travellers who want a straightforward start to their stay. Arriving from Europe? We can deliver your vehicle to Marrakech Menara Airport and coordinate the handover around your arrival.",
    cards: [
      [
        "Made for your arrival",
        "Airport delivery connects your flight to the rest of your journey. Share your flight details when you request your car.",
      ],
      [
        "A choice that fits your stay",
        "Compare the vehicles in our fleet, check your dates and see a rental quote before sending your request.",
      ],
      [
        "People behind every booking",
        "Our team reviews your reservation and coordinates the collection details with you.",
      ],
    ],
  },
  services: {
    eyebrow: "Your Marrakech journey",
    title: "From the arrivals hall\nto the open road.",
    body: "Plan your car rental before you fly. Pick your dates, choose your vehicle and tell us about your arrival. Our local team will review your request and arrange the next steps.",
    cards: [
      [
        "Marrakech airport delivery",
        "Collect your vehicle at Marrakech Menara Airport. Add your flight number and Marrakech local arrival time to help coordinate your handover.",
      ],
      [
        "Daily, weekly & monthly rentals",
        "Choose the period that fits your trip. Every vehicle has independent rates, with applicable discounts shown in your quote.",
      ],
      [
        "Marrakech city collection",
        "Choose Marrakech city when requesting your car. The exact handover arrangements are coordinated with our team.",
      ],
    ],
  },
  contact: {
    eyebrow: "Help with your arrival",
    title: "Let’s make your\nMarrakech arrival easier.",
    body: "Planning a trip from Europe or already in Marrakech? Tell us what you need through your reservation request. Include your arrival details and any questions in the notes, so our team can review them together.",
    cards: [
      [
        "Where we are",
        "REWAQ Location is based in Marrakech, Morocco. Vehicle delivery is available at Marrakech Menara Airport (RAK).",
      ],
      [
        "Before you book",
        "Choose your dates to see availability and your rental total. Add special requirements to the notes before submitting.",
      ],
      [
        "After your request",
        "Keep your private confirmation link to follow the reservation status. Your request remains pending until reviewed by our team.",
      ],
    ],
  },
};
export default async function Info({
  params,
}: {
  params: Promise<{ page: string }>;
}) {
  const page = (await params).page;
  if (!(page in content)) notFound();
  if (page === "services") return <ServicesPage />;
  if (page === "about") return <AboutPage />;
  const data = content[page as keyof typeof content];
  const icons =
    page === "services"
      ? [Plane, CalendarDays, MapPin]
      : page === "contact"
        ? [MapPin, HelpCircle, ClipboardCheck]
        : [Plane, KeyRound, ShieldCheck];
  return (
    <>
      <Header />
      <main id="main-content" className="container section">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span>›</span>
          <span>
            {page === "about"
              ? "About REWAQ Location"
              : page === "services"
                ? "Our services"
                : "Help & contact"}
          </span>
        </nav>
        <section className="info-hero">
          <div>
            <span className="eyebrow">{data.eyebrow}</span>
            <h1 style={{ whiteSpace: "pre-line" }}>{data.title}</h1>
            <p>{data.body}</p>
            <Link className="button" href="/cars">
              Find your Marrakech car <ArrowRight size={16} />
            </Link>
          </div>
          <div className="info-art">
            <Plane size={35} />
            <strong>RAK</strong>
            <span className="eyebrow">Marrakech, from the first mile</span>
          </div>
        </section>
        <div className="info-card-grid">
          {data.cards.map(([title, body], i) => {
            const Icon = icons[i];
            return (
              <article className="info-card" key={title}>
                <Icon size={28} />
                <h2>{title}</h2>
                <p>{body}</p>
              </article>
            );
          })}
        </div>
        {page === "about" && (
          <section className="rewaq-meaning">
            <span className="eyebrow">The meaning behind REWAQ</span>
            <h2>Rent Easily With Accurate Quotes.</h2>
            <p>
              Our name brings together a simple rental experience and a clear
              quote. Our symbol pairs a Marrakech-inspired arch with an R-shaped
              road: a welcome at the airport, and the freedom to explore.
            </p>
          </section>
        )}
        <section className="help-banner">
          <Plane size={34} />
          <div>
            <h3>Arriving from Europe?</h3>
            <p>
              Give us your flight number and arrival time when you book. We’ll
              coordinate your airport handover.
            </p>
          </div>
          <Link className="button" href="/cars">
            Search available cars <ArrowRight size={16} />
          </Link>
        </section>
        {page === "contact" && (
          <div className="panel" style={{ marginTop: 25 }}>
            <h3>Already have a reservation?</h3>
            <p className="muted">
              Open the private link provided after your request to see its
              status, dates and rental total. Keep that link private. No
              customer account is needed.
            </p>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
