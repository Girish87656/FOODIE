/* ==================================================================
   FOODIE — Tirupati master discovery: CURATION (Phase C/D/E)
   ------------------------------------------------------------------
   Reads the canonical worksheet (evidence-derived candidates) and the
   official-sources extraction, then:
     1. cleans dirty listing-page names (documented rules), extracting
        the locality token into an honest `localityHint` field,
     2. drops non-places (generic directory pages, dishes, social noise,
       organisation pages) — every drop records a REASON,
     3. re-attaches verify + geocode evidence by normalized name
       (slug-stable despite discovery re-fetch title drift),
     4. dedupes within-set via alias groups + normalized names,
     5. cross-references existing sets (production Tirupati rows,
       owner-blocked Batch-011 16 names, Tirupati Laddu destination food),
     6. assigns doc-level evidence tiers (never DB 'verified'):
         T1 verify-confirmed  — independent verify query confirmed area
         T2 official-source   — tirumala.org / incredibleindia page itself
         T3 listing-only      — single area-gated listing hit
     7. emits worksheets/tirupati-master-curated.json consumed by the
        docs/batch generators.

   Honesty rules: nothing is invented; dropped rows keep their evidence
   file on disk; a dropped row is never silently deleted — it lands in
   the curation log with a reason. DB rows always import as
   verification_status='unverified' per plan §3.
   ================================================================== */

import { readFileSync, writeFileSync, existsSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const HERE = dirname(fileURLToPath(import.meta.url));
const EV = join(HERE, "evidence", "tirupati-master");
const WS = join(HERE, "worksheets");

interface Row {
  area: string; group: string; name: string; target: string; category: string;
  placeType: string | null; tags: string[]; sourceUrl: string; sourceKind: string | null;
  verification: { queried: boolean; areaConfirmed: boolean; addressEvidence: string | null; hits: unknown[] };
  geocode: { queried: boolean; lat: number | null; lng: number | null; displayName: string | null; areaConfirmed: boolean; note: string | null };
  reviewNotes: string[];
}

const norm = (s: string) =>
  s.toLowerCase()
    .normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

/* ---------------- locality knowledge ---------------- */

/** known locality tokens → honest area assignment (checked BEFORE tails are stripped) */
const LOCALITY_AREA: Array<[RegExp, string, string]> = [
  [/\bkorlagunta\b/i, "tpt-neighbourhoods", "Korlagunta"],
  [/\bbhavani nagar\b/i, "tpt-neighbourhoods", "Bhavani Nagar"],
  [/\bmr\s*palli\b/i, "tpt-neighbourhoods", "MR Palli"],
  [/\bavilala\b/i, "tpt-neighbourhoods", "Avilala"],
  [/\bramchandran? nagar\b/i, "tpt-neighbourhoods", "Ramchandra Nagar"],
  [/\bvidyut nagar\b/i, "tpt-neighbourhoods", "Vidyut Nagar"],
  [/\bair bypass\b/i, "tpt-neighbourhoods", "AIR Bypass Road"],
  [/\bstv nagar\b/i, "tpt-neighbourhoods", "STV Nagar"],
  [/\bsv nagar\b/i, "tpt-neighbourhoods", "SV Nagar"],
  [/\bmaruthi nagar\b/i, "tpt-neighbourhoods", "Maruthi Nagar"],
  [/\breddy\s*(?:&|and)?\s*reddy colony\b/i, "tpt-neighbourhoods", "Reddy & Reddy Colony"],
  [/\bhathiramji colony\b/i, "tpt-neighbourhoods", "Hathiramji Colony"],
  [/\bshiv jyoti nagar\b/i, "tpt-neighbourhoods", "Shiv Jyoti Nagar"],
  [/\bsri nagar colony\b/i, "tpt-neighbourhoods", "Sri Nagar Colony"],
  [/\bbalaji colony\b/i, "tpt-neighbourhoods", "Balaji Colony"],
  [/\bkt road\b/i, "tpt-central", "KT Road"],
  [/\btk street\b/i, "tpt-central", "TK Street"],
  [/\btilak road\b/i, "tpt-central", "Tilak Road"],
  [/\bgandhi road\b/i, "tpt-central", "Gandhi Road"],
  [/\bnethaji road\b/i, "tpt-central", "Nethaji Road"],
  [/\btata nagar\b/i, "tpt-central", "Tata Nagar"],
  [/\bkapilateertham road\b/i, "tpt-central", "Kapilateertham Road"],
  [/\bramanuja circle\b/i, "tpt-central", "Ramanuja Circle"],
  [/\btirupati bazar\b/i, "tpt-central", "Tirupati Bazar"],
  [/\bmadhav(?:a)? puram\b/i, "tpt-central", "Madhavapuram"],
  [/\balipiri\b/i, "tpt-central", "Alipiri"],
  [/\btml by ?pass road\b/i, "tpt-neighbourhoods", "TML Bypass Road"],
  [/\bmangalam\b/i, "renigunta", "Mangalam (Renigunta corridor)"],
  [/\brenigunta\b/i, "renigunta", "Renigunta"],
  [/\bchandragiri\b/i, "chandragiri", "Chandragiri"],
  [/\bsrinivasa manga/i, "srinivasa-mangapuram", "Srinivasa Mangapuram"],
  [/\btiruchan(oo|u)r\b/i, "tiruchanur", "Tiruchanur"],
  [/\btirumala\b/i, "tirumala", "Tirumala"],
];

/* ---------------- name cleaning ---------------- */

/** noise suffixes that are never locality — stripped first */
const NOISE_TAILS: Array<[RegExp, string]> = [
  [/\s*-?\s*fast food\s*$/gi, ""],
  [/[, ]*\bcredits?\s*$/gi, ""],
  [/[, ]*pure vegetarian\s*$/gi, ""],
  [/[, ]*\s*andhra pradesh,?\s*$/gi, ""],
  [/\s+order food online.*$/gi, ""],
  [/\s+order online.*$/gi, ""],
  [/\s+online in tirupati.*$/gi, ""],
  [/\s+dining reviews.*$/gi, ""],
  [/\s+restaurant reviews.*$/gi, ""],
  [/\s*\|\s*reviews.*$/gi, ""],
  [/\s*-\s*all you (?:really )?should know.*$/gi, ""],
  [/\s+in tirumala,?\s*tirupati.*$/gi, " §T"],
  [/\s*,\s*tirumala,?\s*(order.*)?$/gi, " §T"],
  [/^(order (?:non veg food )?from |order from |reviews of |menu of |locations of |photo: )/gi, ""],
  [/^does (.+?) deliver food in tirupati on swiggy\??$/gi, "$1"],
  [/^sweet shops? - /gi, ""],
  [/^coffee shops? - /gi, ""],
  [/^tiffin services? - /gi, ""],
  [/^handicraft item dealers in.*$/gi, ""],
  [/^fabric retailers in.*$/gi, ""],
  [/\s*-\s*(wildlife sanctuary|bakeries|cake shops?|restaurants?)\s*$/gi, ""],
  [/\s*[-,]+\s*$/, ""],
  [/\s*\.$/, ""],
];

/** listing tails that carry a locality: " in <Locality>,Tirupati", ", <Locality>, Tirupati", " - <Locality>" */
const LOCALITY_TAILS: RegExp[] = [
  /\s+in\s+([A-Za-z'&.\s]+?),?\s*(?:Tirupati|Tirumala)\s*$/i,
  /,\s*([A-Za-z'&.\s]+?),?\s*(?:Tirupati|Tirumala)\s*$/,
  /\s*-\s*([A-Za-z'&.\s]+?)\s*(?:online.*)?$/i,
  /\bat\s+([A-Za-z'&.\s]+?),?\s*(?:Tirupati.*)?$/i,
];

/** generic pages that are NOT places (drop with reason) */
const GENERIC_PATTERNS: Array<[RegExp, string]> = [
  [/^trends in/i, "retail chain store-locator page"],
  [/^(restaurants?|hotels?|lodges?|cafes?|coffee shops?|tea restaurants?|ice cream( in tirupati.*)?|sweet shops?|bakeries|biryani restaurants?|pure veg restaurants?( in tirupati)?|tiffin|museums in tirupati|nature (&|and) parks in tirupati|religious tourism|forest tourism|others|online hotel booking|accommodation at tirupati|rest houses in tirumala|free accommodation in tirumala|tirumala restaurants,?.*|tiruchanur restaurants,?.*|renigunta restaurants,?.*|korlagunta restaurants,?.*|tirupati(?! city| foods| laddu)$)/i, "generic directory/category page, not a place"],
  [/^(tirumala tirupati devasthanams|ttd)$/i, "organisation, not a place"],
  [/^tirupati - find verified/i, "generic business directory search page"],
  [/^locations of trends/i, "retail chain store-locator page"],
  [/^(popular restaurants serving|popular packaged juice)/i, "generic listicle page"],
  [/^(double egg dosa|ghee karam dosa)/i, "dish name, not a place"],
  [/^(craving something|new @)/i, "social-media noise, no place identity"],
  [/^order (?:non veg )?food online/i, "swiggy search page, not a place"],
  [/in hyderabad/i, "listing is for a Hyderabad venue, not Tirupati/Tirumala"],
  [/^(10 (top hotels|places to stay))/i, "generic hotel listing page"],
  [/^chandragiri$/i, "ambiguous single-token name — source title does not establish whether it denotes Chandragiri Fort, the town, or another POI (identity rule; held out rather than guessed)"],
  [/^5 star hotels near/i, "generic hotel listing page"],
  [/^sri kalyana venkateswaraswami temple,tirupati$/i, "goibibo landmark-area listing page, not a stay"],
  [/^sri venkateswara national park - all you/i, "duplicate of National Park entry with listing tail"],
  [/^must view in$/i, "generic page title, not a place"],
  [/sacred teerthams of tirumala/i, "article/listicle title, not a single place"],
  [/^museums in$/i, "generic category page title, not a place"],
  [/^nature (&|and) parks in$/i, "generic category page title, not a place"],
  [/^prominent churches in tirupati/i, "listicle page title, not a single place"],
  [/prasadam counter inside visuals/i, "video title, not a place"],
  [/laddu prasadam details and significance/i, "article title, not a place"],
  [/^renigunta locality restaurants$/i, "directory page title, not a place"],
];

function cleanName(raw: string): { name: string; changed: boolean; localityHint: string | null; areaKey: string | null } {
  let n = raw.replace(/\s+/g, " ").trim();
  const before = n;
  for (const [re, rep] of NOISE_TAILS) n = n.replace(re, rep).trim();
  let localityHint: string | null = null;
  let areaKey: string | null = null;
  // resolve the §T marker (Tirumala-suffix evidence) BEFORE locality extraction
  n = n.replace(/§T\s*$/i, " Tirumala").trim();
  // locality from known tokens anywhere in the remaining name
  for (const [re, area, label] of LOCALITY_AREA) {
    const m = n.match(re);
    if (m) { localityHint = label; areaKey = area; break; }
  }
  // strip " in <Locality>,Tirupati" style tails now that locality is captured
  for (const re of LOCALITY_TAILS) {
    const m = n.match(re);
    if (m && m[1] && !/^(tirupati|tirumala|andhra pradesh)$/i.test(m[1].trim())) {
      n = n.replace(re, "").trim();
      break;
    }
  }
  n = n.replace(/\s+/g, " ").replace(/[,.\s]+$/, "").trim();
  // trailing ",Tirupati" / " Tirupati" leftovers
  n = n.replace(/[, ]+\s*tirupati\s*$/i, "").replace(/[, ]+\s*tirumala\s*$/i, "").trim();
  return { name: n, changed: n !== before, localityHint, areaKey };
}

/* explicit display renames for stubborn dirty names (audited in curationLog) */
const EXPLICIT_RENAMES: Array<[RegExp, string]> = [
  [/^manju foods\b.*$/i, "Manju Foods"],
  [/^shankar chats\b.*$/i, "Shankar Chats"],
  [/^chandra mess\b.*$/i, "Chandra Mess"],
  [/^deepika mess\b.*$/i, "Deepika Mess"],
  [/^bhavani bhojnalaya\b.*$/i, "Bhavani Bhojnalaya"],
  [/^bhagni'?s family restaurant\b.*$/i, "Bhagni's Family Restaurant"],
  [/^vinayaka tiffin centre\b.*$/i, "Vinayaka Tiffin Centre"],
  [/^kumari tiffin center\b.*$/i, "Kumari Tiffin Center"],
  [/^sri venkateswara tiffin center\b.*$/i, "Sri Venkateswara Tiffin Center"],
  [/^madras tiffin center\b.*$/i, "Madras Tiffin Center"],
  [/^gayatri tiffin center\b.*$/i, "Gayatri Tiffin Center"],
  [/^naidu tiffin center\b.*$/i, "Naidu Tiffin Center"],
  [/^lavanya tiffin center\b.*$/i, "Lavanya Tiffin Center"],
  [/^padamavathi tiffin center\b.*$/i, "Padamavathi Tiffin Center"],
  [/^sri padmavathi mess\b.*$/i, "Sri Padmavathi Mess"],
  [/^revathi mess\b.*$/i, "Revathi Mess & Catering"],
  [/^nagarjuna military mess\b.*$/i, "Nagarjuna Military Mess"],
  [/^gokul mess\b.*$/i, "Gokul Mess"],
  [/^vishnu padam tiffin center\b.*$/i, "Vishnu Padam Tiffin Center"],
  [/^aapam tiffin center\b.*$/i, "Aapam Tiffin Center, Renigunta"],
  [/^ganapathi juice shop\b.*$/i, "Ganapathi Juice Shop"],
  [/^ganesh juice center\b.*$/i, "Ganesh Juice Center"],
  [/^mr'?s juice bar\b.*$/i, "Mr's Juice Bar"],
  [/^vasundhara tea stall\b.*$/i, "Vasundhara Tea Stall"],
  [/^venkat sai tea stall\b.*$/i, "Venkat Sai Tea Stall"],
  [/^tirumala bakery house\b.*$/i, "Tirumala Bakery House"],
  [/^bakers delight\b.*$/i, "Bakers Delight"],
  [/^mayura bakery\b.*$/i, "Mayura Bakery"],
  [/^babas bakery\b.*$/i, "Babas Bakery"],
  [/^tirumala bakery and sweets\b.*$/i, "Tirumala Bakery And Sweets"],
  [/^nic natural ice creams\b.*$/i, "NiC Natural Ice Creams"],
  [/^cream stone\b.*$/i, "Cream Stone"],
  [/^shivam ice cream\b.*$/i, "Shivam Ice Cream"],
  [/^havmor ice cream\b.*$/i, "Havmor Ice Cream"],
  [/^ice stone\b.*$/i, "Ice Stone"],
  [/^grand cakes & bakes\b.*$/i, "Grand Cakes & Bakes"],
  [/^tirumala cake house\b.*$/i, "Tirumala Cake House"],
  [/^balaji bakery and sweets\b.*$/i, "Balaji Bakery And Sweets"],
  [/^sri krishna ayyangar sweets & bakery\b.*$/i, "Sri Krishna Ayyangar Sweets & Bakery"],
  [/^bangalore bakery\b.*$/i, "Bangalore Bakery"],
  [/^sri venkateshwara bakery and sweets\b.*$/i, "Sri Venkateshwara Bakery And Sweets"],
  [/^meghana sweets and bakery\b.*$/i, "Meghana Sweets And Bakery"],
  [/^minerva coffee shop\b.*$/i, "Minerva Coffee Shop"],
  [/^srinivasa cafe\b.*$/i, "Srinivasa Cafe"],
  [/^amor fati cafe\b.*$/i, "Amor Fati Cafe"],
  [/^retro cafe & restaurant\b.*$/i, "Retro Cafe & Restaurant"],
  [/^cafe manasa\b.*$/i, "Cafe Manasa"],
  [/^kafe tirumala\b.*$/i, "Kafe Tirumala"],
  [/^kafe tirupati\b.*$/i, "Kafe Tirupati"],
  [/^chota cafe\b.*$/i, "Chota Cafe"],
  [/^iyer'?s cafe\b.*$/i, "Iyer's Cafe"],
  [/^garuda cafe\b.*$/i, "Garuda Cafe"],
  [/^bhai ka biryani\b.*$/i, "Bhai Ka Biryani"],
  [/^mana hari villu family restaurant\b.*$/i, "Mana Hari Villu Family Restaurant"],
  [/^mayura garden family restaurant\b.*$/i, "Mayura Garden Family Restaurant"],
  [/^mayuri restaurant\b.*$/i, "Mayuri Restaurant"],
  [/^di table 9\b.*$/i, "Di Table 9"],
  [/^chillies restaurant\b.*$/i, "Chillies Restaurant"],
  [/^srinivasam restaurant\b.*$/i, "Srinivasam Restaurant"],
  [/^srivari naivedyam\b.*$/i, "Srivari Naivedyam"],
  [/^saravana bhavan pure veg restaurant\b.*$/i, "Saravana Bhavan Pure Veg Restaurant"],
  [/^anandan vasavi vegetarian restaurant\b.*$/i, "Anandan Vasavi Vegetarian Restaurant"],
  [/^meenakshi pure veg restaurant\b.*$/i, "Meenakshi Pure Veg Restaurant"],
  [/^raja food centre\b.*$/i, "Raja Food Centre"],
  [/^ugadhi restrent\b.*$/i, "Ugadhi Restaurant (Ugadhi Restrent)"],
  [/^star kitchen\b.*$/i, "Star Kitchen, Renigunta"],
  [/^hygien pani puri hot chats\b.*$/i, "Hygien Pani Puri Hot Chats"],
  [/^pani puri centre\b.*$/i, "Pani Puri Centre"],
  [/^hyderabadi biryani house\b.*$/i, "Hyderabadi Biryani House"],
  [/^18th street kitchen\b.*$/i, "18th Street Kitchen"],
  [/^amrutha swagruha foods\b.*$/i, "Amrutha Swagruha Foods"],
  [/^vijaya kitchen\b.*$/i, "Vijaya Kitchen"],
  [/^dessertezy\b.*$/i, "Dessertezy"],
  [/^ranemma tiffin\b.*$/i, "Ranemma Tiffin Center"],
  [/^bnr mall\b.*$/i, "BNR Mall"],
  [/^garuda mall\b.*$/i, "Garuda Mall"],
  [/^sirikala shopping mall\b.*$/i, "Sirikala Shopping Mall"],
  [/^tirupathi vegetable market\b.*$/i, "Tirupathi Vegetable Market"],
  [/^sfc restaurant\b.*$/i, "SFC Restaurant"],
  [/^orion restaurant\b.*$/i, "Orion Restaurant"],
  [/^annapurna veg tiffins\b.*$/i, "Annapurna Veg Tiffins"],
  [/^muthunagar, tirupati - kundhu tiffins\b.*$/i, "Kundhu Tiffins"],
  [/^geetha general stores & tiffin centre\b.*$/i, "Geetha General Stores & Tiffin Centre"],
];

/* ---------------- alias groups (identity-level dedup) ---------------- */

const ALIAS_GROUPS: Array<{ canonical: string; areas: string[]; patterns: RegExp[] }> = [
  { canonical: "Sri Kapileswara Swamy Temple (Kapila Theertham)", areas: ["tpt-central"], patterns: [/kapila\s*theertham/i, /kapileswara\s*swamy/i] },
  { canonical: "Natural Arch, Tirumala hills (Silathoranam)", areas: ["tirumala", "surrounding"], patterns: [/natural arch/i, /sila\s*thoranam/i] },
  { canonical: "Sri Padmavathi Ammavari Temple, Tiruchanur", areas: ["tiruchanur", "tpt-central"], patterns: [/padmavathi ammavari/i, /padmavati temple/i, /padmavathi devi/i] },
  { canonical: "Sri Kalyana Venkateswara Swamy Temple, Srinivasa Mangapuram", areas: ["srinivasa-mangapuram", "tpt-central"], patterns: [/kalyana venkateswara/i, /kalyana venkateshwara/i, /srinivasa mangapuram temple/i] },
  { canonical: "Sri Venkateswara Swamy Temple, Tirumala", areas: ["tirumala"], patterns: [/^venkateswara temple/i] },
  { canonical: "Sri Govindaraja Swamy Temple, Tirupati", areas: ["tpt-central"], patterns: [/govindaraja/i] },
  { canonical: "Sri Venkateswara Zoological Park, Tirupati", areas: ["tpt-central"], patterns: [/zoological park/i, /tirupati zoo/i] },
  { canonical: "Chandragiri Fort (Raja Mahal & Rani Mahal)", areas: ["chandragiri"], patterns: [/chandragiri fort/i, /raja mahal/i, /chandragiri palace/i] },
  { canonical: "OTC — Orion Tiffin Centre, Korlagunta", areas: ["tpt-neighbourhoods", "tpt-central"], patterns: [/orion tiffin cent/i] },
  { canonical: "Southern Spice, Avilala", areas: ["tpt-neighbourhoods"], patterns: [/southern spice/i] },
  { canonical: "Mayura Garden Family Restaurant, Korlagunta", areas: ["tpt-neighbourhoods", "tpt-central"], patterns: [/mayura garden/i] },
  { canonical: "Lepakshi Handicrafts Emporium", areas: ["tpt-central", "tirumala"], patterns: [/lepakshi/i] },
  { canonical: "Talakona Waterfall", areas: ["surrounding"], patterns: [/talakona/i] },
  { canonical: "Kalyani Dam", areas: ["surrounding"], patterns: [/kalyani dam/i] },
  { canonical: "Horsley Hills", areas: ["surrounding"], patterns: [/horsley hills/i] },
  { canonical: "Papavinasam Theertham, Tirumala", areas: ["tirumala"], patterns: [/papavinasam/i] },
  { canonical: "Akasha Ganga Theertham, Tirumala", areas: ["tirumala"], patterns: [/akashaganga|akasa ganga/i] },
  { canonical: "Sri Bedi Anjaneya Swamy Temple, Tirumala", areas: ["tirumala"], patterns: [/bedi anjaneya/i, /bedi hanuman/i] },
  { canonical: "Sri Varahaswamy Temple, Tirumala", areas: ["tirumala"], patterns: [/varahaswam(i|y)/i, /varaha swami/i] },
  { canonical: "Deer Park, Alipiri", areas: ["tpt-central"], patterns: [/deer park/i] },
  { canonical: "Sri Venkateswara National Park", areas: ["tpt-central", "surrounding"], patterns: [/venkateswara national park/i] },
  { canonical: "Srinivasa Hotel, Srinivasa Mangapuram", areas: ["srinivasa-mangapuram"], patterns: [/srinivasa hotel/i] },
  { canonical: "Regional Science Centre, Tirupati", areas: ["tpt-central"], patterns: [/regional science centre/i] },
];

function aliasKey(name: string, area: string): string | null {
  for (const a of ALIAS_GROUPS) {
    if (!a.areas.includes(area)) continue;
    if (a.patterns.some((p) => p.test(name))) return `${area}::${norm(a.canonical)}`;
  }
  return null;
}

/* ---------------- existing sets ---------------- */

const PRODUCTION_TIRUPATI = [
  "Holiday Inn Tirupati Tirumala", "Starlit Suites", "Tirupati Foods",
  "Ni Cake World", "Ps4 Restaurant", "The 99 Pizza",
];

const BATCH011_ALIASES: Array<[RegExp, string]> = [
  [/^venkateswara temple(,? tirumala)?$/i, "Sri Venkateswara Swamy Temple"],
  [/(?:^|\b)sri venkateswara swamy (vaari )?temple$/i, "Sri Venkateswara Swamy Temple"],
  [/padmavathi ammavari temple|padmavati temple|padmavathi devi/i, "Sri Padmavathi Ammavari Temple"],
  [/govindarajaswamy temple|govindaraja swamy temple|govindarajaswami temple|govindaraja swami temple|govindaraja temple/i, "Sri Govindaraja Swamy Temple"],
  [/kapila\s*theertham|kapileswara/i, "Sri Kapilatheertham Temple"],
  [/kalyana venkateswara/i, "Sri Kalyana Venkateswara Swamy Temple"],
  [/iskcon/i, "ISKCON Tirupati"],
  [/natural arch|sila\s*thoranam/i, "Natural Arch, Tirumala hills (Silathoranam)"],
  [/talakona/i, "Talakona Waterfall"],
  [/chandragiri fort|raja mahal|chandragiri palace/i, "Chandragiri Fort"],
  [/zoological park|tirupati zoo/i, "Sri Venkateswara Zoological Park"],
];

function batch011Hit(name: string): string | null {
  for (const [re, id] of BATCH011_ALIASES) if (re.test(name)) return id;
  return null;
}

/* ---------------- main ---------------- */

const ws = JSON.parse(readFileSync(join(WS, "tirupati-master.json"), "utf8")) as { rows: Row[]; summary: Record<string, unknown> };
const official = JSON.parse(readFileSync(join(EV, "official", "official-sources.json"), "utf8")) as {
  sources: Array<{ sourceUrl: string; httpStatus: number; page: string; extracted: Array<{ name: string; hrefOrDetail: string; verbatimQuote: string | null }> }>;
};

interface Curated {
  key: string; name: string; rawNames: string[]; nameCleaned: boolean;
  area: string; localityHint: string | null;
  group: string; target: string; category: string; placeType: string | null; tags: string[];
  sourceUrl: string; sourceKind: string | null;
  verifyAreaConfirmed: boolean | null; verifyAddressEvidence: string | null;
  geocode: { lat: number | null; lng: number | null; displayName: string | null };
  tier: "T1" | "T2" | "T3";
  existingSet: "production" | "batch-011" | "new";
  existingSetId: string | null;
  dupOf: string | null; dupReason: string | null;
  status: "curated" | "duplicate";
  officialSources?: Array<{ url: string; quote: string | null }>;
  sources: Array<{ url: string; kind: string | null; title: string | null }>;
}

const curated = new Map<string, Curated>();
const curationLog: Array<{ raw: string; area: string; action: string; reason: string }> = [];

function evidenceHosts(row: Row): string[] {
  const hosts = new Set<string>();
  try { if (row.sourceUrl) hosts.add(new URL(row.sourceUrl).host); } catch { /* skip */ }
  for (const h of (row.verification.hits ?? []) as Array<{ url?: string }>) {
    try { if (h.url) hosts.add(new URL(h.url).host); } catch { /* skip */ }
  }
  return Array.from(hosts);
}

/* preload verify + geocode evidence keyed by normalized CLEANED candidate name
   (the verify/geocode files store the raw dirty listing titles — running the same
   deterministic cleanName() over them makes the keys comparable) */
const verifyByName = new Map<string, { areaConfirmed: boolean; addressEvidence: string | null }>();
const geocodeByName = new Map<string, { lat: number | null; lng: number | null; displayName: string | null }>();
for (const f of readdirSync(EV)) {
  if (f.startsWith("verify-")) {
    try {
      const d = JSON.parse(readFileSync(join(EV, f), "utf8")) as { candidate?: { name?: string }; areaConfirmed?: boolean; addressEvidence?: string | null; skipped?: boolean };
      if (d.candidate?.name && !d.skipped) {
        const c = cleanName(d.candidate.name);
        const k = norm(c.name);
        const val = { areaConfirmed: !!d.areaConfirmed, addressEvidence: d.addressEvidence ?? null };
        if (!verifyByName.has(k) || (val.areaConfirmed && !verifyByName.get(k)!.areaConfirmed)) {
          verifyByName.set(k, val);
        }
      }
    } catch { /* skip */ }
  } else if (f.startsWith("geocode-")) {
    try {
      const d = JSON.parse(readFileSync(join(EV, f), "utf8")) as { candidate?: { name?: string }; lat: number | null; lng: number | null; displayName: string | null; areaConfirmed: boolean };
      if (d.candidate?.name && d.areaConfirmed && d.lat != null) {
        const c = cleanName(d.candidate.name);
        geocodeByName.set(norm(c.name), { lat: d.lat, lng: d.lng, displayName: d.displayName });
      }
    } catch { /* skip */ }
  }
}

for (const row of ws.rows) {
  const cleaned = cleanName(row.name);
  // explicit audited rename for stubborn listing titles
  const rename = EXPLICIT_RENAMES.find(([re]) => re.test(cleaned.name));
  if (rename && rename[1] !== cleaned.name) {
    curationLog.push({ raw: row.name, area: row.area, action: "renamed", reason: `"${cleaned.name}" → "${rename[1]}" (explicit rename table)` });
    cleaned.name = rename[1];
    cleaned.changed = true;
  }
  const drop = GENERIC_PATTERNS.find(([re]) => re.test(cleaned.name));
  if (drop) {
    curationLog.push({ raw: row.name, area: row.area, action: "dropped", reason: drop[1] });
    continue;
  }
  if (!cleaned.name || cleaned.name.length < 4) {
    curationLog.push({ raw: row.name, area: row.area, action: "dropped", reason: "name empty/too short after cleaning" });
    continue;
  }

  // area re-derivation from locality tokens extracted during cleaning
  let area = row.area;
  if (cleaned.areaKey && row.area !== "surrounding") area = cleaned.areaKey;

  // evidence re-attachment by normalized cleaned name (try BOTH the renamed and
  // the pre-rename form — renames must never orphan verify evidence)
  const preRenameKey = norm(cleanName(row.name).name);
  const nKey = norm(cleaned.name);
  const v = verifyByName.get(nKey) ?? verifyByName.get(preRenameKey);
  const g = geocodeByName.get(nKey) ?? geocodeByName.get(preRenameKey);
  const verifyAreaConfirmed = v ? v.areaConfirmed : null;
  const verifyAddressEvidence = v ? v.addressEvidence : null;
  const geocode = g ?? { lat: null, lng: null, displayName: null };
  const tier: Curated["tier"] = verifyAreaConfirmed ? "T1" : "T3";

  let existingSet: Curated["existingSet"] = "new";
  let existingSetId: string | null = null;
  if (PRODUCTION_TIRUPATI.some((p) => norm(p) === nKey)) {
    existingSet = "production"; existingSetId = cleaned.name;
  } else {
    const b11 = batch011Hit(cleaned.name);
    if (b11) { existingSet = "batch-011"; existingSetId = b11; }
  }

  const aKey = aliasKey(cleaned.name, area);
  const key = aKey ?? `${area}::${nKey}`;
  const src = { url: row.sourceUrl, kind: row.sourceKind, title: row.name };

  const existing = curated.get(key);
  if (existing) {
    if (!existing.rawNames.includes(row.name)) existing.rawNames.push(row.name);
    existing.sources.push(src);
    if (existing.tier !== "T1" && verifyAreaConfirmed === true) {
      existing.verifyAreaConfirmed = true; existing.tier = "T1";
      existing.verifyAddressEvidence = verifyAddressEvidence;
    }
    if (existing.geocode.lat == null && geocode.lat != null) existing.geocode = geocode;
    if (!existing.localityHint && cleaned.localityHint) existing.localityHint = cleaned.localityHint;
    curationLog.push({ raw: row.name, area, action: "merged", reason: `same identity as "${existing.name}" (${key})` });
    continue;
  }

  curated.set(key, {
    key, name: aKey ? (ALIAS_GROUPS.find((a) => a.areas.includes(area) && `${area}::${norm(a.canonical)}` === aKey)?.canonical ?? key.split("::")[1]) : cleaned.name, rawNames: [row.name],
    nameCleaned: cleaned.changed, area,
    localityHint: cleaned.localityHint,
    group: row.group, target: row.target, category: row.category,
    placeType: row.placeType, tags: row.tags,
    sourceUrl: row.sourceUrl, sourceKind: row.sourceKind,
    verifyAreaConfirmed, verifyAddressEvidence, geocode, tier,
    existingSet, existingSetId, dupOf: null, dupReason: null,
    status: "curated", sources: [src],
  });
}

/* ---- official-source candidates (T2) ---- */

/* official additions must carry a SEMANTIC category group (the `group` field
   drives the inventory tables and the coverage matrix — a placeholder like
   "official" would make those rows invisible in every group-rendered view). */
const CATEGORY_TO_GROUP: Record<string, string> = {
  restaurant: "food-restaurants",
  tiffin: "food-tiffin",
  street_food: "food-street",
  bakery_sweets: "food-bakery",
  cafe: "food-cafe",
  temple: "temples",
  hotel: "stays",
  other: "attractions",
  waterfall: "attractions",
};

const OFFICIAL_NAME_MAP: Array<{ match: RegExp; name: string; area: string; target: string; category: string; placeType: string | null; tags: string[] }> = [
  { match: /swami pushkarini/i, name: "Swami Pushkarini", area: "tirumala", target: "place", category: "other", placeType: "other", tags: ["teertham", "tirumala"] },
  { match: /papavinasam/i, name: "Papavinasam Theertham", area: "tirumala", target: "place", category: "other", placeType: "other", tags: ["teertham", "tirumala"] },
  { match: /akasa\s*ganga|akashaganga/i, name: "Akasha Ganga Theertham", area: "tirumala", target: "place", category: "waterfall", placeType: "waterfall", tags: ["teertham", "tirumala"] },
  { match: /chakra\s*teertham/i, name: "Chakra Theertham", area: "tirumala", target: "place", category: "other", placeType: "other", tags: ["teertham", "tirumala"] },
  { match: /vaikuntha teertham/i, name: "Vaikuntha Teertham", area: "tirumala", target: "place", category: "other", placeType: "other", tags: ["teertham", "tirumala"] },
  { match: /bedi anjaneya|bedi hanuman/i, name: "Sri Bedi Anjaneya Swamy Temple, Tirumala", area: "tirumala", target: "place", category: "temple", placeType: "temple", tags: ["tirumala"] },
  { match: /bhu varaha swamy|varahaswam(i|y) temple|varahaswami? swamy|varaha swami temple|varaha swamy temple/i, name: "Sri Varahaswamy Temple, Tirumala", area: "tirumala", target: "place", category: "temple", placeType: "temple", tags: ["tirumala"] },
  { match: /hathiramjee mutt|hathiramji mutt/i, name: "Sri Hathiramjee Mutt, Tirumala", area: "tirumala", target: "place", category: "temple", placeType: "temple", tags: ["mutt", "tirumala"] },
  { match: /annaprasadam/i, name: "Annaprasadam Centre, Tirumala", area: "tirumala", target: "place", category: "other", placeType: "other", tags: ["prasadam", "tirumala"] },
  { match: /s\.?v\.? museum|srivari museum/i, name: "Sri Venkateswara Museum, Tirumala", area: "tirumala", target: "place", category: "other", placeType: "other", tags: ["museum", "tirumala"] },
  { match: /regional science centre/i, name: "Regional Science Centre, Tirupati", area: "tpt-central", target: "place", category: "other", placeType: "other", tags: ["museum"] },
  { match: /srikalahasteeswara/i, name: "Srikalahasteeswara Temple, Srikalahasti", area: "surrounding", target: "place", category: "temple", placeType: "temple", tags: ["surrounding"] },
  { match: /sreenivasam complex/i, name: "Sreenivasam Complex (TTD Pilgrim Accommodation)", area: "tpt-central", target: "place", category: "hotel", placeType: "hotel", tags: ["pilgrim_accommodation"] },
  { match: /^madhavam$/i, name: "Madhavam (TTD Pilgrim Accommodation)", area: "tpt-central", target: "place", category: "hotel", placeType: "hotel", tags: ["pilgrim_accommodation"] },
  { match: /sri venkateswara dharmasala/i, name: "Sri Venkateswara Dharmasala (TTD)", area: "tpt-central", target: "place", category: "hotel", placeType: "hotel", tags: ["pilgrim_accommodation"] },
  { match: /sri govindaraja dharmasala/i, name: "Sri Govindaraja Swamy Dharmasala (TTD)", area: "tpt-central", target: "place", category: "hotel", placeType: "hotel", tags: ["pilgrim_accommodation"] },
  { match: /vishnu nivasam/i, name: "Vishnu Nivasam (TTD Free Accommodation)", area: "tpt-central", target: "place", category: "hotel", placeType: "hotel", tags: ["pilgrim_accommodation"] },
  { match: /kalyana venkateswara swamy temple, srinivasa/i, name: "Sri Kalyana Venkateswara Swamy Temple, Srinivasa Mangapuram", area: "srinivasa-mangapuram", target: "place", category: "temple", placeType: "temple", tags: ["surrounding-corridor"] },
  { match: /kapileswara swamy temple/i, name: "Sri Kapileswara Swamy Temple (Kapila Theertham)", area: "tpt-central", target: "place", category: "temple", placeType: "temple", tags: [] },
  { match: /govindarajaswami temple/i, name: "Sri Govindaraja Swamy Temple, Tirupati", area: "tpt-central", target: "place", category: "temple", placeType: "temple", tags: [] },
  { match: /padmavathi ammavari temple/i, name: "Sri Padmavathi Ammavari Temple, Tiruchanur", area: "tiruchanur", target: "place", category: "temple", placeType: "temple", tags: ["surrounding-corridor"] },
  { match: /sri krishna swamy temple.*alagiyaperumal|alagiyaperumal/i, name: "Sri Krishna Swamy Temple (Alagiyaperumal Shrine), Tiruchanoor", area: "tiruchanur", target: "place", category: "temple", placeType: "temple", tags: ["surrounding-corridor"] },
  { match: /sundararaja|sundara raja/i, name: "Sri Sundararaja Swamy Temple, Tiruchanoor", area: "tiruchanur", target: "place", category: "temple", placeType: "temple", tags: ["surrounding-corridor"] },
  { match: /varada raja/i, name: "Sri Varada Raja Swamy Temple, Tiruchanoor", area: "tiruchanur", target: "place", category: "temple", placeType: "temple", tags: ["surrounding-corridor"] },
  { match: /suryanarayana/i, name: "Sri Suryanarayana Swamy Temple, Tiruchanoor", area: "tiruchanur", target: "place", category: "temple", placeType: "temple", tags: ["surrounding-corridor"] },
  { match: /prasanna venkateswara.*appalayagunta|appalayagunta/i, name: "Sri Prasanna Venkateswara Swamy Temple, Appalayagunta", area: "surrounding", target: "place", category: "temple", placeType: "temple", tags: ["surrounding"] },
  { match: /thondamanadu/i, name: "Sri Sridevi Bhudevi Sametha Thondamanadu Temple", area: "surrounding", target: "place", category: "temple", placeType: "temple", tags: ["surrounding"] },
  { match: /silathoranam|sila thoranam/i, name: "Natural Arch, Tirumala hills (Silathoranam)", area: "tirumala", target: "place", category: "natural_arch", placeType: "natural_arch", tags: ["tirumala"] },
  { match: /venkateswara temple, tirumala|^venkateswara temple$/i, name: "Sri Venkateswara Swamy Temple, Tirumala", area: "tirumala", target: "place", category: "temple", placeType: "temple", tags: ["tirumala"] },
  { match: /padmavathi temple/i, name: "Sri Padmavathi Ammavari Temple, Tiruchanur", area: "tiruchanur", target: "place", category: "temple", placeType: "temple", tags: ["surrounding-corridor"] },
  { match: /chandragiri fort/i, name: "Chandragiri Fort (Raja Mahal & Rani Mahal)", area: "chandragiri", target: "place", category: "fort", placeType: "fort", tags: ["surrounding-corridor"] },
  { match: /talakona/i, name: "Talakona Waterfall", area: "surrounding", target: "place", category: "waterfall", placeType: "waterfall", tags: ["surrounding"] },
  { match: /kalyani dam/i, name: "Kalyani Dam", area: "surrounding", target: "place", category: "other", placeType: "other", tags: ["surrounding"] },
  { match: /horsley hills/i, name: "Horsley Hills", area: "surrounding", target: "place", category: "other", placeType: "other", tags: ["surrounding"] },
  { match: /sri venkateswara national park/i, name: "Sri Venkateswara National Park", area: "surrounding", target: "place", category: "other", placeType: "other", tags: ["nature", "surrounding"] },
  { match: /deer park/i, name: "Deer Park, Alipiri", area: "tpt-central", target: "place", category: "other", placeType: "other", tags: ["nature"] },
  { match: /sri venkateswara zoological park/i, name: "Sri Venkateswara Zoological Park, Tirupati", area: "tpt-central", target: "place", category: "zoo", placeType: "zoo", tags: [] },
  { match: /govindaraja temple, tirupati/i, name: "Sri Govindaraja Swamy Temple, Tirupati", area: "tpt-central", target: "place", category: "temple", placeType: "temple", tags: [] },
  { match: /kapila theertham/i, name: "Sri Kapileswara Swamy Temple (Kapila Theertham)", area: "tpt-central", target: "place", category: "temple", placeType: "temple", tags: [] },
  /* ---- batch-2 official pages (PlacesatTirumala / S.V. Museum / RestHouses / MoreTemples) ---- */
  { match: /sri venkateswara temple/i, name: "Sri Venkateswara Swamy Temple, Tirumala", area: "tirumala", target: "place", category: "temple", placeType: "temple", tags: ["tirumala"] },
  { match: /varaha swam(i|y) temple/i, name: "Sri Varahaswamy Temple, Tirumala", area: "tirumala", target: "place", category: "temple", placeType: "temple", tags: ["tirumala"] },
  { match: /^sri anjaneyaswami temple$/i, name: "Sri Anjaneyaswami Temple, Tirumala", area: "tirumala", target: "place", category: "temple", placeType: "temple", tags: ["tirumala"] },
  { match: /dhyana jnana mandiram/i, name: "Sri Venkateswara Museum, Tirumala", area: "tirumala", target: "place", category: "other", placeType: "other", tags: ["museum", "tirumala"] },
  /* TTD rest houses in Tirumala (official rates page) — pilgrim accommodation */
  { match: /^ampro rest house$/i, name: "Ampro Rest House, Tirumala", area: "tirumala", target: "place", category: "hotel", placeType: "hotel", tags: ["pilgrim_accommodation", "tirumala", "ttd"] },
  { match: /^bela kuteeram/i, name: "Bela Kuteeram, Tirumala", area: "tirumala", target: "place", category: "hotel", placeType: "hotel", tags: ["pilgrim_accommodation", "tirumala", "ttd"] },
  { match: /^gayathri sadan/i, name: "Gayathri Sadan, Tirumala", area: "tirumala", target: "place", category: "hotel", placeType: "hotel", tags: ["pilgrim_accommodation", "tirumala", "ttd"] },
  { match: /^hari sadan guest house/i, name: "Hari Sadan Guest House, Tirumala", area: "tirumala", target: "place", category: "hotel", placeType: "hotel", tags: ["pilgrim_accommodation", "tirumala", "ttd"] },
  { match: /hill view cottages/i, name: "Hill View Cottages, Tirumala", area: "tirumala", target: "place", category: "hotel", placeType: "hotel", tags: ["pilgrim_accommodation", "tirumala", "ttd"] },
  { match: /^indira rest house/i, name: "Indira Rest House, Tirumala", area: "tirumala", target: "place", category: "hotel", placeType: "hotel", tags: ["pilgrim_accommodation", "tirumala", "ttd"] },
  { match: /^jagannadha bhavan/i, name: "Jagannadha Bhavan, Tirumala", area: "tirumala", target: "place", category: "hotel", placeType: "hotel", tags: ["pilgrim_accommodation", "tirumala", "ttd"] },
  { match: /^karam nivas$/i, name: "Karam Nivas, Tirumala", area: "tirumala", target: "place", category: "hotel", placeType: "hotel", tags: ["pilgrim_accommodation", "tirumala", "ttd"] },
  { match: /^lakshmi nivas$/i, name: "Lakshmi Nivas, Tirumala", area: "tirumala", target: "place", category: "hotel", placeType: "hotel", tags: ["pilgrim_accommodation", "tirumala", "ttd"] },
  { match: /^rajyalakshmi guest house/i, name: "RajyaLakshmi Guest House, Tirumala", area: "tirumala", target: "place", category: "hotel", placeType: "hotel", tags: ["pilgrim_accommodation", "tirumala", "ttd"] },
  { match: /^sp guest house/i, name: "SP Guest House, Tirumala", area: "tirumala", target: "place", category: "hotel", placeType: "hotel", tags: ["pilgrim_accommodation", "tirumala", "ttd"] },
  { match: /^srinikethan/i, name: "Srinikethan, Tirumala", area: "tirumala", target: "place", category: "hotel", placeType: "hotel", tags: ["pilgrim_accommodation", "tirumala", "ttd"] },
  { match: /^srinivasa nilayam/i, name: "Srinivasa Nilayam, Tirumala", area: "tirumala", target: "place", category: "hotel", placeType: "hotel", tags: ["pilgrim_accommodation", "tirumala", "ttd"] },
  { match: /^venkata vijayam guest house/i, name: "Venkata Vijayam Guest House, Tirumala", area: "tirumala", target: "place", category: "hotel", placeType: "hotel", tags: ["pilgrim_accommodation", "tirumala", "ttd"] },
  { match: /^vidya sadan$/i, name: "Vidya Sadan, Tirumala", area: "tirumala", target: "place", category: "hotel", placeType: "hotel", tags: ["pilgrim_accommodation", "tirumala", "ttd"] },
  { match: /sri venkateswara guest house corner suites/i, name: "Sri Venkateswara Guest House, Tirumala", area: "tirumala", target: "place", category: "hotel", placeType: "hotel", tags: ["pilgrim_accommodation", "tirumala", "ttd"] },
  { match: /^sri venkateswara guest house$/i, name: "Sri Venkateswara Guest House, Tirupati", area: "tpt-central", target: "place", category: "hotel", placeType: "hotel", tags: ["pilgrim_accommodation", "ttd"] },
  { match: /narayanagiri guest house - i/i, name: "Narayanagiri Guest House, Tirumala", area: "tirumala", target: "place", category: "hotel", placeType: "hotel", tags: ["pilgrim_accommodation", "tirumala", "ttd"] },
  { match: /narayanagiri guest house - ii/i, name: "Narayanagiri Guest House, Tirumala", area: "tirumala", target: "place", category: "hotel", placeType: "hotel", tags: ["pilgrim_accommodation", "tirumala", "ttd"] },
  { match: /narayanagiri guest house - iii/i, name: "Narayanagiri Guest House, Tirumala", area: "tirumala", target: "place", category: "hotel", placeType: "hotel", tags: ["pilgrim_accommodation", "tirumala", "ttd"] },
  { match: /srivari kuteer guest house/i, name: "Srivari Kuteer Guest House, Tirumala", area: "tirumala", target: "place", category: "hotel", placeType: "hotel", tags: ["pilgrim_accommodation", "tirumala", "ttd"] },
  { match: /surapuram thota cottages/i, name: "Surapuram Thota Cottages, Tirumala", area: "tirumala", target: "place", category: "hotel", placeType: "hotel", tags: ["pilgrim_accommodation", "tirumala", "ttd"] },
  { match: /^alwar tank cottages$/i, name: "Alwar Tank Cottages, Tirumala", area: "tirumala", target: "place", category: "hotel", placeType: "hotel", tags: ["pilgrim_accommodation", "tirumala", "ttd"] },
  { match: /alwar tank cottage no\. 99/i, name: "Alwar Tank Cottages, Tirumala", area: "tirumala", target: "place", category: "hotel", placeType: "hotel", tags: ["pilgrim_accommodation", "tirumala", "ttd"] },
  { match: /anjanadri nagar cottages/i, name: "Anjanadri Nagar Cottages, Tirumala", area: "tirumala", target: "place", category: "hotel", placeType: "hotel", tags: ["pilgrim_accommodation", "tirumala", "ttd"] },
  { match: /garudadri nagar cottages/i, name: "Garudadri Nagar Cottages, Tirumala", area: "tirumala", target: "place", category: "hotel", placeType: "hotel", tags: ["pilgrim_accommodation", "tirumala", "ttd"] },
  { match: /mangala bavi cottages/i, name: "Mangala Bavi Cottages, Tirumala", area: "tirumala", target: "place", category: "hotel", placeType: "hotel", tags: ["pilgrim_accommodation", "tirumala", "ttd"] },
  { match: /ram bagicha guest house - i/i, name: "Ram Bagicha Guest House, Tirumala", area: "tirumala", target: "place", category: "hotel", placeType: "hotel", tags: ["pilgrim_accommodation", "tirumala", "ttd"] },
  { match: /ram bagicha guest house - ii/i, name: "Ram Bagicha Guest House, Tirumala", area: "tirumala", target: "place", category: "hotel", placeType: "hotel", tags: ["pilgrim_accommodation", "tirumala", "ttd"] },
  { match: /ram bagicha guest house - iii/i, name: "Ram Bagicha Guest House, Tirumala", area: "tirumala", target: "place", category: "hotel", placeType: "hotel", tags: ["pilgrim_accommodation", "tirumala", "ttd"] },
  { match: /sanku mitta cottages/i, name: "Sanku Mitta Cottages, Tirumala", area: "tirumala", target: "place", category: "hotel", placeType: "hotel", tags: ["pilgrim_accommodation", "tirumala", "ttd"] },
  { match: /seshadri nagar cottages/i, name: "Seshadri Nagar Cottages, Tirumala", area: "tirumala", target: "place", category: "hotel", placeType: "hotel", tags: ["pilgrim_accommodation", "tirumala", "ttd"] },
  { match: /^tb cottages$/i, name: "TB Cottages, Tirumala", area: "tirumala", target: "place", category: "hotel", placeType: "hotel", tags: ["pilgrim_accommodation", "tirumala", "ttd"] },
  { match: /valley view cottages/i, name: "Valley View Cottages, Tirumala", area: "tirumala", target: "place", category: "hotel", placeType: "hotel", tags: ["pilgrim_accommodation", "tirumala", "ttd"] },
  /* MoreTemples page — Tirupati-region TTD-managed temples (evidence-quoted) */
  { match: /prasanna venkateswara.*kosuvari|kosuvari palle/i, name: "Sri Prasanna Venkateswara Swamy Temple, Kosuvari Palle", area: "surrounding", target: "place", category: "temple", placeType: "temple", tags: ["surrounding"] },
  { match: /konetiraya/i, name: "Sri Konetiraya Swamy Temple, Keelapatla", area: "surrounding", target: "place", category: "temple", placeType: "temple", tags: ["surrounding"] },
  { match: /kalyana venkateswara.*narayanavanam/i, name: "Sri Kalyana Venkateswara Swamy Temple, Narayanavanam", area: "surrounding", target: "place", category: "temple", placeType: "temple", tags: ["surrounding"] },
  { match: /vedanarayana/i, name: "Sri Vedanarayana Swamy Temple, Nagalapuram", area: "surrounding", target: "place", category: "temple", placeType: "temple", tags: ["surrounding"] },
  { match: /venugopala/i, name: "Sri Venugopala Swamy Temple, Karvetinagaram", area: "surrounding", target: "place", category: "temple", placeType: "temple", tags: ["surrounding"] },
  { match: /karivarada raja/i, name: "Sri Karivarada Raja Swamy Temple, Satravada", area: "surrounding", target: "place", category: "temple", placeType: "temple", tags: ["surrounding"] },
  { match: /kodandarama swamy temple, tirupati|kodanda ramaswamy/i, name: "Sri Kodanda Ramaswamy Temple, Tirupati", area: "tpt-central", target: "place", category: "temple", placeType: "temple", tags: [] },
  { match: /kari manikya/i, name: "Sri Kari Manikya Swamy Temple, Nagari", area: "surrounding", target: "place", category: "temple", placeType: "temple", tags: ["surrounding"] },
  { match: /lakshmi narasimha swamy.*tarigonda|narasimha swamy temple, tarigonda/i, name: "Sri Lakshmi Narasimha Swamy Temple, Tarigonda", area: "surrounding", target: "place", category: "temple", placeType: "temple", tags: ["surrounding"] },
];

let officialAdded = 0;
for (const src of official.sources) {
  if (src.httpStatus !== 200) continue;
  for (const n of src.extracted ?? []) {
    const map = OFFICIAL_NAME_MAP.find((m) => m.match.test(n.name));
    if (!map) continue;
    const key = `${map.area}::${norm(map.name)}`;
    const ex = curated.get(key);
    if (ex) {
      ex.officialSources = ex.officialSources ?? [];
      ex.officialSources.push({ url: src.sourceUrl, quote: n.verbatimQuote });
      if (ex.tier === "T3") ex.tier = "T2";
      continue;
    }
    const b11 = batch011Hit(map.name);
    curated.set(key, {
      key, name: map.name, rawNames: [n.name], nameCleaned: false,
      area: map.area, localityHint: null, group: CATEGORY_TO_GROUP[map.category] ?? "attractions", target: map.target,
      category: map.category, placeType: map.placeType, tags: map.tags,
      sourceUrl: src.sourceUrl, sourceKind: "official",
      verifyAreaConfirmed: null, verifyAddressEvidence: null,
      geocode: { lat: null, lng: null, displayName: null },
      tier: "T2", existingSet: b11 ? "batch-011" : "new", existingSetId: b11,
      dupOf: null, dupReason: null, status: "curated",
      officialSources: [{ url: src.sourceUrl, quote: n.verbatimQuote }],
      sources: [{ url: src.sourceUrl, kind: "official", title: n.name }],
    });
    officialAdded++;
  }
}

/* ---- within-set duplicate marking (same normalized name, different key) ---- */

const byNorm = new Map<string, string>();
for (const [key, c] of curated) {
  if (c.status !== "curated") continue;
  const n = `${c.target}::${norm(c.name)}`;
  const first = byNorm.get(n);
  if (first && first !== key) {
    const a = curated.get(first)!;
    c.status = "duplicate";
    c.dupOf = a.name;
    c.dupReason = `same normalized name "${c.name}" already curated under ${a.area} (possible branch vs duplicate — needs review)`;
    curationLog.push({ raw: c.rawNames[0], area: c.area, action: "duplicate", reason: c.dupReason });
  } else {
    byNorm.set(n, key);
  }
}

/* ---- emit ---- */

const rows = Array.from(curated.values());
const active = rows.filter((r) => r.status === "curated");
const summary = {
  curatedOn: new Date().toISOString().slice(0, 10),
  totalCandidatesIn: ws.summary.total,
  curated: active.length,
  duplicatesMarked: rows.length - active.length,
  dropped: curationLog.filter((l) => l.action === "dropped").length,
  officialCandidatesAdded: officialAdded,
  byTier: active.reduce<Record<string, number>>((a, r) => ((a[r.tier] = (a[r.tier] ?? 0) + 1), a), {}),
  byArea: active.reduce<Record<string, number>>((a, r) => ((a[r.area] = (a[r.area] ?? 0) + 1), a), {}),
  byCategory: active.reduce<Record<string, number>>((a, r) => ((a[r.category] = (a[r.category] ?? 0) + 1), a), {}),
  byExistingSet: active.reduce<Record<string, number>>((a, r) => ((a[r.existingSet] = (a[r.existingSet] ?? 0) + 1), a), {}),
  geocoded: active.filter((r) => r.geocode.lat != null).length,
  note: "tiers are DOC-LEVEL evidence grades; DB rows always import as verification_status='unverified' per plan §3",
};

writeFileSync(join(WS, "tirupati-master-curated.json"), JSON.stringify({ summary, rows, curationLog }, null, 2));
console.log(JSON.stringify(summary, null, 1));
