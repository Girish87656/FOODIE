# Foodie × Supabase — Setup Guide

This folder contains everything needed to move Foodie from the labelled
**DEMO DATA** mode to a **real restaurant database**.

```
supabase/
├── schema.sql                       # tables, FKs, indexes, RLS, nearby_restaurants()
├── migration-001-pilot-categories.sql # ⬅ run this on EXISTING projects (7 pilot categories + trust fields)
├── seed-demo.sql                    # ⚠️ optional demo rows (all prefixed "DEMO —")
└── unseed-demo.sql                  # removes every demo row, keeps real data
```

> **Existing project?** Your tables were already created from the original
> schema. Run **`migration-001-pilot-categories.sql`** in the SQL Editor to
> move to the 7 pilot categories + `student_friendly` / `verification_status`
> / `tags` / `locality` columns. It is idempotent, deletes nothing and inserts
> nothing.

---

## 1. Create the Supabase project

1. Go to <https://supabase.com/dashboard> → **New project** (the free tier is enough).
2. Pick a name (e.g. `foodie`), a region close to your users, and a database password.
3. Wait for provisioning (~2 minutes).

## 2. Run the SQL schema

1. Open the project → **SQL Editor** → **New query**.
2. Paste the whole contents of **`supabase/schema.sql`** → **Run**.
3. You should get: tables `restaurants`, `dishes`, `reviews`,
   `restaurant_photos`, their foreign keys + indexes, Row Level Security
   policies, and the `nearby_restaurants(lat, lng, radius_km)` function.

The script is idempotent — re-running it is safe.

## 3. Where to put the URL and anon key

1. Dashboard → **Project Settings → API**.
2. Copy **Project URL** and the **anon public** key.
3. Put them in `.env` (or `.env.local`) at the project root — **never in source code**:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
```

4. Restart `bun run dev`.

That's it — Foodie detects the credentials automatically and switches from
DEMO mode to your database. **Leave both values empty** to stay in demo mode.

> ⚠️ Only ever use the **anon** key in `NEXT_PUBLIC_*` variables. The
> service-role key bypasses Row Level Security and must never ship to the
> browser. Foodie reads go through RLS-governed anon queries (`public` can
> read; writes require authentication — see schema.sql §5).

## 4. (Optional) Test with the labelled demo rows

Run **`supabase/seed-demo.sql`** in the SQL Editor. It inserts 5 restaurants
whose names all start with **`DEMO —`** (plus dishes, one review and a photo
each), so they can't be mistaken for real businesses. Remove them any time
with **`supabase/unseed-demo.sql`** — real restaurants are untouched.

## 5. Add the first REAL restaurant

**Option A — Table Editor (no SQL):**

1. Dashboard → **Table Editor** → `restaurants` → **Insert row**.
2. Fill in:
   - `name` — the real business name (don't use the `DEMO —` prefix)
   - `description` — one line shown as the place tagline
   - `category` — one of the **7 pilot place categories**:
     `restaurant`, `hotel` (local meals place), `tiffin` (breakfast/idli-dosa
     rooms), `cafe`, `fast_food`, `street_food`, `bakery_sweets`.
     Finer types (tea_stall, food_truck, canteen, home_food, ...) are NOT
     categories — put them in `tags` (e.g. `{tea_stall}`).
   - `address`, `city` (`Doddaballapura` for the pilot corridor)
   - `locality` — corridor area label: `GITAM campus`, `Nagadenahalli`,
     `Doddaballapura Railway Station`, `Doddaballapura town`
   - `latitude`, `longitude` — WGS-84 degrees (Google Maps: right-click the
     spot → the first number is latitude, second is longitude)
   - `rating` — 0–5, `price_level` — `₹`, `₹₹` or `₹₹₹`
   - `opening_hours` — `'HH:MM-HH:MM'` 24h, e.g. `'07:00-22:00'`
   - `student_friendly` — true for student-suited places
   - `verification_status` — `verified` (team-checked) | `community_submitted`
     (user-added, pending) | `unverified` (imported/unknown) | `closed`
     (permanently shut — kept in the DB but hidden from discovery)
   - `is_hidden_gem`, `is_local_favorite` as needed
3. Copy the new row's `id` and add dishes in the `dishes` table
   (`restaurant_id` = that id; `is_signature = true` → "Signature dishes",
   `false` → "Famous dishes") and photos in `restaurant_photos` (`image_url`).

**Option B — SQL:**

```sql
insert into public.restaurants
  (name, description, category, address, city, locality, latitude, longitude,
   rating, price_level, opening_hours, phone, website,
   is_hidden_gem, is_local_favorite, student_friendly, verification_status)
values
  ('Real Restaurant Name', 'One-line description', 'tiffin',
   'Real address, Nagadenahalli', 'Doddaballapura', 'GITAM campus',
   13.1820, 77.5015,                      -- ← real coordinates from Maps
   4.6, '₹', '07:00-22:00', '+91 98765 43210', 'https://example.com',
   false, true, true, 'unverified')
returning id;                             -- ← copy this id for dishes/photos

insert into public.dishes (restaurant_id, name, description, price, category, is_signature)
values
  ('<id-from-above>', 'Masala Dosa', 'Crispy crepe, potato filling', 70, 'Classic', false),
  ('<id-from-above>', 'Ghee Roast Dosa', 'Paper-thin, pure ghee', 110, 'Classic', true);

insert into public.restaurant_photos (restaurant_id, image_url)
values ('<id-from-above>', 'https://…/photo.jpg');
```

The restaurant appears in Foodie's Home feed immediately — no redeploy
needed. Nearby order and distance come from its stored coordinates.

## 6. How the nearby search works

```
Browser Geolocation API (real GPS fix, see src/lib/foodie/location.ts)
        │  real latitude / longitude — no hardcoded city coords
        ▼
useLocationStore.origin  →  useRestaurantFeed(origin)
        │  getNearbyRestaurants(origin.lat, origin.lng, radiusKm)
        ▼
GET /api/restaurants/nearby?lat=…&lng=…&radiusKm=…
        │
        ▼
serverRepository.loadNearbyRestaurants()
        ├── Supabase configured → supabaseBackend.getNearbySupabaseRestaurants()
        │       1. try  nearby_restaurants RPC  → distance math IN Postgres
        │          (Haversine in SQL; upgradeable to PostGIS ST_DWithin later)
        │       2. fallback: indexed bounding-box pre-filter
        │          (latitude/longitude columns) + Haversine in Node
        └── not configured / query failed → demoBackend (labelled demo data)
        ▼
Response: { mode: "supabase" | "demo", places: [ { …restaurant, distanceKm } ], notice? }
        ▼
Home screen: distance chips (1/3/5/10 km), "Nearest First" sort, cards show
"X.X km away" — all recomputed from each restaurant's stored coordinates.
```

Key points:

- The **database rows' `latitude`/`longitude` are the source of truth** — the
  same columns you fill in the Table Editor drive both the radius filter and
  the displayed distances.
- The `nearby_restaurants` RPC (schema.sql §6) already does the filtering and
  ordering **inside Postgres**; the Node-side Haversine is kept as a fallback
  so the app works even if only the tables were created.
- The PostGIS upgrade path (schema.sql §7) scales to millions of rows with a
  GiST index — no app-code changes required.

## 7. Data-access layer map

| File | Role |
| --- | --- |
| `src/lib/foodie/data/repository.ts` | **The only API the UI uses**: `getNearbyRestaurants`, `getRestaurantById`, `getRestaurantsByCategory`, `searchRestaurants` |
| `src/lib/foodie/data/useRestaurantFeed.ts` | React hook wrapping the nearby query with loading / error / ready states |
| `src/lib/foodie/data/serverRepository.ts` | API-route dispatcher: picks Supabase vs demo, adds honest notices |
| `src/lib/foodie/data/supabaseBackend.ts` | Real queries via `@supabase/supabase-js` (RPC + fallback) |
| `src/lib/foodie/data/demoBackend.ts` | Labelled demo fallback (uses `src/data/places.ts`) |
| `src/lib/foodie/data/mappers.ts` | DB rows → domain types (the one file to touch if the schema evolves) |
| `src/lib/foodie/data/types.ts` | Row shapes mirroring schema.sql + API response types |
| `src/lib/supabase/config.ts` | Env-var validation (`NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`) |
| `src/lib/supabase/server.ts` | Shared Supabase client for API routes |

## 8. Migration order — fresh projects AND existing ones

Run files in the SQL Editor **in this exact order** (every file is
idempotent; nothing deletes data). The numbered `migration-*` files build on
each other; the `insert-batch-*` files are curated DATA (each has a review
report in `review-candidates/` where applicable).

| Step | File | Adds |
| --- | --- | --- |
| 1 | `schema.sql` | Base tables (`restaurants`, `dishes`, `reviews`, `restaurant_photos`), RLS, `nearby_restaurants()` |
| 2 | `migration-001-pilot-categories.sql` | 7 pilot categories + trust/verification columns |
| 3 | `migration-002-review-improvements.sql` | Review table hardening |
| 4 | `migration-003-destinations.sql` | `destinations` (public read-only RLS) |
| 5 | `migration-004-destination-food-places.sql` | `destination_foods` + evidence-gated links |
| 6 | `migration-005-verification-review-foundation.sql` | Provenance + community aggregates + rebuilt RPC |
| 7 | `migration-006-photo-licensing.sql` | Photo credit/licensing columns |
| 8 | `migration-007-dish-provenance.sql` | Dish `source_url` |
| 9 | `migration-008-places.sql` | **`public.places`** — NON-FOOD POIs (attractions + lodging), public read-only RLS |
| 10 | `migration-009-photo-storage.sql` | `restaurant-photos` storage bucket + storage RLS |
| 11 | `migration-010-push-subscriptions.sql` | `push_subscriptions` (own-rows-only RLS) |

Data batches (`insert-batch-001` … `insert-batch-009`, then the reviewed
candidates in `review-candidates/`) run after the migration they depend on —
e.g. Batch-011 (`review-candidates/insert-batch-011-p4-places.sql`) fills
`public.places` created by migration-008 and must be followed by
`review-candidates/verify-batch-011-p4-places.sql`: **Batch-011 counts as
imported only when that verification query returns the documented POST state
(16 rows, 0 missing, 0 violations)**. The app never assumes the import — a
missing table renders "not set up yet", an empty table renders an honest
"nothing recorded" state, and imported rows render with their true
`unverified` status.

Each migration also carries its own loud pre/post assertions that abort on
any structural mismatch — read its header before running.

## 9. What's intentionally NOT included

Payments, food delivery, AI recommendations, nutrition tracking (the
`dishes.calories/protein/carbs/fat` columns exist purely as future schema) and
creator intelligence — per the product roadmap.

## 10. Web Push notifications — owner manual steps

The push feature ships COMPLETE in code but is honestly **disabled**
(`configured: false` everywhere — the bell dialog says so) until ALL of the
following owner actions are done. Nothing in the app pretends otherwise, and
no notification is ever sent or subscribed before that.

### 10.1 Generate VAPID keys (one-time)

```bash
bunx web-push generate-vapid-keys
```

This prints a **Public Key** and a **Private Key**. Also pick a contact
subject — either `mailto:you@example.com` or `https://your-site.example`.

### 10.2 Set the three SERVER-ONLY environment variables

Add to `.env` / `.env.local` (and your production host's env settings):

```
PUSH_VAPID_PUBLIC_KEY=<Public Key from 10.1>
PUSH_VAPID_PRIVATE_KEY=<Private Key from 10.1>
PUSH_VAPID_SUBJECT=mailto:you@example.com
```

**Secrets rules (enforced by design, verified by audit):**
- The private key and subject are read ONLY by server code
  (`src/lib/foodie/pushServer.ts` → `/api/push/test`). They must NEVER be
  given a `NEXT_PUBLIC_` prefix, never logged, never committed.
- Only the PUBLIC key is served to browsers, by `GET /api/push/config` —
  that is its purpose in the Web Push standard.
- `.env*` is gitignored; only the empty `.env.example` template is tracked.

### 10.3 Approve and run `migration-010-push-subscriptions.sql`

Run it in the Supabase SQL Editor (step 11 of the migration order above).
It creates `public.push_subscriptions` with **own-rows-only RLS** (4 policies,
`user_id = auth.uid()`), the `(user_id, endpoint_hash)` UNIQUE constraint
(duplicate prevention) and loud post-assertions. The file header must still
read "NOT EXECUTED" until you run it — the app's dialog honestly says
"storage isn't set up" until the table exists.

### 10.4 Serve over HTTPS

Web push and service workers only exist in **secure contexts**. `localhost`
counts as secure during development; production must be HTTPS (the browser
check `pushSupport()` now reports this explicitly).

### 10.5 Verify end-to-end (real device, real browser)

1. Sign in, open the Home bell → the dialog must show "ready" (not
   "not-configured").
2. Click **Enable notifications** → accept the browser prompt → "on for this
   device".
3. Click **Send a test notification** → a real system notification appears
   ("Foodie notifications are on"), and the API response reports `sent: 1`.
4. Click **Turn off** → row removed + browser unsubscribed; a further test
   send must return 404.
5. Only after this succeeds should delivery be considered WORKING. Until
   then the feature state is honestly "configured in code, not yet verified".

### 10.6 Operational notes (already implemented in code)

- **Duplicate prevention** — one row per (user, browser) via the UNIQUE
  constraint; re-subscribing upserts instead of duplicating; payload `tag`
  collapses repeat notifications visually.
- **Retries** — exactly ONE automatic retry for transient push-service
  failures (429/500/502/503); terminal 4xx/410 are never retried.
- **Failure logging** — delivery failures are logged server-side as status
  codes only (subscription endpoints are per-browser tokens and are never
  logged).
- **Expired-subscription cleanup** — dead endpoints (push 404/410) are
  deleted by `/api/push/test` in the same pass; the SW's
  `pushsubscriptionchange` handler re-subscribes and hands the renewal to an
  open page for persistence (renewal without a signed-in open page is an
  honest no-op followed by the same 404/410 cleanup).
- **No unsolicited sends** — the only sender is `/api/push/test`, which is
  authenticated server-side and can only reach the CALLING user's own rows
  (RLS; no service role). New event sources would need their own review.
