-- ============================================================================
-- Foodie — INSERT BATCH 002: GITAM-side batch (6 approved places)
-- ----------------------------------------------------------------------------
-- Coverage: GITAM Deemed to be University Bengaluru (Nagadenahalli)
--           → NH-207/NH-648 campus surroundings → Bashettihalli
--
-- RELATIONSHIP TO BATCH 001 (station/town batch)
--   * This file does NOT update, delete or replace ANY existing row.
--   * It only INSERTs the 6 approved GITAM-side places, each guarded by
--     (a) a fixed uuid + `on conflict (id) do nothing` and
--     (b) a "same trimmed name already exists in Doddaballapura" skip,
--     so a duplicate row is impossible even if you run this file twice.
--   * Part 0 re-applies the same 3 idempotent ALTERs as batch 001 (they are
--     no-ops if batch 001 already ran) so NULL coordinates / NULL prices are
--     accepted regardless of the order you run the two files in.
--
-- EVIDENCE RULES HONORED
--   * latitude / longitude = NULL for ALL 6 places. No published Plus Code
--     exists for any of them; coordinates are NEVER derived from addresses.
--     Until they are field-verified, these places appear in search / category
--     / detail screens but NOT in nearby-distance discovery.
--   * rating: the column is NOT NULL (schema), so "no usable rating" is stored
--     as 0 — the sentinel meaning "not yet captured" (the app hides the badge
--     at 0). Where sources CONFLICT we store 0 rather than picking a side,
--     exactly per your instruction.
--   * phone / price / hours: NULL wherever evidence is missing or conflicting.
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
-- Part 1 — the 6 approved GITAM-side places
-- ---------------------------------------------------------------------------

-- 1) Amigos Cafe --------------------------------------------------------------
--    Identity: your "AMIGOS". Web name variants: JustDial "Amigos Gitam"
--    (NH 207, Kodihalli Village, 561203) and JustDial "Amigos C" (46 ratings);
--    Snapchat calls it "AMIGOS Cafe". Distinct from Amigos Café (Coorg),
--    Amigos Resto Cafe (Sanjay Nagar) and amigoskings.com — none are this one.
--    Rating 4.3: JustDial "Amigos C", 46 ratings (single source).
--    Hours NULL: conflict — JD 10:00–23:00 vs Snapchat 11:00–22:00.
--    Phone/price NULL: none published in captured listings.
insert into public.restaurants
  (id, name, category, address, city, locality, latitude, longitude,
   rating, price_level, opening_hours, phone, tags,
   student_friendly, is_hidden_gem, is_local_favorite, verification_status)
select
  '973a6f0e-fd38-42c3-a4a7-369713091735',
  'Amigos Cafe',
  'cafe',
  'NH 207, Kodihalli Village, Nagadenahalli, Doddaballapura taluk, Bengaluru 561203 (opp. GITAM University main gate)',
  'Doddaballapura',
  'Nagadenahalli',
  null,                             -- NO coordinates yet — must be field-verified
  null,
  4.3,                              -- JustDial "Amigos C", 46 ratings (single source)
  null,                             -- no price evidence
  null,                             -- conflict: JD 10:00–23:00 vs Snapchat 11:00–22:00
  null,                             -- none published
  array['cafe']::text[],
  false, false, false,
  'unverified'
where not exists (
  select 1 from public.restaurants existing
  where existing.city = 'Doddaballapura'
    and lower(btrim(existing.name)) = lower(btrim('Amigos Cafe'))
)
on conflict (id) do nothing;

-- 2) SS Hyderabadi Biriyani Zone ------------------------------------------------
--    Sources: JustDial ("Near Gitam College, Nagadenahalli", pin 561205;
--    second JD snippet "Nh648 Nagandenahalli Doddaballapur") · district.in
--    (Near Gitam College; ₹1000 for two; opens 10:00; phone 8431950124)
--    · Snapchat (Near Gitam College; 10:00–22:00; same phone) · Zomato
--    (cuisines: Biryani, North Indian, Mughlai, Mandi, Chinese, Seafood).
--    Rating 0: JD snippets CONFLICT (4.0/326 vs 3.8/211) → not captured.
--    Phone: Snapchat + district AGREE → included.
--    Hours: Snapchat full range; district corroborates the 10:00 opening.
insert into public.restaurants
  (id, name, category, address, city, locality, latitude, longitude,
   rating, price_level, opening_hours, phone, tags,
   student_friendly, is_hidden_gem, is_local_favorite, verification_status)
select
  'f37d212b-3845-4cd4-a6d7-b6a91cf4918c',
  'SS Hyderabadi Biriyani Zone',
  'restaurant',
  'Near Gitam College, NH-648, Nagadenahalli, Doddaballapura 561205',
  'Doddaballapura',
  'Nagadenahalli',
  null,                             -- NO coordinates yet — must be field-verified
  null,
  0,                                -- CONFLICT (JD 4.0/326 vs 3.8/211) → not captured
  '₹₹',                             -- district.in: ₹1000 for two → mid bracket
  '10:00-22:00',                    -- Snapchat; district confirms opens 10:00
  '+918431950124',                  -- Snapchat + district AGREE
  array['biryani','hyderabadi']::text[],  -- Zomato cuisine + name
  false, false, false,
  'unverified'
where not exists (
  select 1 from public.restaurants existing
  where existing.city = 'Doddaballapura'
    and lower(btrim(existing.name)) = lower(btrim('SS Hyderabadi Biriyani Zone'))
)
on conflict (id) do nothing;

-- 3) GITAM University Canteen ---------------------------------------------------
--    Sources: JustDial "Gitam University Canteen", 3.7 / 772 ratings, listed
--    under Heggadahalli; JD ALSO lists "Gitam Cafe" 3.7/768 — same value,
--    probable duplicate listing (or a 2nd campus outlet) — flagged for
--    reconciliation. gitam.edu "Campus Dining" documents on-campus dining.
--    Campus pin conflict (561203 vs 562163 in various listings) → pin omitted.
--    student_friendly stays false for now per your blanket rule, even though
--    this is the campus canteen.
insert into public.restaurants
  (id, name, category, address, city, locality, latitude, longitude,
   rating, price_level, opening_hours, phone, tags,
   student_friendly, is_hidden_gem, is_local_favorite, verification_status)
select
  '7259037f-932d-4c04-91ef-bbf948a387b9',
  'GITAM University Canteen',
  'restaurant',
  'GITAM Bengaluru campus, NH 207, Nagadenahalli, Doddaballapura taluk',
  'Doddaballapura',
  'GITAM campus',                   -- JD files it under Heggadahalli (adjacent)
  null,                             -- NO coordinates yet — must be field-verified
  null,
  3.7,                              -- JustDial, 772 ratings (dup listing 768, same score)
  null,                             -- no price evidence
  null,                             -- no published hours
  null,
  array['canteen']::text[],
  false, false, false,
  'unverified'
where not exists (
  select 1 from public.restaurants existing
  where existing.city = 'Doddaballapura'
    and lower(btrim(existing.name)) = lower(btrim('GITAM University Canteen'))
)
on conflict (id) do nothing;

-- 4) Abhiram Food Court ----------------------------------------------------------
--    Sources: JustDial listing "Abhiram Food Court in Moparahalli"
--    (4.0 / 5 reviews — THIN sample; 11:00–23:00 daily). Exact street address
--    not published; Moparahalli's position relative to campus not yet
--    independently confirmed — flag for your on-ground confirmation.
--    Distinct from "Abhis Food Court" (Scout Camp Rd) — different business.
insert into public.restaurants
  (id, name, category, address, city, locality, latitude, longitude,
   rating, price_level, opening_hours, phone, tags,
   student_friendly, is_hidden_gem, is_local_favorite, verification_status)
select
  'c3936dec-2b09-471c-a050-6bebbd1583aa',
  'Abhiram Food Court',
  'restaurant',
  'Moparahalli, Doddaballapura',
  'Doddaballapura',
  'Moparahalli',
  null,                             -- NO coordinates yet — must be field-verified
  null,
  4.0,                              -- JustDial, 5 reviews only (thin — flagged)
  null,                             -- no price evidence
  '11:00-23:00',                    -- JustDial, all days
  null,
  array['food_court']::text[],
  false, false, false,
  'unverified'
where not exists (
  select 1 from public.restaurants existing
  where existing.city = 'Doddaballapura'
    and lower(btrim(existing.name)) = lower(btrim('Abhiram Food Court'))
)
on conflict (id) do nothing;

-- 5) Sri Ganesh Grand -------------------------------------------------------------
--    Sources: TripAdvisor (Boss Tower, Doddaballapur Main Road, Bashettihalli
--    561203; "beside highway SH-9… just after crossing Columbia Asia Hospital";
--    self-service + 1st-floor service) · JustDial (10,654 ratings; URL slug
--    "Near Columbia Clinic Opposite Navodaya Vidyalaya"; "Sri Ganesh Grand Veg
--    Restaurant — North Indian & Chinese") · district.in (₹200 for two;
--    8:00 AM–10:00 PM) · Zomato (delivery listing).
--    Rating 0: JD 4.1/10,654 vs TripAdvisor 3.4/7 CONFLICT → not captured.
--    Hours: district.in only (single source).
insert into public.restaurants
  (id, name, category, address, city, locality, latitude, longitude,
   rating, price_level, opening_hours, phone, tags,
   student_friendly, is_hidden_gem, is_local_favorite, verification_status)
select
  '60cc569b-8eea-480d-8f92-f854bdddb87b',
  'Sri Ganesh Grand',
  'restaurant',
  'Boss Tower, Doddaballapur Main Road, Bashettihalli, Doddaballapur 561203',
  'Doddaballapura',
  'Bashettihalli',
  null,                             -- NO coordinates yet — must be field-verified
  null,
  0,                                -- CONFLICT (JD 4.1/10654 vs TA 3.4/7) → not captured
  '₹',                              -- district.in: ₹200 for two → budget bracket
  '08:00-22:00',                    -- district.in (single source)
  null,                             -- none published
  array['veg','family_restaurant','self_service']::text[],
  false, false, false,
  'unverified'
where not exists (
  select 1 from public.restaurants existing
  where existing.city = 'Doddaballapura'
    and lower(btrim(existing.name)) = lower(btrim('Sri Ganesh Grand'))
)
on conflict (id) do nothing;

-- 6) The Biryani Shack -------------------------------------------------------------
--    Sources: JustDial "The Biryani Shack", 4.7 / 31 ratings (consistent
--    across two JD pages), Heggadahalli (pin 561205), "Opens at 7:00 am".
--    Hours NULL: opening 07:00 is published but closing time is not — an
--    incomplete range is not stored.
insert into public.restaurants
  (id, name, category, address, city, locality, latitude, longitude,
   rating, price_level, opening_hours, phone, tags,
   student_friendly, is_hidden_gem, is_local_favorite, verification_status)
select
  '3f25ba72-4d39-400b-aebb-ca303a7bdfd2',
  'The Biryani Shack',
  'restaurant',
  'Heggadahalli, Doddaballapura 561205',
  'Doddaballapura',
  'Heggadahalli',
  null,                             -- NO coordinates yet — must be field-verified
  null,
  4.7,                              -- JustDial, 31 ratings (consistent on 2 JD pages)
  null,                             -- no price evidence
  null,                             -- opens 07:00 but closing unknown → incomplete
  null,
  array['biryani']::text[],
  false, false, false,
  'unverified'
where not exists (
  select 1 from public.restaurants existing
  where existing.city = 'Doddaballapura'
    and lower(btrim(existing.name)) = lower(btrim('The Biryani Shack'))
)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Part 2 — verify what landed (shows ONLY these 6 rows)
-- ---------------------------------------------------------------------------
select name, category, locality, latitude, longitude, rating, price_level,
       opening_hours, phone, tags, verification_status, student_friendly,
       is_hidden_gem, is_local_favorite
from public.restaurants
where id in (
  '973a6f0e-fd38-42c3-a4a7-369713091735',  -- Amigos Cafe
  'f37d212b-3845-4cd4-a6d7-b6a91cf4918c',  -- SS Hyderabadi Biriyani Zone
  '7259037f-932d-4c04-91ef-bbf948a387b9',  -- GITAM University Canteen
  'c3936dec-2b09-471c-a050-6bebbd1583aa',  -- Abhiram Food Court
  '60cc569b-8eea-480d-8f92-f854bdddb87b',  -- Sri Ganesh Grand
  '3f25ba72-4d39-400b-aebb-ca303a7bdfd2'   -- The Biryani Shack
)
order by name;

commit;

-- ============================================================================
-- LATER — when a place's coordinates are field-verified (Google Maps pin on a
-- visit, or an authoritative listing), fill them in with:
--
--   update public.restaurants
--      set latitude = <verified-lat>, longitude = <verified-lng>
--    where name = '<place name>' and city = 'Doddaballapura';
--
-- The place immediately starts appearing in nearby discovery — no app changes
-- needed. Do NOT fill coordinates from addresses; verify on the ground or
-- from an authoritative map pin first.
-- ============================================================================
