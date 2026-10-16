# FOODIE — Batch-009 REV 2 Review Report (REVIEW ONLY — NOTHING EXECUTED)

Generated: 2026-10-14 (single continuous review run).
Scope: `supabase/insert-batch-009-p3-places.sql` (original, untouched) →
`supabase/review-candidates/insert-batch-009-p3-places-revised.sql` (new review candidate).

**No SQL was executed. No database was connected to or read. No file outside
`supabase/review-candidates/` was created, modified, or overwritten. Nothing
was staged or committed. The unpushed commit `99e5952` was inspected read-only
and left untouched.**

---

## 1. Original artifact verification

| Artifact | Result |
|---|---|
| Original SQL `supabase/insert-batch-009-p3-places.sql` SHA-256 | `79b892d9103320e7a232425e5a1ec295ee34d2cec9366c8cde174724a232b8ee` |
| Expected SHA-256 (from prior audit) | `79b892d9103320e7a232425e5a1ec295ee34d2cec9366c8cde174724a232b8ee` |
| Match | **YES — candidate generation proceeded.** |
| Working tree at start | Clean (`git status --porcelain` empty) |
| Unpushed commit `99e5952` | Still present, still unpushed (`main` is `[origin/main: ahead 1]`, `origin/main = e329186`). Left untouched. |

Cross-checked source artifacts (read-only): generator
`scripts/foodie-enrichment/gen-insert-batch-009.ts` (ROWS + documented review
decisions), worksheet `scripts/foodie-enrichment/worksheets/places-p3.json`
(35 candidates, per-row `reviewNotes`/`verification`), evidence
`scripts/foodie-enrichment/evidence/places-p3/` (69 files), schema artifacts
`supabase/schema.sql`, `migration-001/003/005`, executed batch
`insert-batch-002-gitam-6.sql` (documents the live `drop not null` on
`restaurants.latitude/longitude`).

The 14 candidate UUIDs were **independently recomputed** from the generator's
documented algorithm (UUIDv5, namespace `6d3a0f5e-7b1c-4a2e-9d84-2f6a1c9e0b31`,
name `foodie-p3:<city>:<name>`) — all 14 match the original SQL exactly.

---

## 2. Record-by-record dispositions (9 retained / 5 held)

### Retained in the REV 2 candidate (all `unverified`, NULL coordinates, rating 0, `₹₹`)

| # | Name | UUID | City | Evidence basis (with caveats) |
|---|---|---|---|---|
| 1 | Holiday Inn Tirupati Tirumala | `52a44755-9abc-5ee9-ba4b-7b05d78cbc5c` | Tirupati | Official ihg.com page; agoda snippet carries the address ("Near Tirupati International Airport, Sri Kalahasti Road"). Caveat: address is listing-level, not field-verified. |
| 2 | Starlit Suites | `471284c4-06f5-5e5c-8584-084068be5b96` | Tirupati | Official clubmahindra.com page; Renigunta Road / 517501 corroborated across listings. Caveat: some captured snippets are review-page level, not full addresses. |
| 3 | Tirupati Foods | `86841bb2-f380-5918-b656-224c79aeefa2` | Tirupati | justdial business page ("in Tilak Road, Tirupati", near Municipal Office). |
| 4 | Ni Cake World | `fbe67c10-ea4b-5090-b435-5e3e7c75e560` | Tirupati | justdial business page ("in Gandhi Road, Tirupati — Bakeries", 281 reviews). |
| 5 | Ps4 Restaurant | `8fbd7a4d-917a-57e6-bc30-5d724a952407` | Tirupati | magicpin business page (Korlagunta). Caveat: identity is listing-URL/title-level; no street-address evidence captured. |
| 6 | The 99 Pizza | `a868d3a5-81e6-59d3-9a08-dbcffd4d6172` | Tirupati | magicpin page with street evidence ("Abbanna Colony, Tirupathi - 517501"; the 'Tirupathi' spelling is the listing's own and is kept verbatim in the address; `city` field is 'Tirupati'). |
| 7 | Nanjundeshwara Bakery & Sweets | `65f0aace-1a57-5cef-a64a-1fb59a55dbb8` | Doddaballapura | justdial business page; URL slug names Doddaballapur. Caveat: URL/title-level identity evidence only. |
| 8 | Kolkata Sweet & Foods | `8dd66b9a-62b8-5843-b2b7-df2603c9dbc6` | Doddaballapura | justdial page with area evidence ("located Near Provident Welworth City", "in Doddaballapur, Bangalore"). |
| 9 | Kouzina Kafe - The Food Court | `c03a27e8-184b-5f81-b798-1c76a4a23d39` | Doddaballapura | zomato business page under city doddaballapura (3 listing variants merged upstream). Caveat: identity is listing-URL-level. |

None of the 9 is presented as an independently verified business; none has a
field-verified complete address; all stay `unverified` with NULL lat/lng.

### Held OUT of the REV 2 candidate (source artifacts untouched)

| # | Name | UUID | Exclusion rationale (evidence-backed) | What would be needed to reconsider |
|---|---|---|---|---|
| 1 | Lake Valley Resort and Spa | `82d96f9c-4e2b-553b-9e4e-daa34b52499e` | Stored `city='Tirupati'` and `address` element "Talakona Road" are not supported by the captured evidence, which points to Chittoor-district villages: makemytrip "1-1 Bhakarapata, tirupati road, **chinnagottiigallu mandal 517194**", trip.com "**Bhakarapeta, Chittoor District**", tripadvisor "**Chittecherla 517194**", hotels.com "**Chinnagottigallu**". "Talakona" appears only in listing titles ("27 kms from Talakona Waterfall"), not as the road address. Importing as-is would misclassify a Chittoor-district resort as Tirupati city. (worksheet rows: `Lake Valley Resort and Spa Tirupati`, `…27 kms from…`) | A source that establishes the canonical, correct address AND its correct geographic classification (Tirupati city vs Chittoor district vs a different destination), before city/address are ever written. Do NOT silently rewrite city or address. |
| 2 | Tirumala Cake House | `4b931ad7-85af-5261-800f-9305d38ad281` | Worksheet says **"AREA NOT CONFIRMED"**; identity verification returned **zero search results** (`hits: []`, `addressEvidence: null`). The only identity signal is the justdial URL/title itself. | Independent confirmation that this specific bakery exists at the Bhavani Nagar address (e.g., a second, unrelated listing or an official presence), plus area confirmation. |
| 3 | Lunchbox - Meals & Thalis | `a3afcb24-f111-5f01-b56b-cec6a450dc64` | Worksheet says **"AREA NOT CONFIRMED"**; verification returned zero results (`hits: []`). Evidence is URL/title-level only (magicpin listing title). | Independent identity + area evidence beyond the single magicpin URL/title. |
| 4 | Desi Family Dhaba And Restaurant | `8f5b6b55-4ce9-5dda-810b-137fb2667ab6` | Worksheet says **"AREA NOT CONFIRMED"**; verification returned zero results for the business listing (`hits: []`; the only hit is the justdial *categories* page). "Near GITAM University, Nagadenahalli" rests on a **typo'd URL slug** ("Nagadenahalii"), not independent placement evidence. | Independent evidence placing this dhaba near GITAM/Nagadenahalli (second listing, map evidence, or official presence) with correct spelling confirmed. |
| 5 | Home's Kitchen | `9dcb300e-74d7-5843-92aa-ec3736b48c0d` | Worksheet says **"verification rate-limited (skipped run)"** and **"AREA NOT CONFIRMED"** (`hits: []`, `addressEvidence: null`). The stored locality "Doddaballapura town" is coarser than what discovery suggested; identity was never independently established. | A successful (non-rate-limited) verification pass establishing identity AND locality within Doddaballapura. |

All 5 held rows keep their worksheet, evidence files, and generator entries —
nothing was deleted. Note the recorded conflict, not silently resolved: the
worksheet marks all 5 "AREA NOT CONFIRMED — candidate excluded from SQL",
while the generator's human-review pass had approved them; this revision
follows the stricter worksheet evidence and the task's default dispositions.
The held rows' UUIDs are absent from the REV 2 SQL entirely.

---

## 3. Destination description decision

- **Problem (audit finding):** REV 1's proposed description contained
  "verified-data pilot", which could misleadingly imply verified restaurant
  records; the 9 imported rows are unverified source-linked listings.
- **Candidate change (REV 2):** exactly that phrase becomes **"source-linked
  pilot"**. Everything else in the sentence is unchanged.
- **Exact proposed wording (single string):**
  > Tirupati district, Andhra Pradesh — temple town at the foothills of Tirumala, home to Sri Venkateswara Temple. Official accommodation information is published by TTD at tirumala.org (AccommodationAtTirupati). Foodie's listing here is a source-linked pilot: every place records its own source link.
- **Limitation (explicit):** the CURRENT live description is unknown to this
  revision — no database access was made and none is claimed. The candidate's
  UPDATE replaces ONLY the `description` of the single `slug='tirupati'`
  active row asserted by preflight; it cannot and does not claim to preserve
  any other description content that may be live. The `IS DISTINCT FROM`
  guard makes it a no-op if the description already equals the proposal.
  The documented destination purpose (district info + official TTD
  accommodation link) is preserved from REV 1.
- This is a **candidate change only** — nothing has been applied anywhere.

---

## 4. Substantive SQL changes (REV 1 → REV 2)

| # | Change | Where |
|---|---|---|
| 1 | Rows reduced 14 → 9 (6 Tirupati + 3 corridor); 5 evidence-weak rows removed. Row field values copied verbatim (no rewording, no reordering of retained rows). | Part 1 |
| 2 | **UUID collision preflight added** (REV 1 checked names only): aborts if any of the 9 fixed ids already exists. | Preflight (c) |
| 3 | Name-collision preflight narrowed to the 9 retained names. | Preflight (b) |
| 4 | **Destination preflight rewritten as a count-based exact-one assertion**: exactly one `slug='tirupati'` row total AND exactly one active (no non-STRICT `SELECT INTO` used as an assertion; the post-count `SELECT` is provably safe). Also robust to a hypothetical loss of the `destinations_slug_key` uniqueness. | Preflight (e) |
| 5 | **Postflight actually checks verification fields** (REV 1 only claimed this in comments): `last_verified_at`, `address_verified`, `coordinates_verified`, `hours_verified`, `photos_verified` must all be NULL on every batch row. Column names come from committed `migration-005`. | Postflight (4) |
| 6 | **Postflight provenance check added**: every batch row must carry `source='p3-research-import'` and a non-empty `source_url`. | Postflight (5) |
| 7 | **Postflight defaults check added**: every batch row must have `rating=0` and `price_level='₹₹'`. | Postflight (6) |
| 8 | **Row-count assertions recomputed for 9 rows, clearly labelled:** total 86 (= 77 precondition + 9); Tirupati 6 (= assumed 0 + 6); Doddaballapura 80 (= assumed 77 + 3). The stale "14 / 9 / 82" expectations are gone. Error messages state what each number represents and which rows were held out. | Postflight (7) |
| 9 | Destination description wording: "verified-data pilot" → "source-linked pilot"; UPDATE remains guarded to the single active slug row; postflight asserts the new exact text and exact-one active row (count-based). | Part 1b, Postflight (8) |
| 10 | Header rewritten: 9-row REV 2 status, all 5 held rows named with UUIDs and reasons, stale-baseline precondition documented, rerun behavior documented, schema-source note added. The misleading "verified places" phrasing in the title is gone ("researched places"). | Header |
| 11 | Transaction structure unchanged: `begin` → preflight → inserts → destination update → postflight → `commit`; any `RAISE` aborts before commit (full rollback). | Whole file |

### Assertion arithmetic (why the numbers changed)

- REV 1 expected: total 86 = 77 + 14; Tirupati 9 = 0 + 9; Doddaballapura 82 = 77 + 5.
- REV 2 expects: total **86** = 77 + **9** (coincidentally equal to REV 1's total);
  Tirupati **6** = 0 + **6**; Doddaballapura **80** = 77 + **3**.
- The per-city baselines (Tirupati 0 / Doddaballapura 77) are REV 1's audited
  splits carried forward **as assumptions**, not live values.

---

## 5. Candidate file, hash, and size

| File | SHA-256 | Bytes | Lines |
|---|---|---|---|
| `supabase/review-candidates/insert-batch-009-p3-places-revised.sql` | `c74e43399bd53eeaa3ab2aec59262c469f60f5809a83a9981271757d6e334629` | 31,662 | 600 |
| `supabase/review-candidates/insert-batch-009-p3-places-revised.diff` | `11e30a9c75c101ecf4a1e147141d4db4df4b647ecdb7627ea46bb13b2635f923` | 37,809 | 646 |
| Original (unchanged, re-verified after candidate creation) | `79b892d9103320e7a232425e5a1ec295ee34d2cec9366c8cde174724a232b8ee` | 22,155 | 491 |

Diff summary: 1 file changed, 295 insertions(+), 186 deletions(-) — the diff
touches only the two SQL paths (`a/supabase/insert-batch-009-p3-places.sql` →
`b/supabase/review-candidates/insert-batch-009-p3-places-revised.sql`); no
generator, worksheet, evidence, application, or other file appears in it.

---

## 6. Known limitations (documented, not hidden)

1. **No live database access was made.** Every number the candidate asserts
   (77 baseline; 0 Tirupati / 77 Doddaballapura per-city baselines; 0
   collisions; 1 active tirupati destination) is a labelled logical
   derivation from the REV 1 audit, **not** a current measurement. The
   baseline is a precondition that MUST be revalidated with read-only probes
   immediately before any future execution.
2. **Schema is known only from committed artifacts** (`schema.sql`,
   `migration-003` for `destinations.slug` UNIQUE + `is_active` + nullable
   `description`; `migration-005` for `source`, `source_url`,
   `last_verified_at` and the four `*_verified` booleans; executed batch-002
   for the `latitude/longitude drop not null` ALTER). If the target database
   is missing migration-005, the postflight fails with "column does not
   exist" and aborts — the conservative outcome. No live schema was probed.
3. **Live destination description unknown** — the update overwrites the
   description of the single asserted row; preservation of unrelated existing
   text is NOT claimed (see §3).
4. **Not parser-validated.** No PostgreSQL/psql/sqlglot tool is guaranteed in
   this sandbox; validation was structural (see §7). The candidate is also
   intentionally **not rerunnable**: after a successful commit a second run
   aborts at preflight (baseline ≠ 77, 9 name collisions, 9 marker rows).
5. **Evidence caveats on retained rows** (§2): Ps4 Restaurant, Nanjundeshwara
   Bakery & Sweets and Kouzina Kafe rest on listing-URL/title-level identity
   evidence; Starlit Suites' corroborating snippets are mixed quality. None
   of the 9 should ever be displayed as "verified".

---

## 7. Read-only validation performed (no SQL executed, no generator run)

| Check | Result |
|---|---|
| Original SQL SHA-256 before AND after all work | `79b892d9…` — unchanged, byte-identical |
| Candidate contains exactly the 9 intended UUIDs, each exactly once (INSERT + preflight + 6 postflight id-lists) | PASS — 9 distinct ids × 8 reference sites |
| The 5 held UUIDs absent from the candidate SQL | PASS (they appear only in comments documenting the hold) |
| No duplicate UUIDs / names within candidate | PASS |
| Names, addresses, categories, city, locality, tags, source_urls of the 9 rows byte-identical to generator ROWS / REV 1 SQL | PASS (verbatim copy check) |
| All 9 rows `unverified`, NULL lat/lng, rating 0, `₹₹`, marker `p3-research-import` | PASS |
| Assertion numbers internally consistent (9 ids; 6+3 cities; 77+9=86; 0+6=6; 77+3=80) | PASS |
| Transaction boundaries: one `begin;` … one `commit;`; guards inside `DO $$ … $$;` blocks; no nested `$$` collisions | PASS (structural) |
| Diff contains only the two intended SQL paths; no secrets/tokens/credentials in candidate or diff | PASS |
| Working tree after work: only the 3 new files under `supabase/review-candidates/`, untracked, NOT staged, NOT committed; original files untouched | PASS |
| `99e5952` still unpushed, unchanged | PASS |

Checks that could NOT be performed (and are NOT claimed):
- No real SQL parser run (no psql/Postgres engine available here) — syntax
  review was manual/structural only.
- No live baseline, live schema, collision, or destination-count check —
  database access was prohibited for this task.
- No second-run/rerun test — nothing was ever executed.

---

## 8. Outstanding pre-execution checklist (before anyone may run ANY batch)

1. Re-run read-only probes against the target database and re-confirm EVERY
   preflight expectation at that moment: total count = 77; per-city counts
   (0 Tirupati / 77 Doddaballapura); 0 name collisions among the 9; 0 UUID
   collisions among the 9; 0 `p3-research-import` rows; exactly one active
   `slug='tirupati'` destination row; migration-005 columns present.
2. Capture the current live `tirupati` destination description and decide
   explicitly whether the proposed overwrite is acceptable.
3. Confirm the 5 held rows should stay held (or re-review them with fresh
   evidence — their worksheet/evidence/generator entries are intact).
4. Re-verify file hashes; execute via Supabase SQL Editor ONLY after
   explicit human approval of THIS candidate file.

---

## 9. Final confirmations

- **NO SQL was executed** against any database; **no database was connected to**.
- **NO deployment, NO push, NO commit, NO staging, NO history change.**
- **The original `supabase/insert-batch-009-p3-places.sql` was not edited,
  overwritten, or regenerated** (hash re-verified unchanged).
- **No generator, worksheet, evidence, or application file was modified.**
- **No Git configuration, `.git/info/exclude`, or auth settings were changed.**
- The only filesystem changes are the three new review artifacts in
  `supabase/review-candidates/`.
