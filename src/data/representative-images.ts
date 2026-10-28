/**
 * Representative category imagery (Prototype 4.1).
 *
 * HONESTY CONTRACT — read before touching:
 *
 * These are AI-GENERATED, photorealistic category illustrations created
 * in-house for Foodie. They are NOT photographs of any real venue and are
 * NEVER presented as one: every render carries a visible
 * "Representative image · AI-generated" chip and an aria-label that states
 * exactly what it is ("… AI-generated illustration, not the actual venue").
 *
 * UI priority everywhere is:
 *   1. a VERIFIED, attributed per-venue photo (src/data/venue-images.ts)
 *   2. one of these representative category images (this file)
 *   3. the professional category icon tile (MediaTiles.CategoryTile)
 *
 * One UNIQUE image per REAL stored category / place type — never reused
 * across unrelated categories (enforced by tests/representative-images.test.ts).
 * No third-party rights: all artwork was generated in-house.
 */

export const REPRESENTATIVE_LICENSE = "AI-generated (in-house)";
export const REPRESENTATIVE_LABEL = "Representative image · AI-generated";
export const REPRESENTATIVE_LABEL_SHORT = "AI-generated";

export interface RepresentativeImage {
  /** Bundled webp master under /images/representative/ (ships a -small sibling). */
  src: string;
  /** Honest alt text — always states this is an AI-generated illustration. */
  alt: string;
}

function img(asset: string, alt: string): RepresentativeImage {
  return { src: `/images/representative/rep-${asset}.webp`, alt };
}

export const REPRESENTATIVE_IMAGES: Record<string, RepresentativeImage> = {
  /* ---- the 7 pilot FOOD categories (PLACE_CATEGORIES ids) ---- */
  "food:restaurant": img(
    "restaurant",
    "Representative image of a South Indian family restaurant interior with steel plates of meals on banana leaf — AI-generated illustration, not the actual venue"
  ),
  "food:hotel": img(
    "hotel-meals",
    "Representative image of a traditional South Indian unlimited meals thali served on banana leaf — AI-generated illustration, not the actual venue"
  ),
  "food:tiffin": img(
    "tiffin",
    "Representative image of a South Indian tiffin-room breakfast with dosa, idlis, chutney and sambar — AI-generated illustration, not the actual venue"
  ),
  "food:cafe": img(
    "cafe",
    "Representative image of a cozy modern cafe interior with a wooden coffee bar — AI-generated illustration, not the actual venue"
  ),
  "food:fast_food": img(
    "fast-food",
    "Representative image of a fast-food meal with burger, fries and a cold drink on a tray — AI-generated illustration, not the actual venue"
  ),
  "food:street_food": img(
    "street-food",
    "Representative image of an Indian street-food stall at dusk with a dosa griddle and string lights — AI-generated illustration, not the actual venue"
  ),
  "food:bakery_sweets": img(
    "bakery-sweets",
    "Representative image of an Indian bakery and sweets counter with colourful mithai and pastries — AI-generated illustration, not the actual venue"
  ),

  /* ---- the 7 NON-FOOD place types (POI_PLACE_TYPES ids) ---- */
  "poi:temple": img(
    "poi-temple",
    "Representative image of a Dravidian-style South Indian temple gopuram at golden hour — AI-generated illustration, not the actual venue"
  ),
  "poi:waterfall": img(
    "poi-waterfall",
    "Representative image of a forest waterfall cascading into a natural pool — AI-generated illustration, not the actual venue"
  ),
  "poi:fort": img(
    "poi-fort",
    "Representative image of an ancient hill fort's stone ramparts overlooking the valleys — AI-generated illustration, not the actual venue"
  ),
  "poi:zoo": img(
    "poi-zoo",
    "Representative image of a lush zoo park with a shaded visitor pathway — AI-generated illustration, not the actual venue"
  ),
  "poi:natural_arch": img(
    "poi-natural-arch",
    "Representative image of a natural stone arch formation on a hilltop — AI-generated illustration, not the actual venue"
  ),
  "poi:other": img(
    "poi-other",
    "Representative image of a peaceful South Indian lakeside park at golden hour — AI-generated illustration, not the actual venue"
  ),
  "poi:hotel": img(
    "poi-hotel",
    "Representative image of a mid-range hotel exterior with an entrance porch and palm trees — AI-generated illustration, not the actual venue"
  ),
};

/**
 * Resolve the representative image for a REAL stored category / place type.
 * Returns null for unknown ids — callers fall back to the icon tile.
 */
export function representativeImageFor(
  kind: "food" | "poi",
  categoryId: string | null | undefined
): RepresentativeImage | null {
  if (!categoryId) return null;
  return REPRESENTATIVE_IMAGES[`${kind}:${categoryId}`] ?? null;
}
