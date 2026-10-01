-- ============================================================================
-- Foodie — Migration 001: Doddaballapura pilot categories + trust fields
-- ----------------------------------------------------------------------------
-- Pilot area (ONLY focus for now):
--   GITAM Deemed to be University Bengaluru, Nagadenahalli
--   → Doddaballapura Railway Station
--   → Doddaballapura town
--
-- WHAT THIS DOES
--   1. Adds four columns to `restaurants` (non-destructive, safe defaults):
--        student_friendly     boolean  default false
--        verification_status  text     default 'unverified'
--        tags                 text[]   default '{}'
--        locality             text     (nullable)
--   2. Constrains `verification_status` to exactly:
--        verified | community_submitted | unverified | closed
--   3. Trims `category` to the 7 pilot place categories:
--        restaurant | hotel | tiffin | cafe | fast_food | street_food | bakery_sweets
--      (Any legacy rows would first be remapped to the closest new category —
--       a no-op on an empty table, and it never deletes rows.)
--   4. Adds indexes + documentation comments.
--
-- DOES NOT: delete tables, delete data, or insert any restaurants.
-- SAFE TO RE-RUN (idempotent: IF NOT EXISTS / OR EXISTS / guarded updates).
--
-- HOW TO RUN: Supabase Dashboard → SQL Editor → New query → paste → Run.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1) New columns
--    tags exists so finer types (tea_stall, food_truck, canteen, home_food,
--    food_hotel, dessert_counter, ...) can be expressed WITHOUT new
--    categories — they are tags, not categories.
-- ---------------------------------------------------------------------------
alter table public.restaurants
  add column if not exists student_friendly    boolean not null default false;
alter table public.restaurants
  add column if not exists verification_status text    not null default 'unverified';
alter table public.restaurants
  add column if not exists tags                text[]  not null default '{}';
alter table public.restaurants
  add column if not exists locality            text;

-- ---------------------------------------------------------------------------
-- 2) verification_status — the four trust states
-- ---------------------------------------------------------------------------
alter table public.restaurants
  drop constraint if exists restaurants_verification_status_check;
alter table public.restaurants
  add constraint restaurants_verification_status_check
  check (verification_status in (
    'verified', 'community_submitted', 'unverified', 'closed'
  ));

-- ---------------------------------------------------------------------------
-- 3) category — trim to the 7 pilot place categories
--    Remap step first so adding the constraint can never fail or delete:
--      south-indian → tiffin, fast-food → fast_food, desserts → bakery_sweets,
--      everything else legacy → restaurant.
--    On today's (empty) table every UPDATE matches 0 rows.
-- ---------------------------------------------------------------------------
update public.restaurants set category = 'tiffin'
  where category = 'south-indian';

update public.restaurants set category = 'fast_food'
  where category = 'fast-food';

update public.restaurants set category = 'bakery_sweets'
  where category = 'desserts';

update public.restaurants set category = 'restaurant'
  where category not in (
    'restaurant', 'hotel', 'tiffin', 'cafe',
    'fast_food', 'street_food', 'bakery_sweets'
  );

alter table public.restaurants
  drop constraint if exists restaurants_category_allowed_check;
alter table public.restaurants
  add constraint restaurants_category_allowed_check
  check (category in (
    'restaurant', 'hotel', 'tiffin', 'cafe',
    'fast_food', 'street_food', 'bakery_sweets'
  ));

-- ---------------------------------------------------------------------------
-- 4) Indexes for the new fields (pilot-era queries filter on these)
-- ---------------------------------------------------------------------------
create index if not exists restaurants_verification_status_idx
  on public.restaurants (verification_status);
create index if not exists restaurants_student_friendly_idx
  on public.restaurants (student_friendly);

-- ---------------------------------------------------------------------------
-- 5) Documentation
-- ---------------------------------------------------------------------------
comment on column public.restaurants.student_friendly is
  'True when the place suits students — budget menus, timings and portions that fit GITAM campus life.';
comment on column public.restaurants.verification_status is
  'Trust state: verified = checked by the Foodie team; community_submitted = added by a user, pending check; unverified = imported/unknown; closed = permanently shut (kept for history, hidden from discovery).';
comment on column public.restaurants.tags is
  'Free-form tags for finer types (tea_stall, food_truck, canteen, home_food, ...). Tags NEVER replace the 7 main categories.';
comment on column public.restaurants.locality is
  'Pilot-corridor area label, e.g. GITAM campus / Nagadenahalli / Doddaballapura Railway Station / Doddaballapura town.';
