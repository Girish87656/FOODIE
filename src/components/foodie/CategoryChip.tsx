"use client";

import { cn } from "@/lib/utils";
import type { FoodCategory } from "@/lib/foodie/types";

interface CategoryChipProps {
  category: FoodCategory;
  active: boolean;
  onClick: () => void;
}

/** Horizontal quick-filter chip on the Home screen */
export function CategoryChip({ category, active, onClick }: CategoryChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-[13px] font-semibold transition-all active:scale-95",
        active
          ? "border-primary bg-primary text-primary-foreground shadow-md shadow-orange-600/25"
          : "border-border bg-card text-foreground hover:border-primary/40 hover:bg-accent"
      )}
    >
      <span aria-hidden="true" className="text-sm leading-none">
        {category.emoji}
      </span>
      {category.label}
    </button>
  );
}

/** Grid tile version used on the preference picker */
export function CategoryTile({
  category,
  selected,
  onToggle,
}: {
  category: FoodCategory;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={selected}
      className={cn(
        "group relative flex flex-col items-center gap-1.5 rounded-2xl border-2 p-3 text-center transition-all active:scale-95",
        selected
          ? "border-primary bg-orange-50 shadow-md shadow-orange-600/10"
          : "border-border/80 bg-card hover:border-primary/30 hover:bg-accent/60"
      )}
    >
      <span className="text-[26px] leading-none transition-transform group-hover:scale-110" aria-hidden="true">
        {category.emoji}
      </span>
      <span
        className={cn(
          "text-[11.5px] font-semibold leading-tight",
          selected ? "text-primary" : "text-foreground"
        )}
      >
        {category.label}
      </span>
      <span
        aria-hidden="true"
        className={cn(
          "absolute right-2 top-2 grid size-4.5 place-items-center rounded-full border-2 text-white transition-all",
          selected ? "border-primary bg-primary" : "border-stone-300 bg-transparent"
        )}
      >
        {selected && (
          <svg viewBox="0 0 10 8" className="size-2.5 fill-none stroke-white stroke-[2]" >
            <path d="M1 4 L3.6 6.5 L9 1" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
    </button>
  );
}
