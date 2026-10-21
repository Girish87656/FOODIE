"use client";

import { useState } from "react";

/**
 * SafeImage — a plain <img> with the app's honest-failure contract.
 *
 * A stored URL that cannot load (removed file, dead host, network hiccup)
 * must NEVER show the browser's broken-image glyph. Instead the `fallback`
 * node is rendered — usually the same category-emoji tile used when no URL
 * exists at all, so a dead URL looks exactly like "no photo", never like
 * corruption and never like a substitute image.
 *
 * NOTE: this does NOT license new imagery. Destination/food image_url values
 * are NULL by the batch-003 licensing policy ("if image licensing/source is
 * uncertain, leave image_url NULL") — SafeImage only guarantees that the two
 * remaining render sites degrade as honestly as the cards and gallery do.
 *
 * State resets when the src prop changes via the render-time adjustment
 * pattern (no setState-in-effect; same pattern as PlaceCards.PlacePhoto).
 */
export function SafeImage({
  src,
  alt,
  className,
  fallback = null,
}: {
  src?: string | null;
  alt: string;
  className?: string;
  /** Rendered when there is no src or the image failed to load. */
  fallback?: React.ReactNode;
}) {
  const [failed, setFailed] = useState(false);
  const [prevSrc, setPrevSrc] = useState(src);
  if (prevSrc !== src) {
    setPrevSrc(src);
    setFailed(false);
  }

  if (!src || failed) {
    return (
      <>
        {fallback}
        {/* sr-only acknowledgement keeps screen readers informed that a
            recorded image could not be displayed */}
        {src && failed && <span className="sr-only">Image unavailable</span>}
      </>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
