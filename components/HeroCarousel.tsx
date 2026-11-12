"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  ArrowUpRight,
  Plane,
  CarFront,
  ShieldCheck,
  KeyRound,
  Settings2,
  ArrowRight,
} from "lucide-react";
import { money } from "@/lib/pricing";
type Slide = {
  id: string;
  slug: string;
  brand: string;
  model: string;
  dailyPrice: string;
  category: string;
  transmission: string;
  images: { url: string; alt: string }[];
};
const heroScenes = [
  "/vehicles/atlas-landscape.jpg",
  "/vehicles/hero-countryside.jpg",
  "/vehicles/hero-lakeside.jpg",
];
function sceneFor(car: Slide, position: number) {
  const scenes: Record<string, string> = {
    "mercedes-c-class": heroScenes[0],
    "bmw-m2": heroScenes[1],
    "porsche-boxster": heroScenes[2],
  };
  return scenes[car.slug] ?? heroScenes[position % heroScenes.length];
}
export function HeroCarousel({ cars }: { cars: Slide[] }) {
  const [index, setIndex] = useState(0),
    [paused, setPaused] = useState(false),
    [hovered, setHovered] = useState(false),
    [reduced, setReduced] = useState(true);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);
  useEffect(() => {
    if (paused || hovered || reduced || cars.length < 2) return;
    const timer = setInterval(
      () => setIndex((i) => (i + 1) % cars.length),
      6000,
    );
    return () => clearInterval(timer);
  }, [paused, hovered, reduced, cars.length]);
  if (!cars.length)
    return (
      <section className="container empty">
        Our fleet is being prepared.
      </section>
    );
  const car = cars[index % cars.length];
  function change(delta: number) {
    setPaused(true);
    setIndex((i) => (i + delta + cars.length) % cars.length);
  }
  return (
    <section
      className="editorial-hero container"
      aria-roledescription="carousel"
      aria-label="Featured rental cars"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setHovered(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node))
          setHovered(false);
      }}
    >
      <div className="editorial-copy">
        <span className="editorial-eyebrow">
          <Plane size={15} /> MARRAKECH, YOUR WAY.
        </span>
        <h1>
          Your journey.
          <br />
          Your freedom.
          <br />
          <em>Your REWAQ.</em>
        </h1>
        <p>
          Touch down. Take the keys. Discover Morocco.
          <br />
          Your rental car, delivered to Marrakech airport.
        </p>
        <Link href="#rental-search" className="editorial-cta">
          Find your drive <ArrowUpRight size={20} />
        </Link>
        <div className="editorial-line">
          <span />
          <ArrowRight size={19} />
          <span />
        </div>
        <div className="editorial-why">
          <ShieldCheck size={22} />
          <div>
            <strong>A BETTER WAY TO ARRIVE</strong>
            <p>
              Clear rental quotes. A personal airport welcome. No account
              needed.
            </p>
          </div>
        </div>
        <div className="editorial-pagination">
          <strong>{String(index + 1).padStart(2, "0")}</strong>
          <span>/ {String(cars.length).padStart(2, "0")}</span>
          <div className="editorial-arrows">
            <button
              type="button"
              onClick={() => change(-1)}
              aria-label="Previous car"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={() => setPaused((v) => !v)}
              disabled={reduced}
              aria-label={paused ? "Start carousel" : "Pause carousel"}
            >
              {paused ? <Play size={14} /> : <Pause size={14} />}
            </button>
            <button
              type="button"
              onClick={() => change(1)}
              aria-label="Next car"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
      <div className="editorial-stage">
        <div
          key={car.id}
          className="editorial-landscape"
          style={{
            backgroundImage: `linear-gradient(180deg, #103e3810 0%, #103e3800 25%, #103e3855 55%, #153b32eb 100%), url("${sceneFor(car, index)}")`,
          }}
        />
        <span className="editorial-featured">
          FEATURED CAR <span>↗</span>
        </span>
        <span className="editorial-spec">
          <Settings2 size={17} />
          {car.transmission}
        </span>
        <div
          className="editorial-vehicle"
          key={car.id}
          role="group"
          aria-roledescription="slide"
          aria-label={`${index + 1} of ${cars.length}: ${car.brand} ${car.model}`}
        >
          {car.images[0] && (
            <Link
              href={`/cars/${car.slug}`}
              aria-label={`View ${car.brand} ${car.model}`}
            >
              <img src={car.images[0].url} alt={`${car.brand} ${car.model}`} />
            </Link>
          )}
          <Link className="editorial-price" href={`/cars/${car.slug}`}>
            <KeyRound size={25} />
            <span>
              <strong>
                {money(car.dailyPrice)}
                <small> / day</small>
              </strong>
              <span>
                {car.brand} {car.model}
              </span>
            </span>
            <ArrowUpRight size={17} />
          </Link>
        </div>
        <div className="editorial-thumbnails" aria-label="Choose featured car">
          {cars.map((v, i) => (
            <button
              key={v.id}
              type="button"
              aria-label={`Show ${v.brand} ${v.model}`}
              aria-pressed={index === i}
              onClick={() => {
                setPaused(true);
                setIndex(i);
              }}
            >
              <span
                className="editorial-thumb-photo"
                style={{
                  backgroundImage: `linear-gradient(180deg, transparent, #103e3833), url("${sceneFor(v, i)}")`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                {v.images[0] && <img src={v.images[0].url} alt="" />}
              </span>
              <span>
                <CarFront size={13} />
                {v.category}
              </span>
            </button>
          ))}
        </div>
        <div className="editorial-assurances">
          <span>
            <Plane size={14} /> Airport delivery
          </span>
          <span>
            <ShieldCheck size={14} /> Clear rental quote
          </span>
          <span>
            <KeyRound size={14} /> Guest booking
          </span>
          <span>MAD · DH</span>
        </div>
      </div>
    </section>
  );
}
