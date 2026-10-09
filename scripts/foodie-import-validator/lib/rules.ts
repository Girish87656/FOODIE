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

export const TOOL_VERSION = "1.0.0";

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
] as const;

/** Columns that belong to the live database's trigger-maintained aggregates. */
export const FORBIDDEN_FIELDS = ["community_rating", "review_count", "rating_count"] as const;

export interface RowValidation {
  issues: Issue[];
  normalized: NormalizedCandidate;
}

const HOURS_RE = /^(\d{1,2})(?::(\d{2}))?-(\d{1,2})(?::(\d{2}))?$/;

function s(v: string | null | undefined): string | null {
  const t = (v ?? "").trim();
  return t === "" ? null : t;
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

  // ---- source URL ----------------------------------------------------
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
      if (normalized.sourceUrl === null) {
        issues.push({
          field: "listing_rating",
          code: "LISTING_RATING_WITHOUT_SOURCE",
          severity: "warning",
          message:
            "An external listing rating is present without source_url — evidence without provenance. Add the listing URL or drop the rating.",
        });
      }
    }
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

/** True when the row carries no usable data beyond the name. */
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
    normalized.listingRating === null
  );
}
