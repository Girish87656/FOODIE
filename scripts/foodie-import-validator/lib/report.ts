/**
 * Foodie — import validator: dry-run report builders (JSON + Markdown).
 *
 * Reports are DETERMINISTIC: no wall-clock timestamps are embedded. The same
 * input bytes + same baseline snapshot always produce byte-identical reports,
 * which is what makes repeated runs idempotent and diff-able.
 */

import type {
  CandidateInput,
  DryRunReport,
  Issue,
  ReportSummary,
  RowCategory,
  ValidatedRow,
} from "./types";
import { TOOL_VERSION } from "./rules";

export const CATEGORY_ORDER: RowCategory[] = [
  "potential_new",
  "existing_match",
  "possible_duplicate",
  "insufficient_evidence",
  "invalid_data",
];

export const CATEGORY_LABELS: Record<RowCategory, string> = {
  potential_new: "Potential new businesses",
  existing_match: "Existing-record matches (no action taken — never auto-merged)",
  possible_duplicate: "Possible duplicates / ambiguous — MANUAL REVIEW REQUIRED",
  insufficient_evidence: "Insufficient evidence",
  invalid_data: "Invalid or missing data",
};

export function buildSummary(rows: ValidatedRow[]): ReportSummary {
  const summary: ReportSummary = {
    totalRows: rows.length,
    potentialNew: 0,
    existingMatches: 0,
    possibleDuplicates: 0,
    insufficientEvidence: 0,
    invalidData: 0,
    coordinatesAwaitingConfirmation: 0,
    errors: 0,
    warnings: 0,
  };
  for (const row of rows) {
    switch (row.category) {
      case "potential_new":
        summary.potentialNew++;
        break;
      case "existing_match":
        summary.existingMatches++;
        break;
      case "possible_duplicate":
        summary.possibleDuplicates++;
        break;
      case "insufficient_evidence":
        summary.insufficientEvidence++;
        break;
      case "invalid_data":
        summary.invalidData++;
        break;
    }
    if (row.coordinatesAwaitingConfirmation) summary.coordinatesAwaitingConfirmation++;
    summary.errors += row.issues.filter((i) => i.severity === "error").length;
    summary.warnings += row.issues.filter((i) => i.severity === "warning").length;
  }
  return summary;
}

export const REPORT_POLICY: string[] = [
  "DRY RUN ONLY — this tool performs ZERO database writes: it has no insert/update/delete code path and reads the existing records with a single GET using the public publishable key.",
  "Existing-record matches are reported for human review; nothing is merged, updated or created.",
  "Every coordinate in the input is a CANDIDATE until independently confirmed against the exact business; directory pins are never treated as confirmed GPS evidence.",
  "coordinates_verified can never be set from a third-party directory listing; the tool rejects unsupported verification claims outright.",
  "Missing coordinates, phone numbers, opening hours, prices, photos and menu data stay NULL — the tool never invents values.",
  "External listing ratings (listing_rating + source_url) are kept strictly separate from Foodie community reviews (review_count / community_rating), which are trigger-maintained in the database and rejected if present in an import.",
  "Recommended initial verification_status for any future import is 'unverified'; 'verified' can only be granted by human review.",
  "A Google Maps listing URL (maps_listing_url) documents the listing only — it never verifies a coordinate, and a search-results URL is flagged because it identifies no business.",
  "External rating/review counts (listing_rating, listing_review_count) require a source and a check date (rating_checked_on); they stay strictly separate from Foodie community reviews.",
  "review_decision records the human duplicate-review decision verbatim — it never overrides the tool's matching and never triggers a database action.",
  "Reports are deterministic (no timestamps): same input + same baseline snapshot ⇒ byte-identical report (idempotent re-runs).",
];

export function buildReport(
  rows: ValidatedRow[],
  input: { file: string; sha256: string; rowCount: number },
  baseline: {
    source: "snapshot" | "live-get";
    file: string | null;
    sha256: string | null;
    fetchedAt: string | null;
    rowCount: number;
  }
): DryRunReport {
  return {
    tool: "foodie-restaurant-import-validator",
    version: TOOL_VERSION,
    mode: "dry-run (read-only)",
    input,
    baseline: {
      source: baseline.source,
      file: baseline.file,
      sha256: baseline.sha256,
      fetchedAt: baseline.fetchedAt,
      rowCount: baseline.rowCount,
    },
    summary: buildSummary(rows),
    policy: REPORT_POLICY,
    rows,
  };
}

/* ------------------------------------------------------------------ */
/* Markdown rendering                                                  */
/* ------------------------------------------------------------------ */

function issueLine(issue: Issue): string {
  return `  - \`${issue.severity === "error" ? "ERROR" : "WARN"}\` **${issue.code}** (${issue.field}): ${issue.message}`;
}

function describeInput(c: CandidateInput): string {
  const parts: string[] = [];
  if (c.address) parts.push(`address: ${c.address}`);
  if (c.locality) parts.push(`locality: ${c.locality}`);
  if (c.city) parts.push(`city: ${c.city}`);
  if (c.phone) parts.push(`phone: ${c.phone}`);
  if (c.latitudeRaw && c.longitudeRaw) parts.push(`coords: ${c.latitudeRaw}, ${c.longitudeRaw}`);
  if (c.mapsListingUrl) parts.push(`maps_listing: ${c.mapsListingUrl}`);
  if (c.sourceUrl) parts.push(`source: ${c.sourceUrl}`);
  if (c.cuisine) parts.push(`cuisine: ${c.cuisine}`);
  if (c.listingRating) parts.push(`listing_rating: ${c.listingRating}`);
  if (c.listingReviewCount) parts.push(`listing_reviews: ${c.listingReviewCount}`);
  if (c.ratingCheckedOn) parts.push(`checked_on: ${c.ratingCheckedOn}`);
  if (c.evidenceLevel) parts.push(`evidence: ${c.evidenceLevel}`);
  if (c.reviewDecision) parts.push(`review_decision: ${c.reviewDecision}`);
  if (c.existingMatchId) parts.push(`existing_match_id: ${c.existingMatchId}`);
  if (c.uncertaintyNotes) parts.push(`uncertainty: ${c.uncertaintyNotes}`);
  if (c.notes) parts.push(`notes: ${c.notes}`);
  return parts.length === 0 ? "_no data beyond the name_" : parts.join(" · ");
}

export function renderMarkdown(report: DryRunReport): string {
  const lines: string[] = [];
  const s = report.summary;

  lines.push(`# Foodie — Restaurant Import Dry-Run Report`);
  lines.push("");
  lines.push(`**Mode:** ${report.mode} · **Tool:** ${report.tool} v${report.version}`);
  lines.push("");
  lines.push(`## Run context`);
  lines.push("");
  lines.push(`| Item | Value |`);
  lines.push(`| --- | --- |`);
  lines.push(`| Input file | \`${report.input.file}\` |`);
  lines.push(`| Input sha256 | \`${report.input.sha256}\` |`);
  lines.push(`| Rows in input | ${report.input.rowCount} |`);
  lines.push(`| Baseline source | ${report.baseline.source} |`);
  if (report.baseline.file) lines.push(`| Baseline file | \`${report.baseline.file}\` |`);
  if (report.baseline.sha256) lines.push(`| Baseline sha256 | \`${report.baseline.sha256}\` |`);
  if (report.baseline.fetchedAt) lines.push(`| Baseline fetched at | ${report.baseline.fetchedAt} |`);
  lines.push(`| Baseline rows (existing restaurants) | ${report.baseline.rowCount} |`);
  lines.push("");
  lines.push(`## Summary`);
  lines.push("");
  lines.push(`| Bucket | Rows |`);
  lines.push(`| --- | ---: |`);
  lines.push(`| 1. Potential new businesses | ${s.potentialNew} |`);
  lines.push(`| 2. Existing-record matches | ${s.existingMatches} |`);
  lines.push(`| 3. Possible duplicates / ambiguous | ${s.possibleDuplicates} |`);
  lines.push(`| 4. Insufficient evidence | ${s.insufficientEvidence} |`);
  lines.push(`| 5. Invalid or missing data | ${s.invalidData} |`);
  lines.push(`| 6. Candidate coordinates awaiting confirmation (cross-cutting) | ${s.coordinatesAwaitingConfirmation} |`);
  lines.push(`| **Total rows** | **${s.totalRows}** |`);
  lines.push(`| Validation errors | ${s.errors} |`);
  lines.push(`| Validation warnings | ${s.warnings} |`);
  lines.push("");
  lines.push(`## Policy enforced by this run`);
  lines.push("");
  for (const p of report.policy) lines.push(`- ${p}`);
  lines.push("");

  for (const category of CATEGORY_ORDER) {
    const bucketRows = report.rows.filter((r) => r.category === category);
    lines.push(`## ${CATEGORY_LABELS[category]} (${bucketRows.length})`);
    lines.push("");
    if (bucketRows.length === 0) {
      lines.push("_None._");
      lines.push("");
      continue;
    }
    for (const row of bucketRows) {
      lines.push(`### Row ${row.rowNumber}: ${row.normalized.name || "_(no name)_"}`);
      lines.push("");
      lines.push(`- **Confidence:** ${row.confidence}`);
      lines.push(`- **Input:** ${describeInput(row.input)}`);
      if (row.matches.length > 0) {
        lines.push(`- **Matches to existing records:**`);
        for (const m of row.matches) {
          const loc = m.existingLocality ? ` · locality: ${m.existingLocality}` : "";
          const dist = m.distanceKm !== null ? ` · distance: ${m.distanceKm} km` : "";
          const coords =
            m.existingLatitude !== null && m.existingLongitude !== null
              ? ` · existing coords: ${m.existingLatitude}, ${m.existingLongitude}`
              : " · existing coords: NULL";
          lines.push(
            `  - \`${m.existingId.slice(0, 8)}\` **${m.existingName}**${loc} — similarity ${m.similarity} (${m.basis.join(", ")})${dist}${coords} — confidence ${m.confidence}`
          );
        }
      }
      if (row.intraFileDuplicates.length > 0) {
        lines.push(
          `- **Intra-file duplicates:** rows ${row.intraFileDuplicates.join(", ")} — both entries stay separate; a human must decide.`
        );
      }
      if (row.coordinatesAwaitingConfirmation) {
        lines.push(
          `- **Coordinates awaiting confirmation:** ${row.normalized.latitude ?? "?"}, ${row.normalized.longitude ?? "?"} — evidence level: ${row.normalized.evidenceLevel}${row.normalized.sourceUrl ? ` · source: ${row.normalized.sourceUrl}` : " · no source_url"}. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.`
        );
      }
      if (row.flags.length > 0) {
        lines.push(`- **Flags:** ${row.flags.map((f) => `\`${f}\``).join(", ")}`);
      }
      if (row.issues.length > 0) {
        lines.push(`- **Issues:**`);
        for (const issue of row.issues) lines.push(issueLine(issue));
      }
      lines.push(`- **Recommended initial verification_status:** ${row.recommendedVerificationStatus}`);
      lines.push("");
    }
  }

  // Cross-cutting bucket 6: every row carrying coordinates that are not
  // independently confirmed (regardless of its primary bucket above).
  const coordsPending = report.rows.filter((r) => r.coordinatesAwaitingConfirmation);
  lines.push(`## 6. Candidate coordinates awaiting confirmation (${coordsPending.length})`);
  lines.push("");
  if (coordsPending.length === 0) {
    lines.push(
      "_None — either no coordinates were supplied, or every coordinate row already claims independently-confirmed evidence with a source URL (claims are recorded, never auto-trusted)._"
    );
    lines.push("");
  } else {
    lines.push(
      "Every pin below stays a CANDIDATE until its relationship to the exact business is independently confirmed. A directory-published pin or a map-search result is NOT proof of an exact coordinate."
    );
    lines.push("");
    lines.push(`| Row | Candidate | Bucket | Coordinates | Evidence | Source URL |`);
    lines.push(`| ---: | --- | --- | --- | --- | --- |`);
    for (const row of coordsPending) {
      lines.push(
        `| ${row.rowNumber} | ${row.normalized.name || "_(no name)_"} | ${row.category} | ${row.normalized.latitude ?? "?"}, ${row.normalized.longitude ?? "?"} | ${row.normalized.evidenceLevel} | ${row.normalized.sourceUrl ?? "—"} |`
      );
    }
    lines.push("");
  }

  lines.push(`## Next step`);
  lines.push("");
  lines.push(
    "Nothing has been imported. Resolve rows flagged for manual review, fix invalid rows, then re-run this validator until the report is clean. Only after explicit human approval may an import be prepared — via a reviewed SQL/insert path, never by this tool."
  );
  lines.push("");
  return lines.join("\n");
}
