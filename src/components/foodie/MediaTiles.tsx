"use client";

/**
 * MediaTiles — Foodie's Prototype-4 placeholder surface.
 *
 * One honest rule backs every media decision in the app:
 *
 *     a real, attributed venue photo … or a quiet CATEGORY ICON TILE.
 *     Never a cartoon illustration, never a borrowed stock photo, never an
 *     emoji, never a fake venue shot.
 *
 * `CategoryTile` renders a Lucide glyph for the place's REAL stored
 * category/type on a warm neutral gradient with a hairline inner ring. It
 * reads as interface chrome — like an avatar with initials — so nothing is
 * ever mistaken for a photograph of the venue. Screen readers get an
 * explicit label when one is provided; otherwise the tile is decorative
 * inside an already-labelled control.
 *
 * The last-ditch failure state (even the tile's <img> sibling failed) is
 * the same component minus the media — the broken-image glyph of a dead
 * <img> is never shown anywhere in Foodie.
 */

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { TILE_SURFACE_CLASS } from "@/lib/foodie/categoryImages";

export function CategoryTile({
  icon: Icon,
  ariaLabel,
  className,
  iconClassName,
  muted = false,
}: {
  icon: LucideIcon;
  /** When set, the tile is exposed as role="img" with this honest label. */
  ariaLabel?: string;
  className?: string;
  iconClassName?: string;
  /** Quieter variant for large hero surfaces (smaller relative glyph). */
  muted?: boolean;
}) {
  return (
    <div
      role={ariaLabel ? "img" : undefined}
      aria-label={ariaLabel}
      aria-hidden={ariaLabel ? undefined : true}
      className={cn(
        "relative grid size-full place-items-center overflow-hidden",
        TILE_SURFACE_CLASS,
        "after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:ring-1 after:ring-inset after:ring-stone-900/[0.04]",
        className
      )}
    >
      {/* soft radial warmth — barely-there depth, zero cartoon energy */}
      <span
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(14rem_9rem_at_50%_118%,rgba(234,88,12,0.07),transparent)]"
      />
      <Icon
        aria-hidden="true"
        strokeWidth={1.5}
        className={cn(
          muted ? "size-10 text-stone-300" : "size-6 text-stone-400",
          iconClassName
        )}
      />
    </div>
  );
}
