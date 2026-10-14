"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  Bell,
  ChevronDown,
  Compass,
  Database,
  Flame,
  LocateFixed,
  MapPinned,
  RefreshCw,
  SearchX,
} from "lucide-react";
import { toast } from "sonner";
import { useFoodieStore } from "@/lib/foodie/store";
import { PLACE_CATEGORIES } from "@/lib/foodie/constants";
import {
  useAllRestaurants,
  useRestaurantFeed,
} from "@/lib/foodie/data/useRestaurantFeed";
import {
  GITAM_TEST_LOCATION,
  PROTOTYPE_CITY,
  haversineKm,
  withDistances,
} from "@/lib/foodie/location";
import {
  useLocationHeadline,
  useLocationStore,
} from "@/lib/foodie/locationStore";
import type {
  PlaceMaybeWithDistance,
  PlaceWithDistance,
} from "@/lib/foodie/types";
import {
  budgetEats,
  byDistance,
  byRating,
  hiddenGems,
  localFavorites,
  matchesQuery,
  popularPlaces,
} from "@/lib/foodie/utils";
import { SectionHeader } from "../SectionHeader";
import { SearchBar } from "../SearchBar";
import { CarouselCard, ListRow, WideCard } from "../PlaceCards";
import { DiscoveryFilterBar } from "../FilterBar";
import { DestinationDiscoveryCard } from "../DestinationDiscoveryCard";
import { LocationPromptBanner, LocationSheet } from "../LocationControls";
import { AccountControls } from "../AccountControls";
import { AssistantControls } from "../AssistantControls";
import { DemoDataBanner } from "../DemoDataBanner";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

function greeting(): string {
  const h = new Date().getHours();
  if (h < 5) return "Late night cravings";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

/**
 * Distance sort that tolerates places WITHOUT a distance (NULL coordinates):
 * they sink to the end of the list instead of faking a number. Only places
 * with a real Haversine distance can ever rank first.
 */
function byKnownDistance(a: PlaceMaybeWithDistance, b: PlaceMaybeWithDistance): number {
  return (
    (a.distanceKm ?? Number.POSITIVE_INFINITY) -
    (b.distanceKm ?? Number.POSITIVE_INFINITY)
  );
}

/** Expandable horizontal rail section */
function RailSection({
  emoji,
  title,
  subtitle,
  children,
  total,
  onSeeAll,
  expanded,
}: {
  emoji?: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  total: number;
  onSeeAll: () => void;
  expanded: boolean;
}) {
  return (
    <section className="mt-7 first:mt-5">
      <SectionHeader
        title={title}
        subtitle={subtitle}
        emoji={emoji}
        actionLabel={expanded ? "Show less" : total > 4 ? `See all ${total}` : undefined}
        onAction={onSeeAll}
        className="px-5"
      />
      {expanded ? (
        <div className="space-y-2.5 px-5">{children}</div>
      ) : (
        <div className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-1">
          {children}
        </div>
      )}
    </section>
  );
}

const SECTION_ICONS = {
  favorites: "❤️",
} as const;

/** Full-feed loading state — shown while the data layer fetches. */
function FeedSkeleton() {
  return (
    <div className="px-5 pt-5" aria-busy="true" aria-live="polite" aria-label="Loading places">
      <Skeleton className="h-12 w-full rounded-2xl" />
      <Skeleton className="mt-4 h-24 w-full rounded-3xl" />
      <div className="mt-6 space-y-2.5">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-2xl border border-border/50 bg-card p-2.5"
          >
            <Skeleton className="size-[76px] shrink-0 rounded-xl" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          </div>
        ))}
      </div>
      <p className="mt-5 text-center text-[11.5px] font-medium text-stone-400">
        Finding great food around you…
      </p>
    </div>
  );
}

/** Full-feed error state with retry. */
function FeedErrorCard({ error, onRetry }: { error: string | null; onRetry: () => void }) {
  return (
    <div className="mx-5 mt-6 flex flex-col items-center rounded-3xl border border-dashed border-rose-200 bg-rose-50/50 px-6 py-12 text-center">
      <AlertTriangle className="size-10 text-rose-300" aria-hidden="true" />
      <p className="mt-3 text-[15px] font-bold text-foreground">Couldn&apos;t load restaurants</p>
      <p className="mt-1 max-w-[260px] text-[13px] leading-snug text-muted-foreground">
        {error ?? "Something went wrong while fetching places."}
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-4 flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-[13px] font-bold text-white shadow-md shadow-orange-600/25 transition-all hover:bg-primary/90 active:scale-95"
      >
        <RefreshCw className="size-3.5" aria-hidden="true" />
        Try again
      </button>
    </div>
  );
}

/** The database answered, but it has zero restaurants (or the demo set is empty). */
function EmptyDatabaseCard({ mode }: { mode: "supabase" | "demo" | null }) {
  const supabase = mode === "supabase";
  return (
    <div className="mx-5 mt-6 flex flex-col items-center rounded-3xl border border-dashed border-border bg-card/60 px-6 py-12 text-center">
      <Database className="size-10 text-stone-300" aria-hidden="true" />
      <p className="mt-3 text-[15px] font-bold text-foreground">
        {supabase ? "No restaurants in your database yet" : "No demo places near this origin"}
      </p>
      <p className="mt-1 max-w-[280px] text-[13px] leading-snug text-muted-foreground">
        {supabase
          ? "Foodie is connected to Supabase, but the restaurants table is empty. Add the first pilot-area place (GITAM → Doddaballapura) — guide in supabase/README.md."
          : "The labelled demo dataset only covers the pilot corridor (GITAM University → Doddaballapura). Pick a corridor point manually, or connect Supabase for real places."}
      </p>
    </div>
  );
}

/** Screen 5 — the discovery home feed, powered by the user's real location */
export function HomeScreen() {
  const go = useFoodieStore((s) => s.go);
  const userName = useFoodieStore((s) => s.userName);
  const eatContext = useFoodieStore((s) => s.eatContext);
  const preferences = useFoodieStore((s) => s.preferences);
  const searchQuery = useFoodieStore((s) => s.searchQuery);
  const setSearchQuery = useFoodieStore((s) => s.setSearchQuery);
  const activeCategory = useFoodieStore((s) => s.activeCategory);
  const setActiveCategory = useFoodieStore((s) => s.setActiveCategory);
  const openPlace = useFoodieStore((s) => s.openPlace);
  const distanceFilterKm = useFoodieStore((s) => s.distanceFilterKm);
  const setDistanceFilter = useFoodieStore((s) => s.setDistanceFilter);
  const sortBy = useFoodieStore((s) => s.sortBy);
  const setSortBy = useFoodieStore((s) => s.setSortBy);

  // --- real location state (native Geolocation API → Zustand) ---
  const headline = useLocationHeadline();
  const locSource = useLocationStore((s) => s.source);
  const locStatus = useLocationStore((s) => s.status);
  const origin = useLocationStore((s) => s.origin);

  const [expanded, setExpanded] = useState<string | null>(null);
  const [locSheetOpen, setLocSheetOpen] = useState(false);

  const searching = searchQuery.trim().length > 0 || activeCategory !== null;

  /* 0) Restaurant data — two read-only sources:
   *    - nearby feed: coordinate-bearing places, distance-annotated server-side;
   *    - full list:   every discoverable place, INCLUDING rows whose
   *      coordinates are still NULL ("Location pending verification").
   *    Neither source ever writes to the database. */
  const feed = useRestaurantFeed(origin);
  const allFeed = useAllRestaurants();

  /* 1) Haversine distance from the active origin to every coordinate-bearing
   *    place. NULL-coordinate rows never enter this math — they are kept as-is
   *    (NO distanceKm) and tracked separately as "pending". */
  const withDistance = useMemo(() => withDistances(feed.places, origin), [feed.places, origin]);
  const allAnnotated = useMemo(
    () =>
      allFeed.places.map((p) =>
        p.latitude != null && p.longitude != null
          ? { ...p, distanceKm: haversineKm(origin, { lat: p.latitude, lng: p.longitude }) }
          : p
      ),
    [allFeed.places, origin]
  );

  /* Merge by id — nearby results win (authoritative distance source). */
  const merged = useMemo(() => {
    const byId = new Map<string, PlaceMaybeWithDistance>();
    for (const p of allAnnotated) byId.set(p.id, p);
    for (const p of withDistance) byId.set(p.id, p);
    return [...byId.values()];
  }, [allAnnotated, withDistance]);

  /* Places with a KNOWN distance — the only ones eligible for radius
   * filters and "nearest" sorting. */
  const withKnownDistance = useMemo(
    () => merged.filter((p): p is PlaceWithDistance => p.distanceKm != null),
    [merged]
  );

  /* NULL-coordinate places — honest "Location pending verification" rows.
   * They carry no distance and never fake one. */
  const pending = useMemo(() => merged.filter((p) => p.distanceKm == null), [merged]);

  /* 2) Distance filter applies ONLY to places with known distances. */
  const inRange = useMemo(
    () =>
      distanceFilterKm == null
        ? withKnownDistance
        : withKnownDistance.filter((p) => p.distanceKm <= distanceFilterKm),
    [withKnownDistance, distanceFilterKm]
  );

  /* 3) Sort + section the filtered list. */
  const nearby = useMemo(
    () => (sortBy === "nearest" ? [...inRange].sort(byDistance) : [...inRange].sort(byRating)),
    [inRange, sortBy]
  );
  const gems = useMemo(() => hiddenGems(inRange), [inRange]);
  const favorites = useMemo(() => localFavorites(inRange), [inRange]);
  const popular = useMemo(() => popularPlaces(inRange), [inRange]);
  const budget = useMemo(() => budgetEats(inRange), [inRange]);

  /* 4) Search / category results — pending places join the pool whenever no
   *    radius filter is active (an unknown distance can't honestly satisfy
   *    "within X km"). With "Nearest First" they sort to the very end. */
  const results = useMemo(() => {
    const pool: PlaceMaybeWithDistance[] =
      distanceFilterKm == null ? [...inRange, ...pending] : [...inRange];
    let list = pool;
    if (activeCategory) {
      list = list.filter((p) => p.categoryIds.includes(activeCategory));
    }
    if (searchQuery.trim()) {
      list = list.filter((p) => matchesQuery(p, searchQuery));
    }
    return sortBy === "nearest" ? [...list].sort(byKnownDistance) : [...list].sort(byRating);
  }, [inRange, pending, distanceFilterKm, activeCategory, searchQuery, sortBy]);

  /* Page-level loading / error across BOTH feeds (never a silent partial). */
  const feedLoading = feed.status === "loading" || allFeed.status === "loading";
  const feedError =
    feed.status === "error" ? feed.error : allFeed.status === "error" ? allFeed.error : null;
  const retryFeed = () => {
    feed.reload();
    allFeed.reload();
  };

  const discoveryEmpty =
    nearby.length === 0 &&
    gems.length === 0 &&
    favorites.length === 0 &&
    popular.length === 0 &&
    budget.length === 0 &&
    // pending places count as content only when no radius filter hides them
    (distanceFilterKm != null || pending.length === 0);

  /* The backend answered, but the database truly has zero restaurants. */
  const dbEmpty =
    feed.status === "ready" && allFeed.status === "ready" && merged.length === 0;

  const demoBanner = feed.mode === "demo" || allFeed.mode === "demo";
  const demoNotice = feed.notice ?? allFeed.notice;

  const preferredCats = PLACE_CATEGORIES.filter((c) => preferences.includes(c.id));

  const nearbySubtitle =
    locSource === "browser"
      ? "Closest to your live location"
      : locSource === "manual"
        ? "Distances from your selected city"
        : locSource === "test"
          ? `Distances from ${GITAM_TEST_LOCATION.label}`
          : `Around ${PROTOTYPE_CITY.area} · prototype origin`;

  function toggleExpand(key: string) {
    setExpanded((cur) => (cur === key ? null : key));
  }

  return (
    <div className="relative flex h-full flex-col bg-background">
      {/* ---------------- header ---------------- */}
      <header className="z-10 shrink-0 border-b border-border/50 bg-background/95 px-5 pb-3 pt-5 backdrop-blur supports-[backdrop-filter]:bg-background/80 foodie-header-shadow">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setLocSheetOpen(true)}
            aria-haspopup="dialog"
            className="group flex min-w-0 items-start gap-1.5 text-left"
          >
            <span className="relative mt-0.5 shrink-0">
              <MapPinned
                className={cn(
                  "size-4",
                  headline.tone === "live" ? "text-emerald-600" : "text-primary"
                )}
                aria-hidden="true"
              />
              {headline.tone === "live" && (
                <span
                  className="absolute -right-0.5 -top-0.5 size-1.5 animate-pulse rounded-full bg-emerald-500"
                  aria-hidden="true"
                />
              )}
            </span>
            <span className="min-w-0">
              <span
                className={cn(
                  "block text-[10.5px] font-bold uppercase tracking-wider",
                  headline.tone === "live"
                    ? "text-emerald-600"
                    : headline.tone === "warn"
                      ? "text-amber-600"
                      : "text-muted-foreground"
                )}
              >
                {headline.kicker}
              </span>
              <span className="flex items-center gap-0.5 text-[14px] font-bold leading-tight text-foreground">
                <span className="truncate">{headline.value}</span>
                <ChevronDown
                  className="size-3.5 shrink-0 text-muted-foreground transition-transform group-hover:translate-y-0.5"
                  aria-hidden="true"
                />
              </span>
            </span>
          </button>

          <button
            type="button"
            onClick={() =>
              toast.info("No new alerts", { description: "Foodie tips will show up here soon." })
            }
            aria-label="Notifications"
            className="relative grid size-9 shrink-0 place-items-center rounded-full border border-border bg-card shadow-sm transition-colors hover:bg-accent"
          >
            <Bell className="size-4" />
            <span className="absolute right-2 top-2 size-1.5 rounded-full bg-primary" aria-hidden="true" />
          </button>

          {/* Real-session account controls (avatar + sign out) — renders
              nothing in demo mode, so the header is unchanged there */}
          <AccountControls />
        </div>

        <SearchBar value={searchQuery} onChange={setSearchQuery} className="mt-3.5" />

        {/* discovery controls — one row of functional dropdowns.
            Every choice really drives the feed below (store-backed):
            Category (All + the 7 pilot categories), Distance (Any/1/3/5/10 km),
            Sort (Nearest First / Top Rated). */}
        <DiscoveryFilterBar
          distanceFilterKm={distanceFilterKm}
          onDistanceChange={setDistanceFilter}
          sortBy={sortBy}
          onSortChange={setSortBy}
          activeCategory={activeCategory}
          onCategoryChange={(id) => {
            setActiveCategory(id);
            // same contract as the old "All" chip: picking All also clears the
            // free-text query so the dropdown truly resets the filter state
            if (id === null) setSearchQuery("");
          }}
          className="mt-3"
        />
      </header>

      {/* ---------------- feed ---------------- */}
      <main className="thin-scrollbar flex-1 overflow-y-auto pb-10" role="main">
        {feedLoading && <FeedSkeleton />}

        {!feedLoading && feedError && (
          <FeedErrorCard error={feedError} onRetry={retryFeed} />
        )}

        {!feedLoading && !feedError && (
          <>
            {demoBanner && (
              <div className="px-5 pt-4">
                <DemoDataBanner notice={demoNotice} />
              </div>
            )}
        {searching ? (
          /* ------- search / filter results ------- */
          <section className="px-5 pt-5">
            <h2 className="text-[16px] font-bold text-foreground">
              {results.length} {results.length === 1 ? "place" : "places"}{" "}
              {searchQuery.trim() ? (
                <>
                  for <span className="text-primary">&ldquo;{searchQuery.trim()}&rdquo;</span>
                </>
              ) : (
                <>
                  in{" "}
                  <span className="text-primary">
                    {PLACE_CATEGORIES.find((c) => c.id === activeCategory)?.label}
                  </span>
                </>
              )}
              {distanceFilterKm != null && (
                <span className="text-muted-foreground"> · within {distanceFilterKm} km</span>
              )}
            </h2>
            {preferredCats.length > 0 && !searchQuery.trim() && (
              <p className="mt-0.5 text-[12.5px] text-muted-foreground">
                Based on your love for {preferredCats.map((c) => c.label).join(", ")}
              </p>
            )}
            <div className="mt-4 space-y-2.5">
              {results.map((p) => (
                <ListRow key={p.id} place={p} onSelect={openPlace} />
              ))}
              {results.length === 0 && (
                <div className="flex flex-col items-center rounded-2xl border border-dashed border-border bg-card/60 px-6 py-10 text-center">
                  <SearchX className="size-9 text-stone-300" aria-hidden="true" />
                  <p className="mt-3 text-[15px] font-bold text-foreground">Nothing matches… yet</p>
                  <p className="mt-1 text-[13px] text-muted-foreground">
                    {distanceFilterKm != null
                      ? `Nothing within ${distanceFilterKm} km — try widening the distance.`
                      : "Try \u201Cbiryani\u201D, \u201Cdosa\u201D, \u201Ccoffee\u201D or clear the filters."}
                  </p>
                  <div className="mt-4 flex gap-2">
                    {distanceFilterKm != null && (
                      <button
                        type="button"
                        onClick={() => setDistanceFilter(null)}
                        className="rounded-full border border-border bg-card px-4 py-2 text-[13px] font-bold text-foreground transition-colors hover:bg-accent"
                      >
                        Any distance
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery("");
                        setActiveCategory(null);
                      }}
                      className="rounded-full bg-primary px-4 py-2 text-[13px] font-bold text-white shadow-md shadow-orange-600/25 transition-all hover:bg-primary/90 active:scale-95"
                    >
                      Reset search
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>
        ) : (
          /* ------- discovery sections ------- */
          <>
            {/* 📍 Use my current location — clear GPS control */}
            <div className="mx-5 mt-5">
              <LocationPromptBanner onOpen={() => setLocSheetOpen(true)} />
            </div>

            {/* greeting */}
            <motion.section
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mx-5 mt-4 overflow-hidden rounded-3xl foodie-gradient-soft p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[15px] font-extrabold tracking-tight text-foreground">
                    {greeting()}
                    {userName ? `, ${userName}` : ""}! <span aria-hidden="true">🌆</span>
                  </p>
                  <p className="mt-0.5 truncate text-[12.5px] text-muted-foreground">
                    {eatContext
                      ? `Showing picks great for ${eatContext.toLowerCase()} dining`
                      : "Hungry? Let's find your next favorite spot."}
                  </p>
                </div>
                <span className="text-3xl" aria-hidden="true">
                  {eatContext === "Travelling" ? "🧳" : eatContext === "Family" ? "👨‍👩‍👧" : eatContext === "Partner" ? "❤️" : eatContext === "Friends" ? "🎉" : "🍽️"}
                </span>
              </div>
              {preferences.length > 0 && (
                <div className="no-scrollbar mt-3 flex gap-1.5 overflow-x-auto" aria-label="Your preferences">
                  {preferredCats.map((c) => (
                    <span
                      key={c.id}
                      className="shrink-0 rounded-full bg-white/80 px-2.5 py-1 text-[11px] font-semibold text-stone-700 shadow-sm"
                    >
                      {c.emoji} {c.label}
                    </span>
                  ))}
                </div>
              )}
            </motion.section>

            {/* destination discovery — Famous here card + destination chips.
                Tapping a famous food opens the destination-food screen
                (curated places, honest empty state — never invented). */}
            <DestinationDiscoveryCard className="mt-4" />

            {dbEmpty ? (
              <EmptyDatabaseCard mode={feed.mode} />
            ) : discoveryEmpty ? (
              /* everything filtered out by the distance radius */
              <div className="mx-5 mt-6 flex flex-col items-center rounded-3xl border border-dashed border-border bg-card/60 px-6 py-12 text-center">
                <MapPinned className="size-10 text-stone-300" aria-hidden="true" />
                <p className="mt-3 text-[15px] font-bold text-foreground">
                  {distanceFilterKm != null
                    ? `No places within ${distanceFilterKm} km`
                    : "No places to show right now"}
                </p>
                <p className="mt-1 max-w-[240px] text-[13px] leading-snug text-muted-foreground">
                  Widen the radius to see everything Foodie has around this origin.
                </p>
                <button
                  type="button"
                  onClick={() => setDistanceFilter(null)}
                  className="mt-4 rounded-full bg-primary px-4 py-2 text-[13px] font-bold text-white shadow-md shadow-orange-600/25 transition-all hover:bg-primary/90 active:scale-95"
                >
                  Show any distance
                </button>
              </div>
            ) : (
              <>
                {/* nearby */}
                {nearby.length > 0 && (
                  <section className="mt-7">
                    <SectionHeader
                      emoji="📍"
                      title="Nearby food places"
                      subtitle={nearbySubtitle}
                      className="px-5"
                    />
                    <div className="space-y-2.5 px-5">
                      {nearby.slice(0, 4).map((p) => (
                        <ListRow key={p.id} place={p} onSelect={openPlace} />
                      ))}
                    </div>
                  </section>
                )}

                {/* hidden gems */}
                {gems.length > 0 && (
                  <RailSection
                    emoji="💎"
                    title="Hidden Gems"
                    subtitle="Low-key spots locals swear by"
                    total={gems.length}
                    expanded={expanded === "gems"}
                    onSeeAll={() => toggleExpand("gems")}
                  >
                    {gems.map((p) =>
                      expanded === "gems" ? (
                        <ListRow key={p.id} place={p} onSelect={openPlace} />
                      ) : (
                        <CarouselCard key={p.id} place={p} onSelect={openPlace} />
                      )
                    )}
                  </RailSection>
                )}

                {/* local favorites */}
                {favorites.length > 0 && (
                  <section className="mt-7">
                    <SectionHeader
                      emoji={SECTION_ICONS.favorites}
                      title="Local Favorites"
                      subtitle="Most loved by people around you"
                      className="px-5"
                    />
                    <div className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-1">
                      {favorites.map((p) => (
                        <WideCard key={p.id} place={p} onSelect={openPlace} />
                      ))}
                    </div>
                  </section>
                )}

                {/* popular */}
                {popular.length > 0 && (
                  <section className="mt-7">
                    <SectionHeader
                      emoji="📈"
                      title="Popular Places"
                      subtitle="Trending near you right now"
                      className="px-5"
                    />
                    <div className="space-y-2.5 px-5">
                      {popular.slice(0, 4).map((p, i) => (
                        <ListRow key={p.id} place={p} onSelect={openPlace} rank={i + 1} />
                      ))}
                    </div>
                  </section>
                )}

                {/* budget eats */}
                {budget.length > 0 && (
                  <RailSection
                    emoji="💸"
                    title="Budget Eats"
                    subtitle="Big flavor, small bills"
                    total={budget.length}
                    expanded={expanded === "budget"}
                    onSeeAll={() => toggleExpand("budget")}
                  >
                    {budget.map((p) =>
                      expanded === "budget" ? (
                        <ListRow key={p.id} place={p} onSelect={openPlace} />
                      ) : (
                        <CarouselCard key={p.id} place={p} onSelect={openPlace} />
                      )
                    )}
                  </RailSection>
                )}

                {/* places awaiting coordinate verification — honest, never a guessed distance.
                    Hidden while a radius filter is active (an unknown distance can't satisfy
                    "within X km"); they reappear on "Any distance" and in search/category. */}
                {distanceFilterKm == null && pending.length > 0 && (
                  <section className="mt-7">
                    <SectionHeader
                      emoji="⏳"
                      title="Location pending verification"
                      subtitle="Real places we're still mapping — no guessed distances"
                      className="px-5"
                    />
                    <div className="space-y-2.5 px-5">
                      {pending.map((p) => (
                        <ListRow key={p.id} place={p} onSelect={openPlace} />
                      ))}
                    </div>
                  </section>
                )}
              </>
            )}

            {/* location retry nudge when GPS failed and no manual pick/test mode is active */}
            {locStatus !== "granted" && locSource !== "manual" && locSource !== "test" && !discoveryEmpty && (
              <p className="mt-6 flex items-center justify-center gap-1.5 px-5 text-center text-[11.5px] font-medium text-stone-400">
                <LocateFixed className="size-3.5" aria-hidden="true" />
                Share your location to sort every list by real distance.
              </p>
            )}

            {/* teaser for coming-soon features */}
            <section className="mx-5 mt-8">
              <button
                type="button"
                onClick={() =>
                  toast.info("Sneak peek 👀", {
                    description: "Travel food guides, AI picks & community tips are on the way.",
                  })
                }
                className={cn(
                  "flex w-full items-center gap-3 rounded-2xl border border-dashed border-primary/40 bg-orange-50/60 p-4 text-left transition-colors hover:bg-orange-50"
                )}
              >
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Compass className="size-5" aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="block text-[14px] font-bold text-foreground">
                    More delicious things are cooking
                  </span>
                  <span className="mt-0.5 block text-[12px] leading-snug text-muted-foreground">
                    Travel food guide · AI recommendations · Community picks
                  </span>
                </span>
                <Flame className="ml-auto size-4 shrink-0 text-orange-400" aria-hidden="true" />
              </button>
            </section>

            <p className="mt-8 text-center text-[11px] font-medium text-stone-400">
              Foodie · Discover · Decide · Devour
            </p>
              </>
            )}
          </>
        )}
      </main>

      {/* location sheet (status + GPS button + manual city fallback) */}
      <LocationSheet open={locSheetOpen} onClose={() => setLocSheetOpen(false)} />

      {/* Foodie AI — floating button + bottom sheet (reads existing stores at send time) */}
      <AssistantControls />
    </div>
  );
}
