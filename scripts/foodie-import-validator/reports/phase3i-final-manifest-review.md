# Foodie — Phase 3I Final Import Review (Prototype 2 release package)

**Date:** 2026-10-09 (final QA run) · **Purpose:** the FINAL, verification-complete review of the Phase 3H proposed-import set, prepared for the Prototype 2 release. **Nothing has been imported; the companion SQL has never been executed; zero live-database writes occurred in this run.**

**Supersedes:** `phase3h-preimport-review.md` (approval checklist form) — this document closes that checklist with fresh read-only evidence and converts the reviewed set into a prepared (not executed) SQL artifact.

---

## 1. What this run did (verification-first)

| Step | Result |
| --- | --- |
| Live read-only schema check (PostgREST, anon key, GET only) | `restaurants` 14 rows with all migration-005 columns live (`verification_status`, `source`, `source_url`, `last_verified_at`, `address_verified`, `coordinates_verified`, `hours_verified`, `photos_verified`, `review_count`, `community_rating`); `destinations` 3 rows; `destination_foods` 5 rows; `reviews` + `dishes` tables exist, 0 rows. **Migration-005 and the destination migrations ARE APPLIED — nothing to rerun.** |
| Live honesty spot-check | All 14 live rows: `verification_status='unverified'`, all four `*_verified` NULL, `review_count=0`, `community_rating` NULL. Honest pre-import state; nothing was over-claimed. |
| Fresh baseline snapshot | 14 rows, single GET, zero writes; names identical to every prior snapshot. |
| Validator dry-run vs LIVE baseline (`research-2026-10-09-final-qa`) | **35 / 0 / 9 / 1 / 0 buckets · 16 candidate coordinates · 0 errors · 0 warnings · 0 existing-record matches.** |
| Validator idempotency | Two identical runs → **byte-identical report** (sha256 `5519b2c0…`). |
| Fixtures | 6/6 PASS (valid, duplicates, forbidden-fields, malformed, missing-fields, research-fields). |
| Zero-write proof | **PASS** — capture server sees `GET` only, no write verbs. |
| Per-row re-verification of the 14 proposed rows | Every row re-validated as importable: no name/phone/coordinate collision against the 14 live rows or inside the set (mechanical check + validator agreement). |

**Caveat kept honest:** a successful validator run is NOT proof that a business is real, active or correctly located. It only proves the worksheet is internally consistent and distinct from the live 14. Field verification (call / on-site GPS) remains the only path to `verified`.

---

## 2. Final decision on the 14 rows

**All 14 remain in the proposed insert set — none demoted, none newly excluded.** The fresh live re-check produced zero new conflicts. Three rows carry documented **proximity advisories** that are cross-directory pin artifacts, not identity matches (the paired rows are held and are NOT being imported):

| Row | Candidate | Category | Phone | Ext. rating (source · date) | Coordinates | Advisory |
| ---: | --- | --- | --- | --- | ---: | --- |
| 2 | The Shri Cafe and Restaurant | restaurant | +919844929931 | 4.5/17 (JD · 2026-10-09) | none | — |
| 4 | Epicurus Multi Cuisine Restaurant | restaurant | +919035972563 | none captured → 0 | directory pin (district JSON-LD) | — |
| 8 | Lotus Gardenia | restaurant | — | 4.0/2410 (JD · 2026-10-09) | none | — |
| 12 | Best Choice Bakery | bakery_sweets | +919980213680 | 4.0/386 (magicpin · 2026-10-09) | none | — |
| 14 | Rainbow Huts Family Restaurant | restaurant | +918951368020 | 4.6/49 (magicpin · 2026-10-09) | none | — |
| 15 | Hotel Bindushree Family Restaurant | restaurant | — | 4.2/5 (magicpin · 2026-10-09) | plus-code decode pin | **15↔32 ~90 m** (station cluster; distinct names/categories/phones) |
| 17 | Sri Vinayaka Food Point | restaurant | +918197052687 | 4.1/4731 (magicpin · 2026-10-09) | directory pin (district JSON-LD) | vs row 20 (HELD, not imported) |
| 23 | Kiran Tiffin Room | tiffin | +919663965135 | 4.8/78 (RG · 2026-10-09) | none | — (3F Hold A resolved: distinct) |
| 32 | Abhis Food Court | fast_food | +916361695837 | 4.9/1 (magicpin · 2026-10-10) | directory pin (district + magicpin JSON-LD agree) | **15↔32 ~90 m** (as above) |
| 33 | Burger Time | fast_food | +918553717034 | 3.9/6 (district · 2026-10-10) | directory pin (district JSON-LD) | — |
| 34 | Bbq Junction | restaurant | +919945071428 | 4.7/14 (magicpin · 2026-10-10) | directory pin (magicpin JSON-LD) | — |
| 35 | Rajashree Veg And Non-Veg Family Restaurant | restaurant | +919030376363 | none captured → 0 (district 0.0 no-review default) | directory pin (district JSON-LD) | — |
| 36 | Maha Naati Ruchi | restaurant | +918095788474 | 4.2/546 (JD · 2026-10-10) | directory pin (district JSON-LD) | — |
| 37 | Palav Ramu Hotel | restaurant | — | 3.9/97 (Google aggregate as displayed by RG · 2026-10-10) | none (plus code recorded as string, never converted) | — |

Every rating above is an **external directory rating** with source URL + check date — strictly separate from Foodie community reviews (none exist anywhere; the aggregates are trigger-maintained and the import never touches them).

### Why the 15↔32 advisory does not block the import
Hotel Bindushree Family Restaurant (magicpin *Hotel* listing, 4.2/5, plus-code-decoded pin, no phone) and Abhis Food Court (magicpin *verified* listing + district JSON-LD, 4.9/1, verified phone +916361695837, two independent JSON-LD pins agreeing) are different names, categories and listing families ~90 m apart on the station corridor, where eateries legitimately cluster. On-site GPS is still the decisive check — which is why **neither row's coordinates are marked verified**, and the SQL postflight re-surfaces any close pairs for eyeballing.

---

## 3. Everything that is NOT being imported (31 worksheet rows)

Per the Phase 3H counts (unchanged by this run — see `phase3h-preimport-review.md` §1 and `phase3h-proposed-import-manifest.json` → `excluded_reference` for per-row reasons):

- **4 possible-duplicate holds** — GITAM Cafe (row 1, campus-edge check pending), Vaibhava Sweets & Chats (row 9, spelling family), Hotel Krishnamoorthy (row 20, alias claim vs Ayyappa), Ganesh Darshan & Chats (row 21, plus-code/placement conflict), plus the Mantralaya pair (rows 6/24, JD-only listings) and Lakshmi Biriyani Point (row 22, conflicting open/closed signals) held as needs-research.
- **20 needs_more_research**, including **3 explicit do_not_import recommendations**: row 5 (Biryani Cafe — no identity), row 10 (Appu Chats — out of zone), row 45 (Lounge de La Réserve — out of zone).
- Discovery leads (Zen Cafe, Rajputana, Ananya Vana, MR3519, Sri Matha Sagar, Sarangi Fine Dine, Darbar The Cafe, Nippat Masale Stall) remain recorded-but-unresearched observations.

---

## 4. The prepared (NOT executed) SQL import file

**File:** `supabase/insert-batch-003-phase3h-14.sql` — sha256 `018751a5b8f8883bf47c15a88fa4f8d00244637a680424970be40307d97222b8`, generated deterministically by `scripts/foodie-import-validator/gen-import-sql.ts` from `reports/phase3i-final-import-manifest.json` (same inputs → byte-identical output; re-run proven).

Properties:
- **Additive only** — INSERTs only; no UPDATE/DELETE/DDL; no existing row is touched.
- **Explicit column list** — `id, name, category, address, city, locality, latitude, longitude, rating, price_level, opening_hours, phone, tags, source, source_url, verification_status`. The verification booleans, `last_verified_at`, `review_count` and `community_rating` are **not in the column list** and therefore cannot be touched.
- **Every row `unverified`** — coordinates stay candidate (never promoted); missing values are NULL (4 rows have no coordinates, 2 rows carry rating-sentinel 0, phones/hours/price NULL where no evidence).
- **Idempotent** — fixed UUIDv5 ids + per-row `where not exists` guards on id / normalized name / phone; a full re-run is a no-op, a partial re-run inserts only the missing rows.
- **Preflight aborts** — row-count window (14→28), all 14 baseline names must still exist; any drift raises an exception and the transaction writes nothing.
- **Postflight reads** — final count; all 14 rows present exactly once with untouched aggregates and NULL verification state; global duplicate-name check (0 rows expected); untouched-aggregates check (0 rows expected); a ≤0.2 km proximity report for human eyeballing.
- **COMMIT at the end** of the single transaction; a commented EMERGENCY REVERT (delete-by-fixed-id) sits below it for the human.
- **Syntax-checked** — parses clean as 22 PostgreSQL statements + 1 plpgsql DO block (sqlglot, postgres dialect).
- **Never executed** — this pipeline performed zero writes; the file exists only so the approved import is a reviewed, re-runnable artifact.

---

## 5. What only the human can do next

1. **Approve or strike** any of the 14 rows (strike = delete that row's Part 1 block in the SQL before running).
2. **Execute** `supabase/insert-batch-003-phase3h-14.sql` manually in the Supabase SQL Editor (after approval) and read the postflight output before accepting.
3. Field verification queue (only path to `verified`): on-site GPS for the 8 coordinate rows (rows 4, 15, 17, 32, 33, 34, 35, 36), phone checks for the holds, open/closed call for Lakshmi Biriyani Point.

**Safety statement: no live Supabase writes or migrations occurred in this run; no secrets printed, committed or transmitted; nothing pushed or deployed.**
