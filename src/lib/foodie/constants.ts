import type { EatContext, FoodCategory, PlaceCategory, PlaceType } from "./types";

/**
 * The 7 pilot PLACE categories — the ONLY allowed `restaurants.category`
 * values (enforced again by a CHECK constraint in supabase/schema.sql and
 * migration-001-pilot-categories.sql).
 *
 * Pilot area: GITAM Deemed to be University Bengaluru (Nagadenahalli)
 *   → Doddaballapura Railway Station → Doddaballapura town.
 *
 * Finer types (tea_stall, food_truck, canteen, home_food, food_hotel,
 * dessert counter, ...) are NOT categories — they belong in `tags`.
 */
export const PLACE_CATEGORIES: FoodCategory<PlaceCategory>[] = [
  { id: "restaurant", label: "Restaurant" },
  { id: "hotel", label: "Hotel" }, // local "hotel" = meals place
  { id: "tiffin", label: "Tiffin" }, // idli/dosa/breakfast rooms
  { id: "cafe", label: "Cafe" },
  { id: "fast_food", label: "Fast Food" },
  { id: "street_food", label: "Street Food" },
  { id: "bakery_sweets", label: "Bakery & Sweets" },
];

/**
 * @deprecated legacy name kept for one release — use `PLACE_CATEGORIES`.
 * (All call sites are migrated; this alias only eases external references.)
 */
export const FOOD_CATEGORIES = PLACE_CATEGORIES;

export const EAT_CONTEXTS: {
  id: EatContext;
  label: string;
  hint: string;
}[] = [
  { id: "Alone", label: "Alone", hint: "Solo food dates" },
  { id: "Family", label: "Family", hint: "Everyone's happy" },
  { id: "Partner", label: "Partner", hint: "Date night picks" },
  { id: "Friends", label: "Friends", hint: "Squad cravings" },
  { id: "Travelling", label: "Travelling", hint: "Taste the city" },
];

/**
 * The 7 NON-FOOD place types — mirrors the `places_place_type_check`
 * constraint of the approved `public.places` design
 * (supabase/migration-008-places.sql — REVIEW CANDIDATE, not yet applied).
 *
 * Kept strictly separate from `PLACE_CATEGORIES`: these labels are for
 * attractions and lodging stays, never for food places (UI icons live in
 * `src/lib/foodie/icons.ts` → POI_TYPE_ICONS). Extending this list requires
 * a matching CHECK-constraint change in a reviewed migration.
 */
export const POI_PLACE_TYPES: FoodCategory<PlaceType>[] = [
  { id: "temple", label: "Temple" },
  { id: "waterfall", label: "Waterfall" },
  { id: "fort", label: "Fort" },
  { id: "zoo", label: "Zoo" },
  { id: "natural_arch", label: "Natural Arch" },
  { id: "other", label: "Place of interest" },
  { id: "hotel", label: "Stay" }, // lodging — never the meals-place "hotel"
];

/** App-level constants. Location constants live in `location.ts` (prototype origin, manual corridor picks). */

export const APP_NAME = "Foodie";
export const APP_TAGLINE = "Your Personal Food Companion";
