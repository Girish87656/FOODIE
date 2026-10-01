"use client";

import { MapPin, Users, UtensilsCrossed } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistance } from "@/lib/foodie/location";
import { RatingBadge, PlaceBadge } from "./Badges";
import type { PlaceMaybeWithDistance } from "@/lib/foodie/types";

interface PlaceCardBase {
  place: PlaceMaybeWithDistance;
  onSelect: (id: string) => void;
}

/**
 * Honest distance chip — a REAL Haversine distance when the place has
 * verified coordinates, otherwise the "Location pending verification" label.
 * Never a guessed number, never 0 km.
 */
function DistanceChip({
  place,
  className,
}: {
  place: PlaceMaybeWithDistance;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "whitespace-nowrap rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm",
        className
      )}
    >
      {place.distanceKm != null
        ? formatDistance(place.distanceKm)
        : "Location pending verification"}
    </span>
  );
}

/**
 * Photo with an honest placeholder when the database row has no image yet
 * (demo data always ships photos; real rows may not).
 */
function PlacePhoto({
  src,
  alt,
  className,
  iconClassName,
}: {
  src?: string;
  alt: string;
  className?: string;
  iconClassName?: string;
}) {
  if (!src) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={cn(
          "grid size-full place-items-center bg-gradient-to-br from-orange-100 via-amber-50 to-orange-50",
          className
        )}
      >
        <UtensilsCrossed
          className={cn("size-6 text-orange-300", iconClassName)}
          aria-hidden="true"
        />
      </div>
    );
  }
  return <img src={src} alt={alt} loading="lazy" className={className} />;
}

function PlaceMeta({ place, className }: { place: PlaceMaybeWithDistance; className?: string }) {
  return (
    <p className={cn("truncate text-[12px] text-muted-foreground", className)}>
      {place.cuisines.join(" · ")}
    </p>
  );
}

/* ------------------------------------------------------------------ */
/* Carousel card — used in the horizontal scroll rails                */
/* ------------------------------------------------------------------ */
export function CarouselCard({ place, onSelect }: PlaceCardBase) {
  return (
    <button
      type="button"
      onClick={() => onSelect(place.id)}
      className="group w-[196px] shrink-0 snap-start overflow-hidden rounded-2xl border border-border/60 bg-card text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-primary"
    >
      <div className="relative h-[118px] w-full overflow-hidden">
        <PlacePhoto
          src={place.photos[0]}
          alt={`${place.name} — ${place.cuisines.join(", ")} in ${place.area}`}
          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {place.badges.hiddenGem && (
          <PlaceBadge label="Hidden Gem" className="absolute left-2 top-2" />
        )}
        {place.badges.localFavorite && (
          <PlaceBadge label="Local Favorite" className="absolute left-2 top-2" />
        )}
        {place.badges.budget && (
          <PlaceBadge label="Budget Pick" className="absolute left-2 top-2" />
        )}
        <DistanceChip place={place} className="absolute bottom-2 left-2" />
      </div>
      <div className="space-y-1 p-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className="truncate text-[14px] font-bold text-foreground">{place.name}</h3>
          <RatingBadge rating={place.rating} />
        </div>
        <PlaceMeta place={place} />
        {place.costForTwo != null && (
          <div className="flex items-center gap-1 pt-0.5 text-[12px] font-semibold text-stone-600">
            <span className="text-primary">{place.priceRange}</span>
            <span className="text-stone-300">|</span>
            <span>₹{place.costForTwo.toLocaleString("en-IN")} for two</span>
          </div>
        )}
      </div>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* List row — image left, info right (Nearby list & search results)    */
/* ------------------------------------------------------------------ */
export function ListRow({ place, onSelect, rank }: PlaceCardBase & { rank?: number }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(place.id)}
      className="group flex w-full items-center gap-3 rounded-2xl border border-border/60 bg-card p-2.5 text-left shadow-sm transition-all hover:border-primary/30 hover:shadow-md focus-visible:ring-2 focus-visible:ring-primary"
    >
      {typeof rank === "number" && (
        <span
          className={cn(
            "grid size-6 shrink-0 place-items-center rounded-full text-[11px] font-extrabold",
            rank <= 3 ? "bg-amber-100 text-amber-700" : "bg-stone-100 text-stone-500"
          )}
          aria-label={`Ranked number ${rank}`}
        >
          {rank}
        </span>
      )}
      <div className="relative size-[76px] shrink-0 overflow-hidden rounded-xl">
        <PlacePhoto
          src={place.photos[0]}
          alt={`${place.name} — ${place.cuisines.join(", ")}`}
          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
          iconClassName="size-5"
        />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <h3 className="truncate text-[14.5px] font-bold text-foreground">{place.name}</h3>
          <RatingBadge rating={place.rating} />
        </div>
        <PlaceMeta place={place} className="mt-0.5" />
        <div className="mt-1 flex items-center gap-2 text-[11.5px] text-muted-foreground">
          {place.distanceKm != null ? (
            <span className="flex shrink-0 items-center gap-0.5 font-semibold text-stone-600">
              <MapPin className="size-3 shrink-0" aria-hidden="true" />
              {formatDistance(place.distanceKm)}
            </span>
          ) : (
            <span className="flex shrink-0 items-center gap-0.5 font-semibold text-amber-700">
              <MapPin className="size-3 shrink-0" aria-hidden="true" />
              Location pending verification
            </span>
          )}
          <span className="min-w-0 truncate">
            {place.area}
          </span>
          {place.priceRange && (
            <>
              <span className="shrink-0 text-stone-300">•</span>
              <span className="shrink-0 font-semibold text-primary">{place.priceRange}</span>
            </>
          )}
        </div>
      </div>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Compact wide card — hero-ish row for Local Favorites               */
/* ------------------------------------------------------------------ */
export function WideCard({ place, onSelect }: PlaceCardBase) {
  const locals = (place.ratingCount / 1000).toFixed(1);
  return (
    <button
      type="button"
      onClick={() => onSelect(place.id)}
      className="group relative w-[240px] shrink-0 snap-start overflow-hidden rounded-2xl text-left shadow-md transition-all hover:-translate-y-0.5 hover:shadow-xl focus-visible:ring-2 focus-visible:ring-primary"
    >
      <div className="relative h-[150px] w-full">
        <PlacePhoto
          src={place.photos[0]}
          alt={`${place.name} — ${place.cuisines.join(", ")} in ${place.area}`}
          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
          iconClassName="size-8"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
        <DistanceChip
          place={place}
          className="absolute right-2 top-2"
        />
        <div className="absolute inset-x-0 bottom-0 space-y-1 p-3">
          <div className="flex items-center gap-2">
            <RatingBadge rating={place.rating} />
            {place.ratingCount > 0 && (
              <span className="flex items-center gap-1 text-[10.5px] font-semibold text-white/85">
                <Users className="size-3" aria-hidden="true" />
                Loved by {locals}k locals
              </span>
            )}
          </div>
          <h3 className="truncate text-[15px] font-bold text-white">{place.name}</h3>
          <p className="truncate text-[11.5px] text-white/75">
            {place.cuisines.join(" · ")}{place.priceRange ? ` · ${place.priceRange}` : ""}
          </p>
        </div>
      </div>
    </button>
  );
}
