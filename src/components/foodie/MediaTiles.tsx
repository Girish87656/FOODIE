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

import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { TILE_SURFACE_CLASS, responsiveSrcSet } from "@/lib/foodie/categoryImages";
import {
  REPRESENTATIVE_LABEL,
  REPRESENTATIVE_LABEL_SHORT,
  type RepresentativeImage,
} from "@/data/representative-images";

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

/**
 * RepresentativePhoto — Prototype 4.1 premium fallback layer.
 *
 * An AI-GENERATED, photorealistic category illustration (bundled, unique per
 * category — see src/data/representative-images.ts). It sits between the
 * verified venue photo and the icon tile and is NEVER presented as the real
 * venue: a visible chip always reads "Representative image · AI-generated"
 * (or the compact "AI-generated" on small tiles), and the accessibility
 * label states it is not the actual venue. If the asset fails to load it
 * degrades to the honest CategoryTile — a dead <img> is never shown in
 * Foodie.
 */
export function RepresentativePhoto({
  image,
  icon: Icon,
  ariaLabel,
  className,
  iconClassName,
  chipClassName,
  shortChip = false,
  priority = false,
  sizes,
}: {
  image: RepresentativeImage;
  /** Icon for the failure fallback tile (this surface's real category). */
  icon: LucideIcon;
  /** Defaults to the registry's honest alt text. */
  ariaLabel?: string;
  className?: string;
  iconClassName?: string;
  chipClassName?: string;
  /** Compact corner chip for small tiles (still honest, still visible). */
  shortChip?: boolean;
  /** Hero surfaces load eagerly. */
  priority?: boolean;
  /** Layout width hint — enables the responsive 320w/800w srcset. */
  sizes?: string;
}) {
  const [failed, setFailed] = useState(false);
  const [prevSrc, setPrevSrc] = useState(image.src);
  if (prevSrc !== image.src) {
    setPrevSrc(image.src);
    setFailed(false);
  }

  if (failed) {
    return (
      <CategoryTile
        icon={Icon}
        ariaLabel={ariaLabel ?? image.alt}
        className={className}
        iconClassName={iconClassName}
      />
    );
  }

  const srcSet = responsiveSrcSet(image.src);

  return (
    <div
      role="img"
      aria-label={ariaLabel ?? image.alt}
      className={cn(
        "relative size-full overflow-hidden bg-stone-100",
        className
      )}
    >
      <img
        src={image.src}
        {...(srcSet ? { srcSet, ...(sizes ? { sizes } : {}) } : {})}
        alt=""
        loading={priority ? "eager" : "lazy"}
        {...(priority ? { fetchPriority: "high" as const } : {})}
        decoding="async"
        onError={() => setFailed(true)}
        className="size-full object-cover"
      />
      <span
        className={cn(
          "pointer-events-none absolute bottom-1.5 left-1.5 max-w-[85%] truncate rounded-full bg-black/55 px-2 py-[3px] text-[9.5px] font-semibold text-white backdrop-blur-sm",
          chipClassName
        )}
      >
        {shortChip ? REPRESENTATIVE_LABEL_SHORT : REPRESENTATIVE_LABEL}
      </span>
    </div>
  );
}
