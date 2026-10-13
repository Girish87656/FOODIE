/**
 * Foodie — round 4 import-artifact generator (Part 2).
 *
 * DETERMINISTIC, ZERO-DB-ACCESS: reads committed round-4 review artifacts and
 * emits two review artifacts. No network, no Supabase, no SQL execution — the
 * generated SQL file is a labelled human-review deliverable, executed by a
 * human via the Supabase Dashboard SQL Editor (the sandbox has no DB write
 * path; RLS closes restaurant inserts to anon+authenticated by design).
 *
 * Inputs (all committed, all read-only):
 *   1. input/research-worksheet-round4.csv               (551-row round-4 worksheet)
 *   2. reports/research-2026-10-11-round4.dry-run.json   (validator run vs live baseline)
 *   3. fixtures/baseline-snapshot.json                   (live 14-row snapshot)
 *
 * Outputs (deterministic — same inputs -> byte-identical outputs):
 *   A. reports/round4-import-manifest.json
 *   B. supabase/insert-batch-006-round4-1.sql
 *
 * Safety invariants enforced before anything is emitted (generator aborts on
 * any violation):
 *   - live baseline is the 14 known restaurants (names verified);
 *   - the round-4 validator run: 0 errors, 0 warnings;
 *   - every emitted row is review_decision=distinct_new_business in the
 *     worksheet AND classified potential_new by the validator with no
 *     existing-record match;
 *   - emitted rows carry a phone or a source_url and no conflicting identity;
 *   - verification state is `unverified` for every row; verification booleans,
 *     last_verified_at, review_count and community_rating are NOT in the
 *     INSERT column list and therefore cannot be touched.
 *
 * Usage: bun scripts/foodie-import-validator/gen-import-sql-round4.ts
 */
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const ROOT = resolve(new URL("../..", import.meta.url).pathname);
const WS_PATH = resolve(ROOT, "scripts/foodie-import-validator/input/research-worksheet-round4.csv");
const V_PATH = resolve(ROOT, "scripts/foodie-import-validator/reports/research-2026-10-11-round4.dry-run.json");
const R3_MANIFEST_PATH = resolve(ROOT, "scripts/foodie-import-validator/reports/round3-import-manifest.json");
const B_PATH = resolve(ROOT, "scripts/foodie-import-validator/fixtures/baseline-snapshot.json");
const MANIFEST_OUT = resolve(ROOT, "scripts/foodie-import-validator/reports/round4-import-manifest.json");
const SQL_OUT = resolve(ROOT, "supabase/insert-batch-006-round4-1.sql");

/** Fixed UUIDv5 namespace — SAME namespace as batches 001-005. */
const UUID_NAMESPACE = "9f0c3a52-7d1e-4b6a-9c48-2e5f1a7d3b11";

const BASELINE_NAMES = [
  "Abhiram Food Court", "Amigos Cafe", "Ayyappa Tiffin Room",
  "Brundavana Family Restaurant", "Chickpet Donne Biryani House",
  "GITAM University Canteen", "Hotel Halli Nanasu", "Hotel Royal Nandhana",
  "Priyanka Tiffen Center", "Shri Manjunatha Grand Veg",
  "Sri Annapoorneshwari Tiffin Center", "Sri Ganesh Grand",
  "SS Hyderabadi Biriyani Zone", "The Biryani Shack",
];

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

const normkey = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
const sha = (s: string) => createHash("sha256").update(s).digest("hex");

/* ---------- CSV parse (RFC 4180) ---------- */
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [], cell = "", inQ = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQ) {
      if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (c === '"') inQ = false;
      else cell += c;
    } else if (c === '"') inQ = true;
    else if (c === ",") { row.push(cell); cell = ""; }
    else if (c === "\n") { row.push(cell); cell = ""; rows.push(row); row = []; }
    else if (c !== "\r") cell += c;
  }
  if (cell.length || row.length) { row.push(cell); rows.push(row); }
  return rows;
}

const raw = parseCsv(readFileSync(WS_PATH, "utf-8"));
const head = raw[0];
const rows = raw.slice(1).map((cells) => {
  const o: Record<string, string> = {};
  head.forEach((h, i) => (o[h] = (cells[i] ?? "").trim()));
  return o;
});

/* ---------- safety checks ---------- */

const baseline = JSON.parse(readFileSync(B_PATH, "utf-8"));
const baselineRows: Array<{ name: string }> =
  (Array.isArray(baseline) ? baseline : baseline.rows ?? baseline.restaurants ?? []).map((r: any) => ({ name: r.name }));
const baselineNames = baselineRows.map((r) => r.name);
for (const n of BASELINE_NAMES) {
  if (!baselineNames.includes(n)) throw new Error(`baseline drift: expected live row "${n}" is missing from the snapshot`);
}
if (baselineNames.length !== 14) throw new Error(`baseline drift: expected 14 live rows, snapshot has ${baselineNames.length}`);

const validator = JSON.parse(readFileSync(V_PATH, "utf-8"));
const vErrors = validator?.summary?.errors ?? validator?.errors ?? null;
const vWarnings = validator?.summary?.warnings ?? validator?.warnings ?? null;
if (vErrors !== 0 || vWarnings !== 0) {
  throw new Error(`round-4 validator run not clean: errors=${vErrors} warnings=${vWarnings}`);
}

// validator's existing-record matches (advisory) — none may fall inside the emit set
const validatorExisting = new Set<string>(
  (validator.matches ?? validator.existing_matches ?? []).map((m: any) => normkey(m.candidate?.name ?? m.name ?? ""))
);

// rows already covered by the REVIEWED batch-005 package are excluded — they
// are already importable via supabase/insert-batch-005-round3-62.sql with their
// own reviewed evidence; re-emitting them here would duplicate review history.
const r3Manifest = JSON.parse(readFileSync(R3_MANIFEST_PATH, "utf-8"));
const batch5Covered = new Set<string>(
  (r3Manifest.proposed_records ?? r3Manifest.proposed_insert_set ?? []).map((r: any) => normkey(r.name ?? r.worksheet_row_name ?? ""))
);
if (batch5Covered.size < 60) throw new Error(`batch-005 manifest unexpectedly small (${batch5Covered.size}) — refusing to diff against it`);

const emit = rows.filter(
  (r) => r.review_decision === "distinct_new_business" && !batch5Covered.has(normkey(r.name))
);
if (emit.length === 0) throw new Error("no distinct_new_business rows found in the round-4 worksheet");
for (const r of emit) {
  if (!r.phone && !r.source_url) throw new Error(`emit row without identity anchor: ${r.name}`);
  if (validatorExisting.has(normkey(r.name))) throw new Error(`emit row flagged as existing-record match by validator: ${r.name}`);
  if (!r.name || !r.category) throw new Error(`emit row missing name/category: ${r.name}`);
}

// uniqueness inside the emit set
const seenName = new Set<string>(), seenPhone = new Set<string>();
for (const r of emit) {
  const nk = normkey(r.name), pk = (r.phone || "").replace(/\D/g, "").slice(-10);
  if (seenName.has(nk)) throw new Error(`duplicate emit name: ${r.name}`);
  if (pk && seenPhone.has(pk)) throw new Error(`duplicate emit phone: ${r.name}`);
  seenName.add(nk); if (pk) seenPhone.add(pk);
}

const wsSha = sha(readFileSync(WS_PATH, "utf-8"));
const reportSha = sha(readFileSync(V_PATH, "utf-8"));
const baselineSha = sha(readFileSync(B_PATH, "utf-8"));

/* ---------- manifest ---------- */

const manifest = {
  manifest_version: "round4-1.0.0",
  artifact_status: "PROPOSED — additive import package; execution requires the DB write path (Supabase Dashboard SQL Editor / service key) which is not available from the research sandbox",
  generator: "scripts/foodie-import-validator/gen-import-sql-round4.ts",
  context: {
    round: 4,
    scope: "magicpin corridor continuation (804 store pages fetched, robots-declared sitemap inventory) + district sitemap rescan (regenerated sitemap no longer covers the area — 0 new venues) + hold re-review with fresh evidence",
    worksheet: "input/research-worksheet-round4.csv (551 rows = round-3 127 with 3 evidence updates + 424 verbatim single-source zone leads)",
    epicruise_hangouts: "corpus probes: 'epicruise' 0 hits, 'hangout' 1 out-of-zone hit (Hangout @ Nandi, Nandi Hills), 'gitam' 0 hits, 'epicurus' 0 hits in the 804-page magicpin store corpus",
  },
  inputs: {
    worksheet_sha256: wsSha,
    validator_report: "reports/research-2026-10-11-round4.dry-run.json",
    validator_report_sha256: reportSha,
    validator_errors: 0,
    validator_warnings: 0,
    baseline_rows: 14,
    baseline_snapshot_sha256: baselineSha,
  },
  import_state_guarantees: [
    "additive only — INSERTs; no UPDATE, no DELETE, no DDL",
    "every row verification_status 'unverified'; verification booleans, last_verified_at, review_count, community_rating NOT in the column list",
    "fixed UUIDv5 ids (batch namespace 9f0c3a52-…) + triple per-row guards (id / normalized name / phone) -> idempotent re-runs",
    "preflight aborts on baseline drift (names + count window 14..77 covering pre/post batch-005 and the applied batch-006 state)",
    "postflight re-checks: counts, identity, untouched aggregates, proximity report",
  ],
  sql_file: "supabase/insert-batch-006-round4-1.sql",
  proposed_insert_set: emit.map((r) => {
    const deaccent = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const isLounge = normkey(deaccent(r.name)) === normkey(deaccent("Lounge de La Réserve"));
    return {
      worksheet_row_name: r.name,
      id: uuidv5(`${normkey(r.name)}|${r.phone || r.source_url}`, UUID_NAMESPACE),
      name: r.name,
      category: r.category,
      address: r.address || null,
      city: r.city || null,
      locality: r.locality || null,
      latitude: r.latitude ? Number(r.latitude) : null,
      longitude: r.longitude ? Number(r.longitude) : null,
      listing_rating: r.listing_rating ? Number(r.listing_rating) : 0,
      rating_source: r.rating_source_url || null,
      rating_checked_on: r.rating_checked_on || null,
      opening_hours: r.opening_hours || null,
      phone: r.phone || null,
      source: "round4-research-import",
      source_url: r.source_url,
      evidence: {
        identity_basis: isLounge
          ? "district.in + magicpin listings agree on IDENTICAL phone +916366946331 and IDENTICAL pin 13.286726,77.5824616 (both re-read 2026-10-11); the 'Bashettihalli' magicpin area label is a filing quirk, not a branch. Held in round 3, promoted on this fresh identity agreement."
          : `distinct_new_business per the round-4 worksheet (row evidence in input/research-worksheet-round4.csv; validator potential_new vs the live 14).`,
        coordinate_status: r.latitude
          ? "directory-reported pin, coordinates_verified stays NULL (candidate_coordinates)"
          : "no coordinates captured — address/locality only",
        notes: r.uncertainty_notes?.slice(0, 500) ?? null,
      },
    };
  }),
};
writeFileSync(MANIFEST_OUT, JSON.stringify(manifest, null, 1) + "\n");

/* ---------- SQL ---------- */

const sqlRows = manifest.proposed_insert_set.map((r) => {
  const cols: string[] = [];
  const vals: string[] = [];
  const add = (col: string, val: string) => { cols.push(col); vals.push(val); };
  add("id", `'${r.id}'`);
  add("name", `'${r.name.replace(/'/g, "''")}'`);
  add("category", `'${r.category}'`);
  if (r.address) add("address", `'${r.address.replace(/'/g, "''")}'`);
  if (r.city) add("city", `'${r.city.replace(/'/g, "''")}'`);
  if (r.locality) add("locality", `'${r.locality.replace(/'/g, "''")}'`);
  if (r.latitude != null && r.longitude != null) {
    add("latitude", String(r.latitude));
    add("longitude", String(r.longitude));
  }
  add("rating", String(r.listing_rating ?? 0));
  if (r.opening_hours) add("opening_hours", `'${r.opening_hours.replace(/'/g, "''")}'`);
  if (r.phone) add("phone", `'${r.phone}'`);
  add("tags", "array[]::text[]");
  add("source", `'${r.source}'`);
  add("source_url", `'${r.source_url}'`);
  add("verification_status", "'unverified'");

  const guards = [
    `r.id = '${r.id}'`,
    `lower(btrim(r.name)) = lower(btrim('${r.name.replace(/'/g, "''")}'))`,
  ];
  if (r.phone) guards.push(`r.phone = '${r.phone}'`);

  return [
    `-- ${r.name}`,
    `--   identity: ${r.evidence.identity_basis}`,
    `--   coordinates: ${r.evidence.coordinate_status}`,
    `insert into public.restaurants`,
    `  (${cols.join(", ")})`,
    `select`,
    vals.map((v) => `  ${v}`).join(",\n"),
    `from (select 1) _anchor`,
    `where not exists (`,
    `  select 1 from public.restaurants r`,
    `  where ${guards.join("\n     or ")}`,
    `);`,
  ].join("\n");
});

const sql = `-- ============================================================================
-- Foodie — INSERT BATCH 006: round-4 corridor continuation (${manifest.proposed_insert_set.length} place${manifest.proposed_insert_set.length === 1 ? "" : "s"})
-- ----------------------------------------------------------------------------
-- STATUS:  PROPOSED — reviewed research package (validator 0 errors / 0 warnings,
--          idempotent double-run byte-identical, report sha256 ${reportSha.slice(0, 12)}…).
--          The research sandbox has NO database write path (RLS closes
--          restaurant inserts to anon+authenticated by design), so this file
--          is executed by a human via Supabase Dashboard -> SQL Editor.
--
-- SOURCE:  generated by scripts/foodie-import-validator/gen-import-sql-round4.ts
--          from reports/round4-import-manifest.json (inputs + hashes embedded).
--          COMPLEMENTS insert-batch-005-round3-62.sql (which must be run first
--          or independently — both are additive and idempotent, order-safe).
--
-- CONTEXT: round 4 re-fetched ALL 804 magicpin corridor store pages (robots-
--          declared inventory) and re-scanned the district.in sitemap (its
--          2026-09-28 regeneration no longer lists Doddaballapura-area venues;
--          0 new district venues). Corpus probes: zero "Epicruise" listings,
--          zero GITAM-area "Hangouts" listings. This batch contains the ONE
--          candidate whose identity was newly confirmed by fresh evidence:
--          Lounge de La Réserve (held in round 3; district + magicpin listings
--          share an identical phone AND identical pin, re-read 2026-10-11).
--
-- HONESTY RULES HONORED (identical to batches 001-005):
--   * the row enters as verification_status 'unverified' — nothing is verified
--     and NO verification boolean or timestamp is set;
--   * coordinates are the directory-reported pin (both directories agree) and
--     stay candidate_coordinates (coordinates_verified NULL — never promoted);
--   * 'rating' 2.8 is the EXTERNAL magicpin listing rating (checked
--     2026-10-11) — NEVER a Foodie community rating;
--   * review_count / community_rating / last_verified_at / address_verified /
--     hours_verified / photos_verified are NOT in the column list;
--   * additive only: no UPDATE, no DELETE, no DDL, no existing row changes.
--
-- IDEMPOTENT: safe to run more than once. Fixed UUIDv5 id + per-row guards
-- (id / normalized name / phone) make any re-run a no-op.
--
-- REV 2 (2026-10-11): PREFLIGHT COUNT WINDOW 76 -> 77 (validation-only fix,
-- payload unchanged). After batch-005 (62 rows) AND this batch (1 row) are
-- applied, the legitimate live state is exactly 77 rows; the old 14..76
-- window aborted on that state, making the script unusable for re-runs
-- after full application. Upper bound stays tight: any count above 77 is
-- drift and still aborts. Single-record payload, baseline-name check,
-- triple-guarded insert and every postflight honesty guard are unchanged.
--
-- REV 3 (2026-10-12): POSTFLIGHT PROXIMITY REPORT FIX (validation-only fix,
-- payload unchanged). The postflight proximity report referenced a
-- non-existent 'coordinates' column; public.restaurants carries
-- latitude/longitude (supabase/schema.sql + migration-005), so the DO block
-- raised 'column a.coordinates does not exist' and EVERY run rolled back
-- before commit — the batch could never apply. The report now computes
-- great-circle distance in metres with the same clamped spherical-law-of-
-- cosines formula as batch-005's postflight 2.5 (R = 6,371,000 m; pairs
-- within 200 m are notice-only, never an error). All preflight/postflight
-- guards, transaction boundaries and the single-record payload are
-- byte-identical to REV 2.
--
-- WORKSHEET SHA256: ${wsSha}
-- BASELINE SNAPSHOT SHA256: ${baselineSha}
-- ============================================================================

begin;

-- ---------------------------------------------------------------------------
-- Part 0 — PREFLIGHT (aborts before any write when the world changed)
-- ---------------------------------------------------------------------------
do $$
declare
  live_count integer;
  missing_names text;
begin
  select count(*) into live_count from public.restaurants;
  -- 14 baseline + up to 62 batch-005 rows + this batch's 1 row = 77. A count
  -- above 77 is drift and aborts (mirrors batch-005 REV-3 window policy).
  if live_count < 14 or live_count > 77 then
    raise exception 'PREFLIGHT FAIL: restaurants row count is %, expected 14..77 (14 baseline + up to 62 batch-005 rows + the 1 batch-006 row). Database has drifted — investigate before importing.', live_count;
  end if;

  select string_agg(n, ', ') into missing_names
  from (select unnest(array[
${BASELINE_NAMES.map((n) => `    '${n}'`).join(",\n")}
  ]) as n) base
  where not exists (
    select 1 from public.restaurants r where lower(btrim(r.name)) = lower(btrim(base.n))
  );
  if missing_names is not null then
    raise exception 'PREFLIGHT FAIL: baseline rows missing/deleted: %', missing_names;
  end if;

  raise notice 'PREFLIGHT OK: % live rows, all 14 baseline names present', live_count;
end
$$;

-- ---------------------------------------------------------------------------
-- Part 1 — INSERT (triple-guarded, idempotent)
-- ---------------------------------------------------------------------------

${sqlRows.join("\n\n")}

-- ---------------------------------------------------------------------------
-- Part 2 — POSTFLIGHT (read-only verification)
-- ---------------------------------------------------------------------------
do $$
declare
  final_count integer;
  inserted_row record;
  dup_names integer;
  dup_phones integer;
  bad_state integer;
  close_pairs text;
begin
  select count(*) into final_count from public.restaurants;
  raise notice 'POSTFLIGHT: restaurants row count is now %', final_count;

  select * into inserted_row from public.restaurants
  where name = '${manifest.proposed_insert_set[0].name.replace(/'/g, "''")}';
  if not found then
    raise exception 'POSTFLIGHT FAIL: inserted row not found';
  end if;
  raise notice 'POSTFLIGHT: inserted row % | verification_status=% | coordinates_verified=% | review_count=% | community_rating=%',
    inserted_row.name, inserted_row.verification_status, inserted_row.coordinates_verified,
    inserted_row.review_count, inserted_row.community_rating;

  if inserted_row.verification_status is distinct from 'unverified'
     or inserted_row.coordinates_verified is not null
     or inserted_row.review_count is distinct from 0
     or inserted_row.community_rating is not null then
    raise exception 'POSTFLIGHT FAIL: inserted row honesty state violated';
  end if;

  select count(*) into dup_names from (
    select lower(btrim(name)) as n, count(*) c from public.restaurants group by 1 having count(*) > 1
  ) d;
  if dup_names > 0 then
    raise exception 'POSTFLIGHT FAIL: % duplicate normalized name group(s) exist', dup_names;
  end if;

  select count(*) into dup_phones from (
    select phone, count(*) c from public.restaurants where phone is not null group by phone having count(*) > 1
  ) d;
  if dup_phones > 0 then
    raise exception 'POSTFLIGHT FAIL: % duplicate phone group(s) exist', dup_phones;
  end if;

  -- aggregate-untouched check: any row with a review_count that is not 0 or a
  -- community_rating that is not NULL would mean the import touched aggregates
  select count(*) into bad_state from public.restaurants
  where (review_count is distinct from 0) or (community_rating is not null);
  if bad_state > 0 then
    raise exception 'POSTFLIGHT FAIL: % row(s) with non-zero aggregates — the import must never touch aggregates', bad_state;
  end if;

  -- proximity report (human eyeballing, NOT an error). REV 3: computes
  -- great-circle metres from the REAL latitude/longitude columns using the
  -- same clamped spherical-law-of-cosines formula as batch-005 postflight
  -- 2.5 (R = 6,371,000 m). The previous draft referenced a 'coordinates'
  -- column which public.restaurants does not have — that reference raised
  -- 'column does not exist' inside this DO block and would have rolled back
  -- every run before commit. Notice-only: proximity never fails the import.
  select string_agg(format('%s <-> %s (%s m)', a.name, b.name, round((
           6371000 * acos(least(1, greatest(-1,
             sin(radians(a.latitude)) * sin(radians(b.latitude)) +
             cos(radians(a.latitude)) * cos(radians(b.latitude)) *
             cos(radians(b.longitude) - radians(a.longitude))
           )))
         )::numeric)), E'\\n')
  into close_pairs
  from public.restaurants a
  join public.restaurants b
    on a.id < b.id
   and a.latitude is not null and b.latitude is not null
   and (6371000 * acos(least(1, greatest(-1,
          sin(radians(a.latitude)) * sin(radians(b.latitude)) +
          cos(radians(a.latitude)) * cos(radians(b.latitude)) *
          cos(radians(b.longitude) - radians(a.longitude))
        )))) < 200;
  if close_pairs is not null then
    raise notice 'POSTFLIGHT: rows within 200 m of each other (directory pins in dense streets — eyeball, do not merge):%— see query below', E'\\n' || coalesce(close_pairs, '');
  else
    raise notice 'POSTFLIGHT: no rows within 200 m of each other';
  end if;

  raise notice 'POSTFLIGHT OK';
end
$$;

commit;

-- ---------------------------------------------------------------------------
-- EMERGENCY REVERT (human-run only, outside the transaction above):
-- delete from public.restaurants where id = '${manifest.proposed_insert_set[0].id}';
-- ---------------------------------------------------------------------------
`;

writeFileSync(SQL_OUT, sql);

console.log(`manifest -> ${MANIFEST_OUT}`);
console.log(`sql      -> ${SQL_OUT} (${emit.length} row${emit.length === 1 ? "" : "s"})`);
console.log(`emitted rows: ${emit.map((r) => r.name).join(", ")}`);
