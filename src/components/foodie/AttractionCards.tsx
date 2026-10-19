"use client";

/**
 * Cards for NON-FOOD points of interest — tourist attractions AND lodging
 * stays (the approved `public.places` discovery surface).
 *
 * Deliberately separate from PlaceCards (which renders FOOD places): no
 * price/cuisine/menu semantics exist for these rows, and the type emoji
 * comes from the row's REAL stored place_type — never decoration.
 */

import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistance } from "@/lib/foodie/location";
import { POI_PLACE_TYPES } from "@/lib/foodie/constants";
import { prettifyTag, verificationStatusLabel } from "@/lib/foodie/utils";
import type {
  PlaceType,
  PointOfInterest,
  PointOfInterestMaybeWithDistance,
} from "@/lib/foodie/types";

/** Label + emoji for a stored place_type; unknown values fall back to 'other'. */
export function poiTypeMeta(type: PlaceType): { label: string; emoji: string } {
  return (
    POI_PLACE_TYPES.find((t) => t.id === type) ??
    POI_PLACE_TYPES.find((t) => t.id === "other")!
  );
}

/** Verification chip classes — same tones as the food detail screen. */
const VERIFICATION_CHIP_CLASS = {
  verified: "border-emerald-200 bg-emerald-50 text-emerald-700",
  neutral: "border-border bg-card text-stone-600",
  unverified: "border-amber-200 bg-amber-50 text-amber-700",
} as const;

/** The gradient emoji tile used for cards and the detail hero. */
export function PoiTypeTile({
  poi,
  className,
  emojiClassName,
}: {
  poi: Pick<PointOfInterest, "placeType" | "name">;
  className?: string;
  emojiClassName?: string;
}) {
  const meta = poiTypeMeta(poi.placeType);
  return (
    <div
      role="img"
      aria-label={`${meta.label} — ${poi.name}`}
      className={cn(
        "relative grid size-full place-items-center overflow-hidden bg-gradient-to-br from-orange-100 via-amber-50 to-orange-50",
        className
      )}
    >
      <span
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(12rem_8rem_at_50%_115%,rgba(249,115,22,0.14),transparent)]"
      />
      <span aria-hidden="true" className={cn("text-[26px] drop-shadow-sm", emojiClassName)}>
        {meta.emoji}
      </span>
    </div>
  );
}

/**
 * One attractions-&-stays list row. Shows ONLY what the row actually
 * stores: type, name, locality/city, evidenced tags and the verification
 * state — no prices, no ratings, no invented hours.
 */
export function PoiListRow({
  poi,
  onSelect,
}: {
  poi: PointOfInterestMaybeWithDistance;
  onSelect: (id: string) => void;
}) {
  const meta = poiTypeMeta(poi.placeType);
  const verification = verificationStatusLabel(poi.verificationStatus);
  // "demo" is dataset metadata, not venue evidence — never rendered as a tag.
  const evidenceTags = poi.tags.filter((t) => t !== "demo");

  return (
    <button
      type="button"
      onClick={() => onSelect(poi.id)}
      className="flex w-full items-stretch gap-3 rounded-2xl border border-border/60 bg-card p-3 text-left shadow-sm transition-all hover:border-primary/40 hover:shadow-md active:scale-[0.99]"
      aria-label={`Open ${poi.name}`}
    >
      <PoiTypeTile poi={poi} className="size-[76px] shrink-0 rounded-xl" />
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-1.5">
          <span className="truncate text-[14.5px] font-bold text-foreground">{poi.name}</span>
          <span className="shrink-0 rounded-full bg-stone-100 px-2 py-0.5 text-[10.5px] font-bold text-stone-500">
            <span aria-hidden="true" className="mr-0.5">
              {meta.emoji}
            </span>
            {meta.label}
          </span>
        </span>
        <span className="mt-0.5 flex items-center gap-1 text-[12.5px] text-muted-foreground">
          <MapPin className="size-3 shrink-0" aria-hidden="true" />
          <span className="truncate">
            {poi.locality ?? poi.city}
            {poi.distanceKm != null && ` · ${formatDistance(poi.distanceKm)}`}
          </span>
        </span>
        {evidenceTags.length > 0 && (
          <span className="mt-1.5 flex flex-wrap gap-1">
            {evidenceTags.slice(0, 3).map((t) => (
              <span
                key={t}
                className="rounded-full border border-stone-200 bg-stone-50 px-2 py-0.5 text-[10.5px] font-semibold text-stone-600"
              >
                {prettifyTag(t)}
              </span>
            ))}
          </span>
        )}
        <span
          className={cn(
            "mt-1.5 inline-block rounded-full border px-2 py-0.5 text-[10.5px] font-semibold",
            VERIFICATION_CHIP_CLASS[verification.tone]
          )}
        >
          {verification.label}
        </span>
      </span>
    </button>
  );
}
