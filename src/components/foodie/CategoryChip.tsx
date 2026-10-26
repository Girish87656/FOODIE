"use client";

import { cn } from "@/lib/utils";
import { MapPin as FallbackPin } from "lucide-react";
import { FOOD_CATEGORY_ICONS, POI_TYPE_ICONS } from "@/lib/foodie/icons";
import type { FoodCategory } from "@/lib/foodie/types";

interface CategoryChipProps {
  category: FoodCategory;
  active: boolean;
  onClick: () => void;
}

/** The professional icon for a category id — never an emoji, never an image. */
export function categoryIconFor(categoryId: string) {
  return (
    FOOD_CATEGORY_ICONS[categoryId as keyof typeof FOOD_CATEGORY_ICONS] ??
    POI_TYPE_ICONS[categoryId as keyof typeof POI_TYPE_ICONS] ??
    FallbackPin
  );
}

/**
 * Horizontal quick-filter chip on the Home screen (Prototype 4).
 *
 * Every chip renders its category's professional Lucide glyph — the old
 * picture-style illustration thumbs are gone from the interface entirely.
 */
export function CategoryChip({ category, active, onClick }: CategoryChipProps) {
  const Icon =
    FOOD_CATEGORY_ICONS[category.id as keyof typeof FOOD_CATEGORY_ICONS] ??
    POI_TYPE_ICONS[category.id as keyof typeof POI_TYPE_ICONS] ??
    FallbackPin;
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
      <Icon
        aria-hidden="true"
        className={cn(
          "size-4 shrink-0",
          active ? "text-primary-foreground" : "text-primary"
        )}
      />
      {category.label}
    </button>
  );
}

/** Grid tile version used on the preference picker — professional icon tiles. */
export function CategoryTile({
  category,
  selected,
  onToggle,
}: {
  category: FoodCategory;
  selected: boolean;
  onToggle: () => void;
}) {
  const Icon =
    FOOD_CATEGORY_ICONS[category.id as keyof typeof FOOD_CATEGORY_ICONS] ??
    POI_TYPE_ICONS[category.id as keyof typeof POI_TYPE_ICONS] ??
    FallbackPin;
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
      <span
        aria-hidden="true"
        className="grid size-10 place-items-center rounded-xl bg-primary/10 transition-transform group-hover:scale-110"
      >
        <Icon className="size-5 text-primary" />
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
