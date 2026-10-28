/**
 * Foodie — TIRUPATI BATCH-6 discovery-candidates assembly (2026-10-28).
 *
 * Turns the Batch-6 evidence (second-source searches, coverage-gap searches,
 * Nominatim town queries) into a REVIEWED candidate ledger, mirroring the
 * batch-5 assembly gates exactly:
 *
 *   accepted     → Batch-016 review-candidate rows (T1/T2 evidence; every row
 *                  carries source URL + verbatim quote; verification_status
 *                  stays UNVERIFIED; coordinates NULL — published OSM/Nominatim
 *                  coordinates stay in the evidence files, never in the SQL)
 *   held         → identity/name-drift-held leads — never imported
 *   weakLead     → recorded in the review queue only (list mentions without
 *                  locality, delivery-area pages, aggregator lists, dated/
 *                  truncated snippets, chain outlets, wrong-city hits) — NOT
 *                  counted as candidates
 *   corroborates → independent evidence for ALREADY-EXISTING inventory /
 *                  pending-batch records — recorded, never a new row
 *
 * Fail-loud gates (identical family to batch-5):
 *   * every accepted name is checked against inventory norms (docs proxy),
 *     batches 011–015 norms, curated-worksheet norms (name AND rawNames
 *     aliases), the batch-6 review-queue file, and the within-batch set;
 *   * a base-name check (canonical name minus its area suffix) guards the
 *     locality-less canonicals already frozen in earlier batches;
 *   * every corroboration target must exist in inventory/worksheet/batches;
 *   * counts are recomputed from the tables, never hardcoded.
 *
 * Notable rejections this pass (recorded honestly):
 *   * 'Otc Orion Tiffin Centre, Korlagunta' → CORROBORATION (inventory row
 *     'OTC — Orion Tiffin Centre, Korlagunta' already exists);
 *   * 'Padamavathi Tiffin Center, Tirumala' → CORROBORATION (inventory row
 *     exists; worksheet T3 area tirumala);
 *   * 'Sri Kalyana Venkateswara Swamy Temple, Srinivasa Mangapuram' →
 *     CORROBORATION (inventory VERIFIED, already a batch-011 candidate);
 *   * all Kathmandu-Chandragiri cafés and Chennai-Perambur "Renigunta"
 *     restaurants → out-of-scope (their own published coordinates prove the
 *     wrong city: 27.7N/85.2E and 13.1N/80.1E).
 *
 * Usage: bun scripts/foodie-enrichment/batch6-discovery-candidates.ts
 */

import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const HERE = dirname(fileURLToPath(import.meta.url));
const EV = join(HERE, "evidence", "tirupati-master");
const B6 = join(EV, "batch6");
mkdirSync(B6, { recursive: true });
const RETRIEVED = new Date().toISOString().slice(0, 10);

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
const stripSuffix = (n: string) => norm(n).replace(/ (tirumala|tirupati|tiruchanoor|tiruchanur|chandragiri|renigunta|talakona|mangalam|korlagunta|akkarampalli|srikalahasti|bhavani nagar|kapila teertham road|renigunta locality|pn road|srinivasa mangapuram|tata nagar|thondavada)$/, "");

/* ---------------- existing universes (for dedupe gates) ---------------- */

const invMd = readFileSync(join(HERE, "..", "..", "docs", "tirupati-place-inventory.md"), "utf8");
const inventoryNames: string[] = [];
for (const m of invMd.matchAll(/^\| ([^|]+) \| (VERIFIED|PARTIALLY VERIFIED|UNVERIFIED|AMBIGUOUS)/gm)) inventoryNames.push(m[1].trim());
const invNorms = new Set(inventoryNames.map(norm));

const batchSqls = [
  "insert-batch-011-p4-places.sql",
  "insert-batch-012-tptm-master.sql",
  "insert-batch-013-tptm-b2.sql",
  "insert-batch-014-tptm-b3.sql",
  "insert-batch-015-tptm-b5.sql",
];
const batchNames: string[] = [];
for (const f of batchSqls) {
  const sql = readFileSync(join(HERE, "..", "..", "supabase", "review-candidates", f), "utf8");
  for (const m of sql.matchAll(/^    '([^']+)',$/gm)) batchNames.push(m[1].replace(/''/g, "'"));
}
const batchNorms = new Set(batchNames.map(norm));
const batchBaseNorms = new Set(batchNames.map(stripSuffix));

const ws = JSON.parse(readFileSync(join(HERE, "worksheets", "tirupati-master-curated.json"), "utf8")) as {
  rows: Array<{ name: string; rawNames?: string[] }>;
};
const wsNameNorms = new Set<string>();
for (const r of ws.rows) {
  wsNameNorms.add(norm(r.name));
  for (const raw of r.rawNames ?? []) wsNameNorms.add(norm(raw));
}

const queue6 = JSON.parse(readFileSync(join(B6, "review-queue-batch6.json"), "utf8")) as { entries: Array<{ name: string }> };
const queue6Norms = new Set(queue6.entries.map((e) => norm(e.name)));

/* ---------------- explicit evidence tables ---------------- */

type Evidence = { quote: string; url: string; sourceKind: string };
type Cand = {
  name: string;
  area: string;
  category: string;          // food categories | "hotel" | "attraction"
  placeType?: "hotel" | "other";
  evidence: Evidence;
  tier: "T1" | "T2";
  note?: string;
};

/* — small food businesses found while covering the weak cells — */
const FOOD: Cand[] = [
  { name: "Kakinada Subbbayya Gari Hotel, Kapila Teertham Road", area: "tpt-neighbourhoods", category: "restaurant", tier: "T2", evidence: { quote: "Kapila Teertham Road, Tirupati Restaurants :: Di Andhra Spice Family Restaurant. Di Table 9 Restaurant. Kakinada Subbbayya Gari Hotel. Kwalitys Spicy.", url: "https://www.zomato.com/tirupati/kapila-teertham-road-restaurants", sourceKind: "zomato-listing" }, note: "T2: locality from the zomato area-page subject (Kapila Teertham Road), venue-own page not captured" },
  { name: "Aroma Coffee House, Kapila Teertham Road", area: "tpt-neighbourhoods", category: "cafe", tier: "T2", evidence: { quote: "Kapila Teertham Road, Tirupati Restaurants · Lotus Marasa Sarovar Premiere · Aroma Coffee House · The Vintage Cafe · Shawarma Den", url: "https://www.zomato.com/tirupati/kapila-teertham-road-restaurants", sourceKind: "zomato-listing" }, note: "T2: locality from the zomato area-page subject" },
  { name: "The Vintage Cafe, Kapila Teertham Road", area: "tpt-neighbourhoods", category: "cafe", tier: "T2", evidence: { quote: "Kapila Teertham Road, Tirupati Restaurants · Lotus Marasa Sarovar Premiere · Aroma Coffee House · The Vintage Cafe · Shawarma Den", url: "https://www.zomato.com/tirupati/kapila-teertham-road-restaurants", sourceKind: "zomato-listing" }, note: "T2: locality from the zomato area-page subject" },
  { name: "Good Luck Family Dhaba, Renigunta Locality", area: "renigunta", category: "restaurant", tier: "T1", evidence: { quote: "Good Luck Family Dhaba - Renigunta Locality :: Restaurants in Tirupati, Tirupati Restaurants, Renigunta Locality restaurants, Best Renigunta Locality restaurants", url: "https://www.zomato.com/tirupati/good-luck-family-dhaba-renigunta", sourceKind: "zomato-listing" } },
  { name: "Sreenivasa Reddy Dhaba, Renigunta Locality", area: "renigunta", category: "restaurant", tier: "T2", evidence: { quote: "Sreenivasa Reddy Dhaba Menu, Takeaway & Online :: ... Renigunta Locality, Tirupati ... Check our detailed Sreenivasa Reddy Dhaba location guide", url: "https://fuddo.in/sreenivasa-reddy-dhaba-renigunta", sourceKind: "directory-listing" }, note: "T2: fuddo is a smaller ordering directory" },
  { name: "Shree Dhaba House, Akkarampalli", area: "tpt-neighbourhoods", category: "restaurant", tier: "T1", evidence: { quote: "SHREE DHABA HOUSE Beside Kajariya Tiles Near To D Mart Akkarampalli, tirupati", url: "https://www.justdial.com/Tirupati/Dhaba-Restaurants-in-Karakambadi", sourceKind: "directory-listing" }, note: "Akkarampalli is on the northern Renigunta Road corridor of the city" },
  { name: "MSD Tiffin Centre, PN Road, Srikalahasti", area: "surrounding", category: "tiffin", tier: "T1", evidence: { quote: "Get map of msd tiffin centre, pn road, srikalahasti, andhra pradesh, 517644 by Mappls", url: "https://www.mappls.com/msd-tiffin-centre-pn-road-srikalahasti", sourceKind: "map-listing" }, note: "Srikalahasti is a distinct surrounding temple town (~36 km) — never presented as Tirupati city" },
  { name: "Kalahasteeswara Tiffens, Srikalahasti", area: "surrounding", category: "tiffin", tier: "T1", evidence: { quote: "Kalahasteeswara Tiffens in Srikalahasti well known for Tiffin Services in Srikalahasti. Rated 4.7 based on 7 Customer Reviews and", url: "https://www.justdial.com/Srikalahasti/Kalahasteeswara-Tiffens", sourceKind: "directory-listing" } },
];

/* — stays (places.place_type 'hotel') found while covering the 0c stays cells — */
const STAYS: Cand[] = [
  { name: "Srinivasa Hotel, Srinivasa Mangapuram", area: "srinivasa-mangapuram", category: "hotel", placeType: "hotel", tier: "T1", evidence: { quote: "SRINIVASA HOTEL, Behind Srinivasa Mangapuram Temple, New Tirupati - Madanapalli Highway, TIRUPATI, A.P.", url: "https://srinivasahotels.com", sourceKind: "official-business" }, note: "own official business site with full address; distinct from the worksheet's generic T3 aggregator row 'Srinivasa Mangapuram hotels & places to stay'" },
  { name: "Sreekanth Lodge, Mangalam", area: "tpt-neighbourhoods", category: "hotel", placeType: "hotel", tier: "T1", evidence: { quote: "Sreekanth Lodge - Mangalam Tirupati :: 3.4 (49)· Mangalam Tirupati, Tata Nagar, Tirupati, Andhra Pradesh 517501", url: "https://magicpin.in/Tirupati/Mangalam/Sreekanth-Lodge", sourceKind: "directory-listing" } },
  { name: "Sun Lights Lodge, Tata Nagar", area: "tpt-central", category: "hotel", placeType: "hotel", tier: "T1", evidence: { quote: "Address of Sun Lights Lodge. Tata Nagar, Tirupati | 6 minutes walk to Tirupati Central Bus Station.", url: "https://www.makemytrip.com/hotels/sun-lights-lodge-tata-nagar", sourceKind: "directory-listing" } },
  { name: "Kittu Home Stay, Chandragiri", area: "chandragiri", category: "hotel", placeType: "hotel", tier: "T2", evidence: { quote: "hotels near chandragiri fort in tirupati, price starting from ₹574 ; Kittu Home Stay · 1.7 km from Chandragiri Fort", url: "https://www.ixigo.com/hotels-near-chandragiri-fort-tirupati", sourceKind: "directory-listing" }, note: "T2: locality by the ixigo page subject + distance anchor to the fort" },
  { name: "Kandy PLR Hotel, Thondavada", area: "chandragiri", category: "hotel", placeType: "hotel", tier: "T2", evidence: { quote: "Kandy PLR Hotel. Thondavada | 4.7 km from Chandragiri Fort | 9.8", url: "https://www.goibibo.com/hotels/kandy-plr-hotel-thondavada", sourceKind: "directory-listing" }, note: "Thondavada sits on the Tirupati–Chandragiri road; recorded under chandragiri with the honest Thondavada locality text" },
  { name: "Mgr Residency, Srikalahasti", area: "surrounding", category: "hotel", placeType: "hotel", tier: "T2", evidence: { quote: "Mgr Residency · 7 minutes walk to Srikalahasti Temple", url: "https://ae.makemytrip.global/hotels-near-srikalahasti-temple", sourceKind: "directory-listing" } },
  { name: "Raj Residency, Srikalahasti", area: "surrounding", category: "hotel", placeType: "hotel", tier: "T2", evidence: { quote: "Raj Residency (New). 9 minutes walk to Sri Kalahasti Railway Station", url: "https://www.makemytrip.com/hotels-near-sri-kalahasti-railway-station", sourceKind: "directory-listing" } },
  { name: "Kalahasteeswara Residency, Srikalahasti", area: "surrounding", category: "hotel", placeType: "hotel", tier: "T2", evidence: { quote: "Kalahasteeswara Residency. 10 minutes walk to Sri Kalahasti Railway Station", url: "https://www.makemytrip.com/hotels-near-sri-kalahasti-railway-station", sourceKind: "directory-listing" } },
  { name: "APTDC Haritha Hotel, Srikalahasti", area: "surrounding", category: "hotel", placeType: "hotel", tier: "T2", evidence: { quote: "APTDC Hotel (Haritha) — OSM mapped POI; published location 13.7306928,79.6706815, display name inside Srikalahasti (coordinates stay evidence-only)", url: "https://nominatim.openstreetmap.org/search?q=hotel+Srikalahasti&format=jsonv2", sourceKind: "osm-nominatim" } },
];

/* — attractions — */
const ATTRACTIONS: Cand[] = [
  { name: "Srivari Mettu, Srinivasa Mangapuram", area: "srinivasa-mangapuram", category: "attraction", placeType: "other", tier: "T2", evidence: { quote: "Chandragiri, India: All You Must Know Before You Go :: Sri Kalyana Venkateswaraswami Temple. 4.7 · Srivari Mettu. 4.8 · Tirumala Temple. 4.5", url: "https://www.tripadvisor.com/Tourism-g2282318-Chandragiri_Chittoor_District_Andhra_Pradesh-Vacations.html", sourceKind: "tripadvisor-listing" }, note: "the second (divya) footpath to Tirumala starting near Srinivasa Mangapuram; distinct from the Alipiri footpath already in inventory" },
];

/* — identity/name-drift HELD leads (never imported) — */
const HELD: Array<{ name: string; reason: string; evidence: Evidence }> = [
  { name: "Ganapathi Juice Center, MR Palli", reason: "NAME-DRIFT GUARD: inventory already has 'Ganapathi Juice Shop' (Tilak Road, corroborated batch-5); 'Ganapathi Juice Center' at 'Tirupati Market / MR Palli area' plausibly the same business under a drifted name with conflicting locality — reconcile before any import", evidence: { quote: "This video showcases the Ganapathi Juice Center, a local juice shop located at Tirupati Market in Tirupati ... MR Palli area.", url: "https://www.facebook.com/watch", sourceKind: "facebook-page" } },
  { name: "Chillies Food Paradise, Renigunta Road", reason: "NAME-DRIFT GUARD: inventory has 'Chillies Restaurant'; 'Chillies Food Paradise' on the Renigunta Road punjabi-restaurants page may be the same brand/venue under a drifted name — reconcile first", evidence: { quote: "Best Punjabi Restaurants in Renigunta Road, Tirupati - Order Food Online · Chillies Food Paradise · Maa Aathidyam Multi Cuisine Re…", url: "https://www.justdial.com/Tirupati/punjabi-restaurants-renigunta-road", sourceKind: "directory-listing" } },
];

/* — weak leads (review queue ONLY; not candidates) — */
const WEAK_LEADS: Array<{ name: string; area: string; reason: string; evidence: Evidence }> = [
  { name: "Sri Vinayaka Reddy Mess, Tada", area: "surrounding", reason: "well-formed zomato listing but Tada is a far-north locality with no other recorded infrastructure in this inventory yet — queued as the first Tada lead rather than accepted as an isolated candidate", evidence: { quote: "Sri Vinayaka Reddy Mess, Tada,Tirupati order online ; Chicken Fry. ₹199 · Mutton curry. ₹319", url: "https://www.zomato.com/tirupati/sri-vinayaka-reddy-mess-tada", sourceKind: "zomato-listing" } },
  { name: "Jyothi Tea Stall, Mr Palli Circle", area: "tpt-neighbourhoods", reason: "category-page entry; the locality is the PAGE subject (Mr Palli Circle), not in the venue's own line ('Jyothi Tea Stall. -No rating. Tirupati.')", evidence: { quote: "Top Stall in Mr Palli Circle - Best Stall Tirupati near me :: Jyothi Tea Stall. -No rating. Tirupati.", url: "https://www.justdial.com/Tirupati/stalls-mr-palli-circle", sourceKind: "directory-listing" } },
  { name: "Venu Tea Stall, beside MR Palle PS", area: "tpt-neighbourhoods", reason: "instagram vlog list mention only", evidence: { quote: "4. 30ML Cafe (tiruchanur flyover bridge) 5. Taaza Kitchen (Mangalam Road) 6. Venu tea stall (beside mr palle ps) 7. Zam Zam (tiruc…", url: "https://www.instagram.com/reel/chaiwithvenky", sourceKind: "aggregator" } },
  { name: "30ML Cafe, Tiruchanur", area: "tiruchanur", reason: "instagram vlog list mention only", evidence: { quote: "4. 30ML Cafe (tiruchanur flyover bridge) 5. Taaza Kitchen (Mangalam Road)…", url: "https://www.instagram.com/reel/chaiwithvenky", sourceKind: "aggregator" } },
  { name: "Orion Restaurant, Tirupati", area: "tpt-neighbourhoods", reason: "tripadvisor page; locality only via truncated 'Kapila Theertham' cross-links; possible relation to inventory 'OTC — Orion Tiffin Centre' — reconcile first", evidence: { quote: "ORION RESTAURANT, Tirupati - Restaurant Reviews :: AsiaIndiaAndhra PradeshChittoor District TirupatiTirupati Restaurants Orion Restaurant ... Kapila Theertham Hotels near Sri Varaha…", url: "https://www.tripadvisor.co.nz/Restaurants-orion-tirupati", sourceKind: "tripadvisor-listing" } },
  { name: "Kwalitys Spicy, Kapila Teertham Road", area: "tpt-neighbourhoods", reason: "name truncated in the zomato area-page snippet", evidence: { quote: "Kapila Teertham Road, Tirupati Restaurants · Di Table 9 Restaurant. 25 min. Kakinada Subbbayya Gari Hotel. 28 min. Kwalitys Spicy.", url: "https://www.zomato.com/tirupati/kapila-teertham-road-restaurants", sourceKind: "zomato-listing" } },
  { name: "Lotus Marasa Sarovar Premiere, Kapila Teertham Road", area: "tpt-neighbourhoods", reason: "hotel-restaurant inside a branded hotel; needs venue-level decision (same family as the batch-5 'Vyom/Zodiac' weak leads)", evidence: { quote: "Kapila Teertham Road, Tirupati Restaurants · Lotus Marasa Sarovar Premiere · Aroma Coffee House…", url: "https://www.zomato.com/tirupati/kapila-teertham-road-restaurants", sourceKind: "zomato-listing" } },
  { name: "Maa Aathidyam Multi Cuisine Restaurant", area: "tpt-neighbourhoods", reason: "appears across justdial road pages (Srinivasa Mangapuram Road / Renigunta Road / Karakambadi) with no consistent own-locality line — identity unresolvable from stored snippets", evidence: { quote: "Best Restaurants in Srinivasa Mangapuram Road, Tirupati ; Name, Maa Aathidyam Multi Cuisine Restaurant · Barkaas Indo Arabic Restaurant", url: "https://www.justdial.com/Tirupati/restaurants-srinivasa-mangapuram-road", sourceKind: "directory-listing" } },
  { name: "Barkaas Indo Arabic Restaurant", area: "tpt-neighbourhoods", reason: "justdial road-page list mention, no own locality", evidence: { quote: "Name, Maa Aathidyam Multi Cuisine Restaurant · Barkaas Indo Arabic Restaurant", url: "https://www.justdial.com/Tirupati/restaurants-srinivasa-mangapuram-road", sourceKind: "directory-listing" } },
  { name: "Dabba & Co., Tiruchanoor", area: "tiruchanur", reason: "swiggy DELIVERY-AREA page ('Order Online Delivery Restaurants In Tiruchanoor') — delivery zone, not necessarily venue locality", evidence: { quote: "Best Places to Order Food Online in Tiruchanoor ; PS4 Veg Restaurant (Perambur Sri Srinivasa). 4.5 ; Dabba & Co. 4 ; Truth Bowl. 4", url: "https://www.swiggy.com/city/tirupati/order-online-tiruchanoor", sourceKind: "swiggy-listing" } },
  { name: "Truth Bowl, Tiruchanoor", area: "tiruchanur", reason: "swiggy delivery-area page (see above)", evidence: { quote: "Best Places to Order Food Online in Tiruchanoor ; Dabba & Co. 4 ; Truth Bowl. 4", url: "https://www.swiggy.com/city/tirupati/order-online-tiruchanoor", sourceKind: "swiggy-listing" } },
  { name: "Sri Krishna Swamy Temple, Tiruchanur", area: "tiruchanur", reason: "single tour-operator blog source; queued pending an official/second source", evidence: { quote: "Key attractions include the Sri Padmavathi Ammavari Temple, Sri Krishna Swamy Temple, the sacred Padma Sarovaram (temple tank)", url: "https://tirupatibalajitourstravels.com/tiruchanur", sourceKind: "blog" } },
  { name: "Padma Sarovaram, Tiruchanur", area: "tiruchanur", reason: "single tour-operator blog source; queued pending an official/second source", evidence: { quote: "…the sacred Padma Sarovaram (temple tank)…", url: "https://tirupatibalajitourstravels.com/tiruchanur", sourceKind: "blog" } },
  { name: "Sri Ranganatha Swamy Temple, Tiruchanur", area: "tiruchanur", reason: "truncated bestbus list mention ('Sri Ranganatha Swamy…')", evidence: { quote: "Tiruchanur is popular tourist destination with visiting places like Alamelu Manga or Padmavathi devi temple, Sri Ranganatha Swamy…", url: "https://www.bestbus.in/tiruchanur", sourceKind: "aggregator" } },
  { name: "Tiffin Center Bahadur Pet, Srikalahasti", area: "surrounding", reason: "generic name ('Tiffin Center') with locality-as-name — venue identity unresolved", evidence: { quote: "Top Tiffin Services With Veg Options Available in Government Hospital Road, Srikalahasti. Tiffin Center Bahadur Pet, Opens at 08:", url: "https://www.justdial.com/Srikalahasti/tiffin-government-hospital-road", sourceKind: "directory-listing" } },
  { name: "Hotel Nivaara By VYDA, Renigunta", area: "renigunta", reason: "booking.com snippet says 'set in Tirupati' — Renigunta attribution unconfirmed", evidence: { quote: "Hotel Nivaara By VYDA is set in Tirupati. This 4-star hotel offers a tour desk.", url: "https://www.booking.com/hotel-nivaara-vyda", sourceKind: "directory-listing" } },
  { name: "Hotel Agarala Residency", area: "tpt-neighbourhoods", reason: "city-level only ('located in the heart of Tirupati'); no locality line", evidence: { quote: "Hotel Agarala Residency located in Tirupati, India. +1 (888) 385-8465 … cozy 1-star hotel located in the heart of Tirupati, India", url: "https://www.travelated.com/agarala-residency", sourceKind: "aggregator" } },
  { name: "Sri Lakshmi Thulasi Residency, Mangalam", area: "tpt-neighbourhoods", reason: "listed on a Mangalam hotels page but its own line says 'Near Temple kt road' — locality conflict unresolved", evidence: { quote: "Hotels in Mangalam, Tirupati - Page 3 ; Sri Lakshmi Thulasi Residency · 36 Ratings. Near Temple kt road", url: "https://www.justdial.com/Tirupati/hotels-mangalam-page-3", sourceKind: "directory-listing" } },
  { name: "Chandragiri Archaeological Museum (Raja Mahal)", area: "chandragiri", reason: "inside the Chandragiri Fort complex already in inventory — needs a venue-level decision whether the museum is a distinct place", evidence: { quote: "One of the striking features of the Fort is the Raja Mahal, which is now an archaeological Museum.", url: "https://www.culturalindiatours.com/chandragiri", sourceKind: "blog" } },
  { name: "Zodiac Multicuisine Restaurant, near Chandragiri Fort", area: "chandragiri", reason: "hotel-restaurant; the batch-5 queue already holds 'Zodiac' with no locality — this adds '2.45 km from Chandragiri Fort' but stays a venue-level decision", evidence: { quote: "1. Zodiac Multicuisine Restaurant, 2.45 km from Chandragiri Fort · 2. Dojin Smart Restaurant, 4.6 km from Chandragiri Fort", url: "https://us.trip.com/chandragiri-fort-things-to-do", sourceKind: "tripadvisor-listing" } },
  { name: "Erpedu Airport Hotel, Renigunta", area: "renigunta", reason: "truncated expedia snippet", evidence: { quote: "Conveniently stay near the airport with a Erpedu Airport hotel. Find deals on stays close to Tirupati (TIR) from $15.", url: "https://www.expedia.com/tirupati-airport-hotels", sourceKind: "aggregator" } },
];

/* — corroborations of existing records — (target = the exact existing name
 *   the gate must find in inventory/worksheet/batches) */
const CORROBORATIONS: Array<{ name: string; target: string; existingRecord: string; evidence: Evidence; note?: string }> = [
  { name: "Sri Kalyana Venkateswara Swamy Temple, Srinivasa Mangapuram", target: "Sri Kalyana Venkateswara Swamy Temple, Srinivasa Mangapuram", existingRecord: "Sri Kalyana Venkateswara Swamy Temple, Srinivasa Mangapuram (inventory VERIFIED, batch-011)", evidence: { quote: "The ancient temple of Sri Kalyana Venkateswara Swamy is located in Srinivasa Mangapuram, about 12 km to West Tirupati in Chittoor district. (tirumala.org MoreTemples.aspx)", url: "https://www.tirumala.org/MoreTemples.aspx", sourceKind: "official-ttd" }, note: "proposed as a candidate during the coverage pass; the dedupe gate proved the temple already exists — downgraded to corroboration" },
  { name: "OTC — Orion Tiffin Centre, Korlagunta", target: "OTC — Orion Tiffin Centre, Korlagunta", existingRecord: "OTC — Orion Tiffin Centre, Korlagunta (inventory)", evidence: { quote: "Best 24 Hours Tiffin Services in Akkarampalli, Tirupati :: Otc Orion Tiffin Centre Korlagunta, tirupati. Menu.", url: "https://www.justdial.com/Tirupati/24-hours-tiffin-akkarampalli", sourceKind: "directory-listing" }, note: "re-found during the Cherlopalli/Satyanarayanapuram coverage query — proposed as a candidate, downgraded by the gate" },
  { name: "Padamavathi Tiffin Center", target: "Padamavathi Tiffin Center", existingRecord: "Padamavathi Tiffin Center (inventory UNVERIFIED; worksheet T3, area tirumala)", evidence: { quote: "Padamavathi Tiffin Center in Tirumala,Tirupati :: Sri Guru Tiffin Centre · Muraga Tiffins · Vishnu Padam Tiffin Center…", url: "https://www.justdial.com/Tirupati/Padamavathi-Tiffin-Center-Tirumala", sourceKind: "directory-listing" }, note: "re-found during the Cherlopalli coverage query — proposed as a candidate, downgraded by the base-name gate" },
  { name: "Sri Venkateshwara Bakery & Sweets, Bhavani Nagar", target: "Sri Venkateshwara Bakery And Sweets", existingRecord: "Sri Venkateshwara Bakery And Sweets (inventory UNVERIFIED; worksheet T3, tpt-neighbourhoods, locality-less)", evidence: { quote: "Sri Venkateshwara Bakery & Sweets, Leela Mahal Road, RS Gardens, Bhavani Nagar, Tirupati, Andhra Pradesh, 517501 by Mappls.", url: "https://www.mappls.com/sri-venkateshwara-bakery-sweets-leela-mahal-road", sourceKind: "map-listing" }, note: "found as a batch-6 candidate, downgraded by the drift review: the worksheet already freezes the canonical 'Sri Venkateshwara Bakery And Sweets' (T3, locality-less) — the '& Sweets' variant is trivial drift of the SAME venue. VALUE: this mappls listing RESOLVES the frozen row's locality (Leela Mahal Road, RS Gardens, Bhavani Nagar) — the independent verify pass this session also area-confirmed the frozen row; the worksheet row (not a new batch row) carries the resolution" },
];

/* ---------------- gates + assembly (fail-loud) ---------------- */

const allCands = [...FOOD, ...STAYS, ...ATTRACTIONS];
const seen = new Set<string>();
const seenBases = new Set<string>();
for (const c of allCands) {
  const n = norm(c.name);
  if (seen.has(n)) throw new Error(`duplicate candidate within Batch-6: ${c.name}`);
  seen.add(n);
  if (invNorms.has(n)) throw new Error(`ACCEPT collides with inventory: ${c.name}`);
  if (batchNorms.has(n)) throw new Error(`ACCEPT collides with pending batch 011–015: ${c.name}`);
  if (wsNameNorms.has(n)) throw new Error(`ACCEPT collides with curated worksheet: ${c.name}`);
  if (queue6Norms.has(n)) throw new Error(`ACCEPT collides with the batch-6 review queue: ${c.name}`);
  const b = stripSuffix(c.name);
  if (batchBaseNorms.has(b)) throw new Error(`ACCEPT base-name collides with a frozen locality-less canonical in batches 011–015: ${c.name}`);
  seenBases.add(b);
}
for (const h of HELD) {
  if (invNorms.has(norm(h.name))) throw new Error(`HELD collides with inventory: ${h.name}`);
}
for (const c of CORROBORATIONS) {
  const n = norm(c.target);
  if (!invNorms.has(n) && !wsNameNorms.has(n) && !batchNorms.has(n)) {
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
  task: "batch-6 discovery-candidates ledger",
  assembledOn: RETRIEVED,
  tallies: { acceptedCandidates: allCands.length, held: HELD.length, weakLeads: WEAK_LEADS.length, corroborations: CORROBORATIONS.length, byArea, byCategory, byTier },
  honesty: {
    verificationStatus: "every accepted row imports as verification_status='unverified' — an assessment never self-verifies",
    coordinates: "published OSM/Nominatim coordinates stay in the evidence files only; SQL rows import coordinates-NULL (batches 009–015 convention)",
    queue: "weak leads + held leads are review-queue records, counted NOWHERE as inventory or candidates",
    wrongCity: "Nominatim name-matches in Kathmandu-Chandragiri (27.7N/85.2E) and Chennai-Perambur (13.1N/80.1E) were REJECTED as out-of-scope on their own published coordinates",
  },
  acceptedCandidates: allCands,
  heldLeads: HELD,
  weakLeads: WEAK_LEADS,
  corroborations: CORROBORATIONS,
  discoveryQueries: {
    plan: "ONE availability probe + 40 second-source venue queries + 18 coverage-gap queries (8s pacing, breaker never tripped) + 9 Nominatim town queries (2s pacing)",
    evidenceFiles: [
      "batch6/websearch-probe.json",
      "batch6/food-second-sources.json",
      "batch6/food-second-sources-assessment.json",
      "batch6/search-coverage-gaps.json",
      "batch6/nominatim2-town-pois.json",
    ],
  },
  limitations: [
    "Srinivasa Mangapuram: the town itself still has essentially no in-scope food POIs in any source — ONE hotel (Srinivasa Hotel, official site) + the corroborated temple; honest near-zero",
    "Renigunta stays: chain/'Hotel O' (OYO-family) outlets deliberately skipped; non-chain results lacked Renigunta locality lines",
    "Kapila Teertham Road entries are zomato area-page T2 evidence — venue-own pages not captured this pass",
    "Srikalahasti stays: three makemytrip listings with walk-distance anchors — T2 grade only",
    "Tiruchanur food: only swiggy delivery-area page evidence (T3) — queued, not accepted",
  ],
};

const outPath = join(B6, "discovery-candidates.json");
writeFileSync(outPath, JSON.stringify(out, null, 2) + "\n");
console.log(`[batch6-candidates] ${allCands.length} accepted candidates → ${outPath}`);
console.log(`[batch6-candidates] byArea: ${JSON.stringify(byArea)}`);
console.log(`[batch6-candidates] byCategory: ${JSON.stringify(byCategory)}`);
console.log(`[batch6-candidates] held=${HELD.length} weakLeads=${WEAK_LEADS.length} corroborations=${CORROBORATIONS.length}`);
