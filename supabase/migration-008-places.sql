-- ============================================================================
-- Foodie — migration 008: public.places (STRUCTURE ONLY — attractions + lodging)
-- ----------------------------------------------------------------------------
-- FILE STATUS: REVIEW CANDIDATE — PROPOSED, NOT EXECUTED, NOT APPROVED FOR RUN.
--   Created in Phase D/Gate 1 from the APPROVED design review (separate
--   places model; separate PointOfInterest domain; separate detail screen).
--   Nothing in this file has been run against any database.
--
-- HOW TO RUN (owner's single manual action, only after approving this file)
--   Supabase Dashboard -> SQL Editor -> New query -> paste this whole file ->
--   Run. Safe to re-run (idempotent: IF NOT EXISTS / drop-policy-if-exists /
--   overwrite-style comments + a loud structural assertion, see RETRY
--   SEMANTICS below).
--
-- WHAT THIS DOES
--   1) Creates public.places — NON-FOOD points of interest (tourist
--      attractions AND lodging hotels). This is the approved resolution of
--      the batch-010 finding: lodging and attractions must NOT be forced
--      through the food-category system (restaurants.category keeps its
--      EXACT current meaning — 'hotel' there still means the local
--      "meals place" usage and is NOT touched by this migration).
--   2) Adds the documented unique/lookup indexes.
--   3) Documents every honesty-critical column via comments.
--   4) Enables Row Level Security with PUBLIC READ-ONLY access
--      (one SELECT policy; deliberately NO INSERT/UPDATE/DELETE policy —
--      writes stay closed to everyone except service role / SQL Editor
--      curation, exactly like destinations/destination_foods).
--   5) Asserts the landed structure loudly (any mismatch -> EXCEPTION).
--
-- WHAT THIS DELIBERATELY DOES NOT DO
--   * Inserts NOTHING — zero rows. Real places are curated later in a
--     reviewed, evidence-cited insert batch (Gate 2; NOT part of this file).
--   * Touches NO existing table, column, policy, function or row:
--     restaurants / dishes / reviews / restaurant_photos / destinations /
--     destination_foods / destination_food_places are untouched. There is
--     NO foreign key FROM any existing table INTO places (the only FK is
--     places.destination_id -> destinations.id).
--   * Adds NO hotel-specific business fields: no star rating, no nightly
--     price, no amenities, no check-in/out, no booking links. Lodging is
--     conveyed by place_type 'hotel' + evidenced tags (e.g. 'lodging',
--     'brand_chain'). Hotel-specific detail columns would need a separate
--     approved migration once real evidence demands them.
--   * Adds NO photos, reviews or hours feature for places (no *_photos
--     table, no reviews linkage, no hours column) — those are separate
--     future decisions.
--
-- ---------------------------------------------------------------------------
-- DESIGN NOTES — data honesty (read before editing)
-- ---------------------------------------------------------------------------
--   * id: STABLE uuid5 supplied by the reviewed generator
--     (uuid5(foodie-p4:<city>:<name>) over the fixed project namespace).
--     Deliberately NO gen_random_uuid() default: random ids would defeat
--     idempotent re-imports (a rerun must FIND its own rows, not duplicate
--     them). Manual ad-hoc inserts without a generator-derived id are off
--     the curation process.
--   * NULL SEMANTICS (every nullable column below):
--         NULL = not captured / not supported by the cited source.
--     NULL is NEVER a placeholder to be guessed away later. Coordinates are
--     NEVER estimated from addresses or map pins. Address is stored ONLY at
--     the level the cited source actually publishes (a source without a
--     street address yields address NULL or a locality-level string, exactly
--     as evidenced).
--   * VERIFICATION RULE — importing a record NEVER marks it verified:
--         - verification_status imports as 'unverified' and is changed only
--           by a real, evidenced verification pass.
--         - name_verified / address_verified / coordinates_verified are
--           tri-state: NULL = not checked · false = checked and NOT
--           verified · true = verified ONLY after real evidence. They are
--           NOT set by imports, NOT defaulted to true, and NEVER inferred
--           from source quality. Identity evidence ≠ field-level
--           verification.
--         - source/source_url record where a listing came from. A source is
--           provenance, NOT a verification claim.
--         - last_verified_at stays NULL until a listed fact is actually
--           re-checked by Foodie.
--   * verification_status reuses the restaurants union
--     ('verified','community_submitted','unverified','closed') so the app's
--     existing status-label/chip conventions work unchanged. 'closed'
--     places stay for history but are hidden from discovery by the app's
--     existing discoverable-filter convention.
--   * is_active: false hides a place from discovery WITHOUT deleting it
--     (same semantics as destinations.is_active).
--   * city + destination_id: BOTH are kept on purpose. destination_id is
--     the relational path (ON DELETE SET NULL — deleting a destination must
--     never destroy curated places); city preserves the existing
--     case-insensitive city-match primitive the app already uses for
--     restaurants. Curation rule: set destination_id whenever a matching
--     active destination exists; city always stays populated as the
--     primitive fallback.
--   * Uniqueness:
--         - slug: globally unique stable lowercase key.
--         - (city, name): case- AND whitespace-insensitive per city —
--           'Tirupati' can never list 'X' twice regardless of casing or
--           spacing (leading/trailing trim + internal whitespace runs
--           collapsed). (Approved Gate-1 wording: "case/whitespace-
--           insensitive city/name uniqueness" — BOTH sides normalized.)
--
-- RETRY SEMANTICS (why re-running is safe)
--   * create table if not exists / create index if not exists: re-runs skip
--     existing objects.
--   * The RLS policy is created EXPLICITLY (drop policy if exists + create
--     policy) — Postgres has no CREATE POLICY IF NOT EXISTS, and this
--     migration does not assume one. Re-running replaces the same policy
--     with identical definition; nothing else is ever dropped.
--   * comment on ... statements overwrite idempotently.
--   * The structural assertion runs in TWO stages: a PRE-assert before any
--     index is created (so a foreign-shaped pre-existing table aborts with
--     a precise diagnosis instead of a confusing index error), and a
--     POST-assert after RLS/policy creation re-verifies checks, indexes,
--     the policy and the FK on EVERY run. Any mismatch raises an exception
--     so a partial or foreign-shaped state can never pass silently.
--   * Note on editor transactions: each statement is independently
--     idempotent, so even a mid-file failure leaves a state that a simple
--     re-run completes. There are no data-bearing statements in this file.
--
-- SAFETY
--   * ADDITIVE ONLY: no existing object is dropped, altered or retyped; no
--     row anywhere is read-modified or deleted. The only EXECUTABLE
--     destructive statement in this FILE lives in the COMMENTED rollback
--     section at the bottom (inert until deliberately uncommented).
--   * RLS posture identical to migration-003/004: ENABLE + one public
--     SELECT policy, NO write policies of any kind. Even authenticated
--     users have no INSERT/UPDATE/DELETE path; writes happen only as
--     service-role / SQL-Editor curation.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1) table — public.places
-- ---------------------------------------------------------------------------
create table if not exists public.places (
  id                   uuid primary key,
                       -- STABLE uuid5 from the reviewed generator (no default
                       -- — see DESIGN NOTES; never gen_random_uuid()).
  slug                 text not null,
  place_type           text not null,
  name                 text not null,
  description          text,
  address              text,
  locality             text,
  city                 text not null,
  destination_id       uuid references public.destinations (id) on delete set null,
  latitude             double precision,
  longitude            double precision,
  tags                 text[] not null default '{}',
  source               text,
  source_url           text,
  last_verified_at     timestamptz,
  name_verified        boolean,
  address_verified     boolean,
  coordinates_verified boolean,
  verification_status  text not null default 'unverified',
  is_active            boolean not null default true,
  created_at           timestamptz not null default now(),
  constraint places_slug_key unique (slug),
  constraint places_place_type_check
    check (place_type in (
      'temple', 'waterfall', 'fort', 'zoo',
      'natural_arch', 'other', 'hotel'
    )),
  constraint places_verification_status_check
    check (verification_status in
      ('verified', 'community_submitted', 'unverified', 'closed'))
);

-- ---------------------------------------------------------------------------
-- 2) PRE-ASSERT — shape gate BEFORE any index is created. If places already
--    exists from some other source with a different shape, this aborts with
--    a precise message (instead of an obscure index error) and nothing is
--    written. Read-only against the catalog.
-- ---------------------------------------------------------------------------
do $preassert_places$
declare
  v_table   integer;
  v_columns integer;
begin
  select count(*) into v_table
    from pg_tables
   where schemaname = 'public' and tablename = 'places';
  if v_table = 0 then
    raise exception 'PRE-ASSERT FAIL: public.places does not exist after the create block.';
  end if;

  select count(*) into v_columns
    from information_schema.columns
   where table_schema = 'public' and table_name = 'places'
     and column_name in (
       'id','slug','place_type','name','description','address','locality',
       'city','destination_id','latitude','longitude','tags',
       'source','source_url','last_verified_at',
       'name_verified','address_verified','coordinates_verified',
       'verification_status','is_active','created_at'
     );
  if v_columns <> 21 then
    raise exception 'PRE-ASSERT FAIL: public.places has % of the 21 approved columns — the table was created or altered outside this migration. Do NOT run this migration against a foreign-shaped table; investigate first.', v_columns;
  end if;

  raise notice 'PRE-ASSERT OK: public.places exists with the 21 approved columns.';
end
$preassert_places$;

-- ---------------------------------------------------------------------------
-- 3) indexes — uniqueness + the lookups the app and curation queries use
-- ---------------------------------------------------------------------------
-- Case/whitespace-insensitive per-city name uniqueness (belt-and-suspenders
-- like destinations_name_lower_key / destination_foods_dest_name_key, but
-- stronger: leading/trailing trim AND internal whitespace runs collapsed,
-- per the approved "case/whitespace-insensitive" wording).
create unique index if not exists places_city_name_lower_key
  on public.places (
    lower(regexp_replace(btrim(city), '\s+', ' ', 'g')),
    lower(regexp_replace(btrim(name), '\s+', ' ', 'g'))
  );

create index if not exists places_place_type_idx
  on public.places (place_type);
create index if not exists places_destination_idx
  on public.places (destination_id);
create index if not exists places_city_idx
  on public.places (city);
create index if not exists places_is_active_idx
  on public.places (is_active);
create index if not exists places_lat_lng_idx
  on public.places (latitude, longitude);

-- ---------------------------------------------------------------------------
-- 4) comments — the honesty contract lives next to the columns
-- ---------------------------------------------------------------------------
comment on table public.places is
  'Foodie places — NON-FOOD points of interest: tourist attractions (temple/waterfall/fort/zoo/natural_arch/other) AND lodging hotels (place_type ''hotel''). Deliberately SEPARATE from public.restaurants: restaurants.category keeps its exact current meaning (local "hotel" = meals place) and no food table references places. Curated via SQL Editor only — RLS is public-read, no public write.';

comment on column public.places.id is
  'STABLE uuid5 supplied by the reviewed generator (uuid5 over the fixed project namespace). NO default on purpose: idempotent re-imports must find their own rows. Never generate random ids for curated rows.';

comment on column public.places.slug is
  'Stable lowercase key for deep links and duplicate protection; globally unique. Derived from the canonical name at generation time.';

comment on column public.places.place_type is
  'Kind of place. Approved value set: temple | waterfall | fort | zoo | natural_arch | other | hotel. ''hotel'' = LODGING here (brand-verified stay properties), never the food-category "meals place" meaning used by restaurants.category. Extend the CHECK only via a reviewed migration when new evidenced types appear.';

comment on column public.places.name is
  'Canonical name exactly as evidenced by the cited source (spelling, diacritics and suffixes as published).';

comment on column public.places.description is
  'Short factual description from the cited source. NULL = not captured — never invented, never padded.';

comment on column public.places.address is
  'Address EXACTLY at the level the cited source supports (comma/pin normalization only). NULL or locality-level when the source publishes no street address — never completed from third-party sites.';

comment on column public.places.locality is
  'Area/locality label when the source supports one. NULL = not captured.';

comment on column public.places.city is
  'City primitive (case-insensitive match target, mirroring restaurants.city usage). Always populated; the destination_id FK is the relational path, city is the fallback primitive.';

comment on column public.places.destination_id is
  'Optional link to public.destinations. NULL when no matching active destination exists. ON DELETE SET NULL: removing a destination never deletes curated places.';

comment on column public.places.latitude is
  'WGS-84 latitude. NULL = not captured; coordinates are NEVER estimated from addresses, map pins or third-party listings. Populate ONLY from a cited source (converted at import time from the source''s own published coordinates).';

comment on column public.places.longitude is
  'WGS-84 longitude (see latitude). NULL = not captured.';

comment on column public.places.tags is
  'Free-form EVIDENCED tags only (e.g. lodging, brand_chain, unesco_tentative). A tag must trace to the cited source; tags never replace place_type and never carry business claims (no prices, no star ratings).';

comment on column public.places.source is
  'Where this listing came from (free text marker, e.g. a reviewed import batch marker). NULL = unknown — never guessed.';

comment on column public.places.source_url is
  'URL of the source page the listing was transcribed from — provenance ONLY. A source is not a verification claim and never a booking link. NULL when no real URL exists.';

comment on column public.places.last_verified_at is
  'When a listed fact was last ACTUALLY re-checked by Foodie. NULL = never verified. Imports NEVER set this.';

comment on column public.places.name_verified is
  'Tri-state: TRUE only after the canonical name was verified against reality with real evidence · FALSE = checked and NOT verified · NULL = not checked yet. Imports NEVER set this (identity evidence in the worksheet is NOT field-level verification).';

comment on column public.places.address_verified is
  'Tri-state (see name_verified). TRUE only after the stored address was confirmed. FALSE = checked and unconfirmed. NULL = not checked.';

comment on column public.places.coordinates_verified is
  'Tri-state (see name_verified). TRUE only when the stored lat/lng was confirmed against reality. FALSE = checked and wrong/absent. NULL = not checked. Importing coordinates from a cited source does NOT set this — verification is a separate evidenced act.';

comment on column public.places.verification_status is
  'Trust state — SAME union as restaurants.verification_status: verified = checked by the Foodie team; community_submitted = added by a user, pending check; unverified = imported/unknown (the import default); closed = permanently shut (kept for history, hidden from discovery).';

comment on column public.places.is_active is
  'False hides the place from discovery without deleting it. Only active rows are returned by the read APIs.';

comment on column public.places.created_at is
  'Row creation time (curation metadata, not a verification claim).';

-- ---------------------------------------------------------------------------
-- 5) Row Level Security — PUBLIC READ-ONLY
--    Same posture as migration-003/004: everyone (anon included) can read
--    the curated discovery data. There is deliberately NO INSERT/UPDATE/
--    DELETE policy — writes stay closed to everyone except service role /
--    SQL-Editor curation. Postgres has no CREATE POLICY IF NOT EXISTS, so
--    the policy is created EXPLICITLY: drop-if-exists then create. The drop
--    targets ONLY this policy name on ONLY this table.
-- ---------------------------------------------------------------------------
alter table public.places enable row level security;

drop policy if exists "places are readable by everyone" on public.places;
create policy "places are readable by everyone"
  on public.places for select using (true);

-- ---------------------------------------------------------------------------
-- 6) POST-ASSERT — LOUD verification that what landed matches the approved
--    design. Runs on EVERY execution (fresh or retry). Any mismatch raises
--    an exception so a partial/foreign-shaped state can never pass
--    silently. Read-only against the catalog; writes nothing.
--    (Column shape is already gated by the PRE-ASSERT in Part 2.)
-- ---------------------------------------------------------------------------
do $assert_places$
declare
  v_type_check   integer;
  v_status_check integer;
  v_slug_unique  integer;
  v_cityname_idx integer;
  v_policies     integer;
  v_write_policies integer;
  v_fks          integer;
begin
  -- (a) the two CHECK constraints exist
  select count(*) into v_type_check
    from pg_constraint
   where conrelid = 'public.places'::regclass
     and conname = 'places_place_type_check' and contype = 'c';
  select count(*) into v_status_check
    from pg_constraint
   where conrelid = 'public.places'::regclass
     and conname = 'places_verification_status_check' and contype = 'c';
  if v_type_check <> 1 or v_status_check <> 1 then
    raise exception 'ASSERT FAIL: expected CHECK constraints missing (place_type=%, verification_status=%) — re-create the table from this migration only.', v_type_check, v_status_check;
  end if;

  -- (d) slug uniqueness + the city/name uniqueness index exist
  select count(*) into v_slug_unique
    from pg_constraint
   where conrelid = 'public.places'::regclass
     and conname = 'places_slug_key' and contype = 'u';
  select count(*) into v_cityname_idx
    from pg_indexes
   where schemaname = 'public' and tablename = 'places'
     and indexname = 'places_city_name_lower_key';
  if v_slug_unique <> 1 or v_cityname_idx <> 1 then
    raise exception 'ASSERT FAIL: uniqueness not in place (slug=%, city/name=%).', v_slug_unique, v_cityname_idx;
  end if;

  -- (e) exactly ONE policy, and it is the read-only SELECT policy; zero
  --     write policies may ever exist on this table
  -- NOTE: pg_policies.cmd is UPPERCASE ('SELECT', 'INSERT', ...) — compare
  -- case-insensitively. (Found by the local PGlite harness: a literal
  -- cmd='select' match reads 0 policies and would abort a healthy run.)
  select count(*) into v_policies
    from pg_policies
   where schemaname = 'public' and tablename = 'places'
     and policyname = 'places are readable by everyone'
     and upper(cmd) = 'SELECT';
  select count(*) into v_write_policies
    from pg_policies
   where schemaname = 'public' and tablename = 'places'
     and upper(cmd) in ('INSERT', 'UPDATE', 'DELETE');
  if v_policies <> 1 or v_write_policies <> 0 then
    raise exception 'ASSERT FAIL: RLS policy state wrong (select policies=%, write policies=%) — this table must stay public-READ-ONLY.', v_policies, v_write_policies;
  end if;

  -- (f) exactly ONE outbound FK and it targets destinations with
  --     ON DELETE SET NULL (no other table may reference places)
  select count(*) into v_fks
    from pg_constraint
   where conrelid = 'public.places'::regclass and contype = 'f';
  if v_fks <> 1 then
    raise exception 'ASSERT FAIL: expected exactly 1 FK (destination_id -> destinations), found %.', v_fks;
  end if;

  raise notice 'ASSERT OK: public.places structure matches the approved design (21 columns, checks, uniqueness, read-only RLS, 1 FK).';
end
$assert_places$;

-- ---------------------------------------------------------------------------
-- 7) post-migration verification — READ-ONLY queries; results are shown by
--    the SQL editor. Expected on a healthy run:
--      * rowsecurity   = true
--      * policy row    = exactly 1: 'places are readable by everyone', SELECT
--      * constraints   = MUST contain: places_pkey (p), places_slug_key (u),
--                        places_place_type_check (c),
--                        places_verification_status_check (c),
--                        places_destination_id_fkey (f). Depending on the
--                        Postgres version, per-column NOT NULL entries
--                        (contype 'n') may also be listed — that is normal
--                        catalog variation, not drift.
--      * indexes       = 8 (PK-backed, slug-key-backed, city/name unique,
--                        and the 5 created lookup indexes)
--      * places rows   = 0 (structure only — nothing inserted)
-- ---------------------------------------------------------------------------
select tablename, rowsecurity
  from pg_tables
 where schemaname = 'public' and tablename = 'places';

select policyname, cmd, roles, qual
  from pg_policies
 where schemaname = 'public' and tablename = 'places';

select conname, contype
  from pg_constraint
 where conrelid = 'public.places'::regclass
 order by contype, conname;

select indexname
  from pg_indexes
 where schemaname = 'public' and tablename = 'places'
 order by indexname;

select count(*) as places_rows_must_be_zero from public.places;

-- ============================================================================
-- ROLLBACK (COMMENTED — inert; uncomment ONLY after reading the conditions)
-- ----------------------------------------------------------------------------
--   drop table if exists public.places;
--
-- WHEN ROLLBACK IS SAFE — ALL of these must hold:
--   1) No application code reads public.places yet (Gate 3 not shipped, or
--      the app changes were reverted first). Dropping while the app queries
--      the table turns every places read into a 500 — revert the app first.
--   2) No OTHER schema object depends on places. This migration creates no
--      inbound references (nothing references places; the only FK is
--      places -> destinations). If later migrations ever add inbound FKs,
--      views or functions targeting places, revert THOSE FIRST — never use
--      DROP ... CASCADE here: cascade would silently drop dependents you
--      have not audited. The statement above is deliberately non-cascade,
--      so an unexpected dependent makes it FAIL LOUDLY instead of
--      destroying something silently.
--   3) You accept losing the curated places rows. v1 places are 100%
--      curated (no user-generated content, no reviews/photos/uploads) and
--      re-derivable from the reviewed worksheets + generators, so data loss
--      is bounded — but check the count first:
--        select count(*) from public.places;   -- read-only
--      If the count is 0 (this migration just ran, no import yet), rollback
--      is trivially safe.
--   4) RLS/policy cleanup is implicit: dropping the table drops its policy.
--      No other policy, role or grant is touched.
--   After rollback, re-running THIS migration recreates the structure
--   cleanly (it is fully idempotent) — that is the recovery path.
-- ============================================================================

-- NOTHING IN THIS FILE HAS BEEN EXECUTED. It connects to no database and
-- touches no existing table. Execution remains the owner's single manual
-- action in the Supabase SQL Editor, only after approving this file.
