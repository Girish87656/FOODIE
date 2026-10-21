# Photo storage — exact external setup (owner action required)

The "add a photo" feature is fully built on the app side
(`src/lib/foodie/data/photos.ts` + `src/components/foodie/PhotoUploader.tsx`,
mounted in the detail screen's Photos section). It cannot store anything in
this sandbox because **no Supabase credentials and no Storage bucket exist
here** — by design it then shows an honest "Photo uploads need Foodie's live
backend — demo mode can't store photos" note and never fakes an upload.

To make uploads work in your live project, do exactly this:

## 1. Create the bucket + storage RLS (one SQL run)

Open **Supabase Dashboard → SQL Editor**, paste the whole of
`supabase/migration-009-photo-storage.sql`, and Run (it is idempotent and
retry-safe). Then verify its read-only verification queries print:

- bucket row: `restaurant-photos`, `public = true`, `file_size_limit = 5242880`,
  mime types `image/jpeg, image/png, image/webp`
- exactly 2 policies for this bucket: `restaurant photos are readable by
  everyone` (SELECT) and `users can upload photos to their own folder`
  (INSERT to authenticated, first path segment = `auth.uid()`)
- one `places_probe` row — either `places rows: N` or `skipped:
  public.places not present yet (migration-008 not applied)`. The migration
  is ORDER-INDEPENDENT: it runs cleanly before, after, or without 008.

Alternatively create the bucket by hand in Dashboard → Storage, but you must
then add the same two storage.objects policies manually — the SQL file is the
reviewed path.

## 2. Ensure the publishable env vars exist at runtime

The browser client needs (names only — never service-role keys):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (or legacy `NEXT_PUBLIC_SUPABASE_ANON_KEY`)

Note: the local `.env` is truncated to `DATABASE_URL` on sandbox boot, so
uploads can never be exercised from here. Set these in your deployment
environment (Vercel project settings / your host).

## 3. That's it — the database side already exists

- `restaurant_photos` table + `uploaded_by = auth.uid()` INSERT RLS +
  public SELECT: already in `schema.sql` (live).
- licensing columns `source_url` / `license` / `attribution`:
  `migration-006` (live).
- The app resolves the uploader with `auth.getUser()` (server-validated
  token), uploads to `<auth.uid()>/<restaurantId>/…` inside the bucket, links
  the public URL, and inserts the row with `license = "user-upload"` and
  `attribution = "Foodie community photo"` — a truthful, non-fabricated
  credit. `source_url` stays NULL for user photos (no external source).

## What you will see before step 1 is done

The uploader renders fine, but any upload attempt fails with
**"Photo storage isn't set up on the server yet. Your photo was not
uploaded."** — the honest failure path. Nothing partial is written: the row
insert only happens after a successful storage transfer.

## Safety notes

- No service-role key is used or referenced anywhere in the app.
- The bucket config IS the server-side boundary: Supabase Storage rejects
  anything over 5 MB or outside `image/jpeg, image/png, image/webp` regardless
  of what the browser claims (the app additionally sniffs real magic bytes
  client-side, so mislabeled non-images never even reach the server).
- Photos are immutable for users: no UPDATE/DELETE policy is created; cleanup
  is a curator action. If a transfer succeeds but the `restaurant_photos`
  INSERT fails, the object stays as an unreferenced orphan — the app reports
  failure and never fakes success; curators can find orphans as objects whose
  key is not referenced by any `restaurant_photos.image_url`.
- Removing the bucket later is covered by the commented rollback section in
  `migration-009-photo-storage.sql` (including its data-loss warnings).
