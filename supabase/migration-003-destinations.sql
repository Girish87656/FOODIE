-- ============================================================================
-- Foodie — migration 003: destinations + destination_foods (STRUCTURE ONLY)
-- ----------------------------------------------------------------------------
-- HOW TO RUN
--   Supabase Dashboard -> SQL Editor -> New query -> paste this whole file ->
--   Run. Safe to re-run (idempotent: IF NOT EXISTS / guarded statements).
--
-- WHAT THIS DOES
--   1) Creates public.destinations — the PRIMARY discovery entity: a city /
--      town a user is in or travelling to. Restaurants stay SECONDARY.
--      Discovery flow: destination -> famous/local foods -> (later) places
--      serving those foods -> existing restaurant detail.
--   2) Creates public.destination_foods — the foods a destination is famous
--      for. These are DESTINATION-LEVEL records, NOT restaurant menu rows
--      (restaurant dishes stay in public.dishes; dishes.is_signature keeps
--      its menu-section meaning).
--   3) Adds the documented indexes + uniqueness guarantees.
--   4) Enables Row Level Security with PUBLIC READ-ONLY access.
--
-- WHAT THIS DELIBERATELY DOES NOT DO
--   * Inserts NOTHING — no destinations, no foods, no images, no example
--     rows. Real destination data is researched, source-cited and inserted
--     in a separate reviewed stage (insert-batch pattern).
--   * Touches NO existing table: restaurants / dishes / reviews /
--     restaurant_photos are unchanged; no existing policy is modified.
--   * Creates NO link to restaurants/dishes — "places serving this food" is
--     a deliberate LATER migration (explicit curated link table).
--
-- COLUMN NOTES (data honesty)
--   * destinations.slug: stable lowercase key ('bengaluru') — deep links and
--     duplicate protection; derived from the name at insert time.
--   * destinations.region / description / image_url: NULL when not captured
--     — never guessed, never defaulted.
--   * destinations.latitude / longitude: NULL = not captured yet;
--     coordinates are NEVER estimated (same rule as restaurants). Optional
--     future aid for location->destination matching — no detection logic
--     lives in the database.
--   * destination_foods.food_type: free text for now (like dishes.category)
--     — add a CHECK only when real data shows the value set.
--   * destination_foods.designation: 'signature' | 'famous' | 'local' — how
--     strongly the destination claims the food.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1) destinations
-- ---------------------------------------------------------------------------
create table if not exists public.destinations (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null,
  name        text not null,
  region      text,
  country     text not null default 'India',
  description text,
  image_url   text,
  latitude    double precision,
  longitude   double precision,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  constraint destinations_slug_key unique (slug)
);

-- Duplicate protection at the NAME level too (belt-and-suspenders, like the
-- insert batches): 'Bengaluru' vs 'bengaluru ' can never coexist.
create unique index if not exists destinations_name_lower_key
  on public.destinations (lower(btrim(name)));

create index if not exists destinations_is_active_idx
  on public.destinations (is_active);

comment on table public.destinations is
  'Foodie destinations — the PRIMARY discovery entity (city/town). Destination food discovery flows: destination -> famous/local foods -> (later) places serving those foods. Restaurants are a secondary entity and stay in public.restaurants.';
comment on column public.destinations.slug is
  'Stable lowercase key (e.g. ''bengaluru'') for deep links and duplicate protection; derived from the name at insert time.';
comment on column public.destinations.region is
  'State/region (e.g. Karnataka). NULL when not captured — never guessed.';
comment on column public.destinations.latitude is
  'WGS-84 latitude. NULL = not captured yet — coordinates are NEVER estimated (same rule as restaurants). Optional future aid for location->destination matching.';
comment on column public.destinations.longitude is
  'WGS-84 longitude. NULL = not captured yet (see latitude).';
comment on column public.destinations.is_active is
  'False hides the destination from discovery without deleting it. Only active rows are returned by the read APIs.';

-- ---------------------------------------------------------------------------
-- 2) destination_foods
-- ---------------------------------------------------------------------------
create table if not exists public.destination_foods (
  id             uuid primary key default gen_random_uuid(),
  destination_id uuid not null references public.destinations (id) on delete cascade,
  name           text not null,
  description    text,
  food_type      text,
  designation    text not null default 'local'
                 check (designation in ('signature', 'famous', 'local')),
  image_url      text,
  created_at     timestamptz not null default now()
);

create index if not exists destination_foods_destination_idx
  on public.destination_foods (destination_id);

-- One destination cannot list the same food twice (case/spacing-insensitive).
create unique index if not exists destination_foods_dest_name_key
  on public.destination_foods (destination_id, lower(btrim(name)));

comment on table public.destination_foods is
  'Foods a destination is famous for — DESTINATION-LEVEL records. A destination food and a restaurant dish are different concepts: restaurant menu rows stay in public.dishes. The connection to "places serving this food" comes later via an explicit curated link table (not created here).';
comment on column public.destination_foods.food_type is
  'Free-text food kind (e.g. breakfast/snack/beverage/sweet). Unconstrained for now — add a CHECK only when the real data shows the value set.';
comment on column public.destination_foods.designation is
  'How the destination claims the food: signature | famous | local.';

-- ---------------------------------------------------------------------------
-- 3) Row Level Security — PUBLIC READ-ONLY
--    Same posture as restaurants/dishes/photos: everyone (anon included) can
--    read the discovery data. There is deliberately NO INSERT/UPDATE/DELETE
--    policy on either table, so writes stay closed to everyone except
--    service-role / SQL-Editor curation. Existing policies on other tables
--    are NOT touched.
-- ---------------------------------------------------------------------------
alter table public.destinations      enable row level security;
alter table public.destination_foods enable row level security;

drop policy if exists "destinations are readable by everyone" on public.destinations;
create policy "destinations are readable by everyone"
  on public.destinations for select using (true);

drop policy if exists "destination foods are readable by everyone" on public.destination_foods;
create policy "destination foods are readable by everyone"
  on public.destination_foods for select using (true);

-- ---------------------------------------------------------------------------
-- 4) Verify what landed (result shown by the SQL editor)
--    The first SELECT must show rowsecurity = true for BOTH tables.
--    Both data SELECTs return ZERO rows until real destination data is
--    curated in a later, reviewed stage.
-- ---------------------------------------------------------------------------
select tablename, rowsecurity
from pg_tables
where schemaname = 'public'
  and tablename in ('destinations', 'destination_foods')
order by tablename;

select count(*) as destinations_rows from public.destinations;
select count(*) as destination_foods_rows from public.destination_foods;
