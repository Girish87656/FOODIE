# FOODIE — Tirupati Discovery Worklog (Master Pass, Batches 1-2)

Factual record of what was ACTUALLY done. Sources that could not be accessed are
recorded as limitations, never silently skipped. Counts come from the committed
evidence files, not from memory.

Owner directive: broadest practical, source-backed inventory of places across
Tirupati and Tirumala — famous and small/obscure alike — with honest locality
grouping, auditable evidence, and no invented data.

---

## Timeline

### Session 1 (previous, resumed) — plan + pipeline + official sweep

- **Plan of record** written: `docs/tirupati-place-discovery-plan.md` — scope,
  honest locality grouping (8 areas), category→DB-target mapping, source list
  with access status, query strategy, verification policy, integration plan.
- **Phase A baseline (measured, not assumed):** production probes —
  `/api/restaurants/all` 86 rows (Doddaballapura 80, Tirupati 6);
  `/api/destinations` 3; Tirupati `places` rows live: 0 (Batch-011's 16
  candidates remain owner-blocked).
- **Research harness built:** `scripts/foodie-enrichment/research-tirupati-master.ts`
  — 4 resumable phases (discovery → verify → geocode → worksheet) with per-area
  area-token gates, host allow-lists, conservative name extraction, and every
  hit persisted to evidence BEFORE any decision.
- **TIR-3c official sweep:** 8 tirumala.org/incredibleindia pages fetched
  HTTP 200 (1,735 KB saved raw HTML); 103 name extractions, each with
  source URL + verbatim quote; 103/103 quotes re-located word-for-word in the
  saved pages (programmatic self-check). `tirupati.ap.gov.in` and
  `tourism.ap.gov.in` are NETWORK-BLOCKED from this sandbox (connection failed
  after repeated attempts) — recorded as explicit limitations; zero content
  taken from them.

### Session 2 (this session) — sweep completion + curation + Batch-012

- **Discovery completed for ALL 9 category groups × 8 areas:** the previous
  session had left several planned queries unrun; the resumable pipeline filled
  them (market, bakery, cafe, street, tiffin, restaurants, temples,
  attractions, stays). Final state: **115 discovery queries run, ~640 raw hits**
  persisted in `evidence/tirupati-master/discovery-*.json`.
- **Path bug found & fixed (honest note):** the harness derived its evidence
  directory from `process.cwd()`; running it from a subdirectory created a
  nested duplicate tree and caused duplicate re-fetches of already-covered
  queries (wasted API calls; hit hard 429 throttling). Fixed to derive from
  `import.meta.url`; nested tree merged back into the canonical one
  (5 genuinely-new query entries recovered, +37 verify files, +28 geocode
  files; duplicate re-fetches discarded); the failure mode is now impossible.
- **Verify phase (rate-limit-bound):** the z-ai search backend hard-throttled
  (HTTP 429 with 45-60 s back-offs; spacing widened to 12 s to reduce 429
  storms). At cutoff: **104 candidates carry an identity-verification file** —
  17 area-re-confirmed, the rest not-confirmed or rate-limit-skipped; the
  pipeline is fully resumable per candidate.
- **Geocoding:** OSM Nominatim (keyless, 1 req/s, project UA, area-gated) ran
  for every area-confirmed candidate: **0 coordinates passed the area gate**
  (recorded per-candidate with reasons). All coordinates stay NULL — never
  estimated.
- **Curation (Phases C/D/E):** `scripts/foodie-enrichment/curate-tirupati-master.ts`
  — deterministic name cleaning (20 audited renames), generic-page/dish/social
  noise drops (**29 drops, each with a recorded reason**), alias-level identity
  dedup (38 merge events across alias groups such as Kapila Theertham ≡
  Kapileswara Swamy, Silathoranam ≡ Natural Arch), cross-set exclusion against
  the 6 live Tirupati rows and the 16 owner-blocked Batch-011 candidates
  (**11 curated candidates alias Batch-011 — excluded, not duplicated**), and
  honest area re-derivation from locality tokens in listing titles (e.g.
  Korlagunta rows moved from "city centre" to "residential neighbourhoods").
  Result: **191 raw candidates → 137 curated (10 T1 + 24 T2 + 103 T3) + 7
  possible duplicates queued + 29 dropped.**
- **Batch-012 generated (review candidate — NEVER executed by the repo):**
  `scripts/foodie-enrichment/gen-insert-batch-012.ts` →
  `supabase/review-candidates/insert-batch-012-tptm-master.sql` +
  `verify-batch-012-tptm-master.sql`. **29 rows** (10 T1 restaurants + 19 T2
  official-source places). Deterministic uuid5 ids
  (`foodie-tptm:Tirupati:<name>`); every row `verification_status='unverified'`
  with all four verification fields NULL; coordinates NULL; INSERT-only with
  fail-loud preflight/postflight guards and idempotent-rerun protection.
  sha256(insert SQL) `ba8b21f4f2663107990ea77ca8fc139db2399c9d52aee728d3ed011a5bb79fca`
  (byte-identical across two consecutive generations).
- **Docs generated:** inventory / source register / coverage matrix /
  duplicate review / photo gaps — all emitted by
  `scripts/foodie-enrichment/gen-tirupati-docs.ts` from committed evidence.
- **Tests:** `tests/tirupati-master.test.ts` — 18 integrity gates over the
  batch SQL, curated worksheet, and official-source evidence (deterministic id
  recomputation, unverified+NULL-coordinate enforcement, INSERT-only
  semantics, Batch-011 non-duplication, enum safety, provenance mandatory,
  accounting identity, no secrets).

### Session 3 (resumed mid-batch-2) — batch-2 completion, Batch-012 rebase, doc fixes

Resumed an interrupted session whose auto-checkpoint had already committed the batch-2
sweep evidence, a first Batch-013 review candidate, and worksheet/doc updates. Audited
everything before continuing; found and fixed the following:

- **Failing integrity gate (1/161) — real collision caught:** the batch-2 curation renamed
  canonicals (e.g. "Sri Bhu Varahaswamy Temple" → "Sri Varahaswamy Temple, Tirumala";
  "Sri Bedi Anjaneya Swamy Temple" → "…, Tirumala", promoted T2→T1 on new verify evidence)
  and introduced a DISTINCT Renigunta temple named "Sri Prasanna Venkateswara Swamy Temple"
  (T3 — its verify evidence matched a Kadapa address, so it stays unimported). Batch-012's
  SQL still carried the pre-rename display names, so its INSERT id for the Appalayagunta
  temple equaled the Renigunta row's name-derived uuid5 — exactly the drift class the
  eligibility gate exists to catch. Fixed by REBASING
  `gen-insert-batch-012.ts` onto the worksheet canonicals (display name = canonical name,
  fail-loud equality assertion instead of prefix match); regenerated Batch-012 (new
  sha256 `110b95a5ebab950a49f0fd76e357fc94a52677182252010461d23dff462b1e93`; was
  `ba8b21f4…` — never executed, so the rebase is safe and owner-visible) and Batch-013
  (sha256 `7a41e8a664c5658910ec9d146ce31dc4d733f01aee3d24e6ff45dabe10619555`, was
  `96ebdb4c…`). The colliding id now appears in ZERO SQL files. The 10 restaurant
  display names were unchanged except "Southern Spice" → "Southern Spice, Avilala".
- **Forward-drift gate added:** the test header had promised "no drift against the curated
  worksheet" but only a reverse-direction gate existed. Added the forward gate: EVERY
  eligible worksheet row (T1/T2, new, curated, not identity-held) must be imported under its
  canonical-name id — mechanically enforces 86 = 29 + 57 with zero uncovered rows.
- **Rendering hole fixed (present since Batch 1):** 56 official-source rows carried the
  placeholder `group: "official"` — a source kind, not a category — so they were invisible
  in the inventory tables and coverage matrix (Swami Pushkarini, the 28 TTD rest houses,
  Vishnu Nivasam, Regional Science Centre, … were all missing from
  `tirupati-place-inventory.md` even though their data was correct and queued).
  `curate-tirupati-master.ts` now derives the semantic group from `category`
  (CATEGORY_TO_GROUP: hotel→stays, temple→temples, other→attractions, …); curation re-run;
  docs regenerated — the inventory grew from 473 to 533 lines and the per-row "Import
  batch" column now shows 29 × batch-012 + 57 × batch-013 + 5 × identity-held, verified by
  count.
- **Known non-determinism recorded (honest note):** a full curation re-run drifts in
  `curatedOn` (date) and in 4 `verifyAddressEvidence` text fields — the verify-evidence
  name→file matching is readdir-order dependent when two verify files normalize to the same
  candidate name. Tiers, statuses, names, ids, coordinates and SQL output are UNAFFECTED
  (SQL shas identical across the re-run). Flagged for future hardening; not blocking.
- **Gates:** tests **162/162** (was 161 with 1 fail), lint 0, tsc 0 (incl. a real TS fix in
  gen-013's `CuratedRow` geocode type). Zero `src/` changes — the deployed app is
  untouched by construction. Batch-012/013 remain UNEXECUTED review candidates.

## What this pass did NOT do (honest backlog)

- 87 T3 candidates still lack independent verification (rate-limited);
  they remain internal-inventory-only, never SQL, never shown as verified.
- TTD pages PlacesatTirumala.aspx, MoreTemples.aspx, RestHousesInTirumala.aspx,
  ttdklmps.aspx and S.V. Museum.aspx were FETCHED in the batch-2 pass (HTTP 200,
  verbatim quotes committed) — no longer backlog.
- `tirupati.ap.gov.in` / `tourism.ap.gov.in` (and TTD's alternate domains
  ttdevasthanams.ap.gov.in / tirupatibalaji.ap.gov.in) remain network-blocked from
  this sandbox; their content entered only via attributed search snippets.
- Google Maps was not bulk-harvested (terms prohibit it) — place names entered
  only via public search results.
- Batch-012 (29 rows) and Batch-013 (57 rows) are NOT applied: production writes
  require owner execution of the reviewed SQL in the Supabase SQL editor
  (established protocol), exactly like Batch-011.
- No photographs were added (none identity-verifiable + licence-clear found
  for the new rows); the UI's labelled fallback chain covers them honestly.

## Remaining owner actions

1. Review + execute `supabase/review-candidates/insert-batch-012-tptm-master.sql`
   THEN `insert-batch-013-tptm-b2.sql` (Supabase SQL editor, in that order —
   batch-013's preflight asserts batch-012 is 0-or-29 present) when ready —
   preflight guards will abort unless the database is in the reviewed state;
   Batch-011 stays independent and owner-blocked as before.
2. Batch-011's 16 rows (pending since the previous pass) — unchanged.
3. Optional: provide network access to the blocked .ap.gov.in domains (or
   exported page content) to unlock the district/AP-tourism source family.
4. Optional: authorize continuing the verify backlog in a follow-up session
   (resumable; ~9 candidates per 9 minutes under current throttling).
5. Optional: approve identity resolution for the 5 HELD candidates (Kafe,
   Kafe Tirupati, Anjaneya Swamy Temple, Sri Vinayaka Swamy Temple, Mini Park) —
   verify-confirmed but names too generic to admit without stronger evidence.
