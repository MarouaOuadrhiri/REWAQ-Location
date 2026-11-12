import { CalendarDays, Plane, Search } from "lucide-react";
import { locations, defaultLocation } from "@/lib/locations";
export function SearchBar({
  values = {},
}: {
  values?: Record<string, string | undefined>;
}) {
  return (
    <form className="booking-search" action="/cars">
      <label>
        <span>
          <Plane size={19} />
          Pick-up location
        </span>
        <select
          name="location"
          defaultValue={values.location || defaultLocation}
        >
          {locations.map((v) => (
            <option key={v}>{v}</option>
          ))}
        </select>
      </label>
      <label>
        <span>
          <CalendarDays size={18} />
          Pick-up date
        </span>
        <input
          name="pickupAt"
          type="date"
          required
          min={new Date().toISOString().slice(0, 10)}
          defaultValue={values.pickupAt}
        />
      </label>
      <label>
        <span>
          <CalendarDays size={18} />
          Return date
        </span>
        <input
          name="returnAt"
          type="date"
          required
          defaultValue={values.returnAt}
        />
      </label>
      <button className="button">
        <Search size={19} />
        Search cars
      </button>
    </form>
  );
}
