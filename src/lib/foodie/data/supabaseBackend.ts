/**
 * Supabase backend — real restaurant database queries (server-side).
 *
 * Implemented with the official `@supabase/supabase-js` client. Every query
 * reads the restaurants' ACTUAL stored latitude/longitude — no hardcoded
 * city coordinates anywhere.
 *
 * Nearby search strategy (fastest available path first):
 *   1. `nearby_restaurants` RPC — distance filtering + ordering happen inside
 *      Postgres (see supabase/schema.sql §6; upgradeable to PostGIS without
 *      touching app code).
 *   2. Fallback — bounding-box pre-filter via indexed `latitude`/`longitude`
 *      columns, then the same Haversine formula applied in Node (kept as the
 *      safety net; identical math to the RPC).
 */

import { haversineKm } from "../location";
import { getSupabaseClient } from "@/lib/supabase/server";
import type {
  Destination,
  DestinationFood,
  GeoPosition,
  Place,
  PlaceWithDistance,
  PointOfInterest,
} from "../types";
import {
  destinationFoodRowToFood,
  destinationRowToDestination,
  isUuid,
  nearbyRowToPlaceWithDistance,
  placeRowToPointOfInterest,
  restaurantRowToPlace,
  type PhotoRecord,
} from "./mappers";
import type {
  DestinationFoodRow,
  DestinationRow,
  DishRow,
  NearbyRestaurantRow,
  PlaceRow,
  RestaurantRow,
  ReviewRow,
} from "./types";

function requireClient() {
  const client = getSupabaseClient();
  if (!client) throw new Error("Supabase is not configured (missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY — legacy NEXT_PUBLIC_SUPABASE_ANON_KEY still accepted).");
  return client;
}

/** Square around `center` that fully contains `radiusKm` — cheap pre-filter. */
function boundingBox(center: GeoPosition, radiusKm: number) {
  const latDelta = radiusKm / 111.32; // ≈ km per degree of latitude
  const cosLat = Math.max(0.01, Math.cos((center.lat * Math.PI) / 180));
  const lngDelta = radiusKm / (111.32 * cosLat);
  return {
    minLat: center.lat - latDelta,
    maxLat: center.lat + latDelta,
    minLng: center.lng - lngDelta,
    maxLng: center.lng + lngDelta,
  };
}

export async function getNearbySupabaseRestaurants(
  latitude: number,
  longitude: number,
  radiusKm: number
): Promise<PlaceWithDistance[]> {
  const sb = requireClient();
  const origin: GeoPosition = { lat: latitude, lng: longitude };

  // Path 1 — distance math runs in Postgres via the nearby_restaurants RPC.
  const rpc = await sb.rpc("nearby_restaurants", {
    lat: latitude,
    lng: longitude,
    radius_km: radiusKm,
  });
  if (!rpc.error && Array.isArray(rpc.data)) {
    return (rpc.data as NearbyRestaurantRow[])
      .map(nearbyRowToPlaceWithDistance)
      .filter(isDiscoverable);
  }
  if (rpc.error) {
    // Function missing (schema §6 not run) or another RPC issue — fall back.
    console.warn("[foodie/data] nearby_restaurants RPC unavailable, using fallback:", rpc.error.message);
  }

  // Path 2 — indexed bounding-box pre-filter + Haversine in Node.
  const bb = boundingBox(origin, radiusKm);
  const { data, error } = await sb
    .from("restaurants")
    .select("*")
    .gte("latitude", bb.minLat)
    .lte("latitude", bb.maxLat)
    .gte("longitude", bb.minLng)
    .lte("longitude", bb.maxLng);
  if (error) throw new Error(error.message);

  return ((data ?? []) as RestaurantRow[])
    // Rows without stored coordinates can never enter distance math —
    // they simply don't appear in nearby results until coords are verified.
    .filter(
      (r): r is RestaurantRow & { latitude: number; longitude: number } =>
        r.latitude != null && r.longitude != null
    )
    .map((row) => ({
      ...restaurantRowToPlace(row),
      distanceKm: haversineKm(origin, { lat: row.latitude, lng: row.longitude }),
    }))
    .filter(isDiscoverable)
    .filter((p) => p.distanceKm <= radiusKm)
    .sort((a, b) => a.distanceKm - b.distanceKm);
}

export async function getSupabaseRestaurantById(id: string): Promise<Place | null> {
  if (!isUuid(id)) return null; // not a database id (e.g. a stale demo id)
  const sb = requireClient();

  const [restaurantRes, dishesRes, photosRes] = await Promise.all([
    sb.from("restaurants").select("*").eq("id", id).maybeSingle(),
    // The menu is content but not worth a dead page — ordered (oldest
    // first) and failure-isolated like photos, degrading to "no dishes"
    // with a logged warning. READ-ONLY, governed by the existing RLS
    // "dishes are readable by everyone" SELECT policy. Nothing writes.
    // (supabase-js builders are thenables — wrap for a catchable promise.)
    Promise.resolve(
      sb
        .from("dishes")
        .select("*")
        .eq("restaurant_id", id)
        .order("created_at", { ascending: true })
    ).catch((err) => {
      console.warn("[foodie/data] dishes read failed:", (err as Error)?.message ?? err);
      return { data: [] as DishRow[], error: null };
    }),
    // Photos belong to the detail page but are decoration — the read is
    // ordered (oldest first) and failure-isolated, so a broken photos query
    // degrades to an empty gallery instead of failing the whole page.
    // READ-ONLY, governed by the existing RLS "photos are readable by
    // everyone" SELECT policy — nothing here writes to the table.
    // (The supabase-js builder is a thenable, not a Promise — wrap it so a
    // network-level rejection can be caught here.)
    Promise.resolve(
      sb
        .from("restaurant_photos")
        // select("*") — returns image_url always, plus the licensing columns
        // (migration-006) when the migration has run. On a pre-migration
        // database the extra columns are simply absent (no error), so photos
        // keep rendering and credits degrade gracefully to "unknown".
        .select("*")
        .eq("restaurant_id", id)
        .order("created_at", { ascending: true })
    ).catch((err) => {
      console.warn("[foodie/data] restaurant_photos read failed:", (err as Error)?.message ?? err);
      return { data: [] as PhotoRecord[], error: null };
    }),
  ]);
  if (restaurantRes.error) throw new Error(restaurantRes.error.message);
  if (!restaurantRes.data) return null;

  return restaurantRowToPlace(
    restaurantRes.data as RestaurantRow,
    (dishesRes.data ?? []) as DishRow[],
    (photosRes.data ?? []) as PhotoRecord[]
  );
}

/**
 * ALL discoverable restaurants — the "browse everything" pool behind
 * category browsing, search and the main list view.
 *
 * READ-ONLY. Rows whose coordinates are still NULL are included ON PURPOSE:
 * the UI shows them as "Location pending verification" and they never enter
 * distance math (the screen annotates only coordinate-bearing rows via
 * `withDistances`). No restaurant data is modified here.
 */
export async function getAllSupabaseRestaurants(): Promise<Place[]> {
  const sb = requireClient();
  const { data, error } = await sb
    .from("restaurants")
    .select("*")
    .order("rating", { ascending: false });
  if (error) throw new Error(error.message);
  return ((data ?? []) as RestaurantRow[])
    .map((row) => restaurantRowToPlace(row))
    .filter(isDiscoverable);
}

export async function getSupabaseRestaurantsByCategory(category: string): Promise<Place[]> {
  const sb = requireClient();
  const { data, error } = await sb
    .from("restaurants")
    .select("*")
    .eq("category", category)
    .order("rating", { ascending: false });
  if (error) throw new Error(error.message);
  return ((data ?? []) as RestaurantRow[])
    .map((row) => restaurantRowToPlace(row))
    .filter(isDiscoverable);
}

/**
 * Every discoverable place recorded in ONE city (case-insensitive match on
 * restaurants.city). The reusable multi-area primitive: a destination is
 * browsed through its own city rows — never a hardcoded place list. Used by
 * /api/destinations/[id]/places (Prototype 3 Area A: Tirupati).
 */
export async function getSupabaseRestaurantsByCity(city: string): Promise<Place[]> {
  const safe = city.trim();
  if (!safe) return [];
  const sb = requireClient();
  const { data, error } = await sb
    .from("restaurants")
    .select("*")
    .ilike("city", safe)
    .order("rating", { ascending: false })
    .limit(200);
  if (error) throw new Error(error.message);
  return ((data ?? []) as RestaurantRow[])
    .map((row) => restaurantRowToPlace(row))
    .filter(isDiscoverable);
}

export async function searchSupabaseRestaurants(query: string): Promise<Place[]> {
  const sb = requireClient();
  // PostgREST `.or()` treats `,` `(` `)` as syntax — strip them along with
  // wildcard characters so a free-text craving can't break the filter.
  const safe = query.trim().replace(/[,()%]/g, " ").replace(/\s+/g, " ").trim();
  if (!safe) return [];

  const { data, error } = await sb
    .from("restaurants")
    .select("*")
    .or(
      [
        `name.ilike.%${safe}%`,
        `description.ilike.%${safe}%`,
        `address.ilike.%${safe}%`,
        `city.ilike.%${safe}%`,
      ].join(",")
    )
    .order("rating", { ascending: false })
    .limit(100);
  if (error) throw new Error(error.message);
  return ((data ?? []) as RestaurantRow[])
    .map((row) => restaurantRowToPlace(row))
    .filter(isDiscoverable);
}

/**
 * `closed` places stay in the database (history) but never reach the
 * discovery feed. Filtering happens AFTER the fetch (not via a SQL column
 * predicate) so queries keep working even before migration-001 adds the
 * `verification_status` column.
 */
function isDiscoverable<T extends { verificationStatus?: string }>(place: T): boolean {
  return place.verificationStatus !== "closed";
}

/* ------------------------------------------------------------------ */
/* Destinations (read-only — curated rows, public SELECT via RLS)      */
/* ------------------------------------------------------------------ */

/**
 * Every ACTIVE destination, alphabetical. READ-ONLY — the destinations
 * table is curated in Supabase (no public write policy) and this query
 * only ever SELECTs.
 */
export async function getSupabaseDestinations(): Promise<Destination[]> {
  const sb = requireClient();
  const { data, error } = await sb
    .from("destinations")
    .select("*")
    .eq("is_active", true)
    .order("name", { ascending: true });
  if (error) throw new Error(error.message);
  return ((data ?? []) as DestinationRow[]).map(destinationRowToDestination);
}

/** One destination by uuid — null when the id is unknown. */
export async function getSupabaseDestination(id: string): Promise<Destination | null> {
  if (!isUuid(id)) return null; // malformed ids can never match a row
  const sb = requireClient();
  const { data, error } = await sb
    .from("destinations")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? destinationRowToDestination(data as DestinationRow) : null;
}

/**
 * Curated famous/local foods of one destination. The companion
 * `destination_food_places` links (evidence-based restaurant connections)
 * are intentionally NOT joined here yet: that table is empty until real
 * places are verified, and the UI must never substitute random nearby
 * restaurants for verified links.
 */
export async function getSupabaseDestinationFoods(destinationId: string): Promise<DestinationFood[]> {
  if (!isUuid(destinationId)) return [];
  const sb = requireClient();
  const { data, error } = await sb
    .from("destination_foods")
    .select("*")
    .eq("destination_id", destinationId)
    .order("name", { ascending: true });
  if (error) throw new Error(error.message);
  return ((data ?? []) as DestinationFoodRow[]).map(destinationFoodRowToFood);
}

/**
 * ONE destination food plus the CURATED places serving it.
 *
 * Honesty rules (migration-004): places come ONLY from explicit
 * `destination_food_places` links — never inferred from category, name or
 * cuisine similarity. An unknown food id yields food:null (the route turns
 * that into a 404); a known food with zero links yields an honest empty
 * list. Random nearby restaurants are NEVER substituted.
 */
export async function getSupabaseDestinationFoodPlaces(
  foodId: string
): Promise<{ food: DestinationFood | null; places: Place[] }> {
  if (!isUuid(foodId)) return { food: null, places: [] };
  const sb = requireClient();

  const foodRes = await sb
    .from("destination_foods")
    .select("*")
    .eq("id", foodId)
    .maybeSingle();
  if (foodRes.error) throw new Error(foodRes.error.message);
  if (!foodRes.data) return { food: null, places: [] };
  const food = destinationFoodRowToFood(foodRes.data as DestinationFoodRow);

  // Inner join to restaurants via the FK — PostgREST returns the linked
  // restaurant row nested under `restaurants` for each link row.
  const linkRes = await sb
    .from("destination_food_places")
    .select("*, restaurants(*)")
    .eq("destination_food_id", foodId)
    .order("created_at", { ascending: true });
  if (linkRes.error) throw new Error(linkRes.error.message);

  const places = ((linkRes.data ?? []) as Array<{ restaurants: RestaurantRow | null }>)
    .map((row) => row.restaurants)
    .filter((r): r is RestaurantRow => r != null)
    .map((row) => restaurantRowToPlace(row))
    .filter(isDiscoverable);

  return { food, places };
}

/* ------------------------------------------------------------------ */
/* public.places — NON-FOOD points of interest (attractions + lodging) */
/* ------------------------------------------------------------------ */

/**
 * Strip PostgREST `.or()` syntax characters so a destination name can never
 * break the filter (same defence as searchSupabaseRestaurants).
 */
function safeOrValue(value: string): string {
  return value.trim().replace(/[,()%]/g, " ").replace(/\s+/g, " ").trim();
}

/**
 * NON-FOOD places of one destination — tourist attractions AND lodging
 * hotels from `public.places`. Dual match path exactly as the approved
 * design documents: the relational `destination_id` link when set, OR the
 * case-insensitive `city` primitive as the fallback. READ-ONLY; `closed`
 * rows are filtered by the shared isDiscoverable convention after the fetch.
 *
 * ⚠️ `public.places` is NOT live yet (migration-008 is an unrun REVIEW
 * CANDIDATE): until the owner applies it, PostgREST rejects this query with
 * a "relation does not exist" error — the dispatcher maps that to
 * PLACES_TABLE_NOT_READY_NOTICE and an honest empty list. Nothing here ever
 * writes, and no food/destination table is touched.
 */
export async function getSupabaseAttractionsByDestination(
  destination: Destination
): Promise<PointOfInterest[]> {
  const sb = requireClient();
  const city = safeOrValue(destination.name);
  const orParts = [`destination_id.eq.${destination.id}`];
  if (city) orParts.push(`city.ilike.${city}`);
  const { data, error } = await sb
    .from("places")
    .select("*")
    .eq("is_active", true)
    .or(orParts.join(","))
    .order("name", { ascending: true })
    .limit(200);
  if (error) throw new Error(error.message);
  return ((data ?? []) as PlaceRow[])
    .map(placeRowToPointOfInterest)
    .filter(isDiscoverable);
}

/**
 * One non-food place by its stable uuid5 id — null when the id is unknown.
 * Same not-live-yet caveat as the destination query above (the dispatcher
 * maps the missing-table error to an honest notice).
 */
export async function getSupabasePlaceById(id: string): Promise<PointOfInterest | null> {
  if (!isUuid(id)) return null; // malformed ids can never match a row
  const sb = requireClient();
  const { data, error } = await sb
    .from("places")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? placeRowToPointOfInterest(data as PlaceRow) : null;
}

/* ------------------------------------------------------------------ */
/* Reviews (read-only here — writes go browser→Supabase with the      */
/* user's own session so RLS can enforce ownership; see reviews.ts)   */
/* ------------------------------------------------------------------ */

/**
 * All reviews for one restaurant, newest first. Public read (RLS: the
 * "reviews are readable by everyone" policy) — no session needed. The rows
 * are the database's real review rows; nothing is aggregated or invented.
 */
export async function getSupabaseReviews(restaurantId: string): Promise<ReviewRow[]> {
  if (!isUuid(restaurantId)) return []; // demo:… ids and malformed ids have no real reviews
  const sb = requireClient();
  const { data, error } = await sb
    .from("reviews")
    .select("id,restaurant_id,user_id,rating,review,created_at")
    .eq("restaurant_id", restaurantId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as ReviewRow[];
}
