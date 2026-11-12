import Link from "next/link";
import { ArrowUpRight, Plane, CalendarDays, MapPin } from "lucide-react";
import { Header, Footer } from "./PublicShell";
const services = [
  {
    number: "01",
    label: "Marrakech Menara",
    title: (
      <>
        Vous atterrissez.
        <br />
        On vous accueille.
      </>
    ),
    text: "Livraison coordonnée avec votre arrivée.",
    image: "/vehicles/hero-bmw-scene.webp",
    alt: "Voiture devant une architecture marocaine au coucher du soleil",
    href: "/cars?location=Marrakech+Menara+Airport+%28RAK%29",
    Icon: Plane,
  },
  {
    number: "02",
    label: "Courts & longs séjours",
    title: (
      <>
        Le temps
        <br />
        de profiter.
      </>
    ),
    text: "Jour · Semaine · Mois",
    image: "/vehicles/hero-mercedes-scene.webp",
    alt: "Voiture sur une route de montagne",
    href: "/cars",
    Icon: CalendarDays,
  },
  {
    number: "03",
    label: "Marrakech ville",
    title: (
      <>
        Votre ville.
        <br />
        Votre départ.
      </>
    ),
    text: "Retrait organisé avec notre équipe.",
    image: "/vehicles/hero-porsche-scene.webp",
    alt: "Cabriolet sur une route côtière marocaine",
    href: "/cars?location=Marrakech+city",
    Icon: MapPin,
  },
];
export function ServicesPage() {
  return (
    <>
      <Header />
      <main
        id="main-content"
        className="container services-photo-page"
        lang="fr"
      >
        <nav className="breadcrumbs" aria-label="Fil d’Ariane">
          <Link href="/">Accueil</Link>
          <span>›</span>
          <span>Nos services</span>
        </nav>
        <div className="services-photo-intro">
          <div>
            <span className="eyebrow">Le voyage commence avec REWAQ</span>
            <h1>
              À chaque voyage,
              <br />
              son point de départ.
            </h1>
          </div>
          <p>
            Choisissez votre façon de rouler.
            <br />
            Notre équipe coordonne la suite.
          </p>
        </div>
        <div className="services-experiences">
          {services.map(({ Icon, ...s }) => (
            <Link className="service-experience" key={s.number} href={s.href}>
              <img
                src={s.image}
                alt={s.alt}
                loading={s.number === "01" ? "eager" : "lazy"}
              />
              <span className="service-experience-number">{s.number}</span>
              <div className="service-experience-copy">
                <span className="service-experience-label">
                  <Icon size={13} />
                  {s.label}
                </span>
                <h2>{s.title}</h2>
                <p>{s.text}</p>
                <span className="service-experience-arrow">
                  <ArrowUpRight size={23} />
                </span>
              </div>
            </Link>
          ))}
        </div>
        <section className="services-photo-cta">
          <div>
            <h2>Votre prochain trajet commence ici.</h2>
            <p>Choisissez vos dates. Découvrez votre voiture.</p>
          </div>
          <Link className="button" href="/cars">
            Voir les disponibilités <ArrowUpRight size={17} />
          </Link>
        </section>
      </main>
      <Footer />
    </>
  );
}
