/**
 * Foodie — TIRUPATI BATCH-5 discovery-candidates assembly (2026-10-29).
 *
 * Turns the Batch-5 evidence (web_search lead-checks, web_search small-food
 * discovery, Nominatim POI hits, saved official pages) into a REVIEWED
 * candidate ledger:
 *
 *   accepted     → Batch-015 review-candidate rows (T1/T2 evidence; every row
 *                  carries source URL + verbatim quote; verification_status
 *                  stays UNVERIFIED; coordinates NULL — published OSM
 *                  coordinates stay in the evidence file, never in the SQL)
 *   held         → identity-HELD leads (Balaji-name drift family, Tirumala
 *                  Tea-Stall conflicting-locality family) — never imported
 *   weakLead     → recorded in the review queue only (T3: no locality in
 *                  title/quote, list-mention only, dated, institutional,
 *                  or chain outlet) — NOT counted as candidates
 *   corroborates → independent evidence for ALREADY-EXISTING inventory /
 *                  pending-batch records — recorded, never a new row
 *
 * Fail-loud gates:
 *   * every accepted name is checked against inventory norms, batch 011–014
 *     norms, curated-worksheet norms, the queue's 352-name corpus, and the
 *     within-batch set;
 *   * every corroboration target must exist in inventory/batches/worksheet;
 *   * counts are recomputed from the tables, never hardcoded.
 *
 * Usage: bun scripts/foodie-enrichment/batch5-discovery-candidates.ts
 */

import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const HERE = dirname(fileURLToPath(import.meta.url));
const EV = join(HERE, "evidence", "tirupati-master");
const B5 = join(EV, "batch5");
mkdirSync(B5, { recursive: true });
const RETRIEVED = new Date().toISOString().slice(0, 10);

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

/* ---------------- existing universes (for dedupe gates) ---------------- */

const invMd = readFileSync(join(HERE, "..", "..", "docs", "tirupati-place-inventory.md"), "utf8");
const inventoryNames: string[] = [];
for (const m of invMd.matchAll(/^\| ([^|]+) \| (VERIFIED|PARTIALLY VERIFIED|UNVERIFIED|AMBIGUOUS)/gm)) inventoryNames.push(m[1].trim());
const invNorms = new Set(inventoryNames.map(norm));

const batchSqls = ["insert-batch-011-p4-places.sql", "insert-batch-012-tptm-master.sql", "insert-batch-013-tptm-b2.sql", "insert-batch-014-tptm-b3.sql"];
const batchNames: string[] = [];
for (const f of batchSqls) {
  const sql = readFileSync(join(HERE, "..", "..", "supabase", "review-candidates", f), "utf8");
  for (const m of sql.matchAll(/^    '([^']+)',$/gm)) batchNames.push(m[1]);
}
const batchNorms = new Set(batchNames.map(norm));

const ws = JSON.parse(readFileSync(join(HERE, "worksheets", "tirupati-master-curated.json"), "utf8"));
const wsNorms = new Set(ws.rows.map((r: { name: string }) => norm(r.name)));

const queue = JSON.parse(readFileSync(join(EV, "review-queue-new-names.json"), "utf8"));
const queueNames = new Set([...queue.genuinelyNew, ...queue.weakMatches].map((l: { name: string }) => norm(l.name)));

/* ---------------- explicit evidence tables ---------------- */

type Evidence = { quote: string; url: string; sourceKind: string; sourcePage?: string };
type Cand = {
  name: string;
  area: string;
  category: string;
  placeType?: string;
  evidence: Evidence;
  tier: "T1" | "T2";
  note?: string;
};

/* — small food businesses: tpt-central — */
const FOOD_TPT_CENTRAL: Cand[] = [
  { name: "Babu Tiffin Centre", area: "tpt-central", category: "tiffin", tier: "T1", evidence: { quote: "Babu Tiffin Centre on Bazar Street has been a pure veg favorite since 1984, known for ghee karam dosa and upma dosa.", url: "https://www.facebook.com/fb-answers/best-tiffin-services-in-tirupati/", sourceKind: "facebook-page" } },
  { name: "Shankar Tiffin Center, Srinivasa Nagar", area: "tpt-central", category: "tiffin", tier: "T1", evidence: { quote: "Shankar Tiffin Center. 6-1-169, Srinivasa Nagar, Varadaraja Nagar, Tirupati", url: "https://tirupati.idbf.in/788403/tiffin-center", sourceKind: "directory-listing" } },
  { name: "Jayalakshmi Tiffin Center, Srinagar", area: "tpt-central", category: "tiffin", tier: "T1", evidence: { quote: "Jayalakshmi Tiffin Center in Srinagar, Tirupati well known for Tiffin Services in Tirupati.", url: "https://www.justdial.com/Tirupati/Jayalakshmi-Tiffin-Center-Srinagar/9999PX877-X877-2", sourceKind: "directory-listing" } },
  { name: "Uday Tiffin Center, Maruthi Nagar", area: "tpt-central", category: "tiffin", tier: "T1", evidence: { quote: "Uday Tiffin Center in Maruthi Nagar, Tirupati well known for Tiffin Services in Tirupati.", url: "https://www.justdial.com/Tirupati/Uday-Tiffin-Center-Maruthi-Nagar/9999PX877-X877-200", sourceKind: "directory-listing" } },
  { name: "Nellore Mess, Prakasam Road", area: "tpt-central", category: "restaurant", tier: "T1", evidence: { quote: "Order from Nellore Mess online in Tirupati :: Some of the popular dishes at Nellore Mess include Veg Fried Rice, Egg Bhurji, Gobi Fried Rice, and Gobi Noodles.", url: "https://www.swiggy.com/city/tirupati/nellore-mess-prakasam-road-rest126018", sourceKind: "swiggy-listing" } },
  { name: "Deva Tea Stall, Korlagunta", area: "tpt-central", category: "street_food", tier: "T1", evidence: { quote: "Deva Tea Stall can be contacted via: Phone: 9885732225. Address: 1, Tirumala Bypass Road, Korlagunta, Maruthi Nagar, Tirupati", url: "https://tirupati.idbf.in/4017588/deva-tea-stall", sourceKind: "directory-listing" } },
  { name: "Sk Babu Tea Stall, Ashok Nagar", area: "tpt-central", category: "street_food", tier: "T1", evidence: { quote: "Sk Babu Tea Stall Ashok Nagar, Tirupati.", url: "https://www.justdial.com/Tirupati/Coffee-Shops-having-Tea/nct-10104727-att-cou22", sourceKind: "directory-listing" } },
  { name: "Chai Buster Tea Stall, Dhanalakshmi Nagar", area: "tpt-central", category: "street_food", tier: "T2", evidence: { quote: "Chai Buster Tea Stall Opp Mahadevi Textile Dhanalakshmi Nagar, tirupati.", url: "https://www.justdial.com/Tirupati/Juice-Centres-having-Tea/nct-10283258-att-cou22", sourceKind: "directory-listing" } },
  { name: "R.K. Tea Stall, Narula Market", area: "tpt-central", category: "street_food", tier: "T2", evidence: { quote: "Today trying at R.K. Tea stall near our Prestige Tailors, Narula Market complex", url: "https://www.facebook.com/ItsMyTirupathi/posts/buy-1-tea-get-1-free-rkgrandbanquethall", sourceKind: "facebook-page" } },
  { name: "Cakevilla Bakery Sweets, TK Street", area: "tpt-central", category: "bakery_sweets", tier: "T1", evidence: { quote: "Cakevilla Bakery Sweets in TK Street, Tirupati - Justdial :: Tirupati is a renowned bakery offering a delectable range of freshly baked goods and pastries. With an impressive 4.2 rating", url: "https://www.justdial.com/Tirupati/Cakevilla-Bakery-Sweets-Opp-Sai-Baba-Temple-Tk-Stre", sourceKind: "directory-listing" } },
  { name: "Sri Bhavani Sweets & Bakery, TML By Pass Road", area: "tpt-central", category: "bakery_sweets", tier: "T1", evidence: { quote: "Sri Bhavani Sweets & Bakery in TML By Pass Road, Tirupati is a renowned bakery offering a delectable range of freshly baked goods", url: "https://www.justdial.com/Tirupati/Sri-Bhavani-Sweets-Bakery-Near-Leelamahal-Junction-", sourceKind: "directory-listing" } },
  { name: "Tirupati Bakery, Tata Nagar", area: "tpt-central", category: "bakery_sweets", tier: "T1", evidence: { quote: "Tirupati Bakery - Restaurants in Tata Nagar :: Rayalaseema College Road, Tata Nagar, Tirupati ₹400 for two Open • 8:00 AM to 11:00 PM.", url: "https://www.district.in/dining/tirupati/tirupati-bakery-tata-nagar", sourceKind: "directory-listing" } },
  { name: "Aswani Sweets & Bakery, Vasavi Nagar", area: "tpt-central", category: "bakery_sweets", tier: "T1", evidence: { quote: "Aswani Sweets & Bakery in Vasavinagar, Tirupati :: With its signature cakes, fresh breads, and delightful pastries", url: "https://www.justdial.com/Tirupati/Aswani-Sweets-Bakery-Vasavinagar/9999PX877-X877-250", sourceKind: "directory-listing" } },
  { name: "Doss Bakery", area: "tpt-central", category: "bakery_sweets", tier: "T2", evidence: { quote: "Doss bakery (OSM mapped POI; name + published location 13.6321224,79.4183021 inside the Tirupati viewbox)", url: "https://nominatim.openstreetmap.org/search?q=bakery+Tirupati&format=jsonv2&viewbox=79.25,13.78,79.55,13.50&bounded=1", sourceKind: "osm-nominatim" }, note: "coordinates stay in evidence only — SQL rows import coordinates-NULL" },
  { name: "Rainbow Vegetarian Restaurant", area: "tpt-central", category: "restaurant", tier: "T2", evidence: { quote: "Rainbow Vegetarian Restaurant (OSM mapped POI; 13.6139463,79.4407677 inside the Tirupati viewbox); corroborated by Tripadvisor 'Rainbow - P...' in THE 10 BEST Indian Restaurants in Tirupati", url: "https://nominatim.openstreetmap.org/search?q=restaurant+Tirupati&format=jsonv2&viewbox=79.25,13.78,79.55,13.50&bounded=1", sourceKind: "osm-nominatim" } },
  { name: "SAI Juices & Tea Center, V V Mahal Road", area: "tpt-central", category: "street_food", tier: "T1", evidence: { quote: "SAI Juices & Tea Center in V V Mahal Road, Tirupati is a top player in the category Juice Centres in the Tirupati.", url: "https://www.justdial.com/Tirupati/SAI-Juices-Tea-Center-V-V-Mahal-Road/9999PX877-X877", sourceKind: "directory-listing" } },
  { name: "Saral Juice Shop, Pudipatla", area: "tpt-central", category: "street_food", tier: "T1", evidence: { quote: "Saral Juice Shop Pudipatla, tirupati.", url: "https://www.justdial.com/Tirupati/Juice-Centres-in-Vidya-Nagar-Road/nct-10283258", sourceKind: "directory-listing" } },
  { name: "T Nageshwara Rao Juice Shop, Tata Nagar", area: "tpt-central", category: "street_food", tier: "T1", evidence: { quote: "T Nageshwara Rao Juice Shop. 1, Railway Station, Tata Nagar, Tirupati", url: "https://tirupati.idbf.in/4246612/juice-junktion", sourceKind: "directory-listing" } },
  { name: "Taj Juice Centre, Bairagi Patteda", area: "tpt-central", category: "street_food", tier: "T1", evidence: { quote: "Taj Juice Centre. 1, Bairagi Patteda", url: "https://tirupati.idbf.in/4246612/juice-junktion", sourceKind: "directory-listing" } },
  { name: "Garlic Family Restaurant, Mangalam", area: "tpt-central", category: "restaurant", tier: "T1", evidence: { quote: "Garlic Family Restaurant Beside D Mart Pv Prasad Nagar Mangalam, Tirupati", url: "https://www.justdial.com/Tirupati/Restaurants-Family-Friendly-in-Kt-Road/nct-10408936", sourceKind: "directory-listing" } },
  { name: "Springs Restaurant", area: "tpt-central", category: "restaurant", tier: "T2", evidence: { quote: "Springs Restaurant (OSM mapped POI; 13.6115341,79.4425827 inside the Tirupati viewbox)", url: "https://nominatim.openstreetmap.org/search?q=restaurant+Tirupati&format=jsonv2&viewbox=79.25,13.78,79.55,13.50&bounded=1", sourceKind: "osm-nominatim" } },
  { name: "SFC Restaurant", area: "tpt-central", category: "restaurant", tier: "T2", evidence: { quote: "SFC Restaurant (OSM mapped POI; 13.6236886,79.4306379 inside the Tirupati viewbox)", url: "https://nominatim.openstreetmap.org/search?q=restaurant+Tirupati&format=jsonv2&viewbox=79.25,13.78,79.55,13.50&bounded=1", sourceKind: "osm-nominatim" } },
  { name: "Yalamuri Bar And Restaurant", area: "tpt-central", category: "restaurant", tier: "T2", evidence: { quote: "Yalamuri Bar And Restaurant (OSM mapped POI; 13.6222899,79.4304903 inside the Tirupati viewbox)", url: "https://nominatim.openstreetmap.org/search?q=restaurant+Tirupati&format=jsonv2&viewbox=79.25,13.78,79.55,13.50&bounded=1", sourceKind: "osm-nominatim" } },
  { name: "Hotel Sri Nandhi Restaurant", area: "tpt-central", category: "restaurant", tier: "T2", evidence: { quote: "Hotel Sri Nandhi Restaurant (OSM mapped POI; 13.6530860,79.4206324 inside the Tirupati viewbox)", url: "https://nominatim.openstreetmap.org/search?q=restaurant+Tirupati&format=jsonv2&viewbox=79.25,13.78,79.55,13.50&bounded=1", sourceKind: "osm-nominatim" } },
  { name: "Carrots Restaurant", area: "tpt-central", category: "restaurant", tier: "T2", evidence: { quote: "Carrots Restaurant (OSM mapped POI; 13.6227852,79.4193850 inside the Tirupati viewbox)", url: "https://nominatim.openstreetmap.org/search?q=restaurant+Tirupati&format=jsonv2&viewbox=79.25,13.78,79.55,13.50&bounded=1", sourceKind: "osm-nominatim" } },
  { name: "Harika Bar And Restaurant", area: "tpt-central", category: "restaurant", tier: "T2", evidence: { quote: "Harika Bar And Restaurant (OSM mapped POI; 13.6361984,79.4119654 inside the Tirupati viewbox)", url: "https://nominatim.openstreetmap.org/search?q=restaurant+Tirupati&format=jsonv2&viewbox=79.25,13.78,79.55,13.50&bounded=1", sourceKind: "osm-nominatim" } },
  { name: "Manal Restaurant", area: "tpt-central", category: "restaurant", tier: "T2", evidence: { quote: "Manal Restaurant (OSM mapped POI; 13.6467356,79.4196474 inside the Tirupati viewbox)", url: "https://nominatim.openstreetmap.org/search?q=restaurant+Tirupati&format=jsonv2&viewbox=79.25,13.78,79.55,13.50&bounded=1", sourceKind: "osm-nominatim" } },
  { name: "Sunlight Veg Restaurant", area: "tpt-central", category: "restaurant", tier: "T2", evidence: { quote: "Sunlight Veg Restaurant (OSM mapped POI; 13.6505264,79.4183175 inside the Tirupati viewbox)", url: "https://nominatim.openstreetmap.org/search?q=restaurant+Tirupati&format=jsonv2&viewbox=79.25,13.78,79.55,13.50&bounded=1", sourceKind: "osm-nominatim" } },
  { name: "Imperial Spice Restaurant", area: "tpt-central", category: "restaurant", tier: "T2", evidence: { quote: "IMPERIAL SPICE RESTAURANT (OSM mapped POI; 13.6289957,79.4236211 inside the Tirupati viewbox)", url: "https://nominatim.openstreetmap.org/search?q=restaurant+Tirupati&format=jsonv2&viewbox=79.25,13.78,79.55,13.50&bounded=1", sourceKind: "osm-nominatim" } },
  { name: "Manasa Vihar Cafe", area: "tpt-central", category: "cafe", tier: "T2", evidence: { quote: "Manasa Vihar Cafe (OSM mapped POI; 13.6305027,79.4117142 inside the Tirupati viewbox)", url: "https://nominatim.openstreetmap.org/search?q=cafe+Tirupati&format=jsonv2&viewbox=79.25,13.78,79.55,13.50&bounded=1", sourceKind: "osm-nominatim" } },
  { name: "Vanam Restaurant, Alipiri Road", area: "tpt-central", category: "restaurant", tier: "T2", evidence: { quote: "Vanam Restaurant (OSM mapped POI; 13.6236005,79.3646973 — Alipiri/ghat-road foot of the hills; appears in both the Tirupati and Tirumala bounded queries, same OSM object)", url: "https://nominatim.openstreetmap.org/search?q=restaurant+Tirumala&format=jsonv2&viewbox=79.25,13.78,79.55,13.50&bounded=1", sourceKind: "osm-nominatim" } },
];

/* — small food businesses: tirumala — */
const FOOD_TIRUMALA: Cand[] = [
  { name: "Golden Balaji Tiffin Center, Tirumala", area: "tirumala", category: "tiffin", tier: "T1", evidence: { quote: "16 Photos of Golden Balaji Tiffin Center in Tirumala, Tirupati :: Sri Guru Tiffin Centre · Muraga Tiffins · Vishnu Padam Tiffin Center · Homemade Tiffins · Original Home Tiffins · Balaji Tiff", url: "https://www.justdial.com/Tirupati/Golden-Balaji-Tiffin-Center-Tirumala/9999PX877-X877", sourceKind: "directory-listing" } },
  { name: "Chandra Tiffin Shop, Tirumala", area: "tirumala", category: "tiffin", tier: "T1", evidence: { quote: "Order food online from Chandra Tiffin Shop, Tirumala, Tirupati. South Indian 4.3 DELIVERY", url: "https://www.zomato.com/tirupati/chandra-tiffin-shop-tirumala/order", sourceKind: "zomato-listing" } },
  { name: "V Mohan Tea Stall, Tirumala", area: "tirumala", category: "street_food", tier: "T1", evidence: { quote: "V Mohan Tea Stall in Tirumala, Tirupati :: Located in the vibrant heart of Tirumala, V Mohan Tea Stall is a cherished culinary haven", url: "https://www.justdial.com/Tirupati/V-Mohan-Tea-Stall-Tirumala/9999PX877-X877-230406172", sourceKind: "directory-listing" } },
  { name: "Sri Guru Tiffin Centre, Tirumala", area: "tirumala", category: "tiffin", tier: "T1", evidence: { quote: "Sri Guru Tiffin Centre is located at 1, Opp. Balaji Bus Stand, Tirupati - 517504, Andhra Pradesh, India.", url: "https://tirupati.idbf.in/4016107/sri-guru-tiffin-centre", sourceKind: "directory-listing" }, note: "pin 517504 is Tirumala's postal code" },
  { name: "Saarangi Restaurant, Tirumala", area: "tirumala", category: "restaurant", tier: "T2", evidence: { quote: "THE 5 BEST Restaurants in Tirumala :: 1. Saarangi Restaurent. 3.8 of 5 bubbles. (279 reviews) · 2. Saarangi Fine Dine Restaurant.", url: "https://www.tripadvisor.com/Restaurants-g1985457-Tirumala_Chittoor_District_Andhra_Pradesh.html", sourceKind: "tripadvisor-listing" }, note: "two tripadvisor listings (Saarangi Restaurent + Saarangi Fine Dine Restaurant) merged into ONE venue candidate" },
];

/* — small food businesses: tiruchanur / neighbourhoods — */
const FOOD_OTHER: Cand[] = [
  { name: "Radha Rani Tiffin Centre, Padmavathi Nagar", area: "tiruchanur", category: "tiffin", tier: "T1", evidence: { quote: "Tiffin Center in Tirupati :: Radha Rani Tiffin Centre. Mahila University Road, Padmavathi Nagar, Tirupati ... 503, Samajam Street, Tiruchanur, Tirupati", url: "https://tirupati.idbf.in/788403/tiffin-center", sourceKind: "directory-listing" } },
  { name: "Vls Tiffin Centre And Catering, Mangalam", area: "tpt-neighbourhoods", category: "tiffin", tier: "T1", evidence: { quote: "Vls Tiffin Centre And Catering in Mangalam, Tirupati well known for Tiffin Services in Tirupati. Rated 4.8 based on 9 Custo", url: "https://www.justdial.com/Tirupati/Vls-Tiffin-Centre-And-Catering-Mangalam/9999PX877-X", sourceKind: "directory-listing" } },
  { name: "Tasvija Tiffin Centre, Mangalam", area: "tpt-neighbourhoods", category: "tiffin", tier: "T1", evidence: { quote: "Tasvija Tiffin Centre in Mangalam, Tirupati well known for Tiffin Services in Tirupati.", url: "https://www.justdial.com/Tirupati/Tasvija-Tiffin-Centre-Mangalam/9999PX877-X877-23040", sourceKind: "directory-listing" } },
  { name: "Sumathi Tiffin Centre, Mangalam", area: "tpt-neighbourhoods", category: "tiffin", tier: "T1", evidence: { quote: "Sumathi Tiffin centre is a restaurant based in Mangalam, Tirupati. It offers meals suited to different tastes.", url: "https://magicpin.in/Tirupati/Mangalam/Restaurant/Sumathi-Tiffin-Centre/store/3c6ac43", sourceKind: "magicpin-listing" } },
  { name: "J Bebamma Tiffin Center, Renigunta Road", area: "tpt-neighbourhoods", category: "tiffin", tier: "T1", evidence: { quote: "J Bebamma Tiffin Center in Renigunta Road, Tirupati", url: "https://www.justdial.com/Tirupati/J-Bebamma-Tiffin-Center-Diamond-Collection-Renigunt", sourceKind: "directory-listing" } },
  { name: "Amma Appam, Renigunta", area: "renigunta", category: "tiffin", tier: "T1", evidence: { quote: "Name, Punjabi Dhaba Restaurant · Amma Appam Renigunta ; Address, G Car Street, T P Area, Tirupati - 51750", url: "https://www.justdial.com/Tirupati/Tiffin-Services-For-Rajasthani-Food-in-Renigunta/nc", sourceKind: "directory-listing" }, note: "listing pairs 'Amma Appam Renigunta' with a G Car Street T P Area address — area recorded as renigunta per the listing title, address discrepancy flagged for verification" },
];

/* — Batch-015 non-food accepts — */
const NON_FOOD: Cand[] = [
  /* queue accepts (official TTD rate tables) — NOTE: 'Indira Guest House' was
   * DOWNGRADED to HELD: batch-013 already queues 'Indira Rest House, Tirumala'
   * (frozen canonical) and the VarahaSwami-GH rate table's 'Indira Guest House
   * A/C (4 suites)' is plausibly the same property under a drifted name —
   * reconcile before any import (see HELD below). */
  { name: "VarahaSwami Guest House, Tirumala", area: "tirumala", category: "hotel", placeType: "accommodation", tier: "T1", evidence: { quote: "page heading on https://www.tirumala.org/varahaswamiguesthouse.aspx — VarahaSwami Guest House rate table", url: "https://www.tirumala.org/varahaswamiguesthouse.aspx", sourceKind: "official-ttd" }, note: "from review-queue lead #129; the Varahaswamy TEMPLE (batch-012) is a different venue type; no Varaha guest-house row exists in batches 011–014" },
  /* queue accept — Seshachalam Hills (stored multi-article evidence) */
  { name: "Seshachalam Hills", area: "tpt-central", category: "attraction", placeType: "natural_area", tier: "T1", evidence: { quote: "The National Park is located in the Eastern Ghats spread over the Seshachalam hills of Tirupati district. (Sri Venkateswara National Park, Wikipedia)", url: "https://en.wikipedia.org/wiki/Sri_Venkateswara_National_Park", sourceKind: "wikipedia" }, note: "plus two further stored quotes: Tirumala article ('...Sapthagiri in the Seshachalam Hills of the Eastern Ghats') and Kapila Theertham article ('...part of Seshachalam Hills')" },
  /* official saved page — gardens/giris/mandapam/teerthams/nav temples */
  { name: "Gogarbham Gardens, Tirumala", area: "tirumala", category: "attraction", tier: "T1", evidence: { quote: "Some of the must visit places in Tirumala are Swami Pushkarini, Sri Bhu Varaha Swamy temple, Sri Hathiramjee Mutt, Sri Bedi Anjaneya Swamy temple, Srivari Sikhara Darshanam, Sila Thoranam, Dharmagiri, Narayangiri, Papavinasanam, Akasa Ganga water falls, Temple Museum, Asthana Mandapams and Gogarbham Gardens.", url: "https://www.tirumala.org/places-around-tirumala.aspx", sourceKind: "official-ttd" }, note: "official page already saved on disk; the dead garden.aspx/theerthams.aspx shells never delivered this content" },
  { name: "Dharmagiri, Tirumala", area: "tirumala", category: "attraction", tier: "T1", evidence: { quote: "…Sila Thoranam, Dharmagiri, Narayangiri, Papavinasanam…", url: "https://www.tirumala.org/places-around-tirumala.aspx", sourceKind: "official-ttd" } },
  { name: "Narayangiri, Tirumala", area: "tirumala", category: "attraction", tier: "T1", evidence: { quote: "…Dharmagiri, Narayangiri, Papavinasanam, Akasa Ganga water falls…", url: "https://www.tirumala.org/places-around-tirumala.aspx", sourceKind: "official-ttd" } },
  { name: "Asthana Mandapam, Tirumala", area: "tirumala", category: "attraction", tier: "T1", evidence: { quote: "…Temple Museum, Asthana Mandapams and Gogarbham Gardens.", url: "https://www.tirumala.org/places-around-tirumala.aspx", sourceKind: "official-ttd" } },
  { name: "Pandava Teertham, Tirumala", area: "tirumala", category: "sacred_water", tier: "T1", evidence: { quote: "There are several teerthams in Tirumala, some of them are Pandava Teertham, Kumaradhara Teertham, Tumbhuru Teertham, Ramakrishna Teertham, Chakra Teertham, Vaikuntha Teertham, Sesha Teertham, Sitamma Teertham, Pasupu Teertham, Jupali Teertham, Sanaka Sanandana Teertham.", url: "https://www.tirumala.org/places-around-tirumala.aspx", sourceKind: "official-ttd" } },
  { name: "Kumaradhara Teertham, Tirumala", area: "tirumala", category: "sacred_water", tier: "T1", evidence: { quote: "…Kumaradhara Teertham… Important festivals that are held at the teerthams are -Kumaradhara Magha Pournami…", url: "https://www.tirumala.org/places-around-tirumala.aspx", sourceKind: "official-ttd" } },
  { name: "Tumbhuru Teertham, Tirumala", area: "tirumala", category: "sacred_water", tier: "T1", evidence: { quote: "…Tumbhuru Teertham… Tumbhuru Phalguna Pournami…", url: "https://www.tirumala.org/places-around-tirumala.aspx", sourceKind: "official-ttd" } },
  { name: "Ramakrishna Teertham, Tirumala", area: "tirumala", category: "sacred_water", tier: "T1", evidence: { quote: "…Ramakrishna Teertham… Ramakrishna Pushya Pournami…", url: "https://www.tirumala.org/places-around-tirumala.aspx", sourceKind: "official-ttd" } },
  { name: "Sesha Teertham, Tirumala", area: "tirumala", category: "sacred_water", tier: "T1", evidence: { quote: "…Vaikuntha Teertham, Sesha Teertham, Sitamma Teertham…", url: "https://www.tirumala.org/places-around-tirumala.aspx", sourceKind: "official-ttd" } },
  { name: "Sitamma Teertham, Tirumala", area: "tirumala", category: "sacred_water", tier: "T1", evidence: { quote: "…Sesha Teertham, Sitamma Teertham, Pasupu Teertham…", url: "https://www.tirumala.org/places-around-tirumala.aspx", sourceKind: "official-ttd" } },
  { name: "Pasupu Teertham, Tirumala", area: "tirumala", category: "sacred_water", tier: "T1", evidence: { quote: "…Sitamma Teertham, Pasupu Teertham, Jupali Teertham…", url: "https://www.tirumala.org/places-around-tirumala.aspx", sourceKind: "official-ttd" } },
  { name: "Jupali Teertham, Tirumala", area: "tirumala", category: "sacred_water", tier: "T1", evidence: { quote: "…Pasupu Teertham, Jupali Teertham, Sanaka Sanandana Teertham.", url: "https://www.tirumala.org/places-around-tirumala.aspx", sourceKind: "official-ttd" } },
  { name: "Sanaka Sanandana Teertham, Tirumala", area: "tirumala", category: "sacred_water", tier: "T1", evidence: { quote: "…Jupali Teertham, Sanaka Sanandana Teertham.", url: "https://www.tirumala.org/places-around-tirumala.aspx", sourceKind: "official-ttd" } },
  { name: "Srivari Padalamandapam Temple, Tirupati", area: "tpt-central", category: "temple", tier: "T1", evidence: { quote: "More Temples At Tirupathi Sri Govindarajaswami Temple Srivari Padalamandapam Temple Sri Lakshmi Narayana Swamy Temple Sri Vinayaka Swamy Temple Sri Kapliswaraswamy Temple Sri Kodandarama Swamy Temple", url: "https://www.tirumala.org/places-around-tirumala.aspx", sourceKind: "official-ttd" }, note: "the foothill temple at Alipiri where the Tirumala footpath begins" },
  { name: "Sri Lakshmi Narayana Swamy Temple, Tirupati", area: "tpt-central", category: "temple", tier: "T1", evidence: { quote: "…Srivari Padalamandapam Temple Sri Lakshmi Narayana Swamy Temple Sri Vinayaka Swamy Temple…", url: "https://www.tirumala.org/places-around-tirumala.aspx", sourceKind: "official-ttd" } },
  /* lead-check outcomes: Venugopala Karvetinagaram was DOWNGRADED to a
   * corroboration — the dedupe gate proved the temple already exists
   * (inventory 'Sri Venugopala Swamy Temple, Karvetinagaram', batch-013 queued)
   * — see CORROBORATIONS below. Vaikuntam Queue Complex + Siddeswara Swamy
   * Temple are genuine accepts. */
  { name: "Vaikuntam Queue Complex, Tirumala", area: "tirumala", category: "attraction", tier: "T1", evidence: { quote: "TTD to take up feasibility study for VQC-3 at Tirumala :: ... Vaikuntam Queue Complex (VQC-3). The study, expected to roll out in the coming weeks…", url: "https://www.thehansindia.com/news/cities/tirupathi/ttd-to-take-up-feasibility-study-for-vqc-3", sourceKind: "news" }, note: "further hits: The Hindu (2013/2016 articles), Trip.com attraction listing 'Vaikuntam Queue Complex - 1'; queue lead #66 upgraded on this evidence" },
  { name: "Siddeswara Swamy Temple, Talakona", area: "surrounding", category: "temple", tier: "T1", evidence: { quote: "Talakona is also known for the Lord Siddheswara Swamy Temple, which is located close to the waterfall. (Wikipedia, Talakona article, retrieved 2026-10-29)", url: "https://en.wikipedia.org/wiki/Talakona", sourceKind: "wikipedia" }, note: "queue lead #102 upgraded; primary evidence is the clean Wikipedia sentence obtained when the earlier 429 cleared on re-run; secondary: 'Sri Talakona Siddeswara Swamy Devastanam — Talakona is home of Siddheswara Swami' (facebook page); spellings vary (Siddeswara/Siddheswara) — canonical frozen as Siddeswara Swamy Temple, Talakona" },
];

/* — identity-HELD leads (never imported this pass) — */
const HELD: Array<{ name: string; reason: string; evidence: Evidence }> = [
  { name: "Indira Guest House, Tirumala", reason: "NAME-DRIFT GUARD: batch-013 already queues the frozen canonical 'Indira Rest House, Tirumala'; the VarahaSwami-GH rate-table row 'Indira Guest House A/C (4 suites)' is plausibly the same TTD property under a drifted name — reconcile against the frozen row before any import (queue lead #132)", evidence: { quote: "06. | Indira Guest House A/C( 4 suites ) | 2000.00", url: "https://www.tirumala.org/varahaswamiguesthouse.aspx", sourceKind: "official-ttd" } },
  { name: "Reddy Tea Stall, Tirumala", reason: "overlaps the batch-014 identity-HELD 'Tirumala Tea Stall' conflicting-locality pair (Reddy and Reddy's Colony) — held pending identity resolution", evidence: { quote: "Reviews of Reddy Tea Stall, Tirumala, Tirupati :: see all unbiased reviews of Reddy Tea Stall Tirupati", url: "https://www.zomato.com/it/tirupati/reddy-tea-stall-tirumala/reviews", sourceKind: "zomato-listing" } },
  { name: "Sri Balaji Tea Stall, Tirumala", reason: "Balaji-name drift family (batch-014 hold on 'Tirumala Balaji Sweets' vs frozen batch-013 row extends by analogy to new Balaji-named venue claims); vyaparify self-published page", evidence: { quote: "SRI BALAJI TEA STALL offers quality groceries in TIRUMALA.", url: "https://h-id.vyaparify.com/sri-balaji-tea-stall", sourceKind: "self-published" } },
  { name: "Balaji Sweets & Bakery, Korramenugunta", reason: "Balaji-name drift family (see above); justdial snippet lacks the full address", evidence: { quote: "Best Sweet Shops in Tiruchanoor, Tirupati :: Name, Nandhini Bakery And Sweets · Balaji Sweets & Bakery ; Address, Narayanapuram, Korramenugunta, Tiruchanoor Road", url: "https://www.justdial.com/Tirupati/Sweet-Shops-in-Tiruchanoor/nct-10465567", sourceKind: "directory-listing" } },
];

/* — weak leads (review queue ONLY; not candidates) — */
const WEAK_LEADS: Array<{ name: string; area: string; reason: string; evidence: Evidence }> = [
  { name: "Sri Vasavi Tiffin Centre", area: "tpt-central", reason: "list mention only, no locality in title/quote", evidence: { quote: "Top Tiffin Services For School in Tirupati near me :: Tiffins At 30 · Sakhi Tiffin House · Sri Renuka Parameswari Tiffin Center · Sri Vasavi Tiffin Centre", url: "https://www.justdial.com/Tirupati/Tiffin-Services-For-School/nct-11614048", sourceKind: "directory-listing" } },
  { name: "Sri Renuka Parameswari Tiffin Center", area: "tpt-central", reason: "list mention only, no locality", evidence: { quote: "Sri Renuka Parameswari Tiffin Center · Sri Krishna Tiffi…", url: "https://www.justdial.com/Tirupati/Tiffin-Services-For-School/nct-11614048", sourceKind: "directory-listing" } },
  { name: "Sakhi Tiffin House", area: "tpt-central", reason: "list mention only, no locality", evidence: { quote: "Sakhi Tiffin House · Sri Renuka Parameswari Tiffin Center…", url: "https://www.justdial.com/Tirupati/Tiffin-Services-For-School/nct-11614048", sourceKind: "directory-listing" } },
  { name: "Gangayya Tiffin Centre", area: "tpt-central", reason: "recurring related-listing mention (4.0, 36 ratings) but no own locality-bearing listing", evidence: { quote: "…Gangayya Tiffin Centre. 4.0. 36…", url: "https://www.justdial.com/Tirupati/Jayalakshmi-Tiffin-Center-Srinagar/9999PX877-X877-2", sourceKind: "directory-listing" } },
  { name: "Seenaya Mess", area: "tpt-central", reason: "video title only, no locality text", evidence: { quote: "Seenaya Mess Tirupati: Unlimited Non-Veg Andhra Meals", url: "https://www.facebook.com/Gaganwanders/videos/tirupati-food-lovers-have-you-tried", sourceKind: "facebook-page" } },
  { name: "Reddemma Mess", area: "tpt-central", reason: "list mention only", evidence: { quote: "Best Mess in Tirupati - Order Food Online · Reddemma Mess · Reddamma Mess · Nellore Mess…", url: "https://www.justdial.com/Tirupati/Mess/nct-10319116", sourceKind: "directory-listing" } },
  { name: "P S R Tea Stall", area: "tpt-central", reason: "city-level listing only", evidence: { quote: "Hotels near P S R TEA STALL, Tirupati :: …renowned for its authentic South Indian tea", url: "https://www.agoda.com/hotels-near-p-s-r-tea-stall/attractions/tirupati-in.html", sourceKind: "agoda-listing" } },
  { name: "Venkata Muni Tea Stall", area: "tpt-central", reason: "address snippet truncated, locality unresolved", evidence: { quote: "Venkata Muni Tea Stall located at Opposite…", url: "https://city.webindia123.com/d-t/andhra-pradesh/tirupati/venkata-muni-tea-stall/", sourceKind: "directory-listing" } },
  { name: "Thirumalai Tea Stall", area: "tpt-central", reason: "auto-generated aggregation page; locality partial ('near Theertha Katta St')", evidence: { quote: "…Thirumalai Tea Stall near Theertha Katta St and Muni Krishna Tea Stall on Gandhi Rd…", url: "https://www.instagram.com/popular/best-tea-in-tirupati", sourceKind: "aggregator" } },
  { name: "Muni Krishna Tea Stall, Gandhi Road", area: "tpt-central", reason: "auto-generated aggregation page", evidence: { quote: "…Muni Krishna Tea Stall on Gandhi Rd, both open early for masala t…", url: "https://www.instagram.com/popular/best-tea-in-tirupati", sourceKind: "aggregator" } },
  { name: "Bismillah Tea Stall", area: "tpt-central", reason: "list mention only", evidence: { quote: "Popular Tea Shops and Chai Stalls in Tirupati · BISMILLAH TEA STALL · Boyakonda Gangamma Tea Stall · CHENDU TEA STALL · Deva…", url: "https://tirupati.idbf.in/tea", sourceKind: "directory-listing" } },
  { name: "Boyakonda Gangamma Tea Stall", area: "tpt-central", reason: "list mention only", evidence: { quote: "BISMILLAH TEA STALL · Boyakonda Gangamma Tea Stall · CHENDU TEA STALL…", url: "https://tirupati.idbf.in/tea", sourceKind: "directory-listing" } },
  { name: "Chendu Tea Stall", area: "tpt-central", reason: "list mention only", evidence: { quote: "Boyakonda Gangamma Tea Stall · CHENDU TEA STALL · Deva…", url: "https://tirupati.idbf.in/tea", sourceKind: "directory-listing" } },
  { name: "Maha Sri Tea Stall", area: "tpt-central", reason: "list mention only (category-page, per-item locality absent)", evidence: { quote: "Tea Stalls in Tirupati. Maha Sri Tea Stall · Sri Vinayaka Colldrinks & Tea Stall · Bismillah Tea Stall…", url: "https://www.justdial.com/Tirupati/Tea-Stalls-Family-Friendly-in-Kt-Road/nct-10853304-", sourceKind: "directory-listing" } },
  { name: "Mr Chai Dude", area: "tpt-central", reason: "locality truncated in snippet", evidence: { quote: "Mr Chai Dude Opposite Abhi Chatngos Col…", url: "https://www.justdial.com/Tirupati/Coffee-Shops-having-Tea/nct-10104727-att-cou22", sourceKind: "directory-listing" } },
  { name: "Juice Junktion", area: "tpt-central", reason: "city-level listing only", evidence: { quote: "JUICE JUNKTION in Tirupati", url: "https://tirupati.idbf.in/4246612/juice-junktion", sourceKind: "directory-listing" } },
  { name: "Pooja Bakery And Sweets", area: "tpt-central", reason: "city-level self-published page, no locality", evidence: { quote: "POOJA BAKERY AND SWEETS in Tirupati :: Fresh sweets, cakes & baked goods made with love. 20+ years of experience.", url: "https://mychitti.net/tirupati/store/pooja-bakery-and-sweets", sourceKind: "self-published" } },
  { name: "Cakewala", area: "tpt-central", reason: "recommendation mention, locality truncated", evidence: { quote: "for birthday cakes people recommend Cakewala on …", url: "https://www.facebook.com/fb-answers/best-bakeries-in-tirupati/", sourceKind: "facebook-page" } },
  { name: "SLV Sweets and Bakery, Bazaar Street", area: "tpt-central", reason: "dated source (2009 blog listing) — operation status unverifiable", evidence: { quote: "SLV SWEETS AND BAKERY. 8-1-132. BAZAAR STREET. TIRUPATI PICKELS AND POWDERS AVAILABLE WITH US.", url: "http://tirupatihelpline.blogspot.com/2009/04/bakery-shops-and-sweet-shops-in.html", sourceKind: "blog" } },
  { name: "Sri Raghavendra Savoury & Sweet Home", area: "tpt-central", reason: "own business site, city-level only (no locality in retrieved text)", evidence: { quote: "Experience the finest traditional sweets and savouries at Sri Raghavendra Savoury & Sweet Home in Tirupati.", url: "https://www.sriraghavendrasweets.in", sourceKind: "official-business" } },
  { name: "Vyom, Ekante' Bliss (IHCL SeleQtions)", area: "tpt-central", reason: "hotel-restaurant inside a branded hotel; needs venue-level decision", evidence: { quote: "THE 10 BEST Indian Restaurants in Tirupati :: 1. Vyom, Ekante' Bliss, Tirupati - Ihcl Seleqtions. 4.5", url: "https://www.tripadvisor.com/Restaurants-g297587-c24-Tirupati_Chittoor_District_Andhra_Pradesh.html", sourceKind: "tripadvisor-listing" } },
  { name: "Zodiac", area: "tpt-central", reason: "hotel-restaurant, no locality in snippet", evidence: { quote: "2. Zodiac. 4.5 of 5 bubbles", url: "https://www.tripadvisor.com/Restaurants-g297587-c24-Tirupati_Chittoor_District_Andhra_Pradesh.html", sourceKind: "tripadvisor-listing" } },
  { name: "Arc Family Restaurant & Cafe", area: "tpt-central", reason: "listing near station, no own locality text", evidence: { quote: "THE 10 BEST Restaurants Near Tirupati Station :: Arc Family Restaurant & Cafe · (0 reviews). Chinese, Indian.", url: "https://www.tripadvisor.com/RestaurantsNear-g297587-d4145756-oa30-Tirupati_Station-Ti", sourceKind: "tripadvisor-listing" } },
  { name: "Tirumala Bakery, Amaraja Road", area: "tpt-central", reason: "NAME-DRIFT FLAG vs frozen batch-014 row 'Tirumala Bakery' (Tirupati Bazar) and worksheet row 'Tirumala Bakery And Sweets' (Srinagar Colony) — branch identity unresolved", evidence: { quote: "Tirumala Bakery is a trusted cake shop in Amaraja Road, tirupati", url: "https://www.indiacakes.com/cake-shop/tirupati/tirumala-bakery-tirupati", sourceKind: "directory-listing" } },
  { name: "Muraga Tiffins", area: "tirumala", reason: "related-listing mention on the Golden Balaji page, no own locality", evidence: { quote: "Sri Guru Tiffin Centre · Muraga Tiffins · Vishnu Padam Tiffin Center…", url: "https://www.justdial.com/Tirupati/Golden-Balaji-Tiffin-Center-Tirumala/9999PX877-X877", sourceKind: "directory-listing" } },
  { name: "Vishnu Padam Tiffin Center", area: "tirumala", reason: "related-listing mention, no own locality", evidence: { quote: "Muraga Tiffins · Vishnu Padam Tiffin Center · Homemade Tiffins…", url: "https://www.justdial.com/Tirupati/Golden-Balaji-Tiffin-Center-Tirumala/9999PX877-X877", sourceKind: "directory-listing" } },
  { name: "Nandini Milk Parlour, Tirumala", area: "tirumala", reason: "aggregator list mention", evidence: { quote: "Mkahawa wa chai katika Tirumala · 1. Nandini milk parlour · 2. Josh Irani Tea · 3. NAIDU tea stall", url: "https://biashara.cybo.com/IN/tirumala/mkahawa-wa-chai", sourceKind: "aggregator" } },
  { name: "Josh Irani Tea, Tirumala", area: "tirumala", reason: "aggregator list mention", evidence: { quote: "Nandini milk parlour · Josh Irani Tea · NAIDU tea stall", url: "https://biashara.cybo.com/IN/tirumala/mkahawa-wa-chai", sourceKind: "aggregator" } },
  { name: "Naidu Tea Stall, Tirumala", area: "tirumala", reason: "aggregator list mention", evidence: { quote: "Josh Irani Tea · NAIDU tea stall · Tea Time - Tirupathi", url: "https://biashara.cybo.com/IN/tirumala/mkahawa-wa-chai", sourceKind: "aggregator" } },
  { name: "TTD Employees Canteen, Tirumala", area: "tirumala", reason: "staff/institutional canteen (TTD internal), mapped but not public-facing", evidence: { quote: "Get map of TTD Employees Canteen, Tirumala Ring Road, Tirumala, Andhra Pradesh, 517504", url: "https://www.mappls.com/ilbi64", sourceKind: "map-listing" } },
  { name: "Manasa Cakewala, Tiruchanoor", area: "tiruchanur", reason: "category-page mention, no own locality line", evidence: { quote: "A new bakery shop with great varieties… Manasa cakewala is providing best and fresh cake", url: "https://www.justdial.com/Tirupati/Cake-Dish-Restaurants-in-Tiruchanoor", sourceKind: "directory-listing" } },
  { name: "Toptown Cafe, Tiruchanoor", area: "tiruchanur", reason: "list mention only", evidence: { quote: "Best Customised Cake Retailers in Tiruchanoor, Tirupati · Fnp Cakes N More · Justbake · Toptown Cafe", url: "https://www.justdial.com/Tirupati/Customised-Cake-Retailers-in-Tiruchanoor/nct-109742", sourceKind: "directory-listing" } },
  { name: "Rajabogam Tiffins", area: "renigunta", reason: "list mention only", evidence: { quote: "Top Tiffin Services For Rajasthani Food in Renigunta :: Rajabogam Tiffins ; Name, Punjabi Dhaba Restaurant…", url: "https://www.justdial.com/Tirupati/Tiffin-Services-For-Rajasthani-Food-in-Renigunta/nc", sourceKind: "directory-listing" } },
  { name: "Babu Canteen", area: "renigunta", reason: "list mention only", evidence: { quote: "Sv Tiffin Center · Babu Canteen · Tiffins At 30 · Sakhi Tiffin House…", url: "https://www.justdial.com/Tirupati/Tiffin-Services-For-Veg-Food-in-Renigunta/nct-10481", sourceKind: "directory-listing" } },
  { name: "New SR Cafe", area: "renigunta", reason: "list mention only", evidence: { quote: "Punjabi Dhaba Restaurant · New SR Cafe · Sri Renuka Pa…", url: "https://www.justdial.com/Tirupati/Tiffin-Services-For-Veg-Food-in-Renigunta/nct-10481", sourceKind: "directory-listing" } },
  { name: "Sree Balaji Bakery and Sweets, Chandragiri", area: "chandragiri", reason: "Balaji-name drift family + self-published page", evidence: { quote: "Sree Balaji Bakery and Sweets is your go-to spot in Chandragiri, Andhra Pradesh, for mouthwatering pastries, freshly baked b…", url: "https://h-id.vyaparify.com/sree-balaji-bakery-and-sweets", sourceKind: "self-published" } },
  { name: "B Block Mess, SV University", area: "tpt-central", reason: "institutional campus mess (university), not a public food business", evidence: { quote: "B Block mess Area | restaurant | 13.6296981,79.4033838 / B-mess sv university | food_court", url: "https://nominatim.openstreetmap.org/search?q=mess+Tirupati&format=jsonv2&viewbox=79.25,13.78,79.55,13.50&bounded=1", sourceKind: "osm-nominatim" } },
  { name: "Punjabi Dhaba Restaurant, T P Area", area: "tpt-central", reason: "Renigunta category page carries a T P Area address — locality conflict unresolved", evidence: { quote: "Name, Punjabi Dhaba Restaurant · Amma Appam Renigunta ; Address, G Car Street, T P Area, Tirupati - 51750", url: "https://www.justdial.com/Tirupati/Tiffin-Services-For-Rajasthani-Food-in-Renigunta/nc", sourceKind: "directory-listing" } },
];

/* — corroborations of existing records — */
const CORROBORATIONS: Array<{ name: string; existingRecord: string; evidence: Evidence; note?: string }> = [
  { name: "Nagarjuna Military Mess", existingRecord: "Nagarjuna Military Mess (inventory)", evidence: { quote: "Order from Military Mess online in Tirupati :: Some of the popular dishes at Military Mess include Mutton Meals, Natu Kodi Fry, Chicken Biryani", url: "https://www.swiggy.com/city/tirupati/military-mess-tata-nagar-rest1295934", sourceKind: "swiggy-listing" } },
  { name: "Mayura Bakery", existingRecord: "Mayura Bakery (inventory)", evidence: { quote: "Mayura bakery (OSM mapped POI; 13.6313324,79.4187900); corroborated by 'Mayura Bakery on Gandhi Road comes up as a local favorite'", url: "https://nominatim.openstreetmap.org/search?q=bakery+Tirupati&format=jsonv2&viewbox=79.25,13.78,79.55,13.50&bounded=1", sourceKind: "osm-nominatim" } },
  { name: "Ganapathi Juice Shop", existingRecord: "Ganapathi Juice Shop (inventory)", evidence: { quote: "Ganapathi Juice Shop Beside Sri Teja Digital Studio Tilak Road, Tirupati.", url: "https://www.justdial.com/Tirupati/Juice-Centres-in-T-P-Area/nct-10283258", sourceKind: "directory-listing" } },
  { name: "Sri Venkateswara Annaprasadam Trust", existingRecord: "Sri Venkateswara Annaprasadam Trust (inventory)", evidence: { quote: "In V.Q.C I & II beverages and food will be served to the pilgrims with an interval of every 3 hours who are waiting in the co…", url: "https://www.tirumala.org/SRIVENKATESWARAANNAPRASADAMTRUST.aspx", sourceKind: "official-ttd" } },
  { name: "BNR Sweets & Bakery", existingRecord: "BNR Sweets & Bakery (inventory)", evidence: { quote: "BNR SWEETS & BAKERY Near Ankalamma Temple, Kothapeta, Chandragiri, Tirupati", url: "https://magicpin.in/Tirupati/Chandragiri/Restaurant/Bnr-Sweets-and-Bakery/store/22289", sourceKind: "magicpin-listing" } },
  { name: "Balasubramanyam Tea Stall", existingRecord: "Balasubramanyam Tea Stall (inventory)", evidence: { quote: "Balasubramanyam Tea Stall in Tirumala, Tirupati well known for Tea Stalls in Tirupati. Rated 3.8 based on 6 Customer Reviews", url: "https://www.justdial.com/Tirupati/Balasubramanyam-Tea-Stall-Tirumala/9999PX877-X877-2", sourceKind: "directory-listing" } },
  { name: "Vinayaka Tiffin Centre", existingRecord: "Vinayaka Tiffin Centre (inventory)", evidence: { quote: "Get map of vinayaka tiffin centre, tirumala reddy nagar, mangalam, tirupati, andhra pradesh, 517507", url: "https://www.mappls.com/place-vinayaka+tiffin+centre-tirumala+reddy+nagar-mangalam-tir", sourceKind: "map-listing" } },
  { name: "Nandini Sweets And Bakery, Tiruchanur", existingRecord: "Nandini Sweets And Bakery, Tiruchanur (inventory)", evidence: { quote: "Best Sweet Shops in Tiruchanoor, Tirupati :: Name, Nandhini Bakery And Sweets · Balaji Sweets & Bakery", url: "https://www.justdial.com/Tirupati/Sweet-Shops-in-Tiruchanoor/nct-10465567", sourceKind: "directory-listing" } },
  { name: "Tirumala Bakery And Sweets", existingRecord: "Tirumala Bakery And Sweets (curated worksheet row)", evidence: { quote: "Tirumala Bakery and Sweets is a trusted cake shop in Srinagar Colony, tirupati", url: "https://www.indiacakes.com/cake-shop/tirupati/tirumala-bakery-and-sweets-tirupati", sourceKind: "directory-listing" } },
  { name: "Chillies Restaurant", existingRecord: "Chillies Restaurant (inventory)", evidence: { quote: "Chillies Restaurant | restaurant | 13.6230616,79.4230082 (OSM mapped)", url: "https://nominatim.openstreetmap.org/search?q=restaurant+Tirupati&format=jsonv2&viewbox=79.25,13.78,79.55,13.50&bounded=1", sourceKind: "osm-nominatim" } },
  { name: "Manju Foods", existingRecord: "Manju Foods (inventory)", evidence: { quote: "Manju Foods Family Restaurant (OSM mapped POI; 13.6390546,79.4199634)", url: "https://nominatim.openstreetmap.org/search?q=restaurant+Tirupati&format=jsonv2&viewbox=79.25,13.78,79.55,13.50&bounded=1", sourceKind: "osm-nominatim" } },
  { name: "SVT Tiffin Center", existingRecord: "SVT Tiffin Center (inventory)", evidence: { quote: "Sv Tiffin Center (Renigunta veg-tiffin list)", url: "https://www.justdial.com/Tirupati/Tiffin-Services-For-Veg-Food-in-Renigunta/nct-10481", sourceKind: "directory-listing" } },
  { name: "Amor Fati Cafe", existingRecord: "Amor Fati Cafe (inventory)", evidence: { quote: "Street Food Restaurants in Tirupati · Just Bake · Ps4 Pure Veg Restaurant - Perambur Sri Srinivasa · Amor Fati Cafe · VM Iyer…", url: "https://www.zomato.com/tirupati/restaurants/street-food", sourceKind: "zomato-listing" } },
  { name: "Tea Time, Srinivasa Nagar", existingRecord: "Tea Time, Srinivasa Nagar (inventory, batch-014)", evidence: { quote: "…NAIDU tea stall · Tea Time - Tirupathi", url: "https://biashara.cybo.com/IN/tirumala/mkahawa-wa-chai", sourceKind: "aggregator" } },
  { name: "Di Table 9", existingRecord: "Di Table 9 (inventory)", evidence: { quote: "Restaurants in Tirupati :: Top brands for you · Di Table 9 New · Di Table 9 Restaurant · Di Table 9 · Di Andhra Spic…", url: "https://www.zomato.com/tirupati/restaurants", sourceKind: "zomato-listing" } },
  { name: "Srikalahasteeswara temple", existingRecord: "Srikalahasteeswara temple (inventory)", evidence: { quote: "Incredible India official listing: incredibleindia.gov.in/en/andhra-pradesh/tirupati/srikalahasti-temple", url: "https://www.incredibleindia.gov.in/en/andhra-pradesh/tirupati/srikalahasti-temple", sourceKind: "official-tourism" } },
  { name: "Sri Venugopala Swamy Temple, Karvetinagaram", existingRecord: "Sri Venugopala Swamy Temple, Karvetinagaram (inventory, batch-013 queued)", evidence: { quote: "Karveti Venugopala Swamy temple Is in karvetinagaram, at a distance of 48 kms from Titupati. It was built in 15th century. (Tripadvisor review) — plus official TTD news 'GRAND PUSHPA YAGAM PERFORMED AT SRI VENUGOPALA SWAMY TEMPLE, KARVETINAGARAM'", url: "https://news.tirumala.org/grand-pushpa-yagam-performed-at-sri-venugopala-swamy-temple-karvetinagaram", sourceKind: "official-ttd-news" }, note: "queue lead #87 was proposed for upgrade but the batch-5 dedupe gate proved the temple ALREADY EXISTS — downgraded to corroboration (independent Tripadvisor + official TTD news evidence for the existing record)" },
];

/* ---------------- gates + assembly ---------------- */

/* Queue leads that were FORMALLY UPGRADED to candidates this session —
 * routed via the assessment/lead-check evidence (see review-queue-assessment.json
 * + batch5/search-lead-checks.json), so their presence in the queue corpus is
 * expected and allowed: */
const QUEUE_ROUTED = new Set([
  "seshachalam hills",
  "varahaswami guest house tirumala",
  "indira guest house tirumala",
  "vaikuntam queue complex tirumala",
  "siddeswara swamy temple talakona",
  "sri venugopala swamy temple karvetinagaram",
]);

const allCands = [...FOOD_TPT_CENTRAL, ...FOOD_TIRUMALA, ...FOOD_OTHER, ...NON_FOOD];
const seen = new Set<string>();
for (const c of allCands) {
  const n = norm(c.name);
  if (seen.has(n)) throw new Error(`duplicate candidate within Batch-5: ${c.name}`);
  seen.add(n);
  if (invNorms.has(n)) throw new Error(`ACCEPT collides with inventory: ${c.name}`);
  if (batchNorms.has(n)) throw new Error(`ACCEPT collides with pending batch: ${c.name}`);
  if (wsNorms.has(n)) throw new Error(`ACCEPT collides with curated worksheet: ${c.name}`);
  /* soft gate: flag (not reject) if the name is new to the queue corpus too */
  if (queueNames.has(n) && !QUEUE_ROUTED.has(n)) throw new Error(`ACCEPT already present as queue lead — should have been routed via the queue: ${c.name}`);
}
for (const h of HELD) {
  if (invNorms.has(norm(h.name))) throw new Error(`HELD collides with inventory: ${h.name}`);
}
for (const c of CORROBORATIONS) {
  const n = norm(c.existingRecord.split(" (")[0]);
  if (!invNorms.has(n) && !wsNorms.has(n) && !batchNorms.has(n)) {
    throw new Error(`CORROBORATION target not found in inventory/worksheet/batches: ${c.existingRecord}`);
  }
}

const byArea: Record<string, number> = {};
for (const c of allCands) byArea[c.area] = (byArea[c.area] ?? 0) + 1;
const byCategory: Record<string, number> = {};
for (const c of allCands) byCategory[c.category] = (byCategory[c.category] ?? 0) + 1;
const byTier: Record<string, number> = {};
for (const c of allCands) byTier[c.tier] = (byTier[c.tier] ?? 0) + 1;

const out = {
  task: "batch-5 discovery-candidates ledger",
  assembledOn: RETRIEVED,
  tallies: { acceptedCandidates: allCands.length, held: HELD.length, weakLeads: WEAK_LEADS.length, corroborations: CORROBORATIONS.length, byArea, byCategory, byTier },
  honesty: {
    verificationStatus: "every accepted row imports as verification_status='unverified' — an assessment never self-verifies",
    coordinates: "published OSM coordinates stay in this evidence ledger only; SQL rows import coordinates-NULL (batches 009–014 convention)",
    queue: "weak leads + held leads are review-queue records, counted NOWHERE as inventory or candidates",
  },
  acceptedCandidates: allCands,
  heldLeads: HELD,
  weakLeads: WEAK_LEADS,
  corroborations: CORROBORATIONS,
  discoveryQueries: { plan: "19 bounded locality×category queries (all completed, 0 throttled) + 4 queue-lead checks + 12 bounded Nominatim queries", evidenceFiles: ["batch5/search-discovery-food.json", "batch5/search-lead-checks.json", "batch5/nominatim-food-pois.json"] },
  limitations: [
    "Wikivoyage blocked (HTTP 403) — recorded, not retried",
    "Wikipedia re-fetches rate-limited (HTTP 429, shared egress IP) — the two targeted re-fetches failed; their leads were instead resolved via web_search lead-checks",
    "Srinivasa Mangapuram locality query returned only out-of-city matches — 0 in-scope leads recorded honestly",
    "national chain outlets (Cafe Coffee Day, Just Bake/Justbake, Fnp Cakes, Khetlaapa Chai, Tea Time additional outlets) deliberately skipped — not distinct local places",
  ],
};

const outPath = join(B5, "discovery-candidates.json");
writeFileSync(outPath, JSON.stringify(out, null, 2) + "\n");
console.log(`[batch5-candidates] ${allCands.length} accepted candidates → ${outPath}`);
console.log(`[batch5-candidates] byArea: ${JSON.stringify(byArea)}`);
console.log(`[batch5-candidates] byCategory: ${JSON.stringify(byCategory)}`);
console.log(`[batch5-candidates] held=${HELD.length} weakLeads=${WEAK_LEADS.length} corroborations=${CORROBORATIONS.length}`);
