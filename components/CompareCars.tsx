"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { ArrowUpRight, X, SlidersHorizontal, Plus } from "lucide-react";
import { money } from "@/lib/pricing";
type CompareVehicle = {
  id: string;
  slug: string;
  brand: string;
  model: string;
  category: string;
  transmission: string;
  fuel: string;
  seats: number;
  dailyPrice: string;
  images: { url: string; alt: string }[];
};
export function CompareCars({
  cars,
  initialIds,
  initialPickup = "",
  initialReturn = "",
}: {
  cars: CompareVehicle[];
  initialIds: string[];
  initialPickup?: string;
  initialReturn?: string;
}) {
  const router = useRouter(),
    dialog = useRef<HTMLDialogElement>(null),
    [selectedIds, setSelectedIds] = useState(initialIds),
    [draft, setDraft] = useState(initialIds),
    [pickup, setPickup] = useState(initialPickup),
    [back, setBack] = useState(initialReturn),
    [error, setError] = useState("");
  const selected = selectedIds
    .map((id) => cars.find((c) => c.id === id))
    .filter((c): c is CompareVehicle => !!c);
  function update(ids: string[], start = pickup, end = back) {
    setSelectedIds(ids);
    const q = new URLSearchParams({ selection: "custom" });
    ids.forEach((id) => q.append("car", id));
    if (start) q.set("pickupAt", start);
    if (end) q.set("returnAt", end);
    router.replace("/compare?" + q.toString(), { scroll: false });
  }
  function edit() {
    setDraft(selectedIds);
    dialog.current?.showModal();
  }
  function vehicleUrl(slug: string) {
    const q = new URLSearchParams();
    if (pickup && back) {
      q.set("pickupAt", pickup);
      q.set("returnAt", back);
    }
    return "/cars/" + slug + (q.size ? "?" + q.toString() : "") + "#reserve";
  }
  return (
    <>
      <div className="compare-photo-toolbar">
        <div className="compare-selection-chips">
          <span>
            {selected.length} voiture{selected.length === 1 ? "" : "s"}{" "}
            sélectionnée{selected.length === 1 ? "" : "s"}
          </span>
          <button type="button" onClick={edit}>
            <SlidersHorizontal size={14} />
            Modifier la sélection
          </button>
        </div>
        <span className="compare-currency">Marrakech · MAD / DH</span>
      </div>
      <div className="compare-photo-grid">
        {selected.map((car) => (
          <article className="compare-photo-card" key={car.id}>
            <Link className="compare-vehicle-photo" href={vehicleUrl(car.slug)}>
              <span>{car.category}</span>
              {car.images[0] ? (
                <img
                  src={car.images[0].url}
                  alt={car.images[0].alt || car.brand + " " + car.model}
                />
              ) : (
                <div className="empty">Photos à venir</div>
              )}
            </Link>
            <button
              type="button"
              className="compare-remove"
              aria-label={
                "Remove " + car.brand + " " + car.model + " from comparison"
              }
              onClick={() => update(selectedIds.filter((id) => id !== car.id))}
            >
              <X size={15} />
            </button>
            <div className="compare-photo-body">
              <span className="compare-vehicle-brand">{car.brand}</span>
              <h2>{car.model}</h2>
              <dl className="compare-photo-specs">
                {[
                  ["Places", car.seats + " places"],
                  ["Transmission", car.transmission],
                  ["Carburant", car.fuel],
                  ["Catégorie", car.category],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt>{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
              <div className="compare-photo-price">
                <strong>{money(car.dailyPrice)}</strong>
                <small>/ jour</small>
              </div>
              <Link className="button" href={vehicleUrl(car.slug)}>
                Découvrir {car.model}
                <ArrowUpRight size={16} />
              </Link>
            </div>
          </article>
        ))}
        {selected.length < 3 && (
          <button type="button" className="compare-add-card" onClick={edit}>
            <Plus size={30} />
            <strong>
              {selected.length
                ? "Ajouter une voiture"
                : "Choisissez vos voitures"}
            </strong>
            <span>Comparez jusqu’à trois modèles.</span>
          </button>
        )}
      </div>
      <form
        className="compare-dates-strip"
        onSubmit={(e) => {
          e.preventDefault();
          const fields = new FormData(e.currentTarget);
          const start = String(fields.get("pickupAt") || ""),
            end = String(fields.get("returnAt") || "");
          if (!start || !end || end <= start) {
            setError("La date de retour doit suivre la date de départ.");
            return;
          }
          setError("");
          setPickup(start);
          setBack(end);
          update(selectedIds, start, end);
        }}
      >
        <div>
          <h2>Un choix en tête ? Vérifions vos dates.</h2>
          <p>
            Vos dates seront transmises à la voiture choisie pour calculer le
            devis.
          </p>
        </div>
        <div className="compare-date-fields">
          <label>
            Départ
            <input
              type="date"
              name="pickupAt"
              defaultValue={pickup}
              onInput={(e) => setPickup(e.currentTarget.value)}
              onChange={(e) => setPickup(e.target.value)}
              min={new Date().toISOString().slice(0, 10)}
              required
            />
          </label>
          <label>
            Retour
            <input
              type="date"
              name="returnAt"
              defaultValue={back}
              onInput={(e) => setBack(e.currentTarget.value)}
              onChange={(e) => setBack(e.target.value)}
              min={pickup || new Date().toISOString().slice(0, 10)}
              required
            />
          </label>
          <button className="button" type="submit">
            Appliquer <ArrowUpRight size={16} />
          </button>
        </div>
        {error && (
          <p role="alert" className="error">
            {error}
          </p>
        )}
      </form>
      <p className="compare-photo-note">
        Tarifs journaliers avant remises de durée. Le devis final et la
        disponibilité sont vérifiés selon vos dates et les services choisis.
      </p>
      <dialog
        ref={dialog}
        className="compare-picker-dialog"
        aria-labelledby="compare-picker-title"
      >
        <div className="compare-dialog-heading">
          <div>
            <span className="eyebrow">Votre sélection</span>
            <h2 id="compare-picker-title">Jusqu’à trois voitures.</h2>
          </div>
          <button
            type="button"
            aria-label="Close vehicle selection"
            onClick={() => dialog.current?.close()}
          >
            <X size={21} />
          </button>
        </div>
        <div className="compare-picker-grid">
          {cars.map((car) => (
            <label
              key={car.id}
              className={draft.includes(car.id) ? "is-selected" : ""}
            >
              <input
                type="checkbox"
                checked={draft.includes(car.id)}
                disabled={!draft.includes(car.id) && draft.length >= 3}
                onChange={(e) =>
                  setDraft((ids) =>
                    e.target.checked
                      ? [...ids, car.id]
                      : ids.filter((id) => id !== car.id),
                  )
                }
              />
              {car.images[0] && <img src={car.images[0].url} alt="" />}
              <span>
                {car.brand} {car.model}
                <small>{money(car.dailyPrice)} / jour</small>
              </span>
            </label>
          ))}
        </div>
        <div className="compare-dialog-footer">
          <span>{draft.length} / 3 sélectionnées</span>
          <button
            className="button"
            type="button"
            onClick={() => {
              update(draft);
              dialog.current?.close();
            }}
          >
            Comparer ma sélection <ArrowUpRight size={16} />
          </button>
        </div>
      </dialog>
    </>
  );
}
