"use client";

/**
 * IllustrationImage + GlyphTile — the shared media-fallback primitives.
 *
 * WHY THIS EXISTS: the audit for the image-system pass found that several
 * small illustration render sites (category chips, preference tiles, filter
 * rows, the food-detail hero) rendered a bare `<img src={illustration}>`
 * with NO onError handling — if a bundled WebP ever failed to load, those
 * sites would show the browser's broken-image glyph while every other
 * surface degraded gracefully. These two components centralise the app's
 * honest-failure contract for the ILLUSTRATION layer:
 *
 *   real venue photo  (venue-images.ts, attributed)   — media layer, priority
 *   ▸ category illustration (categoryImages.ts)       — IllustrationImage
 *   ▸ glyph-on-gradient tile                          — GlyphTile (last ditch)
 *
 * - IllustrationImage: renders a bundled category illustration with
 *   intrinsic dimensions (CLS-safe), responsive 320w/640w/full srcset when
 *   the caller gives a `sizes` hint, `priority` (eager + fetchPriority) for
 *   above-the-fold heroes, and switches to the `fallback` node on error —
 *   the broken-image glyph is never shown.
 * - GlyphTile: the warm gradient + centred Lucide glyph used as that
 *   fallback everywhere, so a fully failed media stack looks like
 *   "no picture" — never corruption, never a substitute photo, never an
 *   emoji.
 *
 * Responsive variants: every bundled WebP under `public/images/` has a
 * `-small.webp` (320w) sibling and every category illustration also has a
 * `-md.webp` (640w) sibling (see public/images/IMAGE-CREDITS.md §4).
 * `responsiveSrcSet` (categoryImages.ts) builds the candidate list only for
 * those two prefixes — any other src renders as a plain img.
 */

import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { responsiveSrcSet } from "@/lib/foodie/categoryImages";

/** Intrinsic size of the generated category illustrations (1344×768). */
const ILLUSTRATION_INTRINSIC = { width: 1344, height: 768 } as const;

export function IllustrationImage({
  src,
  alt = "",
  className,
  sizes,
  priority = false,
  fallback = null,
}: {
  src?: string | null;
  /** "" (decorative, inside a labelled control) or a real description. */
  alt?: string;
  className?: string;
  /** Layout width hint — enables the responsive srcset when provided. */
  sizes?: string;
  /** Above-the-fold heroes: eager + fetchPriority=high. */
  priority?: boolean;
  /** Rendered when there is no src or the image failed to load. */
  fallback?: React.ReactNode;
}) {
  const [failed, setFailed] = useState(false);
  const [prevSrc, setPrevSrc] = useState(src);
  // Render-time adjustment on src change (no setState-in-effect) — same
  // pattern as SafeImage / PlaceCards.PlacePhoto.
  if (prevSrc !== src) {
    setPrevSrc(src);
    setFailed(false);
  }

  if (!src || failed) {
    return <>{fallback}</>;
  }

  const srcSet = responsiveSrcSet(src);
  return (
    <img
      src={src}
      {...(srcSet ? { srcSet, ...(sizes ? { sizes } : {}) } : {})}
      alt={alt}
      width={ILLUSTRATION_INTRINSIC.width}
      height={ILLUSTRATION_INTRINSIC.height}
      loading={priority ? "eager" : "lazy"}
      {...(priority ? { fetchPriority: "high" as const } : {})}
      decoding="async"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}

/**
 * Last-ditch media fallback: warm gradient + centred Lucide glyph.
 * Never claims to be a photo — when `ariaLabel` is set the tile is exposed
 * to assistive tech as an image with that honest label; otherwise it is
 * decorative (the surrounding control already carries the semantics).
 */
export function GlyphTile({
  icon: Icon,
  ariaLabel,
  className,
  iconClassName,
}: {
  icon: LucideIcon;
  /** When set, the tile gets role="img" + this label. */
  ariaLabel?: string;
  className?: string;
  iconClassName?: string;
}) {
  return (
    <div
      role={ariaLabel ? "img" : undefined}
      aria-label={ariaLabel}
      aria-hidden={ariaLabel ? undefined : true}
      className={cn(
        "relative grid size-full place-items-center overflow-hidden bg-gradient-to-br from-orange-100 via-amber-50 to-orange-50",
        className
      )}
    >
      {/* soft radial warmth behind the fallback glyph */}
      <span
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(12rem_8rem_at_50%_115%,rgba(249,115,22,0.14),transparent)]"
      />
      <Icon
        aria-hidden="true"
        className={cn("size-6 text-orange-300", iconClassName)}
      />
    </div>
  );
}
