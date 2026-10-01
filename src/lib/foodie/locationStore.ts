"use client";

import { useMemo } from "react";
import { create } from "zustand";
import type { GeoPosition } from "./types";
import {
  GITAM_TEST_COORDS,
  GITAM_TEST_LOCATION,
  MANUAL_CITIES,
  PROTOTYPE_CITY,
  PROTOTYPE_COORDS,
  formatLatLng,
  requestBrowserLocation,
  reverseGeocode,
  type LocationFailure,
  type LocationFailureKind,
} from "./location";

/**
 * Status of the underlying GPS subsystem (the last geolocation attempt).
 * Kept separate from `source`, which describes the origin currently in use.
 */
export type LocationStatus =
  | "idle" // no attempt yet — browsing with the prototype city
  | "locating" // waiting on the browser
  | "granted" // real GPS fix acquired
  | "denied" // permission denied
  | "error" // unavailable / timed out
  | "unsupported"; // no Geolocation API / insecure context

/** Where the active origin comes from. */
export type LocationSource = "prototype" | "browser" | "manual" | "test";

interface LocationState {
  status: LocationStatus;
  source: LocationSource;
  /**
   * Effective origin used for every distance calculation.
   * Browser GPS fix > manually selected city > prototype city.
   */
  origin: GeoPosition;
  /** Real browser coordinates — null unless the user shared their location. */
  coords: GeoPosition | null;
  accuracyMeters: number | null;
  /** Human-readable label (reverse geocoded area or chosen city). */
  areaLabel: string | null;
  resolvingArea: boolean;
  /** User-facing error message for denied/error/unsupported states. */
  errorMessage: string | null;
  manualCityId: string | null;

  /** Ask the browser for the real location (native Geolocation API). */
  requestLocation: () => Promise<void>;
  /** Manually pick a city (fallback when GPS is denied/unavailable). */
  selectCity: (cityId: string) => void;
  /**
   * Development helper — pin the clearly-labelled "TEST LOCATION — GITAM"
   * origin (GITAM campus corridor reference) so the pilot area can be tested
   * without a real GPS fix. Never touches restaurant data.
   */
  selectGitamTestArea: () => void;
  /** Go back to Foodie's prototype city. */
  usePrototypeCity: () => void;
}

/**
 * Global location state (Zustand = React state consumed via hooks).
 * Designed to persist to Supabase user profiles later without call-site
 * changes: components read `origin`/`status` through this store only.
 */
export const useLocationStore = create<LocationState>((set, get) => ({
  status: "idle",
  source: "prototype",
  origin: PROTOTYPE_COORDS,
  coords: null,
  accuracyMeters: null,
  areaLabel: null,
  resolvingArea: false,
  errorMessage: null,
  manualCityId: null,

  requestLocation: async () => {
    if (get().status === "locating") return;
    set({ status: "locating", errorMessage: null });

    try {
      // 1) Real browser GPS fix — coordinates straight from the device.
      const fix = await requestBrowserLocation();
      set({
        status: "granted",
        source: "browser",
        coords: { lat: fix.lat, lng: fix.lng },
        origin: { lat: fix.lat, lng: fix.lng },
        accuracyMeters: fix.accuracyMeters,
        manualCityId: null,
        areaLabel: null,
        resolvingArea: true,
        errorMessage: null,
      });

      // 2) Best-effort human label for the fix (falls back to raw coords).
      const pos = { lat: fix.lat, lng: fix.lng };
      const label = (await reverseGeocode(pos)) ?? formatLatLng(pos);
      // Only apply if the user hasn't switched away from this fix meanwhile.
      if (get().source === "browser") {
        set({ areaLabel: label, resolvingArea: false });
      }
    } catch (unknownFailure) {
      const failure = unknownFailure as LocationFailure;
      set((s) => ({
        status:
          failure.kind === "denied"
            ? "denied"
            : failure.kind === "unsupported"
              ? "unsupported"
              : "error",
        errorMessage: failure.message,
        coords: null,
        accuracyMeters: null,
        areaLabel: null,
        resolvingArea: false,
        // fall back to the manual city if one was picked before, else prototype
        source: s.manualCityId ? "manual" : "prototype",
        origin: s.manualCityId
          ? (MANUAL_CITIES.find((c) => c.id === s.manualCityId) ?? PROTOTYPE_COORDS)
          : PROTOTYPE_COORDS,
      }));
    }
  },

  selectCity: (cityId) => {
    const city = MANUAL_CITIES.find((c) => c.id === cityId);
    if (!city) return;
    set((s) => ({
      source: "manual",
      manualCityId: city.id,
      origin: { lat: city.lat, lng: city.lng },
      coords: null,
      accuracyMeters: null,
      areaLabel: city.label,
      resolvingArea: false,
      // an in-flight GPS request is cancelled as far as the UI is concerned
      status: s.status === "locating" ? "idle" : s.status,
    }));
  },

  usePrototypeCity: () => {
    set((s) => ({
      source: "prototype",
      manualCityId: null,
      origin: PROTOTYPE_COORDS,
      coords: null,
      accuracyMeters: null,
      areaLabel: null,
      resolvingArea: false,
      status: s.status === "locating" ? "idle" : s.status,
    }));
  },

  selectGitamTestArea: () => {
    set((s) => ({
      source: "test",
      manualCityId: null,
      origin: GITAM_TEST_COORDS,
      coords: null,
      accuracyMeters: null,
      areaLabel: GITAM_TEST_LOCATION.label,
      resolvingArea: false,
      status: s.status === "locating" ? "idle" : s.status,
    }));
  },
}));

/* ------------------------------------------------------------------ */
/* Derived helpers (pure functions over the store)                     */
/* ------------------------------------------------------------------ */

export interface LocationHeadlineInput {
  status: LocationStatus;
  source: LocationSource;
  areaLabel: string | null;
  resolvingArea: boolean;
  manualCityId: string | null;
}

export interface LocationHeadline {
  /** Tiny uppercase status line — always tells the truth about the source. */
  kicker: string;
  /** Bold value line under the kicker. */
  value: string;
  tone: "default" | "live" | "warn";
}

/** What the Home header should display for the current location state. */
export function locationHeadline(s: LocationHeadlineInput): LocationHeadline {
  if (s.source === "test") {
    return {
      kicker: "Development testing · not your real location",
      value: GITAM_TEST_LOCATION.label,
      tone: "warn",
    };
  }
  if (s.source === "browser") {
    return {
      kicker: "Using your current location",
      value: s.resolvingArea
        ? "Finding your area…"
        : (s.areaLabel ?? "Location locked in"),
      tone: "live",
    };
  }
  if (s.source === "manual") {
    const city = MANUAL_CITIES.find((c) => c.id === s.manualCityId);
    return {
      kicker: "Manual location",
      value: city ? `${city.label} · selected by you` : "Custom city",
      tone: "default",
    };
  }
  const fallback = `${PROTOTYPE_CITY.area}, ${PROTOTYPE_CITY.city}`;
  switch (s.status) {
    case "locating":
      return { kicker: "Locating…", value: "Getting a GPS fix", tone: "default" };
    case "denied":
      return {
        kicker: "Location permission required",
        value: `${fallback} (prototype)`,
        tone: "warn",
      };
    case "error":
      return {
        kicker: "Location unavailable",
        value: `${fallback} (prototype)`,
        tone: "warn",
      };
    case "unsupported":
      return {
        kicker: "Location not available here",
        value: `${fallback} (prototype)`,
        tone: "warn",
      };
    default:
      return {
        kicker: "Current location",
        value: `${PROTOTYPE_CITY.area}, ${PROTOTYPE_CITY.city} · prototype`,
        tone: "default",
      };
  }
}

/**
 * Memoized headline for the Home header.
 * Subscribes to primitives only (zustand v5 needs stable selector results)
 * and derives the display object with useMemo.
 */
export function useLocationHeadline(): LocationHeadline {
  const status = useLocationStore((s) => s.status);
  const source = useLocationStore((s) => s.source);
  const areaLabel = useLocationStore((s) => s.areaLabel);
  const resolvingArea = useLocationStore((s) => s.resolvingArea);
  const manualCityId = useLocationStore((s) => s.manualCityId);
  return useMemo(
    () => locationHeadline({ status, source, areaLabel, resolvingArea, manualCityId }),
    [status, source, areaLabel, resolvingArea, manualCityId]
  );
}

/** Shorthand for detail screens / section subtitles. */
export function originSourceLabel(s: LocationState): string {
  if (s.source === "test") {
    return `${GITAM_TEST_LOCATION.label} (development test origin)`;
  }
  if (s.source === "browser") return "your current location";
  if (s.source === "manual") {
    const city = MANUAL_CITIES.find((c) => c.id === s.manualCityId);
    return `${city?.label ?? "selected city"} (manually selected)`;
  }
  return `${PROTOTYPE_CITY.area}, ${PROTOTYPE_CITY.city} — Foodie's prototype origin`;
}

export type { LocationFailureKind };
