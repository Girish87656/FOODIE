/**
 * Foodie — import validator: per-row field validation rules.
 *
 * Philosophy (mirrors the Foodie data-honesty policy):
 *  - Missing values are KEPT as null. Nothing is defaulted, guessed or filled.
 *  - A directory-published pin is a CANDIDATE coordinate only.
 *  - `coordinates_verified=true` is accepted only with independently-confirmed
 *    evidence AND a source URL — a third-party directory listing never proves
 *    a coordinate.
 *  - Community review data (`community_rating`, `review_count`) is maintained
 *    by database triggers (migration-005) and can never be provided by an import.
 */

import type { CandidateInput, Issue, NormalizedCandidate } from "./types";
import {
  PILOT_CORRIDOR_BBOX,
  normalizeIndianPhone,
  parseLatitude,
  parseLongitude,
} from "./normalize";

export const TOOL_VERSION = "1.1.0";

/** The 7 pilot categories (supabase/schema.sql §1). */
export const PLACE_CATEGORIES = [
  "restaurant",
  "hotel",
  "tiffin",
  "cafe",
  "fast_food",
  "street_food",
  "bakery_sweets",
] as const;

export const VERIFICATION_STATUSES = [
  "verified",
  "community_submitted",
  "unverified",
  "closed",
] as const;

export const EVIDENCE_LEVELS = ["directory_reported", "independently_confirmed"] as const;

/** Human duplicate-review decisions accepted in the review_decision column. */
export const REVIEW_DECISIONS = [
  "distinct_new_business",
  "same_as_existing",
  "possible_duplicate_hold",
  "needs_more_research",
] as const;

/** CSV/JSON headers accepted by the tool (canonical snake_case). */
export const KNOWN_FIELDS = [
  "name",
  "category",
  "address",
  "locality",
  "city",
  "phone",
  "latitude",
  "longitude",
  "source_url",
  "evidence_level",
  "listing_rating",
  "opening_hours",
  "price_level",
  "coordinates_verified",
  "verification_status",
  "notes",
  // ---- Phase 3D research-workflow fields (all optional) ----------------
  "maps_listing_url",
  "cuisine",
  "menu_notes",
  "listing_review_count",
  "rating_source_url",
  "rating_checked_on",
  "address_source_url",
  "phone_source_url",
  "hours_source_url",
  "coordinates_source_url",
  "menu_source_url",
  "uncertainty_notes",
  "review_decision",
  "existing_match_id",
] as const;

/** Columns that belong to the live database's trigger-maintained aggregates. */
export const FORBIDDEN_FIELDS = ["community_rating", "review_count", "rating_count"] as const;

export interface RowValidation {
  issues: Issue[];
  normalized: NormalizedCandidate;
}

const HOURS_RE = /^(\d{1,2})(?::(\d{2}))?-(\d{1,2})(?::(\d{2}))?$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function s(v: string | null | undefined): string | null {
  const t = (v ?? "").trim();
  return t === "" ? null : t;
}

function isGoogleMapsHost(host: string): boolean {
  const h = host.toLowerCase();
  return /(^|\.)google\./.test(h) || h === "goo.gl" || h.endsWith(".goo.gl");
}

function validateHours(raw: string, issues: Issue[]): string | null {
  const m = raw.replace(/\s+/g, "").match(HOURS_RE);
  if (!m) {
    issues.push({
      field: "opening_hours",
      code: "INVALID_HOURS",
      severity: "error",
      message: `"${raw}" is not HH:MM-HH:MM (24h). Example: 08:00-22:30.`,
    });
    return null;
  }
  const h1 = Number(m[1]);
  const m1 = Number(m[2] ?? "0");
  const h2 = Number(m[3]);
  const m2 = Number(m[4] ?? "0");
  if (h1 > 24 || h2 > 24 || m1 > 59 || m2 > 59) {
    issues.push({
      field: "opening_hours",
      code: "INVALID_HOURS",
      severity: "error",
      message: `"${raw}" has an out-of-range hour or minute.`,
    });
    return null;
  }
  return `${String(h1).padStart(2, "0")}:${String(m1).padStart(2, "0")}-${String(h2).padStart(2, "0")}:${String(m2).padStart(2, "0")}`;
}

/**
 * Validate one candidate row. Returns every issue found plus the normalized
 * values (null where missing/invalid — the report distinguishes the two).
 */
export function validateRow(input: CandidateInput): RowValidation {
  const issues: Issue[] = [];
  const normalized: NormalizedCandidate = {
    name: input.name.trim(),
    category: null,
    address: s(input.address),
    locality: s(input.locality),
    city: s(input.city),
    phone: null,
    latitude: null,
    longitude: null,
    sourceUrl: null,
    evidenceLevel: "directory_reported",
    listingRating: null,
    openingHours: null,
    priceLevel: null,
    mapsListingUrl: null,
    cuisine: s(input.cuisine),
    menuNotes: s(input.menuNotes),
    listingReviewCount: null,
    ratingCheckedOn: null,
    uncertaintyNotes: s(input.uncertaintyNotes),
    reviewDecision: null,
    existingMatchId: null,
  };

  // ---- name ----------------------------------------------------------
  if (normalized.name === "") {
    issues.push({
      field: "name",
      code: "MISSING_NAME",
      severity: "error",
      message: "name is required and cannot be blank.",
    });
  } else if (normalized.name.length < 2 || normalized.name.length > 120) {
    issues.push({
      field: "name",
      code: "INVALID_NAME",
      severity: "error",
      message: `name must be 2-120 characters (got ${normalized.name.length}).`,
    });
  }

  // ---- category ------------------------------------------------------
  const category = s(input.category);
  if (category !== null) {
    if ((PLACE_CATEGORIES as readonly string[]).includes(category)) {
      normalized.category = category;
    } else {
      issues.push({
        field: "category",
        code: "INVALID_CATEGORY",
        severity: "error",
        message: `"${category}" is not one of: ${PLACE_CATEGORIES.join(", ")}.`,
      });
    }
  }

  // ---- phone ---------------------------------------------------------
  const phoneRaw = s(input.phone);
  if (phoneRaw !== null) {
    const p = normalizeIndianPhone(phoneRaw);
    if (p.ok && p.e164) {
      normalized.phone = p.e164;
    } else {
      issues.push({
        field: "phone",
        code: "INVALID_PHONE",
        severity: "error",
        message: `"${phoneRaw}" is not a valid Indian number (${p.reason ?? "unknown reason"}). Kept as null.`,
      });
    }
  }

  // ---- coordinates ---------------------------------------------------
  let latSwap = false;
  let lngSwap = false;
  if (input.latitudeRaw !== null) {
    const lat = parseLatitude(input.latitudeRaw);
    if (lat.ok && lat.value !== undefined) normalized.latitude = lat.value;
    else {
      if (lat.swapLikely) latSwap = true;
      issues.push({
        field: "latitude",
        code: "INVALID_COORDINATES",
        severity: "error",
        message: `latitude ${lat.reason}. Kept as null.`,
      });
    }
  }
  if (input.longitudeRaw !== null) {
    const lng = parseLongitude(input.longitudeRaw);
    if (lng.ok && lng.value !== undefined) normalized.longitude = lng.value;
    else {
      if (lng.swapLikely) lngSwap = true;
      issues.push({
        field: "longitude",
        code: "INVALID_COORDINATES",
        severity: "error",
        message: `longitude ${lng.reason}. Kept as null.`,
      });
    }
  }
  if (latSwap && lngSwap) {
    issues.push({
      field: "latitude/longitude",
      code: "COORDINATES_SWAPPED",
      severity: "error",
      message:
        "Both values fall inside the other's India range — this looks like a lat/lng swap. Fix the source file; the tool will not swap them automatically.",
    });
  }
  // Soft corridor sanity check (warning only — the tool is geography-agnostic).
  if (normalized.latitude !== null && normalized.longitude !== null) {
    const { minLat, maxLat, minLng, maxLng } = PILOT_CORRIDOR_BBOX;
    const inside =
      normalized.latitude >= minLat &&
      normalized.latitude <= maxLat &&
      normalized.longitude >= minLng &&
      normalized.longitude <= maxLng;
    if (!inside) {
      issues.push({
        field: "latitude/longitude",
        code: "OUTSIDE_PILOT_CORRIDOR",
        severity: "warning",
        message: `Coordinates are outside the GITAM–Doddaballapura pilot corridor (lat ${minLat}-${maxLat}, lng ${minLng}-${maxLng}). Valid for other regions, but expected to be rare in this pilot.`,
      });
    }
  }

  // ---- source URL + per-field source URLs -----------------------------
  const sourceUrl = s(input.sourceUrl);
  if (sourceUrl !== null) {
    try {
      const u = new URL(sourceUrl);
      if (u.protocol !== "http:" && u.protocol !== "https:") throw new Error("protocol");
      normalized.sourceUrl = u.toString();
    } catch {
      issues.push({
        field: "source_url",
        code: "INVALID_URL",
        severity: "error",
        message: `"${sourceUrl}" is not a valid http(s) URL. Kept as null.`,
      });
    }
  }

  for (const [field, raw] of [
    ["rating_source_url", input.ratingSourceUrl],
    ["address_source_url", input.addressSourceUrl],
    ["phone_source_url", input.phoneSourceUrl],
    ["hours_source_url", input.hoursSourceUrl],
    ["coordinates_source_url", input.coordinatesSourceUrl],
    ["menu_source_url", input.menuSourceUrl],
  ] as const) {
    const v = s(raw);
    if (v === null) continue;
    try {
      const u = new URL(v);
      if (u.protocol !== "http:" && u.protocol !== "https:") throw new Error("protocol");
    } catch {
      issues.push({
        field,
        code: "INVALID_URL",
        severity: "error",
        message: `"${v}" is not a valid http(s) URL. Kept as null.`,
      });
    }
  }

  // ---- Google Maps listing URL ------------------------------------------
  // A LISTING (place) URL documents the listing — it is never coordinate
  // evidence and never sets coordinates_verified. A search-results URL (or any
  // URL not anchored to a specific place) identifies NO business: it is
  // flagged AND does not count as an identity anchor or a rating source.
  const mapsUrlRaw = s(input.mapsListingUrl);
  if (mapsUrlRaw !== null) {
    try {
      const u = new URL(mapsUrlRaw);
      if (u.protocol !== "http:" && u.protocol !== "https:") throw new Error("protocol");
      if (!isGoogleMapsHost(u.hostname)) {
        issues.push({
          field: "maps_listing_url",
          code: "INVALID_MAPS_LISTING_URL",
          severity: "error",
          message: `"${mapsUrlRaw}" is not a Google Maps URL. Put other directories' listing URLs in source_url instead. Kept as null.`,
        });
      } else {
        const isShortLink = /(^|\.)goo\.gl$/.test(u.hostname.toLowerCase());
        const isSearch = u.pathname.includes("/maps/search/");
        const placeAnchored =
          u.pathname.includes("/maps/place/") ||
          u.searchParams.has("place_id") ||
          u.searchParams.has("cid");
        if (isSearch) {
          issues.push({
            field: "maps_listing_url",
            code: "MAPS_URL_IS_SEARCH_NOT_LISTING",
            severity: "warning",
            message:
              "This is a Google Maps SEARCH-results URL, not a business listing. A search URL does not identify a business and never proves its location. Open the exact place page and use that URL.",
          });
        } else if (!isShortLink && !placeAnchored) {
          issues.push({
            field: "maps_listing_url",
            code: "MAPS_URL_NOT_PLACE_ANCHORED",
            severity: "warning",
            message:
              "This Google Maps URL does not anchor to a specific place (no /maps/place/ path, place_id or cid). Short links should be expanded; use the place page URL.",
          });
        }
        normalized.mapsListingUrl = isSearch || (!isShortLink && !placeAnchored) ? null : u.toString();
      }
    } catch {
      issues.push({
        field: "maps_listing_url",
        code: "INVALID_URL",
        severity: "error",
        message: `"${mapsUrlRaw}" is not a valid http(s) URL. Kept as null.`,
      });
    }
  }

  // ---- evidence level ------------------------------------------------
  const evidenceRaw = s(input.evidenceLevel);
  if (evidenceRaw !== null) {
    if ((EVIDENCE_LEVELS as readonly string[]).includes(evidenceRaw)) {
      normalized.evidenceLevel = evidenceRaw as NormalizedCandidate["evidenceLevel"];
    } else {
      issues.push({
        field: "evidence_level",
        code: "INVALID_EVIDENCE_LEVEL",
        severity: "error",
        message: `"${evidenceRaw}" is not one of: ${EVIDENCE_LEVELS.join(", ")}.`,
      });
    }
  }

  // ---- listing rating (external directory rating — NEVER community) ----
  const ratingRaw = s(input.listingRating);
  const hasAnyRatingSource =
    normalized.sourceUrl !== null || s(input.ratingSourceUrl) !== null || normalized.mapsListingUrl !== null;
  if (ratingRaw !== null) {
    const v = Number(ratingRaw);
    if (!Number.isFinite(v) || v < 0 || v > 5) {
      issues.push({
        field: "listing_rating",
        code: "INVALID_LISTING_RATING",
        severity: "error",
        message: `"${ratingRaw}" is not a number in [0, 5].`,
      });
    } else {
      normalized.listingRating = v;
      if (!hasAnyRatingSource) {
        issues.push({
          field: "listing_rating",
          code: "LISTING_RATING_WITHOUT_SOURCE",
          severity: "warning",
          message:
            "An external listing rating is present without any source (source_url / rating_source_url / maps_listing_url) — evidence without provenance. Add a source or drop the rating.",
        });
      }
    }
  }

  // ---- external listing review count (directory count — NEVER community) --
  const reviewCountRaw = s(input.listingReviewCount);
  if (reviewCountRaw !== null) {
    const v = Number(reviewCountRaw);
    if (!Number.isInteger(v) || v < 0) {
      issues.push({
        field: "listing_review_count",
        code: "INVALID_LISTING_REVIEW_COUNT",
        severity: "error",
        message: `"${reviewCountRaw}" is not a non-negative whole number.`,
      });
    } else {
      normalized.listingReviewCount = v;
      if (!hasAnyRatingSource) {
        issues.push({
          field: "listing_review_count",
          code: "LISTING_REVIEW_COUNT_WITHOUT_SOURCE",
          severity: "warning",
          message:
            "An external listing review count is present without any source (source_url / rating_source_url / maps_listing_url) — evidence without provenance.",
        });
      }
    }
  }

  // ---- rating check date ------------------------------------------------
  const checkedOnRaw = s(input.ratingCheckedOn);
  if (checkedOnRaw !== null) {
    if (!DATE_RE.test(checkedOnRaw)) {
      issues.push({
        field: "rating_checked_on",
        code: "INVALID_DATE",
        severity: "error",
        message: `"${checkedOnRaw}" is not a YYYY-MM-DD date.`,
      });
    } else {
      const [, month, day] = checkedOnRaw.split("-").map(Number);
      if (month < 1 || month > 12 || day < 1 || day > 31) {
        issues.push({
          field: "rating_checked_on",
          code: "INVALID_DATE",
          severity: "error",
          message: `"${checkedOnRaw}" has an out-of-range month or day.`,
        });
      } else {
        normalized.ratingCheckedOn = checkedOnRaw;
      }
    }
  }
  if (
    (normalized.listingRating !== null || normalized.listingReviewCount !== null) &&
    normalized.ratingCheckedOn === null
  ) {
    issues.push({
      field: "rating_checked_on",
      code: "RATING_WITHOUT_CHECK_DATE",
      severity: "warning",
      message:
        "An external rating/review count was captured without rating_checked_on — record the date you read it so staleness can be judged later.",
    });
  }

  // ---- opening hours --------------------------------------------------
  const hoursRaw = s(input.openingHours);
  if (hoursRaw !== null) {
    normalized.openingHours = validateHours(hoursRaw, issues);
  }

  // ---- price level -----------------------------------------------------
  const priceRaw = s(input.priceLevel);
  if (priceRaw !== null) {
    if (["₹", "₹₹", "₹₹₹"].includes(priceRaw)) normalized.priceLevel = priceRaw;
    else {
      issues.push({
        field: "price_level",
        code: "INVALID_PRICE_LEVEL",
        severity: "error",
        message: `"${priceRaw}" is not one of: ₹, ₹₹, ₹₹₹.`,
      });
    }
  }

  // ---- duplicate-review decision (human input, recorded never obeyed) ----
  const decisionRaw = s(input.reviewDecision);
  if (decisionRaw !== null) {
    if ((REVIEW_DECISIONS as readonly string[]).includes(decisionRaw)) {
      normalized.reviewDecision = decisionRaw as NormalizedCandidate["reviewDecision"];
    } else {
      issues.push({
        field: "review_decision",
        code: "INVALID_REVIEW_DECISION",
        severity: "error",
        message: `"${decisionRaw}" is not one of: ${REVIEW_DECISIONS.join(", ")} (leave empty when undecided).`,
      });
    }
  }

  const matchIdRaw = s(input.existingMatchId);
  if (matchIdRaw !== null) {
    if (!UUID_RE.test(matchIdRaw)) {
      issues.push({
        field: "existing_match_id",
        code: "INVALID_EXISTING_MATCH_ID",
        severity: "error",
        message: `"${matchIdRaw}" is not a UUID. Copy the full existing-record id from the dry-run report.`,
      });
    } else {
      normalized.existingMatchId = matchIdRaw.toLowerCase();
    }
  }
  if (normalized.reviewDecision === "same_as_existing" && normalized.existingMatchId === null) {
    issues.push({
      field: "existing_match_id",
      code: "SAME_AS_EXISTING_WITHOUT_MATCH_ID",
      severity: "warning",
      message:
        'review_decision is "same_as_existing" but no existing_match_id is given — record WHICH existing record this candidate duplicates (copy its id from the dry-run report).',
    });
  }

  // ---- verification claims ---------------------------------------------
  const coordsVerifiedRaw = s(input.coordinatesVerified);
  if (coordsVerifiedRaw !== null) {
    const v = coordsVerifiedRaw.toLowerCase();
    if (v !== "true" && v !== "false") {
      issues.push({
        field: "coordinates_verified",
        code: "INVALID_BOOLEAN",
        severity: "error",
        message: `"${coordsVerifiedRaw}" is not true/false.`,
      });
    } else if (v === "true") {
      const supported =
        normalized.evidenceLevel === "independently_confirmed" && normalized.sourceUrl !== null;
      issues.push({
        field: "coordinates_verified",
        code: "UNSUPPORTED_VERIFICATION_CLAIM",
        severity: "error",
        message: supported
          ? "coordinates_verified=true is recorded, but the tool never writes to the database — a human must review the evidence before any DB flag changes."
          : "coordinates_verified=true requires evidence_level=independently_confirmed AND a source_url. A directory listing (or no provenance at all) never verifies a pin.",
      });
    }
  }

  const verificationStatusRaw = s(input.verificationStatus);
  if (verificationStatusRaw !== null) {
    if (!(VERIFICATION_STATUSES as readonly string[]).includes(verificationStatusRaw)) {
      issues.push({
        field: "verification_status",
        code: "INVALID_VERIFICATION_STATUS",
        severity: "error",
        message: `"${verificationStatusRaw}" is not one of: ${VERIFICATION_STATUSES.join(", ")}.`,
      });
    } else if (verificationStatusRaw === "verified") {
      issues.push({
        field: "verification_status",
        code: "UNSUPPORTED_VERIFICATION_CLAIM",
        severity: "error",
        message:
          "Import candidates cannot enter as 'verified'. Verification is granted by a human after on-site/phone confirmation, never by an import file.",
      });
    } else if (verificationStatusRaw !== "unverified") {
      issues.push({
        field: "verification_status",
        code: "VERIFICATION_STATUS_PRESET",
        severity: "warning",
        message: `"${verificationStatusRaw}" accepted — but the tool recommends leaving this column empty so the import starts as 'unverified'.`,
      });
    }
  }

  // ---- forbidden system fields -------------------------------------------
  for (const { field, value } of input.forbiddenColumns) {
    issues.push({
      field,
      code: "FORBIDDEN_SYSTEM_FIELD",
      severity: "error",
      message: `"${field}" (value "${value}") is maintained by database triggers (migration-005) and can never be provided by an import. Remove the column/value.`,
    });
  }

  return { issues, normalized };
}

/**
 * True when the row carries no usable IDENTITY data beyond the name.
 * Descriptive research fields (cuisine, menu notes, uncertainty notes,
 * per-field source URLs, review decisions) do NOT identify a business and do
 * not lift a row out of insufficient_evidence — only an address/locality/
 * phone/coordinates/hours/price/rating or a specific Maps listing does.
 */
export function isNameOnly(normalized: NormalizedCandidate): boolean {
  return (
    normalized.category === null &&
    normalized.address === null &&
    normalized.locality === null &&
    normalized.city === null &&
    normalized.phone === null &&
    normalized.latitude === null &&
    normalized.longitude === null &&
    normalized.openingHours === null &&
    normalized.priceLevel === null &&
    normalized.listingRating === null &&
    normalized.mapsListingUrl === null &&
    normalized.listingReviewCount === null
  );
}
