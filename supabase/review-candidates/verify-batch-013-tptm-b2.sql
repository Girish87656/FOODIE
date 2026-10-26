-- ===========================================================================
-- verify-batch-013-tptm-b2.sql — READ-ONLY state probe (PRE/POST review aid)
-- ===========================================================================
select 'restaurants_b13' as what, count(*) as n from public.restaurants where source = 'tptm-master-b13'
union all
select 'places_b13', count(*) from public.places where source = 'tptm-master-b13'
union all
select 'places_b13_unverified', count(*) from public.places where source = 'tptm-master-b13' and verification_status = 'unverified'
union all
select 'places_b13_with_coords', count(*) from public.places where source = 'tptm-master-b13' and latitude is not null
union all
select 'batch012_present', count(*) from public.places where id in (3b5ab7fd-e6a4-5328-bb98-81dbc955ebe3, 24c42e4e-f84e-5cb8-8bad-35c27654a8d7, de43137e-e375-5c29-88ac-05cc54b8a0d5, 955af3d5-9aca-592e-b1f1-74848dc180d3, 9079e097-f201-55dc-9c74-77dd0c64de99, 6606469d-406f-59f5-b98e-c791f38807c0, 362c2008-7a12-5a5d-b68d-c7864abce88a, ac29dd19-b9c2-5dc2-8a44-60e33f458753, af36446d-155d-5fa7-abe2-69423c80516d, 93a5b657-59fb-5c6e-80e0-3c1be5b5767a, 49c4358d-8cee-5322-8825-23b9cf2bdffe, ed9f1376-0a45-5227-a090-feadaa13d344, f348325b-2589-52d2-a2c6-1e9bca7652db, f7c6fcef-f91c-571a-a1b8-5de864d08c91, 2d5f77bd-7860-5bbb-aa0d-a2b769f5d1a2, 7681bf92-6967-587a-971a-9c4afb63310b, 1a70ae24-251e-5d09-8b44-85a820b7bc5e, 718859f3-f741-50a4-90a0-afdf4d714d4c, 30b45f8b-a352-50be-8afa-2bf1fc333a50, 0424d840-6918-5fb1-bc57-8aee3aeefd50, 3049a946-ea45-59a0-8bd4-e00a136c26e2, 0f18f6d3-8b3d-5787-b051-00f132144d97, 83ba0664-53cb-50e1-9591-2df76373206e, 6fdd559e-d088-579e-afa8-c294542b8eef, 00f66db6-afd8-56c8-bc0b-102837b44f2d, 6d9a1af1-f72c-5d59-8f30-cf725b861fde, b8c8f500-d943-5b8c-86b7-701506a13409, 1129d06d-5d26-5df0-ad38-46ded3ad92f7, faee526f-6058-5b58-b6b4-f9b4f88e5ecd)
union all
select 'batch011_present', count(*) from public.places where id in (596b875e-23d5-5458-95e6-1e60e9b0f2af, 2b7ae75d-18d3-53b8-99d7-7db09267c860, 53f276b4-549f-5f06-ad7d-fd7e20bf5e4e, 4da554ae-e148-5498-b3b7-3aa45f0835d1, 27c6e70b-673e-5c80-a3cf-4e8f530098d8, 74b454ed-cb0a-5cd9-9510-1ef251de5a8a, 9cbbed7e-b526-5167-ba53-30214cfe3c44, 550f0ee2-d898-5f44-9897-9fd72310d77f, 065ed977-26c1-5fa7-814a-b299f52672a1, f0034b71-18fd-51cc-be00-b26dc17cec72, 7ca7b062-f601-55a9-832f-f3355aa8a80d, 632a8627-baca-5d32-ab42-cf7328af8da1, 23e44a85-1086-58df-8a58-928830569f04, 7f2c91c5-35c7-57d8-9d7a-833b033a4ef1, 544ffb45-63d2-582b-8272-155f032b4901, 7a69de5b-7744-5fa6-b972-f3a7ebb4f0fb);
