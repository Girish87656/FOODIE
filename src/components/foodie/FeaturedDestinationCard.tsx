"use client";

/**
 * FeaturedDestinationCard — Prototype 4's editorial "explore a destination"
 * hero for the Home feed, using a VERIFIED photograph.
 *
 * Honesty contract:
 *   • The card only appears when the destination actually exists in the
 *     database (never fabricated for a missing row).
 *   • The photo is a VERIFIED, licensed, attributed image from the curated
 *     registry (src/data/venue-images.ts — retrieved via the Wikimedia
 *     Commons API with license metadata and visually verified to depict
 *     THIS landmark). The on-image credit names exactly what the photo
 *     shows — the temple, not "Tirupati the city" — so the caption can
 *     never oversell the picture's subject.
 *   • Destinations without a curated photo simply don't get a featured
 *     card — nothing is ever substituted.
 */

import { ArrowRight, MapPin } from "lucide-react";
import { useFoodieStore } from "@/lib/foodie/store";
import { useDestinations } from "@/lib/foodie/data/useDestinationFeed";
import { VENUE_IMAGES } from "@/data/venue-images";
import { cn } from "@/lib/utils";

/**
 * Editorial curation: destination slug → a verified photo OF ONE OF ITS
 * LANDMARKS, with the caption naming the actual subject. Only entries whose
 * photo lives in the verified registry may appear here.
 */
const FEATURED_DESTINATION_PHOTOS = {
  tirupati: {
    venueImageKey: "9cbbed7e-b526-5167-ba53-30214cfe3c44", // Sri Venkateswara Swamy Temple, Tirumala
    kicker: "Featured destination",
    subject: "Sri Venkateswara Temple, Tirumala",
  },
} as const;

export function FeaturedDestinationCard({ className }: { className?: string }) {
  const openDestination = useFoodieStore((s) => s.openDestination);
  const { status, destinations } = useDestinations();

  if (status !== "ready") return null;

  // One card, only when BOTH the destination row and the verified photo exist.
  for (const [slug, curated] of Object.entries(FEATURED_DESTINATION_PHOTOS)) {
    const destination = destinations.find((d) => d.slug === slug);
    if (!destination) continue;
    const venue = VENUE_IMAGES[curated.venueImageKey];
    if (!venue) continue;

    return (
      <section aria-label={`Featured destination: ${destination.name}`} className={className}>
        <button
          type="button"
          onClick={() => openDestination(destination.id)}
          aria-label={`Explore ${destination.name} — food, stays and attractions`}
          className={cn(
            "group relative block h-[188px] w-full overflow-hidden rounded-3xl text-left",
            "ring-1 ring-black/10 shadow-lg shadow-stone-900/10",
            "transition-all duration-300 hover:shadow-xl hover:shadow-stone-900/15 focus-visible:ring-2 focus-visible:ring-primary"
          )}
        >
          <img
            src={venue.src}
            {...(() => {
              const srcSet = venue.src.endsWith(".webp")
                ? `${venue.src.replace(".webp", "-small.webp")} 320w, ${venue.src} 800w`
                : null;
              return srcSet ? { srcSet, sizes: "(max-width: 480px) 100vw, 430px" } : {};
            })()}
            alt=""
            loading="eager"
            fetchPriority="high"
            decoding="async"
            className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          />
          {/* readability scrims */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-stone-950/85 via-stone-950/25 to-transparent"
          />
          <div className="absolute inset-x-0 bottom-0 p-4">
            <p className="flex items-center gap-1 text-[10.5px] font-bold uppercase tracking-wider text-white/85">
              <MapPin className="size-3" aria-hidden="true" />
              {curated.kicker}
            </p>
            <span className="mt-0.5 flex items-center justify-between gap-3">
              <span className="min-w-0">
                <span className="block truncate text-[19px] font-extrabold tracking-tight text-white">
                  {destination.name}
                  {destination.region ? `, ${destination.region}` : ""}
                </span>
                <span className="mt-0.5 block truncate text-[11.5px] font-medium text-white/80">
                  Famous foods · temples &amp; sights · stays
                </span>
              </span>
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-white text-stone-900 shadow-md transition-transform duration-300 group-hover:translate-x-0.5">
                <ArrowRight className="size-4" aria-hidden="true" />
              </span>
            </span>
          </div>
          {/* attribution — exactly what the photo shows, per the license */}
          <span className="absolute left-3 top-3 max-w-[86%] truncate rounded-full bg-black/45 px-2.5 py-1 text-[9.5px] font-semibold text-white backdrop-blur-sm">
            {curated.subject} · Photo: {venue.credit} · {venue.license}
          </span>
        </button>
      </section>
    );
  }

  return null;
}
