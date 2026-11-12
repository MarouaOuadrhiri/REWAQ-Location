"use client";
import { useRef, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Car } from "./CarCard";
import { money } from "@/lib/pricing";
export function Hero({ cars }: { cars: Car[] }) {
  const root = useRef<HTMLElement>(null);
  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();
    mm.add(
      "(min-width: 701px) and (prefers-reduced-motion: no-preference)",
      () => {
        const scenes = gsap.utils.toArray<HTMLElement>(
          ".hero-scene",
          root.current,
        );
        if (scenes.length < 2) return;
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: "+=900",
            pin: true,
            scrub: 1,
          },
        });
        scenes.forEach((scene, i) => {
          if (i === 0) return;
          tl.to(scenes[i - 1], {
            autoAlpha: 0,
            x: -100,
            duration: 0.55,
          }).fromTo(
            scene,
            { autoAlpha: 0, x: i === 2 ? -100 : 120, scale: 0.96 },
            { autoAlpha: 1, x: 0, scale: 1, duration: 0.75 },
            "-=.3",
          );
        });
        tl.to({}, { duration: 0.3 });
      },
    );
    return () => mm.revert();
  }, [cars]);
  return (
    <section className="hero" ref={root}>
      <div className="container">
        <div className="hero-top">
          <div className="eyebrow">A closer look at the collection</div>
          <h2>
            Extraordinary cars.
            <br />
            <em>Unforgettable roads.</em>
          </h2>
          <p>
            From Marrakech to your next adventure.
            <br />A carefully selected collection. An effortless experience.
          </p>
        </div>
        <div className="hero-stage">
          {cars.map((car, i) => (
            <div className="hero-scene" key={car.id}>
              <div className="hero-info">
                <div>
                  <small>0{i + 1} / THE COLLECTION</small>
                  <h3>
                    {car.brand} {car.model}
                  </h3>
                  <p className="price">
                    {money(car.dailyPrice)} <small>/ day</small>
                  </p>
                </div>
                <Link className="button outline" href={`/cars/${car.slug}`}>
                  View details <ArrowUpRight size={14} />
                </Link>
              </div>
              {car.images[0] && (
                <img
                  className="hero-car"
                  src={car.images[0].url}
                  alt={car.images[0].alt}
                />
              )}
            </div>
          ))}
        </div>
        <div className="hero-index">
          <span>01</span>
          <i />
          <span>SCROLL TO EXPLORE THE COLLECTION</span>
          <span style={{ marginLeft: "auto" }}>MARRAKECH · REWAQ Location</span>
        </div>
      </div>
    </section>
  );
}
