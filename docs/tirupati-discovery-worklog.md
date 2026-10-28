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

### Session 4 (2026-10-27) — interrupted batch-3 recovery, verification hardening, Batch-014

State found on resume (read-only diagnosis first, nothing reset/overwritten):
- HEAD `4fcd64a` (checkpoint commit on top of `9fe2b29`, 4 ahead of origin/main,
  unpushed); working tree carried 6 untracked verify evidence files, all
  `skipped:true` 429 stubs — the exact point where the prior session died.
- Reconciled counts at resume: 251 discovery queries / 1,858 raw hits
  (10 errored entries); worksheet 351 candidates; verify evidence on disk 304
  files = 293 matched to current candidates (165 area-confirmed incl. 9
  post-worksheet confirmations, 21 ran-and-not-confirmed, 116 throttled
  stubs) + 11 orphan files for stale slugs (preserved, not deleted);
  58 candidates never attempted; geocode 116 files / 18 with coords.

Tool-failure diagnosis (instruction 1):
- The "transient tool error" = z-ai `web_search` upstream returning HTTP 429
  ("Too many requests"), sometimes wrapped in HTTP 500 with a serper
  ReadTimeout; every verify attempt in the final stretch was throttled.

Pipeline hardening (research-tirupati-master.ts):
- Verify resume semantics fixed: a verify file WITHOUT `skipped:true` is a
  COMPLETED record — never overwritten, never re-queried; a `skipped:true`
  stub IS re-attempted, with `previousAttempts` audit trail preserved.
- Added `--limit N` (chunked runs) and a circuit breaker (`--breaker N`,
  default 5 consecutive throttle-outcomes → pause the source, exit 3,
  never spin). Bounded back-offs 75s→120s per candidate, Retry-After hint
  honoured when present; skip reasons recorded (`rate-limited` /
  `infra-error`).
- Worksheet phase honesty fix: a throttled candidate now carries
  `verificationThrottled: true` and is NOT labelled "AREA NOT CONFIRMED"
  (it was never verified — pending, not excluded). Worksheet summary now
  reports verifyRanNotConfirmed / verifyThrottled / verifyPending /
  geocodeEligiblePending explicitly.
- CLI arg fix: `verify --limit 4` no longer mistakes "--limit" for a slug
  filter (positional3).
- Geocode pass resumed for the 54 eligible candidates: 1 new area-gated
  coordinate (Sri Bedi Anjaneya Swamy Temple, Tirumala → 13.6834215,
  79.3492407, evidence file committed); 53 honest NULLs (dirty listing
  titles yield no Nominatim match — coordinates stay null, never estimated).
  geocodeEligiblePending now 0.

Verification state at session close (honest):
- web_search quota remained exhausted across 3 bounded probes spread over the
  session (every attempt 429, including after 75s/120s back-offs) — the
  source was PAUSED per protocol, not spun against.
- Final tally: 351 candidates = 156 area-confirmed + 21 ran-negative +
  116 throttled-stubs (pending re-attempt) + 58 never-attempted.
  A throttled request is never counted as verified anywhere.

Batch-3 eligibility review + Batch-014 (instruction 7):
- Curation re-run on the batch-3 worksheet (the interrupted session never
  curated it): 351 in → 273 curated / 13 dup-queued / 65 dropped with
  reasons; T1 81, T2 55.
- All 49 newly verify-confirmed candidates reviewed individually:
  - 27 admitted → NEW `gen-insert-batch-014.ts` review candidate
    (insert-batch-014-tptm-b3.sql, sha256 0d0c4043…; 22 T1 restaurants +
    5 T1 neighbourhood temples with locality-disambiguated canonical names;
    ALL coordinates NULL; INSERT-only; preflight asserts b11/b12/b13 are
    each fully-absent-or-fully-applied; idempotent; NOT executed).
  - 22 dropped with recorded reasons (5 social-media posts, 5 directory
    pages, 2 equipment-dealer pages, 1 generic name, 1 TTD organisation
    listing, 3 TTD facilities caught by a food sweep, 1 trade shop,
    4 merged duplicates).
  - 2 "Perambur Srinivasa Sweets" listings cross-referenced to the LIVE
    production "Ps4 Restaurant" (brand pattern) — never re-imported.
  - 3 new identity holds: "Tirumala Balaji Sweets" (name-drift guard vs the
    FROZEN batch-013 queued row 'Tirumala Balaji Sweets -' — venue already
    queued; importing the no-dash canonical would double-queue it),
    "Tirumala Tea Stall" (Khadi Colony vs Reddy & Reddy Colony conflict),
    "Mirchi Bajji Point" (unresolved vs the Mangalam listing).
- Forward-drift gate updated 86 → 112 (29+57+27 minus the drift-held
  canonical); every one of the 112 eligible rows verified imported.
- Official-source gates updated for the 5 pages the interrupted session
  fetched (18 HTTP-200 pages total, 185 verbatim quotes; 2 ap.gov.in
  domains still network-blocked).

Quality gates (all green at close):
- 170/170 tests (was 162; +8 batch-014 gates), lint 0, scripts tsc 0;
  root tsc errors pre-existing in examples//skills/ only (untouched);
  generator determinism verified (byte-identical on re-run); secret scans
  pass; E2E: homepage + auth flow render, 0 console/page errors, mobile
  viewport clean, `/api/restaurants/all` serves 86 live places incl. the
  6 live Tirupati rows. Zero src/ changes.

Remaining gaps (not claimed complete):
- 174 candidates still await verification (116 throttled + 58 never
  attempted) — resumable once the search quota resets; run
  `bun scripts/foodie-enrichment/research-tirupati-master.ts verify --limit N`
  in chunks.
- 11 orphan verify files for stale slugs retained on disk (documented).
- ap.gov.in domains remain network-blocked; Google Maps not bulk-harvested.
- Batch-011 (16), Batch-012 (29), Batch-013 (57) remain owner-blocked
  review candidates; Batch-014 (27) joins that queue. NOTHING executed,
  NOTHING pushed.
- Epicruise / Hangouts identity resolution still open; VAPID env still
  unset; venue photos still absent for most rows (photo-gaps doc current).

## Batch 4 — direct-source pass without the search provider (2026-10-27)

Task: continue the master discovery from `e454722` under the standing
constraints — no push, no deploy, no production SQL, no GitHub authorization;
web_search quota-exhausted (one bounded probe this session returned HTTP 429;
the provider was then PAUSED, not spun against); Overpass blocked; Nominatim
and Wikipedia article pages reachable. Preserve the clean tree, all previous
evidence, the frozen Batch-012/013/014 name-drift guards, and stable ids.

What was built and run (`scripts/foodie-enrichment/research-tirupati-direct.ts`, new):

- `official2` — 7 new tirumala.org pages fetched (polite UA, 2.5 s spacing):
  4 real rate-table pages (Marriage halls & Cottages; Sri Padmavathi, Sri
  Venkateswara, VarahaSwami guest houses) + 3 URLs (garden.aspx,
  theerthams.aspx, varahaswamytirumala.aspx) that serve the site's default
  homepage shell for dead/retired links. Shell detection is CONTENT-based
  (generic title AND no rate-table marker) — three real pages also carry the
  generic `<title>`, so byte-size or title-only detection was rejected after
  it misclassified pages both ways.
- `wikipedia` — bounded 15-article set (≥4 s spacing; api.php 429 limitation
  recorded, article pages used instead). Extractor rebuilt three times, each
  step verified against a saved page: v1 leaked sidebar chrome into entries
  (whole-page whitespace collapse merged nav into the lede) — its junk output
  was DELETED, never used; v2 scoped to the article body but matched zero
  anchors (the served HTML uses absolute `https://en.wikipedia.org/wiki/…`
  hrefs with attributes before href, e.g. `rel="mw:WikiLink"`); v3 (final)
  handles both anchor forms, blocks namespace chrome first, uses local ±400
  sentence context with a ±1200 paragraph fallback for the locality gate
  (evidence tier recorded per entry), guards disambiguation pages (0 entries
  by rule), and adds the article SUBJECT as an entry (Wikipedia never
  self-links it) quoted from the first body sentence. Result: 494 entries,
  per-page samples verified (real places: Silathoranam/Natural Arch,
  Seshachalam Hills, Alipiri, Vedanarayana Temple, Swarnamukhi…).
- `extract-official2` — 42 TTD accommodation venue names parsed from the 4
  real rate tables (header/unit-description filters; display-name tail
  trimming with the verbatim quote always kept). These corroborate the
  batch-013 queued accommodation rows; they are NOT new candidates and are
  recorded as documentary evidence only.
- `crossmatch` — exact normalized-name match of the 174 verification-PENDING
  raw rows against the independent-source corpus (wikipedia + official2),
  same-area only. **6 pending rows received an independent-source locality
  confirmation** (crossmatch-*.json files): Kalyana Venkateswara Temple
  Narayanavanam, Kalyani Dam, Talakona, Ubbalamadugu Falls (all surrounding),
  Tirumala (tirumala), Tirupati (tpt-central). Verify stubs untouched on
  disk; skipped rows never change state; these files explicitly say they are
  NOT web_search identity verifications.
- `new-names` — review queue ONLY (352 unique corpus names): 41 corroborate
  existing inventory names, 53 weak partial overlaps, **133 genuinely new
  unverified leads** (5 HIGH / 92 MEDIUM / 36 LOW by proximity evidence in
  the quote). The queue states plainly that leads include unrelated places
  sharing article context (e.g. Khajuraho/Bhubaneswar temples cited in
  architecture comparisons); the verbatimQuote is the arbiter. Leads are NOT
  candidates anywhere and are counted nowhere.

Docs regenerated by the updated `gen-tirupati-docs.ts`: inventory (Batch-4
corroboration section; header corrected to 113 queued review rows incl.
Batch-014), source register (§6 batch-4 direct sources), coverage matrix
(batch-4 evidence + honest gaps), photo gaps (no photos added), duplicate
review unchanged. `docs/tirupati-discovery-worklog.md` appended by hand.

Quality gates: see the final gates line of this session's close-out.

Remaining gaps (unchanged and honestly carried forward):
- 168 of 174 pending rows remain pending (116 throttled stubs + never-
  attempted; resumable when the search quota resets; skipped stays skipped).
- Small food businesses (tiffin centres, tea stalls, messes, bakeries) could
  NOT be expanded this pass — accessible direct sources cover TTD
  accommodation/attractions/encyclopedic places only; recorded as a gap in
  the coverage matrix.
- 3 dead TTD URLs (homepage shells) recorded as limitations.
- ap.gov.in domains still network-blocked; Overpass blocked; Wikipedia api.php
  rate-limited from this egress IP.

---

## Batch-5 session (2026-10-29) — queue assessment + small-food discovery + Batch-015

Start state (verified, not assumed): HEAD = 692e75e (worklog commit) on top of a3b2911
(batch-4 discovery) on top of d99ba46 on top of e454722 — 8 commits ahead of origin/main
(8cb0a37). Working tree: 67 pre-existing file-mode changes (100755→100644 sandbox
artifacts) + 2 pre-existing untracked UI files (public/images/categories/,
src/components/foodie/IllustrationImage.tsx) — preserved untouched, never committed by
this session. The earlier report's "HEAD = e454722, 5 ahead of origin" was STALE; the
actual chain above is the recorded resolution.

What was actually done (all counts from committed evidence files):

1. Review-queue manual assessment — all 133 genuinely-new leads assessed ONE BY ONE
   on their exact quotations and source URLs (explicit decision table in
   batch5-assess-queue.ts; fail-loud if any lead lacks an entry):
   3 accepts, 18 corroborate-existing, 53 reject-generic, 54 reject-out-of-scope,
   5 ambiguous-keep-queue. ALL FIVE HIGH leads resolved without becoming candidates:
   Sri Kodandaramaswami Temple → corroborates existing Sri Kodanda Ramaswamy Temple
   (name drift); Zoo Park → corroborates existing Sri Venkateswara Zoological Park;
   Srikalahasti Temple → corroborates existing Srikalahasteeswara temple;
   "Hindu temple" → generic extraction; Kapileshwar Temple, Bihar → out of scope.

2. Tirumala gardens/teerthams gap closed from evidence ALREADY ON DISK: the saved
   official page places-around-tirumala.aspx (Places To Visit Around Tirumala)
   verbatim lists Swami Pushkarini, Sri Bhu Varaha Swamy temple, Sri Hathiramjee Mutt,
   Sri Bedi Anjaneya Swamy temple, Srivari Sikhara Darshanam, Sila Thoranam,
   Dharmagiri, Narayangiri, Papavinasanam, Akasa Ganga water falls, Temple Museum,
   Asthana Mandapams, Gogarbham Gardens + 11 teerthams + the "More Temples At
   Tirupathi" nav (incl. Srivari Padalamandapam Temple). 15 names accepted as
   candidates, 15 corroborated existing rows; NO new fetch needed; the dead
   garden.aspx/theerthams.aspx shells stay recorded as dead.

3. web_search RESUMED after ONE availability probe PASSED (batch5/websearch-probe.json;
   the provider recovered from the recorded 429). Bounded discovery: 19 locality×category
   queries (tiffin centres, tea stalls, messes, bakeries, sweet shops, juice shops,
   street food, family restaurants across tpt-central/tirumala/tiruchanur/renigunta/
   chandragiri/srinivasa-mangapuram/tpt-neighbourhoods) + 4 targeted queue-lead checks;
   8 s pacing; 0 throttles. Srinivasa Mangapuram query honestly returned 0 in-scope leads
   (all hits were other cities).

4. Nominatim: 12 bounded keyword POI queries inside the Tirupati viewbox (2 s spacing,
   custom UA) — 21 raw hits; published coordinates recorded in evidence ONLY.

5. Source failures recorded (never worked around): Wikivoyage HTTP 403; Wikipedia
   targeted re-fetches HTTP 429 (shared egress); Puttur stays ambiguous-queued (hits
   were Tirupati-generic or Karnataka namesakes); Vaikuntam Queue Complex + Siddeswara
   Swamy Temple + Venugopalaswamy Karvetinagaram resolved via web_search lead-checks
   instead (the latter then DOWNGRADED to corroboration when the dedupe gate proved the
   temple already exists in batch-013 — the gate fired exactly as designed).

6. Discovery-candidates ledger (batch5-discovery-candidates.ts, deterministic,
   fail-loud dedupe gates vs inventory + batches 011–014 + curated worksheet + queue
   corpus): **61 accepted candidates** (42 small food venues + 13 teerthams/attractions/
   temples + 1 guest house + others), 4 identity-HELD (Indira Guest House vs frozen
   batch-013 'Indira Rest House'; Reddy Tea Stall vs the Tirumala Tea-Stall pair; 2
   Balaji-name drift family), 38 weak leads (queue only, counted nowhere), 17
   corroborations of existing records.

7. Batch-015 review-candidate SQL generated (gen-insert-batch-015.ts, deterministic,
   byte-identical rerun verified): insert-batch-015-tptm-b5.sql — 42 restaurants +
   19 places (place types: temple 3, hotel 1, other 15); verification_status
   'unverified' everywhere; coordinates NULL on every row; guards parse and check
   against batches 011–014 id sets; preflight/postflight exact-count guards. NEVER
   executed by this repo.

8. Verification backlog RESUMED (bounded): 4 chunks × 12 = 48 rows attempted — 45
   area-confirmed (13 with address evidence), 3 not-confirmed (negative evidence),
   0 throttled. Backlog: 174 → 126 remaining (58 never-attempted + 68 throttled-stubs).

9. Docs regenerated by the extended gen-tirupati-docs.ts (deterministic, byte-identical
   rerun verified): inventory (Batch-5 assessment + Batch-015 sections), source register
   (§7 batch-5 sources incl. sources that REMAINED unusable), coverage matrix (Batch-5
   evidence; small-food gap explicitly re-labelled partially covered — directory/mapped-POI
   grade, not field-verified), duplicate review (§E batch-5 identity holds & name-drift
   flags). Worklog (this file) appended by hand.

Remaining gaps (honestly carried forward — NOT exhaustive, never claimed complete):
- 126 verification-backlog rows pending (58 never-attempted + 68 throttled-stubs).
- 38 weak leads + 5 original ambiguous leads + 4 identity-holds unresolved.
- Menus, hours, prices, photos: still no evidence captured for any queued row.
- Coverage is directory/mapped-POI grade for the 42 new food venues — no field
  verification, no operation-status proof beyond listing existence.

## Batch-6 session (2026-10-28) — Batch-015 audit + evidence strengthening + coverage gaps + Batch-016

Starting state verified: HEAD = 15644aa (auto-commit) on top of the Batch-5 commit 01b0937; working
tree clean; 10 commits ahead of origin/main. Nothing pushed, nothing deployed, no production SQL
executed, no GitHub authorization initiated.

1. Batch-015 AUDIT (objective 1; batch6-audit-b015.ts → batch6/b015-audit.json): all 61 proposed
   records cross-checked against the inventory proxy, curated worksheet (incl. rawNames aliases),
   pending batches 011–015, and the queue corpus. Checks: C1 canonical uuid5 ids recomputed (exact
   match against the SQL), C2 zero exact collisions, C3 slug uniqueness (incl. batches 012–014),
   C4 locality-suffix-in-own-quote, C5 name-drift scan (core tokens + frozen hold families), C6 SQL
   honesty (unverified/NULL-coordinates row-by-row). 17 deterministic flags, ALL explicitly
   adjudicated with recorded reasons. Verdict: 59 retained, 2 moved to the review queue —
   "Amma Appam, Renigunta" (the only quoted address is central-Tirupati G Car Street; the Renigunta
   label came from a category-page title) and "Radha Rani Tiffin Centre, Padmavathi Nagar"
   (category-page quote concatenates two different listings; area undecidable). Batch-015 SQL
   REGENERATED deterministically with 59 rows (40 restaurants + 19 places); sha256 4fa99309…
   Both moved rows keep full evidence in batch6/review-queue-batch6.json, counted nowhere.

2. LIVE production cross-check (objective 1 supplement; batch6-live-crosscheck.ts →
   batch6/live-crosscheck.json): read the ACTUAL production inventory through the app's own public
   read endpoint (read-only GET, publishable key, RLS applies — NO SQL executed, nothing written):
   86 live restaurant rows; all 61 candidates checked → 0 exact, 0 base-name, 0 loose token
   collisions. (lib/live.ts small robustness fix: a missing .env.local no longer crashes the
   documented public-env reader.)

3. Second-source evidence pass (objective 2; research-tirupati-batch6.ts evidence →
   batch6/food-second-sources.json + batch6-assess-second-sources.ts → …-assessment.json):
   ONE availability probe passed; 40 retained food venues × 1 bounded query (8 s pacing); 2 transient
   429/timeout errors retried cleanly on resume (query form fixed: base name quoted, locality
   unquoted). Result: 22 venues gained a SECOND INDEPENDENT source (5 map-directory, 8
   established-directory, 5 aggregator, 4 social), 8 same-host corroboration only, 10 none, 0 failed.
   Corroboration NEVER upgrades verification_status; 10 single-source rows stay honestly marked.
   T2 (mapped-POI-only) venues with a listing-grade second source flagged t2UpgradeSuggested for the
   owner — no tier change applied by script.

4. Verification backlog RESUMED (objective 3; research-tirupati-master.ts verify, 4 × 12 bounded
   chunks): 48 attempted — 47 area-confirmed (most with address evidence), 1 not-confirmed (negative
   evidence recorded), 1 infra-failed (parked, never counted as verified), 0 sustained throttles
   (2 transient 75 s backoffs recovered). Backlog: 126 → 79 (58 never-attempted + 21 throttled-stubs).
   Previous evidence and retry history preserved (resume semantics; completed records never overwritten).

5. Coverage-gap sweep (objective 4; research-tirupati-batch6.ts coverage + nominatim2): 18 bounded
   web_search queries over the weakest locality×category cells + 9 bounded Nominatim town queries.
   Wrong-city guard enforced on published coordinates (Kathmandu-Chandragiri cafés 27.7N/85.2E and
   Chennai-Perambur "Renigunta" restaurants 13.1N/80.1E rejected as out-of-scope). Honest still-zeros
   recorded for Srinivasa Mangapuram food, Tiruchanur restaurants, Renigunta non-chain stays.

6. Batch-6 ledger assembled (batch6-discovery-candidates.ts, fail-loud gates mirroring batch-5 +
   NEW base-name gate): 18 accepted candidates (8 food: Kakinada Subbbayya Gari Hotel / Aroma Coffee
   House / The Vintage Cafe [Kapila Teertham Road T2], Shree Dhaba House [Akkarampalli T1], Good Luck
   Family Dhaba [T1] + Sreenivasa Reddy Dhaba [T2] [Renigunta Locality], MSD Tiffin Centre +
   Kalahasteeswara Tiffens [Srikalahasti T1]; 10 places: Srinivasa Hotel [Srinivasa Mangapuram — own
   official site, T1], Sreekanth Lodge [Mangalam T1], Sun Lights Lodge [Tata Nagar T1], Kittu Home
   Stay [Chandragiri T2], Kandy PLR Hotel [Thondavada T2], Mgr/Raj/Kalahasteeswara Residency +
   APTDC Haritha Hotel [Srikalahasti T2], Srivari Mettu [Srinivasa Mangapuram T2]), 2 identity-HELD
   (Ganapathi Juice Center vs inventory 'Ganapathi Juice Shop'; Chillies Food Paradise vs 'Chillies
   Restaurant'), 21 weak leads queued-only, 4 corroborations (incl. the drift downgrade of "Sri
   Venkateshwara Bakery & Sweets, Bhavani Nagar" → locality-resolving corroboration of the frozen
   worksheet canonical "Sri Venkateshwara Bakery And Sweets", and OTC Orion / Padamavathi Tiffin /
   Kalyana Venkateswara Srinivasa Mangapuram re-finds downgraded by the gates).

7. Batch-016 review-candidate SQL generated (gen-insert-batch-016.ts, deterministic, byte-identical
   rerun verified): insert-batch-016-tptm-b6.sql — 8 restaurants + 10 places (place types: hotel 9,
   other 1); verification_status 'unverified' everywhere; coordinates NULL on every row; preflight
   checks batches 011–015 coherence + id/slug/name collisions; postflight exact-count guards. NEVER
   executed by this repo.

8. Docs regenerated by the extended gen-tirupati-docs.ts: inventory (Batch-6 audit + live cross-check
   + second-source + Batch-016 sections), source register (§8 batch-6 sources incl. hosts serving
   candidate-grade evidence and honest in-area zeros), coverage matrix (Batch-6 evidence with
   still-zeros and wrong-city guard), duplicate review (§F batch-6 drift review + new identity holds).
   Worklog (this file) appended by hand.

Remaining gaps (honestly carried forward — NOT exhaustive, never claimed complete):
- 79 verification-backlog rows pending (58 never-attempted + 21 throttled-stubs).
- Weak leads: 38 (batch-5) + 21 (batch-6) + 5 original ambiguous; identity-holds: 4 (batch-5) +
  2 (batch-6); 2 batch-015 audit moves await a venue-own source.
- Batches 011–016 ALL remain unexecuted owner review candidates — production unchanged.
- Menus, hours, prices, photos: still no evidence captured for any queued row.
- Kapila Teertham Road venues are zomato area-page T2 evidence; Srinivasa Mangapuram food coverage
  remains effectively zero in every source tried so far.

## Batch-7 session (2026-10-27/28) — launch directive: verification resume + Batch-017 eligibility review + SQL runtime-defect fix

Directive: carry FOODIE to a deployed, production-verified prototype. Preserve all work; bounded research; honest statuses; no destructive SQL; push/deploy only through legitimate authorization flows.

Work Log:
- Phase-1 state audit (all read-only): HEAD 47103a0 clean, origin/main 8cb0a37 (11 ahead), production healthy (86 restaurants = 80 Doddaballapura + 6 Tirupati; places 0; destinations 3; destination_foods 5; push_subscriptions + review_candidates tables ABSENT → migrations 005/010 never applied). Sandbox has NO Supabase write credentials (anon key only; DATABASE_URL = local SQLite) → batch execution remains an owner action by design.
- Bounded verification resume (web_search provider LIVE again; chunks 6/12/12/12/8/6 with resume semantics, circuit breaker, Retry-After honoured): 60 rows resolved — 58 area-confirmed mostly with address evidence, 2 re-attempted stubs completed, 2 transient infra-fails parked (never counted as verified), 0 sustained throttles. Backlog 79 → 19 verifyPending (worksheet summary); 306/351 rows area-confirmed.
- Verification upgrades broke the forward-drift gate (correctly): T1 89 → 204, eligible-not-batched rows surfaced. Remedy per the established pipeline: full eligibility review of every newly-eligible row.
- BATCH-017 eligibility review (82 admits / 6 holds / 22 drops, all recorded):
  * 53 restaurants (restaurant 7, tiffin 17, street_food 7, bakery_sweets 19, cafe 3) + 29 places (temple 9, other 17, waterfall 1, hotel 2) = 82 rows;
  * 6 identity-HELD: Ganapathi Juice Shop + Ganesh Juice Center (Tilak Road drift cluster vs frozen b14 'Ganesh Juice Corner'), Varasiddi Vinayaka Swamy Temple (spelling cluster), Vinayaka Temple Tirumala (generic), Tirumala Mandir (ambiguous vs main temple), Lepakshi Handicrafts Emporium (two branches);
  * 22 DROPS with reasons in curate-tirupati-master.ts GENERIC_PATTERNS (articles, topic/seva pages, truncated titles, area pages, one product ad, Holiday-Inn sub-listing, SV Temple Amaravathi out-of-scope, 'Tada Falls' duplicate alias of Ubbalamadugu Falls);
  * 2 curation mis-derivations corrected fail-loud in the generator: 'kids zone' place_type 'fort' → 'other'; 'ubbalamadugu falls' fallback 'other' → 'waterfall' (evidence-backed);
  * surrounding destinations (Nagari ×3 temples, Kalyani Dam, Horsley Hills, Ubbalamadugu/Tada) carry explicit '(surrounding destination)' locality labels + tag — never folded into the city;
  * gen-insert-batch-017.ts → insert-batch-017-tptm-b7.sql sha256 bff810cd…, verify probe 5c471513…; byte-identical reruns verified; preflight guards batches 011-016 coherence; NOT executed.
- REAL DEFECT found and fixed across ALL tptm batches 012-016: the preflight/verify `id in (...)` lists interpolated BARE (unquoted) uuid literals → executing any of these batches would abort with a syntax error at the first preflight check (fail-loud, so never a data risk — but un-runnable). Fixed every generator (quoted `'uuid'` lists), regenerated 012-016; diff vs HEAD is EXACTLY the quoting lines (0 tuple changes); added a permanent regression test scanning every insert-batch-*.sql.
- Frozen drift-guard preserved: gen-013 now carries FROZEN_NAME_OVERRIDES so the queued row keeps 'Tirumala Balaji Sweets -' (frozen justdial-truncation name, id 6c8eeb7d…) while the cleaned worksheet canonical stays unbatched — caught by the eligibility gate when a naive regeneration silently swapped the names; a new test pins the dash row.
- Test suite extended 170 → 186 (+16): batches 015/016/017 integrity gates (previously 015/016 had NO in-suite gates), quoted-uuid regression gate, frozen-name pin, unverified-count region checks, surrounding-locality labels.
- Gates: 186/186 tests, lint 0, tsc 0 (project code), full-family determinism (two consecutive regenerations of 012-017 byte-identical), secret scans clean.
- Honest limits: batch SQL execution still owner-side (no write credentials in sandbox); migrations 005/010 unapplied in production; remaining 19 verifyPending rows are the hard tail (mostly T3 tier); web_search availability is quota-dependent; nothing pushed, nothing deployed, no production SQL executed this session (yet).
