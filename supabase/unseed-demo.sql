-- ============================================================================
-- Remove ALL demo data inserted by supabase/seed-demo.sql.
-- Real restaurants you added are untouched (they never carry the DEMO prefix).
-- Run in Supabase Dashboard -> SQL Editor.
-- ============================================================================

delete from public.dishes
where restaurant_id in (select id from public.restaurants where name like 'DEMO — %');

delete from public.reviews
where restaurant_id in (select id from public.restaurants where name like 'DEMO — %');

delete from public.restaurant_photos
where restaurant_id in (select id from public.restaurants where name like 'DEMO — %');

delete from public.restaurants where name like 'DEMO — %';
