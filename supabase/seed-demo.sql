-- ============================================================================
-- ⚠️  DEMO / SEED DATA — NOT REAL BUSINESSES ⚠️
-- ----------------------------------------------------------------------------
-- Purpose: let you test the Foodie UI against a REAL Supabase database
--          without inventing restaurants that could be mistaken for real,
--          verified places.
--
-- Every demo place is named with a "DEMO —" prefix, tagged '{demo}', and sits
-- along the PILOT CORRIDOR (GITAM University, Nagadenahalli → Doddaballapura
-- Railway Station → Doddaballapura town). All rows use the 7 pilot place
-- categories and verification_status = 'unverified'.
--
-- To remove every trace of demo data later, run supabase/unseed-demo.sql.
--
-- REQUIRES migration-001-pilot-categories.sql (or the updated schema.sql)
-- to have been run first — the INSERT uses the new columns.
--
-- DO NOT run this if you are about to add real places only — it is optional.
--
-- HOW TO RUN: Supabase Dashboard -> SQL Editor -> paste -> Run.
-- ============================================================================

insert into public.restaurants
  (name, description, category, address, city, locality, latitude, longitude,
   rating, price_level, opening_hours, phone, website,
   is_hidden_gem, is_local_favorite, student_friendly, verification_status, tags)
values
  ('DEMO — Corridor Tiffin Room (sample data)',
   'Demo entry for testing: a friendly idli–dosa tiffin room.',
   'tiffin',
   'Demo address — near GITAM University, Nagadenahalli',
   'Doddaballapura', 'GITAM campus (demo)',
   13.182, 77.5015,
   4.5, '₹', '07:00-21:00', '+91 00000 00000', null,
   true, false, true, 'unverified', '{demo}'),

  ('DEMO — Campus Gate Cafe (sample data)',
   'Demo entry for testing: coffee, sandwiches and wifi.',
   'cafe',
   'Demo address — campus road, Nagadenahalli',
   'Doddaballapura', 'GITAM campus (demo)',
   13.1805, 77.4992,
   4.3, '₹₹', '08:00-22:00', '+91 00000 00001', null,
   false, false, true, 'unverified', '{demo}'),

  ('DEMO — Nagadenahalli Meals Hotel (sample data)',
   'Demo entry for testing: unlimited thali-style meals hotel.',
   'hotel',
   'Demo address — Nagadenahalli main road',
   'Doddaballapura', 'Nagadenahalli (demo)',
   13.2105, 77.5198,
   4.2, '₹', '11:00-22:00', '+91 00000 00002', null,
   false, true, true, 'unverified', '{demo}'),

  ('DEMO — Highway Bakery & Sweets (sample data)',
   'Demo entry for testing: puffs, cakes and festival sweets.',
   'bakery_sweets',
   'Demo address — Bengaluru–Doddaballapura road',
   'Doddaballapura', 'Corridor highway stretch (demo)',
   13.2388, 77.5271,
   4.4, '₹', '06:00-22:00', '+91 00000 00003', null,
   true, false, true, 'unverified', '{demo}'),

  ('DEMO — Corridor Fast Food (sample data)',
   'Demo entry for testing: burgers, fries and quick bites.',
   'fast_food',
   'Demo address — approach road, Doddaballapura',
   'Doddaballapura', 'Approach road (demo)',
   13.2562, 77.5379,
   4.1, '₹', '11:00-23:00', '+91 00000 00004', null,
   false, false, true, 'unverified', '{demo}'),

  ('DEMO — Station Road Street Food (sample data)',
   'Demo entry for testing: evening chaat and pav bhaji carts.',
   'street_food',
   'Demo address — station road, Doddaballapura',
   'Doddaballapura', 'Doddaballapura Railway Station (demo)',
   13.2772, 77.5488,
   4.6, '₹', '16:00-22:00', '+91 00000 00005', null,
   false, true, true, 'unverified', '{demo}'),

  ('DEMO — Doddaballapura Family Restaurant (sample data)',
   'Demo entry for testing: sit-down family restaurant in town.',
   'restaurant',
   'Demo address — town centre, Doddaballapura',
   'Doddaballapura', 'Doddaballapura town (demo)',
   13.2966, 77.5402,
   4.0, '₹₹', '11:00-23:00', '+91 00000 00006', null,
   false, true, false, 'unverified', '{demo}');

-- ---------------------------------------------------------------------------
-- Two dishes per demo place (linked by name prefix)
-- ---------------------------------------------------------------------------
insert into public.dishes (restaurant_id, name, description, price, category, calories, protein, carbs, fat, is_signature)
select r.id, d.name, d.description, d.price, d.category, d.calories, d.protein, d.carbs, d.fat, d.is_signature
from public.restaurants r
join (values
  ('DEMO — Corridor Tiffin Room (sample data)',
   'Ghee Roast Dosa',  'Paper-thin dosa roasted in pure ghee', 90,  'Tiffin',   410, 8, 58, 15, true),
  ('DEMO — Corridor Tiffin Room (sample data)',
   'Idli–Vada Plate',  'Two steamed idlis, one medu vada, sambar', 60, 'Tiffin', 320, 7, 52, 9, false),

  ('DEMO — Campus Gate Cafe (sample data)',
   'Cold Coffee',      'Chilled blended coffee, whipped top',  120, 'Coffee',   220, 4, 28, 8, true),
  ('DEMO — Campus Gate Cafe (sample data)',
   'Veg Grilled Sandwich', 'Triple-layer grill with mint chutney', 140, 'Snacks', 380, 9, 48, 14, false),

  ('DEMO — Nagadenahalli Meals Hotel (sample data)',
   'Unlimited Meals Thali', 'Rice, sambar, rasam, poriyal, papad', 120, 'Meals', 850, 20, 130, 25, true),
  ('DEMO — Nagadenahalli Meals Hotel (sample data)',
   'Curd Rice',        'Comfort rice with fresh curd, pickle', 60,  'Meals',    350, 8, 60, 8, false),

  ('DEMO — Highway Bakery & Sweets (sample data)',
   'Veg Puff',         'Flaky pastry, spiced veg filling',     25,  'Bakery',   280, 5, 30, 15, false),
  ('DEMO — Highway Bakery & Sweets (sample data)',
   'Mysore Pak',       'Ghee-rich gram-flour sweet',           40,  'Sweets',   320, 4, 38, 18, true),

  ('DEMO — Corridor Fast Food (sample data)',
   'Veg Burger',       'Crispy patty, house sauce',            80,  'Burgers',  420, 10, 52, 18, false),
  ('DEMO — Corridor Fast Food (sample data)',
   'Peri-Peri Fries',  'Fries tossed in peri-peri spice',      90,  'Sides',    380, 5, 48, 19, true),

  ('DEMO — Station Road Street Food (sample data)',
   'Masala Puri',      'Crushed puris, peas, chaat masala',    40,  'Chaat',    300, 7, 45, 11, false),
  ('DEMO — Station Road Street Food (sample data)',
   'Pav Bhaji',        'Buttery buns, spiced veg mash',        70,  'Chaat',    520, 12, 68, 22, true),

  ('DEMO — Doddaballapura Family Restaurant (sample data)',
   'Paneer Butter Masala', 'Cottage cheese in tomato-butter gravy', 220, 'Mains', 620, 18, 40, 42, false),
  ('DEMO — Doddaballapura Family Restaurant (sample data)',
   'Family Feast Combo',   'Thali + starters + dessert for four',  850, 'Combos', 2400, 60, 300, 110, true)
) as d(restaurant_name, name, description, price, category, calories, protein, carbs, fat, is_signature)
  on r.name = d.restaurant_name;

-- ---------------------------------------------------------------------------
-- One demo review per place (user_id NULL — imported/legacy reviews)
-- ---------------------------------------------------------------------------
insert into public.reviews (restaurant_id, user_id, rating, review)
select r.id, null, 5,
  'Demo review — placeholder text so the reviews table can be exercised end-to-end.'
from public.restaurants r
where r.name like 'DEMO — %';

-- ---------------------------------------------------------------------------
-- One demo photo per place (stock placeholder — no real business imagery)
-- ---------------------------------------------------------------------------
insert into public.restaurant_photos (restaurant_id, image_url, uploaded_by)
select r.id, 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=70', null
from public.restaurants r
where r.name like 'DEMO — %';
