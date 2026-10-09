/**
 * DEMO backend — ⚠️ clearly-labelled sample data, NOT real businesses ⚠️
 *
 * Used ONLY when Supabase credentials are absent (or a Supabase query fails),
 * so the app keeps running instead of crashing. The dataset lives in
 * `src/data/places.ts` and is never rendered as if it were real:
 * every response carries `mode: "demo"` and the UI shows a DEMO DATA banner.
 *
 * When Foodie switches to Supabase, nothing in here runs — ids are prefixed
 * with `demo:` so the two sources can never be confused.
 */

import { PLACES } from "@/data/places";
import { withDistances } from "../location";
import { matchesQuery } from "../utils";
import type { GeoPosition, Place, PlaceWithDistance } from "../types";
import { fromDemoId, toDemoId } from "./mappers";

/** Prefix every id so demo results are unmistakable downstream. */
function tagDemo<T extends Place>(place: T): T {
  return { ...place, id: toDemoId(place.id) };
}

/**
 * Demo `nearby` — Haversine distances against each demo place's stored
 * WGS-84 coordinates (the same math the database RPC uses), filtered by
 * radius and sorted nearest-first.
 */
export async function getNearbyDemoRestaurants(
  latitude: number,
  longitude: number,
  radiusKm: number
): Promise<PlaceWithDistance[]> {
  const origin: GeoPosition = { lat: latitude, lng: longitude };
  return withDistances(PLACES, origin)
    .filter((p) => p.distanceKm <= radiusKm)
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .map(tagDemo);
}

export async function getDemoRestaurantById(id: string): Promise<Place | null> {
  const place = PLACES.find((p) => p.id === fromDemoId(id));
  return place ? tagDemo(place) : null;
}

export async function getDemoRestaurantsByCategory(category: string): Promise<Place[]> {
  return PLACES.filter((p) => p.categoryIds.includes(category))
    .slice()
    .sort((a, b) => b.rating - a.rating)
    .map(tagDemo);
}

/** Demo "browse everything" pool — mirrors getAllSupabaseRestaurants. */
export async function getAllDemoRestaurants(): Promise<Place[]> {
  return PLACES.slice()
    .sort((a, b) => b.rating - a.rating)
    .map(tagDemo);
}

export async function searchDemoRestaurants(query: string): Promise<Place[]> {
  const q = query.trim();
  if (!q) return [];
  return PLACES.filter((p) => matchesQuery(p, q))
    .slice()
    .sort((a, b) => b.rating - a.rating)
    .map(tagDemo);
}
