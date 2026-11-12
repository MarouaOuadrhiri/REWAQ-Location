import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Header, Footer } from "./PublicShell";
export function AboutPage() {
  return (
    <>
      <Header />
      <main id="main-content" lang="fr" className="container about-editorial">
        <nav className="breadcrumbs" aria-label="Fil d’Ariane">
          <Link href="/">Accueil</Link>
          <span>›</span>
          <span>À propos de REWAQ</span>
        </nav>
        <section className="about-intro">
          <div>
            <span className="eyebrow">Marrakech, notre point de départ</span>
            <h1>
              Un accueil local.
              <br />
              Une liberté
              <br />
              <em>bien à vous.</em>
            </h1>
            <p>Une voiture, un accueil, et tout le Maroc devant vous.</p>
            <Link className="button" href="/cars">
              Découvrir nos voitures <ArrowUpRight size={17} />
            </Link>
          </div>
          <div className="about-photo about-intro-photo">
            <img
              src="/vehicles/hero-bmw-scene.webp"
              alt="Voiture à Marrakech au coucher du soleil"
            />
            <span className="about-photo-label">Marrakech · Maroc</span>
          </div>
        </section>
        <section className="about-story">
          <figure className="about-photo about-agency-photo">
            <img
              src="/vehicles/rewaq-agency-concept.webp"
              alt="Visualisation d’une agence REWAQ spacieuse avec voitures, réception et visiteurs"
              loading="lazy"
            />
            <figcaption>
              Visualisation conceptuelle · Agence imaginée pour REWAQ
            </figcaption>
          </figure>
          <div>
            <span className="eyebrow">01 — Qui sommes-nous ?</span>
            <h2>
              REWAQ.
              <br />
              Votre départ,
              <br />
              notre attention.
            </h2>
            <p>
              REWAQ Location est un projet de location de voitures basé à
              Marrakech. Nous accompagnons les voyageurs, notamment ceux qui
              arrivent d’Europe, dans le choix de leur véhicule.
            </p>
            <p>
              Retrait en ville ou livraison à l’aéroport Menara : nous
              coordonnons les détails avec vous, avant de confirmer votre
              réservation.
            </p>
            <Link className="about-text-link" href="/services">
              Préparer mon arrivée <ArrowUpRight size={14} />
            </Link>
          </div>
        </section>
        <section className="about-values" aria-label="Nos valeurs">
          {[
            [
              "01 / SIMPLICITÉ",
              "Choisir, sans complications.",
              "Vos dates, votre voiture, une demande sans compte.",
            ],
            [
              "02 / CLARTÉ",
              "Un devis avant de réserver.",
              "Des tarifs calculés selon votre véhicule et votre séjour.",
            ],
            [
              "03 / ACCUEIL",
              "Un échange avec notre équipe.",
              "Votre arrivée et votre remise des clés, organisées ensemble.",
            ],
          ].map(([label, title, text]) => (
            <article key={label}>
              <span>{label}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </section>
        <section className="about-escapes">
          <div className="about-section-heading">
            <div>
              <span className="eyebrow">02 — Votre voyage, votre rythme</span>
              <h2>Le Maroc commence ici.</h2>
            </div>
            <p>
              Quelques jours en ville.
              <br />
              Une escapade plus loin.
            </p>
          </div>
          <div className="about-escape-grid">
            <Link className="about-photo" href="/cars">
              <img
                src="/vehicles/hero-mercedes-scene.webp"
                alt="Voiture sur une route de l’Atlas"
                loading="lazy"
              />
              <div>
                <span className="eyebrow">Routes de l’Atlas</span>
                <h3>
                  Prenez le temps de découvrir. <ArrowUpRight size={20} />
                </h3>
              </div>
            </Link>
            <Link className="about-photo" href="/cars">
              <img
                src="/vehicles/hero-porsche-scene.webp"
                alt="Cabriolet sur la côte atlantique"
                loading="lazy"
              />
              <div>
                <span className="eyebrow">Horizons atlantiques</span>
                <h3>
                  Changez de paysage. <ArrowUpRight size={20} />
                </h3>
              </div>
            </Link>
          </div>
        </section>
        <section className="about-brand-meaning">
          <div>
            <img
              src="/brand/rewaq-symbol-light.svg"
              width="100"
              height="110"
              alt="Symbole REWAQ : une arche et un R"
            />
            <strong>REWAQ</strong>
          </div>
          <div>
            <span className="eyebrow">03 — Un nom, une intention</span>
            <h2>
              Rent Easily
              <br />
              With Accurate Quotes.
            </h2>
            <p>
              Notre signature : une location simple et un devis clair.
              <br />
              Une arche pour l’accueil. Une route pour la liberté.
            </p>
          </div>
        </section>
        <section className="about-steps">
          <span className="eyebrow">04 — De l’envie au départ</span>
          <h2>Votre arrivée, en trois temps.</h2>
          <div>
            {[
              [
                "01",
                "Choisissez votre voiture.",
                "Comparez les modèles et vérifiez vos dates.",
              ],
              [
                "02",
                "Parlez-nous de votre arrivée.",
                "Vos coordonnées et les détails de votre vol.",
              ],
              [
                "03",
                "Organisons la remise des clés.",
                "Notre équipe examine et confirme votre demande.",
              ],
            ].map(([n, title, text]) => (
              <article key={n}>
                <span>{n}</span>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>
        <section className="about-photo about-final-cta">
          <img
            src="/vehicles/hero-bmw-scene.webp"
            alt="Marrakech au coucher du soleil"
            loading="lazy"
          />
          <div>
            <span className="eyebrow">À bientôt à Marrakech</span>
            <h2>
              Votre prochaine histoire
              <br />
              commence au volant.
            </h2>
            <p>Choisissez vos dates. Nous préparons la suite avec vous.</p>
          </div>
          <Link className="button" href="/cars">
            Trouver ma voiture <ArrowUpRight size={17} />
          </Link>
        </section>
      </main>
      <Footer />
    </>
  );
}
