-- ===========================================================================
-- verify-batch-012-tptm-master.sql — READ-ONLY state probe (PRE/POST review aid)
-- ===========================================================================
select 'restaurants_tptm' as what, count(*) as n from public.restaurants where source = 'tptm-master-import'
union all
select 'places_tptm', count(*) from public.places where source = 'tptm-master-import'
union all
select 'places_tptm_unverified', count(*) from public.places where source = 'tptm-master-import' and verification_status = 'unverified'
union all
select 'places_tptm_with_coords', count(*) from public.places where source = 'tptm-master-import' and latitude is not null
union all
select 'batch011_present', count(*) from public.places where id in (596b875e-23d5-5458-95e6-1e60e9b0f2af, 2b7ae75d-18d3-53b8-99d7-7db09267c860, 53f276b4-549f-5f06-ad7d-fd7e20bf5e4e, 4da554ae-e148-5498-b3b7-3aa45f0835d1, 27c6e70b-673e-5c80-a3cf-4e8f530098d8, 74b454ed-cb0a-5cd9-9510-1ef251de5a8a, 9cbbed7e-b526-5167-ba53-30214cfe3c44, 550f0ee2-d898-5f44-9897-9fd72310d77f, 065ed977-26c1-5fa7-814a-b299f52672a1, f0034b71-18fd-51cc-be00-b26dc17cec72, 7ca7b062-f601-55a9-832f-f3355aa8a80d, 632a8627-baca-5d32-ab42-cf7328af8da1, 23e44a85-1086-58df-8a58-928830569f04, 7f2c91c5-35c7-57d8-9d7a-833b033a4ef1, 544ffb45-63d2-582b-8272-155f032b4901, 7a69de5b-7744-5fa6-b972-f3a7ebb4f0fb);
