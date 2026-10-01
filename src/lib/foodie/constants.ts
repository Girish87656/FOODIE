import type { EatContext, FoodCategory, PlaceCategory } from "./types";

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
  { id: "restaurant", label: "Restaurant", emoji: "🍽️" },
  { id: "hotel", label: "Hotel", emoji: "🍛" }, // local "hotel" = meals place
  { id: "tiffin", label: "Tiffin", emoji: "🥞" }, // idli/dosa/breakfast rooms
  { id: "cafe", label: "Cafe", emoji: "☕" },
  { id: "fast_food", label: "Fast Food", emoji: "🍔" },
  { id: "street_food", label: "Street Food", emoji: "🌮" },
  { id: "bakery_sweets", label: "Bakery & Sweets", emoji: "🧁" },
];

/**
 * @deprecated legacy name kept for one release — use `PLACE_CATEGORIES`.
 * (All call sites are migrated; this alias only eases external references.)
 */
export const FOOD_CATEGORIES = PLACE_CATEGORIES;

export const EAT_CONTEXTS: {
  id: EatContext;
  label: string;
  emoji: string;
  hint: string;
}[] = [
  { id: "Alone", label: "Alone", emoji: "🧍", hint: "Solo food dates" },
  { id: "Family", label: "Family", emoji: "👨‍👩‍👧", hint: "Everyone's happy" },
  { id: "Partner", label: "Partner", emoji: "❤️", hint: "Date night picks" },
  { id: "Friends", label: "Friends", emoji: "🧑‍🤝‍🧑", hint: "Squad cravings" },
  { id: "Travelling", label: "Travelling", emoji: "✈️", hint: "Taste the city" },
];

/** App-level constants. Location constants live in `location.ts` (prototype origin, manual corridor picks). */

export const APP_NAME = "Foodie";
export const APP_TAGLINE = "Your Personal Food Companion";
