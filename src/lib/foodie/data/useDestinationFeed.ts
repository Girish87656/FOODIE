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
import { DataAccessError, getDestinationFoods, getDestinations } from "./repository";
import type { Destination, DestinationFood } from "../types";

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
}

export type DestinationFoodsStatus = "idle" | FeedStatus;

export interface DestinationFoodsFeedState {
  status: DestinationFoodsStatus;
  destination: Destination | null;
  foods: DestinationFood[];
  notice: string | null;
  error: string | null;
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
    reload,
  };
}
