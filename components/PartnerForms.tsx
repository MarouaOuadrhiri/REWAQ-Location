"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "./AdminForms";
export function PartnerProfileForm({
  agency,
}: {
  agency: {
    name: string;
    phone: string;
    city: string;
    address: string | null;
    email: string;
  };
}) {
  const router = useRouter(),
    [error, setError] = useState(""),
    [success, setSuccess] = useState(""),
    [busy, setBusy] = useState(false);
  return (
    <form
      className="panel partner-profile-form"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setError("");
        try {
          await api(
            "/api/partner/profile",
            "PATCH",
            Object.fromEntries(new FormData(e.currentTarget)),
          );
          setSuccess("Les informations de votre agence sont enregistrées.");
          router.refresh();
        } catch (e) {
          setError((e as Error).message);
        } finally {
          setBusy(false);
        }
      }}
    >
      <div className="form-grid">
        {[
          ["name", "Nom de l’agence"],
          ["phone", "Téléphone"],
          ["city", "Ville"],
        ].map(([name, label]) => (
          <label key={name}>
            {label}
            <input
              name={name}
              required
              defaultValue={agency[name as "name" | "phone" | "city"]}
            />
          </label>
        ))}
        <label>
          Email de connexion
          <input value={agency.email} readOnly />
        </label>
        <label className="full">
          Adresse
          <textarea
            name="address"
            maxLength={2000}
            defaultValue={agency.address ?? ""}
          />
        </label>
      </div>
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
      <button className="button partner-primary" disabled={busy}>
        {busy ? "Enregistrement…" : "Enregistrer mon agence ↗"}
      </button>
    </form>
  );
}
export function AgencyAdminForm({
  agency,
  defaultRate,
}: {
  agency: { id: string; status: string; commissionOverride: string | null };
  defaultRate: number;
}) {
  const router = useRouter(),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  return (
    <form
      className="agency-admin-form"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setError("");
        const f = new FormData(e.currentTarget);
        try {
          await api("/api/admin/agencies/" + agency.id, "PATCH", {
            status: f.get("status"),
            commissionOverride:
              f.get("commissionOverride") === ""
                ? null
                : Number(f.get("commissionOverride")),
          });
          router.refresh();
        } catch (e) {
          setError((e as Error).message);
        } finally {
          setBusy(false);
        }
      }}
    >
      <label>
        Account status
        <select name="status" defaultValue={agency.status}>
          <option value="PENDING">Pending review</option>
          <option value="ACTIVE">Active</option>
          <option value="SUSPENDED">Suspended</option>
        </select>
      </label>
      <label>
        Markup override (%)
        <input
          name="commissionOverride"
          type="number"
          min="0"
          max="100"
          step=".01"
          defaultValue={agency.commissionOverride ?? ""}
          placeholder={"Default " + defaultRate + "%"}
        />
      </label>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      <button className="button small" disabled={busy}>
        {busy ? "Saving…" : "Save agency"}
      </button>
    </form>
  );
}
export function ListingReview({
  vehicle,
}: {
  vehicle: { id: string; listingStatus: string };
}) {
  const router = useRouter(),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  return (
    <div className="listing-review">
      <span
        className={
          "badge " +
          (vehicle.listingStatus === "APPROVED" ? "confirmed" : "pending")
        }
      >
        {vehicle.listingStatus}
      </span>
      <div>
        {[
          ["APPROVED", "Approve"],
          ["REJECTED", "Reject"],
          ["PENDING", "Return to review"],
        ]
          .filter(([s]) => s !== vehicle.listingStatus)
          .map(([status, label]) => (
            <button
              key={status}
              className="button light small"
              disabled={busy}
              type="button"
              onClick={async () => {
                setBusy(true);
                setError("");
                try {
                  await api(
                    "/api/admin/vehicles/" + vehicle.id + "/review",
                    "PATCH",
                    { listingStatus: status },
                  );
                  router.refresh();
                } catch (e) {
                  setError((e as Error).message);
                } finally {
                  setBusy(false);
                }
              }}
            >
              {label}
            </button>
          ))}
      </div>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
