"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { money } from "@/lib/pricing";
export async function api(url: string, method: string, data?: unknown) {
  const r = await fetch(url, {
    method,
    headers:
      data instanceof FormData
        ? undefined
        : { "Content-Type": "application/json" },
    body:
      data instanceof FormData ? data : data ? JSON.stringify(data) : undefined,
  });
  const result = await r.json();
  if (!r.ok) throw new Error(result.error || "Request failed");
  return result;
}
function Notice({ error, success }: { error: string; success?: string }) {
  return (
    <>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      {success && (
        <p className="success" role="status">
          {success}
        </p>
      )}
    </>
  );
}
export function VehicleForm({ vehicle }: { vehicle?: any }) {
  const router = useRouter();
  const [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [success, setSuccess] = useState("");
  return (
    <>
      <form
        className="panel"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError("");
          const f = new FormData(e.currentTarget);
          const data: any = Object.fromEntries(f);
          data.archived = f.has("archived");
          data.featured = f.has("featured");
          data.weeklyDiscount =
            data.weeklyDiscount === "" ? null : Number(data.weeklyDiscount);
          data.monthlyDiscount =
            data.monthlyDiscount === "" ? null : Number(data.monthlyDiscount);
          try {
            const result = await api(
              "/api/admin/vehicles" + (vehicle ? "/" + vehicle.id : ""),
              vehicle ? "PATCH" : "POST",
              data,
            );
            if (!vehicle) router.push("/admin/cars/" + result.id);
            else {
              setSuccess("Vehicle saved.");
              router.refresh();
            }
          } catch (e) {
            setError((e as Error).message);
          } finally {
            setBusy(false);
          }
        }}
      >
        <div className="form-grid">
          {[
            ["brand", "Brand"],
            ["model", "Model"],
            ["slug", "URL slug"],
            ["registration", "Registration number"],
            ["year", "Year"],
            ["category", "Category"],
            ["seats", "Seats"],
            ["dailyPrice", "Daily price (DH)"],
            ["weeklyPrice", "Weekly price (DH)"],
            ["monthlyPrice", "Monthly price (DH)"],
            ["weeklyDiscount", "Weekly discount % (blank = default)"],
            ["monthlyDiscount", "Monthly discount % (blank = default)"],
          ].map(([name, title]) => (
            <label key={name}>
              {title}
              <input
                name={name}
                required={!name.includes("Discount")}
                defaultValue={vehicle?.[name] ?? ""}
                type={
                  [
                    "year",
                    "seats",
                    "dailyPrice",
                    "weeklyPrice",
                    "monthlyPrice",
                    "weeklyDiscount",
                    "monthlyDiscount",
                  ].includes(name)
                    ? "number"
                    : "text"
                }
                step={
                  name.includes("Price") || name.includes("Discount")
                    ? ".01"
                    : "1"
                }
              />
            </label>
          ))}
          <label>
            Transmission
            <select name="transmission" defaultValue={vehicle?.transmission}>
              {["Automatic", "Manual"].map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </label>
          <label>
            Fuel
            <select name="fuel" defaultValue={vehicle?.fuel}>
              {["Petrol", "Diesel", "Electric", "Hybrid"].map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </label>
          <label className="full">
            Description
            <textarea
              name="description"
              required
              minLength={10}
              defaultValue={vehicle?.description}
            />
          </label>
          <label>
            <input
              style={{ width: "auto", marginRight: 10 }}
              type="checkbox"
              name="featured"
              defaultChecked={vehicle?.featured}
            />
            Featured in hero
          </label>
          <label>
            <input
              style={{ width: "auto", marginRight: 10 }}
              type="checkbox"
              name="archived"
              defaultChecked={vehicle?.archived}
            />
            Archived (preserves bookings)
          </label>
        </div>
        <Notice error={error} success={success} />
        <button className="button" disabled={busy}>
          {busy ? "Saving…" : "Save vehicle"}
        </button>
      </form>
      {vehicle && (
        <form
          className="panel"
          style={{ marginTop: 25 }}
          onSubmit={async (e) => {
            e.preventDefault();
            setError("");
            setBusy(true);
            const form = e.currentTarget;
            try {
              await api(
                "/api/admin/vehicles/" + vehicle.id + "/images",
                "POST",
                new FormData(form),
              );
              form.reset();
              setSuccess(
                "Photos uploaded. The primary photo appears on vehicle cards.",
              );
              router.refresh();
            } catch (e) {
              setError((e as Error).message);
            } finally {
              setBusy(false);
            }
          }}
        >
          <h3>Vehicle photos</h3>
          <p className="muted">
            The primary photo appears on cards. All photos are available in
            vehicle details. Choose any photo below as the primary image.
          </p>
          <div className="gallery">
            {vehicle.images?.map((v: any, i: number) => (
              <div className="admin-photo-tile" key={v.id}>
                <img src={v.url} alt={v.alt} />
                <button
                  type="button"
                  className={i === 0 ? "badge confirmed" : "button light small"}
                  disabled={busy || i === 0}
                  onClick={async () => {
                    setBusy(true);
                    setError("");
                    try {
                      await api(
                        "/api/admin/vehicles/" + vehicle.id + "/images",
                        "PATCH",
                        { imageId: v.id },
                      );
                      setSuccess("Primary photo updated.");
                      router.refresh();
                    } catch (e) {
                      setError((e as Error).message);
                    } finally {
                      setBusy(false);
                    }
                  }}
                >
                  {i === 0 ? "Primary · shown on cards" : "Set as primary"}
                </button>
              </div>
            ))}
          </div>
          <div className="form-grid">
            <label>
              Photos (up to 12 at a time, 8 MB each, 32 MB total)
              <input
                type="file"
                name="files"
                multiple
                required
                accept="image/png,image/webp,image/jpeg"
              />
            </label>
            <label>
              Photo description
              <input name="alt" required />
            </label>
          </div>
          <label className="photo-primary-checkbox">
            <input type="checkbox" name="makePrimary" />
            Use the first selected photo as the primary image
          </label>
          <Notice error={error} success={success} />
          <button
            className="button light"
            disabled={busy}
            style={{ marginTop: 15 }}
          >
            {busy ? "Uploading…" : "Upload photos"}
          </button>
        </form>
      )}
    </>
  );
}
export function SettingsForm({ settings }: { settings: any }) {
  const router = useRouter();
  const [error, setError] = useState(""),
    [success, setSuccess] = useState("");
  return (
    <form
      className="panel"
      style={{ maxWidth: 750 }}
      onSubmit={async (e) => {
        e.preventDefault();
        setError("");
        const f = new FormData(e.currentTarget);
        try {
          await api("/api/admin/settings", "PATCH", {
            ...Object.fromEntries(f),
            pendingBlocks: f.has("pendingBlocks"),
            airportHandoverFee:
              f.get("airportHandoverFee") === ""
                ? null
                : Number(f.get("airportHandoverFee")),
            securityDeposit:
              f.get("securityDeposit") === ""
                ? null
                : Number(f.get("securityDeposit")),
          });
          setSuccess(
            "Settings saved. Existing booking snapshots are preserved.",
          );
          router.refresh();
        } catch (e) {
          setError((e as Error).message);
        }
      }}
    >
      <div className="form-grid">
        <label>
          Default weekly discount (%)
          <input
            type="number"
            step=".01"
            min="0"
            max="100"
            name="weeklyDiscount"
            required
            defaultValue={settings.weeklyDiscount}
          />
        </label>
        <label>
          Default monthly discount (%)
          <input
            type="number"
            step=".01"
            min="0"
            max="100"
            name="monthlyDiscount"
            required
            defaultValue={settings.monthlyDiscount}
          />
        </label>
        <label>
          Pending hold lifetime (hours)
          <input
            type="number"
            min="1"
            max="720"
            name="pendingExpiryHours"
            required
            defaultValue={settings.pendingExpiryHours}
          />
        </label>
        <label>
          <input
            type="checkbox"
            name="pendingBlocks"
            defaultChecked={settings.pendingBlocks}
            style={{ width: "auto", marginRight: 10 }}
          />
          Pending requests block availability
        </label>
        <label>
          Airport fee per handover (DH, blank = to arrange)
          <input
            type="number"
            step=".01"
            min="0"
            name="airportHandoverFee"
            defaultValue={settings.airportHandoverFee ?? ""}
          />
        </label>
        <label>
          Refundable security deposit (DH, blank = to arrange)
          <input
            type="number"
            step=".01"
            min="0"
            name="securityDeposit"
            defaultValue={settings.securityDeposit ?? ""}
          />
        </label>
        <label className="full">
          Rental terms: insurance, fuel, driver requirements and cancellation
          <textarea
            name="rentalTerms"
            maxLength={10000}
            defaultValue={settings.rentalTerms ?? ""}
          />
        </label>
      </div>
      <p className="muted">
        Currency: MAD / DH. A month is 30 days; a week is 7 days.
        Vehicle-specific discounts override these defaults. Expiration changes
        apply to new requests.
      </p>
      <Notice error={error} success={success} />
      <button className="button">Save settings</button>
    </form>
  );
}
export function ReservationForm({
  reservation,
  cars,
}: {
  reservation: any;
  cars: any[];
}) {
  const router = useRouter();
  const [error, setError] = useState(""),
    [success, setSuccess] = useState("");
  const editable = ["PENDING", "CONFIRMED", "ACTIVE"].includes(
    reservation.status,
  );
  const [quote, setQuote] = useState<any>(null);
  return (
    <>
      <form
        className="panel"
        onSubmit={async (e) => {
          e.preventDefault();
          setError("");
          try {
            await api(
              "/api/admin/reservations/" + reservation.id,
              "PATCH",
              Object.fromEntries(new FormData(e.currentTarget)),
            );
            setSuccess(
              "Reservation updated. Availability validated and price recalculated.",
            );
            setQuote(null);
            router.refresh();
          } catch (e) {
            setError((e as Error).message);
          }
        }}
      >
        <h3>Reservation details</h3>
        <div className="form-grid">
          <label>
            Vehicle
            <select
              name="vehicleId"
              defaultValue={reservation.vehicleId}
              disabled={!editable}
            >
              {cars.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.brand} {v.model}
                  {v.archived ? " (archived)" : ""}
                </option>
              ))}
            </select>
          </label>
          <label>
            Status
            <select
              name="status"
              defaultValue={reservation.status}
              disabled={!editable}
            >
              {[
                "PENDING",
                "CONFIRMED",
                "ACTIVE",
                "COMPLETED",
                "CANCELLED",
                "REJECTED",
                "EXPIRED",
              ].map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </label>
          <label>
            Pickup
            <input
              type="date"
              name="pickupAt"
              required
              disabled={!editable}
              defaultValue={reservation.pickupAt.slice(0, 10)}
            />
          </label>
          <label>
            Return
            <input
              type="date"
              name="returnAt"
              required
              disabled={!editable}
              defaultValue={reservation.returnAt.slice(0, 10)}
            />
          </label>
          <label>
            Pickup location
            <input
              name="pickupLocation"
              required
              disabled={!editable}
              defaultValue={reservation.pickupLocation}
            />
          </label>
          <label>
            Return location
            <input
              name="returnLocation"
              required
              disabled={!editable}
              defaultValue={reservation.returnLocation}
            />
          </label>
          <label>
            Flight number
            <input
              name="flightNumber"
              maxLength={20}
              disabled={!editable}
              defaultValue={reservation.flightNumber ?? ""}
            />
          </label>
          <label>
            Arrival time (Marrakech)
            <input
              name="arrivalTime"
              type="time"
              disabled={!editable}
              defaultValue={reservation.arrivalTime ?? ""}
            />
          </label>
          <label className="full">
            Meeting point shared with customer
            <input
              name="meetingPoint"
              maxLength={200}
              disabled={!editable}
              defaultValue={reservation.meetingPoint ?? ""}
            />
          </label>
          <label className="full">
            Internal notes
            <textarea
              name="internalNotes"
              disabled={!editable}
              defaultValue={reservation.internalNotes ?? ""}
            />
          </label>
        </div>
        <div className="breakdown">
          <p>
            <span>Stored duration</span>
            <span>{reservation.days} days</span>
          </p>
          <p className="total">
            <span>Stored total</span>
            <span>{money(reservation.total)}</span>
          </p>
          {quote && (
            <p>
              <span>New calculated total</span>
              <span>{money(quote.total)}</span>
            </p>
          )}
        </div>
        <Notice error={error} success={success} />
        {editable ? (
          <button className="button">Validate, recalculate & save</button>
        ) : (
          <p className="muted">
            Historical reservation. Changes are disabled to preserve the booking
            record.
          </p>
        )}
      </form>
      <div className="panel" style={{ marginTop: 25 }}>
        <h3>Customer</h3>
        <p>
          {reservation.customer.fullName} · {reservation.customer.phone}
          <br />
          {reservation.customer.email}
        </p>
        <small>
          Identity: {reservation.customer.identityNumber} · License:{" "}
          {reservation.customer.drivingLicense}
        </small>
        <p className="muted">{reservation.notes}</p>
        <details>
          <summary>Original customer snapshot</summary>
          <pre style={{ whiteSpace: "pre-wrap" }}>
            {JSON.stringify(reservation.originalCustomer, null, 2)}
          </pre>
        </details>
      </div>
      <PaymentForm reservationId={reservation.id} />
      <div className="panel" style={{ marginTop: 25 }}>
        <h3>Modification history</h3>
        {reservation.history.map((v: any) => (
          <details
            key={v.id}
            style={{ borderTop: "1px solid #E4DCD0", padding: "15px 0" }}
          >
            <summary>
              {v.action} · {v.createdAt.slice(0, 16).replace("T", " ")} UTC
            </summary>
            <pre style={{ whiteSpace: "pre-wrap", fontSize: 11 }}>
              {JSON.stringify({ before: v.before, after: v.after }, null, 2)}
            </pre>
          </details>
        ))}
      </div>
    </>
  );
}
function PaymentForm({ reservationId }: { reservationId: string }) {
  const router = useRouter();
  const [error, setError] = useState(""),
    [success, setSuccess] = useState("");
  return (
    <form
      className="panel"
      style={{ marginTop: 25 }}
      onSubmit={async (e) => {
        e.preventDefault();
        setError("");
        const form = e.currentTarget;
        try {
          await api("/api/admin/payments", "POST", {
            reservationId,
            ...Object.fromEntries(new FormData(form)),
          });
          setSuccess("Payment recorded.");
          form.reset();
          router.refresh();
        } catch (e) {
          setError((e as Error).message);
        }
      }}
    >
      <h3>Record a payment or refund</h3>
      <p className="muted">
        Ledger entry only. This does not charge a card or send money.
      </p>
      <label>
        Type
        <select name="kind">
          <option value="RENTAL">Rental payment / advance</option>
          <option value="RENTAL_REFUND">Rental refund</option>
          <option value="DEPOSIT">Security deposit received</option>
          <option value="DEPOSIT_REFUND">Security deposit returned</option>
        </select>
      </label>
      <label>
        Reference / memo
        <input name="memo" maxLength={190} />
      </label>
      <div className="form-grid">
        <label>
          Amount (DH)
          <input name="amount" type="number" min=".01" step=".01" required />
        </label>
        <label>
          Method
          <select name="method">
            <option>Cash</option>
            <option>Bank transfer</option>
            <option>Card</option>
          </select>
        </label>
      </div>
      <Notice error={error} success={success} />
      <button className="button light" style={{ marginTop: 15 }}>
        Record payment
      </button>
    </form>
  );
}
export function CustomerForm({ customer }: { customer: any }) {
  const router = useRouter();
  const [error, setError] = useState(""),
    [success, setSuccess] = useState("");
  return (
    <form
      className="panel"
      onSubmit={async (e) => {
        e.preventDefault();
        try {
          await api(
            "/api/admin/customers/" + customer.id,
            "PATCH",
            Object.fromEntries(new FormData(e.currentTarget)),
          );
          setSuccess("Customer updated. Booking snapshots are unchanged.");
          router.refresh();
        } catch (e) {
          setError((e as Error).message);
        }
      }}
    >
      <div className="form-grid">
        {[
          ["fullName", "Full name"],
          ["email", "Email"],
          ["phone", "Phone"],
          ["identityNumber", "CIN / Passport"],
          ["drivingLicense", "License"],
        ].map(([name, title]) => (
          <label key={name}>
            {title}
            <input name={name} required defaultValue={customer[name]} />
          </label>
        ))}
      </div>
      <Notice error={error} success={success} />
      <button className="button">Save customer</button>
    </form>
  );
}
export function BlockForm({ cars }: { cars: any[] }) {
  const router = useRouter();
  const [error, setError] = useState(""),
    [success, setSuccess] = useState("");
  return (
    <form
      className="panel"
      style={{ marginTop: 25 }}
      onSubmit={async (e) => {
        e.preventDefault();
        setError("");
        try {
          await api(
            "/api/admin/calendar",
            "POST",
            Object.fromEntries(new FormData(e.currentTarget)),
          );
          setSuccess("Dates blocked.");
          router.refresh();
        } catch (e) {
          setError((e as Error).message);
        }
      }}
    >
      <h3>Block dates or schedule maintenance</h3>
      <div className="form-grid">
        <label>
          Vehicle
          <select name="vehicleId" required>
            {cars.map((v) => (
              <option key={v.id} value={v.id}>
                {v.brand} {v.model}
              </option>
            ))}
          </select>
        </label>
        <label>
          Type
          <select name="kind">
            <option value="MANUAL">Manual block</option>
            <option value="MAINTENANCE">Maintenance</option>
          </select>
        </label>
        <label>
          Start
          <input type="date" name="startAt" required />
        </label>
        <label>
          End (exclusive)
          <input type="date" name="endAt" required />
        </label>
        <label className="full">
          Reason
          <input name="reason" minLength={3} required />
        </label>
      </div>
      <Notice error={error} success={success} />
      <button className="button" style={{ marginTop: 15 }}>
        Validate & block dates
      </button>
      <Link
        href="/cars"
        className="button light"
        style={{ margin: "15px 0 0 15px" }}
      >
        Create manual reservation ↗
      </Link>
    </form>
  );
}
export function CancelBlock({ id }: { id: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  return (
    <>
      <button
        className="text-link"
        onClick={async () => {
          try {
            await api("/api/admin/calendar/" + id, "PATCH", {});
            router.refresh();
          } catch (e) {
            setError((e as Error).message);
          }
        }}
      >
        Release dates
      </button>
      {error && <span className="error">{error}</span>}
    </>
  );
}
