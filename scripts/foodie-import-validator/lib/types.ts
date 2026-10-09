/**
 * Foodie — restaurant import validator: shared types.
 *
 * The validator is a LOCAL, dry-run-only tool. It never writes to Supabase:
 * its only network operation is a GET used to read the existing `restaurants`
 * baseline (see lib/baseline.ts + fetch-baseline.ts).
 */

/** Evidence provenance for a candidate row (requirement 6). */
export type EvidenceLevel = "directory_reported" | "independently_confirmed";

/** The five primary dry-run buckets (requirement 9). */
export type RowCategory =
  | "potential_new"
  | "existing_match"
  | "possible_duplicate"
  | "insufficient_evidence"
  | "invalid_data";

export type Confidence = "high" | "medium" | "low" | "none";

/** A validation problem attached to a row. */
export interface Issue {
  field: string;
  code: string;
  message: string;
  severity: "error" | "warning";
}

/** Raw candidate as provided by the input file (strings preserved verbatim). */
export interface CandidateInput {
  rowNumber: number;
  name: string;
  category: string | null;
  address: string | null;
  locality: string | null;
  city: string | null;
  phone: string | null;
  latitudeRaw: string | null;
  longitudeRaw: string | null;
  sourceUrl: string | null;
  evidenceLevel: string | null;
  listingRating: string | null;
  openingHours: string | null;
  priceLevel: string | null;
  coordinatesVerified: string | null;
  verificationStatus: string | null;
  notes: string | null;
  /** Columns/keys present in the input that the import must never supply. */
  forbiddenColumns: Array<{ field: string; value: string }>;
  /** Header names that did not map to any known column (typo protection). */
  unknownColumns: string[];
}

/** Clean values produced by the validation rules (never invented — NULL stays NULL). */
export interface NormalizedCandidate {
  name: string;
  category: string | null;
  address: string | null;
  locality: string | null;
  city: string | null;
  /** E.164-style +91XXXXXXXXXX when the raw phone was recognizably Indian. */
  phone: string | null;
  latitude: number | null;
  longitude: number | null;
  sourceUrl: string | null;
  evidenceLevel: EvidenceLevel;
  listingRating: number | null;
  openingHours: string | null;
  priceLevel: string | null;
}

/** A match against an existing Supabase `restaurants` row. */
export interface ExistingMatch {
  existingId: string;
  existingName: string;
  existingLocality: string | null;
  existingLatitude: number | null;
  existingLongitude: number | null;
  /** 0..1 combined name similarity. */
  similarity: number;
  /** Which signals fired, e.g. ["name-exact", "phone", "geo-0.15km"]. */
  basis: string[];
  /** Distance between candidate and existing coordinates (km), when both exist. */
  distanceKm: number | null;
  confidence: Confidence;
}

/** One fully-validated candidate row. */
export interface ValidatedRow {
  rowNumber: number;
  input: CandidateInput;
  normalized: NormalizedCandidate;
  issues: Issue[];
  category: RowCategory;
  confidence: Confidence;
  matches: ExistingMatch[];
  /** Row numbers (1-based) of same-file duplicates of this row. */
  intraFileDuplicates: number[];
  flags: string[];
  /** Cross-cutting bucket 6: carries coordinates that are not independently confirmed. */
  coordinatesAwaitingConfirmation: boolean;
  /** Policy: an import may never enter as 'verified' — this is the only allowed start. */
  recommendedVerificationStatus: "unverified" | "community_submitted";
}

/** Minimal shape of an existing `restaurants` row used for matching. */
export interface BaselineRestaurant {
  id: string;
  name: string;
  locality: string | null;
  city: string | null;
  phone: string | null;
  latitude: number | null;
  longitude: number | null;
}

export interface BaselineSnapshot {
  table: string;
  fetched_at: string;
  mode: string;
  count: number;
  rows: BaselineRestaurant[];
}

export interface ReportSummary {
  totalRows: number;
  potentialNew: number;
  existingMatches: number;
  possibleDuplicates: number;
  insufficientEvidence: number;
  invalidData: number;
  coordinatesAwaitingConfirmation: number;
  errors: number;
  warnings: number;
}

export interface DryRunReport {
  tool: "foodie-restaurant-import-validator";
  version: string;
  mode: "dry-run (read-only)";
  input: { file: string; sha256: string; rowCount: number };
  baseline: {
    source: "snapshot" | "live-get";
    file: string | null;
    sha256: string | null;
    fetchedAt: string | null;
    rowCount: number;
  };
  summary: ReportSummary;
  /** Policy text — why the six buckets are separated and what the tool refuses to do. */
  policy: string[];
  rows: ValidatedRow[];
}
