/**
 * Foodie data layer — shared types.
 *
 * `RestaurantRow` / `DishRow` / `ReviewRow` / `RestaurantPhotoRow` mirror the
 * Supabase tables defined in `supabase/schema.sql` 1:1 (snake_case on the
 * wire, mapped into the app's domain types by `mappers.ts`).
 */

import type {
  Destination,
  DestinationFood,
  Place,
  PlaceWithDistance,
  PriceRange,
} from "../types";

/** Which backend produced a response: the real database or the demo dataset. */
export type DataMode = "supabase" | "demo";

/** Default radius (km) for the discovery feed when none is provided. */
export const DEFAULT_DISCOVERY_RADIUS_KM = 50;

/* ------------------------------------------------------------------ */
/* Database row shapes (snake_case — matches supabase/schema.sql)      */
/* ------------------------------------------------------------------ */

export interface RestaurantRow {
  id: string;
  name: string;
  description: string | null;
  category: string;
  address: string;
  city: string;
  /** Nullable (insert-batch-001): places awaiting coordinate verification store NULL. */
  latitude: number | null;
  longitude: number | null;
  rating: number;
  /** Nullable (insert-batch-001): NULL = price level not captured yet. */
  price_level: PriceRange | null;
  opening_hours: string | null;
  phone: string | null;
  website: string | null;
  is_hidden_gem: boolean;
  is_local_favorite: boolean;
  /**
   * Optional: rows fetched via `select("*")` include these. The legacy
   * nearby_restaurants RPC (pre-migration-005) also omitted them; the
   * rebuilt RPC (migration-005) returns the complete row. The mapper
   * treats a missing value as "unknown" — never as "false / unverified".
   */
  student_friendly?: boolean;
  verification_status?: string;
  tags?: string[] | null;
  locality?: string | null;
  /**
   * Phase 2 — provenance + Foodie community aggregates (migration-005).
   * Optional because pre-migration tables and the legacy RPC don't carry
   * them; the mapper maps a missing column exactly like NULL (unknown)
   * and NEVER invents a value.
   *
   *   review_count     : real count of Foodie reviews (0 = none yet)
   *   community_rating : average of Foodie review ratings (NULL = none yet)
   *   source/source_url/last_verified_at : NULL = unknown, never guessed
   *   *_verified       : NULL = not checked · false = checked, NOT verified
   *                      · true = verified with real evidence
   *
   * The listed `rating` column is never touched by any of these.
   */
  review_count?: number;
  community_rating?: number | null;
  source?: string | null;
  source_url?: string | null;
  last_verified_at?: string | null;
  address_verified?: boolean | null;
  coordinates_verified?: boolean | null;
  hours_verified?: boolean | null;
  photos_verified?: boolean | null;
  created_at: string;
}

/**
 * Row shape returned by the `nearby_restaurants` RPC.
 * Rebuilt in migration-005 to carry the complete current restaurant row
 * (aggregates + provenance) on top of the unchanged Haversine behaviour.
 * Before that migration runs, the legacy RPC omits the newer columns and
 * the mapper null-fills them — both shapes satisfy this interface.
 */
export interface NearbyRestaurantRow extends RestaurantRow {
  distance_km: number;
}

export interface DishRow {
  id: string;
  restaurant_id: string;
  name: string;
  description: string | null;
  price: number | null;
  category: string | null;
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  is_signature: boolean;
  /**
   * migration-007 provenance: page that published this item (NULL on legacy
   * rows / pre-migration tables — mapped to unknown, never guessed).
   */
  source_url?: string | null;
  created_at: string;
}

export interface ReviewRow {
  id: string;
  restaurant_id: string;
  user_id: string | null;
  rating: number;
  review: string;
  created_at: string;
}

export interface RestaurantPhotoRow {
  id: string;
  restaurant_id: string;
  image_url: string;
  uploaded_by: string | null;
  created_at: string;
}

/* ------------------------------------------------------------------ */
/* Destinations (migration-003 / insert-batch-003) — 1:1 row shapes     */
/* ------------------------------------------------------------------ */

/** `destinations` row (snake_case — matches the live table exactly). */
export interface DestinationRow {
  id: string;
  slug: string;
  name: string;
  region: string | null;
  country: string | null;
  description: string | null;
  /** NULL until an image URL has been verified — never guessed at. */
  image_url: string | null;
  /** Reference coordinates used for destination auto-detection. */
  latitude: number | null;
  longitude: number | null;
  is_active: boolean;
  created_at: string;
}

/** `destination_foods` row (snake_case — matches the live table exactly). */
export interface DestinationFoodRow {
  id: string;
  destination_id: string;
  name: string;
  description: string | null;
  food_type: string | null;
  /** DB CHECK allows 'signature' | 'famous' | 'local'; nullable. */
  designation: string | null;
  image_url: string | null;
  created_at: string;
}

/**
 * NOTE on `destination_food_places` (migration-004): it links destination
 * foods to REAL restaurants and stays empty until evidence-based links are
 * curated. No UI consumes it yet — when it does, the link list must render
 * an honest empty state, never random nearby restaurants.
 */

/* ------------------------------------------------------------------ */
/* API responses (shared by /api/restaurants/* and the client repo)    */
/* ------------------------------------------------------------------ */

/** `notice` explains demo fallbacks in plain language (surfaced in the UI). */
export interface NearbyRestaurantsResponse {
  mode: DataMode;
  places: PlaceWithDistance[];
  notice?: string;
}

export interface RestaurantListResponse {
  mode: DataMode;
  places: Place[];
  notice?: string;
}

export interface RestaurantDetailResponse {
  mode: DataMode;
  place: Place | null;
  notice?: string;
}

/**
 * GET /api/restaurants/[id]/reviews — real user reviews for one place.
 *
 * Demo mode returns an EMPTY list on purpose: review rows only ever come
 * from real authenticated users in the real database, so demo data is never
 * fabricated for them (the UI shows its honest "no reviews yet" state).
 */
export interface ReviewsResponse {
  mode: DataMode;
  reviews: ReviewRow[];
  notice?: string;
}

/* ------------------------------------------------------------------ */
/* Destination API responses (/api/destinations*)                      */
/* ------------------------------------------------------------------ */

/**
 * GET /api/destinations — every active destination. Unlike restaurant
 * feeds there is NO demo dataset for destinations (the demo places list
 * contains no cities): when Supabase is unavailable the response is an
 * honestly EMPTY list with a notice, never fabricated destinations.
 */
export interface DestinationsResponse {
  mode: DataMode;
  destinations: Destination[];
  notice?: string;
}

/**
 * GET /api/destinations/[id]/foods — one destination plus its curated
 * famous/local foods. `destination` is null when the id is unknown
 * (the route turns that into a 404).
 */
export interface DestinationFoodsResponse {
  mode: DataMode;
  destination: Destination | null;
  foods: DestinationFood[];
  notice?: string;
}

/** Hard limits shared by the client form, the write layer and the DB check. */
export const REVIEW_TEXT_MIN_LENGTH = 1;
export const REVIEW_TEXT_MAX_LENGTH = 2000;

export const DEMO_MODE_NOTICE =
  "Supabase isn't connected yet — you're browsing the clearly-labelled demo dataset.";
export const SUPABASE_ERROR_NOTICE =
  "The Supabase query failed, so demo data is being shown temporarily. Check the server logs.";
