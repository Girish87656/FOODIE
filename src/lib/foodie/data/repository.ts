/**
 * Foodie data-access layer — the ONLY way the UI reads restaurants.
 *
 * No restaurant data lives in component files. These reusable functions call
 * the Foodie API (`/api/restaurants/*`), which serves either a real Supabase
 * database or the clearly-labelled demo dataset — the UI doesn't care which,
 * it just surfaces `mode` so the experience can be labelled honestly.
 *
 * Every function is safe to call from client components and re-fires whenever
 * its arguments change (the nearby query uses the user's REAL latitude and
 * longitude straight from the browser Geolocation API via the location store).
 */

import type {
  DestinationFoodsResponse,
  DestinationsResponse,
  NearbyRestaurantsResponse,
  RestaurantDetailResponse,
  RestaurantListResponse,
  ReviewsResponse,
} from "./types";
import { DEFAULT_DISCOVERY_RADIUS_KM } from "./types";

export class DataAccessError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "DataAccessError";
    this.status = status;
  }
}

async function request<T>(url: string): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, { cache: "no-store" });
  } catch {
    throw new DataAccessError("Couldn't reach the Foodie service. Check your connection.", 0);
  }
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = (await res.json()) as { error?: string };
      if (body?.error) message = body.error;
    } catch {
      /* keep the generic message */
    }
    throw new DataAccessError(message, res.status);
  }
  return (await res.json()) as T;
}

/**
 * Restaurants within `radiusKm` of the given coordinates, sorted
 * nearest-first, each annotated with its Haversine `distanceKm`.
 * The coordinates come from the database rows themselves — pass the user's
 * real GPS fix here (see `useRestaurantFeed` / the location store).
 */
export async function getNearbyRestaurants(
  latitude: number,
  longitude: number,
  radiusKm: number = DEFAULT_DISCOVERY_RADIUS_KM
): Promise<NearbyRestaurantsResponse> {
  const params = new URLSearchParams({
    lat: String(latitude),
    lng: String(longitude),
    radiusKm: String(radiusKm),
  });
  return request<NearbyRestaurantsResponse>(`/api/restaurants/nearby?${params.toString()}`);
}

/** One restaurant (with its dishes and photos folded into the Place shape). */
export async function getRestaurantById(id: string): Promise<RestaurantDetailResponse> {
  return request<RestaurantDetailResponse>(
    `/api/restaurants/${encodeURIComponent(id)}`
  );
}

/** All restaurants in a pilot place category id (e.g. "tiffin"). */
export async function getRestaurantsByCategory(category: string): Promise<RestaurantListResponse> {
  return request<RestaurantListResponse>(
    `/api/restaurants/category/${encodeURIComponent(category)}`
  );
}

/**
 * Every discoverable restaurant — includes rows whose coordinates are still
 * NULL ("Location pending verification"). Read-only; no distances attached.
 */
export async function getAllRestaurants(): Promise<RestaurantListResponse> {
  return request<RestaurantListResponse>(`/api/restaurants/all`);
}

/** Free-text search across name, description, address and city. */
export async function searchRestaurants(query: string): Promise<RestaurantListResponse> {
  const params = new URLSearchParams({ q: query });
  return request<RestaurantListResponse>(`/api/restaurants/search?${params.toString()}`);
}

/**
 * Real user reviews for one restaurant, newest first (public read — no
 * login required). Review WRITES live in `./reviews` because they must run
 * against Supabase with the signed-in user's own session.
 */
export async function getReviews(restaurantId: string): Promise<ReviewsResponse> {
  return request<ReviewsResponse>(
    `/api/restaurants/${encodeURIComponent(restaurantId)}/reviews`
  );
}

/* ------------------------------------------------------------------ */
/* Destinations — the "Famous here" discovery layer                    */
/* ------------------------------------------------------------------ */

/** Every active destination (real Supabase rows only — never fabricated). */
export async function getDestinations(): Promise<DestinationsResponse> {
  return request<DestinationsResponse>(`/api/destinations`);
}

/**
 * One destination plus its curated famous/local foods. A 404 (unknown
 * destination id) throws a DataAccessError like every other endpoint.
 */
export async function getDestinationFoods(destinationId: string): Promise<DestinationFoodsResponse> {
  return request<DestinationFoodsResponse>(
    `/api/destinations/${encodeURIComponent(destinationId)}/foods`
  );
}
