/**
 * Foodie — TIRUPATI BATCH-5 queue assessment (owner-directed 2026-10-29).
 *
 * Phase A+B of Batch-5: manually assess the 133 genuinely-new leads in
 * evidence/tirupati-master/review-queue-new-names.json using their exact
 * quotations and source URLs, then crossmatch every decision against the
 * existing inventory + pending batches 011–014 + the queue's own weak-match
 * list. NO network access in this phase — decisions are anchored on (a) the
 * lead quotes as captured, and (b) evidence files already on disk (Wikipedia
 * article extractions, saved tirumala.org pages).
 *
 * Decision vocabulary (auditable, one per lead, recorded with reason):
 *   accept                → becomes a Batch-5 new candidate (dedupe-clean,
 *                           evidence adequate; verification_status stays
 *                           UNVERIFIED — an assessment never self-verifies)
 *   corroborate-existing  → name-drift/alias of an existing inventory or
 *                           pending-batch record; recorded as evidence for
 *                           THAT record, never as a new row
 *   reject-generic        → not a place (concept/org/person/festival/ritual/
 *                           deity/unit-category row)
 *   reject-out-of-scope   → real place, outside Tirupati/Tirumala intended
 *                           geographic scope (name itself locates it outside)
 *   ambiguous-keep-queue  → plausibly real/in-scope but quote junk or
 *                           insufficient; STAYS in the review queue
 *
 * Honesty contract:
 *   * every accept/corroboration carries source URL + verbatim quote;
 *   * review-queue entries are NOT counted as inventory records anywhere;
 *   * navbox listings alone are not accepted as evidence for a new row;
 *   * nothing is fetched, nothing is pushed, no production SQL is executed.
 *
 * Usage: bun scripts/foodie-enrichment/batch5-assess-queue.ts
 */

import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const HERE = dirname(fileURLToPath(import.meta.url));
const EV = join(HERE, "evidence", "tirupati-master");
const B5 = join(EV, "batch5");
mkdirSync(B5, { recursive: true });
const RETRIEVED = new Date().toISOString().slice(0, 10);

/* ------------------------------------------------------------------ */
/* Load inputs                                                         */
/* ------------------------------------------------------------------ */

type Lead = {
  name: string;
  area: string;
  kind: string;
  url: string;
  pageTitle: string;
  verbatimQuote: string;
  areaEvidence: string;
  placeTokenInName: boolean;
  proximityInQuote: boolean;
  reviewPriority: string;
};

const queue = JSON.parse(readFileSync(join(EV, "review-queue-new-names.json"), "utf8"));
const leads: Lead[] = queue.genuinelyNew;
if (leads.length !== 133) {
  console.error(`FATAL: expected 133 leads, found ${leads.length} — queue changed under Batch-5; aborting.`);
  process.exit(1);
}

/* inventory names (parsed from the generated inventory doc) */
const invMd = readFileSync(join(HERE, "..", "..", "docs", "tirupati-place-inventory.md"), "utf8");
const inventoryNames: string[] = [];
for (const m of invMd.matchAll(/^\| ([^|]+) \| (VERIFIED|PARTIALLY VERIFIED|UNVERIFIED|AMBIGUOUS)/gm)) {
  inventoryNames.push(m[1].trim());
}

/* pending batch canonical names (parsed from committed review-candidate SQL) */
const batchSqls = ["insert-batch-011-p4-places.sql", "insert-batch-012-tptm-master.sql", "insert-batch-013-tptm-b2.sql", "insert-batch-014-tptm-b3.sql"];
const batchNames: string[] = [];
const RC = join(HERE, "..", "..", "supabase", "review-candidates");
for (const f of batchSqls) {
  try {
    const sql = readFileSync(join(RC, f), "utf8");
    for (const m of sql.matchAll(/^    '([^']+)',$/gm)) batchNames.push(m[1]);
  } catch {
    console.error(`FATAL: batch SQL missing: ${f}`);
    process.exit(1);
  }
}

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
const invNorms = new Set(inventoryNames.map(norm));
const batchNorms = new Set(batchNames.map(norm));

/* fail-loud helper: an ACCEPT must not collide with inventory/batches */
function assertNoCollision(name: string, extraAliases: string[] = []) {
  const all = [name, ...extraAliases].map(norm);
  for (const n of all) {
    if (invNorms.has(n)) throw new Error(`ACCEPT collides with inventory: ${name}`);
    if (batchNorms.has(n)) throw new Error(`ACCEPT collides with pending batch: ${name}`);
  }
}

/* ------------------------------------------------------------------ */
/* Explicit decision table — ALL 133 leads, keyed by exact lead name   */
/* (auditable manual assessment; each entry = human-set decision)      */
/* ------------------------------------------------------------------ */

type Decision = "accept" | "corroborate-existing" | "reject-generic" | "reject-out-of-scope" | "ambiguous-keep-queue";

const TABLE: Record<string, { decision: Decision; reason: string; evidence?: string; corroborationOf?: string; aliases?: string[] }> = {
  /* ---- accepted candidate (merged candidate record built below) ---- */
  "Seshachalam Hills": { decision: "accept", reason: "the lead's own quote is image-thumbnail junk, but THREE already-stored Wikipedia article extractions give clean locality sentences ('spread over the Seshachalam hills of Tirupati district', 'Sapthagiri in the Seshachalam Hills of the Eastern Ghats', 'foot of the Tirumala hills, which are part of Seshachalam Hills') — accepted as ONE natural-area candidate with those stored quotes; lead #30 (biosphere) merges into it" },

  /* ---- HIGH-priority leads (assessed first) ---- */
  "Sri Kodandaramaswami Temple": { decision: "corroborate-existing", corroborationOf: "Sri Kodanda Ramaswamy Temple, Tirupati", reason: "HIGH lead; quote lists it among Tirupati temples (with Kalyana Venkateswara Temple, Srinivasamangapuram + Thathayyaguntta Gangamma Temple); inventory already holds 'Sri Kodanda Ramaswamy Temple, Tirupati' (PARTIALLY VERIFIED, batch-013 queued) — name-drift spelling, same temple" },
  "Zoo Park": { decision: "corroborate-existing", corroborationOf: "Sri Venkateswara Zoological Park, Tirupati", reason: "HIGH lead; quote itself names 'Sri Venkateswara Zoological Park in Tirupati ... largest zoo park in Asia ... 5532 acres' — generic alias of the existing VERIFIED inventory record" },
  "Hindu temple": { decision: "reject-generic", reason: "HIGH lead; quote is the apposition '— also known as ... — is a Hindu temple located in the hills of Tirumala' — generic descriptive term extracted from the Tirumala Venkateswara Temple lede; the temple itself is already in inventory; not a distinct place" },
  "Srikalahasti Temple": { decision: "corroborate-existing", corroborationOf: "Srikalahasteeswara temple", reason: "HIGH lead; quote names 'Srikalahasteeswara Temple ... situated at Srikalahasti which is 38 km from T[irupati]' — inventory already holds 'Srikalahasteeswara temple'; area tag 'tirumala' on the lead is misfiled (Srikalahasti is its own town 38 km away)" },
  "Kapileshwar Temple, Bihar": { decision: "reject-out-of-scope", reason: "HIGH lead; canonical name itself locates the temple in BIHAR — the Wikipedia Kapila Theertham article's nav/section listing pulled it past the locality gate; outside Tirupati/Tirumala scope" },

  /* ---- Wikipedia-lead duplicates/corroborations of inventory records ---- */
  "Padmavathi Temple, Tiruchanur": { decision: "corroborate-existing", corroborationOf: "Sri Padmavathi Ammavari Temple, Tiruchanur", reason: "quote ('The tank behind Padmavathi Temple, Tiruchanur has Padma Pushkarini, where Chakra Snanam is undertaken') evidences the SAME temple already in inventory; the Padma Pushkarini tank detail strengthens the existing record" },
  "Padmavathi Temple": { decision: "corroborate-existing", corroborationOf: "Sri Padmavathi Ammavari Temple, Tiruchanur", reason: "same temple as inventory record; lead quote is an image-thumbnail (junk) so evidence quality is weak — alias recorded, no new row" },
  "Seshachalam Hills biosphere": { decision: "corroborate-existing", corroborationOf: "Seshachalam Hills (Batch-5 accept, same subject)", reason: "same geographic feature as lead #0; lead quote is reference-cite HTML (junk); the biosphere-reserve status is recorded in the merged candidate evidence, not a separate row" },
  "Vedanarayana Temple, Nagalapuram": { decision: "corroborate-existing", corroborationOf: "Sri Vedanarayana Swamy Temple, Nagalapuram", reason: "inventory already holds 'Sri Vedanarayana Swamy Temple, Nagalapuram' (PARTIALLY VERIFIED, batch-013 queued); lead quote is navbox context — name-drift, no new row" },
  "Nagalapuram mandal": { decision: "corroborate-existing", corroborationOf: "Sri Vedanarayana Swamy Temple, Nagalapuram", reason: "clean quote ('Nagalapuram is a village and headquarters of Nagalapuram mandal in Tirupati district') strengthens the EXISTING Nagalapuram temple record's locality; the village itself is not kept as a separate row (same settlement as the temple record's locality)" },
  "Nerabailu": { decision: "corroborate-existing", corroborationOf: "Talakona Waterfall", reason: "clean quote ('Talakona is located in Nerabailu village in Yerravaripalem Mandal of ...') independently confirms the locality of the existing Talakona Waterfall record" },
  "Yerravaripalem": { decision: "ambiguous-keep-queue", reason: "mandal context appears inside the Talakona lede quote; no independent place evidence of its own — context only; stays in queue" },
  "Alamelu Mangapuram": { decision: "corroborate-existing", corroborationOf: "Sri Padmavathi Ammavari Temple, Tiruchanur", reason: "quote ('Tiruchanur (also known as Alamelu Mangapuram or Alarmel Mangaipuram) is a suburb and outgrowth ...') — alternative NAME of the existing Tiruchanur locality; name-drift guard: recorded as alias, never a duplicate row" },
  "Srikalahasti": { decision: "corroborate-existing", corroborationOf: "Srikalahasteeswara temple", reason: "same subject as the Srikalahasteeswara temple inventory record; lead quote is reference-cite HTML (junk) — name-only corroboration, flagged weak" },
  "Puttur, Andhra Pradesh": { decision: "ambiguous-keep-queue", reason: "clean quote ('Tirupati is surrounded by Srikalahasti towards the east, Puttur towards the south, Pakala towards the west ...') evidences a real surrounding town in Tirupati district, but a bare town record has no venue of its own yet; stays in queue pending a specific place/venue" },
  /* NOTE: "Alipiri" is not a queue lead — it appears in stored Wikipedia
     extractions only; the foothill place is Batch-5 accepted via the official
     TTD nav as Srivari Padalamandapam Temple, Tirupati (see OFFICIAL_ACCEPTS). */

  /* ---- TTD accommodation rate-table leads (official pages, batch-4) ---- */
  "Alwar Tank Cottage No.": { decision: "corroborate-existing", corroborationOf: "Alwar Tank Cottages, Tirumala", reason: "official rate row '1 | Alwar Tank Cottage No. 1 | 200.00' — mangled extraction of the SAME venue already queued in batch-013 as 'Alwar Tank Cottages, Tirumala'" },
  "Ampro Guest House (A/C)": { decision: "corroborate-existing", corroborationOf: "Ampro Rest House, Tirumala", reason: "official rate row on the VarahaSwami Guest House page; batch-013 already queues the same property as 'Ampro Rest House, Tirumala' — rate-table name variant" },
  "Hill View Cottages (Ordinary)": { decision: "corroborate-existing", corroborationOf: "Hill View Cottages, Tirumala", reason: "official rate row; batch-013 already queues 'Hill View Cottages, Tirumala'" },
  "Hill View Deluxe Cottages Big Suites Small Suites": { decision: "corroborate-existing", corroborationOf: "Hill View Cottages, Tirumala", reason: "mangled multi-row extraction (big/small suite price columns) of the Hill View Cottages campus already queued in batch-013; not a distinct venue" },
  "Sri Padmavathi Guest House": { decision: "corroborate-existing", corroborationOf: "SP Guest House, Tirumala", reason: "official page heading; 'SP' in the batch-013 canonical 'SP Guest House, Tirumala' IS Sri Padmavathi — same property, name-drift guard applies" },
  "Travellers Bungalow": { decision: "corroborate-existing", corroborationOf: "TB Cottages, Tirumala", reason: "official rate row; 'TB' in the batch-013 canonical 'TB Cottages, Tirumala' IS Travellers Bungalow — same property" },
  "Travellers Bungalow Cottages": { decision: "corroborate-existing", corroborationOf: "TB Cottages, Tirumala", reason: "same property as above, extracted from the Sri Venkateswara Guest House rate table" },
  "VarahaSwami Guest House": { decision: "accept", reason: "official TTD page heading + rate table (tirumala.org/varahaswamiguesthouse.aspx) for a named TTD guest house in Tirumala; NOT in inventory or batches 011–014 (the Varahaswamy TEMPLE batch-012 record is a different venue type); Batch-5 candidate (stays), verification_status UNVERIFIED" },
  "Indira Guest House A/C( 4 suites )": { decision: "accept", reason: "official TTD rate row ('06. | Indira Guest House A/C( 4 suites ) | 2000.00') for a distinct named TTD accommodation property in Tirumala; absent from inventory and batches 011–014; Batch-5 candidate (stays), UNVERIFIED" },
  "Outside Cottages": { decision: "reject-generic", reason: "rate-table UNIT CATEGORY (cottages outside the Sri Padmavathi Guest House campus), not a distinct named venue; inventing a place row from a unit label would violate the no-invention rule" },
  "Special Type Cottage A/C No-5 Special Type Cottage A/C No-12 Special Type Cottage A/C No-13 Special Type Cottages A/C (17) HRG 'A' Portion HRG 'B' Portion MBC Cottages (Number:20 and 22)": { decision: "reject-generic", reason: "mangled multi-row extraction of cottage UNIT categories/numbers on the Marriage Halls & Cottages rate table — no distinct venue name present" },

  /* ---- Queue leads that need targeted re-verification (kept queued this pass) ---- */
  "Vaikuntam Queue Complex": { decision: "ambiguous-keep-queue", reason: "real named Tirumala queue-complex facility, but the lead quote is image-thumbnail HTML (no locality text); targeted re-verification may upgrade it later — stays in queue THIS pass" },
  "Siddheswara Swamy Temple": { decision: "ambiguous-keep-queue", reason: "temple inside the Talakona forest (plausibly in-scope) but the lead quote is reference-cite HTML (junk); stays in queue pending dedicated evidence" },

  /* ---- Wikipedia-lead out-of-scope navbox temples (other states) ---- */
  "Kurmanathaswamy temple, Srikurmam": { decision: "reject-out-of-scope", reason: "Srikakulam district (navbox)" },
  "Sri Ranganathaswamy Temple, Srirangam": { decision: "reject-out-of-scope", reason: "Tamil Nadu (navbox)" },
  "Amarnath Temple": { decision: "reject-out-of-scope", reason: "Jammu & Kashmir (navbox)" },
  "Mahabaleshwar Temple, Gokarna": { decision: "reject-out-of-scope", reason: "Karnataka (navbox)" },
  "Kandariya Mahadeva Temple": { decision: "reject-out-of-scope", reason: "Khajuraho, Madhya Pradesh (navbox)" },
  "Lingaraja Temple": { decision: "reject-out-of-scope", reason: "Bhubaneswar, Odisha (navbox)" },
  "Brihadisvara Temple, Thanjavur": { decision: "reject-out-of-scope", reason: "Tamil Nadu (navbox)" },
  "Thyagaraja Temple, Tiruvarur": { decision: "reject-out-of-scope", reason: "Tamil Nadu (navbox)" },
  "Vadakkunnathan Temple": { decision: "reject-out-of-scope", reason: "Thrissur, Kerala (navbox)" },
  "Vaikom Sree Mahadeva Temple": { decision: "reject-out-of-scope", reason: "Kerala (navbox)" },
  "Tulsi Ghat": { decision: "reject-out-of-scope", reason: "Varanasi (samadhi navbox)" },
  "Somnath Temple": { decision: "reject-out-of-scope", reason: "Gujarat (navbox)" },
  "Raja Rajeswara Temple, Vemulawada": { decision: "reject-out-of-scope", reason: "Rajanna Sircilla, Telangana (navbox)" },
  "Kanaka Durga Temple": { decision: "reject-out-of-scope", reason: "Vijayawada (navbox)" },
  "Sri Lakshmi Narasimha Swamy Temple, Yadadri": { decision: "reject-out-of-scope", reason: "Yadadri Bhuvanagiri, Telangana (navbox)" },
  "Arasavalli Sun Temple": { decision: "reject-out-of-scope", reason: "Srikakulam district (navbox)" },
  "Devipuram": { decision: "reject-out-of-scope", reason: "Visakhapatnam (navbox)" },
  "Kali Temple, Visakhapatnam": { decision: "reject-out-of-scope", reason: "Visakhapatnam (navbox)" },
  "Nookambika Temple": { decision: "reject-out-of-scope", reason: "Anakapalli/Visakhapatnam (navbox)" },
  "Simhachalam Temple": { decision: "reject-out-of-scope", reason: "Visakhapatnam (navbox)" },
  "Varaha Lakshmi Narasimha temple, Simhachalam": { decision: "reject-out-of-scope", reason: "Visakhapatnam (navbox)" },
  "Somarama": { decision: "reject-out-of-scope", reason: "Bhimavaram, West Godavari (navbox)" },
  "Kotasattemma Temple, Nidadavolu": { decision: "reject-out-of-scope", reason: "East/West Godavari (navbox)" },
  "Ksheerarama": { decision: "reject-out-of-scope", reason: "Palakollu, West Godavari (navbox)" },
  "Maddi Anjaneya Temple": { decision: "reject-out-of-scope", reason: "Konaseema, Godavari region (navbox)" },
  "Veerabhadra Temple, Pattiseema": { decision: "reject-out-of-scope", reason: "West Godavari (navbox)" },
  "Bhu Varaha Swamy temple": { decision: "reject-out-of-scope", reason: "Srimushnam, Tamil Nadu — the TIRUMALA Sri Bhu Varaha Swamy Temple is a DIFFERENT property already covered ('Sri Varahaswamy Temple, Tirumala' inventory record + batch-013 row); navbox namesake" },
  "Vanamamalai Perumal Temple": { decision: "reject-out-of-scope", reason: "Nanguneri, Tamil Nadu (navbox)" },
  "Mahalakshmi Temple, Kallur": { decision: "reject-out-of-scope", reason: "Karnataka (navbox)" },
  "Mahalakshmi Temple, Kolhapur": { decision: "reject-out-of-scope", reason: "Maharashtra (navbox)" },
  "Sri Lakshmi Narayani Golden Temple": { decision: "reject-out-of-scope", reason: "Vellore, Tamil Nadu (navbox)" },
  "Satyanarayana Temple, Annavaram": { decision: "reject-out-of-scope", reason: "Kakinada district (navbox)" },
  "Lakshmi Narasimha Temple, Antarvedi": { decision: "reject-out-of-scope", reason: "Konaseema, Godavari (navbox)" },
  "Bhavanarayana Temple, Bapatla": { decision: "reject-out-of-scope", reason: "Bapatla, Bapatla district (navbox)" },
  "Kodandarama Temple, Buchireddipalem": { decision: "reject-out-of-scope", reason: "Nellore district (navbox)" },
  "Kodandarama Temple, Gollala Mamidada": { decision: "reject-out-of-scope", reason: "East Godavari (navbox)" },
  "Venugopalaswamy Temple, Karvetinagaram": { decision: "ambiguous-keep-queue", reason: "Karvetinagaram IS a mandal in Tirupati district (~50 km) and the temple is real, but the lead evidence is a Venkateswara-temples NAVBOX listing with no locality sentence — per protocol a navbox alone does not clear a new row; stays in queue pending dedicated evidence" },
  "Konetirayala Temple, Keelapatla": { decision: "reject-out-of-scope", reason: "Keelapatla, Palamaner, Chittoor district ~100 km (navbox)" },
  "Koulutla Chenna Kesava Temple": { decision: "reject-out-of-scope", reason: "Koulutla, Kadapa district ~150 km (navbox)" },
  "Lakshmi Narasimha Temple, Mangalagiri": { decision: "reject-out-of-scope", reason: "Guntur district ~230 km (navbox)" },
  "Barehipani Falls": { decision: "reject-out-of-scope", reason: "Odisha (waterfalls navbox)" },
  "Joranda Falls": { decision: "reject-out-of-scope", reason: "Odisha (waterfalls navbox)" },
  "Kiliyur Falls": { decision: "reject-out-of-scope", reason: "Yercaud, Tamil Nadu (waterfalls navbox)" },
  "Phurlijharan": { decision: "reject-out-of-scope", reason: "Karnataka (waterfalls navbox)" },
  "Sanaghagara Waterfall": { decision: "reject-out-of-scope", reason: "Odisha (waterfalls navbox)" },
  "Chilika Lake": { decision: "reject-out-of-scope", reason: "Odisha (lakes navbox)" },
  "Kolleru Lake": { decision: "reject-out-of-scope", reason: "AP Krishna/West Godavari ~300 km (lakes navbox)" },
  "Pulicat Lake": { decision: "reject-out-of-scope", reason: "Nellore/Tamil Nadu border ~100 km (lakes navbox)" },
  "Kurudumale": { decision: "reject-out-of-scope", reason: "Karnataka (Chandragiri-article legend text; out-of-state namesake)" },
  "Mysore": { decision: "reject-out-of-scope", reason: "Karnataka (Chandragiri-article legend text)" },
  "Neelivaneswarar Temple": { decision: "reject-out-of-scope", reason: "Thirupangeeli, Tamil Nadu (Srikalahasti-article legend of eight Kailash fragments)" },
  "Thiruengoimalai Maragadachaleswarar Temple": { decision: "reject-out-of-scope", reason: "Thiruengoimalai, Tamil Nadu (same legend)" },
  "Visakhapatnam district": { decision: "reject-out-of-scope", reason: "different district (navbox)" },

  /* ---- generic / non-place leads ---- */
  "Malik Kafur": { decision: "reject-generic", reason: "historical person" },
  "World Telugu Conference": { decision: "reject-generic", reason: "event, not a place" },
  "Precambrian": { decision: "reject-generic", reason: "geological era" },
  "Organisation for Counter Terrorist Operations": { decision: "reject-generic", reason: "police unit" },
  "Andhra Pradesh Southern Power Distribution Company Limited": { decision: "reject-generic", reason: "utility company" },
  "Bharat Sanchar Nigam": { decision: "reject-generic", reason: "utility company" },
  "Tourism in Andhra Pradesh": { decision: "reject-generic", reason: "article title, not a place" },
  "Malayappa swami": { decision: "reject-generic", reason: "processional deity, not a place" },
  "Puja": { decision: "reject-generic", reason: "ritual" },
  "Gramadevata": { decision: "reject-generic", reason: "concept" },
  "Alamelu": { decision: "reject-generic", reason: "deity name fragment (Padmavathi/Alamelu Manga)" },
  "Hindu temple architecture": { decision: "reject-generic", reason: "topic" },
  "Parikrama": { decision: "reject-generic", reason: "ritual practice" },
  "UNESCO": { decision: "reject-generic", reason: "organisation" },
  "Koluvu Srinivasa": { decision: "reject-generic", reason: "daily ritual/deity of the Tirumala temple" },
  "Ugra Srinivasa": { decision: "reject-generic", reason: "deity (murti) of the Tirumala temple" },
  "Tondaiman": { decision: "reject-generic", reason: "dynasty" },
  "Murti": { decision: "reject-generic", reason: "concept" },
  "Kalpa": { decision: "reject-generic", reason: "concept (text fragment)" },
  "Shesha": { decision: "reject-generic", reason: "mythology" },
  "Saivites": { decision: "reject-generic", reason: "sect" },
  "Vaishnavites": { decision: "reject-generic", reason: "sect" },
  "Vaikhanasa": { decision: "reject-generic", reason: "ritual tradition" },
  "Agama": { decision: "reject-generic", reason: "scripture class" },
  "Naalayira Divya Prabandham": { decision: "reject-generic", reason: "hymn corpus" },
  "Golconda": { decision: "reject-generic", reason: "historical polity (Hyderabad)" },
  "Government of Andhra Pradesh": { decision: "reject-generic", reason: "government body" },
  "Narendra Modi": { decision: "reject-generic", reason: "person" },
  "Kannada": { decision: "reject-generic", reason: "language" },
  "Sanskrit": { decision: "reject-generic", reason: "language" },
  "Parakala matha": { decision: "reject-generic", reason: "monastic institution (Mysore)" },
  "Vadakalai": { decision: "reject-generic", reason: "sect" },
  "Suprabhatam#Venkateswara Suprabhatam": { decision: "reject-generic", reason: "ritual hymn" },
  "Vrishabasura?action=edit&amp;redlink=1": { decision: "reject-generic", reason: "redlinked mythology fragment (no article, no place evidence)" },
  "Annamacharya": { decision: "reject-generic", reason: "historical person (saint)" },
  "Telugu people": { decision: "reject-generic", reason: "ethnic group" },
  "Srirangam Ranganathaswamy temple": { decision: "reject-out-of-scope", reason: "Tamil Nadu (duplicate of lead #3, navbox)" },
  "Bruce's Code": { decision: "reject-generic", reason: "historical code/regulation document" },
  "ISBN": { decision: "reject-generic", reason: "citation fragment" },
  "Shiva lingam": { decision: "reject-generic", reason: "object/concept" },
  "Neighborhood": { decision: "reject-generic", reason: "generic infobox term" },
  "Suburb": { decision: "reject-generic", reason: "generic infobox term" },
  "Neighbourhood": { decision: "reject-generic", reason: "generic infobox term" },
  "Maha Shivaratri": { decision: "reject-generic", reason: "festival" },
  "Kārtika": { decision: "reject-generic", reason: "calendar month" },
  "Temple tank": { decision: "reject-generic", reason: "generic structure type" },
  "Biosphere reserve": { decision: "reject-generic", reason: "generic designation" },
  "Andhra Pradesh Government": { decision: "reject-generic", reason: "government body (quote does mention a 'Kapil Teertham Dam inside the national park' — recorded in Batch-5 notes as an un-named-venue observation, no row created)" },
  "Dam#Types": { decision: "reject-generic", reason: "generic structure type" },
  "YouTube": { decision: "reject-generic", reason: "platform (video-title citation)" },
  "Incredible India": { decision: "reject-generic", reason: "tourism brand" },
};

/* ------------------------------------------------------------------ */
/* Batch-5 candidates from ALREADY-SAVED official TTD pages            */
/* (re-examined on disk — the dead garden.aspx / theerthams.aspx shells */
/*  never delivered this content; the saved places-around page did)     */
/* ------------------------------------------------------------------ */

const OFFICIAL_PAGE = {
  file: "places-around-tirumala.html",
  url: "https://www.tirumala.org/places-around-tirumala.aspx",
  title: "Places To Visit Around Tirumala (official TTD)",
};

const MUST_VISIT_QUOTE =
  "Some of the must visit places in Tirumala are Swami Pushkarini, Sri Bhu Varaha Swamy temple, Sri Hathiramjee Mutt, Sri Bedi Anjaneya Swamy temple, Srivari Sikhara Darshanam, Sila Thoranam, Dharmagiri, Narayangiri, Papavinasanam, Akasa Ganga water falls, Temple Museum, Asthana Mandapams and Gogarbham Gardens.";
const TEERTHAM_QUOTE =
  "There are several teerthams in Tirumala, some of them are Pandava Teertham, Kumaradhara Teertham, Tumbhuru Teertham, Ramakrishna Teertham, Chakra Teertham, Vaikuntha Teertham, Sesha Teertham, Sitamma Teertham, Pasupu Teertham, Jupali Teertham, Sanaka Sanandana Teertham.";
const NAV_TEMPLES_QUOTE =
  "More Temples At Tirupathi Sri Govindarajaswami Temple Srivari Padalamandapam Temple Sri Lakshmi Narayana Swamy Temple Sri Vinayaka Swamy Temple Sri Kapliswaraswamy Temple Sri Kodandarama Swamy Temple";

/* verbatim-name → canonical candidate (dedupe-clean; verified against
 * inventory norms + batch norms at runtime below) */
const OFFICIAL_ACCEPTS: Array<{
  name: string;
  category: string;
  sourceQuote: string;
  note?: string;
}> = [
  { name: "Gogarbham Gardens, Tirumala", category: "attraction", sourceQuote: MUST_VISIT_QUOTE, note: "official TTD must-visit list; gardens/dam recreation area" },
  { name: "Dharmagiri, Tirumala", category: "attraction", sourceQuote: MUST_VISIT_QUOTE, note: "official TTD must-visit list; hill spot" },
  { name: "Narayangiri, Tirumala", category: "attraction", sourceQuote: MUST_VISIT_QUOTE, note: "official TTD must-visit list; hill spot" },
  { name: "Asthana Mandapam, Tirumala", category: "attraction", sourceQuote: MUST_VISIT_QUOTE, note: "official TTD must-visit list; TTD assembly/events hall complex" },
  { name: "Pandava Teertham, Tirumala", category: "sacred_water", sourceQuote: TEERTHAM_QUOTE },
  { name: "Kumaradhara Teertham, Tirumala", category: "sacred_water", sourceQuote: TEERTHAM_QUOTE, note: "official list also records its festival: 'Kumaradhara Magha Pournami'" },
  { name: "Tumbhuru Teertham, Tirumala", category: "sacred_water", sourceQuote: TEERTHAM_QUOTE, note: "official list also records its festival: 'Tumbhuru Phalguna Pournami'" },
  { name: "Ramakrishna Teertham, Tirumala", category: "sacred_water", sourceQuote: TEERTHAM_QUOTE, note: "official list also records its festival: 'Ramakrishna Pushya Pournami'" },
  { name: "Sesha Teertham, Tirumala", category: "sacred_water", sourceQuote: TEERTHAM_QUOTE },
  { name: "Sitamma Teertham, Tirumala", category: "sacred_water", sourceQuote: TEERTHAM_QUOTE },
  { name: "Pasupu Teertham, Tirumala", category: "sacred_water", sourceQuote: TEERTHAM_QUOTE },
  { name: "Jupali Teertham, Tirumala", category: "sacred_water", sourceQuote: TEERTHAM_QUOTE },
  { name: "Sanaka Sanandana Teertham, Tirumala", category: "sacred_water", sourceQuote: TEERTHAM_QUOTE },
  { name: "Srivari Padalamandapam Temple, Tirupati", category: "temple", sourceQuote: NAV_TEMPLES_QUOTE, note: "official TTD nav 'More Temples At Tirupathi'; the foothill temple at Alipiri where the footpath to Tirumala begins" },
  { name: "Sri Lakshmi Narayana Swamy Temple, Tirupati", category: "temple", sourceQuote: NAV_TEMPLES_QUOTE, note: "official TTD nav 'More Temples At Tirupathi' listing" },
];

/* corroborations of existing records from the same official page */
const OFFICIAL_CORROBORATIONS: Array<{ name: string; corroborationOf: string; sourceQuote: string }> = [
  { name: "Swami Pushkarini", corroborationOf: "Swami Pushkarini", sourceQuote: MUST_VISIT_QUOTE },
  { name: "Sri Hathiramjee Mutt", corroborationOf: "Sri Hathiramjee Mutt, Tirumala", sourceQuote: MUST_VISIT_QUOTE },
  { name: "Sri Bedi Anjaneya Swamy temple", corroborationOf: "Sri Bedi Anjaneya Swamy Temple, Tirumala", sourceQuote: MUST_VISIT_QUOTE },
  { name: "Sila Thoranam", corroborationOf: "Natural Arch, Tirumala hills (Silathoranam)", sourceQuote: MUST_VISIT_QUOTE },
  { name: "Papavinasanam", corroborationOf: "Papavinasam Theertham", sourceQuote: MUST_VISIT_QUOTE },
  { name: "Akasa Ganga water falls", corroborationOf: "Akasha Ganga Theertham, Tirumala", sourceQuote: MUST_VISIT_QUOTE },
  { name: "Temple Museum", corroborationOf: "Sri Venkateswara Museum, Tirumala", sourceQuote: MUST_VISIT_QUOTE },
  { name: "Chakra Teertham", corroborationOf: "Chakra Theertham", sourceQuote: TEERTHAM_QUOTE },
  { name: "Vaikuntha Teertham", corroborationOf: "Vaikuntha Teertham", sourceQuote: TEERTHAM_QUOTE },
  { name: "Sri Bhu Varaha Swamy temple", corroborationOf: "Sri Varahaswamy Temple, Tirumala", sourceQuote: MUST_VISIT_QUOTE },
  { name: "Sri Kodandarama Swamy Temple", corroborationOf: "Sri Kodanda Ramaswamy Temple, Tirupati", sourceQuote: NAV_TEMPLES_QUOTE },
  { name: "Sri Kapliswaraswamy Temple", corroborationOf: "Sri Kapileswara Swamy Temple (Kapila Theertham)", sourceQuote: NAV_TEMPLES_QUOTE },
  { name: "Sri Govindarajaswami Temple", corroborationOf: "Sri Govindaraja Swamy Temple, Tirupati", sourceQuote: NAV_TEMPLES_QUOTE },
  { name: "Sri Vinayaka Swamy Temple", corroborationOf: "Sri Vinayaka Swamy Temple", sourceQuote: NAV_TEMPLES_QUOTE },
  { name: "Srivari Sikhara Darshanam", corroborationOf: "(queue — ambiguous, see notes)", sourceQuote: MUST_VISIT_QUOTE },
];

/* Seshachalam Hills accept — clean quotes pulled from ALREADY-STORED
 * Wikipedia extractions (no network) */
const SEsha_QUOTES = [
  { article: "Sri Venkateswara National Park", quote: "The National Park is located in the Eastern Ghats spread over the Seshachalam hills of Tirupati district." },
  { article: "Tirumala", quote: "It is located atop the Venkatadri, one of the seven hills that form the Sapthagiri in the Seshachalam Hills of the Eastern Ghats." },
  { article: "Kapila Theertham", quote: "The temple stands at the entrance to a mountain cave in one of the steep and vertical faces at the foot of the Tirumala hills, which are part of Seshachalam Hills." },
];

/* ------------------------------------------------------------------ */
/* Apply the table; verify completeness + dedupe gates                 */
/* ------------------------------------------------------------------ */

const perLead: Array<{
  index: number;
  lead: Lead;
  decision: Decision;
  reason: string;
  corroborationOf?: string;
  evidenceQuality: "clean-quote" | "junk-quote" | "official-quote";
}> = [];

for (let i = 0; i < leads.length; i++) {
  const l = leads[i];
  const entry = TABLE[l.name];
  if (!entry) {
    console.error(`FATAL: lead #${i} "${l.name}" has NO decision-table entry — every lead must be manually assessed.`);
    process.exit(1);
  }
  const junk = /thumbnail|mw-ref|ref-list|srcset=|data-mw=|isbn|utman|template/.test(l.verbatimQuote.slice(0, 120));
  perLead.push({
    index: i,
    lead: l,
    decision: entry.decision,
    reason: entry.reason,
    corroborationOf: entry.corroborationOf,
    evidenceQuality: entry.decision === "accept" && entry.reason.includes("official") ? "official-quote" : junk ? "junk-quote" : "clean-quote",
  });
}

/* decision-table sanity: every TABLE key must exist in the leads */
const leadNames = new Set(leads.map((l) => l.name));
for (const k of Object.keys(TABLE)) {
  if (!leadNames.has(k)) {
    console.error(`FATAL: decision-table key "${k}" does not match any lead name — aborting (stale table).`);
    process.exit(1);
  }
}

/* dedupe gate for the 2 queue accepts */
assertNoCollision("VarahaSwami Guest House, Tirumala", ["Varaha Swami Guest House", "VarahaSwami Guest House"]);
assertNoCollision("Indira Guest House, Tirumala", ["Indira Guest House A/C"]);
assertNoCollision("Seshachalam Hills", ["Seshachalam Hills biosphere"]);

/* dedupe gate for official accepts + find existing-corroboration mismatches */
const officialAcceptsFinal: Array<{ name: string; category: string; sourceQuote: string; note?: string; area: string; areaBasis: string }> = [];
for (const c of OFFICIAL_ACCEPTS) {
  assertNoCollision(c.name);
  officialAcceptsFinal.push({ ...c, area: "tirumala", areaBasis: c.name.endsWith(", Tirupati") ? "tpt-central" : "tirumala" });
}
for (const c of [...OFFICIAL_CORROBORATIONS]) {
  if (c.corroborationOf === "(queue — ambiguous, see notes)") continue;
  const n = norm(c.corroborationOf);
  if (!invNorms.has(n)) {
    /* try loose match: corroboration target must exist in inventory, else fail loud */
    const loose = inventoryNames.find((x) => norm(x).includes(n.split(",")[0].split(" ").slice(-2).join(" ")));
    if (!loose) throw new Error(`OFFICIAL_CORROBORATION target not in inventory: ${c.corroborationOf}`);
  }
}

/* ------------------------------------------------------------------ */
/* Emit assessment artifacts                                           */
/* ------------------------------------------------------------------ */

const tally: Record<Decision, number> = { accept: 0, "corroborate-existing": 0, "reject-generic": 0, "reject-out-of-scope": 0, "ambiguous-keep-queue": 0 };
for (const p of perLead) tally[p.decision]++;

const queueAccepts = perLead
  .filter((p) => p.decision === "accept" && p.lead.name !== "Seshachalam Hills")
  .map((p) => ({
    name: p.lead.name.startsWith("VarahaSwami") ? "VarahaSwami Guest House, Tirumala" : "Indira Guest House, Tirumala",
    leadName: p.lead.name,
    area: "tirumala",
    category: "hotel",
    placeType: "accommodation",
    verificationStatus: "UNVERIFIED",
    sourceUrl: "https://www.tirumala.org/varahaswamiguesthouse.aspx",
    sourceKind: "official-ttd-rate-table",
    verbatimQuote: p.lead.verbatimQuote,
    sourcePage: p.lead.pageTitle,
    acceptanceReason: p.reason,
  }));

const assessment = {
  task: "batch-5 review-queue manual assessment",
  assessedOn: RETRIEVED,
  queueMeta: { retrievedOn: queue.retrievedOn, leadsIn: leads.length },
  tallies: tally,
  decisionVocabulary: {
    accept: "Batch-5 new candidate (dedupe-clean; verification_status stays UNVERIFIED)",
    "corroborate-existing": "evidence for an existing inventory or pending-batch record; never a new row",
    "reject-generic": "not a place (concept/org/person/festival/ritual/deity/unit-category)",
    "reject-out-of-scope": "real place outside Tirupati/Tirumala intended scope",
    "ambiguous-keep-queue": "stays in review queue; quote junk or insufficient",
  },
  perLead: perLead.map((p) => ({
    index: p.index,
    name: p.lead.name,
    leadPriority: p.lead.reviewPriority,
    leadArea: p.lead.area,
    sourceUrl: p.lead.url,
    sourcePage: p.lead.pageTitle,
    verbatimQuote: p.lead.verbatimQuote.slice(0, 400),
    decision: p.decision,
    corroborationOf: p.corroborationOf ?? null,
    evidenceQuality: p.evidenceQuality,
    reason: p.reason,
  })),
  officialPageReExamination: {
    note: "the dead garden.aspx/theerthams.aspx homepage shells never delivered gardens/teerthams content; the ALREADY-SAVED official page places-around-tirumala.html (Places To Visit Around Tirumala) lists named gardens, giris, mandapams and 11 teerthams verbatim — no new fetch was needed",
    file: OFFICIAL_PAGE.file,
    url: OFFICIAL_PAGE.url,
    newCandidates: officialAcceptsFinal,
    corroborations: OFFICIAL_CORROBORATIONS.filter((c) => c.corroborationOf !== "(queue — ambiguous, see notes)").map((c) => ({ ...c, resolvedTo: c.corroborationOf })),
    queuedAmbiguous: [{ name: "Srivari Sikhara Darshanam", reason: "official must-visit list names it, but the name denotes a darshanam (ritual viewing point); cannot confirm a distinct stationary venue — stays in queue" }],
  },
  seshachalamHills: {
    name: "Seshachalam Hills",
    decision: "accept",
    area: "tpt-central",
    category: "attraction",
    placeType: "natural_area",
    verificationStatus: "UNVERIFIED",
    evidence: SEsha_QUOTES.map((q) => ({ sourceUrl: "https://en.wikipedia.org/wiki/" + q.article.replace(/ /g, "_"), sourcePage: q.article, verbatimQuote: q.quote })),
    note: "three independent stored Wikipedia article extractions place the hills in/around Tirupati district; biosphere-reserve status mentioned in the Tirumala article references (lead #30 quote was junk; status recorded here as context, not as verified detail)",
  },
  notes: [
    "HIGH-lead outcome: all 5 HIGH leads resolve to corroborations of existing records (3), a generic-term extraction (1), and an out-of-scope Bihar namesake (1) — zero HIGH leads became new candidates, which is exactly why each lead must be assessed on its quotation rather than its priority.",
    "the 'Andhra Pradesh Government' lead's quote mentions a 'Kapil Teertham Dam inside the national park' — a possible distinct feature inside Sri Venkateswara National Park; no clean name evidence in stored sources, so it is recorded here as an observation only.",
    "review-queue tallies in docs continue to count leads, never candidates; accepted leads are removed from 'pending queue ambiguity' only via this assessment artifact.",
  ],
};

const out = join(B5, "review-queue-assessment.json");
writeFileSync(out, JSON.stringify(assessment, null, 2) + "\n");
console.log(`[batch5] assessment written → ${out}`);
console.log(`[batch5] tallies: ${JSON.stringify(tally)}`);
console.log(`[batch5] new candidates from queue: ${queueAccepts.length} (VarahaSwami GH, Indira GH)`);
console.log(`[batch5] new candidates from saved official page: ${officialAcceptsFinal.length}`);
console.log(`[batch5] Seshachalam Hills accept: 1`);
console.log(`[batch5] total Batch-5 accepted candidates so far: ${queueAccepts.length + officialAcceptsFinal.length + 1}`);
