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
  SUPABASE_PERMISSION_NOTICE,
  SUPABASE_TIMEOUT_NOTICE,
  SUPABASE_UNAVAILABLE_NOTICE,
} from "./types";
import * as demo from "./demoBackend";
import * as supabase from "./supabaseBackend";

function demoResult<T>(result: T, notice: string): T & { mode: DataMode } {
  return { ...result, mode: "demo", notice };
}

/* ------------------------------------------------------------------ */
/* Error classification — every Supabase failure gets an HONEST notice */
/* ------------------------------------------------------------------ */

/** The failure kinds the app distinguishes (each maps to its own notice). */
export type SupabaseErrorKind =
  | "missing-table" // migration not applied (public.places is the live case)
  | "timeout"       // query exceeded the server-side time budget
  | "permission"    // Row Level Security / role refused the read
  | "server-error"; // everything else (Postgres error, network, unknown)

/**
 * Server-side query time budget. A hung database (paused project, network
 * black hole) must NEVER hang the API route indefinitely — past this budget
 * the request is stopped and the loader's documented fallback runs with the
 * SUPABASE_TIMEOUT notice.
 */
export const QUERY_TIMEOUT_MS = 10_000;

/** Raised by `withQueryTimeout` when the budget is exceeded. */
export class SupabaseQueryTimeoutError extends Error {
  constructor() {
    super(`Supabase query exceeded the ${QUERY_TIMEOUT_MS}ms server-side time budget`);
    this.name = "SupabaseQueryTimeoutError";
  }
}

/**
 * Stop waiting on `op` after QUERY_TIMEOUT_MS. The underlying query keeps
 * running in the background and its eventual result is discarded — the
 * caller proceeds on the honest fallback path instead of hanging.
 */
export function withQueryTimeout<T>(op: Promise<T>): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new SupabaseQueryTimeoutError()), QUERY_TIMEOUT_MS);
  });
  return Promise.race([op, timeout]).finally(() => {
    if (timer !== undefined) clearTimeout(timer);
  });
}

/**
 * Detects the "public.places isn't queryable" failure mode. PostgREST
 * reports a missing table as PGRST205 / "Could not find the table … schema
 * cache"; the raw Postgres text is "relation … does not exist". Matching on
 * the message (not just a code) because supabaseBackend re-wraps errors as
 * plain Error objects carrying only the message. Exported for tests.
 */
export function isMissingPlacesTable(error: unknown): boolean {
  const message =
    error instanceof Error ? error.message.toLowerCase() : String(error ?? "").toLowerCase();
  return (
    message.includes("could not find the table") ||
    message.includes("does not exist") ||
    message.includes("schema cache")
  );
}

/**
 * Classify ANY Supabase failure into one of four kinds. Order matters:
 * timeout first (our own error), then RLS/permission, then missing-table,
 * with everything else a server error. Exported for tests.
 */
export function classifySupabaseError(error: unknown): SupabaseErrorKind {
  if (error instanceof SupabaseQueryTimeoutError) return "timeout";

  // Codes arrive in either case ("PGRST301" on the wire, "pgrst301" in docs).
  const code = ((error as { code?: string } | null)?.code ?? "").toLowerCase();
  const message =
    error instanceof Error ? error.message.toLowerCase() : String(error ?? "").toLowerCase();

  // RLS / role refusals: 42501 insufficient_privilege, PGRST301/302
  // (unaccepted/expired JWT reaching the RLS layer), and the message shapes
  // Postgres/PostgREST produce for policy refusals.
  if (
    code === "42501" ||
    code === "pgrst301" ||
    code === "pgrst302" ||
    message.includes("row-level security") ||
    message.includes("permission denied") ||
    message.includes("insufficient_privilege") ||
    message.includes("insufficient privilege")
  ) {
    return "permission";
  }

  if (isMissingPlacesTable(error)) return "missing-table";

  if (message.includes("timeout") || message.includes("timed out") || message.includes("aborted")) {
    return "timeout";
  }

  return "server-error";
}

/**
 * The notice for a Supabase failure, per fallback context:
 *   - "demo-fallback" (restaurant feeds): demo data IS being served — the
 *     notice may say so (SUPABASE_ERROR_NOTICE), with timeout/permission
 *     getting their more precise wording.
 *   - "honest-empty" (destinations / reviews / public.places): NOTHING is
 *     substituted, so a "demo data is being shown" notice would be a LIE —
 *     the notice says the list is genuinely empty (SUPABASE_UNAVAILABLE_NOTICE).
 */
function supabaseFailureNotice(error: unknown, context: "demo-fallback" | "honest-empty"): string {
  const kind = classifySupabaseError(error);
  if (context === "demo-fallback") {
    switch (kind) {
      case "timeout":
        return SUPABASE_TIMEOUT_NOTICE;
      case "permission":
        return SUPABASE_PERMISSION_NOTICE;
      default:
        // missing-table on a food table or a generic failure — both are a
        // database problem, and the demo banner labels the demo data.
        return SUPABASE_ERROR_NOTICE;
    }
  }
  switch (kind) {
    case "missing-table":
      return PLACES_TABLE_NOT_READY_NOTICE;
    case "timeout":
      return SUPABASE_TIMEOUT_NOTICE;
    case "permission":
      return SUPABASE_PERMISSION_NOTICE;
    default:
      return SUPABASE_UNAVAILABLE_NOTICE;
  }
}

export async function loadNearbyRestaurants(
  latitude: number,
  longitude: number,
  radiusKm: number
): Promise<NearbyRestaurantsResponse> {
  if (isSupabaseConfigured()) {
    try {
      const places = await withQueryTimeout(
        supabase.getNearbySupabaseRestaurants(latitude, longitude, radiusKm)
      );
      return { mode: "supabase", places };
    } catch (error) {
      console.error("[foodie/data] Supabase nearby query failed:", error);
      return demoResult(
        { places: await demo.getNearbyDemoRestaurants(latitude, longitude, radiusKm) },
        supabaseFailureNotice(error, "demo-fallback")
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
      const place = await withQueryTimeout(supabase.getSupabaseRestaurantById(id));
      return { mode: "supabase", place };
    } catch (error) {
      console.error("[foodie/data] Supabase detail query failed:", error);
      return demoResult(
        { place: await demo.getDemoRestaurantById(id) },
        supabaseFailureNotice(error, "demo-fallback")
      );
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
      const places = await withQueryTimeout(supabase.getAllSupabaseRestaurants());
      return { mode: "supabase", places };
    } catch (error) {
      console.error("[foodie/data] Supabase all-restaurants query failed:", error);
      return demoResult(
        { places: await demo.getAllDemoRestaurants() },
        supabaseFailureNotice(error, "demo-fallback")
      );
    }
  }
  return demoResult({ places: await demo.getAllDemoRestaurants() }, DEMO_MODE_NOTICE);
}

export async function loadRestaurantsByCategory(category: string): Promise<RestaurantListResponse> {
  if (isSupabaseConfigured()) {
    try {
      const places = await withQueryTimeout(supabase.getSupabaseRestaurantsByCategory(category));
      return { mode: "supabase", places };
    } catch (error) {
      console.error("[foodie/data] Supabase category query failed:", error);
      return demoResult(
        { places: await demo.getDemoRestaurantsByCategory(category) },
        supabaseFailureNotice(error, "demo-fallback")
      );
    }
  }
  return demoResult({ places: await demo.getDemoRestaurantsByCategory(category) }, DEMO_MODE_NOTICE);
}

export async function loadRestaurantsBySearch(query: string): Promise<RestaurantListResponse> {
  if (isSupabaseConfigured()) {
    try {
      const places = await withQueryTimeout(supabase.searchSupabaseRestaurants(query));
      return { mode: "supabase", places };
    } catch (error) {
      console.error("[foodie/data] Supabase search failed:", error);
      return demoResult(
        { places: await demo.searchDemoRestaurants(query) },
        supabaseFailureNotice(error, "demo-fallback")
      );
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
      const destinations = await withQueryTimeout(supabase.getSupabaseDestinations());
      return { mode: "supabase", destinations };
    } catch (error) {
      console.error("[foodie/data] Supabase destinations query failed:", error);
      return {
        mode: "supabase",
        destinations: [],
        notice: supabaseFailureNotice(error, "honest-empty"),
      };
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
      const [destination, foods] = await withQueryTimeout(
        Promise.all([
          supabase.getSupabaseDestination(destinationId),
          supabase.getSupabaseDestinationFoods(destinationId),
        ])
      );
      return { mode: "supabase", destination, foods };
    } catch (error) {
      console.error("[foodie/data] Supabase destination-foods query failed:", error);
      return {
        mode: "supabase",
        destination: null,
        foods: [],
        notice: supabaseFailureNotice(error, "honest-empty"),
      };
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
      const result = await withQueryTimeout(supabase.getSupabaseDestinationFoodPlaces(foodId));
      return { mode: "supabase", ...result };
    } catch (error) {
      console.error("[foodie/data] Supabase destination-food-places query failed:", error);
      return {
        mode: "supabase",
        food: null,
        places: [],
        notice: supabaseFailureNotice(error, "honest-empty"),
      };
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
      const destination = await withQueryTimeout(supabase.getSupabaseDestination(destinationId));
      if (!destination) return { mode: "supabase", destination: null, places: [] };
      const places = await withQueryTimeout(supabase.getSupabaseRestaurantsByCity(destination.name));
      return { mode: "supabase", destination, places };
    } catch (error) {
      console.error("[foodie/data] Supabase destination-places query failed:", error);
      return {
        mode: "supabase",
        destination: null,
        places: [],
        notice: supabaseFailureNotice(error, "honest-empty"),
      };
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
 * Live mode handles every deployment state honestly, never assuming one:
 * the table may be absent (owner has not applied migration-008 yet —
 * mapped to PLACES_TABLE_NOT_READY_NOTICE with destination resolved
 * independently) or present with zero curated rows (Batch-011 counts as
 * imported ONLY after a successful owner-run verify-batch-011 result, so
 * an empty table renders the honest "nothing recorded" state). Unknown
 * ids yield destination:null with no notice (a genuine 404).
 *
 * Demo mode: the clearly-labelled preview dataset (16 real researched
 * rows — see src/data/points-of-interest.ts).
 */
export async function loadDestinationAttractions(
  destinationId: string
): Promise<DestinationAttractionsResponse> {
  if (isSupabaseConfigured()) {
    try {
      const destination = await withQueryTimeout(supabase.getSupabaseDestination(destinationId));
      if (!destination) return { mode: "supabase", destination: null, attractions: [] };
      try {
        const attractions = await withQueryTimeout(
          supabase.getSupabaseAttractionsByDestination(destination)
        );
        return { mode: "supabase", destination, attractions };
      } catch (placesError) {
        if (isMissingPlacesTable(placesError)) {
          console.warn("[foodie/data] public.places is not queryable (migration-008 not applied on this project)");
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
      return {
        mode: "supabase",
        destination: null,
        attractions: [],
        notice: supabaseFailureNotice(error, "honest-empty"),
      };
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
      const place = await withQueryTimeout(supabase.getSupabasePlaceById(id));
      return { mode: "supabase", place };
    } catch (error) {
      if (isMissingPlacesTable(error)) {
        console.warn("[foodie/data] public.places is not queryable (migration-008 not applied on this project)");
        return { mode: "supabase", place: null, notice: PLACES_TABLE_NOT_READY_NOTICE };
      }
      console.error("[foodie/data] Supabase place detail query failed:", error);
      return {
        mode: "supabase",
        place: null,
        notice: supabaseFailureNotice(error, "honest-empty"),
      };
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
      const reviews = await withQueryTimeout(supabase.getSupabaseReviews(restaurantId));
      return { mode: "supabase", reviews };
    } catch (error) {
      console.error("[foodie/data] Supabase reviews query failed:", error);
      // Honest empty result — never fake review rows to cover a database
      // blip; the notice names the failure kind instead of claiming data.
      return {
        mode: "supabase",
        reviews: [],
        notice: supabaseFailureNotice(error, "honest-empty"),
      };
    }
  }
  return { mode: "demo", reviews: [], notice: DEMO_MODE_NOTICE };
}
