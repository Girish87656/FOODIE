/**
 * Foodie — TIRUPATI MASTER place discovery (owner-directed 2026 audit).
 *
 * Broadest practical, source-backed candidate sweep across Tirupati city,
 * Tirumala and documented surrounding destinations. Evidence-first: every
 * recorded candidate carries the actual search hit (title/url/snippet/host)
 * it was extracted from, plus a per-candidate identity-verification query
 * and an area-gated Nominatim geocode. NO field is ever invented.
 *
 * Phases (all resumable, all read-only against external services):
 *   discovery <group>   — FIXED per-area query lists (z-ai web_search),
 *                         persisted per query into evidence/tirupati-master/
 *                         discovery-<group>.json
 *   verify    [slug]    — ONE identity query per candidate ("name" area address),
 *                         area-gated; writes verify-<slug>.json
 *   geocode   [slug]    — OSM Nominatim (keyless, 1 req/s, UA set),
 *                         area-gated; NULL when the match is not inside the area
 *   worksheet           — consolidate into worksheets/tirupati-master.json
 *
 * Honesty contract (identical to batches 005-011):
 *   * candidates carry evidence, never invented attributes
 *   * import NEVER self-verifies (verification_status stays 'unverified')
 *   * coordinates NULL unless Nominatim confirms the area token
 *   * unverified candidates stay discoverable in the inventory docs but are
 *     never represented as verified in any import
 *
 * Usage:
 *   bun scripts/foodie-enrichment/research-tirupati-master.ts discovery <group>
 *   bun scripts/foodie-enrichment/research-tirupati-master.ts verify   [slug] [--limit N] [--breaker N]
 *   bun scripts/foodie-enrichment/research-tirupati-master.ts geocode  [slug]
 *   bun scripts/foodie-enrichment/research-tirupati-master.ts worksheet
 *
 * verify resume semantics (batch-3 hardening):
 *   • a verify file WITHOUT skipped:true is a COMPLETED record — never
 *     overwritten, never re-queried (unless --redo);
 *   • a verify file WITH skipped:true (rate-limited / infra-error stub)
 *     IS re-attempted on the next run — a throttled attempt is never
 *     treated as verification;
 *   • --limit N caps candidates attempted per invocation (small chunks);
 *   • per candidate: at most 1 + |backoffs| attempts with escalating
 *     back-off, honouring a Retry-After hint when the error carries one;
 *   • circuit breaker: after N (default 5) CONSECUTIVE rate-limited
 *     outcomes the run stops — the source is paused, not spun against.
 */

import { mkdirSync, writeFileSync, existsSync, readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { politeFetch, RESEARCH_UA, slugify } from "./lib/live";

const HERE = dirname(fileURLToPath(import.meta.url)); // cwd-independent — script dir, NOT process.cwd()
const EV = join(HERE, "evidence", "tirupati-master");
const WS = join(HERE, "worksheets");
mkdirSync(EV, { recursive: true });
mkdirSync(WS, { recursive: true });
const RETRIEVED = new Date().toISOString().slice(0, 10);

const phase = (process.argv[2] ?? "").toLowerCase();
const arg3 = process.argv[3] ?? null;
/** positional arg3 is a group/slug ONLY when it is not a --flag
 *  (e.g. `verify --limit 4` must not treat "--limit" as a slug filter). */
const positional3 = arg3 && !arg3.startsWith("--") ? arg3 : null;
/** --redo: re-run verify/geocode even when an evidence file already exists.
 *  DEFAULT (batch-3+): a candidate with ANY existing evidence file is SKIPPED —
 *  previously the daily-refresh semantic re-ran every past-session file on each
 *  new day, which burned the rate-limited budget before new candidates.
 *  The pipeline stays resumable either way. */
const REDO = process.argv.includes("--redo");

/** Read a positive-int `--flag N` from argv (null when absent/invalid). */
function intFlag(name: string): number | null {
  const i = process.argv.indexOf(name);
  if (i === -1 || i + 1 >= process.argv.length) return null;
  const v = Number(process.argv[i + 1]);
  return Number.isFinite(v) && v > 0 ? Math.floor(v) : null;
}

/** Best-effort Retry-After extraction from an error message (seconds). */
function retryAfterSeconds(msg: string): number | null {
  const m = /retry[- ]?after(?:['"]?\s*[:=]\s*|\s+)(\d{1,4})/i.exec(msg);
  return m ? Number(m[1]) : null;
}

if (!["discovery", "verify", "geocode", "worksheet"].includes(phase)) {
  console.error("usage: research-tirupati-master.ts <discovery|verify|geocode|worksheet> [group|slug]");
  process.exit(2);
}

/* ------------------------------------------------------------------ */
/* Areas — honest locality grouping                                    */
/* ------------------------------------------------------------------ */

interface Area {
  key: string;
  /** db `city` value (destination anchor) */
  city: string;
  /** db `locality` value — the honest sub-area label */
  locality: string;
  /** candidate identity MUST match this in title/snippet (area gate) */
  areaTokens: RegExp;
  /** extra tag applied to every candidate from this area */
  areaTag?: string;
  /** which discovery groups run for this area */
  groups: string[];
}

const AREAS: Area[] = [
  {
    key: "tpt-central",
    city: "Tirupati",
    locality: "Tirupati city centre",
    areaTokens: /\btirupati\b/i,
    groups: ["food-restaurants", "food-tiffin", "food-street", "food-bakery", "food-cafe", "temples", "attractions", "stays", "markets"],
  },
  {
    key: "tpt-neighbourhoods",
    city: "Tirupati",
    locality: "Tirupati residential neighbourhoods",
    areaTokens: /\btirupati\b/i,
    groups: ["food-restaurants", "food-tiffin", "food-street", "food-bakery", "food-cafe", "temples", "attractions", "stays", "markets"],
  },
  {
    key: "tirumala",
    city: "Tirupati",
    locality: "Tirumala hills",
    areaTokens: /\btirumala\b/i,
    areaTag: "tirumala",
    groups: ["food-restaurants", "food-tiffin", "food-street", "food-bakery", "food-cafe", "temples", "attractions", "stays", "markets"],
  },
  {
    key: "tiruchanur",
    city: "Tirupati",
    locality: "Tiruchanur (Alamelu Mangapuram corridor)",
    areaTokens: /\btiruchan(oo|u)r\b|alamelu\s*manga/i,
    areaTag: "surrounding-corridor",
    groups: ["food-restaurants", "food-tiffin", "food-street", "food-bakery", "food-cafe", "temples", "attractions", "stays", "markets"],
  },
  {
    key: "srinivasa-mangapuram",
    city: "Tirupati",
    locality: "Srinivasa Mangapuram (about 10 km west of Tirupati city, per district page)",
    areaTokens: /srinivasa\s*manga/i,
    areaTag: "surrounding-corridor",
    groups: ["food-restaurants", "food-tiffin", "food-street", "food-bakery", "food-cafe", "temples", "attractions", "stays", "markets"],
  },
  {
    key: "chandragiri",
    city: "Tirupati",
    locality: "Chandragiri (about 12-14 km south-west of Tirupati city)",
    areaTokens: /chandragiri/i,
    areaTag: "surrounding-corridor",
    groups: ["food-restaurants", "food-tiffin", "food-street", "food-bakery", "food-cafe", "temples", "attractions", "stays", "markets"],
  },
  {
    key: "renigunta",
    city: "Tirupati",
    locality: "Renigunta (airport / railway junction corridor, about 10-12 km north)",
    areaTokens: /renigunta/i,
    areaTag: "surrounding-corridor",
    groups: ["food-restaurants", "food-tiffin", "food-street", "food-bakery", "food-cafe", "temples", "attractions", "stays", "markets"],
  },
  {
    key: "surrounding",
    city: "Tirupati",
    locality: "Surrounding destinations (beyond the city/Tirumala core — clearly-labelled group)",
    areaTokens: /\btirupati\b|\bchittoor\b/i,
    areaTag: "surrounding",
    groups: ["food-restaurants", "food-tiffin", "food-street", "food-bakery", "food-cafe", "temples", "attractions", "stays", "markets"],
  },
];

/* ------------------------------------------------------------------ */
/* Groups — per-group host policies + category hints                   */
/* ------------------------------------------------------------------ */

const FOOD_HOSTS: Array<{ test: RegExp; kind: string }> = [
  { test: /(^|\.)justdial\.com$/i, kind: "justdial" },
  { test: /(^|\.)zomato\.com$/i, kind: "zomato" },
  { test: /(^|\.)magicpin\.in$/i, kind: "magicpin" },
  { test: /(^|\.)district\.in$/i, kind: "district" },
  { test: /(^|\.)swiggy\.com$/i, kind: "swiggy" },
  { test: /(^|\.)tripadvisor\.com$/i, kind: "tripadvisor" },
  { test: /(^|\.)wanderlog\.com$/i, kind: "wanderlog" },
  { test: /(^|\.)slurrp\.com$/i, kind: "slurrp" },
  { test: /(^|\.)eazydiner\.com$/i, kind: "eazydiner" },
  { test: /(^|\.)facebook\.com$/i, kind: "facebook-page" },
  { test: /(^|\.)tirumala\.org$/i, kind: "official" },
];

const STAY_HOSTS: Array<{ test: RegExp; kind: string }> = [
  { test: /(^|\.)oyorooms\.com$/i, kind: "oyo" },
  { test: /(^|\.)makemytrip\.com$/i, kind: "makemytrip" },
  { test: /(^|\.)goibibo\.com$/i, kind: "goibibo" },
  { test: /(^|\.)booking\.com$/i, kind: "booking" },
  { test: /(^|\.)agoda\.com$/i, kind: "agoda" },
  { test: /(^|\.)fabhotels\.com$/i, kind: "fabhotels" },
  { test: /(^|\.)treebo\.com$/i, kind: "treebo" },
  { test: /(^|\.)yatra\.com$/i, kind: "yatra" },
  { test: /(^|\.)cleartrip\.com$/i, kind: "cleartrip" },
  { test: /(^|\.)tripadvisor\.com$/i, kind: "tripadvisor" },
  { test: /(^|\.)tirumala\.org$/i, kind: "official" },
  { test: /(^|\.)ihg\.com$/i, kind: "official" },
  { test: /(^|\.)tajhotels\.com$/i, kind: "official" },
  { test: /(^|\.)clubmahindra\.com$/i, kind: "official" },
  { test: /(^|\.)sarovarhotels\.com$/i, kind: "official" },
  { test: /(^|\.)itchotels\.com$/i, kind: "official" },
  { test: /(^|\.)minervagrand\.com$/i, kind: "official" },
  { test: /(^|\.)hotelminerva\.co\.in$/i, kind: "official" },
  { test: /(^|\.)yatradham\.org$/i, kind: "official" },
];

/** POI groups accept official/encyclopaedic/review hosts; blogs are dropped. */
const POI_HOSTS: Array<{ test: RegExp; kind: string }> = [
  { test: /(^|\.)tirumala\.org$/i, kind: "official" },
  { test: /(^|\.)(gov\.in|nic\.in)$/i, kind: "official" },
  { test: /(^|\.)incredibleindia\.gov\.in$/i, kind: "official" },
  { test: /(^|\.)aptourism\.gov\.in$/i, kind: "official" },
  { test: /(^|\.)wikipedia\.org$/i, kind: "wikipedia" },
  { test: /(^|\.)tripadvisor\.com$/i, kind: "tripadvisor" },
  { test: /(^|\.)holidify\.com$/i, kind: "holidify" },
  { test: /(^|\.)makemytrip\.com$/i, kind: "makemytrip" },
  { test: /(^|\.)goibibo\.com$/i, kind: "goibibo" },
  { test: /(^|\.)justdial\.com$/i, kind: "justdial" },
];

interface Group {
  key: string;
  /** db target: restaurants table or places (POI) table */
  target: "restaurant" | "place";
  hosts: Array<{ test: RegExp; kind: string }>;
  /** per-area discovery queries (area key -> queries) */
  queries: Record<string, string[]>;
  hints: Array<{ test: RegExp; category: string; tag?: string; placeType?: string }>;
  defaultCategory: string;
  defaultPlaceType?: string;
}

const GROUPS: Record<string, Group> = {
  "food-restaurants": {
    key: "food-restaurants",
    target: "restaurant",
    hosts: FOOD_HOSTS,
    queries: {
      "tpt-central": [
        "famous restaurants Tirupati bazaar justdial",
        "pure veg restaurants Tirupati Tilak Road",
        "biryani restaurants Tirupati Gandhi Road",
        "family restaurant Tirupati JC Road zomato",
        "andhra meals restaurant Tirupati justdial",
        "non veg restaurant Tirupati zomato",
        "banquet restaurant Tirupati Tiruchanoor Road",
      ],
      "tpt-neighbourhoods": [
        "restaurants Korlagunta Tirupati",
        "restaurants Bhavani Nagar Tirupati justdial",
        "restaurants MR Pally Tirupati",
        "restaurants AIR Bypass Road Tirupati",
        "restaurants Cherlopalli Tirupati",
        "restaurants Avilala Tirupati",
      ],
      "tirumala": [
        "restaurants in Tirumala justdial",
        "vegetarian restaurants Tirumala zomato",
      ],
      "tiruchanur": ["restaurants Tiruchanoor Tirupati", "restaurants near Tiruchanoor temple Tirupati justdial"],
      "srinivasa-mangapuram": ["restaurants Srinivasa Mangapuram Tirupati", "hotels restaurants near Srinivasa Mangapuram temple"],
      "chandragiri": ["restaurants Chandragiri Tirupati", "dhaba restaurants near Chandragiri Tirupati"],
      "renigunta": ["restaurants Renigunta Tirupati justdial", "restaurants near Renigunta railway station"],
      "surrounding": ["restaurants Srikalahasti justdial", "restaurants Nagalapuram Tirupati district", "restaurants Nagari Tirupati district justdial", "restaurants Karvetinagaram Tirupati district"],
    },
    hints: [
      { test: /biryani/i, category: "restaurant", tag: "biryani" },
      { test: /veg|thalai|thali|meals?/i, category: "restaurant", tag: "vegetarian" },
      { test: /grill|arabian|chicken|fish|non[- ]veg/i, category: "restaurant", tag: "non-vegetarian" },
      { test: /restaurant|hotels?|food court|kitchen/i, category: "restaurant" },
    ],
    defaultCategory: "restaurant",
  },
  "food-tiffin": {
    key: "food-tiffin",
    target: "restaurant",
    hosts: FOOD_HOSTS,
    queries: {
      "tpt-central": [
        "tiffin centres Tirupati justdial",
        "idli dosa Tirupati breakfast famous",
        "puri upma Tirupati tiffin hotel",
        "breakfast Tirupati Tilak Road tiffin",
        "mess lunch Tirupati justdial",
        "mini tiffin Tirupati famous",
        "ghee dosa Tirupati famous stall",
        "pongal Tirupati breakfast stall justdial",
      ],
      "tpt-neighbourhoods": [
        "tiffin centre Korlagunta Tirupati",
        "tiffin centres Bhavani Nagar Tirupati",
        "breakfast Satyanarayanapuram Tirupati",
        "tiffin centres Avilala Tirupati justdial",
        "tiffin centres Cherlopalli Tirupati",
      ],
      "tirumala": ["breakfast tiffin Tirumala", "dosa idli canteen Tirumala justdial"],
      "tiruchanur": ["tiffin Tiruchanoor", "breakfast tiffin Tiruchanoor Tirupati justdial"],
      "srinivasa-mangapuram": ["tiffin centre Srinivasa Mangapuram Tirupati", "breakfast tiffin Srinivasa Mangapuram Tirupati"],
      "chandragiri": ["tiffin centre Chandragiri", "idli dosa tiffin Chandragiri Tirupati"],
      "renigunta": ["tiffin centre Renigunta", "tiffin stalls Renigunta justdial"],
      "surrounding": ["tiffin centres Srikalahasti", "tiffin centres Nagari", "tiffin centres Nagalapuram"],
    },
    hints: [
      { test: /tiffin|breakfast|idli|dosa|vada|puri|upma|pongal/i, category: "tiffin" },
      { test: /mess|meals?/i, category: "tiffin", tag: "mess" },
    ],
    defaultCategory: "tiffin",
  },
  "food-street": {
    key: "food-street",
    target: "restaurant",
    hosts: FOOD_HOSTS,
    queries: {
      "tpt-central": [
        "street food Tirupati famous justdial",
        "chaat centre Tirupati",
        "tea stalls Tirupati famous",
        "juice shop Tirupati justdial",
        "pani puri Tirupati",
        "mirchi bajji stalls Tirupati",
        "bhaji stalls Tirupati justdial",
        "sugarcane juice Tirupati justdial",
      ],
      "tpt-neighbourhoods": ["street food Korlagunta Tirupati", "tea shop Bhavani Nagar Tirupati", "tea stalls Korlagunta Tirupati justdial", "juice centre Avilala Tirupati"],
      "tirumala": ["street food Tirumala stalls", "tea coffee stalls Tirumala justdial"],
      "tiruchanur": ["tea stalls Tiruchanoor Tirupati", "food stalls Tiruchanoor Tirupati justdial"],
      "srinivasa-mangapuram": ["tea stalls Srinivasa Mangapuram"],
      "chandragiri": ["street food tea stalls Chandragiri Tirupati", "tea stalls near Chandragiri fort"],
      "renigunta": ["street food tea stalls Renigunta", "tea stalls Renigunta junction Tirupati"],
      "surrounding": ["street food Srikalahasti", "bajji stalls Srikalahasti"],
    },
    hints: [
      { test: /chaat|pani puri|street/i, category: "street_food" },
      { test: /tea|chai/i, category: "street_food", tag: "tea_stall" },
      { test: /juice|shakes?/i, category: "street_food", tag: "juice_shop" },
    ],
    defaultCategory: "street_food",
  },
  "food-bakery": {
    key: "food-bakery",
    target: "restaurant",
    hosts: FOOD_HOSTS,
    queries: {
      "tpt-central": [
        "bakeries Tirupati justdial",
        "sweet shops Tirupati famous",
        "ice cream Tirupati justdial",
        "cakes Tirupati bakery justdial",
        "mithai Tirupati sweets",
        "pastries cakes Tirupati justdial",
        "prasadam laddu counters Tirupati justdial",
        "sweet stalls Tirupati bazaar",
      ],
      "tpt-neighbourhoods": ["bakery Korlagunta Tirupati", "sweets Bhavani Nagar Tirupati", "bakeries Avilala Tirupati justdial", "sweet shops MR Palli Tirupati"],
      "tirumala": ["sweets laddu Tirumala prasadam counters", "sweets snacks shops Tirumala justdial", "prasadam counters Tirumala justdial"],
      "tiruchanur": ["sweets bakeries Tiruchanoor Tirupati", "prasadam sweet shops Tiruchanoor"],
      "srinivasa-mangapuram": ["bakery sweets Srinivasa Mangapuram"],
      "chandragiri": ["bakery sweets Chandragiri Tirupati", "sweets shops Chandragiri justdial"],
      "renigunta": ["bakery sweets Renigunta", "sweet stalls Renigunta justdial"],
      "surrounding": ["sweets bakeries Srikalahasti", "sweet shops Srikalahasti justdial"],
    },
    hints: [
      { test: /bakery|cakes?/i, category: "bakery_sweets", tag: "bakery" },
      { test: /sweet|mithai|prasadam/i, category: "bakery_sweets", tag: "sweets" },
      { test: /ice cream/i, category: "bakery_sweets", tag: "ice_cream" },
    ],
    defaultCategory: "bakery_sweets",
  },
  "food-cafe": {
    key: "food-cafe",
    target: "restaurant",
    hosts: FOOD_HOSTS,
    queries: {
      "tpt-central": ["cafes Tirupati zomato", "coffee shop Tirupati", "cafe Tirupati Tilak Road justdial", "chai tea cafe Tirupati zomato"],
      "tpt-neighbourhoods": ["cafe Korlagunta Tirupati"],
      "tirumala": ["cafe coffee Tirumala", "milk tea stall Tirumala"],
      "tiruchanur": ["cafe Tiruchanoor Tirupati"],
      "srinivasa-mangapuram": ["cafe Srinivasa Mangapuram"],
      "chandragiri": ["cafe Chandragiri Tirupati"],
      "renigunta": ["cafe Renigunta", "coffee shop Renigunta airport Tirupati"],
      "surrounding": ["cafes Srikalahasti", "cafe Srikalahasti justdial"],
    },
    hints: [{ test: /caf[eé]|coffee/i, category: "cafe" }],
    defaultCategory: "cafe",
  },
  "temples": {
    key: "temples",
    target: "place",
    hosts: POI_HOSTS,
    queries: {
      "tpt-central": [
        "famous temples in Tirupati city tirumala.org",
        "Sri Govindaraja Swamy Temple Tirupati",
        "Sri Kapila Theertham temple Tirupati",
        "Sri Padmavathi Ammavari Temple Tiruchanoor",
        "ISKCON Tirupati temple",
        "churches in Tirupati city",
        "mosques in Tirupati city",
        "Sri Kalyana Venkateswara Swamy Temple Srinivasa Mangapuram",
        "Tiruchanoor Padmavathi temple timings official",
        "old temples Tirupati bazaar area",
        "Sri Anjaneya Swamy temples Tirupati city justdial",
        "Vinayaka temple Tirupati city justdial",
        "Shiva temples Tirupati city justdial",
        "Sri Lakshmi Narasimha Swamy temple Tirupati",
      ],
      "tpt-neighbourhoods": [
        "temples Korlagunta Tirupati",
        "temples Bhavani Nagar Tirupati",
        "Sri Venkateswara temple Avilala Tirupati",
        "vinayaka temples Tirupati neighbourhoods",
        "temples Avilala Tirupati justdial",
        "temples Cherlopalli Tirupati",
        "Anjaneya Swamy temple Korlagunta Tirupati",
      ],
      "tirumala": [
        "temples in Tirumala tirumala.org",
        "Sri Bhu Varaha Swamy temple Tirumala",
        "Sri Bedi Anjaneya Swamy temple Tirumala",
        "Sri Varahaswamy temple Tirumala",
        "Teerthams Tirumala holy water places",
        "Silathoranam natural arch Tirumala",
        "sub shrines Tirumala temple complex tirumala.org",
        "village shrines around Tirumala hills",
      ],
      "tiruchanur": ["Sri Padmavathi Ammavari temple Tiruchanur official", "temples near Tiruchanoor Padmavathi temple", "Alamelu Mangapuram village temples"],
      "srinivasa-mangapuram": ["Sri Kalyana Venkateswara Swamy temple Srinivasa Mangapuram official", "temples near Srinivasa Mangapuram Tirupati"],
      "chandragiri": ["temples near Chandragiri fort", "Chandragiri Venkateswara temple", "old temples Chandragiri Tirupati district"],
      "renigunta": ["temples Renigunta Tirupati", "village temples Renigunta Tirupati justdial"],
      "surrounding": [
        "temples in Srikalahasti tirumala.org",
        "TTD temples Tirupati region Nagalapuram Narayanavanam",
        "temples Karvetinagaram Tirupati district",
        "temples Nagari Tirupati district justdial",
        "Sri Padmavathi temple Narayanavanam official",
      ],
    },
    hints: [
      { test: /temple|swamy|alvar|alwar|koil|devasthanam/i, category: "temple", placeType: "temple" },
      { test: /church/i, category: "church", placeType: "other", tag: "church" },
      { test: /mosque|masjid|darga|dargah/i, category: "mosque", placeType: "other", tag: "mosque" },
      { test: /ashram|mutt|math/i, category: "ashram", placeType: "other", tag: "ashram" },
      { test: /teertham|theertham/i, category: "sacred_water", placeType: "other", tag: "teertham" },
    ],
    defaultCategory: "temple",
    defaultPlaceType: "temple",
  },
  "attractions": {
    key: "attractions",
    target: "place",
    hosts: POI_HOSTS,
    queries: {
      "tpt-central": [
        "tourist places in Tirupati city",
        "museums in Tirupati",
        "parks in Tirupati city",
        "Sri Venkateswara Zoological Park Tirupati",
        "Regional Science Centre Tirupati",
        "Sri Venkateswara National Park Tirupati",
        "Deer park Tirupati",
        "auditoriums Tirupati city justdial",
        "cultural centres Tirupati city",
        "municipal parks gardens Tirupati city",
        "art gallery Tirupati city",
      ],
      "tpt-neighbourhoods": ["parks playgrounds Korlagunta Tirupati", "tourist places Bhavani Nagar Tirupati", "mini parks Tirupati neighbourhoods justdial", "children playgrounds Tirupati justdial"],
      "tirumala": ["places to visit in Tirumala tirumala.org", "Papasanam Teertham Tirumala", "Akasha Ganga Teertham Tirumala", "Gogarbham Dam Tirumala", "viewpoints Tirumala ghat road"],
      "tiruchanur": ["places to visit Tiruchanoor Tirupati", "Padma Sarovaram Tiruchanoor"],
      "srinivasa-mangapuram": ["places to visit Srinivasa Mangapuram Tirupati"],
      "chandragiri": ["Chandragiri Fort Raja Mahal official", "things to do Chandragiri Tirupati", "sound light show Chandragiri fort", "Chandragiri fort museum Raja Mahal inside"],
      "renigunta": ["places to visit Renigunta Tirupati", "places around Renigunta Tirupati justdial"],
      "surrounding": [
        "Talakona waterfall official andhra tourism",
        "Nagalapuram trekking waterfall",
        "Srikalahasti temple official",
        "Kalyani dam Tirupati district",
        "Horsley Hills near Tirupati",
        "Sila Thoranam Tirumala",
        "waterfalls near Tirupati district",
        "viewpoints Tirumala hills",
        "Ubbalamadugu falls Tada Tirupati district",
        "Nagalapuram fort ruins",
        "trekking Sri Venkateswara National Park",
      ],
    },
    hints: [
      { test: /waterfall/i, category: "waterfall", placeType: "waterfall" },
      { test: /fort|mahal|palace/i, category: "fort", placeType: "fort" },
      { test: /zoo|zoological/i, category: "zoo", placeType: "zoo" },
      { test: /natural arch|sila?thoranam/i, category: "natural_arch", placeType: "natural_arch" },
      { test: /museum|science centre/i, category: "museum", placeType: "other", tag: "museum" },
      { test: /park|garden|dam|lake|reservoir|viewpoint|trek|national park|hill/i, category: "park", placeType: "other", tag: "nature" },
    ],
    defaultCategory: "attraction",
    defaultPlaceType: "other",
  },
  "stays": {
    key: "stays",
    target: "place",
    hosts: STAY_HOSTS,
    queries: {
      "tpt-central": [
        "hotels near Tirupati railway station makemytrip",
        "lodges Tirupati bazaar justdial",
        "budget hotels Tirupati goibibo",
        "guest houses Tirupati justdial",
        "TTD accommodation Tirupati tirumala.org",
        "ap tourism haritha hotel Tirupati",
        "hotels near Tirupati bus stand justdial",
        "lodges near Alipiri Tirupati",
        "hotels Tirupati Tilak Road justdial",
      ],
      "tpt-neighbourhoods": ["hotels Korlagunta Tirupati", "lodges Bhavani Nagar Tirupati", "lodges Korlagunta Tirupati", "hotels Avilala Tirupati justdial"],
      "tirumala": [
        "TTD choultries Tirumala accommodation tirumala.org",
        "hotels in Tirumala booking",
        "lodges Tirumala justdial",
        "TTD free accommodation Tirumala tirumala.org",
        "private lodges Tirumala booking justdial",
      ],
      "tiruchanur": ["lodges Tiruchanoor Tirupati", "guest houses Tiruchanoor Tirupati"],
      "srinivasa-mangapuram": ["accommodation Srinivasa Mangapuram", "lodges near Srinivasa Mangapuram Tirupati"],
      "chandragiri": ["hotels Chandragiri Tirupati", "guest houses Chandragiri Tirupati"],
      "renigunta": ["hotels near Renigunta airport", "lodges Renigunta justdial", "hotels near Tirupati airport Renigunta justdial"],
      "surrounding": ["hotels Srikalahasti justdial", "haritha hotel Srikalahasti", "lodges near Srikalahasti temple"],
    },
    hints: [
      { test: /resort/i, category: "hotel", tag: "resort" },
      { test: /lodge/i, category: "hotel", tag: "lodge" },
      { test: /choultry|satram|dharamshala|pilgrim/i, category: "hotel", tag: "pilgrim_accommodation" },
      { test: /hostel/i, category: "hotel", tag: "hostel" },
      { test: /homestay/i, category: "hotel", tag: "homestay" },
      { test: /guest ?house|haritha/i, category: "hotel", tag: "guesthouse" },
      { test: /hotel|inn|suites|residency|palace|grand/i, category: "hotel" },
    ],
    defaultCategory: "hotel",
    defaultPlaceType: "hotel",
  },
  "markets": {
    key: "markets",
    target: "place",
    hosts: POI_HOSTS,
    queries: {
      "tpt-central": [
        "markets in Tirupati city",
        "Tirupati bazaar shopping street",
        "handicrafts Tirupati Papanasam? emporium",
        "shopping malls Tirupati justdial",
        "vegetable market Tirupati",
        "vegetable markets Tirupati city justdial",
        "textile shops Tirupati justdial",
        "jewellery shops Tirupati bazaar justdial",
        "Gandhi Road shopping Tirupati",
      ],
      "tpt-neighbourhoods": ["markets supermarkets Korlagunta Tirupati", "shopping Bhavani Nagar Tirupati justdial", "supermarkets Korlagunta Tirupati", "provision stores Tirupati justdial"],
      "tirumala": ["shopping markets Tirumala justdial", "souvenir shopping Tirumala justdial"],
      "tiruchanur": ["shops markets Tiruchanoor Tirupati", "shops near Tiruchanoor temple"],
      "srinivasa-mangapuram": ["shops markets Srinivasa Mangapuram"],
      "chandragiri": ["shops markets Chandragiri Tirupati", "handicraft shops Chandragiri fort"],
      "renigunta": ["shops markets Renigunta"],
      "surrounding": ["markets shopping Srikalahasti", "shopping Srikalahasti justdial"],
    },
    hints: [
      { test: /market|bazaar|mandi/i, category: "market", placeType: "other", tag: "market" },
      { test: /mall|shopping/i, category: "shopping_centre", placeType: "other", tag: "shopping" },
      { test: /handicraft|emporium|craft/i, category: "craft", placeType: "other", tag: "handicraft" },
    ],
    defaultCategory: "market",
    defaultPlaceType: "other",
  },
};

/* ------------------------------------------------------------------ */
/* Extraction                                                          */
/* ------------------------------------------------------------------ */

const AGGREGATOR_URL_HINT = /(top-|best-|list|near-me|-in-|\/collection\/|\/list\/)/i;

interface Hit {
  url: string;
  name: string | null;
  snippet: string | null;
  host: string;
  kind: string | null;
}

interface Candidate {
  area: string;
  group: string;
  name: string;
  target: "restaurant" | "place";
  category: string;
  placeType: string | null;
  tags: string[];
  sourceUrl: string;
  sourceKind: string;
  verification: {
    queried: boolean;
    areaConfirmed: boolean;
    addressEvidence: string | null;
    hits: Hit[];
    errors: string[];
    retrievedOn: string | null;
  };
  geocode: {
    queried: boolean;
    lat: number | null;
    lng: number | null;
    displayName: string | null;
    osmType: string | null;
    areaConfirmed: boolean;
    note: string | null;
    retrievedOn: string | null;
  };
  review: "needs_human_review" | "approved";
  reviewNotes: string[];
  /** true when the verify attempt was recorded as a skipped stub
   *  (rate-limited / infra error) — the candidate is PENDING, never
   *  verified and never area-denied. */
  verificationThrottled?: boolean;
}

function hostOf(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    return "?";
  }
}

function classifyHit(hosts: Array<{ test: RegExp; kind: string }>, url: string): string | null {
  const host = hostOf(url);
  const found = hosts.find((l) => l.test.test(host));
  return found ? found.kind : null;
}

/** Extract a place name from a result title, stripping site suffixes. */
function extractName(title: string): string | null {
  let t = title.trim();
  if (!t) return null;
  t = t.replace(/\s*[|·—\-–]\s*(justdial|zomato|magicpin|district|swiggy|oyo|makemytrip|make my trip|goibibo|booking\.com|agoda|fabhotels|treebo|easemytrip|yatra|cleartrip|tripadvisor|holidify|wanderlog|slurrp|eazydiner).*$/i, "");
  t = t.replace(/\s*[|·]\s*.{0,45}$/, "");
  t = t.replace(/\s*-\s*(Wikipedia|the free encyclopedia).*$/i, "");
  t = t.replace(/\s*\((?:[^)]{0,40})\)\s*$/, " ");
  t = t.replace(/\s{2,}/g, " ").trim();
  if (t.length < 4 || t.length > 90) return null;
  if (/\b(THE\s+)?\d*\s*BEST\b|\bTOP\s+\d+\b|CLOSEST|CHECKOUT\b|FIND AND COMPARE|PRICES?\b/i.test(t)) return null;
  if (/^(top|best|list of|book |search |highly rated|iconic|aesthetic|things to do|places to visit|a guide)/i.test(t)) return null;
  if (/^(hotels?|lodges?|restaurants?|cafes?|bakeries?|temples?|places?|attractions?)\b.*\b(in|near|at|from|to|around)\b/i.test(t)) return null;
  if (/near me|nearby|page \d+|travel guide|route guide|timings?|history|wikipedia$|reviews \(/i.test(t)) return null;
  if (/^(home|about us|contact|gallery|official website|welcome to)/i.test(t)) return null;
  return t;
}

function categorize(group: Group, name: string): { category: string; placeType: string | null; tags: string[] } {
  for (const hint of group.hints) {
    if (hint.test.test(name)) return { category: hint.category, placeType: hint.placeType ?? group.defaultPlaceType ?? null, tags: hint.tag ? [hint.tag] : [] };
  }
  return { category: group.defaultCategory, placeType: group.defaultPlaceType ?? null, tags: [] };
}

/* ------------------------------------------------------------------ */
/* web_search (z-ai) with pacing                                       */
/* ------------------------------------------------------------------ */

async function webSearch(query: string, num: number): Promise<Hit[]> {
  const { default: ZAI } = await import("z-ai-web-dev-sdk");
  const zai = await ZAI.create();
  const results = (await zai.functions.invoke("web_search", { query, num })) as Array<{
    url?: string;
    name?: string;
    snippet?: string;
  }>;
  return (results ?? [])
    .filter((r) => r.url)
    .map((r) => ({
      url: r.url as string,
      name: r.name ?? null,
      snippet: r.snippet ?? null,
      host: hostOf(r.url as string),
      kind: null,
    }));
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/* ------------------------------------------------------------------ */
/* Phase 1: discovery (per group — parallel-safe evidence files)       */
/* ------------------------------------------------------------------ */

type DiscoveryEntry = { query: string; hits: Hit[]; retrievedOn: string; error?: string };

async function runDiscovery(groupKey: string): Promise<void> {
  const group = GROUPS[groupKey];
  if (!group) {
    console.error(`unknown group "${groupKey}" — valid: ${Object.keys(GROUPS).join(", ")}`);
    process.exit(2);
  }
  const file = join(EV, `discovery-${groupKey}.json`);
  const all: Record<string, DiscoveryEntry[]> = existsSync(file)
    ? (JSON.parse(readFileSync(file, "utf8")).areas as typeof all)
    : {};
  for (const area of AREAS) {
    if (!area.groups.includes(groupKey)) continue;
    const queries = group.queries[area.key] ?? [];
    all[area.key] = all[area.key] ?? [];
    for (const query of queries) {
      if (all[area.key].some((e) => e.query === query)) continue;
      console.log(`[discovery/${groupKey}] ${area.key}: "${query}"`);
      let hits: Hit[] = [];
      let err: string | null = null;
      try {
        hits = await webSearch(query, 10);
      } catch (e) {
        err = (e as Error).message;
        if (/429|rate/i.test(err)) {
          console.log("[discovery] 429 — backing off 45s");
          await sleep(45_000);
          try {
            hits = await webSearch(query, 10);
            err = null;
          } catch (e2) {
            err = `retry failed: ${(e2 as Error).message}`;
          }
        } else if (/No search results/i.test(err)) {
          hits = [];
          err = "no-results";
        }
      }
      // classify AFTER fetch with the group's host policy
      hits = hits.map((h) => ({ ...h, kind: classifyHit(group.hosts, h.url) }));
      all[area.key].push(err ? { query, hits, retrievedOn: RETRIEVED, error: err } : { query, hits, retrievedOn: RETRIEVED });
      console.log(`  → ${hits.length} hits (${hits.filter((h) => h.kind).length} from allowed hosts)`);
      writeFileSync(file, JSON.stringify({ retrievedOn: RETRIEVED, group: groupKey, areas: all }, null, 2));
      await sleep(3500);
    }
  }
  console.log(`[discovery/${groupKey}] DONE → evidence/tirupati-master/discovery-${groupKey}.json`);
}

/* ------------------------------------------------------------------ */
/* Phase 2: candidate extraction + identity verification               */
/* ------------------------------------------------------------------ */

function buildCandidates(): Candidate[] {
  const bySlug = new Map<string, Candidate>();
  for (const groupKey of Object.keys(GROUPS)) {
    const group = GROUPS[groupKey];
    const file = join(EV, `discovery-${groupKey}.json`);
    if (!existsSync(file)) continue;
    const disc = JSON.parse(readFileSync(file, "utf8")) as { areas: Record<string, DiscoveryEntry[]> };
    for (const area of AREAS) {
      if (!area.groups.includes(groupKey)) continue;
      for (const entry of disc.areas[area.key] ?? []) {
        for (const hit of entry.hits ?? []) {
          if (!hit.kind || !hit.name) continue;
          if (AGGREGATOR_URL_HINT.test(hit.url)) continue;
          const name = extractName(hit.name);
          if (!name) continue;
          if (!area.areaTokens.test(hit.name) && !area.areaTokens.test(hit.snippet ?? "")) continue;
          const slug = slugify(`${area.key}-${name}`);
          if (bySlug.has(slug)) continue;
          const { category, placeType, tags } = categorize(group, name);
          const tags2 = area.areaTag ? [...tags, area.areaTag] : tags;
          bySlug.set(slug, {
            area: area.key,
            group: groupKey,
            name,
            target: group.target,
            category,
            placeType,
            tags: Array.from(new Set(tags2)),
            sourceUrl: hit.url,
            sourceKind: hit.kind,
            verification: { queried: false, areaConfirmed: false, addressEvidence: null, hits: [], errors: [], retrievedOn: null },
            geocode: { queried: false, lat: null, lng: null, displayName: null, osmType: null, areaConfirmed: false, note: null, retrievedOn: null },
            review: "needs_human_review",
            reviewNotes: [`extracted from ${hit.kind} (title/snippet area-gated)`],
          });
        }
      }
    }
  }
  return Array.from(bySlug.values());
}

type VerifyOutcome = "confirmed" | "not-confirmed" | "throttled" | "infra-failed";

const VERIFY_PACING_MS = 12_000;               // inter-candidate pacing (unchanged)
const VERIFY_BACKOFFS_MS = [75_000, 120_000];  // bounded: 1 initial + 2 backoff attempts

async function runVerify(onlySlug: string | null): Promise<void> {
  const limit = intFlag("--limit") ?? 0;        // 0 = unbounded (whole queue)
  const breakerMax = intFlag("--breaker") ?? 5; // consecutive-throttle circuit breaker
  const candidates = buildCandidates();
  console.log(`[verify] ${candidates.length} candidates extracted from discovery` +
    (limit > 0 ? ` — chunk limit ${limit}` : "") +
    ` — circuit breaker ${breakerMax} consecutive throttles`);
  const tally = { alreadyCompleted: 0, attempted: 0, confirmed: 0, notConfirmed: 0, throttled: 0, infraFailed: 0 };
  let consecutiveThrottled = 0;
  let attempted = 0;
  let pausedByBreaker = false;

  for (const c of candidates) {
    const slug = slugify(`${c.area}-${c.name}`);
    if (onlySlug && slug !== onlySlug) continue;
    const file = join(EV, `verify-${slug}.json`);
    // resume semantics: completed records are NEVER overwritten or repeated;
    // throttled stubs (skipped:true) ARE re-attempted
    let previousAttempts: Array<{ retrievedOn: string; errors: string[] }> = [];
    if (existsSync(file)) {
      let old: { skipped?: boolean; retrievedOn?: string; errors?: string[]; previousAttempts?: Array<{ retrievedOn: string; errors: string[] }> } | null = null;
      try { old = JSON.parse(readFileSync(file, "utf8")); } catch { old = null; }
      if (!REDO && old && !old.skipped) {
        tally.alreadyCompleted++;
        continue;
      }
      if (old) {
        previousAttempts = [
          ...(old.previousAttempts ?? []).slice(-4),
          { retrievedOn: old.retrievedOn ?? "?", errors: old.errors ?? [] },
        ];
      }
    }
    if (limit > 0 && attempted >= limit) break;
    attempted++;
    tally.attempted++;
    const area = AREAS.find((a) => a.key === c.area)!;
    const query = `"${c.name}" ${area.city} address`;
    let hits: Hit[] | null = null;
    const errors: string[] = [];
    for (let attempt = 0; attempt <= VERIFY_BACKOFFS_MS.length; attempt++) {
      try {
        hits = await webSearch(query, 6);
        break;
      } catch (e) {
        const msg = (e as Error).message;
        errors.push(msg);
        if (attempt < VERIFY_BACKOFFS_MS.length) {
          const ra = retryAfterSeconds(msg);
          const wait = ra != null ? Math.max(ra * 1000, 30_000) : VERIFY_BACKOFFS_MS[attempt];
          console.log(`[verify] throttled/error at "${c.name}" (attempt ${attempt + 1}/${VERIFY_BACKOFFS_MS.length + 1}) — backing off ${Math.round(wait / 1000)}s${ra != null ? " (Retry-After)" : ""}`);
          await sleep(wait);
        }
      }
    }
    const throttledMsg = /429|rate|too many/i.test(errors[errors.length - 1] ?? "");
    if (hits != null) {
      const retriedAfterThrottle = errors.length > 0;
      const allText = hits.map((h) => `${h.name ?? ""} ${h.snippet ?? ""}`).join(" \n ");
      const areaConfirmed = area.areaTokens.test(allText);
      const addressHit = hits.find((h) =>
        /\b\d{6}\b|road|street|nagar|colony|layout|circle| OPP\.|opp\.|near /i.test(`${h.name ?? ""} ${h.snippet ?? ""}`)
      );
      const payload: Record<string, unknown> = {
        candidate: { name: c.name, area: c.area, sourceUrl: c.sourceUrl },
        query,
        hits,
        areaConfirmed,
        addressEvidence: addressHit ? `${addressHit.name ?? ""} :: ${addressHit.snippet ?? ""}`.slice(0, 400) : null,
        errors: [],
        retrievedOn: RETRIEVED,
      };
      if (retriedAfterThrottle) payload.transientErrors = errors.slice(0, 3);
      if (retriedAfterThrottle) payload.retriedAfterThrottle = true;
      if (previousAttempts.length > 0) payload.previousAttempts = previousAttempts;
      writeFileSync(file, JSON.stringify(payload, null, 2));
      if (areaConfirmed) { tally.confirmed++; console.log(`[verify] ✓ "${c.name}" — area CONFIRMED${addressHit ? " + address evidence" : ""}`); }
      else { tally.notConfirmed++; console.log(`[verify] ✗ "${c.name}" — area NOT confirmed (negative evidence)`); }
      consecutiveThrottled = 0;
    } else {
      const outcome: Exclude<VerifyOutcome, "confirmed" | "not-confirmed"> = throttledMsg ? "throttled" : "infra-failed";
      const stub: Record<string, unknown> = {
        candidate: { name: c.name, area: c.area, sourceUrl: c.sourceUrl },
        query,
        hits: [],
        errors,
        retrievedOn: RETRIEVED,
        skipped: true,
        skipReason: outcome === "throttled" ? "rate-limited" : "infra-error",
      };
      if (previousAttempts.length > 0) stub.previousAttempts = previousAttempts;
      writeFileSync(file, JSON.stringify(stub, null, 2));
      if (outcome === "throttled") {
        tally.throttled++;
        consecutiveThrottled++;
        console.log(`[verify] ⏸ "${c.name}" — rate-limited, recorded as skipped (NOT verified)`);
        if (consecutiveThrottled >= breakerMax) {
          console.log(`[verify] CIRCUIT BREAKER — ${consecutiveThrottled} consecutive rate-limited candidates; pausing the web_search source this run. Resume later; completed records are preserved.`);
          pausedByBreaker = true;
          break;
        }
      } else {
        tally.infraFailed++;
        consecutiveThrottled = 0;
        console.log(`[verify] ⏸ "${c.name}" — infra error, recorded as skipped (NOT verified)`);
      }
    }
    await sleep(VERIFY_PACING_MS);
  }

  // honest remaining-work recount straight from the evidence tree
  const remaining = { pending: 0, throttled: 0 };
  for (const c of candidates) {
    const slug = slugify(`${c.area}-${c.name}`);
    if (onlySlug && slug !== onlySlug) continue;
    const file = join(EV, `verify-${slug}.json`);
    if (!existsSync(file)) { remaining.pending++; continue; }
    try {
      const v = JSON.parse(readFileSync(file, "utf8")) as { skipped?: boolean };
      if (v.skipped) remaining.throttled++;
    } catch { remaining.pending++; }
  }
  console.log(`[verify] TALLY — attempted: ${tally.attempted} (confirmed ${tally.confirmed}, not-confirmed ${tally.notConfirmed}, throttled-skipped ${tally.throttled}, infra-failed ${tally.infraFailed}); untouched completed: ${tally.alreadyCompleted}; remaining overall: ${remaining.pending} never-attempted + ${remaining.throttled} throttled-stubs`);
  console.log(pausedByBreaker ? "[verify] STOPPED BY CIRCUIT BREAKER (source paused — not a completion)" : "[verify] DONE");
  if (pausedByBreaker) process.exitCode = 3;
}

/* ------------------------------------------------------------------ */
/* Phase 3: geocoding (Nominatim, keyless, 1 req/s, area-gated)        */
/* ------------------------------------------------------------------ */

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
  osm_type?: string;
  type?: string;
}

async function runGeocode(onlySlug: string | null): Promise<void> {
  const candidates = buildCandidates();
  for (const c of candidates) {
    const slug = slugify(`${c.area}-${c.name}`);
    if (onlySlug && slug !== onlySlug) continue;
    const vFile = join(EV, `verify-${slug}.json`);
    if (!existsSync(vFile)) continue;
    const v = JSON.parse(readFileSync(vFile, "utf8")) as { areaConfirmed?: boolean };
    if (!v.areaConfirmed) continue;
    const gFile = join(EV, `geocode-${slug}.json`);
    if (existsSync(gFile) && !REDO) continue;
    const area = AREAS.find((a) => a.key === c.area)!;
    const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=3&countrycodes=in&q=${encodeURIComponent(`${c.name}, ${area.city}`)}`;
    let note: string | null = null;
    let best: NominatimResult | null = null;
    try {
      const res = await politeFetch(url, { "User-Agent": RESEARCH_UA, Accept: "application/json" });
      if (!res.ok) {
        note = `nominatim HTTP ${res.status}`;
      } else {
        const results = (await res.json()) as NominatimResult[];
        const gated = results.find((r) => area.areaTokens.test(r.display_name));
        if (!gated) {
          note = `no result with area token (${results.length} candidates, all outside ${area.city})`;
        } else {
          best = gated;
        }
      }
    } catch (e) {
      note = (e as Error).message;
    }
    const payload = {
      candidate: { name: c.name, area: c.area },
      query: `${c.name}, ${area.city}`,
      lat: best ? Number(best.lat) : null,
      lng: best ? Number(best.lon) : null,
      displayName: best?.display_name ?? null,
      osmType: best ? `${best.osm_type ?? "?"}/${best.type ?? "?"}` : null,
      areaConfirmed: !!best,
      note,
      retrievedOn: RETRIEVED,
    };
    writeFileSync(gFile, JSON.stringify(payload, null, 2));
    console.log(`[geocode] ${c.name} → ${best ? `${payload.lat},${payload.lng} (${payload.osmType})` : `NULL (${note ?? "?"})`}`);
  }
  console.log("[geocode] DONE");
}

/* ------------------------------------------------------------------ */
/* Phase 4: worksheet consolidation (human review happens HERE)        */
/* ------------------------------------------------------------------ */

async function runWorksheet(): Promise<void> {
  const candidates = buildCandidates();
  const rows: Candidate[] = [];
  for (const c of candidates) {
    const slug = slugify(`${c.area}-${c.name}`);
    const vFile = join(EV, `verify-${slug}.json`);
    const gFile = join(EV, `geocode-${slug}.json`);
    const row: Candidate = { ...c, reviewNotes: [...c.reviewNotes] };
    if (existsSync(vFile)) {
      const v = JSON.parse(readFileSync(vFile, "utf8")) as {
        areaConfirmed?: boolean; addressEvidence?: string | null; hits?: Hit[]; retrievedOn?: string; skipped?: boolean; skipReason?: string;
      };
      row.verification = {
        queried: true,
        areaConfirmed: !!v.areaConfirmed && !v.skipped,
        addressEvidence: v.addressEvidence ?? null,
        hits: v.hits ?? [],
        errors: [],
        retrievedOn: v.retrievedOn ?? null,
      };
      if (v.skipped) {
        // a skipped request is NEVER verification: the candidate stays pending,
        // with no area-confirmation and no area-exclusion claim
        row.verificationThrottled = true;
        row.reviewNotes.push(`verification NOT completed (${v.skipReason ?? "rate-limited"} — skipped run; pending re-attempt)`);
      } else if (!v.areaConfirmed) {
        row.reviewNotes.push("AREA NOT CONFIRMED — candidate excluded from SQL");
      }
    } else {
      row.reviewNotes.push("verification pending");
    }
    if (existsSync(gFile)) {
      const g = JSON.parse(readFileSync(gFile, "utf8")) as {
        lat: number | null; lng: number | null; displayName: string | null; osmType: string | null; areaConfirmed: boolean; note: string | null; retrievedOn: string;
      };
      row.geocode = {
        queried: true,
        lat: g.lat,
        lng: g.lng,
        displayName: g.displayName,
        osmType: g.osmType,
        areaConfirmed: g.areaConfirmed,
        note: g.note,
        retrievedOn: g.retrievedOn,
      };
      if (g.areaConfirmed) row.reviewNotes.push("coordinates geocoded via OSM Nominatim (area-gated)");
      else row.reviewNotes.push(`coordinates NULL (${g.note ?? "geocode failed"})`);
    }
    rows.push(row);
  }
  const summary = {
    retrievedOn: RETRIEVED,
    total: rows.length,
    byArea: rows.reduce<Record<string, number>>((acc, r) => ((acc[r.area] = (acc[r.area] ?? 0) + 1), acc), {}),
    byGroup: rows.reduce<Record<string, number>>((acc, r) => ((acc[r.group] = (acc[r.group] ?? 0) + 1), acc), {}),
    byCategory: rows.reduce<Record<string, number>>((acc, r) => ((acc[r.category] = (acc[r.category] ?? 0) + 1), acc), {}),
    areaConfirmed: rows.filter((r) => r.verification.areaConfirmed).length,
    geocoded: rows.filter((r) => r.geocode.areaConfirmed).length,
    // exact verification accounting (a throttled request is never verified):
    verifyRanNotConfirmed: rows.filter((r) => r.verification.queried && !r.verificationThrottled && !r.verification.areaConfirmed).length,
    verifyThrottled: rows.filter((r) => r.verificationThrottled === true).length,
    verifyPending: rows.filter((r) => !r.verification.queried && r.verificationThrottled !== true).length,
    geocodeEligiblePending: rows.filter((r) => r.verification.areaConfirmed && !r.geocode.queried).length,
    note: "rows are candidates with recorded evidence; only area-confirmed rows with reviewed identity enter a generated SQL batch, after explicit human approval",
  };
  writeFileSync(join(WS, "tirupati-master.json"), JSON.stringify({ summary, rows }, null, 2));
  console.log(`[worksheet] ${rows.length} rows (${summary.areaConfirmed} area-confirmed, ${summary.geocoded} geocoded) → worksheets/tirupati-master.json`);
}

switch (phase) {
  case "discovery":
    runDiscovery(arg3 ?? "").catch((e) => { console.error("FATAL:", e); process.exit(1); });
    break;
  case "verify":
    runVerify(positional3).catch((e) => { console.error("FATAL:", e); process.exit(1); });
    break;
  case "geocode":
    runGeocode(positional3).catch((e) => { console.error("FATAL:", e); process.exit(1); });
    break;
  case "worksheet":
    runWorksheet().catch((e) => { console.error("FATAL:", e); process.exit(1); });
    break;
}
