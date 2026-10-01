/**
 * Foodie AI Assistant — shared types.
 *
 * Imported by BOTH the client (AssistantControls builds an AssistantContext
 * at send time) and the server (/api/assistant/chat validates it). This file
 * therefore holds TYPES and small pure constants only — no Zod, no SDK, no
 * Supabase imports, so nothing server-side can leak into the browser bundle.
 *
 * Architecture (Phase 1):
 *   user message + AssistantContext
 *     → /api/assistant/chat
 *     → LLM extracts a structured FoodieQuery (Zod-validated)
 *     → deterministic Foodie data loaders (serverRepository) run the search
 *     → LLM composes a grounded answer ONLY from the returned Place rows
 *     → client renders reply + real restaurant cards
 *
 * The AI never invents restaurants, prices, ratings, distances, hours,
 * phones or dishes — every fact comes from Foodie's existing data layer.
 */

import type { DataMode } from "../data/types";
import type {
  EatContext,
  PlaceCategory,
  PlaceMaybeWithDistance,
  PriceRange,
} from "../types";

/* ------------------------------------------------------------------ */
/* Assistant context (client → server, per message)                    */
/* ------------------------------------------------------------------ */

/**
 * The location origins the assistant may use. Deliberately EXCLUDES
 * "prototype": Foodie's prototype city is a browsing fallback, NOT a user
 * location — the assistant must never pretend it knows where the user is
 * unless a real fix, a manual pick or the labelled test origin is active.
 */
export type AssistantLocationSource = "browser" | "manual" | "test";

/** A location the assistant may honestly reason about. */
export interface AssistantOrigin {
  lat: number;
  lng: number;
  source: AssistantLocationSource;
  /** Human-readable area label when one exists (reverse geocode / city pick / test label). */
  areaLabel: string | null;
}

/**
 * Everything the assistant knows about the user for ONE request.
 * Built fresh at send time from the existing stores — no new global state,
 * no conversation persistence.
 */
export interface AssistantContext {
  /** Current Food Mode (persisted user metadata), if set. */
  foodMode: EatContext | null;
  /** Present ONLY when a browser fix / manual pick / test origin exists. */
  origin: AssistantOrigin | null;
  /** Category ids picked during onboarding (existing preference store). */
  preferences: string[];
  /**
   * Informational only — the server NEVER trusts this value; the data mode
   * in the response always comes from the server's own loaders.
   */
  discoveryMode?: DataMode;
}

/* ------------------------------------------------------------------ */
/* Structured intent (LLM output, Zod-validated server-side)           */
/* ------------------------------------------------------------------ */

/**
 * The structured search the AI extracts from natural language.
 * Every field is optional/broad on purpose: when the request can't be
 * mapped confidently, the executor falls back to a BROAD search instead of
 * inventing a category or a filter.
 */
export interface FoodieQuery {
  /**
   * Food-only search terms (cuisines, dishes, drinks, place/area names).
   * Empty array = no specific food term → broad search.
   */
  keywords: string[];
  /** One of Foodie's 7 pilot categories — only when clearly requested. */
  category?: PlaceCategory;
  /**
   * "At or below this price level" (₹ < ₹₹ < ₹₹₹), mapped onto the existing
   * price_level data. Absent when the user didn't indicate a budget.
   */
  budget?: PriceRange;
  /**
   * Explicit radius in km (e.g. "within 2 km"). "near me"/"nearby" is NOT
   * an explicit radius — the executor then applies its default.
   */
  radiusKm?: number;
  /** The eating context the message states explicitly (e.g. "with friends"). */
  modeHint?: EatContext;
  /**
   * True ONLY when the message explicitly asks to use the user's SAVED
   * preferences (the onboarding category ids, e.g. "match my preferences").
   * The executor then maps them onto the real `category` data — it never
   * invents a mapping. Food Mode NEVER drives selection: Foodie's data has
   * no companionship attributes, so the mode is conversational context only.
   */
  preferenceHint?: boolean;
}

/* ------------------------------------------------------------------ */
/* Response (server → client)                                          */
/* ------------------------------------------------------------------ */

/** One turn rendered inside the assistant sheet. */
export interface AssistantResponse {
  /** Grounded, human-readable answer (composed ONLY from `places`). */
  reply: string;
  /** REAL places returned by Foodie's data layer — rendered as cards. */
  places: PlaceMaybeWithDistance[];
  /** Which backend produced the places: the real database or the demo set. */
  mode: DataMode;
  /**
   * Honest explanations: demo fallback, Supabase failure, widened-radius
   * search or the labelled GITAM test origin. Rendered under the reply.
   */
  notice?: string;
}

/** Chat turn kept in the sheet's LOCAL state only (never persisted). */
export interface AssistantChatMessage {
  role: "user" | "assistant";
  text: string;
  places?: PlaceMaybeWithDistance[];
  mode?: DataMode;
  notice?: string;
  isError?: boolean;
}

/* ------------------------------------------------------------------ */
/* Shared limits                                                       */
/* ------------------------------------------------------------------ */

export const ASSISTANT_MESSAGE_MIN_LENGTH = 1;
export const ASSISTANT_MESSAGE_MAX_LENGTH = 500;
