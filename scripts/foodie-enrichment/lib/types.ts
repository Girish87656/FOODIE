/**
 * Foodie — Prototype 2 enrichment pipeline: shared types.
 *
 * READ-ONLY research layer. Nothing here ever writes to Supabase: the only
 * network operations are GETs against public, license-aware sources and the
 * project's own PostgREST endpoint (SELECT only). Database changes happen
 * exclusively through generated SQL files that a human reviews and runs in
 * the Supabase SQL Editor (same write path as the place-import batches).
 */

/** A live restaurant row as read from PostgREST (subset used for matching). */
export interface LivePlace {
  id: string;
  name: string;
  category: string;
  address: string;
  city: string;
  locality: string | null;
  latitude: number | null;
  longitude: number | null;
  sourceUrl: string | null;
}

/** Which license-aware source produced a photo candidate. */
export type PhotoSourceKind = "wikimedia_commons" | "openverse" | "owner_published_lead";

/**
 * One photo candidate found by research. A candidate is ONLY machine-approved
 * when `license` is recorded verbatim from the source AND the match rule
 * (`matchKind`) is exact. Everything else stays needs_human_review and is
 * NEVER turned into SQL by the generator.
 */
export interface PhotoCandidate {
  restaurantId: string;
  restaurantName: string;
  sourceKind: PhotoSourceKind;
  /** Direct image URL (Wikimedia upload.wikimedia.org / Openverse provider url). */
  imageUrl: string;
  /** Page the photo was published on (file page / provider detail page). */
  sourceUrl: string;
  /** License, verbatim from the source (e.g. "CC BY-SA 4.0"). Empty = unknown. */
  license: string;
  /** Credit line (creator/artist) verbatim from the source. Empty = unknown. */
  attribution: string;
  /** Exact-name match vs. fuzzy/lead — only "exact" may auto-approve. */
  matchKind: "exact" | "fuzzy" | "lead";
  /** Free-text match explanation (what matched, what did not). */
  matchNotes: string;
  retrievedOn: string;
  /** Optional deep-pass metadata (research-photos-deep.ts) — evidence only. */
  mime?: string;
  width?: number;
  height?: number;
  /** License URL when the source records one (e.g. Commons LicenseUrl). */
  licenseUrl?: string | null;
  /** Source-side description of the image (what it depicts, where). */
  description?: string;
  /** Which research tier produced the row (e.g. "commons-deep"). */
  tierB?: string;
}

/** One menu/dish item with per-fact provenance. No evidence → no row. */
export interface DishCandidate {
  restaurantId: string;
  restaurantName: string;
  /** Dish name exactly as the source spells it (trimmed). */
  name: string;
  /** Published price in rupees (number) — absent when the source shows none. */
  price: number | null;
  /** Page that published this item. */
  sourceUrl: string;
  /** Verbatim short quote/fragment backing the item (audit trail). */
  evidence: string;
  /** True only when the source itself marks the item as signature/special. */
  isSignature: boolean;
  retrievedOn: string;
}

/** Per-place research outcome as persisted to disk (one JSON per place). */
export interface PlaceEvidence<T> {
  restaurantId: string;
  restaurantName: string;
  queries: string[];
  candidates: T[];
  errors: string[];
  retrievedOn: string;
}

export const RESEARCH_USER_AGENT =
  "FoodieEnrichmentResearch/1.0 (https://github.com/Girish87656/FOODIE; contact: repo issue tracker)";

/** Politeness delay between calls to the same host (ms). */
export const SAME_HOST_DELAY_MS = 1_200;

/* ------------------------------------------------------------------ */
/* Worksheet rows (the reviewable output of build-worksheets.ts)        */
/* ------------------------------------------------------------------ */

/** One photo row in the reviewable worksheet (verdict + dedupe recorded). */
export interface PhotoWorksheetRow extends PhotoCandidate {
  verdict: "approved_machine" | "needs_human_review";
  duplicateOf: string | null;
}

/** Menu worksheet rows are the evidence candidates verbatim (deduped upstream). */
export type MenuWorksheetRow = DishCandidate;
