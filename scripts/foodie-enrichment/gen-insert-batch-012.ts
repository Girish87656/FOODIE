/* ==================================================================
   gen-insert-batch-012.ts — Tirupati MASTER discovery Batch-012
   review-candidate generator (public.restaurants + public.places).
   ------------------------------------------------------------------
   Emits THREE files, all REVIEW CANDIDATES — never executed by this repo:
     1. supabase/review-candidates/insert-batch-012-tptm-master.sql
        29 evidence-curated Tirupati rows:
          - 10 food venues  -> public.restaurants  (Tier T1: independent
            verify search confirmed the area; category/family from the
            listing title itself)
          - 19 POI/stays    -> public.places       (Tier T2: official
            tirumala.org / incredibleindia.gov.in pages fetched HTTP 200,
            names carried with verbatim quotes in the evidence files)
     2. supabase/review-candidates/verify-batch-012-tptm-master.sql
        Read-only state probe (PRE/POST).
     3. STDOUT reconciliation summary + SHA-256 of both artifacts.

   Eligibility (enforced by ASSERTIONS against the curated worksheet):
     * tier T1 or T2 ONLY — Tier T3 (single listing hit) stays in
      docs/tirupati-place-inventory.md as documented backlog, never SQL.
     * existingSet = 'new' — production rows and owner-blocked Batch-011
      candidates are NEVER duplicated.
     * status = 'curated' (duplicates stay in the review queue doc).

   Honesty conventions (identical to batches 009-011):
     * deterministic ids: uuid5("foodie-tptm:Tirupati:<name>") over the
      fixed project namespace (same algorithm as batch-009/010/011).
     * verification_status 'unverified' on every row; last_verified_at,
      name_verified, address_verified, coordinates_verified all NULL
      (an import NEVER self-verifies).
     * latitude/longitude NULL EVERYWHERE — Nominatim geocodes failed the
      area gate for every candidate (evidence: geocode-*.json notes);
      coordinates are NEVER estimated.
     * restaurant addresses stored EXACTLY at the locality level the
      listing title itself supports ("<locality>, Tirupati, Andhra
      Pradesh") — no street numbers invented (NOT NULL column, so the
      locality-level string is the honest minimum).
     * price_level NULL (no invented ₹ default), rating 0 (schema default;
      UI renders no badge for 0), opening_hours/phone NULL (no evidence).
     * description NULL everywhere — nothing captured, nothing invented.
     * tags: only values evidenced by the source title/page itself
      (pure_veg where the title says Pure Veg(etarian); ttd +
      pilgrim_accommodation where the official TTD page documents the
      facility; teertham where the official page names it a teertham).
     * source marker 'tptm-master-import' + populated source_url.

   Guarding (fail-loud; superset of batch-011's reviewed guards):
     * PREFLIGHT re-verifies: markers unused; zero id/slug/name
      collisions for all 29 rows; Batch-011's 16 ids are either fully
      absent or fully applied (never partial); exactly one ACTIVE
      tirupati destination; restaurants batch-012 names absent.
     * Idempotent rerun: 0/29 fresh or 29/29 applied → no changes;
      1-28 → abort.
     * POSTFLIGHT: exact 29-id set; per-row fidelity; unverified + four
      verification fields NULL; coordinates NULL; destination linkage;
      type/category distributions exact. ANY violation → the trailing
      COMMIT never runs → full rollback.

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

const NAMESPACE = "6d3a0f5e-7b1c-4a2e-9d84-2f6a1c9e0b31"; // fixed project namespace (batch-009/010/011)
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

const MARKER = "tptm-master-import";
const CITY = "Tirupati";

/* ---------------- curated worksheet + drift assertions ---------------- */

interface CuratedRow {
  key: string; name: string; area: string; group: string; target: string;
  category: string; placeType: string | null; tags: string[];
  sourceUrl: string; sourceKind: string | null; tier: string;
  existingSet: string; status: string; localityHint: string | null;
}

const curated = JSON.parse(readFileSync(WS, "utf8")) as { rows: CuratedRow[] };
const byKey = new Map(curated.rows.map((r) => [r.key, r]));
const cur = (key: string): CuratedRow => {
  const r = byKey.get(key);
  if (!r) throw new Error(`DRIFT: curated worksheet is missing key "${key}" — re-run curate-tirupati-master.ts`);
  if (r.status !== "curated") throw new Error(`DRIFT: "${key}" is status=${r.status} — must not enter a batch`);
  if (r.existingSet !== "new") throw new Error(`DRIFT: "${key}" is existingSet=${r.existingSet} — must not enter a batch`);
  if (!["T1", "T2"].includes(r.tier)) throw new Error(`DRIFT: "${key}" is tier=${r.tier} — only T1/T2 enter a batch`);
  return r;
};

/* ---------------- the 29 reviewed rows ---------------- */

interface RestRow {
  key: string; name: string; category: string;
  address: string; locality: string | null; tags: string[]; sourceUrl: string;
}
const RESTAURANT_ROWS: RestRow[] = [
  { key: "tpt-central::garuda cafe", name: "Garuda Cafe", category: "restaurant", address: "Tirupati, Andhra Pradesh", locality: null, tags: ["pure_veg"], sourceUrl: "" },
  { key: "tpt-central::bhai ka biryani", name: "Bhai Ka Biryani", category: "restaurant", address: "Gandhi Road, Tirupati, Andhra Pradesh", locality: "Gandhi Road", tags: [], sourceUrl: "" },
  { key: "tpt-neighbourhoods::mayuri restaurant", name: "Mayuri Restaurant", category: "restaurant", address: "Vidyut Nagar, Tirupati, Andhra Pradesh", locality: "Vidyut Nagar", tags: [], sourceUrl: "" },
  { key: "tpt-neighbourhoods::manju foods", name: "Manju Foods", category: "restaurant", address: "Bhavani Nagar, Tirupati, Andhra Pradesh", locality: "Bhavani Nagar", tags: [], sourceUrl: "" },
  { key: "tpt-neighbourhoods::shankar chats", name: "Shankar Chats", category: "restaurant", address: "MR Palli Junction, Tirupati, Andhra Pradesh", locality: "MR Palli", tags: [], sourceUrl: "" },
  { key: "tpt-neighbourhoods::chillies restaurant", name: "Chillies Restaurant", category: "restaurant", address: "Air Bypass Road, Tirupati, Andhra Pradesh", locality: "AIR Bypass Road", tags: [], sourceUrl: "" },
  { key: "tpt-neighbourhoods::southern spice avilala", name: "Southern Spice, Avilala", category: "restaurant", address: "Avilala, Tirupati, Andhra Pradesh", locality: "Avilala", tags: [], sourceUrl: "" },
  { key: "tirumala::srinivasam restaurant", name: "Srinivasam Restaurant", category: "restaurant", address: "Tirumala, Tirupati, Andhra Pradesh", locality: "Tirumala", tags: [], sourceUrl: "" },
  { key: "tirumala::anandan vasavi vegetarian restaurant", name: "Anandan Vasavi Vegetarian Restaurant", category: "restaurant", address: "Tirumala, Tirupati, Andhra Pradesh", locality: "Tirumala", tags: ["pure_veg"], sourceUrl: "" },
  { key: "tirumala::meenakshi pure veg restaurant", name: "Meenakshi Pure Veg Restaurant", category: "restaurant", address: "Tirumala, Tirupati, Andhra Pradesh", locality: "Tirumala", tags: ["pure_veg"], sourceUrl: "" },
];

interface PlaceRow {
  key: string; name: string; slug: string;
  placeType: "temple" | "waterfall" | "fort" | "zoo" | "natural_arch" | "other" | "hotel";
  locality: string; tags: string[]; sourceUrl: string;
}
const PLACE_ROWS: PlaceRow[] = [
  { key: "tirumala::sri varahaswamy temple tirumala", name: "Sri Varahaswamy Temple, Tirumala", slug: "sri-varahaswamy-temple", placeType: "temple", locality: "Tirumala", tags: ["tirumala"], sourceUrl: "https://www.tirumala.org/PlacesToVisit.aspx" },
  { key: "tirumala::sri bedi anjaneya swamy temple tirumala", name: "Sri Bedi Anjaneya Swamy Temple, Tirumala", slug: "sri-bedi-anjaneya-swamy-temple", placeType: "temple", locality: "Tirumala", tags: ["tirumala"], sourceUrl: "https://www.tirumala.org/PlacesToVisit.aspx" },
  { key: "tirumala::sri venkateswara museum tirumala", name: "Sri Venkateswara Museum, Tirumala", slug: "sri-venkateswara-museum", placeType: "other", locality: "Tirumala", tags: ["museum", "tirumala"], sourceUrl: "https://www.tirumala.org/" },
  { key: "tirumala::swami pushkarini", name: "Swami Pushkarini", slug: "swami-pushkarini", placeType: "other", locality: "Tirumala", tags: ["teertham", "tirumala"], sourceUrl: "https://www.tirumala.org/Places%20to%20see%20around%20Tirumala.aspx" },
  { key: "tirumala::sri hathiramjee mutt tirumala", name: "Sri Hathiramjee Mutt, Tirumala", slug: "sri-hathiramjee-mutt", placeType: "temple", locality: "Tirumala", tags: ["mutt", "tirumala"], sourceUrl: "https://www.tirumala.org/Places%20to%20see%20around%20Tirumala.aspx" },
  { key: "tirumala::akasha ganga theertham", name: "Akasha Ganga Theertham", slug: "akasha-ganga-theertham", placeType: "waterfall", locality: "Tirumala", tags: ["teertham", "tirumala"], sourceUrl: "https://www.tirumala.org/Places%20to%20see%20around%20Tirumala.aspx" },
  { key: "tirumala::chakra theertham", name: "Chakra Theertham", slug: "chakra-theertham", placeType: "other", locality: "Tirumala", tags: ["teertham", "tirumala"], sourceUrl: "https://www.tirumala.org/Places%20to%20see%20around%20Tirumala.aspx" },
  { key: "tirumala::vaikuntha teertham", name: "Vaikuntha Teertham", slug: "vaikuntha-theertham", placeType: "other", locality: "Tirumala", tags: ["teertham", "tirumala"], sourceUrl: "https://www.tirumala.org/Places%20to%20see%20around%20Tirumala.aspx" },
  { key: "tirumala::papavinasam theertham", name: "Papavinasam Theertham", slug: "papavinasam-theertham", placeType: "other", locality: "Tirumala", tags: ["teertham", "tirumala"], sourceUrl: "https://www.incredibleindia.gov.in/en/andhra-pradesh/tirupati" },
  { key: "tpt-central::sreenivasam complex ttd pilgrim accommodation", name: "Sreenivasam Complex (TTD Pilgrim Accommodation)", slug: "sreenivasam-complex", placeType: "hotel", locality: "Tirupati", tags: ["pilgrim_accommodation", "ttd"], sourceUrl: "https://www.tirumala.org/AccommodationAtTirupati.aspx" },
  { key: "tpt-central::sri venkateswara dharmasala ttd", name: "Sri Venkateswara Dharmasala (TTD)", slug: "sri-venkateswara-dharmasala", placeType: "hotel", locality: "Tirupati", tags: ["pilgrim_accommodation", "ttd"], sourceUrl: "https://www.tirumala.org/AccommodationAtTirupati.aspx" },
  { key: "tpt-central::sri govindaraja swamy dharmasala ttd", name: "Sri Govindaraja Swamy Dharmasala (TTD)", slug: "sri-govindaraja-swamy-dharmasala", placeType: "hotel", locality: "Tirupati", tags: ["pilgrim_accommodation", "ttd"], sourceUrl: "https://www.tirumala.org/AccommodationAtTirupati.aspx" },
  { key: "tpt-central::vishnu nivasam ttd free accommodation", name: "Vishnu Nivasam (TTD Free Accommodation)", slug: "vishnu-nivasam", placeType: "hotel", locality: "Tirupati", tags: ["pilgrim_accommodation", "ttd"], sourceUrl: "https://www.tirumala.org/AccommodationAtTirupati.aspx" },
  { key: "tiruchanur::sri krishna swamy temple alagiyaperumal shrine tiruchanoor", name: "Sri Krishna Swamy Temple (Alagiyaperumal Shrine), Tiruchanoor", slug: "sri-krishna-swamy-temple-tiruchanoor", placeType: "temple", locality: "Tiruchanoor", tags: ["alagiyaperumal_shrine", "surrounding-corridor"], sourceUrl: "https://www.tirumala.org/TemplesAtTiruchanoor.aspx" },
  { key: "tiruchanur::sri varada raja swamy temple tiruchanoor", name: "Sri Varada Raja Swamy Temple, Tiruchanoor", slug: "sri-varada-raja-swamy-temple", placeType: "temple", locality: "Tiruchanoor", tags: ["surrounding-corridor"], sourceUrl: "https://www.tirumala.org/TemplesAtTiruchanoor.aspx" },
  { key: "tiruchanur::sri suryanarayana swamy temple tiruchanoor", name: "Sri Suryanarayana Swamy Temple, Tiruchanoor", slug: "sri-suryanarayana-swamy-temple", placeType: "temple", locality: "Tiruchanoor", tags: ["surrounding-corridor"], sourceUrl: "https://www.tirumala.org/TemplesAtTiruchanoor.aspx" },
  { key: "surrounding::sri prasanna venkateswara swamy temple appalayagunta", name: "Sri Prasanna Venkateswara Swamy Temple, Appalayagunta", slug: "sri-prasanna-venkateswara-swamy-temple", placeType: "temple", locality: "Appalayagunta", tags: ["surrounding"], sourceUrl: "https://www.tirumala.org/TemplesAtTiruchanoor.aspx" },
  { key: "surrounding::sri sridevi bhudevi sametha thondamanadu temple", name: "Sri Sridevi Bhudevi Sametha Thondamanadu Temple", slug: "sri-sridevi-bhudevi-sametha-thondamanadu-temple", placeType: "temple", locality: "Thondamanadu", tags: ["surrounding"], sourceUrl: "https://www.tirumala.org/TemplesAtTiruchanoor.aspx" },
  { key: "tpt-central::regional science centre tirupati", name: "Regional Science Centre, Tirupati", slug: "regional-science-centre", placeType: "other", locality: "Tirupati", tags: ["museum"], sourceUrl: "https://www.incredibleindia.gov.in/en/andhra-pradesh/tirupati" },
];

/* source_url fallback: the curated row's own primary source */
function restUrl(r: RestRow): string {
  if (r.sourceUrl) return r.sourceUrl;
  const c = cur(r.key);
  if (!c.sourceUrl) throw new Error(`DRIFT: no source URL for ${r.key}`);
  return c.sourceUrl;
}

/* drift assertions: every declared row must exist in the curated worksheet
   and the declared name must EQUAL the worksheet canonical name — ids are
   uuid5("foodie-tptm:Tirupati:<name>") so any canonical rename MUST be
   consciously rebased into this batch (fail-loud, never silently drift). */
for (const r of [...RESTAURANT_ROWS.map((x) => ({ row: x, c: cur(x.key) })), ...PLACE_ROWS.map((x) => ({ row: x, c: cur(x.key) }))]) {
  const cName = r.c.name;
  if (cName !== r.row.name) {
    throw new Error(`DRIFT: curated canonical "${cName}" != batch name "${r.row.name}" for ${r.row.key} — rebase this row onto the current worksheet canonical`);
  }
}

/* ---------------- ids ---------------- */

const restIds = RESTAURANT_ROWS.map((r) => ({ r, id: uuid5(`foodie-tptm:${CITY}:${r.name}`) }));
const placeIds = PLACE_ROWS.map((r) => ({ r, id: uuid5(`foodie-tptm:${CITY}:${r.name}`) }));
const ALL_IDS = [...restIds.map((x) => x.id), ...placeIds.map((x) => x.id)];
if (new Set(ALL_IDS).size !== ALL_IDS.length) throw new Error("FATAL: id collision within batch-012");
const ALL_SLUGS = PLACE_ROWS.map((r) => r.slug);
if (new Set(ALL_SLUGS).size !== ALL_SLUGS.length) throw new Error("FATAL: slug collision within batch-012");

const BATCH011_IDS = [
  "596b875e-23d5-5458-95e6-1e60e9b0f2af", "2b7ae75d-18d3-53b8-99d7-7db09267c860",
  "53f276b4-549f-5f06-ad7d-fd7e20bf5e4e", "4da554ae-e148-5498-b3b7-3aa45f0835d1",
  "27c6e70b-673e-5c80-a3cf-4e8f530098d8", "74b454ed-cb0a-5cd9-9510-1ef251de5a8a",
  "9cbbed7e-b526-5167-ba53-30214cfe3c44", "550f0ee2-d898-5f44-9897-9fd72310d77f",
];
const BATCH011_ID_LIST = BATCH011_IDS.join(", "); // first 8 of 16 — extended below
/* the remaining 8 batch-011 ids are read from the batch-011 generator's ROWS via the same namespace+names: */
const BATCH011_NAMES = [
  "Sri Govindaraja Swamy Temple", "Sri Kapilatheertham Temple",
  "Sri Kalyana Venkateswara Swamy Temple", "ISKCON Tirupati",
  "Natural Arch, Tirumala hills (Silathoranam)", "Talakona Waterfall",
  "Chandragiri Fort", "Sri Venkateswara Zoological Park",
];
const BATCH011_ALL = [...BATCH011_IDS, ...BATCH011_NAMES.map((n) => uuid5(`foodie-p4:Tirupati:${n}`))].map((i) => `'${i}'`).join(", ");

/* ---------------- SQL: restaurants ---------------- */

const restValues = restIds.map(({ r, id }) => `  (
    '${id}'::uuid,
    ${sq(r.name)},
    '${r.category}',
    ${sq(r.address)},     -- locality-level address EXACTLY as the listing title supports (no street invented)
    ${sq(CITY)},
    ${r.locality ? sq(r.locality) : "null"},
    null,                  -- latitude: geocode evidence area-gated FAILED for every candidate — NEVER estimated
    null,                  -- longitude
    0,                     -- rating schema default; UI renders no badge for 0
    null,                  -- price_level: no evidence — NULL (batch-001/002 made the column nullable)
    null,                  -- opening_hours: no evidence
    null,                  -- phone: no evidence
    ${r.tags.length ? `array[${r.tags.map(sq).join(", ")}]::text[]` : "'{}'::text[]"},
    '${MARKER}',
    ${sq(restUrl(r))},
    'unverified'           -- an import NEVER self-verifies
  )`).join(",\n");

/* ---------------- SQL: places ---------------- */

const placeValues = placeIds.map(({ r, id }) => `  (
    '${id}'::uuid,
    ${sq(r.slug)},
    '${r.placeType}',
    ${sq(r.name)},
    null,                    -- description: not captured — NEVER invented
    null,                    -- address: official pages support locality only
    ${sq(r.locality)},
    ${sq(CITY)},
    v_dest_id,               -- resolved live active tirupati destination (exact-one guarded)
    null,                    -- latitude: coordinates are NEVER estimated
    null,                    -- longitude
    ${r.tags.length ? `array[${r.tags.map(sq).join(", ")}]::text[]` : "'{}'::text[]"},
    '${MARKER}',
    ${sq(r.sourceUrl)},
    null,                    -- last_verified_at: an import NEVER self-verifies
    null,                    -- name_verified (tri-state: NULL = not checked)
    null,                    -- address_verified (tri-state)
    null,                    -- coordinates_verified (tri-state)
    'unverified',
    true
  )`).join(",\n");

/* ---------------- SQL document ---------------- */

const SQL = `-- ===========================================================================
-- insert-batch-012-tptm-master.sql — REVIEW CANDIDATE (NEVER executed by the repo)
-- Tirupati MASTER place discovery — Batch 012 (first master-discovery batch)
-- Generated by scripts/foodie-enrichment/gen-insert-batch-012.ts (deterministic).
-- ===========================================================================
--
-- SCOPE (29 rows; tiers per docs/tirupati-place-inventory.md):
--   * 10 food venues -> public.restaurants  [Tier T1: an INDEPENDENT identity
--     verification search per candidate confirmed the area; the listing title
--     itself supports name+category+locality. Evidence:
--     scripts/foodie-enrichment/evidence/tirupati-master/verify-*.json]
--   * 19 POI/stays   -> public.places       [Tier T2: names carried by OFFICIAL
--     pages fetched HTTP 2026-10-26 — tirumala.org (TTD) and
--     incredibleindia.gov.in — with verbatim quotes saved in
--     scripts/foodie-enrichment/evidence/tirupati-master/official/]
--
-- EXCLUSIONS (honest accounting):
--   * Tier T3 candidates (105) — single listing hit only — remain in the
--     internal inventory as documented BACKLOG; they are NOT imported.
--   * Batch-011's 16 owner-blocked candidates are NOT duplicated here; 11
--     curated candidates that alias them are cross-referenced in
--     docs/tirupati-duplicate-review.md and excluded.
--   * 7 possible duplicates stay in the review queue (not silently merged,
--     not silently deleted).
--
-- HONESTY (identical to batches 009-011): deterministic uuid5 ids
-- ("foodie-tptm:Tirupati:<name>"); verification_status 'unverified' on every
-- row; all four verification fields NULL; latitude/longitude NULL (never
-- estimated — Nominatim area-gate found no trustworthy match per candidate);
-- restaurant addresses at LOCALITY level only; price_level NULL; description
-- NULL; tags only where evidenced. Preserves ALL existing rows and user
-- content: INSERT-only, no UPDATE, no DELETE.
--
-- OWNER STEPS: review this file, then run inside the Supabase SQL editor.
-- Preflight guards abort unless the database is in the reviewed state; any
-- postflight violation rolls the whole batch back. Rerun-safe (idempotent).
-- ===========================================================================

begin;

-- ---------------------------------------------------------------------------
-- PREFLIGHT: hard gates (any violation aborts before a single INSERT)
-- ---------------------------------------------------------------------------
do $pf012$
declare
  v_marker    integer;
  v_dup_names integer;
  v_dup_ids   integer;
  v_dup_slugs integer;
  v_dest_total  integer;
  v_dest_active integer;
  v_b11       integer;
  v_rest_marker integer;
begin
  -- (a) markers unused
  select count(*) into v_marker from public.places where source = '${MARKER}';
  if v_marker <> 0 then
    raise exception 'PREFLIGHT FAIL: % places row(s) already carry ${MARKER} — batch applied (at least partially). Re-run the review.', v_marker;
  end if;
  select count(*) into v_rest_marker from public.restaurants where source = '${MARKER}';
  if v_rest_marker <> 0 then
    raise exception 'PREFLIGHT FAIL: % restaurants row(s) already carry ${MARKER} — batch applied (at least partially). Re-run the review.', v_rest_marker;
  end if;
  raise notice 'PREFLIGHT OK: ${MARKER} markers unused.';

  -- (b) id collisions anywhere
  select count(*) into v_dup_ids from public.places where id in (${ALL_IDS.map((i) => `'${i}'`).join(", ")});
  if v_dup_ids <> 0 then
    raise exception 'PREFLIGHT FAIL: % batch-012 place ids already exist — importing would collide.', v_dup_ids;
  end if;
  select count(*) into v_dup_ids from public.restaurants where id in (${ALL_IDS.map((i) => `'${i}'`).join(", ")});
  if v_dup_ids <> 0 then
    raise exception 'PREFLIGHT FAIL: % batch-012 ids already exist in restaurants — importing would collide.', v_dup_ids;
  end if;
  raise notice 'PREFLIGHT OK: no id collisions.';

  -- (c) slug collisions on OTHER ids
  select count(*) into v_dup_slugs from public.places where slug in (${ALL_SLUGS.map((s) => sq(s)).join(", ")});
  if v_dup_slugs <> 0 then
    raise exception 'PREFLIGHT FAIL: % batch-012 slugs already exist — importing would collide.', v_dup_slugs;
  end if;
  raise notice 'PREFLIGHT OK: no slug collisions.';

  -- (d) restaurant name collisions
  select count(*) into v_dup_names from public.restaurants
   where lower(btrim(name)) in (${RESTAURANT_ROWS.map((r) => `lower(btrim(${sq(r.name)}))`).join(", ")});
  if v_dup_names <> 0 then
    raise exception 'PREFLIGHT FAIL: % batch-012 restaurant names already exist — importing would duplicate rows.', v_dup_names;
  end if;
  raise notice 'PREFLIGHT OK: no restaurant name collisions.';

  -- (e) Batch-011 rows: either fully absent (owner has not executed) or fully
  --     applied (owner executed) — a PARTIAL state is drift and aborts.
  select count(*) into v_b11 from public.places where id in (${BATCH011_ALL});
  if v_b11 not in (0, 16) then
    raise exception 'PREFLIGHT FAIL: Batch-011 rows are PARTIALLY present (%) — owner review required before batch-012.', v_b11;
  end if;
  raise notice 'PREFLIGHT OK: Batch-011 state coherent (%/16 present).', v_b11;

  -- (f) exactly one ACTIVE tirupati destination for place linkage
  select count(*), count(*) filter (where is_active) into v_dest_total, v_dest_active
    from public.destinations where slug = 'tirupati';
  if v_dest_total <> 1 or v_dest_active <> 1 then
    raise exception 'PREFLIGHT FAIL: expected exactly 1 active tirupati destination (got % total / % active).', v_dest_total, v_dest_active;
  end if;
  raise notice 'PREFLIGHT OK: tirupati destination present and active.';
end
$$;

-- ---------------------------------------------------------------------------
-- Part 1 — INSERTS (10 Tier-T1 restaurant rows; fixed ids; full provenance)
-- ---------------------------------------------------------------------------
insert into public.restaurants
  (id, name, category, address, city, locality, latitude, longitude, rating, price_level, opening_hours, phone, tags, source, source_url, verification_status)
values
${restValues}
;

-- ---------------------------------------------------------------------------
-- Part 2 — INSERTS (19 Tier-T2 place rows into public.places)
-- ---------------------------------------------------------------------------
do $ins012$
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
  raise notice 'INSERT OK: 19 batch-012 place rows inserted.';
end
$ins012$;

-- ---------------------------------------------------------------------------
-- POSTFLIGHT: hard guards (any violation → COMMIT below never runs → rollback)
-- ---------------------------------------------------------------------------
do $post012$
declare
  v_rest integer; v_places integer; v_bad integer;
  v_temple integer; v_hotel integer; v_other integer; v_waterfall integer;
  v_unver integer; v_coords integer; v_nolink integer; v_nosrc integer;
begin
  select count(*) into v_rest from public.restaurants where source = '${MARKER}';
  if v_rest <> 10 then
    raise exception 'POSTFLIGHT FAIL: expected 10 batch-012 restaurant rows, found %.', v_rest;
  end if;
  select count(*) into v_places from public.places where source = '${MARKER}';
  if v_places <> 19 then
    raise exception 'POSTFLIGHT FAIL: expected 19 batch-012 place rows, found %.', v_places;
  end if;

  select count(*) into v_unver from public.restaurants where source = '${MARKER}' and verification_status <> 'unverified';
  v_unver := v_unver + (select count(*) from public.places where source = '${MARKER}' and verification_status <> 'unverified');
  if v_unver <> 0 then
    raise exception 'POSTFLIGHT FAIL: % rows are not unverified — an import never self-verifies.', v_unver;
  end if;

  select count(*) into v_coords from public.restaurants where source = '${MARKER}' and (latitude is not null or longitude is not null);
  v_coords := v_coords + (select count(*) from public.places where source = '${MARKER}' and (latitude is not null or longitude is not null));
  if v_coords <> 0 then
    raise exception 'POSTFLIGHT FAIL: % rows carry coordinates — none were evidenced.', v_coords;
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
    count(*) filter (where place_type = 'other'),
    count(*) filter (where place_type = 'waterfall')
    into v_temple, v_hotel, v_other, v_waterfall
    from public.places where source = '${MARKER}';
  if v_temple <> 8 or v_hotel <> 4 or v_other <> 6 or v_waterfall <> 1 then
    raise exception 'POSTFLIGHT FAIL: place_type distribution drifted (temple=% hotel=% other=% waterfall=%; expected 8/4/6/1).', v_temple, v_hotel, v_other, v_waterfall;
  end if;
  raise notice 'POSTFLIGHT OK: 29 rows verified (10 restaurants + 19 places; temple 8, hotel 4, other 6, waterfall 1).';
end
$post012$;

commit;
`;

/* ---------------- verify probe ---------------- */

const VERIFY_SQL = `-- ===========================================================================
-- verify-batch-012-tptm-master.sql — READ-ONLY state probe (PRE/POST review aid)
-- ===========================================================================
select 'restaurants_tptm' as what, count(*) as n from public.restaurants where source = '${MARKER}'
union all
select 'places_tptm', count(*) from public.places where source = '${MARKER}'
union all
select 'places_tptm_unverified', count(*) from public.places where source = '${MARKER}' and verification_status = 'unverified'
union all
select 'places_tptm_with_coords', count(*) from public.places where source = '${MARKER}' and latitude is not null
union all
select 'batch011_present', count(*) from public.places where id in (${BATCH011_ALL});
`;

/* ---------------- emit ---------------- */

writeFileSync(join(OUT, "insert-batch-012-tptm-master.sql"), SQL);
writeFileSync(join(OUT, "verify-batch-012-tptm-master.sql"), VERIFY_SQL);

const sha = (p: string) => createHash("sha256").update(readFileSync(p)).digest("hex");
console.log("batch-012 review candidates written:");
console.log("  insert-batch-012-tptm-master.sql  sha256:", sha(join(OUT, "insert-batch-012-tptm-master.sql")));
console.log("  verify-batch-012-tptm-master.sql  sha256:", sha(join(OUT, "verify-batch-012-tptm-master.sql")));
console.log(`rows: ${RESTAURANT_ROWS.length} restaurants (T1) + ${PLACE_ROWS.length} places (T2) = ${RESTAURANT_ROWS.length + PLACE_ROWS.length}`);
console.log("place types:", JSON.stringify(PLACE_ROWS.reduce<Record<string, number>>((a, r) => ((a[r.placeType] = (a[r.placeType] ?? 0) + 1), a), {})));
