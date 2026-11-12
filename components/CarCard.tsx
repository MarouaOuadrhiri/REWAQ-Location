import Link from "next/link";
import { Gauge, Users, Fuel, ArrowUpRight } from "lucide-react";
import { money } from "@/lib/pricing";
export type Car = {
  id: string;
  slug: string;
  brand: string;
  model: string;
  year: number;
  category: string;
  transmission: string;
  fuel: string;
  seats: number;
  dailyPrice: unknown;
  weeklyPrice: unknown;
  monthlyPrice: unknown;
  description?: string;
  images: { url: string; alt: string }[];
  archived?: boolean;
};
export function CarCard({ car, admin = false }: { car: Car; admin?: boolean }) {
  return (
    <article className="car-card car-card-clean">
      <Link
        href={admin ? `/admin/cars/${car.id}` : `/cars/${car.slug}`}
        className="car-media"
        style={{ display: "block" }}
      >
        <span className="badge">
          {car.archived ? "Archived" : car.category}
        </span>
        {car.images[0] ? (
          <img src={car.images[0].url} alt={car.images[0].alt} loading="lazy" />
        ) : (
          <div className="empty">Photography pending</div>
        )}
      </Link>
      <div className="card-body">
        <small>
          {car.brand.toUpperCase()} · {car.year}
        </small>
        <div className="car-title">
          <h3>{car.model}</h3>
        </div>
        <div className="specs">
          <span>
            <Gauge size={13} />
            {car.transmission}
          </span>
          <span>
            <Users size={13} />
            {car.seats} seats
          </span>
          <span>
            <Fuel size={13} />
            {car.fuel}
          </span>
        </div>
        <div className="card-bottom">
          <div className="price">
            {money(car.dailyPrice)} <small>/ day</small>
          </div>
          <Link
            className="card-book"
            aria-label={`${admin ? "Manage" : "Book"} ${car.brand} ${car.model}`}
            href={admin ? `/admin/cars/${car.id}` : `/cars/${car.slug}#reserve`}
          >
            {admin ? "Manage" : "Book"}
            <ArrowUpRight size={15} />
          </Link>
        </div>
      </div>
    </article>
  );
}
