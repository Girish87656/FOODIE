# Foodie — Restaurant Import Dry-Run Report

**Mode:** dry-run (read-only) · **Tool:** foodie-restaurant-import-validator v1.1.0

## Run context

| Item | Value |
| --- | --- |
| Input file | `/home/z/my-project/scripts/foodie-import-validator/fixtures/test-duplicates.json` |
| Input sha256 | `ff62fec9dfe001144aed4a211030c9c60602fbd2433bd7e34c7681c9888e8dac` |
| Rows in input | 5 |
| Baseline source | snapshot |
| Baseline file | `/home/z/my-project/scripts/foodie-import-validator/fixtures/baseline-snapshot.json` |
| Baseline sha256 | `e9968f0ef90ddbb1db0e6bec4f34a23c50dcfad00f07c27df9489136b6e7a768` |
| Baseline fetched at | 2026-10-09T15:57:25.231Z |
| Baseline rows (existing restaurants) | 14 |

## Summary

| Bucket | Rows |
| --- | ---: |
| 1. Potential new businesses | 0 |
| 2. Existing-record matches | 3 |
| 3. Possible duplicates / ambiguous | 2 |
| 4. Insufficient evidence | 0 |
| 5. Invalid or missing data | 0 |
| 6. Candidate coordinates awaiting confirmation (cross-cutting) | 0 |
| **Total rows** | **5** |
| Validation errors | 0 |
| Validation warnings | 0 |

## Policy enforced by this run

- DRY RUN ONLY — this tool performs ZERO database writes: it has no insert/update/delete code path and reads the existing records with a single GET using the public publishable key.
- Existing-record matches are reported for human review; nothing is merged, updated or created.
- Every coordinate in the input is a CANDIDATE until independently confirmed against the exact business; directory pins are never treated as confirmed GPS evidence.
- coordinates_verified can never be set from a third-party directory listing; the tool rejects unsupported verification claims outright.
- Missing coordinates, phone numbers, opening hours, prices, photos and menu data stay NULL — the tool never invents values.
- External listing ratings (listing_rating + source_url) are kept strictly separate from Foodie community reviews (review_count / community_rating), which are trigger-maintained in the database and rejected if present in an import.
- Recommended initial verification_status for any future import is 'unverified'; 'verified' can only be granted by human review.
- A Google Maps listing URL (maps_listing_url) documents the listing only — it never verifies a coordinate, and a search-results URL is flagged because it identifies no business.
- External rating/review counts (listing_rating, listing_review_count) require a source and a check date (rating_checked_on); they stay strictly separate from Foodie community reviews.
- review_decision records the human duplicate-review decision verbatim — it never overrides the tool's matching and never triggers a database action.
- Reports are deterministic (no timestamps): same input + same baseline snapshot ⇒ byte-identical report (idempotent re-runs).

## Potential new businesses (0)

_None._

## Existing-record matches (no action taken — never auto-merged) (3)

### Row 3: SS Hyderabadi Biriyani Zone

- **Confidence:** high
- **Input:** address: Nagadenahalli · city: Doddaballapura
- **Matches to existing records:**
  - `f37d212b` **SS Hyderabadi Biriyani Zone** · locality: Nagadenahalli — similarity 1 (name-exact) · existing coords: 13.2846389, 77.6011256 — confidence high
- **Intra-file duplicates:** rows 4 — both entries stay separate; a human must decide.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 4: SS Hyderabadi Biryani Zone

- **Confidence:** medium
- **Input:** address: Nagadenahalli · city: Doddaballapura
- **Matches to existing records:**
  - `f37d212b` **SS Hyderabadi Biriyani Zone** · locality: Nagadenahalli — similarity 0.963 (name-fuzzy-0.96) · existing coords: 13.2846389, 77.6011256 — confidence medium
- **Intra-file duplicates:** rows 3 — both entries stay separate; a human must decide.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 5: Amigos

- **Confidence:** high
- **Input:** address: Nagadenahalli · city: Doddaballapura
- **Matches to existing records:**
  - `973a6f0e` **Amigos Cafe** · locality: Nagadenahalli — similarity 0.99 (name-subset) · existing coords: 13.2845564, 77.5966293 — confidence high
- **Recommended initial verification_status:** unverified

## Possible duplicates / ambiguous — MANUAL REVIEW REQUIRED (2)

### Row 1: Sunrise Juice Center

- **Confidence:** medium
- **Input:** address: NH-207, Nagadenahalli · city: Doddaballapura
- **Intra-file duplicates:** rows 2 — both entries stay separate; a human must decide.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 2: Sunrise Juice Center

- **Confidence:** medium
- **Input:** address: NH-207 near GITAM gate · city: Doddaballapura
- **Intra-file duplicates:** rows 1 — both entries stay separate; a human must decide.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

## Insufficient evidence (0)

_None._

## Invalid or missing data (0)

_None._

## 6. Candidate coordinates awaiting confirmation (0)

_None — either no coordinates were supplied, or every coordinate row already claims independently-confirmed evidence with a source URL (claims are recorded, never auto-trusted)._

## Next step

Nothing has been imported. Resolve rows flagged for manual review, fix invalid rows, then re-run this validator until the report is clean. Only after explicit human approval may an import be prepared — via a reviewed SQL/insert path, never by this tool.
