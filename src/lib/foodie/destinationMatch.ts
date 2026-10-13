/**
 * Destination detection — CONSERVATIVE matching of the current location
 * signal against the curated destinations list.
 *
 * Design rules (Stage 6):
 *   * A destination is "detected" ONLY when the existing location
 *     architecture actually supports it — never guessed, never inferred
 *     from a vague or approximate origin.
 *   * Foodie's prototype origin and the GITAM Test Area are NEVER a
 *     destination: both are clearly-labelled non-user locations.
 *   * Manual selection counts ONLY for the explicit destination-city
 *     options in MANUAL_CITIES (the user consciously picked that city).
 *   * Browser GPS counts ONLY when the reverse-geocoded area label
 *     contains a destination name as a complete comma-separated segment
 *     (e.g. "Basavanagudi, Bengaluru" → "bengaluru"). A raw-coordinates
 *     label or an unmatched city means NO destination — the honest state.
 */

import { MANUAL_CITIES } from "./location";
import type { Destination } from "./types";

/** Minimal slice of the location store the matcher needs. */
export interface DestinationSignal {
  source: "prototype" | "browser" | "manual" | "test";
  manualCityId: string | null;
  areaLabel: string | null;
}

/** Lowercase + trim + collapse internal whitespace. */
function normalize(value: string): string {
  return value.toLowerCase().trim().replace(/\s+/g, " ");
}

/** Normalize a destination name for comparison (same rule as the DB). */
function destinationKeys(destination: Destination): string[] {
  const keys = [normalize(destination.name)];
  // The slug is a stable lowercase key — allow it as an alias.
  if (destination.slug) keys.push(normalize(destination.slug));
  return keys;
}

/**
 * Match a destination from the location label only when a COMPLETE segment
 * of the label equals a destination name. "Koramangala, Bengaluru" matches;
 * "Bengaluru Rural" or a raw "12.97° N, 77.59° E" label does not.
 */
function matchByAreaLabel(
  destinations: readonly Destination[],
  areaLabel: string
): Destination | null {
  const segments = areaLabel
    .split(",")
    .map((segment) => normalize(segment))
    .filter(Boolean);
  if (segments.length === 0) return null;
  return (
    destinations.find((destination) =>
      destinationKeys(destination).some((key) => segments.includes(key))
    ) ?? null
  );
}

/** Match a destination from an explicit MANUAL_CITIES pick. */
function matchByManualCity(
  destinations: readonly Destination[],
  manualCityId: string
): Destination | null {
  const city = MANUAL_CITIES.find((c) => c.id === manualCityId);
  if (!city) return null;
  const label = normalize(city.label);
  return (
    destinations.find((destination) =>
      destinationKeys(destination).some((key) => key === label || label.endsWith(key))
    ) ?? null
  );
}

/**
 * The detected destination for the current location signal, or `null` when
 * the signal does not ESTABLISH one (prototype/test origins, unmatched
 * cities, missing labels). Callers must treat `null` as "destination not
 * known" — never fall back to a guess.
 */
export function detectDestination(
  destinations: readonly Destination[],
  signal: DestinationSignal
): Destination | null {
  if (destinations.length === 0) return null;
  if (signal.source === "manual" && signal.manualCityId) {
    return matchByManualCity(destinations, signal.manualCityId);
  }
  if (signal.source === "browser" && signal.areaLabel) {
    return matchByAreaLabel(destinations, signal.areaLabel);
  }
  // prototype / test / unresolved — never pretend to know the destination.
  return null;
}
