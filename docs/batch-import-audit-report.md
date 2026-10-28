# FOODIE — Import Batch Audit Report (batches 011–017)

Audit date: 2026-10-28. Auditor: batch-7 session (automated + manual review).
Scope: every pending review-candidate SQL file, validated against the current
schema, current production state, and each other, in dependency order.

## Executive summary

| Batch | File | Rows (r / p) | sha256 (first 16) | Verdict |
| --- | --- | --- | --- | --- |
| 011 | insert-batch-011-p4-places.sql | 33 / — | `88681545565fdbb5` | PASS (guards pre-date the defect; id lists quoted with `::uuid`) |
| 012 | insert-batch-012-tptm-master.sql | 10 / 19 | `792fd3bbc7dbf267` | PASS after quoting fix (was `110b95a5…`) |
| 013 | insert-batch-013-tptm-b2.sql | 17 / 40 | `466b194959d842b4` | PASS after quoting fix (was `7a41e8a6…`); frozen drift-guard row preserved |
| 014 | insert-batch-014-tptm-b3.sql | 22 / 5 | `9010aa6247781ac6` | PASS after quoting fix (was `0d0c4043…`) |
| 015 | insert-batch-015-tptm-b5.sql | 40 / 19 | `91cf27a7bf28c41e` | PASS after quoting fix (was `c265ab4b…` — regenerated twice this session; see note) |
| 016 | insert-batch-016-tptm-b6.sql | 8 / 10 | `4e034304c1bf7b52` | PASS after quoting fix (was `2f54a9a3…`) |
| 017 | insert-batch-017-tptm-b7.sql | 53 / 29 | `bff810cd58d02ac5` | PASS (generated this session with the fix from the start) |

Totals: **245 candidate rows** (153 restaurants + 92 places), all
INSERT-only, all `verification_status='unverified'`, coordinates NULL on
every row except batch-013's single evidenced National Park row.

## Critical defect found and fixed (would have blocked execution)

Every tptm batch 012–016 as previously committed interpolated its preflight
self-id and cross-batch id lists as **bare (unquoted) UUID literals**:

```sql
select count(*) into v_dup_ids from public.places where id in (6ddf2ee3-f8e4-…, …);
```

Postgres parses `6ddf2ee3-f8e4-…` as identifier/arithmetic garbage → **syntax
error at the first preflight statement**. Because each file runs inside
`begin; … commit;`, the failure mode was safe (aborts before any INSERT) but
meant **no batch could ever execute**. Fixed in all five generators, all six
batches regenerated; the complete diff vs the previously committed files is
exactly the quoting lines (zero tuple/data changes). A permanent regression
test now rejects any unquoted UUID inside `id in (…)` across every
review-candidate file. Batch-011 pre-dates the defect (its lists are quoted
`::uuid` literals).

## Per-batch checks performed (each batch)

1. **Schema conformance** — columns match `public.restaurants` /
   `public.places` as created by `supabase/migration-008-places.sql`
   (verified live: both tables exist in production; `places` has 0 rows).
   `category` values ⊆ CHECK union (restaurant/hotel/tiffin/cafe/fast_food/
   street_food/bakery_sweets); `place_type` values ⊆ CHECK union
   (temple/waterfall/fort/zoo/natural_arch/other/hotel).
2. **INSERT-only** — no UPDATE/DELETE/TRUNCATE/DROP/ALTER statements
   (regex gates + manual review); user-generated content untouched by
   construction.
3. **Idempotence** — marker-based (`source = 'tptm-bXX'`); preflight aborts
   on any marker row (partial apply = drift); rerun after full apply is a
   no-op by marker counts; mid-state aborts.
4. **Collision guards** — generation-time id/slug/name checks against all
   frozen batches 011–016 and the curated worksheet; execution-time
   preflight id/slug/restaurant-name checks against the live database.
5. **Coherence guards** — batches 011–016 each fully-absent-or-fully-applied
   (never partial); exactly one ACTIVE tirupati destination.
6. **Honesty** — every row `verification_status='unverified'`; the four
   verification fields NULL; source_url mandatory; description/price/hours/
   phone NULL (never invented); postflight enforces all of it.
7. **Provenance** — every row carries its listing/source URL; tags only
   where the source evidences them.
8. **Determinism** — two consecutive full-family regenerations byte-identical
   (md5 of concatenated shas stable).

## Reconciliation with production (read-only)

- Production `restaurants`: 86 rows (80 Doddaballapura + GITAM corridor,
  6 Tirupati). ZERO of the 245 candidate ids exist in production (verified
  via the app's public read API + REST counts; batch-6 audit previously
  proved 61/61 zero-collision, this audit re-checked the new 82).
- Production `places`: 0 rows — batches 012/013/014/015/016/017 place rows
  have nothing to collide with.
- Execution order: 011 → 012 → … → 017 ascending; each preflight aborts if
  a predecessor is partially present, and ascending order keeps the
  coherence guards meaningful. No batch overwrites anything.

## Batch-017 eligibility review (new this session)

Bounded verification resume (60 rows area-confirmed) promoted worksheet rows
T3→T1, surfacing 110 rows that were eligible but unbatched. Individual
review: **82 admitted**, 6 identity-held (drift clusters/generic/branch
ambiguity — documented in the SQL header + duplicate review doc), 22 dropped
with recorded reasons (articles, seva/topic pages, truncated titles, area
pages, one product ad, one sub-listing, one out-of-scope locality, one
duplicate alias 'Tada Falls' = 'Ubbalamadugu Falls'). Two curation
mis-derivations corrected fail-loud in the generator ('kids zone' fort→other;
'ubbalamadugu falls' other→waterfall). Surrounding destinations (Nagari,
Kalyani Dam, Horsley Hills, Tada) carry explicit locality labels + the
'surrounding-destination' tag.

Forward-drift gate now asserts: **194 eligible rows = 29+57+27+59+18+82 − 1
frozen drift-guard row ('Tirumala Balaji Sweets -')**, all imported under
canonical-name ids, zero ineligible imports.

## sha change ledger (this session, all pre-execution, documented)

- 012: `110b95a5…` → `792fd3bb…` (quoting fix only)
- 013: `7a41e8a6…` → `466b1949…` (quoting fix only; tuples byte-identical incl. the frozen dash-named row)
- 014: `0d0c4043…` → `9010aa62…` (quoting fix only)
- 015: `4fa99309…` → `91cf27a7…` (quoting fix only; intermediate `c265ab4b…` seen mid-session during the fix window)
- 016: `18c81527…` → `4e034304…` (quoting fix only)
- 017: new file `bff810cd…`

No batch has EVER been executed against production; all shas above are
review-candidate revisions. Precedent: the batch-2 session rebased Batch-012
the same way (documented in its header).

## Execution boundary (owner action)

The sandbox holds NO Supabase write credentials (only the publishable anon
key, which RLS correctly blocks from writes; the local `DATABASE_URL` is a
SQLite file). Executing these batches requires the owner's Supabase SQL
editor (or an authorized connection). The exact reviewed action:

> In the Supabase SQL editor, run `supabase/review-candidates/insert-batch-011-p4-places.sql`
> through `insert-batch-017-tptm-b7.sql` in ascending order, one at a time,
> verifying each batch's PREFLIGHT notices and POSTFLIGHT OK before the next.
> Expected row deltas: +33 places, +29, +57, +27, +59, +18, +82.
> Run `verify-batch-0XX-*.sql` probes before/after if desired (read-only).
> Also pending owner actions: migrations 005 (verification/review foundation)
> and 010 (push_subscriptions) are not applied in production.
