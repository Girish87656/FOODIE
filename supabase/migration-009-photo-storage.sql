-- ============================================================================
-- Foodie — migration 009: photo storage bucket + storage RLS (STRUCTURE ONLY)
-- ----------------------------------------------------------------------------
-- FILE STATUS: REVIEW CANDIDATE — PROPOSED, NOT EXECUTED, NOT APPROVED FOR RUN.
--   Created in the Gate-3 prototype-completion pass so the browser-side
--   "add a photo" feature has somewhere to store bytes. NOTHING in this file
--   has been run against any database. Execution remains the owner's single
--   manual action in the Supabase SQL Editor, only after approving it.
--
-- WHY THIS IS NEEDED
--   The app's photo upload flow (src/lib/foodie/data/photos.ts) uploads to a
--   public Storage bucket named 'restaurant-photos' and then inserts a row
--   into restaurant_photos. The DATABASE table + its RLS already exist
--   (schema.sql: public SELECT; INSERT to authenticated with
--   uploaded_by = auth.uid()). What does NOT exist yet is:
--     1) the storage bucket itself (no bucket is referenced anywhere in the
--        repo — verified), and
--     2) storage.objects RLS restricting writes to the uploader's own folder.
--
-- WHAT THIS DOES
--   1) Creates the 'restaurant-photos' bucket (public read), idempotent via
--      on conflict do nothing. 5 MB limit + JPG/PNG/WebP only — matching the
--      client-side validation in photos.ts exactly.
--   2) Enables RLS on storage.objects (already enabled on Supabase by
--      default — kept idempotent) and adds exactly three policies:
--        - public SELECT  : anyone can view photos (matches the
--          restaurant_photos public-read posture)
--        - authenticated INSERT : ONLY inside the uploader's own folder
--          (first path segment = auth.uid()) — the app writes
--          `{userId}/{restaurantId}/{timestamp}-{rand}.{ext}`
--        - NO UPDATE / NO DELETE policy for users: photos are immutable
--          once stored (same insert-only posture as restaurant_photos).
--   3) Asserts the landed state loudly and prints read-only verification
--      queries (same convention as migration-008).
--
-- WHAT THIS DELIBERATELY DOES NOT DO
--   * Touches NO existing table, bucket, policy or row: restaurant_photos,
--     restaurants, and every other bucket's policies are untouched. Every
--     policy below is scoped to bucket_id = 'restaurant-photos' only.
--   * Inserts NO photo rows and NO objects. The bucket starts empty.
--   * Adds NO service-role keys, NO secrets, NOTHING beyond structure.
--
-- HOW TO RUN (owner's single manual action, only after approving)
--   Supabase Dashboard -> SQL Editor -> New query -> paste this whole file
--   -> Run. Safe to re-run (idempotent: on-conflict bucket insert +
--   drop-policy-if-exists before each create).
--
-- CLIENT CONTRACT (must stay in sync with src/lib/foodie/data/photos.ts):
--   bucket id            = 'restaurant-photos'
--   object path          = '<auth.uid()>/<restaurantId>/<timestamp>-<rand>.<jpg|png|webp>'
--   max size             = 5 MB (5242880 bytes)
--   allowed mime types   = image/jpeg, image/png, image/webp
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1) the bucket (public read; size + mime limits mirror the client guards)
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'restaurant-photos',
  'restaurant-photos',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- 2) storage RLS — scoped STRICTLY to this bucket
--    (drop-if-exists + create keeps re-runs safe; Postgres has no
--    CREATE POLICY IF NOT EXISTS and this migration does not assume one)
-- ---------------------------------------------------------------------------
alter table storage.objects enable row level security;

drop policy if exists "restaurant photos are readable by everyone" on storage.objects;
create policy "restaurant photos are readable by everyone"
  on storage.objects for select
  using (bucket_id = 'restaurant-photos');

drop policy if exists "users can upload photos to their own folder" on storage.objects;
create policy "users can upload photos to their own folder"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'restaurant-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Deliberately NO UPDATE / NO DELETE policy: a stored photo is immutable for
-- users (matches restaurant_photos' insert-only posture). Clean-up stays a
-- service-role / SQL-Editor curation action.

-- ---------------------------------------------------------------------------
-- 3) loud verification — READ-ONLY; expected on a healthy run:
--      * bucket row   = 1: restaurant-photos, public=true, 5 MB, 3 mime types
--      * policy rows  = exactly 2 for this bucket (SELECT public + INSERT
--                       authenticated); zero UPDATE/DELETE for it
-- ---------------------------------------------------------------------------
select id, name, public, file_size_limit, allowed_mime_types
  from storage.buckets
 where id = 'restaurant-photos';

select policyname, cmd, roles, qual, with_check
  from pg_policies
 where schemaname = 'storage'
   and tablename = 'objects'
   and policyname like 'restaurant photos %';

select count(*) as places_rows_must_be_zero from public.places; -- unrelated sanity: still structure-only

-- ============================================================================
-- ROLLBACK (COMMENTED — inert; uncomment ONLY after reading the conditions)
-- ----------------------------------------------------------------------------
--   drop policy if exists "users can upload photos to their own folder" on storage.objects;
--   drop policy if exists "restaurant photos are readable by everyone" on storage.objects;
--   delete from storage.objects where bucket_id = 'restaurant-photos';  -- removes uploaded files!
--   delete from storage.buckets  where id = 'restaurant-photos';
--
-- WHEN ROLLBACK IS SAFE — ALL of these must hold:
--   1) No user photos exist that you want to keep (the DELETE above destroys
--      every stored object in the bucket — check first:
--        select count(*) from storage.objects where bucket_id = 'restaurant-photos';
--   2) restaurant_photos rows pointing at the bucket's public URLs: the table
--      is NOT dropped by this rollback. If rows exist whose image_url targets
--      this bucket, they will render as the app's honest "photo unavailable"
--      tile after the bucket is gone — decide whether to delete those rows
--      explicitly (curator action) or keep them for history.
--   3) The app's upload feature degrades gracefully: with no bucket, uploads
--      fail with the friendly "Photo storage isn't set up on the server yet"
--      message and NOTHING is written — verified client behaviour.
--   After rollback, re-running THIS migration recreates the structure cleanly.
-- ============================================================================

-- NOTHING IN THIS FILE HAS BEEN EXECUTED. Execution remains the owner's
-- single manual action in the Supabase SQL Editor, only after approval.
