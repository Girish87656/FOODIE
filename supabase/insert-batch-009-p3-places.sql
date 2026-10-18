-- ============================================================================
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
            lower(btrim('Holiday Inn Tirupati Tirumala')),
            lower(btrim('Lake Valley Resort and Spa')),
            lower(btrim('Starlit Suites')),
            lower(btrim('Tirupati Foods')),
            lower(btrim('Ni Cake World')),
            lower(btrim('Tirumala Cake House')),
            lower(btrim('Lunchbox - Meals & Thalis')),
            lower(btrim('Ps4 Restaurant')),
            lower(btrim('The 99 Pizza')),
            lower(btrim('Desi Family Dhaba And Restaurant')),
            lower(btrim('Nanjundeshwara Bakery & Sweets')),
            lower(btrim('Kolkata Sweet & Foods')),
            lower(btrim('Kouzina Kafe - The Food Court')),
            lower(btrim('Home''s Kitchen'))
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
  (
    '52a44755-9abc-5ee9-ba4b-7b05d78cbc5c'::uuid,
    'Holiday Inn Tirupati Tirumala',
    'hotel',
    'Near Tirupati International Airport, Sri Kalahasti Road, Tirupati, Andhra Pradesh',
    'Tirupati',
    'Tirupati',
    null,          -- coordinates are NEVER estimated (see header)
    null,
    0,             -- rating not captured (UI renders no badge for 0)
    '₹₹',          -- documented neutral default (see header)
    null,
    null,
    array['airport_hotel', 'brand_chain']::text[],
    'p3-research-import',
    'https://www.ihg.com/holidayinn/hotels/us/en/tirupati/tirhi/hoteldetail',
    'unverified'
  ),
  (
    '82d96f9c-4e2b-553b-9e4e-daa34b52499e'::uuid,
    'Lake Valley Resort and Spa',
    'hotel',
    '1-1 Bhakarapata, Talakona Road, Tirupati, Andhra Pradesh',
    'Tirupati',
    'Bhakarapata',
    null,          -- coordinates are NEVER estimated (see header)
    null,
    0,             -- rating not captured (UI renders no badge for 0)
    '₹₹',          -- documented neutral default (see header)
    null,
    null,
    array['resort']::text[],
    'p3-research-import',
    'https://www.makemytrip.com/hotels/lake_valley_resort_and_spa_tirupati-details-tirupati.html',
    'unverified'
  ),
  (
    '471284c4-06f5-5e5c-8584-084068be5b96'::uuid,
    'Starlit Suites',
    'hotel',
    'Temple Town, Behind Sree Convention Centre, Saamavaayi Maargamu, Off Renigunta Road, Tirupati, Andhra Pradesh 517501',
    'Tirupati',
    'Temple Town',
    null,          -- coordinates are NEVER estimated (see header)
    null,
    0,             -- rating not captured (UI renders no badge for 0)
    '₹₹',          -- documented neutral default (see header)
    null,
    null,
    array['resort', 'service_apartment']::text[],
    'p3-research-import',
    'https://www.clubmahindra.com/our-resorts/starlit-suites',
    'unverified'
  ),
  (
    '86841bb2-f380-5918-b656-224c79aeefa2'::uuid,
    'Tirupati Foods',
    'restaurant',
    'Tilak Road, near Municipal Office, Tirupati, Andhra Pradesh',
    'Tirupati',
    'Tilak Road',
    null,          -- coordinates are NEVER estimated (see header)
    null,
    0,             -- rating not captured (UI renders no badge for 0)
    '₹₹',          -- documented neutral default (see header)
    null,
    null,
    '{}'::text[],
    'p3-research-import',
    'https://www.justdial.com/Tirupati/Tirupati-Foods-Near-Muncipal-Office-Tilak-Road/9999PX877-X877-160426145150-G6I2_BZDET',
    'unverified'
  ),
  (
    'fbe67c10-ea4b-5090-b435-5e3e7c75e560'::uuid,
    'Ni Cake World',
    'bakery_sweets',
    'Gandhi Road, Tirupati, Andhra Pradesh',
    'Tirupati',
    'Gandhi Road',
    null,          -- coordinates are NEVER estimated (see header)
    null,
    0,             -- rating not captured (UI renders no badge for 0)
    '₹₹',          -- documented neutral default (see header)
    null,
    null,
    array['bakery']::text[],
    'p3-research-import',
    'https://www.justdial.com/Tirupati/Ni-Cake-world-Gandhi-Road/9999PX877-X877-220612015640-F1X6_BZDET',
    'unverified'
  ),
  (
    '4b931ad7-85af-5261-800f-9305d38ad281'::uuid,
    'Tirumala Cake House',
    'bakery_sweets',
    'Opposite Mahathi Imaging Diagnostics, Bhavani Nagar, Tirupati, Andhra Pradesh',
    'Tirupati',
    'Bhavani Nagar',
    null,          -- coordinates are NEVER estimated (see header)
    null,
    0,             -- rating not captured (UI renders no badge for 0)
    '₹₹',          -- documented neutral default (see header)
    null,
    null,
    array['bakery']::text[],
    'p3-research-import',
    'https://www.justdial.com/Tirupati/Tirumala-Cake-House-Opposite-Mahathi-Imaging-Diagnostics-Bhavani-Nagar/9999PX877-X877-240624122548-K3R9_BZDET',
    'unverified'
  ),
  (
    'a3afcb24-f111-5f01-b56b-cec6a450dc64'::uuid,
    'Lunchbox - Meals & Thalis',
    'restaurant',
    'Korlagunta, Tirupati, Andhra Pradesh',
    'Tirupati',
    'Korlagunta',
    null,          -- coordinates are NEVER estimated (see header)
    null,
    0,             -- rating not captured (UI renders no badge for 0)
    '₹₹',          -- documented neutral default (see header)
    null,
    null,
    array['meals_thali']::text[],
    'p3-research-import',
    'https://magicpin.in/Tirupati/Korlagunta/Restaurant/Lunchbox-Meals-and-Thalis/store/56a6b1',
    'unverified'
  ),
  (
    '8fbd7a4d-917a-57e6-bc30-5d724a952407'::uuid,
    'Ps4 Restaurant',
    'restaurant',
    'Korlagunta, Tirupati, Andhra Pradesh',
    'Tirupati',
    'Korlagunta',
    null,          -- coordinates are NEVER estimated (see header)
    null,
    0,             -- rating not captured (UI renders no badge for 0)
    '₹₹',          -- documented neutral default (see header)
    null,
    null,
    '{}'::text[],
    'p3-research-import',
    'https://magicpin.in/Tirupati/Korlagunta/Restaurant/Ps4-Restaurant,-Tirupati/store/9975ab',
    'unverified'
  ),
  (
    'a868d3a5-81e6-59d3-9a08-dbcffd4d6172'::uuid,
    'The 99 Pizza',
    'restaurant',
    'Abbanna Colony, Korlagunta, Tirupathi 517501, Andhra Pradesh',
    'Tirupati',
    'Korlagunta',
    null,          -- coordinates are NEVER estimated (see header)
    null,
    0,             -- rating not captured (UI renders no badge for 0)
    '₹₹',          -- documented neutral default (see header)
    null,
    null,
    array['pizza']::text[],
    'p3-research-import',
    'https://magicpin.in/Tirupati/Korlagunta/Restaurant/The-99-Pizza/store/1756a49',
    'unverified'
  ),
  (
    '8f5b6b55-4ce9-5dda-810b-137fb2667ab6'::uuid,
    'Desi Family Dhaba And Restaurant',
    'restaurant',
    'Near GITAM University, Nagadenahalli, Doddaballapur, Karnataka',
    'Doddaballapura',
    'Nagadenahalli',
    null,          -- coordinates are NEVER estimated (see header)
    null,
    0,             -- rating not captured (UI renders no badge for 0)
    '₹₹',          -- documented neutral default (see header)
    null,
    null,
    array['dhaba']::text[],
    'p3-research-import',
    'https://www.justdial.com/Bangalore/Desi-Family-Dhaba-And-Restaurant-Near-Gitam-University-Nagadenahalli-Nagadenahalii/080PXX80-XX80-251105213416-R8X7_BZDET',
    'unverified'
  ),
  (
    '65f0aace-1a57-5cef-a64a-1fb59a55dbb8'::uuid,
    'Nanjundeshwara Bakery & Sweets',
    'bakery_sweets',
    'Doddaballapur, Bengaluru Rural District, Karnataka',
    'Doddaballapura',
    'Doddaballapura town',
    null,          -- coordinates are NEVER estimated (see header)
    null,
    0,             -- rating not captured (UI renders no badge for 0)
    '₹₹',          -- documented neutral default (see header)
    null,
    null,
    array['bakery']::text[],
    'p3-research-import',
    'https://www.justdial.com/Bangalore/Nanjundeshwara-Bakery-Sweets-Doddaballapur/080PXX80-XX80-141023151346-K8U4_BZDET',
    'unverified'
  ),
  (
    '8dd66b9a-62b8-5843-b2b7-df2603c9dbc6'::uuid,
    'Kolkata Sweet & Foods',
    'bakery_sweets',
    'Near Provident Welworth City, Doddaballapur, Karnataka',
    'Doddaballapura',
    'Doddaballapur',
    null,          -- coordinates are NEVER estimated (see header)
    null,
    0,             -- rating not captured (UI renders no badge for 0)
    '₹₹',          -- documented neutral default (see header)
    null,
    null,
    array['sweets']::text[],
    'p3-research-import',
    'https://www.justdial.com/Bangalore/Kolkata-Sweet-Foods-Near-Provident-Welworth-City-Doddaballapur/080PXX80-XX80-160603112528-W9N4_BZDET',
    'unverified'
  ),
  (
    'c03a27e8-184b-5f81-b798-1c76a4a23d39'::uuid,
    'Kouzina Kafe - The Food Court',
    'restaurant',
    'Rojipura, Doddaballapura Locality, Doddaballapura, Karnataka',
    'Doddaballapura',
    'Doddaballapura town',
    null,          -- coordinates are NEVER estimated (see header)
    null,
    0,             -- rating not captured (UI renders no badge for 0)
    '₹₹',          -- documented neutral default (see header)
    null,
    null,
    array['food_court']::text[],
    'p3-research-import',
    'https://www.zomato.com/doddaballapura/kouzina-kafe-the-food-court-doddaballapura-locality',
    'unverified'
  ),
  (
    '9dcb300e-74d7-5843-92aa-ec3736b48c0d'::uuid,
    'Home''s Kitchen',
    'restaurant',
    'Doddaballapura Locality, Doddaballapura, Karnataka',
    'Doddaballapura',
    'Doddaballapura town',
    null,          -- coordinates are NEVER estimated (see header)
    null,
    0,             -- rating not captured (UI renders no badge for 0)
    '₹₹',          -- documented neutral default (see header)
    null,
    null,
    '{}'::text[],
    'p3-research-import',
    'https://www.zomato.com/doddaballapura/homes-kitchen-doddaballapura-locality',
    'unverified'
  )
;

-- ---------------------------------------------------------------------------
-- Part 1b — Tirupati destination enrichment (single guarded UPDATE)
-- ---------------------------------------------------------------------------
update public.destinations
   set description = 'Tirupati district, Andhra Pradesh — temple town at the foothills of Tirumala, home to Sri Venkateswara Temple. Official accommodation information is published by TTD at tirumala.org (AccommodationAtTirupati). Foodie''s listing here is a verified-data pilot: every place records its own source link.'
 where slug = 'tirupati'
   and is_active
   and description is distinct from 'Tirupati district, Andhra Pradesh — temple town at the foothills of Tirumala, home to Sri Venkateswara Temple. Official accommodation information is published by TTD at tirumala.org (AccommodationAtTirupati). Foodie''s listing here is a verified-data pilot: every place records its own source link.';

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
            '52a44755-9abc-5ee9-ba4b-7b05d78cbc5c'::uuid,
            '82d96f9c-4e2b-553b-9e4e-daa34b52499e'::uuid,
            '471284c4-06f5-5e5c-8584-084068be5b96'::uuid,
            '86841bb2-f380-5918-b656-224c79aeefa2'::uuid,
            'fbe67c10-ea4b-5090-b435-5e3e7c75e560'::uuid,
            '4b931ad7-85af-5261-800f-9305d38ad281'::uuid,
            'a3afcb24-f111-5f01-b56b-cec6a450dc64'::uuid,
            '8fbd7a4d-917a-57e6-bc30-5d724a952407'::uuid,
            'a868d3a5-81e6-59d3-9a08-dbcffd4d6172'::uuid,
            '8f5b6b55-4ce9-5dda-810b-137fb2667ab6'::uuid,
            '65f0aace-1a57-5cef-a64a-1fb59a55dbb8'::uuid,
            '8dd66b9a-62b8-5843-b2b7-df2603c9dbc6'::uuid,
            'c03a27e8-184b-5f81-b798-1c76a4a23d39'::uuid,
            '9dcb300e-74d7-5843-92aa-ec3736b48c0d'::uuid
   );
  if v_missing <> 14 then
    raise exception 'POSTFLIGHT FAIL: % of the 14 batch rows are missing after apply — the import is incomplete; the transaction will roll back and nothing is written.', v_missing;
  end if;
  raise notice 'POSTFLIGHT OK: all 14 reviewed rows are present.';

  -- (2) verification status untouched
  select count(*) into v_not_unverified from public.restaurants
   where id in (
            '52a44755-9abc-5ee9-ba4b-7b05d78cbc5c'::uuid,
            '82d96f9c-4e2b-553b-9e4e-daa34b52499e'::uuid,
            '471284c4-06f5-5e5c-8584-084068be5b96'::uuid,
            '86841bb2-f380-5918-b656-224c79aeefa2'::uuid,
            'fbe67c10-ea4b-5090-b435-5e3e7c75e560'::uuid,
            '4b931ad7-85af-5261-800f-9305d38ad281'::uuid,
            'a3afcb24-f111-5f01-b56b-cec6a450dc64'::uuid,
            '8fbd7a4d-917a-57e6-bc30-5d724a952407'::uuid,
            'a868d3a5-81e6-59d3-9a08-dbcffd4d6172'::uuid,
            '8f5b6b55-4ce9-5dda-810b-137fb2667ab6'::uuid,
            '65f0aace-1a57-5cef-a64a-1fb59a55dbb8'::uuid,
            '8dd66b9a-62b8-5843-b2b7-df2603c9dbc6'::uuid,
            'c03a27e8-184b-5f81-b798-1c76a4a23d39'::uuid,
            '9dcb300e-74d7-5843-92aa-ec3736b48c0d'::uuid
   )
     and verification_status is distinct from 'unverified';
  if v_not_unverified <> 0 then
    raise exception 'POSTFLIGHT FAIL: % batch row(s) are not ''unverified'' — an import must never set a verification status; rolling back.', v_not_unverified;
  end if;
  raise notice 'POSTFLIGHT OK: every batch row is ''unverified''.';

  -- (3) coordinates stayed NULL (never estimated)
  select count(*) into v_coords from public.restaurants
   where id in (
            '52a44755-9abc-5ee9-ba4b-7b05d78cbc5c'::uuid,
            '82d96f9c-4e2b-553b-9e4e-daa34b52499e'::uuid,
            '471284c4-06f5-5e5c-8584-084068be5b96'::uuid,
            '86841bb2-f380-5918-b656-224c79aeefa2'::uuid,
            'fbe67c10-ea4b-5090-b435-5e3e7c75e560'::uuid,
            '4b931ad7-85af-5261-800f-9305d38ad281'::uuid,
            'a3afcb24-f111-5f01-b56b-cec6a450dc64'::uuid,
            '8fbd7a4d-917a-57e6-bc30-5d724a952407'::uuid,
            'a868d3a5-81e6-59d3-9a08-dbcffd4d6172'::uuid,
            '8f5b6b55-4ce9-5dda-810b-137fb2667ab6'::uuid,
            '65f0aace-1a57-5cef-a64a-1fb59a55dbb8'::uuid,
            '8dd66b9a-62b8-5843-b2b7-df2603c9dbc6'::uuid,
            'c03a27e8-184b-5f81-b798-1c76a4a23d39'::uuid,
            '9dcb300e-74d7-5843-92aa-ec3736b48c0d'::uuid
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
  if v_desc is distinct from 'Tirupati district, Andhra Pradesh — temple town at the foothills of Tirumala, home to Sri Venkateswara Temple. Official accommodation information is published by TTD at tirumala.org (AccommodationAtTirupati). Foodie''s listing here is a verified-data pilot: every place records its own source link.' then
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
