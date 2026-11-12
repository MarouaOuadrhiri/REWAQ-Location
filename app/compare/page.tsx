import { db } from "@/lib/db";
import { Header, Footer } from "@/components/PublicShell";
import { CompareCars } from "@/components/CompareCars";
export const dynamic = "force-dynamic";
export default async function Compare({
  searchParams,
}: {
  searchParams: Promise<{
    car?: string | string[];
    selection?: string;
    pickupAt?: string;
    returnAt?: string;
  }>;
}) {
  const q = await searchParams,
    cars = await db.vehicle.findMany({
      where: { archived: false },
      include: { images: { orderBy: { position: "asc" }, take: 1 } },
      orderBy: [{ featured: "desc" }, { createdAt: "asc" }],
    });
  const requested = Array.isArray(q.car)
    ? q.car
    : q.car
      ? [q.car]
      : q.selection === "custom"
        ? []
        : cars.slice(0, 3).map((c) => c.id);
  const ids = [...new Set(requested)]
    .filter((id) => cars.some((c) => c.id === id))
    .slice(0, 3);
  const validDate = (s?: string) =>
    s && /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s)) ? s : "";
  return (
    <>
      <Header />
      <main
        id="main-content"
        className="container compare-photo-page"
        lang="fr"
      >
        <div className="compare-photo-intro">
          <div>
            <span className="eyebrow">
              Le bon choix commence par une comparaison
            </span>
            <h1>
              Trois caractères.
              <br />
              Votre prochain coup de cœur.
            </h1>
          </div>
          <p>
            Découvrez les voitures en images.
            <br />
            Gardez les critères essentiels sous les yeux.
          </p>
        </div>
        <CompareCars
          key={ids.join(",")}
          cars={JSON.parse(JSON.stringify(cars))}
          initialIds={ids}
          initialPickup={validDate(q.pickupAt)}
          initialReturn={validDate(q.returnAt)}
        />
      </main>
      <Footer />
    </>
  );
}
