import Link from "next/link";
import { Users, Gauge, Fuel, Check, Plane, ArrowRight } from "lucide-react";
import { money } from "@/lib/pricing";
import type { Car } from "./CarCard";
export function CarResult({
  car,
  total,
  days,
  query,
}: {
  car: Car;
  total?: number;
  days?: number;
  query: string;
}) {
  const href = `/cars/${car.slug}${query ? "?" + query : ""}`;
  return (
    <article className="car-result">
      <Link className="result-photo" href={href}>
        {car.images[0] ? (
          <img src={car.images[0].url} alt={car.images[0].alt} />
        ) : (
          <span>Photo coming soon</span>
        )}
        <span>{car.category}</span>
      </Link>
      <div className="result-description">
        <div className="result-title">
          <Link href={href}>
            <h2>
              {car.brand} {car.model}
            </h2>
          </Link>
          <small>
            {car.year} · {car.category}
          </small>
        </div>
        <div className="result-specs">
          <span>
            <Users size={16} />
            {car.seats} seats
          </span>
          <span>
            <Gauge size={16} />
            {car.transmission}
          </span>
          <span>
            <Fuel size={16} />
            {car.fuel}
          </span>
        </div>
        <p className="airport-inclusion">
          <Plane size={16} />
          Marrakech airport delivery
        </p>
        <p className="result-note">
          <Check size={14} />
          {days
            ? "Available for your selected dates"
            : "Choose dates to check availability"}
        </p>
        <small className="muted">
          No account required · Request reviewed by our team
        </small>
      </div>
      <div className="result-price">
        <small>
          {days ? `Rental total for ${days} days` : "Daily rental rate"}
        </small>
        <strong>{money(total ?? car.dailyPrice)}</strong>
        <span>
          {days
            ? "Period discounts included"
            : "Select dates for your full quote"}
        </span>
        <Link href={href} className="button">
          View deal <ArrowRight size={16} />
        </Link>
        <small>{money(car.dailyPrice)} / day</small>
      </div>
    </article>
  );
}
