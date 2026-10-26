/**
 * Category visual tokens + responsive-srcset helpers (Foodie, Prototype 4).
 *
 * PROTOTYPE 4 CHANGE — the AI-generated flat-illustration layer is GONE from
 * the interface. The premium visual system is:
 *
 *   1. VERIFIED, attributed per-venue photos (src/data/venue-images.ts,
 *      bundled under public/images/places/) — the media layer, priority.
 *   2. A professional CATEGORY ICON TILE for everything without a verified
 *      photo — a Lucide glyph for the place's REAL stored category on a
 *      quiet warm gradient (MediaTiles.tsx). It reads unmistakably as an
 *      interface tile, never as a photo of the venue: no raster artwork is
 *      deployed for categories any more.
 *
 * This module keeps only what that system needs:
 *   - `responsiveSrcSet` — serves `-small` (320w) / `-md` (640w) variants of
 *     the bundled venue photos so tiles download kilobytes, not the master.
 *   - the shared placeholder-gradient class tokens used by MediaTiles so
 *     every fallback surface in the app is pixel-identical.
 */

/**
 * Responsive srcset for bundled media assets.
 *
 * Every `public/images/places/*.webp` ships a `-small.webp` (320w) sibling
 * (see public/images/IMAGE-CREDITS.md). Tiles ≤ 80px CSS download the
 * ~5-12 KB thumb instead of the ~30-105 KB master.
 *
 * Returns null for any src outside the bundled prefix (e.g. user-uploaded
 * Supabase storage URLs), which callers render as a plain img.
 */
const RESPONSIVE_PREFIXES: ReadonlyArray<readonly [prefix: string, widths: readonly number[]]> = [
  ["/images/places/", [320, 800]],
  ["/images/representative/", [320, 800]],
];

const WIDTH_SUFFIX: ReadonlyArray<readonly [width: number, suffix: string]> = [
  [320, "-small"],
  [800, ""],
];

export function responsiveSrcSet(src: string): string | null {
  if (!src.endsWith(".webp") || src.endsWith("-small.webp")) {
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

/**
 * The one placeholder surface used across the app when no verified photo
 * exists — quiet warm neutrals (never a cartoon, never a substitute photo).
 * MediaTiles.CategoryTile renders the icon on top of this.
 */
export const TILE_SURFACE_CLASS =
  "bg-gradient-to-br from-stone-100 via-[#faf6f1] to-amber-50/80";
