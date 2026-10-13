# Foodie — Round 4 Research Log (Part 2)

**Date:** 2026-10-11 · **Method:** systematic continuation of the round-3 enumeration via the channels proven accessible from this sandbox; every claim below is backed by a raw artifact saved under `tool-results/research4/` (gitignored) or by a committed file listed at the end.

---

## 1. Access situation (re-probed this session, evidence in `tool-results/research4/logs/access-probes.log`)

| Channel | Status |
| --- | --- |
| z-ai gateway `web_search` / `page_reader` / `image_search` | **HTTP 429 all session** (same quota exhaustion as round 3; probes at 10:26–10:28 UTC) |
| Bing (curl, `mkt=en-IN`, headless browser) | **Unusable** — HTTP 200 but serves canned/irrelevant content unrelated to the query (VN-food / Zhihu / history pages) = soft bot-wall |
| DuckDuckGo (html + lite) / Mojeek | connection failure (http 000) |
| Ecosia | HTTP 403 |
| Yandex search | HTTP 302 captcha redirect |
| Overpass (OSM) | connection failure; kumi mirror HTTP 500; Nominatim 403 (policy) |
| **district.in** (robots-declared sitemaps + venue pages) | **works** (proven round 3, re-verified) |
| **magicpin.in** (robots-declared sitemaps + store pages) | **works** — 804 pages fetched this round |
| Wikimedia Commons / Openverse APIs | worked in round 3 (`photos3`); not re-queried for existing places (0-match result stands) |

A checkpointed Bing runner (`scripts/research4-bing-runner.ts`) was built and ran 5 queries before the soft-wall was identified; it was stopped and its garbage output quarantined (never parsed into any worksheet). Kept committed as methodology documentation.

## 2. district.in rescan → **no new venues exist in the current sitemap**

- `sitemap-dining.xml` is now an index of 8 region-sharded `sitemap-restaurant-pagesN.xml.gz` files (regenerated, lastmod **2026-09-28** — i.e. BEFORE round 3's fetches of 2026-10-09/10).
- All 8 shards downloaded and scanned (50,000 locs each): NCR, Kolkata, **Bangalore**, Chennai, … The Bangalore shard (50k URLs) contains **ZERO** Doddaballapura-area venue URLs; 2 area-token hits in the Kolkata shard are false-positive slug collisions. Full evidence: `tool-results/research4/district-rescan.json`, `logs/district-rescan.log`.
- Town listing pages (`/dining/doddaballapura` + 3 variants) → **HTTP 404** — the area listing page no longer exists either.
- **Conclusion:** the round-3 dataset of 93 district venue pages (raw saved in `tool-results/research3/sitemap/`) remains the COMPLETE district.in coverage of the area. 0 new district venues. 0 district candidates lost.

## 3. magicpin corridor continuation — the 806-store inventory systematically fetched

- All **804 store pages fetched** (806 minus 2 already captured in round 3); 10 returned non-200 (dead listings, recorded honestly in `index.json` with http=0/actual code). ~800 pages carry a full `Restaurant` JSON-LD block.
- Fields published across the fetched corpus: **phone 585 · geo 800 · opening-hours spec 713 · image 800**.
- Runner: `scripts/research4-direct-runner.ts` (checkpointed, idempotent, 3-worker, polite spacing; raw HTML per page under `tool-results/research4/magicpin-stores/`).

## 4. Cross-match (advisory; `scripts/research4-crossmatch.ts` → `cross-match.json`, `cross-match-report.md`)

- 309 of the fetched listings match something already known (live 14 / district 93 / round-3 worksheet 127) by name-normalization, phone (last-10-digits) or geo <150 m.
- 491 have no match → single-source leads.
- **Epicruise / Hangouts / GITAM / Epicurus probes across the whole fetched corpus (listed names + URLs):**
  - `"epicruise"` → **0 hits**
  - `"epicurus"` → 0 hits in the corridor inventory (the two Epicurus branch pages used by round 3 live outside it and remain committed in `tool-results/research3/branches/`)
  - `"gitam"` → 0 hits (the campus canteen/cafe are JD-only listings — unchanged)
  - `"hangout"` → 1 hit: **Hangout @ Nandi, Nandi Hills** — a different business ~20 km east in the tourism zone, NOT a GITAM-area "Hangouts"

## 5. Identity decisions taken this round (all documented in the worksheet)

| Row | Decision | Evidence |
| --- | --- | --- |
| r36 **Lounge de La Réserve** | `needs_more_research` → **`distinct_new_business`** | district + magicpin listings share the **identical phone** +916366946331 AND **identical pin** 13.286726,77.5824616 (both re-read 2026-10-11); the magicpin 'Bashettihalli' area label is a filing quirk. External rating 2.8/1 recorded with source + check date. |
| r64 **The Monkey House** | rating **corrected** (cleared) | The magicpin listing used in round 3 as the rating source (2.9/6) is a DIFFERENT branch: pin 13.1698,77.5674 (Rajanukunte) vs the district town pin 13.2948,77.5400 — ~14 km apart, different phone. Misattributed external rating/listing count/hours cleared; never kept under the wrong business. Rajanukunte listing recorded as its own single-source lead row. |
| r67 **Udupi Garden Hotel** | rating **corrected** (cleared) | Same situation: magicpin Rajanukunte listing (3.8/210, pin 13.1674,77.5648) is ~11 km from the district pin 13.2648,77.5528 with a different phone — a different branch. Cleared; documented. |

**Epicruise/Epicurus final statement (target item):** "Epicruise" has **no listing in any accessible directory**: round 3's full district URL inventory (447k URLs) and magicpin shards contained zero occurrences, and this round's 804-page store corpus + Bing (garbage-walled, unusable) add no counter-evidence. The GITAM-area must-target venue is **Epicurus Multi Cuisine Restaurant (Nagadenahalli/Munilakshmamma branch)** — a multi-branch brand whose other branches (Soladevanahalli 101 MSPP, HSR Haralur, Soundarya Layout) explain all earlier "platforms disagree" conflicts. It is in the import package as its OWN row (batch-005, UUID `7409bf48…`, exact source spelling, uncertainty documented) — nothing was renamed and no business was substituted. If the user's "Epicruise" is a separate business, no remote directory lists it under that spelling; it stays flagged for an on-site check.

**Hangouts final statement (target item):** no verifiable listing for a GITAM-area "Hangouts" exists in any accessible source (round-2 JD/Snapchat sweeps, round-3 directory indexes, round-4 magicpin corpus). The only same-name hit is out-of-zone (Nandi Hills). Remains honestly unresolved: the requested place either has no web listing or the spelling differs; nothing was invented to fill the gap.

## 6. Round-4 worksheet + import package

- `input/research-worksheet-round4.csv` — **551 rows** = round-3's 127 (3 rows evidence-updated per §5) + **424 verbatim single-source lead rows** (7 target-zone areas: Doddaballapur, Bashettihalli, Soladevanahalli, Nagenahalli, Hessarghatta-Road, Doddaballapur-Road, Rajanukunte; Nandi-Hills tourism zone excluded). sha256 `c9f648ff576fdcb4…`.
- Validator dry-run `reports/research-2026-10-11-round4.dry-run.{md,json}`: **551 rows → 0 errors · 0 warnings**; idempotency re-proven (double run → byte-identical report, sha256 `387bd6d967d14bce…`).
- Import package `supabase/insert-batch-006-round4-1.sql` (generator `gen-import-sql-round4.ts`, manifest `round4-import-manifest.json`): **1 new row** — Lounge de La Réserve — additive-only, triple-guarded (fixed UUIDv5 `4923568a…` / normalized name / phone), preflight (14-name + count-window 14..76 covering pre/post batch-005 states), postflight honesty checks, COMMIT + commented emergency revert. sha256 `08aea685fa4e12af…`. Parses clean with sqlglot (postgres dialect; DO blocks same structure as reviewed batch-003/005). Byte-identical on re-run.
- The other 62 `distinct_new_business` rows of the worksheet are ALREADY covered by the reviewed `insert-batch-005-round3-62.sql` and are deliberately NOT re-emitted (no duplicated review history).

## 7. Photos (target item 2)

- **0 photos imported — same honest outcome as round 3, now with a deeper evidence base.** The 24 Commons + 24 Openverse queries + Mapillary probe (round 3) found no licensable business-matched image for this zone; the only photos that exist for these businesses are hosted by their directory listings (magicpin/district CDNs) with **no stated license → usage rights unclear → left unset** per the task rules.
- New artifact `tool-results/research4/photo-evidence.json` (generator `scripts/research4-photo-evidence.ts`): **57 of the 63 package places have a listing photo recorded** (URL + listing page), 6 have none — recorded as evidence for a future human licensing decision, NOT imported.
- **The attribution pipeline shipped** so licensing metadata can be preserved and rendered the day a legitimately usable photo exists: `supabase/migration-006-photo-licensing.sql` (additive `source_url` / `license` / `attribution` on `restaurant_photos`, all nullable, idempotent) + data-layer support (`PhotoRecord`, `Place.photoCredits` in mappers/backend) + UI attribution chips on the detail-page hero and gallery (rendered ONLY from stored values, never invented). Photo load-failure fallbacks and the honest "No photos added yet" empty state were already shipped in Part 1 and are re-verified this round.

## 8. What this round does NOT claim

- **Zero live-database writes.** The write path (Supabase SQL Editor / service key) is not available from this sandbox; batch-005 (62 rows) and batch-006 (1 row) remain ready-to-run, additive, idempotent packages. Production still serves the 14 baseline rows (fresh read-only baseline re-verified this round: 14 rows, all `unverified`).
- The 424 lead rows are single-source leads — they are NOT importable under WORKFLOW rule 6 and are not claimed to be.
- Counts above are the actual unique counts, not estimates.

## 9. Committed artifacts from this round

- `scripts/research4-bing-runner.ts` · `scripts/research4-district-rescan.ts` · `scripts/research4-direct-runner.ts` · `scripts/research4-crossmatch.ts` · `scripts/research4-worksheet-round4.ts` · `scripts/research4-photo-evidence.ts`
- `scripts/foodie-import-validator/input/research-worksheet-round4.csv`
- `scripts/foodie-import-validator/reports/research-2026-10-11-round4.dry-run.{md,json}` · `reports/round4-import-manifest.json`
- `scripts/foodie-import-validator/gen-import-sql-round4.ts`
- `supabase/insert-batch-006-round4-1.sql` · `supabase/migration-006-photo-licensing.sql`
- Raw fetch corpus (804 pages, indexes, logs): `tool-results/research4/` (gitignored, reproducible via the committed runners)
