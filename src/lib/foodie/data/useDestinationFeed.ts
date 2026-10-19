"use client";

/**
 * useDestinationFeed — server-state hooks for the destination layer.
 *
 * Loads the ACTIVE destinations from `/api/destinations` and the curated
 * famous/local foods of one destination from `/api/destinations/[id]/foods`.
 * Real Supabase rows only — there is no demo dataset for destinations, so
 * an unavailable database yields an honestly EMPTY list with a notice.
 *
 * Implementation note: the fetch result is stored together with the request
 * "key" it belongs to, and status is derived during render. This keeps
 * loading transitions honest without ever calling setState synchronously
 * inside the effect (react-hooks/set-state-in-effect).
 */

import { useCallback, useEffect, useState } from "react";
import {
  DataAccessError,
  getDestinationAttractions,
  getDestinationFoodPlaces,
  getDestinationFoods,
  getDestinationPlaces,
  getDestinations,
} from "./repository";
import type { DataMode } from "./types";
import type {
  Destination,
  DestinationFood,
  Place,
  PointOfInterest,
} from "../types";

export type FeedStatus = "loading" | "ready" | "error";

interface DestinationsOutcome {
  key: string;
  kind: "ready" | "error";
  destinations: Destination[];
  notice: string | null;
  error: string | null;
}

export interface DestinationsFeedState {
  status: FeedStatus;
  destinations: Destination[];
  notice: string | null;
  error: string | null;
  reload: () => void;
}

/** All active destinations — fetched once per mount (retryable). */
export function useDestinations(): DestinationsFeedState {
  const [attempt, setAttempt] = useState(0);
  const [outcome, setOutcome] = useState<DestinationsOutcome | null>(null);

  const key = `destinations|${attempt}`;

  useEffect(() => {
    let cancelled = false;
    getDestinations()
      .then((res) => {
        if (!cancelled) {
          setOutcome({
            key,
            kind: "ready",
            destinations: res.destinations,
            notice: res.notice ?? null,
            error: null,
          });
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setOutcome({
            key,
            kind: "error",
            destinations: [],
            notice: null,
            error:
              err instanceof Error
                ? err.message
                : "Couldn't load destinations right now.",
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
    destinations: current?.kind === "ready" ? current.destinations : [],
    notice: current?.notice ?? null,
    error: current?.error ?? null,
    reload,
  };
}

/* ------------------------------------------------------------------ */
/* Foods of ONE destination                                            */
/* ------------------------------------------------------------------ */

interface FoodsOutcome {
  key: string;
  kind: "ready" | "error";
  destination: Destination | null;
  foods: DestinationFood[];
  notice: string | null;
  error: string | null;
  /** Which backend served this outcome — drives the demo banner. */
  mode: DataMode | null;
}

export type DestinationFoodsStatus = "idle" | FeedStatus;

export interface DestinationFoodsFeedState {
  status: DestinationFoodsStatus;
  destination: Destination | null;
  foods: DestinationFood[];
  notice: string | null;
  error: string | null;
  mode: DataMode | null;
  reload: () => void;
}

/**
 * Curated famous/local foods of one destination. Pass `null` to stay idle
 * (no request — used when no destination is being presented). Changing the
 * id fetches that destination's foods; each id keeps its own attempt
 * counter so a retry always re-runs for the destination being shown.
 */
export function useDestinationFoods(destinationId: string | null): DestinationFoodsFeedState {
  const [attempt, setAttempt] = useState(0);
  const [outcome, setOutcome] = useState<FoodsOutcome | null>(null);

  // Reset the attempt counter when the destination changes (derived during
  // render — no setState-in-effect), so a retry is per-destination.
  const [lastId, setLastId] = useState(destinationId);
  if (destinationId !== lastId) {
    setLastId(destinationId);
    setAttempt(0);
  }

  const key = `${destinationId ?? "none"}|${attempt}`;

  useEffect(() => {
    if (destinationId === null) return; // idle — nothing to fetch
    let cancelled = false;
    getDestinationFoods(destinationId)
      .then((res) => {
        if (!cancelled) {
          setOutcome({
            key,
            kind: "ready",
            destination: res.destination,
            foods: res.foods,
            notice: res.notice ?? null,
            error: null,
            mode: res.mode,
          });
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          const status = err instanceof DataAccessError ? err.status : 0;
          setOutcome({
            key,
            kind: "error",
            destination: null,
            foods: [],
            notice: null,
            error:
              status === 404
                ? "This destination isn't available anymore."
                : err instanceof Error
                  ? err.message
                  : "Couldn't load this destination's foods right now.",
            mode: null,
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [key, destinationId]);

  const reload = useCallback(() => setAttempt((n) => n + 1), []);

  const current = outcome?.key === key ? outcome : null;
  const status: DestinationFoodsStatus =
    destinationId === null
      ? "idle"
      : current === null
        ? "loading"
        : current.kind === "ready"
          ? "ready"
          : "error";

  return {
    status,
    destination: current?.destination ?? null,
    foods: current?.kind === "ready" ? current.foods : [],
    notice: current?.notice ?? null,
    error: current?.error ?? null,
    mode: current?.mode ?? null,
    reload,
  };
}

/* ------------------------------------------------------------------ */
/* ONE destination — detail for the destination screen                 */
/* ------------------------------------------------------------------ */

export interface DestinationDetailFeedState {
  status: DestinationFoodsStatus;
  destination: Destination | null;
  foods: DestinationFood[];
  notice: string | null;
  error: string | null;
  mode: DataMode | null;
  reload: () => void;
}

/**
 * The presented destination (header fields + curated foods in one read).
 * Pass `null` to stay idle. Same per-id retry semantics as
 * `useDestinationFoods`.
 */
export function useDestinationDetail(destinationId: string | null): DestinationDetailFeedState {
  const foods = useDestinationFoods(destinationId);
  return {
    status: foods.status,
    destination: foods.destination,
    foods: foods.foods,
    notice: foods.notice,
    error: foods.error,
    mode: foods.mode,
    reload: foods.reload,
  };
}

/* ------------------------------------------------------------------ */
/* Places serving ONE destination food (curated links only)            */
/* ------------------------------------------------------------------ */

interface FoodPlacesOutcome {
  key: string;
  kind: "ready" | "error";
  food: DestinationFood | null;
  places: Place[];
  notice: string | null;
  error: string | null;
}

export interface DestinationFoodPlacesFeedState {
  status: DestinationFoodsStatus;
  food: DestinationFood | null;
  places: Place[];
  notice: string | null;
  error: string | null;
  reload: () => void;
}

/**
 * Curated REAL places serving one destination food (migration-004 links
 * only — never inferred). Zero links → honest empty state. Pass `null` to
 * stay idle; changing the id refetches with per-id retry semantics.
 */
export function useDestinationFoodPlaces(foodId: string | null): DestinationFoodPlacesFeedState {
  const [attempt, setAttempt] = useState(0);
  const [outcome, setOutcome] = useState<FoodPlacesOutcome | null>(null);

  const [lastId, setLastId] = useState(foodId);
  if (foodId !== lastId) {
    setLastId(foodId);
    setAttempt(0);
  }

  const key = `${foodId ?? "none"}|${attempt}`;

  useEffect(() => {
    if (foodId === null) return; // idle — nothing to fetch
    let cancelled = false;
    getDestinationFoodPlaces(foodId)
      .then((res) => {
        if (!cancelled) {
          setOutcome({
            key,
            kind: "ready",
            food: res.food,
            places: res.places,
            notice: res.notice ?? null,
            error: null,
          });
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          const status = err instanceof DataAccessError ? err.status : 0;
          setOutcome({
            key,
            kind: "error",
            food: null,
            places: [],
            notice: null,
            error:
              status === 404
                ? "This food isn't available anymore."
                : err instanceof Error
                  ? err.message
                  : "Couldn't load the places serving this food right now.",
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [key, foodId]);

  const reload = useCallback(() => setAttempt((n) => n + 1), []);

  const current = outcome?.key === key ? outcome : null;
  const status: DestinationFoodsStatus =
    foodId === null ? "idle" : current === null ? "loading" : current.kind === "ready" ? "ready" : "error";

  return {
    status,
    food: current?.food ?? null,
    places: current?.kind === "ready" ? current.places : [],
    notice: current?.notice ?? null,
    error: current?.error ?? null,
    reload,
  };
}

/* ------------------------------------------------------------------ */
/* Places in ONE destination (city-scoped multi-area browser)          */
/* ------------------------------------------------------------------ */

interface DestinationPlacesOutcome {
  key: string;
  kind: "ready" | "error";
  destination: Destination | null;
  places: Place[];
  notice: string | null;
  error: string | null;
}

export interface DestinationPlacesFeedState {
  status: DestinationFoodsStatus;
  destination: Destination | null;
  places: Place[];
  notice: string | null;
  error: string | null;
  reload: () => void;
}

/**
 * Every discoverable place recorded in the destination's OWN city
 * (restaurants.city matched against destinations.name — no city hardcoded).
 * Zero rows → honest empty state until verified data is curated. Pass
 * `null` to stay idle.
 */
export function useDestinationPlaces(destinationId: string | null): DestinationPlacesFeedState {
  const [attempt, setAttempt] = useState(0);
  const [outcome, setOutcome] = useState<DestinationPlacesOutcome | null>(null);

  const [lastId, setLastId] = useState(destinationId);
  if (destinationId !== lastId) {
    setLastId(destinationId);
    setAttempt(0);
  }

  const key = `${destinationId ?? "none"}|${attempt}`;

  useEffect(() => {
    if (destinationId === null) return; // idle — nothing to fetch
    let cancelled = false;
    getDestinationPlaces(destinationId)
      .then((res) => {
        if (!cancelled) {
          setOutcome({
            key,
            kind: "ready",
            destination: res.destination,
            places: res.places,
            notice: res.notice ?? null,
            error: null,
          });
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          const status = err instanceof DataAccessError ? err.status : 0;
          setOutcome({
            key,
            kind: "error",
            destination: null,
            places: [],
            notice: null,
            error:
              status === 404
                ? "This destination isn't available anymore."
                : err instanceof Error
                  ? err.message
                  : "Couldn't load the places in this destination right now.",
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [key, destinationId]);

  const reload = useCallback(() => setAttempt((n) => n + 1), []);

  const current = outcome?.key === key ? outcome : null;
  const status: DestinationFoodsStatus =
    destinationId === null ? "idle" : current === null ? "loading" : current.kind === "ready" ? "ready" : "error";

  return {
    status,
    destination: current?.destination ?? null,
    places: current?.kind === "ready" ? current.places : [],
    notice: current?.notice ?? null,
    error: current?.error ?? null,
    reload,
  };
}

/* ------------------------------------------------------------------ */
/* Attractions & stays of ONE destination (public.places model)        */
/* ------------------------------------------------------------------ */

interface AttractionsOutcome {
  key: string;
  kind: "ready" | "error";
  destination: Destination | null;
  attractions: PointOfInterest[];
  notice: string | null;
  error: string | null;
  mode: DataMode | null;
}

export interface DestinationAttractionsFeedState {
  status: DestinationFoodsStatus;
  destination: Destination | null;
  attractions: PointOfInterest[];
  notice: string | null;
  error: string | null;
  mode: DataMode | null;
  reload: () => void;
}

/**
 * NON-FOOD places of interest (tourist attractions AND lodging hotels) of
 * one destination — the approved `public.places` model. Until migration-008
 * is applied to the live database the response carries the honest
 * PLACES_TABLE_NOT_READY_NOTICE with an empty list (the UI renders a "not
 * set up yet" state, never an error and never invented places). Demo mode
 * serves the clearly-labelled researched preview dataset. Pass `null` to
 * stay idle; per-id retry semantics as everywhere else.
 */
export function useDestinationAttractions(
  destinationId: string | null
): DestinationAttractionsFeedState {
  const [attempt, setAttempt] = useState(0);
  const [outcome, setOutcome] = useState<AttractionsOutcome | null>(null);

  const [lastId, setLastId] = useState(destinationId);
  if (destinationId !== lastId) {
    setLastId(destinationId);
    setAttempt(0);
  }

  const key = `${destinationId ?? "none"}|${attempt}`;

  useEffect(() => {
    if (destinationId === null) return; // idle — nothing to fetch
    let cancelled = false;
    getDestinationAttractions(destinationId)
      .then((res) => {
        if (!cancelled) {
          setOutcome({
            key,
            kind: "ready",
            destination: res.destination,
            attractions: res.attractions,
            notice: res.notice ?? null,
            error: null,
            mode: res.mode,
          });
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          const status = err instanceof DataAccessError ? err.status : 0;
          setOutcome({
            key,
            kind: "error",
            destination: null,
            attractions: [],
            notice: null,
            error:
              status === 404
                ? "This destination isn't available anymore."
                : err instanceof Error
                  ? err.message
                  : "Couldn't load the attractions for this destination right now.",
            mode: null,
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [key, destinationId]);

  const reload = useCallback(() => setAttempt((n) => n + 1), []);

  const current = outcome?.key === key ? outcome : null;
  const status: DestinationFoodsStatus =
    destinationId === null
      ? "idle"
      : current === null
        ? "loading"
        : current.kind === "ready"
          ? "ready"
          : "error";

  return {
    status,
    destination: current?.destination ?? null,
    attractions: current?.kind === "ready" ? current.attractions : [],
    notice: current?.notice ?? null,
    error: current?.error ?? null,
    mode: current?.mode ?? null,
    reload,
  };
}
