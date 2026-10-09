# Foodie — Restaurant Import Dry-Run Report

**Mode:** dry-run (read-only) · **Tool:** foodie-restaurant-import-validator v1.1.0

## Run context

| Item | Value |
| --- | --- |
| Input file | `/home/z/my-project/scripts/foodie-import-validator/fixtures/test-research-fields.json` |
| Input sha256 | `15c4416c9e4855f71ca9c0e070d44ee545f574c9faec3a6d073a139032671756` |
| Rows in input | 9 |
| Baseline source | snapshot |
| Baseline file | `/home/z/my-project/scripts/foodie-import-validator/fixtures/baseline-snapshot.json` |
| Baseline sha256 | `f3daf908bc5f5ecf8ddcda428467500574fb86be808a236116229c44ad03f594` |
| Baseline fetched at | 2026-10-09T13:20:19.904Z |
| Baseline rows (existing restaurants) | 14 |

## Summary

| Bucket | Rows |
| --- | ---: |
| 1. Potential new businesses | 2 |
| 2. Existing-record matches | 2 |
| 3. Possible duplicates / ambiguous | 0 |
| 4. Insufficient evidence | 3 |
| 5. Invalid or missing data | 2 |
| 6. Candidate coordinates awaiting confirmation (cross-cutting) | 0 |
| **Total rows** | **9** |
| Validation errors | 2 |
| Validation warnings | 4 |

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

### Row 1: Research Garden Cafe

- **Confidence:** low
- **Input:** address: Shop 3, Service Road, Nagadenahalli · locality: Nagadenahalli · city: Doddaballapura · maps_listing: https://www.google.com/maps/place/Research+Garden+Cafe/@13.2841,77.6009,17z · cuisine: Continental, snacks · listing_rating: 4.3 · listing_reviews: 96 · checked_on: 2026-10-10 · uncertainty: Signboard spelling differs from the listing by one letter; flagged for reviewer
- **Recommended initial verification_status:** unverified

### Row 4: Count No Source Cafe

- **Confidence:** low
- **Input:** listing_reviews: 55
- **Issues:**
  - `WARN` **LISTING_REVIEW_COUNT_WITHOUT_SOURCE** (listing_review_count): An external listing review count is present without any source (source_url / rating_source_url / maps_listing_url) — evidence without provenance.
  - `WARN` **RATING_WITHOUT_CHECK_DATE** (rating_checked_on): An external rating/review count was captured without rating_checked_on — record the date you read it so staleness can be judged later.
- **Recommended initial verification_status:** unverified

## Existing-record matches (no action taken — never auto-merged) (2)

### Row 5: Ayyappa Tiffin Room

- **Confidence:** high
- **Input:** address: Scout Camp Road, near Railway Station, Doddaballapura · review_decision: same_as_existing · existing_match_id: 02a34d5f-75cd-4dfc-bc4d-989e5ea7d3c5 · notes: Researcher corroborated the existing record; no second row to be created
- **Matches to existing records:**
  - `02a34d5f` **Ayyappa Tiffin Room** · locality: Doddaballapura Railway Station — similarity 1 (name-exact) · existing coords: 13.279913, 77.552234 — confidence high
- **Recommended initial verification_status:** unverified

### Row 9: Amigos

- **Confidence:** high
- **Input:** address: NH 207, Nagadenahalli · review_decision: distinct_new_business · uncertainty: Researcher believes a second Amigos exists; tool strongly matches Amigos Cafe — must be resolved by a human
- **Matches to existing records:**
  - `973a6f0e` **Amigos Cafe** · locality: Nagadenahalli — similarity 0.99 (name-subset) · existing coords: 13.2845564, 77.5966293 — confidence high
- **Flags:** `REVIEW_DECISION_CONFLICTS_WITH_MATCH`
- **Recommended initial verification_status:** unverified

## Possible duplicates / ambiguous — MANUAL REVIEW REQUIRED (0)

_None._

## Insufficient evidence (3)

### Row 2: Search Url Cafes

- **Confidence:** low
- **Input:** maps_listing: https://www.google.com/maps/search/cafes+near+GITAM
- **Issues:**
  - `WARN` **MAPS_URL_IS_SEARCH_NOT_LISTING** (maps_listing_url): This is a Google Maps SEARCH-results URL, not a business listing. A search URL does not identify a business and never proves its location. Open the exact place page and use that URL.
- **Recommended initial verification_status:** unverified

### Row 3: Menu Rich Kitchen

- **Confidence:** low
- **Input:** cuisine: North Indian, Chinese · uncertainty: No address or listing found yet
- **Recommended initial verification_status:** unverified

### Row 6: Wrong Id Diner

- **Confidence:** low
- **Input:** review_decision: same_as_existing · existing_match_id: 00000000-0000-4000-8000-0000000000aa
- **Issues:**
  - `WARN` **EXISTING_MATCH_ID_NOT_IN_BASELINE** (existing_match_id): existing_match_id is a valid UUID but no existing restaurant with this id was found in the current baseline — refresh the baseline snapshot or fix the id.
- **Recommended initial verification_status:** unverified

## Invalid or missing data (2)

### Row 7: Bad Decision Bistro

- **Confidence:** none
- **Input:** review_decision: i think new
- **Issues:**
  - `ERROR` **INVALID_REVIEW_DECISION** (review_decision): "i think new" is not one of: distinct_new_business, same_as_existing, possible_duplicate_hold, needs_more_research (leave empty when undecided).
- **Recommended initial verification_status:** unverified

### Row 8: Foreign Directory House

- **Confidence:** none
- **Input:** maps_listing: https://directory.example.com/justdial-style-page
- **Issues:**
  - `ERROR` **INVALID_MAPS_LISTING_URL** (maps_listing_url): "https://directory.example.com/justdial-style-page" is not a Google Maps URL. Put other directories' listing URLs in source_url instead. Kept as null.
- **Recommended initial verification_status:** unverified

## 6. Candidate coordinates awaiting confirmation (0)

_None — either no coordinates were supplied, or every coordinate row already claims independently-confirmed evidence with a source URL (claims are recorded, never auto-trusted)._

## Next step

Nothing has been imported. Resolve rows flagged for manual review, fix invalid rows, then re-run this validator until the report is clean. Only after explicit human approval may an import be prepared — via a reviewed SQL/insert path, never by this tool.
