"use client";
import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
type Photo = { id: string; url: string; alt: string };
export function VehicleGallery({
  photos,
  name,
}: {
  photos: Photo[];
  name: string;
}) {
  const [index, setIndex] = useState(0),
    dialog = useRef<HTMLDialogElement>(null),
    photo = photos[index % photos.length];
  if (!photo)
    return <div className="detail-image empty">Photography coming soon.</div>;
  const change = (delta: number) =>
    setIndex((i) => (i + delta + photos.length) % photos.length);
  return (
    <section className="vehicle-gallery" aria-label={name + " photo gallery"}>
      <button
        className="vehicle-main-photo"
        type="button"
        aria-label={
          "Enlarge photo " +
          (index + 1) +
          " of " +
          photos.length +
          " of " +
          name
        }
        onClick={() => dialog.current?.showModal()}
      >
        <img src={photo.url} alt={photo.alt || name} />
        <span>
          <Expand size={15} /> View photos · {index + 1}/{photos.length}
        </span>
      </button>
      {photos.length > 1 && (
        <>
          <div className="vehicle-photo-controls">
            <button
              type="button"
              aria-label="Previous vehicle photo"
              onClick={() => change(-1)}
            >
              <ChevronLeft size={18} />
            </button>
            <span>
              {index + 1} / {photos.length}
            </span>
            <button
              type="button"
              aria-label="Next vehicle photo"
              onClick={() => change(1)}
            >
              <ChevronRight size={18} />
            </button>
          </div>
          <div className="vehicle-photo-thumbs">
            {photos.map((p, i) => (
              <button
                type="button"
                key={p.id}
                aria-label={"Show vehicle photo " + (i + 1)}
                aria-pressed={index === i}
                onClick={() => setIndex(i)}
              >
                <img src={p.url} alt={p.alt || name} loading="lazy" />
              </button>
            ))}
          </div>
        </>
      )}
      <dialog
        ref={dialog}
        className="vehicle-lightbox"
        aria-label={name + " enlarged photos"}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") change(-1);
          if (e.key === "ArrowRight") change(1);
        }}
      >
        <button
          type="button"
          className="photo-close"
          aria-label="Close photo viewer"
          onClick={() => dialog.current?.close()}
        >
          <X size={22} />
        </button>
        <img src={photo.url} alt={photo.alt || name} />
        <div className="lightbox-controls">
          <button
            type="button"
            aria-label="Previous enlarged photo"
            onClick={() => change(-1)}
            disabled={photos.length < 2}
          >
            <ChevronLeft size={22} />
          </button>
          <span>
            {index + 1} / {photos.length}
          </span>
          <button
            type="button"
            aria-label="Next enlarged photo"
            onClick={() => change(1)}
            disabled={photos.length < 2}
          >
            <ChevronRight size={22} />
          </button>
        </div>
      </dialog>
    </section>
  );
}
