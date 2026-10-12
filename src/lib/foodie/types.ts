/**
 * Foodie — core domain types
 * v1: Food Discovery foundation (mock data, no backend yet).
 * These types are designed to map 1:1 onto future Supabase tables.
 */

export type PriceRange = "₹" | "₹₹" | "₹₹₹";

/**
 * The 7 pilot PLACE categories — mirrors the `restaurants_category_allowed_check`
 * constraint in Supabase (schema.sql / migration-001-pilot-categories.sql).
 * Finer types (tea_stall, canteen, food_truck, ...) are tags, not categories.
 */
export type PlaceCategory =
  | "restaurant"
  | "hotel"
  | "tiffin"
  | "cafe"
  | "fast_food"
  | "street_food"
  | "bakery_sweets";

/** Trust state of a place — mirrors `restaurants.verification_status`. */
export type VerificationStatus =
  | "verified"
  | "community_submitted"
  | "unverified"
  | "closed";

/** Companionship context captured during onboarding */
export type EatContext =
  | "Alone"
  | "Family"
  | "Partner"
  | "Friends"
  | "Travelling";

/**
 * The exact strings a persisted Food Mode may take (auth metadata
 * `food_mode`). Single source of truth — onboarding and the Account sheet
 * both save/restore these same five values.
 */
const EAT_CONTEXT_VALUES: readonly string[] = [
  "Alone",
  "Family",
  "Partner",
  "Friends",
  "Travelling",
];

/**
 * Type guard for values restored from persistence (auth user metadata).
 * Anything else (missing, renamed, corrupted) is rejected so the app never
 * adopts an unknown mode.
 */
export function isEatContext(value: unknown): value is EatContext {
  return typeof value === "string" && EAT_CONTEXT_VALUES.includes(value);
}

/** Categories used in onboarding + home filters (generic so ids stay typed) */
export interface FoodCategory<T extends string = string> {
  id: T;
  label: string;
  emoji: string;
}

/** A badge a place can carry — drives the Home sections */
export interface PlaceBadges {
  hiddenGem?: boolean;
  localFavorite?: boolean;
  popular?: boolean;
  budget?: boolean;
  /** suits students (budget menus, campus-friendly timings) */
  studentFriendly?: boolean;
  /** verification_status === 'verified' */
  verified?: boolean;
}

export interface Dish {
  name: string;
  /** Menu line exactly as stored in the DB — absent when `description` is NULL. */
  description?: string;
  price?: number;
  /**
   * Page that published this item (and its price) — migration-007 provenance.
   * Absent when unknown; the menu UI shows a source line ONLY when present.
   */
  sourceUrl?: string;
  /** Demo dataset only — the real dishes table has no emoji column. */
  emoji?: string;
  /**
   * Dish-level tag/category as stored (`category` column, e.g. 'starters',
   * 'biryani') — absent when NULL. Never guessed.
   */
  category?: string;
  /** Nutrition columns — all optional, rendered only when present. */
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  // NOTE: the dishes table has NO vegetarian flag and NO image column —
  // nothing is displayed or invented for those until real columns exist.
}

/**
 * Canonical WGS-84 lat/lng pair.
 * Mirrors a PostGIS `point` column so it maps 1:1 onto Supabase later.
 */
export interface GeoPosition {
  lat: number;
  lng: number;
}

/**
 * Licensing/provenance metadata for one place photo (migration-006).
 * Every field is optional: NULL in the database means "not recorded" and the
 * UI must never invent it. A photo whose `license` is unknown has no
 * established usage basis and must not be displayed.
 */
export interface PhotoCredit {
  /** The photo URL this credit belongs to (matches `Place.photos` entries). */
  url: string;
  /** Page the photo was taken from. NULL = unknown. */
  sourceUrl?: string;
  /** Usage basis, verbatim (e.g. "CC BY-SA 4.0"). NULL = not established. */
  license?: string;
  /** Credit line to display. NULL = no attribution recorded. */
  attribution?: string;
}

/** A food place — the heart of discovery */
export interface Place {
  id: string;
  name: string;
  /** short punchy descriptor */
  tagline?: string;
  cuisines: string[];
  categoryIds: string[];
  rating: number;
  ratingCount: number;
  /** Absent when the price level hasn't been captured yet — never guessed. */
  priceRange?: PriceRange;
  /** average cost for two, in INR — absent when price_level is NULL in the DB. */
  costForTwo?: number;
  /**
   * WGS-84 coordinates — distance is always computed from these (Haversine),
   * never hardcoded. Optional: places awaiting coordinate verification carry
   * NULL in the database (coordinates are NEVER estimated from addresses) and
   * are excluded from distance-sorted discovery views until verified.
   */
  latitude?: number;
  longitude?: number;
  area: string;
  city: string;
  address: string;
  famousDishes: Dish[];
  signatureDishes: Dish[];
  /** 24h format hours */
  opensAt: number;
  closesAt: number;
  /**
   * The RAW opening-hours string exactly as stored in the database
   * ('HH:MM-HH:MM', e.g. '10:00-22:00'). Absent when `opening_hours` is NULL
   * — the UI then says hours aren't captured yet instead of inventing any.
   */
  openingHours?: string;
  /**
   * Contact phone as published in the database. Absent when `phone` is NULL
   * — no Call button is rendered for places without one (never guessed).
   */
  phone?: string;
  photos: string[];
  /**
   * Licensing metadata per photo (migration-006 `restaurant_photos.source_url`
   * / `license` / `attribution`), matched to `photos` entries by image URL.
   * Absent fields mean the information was never recorded — the UI renders
   * attribution ONLY for what is actually stored and never invents it.
   */
  photoCredits?: PhotoCredit[];
  localTip: string;
  /** Google Maps search query (name + stored address) — used by the
   *  "Open in Google Maps" CTA when a place has no verified coordinates. */
  mapsQuery: string;
  badges: PlaceBadges;
  /** Trust state from the database (absent in legacy/demo rows without it). */
  verificationStatus?: VerificationStatus;
  /** True when the place suits students (GITAM pilot area). */
  studentFriendly?: boolean;
  /** Finer type tags from the database (tea_stall, canteen, ...). */
  tags?: string[];

  /* ---------------------------------------------------------------- */
  /* Foodie community reviews + provenance (Phase 2 — migration-005)   */
  /* ---------------------------------------------------------------- */
  /**
   * Number of Foodie community reviews (trigger-maintained in the DB).
   * 0 is a REAL value ("no reviews yet") — never fabricated, and never
   * merged with the listed `rating`/`ratingCount`.
   */
  reviewCount?: number;
  /**
   * Average of Foodie community review ratings. Absent when there are no
   * reviews yet. FOREVER separate from the listed `rating` — the UI must
   * be able to show "4.1 · Listed rating" and "4.7 · Foodie community ·
   * 23 reviews" as two different things, never one merged number.
   */
  communityRating?: number;
  /** Listing source as stored (absent/NULL = unknown — never guessed). */
  source?: string;
  /** Source URL as stored (absent/NULL = unknown — never invented). */
  sourceUrl?: string;
  /** When the listing was last actually verified (absent = never). */
  lastVerifiedAt?: string;
  /**
   * Per-field verification flags — NULL/absent = unknown/pending,
   * false = explicitly checked and NOT verified, true = verified with
   * real evidence. Never defaulted to true.
   */
  addressVerified?: boolean | null;
  coordinatesVerified?: boolean | null;
  hoursVerified?: boolean | null;
  photosVerified?: boolean | null;
}

/** A Place annotated with its live distance (km) from the user's chosen origin. */
export type PlaceWithDistance = Place & { distanceKm: number };

/**
 * A Place that may or may not carry a verified distance yet.
 * Places whose coordinates are still NULL (pending verification) NEVER get a
 * `distanceKm` — the UI renders "Location pending verification" instead of
 * inventing a number (a fake or 0 km distance is never shown).
 */
export type PlaceMaybeWithDistance = Place & { distanceKm?: number };

export interface LocalRecommendation {
  placeId: string;
  author: string;
  context: EatContext;
  text: string;
}

/* ------------------------------------------------------------------ */
/* Destinations — the "Famous here" discovery layer                    */
/* ------------------------------------------------------------------ */

/**
 * Curation designation of a destination food — mirrors the
 * `destination_foods_designation_check` constraint in migration-003
 * ('signature' | 'famous' | 'local'). The mapper normalizes anything
 * else to `null` and the UI then shows no badge (never invented).
 */
export type DestinationFoodDesignation = "signature" | "famous" | "local";

/** A destination (city) Foodie can surface famous/local food for. */
export interface Destination {
  id: string;
  slug: string;
  name: string;
  /** Absent when the column is NULL in the database — never guessed. */
  region?: string;
  country?: string;
  description?: string;
  /**
   * Absent while the stored URL is NULL: unverified image URLs are never
   * rendered (same honesty rule as place photos).
   */
  imageUrl?: string;
  /**
   * Reference coordinates of the destination (from the seeded rows).
   * Optional: rows without coordinates can never be auto-detected.
   */
  latitude?: number;
  longitude?: number;
}

/** A famous/local food OF a destination (curated, evidence-based row). */
export interface DestinationFood {
  id: string;
  destinationId: string;
  name: string;
  description?: string;
  /** Free-text food type from the database (e.g. 'breakfast', 'street food'). */
  foodType?: string;
  /** Normalized designation — `null` means "no verified designation". */
  designation?: DestinationFoodDesignation;
  imageUrl?: string;
}
