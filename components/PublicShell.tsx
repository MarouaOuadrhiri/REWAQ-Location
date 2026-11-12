import { FloatingNavigation } from "./FloatingNavigation";
import Link from "next/link";
import { CarFront, Plane, MapPin, HelpCircle, ArrowRight } from "lucide-react";
export function Brand() {
  return (
    <Link href="/" className="brand">
      <img src="/brand/rewaq-icon.svg" width="35" height="35" alt="" />
      <span className="brand-wordmark">
        REWAQ<small>LOCATION · MARRAKECH</small>
      </span>
    </Link>
  );
}
export function Header(_props: { light?: boolean } = {}) {
  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <FloatingNavigation brand={<Brand />} />
    </>
  );
}
export function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-top">
          <div>
            <Brand />
            <p>
              Land in Marrakech. Leave with your keys.
              <br />
              Car rental with a personal welcome.
            </p>
            <span className="footer-location">
              <MapPin size={15} />
              Marrakech, Morocco
            </span>
          </div>
          <div>
            <h3>Explore REWAQ Location</h3>
            <Link href="/cars">Find a car</Link>
            <Link href="/services">Airport delivery</Link>
            <Link href="/about">Our story</Link>
          </div>
          <div>
            <h3>Your reservation</h3>
            <Link href="/contact">Planning your arrival</Link>
            <p>
              Keep your private confirmation link
              <br />
              to follow your booking status.
            </p>
            <Link href="/admin/login">
              Administration <ArrowRight size={12} />
            </Link>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} REWAQ Location · Marrakech</span>
          <span>MAD / DH · Clear prices. Thoughtful journeys.</span>
        </div>
      </div>
    </footer>
  );
}
