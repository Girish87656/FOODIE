-- ============================================================================
-- Foodie — Supabase schema (restaurants, dishes, reviews, restaurant_photos)
-- ----------------------------------------------------------------------------
-- HOW TO RUN
--   Supabase Dashboard -> SQL Editor -> New query -> paste this whole file ->
--   Run. Safe to re-run (idempotent: uses IF NOT EXISTS / OR REPLACE).
--
-- CONVENTIONS USED BY THE FOODIE APP (see src/lib/foodie/data/mappers.ts)
--   restaurants.category      : one of the 7 pilot PLACE categories
--                               ('restaurant','hotel','tiffin','cafe',
--                                'fast_food','street_food','bakery_sweets')
--                               Finer types (tea_stall, food_truck, canteen,
--                               home_food, ...) are `tags`, never categories.
--   restaurants.verification_status : 'verified' | 'community_submitted'
--                               | 'unverified' | 'closed'
--   restaurants.student_friendly : true -> suits students (GITAM pilot area)
--   restaurants.locality     : corridor area label ('GITAM campus',
--                               'Nagadenahalli', 'Doddaballapura Railway Station',
--                               'Doddaballapura town')
--   restaurants.price_level   : '₹' (budget) | '₹₹' (mid) | '₹₹₹' (premium)
--   restaurants.opening_hours : 'HH:MM-HH:MM' 24h, e.g. '07:00-22:00'
--   dishes.is_signature       : true  -> "Signature dishes" section
--                               false -> "Famous dishes" section
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1) restaurants
-- ---------------------------------------------------------------------------
create table if not exists public.restaurants (
  id                uuid primary key default gen_random_uuid(),
  name              text not null,
  description       text,
  category          text not null,
  address           text not null,
  city              text not null,
  latitude          double precision not null,
  longitude         double precision not null,
  rating            double precision not null default 0
                      check (rating >= 0 and rating <= 5),
  price_level       text not null default '₹₹'
                      check (price_level in ('₹', '₹₹', '₹₹₹')),
  opening_hours     text,
  phone             text,
  website           text,
  is_hidden_gem     boolean not null default false,
  is_local_favorite boolean not null default false,
  student_friendly  boolean not null default false,
  verification_status text not null default 'unverified'
                      check (verification_status in
                        ('verified', 'community_submitted', 'unverified', 'closed')),
  tags              text[] not null default '{}',
  locality          text,
  created_at        timestamptz not null default now(),
  constraint restaurants_category_allowed_check
    check (category in (
      'restaurant', 'hotel', 'tiffin', 'cafe',
      'fast_food', 'street_food', 'bakery_sweets'
    ))
);

comment on table public.restaurants is
  'Foodie restaurants. latitude/longitude are WGS-84 degrees and are the source of truth for all distance calculations.';

-- Helpful indexes (bounding-box pre-filter for nearby search + common lookups)
create index if not exists restaurants_lat_lng_idx on public.restaurants (latitude, longitude);
create index if not exists restaurants_category_idx on public.restaurants (category);
create index if not exists restaurants_city_idx on public.restaurants (city);
create index if not exists restaurants_verification_status_idx on public.restaurants (verification_status);
create index if not exists restaurants_student_friendly_idx on public.restaurants (student_friendly);

comment on column public.restaurants.student_friendly is
  'True when the place suits students — budget menus, timings and portions that fit GITAM campus life.';
comment on column public.restaurants.verification_status is
  'Trust state: verified = checked by the Foodie team; community_submitted = added by a user, pending check; unverified = imported/unknown; closed = permanently shut (kept for history, hidden from discovery).';
comment on column public.restaurants.tags is
  'Free-form tags for finer types (tea_stall, food_truck, canteen, home_food, ...). Tags NEVER replace the 7 main categories.';
comment on column public.restaurants.locality is
  'Pilot-corridor area label, e.g. GITAM campus / Nagadenahalli / Doddaballapura Railway Station / Doddaballapura town.';

-- ---------------------------------------------------------------------------
-- 2) dishes
-- ---------------------------------------------------------------------------
create table if not exists public.dishes (
  id            uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  name          text not null,
  description   text,
  price         numeric(10, 2),
  category      text,
  calories      integer,
  protein       numeric(6, 2),
  carbs         numeric(6, 2),
  fat           numeric(6, 2),
  is_signature  boolean not null default false,
  created_at    timestamptz not null default now()
);

create index if not exists dishes_restaurant_idx on public.dishes (restaurant_id);

-- ---------------------------------------------------------------------------
-- 3) reviews
--    user_id points at Supabase Auth. NULL user_id is allowed so imported /
--    legacy reviews can exist before auth is wired up.
-- ---------------------------------------------------------------------------
create table if not exists public.reviews (
  id            uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  user_id       uuid references auth.users (id) on delete set null,
  rating        integer not null check (rating >= 1 and rating <= 5),
  review        text not null,
  created_at    timestamptz not null default now()
);

create index if not exists reviews_restaurant_idx on public.reviews (restaurant_id);
create index if not exists reviews_user_idx on public.reviews (user_id);

-- ---------------------------------------------------------------------------
-- 4) restaurant_photos
-- ---------------------------------------------------------------------------
create table if not exists public.restaurant_photos (
  id            uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  image_url     text not null,
  uploaded_by   uuid references auth.users (id) on delete set null,
  created_at    timestamptz not null default now()
);

create index if not exists restaurant_photos_restaurant_idx on public.restaurant_photos (restaurant_id);

-- ============================================================================
-- 5) Row Level Security
--    Public READ (the discovery feed needs no login), authenticated WRITE.
--    Tighten restaurant/dish/photo writes to specific roles when an admin
--    panel exists.
-- ============================================================================
alter table public.restaurants       enable row level security;
alter table public.dishes            enable row level security;
alter table public.reviews           enable row level security;
alter table public.restaurant_photos enable row level security;

-- Everyone (anon included) can read the discovery data
drop policy if exists "restaurants are readable by everyone" on public.restaurants;
create policy "restaurants are readable by everyone"
  on public.restaurants for select using (true);

drop policy if exists "dishes are readable by everyone" on public.dishes;
create policy "dishes are readable by everyone"
  on public.dishes for select using (true);

drop policy if exists "reviews are readable by everyone" on public.reviews;
create policy "reviews are readable by everyone"
  on public.reviews for select using (true);

drop policy if exists "photos are readable by everyone" on public.restaurant_photos;
create policy "photos are readable by everyone"
  on public.restaurant_photos for select using (true);

-- Logged-in users can contribute reviews (own only) and photos (own only)
drop policy if exists "users can write their own reviews" on public.reviews;
create policy "users can write their own reviews"
  on public.reviews for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists "users can update their own reviews" on public.reviews;
create policy "users can update their own reviews"
  on public.reviews for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "users can delete their own reviews" on public.reviews;
create policy "users can delete their own reviews"
  on public.reviews for delete to authenticated
  using (user_id = auth.uid());

drop policy if exists "users can upload photos" on public.restaurant_photos;
create policy "users can upload photos"
  on public.restaurant_photos for insert to authenticated
  with check (uploaded_by = auth.uid());

-- Restaurant / dish / photo management stays closed to anon for now.
-- (Insert an admin policy here, or use the service-role key server-side,
--  once a restaurant onboarding flow is built.)

-- ============================================================================
-- 6) nearby_restaurants(lat, lng, radius_km)
--    Database-side geographic query — the efficient path Foodie's API tries
--    FIRST. Pure-SQL Haversine, so it works on any Supabase project (no
--    PostGIS required). Returns rows already filtered by radius and sorted
--    nearest-first, each annotated with distance_km.
--
--    Foodie's API route falls back to fetching rows + Haversine in Node if
--    this function is missing (e.g. only the tables above were created).
-- ============================================================================
create or replace function public.nearby_restaurants(
  lat       double precision,
  lng       double precision,
  radius_km double precision
)
returns table (
  id                uuid,
  name              text,
  description       text,
  category          text,
  address           text,
  city              text,
  latitude          double precision,
  longitude         double precision,
  rating            double precision,
  price_level       text,
  opening_hours     text,
  phone             text,
  website           text,
  is_hidden_gem     boolean,
  is_local_favorite boolean,
  created_at        timestamptz,
  distance_km       double precision
)
language sql
stable
set search_path = ''
as $$
  select
    r.id, r.name, r.description, r.category, r.address, r.city,
    r.latitude, r.longitude, r.rating, r.price_level, r.opening_hours,
    r.phone, r.website, r.is_hidden_gem, r.is_local_favorite, r.created_at,
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

-- ============================================================================
-- 7) OPTIONAL PostGIS upgrade (run later, when the dataset grows big)
-- ----------------------------------------------------------------------------
-- PostGIS gives you a GiST-indexed geography column + ST_DWithin, which scales
-- to millions of rows. To upgrade:
--
--   create extension if not exists postgis;
--   alter table public.restaurants
--     add column location geography(point, 4326)
--     generated always as
--       (st_setsrid(st_makepoint(longitude, latitude), 4326)) stored;
--   create index restaurants_location_idx on public.restaurants using gist (location);
--
-- Then replace the body of nearby_restaurants with:
--
--   select r.*, st_distance(r.location, st_setsrid(st_makepoint(lng, lat), 4326)) / 1000
--     as distance_km
--   from public.restaurants r
--   where st_dwithin(
--     r.location,
--     st_setsrid(st_makepoint(lng, lat), 4326),
--     radius_km * 1000
--   )
--   order by distance_km asc;
--
-- No Foodie app-code changes are needed — the RPC signature stays the same.
-- ============================================================================
