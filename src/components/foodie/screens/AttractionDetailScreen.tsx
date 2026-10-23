"use client";

/**
 * AttractionDetailScreen — detail for a NON-FOOD point of interest
 * (tourist attraction or lodging hotel) from the approved `public.places`
 * model (migration-008 design).
 *
 * Deliberately separate from PlaceDetailScreen (food places): no price row,
 * no menu, no hours, no reviews — none of those columns exist for
 * public.places in v1, and inventing them would break the honesty contract.
 * Every section renders ONLY what the row actually stores:
 *   - description (or an honest "not captured" note),
 *   - location card (locality/city + address when evidenced; distance ONLY
 *     from real stored coordinates — never estimated),
 *   - provenance panel (source / source URL — a source is not a
 *     verification),
 *   - evidenced tags,
 *   - one honest maps CTA (coordinate directions when coordinates exist,
 *     name+area search when they don't).
 * Verification status reuses the shared label conventions. Demo mode is
 * labelled with a dedicated chip.
 */

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Clock3,
  ExternalLink,
  FlaskConical,
  MapPin,
  Navigation,
  RefreshCw,
  SearchX,
  Tag,
} from "lucide-react";
import { toast } from "sonner";
import { useFoodieStore } from "@/lib/foodie/store";
import { getPointOfInterestById } from "@/lib/foodie/data/repository";
import type { DataMode } from "@/lib/foodie/data/types";
import type { PointOfInterest } from "@/lib/foodie/types";
import { formatDistance, haversineKm } from "@/lib/foodie/location";
import { originSourceLabel, useLocationStore } from "@/lib/foodie/locationStore";
import { prettifyTag, verificationStatusLabel } from "@/lib/foodie/utils";
import { poiTypeMeta, PoiTypeTile } from "../AttractionCards";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/** A completed (or failed) detail fetch, tagged with the request it belongs to. */
type PoiOutcome =
  | { key: string; kind: "ready"; place: PointOfInterest; mode: DataMode | null }
  | { key: string; kind: "error"; message: string | null; mode: DataMode | null };

/** Same info-card look as the food detail screen (kept local — the food
 *  screen stays byte-identical per the approved architecture decision). */
function InfoCard({
  icon,
  tone,
  children,
  as = "div",
  href,
  ariaLabel,
}: {
  icon: React.ReactNode;
  tone: "primary" | "neutral";
  children: React.ReactNode;
  as?: "div" | "a";
  href?: string;
  ariaLabel?: string;
}) {
  const toneClasses = {
    primary: "bg-orange-50 text-primary",
    neutral: "bg-stone-100 text-stone-400",
  }[tone];
  const className =
    "flex items-start gap-3.5 rounded-2xl border border-border/70 bg-card p-4 shadow-sm";
  if (as === "a" && href) {
    return (
      <a
        href={href}
        aria-label={ariaLabel}
        className={cn(className, "transition-colors hover:bg-accent/70 active:bg-accent")}
      >
        <span className={cn("grid size-10 shrink-0 place-items-center rounded-2xl", toneClasses)}>
          {icon}
        </span>
        {children}
      </a>
    );
  }
  return (
    <div className={className}>
      <span className={cn("grid size-10 shrink-0 place-items-center rounded-2xl", toneClasses)}>
        {icon}
      </span>
      {children}
    </div>
  );
}

function PoiSkeleton() {
  return (
    <div
      className="flex h-full flex-col bg-background"
      aria-busy="true"
      aria-live="polite"
      aria-label="Loading place details"
    >
      <Skeleton className="h-[264px] w-full shrink-0 rounded-none" />
      <div className="flex-1 space-y-3 px-5 pt-4">
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-14 w-full rounded-2xl" />
        <Skeleton className="h-14 w-full rounded-2xl" />
        <Skeleton className="h-4 w-1/3" />
      </div>
    </div>
  );
}

export function AttractionDetailScreen() {
  const back = useFoodieStore((s) => s.backFromAttraction);
  const selectedAttractionId = useFoodieStore((s) => s.selectedAttractionId);

  const origin = useLocationStore((s) => s.origin);
  const locState = useLocationStore();

  const [attempt, setAttempt] = useState(0);
  const [outcome, setOutcome] = useState<PoiOutcome | null>(null);

  // Keyed fetch (same pattern as the food detail screen): results are tagged
  // with the request they belong to, so an id change or retry immediately
  // reads as "loading" without setState inside the effect body.
  const detailKey = `${selectedAttractionId ?? ""}|${attempt}`;
  useEffect(() => {
    if (!selectedAttractionId) return;
    let cancelled = false;
    getPointOfInterestById(selectedAttractionId)
      .then((res) => {
        if (cancelled) return;
        setOutcome(
          res.place
            ? { key: detailKey, kind: "ready", place: res.place, mode: res.mode }
            : { key: detailKey, kind: "error", message: res.notice ?? null, mode: res.mode }
        );
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setOutcome({
            key: detailKey,
            kind: "error",
            message: err instanceof Error ? err.message : null,
            mode: null,
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [detailKey, selectedAttractionId]);

  const current = outcome?.key === detailKey ? outcome : null;
  const poi = current?.kind === "ready" ? current.place : null;
  const mode: DataMode | null = current?.mode ?? null;
  const detailStatus = current === null ? "loading" : current.kind === "ready" ? "ready" : "error";
  const retry = () => setAttempt((n) => n + 1);

  if (detailStatus === "loading") return <PoiSkeleton />;

  if (!poi) {
    return (
      <div className="grid h-full place-items-center px-8 text-center">
        <div>
          <SearchX className="mx-auto size-8 text-stone-300" aria-hidden="true" />
          <p className="mt-3 text-[15px] font-bold">This place isn&apos;t available</p>
          <p className="mt-1 max-w-[260px] text-[12.5px] leading-snug text-muted-foreground">
            {current?.kind === "error" && current.message
              ? current.message
              : "It may have been removed, or the connection dropped."}
          </p>
          <div className="mt-4 flex justify-center gap-2">
            <button
              type="button"
              onClick={retry}
              className="flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2.5 text-[13px] font-bold text-foreground transition-colors hover:bg-accent"
            >
              <RefreshCw className="size-3.5" aria-hidden="true" />
              Try again
            </button>
            <button
              type="button"
              onClick={back}
              className="rounded-full bg-primary px-5 py-2.5 text-[13.5px] font-bold text-white shadow-md"
            >
              Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const meta = poiTypeMeta(poi.placeType);
  const verification = verificationStatusLabel(poi.verificationStatus);
  const verificationChipClass = {
    verified: "border-emerald-200 bg-emerald-50 text-emerald-700",
    neutral: "border-border bg-card text-stone-600",
    unverified: "border-amber-200 bg-amber-50 text-amber-700",
  }[verification.tone];

  // Distance ONLY from real stored coordinates — places.rows with NULL
  // lat/lng (all of them until coordinates are evidenced) never get one.
  const coords =
    poi.latitude != null && poi.longitude != null
      ? { lat: poi.latitude, lng: poi.longitude }
      : null;
  const distanceKm = coords ? haversineKm(origin, coords) : null;
  const fromLabel = originSourceLabel(locState);

  // Two honest CTAs — identical contract to the food detail screen:
  // coordinates → coordinate-based directions; NULL → name+area search so
  // the location is never presented as verified.
  const mapsQuery = `${poi.name}, ${poi.locality ?? poi.city}`;
  const mapsUrl = coords
    ? `https://www.google.com/maps/dir/?api=1&destination=${coords.lat},${coords.lng}&travelmode=driving`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapsQuery)}`;

  // "demo" is dataset metadata, not venue evidence — never rendered as a tag.
  const evidenceTags = poi.tags.filter((t) => t !== "demo");

  return (
    <div className="flex h-full flex-col bg-background">
      {/* ---------------- hero (type tile — places has no photo feature) ------ */}
      <div className="relative shrink-0">
        <PoiTypeTile
          poi={poi}
          className="h-[264px] w-full rounded-none"
          iconClassName="size-16"
          showAttribution
          priority
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/25 to-transparent"
        />
        <button
          type="button"
          onClick={back}
          aria-label="Go back"
          className="absolute left-4 top-4 grid size-10 place-items-center rounded-full bg-black/45 text-white shadow-lg backdrop-blur transition-all hover:bg-black/65 active:scale-95"
        >
          <ArrowLeft className="size-4.5" />
        </button>
        <span className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-black/45 px-3 py-1 text-[11.5px] font-bold text-white backdrop-blur-sm">
          <meta.icon aria-hidden="true" className="size-3.5" />
          {meta.label}
        </span>
      </div>

      {/* ---------------- content ---------------- */}
      <div className="thin-scrollbar flex-1 overflow-y-auto px-5 pb-4 pt-4">
        <motion.div initial={{ y: 14, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
          <h1 className="text-[24px] font-extrabold leading-tight tracking-tight text-foreground">
            {poi.name}
          </h1>

          {/* type + verification chips */}
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            <span className="rounded-full border border-border bg-card px-2.5 py-1 text-[11.5px] font-semibold text-stone-600">
              {meta.label}
            </span>
            <span
              className={cn(
                "rounded-full border px-2.5 py-1 text-[11.5px] font-semibold",
                verificationChipClass
              )}
            >
              {verification.label}
            </span>
            {mode === "demo" && (
              <span
                className="inline-flex items-center gap-1 rounded-full border border-dashed border-amber-300 bg-amber-50 px-2.5 py-1 text-[11.5px] font-bold text-amber-700"
                title="This entry comes from the labelled demo dataset, not the real database"
              >
                <FlaskConical className="size-3" aria-hidden="true" />
                Demo data
              </span>
            )}
          </div>
        </motion.div>

        {/* description — only what the source actually published */}
        {poi.description ? (
          <p className="mt-3 text-[13.5px] leading-relaxed text-muted-foreground">
            {poi.description}
          </p>
        ) : (
          <p className="mt-3 rounded-2xl border border-dashed border-stone-200 bg-stone-50 px-4 py-3 text-[12.5px] leading-snug text-stone-500">
            No description has been captured for this place yet — Foodie
            doesn&apos;t pad listings with invented text.
          </p>
        )}

        {/* info cards — location (+ address when evidenced) */}
        <div className="mt-5 grid gap-2.5">
          <InfoCard icon={<MapPin className="size-4.5" aria-hidden="true" />} tone="primary">
            <div className="min-w-0">
              <p className="text-[13.5px] font-bold text-foreground">
                {poi.locality ?? poi.city}
                {distanceKm != null && ` · ${formatDistance(distanceKm)}`}
              </p>
              {poi.address && (
                <p className="mt-0.5 text-[12.5px] leading-snug text-muted-foreground">
                  {poi.address}
                </p>
              )}
              <p
                className={cn(
                  "mt-1 text-[11px] font-medium",
                  distanceKm != null ? "text-stone-400" : "text-amber-600"
                )}
              >
                {distanceKm != null
                  ? `Distance from ${fromLabel}`
                  : "Location pending verification — coordinates are never estimated"}
              </p>
            </div>
          </InfoCard>

          {/* provenance — where this listing came from, exactly as stored.
              A listing source is NOT a verification claim. */}
          {(poi.source || poi.sourceUrl) && (
            <div className="rounded-2xl border border-border/60 bg-stone-50/60 p-3">
              <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-stone-400">
                <ExternalLink className="size-3 shrink-0" aria-hidden="true" />
                Listing source
              </p>
              <p className="mt-1 text-[12px] leading-snug text-stone-500">
                {poi.source && <span className="font-semibold text-stone-600">{poi.source}</span>}
                {poi.source && poi.sourceUrl && " · "}
                {poi.sourceUrl && (
                  <a
                    href={poi.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="break-all font-medium text-primary underline decoration-primary/30 underline-offset-2 hover:decoration-primary"
                  >
                    {poi.sourceUrl.replace(/^https?:\/\//, "").slice(0, 80)}
                    {poi.sourceUrl.replace(/^https?:\/\//, "").length > 80 ? "…" : ""}
                  </a>
                )}
                <span className="mt-0.5 block text-[11px] text-stone-400">
                  Transcribed from a public listing — a source is not a verification.
                </span>
              </p>
            </div>
          )}

          {/* verification timing — rendered only when a real check happened */}
          {poi.lastVerifiedAt && (
            <InfoCard icon={<Clock3 className="size-4.5" aria-hidden="true" />} tone="neutral">
              <div className="min-w-0">
                <p className="text-[13.5px] font-bold text-foreground">Last verified</p>
                <p className="mt-0.5 text-[12.5px] text-muted-foreground">
                  {new Date(poi.lastVerifiedAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
            </InfoCard>
          )}
        </div>

        {/* tags — evidenced labels only */}
        {evidenceTags.length > 0 && (
          <section className="mt-6">
            <h2 className="flex items-center gap-1.5 text-[15.5px] font-bold text-foreground">
              <Tag className="size-4 text-primary" aria-hidden="true" />
              Tags
            </h2>
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {evidenceTags.map((t) => (
                <span
                  key={t}
                  className="rounded-full border border-stone-200 bg-stone-50 px-2.5 py-1 text-[11.5px] font-semibold text-stone-600"
                >
                  {prettifyTag(t)}
                </span>
              ))}
            </div>
          </section>
        )}

        <div className="h-2" />
      </div>

      {/* ---------------- sticky action ---------------- */}
      <div
        className="shrink-0 border-t border-border/60 bg-background/95 p-4 backdrop-blur shadow-[0_-12px_32px_-24px_rgba(0,0,0,0.35)]"
        style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
      >
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={
            coords ? `Get directions to ${poi.name}` : `Open ${poi.name} in Google Maps`
          }
          onClick={() =>
            coords
              ? toast.success("Opening directions…", {
                  description:
                    distanceKm != null
                      ? `${poi.name} · ${formatDistance(distanceKm)} from your location`
                      : poi.address ?? poi.locality ?? poi.city,
                })
              : toast.success("Opening Google Maps…", {
                  description: `${poi.name} · location pending verification`,
                })
          }
          className="foodie-gradient flex h-[52px] w-full items-center justify-center gap-2 rounded-2xl text-[15.5px] font-bold text-white shadow-xl shadow-orange-600/30 transition-all hover:opacity-95 active:scale-[0.98]"
        >
          {coords ? (
            <>
              <Navigation className="size-4.5" aria-hidden="true" />
              Get Directions
              <ExternalLink className="size-3.5 opacity-70" aria-hidden="true" />
            </>
          ) : (
            <>
              <MapPin className="size-4.5" aria-hidden="true" />
              Open in Google Maps
              <ExternalLink className="size-3.5 opacity-70" aria-hidden="true" />
            </>
          )}
        </a>
      </div>
    </div>
  );
}
