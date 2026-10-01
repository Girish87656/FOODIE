/**
 * Foodie AI Assistant — deterministic query executor (SERVER ONLY).
 *
 * Step 2 of the pipeline. Takes the Zod-validated `FoodieQuery` and runs
 * Foodie's EXISTING server-side loaders (serverRepository → Supabase or the
 * labelled demo set). No new restaurant queries, no new data, no LLM here —
 * the same honest rules as the rest of the app apply:
 *   - distances come only from real stored coordinates (Haversine),
 *   - NULL-coordinate rows never get a distance,
 *   - demo fallbacks are labelled,
 *   - empty results stay empty (never filled with invented places).
 */

import { PLACE_CATEGORIES } from "@/lib/foodie/constants";
import {
  loadAllRestaurants,
  loadNearbyRestaurants,
  loadRestaurantsByCategory,
  loadRestaurantsBySearch,
} from "@/lib/foodie/data/serverRepository";
import type { DataMode } from "@/lib/foodie/data/types";
import type {
  EatContext,
  Place,
  PlaceMaybeWithDistance,
  PriceRange,
} from "@/lib/foodie/types";
import { matchesQuery } from "@/lib/foodie/utils";
import type { AssistantContext, FoodieQuery } from "./types";

/** "Near me" default when the user didn't name a radius (covers the pilot corridor). */
const DEFAULT_NEARBY_RADIUS_KM = 15;
/** Widened sweep used ONLY to find the closest honest matches beyond the radius. */
const WIDE_RADIUS_KM = 60;
/** Max places returned to the client (and to the composer LLM). */
export const MAX_ASSISTANT_RESULTS = 6;

/** Price-level ordering — "budget: ₹" accepts ₹ and nothing dearer, etc. */
const PRICE_ORDER: Record<PriceRange, number> = { "₹": 0, "₹₹": 1, "₹₹₹": 2 };

/** Real category ids — the ONLY values a saved preference may map to. */
const KNOWN_CATEGORY_IDS: ReadonlySet<string> = new Set(PLACE_CATEGORIES.map((c) => c.id));

const CATEGORY_LABELS: ReadonlyMap<string, string> = new Map(
  PLACE_CATEGORIES.map((c) => [c.id, c.label])
);

export interface AssistantSearchOutcome {
  places: PlaceMaybeWithDistance[];
  mode: DataMode;
  /** Honest explanation (demo fallback / widened search / Supabase failure). */
  notice?: string;
  /** True when distances were computed against the caller-provided origin. */
  searchedNearby: boolean;
  /** The radius actually applied (only when searchedNearby). */
  radiusKm?: number;
  /** True when matches were found only beyond the requested/default radius. */
  widened: boolean;
  /** True when the FINAL results came from a pool narrowed by the user's saved onboarding categories. */
  usedPreferences: boolean;
  /** The valid saved category ids the overlay applied/attempted (empty when none). */
  preferenceIds: string[];
  /** An eating context stated in the MESSAGE itself (never the stored Food Mode). */
  modeHintFromMessage: EatContext | null;
}

/* ------------------------------------------------------------------ */
/* Deterministic filtering                                             */
/* ------------------------------------------------------------------ */

/** Price known AND at-or-below the requested budget. Unknown price can't honestly satisfy a budget. */
function matchesBudget(place: Place, budget: PriceRange): boolean {
  if (!place.priceRange) return false;
  return PRICE_ORDER[place.priceRange] <= PRICE_ORDER[budget];
}

/**
 * Saved onboarding preferences are Foodie category ids — keep only REAL ones
 * (deduplicated). Anything else from the client is ignored, never mapped by
 * guesswork. If the user saved no valid preference, the overlay is a no-op.
 */
function validPreferenceIds(preferences: readonly string[]): string[] {
  const valid = new Set<string>();
  for (const pref of preferences) {
    if (KNOWN_CATEGORY_IDS.has(pref)) valid.add(pref);
  }
  return [...valid];
}

/**
 * Apply the FoodieQuery — plus the optional SAVED-preference overlay — to a
 * pool of REAL places. Every step is a plain, inspectable predicate over
 * data the loaders returned — no ranking magic.
 */
function filterPool<T extends Place>(
  pool: readonly T[],
  query: FoodieQuery,
  preferenceIds: readonly string[] = []
): T[] {
  let list = [...pool];

  if (query.category) {
    list = list.filter((p) => p.categoryIds.includes(query.category as string));
  }
  if (query.budget) {
    list = list.filter((p) => matchesBudget(p, query.budget as PriceRange));
  }
  if (query.keywords.length > 0) {
    // A place qualifies if it matches at least ONE extracted food term.
    // (matchesQuery itself ANDs the tokens inside a single term.)
    list = list.filter((p) => query.keywords.some((kw) => matchesQuery(p, kw)));
  }
  if (preferenceIds.length > 0) {
    // Stage 3 — the user's SAVED onboarding categories, mapped onto the real
    // `category` data. A place qualifies if it belongs to ANY preferred
    // category. Only real category ids survive validPreferenceIds(); Food
    // Mode is deliberately NOT a filter (no such attributes in the data).
    list = list.filter((p) => p.categoryIds.some((c) => preferenceIds.includes(c)));
  }
  return list;
}

/** Worst-case labelling: if ANY contributing response was demo, say demo. */
function mergeModes(modes: DataMode[]): { mode: DataMode; notice?: string } {
  if (modes.includes("demo")) return { mode: "demo" };
  return { mode: "supabase" };
}

/* ------------------------------------------------------------------ */
/* Executor                                                            */
/* ------------------------------------------------------------------ */

export interface ExecuteFoodieQueryOptions {
  /**
   * False when the intent step failed and the route already fell back to a
   * broad search — saved preferences must NOT narrow a request we couldn't
   * read (an unreadable message is never silently reinterpreted).
   */
  allowPreferenceOverlay?: boolean;
}

export async function executeFoodieQuery(
  query: FoodieQuery,
  context: AssistantContext,
  options?: ExecuteFoodieQueryOptions
): Promise<AssistantSearchOutcome> {
  // ---- Stage 3 — map SAVED preferences onto real category data ----
  // Applied ONLY when the message itself carries no explicit food signal
  // (generic ask) or explicitly requests the saved preferences: an explicit
  // cuisine, category or budget request always wins over onboarding picks.
  // Food Mode is deliberately NOT a selection filter — Foodie's data has no
  // companionship attributes, so mode-driven filtering would be a guess.
  const allowOverlay = options?.allowPreferenceOverlay ?? true;
  const genericMessage =
    query.keywords.length === 0 && !query.category && !query.budget;
  const wantsPreferences = query.preferenceHint === true || genericMessage;
  const prefIds =
    allowOverlay && wantsPreferences ? validPreferenceIds(context.preferences) : [];
  const overlayUsed = prefIds.length > 0;

  // ---- Path A — the user has a usable origin: search near it first. ----
  if (context.origin) {
    const radiusKm = query.radiusKm ?? DEFAULT_NEARBY_RADIUS_KM;
    const nearby = await loadNearbyRestaurants(
      context.origin.lat,
      context.origin.lng,
      radiusKm
    );
    const inRadius = filterPool(nearby.places, query, prefIds);
    if (inRadius.length > 0) {
      inRadius.sort((a, b) => a.distanceKm - b.distanceKm);
      return {
        places: inRadius.slice(0, MAX_ASSISTANT_RESULTS),
        mode: nearby.mode,
        notice: nearby.notice,
        searchedNearby: true,
        radiusKm,
        widened: false,
        usedPreferences: overlayUsed,
        preferenceIds: prefIds,
        modeHintFromMessage: query.modeHint ?? null,
      };
    }

    // Nothing matched inside the radius — widen ONCE so the answer can
    // honestly name the CLOSEST matches (with their real distances)
    // instead of pretending nothing exists in Foodie's data at all.
    const wide = await loadNearbyRestaurants(
      context.origin.lat,
      context.origin.lng,
      WIDE_RADIUS_KM
    );
    const beyond = filterPool(wide.places, query, prefIds);
    if (beyond.length > 0) {
      beyond.sort((a, b) => a.distanceKm - b.distanceKm);
      return {
        places: beyond.slice(0, MAX_ASSISTANT_RESULTS),
        mode: wide.mode,
        notice: `Nothing matched within ${radiusKm} km — these are the closest matches in Foodie's data, with real distances.`,
        searchedNearby: true,
        radiusKm,
        widened: true,
        usedPreferences: overlayUsed,
        preferenceIds: prefIds,
        modeHintFromMessage: query.modeHint ?? null,
      };
    }

    // The coordinate-bearing pool had nothing — fall through so rows whose
    // coordinates are still NULL (pending verification) get their chance
    // via the broad path below. No distances are ever invented for them.
  }

  // ---- Path B — broad, origin-free search over existing loaders. ----

  if (query.category) {
    const byCategory = await loadRestaurantsByCategory(query.category);
    const filtered = filterPool(byCategory.places, query, prefIds);
    if (filtered.length > 0) {
      filtered.sort((a, b) => b.rating - a.rating);
      const merged = mergeModes([byCategory.mode]);
      return {
        places: filtered.slice(0, MAX_ASSISTANT_RESULTS),
        mode: merged.mode,
        notice: byCategory.notice,
        searchedNearby: false,
        widened: false,
        usedPreferences: overlayUsed,
        preferenceIds: prefIds,
        modeHintFromMessage: query.modeHint ?? null,
      };
    }
  }

  if (query.keywords.length > 0) {
    // One existing search API call per food term, merged + de-duplicated.
    const responses = await Promise.all(query.keywords.map((kw) => loadRestaurantsBySearch(kw)));
    const byId = new Map<string, Place>();
    for (const res of responses) {
      for (const p of res.places) byId.set(p.id, p);
    }
    const keywordPool = [...byId.values()];
    if (keywordPool.length > 0) {
      const filtered = filterPool(keywordPool, query, prefIds);
      if (filtered.length > 0) {
        filtered.sort((a, b) => b.rating - a.rating);
        const merged = mergeModes(responses.map((r) => r.mode));
        const notice = responses.find((r) => r.notice)?.notice;
        return {
          places: filtered.slice(0, MAX_ASSISTANT_RESULTS),
          mode: merged.mode,
          notice,
          searchedNearby: false,
          widened: false,
          usedPreferences: overlayUsed,
          preferenceIds: prefIds,
          modeHintFromMessage: query.modeHint ?? null,
        };
      }
    }
  }

  // No category/keywords matched (or none given) — the honest broad pool,
  // first WITH the saved-preference overlay, then (only if the saved
  // categories matched nothing at all) without it.
  const all = await loadAllRestaurants();
  const withPrefs = filterPool(all.places, query, prefIds);
  if (withPrefs.length > 0) {
    withPrefs.sort((a, b) => b.rating - a.rating);
    return {
      places: withPrefs.slice(0, MAX_ASSISTANT_RESULTS),
      mode: all.mode,
      notice: all.notice,
      searchedNearby: false,
      widened: false,
      usedPreferences: overlayUsed,
      preferenceIds: prefIds,
      modeHintFromMessage: query.modeHint ?? null,
    };
  }

  const broad = filterPool(all.places, query);
  broad.sort((a, b) => b.rating - a.rating);
  return {
    places: broad.slice(0, MAX_ASSISTANT_RESULTS),
    mode: all.mode,
    notice:
      overlayUsed && broad.length > 0
        ? [all.notice, "Your saved categories didn't leave matches in Foodie's data right now — this is Foodie's broader list instead."]
            .filter(Boolean)
            .join(" ")
        : all.notice,
    searchedNearby: false,
    widened: false,
    usedPreferences: false,
    preferenceIds: prefIds,
    modeHintFromMessage: query.modeHint ?? null,
  };
}

/* ------------------------------------------------------------------ */
/* LLM grounding payload (real fields only — absence speaks)           */
/* ------------------------------------------------------------------ */

/**
 * Serialize REAL Place rows for the answer-composition step. Only fields
 * Foodie's data layer actually returned are included — a missing field in
 * the payload is a missing fact the LLM cannot mention.
 */
export function serializePlacesForLLM(places: readonly PlaceMaybeWithDistance[]): unknown[] {
  return places.map((p) => {
    const row: Record<string, unknown> = {
      name: p.name,
      category: p.categoryIds.join(", "),
      cuisines: p.cuisines,
      area: p.area,
      city: p.city,
      address: p.address,
      rating: p.rating,
    };
    if (p.distanceKm != null) row.distanceKm = Math.round(p.distanceKm * 10) / 10;
    if (p.priceRange) row.priceRange = p.priceRange;
    if (p.costForTwo != null) row.costForTwo = p.costForTwo;
    if (p.verificationStatus) row.verificationStatus = p.verificationStatus;
    if (p.studentFriendly) row.studentFriendly = true;
    if (p.openingHours) row.openingHours = p.openingHours;
    if (p.phone) row.phone = p.phone;
    // Real free-form tags from the database (veg, family_restaurant, biryani,
    // canteen, ...). Exposed so the composer may cite ONLY data-backed
    // attributes — a missing tag stays a fact the LLM cannot mention.
    if (p.tags && p.tags.length > 0) row.tags = p.tags;

    const dishes = [...p.signatureDishes, ...p.famousDishes]
      .slice(0, 4)
      .map((d) => (d.price != null ? `${d.name} (₹${d.price})` : d.name));
    if (dishes.length > 0) row.knownDishes = dishes;

    const badges: string[] = [];
    if (p.badges.hiddenGem) badges.push("hidden gem");
    if (p.badges.localFavorite) badges.push("local favorite");
    if (p.badges.popular) badges.push("popular");
    if (p.badges.budget) badges.push("budget");
    if (badges.length > 0) row.badges = badges;

    return row;
  });
}

/**
 * Compact per-search facts the composer may reference honestly — including
 * WHAT actually shaped the selection (Stage 3): the saved-preference overlay
 * and an eating context stated in the message itself.
 */
export function serializeSearchMeta(outcome: AssistantSearchOutcome): unknown {
  return {
    searchedNearby: outcome.searchedNearby,
    radiusKm: outcome.radiusKm ?? null,
    widened: outcome.widened,
    dataMode: outcome.mode,
    resultCount: outcome.places.length,
    modeHintFromMessage: outcome.modeHintFromMessage,
    // True ONLY when the final results came from the saved-preference pool.
    usedPreferences: outcome.usedPreferences,
    // The applied categories, by label — populated only when usedPreferences.
    preferenceCategories: outcome.usedPreferences
      ? outcome.preferenceIds.map((id) => ({
          id,
          label: CATEGORY_LABELS.get(id) ?? id,
        }))
      : [],
  };
}
