"use client";

/**
 * useRestaurantFeed — server-state hook for the discovery feed.
 *
 * Loads the restaurant list for the ACTIVE ORIGIN (real GPS fix > manual
 * city > labelled prototype city — see the location store) and exposes
 * explicit loading / error / ready states so the UI never guesses.
 *
 * Re-runs automatically when the origin changes (e.g. the user grants the
 * browser Geolocation permission or picks a city manually), so distances are
 * always computed against the user's real latitude/longitude.
 *
 * Implementation note: the fetch result is stored together with the request
 * "key" it belongs to, and status is derived during render. This keeps
 * loading transitions honest without ever calling setState synchronously
 * inside the effect (react-hooks/set-state-in-effect).
 */

import { useCallback, useEffect, useState } from "react";
import { DataAccessError, getAllRestaurants, getNearbyRestaurants } from "./repository";
import type { DataMode } from "./types";
import { DEFAULT_DISCOVERY_RADIUS_KM } from "./types";
import type { GeoPosition, Place } from "../types";

export type FeedStatus = "loading" | "ready" | "error";

/** A completed (or failed) fetch, tagged with the request it belongs to. */
type FeedOutcome =
  | { key: string; kind: "ready"; places: Place[]; mode: DataMode; notice: string | null }
  | { key: string; kind: "error"; message: string };

export interface RestaurantFeedState {
  status: FeedStatus;
  /** Raw restaurant records — annotate with distances via `withDistances`. */
  places: Place[];
  /** "supabase" when served by the real database, "demo" for sample data. */
  mode: DataMode | null;
  /** Human-readable explanation when the demo dataset is being served. */
  notice: string | null;
  error: string | null;
  /** Re-run the query (used by retry buttons). */
  reload: () => void;
}

export function useRestaurantFeed(
  origin: GeoPosition,
  radiusKm: number = DEFAULT_DISCOVERY_RADIUS_KM
): RestaurantFeedState {
  const [attempt, setAttempt] = useState(0);
  const [outcome, setOutcome] = useState<FeedOutcome | null>(null);

  const key = `${origin.lat}|${origin.lng}|${radiusKm}|${attempt}`;

  useEffect(() => {
    let cancelled = false;
    getNearbyRestaurants(origin.lat, origin.lng, radiusKm)
      .then((res) => {
        if (!cancelled) {
          setOutcome({
            key,
            kind: "ready",
            places: res.places,
            mode: res.mode,
            notice: res.notice ?? null,
          });
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setOutcome({
            key,
            kind: "error",
            message:
              err instanceof Error
                ? err.message
                : "Couldn't load restaurants right now.",
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [key, origin.lat, origin.lng, radiusKm]);

  const reload = useCallback(() => setAttempt((n) => n + 1), []);

  const current = outcome?.key === key ? outcome : null;
  const status: FeedStatus =
    current === null ? "loading" : current.kind === "ready" ? "ready" : "error";

  return {
    status,
    places: current?.kind === "ready" ? current.places : [],
    mode: current?.kind === "ready" ? current.mode : null,
    notice: current?.kind === "ready" ? current.notice : null,
    error: current?.kind === "error" ? current.message : null,
    reload,
  };
}

/**
 * useAllRestaurants — loads EVERY discoverable place once (origin-independent),
 * so rows whose coordinates are still NULL stay browsable through category
 * chips, search and the main list view.
 *
 * No distances are attached here on purpose: the screen annotates only
 * coordinate-bearing rows with `withDistances` against the live origin, and
 * NULL-coordinate rows render as "Location pending verification" — never a
 * guessed or 0 km distance.
 */
export function useAllRestaurants(): RestaurantFeedState {
  const [attempt, setAttempt] = useState(0);
  const [outcome, setOutcome] = useState<FeedOutcome | null>(null);

  const key = `all|${attempt}`;

  useEffect(() => {
    let cancelled = false;
    getAllRestaurants()
      .then((res) => {
        if (!cancelled) {
          setOutcome({
            key,
            kind: "ready",
            places: res.places,
            mode: res.mode,
            notice: res.notice ?? null,
          });
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setOutcome({
            key,
            kind: "error",
            message:
              err instanceof Error
                ? err.message
                : "Couldn't load restaurants right now.",
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [key]);

  const reload = useCallback(() => setAttempt((n) => n + 1), []);

  const current = outcome?.key === key ? outcome : null;
  const status: FeedStatus =
    current === null ? "loading" : current.kind === "ready" ? "ready" : "error";

  return {
    status,
    places: current?.kind === "ready" ? current.places : [],
    mode: current?.kind === "ready" ? current.mode : null,
    notice: current?.kind === "ready" ? current.notice : null,
    error: current?.kind === "error" ? current.message : null,
    reload,
  };
}
