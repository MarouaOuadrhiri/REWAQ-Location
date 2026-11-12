import Link from "next/link";
import { db } from "@/lib/db";
import { settings } from "@/lib/reservations";
import { money } from "@/lib/pricing";
export default async function Pricing() {
  const cars = await db.vehicle.findMany({ where: { archived: false } });
  const config = await settings();
  return (
    <>
      <div className="eyebrow">A transparent approach</div>
      <h1>Pricing</h1>
      <p className="muted">
        Full 30-day months, then 7-day weeks, then remaining days. Discounts
        apply to period rates.
      </p>
      <div className="admin-toolbar">
        <span>
          Defaults: {Number(config.weeklyDiscount)}% weekly ·{" "}
          {Number(config.monthlyDiscount)}% monthly
        </span>
        <Link href="/admin/settings" className="button light">
          Edit defaults
        </Link>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              {[
                "Vehicle",
                "Daily",
                "Weekly",
                "Monthly",
                "Weekly discount",
                "Monthly discount",
                "",
              ].map((v) => (
                <th key={v}>{v}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cars.map((v) => (
              <tr key={v.id}>
                <td>
                  {v.brand} {v.model}
                </td>
                <td>{money(v.dailyPrice)}</td>
                <td>{money(v.weeklyPrice)}</td>
                <td>{money(v.monthlyPrice)}</td>
                <td>{Number(v.weeklyDiscount ?? config.weeklyDiscount)}%</td>
                <td>{Number(v.monthlyDiscount ?? config.monthlyDiscount)}%</td>
                <td>
                  <Link className="text-link" href={"/admin/cars/" + v.id}>
                    Edit rates ↗
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
