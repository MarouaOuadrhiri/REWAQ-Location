"use client";
import { useState, useEffect } from "react";
import { SlidersHorizontal, ChevronDown } from "lucide-react";
export function ResponsiveFilters({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(min-width: 701px)");
    const sync = () => setOpen(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);
  return (
    <details
      className="responsive-filters"
      open={open}
      onToggle={(event) => setOpen(event.currentTarget.open)}
    >
      <summary>
        <SlidersHorizontal size={16} />
        Filters & sort
        <ChevronDown size={15} />
      </summary>
      {children}
    </details>
  );
}
