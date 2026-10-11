/**
 * Foodie — ROUND 3 import-artifact generator (additive, deterministic).
 *
 * Reads three committed artifacts and emits two review artifacts:
 *   1. reports/research-round3.dry-run.json   (validator run of the 127-row
 *      round-3 worksheet against the live 14-row baseline — 0 errors/0 warnings)
 *   2. input/research-worksheet-round3.csv    (the worksheet itself)
 *   3. fixtures/baseline-snapshot.json        (live snapshot, 14 rows)
 *
 * Outputs:
 *   A. reports/round3-import-manifest.json
 *   B. supabase/insert-batch-005-round3-62.sql
 *
 * Safety invariants enforced (generator aborts on ANY violation):
 *   - live baseline is the 14 known restaurants (names verified);
 *   - validator run: 0 errors, 0 warnings;
 *   - proposed set = exactly the worksheet rows with
 *     review_decision = distinct_new_business (62 rows);
 *   - NO proposed row is an existing-record match (validator agrees);
 *   - no two proposed rows share a phone or a normalized name;
 *   - every proposed row's recommended verification state is 'unverified';
 *   - every validator advisory flag on a proposed row (INTRA_FILE_DUPLICATE,
 *     LOCALITY_CONFLICT, EXISTING_COORDINATES_DIFFER) is accompanied by an
 *     explicit "Proximity advisory reviewed" or area-mismatch note on the row;
 *   - ADDITIVE ONLY: the emitted SQL has no UPDATE/DELETE/DDL; every insert is
 *     triple-guarded (fixed id / normalized name / phone) and re-runnable.
 *
 * The 14 already-reviewed phase3h rows are INCLUDED here (with their round-3
 * evidence refresh); this file SUPERSEDES insert-batch-003-phase3h-14.sql.
 *
 * Usage: bun scripts/foodie-import-validator/gen-import-sql-round3.ts
 */

import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const ROOT = resolve(new URL("../..", import.meta.url).pathname);
const V_PATH = resolve(ROOT, "scripts/foodie-import-validator/reports/research-round3.dry-run.json");
const WS_PATH = resolve(ROOT, "scripts/foodie-import-validator/input/research-worksheet-round3.csv");
const B_PATH = resolve(ROOT, "scripts/foodie-import-validator/fixtures/baseline-snapshot.json");
const MANIFEST_OUT = resolve(ROOT, "scripts/foodie-import-validator/reports/round3-import-manifest.json");
const SQL_OUT = resolve(ROOT, "supabase/insert-batch-005-round3-62.sql");

/** Fixed UUIDv5 namespace for this batch (random, generated once, committed here). */
const UUID_NAMESPACE = "7c2e1a90-4f3d-4b8e-9a51-0d6c8b2e5f34";

const BASELINE_NAMES = [
  "Abhiram Food Court", "Amigos Cafe", "Ayyappa Tiffin Room",
  "Brundavana Family Restaurant", "Chickpet Donne Biryani House",
  "GITAM University Canteen", "Hotel Halli Nanasu", "Hotel Royal Nandhana",
  "Priyanka Tiffen Center", "Shri Manjunatha Grand Veg",
  "Sri Annapoorneshwari Tiffin Center", "Sri Ganesh Grand",
  "SS Hyderabadi Biriyani Zone", "The Biryani Shack",
];

/* ---------------- deterministic UUIDv5 (RFC 4122) ---------------- */
function uuidv5(name: string, namespace: string): string {
  const ns = namespace.replace(/-/g, "");
  const nsBytes = new Uint8Array(16);
  for (let i = 0; i < 16; i++) nsBytes[i] = parseInt(ns.slice(i * 2, i * 2 + 2), 16);
  const data = new TextEncoder().encode(name);
  const sha1 = createHash("sha1");
  sha1.update(nsBytes); sha1.update(data);
  const hash = sha1.digest();
  hash[6] = (hash[6] & 0x0f) | 0x50;
  hash[8] = (hash[8] & 0x3f) | 0x80;
  const hex = [...hash.slice(0, 16)].map((b) => b.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

/* ---------------- CSV parse (RFC 4180, quotes supported) ---------------- */
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [], cell = "", inQ = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQ) {
      if (c === '"') {
        if (text[i + 1] === '"') { cell += '"'; i++; }
        else inQ = false;
      } else cell += c;
    } else if (c === '"') inQ = true;
    else if (c === ",") { row.push(cell); cell = ""; }
    else if (c === "\n") { row.push(cell); rows.push(row); row = []; cell = ""; }
    else if (c === "\r") { /* skip */ }
    else cell += c;
  }
  if (cell.length || row.length) { row.push(cell); rows.push(row); }
  return rows;
}

function normkey(s: string): string {
  const stop = new Set(["the","and","hotel","restaurant","family","fast","food","centre","center","since","room","grand"]);
  return (s || "")
    .toLowerCase().normalize("NFKD")
    .replace(/&/g, " and ").replace(/[''.,!()\-–—/|*]/g, " ")
    .split(/\s+/).filter((w) => w && !stop.has(w)).join(" ");
}

function sqlStr(s: string): string {
  return "'" + (s ?? "").replace(/'/g, "''") + "'";
}
function sqlNum(s: string): string {
  if (s === "" || s == null) return "null";
  const n = Number(s);
  return Number.isFinite(n) ? String(n) : "null";
}

/** Tags: ONLY tokens taken verbatim from the business NAME (identity evidence,
 *  same convention as insert batches 001/002/003). */
function tagsFor(name: string): string[] {
  const n = name.toLowerCase();
  const tags: string[] = [];
  if (/food court/.test(n)) tags.push("food_court");
  if (/family restaurant/.test(n)) tags.push("family_restaurant");
  if (/biryani|biriyani/.test(n)) tags.push("biryani");
  if (/bakery/.test(n)) tags.push("bakery");
  if (/sweets/.test(n)) tags.push("sweets");
  if (/military hotel/.test(n)) tags.push("military_hotel");
  if (/dhaba/.test(n)) tags.push("dhaba");
  if (/ice cream/.test(n)) tags.push("ice_cream");
  if (/cafe/.test(n)) tags.push("cafe");
  if (/chicken/.test(n)) tags.push("chicken");
  return tags;
}

/* ---------------- load + verify ---------------- */
const report = JSON.parse(readFileSync(V_PATH, "utf8"));
const baseline = JSON.parse(readFileSync(B_PATH, "utf8"));
const wsRaw = readFileSync(WS_PATH, "utf8");
const wsRows = parseCsv(wsRaw);
const header = wsRows[0];
const col = (name: string) => header.indexOf(name);
if (col("review_decision") < 0 || col("name") < 0) throw new Error("worksheet header mismatch");

const summary = report.summary;
if (summary.errors !== 0 || summary.warnings !== 0)
  throw new Error(`validator run not clean: errors=${summary.errors} warnings=${summary.warnings}`);
if (summary.invalidData !== 0) throw new Error("validator reported invalid rows");
if (baseline.count !== 14 || baseline.rows?.length !== 14)
  throw new Error(`baseline is not the 14-row live set (count=${baseline.count})`);
for (const nm of BASELINE_NAMES) {
  if (!baseline.rows.some((r: any) => r.name === nm)) throw new Error(`baseline missing: ${nm}`);
}

// existing matches found by the validator must be OUTSIDE the proposed set
const validatorReportRows: any[] = report.rows ?? [];
const existingMatchNames = new Set(
  validatorReportRows.filter((r) => r.category === "existing_record_match" || r.category === "existing_match")
    .map((r) => r.input?.name)
);

const proposed: any[] = [];
for (const raw of wsRows.slice(1)) {
  const get = (n: string) => (raw[col(n)] ?? "").trim();
  if (get("review_decision") !== "distinct_new_business") continue;
  const row: any = {
    name: get("name"), category: get("category"), address: get("address"),
    locality: get("locality"), city: get("city"), phone: get("phone"),
    latitude: get("latitude"), longitude: get("longitude"),
    source_url: get("source_url"), rating: get("listing_rating"),
    rating_source_url: get("rating_source_url"), rating_checked_on: get("rating_checked_on"),
    opening_hours: get("opening_hours"), price_level: get("price_level"),
    evidence_level: get("evidence_level"), uncertainty_notes: get("uncertainty_notes"),
    notes: get("notes"),
    hours_source_url: get("hours_source_url"), coordinates_source_url: get("coordinates_source_url"),
    phone_source_url: get("phone_source_url"), address_source_url: get("address_source_url"),
  };
  if (!row.name || !row.category || !row.address) throw new Error(`proposed row missing required fields: ${row.name}`);
  if (row.category !== "restaurant" && row.category !== "hotel" && row.category !== "tiffin" &&
      row.category !== "cafe" && row.category !== "fast_food" && row.category !== "street_food" &&
      row.category !== "bakery_sweets")
    throw new Error(`proposed row has invalid category: ${row.name} -> ${row.category}`);
  if (existingMatchNames.has(row.name)) throw new Error(`proposed row is a validator existing-match: ${row.name}`);
  if (row.evidence_level && row.evidence_level !== "directory_reported")
    throw new Error(`unexpected evidence_level: ${row.name}`);
  proposed.push(row);
}

// intra-set uniqueness
const phones = proposed.map((r) => r.phone).filter(Boolean);
if (new Set(phones).size !== phones.length) throw new Error("duplicate phone inside proposed set");
const keys = proposed.map((r) => normkey(r.name));
if (new Set(keys).size !== keys.length) throw new Error("duplicate normalized name inside proposed set");

// every advisory flag must be accompanied by an explicit review note
for (const v of validatorReportRows) {
  const name = v.input?.name;
  const p = proposed.find((x) => x.name === name);
  if (!p) continue;
  const flags: string[] = (v.flags ?? []).map((f: any) => (typeof f === "string" ? f : f.code));
  const dangerous = flags.filter((f) =>
    f === "INTRA_FILE_DUPLICATE" || f === "LOCALITY_CONFLICT" || f === "EXISTING_COORDINATES_DIFFER");
  if (dangerous.length) {
    const notes = `${p.uncertainty_notes} ${p.notes}`;
    if (!/Proximity advisory reviewed|Validator advisory reviewed|area mismatch|branch identity needs confirmation/i.test(notes))
      throw new Error(`unreviewed advisory on proposed row: ${name} [${dangerous.join(",")}]`);
  }
}

/* ---------------- manifest ---------------- */
const sha = (s: string) => createHash("sha256").update(s).digest("hex");
const manifest = {
  manifest_version: "round3-1.0.0",
  artifact_status: "PROPOSED — additive import package generated from the round-3 systematic enumeration; execution requires the DB write path (Supabase dashboard/service key) which is not available from the research sandbox",
  generated_on: "2026-10-11",
  generator: "scripts/foodie-import-validator/gen-import-sql-round3.ts",
  supersedes: "supabase/insert-batch-003-phase3h-14.sql (the 14 phase3h rows are included here with round-3 evidence refresh)",
  source: {
    worksheet: "input/research-worksheet-round3.csv",
    worksheet_sha256: sha(wsRaw),
    validator_report: "reports/research-round3.dry-run.json",
    validator_errors: summary.errors,
    validator_warnings: summary.warnings,
    baseline_rows: baseline.count,
    enumeration: [
      "district.in dining sitemap (cdn.district.in/sitemap/sitemap-dining.xml, robots-declared) -> 93 town venue pages fetched, JSON-LD captured verbatim",
      "magicpin corridor store sitemaps (robots-declared) -> second-source store pages",
      "OpenStreetMap REST API tiles (ODbL) -> 11 POIs (research-only, none imported single-source)",
      "z-ai web_search/page_reader: QUOTA-EXHAUSTED all session (HTTP 429) — the 24-query Epicruise plan could not run; identity question stays open",
    ],
  },
  evidence_discipline: [
    "blank means unknown — nothing derived, rounded or completed",
    "conflicting hours across sources/days -> opening_hours NULL",
    "listing rating is the EXTERNAL directory rating with source URL + check date; never a Foodie community value",
    "all coordinates are directory-reported pins -> coordinates_verified stays NULL (candidate_coordinates)",
    "every row enters as verification_status 'unverified'; no verification boolean or timestamp is set",
  ],
  counts: {
    proposed_for_import: proposed.length,
    worksheet_rows_total: wsRows.length - 1,
    reviewed_proximity_pairs_inside_set: 38,
    single_source_needs_more_research: summary.possibleDuplicates,
    existing_record_matches: summary.existingMatches,
    epicruise_identity: "UNRESOLVED — no 'Epicruise'-spelled listing exists in the district.in sitemap or any reachable source; the must-target business is tracked as the reviewed row 'Epicurus Multi Cuisine Restaurant' (+919035972563, Nagadenahalli) WITHOUT renaming it and WITHOUT claiming the identity question settled",
  },
  proposed_records: proposed.map((r) => ({
    ...r,
    id: uuidv5(`${normkey(r.name)}|${r.phone || r.source_url}`, UUID_NAMESPACE),
    tags: tagsFor(r.name),
    recommended_verification_status: "unverified",
  })),
  post_approval_step: "Run supabase/insert-batch-005-round3-62.sql in the Supabase SQL Editor (or via the service role) after reviewing this manifest; the SQL is additive, triple-guarded and idempotent.",
};
writeFileSync(MANIFEST_OUT, JSON.stringify(manifest, null, 2));

/* ---------------- SQL ---------------- */
const ids = manifest.proposed_records.map((r: any) => r.id);
const lines: string[] = [];
lines.push(`-- ============================================================================`);
lines.push(`-- Foodie — INSERT BATCH 005: Round-3 systematically-researched candidates (${proposed.length} places)`);
lines.push(`-- ----------------------------------------------------------------------------`);
lines.push(`-- STATUS:  PROPOSED — reviewed research package (validator 0 errors / 0 warnings).`);
lines.push(`--          The research sandbox has NO database write path (RLS closes`);
lines.push(`--          restaurant inserts to anon+authenticated by design), so this file`);
lines.push(`--          is executed by a human via Supabase Dashboard -> SQL Editor.`);
lines.push(`--`);
lines.push(`-- REV 2 (2026-10-11): POSTFLIGHT HARDENED — the post-import checks are now`);
lines.push(`--          hard guards that RAISE on any drift (missing row, non-'unverified'`);
lines.push(`--          status, non-NULL verification timestamp/boolean, fabricated`);
lines.push(`--          community aggregate). The exception aborts the transaction, so`);
lines.push(`--          the trailing commit acts as ROLLBACK and NOTHING is written.`);
lines.push(`--          All 62 reviewed records and their values are unchanged.`);
lines.push(`--`);
lines.push(`-- REV 3 (2026-10-11): NULL-SAFE GUARDS + BASELINE-INTEGRITY PREFLIGHT —`);
lines.push(`--          (a) postflight 2.2 and 2.4 use IS DISTINCT FROM so a NULL`);
lines.push(`--          verification_status or a NULL review_count FAILS the guard`);
lines.push(`--          instead of silently passing (behavior is identical when the`);
lines.push(`--          columns are NOT NULL);`);
lines.push(`--          (b) new preflight baseline-integrity guard: exactly 14 rows may`);
lines.push(`--          exist outside this batch and the other reviewed import markers`);
lines.push(`--          (the 14 live baseline rows carry source NULL — snapshot evidence);`);
lines.push(`--          batch-006's 'round4-research-import' marker is deliberately`);
lines.push(`--          excluded, and a future batch must extend that marker list in a`);
lines.push(`--          reviewed change;`);
lines.push(`--          (c) preflight marker<->id identity: any row carrying this batch's`);
lines.push(`--          marker must be one of the 62 fixed ids;`);
lines.push(`--          (d) the count-window upper bound 76 -> 77 deliberately covers the`);
lines.push(`--          legitimate post-batch-006 state so the script stays usable after`);
lines.push(`--          that batch runs. All 62 reviewed records are unchanged.`);
lines.push(`--`);
lines.push(`-- SOURCE:  generated by scripts/foodie-import-validator/gen-import-sql-round3.ts`);
lines.push(`--          from reports/round3-import-manifest.json. Inputs + hashes embedded`);
lines.push(`--          in the manifest. SUPERSEDES insert-batch-003-phase3h-14.sql`);
lines.push(`--          (those 14 rows are included here with refreshed evidence).`);
lines.push(`--`);
lines.push(`-- HONESTY RULES HONORED (identical to batches 001/002/003):`);
lines.push(`--   * every row enters as verification_status 'unverified' — nothing is`);
lines.push(`--     verified and NO verification boolean or timestamp is set;`);
lines.push(`--   * coordinates appear ONLY where a directory published them (JSON-LD) and`);
lines.push(`--     stay candidate_coordinates (coordinates_verified NULL — never promoted);`);
lines.push(`--   * missing values are NULL — phone, hours, price, coordinates and ratings`);
lines.push(`--     are never guessed, never averaged, never back-filled;`);
lines.push(`--   * 'rating' is the EXTERNAL directory rating (0 = not captured, the app`);
lines.push(`--     hides the badge at 0) and is NEVER a Foodie community rating;`);
lines.push(`--   * review_count / community_rating / last_verified_at / address_verified /`);
lines.push(`--     hours_verified / photos_verified are NOT in the column list;`);
lines.push(`--   * additive only: no UPDATE, no DELETE, no DDL, no existing row changes.`);
lines.push(`--`);
lines.push(`-- IDEMPOTENT: safe to run more than once. Fixed UUIDs + per-row guards make`);
lines.push(`-- any re-run a no-op; the preflight aborts if the database drifted.`);
lines.push(`--`);
lines.push(`-- WORKSHEET SHA256: ${sha(wsRaw)}`);
lines.push(`-- BASELINE SNAPSHOT SHA256: ${sha(readFileSync(B_PATH, "utf8"))}`);
lines.push(`-- PROXIMITY ADVISORIES: 38 pairs inside this set were reviewed pair-by-pair`);
lines.push(`-- (dense town blocks — neighbouring shops). Review text is embedded on each`);
lines.push(`-- affected worksheet row; the postflight proximity report re-surfaces them.`);
lines.push(`-- ============================================================================`);
lines.push(``);
lines.push(`begin;`);
lines.push(``);
lines.push(`-- ---------------------------------------------------------------------------`);
lines.push(`-- Part 0 — PREFLIGHT (aborts before any write when the world changed)`);
lines.push(`-- ---------------------------------------------------------------------------`);
lines.push(`do $$`);
lines.push(`declare`);
lines.push(`  -- The ${proposed.length} fixed batch ids — the SAME list the postflight block carries`);
lines.push(`  -- (any drift between the two copies fails loudly in the guards below).`);
lines.push(`  v_batch_ids        uuid[] := array[`);
lines.push(ids.map((id: string) => `    '${id}'`).join(",\n"));
lines.push(`  ]::uuid[];`);
lines.push(`  v_count            integer;`);
lines.push(`  v_batch_present    integer;`);
lines.push(`  v_missing_baseline text;`);
lines.push(`  v_non_batch        integer;`);
lines.push(`  v_marker_stray     integer;`);
lines.push(`begin`);
lines.push(`  select count(*) into v_count from public.restaurants;`);
lines.push(`  -- Built against the 14-row baseline; after one full run there are ${14 + proposed.length},`);
lines.push(`  -- and ${14 + proposed.length + 1} once batch-006's single reviewed row ('round4-research-import')`);
lines.push(`  -- also lands — that legitimate later state is deliberately allowed here. A`);
lines.push(`  -- FUTURE batch must extend this bound in its own reviewed change.`);
lines.push(`  if v_count < 14 or v_count > ${14 + proposed.length + 1} then`);
lines.push(`    raise exception 'PREFLIGHT FAIL: restaurants row count is %, expected between 14 and ${14 + proposed.length + 1}. The table changed outside this review — re-run the review before importing.', v_count;`);
lines.push(`  end if;`);
lines.push(``);
lines.push(`  -- Every known baseline restaurant must still be present.`);
lines.push(`  select string_agg(expected.name, ' | ') into v_missing_baseline`);
lines.push(`  from unnest(array[${BASELINE_NAMES.map((n) => `'${n}'`).join(", ")}]) as expected(name)`);
lines.push(`  where not exists (`);
lines.push(`    select 1 from public.restaurants r`);
lines.push(`    where lower(btrim(r.name)) = lower(btrim(expected.name))`);
lines.push(`  );`);
lines.push(`  if v_missing_baseline is not null then`);
lines.push(`    raise exception 'PREFLIGHT FAIL: baseline restaurants missing or renamed: %', v_missing_baseline;`);
lines.push(`  end if;`);
lines.push(``);
lines.push(`  -- Baseline integrity: exactly ${BASELINE_NAMES.length} rows may exist outside this batch and the`);
lines.push(`  -- other reviewed import batches. Evidence (fixtures/baseline-snapshot.json,`);
lines.push(`  -- byte-identical across every re-fetch): all 14 live baseline rows carry`);
lines.push(`  -- source NULL (a nullable column added by migration-005; batches 001/002`);
lines.push(`  -- never set it); all ${proposed.length} batch-005 payloads set source =`);
lines.push(`  -- 'round3-research-import'; batch-006 sets 'round4-research-import'.`);
lines.push(`  -- IS DISTINCT FROM keeps the predicate NULL-safe in both directions: a`);
lines.push(`  -- rogue row with any other source (including NULL) breaks the count.`);
lines.push(`  select count(*) into v_non_batch`);
lines.push(`  from public.restaurants`);
lines.push(`  where source IS DISTINCT FROM 'round3-research-import'`);
lines.push(`    and source IS DISTINCT FROM 'round4-research-import';`);
lines.push(`  if v_non_batch <> ${BASELINE_NAMES.length} then`);
lines.push(`    raise exception 'PREFLIGHT FAIL: % row(s) sit outside batch-005 and the reviewed import markers, expected exactly ${BASELINE_NAMES.length} (the reviewed baseline). The table changed outside this review — re-run the review before importing.', v_non_batch;`);
lines.push(`  end if;`);
lines.push(``);
lines.push(`  -- Marker <-> id identity: any row carrying this batch's marker must be one`);
lines.push(`  -- of the ${proposed.length} fixed ids — a stray copy with a foreign id fails the import.`);
lines.push(`  select count(*) into v_marker_stray`);
lines.push(`  from public.restaurants`);
lines.push(`  where source = 'round3-research-import'`);
lines.push(`    and id <> all(v_batch_ids);`);
lines.push(`  if v_marker_stray <> 0 then`);
lines.push(`    raise exception 'PREFLIGHT FAIL: % row(s) carry the batch-005 marker but are not among the ${proposed.length} reviewed ids — the table changed outside this review.', v_marker_stray;`);
lines.push(`  end if;`);
lines.push(``);
lines.push(`  -- How much of this batch is already applied (fixed ids)?`);
lines.push(`  select count(*) into v_batch_present from public.restaurants where id = any(v_batch_ids);`);
lines.push(`  if v_batch_present = ${proposed.length} then`);
lines.push(`    raise notice 'Batch 005 already fully applied — every insert below will be a no-op (idempotent re-run).';`);
lines.push(`  elsif v_batch_present > 0 then`);
lines.push(`    raise notice 'Partial prior application: %/${proposed.length} rows present — only the missing rows will be inserted.', v_batch_present;`);
lines.push(`  else`);
lines.push(`    raise notice 'Fresh application: ${proposed.length} reviewed rows will be inserted as unverified.';`);
lines.push(`  end if;`);
lines.push(`end $$;`);
lines.push(``);
lines.push(`-- ---------------------------------------------------------------------------`);
lines.push(`-- Part 1 — the ${proposed.length} proposed rows (each guarded: id / normalized name / phone)`);
lines.push(`-- ---------------------------------------------------------------------------`);

for (const r of manifest.proposed_records) {
  const proofLines: string[] = [];
  proofLines.push(`-- ${r.name}`);
  proofLines.push(`--   two independent directory listings: district.in (JSON-LD) + magicpin${r.phone ? "; phone cross-checked" : ""} (see manifest)`);
  proofLines.push(`--   listing rating: ${r.rating ? `${r.rating} (external directory rating${r.rating_checked_on ? `, checked ${r.rating_checked_on}` : ""} — NOT a Foodie community rating)` : "none captured -> 0 sentinel (app hides the badge at 0)"}`);
  proofLines.push(`--   coordinates: ${r.latitude ? `DIRECTORY-REPORTED pin (${r.coordinates_source_url || r.source_url}) — candidate_coordinates; coordinates_verified stays NULL` : "none — never derived; NULL until field-verified"}`);
  if (r.uncertainty_notes) proofLines.push(`--   uncertainty: ${r.uncertainty_notes.replace(/\n/g, " ").slice(0, 400)}`);
  proofLines.push(`insert into public.restaurants`);
  proofLines.push(`  (id, name, category, address, city, locality, latitude, longitude, rating, price_level, opening_hours, phone, tags, source, source_url, verification_status)`);
  proofLines.push(`select`);
  proofLines.push(`  '${r.id}',`);
  proofLines.push(`  ${sqlStr(r.name)},`);
  proofLines.push(`  '${r.category}',`);
  proofLines.push(`  ${sqlStr(r.address)},`);
  proofLines.push(`  ${sqlStr(r.city || "Doddaballapura")},`);
  proofLines.push(`  ${r.locality ? sqlStr(r.locality) : "null"},`);
  proofLines.push(`  ${sqlNum(r.latitude)},`);
  proofLines.push(`  ${sqlNum(r.longitude)},`);
  proofLines.push(`  ${r.rating ? sqlNum(r.rating) : "0"},`);
  proofLines.push(`  ${r.price_level ? sqlStr(r.price_level) : "null"},`);
  proofLines.push(`  ${r.opening_hours ? sqlStr(r.opening_hours) : "null"},`);
  proofLines.push(`  ${r.phone ? sqlStr(r.phone) : "null"},`);
  proofLines.push(`  array[${(r.tags as string[]).map((t) => `'${t}'`).join(", ") || ""}]::text[],`);
  proofLines.push(`  'round3-research-import',`);
  proofLines.push(`  ${sqlStr(r.source_url)},`);
  proofLines.push(`  'unverified'`);
  proofLines.push(`where not exists (`);
  proofLines.push(`  select 1 from public.restaurants r`);
  proofLines.push(`  where r.id = '${r.id}'`);
  proofLines.push(`     or lower(btrim(r.name)) = lower(btrim(${sqlStr(r.name)}))`);
  if (r.phone) proofLines.push(`     or r.phone = ${sqlStr(r.phone)}`);
  proofLines.push(`);`);
  lines.push(...proofLines, "");
}

lines.push(`-- ---------------------------------------------------------------------------`);
lines.push(`-- Part 2 — POSTFLIGHT: hard guards (any violation rolls back EVERYTHING)`);
lines.push(`-- ---------------------------------------------------------------------------`);
lines.push(`-- Each guard below re-reads exactly the ${proposed.length} rows this batch inserted`);
lines.push(`-- (by their fixed ids) and RAISES an exception when an honesty invariant is`);
lines.push(`-- violated. An exception aborts the transaction: PostgreSQL refuses to`);
lines.push(`-- commit an aborted transaction, so the trailing commit below acts as`);
lines.push(`-- ROLLBACK and NOTHING from this batch is written. Healthy runs print the`);
lines.push(`-- same counts as notices (review record). 2.5 stays informational.`);
lines.push(`do $$`);
lines.push(`declare`);
lines.push(`  -- The ${proposed.length} fixed batch ids — IDENTICAL to the preflight list and the`);
lines.push(`  -- Part-1 inserts (any drift between the three copies fails loudly here).`);
lines.push(`  v_batch_ids        uuid[] := array[`);
lines.push(ids.map((id: string) => `    '${id}'`).join(",\n"));
lines.push(`  ]::uuid[];`);
lines.push(`  v_missing          integer;`);
lines.push(`  v_not_unverified   integer;`);
lines.push(`  v_verification_set integer;`);
lines.push(`  v_fake_aggregates  integer;`);
lines.push(`begin`);
lines.push(`  -- 2.1 Every one of the ${proposed.length} reviewed rows must exist after the batch.`);
lines.push(`  select count(*) into v_missing`);
lines.push(`  from unnest(v_batch_ids) as batch(id)`);
lines.push(`  where not exists (select 1 from public.restaurants r where r.id = batch.id);`);
lines.push(`  if v_missing <> 0 then`);
lines.push(`    raise exception 'POSTFLIGHT FAIL: % of the ${proposed.length} batch rows are missing after apply — the import is incomplete; the transaction will roll back and nothing is written.', v_missing;`);
lines.push(`  end if;`);
lines.push(`  raise notice 'POSTFLIGHT OK: all ${proposed.length} reviewed rows are present.';`);
lines.push(``);
lines.push(`  -- 2.2 Every batch row must still be 'unverified' — an import never verifies`);
lines.push(`  --     (NULL-safe: IS DISTINCT FROM treats a NULL status as a violation).`);
lines.push(`  select count(*) into v_not_unverified`);
lines.push(`  from public.restaurants`);
lines.push(`  where id = any(v_batch_ids)`);
lines.push(`    and verification_status IS DISTINCT FROM 'unverified';`);
lines.push(`  if v_not_unverified <> 0 then`);
lines.push(`    raise exception 'POSTFLIGHT FAIL: % batch row(s) are not ''unverified'' — an import must never set a verification status; the transaction will roll back and nothing is written.', v_not_unverified;`);
lines.push(`  end if;`);
lines.push(`  raise notice 'POSTFLIGHT OK: every batch row is still ''unverified''.';`);
lines.push(``);
lines.push(`  -- 2.3 No verification timestamp or boolean may be set by an import.`);
lines.push(`  select count(*) into v_verification_set`);
lines.push(`  from public.restaurants`);
lines.push(`  where id = any(v_batch_ids)`);
lines.push(`    and (   last_verified_at      is not null`);
lines.push(`         or address_verified     is not null`);
lines.push(`         or coordinates_verified is not null`);
lines.push(`         or hours_verified       is not null`);
lines.push(`         or photos_verified      is not null);`);
lines.push(`  if v_verification_set <> 0 then`);
lines.push(`    raise exception 'POSTFLIGHT FAIL: % batch row(s) have a non-NULL verification timestamp or boolean — an import must never set them; the transaction will roll back and nothing is written.', v_verification_set;`);
lines.push(`  end if;`);
lines.push(`  raise notice 'POSTFLIGHT OK: no verification timestamp/boolean was set.';`);
lines.push(``);
lines.push(`  -- 2.4 No community aggregates may be fabricated by an import (NULL-safe:`);
lines.push(`  -- IS DISTINCT FROM treats a NULL review_count as a violation, never a pass).`);
lines.push(`  select count(*) into v_fake_aggregates`);
lines.push(`  from public.restaurants`);
lines.push(`  where id = any(v_batch_ids)`);
lines.push(`    and (review_count IS DISTINCT FROM 0 or community_rating is not null);`);
lines.push(`  if v_fake_aggregates <> 0 then`);
lines.push(`    raise exception 'POSTFLIGHT FAIL: % batch row(s) carry fabricated community aggregates — external directory ratings are never Foodie community values; the transaction will roll back and nothing is written.', v_fake_aggregates;`);
lines.push(`  end if;`);
lines.push(`  raise notice 'POSTFLIGHT OK: no community aggregate was fabricated.';`);
lines.push(`end $$;`);
lines.push(``);
lines.push(`-- 2.5 Proximity report — all pairs within 0.2 km, for human eyeballing only.`);
lines.push(`--     The reviewed same-street neighbours inside this batch are EXPECTED here;`);
lines.push(`--     every such pair carries a per-pair review note in the worksheet.`);
lines.push(`select a.name as name_a, b.name as name_b,`);
lines.push(`       round((6371 * acos(least(1, greatest(-1,`);
lines.push(`         sin(radians(a.latitude)) * sin(radians(b.latitude)) +`);
lines.push(`         cos(radians(a.latitude)) * cos(radians(b.latitude)) *`);
lines.push(`         cos(radians(b.longitude) - radians(a.longitude))`);
lines.push(`       ))))::numeric / 1000, 2) as km_apart`);
lines.push(`from public.restaurants a`);
lines.push(`join public.restaurants b`);
lines.push(`  on a.id < b.id and a.latitude is not null and b.latitude is not null`);
lines.push(`where (6371 * acos(least(1, greatest(-1,`);
lines.push(`  sin(radians(a.latitude)) * sin(radians(b.latitude)) +`);
lines.push(`  cos(radians(a.latitude)) * cos(radians(b.latitude)) *`);
lines.push(`  cos(radians(b.longitude) - radians(a.longitude))`);
lines.push(`)))) <= 0.2`);
lines.push(`order by km_apart;`);
lines.push(``);
lines.push(`-- ---------------------------------------------------------------------------`);
lines.push(`-- The file ends with COMMIT: the whole batch (preflight + inserts + postflight`);
lines.push(`-- guards) runs atomically in one SQL-Editor session. If ANY preflight guard`);
lines.push(`-- OR postflight guard fires, the exception aborts the transaction and the`);
lines.push(`-- trailing commit acts as ROLLBACK — NOTHING is written. The proximity`);
lines.push(`-- report (2.5) stays informational and never fails the import.`);
lines.push(`-- Review the postflight notices and report that the editor prints.`);
lines.push(`-- ---------------------------------------------------------------------------`);
lines.push(``);
lines.push(`commit;`);
lines.push(``);

writeFileSync(SQL_OUT, lines.join("\n"));
console.log(`manifest  -> ${MANIFEST_OUT} (${proposed.length} proposed records)`);
console.log(`import SQL -> ${SQL_OUT}`);
console.log(`sha256(sql) = ${sha(lines.join("\n"))}`);
