/**
 * Category illustration registry (Foodie).
 *
 * WHY THIS EXISTS: every image-shaped surface in the app (card photo
 * placeholders, attraction type tiles, detail heroes, category chips) used
 * to fall back to a bare emoji glyph. These are now consistent, custom,
 * picture-style category illustrations — generated artwork, NEVER presented
 * as a real photo of any venue. Detail heroes label them "Illustration"
 * explicitly; alt text says "category illustration".
 *
 * The files are optimised WebP (generated at 1344×768, ≤ ~100 KB each) and
 * ship with the app bundle (public/images/categories/) so tiles render
 * instantly with no network dependency and are covered by Next.js static
 * asset caching.
 *
 * Illustrations are CATEGORY artwork: one image per category is shared by
 * every place in that category BY DESIGN (it is decoration, not a venue
 * photo). Real, licensed per-venue photos live in `src/data/venue-images.ts`
 * and take priority wherever an entry exists.
 */

import type { PlaceType } from "./types";

/** Illustration per FOOD place category (restaurants.category values). */
export const CATEGORY_ILLUSTRATIONS: Record<string, string> = {
  restaurant: "/images/categories/restaurant.webp",
  // restaurants.category 'hotel' means the LOCAL "meals place" (rice-thali
  // eatery) — its artwork is deliberately a meals platter, NOT a building.
  // Lodging hotels use POI_TYPE_ILLUSTRATIONS.hotel (Stay).
  hotel: "/images/categories/hotel-meals.webp",
  tiffin: "/images/categories/tiffin.webp",
  cafe: "/images/categories/cafe.webp",
  fast_food: "/images/categories/fast-food.webp",
  street_food: "/images/categories/street-food.webp",
  bakery_sweets: "/images/categories/bakery-sweets.webp",
};

/** Illustration per NON-FOOD place type (public.places place_type values). */
export const POI_TYPE_ILLUSTRATIONS: Record<PlaceType, string> = {
  temple: "/images/categories/temple.webp",
  waterfall: "/images/categories/waterfall.webp",
  fort: "/images/categories/fort.webp",
  zoo: "/images/categories/zoo.webp",
  natural_arch: "/images/categories/natural-arch.webp",
  other: "/images/categories/poi-other.webp",
  hotel: "/images/categories/hotel-stay.webp",
};

/** Illustration for a food category id, or null when the id is unknown. */
export function categoryIllustration(categoryId?: string): string | null {
  if (!categoryId) return null;
  return CATEGORY_ILLUSTRATIONS[categoryId] ?? null;
}

/** Illustration for a place_type — always defined ('other' is the fallback). */
export function poiTypeIllustration(placeType: PlaceType): string {
  return POI_TYPE_ILLUSTRATIONS[placeType] ?? POI_TYPE_ILLUSTRATIONS.other;
}

/**
 * Responsive srcset for bundled media assets.
 *
 * Every `public/images/categories/*.webp` ships `-small.webp` (320w) and
 * `-md.webp` (640w) siblings; every `public/images/places/*.webp` ships a
 * `-small.webp` (320w) sibling (see public/images/IMAGE-CREDITS.md §4).
 * Chips/tiles (≤80px CSS) download the ~5-12 KB thumb instead of the
 * ~30-105 KB master — the homepage's category rails stay light.
 *
 * Returns null for any src outside those two bundled prefixes (e.g.
 * user-uploaded Supabase storage URLs), which callers render as a plain img.
 */
const RESPONSIVE_PREFIXES: ReadonlyArray<readonly [prefix: string, widths: readonly number[]]> = [
  ["/images/categories/", [320, 640, 1344]],
  ["/images/places/", [320, 800]],
];

const WIDTH_SUFFIX: ReadonlyArray<readonly [width: number, suffix: string]> = [
  [320, "-small"],
  [640, "-md"],
  [800, ""],
  [1344, ""],
];

export function responsiveSrcSet(src: string): string | null {
  if (!src.endsWith(".webp") || src.endsWith("-small.webp") || src.endsWith("-md.webp")) {
    return null;
  }
  for (const [prefix, widths] of RESPONSIVE_PREFIXES) {
    if (!src.startsWith(prefix)) continue;
    return widths
      .map((w) => {
        const [, suffix] = WIDTH_SUFFIX.find(([candidate]) => candidate === w)!;
        return `${src.replace(".webp", `${suffix}.webp`)} ${w}w`;
      })
      .join(", ");
  }
  return null;
}
