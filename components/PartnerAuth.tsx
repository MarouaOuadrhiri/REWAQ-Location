"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpRight, ShieldCheck, Eye, EyeOff, Check } from "lucide-react";
import { api } from "./AdminForms";
export function PartnerAuth({ register = false }: { register?: boolean }) {
  const router = useRouter(),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [show, setShow] = useState(false);
  return (
    <main className="partner-auth">
      <section className="partner-auth-story">
        <Link href="/" className="partner-auth-brand">
          <img src="/brand/rewaq-logo-light.svg" alt="REWAQ Location" />
        </Link>
        <div>
          <span className="partner-kicker">REWAQ · PARTNER COLLECTION</span>
          <h1>
            Votre flotte.
            <br />
            Notre vitrine.
            <br />
            <em>Plus loin, ensemble.</em>
          </h1>
          <p>
            Un espace pour vos voitures, vos disponibilités et les voyages qui
            commencent avec vous.
          </p>
          <div className="partner-auth-benefits">
            <span>
              <Check size={15} />
              Vos tarifs nets
            </span>
            <span>
              <Check size={15} />
              Vos voitures, votre espace
            </span>
            <span>
              <Check size={15} />
              Réservations centralisées
            </span>
          </div>
        </div>
        <span className="partner-auth-bottom">
          MARRAKECH & AU-DELÀ · REWAQ PARTNERS
        </span>
        <img
          className="partner-auth-car"
          src="/vehicles/hero-mercedes-scene.webp"
          alt="Voiture sur une route de montagne"
        />
      </section>
      <section className="partner-auth-form">
        <div className="partner-auth-form-inner">
          <div className="partner-auth-top">
            <span className="partner-kicker">ESPACE AGENCE</span>
            <Link href="/">Retour au site ↗</Link>
          </div>
          <h2>
            {register ? (
              <>
                Votre prochain
                <br />
                chapitre commence ici.
              </>
            ) : (
              <>
                Ravi de vous
                <br />
                retrouver.
              </>
            )}
          </h2>
          <p>
            {register
              ? "Créez votre compte agence. Notre équipe l’examinera avant la publication de vos voitures."
              : "Connectez-vous pour retrouver votre flotte et vos réservations."}
          </p>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setBusy(true);
              setError("");
              try {
                await api(
                  "/api/partner/" + (register ? "register" : "login"),
                  "POST",
                  Object.fromEntries(new FormData(e.currentTarget)),
                );
                router.push("/partner/dashboard");
                router.refresh();
              } catch (e) {
                setError((e as Error).message);
              } finally {
                setBusy(false);
              }
            }}
          >
            {register && (
              <>
                <label>
                  Nom de l’agence
                  <input
                    name="name"
                    required
                    minLength={3}
                    maxLength={150}
                    autoComplete="organization"
                    placeholder="Votre agence de location"
                  />
                </label>
                <div className="form-grid">
                  <label>
                    Téléphone
                    <input
                      name="phone"
                      type="tel"
                      minLength={7}
                      maxLength={40}
                      required
                      autoComplete="tel"
                      placeholder="+212 …"
                    />
                  </label>
                  <label>
                    Ville
                    <input
                      name="city"
                      minLength={2}
                      maxLength={100}
                      required
                      autoComplete="address-level2"
                      placeholder="Marrakech"
                    />
                  </label>
                </div>
              </>
            )}
            <label>
              Email professionnel
              <input
                name="email"
                type="email"
                required
                maxLength={200}
                autoComplete="email"
                placeholder="contact@votre-agence.ma"
              />
            </label>
            <label>
              Mot de passe
              <div className="partner-password">
                <input
                  name="password"
                  type={show ? "text" : "password"}
                  required
                  minLength={register ? 12 : 1}
                  maxLength={72}
                  autoComplete={register ? "new-password" : "current-password"}
                />
                <button
                  type="button"
                  aria-label={
                    show
                      ? "Masquer le mot de passe"
                      : "Afficher le mot de passe"
                  }
                  onClick={() => setShow((v) => !v)}
                >
                  {show ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {register && (
                <small>
                  12 caractères minimum. Utilisez un mot de passe unique.
                </small>
              )}
            </label>
            {error && (
              <p className="error" role="alert">
                {error}
              </p>
            )}
            <button className="button partner-primary" disabled={busy}>
              {busy
                ? "Un instant…"
                : register
                  ? "Créer mon compte agence"
                  : "Ouvrir mon espace"}
              <ArrowUpRight size={18} />
            </button>
          </form>
          <div className="partner-auth-switch">
            {register ? "Déjà partenaire ?" : "Pas encore partenaire ?"}{" "}
            <Link href={register ? "/partner/login" : "/partner/register"}>
              {register ? "Se connecter" : "Rejoindre REWAQ"}
            </Link>
          </div>
          <div className="partner-auth-trust">
            <ShieldCheck size={17} />
            <span>
              Un accès privé à votre agence. Les nouvelles inscriptions sont
              vérifiées par REWAQ.
            </span>
          </div>
        </div>
      </section>
    </main>
  );
}
