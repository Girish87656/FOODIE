#!/usr/bin/env bun
/**
 * Foodie — Restaurant Import Validator (LOCAL, DRY-RUN ONLY).
 *
 * Validates candidate restaurant rows (CSV or JSON) against the live Supabase
 * `restaurants` baseline and produces a deterministic dry-run report that
 * separates:
 *
 *   1. Potential new businesses
 *   2. Existing-record matches            (never merged/updated)
 *   3. Possible duplicates / ambiguous    (manual review)
 *   4. Insufficient evidence
 *   5. Invalid or missing data
 *   6. Candidate coordinates awaiting confirmation (cross-cutting)
 *
 * ZERO DATABASE WRITES: the only network operation in the entire tool is a
 * single HTTP GET that reads the existing records (see lib/baseline.ts).
 *
 * Usage:
 *   bun scripts/foodie-import-validator/validate.ts --input <file.csv|.json> [options]
 *
 * Options:
 *   --input <path>            Candidate file: .csv or .json (required)
 *   --baseline <path>         Use this baseline snapshot JSON (deterministic runs)
 *   --save-baseline <path>    Fetch live rows once (GET) and save a snapshot, then use it
 *   --report-dir <dir>        Where to write reports (default: <tool>/reports)
 *   --label <name>            Report file label (default: input basename)
 *   --strict                  Exit with code 2 when any row lands in invalid_data
 *   --quiet                   Only print the summary
 *   --help                    Show this help
 *
 * Exit codes: 0 = ran clean · 1 = usage/IO/network error · 2 = --strict and invalid rows exist
 */

import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, resolve } from "node:path";
import { parseCsv, headerToField } from "./lib/csv";
import { loadBaseline } from "./lib/baseline";
import { validateRow, isNameOnly, FORBIDDEN_FIELDS, KNOWN_FIELDS, TOOL_VERSION } from "./lib/rules";
import { matchAgainstBaseline, findIntraFileDuplicates } from "./lib/match";
import { buildReport, renderMarkdown, buildSummary } from "./lib/report";
import type {
  CandidateInput,
  Confidence,
  ValidatedRow,
} from "./lib/types";

const TOOL_DIR = new URL(".", import.meta.url).pathname;
const DEFAULT_SNAPSHOT = resolve(TOOL_DIR, "fixtures/baseline-snapshot.json");

interface CliArgs {
  input?: string;
  baseline?: string;
  saveBaseline?: string;
  reportDir?: string;
  label?: string;
  strict?: boolean;
  quiet?: boolean;
  help?: boolean;
}

function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    switch (a) {
      case "--input":
      case "--baseline":
      case "--save-baseline":
      case "--report-dir":
      case "--label":
        args[a.slice(2).replace(/-([a-z])/g, (_, c: string) => c.toUpperCase()) as
          | "input"
          | "baseline"
          | "saveBaseline"
          | "reportDir"
          | "label"] = argv[++i];
        break;
      case "--strict":
        args.strict = true;
        break;
      case "--quiet":
        args.quiet = true;
        break;
      case "--help":
      case "-h":
        args.help = true;
        break;
      default:
        throw new Error(`Unknown option: ${a} (see --help)`);
    }
  }
  return args;
}

function printHelp(): void {
  console.log(`Foodie Restaurant Import Validator v${TOOL_VERSION} — LOCAL DRY-RUN ONLY (zero DB writes)

Usage:
  bun scripts/foodie-import-validator/validate.ts --input <file.csv|.json> [options]

Options:
  --input <path>            Candidate file: .csv or .json (required)
  --baseline <path>         Use this baseline snapshot JSON (deterministic runs)
  --save-baseline <path>    Fetch live rows once (GET) and save a snapshot, then use it
  --report-dir <dir>        Where to write reports (default: ${resolve(TOOL_DIR, "reports")})
  --label <name>            Report file label (default: input basename without extension)
  --strict                  Exit with code 2 when any row lands in invalid_data
  --quiet                   Only print the summary
  --help                    Show this help
`);
}

/* ------------------------------------------------------------------ */
/* Input mapping (CSV + JSON → CandidateInput)                         */
/* ------------------------------------------------------------------ */

const HEADER_ALIASES: Record<string, string> = {
  phone_number: "phone",
  tel: "phone",
  lat: "latitude",
  lng: "longitude",
  lon: "longitude",
  url: "source_url",
  listing_url: "source_url",
  reference_url: "source_url",
  evidence: "evidence_level",
  external_rating: "listing_rating",
  hours: "opening_hours",
  note: "notes",
};

function toSnake(key: string): string {
  return key
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
}

function canonicalField(rawHeader: string): { field: string | null; forbidden: boolean } {
  const snake = toSnake(rawHeader);
  const aliased = HEADER_ALIASES[snake] ?? snake;
  if ((FORBIDDEN_FIELDS as readonly string[]).includes(aliased)) return { field: aliased, forbidden: true };
  if ((KNOWN_FIELDS as readonly string[]).includes(aliased)) return { field: aliased, forbidden: false };
  return { field: null, forbidden: false };
}

interface RawRow {
  /** canonical field → raw value */
  values: Record<string, string>;
  forbidden: Array<{ field: string; value: string }>;
  unknown: string[];
}

function rawFromCsv(text: string): { rows: RawRow[]; fileErrors: string[] } {
  const parsed = parseCsv(text);
  const rows: RawRow[] = [];
  for (const cells of parsed.rows) {
    const raw: RawRow = { values: {}, forbidden: [], unknown: [] };
    parsed.headers.forEach((header, idx) => {
      const { field, forbidden } = canonicalField(header);
      const value = cells[idx] ?? "";
      if (forbidden && value.trim() !== "") {
        raw.forbidden.push({ field: field ?? header, value: value.trim() });
        return;
      }
      if (field === null) {
        if (value.trim() !== "") raw.unknown.push(header);
        return;
      }
      raw.values[field] = value;
    });
    rows.push(raw);
  }
  return { rows, fileErrors: parsed.fileErrors };
}

function rawFromJson(text: string): { rows: RawRow[]; fileErrors: string[] } {
  const fileErrors: string[] = [];
  const parsed: unknown = JSON.parse(text);
  let list: unknown[];
  if (Array.isArray(parsed)) {
    list = parsed;
  } else if (typeof parsed === "object" && parsed !== null) {
    const obj = parsed as Record<string, unknown>;
    if (Array.isArray(obj.rows)) list = obj.rows;
    else if (Array.isArray(obj.candidates)) list = obj.candidates;
    else {
      fileErrors.push('JSON input must be an array of objects or {"rows": [...]} / {"candidates": [...]}');
      list = [];
    }
  } else {
    fileErrors.push("JSON input must be an array of objects");
    list = [];
  }
  const rows: RawRow[] = [];
  list.forEach((item) => {
    if (typeof item !== "object" || item === null) {
      fileErrors.push(`JSON row is not an object: ${JSON.stringify(item)?.slice(0, 60)}`);
      return;
    }
    const raw: RawRow = { values: {}, forbidden: [], unknown: [] };
    for (const [key, value] of Object.entries(item as Record<string, unknown>)) {
      const { field, forbidden } = canonicalField(key);
      const str = value === null || value === undefined ? "" : String(value);
      if (forbidden) {
        if (str.trim() !== "") raw.forbidden.push({ field: field ?? key, value: str.trim() });
        continue;
      }
      if (field === null) {
        if (str.trim() !== "") raw.unknown.push(key);
        continue;
      }
      raw.values[field] = str;
    }
    rows.push(raw);
  });
  return { rows, fileErrors };
}

function toCandidateInput(raw: RawRow, rowNumber: number): CandidateInput {
  const v = raw.values;
  return {
    rowNumber,
    name: v.name ?? "",
    category: v.category ?? null,
    address: v.address ?? null,
    locality: v.locality ?? null,
    city: v.city ?? null,
    phone: v.phone ?? null,
    latitudeRaw: v.latitude ?? null,
    longitudeRaw: v.longitude ?? null,
    sourceUrl: v.source_url ?? null,
    evidenceLevel: v.evidence_level ?? null,
    listingRating: v.listing_rating ?? null,
    openingHours: v.opening_hours ?? null,
    priceLevel: v.price_level ?? null,
    coordinatesVerified: v.coordinates_verified ?? null,
    verificationStatus: v.verification_status ?? null,
    notes: v.notes ?? null,
    forbiddenColumns: raw.forbidden,
    unknownColumns: raw.unknown,
  };
}

/* ------------------------------------------------------------------ */
/* Classification                                                      */
/* ------------------------------------------------------------------ */

const CONFIDENCE_RANK: Record<Confidence, number> = { high: 3, medium: 2, low: 1, none: 0 };

function classify(
  row: Omit<ValidatedRow, "category" | "confidence" | "intraFileDuplicates" | "coordinatesAwaitingConfirmation" | "recommendedVerificationStatus">,
  hasErrors: boolean,
  hasStrong: boolean,
  hasAmbiguous: boolean,
  intraFileDuplicates: number[],
  nameOnly: boolean
): { category: ValidatedRow["category"]; confidence: Confidence } {
  if (hasErrors) return { category: "invalid_data", confidence: "none" };
  if (hasStrong) {
    const best = row.matches
      .filter((m) => m.confidence !== "low")
      .reduce<Confidence>((acc, m) => (CONFIDENCE_RANK[m.confidence] > CONFIDENCE_RANK[acc] ? m.confidence : acc), "low");
    return { category: "existing_match", confidence: best };
  }
  if (hasAmbiguous || intraFileDuplicates.length > 0) {
    const serious =
      row.flags.includes("SAME_PHONE_DIFFERENT_NAME") ||
      row.flags.includes("MATCHES_MULTIPLE_EXISTING_RECORDS") ||
      intraFileDuplicates.length > 0;
    return { category: "possible_duplicate", confidence: serious ? "medium" : "low" };
  }
  if (nameOnly) return { category: "insufficient_evidence", confidence: "low" };
  return { category: "potential_new", confidence: row.normalized.sourceUrl ? "medium" : "low" };
}

/* ------------------------------------------------------------------ */
/* Main                                                                */
/* ------------------------------------------------------------------ */

async function main(): Promise<number> {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printHelp();
    return 0;
  }
  if (!args.input) {
    printHelp();
    throw new Error("--input is required");
  }

  const inputPath = resolve(args.input);
  if (!existsSync(inputPath)) throw new Error(`Input file not found: ${inputPath}`);
  const inputBytes = readFileSync(inputPath);
  const inputText = inputBytes.toString("utf8");
  const inputSha = createHash("sha256").update(inputBytes).digest("hex");

  const lower = inputPath.toLowerCase();
  const parsedInput = lower.endsWith(".csv")
    ? rawFromCsv(inputText)
    : lower.endsWith(".json")
      ? rawFromJson(inputText)
      : (() => {
          throw new Error("Unsupported input format — use .csv or .json");
        })();
  if (parsedInput.fileErrors.length > 0) {
    throw new Error(
      `Input file has fatal problems:\n${parsedInput.fileErrors.map((e) => `  - ${e}`).join("\n")}`
    );
  }

  // Baseline (READ-ONLY: snapshot file or a single GET).
  const baseline = await loadBaseline({
    baselineFile: args.baseline,
    saveBaselinePath: args.saveBaseline,
    defaultSnapshotPath: DEFAULT_SNAPSHOT,
  });
  if (baseline.source === "snapshot" && baseline.file && baseline.sha256 === null) {
    baseline.sha256 = createHash("sha256").update(readFileSync(baseline.file)).digest("hex");
  }

  // Validate + match every row.
  const candidates = parsedInput.rows.map((raw, idx) => toCandidateInput(raw, idx + 1));
  const duplicatesMap = findIntraFileDuplicates(
    candidates.map((c) => ({ rowNumber: c.rowNumber, normalized: validateRow(c).normalized }))
  );

  const rows: ValidatedRow[] = [];
  for (const candidate of candidates) {
    const { issues, normalized } = validateRow(candidate);
    const outcome = matchAgainstBaseline(normalized, baseline.rows);
    const intra = duplicatesMap.get(candidate.rowNumber) ?? [];
    const flags = [...outcome.flags];
    if (candidate.unknownColumns.length > 0) {
      flags.push(`UNKNOWN_COLUMNS:${candidate.unknownColumns.join("|")}`);
    }
    if (intra.length > 0 && !flags.includes("INTRA_FILE_DUPLICATE")) {
      flags.push("INTRA_FILE_DUPLICATE");
    }
    const hasErrors = issues.some((i) => i.severity === "error");
    const nameOnly = isNameOnly(normalized);
    const { category, confidence } = classify(
      { rowNumber: candidate.rowNumber, input: candidate, normalized, issues, matches: outcome.matches, flags },
      hasErrors,
      outcome.hasStrong,
      outcome.hasAmbiguous,
      intra,
      nameOnly
    );
    rows.push({
      rowNumber: candidate.rowNumber,
      input: candidate,
      normalized,
      issues,
      category,
      confidence,
      matches: outcome.matches,
      intraFileDuplicates: intra,
      flags,
      coordinatesAwaitingConfirmation:
        normalized.latitude !== null &&
        normalized.longitude !== null &&
        (normalized.evidenceLevel !== "independently_confirmed" || normalized.sourceUrl === null),
      recommendedVerificationStatus:
        candidate.verificationStatus === "community_submitted" ? "community_submitted" : "unverified",
    });
  }

  const report = buildReport(
    rows,
    { file: inputPath, sha256: inputSha, rowCount: rows.length },
    {
      source: baseline.source,
      file: baseline.file,
      sha256: baseline.sha256,
      fetchedAt: baseline.fetchedAt,
      rowCount: baseline.rows.length,
    }
  );

  // Write reports (local files only — the database is never touched).
  const reportDir = resolve(args.reportDir ?? resolve(TOOL_DIR, "reports"));
  mkdirSync(reportDir, { recursive: true });
  const label = (args.label ?? basename(inputPath).replace(/\.(csv|json)$/i, "")).replace(/[^\w.-]+/g, "-");
  const jsonPath = resolve(reportDir, `${label}.dry-run.json`);
  const mdPath = resolve(reportDir, `${label}.dry-run.md`);
  writeFileSync(jsonPath, JSON.stringify(report, null, 2) + "\n", "utf8");
  writeFileSync(mdPath, renderMarkdown(report), "utf8");

  const s = buildSummary(rows);
  if (!args.quiet) {
    console.log(`Foodie Import Validator v${TOOL_VERSION} — DRY RUN (zero database writes)`);
    console.log(`Input:      ${inputPath} (${rows.length} rows)`);
    console.log(
      `Baseline:   ${baseline.source}${baseline.file ? ` (${baseline.file})` : ""} — ${baseline.rows.length} existing restaurants`
    );
    console.log("");
    console.log("Results:");
    console.log(`  1. Potential new businesses                : ${s.potentialNew}`);
    console.log(`  2. Existing-record matches                 : ${s.existingMatches}`);
    console.log(`  3. Possible duplicates / ambiguous         : ${s.possibleDuplicates}`);
    console.log(`  4. Insufficient evidence                   : ${s.insufficientEvidence}`);
    console.log(`  5. Invalid or missing data                 : ${s.invalidData}`);
    console.log(`  6. Coordinates awaiting confirmation       : ${s.coordinatesAwaitingConfirmation}`);
    console.log(`  Errors: ${s.errors} · Warnings: ${s.warnings}`);
    console.log("");
    console.log(`Reports: ${jsonPath}`);
    console.log(`         ${mdPath}`);
  }

  if (args.strict && s.invalidData > 0) return 2;
  return 0;
}

main()
  .then((code) => process.exit(code))
  .catch((err: unknown) => {
    console.error("FATAL:", err instanceof Error ? err.message : err);
    process.exit(1);
  });
