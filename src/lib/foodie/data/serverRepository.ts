/**
 * Server-side data dispatcher — used ONLY inside the `/api/restaurants/*`
 * route handlers.
 *
 * Chooses the backend once, in one place:
 *   - Supabase configured  → real database queries.
 *   - Not configured       → clearly-labelled DEMO dataset (mode: "demo").
 *   - Supabase query fails → demo data + an honest `notice` (app never
 *     crashes because the database blipped).
 *
 * The UI never imports this module — it talks to the API, which calls this.
 */

import { isSupabaseConfigured } from "@/lib/supabase/config";
import type {
  DataMode,
  DestinationFoodsResponse,
  DestinationsResponse,
  NearbyRestaurantsResponse,
  RestaurantDetailResponse,
  RestaurantListResponse,
  ReviewsResponse,
} from "./types";
import { DEMO_MODE_NOTICE, SUPABASE_ERROR_NOTICE } from "./types";
import * as demo from "./demoBackend";
import * as supabase from "./supabaseBackend";

function demoResult<T extends { notice?: string }>(result: T, notice: string): T & { mode: DataMode } {
  return { ...result, mode: "demo", notice };
}

export async function loadNearbyRestaurants(
  latitude: number,
  longitude: number,
  radiusKm: number
): Promise<NearbyRestaurantsResponse> {
  if (isSupabaseConfigured()) {
    try {
      const places = await supabase.getNearbySupabaseRestaurants(latitude, longitude, radiusKm);
      return { mode: "supabase", places };
    } catch (error) {
      console.error("[foodie/data] Supabase nearby query failed:", error);
      return demoResult(
        { places: await demo.getNearbyDemoRestaurants(latitude, longitude, radiusKm) },
        SUPABASE_ERROR_NOTICE
      );
    }
  }
  return demoResult(
    { places: await demo.getNearbyDemoRestaurants(latitude, longitude, radiusKm) },
    DEMO_MODE_NOTICE
  );
}

export async function loadRestaurantById(id: string): Promise<RestaurantDetailResponse> {
  if (isSupabaseConfigured()) {
    try {
      const place = await supabase.getSupabaseRestaurantById(id);
      return { mode: "supabase", place };
    } catch (error) {
      console.error("[foodie/data] Supabase detail query failed:", error);
      return demoResult({ place: await demo.getDemoRestaurantById(id) }, SUPABASE_ERROR_NOTICE);
    }
  }
  return demoResult({ place: await demo.getDemoRestaurantById(id) }, DEMO_MODE_NOTICE);
}

/**
 * Every discoverable restaurant — including rows whose coordinates are still
 * NULL ("Location pending verification"). Read-only; no distance math here.
 */
export async function loadAllRestaurants(): Promise<RestaurantListResponse> {
  if (isSupabaseConfigured()) {
    try {
      const places = await supabase.getAllSupabaseRestaurants();
      return { mode: "supabase", places };
    } catch (error) {
      console.error("[foodie/data] Supabase all-restaurants query failed:", error);
      return demoResult({ places: await demo.getAllDemoRestaurants() }, SUPABASE_ERROR_NOTICE);
    }
  }
  return demoResult({ places: await demo.getAllDemoRestaurants() }, DEMO_MODE_NOTICE);
}

export async function loadRestaurantsByCategory(category: string): Promise<RestaurantListResponse> {
  if (isSupabaseConfigured()) {
    try {
      const places = await supabase.getSupabaseRestaurantsByCategory(category);
      return { mode: "supabase", places };
    } catch (error) {
      console.error("[foodie/data] Supabase category query failed:", error);
      return demoResult(
        { places: await demo.getDemoRestaurantsByCategory(category) },
        SUPABASE_ERROR_NOTICE
      );
    }
  }
  return demoResult({ places: await demo.getDemoRestaurantsByCategory(category) }, DEMO_MODE_NOTICE);
}

export async function loadRestaurantsBySearch(query: string): Promise<RestaurantListResponse> {
  if (isSupabaseConfigured()) {
    try {
      const places = await supabase.searchSupabaseRestaurants(query);
      return { mode: "supabase", places };
    } catch (error) {
      console.error("[foodie/data] Supabase search failed:", error);
      return demoResult({ places: await demo.searchDemoRestaurants(query) }, SUPABASE_ERROR_NOTICE);
    }
  }
  return demoResult({ places: await demo.searchDemoRestaurants(query) }, DEMO_MODE_NOTICE);
}

/* ------------------------------------------------------------------ */
/* Destinations — real database ONLY, never demo-fabricated            */
/* ------------------------------------------------------------------ */

/**
 * Every active destination. Same policy as reviews: there is NO demo
 * dataset for destinations, so a failure yields an honestly EMPTY list
 * with a notice — fabricated cities/foods are never substituted.
 */
export async function loadDestinations(): Promise<DestinationsResponse> {
  if (isSupabaseConfigured()) {
    try {
      const destinations = await supabase.getSupabaseDestinations();
      return { mode: "supabase", destinations };
    } catch (error) {
      console.error("[foodie/data] Supabase destinations query failed:", error);
      return { mode: "supabase", destinations: [], notice: SUPABASE_ERROR_NOTICE };
    }
  }
  return { mode: "demo", destinations: [], notice: DEMO_MODE_NOTICE };
}

/**
 * One destination plus its curated foods (empty list when the destination
 * genuinely has none — the UI shows its honest empty state). The route
 * turns `destination: null` into a 404.
 */
export async function loadDestinationFoods(destinationId: string): Promise<DestinationFoodsResponse> {
  if (isSupabaseConfigured()) {
    try {
      const [destination, foods] = await Promise.all([
        supabase.getSupabaseDestination(destinationId),
        supabase.getSupabaseDestinationFoods(destinationId),
      ]);
      return { mode: "supabase", destination, foods };
    } catch (error) {
      console.error("[foodie/data] Supabase destination-foods query failed:", error);
      return { mode: "supabase", destination: null, foods: [], notice: SUPABASE_ERROR_NOTICE };
    }
  }
  return { mode: "demo", destination: null, foods: [], notice: DEMO_MODE_NOTICE };
}

/**
 * Real user reviews for one restaurant (public read, no session needed).
 *
 * Unlike restaurant reads there is NO demo fallback here: the demo dataset
 * never fabricates reviews — demo mode (or a Supabase failure) yields an
 * empty, honestly-labelled list and the UI shows its real empty state.
 */
export async function loadReviews(restaurantId: string): Promise<ReviewsResponse> {
  if (isSupabaseConfigured()) {
    try {
      const reviews = await supabase.getSupabaseReviews(restaurantId);
      return { mode: "supabase", reviews };
    } catch (error) {
      console.error("[foodie/data] Supabase reviews query failed:", error);
      // Honest empty result — never fake review rows to cover a database blip.
      return { mode: "supabase", reviews: [], notice: SUPABASE_ERROR_NOTICE };
    }
  }
  return { mode: "demo", reviews: [], notice: DEMO_MODE_NOTICE };
}
