import Link from "next/link";
import {
  Plane,
  ShieldCheck,
  KeyRound,
  ArrowRight,
  MapPin,
  Check,
} from "lucide-react";
import { db } from "@/lib/db";
import { Header, Footer } from "@/components/PublicShell";
import { SearchBar } from "@/components/SearchBar";
import { CarCard } from "@/components/CarCard";
import { HeroCarousel } from "@/components/HeroCarousel";
export const dynamic = "force-dynamic";
export default async function Home() {
  const vehicles = await db.vehicle.findMany({
    where: { archived: false },
    include: { images: { orderBy: { position: "asc" } } },
    orderBy: [{ featured: "desc" }, { createdAt: "asc" }],
    take: 6,
  });
  const cars = JSON.parse(JSON.stringify(vehicles));
  return (
    <>
      <Header light />
      <main id="main-content">
        <HeroCarousel cars={cars.slice(0, 3)} />
        <div className="container home-search" id="rental-search">
          <SearchBar />
          <p className="search-hint">
            <MapPin size={13} />
            Based in Marrakech · Airport delivery coordinated with your arrival
          </p>
        </div>
        <section className="container benefit-strip">
          {[
            [
              Plane,
              "A welcome at the airport",
              "Share your flight details. We arrange the handover.",
            ],
            [
              ShieldCheck,
              "Know your rental price",
              "A clear rental quote before you reserve.",
            ],
            [
              KeyRound,
              "Book without an account",
              "Choose your dates, add your details, and send a request.",
            ],
          ].map(([Icon, title, text]: any) => (
            <div key={title}>
              <Icon size={27} />
              <div>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            </div>
          ))}
        </section>
        <section className="container section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">A car for your kind of trip</span>
              <h2>Find your Marrakech drive</h2>
              <p className="muted">
                From city days to open-road escapes. Choose a car that feels
                right.
              </p>
            </div>
            <Link className="text-link" href="/cars">
              See all cars <ArrowRight size={15} />
            </Link>
          </div>
          <div className="category-links">
            {[...new Set(vehicles.map((v) => v.category))].map((category) => (
              <Link
                key={category}
                href={`/cars?category=${encodeURIComponent(category)}`}
              >
                <KeyRound size={17} />
                {category}
                <ArrowRight size={13} />
              </Link>
            ))}
          </div>
          <div className="grid">
            {vehicles.map((car) => (
              <CarCard key={car.id} car={car} />
            ))}
          </div>
          {!vehicles.length && (
            <p className="empty">
              Our fleet is being prepared. Please check back soon.
            </p>
          )}
        </section>
        <section className="airport-banner container">
          <div className="airport-handover-card">
            <div className="handover-card-top">
              <img
                src="/brand/rewaq-symbol-light.svg"
                alt=""
                width="30"
                height="35"
              />
              <span>MARRAKECH ARRIVALS</span>
              <Plane size={19} />
            </div>
            <div className="handover-destination">
              <span>RAK</span>
              <div>
                <strong>Marrakech Menara</strong>
                <small>Your arrival. Your next adventure.</small>
              </div>
            </div>
            <div className="handover-route">
              <span>
                <Plane size={18} /> You land
              </span>
              <i />
              <span>
                <KeyRound size={18} /> We hand over the keys
              </span>
            </div>
            <p>
              Share your flight details when you book.
              <br />
              We coordinate your car collection with you.
            </p>
          </div>
          <div>
            <span className="eyebrow">
              From your flight to your first drive
            </span>
            <h2>
              Less time arranging.
              <br />
              More time in Marrakech.
            </h2>
            <p>
              Flying in from Europe? Add your flight number and arrival time
              when you book. Our Marrakech team will coordinate your airport
              handover before your reservation is confirmed.
            </p>
            <Link className="button" href="/cars">
              Find my airport car <ArrowRight size={17} />
            </Link>
          </div>
        </section>
        <section className="section container">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Simple from the start</span>
              <h2>Three steps. One great arrival.</h2>
            </div>
          </div>
          <div className="journey-steps">
            {[
              [
                "01",
                "Choose your car",
                "Search your dates and compare the available vehicles.",
              ],
              [
                "02",
                "Tell us about your arrival",
                "Add your contact details and flight information.",
              ],
              [
                "03",
                "We arrange the handover",
                "Our team reviews your request and coordinates collection.",
              ],
            ].map(([n, t, b]) => (
              <div key={n}>
                <span>{n}</span>
                <h3>{t}</h3>
                <p>{b}</p>
              </div>
            ))}
          </div>
        </section>
        <section className="section container faq-section">
          <div>
            <span className="eyebrow">Before you arrive</span>
            <h2>
              A few things
              <br />
              worth knowing.
            </h2>
            <Link className="text-link" href="/contact">
              More help <ArrowRight size={14} />
            </Link>
          </div>
          <div>
            {[
              [
                "Can I collect my car at Marrakech airport?",
                "Yes. REWAQ Location is based in Marrakech and offers vehicle delivery at Marrakech Menara Airport. Add your arrival details so our team can coordinate the handover.",
              ],
              [
                "Is my reservation confirmed immediately?",
                "Your request starts as pending. Our team reviews it before confirmation. Your private booking link shows its current status.",
              ],
              [
                "How is the rental price calculated?",
                "Your quote uses the vehicle’s daily, weekly and monthly rates, with applicable period discounts. Your full rental total is shown before you request.",
              ],
              [
                "Do I need an account to book?",
                "No. You can request a car as a guest with your contact and driver information.",
              ],
            ].map(([q, a]) => (
              <details key={q}>
                <summary>{q}</summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
