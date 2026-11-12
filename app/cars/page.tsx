import Link from "next/link";
import { Plane, SlidersHorizontal, ArrowRight, MapPin } from "lucide-react";
import { db } from "@/lib/db";
import { calculate, dates } from "@/lib/pricing";
import { settings } from "@/lib/reservations";
import { Header, Footer } from "@/components/PublicShell";
import { SearchBar } from "@/components/SearchBar";
import { CarResult } from "@/components/CarResult";
import { defaultLocation } from "@/lib/locations";
import { ResponsiveFilters } from "@/components/ResponsiveFilters";
export const dynamic = "force-dynamic";
export default async function Fleet({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const q = await searchParams;
  let error = "",
    period: ReturnType<typeof dates> | undefined;
  try {
    if (Boolean(q.pickupAt) !== Boolean(q.returnAt))
      throw new Error(
        "Select both pickup and return dates to check availability.",
      );
    if (q.pickupAt && q.returnAt) period = dates(q.pickupAt, q.returnAt);
  } catch (e) {
    error = (e as Error).message;
  }
  const [config, all] = await Promise.all([
    settings(),
    db.vehicle.findMany({
      where: { archived: false },
      select: { brand: true, category: true },
    }),
  ]);
  const cars = error
    ? []
    : await db.vehicle.findMany({
        where: {
          archived: false,
          brand: q.brand || undefined,
          category: q.category || undefined,
          transmission: q.transmission || undefined,
          fuel: q.fuel || undefined,
          seats: q.seats
            ? {
                gte: Math.max(
                  1,
                  Math.min(20, Math.floor(Number(q.seats) || 1)),
                ),
              }
            : undefined,
          dailyPrice:
            q.price && Number(q.price) > 0
              ? { lte: Number(q.price) }
              : undefined,
          ...(period
            ? {
                reservations: {
                  none: {
                    pickupAt: { lt: period.returnAt },
                    returnAt: { gt: period.pickupAt },
                    OR: [
                      { status: { in: ["CONFIRMED", "ACTIVE"] } },
                      ...(config.pendingBlocks
                        ? [
                            {
                              status: "PENDING" as const,
                              expiresAt: { gt: new Date() },
                            },
                          ]
                        : []),
                    ],
                  },
                },
                maintenance: {
                  none: {
                    cancelledAt: null,
                    startAt: { lt: period.returnAt },
                    endAt: { gt: period.pickupAt },
                  },
                },
              }
            : {}),
        },
        include: { images: { orderBy: { position: "asc" } } },
        orderBy:
          q.sort === "price-desc"
            ? { dailyPrice: "desc" }
            : q.sort === "brand"
              ? { brand: "asc" }
              : { dailyPrice: "asc" },
      });
  const query = new URLSearchParams();
  for (const key of ["pickupAt", "returnAt", "location"])
    if (q[key]) query.set(key, q[key]!);
  return (
    <>
      <Header />
      <div className="results-search">
        <div className="container">
          <SearchBar values={q} />
        </div>
      </div>
      <main id="main-content" className="container results-main">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span>›</span>
          <span>Morocco</span>
          <span>›</span>
          <span>Marrakech car rentals</span>
        </nav>
        <div className="results-layout">
          <aside className="results-sidebar">
            <div className="pickup-card">
              <Plane size={24} />
              <h3>Your Marrakech arrival</h3>
              <p>{q.location || defaultLocation}</p>
              <span>Airport handover arranged with our team</span>
            </div>
            <ResponsiveFilters>
              <form className="filter-panel">
                <h3>
                  <SlidersHorizontal size={17} />
                  Filter your search
                </h3>
                {["pickupAt", "returnAt", "location"].map((key) => (
                  <input
                    key={key}
                    type="hidden"
                    name={key}
                    value={q[key] || ""}
                  />
                ))}
                <label>
                  Brand
                  <select name="brand" defaultValue={q.brand}>
                    <option value="">All brands</option>
                    {[...new Set(all.map((v) => v.brand))].map((v) => (
                      <option key={v}>{v}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Category
                  <select name="category" defaultValue={q.category}>
                    <option value="">All categories</option>
                    {[...new Set(all.map((v) => v.category))].map((v) => (
                      <option key={v}>{v}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Transmission
                  <select name="transmission" defaultValue={q.transmission}>
                    <option value="">Any transmission</option>
                    <option>Automatic</option>
                    <option>Manual</option>
                  </select>
                </label>
                <label>
                  Fuel
                  <select name="fuel" defaultValue={q.fuel}>
                    <option value="">Any fuel</option>
                    {["Petrol", "Diesel", "Hybrid", "Electric"].map((v) => (
                      <option key={v}>{v}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Maximum daily price (DH)
                  <input
                    name="price"
                    type="number"
                    min="1"
                    defaultValue={q.price}
                    placeholder="No limit"
                  />
                </label>
                <label>
                  Minimum seats
                  <input
                    name="seats"
                    type="number"
                    min="1"
                    max="20"
                    defaultValue={q.seats}
                    placeholder="Any"
                  />
                </label>
                <label>
                  Sort results
                  <select name="sort" defaultValue={q.sort}>
                    <option value="price-asc">Daily price: lowest first</option>
                    <option value="price-desc">
                      Daily price: highest first
                    </option>
                    <option value="brand">Brand: A–Z</option>
                  </select>
                </label>
                <button className="button">Apply filters</button>
                <Link
                  className="filter-reset"
                  href={"/cars?" + query.toString()}
                >
                  Reset filters
                </Link>
              </form>
            </ResponsiveFilters>
          </aside>
          <section className="results-content">
            <div className="result-page-heading">
              <div>
                <h1>Marrakech: find your next drive</h1>
                <p>
                  {cars.length} cars{" "}
                  {period ? "available for your dates" : "in our collection"}
                  {period ? ` · ${period.days} days` : ""}
                </p>
              </div>
              <span className="location-chip">
                <MapPin size={14} />
                Marrakech
              </span>
            </div>
            <div className="result-information">
              <Plane size={22} />
              <div>
                <strong>Flying in from Europe?</strong>
                <p>
                  Your car can meet you at Marrakech Menara Airport. Add your
                  flight details when you reserve.
                </p>
              </div>
            </div>
            {!period && !error && (
              <p className="date-prompt">
                Choose your dates above to see availability and the full rental
                price.
              </p>
            )}
            {error && (
              <p className="error" role="alert">
                {error}
              </p>
            )}
            <div className="result-list">
              {cars.map((car) => (
                <CarResult
                  key={car.id}
                  car={car}
                  days={period?.days}
                  total={
                    period
                      ? calculate(car, config, period.pickupAt, period.returnAt)
                          .total
                      : undefined
                  }
                  query={query.toString()}
                />
              ))}
            </div>
            {!cars.length && !error && (
              <div className="panel empty">
                <h2>No cars match this search</h2>
                <p>
                  Try different dates or remove a filter. Your next drive may be
                  one adjustment away.
                </p>
                <Link className="button" href="/cars">
                  See the full fleet <ArrowRight size={16} />
                </Link>
              </div>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
