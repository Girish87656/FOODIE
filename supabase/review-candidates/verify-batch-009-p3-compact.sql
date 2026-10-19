-- ============================================================================
-- Foodie — Batch-009 REV 2 (Prototype 3) — COMPACT READ-ONLY STATE SNAPSHOT
-- ----------------------------------------------------------------------------
-- FILE STATUS: READ-ONLY PROBE. Exactly ONE statement returning ONE row, so
--   it shows a single result grid in the Supabase SQL Editor (no result-tab
--   navigation). Companion to verify-batch-009-p3.sql (13-grid full probe);
--   it answers the same go/no-go question in one glance. Writes NOTHING.
--
-- SAFETY
--   * ONLY SELECT + read-only CTEs (WITH ... SELECT). No INSERT / UPDATE /
--     DELETE / UPSERT / DDL / DO blocks / transactions / locks.
--   * No secrets, keys or connection strings; prints none.
--
-- HOW TO RUN
--   Supabase Dashboard -> SQL Editor -> New query -> paste this WHOLE file ->
--   Run (or Ctrl/Cmd+Enter). ONE grid, ONE row appears.
--
-- SCHEMA (actual repo artifacts; live existence re-verified 2026-10-16,
--   see insert-batch-009-p3-places-launch-notes.md §3):
--   * public.restaurants  — schema.sql + migration-001 + executed batch-002
--     ALTER (latitude/longitude nullable) + migration-005 (source,
--     source_url, last_verified_at, *_verified booleans).
--   * public.destinations — migration-003 (slug UNIQUE, name, is_active,
--     description).
--   * Destination-level counts are by restaurants.city (no FK exists; the
--     app and the REV 2 candidate's postflight both count by city).
--
-- HOW TO READ THE ONE ROW (compare column by column):
--
--   PRE-IMPORT baseline (last read-verified 2026-10-16):
--     restaurants_total                  = 77
--     tirupati_places                    = 0
--     doddaballapura_places              = 77
--     p3_marker_rows                     = 0
--     batch9_present / batch9_missing    = 0 / 9
--     batch9_missing_names               = all nine names
--     batch9_present_names               = {}
--     batch9_invariant_violations        = 0
--     held_rows_present                  = 0   (held_present_names = {})
--     tirupati_destination_active_rows   = 1
--     tirupati_description_matches_rev2  = false
--
--   POST-IMPORT (if the REV 2 candidate committed exactly as designed):
--     restaurants_total                  = 86  (= 77 + 9)
--     tirupati_places                    = 6
--     doddaballapura_places              = 80
--     p3_marker_rows                     = 9
--     batch9_present / batch9_missing    = 9 / 0
--     batch9_present_names               = all nine names
--     batch9_missing_names               = {}
--     batch9_invariant_violations        = 0
--     held_rows_present                  = 0   (still absent)
--     tirupati_destination_active_rows   = 1
--     tirupati_description_matches_rev2  = true
--
--   ANYTHING ELSE = mixed/unexpected state (partial application or external
--   drift): STOP — do not run the import, do not re-import; report the row.
--   NULL in tirupati_description_matches_rev2 means no ACTIVE tirupati
--   destination row exists (would be a drift by itself).
-- ============================================================================
with batch9(id, name) as (
  values
    ('52a44755-9abc-5ee9-ba4b-7b05d78cbc5c'::uuid, 'Holiday Inn Tirupati Tirumala'),
    ('471284c4-06f5-5e5c-8584-084068be5b96'::uuid, 'Starlit Suites'),
    ('86841bb2-f380-5918-b656-224c79aeefa2'::uuid, 'Tirupati Foods'),
    ('fbe67c10-ea4b-5090-b435-5e3e7c75e560'::uuid, 'Ni Cake World'),
    ('8fbd7a4d-917a-57e6-bc30-5d724a952407'::uuid, 'Ps4 Restaurant'),
    ('a868d3a5-81e6-59d3-9a08-dbcffd4d6172'::uuid, 'The 99 Pizza'),
    ('65f0aace-1a57-5cef-a64a-1fb59a55dbb8'::uuid, 'Nanjundeshwara Bakery & Sweets'),
    ('8dd66b9a-62b8-5843-b2b7-df2603c9dbc6'::uuid, 'Kolkata Sweet & Foods'),
    ('c03a27e8-184b-5f81-b798-1c76a4a23d39'::uuid, 'Kouzina Kafe - The Food Court')
),
held(id) as (
  values
    ('82d96f9c-4e2b-553b-9e4e-daa34b52499e'::uuid),
    ('4b931ad7-85af-5261-800f-9305d38ad281'::uuid),
    ('a3afcb24-f111-5f01-b56b-cec6a450dc64'::uuid),
    ('8f5b6b55-4ce9-5dda-810b-137fb2667ab6'::uuid),
    ('9dcb300e-74d7-5843-92aa-ec3736b48c0d'::uuid)
)
select
  (select count(*) from public.restaurants)                                      as restaurants_total,
  (select count(*) from public.restaurants where city = 'Tirupati')              as tirupati_places,
  (select count(*) from public.restaurants where city = 'Doddaballapura')        as doddaballapura_places,
  (select count(*) from public.restaurants where source = 'p3-research-import')  as p3_marker_rows,
  (select count(*) from batch9 b join public.restaurants r on r.id = b.id)       as batch9_present,
  (select count(*) from batch9 b left join public.restaurants r on r.id = b.id where r.id is null) as batch9_missing,
  (select coalesce(array_agg(b.name order by b.name), '{}'::text[])
     from batch9 b left join public.restaurants r on r.id = b.id
    where r.id is null)                                                          as batch9_missing_names,
  (select coalesce(array_agg(r.name order by r.name), '{}'::text[])
     from batch9 b join public.restaurants r on r.id = b.id)                     as batch9_present_names,
  (select count(*) from public.restaurants r join batch9 b on b.id = r.id
    where r.verification_status is distinct from 'unverified'
       or r.latitude is not null or r.longitude is not null
       or r.rating is distinct from 0
       or r.price_level is distinct from '₹₹'
       or r.source is distinct from 'p3-research-import'
       or r.source_url is null or btrim(r.source_url) = '')                      as batch9_invariant_violations,
  (select count(*) from held h join public.restaurants r on r.id = h.id)         as held_rows_present,
  (select coalesce(array_agg(r.name order by r.name), '{}'::text[])
     from held h join public.restaurants r on r.id = h.id)                       as held_present_names,
  (select count(*) from public.destinations where slug = 'tirupati' and is_active) as tirupati_destination_active_rows,
  (select d.description is not distinct from 'Tirupati district, Andhra Pradesh — temple town at the foothills of Tirumala, home to Sri Venkateswara Temple. Official accommodation information is published by TTD at tirumala.org (AccommodationAtTirupati). Foodie''s listing here is a source-linked pilot: every place records its own source link.'
     from public.destinations d
    where d.slug = 'tirupati' and d.is_active)                                   as tirupati_description_matches_rev2;
