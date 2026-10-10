-- ============================================================================
-- Foodie — migration 004: destination_food_places (STRUCTURE ONLY)
-- ----------------------------------------------------------------------------
-- HOW TO RUN
--   Supabase Dashboard -> SQL Editor -> New query -> paste this whole file ->
--   Run. Safe to re-run (idempotent: IF NOT EXISTS / guarded statements).
--
-- WHAT THIS DOES
--   1) Creates public.destination_food_places — the EXPLICIT CURATED link
--      between a destination food (what a city is famous for) and a real
--      restaurant (a place serving it). This is the "Famous Food → Places"
--      step of Foodie's discovery flow:
--        destination -> famous/local foods -> places serving them -> detail.
--   2) Adds uniqueness + indexes + documented comments.
--   3) Enables Row Level Security with PUBLIC READ-ONLY access.
--
-- WHAT THIS DELIBERATELY DOES NOT DO
--   * Inserts NOTHING. Links are curated in insert-batch-004, one per
--     evidence, reviewed before running.
--   * Does NOT touch destinations / destination_foods / restaurants or any
--     existing table or policy.
--
-- CURATION RULE (data honesty)
--   A row may be inserted ONLY when there is actual evidence that the
--   SPECIFIC restaurant serves the SPECIFIC destination food — e.g. the
--   restaurant's own menu/website, a reputable publication naming the
--   place, or owner confirmation. It is NOT enough that:
--     - the restaurant's category matches (tiffin/cafe/…),
--     - its name contains the food's name,
--     - it serves a related cuisine, or
--     - it has a generic dish/category entry.
--   When evidence is missing, DO NOT link. Fewer real places beat
--   fabricated relationships. Each batch row must cite its source.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1) destination_food_places
-- ---------------------------------------------------------------------------
create table if not exists public.destination_food_places (
  id                  uuid primary key default gen_random_uuid(),
  destination_food_id uuid not null references public.destination_foods (id) on delete cascade,
  restaurant_id       uuid not null references public.restaurants (id) on delete cascade,
  created_at          timestamptz not null default now(),
  constraint destination_food_places_food_place_key unique (destination_food_id, restaurant_id)
);

create index if not exists destination_food_places_food_idx
  on public.destination_food_places (destination_food_id);

create index if not exists destination_food_places_restaurant_idx
  on public.destination_food_places (restaurant_id);

comment on table public.destination_food_places is
  'Explicit CURATED link: a destination food -> a real place serving it. Evidence-gated (see header): category/name/cuisine similarity is never sufficient. "Places serving this food" reads this table; no rows = honest empty state.';
comment on column public.destination_food_places.destination_food_id is
  'The destination-level food record (public.destination_foods) — NOT a restaurant menu row.';
comment on column public.destination_food_places.restaurant_id is
  'The real restaurant (public.restaurants) that serves the food, per cited evidence.';

-- ---------------------------------------------------------------------------
-- 2) Row Level Security — PUBLIC READ-ONLY
--    Same posture as migration-003: everyone (anon included) can read the
--    discovery relationships. There is deliberately NO INSERT/UPDATE/DELETE
--    policy — curation happens via service role / SQL Editor only.
-- ---------------------------------------------------------------------------
alter table public.destination_food_places enable row level security;

drop policy if exists "destination food places are readable by everyone" on public.destination_food_places;
create policy "destination food places are readable by everyone"
  on public.destination_food_places for select using (true);

-- ---------------------------------------------------------------------------
-- 3) Verify what landed (result shown by the SQL editor)
--    rowsecurity must be true; the count must be ZERO until curated,
--    evidence-cited links are added in insert-batch-004.
-- ---------------------------------------------------------------------------
select tablename, rowsecurity
from pg_tables
where schemaname = 'public'
  and tablename = 'destination_food_places';

select count(*) as destination_food_places_rows from public.destination_food_places;
