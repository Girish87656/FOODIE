# Foodie — Restaurant Import Dry-Run Report

**Mode:** dry-run (read-only) · **Tool:** foodie-restaurant-import-validator v1.1.0

## Run context

| Item | Value |
| --- | --- |
| Input file | `/home/z/my-project/scripts/foodie-import-validator/input/research-worksheet-round3.csv` |
| Input sha256 | `fcccf1b8a28febc714e8e8a038fa0ef97c73a4f561ab96c2164abe0bff9ea317` |
| Rows in input | 127 |
| Baseline source | snapshot |
| Baseline file | `/home/z/my-project/scripts/foodie-import-validator/fixtures/baseline-snapshot.json` |
| Baseline sha256 | `967a68f39a1ec56aba8f5752ac4886501f1ef5fb0728d36e48a3cfc9bb2cead8` |
| Baseline fetched at | 2026-10-11T07:54:44.697Z |
| Baseline rows (existing restaurants) | 14 |

## Summary

| Bucket | Rows |
| --- | ---: |
| 1. Potential new businesses | 54 |
| 2. Existing-record matches | 7 |
| 3. Possible duplicates / ambiguous | 65 |
| 4. Insufficient evidence | 1 |
| 5. Invalid or missing data | 0 |
| 6. Candidate coordinates awaiting confirmation (cross-cutting) | 89 |
| **Total rows** | **127** |
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

## Potential new businesses (54)

### Row 1: Kiyash Family Restaurant

- **Confidence:** medium
- **Input:** address: Beersandra, Allur Doddanahalli Gate, Doddaballapura Locality, Doddaballapura · locality: Nagadenahalli/Moparahalli corridor · city: Doddaballapura · phone: +919945445347 · coords: 13.2805361, 77.6067411 · source: https://www.district.in/dining/bangalore/kiyash-family-restaurant-doddaballapura-locality-doddaballapura · cuisine: North Indian, Indo-Chinese · evidence: directory_reported · review_decision: needs_more_research · uncertainty: single structured directory source (district.in) — needs one independent second source before import (web-search quota exhausted this round) · notes: Round-3 systematic enumeration (2026-10-11): district.in dining sitemap (cdn.district.in/sitemap/sitemap-dining.xml, robots-declared) -> venue page fetched; JSON-LD captured verbatim.
- **Coordinates awaiting confirmation:** 13.2805361, 77.6067411 — evidence level: directory_reported · source: https://www.district.in/dining/bangalore/kiyash-family-restaurant-doddaballapura-locality-doddaballapura. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Recommended initial verification_status:** unverified

### Row 4: Amma's Juice And Chats Corner

- **Confidence:** medium
- **Input:** address: Marasandra, Opposite Sri Lakshmi Ranganataha Kalyana Pantapa, Yalahanka Main Road, Doddaballapura Locality, Doddaballapura · locality: Rajanukunte · city: Doddaballapura · phone: +919035595873 · coords: 13.22452, 77.54933 · source: https://www.district.in/dining/doddaballapura/ammas-juice-and-chats-corner-doddaballapura-locality · cuisine: Street Food, South Indian, North Indian · evidence: directory_reported · review_decision: needs_more_research · uncertainty: single structured directory source (district.in) — needs one independent second source before import (web-search quota exhausted this round) · notes: Round-3 systematic enumeration (2026-10-11): district.in dining sitemap (cdn.district.in/sitemap/sitemap-dining.xml, robots-declared) -> venue page fetched; JSON-LD captured verbatim.
- **Coordinates awaiting confirmation:** 13.22452, 77.54933 — evidence level: directory_reported · source: https://www.district.in/dining/doddaballapura/ammas-juice-and-chats-corner-doddaballapura-locality. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Recommended initial verification_status:** unverified

### Row 10: Biryani Darbhar

- **Confidence:** medium
- **Input:** address: D Cross, Main Road, Doddaballapura Locality, Doddaballapura · locality: Doddaballapura town · city: Doddaballapura · phone: +917022848445 · coords: 13.3016587128, 77.5434562423 · source: https://www.district.in/dining/doddaballapura/biryani-darbhar-doddaballapura-locality · cuisine: North Indian, South Indian, Indo-Chinese · listing_rating: 4.0 · listing_reviews: 49 · checked_on: 2026-10-11 · evidence: directory_reported · review_decision: distinct_new_business · uncertainty: hours windows conflict across days ([('09:30', '21:15'), ('12:30', '21:15')]) -> blank per conflict rule; phone differs across sources: district +917022848445 vs magicpin +919620903716 · notes: Round-3 systematic enumeration (2026-10-11): district.in dining sitemap (cdn.district.in/sitemap/sitemap-dining.xml, robots-declared) -> venue page fetched; JSON-LD captured verbatim. Second source: magicpin listing https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Biryani-Darbar/store/b515bb (name match 0.97, area Doddaballapur) magicpin listing shows the Verified badge
- **Coordinates awaiting confirmation:** 13.3016587128, 77.5434562423 — evidence level: directory_reported · source: https://www.district.in/dining/doddaballapura/biryani-darbhar-doddaballapura-locality. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Recommended initial verification_status:** unverified

### Row 11: Cafe 66

- **Confidence:** medium
- **Input:** address: Taluk Office Road, Doddaballapura Locality, Doddaballapura · locality: Doddaballapura town (north edge) · city: Doddaballapura · phone: +918660296898 · coords: 13.2966151, 77.5408004 · source: https://www.district.in/dining/doddaballapura/cafe-66-1-doddaballapura-locality · listing_rating: 3.9 · listing_reviews: 37 · checked_on: 2026-10-11 · evidence: directory_reported · review_decision: distinct_new_business · uncertainty: phone differs across sources: district +918660296898 vs magicpin +917899001222 · notes: Round-3 systematic enumeration (2026-10-11): district.in dining sitemap (cdn.district.in/sitemap/sitemap-dining.xml, robots-declared) -> venue page fetched; JSON-LD captured verbatim. Second source: magicpin listing https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Cafe-66/store/1669009 (name match 1.0, area Doddaballapur) magicpin listing shows the Verified badge
- **Coordinates awaiting confirmation:** 13.2966151, 77.5408004 — evidence level: directory_reported · source: https://www.district.in/dining/doddaballapura/cafe-66-1-doddaballapura-locality. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Recommended initial verification_status:** unverified

### Row 13: Chai Bunk Cafe

- **Confidence:** medium
- **Input:** address: Ground Floor, Nelamanagala Road, Near Manishankar Kalyana Mantapa, Doddaballapura Locality, Doddaballapura · locality: Doddaballapura town · city: Doddaballapura · phone: +916363152626 · coords: 13.2802331, 77.5304478 · source: https://www.district.in/dining/doddaballapura/chai-bunk-cafe-4-doddaballapura-locality · cuisine: Continental, American, Mexican, North Indian · listing_rating: 4.2 · listing_reviews: 586 · checked_on: 2026-10-11 · evidence: directory_reported · review_decision: distinct_new_business · notes: Round-3 systematic enumeration (2026-10-11): district.in dining sitemap (cdn.district.in/sitemap/sitemap-dining.xml, robots-declared) -> venue page fetched; JSON-LD captured verbatim. Second source: magicpin listing https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Chai-Bunk-Cafe/store/176a6ca (name match 1.0, area Doddaballapur) magicpin listing shows the Verified badge
- **Coordinates awaiting confirmation:** 13.2802331, 77.5304478 — evidence level: directory_reported · source: https://www.district.in/dining/doddaballapura/chai-bunk-cafe-4-doddaballapura-locality. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Recommended initial verification_status:** unverified

### Row 14: Creamy Nuts

- **Confidence:** medium
- **Input:** address: Scout Camp Road, Doddaballapura Locality, Doddaballapura · locality: Doddaballapura Railway Station · city: Doddaballapura · phone: +917899001222 · coords: 13.2841253, 77.5676358 · source: https://www.district.in/dining/doddaballapura/creamy-nuts-doddaballapura-locality · cuisine: American, Italian, Tibetan · evidence: directory_reported · review_decision: distinct_new_business · notes: Round-3 systematic enumeration (2026-10-11): district.in dining sitemap (cdn.district.in/sitemap/sitemap-dining.xml, robots-declared) -> venue page fetched; JSON-LD captured verbatim. Second source: magicpin listing https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Creamy-Nuts/store/162a628 (name match 1.0, area Doddaballapur) magicpin listing shows the Verified badge
- **Coordinates awaiting confirmation:** 13.2841253, 77.5676358 — evidence level: directory_reported · source: https://www.district.in/dining/doddaballapura/creamy-nuts-doddaballapura-locality. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Recommended initial verification_status:** unverified

### Row 15: D Food Express

- **Confidence:** medium
- **Input:** address: 1st Floor, Marasandra, Doddaballapura Locality, Doddaballapura · locality: Rajanukunte · city: Doddaballapura · phone: +918618160892 · coords: 13.2286051, 77.5468951 · source: https://www.district.in/dining/doddaballapura/d-food-express-doddaballapura-locality · cuisine: North Indian, Indo-Chinese, Chinese · evidence: directory_reported · review_decision: needs_more_research · uncertainty: single structured directory source (district.in) — needs one independent second source before import (web-search quota exhausted this round) · notes: Round-3 systematic enumeration (2026-10-11): district.in dining sitemap (cdn.district.in/sitemap/sitemap-dining.xml, robots-declared) -> venue page fetched; JSON-LD captured verbatim.
- **Coordinates awaiting confirmation:** 13.2286051, 77.5468951 — evidence level: directory_reported · source: https://www.district.in/dining/doddaballapura/d-food-express-doddaballapura-locality. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Recommended initial verification_status:** unverified

### Row 24: Forkful - Global Vegetarian Cuisine

- **Confidence:** medium
- **Input:** address: Survey 104, Brahmi Wellness Retreat & Spa, Nagadenahalli, Doddaballapura Locality, Doddaballapura · locality: Nagadenahalli · city: Doddaballapura · phone: +919606022448 · coords: 13.2961413, 77.6014601 · source: https://www.district.in/dining/doddaballapura/forkful-global-vegetarian-cuisine-3-doddaballapura-locality · cuisine: North Indian, Indo-Chinese, Continental · evidence: directory_reported · review_decision: needs_more_research · uncertainty: single structured directory source (district.in) — needs one independent second source before import (web-search quota exhausted this round) · notes: Round-3 systematic enumeration (2026-10-11): district.in dining sitemap (cdn.district.in/sitemap/sitemap-dining.xml, robots-declared) -> venue page fetched; JSON-LD captured verbatim.
- **Coordinates awaiting confirmation:** 13.2961413, 77.6014601 — evidence level: directory_reported · source: https://www.district.in/dining/doddaballapura/forkful-global-vegetarian-cuisine-3-doddaballapura-locality. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Recommended initial verification_status:** unverified

### Row 28: Hotel Sweetheart

- **Confidence:** medium
- **Input:** address: Near TB Circle, Gowribidanur Road, Doddaballapura Locality, Doddaballapura · locality: Doddaballapura town · city: Doddaballapura · phone: +919886129971 · coords: 13.3134515127, 77.538818417 · source: https://www.district.in/dining/doddaballapura/hotel-sweetheart-doddaballapura-locality · cuisine: North Indian, Indo-Chinese, Chinese · listing_rating: 3.9 · listing_reviews: 5 · checked_on: 2026-10-11 · evidence: directory_reported · review_decision: distinct_new_business · notes: Round-3 systematic enumeration (2026-10-11): district.in dining sitemap (cdn.district.in/sitemap/sitemap-dining.xml, robots-declared) -> venue page fetched; JSON-LD captured verbatim. Second source: magicpin listing https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Hotel-Sweetheart/store/154335a (name match 1.0, area Doddaballapur) magicpin listing shows the Verified badge
- **Coordinates awaiting confirmation:** 13.3134515127, 77.538818417 — evidence level: directory_reported · source: https://www.district.in/dining/doddaballapura/hotel-sweetheart-doddaballapura-locality. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Recommended initial verification_status:** unverified

### Row 29: House Full

- **Confidence:** medium
- **Input:** address: 219/14/4B1, Muthasandra, Doddaballapura Locality, Doddaballapura · locality: Muthasandra · city: Doddaballapura · phone: +917411120657 · coords: 13.3162034, 77.5515349 · source: https://www.district.in/dining/doddaballapura/house-full-doddaballapura-locality · cuisine: South Indian, North Indian, Indo-Chinese, Hyderabadi · listing_rating: 3.6 · listing_reviews: 1296 · checked_on: 2026-10-11 · evidence: directory_reported · review_decision: distinct_new_business · uncertainty: hours windows conflict across days ([('11:30', '22:30'), ('11:30', '22:45'), ('11:30', '23:00')]) -> blank per conflict rule · notes: Round-3 systematic enumeration (2026-10-11): district.in dining sitemap (cdn.district.in/sitemap/sitemap-dining.xml, robots-declared) -> venue page fetched; JSON-LD captured verbatim. Second source: magicpin listing https://magicpin.in/Bangalore/Doddaballapur/Restaurant/House-Full/store/162a170 (name match 1.0, area Doddaballapur) magicpin listing shows the Verified badge
- **Coordinates awaiting confirmation:** 13.3162034, 77.5515349 — evidence level: directory_reported · source: https://www.district.in/dining/doddaballapura/house-full-doddaballapura-locality. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Recommended initial verification_status:** unverified

### Row 32: Kanti Sweets - Since 1957

- **Confidence:** medium
- **Input:** address: Site 67 &68, Survey 103, Bashettihalli Grama Panchayat, Kasaba Hobli, Doddaballapura Locality, Doddaballapura · locality: Bashettihalli · city: Doddaballapura · phone: +917337726633 · coords: 13.2604171514, 77.5523775765 · source: https://www.district.in/dining/doddaballapura/kanti-sweets-since-1957-doddaballapura-locality · cuisine: North Indian, Mithai, Street Food, Bakery · listing_rating: 4.1 · listing_reviews: 159 · checked_on: 2026-10-11 · evidence: directory_reported · review_decision: needs_more_research · uncertainty: single structured directory source (district.in) — needs one independent second source before import (web-search quota exhausted this round) · notes: Round-3 systematic enumeration (2026-10-11): district.in dining sitemap (cdn.district.in/sitemap/sitemap-dining.xml, robots-declared) -> venue page fetched; JSON-LD captured verbatim. Second source: magicpin listing https://magicpin.in/Bangalore/Bashettihalli/Restaurant/Kanti-Sweets/store/397757 (name match 1.0, area Bashettihalli) magicpin listing shows the Verified badge
- **Coordinates awaiting confirmation:** 13.2604171514, 77.5523775765 — evidence level: directory_reported · source: https://www.district.in/dining/doddaballapura/kanti-sweets-since-1957-doddaballapura-locality. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Recommended initial verification_status:** unverified

### Row 33: Kelvin Scale - Absolute Ice Creams

- **Confidence:** medium
- **Input:** address: Sy 1266/74/1, Rangappa Circle, Doddaballapura Locality, Doddaballapura · locality: Doddaballapura Railway Station / Scout Camp Rd · city: Doddaballapura · phone: +918722112296 · coords: 13.2857702, 77.5444205 · source: https://www.district.in/dining/doddaballapura/kelvin-scale-absolute-ice-creams-doddaballapura-locality · cuisine: Desserts, Street Food · listing_rating: 4.6 · listing_reviews: 123 · checked_on: 2026-10-11 · evidence: directory_reported · review_decision: distinct_new_business · notes: Round-3 systematic enumeration (2026-10-11): district.in dining sitemap (cdn.district.in/sitemap/sitemap-dining.xml, robots-declared) -> venue page fetched; JSON-LD captured verbatim. Second source: magicpin listing https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Kelvin-Scale-Absolute-Ice-Cream/store/1988380 (name match 0.98, area Doddaballapur) magicpin listing shows the Verified badge
- **Coordinates awaiting confirmation:** 13.2857702, 77.5444205 — evidence level: directory_reported · source: https://www.district.in/dining/doddaballapura/kelvin-scale-absolute-ice-creams-doddaballapura-locality. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Recommended initial verification_status:** unverified

### Row 47: RD Restaurant

- **Confidence:** medium
- **Input:** address: Ground Floor, KCP Circle, Nelamangala Road, Near Petrol Bunk, Doddaballapura Locality, Doddaballapura · locality: Doddaballapura town · city: Doddaballapura · phone: +919845284878 · coords: 13.2821991535, 77.5315039605 · source: https://www.district.in/dining/doddaballapura/rd-restaurant-doddaballapura-locality · evidence: directory_reported · review_decision: needs_more_research · uncertainty: single structured directory source (district.in) — needs one independent second source before import (web-search quota exhausted this round) · notes: Round-3 systematic enumeration (2026-10-11): district.in dining sitemap (cdn.district.in/sitemap/sitemap-dining.xml, robots-declared) -> venue page fetched; JSON-LD captured verbatim.
- **Coordinates awaiting confirmation:** 13.2821991535, 77.5315039605 — evidence level: directory_reported · source: https://www.district.in/dining/doddaballapura/rd-restaurant-doddaballapura-locality. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Recommended initial verification_status:** unverified

### Row 53: Shree Raghavendra Grand

- **Confidence:** medium
- **Input:** address: Kathe 306/46/4, Ground Floor, Kantanakunte, Gowribidanur Highway, Doddaballapura Locality, Doddaballapura · locality: Doddaballapura town · city: Doddaballapura · phone: +919845625844 · coords: 13.3294889, 77.5324833 · source: https://www.district.in/dining/doddaballapura/shree-raghavendra-grand-doddaballapura-locality · cuisine: South Indian, North Indian · evidence: directory_reported · review_decision: distinct_new_business · notes: Round-3 systematic enumeration (2026-10-11): district.in dining sitemap (cdn.district.in/sitemap/sitemap-dining.xml, robots-declared) -> venue page fetched; JSON-LD captured verbatim. Second source: magicpin listing https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Shree-Raghavendra-Grand/store/15b0028 (name match 1.0, area Doddaballapur) magicpin listing shows the Verified badge
- **Coordinates awaiting confirmation:** 13.3294889, 77.5324833 — evidence level: directory_reported · source: https://www.district.in/dining/doddaballapura/shree-raghavendra-grand-doddaballapura-locality. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Recommended initial verification_status:** unverified

### Row 54: Shri Sai Tiffin And Fast Food

- **Confidence:** medium
- **Input:** address: Mukthambika Road, Opposite TMB Bank, Doddaballapura Locality, Doddaballapura · locality: Doddaballapura town (north edge) · city: Doddaballapura · phone: +919901111302 · coords: 13.2957181599, 77.5363937536 · source: https://www.district.in/dining/doddaballapura/shri-sai-tiffin-and-fast-food-doddaballapura-locality · evidence: directory_reported · review_decision: distinct_new_business · notes: Round-3 systematic enumeration (2026-10-11): district.in dining sitemap (cdn.district.in/sitemap/sitemap-dining.xml, robots-declared) -> venue page fetched; JSON-LD captured verbatim. Second source: magicpin listing https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Shri-Sai-Tiffin-And-Fast-Food/store/162c206 (name match 1.0, area Doddaballapur) magicpin listing shows the Verified badge
- **Coordinates awaiting confirmation:** 13.2957181599, 77.5363937536 — evidence level: directory_reported · source: https://www.district.in/dining/doddaballapura/shri-sai-tiffin-and-fast-food-doddaballapura-locality. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Recommended initial verification_status:** unverified

### Row 55: Sizzlly Chicken

- **Confidence:** medium
- **Input:** address: Shop 1, Veerbadranapalla, Opposite Kongadiyappa College, Doddaballapura Locality, Doddaballapura · locality: Doddaballapura town · city: Doddaballapura · phone: +919164843665 · coords: 13.2889578685, 77.532123886 · source: https://www.district.in/dining/doddaballapura/sizzlly-chicken-1-doddaballapura-locality · cuisine: American · listing_rating: 3.6 · listing_reviews: 21 · checked_on: 2026-10-11 · evidence: directory_reported · review_decision: distinct_new_business · notes: Round-3 systematic enumeration (2026-10-11): district.in dining sitemap (cdn.district.in/sitemap/sitemap-dining.xml, robots-declared) -> venue page fetched; JSON-LD captured verbatim. Second source: magicpin listing https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Sizzlly-Chicken/store/15ac941 (name match 1.0, area Doddaballapur) magicpin listing shows the Verified badge
- **Coordinates awaiting confirmation:** 13.2889578685, 77.532123886 — evidence level: directory_reported · source: https://www.district.in/dining/doddaballapura/sizzlly-chicken-1-doddaballapura-locality. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Recommended initial verification_status:** unverified

### Row 58: Sri Nandi Utsav

- **Confidence:** medium
- **Input:** address: 7/1, Block 42, Yellupura Village 3, Kasaba Hobli, KIADB Industrial Area, Bashettihalli, Doddaballapura Locality, Doddaballapura · locality: Bashettihalli · city: Doddaballapura · phone: +919449506632 · coords: 13.2463719, 77.552972 · source: https://www.district.in/dining/doddaballapura/sri-nandi-utsav-doddaballapura-locality · evidence: directory_reported · review_decision: needs_more_research · uncertainty: single structured directory source (district.in) — needs one independent second source before import (web-search quota exhausted this round) · notes: Round-3 systematic enumeration (2026-10-11): district.in dining sitemap (cdn.district.in/sitemap/sitemap-dining.xml, robots-declared) -> venue page fetched; JSON-LD captured verbatim.
- **Coordinates awaiting confirmation:** 13.2463719, 77.552972 — evidence level: directory_reported · source: https://www.district.in/dining/doddaballapura/sri-nandi-utsav-doddaballapura-locality. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Recommended initial verification_status:** unverified

### Row 65: U Turn Paradise

- **Confidence:** medium
- **Input:** address: Survey 175/2, 176, Kadatanamale, Hesaraghatta Hobli, Doddaballapur Main Road, Yelahanka, Bangalore · locality: Rajanukunte · city: Doddaballapura · phone: +919986500316 · coords: 13.2321984665, 77.5507964194 · source: https://www.district.in/dining/doddaballapura/u-turn-paradise-4-doddaballapura-locality · cuisine: North Indian, Indo-Chinese · listing_rating: 4.1 · listing_reviews: 54 · checked_on: 2026-10-11 · evidence: directory_reported · review_decision: needs_more_research · uncertainty: single structured directory source (district.in) — needs one independent second source before import (web-search quota exhausted this round) · notes: Round-3 systematic enumeration (2026-10-11): district.in dining sitemap (cdn.district.in/sitemap/sitemap-dining.xml, robots-declared) -> venue page fetched; JSON-LD captured verbatim.
- **Coordinates awaiting confirmation:** 13.2321984665, 77.5507964194 — evidence level: directory_reported · source: https://www.district.in/dining/doddaballapura/u-turn-paradise-4-doddaballapura-locality. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Recommended initial verification_status:** unverified

### Row 67: Vamsi Military Hotel

- **Confidence:** medium
- **Input:** address: Behind SBI bank circle, Basettihalli, Karnataka, Basettihalli, Doddaballapura Locality, Doddaballapura · locality: Bashettihalli · city: Doddaballapura · phone: +919741441402 · coords: 13.2583406875, 77.5519832881 · source: https://www.district.in/dining/doddaballapura/vamsi-military-hotel-doddaballapura-locality · cuisine: South Indian, North Indian, Indo-Chinese · listing_rating: 3.9 · listing_reviews: 7 · checked_on: 2026-10-11 · evidence: directory_reported · review_decision: distinct_new_business · notes: Round-3 systematic enumeration (2026-10-11): district.in dining sitemap (cdn.district.in/sitemap/sitemap-dining.xml, robots-declared) -> venue page fetched; JSON-LD captured verbatim. Second source: magicpin listing https://magicpin.in/Bangalore/Bashettihalli/Restaurant/Vamsi-Military-Hotel/store/67a186 (name match 1.0, area Bashettihalli) magicpin listing shows the Verified badge
- **Coordinates awaiting confirmation:** 13.2583406875, 77.5519832881 — evidence level: directory_reported · source: https://www.district.in/dining/doddaballapura/vamsi-military-hotel-doddaballapura-locality. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Recommended initial verification_status:** unverified

### Row 69: VRB HOTEL FAMILY RESTAURANT

- **Confidence:** medium
- **Input:** address: Khatha 230/255/01, Khatha 231/255/1/1, SH/9, Rakshak Enclave, Bus Stop, Kasaba Hobli, Doddaballapura Locality, Doddaballapura · locality: Doddaballapura town · city: Doddaballapura · phone: +918904045144 · coords: 13.3248068, 77.5334655 · source: https://www.district.in/dining/doddaballapura/vrb-hotel-family-restaurant-doddaballapura-locality · cuisine: North Indian, South Indian, Indo-Chinese · evidence: directory_reported · review_decision: distinct_new_business · notes: Round-3 systematic enumeration (2026-10-11): district.in dining sitemap (cdn.district.in/sitemap/sitemap-dining.xml, robots-declared) -> venue page fetched; JSON-LD captured verbatim. Second source: magicpin listing https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Vrb-Hotel-And-Restaurant/store/1821545 (name match 1.0, area Doddaballapur) magicpin listing shows the Verified badge
- **Coordinates awaiting confirmation:** 13.3248068, 77.5334655 — evidence level: directory_reported · source: https://www.district.in/dining/doddaballapura/vrb-hotel-family-restaurant-doddaballapura-locality. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Recommended initial verification_status:** unverified

### Row 71: The Shri Cafe and Restaurant

- **Confidence:** medium
- **Input:** address: NH 648, Doddaballapur Main Road Nagadenahalli Village Doddaballapur Taluk, Nagadenhalli, Karnataka · locality: Nagadenahalli · city: Doddaballapura · phone: +919844929931 · source: https://www.justdial.com/Bangalore/The-Shri-Cafe-And-Restaurant-Nagadenahalii/080PXX80-XX80-251224194043-V6Q3_BZDET · cuisine: South Indian tiffins, chats, juices, coffee · listing_rating: 4.5 · listing_reviews: 17 · checked_on: 2026-10-09 · evidence: directory_reported · review_decision: distinct_new_business · uncertainty: Justdial rating renderings conflicted in the Phase 3D reads (4.5 vs 5.0, both '17 ratings'); re-reads later the same day (Phase 3F) consistently show 4.5 with 17 reviews (JD reviews page: 'average rating of 4.5') - recorded as 4.5/17. Cuisine per the official Instagram bio ('fresh coffee, delicious tiffins, chats, juices' at NH 648, Nagadenahalli). Hours not captured; JD page body still unreadable (snippet-level evidence). · notes: Corroborated by two independent directories: Justdial listing (name + Nagadenahalli area) and Snapchat place page (address + phone 098449 29931), plus official Instagram @theshricafeofficial. Distinct address and phone vs all 14 existing records. | Phase 3F update (2026-10-09): rating 4.5/17 recorded (consistent across two JD snippet renderings); cuisine from official Instagram bio.
- **Recommended initial verification_status:** unverified

### Row 72: Garuda Cafe Restaurant

- **Confidence:** medium
- **Input:** locality: Adinarayana Hosahalli · city: Doddaballapura · source: https://www.justdial.com/Bangalore/Garuda-Cafe-Restaurant-Adhinarayanahosahall/080PXX80-XX80-220728212033-M3V4_BZDET · evidence: directory_reported · review_decision: needs_more_research · uncertainty: Justdial places the cafe in Adhinarayanahosahall (a.k.a. A N Hosahalli), a Doddaballapura-taluk village about 2 km from Doddaballapura town and ~3 km from Kasbhag (Wikipedia/OneFiveNine) - inside the research area. No address, phone, hours or rating captured: the JD page is not readable here and search snippets carried only boilerplate text. · notes: Category 'cafe' inferred from the name (JD title 'Garuda Cafe Restaurant'); not independently confirmed. Appears in JD cross-lists for Moparahalli/Byradenahalli/Kundana area pages.
- **Recommended initial verification_status:** unverified

### Row 73: Epicurus Multi Cuisine Restaurant

- **Confidence:** medium
- **Input:** address: Munilakshmamma, Nagadenahali, Doddaballapura Thaluk, Bengaluru Rural, Karnataka -561 203 · locality: Nagadenahalli · city: Doddaballapura · phone: +919035972563 · coords: 13.2852505, 77.598904 · source: https://www.district.in/dining/doddaballapura/epicurus-multi-cuisine-restaurant-doddaballapura-locality · cuisine: North Indian, Chinese, Middle-Eastern · evidence: directory_reported · review_decision: distinct_new_business · uncertainty: Opening hours conflict: district.in structured data (JSON-LD, read 2026-10-09) shows 10:00-22:00 all seven days while a Justdial listing shows 12:00 pm - 11:00 pm - opening_hours left blank. Coordinates are district.in's structured geo (directory-reported, awaiting confirmation). Address now verbatim from the printed menu (Scribd), adding pincode 561 203. A JD listing places 'Epicurus Multi Cuisine Restaurant' in Adhinarayanahosahall; phone 9035972563 is tied to the Nagadenahalli address by district.in and the printed menu, so the JD entry is likely the same restaurant mis-located or a second listing - unresolved. district.in shows no rating (0.0). Swiggy (Soladevanahalli) and Zomato (HSR) 'Epicurus' outlets are unrelated.; Proximity advisory reviewed (live row 'Abhiram Food Court'): ~283 m — distinct name, distinct phone, separate directory listings; same-street neighbours, not duplicates.; Proximity advisory reviewed (live row 'Amigos Cafe'): ~258 m — distinct name, distinct phone, separate directory listings; same-street neighbours, not duplicates.; Proximity advisory reviewed (live row 'SS Hyderabadi Biriyani Zone'): ~250 m — distinct name, distinct phone, separate directory listings; same-street neighbours, not duplicates. · notes: Three independent sources agree on name+area+phone: district.in, the printed menu (Scribd) and Instagram. district.in shows 'Rs 300 for two' (price band Rs is the researcher's classification). Distinct address and phone vs all 14 existing records. | Phase 3F update (2026-10-09): district.in structured geo recorded (13.2852505, 77.598904) and structured hours 10:00-22:00 documented; address upgraded to the printed-menu verbatim (pincode 561 203); JD 12:00-23:00 re-confirmed - hours stay blank.
- **Coordinates awaiting confirmation:** 13.2852505, 77.598904 — evidence level: directory_reported · source: https://www.district.in/dining/doddaballapura/epicurus-multi-cuisine-restaurant-doddaballapura-locality. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Recommended initial verification_status:** unverified

### Row 76: Venture’s Hungry Birds

- **Confidence:** medium
- **Input:** locality: Doddaballapur · city: Doddaballapura · source: https://www.justdial.com/Bangalore/Burger-Time-Near-Raj-Kamal-Theater-Doddaballapur/080PXX80-XX80-220418220006-W2T8_BZDET · evidence: directory_reported · review_decision: needs_more_research · uncertainty: No dedicated listing found on any directory. Name appears only in JD cross-listings ('Ventures Hungry Birds Doddaballapur - 0.0, 0 ratings') and in Restaurant Guru's Doddaballapura index as 'Ventures Hungry Bird's Venture's PIZZA'. 3C grouping said 'Near GITAM/Nagadenahalli' but the only area evidence points to Doddaballapur town; zone membership unconfirmed. No rating recorded (JD shows 0 ratings). · notes: Category fast_food inferred from the burger/pizza context of the cross-listings; unconfirmed.
- **Recommended initial verification_status:** unverified

### Row 78: Vaibhava Sweets & Chats

- **Confidence:** medium
- **Input:** address: Scout Camp Road, Opposite NS Convention Hall, Raghunathapura · locality: Raghunathapura · city: Doddaballapura · coords: 13.2869155, 77.5747334 · maps_listing: https://www.google.com/maps/place/Vaibhava+Sweets%26Chats/@13.2894872,77.5378,14z/data=!4m7!3m6!1s0x3bb1e1fef9f204d5:0xcbcea14369c0d063!8m2!3d13.2869155!4d77.5747334!16s%2Fg%2F11j8w16cbc · source: https://www.youtube.com/watch?v=HMjTk-zVNoU · evidence: directory_reported · review_decision: possible_duplicate_hold · uncertainty: Name spelling varies across sources: 'Vaibhava Sweets&Chats' (Google Maps place via short link), 'Vybhava Sweets & Chats' (YouTube/Instagram), 'Vaibhav Sweets & Chats' (Justdial, 'Near MLA Krishnappa Layout', open 09:30-21:30) - treated as one business but not proven. magicpin lists a separate 'Vybhava Sweets' on Fort Rd (+91 8027622143, 4.2/55) which may be a different, older shop - not merged. The YouTube plus code 7HPF+QV9 decodes to 13.28690, 77.57472, matching the Maps marker to ~2 m. No phone/hours/rating captured for this place. Instagram address string was truncated in the snippet. Phase 3F re-read (2026-10-09): the public short link was re-opened and its preview payload yielded the CANONICAL place URL (now in maps_listing_url) carrying CID 0x3bb1e1fef9f204d5:0xcbcea14369c0d063, feature /g/11j8w16cbc and marker !3d13.2869155!4d77.5747334 - matching the recorded candidate pin exactly. Google's own search-context token inside the payload decodes to 'vybhava sweets doddaballapura photos', corroborating the Vaibhava/Vybhava spelling family. The pin remains directory-reported (awaiting confirmation). · notes: Google Maps place confirmed via the public short link published in the YouTube description: place name 'Vaibhava Sweets&Chats', CID 0x3bb1e1fef9f204d5:0xcbcea14369c0d063. Marker coordinates read from the Maps preview payload on 2026-10-09 - directory-reported, awaiting confirmation. | Phase 3F update (2026-10-09): canonical /maps/place/ URL captured from the re-read short-link payload; short link (provenance source) was https://maps.app.goo.gl/rPxFWqwwEaH2o4Wr8; marker matches recorded pin; spelling-family token noted.
- **Coordinates awaiting confirmation:** 13.2869155, 77.5747334 — evidence level: directory_reported · source: https://www.youtube.com/watch?v=HMjTk-zVNoU. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Recommended initial verification_status:** unverified

### Row 79: Appu Chats

- **Confidence:** medium
- **Input:** address: Tubagere, Doddaballapura, Lakshmidevipura, Near College, Tubugere, Bangalore-561205 · locality: Tubugere · city: Doddaballapura · source: https://www.justdial.com/Bangalore/Appu-Chats-Near-College/080PXX80-XX80-240911201805-K6B7_BZDET · evidence: directory_reported · review_decision: needs_more_research · uncertainty: The only 'Appu Chats' listing found is in Tubugere (near College), a village roughly 10 km north-west of Doddaballapura town - outside the two target zones - while the 3C grouping said 'Near GITAM/Nagadenahalli'. Whether a same-named stall exists near GITAM is unknown. Address taken from the JD search snippet (page not readable in this environment). · notes: Zone mismatch flagged honestly; nothing asserted about the candidate's existence near GITAM.
- **Recommended initial verification_status:** unverified

### Row 80: Iyengar’s Cake N Bake

- **Confidence:** medium
- **Input:** locality: Doddaballapur · city: Doddaballapura · source: https://www.justdial.com/Bangalore/Iyengar-Cake-And-Bake-Doddaballapur/080PXX80-XX80-220921011904-Z7L7_BZDET · listing_rating: 4.0 · listing_reviews: 95 · checked_on: 2026-10-09 · evidence: directory_reported · review_decision: needs_more_research · uncertainty: Address not captured (JD page not readable). Spelling differs across sources: JD 'Iyengar Cake And Bake' vs candidate/Zomato 'Iyengar's Cake N Bake' - likely the same Doddaballapura bakery but not proven. Distinct from 'Hasanamba Iyengar Bakery' (Jalappa College Rd) and 'Iyengar Bakery And Cake Palace' (Lakshmipura). · notes: Zomato and Swiggy carry listings for 'Iyengar's Cake N Bake' in Doddaballapura (existence reference only - no proprietary data copied): zomato.com/pl/doddaballapura/iyengars-cake-n-bake-doddaballapura-locality/order and swiggy.com/city/doddaballapura/iyengars-cake-and-bake-doddaballapura-rest1408585
- **Recommended initial verification_status:** unverified

### Row 81: Best Choice Bakery

- **Confidence:** medium
- **Input:** address: D Cross Rd, Doddaballapur, Bangalore · locality: Doddaballapur town · city: Doddaballapura · phone: +919980213680 · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Best-Choice-Bakery/store/922554 · listing_rating: 4.0 · listing_reviews: 386 · checked_on: 2026-10-09 · evidence: directory_reported · review_decision: distinct_new_business · uncertainty: Hours are now a THREE-WAY conflict (Phase 3F re-check): magicpin verified listing 10:00-20:00 (Phase 3D's recorded value), Justdial structured hours 7:00 am - 10:00 pm (two JD snippet renderings), Instagram popular-page 9:00 AM - 10:00 PM - opening_hours left blank per the conflict rule. Ratings differ by source: magicpin 4.0/386 (recorded), Justdial 4.0/392-398 (count drifted between same-day reads), Restaurant Guru 3.5/393. JD slug places it 'Near By Aiyapa Swami Temple'; JD address line: 'Doddaballapura, Near By Aiyapa Swami Temple, D Cross Road'. magicpin shows Rs 500 for two (price band Rs is the researcher's classification). · notes: Second sources: https://www.justdial.com/Bangalore/Best-Choice-Bakery-Near-By-Aiyapa-Swami-Temple-Doddaballapur/080PXX80-XX80-170928162846-B6G9_BZDET (4.0/398) and restaurant-guru.in/Best-Choice-Bakery-Doddaballapura (3.5/393). Verified magicpin listing with phone; D Cross Rd matches the Priyanka Tiffen Center street (different business). | Phase 3F update (2026-10-09): JD structured hours 07:00-22:00 surfaced -> three-way conflict -> opening_hours blanked (magicpin value retained in this note); JD rating count drift noted. | Round-3 re-check (2026-10-11): magicpin verified listing re-fetched and live (phone +919980213680, D Cross Rd, ₹500 for two, 'Since 2011'); the 'Open · 10:00 AM – 8:00 PM' line is treated as a session window; the three-way hours conflict stands -> hours stay blank.
- **Recommended initial verification_status:** unverified

### Row 82: Wild Woods BBQ Grill & Chill

- **Confidence:** medium
- **Input:** address: Near Ssv Power Gym, Bhuvaneswari Nagar · locality: Bhuvaneswari Nagar · city: Doddaballapura · source: https://www.justdial.com/Bangalore/Wild-Woods-Bbq-Near-Ssv-Power-Gym-Bhuvaneswari-Nagar/080PXX80-XX80-250710211946-I4J6_BZDET · evidence: directory_reported · review_decision: needs_more_research · uncertainty: JD lists 'Wild Woods Bbq' (name variant; candidate says 'BBQ Grill & Chill') near Ssv Power Gym, Bhuvaneswari Nagar. Bhuvaneswari Nagar appears inside the JD Railway-Station address block 'Railway Station, Doddaballapura, K.G Govindapura, Bhuvaneswari Nagar, Bangalore - 561203', suggesting zone-2 placement, but the exact street address is not captured. No phone/hours/rating captured. · notes: Also indexed under the JD 'Barbeque Restaurants in Nagadenahalli' area page.
- **Recommended initial verification_status:** unverified

### Row 83: Rainbow Huts Family Restaurant

- **Confidence:** medium
- **Input:** address: Doddaballapur, Bashettihalli, Bangalore · locality: Bashettihalli · city: Doddaballapura · phone: +918951368020 · source: https://magicpin.in/Bangalore/Bashettihalli/Restaurant/Rainbow-Huts-Family-Restaurant/store/184787c · listing_rating: 4.6 · listing_reviews: 49 · checked_on: 2026-10-09 · evidence: directory_reported · review_decision: distinct_new_business · uncertainty: Hours are now a THREE-WAY conflict (Phase 3F re-check): magicpin Family-Restaurant listing '11:30 AM - 2:00 PM' (lunch-window-looking), a SECOND magicpin listing 'Rainbow Huts' (store/1758a35) showing '12:30 PM - 10:15 PM' WITH THE SAME PHONE +918951368020 - indicating the same business double-listed on magicpin with a stale/partial hours entry - and Zomato's card 'opens 12:15pm'. opening_hours left blank per the conflict rule. Ratings differ sharply: magicpin 4.6/49 (recorded), Justdial 4.4/12, Zomato 3.2 (referenced only, no data copied). Zomato cuisines (North Indian, Biryani, Chinese, Kebab, Seafood, Grilled Chicken) noted as existence reference. A second JD page 'Rainbow Huts' exists near MLA Krishnappa Layout - possibly the same business double-listed; unresolved. · notes: Second source: https://www.justdial.com/Bangalore/Rainbow-Huts-Family-Restaurant-Near-Ns-Convention-Hall-Hamam/080PXX80-XX80-240703160205-B5C8_BZDET (4.4). Verified magicpin phone. Near NS Convention Hall places it on the Scout Camp Road side of Bashettihalli (zone 2). | Phase 3F update (2026-10-09): same-phone magicpin double-listing found (12:30-22:15) -> three-way hours conflict -> opening_hours blanked; Zomato cuisines existence-reference noted.
- **Recommended initial verification_status:** unverified

### Row 85: Karavali Hotel

- **Confidence:** medium
- **Input:** locality: Doddaballapura Railway Station · city: Doddaballapura · source: https://www.justdial.com/Bangalore/Hotel-Karavali-Doddaballapur/080PXX80-XX80-231108081001-E8R8_BZDET · evidence: directory_reported · review_decision: needs_more_research · uncertainty: Justdial carries two pages likely for one property: 'Hotel Karavali' (restaurant) and 'Karavali Hotel Near Railway Station' (lodging). Which page is canonical and whether a separately-branded restaurant exists is unresolved; no phone/hours/rating captured. Unrelated Bengaluru 'Hotel Karavali' entities (BTM/JP Nagar coastal cuisine) excluded. · notes: Second JD page: https://www.justdial.com/Bangalore/Karavali-Hotel-Near-Railway-Station-Doddaballapur/080PXX80-XX80-250113180101-X6J2_BZDET. 3C grouping said 'Near GITAM/Nagadenahalli'; JD places it near the Railway Station.
- **Recommended initial verification_status:** unverified

### Row 87: Hotel Radha

- **Confidence:** medium
- **Input:** locality: Govindapura · city: Doddaballapura · source: https://www.justdial.com/Bangalore/Hotel-Radha-Govindapura/080PXX80-XX80-180831182321-U3J8_BZDET · evidence: directory_reported · review_decision: needs_more_research · uncertainty: Two same-family Justdial listings: 'Hotel Radha' (Govindapura, 06:00-21:00, listed under home-delivery restaurants) and 'New Hotel Radha' (Near Railway Station, 5.0/11) - possibly a rename or two branches; unresolved remotely. No phone captured. Unrelated 'Hotel Radha Regent' (Bengaluru) excluded. · notes: Second JD page: https://www.justdial.com/Bangalore/New-Hotel-Radha-Near-Railway-Station-Doddaballapur/080PXX80-XX80-230826200751-G6H9_BZDET (5.0/11, Restaurants).
- **Recommended initial verification_status:** unverified

### Row 88: Siri Chicken Centre

- **Confidence:** medium
- **Input:** address: Near Railway Station, Opposite to Tanuja Wines, Doddaballapur · locality: Doddaballapura Railway Station · city: Doddaballapura · source: https://www.justdial.com/Bangalore/Siri-Chicken-Centre-Near-Railway-Stationopposite-To-Tanuja-Wines-Doddaballapur/080PXX80-XX80-180627015044-S2I1_BZDET · listing_rating: 4.3 · listing_reviews: 3 · checked_on: 2026-10-09 · evidence: directory_reported · review_decision: needs_more_research · uncertainty: JD's primary classification is 'Chicken Retailers' (raw-meat shop) with a secondary 'Restaurants' classification - no pilot category fits a raw-chicken retailer, so category left blank for human review. JD's chicken-retailer index gives 'Scout Kamp Road Doddaballapur - 561203'. No phone/hours captured. A different 'Siri Chicken Centre' exists on Nitte Meenakshi College Road, Ganganahalli (~17 km) - unrelated. · notes: Zone 2 (Scout Camp Road / railway station side) placement per JD index page.
- **Recommended initial verification_status:** unverified

### Row 90: Ganesh Darshan & Chats

- **Confidence:** medium
- **Input:** address: Opposite Railway Station, Doddaballapur · locality: Doddaballapura Railway Station · city: Doddaballapura · source: https://www.justdial.com/Bangalore/Ganesh-Darshan-Chats-Opposite-Railway-Station-Doddaballapur/080PXX80-XX80-171013222937-E1Q5_BZDET · listing_rating: 3.6 · listing_reviews: 6 · checked_on: 2026-10-09 · evidence: directory_reported · review_decision: possible_duplicate_hold · uncertainty: chotu lists a plus code '7GXH+RMR, near muthyalamma temple, Doddaballapura 561203' which decodes to ~13.2996, 77.5291 - about 2 km from the railway station, conflicting with JD's 'Opposite Railway Station'; coordinates left blank pending field check. Shares the proper token 'ganesh' with existing 'Sri Ganesh Grand' (Bashettihalli) - different name and area, but a distinguishing phone/address is needed before any identity call. A Facebook food post and an Instagram reel also mention 'Ganesh darshan' / 'New Ganesh darshan hotel' (Chamrajpet main road) - possible same-name family in town. · notes: chotu index: https://chotu.com/local/chat-bhandar-in-rest-of-bengaluru-bengaluru-karnataka-india/ct-1637768
- **Recommended initial verification_status:** unverified

### Row 91: Lakshmi Biriyani Point

- **Confidence:** medium
- **Input:** address: Near Railway Station, Doddaballapur, Bangalore - 561203 · locality: Doddaballapura Railway Station · city: Doddaballapura · phone: +919845263318 · source: https://www.justdial.com/Bangalore/Lakshmi-Biriyani-Point-Near-Railway-Station-Doddaballapur/080PXX80-XX80-171013224908-C2Y3_BZDET · cuisine: Biryani · listing_rating: 4.7 · listing_reviews: 10 · checked_on: 2026-10-09 · evidence: directory_reported · review_decision: needs_more_research · uncertainty: CLOSURE SIGNAL: magicpin displays the banner 'The outlet has shutdown' (checked 2026-10-09) while the Justdial listing (4.7, 10 ratings) is still live - operational status unresolved; treat as possibly inactive. OneFiveNine's Kasbhag index places it 0.2-0.3 km from the railway station. Hours not published on any captured source. Phase 3F re-check (2026-10-09, later the same day): magicpin's 'The outlet has shutdown' banner is STILL displayed (page re-read); the Justdial listing is still live and now shows structured hours 9:30 am - 10:00 pm (recorded) with rating 4.7/10. Operational status remains UNRESOLVED - the recorded hours are the live JD listing's claim and may be stale if the outlet has closed. A call to +91 98452 63318 or an on-site pass remains the decisive step. · notes: Second sources: https://magicpin.in/Bangalore/Bashettihalli/Restaurant/Lakshmi-Biriyani-Point/store/543377 (shutdown banner, phone 9845263318) and onefivenine.com Kasbhag/Kasbhag Road village indexes. | Phase 3F update (2026-10-09): JD hours 09:30-22:00 recorded from snippet; magicpin shutdown banner re-confirmed on page re-read; status hold stands. | Round-3 re-check (2026-10-11): no new reachable source; open-vs-closed conflict stands; hold kept.
- **Recommended initial verification_status:** unverified

### Row 92: Kiran Tiffin Room

- **Confidence:** medium
- **Input:** address: Kasbhag Rd, near railway station, Doddaballapura, Karnataka · locality: Kasbhag Road · city: Doddaballapura · phone: +919663965135 · source: https://restaurant-guru.in/Aiyappa-Tiffin-Center-Doddaballapura · listing_rating: 4.8 · listing_reviews: 78 · checked_on: 2026-10-09 · evidence: directory_reported · review_decision: distinct_new_business · uncertainty: IDENTITY RESOLVED (Phase 3F, 2026-10-09): Restaurant Guru's slug 'Aiyappa-Tiffin-Center-Doddaballapura' is a rename artifact of RG's own listing; Kiran Tiffin Room and the existing 'Ayyappa Tiffin Room' are distinct businesses. Kiran: phone +919663965135 confirmed by THREE directories (Restaurant Guru, Yandex, and a magicpin VERIFIED listing page-read today); own Justdial listing 'Kiran Tifen Room' (Near Railway Station, id 080PXX80-XX80-170928175119); magicpin address 'Kasbhag Rd, near railway station, Doddaballapura, K.G Govindapura, 562163'; an Instagram reel describes an evening pulao service 'Timings: 6-30pm to 10pm' (partial day coverage - not recorded as opening_hours). The existing record 'Ayyappa Tiffin Room' is a separate, distinct business: its own JD listing (4.0/580, hours 7:00 am - 9:00/10:00 pm), a since-1978 breakfast-and-meals identity on Scout Camp Rd (Facebook/Instagram reels by local page 'Nammuru Doddaballapura'), phones +918088599999 (DB + Yandex org page) and 8722593803/7348832292 (Instagram reel). Different phone + different road placement + different profile. A third same-name family, 'Swamy Ayyappa Tiffan Centre' (Mallathahalli/Dabaspet Rd), is unrelated. · notes: Second sources: yandex.ru/maps/org/kiran_tiffin_room/227484367804 (same phone +91 9663 96 51 35) and magicpin.in/Bangalore/Bashettihalli/Other/Kiran-Tiffin-Room/store/1964951 (Kasbhag Rd, K.G Govindapura, 562163). beyondyatra.com lists it 4.3 with 'Must Taste: Masala Dosa'. | Phase 3F update (2026-10-09): magicpin verified listing page-read (phone +919663965135, Kasbhag Rd address); JD 'Kiran Tifen Room' listing (170928175119) and JD 'Ayyappa Tifin Room' listing (170928162242, 4.0/580) documented as separate listings; IG reel timings noted. Hold resolved as distinct.
- **Recommended initial verification_status:** unverified

### Row 94: Ss Food Cafe

- **Confidence:** medium
- **Input:** locality: Nagadenahalli · city: Doddaballapura · source: https://www.justdial.com/Bangalore/Ss-Food-Cafe-Opposite-Sbi-Nagadenahalii/080PXX80-XX80-251218025234-B9J4_BZDET · evidence: directory_reported · uncertainty: Sparse: JD page not readable in this environment; only the listing title ('Opposite SBI, Nagadenahalii') and its cross-listing block were captured. Name shares the token 'ss' with existing 'SS Hyderabadi Biriyani Zone' - different business type/area, but watch for tool flags. · notes: Discovery (zone 1) via JD cross-listings in Nagadenahalli on 2026-10-09.
- **Recommended initial verification_status:** unverified

### Row 95: Amrutha Food Court

- **Confidence:** medium
- **Input:** locality: Nagadenahalli · city: Doddaballapura · source: https://www.justdial.com/Bangalore/Amrutha-Food-Court-Nagadenahalli/080PXX80-XX80-221230011506-V3T1_BZDET · evidence: directory_reported · uncertainty: Spelling-variant question RESOLVED (Phase 3F, 2026-10-09): distinct from existing 'Abhiram Food Court' (Moparahalli) - separate Justdial listings (Amrutha created 2022-12-30 in Nagadenahalli; Abhiram created 2024-03-28, rated 4.0/5) and an Instagram popular-page coordinate for Abhiram (13.284964, 77.596301) matching the existing DB record. JD rating renderings conflict (3.0/46 vs 3.2/48) - left blank per the conflict rule. Still sparse: no phone, address or hours captured. Unrelated same-name family: 'Amrutha Multi Cuisine Restaurant' (Sarjapur Rd/Halanayakanahalli, Bengaluru) excluded. · notes: Discovery (zone 1) via JD Nagadenahalli area pages on 2026-10-09. | Phase 3F update (2026-10-09): Amrutha vs Abhiram hold resolved as DISTINCT (separate JD listings, separate ratings, matching DB coords for Abhiram). Rating conflict documented, left blank.
- **Recommended initial verification_status:** unverified

### Row 96: Siri Bucket Biriyani

- **Confidence:** medium
- **Input:** address: Opposite Bank Of India, Thammasettihalli · locality: Thammasettihalli · city: Doddaballapura · source: https://www.justdial.com/Bangalore/Chicken-Biryani-Dish-Restaurants-in-Doddaballapur · listing_rating: 3.9 · listing_reviews: 17 · checked_on: 2026-10-09 · evidence: directory_reported · uncertainty: Rating/count read from a JD index-page snippet ('Siri Bucket Biryani. 3.9 17 Ratings. Scout Camp Road Thammasettihalli - 2.61 km'), not from a dedicated listing page. Shares the token 'siri' with the Siri Chicken Centre row - different businesses. Zone 2 (Scout Camp Road side). · notes: Discovery (zone 2) via JD 'Restaurants with Counter Service near Railway Station' and biryani indexes on 2026-10-09. Also listed at 'Railway Station, Doddaballapura, K.G Govindapura, Bhuvaneswari Nagar, Bangalore - 561203' in the JD biryani index (nct-10047018).
- **Recommended initial verification_status:** unverified

### Row 97: Sanje Time Veg Restaurant & Chaats

- **Confidence:** medium
- **Input:** locality: Kasbhag · city: Doddaballapura · source: https://www.justdial.com/Bangalore/Sanje-Time-Veg-Restaurant-Chaats-Doddaballapur/080PXX80-XX80-220312235807-D3L6_BZDET · listing_rating: 4.0 · listing_reviews: 2 · checked_on: 2026-10-09 · evidence: directory_reported · uncertainty: Sparse: JD page not readable; '4.0 2 Ratings' and 'Kasbhag Dodballapur' read from JD area-page snippets. · notes: Discovery (zone 2, Kasbhag Road) via the JD 'Best Restaurants near Railway Station Doddaballapur' index on 2026-10-09.
- **Recommended initial verification_status:** unverified

### Row 98: Hoysala Family Restaurant

- **Confidence:** medium
- **Input:** locality: Doddaballapur · city: Doddaballapura · source: https://www.justdial.com/Bangalore/Hoysala-Family-Restaurant-Doddaballapur/080PXX80-XX80-230609201003-C1B4_BZDET · cuisine: North Indian, South Indian, Seafood · listing_rating: 4.0 · listing_reviews: 331 · checked_on: 2026-10-09 · evidence: directory_reported · uncertainty: Exact street address not captured; JD places it in Doddaballapur town - zone membership unconfirmed. Instagram @hoysalafamily and a magicpin listing also exist. · notes: Discovery via the JD Nagadenahalli group-friendly index on 2026-10-09. magicpin: magicpin.in/Bangalore/Doddaballapur/Restaurant/Hoysala-Family-Restaurant/store/168a001
- **Recommended initial verification_status:** unverified

### Row 99: Grillland

- **Confidence:** medium
- **Input:** locality: Basettihalli · city: Doddaballapura · source: https://www.justdial.com/Bangalore/Grillland-Doddaballapura-Basettihalli/080PXX80-XX80-240305141018-Z1J7_BZDET · evidence: directory_reported · uncertainty: Sparse: JD page not readable; only name/locality captured. Listed under JD Fast Food near Doddaballapura, Basettihalli. · notes: Discovery via JD cross-listing on the Lakshmi Biriyani Point search on 2026-10-09.
- **Recommended initial verification_status:** unverified

### Row 102: Burger Time

- **Confidence:** medium
- **Input:** address: Shop 17, Raj Kamal Theater, Near Doddaballapur Town, Doddaballapura Locality, Doddaballapura · locality: Doddaballapura town · city: Doddaballapura · phone: +918553717034 · coords: 13.291965, 77.542015 · source: https://www.district.in/dining/doddaballapura/burger-time-doddaballapura-locality · cuisine: American, Continental · listing_rating: 3.9 · listing_reviews: 6 · checked_on: 2026-10-11 · evidence: directory_reported · review_decision: distinct_new_business · uncertainty: JD page body anti-bot blocked (snippet only: 'Near Raj Kamal Theater', hours 10:45 am - 8:45 pm agree with district). Phone corroborated by the official Instagram bio (call 8553717034). Coordinates are district.in JSON-LD geo (directory-reported, bucket 6). magicpin + Zomato + Swiggy existence-references only. · notes: Phase 3H discovery round (2026-10-10): district.in JSON-LD page-read (streetAddress, geo, aggregateRating 3.9/6, hours Mon-Sun 10:45-20:45, Rs 400 for two). Town-proper location (zone 2). No name/phone/address overlap with any existing record. | Round-3 re-check (2026-10-11): district.in listing live; rating 3.9 recorded; structured hours 10:45-20:45 re-confirmed.
- **Coordinates awaiting confirmation:** 13.291965, 77.542015 — evidence level: directory_reported · source: https://www.district.in/dining/doddaballapura/burger-time-doddaballapura-locality. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Recommended initial verification_status:** unverified

### Row 103: Bbq Junction

- **Confidence:** medium
- **Input:** address: Green Valley Layout gate, Sri Kongadiyappa College Rd, next to KMH Convention Hall, Sree, Doddaballapura, Karnataka 561203 · locality: Doddaballapura town · city: Doddaballapura · phone: +919945071428 · coords: 13.285751, 77.5311807 · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Bbq-Junction/store/1835603 · cuisine: BBQ, tandoori, shakes · listing_rating: 4.7 · listing_reviews: 14 · checked_on: 2026-10-10 · evidence: directory_reported · review_decision: distinct_new_business · uncertainty: Opening hours conflict - left blank: magicpin window 11:30 AM - 2:00 PM vs JD snippet Tue-Sun 5:30 pm - 10:00 pm (Mon closed) vs IG reel caption 6:30PM-9:30PM. JD rating snippets conflict across pages (4.9/26, 5.0/25, 4.7) - not recorded. Coordinates are magicpin JSON-LD geo (directory-reported, bucket 6). · notes: Phase 3H discovery round (2026-10-10): magicpin VERIFIED listing page-read (phone +919945071428, address, Rs 500 for two, rating 4.7/14). JD snippet corroborates address ('Next Green Valley Layout Near Kmh Convention Hall'). Verified magicpin listing with unique phone; hours conflict is a field-level gap, not an identity problem. | Round-3 re-check (2026-10-11): magicpin listing re-fetched and live (phone +919945071428, full address '...Karnataka 561203'); 'Open · 11:30 AM – 2:00 PM' is a meal-session window; hours stay blank. NOT present in the district.in dining sitemap — no second directory page exists there.
- **Coordinates awaiting confirmation:** 13.285751, 77.5311807 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Bbq-Junction/store/1835603. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Recommended initial verification_status:** unverified

### Row 104: Rajashree Veg And Non-Veg Family Restaurant

- **Confidence:** medium
- **Input:** address: Survey 142/5A, D Cross, Ward 3, Doddaballapura Locality, Doddaballapura · locality: Doddaballapura town · city: Doddaballapura · phone: +919030376363 · coords: 13.301893, 77.55085 · source: https://www.district.in/dining/doddaballapura/rajashree-veg-and-non-veg-family-restaurant-doddaballapura-locality · cuisine: North Indian, Chinese · evidence: directory_reported · review_decision: distinct_new_business · uncertainty: Two different numbers published - both recorded, not reconciled: district.in JSON-LD +919030376363 (recorded) and Snapchat 'Call 098859 97294'. Opening hours conflict - left blank: district JSON-LD 12:30-22:30 x7 days vs Snapchat 07:15-22:00. district.in shows 0.0 (no-review default) and Snapchat shows 22 ratings with no average - no rating recorded. district pin sits ~2 km north of the town core - pin-check list. 'Rajashree Comforts' brand relationship (delivery arm?) unresolved. · notes: Phase 3H discovery round (2026-10-10): district.in JSON-LD page-read + Snapchat place page independently corroborates the identical address. Rs 750 for two (district). Zomato existence-reference only.
- **Coordinates awaiting confirmation:** 13.301893, 77.55085 — evidence level: directory_reported · source: https://www.district.in/dining/doddaballapura/rajashree-veg-and-non-veg-family-restaurant-doddaballapura-locality. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Recommended initial verification_status:** unverified

### Row 106: Palav Ramu Hotel

- **Confidence:** medium
- **Input:** address: 7GVR+GP3, Doddaballapura, Karnataka 561203 · locality: Doddaballapura bus stand area · city: Doddaballapura · source: https://restaurant-guru.in/PALAV-RAMU-HOTEL-Doddaballapura · cuisine: Palav (pulao) specialty · listing_rating: 3.9 · listing_reviews: 97 · checked_on: 2026-10-10 · evidence: directory_reported · review_decision: distinct_new_business · uncertainty: Phone not captured (none on the RG page or in snippets). Address is the plus code 7GVR+GP3 published as the address by RG and magicpin - recorded as a string, never converted to coordinates. JD separately shows 4.0/95 and Explurger 3.9/53 - not recorded (RG-displayed Google aggregate recorded). No numeric geo published by any source (RG embeds an OSM map without coordinates). · notes: Phase 3H discovery round (2026-10-10): Restaurant Guru page-read (hours Mon-Sun 12PM-10PM, Google 3.9/97 as displayed by RG, price band INR 1-200 per person). Iconic local palav house near the bus stand (zone 2). No overlap with existing records.
- **Recommended initial verification_status:** unverified

### Row 109: Hasanamba Iyengar Bakery

- **Confidence:** medium
- **Input:** locality: Jalappa College Road · city: Doddaballapura · source: https://www.instagram.com/reel/DDyZ28MPkOn/?hl=en · cuisine: Old-style bakery (puff, dilpasand, honey cake per IG caption/hashtags) · review_decision: needs_more_research · uncertainty: No directory listing found for a Doddaballapura 'Hasanamba Iyengar Bakery' in this round's searches. The only in-zone signal is an Instagram reel naming it on Jalappa College Rd (snippet-only, login-walled). Same-name family elsewhere (Madavara JD, 'New Hasan Iyengar Bakery' Kadnur Mara, 'Hassan Iyengar Bakery' hassanib.com 562106) are different places. Needs an on-site pass or a JD/Maps lookup. · notes: Phase 3H discovery round (2026-10-10): snippet-only evidence; no listing/phone/rating anywhere yet. Real and locally-loved per IG, but no directory identity exists - nothing claimable yet.
- **Recommended initial verification_status:** unverified

### Row 111: Desi Family Dhaba And Restaurant

- **Confidence:** medium
- **Input:** address: Near GITAM University, Nagadenahalli, Doddaballapura Main Road · locality: Nagadenahalli · city: Doddaballapura · source: https://www.justdial.com/Bangalore/Desi-Family-Dhaba-And-Restaurant-Near-Gitam-University-Nagadenahalli-Nagadenahalii/080PXX80-XX80-251105213416-R8X7_BZDET · evidence: directory_reported · review_decision: needs_more_research · uncertainty: Snippet-only round-trip (JD page body anti-bot blocked). JD rating snippets conflict (5.0/11 on a category page vs 4.8/12 on the photos page) - rating left unrecorded per the conflict rule. No phone captured. 'Opens in 3 mins' badge is not hour evidence. JD listing id created 2025-11-05 (new 2025 listing). In-zone (GITAM gate / Nagadenahalli) - the highest-value in-zone discovery of the round; needs a second source (different directory page-read, phone, or Maps work). · notes: Phase 3H discovery round (2026-10-10): JD listing + JD category-page snippets (Rs 1000 for two). No second independent directory surfaced.
- **Recommended initial verification_status:** unverified

### Row 115: S B Cake Palace

- **Confidence:** medium
- **Input:** locality: Nagadenahalli/Moparahalli corridor · city: Doddaballapura · coords: 13.2869351, 77.5953036 · source: https://www.osm.org/node/6761348188 · evidence: directory_reported · review_decision: needs_more_research · uncertainty: single open-data source (OpenStreetMap) — needs a directory second source; ODbL attribution applies · notes: Round-3 OSM pull (2026-10-11): element https://www.osm.org/node/6761348188 tags captured verbatim (license: OpenStreetMap contributors, ODbL 1.0).
- **Coordinates awaiting confirmation:** 13.2869351, 77.5953036 — evidence level: directory_reported · source: https://www.osm.org/node/6761348188. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Recommended initial verification_status:** unverified

### Row 117: Amrutha Canteen

- **Confidence:** medium
- **Input:** locality: Nagadenahalli/Moparahalli corridor · city: Doddaballapura · source: https://www.osm.org/way/720467268 · evidence: directory_reported · review_decision: possible_duplicate_hold · uncertainty: possible relation to worksheet row 'Amrutha Food Court' (Nagadenahalli) — no distinguishing evidence yet; hold for review. · notes: Round-3 OSM pull (2026-10-11): element https://www.osm.org/way/720467268 tags captured verbatim (license: OpenStreetMap contributors, ODbL 1.0).
- **Recommended initial verification_status:** unverified

### Row 118: Annaporna Cafe

- **Confidence:** medium
- **Input:** locality: Nagadenahalli/Moparahalli corridor · city: Doddaballapura · source: https://www.osm.org/way/720467269 · evidence: directory_reported · review_decision: needs_more_research · uncertainty: single open-data source (OpenStreetMap) — needs a directory second source; ODbL attribution applies · notes: Round-3 OSM pull (2026-10-11): element https://www.osm.org/way/720467269 tags captured verbatim (license: OpenStreetMap contributors, ODbL 1.0).
- **Recommended initial verification_status:** unverified

### Row 119: Indian Paratha Palace

- **Confidence:** medium
- **Input:** locality: Nandi Hills Road corridor · city: Doddaballapura · coords: 13.355991, 77.6537493 · source: https://www.osm.org/node/11117196994 · evidence: directory_reported · review_decision: needs_more_research · uncertainty: single open-data source (OpenStreetMap) — needs a directory second source; ODbL attribution applies · notes: Round-3 OSM pull (2026-10-11): element https://www.osm.org/node/11117196994 tags captured verbatim (license: OpenStreetMap contributors, ODbL 1.0).
- **Coordinates awaiting confirmation:** 13.355991, 77.6537493 — evidence level: directory_reported · source: https://www.osm.org/node/11117196994. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Recommended initial verification_status:** unverified

### Row 120: M.L.N.S.V Dhabha

- **Confidence:** medium
- **Input:** locality: Nandi Hills Road corridor · city: Doddaballapura · source: https://www.osm.org/way/632963326 · evidence: directory_reported · review_decision: needs_more_research · uncertainty: single open-data source (OpenStreetMap) — needs a directory second source; ODbL attribution applies · notes: Round-3 OSM pull (2026-10-11): element https://www.osm.org/way/632963326 tags captured verbatim (license: OpenStreetMap contributors, ODbL 1.0).
- **Recommended initial verification_status:** unverified

### Row 121: Tandem Cafe and Restaurants

- **Confidence:** medium
- **Input:** locality: Nandi Hills Road corridor · city: Doddaballapura · source: https://www.osm.org/way/1563577987 · evidence: directory_reported · review_decision: needs_more_research · uncertainty: single open-data source (OpenStreetMap) — needs a directory second source; ODbL attribution applies · notes: Round-3 OSM pull (2026-10-11): element https://www.osm.org/way/1563577987 tags captured verbatim (license: OpenStreetMap contributors, ODbL 1.0).
- **Recommended initial verification_status:** unverified

## Existing-record matches (no action taken — never auto-merged) (7)

### Row 116: Hotel Abiram

- **Confidence:** medium
- **Input:** locality: Nagadenahalli/Moparahalli corridor · city: Doddaballapura · coords: 13.2850057, 77.5962022 · source: https://www.osm.org/node/11348670810 · evidence: directory_reported · review_decision: possible_duplicate_hold · uncertainty: OSM name 'Hotel Abiram' is one letter from the LIVE row 'Abhiram Food Court' and the pin (~13.2850,77.5962) sits ~100 m from the live row's Moparahalli coordinates — possible spelling twin; hold. · notes: Round-3 OSM pull (2026-10-11): element https://www.osm.org/node/11348670810 tags captured verbatim (license: OpenStreetMap contributors, ODbL 1.0).
- **Matches to existing records:**
  - `c3936dec` **Abhiram Food Court** · locality: Moparahalli — similarity 0.857 (name-fuzzy-0.86, geo-≤150m) · distance: 0.012 km · existing coords: 13.2849612, 77.5963066 — confidence medium
- **Coordinates awaiting confirmation:** 13.2850057, 77.5962022 — evidence level: directory_reported · source: https://www.osm.org/node/11348670810. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `LOCALITY_CONFLICT`
- **Recommended initial verification_status:** unverified

### Row 122: Brundavana Family Restaurant

- **Confidence:** high
- **Input:** city: Doddaballapura · source: https://www.district.in/dining/doddaballapura/brundavana-restaurant-doddaballapura-locality · evidence: directory_reported · review_decision: same_as_existing · existing_match_id: 343812c9-168c-4cb8-ad8f-006a40704334 · uncertainty: live DB row has NO coordinates; district pin 13.2808648,77.5626556 is now on record for the future enrichment workflow · notes: Round-3 (2026-10-11): district.in listing matches this LIVE row on normalized name + area — NOT imported again. Identity-consistent differences recorded for a future reviewed ENRICHMENT workflow (imports never update live rows): live DB row has NO coordinates; district pin 13.2808648,77.5626556 is now on record for the future enrichment workflow.
- **Matches to existing records:**
  - `343812c9` **Brundavana Family Restaurant** · locality: Scout Camp Road — similarity 1 (name-exact) · existing coords: NULL — confidence high
- **Recommended initial verification_status:** unverified

### Row 123: Chickpet Donne Biryani House

- **Confidence:** high
- **Input:** city: Doddaballapura · source: https://www.district.in/dining/doddaballapura/chickpet-donne-biryani-house-doddaballapura-locality · evidence: directory_reported · review_decision: same_as_existing · existing_match_id: 5218d019-a529-400b-81db-6acac7450faa · uncertainty: live DB row has NO coordinates; district pin 13.2647436,77.5528258 is now on record for the future enrichment workflow · notes: Round-3 (2026-10-11): district.in listing matches this LIVE row on normalized name + area — NOT imported again. Identity-consistent differences recorded for a future reviewed ENRICHMENT workflow (imports never update live rows): live DB row has NO coordinates; district pin 13.2647436,77.5528258 is now on record for the future enrichment workflow.
- **Matches to existing records:**
  - `5218d019` **Chickpet Donne Biryani House** — similarity 1 (name-exact) · existing coords: NULL — confidence high
- **Recommended initial verification_status:** unverified

### Row 124: Hotel Halli Nanasu

- **Confidence:** high
- **Input:** city: Doddaballapura · source: https://www.district.in/dining/doddaballapura/hotel-halli-nanasu-1-doddaballapura-locality · evidence: directory_reported · review_decision: same_as_existing · existing_match_id: e6ba7907-b08e-4bb0-98d6-6da8370ef967 · uncertainty: live DB row has NO coordinates; district pin 13.2708594,77.55191 is now on record for the future enrichment workflow · notes: Round-3 (2026-10-11): district.in listing matches this LIVE row on normalized name + area — NOT imported again. Identity-consistent differences recorded for a future reviewed ENRICHMENT workflow (imports never update live rows): live DB row has NO coordinates; district pin 13.2708594,77.55191 is now on record for the future enrichment workflow.
- **Matches to existing records:**
  - `e6ba7907` **Hotel Halli Nanasu** · locality: Doddaballapura town — similarity 1 (name-exact) · existing coords: NULL — confidence high
- **Recommended initial verification_status:** unverified

### Row 125: Hotel Royal Nandhana

- **Confidence:** high
- **Input:** city: Doddaballapura · source: https://www.district.in/dining/doddaballapura/royal-nandhana-doddaballapura-locality · evidence: directory_reported · review_decision: same_as_existing · existing_match_id: e989603f-3316-4b09-a025-e41438d7a5a6 · uncertainty: live DB row has NO coordinates; district pin 13.2703861265,77.5518824603 is now on record for the future enrichment workflow · notes: Round-3 (2026-10-11): district.in listing matches this LIVE row on normalized name + area — NOT imported again. Identity-consistent differences recorded for a future reviewed ENRICHMENT workflow (imports never update live rows): live DB row has NO coordinates; district pin 13.2703861265,77.5518824603 is now on record for the future enrichment workflow.
- **Matches to existing records:**
  - `e989603f` **Hotel Royal Nandhana** · locality: Arehalli Guddadahalli — similarity 1 (name-exact) · existing coords: NULL — confidence high
- **Recommended initial verification_status:** unverified

### Row 126: Sri Ganesh Grand

- **Confidence:** high
- **Input:** city: Doddaballapura · source: https://www.district.in/dining/doddaballapura/sri-ganesh-grand-doddaballapura-locality · evidence: directory_reported · review_decision: same_as_existing · existing_match_id: 60cc569b-8eea-480d-8f92-f854bdddb87b · notes: Round-3 (2026-10-11): district.in listing matches this LIVE row on normalized name + area — NOT imported again. No conflicting fields observed.
- **Matches to existing records:**
  - `60cc569b` **Sri Ganesh Grand** · locality: Bashettihalli — similarity 1 (name-exact) · existing coords: 13.2679055, 77.5521405 — confidence high
- **Recommended initial verification_status:** unverified

### Row 127: SS Hyderabadi Biriyani Zone

- **Confidence:** high
- **Input:** city: Doddaballapura · source: https://www.district.in/dining/doddaballapura/ss-hyderabadi-biriyani-zone-doddaballapura-locality · evidence: directory_reported · review_decision: same_as_existing · existing_match_id: f37d212b-3845-4cd4-a6d7-b6a91cf4918c · notes: Round-3 (2026-10-11): district.in listing matches this LIVE row on normalized name + area — NOT imported again. No conflicting fields observed.
- **Matches to existing records:**
  - `f37d212b` **SS Hyderabadi Biriyani Zone** · locality: Nagadenahalli — similarity 1 (name-exact) · existing coords: 13.2846389, 77.6011256 — confidence high
- **Recommended initial verification_status:** unverified

## Possible duplicates / ambiguous — MANUAL REVIEW REQUIRED (65)

### Row 2: MP Kitchen

- **Confidence:** medium
- **Input:** address: Ground 20, Marasandra, Doddaballapura Locality, Doddaballapura · locality: Rajanukunte · city: Doddaballapura · phone: +919845864860 · coords: 13.2272025, 77.5493051 · source: https://www.district.in/dining/bangalore/mp-kitchen-doddaballapura-locality-doddaballapura · cuisine: North Indian, Indo-Chinese · listing_rating: 3.6 · listing_reviews: 5 · checked_on: 2026-10-11 · evidence: directory_reported · review_decision: needs_more_research · uncertainty: single structured directory source (district.in) — needs one independent second source before import (web-search quota exhausted this round) · notes: Round-3 systematic enumeration (2026-10-11): district.in dining sitemap (cdn.district.in/sitemap/sitemap-dining.xml, robots-declared) -> venue page fetched; JSON-LD captured verbatim.
- **Intra-file duplicates:** rows 31, 62 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.2272025, 77.5493051 — evidence level: directory_reported · source: https://www.district.in/dining/bangalore/mp-kitchen-doddaballapura-locality-doddaballapura. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 3: 1947 The Western Cafe House

- **Confidence:** medium
- **Input:** address: Kurubarahalli, Opposite RL Jalappa College, Doddaballapura Locality, Doddaballapura · locality: Doddaballapura town · city: Doddaballapura · phone: +916363884273 · coords: 13.3006833, 77.5245033 · source: https://www.district.in/dining/doddaballapura/1947-the-western-cafe-house-doddaballapura-locality · evidence: directory_reported · review_decision: needs_more_research · uncertainty: single structured directory source (district.in) — needs one independent second source before import (web-search quota exhausted this round) · notes: Round-3 systematic enumeration (2026-10-11): district.in dining sitemap (cdn.district.in/sitemap/sitemap-dining.xml, robots-declared) -> venue page fetched; JSON-LD captured verbatim.
- **Intra-file duplicates:** rows 27 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.3006833, 77.5245033 — evidence level: directory_reported · source: https://www.district.in/dining/doddaballapura/1947-the-western-cafe-house-doddaballapura-locality. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 5: Appu Rolls

- **Confidence:** medium
- **Input:** address: Industrial Area Railway Station Road, Doddaballapura Locality, Doddaballapura · locality: Doddaballapura Railway Station · city: Doddaballapura · phone: +919740777639 · coords: 13.279762, 77.557415 · source: https://www.district.in/dining/doddaballapura/appu-rolls-doddaballapura-locality · evidence: directory_reported · review_decision: needs_more_research · uncertainty: single structured directory source (district.in) — needs one independent second source before import (web-search quota exhausted this round) · notes: Round-3 systematic enumeration (2026-10-11): district.in dining sitemap (cdn.district.in/sitemap/sitemap-dining.xml, robots-declared) -> venue page fetched; JSON-LD captured verbatim.
- **Intra-file duplicates:** rows 16, 84, 101, 113 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.279762, 77.557415 — evidence level: directory_reported · source: https://www.district.in/dining/doddaballapura/appu-rolls-doddaballapura-locality. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 6: Arun Ice Creams

- **Confidence:** medium
- **Input:** address: Kasaba Police station road, Rojipura, Doddaballapura Locality, Doddaballapura · locality: Doddaballapura town · city: Doddaballapura · phone: +919066676260 · coords: 13.30581, 77.5376 · source: https://www.district.in/dining/doddaballapura/arun-ice-creams-doddaballapura-locality · cuisine: Ice Cream · listing_rating: 4.2 · listing_reviews: 5 · checked_on: 2026-10-11 · evidence: directory_reported · review_decision: distinct_new_business · uncertainty: Proximity advisory reviewed: ~67 m from 'I Cake Bakery' — distinct name, distinct phone, separate listings; same-street neighbours, not duplicates.; Proximity advisory reviewed: ~146 m from 'Udupi Upahar' — distinct name, distinct phone, separate listings; same-street neighbours, not duplicates. · notes: Round-3 systematic enumeration (2026-10-11): district.in dining sitemap (cdn.district.in/sitemap/sitemap-dining.xml, robots-declared) -> venue page fetched; JSON-LD captured verbatim. Second source: magicpin listing https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Arun-Ice-Creams/store/1670b06 (name match 1.0, area Doddaballapur) magicpin listing shows the Verified badge
- **Intra-file duplicates:** rows 19, 30, 108 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.30581, 77.5376 — evidence level: directory_reported · source: https://www.district.in/dining/doddaballapura/arun-ice-creams-doddaballapura-locality. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 7: Ayodhya Grand

- **Confidence:** medium
- **Input:** address: Putani Complex, B H Road, Doddaballapura Locality, Doddaballapura · locality: Doddaballapura outskirts (NH-44 south) · city: Doddaballapura · phone: +919480357156 · coords: 13.2648369621, 77.5529341939 · source: https://www.district.in/dining/doddaballapura/ayodhya-grand-doddaballapura-locality · cuisine: South Indian, North Indian · listing_rating: 4.0 · listing_reviews: 12 · checked_on: 2026-10-11 · evidence: directory_reported · review_decision: distinct_new_business · uncertainty: Proximity advisory reviewed (live row 'Sri Ganesh Grand'): ~352 m — distinct name, distinct phone, separate directory listings; same-street neighbours, not duplicates. · notes: Round-3 systematic enumeration (2026-10-11): district.in dining sitemap (cdn.district.in/sitemap/sitemap-dining.xml, robots-declared) -> venue page fetched; JSON-LD captured verbatim. Second source: magicpin listing https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Ayodhya-Grand/store/1570332 (name match 1.0, area Doddaballapur) magicpin listing shows the Verified badge
- **Matches to existing records:**
  - `60cc569b` **Sri Ganesh Grand** · locality: Bashettihalli — similarity 0.538 (name-ambiguous-proper-token, geo-≤0.5km) · distance: 0.352 km · existing coords: 13.2679055, 77.5521405 — confidence low
  - `987dad98` **Shri Manjunatha Grand Veg** · locality: Doddaballapura Railway Station — similarity 0.4 (name-ambiguous-proper-token) · existing coords: NULL — confidence low
- **Intra-file duplicates:** rows 66 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.2648369621, 77.5529341939 — evidence level: directory_reported · source: https://www.district.in/dining/doddaballapura/ayodhya-grand-doddaballapura-locality. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `LOCALITY_CONFLICT`, `LOCALITY_CONFLICT`, `EXISTING_COORDINATES_DIFFER`, `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 8: Bangarpete Chats

- **Confidence:** medium
- **Input:** address: Muktambika Main Road, Near Tamil Nadu Bank, Doddaballapura Locality, Doddaballapura · locality: Doddaballapura town (north edge) · city: Doddaballapura · phone: +918310680506 · coords: 13.2948625, 77.5401094 · source: https://www.district.in/dining/doddaballapura/bangarpete-chats-doddaballapura-locality · listing_rating: 3.6 · listing_reviews: 4 · checked_on: 2026-10-11 · evidence: directory_reported · review_decision: distinct_new_business · uncertainty: hours windows conflict across days ([('12:00', '21:00'), ('12:30', '21:00'), ('13:00', '21:00'), ('13:15', '21:00'), ('13:30', '21:00')]) -> blank per conflict rule; Proximity advisory reviewed: ~110 m from 'Kwality Walls' — distinct name, distinct phone, separate listings; same-street neighbours, not duplicates. · notes: Round-3 systematic enumeration (2026-10-11): district.in dining sitemap (cdn.district.in/sitemap/sitemap-dining.xml, robots-declared) -> venue page fetched; JSON-LD captured verbatim. Second source: magicpin listing https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Bangarpete-Chats/store/1570006 (name match 1.0, area Doddaballapur) magicpin listing shows the Verified badge
- **Intra-file duplicates:** rows 34, 63 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.2948625, 77.5401094 — evidence level: directory_reported · source: https://www.district.in/dining/doddaballapura/bangarpete-chats-doddaballapura-locality. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 9: Banglore Iyengar Bakery & Sweets

- **Confidence:** medium
- **Input:** address: Shengarapet, Opposite Soundarya Mahal Takies, Doddaballapura Locality, Doddaballapura · locality: Doddaballapura town (north edge) · city: Doddaballapura · phone: +917019527301 · coords: 13.2939841185, 77.5425419211 · source: https://www.district.in/dining/doddaballapura/banglore-iyengar-bakery-sweets-doddaballapura-locality · cuisine: Bakery, Desserts · listing_rating: 4.0 · listing_reviews: 32 · checked_on: 2026-10-11 · evidence: directory_reported · review_decision: distinct_new_business · uncertainty: Proximity advisory reviewed: ~72 m from 'Mallu Hindu Military Hotel' — distinct name, distinct phone, separate listings; same-street neighbours, not duplicates.; Proximity advisory reviewed: ~20 m from 'Naati Mane' — distinct name, distinct phone, separate listings; same-street neighbours, not duplicates. · notes: Round-3 systematic enumeration (2026-10-11): district.in dining sitemap (cdn.district.in/sitemap/sitemap-dining.xml, robots-declared) -> venue page fetched; JSON-LD captured verbatim. Second source: magicpin listing https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Banglore-Iyengar-Bakery-and-Sweets/store/16b682b (name match 1.0, area Doddaballapur) magicpin listing shows the Verified badge
- **Intra-file duplicates:** rows 37, 40, 107 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.2939841185, 77.5425419211 — evidence level: directory_reported · source: https://www.district.in/dining/doddaballapura/banglore-iyengar-bakery-sweets-doddaballapura-locality. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 12: Cafe Aaraike

- **Confidence:** medium
- **Input:** address: Abhi Nivas, Jalappa College Road, Doddaballapura Locality, Doddaballapura · locality: Doddaballapura town (north edge) · city: Doddaballapura · phone: +919606117733 · coords: 13.2998785778, 77.5283190721 · source: https://www.district.in/dining/doddaballapura/cafe-aaraike-doddaballapura-locality · cuisine: American, Italian · evidence: directory_reported · review_decision: distinct_new_business · uncertainty: hours windows conflict across days ([('12:00', '21:30'), ('12:30', '21:15'), ('12:30', '22:00')]) -> blank per conflict rule; Proximity advisory reviewed: ~146 m from 'Shahi Kitchen' — distinct name, distinct phone, separate listings; same-street neighbours, not duplicates.; Proximity advisory reviewed: ~9 m from 'Zoop Cafe' — distinct name, distinct phone, separate listings; same-street neighbours, not duplicates. · notes: Round-3 systematic enumeration (2026-10-11): district.in dining sitemap (cdn.district.in/sitemap/sitemap-dining.xml, robots-declared) -> venue page fetched; JSON-LD captured verbatim. Second source: magicpin listing https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Cafe-Aaraike/store/16b6830 (name match 1.0, area Doddaballapur) magicpin listing shows the Verified badge
- **Intra-file duplicates:** rows 50, 52, 112 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.2998785778, 77.5283190721 — evidence level: directory_reported · source: https://www.district.in/dining/doddaballapura/cafe-aaraike-doddaballapura-locality. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 16: Dada Tea And Chats

- **Confidence:** medium
- **Input:** address: Rangaswamy Complex, Scout Camp Road, Doddaballapura Locality, Doddaballapura · locality: Doddaballapura Railway Station · city: Doddaballapura · phone: +917813003674 · coords: 13.2800116791, 77.5576570558 · source: https://www.district.in/dining/doddaballapura/dada-tea-and-chats-doddaballapura-locality · evidence: directory_reported · review_decision: distinct_new_business · uncertainty: Proximity advisory reviewed: ~75 m from 'Hotel Bindushree Family Restaurant' — distinct name, distinct phone, separate listings; same-street neighbours, not duplicates.; Proximity advisory reviewed: ~103 m from 'Five Star Kohli Hut' — distinct name, distinct phone, separate listings; same-street neighbours, not duplicates. · notes: Round-3 systematic enumeration (2026-10-11): district.in dining sitemap (cdn.district.in/sitemap/sitemap-dining.xml, robots-declared) -> venue page fetched; JSON-LD captured verbatim. Second source: magicpin listing https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Dada-Tea-And-Chats/store/1758a31 (name match 1.0, area Doddaballapur) magicpin listing shows the Verified badge
- **Intra-file duplicates:** rows 5, 84, 113 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.2800116791, 77.5576570558 — evidence level: directory_reported · source: https://www.district.in/dining/doddaballapura/dada-tea-and-chats-doddaballapura-locality. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 17: Darbar The Cafe

- **Confidence:** medium
- **Input:** address: 556, 1st Ward, Shanti Nagar, Doddaballapura Locality, Doddaballapura · locality: Doddaballapura town · city: Doddaballapura · phone: +918722556955 · coords: 13.3084363493, 77.5425960441 · source: https://www.district.in/dining/doddaballapura/darbar-the-cafe-doddaballapura-locality · cuisine: Tibetan · listing_rating: 2.7 · listing_reviews: 7 · checked_on: 2026-10-11 · evidence: directory_reported · review_decision: distinct_new_business · uncertainty: Proximity advisory reviewed: ~139 m from 'Durgashree Samruddhi Garden' — distinct name, distinct phone, separate listings; same-street neighbours, not duplicates.; Proximity advisory reviewed: ~144 m from 'Mathsya Darshini' — distinct name, distinct phone, separate listings; same-street neighbours, not duplicates.; Proximity advisory reviewed: ~75 m from 'Veg Sandwich And Lassi Point' — distinct name, distinct phone, separate listings; same-street neighbours, not duplicates. · notes: Round-3 systematic enumeration (2026-10-11): district.in dining sitemap (cdn.district.in/sitemap/sitemap-dining.xml, robots-declared) -> venue page fetched; JSON-LD captured verbatim. Second source: magicpin listing https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Darbar-The-Cafe/store/1758a37 (name match 1.0, area Doddaballapur) magicpin listing shows the Verified badge
- **Intra-file duplicates:** rows 21, 38, 68 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.3084363493, 77.5425960441 — evidence level: directory_reported · source: https://www.district.in/dining/doddaballapura/darbar-the-cafe-doddaballapura-locality. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 18: Devangas Kitchen

- **Confidence:** medium
- **Input:** address: Muthyalamma, Jalappa College Road, Doddaballapura Locality, Doddaballapura · locality: Doddaballapura town (north edge) · city: Doddaballapura · phone: +918050948778 · coords: 13.2991208, 77.5300155 · source: https://www.district.in/dining/doddaballapura/devangas-kitchen-doddaballapura-locality · cuisine: South Indian, North Indian · listing_rating: 4.0 · listing_reviews: 24 · checked_on: 2026-10-11 · evidence: directory_reported · review_decision: distinct_new_business · uncertainty: hours windows conflict across days ([('06:45', '23:00'), ('08:15', '23:30'), ('08:30', '23:00'), ('08:30', '23:30'), ('08:30', '23:45')]) -> blank per conflict rule; Proximity advisory reviewed: ~33 m from 'DREAM CAFE' — distinct name, distinct phone, separate listings; same-street neighbours, not duplicates.; Proximity advisory reviewed: ~60 m from 'Shahi Kitchen' — distinct name, distinct phone, separate listings; same-street neighbours, not duplicates. · notes: Round-3 systematic enumeration (2026-10-11): district.in dining sitemap (cdn.district.in/sitemap/sitemap-dining.xml, robots-declared) -> venue page fetched; JSON-LD captured verbatim. Second source: magicpin listing https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Devangas-Kitchen/store/16b6831 (name match 1.0, area Doddaballapur) magicpin listing shows the Verified badge
- **Intra-file duplicates:** rows 20, 52 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.2991208, 77.5300155 — evidence level: directory_reported · source: https://www.district.in/dining/doddaballapura/devangas-kitchen-doddaballapura-locality. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 19: Domino's Pizza

- **Confidence:** medium
- **Input:** address: 187/3795/5766, 12 and 188/3796/5767, 13, Ground Floor, 3rd Stage, Doddaballapura Locality, Doddaballapura · locality: Doddaballapura town · city: Doddaballapura · phone: +918029912619 · coords: 13.305617, 77.537771 · source: https://www.district.in/dining/doddaballapura/dominos-pizza-doddaballapura-locality · cuisine: Italian, North Indian · listing_rating: 3.5 · listing_reviews: 19 · checked_on: 2026-10-11 · evidence: directory_reported · review_decision: needs_more_research · uncertainty: hours windows conflict across days ([('00:00', '00:45'), ('11:00', '23:59')]) -> blank per conflict rule; phone differs across sources: district +918029912619 vs magicpin +918217639092; area mismatch: district pin says 'Doddaballapura town' but magicpin files it under 'Rajanukunte' — branch identity needs confirmation; same-name branch ambiguity in the corridor — branch identity needs an on-site/pass check · notes: Round-3 systematic enumeration (2026-10-11): district.in dining sitemap (cdn.district.in/sitemap/sitemap-dining.xml, robots-declared) -> venue page fetched; JSON-LD captured verbatim. Second source: magicpin listing https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Dominos-Pizza/store/209abc3 (name match 1.0, area Rajanukunte) magicpin listing shows the Verified badge
- **Intra-file duplicates:** rows 6, 30 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.305617, 77.537771 — evidence level: directory_reported · source: https://www.district.in/dining/doddaballapura/dominos-pizza-doddaballapura-locality. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 20: DREAM CAFE

- **Confidence:** medium
- **Input:** address: Sri Doddama Thayi Complex, Near Mutliyama Temple, RL Jalapa College Main Road, Doddaballapura Locality, Doddaballapura · locality: Doddaballapura town (north edge) · city: Doddaballapura · phone: +919148630818 · coords: 13.299307, 77.529778 · source: https://www.district.in/dining/doddaballapura/dream-cafe-doddaballapura-locality · cuisine: American, Continental · listing_rating: 3.4 · listing_reviews: 15 · checked_on: 2026-10-11 · evidence: directory_reported · review_decision: distinct_new_business · uncertainty: Proximity advisory reviewed: ~33 m from 'Devangas Kitchen' — distinct name, distinct phone, separate listings; same-street neighbours, not duplicates.; Proximity advisory reviewed: ~28 m from 'Shahi Kitchen' — distinct name, distinct phone, separate listings; same-street neighbours, not duplicates. · notes: Round-3 systematic enumeration (2026-10-11): district.in dining sitemap (cdn.district.in/sitemap/sitemap-dining.xml, robots-declared) -> venue page fetched; JSON-LD captured verbatim. Second source: magicpin listing https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Dream-Cafe/store/16b6832 (name match 1.0, area Doddaballapur) magicpin listing shows the Verified badge
- **Intra-file duplicates:** rows 18, 52 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.299307, 77.529778 — evidence level: directory_reported · source: https://www.district.in/dining/doddaballapura/dream-cafe-doddaballapura-locality. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 21: Durgashree Samruddhi Garden

- **Confidence:** medium
- **Input:** address: Bengaluru Hindupur Road, Opposite Town Police Station, Doddaballapura Locality, Doddaballapura · locality: Doddaballapura town · city: Doddaballapura · phone: +918088141379 · coords: 13.3085389173, 77.5438789937 · source: https://www.district.in/dining/doddaballapura/durgashree-samruddhi-garden-1-doddaballapura-locality · cuisine: North Indian, South Indian, Chinese · listing_rating: 4.3 · listing_reviews: 846 · checked_on: 2026-10-11 · evidence: directory_reported · review_decision: distinct_new_business · uncertainty: Proximity advisory reviewed: ~139 m from 'Darbar The Cafe' — distinct name, distinct phone, separate listings; same-street neighbours, not duplicates.; Proximity advisory reviewed: ~148 m from 'Veg Sandwich And Lassi Point' — distinct name, distinct phone, separate listings; same-street neighbours, not duplicates. · notes: Round-3 systematic enumeration (2026-10-11): district.in dining sitemap (cdn.district.in/sitemap/sitemap-dining.xml, robots-declared) -> venue page fetched; JSON-LD captured verbatim. Second source: magicpin listing https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Durgashree-Samruddhi-Garden/store/1794b94 (name match 1.0, area Doddaballapur) magicpin listing shows the Verified badge
- **Intra-file duplicates:** rows 17, 68 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.3085389173, 77.5438789937 — evidence level: directory_reported · source: https://www.district.in/dining/doddaballapura/durgashree-samruddhi-garden-1-doddaballapura-locality. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 22: Five Star Chicken

- **Confidence:** medium
- **Input:** address: Scout Camp Road, 3 Ward, Near Railway Station, Doddaballapura Locality, Doddaballapura · locality: Doddaballapura Railway Station · city: Doddaballapura · phone: +919538872732 · coords: 13.2798262, 77.5559189 · source: https://www.district.in/dining/doddaballapura/five-star-chicken-4-doddaballapura-locality · cuisine: Street Food, American, North Indian, Continental · listing_rating: 3.9 · listing_reviews: 54 · checked_on: 2026-10-11 · evidence: directory_reported · review_decision: needs_more_research · uncertainty: phone differs across sources: district +919538872732 vs magicpin +919900055623; area mismatch: district pin says 'Doddaballapura Railway Station' but magicpin files it under 'Rajanukunte' — branch identity needs confirmation; same-name branch ambiguity in the corridor — branch identity needs an on-site/pass check · notes: Round-3 systematic enumeration (2026-10-11): district.in dining sitemap (cdn.district.in/sitemap/sitemap-dining.xml, robots-declared) -> venue page fetched; JSON-LD captured verbatim. Second source: magicpin listing https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Five-Star-Chicken/store/19bcc1 (name match 1.0, area Rajanukunte) magicpin listing shows the Verified badge
- **Intra-file duplicates:** rows 23, 77, 84, 101, 113 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.2798262, 77.5559189 — evidence level: directory_reported · source: https://www.district.in/dining/doddaballapura/five-star-chicken-4-doddaballapura-locality. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 23: Five Star Chicken

- **Confidence:** medium
- **Input:** address: Sangeetha Complex, Gangadhrapura, Doddaballapura Locality, Doddaballapura · locality: Doddaballapura town · city: Doddaballapura · phone: +919980659933 · coords: 13.3025657639, 77.5383659198 · source: https://www.district.in/dining/doddaballapura/five-star-chicken-doddaballapura-locality · listing_rating: 3.9 · listing_reviews: 54 · checked_on: 2026-10-11 · evidence: directory_reported · review_decision: needs_more_research · uncertainty: phone differs across sources: district +919980659933 vs magicpin +919900055623; area mismatch: district pin says 'Doddaballapura town' but magicpin files it under 'Rajanukunte' — branch identity needs confirmation; same-name branch ambiguity in the corridor — branch identity needs an on-site/pass check · notes: Round-3 systematic enumeration (2026-10-11): district.in dining sitemap (cdn.district.in/sitemap/sitemap-dining.xml, robots-declared) -> venue page fetched; JSON-LD captured verbatim. Second source: magicpin listing https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Five-Star-Chicken/store/19bcc1 (name match 1.0, area Rajanukunte) magicpin listing shows the Verified badge
- **Intra-file duplicates:** rows 22, 42, 61 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.3025657639, 77.5383659198 — evidence level: directory_reported · source: https://www.district.in/dining/doddaballapura/five-star-chicken-doddaballapura-locality. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 25: G P Non Veg Corner

- **Confidence:** medium
- **Input:** address: 1458, TCS Plaza Complex, D Cross Doddaballapura Locality, Doddaballapura · locality: Doddaballapura town · city: Doddaballapura · phone: +919538224555 · coords: 13.306933, 77.54537 · source: https://www.district.in/dining/doddaballapura/g-p-non-veg-corner-doddaballapura-locality · cuisine: North Indian, Mughlai · listing_rating: 3.2 · listing_reviews: 8 · checked_on: 2026-10-11 · evidence: directory_reported · review_decision: distinct_new_business · uncertainty: hours windows conflict across days ([('09:00', '22:45'), ('11:00', '22:00'), ('11:15', '22:15')]) -> blank per conflict rule; Proximity advisory reviewed: ~56 m from 'R R Lunch House' — distinct name, distinct phone, separate listings; same-street neighbours, not duplicates.; Proximity advisory reviewed: ~126 m from 'Raj Dam Biryani Center & Family Restaurant' — distinct name, distinct phone, separate listings; same-street neighbours, not duplicates. · notes: Round-3 systematic enumeration (2026-10-11): district.in dining sitemap (cdn.district.in/sitemap/sitemap-dining.xml, robots-declared) -> venue page fetched; JSON-LD captured verbatim. Second source: magicpin listing https://magicpin.in/Bangalore/Doddaballapur/Restaurant/G-P-Non-Veg-Corner/store/1569678 (name match 1.0, area Doddaballapur) magicpin listing shows the Verified badge
- **Intra-file duplicates:** rows 44, 45 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.306933, 77.54537 — evidence level: directory_reported · source: https://www.district.in/dining/doddaballapura/g-p-non-veg-corner-doddaballapura-locality. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 26: Golden Cafe & Resto

- **Confidence:** medium
- **Input:** address: 3rd Ward, Kempegowda Nagar, Near Railway Station, Doddaballapura Locality, Doddaballapura · locality: Doddaballapura Railway Station · city: Doddaballapura · phone: +918978892122 · coords: 13.2810952913, 77.5519558217 · source: https://www.district.in/dining/doddaballapura/golden-cafe-resto-doddaballapura-locality · cuisine: Continental, American, Street Food · listing_rating: 4.1 · listing_reviews: 41 · checked_on: 2026-10-11 · evidence: directory_reported · review_decision: distinct_new_business · uncertainty: Proximity advisory reviewed (live row 'Ayyappa Tiffin Room'): ~135 m — distinct name, distinct phone, separate directory listings; same-street neighbours, not duplicates.; Proximity advisory reviewed: ~73 m from 'Mr Shawarma Miss Grills' — distinct name, distinct phone, separate listings; same-street neighbours, not duplicates.; Proximity advisory reviewed: ~88 m from 'Rajanna Nati Style Dum Biryani' — distinct name, distinct phone, separate listings; same-street neighbours, not duplicates. · notes: Round-3 systematic enumeration (2026-10-11): district.in dining sitemap (cdn.district.in/sitemap/sitemap-dining.xml, robots-declared) -> venue page fetched; JSON-LD captured verbatim. Second source: magicpin listing https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Golden-Cafe-and-Resto/store/1758a2a (name match 1.0, area Doddaballapur) magicpin listing shows the Verified badge
- **Intra-file duplicates:** rows 39, 46, 89 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.2810952913, 77.5519558217 — evidence level: directory_reported · source: https://www.district.in/dining/doddaballapura/golden-cafe-resto-doddaballapura-locality. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 27: Golden Kabab & Fried Rice

- **Confidence:** medium
- **Input:** address: Ground Floor, Kurabanahalli Villege, Opposite Jalappa Institute Of Technology College, Doddaballapura Locality, Doddaballapura · locality: Doddaballapura town · city: Doddaballapura · phone: +917019809774 · coords: 13.30069828, 77.52401098 · source: https://www.district.in/dining/doddaballapura/golden-kabab-fried-rice-doddaballapura-locality · evidence: directory_reported · review_decision: needs_more_research · uncertainty: single structured directory source (district.in) — needs one independent second source before import (web-search quota exhausted this round) · notes: Round-3 systematic enumeration (2026-10-11): district.in dining sitemap (cdn.district.in/sitemap/sitemap-dining.xml, robots-declared) -> venue page fetched; JSON-LD captured verbatim.
- **Intra-file duplicates:** rows 3 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.30069828, 77.52401098 — evidence level: directory_reported · source: https://www.district.in/dining/doddaballapura/golden-kabab-fried-rice-doddaballapura-locality. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 30: I Cake Bakery

- **Confidence:** medium
- **Input:** address: 15/4, Sri Ranga Arcade, Gangadarapura, Near Barat Gas Godown, Doddaballapura Locality, Doddaballapura · locality: Doddaballapura town · city: Doddaballapura · phone: +918884111855 · coords: 13.3063965872, 77.5374441399 · source: https://www.district.in/dining/doddaballapura/i-cake-bakery-doddaballapura-locality · cuisine: Bakery, Desserts · listing_rating: 4.9 · listing_reviews: 1 · checked_on: 2026-10-11 · evidence: directory_reported · review_decision: distinct_new_business · uncertainty: Proximity advisory reviewed: ~67 m from 'Arun Ice Creams' — distinct name, distinct phone, separate listings; same-street neighbours, not duplicates.; Proximity advisory reviewed: ~81 m from 'Udupi Upahar' — distinct name, distinct phone, separate listings; same-street neighbours, not duplicates. · notes: Round-3 systematic enumeration (2026-10-11): district.in dining sitemap (cdn.district.in/sitemap/sitemap-dining.xml, robots-declared) -> venue page fetched; JSON-LD captured verbatim. Second source: magicpin listing https://magicpin.in/Bangalore/Doddaballapur/Restaurant/I-Cake-Bakery/store/1568256 (name match 1.0, area Doddaballapur) magicpin listing shows the Verified badge
- **Intra-file duplicates:** rows 6, 19, 108 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.3063965872, 77.5374441399 — evidence level: directory_reported · source: https://www.district.in/dining/doddaballapura/i-cake-bakery-doddaballapura-locality. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 31: Ifruit

- **Confidence:** medium
- **Input:** address: Marasandra, Near Providentwelworth City, Doddaballapura Locality, Doddaballapura · locality: Rajanukunte · city: Doddaballapura · phone: +917899785747 · coords: 13.2279075, 77.5498265 · source: https://www.district.in/dining/doddaballapura/ifruit-doddaballapura-locality · cuisine: Desserts, Street Food, Continental · evidence: directory_reported · review_decision: needs_more_research · uncertainty: single structured directory source (district.in) — needs one independent second source before import (web-search quota exhausted this round) · notes: Round-3 systematic enumeration (2026-10-11): district.in dining sitemap (cdn.district.in/sitemap/sitemap-dining.xml, robots-declared) -> venue page fetched; JSON-LD captured verbatim.
- **Intra-file duplicates:** rows 2, 48, 62, 64 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.2279075, 77.5498265 — evidence level: directory_reported · source: https://www.district.in/dining/doddaballapura/ifruit-doddaballapura-locality. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 34: Kwality Walls

- **Confidence:** medium
- **Input:** address: Ward 21, Hemavathi Pete, Doddaballapura Locality, Doddaballapura · locality: Doddaballapura town (north edge) · city: Doddaballapura · phone: +919986902001 · coords: 13.2944632, 77.5391822 · source: https://www.district.in/dining/doddaballapura/kwality-walls-doddaballapura-locality · cuisine: Ice Cream · listing_rating: 4.0 · listing_reviews: 27 · checked_on: 2026-10-11 · evidence: directory_reported · review_decision: distinct_new_business · uncertainty: Proximity advisory reviewed: ~110 m from 'Bangarpete Chats' — distinct name, distinct phone, separate listings; same-street neighbours, not duplicates. · notes: Round-3 systematic enumeration (2026-10-11): district.in dining sitemap (cdn.district.in/sitemap/sitemap-dining.xml, robots-declared) -> venue page fetched; JSON-LD captured verbatim. Second source: magicpin listing https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Kwality-Walls/store/162a702 (name match 1.0, area Doddaballapur) magicpin listing shows the Verified badge
- **Intra-file duplicates:** rows 8, 63 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.2944632, 77.5391822 — evidence level: directory_reported · source: https://www.district.in/dining/doddaballapura/kwality-walls-doddaballapura-locality. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 35: Lounge de La Réserve

- **Confidence:** medium
- **Input:** address: Raghunathapur, Doddaballapura Locality, Doddaballapura · locality: Nagadenahalli/Moparahalli corridor · city: Doddaballapura · phone: +916366946331 · coords: 13.286726, 77.5824616 · source: https://www.district.in/dining/doddaballapura/lounge-de-la-r%C3%A9serve-2-doddaballapura-locality · cuisine: Continental, Asian, Mediterranean · evidence: directory_reported · review_decision: needs_more_research · uncertainty: area mismatch: district pin says 'Nagadenahalli/Moparahalli corridor' but magicpin files it under 'Bashettihalli' — branch identity needs confirmation · notes: Round-3 systematic enumeration (2026-10-11): district.in dining sitemap (cdn.district.in/sitemap/sitemap-dining.xml, robots-declared) -> venue page fetched; JSON-LD captured verbatim. Second source: magicpin listing https://magicpin.in/Bangalore/Bashettihalli/Restaurant/Lounge-De-La-Réserve/store/163b85a (name match 1.0, area Bashettihalli) Prior phase-3H human review recommended do-not-import (out of zone); the district geo (13.2867,77.5824) is recorded for a future reviewer to re-decide. NOT imported this round — no silent reversal of the earlier review.
- **Intra-file duplicates:** rows 114 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.286726, 77.5824616 — evidence level: directory_reported · source: https://www.district.in/dining/doddaballapura/lounge-de-la-r%C3%A9serve-2-doddaballapura-locality. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 36: M M Biriyani Grand

- **Confidence:** medium
- **Input:** address: SLV Complex, Near Basava Bhavana, Doddaballapura Locality, Doddaballapura · locality: Doddaballapura town · city: Doddaballapura · phone: +917892040405 · coords: 13.3092425, 77.5369393 · source: https://www.district.in/dining/doddaballapura/m-m-biriyani-grand-doddaballapura-locality · cuisine: North Indian, South Indian, Indo-Chinese · evidence: directory_reported · review_decision: distinct_new_business · uncertainty: Validator advisory reviewed (INTRA_FILE_DUPLICATE): intra-file pair(s) ['Durgashree Samruddhi Grand Veg'] — reviewed: different business (distinct normalized name and phone; the shared element is a generic street/name token or ordinary town density). Recorded for the human reviewer. · notes: Round-3 systematic enumeration (2026-10-11): district.in dining sitemap (cdn.district.in/sitemap/sitemap-dining.xml, robots-declared) -> venue page fetched; JSON-LD captured verbatim. Second source: magicpin listing https://magicpin.in/Bangalore/Doddaballapur/Restaurant/M-M-Biriyani-Grand/store/159c215 (name match 1.0, area Doddaballapur) magicpin listing shows the Verified badge
- **Intra-file duplicates:** rows 110 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.3092425, 77.5369393 — evidence level: directory_reported · source: https://www.district.in/dining/doddaballapura/m-m-biriyani-grand-doddaballapura-locality. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 37: Mallu Hindu Military Hotel

- **Confidence:** medium
- **Input:** address: Old Bus Stand Road, Hemavathi Pete, Doddaballapura Locality, Doddaballapura · locality: Doddaballapura town (north edge) · city: Doddaballapura · phone: +919066333133 · coords: 13.2937834, 77.5419057 · source: https://www.district.in/dining/doddaballapura/mallu-hindu-military-hotel-doddaballapura-locality · listing_rating: 4.0 · listing_reviews: 220 · checked_on: 2026-10-11 · evidence: directory_reported · review_decision: distinct_new_business · uncertainty: Proximity advisory reviewed: ~72 m from 'Banglore Iyengar Bakery & Sweets' — distinct name, distinct phone, separate listings; same-street neighbours, not duplicates.; Proximity advisory reviewed: ~92 m from 'Naati Mane' — distinct name, distinct phone, separate listings; same-street neighbours, not duplicates. · notes: Round-3 systematic enumeration (2026-10-11): district.in dining sitemap (cdn.district.in/sitemap/sitemap-dining.xml, robots-declared) -> venue page fetched; JSON-LD captured verbatim. Second source: magicpin listing https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Mallu-Hindu-Military-Hotel/store/168b660 (name match 1.0, area Doddaballapur) magicpin listing shows the Verified badge
- **Intra-file duplicates:** rows 9, 40, 107 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.2937834, 77.5419057 — evidence level: directory_reported · source: https://www.district.in/dining/doddaballapura/mallu-hindu-military-hotel-doddaballapura-locality. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 38: Mathsya Darshini

- **Confidence:** medium
- **Input:** address: Vinayaka Nagar Rojipura, 2nd Ward, Doddaballapura Locality, Doddaballapura · locality: Doddaballapura town · city: Doddaballapura · phone: +919964444086 · coords: 13.3097294676, 77.5424768975 · source: https://www.district.in/dining/doddaballapura/mathsya-darshini-doddaballapura-locality · cuisine: Chinese, North Indian · listing_rating: 4.9 · listing_reviews: 1 · checked_on: 2026-10-11 · evidence: directory_reported · review_decision: distinct_new_business · uncertainty: hours windows conflict across days ([('10:30', '21:30'), ('11:30', '21:30')]) -> blank per conflict rule; Proximity advisory reviewed: ~144 m from 'Darbar The Cafe' — distinct name, distinct phone, separate listings; same-street neighbours, not duplicates.; Proximity advisory reviewed: ~27 m from 'Sujatha Fish Cort' — distinct name, distinct phone, separate listings; same-street neighbours, not duplicates.; Proximity advisory reviewed: ~71 m from 'Veg Sandwich And Lassi Point' — distinct name, distinct phone, separate listings; same-street neighbours, not duplicates. · notes: Round-3 systematic enumeration (2026-10-11): district.in dining sitemap (cdn.district.in/sitemap/sitemap-dining.xml, robots-declared) -> venue page fetched; JSON-LD captured verbatim. Second source: magicpin listing https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Mathsya-Darshini/store/163b875 (name match 1.0, area Doddaballapur) magicpin listing shows the Verified badge
- **Intra-file duplicates:** rows 17, 60, 68 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.3097294676, 77.5424768975 — evidence level: directory_reported · source: https://www.district.in/dining/doddaballapura/mathsya-darshini-doddaballapura-locality. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 39: Mr Shawarma Miss Grills

- **Confidence:** medium
- **Input:** address: Kabadi Complex, Opposite Hanuman Temple, Doddaballapura Locality, Doddaballapura · locality: Doddaballapura Railway Station / Scout Camp Rd · city: Doddaballapura · phone: +917338023660 · coords: 13.2805484, 77.5523229 · source: https://www.district.in/dining/doddaballapura/mr-shawarma-miss-grills-1-doddaballapura-locality · listing_rating: 3 · listing_reviews: 4 · checked_on: 2026-10-11 · evidence: directory_reported · review_decision: distinct_new_business · uncertainty: hours windows conflict across days ([('15:00', '22:00'), ('16:00', '22:00')]) -> blank per conflict rule; Proximity advisory reviewed (live row 'Ayyappa Tiffin Room'): ~71 m — distinct name, distinct phone, separate directory listings; same-street neighbours, not duplicates.; Proximity advisory reviewed: ~73 m from 'Golden Cafe & Resto' — distinct name, distinct phone, separate listings; same-street neighbours, not duplicates.; Proximity advisory reviewed: ~15 m from 'Rajanna Nati Style Dum Biryani' — distinct name, distinct phone, separate listings; same-street neighbours, not duplicates.; Proximity advisory reviewed: ~129 m from 'Sri Vinayaka Food Point' — distinct name, distinct phone, separate listings; same-street neighbours, not duplicates. · notes: Round-3 systematic enumeration (2026-10-11): district.in dining sitemap (cdn.district.in/sitemap/sitemap-dining.xml, robots-declared) -> venue page fetched; JSON-LD captured verbatim. Second source: magicpin listing https://magicpin.in/Bangalore/Bashettihalli/Restaurant/Mr-Shawarma-and-Miss-Grill/store/ca5770 (name match 0.98, area Bashettihalli) magicpin listing shows the Verified badge
- **Intra-file duplicates:** rows 26, 46, 86, 89 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.2805484, 77.5523229 — evidence level: directory_reported · source: https://www.district.in/dining/doddaballapura/mr-shawarma-miss-grills-1-doddaballapura-locality. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 40: Naati Mane

- **Confidence:** medium
- **Input:** address: Swagath Lodge Building, 21st Ward, Near Soundarya Mahal Theatre, Doddaballapura Locality, Doddaballapura · locality: Doddaballapura town (north edge) · city: Doddaballapura · phone: +918746863605 · coords: 13.2940295787, 77.5427164587 · source: https://www.district.in/dining/doddaballapura/naati-mane-1-doddaballapura-locality · cuisine: North Indian, South Indian, Mughlai, Hyderabadi · listing_rating: 4.3 · listing_reviews: 45 · checked_on: 2026-10-11 · evidence: directory_reported · review_decision: distinct_new_business · uncertainty: Proximity advisory reviewed: ~20 m from 'Banglore Iyengar Bakery & Sweets' — distinct name, distinct phone, separate listings; same-street neighbours, not duplicates.; Proximity advisory reviewed: ~92 m from 'Mallu Hindu Military Hotel' — distinct name, distinct phone, separate listings; same-street neighbours, not duplicates. · notes: Round-3 systematic enumeration (2026-10-11): district.in dining sitemap (cdn.district.in/sitemap/sitemap-dining.xml, robots-declared) -> venue page fetched; JSON-LD captured verbatim. Second source: magicpin listing https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Naati-Mane/store/16b6834 (name match 1.0, area Doddaballapur) magicpin listing shows the Verified badge
- **Intra-file duplicates:** rows 9, 37 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.2940295787, 77.5427164587 — evidence level: directory_reported · source: https://www.district.in/dining/doddaballapura/naati-mane-1-doddaballapura-locality. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 41: Parisara Family Dhaba

- **Confidence:** medium
- **Input:** address: Near Vidhya Nidhi Independent College, Doddaballapura Locality, Doddaballapura · locality: Doddaballapura town · city: Doddaballapura · phone: +919986776057 · coords: 13.306866, 77.532168 · source: https://www.district.in/dining/doddaballapura/parisara-family-dhaba-7-doddaballapura-locality · cuisine: North Indian, Indo-Chinese, South Indian · listing_rating: 4.9 · listing_reviews: 1 · checked_on: 2026-10-11 · evidence: directory_reported · review_decision: distinct_new_business · uncertainty: Proximity advisory reviewed: ~138 m from 'Spicy Bowl' — distinct name, distinct phone, separate listings; same-street neighbours, not duplicates. · notes: Round-3 systematic enumeration (2026-10-11): district.in dining sitemap (cdn.district.in/sitemap/sitemap-dining.xml, robots-declared) -> venue page fetched; JSON-LD captured verbatim. Second source: magicpin listing https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Parisara-Family-Dhaba/store/67c621 (name match 1.0, area Doddaballapur) magicpin listing shows the Verified badge
- **Intra-file duplicates:** rows 57 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.306866, 77.532168 — evidence level: directory_reported · source: https://www.district.in/dining/doddaballapura/parisara-family-dhaba-7-doddaballapura-locality. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 42: Pizza Corner

- **Confidence:** medium
- **Input:** address: Shop 08, Near Bus Stand Road, Doddaballapura Locality, Doddaballapura · locality: Doddaballapura town · city: Doddaballapura · phone: +916363823618 · coords: 13.3025975, 77.5383182 · source: https://www.district.in/dining/doddaballapura/pizza-corner-doddaballapura-locality · cuisine: Italian, Tibetan · listing_rating: 4.2 · listing_reviews: 6 · checked_on: 2026-10-11 · evidence: directory_reported · review_decision: distinct_new_business · uncertainty: hours windows conflict across days ([('11:00', '22:45'), ('11:15', '22:00'), ('11:30', '22:45')]) -> blank per conflict rule; Proximity advisory reviewed: ~86 m from 'The Brothers Adda' — distinct name, distinct phone, separate listings; same-street neighbours, not duplicates. · notes: Round-3 systematic enumeration (2026-10-11): district.in dining sitemap (cdn.district.in/sitemap/sitemap-dining.xml, robots-declared) -> venue page fetched; JSON-LD captured verbatim. Second source: magicpin listing https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Pizza-Corner/store/5c19b5 (name match 1.0, area Doddaballapur) magicpin listing shows the Verified badge
- **Intra-file duplicates:** rows 23, 61 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.3025975, 77.5383182 — evidence level: directory_reported · source: https://www.district.in/dining/doddaballapura/pizza-corner-doddaballapura-locality. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 43: Pizza Palace

- **Confidence:** medium
- **Input:** address: 9th Cross, Muthyalamma Road, Doddaballapura Locality, Doddaballapura · locality: Doddaballapura town (north edge) · city: Doddaballapura · phone: +918553388664 · coords: 13.298069583, 77.5320427492 · source: https://www.district.in/dining/doddaballapura/pizza-palace-doddaballapura-locality · cuisine: Street Food, North Indian, Indo-Chinese, Chinese · listing_rating: 4.4 · listing_reviews: 3 · checked_on: 2026-10-11 · evidence: directory_reported · review_decision: distinct_new_business · uncertainty: Validator advisory reviewed (INTRA_FILE_DUPLICATE): intra-file pair(s) ['Sri Sai Ram Hot Chips'] — reviewed: different business (distinct normalized name and phone; the shared element is a generic street/name token or ordinary town density). Recorded for the human reviewer. · notes: Round-3 systematic enumeration (2026-10-11): district.in dining sitemap (cdn.district.in/sitemap/sitemap-dining.xml, robots-declared) -> venue page fetched; JSON-LD captured verbatim. Second source: magicpin listing https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Pizza-Palace/store/4431ba (name match 1.0, area Doddaballapur) magicpin listing shows the Verified badge
- **Intra-file duplicates:** rows 59 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.298069583, 77.5320427492 — evidence level: directory_reported · source: https://www.district.in/dining/doddaballapura/pizza-palace-doddaballapura-locality. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 44: R R Lunch House

- **Confidence:** medium
- **Input:** address: BMR Complex, D Cross, Doddaballapura Locality, Doddaballapura · locality: Doddaballapura town · city: Doddaballapura · phone: +918660443442 · coords: 13.3064484272, 77.5454970619 · source: https://www.district.in/dining/doddaballapura/r-r-lunch-house-doddaballapura-locality · cuisine: North Indian, South Indian, Indo-Chinese · listing_rating: 3.9 · listing_reviews: 23 · checked_on: 2026-10-11 · evidence: directory_reported · review_decision: distinct_new_business · uncertainty: Proximity advisory reviewed: ~56 m from 'G P Non Veg Corner' — distinct name, distinct phone, separate listings; same-street neighbours, not duplicates.; Proximity advisory reviewed: ~97 m from 'Raj Dam Biryani Center & Family Restaurant' — distinct name, distinct phone, separate listings; same-street neighbours, not duplicates. · notes: Round-3 systematic enumeration (2026-10-11): district.in dining sitemap (cdn.district.in/sitemap/sitemap-dining.xml, robots-declared) -> venue page fetched; JSON-LD captured verbatim. Second source: magicpin listing https://magicpin.in/Bangalore/Doddaballapur/Restaurant/R-R-Lunch-House/store/1563a18 (name match 1.0, area Doddaballapur) magicpin listing shows the Verified badge
- **Intra-file duplicates:** rows 25, 45 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.3064484272, 77.5454970619 — evidence level: directory_reported · source: https://www.district.in/dining/doddaballapura/r-r-lunch-house-doddaballapura-locality. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 45: Raj Dam Biryani Center & Family Restaurant

- **Confidence:** medium
- **Input:** address: D Cross, Doddaballapura Locality, Doddaballapura · locality: Doddaballapura town · city: Doddaballapura · phone: +918310727061 · coords: 13.3063939518, 77.5463942323 · source: https://www.district.in/dining/doddaballapura/raj-dam-biryani-center-family-restaurant-doddaballapura-locality · cuisine: North Indian, Mughlai, South Indian · listing_rating: 4.2 · listing_reviews: 40 · checked_on: 2026-10-11 · evidence: directory_reported · review_decision: distinct_new_business · uncertainty: Proximity advisory reviewed: ~126 m from 'G P Non Veg Corner' — distinct name, distinct phone, separate listings; same-street neighbours, not duplicates.; Proximity advisory reviewed: ~97 m from 'R R Lunch House' — distinct name, distinct phone, separate listings; same-street neighbours, not duplicates. · notes: Round-3 systematic enumeration (2026-10-11): district.in dining sitemap (cdn.district.in/sitemap/sitemap-dining.xml, robots-declared) -> venue page fetched; JSON-LD captured verbatim. Second source: magicpin listing https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Raj-Dam-Biryani-Center-and-Family-Restaurant/store/1547c4a (name match 1.0, area Doddaballapur) magicpin listing shows the Verified badge
- **Intra-file duplicates:** rows 25, 44 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.3063939518, 77.5463942323 — evidence level: directory_reported · source: https://www.district.in/dining/doddaballapura/raj-dam-biryani-center-family-restaurant-doddaballapura-locality. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 46: Rajanna Nati Style Dum Biryani

- **Confidence:** medium
- **Input:** address: Near Railyway Station, Doddaballapura Locality, Doddaballapura · locality: Doddaballapura Railway Station / Scout Camp Rd · city: Doddaballapura · phone: +918660866810 · coords: 13.2804354545, 77.5524030626 · source: https://www.district.in/dining/doddaballapura/rajanna-nati-style-dum-biryani-doddaballapura-locality · cuisine: South Indian, Indo-Chinese, North Indian · evidence: directory_reported · review_decision: distinct_new_business · uncertainty: hours windows conflict across days ([('11:00', '23:00'), ('12:00', '23:00')]) -> blank per conflict rule; Proximity advisory reviewed (live row 'Ayyappa Tiffin Room'): ~61 m — distinct name, distinct phone, separate directory listings; same-street neighbours, not duplicates.; Proximity advisory reviewed: ~88 m from 'Golden Cafe & Resto' — distinct name, distinct phone, separate listings; same-street neighbours, not duplicates.; Proximity advisory reviewed: ~15 m from 'Mr Shawarma Miss Grills' — distinct name, distinct phone, separate listings; same-street neighbours, not duplicates.; Proximity advisory reviewed: ~126 m from 'Sri Vinayaka Food Point' — distinct name, distinct phone, separate listings; same-street neighbours, not duplicates. · notes: Round-3 systematic enumeration (2026-10-11): district.in dining sitemap (cdn.district.in/sitemap/sitemap-dining.xml, robots-declared) -> venue page fetched; JSON-LD captured verbatim. Second source: magicpin listing https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Rajanna-Nati-Style-Dum-Biryani/store/16b6836 (name match 1.0, area Doddaballapur) magicpin listing shows the Verified badge
- **Intra-file duplicates:** rows 26, 39, 86, 89, 100 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.2804354545, 77.5524030626 — evidence level: directory_reported · source: https://www.district.in/dining/doddaballapura/rajanna-nati-style-dum-biryani-doddaballapura-locality. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 48: Royal Dine Food Corner

- **Confidence:** medium
- **Input:** address: Marasandra, Doddaballapura Main Road, Doddaballapura Locality, Doddaballapura · locality: Rajanukunte · city: Doddaballapura · phone: +917509000800 · coords: 13.2287779, 77.549619 · source: https://www.district.in/dining/doddaballapura/royal-dine-food-corner-doddaballapura-locality · evidence: directory_reported · review_decision: needs_more_research · uncertainty: single structured directory source (district.in) — needs one independent second source before import (web-search quota exhausted this round) · notes: Round-3 systematic enumeration (2026-10-11): district.in dining sitemap (cdn.district.in/sitemap/sitemap-dining.xml, robots-declared) -> venue page fetched; JSON-LD captured verbatim.
- **Intra-file duplicates:** rows 31, 62, 64 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.2287779, 77.549619 — evidence level: directory_reported · source: https://www.district.in/dining/doddaballapura/royal-dine-food-corner-doddaballapura-locality. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 49: Royal Ruchis

- **Confidence:** medium
- **Input:** address: Rojipura, Court Road, Opposite ABM Function Hall, Doddaballapura Locality, Doddaballapura · locality: Doddaballapura town · city: Doddaballapura · phone: +919066369994 · coords: 13.3033799, 77.541754 · source: https://www.district.in/dining/doddaballapura/royal-ruchis-2-doddaballapura-locality · cuisine: South Indian, Indo-Chinese, North Indian · listing_rating: 4.0 · listing_reviews: 207 · checked_on: 2026-10-11 · evidence: directory_reported · review_decision: distinct_new_business · uncertainty: Proximity advisory reviewed: ~144 m from 'Maha Naati Ruchi' — distinct name, distinct phone, separate listings; same-street neighbours, not duplicates. · notes: Round-3 systematic enumeration (2026-10-11): district.in dining sitemap (cdn.district.in/sitemap/sitemap-dining.xml, robots-declared) -> venue page fetched; JSON-LD captured verbatim. Second source: magicpin listing https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Royal-Ruchis/store/16b6838 (name match 1.0, area Doddaballapur) magicpin listing shows the Verified badge
- **Matches to existing records:**
  - `e989603f` **Hotel Royal Nandhana** · locality: Arehalli Guddadahalli — similarity 0.5 (name-ambiguous-proper-token) · existing coords: NULL — confidence low
- **Intra-file duplicates:** rows 105 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.3033799, 77.541754 — evidence level: directory_reported · source: https://www.district.in/dining/doddaballapura/royal-ruchis-2-doddaballapura-locality. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `LOCALITY_CONFLICT`, `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 50: Samosa Hut

- **Confidence:** medium
- **Input:** address: Near RLJIT College, Kodigehalli Road, Doddaballapura Locality, Doddaballapura · locality: Doddaballapura town (north edge) · city: Doddaballapura · phone: +919986886661 · coords: 13.2997724, 77.527535 · source: https://www.district.in/dining/doddaballapura/samosa-hut-doddaballapura-locality · evidence: directory_reported · review_decision: needs_more_research · uncertainty: single structured directory source (district.in) — needs one independent second source before import (web-search quota exhausted this round) · notes: Round-3 systematic enumeration (2026-10-11): district.in dining sitemap (cdn.district.in/sitemap/sitemap-dining.xml, robots-declared) -> venue page fetched; JSON-LD captured verbatim.
- **Intra-file duplicates:** rows 12, 112 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.2997724, 77.527535 — evidence level: directory_reported · source: https://www.district.in/dining/doddaballapura/samosa-hut-doddaballapura-locality. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 51: Sandwich Wallas

- **Confidence:** medium
- **Input:** address: 29/30, 1st Floor, New Satkar Lodge Main Road, Doddaballapura Locality, Doddaballapura · locality: Doddaballapura town (north edge) · city: Doddaballapura · phone: +919886885036 · coords: 13.2934002164, 77.5403223968 · source: https://www.district.in/dining/doddaballapura/sandwich-wallas-doddaballapura-locality · cuisine: Italian, American, Maharashtrian · evidence: directory_reported · review_decision: distinct_new_business · uncertainty: Proximity advisory reviewed: ~57 m from 'SME Chats And Ice Cream' — distinct name, distinct phone, separate listings; same-street neighbours, not duplicates. · notes: Round-3 systematic enumeration (2026-10-11): district.in dining sitemap (cdn.district.in/sitemap/sitemap-dining.xml, robots-declared) -> venue page fetched; JSON-LD captured verbatim. Second source: magicpin listing https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Sandwich-Wallas/store/163014a (name match 1.0, area Doddaballapur) magicpin listing shows the Verified badge
- **Intra-file duplicates:** rows 56, 107 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.2934002164, 77.5403223968 — evidence level: directory_reported · source: https://www.district.in/dining/doddaballapura/sandwich-wallas-doddaballapura-locality. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 52: Shahi Kitchen

- **Confidence:** medium
- **Input:** address: Dargajogahalli, RL Jalappa College Main Road, Doddaballapura Locality, Doddaballapura · locality: Doddaballapura town (north edge) · city: Doddaballapura · phone: +917411147711 · coords: 13.2994863137, 77.5296022743 · source: https://www.district.in/dining/doddaballapura/shahi-kitchen-doddaballapura-locality · cuisine: North Indian, Indo-Chinese, Street Food, South Indian · listing_rating: 3.7 · listing_reviews: 20 · checked_on: 2026-10-11 · evidence: directory_reported · review_decision: distinct_new_business · uncertainty: Proximity advisory reviewed: ~146 m from 'Cafe Aaraike' — distinct name, distinct phone, separate listings; same-street neighbours, not duplicates.; Proximity advisory reviewed: ~60 m from 'Devangas Kitchen' — distinct name, distinct phone, separate listings; same-street neighbours, not duplicates.; Proximity advisory reviewed: ~28 m from 'DREAM CAFE' — distinct name, distinct phone, separate listings; same-street neighbours, not duplicates.; Proximity advisory reviewed: ~143 m from 'Zoop Cafe' — distinct name, distinct phone, separate listings; same-street neighbours, not duplicates. · notes: Round-3 systematic enumeration (2026-10-11): district.in dining sitemap (cdn.district.in/sitemap/sitemap-dining.xml, robots-declared) -> venue page fetched; JSON-LD captured verbatim. Second source: magicpin listing https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Shahi-Kitchen/store/1758a38 (name match 1.0, area Doddaballapur) magicpin listing shows the Verified badge
- **Intra-file duplicates:** rows 12, 18, 20, 112 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.2994863137, 77.5296022743 — evidence level: directory_reported · source: https://www.district.in/dining/doddaballapura/shahi-kitchen-doddaballapura-locality. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 56: SME Chats And Ice Cream

- **Confidence:** medium
- **Input:** address: 09, Ground Floor, ASR Complex, Ward 21, Hemavathi Pet, Doddaballapura Locality, Doddaballapura · locality: Doddaballapura town (north edge) · city: Doddaballapura · phone: +917760888178 · coords: 13.2930503, 77.5407013 · source: https://www.district.in/dining/doddaballapura/sme-chats-and-ice-cream-doddaballapura-locality · cuisine: Ice Cream, Street Food, North Indian · evidence: directory_reported · review_decision: distinct_new_business · uncertainty: Proximity advisory reviewed: ~57 m from 'Sandwich Wallas' — distinct name, distinct phone, separate listings; same-street neighbours, not duplicates. · notes: Round-3 systematic enumeration (2026-10-11): district.in dining sitemap (cdn.district.in/sitemap/sitemap-dining.xml, robots-declared) -> venue page fetched; JSON-LD captured verbatim. Second source: magicpin listing https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Sme-Chats-And-Ice-Cream/store/1758a32 (name match 1.0, area Doddaballapur) magicpin listing shows the Verified badge
- **Intra-file duplicates:** rows 51, 107 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.2930503, 77.5407013 — evidence level: directory_reported · source: https://www.district.in/dining/doddaballapura/sme-chats-and-ice-cream-doddaballapura-locality. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 57: Spicy Bowl

- **Confidence:** medium
- **Input:** address: Doddamma Temple Complex, Dabaspet Main Road, Doddaballapura Locality, Doddaballapura · locality: Doddaballapura town · city: Doddaballapura · phone: +918722404246 · coords: 13.3061807447, 77.5311062071 · source: https://www.district.in/dining/doddaballapura/spicy-bowl-doddaballapura-locality · cuisine: South Indian, North Indian, Indo-Chinese · listing_rating: 3.6 · listing_reviews: 4 · checked_on: 2026-10-11 · evidence: directory_reported · review_decision: distinct_new_business · uncertainty: Proximity advisory reviewed: ~138 m from 'Parisara Family Dhaba' — distinct name, distinct phone, separate listings; same-street neighbours, not duplicates. · notes: Round-3 systematic enumeration (2026-10-11): district.in dining sitemap (cdn.district.in/sitemap/sitemap-dining.xml, robots-declared) -> venue page fetched; JSON-LD captured verbatim. Second source: magicpin listing https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Spicy-Bowl/store/1758a33 (name match 1.0, area Doddaballapur) magicpin listing shows the Verified badge
- **Intra-file duplicates:** rows 41 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.3061807447, 77.5311062071 — evidence level: directory_reported · source: https://www.district.in/dining/doddaballapura/spicy-bowl-doddaballapura-locality. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 59: Sri Sai Ram Hot Chips

- **Confidence:** medium
- **Input:** address: 9th Cross, Shanthi Nagar, Muthyalamma Temple Road, Doddaballapura Locality, Doddaballapura · locality: Doddaballapura town (north edge) · city: Doddaballapura · phone: +919743887931 · coords: 13.2980974, 77.5320822 · source: https://www.district.in/dining/doddaballapura/sri-sai-ram-hot-chips-doddaballapura-locality · evidence: directory_reported · review_decision: needs_more_research · uncertainty: single structured directory source (district.in) — needs one independent second source before import (web-search quota exhausted this round) · notes: Round-3 systematic enumeration (2026-10-11): district.in dining sitemap (cdn.district.in/sitemap/sitemap-dining.xml, robots-declared) -> venue page fetched; JSON-LD captured verbatim.
- **Intra-file duplicates:** rows 43 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.2980974, 77.5320822 — evidence level: directory_reported · source: https://www.district.in/dining/doddaballapura/sri-sai-ram-hot-chips-doddaballapura-locality. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 60: Sujatha Fish Cort

- **Confidence:** medium
- **Input:** address: Ground Floor, Vinayaka Nagar, Raji Pura, Ward 2, Cort Road, Doddaballapura Locality, Doddaballapura · locality: Doddaballapura town · city: Doddaballapura · phone: +916363937780 · coords: 13.3099728, 77.5424424 · source: https://www.district.in/dining/doddaballapura/sujatha-fish-cort-doddaballapura-locality · evidence: directory_reported · review_decision: distinct_new_business · uncertainty: Proximity advisory reviewed: ~27 m from 'Mathsya Darshini' — distinct name, distinct phone, separate listings; same-street neighbours, not duplicates.; Proximity advisory reviewed: ~98 m from 'Veg Sandwich And Lassi Point' — distinct name, distinct phone, separate listings; same-street neighbours, not duplicates. · notes: Round-3 systematic enumeration (2026-10-11): district.in dining sitemap (cdn.district.in/sitemap/sitemap-dining.xml, robots-declared) -> venue page fetched; JSON-LD captured verbatim. Second source: magicpin listing https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Sujatha-Fish-Cort/store/1758a30 (name match 1.0, area Doddaballapur) magicpin listing shows the Verified badge
- **Intra-file duplicates:** rows 38, 68 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.3099728, 77.5424424 — evidence level: directory_reported · source: https://www.district.in/dining/doddaballapura/sujatha-fish-cort-doddaballapura-locality. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 61: The Brothers Adda

- **Confidence:** medium
- **Input:** address: 28, 4th Stage, Rojipura, Ward 27, Near Doddaballapura Locality, Doddaballapura · locality: Doddaballapura town · city: Doddaballapura · phone: +919535593359 · coords: 13.3028391559, 77.5390754687 · source: https://www.district.in/dining/doddaballapura/the-brothers-adda-1-doddaballapura-locality · cuisine: North Indian, Indo-Chinese · listing_rating: 3.9 · listing_reviews: 5 · checked_on: 2026-10-11 · evidence: directory_reported · review_decision: distinct_new_business · uncertainty: Proximity advisory reviewed: ~86 m from 'Pizza Corner' — distinct name, distinct phone, separate listings; same-street neighbours, not duplicates. · notes: Round-3 systematic enumeration (2026-10-11): district.in dining sitemap (cdn.district.in/sitemap/sitemap-dining.xml, robots-declared) -> venue page fetched; JSON-LD captured verbatim. Second source: magicpin listing https://magicpin.in/Bangalore/Doddaballapur/Restaurant/The-Brothers-Adda/store/4252966 (name match 1.0, area Doddaballapur) magicpin listing shows the Verified badge
- **Intra-file duplicates:** rows 23, 42 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.3028391559, 77.5390754687 — evidence level: directory_reported · source: https://www.district.in/dining/doddaballapura/the-brothers-adda-1-doddaballapura-locality. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 62: The Momo Spot

- **Confidence:** medium
- **Input:** address: 181, Opposite Provident Apartment, Marasandra, Doddaballapura Locality, Doddaballapura · locality: Rajanukunte · city: Doddaballapura · phone: +919632373217 · coords: 13.228409, 77.549895 · source: https://www.district.in/dining/doddaballapura/the-momo-spot-doddaballapura-locality · evidence: directory_reported · review_decision: needs_more_research · uncertainty: single structured directory source (district.in) — needs one independent second source before import (web-search quota exhausted this round) · notes: Round-3 systematic enumeration (2026-10-11): district.in dining sitemap (cdn.district.in/sitemap/sitemap-dining.xml, robots-declared) -> venue page fetched; JSON-LD captured verbatim.
- **Intra-file duplicates:** rows 2, 31, 48, 64 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.228409, 77.549895 — evidence level: directory_reported · source: https://www.district.in/dining/doddaballapura/the-momo-spot-doddaballapura-locality. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 63: The Monkey House

- **Confidence:** medium
- **Input:** address: Mukthambika, Opposite TMBL Bank, Kalamma Temple Road, Doddaballapura Locality, Doddaballapura · locality: Doddaballapura town (north edge) · city: Doddaballapura · phone: +919164460054 · coords: 13.2947637, 77.5399817 · source: https://www.district.in/dining/doddaballapura/the-monkey-house-1-doddaballapura-locality · cuisine: Street Food, North Indian · listing_rating: 2.9 · listing_reviews: 6 · checked_on: 2026-10-11 · evidence: directory_reported · review_decision: needs_more_research · uncertainty: phone differs across sources: district +919164460054 vs magicpin +918050190643; area mismatch: district pin says 'Doddaballapura town (north edge)' but magicpin files it under 'Rajanukunte' — branch identity needs confirmation; same-name branch ambiguity in the corridor — branch identity needs an on-site/pass check · notes: Round-3 systematic enumeration (2026-10-11): district.in dining sitemap (cdn.district.in/sitemap/sitemap-dining.xml, robots-declared) -> venue page fetched; JSON-LD captured verbatim. Second source: magicpin listing https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Monkey-House/store/1678319 (name match 1.0, area Rajanukunte) magicpin listing shows the Verified badge
- **Intra-file duplicates:** rows 8, 34, 64 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.2947637, 77.5399817 — evidence level: directory_reported · source: https://www.district.in/dining/doddaballapura/the-monkey-house-1-doddaballapura-locality. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 64: The Monkey house Lassi & More

- **Confidence:** medium
- **Input:** address: Provident Welworth City, Marasandra, Doddaballapura Locality, Doddaballapura · locality: Rajanukunte · city: Doddaballapura · phone: +917019646825 · coords: 13.2287819, 77.5496407 · source: https://www.district.in/dining/doddaballapura/the-monkey-house-lassi-more-doddaballapura-locality · cuisine: American, North Indian, Continental · evidence: directory_reported · review_decision: needs_more_research · uncertainty: single structured directory source (district.in) — needs one independent second source before import (web-search quota exhausted this round) · notes: Round-3 systematic enumeration (2026-10-11): district.in dining sitemap (cdn.district.in/sitemap/sitemap-dining.xml, robots-declared) -> venue page fetched; JSON-LD captured verbatim.
- **Intra-file duplicates:** rows 31, 48, 62, 63 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.2287819, 77.5496407 — evidence level: directory_reported · source: https://www.district.in/dining/doddaballapura/the-monkey-house-lassi-more-doddaballapura-locality. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 66: Udupi Garden Hotel

- **Confidence:** medium
- **Input:** address: Near B H Road, Putani Complex, Bashettahalli, Doddaballapura Locality, Doddaballapura · locality: Doddaballapura outskirts (NH-44 south) · city: Doddaballapura · phone: +919980551506 · coords: 13.2647600134, 77.5528303289 · source: https://www.district.in/dining/doddaballapura/udupi-garden-hotel-doddaballapura-locality · listing_rating: 3.8 · listing_reviews: 210 · checked_on: 2026-10-11 · evidence: directory_reported · review_decision: needs_more_research · uncertainty: phone differs across sources: district +919980551506 vs magicpin +919980657073; area mismatch: district pin says 'Doddaballapura outskirts (NH-44 south)' but magicpin files it under 'Rajanukunte' — branch identity needs confirmation · notes: Round-3 systematic enumeration (2026-10-11): district.in dining sitemap (cdn.district.in/sitemap/sitemap-dining.xml, robots-declared) -> venue page fetched; JSON-LD captured verbatim. Second source: magicpin listing https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Udupi-Garden/store/177c0c9 (name match 1.0, area Rajanukunte) magicpin listing shows the Verified badge
- **Intra-file duplicates:** rows 7 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.2647600134, 77.5528303289 — evidence level: directory_reported · source: https://www.district.in/dining/doddaballapura/udupi-garden-hotel-doddaballapura-locality. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 68: Veg Sandwich And Lassi Point

- **Confidence:** medium
- **Input:** address: 716, Court Road, Opposite Church, Doddaballapura Locality, Doddaballapura · locality: Doddaballapura town · city: Doddaballapura · phone: +919036624007 · coords: 13.3091118, 77.5426434 · source: https://www.district.in/dining/doddaballapura/veg-sandwich-and-lassi-point-doddaballapura-locality · evidence: directory_reported · review_decision: distinct_new_business · uncertainty: Proximity advisory reviewed: ~75 m from 'Darbar The Cafe' — distinct name, distinct phone, separate listings; same-street neighbours, not duplicates.; Proximity advisory reviewed: ~148 m from 'Durgashree Samruddhi Garden' — distinct name, distinct phone, separate listings; same-street neighbours, not duplicates.; Proximity advisory reviewed: ~71 m from 'Mathsya Darshini' — distinct name, distinct phone, separate listings; same-street neighbours, not duplicates.; Proximity advisory reviewed: ~98 m from 'Sujatha Fish Cort' — distinct name, distinct phone, separate listings; same-street neighbours, not duplicates. · notes: Round-3 systematic enumeration (2026-10-11): district.in dining sitemap (cdn.district.in/sitemap/sitemap-dining.xml, robots-declared) -> venue page fetched; JSON-LD captured verbatim. Second source: magicpin listing https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Veg-Sandwich-And-Lassi-Point/store/162a23c (name match 1.0, area Doddaballapur) magicpin listing shows the Verified badge
- **Intra-file duplicates:** rows 17, 21, 38, 60 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.3091118, 77.5426434 — evidence level: directory_reported · source: https://www.district.in/dining/doddaballapura/veg-sandwich-and-lassi-point-doddaballapura-locality. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 70: GITAM Cafe

- **Confidence:** low
- **Input:** locality: Heggadahalli · city: Doddaballapura · source: https://www.justdial.com/Bangalore/Gitam-Cafe-Heggadahalli/9999P8152-8152-240418121301-Y3M3_BZDET/reviews · listing_rating: 3.7 · checked_on: 2026-10-09 · evidence: directory_reported · review_decision: possible_duplicate_hold · uncertainty: Justdial carries 'Gitam Cafe' (3.7, own categories/hours page showing 8:00 am - 9:00 pm) separately from TWO 'Gitam University Canteen' listings (created 2023-11 and 2023-12, address 'Byradenahalli, Doddaballapur Road, Heggadahalli'); the Snapchat place-nearby list also carries both separately (Phase 3D). 'GITAM Cafe' is a brand name GITAM uses at other campuses (an Abbigere, Bengaluru cafe exists - different city, not this one). Two independent platforms list the cafe apart from the canteen, but no distinguishing phone or street address has been captured for the cafe, so the duplicate hold stays pending a field check or distinguishing contact. Review count not visible in the captured snippet. · notes: Phase 3C candidate (possible-duplicate bucket). JD listing located in Heggadahalli (village cluster by GITAM/Nagadenahalli). Rating 3.7 read from the JD reviews-page snippet on 2026-10-09; JD page body not readable in this environment (anti-bot), so address/phone stay blank. | Phase 3F update (2026-10-09): JD categories-page snippet gives hours 8:00 am - 9:00 pm; canteen's two separate JD listings and the Abbigere GITAM Cafe documented. Hold kept - no distinguishing phone/address yet. | Round-3 re-check (2026-10-11): no new reachable source; hold kept (needs distinguishing phone/address).
- **Matches to existing records:**
  - `7259037f` **GITAM University Canteen** · locality: GITAM campus — similarity 0.375 (name-ambiguous-proper-token) · existing coords: NULL — confidence low
- **Flags:** `LOCALITY_CONFLICT`
- **Recommended initial verification_status:** unverified

### Row 75: Mantralaya Hotel & Chats

- **Confidence:** medium
- **Input:** address: Near Anjineya Temple, Doddaballapur · locality: Basettihalli · city: Doddaballapura · source: https://www.justdial.com/Bangalore/Mantralaya-Tiifins-And-Chats-Near-Anjineya-Temple-Doddaballapur/080PXX80-XX80-230328182140-Q5M6_BZDET/reviews · listing_rating: 4.8 · listing_reviews: 15 · checked_on: 2026-10-09 · evidence: directory_reported · review_decision: needs_more_research · uncertainty: Two Mantralaya-branded Justdial listings are DISTINCT businesses (Phase 3F, 2026-10-09): (a) this row - 'Mantralaya Tiifins And Chats', Near Anjineya Temple, Basettihalli, rated 4.8/15, hours 6:00 am - 10:00 pm Mon-Sun (JD snippet, breakfast/lunch/dinner); (b) 'Mantralaya Hotel', Near Railway Station (separate worksheet row 24), pure veg, 6:00 am - 9:30 pm. The Phase 3C candidate name 'Mantralaya Hotel & Chats' matches this listing on the '& Chats' element - recorded as the closer match, an inference the human reviewer should confirm. Neither listing is in Nagadenahalli (the 3C grouping said 'Near GITAM/Nagadenahalli'). A vyaparify 'Manthralayahotel' lodging page and a Bengaluru 'Mantralaya Cafe' (12th Cross) are unrelated. This row remains JD-only (snippet-level); a phone would complete its identity. · notes: Row matched to the Tiffins-And-Chats listing on name evidence ('& Chats'); identity still requires field confirmation. A vyaparify 'Manthralayahotel' lodging page also exists (different business type). | Phase 3F update (2026-10-09): full weekly hours from JD snippet (6:00 am - 10:00 pm); rows 6/24 confirmed as distinct listings; 3C-name mapping to this row documented as an inference.
- **Intra-file duplicates:** rows 93 — both entries stay separate; a human must decide.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 77: Lotus Gardenia

- **Confidence:** medium
- **Input:** address: Opposite Indian Oil Petrol Bunk, Near Railway Station, Doddaballapur · locality: Nagadenahalli · city: Doddaballapura · phone: +919513327736 · coords: 13.2796901, 77.5549033 · source: https://www.justdial.com/Bangalore/Lotus-Gardenia-Restaurants-Bar-Rooms-Opposite-Indian-Oil-Petrol-BunkNear-Railway-Station-Doddaballapur/080PXX80-XX80-210421154401-X4L9_BZDET · listing_rating: 4.0 · listing_reviews: 2410 · checked_on: 2026-10-09 · evidence: directory_reported · review_decision: distinct_new_business · uncertainty: JD area tags disagree: the photos page is filed under 'Nagadenahalii' while the listing slug says 'Near Railway Station, Doddaballapur' - both recorded. Listing combines restaurant + bar + rooms (JD categories include 'Home Stay'); cuisine not captured (a TripAdvisor nearby-restaurant mention suggests Chinese, low confidence). 'Established 03-2020' per JD. JD's 'bookings typically 9:00 AM to 8:00 PM' refers to booking hours, not business hours - opening_hours left blank. Phase 3F (2026-10-09): a JD snippet shows structured hours 'Open 24 Hrs' (not recorded in opening_hours - a 24-hour claim does not fit the HH:MM-HH:MM field, and the Phase 3D booking-hours caveat stands); the JD rating count drifted 2410 -> 2404 between same-day reads (4.0 unchanged); hotel-OTA pages (Goibibo 2.9/5, MakeMyTrip, PlanetOfHotels - restaurant + bar + 24-hour front desk) corroborate the mixed profile; a TripAdvisor restaurant page for Lotus Gardenia, Doddaballapur was located.; Proximity advisory reviewed (live row 'Ayyappa Tiffin Room'): ~290 m — distinct name, distinct phone, separate directory listings; same-street neighbours, not duplicates.; Proximity advisory reviewed: ~138 m from 'Abhis Food Court' — distinct name, distinct phone, separate listings; same-street neighbours, not duplicates. · notes: Rated 4.0 with 2410 all-time ratings on Justdial (search snippet, 2026-10-09; JD page itself not readable). Different name, address and profile vs all 14 existing records; TripAdvisor also lists a 'Lotus Gardenia' restaurant near Brahmi Resort, Nagadenahalli. | Phase 3F update (2026-10-09): 'Open 24 Hrs' JD claim noted (not recorded as hours); rating-count drift 2410->2404 noted; TripAdvisor + OTA corroboration added. | Round-3 re-check (2026-10-11): district.in listing live — phone +919513327736 and structured geo 13.2796901,77.5549033 recorded (directory-reported). district hours windows conflict (11:45 vs 12:00 opens) -> hours stay blank.
- **Intra-file duplicates:** rows 22, 101 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.2796901, 77.5549033 — evidence level: directory_reported · source: https://www.justdial.com/Bangalore/Lotus-Gardenia-Restaurants-Bar-Rooms-Opposite-Indian-Oil-Petrol-BunkNear-Railway-Station-Doddaballapur/080PXX80-XX80-210421154401-X4L9_BZDET. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 84: Hotel Bindushree Family Restaurant

- **Confidence:** medium
- **Input:** address: 7Hh4+Xq9, K.G Govindapura, Bashettihalli, Bangalore · locality: Bashettihalli · city: Doddaballapura · coords: 13.2799, 77.556969 · source: https://magicpin.in/Bangalore/Bashettihalli/Hotel/Hotel-Bindushree-Family-Restaurant/store/1174189 · listing_rating: 4.2 · listing_reviews: 5 · checked_on: 2026-10-09 · evidence: directory_reported · review_decision: distinct_new_business · uncertainty: Hours conflict: Justdial 6:00 am - 10:00 pm (breakfast/lunch/dinner) vs magicpin 10:00 AM-10:00 PM - opening_hours left blank. Coordinates derived from the plus code '7Hh4+Xq9' published in magicpin's address field (decoded 13.27990, 77.55697 with a Doddaballapura-station reference; the decoder was validated against a known database point) - directory-reported, awaiting confirmation. JD cross-list ties the name to 'K.G Govindapura, Basettihalli - 562163', consistent with magicpin. Phase 3F (2026-10-09): the Yandex org page was re-read - 'Phone number not specified', 'No reviews yet', business hours shown only as 'Open until 10:00 PM' (closing-time claim, not a full-day window) - adds no new fields; the JD-vs-magicpin hours conflict stands and opening_hours stays blank; coordinates remain the decoded plus-code pin (directory-reported, awaiting confirmation). magicpin also describes 'lodging options' alongside the restaurant.; Proximity advisory reviewed: ~75 m from 'Dada Tea And Chats' — distinct name, distinct phone, separate listings; same-street neighbours, not duplicates.; Proximity advisory reviewed: ~87 m from 'Abhis Food Court' — distinct name, distinct phone, separate listings; same-street neighbours, not duplicates.; Proximity advisory reviewed: ~34 m from 'Five Star Kohli Hut' — distinct name, distinct phone, separate listings; same-street neighbours, not duplicates. · notes: Second sources: https://www.justdial.com/Bangalore/Hotel-Bindushree-Family-Restaurant-Basettihalli/080PXX80-XX80-220317215349-N3C9_BZDET and yandex.com/maps/org/hotel_bindushree_family_restaurant/7787971394 ('open until 10:00 PM'). | Phase 3F update (2026-10-09): Yandex page re-read (no phone published; 'Open until 10:00 PM' only) - no field changes.
- **Intra-file duplicates:** rows 5, 16, 22, 101, 113 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.2799, 77.556969 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Bashettihalli/Hotel/Hotel-Bindushree-Family-Restaurant/store/1174189. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 86: Sri Vinayaka Food Point

- **Confidence:** medium
- **Input:** address: Railway Station, Doddaballapura Locality, Doddaballapura · locality: Doddaballapura Railway Station · city: Doddaballapura · phone: +918197052687 · coords: 13.279693, 77.5515242 · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Sri-Vinayaka-Food-Point/store/15a4365 · cuisine: South Indian, North Indian, Chinese, Street Food, Fast Food, Juices, Shakes, Desserts · listing_rating: 4.1 · listing_reviews: 4731 · checked_on: 2026-10-09 · evidence: directory_reported · review_decision: distinct_new_business · uncertainty: Hours now conflict (Phase 3F re-check): magicpin verified listing 8:00 AM - 9:30 PM vs district.in structured hours 12:00-22:00 all seven days - opening_hours left blank per the conflict rule. Coordinates are district.in's structured geo (directory-reported, awaiting confirmation; station-cluster pin). Two Justdial listings exist: 'Railway Station, Doddaballapura Locality' and 'No. 01, 1st Floor, Opposite Nageshwara Temple, Kongadiyappa Main Road, Basettihalli, Bangalore-562163' - the temple-road and station-locality placements remain unreconciled. district.in shows rating 3.9 and Rs 300 for two vs magicpin 4.1/4731 and Rs 500 for two; magicpin's 4,731 count is an all-source aggregate. Zomato's dining page displays 4.3 / 4,930 (existence reference only - no proprietary data copied). Swiggy/Zomato listings referenced for existence only.; Proximity advisory reviewed (live row 'Ayyappa Tiffin Room'): ~81 m — distinct name, distinct phone, separate directory listings; same-street neighbours, not duplicates.; Proximity advisory reviewed: ~129 m from 'Mr Shawarma Miss Grills' — distinct name, distinct phone, separate listings; same-street neighbours, not duplicates.; Proximity advisory reviewed: ~126 m from 'Rajanna Nati Style Dum Biryani' — distinct name, distinct phone, separate listings; same-street neighbours, not duplicates. · notes: Second sources: https://www.district.in/dining/doddaballapura/sri-vinayaka-food-point-doddaballapura-locality (3.9) and https://www.justdial.com/Bangalore/Sri-Vinayaka-Food-Point-Opposite-Nageshwara-Temple-Basettihalli/080PXX80-XX80-220929135021-Q4T9_BZDET. | Phase 3F update (2026-10-09): district.in structured geo recorded (13.279693, 77.5515242); magicpin-vs-district hours conflict -> opening_hours blanked; JD Basettihalli verbatim address line documented; Zomato 4.3/4,930 existence-ref noted.
- **Intra-file duplicates:** rows 39, 46, 89 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.279693, 77.5515242 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Sri-Vinayaka-Food-Point/store/15a4365. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 89: Hotel Krishnamoorthy

- **Confidence:** medium
- **Input:** address: Near Railway Station, Scout Camp Road, Doddaballapura, Karnataka 562163 · locality: Doddaballapura Railway Station · city: Doddaballapura · phone: +919742663255 · coords: 13.280305, 77.551956 · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Hotel-Krishnamoorthy/store/525080 · cuisine: South Indian, Chinese, Juices, Street Food · listing_rating: 4.3 · listing_reviews: 2 · checked_on: 2026-10-09 · evidence: directory_reported · review_decision: possible_duplicate_hold · uncertainty: IDENTITY HOLD RAISED (Phase 3F, 2026-10-09): a Facebook video caption by the local Doddaballapura food page 'Nammuru Doddaballapura' describes 'Sri Ayyappa Tiffin Room, also known as Krishnamurthy Hotel, a family-run establishment founded in 1978' - and the existing DB record 'Ayyappa Tiffin Room' sits on the same Scout Camp Road near the railway station (~150 m from the Mappls pin). Contradicting evidence: different phones (magicpin verified +919742663255 vs the existing record's +918088599999), a separate magicpin verified listing with its own menu and hours (10:00 AM - 10:00 PM, re-confirmed today), and a separate Mappls place entry (OD43DN, pincode 562163, DIGIPIN 4PF-T72-7L8F); no Justdial listing for 'Hotel Krishnamoorthy' surfaced. 'Krishnamurthy' may also be the founder's name rather than a trading alias. Remote sources cannot settle same-vs-distinct - downgrade from distinct_new_business; a call to both numbers or an on-site check decides. · notes: Second sources: the Mappls place page (address + coordinates) and onefivenine.com village indexes ('hotel krishnamoorthy. near railwayStation; scout Camp Road'). magicpin files it under 'Restaurant'; recorded as category 'hotel' to match the pilot's convention for 'Hotel X' eateries (existing DB precedent: Hotel Halli Nanasu, Hotel Royal Nandhana). | Phase 3F update (2026-10-09): FB alias claim ('Ayyappa Tiffin Room, also known as Krishnamurthy Hotel') + ~150 m proximity -> possible_duplicate_hold. magicpin hours 10:00-22:00 re-confirmed.
- **Intra-file duplicates:** rows 26, 39, 46, 86 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.280305, 77.551956 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Hotel-Krishnamoorthy/store/525080. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 93: Mantralaya Hotel

- **Confidence:** medium
- **Input:** address: Near Railway Station, Doddaballapur · locality: Doddaballapura Railway Station · city: Doddaballapura · source: https://www.justdial.com/Bangalore/Mantralaya-Hotel-Near-Railway-Station-Doddaballapur/080PXX80-XX80-250115082342-Q8K8_BZDET · evidence: directory_reported · review_decision: needs_more_research · uncertainty: Pure-veg hotel (eatery) per JD title; JD page not readable in this environment, so phone/rating/address details beyond the listing slug are not captured. Name overlap with the 'Mantralaya Hotel & Chats' candidate row is expected - the tool should flag the pair for human review. Phase 3F (2026-10-09): confirmed a DISTINCT listing from row 6 ('Mantralaya Tiifins And Chats', Basettihalli) - different name, address and hours; this row's hours 6:00 am - 9:30 pm re-confirmed by the JD snippet. No phone or rating captured yet; a dedicated search surfaced no second source beyond JD. · notes: Discovery (zone 2). Hours '6:00 am - 9:30 pm' read from the JD snippet on 2026-10-09. | Phase 3F update (2026-10-09): distinctness from row 6 documented; stays needs_more_research (JD-only, sparse).
- **Intra-file duplicates:** rows 75 — both entries stay separate; a human must decide.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 100: Rajanna Nati Style Biryani

- **Confidence:** medium
- **Input:** address: Railway Station, Doddaballapura, K.G Govindapura, Bhuvaneswari Nagar, Bangalore - 561203 · locality: Bhuvaneswari Nagar · city: Doddaballapura · source: https://www.justdial.com/Bangalore/Biryani-Restaurants-in-Railway-Station-Doddaballapur-Doddaballapur/nct-10047018 · evidence: directory_reported · uncertainty: Sparse: address from a JD index-page row; no dedicated listing captured. Name listed as 'Rajanna Nati Style Biryani' on the JD biryani index; other sources render it 'Rajanna nati style hotel'. · notes: Discovery (zone 2) via the JD biryani index for the Railway Station area on 2026-10-09. Restaurant Guru's Doddaballapura index also lists 'Rajanna nati style hotel'.
- **Intra-file duplicates:** rows 46 — both entries stay separate; a human must decide.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 101: Abhis Food Court

- **Confidence:** medium
- **Input:** address: Railway Station, Scout Camp Road, Doddaballapura Locality, Doddaballapura · locality: Doddaballapura Railway Station / Scout Camp Road · city: Doddaballapura · phone: +916361695837 · coords: 13.2798556, 77.5561673 · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Abhis-Food-Court/store/1575606 · cuisine: Pizza, fast food, beverages · listing_rating: 4.9 · listing_reviews: 1 · checked_on: 2026-10-10 · evidence: directory_reported · review_decision: distinct_new_business · uncertainty: Price for two conflict: district.in Rs 300 vs magicpin Rs 400 - band recorded, exact value unresolved. A second JD listing 'Abhis Food Court' in Thammasettihalli (561205, 10:00 am - 10:00 pm) exists - unresolved (possible second outlet or JD misfile). Name adjacency to existing 'Abhiram Food Court' (Moparahalli, ~4 km, different phone) reviewed as distinct. magicpin rating base is a single review (1). district.in hasMap is a query URL - not a listing URL (WORKFLOW rule 4).; Proximity advisory reviewed (live row 'Ayyappa Tiffin Room'): ~426 m — distinct name, distinct phone, separate directory listings; same-street neighbours, not duplicates.; Proximity advisory reviewed: ~138 m from 'Lotus Gardenia' — distinct name, distinct phone, separate listings; same-street neighbours, not duplicates.; Proximity advisory reviewed: ~87 m from 'Hotel Bindushree Family Restaurant' — distinct name, distinct phone, separate listings; same-street neighbours, not duplicates.; Proximity advisory reviewed: ~70 m from 'Five Star Kohli Hut' — distinct name, distinct phone, separate listings; same-street neighbours, not duplicates. · notes: Phase 3H discovery round (2026-10-10): lead queued in Phase 3F. magicpin VERIFIED listing + district.in JSON-LD page-reads; hours 17:00-22:00 agree across magicpin, district JSON-LD (Mon-Sun 17:00-22:00) and a JD snippet. Coordinates are district.in JSON-LD geo with the identical pair independently published in magicpin JSON-LD (directory-reported, bucket 6). Zomato existence-reference only.
- **Intra-file duplicates:** rows 5, 22, 77, 84, 113 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.2798556, 77.5561673 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Abhis-Food-Court/store/1575606. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 105: Maha Naati Ruchi

- **Confidence:** medium
- **Input:** address: Vinayakanagara, Rojipura Court Road, Doddaballapura Locality, Doddaballapura · locality: Doddaballapura town · city: Doddaballapura · phone: +918095788474 · coords: 13.3044077, 77.5425688 · source: https://www.district.in/dining/doddaballapura/maha-naati-ruchi-3-doddaballapura-locality · cuisine: North Indian, Indo-Chinese, South Indian, Hyderabadi · listing_rating: 4.2 · listing_reviews: 546 · checked_on: 2026-10-10 · evidence: directory_reported · review_decision: distinct_new_business · uncertainty: district.in JSON-LD publishes a second phone +916363286209, corroborated by the FB page ('Prop:Sri Kuber -6363286209'). Opening hours left blank: district JSON-LD covers Tue-Sun 09:00-22:00 but Monday is absent from the spec (gap noted). Price for two conflict: district Rs 1000 vs magicpin snippet Rs 500. JD rating 4.2/546 is snippet-only evidence (page body anti-bot blocked). JD area tag says 'Mallathahalli' vs the Court Road address - area tag or second branch, unresolved.; Proximity advisory reviewed: ~144 m from 'Royal Ruchis' — distinct name, distinct phone, separate listings; same-street neighbours, not duplicates. · notes: Phase 3H discovery round (2026-10-10): district.in JSON-LD page-read (address, two phones, cuisine, geo); phone cross-corroborated by the owner's FB page. Coordinates are district.in JSON-LD geo (directory-reported, bucket 6). Zomato existence-reference only. | Round-3 re-check (2026-10-11): district.in structured hours 09:00-22:00 recorded; two phones shown (+918095788474 primary, +916363286209 secondary).
- **Intra-file duplicates:** rows 49 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.3044077, 77.5425688 — evidence level: directory_reported · source: https://www.district.in/dining/doddaballapura/maha-naati-ruchi-3-doddaballapura-locality. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 107: Shawarma Cartel

- **Confidence:** medium
- **Input:** address: Ground Floor, Market Road, Doddaballapura Locality, Doddaballapura · locality: Doddaballapura town · city: Doddaballapura · phone: +918095562868 · coords: 13.2934035, 77.5414015 · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Shawarma-Cartel/store/17934a0 · cuisine: Fast food, shawarma · listing_rating: 4.1 · listing_reviews: 251 · checked_on: 2026-10-10 · evidence: directory_reported · review_decision: needs_more_research · uncertainty: Address conflict - unresolved: magicpin 'Ground Floor, Market Road' vs JD 'Hemavathipet 2nd Cross St, 561203' vs IG bio '3rd branch... Doddaballapura Main Road'. Multi-branch claim (IG 'officially OPEN') must be settled (one call) before identity work. FavHiker displays Google 4.8/35 separately (recorded here only as a separate external value, never merged). Plus code '7GVR+9H9' published by FavHiker - recorded as string, not converted. Pin points north of town center - unverified. · notes: Phase 3H discovery round (2026-10-10): magicpin VERIFIED listing page-read (phone, 3:30 PM - 10:30 PM, Rs 400 for two, 4.1/251) + JD/FavHiker snippets. Strong listings exist but the street-level address conflict and multi-branch claim block an identity decision.
- **Intra-file duplicates:** rows 9, 37, 51, 56 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.2934035, 77.5414015 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Shawarma-Cartel/store/17934a0. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 108: Udupi Upahar

- **Confidence:** medium
- **Input:** address: JP Vybhav Party Hall & Lodging, Kasaba Police Station Road, Doddaballapur - 561203 · locality: Doddaballapura town · city: Doddaballapura · phone: +919845186664 · coords: 13.3071176, 77.5375286 · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Udupi-Upahar/store/1833086 · cuisine: South Indian · listing_rating: 4.2 · listing_reviews: 9 · checked_on: 2026-10-10 · evidence: directory_reported · review_decision: distinct_new_business · uncertainty: A family of same-name listings, not one clean candidate: magicpin VERIFIED (this row); JD 'Udupi Uahar'; JD 'Hotel New Udupi Uphar' (hours 6:00 am - 3:00 pm); Zomato existence-reference displays a 'temporarily closed' banner (signal noted, no data copied). Opening hours left blank: magicpin window 11:30 AM - 2:00 PM looks like a lunch display, JD says 6:00-15:00, Zomato banner says temporarily closed - three signals conflict. Which listing is the intended business is unresolved.; Proximity advisory reviewed: ~146 m from 'Arun Ice Creams' — distinct name, distinct phone, separate listings; same-street neighbours, not duplicates.; Proximity advisory reviewed: ~81 m from 'I Cake Bakery' — distinct name, distinct phone, separate listings; same-street neighbours, not duplicates. · notes: Phase 3H discovery round (2026-10-10): magicpin VERIFIED listing page-read (phone, Rs 500 for two, 4.2/9, geo). Identity of 'the' candidate must be established first. | Round-3 (2026-10-11): district.in + magicpin BOTH live with MATCHING phone +919845186664 -> distinct_new_business; district structured geo 13.3069828105,77.5375501 and hours 08:00-16:00 recorded
- **Intra-file duplicates:** rows 6, 30 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.3071176, 77.5375286 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Udupi-Upahar/store/1833086. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 110: Durgashree Samruddhi Grand Veg

- **Confidence:** medium
- **Input:** address: Muthasandra, Karnataka 561203 · locality: Muthasandra · city: Doddaballapura · phone: +919148101848 · coords: 13.3091042, 77.5379518 · maps_listing: https://www.google.com/maps/place/Durgashree+Samruddhi+Grand+Veg/@13.3091042,77.5353769,17z/data=!3m1!4b1!4m6!3m5!1s0x3bb1de6b5c3814af:0xb198b1f7b3d9867b!8m2!3d13.3091042!4d77.5379518!16s%2Fg%2F11fzvms4ld · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Durgashree-Samruddhi-Grand-Veg/store/1836915 · cuisine: Pure veg · listing_rating: 3.9 · listing_reviews: 868 · checked_on: 2026-10-10 · evidence: directory_reported · review_decision: needs_more_research · uncertainty: Name-family and address split unresolved: JD 'Durgashree Samruddhi Grand' near Kasaba Police Station vs this magicpin 'Grand Veg' at Muthasandra vs JD/district 'Durgashree Samruddhi Garden' (Bengaluru Hindupur Rd, Opposite Town Police Station) - the human must confirm which family member is the candidate. Opening hours left blank: magicpin window 11:30 AM - 2:00 PM (lunch display) conflicts with the family's other listings. maps_listing_url is a canonical /maps/place/ URL legitimately expanded from a short link published in a YouTube video description - no place-page content readable (marker coordinates identical to magicpin JSON-LD; directory-class evidence only). Plus code 8G5Q+J5W recorded as string. · notes: Phase 3H discovery round (2026-10-10): magicpin VERIFIED listing page-read (3.9/868, Rs 500 for two, phone, geo) + first rule-4-compliant Maps place URL captured in the project. Strong listings, but the Grand/Garden identity split must be settled first.
- **Matches to existing records:**
  - `987dad98` **Shri Manjunatha Grand Veg** · locality: Doddaballapura Railway Station — similarity 0.433 (name-ambiguous-proper-token) · existing coords: NULL — confidence low
- **Intra-file duplicates:** rows 36 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.3091042, 77.5379518 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Durgashree-Samruddhi-Grand-Veg/store/1836915. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `LOCALITY_CONFLICT`, `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 112: Zoop Cafe

- **Confidence:** medium
- **Input:** address: Abhi Nivas, Near Anand Comfort, Jalappa College Road, Doddaballapura Locality, Doddaballapura · locality: Doddaballapura town · city: Doddaballapura · phone: +917026911121 · coords: 13.2999467004, 77.5283644348 · source: https://www.district.in/dining/doddaballapura/zoop-cafe-doddaballapura-locality · cuisine: Street Food, American, Continental · evidence: directory_reported · review_decision: distinct_new_business · uncertainty: Queued name 'Diamond Zoop Cafe' does not match any source - the verified listing identity is 'Zoop Cafe' (human to confirm the intended identity). Opening hours left blank: district JSON-LD publishes only Sunday 11:00-21:30 (incomplete spec); page status observed 2026-10-10: 'Closed - Opens on 11 Oct' (temporary-closure signal, recorded verbatim). district shows '0.0 based on 1 rating' - no meaningful rating recorded. Out-of-zone namesake at Dabaspet/Sompura exists (not this listing).; Proximity advisory reviewed: ~9 m from 'Cafe Aaraike' — distinct name, distinct phone, separate listings; same-street neighbours, not duplicates.; Proximity advisory reviewed: ~143 m from 'Shahi Kitchen' — distinct name, distinct phone, separate listings; same-street neighbours, not duplicates. · notes: Phase 3H discovery round (2026-10-10): district.in JSON-LD page-read (address, phone, cuisine, geo, Rs 300 for two) + JD/magicpin/Zomato existence-references. | Round-3 (2026-10-11): district.in + magicpin same-name listings -> distinct_new_business; district structured geo 13.2999467,77.5283644 + hours 11:00-21:30 + phone +917026911121; magicpin corroborates (Pizza/Burger/Sandwich)
- **Intra-file duplicates:** rows 12, 50, 52 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.2999467004, 77.5283644348 — evidence level: directory_reported · source: https://www.district.in/dining/doddaballapura/zoop-cafe-doddaballapura-locality. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 113: Five Star Kohli Hut

- **Confidence:** medium
- **Input:** address: Ward 3, Near Indian Petrol Bunk, Scout Camp, Doddaballapura Locality, Doddaballapura · locality: Scout Camp Road · city: Doddaballapura · phone: +916363693426 · coords: 13.2796588, 77.5567803 · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Five-Star-Kohli-Hut/store/1644707 · cuisine: Fast Food · evidence: directory_reported · review_decision: distinct_new_business · uncertainty: Relationship to the JD 'Five Star Chicken - Koli Hut' listing (Basettihalli, Near Indian Overseas Bank) and to the national 'Five Star Chicken' brand is unresolved (one call decides; no conflict with the existing DB). No rating shown on the magicpin listing. Coordinates are magicpin JSON-LD geo (directory-reported, bucket 6) and sit ~30 m from row 15's plus-code decode - a proximity artifact across directories, both pins awaiting confirmation.; Proximity advisory reviewed (live row 'Ayyappa Tiffin Room'): ~493 m — distinct name, distinct phone, separate directory listings; same-street neighbours, not duplicates.; Proximity advisory reviewed: ~103 m from 'Dada Tea And Chats' — distinct name, distinct phone, separate listings; same-street neighbours, not duplicates.; Proximity advisory reviewed: ~34 m from 'Hotel Bindushree Family Restaurant' — distinct name, distinct phone, separate listings; same-street neighbours, not duplicates.; Proximity advisory reviewed: ~70 m from 'Abhis Food Court' — distinct name, distinct phone, separate listings; same-street neighbours, not duplicates. · notes: Phase 3H discovery round (2026-10-10): magicpin VERIFIED listing page-read (phone, 11:00 AM - 8:00 PM, Rs 450 for two, geo). Exact-name verified listing; brand-naming question blocks promotion. | Round-3 (2026-10-11): district.in + magicpin same-name listings with MATCHING phone +916363693426 -> distinct_new_business; district structured hours 11:00-20:00 recorded
- **Intra-file duplicates:** rows 5, 16, 22, 84, 101 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.2796588, 77.5567803 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Five-Star-Kohli-Hut/store/1644707. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 114: Lounge de La Reserve

- **Confidence:** medium
- **Input:** address: No. 63, Raghunathapura, Devanahalli Road, Doddaballapur, Bengaluru · locality: Raghunathapura · city: Doddaballapura · phone: +916366946331 · coords: 13.286726, 77.5824616 · source: https://www.district.in/dining/doddaballapura/lounge-de-la-r%C3%A9serve-2-doddaballapura-locality · cuisine: Continental, Asian, Mediterranean · listing_rating: 4.1 · listing_reviews: 26 · checked_on: 2026-10-10 · evidence: directory_reported · review_decision: needs_more_research · uncertainty: OUT-OF-ZONE FINDING - recorded recommendation do_not_import: every address variant places it on the Devanahalli Road at Raghunathapura near Grover Zampa Vineyards - the Doddaballapura-Devanahalli stretch, outside both agreed zones (queued name was 'La Reserve Lounge'; the listing identity is 'Lounge de La Reserve'; the decision enum has no do_not_import value so needs_more_research is recorded with this recommendation, same practice as rows 5 and 10). Opening hours conflict - left blank: district JSON-LD 10:00-17:00 x7 vs EazyDiner 09:00 AM - 05:00 PM x7. Price for two conflict: district Rs 1100 vs EazyDiner Rs 2000. Official Grover Zampa winery-tours page corroborates the phone. Human may override the zone call. · notes: Phase 3H discovery round (2026-10-10): district.in + EazyDiner page-reads. Recorded in full because the name was human-queued, but it fails the zone statement.
- **Intra-file duplicates:** rows 35 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.286726, 77.5824616 — evidence level: directory_reported · source: https://www.district.in/dining/doddaballapura/lounge-de-la-r%C3%A9serve-2-doddaballapura-locality. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

## Insufficient evidence (1)

### Row 74: Biryani Cafe

- **Confidence:** low
- **Input:** review_decision: needs_more_research · uncertainty: Fully generic name. Searches combining the name with Nagadenahalli, Doddaballapura and GITAM (2026-10-09) returned no matching listing in the target zones; several unrelated businesses elsewhere in Bengaluru share the name. The Phase 3C region grouping is the only locality hint and it is unverified. · notes: No listing found; nothing asserted about existence or newness. Row kept so the open question stays visible.
- **Recommended initial verification_status:** unverified

## Invalid or missing data (0)

_None._

## 6. Candidate coordinates awaiting confirmation (89)

Every pin below stays a CANDIDATE until its relationship to the exact business is independently confirmed. A directory-published pin or a map-search result is NOT proof of an exact coordinate.

| Row | Candidate | Bucket | Coordinates | Evidence | Source URL |
| ---: | --- | --- | --- | --- | --- |
| 1 | Kiyash Family Restaurant | potential_new | 13.2805361, 77.6067411 | directory_reported | https://www.district.in/dining/bangalore/kiyash-family-restaurant-doddaballapura-locality-doddaballapura |
| 2 | MP Kitchen | possible_duplicate | 13.2272025, 77.5493051 | directory_reported | https://www.district.in/dining/bangalore/mp-kitchen-doddaballapura-locality-doddaballapura |
| 3 | 1947 The Western Cafe House | possible_duplicate | 13.3006833, 77.5245033 | directory_reported | https://www.district.in/dining/doddaballapura/1947-the-western-cafe-house-doddaballapura-locality |
| 4 | Amma's Juice And Chats Corner | potential_new | 13.22452, 77.54933 | directory_reported | https://www.district.in/dining/doddaballapura/ammas-juice-and-chats-corner-doddaballapura-locality |
| 5 | Appu Rolls | possible_duplicate | 13.279762, 77.557415 | directory_reported | https://www.district.in/dining/doddaballapura/appu-rolls-doddaballapura-locality |
| 6 | Arun Ice Creams | possible_duplicate | 13.30581, 77.5376 | directory_reported | https://www.district.in/dining/doddaballapura/arun-ice-creams-doddaballapura-locality |
| 7 | Ayodhya Grand | possible_duplicate | 13.2648369621, 77.5529341939 | directory_reported | https://www.district.in/dining/doddaballapura/ayodhya-grand-doddaballapura-locality |
| 8 | Bangarpete Chats | possible_duplicate | 13.2948625, 77.5401094 | directory_reported | https://www.district.in/dining/doddaballapura/bangarpete-chats-doddaballapura-locality |
| 9 | Banglore Iyengar Bakery & Sweets | possible_duplicate | 13.2939841185, 77.5425419211 | directory_reported | https://www.district.in/dining/doddaballapura/banglore-iyengar-bakery-sweets-doddaballapura-locality |
| 10 | Biryani Darbhar | potential_new | 13.3016587128, 77.5434562423 | directory_reported | https://www.district.in/dining/doddaballapura/biryani-darbhar-doddaballapura-locality |
| 11 | Cafe 66 | potential_new | 13.2966151, 77.5408004 | directory_reported | https://www.district.in/dining/doddaballapura/cafe-66-1-doddaballapura-locality |
| 12 | Cafe Aaraike | possible_duplicate | 13.2998785778, 77.5283190721 | directory_reported | https://www.district.in/dining/doddaballapura/cafe-aaraike-doddaballapura-locality |
| 13 | Chai Bunk Cafe | potential_new | 13.2802331, 77.5304478 | directory_reported | https://www.district.in/dining/doddaballapura/chai-bunk-cafe-4-doddaballapura-locality |
| 14 | Creamy Nuts | potential_new | 13.2841253, 77.5676358 | directory_reported | https://www.district.in/dining/doddaballapura/creamy-nuts-doddaballapura-locality |
| 15 | D Food Express | potential_new | 13.2286051, 77.5468951 | directory_reported | https://www.district.in/dining/doddaballapura/d-food-express-doddaballapura-locality |
| 16 | Dada Tea And Chats | possible_duplicate | 13.2800116791, 77.5576570558 | directory_reported | https://www.district.in/dining/doddaballapura/dada-tea-and-chats-doddaballapura-locality |
| 17 | Darbar The Cafe | possible_duplicate | 13.3084363493, 77.5425960441 | directory_reported | https://www.district.in/dining/doddaballapura/darbar-the-cafe-doddaballapura-locality |
| 18 | Devangas Kitchen | possible_duplicate | 13.2991208, 77.5300155 | directory_reported | https://www.district.in/dining/doddaballapura/devangas-kitchen-doddaballapura-locality |
| 19 | Domino's Pizza | possible_duplicate | 13.305617, 77.537771 | directory_reported | https://www.district.in/dining/doddaballapura/dominos-pizza-doddaballapura-locality |
| 20 | DREAM CAFE | possible_duplicate | 13.299307, 77.529778 | directory_reported | https://www.district.in/dining/doddaballapura/dream-cafe-doddaballapura-locality |
| 21 | Durgashree Samruddhi Garden | possible_duplicate | 13.3085389173, 77.5438789937 | directory_reported | https://www.district.in/dining/doddaballapura/durgashree-samruddhi-garden-1-doddaballapura-locality |
| 22 | Five Star Chicken | possible_duplicate | 13.2798262, 77.5559189 | directory_reported | https://www.district.in/dining/doddaballapura/five-star-chicken-4-doddaballapura-locality |
| 23 | Five Star Chicken | possible_duplicate | 13.3025657639, 77.5383659198 | directory_reported | https://www.district.in/dining/doddaballapura/five-star-chicken-doddaballapura-locality |
| 24 | Forkful - Global Vegetarian Cuisine | potential_new | 13.2961413, 77.6014601 | directory_reported | https://www.district.in/dining/doddaballapura/forkful-global-vegetarian-cuisine-3-doddaballapura-locality |
| 25 | G P Non Veg Corner | possible_duplicate | 13.306933, 77.54537 | directory_reported | https://www.district.in/dining/doddaballapura/g-p-non-veg-corner-doddaballapura-locality |
| 26 | Golden Cafe & Resto | possible_duplicate | 13.2810952913, 77.5519558217 | directory_reported | https://www.district.in/dining/doddaballapura/golden-cafe-resto-doddaballapura-locality |
| 27 | Golden Kabab & Fried Rice | possible_duplicate | 13.30069828, 77.52401098 | directory_reported | https://www.district.in/dining/doddaballapura/golden-kabab-fried-rice-doddaballapura-locality |
| 28 | Hotel Sweetheart | potential_new | 13.3134515127, 77.538818417 | directory_reported | https://www.district.in/dining/doddaballapura/hotel-sweetheart-doddaballapura-locality |
| 29 | House Full | potential_new | 13.3162034, 77.5515349 | directory_reported | https://www.district.in/dining/doddaballapura/house-full-doddaballapura-locality |
| 30 | I Cake Bakery | possible_duplicate | 13.3063965872, 77.5374441399 | directory_reported | https://www.district.in/dining/doddaballapura/i-cake-bakery-doddaballapura-locality |
| 31 | Ifruit | possible_duplicate | 13.2279075, 77.5498265 | directory_reported | https://www.district.in/dining/doddaballapura/ifruit-doddaballapura-locality |
| 32 | Kanti Sweets - Since 1957 | potential_new | 13.2604171514, 77.5523775765 | directory_reported | https://www.district.in/dining/doddaballapura/kanti-sweets-since-1957-doddaballapura-locality |
| 33 | Kelvin Scale - Absolute Ice Creams | potential_new | 13.2857702, 77.5444205 | directory_reported | https://www.district.in/dining/doddaballapura/kelvin-scale-absolute-ice-creams-doddaballapura-locality |
| 34 | Kwality Walls | possible_duplicate | 13.2944632, 77.5391822 | directory_reported | https://www.district.in/dining/doddaballapura/kwality-walls-doddaballapura-locality |
| 35 | Lounge de La Réserve | possible_duplicate | 13.286726, 77.5824616 | directory_reported | https://www.district.in/dining/doddaballapura/lounge-de-la-r%C3%A9serve-2-doddaballapura-locality |
| 36 | M M Biriyani Grand | possible_duplicate | 13.3092425, 77.5369393 | directory_reported | https://www.district.in/dining/doddaballapura/m-m-biriyani-grand-doddaballapura-locality |
| 37 | Mallu Hindu Military Hotel | possible_duplicate | 13.2937834, 77.5419057 | directory_reported | https://www.district.in/dining/doddaballapura/mallu-hindu-military-hotel-doddaballapura-locality |
| 38 | Mathsya Darshini | possible_duplicate | 13.3097294676, 77.5424768975 | directory_reported | https://www.district.in/dining/doddaballapura/mathsya-darshini-doddaballapura-locality |
| 39 | Mr Shawarma Miss Grills | possible_duplicate | 13.2805484, 77.5523229 | directory_reported | https://www.district.in/dining/doddaballapura/mr-shawarma-miss-grills-1-doddaballapura-locality |
| 40 | Naati Mane | possible_duplicate | 13.2940295787, 77.5427164587 | directory_reported | https://www.district.in/dining/doddaballapura/naati-mane-1-doddaballapura-locality |
| 41 | Parisara Family Dhaba | possible_duplicate | 13.306866, 77.532168 | directory_reported | https://www.district.in/dining/doddaballapura/parisara-family-dhaba-7-doddaballapura-locality |
| 42 | Pizza Corner | possible_duplicate | 13.3025975, 77.5383182 | directory_reported | https://www.district.in/dining/doddaballapura/pizza-corner-doddaballapura-locality |
| 43 | Pizza Palace | possible_duplicate | 13.298069583, 77.5320427492 | directory_reported | https://www.district.in/dining/doddaballapura/pizza-palace-doddaballapura-locality |
| 44 | R R Lunch House | possible_duplicate | 13.3064484272, 77.5454970619 | directory_reported | https://www.district.in/dining/doddaballapura/r-r-lunch-house-doddaballapura-locality |
| 45 | Raj Dam Biryani Center & Family Restaurant | possible_duplicate | 13.3063939518, 77.5463942323 | directory_reported | https://www.district.in/dining/doddaballapura/raj-dam-biryani-center-family-restaurant-doddaballapura-locality |
| 46 | Rajanna Nati Style Dum Biryani | possible_duplicate | 13.2804354545, 77.5524030626 | directory_reported | https://www.district.in/dining/doddaballapura/rajanna-nati-style-dum-biryani-doddaballapura-locality |
| 47 | RD Restaurant | potential_new | 13.2821991535, 77.5315039605 | directory_reported | https://www.district.in/dining/doddaballapura/rd-restaurant-doddaballapura-locality |
| 48 | Royal Dine Food Corner | possible_duplicate | 13.2287779, 77.549619 | directory_reported | https://www.district.in/dining/doddaballapura/royal-dine-food-corner-doddaballapura-locality |
| 49 | Royal Ruchis | possible_duplicate | 13.3033799, 77.541754 | directory_reported | https://www.district.in/dining/doddaballapura/royal-ruchis-2-doddaballapura-locality |
| 50 | Samosa Hut | possible_duplicate | 13.2997724, 77.527535 | directory_reported | https://www.district.in/dining/doddaballapura/samosa-hut-doddaballapura-locality |
| 51 | Sandwich Wallas | possible_duplicate | 13.2934002164, 77.5403223968 | directory_reported | https://www.district.in/dining/doddaballapura/sandwich-wallas-doddaballapura-locality |
| 52 | Shahi Kitchen | possible_duplicate | 13.2994863137, 77.5296022743 | directory_reported | https://www.district.in/dining/doddaballapura/shahi-kitchen-doddaballapura-locality |
| 53 | Shree Raghavendra Grand | potential_new | 13.3294889, 77.5324833 | directory_reported | https://www.district.in/dining/doddaballapura/shree-raghavendra-grand-doddaballapura-locality |
| 54 | Shri Sai Tiffin And Fast Food | potential_new | 13.2957181599, 77.5363937536 | directory_reported | https://www.district.in/dining/doddaballapura/shri-sai-tiffin-and-fast-food-doddaballapura-locality |
| 55 | Sizzlly Chicken | potential_new | 13.2889578685, 77.532123886 | directory_reported | https://www.district.in/dining/doddaballapura/sizzlly-chicken-1-doddaballapura-locality |
| 56 | SME Chats And Ice Cream | possible_duplicate | 13.2930503, 77.5407013 | directory_reported | https://www.district.in/dining/doddaballapura/sme-chats-and-ice-cream-doddaballapura-locality |
| 57 | Spicy Bowl | possible_duplicate | 13.3061807447, 77.5311062071 | directory_reported | https://www.district.in/dining/doddaballapura/spicy-bowl-doddaballapura-locality |
| 58 | Sri Nandi Utsav | potential_new | 13.2463719, 77.552972 | directory_reported | https://www.district.in/dining/doddaballapura/sri-nandi-utsav-doddaballapura-locality |
| 59 | Sri Sai Ram Hot Chips | possible_duplicate | 13.2980974, 77.5320822 | directory_reported | https://www.district.in/dining/doddaballapura/sri-sai-ram-hot-chips-doddaballapura-locality |
| 60 | Sujatha Fish Cort | possible_duplicate | 13.3099728, 77.5424424 | directory_reported | https://www.district.in/dining/doddaballapura/sujatha-fish-cort-doddaballapura-locality |
| 61 | The Brothers Adda | possible_duplicate | 13.3028391559, 77.5390754687 | directory_reported | https://www.district.in/dining/doddaballapura/the-brothers-adda-1-doddaballapura-locality |
| 62 | The Momo Spot | possible_duplicate | 13.228409, 77.549895 | directory_reported | https://www.district.in/dining/doddaballapura/the-momo-spot-doddaballapura-locality |
| 63 | The Monkey House | possible_duplicate | 13.2947637, 77.5399817 | directory_reported | https://www.district.in/dining/doddaballapura/the-monkey-house-1-doddaballapura-locality |
| 64 | The Monkey house Lassi & More | possible_duplicate | 13.2287819, 77.5496407 | directory_reported | https://www.district.in/dining/doddaballapura/the-monkey-house-lassi-more-doddaballapura-locality |
| 65 | U Turn Paradise | potential_new | 13.2321984665, 77.5507964194 | directory_reported | https://www.district.in/dining/doddaballapura/u-turn-paradise-4-doddaballapura-locality |
| 66 | Udupi Garden Hotel | possible_duplicate | 13.2647600134, 77.5528303289 | directory_reported | https://www.district.in/dining/doddaballapura/udupi-garden-hotel-doddaballapura-locality |
| 67 | Vamsi Military Hotel | potential_new | 13.2583406875, 77.5519832881 | directory_reported | https://www.district.in/dining/doddaballapura/vamsi-military-hotel-doddaballapura-locality |
| 68 | Veg Sandwich And Lassi Point | possible_duplicate | 13.3091118, 77.5426434 | directory_reported | https://www.district.in/dining/doddaballapura/veg-sandwich-and-lassi-point-doddaballapura-locality |
| 69 | VRB HOTEL FAMILY RESTAURANT | potential_new | 13.3248068, 77.5334655 | directory_reported | https://www.district.in/dining/doddaballapura/vrb-hotel-family-restaurant-doddaballapura-locality |
| 73 | Epicurus Multi Cuisine Restaurant | potential_new | 13.2852505, 77.598904 | directory_reported | https://www.district.in/dining/doddaballapura/epicurus-multi-cuisine-restaurant-doddaballapura-locality |
| 77 | Lotus Gardenia | possible_duplicate | 13.2796901, 77.5549033 | directory_reported | https://www.justdial.com/Bangalore/Lotus-Gardenia-Restaurants-Bar-Rooms-Opposite-Indian-Oil-Petrol-BunkNear-Railway-Station-Doddaballapur/080PXX80-XX80-210421154401-X4L9_BZDET |
| 78 | Vaibhava Sweets & Chats | potential_new | 13.2869155, 77.5747334 | directory_reported | https://www.youtube.com/watch?v=HMjTk-zVNoU |
| 84 | Hotel Bindushree Family Restaurant | possible_duplicate | 13.2799, 77.556969 | directory_reported | https://magicpin.in/Bangalore/Bashettihalli/Hotel/Hotel-Bindushree-Family-Restaurant/store/1174189 |
| 86 | Sri Vinayaka Food Point | possible_duplicate | 13.279693, 77.5515242 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Sri-Vinayaka-Food-Point/store/15a4365 |
| 89 | Hotel Krishnamoorthy | possible_duplicate | 13.280305, 77.551956 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Hotel-Krishnamoorthy/store/525080 |
| 101 | Abhis Food Court | possible_duplicate | 13.2798556, 77.5561673 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Abhis-Food-Court/store/1575606 |
| 102 | Burger Time | potential_new | 13.291965, 77.542015 | directory_reported | https://www.district.in/dining/doddaballapura/burger-time-doddaballapura-locality |
| 103 | Bbq Junction | potential_new | 13.285751, 77.5311807 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Bbq-Junction/store/1835603 |
| 104 | Rajashree Veg And Non-Veg Family Restaurant | potential_new | 13.301893, 77.55085 | directory_reported | https://www.district.in/dining/doddaballapura/rajashree-veg-and-non-veg-family-restaurant-doddaballapura-locality |
| 105 | Maha Naati Ruchi | possible_duplicate | 13.3044077, 77.5425688 | directory_reported | https://www.district.in/dining/doddaballapura/maha-naati-ruchi-3-doddaballapura-locality |
| 107 | Shawarma Cartel | possible_duplicate | 13.2934035, 77.5414015 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Shawarma-Cartel/store/17934a0 |
| 108 | Udupi Upahar | possible_duplicate | 13.3071176, 77.5375286 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Udupi-Upahar/store/1833086 |
| 110 | Durgashree Samruddhi Grand Veg | possible_duplicate | 13.3091042, 77.5379518 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Durgashree-Samruddhi-Grand-Veg/store/1836915 |
| 112 | Zoop Cafe | possible_duplicate | 13.2999467004, 77.5283644348 | directory_reported | https://www.district.in/dining/doddaballapura/zoop-cafe-doddaballapura-locality |
| 113 | Five Star Kohli Hut | possible_duplicate | 13.2796588, 77.5567803 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Five-Star-Kohli-Hut/store/1644707 |
| 114 | Lounge de La Reserve | possible_duplicate | 13.286726, 77.5824616 | directory_reported | https://www.district.in/dining/doddaballapura/lounge-de-la-r%C3%A9serve-2-doddaballapura-locality |
| 115 | S B Cake Palace | potential_new | 13.2869351, 77.5953036 | directory_reported | https://www.osm.org/node/6761348188 |
| 116 | Hotel Abiram | existing_match | 13.2850057, 77.5962022 | directory_reported | https://www.osm.org/node/11348670810 |
| 119 | Indian Paratha Palace | potential_new | 13.355991, 77.6537493 | directory_reported | https://www.osm.org/node/11117196994 |

## Next step

Nothing has been imported. Resolve rows flagged for manual review, fix invalid rows, then re-run this validator until the report is clean. Only after explicit human approval may an import be prepared — via a reviewed SQL/insert path, never by this tool.
