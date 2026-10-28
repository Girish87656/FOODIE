/* ==================================================================
   gen-insert-batch-015.ts — Tirupati MASTER discovery Batch-015
   review-candidate generator (public.restaurants + public.places).
   ------------------------------------------------------------------
   Emits THREE artifacts, all REVIEW CANDIDATES — never executed by this repo:
     1. supabase/review-candidates/insert-batch-015-tptm-b5.sql
        59 evidence-curated rows (BATCH-6 AUDIT 2026-10-28: the original 61
        minus 2 rows moved to the review queue for locality-evidence
        conflicts — see batch6/b015-audit.json; the original Batch-5 session
        proposal was 61) from the Batch-5 discovery session (2026-10-29):
          - 40 small food venues -> public.restaurants [the owner's biggest
            known gap: tiffin centres, tea stalls, messes, bakeries, sweet
            shops, juice shops, neighbourhood eateries — T1 directory/
            swiggy/zomato listing titles with locality, or T2 OSM/Nominatim
            mapped POIs inside the bounded Tirupati viewbox]
          - 19 places -> public.places
            (place types: 3 temples — incl. the Alipiri foothill Srivari
            Padalamandapam and the Talakona Siddeswara Swamy Temple;
             1 hotel — VarahaSwami Guest House (official TTD rate table);
            15 'other' — Gogarbham Gardens / Dharmagiri / Narayangiri /
            Asthana Mandapam / Vaikuntam Queue Complex / Seshachalam Hills /
            9 officially-listed Tirumala teerthams)
     2. supabase/review-candidates/verify-batch-015-tptm-b5.sql (read-only probe)
     3. STDOUT reconciliation + SHA-256 of both files.

   SOURCES (all hand-audited; evidence ledger
   scripts/foodie-enrichment/evidence/tirupati-master/batch5/discovery-candidates.json):
     * official TTD page places-around-tirumala.aspx (already saved on disk —
       the dead garden.aspx/theerthams.aspx homepage shells never delivered
       this content);
     * review-queue-new-names.json manual assessment (133 leads → 3 accepts
       routed here, 18 corroborations, 4 held, 38 weak leads stay queued);
     * bounded web_search discovery (19 locality×category queries + 4 lead
       checks) after the ONE-probe availability check passed;
     * bounded Nominatim POI searches (12 queries, Tirupati viewbox).

   ELIGIBILITY:
     * T1/T2 evidence only (locality in listing title / address line, official
       page, news, or mapped POI with published coordinates);
     * BATCH-6 AUDIT (2026-10-28): all 61 candidates re-audited — canonical
       ids recomputed (exact match), zero duplicate/name-drift collisions vs
       inventory/batches 011-014/worksheet/queue, every deterministic flag
       explicitly adjudicated. TWO rows moved OUT to the review queue with
       recorded reasons (batch6/b015-audit.json):
         - 'Amma Appam, Renigunta' — the only quoted address is central-Tirupati
           (G Car Street, T P Area); the Renigunta label came from a category-
           page title, not the venue's own address;
         - 'Radha Rani Tiffin Centre, Padmavathi Nagar' — the category-page
           quote concatenates two different listings; the recorded area is not
           decidable from the snippet.
       The two rows keep their full evidence in batch6/review-queue-batch6.json
       and are counted NOWHERE as inventory/candidates.
     * dedupe gates proved zero collisions against inventory, batches 011–014
       and the curated worksheet (fail-loud at generation);
     * identity-HELD rows excluded (4: Indira Guest House vs frozen batch-013
       'Indira Rest House'; Reddy Tea Stall vs the Tirumala Tea-Stall pair;
       2 Balaji-name drift family rows) — documented in the ledger.

   HONESTY (identical to batches 009-014):
     * deterministic uuid5 ids "foodie-tptm:Tirupati:<canonical name>";
     * verification_status 'unverified' on every row; name_verified,
       address_verified, coordinates_verified, last_verified_at ALL NULL;
     * coordinates NULL on EVERY row — published OSM coordinates stay in the
       evidence ledger for human review, never in the SQL;
     * restaurant addresses at LOCALITY level only (no street invented);
     * price_level/rating>0/opening_hours/phone/description: NOT invented;
     * tags only where the source title/quote evidences them;
     * INSERT-only: no UPDATE, no DELETE, preserves all user content.

   GUARDS (fail-loud; same family as batches 012-014):
     * PREFLIGHT: b15 marker unused; zero id/slug/restaurant-name collisions
       (including against batches 011-014 id sets); batches 011 AND 012 AND
       013 AND 014 each fully absent or fully applied (never partial);
       exactly one ACTIVE tirupati destination.
     * Idempotent rerun: 0/59 fresh or 59/59 applied → no changes; 1-58 → abort.
     * POSTFLIGHT: exact 59-id set; unverified everywhere; ZERO coordinate
       rows; destination linkage; source_url mandatory; place_type
       distribution exact (temple 3, hotel 1, other 15).

   Determinism: running twice produces byte-identical files.
   ================================================================== */

import { writeFileSync, readFileSync } from "fs";
import { createHash } from "crypto";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");
const OUT = join(ROOT, "supabase", "review-candidates");
const LEDGER = join(HERE, "evidence", "tirupati-master", "batch5", "discovery-candidates.json");
const B12_PATH = join(OUT, "insert-batch-012-tptm-master.sql");
const B13_PATH = join(OUT, "insert-batch-013-tptm-b2.sql");
const B14_PATH = join(OUT, "insert-batch-014-tptm-b3.sql");

const NAMESPACE = "6d3a0f5e-7b1c-4a2e-9d84-2f6a1c9e0b31"; // fixed project namespace (batch-009..014)
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

const MARKER = "tptm-b15";
const CITY = "Tirupati";

/* ---------------- candidate ledger (audited Batch-5 source) ---------------- */

interface LedgerCand {
  name: string; area: string; category: string; tier: "T1" | "T2";
  evidence: { quote: string; url: string; sourceKind: string };
  note?: string;
}

const ledger = JSON.parse(readFileSync(LEDGER, "utf8")) as {
  acceptedCandidates: LedgerCand[];
  tallies: { acceptedCandidates: number };
};

/* ---------------- BATCH-6 audit exclusions (explicit, reason-coded) ---------------- */

/* The Batch-6 audit (batch6/b015-audit.json) moved locality-uncertain rows out
 * of the batch. The generator reads the audit result and excludes EXACTLY the
 * recorded rows — if the audit file is missing, or its moved set differs from
 * the ledger, the generator fails loudly instead of silently drifting. */
const AUDIT_PATH = join(HERE, "evidence", "tirupati-master", "batch6", "b015-audit.json");
let movedFromB015: Array<{ name: string }> = [];
if (readFileSync(AUDIT_PATH, "utf8")) {
  const audit = JSON.parse(readFileSync(AUDIT_PATH, "utf8")) as {
    tallies: { audited: number; retained: number; movedToReviewQueue: number };
    movedToReviewQueue: Array<{ name: string }>;
  };
  if (audit.tallies.audited !== ledger.acceptedCandidates.length) {
    throw new Error(`FATAL: batch-6 audit audited ${audit.tallies.audited} rows but the ledger has ${ledger.acceptedCandidates.length} — re-run the audit first.`);
  }
  movedFromB015 = audit.movedToReviewQueue;
}
const movedNames = new Set(movedFromB015.map((m) => m.name));
const cands = ledger.acceptedCandidates.filter((c) => !movedNames.has(c.name));
if (ledger.acceptedCandidates.length - cands.length !== movedFromB015.length) {
  throw new Error("FATAL: audit moved-set does not align with the ledger — re-audit.");
}
if (movedFromB015.length > 0) {
  console.log(`[gen-015] batch-6 audit exclusions applied: ${movedFromB015.map((m) => m.name).join("; ")}`);
}
const N_TOTAL = cands.length;
const N_EXPECTED = 59; // 61 original − 2 batch-6 audit moves

const FOOD_CATEGORIES = new Set(["tiffin", "restaurant", "street_food", "bakery_sweets", "cafe"]);
const restCands = cands.filter((c) => FOOD_CATEGORIES.has(c.category));
const placeCands = cands.filter((c) => !FOOD_CATEGORIES.has(c.category));
if (cands.length !== N_EXPECTED) throw new Error(`FATAL: expected ${N_EXPECTED} rows after batch-6 audit exclusions, got ${cands.length}`);
if (restCands.length !== 40) throw new Error(`FATAL: expected 40 restaurant rows, got ${restCands.length}`);
if (placeCands.length !== 19) throw new Error(`FATAL: expected 19 place rows, got ${placeCands.length}`);

/* tags only where the quote/title evidences them */
const TAGS: Record<string, string[]> = {
  "Babu Tiffin Centre": ["vegetarian"],
  "Rainbow Vegetarian Restaurant": ["vegetarian"],
  "Sunlight Veg Restaurant": ["vegetarian"],
};

const AREA_LABEL: Record<string, string> = {
  "tpt-central": "Tirupati",
  "tpt-neighbourhoods": "Tirupati",
  "tirumala": "Tirumala",
  "tiruchanur": "Tiruchanoor",
  "chandragiri": "Chandragiri",
  "renigunta": "Renigunta",
  "surrounding": "Tirupati",
};

function localitySuffix(name: string): string | null {
  const i = name.lastIndexOf(", ");
  return i > 0 ? name.slice(i + 2).trim() : null;
}

/* ---------------- restaurants (40) ---------------- */

const restRows = restCands.map((c) => {
  const locality = localitySuffix(c.name)
    ?? (c.name === "Babu Tiffin Centre" ? "Bazar Street" : null); // street evidenced in the quote
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

/* ---------------- places (19) ---------------- */

const PLACE_TYPES = ["temple", "waterfall", "fort", "zoo", "natural_arch", "other", "hotel"] as const;
type PlaceType = (typeof PLACE_TYPES)[number];

const placeRows = placeCands.map((c) => {
  /* place_type mapping: temple→temple, hotel→hotel, everything else→other
     (sacred_water teerthams follow the batch-012 convention 'other'; gardens,
      giris, mandapams, queue complex, Seshachalam Hills → 'other') */
  const placeType: PlaceType = c.category === "temple" ? "temple" : c.category === "hotel" ? "hotel" : "other";
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
const b12Slugs = new Set(Array.from(b12SqlText.matchAll(/^    '([a-z0-9-]+)',$/gm)).map((m) => m[1]));
const b13Slugs = new Set(Array.from(b13SqlText.matchAll(/^    '([a-z0-9-]+)',$/gm)).map((m) => m[1]));
const b14Slugs = new Set(Array.from(b14SqlText.matchAll(/^    '([a-z0-9-]+)',$/gm)).map((m) => m[1]));
const seenSlugs = new Set<string>();
const placeSlugs = new Map<string, string>();
for (const p of placeRows) {
  const suffix = localitySuffix(p.name);
  const base = slugify(suffix ? p.name.slice(0, p.name.length - suffix.length - 2) : p.name);
  let slug = base;
  if (seenSlugs.has(slug) || b12Slugs.has(slug) || b13Slugs.has(slug) || b14Slugs.has(slug)) slug = `${base}-${slugify(p.locality)}`;
  if (seenSlugs.has(slug)) throw new Error(`FATAL: slug collision after fallback: ${slug}`);
  if (b12Slugs.has(slug)) throw new Error(`FATAL: slug collides with batch-012: ${slug}`);
  if (b13Slugs.has(slug)) throw new Error(`FATAL: slug collides with batch-013: ${slug}`);
  if (b14Slugs.has(slug)) throw new Error(`FATAL: slug collides with batch-014: ${slug}`);
  seenSlugs.add(slug);
  placeSlugs.set(p.key, slug);
}

/* ---------------- ids ---------------- */

const restIds = restRows.map((r) => ({ r, id: uuid5(`foodie-tptm:${CITY}:${r.name}`) }));
const placeIds = placeRows.map((r) => ({ r, id: uuid5(`foodie-tptm:${CITY}:${r.name}`) }));
const ALL_IDS = [...restIds.map((x) => x.id), ...placeIds.map((x) => x.id)];
if (new Set(ALL_IDS).size !== ALL_IDS.length) throw new Error("FATAL: id collision within batch-015");

/* batch-012/013/014 ids parsed from the committed review candidates (source of truth) */
const parseIds = (text: string, expect: number, label: string) => {
  const ids = Array.from(text.matchAll(/'([0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})'::uuid/g)).map((m) => m[1]);
  const uniq = new Set(ids);
  if (uniq.size !== expect) throw new Error(`FATAL: expected ${expect} ${label} ids in SQL, parsed ${uniq.size}`);
  return Array.from(uniq);
};
const b12Ids = parseIds(b12SqlText, 29, "batch-012");
const b13Ids = parseIds(b13SqlText, 57, "batch-013");
const b14Ids = parseIds(b14SqlText, 27, "batch-014");
for (const [label, frozen] of [["batch-012", b12Ids], ["batch-013", b13Ids], ["batch-014", b14Ids]] as const) {
  const clash = ALL_IDS.filter((id) => frozen.includes(id));
  if (clash.length) throw new Error(`FATAL: batch-015 ids collide with ${label}: ${clash.join(", ")}`);
}

/* batch-011 ids (same list family as batches 012-014's generators) */
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
if (b11clash.length) throw new Error(`FATAL: batch-015 ids collide with batch-011: ${b11clash.join(", ")}`);

const ALL_SLUGS = placeRows.map((p) => placeSlugs.get(p.key)!);

/* ---------------- SQL ---------------- */

const restValues = restIds.map(({ r, id }) => `  (
    '${id}'::uuid,
    ${sq(r.name)},
    '${r.category}',
    ${sq(r.address)},     -- locality-level address EXACTLY as the listing title/quote supports (no street invented)
    ${sq(CITY)},
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

const placeValues = placeIds.map(({ r, id }) => {
  const slug = placeSlugs.get(r.key)!;
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
    null,                    -- latitude: no area-gated geocode passed for this candidate — NEVER estimated
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
  )`;
}).join(",\n");

const ptDist = placeRows.reduce<Record<string, number>>((a, r) => ((a[r.placeType] = (a[r.placeType] ?? 0) + 1), a), {});
const catDist = restRows.reduce<Record<string, number>>((a, r) => ((a[r.category] = (a[r.category] ?? 0) + 1), a), {});

const SQL = `-- ===========================================================================
-- insert-batch-015-tptm-b5.sql — REVIEW CANDIDATE (NEVER executed by the repo)
-- Tirupati MASTER place discovery — Batch 015 (Batch-5 session, 2026-10-29)
-- Generated by scripts/foodie-enrichment/gen-insert-batch-015.ts (deterministic).
-- ===========================================================================
--
-- SCOPE (${N_TOTAL} rows; evidence ledger
--   scripts/foodie-enrichment/evidence/tirupati-master/batch5/discovery-candidates.json):
--   * ${restCands.length} small food venues -> public.restaurants [T1 directory/swiggy/zomato/
--     magicpin listing titles with locality, T2 OSM/Nominatim mapped POIs in
--     the bounded Tirupati viewbox] — the owner's stated biggest gap:
--     tiffin centres, tea stalls, messes, bakeries, sweet shops, juice shops,
--     neighbourhood eateries
--     (categories: ${Object.entries(catDist).map(([k, v]) => `${k} ${v}`).join(", ")})
--   * 19 places -> public.places
--     (place types: temple ${ptDist.temple}, hotel ${ptDist.hotel}, other ${ptDist.other};
--      incl. 9 officially-listed Tirumala teerthams, Gogarbham Gardens,
--      Dharmagiri, Narayangiri, Asthana Mandapam, Vaikuntam Queue Complex,
--      Seshachalam Hills, Srivari Padalamandapam Temple (Alipiri footpath
--      head), Sri Lakshmi Narayana Swamy Temple, Siddeswara Swamy Temple
--      (Talakona), VarahaSwami Guest House)
--
-- SOURCES (hand-audited, 2026-10-29):
--   * official TTD places-around-tirumala.aspx (saved on disk; the dead
--     garden.aspx / theerthams.aspx homepage shells never delivered this);
--   * review-queue-new-names.json manual assessment: 133 leads → 3 accepts
--     routed here (VarahaSwami GH, Seshachalam Hills + lead-check upgrades),
--     18 corroborations of existing records, 4 identity-held, 38 weak leads
--     stay in the review queue (batch5/review-queue-assessment.json);
--   * bounded web_search discovery (ONE availability probe passed; 19
--     locality×category queries + 4 lead checks; 8s pacing);
--   * bounded Nominatim POI searches (12 queries, viewbox-bounded).
--
-- IDENTITY-HELD (stay in the evidence ledger only, never SQL):
--   * "Indira Guest House, Tirumala" — batch-013 already queues the frozen
--     canonical 'Indira Rest House, Tirumala'; plausibly same property;
--   * "Reddy Tea Stall, Tirumala" — overlaps the batch-014 held
--     'Tirumala Tea Stall' conflicting-locality pair;
--   * "Sri Balaji Tea Stall, Tirumala" + "Balaji Sweets & Bakery,
--     Korramenugunta" — Balaji-name drift family (extends the batch-014
--     'Tirumala Balaji Sweets' hold).
--
-- COORDINATES HONESTY: NO row carries coordinates — published OSM coordinates
-- remain in the evidence ledger for human review; coordinates are never
-- estimated, and an import NEVER self-verifies.
--
-- EXCLUSIONS (honest accounting):
--   * Batches 011-014's rows are NOT duplicated (id/slug collision guards
--     assert this at generation and in preflight).
--   * 38 weak leads (list-mentions without locality, aggregators, chains,
--     institutional canteens, dated sources) and 4 held rows are NOT here.
--
-- HONESTY (identical to batches 009-014): deterministic uuid5 ids
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
do $pf015$
declare
  v_marker integer; v_dup_ids integer; v_dup_slugs integer; v_dup_names integer;
  v_dest_total integer; v_dest_active integer; v_b11 integer; v_b12 integer; v_b13 integer; v_b14 integer;
begin
  select count(*) into v_marker from public.places where source = '${MARKER}';
  if v_marker <> 0 then
    raise exception 'PREFLIGHT FAIL: % places row(s) already carry ${MARKER} — batch applied (at least partially).', v_marker;
  end if;
  select count(*) into v_marker from public.restaurants where source = '${MARKER}';
  if v_marker <> 0 then
    raise exception 'PREFLIGHT FAIL: % restaurants row(s) already carry ${MARKER} — batch applied (at least partially).', v_marker;
  end if;
  raise notice 'PREFLIGHT OK: ${MARKER} markers unused.';

  select count(*) into v_dup_ids from public.places where id in (${ALL_IDS.join(", ")});
  if v_dup_ids <> 0 then
    raise exception 'PREFLIGHT FAIL: % batch-015 place ids already exist — importing would collide.', v_dup_ids;
  end if;
  select count(*) into v_dup_ids from public.restaurants where id in (${ALL_IDS.join(", ")});
  if v_dup_ids <> 0 then
    raise exception 'PREFLIGHT FAIL: % batch-015 ids already exist in restaurants — importing would collide.', v_dup_ids;
  end if;
  raise notice 'PREFLIGHT OK: no id collisions.';

  select count(*) into v_dup_slugs from public.places where slug in (${ALL_SLUGS.map((s) => sq(s)).join(", ")});
  if v_dup_slugs <> 0 then
    raise exception 'PREFLIGHT FAIL: % batch-015 slugs already exist — importing would collide.', v_dup_slugs;
  end if;
  raise notice 'PREFLIGHT OK: no slug collisions.';

  select count(*) into v_dup_names from public.restaurants
   where lower(btrim(name)) in (${restRows.map((r) => `lower(btrim(${sq(r.name)}))`).join(", ")});
  if v_dup_names <> 0 then
    raise exception 'PREFLIGHT FAIL: % batch-015 restaurant names already exist — importing would duplicate rows.', v_dup_names;
  end if;
  raise notice 'PREFLIGHT OK: no restaurant name collisions.';

  select count(*) into v_b11 from public.places where id in (${BATCH011_ALL_IDS.join(", ")});
  if v_b11 not in (0, 16) then
    raise exception 'PREFLIGHT FAIL: Batch-011 rows PARTIALLY present (%) — owner review required before batch-015.', v_b11;
  end if;
  raise notice 'PREFLIGHT OK: Batch-011 state coherent (%/16 present).', v_b11;

  select count(*) into v_b12 from public.places where id in (${b12Ids.join(", ")});
  v_b12 := v_b12 + (select count(*) from public.restaurants where id in (${b12Ids.join(", ")}));
  if v_b12 not in (0, 29) then
    raise exception 'PREFLIGHT FAIL: Batch-012 rows PARTIALLY present (%) — owner review required before batch-015.', v_b12;
  end if;
  raise notice 'PREFLIGHT OK: Batch-012 state coherent (%/29 present).', v_b12;

  select count(*) into v_b13 from public.places where id in (${b13Ids.join(", ")});
  v_b13 := v_b13 + (select count(*) from public.restaurants where id in (${b13Ids.join(", ")}));
  if v_b13 not in (0, 57) then
    raise exception 'PREFLIGHT FAIL: Batch-013 rows PARTIALLY present (%) — owner review required before batch-015.', v_b13;
  end if;
  raise notice 'PREFLIGHT OK: Batch-013 state coherent (%/57 present).', v_b13;

  select count(*) into v_b14 from public.places where id in (${b14Ids.join(", ")});
  v_b14 := v_b14 + (select count(*) from public.restaurants where id in (${b14Ids.join(", ")}));
  if v_b14 not in (0, 27) then
    raise exception 'PREFLIGHT FAIL: Batch-014 rows PARTIALLY present (%) — owner review required before batch-015.', v_b14;
  end if;
  raise notice 'PREFLIGHT OK: Batch-014 state coherent (%/27 present).', v_b14;

  select count(*), count(*) filter (where is_active) into v_dest_total, v_dest_active
    from public.destinations where slug = 'tirupati';
  if v_dest_total <> 1 or v_dest_active <> 1 then
    raise exception 'PREFLIGHT FAIL: expected exactly 1 active tirupati destination (got % total / % active).', v_dest_total, v_dest_active;
  end if;
  raise notice 'PREFLIGHT OK: tirupati destination present and active.';
end
$$;

-- ---------------------------------------------------------------------------
-- Part 1 — INSERTS (${restCands.length} food-venue rows; fixed ids; full provenance)
-- ---------------------------------------------------------------------------
insert into public.restaurants
  (id, name, category, address, city, locality, latitude, longitude, rating, price_level, opening_hours, phone, tags, source, source_url, verification_status)
values
${restValues}
;

-- ---------------------------------------------------------------------------
-- Part 2 — INSERTS (19 place rows into public.places)
-- ---------------------------------------------------------------------------
do $ins015$
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
  raise notice 'INSERT OK: 19 batch-015 place rows inserted.';
end
$ins015$;

-- ---------------------------------------------------------------------------
-- POSTFLIGHT: hard guards (any violation → COMMIT below never runs → rollback)
-- ---------------------------------------------------------------------------
do $post015$
declare
  v_rest integer; v_places integer; v_unver integer; v_coords integer;
  v_nolink integer; v_nosrc integer; v_temple integer; v_hotel integer; v_other integer;
begin
  select count(*) into v_rest from public.restaurants where source = '${MARKER}';
  if v_rest <> ${restCands.length} then
    raise exception 'POSTFLIGHT FAIL: expected ${restCands.length} batch-015 restaurant rows, found %.', v_rest;
  end if;
  select count(*) into v_places from public.places where source = '${MARKER}';
  if v_places <> 19 then
    raise exception 'POSTFLIGHT FAIL: expected 19 batch-015 place rows, found %.', v_places;
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

  select count(*) filter (where place_type = 'temple') into v_temple from public.places where source = '${MARKER}';
  select count(*) filter (where place_type = 'hotel') into v_hotel from public.places where source = '${MARKER}';
  select count(*) filter (where place_type = 'other') into v_other from public.places where source = '${MARKER}';
  if v_temple <> ${ptDist.temple} or v_hotel <> ${ptDist.hotel} or v_other <> ${ptDist.other} then
    raise exception 'POSTFLIGHT FAIL: place_type distribution drifted (temple=% hotel=% other=%; expected ${ptDist.temple}/${ptDist.hotel}/${ptDist.other}).', v_temple, v_hotel, v_other;
  end if;
  raise notice 'POSTFLIGHT OK: ${N_TOTAL} rows verified (${restCands.length} restaurants + ${placeCands.length} places; temple ${ptDist.temple}, hotel ${ptDist.hotel}, other ${ptDist.other}).';
end
$post015$;

commit;
`;

const VERIFY_SQL = `-- ===========================================================================
-- verify-batch-015-tptm-b5.sql — READ-ONLY state probe (PRE/POST review aid)
-- ===========================================================================
select 'restaurants_b15' as what, count(*) as n from public.restaurants where source = '${MARKER}'
union all
select 'places_b15', count(*) from public.places where source = '${MARKER}'
union all
select 'places_b15_unverified', count(*) from public.places where source = '${MARKER}' and verification_status = 'unverified'
union all
select 'places_b15_with_coords', count(*) from public.places where source = '${MARKER}' and latitude is not null
union all
select 'batch012_present', count(*) from public.places where id in (${b12Ids.join(", ")})
union all
select 'batch013_present', count(*) from public.places where id in (${b13Ids.join(", ")})
union all
select 'batch014_present', count(*) from public.places where id in (${b14Ids.join(", ")})
union all
select 'batch011_present', count(*) from public.places where id in (${BATCH011_ALL_IDS.join(", ")});
`;

writeFileSync(join(OUT, "insert-batch-015-tptm-b5.sql"), SQL);
writeFileSync(join(OUT, "verify-batch-015-tptm-b5.sql"), VERIFY_SQL);

const sha = (p: string) => createHash("sha256").update(readFileSync(p)).digest("hex");
console.log("batch-015 review candidates written:");
console.log("  insert-batch-015-tptm-b5.sql  sha256:", sha(join(OUT, "insert-batch-015-tptm-b5.sql")));
console.log("  verify-batch-015-tptm-b5.sql  sha256:", sha(join(OUT, "verify-batch-015-tptm-b5.sql")));
console.log(`rows: ${restRows.length} restaurants (T1/T2) + ${placeRows.length} places = ${restRows.length + placeRows.length}`);
console.log("place types:", JSON.stringify(ptDist), "| restaurant categories:", JSON.stringify(catDist));
