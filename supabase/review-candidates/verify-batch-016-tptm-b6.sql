-- ===========================================================================
-- verify-batch-016-tptm-b6.sql — READ-ONLY state probe (PRE/POST review aid)
-- ===========================================================================
select 'restaurants_b16' as what, count(*) as n from public.restaurants where source = 'tptm-b16'
union all
select 'places_b16', count(*) from public.places where source = 'tptm-b16'
union all
select 'unverified_b16', (select count(*) from public.restaurants where source = 'tptm-b16' and verification_status = 'unverified')
        + (select count(*) from public.places where source = 'tptm-b16' and verification_status = 'unverified')
union all
select 'coords_b16_should_be_zero', (select count(*) from public.restaurants where source = 'tptm-b16' and latitude is not null)
        + (select count(*) from public.places where source = 'tptm-b16' and latitude is not null);
