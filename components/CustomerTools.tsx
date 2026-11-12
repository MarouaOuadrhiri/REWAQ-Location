"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
export function CustomerRequest({
  reference,
  token,
  requests,
  enabled,
}: {
  reference: string;
  token: string;
  requests: any[];
  enabled: boolean;
}) {
  const router = useRouter(),
    [error, setError] = useState(""),
    [success, setSuccess] = useState(""),
    [busy, setBusy] = useState(false);
  return (
    <section className="panel customer-requests">
      <h3>Need to change your plans?</h3>
      <p className="muted">
        Send a change or cancellation request. Your existing dates and status
        remain in place until our team reviews and applies it.
      </p>
      {requests.map((r) => (
        <article key={r.id}>
          <strong>
            {r.kind} · {r.status}
          </strong>
          <p>{r.message}</p>
          {r.response && <p className="success">Team reply: {r.response}</p>}
        </article>
      ))}
      {enabled && !requests.some((r) => r.status === "OPEN") && (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            setError("");
            try {
              const res = await fetch("/api/booking-requests", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  reference,
                  token,
                  ...Object.fromEntries(new FormData(e.currentTarget)),
                }),
              });
              const data = await res.json();
              if (!res.ok) throw new Error(data.error);
              setSuccess("Your request has been saved for review.");
              router.refresh();
            } catch (e) {
              setError((e as Error).message);
            } finally {
              setBusy(false);
            }
          }}
        >
          <label>
            Request type
            <select name="kind">
              <option value="CHANGE">Change my reservation</option>
              <option value="CANCEL">Request cancellation</option>
            </select>
          </label>
          <label>
            Tell us what you need
            <textarea
              name="message"
              required
              minLength={10}
              maxLength={2000}
              placeholder="For a date change, include your preferred pickup and return dates."
            />
          </label>
          {error && (
            <p role="alert" className="error">
              {error}
            </p>
          )}
          {success && (
            <p role="status" className="success">
              {success}
            </p>
          )}
          <button className="button" disabled={busy}>
            {busy ? "Sending…" : "Send request"}
          </button>
        </form>
      )}
    </section>
  );
}
export function AvailabilityCalendar({
  vehicleId,
  onSelect,
}: {
  vehicleId: string;
  onSelect?: (start: string, end: string) => void;
}) {
  const [data, setData] = useState<any>(null),
    [month, setMonth] = useState(new Date().toISOString().slice(0, 7)),
    [error, setError] = useState(""),
    [selected, setSelected] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/availability/" + vehicleId, {
      signal: controller.signal,
      cache: "no-store",
    })
      .then(async (r) => {
        const v = await r.json();
        if (!r.ok) throw new Error(v.error);
        setData(v);
      })
      .catch((e) => {
        if (e.name !== "AbortError") setError(e.message);
      });
    return () => controller.abort();
  }, [vehicleId]);
  const first = new Date(month + "-01T00:00:00Z"),
    days = new Date(
      Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0),
    ).getUTCDate();
  const blocked = (day: string) =>
    !data ||
    data.unavailable.some(
      (v: any) =>
        new Date(v.start) < new Date(+new Date(day) + 86400000) &&
        new Date(v.end) > new Date(day),
    );
  return (
    <section className="public-availability">
      <div>
        <h4>Availability at a glance</h4>
        <label>
          Month
          <input
            aria-label="Availability month"
            type="month"
            min={data?.start?.slice(0, 7)}
            max={data?.end?.slice(0, 7)}
            value={month}
            onChange={(e) => {
              if (/^\d{4}-\d{2}$/.test(e.target.value)) {
                setMonth(e.target.value);
                setSelected("");
              }
            }}
          />
        </label>
      </div>
      {error ? (
        <p className="error" role="alert">
          {error}
        </p>
      ) : !data ? (
        <p role="status">Loading availability…</p>
      ) : (
        <>
          <div className="availability-days">
            {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
              <span key={"label" + i}>{d}</span>
            ))}
            {Array.from({ length: first.getUTCDay() }, (_, i) => (
              <span key={"blank" + i} />
            ))}
            {Array.from({ length: days }, (_, i) => {
              const day = month + "-" + String(i + 1).padStart(2, "0"),
                past = day < data.start.slice(0, 10),
                outside = day >= data.end.slice(0, 10),
                unavailable = blocked(day);
              return (
                <button
                  key={day}
                  type="button"
                  disabled={past || outside || unavailable}
                  className={
                    (unavailable ? "unavailable " : "") +
                    (selected === day ? "selected" : "")
                  }
                  aria-label={
                    day + (unavailable ? " unavailable" : " select date")
                  }
                  onClick={() => {
                    if (selected && day > selected) {
                      let cursor = new Date(selected);
                      while (cursor < new Date(day)) {
                        if (blocked(cursor.toISOString().slice(0, 10))) {
                          setSelected(day);
                          return;
                        }
                        cursor = new Date(+cursor + 86400000);
                      }
                      onSelect?.(selected, day);
                      setSelected("");
                    } else setSelected(day);
                  }}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>
          <small>
            Crossed dates are unavailable. Select pickup, then return. Final
            availability is checked when quoting and booking. A return may fall
            on a blocked day; use the date fields for that boundary.
          </small>
          {selected && (
            <p className="muted">
              Pickup: {selected}. Choose a later return date.
            </p>
          )}
        </>
      )}
    </section>
  );
}
