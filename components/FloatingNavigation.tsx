"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowUpRight, Menu, X, UserRound } from "lucide-react";
const links = [
  ["/", "Accueil"],
  ["/cars", "Nos voitures"],
  ["/compare", "Comparer"],
  ["/services", "Nos services"],
  ["/about", "À propos"],
  ["/contact", "Contact"],
];
export function FloatingNavigation({ brand }: { brand: React.ReactNode }) {
  const pathname = usePathname(),
    [open, setOpen] = useState(false);
  useEffect(() => {
    setOpen(false);
  }, [pathname]);
  useEffect(() => {
    if (!open) return;
    const close = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [open]);
  return (
    <div className="floating-nav-wrap container">
      <header className="floating-nav-bar">
        {brand}
        <nav
          id="floating-main-navigation"
          aria-label="Main navigation"
          className={open ? "floating-links is-open" : "floating-links"}
        >
          {links.map(([href, label]) => (
            <Link
              key={href}
              href={href}
              aria-current={
                (href === "/" ? pathname === "/" : pathname.startsWith(href))
                  ? "page"
                  : undefined
              }
              onClick={() => setOpen(false)}
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="floating-nav-actions">
          <span className="floating-currency">MAD · DH</span>
          <Link
            className="floating-admin"
            href="/admin/login"
            aria-label="Admin sign in"
            title="Administration"
          >
            <UserRound size={16} />
          </Link>
          <Link className="floating-reserve" href="/cars">
            Réserver <span className="floating-reserve-long">une voiture</span>
            <ArrowUpRight size={16} />
          </Link>
          <button
            type="button"
            className="floating-menu-toggle"
            aria-label={open ? "Close navigation" : "Open navigation"}
            aria-expanded={open}
            aria-controls="floating-main-navigation"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
      </header>
    </div>
  );
}
