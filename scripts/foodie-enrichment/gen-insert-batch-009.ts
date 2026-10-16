/**
 * Foodie — gen-insert-batch-009: Prototype 3 verified places (Tirupati Area A
 * + GITAM corridor expansion), generated from the human-reviewed worksheet.
 *
 * INPUT  worksheets/places-p3.json (35 researched candidates) + the documented
 *        human-review decisions below (approvals, merges, exclusions).
 * OUTPUT supabase/insert-batch-009-p3-places.sql — PROPOSED, never executed by
 *        this pipeline. Execution happens ONLY via Supabase SQL Editor after
 *        explicit user approval (same protocol as batches 005-008).
 *
 * Review decisions (2026-10-14, applied to the 35 researched rows):
 *   APPROVED (14 unique businesses; duplicates merged to their best listing):
 *     Tirupati (9): Holiday Inn Tirupati Tirumala (official ihg.com + agoda
 *       evidence, "Near Tirupati International Airport, Sri Kalahasti Road"),
 *       Lake Valley Resort and Spa (booking + makemytrip, "1-1 Bhakarapata,
 *       Talakona Road"), Starlit Suites (official clubmahindra + mmt, "Temple
 *       Town, Behind Sree Convention Centre, Off Renigunta Road, 517501"),
 *       Tirupati Foods (justdial, Tilak Road), Ni Cake World (justdial, Gandhi
 *       Road), Tirumala Cake House (justdial, Bhavani Nagar — verify search
 *       failed but the justdial URL+title both name Tirupati/Bhavani Nagar),
 *       Lunchbox - Meals & Thalis (magicpin, Korlagunta — same discovery-URL
 *       evidence rule), Ps4 Restaurant (magicpin, Korlagunta), The 99 Pizza
 *       (magicpin, Korlagunta, "Abbanna Colony, Tirupathi - 517501").
 *     GITAM corridor (5): Desi Family Dhaba And Restaurant (justdial URL
 *       names "Near-Gitam-University-Nagadenahalli"), Nanjundeshwara Bakery &
 *       Sweets (justdial URL names Doddaballapur), Kolkata Sweet & Foods
 *       (justdial, "Near Provident Welworth City", addr evidence OK), Kouzina
 *       Kafe - The Food Court (zomato, Doddaballapura Locality — 3 listing
 *       variants merged), Home's Kitchen (zomato URL names doddaballapura).
 *   EXCLUDED (21 rows — every exclusion recorded here, not silently dropped):
 *     - "Tirupati Lodge Pvt Ltd" + 3 booking-site variants: SAME-NAME TRAP —
 *       addresses prove Siliguri/Gangtok (Bojoghari Gangtok; Ramnagar colony,
 *       Near NJP Station, Siliguri), NOT Tirupati city.
 *     - Platform DIRECTORY pages (not businesses): "Bakery Restaurants in
 *       Tirupati" (zomato), "Tirupati Restaurants" (zomato), "Food Delivery
 *       Restaurants in Tirupati" (swiggy), "Tirumala Restaurants, Tirupati"
 *       (zomato), "Tamil Restaurants in Tirupati" (zomato), "Outlets in
 *       Tirupati" (magicpin), "Doddaballapura City restaurants" (zomato),
 *       "Street Food in Nandi Circle - Khau Galli" (justdial nct category).
 *     - "Birthday Cake in Tirupati" (jdmart catalog descriptor, not a name).
 *   IDENTITY NEGATIVES (requirement: Epicruise/Hangouts included IF verified):
 *     - "Epicruise": NO food business exists under that name in the corridor —
 *       the only hit is EPICRUISE INTERNATIONAL TRADING (OPC) PRIVATE LIMITED
 *       (MCA registry, zaubacorp), a trading company. Both query phrasings
 *       returned no food establishment. EXCLUDED.
 *     - "Hangouts": no corridor establishment found — hits are an Instagram
 *       campus-life reel, a Hyderabad PDF and a "Hangouts Restaurant" in
 *       Hassan 573201 (~200 km away). EXCLUDED.
 *
 * Coordinates: deliberately NULL for every row (name-based geocoding risks
 * the wrong-pin fabrication failure mode; the app renders the honest
 * "Location pending verification" state and directions still work via the
 * name+address Google Maps search URL). Nominatim was attempted per candidate
 * and recorded in evidence/places-p3/geocode-*.json (no OSM POI coverage).
 *
 * Menus: place-level source_url IS the menu source link (zomato/magicpin/
 * justdial/official listing). NO dish rows are generated — no snippet carried
 * exact item+price evidence, and fabricating menu rows is forbidden.
 *
 * price_level: '₹₹' neutral default where the listing evidence did not carry
 * a usable band (documented per the honesty notes in the header of batch-005).
 * rating: 0 = "not captured" (RatingBadge renders nothing for 0 — honest).
 */

import { writeFileSync } from "fs";
import { createHash } from "crypto";
import { join } from "path";

const ROOT = process.cwd();

/** Deterministic UUIDv5-style id (sha1, RFC-4122 v5 formatting). */
const NAMESPACE = "6d3a0f5e-7b1c-4a2e-9d84-2f6a1c9e0b31"; // foodie/p3-places (fixed)
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

interface Row {
  name: string;
  category: string;
  address: string;
  city: string;
  locality: string | null;
  tags: string[];
  sourceUrl: string;
  evidence: string;
}

const ROWS: Row[] = [
  // ---------------- Area A — Tirupati (city "Tirupati") ----------------
  {
    name: "Holiday Inn Tirupati Tirumala",
    category: "hotel",
    address: "Near Tirupati International Airport, Sri Kalahasti Road, Tirupati, Andhra Pradesh",
    city: "Tirupati",
    locality: "Tirupati",
    tags: ["airport_hotel", "brand_chain"],
    sourceUrl: "https://www.ihg.com/holidayinn/hotels/us/en/tirupati/tirhi/hoteldetail",
    evidence: "official ihg.com property page; agoda listing corroborates ('Near Tirupati International Airport, Sri Kalahasti Road')",
  },
  {
    name: "Lake Valley Resort and Spa",
    category: "hotel",
    address: "1-1 Bhakarapata, Talakona Road, Tirupati, Andhra Pradesh",
    city: "Tirupati",
    locality: "Bhakarapata",
    tags: ["resort"],
    sourceUrl: "https://www.makemytrip.com/hotels/lake_valley_resort_and_spa_tirupati-details-tirupati.html",
    evidence: "makemytrip listing with street evidence ('1-1 Bhakarapata'); booking.com corroborates",
  },
  {
    name: "Starlit Suites",
    category: "hotel",
    address: "Temple Town, Behind Sree Convention Centre, Saamavaayi Maargamu, Off Renigunta Road, Tirupati, Andhra Pradesh 517501",
    city: "Tirupati",
    locality: "Temple Town",
    tags: ["resort", "service_apartment"],
    sourceUrl: "https://www.clubmahindra.com/our-resorts/starlit-suites",
    evidence: "official clubmahindra.com page; address corroborated by 4 independent listings (Renigunta Road, 517501)",
  },
  {
    name: "Tirupati Foods",
    category: "restaurant",
    address: "Tilak Road, near Municipal Office, Tirupati, Andhra Pradesh",
    city: "Tirupati",
    locality: "Tilak Road",
    tags: [],
    sourceUrl: "https://www.justdial.com/Tirupati/Tirupati-Foods-Near-Muncipal-Office-Tilak-Road/9999PX877-X877-160426145150-G6I2_BZDET",
    evidence: "justdial business page ('in Tilak Road, Tirupati', near Municipal Office)",
  },
  {
    name: "Ni Cake World",
    category: "bakery_sweets",
    address: "Gandhi Road, Tirupati, Andhra Pradesh",
    city: "Tirupati",
    locality: "Gandhi Road",
    tags: ["bakery"],
    sourceUrl: "https://www.justdial.com/Tirupati/Ni-Cake-world-Gandhi-Road/9999PX877-X877-220612015640-F1X6_BZDET",
    evidence: "justdial business page ('in Gandhi Road, Tirupati - Bakeries')",
  },
  {
    name: "Tirumala Cake House",
    category: "bakery_sweets",
    address: "Opposite Mahathi Imaging Diagnostics, Bhavani Nagar, Tirupati, Andhra Pradesh",
    city: "Tirupati",
    locality: "Bhavani Nagar",
    tags: ["bakery"],
    sourceUrl: "https://www.justdial.com/Tirupati/Tirumala-Cake-House-Opposite-Mahathi-Imaging-Diagnostics-Bhavani-Nagar/9999PX877-X877-240624122548-K3R9_BZDET",
    evidence: "justdial business page; URL+title name Tirupati/Bhavani Nagar (search-verify inconclusive — approved on listing-URL identity evidence)",
  },
  {
    name: "Lunchbox - Meals & Thalis",
    category: "restaurant",
    address: "Korlagunta, Tirupati, Andhra Pradesh",
    city: "Tirupati",
    locality: "Korlagunta",
    tags: ["meals_thali"],
    sourceUrl: "https://magicpin.in/Tirupati/Korlagunta/Restaurant/Lunchbox-Meals-and-Thalis/store/56a6b1",
    evidence: "magicpin business page ('Lunchbox - Meals & Thalis, Korlagunta, Tirupati')",
  },
  {
    name: "Ps4 Restaurant",
    category: "restaurant",
    address: "Korlagunta, Tirupati, Andhra Pradesh",
    city: "Tirupati",
    locality: "Korlagunta",
    tags: [],
    sourceUrl: "https://magicpin.in/Tirupati/Korlagunta/Restaurant/Ps4-Restaurant,-Tirupati/store/9975ab",
    evidence: "magicpin business page ('Ps4 Restaurant, Tirupati, Korlagunta, Tirupati')",
  },
  {
    name: "The 99 Pizza",
    category: "restaurant",
    address: "Abbanna Colony, Korlagunta, Tirupathi 517501, Andhra Pradesh",
    city: "Tirupati",
    locality: "Korlagunta",
    tags: ["pizza"],
    sourceUrl: "https://magicpin.in/Tirupati/Korlagunta/Restaurant/The-99-Pizza/store/1756a49",
    evidence: "magicpin business page with street evidence ('Abbanna Colony, Tirupathi - 517501')",
  },
  // ------------- Area B expansion — GITAM corridor (city "Doddaballapura") -------------
  {
    name: "Desi Family Dhaba And Restaurant",
    category: "restaurant",
    address: "Near GITAM University, Nagadenahalli, Doddaballapur, Karnataka",
    city: "Doddaballapura",
    locality: "Nagadenahalli",
    tags: ["dhaba"],
    sourceUrl: "https://www.justdial.com/Bangalore/Desi-Family-Dhaba-And-Restaurant-Near-Gitam-University-Nagadenahalli-Nagadenahalii/080PXX80-XX80-251105213416-R8X7_BZDET",
    evidence: "justdial business page; URL slug names 'Near-Gitam-University-Nagadenahalli' (search-verify failed on the typo'd listing title — approved on listing-URL identity evidence)",
  },
  {
    name: "Nanjundeshwara Bakery & Sweets",
    category: "bakery_sweets",
    address: "Doddaballapur, Bengaluru Rural District, Karnataka",
    city: "Doddaballapura",
    locality: "Doddaballapura town",
    tags: ["bakery"],
    sourceUrl: "https://www.justdial.com/Bangalore/Nanjundeshwara-Bakery-Sweets-Doddaballapur/080PXX80-XX80-141023151346-K8U4_BZDET",
    evidence: "justdial business page; URL slug names Doddaballapur",
  },
  {
    name: "Kolkata Sweet & Foods",
    category: "bakery_sweets",
    address: "Near Provident Welworth City, Doddaballapur, Karnataka",
    city: "Doddaballapura",
    locality: "Doddaballapur",
    tags: ["sweets"],
    sourceUrl: "https://www.justdial.com/Bangalore/Kolkata-Sweet-Foods-Near-Provident-Welworth-City-Doddaballapur/080PXX80-XX80-160603112528-W9N4_BZDET",
    evidence: "justdial business page with area evidence ('in Doddaballapur, Bangalore' + near Provident Welworth City)",
  },
  {
    name: "Kouzina Kafe - The Food Court",
    category: "restaurant",
    address: "Rojipura, Doddaballapura Locality, Doddaballapura, Karnataka",
    city: "Doddaballapura",
    locality: "Doddaballapura town",
    tags: ["food_court"],
    sourceUrl: "https://www.zomato.com/doddaballapura/kouzina-kafe-the-food-court-doddaballapura-locality",
    evidence: "zomato business page under city doddaballapura (3 listing variants merged)",
  },
  {
    name: "Home's Kitchen",
    category: "restaurant",
    address: "Doddaballapura Locality, Doddaballapura, Karnataka",
    city: "Doddaballapura",
    locality: "Doddaballapura town",
    tags: [],
    sourceUrl: "https://www.zomato.com/doddaballapura/homes-kitchen-doddaballapura-locality",
    evidence: "zomato business page under city doddaballapura (found via the zomato city directory evidence, then its own listing URL confirmed)",
  },
];

// Stripped tracking params sanity-check: magicpin ?srsltid= removed above.
for (const r of ROWS) {
  if (/\?srsltid=|utm_/.test(r.sourceUrl)) throw new Error(`tracking param in ${r.name}`);
}

const TIRUPATI_DESC =
  "Tirupati district, Andhra Pradesh — temple town at the foothills of Tirumala, home to Sri Venkateswara Temple. Official accommodation information is published by TTD at tirumala.org (AccommodationAtTirupati). Foodie's listing here is a verified-data pilot: every place records its own source link.";

const sql = `-- ============================================================================
-- Foodie — INSERT BATCH 009: Prototype 3 verified places (14 rows)
--             Area A: Tirupati, Andhra Pradesh (9)
--             Area B expansion: GITAM–Doddaballapura corridor (5)
-- ----------------------------------------------------------------------------
-- STATUS:  PROPOSED — generated from worksheets/places-p3.json + the documented
--          human-review decisions in scripts/foodie-enrichment/gen-insert-batch-009.ts.
--          The research pipeline has NO database write path: this file runs ONLY
--          via Supabase Dashboard -> SQL Editor after explicit user approval.
--          Re-runs are no-ops? NO — fixed ids make a partial re-run FAIL the
--          preflight duplicate guard and abort (by design: nothing partial).
--
-- HONESTY CONTRACT (identical to batches 005-008):
--   * Every row carries its OWN source_url (official brand page where one
--     exists, else the researched listing page — which is also the menu
--     source link for food businesses).
--   * verification_status is 'unverified' on every row — an import NEVER
--     self-verifies; verification timestamps/booleans stay NULL.
--   * rating 0 = "not captured" (the UI renders no rating badge for 0).
--   * price_level '₹₹' is the documented neutral default where the listing
--     evidence carried no usable band.
--   * latitude/longitude NULL by design (never estimated); the UI shows the
--     honest "Location pending verification" state and directions work via
--     the name+address Google Maps search URL.
--   * NO dish rows: no snippet carried exact item+price evidence. The
--     place-level source link is the menu source; structured dishes land
--     only from reviewed menu evidence in a later batch.
--   * NO photos: no license-verified, identity-correct photo exists (344
--     candidates / 0 approved in the deep pass; nothing fabricated here).
--   * Epicruise and Hangouts: verified NOT to exist as food businesses in
--     the corridor (Epicruise = a trading company per the MCA registry hit;
--     Hangouts = a Hassan restaurant ~200 km away + unrelated hits). The
--     requirement conditioned their inclusion on identity verification —
--     they failed it, with the evidence recorded in the worksheet.
--
-- TIRUPATI DESTINATION ENRICHMENT (Part 1b): the destinations row gains
-- verified district information + the official TTD accommodation link
-- (tirumala.org) captured during discovery. Single-row guarded UPDATE.
--
-- GUARDS (REV 1):
--   PREFLIGHT  — restaurants baseline must be exactly 77 (the audited
--                post-batch-008 state); none of the 14 names may already
--                exist (no duplicates); no row may already carry the
--                p3-research-import marker; the Tirupati destination row
--                must exist.
--   POSTFLIGHT — all 14 fixed ids present with 'unverified' status and NULL
--                coordinates; city counts exact (Tirupati 9, Doddaballapura
--                82); no verification timestamp/boolean set; destinations
--                description updated exactly once. ANY violation RAISES →
--                the trailing COMMIT becomes a full ROLLBACK; NOTHING is
--                written.
-- ============================================================================

begin;

-- ---------------------------------------------------------------------------
-- Part 0 — PREFLIGHT (aborts before any write when the world changed)
-- ---------------------------------------------------------------------------
do $$
declare
  v_count integer;
  v_dupes integer;
  v_markers integer;
  v_dest text;
begin
  -- (a) baseline: exactly the audited 77-restaurant state
  select count(*) into v_count from public.restaurants;
  if v_count <> 77 then
    raise exception 'PREFLIGHT FAIL: restaurants row count is %, expected exactly 77 (the audited baseline). The table changed outside this review — re-run the review before importing.', v_count;
  end if;
  raise notice 'PREFLIGHT OK: restaurants baseline = 77.';

  -- (b) no duplicates: none of the 14 names may already exist (any city)
  select count(*) into v_dupes from public.restaurants
   where lower(btrim(name)) in (
      ${ROWS.map((r) => `      lower(btrim(${sq(r.name)}))`).join(",\n      ")}
   );
  if v_dupes <> 0 then
    raise exception 'PREFLIGHT FAIL: % of the 14 reviewed names already exist — importing would duplicate rows. Re-run the review.', v_dupes;
  end if;
  raise notice 'PREFLIGHT OK: no name collisions with the 14 reviewed rows.';

  -- (c) marker hygiene: no row already carries this batch's marker
  select count(*) into v_markers from public.restaurants where source = 'p3-research-import';
  if v_markers <> 0 then
    raise exception 'PREFLIGHT FAIL: % row(s) already carry the p3-research-import marker — the batch was (partially) applied before. Re-run the review.', v_markers;
  end if;
  raise notice 'PREFLIGHT OK: p3-research-import marker unused.';

  -- (d) the Tirupati destination row must exist for the Part 1b enrichment
  select name into v_dest from public.destinations where slug = 'tirupati' and is_active;
  if v_dest is null then
    raise exception 'PREFLIGHT FAIL: the active tirupati destination row is missing — destination enrichment impossible.';
  end if;
  raise notice 'PREFLIGHT OK: tirupati destination row present (%).', v_dest;
end
$$;

-- ---------------------------------------------------------------------------
-- Part 1 — INSERTS (14 reviewed rows; fixed ids; full provenance)
-- ---------------------------------------------------------------------------
insert into public.restaurants
  (id, name, category, address, city, locality, latitude, longitude, rating, price_level, opening_hours, phone, tags, source, source_url, verification_status)
values
${ROWS.map((r) => `  (
    '${uuid5(`foodie-p3:${r.city}:${r.name}`)}'::uuid,
    ${sq(r.name)},
    ${sq(r.category)},
    ${sq(r.address)},
    ${sq(r.city)},
    ${r.locality ? sq(r.locality) : "null"},
    null,          -- coordinates are NEVER estimated (see header)
    null,
    0,             -- rating not captured (UI renders no badge for 0)
    '₹₹',          -- documented neutral default (see header)
    null,
    null,
    ${r.tags.length ? `array[${r.tags.map(sq).join(", ")}]::text[]` : "'{}'::text[]"},
    'p3-research-import',
    ${sq(r.sourceUrl)},
    'unverified'
  )`).join(",\n")}
;

-- ---------------------------------------------------------------------------
-- Part 1b — Tirupati destination enrichment (single guarded UPDATE)
-- ---------------------------------------------------------------------------
update public.destinations
   set description = ${sq(TIRUPATI_DESC)}
 where slug = 'tirupati'
   and is_active
   and description is distinct from ${sq(TIRUPATI_DESC)};

-- ---------------------------------------------------------------------------
-- Part 2 — POSTFLIGHT: hard guards (any violation rolls back EVERYTHING)
-- ---------------------------------------------------------------------------
do $$
declare
  v_missing integer;
  v_not_unverified integer;
  v_coords integer;
  v_tirupati integer;
  v_doddaballapura integer;
  v_desc text;
begin
  -- (1) all 14 fixed ids present
  select count(*) into v_missing from public.restaurants
   where id in (
      ${ROWS.map((r) => `      '${uuid5(`foodie-p3:${r.city}:${r.name}`)}'::uuid`).join(",\n      ")}
   );
  if v_missing <> ${ROWS.length} then
    raise exception 'POSTFLIGHT FAIL: % of the ${ROWS.length} batch rows are missing after apply — the import is incomplete; the transaction will roll back and nothing is written.', v_missing;
  end if;
  raise notice 'POSTFLIGHT OK: all ${ROWS.length} reviewed rows are present.';

  -- (2) verification status untouched
  select count(*) into v_not_unverified from public.restaurants
   where id in (
      ${ROWS.map((r) => `      '${uuid5(`foodie-p3:${r.city}:${r.name}`)}'::uuid`).join(",\n      ")}
   )
     and verification_status is distinct from 'unverified';
  if v_not_unverified <> 0 then
    raise exception 'POSTFLIGHT FAIL: % batch row(s) are not ''unverified'' — an import must never set a verification status; rolling back.', v_not_unverified;
  end if;
  raise notice 'POSTFLIGHT OK: every batch row is ''unverified''.';

  -- (3) coordinates stayed NULL (never estimated)
  select count(*) into v_coords from public.restaurants
   where id in (
      ${ROWS.map((r) => `      '${uuid5(`foodie-p3:${r.city}:${r.name}`)}'::uuid`).join(",\n      ")}
   )
     and (latitude is not null or longitude is not null);
  if v_coords <> 0 then
    raise exception 'POSTFLIGHT FAIL: % batch row(s) carry coordinates — imports never estimate them; rolling back.', v_coords;
  end if;
  raise notice 'POSTFLIGHT OK: no coordinates were estimated.';

  -- (4) exact city counts: Area A = 9 new Tirupati rows, corridor = 77 + 5
  select count(*) into v_tirupati from public.restaurants where city = 'Tirupati';
  select count(*) into v_doddaballapura from public.restaurants where city = 'Doddaballapura';
  if v_tirupati <> 9 then
    raise exception 'POSTFLIGHT FAIL: Tirupati city count is %, expected exactly 9; rolling back.', v_tirupati;
  end if;
  if v_doddaballapura <> 82 then
    raise exception 'POSTFLIGHT FAIL: Doddaballapura city count is %, expected exactly 82 (77 audited + 5 new); rolling back.', v_doddaballapura;
  end if;
  raise notice 'POSTFLIGHT OK: Tirupati = 9, Doddaballapura = 82.';

  -- (5) the destination enrichment landed exactly once
  select description into v_desc from public.destinations where slug = 'tirupati';
  if v_desc is distinct from ${sq(TIRUPATI_DESC)} then
    raise exception 'POSTFLIGHT FAIL: the tirupati destination description was not updated as reviewed; rolling back.';
  end if;
  raise notice 'POSTFLIGHT OK: tirupati destination description updated.';
end
$$;

-- ---------------------------------------------------------------------------
-- The file ends with COMMIT: the whole batch (preflight + inserts +
-- postflight guards) runs atomically in one SQL-Editor session. If ANY guard
-- fails, the exception aborts the transaction and the commit never runs —
-- the database is left exactly as it was.
-- ---------------------------------------------------------------------------

commit;
`;

const out = join(ROOT, "supabase", "insert-batch-009-p3-places.sql");
writeFileSync(out, sql);
console.log(`[gen-009] wrote ${out} (${ROWS.length} rows)`);
console.log("[gen-009] ids:");
for (const r of ROWS) console.log(`   ${uuid5(`foodie-p3:${r.city}:${r.name}`)}  ${r.name}`);
