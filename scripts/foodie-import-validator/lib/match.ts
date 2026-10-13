/**
 * Foodie — import validator: duplicate / existing-record matching.
 *
 * Design rules:
 *  - Matching informs the DRY-RUN REPORT only. The tool never merges, updates
 *    or creates anything; ambiguous cases stay ambiguous for human review.
 *  - Name evidence: normalized similarity (Levenshtein on core tokens,
 *    token Jaccard) plus token containment (catches "Amigos" ⊂ "Amigos Cafe").
 *  - Corroboration: identical normalized phone, coordinates ≤ 150 m apart, or
 *    identical locality strings upgrade a near-match to a confident match.
 *  - A matching phone with a dissimilar name is itself suspicious
 *    (SAME_PHONE_DIFFERENT_NAME) — flagged, never auto-resolved.
 */

import type {
  BaselineRestaurant,
  Confidence,
  ExistingMatch,
  NormalizedCandidate,
} from "./types";
import {
  containment,
  coreName,
  haversineKm,
  jaccard,
  levenshteinRatio,
  nameTokens,
  normalizeName,
  properTokens,
} from "./normalize";

export interface MatchOutcome {
  matches: ExistingMatch[];
  /** At least one confident match to an existing record. */
  hasStrong: boolean;
  /** Ambiguity detected → manual review required. */
  hasAmbiguous: boolean;
  flags: string[];
}

export interface NameSim {
  similarity: number;
  exact: boolean;
  subset: boolean;
}

const GEO_STRONG_KM = 0.15;
const GEO_NOTE_KM = 0.5;

export function nameSimilarity(nameA: string, nameB: string): NameSim {
  const normA = normalizeName(nameA);
  const normB = normalizeName(nameB);
  const exact = normA === normB;
  if (exact) return { similarity: 1, exact: true, subset: true };
  const tokA = nameTokens(normA);
  const tokB = nameTokens(normB);
  const coreA = coreName(normA);
  const coreB = coreName(normB);
  const fuzzy = Math.max(
    coreA !== "" && coreB !== "" ? levenshteinRatio(coreA, coreB) : 0,
    jaccard(tokA, tokB)
  );
  const isSubset = containment(tokA, tokB) >= 0.99;
  return { similarity: Math.max(fuzzy, isSubset ? 0.99 : 0), exact: false, subset: isSubset };
}

function phoneDigits(phone: string | null): string {
  if (phone === null) return "";
  return phone.replace(/[^\d]/g, "").slice(-10);
}

function properOverlap(normA: string, normB: string): boolean {
  const pa = properTokens(normA);
  const pb = properTokens(normB);
  return pa.some((t) => pb.includes(t));
}

/** Match one validated candidate against the existing Supabase baseline. */
export function matchAgainstBaseline(
  normalized: NormalizedCandidate,
  baseline: BaselineRestaurant[]
): MatchOutcome {
  const matches: ExistingMatch[] = [];
  const flags: string[] = [];
  let hasStrong = false;
  let hasAmbiguous = false;

  const normName = normalizeName(normalized.name);
  const candTokens = nameTokens(normName);

  for (const existing of baseline) {
    const normExisting = normalizeName(existing.name);
    const sim = nameSimilarity(normalized.name, existing.name);
    const basis: string[] = [];
    let distanceKm: number | null = null;
    let corroboration = 0;
    let phoneMatch = false;

    // Phone corroboration (compare last 10 digits of both normalized forms).
    const candPhone = phoneDigits(normalized.phone);
    const existPhone = phoneDigits(existing.phone);
    if (candPhone !== "" && existPhone !== "" && candPhone === existPhone) {
      phoneMatch = true;
      corroboration++;
      basis.push("phone");
    }

    // Geographic corroboration.
    if (
      normalized.latitude !== null &&
      normalized.longitude !== null &&
      existing.latitude !== null &&
      existing.longitude !== null
    ) {
      distanceKm =
        Math.round(
          haversineKm(
            normalized.latitude,
            normalized.longitude,
            existing.latitude,
            existing.longitude
          ) * 1000
        ) / 1000;
      if (distanceKm <= GEO_STRONG_KM) {
        corroboration += 2;
        basis.push(`geo-≤${GEO_STRONG_KM * 1000}m`);
      } else if (distanceKm <= GEO_NOTE_KM) {
        corroboration++;
        basis.push(`geo-≤${GEO_NOTE_KM}km`);
      }
    }

    // Locality corroboration.
    const sameLocality =
      normalized.locality !== null &&
      existing.locality !== null &&
      normalizeName(normalized.locality) === normalizeName(existing.locality);
    if (sameLocality) {
      corroboration++;
      basis.push("locality");
    }

    // Same phone but dissimilar names → suspicious, manual review.
    if (phoneMatch && sim.similarity < 0.9 && corroboration === 1) {
      hasAmbiguous = true;
      if (!flags.includes("SAME_PHONE_DIFFERENT_NAME")) {
        flags.push("SAME_PHONE_DIFFERENT_NAME");
      }
    }

    const strong =
      sim.similarity >= 0.9 || (sim.similarity >= 0.78 && corroboration >= 1);
    const ambiguous =
      !strong &&
      ((sim.similarity >= 0.65 && candTokens[0] === nameTokens(normExisting)[0]) ||
        (properOverlap(normName, normExisting) &&
          containment(candTokens, nameTokens(normExisting)) >= 0.5));

    if (!strong && !ambiguous) continue;

    // Conflict signals inside an otherwise-plausible match.
    if (
      normalized.locality !== null &&
      existing.locality !== null &&
      !sameLocality
    ) {
      flags.push("LOCALITY_CONFLICT");
    }
    if (distanceKm !== null && distanceKm > GEO_STRONG_KM) {
      flags.push("EXISTING_COORDINATES_DIFFER");
    }

    const confidence: Confidence = strong ? (sim.similarity >= 0.98 ? "high" : "medium") : "low";
    if (strong) hasStrong = true;
    else hasAmbiguous = true;

    const nameBasis = sim.exact
      ? "name-exact"
      : sim.subset
        ? "name-subset"
        : strong
          ? `name-fuzzy-${Math.round(sim.similarity * 100) / 100}`
          : "name-ambiguous-proper-token";
    matches.push({
      existingId: existing.id,
      existingName: existing.name,
      existingLocality: existing.locality,
      existingLatitude: existing.latitude,
      existingLongitude: existing.longitude,
      similarity: Math.round(sim.similarity * 1000) / 1000,
      basis: [nameBasis, ...basis],
      distanceKm,
      confidence,
    });
  }

  matches.sort(
    (a, b) => b.similarity - a.similarity || a.existingName.localeCompare(b.existingName)
  );

  const strongCount = matches.filter((m) => m.confidence !== "low").length;
  if (strongCount > 1) {
    hasAmbiguous = true;
    if (!flags.includes("MATCHES_MULTIPLE_EXISTING_RECORDS")) {
      flags.push("MATCHES_MULTIPLE_EXISTING_RECORDS");
    }
  }

  return { matches, hasStrong, hasAmbiguous, flags };
}

/**
 * Intra-file duplicate detection: pairwise candidate-vs-candidate comparison.
 * Returns a map rowNumber → duplicate row numbers (both directions).
 */
export function findIntraFileDuplicates(
  rows: Array<{ rowNumber: number; normalized: NormalizedCandidate }>
): Map<number, number[]> {
  const result = new Map<number, number[]>();
  for (const row of rows) result.set(row.rowNumber, []);

  for (let i = 0; i < rows.length; i++) {
    for (let j = i + 1; j < rows.length; j++) {
      const a = rows[i];
      const b = rows[j];
      const sim = nameSimilarity(a.normalized.name, b.normalized.name);
      const phoneMatch =
        a.normalized.phone !== null &&
        b.normalized.phone !== null &&
        phoneDigits(a.normalized.phone) === phoneDigits(b.normalized.phone);
      const geoClose =
        a.normalized.latitude !== null &&
        a.normalized.longitude !== null &&
        b.normalized.latitude !== null &&
        b.normalized.longitude !== null &&
        haversineKm(
          a.normalized.latitude,
          a.normalized.longitude,
          b.normalized.latitude,
          b.normalized.longitude
        ) <= GEO_STRONG_KM;

      if (sim.similarity >= 0.9 || phoneMatch || geoClose) {
        result.get(a.rowNumber)?.push(b.rowNumber);
        result.get(b.rowNumber)?.push(a.rowNumber);
      }
    }
  }
  return result;
}
