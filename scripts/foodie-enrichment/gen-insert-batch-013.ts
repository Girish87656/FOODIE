/* ==================================================================
   gen-insert-batch-013.ts — Tirupati MASTER discovery Batch-013
   review-candidate generator (public.restaurants + public.places).
   ------------------------------------------------------------------
   Emits THREE artifacts, all REVIEW CANDIDATES — never executed by this repo:
     1. supabase/review-candidates/insert-batch-013-tptm-b2.sql
        57 evidence-curated rows from the batch-2 sweep (2026-10-26):
          - 17 food venues  -> public.restaurants  [Tier T1: independent
            identity-verification search confirmed the area; listing title
            supports name+category+locality]
          - 40 POI/stays    -> public.places       [28 TTD rest houses from the
            OFFICIAL RestHousesInTirumala.aspx rates page + 9 official TTD-region
            temples (MoreTemples/PlacesatTirumala pages) + Deer Park Alipari +
            Sri Venkateswara National Park]
     2. supabase/review-candidates/verify-batch-013-tptm-b2.sql (read-only probe)
     3. STDOUT reconciliation + SHA-256 of both files.

   ELIGIBILITY (enforced against the curated worksheet):
     * explicit audited 57-key list below (hand-audited 2026-10-26);
     * status='curated', existingSet='new', tier T1|T2;
     * Batch-012's 29 rows EXCLUDED via the same key list (drift = loud failure);
     * 5 identity-HELD rows excluded (documented in the SQL header):
       vague/generic names kept in the internal inventory, never SQL;
     * 8 listing-noise rows and 1 Batch-011 alias were dropped earlier in
       curation (audited in docs/tirupati-duplicate-review.md + curation log).

   HONESTY (identical to batches 009-012):
     * deterministic uuid5 ids "foodie-tptm:Tirupati:<canonical name>";
     * verification_status 'unverified' everywhere; last_verified_at,
       name_verified, address_verified, coordinates_verified ALL NULL
       (an import NEVER self-verifies);
     * coordinates NULL except ONE row — Sri Venkateswara National Park —
       which carries an OSM Nominatim AREA-GATED geocode (evidence:
       evidence/tirupati-master/geocode-*.json). Coordinates are never
       estimated; where no gate-passed geocode exists they stay NULL;
     * restaurant addresses at LOCALITY level only (no street invented);
     * price_level/rating>0/opening_hours/phone/description: NOT invented;
     * tags only where the source title/page evidences them;
     * INSERT-only: no UPDATE, no DELETE, preserves all user content.

   GUARDS (fail-loud; same family as batch-012):
     * PREFLIGHT: b13 marker unused; zero id/slug/restaurant-name collisions
      (including against Batch-012's and Batch-011's id sets); Batch-011 AND
      Batch-012 each fully absent or fully applied (never partial); exactly
      one ACTIVE tirupati destination.
     * Idempotent rerun: 0/57 fresh or 57/57 applied → no changes; 1-56 → abort.
     * POSTFLIGHT: exact 57-id set; unverified everywhere; coordinates on
      exactly 1 evidenced row; destination linkage; source_url mandatory;
      place_type distribution exact (temple 9 / hotel 29 / other 2).

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
const B12_SQL = join(OUT, "insert-batch-012-tptm-master.sql");
const B12_PATH = join(OUT, "insert-batch-012-tptm-master.sql");

const NAMESPACE = "6d3a0f5e-7b1c-4a2e-9d84-2f6a1c9e0b31"; // fixed project namespace (batch-009..012)
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

const MARKER = "tptm-master-b13";
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

/* the 57 audited keys (hand-reviewed 2026-10-26 against the curated list) */
const REST_KEYS = [
  "chandragiri::bnr sweets and bakery",
  "chandragiri::kk tea stall",
  "chandragiri::sri nandini bakery and sweets",
  "renigunta::bangalore ayengar bakery",
  "renigunta::mamatha s coffee cafe",
  "renigunta::sri laxmi sweet stall and bakery",
  "renigunta::zamzam restaurant",
  "tiruchanur::giri prasad cafe",
  "tiruchanur::nandini sweets and bakery tiruchanur",
  "tiruchanur::sri venkateswara sweet and bakery",
  "tirumala::guptha balaji sweets",
  "tirumala::tirumala balaji sweets",
  "tirumala::tirumala cafe",
  "tpt-central::tirumala sweets",
  "tpt-neighbourhoods::amor fati cafe",
  "tpt-neighbourhoods::iyer s cafe",
  "tpt-neighbourhoods::retro cafe and restaurant",
];
const PLACE_KEYS = [
  "surrounding::sri kari manikya swamy temple nagari",
  "surrounding::sri konetiraya swamy temple keelapatla",
  "surrounding::sri lakshmi narasimha swamy temple tarigonda",
  "surrounding::sri prasanna venkateswara swamy temple kosuvari palle",
  "surrounding::sri vedanarayana swamy temple nagalapuram",
  "surrounding::sri venugopala swamy temple karvetinagaram",
  "surrounding::srikalahasteeswara temple",
  "tirumala::alwar tank cottages tirumala",
  "tirumala::ampro rest house tirumala",
  "tirumala::anjanadri nagar cottages tirumala",
  "tirumala::bela kuteeram tirumala",
  "tirumala::garudadri nagar cottages tirumala",
  "tirumala::gayathri sadan tirumala",
  "tirumala::hari sadan guest house tirumala",
  "tirumala::hill view cottages tirumala",
  "tirumala::indira rest house tirumala",
  "tirumala::jagannadha bhavan tirumala",
  "tirumala::karam nivas tirumala",
  "tirumala::lakshmi nivas tirumala",
  "tirumala::mangala bavi cottages tirumala",
  "tirumala::narayanagiri guest house tirumala",
  "tirumala::rajyalakshmi guest house tirumala",
  "tirumala::ram bagicha guest house tirumala",
  "tirumala::sp guest house tirumala",
  "tirumala::sanku mitta cottages tirumala",
  "tirumala::seshadri nagar cottages tirumala",
  "tirumala::sri anjaneyaswami temple tirumala",
  "tirumala::sri venkateswara guest house tirumala",
  "tirumala::srinikethan tirumala",
  "tirumala::srinivasa nilayam tirumala",
  "tirumala::srivari kuteer guest house tirumala",
  "tirumala::surapuram thota cottages tirumala",
  "tirumala::tb cottages tirumala",
  "tirumala::valley view cottages tirumala",
  "tirumala::venkata vijayam guest house tirumala",
  "tirumala::vidya sadan tirumala",
  "tpt-central::deer park alipiri",
  "tpt-central::sri kodanda ramaswamy temple tirupati",
  "tpt-central::sri venkateswara guest house tirupati",
  "tpt-central::sri venkateswara national park",
];

/* exclusions that must still be present as curated rows (drift detection) */
const B12_EXCLUDED_KEYS = [
  "tirumala::sri varahaswamy temple tirumala", // = Batch-012 "Sri Bhu Varahaswamy Temple" (TTD dual naming)
  "tirumala::sri bedi anjaneya swamy temple tirumala",
  "tirumala::sri venkateswara museum tirumala",
  "tirumala::swami pushkarini",
  "tirumala::sri hathiramjee mutt tirumala",
  "tirumala::akasha ganga theertham",
  "tirumala::chakra theertham",
  "tirumala::vaikuntha teertham",
  "tirumala::papavinasam theertham",
  "tpt-central::sreenivasam complex ttd pilgrim accommodation",
  "tpt-central::sri venkateswara dharmasala ttd",
  "tpt-central::sri govindaraja swamy dharmasala ttd",
  "tpt-central::vishnu nivasam ttd free accommodation",
  "tiruchanur::sri krishna swamy temple alagiyaperumal shrine tiruchanoor",
  "tiruchanur::sri varada raja swamy temple tiruchanoor",
  "tiruchanur::sri suryanarayana swamy temple tiruchanoor",
  "surrounding::sri prasanna venkateswara swamy temple appalayagunta",
  "surrounding::sri sridevi bhudevi sametha thondamanadu temple",
  "tpt-central::regional science centre tirupati",
  "tpt-central::garuda cafe",
  "tpt-central::bhai ka biryani",
  "tpt-neighbourhoods::mayuri restaurant",
  "tpt-neighbourhoods::manju foods",
  "tpt-neighbourhoods::shankar chats",
  "tpt-neighbourhoods::chillies restaurant",
  "tpt-neighbourhoods::southern spice avilala",
  "tirumala::srinivasam restaurant",
  "tirumala::anandan vasavi vegetarian restaurant",
  "tirumala::meenakshi pure veg restaurant",
];
const HELD_KEYS = [
  "tpt-neighbourhoods::kafe",
  "tirumala::kafe tirupati",
  "tpt-neighbourhoods::anjaneya swamy temple",
  "tpt-neighbourhoods::sri vinayaka swamy temple",
  "tpt-neighbourhoods::mini park",
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
for (const k of [...B12_EXCLUDED_KEYS, ...HELD_KEYS]) fetchRow(k, "any");

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
/* explicit locality for the two suffix-less place rows */
const EXPLICIT_LOCALITY: Record<string, string> = {
  "surrounding::srikalahasteeswara temple": "Srikalahasti",
  "tpt-central::sri venkateswara national park": "Tirupati",
};

function localitySuffix(name: string): string | null {
  const i = name.lastIndexOf(", ");
  return i > 0 ? name.slice(i + 2).trim() : null;
}

/* ---------------- restaurants ---------------- */

const restRows = REST_KEYS.map((key) => {
  const r = fetchRow(key, "new");
  const label = r.localityHint ?? AREA_LABEL[r.area] ?? "Tirupati";
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
const b12Slugs = new Set(Array.from(b12SqlText.matchAll(/^    '([a-z0-9-]+)',$/gm)).map((m) => m[1]));
const seenSlugs = new Set<string>();
const placeSlugs = new Map<string, string>();
for (const p of placeRows) {
  const suffix = localitySuffix(p.name);
  const base = slugify(suffix ? p.name.slice(0, p.name.length - suffix.length - 2) : p.name);
  let slug = base;
  if (seenSlugs.has(slug) || b12Slugs.has(slug)) slug = `${base}-${slugify(p.locality)}`;
  if (seenSlugs.has(slug)) throw new Error(`FATAL: slug collision after fallback: ${slug}`);
  if (b12Slugs.has(slug)) throw new Error(`FATAL: slug collides with batch-012: ${slug}`);
  seenSlugs.add(slug);
  placeSlugs.set(p.key, slug);
}

/* ---------------- ids ---------------- */

const restIds = restRows.map((r) => ({ r, id: uuid5(`foodie-tptm:${CITY}:${r.name}`) }));
const placeIds = placeRows.map((r) => ({ r, id: uuid5(`foodie-tptm:${CITY}:${r.name}`) }));
const ALL_IDS = [...restIds.map((x) => x.id), ...placeIds.map((x) => x.id)];
if (new Set(ALL_IDS).size !== ALL_IDS.length) throw new Error("FATAL: id collision within batch-013");

/* batch-012 ids parsed from the committed review candidate (source of truth) */
const b12Ids = Array.from(b12SqlText.matchAll(/'([0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})'::uuid/g)).map((m) => m[1]);
if (new Set(b12Ids).size !== 29) throw new Error(`FATAL: expected 29 batch-012 ids in SQL, parsed ${new Set(b12Ids).size}`);
const clash = ALL_IDS.filter((id) => b12Ids.includes(id));
if (clash.length) throw new Error(`FATAL: batch-013 ids collide with batch-012: ${clash.join(", ")}`);

/* batch-011 ids (same list family as batch-012's generator) */
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
if (b11clash.length) throw new Error(`FATAL: batch-013 ids collide with batch-011: ${b11clash.join(", ")}`);

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
-- insert-batch-013-tptm-b2.sql — REVIEW CANDIDATE (NEVER executed by the repo)
-- Tirupati MASTER place discovery — Batch 013 (batch-2 sweep, 2026-10-26)
-- Generated by scripts/foodie-enrichment/gen-insert-batch-013.ts (deterministic).
-- ===========================================================================
--
-- SCOPE (57 rows; tiers per docs/tirupati-place-inventory.md):
--   * 17 food venues -> public.restaurants [Tier T1: independent identity
--     verification search confirmed the area; listing title supports
--     name+category+locality. Evidence: evidence/tirupati-master/verify-*.json]
--     (categories: ${Object.entries(catDist).map(([k, v]) => `${k} ${v}`).join(", ")})
--   * 40 POI/stays   -> public.places
--     (place types: temple ${ptDist.temple}, hotel ${ptDist.hotel}, other ${ptDist.other})
--     - 28 TTD rest houses/cottages from the OFFICIAL RestHousesInTirumala.aspx
--       rates page (fetched HTTP 200 2026-10-26, verbatim quotes in
--       evidence/tirupati-master/official/ttd-RestHousesInTirumala.html)
--     - 9 TTD-region temples from official MoreTemples.aspx / PlacesatTirumala.aspx
--       (incl. Srikalahasteeswara Temple, Tier T1)
--     - Deer Park Alipiri (T1) + Sri Venkateswara National Park (T1)
--
-- COORDINATES HONESTY: exactly ${coordsCount} row (Sri Venkateswara National Park)
-- carries coordinates, from an OSM Nominatim AREA-GATED geocode (evidence file
-- committed). Every other row: NULL — no gate-passed geocode, never estimated.
--
-- EXCLUSIONS (honest accounting):
--   * Batch-012's 29 rows are NOT duplicated (alias renames after the batch-012
--     snapshot — Sri Bhu Varahaswamy/Bedi Anjaneya canonicals — are matched by
--     key and asserted below).
--   * Batch-011's 16 owner-blocked candidates are NOT duplicated.
--   * 5 identity-HELD candidates stay in the internal inventory only:
--     "Kafe", "Kafe Tirupati", "Anjaneya Swamy Temple" (neighbourhood),
--     "Sri Vinayaka Swamy Temple" (neighbourhood), "Mini Park" — names too
--     generic to admit as distinct places without stronger identity evidence.
--   * 8 listing-noise rows (video/article/directory titles) were dropped in
--     curation with recorded reasons; 87 Tier-T3 candidates remain backlog.
--
-- HONESTY (identical to batches 009-012): deterministic uuid5 ids
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
do $pf013$
declare
  v_marker integer; v_dup_ids integer; v_dup_slugs integer; v_dup_names integer;
  v_dest_total integer; v_dest_active integer; v_b11 integer; v_b12 integer; v_rest_marker integer;
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

  select count(*) into v_dup_ids from public.places where id in (${ALL_IDS.join(", ")});
  if v_dup_ids <> 0 then
    raise exception 'PREFLIGHT FAIL: % batch-013 place ids already exist — importing would collide.', v_dup_ids;
  end if;
  select count(*) into v_dup_ids from public.restaurants where id in (${ALL_IDS.join(", ")});
  if v_dup_ids <> 0 then
    raise exception 'PREFLIGHT FAIL: % batch-013 ids already exist in restaurants — importing would collide.', v_dup_ids;
  end if;
  raise notice 'PREFLIGHT OK: no id collisions.';

  select count(*) into v_dup_slugs from public.places where slug in (${ALL_SLUGS.map((s) => sq(s)).join(", ")});
  if v_dup_slugs <> 0 then
    raise exception 'PREFLIGHT FAIL: % batch-013 slugs already exist — importing would collide.', v_dup_slugs;
  end if;
  raise notice 'PREFLIGHT OK: no slug collisions.';

  select count(*) into v_dup_names from public.restaurants
   where lower(btrim(name)) in (${restRows.map((r) => `lower(btrim(${sq(r.name)}))`).join(", ")});
  if v_dup_names <> 0 then
    raise exception 'PREFLIGHT FAIL: % batch-013 restaurant names already exist — importing would duplicate rows.', v_dup_names;
  end if;
  raise notice 'PREFLIGHT OK: no restaurant name collisions.';

  select count(*) into v_b11 from public.places where id in (${BATCH011_ALL_IDS.join(", ")});
  if v_b11 not in (0, 16) then
    raise exception 'PREFLIGHT FAIL: Batch-011 rows PARTIALLY present (%) — owner review required before batch-013.', v_b11;
  end if;
  raise notice 'PREFLIGHT OK: Batch-011 state coherent (%/16 present).', v_b11;

  select count(*) into v_b12 from public.places where id in (${b12Ids.join(", ")});
  v_b12 := v_b12 + (select count(*) from public.restaurants where id in (${b12Ids.join(", ")}));
  if v_b12 not in (0, 29) then
    raise exception 'PREFLIGHT FAIL: Batch-012 rows PARTIALLY present (%) — owner review required before batch-013.', v_b12;
  end if;
  raise notice 'PREFLIGHT OK: Batch-012 state coherent (%/29 present).', v_b12;

  select count(*), count(*) filter (where is_active) into v_dest_total, v_dest_active
    from public.destinations where slug = 'tirupati';
  if v_dest_total <> 1 or v_dest_active <> 1 then
    raise exception 'PREFLIGHT FAIL: expected exactly 1 active tirupati destination (got % total / % active).', v_dest_total, v_dest_active;
  end if;
  raise notice 'PREFLIGHT OK: tirupati destination present and active.';
end
$$;

-- ---------------------------------------------------------------------------
-- Part 1 — INSERTS (17 Tier-T1 restaurant rows; fixed ids; full provenance)
-- ---------------------------------------------------------------------------
insert into public.restaurants
  (id, name, category, address, city, locality, latitude, longitude, rating, price_level, opening_hours, phone, tags, source, source_url, verification_status)
values
${restValues}
;

-- ---------------------------------------------------------------------------
-- Part 2 — INSERTS (40 Tier-T1/T2 place rows into public.places)
-- ---------------------------------------------------------------------------
do $ins013$
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
  raise notice 'INSERT OK: 40 batch-013 place rows inserted.';
end
$ins013$;

-- ---------------------------------------------------------------------------
-- POSTFLIGHT: hard guards (any violation → COMMIT below never runs → rollback)
-- ---------------------------------------------------------------------------
do $post013$
declare
  v_rest integer; v_places integer; v_unver integer; v_coords integer;
  v_nolink integer; v_nosrc integer; v_temple integer; v_hotel integer; v_other integer;
begin
  select count(*) into v_rest from public.restaurants where source = '${MARKER}';
  if v_rest <> 17 then
    raise exception 'POSTFLIGHT FAIL: expected 17 batch-013 restaurant rows, found %.', v_rest;
  end if;
  select count(*) into v_places from public.places where source = '${MARKER}';
  if v_places <> 40 then
    raise exception 'POSTFLIGHT FAIL: expected 40 batch-013 place rows, found %.', v_places;
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

  select
    count(*) filter (where place_type = 'temple'),
    count(*) filter (where place_type = 'hotel'),
    count(*) filter (where place_type = 'other')
    into v_temple, v_hotel, v_other
    from public.places where source = '${MARKER}';
  if v_temple <> ${ptDist.temple} or v_hotel <> ${ptDist.hotel} or v_other <> ${ptDist.other} then
    raise exception 'POSTFLIGHT FAIL: place_type distribution drifted (temple=% hotel=% other=%; expected ${ptDist.temple}/${ptDist.hotel}/${ptDist.other}).', v_temple, v_hotel, v_other;
  end if;
  raise notice 'POSTFLIGHT OK: 57 rows verified (17 restaurants + 40 places; temple ${ptDist.temple}, hotel ${ptDist.hotel}, other ${ptDist.other}).';
end
$post013$;

commit;
`;

const VERIFY_SQL = `-- ===========================================================================
-- verify-batch-013-tptm-b2.sql — READ-ONLY state probe (PRE/POST review aid)
-- ===========================================================================
select 'restaurants_b13' as what, count(*) as n from public.restaurants where source = '${MARKER}'
union all
select 'places_b13', count(*) from public.places where source = '${MARKER}'
union all
select 'places_b13_unverified', count(*) from public.places where source = '${MARKER}' and verification_status = 'unverified'
union all
select 'places_b13_with_coords', count(*) from public.places where source = '${MARKER}' and latitude is not null
union all
select 'batch012_present', count(*) from public.places where id in (${b12Ids.join(", ")})
union all
select 'batch011_present', count(*) from public.places where id in (${BATCH011_ALL_IDS.join(", ")});
`;

writeFileSync(join(OUT, "insert-batch-013-tptm-b2.sql"), SQL);
writeFileSync(join(OUT, "verify-batch-013-tptm-b2.sql"), VERIFY_SQL);

const sha = (p: string) => createHash("sha256").update(readFileSync(p)).digest("hex");
console.log("batch-013 review candidates written:");
console.log("  insert-batch-013-tptm-b2.sql  sha256:", sha(join(OUT, "insert-batch-013-tptm-b2.sql")));
console.log("  verify-batch-013-tptm-b2.sql  sha256:", sha(join(OUT, "verify-batch-013-tptm-b2.sql")));
console.log(`rows: ${restRows.length} restaurants (T1) + ${placeRows.length} places = ${restRows.length + placeRows.length}`);
console.log("place types:", JSON.stringify(ptDist), "| restaurant categories:", JSON.stringify(catDist), "| coord rows:", coordsCount);
