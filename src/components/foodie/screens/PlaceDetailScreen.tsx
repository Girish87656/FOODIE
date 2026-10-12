"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  BadgeCheck,
  Clock,
  ExternalLink,
  ImageOff,
  Images,
  MapPin,
  Navigation,
  Phone,
  Quote,
  RefreshCw,
  Star,
  Tag,
  UtensilsCrossed,
} from "lucide-react";
import { toast } from "sonner";
import { useFoodieStore } from "@/lib/foodie/store";
import { getRestaurantById } from "@/lib/foodie/data/repository";
import type { DataMode } from "@/lib/foodie/data/types";
import type { Dish, PhotoCredit, Place } from "@/lib/foodie/types";
import { formatDistance, haversineKm } from "@/lib/foodie/location";
import { originSourceLabel, useLocationStore } from "@/lib/foodie/locationStore";
import {
  formatHours,
  inr,
  isOpenNow,
  prettifyTag,
  verificationStatusLabel,
} from "@/lib/foodie/utils";
import { RatingBadge, PlaceBadge } from "../Badges";
import { ReviewsSection } from "../ReviewsSection";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/** A completed (or failed) detail fetch, tagged with the request it belongs to. */
type DetailOutcome =
  | { key: string; kind: "ready"; place: Place; mode: DataMode | null }
  | { key: string; kind: "error"; mode: DataMode | null };

/** Detail-screen loading state — hero + text line placeholders. */
function DetailSkeleton() {
  return (
    <div
      className="flex h-full flex-col bg-background"
      aria-busy="true"
      aria-live="polite"
      aria-label="Loading place details"
    >
      <Skeleton className="h-[260px] w-full shrink-0 rounded-none" />
      <div className="flex-1 space-y-3 px-5 pt-4">
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-14 w-full rounded-2xl" />
        <Skeleton className="h-14 w-full rounded-2xl" />
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-4 w-2/5" />
      </div>
    </div>
  );
}

/** Shared look for the info cards (location / hours / phone). */
function InfoCard({
  icon,
  tone,
  children,
  as = "div",
  href,
  ariaLabel,
}: {
  icon: React.ReactNode;
  tone: "primary" | "open" | "closed" | "neutral";
  children: React.ReactNode;
  as?: "div" | "a";
  href?: string;
  ariaLabel?: string;
}) {
  const toneClasses = {
    primary: "bg-orange-50 text-primary",
    open: "bg-emerald-50 text-emerald-600",
    closed: "bg-rose-50 text-rose-500",
    neutral: "bg-stone-100 text-stone-400",
  }[tone];
  const className =
    "flex items-start gap-3 rounded-2xl border border-border/70 bg-card p-3.5 shadow-sm";
  if (as === "a" && href) {
    return (
      <a href={href} aria-label={ariaLabel} className={cn(className, "transition-colors hover:bg-accent/70 active:bg-accent")}>
        <span className={cn("grid size-9 shrink-0 place-items-center rounded-xl", toneClasses)}>
          {icon}
        </span>
        {children}
      </a>
    );
  }
  return (
    <div className={className}>
      <span className={cn("grid size-9 shrink-0 place-items-center rounded-xl", toneClasses)}>
        {icon}
      </span>
      {children}
    </div>
  );
}

/**
 * Compact nutrition caption from the dishes table's real columns —
 * only the values that actually exist are included (never "0 kcal").
 */
function nutritionLine(d: Dish): string | null {
  const parts: string[] = [];
  if (d.calories != null) parts.push(`${Math.round(d.calories)} kcal`);
  if (d.protein != null) parts.push(`P ${d.protein} g`);
  if (d.carbs != null) parts.push(`C ${d.carbs} g`);
  if (d.fat != null) parts.push(`F ${d.fat} g`);
  return parts.length > 0 ? parts.join(" · ") : null;
}

/** Screen 6 — place details */
export function PlaceDetailScreen() {
  const back = useFoodieStore((s) => s.backFromDetail);
  const selectedPlaceId = useFoodieStore((s) => s.selectedPlaceId);
  const [photoIdx, setPhotoIdx] = useState(0);
  const [attempt, setAttempt] = useState(0);
  const [outcome, setOutcome] = useState<DetailOutcome | null>(null);
  /** Photo URLs that failed to load in THIS session (broken link / network).
   *  They render an honest "photo unavailable" tile — never a fake image. */
  const [failedPhotos, setFailedPhotos] = useState<Record<string, true>>({});

  /** Licensing metadata for a photo (migration-006), matched by URL.
   *  Rendered only for what is actually recorded — never invented. */
  const photoCreditFor = (src: string): PhotoCredit | undefined =>
    outcome?.kind === "ready" ? outcome.place.photoCredits?.find((c) => c.url === src) : undefined;
  const creditLabelFor = (c: PhotoCredit): string => {
    const parts = [c.attribution, c.license].filter((x): x is string => Boolean(x && x.trim()));
    if (parts.length > 0) return parts.join(" · ");
    if (c.sourceUrl) {
      try {
        return new URL(c.sourceUrl).hostname;
      } catch {
        return c.sourceUrl.slice(0, 40);
      }
    }
    return "";
  };

  // active origin (GPS fix, manual city or prototype city) for the distance math
  const origin = useLocationStore((s) => s.origin);
  const locState = useLocationStore();
  const locSource = locState.source;

  // Load through the data-access layer — Supabase when connected,
  // the labelled demo dataset otherwise. No hardcoded data in the UI.
  // (Result is keyed to the request; state updates happen in async callbacks.)
  const detailKey = `${selectedPlaceId ?? ""}|${attempt}`;
  useEffect(() => {
    if (!selectedPlaceId) return;
    let cancelled = false;
    getRestaurantById(selectedPlaceId)
      .then((res) => {
        if (cancelled) return;
        setPhotoIdx(0);
        setFailedPhotos({});
        setOutcome(
          res.place
            ? { key: detailKey, kind: "ready", place: res.place, mode: res.mode }
            : { key: detailKey, kind: "error", mode: res.mode }
        );
      })
      .catch(() => {
        if (!cancelled) setOutcome({ key: detailKey, kind: "error", mode: null });
      });
    return () => {
      cancelled = true;
    };
  }, [detailKey, selectedPlaceId]);

  const current = outcome?.key === detailKey ? outcome : null;
  const place = current?.kind === "ready" ? current.place : null;
  const mode: DataMode | null = current?.mode ?? null;
  const detailStatus =
    current === null ? "loading" : current.kind === "ready" ? "ready" : "error";
  const retry = () => setAttempt((n) => n + 1);

  if (detailStatus === "loading") {
    return <DetailSkeleton />;
  }

  if (!place) {
    return (
      <div className="grid h-full place-items-center px-8 text-center">
        <div>
          <UtensilsCrossed className="mx-auto size-8 text-stone-300" aria-hidden="true" />
          <p className="mt-3 text-[15px] font-bold">This place moved its kitchen</p>
          <p className="mt-1 max-w-[240px] text-[12.5px] leading-snug text-muted-foreground">
            It may have been removed from the database, or the connection dropped.
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
              Back to discovery
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---- honesty guards (unchanged contract with the database) ---------------
  // Hours are only claimed when they actually exist: the raw opening_hours
  // string for database rows, or the demo dataset's own explicit hours.
  // NULL hours show "not captured yet" — never the mapper's fallback window.
  const hoursKnown = place.openingHours != null || mode === "demo";
  const hoursText = place.openingHours
    ? place.openingHours.replace("-", " – ")
    : formatHours(place);
  const open = hoursKnown ? isOpenNow(place) : false;

  // Haversine distance from the user's chosen origin to THIS place.
  // Places awaiting coordinate verification (NULL lat/lng) show no distance —
  // we never guess coordinates.
  const placeCoords =
    place.latitude != null && place.longitude != null
      ? { lat: place.latitude, lng: place.longitude }
      : null;
  const distanceKm = placeCoords ? haversineKm(origin, placeCoords) : null;
  const fromLabel = originSourceLabel(locState);

  // Two honest CTAs, keyed on the PLACE's own coordinates (not the origin):
  //  - verified latitude/longitude → "Get Directions" with the coordinate-based
  //    directions URL (destination = exact stored pin);
  //  - NULL coordinates → "Open in Google Maps" via a name + stored-address
  //    search query, so we never pretend the location is verified.
  const mapsUrl = placeCoords
    ? `https://www.google.com/maps/dir/?api=1&destination=${placeCoords.lat},${placeCoords.lng}&travelmode=driving`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.mapsQuery)}`;

  // Phone from the database — a Call button only exists when a number exists.
  const telHref = place.phone ? `tel:${place.phone.replace(/[^\d+]/g, "")}` : null;

  // Menu provenance (migration-007): unique source domains actually recorded on
  // this place's dish rows. Nothing is displayed when no dish carries a
  // source — provenance is shown only when it exists, never guessed.
  const menuSources = (() => {
    const byHost = new Map<string, string>();
    for (const d of [...place.signatureDishes, ...place.famousDishes]) {
      if (!d.sourceUrl) continue;
      try {
        const host = new URL(d.sourceUrl).hostname.replace(/^www\./, "");
        if (!byHost.has(host)) byHost.set(host, d.sourceUrl);
      } catch {
        /* malformed stored URL — skip it rather than render a broken link */
      }
    }
    return [...byHost.entries()];
  })();

  // ---- photo failure honesty ------------------------------------------------
  // A stored URL that cannot load (removed file, network hiccup, blocked host)
  // degrades to an explicit "photo unavailable" tile — the broken-image glyph
  // of a dead <img> is never shown, and nothing is substituted for it.
  const markPhotoFailed = (src: string) =>
    setFailedPhotos((prev) => (prev[src] ? prev : { ...prev, [src]: true }));

  const verification = verificationStatusLabel(place.verificationStatus);
  const verificationChipClass = {
    verified: "border-emerald-200 bg-emerald-50 text-emerald-700",
    neutral: "border-border bg-card text-stone-600",
    unverified: "border-amber-200 bg-amber-50 text-amber-700",
  }[verification.tone];

  return (
    <div className="flex h-full flex-col bg-background">
      {/* ---------------- hero photos ---------------- */}
      <div className="relative shrink-0">
        {place.photos.length === 0 ? (
          /* no photos in the database yet — honest gradient placeholder */
          <div className="grid h-[260px] w-full place-items-center bg-gradient-to-br from-orange-100 via-amber-50 to-orange-50">
            <UtensilsCrossed className="size-14 text-orange-300" aria-hidden="true" />
          </div>
        ) : (
          <div
            className="no-scrollbar flex h-[260px] snap-x snap-mandatory overflow-x-auto"
            onScroll={(e) => {
              const el = e.currentTarget;
              setPhotoIdx(Math.round(el.scrollLeft / el.clientWidth));
            }}
            aria-label={`Photos of ${place.name}`}
          >
            {place.photos.map((src, i) =>
              failedPhotos[src] ? (
                <div
                  key={`${src}-failed`}
                  role="img"
                  aria-label={`${place.name} photo ${i + 1} — currently unavailable`}
                  className="grid h-full w-full shrink-0 snap-center place-items-center bg-gradient-to-br from-orange-100 via-amber-50 to-orange-50"
                  title="This photo couldn't be loaded right now"
                >
                  <ImageOff className="size-10 text-orange-300" aria-hidden="true" />
                </div>
              ) : (
                <div key={src} className="relative h-full w-full shrink-0 snap-center">
                  <img
                    src={src}
                    alt={`${place.name} photo ${i + 1}`}
                    className="h-full w-full object-cover"
                    loading={i === 0 ? "eager" : "lazy"}
                    onError={() => markPhotoFailed(src)}
                  />
                  {(() => {
                    const credit = photoCreditFor(src);
                    if (!credit) return null;
                    const label = creditLabelFor(credit);
                    if (!label) return null;
                    return (
                      <span className="absolute bottom-2 left-2 max-w-[85%] truncate rounded-full bg-black/50 px-2.5 py-1 text-[10.5px] font-semibold text-white backdrop-blur-sm">
                        {label}
                      </span>
                    );
                  })()}
                </div>
              )
            )}
          </div>
        )}

        <button
          type="button"
          onClick={back}
          aria-label="Go back"
          className="absolute left-4 top-4 grid size-10 place-items-center rounded-full bg-black/45 text-white shadow-lg backdrop-blur transition-all hover:bg-black/65 active:scale-95"
        >
          <ArrowLeft className="size-4.5" />
        </button>

        <div className="absolute right-4 top-4 flex gap-1.5">
          {place.badges.hiddenGem && <PlaceBadge label="Hidden Gem" />}
          {place.badges.localFavorite && <PlaceBadge label="Local Favorite" />}
          {place.badges.popular && <PlaceBadge label="Popular" />}
          {place.badges.budget && <PlaceBadge label="Budget Pick" />}
          {place.badges.studentFriendly && <PlaceBadge label="Student Friendly" />}
          {(place.verificationStatus === "verified" || place.badges.verified) && (
            <PlaceBadge label="✓ Verified" />
          )}
        </div>

        {/* photo dots */}
        {place.photos.length > 1 && (
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5" aria-hidden="true">
            {place.photos.map((src, i) => (
              <span
                key={src}
                className={cn(
                  "size-1.5 rounded-full transition-all",
                  i === photoIdx ? "w-4 bg-white" : "bg-white/50"
                )}
              />
            ))}
          </div>
        )}
      </div>

      {/* ---------------- content ---------------- */}
      <div className="thin-scrollbar flex-1 overflow-y-auto px-5 pb-4 pt-4">
        <motion.div initial={{ y: 14, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
          {/* name */}
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-[22px] font-extrabold leading-tight tracking-tight text-foreground">
                {place.name}
              </h1>
              {place.tagline && (
                <p className="mt-0.5 text-[13px] font-medium italic text-muted-foreground">
                  {place.tagline}
                </p>
              )}
            </div>
          </div>

          {/* rating / price row */}
          <div className="mt-3 flex flex-wrap items-center gap-2 text-[12.5px]">
            <RatingBadge rating={place.rating} className="px-2 py-1 text-[12.5px]" />
            {place.rating > 0 && (
              <span
                className="text-[11px] font-medium text-stone-400"
                title="The place's listed rating from its public listing — kept separate from Foodie user reviews below"
              >
                Listed rating
              </span>
            )}
            {place.ratingCount > 0 && (
              <>
                <span className="font-semibold text-stone-600">
                  {place.ratingCount.toLocaleString("en-IN")} ratings
                </span>
                <span className="text-stone-300">•</span>
              </>
            )}
            {place.priceRange != null && (
              <>
                <span className="font-bold text-primary">{place.priceRange}</span>
                <span className="text-stone-300">•</span>
              </>
            )}
            {place.costForTwo != null && (
              <span className="font-medium text-stone-600">{inr(place.costForTwo)} for two</span>
            )}
          </div>

          {/* category + verification status */}
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {place.cuisines.map((c) => (
              <span
                key={c}
                className="rounded-full border border-border bg-card px-2.5 py-1 text-[11.5px] font-semibold text-stone-600"
              >
                {c}
              </span>
            ))}
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
                className="rounded-full border border-dashed border-amber-300 bg-amber-50 px-2.5 py-1 text-[11.5px] font-bold text-amber-700"
                title="This entry comes from the labelled demo dataset, not the real database"
              >
                🧪 Demo data
              </span>
            )}
          </div>
        </motion.div>

        {/* info cards — location, hours, phone */}
        <div className="mt-5 grid gap-2.5">
          {/* location section */}
          <InfoCard icon={<MapPin className="size-4.5" aria-hidden="true" />} tone="primary">
            <div className="min-w-0">
              <p className="text-[13.5px] font-bold text-foreground">
                {place.area}
                {distanceKm != null && ` · ${formatDistance(distanceKm)}`}
              </p>
              <p className="mt-0.5 text-[12.5px] leading-snug text-muted-foreground">
                {place.address}
              </p>
              <p
                className={cn(
                  "mt-1 text-[11px] font-medium",
                  distanceKm != null ? "text-stone-400" : "text-amber-600"
                )}
              >
                {distanceKm != null
                  ? `Distance from ${fromLabel}`
                  : "Location pending verification"}
              </p>
            </div>
          </InfoCard>

          {/* opening-hours section */}
          <InfoCard
            icon={<Clock className="size-4.5" aria-hidden="true" />}
            tone={!hoursKnown ? "neutral" : open ? "open" : "closed"}
          >
            <div className="min-w-0">
              {hoursKnown ? (
                <>
                  <p className="flex items-center gap-1.5 text-[13.5px] font-bold">
                    <span className={open ? "text-emerald-600" : "text-rose-500"}>
                      {open ? "Open now" : "Closed right now"}
                    </span>
                  </p>
                  <p className="mt-0.5 text-[12.5px] text-muted-foreground">
                    Opening hours · {hoursText}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-[13.5px] font-bold text-stone-500">
                    Hours not captured yet
                  </p>
                  <p className="mt-0.5 text-[12.5px] leading-snug text-muted-foreground">
                    Timings will appear once they&apos;re verified — we don&apos;t
                    guess opening hours.
                  </p>
                </>
              )}
            </div>
          </InfoCard>

          {/* phone — only when the database actually has a number */}
          {telHref && (
            <InfoCard
              as="a"
              href={telHref}
              ariaLabel={`Call ${place.name} at ${place.phone}`}
              icon={<Phone className="size-4.5" aria-hidden="true" />}
              tone="primary"
            >
              <div className="min-w-0">
                <p className="text-[13.5px] font-bold text-foreground">Phone</p>
                <p className="mt-0.5 text-[12.5px] text-muted-foreground">
                  {place.phone} · tap to call
                </p>
              </div>
            </InfoCard>
          )}

          {/* provenance — where this listing came from, exactly as stored.
              Shown only when the database actually records a source; nothing
              is invented for rows without one. A listing source is NOT a
              verification claim. */}
          {(place.source || place.sourceUrl) && (
            <div className="rounded-2xl border border-border/60 bg-stone-50/60 p-3">
              <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-stone-400">
                <ExternalLink className="size-3 shrink-0" aria-hidden="true" />
                Listing source
              </p>
              <p className="mt-1 text-[12px] leading-snug text-stone-500">
                {place.source && <span className="font-semibold text-stone-600">{place.source}</span>}
                {place.source && place.sourceUrl && " · "}
                {place.sourceUrl && (
                  <a
                    href={place.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="break-all font-medium text-primary underline decoration-primary/30 underline-offset-2 hover:decoration-primary"
                  >
                    {place.sourceUrl.replace(/^https?:\/\//, "").slice(0, 80)}
                    {place.sourceUrl.replace(/^https?:\/\//, "").length > 80 ? "…" : ""}
                  </a>
                )}
                <span className="mt-0.5 block text-[11px] text-stone-400">
                  Transcribed from a public listing — a source is not a verification.
                </span>
              </p>
            </div>
          )}
        </div>

        {/* tags — the database's finer type labels (never invented) */}
        {place.tags && place.tags.length > 0 && (
          <section className="mt-6">
            <h2 className="flex items-center gap-1.5 text-[15.5px] font-bold text-foreground">
              <Tag className="size-4 text-primary" aria-hidden="true" />
              Tags
            </h2>
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {place.tags.map((t) => (
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

        {/* dishes / menu — REAL rows from the dishes table only.
            Both sections always exist in the schema's terms (is_signature
            splits them); when a place has no dish rows at all we show a
            clean empty state instead of inventing menu items. */}
        {place.famousDishes.length === 0 && place.signatureDishes.length === 0 ? (
          <section className="mt-6">
            <h2 className="flex items-center gap-1.5 text-[15.5px] font-bold text-foreground">
              <UtensilsCrossed className="size-4 text-primary" aria-hidden="true" />
              Menu
            </h2>
            <div
              className="mt-2.5 grid place-items-center rounded-2xl border border-dashed border-stone-200 bg-stone-50 px-4 py-8 text-center"
              aria-live="polite"
            >
              <UtensilsCrossed className="size-6 text-stone-300" aria-hidden="true" />
              <p className="mt-2 text-[13.5px] font-bold text-stone-500">
                No dishes added yet
              </p>
              <p className="mt-1 max-w-[260px] text-[12px] leading-snug text-stone-400">
                Menu items will appear here once they&apos;re added for this place.
              </p>
            </div>
          </section>
        ) : (
          <>
            {/* famous dishes */}
            {place.famousDishes.length > 0 && (
              <section className="mt-6">
                <h2 className="flex items-center gap-1.5 text-[15.5px] font-bold text-foreground">
                  <Star className="size-4 fill-amber-400 text-amber-400" aria-hidden="true" />
                  Famous dishes
                </h2>
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {place.famousDishes.map((d, i) => (
                    <span
                      key={`${d.name}-${i}`}
                      title={d.description}
                      className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-[12.5px] font-semibold text-amber-800"
                    >
                      {d.emoji && (
                        <span aria-hidden="true" className="mr-1">{d.emoji}</span>
                      )}
                      {d.name}
                      {d.price != null && (
                        <span className="ml-1 font-bold text-amber-600">{inr(d.price)}</span>
                      )}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* signature dishes */}
            {place.signatureDishes.length > 0 && (
              <section className="mt-6">
                <h2 className="flex items-center gap-1.5 text-[15.5px] font-bold text-foreground">
                  <BadgeCheck className="size-4 text-primary" aria-hidden="true" />
                  Signature dishes
                </h2>
                <div className="mt-2.5 divide-y divide-border/60 overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm">
                  {place.signatureDishes.map((d, i) => {
                    const nutrition = nutritionLine(d);
                    return (
                      <div
                        key={`${d.name}-${i}`}
                        className="flex items-start justify-between gap-3 px-4 py-3"
                      >
                        <div className="min-w-0">
                          <span className="flex min-w-0 flex-wrap items-center gap-1.5">
                            {d.emoji && (
                              <span aria-hidden="true" className="text-base">{d.emoji}</span>
                            )}
                            <span className="text-[13.5px] font-semibold text-foreground">
                              {d.name}
                            </span>
                            {d.category && (
                              <span className="rounded-full bg-stone-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-stone-500">
                                {prettifyTag(d.category)}
                              </span>
                            )}
                          </span>
                          {d.description && (
                            <p className="mt-0.5 text-[12px] leading-snug text-muted-foreground">
                              {d.description}
                            </p>
                          )}
                          {nutrition && (
                            <p className="mt-0.5 text-[11px] font-medium text-stone-400">
                              {nutrition}
                            </p>
                          )}
                        </div>
                        {d.price != null && (
                          <span className="shrink-0 text-[13px] font-bold text-stone-600">
                            {inr(d.price)}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* honest provenance for recorded menu data (migration-007) —
                rendered only when dish rows actually carry source URLs */}
            {menuSources.length > 0 && (
              <p className="mt-3 flex flex-wrap items-center gap-x-1 gap-y-0.5 px-1 text-[11px] font-medium text-stone-400">
                <ExternalLink className="size-3 shrink-0" aria-hidden="true" />
                <span>
                  Items &amp; prices from published listing{menuSources.length > 1 ? "s" : ""}:
                </span>
                {menuSources.map(([host, url], i) => (
                  <span key={host} className="flex items-center gap-1">
                    {i > 0 && <span aria-hidden="true">·</span>}
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-stone-500 underline decoration-dotted underline-offset-2 transition-colors hover:text-primary"
                    >
                      {host}
                    </a>
                  </span>
                ))}
              </p>
            )}
          </>
        )}

        {/* photos — REAL rows from the restaurant_photos table only.
            The gallery always renders: stored photos in the grid, or a clean
            empty state when none exist yet. Stock/fake images are never shown. */}
        <section className="mt-6">
          <h2 className="flex items-center gap-1.5 text-[15.5px] font-bold text-foreground">
            <Images className="size-4 text-primary" aria-hidden="true" />
            Photos
            {place.photos.length > 0 && (
              <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[11px] font-bold text-stone-500">
                {place.photos.length}
              </span>
            )}
          </h2>
          {place.photos.length === 0 ? (
            <div
              className="mt-2.5 grid place-items-center rounded-2xl border border-dashed border-stone-200 bg-stone-50 px-4 py-8 text-center"
              aria-live="polite"
            >
              <ImageOff className="size-6 text-stone-300" aria-hidden="true" />
              <p className="mt-2 text-[13.5px] font-bold text-stone-500">
                No photos added yet
              </p>
              <p className="mt-1 max-w-[260px] text-[12px] leading-snug text-stone-400">
                Photos will appear here once they&apos;re added for this place.
              </p>
            </div>
          ) : (
            <div className="mt-2.5 grid grid-cols-3 gap-1.5 overflow-hidden rounded-2xl">
              {place.photos.map((src, i) =>
                failedPhotos[src] ? (
                  <div
                    key={`${src}-${i}-failed`}
                    role="img"
                    aria-label={`${place.name} gallery photo ${i + 1} — currently unavailable`}
                    title="This photo couldn't be loaded right now"
                    className="grid aspect-square w-full place-items-center rounded-lg bg-gradient-to-br from-orange-100 via-amber-50 to-orange-50"
                  >
                    <ImageOff className="size-5 text-orange-300" aria-hidden="true" />
                  </div>
                ) : (
                  <div key={`${src}-${i}`} className="relative">
                    <img
                      src={src}
                      alt={`${place.name} gallery photo ${i + 1}`}
                      loading="lazy"
                      onError={() => markPhotoFailed(src)}
                      className="aspect-square w-full rounded-lg object-cover transition-transform hover:scale-[1.03]"
                    />
                    {(() => {
                      const credit = photoCreditFor(src);
                      if (!credit) return null;
                      const label = creditLabelFor(credit);
                      if (!label) return null;
                      return (
                        <span
                          className="absolute inset-x-1 bottom-1 truncate rounded bg-black/55 px-1.5 py-0.5 text-[9px] font-semibold text-white"
                          title={`${label}${credit.sourceUrl ? ` — ${credit.sourceUrl}` : ""}`}
                        >
                          {label}
                        </span>
                      );
                    })()}
                  </div>
                )
              )}
            </div>
          )}
        </section>

        {/* local recommendation */}
        {place.localTip.trim().length > 0 && (
          <section className="mt-6">
            <h2 className="flex items-center gap-1.5 text-[15.5px] font-bold text-foreground">
              <Quote className="size-4 text-primary" aria-hidden="true" />
              Local recommendation
            </h2>
            <div className="relative mt-2.5 overflow-hidden rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 p-4">
              <Quote
                className="absolute -right-2 -top-2 size-16 text-orange-100"
                aria-hidden="true"
              />
              <p className="relative text-[13.5px] font-medium leading-relaxed text-stone-700">
                {place.localTip}
              </p>
              <p className="relative mt-2.5 text-[11.5px] font-bold uppercase tracking-wide text-primary">
                — A Foodie local
              </p>
            </div>
          </section>
        )}

        {/* reviews — REAL rows from the reviews table only (public read;
            writes use the signed-in user's own session + RLS). The average
            here is computed from user reviews and is deliberately kept
            separate from the seeded listed rating shown above. */}
        <ReviewsSection placeId={place.id} />

        <div className="h-2" />
      </div>

      {/* ---------------- sticky actions ---------------- */}
      <div
        className="shrink-0 border-t border-border/60 bg-background/95 p-4 backdrop-blur"
        style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
      >
        <div className="flex gap-2.5">
          {telHref && (
            <a
              href={telHref}
              onClick={() =>
                toast.success(`Calling ${place.name}…`, {
                  description: place.phone,
                })
              }
              aria-label={`Call ${place.name}`}
              className="flex h-[52px] items-center justify-center gap-2 rounded-2xl border border-primary/30 bg-orange-50 px-5 text-[14.5px] font-bold text-primary transition-all hover:bg-orange-100 active:scale-[0.98]"
            >
              <Phone className="size-4.5" aria-hidden="true" />
              Call
            </a>
          )}
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={
              placeCoords
                ? `Get directions to ${place.name}`
                : `Open ${place.name} in Google Maps`
            }
            onClick={() =>
              placeCoords
                ? toast.success("Opening directions…", {
                    description:
                      locSource === "browser" && distanceKm != null
                        ? `${place.name} · ${formatDistance(distanceKm)} from your location`
                        : place.address,
                  })
                : toast.success("Opening Google Maps…", {
                    description: `${place.name} · location pending verification`,
                  })
            }
            className="foodie-gradient flex h-[52px] flex-1 items-center justify-center gap-2 rounded-2xl text-[15.5px] font-bold text-white shadow-xl shadow-orange-600/30 transition-all hover:opacity-95 active:scale-[0.98]"
          >
            {placeCoords ? (
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
    </div>
  );
}
