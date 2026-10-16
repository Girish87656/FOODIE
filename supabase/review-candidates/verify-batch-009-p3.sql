-- ============================================================================
-- Foodie — Batch-009 REV 2 (Prototype 3) — READ-ONLY VERIFICATION PROBE
-- ----------------------------------------------------------------------------
-- FILE STATUS: READ-ONLY PROBE. Writes NOTHING. Safe to run any number of
--   times, BOTH BEFORE and AFTER the Batch-009 REV 2 import. This file is NOT
--   the import; the import candidate is
--   supabase/review-candidates/insert-batch-009-p3-places-revised.sql
--   (SHA-256 c74e43399bd53eeaa3ab2aec59262c469f60f5809a83a9981271757d6e334629)
--   and must only be run after a human reviews this probe's output.
--
-- SAFETY
--   * ONLY SELECT statements and read-only CTEs (WITH ... SELECT). No
--     INSERT / UPDATE / DELETE / UPSERT / DDL / DO blocks / transactions /
--     locks / function calls with side effects. Running it changes nothing.
--   * Contains no secrets, keys or connection strings; prints none.
--
-- HOW TO RUN
--   Supabase Dashboard -> SQL Editor -> New query -> paste this WHOLE file ->
--   Run. One labelled result grid per numbered section, in order.
--
-- SCHEMA SOURCE OF TRUTH (no column name is invented; every column below is
--   defined in committed repo artifacts and was re-verified as existing on
--   the live database via read-only probes — see
--   supabase/review-candidates/insert-batch-009-p3-places-launch-notes.md §3):
--   * public.restaurants  : supabase/schema.sql + migration-001 (tags,
--     locality, verification_status) + the executed batch-002 ALTER
--     (latitude/longitude nullable) + migration-005 (source, source_url,
--     last_verified_at, address_verified, coordinates_verified,
--     hours_verified, photos_verified).
--   * public.destinations : supabase/migration-003 (slug UNIQUE, name,
--     description, is_active).
--   * restaurants <-> destinations: NO foreign key exists. Destination-level
--     place counts in this project are counted by restaurants.city — the app
--     (src/lib/foodie/destinationMatch.ts) matches destinations to places by
--     city, and the REV 2 candidate's own postflight counts by city.
--     Section 2 reports those city counts; Section 3 reports the destination
--     ENTITY rows separately.
--
-- MARKER CONVENTION (as hardcoded in the REV 2 candidate's guards)
--   Batch-009 rows carry restaurants.source = 'p3-research-import' plus a
--   populated source_url.
--
-- HOW TO INTERPRET — expected values are CHECKS for the reader, NOT
--   assertions hardcoded in this script (the script only reports facts):
--
--   PRE-IMPORT (baseline last read-verified 2026-10-16):
--     §1  total = 77
--     §2  Tirupati 0 / Doddaballapura 77 / other 0 (both grids)
--     §4  marker rows = 0
--     §5  all 9 present = false (missing = 9)
--     §6  rows_found = 0 and every violation column = 0 (vacuously clean)
--     §7  tirupati destination rows = 1, active = 1;
--         description_matches_rev2_candidate = false (live placeholder)
--     §8  all 5 held rows present_violation_if_true = false
--     §9  all 9 retained names present = false; all 5 held names = false
--
--   POST-IMPORT (if the REV 2 candidate committed exactly as designed):
--     §1  total = 86  (= 77 + 9)
--     §2  Tirupati 6 / Doddaballapura 80 / other 0
--     §4  marker rows = 9, all on the 9 batch ids, 0 elsewhere
--     §5  all 9 present = true; each row verification_status 'unverified',
--         latitude/longitude NULL, rating 0, price_level '₹₹',
--         source 'p3-research-import', source_url populated
--     §6  rows_found = 9 and every violation column = 0
--     §7  rows = 1, active = 1; description_matches_rev2_candidate = true
--     §8  all 5 held rows still absent
--     §9  all 9 retained names present (1 row each); held names absent
--
--   The import has NOT been confirmed as executed — do not assume either
--   column of results; read what the grids actually say. A MIXED state
--   (e.g. some of the 9 present but marker rows ≠ 9, or total neither 77
--   nor 86) means a partial application or external drift — STOP, do not
--   re-import, and re-run the full review.
--
--   CAVEAT: if migration-005 were ever rolled back on the target, the
--   source/source_url/verification-column references in §5/§6 would fail
--   with "column does not exist" — that is the conservative failure mode
--   (same behaviour as the candidate's postflight). Report it; do not guess.
-- ============================================================================


-- ---------------------------------------------------------------------------
-- §1 — TOTAL RESTAURANT COUNT
--      pre-import: 77    |    post-import: 86 (= 77 + 9)
-- ---------------------------------------------------------------------------
select count(*) as restaurants_total
from public.restaurants;


-- ---------------------------------------------------------------------------
-- §2a — RESTAURANT COUNTS BY DESTINATION (grouped by restaurants.city)
--       In this schema there is no restaurants->destinations foreign key;
--       destination-level counts are by city (see header). This grid lists
--       EVERY city present, so drift outside the two batch areas is visible.
--       pre-import: Doddaballapura 77 | post-import: Tirupati 6,
--                                                Doddaballapura 80
-- ---------------------------------------------------------------------------
select
  city,
  count(*) as places,
  case
    when city = 'Tirupati'       then 'batch-009 Area A (Tirupati, Andhra Pradesh)'
    when city = 'Doddaballapura' then 'batch-009 Area B (GITAM-Doddaballapura corridor)'
    else 'not touched by batch-009'
  end as batch_009_scope
from public.restaurants
group by city
order by places desc, city asc;


-- ---------------------------------------------------------------------------
-- §2b — RESTAURANT COUNTS BY DESTINATION (explicit two-area row)
--       One row, always returned, even when a city has 0 places.
--       pre-import: 0 / 77 / 0    |    post-import: 6 / 80 / 0
-- ---------------------------------------------------------------------------
select
  count(*) filter (where city = 'Tirupati')                        as tirupati_places,
  count(*) filter (where city = 'Doddaballapura')                  as doddaballapura_places,
  count(*) filter (where city not in ('Tirupati', 'Doddaballapura')) as other_cities_places
from public.restaurants;


-- ---------------------------------------------------------------------------
-- §3 — DESTINATION ENTITY ROWS (public.destinations; separate from city
--      counts — context for §7). Known live: bengaluru, mumbai, tirupati.
-- ---------------------------------------------------------------------------
select
  id,
  slug,
  name,
  is_active
from public.destinations
order by slug asc;


-- ---------------------------------------------------------------------------
-- §4 — BATCH-009 SOURCE MARKER ('p3-research-import') COUNTS
--      pre-import: 0 / 0 / 0
--      post-import: 9 total, 9 on the 9 batch ids, 0 elsewhere
-- ---------------------------------------------------------------------------
select
  count(*)                                                       as p3_marker_rows_total,
  count(*) filter (
    where id in (
      '52a44755-9abc-5ee9-ba4b-7b05d78cbc5c'::uuid,
      '471284c4-06f5-5e5c-8584-084068be5b96'::uuid,
      '86841bb2-f380-5918-b656-224c79aeefa2'::uuid,
      'fbe67c10-ea4b-5090-b435-5e3e7c75e560'::uuid,
      '8fbd7a4d-917a-57e6-bc30-5d724a952407'::uuid,
      'a868d3a5-81e6-59d3-9a08-dbcffd4d6172'::uuid,
      '65f0aace-1a57-5cef-a64a-1fb59a55dbb8'::uuid,
      '8dd66b9a-62b8-5843-b2b7-df2603c9dbc6'::uuid,
      'c03a27e8-184b-5f81-b798-1c76a4a23d39'::uuid
    )
  )                                                              as p3_marker_rows_on_batch9_ids,
  count(*) filter (
    where id not in (
      '52a44755-9abc-5ee9-ba4b-7b05d78cbc5c'::uuid,
      '471284c4-06f5-5e5c-8584-084068be5b96'::uuid,
      '86841bb2-f380-5918-b656-224c79aeefa2'::uuid,
      'fbe67c10-ea4b-5090-b435-5e3e7c75e560'::uuid,
      '8fbd7a4d-917a-57e6-bc30-5d724a952407'::uuid,
      'a868d3a5-81e6-59d3-9a08-dbcffd4d6172'::uuid,
      '65f0aace-1a57-5cef-a64a-1fb59a55dbb8'::uuid,
      '8dd66b9a-62b8-5843-b2b7-df2603c9dbc6'::uuid,
      'c03a27e8-184b-5f81-b798-1c76a4a23d39'::uuid
    )
  )                                                              as p3_marker_rows_other_ids
from public.restaurants
where source = 'p3-research-import';


-- ---------------------------------------------------------------------------
-- §5 — THE NINE EXPECTED BATCH-009 UUIDs: PRESENCE + FULL DETAIL
--      Always returns exactly 9 rows (one per expected id), whether or not
--      the rows exist — absent rows show present = false with NULL fields.
--      pre-import: all present = false
--      post-import: all present = true; each row verification_status
--      'unverified', latitude/longitude NULL, rating 0, price_level '₹₹',
--      source 'p3-research-import', source_url populated
-- ---------------------------------------------------------------------------
with expected(ord, id, expected_name, expected_city) as (
  values
    (1, '52a44755-9abc-5ee9-ba4b-7b05d78cbc5c'::uuid, 'Holiday Inn Tirupati Tirumala', 'Tirupati'),
    (2, '471284c4-06f5-5e5c-8584-084068be5b96'::uuid, 'Starlit Suites',                'Tirupati'),
    (3, '86841bb2-f380-5918-b656-224c79aeefa2'::uuid, 'Tirupati Foods',                'Tirupati'),
    (4, 'fbe67c10-ea4b-5090-b435-5e3e7c75e560'::uuid, 'Ni Cake World',                 'Tirupati'),
    (5, '8fbd7a4d-917a-57e6-bc30-5d724a952407'::uuid, 'Ps4 Restaurant',                'Tirupati'),
    (6, 'a868d3a5-81e6-59d3-9a08-dbcffd4d6172'::uuid, 'The 99 Pizza',                  'Tirupati'),
    (7, '65f0aace-1a57-5cef-a64a-1fb59a55dbb8'::uuid, 'Nanjundeshwara Bakery & Sweets','Doddaballapura'),
    (8, '8dd66b9a-62b8-5843-b2b7-df2603c9dbc6'::uuid, 'Kolkata Sweet & Foods',         'Doddaballapura'),
    (9, 'c03a27e8-184b-5f81-b798-1c76a4a23d39'::uuid, 'Kouzina Kafe - The Food Court', 'Doddaballapura')
)
select
  e.ord,
  e.id,
  (r.id is not null)          as present,
  e.expected_name,
  r.name                      as actual_name,
  e.expected_city,
  r.city                      as actual_city,
  r.verification_status,
  r.latitude,
  r.longitude,
  r.rating,
  r.price_level,
  r.source                    as source_marker,
  r.source_url
from expected e
left join public.restaurants r on r.id = e.id
order by e.ord asc;


-- ---------------------------------------------------------------------------
-- §5b — PRESENCE SUMMARY for the 9 expected ids
--       pre-import: 0 present / 9 missing    |    post-import: 9 / 0
-- ---------------------------------------------------------------------------
with expected(id) as (
  values
    ('52a44755-9abc-5ee9-ba4b-7b05d78cbc5c'::uuid),
    ('471284c4-06f5-5e5c-8584-084068be5b96'::uuid),
    ('86841bb2-f380-5918-b656-224c79aeefa2'::uuid),
    ('fbe67c10-ea4b-5090-b435-5e3e7c75e560'::uuid),
    ('8fbd7a4d-917a-57e6-bc30-5d724a952407'::uuid),
    ('a868d3a5-81e6-59d3-9a08-dbcffd4d6172'::uuid),
    ('65f0aace-1a57-5cef-a64a-1fb59a55dbb8'::uuid),
    ('8dd66b9a-62b8-5843-b2b7-df2603c9dbc6'::uuid),
    ('c03a27e8-184b-5f81-b798-1c76a4a23d39'::uuid)
)
select
  count(*) filter (where r.id is not null) as batch9_present,
  count(*) filter (where r.id is null)     as batch9_missing
from expected e
left join public.restaurants r on r.id = e.id;


-- ---------------------------------------------------------------------------
-- §6 — INVARIANT CHECK ON THE 9 EXPECTED ROWS (actual schema columns)
--      Aggregates only rows that exist; missing rows are not counted.
--      pre-import: rows_found 0, all violation columns 0 (vacuous)
--      post-import: rows_found 9 and EVERY violation column 0 — i.e. all 9
--      remain 'unverified' with NULL coordinates, rating 0, price '₹₹',
--      the p3-research-import marker, a populated source_url, and NULL
--      verification timestamp/booleans (an import never self-verifies).
-- ---------------------------------------------------------------------------
with batch9(id) as (
  values
    ('52a44755-9abc-5ee9-ba4b-7b05d78cbc5c'::uuid),
    ('471284c4-06f5-5e5c-8584-084068be5b96'::uuid),
    ('86841bb2-f380-5918-b656-224c79aeefa2'::uuid),
    ('fbe67c10-ea4b-5090-b435-5e3e7c75e560'::uuid),
    ('8fbd7a4d-917a-57e6-bc30-5d724a952407'::uuid),
    ('a868d3a5-81e6-59d3-9a08-dbcffd4d6172'::uuid),
    ('65f0aace-1a57-5cef-a64a-1fb59a55dbb8'::uuid),
    ('8dd66b9a-62b8-5843-b2b7-df2603c9dbc6'::uuid),
    ('c03a27e8-184b-5f81-b798-1c76a4a23d39'::uuid)
)
select
  count(*) as rows_found,
  count(*) filter (where verification_status is distinct from 'unverified') as not_unverified,
  count(*) filter (where latitude is not null or longitude is not null)     as with_coordinates,
  count(*) filter (where rating is distinct from 0)                          as rating_not_zero,
  count(*) filter (where price_level is distinct from '₹₹')                  as price_not_rr,
  count(*) filter (where source is distinct from 'p3-research-import')       as marker_missing_or_wrong,
  count(*) filter (where source_url is null or btrim(source_url) = '')       as source_url_missing_or_blank,
  count(*) filter (
    where last_verified_at     is not null
       or address_verified     is not null
       or coordinates_verified is not null
       or hours_verified       is not null
       or photos_verified      is not null
  )                                                                          as verification_fields_set
from public.restaurants r
where r.id in (
  '52a44755-9abc-5ee9-ba4b-7b05d78cbc5c'::uuid,
  '471284c4-06f5-5e5c-8584-084068be5b96'::uuid,
  '86841bb2-f380-5918-b656-224c79aeefa2'::uuid,
  'fbe67c10-ea4b-5090-b435-5e3e7c75e560'::uuid,
  '8fbd7a4d-917a-57e6-bc30-5d724a952407'::uuid,
  'a868d3a5-81e6-59d3-9a08-dbcffd4d6172'::uuid,
  '65f0aace-1a57-5cef-a64a-1fb59a55dbb8'::uuid,
  '8dd66b9a-62b8-5843-b2b7-df2603c9dbc6'::uuid,
  'c03a27e8-184b-5f81-b798-1c76a4a23d39'::uuid
);


-- ---------------------------------------------------------------------------
-- §7a — TIRUPATI DESTINATION ROW COUNT (read-only; nothing modified)
--       Exactly one slug='tirupati' row, active, is required by the REV 2
--       candidate's preflight.
--       pre-import and post-import: rows = 1, active = 1
-- ---------------------------------------------------------------------------
select
  count(*)                        as tirupati_slug_rows,
  count(*) filter (where is_active) as tirupati_slug_rows_active
from public.destinations
where slug = 'tirupati';


-- ---------------------------------------------------------------------------
-- §7b — CURRENT TIRUPATI DESTINATION DESCRIPTION (inspected, NOT modified)
--       Shows the verbatim live text, its length, and whether it already
--       matches the REV 2 candidate's proposed replacement byte-for-byte
--       (comparison only — this probe never writes).
--       pre-import: matches = false (live placeholder: "City in Andhra
--                   Pradesh, home to the renowned Tirumala Venkateswara
--                   Temple — a major Hindu pilgrimage site.")
--       post-import: matches = true
-- ---------------------------------------------------------------------------
select
  id,
  slug,
  name,
  is_active,
  description,
  length(description) as description_chars,
  description is not distinct from 'Tirupati district, Andhra Pradesh — temple town at the foothills of Tirumala, home to Sri Venkateswara Temple. Official accommodation information is published by TTD at tirumala.org (AccommodationAtTirupati). Foodie''s listing here is a source-linked pilot: every place records its own source link.' as description_matches_rev2_candidate
from public.destinations
where slug = 'tirupati'
order by is_active desc, slug asc;


-- ---------------------------------------------------------------------------
-- §8 — THE FIVE HELD-OUT CANDIDATE UUIDs MUST BE ABSENT
--      (Lake Valley Resort and Spa / Tirumala Cake House / Lunchbox - Meals
--      & Thalis / Desi Family Dhaba And Restaurant / Home's Kitchen — all
--      held out of REV 2 for evidence-weak locations; see
--      insert-batch-009-p3-places-review.md)
--      present_violation_if_true = true on ANY row = the batch (or part of
--      the original 14-row REV 1) was applied — STOP and re-run the review.
--      pre-import and post-import: all 5 rows present_violation_if_true = false
-- ---------------------------------------------------------------------------
with held(ord, id, expected_name) as (
  values
    (1, '82d96f9c-4e2b-553b-9e4e-daa34b52499e'::uuid, 'Lake Valley Resort and Spa'),
    (2, '4b931ad7-85af-5261-800f-9305d38ad281'::uuid, 'Tirumala Cake House'),
    (3, 'a3afcb24-f111-5f01-b56b-cec6a450dc64'::uuid, 'Lunchbox - Meals & Thalis'),
    (4, '8f5b6b55-4ce9-5dda-810b-137fb2667ab6'::uuid, 'Desi Family Dhaba And Restaurant'),
    (5, '9dcb300e-74d7-5843-92aa-ec3736b48c0d'::uuid, 'Home''s Kitchen')
)
select
  h.ord,
  h.id,
  h.expected_name,
  (r.id is not null)  as present_violation_if_true,
  r.name              as found_name,
  r.city              as found_city,
  r.source            as found_source_marker
from held h
left join public.restaurants r on r.id = h.id
order by h.ord asc;


-- ---------------------------------------------------------------------------
-- §8b — HELD-OUT PRESENCE SUMMARY (should ALWAYS be 0, before AND after)
-- ---------------------------------------------------------------------------
with held(id) as (
  values
    ('82d96f9c-4e2b-553b-9e4e-daa34b52499e'::uuid),
    ('4b931ad7-85af-5261-800f-9305d38ad281'::uuid),
    ('a3afcb24-f111-5f01-b56b-cec6a450dc64'::uuid),
    ('8f5b6b55-4ce9-5dda-810b-137fb2667ab6'::uuid),
    ('9dcb300e-74d7-5843-92aa-ec3736b48c0d'::uuid)
)
select count(*) filter (where r.id is not null) as held_rows_present_should_be_0
from held h
left join public.restaurants r on r.id = h.id;


-- ---------------------------------------------------------------------------
-- §9 — NAME-LEVEL PROBE (same lower(btrim(name)) convention as the REV 2
--      candidate's own preflight): none of the 9 retained names may exist
--      pre-import; all must exist (exactly 1 row each) post-import; the 5
--      held names must NEVER exist under any id (catches a re-import under
--      a different uuid). Always returns exactly 14 rows.
--      pre-import:  9 × name_present = false / 5 × false
--      post-import: 9 × name_present = true (matching_rows = 1) / 5 × false
-- ---------------------------------------------------------------------------
with probe_names(kind, name) as (
  values
    ('batch9_retained', 'Holiday Inn Tirupati Tirumala'),
    ('batch9_retained', 'Starlit Suites'),
    ('batch9_retained', 'Tirupati Foods'),
    ('batch9_retained', 'Ni Cake World'),
    ('batch9_retained', 'Ps4 Restaurant'),
    ('batch9_retained', 'The 99 Pizza'),
    ('batch9_retained', 'Nanjundeshwara Bakery & Sweets'),
    ('batch9_retained', 'Kolkata Sweet & Foods'),
    ('batch9_retained', 'Kouzina Kafe - The Food Court'),
    ('held_out',        'Lake Valley Resort and Spa'),
    ('held_out',        'Tirumala Cake House'),
    ('held_out',        'Lunchbox - Meals & Thalis'),
    ('held_out',        'Desi Family Dhaba And Restaurant'),
    ('held_out',        'Home''s Kitchen')
)
select
  pn.kind,
  pn.name,
  (count(r.id) > 0) as name_present,
  count(r.id)       as matching_rows
from probe_names pn
left join public.restaurants r
  on lower(btrim(r.name)) = lower(btrim(pn.name))
group by pn.kind, pn.name
order by case when pn.kind = 'batch9_retained' then 0 else 1 end asc, pn.name asc;


-- ---------------------------------------------------------------------------
-- END OF READ-ONLY PROBE — nothing above mutates any table.
-- Interpretation recap is in the file header. If §5b + §4 + §1 all match the
-- post-import column AND §6/§7b/§8/§8b are clean, the REV 2 import is fully
-- landed and verified. If everything matches the pre-import column, the
-- import has not run yet.
-- ---------------------------------------------------------------------------
