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
import { DEMO_DESTINATIONS, DEMO_DESTINATION_FOODS } from "@/data/destinations";
import { DEMO_POINTS_OF_INTEREST } from "@/data/points-of-interest";
import { withDistances } from "../location";
import { matchesQuery } from "../utils";
import type {
  Destination,
  DestinationFood,
  GeoPosition,
  Place,
  PlaceWithDistance,
  PointOfInterest,
} from "../types";
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

/* ------------------------------------------------------------------ */
/* Destinations + foods + points of interest                           */
/* Demo previews of the LIVE tables: destinations/foods mirror the      */
/* owner-executed batch-003 seed values and the points of interest are  */
/* the 16 researched public.places rows (migration-008 design) — see    */
/* src/data/destinations.ts and src/data/points-of-interest.ts for the  */
/* full honesty notes. Nothing here is invented content.                */
/* ------------------------------------------------------------------ */

/** Every demo destination, alphabetical — mirrors getSupabaseDestinations. */
export function getDemoDestinations(): Destination[] {
  return DEMO_DESTINATIONS.slice().sort((a, b) => a.name.localeCompare(b.name));
}

/** One demo destination by id — null when unknown (real uuids, batch-003). */
export function getDemoDestinationById(id: string): Destination | null {
  return DEMO_DESTINATIONS.find((d) => d.id === id) ?? null;
}

/** Demo famous/local foods of one destination — mirrors getSupabaseDestinationFoods. */
export function getDemoDestinationFoods(destinationId: string): DestinationFood[] {
  return DEMO_DESTINATION_FOODS.filter((f) => f.destinationId === destinationId).sort((a, b) =>
    a.name.localeCompare(b.name)
  );
}

/** One demo destination food by id — null when unknown. */
export function getDemoDestinationFoodById(id: string): DestinationFood | null {
  return DEMO_DESTINATION_FOODS.find((f) => f.id === id) ?? null;
}

/**
 * Demo restaurants in the destination's OWN city (case-insensitive city
 * primitive — mirrors getSupabaseRestaurantsByCity). The demo restaurants
 * all sit in Doddaballapura, so the demo destinations (Bengaluru, Mumbai,
 * Tirupati) honestly resolve to an empty list.
 */
export function getDemoRestaurantsByDestinationCity(destination: Destination): Place[] {
  const city = destination.name.trim().toLowerCase();
  if (!city) return [];
  return PLACES.filter((p) => p.city.toLowerCase() === city)
    .sort((a, b) => b.rating - a.rating)
    .map(tagDemo);
}

/**
 * Demo attractions & stays of one destination — the same dual match path
 * as the live query (destination_id link OR case-insensitive city), zero
 * rows never substituted.
 */
export function getDemoAttractionsByDestination(destination: Destination): PointOfInterest[] {
  const city = destination.name.trim().toLowerCase();
  return DEMO_POINTS_OF_INTEREST.filter(
    (p) => p.destinationId === destination.id || p.city.toLowerCase() === city
  ).sort((a, b) => a.name.localeCompare(b.name));
}

/** One demo point of interest by its stable uuid5 id — null when unknown. */
export function getDemoPlaceById(id: string): PointOfInterest | null {
  return DEMO_POINTS_OF_INTEREST.find((p) => p.id === id) ?? null;
}
