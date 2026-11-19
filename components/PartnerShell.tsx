"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  CarFront,
  CalendarDays,
  Building2,
  ArrowUpRight,
  LogOut,
  Plus,
  Clock3,
} from "lucide-react";
const links = [
  ["dashboard", "Vue d’ensemble", LayoutDashboard],
  ["cars", "Ma collection", CarFront],
  ["reservations", "Réservations", CalendarDays],
  ["profile", "Mon agence", Building2],
] as const;
export function PartnerShell({
  agency,
  children,
}: {
  agency: { name: string; status: string; city: string };
  children: React.ReactNode;
}) {
  const pathname = usePathname(),
    router = useRouter();
  return (
    <div className="partner-shell">
      <aside className="partner-sidebar">
        <Link href="/" className="partner-sidebar-logo">
          <img src="/brand/rewaq-logo-light.svg" alt="REWAQ" />
        </Link>
        <span className="partner-workspace-label">PARTNER WORKSPACE</span>
        <div className="partner-agency-chip">
          <span>{agency.name.slice(0, 1).toUpperCase()}</span>
          <div>
            <strong>{agency.name}</strong>
            <small>
              {agency.city} ·{" "}
              {agency.status === "ACTIVE"
                ? "Partenaire actif"
                : "Validation en cours"}
            </small>
          </div>
        </div>
        <nav aria-label="Partner navigation">
          {links.map(([slug, label, Icon]) => (
            <Link
              key={slug}
              href={"/partner/" + slug}
              className={
                pathname.startsWith("/partner/" + slug) ? "active" : ""
              }
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </nav>
        <div className="partner-sidebar-note">
          <span>UNE COLLECTION QUI VOUS RESSEMBLE.</span>
          <p>
            Chaque voiture a une histoire.
            <br />
            Faites découvrir la vôtre.
          </p>
          <Link
            href={
              agency.status === "ACTIVE"
                ? "/partner/cars/new"
                : "/partner/profile"
            }
          >
            {agency.status === "ACTIVE"
              ? "Ajouter une voiture"
              : "Compléter mon profil"}{" "}
            <Plus size={15} />
          </Link>
        </div>
        <button
          type="button"
          className="partner-signout"
          onClick={async () => {
            await fetch("/api/partner/logout", { method: "POST" });
            router.push("/partner/login");
            router.refresh();
          }}
        >
          <LogOut size={16} />
          Déconnexion
        </button>
      </aside>
      <div className="partner-main">
        <header className="partner-topbar">
          <span>
            Votre espace /{" "}
            <strong>
              {links.find(([slug]) => pathname.includes(slug))?.[1] ||
                "Collection"}
            </strong>
          </span>
          <Link href="/cars">
            Explorer la vitrine <ArrowUpRight size={15} />
          </Link>
        </header>
        <main>
          {agency.status !== "ACTIVE" && (
            <div className="partner-pending">
              <Clock3 size={22} />
              <div>
                <strong>
                  Bienvenue. Votre agence est en cours de vérification.
                </strong>
                <p>
                  REWAQ doit activer votre compte avant l’ajout et la
                  publication de voitures.
                </p>
              </div>
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
