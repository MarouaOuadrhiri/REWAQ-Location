"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  ChevronLeft,
  Plane,
  ShieldCheck,
  ArrowRight,
  CalendarDays,
  UserRound,
  ClipboardCheck,
} from "lucide-react";
import { AvailabilityCalendar } from "./CustomerTools";
import { rentalQuote, money } from "@/lib/pricing";
import { locations, defaultLocation } from "@/lib/locations";
type Quote = ReturnType<typeof rentalQuote>;
export function BookingForm({
  vehicleId,
  initial = {},
}: {
  vehicleId: string;
  initial?: Record<string, string | undefined>;
}) {
  const router = useRouter();
  const form = useRef<HTMLFormElement>(null);
  const serial = useRef(0);
  const [step, setStep] = useState(1),
    [quote, setQuote] = useState<Quote | null>(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [quoting, setQuoting] = useState(false),
    [review, setReview] = useState<Record<string, FormDataEntryValue>>({});
  async function getQuote(element: HTMLFormElement) {
    const request = ++serial.current;
    setQuote(null);
    setError("");
    const data = Object.fromEntries(new FormData(element));
    if (!data.pickupAt || !data.returnAt) {
      setQuoting(false);
      return;
    }
    setQuoting(true);
    try {
      const r = await fetch("/api/pricing/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicleId,
          pickupAt: data.pickupAt,
          returnAt: data.returnAt,
          pickupLocation: data.pickupLocation,
          returnLocation: data.returnLocation,
        }),
      });
      const v = await r.json();
      if (request !== serial.current) return;
      if (!r.ok) throw new Error(v.error);
      setQuote(v);
    } catch (e) {
      if (request === serial.current) setError((e as Error).message);
    } finally {
      if (request === serial.current) setQuoting(false);
    }
  }
  useEffect(() => {
    if (initial.pickupAt && initial.returnAt && form.current)
      void getQuote(form.current);
    return () => {
      serial.current++;
    };
  }, [vehicleId]);
  function advance() {
    const fields = form.current?.querySelectorAll<
      HTMLInputElement | HTMLSelectElement
    >(`[data-step="${step}"] input,[data-step="${step}"] select`);
    for (const field of fields || []) {
      if (!field.reportValidity()) return;
    }
    if (step === 1 && !quote) return;
    setReview(Object.fromEntries(new FormData(form.current!)));
    setError("");
    setStep(step + 1);
  }
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (step !== 3) return;
    setError("");
    setBusy(true);
    const data = Object.fromEntries(new FormData(e.currentTarget));
    try {
      const r = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          vehicleId,
          customer: {
            fullName: data.fullName,
            phone: data.phone,
            email: data.email,
            identityNumber: data.identityNumber,
            drivingLicense: data.drivingLicense,
          },
        }),
      });
      const result = await r.json();
      if (!r.ok) throw new Error(result.error);
      router.push(`/booking/${result.reference}?token=${result.accessToken}`);
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }
  return (
    <form
      id="reserve"
      ref={form}
      className="panel reservation-panel"
      onSubmit={submit}
      noValidate
    >
      <div className="reservation-heading">
        <div>
          <span className="eyebrow">Your Marrakech rental</span>
          <h3>Make it your next drive</h3>
        </div>
        <ShieldCheck size={24} />
      </div>
      <div className="booking-progress" aria-label="Booking steps">
        {[
          [CalendarDays, "Your trip"],
          [UserRound, "Your details"],
          [ClipboardCheck, "Review"],
        ].map(([Icon, label]: any, i) => (
          <span
            key={label}
            aria-current={step === i + 1 ? "step" : undefined}
            className={step >= i + 1 ? "current" : ""}
          >
            <b>{step > i + 1 ? <Check size={12} /> : i + 1}</b>
            {label}
          </span>
        ))}
      </div>
      <div data-step="1" hidden={step !== 1}>
        <h4>When do you need the car?</h4>
        <AvailabilityCalendar
          vehicleId={vehicleId}
          onSelect={(start, end) => {
            const pickup = form.current?.elements.namedItem(
              "pickupAt",
            ) as HTMLInputElement;
            const back = form.current?.elements.namedItem(
              "returnAt",
            ) as HTMLInputElement;
            if (pickup && back) {
              pickup.value = start;
              back.value = end;
              void getQuote(form.current!);
            }
          }}
        />
        <div className="form-grid">
          <label>
            Pickup date
            <input
              type="date"
              name="pickupAt"
              required
              min={new Date().toISOString().slice(0, 10)}
              defaultValue={initial.pickupAt}
              onChange={(e) => getQuote(e.currentTarget.form!)}
            />
          </label>
          <label>
            Return date
            <input
              type="date"
              name="returnAt"
              required
              defaultValue={initial.returnAt}
              onChange={(e) => getQuote(e.currentTarget.form!)}
            />
          </label>
          <label className="full">
            Pickup location
            <select
              name="pickupLocation"
              onChange={(e) => getQuote(e.currentTarget.form!)}
              defaultValue={
                locations.includes(
                  initial.location as (typeof locations)[number],
                )
                  ? initial.location
                  : defaultLocation
              }
            >
              {locations.map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </label>
          <label className="full">
            Return location
            <select
              onChange={(e) => getQuote(e.currentTarget.form!)}
              name="returnLocation"
              defaultValue={defaultLocation}
            >
              {locations.map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </label>
        </div>
        <button
          type="button"
          className="quote-check"
          disabled={quoting}
          onClick={() => getQuote(form.current!)}
        >
          {quoting
            ? "Checking your dates…"
            : "Check availability & calculate quote"}
        </button>
      </div>
      <div data-step="2" hidden={step !== 2}>
        <h4>Who will be driving?</h4>
        <p className="form-help">
          Book as a guest. Your details stay with your reservation.
        </p>
        <div className="form-grid">
          {[
            ["fullName", "Full name", "text"],
            ["phone", "Phone number", "tel"],
            ["email", "Email address", "email"],
            ["identityNumber", "CIN / Passport number", "text"],
            ["drivingLicense", "Driving license number", "text"],
          ].map(([name, label, type]) => (
            <label className={name === "email" ? "full" : ""} key={name}>
              {label}
              <input
                type={type}
                name={name}
                required
                maxLength={200}
                autoComplete={
                  name === "fullName"
                    ? "name"
                    : name === "email"
                      ? "email"
                      : name === "phone"
                        ? "tel"
                        : "off"
                }
              />
            </label>
          ))}
        </div>
        <div className="flight-fields">
          <h4>
            <Plane size={17} />
            Arriving by plane?
          </h4>
          <p className="form-help">
            Add your flight details to help us coordinate your airport handover.
          </p>
          <div className="form-grid">
            <label>
              Flight number <small>(optional)</small>
              <input
                name="flightNumber"
                maxLength={20}
                placeholder="e.g. FR 1234"
              />
            </label>
            <label>
              Arrival time <small>(Marrakech local)</small>
              <input name="arrivalTime" type="time" />
            </label>
          </div>
        </div>
        <label style={{ marginTop: 18 }}>
          Additional notes
          <textarea
            name="notes"
            maxLength={2000}
            placeholder="Anything we should know about your arrival?"
          />
        </label>
      </div>
      <div data-step="3" hidden={step !== 3}>
        <div className="review-callout">
          <ClipboardCheck size={24} />
          <div>
            <h4>One last look before you request</h4>
            <p>
              Your booking starts as pending. Our team will review it and
              coordinate your collection.
            </p>
          </div>
        </div>
        <dl className="review-details">
          <div>
            <dt>Driver</dt>
            <dd>{String(review.fullName || "")}</dd>
          </div>
          <div>
            <dt>Rental dates</dt>
            <dd>
              {String(review.pickupAt || "")} → {String(review.returnAt || "")}
            </dd>
          </div>
          <div>
            <dt>Pickup</dt>
            <dd>{String(review.pickupLocation || "")}</dd>
          </div>
          <div>
            <dt>Return</dt>
            <dd>{String(review.returnLocation || "")}</dd>
          </div>
          {review.flightNumber && (
            <div>
              <dt>Flight</dt>
              <dd>
                {String(review.flightNumber)} {String(review.arrivalTime || "")}
              </dd>
            </div>
          )}
        </dl>
      </div>
      {quote && (
        <div className="breakdown">
          <p>
            <span>Rental duration</span>
            <strong>{quote.days} days</strong>
          </p>
          {quote.months > 0 && (
            <p>
              <span>
                {quote.months} × 30-day month · {money(quote.monthlyPrice)}
              </span>
              <span>{money(quote.months * quote.monthlyPrice)}</span>
            </p>
          )}
          {quote.weeks > 0 && (
            <p>
              <span>
                {quote.weeks} × week · {money(quote.weeklyPrice)}
              </span>
              <span>{money(quote.weeks * quote.weeklyPrice)}</span>
            </p>
          )}
          {quote.remainder > 0 && (
            <p>
              <span>
                {quote.remainder} × day · {money(quote.dailyPrice)}
              </span>
              <span>{money(quote.remainder * quote.dailyPrice)}</span>
            </p>
          )}
          <p className="discount-row">
            <span>Period discounts</span>
            <span>−{money(quote.discount)}</span>
          </p>
          <p>
            <span>Airport handovers ({quote.airportHandovers})</span>
            <span>
              {quote.airportHandovers === 0
                ? "Not selected"
                : quote.airportFeeKnown
                  ? money(quote.handoverFee)
                  : "To arrange before confirmation"}
            </span>
          </p>
          <p>
            <span>Refundable deposit (separate)</span>
            <span>
              {quote.securityDeposit == null
                ? "To arrange"
                : money(quote.securityDeposit)}
            </span>
          </p>
          {quote.rentalTerms && (
            <details>
              <summary>Rental terms</summary>
              <p style={{ whiteSpace: "pre-wrap", display: "block" }}>
                {quote.rentalTerms}
              </p>
            </details>
          )}
          <p className="total">
            <span>
              {quote.airportHandovers && !quote.airportFeeKnown
                ? "Rental total · delivery to arrange"
                : "Total including configured handover fees"}
            </span>
            <strong>{money(quote.total)}</strong>
          </p>
          <small>Vehicle rental total · MAD / DH</small>
        </div>
      )}
      {error && (
        <div className="error" role="alert">
          {error}
        </div>
      )}
      <div className="booking-actions">
        <span className="mobile-booking-total">
          {quote ? money(quote.total) : "Choose your dates"}
        </span>
        {step > 1 && (
          <button
            type="button"
            className="button light"
            disabled={busy}
            onClick={() => setStep(step - 1)}
          >
            <ChevronLeft size={15} />
            Back
          </button>
        )}
        {step < 3 ? (
          <button
            type="button"
            className="button"
            disabled={step === 1 && (!quote || quoting)}
            key="continue"
            onClick={(event) => {
              event.preventDefault();
              advance();
            }}
          >
            Continue to {step === 1 ? "your details" : "review"}
            <ArrowRight size={16} />
          </button>
        ) : (
          <button
            key="request"
            type="submit"
            className="button"
            disabled={busy}
          >
            {busy ? "Sending request…" : "Request reservation"}
            <ArrowRight size={16} />
          </button>
        )}
      </div>
      <div className="booking-reassurance">
        <Check size={14} />
        <span>No account required · No online payment taken</span>
      </div>
      <p className="pending-explainer">
        Availability and pricing are checked again on submission. Your request
        is confirmed only after our team reviews it.
      </p>
    </form>
  );
}
