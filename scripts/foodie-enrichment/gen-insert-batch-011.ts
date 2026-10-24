/**
 * gen-insert-batch-011.ts — GATE 2 review-candidate generator (public.places).
 *
 * Emits TWO files, both REVIEW CANDIDATES — never executed by this repo:
 *   1. supabase/review-candidates/insert-batch-011-p4-places.sql
 *      16 evidence-curated Tirupati rows into public.places
 *      (10 attractions + 6 lodging hotels, place_type per row).
 *   2. supabase/review-candidates/verify-batch-011-p4-places.sql
 *      Read-only single-row state probe (PRE / POST documentation in header).
 *
 * Scope provenance (all pre-approved by recorded decisions):
 *   * Batch-010 addendum (Phase D, Gate 1): the 6 lodging rows are
 *     "superseded by direction" out of restaurants and are to be re-emitted
 *     into public.places with place_type='hotel' — "dropping the food-only
 *     rating 0 / price_level '₹₹' defaults that no longer apply, and keeping
 *     verification fields NULL".
 *   * Batch-010 held-out section + worksheet places-p4.json: ALL 10
 *     attractions were held out ONLY because restaurants.category had no
 *     attraction value. Migration-008 (public.places, approved design) is
 *     the recorded schema resolution, so the attraction rows become
 *     importable now. Each carries an official/intergovernmental fetched
 *     source with name+locality support.
 *   * The 3 evidence-weak hotels (Nivaara / PLR Grand / Bhimas) STAY HELD
 *     OUT — unchanged evidence reasons (identity conflict / superseded
 *     brand / no live official source).
 *
 * Honesty conventions (unchanged from batches 005-010):
 *   * deterministic ids: uuid5("foodie-p4:<city>:<name>") over the fixed
 *     project namespace (same algorithm, same quirk as batch-009/010:
 *     namespace hex chars hashed as ASCII bytes, sha1, RFC-4122 v5 format).
 *     Every computed id is ASSERTED against the expected id recorded in the
 *     reviewed demo dataset (src/data/points-of-interest.ts, whose 6 hotel
 *     ids were independently re-verified against Batch-010) — the generator
 *     refuses to emit on any mismatch.
 *   * verification_status 'unverified' on every row; last_verified_at,
 *     name_verified, address_verified, coordinates_verified all NULL
 *     (an import never self-verifies).
 *   * latitude/longitude NULL EVERYWHERE — the worksheet records
 *     fieldSupport.coordinates=false for 15 of 16 rows; the Natural Arch's
 *     UNESCO DMS reading (13°41′14″N 79°20′25″E) is recorded evidence but
 *     its DMS→decimal conversion remains an owner decision (locked rule),
 *     so Rev 1 imports no coordinates at all.
 *   * description NULL everywhere — the worksheet captures NO row-level
 *     description field; none is invented.
 *   * addresses/localities stored EXACTLY at the level the cited source
 *     supports (Minerva Grand: locality-level, its official page publishes
 *     no street address).
 *   * tags: only evidenced values ('lodging', 'brand_chain' where the
 *     chain is evidenced; 'unesco_tentative' for the UNESCO tentative-list
 *     source). No invented tags.
 *   * every row: source 'p4-research-import' + populated source_url (the
 *     fetched official page).
 *   * destination_id: resolved at run time from the live active
 *     slug='tirupati' destination row (exact-one guarded) — never hardcoded.
 *
 * Guarding (fail-loud, superset of batch-010's reviewed guards):
 *   * PREFLIGHT re-verifies the migration-008 application state ITSELF
 *     (21 approved columns, RLS enabled, exactly one SELECT policy, zero
 *     write policies, both CHECK constraints, slug-unique constraint,
 *     city/name unique index) — the owner-reported application is therefore
 *     re-proven at import time, not assumed.
 *   * Self-apply state: 0/16 fresh or 16/16 idempotent-rerun; 1-15 aborts.
 *   * places must contain NO foreign rows (total 0 when fresh, 16 when
 *     applied — anything else is drift).
 *   * name/slug conflicts on rows OTHER than the 16 fixed ids abort.
 *   * the 3 held-out ids AND names must be absent.
 *   * exactly one ACTIVE tirupati destination row (total + active count).
 *   * POSTFLIGHT: exact 16-id set; per-row (id, slug, name, place_type,
 *     city) fidelity; unverified + all four verification fields NULL;
 *     coordinates NULL; description NULL; marker + source_url; destination
 *     linkage; place-type distribution exact (temple 6, hotel 6,
 *     natural_arch 1, waterfall 1, fort 1, zoo 1); held-out still absent.
 *     ANY violation → the trailing COMMIT never runs → full rollback.
 *
 * Determinism: running this generator twice produces byte-identical files
 * (verified in the review report). Prints SHA-256 for both artifacts.
 */

import { writeFileSync, readFileSync } from "fs";
import { createHash } from "crypto";
import { join } from "path";

const ROOT = process.cwd();

/** Deterministic UUIDv5-style id (sha1, RFC-4122 v5 formatting) — identical to gen-insert-batch-009/010.ts. */
const NAMESPACE = "6d3a0f5e-7b1c-4a2e-9d84-2f6a1c9e0b31"; // fixed project namespace (batch-009/010)
function uuid5(name: string): string {
  const h = createHash("sha1")
    .update(NAMESPACE.replace(/-/g, ""))
    .update(name)
    .digest("hex");
  const u = [
    h.slice(0, 8),
    h.slice(8, 12),
    `5${h.slice(13, 16)}`,
    ((parseInt(h.slice(16, 18), 16) & 0x3f) | 0x80).toString(16).padStart(2, "0") + h.slice(18, 20),
    h.slice(20, 32),
  ].join("-");
  return u;
}

function sq(s: string): string {
  return `'${s.replace(/'/g, "''")}'`;
}

/** Slug convention established by the reviewed demo dataset (kebab-case of the canonical name). */
function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const MARKER = "p4-research-import";

interface P4Row {
  name: string;
  placeType: "temple" | "waterfall" | "fort" | "zoo" | "natural_arch" | "hotel";
  address: string | null;
  locality: string | null;
  tags: string[];
  sourceUrl: string;
  expectedId: string;
  expectedSlug: string;
}

// The 16 approved rows, transcribed VERBATIM from scripts/foodie-enrichment/
// worksheets/places-p4.json (19 researched rows; dispositions and per-field
// support maps recorded there). expectedId values are the STABLE project
// uuid5 identities recorded in src/data/points-of-interest.ts (the 6 hotel
// ids were independently re-verified byte-for-byte against the Batch-010
// candidate; the 10 attraction ids use the identical convention).
const ROWS: P4Row[] = [
  /* ------------------- lodging hotels (Batch-010 carry-over) ------------------- */
  {
    name: "Marasa Sarovar Premiere",
    placeType: "hotel",
    address: "Upadhyaya Nagar, Karakambadi Road, Tirupati, Andhra Pradesh 517507",
    locality: "Upadhyaya Nagar",
    tags: ["lodging", "brand_chain"],
    sourceUrl: "https://www.sarovarhotels.com/marasa-sarovar-premiere-tirupati-hotels",
    expectedId: "596b875e-23d5-5458-95e6-1e60e9b0f2af",
    expectedSlug: "marasa-sarovar-premiere",
  },
  {
    name: "Fortune Select Grand Ridge",
    placeType: "hotel",
    address: "Shilparamam, Tiruchanoor Road, Tirupati, Andhra Pradesh 517501",
    locality: "Shilparamam",
    tags: ["lodging", "brand_chain"],
    sourceUrl: "https://www.itchotels.com/in/en/fortuneselectgrandridge-tirupati",
    expectedId: "2b7ae75d-18d3-53b8-99d7-7db09267c860",
    expectedSlug: "fortune-select-grand-ridge",
  },
  {
    name: "Ramee Guestline Hotel",
    placeType: "hotel",
    address: "14/37 Karakambadi Rd, Mangalam, Tirupati, Andhra Pradesh 517507",
    locality: "Mangalam",
    tags: ["lodging", "brand_chain"],
    sourceUrl: "https://rameehotels.com/ramee-guestline-hotel-tirupati",
    expectedId: "53f276b4-549f-5f06-ad7d-fd7e20bf5e4e",
    expectedSlug: "ramee-guestline-hotel",
  },
  {
    name: "Ekante Bliss",
    placeType: "hotel",
    address: "19-3-45, Near Ramanuja Circle, Renigunta Rd, Tirupati, Andhra Pradesh 517501",
    locality: "Renigunta Road",
    tags: ["lodging", "brand_chain"],
    sourceUrl: "https://www.seleqtionshotels.com/en-in/hotels/ekante-bliss-tirupati",
    expectedId: "4da554ae-e148-5498-b3b7-3aa45f0835d1",
    expectedSlug: "ekante-bliss",
  },
  {
    name: "Kalyan Residency",
    placeType: "hotel",
    address: "No.177, Tata Nagar Rd, Near Central Bus Stand, Tata Nagar, Tirupati, Andhra Pradesh 517501",
    locality: "Tata Nagar",
    tags: ["lodging"],
    sourceUrl: "https://kalyanresidency.com",
    expectedId: "27c6e70b-673e-5c80-a3cf-4e8f530098d8",
    expectedSlug: "kalyan-residency",
  },
  {
    name: "Minerva Grand Tirupati",
    placeType: "hotel",
    // Locality-level address DELIBERATELY — the official page publishes no
    // street address; third-party street addresses were NOT adopted.
    address: "Renigunta Road, Tirupati, Andhra Pradesh",
    locality: "Renigunta Road",
    tags: ["lodging", "brand_chain"],
    sourceUrl: "https://www.minervahotels.in/tirupati-renigunta-road",
    expectedId: "74b454ed-cb0a-5cd9-9510-1ef251de5a8a",
    expectedSlug: "minerva-grand-tirupati",
  },
  /* ------------------- attractions (schema blocker RESOLVED by migration-008) ------------------- */
  {
    name: "Sri Venkateswara Swamy Temple",
    placeType: "temple",
    address: null,
    locality: "Tirumala",
    tags: [],
    sourceUrl: "https://www.tirumala.org/TTDTempleHistory.aspx",
    expectedId: "9cbbed7e-b526-5167-ba53-30214cfe3c44",
    expectedSlug: "sri-venkateswara-swamy-temple",
  },
  {
    name: "Sri Padmavathi Ammavari Temple",
    placeType: "temple",
    address: null,
    locality: "Tiruchanoor",
    tags: [],
    sourceUrl: "https://ttdevasthanams.ap.gov.in/temples",
    expectedId: "550f0ee2-d898-5f44-9897-9fd72310d77f",
    expectedSlug: "sri-padmavathi-ammavari-temple",
  },
  {
    name: "Sri Govindaraja Swamy Temple",
    placeType: "temple",
    address: null,
    locality: "Tirupati city",
    tags: [],
    sourceUrl: "https://tirupati.ap.gov.in/religious-tourism",
    expectedId: "065ed977-26c1-5fa7-814a-b299f52672a1",
    expectedSlug: "sri-govindaraja-swamy-temple",
  },
  {
    name: "Sri Kapilatheertham Temple",
    placeType: "temple",
    address: null,
    locality: "Tirupati (foot of Tirumala hills / Seshachalam)",
    tags: [],
    // TTD-portal spelling stored (3+ official variants exist; conflict
    // recorded in the worksheet — the TTD listing spelling is canonical).
    sourceUrl: "https://ttdevasthanams.ap.gov.in/temples",
    expectedId: "f0034b71-18fd-51cc-be00-b26dc17cec72",
    expectedSlug: "sri-kapilatheertham-temple",
  },
  {
    name: "Sri Kalyana Venkateswara Swamy Temple",
    placeType: "temple",
    address: null,
    locality: "Srinivasa Mangapuram (about 10 km west of Tirupati city, per district page)",
    tags: [],
    sourceUrl: "https://tirupati.ap.gov.in/religious-tourism",
    expectedId: "7ca7b062-f601-55a9-832f-f3355aa8a80d",
    expectedSlug: "sri-kalyana-venkateswara-swamy-temple",
  },
  {
    name: "ISKCON Tirupati",
    placeType: "temple",
    // Verbatim footer address line from the official about page.
    address: "Hare Krishna Land, Hare Krishna Road, Vinayaka Nagar, Tirupati - 517507. Andhra Pradesh.",
    locality: "Hare Krishna Road, Vinayaka Nagar",
    tags: [],
    sourceUrl: "https://iskcontirupati.info/about-iskcon-tirupati",
    expectedId: "632a8627-baca-5d32-ab42-cf7328af8da1",
    expectedSlug: "iskcon-tirupati",
  },
  {
    name: "Natural Arch, Tirumala hills (Silathoranam)",
    placeType: "natural_arch",
    address: null,
    locality: "Tirumala hills, ~1 km north of the temple, near Chakra Teertham",
    tags: ["unesco_tentative"],
    // Coordinates stay NULL: UNESCO publishes DMS '13°41′14″N 79°20′25″E';
    // the DMS→decimal conversion is a recorded PENDING OWNER DECISION
    // (locked rule). Never converted silently, never estimated.
    sourceUrl: "https://whc.unesco.org/en/tentativelists/6894",
    expectedId: "23e44a85-1086-58df-8a58-928830569f04",
    expectedSlug: "natural-arch-tirumala-hills-silathoranam",
  },
  {
    name: "Talakona Waterfall",
    placeType: "waterfall",
    address: null,
    // 'Tirupati District' per the official district page (travel portals'
    // 'Chittoor District' titles are the pre-reorganization naming —
    // recorded in the worksheet, official page wins).
    locality: "Yerravaripalem, Sri Venkateswara National Park, Tirupati District",
    tags: [],
    sourceUrl: "https://tirupati.ap.gov.in/forest-tourism",
    expectedId: "7f2c91c5-35c7-57d8-9d7a-833b033a4ef1",
    expectedSlug: "talakona-waterfall",
  },
  {
    name: "Chandragiri Fort",
    placeType: "fort",
    address: null,
    locality: "Chandragiri, Tirupati district",
    tags: [],
    sourceUrl: "https://www.incredibleindia.gov.in/en/andhra-pradesh/tirupati/chandragiri-fort",
    expectedId: "544ffb45-63d2-582b-8272-155f032b4901",
    expectedSlug: "chandragiri-fort",
  },
  {
    name: "Sri Venkateswara Zoological Park",
    placeType: "zoo",
    address: null,
    // City-level locality only — the official page exposes no address block.
    locality: "Tirupati, Andhra Pradesh",
    tags: [],
    sourceUrl: "https://tirupati.ap.gov.in/forest-tourism",
    expectedId: "7a69de5b-7744-5fa6-b972-f3a7ebb4f0fb",
    expectedSlug: "sri-venkateswara-zoological-park",
  },
];

// Evidence-held-out rows — MUST STAY ABSENT from public.places. Ids below are
// the ids these rows WOULD carry under the project convention (computed, for
// the absence probe only — the rows are NOT imported).
const HELD_OUT = [
  {
    name: "Hotel Nivaara Tirupati",
    reason:
      "identity conflict: the property domain (hotelplrgrand.com) now serves a site branded 'Hotel Nivaara' (JSON-LD Hotel, zero 'PLR' occurrences) while the owner-group page (plrprojects.com/plrgrand.html) still lists 'PLR Grand Hotel' citing the SAME domain — two first-party sources contradict",
    criteria: "a live official page AND the owner page agree on the current brand name (or an owner statement of the rebrand)",
  },
  {
    name: "Hotel PLR Grand",
    reason: "superseded brand on its own domain (same investigation as Hotel Nivaara Tirupati; recorded separately so neither name is silently merged or dropped)",
    criteria: "as above",
  },
  {
    name: "Hotel Bhimas",
    reason: "no live official source: hotelbhimas.com DNS-dead (2 failed fetches), bhimasresidency.com fetched = GoDaddy expired/parked page, alternates = portals/Facebook/MCA only",
    criteria: "an official property domain returns and is fetched successfully",
  },
];

/* ----------------------------- SELF-CHECKS (fail loudly, write nothing) ----------------------------- */

const ids: string[] = [];
const slugs: string[] = [];
for (const r of ROWS) {
  const computedId = uuid5(`foodie-p4:Tirupati:${r.name}`);
  if (computedId !== r.expectedId) {
    throw new Error(
      `[gen-011] UUID MISMATCH for "${r.name}": computed ${computedId}, expected ${r.expectedId} — refusing to emit (id conventions must stay byte-stable).`,
    );
  }
  const computedSlug = slugify(r.name);
  if (computedSlug !== r.expectedSlug) {
    throw new Error(
      `[gen-011] SLUG MISMATCH for "${r.name}": computed "${computedSlug}", expected "${r.expectedSlug}" — refusing to emit.`,
    );
  }
  if (!r.sourceUrl || !r.sourceUrl.startsWith("https://")) {
    throw new Error(`[gen-011] source_url missing or not https for "${r.name}".`);
  }
  if (r.address === null && r.locality === null) {
    throw new Error(`[gen-011] "${r.name}" has neither address nor locality — at least a locality must be evidenced.`);
  }
  ids.push(computedId);
  slugs.push(r.expectedSlug);
}
if (new Set(ids).size !== ROWS.length) throw new Error("[gen-011] duplicate ids in ROWS.");
if (new Set(slugs).size !== ROWS.length) throw new Error("[gen-011] duplicate slugs in ROWS.");
if (new Set(ROWS.map((r) => r.name.toLowerCase())).size !== ROWS.length) throw new Error("[gen-011] duplicate names in ROWS.");

const HELD_IDS = HELD_OUT.map((h) => uuid5(`foodie-p4:Tirupati:${h.name}`));
for (const hid of HELD_IDS) {
  if (ids.includes(hid)) throw new Error(`[gen-011] held-out id ${hid} collides with a batch row.`);
}
for (const h of HELD_OUT) {
  if (ROWS.some((r) => r.name.toLowerCase() === h.name.toLowerCase())) {
    throw new Error(`[gen-011] held-out name "${h.name}" also present in ROWS.`);
  }
}

/* ---------------------------------- emission helpers ---------------------------------- */

const idList = (list: string[]) => list.map((id) => `            '${id}'::uuid`).join(",\n");
const nameList = (names: string[]) => names.map((n) => `            lower(btrim(${sq(n)}))`).join(",\n");
const slugList = (list: string[]) => list.map((s) => `            ${sq(s)}`).join(",\n");

const insertTuples = ROWS.map((r) => {
  const tags = r.tags.length > 0 ? `array[${r.tags.map((t) => `'${t}'`).join(", ")}]::text[]` : `'{}'::text[]`;
  return `  (
    '${r.expectedId}'::uuid,
    ${sq(r.expectedSlug)},
    '${r.placeType}',
    ${sq(r.name)},
    null,                    -- description: not captured in the worksheet; NEVER invented
    ${r.address === null ? "null,                   -- address: not supported by the cited source" : `${sq(r.address)},`}
    ${r.locality === null ? "null" : sq(r.locality)},
    'Tirupati',
    v_dest_id,               -- resolved live active tirupati destination (exact-one guarded)
    null,                    -- latitude: coordinates are NEVER estimated (see header)
    null,                    -- longitude
    ${tags},
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

const fidelityTuples = ROWS.map(
  (r) => `    ('${r.expectedId}'::uuid, ${sq(r.expectedSlug)}, ${sq(r.name)}, '${r.placeType}')`,
).join(",\n");

const perRowIdComment = ROWS.map(
  (r) => `--   ${r.expectedId}  ${sq(r.name).slice(1, -1)}  [${r.placeType}]`,
).join("\n");

/* -------------------------------------- SQL: candidate -------------------------------------- */

const HEADER = `-- ============================================================================
-- Foodie — INSERT BATCH 011 (p4): Tirupati ATTRACTIONS + LODGING into
--          public.places (10 attractions + 6 hotels = 16 rows) — REVIEW CANDIDATE
-- ----------------------------------------------------------------------------
-- FILE STATUS: REVIEW CANDIDATE — PROPOSED, NOT EXECUTED, NOT APPROVED.
--   Generated by scripts/foodie-enrichment/gen-insert-batch-011.ts from
--   scripts/foodie-enrichment/worksheets/places-p4.json (19 researched rows;
--   evidence under evidence/places-p4-attractions/ + evidence/places-p4-hotels/,
--   all fetched 2026-10-18).
--   Review report: supabase/review-candidates/insert-batch-011-p4-places-review.md
--   Read-only state probe: supabase/review-candidates/verify-batch-011-p4-places.sql
--   (run it BEFORE and AFTER this file).
--
-- WHAT THIS BATCH CONTAINS (16 rows, ALL city 'Tirupati'):
${perRowIdComment}
--   Every row: verification_status 'unverified'; latitude/longitude NULL
--   (never estimated; the one recorded coordinate reading — UNESCO DMS for
--   the Natural Arch — stays OUT pending the owner's approved conversion);
--   description NULL (never invented); last_verified_at + the three tri-state
--   verification booleans NULL; is_active true; source '${MARKER}';
--   source_url = the fetched official/intergovernmental page; destination_id
--   = the live active slug='tirupati' destination row (resolved at run time,
--   exact-one guarded).
--
-- SCOPE PROVENANCE (recorded decisions this batch executes on):
--   * Batch-010 addendum (Phase D, Gate 1): the 6 lodging rows are
--     superseded-by-direction OUT of restaurants and are re-emitted HERE into
--     public.places with place_type='hotel' (food-only rating/price defaults
--     dropped as no longer applicable). Batch-010's SQL file therefore stays
--     DO-NOT-RUN.
--   * All 10 attractions were held out of batch-010 ONLY by the old schema
--     blocker (restaurants.category had no attraction value). The owner-
--     approved public.places model (migration-008, place_type CHECK) is the
--     recorded resolution, so these evidence-complete rows become importable.
--   * The 3 evidence-weak hotels (Hotel Nivaara Tirupati, Hotel PLR Grand,
--     Hotel Bhimas) STAY HELD OUT — see the review report for the recorded
--     reasons and re-consideration criteria. This batch FAILS if any of them
--     is present in places.
--
-- HONESTY CONTRACT (unchanged from batches 005-010):
--   * An import NEVER self-verifies: 'unverified' + NULL verification fields.
--   * NULL = not captured / not supported by the cited source. Never guessed.
--   * Addresses are stored EXACTLY at the level the cited source supports
--     (Minerva Grand Tirupati deliberately locality-level; most attractions
--     locality-level because the official pages publish no street address).
--   * Names are the cited-source canonical spellings (Kapilatheertham: TTD
--     portal spelling; conflicts recorded in the worksheet).
--   * 'lodging' tag disambiguates lodging hotels; 'brand_chain' only where
--     the chain is evidenced on the official page; 'unesco_tentative' only
--     for the UNESCO tentative-list source.
--
-- STATE SEMANTICS (fail-loud; idempotent rerun):
--   * Requires migration-008 APPLIED — the preflight re-proves the 21-column
--     shape, RLS, the single SELECT policy, zero write policies, both CHECK
--     constraints and both uniqueness objects at import time. If migration-
--     008 is missing or foreign-shaped: EXCEPTION, ZERO writes.
--   * Self-apply state: 0 of the 16 fixed ids = FRESH; 16 of 16 = ALREADY-
--     APPLIED (idempotent rerun: NO changes, same postflight); 1-15 = partial
--     apply = drift → EXCEPTION.
--   * public.places must contain NO foreign rows: total 0 when fresh, 16
--     when applied — anything else aborts.
--   * The 3 held-out ids and names must be absent in both states.
--   * Name or slug conflicts (this batch's 16 names/slugs on rows OTHER than
--     the 16 fixed ids) abort.
--
-- GUARDS:
--   PREFLIGHT  — migration-008 application probe; self-apply state; foreign-
--                row total; name+slug conflicts; held-out absence; marker
--                hygiene ('${MARKER}': 0 fresh / 16 applied); exactly ONE
--                ACTIVE tirupati destination row; THEN the conditional
--                insert (FRESH state only).
--   POSTFLIGHT — exact 16-id set present; per-row (id, slug, name,
--                place_type, city) fidelity; unverified + all four
--                verification fields NULL; coordinates NULL; description
--                NULL; marker + populated source_url; destination_id linked
--                to the live active tirupati row; place-type distribution
--                exact (temple 6, hotel 6, natural_arch 1, waterfall 1,
--                fort 1, zoo 1); held-out still absent; destination still
--                exactly-one-active.
--   The file ends with COMMIT: preflight + (conditional) inserts +
--   postflight run atomically in one SQL-Editor session; ANY guard failure
--   aborts the transaction and NOTHING is written.
-- ============================================================================

begin;
`;

const PREFLIGHT = `
-- ---------------------------------------------------------------------------
-- Part 0 — PREFLIGHT (migration-008 application probe + drift/collision/
--          held-out guards + the CONDITIONAL insert; aborts before any write
--          when anything is off)
-- ---------------------------------------------------------------------------
do $batch011$
declare
  v_columns     integer;
  v_rls         boolean;
  v_sel_policy  integer;
  v_write_policy integer;
  v_checks      integer;
  v_uniq        integer;
  v_cityname    integer;
  v_applied     integer;
  v_markers     integer;
  v_total       integer;
  v_name_dupes  integer;
  v_slug_dupes  integer;
  v_held_ids    integer;
  v_held_names  integer;
  v_dest_total  integer;
  v_dest_active integer;
  v_dest_id     uuid;
  v_state       text;
begin
  -- (a) migration-008 application probe — the schema this import assumes is
  --     re-proven HERE, not assumed from reports. The 21-column check runs
  --     FIRST (information_schema is safe on a missing table) so a missing
  --     migration produces a precise message instead of a cast error.
  select count(*) into v_columns
    from information_schema.columns
   where table_schema = 'public' and table_name = 'places'
     and column_name in (
       'id','slug','place_type','name','description','address','locality',
       'city','destination_id','latitude','longitude','tags',
       'source','source_url','last_verified_at',
       'name_verified','address_verified','coordinates_verified',
       'verification_status','is_active','created_at'
     );
  if v_columns <> 21 then
    raise exception 'PREFLIGHT FAIL: public.places has % of the 21 approved columns — migration-008 is NOT applied (or the table was altered). Apply and verify migration-008 first (its five verification queries), then re-run this candidate.', v_columns;
  end if;
  raise notice 'PREFLIGHT OK: public.places has the 21 approved columns (migration-008 shape).';

  select rowsecurity into v_rls
    from pg_tables
   where schemaname = 'public' and tablename = 'places';
  if v_rls is distinct from true then
    raise exception 'PREFLIGHT FAIL: public.places exists but RLS is not enabled — foreign-shaped table; investigate before importing.';
  end if;

  select count(*) into v_sel_policy
    from pg_policies
   where schemaname = 'public' and tablename = 'places'
     and upper(cmd) = 'SELECT';
  select count(*) into v_write_policy
    from pg_policies
   where schemaname = 'public' and tablename = 'places'
     and upper(cmd) in ('INSERT', 'UPDATE', 'DELETE');
  if v_sel_policy <> 1 or v_write_policy <> 0 then
    raise exception 'PREFLIGHT FAIL: RLS policy state wrong (select policies=%, write policies=%) — public.places must stay public-READ-ONLY.', v_sel_policy, v_write_policy;
  end if;
  raise notice 'PREFLIGHT OK: RLS enabled, exactly one SELECT policy, zero write policies.';

  select count(*) into v_checks
    from pg_constraint
   where conrelid = 'public.places'::regclass
     and conname in ('places_place_type_check', 'places_verification_status_check')
     and contype = 'c';
  if v_checks <> 2 then
    raise exception 'PREFLIGHT FAIL: expected CHECK constraints missing (found % of 2) — re-create the table from migration-008 only.', v_checks;
  end if;

  select count(*) into v_uniq
    from pg_constraint
   where conrelid = 'public.places'::regclass
     and conname = 'places_slug_key' and contype = 'u';
  select count(*) into v_cityname
    from pg_indexes
   where schemaname = 'public' and tablename = 'places'
     and indexname = 'places_city_name_lower_key';
  if v_uniq <> 1 or v_cityname <> 1 then
    raise exception 'PREFLIGHT FAIL: uniqueness not in place (slug constraint=%, city/name unique index=%).', v_uniq, v_cityname;
  end if;
  raise notice 'PREFLIGHT OK: CHECK constraints + slug/city-name uniqueness in place.';

  -- (b) self-apply state: 0 of the 16 fixed ids (fresh) or all 16 (applied);
  --     1-15 means a partial self-apply — drift, abort.
  select count(*) into v_applied from public.places
   where id in (
${idList(ids)}
   );
  if v_applied = 0 then
    v_state := 'FRESH';
  elsif v_applied = 16 then
    v_state := 'ALREADY-APPLIED';
  else
    raise exception 'PREFLIGHT FAIL: % of this batch''s 16 fixed ids already exist — a partial self-apply. Re-run the review; do NOT re-import over a partial state.', v_applied;
  end if;
  raise notice 'PREFLIGHT OK: batch-011 state = % (16-id probe = %).', v_state, v_applied;

  -- (c) foreign-row total: places must contain ONLY this batch's world
  --     (0 when fresh, 16 when applied). Any foreign row is drift.
  select count(*) into v_total from public.places;
  if v_state = 'FRESH' and v_total <> 0 then
    raise exception 'PREFLIGHT FAIL: public.places holds % foreign row(s) while none of this batch''s ids are present — unknown curation state; re-run the review before importing.', v_total;
  end if;
  if v_state = 'ALREADY-APPLIED' and v_total <> 16 then
    raise exception 'PREFLIGHT FAIL: public.places holds % rows in the already-applied state (expected exactly 16) — foreign rows appeared; re-run the review.', v_total;
  end if;
  raise notice 'PREFLIGHT OK: no foreign rows (total = %).', v_total;

  -- (d) no name conflicts: this batch's 16 names must not exist on any row
  --     OTHER than the 16 fixed ids.
  select count(*) into v_name_dupes from public.places
   where lower(btrim(name)) in (
${nameList(ROWS.map((r) => r.name))}
   )
     and id not in (
${idList(ids)}
   );
  if v_name_dupes <> 0 then
    raise exception 'PREFLIGHT FAIL: % row(s) already use this batch''s names (on other ids) — importing would duplicate listings. Re-run the review.', v_name_dupes;
  end if;

  -- (e) no slug conflicts (places.slug is globally unique per migration-008).
  select count(*) into v_slug_dupes from public.places
   where slug in (
${slugList(slugs)}
   )
     and id not in (
${idList(ids)}
   );
  if v_slug_dupes <> 0 then
    raise exception 'PREFLIGHT FAIL: % row(s) already use this batch''s slugs (on other ids) — re-run the review.', v_slug_dupes;
  end if;
  raise notice 'PREFLIGHT OK: no name/slug conflicts with the 16 batch rows.';

  -- (f) held-out guard: the 3 evidence-weak hotels must be ABSENT (by id AND
  --     by name) — they stay out until their evidence issues are resolved.
  select count(*) into v_held_ids from public.places
   where id in (
${idList(HELD_IDS)}
   );
  select count(*) into v_held_names from public.places
   where lower(btrim(name)) in (
${nameList(HELD_OUT.map((h) => h.name))}
   );
  if v_held_ids <> 0 or v_held_names <> 0 then
    raise exception 'PREFLIGHT FAIL: held-out hotel row(s) present in public.places (by id: %, by name: %) — these stay excluded until their evidence conflicts are resolved by review.', v_held_ids, v_held_names;
  end if;
  raise notice 'PREFLIGHT OK: all 3 held-out hotels absent (Nivaara / PLR Grand / Bhimas).';

  -- (g) marker hygiene: '${MARKER}' must be unused when fresh and present on
  --     exactly the 16 batch rows when already applied.
  select count(*) into v_markers from public.places where source = '${MARKER}';
  if v_state = 'FRESH' and v_markers <> 0 then
    raise exception 'PREFLIGHT FAIL: % row(s) already carry the ${MARKER} marker while the batch ids are absent — unknown provenance state; re-run the review.', v_markers;
  end if;
  if v_state = 'ALREADY-APPLIED' and v_markers <> 16 then
    raise exception 'PREFLIGHT FAIL: % row(s) carry the ${MARKER} marker, expected exactly 16 in the already-applied state; re-run the review.', v_markers;
  end if;
  raise notice 'PREFLIGHT OK: ${MARKER} marker consistent with state %.', v_state;

  -- (h) destination guard: EXACTLY ONE row with slug 'tirupati' must exist,
  --     it must be active, and its id is resolved for the insert.
  select count(*) into v_dest_total from public.destinations where slug = 'tirupati';
  if v_dest_total <> 1 then
    raise exception 'PREFLIGHT FAIL: % destination rows carry slug ''tirupati'' (expected exactly 1) — aborting.', v_dest_total;
  end if;
  select count(*) into v_dest_active from public.destinations where slug = 'tirupati' and is_active;
  if v_dest_active <> 1 then
    raise exception 'PREFLIGHT FAIL: the tirupati destination row is not active — aborting.';
  end if;
  select id into v_dest_id from public.destinations where slug = 'tirupati' and is_active;
  if v_dest_id is null then
    raise exception 'PREFLIGHT FAIL: could not resolve the active tirupati destination id — aborting.';
  end if;
  raise notice 'PREFLIGHT OK: exactly one active tirupati destination row (id %).', v_dest_id;

  -- (i) THE CONDITIONAL INSERT — only in the FRESH state; an already-applied
  --     rerun makes NO changes and falls through to the postflight.
  if v_state = 'FRESH' then
    insert into public.places
      (id, slug, place_type, name, description, address, locality, city, destination_id, latitude, longitude, tags, source, source_url, last_verified_at, name_verified, address_verified, coordinates_verified, verification_status, is_active)
    values
${insertTuples};
    raise notice 'INSERT OK: 16 batch-011 rows inserted.';
  else
    raise notice 'RERUN DETECTED: batch-011 already applied — making NO changes (idempotent exit).';
  end if;
end
$batch011$;
`;

const POSTFLIGHT = `
-- ---------------------------------------------------------------------------
-- Part 2 — POSTFLIGHT: hard guards (any violation rolls back EVERYTHING;
--          runs on BOTH a fresh apply and an idempotent rerun)
-- ---------------------------------------------------------------------------
do $pf011$
declare
  v_present   integer;
  v_bad       integer;
  v_total     integer;
  v_temple    integer;
  v_hotel     integer;
  v_arch      integer;
  v_waterfall integer;
  v_fort      integer;
  v_zoo       integer;
  v_held_ids  integer;
  v_held_names integer;
  v_dest_active integer;
begin
  -- (1) exactly the 16 fixed ids present (id is the PK, count 16 = set match)
  select count(*) into v_present from public.places
   where id in (
${idList(ids)}
   );
  if v_present <> 16 then
    raise exception 'POSTFLIGHT FAIL: % of the 16 batch rows are present (expected exactly 16); rolling back.', v_present;
  end if;
  raise notice 'POSTFLIGHT OK: all 16 batch rows are present.';

  -- (2) row fidelity: slug / name / place_type / city must land EXACTLY as
  --     generated (no silent re-typing, no drift).
  select count(*) into v_bad
    from public.places p
    join (values
${fidelityTuples}
    ) as v(id, exp_slug, exp_name, exp_type) on p.id = v.id
   where p.slug is distinct from v.exp_slug
      or p.name is distinct from v.exp_name
      or p.place_type is distinct from v.exp_type
      or p.city is distinct from 'Tirupati';
  if v_bad <> 0 then
    raise exception 'POSTFLIGHT FAIL: % batch row(s) deviate from the generated slug/name/place_type/city; rolling back.', v_bad;
  end if;
  raise notice 'POSTFLIGHT OK: slug/name/place_type/city fidelity exact on all 16 rows.';

  -- (3) trust fields: 'unverified', no self-verification
  --     (last_verified_at + the three tri-state booleans all NULL)
  select count(*) into v_bad from public.places
   where id in (
${idList(ids)}
   )
     and (verification_status is distinct from 'unverified'
          or last_verified_at is not null
          or name_verified is not null
          or address_verified is not null
          or coordinates_verified is not null);
  if v_bad <> 0 then
    raise exception 'POSTFLIGHT FAIL: % batch row(s) deviate from unverified/NULL-verification semantics; rolling back.', v_bad;
  end if;
  raise notice 'POSTFLIGHT OK: every batch row unverified, verification fields NULL.';

  -- (4) coordinates stayed NULL (never estimated; UNESCO DMS conversion
  --     remains a pending owner decision and is NOT part of this batch)
  select count(*) into v_bad from public.places
   where id in (
${idList(ids)}
   )
     and (latitude is not null or longitude is not null);
  if v_bad <> 0 then
    raise exception 'POSTFLIGHT FAIL: % batch row(s) carry coordinates — imports never estimate them and Rev 1 imports none; rolling back.', v_bad;
  end if;
  raise notice 'POSTFLIGHT OK: no coordinates were imported.';

  -- (5) no invented descriptions (the worksheet captures none)
  select count(*) into v_bad from public.places
   where id in (
${idList(ids)}
   )
     and description is not null;
  if v_bad <> 0 then
    raise exception 'POSTFLIGHT FAIL: % batch row(s) carry a description — Rev 1 captures none and none may be invented; rolling back.', v_bad;
  end if;
  raise notice 'POSTFLIGHT OK: descriptions NULL on all 16 rows (nothing invented).';

  -- (6) provenance landed: marker + populated source_url on every batch row
  select count(*) into v_bad from public.places
   where id in (
${idList(ids)}
   )
     and (source is distinct from '${MARKER}'
          or source_url is null
          or btrim(source_url) = '');
  if v_bad <> 0 then
    raise exception 'POSTFLIGHT FAIL: % batch row(s) missing the ${MARKER} marker or a populated source_url; rolling back.', v_bad;
  end if;
  raise notice 'POSTFLIGHT OK: marker + source_url present on all 16 rows.';

  -- (7) destination linkage: every row points at the LIVE active tirupati
  --     destination row; the destination is still exactly-one-active.
  select count(*) into v_bad from public.places
   where id in (
${idList(ids)}
   )
     and destination_id is distinct from
         (select d.id from public.destinations d where d.slug = 'tirupati' and d.is_active);
  if v_bad <> 0 then
    raise exception 'POSTFLIGHT FAIL: % batch row(s) are not linked to the live active tirupati destination; rolling back.', v_bad;
  end if;
  select count(*) into v_dest_active from public.destinations where slug = 'tirupati' and is_active;
  if v_dest_active <> 1 then
    raise exception 'POSTFLIGHT FAIL: expected exactly 1 active tirupati destination row, found %; rolling back.', v_dest_active;
  end if;
  raise notice 'POSTFLIGHT OK: all 16 rows linked to the active tirupati destination (untouched by this batch).';

  -- (8) place-type distribution exact:
  --       temple 6 (5 TTD/district temples + ISKCON)
  --       hotel 6  (Batch-010 lodging carry-over)
  --       natural_arch 1, waterfall 1, fort 1, zoo 1
  select
    count(*) filter (where place_type = 'temple'),
    count(*) filter (where place_type = 'hotel'),
    count(*) filter (where place_type = 'natural_arch'),
    count(*) filter (where place_type = 'waterfall'),
    count(*) filter (where place_type = 'fort'),
    count(*) filter (where place_type = 'zoo')
    into v_temple, v_hotel, v_arch, v_waterfall, v_fort, v_zoo
    from public.places
   where id in (
${idList(ids)}
   );
  if v_temple <> 6 or v_hotel <> 6 or v_arch <> 1 or v_waterfall <> 1 or v_fort <> 1 or v_zoo <> 1 then
    raise exception 'POSTFLIGHT FAIL: place-type distribution wrong (temple=%, hotel=%, natural_arch=%, waterfall=%, fort=%, zoo=%) — expected 6/6/1/1/1/1; rolling back.', v_temple, v_hotel, v_arch, v_waterfall, v_fort, v_zoo;
  end if;
  raise notice 'POSTFLIGHT OK: place-type distribution 6 temple / 6 hotel / 1 natural_arch / 1 waterfall / 1 fort / 1 zoo.';

  -- (9) end-state total (16 = 0 baseline + 16; same in the rerun state)
  select count(*) into v_total from public.places;
  if v_total <> 16 then
    raise exception 'POSTFLIGHT FAIL: places total is %, expected exactly 16; rolling back.', v_total;
  end if;
  raise notice 'POSTFLIGHT OK: public.places total = 16.';

  -- (10) held-out hotels still absent after the import
  select count(*) into v_held_ids from public.places
   where id in (
${idList(HELD_IDS)}
   );
  select count(*) into v_held_names from public.places
   where lower(btrim(name)) in (
${nameList(HELD_OUT.map((h) => h.name))}
   );
  if v_held_ids <> 0 or v_held_names <> 0 then
    raise exception 'POSTFLIGHT FAIL: held-out hotel row(s) appeared (by id: %, by name: %); rolling back.', v_held_ids, v_held_names;
  end if;
  raise notice 'POSTFLIGHT OK: held-out hotels still absent.';
end
$pf011$;
`;

const FOOTER = `
-- ---------------------------------------------------------------------------
-- The file ends with COMMIT: preflight + (conditional) inserts + postflight
-- run atomically in one SQL-Editor session. If ANY guard fails, the
-- exception aborts the transaction, the commit never runs, and the database
-- is left exactly as it was. A rerun AFTER one successful commit detects the
-- already-applied state, makes NO changes, and passes the same postflight.
--
-- NOTHING IN THIS FILE HAS BEEN EXECUTED. This candidate connects to no
-- database; every number it asserts is a labelled logical derivation from
-- the approved Phase-D worksheet and the migration-008 design, and the
-- schema/state assumptions it makes are re-proven by the preflight at import
-- time. Execution remains the owner's single manual action in the Supabase
-- SQL Editor, only after approving this file.
-- ============================================================================

commit;
`;

const candidateSql = HEADER + PREFLIGHT + POSTFLIGHT + FOOTER;

/* -------------------------------------- SQL: verify probe -------------------------------------- */

const batch11Cte = ROWS.map(
  (r) => `    ('${r.expectedId}'::uuid, ${sq(r.name)}, ${sq(r.expectedSlug)}, '${r.placeType}')`,
).join(",\n");
const heldCte = HELD_IDS.map((id) => `    ('${id}'::uuid)`).join(",\n");
const missingNamesSorted = [...ROWS.map((r) => r.name)].sort();

const VERIFY = `-- ============================================================================
-- Foodie — Batch-011 (p4 places) — COMPACT READ-ONLY STATE SNAPSHOT
-- ----------------------------------------------------------------------------
-- FILE STATUS: READ-ONLY PROBE. Exactly ONE statement returning ONE row, so
--   it shows a single result grid in the Supabase SQL Editor. Companion to
--   insert-batch-011-p4-places.sql (the guarded import candidate); it
--   answers the same go/no-go question in one glance. Writes NOTHING.
--
-- SAFETY
--   * ONLY SELECT + read-only CTEs (WITH ... SELECT). No INSERT / UPDATE /
--     DELETE / UPSERT / DDL / DO blocks / transactions / locks.
--   * Catalog probes (information_schema / pg_tables / pg_policies /
--     pg_constraint / pg_indexes) are read-only against the system catalog.
--   * If this statement ERRORS with 'relation "public.places" does not
--     exist', migration-008 is not applied on that project — that is the
--     answer, not a probe bug.
--   * No secrets, keys or connection strings; prints none.
--
-- HOW TO RUN
--   Supabase Dashboard -> SQL Editor -> New query -> paste this WHOLE file ->
--   Run (or Ctrl/Cmd+Enter). ONE grid, ONE row appears. Run it BEFORE the
--   import (PRE) and again AFTER (POST) and compare column by column.
--
-- HOW TO READ THE ONE ROW (compare column by column):
--
--   PRE-IMPORT (migration-008 applied, batch-011 not yet imported):
--     places_total                       = 0
--     batch11_present / batch11_missing  = 0 / 16
--     batch11_missing_names              = all sixteen names
--     batch11_present_names              = {}
--     p4_marker_rows                     = 0
--     batch11_invariant_violations       = 0   (vacuously — none present)
--     batch11_fidelity_violations        = 0   (vacuously)
--     schema_columns                     = 21
--     rls_enabled                        = true
--     select_policy_rows / write_policy_rows = 1 / 0
--     check_constraints_present          = 2
--     uniqueness_present                 = 2
--     index_count                        = 8
--     held_rows_present                  = 0   (held_present_names = {})
--     tirupati_destination_active_rows   = 1
--     place_type_counts                  = {}
--     restaurants_total_info             = 86  (informational — batches 009's
--                                          POST state; this batch must not
--                                          change it)
--
--   POST-IMPORT (if the candidate committed exactly as designed):
--     places_total                       = 16
--     batch11_present / batch11_missing  = 16 / 0
--     batch11_missing_names              = {}
--     batch11_present_names              = all sixteen names
--     p4_marker_rows                     = 16
--     batch11_invariant_violations       = 0
--     batch11_fidelity_violations        = 0
--     schema_columns                     = 21   (unchanged)
--     rls_enabled                        = true (unchanged)
--     select_policy_rows / write_policy_rows = 1 / 0 (unchanged)
--     check_constraints_present          = 2    (unchanged)
--     uniqueness_present                 = 2    (unchanged)
--     index_count                        = 8    (unchanged)
--     held_rows_present                  = 0    (still absent)
--     tirupati_destination_active_rows   = 1
--     place_type_counts                  = {"temple": 6, "hotel": 6,
--                                          "natural_arch": 1, "waterfall": 1,
--                                          "fort": 1, "zoo": 1}
--     restaurants_total_info             = 86   (unchanged)
--
--   ANYTHING ELSE = mixed/unexpected state (partial application, foreign
--   rows, or schema drift): STOP — do not run the import, do not re-import;
--   report the row. NULL rls_enabled means the places table does not exist
--   (migration-008 missing on that project).
-- ============================================================================
with batch11(id, name, slug, ptype) as (
  values
${batch11Cte}
),
held(id) as (
  values
${heldCte}
)
select
  (select count(*) from public.places)                                       as places_total,
  (select count(*) from batch11 b join public.places p on p.id = b.id)       as batch11_present,
  (select count(*) from batch11 b left join public.places p on p.id = b.id where p.id is null) as batch11_missing,
  (select coalesce(array_agg(b.name order by b.name), '{}'::text[])
     from batch11 b left join public.places p on p.id = b.id
    where p.id is null)                                                      as batch11_missing_names,
  (select coalesce(array_agg(p.name order by p.name), '{}'::text[])
     from batch11 b join public.places p on p.id = b.id)                     as batch11_present_names,
  (select count(*) from public.places where source = '${MARKER}')            as p4_marker_rows,
  (select count(*) from public.places p join batch11 b on b.id = p.id
    where p.verification_status is distinct from 'unverified'
       or p.last_verified_at is not null
       or p.name_verified is not null
       or p.address_verified is not null
       or p.coordinates_verified is not null
       or p.latitude is not null or p.longitude is not null
       or p.description is not null
       or p.source is distinct from '${MARKER}'
       or p.source_url is null or btrim(p.source_url) = ''
       or p.city is distinct from 'Tirupati'
       or p.is_active is distinct from true
       or p.destination_id is distinct from
          (select d.id from public.destinations d where d.slug = 'tirupati' and d.is_active))
                                                                             as batch11_invariant_violations,
  (select count(*) from public.places p join batch11 b on b.id = p.id
    where p.slug is distinct from b.slug
       or p.name is distinct from b.name
       or p.place_type is distinct from b.ptype)                             as batch11_fidelity_violations,
  (select count(*) from information_schema.columns
    where table_schema = 'public' and table_name = 'places'
      and column_name in (
        'id','slug','place_type','name','description','address','locality',
        'city','destination_id','latitude','longitude','tags',
        'source','source_url','last_verified_at',
        'name_verified','address_verified','coordinates_verified',
        'verification_status','is_active','created_at'
      ))                                                                     as schema_columns,
  (select rowsecurity from pg_tables
    where schemaname = 'public' and tablename = 'places')                    as rls_enabled,
  (select count(*) from pg_policies
    where schemaname = 'public' and tablename = 'places' and upper(cmd) = 'SELECT') as select_policy_rows,
  (select count(*) from pg_policies
    where schemaname = 'public' and tablename = 'places'
      and upper(cmd) in ('INSERT', 'UPDATE', 'DELETE'))                      as write_policy_rows,
  (select count(*) from pg_constraint
    where conrelid = 'public.places'::regclass
      and conname in ('places_place_type_check', 'places_verification_status_check')
      and contype = 'c')                                                     as check_constraints_present,
  (select count(*) from pg_constraint
    where conrelid = 'public.places'::regclass
      and conname = 'places_slug_key' and contype = 'u')
  + (select count(*) from pg_indexes
    where schemaname = 'public' and tablename = 'places'
      and indexname = 'places_city_name_lower_key')                          as uniqueness_present,
  (select count(*) from pg_indexes
    where schemaname = 'public' and tablename = 'places')                    as index_count,
  (select count(*) from held h join public.places p on p.id = h.id)          as held_rows_present,
  (select coalesce(array_agg(p.name order by p.name), '{}'::text[])
     from held h join public.places p on p.id = h.id)                        as held_present_names,
  (select count(*) from public.destinations
    where slug = 'tirupati' and is_active)                                   as tirupati_destination_active_rows,
  (select coalesce(jsonb_object_agg(t.place_type, t.n), '{}'::jsonb)
     from (select place_type, count(*) as n from public.places group by place_type) t)
                                                                             as place_type_counts,
  (select count(*) from public.restaurants)                                  as restaurants_total_info;

-- The sixteen expected names (for eyeballing batch11_missing_names on PRE):
${missingNamesSorted.map((n) => `--   ${n}`).join("\n")}
--
-- The three HELD-OUT hotels (must NEVER appear; ids are what those rows
-- WOULD carry under the project convention — presence of either id or name
-- is a guard failure):
${HELD_OUT.map((h, i) => `--   ${HELD_IDS[i]}  ${h.name} — ${h.reason}`).join("\n")}
-- ============================================================================
-- NOTHING IN THIS FILE HAS BEEN EXECUTED. Read-only probe; owner runs it
-- manually in the Supabase SQL Editor of the correct project.
-- ============================================================================
`;

/* -------------------------------------- write + hash -------------------------------------- */

const candidatePath = join(ROOT, "supabase", "review-candidates", "insert-batch-011-p4-places.sql");
const verifyPath = join(ROOT, "supabase", "review-candidates", "verify-batch-011-p4-places.sql");
writeFileSync(candidatePath, candidateSql);
writeFileSync(verifyPath, VERIFY);

const sha256 = (p: string) => createHash("sha256").update(readFileSync(p)).digest("hex");

console.log(`[gen-011] wrote ${candidatePath}`);
console.log(`[gen-011] wrote ${verifyPath}`);
console.log(`[gen-011] insert-batch-011-p4-places.sql  sha256=${sha256(candidatePath)}`);
console.log(`[gen-011] verify-batch-011-p4-places.sql   sha256=${sha256(verifyPath)}`);
console.log(`[gen-011] ${ROWS.length} rows emitted; ${HELD_OUT.length} held out; SELF-CHECKS PASS (16/16 uuid5 + slug recomputations matched).`);
console.log("[gen-011] ids:");
for (const r of ROWS) console.log(`   ${r.expectedId}  ${r.name}  [${r.placeType}]`);
console.log("[gen-011] held-out ids (absence probes):");
for (let i = 0; i < HELD_OUT.length; i++) console.log(`   ${HELD_IDS[i]}  ${HELD_OUT[i].name}`);
