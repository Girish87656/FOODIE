"use client";

/**
 * DestinationFoodScreen — one destination food and the curated REAL places
 * serving it (Famous Food → Places → existing Place Detail).
 *
 * Honesty rules:
 *   * Places come ONLY from the curated destination_food_places links
 *     (migration-004) — never inferred from category/name/cuisine similarity.
 *   * Zero curated links → the honest "No verified places serving this food
 *     have been added yet." empty state. Random nearby restaurants are
 *     NEVER substituted.
 *   * Each result reuses the EXISTING Foodie place card + detail flow
 *     (Maps / reviews / phone / hours / photos / menu all keep working).
 */

import { useEffect, useMemo } from "react";
import { ArrowLeft, Compass, RefreshCw, SearchX, UtensilsCrossed } from "lucide-react";
import { useFoodieStore } from "@/lib/foodie/store";
import { useLocationStore } from "@/lib/foodie/locationStore";
import { haversineKm } from "@/lib/foodie/location";
import {
  useDestinationDetail,
  useDestinationFoodPlaces,
} from "@/lib/foodie/data/useDestinationFeed";
import { DestinationFoodBadge } from "../DestinationFoodBadge";
import { ListRow } from "../PlaceCards";
import { Skeleton } from "@/components/ui/skeleton";
import type { PlaceMaybeWithDistance } from "@/lib/foodie/types";

export function DestinationFoodScreen() {
  const foodId = useFoodieStore((s) => s.selectedDestinationFoodId);
  const destinationId = useFoodieStore((s) => s.selectedDestinationId);
  const screen = useFoodieStore((s) => s.screen);
  const backFromFood = useFoodieStore((s) => s.backFromFood);
  const backFromDestination = useFoodieStore((s) => s.backFromDestination);
  const openPlace = useFoodieStore((s) => s.openPlace);

  // Context (destination name for the back label) + the food/places read.
  const destinationDetail = useDestinationDetail(destinationId);
  const feed = useDestinationFoodPlaces(foodId);
  const origin = useLocationStore((s) => s.origin);

  // Honest distance annotation — the same Haversine-from-origin rule as the
  // Home feed. Places WITHOUT stored coordinates keep NO distance and the
  // card shows its honest "Location pending verification" state instead of
  // a guessed number. Coordinate-bearing places show the real distance.
  const annotatedPlaces = useMemo<PlaceMaybeWithDistance[]>(
    () =>
      feed.places.map((p) =>
        p.latitude != null && p.longitude != null
          ? { ...p, distanceKm: haversineKm(origin, { lat: p.latitude, lng: p.longitude }) }
          : p
      ),
    [feed.places, origin]
  );

  // No selection → nothing honest to show; return home. The screen check
  // keeps this guard from firing while this screen is merely EXITING
  // (AnimatePresence keeps it mounted during the transition) — otherwise
  // backFromFood's "screen: destination" would be overridden with "home".
  useEffect(() => {
    if (!foodId && screen === "food") backFromDestination();
  }, [foodId, screen, backFromDestination]);

  if (!foodId || screen !== "food") return null;

  const destinationName = destinationDetail.destination?.name ?? "Destination";

  return (
    <div className="relative flex h-full flex-col bg-background">
      {/* ---------------- top bar ---------------- */}
      <header className="z-10 shrink-0 border-b border-border/50 bg-background/95 px-4 pb-3 pt-4 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={backFromFood}
            aria-label={`Back to ${destinationName}`}
            className="flex min-w-0 items-center gap-1.5 rounded-full border border-border bg-card py-1.5 pl-1.5 pr-3 shadow-sm transition-colors hover:bg-accent"
          >
            <ArrowLeft className="size-4 shrink-0" aria-hidden="true" />
            <span className="truncate text-[12.5px] font-bold text-foreground">
              {destinationName}
            </span>
          </button>
        </div>
      </header>

      {/* ---------------- content ---------------- */}
      <main className="thin-scrollbar flex-1 overflow-y-auto pb-10" role="main">
        {feed.status === "loading" && (
          <div className="px-5 pt-5" aria-busy="true" aria-live="polite" aria-label="Loading food">
            <Skeleton className="h-7 w-1/2" />
            <Skeleton className="mt-3 h-16 w-full rounded-2xl" />
            <div className="mt-6 space-y-2.5">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-2xl border border-border/50 bg-card p-2.5"
                >
                  <Skeleton className="size-[76px] shrink-0 rounded-xl" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {feed.status === "error" && (
          <div className="mx-5 mt-6 flex flex-col items-center rounded-3xl border border-dashed border-rose-200 bg-rose-50/50 px-6 py-12 text-center">
            <SearchX className="size-10 text-rose-300" aria-hidden="true" />
            <p className="mt-3 text-[15px] font-bold text-foreground">Couldn&apos;t load this food</p>
            <p className="mt-1 max-w-[260px] text-[13px] leading-snug text-muted-foreground">
              {feed.error ?? "Something went wrong while fetching this destination food."}
            </p>
            <button
              type="button"
              onClick={feed.reload}
              className="mt-4 flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-[13px] font-bold text-white shadow-md shadow-orange-600/25 transition-all hover:bg-primary/90 active:scale-95"
            >
              <RefreshCw className="size-3.5" aria-hidden="true" />
              Try again
            </button>
          </div>
        )}

        {feed.status === "ready" && !feed.food && (
          <div className="mx-5 mt-6 flex flex-col items-center rounded-3xl border border-dashed border-border bg-card/60 px-6 py-12 text-center">
            <SearchX className="size-10 text-stone-300" aria-hidden="true" />
            <p className="mt-3 text-[15px] font-bold text-foreground">Food not found</p>
            <p className="mt-1 max-w-[260px] text-[13px] leading-snug text-muted-foreground">
              This destination food doesn&apos;t exist or isn&apos;t active in Foodie&apos;s database.
            </p>
          </div>
        )}

        {feed.status === "ready" && feed.food && (
          <>
            <section className="px-5 pt-5">
              {feed.food.imageUrl ? (
                <img
                  src={feed.food.imageUrl}
                  alt={feed.food.name}
                  loading="lazy"
                  className="h-40 w-full rounded-3xl object-cover"
                />
              ) : null}
              <div className="mt-3 flex items-center gap-2">
                <h1 className="truncate text-2xl font-extrabold tracking-tight text-foreground">
                  {feed.food.name}
                </h1>
                <DestinationFoodBadge designation={feed.food.designation} />
              </div>
              {feed.food.foodType && (
                <p className="mt-1 text-[11.5px] font-bold uppercase tracking-wider text-muted-foreground">
                  {feed.food.foodType}
                </p>
              )}
              {feed.food.description && (
                <p className="mt-2 text-[13.5px] leading-relaxed text-muted-foreground">
                  {feed.food.description}
                </p>
              )}
            </section>

            <section className="mt-6">
              <div className="px-5">
                <h2 className="flex items-center gap-2 text-[16px] font-bold text-foreground">
                  <span aria-hidden="true">📍</span> Places serving this food
                </h2>
                <p className="mt-0.5 text-[12.5px] text-muted-foreground">
                  Verified links only — Foodie never guesses who serves what
                </p>
              </div>

              {feed.places.length === 0 ? (
                <div className="mx-5 mt-4 flex flex-col items-center rounded-3xl border border-dashed border-border bg-card/60 px-6 py-10 text-center">
                  <Compass className="size-9 text-stone-300" aria-hidden="true" />
                  <p className="mt-3 text-[15px] font-bold text-foreground">
                    No verified places serving this food have been added yet.
                  </p>
                  <p className="mt-1 max-w-[280px] text-[13px] leading-snug text-muted-foreground">
                    Foodie only lists a place here when real evidence confirms it serves
                    this food — never a guess.
                  </p>
                </div>
              ) : (
                <div className="mt-4 space-y-2.5 px-5">
                  {annotatedPlaces.map((p) => (
                    <ListRow key={p.id} place={p} onSelect={openPlace} />
                  ))}
                </div>
              )}

              {feed.places.length > 0 && (
                <p className="mt-4 flex items-center justify-center gap-1.5 px-5 text-center text-[11.5px] font-medium text-stone-400">
                  <UtensilsCrossed className="size-3.5" aria-hidden="true" />
                  Tap a place to see its full Foodie listing.
                </p>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}
