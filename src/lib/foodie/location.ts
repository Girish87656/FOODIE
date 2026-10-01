/**
 * Foodie — real location services (client-side).
 *
 * This module is the single source of truth for everything location-related,
 * structured so it can later be swapped to Supabase + a real places API:
 *
 *  - `GeoPosition` (types.ts) is the canonical lat/lng shape.
 *  - `requestBrowserLocation()` wraps the NATIVE Geolocation API
 *    (`navigator.geolocation`) in a Promise — no IP-based lookups, no mocks.
 *  - `haversineKm()` is the only distance implementation used in the app.
 *  - `reverseGeocode()` is a best-effort, swappable geocoding helper.
 *  - `withDistances()` annotates any list of coordinate-bearing records,
 *    so tomorrow's API-sourced restaurants plug straight in.
 */

import type { GeoPosition, PlaceWithDistance } from "./types";

/** Earth's mean radius in km — used by the Haversine formula. */
const EARTH_RADIUS_KM = 6371;

/**
 * Foodie's prototype origin — used ONLY until the user shares a real location
 * (or picks a corridor point manually). NOT a user location; clearly labelled
 * in the UI as "prototype".
 *
 * Pilot corridor: GITAM Deemed to be University Bengaluru (Nagadenahalli)
 *   → Doddaballapura Railway Station → Doddaballapura town.
 *
 * The campus coordinate below is an APPROXIMATE corridor reference (public
 * listings place the campus on NH-207, Nagadenahalli, Doddaballapur Taluk),
 * used solely as the labelled fallback origin. Every real place carries its
 * OWN stored latitude/longitude — that is what distances are computed from.
 */
export const PROTOTYPE_CITY = {
  id: "gitam-nagadenahalli",
  area: "GITAM University area",
  city: "Doddaballapura",
  lat: 13.18,
  lng: 77.5,
} as const;

export const PROTOTYPE_COORDS: GeoPosition = {
  lat: PROTOTYPE_CITY.lat,
  lng: PROTOTYPE_CITY.lng,
};

/**
 * Development/testing origin — "GITAM Test Area".
 *
 * A clearly-labelled TEST origin so the GITAM pilot area can be exercised
 * without a real campus GPS fix (previews, denied permissions, desks far
 * from Doddaballapura). It reuses the SAME approximate campus corridor
 * reference as PROTOTYPE_CITY and the manual "gitam-campus" pick — no new
 * coordinates are invented, and this value is NEVER attached to any
 * restaurant row (restaurant coordinates stay exactly what the DB stores).
 */
export const GITAM_TEST_LOCATION = {
  id: "gitam-test-area",
  /** Exact label required once the test origin is active. */
  label: "TEST LOCATION — GITAM",
  /** Option label shown inside the location sheet. */
  optionLabel: "GITAM Test Area",
  lat: 13.18,
  lng: 77.5,
} as const;

export const GITAM_TEST_COORDS: GeoPosition = {
  lat: GITAM_TEST_LOCATION.lat,
  lng: GITAM_TEST_LOCATION.lng,
};

/** Points a user can pick manually when GPS is denied/unavailable. */
export interface CityOption {
  id: string;
  label: string;
  lat: number;
  lng: number;
}

/**
 * Points a user can pick manually when GPS is denied/unavailable.
 * Pilot-only: the three corridor anchors. (Railway-station and town
 * coordinates are from public sources; the campus point is the approximate
 * labelled corridor reference described above.)
 */
export const MANUAL_CITIES: CityOption[] = [
  { id: "gitam-campus", label: "GITAM University (Nagadenahalli)", lat: 13.18, lng: 77.5 },
  { id: "doddaballapura-station", label: "Doddaballapura Railway Station", lat: 13.2797, lng: 77.5505 },
  { id: "doddaballapura-town", label: "Doddaballapura Town", lat: 13.2988, lng: 77.5408 },
];

/* ------------------------------------------------------------------ */
/* Native Geolocation API                                              */
/* ------------------------------------------------------------------ */

export type LocationFailureKind =
  | "denied"
  | "unavailable"
  | "timeout"
  | "unsupported";

export interface LocationFailure {
  kind: LocationFailureKind;
  message: string;
}

/** True when the browser exposes the Geolocation API in a secure context. */
export function isGeolocationSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "geolocation" in navigator &&
    window.isSecureContext === true
  );
}

export interface LocationFix extends GeoPosition {
  /** GPS accuracy in meters, when the browser reports it. */
  accuracyMeters: number | null;
}

/**
 * Ask the browser for the user's real position via `navigator.geolocation`.
 * Resolves with latitude/longitude; rejects with a user-friendly
 * `LocationFailure`. Never falls back to IP-based lookup.
 */
export function requestBrowserLocation(options?: {
  timeoutMs?: number;
}): Promise<LocationFix> {
  return new Promise((resolve, reject) => {
    if (!isGeolocationSupported()) {
      reject({
        kind: "unsupported",
        message:
          "This browser can't share your location. It needs a secure (https) connection and location support.",
      } satisfies LocationFailure);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracyMeters: Number.isFinite(position.coords.accuracy)
            ? position.coords.accuracy
            : null,
        });
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            reject({
              kind: "denied",
              message:
                "Location permission required. Allow location access for Foodie in your browser, then try again.",
            } satisfies LocationFailure);
            break;
          case error.POSITION_UNAVAILABLE:
            reject({
              kind: "unavailable",
              message:
                "We couldn't detect where you are right now. Check your connection and try again.",
            } satisfies LocationFailure);
            break;
          case error.TIMEOUT:
            reject({
              kind: "timeout",
              message: "Finding you took too long. Please try again.",
            } satisfies LocationFailure);
            break;
          default:
            reject({
              kind: "unavailable",
              message: "Something went wrong while finding your location.",
            } satisfies LocationFailure);
        }
      },
      {
        enableHighAccuracy: true,
        timeout: options?.timeoutMs ?? 12_000,
        maximumAge: 30_000,
      }
    );
  });
}

/* ------------------------------------------------------------------ */
/* Distance math — Haversine                                           */
/* ------------------------------------------------------------------ */

/**
 * Great-circle distance between two coordinates, in kilometres,
 * using the Haversine formula:
 *
 *   a = sin²(Δφ/2) + cos φ1 · cos φ2 · sin²(Δλ/2)
 *   d = 2R · arcsin(√a)
 */
export function haversineKm(a: GeoPosition, b: GeoPosition): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** "0.8 km away" — switches to metres below 100 m so tiny distances read well. */
export function formatDistance(km: number): string {
  if (km < 0.1) {
    const meters = Math.max(10, Math.round((km * 1000) / 10) * 10);
    return `${meters} m away`;
  }
  return `${km.toFixed(1)} km away`;
}

/** "12.9352° N, 77.6245° E" — fallback label when geocoding isn't available. */
export function formatLatLng(pos: GeoPosition): string {
  const ns = pos.lat >= 0 ? "N" : "S";
  const ew = pos.lng >= 0 ? "E" : "W";
  return `${Math.abs(pos.lat).toFixed(4)}° ${ns}, ${Math.abs(pos.lng).toFixed(4)}° ${ew}`;
}

/* ------------------------------------------------------------------ */
/* Reverse geocoding (best-effort, swappable)                          */
/* ------------------------------------------------------------------ */

/**
 * Turn GPS coordinates into a human-readable area label using OpenStreetMap's
 * Nominatim (no API key, CORS-enabled, called once per user action — not the
 * location source itself, which is always the GPS fix). Resolves to `null`
 * on any failure so callers can fall back to `formatLatLng`.
 * Later this can point at Supabase/Google Geocoder with zero call-site changes.
 */
export async function reverseGeocode(
  pos: GeoPosition,
  timeoutMs = 5_000
): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const url =
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2` +
      `&lat=${pos.lat}&lon=${pos.lng}&zoom=16&addressdetails=1`;
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });
    clearTimeout(timer);
    if (!res.ok) return null;
    const data = (await res.json()) as {
      address?: Record<string, string | undefined>;
    };
    const a = data?.address ?? {};
    const parts = [
      a.suburb ?? a.neighbourhood ?? a.quarter ?? a.residential,
      a.city ?? a.town ?? a.village ?? a.county,
    ].filter(Boolean);
    return parts.length ? parts.slice(0, 2).join(", ") : null;
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ */
/* Distance annotation                                                 */
/* ------------------------------------------------------------------ */

/**
 * Annotate coordinate-bearing records with their Haversine distance from
 * `origin`. Places WITHOUT stored coordinates (NULL lat/lng — still awaiting
 * verification) are EXCLUDED rather than guessed at: we never estimate
 * coordinates from addresses, so they can't have an honest distance yet.
 */
export function withDistances<T extends { latitude?: number; longitude?: number }>(
  places: readonly T[],
  origin: GeoPosition
): (T & { distanceKm: number })[] {
  return places.flatMap((p) =>
    p.latitude != null && p.longitude != null
      ? [{ ...p, distanceKm: haversineKm(origin, { lat: p.latitude, lng: p.longitude }) }]
      : []
  );
}

export type { PlaceWithDistance };
