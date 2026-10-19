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
  DestinationAttractionsResponse,
  DestinationFoodPlacesResponse,
  DestinationFoodsResponse,
  DestinationPlacesResponse,
  DestinationsResponse,
  NearbyRestaurantsResponse,
  PointOfInterestDetailResponse,
  RestaurantDetailResponse,
  RestaurantListResponse,
  ReviewsResponse,
} from "./types";
import {
  DEMO_MODE_NOTICE,
  PLACES_TABLE_NOT_READY_NOTICE,
  SUPABASE_ERROR_NOTICE,
} from "./types";
import * as demo from "./demoBackend";
import * as supabase from "./supabaseBackend";

function demoResult<T>(result: T, notice: string): T & { mode: DataMode } {
  return { ...result, mode: "demo", notice };
}

/**
 * Detects the "public.places isn't applied yet" failure mode (the CURRENT
 * production state — migration-008 is a review candidate). PostgREST reports
 * a missing table as PGRST205 / "Could not find the table … schema cache";
 * the raw Postgres text is "relation … does not exist". Matching on the
 * message (not just a code) because supabaseBackend re-wraps errors as
 * plain Error objects carrying only the message.
 */
function isMissingPlacesTable(error: unknown): boolean {
  const message =
    error instanceof Error ? error.message.toLowerCase() : String(error ?? "").toLowerCase();
  return (
    message.includes("could not find the table") ||
    message.includes("does not exist") ||
    message.includes("schema cache")
  );
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
/* Destinations — live rows when connected, real-value demo preview     */
/* when not. A Supabase FAILURE still yields an honestly EMPTY list     */
/* with a notice (demo data is never substituted over a database blip). */
/* ------------------------------------------------------------------ */

/**
 * Every active destination. Demo mode serves the clearly-labelled preview
 * dataset (verbatim batch-003 seed values — see src/data/destinations.ts);
 * a Supabase failure yields an honestly EMPTY list with a notice.
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
  return demoResult({ destinations: demo.getDemoDestinations() }, DEMO_MODE_NOTICE);
}

/**
 * One destination plus its curated foods. Demo mode resolves the preview
 * destination + foods (same fixed ids as the live seed); a Supabase
 * failure returns destination:null with a notice (the route keeps it a
 * 200-with-notice rather than a bare 404 so the UI can show the reason).
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
  const destination = demo.getDemoDestinationById(destinationId);
  if (!destination) return { mode: "demo", destination: null, foods: [], notice: DEMO_MODE_NOTICE };
  return demoResult(
    { destination, foods: demo.getDemoDestinationFoods(destinationId) },
    DEMO_MODE_NOTICE
  );
}

/**
 * One destination food plus its CURATED places (evidence-gated links).
 * `food: null` → the route responds 404; zero links is an honest empty list
 * (random nearby restaurants are NEVER substituted — migration-004 rule).
 * Demo mode resolves the preview food but keeps links empty: fabricating
 * "places serving X" would break the honesty contract.
 */
export async function loadDestinationFoodPlaces(
  foodId: string
): Promise<DestinationFoodPlacesResponse> {
  if (isSupabaseConfigured()) {
    try {
      const result = await supabase.getSupabaseDestinationFoodPlaces(foodId);
      return { mode: "supabase", ...result };
    } catch (error) {
      console.error("[foodie/data] Supabase destination-food-places query failed:", error);
      return { mode: "supabase", food: null, places: [], notice: SUPABASE_ERROR_NOTICE };
    }
  }
  // Demo mode resolves the preview food but NEVER fabricates place links —
  // the link table is evidence-gated (migration-004) and stays empty.
  const food = demo.getDemoDestinationFoodById(foodId);
  return demoResult({ food, places: [] }, DEMO_MODE_NOTICE);
}

/**
 * Every discoverable place recorded in a destination's OWN city — the
 * reusable multi-area browser behind the destination screen (Area A:
 * Tirupati). `destination: null` → the route responds 404; zero rows is an
 * honest empty state until verified data is curated for that city.
 */
export async function loadDestinationPlaces(destinationId: string): Promise<DestinationPlacesResponse> {
  if (isSupabaseConfigured()) {
    try {
      const destination = await supabase.getSupabaseDestination(destinationId);
      if (!destination) return { mode: "supabase", destination: null, places: [] };
      const places = await supabase.getSupabaseRestaurantsByCity(destination.name);
      return { mode: "supabase", destination, places };
    } catch (error) {
      console.error("[foodie/data] Supabase destination-places query failed:", error);
      return { mode: "supabase", destination: null, places: [], notice: SUPABASE_ERROR_NOTICE };
    }
  }
  const destination = demo.getDemoDestinationById(destinationId);
  if (!destination) return { mode: "demo", destination: null, places: [], notice: DEMO_MODE_NOTICE };
  return demoResult(
    { destination, places: demo.getDemoRestaurantsByDestinationCity(destination) },
    DEMO_MODE_NOTICE
  );
}

/* ------------------------------------------------------------------ */
/* public.places — NON-FOOD points of interest (attractions + lodging) */
/* ------------------------------------------------------------------ */

/**
 * Attractions & stays of one destination (the approved public.places
 * model, migration-008 design).
 *
 * Live mode: the table is NOT applied yet (verified), so PostgREST's
 * missing-table error is mapped to PLACES_TABLE_NOT_READY_NOTICE with
 * destination resolved independently — the UI renders an honest "not set
 * up yet" state instead of an error or invented places. Unknown ids yield
 * destination:null with no notice (a genuine 404).
 *
 * Demo mode: the clearly-labelled preview dataset (16 real researched
 * rows — see src/data/points-of-interest.ts).
 */
export async function loadDestinationAttractions(
  destinationId: string
): Promise<DestinationAttractionsResponse> {
  if (isSupabaseConfigured()) {
    try {
      const destination = await supabase.getSupabaseDestination(destinationId);
      if (!destination) return { mode: "supabase", destination: null, attractions: [] };
      try {
        const attractions = await supabase.getSupabaseAttractionsByDestination(destination);
        return { mode: "supabase", destination, attractions };
      } catch (placesError) {
        if (isMissingPlacesTable(placesError)) {
          console.warn("[foodie/data] public.places is not applied yet (migration-008 pending)");
          return {
            mode: "supabase",
            destination,
            attractions: [],
            notice: PLACES_TABLE_NOT_READY_NOTICE,
          };
        }
        throw placesError;
      }
    } catch (error) {
      console.error("[foodie/data] Supabase attractions query failed:", error);
      return { mode: "supabase", destination: null, attractions: [], notice: SUPABASE_ERROR_NOTICE };
    }
  }
  const destination = demo.getDemoDestinationById(destinationId);
  if (!destination) return { mode: "demo", destination: null, attractions: [], notice: DEMO_MODE_NOTICE };
  return demoResult(
    { destination, attractions: demo.getDemoAttractionsByDestination(destination) },
    DEMO_MODE_NOTICE
  );
}

/**
 * One non-food place (attraction or lodging hotel) by stable uuid5 id.
 * Same missing-table handling as the destination loader — the response
 * carries the notice so the detail screen can explain the honest state.
 */
export async function loadPointOfInterestById(id: string): Promise<PointOfInterestDetailResponse> {
  if (isSupabaseConfigured()) {
    try {
      const place = await supabase.getSupabasePlaceById(id);
      return { mode: "supabase", place };
    } catch (error) {
      if (isMissingPlacesTable(error)) {
        console.warn("[foodie/data] public.places is not applied yet (migration-008 pending)");
        return { mode: "supabase", place: null, notice: PLACES_TABLE_NOT_READY_NOTICE };
      }
      console.error("[foodie/data] Supabase place detail query failed:", error);
      return { mode: "supabase", place: null, notice: SUPABASE_ERROR_NOTICE };
    }
  }
  const place = demo.getDemoPlaceById(id);
  return demoResult({ place }, DEMO_MODE_NOTICE);
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
