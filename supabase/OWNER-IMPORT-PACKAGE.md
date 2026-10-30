# FOODIE — OWNER IMPORT PACKAGE (batches 011–017)

**One consolidated action.** Every pending, already-audited review-candidate
batch is listed here in the exact order to run, with the exact file names,
the exact expected outputs, and what to do if anything fails. Nothing in this
package has ever been executed against production; all files are INSERT-only,
transaction-wrapped, and re-verify the live database before touching anything.

Auditor's full per-batch review: `docs/batch-import-audit-report.md`.

---

## 0. Preconditions (all verified before this package was written)

| # | Condition | State when packaged |
| --- | --- | --- |
| P1 | `migration-008-places.sql` applied (the `public.places` table exists) | ✅ applied — production `places` table exists with 0 rows |
| P2 | Exactly ONE active Tirupati row in `public.destinations` | ✅ 3 destinations total, one Tirupati (batches 012–017 re-verify this at run time) |
| P3 | Production `restaurants` = 86 rows, `places` = 0 rows | ✅ measured read-only via the app's public API + REST counts |
| P4 | Zero of the 288 candidate ids already exist in production | ✅ verified read-only |
| P5 | Batches 011–016 present-or-absent as whole units (coherence) | ✅ enforced by each file's own preflight |

If your production numbers differ from P3, STOP and re-run
`docs/`-referenced probes before proceeding — do not import on top of an
unknown state.

---

## 1. What you will run — exact ordered list

Run the SEVEN insert files in this exact ascending order, ONE AT A TIME,
waiting for each file's success output before starting the next.

| Step | Insert file (Supabase SQL Editor) | Rows added (r = restaurants, p = places) | Cumulative after step (r / p) |
| --- | --- | --- | --- |
| 1 | `supabase/review-candidates/insert-batch-011-p4-places.sql` | +16 p (10 attractions + 6 hotels) | 86 / 16 |
| 2 | `supabase/review-candidates/insert-batch-012-tptm-master.sql` | +10 r, +19 p | 96 / 35 |
| 3 | `supabase/review-candidates/insert-batch-013-tptm-b2.sql` | +17 r, +40 p | 113 / 75 |
| 4 | `supabase/review-candidates/insert-batch-014-tptm-b3.sql` | +22 r, +5 p | 135 / 80 |
| 5 | `supabase/review-candidates/insert-batch-015-tptm-b5.sql` | +40 r, +19 p | 175 / 99 |
| 6 | `supabase/review-candidates/insert-batch-016-tptm-b6.sql` | +8 r, +10 p | 183 / 109 |
| 7 | `supabase/review-candidates/insert-batch-017-tptm-b7.sql` | +53 r, +29 p | **236 / 138** |

**Final expected state: `restaurants` = 236 rows, `places` = 138 rows
(374 total).** All new rows carry `source = 'tptm-*-import'` (batches 012–017)
or the batch-011 marker, `verification_status = 'unverified'`, and NULL
coordinates except batch-013's single evidenced National Park row.

**Do NOT run** `supabase/review-candidates/insert-batch-010-p4-places.sql`
— it is an earlier candidate whose 6 hotel rows were carried forward
byte-identically into batch-011; running 010 would collide with 011's
preflight and abort (safe, but pointless).

---

## 2. Exact Supabase SQL Editor procedure (repeat per step)

1. Open your project in the Supabase dashboard → **SQL Editor**.
2. Open the step's insert file from the repo, **select its ENTIRE contents**
   (these files are self-contained: `begin; … commit;`), paste into the
   editor, and click **Run**.
3. Watch the **Messages / Results** panel:
   - First you must see one or more `PREFLIGHT OK: …` notices (each file
     proves the live state before inserting — marker checks, id/slug/name
     collision counts, coherence with predecessor batches, schema checks).
   - Then `INSERT 0 <n>`-style success output ( Supabase may render this as
     "Success. No rows returned" — that is normal for this script shape).
   - Finally `POSTFLIGHT OK: …` notices (exact per-row re-read: count,
     honesty invariants, held-out rows still absent).
4. Only then proceed to the next step.

**Optional but recommended** (read-only, zero risk): before step 1 and after
each step, paste the matching
`supabase/review-candidates/verify-batch-0XX-*.sql` file and Run it. Each is
a pure SELECT union that prints per-marker row counts and the batch's exact
id-presence counts. Before step 1 every probe should read 0; after step N the
probe for that batch should show exactly its table-1 row counts.

---

## 3. If a check fails

- **Every file is atomic.** Any failed guard raises an exception, the
  transaction aborts, the commit never runs, and the database is left
  exactly as it was. A failure can never leave a partial import.
- **`PREFLIGHT FAIL: … batch-0XX ids already exist / marker row present`**
  → the batch (or part of it) is already applied. Do NOT re-run blindly.
  Run that batch's `verify-*.sql` probe: if the probe shows the batch's
  exact full row set, the batch is already complete — skip it and continue
  with the next step. If it shows a PARTIAL set, stop and record the probe
  output (this state is designed to be impossible without manual
  interference; it needs human review, not another run).
- **`PREFLIGHT FAIL: Batch-011 rows are PARTIALLY present`** (or any
  predecessor-coherence failure) → an earlier step did not complete. Fix
  that step first; never import a later batch on top.
- **`POSTFLIGHT FAIL`** → the transaction has already rolled back; note the
  exact message and stop. Nothing was changed.
- **Any other error** → note the exact text, run the step's verify probe,
  and stop. Do not "fix" the database by hand.

---

## 4. Separate pending owner actions (NOT part of this import)

These are independent of batches 011–017 and can be done before or after:

| Item | File | Why it matters |
| --- | --- | --- |
| Push subscriptions table | `supabase/migration-010-push-subscriptions.sql` | Web Push is honestly disabled in the app until this is applied and VAPID env vars are configured |
| Verification/review foundation | `supabase/migration-005-verification-review-foundation.sql` | Not needed by any batch; enables the future verification workflow tables |

After importing, the app needs no redeploy — the discovery UI reads the
tables live. Tirupati will show its areas under the destination screen's
area chips (Tirupati city, Tirumala, Tiruchanur, Srinivasa Mangapuram,
Renigunta, Chandragiri, Srikalahasti + surrounding destinations).

---

## 5. Coverage note (honest)

The 288 rows are evidence-backed, deduplicated, all `unverified` — that is
by design (an import never self-verifies). Known remaining coverage gaps are
documented in `docs/tirupati-coverage-matrix.md` (notably: Srinivasa
Mangapuram has no in-scope food venue in any searched source; Tiruchanur
restaurants only have delivery-area-page leads, deliberately not imported).
