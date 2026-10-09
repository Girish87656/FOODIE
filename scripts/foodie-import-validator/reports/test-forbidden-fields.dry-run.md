# Foodie — Restaurant Import Dry-Run Report

**Mode:** dry-run (read-only) · **Tool:** foodie-restaurant-import-validator v1.1.0

## Run context

| Item | Value |
| --- | --- |
| Input file | `/home/z/my-project/scripts/foodie-import-validator/fixtures/test-forbidden-fields.json` |
| Input sha256 | `ed6ad1a88e0535ce278c7e8a36568c35f7ee62c884b86f0bf382c4ad755a245e` |
| Rows in input | 4 |
| Baseline source | snapshot |
| Baseline file | `/home/z/my-project/scripts/foodie-import-validator/fixtures/baseline-snapshot.json` |
| Baseline sha256 | `e9968f0ef90ddbb1db0e6bec4f34a23c50dcfad00f07c27df9489136b6e7a768` |
| Baseline fetched at | 2026-10-09T15:57:25.231Z |
| Baseline rows (existing restaurants) | 14 |

## Summary

| Bucket | Rows |
| --- | ---: |
| 1. Potential new businesses | 1 |
| 2. Existing-record matches | 0 |
| 3. Possible duplicates / ambiguous | 0 |
| 4. Insufficient evidence | 0 |
| 5. Invalid or missing data | 3 |
| 6. Candidate coordinates awaiting confirmation (cross-cutting) | 1 |
| **Total rows** | **4** |
| Validation errors | 4 |
| Validation warnings | 2 |

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

## Potential new businesses (1)

### Row 4: Rating No Source Cafe

- **Confidence:** low
- **Input:** address: Bashettihalli · city: Doddaballapura · listing_rating: 4.8
- **Issues:**
  - `WARN` **LISTING_RATING_WITHOUT_SOURCE** (listing_rating): An external listing rating is present without any source (source_url / rating_source_url / maps_listing_url) — evidence without provenance. Add a source or drop the rating.
  - `WARN` **RATING_WITHOUT_CHECK_DATE** (rating_checked_on): An external rating/review count was captured without rating_checked_on — record the date you read it so staleness can be judged later.
- **Recommended initial verification_status:** unverified

## Existing-record matches (no action taken — never auto-merged) (0)

_None._

## Possible duplicates / ambiguous — MANUAL REVIEW REQUIRED (0)

_None._

## Insufficient evidence (0)

_None._

## Invalid or missing data (3)

### Row 1: Trigger Field Cafe

- **Confidence:** none
- **Input:** address: Nagadenahalli · city: Doddaballapura
- **Issues:**
  - `ERROR` **FORBIDDEN_SYSTEM_FIELD** (community_rating): "community_rating" (value "4.5") is maintained by database triggers (migration-005) and can never be provided by an import. Remove the column/value.
  - `ERROR` **FORBIDDEN_SYSTEM_FIELD** (review_count): "review_count" (value "12") is maintained by database triggers (migration-005) and can never be provided by an import. Remove the column/value.
- **Recommended initial verification_status:** unverified

### Row 2: Selfie Pin Cafe

- **Confidence:** none
- **Input:** address: NH-207 · city: Doddaballapura · coords: 13.2842, 77.6010 · source: https://directory.example.com/selfie-pin · evidence: directory_reported
- **Coordinates awaiting confirmation:** 13.2842, 77.601 — evidence level: directory_reported · source: https://directory.example.com/selfie-pin. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Issues:**
  - `ERROR` **UNSUPPORTED_VERIFICATION_CLAIM** (coordinates_verified): coordinates_verified=true requires evidence_level=independently_confirmed AND a source_url. A directory listing (or no provenance at all) never verifies a pin.
- **Recommended initial verification_status:** unverified

### Row 3: Pretend Verified Biryani

- **Confidence:** none
- **Input:** address: Railway Station Road · city: Doddaballapura
- **Issues:**
  - `ERROR` **UNSUPPORTED_VERIFICATION_CLAIM** (verification_status): Import candidates cannot enter as 'verified'. Verification is granted by a human after on-site/phone confirmation, never by an import file.
- **Recommended initial verification_status:** unverified

## 6. Candidate coordinates awaiting confirmation (1)

Every pin below stays a CANDIDATE until its relationship to the exact business is independently confirmed. A directory-published pin or a map-search result is NOT proof of an exact coordinate.

| Row | Candidate | Bucket | Coordinates | Evidence | Source URL |
| ---: | --- | --- | --- | --- | --- |
| 2 | Selfie Pin Cafe | invalid_data | 13.2842, 77.601 | directory_reported | https://directory.example.com/selfie-pin |

## Next step

Nothing has been imported. Resolve rows flagged for manual review, fix invalid rows, then re-run this validator until the report is clean. Only after explicit human approval may an import be prepared — via a reviewed SQL/insert path, never by this tool.
