# Foodie — Restaurant Import Dry-Run Report

**Mode:** dry-run (read-only) · **Tool:** foodie-restaurant-import-validator v1.1.0

## Run context

| Item | Value |
| --- | --- |
| Input file | `/home/z/my-project/scripts/foodie-import-validator/fixtures/test-valid.json` |
| Input sha256 | `f1a281d3e773830b0db3c0de6aa1e67cd22359e89902eba352ca805107988ef4` |
| Rows in input | 3 |
| Baseline source | snapshot |
| Baseline file | `/home/z/my-project/scripts/foodie-import-validator/fixtures/baseline-snapshot.json` |
| Baseline sha256 | `f7faa45a2eb88464072bb87fbb9824ae76fefcd7fe37e435407e082ed6e9117a` |
| Baseline fetched at | 2026-10-09T14:23:36.907Z |
| Baseline rows (existing restaurants) | 14 |

## Summary

| Bucket | Rows |
| --- | ---: |
| 1. Potential new businesses | 2 |
| 2. Existing-record matches | 0 |
| 3. Possible duplicates / ambiguous | 1 |
| 4. Insufficient evidence | 0 |
| 5. Invalid or missing data | 0 |
| 6. Candidate coordinates awaiting confirmation (cross-cutting) | 1 |
| **Total rows** | **3** |
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

## Potential new businesses (2)

### Row 1: Lotus Leaf Cafe

- **Confidence:** medium
- **Input:** address: Shop 3, NH-207 service road, Nagadenahalli · locality: Nagadenahalli · city: Doddaballapura · phone: +91 98765 43210 · coords: 13.2841, 77.6009 · source: https://directory.example.com/lotus-leaf-cafe · listing_rating: 4.4 · checked_on: 2026-10-09 · evidence: directory_reported
- **Coordinates awaiting confirmation:** 13.2841, 77.6009 — evidence level: directory_reported · source: https://directory.example.com/lotus-leaf-cafe. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Recommended initial verification_status:** unverified

### Row 2: Nagadenahalli Bake Studio

- **Confidence:** medium
- **Input:** address: Survey 42, Bashettihalli main road · locality: Bashettihalli · city: Doddaballapura · coords: 13.2701, 77.5531 · source: https://field-notes.example.com/bake-studio-gps · evidence: independently_confirmed
- **Recommended initial verification_status:** unverified

## Existing-record matches (no action taken — never auto-merged) (0)

_None._

## Possible duplicates / ambiguous — MANUAL REVIEW REQUIRED (1)

### Row 3: Kiran Cha House

- **Confidence:** medium
- **Input:** address: Railway Station Road · city: Doddaballapura · phone: 080 8859 9999
- **Flags:** `SAME_PHONE_DIFFERENT_NAME`
- **Recommended initial verification_status:** unverified

## Insufficient evidence (0)

_None._

## Invalid or missing data (0)

_None._

## 6. Candidate coordinates awaiting confirmation (1)

Every pin below stays a CANDIDATE until its relationship to the exact business is independently confirmed. A directory-published pin or a map-search result is NOT proof of an exact coordinate.

| Row | Candidate | Bucket | Coordinates | Evidence | Source URL |
| ---: | --- | --- | --- | --- | --- |
| 1 | Lotus Leaf Cafe | potential_new | 13.2841, 77.6009 | directory_reported | https://directory.example.com/lotus-leaf-cafe |

## Next step

Nothing has been imported. Resolve rows flagged for manual review, fix invalid rows, then re-run this validator until the report is clean. Only after explicit human approval may an import be prepared — via a reviewed SQL/insert path, never by this tool.
