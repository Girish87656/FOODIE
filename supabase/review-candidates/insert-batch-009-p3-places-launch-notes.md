# FOODIE — Prototype 3 Launch Notes (Batch-009 REV 2) — 2026-10-16

Status: **LAUNCH PREPARATION COMPLETE — IMPORT NOT EXECUTED (credential blocker).**
Production data verified untouched. No SQL executed against any live database.
No deployment action taken (none required — zero code changes; production build
already serves the data-driven app).

---

## 1. Phase 1 — artifact state (all verified)

- Branch `main`, HEAD `c96ec87`, working tree clean; unpushed commits `99e5952`
  and `c96ec87` (both benign platform auto-commits) left untouched — **not pushed**.
- Original SQL SHA-256 `79b892d9103320e7a232425e5a1ec295ee34d2cec9366c8cde174724a232b8ee` ✓
- Candidate SQL SHA-256 `c74e43399bd53eeaa3ab2aec59262c469f60f5809a83a9981271757d6e334629` ✓
  (matches the reviewed report), diff `11e30a9c…`, review report `7181eceaa…` ✓.

## 2. Phase 2 — validation on a real PostgreSQL engine (PGlite 18.6, safe local env)

Schema + migrations 001/003/004/005/006/007 + batch-002 ALTER all applied cleanly
on a Supabase-shaped local stub (auth schema/roles/uid() stubbed). Result **13/13 PASS**:

- POSITIVE (baseline 77 → candidate runs end-to-end): commits cleanly; post state
  86 total / 6 Tirupati / 80 Doddaballapura; all 9 rows carry every designed
  invariant (unverified, NULL lat/lng, rating 0, ₹₹, marker + source_url,
  verification timestamp/booleans NULL); destination description set to the exact
  proposed text; no held-out names present.
- Rerun after success aborts at preflight (86 ≠ 77), data intact.
- NEGATIVES (each aborts before any write): baseline drift (76); name collision;
  UUID collision; marker present; tirupati destination missing; destination inactive.

## 3. Phase 2b — LIVE read-only preflight (PostgREST GETs only; publishable key)

- Schema: all 21 referenced restaurants columns + all 5 destinations columns exist
  (incl. `source`, `source_url`, `last_verified_at`, `address_verified`,
  `coordinates_verified`, `hours_verified`, `photos_verified`).
- Restaurants total: **exactly 77** — the historical baseline still holds.
- City distribution: **Doddaballapura 77 / Tirupati 0** — per-city assumptions hold.
- Name collisions (9): **0**. UUID collisions (9): **0**.
- `p3-research-import` marker rows: **0**.
- Verification timestamp/boolean fields set on existing rows: **0**.
- Coordinates set on 64 existing rows (they keep their data; the 9 new rows are NULL).
- verification_status distribution: 77 × `unverified`.
- Destinations: `bengaluru`, `mumbai`, `tirupati`; exactly **1** `tirupati` row, **active**.
- **All five held records remain excluded live** (names + UUIDs absent):
  Lake Valley Resort and Spa, Tirumala Cake House, Lunchbox - Meals & Thalis,
  Desi Family Dhaba And Restaurant, Home's Kitchen.

## 4. Phase 3 — destination description decision (RECORDED, NOT APPLIED)

Current live description (verbatim, 106 chars):
> City in Andhra Pradesh, home to the renowned Tirumala Venkateswara Temple — a major Hindu pilgrimage site.

Assessment: generic placeholder; every fact it contains (Andhra Pradesh context;
Tirumala Venkateswara Temple) is fully restated in the proposed REV 2 text, which
additionally carries the district framing, the official TTD accommodation link
(tirumala.org, captured during discovery) and the honest "source-linked pilot"
disclosure. The live text contains no "verified-data pilot" phrase and no other
unique content. **Decision: the REV 2 proposed description is a safe replacement;
no REV 3 merge needed.** Nothing was written; the live description is unchanged.

## 5. Phase 4 — IMPORT BLOCKED (exact blocker)

**Blocker: this sandbox holds no write-capable Supabase credential.**
- `DATABASE_URL` in `.env` points to the local Prisma SQLite file (platform boot
  truncation; known recurring hazard) — not a Postgres connection.
- No service_role key, no Supabase access token, no psql, no management-API
  credentials anywhere in the environment or repo (checked; values never printed).
- Only the public-by-design client config (project ref + publishable key) could be
  recovered from the production bundle — REST **read** access only. Anon-key writes
  would bypass every SQL guard and violate RLS — a partially-safe alternative is
  explicitly forbidden by the launch rules, so none was attempted.

**Production state: unchanged and verified live (77 rows).** The import remains a
single guarded transaction away:

> Supabase Dashboard → SQL Editor → paste
> `supabase/review-candidates/insert-batch-009-p3-places-revised.sql`
> (the WHOLE file: begin → preflight → 9 inserts → destination update →
> postflight → commit) → Run. Any failed guard aborts with zero writes.
> Do NOT use the original `supabase/insert-batch-009-p3-places.sql`.

Alternatively, provide a direct Postgres connection string for this project and
the import can be executed and post-verified end-to-end by the assistant.

## 6. Phase 5 — application verification (local + production, real browser)

No application code changes were needed (the launch is data-driven), so nothing
was committed or deployed. Lint `exit 0`; `tsc --noEmit` clean (src + scripts).

Browser E2E (agent-browser, real clicks; new disclosed test account
`p3launch-check-20261016@foodie-test.dev` created via local dev — the same Supabase
project, so one `auth.users` row exists; no restaurant/destination data touched):

- Local (localhost:3000) — pre-import readiness:
  - Home renders live corridor rows; destination strip shows Bengaluru/Mumbai/Tirupati.
  - Tirupati chip → panel renders the LIVE description verbatim + Tirupati Laddu;
    destination screen shows "Places in Tirupati" with the honest empty state.
  - Search flow: "Shri Manjunatha" → "1 place"; detail shows "Unverified listing",
    "Location pending verification", name+address Google-Maps link (the exact
    rendering path of all 9 new NULL-coordinate rows), honest Menu/Photos/Reviews
    empty states.
  - Category filter contains "Hotel" and works ("2 places in Hotel").
- Production (foodie-arjun-123b.vercel.app):
  - Login works with the same account; home, destination strip, search
    ("Kouzina" → "0 places", honest), Hotel filter ("2 places in Hotel"),
    Tirupati destination screen (same live description + honest empty state).
  - Corridor regression intact: Abhis Food Court — Unverified chip, LISTING SOURCE,
    5 dishes ₹80/80/70/60/60, "Items & prices from published listing" provenance.
  - 0 page errors, 0 console errors for the whole session.
- Deployment: current production build already contains the prototype-3 UI; it is
  data-driven, so the 9 rows + description will appear there immediately after the
  import runs — **no redeploy required**.

## 7. Post-import verification checklist (ready to run)

Total 86 = 77 + 9; Tirupati 6; Doddaballapura 80; the 9 UUIDs present with all
invariants; marker rows = 9; description = proposed text; five held names still
absent; app shows "6 places in Tirupati" and the hotels under the Hotel filter.
