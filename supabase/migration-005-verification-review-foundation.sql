-- ============================================================================
-- Foodie — migration 005: verification metadata + Foodie community reviews
-- ----------------------------------------------------------------------------
-- HOW TO RUN
--   Supabase Dashboard -> SQL Editor -> New query -> paste this whole file ->
--   Run. Safe to re-run (idempotent: IF NOT EXISTS / OR REPLACE / guarded).
--
-- WHAT THIS DOES (restaurants ONLY + reviews TRIGGER — no other table touched)
--   PART A — provenance columns on `restaurants` (ALL nullable, no defaults,
--            no backfill, existing rows NOT marked verified):
--       source, source_url, last_verified_at,
--       address_verified, coordinates_verified, hours_verified, photos_verified
--       NULL = unknown/pending · false = explicitly NOT verified ·
--       true = verified only after real evidence. Nothing is auto-populated.
--
--   PART B — Foodie community review aggregates on `restaurants`:
--       review_count     integer NOT NULL DEFAULT 0  (0 = no reviews yet — a
--                        real value maintained by trigger, never fabricated)
--       community_rating double precision NULL        (NULL = no community
--                        rating yet; the listed `rating` column is NEVER
--                        touched — listed vs community stay separate forever)
--       + AFTER trigger on `reviews` (insert / update / delete) keeping both
--         fields in sync, SECURITY DEFINER so a reviewer (who cannot UPDATE
--         restaurants by RLS) can still move the counters.
--       + one-time backfill that includes ALL existing reviews (today: 0
--         rows → every restaurant stays at 0 / NULL — nothing invented).
--
--   PART C — rebuild of the `nearby_restaurants(lat, lng, radius_km)` RPC.
--       The live RPC still returns the pre-migration-001 row shape (missing
--       student_friendly, verification_status, tags, locality — and now the
--       new aggregates/provenance). The rebuilt function keeps the SAME
--       signature, the SAME Haversine math, radius filter and nearest-first
--       ordering, and returns the COMPLETE current row (aggregates +
--       provenance included). SECURITY INVOKER (unchanged) so RLS still
--       applies. Drop + re-create inside one script = atomic in the SQL
--       Editor transaction; the app's Node Haversine fallback covers any
--       window anyway.
--
-- SAFETY
--   * ADDITIVE ONLY: no table is dropped, no existing column is dropped,
--     overwritten or retyped, no row is deleted, no data value changes.
--   * The only UPDATE below writes the TWO NEW aggregate columns from REAL
--     reviews rows (0 rows today). Existing restaurant values are untouched.
--   * RLS is preserved: no policy is added, removed or altered; RLS stays
--     ENABLED on every table; the RPC stays SECURITY INVOKER. New columns
--     inherit the existing table policies (public read, no public write).
--   * New trigger functions are SECURITY DEFINER with `set search_path=''`
--     and fully-qualified names (hijack-safe), only ever touch
--     restaurants.review_count / restaurants.community_rating, and are
--     revoked from direct execution by anon/authenticated (trigger
--     invocation does not need EXECUTE privilege).
--
-- REVERT (full reverse, in order) — see the commented block at the bottom.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- PART A — provenance columns (all nullable; NULL = unknown/pending)
-- ---------------------------------------------------------------------------
alter table public.restaurants add column if not exists source               text;
alter table public.restaurants add column if not exists source_url           text;
alter table public.restaurants add column if not exists last_verified_at     timestamptz;
alter table public.restaurants add column if not exists address_verified     boolean;
alter table public.restaurants add column if not exists coordinates_verified boolean;
alter table public.restaurants add column if not exists hours_verified       boolean;
alter table public.restaurants add column if not exists photos_verified      boolean;

comment on column public.restaurants.source is
  'Where this listing came from (free text, e.g. the pilot data collection effort). NULL = unknown — never guessed.';
comment on column public.restaurants.source_url is
  'URL of the source the listing was transcribed from, only when a real URL exists. NULL = unknown/none — never invented.';
comment on column public.restaurants.last_verified_at is
  'When the listing information was last actually checked by Foodie. NULL = never verified.';
comment on column public.restaurants.address_verified is
  'TRUE only after real evidence (e.g. on-site confirmation). FALSE = checked and NOT verified. NULL = not checked yet.';
comment on column public.restaurants.coordinates_verified is
  'TRUE only when the stored lat/lng was confirmed against reality. FALSE = checked and wrong/absent. NULL = not checked yet.';
comment on column public.restaurants.hours_verified is
  'TRUE only after opening hours were confirmed. FALSE = checked and unconfirmed. NULL = not checked yet.';
comment on column public.restaurants.photos_verified is
  'TRUE only after photos were confirmed to depict this place. FALSE = checked and unconfirmed. NULL = not checked yet.';

-- ---------------------------------------------------------------------------
-- PART B — Foodie community review aggregates
--   review_count     : number of Foodie reviews (real count — 0 is true)
--   community_rating : average of Foodie review ratings, NULL when none
--   The external/listed `rating` column is NEVER written by this migration
--   or by the trigger below.
-- ---------------------------------------------------------------------------
alter table public.restaurants add column if not exists review_count     integer       not null default 0;
alter table public.restaurants add column if not exists community_rating double precision;

comment on column public.restaurants.review_count is
  'Number of Foodie community reviews (trigger-maintained from public.reviews — never manually set, never fabricated).';
comment on column public.restaurants.community_rating is
  'Average of Foodie community review ratings (trigger-maintained). NULL = no reviews yet. ALWAYS separate from the listed `rating`.';

-- Recompute BOTH aggregate columns for one restaurant from its REAL reviews.
-- SECURITY DEFINER is required: the reviewer firing the trigger has no
-- UPDATE privilege on restaurants (RLS) — the function owner (postgres)
-- does. The function writes ONLY review_count / community_rating.
create or replace function public.foodie_set_review_aggregates(p_restaurant_id uuid)
returns void
language sql
security definer
set search_path = ''
as $$
  update public.restaurants r
     set review_count     = agg.cnt,
         community_rating = agg.avg_rating
    from (
      select count(*)::int                as cnt,
             avg(rating)::double precision as avg_rating
        from public.reviews
       where restaurant_id = p_restaurant_id
    ) agg
   where r.id = p_restaurant_id;
$$;

-- AFTER trigger on reviews: new review, edited review and deleted review
-- all end up here (an UPDATE that hypothetically moved a review to another
-- restaurant refreshes both sides).
create or replace function public.foodie_refresh_review_aggregates()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (tg_op in ('INSERT', 'UPDATE')) then
    perform public.foodie_set_review_aggregates(new.restaurant_id);
  end if;
  if (tg_op = 'DELETE'
      or (tg_op = 'UPDATE'
          and old.restaurant_id is distinct from new.restaurant_id)) then
    perform public.foodie_set_review_aggregates(old.restaurant_id);
  end if;
  return null; -- AFTER trigger: row value is irrelevant
end;
$$;

drop trigger if exists reviews_review_aggregates on public.reviews;
create trigger reviews_review_aggregates
  after insert or update or delete on public.reviews
  for each row execute function public.foodie_refresh_review_aggregates();

-- Direct calls are not allowed (the trigger itself needs no EXECUTE grant).
revoke execute on function public.foodie_set_review_aggregates(uuid)      from public, anon, authenticated;
revoke execute on function public.foodie_refresh_review_aggregates()      from public, anon, authenticated;

-- One-time backfill — includes ALL existing reviews. (reviews is empty
-- today, so this updates 0 rows: every restaurant honestly stays at
-- review_count = 0, community_rating = NULL until real reviews arrive.)
update public.restaurants r
   set review_count     = agg.cnt,
       community_rating = agg.avg_rating
  from (
    select restaurant_id,
           count(*)::int                as cnt,
           avg(rating)::double precision as avg_rating
      from public.reviews
     group by restaurant_id
  ) agg
 where agg.restaurant_id = r.id;

-- ---------------------------------------------------------------------------
-- PART C — rebuilt nearby_restaurants RPC (same signature, complete row)
--   The drop + create below run in ONE SQL-Editor transaction, so there is
--   no visible window where the function is missing; the app's Node-side
--   Haversine fallback (identical math) covers even a hypothetical gap.
--   Distance semantics are byte-for-byte the same Haversine as before.
-- ---------------------------------------------------------------------------
drop function if exists public.nearby_restaurants(
  double precision, double precision, double precision
);

create function public.nearby_restaurants(
  lat       double precision,
  lng       double precision,
  radius_km double precision
)
returns table (
  id                    uuid,
  name                  text,
  description           text,
  category              text,
  address               text,
  city                  text,
  latitude              double precision,
  longitude             double precision,
  rating                double precision,
  price_level           text,
  opening_hours         text,
  phone                 text,
  website               text,
  is_hidden_gem         boolean,
  is_local_favorite     boolean,
  student_friendly      boolean,
  verification_status   text,
  tags                  text[],
  locality              text,
  review_count          integer,
  community_rating      double precision,
  source                text,
  source_url            text,
  last_verified_at      timestamptz,
  address_verified      boolean,
  coordinates_verified  boolean,
  hours_verified        boolean,
  photos_verified       boolean,
  created_at            timestamptz,
  distance_km           double precision
)
language sql
stable
set search_path = ''
as $$
  select
    r.id, r.name, r.description, r.category, r.address, r.city,
    r.latitude, r.longitude, r.rating, r.price_level, r.opening_hours,
    r.phone, r.website, r.is_hidden_gem, r.is_local_favorite,
    r.student_friendly, r.verification_status, r.tags, r.locality,
    r.review_count, r.community_rating,
    r.source, r.source_url, r.last_verified_at,
    r.address_verified, r.coordinates_verified, r.hours_verified,
    r.photos_verified, r.created_at,
    6371 * 2 * asin(sqrt(
      power(sin(radians(r.latitude - lat) / 2), 2) +
      cos(radians(lat)) * cos(radians(r.latitude)) *
      power(sin(radians(r.longitude - lng) / 2), 2)
    )) as distance_km
  from public.restaurants r
  where 6371 * 2 * asin(sqrt(
      power(sin(radians(r.latitude - lat) / 2), 2) +
      cos(radians(lat)) * cos(radians(r.latitude)) *
      power(sin(radians(r.longitude - lng) / 2), 2)
    )) <= radius_km
  order by distance_km asc;
$$;

grant execute on function public.nearby_restaurants(
  double precision, double precision, double precision
) to anon, authenticated;

-- ============================================================================
-- REVERT (only if ever needed — run in this order):
--   drop trigger if exists reviews_review_aggregates on public.reviews;
--   drop function if exists public.foodie_refresh_review_aggregates();
--   drop function if exists public.foodie_set_review_aggregates(uuid);
--   drop function if exists public.nearby_restaurants(double precision, double precision, double precision);
--     -- then re-run schema.sql §6 to restore the legacy-shaped RPC
--   alter table public.restaurants
--     drop column if exists photos_verified,
--     drop column if exists hours_verified,
--     drop column if exists coordinates_verified,
--     drop column if exists address_verified,
--     drop column if exists last_verified_at,
--     drop column if exists source_url,
--     drop column if exists source,
--     drop column if exists community_rating,
--     drop column if exists review_count;
--   -- (drops are listed child-first; every column is additive and nullable
--   --  except review_count whose default makes the drop safe)
-- ============================================================================
