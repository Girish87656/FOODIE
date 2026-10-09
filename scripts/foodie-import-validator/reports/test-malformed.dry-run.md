# Foodie — Restaurant Import Dry-Run Report

**Mode:** dry-run (read-only) · **Tool:** foodie-restaurant-import-validator v1.1.0

## Run context

| Item | Value |
| --- | --- |
| Input file | `/home/z/my-project/scripts/foodie-import-validator/fixtures/test-malformed.json` |
| Input sha256 | `fda5bcf4a8c2f5c780f04bc9199f98cfe07b13937a4ed94e150a85bc045a9caf` |
| Rows in input | 11 |
| Baseline source | snapshot |
| Baseline file | `/home/z/my-project/scripts/foodie-import-validator/fixtures/baseline-snapshot.json` |
| Baseline sha256 | `c6e1ae03b7a424635f4f2715563a9e9009fcf61df6e94416f70c0bf941314bb2` |
| Baseline fetched at | 2026-10-09T16:08:02.732Z |
| Baseline rows (existing restaurants) | 14 |

## Summary

| Bucket | Rows |
| --- | ---: |
| 1. Potential new businesses | 1 |
| 2. Existing-record matches | 0 |
| 3. Possible duplicates / ambiguous | 0 |
| 4. Insufficient evidence | 0 |
| 5. Invalid or missing data | 10 |
| 6. Candidate coordinates awaiting confirmation (cross-cutting) | 1 |
| **Total rows** | **11** |
| Validation errors | 12 |
| Validation warnings | 1 |

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

### Row 11: Corridor Diner

- **Confidence:** medium
- **Input:** coords: 12.7001, 77.7001 · source: https://ok.example.com/corridor · notes: VALID coords but south of the pilot bbox -> OUTSIDE_PILOT_CORRIDOR warning; row itself remains potential_new
- **Coordinates awaiting confirmation:** 12.7001, 77.7001 — evidence level: directory_reported · source: https://ok.example.com/corridor. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Issues:**
  - `WARN` **OUTSIDE_PILOT_CORRIDOR** (latitude/longitude): Coordinates are outside the GITAM–Doddaballapura pilot corridor (lat 12.8-13.6, lng 77.2-78). Valid for other regions, but expected to be rare in this pilot.
- **Recommended initial verification_status:** unverified

## Existing-record matches (no action taken — never auto-merged) (0)

_None._

## Possible duplicates / ambiguous — MANUAL REVIEW REQUIRED (0)

_None._

## Insufficient evidence (0)

_None._

## Invalid or missing data (10)

### Row 1: Bad Lat Cafe

- **Confidence:** none
- **Input:** coords: 999.0, 77.601 · source: https://ok.example.com/bad-lat · notes: latitude 999 -> INVALID_COORDINATES (out of [-90,90])
- **Issues:**
  - `ERROR` **INVALID_COORDINATES** (latitude): latitude 999 outside latitude range [-90, 90]. Kept as null.
- **Recommended initial verification_status:** unverified

### Row 2: Bad Lng Cafe

- **Confidence:** none
- **Input:** coords: 13.2841, not-a-number · source: https://ok.example.com/bad-lng · notes: longitude not numeric -> INVALID_COORDINATES
- **Issues:**
  - `ERROR` **INVALID_COORDINATES** (longitude): longitude "not-a-number" is not a number. Kept as null.
- **Recommended initial verification_status:** unverified

### Row 3: Swapped Pin Diner

- **Confidence:** none
- **Input:** coords: 77.5512, 13.2843 · source: https://ok.example.com/swap · notes: both values inside the other's India range -> INVALID_COORDINATES + COORDINATES_SWAPPED
- **Issues:**
  - `ERROR` **INVALID_COORDINATES** (latitude): latitude 77.5512 looks like an Indian longitude, not a latitude — possible lat/lng swap. Kept as null.
  - `ERROR` **INVALID_COORDINATES** (longitude): longitude 13.2843 looks like an Indian latitude, not a longitude — possible lat/lng swap. Kept as null.
  - `ERROR` **COORDINATES_SWAPPED** (latitude/longitude): Both values fall inside the other's India range — this looks like a lat/lng swap. Fix the source file; the tool will not swap them automatically.
- **Recommended initial verification_status:** unverified

### Row 4: Bad Phone House

- **Confidence:** none
- **Input:** phone: 12345 · notes: phone 12345 -> INVALID_PHONE
- **Issues:**
  - `ERROR` **INVALID_PHONE** (phone): "12345" is not a valid Indian number (unexpected digit count (5 digits after normalization)). Kept as null.
- **Recommended initial verification_status:** unverified

### Row 5: Zero Start Cafe

- **Confidence:** none
- **Input:** phone: 0123456789 · notes: 10 digits starting 0 after STD strip -> INVALID_PHONE
- **Issues:**
  - `ERROR` **INVALID_PHONE** (phone): "0123456789" is not a valid Indian number (10-digit numbers cannot start with 0 or 1). Kept as null.
- **Recommended initial verification_status:** unverified

### Row 6: Bad URL Store

- **Confidence:** none
- **Input:** source: htp://missing-slash.example.com · notes: scheme not http(s) -> INVALID_URL
- **Issues:**
  - `ERROR` **INVALID_URL** (source_url): "htp://missing-slash.example.com" is not a valid http(s) URL. Kept as null.
- **Recommended initial verification_status:** unverified

### Row 7: Bad Evidence Villa

- **Confidence:** none
- **Input:** evidence: maybe · notes: evidence_level maybe -> INVALID_EVIDENCE_LEVEL
- **Issues:**
  - `ERROR` **INVALID_EVIDENCE_LEVEL** (evidence_level): "maybe" is not one of: directory_reported, independently_confirmed.
- **Recommended initial verification_status:** unverified

### Row 8: Bad Hours Dhaba

- **Confidence:** none
- **Input:** notes: hours out of range -> INVALID_HOURS
- **Issues:**
  - `ERROR` **INVALID_HOURS** (opening_hours): "26:00-99:99" has an out-of-range hour or minute.
- **Recommended initial verification_status:** unverified

### Row 9: Bad Price Mess

- **Confidence:** none
- **Input:** notes: price Rs -> INVALID_PRICE_LEVEL
- **Issues:**
  - `ERROR` **INVALID_PRICE_LEVEL** (price_level): "Rs" is not one of: ₹, ₹₹, ₹₹₹.
- **Recommended initial verification_status:** unverified

### Row 10: Bad Category Spot

- **Confidence:** none
- **Input:** notes: category dhaba -> INVALID_CATEGORY (7 pilot categories)
- **Issues:**
  - `ERROR` **INVALID_CATEGORY** (category): "dhaba" is not one of: restaurant, hotel, tiffin, cafe, fast_food, street_food, bakery_sweets.
- **Recommended initial verification_status:** unverified

## 6. Candidate coordinates awaiting confirmation (1)

Every pin below stays a CANDIDATE until its relationship to the exact business is independently confirmed. A directory-published pin or a map-search result is NOT proof of an exact coordinate.

| Row | Candidate | Bucket | Coordinates | Evidence | Source URL |
| ---: | --- | --- | --- | --- | --- |
| 11 | Corridor Diner | potential_new | 12.7001, 77.7001 | directory_reported | https://ok.example.com/corridor |

## Next step

Nothing has been imported. Resolve rows flagged for manual review, fix invalid rows, then re-run this validator until the report is clean. Only after explicit human approval may an import be prepared — via a reviewed SQL/insert path, never by this tool.
