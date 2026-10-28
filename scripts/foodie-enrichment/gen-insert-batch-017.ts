/* ==================================================================
   gen-insert-batch-017.ts — Tirupati MASTER discovery Batch-017
   review-candidate generator (public.restaurants + public.places).
   ------------------------------------------------------------------
   Emits THREE artifacts, all REVIEW CANDIDATES — never executed by this repo:
     1. supabase/review-candidates/insert-batch-017-tptm-b7.sql
        82 evidence-curated rows from the batch-7 eligibility review
        (2026-10-27) of the worksheet rows that verification progress made
        batch-eligible after batches 012-016 were frozen:
          - 53 food venues -> public.restaurants [Tier T1: independent
            verification search confirmed the area with address evidence;
            listing title supports name+category+locality]
            (categories: restaurant 7, tiffin 17, street_food 7,
             bakery_sweets 19, cafe 3)
          - 29 places -> public.places
            (place types: temple 8, hotel 3, waterfall 1, other 17)
     2. supabase/review-candidates/verify-batch-017-tptm-b7.sql (read-only probe)
     3. STDOUT reconciliation + SHA-256 of both files.

   WHY THIS BATCH EXISTS (forward-drift gate): batches 012-016 froze the
   eligible rows known at their generation time. The batch-5/6 verification
   resumes (and the batch-7 session's bounded chunks) area-confirmed 60 more
   worksheet rows, promoting them T3 -> T1. The forward-drift gate ("every
   eligible worksheet row is imported under its canonical-name id") failed —
   correctly. This batch is the pipeline's established remedy: a fresh,
   individually-reviewed eligibility batch.

   ELIGIBILITY (individually reviewed against the curated worksheet, the
   verify evidence files, batches 011-016 SQL and the live production rows):
     * explicit audited key lists below (ADMIT); every admit is
       status='curated', existingSet='new', tier T1|T2, with verify evidence;
     * 6 identity-HELD rows excluded (documented below, stay in worksheet +
       duplicate review doc, counted NOWHERE);
     * 22 rows DROPPED with recorded reasons (articles, topic pages, broken
       titles, area pages, product ads, out-of-scope, one duplicate alias);
     * zero id/slug/name collisions against batches 011-016 (fail-loud at
       generation and in preflight).

   IDENTITY-HELD (6 — never in this batch; reconcile first):
     * 'Ganapathi Juice Shop' + 'Ganesh Juice Center' (both Tilak Road) —
       drift cluster vs the FROZEN batch-014 row 'Ganesh Juice Corner'
       (same road, same category); three names, one venue family, unresolved.
     * 'Varasiddi Vinayaka Swamy Temple' — spelling-drift cluster vs the
       admitted 'Sri Vara Siddhi Vinayaka Ayyappa Swamy Temple' (both
       central Tirupati, no locality in either listing title).
     * 'Vinayaka Temple' (Tirumala) — generic name; multiple Vinayaka
       shrines at Tirumala; identity unresolved (same family as the batch-3
       'Sri Vinayaka Swamy Temple' hold).
     * 'Tirumala Mandir' (Alipiri Gate listing) — ambiguous: either a local
       shrine or a reference to the main Tirumala temple (already covered by
       batch-011); importing risks a double-queue.
     * 'Lepakshi Handicrafts Emporium' — two documented verify hits (Tirumala
       branch + Tirupati branch); a single row would conflate two venues.

   DROPS (22, recorded reasons — kept in curation log, counted NOWHERE):
     * review/article pages: 'Lovely breakfast at Hotel Orion',
       'Tirupati early morning non-veg breakfast',
       '9 Waterfalls near Tirupati That Every Traveller Must Visit',
       'Tirupati Historic Sites & Districts to Visit';
     * topic/service pages, not venues: 'Morning Breakfast' (Annaprasadam
       meal page), 'Weekly Sevas', 'Thomala Seva',
       'TTD Information Centres and Kalyana Mandapams';
     * broken/truncated listing titles: 'Tirupati Balaji Temple in',
       'Accommodation at', 'Rest Houses in', 'free accommodation in';
     * area/destination pages, not venue rows: 'Tirumala' (already a
       destination), 'Renigunta' (a locality),
       'Srinivasa Mangapuram hotels & places to stay';
     * product ad / sub-listing / video noise: 'Activity Toy in Tirupati -
       Engaging, Fun & Educational', 'Stores and Outlets' (Holiday Inn
       sub-listing), 'Videos from Well-kept';
     * ambiguous institution: 'Tirupati Regional Centre';
     * out-of-scope locality: 'SV Temple Amaravathi' (Guntur district);
     * duplicate alias: 'Tada Falls' = 'Ubbalamadugu Falls' (same waterfall,
       admitted once under the official name).

   HONESTY (identical to batches 009-016):
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

   GUARDS (fail-loud; same family as batches 012-016):
     * PREFLIGHT: b17 marker unused; zero id/slug/restaurant-name collisions
       (including against batches 011-016 id sets); batches 011-016 each
       fully absent or fully applied (never partial); exactly one ACTIVE
       tirupati destination.
     * Idempotent rerun: 0/82 fresh or 82/82 applied → no changes; 1-81 → abort.
     * POSTFLIGHT: exact 82-id set; unverified everywhere; ZERO coordinate
       rows; destination linkage; source_url mandatory; place_type
       distribution exact (temple 8, hotel 3, waterfall 1, other 17).

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
const B14_PATH = join(OUT, "insert-batch-014-tptm-b3.sql");
const B15_PATH = join(OUT, "insert-batch-015-tptm-b5.sql");
const B16_PATH = join(OUT, "insert-batch-016-tptm-b6.sql");

const NAMESPACE = "6d3a0f5e-7b1c-4a2e-9d84-2f6a1c9e0b31"; // fixed project namespace (batch-009..016)
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
function localitySuffix(name: string): string | null {
  const i = name.lastIndexOf(", ");
  return i > 0 ? name.slice(i + 2).trim() : null;
}

const MARKER = "tptm-b17";
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

/* ---------------- the audited key lists (batch-7 eligibility review) -------- */

const REST_KEYS = [
  /* food-restaurants (7) */
  "tpt-central::mana hari villu family restaurant",
  "tpt-central::mayura garden family restaurant korlagunta",  /* alias-merged canonical of the Korlagunta listing (the neighbourhoods twin is marked duplicate) */
  "tirumala::di table 9",
  "tpt-neighbourhoods::bhagni s family restaurant",
  "tpt-neighbourhoods::bhavani bhojnalaya",
  "chandragiri::raja food centre",
  "renigunta::star kitchen renigunta",
  /* food-tiffin (17) */
  "tpt-central::vinayaka tiffin centre",
  "tirumala::padamavathi tiffin center",
  "tpt-neighbourhoods::kumari tiffin center",
  "tpt-central::sri venkateswara tiffin center",
  "tpt-neighbourhoods::madras tiffin center",
  "tpt-neighbourhoods::gayatri tiffin center",
  "tirumala::lavanya tiffin center",
  "tpt-neighbourhoods::naidu tiffin center",
  "tpt-neighbourhoods::chandra mess",
  "tpt-neighbourhoods::revathi mess and catering",
  "tpt-neighbourhoods::sri padmavathi mess",
  "tpt-central::nagarjuna military mess",
  "tpt-neighbourhoods::deepika mess",
  "tpt-neighbourhoods::gokul mess",
  "tpt-neighbourhoods::otc orion tiffin centre korlagunta",
  "chandragiri::geetha general stores and tiffin centre",
  "renigunta::aapam tiffin center renigunta",
  /* food-street (7) */
  "tpt-central::mr s juice bar",
  "tpt-central::hygien pani puri hot chats",
  "tpt-central::pani puri centre",
  "tpt-neighbourhoods::vasundhara tea stall",
  "tpt-neighbourhoods::venkat sai tea stall",
  "tpt-neighbourhoods::dessertezy",
  "tpt-neighbourhoods::18th street kitchen",
  /* food-bakery (19) */
  "tpt-neighbourhoods::tirumala bakery house",
  "tpt-neighbourhoods::bakers delight",
  "tpt-central::mayura bakery",
  "tpt-central::babas bakery",
  "tpt-neighbourhoods::tirumala bakery and sweets",
  "tpt-neighbourhoods::nic natural ice creams",
  "tpt-central::cream stone",
  "tpt-neighbourhoods::shivam ice cream",
  "tpt-central::havmor ice cream",
  "tirumala::ice stone",
  "tpt-central::grand cakes and bakes",
  "tpt-neighbourhoods::tirumala cake house",
  "tpt-central::balaji bakery and sweets",
  "tpt-central::mithaiwala",
  "tpt-neighbourhoods::vijaya kitchen",
  "tpt-neighbourhoods::sri krishna ayyangar sweets and bakery",
  "tpt-neighbourhoods::bangalore bakery",
  "tpt-neighbourhoods::sri venkateshwara bakery and sweets",
  "tpt-neighbourhoods::meghana sweets and bakery",
  /* food-cafe (3) */
  "renigunta::chota cafe",
  "tpt-central::srinivasa cafe",
  "tiruchanur::explore citrus cafe",
];

const PLACE_KEYS = [
  /* temples (8) */
  "tpt-central::sri vara siddhi vinayaka ayyappa swamy temple",
  "tpt-central::sri ramulavari temple",            /* verify title: 'in Nehru Nagar' */
  "tpt-central::tirupati golden temple in tata nagar",
  "tpt-neighbourhoods::avilala church",            /* church -> place_type 'other' + tag */
  "chandragiri::shri ramulavari temple",
  "renigunta::mathamma temple",
  "renigunta::sai baba temple",
  /* surrounding temples (3) — Nagari, Chittoor (clearly labelled) */
  "surrounding::om shakthi temple in nagari chittoor",
  "surrounding::skms temple in nagari chittoor",
  "surrounding::perumal temple in nagari chittoor",
  /* attractions (9) */
  "tpt-neighbourhoods::srinivasa auditorium mr palli circle",
  "tpt-central::ttd gardens",
  "tpt-central::tirupati artist colony in bommagunta",
  "tirumala::sannidhi park",
  "tpt-neighbourhoods::tummalagunta playground",
  "tpt-neighbourhoods::kids zone",                 /* verify title: 'in V V Mahal Road' */
  /* surrounding destinations (3) — clearly labelled, geographically separate */
  "surrounding::kalyani dam",
  "surrounding::horsley hills",
  "surrounding::ubbalamadugu falls",               /* 'Tada Falls' alias NOT double-queued */
  /* stays (2) */
  "tpt-central::treebo sripadha residency alipiri road",
  "tiruchanur::amrutha home stay",
  /* markets (8) */
  "tpt-neighbourhoods::bnr mall",
  "tpt-central::garuda mall",
  "tpt-central::sirikala shopping mall",
  "tpt-central::tirupathi vegetable market",
  "tpt-central::day fresh vegetables",
  "renigunta::venky vegetables market",
  "tpt-central::apurva textiles",
  "tpt-central::sunil textiles",
];

/* identity-held keys — documented in the header, never imported */
const HELD_KEYS = [
  "tpt-central::ganapathi juice shop",             /* Tilak Road juice-name drift cluster vs frozen b14 'Ganesh Juice Corner' */
  "tpt-central::ganesh juice center",              /* same cluster */
  "tpt-central::varasiddi vinayaka swamy temple",  /* spelling-drift cluster vs 'Sri Vara Siddhi Vinayaka Ayyappa Swamy Temple' */
  "tirumala::vinayaka temple",                     /* generic; multiple Tirumala Vinayaka shrines */
  "tpt-central::tirumala mandir",                  /* Alipiri listing; ambiguous vs main temple (batch-011) */
  "tpt-central::lepakshi handicrafts emporium",    /* two branches (Tirumala + Tirupati) documented */
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

/* per-key locality overrides where the hint/area is weaker than the locality
   the listing title actually carries; 'surrounding' rows are labelled as
   geographically separate destinations (never folded into the city) */
const EXPLICIT_REST_LOCALITY: Record<string, string> = {
  "renigunta::chota cafe": "Mangalam",             /* hint 'Mangalam (Renigunta corridor)' — batch-015 rendering */
};
const EXPLICIT_LOCALITY: Record<string, string> = {
  "tpt-central::sri ramulavari temple": "Nehru Nagar",           /* verify listing title */
  "tpt-neighbourhoods::kids zone": "V V Mahal Road",             /* verify listing title */
  "surrounding::om shakthi temple in nagari chittoor": "Nagari (surrounding destination)",
  "surrounding::skms temple in nagari chittoor": "Nagari (surrounding destination)",
  "surrounding::perumal temple in nagari chittoor": "Nagari (surrounding destination)",
  "surrounding::kalyani dam": "Kalyani Dam (surrounding destination)",
  "surrounding::horsley hills": "Horsley Hills (surrounding destination, Chittoor district)",
  "surrounding::ubbalamadugu falls": "Tada (surrounding destination)",
  "renigunta::venky vegetables market": "Mangalam",
};

/* the surrounding rows carry an explicit geographically-separating tag */
const EXTRA_TAGS: Record<string, string[]> = {
  "surrounding::om shakthi temple in nagari chittoor": ["surrounding-destination"],
  "surrounding::skms temple in nagari chittoor": ["surrounding-destination"],
  "surrounding::perumal temple in nagari chittoor": ["surrounding-destination"],
  "surrounding::kalyani dam": ["surrounding-destination"],
  "surrounding::horsley hills": ["surrounding-destination"],
  "surrounding::ubbalamadugu falls": ["surrounding-destination"],
  "tpt-neighbourhoods::avilala church": ["church"],              /* place_type remap is documented */
  "tirumala::sannidhi park": ["park"],                            /* place_type remap is documented */
};

/* per-key place_type overrides (batch-7 review; each is evidence-based and
   fail-loud — the curated worksheet mis-derived these two):
   * 'kids zone' carried place_type 'fort' — a curation mis-derivation
     (a kids play zone is not a fort); corrected to 'other', and the wrong
     type is deliberately NOT preserved as a tag (it would be a false claim);
   * 'ubbalamadugu falls' carried the fallback 'other' — the listing titles
     ('Ubbalamadugu Falls', 'Tada Falls') and the batch-4 crossmatch evidence
     affirm it is a waterfall; corrected to the enum value 'waterfall'. */
const PLACE_TYPE_OVERRIDES: Record<string, PlaceType> = {
  "tpt-neighbourhoods::kids zone": "other",
  "surrounding::ubbalamadugu falls": "waterfall",
};

/* ---------------- restaurants (53) ---------------- */

const FOOD_CATEGORIES = new Set(["restaurant", "tiffin", "street_food", "bakery_sweets", "cafe", "hotel", "fast_food"]);

const restRows = REST_KEYS.map((key) => {
  const r = fetchRow(key, "new");
  if (!FOOD_CATEGORIES.has(r.category)) {
    throw new Error(`FATAL: "${key}" category "${r.category}" not in restaurants CHECK union`);
  }
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

/* ---------------- places (29) ---------------- */

const PLACE_TYPES = ["temple", "waterfall", "fort", "zoo", "natural_arch", "other", "hotel"] as const;
type PlaceType = (typeof PLACE_TYPES)[number];

const placeRows = PLACE_KEYS.map((key) => {
  const r = fetchRow(key, "new");
  const override = PLACE_TYPE_OVERRIDES[key];
  const rawType = (r.placeType ?? "").toLowerCase();
  let placeType: PlaceType;
  let remapTag: string | null = null;
  if (override) {
    placeType = override; /* mis-derivation corrected — see PLACE_TYPE_OVERRIDES */
    remapTag = null;      /* the wrong raw type is NOT preserved as a tag */
  } else if (rawType === "temple") placeType = "temple";
  else if (rawType === "waterfall") placeType = "waterfall";
  else if (rawType === "hotel") placeType = "hotel";
  else if (rawType === "church" || rawType === "park" || rawType === "museum" || rawType === "") placeType = "other";
  else if (PLACE_TYPES.includes(rawType as PlaceType)) placeType = rawType as PlaceType;
  else placeType = "other";
  if (rawType && rawType !== placeType && !remapTag) {
    remapTag = rawType; /* the source evidenced this type; keep it as a tag */
  }
  if (!PLACE_TYPES.includes(placeType)) throw new Error(`FATAL: "${key}" placeType "${placeType}" not in enum`);
  const locality = EXPLICIT_LOCALITY[key]
    ?? localitySuffix(r.name)
    ?? r.localityHint
    ?? AREA_LABEL[r.area];
  if (!locality) throw new Error(`FATAL: "${key}" could not derive a locality`);
  const geo = r.geocode;
  /* curate-tirupati-master.ts stores geocodes ONLY when the OSM area gate passed,
     so lat != null already implies an area-gated, evidence-backed geocode */
  const coords = geo && geo.lat != null && geo.lng != null
    ? { lat: geo.lat, lng: geo.lng }
    : null;
  const tags = Array.from(new Set([...r.tags, ...(EXTRA_TAGS[key] ?? []), ...(remapTag ? [remapTag] : [])]));
  return {
    key, name: r.name, placeType, locality, tags,
    sourceUrl: r.sourceUrl, coords, tier: r.tier,
  };
});

/* slugs: base = slugify(name minus locality suffix); on collision append locality */
const b12SqlText = readFileSync(B12_PATH, "utf8");
const b13SqlText = readFileSync(B13_PATH, "utf8");
const b14SqlText = readFileSync(B14_PATH, "utf8");
const b15SqlText = readFileSync(B15_PATH, "utf8");
const b16SqlText = readFileSync(B16_PATH, "utf8");
const b12Slugs = new Set(Array.from(b12SqlText.matchAll(/^    '([a-z0-9-]+)',$/gm)).map((m) => m[1]));
const b13Slugs = new Set(Array.from(b13SqlText.matchAll(/^    '([a-z0-9-]+)',$/gm)).map((m) => m[1]));
const b14Slugs = new Set(Array.from(b14SqlText.matchAll(/^    '([a-z0-9-]+)',$/gm)).map((m) => m[1]));
const b15Slugs = new Set(Array.from(b15SqlText.matchAll(/^    '([a-z0-9-]+)',$/gm)).map((m) => m[1]));
const b16Slugs = new Set(Array.from(b16SqlText.matchAll(/^    '([a-z0-9-]+)',$/gm)).map((m) => m[1]));
const seenSlugs = new Set<string>();
const placeSlugs = new Map<string, string>();
for (const p of placeRows) {
  const suffix = localitySuffix(p.name);
  const base = slugify(suffix ? p.name.slice(0, p.name.length - suffix.length - 2) : p.name);
  let slug = base;
  if (seenSlugs.has(slug) || b12Slugs.has(slug) || b13Slugs.has(slug) || b14Slugs.has(slug) || b15Slugs.has(slug) || b16Slugs.has(slug)) slug = `${base}-${slugify(p.locality)}`;
  if (seenSlugs.has(slug)) throw new Error(`FATAL: slug collision after fallback: ${slug}`);
  for (const [label, set] of [["batch-012", b12Slugs], ["batch-013", b13Slugs], ["batch-014", b14Slugs], ["batch-015", b15Slugs], ["batch-016", b16Slugs]] as const) {
    if (set.has(slug)) throw new Error(`FATAL: slug collides with ${label}: ${slug}`);
  }
  seenSlugs.add(slug);
  placeSlugs.set(p.key, slug);
}

/* ---------------- ids ---------------- */

const restIds = restRows.map((r) => ({ r, id: uuid5(`foodie-tptm:${CITY}:${r.name}`) }));
const placeIds = placeRows.map((r) => ({ r, id: uuid5(`foodie-tptm:${CITY}:${r.name}`) }));
const ALL_IDS = [...restIds.map((x) => x.id), ...placeIds.map((x) => x.id)];
if (new Set(ALL_IDS).size !== ALL_IDS.length) throw new Error("FATAL: id collision within batch-017");
if (ALL_IDS.length !== 82) throw new Error(`FATAL: expected 82 rows, got ${ALL_IDS.length}`);

/* frozen batch id sets parsed from the committed review candidates */
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
const B16_IDS = idsFromSql(B16_PATH, "batch-016");
if (new Set(B12_IDS).size !== 29) throw new Error(`FATAL: expected 29 batch-012 ids, parsed ${new Set(B12_IDS).size}`);
if (new Set(B13_IDS).size !== 57) throw new Error(`FATAL: expected 57 batch-013 ids, parsed ${new Set(B13_IDS).size}`);
if (new Set(B14_IDS).size !== 27) throw new Error(`FATAL: expected 27 batch-014 ids, parsed ${new Set(B14_IDS).size}`);
if (new Set(B15_IDS).size !== 59) throw new Error(`FATAL: expected 59 batch-015 ids, parsed ${new Set(B15_IDS).size}`);
if (new Set(B16_IDS).size !== 18) throw new Error(`FATAL: expected 18 batch-016 ids, parsed ${new Set(B16_IDS).size}`);
for (const [label, frozen] of [["batch-012", B12_IDS], ["batch-013", B13_IDS], ["batch-014", B14_IDS], ["batch-015", B15_IDS], ["batch-016", B16_IDS]] as const) {
  const clash = ALL_IDS.filter((id) => frozen.includes(id));
  if (clash.length) throw new Error(`FATAL: batch-017 ids collide with ${label}: ${clash.join(", ")}`);
}

const BATCH011_ALL_IDS = [
  "596b875e-23d5-5458-95e6-1e60e9b0f2af", "2b7ae75d-18d3-53b8-99d7-7db09267c860",
  "53f276b4-549f-5f06-ad7d-fd7e20bf5e4e", "4da554ae-e148-5498-b3b7-3aa45f0835d1",
  "27c6e70b-673e-5c80-a3cf-4e8f530098d8", "74b454ed-cb0a-5cd9-9510-1ef251de5a8a",
  "9cbbed7e-b526-5167-ba53-30214cfe3c44", "550f0ee2-d898-5f44-9897-9fd72310d77f",
  "065ed977-26c1-5fa7-814a-b299f52672a1", "f0034b71-18fd-51cc-be00-b26dc17cec72",
  "7ca7b062-f601-55a9-832f-f3355aa8a80d", "632a8627-baca-5d32-ab42-cf7328af8da1",
  "23e44a85-1086-58df-8a58-928830569f04", "7f2c91c5-35c7-57d8-9d7a-833b033a4ef1",
  "544ffb45-63d2-582b-8272-155f032b4901", "7a69de5b-7744-5fa6-b972-f3a7ebb4f0fb",
];
const b11clash = ALL_IDS.filter((id) => BATCH011_ALL_IDS.includes(id));
if (b11clash.length) throw new Error(`FATAL: batch-017 ids collide with batch-011: ${b11clash.join(", ")}`);

/* generation-time restaurant NAME gate vs batches 012-016 (execution-time the
   preflight checks the whole DB, which is authoritative) */
const batchRestNorms = new Set<string>();
for (const sqlText of [b12SqlText, b13SqlText, b14SqlText, b15SqlText, b16SqlText]) {
  for (const m of sqlText.matchAll(/^    '((?:[^']|'')+)',$/gm)) {
    batchRestNorms.add(m[1].replace(/''/g, "'").toLowerCase());
  }
}
for (const r of restRows) {
  if (batchRestNorms.has(r.name.toLowerCase())) {
    throw new Error(`FATAL: restaurant name collides with a frozen batch row: ${r.name}`);
  }
}

const ptDist = placeRows.reduce<Record<string, number>>((a, r) => ((a[r.placeType] = (a[r.placeType] ?? 0) + 1), a), {});
const catDist = restRows.reduce<Record<string, number>>((a, r) => ((a[r.category] = (a[r.category] ?? 0) + 1), a), {});

/* ---------------- SQL ---------------- */

const restValues = restIds.map(({ r, id }) => `  (
    '${id}'::uuid,
    ${sq(r.name)},
    '${r.category}',
    ${sq(r.address)},     -- locality-level address EXACTLY as the listing title supports (no street invented)
    'Tirupati',
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
    '${slug}',
    '${r.placeType}',
    ${sq(r.name)},
    null,                    -- description: not captured — NEVER invented
    null,                    -- address: official/listing sources support locality only
    ${sq(r.locality)},
    'Tirupati',
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

const idList = ALL_IDS.map((id) => `'${id}'`).join(", ");

const SQL = `-- ===========================================================================
-- insert-batch-017-tptm-b7.sql — REVIEW CANDIDATE (NEVER executed by the repo)
-- Tirupati MASTER place discovery — Batch 017 (batch-7 eligibility review, ${new Date().toISOString().slice(0, 10)})
-- Generated by scripts/foodie-enrichment/gen-insert-batch-017.ts (deterministic).
-- ===========================================================================
--
-- SCOPE (${ALL_IDS.length} rows — the worksheet rows that verification progress made
--   batch-eligible AFTER batches 012-016 were frozen; individually reviewed):
--   * ${restRows.length} food venues -> public.restaurants [Tier T1: independent
--     verification search confirmed the area with address evidence]
--     (categories: ${Object.entries(catDist).map(([k, v]) => `${k} ${v}`).join(", ")})
--   * ${placeRows.length} places -> public.places
--     (place types: ${Object.entries(ptDist).map(([k, v]) => `${k} ${v}`).join(", ")})
--
-- GEOGRAPHY: Tirupati city neighbourhoods, Tirumala, Tiruchanoor,
-- Chandragiri, Renigunta corridor and the surrounding destinations
-- (Nagari, Kalyani Dam, Horsley Hills, Ubbalamadugu/Tada) are labelled
-- with their OWN localities — surrounding destinations are never folded
-- into the city, and carry the 'surrounding-destination' tag.
--
-- IDENTITY-HELD (6 — stay in the worksheet + duplicate review only):
--   * 'Ganapathi Juice Shop' + 'Ganesh Juice Center' (both Tilak Road) —
--     drift cluster vs the FROZEN batch-014 row 'Ganesh Juice Corner';
--   * 'Varasiddi Vinayaka Swamy Temple' — spelling drift vs the admitted
--     'Sri Vara Siddhi Vinayaka Ayyappa Swamy Temple';
--   * 'Vinayaka Temple' (Tirumala) — generic, identity unresolved;
--   * 'Tirumala Mandir' (Alipiri listing) — ambiguous vs the main temple;
--   * 'Lepakshi Handicrafts Emporium' — Tirumala + Tirupati branches, one
--     row would conflate two venues.
--
-- DROPS (22 — articles, topic pages, broken titles, area pages, one product
--   ad, one sub-listing, one out-of-scope locality, one duplicate alias:
--   'Tada Falls' = 'Ubbalamadugu Falls'). Full reasons in the batch-7
--   discovery worklog + curation log; counted NOWHERE.
--
-- HONESTY (identical to batches 009-016): deterministic uuid5 ids
-- ("foodie-tptm:Tirupati:<canonical name>"); verification_status 'unverified'
-- on every row; all four verification fields NULL; INSERT-only — no UPDATE,
-- no DELETE; preserves ALL existing rows and user content.
--
-- OWNER STEPS: review this file, then run inside the Supabase SQL editor
-- AFTER batches 011-016 in ascending order. Preflight guards abort unless
-- the database is in the reviewed state; any postflight violation rolls the
-- whole batch back. Rerun-safe (idempotent).
-- ===========================================================================

begin;

-- ---------------------------------------------------------------------------
-- PREFLIGHT: hard gates (any violation aborts before a single INSERT)
-- ---------------------------------------------------------------------------
do $pf017$
declare
  v_marker integer; v_dup_ids integer; v_dup_slugs integer; v_dup_names integer;
  v_dest_total integer; v_dest_active integer;
  v_b11 integer; v_b12 integer; v_b13 integer; v_b14 integer; v_b15 integer; v_b16 integer;
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

  select count(*) into v_dup_ids from public.places where id in (${idList});
  if v_dup_ids <> 0 then
    raise exception 'PREFLIGHT FAIL: % batch-017 place ids already exist — importing would collide.', v_dup_ids;
  end if;
  select count(*) into v_dup_ids from public.restaurants where id in (${idList});
  if v_dup_ids <> 0 then
    raise exception 'PREFLIGHT FAIL: % batch-017 ids already exist in restaurants — importing would collide.', v_dup_ids;
  end if;
  raise notice 'PREFLIGHT OK: no id collisions.';

  select count(*) into v_dup_slugs from public.places where slug in (${placeRows.map((p) => sq(placeSlugs.get(p.key)!)).join(", ")});
  if v_dup_slugs <> 0 then
    raise exception 'PREFLIGHT FAIL: % batch-017 slugs already exist — importing would collide.', v_dup_slugs;
  end if;
  raise notice 'PREFLIGHT OK: no slug collisions.';

  select count(*) into v_dup_names from public.restaurants
   where lower(btrim(name)) in (${restRows.map((r) => `lower(btrim(${sq(r.name)}))`).join(", ")});
  if v_dup_names <> 0 then
    raise exception 'PREFLIGHT FAIL: % batch-017 restaurant names already exist — importing would duplicate rows.', v_dup_names;
  end if;
  raise notice 'PREFLIGHT OK: no restaurant name collisions.';

  select count(*) into v_b11 from public.places where id in (${BATCH011_ALL_IDS.map((i) => `'${i}'`).join(", ")});
  if v_b11 not in (0, ${BATCH011_ALL_IDS.length}) then
    raise exception 'PREFLIGHT FAIL: Batch-011 rows PARTIALLY present (%) — owner review required before batch-017.', v_b11;
  end if;
  raise notice 'PREFLIGHT OK: Batch-011 state coherent (%/${BATCH011_ALL_IDS.length} present).', v_b11;

  select count(*) into v_b12 from public.places where id in (${B12_IDS.map((i) => `'${i}'`).join(", ")});
  v_b12 := v_b12 + (select count(*) from public.restaurants where id in (${B12_IDS.map((i) => `'${i}'`).join(", ")}));
  if v_b12 not in (0, ${B12_IDS.length}) then
    raise exception 'PREFLIGHT FAIL: Batch-012 rows PARTIALLY present (%) — owner review required before batch-017.', v_b12;
  end if;
  raise notice 'PREFLIGHT OK: Batch-012 state coherent (%/${B12_IDS.length} present).', v_b12;

  select count(*) into v_b13 from public.places where id in (${B13_IDS.map((i) => `'${i}'`).join(", ")});
  v_b13 := v_b13 + (select count(*) from public.restaurants where id in (${B13_IDS.map((i) => `'${i}'`).join(", ")}));
  if v_b13 not in (0, ${B13_IDS.length}) then
    raise exception 'PREFLIGHT FAIL: Batch-013 rows PARTIALLY present (%) — owner review required before batch-017.', v_b13;
  end if;
  raise notice 'PREFLIGHT OK: Batch-013 state coherent (%/${B13_IDS.length} present).', v_b13;

  select count(*) into v_b14 from public.places where id in (${B14_IDS.map((i) => `'${i}'`).join(", ")});
  v_b14 := v_b14 + (select count(*) from public.restaurants where id in (${B14_IDS.map((i) => `'${i}'`).join(", ")}));
  if v_b14 not in (0, ${B14_IDS.length}) then
    raise exception 'PREFLIGHT FAIL: Batch-014 rows PARTIALLY present (%) — owner review required before batch-017.', v_b14;
  end if;
  raise notice 'PREFLIGHT OK: Batch-014 state coherent (%/${B14_IDS.length} present).', v_b14;

  select count(*) into v_b15 from public.places where id in (${B15_IDS.map((i) => `'${i}'`).join(", ")});
  v_b15 := v_b15 + (select count(*) from public.restaurants where id in (${B15_IDS.map((i) => `'${i}'`).join(", ")}));
  if v_b15 not in (0, ${B15_IDS.length}) then
    raise exception 'PREFLIGHT FAIL: Batch-015 rows PARTIALLY present (%) — owner review required before batch-017.', v_b15;
  end if;
  raise notice 'PREFLIGHT OK: Batch-015 state coherent (%/${B15_IDS.length} present).', v_b15;

  select count(*) into v_b16 from public.places where id in (${B16_IDS.map((i) => `'${i}'`).join(", ")});
  v_b16 := v_b16 + (select count(*) from public.restaurants where id in (${B16_IDS.map((i) => `'${i}'`).join(", ")}));
  if v_b16 not in (0, ${B16_IDS.length}) then
    raise exception 'PREFLIGHT FAIL: Batch-016 rows PARTIALLY present (%) — owner review required before batch-017.', v_b16;
  end if;
  raise notice 'PREFLIGHT OK: Batch-016 state coherent (%/${B16_IDS.length} present).', v_b16;

  select count(*), count(*) filter (where is_active) into v_dest_total, v_dest_active
    from public.destinations where slug = 'tirupati';
  if v_dest_total <> 1 or v_dest_active <> 1 then
    raise exception 'PREFLIGHT FAIL: expected exactly ONE ACTIVE tirupati destination (total=% active=%).', v_dest_total, v_dest_active;
  end if;
  raise notice 'PREFLIGHT OK: exactly one active tirupati destination.';
end
$pf017$;

-- ---------------------------------------------------------------------------
-- Part 1 — INSERTS (${restRows.length} food-venue rows; fixed ids; full provenance)
-- ---------------------------------------------------------------------------
insert into public.restaurants
  (id, name, category, address, city, locality, latitude, longitude, rating, price_level, opening_hours, phone, tags, source, source_url, verification_status)
values
${restValues};

-- ---------------------------------------------------------------------------
-- Part 2 — INSERTS (${placeRows.length} place rows into public.places)
-- ---------------------------------------------------------------------------
do $ins017$
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
$ins017$;

-- ---------------------------------------------------------------------------
-- POSTFLIGHT: coherence (any violation rolls the whole batch back)
-- ---------------------------------------------------------------------------
do $post017$
declare
  v_rest integer; v_places integer; v_unver integer; v_coords integer;
  v_nolink integer; v_nosrc integer; v_type integer;
begin
  select count(*) into v_rest from public.restaurants where source = '${MARKER}';
  if v_rest <> ${restRows.length} then
    raise exception 'POSTFLIGHT FAIL: expected ${restRows.length} batch-017 restaurant rows, found %.', v_rest;
  end if;
  select count(*) into v_places from public.places where source = '${MARKER}';
  if v_places <> ${placeRows.length} then
    raise exception 'POSTFLIGHT FAIL: expected ${placeRows.length} batch-017 place rows, found %.', v_places;
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

  select count(*) into v_nosrc from public.restaurants where source = '${MARKER}' and (source_url is null or source_url = '');
  v_nosrc := v_nosrc + (select count(*) from public.places where source = '${MARKER}' and (source_url is null or source_url = ''));
  if v_nosrc <> 0 then
    raise exception 'POSTFLIGHT FAIL: % rows missing source_url.', v_nosrc;
  end if;
${Object.entries(ptDist).map(([k, v]) => `  select count(*) filter (where place_type = '${k}') into v_type from public.places where source = '${MARKER}';
  if v_type <> ${v} then
    raise exception 'POSTFLIGHT FAIL: place_type ${k} drifted (found %; expected ${v}).', v_type;
  end if;`).join("\n")}
  raise notice 'POSTFLIGHT OK: ${ALL_IDS.length} rows verified (${restRows.length} restaurants + ${placeRows.length} places).';
end
$post017$;

commit;
`;

const VERIFY_SQL = `-- ===========================================================================
-- verify-batch-017-tptm-b7.sql — READ-ONLY state probe (PRE/POST review aid)
-- ===========================================================================
select 'restaurants_b17' as what, count(*) as n from public.restaurants where source = '${MARKER}'
union all
select 'places_b17', count(*) from public.places where source = '${MARKER}'
union all
select 'unverified_b17', (select count(*) from public.restaurants where source = '${MARKER}' and verification_status = 'unverified')
        + (select count(*) from public.places where source = '${MARKER}' and verification_status = 'unverified')
union all
select 'coords_b17_should_be_zero', (select count(*) from public.restaurants where source = '${MARKER}' and latitude is not null)
        + (select count(*) from public.places where source = '${MARKER}' and latitude is not null)
union all
select 'batch012_present', count(*) from public.places where id in (${B12_IDS.map((i) => `'${i}'`).join(", ")})
union all
select 'batch013_present', count(*) from public.places where id in (${B13_IDS.map((i) => `'${i}'`).join(", ")})
union all
select 'batch014_present', count(*) from public.places where id in (${B14_IDS.map((i) => `'${i}'`).join(", ")})
union all
select 'batch015_present', (select count(*) from public.places where id in (${B15_IDS.map((i) => `'${i}'`).join(", ")}))
        + (select count(*) from public.restaurants where id in (${B15_IDS.map((i) => `'${i}'`).join(", ")}))
union all
select 'batch016_present', (select count(*) from public.places where id in (${B16_IDS.map((i) => `'${i}'`).join(", ")}))
        + (select count(*) from public.restaurants where id in (${B16_IDS.map((i) => `'${i}'`).join(", ")}));
`;

writeFileSync(join(OUT, "insert-batch-017-tptm-b7.sql"), SQL);
writeFileSync(join(OUT, "verify-batch-017-tptm-b7.sql"), VERIFY_SQL);

const sha = (p: string) => createHash("sha256").update(readFileSync(p)).digest("hex");
console.log("batch-017 review candidates written:");
console.log(`  insert-batch-017-tptm-b7.sql  sha256: ${sha(join(OUT, "insert-batch-017-tptm-b7.sql"))}`);
console.log(`  verify-batch-017-tptm-b7.sql  sha256: ${sha(join(OUT, "verify-batch-017-tptm-b7.sql"))}`);
console.log(`rows: ${restRows.length} restaurants (T1) + ${placeRows.length} places = ${ALL_IDS.length}`);
console.log(`place types: ${JSON.stringify(ptDist)} | restaurant categories: ${JSON.stringify(catDist)}`);
