-- ============================================================================
-- Foodie — Batch-011 (p4 places) — COMPACT READ-ONLY STATE SNAPSHOT
-- ----------------------------------------------------------------------------
-- FILE STATUS: READ-ONLY PROBE. Exactly ONE statement returning ONE row, so
--   it shows a single result grid in the Supabase SQL Editor. Companion to
--   insert-batch-011-p4-places.sql (the guarded import candidate); it
--   answers the same go/no-go question in one glance. Writes NOTHING.
--
-- SAFETY
--   * ONLY SELECT + read-only CTEs (WITH ... SELECT). No INSERT / UPDATE /
--     DELETE / UPSERT / DDL / DO blocks / transactions / locks.
--   * Catalog probes (information_schema / pg_tables / pg_policies /
--     pg_constraint / pg_indexes) are read-only against the system catalog.
--   * If this statement ERRORS with 'relation "public.places" does not
--     exist', migration-008 is not applied on that project — that is the
--     answer, not a probe bug.
--   * No secrets, keys or connection strings; prints none.
--
-- HOW TO RUN
--   Supabase Dashboard -> SQL Editor -> New query -> paste this WHOLE file ->
--   Run (or Ctrl/Cmd+Enter). ONE grid, ONE row appears. Run it BEFORE the
--   import (PRE) and again AFTER (POST) and compare column by column.
--
-- HOW TO READ THE ONE ROW (compare column by column):
--
--   PRE-IMPORT (migration-008 applied, batch-011 not yet imported):
--     places_total                       = 0
--     batch11_present / batch11_missing  = 0 / 16
--     batch11_missing_names              = all sixteen names
--     batch11_present_names              = {}
--     p4_marker_rows                     = 0
--     batch11_invariant_violations       = 0   (vacuously — none present)
--     batch11_fidelity_violations        = 0   (vacuously)
--     schema_columns                     = 21
--     rls_enabled                        = true
--     select_policy_rows / write_policy_rows = 1 / 0
--     check_constraints_present          = 2
--     uniqueness_present                 = 2
--     index_count                        = 8
--     held_rows_present                  = 0   (held_present_names = {})
--     tirupati_destination_active_rows   = 1
--     place_type_counts                  = {}
--     restaurants_total_info             = 86  (informational — batches 009's
--                                          POST state; this batch must not
--                                          change it)
--
--   POST-IMPORT (if the candidate committed exactly as designed):
--     places_total                       = 16
--     batch11_present / batch11_missing  = 16 / 0
--     batch11_missing_names              = {}
--     batch11_present_names              = all sixteen names
--     p4_marker_rows                     = 16
--     batch11_invariant_violations       = 0
--     batch11_fidelity_violations        = 0
--     schema_columns                     = 21   (unchanged)
--     rls_enabled                        = true (unchanged)
--     select_policy_rows / write_policy_rows = 1 / 0 (unchanged)
--     check_constraints_present          = 2    (unchanged)
--     uniqueness_present                 = 2    (unchanged)
--     index_count                        = 8    (unchanged)
--     held_rows_present                  = 0    (still absent)
--     tirupati_destination_active_rows   = 1
--     place_type_counts                  = {"temple": 6, "hotel": 6,
--                                          "natural_arch": 1, "waterfall": 1,
--                                          "fort": 1, "zoo": 1}
--     restaurants_total_info             = 86   (unchanged)
--
--   ANYTHING ELSE = mixed/unexpected state (partial application, foreign
--   rows, or schema drift): STOP — do not run the import, do not re-import;
--   report the row. NULL rls_enabled means the places table does not exist
--   (migration-008 missing on that project).
-- ============================================================================
with batch11(id, name, slug, ptype) as (
  values
    ('596b875e-23d5-5458-95e6-1e60e9b0f2af'::uuid, 'Marasa Sarovar Premiere', 'marasa-sarovar-premiere', 'hotel'),
    ('2b7ae75d-18d3-53b8-99d7-7db09267c860'::uuid, 'Fortune Select Grand Ridge', 'fortune-select-grand-ridge', 'hotel'),
    ('53f276b4-549f-5f06-ad7d-fd7e20bf5e4e'::uuid, 'Ramee Guestline Hotel', 'ramee-guestline-hotel', 'hotel'),
    ('4da554ae-e148-5498-b3b7-3aa45f0835d1'::uuid, 'Ekante Bliss', 'ekante-bliss', 'hotel'),
    ('27c6e70b-673e-5c80-a3cf-4e8f530098d8'::uuid, 'Kalyan Residency', 'kalyan-residency', 'hotel'),
    ('74b454ed-cb0a-5cd9-9510-1ef251de5a8a'::uuid, 'Minerva Grand Tirupati', 'minerva-grand-tirupati', 'hotel'),
    ('9cbbed7e-b526-5167-ba53-30214cfe3c44'::uuid, 'Sri Venkateswara Swamy Temple', 'sri-venkateswara-swamy-temple', 'temple'),
    ('550f0ee2-d898-5f44-9897-9fd72310d77f'::uuid, 'Sri Padmavathi Ammavari Temple', 'sri-padmavathi-ammavari-temple', 'temple'),
    ('065ed977-26c1-5fa7-814a-b299f52672a1'::uuid, 'Sri Govindaraja Swamy Temple', 'sri-govindaraja-swamy-temple', 'temple'),
    ('f0034b71-18fd-51cc-be00-b26dc17cec72'::uuid, 'Sri Kapilatheertham Temple', 'sri-kapilatheertham-temple', 'temple'),
    ('7ca7b062-f601-55a9-832f-f3355aa8a80d'::uuid, 'Sri Kalyana Venkateswara Swamy Temple', 'sri-kalyana-venkateswara-swamy-temple', 'temple'),
    ('632a8627-baca-5d32-ab42-cf7328af8da1'::uuid, 'ISKCON Tirupati', 'iskcon-tirupati', 'temple'),
    ('23e44a85-1086-58df-8a58-928830569f04'::uuid, 'Natural Arch, Tirumala hills (Silathoranam)', 'natural-arch-tirumala-hills-silathoranam', 'natural_arch'),
    ('7f2c91c5-35c7-57d8-9d7a-833b033a4ef1'::uuid, 'Talakona Waterfall', 'talakona-waterfall', 'waterfall'),
    ('544ffb45-63d2-582b-8272-155f032b4901'::uuid, 'Chandragiri Fort', 'chandragiri-fort', 'fort'),
    ('7a69de5b-7744-5fa6-b972-f3a7ebb4f0fb'::uuid, 'Sri Venkateswara Zoological Park', 'sri-venkateswara-zoological-park', 'zoo')
),
held(id) as (
  values
    ('dae6afc7-c8e2-5578-89cb-cdc82c22fd0b'::uuid),
    ('d8179ce2-2ad4-53fc-b0f8-3d157df0e901'::uuid),
    ('f9fedd50-9641-5e7d-9d05-6e8d14181ad2'::uuid)
)
select
  (select count(*) from public.places)                                       as places_total,
  (select count(*) from batch11 b join public.places p on p.id = b.id)       as batch11_present,
  (select count(*) from batch11 b left join public.places p on p.id = b.id where p.id is null) as batch11_missing,
  (select coalesce(array_agg(b.name order by b.name), '{}'::text[])
     from batch11 b left join public.places p on p.id = b.id
    where p.id is null)                                                      as batch11_missing_names,
  (select coalesce(array_agg(p.name order by p.name), '{}'::text[])
     from batch11 b join public.places p on p.id = b.id)                     as batch11_present_names,
  (select count(*) from public.places where source = 'p4-research-import')            as p4_marker_rows,
  (select count(*) from public.places p join batch11 b on b.id = p.id
    where p.verification_status is distinct from 'unverified'
       or p.last_verified_at is not null
       or p.name_verified is not null
       or p.address_verified is not null
       or p.coordinates_verified is not null
       or p.latitude is not null or p.longitude is not null
       or p.description is not null
       or p.source is distinct from 'p4-research-import'
       or p.source_url is null or btrim(p.source_url) = ''
       or p.city is distinct from 'Tirupati'
       or p.is_active is distinct from true
       or p.destination_id is distinct from
          (select d.id from public.destinations d where d.slug = 'tirupati' and d.is_active))
                                                                             as batch11_invariant_violations,
  (select count(*) from public.places p join batch11 b on b.id = p.id
    where p.slug is distinct from b.slug
       or p.name is distinct from b.name
       or p.place_type is distinct from b.ptype)                             as batch11_fidelity_violations,
  (select count(*) from information_schema.columns
    where table_schema = 'public' and table_name = 'places'
      and column_name in (
        'id','slug','place_type','name','description','address','locality',
        'city','destination_id','latitude','longitude','tags',
        'source','source_url','last_verified_at',
        'name_verified','address_verified','coordinates_verified',
        'verification_status','is_active','created_at'
      ))                                                                     as schema_columns,
  (select rowsecurity from pg_tables
    where schemaname = 'public' and tablename = 'places')                    as rls_enabled,
  (select count(*) from pg_policies
    where schemaname = 'public' and tablename = 'places' and upper(cmd) = 'SELECT') as select_policy_rows,
  (select count(*) from pg_policies
    where schemaname = 'public' and tablename = 'places'
      and upper(cmd) in ('INSERT', 'UPDATE', 'DELETE'))                      as write_policy_rows,
  (select count(*) from pg_constraint
    where conrelid = 'public.places'::regclass
      and conname in ('places_place_type_check', 'places_verification_status_check')
      and contype = 'c')                                                     as check_constraints_present,
  (select count(*) from pg_constraint
    where conrelid = 'public.places'::regclass
      and conname = 'places_slug_key' and contype = 'u')
  + (select count(*) from pg_indexes
    where schemaname = 'public' and tablename = 'places'
      and indexname = 'places_city_name_lower_key')                          as uniqueness_present,
  (select count(*) from pg_indexes
    where schemaname = 'public' and tablename = 'places')                    as index_count,
  (select count(*) from held h join public.places p on p.id = h.id)          as held_rows_present,
  (select coalesce(array_agg(p.name order by p.name), '{}'::text[])
     from held h join public.places p on p.id = h.id)                        as held_present_names,
  (select count(*) from public.destinations
    where slug = 'tirupati' and is_active)                                   as tirupati_destination_active_rows,
  (select coalesce(jsonb_object_agg(t.place_type, t.n), '{}'::jsonb)
     from (select place_type, count(*) as n from public.places group by place_type) t)
                                                                             as place_type_counts,
  (select count(*) from public.restaurants)                                  as restaurants_total_info;

-- The sixteen expected names (for eyeballing batch11_missing_names on PRE):
--   Chandragiri Fort
--   Ekante Bliss
--   Fortune Select Grand Ridge
--   ISKCON Tirupati
--   Kalyan Residency
--   Marasa Sarovar Premiere
--   Minerva Grand Tirupati
--   Natural Arch, Tirumala hills (Silathoranam)
--   Ramee Guestline Hotel
--   Sri Govindaraja Swamy Temple
--   Sri Kalyana Venkateswara Swamy Temple
--   Sri Kapilatheertham Temple
--   Sri Padmavathi Ammavari Temple
--   Sri Venkateswara Swamy Temple
--   Sri Venkateswara Zoological Park
--   Talakona Waterfall
--
-- The three HELD-OUT hotels (must NEVER appear; ids are what those rows
-- WOULD carry under the project convention — presence of either id or name
-- is a guard failure):
--   dae6afc7-c8e2-5578-89cb-cdc82c22fd0b  Hotel Nivaara Tirupati — identity conflict: the property domain (hotelplrgrand.com) now serves a site branded 'Hotel Nivaara' (JSON-LD Hotel, zero 'PLR' occurrences) while the owner-group page (plrprojects.com/plrgrand.html) still lists 'PLR Grand Hotel' citing the SAME domain — two first-party sources contradict
--   d8179ce2-2ad4-53fc-b0f8-3d157df0e901  Hotel PLR Grand — superseded brand on its own domain (same investigation as Hotel Nivaara Tirupati; recorded separately so neither name is silently merged or dropped)
--   f9fedd50-9641-5e7d-9d05-6e8d14181ad2  Hotel Bhimas — no live official source: hotelbhimas.com DNS-dead (2 failed fetches), bhimasresidency.com fetched = GoDaddy expired/parked page, alternates = portals/Facebook/MCA only
-- ============================================================================
-- NOTHING IN THIS FILE HAS BEEN EXECUTED. Read-only probe; owner runs it
-- manually in the Supabase SQL Editor of the correct project.
-- ============================================================================
