"use client";

/**
 * DestinationScreen — one destination and the foods it is famous for
 * (Destination → Famous Foods step of the discovery flow).
 *
 * Shows only REAL curated data: the destination header (name / region /
 * short factual description) and its destination-food cards. When nothing
 * has been curated yet, the screen says so honestly — nothing is invented.
 */

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Compass, Landmark, MapPin, RefreshCw, SearchX, UtensilsCrossed } from "lucide-react";
import { useFoodieStore } from "@/lib/foodie/store";
import {
  useDestinationAttractions,
  useDestinationDetail,
  useDestinationPlaces,
} from "@/lib/foodie/data/useDestinationFeed";
import { DestinationFoodBadge } from "../DestinationFoodBadge";
import { SafeImage } from "../SafeImage";
import { CategoryTile } from "../MediaTiles";
import { ListRow } from "../PlaceCards";
import { PoiListRow } from "../AttractionCards";
import { DemoDataBanner } from "../DemoDataBanner";
import { Skeleton } from "@/components/ui/skeleton";
import type {
  PlaceMaybeWithDistance,
  PointOfInterestMaybeWithDistance,
} from "@/lib/foodie/types";
import { useLocationStore } from "@/lib/foodie/locationStore";
import { haversineKm } from "@/lib/foodie/location";
import { cn } from "@/lib/utils";

export function DestinationScreen() {
  const destinationId = useFoodieStore((s) => s.selectedDestinationId);
  const screen = useFoodieStore((s) => s.screen);
  const backFromDestination = useFoodieStore((s) => s.backFromDestination);
  const openDestinationFood = useFoodieStore((s) => s.openDestinationFood);
  const openPlace = useFoodieStore((s) => s.openPlace);

  const detail = useDestinationDetail(destinationId);
  const placesFeed = useDestinationPlaces(destinationId);
  const attractionsFeed = useDestinationAttractions(destinationId);
  const origin = useLocationStore((s) => s.origin);
  const openAttraction = useFoodieStore((s) => s.openAttraction);

  // Area filter — derived ONLY from the actually-loaded rows (never
  // hardcoded): a destination whose data spans several localities (Tirupati
  // city vs Tirumala vs Renigunta…) gets honest per-area chips; a
  // single-area destination shows no chips at all. Reset per destination.
  const [areaFilter, setAreaFilter] = useState<string | null>(null);
  const [areasForId, setAreasForId] = useState<string | null>(destinationId);
  if (destinationId !== areasForId) {
    setAreasForId(destinationId);
    setAreaFilter(null);
  }

  const placeAreas = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of placesFeed.places) {
      const a = (p.area || "").trim();
      if (a) counts.set(a, (counts.get(a) ?? 0) + 1);
    }
    return [...counts.entries()].sort((x, y) => y[1] - x[1] || x[0].localeCompare(y[0]));
  }, [placesFeed.places]);

  const attractionAreas = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of attractionsFeed.attractions) {
      const a = (p.locality || "").trim();
      if (a) counts.set(a, (counts.get(a) ?? 0) + 1);
    }
    return [...counts.entries()].sort((x, y) => y[1] - x[1] || x[0].localeCompare(y[0]));
  }, [attractionsFeed.attractions]);

  // Real distance from the user's actual origin — the same Haversine rule as
  // every other list. Coordinate-less places keep NO distance and show their
  // honest "Location pending verification" state instead of a guessed number.
  const annotatedPlaces = placesFeed.places.map<PlaceMaybeWithDistance>((p) =>
    p.latitude != null && p.longitude != null
      ? { ...p, distanceKm: haversineKm(origin, { lat: p.latitude, lng: p.longitude }) }
      : p
  );

  // Same honesty rule for the non-food rows (attractions + lodging stays):
  // distance is computed ONLY from real stored coordinates — every row with
  // NULL lat/lng stays distance-less instead of being estimated.
  const annotatedAttractions = attractionsFeed.attractions.map<PointOfInterestMaybeWithDistance>(
    (p) =>
      p.latitude != null && p.longitude != null
        ? { ...p, distanceKm: haversineKm(origin, { lat: p.latitude, lng: p.longitude }) }
        : p
  );

  // Area-filtered views (chips above each list). The filter only applies
  // when the loaded data actually has several areas — otherwise it stays
  // inert so small datasets keep their original single-list behaviour.
  const shownPlaces =
    areaFilter && placeAreas.length > 1
      ? annotatedPlaces.filter((p) => (p.area || "").trim() === areaFilter)
      : annotatedPlaces;
  const shownAttractions =
    areaFilter && attractionAreas.length > 1
      ? annotatedAttractions.filter((p) => (p.locality || "").trim() === areaFilter)
      : annotatedAttractions;

  // No selection → there is nothing honest to show; return home. The screen
  // check keeps this guard from firing while this screen is merely EXITING
  // (AnimatePresence keeps it mounted during the transition).
  useEffect(() => {
    if (!destinationId && screen === "destination") backFromDestination();
  }, [destinationId, screen, backFromDestination]);

  if (!destinationId || screen !== "destination") return null;

  return (
    <div className="relative flex h-full flex-col bg-background">
      {/* ---------------- top bar ---------------- */}
      <header className="z-10 shrink-0 border-b border-border/50 bg-background/95 px-4 pb-3 pt-4 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={backFromDestination}
            aria-label="Back to Home"
            className="grid size-9 shrink-0 place-items-center rounded-full border border-border bg-card shadow-sm transition-colors hover:bg-accent"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
          </button>
          <span className="text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground">
            Destination
          </span>
        </div>
      </header>

      {/* ---------------- content ---------------- */}
      <main className="thin-scrollbar flex-1 overflow-y-auto pb-10" role="main">
        {detail.status === "loading" && (
          <div className="px-5 pt-5" aria-busy="true" aria-live="polite" aria-label="Loading destination">
            <Skeleton className="h-7 w-2/3" />
            <Skeleton className="mt-2 h-4 w-1/3" />
            <Skeleton className="mt-4 h-16 w-full rounded-2xl" />
            <div className="mt-6 space-y-2.5">
              {[0, 1].map((i) => (
                <Skeleton key={i} className="h-24 w-full rounded-2xl" />
              ))}
            </div>
          </div>
        )}

        {detail.status === "error" && (
          <div className="mx-5 mt-6 flex flex-col items-center rounded-3xl border border-dashed border-rose-200 bg-rose-50/50 px-6 py-12 text-center">
            <SearchX className="size-10 text-rose-300" aria-hidden="true" />
            <p className="mt-3 text-[15px] font-bold text-foreground">Couldn&apos;t load this destination</p>
            <p className="mt-1 max-w-[260px] text-[13px] leading-snug text-muted-foreground">
              {detail.error ?? "Something went wrong while fetching this destination."}
            </p>
            <button
              type="button"
              onClick={detail.reload}
              className="mt-4 flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-[13px] font-bold text-white shadow-md shadow-orange-600/25 transition-all hover:bg-primary/90 active:scale-95"
            >
              <RefreshCw className="size-3.5" aria-hidden="true" />
              Try again
            </button>
          </div>
        )}

        {detail.status === "ready" && !detail.destination && (
          <div className="mx-5 mt-6 flex flex-col items-center rounded-3xl border border-dashed border-border bg-card/60 px-6 py-12 text-center">
            <SearchX className="size-10 text-stone-300" aria-hidden="true" />
            <p className="mt-3 text-[15px] font-bold text-foreground">Destination not found</p>
            <p className="mt-1 max-w-[260px] text-[13px] leading-snug text-muted-foreground">
              This destination doesn&apos;t exist or isn&apos;t active in Foodie&apos;s database.
            </p>
          </div>
        )}

        {detail.status === "ready" && detail.destination && (
          <>
            {detail.mode === "demo" && (
              <div className="px-5 pt-4">
                <DemoDataBanner />
              </div>
            )}

            <section className="px-5 pt-5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-primary">
                {detail.destination.region ?? detail.destination.country}
              </p>
              <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-foreground">
                {detail.destination.name}
              </h1>
              {detail.destination.description && (
                <p className="mt-2 text-[13.5px] leading-relaxed text-muted-foreground">
                  {detail.destination.description}
                </p>
              )}
            </section>

            <section className="mt-6">
              <div className="px-5">
                <h2 className="flex items-center gap-2 text-[16px] font-bold text-foreground">
                  <UtensilsCrossed className="size-4 text-primary" aria-hidden="true" /> Famous &amp; local foods
                </h2>
                <p className="mt-0.5 text-[12.5px] text-muted-foreground">
                  What this place is genuinely known for — source-backed, never padded
                </p>
              </div>

              {detail.foods.length === 0 ? (
                <div className="mx-5 mt-4 flex flex-col items-center rounded-3xl border border-dashed border-border bg-card/60 px-6 py-10 text-center">
                  <Compass className="size-9 text-stone-300" aria-hidden="true" />
                  <p className="mt-3 text-[15px] font-bold text-foreground">
                    No foods curated for this destination yet
                  </p>
                  <p className="mt-1 max-w-[280px] text-[13px] leading-snug text-muted-foreground">
                    Foodie only lists destination foods that are backed by real sources —
                    check back after the next curated data pass.
                  </p>
                </div>
              ) : (
                <div className="mt-4 space-y-2.5 px-5">
                  {detail.foods.map((food) => (
                    <button
                      key={food.id}
                      type="button"
                      onClick={() => openDestinationFood(food.id, detail.destination!.id)}
                      className="flex w-full items-stretch gap-3 rounded-2xl border border-border/60 bg-card p-3 text-left shadow-sm transition-all hover:border-primary/40 hover:shadow-md active:scale-[0.99]"
                      aria-label={`Explore ${food.name}`}
                    >
                      <SafeImage
                        src={food.imageUrl}
                        alt={food.name}
                        className="size-[76px] shrink-0 rounded-xl object-cover"
                        fallback={
                          <CategoryTile
                            icon={UtensilsCrossed}
                            iconClassName="size-7 text-stone-400"
                            className="size-[76px] shrink-0 rounded-xl"
                          />
                        }
                      />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <span className="truncate text-[14.5px] font-bold text-foreground">
                            {food.name}
                          </span>
                          <DestinationFoodBadge designation={food.designation} />
                        </span>
                        {food.description && (
                          <span className="mt-0.5 line-clamp-2 block text-[12.5px] leading-snug text-muted-foreground">
                            {food.description}
                          </span>
                        )}
                        <span className="mt-1.5 inline-flex items-center gap-1 text-[11.5px] font-bold text-primary">
                          Explore places <span aria-hidden="true">→</span>
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </section>

            {/* ---------------- attractions & stays (NON-FOOD) ---------------- */}
            {/* The approved public.places discovery surface (migration-008
                design): tourist attractions AND lodging hotels, kept
                deliberately separate from the food list below. Until the
                migration is applied to the live database this renders the
                honest "not set up yet" state; demo mode serves the clearly
                labelled researched preview. Nothing is ever invented. */}
            <section className="mt-6">
              <div className="px-5">
                <h2 className="flex items-center gap-2 text-[16px] font-bold text-foreground">
                  <Landmark className="size-4 text-primary" aria-hidden="true" /> Attractions &amp; stays
                </h2>
                <p className="mt-0.5 text-[12.5px] text-muted-foreground">
                  Temples, sights and lodging — curated separately from food listings
                </p>
              </div>

              {attractionsFeed.status === "loading" && (
                <div className="mt-4 space-y-2.5 px-5" aria-busy="true" aria-live="polite">
                  {[0, 1].map((i) => (
                    <Skeleton key={i} className="h-24 w-full rounded-2xl" />
                  ))}
                </div>
              )}

              {attractionsFeed.status === "error" && (
                <div className="mx-5 mt-4 rounded-3xl border border-dashed border-rose-200 bg-rose-50/50 px-6 py-8 text-center">
                  <p className="text-[13.5px] font-bold text-foreground">
                    Couldn&apos;t load attractions for this destination
                  </p>
                  <button
                    type="button"
                    onClick={attractionsFeed.reload}
                    className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-[12.5px] font-bold text-white shadow-md shadow-orange-600/25 transition-all hover:bg-primary/90 active:scale-95"
                  >
                    <RefreshCw className="size-3.5" aria-hidden="true" />
                    Try again
                  </button>
                </div>
              )}

              {attractionsFeed.status === "ready" &&
                attractionsFeed.attractions.length === 0 &&
                (attractionsFeed.notice ? (
                  <div className="mx-5 mt-4 rounded-3xl border border-amber-200 bg-amber-50/70 px-6 py-8 text-center">
                    <Compass className="mx-auto size-9 text-amber-300" aria-hidden="true" />
                    <p className="mt-3 text-[14px] font-bold text-amber-900">
                      Attractions &amp; stays aren&apos;t set up yet
                    </p>
                    <p className="mx-auto mt-1 max-w-[300px] text-[12.5px] leading-snug text-amber-800">
                      {attractionsFeed.notice}
                    </p>
                  </div>
                ) : (
                  <div className="mx-5 mt-4 flex flex-col items-center rounded-3xl border border-dashed border-border bg-card/60 px-6 py-10 text-center">
                    <Compass className="size-9 text-stone-300" aria-hidden="true" />
                    <p className="mt-3 text-[15px] font-bold text-foreground">
                      No attractions recorded in {detail.destination.name} yet
                    </p>
                    <p className="mt-1 max-w-[280px] text-[13px] leading-snug text-muted-foreground">
                      Foodie lists only source-backed attractions and stays — the next
                      curated data pass will add this area&apos;s non-food places.
                    </p>
                  </div>
                ))}

              {attractionsFeed.status === "ready" && attractionsFeed.attractions.length > 0 && (
                <>
                  {attractionAreas.length > 1 && (
                    <AreaChipRail
                      areas={attractionAreas}
                      value={areaFilter}
                      onChange={setAreaFilter}
                      label="Filter attractions by area"
                    />
                  )}
                  <div className="mt-4 space-y-2.5 px-5">
                    {shownAttractions.map((p) => (
                      <PoiListRow key={p.id} poi={p} onSelect={openAttraction} />
                    ))}
                  </div>
                  {shownAttractions.length === 0 && (
                    <p className="px-5 pt-4 text-center text-[13px] text-muted-foreground">
                      Nothing recorded in {areaFilter} yet — try All areas.
                    </p>
                  )}
                </>
              )}
            </section>

            {/* ---------------- places in this destination ---------------- */}
            {/* The reusable multi-area browser: every discoverable FOOD place
                recorded in this destination's OWN city (Area A: Tirupati
                restaurants, cafés…). Nothing is hardcoded and zero rows
                render the honest "not curated yet" state — places from other
                cities are never mixed in. Lodging lives in the attractions &
                stays section above, not here. */}
            <section className="mt-6">
              <div className="px-5">
                <h2 className="flex items-center gap-2 text-[16px] font-bold text-foreground">
                  <MapPin className="size-4 text-primary" aria-hidden="true" /> Food places in{" "}
                  {detail.destination.name}
                </h2>
                <p className="mt-0.5 text-[12.5px] text-muted-foreground">
                  Eateries recorded for this area — restaurants, cafés and more
                </p>
              </div>

              {placesFeed.status === "loading" && (
                <div className="mt-4 space-y-2.5 px-5" aria-busy="true" aria-live="polite">
                  {[0, 1].map((i) => (
                    <Skeleton key={i} className="h-20 w-full rounded-2xl" />
                  ))}
                </div>
              )}

              {placesFeed.status === "error" && (
                <div className="mx-5 mt-4 rounded-3xl border border-dashed border-rose-200 bg-rose-50/50 px-6 py-8 text-center">
                  <p className="text-[13.5px] font-bold text-foreground">
                    Couldn&apos;t load places for this destination
                  </p>
                  <button
                    type="button"
                    onClick={placesFeed.reload}
                    className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-[12.5px] font-bold text-white shadow-md shadow-orange-600/25 transition-all hover:bg-primary/90 active:scale-95"
                  >
                    <RefreshCw className="size-3.5" aria-hidden="true" />
                    Try again
                  </button>
                </div>
              )}

              {placesFeed.status === "ready" && placesFeed.places.length === 0 && (
                <div className="mx-5 mt-4 flex flex-col items-center rounded-3xl border border-dashed border-border bg-card/60 px-6 py-10 text-center">
                  <Compass className="size-9 text-stone-300" aria-hidden="true" />
                  <p className="mt-3 text-[15px] font-bold text-foreground">
                    No places recorded in {detail.destination.name} yet
                  </p>
                  <p className="mt-1 max-w-[280px] text-[13px] leading-snug text-muted-foreground">
                    Foodie lists only verified listings — the next curated data pass
                    will add this area&apos;s places.
                  </p>
                </div>
              )}

              {placesFeed.status === "ready" && placesFeed.places.length > 0 && (
                <>
                  {placeAreas.length > 1 && (
                    <AreaChipRail
                      areas={placeAreas}
                      value={areaFilter}
                      onChange={setAreaFilter}
                      label="Filter places by area"
                    />
                  )}
                  <div className="mt-4 space-y-2.5 px-5">
                    {shownPlaces.map((p) => (
                      <ListRow key={p.id} place={p} onSelect={openPlace} />
                    ))}
                  </div>
                  {shownPlaces.length === 0 && (
                    <p className="px-5 pt-4 text-center text-[13px] text-muted-foreground">
                      Nothing recorded in {areaFilter} yet — try All areas.
                    </p>
                  )}
                </>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Area chip rail — data-derived locality filter                        */
/* ------------------------------------------------------------------ */

/**
 * One scrollable chip row shared by both destination lists. Every chip is a
 * real area present in the loaded rows, with its live count — nothing is
 * hardcoded and empty areas can never appear. Selecting a chip narrows BOTH
 * lists to that area (food places match on their mapped `area`, attractions
 * on their `locality`); "All" resets. The rail renders only when the data
 * actually spans several areas, so small datasets keep their simple list.
 */
function AreaChipRail({
  areas,
  value,
  onChange,
  label,
}: {
  /** [area, rowCount] pairs sorted by count desc then name. */
  areas: [string, number][];
  value: string | null;
  onChange: (area: string | null) => void;
  label: string;
}) {
  const total = areas.reduce((sum, [, n]) => sum + n, 0);
  return (
    <div
      className="foodie-rail mt-3 flex snap-x gap-2 overflow-x-auto px-5 pb-1"
      role="group"
      aria-label={label}
    >
      <button
        type="button"
        onClick={() => onChange(null)}
        aria-pressed={value === null}
        className={cn(
          "shrink-0 snap-start rounded-full border px-3.5 py-1.5 text-[12px] font-bold transition-all active:scale-[0.97]",
          value === null
            ? "border-primary bg-primary text-white shadow-sm shadow-orange-600/25"
            : "border-border bg-card text-stone-600 hover:border-primary/40 hover:text-foreground"
        )}
      >
        All areas
        <span className={cn("ml-1.5", value === null ? "text-white/80" : "text-stone-400")}>
          {total}
        </span>
      </button>
      {areas.map(([area, n]) => (
        <button
          key={area}
          type="button"
          onClick={() => onChange(value === area ? null : area)}
          aria-pressed={value === area}
          className={cn(
            "shrink-0 snap-start rounded-full border px-3.5 py-1.5 text-[12px] font-bold transition-all active:scale-[0.97]",
            value === area
              ? "border-primary bg-primary text-white shadow-sm shadow-orange-600/25"
              : "border-border bg-card text-stone-600 hover:border-primary/40 hover:text-foreground"
          )}
        >
          {area}
          <span className={cn("ml-1.5", value === area ? "text-white/80" : "text-stone-400")}>
            {n}
          </span>
        </button>
      ))}
    </div>
  );
}
