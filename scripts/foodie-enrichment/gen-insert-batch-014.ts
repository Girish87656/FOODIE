/* ==================================================================
   gen-insert-batch-014.ts — Tirupati MASTER discovery Batch-014
   review-candidate generator (public.restaurants + public.places).
   ------------------------------------------------------------------
   Emits THREE artifacts, all REVIEW CANDIDATES — never executed by this repo:
     1. supabase/review-candidates/insert-batch-014-tptm-b3.sql
        27 evidence-curated rows from the batch-3 sweep eligibility review
        (2026-10-27):
          - 22 food venues -> public.restaurants  [Tier T1: independent
            identity-verification search confirmed the area; listing title
            supports name+category+locality]
          -  5 neighbourhood temples -> public.places [Tier T1, canonical
            names disambiguated by the locality carried in their listing
            titles — Vedullacheruvu / Bairagi Patteda / Nehru Nagar /
            Karakambadi / Gandhi Road]
     2. supabase/review-candidates/verify-batch-014-tptm-b3.sql (read-only probe)
     3. STDOUT reconciliation + SHA-256 of both files.

   ELIGIBILITY (reviewed by hand against the curated worksheet, 2026-10-27):
     * explicit audited 27-key list below;
     * status='curated', existingSet='new', tier T1|T2;
     * Batch-012's 29 rows and Batch-013's 57 rows EXCLUDED via id collision
       checks (drift = loud failure);
     * identity-HELD rows excluded (8 keys, documented in the SQL header):
       the 5 prior generic-name holds + 3 batch-3 holds (Tirumala Balaji
       Sweets name-drift guard vs the frozen batch-013 queued row,
       Tirumala Tea Stall conflicting-locality pair, Mirchi Bajji Point
       unresolved vs the Mangalam listing);
     * junk/social/directory/equipment rows dropped in curation with
       recorded reasons (audited in docs/tirupati-duplicate-review.md +
       curation log);
     * 2 "Perambur Srinivasa Sweets" listings cross-referenced to the LIVE
       production venue "Ps4 Restaurant" (brand pattern) — never re-imported.

   HONESTY (identical to batches 009-013):
     * deterministic uuid5 ids "foodie-tptm:Tirupati:<canonical name>";
     * verification_status 'unverified' on every row; name_verified,
       address_verified, coordinates_verified, last_verified_at ALL NULL
       (an import NEVER self-verifies);
     * coordinates NULL on EVERY row — no candidate in this batch has an
       area-gated Nominatim geocode; coordinates are never estimated;
     * restaurant addresses at LOCALITY level only (no street invented);
     * price_level/rating>0/opening_hours/phone/description: NOT invented;
     * tags only where the source title/page evidences them;
     * INSERT-only: no UPDATE, no DELETE, preserves all user content.

   GUARDS (fail-loud; same family as batches 012/013):
     * PREFLIGHT: b14 marker unused; zero id/slug/restaurant-name collisions
       (including against Batch-012's, Batch-013's and Batch-011's id sets);
       Batch-011 AND Batch-012 AND Batch-013 each fully absent or fully
       applied (never partial); exactly one ACTIVE tirupati destination.
     * Idempotent rerun: 0/27 fresh or 27/27 applied → no changes; 1-26 → abort.
     * POSTFLIGHT: exact 27-id set; unverified everywhere; ZERO coordinate
       rows; destination linkage; source_url mandatory; place_type
       distribution exact (temple 5).

   Determinism: running twice produces byte-identical files.
   ================================================================== */

import { writeFileSync, readFileSync } from "fs";
import { createHash } from "crypto";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");
const OUT = join(ROOT, "supabase", "review-candidates");
const WS = join(HERE, "worksheets", "tirupati-master-curated.json");
const B12_PATH = join(OUT, "insert-batch-012-tptm-master.sql");
const B13_PATH = join(OUT, "insert-batch-013-tptm-b2.sql");

const NAMESPACE = "6d3a0f5e-7b1c-4a2e-9d84-2f6a1c9e0b31"; // fixed project namespace (batch-009..013)
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

const MARKER = "tptm-master-b14";
const CITY = "Tirupati";

/* ---------------- curated worksheet ---------------- */

interface CuratedRow {
  key: string; name: string; area: string; group: string; target: string;
  category: string; placeType: string | null; tags: string[];
  sourceUrl: string; sourceKind: string | null; tier: string;
  existingSet: string; status: string; localityHint: string | null;
  geocode: { lat: number | null; lng: number | null; displayName: string | null; areaConfirmed?: boolean | null } | null;
}

const ws = JSON.parse(readFileSync(WS, "utf8")) as { rows: CuratedRow[] };
const byKey = new Map(ws.rows.map((r) => [r.key, r]));

/* the 27 audited keys (hand-reviewed 2026-10-27 against the curated list) */
const REST_KEYS = [
  "chandragiri::happi family dhaba",
  "renigunta::aha tiffens",
  "renigunta::chai ka damki mangalam",
  "renigunta::master sweets shop",
  "renigunta::sri gomathi bhavani lala sweets and bakery",
  "renigunta::svt tiffin center",
  "renigunta::tirumalai sweets and bakery",
  "renigunta::ujwal tiffin center",
  "surrounding::ap 39 cafe and restaurant",
  "tiruchanur::padmavathi juice center",
  "tirumala::balasubramanyam tea stall",
  "tirumala::prasadalayam ttd",
  "tpt-central::amrutha swagruha foods",
  "tpt-central::eswar sugar cane shop",
  "tpt-central::ganesh juice corner",
  "tpt-central::minerva coffee shop",
  "tpt-central::ramadevi foods store",
  "tpt-central::tea time srinivasa nagar",
  "tpt-central::the sugar cane co",
  "tpt-central::tirumala bakery",
  "tpt-neighbourhoods::renuka tiffin center",
  "tpt-neighbourhoods::ruchi tiffins",
];
const PLACE_KEYS = [
  "tpt-central::anjaneya swamy temple vedullacheruvu",
  "tpt-central::anjaneya temple bairagi patteda",
  "tpt-central::sri anjaneya swami temple karakambadi",
  "tpt-central::sri anjaneya swami temple nehru nagar",
  "tpt-central::sri bala anjaneya swamy temple",
];
/* identity-held keys — documented, never imported (5 batch-2 holds + 3 batch-3 holds) */
const HELD_KEYS = [
  "tpt-neighbourhoods::kafe",
  "tirumala::kafe tirupati",
  "tpt-neighbourhoods::anjaneya swamy temple",
  "tpt-neighbourhoods::sri vinayaka swamy temple",
  "tpt-neighbourhoods::mini park",
  "tirumala::tirumala balaji sweets", /* name-drift guard vs frozen batch-013 'Tirumala Balaji Sweets -' */
  "tirumala::tirumala tea stall",     /* conflicting locality listings */
  "tpt-central::mirchi bajji point",  /* unresolved vs the Mangalam listing */
];

function fetchRow(key: string, expectSet: "new" | "any"): CuratedRow {
  const r = byKey.get(key);
  if (!r) throw new Error(`DRIFT: curated worksheet missing key "${key}" — re-run curate-tirupati-master.ts`);
  if (expectSet === "new") {
    if (r.status !== "curated") throw new Error(`DRIFT: "${key}" status=${r.status}`);
    if (r.existingSet !== "new") throw new Error(`DRIFT: "${key}" existingSet=${r.existingSet}`);
    if (!["T1", "T2"].includes(r.tier)) throw new Error(`DRIFT: "${key}" tier=${r.tier} — only T1/T2 enter a batch`);
  }
  return r;
}
for (const k of [...REST_KEYS, ...PLACE_KEYS]) fetchRow(k, "new");
for (const k of HELD_KEYS) fetchRow(k, "any");

/* area label for restaurant addresses / place locality fallback */
const AREA_LABEL: Record<string, string> = {
  "tpt-central": "Tirupati",
  "tpt-neighbourhoods": "Tirupati",
  "tirumala": "Tirumala",
  "tiruchanur": "Tiruchanoor",
  "chandragiri": "Chandragiri",
  "renigunta": "Renigunta",
  "srinivasa-mangapuram": "Srinivasa Mangapuram",
};
/* per-key locality overrides where the hint and the area label are both
   weaker than the locality the listing title actually carries */
const EXPLICIT_REST_LOCALITY: Record<string, string> = {
  "surrounding::ap 39 cafe and restaurant": "Nagari",
};
const EXPLICIT_LOCALITY: Record<string, string> = {
  "tpt-central::sri bala anjaneya swamy temple": "Gandhi Road",
};

function localitySuffix(name: string): string | null {
  const i = name.lastIndexOf(", ");
  return i > 0 ? name.slice(i + 2).trim() : null;
}

/* ---------------- restaurants ---------------- */

const restRows = REST_KEYS.map((key) => {
  const r = fetchRow(key, "new");
  const label = r.localityHint ?? EXPLICIT_REST_LOCALITY[key] ?? AREA_LABEL[r.area] ?? "Tirupati";
  return {
    key, name: r.name, category: r.category,
    address: `${label}, Tirupati, Andhra Pradesh`,
    locality: label === "Tirupati" ? null : label,
    tags: r.tags.filter((t) => t !== "surrounding-corridor" || label !== "Tirupati"),
    sourceUrl: r.sourceUrl,
    geocode: r.geocode,
  };
});
for (const r of restRows) {
  if (r.geocode?.areaConfirmed && r.geocode.lat != null) {
    throw new Error(`FATAL: restaurant row "${r.key}" has an area-gated geocode — coordinates for restaurants were NOT reviewed; resolve manually before generating.`);
  }
  if (!r.sourceUrl) throw new Error(`FATAL: restaurant "${r.key}" has no source_url`);
}

/* ---------------- places ---------------- */

const PLACE_TYPES = ["temple", "waterfall", "fort", "zoo", "natural_arch", "other", "hotel"] as const;
type PlaceType = (typeof PLACE_TYPES)[number];

const placeRows = PLACE_KEYS.map((key) => {
  const r = fetchRow(key, "new");
  const placeType = (r.placeType ?? "other") as PlaceType;
  if (!PLACE_TYPES.includes(placeType)) throw new Error(`FATAL: "${key}" placeType "${placeType}" not in enum`);
  const locality = EXPLICIT_LOCALITY[key] ?? localitySuffix(r.name) ?? AREA_LABEL[r.area];
  if (!locality) throw new Error(`FATAL: "${key}" could not derive a locality`);
  const geo = r.geocode;
  /* curate-tirupati-master.ts stores geocodes ONLY when the OSM area gate passed,
     so lat != null already implies an area-gated, evidence-backed geocode */
  const coords = geo && geo.lat != null && geo.lng != null
    ? { lat: geo.lat, lng: geo.lng }
    : null;
  return {
    key, name: r.name, placeType, locality, tags: r.tags,
    sourceUrl: r.sourceUrl, coords, tier: r.tier,
  };
});

/* slugs: base = slugify(name minus locality suffix); on collision append locality */
const b12SqlText = readFileSync(B12_PATH, "utf8");
const b13SqlText = readFileSync(B13_PATH, "utf8");
const b12Slugs = new Set(Array.from(b12SqlText.matchAll(/^    '([a-z0-9-]+)',$/gm)).map((m) => m[1]));
const b13Slugs = new Set(Array.from(b13SqlText.matchAll(/^    '([a-z0-9-]+)',$/gm)).map((m) => m[1]));
const seenSlugs = new Set<string>();
const placeSlugs = new Map<string, string>();
for (const p of placeRows) {
  const suffix = localitySuffix(p.name);
  const base = slugify(suffix ? p.name.slice(0, p.name.length - suffix.length - 2) : p.name);
  let slug = base;
  if (seenSlugs.has(slug) || b12Slugs.has(slug) || b13Slugs.has(slug)) slug = `${base}-${slugify(p.locality)}`;
  if (seenSlugs.has(slug)) throw new Error(`FATAL: slug collision after fallback: ${slug}`);
  if (b12Slugs.has(slug)) throw new Error(`FATAL: slug collides with batch-012: ${slug}`);
  if (b13Slugs.has(slug)) throw new Error(`FATAL: slug collides with batch-013: ${slug}`);
  seenSlugs.add(slug);
  placeSlugs.set(p.key, slug);
}

/* ---------------- ids ---------------- */

const restIds = restRows.map((r) => ({ r, id: uuid5(`foodie-tptm:${CITY}:${r.name}`) }));
const placeIds = placeRows.map((r) => ({ r, id: uuid5(`foodie-tptm:${CITY}:${r.name}`) }));
const ALL_IDS = [...restIds.map((x) => x.id), ...placeIds.map((x) => x.id)];
if (new Set(ALL_IDS).size !== ALL_IDS.length) throw new Error("FATAL: id collision within batch-014");

/* batch-012/013 ids parsed from the committed review candidates (source of truth) */
const b12Ids = Array.from(b12SqlText.matchAll(/'([0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})'::uuid/g)).map((m) => m[1]);
const b13Ids = Array.from(b13SqlText.matchAll(/'([0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})'::uuid/g)).map((m) => m[1]);
if (new Set(b12Ids).size !== 29) throw new Error(`FATAL: expected 29 batch-012 ids in SQL, parsed ${new Set(b12Ids).size}`);
if (new Set(b13Ids).size !== 57) throw new Error(`FATAL: expected 57 batch-013 ids in SQL, parsed ${new Set(b13Ids).size}`);
for (const [label, frozen] of [["batch-012", b12Ids], ["batch-013", b13Ids]] as const) {
  const clash = ALL_IDS.filter((id) => frozen.includes(id));
  if (clash.length) throw new Error(`FATAL: batch-014 ids collide with ${label}: ${clash.join(", ")}`);
}

/* batch-011 ids (same list family as batch-012/013's generators) */
const BATCH011_ALL_IDS = [
  "596b875e-23d5-5458-95e6-1e60e9b0f2af", "2b7ae75d-18d3-53b8-99d7-7db09267c860",
  "53f276b4-549f-5f06-ad7d-fd7e20bf5e4e", "4da554ae-e148-5498-b3b7-3aa45f0835d1",
  "27c6e70b-673e-5c80-a3cf-4e8f530098d8", "74b454ed-cb0a-5cd9-9510-1ef251de5a8a",
  "9cbbed7e-b526-5167-ba53-30214cfe3c44", "550f0ee2-d898-5f44-9897-9fd72310d77f",
  "Sri Govindaraja Swamy Temple", "Sri Kapilatheertham Temple",
  "Sri Kalyana Venkateswara Swamy Temple", "ISKCON Tirupati",
  "Natural Arch, Tirumala hills (Silathoranam)", "Talakona Waterfall",
  "Chandragiri Fort", "Sri Venkateswara Zoological Park",
].map((n) => (n.includes("-") && n.length === 36 ? n : uuid5(`foodie-p4:Tirupati:${n}`)));
const b11clash = ALL_IDS.filter((id) => BATCH011_ALL_IDS.includes(id));
if (b11clash.length) throw new Error(`FATAL: batch-014 ids collide with batch-011: ${b11clash.join(", ")}`);

const ALL_SLUGS = PLACE_KEYS.map((k) => placeSlugs.get(k)!);

/* ---------------- SQL ---------------- */

const restValues = restIds.map(({ r, id }) => `  (
    '${id}'::uuid,
    ${sq(r.name)},
    '${r.category}',
    ${sq(r.address)},     -- locality-level address EXACTLY as the listing title supports (no street invented)
    ${sq(CITY)},
    ${r.locality ? sq(r.locality) : "null"},
    null,                  -- latitude: no area-gated geocode reviewed for restaurants — NEVER estimated
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

const placeValues = placeIds.map(({ r, id }) => {
  const slug = placeSlugs.get(r.key)!;
  const coordComment = r.coords
    ? `-- coordinates: OSM Nominatim AREA-GATED geocode (evidence: evidence/tirupati-master/geocode-*.json)`
    : `-- coordinates: no area-gated geocode passed for this candidate — NEVER estimated`;
  return `  (
    '${id}'::uuid,
    ${sq(slug)},
    '${r.placeType}',
    ${sq(r.name)},
    null,                    -- description: not captured — NEVER invented
    null,                    -- address: official/listing sources support locality only
    ${sq(r.locality)},
    ${sq(CITY)},
    v_dest_id,               -- resolved live active tirupati destination (exact-one guarded)
    ${r.coords ? r.coords.lat : "null"},
    ${r.coords ? r.coords.lng : "null"},
    ${coordComment},
    ${r.tags.length ? `array[${r.tags.map(sq).join(", ")}]::text[]` : "'{}'::text[]"},
    '${MARKER}',
    ${sq(r.sourceUrl)},
    null,                    -- last_verified_at: an import NEVER self-verifies
    null,                    -- name_verified (tri-state: NULL = not checked)
    null,                    -- address_verified (tri-state)
    null,                    -- coordinates_verified (tri-state)
    'unverified',
    true
  )`;
}).join(",\n");

const coordsCount = placeRows.filter((p) => p.coords).length;
const ptDist = placeRows.reduce<Record<string, number>>((a, r) => ((a[r.placeType] = (a[r.placeType] ?? 0) + 1), a), {});
const catDist = restRows.reduce<Record<string, number>>((a, r) => ((a[r.category] = (a[r.category] ?? 0) + 1), a), {});

const SQL = `-- ===========================================================================
-- insert-batch-014-tptm-b3.sql — REVIEW CANDIDATE (NEVER executed by the repo)
-- Tirupati MASTER place discovery — Batch 014 (batch-3 sweep eligibility
-- review, 2026-10-27)
-- Generated by scripts/foodie-enrichment/gen-insert-batch-014.ts (deterministic).
-- ===========================================================================
--
-- SCOPE (27 rows; tiers per docs/tirupati-place-inventory.md):
--   * 22 food venues -> public.restaurants [Tier T1: independent identity
--     verification search confirmed the area; listing title supports
--     name+category+locality. Evidence: evidence/tirupati-master/verify-*.json]
--     (categories: ${Object.entries(catDist).map(([k, v]) => `${k} ${v}`).join(", ")})
--   *  5 neighbourhood temples -> public.places [Tier T1; canonical names
--     disambiguated with the locality carried in their listing titles]
--     (place types: temple ${ptDist.temple})
--
-- ELIGIBILITY REVIEW (2026-10-27, hand-audited against the curated worksheet):
--   49 newly verify-confirmed candidates were reviewed individually:
--     - 27 admitted (this batch) — identity and category both sound;
--     - 22 dropped with recorded reasons: 5 social-media posts (prasadam /
--       fan-page / Q&A), 5 generic directory pages, 2 equipment-dealer
--       category pages, 1 generic listing name without business identity,
--       1 organisation listing (TTD), 3 TTD facilities caught by a food
--       sweep (Pilgrims Waiting Halls / Sudarshan Nc1 / Govinda Nilayam —
--       retained in raw evidence for a future facilities review),
--       1 trade shop without food-category evidence, 4 dropped via
--       merged/cleaned duplicates;
--     - 2 "Perambur Srinivasa Sweets" listings cross-referenced to the LIVE
--       production venue "Ps4 Restaurant" (brand pattern) — not re-imported;
--     - 3 identity-HELD (see below) + 1 additional hold.
--
-- IDENTITY-HELD (stay in the internal inventory only, never SQL):
--   batch-2 holds: "Kafe", "Kafe Tirupati", "Anjaneya Swamy Temple"
--   (neighbourhood), "Sri Vinayaka Swamy Temple" (neighbourhood), "Mini Park";
--   batch-3 holds: "Tirumala Balaji Sweets" (canonical name drifted from the
--   frozen batch-013 queued row 'Tirumala Balaji Sweets -' — venue already
--   queued; reconcile before any import), "Tirumala Tea Stall" (conflicting
--   locality listings: Khadi Colony vs Reddy & Reddy Colony), "Mirchi Bajji
--   Point" (unresolved against the Mangalam listing in the dup queue).
--
-- COORDINATES HONESTY: ${coordsCount === 0 ? "NO row carries coordinates — no candidate in this batch has an area-gated Nominatim geocode; coordinates are never estimated" : `${coordsCount} row(s) carry area-gated geocodes`} .
--
-- EXCLUSIONS (honest accounting):
--   * Batch-012's 29 rows and Batch-013's 57 rows are NOT duplicated
--     (id collision guards assert this both at generation and in preflight).
--   * Batch-011's 16 owner-blocked candidates are NOT duplicated.
--
-- HONESTY (identical to batches 009-013): deterministic uuid5 ids
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
do $pf014$
declare
  v_marker integer; v_dup_ids integer; v_dup_slugs integer; v_dup_names integer;
  v_dest_total integer; v_dest_active integer; v_b11 integer; v_b12 integer; v_b13 integer; v_rest_marker integer;
begin
  select count(*) into v_marker from public.places where source = '${MARKER}';
  if v_marker <> 0 then
    raise exception 'PREFLIGHT FAIL: % places row(s) already carry ${MARKER} — batch applied (at least partially).', v_marker;
  end if;
  select count(*) into v_rest_marker from public.restaurants where source = '${MARKER}';
  if v_rest_marker <> 0 then
    raise exception 'PREFLIGHT FAIL: % restaurants row(s) already carry ${MARKER} — batch applied (at least partially).', v_rest_marker;
  end if;
  raise notice 'PREFLIGHT OK: ${MARKER} markers unused.';

  select count(*) into v_dup_ids from public.places where id in (${ALL_IDS.map((i) => `'${i}'`).join(", ")});
  if v_dup_ids <> 0 then
    raise exception 'PREFLIGHT FAIL: % batch-014 place ids already exist — importing would collide.', v_dup_ids;
  end if;
  select count(*) into v_dup_ids from public.restaurants where id in (${ALL_IDS.map((i) => `'${i}'`).join(", ")});
  if v_dup_ids <> 0 then
    raise exception 'PREFLIGHT FAIL: % batch-014 ids already exist in restaurants — importing would collide.', v_dup_ids;
  end if;
  raise notice 'PREFLIGHT OK: no id collisions.';

  select count(*) into v_dup_slugs from public.places where slug in (${ALL_SLUGS.map((s) => sq(s)).join(", ")});
  if v_dup_slugs <> 0 then
    raise exception 'PREFLIGHT FAIL: % batch-014 slugs already exist — importing would collide.', v_dup_slugs;
  end if;
  raise notice 'PREFLIGHT OK: no slug collisions.';

  select count(*) into v_dup_names from public.restaurants
   where lower(btrim(name)) in (${restRows.map((r) => `lower(btrim(${sq(r.name)}))`).join(", ")});
  if v_dup_names <> 0 then
    raise exception 'PREFLIGHT FAIL: % batch-014 restaurant names already exist — importing would duplicate rows.', v_dup_names;
  end if;
  raise notice 'PREFLIGHT OK: no restaurant name collisions.';

  select count(*) into v_b11 from public.places where id in (${BATCH011_ALL_IDS.map((i) => `'${i}'`).join(", ")});
  if v_b11 not in (0, 16) then
    raise exception 'PREFLIGHT FAIL: Batch-011 rows PARTIALLY present (%) — owner review required before batch-014.', v_b11;
  end if;
  raise notice 'PREFLIGHT OK: Batch-011 state coherent (%/16 present).', v_b11;

  select count(*) into v_b12 from public.places where id in (${b12Ids.map((i) => `'${i}'`).join(", ")});
  v_b12 := v_b12 + (select count(*) from public.restaurants where id in (${b12Ids.map((i) => `'${i}'`).join(", ")}));
  if v_b12 not in (0, 29) then
    raise exception 'PREFLIGHT FAIL: Batch-012 rows PARTIALLY present (%) — owner review required before batch-014.', v_b12;
  end if;
  raise notice 'PREFLIGHT OK: Batch-012 state coherent (%/29 present).', v_b12;

  select count(*) into v_b13 from public.places where id in (${b13Ids.map((i) => `'${i}'`).join(", ")});
  v_b13 := v_b13 + (select count(*) from public.restaurants where id in (${b13Ids.map((i) => `'${i}'`).join(", ")}));
  if v_b13 not in (0, 57) then
    raise exception 'PREFLIGHT FAIL: Batch-013 rows PARTIALLY present (%) — owner review required before batch-014.', v_b13;
  end if;
  raise notice 'PREFLIGHT OK: Batch-013 state coherent (%/57 present).', v_b13;

  select count(*), count(*) filter (where is_active) into v_dest_total, v_dest_active
    from public.destinations where slug = 'tirupati';
  if v_dest_total <> 1 or v_dest_active <> 1 then
    raise exception 'PREFLIGHT FAIL: expected exactly 1 active tirupati destination (got % total / % active).', v_dest_total, v_dest_active;
  end if;
  raise notice 'PREFLIGHT OK: tirupati destination present and active.';
end
$$;

-- ---------------------------------------------------------------------------
-- Part 1 — INSERTS (22 Tier-T1 restaurant rows; fixed ids; full provenance)
-- ---------------------------------------------------------------------------
insert into public.restaurants
  (id, name, category, address, city, locality, latitude, longitude, rating, price_level, opening_hours, phone, tags, source, source_url, verification_status)
values
${restValues}
;

-- ---------------------------------------------------------------------------
-- Part 2 — INSERTS (5 Tier-T1 place rows into public.places)
-- ---------------------------------------------------------------------------
do $ins014$
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
${placeValues}
  ;
  raise notice 'INSERT OK: 5 batch-014 place rows inserted.';
end
$ins014$;

-- ---------------------------------------------------------------------------
-- POSTFLIGHT: hard guards (any violation → COMMIT below never runs → rollback)
-- ---------------------------------------------------------------------------
do $post014$
declare
  v_rest integer; v_places integer; v_unver integer; v_coords integer;
  v_nolink integer; v_nosrc integer; v_temple integer;
begin
  select count(*) into v_rest from public.restaurants where source = '${MARKER}';
  if v_rest <> 22 then
    raise exception 'POSTFLIGHT FAIL: expected 22 batch-014 restaurant rows, found %.', v_rest;
  end if;
  select count(*) into v_places from public.places where source = '${MARKER}';
  if v_places <> 5 then
    raise exception 'POSTFLIGHT FAIL: expected 5 batch-014 place rows, found %.', v_places;
  end if;

  select count(*) into v_unver from public.restaurants where source = '${MARKER}' and verification_status <> 'unverified';
  v_unver := v_unver + (select count(*) from public.places where source = '${MARKER}' and verification_status <> 'unverified');
  if v_unver <> 0 then
    raise exception 'POSTFLIGHT FAIL: % rows are not unverified — an import never self-verifies.', v_unver;
  end if;

  select count(*) into v_coords from public.restaurants where source = '${MARKER}' and (latitude is not null or longitude is not null);
  v_coords := v_coords + (select count(*) from public.places where source = '${MARKER}' and latitude is not null);
  if v_coords <> ${coordsCount} then
    raise exception 'POSTFLIGHT FAIL: expected exactly ${coordsCount} evidenced coordinate row, found %.', v_coords;
  end if;

  select count(*) into v_nolink from public.places where source = '${MARKER}' and destination_id is null;
  if v_nolink <> 0 then
    raise exception 'POSTFLIGHT FAIL: % place rows missing destination linkage.', v_nolink;
  end if;

  select count(*) into v_nosrc from public.places where source = '${MARKER}' and (source_url is null or source_url = '');
  if v_nosrc <> 0 then
    raise exception 'POSTFLIGHT FAIL: % place rows missing source_url.', v_nosrc;
  end if;

  select count(*) filter (where place_type = 'temple') into v_temple
    from public.places where source = '${MARKER}';
  if v_temple <> ${ptDist.temple} then
    raise exception 'POSTFLIGHT FAIL: place_type distribution drifted (temple=%; expected ${ptDist.temple}).', v_temple;
  end if;
  raise notice 'POSTFLIGHT OK: 27 rows verified (22 restaurants + 5 places; temple ${ptDist.temple}).';
end
$post014$;

commit;
`;

const VERIFY_SQL = `-- ===========================================================================
-- verify-batch-014-tptm-b3.sql — READ-ONLY state probe (PRE/POST review aid)
-- ===========================================================================
select 'restaurants_b14' as what, count(*) as n from public.restaurants where source = '${MARKER}'
union all
select 'places_b14', count(*) from public.places where source = '${MARKER}'
union all
select 'places_b14_unverified', count(*) from public.places where source = '${MARKER}' and verification_status = 'unverified'
union all
select 'places_b14_with_coords', count(*) from public.places where source = '${MARKER}' and latitude is not null
union all
select 'batch012_present', count(*) from public.places where id in (${b12Ids.map((i) => `'${i}'`).join(", ")})
union all
select 'batch013_present', count(*) from public.places where id in (${b13Ids.map((i) => `'${i}'`).join(", ")})
union all
select 'batch011_present', count(*) from public.places where id in (${BATCH011_ALL_IDS.map((i) => `'${i}'`).join(", ")});
`;

writeFileSync(join(OUT, "insert-batch-014-tptm-b3.sql"), SQL);
writeFileSync(join(OUT, "verify-batch-014-tptm-b3.sql"), VERIFY_SQL);

const sha = (p: string) => createHash("sha256").update(readFileSync(p)).digest("hex");
console.log("batch-014 review candidates written:");
console.log("  insert-batch-014-tptm-b3.sql  sha256:", sha(join(OUT, "insert-batch-014-tptm-b3.sql")));
console.log("  verify-batch-014-tptm-b3.sql  sha256:", sha(join(OUT, "verify-batch-014-tptm-b3.sql")));
console.log(`rows: ${restRows.length} restaurants (T1) + ${placeRows.length} places = ${restRows.length + placeRows.length}`);
console.log("place types:", JSON.stringify(ptDist), "| restaurant categories:", JSON.stringify(catDist), "| coord rows:", coordsCount);
