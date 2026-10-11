"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowDownUp, Check, ChevronDown, ListFilter, Navigation, Ruler, Star, Utensils } from "lucide-react";
import { cn } from "@/lib/utils";
import { PLACE_CATEGORIES } from "@/lib/foodie/constants";

const DISTANCE_OPTIONS: { value: number | null; label: string; aria: string }[] = [
  { value: null, label: "Any distance", aria: "Show places at any distance" },
  { value: 1, label: "Within 1 km", aria: "Show places within 1 kilometre" },
  { value: 3, label: "Within 3 km", aria: "Show places within 3 kilometres" },
  { value: 5, label: "Within 5 km", aria: "Show places within 5 kilometres" },
  { value: 10, label: "Within 10 km", aria: "Show places within 10 kilometres" },
];

const SORT_OPTIONS: { value: "nearest" | "rating"; label: string; hint: string }[] = [
  { value: "nearest", label: "Nearest First", hint: "Sorted by straight-line distance" },
  { value: "rating", label: "Top Rated", hint: "Sorted by community rating" },
];

const ALL_CATEGORY_OPTION = { id: "all", label: "All", emoji: "🍽️" } as const;

interface DiscoveryFilterBarProps {
  distanceFilterKm: number | null;
  onDistanceChange: (km: number | null) => void;
  sortBy: "nearest" | "rating";
  onSortChange: (sort: "nearest" | "rating") => void;
  className?: string;
  /* category dropdown wiring — selection really drives the feed filter */
  activeCategory: string | null;
  onCategoryChange: (id: string | null) => void;
}

/**
 * The home discovery controls as ONE row of functional dropdowns:
 *   [ Category ▾ ]  [ Distance ▾ ]  [ Sort ▾ ]
 * Every previously-chip-offered option is preserved (All + the 7 pilot
 * categories · Any distance + 1/3/5/10 km · Nearest First / Top Rated) and
 * every selection writes straight to the Zustand store the feed filters on,
 * so choosing an option always changes the visible results.
 *
 * The menus are small in-frame popovers (NOT portals — a portal would escape
 * the desktop phone mockup frame the rest of the app renders inside).
 */
export function DiscoveryFilterBar({
  distanceFilterKm,
  onDistanceChange,
  sortBy,
  onSortChange,
  className,
  activeCategory,
  onCategoryChange,
}: DiscoveryFilterBarProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <CategoryDropdown value={activeCategory} onChange={onCategoryChange} />
      <DistanceDropdown value={distanceFilterKm} onChange={onDistanceChange} />
      <SortDropdown value={sortBy} onChange={onSortChange} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Shared in-frame popover plumbing (listbox semantics + a11y)         */
/* ------------------------------------------------------------------ */
function usePopover() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      if (e.key === "Tab") setOpen(false);
    };
    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return { open, setOpen, rootRef };
}

function FilterDropdownShell({
  label,
  icon,
  activeValue,
  open,
  onToggle,
  rootRef,
  children,
  active,
  footer,
}: {
  label: string;
  icon: React.ReactNode;
  activeValue: string;
  open: boolean;
  onToggle: () => void;
  rootRef: React.RefObject<HTMLDivElement | null>;
  children: React.ReactNode;
  active: boolean;
  footer?: React.ReactNode;
}) {
  return (
    <div className="relative min-w-0 flex-1" ref={rootRef}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`${label}: ${activeValue}`}
        onClick={onToggle}
        className={cn(
          "flex w-full items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-semibold transition-all active:scale-[0.97]",
          active || open
            ? "border-primary/60 bg-orange-50 text-primary shadow-sm"
            : "border-border bg-card text-stone-600 hover:border-primary/40 hover:text-foreground"
        )}
      >
        <span className="shrink-0 text-stone-400" aria-hidden="true">
          {icon}
        </span>
        <span className="min-w-0 flex-1 truncate text-left">{activeValue}</span>
        <ChevronDown
          className={cn("size-3 shrink-0 transition-transform", open && "rotate-180")}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div
          role="listbox"
          aria-label={label}
          className="absolute left-0 top-full z-30 mt-1.5 w-full min-w-44 origin-top overflow-hidden rounded-xl border border-border bg-card py-1 shadow-xl animate-in fade-in-0 zoom-in-95 slide-in-from-top-1 duration-150"
        >
          {children}
          {footer && (
            <div
              className="flex items-center gap-1.5 border-t border-border/60 px-3 py-2 text-[10.5px] leading-snug text-stone-400"
              aria-hidden="true"
            >
              {footer}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function OptionRow({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={selected}
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2 px-3 py-2.5 text-left text-[13px] font-semibold transition-colors hover:bg-accent",
        selected ? "text-primary" : "text-foreground"
      )}
    >
      <span className="flex-1 truncate">{children}</span>
      {selected && <Check className="size-3.5 shrink-0" aria-hidden="true" />}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Category — All + the 7 pilot categories (was the chip rail)         */
/* ------------------------------------------------------------------ */
function CategoryDropdown({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (id: string | null) => void;
}) {
  const { open, setOpen, rootRef } = usePopover();
  const options = [ALL_CATEGORY_OPTION, ...PLACE_CATEGORIES];
  const current =
    value == null
      ? ALL_CATEGORY_OPTION
      : (PLACE_CATEGORIES.find((c) => c.id === value) ?? ALL_CATEGORY_OPTION);

  return (
    <FilterDropdownShell
      label="Filter by category"
      icon={<Utensils className="size-3" aria-hidden="true" />}
      activeValue={current.label}
      open={open}
      onToggle={() => setOpen((o) => !o)}
      rootRef={rootRef}
      active={value != null}
      footer={<ListFilter className="size-3 shrink-0" aria-hidden="true" />}
    >
      {options.map((opt) => (
        <OptionRow
          key={opt.id}
          selected={
            opt.id === "all" ? value == null : value === opt.id
          }
          onClick={() => {
            onChange(opt.id === "all" ? null : opt.id);
            setOpen(false);
          }}
        >
          <span aria-hidden="true">{opt.emoji}</span> {opt.label}
        </OptionRow>
      ))}
    </FilterDropdownShell>
  );
}

/* ------------------------------------------------------------------ */
/* Distance — Any distance + 1/3/5/10 km (was the chip row)            */
/* ------------------------------------------------------------------ */
function DistanceDropdown({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (km: number | null) => void;
}) {
  const { open, setOpen, rootRef } = usePopover();
  const current = DISTANCE_OPTIONS.find((o) => o.value === value) ?? DISTANCE_OPTIONS[0];

  return (
    <FilterDropdownShell
      label="Filter by distance"
      icon={<Ruler className="size-3" aria-hidden="true" />}
      activeValue={current.label}
      open={open}
      onToggle={() => setOpen((o) => !o)}
      rootRef={rootRef}
      active={value != null}
      footer={<Ruler className="size-3 shrink-0" aria-hidden="true" />}
    >
      {DISTANCE_OPTIONS.map((opt) => (
        <OptionRow
          key={opt.label}
          selected={value === opt.value}
          onClick={() => {
            onChange(opt.value);
            setOpen(false);
          }}
        >
          {opt.label}
        </OptionRow>
      ))}
    </FilterDropdownShell>
  );
}

/* ------------------------------------------------------------------ */
/* Sort — Nearest First / Top Rated (dropdown, unchanged options)       */
/* ------------------------------------------------------------------ */
function SortDropdown({
  value,
  onChange,
}: {
  value: "nearest" | "rating";
  onChange: (v: "nearest" | "rating") => void;
}) {
  const { open, setOpen, rootRef } = usePopover();
  const current = SORT_OPTIONS.find((o) => o.value === value) ?? SORT_OPTIONS[0];

  return (
    <FilterDropdownShell
      label="Sort places"
      icon={current.value === "nearest"
        ? <Navigation className="size-3" aria-hidden="true" />
        : <Star className="size-3" aria-hidden="true" />}
      activeValue={current.label}
      open={open}
      onToggle={() => setOpen((o) => !o)}
      rootRef={rootRef}
      active={false}
      footer={<ArrowDownUp className="size-3 shrink-0" aria-hidden="true" />}
    >
      {SORT_OPTIONS.map((opt) => (
        <OptionRow
          key={opt.value}
          selected={value === opt.value}
          onClick={() => {
            onChange(opt.value);
            setOpen(false);
          }}
        >
          {opt.label}
        </OptionRow>
      ))}
    </FilterDropdownShell>
  );
}
