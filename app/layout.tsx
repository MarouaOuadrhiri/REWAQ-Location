import type { Metadata } from "next";
import "./globals.css";
import "./booking-design.css";
import "./medina-brand.css";
import "./rewaq-brand.css";
export const metadata: Metadata = {
  title: {
    default: "REWAQ Location — Marrakech car rental & airport delivery",
    template: "%s | REWAQ Location",
  },
  description:
    "Find your Marrakech rental car. REWAQ Location offers vehicle delivery at Marrakech Menara Airport for travellers arriving from Europe. Reserve as a guest with a clear rental quote.",
  icons: {
    icon: "/brand/rewaq-icon.svg",
    apple: "/brand/rewaq-icon-180.png",
  },
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
