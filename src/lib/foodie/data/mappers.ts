/**
 * Mappers — database rows ➜ Foodie domain types.
 *
 * The UI only ever sees domain types (`Place`, `Dish`, …), so if the schema
 * grows or the backend changes, this is the ONE file to adjust.
 *
 * Documented display conventions (until dedicated columns exist):
 *   - `description`            ➜ shown as the place "tagline"
 *   - `locality` (fallback `city`) ➜ the `area` label
 *   - `category`               ➜ one of the 7 pilot place categories; its
 *                                 label is shown as the cuisine chip
 *   - `price_level`            ➜ `costForTwo` uses fixed display brackets
 *                                 (₹ → 250, ₹₹ → 700, ₹₹₹ → 1400) purely for
 *                                 the "₹X for two" caption
 *   - `is_hidden_gem`/`is_local_favorite` ➜ badges; "popular" is a display
 *                                 heuristic (rating ≥ 4.6); "budget" means
 *                                 price_level '₹'
 *   - `student_friendly`       ➜ "Student Friendly" badge in the detail view
 *   - `verification_status`    ➜ "verified" shows a ✓ Verified badge; places
 *                                 marked "closed" are filtered out of the
 *                                 discovery feed (see supabaseBackend)
 *   - `phone`                  ➜ tel: Call button on the detail screen; NULL
 *                                 means no button (a number is never guessed)
 *   - `opening_hours`          ➜ shown verbatim on the detail screen; NULL
 *                                 means "hours not captured yet" — the numeric
 *                                 opensAt/closesAt fallback below only powers
 *                                 the open/closed dot, never fake displayed
 *                                 hours on rows where the column is NULL
 *   - dishes with `is_signature=false` ➜ "Famous dishes",
 *     `is_signature=true` ➜ "Signature dishes"
 */

import { PLACE_CATEGORIES } from "../constants";
import type {
  Destination,
  DestinationFood,
  DestinationFoodDesignation,
  Dish,
  Place,
  PlaceWithDistance,
  PriceRange,
  VerificationStatus,
} from "../types";
import type { DestinationFoodRow, DestinationRow, DishRow, NearbyRestaurantRow, RestaurantRow } from "./types";

/** Prefix applied to demo-mode ids so demo and DB data can never collide. */
export const DEMO_ID_PREFIX = "demo:";

export const toDemoId = (id: string): string => `${DEMO_ID_PREFIX}${id}`;
export const fromDemoId = (id: string): string =>
  id.startsWith(DEMO_ID_PREFIX) ? id.slice(DEMO_ID_PREFIX.length) : id;

/** Real restaurant ids are Supabase uuids — anything else is demo data. */
export function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

/** ₹ brackets for the "cost for two" caption (display convention — see header). */
const COST_FOR_TWO_BY_PRICE_LEVEL: Record<PriceRange, number> = {
  "₹": 250,
  "₹₹": 700,
  "₹₹₹": 1400,
};

const DEFAULT_HOURS = { opensAt: 9, closesAt: 21 } as const;

/** Parse `'HH:MM-HH:MM'` (24h) into the numeric hours the UI expects. */
export function parseOpeningHours(raw: string | null): { opensAt: number; closesAt: number } {
  if (!raw) return { ...DEFAULT_HOURS };
  const match = raw
    .replace(/\s+/g, "")
    .match(/^(\d{1,2})(?::(\d{2}))?-(\d{1,2})(?::(\d{2}))?$/);
  if (!match) return { ...DEFAULT_HOURS };
  const opensAt = Math.min(24, Math.max(0, Number(match[1])));
  const closesAt = Math.min(24, Math.max(0, Number(match[3])));
  if (!Number.isFinite(opensAt) || !Number.isFinite(closesAt)) return { ...DEFAULT_HOURS };
  return { opensAt, closesAt: closesAt === 0 ? 24 : closesAt };
}

export function categoryLabel(categoryId: string): string {
  return PLACE_CATEGORIES.find((c) => c.id === categoryId)?.label ?? categoryId;
}

const VERIFICATION_STATUSES: VerificationStatus[] = [
  "verified",
  "community_submitted",
  "unverified",
  "closed",
];

/** Normalize a raw `verification_status` DB value to the app union. */
export function parseVerificationStatus(raw: string | null | undefined): VerificationStatus | undefined {
  return raw && (VERIFICATION_STATUSES as string[]).includes(raw) ? (raw as VerificationStatus) : undefined;
}

/**
 * Map a `dishes` row into the domain Dish — every field is NULL-safe and
 * absent in the UI when the column is NULL, so only REAL database values
 * are ever rendered (no invented descriptions, prices, tags or nutrition).
 */
function dishRowToDish(row: DishRow): Dish {
  return {
    name: row.name,
    description: row.description ?? undefined,
    price: row.price != null ? Number(row.price) : undefined,
    category: row.category ?? undefined,
    calories: row.calories ?? undefined,
    protein: row.protein != null ? Number(row.protein) : undefined,
    carbs: row.carbs != null ? Number(row.carbs) : undefined,
    fat: row.fat != null ? Number(row.fat) : undefined,
  };
}

/**
 * Map a `restaurants` row (plus its dishes/photos when already fetched)
 * into the domain `Place` used across the UI.
 */
export function restaurantRowToPlace(
  row: RestaurantRow,
  dishes: DishRow[] = [],
  photoUrls: string[] = []
): Place {
  const { opensAt, closesAt } = parseOpeningHours(row.opening_hours);
  const priceLevel: PriceRange | undefined = row.price_level ?? undefined;
  return {
    id: row.id,
    name: row.name,
    tagline: row.description ?? undefined,
    cuisines: [categoryLabel(row.category)],
    categoryIds: [row.category],
    rating: row.rating,
    // No aggregate rating count column yet — the UI hides the
    // "N ratings" / "Loved by Xk locals" captions when this is 0.
    ratingCount: 0,
    priceRange: priceLevel,
    costForTwo: priceLevel ? COST_FOR_TWO_BY_PRICE_LEVEL[priceLevel] : undefined,
    // NULL coordinates / price stay undefined — the UI hides what we don't know.
    latitude: row.latitude ?? undefined,
    longitude: row.longitude ?? undefined,
    area: row.locality || row.city,
    city: row.city,
    address: row.address,
    famousDishes: dishes.filter((d) => !d.is_signature).map(dishRowToDish),
    signatureDishes: dishes.filter((d) => d.is_signature).map(dishRowToDish),
    opensAt,
    closesAt,
    // NULL opening_hours / phone stay undefined — the UI says "not captured"
    // instead of showing invented hours or a Call button without a number.
    openingHours: row.opening_hours ?? undefined,
    phone: row.phone ?? undefined,
    photos: photoUrls,
    localTip: "",
    // Google Maps search query built ONLY from stored values (name + full
    // address). Used by the detail screen when a place has no verified
    // coordinates — never mixed with invented location data.
    mapsQuery: `${row.name}, ${row.address}`,
    badges: {
      hiddenGem: row.is_hidden_gem,
      localFavorite: row.is_local_favorite,
      popular: row.rating >= 4.6,
      budget: priceLevel === "₹",
      studentFriendly: row.student_friendly ?? false,
      verified: parseVerificationStatus(row.verification_status) === "verified",
    },
    verificationStatus: parseVerificationStatus(row.verification_status),
    studentFriendly: row.student_friendly ?? false,
    tags: row.tags ?? undefined,
  };
}

/** Map an RPC row (already distance-annotated by the database). */
export function nearbyRowToPlaceWithDistance(row: NearbyRestaurantRow): PlaceWithDistance {
  return { ...restaurantRowToPlace(row), distanceKm: row.distance_km };
}

/* ------------------------------------------------------------------ */
/* Destinations — destination_foods ➜ domain mapping                   */
/* ------------------------------------------------------------------ */

/** Exact strings allowed by the `destination_foods_designation_check`. */
const FOOD_DESIGNATIONS: readonly string[] = ["signature", "famous", "local"];

/**
 * Map a `destinations` row into the domain `Destination`. Every field is
 * NULL-safe: absent in the UI when the column is NULL, so only REAL
 * database values are ever rendered (an unverified image_url stays absent).
 */
export function destinationRowToDestination(row: DestinationRow): Destination {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    region: row.region ?? undefined,
    country: row.country ?? undefined,
    description: row.description ?? undefined,
    imageUrl: row.image_url ?? undefined,
    latitude: row.latitude ?? undefined,
    longitude: row.longitude ?? undefined,
  };
}

/**
 * Map a `destination_foods` row into the domain `DestinationFood`.
 * An unexpected designation value (the DB CHECK should prevent this) is
 * normalized to `undefined` — the UI then shows no badge instead of
 * inventing one.
 */
export function destinationFoodRowToFood(row: DestinationFoodRow): DestinationFood {
  const designation: DestinationFoodDesignation | undefined =
    row.designation != null && FOOD_DESIGNATIONS.includes(row.designation)
      ? (row.designation as DestinationFoodDesignation)
      : undefined;
  return {
    id: row.id,
    destinationId: row.destination_id,
    name: row.name,
    description: row.description ?? undefined,
    foodType: row.food_type ?? undefined,
    designation,
    imageUrl: row.image_url ?? undefined,
  };
}
