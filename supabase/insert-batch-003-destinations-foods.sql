-- ============================================================================
-- Foodie — INSERT BATCH 003: curated DESTINATIONS + DESTINATION FOODS
-- ----------------------------------------------------------------------------
-- Requires: migration-003-destinations.sql (public.destinations /
--           public.destination_foods) — ALREADY APPLIED (Stage 6A).
-- Runs BEFORE migration-004 / insert-batch-004 (food→place links come later
-- as their own reviewed batch).
--
-- WHAT THIS DOES
--   Part 1  Inserts EXACTLY 3 destinations (prototype scope, per direction):
--             Bengaluru (Karnataka) · Tirupati (Andhra Pradesh) · Mumbai
--             (Maharashtra). No additional cities — nothing else survived
--             the evidence bar.
--   Part 2  Inserts EXACTLY 5 destination foods (2 Bengaluru · 1 Tirupati ·
--             2 Mumbai) whose destination-level fame is supported by the
--             cited sources below. A restaurant menu alone was NEVER
--             accepted as evidence; every claim cites an established,
--             checkable source.
--   Part 3  Verification SELECTs.
--
-- DATA HONESTY
--   * image_url is NULL for EVERY row on purpose. Wikimedia Commons
--     candidates exist (cited per row below) but upload.wikimedia.org
--     returned HTTP 429 from the build environment during verification, so
--     their real-world usability could NOT be confirmed. Per the rule
--     "if image licensing/source is uncertain, leave image_url NULL" they
--     stay NULL. To enable one after a visual check in your own browser,
--     uncomment the image_url line of that row and re-run (guarded).
--   * Destination coordinates are the cities' published Wikipedia
--     coordinates (verbatim, not rounded or estimated).
--   * Every description contains ONLY sourced claims — no marketing
--     filler, no invented history.
--
-- DUPLICATE SAFETY (safe to run twice)
--   * Fixed pre-generated uuids + `on conflict (id) do nothing`.
--   * Destinations also guarded by lower(btrim(name)) (the unique
--     destinations_name_lower_key index backs this up at the DB level).
--   * Foods guarded by (destination_id, lower(btrim(name))) — the unique
--     destination_foods_dest_name_key index backs this up at the DB level.
--
-- DO NOT run until you have reviewed every value below.
-- Run: Supabase Dashboard → SQL Editor → paste → Run.
-- ============================================================================

begin;

-- ---------------------------------------------------------------------------
-- Part 1 — destinations
-- ---------------------------------------------------------------------------

-- 1) Bengaluru ---------------------------------------------------------------
--    slug 'bengaluru'.
--    Coordinates: Wikipedia infobox 12°58′44″N 77°35′30″E = 12.97889, 77.59167
--      https://en.wikipedia.org/wiki/Bengaluru
--    Description: "Capital of the Indian state of Karnataka" + "known as
--      India's 'Garden City', due to its parks and greenery" — Wikipedia lead.
--    Image: NULL (no verified food/city image — see honesty note above).
insert into public.destinations
  (id, slug, name, region, country, description, image_url, latitude, longitude, is_active)
select
  'b7e2a1c4-3d59-4f8a-9c21-6e4d0a5b8f31',
  'bengaluru',
  'Bengaluru',
  'Karnataka',
  'India',
  'Capital of the Indian state of Karnataka, known as India''s "Garden City" for its parks and greenery.',
  null,                               -- image withheld (usability unverified)
  12.97889,
  77.59167,
  true
where not exists (
  select 1 from public.destinations d
  where lower(btrim(d.name)) = lower(btrim('Bengaluru'))
)
on conflict (id) do nothing;

-- 2) Tirupati ----------------------------------------------------------------
--    slug 'tirupati'.
--    Coordinates: Wikipedia infobox 13°38′08″N 79°25′25″E = 13.6355, 79.4236
--      https://en.wikipedia.org/wiki/Tirupati
--    Description: "known for its significant religious and cultural heritage,
--      being home to the renowned Tirumala Venkateswara Temple, a major Hindu
--      pilgrimage site" — Wikipedia lead.
insert into public.destinations
  (id, slug, name, region, country, description, image_url, latitude, longitude, is_active)
select
  'c3d84e17-92ab-4b6e-a7f0-5819d2c4e7b2',
  'tirupati',
  'Tirupati',
  'Andhra Pradesh',
  'India',
  'City in Andhra Pradesh, home to the renowned Tirumala Venkateswara Temple — a major Hindu pilgrimage site.',
  null,                               -- image withheld (usability unverified)
  13.6355,
  79.4236,
  true
where not exists (
  select 1 from public.destinations d
  where lower(btrim(d.name)) = lower(btrim('Tirupati'))
)
on conflict (id) do nothing;

-- 3) Mumbai ------------------------------------------------------------------
--    slug 'mumbai'.
--    Coordinates: Wikipedia infobox 19°04′34″N 72°52′39″E = 19.07611, 72.8775
--      https://en.wikipedia.org/wiki/Mumbai
--    Description: "is the capital city of the Indian state of Maharashtra and
--      the financial capital of India" — Wikipedia lead.
insert into public.destinations
  (id, slug, name, region, country, description, image_url, latitude, longitude, is_active)
select
  'e5a92c68-14fb-4d3c-b087-7a26f9d3e1c4',
  'mumbai',
  'Mumbai',
  'Maharashtra',
  'India',
  'Capital of the Indian state of Maharashtra and India''s financial capital.',
  null,                               -- image withheld (usability unverified)
  19.07611,
  72.8775,
  true
where not exists (
  select 1 from public.destinations d
  where lower(btrim(d.name)) = lower(btrim('Mumbai'))
)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Part 2 — destination foods (destination_id resolved by slug, never guessed)
-- ---------------------------------------------------------------------------

-- 1) Benne Masala Dosa — Bengaluru (famous) ----------------------------------
--    Sources:
--      * https://en.wikipedia.org/wiki/Vidyarthi_Bhavan — "vegetarian tiffin
--        restaurant in Gandhi Bazaar, Basavanagudi, South Bangalore. It has
--        been considered an iconic establishment of the area and Bangalore
--        in general, with its masala dosa being particularly recognized";
--        "particularly noted for its crispy and buttery masala dosa,
--        considered its signature dish"; founded 1943.
--      * https://en.wikipedia.org/wiki/Dosa_(food) — "Benne dose: Made with
--        butter (benne in Kannada)… predominantly famous as Davanagere benne
--        dose" (butter-dosa tradition of Karnataka; the Bengaluru tiffin-room
--        preparation is what this row records — the origin city is NOT claimed).
--    Image: NULL (no verified usable Commons image found for this dish).
insert into public.destination_foods
  (id, destination_id, name, description, food_type, designation, image_url)
select
  'a4b6d8f2-5c31-4e97-8d26-90b4c1e3f7a5',
  (select id from public.destinations where slug = 'bengaluru'),
  'Benne Masala Dosa',
  'The buttery (benne) masala dosa that Bengaluru''s legacy tiffin rooms are famous for — Vidyarthi Bhavan (est. 1943, Basavanagudi) is an iconic Bengaluru establishment whose crispy, buttery masala dosa is particularly recognized.',
  'breakfast',
  'famous',
  null
where not exists (
  select 1 from public.destination_foods f
  where f.destination_id = (select id from public.destinations where slug = 'bengaluru')
    and lower(btrim(f.name)) = lower(btrim('Benne Masala Dosa'))
)
on conflict (id) do nothing;

-- 2) Bisi Bele Bath — Bengaluru (local) --------------------------------------
--    Source: https://en.wikipedia.org/wiki/Bisi_bele_bath — "a spicy,
--    rice-based dish with origins in the state of Karnataka, India. It is
--    said to have originated in the Mysore Palace." Designation 'local'
--    (Karnataka classic in Karnataka's capital); no Bengaluru-specific fame
--    is claimed beyond that.
--    Image CANDIDATE (commented — confirm it loads in your browser first):
--      https://upload.wikimedia.org/wikipedia/commons/0/04/Bisi_Bele_Bath_%28Bisibelebath%29.JPG
--      (Wikimedia Commons file "Bisi Bele Bath (Bisibelebath).JPG", CC-licensed)
insert into public.destination_foods
  (id, destination_id, name, description, food_type, designation, image_url)
select
  'd2e7f9a3-6b48-4c15-9e73-2f80a6c4d9b1',
  (select id from public.destinations where slug = 'bengaluru'),
  'Bisi Bele Bath',
  'Spicy rice-and-lentil dish with origins in the state of Karnataka — said to have originated in the Mysore Palace kitchen.',
  'rice dish',
  'local',
  null                                -- uncomment + URL above after visual check
where not exists (
  select 1 from public.destination_foods f
  where f.destination_id = (select id from public.destinations where slug = 'bengaluru')
    and lower(btrim(f.name)) = lower(btrim('Bisi Bele Bath'))
)
on conflict (id) do nothing;

-- 3) Tirupati Laddu — Tirupati (signature) -----------------------------------
--    Sources:
--      * https://en.wikipedia.org/wiki/Tirupati_laddu — "a popular sweet
--        offered as prasadam at the Venkateswara Temple in Tirupati, Andhra
--        Pradesh, India. First introduced in 1715"; "prepared in the temple's
--        kitchen … by the Tirumala Tirupati Devasthanams (TTD)"; "The laddu
--        received a Geographical Indication (GI) tag in 2009 to protect its
--        authenticity"; infobox "Registered 2009 … Area: Tirupati, Andhra
--        Pradesh".
--    Image: the only Commons image surfaced is a postage-stamp scan
--      (Stamp of India 2017 — Bhog Prasad Tirupati Laddoo), which is not a
--      usable food photograph — kept NULL.
insert into public.destination_foods
  (id, destination_id, name, description, food_type, designation, image_url)
select
  'f6c1a9d4-8e25-4b73-a2c9-3d70e5b1f8c2',
  (select id from public.destinations where slug = 'tirupati'),
  'Tirupati Laddu',
  'The popular sweet offered as prasadam at the Sri Venkateswara Temple, first introduced in 1715 and made by Tirumala Tirupati Devasthanams. Received a Geographical Indication (GI) tag in 2009.',
  'sweet / prasadam',
  'signature',
  null
where not exists (
  select 1 from public.destination_foods f
  where f.destination_id = (select id from public.destinations where slug = 'tirupati')
    and lower(btrim(f.name)) = lower(btrim('Tirupati Laddu'))
)
on conflict (id) do nothing;

-- 4) Vada Pav — Mumbai (signature) -------------------------------------------
--    Sources:
--      * https://en.wikipedia.org/wiki/Vada_pav — "Region or state: Mumbai,
--        Maharashtra"; "it originated as an affordable street food in
--        Mumbai"; infobox "Created by Ashok Vaidya and Sudhakar Mhatre,
--        Invented 1966".
--    Image CANDIDATE (commented — confirm it loads in your browser first):
--      https://upload.wikimedia.org/wikipedia/commons/4/4e/Vada_Pav-Indian_street_food.JPG
--      (Wikimedia Commons file "Vada Pav-Indian street food.JPG", CC-licensed)
insert into public.destination_foods
  (id, destination_id, name, description, food_type, designation, image_url)
select
  'b9d3e6a7-1f52-4c84-9b06-58e2a7c3d1f4',
  (select id from public.destinations where slug = 'mumbai'),
  'Vada Pav',
  'Mumbai''s iconic affordable street food — a deep-fried potato dumpling in a bread bun, which originated as street food in the city around 1966.',
  'street food / snack',
  'signature',
  null                                -- uncomment + URL above after visual check
where not exists (
  select 1 from public.destination_foods f
  where f.destination_id = (select id from public.destinations where slug = 'mumbai')
    and lower(btrim(f.name)) = lower(btrim('Vada Pav'))
)
on conflict (id) do nothing;

-- 5) Pav Bhaji — Mumbai (famous) ---------------------------------------------
--    Sources:
--      * https://en.wikipedia.org/wiki/Pav_bhaji — "Region or state: Mumbai,
--        Maharashtra"; "The dish originated as a fast lunchtime dish for
--        textile mill workers in Mumbai."
--    Image CANDIDATE (commented — confirm it loads in your browser first):
--      https://upload.wikimedia.org/wikipedia/commons/4/4a/Bambayya_Pav_bhaji.jpg
--      (Wikimedia Commons file "Bambayya Pav bhaji.jpg", CC-licensed)
insert into public.destination_foods
  (id, destination_id, name, description, food_type, designation, image_url)
select
  'c8a2f5d9-4b17-4e63-8d92-70c5e1a4b6f3',
  (select id from public.destinations where slug = 'mumbai'),
  'Pav Bhaji',
  'A thick spiced vegetable curry (bhaji) served with a buttered bread roll (pav) — originated as a fast lunchtime dish for textile mill workers in Mumbai.',
  'street food / main',
  'famous',
  null                                -- uncomment + URL above after visual check
where not exists (
  select 1 from public.destination_foods f
  where f.destination_id = (select id from public.destinations where slug = 'mumbai')
    and lower(btrim(f.name)) = lower(btrim('Pav Bhaji'))
)
on conflict (id) do nothing;

commit;

-- ---------------------------------------------------------------------------
-- Part 3 — verification (result shown by the SQL editor)
-- ---------------------------------------------------------------------------
select slug, name, region, latitude, longitude, is_active
from public.destinations order by name;

select d.slug as destination, f.name, f.food_type, f.designation, f.image_url
from public.destination_foods f
join public.destinations d on d.id = f.destination_id
order by d.name, f.name;

select (select count(*) from public.destinations)      as destinations_rows,
       (select count(*) from public.destination_foods) as destination_foods_rows;
