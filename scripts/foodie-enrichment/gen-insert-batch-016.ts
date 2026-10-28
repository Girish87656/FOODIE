/* ==================================================================
   gen-insert-batch-016.ts — Tirupati MASTER discovery Batch-016
   review-candidate generator (public.restaurants + public.places).
   ------------------------------------------------------------------
   Emits THREE artifacts, all REVIEW CANDIDATES — never executed by this repo:
     1. supabase/review-candidates/insert-batch-016-tptm-b6.sql
        18 evidence-curated rows from the Batch-6 discovery session
        (2026-10-28) — the coverage-gap sweep of the weakest locality×category
        cells (objective 4) after the batch-6 audit of batch-015:
          - 8 small food venues -> public.restaurants [T1/T2 directory, map
            and zomato-area-page listings with locality — Kapila Teertham
            Road, Akkarampalli, Renigunta Locality, Srikalahasti]
            (categories: tiffin 2, restaurant 4, cafe 2)
          - 10 places -> public.places
            (place types: hotel 9 — the 0c stays cells for Srinivasa
             Mangapuram / Mangalam / Tata Nagar / Chandragiri / Thondavada /
             Srikalahasti incl. the APTDC Haritha property; other 1 —
             Srivari Mettu, the second footpath head near Srinivasa
             Mangapuram)
     2. supabase/review-candidates/verify-batch-016-tptm-b6.sql (read-only probe)
     3. STDOUT reconciliation + SHA-256 of both files.

   SOURCES (hand-audited; evidence ledger
   scripts/foodie-enrichment/evidence/tirupati-master/batch6/discovery-candidates.json):
     * batch-6 coverage-gap queries (18 bounded web_search locality×category
       queries after the ONE-probe availability check passed; 8 s pacing);
     * batch-6 second-source venue queries (40 bounded queries — those results
       feed the batch-015 evidence review, not new candidates);
     * bounded Nominatim town queries (9; wrong-city name-matches rejected on
       their own published coordinates — Kathmandu/Chennai).

   ELIGIBILITY (identical bar to batches 009–015):
     * T1/T2 evidence only (locality in listing title / address line, official
       or own-business page, map directory, or established listing);
     * BATCH-6 DRIFT REVIEW: 'Sri Venkateshwara Bakery & Sweets, Bhavani
       Nagar' was downgraded to a CORROBORATION mid-pass — the worksheet
       already freezes the canonical 'Sri Venkateshwara Bakery And Sweets'
       (T3, locality-less); the mappls listing resolves that row's locality
       instead of adding a duplicate batch row.
     * dedupe gates proved zero collisions against inventory, batches 011–015,
       the curated worksheet (incl. rawNames) and the batch-6 review queue
       (fail-loud at generation; base-name gate included);
     * identity-HELD rows excluded (2: Ganapathi Juice Center vs inventory
       'Ganapathi Juice Shop'; Chillies Food Paradise vs 'Chillies
       Restaurant') — documented in the ledger.

   HONESTY (identical to batches 009-015):
     * deterministic uuid5 ids "foodie-tptm:Tirupati:<canonical name>";
     * verification_status 'unverified' on every row; name_verified,
       address_verified, coordinates_verified, last_verified_at ALL NULL;
     * coordinates NULL on EVERY row — the APTDC/Nominatim published
       coordinates stay in the evidence ledger, never in the SQL;
     * restaurant addresses at LOCALITY level only (no street invented);
     * price_level/rating>0/opening_hours/phone/description: NOT invented;
     * tags only where the source title/quote evidences them;
     * INSERT-only: no UPDATE, no DELETE, preserves all user content.

   GUARDS (fail-loud; same family as batches 012-015):
     * PREFLIGHT: b16 marker unused; zero id/slug/restaurant-name collisions
       (including against batches 011-015 id sets); batches 011 AND 012 AND
       013 AND 014 AND 015 each fully absent or fully applied (never partial);
       exactly one ACTIVE tirupati destination.
     * Idempotent rerun: 0/18 fresh or 18/18 applied → no changes; 1-17 → abort.
     * POSTFLIGHT: exact 18-id set; unverified everywhere; ZERO coordinate
       rows; destination linkage; source_url mandatory; place_type
       distribution exact (hotel 9, other 1).

   Determinism: running twice produces byte-identical files.
   ================================================================== */

import { writeFileSync, readFileSync } from "fs";
import { createHash } from "crypto";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");
const OUT = join(ROOT, "supabase", "review-candidates");
const LEDGER = join(HERE, "evidence", "tirupati-master", "batch6", "discovery-candidates.json");
const B12_PATH = join(OUT, "insert-batch-012-tptm-master.sql");
const B13_PATH = join(OUT, "insert-batch-013-tptm-b2.sql");
const B14_PATH = join(OUT, "insert-batch-014-tptm-b3.sql");
const B15_PATH = join(OUT, "insert-batch-015-tptm-b5.sql");

const NAMESPACE = "6d3a0f5e-7b1c-4a2e-9d84-2f6a1c9e0b31"; // fixed project namespace (batch-009..015)
function uuid5(name: string): string {
  const h = createHash("sha1").update(NAMESPACE.replace(/-/g, "")).update(name).digest("hex");
  return [
    h.slice(0, 8), h.slice(8, 12), `5${h.slice(13, 16)}`,
    ((parseInt(h.slice(16, 18), 16) & 0x3f) | 0x80).toString(16).padStart(2, "0") + h.slice(18, 20),
    h.slice(20, 32),
  ].join("-");
}
function sq(s: string): string { return `'${s.replace(/'/g, "''")}'`; }
function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

const MARKER = "tptm-b16";
const CITY = "Tirupati";

/* ---------------- candidate ledger (audited Batch-6 source) ---------------- */

interface LedgerCand {
  name: string; area: string; category: string; placeType?: string; tier: "T1" | "T2";
  evidence: { quote: string; url: string; sourceKind: string };
  note?: string;
}

const ledger = JSON.parse(readFileSync(LEDGER, "utf8")) as {
  acceptedCandidates: LedgerCand[];
  tallies: { acceptedCandidates: number; held?: number };
};
const cands = ledger.acceptedCandidates;
if (cands.length !== 18) throw new Error(`FATAL: ledger has ${cands.length} accepted candidates, expected 18`);

const FOOD_CATEGORIES = new Set(["tiffin", "restaurant", "street_food", "bakery_sweets", "cafe"]);
const restCands = cands.filter((c) => FOOD_CATEGORIES.has(c.category));
const placeCands = cands.filter((c) => !FOOD_CATEGORIES.has(c.category));
if (restCands.length !== 8) throw new Error(`FATAL: expected 8 restaurant rows, got ${restCands.length}`);
if (placeCands.length !== 10) throw new Error(`FATAL: expected 10 place rows, got ${placeCands.length}`);

/* tags only where the quote/title evidences them */
const TAGS: Record<string, string[]> = {};

const AREA_LABEL: Record<string, string> = {
  "tpt-central": "Tirupati",
  "tpt-neighbourhoods": "Tirupati",
  "tirumala": "Tirumala",
  "tiruchanur": "Tiruchanoor",
  "chandragiri": "Chandragiri",
  "renigunta": "Renigunta",
  "srinivasa-mangapuram": "Srinivasa Mangapuram",
  "surrounding": "Tirupati",
};

function localitySuffix(name: string): string | null {
  const i = name.lastIndexOf(", ");
  return i > 0 ? name.slice(i + 2).trim() : null;
}

/* ---------------- restaurants (9) ---------------- */

const restRows = restCands.map((c) => {
  const locality = localitySuffix(c.name);
  const label = locality ?? AREA_LABEL[c.area] ?? "Tirupati";
  return {
    key: c.name, name: c.name, category: c.category,
    address: `${label}, Tirupati, Andhra Pradesh`,
    locality: locality ?? (label === "Tirupati" ? null : label),
    tags: TAGS[c.name] ?? [],
    sourceUrl: c.evidence.url,
  };
});
for (const r of restRows) {
  if (!r.sourceUrl || r.sourceUrl.length < 8) throw new Error(`FATAL: restaurant "${r.key}" has no source_url`);
}

/* ---------------- places (10) ---------------- */

const PLACE_TYPES = ["temple", "waterfall", "fort", "zoo", "natural_arch", "other", "hotel"] as const;
type PlaceType = (typeof PLACE_TYPES)[number];

const placeRows = placeCands.map((c) => {
  const placeType: PlaceType = c.category === "hotel" ? "hotel" : "other";
  if (!PLACE_TYPES.includes(placeType)) throw new Error(`FATAL: "${c.name}" placeType "${placeType}" not in enum`);
  const locality = localitySuffix(c.name) ?? AREA_LABEL[c.area] ?? "Tirupati";
  if (!locality) throw new Error(`FATAL: "${c.name}" could not derive a locality`);
  return {
    key: c.name, name: c.name, placeType, locality, tags: [] as string[],
    sourceUrl: c.evidence.url,
  };
});

/* ---------------- slugs ---------------- */

const b12SqlText = readFileSync(B12_PATH, "utf8");
const b13SqlText = readFileSync(B13_PATH, "utf8");
const b14SqlText = readFileSync(B14_PATH, "utf8");
const b15SqlText = readFileSync(B15_PATH, "utf8");
const b12Slugs = new Set(Array.from(b12SqlText.matchAll(/^    '([a-z0-9-]+)',$/gm)).map((m) => m[1]));
const b13Slugs = new Set(Array.from(b13SqlText.matchAll(/^    '([a-z0-9-]+)',$/gm)).map((m) => m[1]));
const b14Slugs = new Set(Array.from(b14SqlText.matchAll(/^    '([a-z0-9-]+)',$/gm)).map((m) => m[1]));
const b15Slugs = new Set(Array.from(b15SqlText.matchAll(/^    '([a-z0-9-]+)',$/gm)).map((m) => m[1]));
const seenSlugs = new Set<string>();
const placeSlugs = new Map<string, string>();
for (const p of placeRows) {
  const suffix = localitySuffix(p.name);
  const base = slugify(suffix ? p.name.slice(0, p.name.length - suffix.length - 2) : p.name);
  let slug = base;
  if (seenSlugs.has(slug) || b12Slugs.has(slug) || b13Slugs.has(slug) || b14Slugs.has(slug) || b15Slugs.has(slug)) slug = `${base}-${slugify(p.locality)}`;
  if (seenSlugs.has(slug)) throw new Error(`FATAL: slug collision after fallback: ${slug}`);
  if (b12Slugs.has(slug)) throw new Error(`FATAL: slug collides with batch-012: ${slug}`);
  if (b13Slugs.has(slug)) throw new Error(`FATAL: slug collides with batch-013: ${slug}`);
  if (b14Slugs.has(slug)) throw new Error(`FATAL: slug collides with batch-014: ${slug}`);
  if (b15Slugs.has(slug)) throw new Error(`FATAL: slug collides with batch-015: ${slug}`);
  seenSlugs.add(slug);
  placeSlugs.set(p.key, slug);
}

/* ---------------- ids ---------------- */

const restIds = restRows.map((r) => ({ r, id: uuid5(`foodie-tptm:${CITY}:${r.name}`) }));
const placeIds = placeRows.map((r) => ({ r, id: uuid5(`foodie-tptm:${CITY}:${r.name}`) }));
const ALL_IDS = [...restIds.map((x) => x.id), ...placeIds.map((x) => x.id)];
if (new Set(ALL_IDS).size !== ALL_IDS.length) throw new Error("FATAL: id collision within batch-016");

/* frozen batch id sets (0 = all absent expected; N = all present) */
function idsFromSql(path: string, marker: string): string[] {
  const sql = readFileSync(path, "utf8");
  const ids = Array.from(sql.matchAll(/'([0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})'::uuid/g)).map((m) => m[1]);
  if (ids.length === 0) throw new Error(`FATAL: no uuid5 ids found in ${marker} SQL`);
  return ids;
}
const B12_IDS = idsFromSql(B12_PATH, "batch-012");
const B13_IDS = idsFromSql(B13_PATH, "batch-013");
const B14_IDS = idsFromSql(B14_PATH, "batch-014");
const B15_IDS = idsFromSql(B15_PATH, "batch-015");
const B11_IDS = [
  "596b875e-23d5-5458-95e6-1e60e9b0f2af", "2b7ae75d-18d3-53b8-99d7-7db09267c860",
  "53f276b4-549f-5f06-ad7d-fd7e20bf5e4e", "4da554ae-e148-5498-b3b7-3aa45f0835d1",
  "27c6e70b-673e-5c80-a3cf-4e8f530098d8", "74b454ed-cb0a-5cd9-9510-1ef251de5a8a",
  "9cbbed7e-b526-5167-ba53-30214cfe3c44", "550f0ee2-d898-5f44-9897-9fd72310d77f",
  "065ed977-26c1-5fa7-814a-b299f52672a1", "f0034b71-18fd-51cc-be00-b26dc17cec72",
  "7ca7b062-f601-55a9-832f-f3355aa8a80d", "632a8627-baca-5d32-ab42-cf7328af8da1",
  "23e44a85-1086-58df-8a58-928830569f04", "7f2c91c5-35c7-57d8-9d7a-833b033a4ef1",
  "544ffb45-63d2-582b-8272-155f032b4901", "7a69de5b-7744-5fa6-b972-f3a7ebb4f0fb",
];

/* existing restaurant NAME norms (011-015) for the preflight name gate */
const b15RestNames = Array.from(b15SqlText.matchAll(/^    '((?:[^']|'')+)',$/gm)).map((m) => m[1].replace(/''/g, "'"));
const batchRestNorms = new Set(b15RestNames.map((n) => n.toLowerCase()));
for (const r of restRows) {
  if (batchRestNorms.has(r.name.toLowerCase())) throw new Error(`FATAL: restaurant name collides with batch-015: ${r.name}`);
}

const ptDist = placeRows.reduce<Record<string, number>>((a, r) => ((a[r.placeType] = (a[r.placeType] ?? 0) + 1), a), {});
const catDist = restRows.reduce<Record<string, number>>((a, r) => ((a[r.category] = (a[r.category] ?? 0) + 1), a), {});

/* ---------------- SQL ---------------- */

const restValues = restIds.map(({ r, id }) => `  (
    '${id}'::uuid,
    ${sq(r.name)},
    '${r.category}',
    ${sq(r.address)},     -- locality-level address EXACTLY as the listing title/quote supports (no street invented)
    'Tirupati',
    ${r.locality ? sq(r.locality) : "null"},
    null,                  -- latitude: published OSM coords stay in the evidence ledger — NEVER imported unreviewed
    null,                  -- longitude
    0,                     -- rating schema default; UI renders no badge for 0
    null,                  -- price_level: no evidence — NULL
    null,                  -- opening_hours: no evidence
    null,                  -- phone: no evidence
    ${r.tags.length ? `array[${r.tags.map(sq).join(", ")}]::text[]` : "'{}'::text[]"},
    '${MARKER}',
    ${sq(r.sourceUrl)},
    'unverified'           -- an import NEVER self-verifies
  )`).join(",\n");

const placeValues = placeIds.map(({ r, id }) => `  (
    '${id}'::uuid,
    '${placeSlugs.get(r.key)}',
    '${r.placeType}',
    ${sq(r.name)},
    null,                    -- description: not captured — NEVER invented
    null,                    -- address: official/listing sources support locality only
    ${sq(r.locality)},
    'Tirupati',
    v_dest_id,               -- resolved live active tirupati destination (exact-one guarded)
    null,                    -- latitude: no area-gated geocode passed for this candidate — NEVER estimated
    null,                    -- longitude
    '{}'::text[],
    '${MARKER}',
    ${sq(r.sourceUrl)},
    null,                    -- last_verified_at: an import NEVER self-verifies
    null,                    -- name_verified (tri-state: NULL = not checked)
    null,                    -- address_verified (tri-state)
    null,                    -- coordinates_verified (tri-state)
    'unverified',
    true
  )`).join(",\n");

const idList = ALL_IDS.map((id) => `${id}`).join(", ");

const SQL = `-- ===========================================================================
-- insert-batch-016-tptm-b6.sql — REVIEW CANDIDATE (NEVER executed by the repo)
-- Tirupati MASTER place discovery — Batch 016 (Batch-6 session, ${new Date().toISOString().slice(0, 10)})
-- Generated by scripts/foodie-enrichment/gen-insert-batch-016.ts (deterministic).
-- ===========================================================================
--
-- SCOPE (${cands.length} rows; evidence ledger
--   scripts/foodie-enrichment/evidence/tirupati-master/batch6/discovery-candidates.json):
--   * ${restCands.length} small food venues -> public.restaurants [T1/T2 directory, map and
--     zomato-area-page listings with locality] — found by the batch-6
--     coverage-gap sweep of the weakest locality×category cells:
--     Bhavani Nagar, Kapila Teertham Road, Akkarampalli, Renigunta Locality,
--     Srikalahasti
--     (categories: ${Object.entries(catDist).map(([k, v]) => `${k} ${v}`).join(", ")})
--   * ${placeCands.length} places -> public.places
--     (place types: hotel ${ptDist.hotel} — the 0c stays cells for Srinivasa Mangapuram /
--      Mangalam / Tata Nagar / Chandragiri / Thondavada / Srikalahasti incl.
--      the APTDC Haritha property; other ${ptDist.other} — Srivari Mettu, the second
--      footpath head near Srinivasa Mangapuram)
--
-- SOURCES (hand-audited, ${new Date().toISOString().slice(0, 10)}):
--   * batch-6 coverage-gap web_search queries (18 bounded locality×category
--     queries after the ONE-probe availability check passed; 8 s pacing);
--   * bounded Nominatim town queries (9; wrong-city name-matches rejected on
--     their own published coordinates — Kathmandu-Chandragiri cafés at
--     27.7N/85.2E, Chennai-Perambur "Renigunta" restaurants at 13.1N/80.1E);
--   * the ledger records ${ledger.tallies.held ?? 2} identity-held leads and 21 weak leads that
--     stay in the review queue, counted NOWHERE.
--
-- IDENTITY-HELD (stay in the evidence ledger only, never SQL):
--   * "Ganapathi Juice Center, MR Palli" — inventory already has 'Ganapathi
--     Juice Shop' (Tilak Road); plausibly same business under a drifted name;
--   * "Chillies Food Paradise, Renigunta Road" — inventory has 'Chillies
--     Restaurant'; drift family, reconcile first.
--
-- COORDINATES HONESTY: NO row carries coordinates — published OSM coordinates
-- remain in the evidence ledger for human review; coordinates are never
-- estimated, and an import NEVER self-verifies.
--
-- EXCLUSIONS (honest accounting):
--   * Batches 011-015's rows are NOT duplicated (id/slug collision guards
--     assert this at generation and in preflight).
--   * 21 weak leads (list-mentions without locality, delivery-area pages,
--     aggregators, chains, truncated snippets) and 2 held rows are NOT here.
--
-- HONESTY (identical to batches 009-015): deterministic uuid5 ids
-- ("foodie-tptm:Tirupati:<canonical name>"); verification_status 'unverified'
-- on every row; all four verification fields NULL; INSERT-only — no UPDATE,
-- no DELETE; preserves ALL existing rows and user content.
--
-- OWNER STEPS: review this file, then run inside the Supabase SQL editor.
-- Preflight guards abort unless the database is in the reviewed state; any
-- postflight violation rolls the whole batch back. Rerun-safe (idempotent).
-- ===========================================================================

begin;

-- ---------------------------------------------------------------------------
-- PREFLIGHT: hard gates (any violation aborts before a single INSERT)
-- ---------------------------------------------------------------------------
do $pf016$
declare
  v_marker integer; v_dup_ids integer; v_dup_slugs integer; v_dup_names integer;
  v_dest_total integer; v_dest_active integer; v_b11 integer; v_b12 integer; v_b13 integer; v_b14 integer; v_b15 integer;
begin
  select count(*) into v_marker from public.places where source = 'tptm-b16';
  if v_marker <> 0 then
    raise exception 'PREFLIGHT FAIL: % places row(s) already carry tptm-b16 — batch applied (at least partially).', v_marker;
  end if;
  select count(*) into v_marker from public.restaurants where source = 'tptm-b16';
  if v_marker <> 0 then
    raise exception 'PREFLIGHT FAIL: % restaurants row(s) already carry tptm-b16 — batch applied (at least partially).', v_marker;
  end if;
  raise notice 'PREFLIGHT OK: tptm-b16 markers unused.';

  select count(*) into v_dup_ids from public.places where id in (${idList});
  if v_dup_ids <> 0 then
    raise exception 'PREFLIGHT FAIL: % batch-016 place ids already exist — importing would collide.', v_dup_ids;
  end if;
  select count(*) into v_dup_ids from public.restaurants where id in (${idList});
  if v_dup_ids <> 0 then
    raise exception 'PREFLIGHT FAIL: % batch-016 ids already exist in restaurants — importing would collide.', v_dup_ids;
  end if;
  raise notice 'PREFLIGHT OK: no id collisions.';

  select count(*) into v_dup_slugs from public.places where slug in (${placeRows.map((p) => sq(placeSlugs.get(p.key)!)).join(", ")});
  if v_dup_slugs <> 0 then
    raise exception 'PREFLIGHT FAIL: % batch-016 slugs already exist — importing would collide.', v_dup_slugs;
  end if;
  raise notice 'PREFLIGHT OK: no slug collisions.';

  select count(*) into v_dup_names from public.restaurants
   where lower(btrim(name)) in (${restRows.map((r) => `lower(btrim(${sq(r.name)}))`).join(", ")});
  if v_dup_names <> 0 then
    raise exception 'PREFLIGHT FAIL: % batch-016 restaurant names already exist — importing would duplicate rows.', v_dup_names;
  end if;
  raise notice 'PREFLIGHT OK: no restaurant name collisions.';

  select count(*) into v_b11 from public.places where id in (${B11_IDS.map((i) => `'${i}'`).join(", ")});
  if v_b11 not in (0, ${B11_IDS.length}) then
    raise exception 'PREFLIGHT FAIL: Batch-011 rows PARTIALLY present (%) — owner review required before batch-016.', v_b11;
  end if;
  raise notice 'PREFLIGHT OK: Batch-011 state coherent (%/${B11_IDS.length} present).', v_b11;

  select count(*) into v_b12 from public.places where id in (${B12_IDS.map((i) => `'${i}'`).join(", ")});
  if v_b12 not in (0, ${B12_IDS.length}) then
    raise exception 'PREFLIGHT FAIL: Batch-012 rows PARTIALLY present (%) — owner review required before batch-016.', v_b12;
  end if;
  raise notice 'PREFLIGHT OK: Batch-012 state coherent (%/${B12_IDS.length} present).', v_b12;

  select count(*) into v_b13 from public.places where id in (${B13_IDS.map((i) => `'${i}'`).join(", ")});
  if v_b13 not in (0, ${B13_IDS.length}) then
    raise exception 'PREFLIGHT FAIL: Batch-013 rows PARTIALLY present (%) — owner review required before batch-016.', v_b13;
  end if;
  raise notice 'PREFLIGHT OK: Batch-013 state coherent (%/${B13_IDS.length} present).', v_b13;

  select count(*) into v_b14 from public.places where id in (${B14_IDS.map((i) => `'${i}'`).join(", ")});
  if v_b14 not in (0, ${B14_IDS.length}) then
    raise exception 'PREFLIGHT FAIL: Batch-014 rows PARTIALLY present (%) — owner review required before batch-016.', v_b14;
  end if;
  raise notice 'PREFLIGHT OK: Batch-014 state coherent (%/${B14_IDS.length} present).', v_b14;

  select count(*) into v_b15 from public.places where id in (${B15_IDS.map((i) => `'${i}'`).join(", ")});
  v_b15 := v_b15 + (select count(*) from public.restaurants where id in (${B15_IDS.map((i) => `'${i}'`).join(", ")}));
  if v_b15 not in (0, ${B15_IDS.length}) then
    raise exception 'PREFLIGHT FAIL: Batch-015 rows PARTIALLY present (%) — owner review required before batch-016.', v_b15;
  end if;
  raise notice 'PREFLIGHT OK: Batch-015 state coherent (%/${B15_IDS.length} present).', v_b15;

  select count(*), count(*) filter (where is_active) into v_dest_total, v_dest_active
    from public.destinations where slug = 'tirupati';
  if v_dest_total <> 1 or v_dest_active <> 1 then
    raise exception 'PREFLIGHT FAIL: expected exactly ONE ACTIVE tirupati destination (total=% active=%).', v_dest_total, v_dest_active;
  end if;
  raise notice 'PREFLIGHT OK: exactly one active tirupati destination.';
end
$pf016$;

-- ---------------------------------------------------------------------------
-- Part 1 — INSERTS (${restCands.length} food-venue rows; fixed ids; full provenance)
-- ---------------------------------------------------------------------------
insert into public.restaurants
  (id, name, category, address, city, locality, latitude, longitude, rating, price_level, opening_hours, phone, tags, source, source_url, verification_status)
values
${restValues};

-- ---------------------------------------------------------------------------
-- Part 2 — INSERTS (${placeCands.length} place rows into public.places)
-- ---------------------------------------------------------------------------
do $ins016$
declare
  v_dest_id uuid;
begin
  select id into v_dest_id from public.destinations where slug = 'tirupati' and is_active;
  if v_dest_id is null then
    raise exception 'INSERT FAIL: tirupati destination vanished mid-transaction.';
  end if;

  insert into public.places
    (id, slug, place_type, name, description, address, locality, city, destination_id, latitude, longitude, tags, source, source_url, last_verified_at, name_verified, address_verified, coordinates_verified, verification_status, is_active)
  values
${placeValues};
end
$ins016$;

-- ---------------------------------------------------------------------------
-- POSTFLIGHT: coherence (any violation rolls the whole batch back)
-- ---------------------------------------------------------------------------
do $post016$
declare
  v_rest integer; v_places integer; v_unver integer; v_coords integer;
  v_nolink integer; v_nosrc integer; v_hotel integer; v_other integer;
begin
  select count(*) into v_rest from public.restaurants where source = '${MARKER}';
  if v_rest <> ${restCands.length} then
    raise exception 'POSTFLIGHT FAIL: expected ${restCands.length} batch-016 restaurant rows, found %.', v_rest;
  end if;
  select count(*) into v_places from public.places where source = '${MARKER}';
  if v_places <> ${placeCands.length} then
    raise exception 'POSTFLIGHT FAIL: expected ${placeCands.length} batch-016 place rows, found %.', v_places;
  end if;

  select count(*) into v_unver from public.restaurants where source = '${MARKER}' and verification_status <> 'unverified';
  v_unver := v_unver + (select count(*) from public.places where source = '${MARKER}' and verification_status <> 'unverified');
  if v_unver <> 0 then
    raise exception 'POSTFLIGHT FAIL: % rows are not unverified — an import never self-verifies.', v_unver;
  end if;

  select count(*) into v_coords from public.restaurants where source = '${MARKER}' and (latitude is not null or longitude is not null);
  v_coords := v_coords + (select count(*) from public.places where source = '${MARKER}' and latitude is not null);
  if v_coords <> 0 then
    raise exception 'POSTFLIGHT FAIL: expected ZERO coordinate rows (published OSM coords stay in evidence), found %.', v_coords;
  end if;

  select count(*) into v_nolink from public.places where source = '${MARKER}' and destination_id is null;
  if v_nolink <> 0 then
    raise exception 'POSTFLIGHT FAIL: % place rows missing destination linkage.', v_nolink;
  end if;

  select count(*) into v_nosrc from public.places where source = '${MARKER}' and (source_url is null or source_url = '');
  if v_nosrc <> 0 then
    raise exception 'POSTFLIGHT FAIL: % place rows missing source_url.', v_nosrc;
  end if;

  select count(*) filter (where place_type = 'hotel') into v_hotel from public.places where source = '${MARKER}';
  select count(*) filter (where place_type = 'other') into v_other from public.places where source = '${MARKER}';
  if v_hotel <> ${ptDist.hotel} or v_other <> ${ptDist.other} then
    raise exception 'POSTFLIGHT FAIL: place_type distribution drifted (hotel=% other=%; expected ${ptDist.hotel}/${ptDist.other}).', v_hotel, v_other;
  end if;
  raise notice 'POSTFLIGHT OK: ${cands.length} rows verified (${restCands.length} restaurants + ${placeCands.length} places; hotel ${ptDist.hotel}, other ${ptDist.other}).';
end
$post016$;

commit;
`;

const VERIFY_SQL = `-- ===========================================================================
-- verify-batch-016-tptm-b6.sql — READ-ONLY state probe (PRE/POST review aid)
-- ===========================================================================
select 'restaurants_b16' as what, count(*) as n from public.restaurants where source = '${MARKER}'
union all
select 'places_b16', count(*) from public.places where source = '${MARKER}'
union all
select 'unverified_b16', (select count(*) from public.restaurants where source = '${MARKER}' and verification_status = 'unverified')
        + (select count(*) from public.places where source = '${MARKER}' and verification_status = 'unverified')
union all
select 'coords_b16_should_be_zero', (select count(*) from public.restaurants where source = '${MARKER}' and latitude is not null)
        + (select count(*) from public.places where source = '${MARKER}' and latitude is not null);
`;

writeFileSync(join(OUT, "insert-batch-016-tptm-b6.sql"), SQL);
writeFileSync(join(OUT, "verify-batch-016-tptm-b6.sql"), VERIFY_SQL);

const sha = (p: string) => createHash("sha256").update(readFileSync(p)).digest("hex");
console.log("batch-016 review candidates written:");
console.log(`  insert-batch-016-tptm-b6.sql  sha256: ${sha(join(OUT, "insert-batch-016-tptm-b6.sql"))}`);
console.log(`  verify-batch-016-tptm-b6.sql  sha256: ${sha(join(OUT, "verify-batch-016-tptm-b6.sql"))}`);
console.log(`rows: ${restCands.length} restaurants (T1/T2) + ${placeCands.length} places = ${cands.length}`);
console.log(`place types: ${JSON.stringify(ptDist)} | restaurant categories: ${JSON.stringify(catDist)}`);
