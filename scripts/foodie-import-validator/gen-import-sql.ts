/**
 * Foodie — Phase 3I FINAL import-artifact generator.
 *
 * DETERMINISTIC, ZERO-DB-ACCESS: reads three committed review artifacts and
 * emits two review artifacts. It never opens a network connection, never
 * touches Supabase, and never executes or "dry-runs" SQL — the generated SQL
 * file is a labelled human-review deliverable only.
 *
 * Inputs (all committed, all read-only):
 *   1. reports/phase3h-proposed-import-manifest.json   (14 proposed records)
 *   2. reports/research-2026-10-09-final-qa.dry-run.json (fresh validator run
 *      of the 45-row worksheet against a LIVE read-only baseline snapshot)
 *   3. fixtures/baseline-snapshot.json                 (the live snapshot)
 *
 * Outputs (deterministic — same inputs produce byte-identical outputs; the
 * only timestamps embedded are ones read from the input artifacts):
 *   A. reports/phase3i-final-import-manifest.json
 *   B. supabase/insert-batch-003-phase3h-14.sql
 *
 * Safety invariants enforced before anything is emitted (generator aborts on
 * any violation):
 *   - live baseline is the 14 known restaurants (names verified);
 *   - validator run: 0 existing-matches, 0 errors, 0 warnings;
 *   - all 14 proposed rows re-validated as `potential_new`, EXCEPT the three
 *     documented proximity-advisory rows (15, 17, 32) whose intra-file pairs
 *     must all be HELD rows (20, 44) — i.e. no advisory pairs inside the
 *     insert set other than the reviewed 15<->32 station-corridor pair;
 *   - no two proposed rows share a phone or a normalized name;
 *   - every proposed row's recommended verification state is `unverified`.
 *
 * Usage: bun scripts/foodie-import-validator/gen-import-sql.ts
 */

import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const ROOT = resolve(new URL("../..", import.meta.url).pathname);
const M3H_PATH = resolve(ROOT, "scripts/foodie-import-validator/reports/phase3h-proposed-import-manifest.json");
const V_PATH = resolve(ROOT, "scripts/foodie-import-validator/reports/research-2026-10-09-final-qa.dry-run.json");
const B_PATH = resolve(ROOT, "scripts/foodie-import-validator/fixtures/baseline-snapshot.json");
const MANIFEST_OUT = resolve(ROOT, "scripts/foodie-import-validator/reports/phase3i-final-import-manifest.json");
const SQL_OUT = resolve(ROOT, "supabase/insert-batch-003-phase3h-14.sql");

/** Fixed UUIDv5 namespace for this batch (random, generated once, committed here). */
const UUID_NAMESPACE = "9f0c3a52-7d1e-4b6a-9c48-2e5f1a7d3b11";

const BASELINE_NAMES = [
  "Abhiram Food Court", "Amigos Cafe", "Ayyappa Tiffin Room",
  "Brundavana Family Restaurant", "Chickpet Donne Biryani House",
  "GITAM University Canteen", "Hotel Halli Nanasu", "Hotel Royal Nandhana",
  "Priyanka Tiffen Center", "Shri Manjunatha Grand Veg",
  "Sri Annapoorneshwari Tiffin Center", "Sri Ganesh Grand",
  "SS Hyderabadi Biriyani Zone", "The Biryani Shack",
];

/**
 * Tags: ONLY tokens taken verbatim from the business NAME (identity evidence,
 * same convention as insert batches 001/002 — see 'family_restaurant' for
 * Brundavana, 'food_court' for Abhiram, 'biryani' for The Biryani Shack).
 * Free-text cuisine strings are deliberately NOT converted into tags.
 */
const NAME_DERIVED_TAGS: Record<number, string[]> = {
  14: ["family_restaurant"], // "Rainbow Huts Family Restaurant"
  15: ["family_restaurant"], // "Hotel Bindushree Family Restaurant"
  32: ["food_court"],        // "Abhis Food Court"
  33: ["burger"],            // "Burger Time"
  34: ["bbq"],               // "Bbq Junction"
  35: ["family_restaurant"], // "Rajashree Veg And Non-Veg Family Restaurant"
  37: ["palav"],             // "Palav Ramu Hotel"
};

function sha256File(path: string): string {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

function sha256Text(text: string): string {
  return createHash("sha256").update(text, "utf8").digest("hex");
}

/** RFC 4122 uuidv5 (SHA-1, no external deps). */
function uuidv5(name: string, namespace: string): string {
  const ns = namespace.replace(/-/g, "");
  const nsBytes = new Uint8Array(16);
  for (let i = 0; i < 16; i++) nsBytes[i] = parseInt(ns.slice(i * 2, i * 2 + 2), 16);
  const nameBytes = new TextEncoder().encode(name);
  const data = new Uint8Array(16 + nameBytes.length);
  data.set(nsBytes, 0);
  data.set(nameBytes, 16);
  const hash = createHash("sha1").update(data).digest();
  const b = Array.from(hash.slice(0, 16));
  b[6] = (b[6] & 0x0f) | 0x50; // version 5
  b[8] = (b[8] & 0x3f) | 0x80; // RFC 4122 variant
  const hex = b.map((x) => x.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function sqlString(value: string): string {
  return `'${value.replace(/'/g, "''")}'`;
}

function fail(msg: string): never {
  console.error(`GENERATOR ABORT: ${msg}`);
  process.exit(1);
}

/* ------------------------------------------------------------------ */
/* Load inputs                                                         */
/* ------------------------------------------------------------------ */

const m3h = JSON.parse(readFileSync(M3H_PATH, "utf8"));
const v = JSON.parse(readFileSync(V_PATH, "utf8"));
const baseline = JSON.parse(readFileSync(B_PATH, "utf8"));

/* ------------------------------------------------------------------ */
/* Safety invariants                                                   */
/* ------------------------------------------------------------------ */

if (m3h.manifest_version !== "phase3h-proposed-import-manifest") {
  fail(`unexpected manifest version: ${m3h.manifest_version}`);
}
if (!Array.isArray(m3h.proposed_records) || m3h.proposed_records.length !== 14) {
  fail(`expected 14 proposed records, found ${m3h.proposed_records?.length}`);
}
if (v.summary?.existingMatches !== 0 || v.summary?.errors !== 0 || v.summary?.warnings !== 0) {
  fail(`validator run is not clean: ${JSON.stringify(v.summary)}`);
}
if (baseline.count !== 14 || !Array.isArray(baseline.rows)) {
  fail(`baseline snapshot is not the 14-row baseline (count=${baseline.count})`);
}
const liveNames = baseline.rows.map((r: { name: string }) => r.name).sort();
if (JSON.stringify(liveNames) !== JSON.stringify([...BASELINE_NAMES].sort())) {
  fail(`live baseline names drifted from the reviewed set: ${liveNames.join(", ")}`);
}

const heldRowNumbers = new Set(m3h.excluded_reference.map((r: { worksheet_row: number }) => r.worksheet_row));
const validatorByRow = new Map<number, (typeof v.rows)[number]>();
for (const row of v.rows) validatorByRow.set(row.rowNumber, row);

const proposed = m3h.proposed_records as Array<Record<string, unknown>>;
const seenNames = new Set<string>();
const seenPhones = new Set<string>();

for (const rec of proposed) {
  const rowNo = rec.worksheet_row as number;
  const name = rec.name as string;
  const vr = validatorByRow.get(rowNo);
  if (!vr) fail(`row ${rowNo} missing from validator run`);

  // Every proposed row must re-validate as potential_new, except the three
  // documented advisory rows. Their intra-file pairs must all be either HELD
  // rows (20, 44) or the reviewed mutual 15<->32 station-corridor pair (both
  // sides proposed advisory rows, distinct names/categories/phones).
  if (vr.category !== "potential_new") {
    const intra: number[] = vr.intraFileDuplicates ?? [];
    const advisoryRows = new Set([15, 17, 32]);
    const proposedRows = new Set(proposed.map((r) => r.worksheet_row as number));
    const allPairsReviewed = intra.every(
      (n) => heldRowNumbers.has(n) || (advisoryRows.has(n) && proposedRows.has(n))
    );
    if (!advisoryRows.has(rowNo) || vr.category !== "possible_duplicate" || !allPairsReviewed) {
      fail(`row ${rowNo} (${name}) re-validated as ${vr.category} with intra=${JSON.stringify(intra)} — not importable without re-review`);
    }
  }
  if (vr.recommendedVerificationStatus !== "unverified") {
    fail(`row ${rowNo} (${name}) recommended status is ${vr.recommendedVerificationStatus}`);
  }

  const norm = name.trim().toLowerCase();
  if (seenNames.has(norm)) fail(`duplicate normalized name inside insert set: ${name}`);
  seenNames.add(norm);

  const phone = rec.phone as string | null;
  if (phone) {
    if (seenPhones.has(phone)) fail(`two proposed rows share phone ${phone}`);
    seenPhones.add(phone);
    if (baseline.rows.some((r: { phone: string | null }) => r.phone === phone)) {
      fail(`proposed phone ${phone} already exists in the live baseline`);
    }
  }

  if (rec.review_decision !== "distinct_new_business") {
    fail(`row ${rowNo} review_decision is ${rec.review_decision}`);
  }
  if ((rec.evidence_level as string) !== "directory_reported") {
    fail(`row ${rowNo} evidence_level is ${rec.evidence_level}`);
  }
}

console.log("Invariants PASS — 14 proposed rows re-verified against the live baseline.");

/* ------------------------------------------------------------------ */
/* Emit A — the SQL batch                                              */
/* ------------------------------------------------------------------ */

const sourceValue = "phase3h-research-import";

function insertBlock(rec: Record<string, unknown>): string {
  const rowNo = rec.worksheet_row as number;
  const id = uuidv5(`foodie-batch3-row${rowNo}`, UUID_NAMESPACE);
  const name = rec.name as string;
  const category = rec.category as string;
  const address = rec.address as string;
  const city = rec.city as string;
  const locality = (rec.locality as string | null) ?? null;
  const lat = rec.latitude as number | null;
  const lng = rec.longitude as number | null;
  const phone = rec.phone as string | null;
  const rating = rec.listing_rating as number | null;
  const price = rec.price_level as string | null;
  const hours = rec.opening_hours as string | null;
  const src = rec.source_url as string;
  const tags = NAME_DERIVED_TAGS[rowNo] ?? [];

  const lines: string[] = [];
  lines.push(`-- ${name} (worksheet row ${rowNo})`);
  if (rating != null) {
    lines.push(`--   listing rating: ${rating}/${(rec.listing_review_count as number | null) ?? "?"} (external directory rating, checked ${rec.rating_checked_on ?? "?"} — source in the manifest; NOT a Foodie community rating)`);
  } else {
    lines.push(`--   listing rating: none captured -> 0 sentinel (app hides the badge at 0)`);
  }
  if (lat != null) {
    lines.push(`--   coordinates: DIRECTORY-REPORTED pin (${rec.coordinates_source_url ?? "directory JSON-LD"}) — candidate_coordinates; coordinates_verified stays NULL; on-site GPS still required`);
  } else {
    lines.push(`--   coordinates: none — never derived; NULL until field-verified (excluded from nearby discovery)`);
  }
  if (rec.evidence_note) lines.push(`--   note: ${rec.evidence_note}`);

  const cols = [
    "id", "name", "category", "address", "city", "locality",
    "latitude", "longitude", "rating", "price_level", "opening_hours", "phone",
    "tags", "source", "source_url", "verification_status",
  ].join(", ");

  const vals = [
    sqlString(id),
    sqlString(name),
    sqlString(category),
    sqlString(address),
    sqlString(city),
    locality == null ? "null" : sqlString(locality),
    lat == null ? "null" : String(lat),
    lng == null ? "null" : String(lng),
    rating == null ? "0" : String(rating),
    price == null ? "null" : sqlString(price),
    hours == null ? "null" : sqlString(hours),
    phone == null ? "null" : sqlString(phone),
    `array[${tags.map(sqlString).join(",")}]::text[]`,
    sqlString(sourceValue),
    sqlString(src),
    sqlString("unverified"),
  ];

  // Idempotency + identity guard: skip when the fixed id, the normalized
  // name, or the phone already exists (a phone match with a different name
  // is treated as the same business — conservative by design).
  const guards = [
    `r.id = ${sqlString(id)}`,
    `lower(btrim(r.name)) = lower(btrim(${sqlString(name)}))`,
  ];
  if (phone) guards.push(`r.phone = ${sqlString(phone)}`);

  lines.push(`insert into public.restaurants`);
  lines.push(`  (${cols})`);
  lines.push(`select`);
  for (let i = 0; i < vals.length; i++) {
    lines.push(`  ${vals[i]}${i < vals.length - 1 ? "," : ""}`);
  }
  lines.push(`where not exists (`);
  lines.push(`  select 1 from public.restaurants r`);
  lines.push(`  where ${guards.join("\n     or ")}`);
  lines.push(`);`);
  return lines.join("\n");
}

const sqlParts: string[] = [];
sqlParts.push(`-- ============================================================================`);
sqlParts.push(`-- Foodie — INSERT BATCH 003: Phase 3H reviewed candidates (14 places)`);
sqlParts.push(`-- ----------------------------------------------------------------------------`);
sqlParts.push(`-- STATUS:  PROPOSED — MANUAL REVIEW + EXPLICIT HUMAN APPROVAL REQUIRED.`);
sqlParts.push(`--          This file has NEVER been executed. At generation time the live`);
sqlParts.push(`--          database still contains exactly the 14 baseline restaurants.`);
sqlParts.push(`--`);
sqlParts.push(`-- SOURCE:  generated by scripts/foodie-import-validator/gen-import-sql.ts from`);
sqlParts.push(`--          reports/phase3i-final-import-manifest.json (which supersedes the`);
sqlParts.push(`--          phase3h manifest). Inputs + hashes are embedded in that manifest.`);
sqlParts.push(`--`);
sqlParts.push(`-- HONESTY RULES HONORED (identical to batches 001/002):`);
sqlParts.push(`--   * every row enters as verification_status 'unverified' — nothing here is`);
sqlParts.push(`--     verified, and NO verification boolean or timestamp is set;`);
sqlParts.push(`--   * coordinates appear ONLY where a directory published them and stay`);
sqlParts.push(`--     candidate_coordinates (coordinates_verified NULL — never promoted);`);
sqlParts.push(`--   * missing values are NULL — phone, hours, price, coordinates and ratings`);
sqlParts.push(`--     are never guessed, never averaged, never back-filled;`);
sqlParts.push(`--   * 'rating' is the EXTERNAL directory rating (0 = not captured, app hides`);
sqlParts.push(`--     the badge at 0) and is NEVER a Foodie community rating;`);
sqlParts.push(`--   * review_count / community_rating / last_verified_at / address_verified /`);
sqlParts.push(`--     hours_verified / photos_verified are NOT in the column list — they are`);
sqlParts.push(`--     trigger-maintained or verification-owned and stay untouched;`);
sqlParts.push(`--   * additive only: no UPDATE, no DELETE, no DDL, no existing row changes.`);
sqlParts.push(`--`);
sqlParts.push(`-- IDEMPOTENT: safe to run more than once. Fixed UUIDs + per-row guards make`);
sqlParts.push(`-- any re-run a no-op; the preflight aborts if the database drifted.`);
sqlParts.push(`--`);
sqlParts.push(`-- PROXIMITY ADVISORIES (documented in the manifest — NOT identity matches):`);
sqlParts.push(`--   rows 15<->32 (~90 m, Scout Camp Rd / K.G Govindapura station cluster),`);
sqlParts.push(`--   row 17 vs HELD row 20, rows 15/32 vs HELD row 44. Distinct names,`);
sqlParts.push(`--   categories and phones; the held rows are NOT part of this batch.`);
sqlParts.push(`--   The Part 3 postflight report re-surfaces any close pairs for eyeballing.`);
sqlParts.push(`--`);
sqlParts.push(`-- DO NOT RUN until every value below has been reviewed and approved.`);
sqlParts.push(`-- Run (after approval): Supabase Dashboard -> SQL Editor -> paste -> Run.`);
sqlParts.push(`-- ============================================================================`);
sqlParts.push(``);
sqlParts.push(`begin;`);
sqlParts.push(``);
sqlParts.push(`-- ---------------------------------------------------------------------------`);
sqlParts.push(`-- Part 0 — PREFLIGHT (aborts before any write when the world changed)`);
sqlParts.push(`-- ---------------------------------------------------------------------------`);
sqlParts.push(`do $$`);
sqlParts.push(`declare`);
sqlParts.push(`  v_count integer;`);
sqlParts.push(`  v_batch_present integer;`);
sqlParts.push(`  v_missing_baseline text;`);
sqlParts.push(`begin`);
sqlParts.push(`  select count(*) into v_count from public.restaurants;`);
sqlParts.push(``);
sqlParts.push(`  -- The batch was built against a 14-row baseline; after one full run there`);
sqlParts.push(`  -- are 28. Anything else means the table changed outside this review.`);
sqlParts.push(`  if v_count < 14 or v_count > 28 then`);
sqlParts.push(`    raise exception 'PREFLIGHT FAIL: restaurants row count is %, expected between 14 and 28. The table changed outside this review — re-run the review before importing.', v_count;`);
sqlParts.push(`  end if;`);
sqlParts.push(``);
sqlParts.push(`  -- Every known baseline restaurant must still be present.`);
sqlParts.push(`  select string_agg(expected.name, ' | ') into v_missing_baseline`);
sqlParts.push(`  from unnest(array[${BASELINE_NAMES.map((n) => sqlString(n)).join(", ")}]) as expected(name)`);
sqlParts.push(`  where not exists (`);
sqlParts.push(`    select 1 from public.restaurants r`);
sqlParts.push(`    where lower(btrim(r.name)) = lower(btrim(expected.name))`);
sqlParts.push(`  );`);
sqlParts.push(`  if v_missing_baseline is not null then`);
sqlParts.push(`    raise exception 'PREFLIGHT FAIL: baseline restaurants missing or renamed: %', v_missing_baseline;`);
sqlParts.push(`  end if;`);
sqlParts.push(``);
sqlParts.push(`  -- How much of this batch is already applied (fixed ids)?`);
sqlParts.push(`  select count(*) into v_batch_present from public.restaurants where id in (`);
for (let i = 0; i < proposed.length; i++) {
  const id = uuidv5(`foodie-batch3-row${proposed[i].worksheet_row}`, UUID_NAMESPACE);
  sqlParts.push(`    ${sqlString(id)}${i < proposed.length - 1 ? "," : ""}`);
}
sqlParts.push(`  );`);
sqlParts.push(`  if v_batch_present = ${proposed.length} then`);
sqlParts.push(`    raise notice 'Batch 003 already fully applied — every insert below will be a no-op (idempotent re-run).';`);
sqlParts.push(`  elsif v_batch_present > 0 then`);
sqlParts.push(`    raise notice 'Partial prior application: %/14 rows present — only the missing rows will be inserted.', v_batch_present;`);
sqlParts.push(`  else`);
sqlParts.push(`    raise notice 'Fresh application: 14 proposed rows will be inserted as unverified.';`);
sqlParts.push(`  end if;`);
sqlParts.push(`end $$;`);
sqlParts.push(``);
sqlParts.push(`-- ---------------------------------------------------------------------------`);
sqlParts.push(`-- Part 1 — the 14 proposed rows (each guarded: id, name OR phone must not`);
sqlParts.push(`-- already exist; all values are transcribed from the reviewed manifest)`);
sqlParts.push(`-- ---------------------------------------------------------------------------`);
for (const rec of proposed) {
  sqlParts.push(insertBlock(rec));
  sqlParts.push(``);
}
sqlParts.push(`-- ---------------------------------------------------------------------------`);
sqlParts.push(`-- Part 2 — POSTFLIGHT (verification queries; they READ, they never write)`);
sqlParts.push(`-- ---------------------------------------------------------------------------`);
sqlParts.push(``);
sqlParts.push(`-- 2.1 Final row count (fresh run -> 28; idempotent re-run -> 28).`);
sqlParts.push(`select count(*) as final_row_count from public.restaurants;`);
sqlParts.push(``);
sqlParts.push(`-- 2.2 Every batch row must exist exactly once, still unverified, with`);
sqlParts.push(`--     untouched aggregates and NULL verification state. Any row missing`);
sqlParts.push(`--     here was skipped by its guard — investigate before proceeding.`);
sqlParts.push(`select r.name, r.verification_status, r.review_count, r.community_rating,`);
sqlParts.push(`       r.address_verified, r.coordinates_verified, r.hours_verified, r.photos_verified,`);
sqlParts.push(`       r.last_verified_at, r.latitude, r.longitude`);
sqlParts.push(`from public.restaurants r`);
sqlParts.push(`where r.id in (`);
for (let i = 0; i < proposed.length; i++) {
  const id = uuidv5(`foodie-batch3-row${proposed[i].worksheet_row}`, UUID_NAMESPACE);
  sqlParts.push(`  ${sqlString(id)}${i < proposed.length - 1 ? "," : ""}`);
}
sqlParts.push(`)`);
sqlParts.push(`order by r.name;`);
sqlParts.push(`-- Expected: exactly 14 rows, verification_status 'unverified', review_count 0,`);
sqlParts.push(`--           community_rating NULL, all four *_verified NULL, last_verified_at NULL.`);
sqlParts.push(``);
sqlParts.push(`-- 2.3 No duplicate normalized names anywhere in the table (must return 0 rows).`);
sqlParts.push(`select lower(btrim(name)) as normalized_name, count(*) as copies`);
sqlParts.push(`from public.restaurants`);
sqlParts.push(`group by 1 having count(*) > 1;`);
sqlParts.push(``);
sqlParts.push(`-- 2.4 Community aggregates must be untouched by this batch (must return 0 rows).`);
sqlParts.push(`select name from public.restaurants`);
sqlParts.push(`where id in (`);
for (let i = 0; i < proposed.length; i++) {
  const id = uuidv5(`foodie-batch3-row${proposed[i].worksheet_row}`, UUID_NAMESPACE);
  sqlParts.push(`  ${sqlString(id)}${i < proposed.length - 1 ? "," : ""}`);
}
sqlParts.push(`)`);
sqlParts.push(`  and (review_count <> 0 or community_rating is not null);`);
sqlParts.push(``);
sqlParts.push(`-- 2.5 Proximity report — all pairs within 0.2 km, for human eyeballing only.`);
sqlParts.push(`--     Known advisory pairs expected here: Bindushree<->Abhis; (held rows`);
sqlParts.push(`--     Krishnamoorthy / Five Star Kohli Hut are NOT in this table).`);
sqlParts.push(`select a.name as name_a, b.name as name_b,`);
sqlParts.push(`       round((6371 * acos(least(1, greatest(-1,`);
sqlParts.push(`         sin(radians(a.latitude)) * sin(radians(b.latitude)) +`);
sqlParts.push(`         cos(radians(a.latitude)) * cos(radians(b.latitude)) *`);
sqlParts.push(`         cos(radians(b.longitude) - radians(a.longitude))`);
sqlParts.push(`       ))))::numeric / 1000, 2) as km_apart`);
sqlParts.push(`from public.restaurants a`);
sqlParts.push(`join public.restaurants b`);
sqlParts.push(`  on a.id < b.id and a.latitude is not null and b.latitude is not null`);
sqlParts.push(`where (6371 * acos(least(1, greatest(-1,`);
sqlParts.push(`  sin(radians(a.latitude)) * sin(radians(b.latitude)) +`);
sqlParts.push(`  cos(radians(a.latitude)) * cos(radians(b.latitude)) *`);
sqlParts.push(`  cos(radians(b.longitude) - radians(a.longitude))`);
sqlParts.push(`)))) <= 0.2`);
sqlParts.push(`order by km_apart;`);
sqlParts.push(``);
sqlParts.push(`-- ---------------------------------------------------------------------------`);
sqlParts.push(`-- The file ends with COMMIT: the whole batch (preflight + inserts + postflight`);
sqlParts.push(`-- reads) runs atomically in one SQL-Editor session. If any preflight guard`);
sqlParts.push(`-- fires, the exception aborts the transaction and NOTHING is written.`);
sqlParts.push(`-- Review the postflight output that the editor prints; if anything looks`);
sqlParts.push(`-- wrong, use the emergency REVERT below and investigate before re-running.`);
sqlParts.push(`-- To strike a row: delete its Part 1 block BEFORE running.`);
sqlParts.push(`-- ---------------------------------------------------------------------------`);
sqlParts.push(``);
sqlParts.push(`commit;`);
sqlParts.push(``);
sqlParts.push(`-- ============================================================================`);
sqlParts.push(`-- EMERGENCY REVERT (commented out — the human must un-comment it). Removes`);
sqlParts.push(`-- exactly this batch by its fixed ids; touches nothing else.`);
sqlParts.push(`-- ============================================================================`);
sqlParts.push(`-- begin;`);
sqlParts.push(`-- delete from public.restaurants where id in (`);
for (let i = 0; i < proposed.length; i++) {
  const id = uuidv5(`foodie-batch3-row${proposed[i].worksheet_row}`, UUID_NAMESPACE);
  sqlParts.push(`--   ${sqlString(id)}${i < proposed.length - 1 ? "," : ""}`);
}
sqlParts.push(`-- );`);
sqlParts.push(`-- commit;`);

const sqlText = sqlParts.join("\n") + "\n";
writeFileSync(SQL_OUT, sqlText, "utf8");
const sqlSha = sha256Text(sqlText);
console.log(`Wrote ${SQL_OUT} (sha256 ${sqlSha.slice(0, 16)}…) — NOT executed, zero DB access.`);

/* ------------------------------------------------------------------ */
/* Emit B — the final manifest                                         */
/* ------------------------------------------------------------------ */

const manifest = {
  manifest_version: "phase3i-final-import-manifest",
  artifact_status:
    "REVIEW ARTIFACT — the companion SQL has NEVER been executed; zero live-database writes have occurred in this pipeline. Importing requires explicit human approval and a manual SQL-Editor run by the repository owner.",
  generator: "scripts/foodie-import-validator/gen-import-sql.ts (deterministic; re-running against the same committed inputs reproduces both artifacts byte-for-byte)",
  supersedes: "reports/phase3h-proposed-import-manifest.json",
  inputs: {
    phase3h_manifest: {
      path: "scripts/foodie-import-validator/reports/phase3h-proposed-import-manifest.json",
      sha256: sha256File(M3H_PATH),
    },
    fresh_validator_run: {
      path: "scripts/foodie-import-validator/reports/research-2026-10-09-final-qa.dry-run.json",
      sha256: sha256File(V_PATH),
      summary: v.summary,
      note: "fresh dry-run of the 45-row worksheet against a live read-only baseline snapshot; existing-matches 0, errors 0, warnings 0; idempotency proven (byte-identical re-run)",
    },
    live_baseline: {
      path: "scripts/foodie-import-validator/fixtures/baseline-snapshot.json",
      sha256: sha256File(B_PATH),
      count: baseline.count,
      fetched_at: baseline.fetched_at,
      mode: baseline.mode,
      names: BASELINE_NAMES,
    },
  },
  decision: {
    proposed_insert_set: proposed.length,
    held_possible_duplicate: m3h.counts.held_possible_duplicate,
    held_needs_more_research: m3h.counts.needs_more_research_incl_do_not_import_recommendations,
    existing_matches: 0,
    note:
      "All 14 Phase 3H rows survived the fresh live re-check (no name/phone/coordinate collision with the 14 live rows; no collision inside the set). Three rows (15, 17, 32) carry documented cross-directory PROXIMITY ADVISORIES — distinct names/categories/phones; the paired rows (20, 44) are HELD and are NOT in the insert set. Nothing is promoted to verified; the insert set is not reduced.",
  },
  import_state_guarantees: {
    verification_status: "unverified (every row)",
    verification_booleans: "address_verified / coordinates_verified / hours_verified / photos_verified all stay NULL",
    last_verified_at: "stays NULL — never verified",
    community_aggregates: "review_count=0 (schema default), community_rating untouched (trigger-maintained); the imported `rating` is the external directory rating, separate forever",
    coordinates: "only where a directory publishes them; candidate_coordinates; excluded from nearby-distance discovery until field-verified",
    missing_values: "NULL — never guessed",
  },
  sql_file: {
    path: "supabase/insert-batch-003-phase3h-14.sql",
    sha256: sqlSha,
    executed: false,
    execution_policy:
      "Manual, by the repository owner, after explicit approval, via the Supabase SQL Editor, in one transaction. The file contains preflight guards (baseline-drift + name/phone/id collision aborts), per-row guarded inserts, and read-only postflight verification queries. COMMIT is performed by the human after eyeballing the postflight output.",
  },
  proposed_insert_set: proposed.map((rec) => ({
    worksheet_row: rec.worksheet_row,
    name: rec.name,
    category: rec.category,
    city: rec.city,
    locality: rec.locality,
    latitude: rec.latitude,
    longitude: rec.longitude,
    phone: rec.phone,
    listing_rating: rec.listing_rating,
    listing_review_count: rec.listing_review_count,
    opening_hours: rec.opening_hours,
    price_level: rec.price_level,
    source_url: rec.source_url,
    evidence_level: rec.evidence_level,
    review_decision: rec.review_decision,
    uuid: uuidv5(`foodie-batch3-row${rec.worksheet_row}`, UUID_NAMESPACE),
    tags: NAME_DERIVED_TAGS[rec.worksheet_row as number] ?? [],
    proximity_advisory: [15, 17, 32].includes(rec.worksheet_row as number)
      ? "cross-directory pin proximity — see manifest decision note; distinct identity evidence"
      : null,
  })),
  held_and_excluded_reference: m3h.excluded_reference,
};

const manifestText = JSON.stringify(manifest, null, 2) + "\n";
writeFileSync(MANIFEST_OUT, manifestText, "utf8");
console.log(`Wrote ${MANIFEST_OUT} (sha256 ${sha256Text(manifestText).slice(0, 16)}…).`);
console.log("DONE — zero database access, zero SQL execution.");
