"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowDownUp, Check, ChevronDown, Navigation, Star } from "lucide-react";
import { cn } from "@/lib/utils";

const DISTANCE_OPTIONS: { value: number | null; label: string; aria: string }[] = [
  { value: null, label: "Any distance", aria: "Show places at any distance" },
  { value: 1, label: "Within 1 km", aria: "Show places within 1 kilometre" },
  { value: 3, label: "Within 3 km", aria: "Show places within 3 kilometres" },
  { value: 5, label: "Within 5 km", aria: "Show places within 5 kilometres" },
  { value: 10, label: "Within 10 km", aria: "Show places within 10 kilometres" },
];

const SORT_OPTIONS: { value: "nearest" | "rating"; label: string }[] = [
  { value: "nearest", label: "Nearest First" },
  { value: "rating", label: "Top Rated" },
];

interface DiscoveryFilterBarProps {
  distanceFilterKm: number | null;
  onDistanceChange: (km: number | null) => void;
  sortBy: "nearest" | "rating";
  onSortChange: (sort: "nearest" | "rating") => void;
  className?: string;
}

/**
 * Distance filter chips (1/3/5/10 km) + a "Nearest First" sort menu.
 * Distances are measured from the active origin (GPS fix, manual city or
 * prototype city) — see `useLocationStore`.
 */
export function DiscoveryFilterBar({
  distanceFilterKm,
  onDistanceChange,
  sortBy,
  onSortChange,
  className,
}: DiscoveryFilterBarProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* distance chips — scrollable */}
      <div
        className="no-scrollbar -mx-5 flex min-w-0 flex-1 gap-2 overflow-x-auto px-5"
        role="group"
        aria-label="Filter places by distance"
      >
        {DISTANCE_OPTIONS.map((opt) => {
          const active = distanceFilterKm === opt.value;
          return (
            <button
              key={opt.label}
              type="button"
              aria-pressed={active}
              aria-label={opt.aria}
              onClick={() => onDistanceChange(opt.value)}
              className={cn(
                "shrink-0 whitespace-nowrap rounded-full border px-3 py-1.5 text-[12px] font-semibold transition-all active:scale-95",
                active
                  ? "border-primary bg-primary text-primary-foreground shadow-md shadow-orange-600/25"
                  : "border-border bg-card text-stone-600 hover:border-primary/40 hover:text-foreground"
              )}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      <SortMenu value={sortBy} onChange={onSortChange} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Sort menu — small in-frame popover (portals escape the phone frame) */
/* ------------------------------------------------------------------ */
function SortMenu({
  value,
  onChange,
}: {
  value: "nearest" | "rating";
  onChange: (v: "nearest" | "rating") => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const current = SORT_OPTIONS.find((o) => o.value === value) ?? SORT_OPTIONS[0];

  return (
    <div className="relative shrink-0" ref={rootRef}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Sort places: ${current.label}`}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1.5 text-[12px] font-semibold transition-all active:scale-95",
          open
            ? "border-primary/50 bg-orange-50 text-primary"
            : "border-border bg-card text-stone-600 hover:border-primary/40 hover:text-foreground"
        )}
      >
        {value === "nearest" ? (
          <Navigation className="size-3" aria-hidden="true" />
        ) : (
          <Star className="size-3" aria-hidden="true" />
        )}
        {current.label}
        <ChevronDown
          className={cn("size-3 transition-transform", open && "rotate-180")}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div
          role="listbox"
          aria-label="Sort places"
          className="absolute right-0 top-full z-30 mt-1.5 w-44 overflow-hidden rounded-xl border border-border bg-card py-1 shadow-xl"
        >
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              role="option"
              aria-selected={value === opt.value}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={cn(
                "flex w-full items-center gap-2 px-3 py-2.5 text-left text-[13px] font-semibold transition-colors hover:bg-accent",
                value === opt.value ? "text-primary" : "text-foreground"
              )}
            >
              {opt.value === "nearest" ? (
                <Navigation className="size-3.5" aria-hidden="true" />
              ) : (
                <Star className="size-3.5" aria-hidden="true" />
              )}
              <span className="flex-1">{opt.label}</span>
              {value === opt.value && <Check className="size-3.5" aria-hidden="true" />}
            </button>
          ))}
          <div
            className="flex items-center gap-1.5 border-t border-border/60 px-3 py-2 text-[10.5px] leading-snug text-stone-400"
            aria-hidden="true"
          >
            <ArrowDownUp className="size-3 shrink-0" />
            {value === "nearest"
              ? "Sorted by straight-line distance"
              : "Sorted by community rating"}
          </div>
        </div>
      )}
    </div>
  );
}
