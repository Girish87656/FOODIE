-- ============================================================================
-- Foodie — INSERT BATCH 001: first 8 real places (pilot corridor)
-- ----------------------------------------------------------------------------
-- Coverage: GITAM Deemed to be University Bengaluru, Nagadenahalli
--           → Doddaballapura Railway Station → Doddaballapura town
--
-- WHAT THIS DOES
--   Part 0  Makes latitude, longitude and price_level nullable (idempotent,
--           non-destructive). REQUIRED so this batch can honor the
--           "never invent data" rule: 7 of the 8 places have NO verified
--           coordinates yet and most have no captured price — the previous
--           NOT NULL constraints would have forced fake values or 0,0.
--           `rating` KEEPS its NOT NULL DEFAULT 0 (0 = "not yet captured";
--           the app hides the rating badge at 0).
--   Part 1  Inserts EXACTLY the 8 approved A-list places. Every unknown is
--           NULL — nothing is estimated, guessed or fabricated.
--   Part 2  A verification SELECT so you can eyeball what landed.
--
-- DUPLICATE SAFETY (safe to run twice)
--   * Every row carries a FIXED uuid (pre-generated, not gen_random_uuid())
--     → `on conflict (id) do nothing` catches accidental re-runs using the
--       table's existing primary key. No new unique constraint needed.
--   * Belt-and-suspenders: each insert also skips when a row with the same
--     (trimmed, case-insensitive) name already exists in Doddaballapura —
--     so a duplicate is prevented even if a place was added manually earlier
--     under a different id.
--
-- DO NOT run this until you have reviewed every value below.
-- Run: Supabase Dashboard → SQL Editor → paste → Run.
-- Sources per field are cited in the comments beside each value.
-- ============================================================================

begin;

-- ---------------------------------------------------------------------------
-- Part 0 — allow honest NULLs (idempotent, keeps all existing data)
-- ---------------------------------------------------------------------------
alter table public.restaurants alter column latitude    drop not null;
alter table public.restaurants alter column longitude   drop not null;
alter table public.restaurants alter column price_level drop not null;

comment on column public.restaurants.latitude is
  'WGS-84 latitude. NULL = awaiting coordinate verification — Foodie NEVER estimates coordinates from addresses. NULL-coordinate places are excluded from nearby discovery until verified.';
comment on column public.restaurants.longitude is
  'WGS-84 longitude. NULL = awaiting coordinate verification (see latitude).';
comment on column public.restaurants.price_level is
  '''₹'' (budget) | ''₹₹'' (mid) | ''₹₹₹'' (premium). NULL = price not captured yet — never guessed.';

-- ---------------------------------------------------------------------------
-- Part 1 — the 8 approved places
-- ---------------------------------------------------------------------------

-- 1) Ayyappa Tiffin Room -----------------------------------------------------
--    Sources: JustDial (580 reviews; Scout Camp Rd; self-service; idli/dosa/
--    lemon rice) · magicpin (address + Google plus code 7HH2+XV9) · Yandex (phone)
--    Coordinates: decoded from the listing's PUBLISHED plus code 7HH2+XV9
--    (approved by you). Still verification_status='unverified'.
--    Hours NULL: two JustDial pages conflict (7:00–21:00 vs 7:00–22:00).
--    Rating 0: JustDial shows 580 reviews but no numeric average in captured
--    listings — 0 means "not yet captured" (app hides the badge).
insert into public.restaurants
  (id, name, category, address, city, locality, latitude, longitude,
   rating, price_level, opening_hours, phone, tags,
   student_friendly, is_hidden_gem, is_local_favorite, verification_status)
select
  '02a34d5f-75cd-4dfc-bc4d-989e5ea7d3c5',
  'Ayyappa Tiffin Room',
  'tiffin',
  'Scout Camp Road, near Railway Station, Doddaballapura',
  'Doddaballapura',
  'Doddaballapura Railway Station',
  13.279913,
  77.552234,
  0,                                -- not yet captured (JustDial: 580 reviews, no numeric avg)
  null,                             -- no price evidence
  null,                             -- JD conflict: 07:00-21:00 vs 07:00-22:00
  '+918088599999',                  -- Yandex Maps listing (single source — recheck welcome)
  array['self_service']::text[],    -- JustDial reviews describe self-service
  false, false, false,
  'unverified'
where not exists (
  select 1 from public.restaurants existing
  where existing.city = 'Doddaballapura'
    and lower(btrim(existing.name)) = lower(btrim('Ayyappa Tiffin Room'))
)
on conflict (id) do nothing;

-- 2) Shri Manjunatha Grand Veg ------------------------------------------------
--    Sources: Zomato (address, cuisines) · JustDial (daily hours; "Fine Dine
--    and Party Hall"; listed from Basettihalli) · Swiggy (181 veg items)
--    · favhiker capture of the Google listing (4.6, 253 reviews; an Instagram
--    aggregator mentions 4.5 — Google score drift, kept 4.6 with count).
--    Phone NULL: none published in captured listings.
insert into public.restaurants
  (id, name, category, address, city, locality, latitude, longitude,
   rating, price_level, opening_hours, phone, tags,
   student_friendly, is_hidden_gem, is_local_favorite, verification_status)
select
  '987dad98-1ab0-43f0-ac0b-d6ff9a571c9f',
  'Shri Manjunatha Grand Veg',
  'restaurant',
  'Khata 928/20/1, Scout Camp Road, near Railway Station (next to Max showroom), Doddaballapura',
  'Doddaballapura',
  'Doddaballapura Railway Station',
  null,                             -- NO coordinates yet — must be field-verified
  null,
  4.6,                              -- Google, 253 reviews (via favhiker)
  null,                             -- IG "meals from ~₹100" too vague → not captured
  '06:00-23:00',                    -- JustDial, all days
  null,
  array['veg','fine_dine','party_hall']::text[],  -- listing name + Swiggy 181 veg items
  false, false, false,
  'unverified'
where not exists (
  select 1 from public.restaurants existing
  where existing.city = 'Doddaballapura'
    and lower(btrim(existing.name)) = lower(btrim('Shri Manjunatha Grand Veg'))
)
on conflict (id) do nothing;

-- 3) Hotel Halli Nanasu -------------------------------------------------------
--    Sources: JustDial (4.2 / 3,357 ratings; Basettihalli) · district.in
--    (7th Ward, Bengaluru Main Rd; opens 11:00; phone 8494890975)
--    · magicpin (11:00–23:00; phone 9980565714) · restaurant-guru (menu page,
--    phone 9606039923) · Zomato dining 4.0/33.
--    Phone NULL: THREE listings disagree — verify the real number first.
insert into public.restaurants
  (id, name, category, address, city, locality, latitude, longitude,
   rating, price_level, opening_hours, phone, tags,
   student_friendly, is_hidden_gem, is_local_favorite, verification_status)
select
  'e6ba7907-b08e-4bb0-98d6-6da8370ef967',
  'Hotel Halli Nanasu',
  'hotel',
  '7th Ward, Bengaluru Main Road, Doddaballapura',
  'Doddaballapura',
  'Doddaballapura town',
  null,                             -- NO coordinates yet — must be field-verified
  null,
  4.2,                              -- JustDial, 3,357 ratings (Zomato dining 4.0/33)
  null,                             -- no price evidence
  '11:00-23:00',                    -- magicpin 11:00–23:00; district "opens 11:00"
  null,                             -- conflicting: 8494890975 / 9606039923 / 9980565714
  '{}'::text[],
  false, false, false,
  'unverified'
where not exists (
  select 1 from public.restaurants existing
  where existing.city = 'Doddaballapura'
    and lower(btrim(existing.name)) = lower(btrim('Hotel Halli Nanasu'))
)
on conflict (id) do nothing;

-- 4) Brundavana Family Restaurant --------------------------------------------
--    Sources: JustDial (4.2 / 263 reviews; opens 11:00) · Explurger (Scout
--    Camp Rd, 561205; 4.3/223; "family-friendly, veg & non veg") · district.in
--    (₹300 for two; 12:00–22:30) · Zomato (delivery listing).
--    Hours NULL: sources conflict on opening time (11:00 vs 12:00).
insert into public.restaurants
  (id, name, category, address, city, locality, latitude, longitude,
   rating, price_level, opening_hours, phone, tags,
   student_friendly, is_hidden_gem, is_local_favorite, verification_status)
select
  '343812c9-168c-4cb8-ad8f-006a40704334',
  'Brundavana Family Restaurant',
  'restaurant',
  'Scout Camp Road, Doddaballapura',
  'Doddaballapura',
  'Scout Camp Road',
  null,                             -- NO coordinates yet — must be field-verified
  null,
  4.2,                              -- JustDial, 263 reviews (Explurger 4.3/223)
  '₹',                              -- district.in: ₹300 for two → budget bracket
  null,                             -- conflict: opens 11:00 (JD) vs 12:00–22:30 (district)
  null,
  array['family_restaurant']::text[], -- name + Explurger "family-friendly"
  false, false, false,
  'unverified'
where not exists (
  select 1 from public.restaurants existing
  where existing.city = 'Doddaballapura'
    and lower(btrim(existing.name)) = lower(btrim('Brundavana Family Restaurant'))
)
on conflict (id) do nothing;

-- 5) Chickpet Donne Biryani House (Doddaballapura branch) --------------------
--    Sources: Zomato (Doddaballapura outlet reviews) · Swiggy (delivers in
--    Doddaballapura) · JustDial (JP Palace Putani Complex; "Nati-style
--    biryani") · district.in (shops 9–12; ₹1000 for two; opens 11:00)
--    · Facebook (branch on Bashettahalli Rd opp Bharath Petroleum).
--    This is the Doddaballapura BRANCH of the central-Bengaluru chain.
--    Locality NULL: micro-location references differ (Putani Complex vs
--    Bashettahalli Road) — confirm during verification.
insert into public.restaurants
  (id, name, category, address, city, locality, latitude, longitude,
   rating, price_level, opening_hours, phone, tags,
   student_friendly, is_hidden_gem, is_local_favorite, verification_status)
select
  '5218d019-a529-400b-81db-6acac7450faa',
  'Chickpet Donne Biryani House',
  'restaurant',
  'Shop Nos 9-12, JP Palace, Putani Complex, Doddaballapura',
  'Doddaballapura',
  null,                             -- micro-location variants — verify
  null,                             -- NO coordinates yet — must be field-verified
  null,
  0,                                -- not yet captured (FB notes "feedback is split")
  '₹₹',                             -- district.in: ₹1000 for two → mid bracket
  null,                             -- opens 11:00 but closing time not published
  null,
  array['biryani','donne_biryani']::text[], -- name + JD "Nati-style biryani"
  false, false, false,
  'unverified'
where not exists (
  select 1 from public.restaurants existing
  where existing.city = 'Doddaballapura'
    and lower(btrim(existing.name)) = lower(btrim('Chickpet Donne Biryani House'))
)
on conflict (id) do nothing;

-- 6) Hotel Royal Nandhana ------------------------------------------------------
--    Sources: JustDial (3.4 / 278 ratings; Doddaballapur Main Rd 561203)
--    · MakeMyTrip (stays + breakfast reviews, Feb 2024) · Skyscanner/Hotels.com
--    (has a restaurant, 24-hr desk) · guestreservations (Taluk Rd, near
--    Columbia Hospital, opp Jawahar Navodaya School, Arehalli Guddadahalli)
--    · restaurant-guru "top restaurants in Doddaballapura" list.
--    Distinct business from any same-name city brand.
insert into public.restaurants
  (id, name, category, address, city, locality, latitude, longitude,
   rating, price_level, opening_hours, phone, tags,
   student_friendly, is_hidden_gem, is_local_favorite, verification_status)
select
  'e989603f-3316-4b09-a025-e41438d7a5a6',
  'Hotel Royal Nandhana',
  'hotel',
  'Taluk Road / Doddaballapur Main Road, near Columbia Hospital, opp. Jawahar Navodaya School, Arehalli Guddadahalli, Doddaballapur 561203',
  'Doddaballapura',
  'Arehalli Guddadahalli',
  null,                             -- NO coordinates yet — must be field-verified
  null,
  3.4,                              -- JustDial, 278 ratings
  null,                             -- no food-menu price evidence
  null,                             -- hotel; hours not captured
  null,
  array['restaurant']::text[],      -- Skyscanner: "along with a restaurant…"
  false, false, false,
  'unverified'
where not exists (
  select 1 from public.restaurants existing
  where existing.city = 'Doddaballapura'
    and lower(btrim(existing.name)) = lower(btrim('Hotel Royal Nandhana'))
)
on conflict (id) do nothing;

-- 7) Priyanka Tiffen Center ----------------------------------------------------
--    Sources: JustDial (4.6 / 9 reviews; hours 7:00–22:00) · restaurant-guru
--    (4.2 / 615 votes; "Vegetarian, Restaurant"; open until 22:30)
--    · magicpin ("01, D Cross Rd") · Sulekha (561203) · Instagram hashtags.
--    Rating: RG's 615 votes outrank JD's 9-review sample.
--    Hours NULL: JD 7:00–22:00 vs Sulekha "opens 16:00".
--    NOTE address is PARTIAL ("01, D Cross Road") — complete it during
--    coordinate verification.
insert into public.restaurants
  (id, name, category, address, city, locality, latitude, longitude,
   rating, price_level, opening_hours, phone, tags,
   student_friendly, is_hidden_gem, is_local_favorite, verification_status)
select
  'fe248fda-3d41-42a6-a8df-efbd165b9427',
  'Priyanka Tiffen Center',
  'tiffin',
  '01, D Cross Road, Doddaballapura 561203',
  'Doddaballapura',
  'Doddaballapura town',
  null,                             -- NO coordinates yet — must be field-verified
  null,
  4.2,                              -- Restaurant Guru, 615 votes (JD 4.6/9)
  null,                             -- no price evidence
  null,                             -- conflict: JD 07:00-22:00 vs Sulekha 16:00
  null,
  array['veg']::text[],             -- restaurant-guru: "Vegetarian"
  false, false, false,
  'unverified'
where not exists (
  select 1 from public.restaurants existing
  where existing.city = 'Doddaballapura'
    and lower(btrim(existing.name)) = lower(btrim('Priyanka Tiffen Center'))
)
on conflict (id) do nothing;

-- 8) Sri Annapoorneshwari Tiffin Center ----------------------------------------
--    Sources: magicpin VERIFIED listing (RNR Complex, TB Circle, opp old KEB;
--    phone) · JustDial (4.1 / 354 reviews; "Mallathahalli Doddaballapura",
--    slug "Opposite-T-B") · Yandex (same phone) · onefivenine (opp T.B., KEB
--    Layout). NOTE: JustDial also has a second, newer listing ("Near Nandi
--    Morie") — we anchor to the TB Circle listing; reconcile during
--    verification.
insert into public.restaurants
  (id, name, category, address, city, locality, latitude, longitude,
   rating, price_level, opening_hours, phone, tags,
   student_friendly, is_hidden_gem, is_local_favorite, verification_status)
select
  'f74252ef-a172-4660-8530-b82940458353',
  'Sri Annapoorneshwari Tiffin Center',
  'tiffin',
  'RNR Complex, TB Circle, opposite old KEB, Doddaballapura 561203',
  'Doddaballapura',
  'Doddaballapura town',
  null,                             -- NO coordinates yet — must be field-verified
  null,
  4.1,                              -- JustDial, 354 reviews
  null,                             -- magicpin says ₹800/2 — unreliable for a tiffin centre
  null,                             -- conflict: JD (Sat 08:00-16:00 / Sun 08:00-12:00) vs stub
  '+918746888318',                  -- magicpin verified listing + Yandex AGREE
  '{}'::text[],
  false, false, false,
  'unverified'
where not exists (
  select 1 from public.restaurants existing
  where existing.city = 'Doddaballapura'
    and lower(btrim(existing.name)) = lower(btrim('Sri Annapoorneshwari Tiffin Center'))
)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Part 2 — verify what landed (result shown by the SQL editor)
-- ---------------------------------------------------------------------------
select name, category, locality, latitude, longitude, rating, price_level,
       opening_hours, phone, tags, verification_status, student_friendly,
       is_hidden_gem, is_local_favorite
from public.restaurants
where city = 'Doddaballapura'
order by name;

commit;

-- ============================================================================
-- LATER — when a place's coordinates are field-verified, fill them in with:
--
--   update public.restaurants
--      set latitude = <verified-lat>, longitude = <verified-lng>
--    where name = '<place name>' and city = 'Doddaballapura';
--
-- The place immediately starts appearing in nearby discovery — no app changes
-- needed. Do NOT fill coordinates from addresses; verify on the ground or
-- from an authoritative map pin first.
-- ============================================================================
