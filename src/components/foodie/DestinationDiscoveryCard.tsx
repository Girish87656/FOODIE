"use client";

/**
 * DestinationDiscoveryCard — the "Famous here" destination discovery block.
 *
 * Reads REAL destinations + curated famous/local foods from the Foodie API
 * (backed by the `destinations` / `destination_foods` tables — read-only,
 * public SELECT via RLS). No destination, food, image URL or designation is
 * ever invented: NULL database values stay absent in the UI.
 *
 * ── Visibility state machine (the same-destination re-selection fix) ──
 * The card is shown from a `presentation` object that is ONLY ever created
 * by an EVENT, never derived from "which id changed":
 *
 *   • select(id)  — chip click. EVERY click (including clicking the
 *     currently-shown destination again) creates a FRESH presentation with
 *     a new key, so the card always (re)appears. This is the fix: the old
 *     behaviour reset dismissed/timed-out state only when detectedId
 *     CHANGED, so re-selecting the SAME destination stayed hidden.
 *   • detection   — when the detected destination id CHANGES (derived from
 *     the read-only location origin), a fresh presentation is created for
 *     it. Handled with the React-endorsed render-phase "adjust state when
 *     a dependency changes" pattern — NOT inside a useEffect.
 *   • dismiss     — clears the presentation.
 *   • auto-detect timeout — the presented card clears itself after
 *     AUTO_COLLAPSE_MS (the card is keyed by presentation.key, so every
 *     show event remounts it and restarts the timer). The timer PAUSES
 *     while the card is hovered or contains keyboard/touch focus, so
 *     engaged users are never yanked mid-read (WCAG 2.2.1).
 *
 * Because presentations are event-created and only cleared by
 * dismiss/timeout, re-selecting the same destination after a timeout OR a
 * manual dismiss always shows the card again, and Bengaluru → Mumbai →
 * Bengaluru keeps working. Unsupported origins (e.g. the GITAM pilot
 * corridor) simply never produce a detection event, so no card is ever
 * fabricated for them — the destination chips stay available instead.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowRight, MapPin, RefreshCw, X } from "lucide-react";
import { haversineKm } from "@/lib/foodie/location";
import type { GeoPosition } from "@/lib/foodie/types";
import type { Destination, DestinationFood, DestinationFoodDesignation } from "@/lib/foodie/types";
import { useFoodieStore } from "@/lib/foodie/store";
import { useLocationStore } from "@/lib/foodie/locationStore";
import {
  useDestinationFoods,
  useDestinations,
} from "@/lib/foodie/data/useDestinationFeed";
import { CategoryChip } from "./CategoryChip";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/** How long a presented card stays open before auto-collapsing. */
const AUTO_COLLAPSE_MS = 6000;

/**
 * Max distance (km) from a destination's stored reference coordinates for
 * the destination to count as "detected".
 *
 * Deliberately kept far below the ~24.5 km between the GITAM/Doddaballapura
 * pilot corridor and central Bengaluru, so the pilot test area is ALWAYS
 * honestly treated as unsupported (no card is ever shown for it).
 */
const DETECTION_RADIUS_KM = 15;

/** How a card got on screen — detection cards yield to location changes,
 *  user-selected cards only change on user action. */
interface Presentation {
  /** Monotonic instance id — every show event bumps it (remounts the card). */
  key: number;
  destinationId: string;
  source: "detected" | "selected";
}

/** Nearest destination within the honest detection radius, or null. */
function detectDestination(
  origin: GeoPosition,
  destinations: readonly Destination[]
): Destination | null {
  let best: Destination | null = null;
  let bestKm = Number.POSITIVE_INFINITY;
  for (const d of destinations) {
    // A destination without stored reference coordinates can never be
    // detected — we don't guess where it is.
    if (d.latitude == null || d.longitude == null) continue;
    const km = haversineKm(origin, { lat: d.latitude, lng: d.longitude });
    if (km <= DETECTION_RADIUS_KM && km < bestKm) {
      best = d;
      bestKm = km;
    }
  }
  return best;
}

const DESIGNATION_ORDER: Record<DestinationFoodDesignation, number> = {
  signature: 0,
  famous: 1,
  local: 2,
};

function designationLabel(designation: DestinationFoodDesignation): string {
  switch (designation) {
    case "signature":
      return "Signature";
    case "famous":
      return "Famous";
    case "local":
      return "Local";
  }
}

/** signature → famous → local → (none), then alphabetical. */
function sortFoods(foods: readonly DestinationFood[]): DestinationFood[] {
  return [...foods].sort((a, b) => {
    const ra = a.designation ? DESIGNATION_ORDER[a.designation] : 3;
    const rb = b.designation ? DESIGNATION_ORDER[b.designation] : 3;
    return ra - rb || a.name.localeCompare(b.name);
  });
}

export function DestinationDiscoveryCard({ className }: { className?: string }) {
  const { status, destinations } = useDestinations();
  // Read-only subscription — this component never writes location state.
  const origin = useLocationStore((s) => s.origin);

  /** Pure derivation — null for every unsupported origin (incl. GITAM). */
  const detected = useMemo(
    () => detectDestination(origin, destinations),
    [origin, destinations]
  );

  const [presentation, setPresentation] = useState<Presentation | null>(null);
  // Tracks the last SEEN detection so a CHANGE of the detected destination
  // can raise a show event. Deliberately starts at null so the first
  // detected destination also raises its event through the path below.
  const [lastDetectedId, setLastDetectedId] = useState<string | null>(null);

  // Render-phase adjustment (React docs: "You might not need an effect —
  // adjusting some state when a prop changes"). NOT a useEffect, so it does
  // not violate react-hooks/set-state-in-effect.
  if ((detected?.id ?? null) !== lastDetectedId) {
    setLastDetectedId(detected?.id ?? null);
    setPresentation((cur) => {
      if (detected) {
        // A destination became detected. A card the user explicitly
        // selected stays in control; otherwise the detection takes over.
        if (cur?.source === "selected") return cur;
        return { key: (cur?.key ?? 0) + 1, destinationId: detected.id, source: "detected" };
      }
      // Detection ended (origin left every destination): a detection-driven
      // card goes away; a user-selected card stays.
      return cur?.source === "detected" ? null : cur;
    });
  }

  /**
   * THE FIX — selection is an EVENT, not a diff. Clicking a destination
   * chip (same OR different) always creates a fresh presentation, so the
   * card reappears after a timeout or a manual dismiss, and switching
   * Bengaluru → Mumbai → Bengaluru keeps working.
   */
  const select = useCallback((destinationId: string) => {
    setPresentation((cur) => ({
      key: (cur?.key ?? 0) + 1,
      destinationId,
      source: "selected",
    }));
  }, []);

  const dismiss = useCallback(() => setPresentation(null), []);

  // Foods live in the PARENT (keyed by destination id, not presentation
  // key) so re-selecting the same destination shows the card instantly
  // instead of flashing a skeleton on every show event.
  const foodsState = useDestinationFoods(presentation?.destinationId ?? null);
  const sortedFoods = useMemo(() => sortFoods(foodsState.foods), [foodsState.foods]);

  const activeDestination = presentation
    ? (destinations.find((d) => d.id === presentation.destinationId) ?? null)
    : null;

  // Nothing to show at all while the destination list is loading or when
  // the database truly has none — no skeleton theatre, no fabricated rows.
  if (status === "loading" || (status === "ready" && destinations.length === 0)) {
    return null;
  }

  return (
    <section aria-label="Destination food discovery" className={className}>
      {presentation && activeDestination && (
        <div className="mx-5">
          <FamousHereCard
            key={presentation.key}
            source={presentation.source}
            destination={activeDestination}
            foodsStatus={foodsState.status}
            foodsError={foodsState.error}
            foods={sortedFoods}
            onRetryFoods={foodsState.reload}
            onAutoCollapse={dismiss}
            onDismiss={dismiss}
          />
        </div>
      )}

      {status === "error" ? (
        <p className="mt-4 px-5 text-[12px] font-medium text-stone-400" role="status">
          Destinations are unavailable right now.
        </p>
      ) : (
        destinations.length > 0 && (
          <>
            {!presentation && (
              <p className="mt-4 px-5 text-[10.5px] font-bold uppercase tracking-wider text-stone-400">
                Famous food by destination
              </p>
            )}
            <div
              role="group"
              aria-label="Explore supported destinations"
              className={cn(
                "no-scrollbar flex gap-2 overflow-x-auto px-5",
                presentation ? "mt-3" : "mt-2"
              )}
            >
              {destinations.map((d) => (
                <CategoryChip
                  key={d.id}
                  category={{ id: d.id, label: d.name }}
                  active={presentation?.destinationId === d.id}
                  onClick={() => select(d.id)}
                />
              ))}
            </div>
          </>
        )
      )}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* The presented card                                                  */
/* ------------------------------------------------------------------ */

function FamousHereCard({
  source,
  destination,
  foods,
  foodsStatus,
  foodsError,
  onRetryFoods,
  onAutoCollapse,
  onDismiss,
}: {
  source: "detected" | "selected";
  destination: Destination;
  foods: DestinationFood[];
  foodsStatus: "idle" | "loading" | "ready" | "error";
  foodsError: string | null;
  onRetryFoods: () => void;
  onAutoCollapse: () => void;
  onDismiss: () => void;
}) {
  const openDestination = useFoodieStore((s) => s.openDestination);
  const openDestinationFood = useFoodieStore((s) => s.openDestinationFood);
  // Auto-collapse — one timer per PRESENTATION INSTANCE: the parent keys
  // this component by presentation.key, so every show event remounts it and
  // restarts the timer. setState fires from the timeout callback (async),
  // never synchronously inside the effect.
  //
  // QA FIX (WCAG 2.2.1 Timing Adjustable): the timer PAUSES while the user
  // is engaged with the card (pointer hover or keyboard/touch focus inside
  // it) — content must not vanish while someone is reading or navigating
  // it. Leaving the card restarts the full budget; the peek behaviour is
  // otherwise unchanged.
  const [engaged, setEngaged] = useState(false);
  useEffect(() => {
    if (engaged) return undefined; // paused — the user is on the card
    const timer = setTimeout(onAutoCollapse, AUTO_COLLAPSE_MS);
    return () => clearTimeout(timer);
  }, [onAutoCollapse, engaged]);

  return (
    <div
      className="foodie-gradient-soft relative overflow-hidden rounded-3xl p-4"
      onMouseEnter={() => setEngaged(true)}
      onMouseLeave={() => setEngaged(false)}
      onFocusCapture={() => setEngaged(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setEngaged(false);
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-center gap-1 text-[10.5px] font-bold uppercase tracking-wider text-primary">
            <MapPin className="size-3" aria-hidden="true" />
            {source === "detected" ? "Famous here" : "Famous in"}
          </p>
          <p className="mt-0.5 text-[15px] font-extrabold tracking-tight text-foreground">
            {destination.name}
            {destination.region ? `, ${destination.region}` : ""}
          </p>
          <button
            type="button"
            onClick={() => {
              onDismiss();
              openDestination(destination.id);
            }}
            aria-label={`Open the ${destination.name} destination page`}
            className="mt-1 inline-flex items-center gap-1 rounded-full bg-white/80 px-2.5 py-1 text-[10.5px] font-bold text-primary shadow-sm transition-all hover:bg-white active:scale-95"
          >
            Explore destination
            <ArrowRight className="size-3" aria-hidden="true" />
          </button>
          {destination.description && (
            <p className="mt-0.5 line-clamp-2 text-[12px] leading-snug text-muted-foreground">
              {destination.description}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={onDismiss}
          aria-label={`Hide the ${destination.name} famous food card`}
          className="grid size-8 shrink-0 place-items-center rounded-full border border-border/70 bg-white/80 text-stone-500 shadow-sm transition-colors hover:bg-white hover:text-foreground"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      </div>

      {/* foods — only REAL curated rows; loading and empty states are honest */}
      {foodsStatus === "loading" ? (
        <div className="mt-3 space-y-2" aria-busy="true" aria-live="polite">
          <Skeleton className="h-16 w-full rounded-2xl bg-white/60" />
          <Skeleton className="h-16 w-full rounded-2xl bg-white/60" />
        </div>
      ) : foodsStatus === "error" ? (
        <div className="mt-3 rounded-2xl bg-white/80 px-3 py-3 text-center shadow-sm">
          <p className="text-[12.5px] font-semibold text-foreground">
            Couldn&apos;t load the famous foods.
          </p>
          <p className="mt-0.5 text-[11.5px] text-muted-foreground">
            {foodsError ?? "Please try again."}
          </p>
          <button
            type="button"
            onClick={onRetryFoods}
            className="mx-auto mt-2 flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-1.5 text-[12px] font-bold text-white shadow-md shadow-orange-600/25 transition-all hover:bg-primary/90 active:scale-95"
          >
            <RefreshCw className="size-3" aria-hidden="true" />
            Retry
          </button>
        </div>
      ) : foods.length === 0 ? (
        <p className="mt-3 rounded-2xl bg-white/80 px-3 py-3 text-center text-[12.5px] font-semibold text-stone-600 shadow-sm">
          No famous foods recorded for {destination.name} yet.
        </p>
      ) : (
        <ul className="mt-3 space-y-2">
          {foods.map((f) => {
            return (
              <li key={f.id} className="rounded-2xl bg-white/80 px-3 py-2.5 shadow-sm">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[13.5px] font-bold text-foreground">{f.name}</p>
                  {f.designation && (
                    <span
                      className={cn(
                        "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                        f.designation === "signature" && "bg-primary/10 text-primary",
                        f.designation === "famous" && "bg-amber-100 text-amber-700",
                        f.designation === "local" && "bg-emerald-50 text-emerald-700"
                      )}
                    >
                      {designationLabel(f.designation)}
                    </span>
                  )}
                </div>
                {f.description && (
                  <p className="mt-0.5 line-clamp-2 text-[12px] leading-snug text-stone-600">
                    {f.description}
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => {
                    onDismiss();
                    openDestinationFood(f.id, destination.id);
                  }}
                  aria-label={`Explore places serving ${f.name}`}
                  className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-white px-3 py-1.5 text-[11.5px] font-bold text-primary shadow-sm transition-all hover:bg-orange-50 active:scale-95"
                >
                  <MapPin className="size-3" aria-hidden="true" />
                  Explore places
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <p className="mt-3 text-[10.5px] font-medium leading-snug text-stone-500">
        Places serving these dishes appear only after verification — never guessed.
      </p>
    </div>
  );
}
