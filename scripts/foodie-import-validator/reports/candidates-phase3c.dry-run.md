# Foodie — Restaurant Import Dry-Run Report

**Mode:** dry-run (read-only) · **Tool:** foodie-restaurant-import-validator v1.1.0

## Run context

| Item | Value |
| --- | --- |
| Input file | `/home/z/my-project/scripts/foodie-import-validator/input/candidates-phase3c.csv` |
| Input sha256 | `a7f938d444de8138a1052c37ef6c011c9736e59f2d10934af307999a28df0772` |
| Rows in input | 35 |
| Baseline source | snapshot |
| Baseline file | `/home/z/my-project/scripts/foodie-import-validator/fixtures/baseline-snapshot.json` |
| Baseline sha256 | `f3daf908bc5f5ecf8ddcda428467500574fb86be808a236116229c44ad03f594` |
| Baseline fetched at | 2026-10-09T13:20:19.904Z |
| Baseline rows (existing restaurants) | 14 |

## Summary

| Bucket | Rows |
| --- | ---: |
| 1. Potential new businesses | 0 |
| 2. Existing-record matches | 12 |
| 3. Possible duplicates / ambiguous | 1 |
| 4. Insufficient evidence | 22 |
| 5. Invalid or missing data | 0 |
| 6. Candidate coordinates awaiting confirmation (cross-cutting) | 0 |
| **Total rows** | **35** |
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

## Existing-record matches (no action taken — never auto-merged) (12)

### Row 6: SS Hyderabadi Biriyani Zone

- **Confidence:** high
- **Input:** notes: Phase 3C candidate list — Near GITAM / Nagadenahalli
- **Matches to existing records:**
  - `f37d212b` **SS Hyderabadi Biriyani Zone** · locality: Nagadenahalli — similarity 1 (name-exact) · existing coords: 13.2846389, 77.6011256 — confidence high
- **Recommended initial verification_status:** unverified

### Row 7: Amigos

- **Confidence:** high
- **Input:** notes: Phase 3C candidate list — Near GITAM / Nagadenahalli
- **Matches to existing records:**
  - `973a6f0e` **Amigos Cafe** · locality: Nagadenahalli — similarity 0.99 (name-subset) · existing coords: 13.2845564, 77.5966293 — confidence high
- **Recommended initial verification_status:** unverified

### Row 8: Abhiram Food Court

- **Confidence:** high
- **Input:** notes: Phase 3C candidate list — Near GITAM / Nagadenahalli
- **Matches to existing records:**
  - `c3936dec` **Abhiram Food Court** · locality: Moparahalli — similarity 1 (name-exact) · existing coords: 13.2849612, 77.5963066 — confidence high
- **Recommended initial verification_status:** unverified

### Row 9: GITAM University Canteen

- **Confidence:** high
- **Input:** notes: Phase 3C candidate list — Near GITAM / Nagadenahalli
- **Matches to existing records:**
  - `7259037f` **GITAM University Canteen** · locality: GITAM campus — similarity 1 (name-exact) · existing coords: NULL — confidence high
- **Recommended initial verification_status:** unverified

### Row 23: Ayyappa Tiffin Room

- **Confidence:** high
- **Input:** notes: Phase 3C candidate list — Toward Doddaballapura / Railway Station Road
- **Matches to existing records:**
  - `02a34d5f` **Ayyappa Tiffin Room** · locality: Doddaballapura Railway Station — similarity 1 (name-exact) · existing coords: 13.279913, 77.552234 — confidence high
- **Recommended initial verification_status:** unverified

### Row 24: Sri Annapoorneshwari Tiffin Center

- **Confidence:** high
- **Input:** notes: Phase 3C candidate list — Toward Doddaballapura / Railway Station Road
- **Matches to existing records:**
  - `f74252ef` **Sri Annapoorneshwari Tiffin Center** · locality: Doddaballapura town — similarity 1 (name-exact) · existing coords: NULL — confidence high
- **Recommended initial verification_status:** unverified

### Row 25: Shri Manjunatha Grand Veg

- **Confidence:** high
- **Input:** notes: Phase 3C candidate list — Toward Doddaballapura / Railway Station Road
- **Matches to existing records:**
  - `987dad98` **Shri Manjunatha Grand Veg** · locality: Doddaballapura Railway Station — similarity 1 (name-exact) · existing coords: NULL — confidence high
- **Recommended initial verification_status:** unverified

### Row 26: Brundavana Family Restaurant

- **Confidence:** high
- **Input:** notes: Phase 3C candidate list — Toward Doddaballapura / Railway Station Road
- **Matches to existing records:**
  - `343812c9` **Brundavana Family Restaurant** · locality: Scout Camp Road — similarity 1 (name-exact) · existing coords: NULL — confidence high
- **Recommended initial verification_status:** unverified

### Row 27: Chickpet Donne Biryani House

- **Confidence:** high
- **Input:** notes: Phase 3C candidate list — Toward Doddaballapura / Railway Station Road
- **Matches to existing records:**
  - `5218d019` **Chickpet Donne Biryani House** — similarity 1 (name-exact) · existing coords: NULL — confidence high
- **Recommended initial verification_status:** unverified

### Row 28: Hotel Halli Nanasu

- **Confidence:** high
- **Input:** notes: Phase 3C candidate list — Toward Doddaballapura / Railway Station Road
- **Matches to existing records:**
  - `e6ba7907` **Hotel Halli Nanasu** · locality: Doddaballapura town — similarity 1 (name-exact) · existing coords: NULL — confidence high
- **Recommended initial verification_status:** unverified

### Row 29: Hotel Royal Nandhana

- **Confidence:** high
- **Input:** notes: Phase 3C candidate list — Toward Doddaballapura / Railway Station Road
- **Matches to existing records:**
  - `e989603f` **Hotel Royal Nandhana** · locality: Arehalli Guddadahalli — similarity 1 (name-exact) · existing coords: NULL — confidence high
- **Recommended initial verification_status:** unverified

### Row 30: Priyanka Tiffen Center

- **Confidence:** high
- **Input:** notes: Phase 3C candidate list — Toward Doddaballapura / Railway Station Road
- **Matches to existing records:**
  - `fe248fda` **Priyanka Tiffen Center** · locality: Doddaballapura town — similarity 1 (name-exact) · existing coords: NULL — confidence high
- **Recommended initial verification_status:** unverified

## Possible duplicates / ambiguous — MANUAL REVIEW REQUIRED (1)

### Row 1: GITAM Cafe

- **Confidence:** low
- **Input:** notes: Phase 3C candidate list — Near GITAM / Nagadenahalli
- **Matches to existing records:**
  - `7259037f` **GITAM University Canteen** · locality: GITAM campus — similarity 0.375 (name-ambiguous-proper-token) · existing coords: NULL — confidence low
- **Recommended initial verification_status:** unverified

## Insufficient evidence (22)

### Row 2: The Shri Cafe and Restaurant

- **Confidence:** low
- **Input:** notes: Phase 3C candidate list — Near GITAM / Nagadenahalli
- **Recommended initial verification_status:** unverified

### Row 3: Garuda Cafe Restaurant

- **Confidence:** low
- **Input:** notes: Phase 3C candidate list — Near GITAM / Nagadenahalli
- **Recommended initial verification_status:** unverified

### Row 4: Epicurus Multi Cuisine Restaurant

- **Confidence:** low
- **Input:** notes: Phase 3C candidate list — Near GITAM / Nagadenahalli
- **Recommended initial verification_status:** unverified

### Row 5: Biryani Cafe

- **Confidence:** low
- **Input:** notes: Phase 3C candidate list — Near GITAM / Nagadenahalli
- **Recommended initial verification_status:** unverified

### Row 10: Mantralaya Hotel & Chats

- **Confidence:** low
- **Input:** notes: Phase 3C candidate list — Near GITAM / Nagadenahalli
- **Recommended initial verification_status:** unverified

### Row 11: Venture’s Hungry Birds

- **Confidence:** low
- **Input:** notes: Phase 3C candidate list — Near GITAM / Nagadenahalli
- **Recommended initial verification_status:** unverified

### Row 12: Lotus Gardenia

- **Confidence:** low
- **Input:** notes: Phase 3C candidate list — Near GITAM / Nagadenahalli
- **Recommended initial verification_status:** unverified

### Row 13: Vaibhava Sweets & Chats

- **Confidence:** low
- **Input:** notes: Phase 3C candidate list — Near GITAM / Nagadenahalli
- **Recommended initial verification_status:** unverified

### Row 14: Appu Chats

- **Confidence:** low
- **Input:** notes: Phase 3C candidate list — Near GITAM / Nagadenahalli
- **Recommended initial verification_status:** unverified

### Row 15: Iyengar’s Cake N Bake

- **Confidence:** low
- **Input:** notes: Phase 3C candidate list — Near GITAM / Nagadenahalli
- **Recommended initial verification_status:** unverified

### Row 16: Best Choice Bakery

- **Confidence:** low
- **Input:** notes: Phase 3C candidate list — Near GITAM / Nagadenahalli
- **Recommended initial verification_status:** unverified

### Row 17: Wild Woods BBQ Grill & Chill

- **Confidence:** low
- **Input:** notes: Phase 3C candidate list — Near GITAM / Nagadenahalli
- **Recommended initial verification_status:** unverified

### Row 18: Rainbow Huts Family Restaurant

- **Confidence:** low
- **Input:** notes: Phase 3C candidate list — Near GITAM / Nagadenahalli
- **Recommended initial verification_status:** unverified

### Row 19: Hotel Bindushree Family Restaurant

- **Confidence:** low
- **Input:** notes: Phase 3C candidate list — Near GITAM / Nagadenahalli
- **Recommended initial verification_status:** unverified

### Row 20: Karavali Hotel

- **Confidence:** low
- **Input:** notes: Phase 3C candidate list — Near GITAM / Nagadenahalli
- **Recommended initial verification_status:** unverified

### Row 21: Sri Vinayaka Food Point

- **Confidence:** low
- **Input:** notes: Phase 3C candidate list — Near GITAM / Nagadenahalli
- **Recommended initial verification_status:** unverified

### Row 22: Hotel Radha

- **Confidence:** low
- **Input:** notes: Phase 3C candidate list — Near GITAM / Nagadenahalli
- **Recommended initial verification_status:** unverified

### Row 31: Siri Chicken Centre

- **Confidence:** low
- **Input:** notes: Phase 3C candidate list — Toward Doddaballapura / Railway Station Road
- **Recommended initial verification_status:** unverified

### Row 32: Hotel Krishnamoorthy

- **Confidence:** low
- **Input:** notes: Phase 3C candidate list — Toward Doddaballapura / Railway Station Road
- **Recommended initial verification_status:** unverified

### Row 33: Ganesh Darshan & Chats

- **Confidence:** low
- **Input:** notes: Phase 3C candidate list — Toward Doddaballapura / Railway Station Road
- **Recommended initial verification_status:** unverified

### Row 34: Lakshmi Biriyani Point

- **Confidence:** low
- **Input:** notes: Phase 3C candidate list — Toward Doddaballapura / Railway Station Road
- **Recommended initial verification_status:** unverified

### Row 35: Kiran Tiffin Room

- **Confidence:** low
- **Input:** notes: Phase 3C candidate list — Toward Doddaballapura / Railway Station Road
- **Recommended initial verification_status:** unverified

## Invalid or missing data (0)

_None._

## 6. Candidate coordinates awaiting confirmation (0)

_None — either no coordinates were supplied, or every coordinate row already claims independently-confirmed evidence with a source URL (claims are recorded, never auto-trusted)._

## Next step

Nothing has been imported. Resolve rows flagged for manual review, fix invalid rows, then re-run this validator until the report is clean. Only after explicit human approval may an import be prepared — via a reviewed SQL/insert path, never by this tool.
