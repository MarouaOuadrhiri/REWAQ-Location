"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  CarFront,
  CalendarDays,
  Users,
  ClipboardList,
  Settings,
  Coins,
  ArrowUpRight,
  LogOut,
} from "lucide-react";
const links = [
  ["dashboard", "Overview", LayoutDashboard],
  ["today", "Today’s operations", ClipboardList],
  ["cars", "Fleet management", CarFront],
  ["reservations", "Reservations", ClipboardList],
  ["customers", "Customers", Users],
  ["calendar", "Fleet planning", CalendarDays],
  ["pricing", "Pricing", Coins],
  ["settings", "Settings", Settings],
] as const;
export function AdminShell({
  children,
  name,
}: {
  children: React.ReactNode;
  name: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  return (
    <div className="admin-shell">
      <aside className="sidebar">
        <Link className="brand" href="/">
          <img src="/brand/rewaq-icon.svg" width="28" height="28" alt="" />
          REWAQ<span>∙</span>
        </Link>
        <div className="eyebrow" style={{ color: "#63766D", fontSize: 9 }}>
          Marrakech workspace
        </div>
        <nav aria-label="Administration">
          {links.map(([slug, title, Icon]) => (
            <Link
              className={pathname.startsWith("/admin/" + slug) ? "active" : ""}
              key={slug}
              href={"/admin/" + slug}
            >
              <Icon size={17} />
              {title}
            </Link>
          ))}
        </nav>
        <div className="sidebar-foot">
          <p style={{ color: "white" }}>{name}</p>
          <small>Administrator</small>
          <button
            className="button outline small"
            style={{ marginTop: 20, width: "100%" }}
            onClick={async () => {
              await fetch("/api/auth/logout", { method: "POST" });
              router.push("/admin/login");
              router.refresh();
            }}
          >
            <LogOut size={13} />
            Sign out
          </button>
        </div>
      </aside>
      <div className="admin-main">
        <header className="admin-header">
          <span className="muted">
            Workspace /{" "}
            <span style={{ color: "#263C36" }}>
              {links.find(([slug]) => pathname.includes(slug))?.[1] ||
                "Management"}
            </span>
          </span>
          <Link href="/" target="_blank">
            View website{" "}
            <ArrowUpRight
              size={13}
              style={{ display: "inline", marginLeft: 10 }}
            />
          </Link>
        </header>
        <main className="admin-content">{children}</main>
      </div>
    </div>
  );
}
