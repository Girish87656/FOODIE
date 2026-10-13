# Foodie — Restaurant Import Dry-Run Report

**Mode:** dry-run (read-only) · **Tool:** foodie-restaurant-import-validator v1.1.0

## Run context

| Item | Value |
| --- | --- |
| Input file | `/home/z/my-project/scripts/foodie-import-validator/input/research-worksheet-round4.csv` |
| Input sha256 | `c9f648ff576fdcb4dfa5e1bca946f9d9f4a0706d16dfb13e79e9ee7f3691c490` |
| Rows in input | 551 |
| Baseline source | snapshot |
| Baseline file | `/home/z/my-project/scripts/foodie-import-validator/fixtures/baseline-snapshot.json` |
| Baseline sha256 | `967a68f39a1ec56aba8f5752ac4886501f1ef5fb0728d36e48a3cfc9bb2cead8` |
| Baseline fetched at | 2026-10-11T07:54:44.697Z |
| Baseline rows (existing restaurants) | 14 |

## Summary

| Bucket | Rows |
| --- | ---: |
| 1. Potential new businesses | 140 |
| 2. Existing-record matches | 7 |
| 3. Possible duplicates / ambiguous | 403 |
| 4. Insufficient evidence | 1 |
| 5. Invalid or missing data | 0 |
| 6. Candidate coordinates awaiting confirmation (cross-cutting) | 513 |
| **Total rows** | **551** |
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

## Potential new businesses (140)

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

### Row 129: DURGA PAN SHOP (ROYAL NANDANA)

- **Confidence:** medium
- **Input:** address: Doddaballapura Main Rd, near navada school, Aralumallige, Arehalli Guddadahalli, Karnataka 562163, Bashettihalli, Bangalore, Bangalore · locality: Bashettihalli · city: Bangalore · coords: 13.2704995, 77.5517875 · source: https://magicpin.in/Bangalore/Bashettihalli/Restaurant/Durga-Pan-Shop-(Royal-Nandana)/store/1b00101 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Bashettihalli' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Coordinates awaiting confirmation:** 13.2704995, 77.5517875 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Bashettihalli/Restaurant/Durga-Pan-Shop-(Royal-Nandana)/store/1b00101. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Recommended initial verification_status:** unverified

### Row 130: Harika Restaurant

- **Confidence:** medium
- **Input:** address: Bengaluru, Bashettihalli, Karnataka 562163, Bashettihalli, Bangalore, Bangalore · locality: Bashettihalli · city: Bangalore · coords: 13.286655999999999, 77.56829739999999 · source: https://magicpin.in/Bangalore/Bashettihalli/Restaurant/Harika-Restaurant/store/2008145 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Bashettihalli' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Coordinates awaiting confirmation:** 13.286655999999999, 77.56829739999999 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Bashettihalli/Restaurant/Harika-Restaurant/store/2008145. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Recommended initial verification_status:** unverified

### Row 134: HOTEL SHREE HANUMAN

- **Confidence:** medium
- **Input:** address: 7H98+69C, Industrial Site Phase 3, Doddaballapura, Bashettihalli, Karnataka 562163, Bashettihalli, Bangalore, Bangalore · locality: Bashettihalli · city: Bangalore · coords: 13.267978099999999, 77.56561789999999 · source: https://magicpin.in/Bangalore/Bashettihalli/Restaurant/Hotel-Shree-Hanuman/store/47b3224 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Bashettihalli' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Coordinates awaiting confirmation:** 13.267978099999999, 77.56561789999999 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Bashettihalli/Restaurant/Hotel-Shree-Hanuman/store/47b3224. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Recommended initial verification_status:** unverified

### Row 137: Lakshmi Caterers | Doddaballapur Industrial Area

- **Confidence:** medium
- **Input:** address: N.S. Info-City International Township, Near Aperal Park Near Railway Station, Doddaballapur, Industrial Area, Sonnappanahalli, Karnataka 562163, Bashettihalli, Bangalore, Bangalore · locality: Bashettihalli · city: Bangalore · phone: +919902336261 · coords: 13.286240099999999, 77.5712096 · source: https://magicpin.in/Bangalore/Bashettihalli/Restaurant/Lakshmi-Caterers-|-Doddaballapur-Industrial-Area/store/18b9325 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Bashettihalli' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Coordinates awaiting confirmation:** 13.286240099999999, 77.5712096 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Bashettihalli/Restaurant/Lakshmi-Caterers-|-Doddaballapur-Industrial-Area/store/18b9325. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Recommended initial verification_status:** unverified

### Row 139: Shiva Chats

- **Confidence:** medium
- **Input:** address: 07, Ground Floor, Bashettihalli, Doddaballapura Locality, Doddaballapura, Bashettihalli, Bangalore, Bangalore · locality: Bashettihalli · city: Bangalore · phone: +917204174730 · coords: 13.26205039, 77.55608548 · source: https://magicpin.in/Bangalore/Bashettihalli/Restaurant/Shiva-Chats/store/17587c3 · listing_rating: 3.7 · listing_reviews: 137 · checked_on: 2026-10-11 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Bashettihalli' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). External listing rating 3.7/137 recorded with source URL + check date — NEVER a Foodie community value. Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Coordinates awaiting confirmation:** 13.26205039, 77.55608548 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Bashettihalli/Restaurant/Shiva-Chats/store/17587c3. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Recommended initial verification_status:** unverified

### Row 140: Shree Dhaba Restaurant

- **Confidence:** medium
- **Input:** address: &, Thippapura road, beside satelite ring road, from rangappa circle, Doddaballapura, Karnataka 561203, Bashettihalli, Bangalore, Bangalore · locality: Bashettihalli · city: Bangalore · coords: 13.272928499999999, 77.5445039 · source: https://magicpin.in/Bangalore/Bashettihalli/Restaurant/Shree-Dhaba-Restaurant/store/1849c26 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Bashettihalli' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Coordinates awaiting confirmation:** 13.272928499999999, 77.5445039 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Bashettihalli/Restaurant/Shree-Dhaba-Restaurant/store/1849c26. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Recommended initial verification_status:** unverified

### Row 143: Tejas Tefan Centre

- **Confidence:** medium
- **Input:** address: Hobadanahalli Circle, Bashettihalli, Bangalore, Bangalore · locality: Bashettihalli · city: Bangalore · phone: +919611413208 · coords: 13.2751596, 77.5814554 · source: https://magicpin.in/Bangalore/Bashettihalli/Restaurant/Tejas-Tefan-Centre/store/1506588 · cuisine: Chinese, North Indian, Seafood, Kebab, Street Food · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Bashettihalli' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Coordinates awaiting confirmation:** 13.2751596, 77.5814554 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Bashettihalli/Restaurant/Tejas-Tefan-Centre/store/1506588. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Recommended initial verification_status:** unverified

### Row 151: BAITH AL BHATKAL BIRYANI

- **Confidence:** medium
- **Input:** address: IMRANAISHA905@GMAIL.COM, Doddaballapur Road, Bangalore, Bangalore · locality: Doddaballapur-Road · city: Bangalore · phone: +917411036273 · coords: 13.1138529, 77.5795077 · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Baith-Al-Bhatkal-Biryani/store/3734698 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur-Road' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Coordinates awaiting confirmation:** 13.1138529, 77.5795077 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Baith-Al-Bhatkal-Biryani/store/3734698. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Recommended initial verification_status:** unverified

### Row 152: Baskin Robbins

- **Confidence:** medium
- **Input:** address: Hotel Nandagokula, SJM Arcade, Hyderabad - Bangalore Hwy, Bengaluru, Devanahalli, Karnataka 562110, Doddaballapur Road, Bangalore, Bangalore · locality: Doddaballapur-Road · city: Bangalore · phone: +917406141747 · coords: 13.2609807, 77.7140271 · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Baskin-Robbins/store/1c0377c · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur-Road' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Coordinates awaiting confirmation:** 13.2609807, 77.7140271 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Baskin-Robbins/store/1c0377c. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Recommended initial verification_status:** unverified

### Row 168: Domino's Chicken Fiesta

- **Confidence:** medium
- **Input:** address: Ground Floor, No 135/3, Devanahalli Town, Devanahalli, International Airport, Bengaluru, Doddaballapur Road, Bangalore, Bangalore · locality: Doddaballapur-Road · city: Bangalore · phone: +919513220109 · coords: 13.258235, 77.717834 · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Dominos-Chicken-Fiesta/store/1785319 · listing_rating: 4.1 · listing_reviews: 32 · checked_on: 2026-10-11 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur-Road' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). External listing rating 4.1/32 recorded with source URL + check date — NEVER a Foodie community value. · notes: Round-4 single-source lead (2026-10-11).
- **Coordinates awaiting confirmation:** 13.258235, 77.717834 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Dominos-Chicken-Fiesta/store/1785319. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Recommended initial verification_status:** unverified

### Row 182: Grandpaw Pet Resort

- **Confidence:** medium
- **Input:** address: Nandhi Hills Rd, Abachikkanahalli, Doddaballapur Road, Bangalore, Bangalore · locality: Doddaballapur-Road · city: Bangalore · phone: +919631220007 · coords: 13.28344858, 77.70805467 · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Grandpaw-Pet-Resort/store/a81a18 · cuisine: South Indian · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur-Road' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Coordinates awaiting confirmation:** 13.28344858, 77.70805467 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Grandpaw-Pet-Resort/store/a81a18. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Recommended initial verification_status:** unverified

### Row 193: keshava Annapoorneshwari catering and flower decoration

- **Confidence:** medium
- **Input:** address: Devanahalli, Southegowdanahalli, Karnataka 562110, Doddaballapur Road, Bangalore, Bangalore · locality: Doddaballapur-Road · city: Bangalore · phone: +919448594001 · coords: 13.2521715, 77.7105012 · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Keshava-Annapoorneshwari-Catering-And-Flower-Decoration/store/1848638 · cuisine: Catering food and drink supplier · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur-Road' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Coordinates awaiting confirmation:** 13.2521715, 77.7105012 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Keshava-Annapoorneshwari-Catering-And-Flower-Decoration/store/1848638. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Recommended initial verification_status:** unverified

### Row 196: Lakshya Cafe

- **Confidence:** medium
- **Input:** address: BB Road, Opposite Hyundai Showroom, Devanahalli, Bangalore, Doddaballapur Road, Bangalore, Bangalore · locality: Doddaballapur-Road · city: Bangalore · coords: 13.2555246353, 77.7147979736 · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Lakshya-Cafe/store/37229c3 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur-Road' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Coordinates awaiting confirmation:** 13.2555246353, 77.7147979736 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Lakshya-Cafe/store/37229c3. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Recommended initial verification_status:** unverified

### Row 197: Lokesh Shop

- **Confidence:** medium
- **Input:** address: 12, Devanahally, Doddaballapur Road, Bangalore, Bangalore · locality: Doddaballapur-Road · city: Bangalore · phone: +917353659822 · coords: 13.2827774, 77.7047328 · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Lokesh-Shop/store/14c428b · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur-Road' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Coordinates awaiting confirmation:** 13.2827774, 77.7047328 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Lokesh-Shop/store/14c428b. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Recommended initial verification_status:** unverified

### Row 198: M.R. CHICKEN CENTER

- **Confidence:** medium
- **Input:** address: Maralu Oni, Karnataka 562110, Doddaballapur Road, Bangalore, Bangalore · locality: Doddaballapur-Road · city: Bangalore · phone: +919916123485 · coords: 13.2509955, 77.70137749999999 · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/M.r.-Chicken-Center/store/1976a59 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur-Road' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Coordinates awaiting confirmation:** 13.2509955, 77.70137749999999 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/M.r.-Chicken-Center/store/1976a59. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Recommended initial verification_status:** unverified

### Row 209: NANDI UPAHAR MANDIRA

- **Confidence:** medium
- **Input:** address: Karnataka 562110, Doddaballapur Road, Bangalore, Bangalore · locality: Doddaballapur-Road · city: Bangalore · coords: 13.266783199999999, 77.6729476 · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Nandi-Upahar-Mandira/store/1b20ba9 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur-Road' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Coordinates awaiting confirmation:** 13.266783199999999, 77.6729476 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Nandi-Upahar-Mandira/store/1b20ba9. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Recommended initial verification_status:** unverified

### Row 223: RSM CANDIMENTS

- **Confidence:** medium
- **Input:** address: NH648, Neeleri, Devanahalli, Karnataka 562110, Doddaballapur Road, Bangalore, Bangalore · locality: Doddaballapur-Road · city: Bangalore · phone: +919886088843 · coords: 13.258008, 77.7091581 · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Rsm-Candiments/store/4471b68 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur-Road' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Coordinates awaiting confirmation:** 13.258008, 77.7091581 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Rsm-Candiments/store/4471b68. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Recommended initial verification_status:** unverified

### Row 227: Sangeetha Dhaba

- **Confidence:** medium
- **Input:** address: Bangalore Hyderabad highway, NH 44, Bengaluru, Karnataka 562164, Doddaballapur Road, Bangalore, Bangalore · locality: Doddaballapur-Road · city: Bangalore · phone: +919740152589 · coords: 13.285047899999999, 77.7236293 · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Sangeetha-Dhaba/store/19a2138 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur-Road' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Coordinates awaiting confirmation:** 13.285047899999999, 77.7236293 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Sangeetha-Dhaba/store/19a2138. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Recommended initial verification_status:** unverified

### Row 232: Sreyo

- **Confidence:** medium
- **Input:** address: 95, 10th Ward, Neeleri, Bidalur, Devanahalli, Bangalore, Doddaballapur Road, Bangalore, Bangalore · locality: Doddaballapur-Road · city: Bangalore · phone: +919110489699 · coords: 13.2745015, 77.7106821 · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Sreyo/store/17891ca · listing_rating: 4.8 · listing_reviews: 115 · checked_on: 2026-10-11 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur-Road' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). External listing rating 4.8/115 recorded with source URL + check date — NEVER a Foodie community value. · notes: Round-4 single-source lead (2026-10-11).
- **Coordinates awaiting confirmation:** 13.2745015, 77.7106821 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Sreyo/store/17891ca. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Recommended initial verification_status:** unverified

### Row 237: Sri Veerabadra Tiffen

- **Confidence:** medium
- **Input:** address: Sri Veeraadra Tiffen, Vijayapura Town, Doddaballapur Road, Bangalore, Bangalore · locality: Doddaballapur-Road · city: Bangalore · phone: +919164924893 · coords: 13.251832, 77.718401 · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Sri-Veerabadra-Tiffen/store/1476a38 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur-Road' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Coordinates awaiting confirmation:** 13.251832, 77.718401 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Sri-Veerabadra-Tiffen/store/1476a38. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Recommended initial verification_status:** unverified

### Row 242: The Daily Table

- **Confidence:** medium
- **Input:** address: Flat number B-010,Ground floor,sai springs, doddaballapura road, avalahalli village,Yalahanka, Bangalore North,Bangalore,Karnataka-560064., Yelahanka, B.B.M.P North, , Karnataka, Doddaballapur Road, Bangalore, Bangalore · locality: Doddaballapur-Road · city: Bangalore · phone: +916363890341 · coords: 12.9628669, 77.57750899999999 · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/The-Daily-Table/store/17a2a5c · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur-Road' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Coordinates awaiting confirmation:** 12.9628669, 77.57750899999999 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/The-Daily-Table/store/17a2a5c. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Recommended initial verification_status:** unverified

### Row 245: The Mangalore Kitchen

- **Confidence:** medium
- **Input:** address: 46, Ground Floor, Adithya Enclave, 1st Phase, Binnamangala, Devanahalli, Bangalore, Doddaballapur Road, Bangalore, Bangalore · locality: Doddaballapur-Road · city: Bangalore · phone: +919945631753 · coords: 13.2555968646, 77.7229501935 · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/The-Mangalore-Kitchen/store/177ab52 · listing_rating: 3.6 · listing_reviews: 145 · checked_on: 2026-10-11 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur-Road' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). External listing rating 3.6/145 recorded with source URL + check date — NEVER a Foodie community value. Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Coordinates awaiting confirmation:** 13.2555968646, 77.7229501935 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/The-Mangalore-Kitchen/store/177ab52. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Recommended initial verification_status:** unverified

### Row 255: Amulya Chats and Fast Food

- **Confidence:** medium
- **Input:** address: 7GRP+VJG, Aa.Na.Kru Rd, Doddaballapura, Karnataka 561203, Doddaballapur, Bangalore, Bangalore · locality: Doddaballapur · city: Bangalore · coords: 13.2921778, 77.5365631 · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Amulya-Chats-And-Fast-Food/store/3cb6a81 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Coordinates awaiting confirmation:** 13.2921778, 77.5365631 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Amulya-Chats-And-Fast-Food/store/3cb6a81. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Recommended initial verification_status:** unverified

### Row 256: Andhra Ruchulu, Doddaballapura

- **Confidence:** medium
- **Input:** address: Gouribidhnur road, beside Indian Oil Petrol Bunk, Kantanakunte, Doddaballapura, Karnataka 561203, Doddaballapur, Bangalore, Bangalore · locality: Doddaballapur · city: Bangalore · phone: +919108204689 · coords: 13.327593799999999, 77.5327921 · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Andhra-Ruchulu,-Doddaballapura/store/1974c9c · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Coordinates awaiting confirmation:** 13.327593799999999, 77.5327921 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Andhra-Ruchulu,-Doddaballapura/store/1974c9c. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Recommended initial verification_status:** unverified

### Row 261: Bhargavi Daba

- **Confidence:** medium
- **Input:** address: 7GWH+MXX, Doddaballapura, Karnataka 561203, Doddaballapur, Bangalore, Bangalore · locality: Doddaballapur · city: Bangalore · coords: 13.296726, 77.5299754 · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Bhargavi-Daba/store/1a55792 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Coordinates awaiting confirmation:** 13.296726, 77.5299754 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Bhargavi-Daba/store/1a55792. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Recommended initial verification_status:** unverified

### Row 262: Bilari Condiments

- **Confidence:** medium
- **Input:** address: 7Gvv+Xgf, Nagadrupete, Near Chouk Circle, Doddaballapur, Bangalore, Bangalore · locality: Doddaballapur · city: Bangalore · phone: +919916590103 · coords: 13.2949297, 77.5437987 · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Bilari-Condiments/store/999700 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Coordinates awaiting confirmation:** 13.2949297, 77.5437987 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Bilari-Condiments/store/999700. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Recommended initial verification_status:** unverified

### Row 268: Cheftalk Food and Hospitality Services Pvt Ltd

- **Confidence:** medium
- **Input:** address: No. 46, */4, Kasaba area, Kantanakunte, Medihalli, Karnataka 561203, Doddaballapur, Bangalore, Bangalore · locality: Doddaballapur · city: Bangalore · phone: +918041310018 · coords: 13.3379038, 77.53642529999999 · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Cheftalk-Food-And-Hospitality-Services-Pvt-Ltd/store/1922a08 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Coordinates awaiting confirmation:** 13.3379038, 77.53642529999999 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Cheftalk-Food-And-Hospitality-Services-Pvt-Ltd/store/1922a08. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Recommended initial verification_status:** unverified

### Row 274: Durgashree Samruddhi Samrat

- **Confidence:** medium
- **Input:** address: 7HR2+6XC, Yelahanka–Hindupur Road, near D-Mart Muthur, Doddaballapura, Karnataka 561203, Doddaballapur, Bangalore, Bangalore · locality: Doddaballapur · city: Bangalore · coords: 13.2906719, 77.5520587 · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Durgashree-Samruddhi-Samrat/store/47c29a5 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Coordinates awaiting confirmation:** 13.2906719, 77.5520587 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Durgashree-Samruddhi-Samrat/store/47c29a5. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Recommended initial verification_status:** unverified

### Row 275: Food Bar

- **Confidence:** medium
- **Input:** address: 7GPV+WHM, Rangappa Circle, Shanthinagar, Doddaballapura, Karnataka 561203, Doddaballapur, Bangalore, Bangalore · locality: Doddaballapur · city: Bangalore · coords: 13.287328899999999, 77.54391869999999 · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Food-Bar/store/34630b8 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Coordinates awaiting confirmation:** 13.287328899999999, 77.54391869999999 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Food-Bar/store/34630b8. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Recommended initial verification_status:** unverified

### Row 278: HAP Daily

- **Confidence:** medium
- **Input:** address: Ward No.31,Shanthi Nagar,Muthayalamma, Beere Devara Gudi Rd, Doddaballapur, Bangalore, Bangalore · locality: Doddaballapur · city: Bangalore · phone: +919886249488 · coords: 13.2966897, 77.5345081 · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Hap-Daily/store/aa749b · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Coordinates awaiting confirmation:** 13.2966897, 77.5345081 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Hap-Daily/store/aa749b. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Recommended initial verification_status:** unverified

### Row 279: Hamsa Condiments

- **Confidence:** medium
- **Input:** address: 8G8P+Xm5, Opp Hp Petrol Bunk, Palanajogalli, Gauribidanur Road, Doddaballapur, Bangalore, Bangalore · locality: Doddaballapur · city: Bangalore · phone: +919164923450 · coords: 13.3173823, 77.5367226 · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Hamsa-Condiments/store/999a41 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Coordinates awaiting confirmation:** 13.3173823, 77.5367226 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Hamsa-Condiments/store/999a41. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Recommended initial verification_status:** unverified

### Row 282: Komb

- **Confidence:** medium
- **Input:** address: Doddaballapur, karnataka, Doddaballapur, Bangalore, Bangalore · locality: Doddaballapur · city: Bangalore · phone: +918618343752 · coords: 13.265678504901885, 77.56030392613965 · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Komb/store/15a9908 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Coordinates awaiting confirmation:** 13.265678504901885, 77.56030392613965 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Komb/store/15a9908. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Recommended initial verification_status:** unverified

### Row 283: Krishnappa military Hotel

- **Confidence:** medium
- **Input:** address: Tank Rd, Tubgere Pete, Doddaballapura, Karnataka 561203, Doddaballapur, Bangalore, Bangalore · locality: Doddaballapur · city: Bangalore · coords: 13.2896662, 77.5415046 · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Krishnappa-Military-Hotel/store/1a96ab2 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Coordinates awaiting confirmation:** 13.2896662, 77.5415046 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Krishnappa-Military-Hotel/store/1a96ab2. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Recommended initial verification_status:** unverified

### Row 284: Krs New Grand Hotel

- **Confidence:** medium
- **Input:** address: Bgs Nagar, Chapparakallu, Devanalli To Doddaballapura Highway, Doddaballapur, Bangalore, Bangalore · locality: Doddaballapur · city: Bangalore · phone: +919611223826 · coords: 13.279224, 77.6248938 · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Krs-New-Grand-Hotel/store/511b46 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Coordinates awaiting confirmation:** 13.279224, 77.6248938 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Krs-New-Grand-Hotel/store/511b46. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Recommended initial verification_status:** unverified

### Row 286: Malenadasiri

- **Confidence:** medium
- **Input:** address: Malenadasiri Home Products Gurram International Hotel Side Road, Near Railway Station, Doddaballapur, Bangalore, Bangalore · locality: Doddaballapur · city: Bangalore · phone: +919900705287 · coords: 13.2808792, 77.5504708 · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Malenadasiri/store/147165c · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Coordinates awaiting confirmation:** 13.2808792, 77.5504708 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Malenadasiri/store/147165c. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Recommended initial verification_status:** unverified

### Row 287: Maltose Marriage Village

- **Confidence:** medium
- **Input:** address: No 99/1, Hanabe Post, Madeshwara Village, Doddaballapur, Bangalore-561203, Karnataka, Doddaballapur, Bangalore, Bangalore · locality: Doddaballapur · city: Bangalore · phone: +919980544666 · coords: 13.29840556, 77.53911389 · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Maltose-Marriage-Village/store/17cc208 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Coordinates awaiting confirmation:** 13.29840556, 77.53911389 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Maltose-Marriage-Village/store/17cc208. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Recommended initial verification_status:** unverified

### Row 289: MANJU CHICKEN CENTER

- **Confidence:** medium
- **Input:** address: 832, 1st Cross, near Boys hostel, Bhuneshwarii Nagara, Bhuvaneswari Nagar, Doddaballapura, Karnataka 561203, Doddaballapur, Bangalore, Bangalore · locality: Doddaballapur · city: Bangalore · phone: +919886477773 · coords: 13.2861736, 77.5395837 · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Manju-Chicken-Center/store/198107b · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Coordinates awaiting confirmation:** 13.2861736, 77.5395837 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Manju-Chicken-Center/store/198107b. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Recommended initial verification_status:** unverified

### Row 298: One Snacks

- **Confidence:** medium
- **Input:** address: Ravi Wines Building, Jalappa Road Kodigehalli, Doddaballapura Locality, Doddaballapura, Doddaballapur, Bangalore, Bangalore · locality: Doddaballapur · city: Bangalore · phone: +917019041089 · coords: 13.30101234, 77.51970176 · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/One-Snacks/store/1572678 · cuisine: Momos, Juices, Shakes · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Coordinates awaiting confirmation:** 13.30101234, 77.51970176 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/One-Snacks/store/1572678. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Recommended initial verification_status:** unverified

### Row 299: Paavani Condiments

- **Confidence:** medium
- **Input:** address: 43, Taluk Office Rd, Doddaballapura, Karnataka 561203, Doddaballapur, Bangalore, Bangalore · locality: Doddaballapur · city: Bangalore · phone: +919945973937 · coords: 13.2967815, 77.5385309 · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Paavani-Condiments/store/4473a96 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Coordinates awaiting confirmation:** 13.2967815, 77.5385309 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Paavani-Condiments/store/4473a96. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Recommended initial verification_status:** unverified

### Row 302: Raghavendra Sweets

- **Confidence:** medium
- **Input:** address: 6, Doddaballapura, Karnataka 561203, Doddaballapur, Bangalore, Bangalore · locality: Doddaballapur · city: Bangalore · phone: +919241320200 · coords: 13.2826674, 77.5591844 · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Raghavendra-Sweets/store/a058c2 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Coordinates awaiting confirmation:** 13.2826674, 77.5591844 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Raghavendra-Sweets/store/a058c2. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Recommended initial verification_status:** unverified

### Row 305: Sathish chiken kabab centre

- **Confidence:** medium
- **Input:** address: 12, Market Rd, Doddaballapura, Karnataka 561203, Doddaballapur, Bangalore, Bangalore · locality: Doddaballapur · city: Bangalore · coords: 13.290821399999999, 77.5402758 · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Sathish-Chiken-Kabab-Centre/store/448043b · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Coordinates awaiting confirmation:** 13.290821399999999, 77.5402758 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Sathish-Chiken-Kabab-Centre/store/448043b. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Recommended initial verification_status:** unverified

### Row 308: Shree Srinivasa Tiffins

- **Confidence:** medium
- **Input:** address: Sh 9, Melinajuganahalli, Melinajuganahalli, Doddaballapur, Bangalore, Bangalore · locality: Doddaballapur · city: Bangalore · phone: +919900726686 · coords: 13.429128, 77.5142781 · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Shree-Srinivasa-Tiffins/store/5122c6 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Coordinates awaiting confirmation:** 13.429128, 77.5142781 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Shree-Srinivasa-Tiffins/store/5122c6. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Recommended initial verification_status:** unverified

### Row 312: Smoked Out BBQ

- **Confidence:** medium
- **Input:** address: New Bus Stand, Thaluk Panchayat Office, Opposite Junior College Road, Doddaballapura Locality, Doddaballapura, Doddaballapur, Bangalore, Bangalore · locality: Doddaballapur · city: Bangalore · phone: +918008025988 · coords: 13.300251, 77.538529 · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Smoked-Out-Bbq/store/1781419 · listing_rating: 3 · listing_reviews: 3 · checked_on: 2026-10-11 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). External listing rating 3/3 recorded with source URL + check date — NEVER a Foodie community value. · notes: Round-4 single-source lead (2026-10-11).
- **Coordinates awaiting confirmation:** 13.300251, 77.538529 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Smoked-Out-Bbq/store/1781419. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Recommended initial verification_status:** unverified

### Row 317: SRI VINAYAKA CATERING & TENT HOUSE

- **Confidence:** medium
- **Input:** address: No 175, Hungi Building, Opp Of Venkataramana Swamy Temple, Terinabeedi, Doddaballapur, Bangalore-561203, Karnataka, Doddaballapur, Bangalore, Bangalore · locality: Doddaballapur · city: Bangalore · phone: +919880225266 · coords: 13.2872649, 77.5412879 · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Sri-Vinayaka-Catering-and-Tent-House/store/17cc22b · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Coordinates awaiting confirmation:** 13.2872649, 77.5412879 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Sri-Vinayaka-Catering-and-Tent-House/store/17cc22b. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Recommended initial verification_status:** unverified

### Row 321: Udupi Nandikeshwara Upahara

- **Confidence:** medium
- **Input:** address: Terinabidhi, Doddaballapur, Bangalore, Bangalore · locality: Doddaballapur · city: Bangalore · phone: +919448795210 · coords: 13.2861733, 77.5375739 · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Udupi-Nandikeshwara-Upahara/store/931ca9 · cuisine: Fast Food · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Coordinates awaiting confirmation:** 13.2861733, 77.5375739 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Udupi-Nandikeshwara-Upahara/store/931ca9. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Recommended initial verification_status:** unverified

### Row 323: VINAYAKA CONDIMENTS

- **Confidence:** medium
- **Input:** address: 8G6V+R88, Nelamangala - Chikkaballapura, Doddaballapura, Pindakuru Thimmanahalli, Karnataka 561203, Doddaballapur, Bangalore, Bangalore · locality: Doddaballapur · city: Bangalore · coords: 13.3120367, 77.543341 · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Vinayaka-Condiments/store/1b08cb1 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Coordinates awaiting confirmation:** 13.3120367, 77.543341 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Vinayaka-Condiments/store/1b08cb1. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Recommended initial verification_status:** unverified

### Row 325: Oyster mushroom hotel, Soladevanahalli

- **Confidence:** medium
- **Input:** address: opp. keb, near Kumbarahalli_cross, Soladevanahalli, Bengaluru, Karnataka 560090, Hessarghatta Road, Bangalore, Bangalore · locality: Hessarghatta-Road · city: Bangalore · phone: +919483861120 · coords: 13.0905349, 77.49276069999999 · source: https://magicpin.in/Bangalore/Hessarghatta-Road/Restaurant/Oyster-Mushroom-Hotel,-Soladevanahalli/store/1979b2b · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Hessarghatta-Road' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Coordinates awaiting confirmation:** 13.0905349, 77.49276069999999 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Hessarghatta-Road/Restaurant/Oyster-Mushroom-Hotel,-Soladevanahalli/store/1979b2b. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Recommended initial verification_status:** unverified

### Row 326: Al LABBAIK RESTAURANT

- **Confidence:** medium
- **Input:** address: Soldevanahllli near Stanza living bigg tree road , Soladevanahalli, Bangalore, Bangalore · locality: Soladevanahalli · city: Bangalore · phone: +918105155980 · coords: 13.0847246, 77.4831032 · source: https://magicpin.in/Bangalore/Soladevanahalli/Restaurant/Al-Labbaik-Restaurant/store/1780376 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Soladevanahalli' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Coordinates awaiting confirmation:** 13.0847246, 77.4831032 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Soladevanahalli/Restaurant/Al-Labbaik-Restaurant/store/1780376. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Recommended initial verification_status:** unverified

### Row 327: Amn Kitchen

- **Confidence:** medium
- **Input:** address: 22, Ground Floor, Shivanapura Colony, Ravuthanahalli Main Road, Near RTO, Nelamangala Locality, Nelamangala, Soladevanahalli, Bangalore, Bangalore · locality: Soladevanahalli · city: Bangalore · phone: +918660077096 · coords: 13.0417725, 77.42727116 · source: https://magicpin.in/Bangalore/Soladevanahalli/Restaurant/Amn-Kitchen/store/16cb529 · cuisine: Fast Food, Biryani, Sandwich · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Soladevanahalli' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Coordinates awaiting confirmation:** 13.0417725, 77.42727116 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Soladevanahalli/Restaurant/Amn-Kitchen/store/16cb529. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Recommended initial verification_status:** unverified

### Row 329: Bhoomithra Resorts

- **Confidence:** medium
- **Input:** address: Doddakarenahalli, Soladevanahalli, Bangalore, Bangalore · locality: Soladevanahalli · city: Bangalore · phone: +918028602170 · coords: 13.052724, 77.355516 · source: https://magicpin.in/Bangalore/Soladevanahalli/Restaurant/Bhoomithra-Resorts/store/538a93 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Soladevanahalli' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Coordinates awaiting confirmation:** 13.052724, 77.355516 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Soladevanahalli/Restaurant/Bhoomithra-Resorts/store/538a93. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Recommended initial verification_status:** unverified

### Row 331: Brahmi Condiments JAYARAMA SHETTY

- **Confidence:** medium
- **Input:** address: Sondekoppa, Bengaluru, Karnataka 562130, Soladevanahalli, Bangalore, Bangalore · locality: Soladevanahalli · city: Bangalore · phone: +919110267719 · coords: 13.0184558, 77.3842963 · source: https://magicpin.in/Bangalore/Soladevanahalli/Restaurant/Brahmi-Condiments-Jayarama-Shetty/store/4476533 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Soladevanahalli' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Coordinates awaiting confirmation:** 13.0184558, 77.3842963 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Soladevanahalli/Restaurant/Brahmi-Condiments-Jayarama-Shetty/store/4476533. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Recommended initial verification_status:** unverified

### Row 332: Bismillah Hotel

- **Confidence:** medium
- **Input:** address: Hunnigere, Soladevanahalli, Bangalore, Bangalore · locality: Soladevanahalli · city: Bangalore · phone: +918123664454 · coords: 13.0272966, 77.3855535 · source: https://magicpin.in/Bangalore/Soladevanahalli/Restaurant/Bismillah-Hotel/store/1329322 · cuisine: Biryani, North Indian, Kebab, Chinese · listing_rating: 3.5 · listing_reviews: 169 · checked_on: 2026-10-11 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Soladevanahalli' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). External listing rating 3.5/169 recorded with source URL + check date — NEVER a Foodie community value. · notes: Round-4 single-source lead (2026-10-11).
- **Coordinates awaiting confirmation:** 13.0272966, 77.3855535 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Soladevanahalli/Restaurant/Bismillah-Hotel/store/1329322. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Recommended initial verification_status:** unverified

### Row 333: FOOD FACTORY

- **Confidence:** medium
- **Input:** address: Sri Manjunatha pg soladevanali Near acharya institute of technology , Soladevanahalli, Bangalore, Bangalore · locality: Soladevanahalli · city: Bangalore · phone: +917899265757 · coords: 13.0837321, 77.4844784 · source: https://magicpin.in/Bangalore/Soladevanahalli/Restaurant/Food-Factory/store/2088543 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Soladevanahalli' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Coordinates awaiting confirmation:** 13.0837321, 77.4844784 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Soladevanahalli/Restaurant/Food-Factory/store/2088543. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Recommended initial verification_status:** unverified

### Row 334: Kuttus Cafe

- **Confidence:** medium
- **Input:** address: No.39, Acharya College Road, Soladevanahalli, Bangalore-562130, Karnataka, Soladevanahalli, Bangalore, Bangalore · locality: Soladevanahalli · city: Bangalore · phone: +918139077741 · coords: 13.009109, 77.350382 · source: https://magicpin.in/Bangalore/Soladevanahalli/Restaurant/Kuttus-Cafe/store/18740c0 · cuisine: Good Place for Kids, Coffee, Fast Food, Desserts · listing_rating: 4.4 · listing_reviews: 25 · checked_on: 2026-10-11 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Soladevanahalli' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). External listing rating 4.4/25 recorded with source URL + check date — NEVER a Foodie community value. · notes: Round-4 single-source lead (2026-10-11).
- **Coordinates awaiting confirmation:** 13.009109, 77.350382 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Soladevanahalli/Restaurant/Kuttus-Cafe/store/18740c0. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Recommended initial verification_status:** unverified

### Row 336: Madeena chicken center

- **Confidence:** medium
- **Input:** address: 29JQ+QGH, Nelamangala Rd, Bengaluru, Hunnigere, Karnataka 562130, Soladevanahalli, Bangalore, Bangalore · locality: Soladevanahalli · city: Bangalore · phone: +917022305372 · coords: 13.032826799999999, 77.38893449999999 · source: https://magicpin.in/Bangalore/Soladevanahalli/Restaurant/Madeena-Chicken-Center/store/19774b8 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Soladevanahalli' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Coordinates awaiting confirmation:** 13.032826799999999, 77.38893449999999 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Soladevanahalli/Restaurant/Madeena-Chicken-Center/store/19774b8. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Recommended initial verification_status:** unverified

### Row 338: Padmashree Juice And Condiments.Tea Time.

- **Confidence:** medium
- **Input:** address: 150, Nelamangala Rd, Anjana Nagar, Bengaluru, Karnataka 562130, Soladevanahalli, Bangalore, Bangalore · locality: Soladevanahalli · city: Bangalore · coords: 13.0392066, 77.3910793 · source: https://magicpin.in/Bangalore/Soladevanahalli/Restaurant/Padmashree-Juice-And-Condiments.tea-Time./store/1b14711 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Soladevanahalli' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Coordinates awaiting confirmation:** 13.0392066, 77.3910793 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Soladevanahalli/Restaurant/Padmashree-Juice-And-Condiments.tea-Time./store/1b14711. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Recommended initial verification_status:** unverified

### Row 346: Shree Rathnam

- **Confidence:** medium
- **Input:** address: 16/3, 16/4, Billinakote Post, Sompura, Hobli Nelmangala Taluk, Peenya, Soladevanahalli, Bangalore, Bangalore · locality: Soladevanahalli · city: Bangalore · phone: +918296966902 · coords: 13.043387, 77.350459 · source: https://magicpin.in/Bangalore/Soladevanahalli/Restaurant/Shree-Rathnam/store/39652a · cuisine: North Indian · listing_rating: 3.7 · listing_reviews: 2 · checked_on: 2026-10-11 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Soladevanahalli' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). External listing rating 3.7/2 recorded with source URL + check date — NEVER a Foodie community value. · notes: Round-4 single-source lead (2026-10-11).
- **Coordinates awaiting confirmation:** 13.043387, 77.350459 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Soladevanahalli/Restaurant/Shree-Rathnam/store/39652a. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Recommended initial verification_status:** unverified

### Row 350: 11:11 Cafe (pg street)

- **Confidence:** medium
- **Input:** address: 5GFJ+HX9, Dibbur, Chokkanahalli, Karnataka 560119, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · coords: 13.17377, 77.5329467 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/11:11-Cafe-(Pg-Street)/store/1b23ac1 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Coordinates awaiting confirmation:** 13.17377, 77.5329467 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/11:11-Cafe-(Pg-Street)/store/1b23ac1. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Recommended initial verification_status:** unverified

### Row 356: Angsana Oasis Spa & Resort

- **Confidence:** medium
- **Input:** address: Northwest County, Doddaballapur Road, Adde Vishwanathapura, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · phone: +919845211036 · coords: 13.182591, 77.559762 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Angsana-Oasis-Spa-and-Resort/store/442bc6 · cuisine: North Indian, South Indian, Chinese · listing_rating: 4.5 · listing_reviews: 6 · checked_on: 2026-10-11 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). External listing rating 4.5/6 recorded with source URL + check date — NEVER a Foodie community value. Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Coordinates awaiting confirmation:** 13.182591, 77.559762 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Angsana-Oasis-Spa-and-Resort/store/442bc6. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Recommended initial verification_status:** unverified

### Row 357: Arena 53 Cafe

- **Confidence:** medium
- **Input:** address: Survey 53, Honnenahalli, Doddaballapur Road, Near Orchids The International School, Yelahanka, Bangalore, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · phone: +917022565353 · coords: 13.1560959907, 77.5592022569 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Arena-53-Cafe/store/179b313 · listing_rating: 4.1 · listing_reviews: 97 · checked_on: 2026-10-11 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). External listing rating 4.1/97 recorded with source URL + check date — NEVER a Foodie community value. · notes: Round-4 single-source lead (2026-10-11).
- **Coordinates awaiting confirmation:** 13.1560959907, 77.5592022569 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Arena-53-Cafe/store/179b313. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Recommended initial verification_status:** unverified

### Row 370: Bonker's Hub

- **Confidence:** medium
- **Input:** address: 19, 2nd Cross, PG Street, Shanubhoganalli, Rajankunte, 1st Main Road, Yelahanka, Bangalore, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · phone: +918951341723 · coords: 13.1854754289, 77.5306220958 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Bonkers-Hub/store/1765603 · listing_rating: 3.7 · listing_reviews: 103 · checked_on: 2026-10-11 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). External listing rating 3.7/103 recorded with source URL + check date — NEVER a Foodie community value. · notes: Round-4 single-source lead (2026-10-11).
- **Coordinates awaiting confirmation:** 13.1854754289, 77.5306220958 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Bonkers-Hub/store/1765603. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Recommended initial verification_status:** unverified

### Row 380: Chikpete Donne Biriyani - Avalahalli

- **Confidence:** medium
- **Input:** address: Kattigenahalli, 49/3 Besides to Manikanta Wines, Avalahalli, Rajanukunte Road, Doddaballapur Main Rd, Bengaluru, Karnataka 560064, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · phone: +918050450124 · coords: 13.135784, 77.569248 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Chikpete-Donne-Biriyani-Avalahalli/store/1703156 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Coordinates awaiting confirmation:** 13.135784, 77.569248 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Chikpete-Donne-Biriyani-Avalahalli/store/1703156. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Recommended initial verification_status:** unverified

### Row 393: Fresh choice 2 floor P block hit refresh

- **Confidence:** medium
- **Input:** address: 5G9M+5GM, Dibbur, Karnataka 560119, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · coords: 13.1679595, 77.53379149999999 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Fresh-Choice-2-Floor-P-Block-Hit-Refresh/store/1acb5c3 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Coordinates awaiting confirmation:** 13.1679595, 77.53379149999999 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Fresh-Choice-2-Floor-P-Block-Hit-Refresh/store/1acb5c3. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Recommended initial verification_status:** unverified

### Row 395: Grasa Community & Courtyard

- **Confidence:** medium
- **Input:** address: 22, /1 & 8, Doddaballapur Main Road, Yelahanka, Bangalore, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · phone: +918546899099 · coords: 13.16441404, 77.56522568 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Grasa-Community-and-Courtyard/store/1666317 · cuisine: North Indian, Pasta, Kebab, Chinese, Fast Food, Italian, Salad, Desserts · listing_rating: 4.6 · listing_reviews: 6 · checked_on: 2026-10-11 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). External listing rating 4.6/6 recorded with source URL + check date — NEVER a Foodie community value. · notes: Round-4 single-source lead (2026-10-11).
- **Coordinates awaiting confirmation:** 13.16441404, 77.56522568 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Grasa-Community-and-Courtyard/store/1666317. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Recommended initial verification_status:** unverified

### Row 399: Hotel Durga Sagar

- **Confidence:** medium
- **Input:** address: Sadenahalli, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · phone: +918548983416 · coords: 13.1977387, 77.5624131 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Hotel-Durga-Sagar/store/5142cc · cuisine: South Indian · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Coordinates awaiting confirmation:** 13.1977387, 77.5624131 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Hotel-Durga-Sagar/store/5142cc. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Recommended initial verification_status:** unverified

### Row 406: Jashika Food Products

- **Confidence:** medium
- **Input:** address: Shanubhoganahalli Raksha Enclave, kakolu village, opposite to HP Petrol bunk, 560089, Singapura Layout, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · phone: +919980733672 · coords: 13.18086177, 77.51916868 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Jashika-Food-Products/store/1775c98 · cuisine: South Indian · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Coordinates awaiting confirmation:** 13.18086177, 77.51916868 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Jashika-Food-Products/store/1775c98. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Recommended initial verification_status:** unverified

### Row 418: Kusuma Andhra Ruchulu

- **Confidence:** medium
- **Input:** address: 34/35, 2nd Floor, Aprameya Complex, Honnenahalli, Sri Rama Road, Near Orchids International School, Yelahanka, Bangalore, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · coords: 13.1562580065, 77.5608985754 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Kusuma-Andhra-Ruchulu/store/1784981 · listing_rating: 4.2 · listing_reviews: 49 · checked_on: 2026-10-11 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). External listing rating 4.2/49 recorded with source URL + check date — NEVER a Foodie community value. · notes: Round-4 single-source lead (2026-10-11).
- **Coordinates awaiting confirmation:** 13.1562580065, 77.5608985754 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Kusuma-Andhra-Ruchulu/store/1784981. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Recommended initial verification_status:** unverified

### Row 435: Naga Kaaba Center

- **Confidence:** medium
- **Input:** address: 80, Yelahanka, Bengaluru, Karnataka 560064, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · phone: +918105881991 · coords: 13.1490952, 77.55394 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Naga-Kaaba-Center/store/9656c1 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Coordinates awaiting confirmation:** 13.1490952, 77.55394 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Naga-Kaaba-Center/store/9656c1. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Recommended initial verification_status:** unverified

### Row 453: Number 1 Burger

- **Confidence:** medium
- **Input:** address: Survey 6/1, Ground Floor, Shri Anand Plaza, Rajanukunte, Singanayakanahalli Village, Doddaballapura Main Road, Yelahanka, Bangalore, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · phone: +919986180519 · coords: 13.1502035, 77.56943695 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Number-1-Burger/store/1759549 · cuisine: Burger, Fast Food · listing_rating: 4 · listing_reviews: 286 · checked_on: 2026-10-11 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). External listing rating 4/286 recorded with source URL + check date — NEVER a Foodie community value. Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Coordinates awaiting confirmation:** 13.1502035, 77.56943695 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Number-1-Burger/store/1759549. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Recommended initial verification_status:** unverified

### Row 455: On Time Nisarga Kitchen

- **Confidence:** medium
- **Input:** address: Addiganahalli, Yelahanka, Bangalore, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · phone: +917829425242 · coords: 13.18450792, 77.56899389 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/On-Time-Nisarga-Kitchen/store/16b9652 · cuisine: Chinese, Sandwich, Rolls, Fast Food, Street Food · listing_rating: 4 · listing_reviews: 4 · checked_on: 2026-10-11 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). External listing rating 4/4 recorded with source URL + check date — NEVER a Foodie community value. Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Coordinates awaiting confirmation:** 13.18450792, 77.56899389 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/On-Time-Nisarga-Kitchen/store/16b9652. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Recommended initial verification_status:** unverified

### Row 466: Rajkutty Home Foods

- **Confidence:** medium
- **Input:** address: 40, Burgundy Orchards, Phase 4, Shanuboganahalli, Hesaraghatta, Bangalore, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · phone: +919535263039 · coords: 13.174867, 77.5280657 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Rajkutty-Home-Foods/store/176284c · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Coordinates awaiting confirmation:** 13.174867, 77.5280657 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Rajkutty-Home-Foods/store/176284c. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Recommended initial verification_status:** unverified

### Row 468: Rich Cream Ice Cream Parlour

- **Confidence:** medium
- **Input:** address: default, default  , Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · phone: +919900508865 · coords: 13.196292, 77.571365 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Rich-Cream-Ice-Cream-Parlour/store/16a7434 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Coordinates awaiting confirmation:** 13.196292, 77.571365 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Rich-Cream-Ice-Cream-Parlour/store/16a7434. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Recommended initial verification_status:** unverified

### Row 473: Royal fresh chicken

- **Confidence:** medium
- **Input:** address: 5HG9+6QF, Thimmasandra, Rajanukunte, Karnataka 560119, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · coords: 13.1755591, 77.56944469999999 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Royal-Fresh-Chicken/store/1b1c907 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Coordinates awaiting confirmation:** 13.1755591, 77.56944469999999 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Royal-Fresh-Chicken/store/1b1c907. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Recommended initial verification_status:** unverified

### Row 476: s k Cafe mother hood hospital

- **Confidence:** medium
- **Input:** address: motherhood hospital, Bengaluru, Madappanahalli, Karnataka 560001, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · phone: +917019334266 · coords: 13.1568086, 77.54395079999999 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/S-K-Cafe-Mother-Hood-Hospital/store/2665b49 · cuisine: 50 % Discunt on First Pediatric Consultations, 5000 Discount on your birthing package, Periodontology, Paediatric Surgery, Diabetology, Neurology, Surgical Oncology, Family Medicine, Dietetics, Opthalmology · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Coordinates awaiting confirmation:** 13.1568086, 77.54395079999999 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/S-K-Cafe-Mother-Hood-Hospital/store/2665b49. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Recommended initial verification_status:** unverified

### Row 479: Salt & Sage

- **Confidence:** medium
- **Input:** address: 2, Ground Floor, Madappanahalli, Yelahanka, Bangalore, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · phone: +919620777741 · coords: 13.1529131, 77.54048735 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Salt-and-Sage/store/16b6b11 · cuisine: Biryani · listing_rating: 3.7 · listing_reviews: 12 · checked_on: 2026-10-11 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). External listing rating 3.7/12 recorded with source URL + check date — NEVER a Foodie community value. · notes: Round-4 single-source lead (2026-10-11).
- **Coordinates awaiting confirmation:** 13.1529131, 77.54048735 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Salt-and-Sage/store/16b6b11. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Recommended initial verification_status:** unverified

### Row 481: Sai Surabhi Cool Drinks

- **Confidence:** medium
- **Input:** address: No.347,B.T.S Depot,7Th Main, Subbanna Garden, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · phone: +918050130871 · coords: 13.1849838, 77.575341 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Sai-Surabhi-Cool-Drinks/store/92b9c2 · cuisine: Villa · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Coordinates awaiting confirmation:** 13.1849838, 77.575341 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Sai-Surabhi-Cool-Drinks/store/92b9c2. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Recommended initial verification_status:** unverified

### Row 486: Silver Oak Resort

- **Confidence:** medium
- **Input:** address: Doddaballapur Road, Near Rajanukunte, Yelahanka, Bangalore, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · phone: +919902913070 · coords: 13.1847953, 77.5606807 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Silver-Oak-Resort/store/170a595 · cuisine: North Indian, Chinese, South Indian · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Coordinates awaiting confirmation:** 13.1847953, 77.5606807 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Silver-Oak-Resort/store/170a595. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Recommended initial verification_status:** unverified

### Row 490: SLV Chicken Centre, Wholesale and Retail

- **Confidence:** medium
- **Input:** address: RTO Road, Aishwarya Layout, Rajanukunte, Bengaluru, Karnataka 560119, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · coords: 13.1673791, 77.56205659999999 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Slv-Chicken-Centre,-Wholesale-And-Retail/store/1b30c58 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Coordinates awaiting confirmation:** 13.1673791, 77.56205659999999 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Slv-Chicken-Centre,-Wholesale-And-Retail/store/1b30c58. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Recommended initial verification_status:** unverified

### Row 491: Sodexo

- **Confidence:** medium
- **Input:** address: Ittagallpura, Rajanukunte, Karnataka 560119, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · coords: 13.1684276, 77.53610259999999 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Sodexo/store/1acc309 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Coordinates awaiting confirmation:** 13.1684276, 77.53610259999999 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Sodexo/store/1acc309. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Recommended initial verification_status:** unverified

### Row 492: Sonis cafe

- **Confidence:** medium
- **Input:** address: default, default  , Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · phone: +919108052479 · coords: 13.187484, 77.543673 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Sonis-Cafe/store/16a53c9 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Coordinates awaiting confirmation:** 13.187484, 77.543673 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Sonis-Cafe/store/16a53c9. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Recommended initial verification_status:** unverified

### Row 518: Sugar Rush By Kamini

- **Confidence:** medium
- **Input:** address: 17, MV Sundridge, Adde Vishwanathapura Road, Yelahanka, Bangalore, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · phone: +919740852748 · coords: 13.1782, 77.56094 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Sugar-Rush-By-Kamini/store/1633562 · cuisine: Desserts, Bakery · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Coordinates awaiting confirmation:** 13.1782, 77.56094 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Sugar-Rush-By-Kamini/store/1633562. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Recommended initial verification_status:** unverified

### Row 521: Sushma's hut

- **Confidence:** medium
- **Input:** address: default, default  , Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · phone: +918904218210 · coords: 13.146444, 77.52044 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Sushmas-Hut/store/16a60c7 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Coordinates awaiting confirmation:** 13.146444, 77.52044 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Sushmas-Hut/store/16a60c7. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Recommended initial verification_status:** unverified

### Row 522: Suss Sis Gourmet Bakery & Cafe

- **Confidence:** medium
- **Input:** address: 833/23, Rajanukunte, Singanayakanahalli, Near National Public School, RTO Bypass Road, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · phone: +917019302460 · coords: 13.1432164, 77.5642494 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Suss-Sis-Gourmet-Bakery-and-Cafe/store/16b47a4 · cuisine: Bakery, Fast Food, Desserts, Tea · listing_rating: 4 · listing_reviews: 57 · checked_on: 2026-10-11 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). External listing rating 4/57 recorded with source URL + check date — NEVER a Foodie community value. Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Coordinates awaiting confirmation:** 13.1432164, 77.5642494 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Suss-Sis-Gourmet-Bakery-and-Cafe/store/16b47a4. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Recommended initial verification_status:** unverified

### Row 536: The Living Room

- **Confidence:** medium
- **Input:** address: 45/7, Residency Road, 1st Cross, International Airport, Bangalore, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · phone: +918040912024 · coords: 13.20007388, 77.58213943 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/The-Living-Room/store/612a6a · cuisine: North Indian, Chinese, Street Food · listing_rating: 4.9 · listing_reviews: 1 · checked_on: 2026-10-11 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). External listing rating 4.9/1 recorded with source URL + check date — NEVER a Foodie community value. · notes: Round-4 single-source lead (2026-10-11).
- **Coordinates awaiting confirmation:** 13.20007388, 77.58213943 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/The-Living-Room/store/612a6a. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Recommended initial verification_status:** unverified

### Row 539: Uttara Karnataka Jolada Rotti Kendra

- **Confidence:** medium
- **Input:** address: Addiganahalli, Doddaballapura Main Road, Yelahanka, Bangalore, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · phone: +919686237238 · coords: 13.17412917, 77.57001612 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Uttara-Karnataka-Jolada-Rotti-Kendra/store/1632c06 · cuisine: North Indian, South Indian · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Coordinates awaiting confirmation:** 13.17412917, 77.57001612 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Uttara-Karnataka-Jolada-Rotti-Kendra/store/1632c06. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Recommended initial verification_status:** unverified

### Row 550: White House cafe

- **Confidence:** medium
- **Input:** address: 5HR9+WQ5, Sadenahalli, Karnataka 560119, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · coords: 13.192274, 77.5694716 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/White-House-Cafe/store/1b05a64 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Coordinates awaiting confirmation:** 13.192274, 77.5694716 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/White-House-Cafe/store/1b05a64. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
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

## Possible duplicates / ambiguous — MANUAL REVIEW REQUIRED (403)

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
- **Intra-file duplicates:** rows 34, 63, 361, 362 — both entries stay separate; a human must decide.
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
- **Input:** address: Raghunathapur, Doddaballapura Locality, Doddaballapura · locality: Nagadenahalli/Moparahalli corridor · city: Doddaballapura · phone: +916366946331 · coords: 13.286726, 77.5824616 · source: https://www.district.in/dining/doddaballapura/lounge-de-la-r%C3%A9serve-2-doddaballapura-locality · cuisine: Continental, Asian, Mediterranean · listing_rating: 2.8 · listing_reviews: 1 · checked_on: 2026-10-11 · evidence: directory_reported · review_decision: distinct_new_business · uncertainty: RESOLVED round-4 (2026-10-11): the 'Bashettihalli' magicpin area label was a filing quirk — the magicpin listing shares the IDENTICAL phone +916366946331 and IDENTICAL pin 13.286726,77.5824616 with the district.in listing (both re-read 2026-10-11), so the two listings are the same business, not branches. Same-business evidence is cross-directory agreement (directory_reported); on-site GPS still the only path to verified. · notes: Round-3 systematic enumeration (2026-10-11): district.in dining sitemap (cdn.district.in/sitemap/sitemap-dining.xml, robots-declared) -> venue page fetched; JSON-LD captured verbatim. Second source: magicpin listing https://magicpin.in/Bangalore/Bashettihalli/Restaurant/Lounge-De-La-Réserve/store/163b85a (name match 1.0, area Bashettihalli) Prior phase-3H human review recommended do-not-import (out of zone); the district geo (13.2867,77.5824) is recorded for a future reviewer to re-decide. NOT imported this round — no silent reversal of the earlier review. | Round-4 corridor continuation (2026-10-11): magicpin store page re-fetched via robots-declared sitemap inventory; JSON-LD re-captured (rating 2.8/1, phone + pin identical to district). Promoted needs_more_research -> distinct_new_business on the phone+geo identity agreement.
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
- **Intra-file duplicates:** rows 9, 37, 437 — both entries stay separate; a human must decide.
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
- **Input:** address: Mukthambika, Opposite TMBL Bank, Kalamma Temple Road, Doddaballapura Locality, Doddaballapura · locality: Doddaballapura town (north edge) · city: Doddaballapura · phone: +919164460054 · coords: 13.2947637, 77.5399817 · source: https://www.district.in/dining/doddaballapura/the-monkey-house-1-doddaballapura-locality · cuisine: Street Food, North Indian · evidence: directory_reported · review_decision: needs_more_research · uncertainty: Round-4 correction (2026-10-11): the magicpin listing previously used as the rating source (Rajanukunte, pin 13.16979548,77.56744254, phone +918050190643) sits ~14 km from the district.in town pin 13.2947637,77.5399817 with a DIFFERENT phone — a DIFFERENT branch/business with the same name. The round-3 listing_rating 2.9/6 belonged to that other branch and has been CLEARED here (never kept under the wrong business). The Rajanukunte listing is recorded as its own single-source lead row in this worksheet. Town (district-sourced) row still needs a genuine second source. · notes: Round-3 systematic enumeration (2026-10-11): district.in dining sitemap (cdn.district.in/sitemap/sitemap-dining.xml, robots-declared) -> venue page fetched; JSON-LD captured verbatim. Second source: magicpin listing https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Monkey-House/store/1678319 (name match 1.0, area Rajanukunte) magicpin listing shows the Verified badge | Round-4 (2026-10-11): misattributed external rating cleared; branch-vs-branch documented.
- **Intra-file duplicates:** rows 8, 34, 64 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.2947637, 77.5399817 — evidence level: directory_reported · source: https://www.district.in/dining/doddaballapura/the-monkey-house-1-doddaballapura-locality. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 64: The Monkey house Lassi & More

- **Confidence:** medium
- **Input:** address: Provident Welworth City, Marasandra, Doddaballapura Locality, Doddaballapura · locality: Rajanukunte · city: Doddaballapura · phone: +917019646825 · coords: 13.2287819, 77.5496407 · source: https://www.district.in/dining/doddaballapura/the-monkey-house-lassi-more-doddaballapura-locality · cuisine: American, North Indian, Continental · evidence: directory_reported · review_decision: needs_more_research · uncertainty: single structured directory source (district.in) — needs one independent second source before import (web-search quota exhausted this round) · notes: Round-3 systematic enumeration (2026-10-11): district.in dining sitemap (cdn.district.in/sitemap/sitemap-dining.xml, robots-declared) -> venue page fetched; JSON-LD captured verbatim.
- **Intra-file duplicates:** rows 31, 48, 62, 63, 420 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.2287819, 77.5496407 — evidence level: directory_reported · source: https://www.district.in/dining/doddaballapura/the-monkey-house-lassi-more-doddaballapura-locality. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 66: Udupi Garden Hotel

- **Confidence:** medium
- **Input:** address: Near B H Road, Putani Complex, Bashettahalli, Doddaballapura Locality, Doddaballapura · locality: Doddaballapura outskirts (NH-44 south) · city: Doddaballapura · phone: +919980551506 · coords: 13.2647600134, 77.5528303289 · source: https://www.district.in/dining/doddaballapura/udupi-garden-hotel-doddaballapura-locality · evidence: directory_reported · review_decision: needs_more_research · uncertainty: Round-4 correction (2026-10-11): the magicpin listing previously used as the rating source (Rajanukunte, pin 13.1674354,77.5648277, phone +919980657073) sits ~11 km from the district.in pin 13.2647600,77.5528303 with a DIFFERENT phone — a DIFFERENT branch/business with the same name. The round-3 listing_rating 3.8/210 belonged to that other branch and has been CLEARED here. The Rajanukunte listing is recorded as its own single-source lead row in this worksheet. District-sourced row still needs a genuine second source. · notes: Round-3 systematic enumeration (2026-10-11): district.in dining sitemap (cdn.district.in/sitemap/sitemap-dining.xml, robots-declared) -> venue page fetched; JSON-LD captured verbatim. Second source: magicpin listing https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Udupi-Garden/store/177c0c9 (name match 1.0, area Rajanukunte) magicpin listing shows the Verified badge | Round-4 (2026-10-11): misattributed external rating cleared; branch-vs-branch documented.
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

### Row 128: Brahmalingeshwara Hotel

- **Confidence:** medium
- **Input:** address: 7H73+8FG, Bashettihalli, Karnataka 562163, Bashettihalli, Bangalore, Bangalore · locality: Bashettihalli · city: Bangalore · coords: 13.2632836, 77.5536407 · source: https://magicpin.in/Bangalore/Bashettihalli/Restaurant/Brahmalingeshwara-Hotel/store/1b19452 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Bashettihalli' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 135, 138 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.2632836, 77.5536407 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Bashettihalli/Restaurant/Brahmalingeshwara-Hotel/store/1b19452. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 131: HJ biriyani house

- **Confidence:** medium
- **Input:** address: HJ biriyani house, Kasaba Hobli Doddaballapur, Bashettihalli, Bangalore, Bangalore · locality: Bashettihalli · city: Bangalore · coords: 13.2744378, 77.55219459999999 · source: https://magicpin.in/Bangalore/Bashettihalli/Restaurant/Hj-Biriyani-House/store/1848494 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Bashettihalli' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 263, 369 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.2744378, 77.55219459999999 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Bashettihalli/Restaurant/Hj-Biriyani-House/store/1848494. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 132: Hotel Divyabavani

- **Confidence:** medium
- **Input:** address: 7Hh4+9F4, Near Sbi Bank, Scout Camp Road, Bashettihalli, Bangalore, Bangalore · locality: Bashettihalli · city: Bangalore · phone: +919620335626 · coords: 13.278393, 77.5561961 · source: https://magicpin.in/Bangalore/Bashettihalli/Restaurant/Hotel-Divyabavani/store/a2b502 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Bashettihalli' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 301 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.278393, 77.5561961 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Bashettihalli/Restaurant/Hotel-Divyabavani/store/a2b502. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 133: Hotel Shivakrupa

- **Confidence:** medium
- **Input:** address: 7H53+585, Bashettihalli, Karnataka 562163, Bashettihalli, Bangalore, Bangalore · locality: Bashettihalli · city: Bangalore · phone: +919591091198 · coords: 13.257886899999999, 77.5533688 · source: https://magicpin.in/Bangalore/Bashettihalli/Restaurant/Hotel-Shivakrupa/store/4251c28 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Bashettihalli' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 142 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.257886899999999, 77.5533688 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Bashettihalli/Restaurant/Hotel-Shivakrupa/store/4251c28. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 135: Jnanav Food Court

- **Confidence:** medium
- **Input:** address: Panchayat Road, Near Anjaneya Temple, Doddaballapura Locality, Doddaballapura, Bashettihalli, Bangalore, Bangalore · locality: Bashettihalli · city: Bangalore · phone: +916364429198 · coords: 13.2621818234, 77.55420984 · source: https://magicpin.in/Bangalore/Bashettihalli/Restaurant/Jnanav-Food-Court/store/24812cc · listing_rating: 3.8 · listing_reviews: 17 · checked_on: 2026-10-11 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Bashettihalli' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). External listing rating 3.8/17 recorded with source URL + check date — NEVER a Foodie community value. Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 128, 136, 138 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.2621818234, 77.55420984 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Bashettihalli/Restaurant/Jnanav-Food-Court/store/24812cc. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 136: Kanti Sweets Horamavu

- **Confidence:** medium
- **Input:** address: 7H63+8JC, Bashettihalli, Bashettihalli, Bangalore, Bangalore · locality: Bashettihalli · city: Bangalore · phone: +918043003656 · coords: 13.26131861308676, 77.55385110146638 · source: https://magicpin.in/Bangalore/Bashettihalli/Restaurant/Kanti-Sweets-Horamavu/store/155b4c1 · cuisine: Fast Food · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Bashettihalli' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 135 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.26131861308676, 77.55385110146638 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Bashettihalli/Restaurant/Kanti-Sweets-Horamavu/store/155b4c1. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 138: MANOj K C

- **Confidence:** medium
- **Input:** address: Shop No 05 Bhasthali Vinak Nagar Road, Karnataka 562163, Bashettihalli, Bangalore, Bangalore · locality: Bashettihalli · city: Bangalore · phone: +918073308560 · coords: 13.2630771, 77.5540426 · source: https://magicpin.in/Bangalore/Bashettihalli/Restaurant/Manoj-K-C/store/1976004 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Bashettihalli' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 128, 135 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.2630771, 77.5540426 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Bashettihalli/Restaurant/Manoj-K-C/store/1976004. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 141: Sunil general store and condiment

- **Confidence:** medium
- **Input:** address: 7HQG+CRQ, NH648, Raghunathapur, Karnataka 562163, Bashettihalli, Bangalore, Bangalore · locality: Bashettihalli · city: Bangalore · coords: 13.288587, 77.5771089 · source: https://magicpin.in/Bangalore/Bashettihalli/Restaurant/Sunil-General-Store-And-Condiment/store/1b0982b · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Bashettihalli' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 303 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.288587, 77.5771089 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Bashettihalli/Restaurant/Sunil-General-Store-And-Condiment/store/1b0982b. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 142: Super Chai CLUB

- **Confidence:** medium
- **Input:** address: 7H53+39Q, Doddaballapura, Bashettihalli, Karnataka 562163, Bashettihalli, Bangalore, Bangalore · locality: Bashettihalli · city: Bangalore · coords: 13.257717, 77.55349199999999 · source: https://magicpin.in/Bangalore/Bashettihalli/Restaurant/Super-Chai-Club/store/4474011 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Bashettihalli' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 133 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.257717, 77.55349199999999 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Bashettihalli/Restaurant/Super-Chai-Club/store/4474011. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 144: Udupi Krishna Dhama

- **Confidence:** medium
- **Input:** address: 7HC2+QXV, Arehalli Guddadahalli, Karnataka 562163, Bashettihalli, Bangalore, Bangalore · locality: Bashettihalli · city: Bangalore · phone: +919663379568 · coords: 13.272257, 77.552384 · source: https://magicpin.in/Bangalore/Bashettihalli/Restaurant/Udupi-Krishna-Dhama/store/1906789 · cuisine: Indian restaurant · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Bashettihalli' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 263, 320 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.272257, 77.552384 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Bashettihalli/Restaurant/Udupi-Krishna-Dhama/store/1906789. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 145: A2B - Adyar Ananda Bhavan

- **Confidence:** medium
- **Input:** address: BB Road, Near Rani Circle, Shop No. 975, 119/2, Doddaballapur Road, Bangalore, Bangalore · locality: Doddaballapur-Road · city: Bangalore · phone: +917904077074 · coords: 13.26404, 77.718243 · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/A2b-Adyar-Ananda-Bhavan/store/170243a · listing_rating: 4.2 · listing_reviews: 2 · checked_on: 2026-10-11 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur-Road' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). External listing rating 4.2/2 recorded with source URL + check date — NEVER a Foodie community value. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 159, 163, 164, 166, 169, 170, 171, 172, 173, 175, 176, 178, 192, 222, 228, 229, 238, 239, 240 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.26404, 77.718243 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/A2b-Adyar-Ananda-Bhavan/store/170243a. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 146: Aaradhya Grand

- **Confidence:** medium
- **Input:** address: 3rd Division, BB Road, Near Rani Circle, Devanahalli, Bangalore, Doddaballapur Road, Bangalore, Bangalore · locality: Doddaballapur-Road · city: Bangalore · phone: +919187201066 · coords: 13.263593, 77.7168845 · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Aaradhya-Grand/store/22594bb · listing_rating: 4 · listing_reviews: 26 · checked_on: 2026-10-11 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur-Road' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). External listing rating 4/26 recorded with source URL + check date — NEVER a Foodie community value. · notes: Round-4 single-source lead (2026-10-11).
- **Matches to existing records:**
  - `60cc569b` **Sri Ganesh Grand** · locality: Bashettihalli — similarity 0.571 (name-ambiguous-proper-token) · distance: 17.836 km · existing coords: 13.2679055, 77.5521405 — confidence low
  - `987dad98` **Shri Manjunatha Grand Veg** · locality: Doddaballapura Railway Station — similarity 0.45 (name-ambiguous-proper-token) · existing coords: NULL — confidence low
- **Intra-file duplicates:** rows 169, 170, 171, 172, 173, 178, 192, 220, 238, 240 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.263593, 77.7168845 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Aaradhya-Grand/store/22594bb. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `LOCALITY_CONFLICT`, `LOCALITY_CONFLICT`, `EXISTING_COORDINATES_DIFFER`, `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 147: Amaravathi Gardenia Andhra Style Multi Cuisine Nonveg Restau

- **Confidence:** medium
- **Input:** address: Hyderabad - Bangalore Hwy, opp. Laxmi Venkateshwara Kalyana Mandapa, Devanahalli, Southegowdanahalli, Karnataka 562110, Doddaballapur Road, Bangalore, Bangalore · locality: Doddaballapur-Road · city: Bangalore · coords: 13.2576758, 77.713668 · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Amaravathi-Gardenia-Andhra-Style-Multi-Cuisine-Nonveg-Restau/store/18502c3 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur-Road' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 148, 161, 180, 206, 213, 215 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.2576758, 77.713668 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Amaravathi-Gardenia-Andhra-Style-Multi-Cuisine-Nonveg-Restau/store/18502c3. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 148: Amaravathi Gardenia Andhra Style Multi Cuisine Nonveg Restaurant

- **Confidence:** medium
- **Input:** address: Hyderabad - Bangalore Hwy, opp. Laxmi Venkateshwara Kalyana Mandapa, Devanahalli, Southegowdanahalli, Karnataka 562110, Doddaballapur Road, Bangalore, Bangalore · locality: Doddaballapur-Road · city: Bangalore · phone: +919663332042 · coords: 13.2576758, 77.713668 · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Amaravathi-Gardenia-Andhra-Style-Multi-Cuisine-Nonveg-Restaurant/store/1981440 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur-Road' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 147, 161, 180, 206, 213, 215 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.2576758, 77.713668 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Amaravathi-Gardenia-Andhra-Style-Multi-Cuisine-Nonveg-Restaurant/store/1981440. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 149: Anjinappa Military Hotel

- **Confidence:** medium
- **Input:** address: Near Indian Oil Petrol Pump, Devanahalli, Bangalore, Doddaballapur Road, Bangalore, Bangalore · locality: Doddaballapur-Road · city: Bangalore · phone: +918618448772 · coords: 13.2561753, 77.7099846 · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Anjinappa-Military-Hotel/store/1791427 · listing_rating: 4.2 · listing_reviews: 57 · checked_on: 2026-10-11 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur-Road' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). External listing rating 4.2/57 recorded with source URL + check date — NEVER a Foodie community value. Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 167, 211, 244 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.2561753, 77.7099846 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Anjinappa-Military-Hotel/store/1791427. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 150: Ayodhya Bela

- **Confidence:** medium
- **Input:** address: Ground and 1st Floor, Kanakadasa Circle, 44/2, Hyderabad - Bengaluru Hwy, near Empire Restaurant, Devanahalli, Bengaluru, Devanahalli, Karnataka 562110, Doddaballapur Road, Bangalore, Bangalore · locality: Doddaballapur-Road · city: Bangalore · coords: 13.257391499999999, 77.71206939999999 · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Ayodhya-Bela/store/443c3c5 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur-Road' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 180, 213, 248 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.257391499999999, 77.71206939999999 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Ayodhya-Bela/store/443c3c5. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 153: Belgian Waffle Factory

- **Confidence:** medium
- **Input:** address: No, 142/2, Ground Floor, International Airport Road, next to Apoorva multi cuisine restaurant, opposite to Jain temple, Southegowdanahalli, Binnamangala, Karnataka 562110, Doddaballapur Road, Bangalore, Bangalore · locality: Doddaballapur-Road · city: Bangalore · phone: +919880015217 · coords: 13.261664, 77.7168631 · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Belgian-Waffle-Factory/store/1a54136 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur-Road' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 187, 188, 190, 207, 214, 220 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.261664, 77.7168631 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Belgian-Waffle-Factory/store/1a54136. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 154: Bhukthi Food Place

- **Confidence:** medium
- **Input:** address: Bhukthi Food Place, Kurubarakunte, Kurubarakunte, Doddaballapur Road, Bangalore, Bangalore · locality: Doddaballapur-Road · city: Bangalore · coords: 13.2784475, 77.7212777 · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Bhukthi-Food-Place/store/543376 · cuisine: Chinese, North Indian, Andhra, Kebab, Sichuan · listing_rating: 4.6 · listing_reviews: 3 · checked_on: 2026-10-11 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur-Road' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). External listing rating 4.6/3 recorded with source URL + check date — NEVER a Foodie community value. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 155 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.2784475, 77.7212777 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Bhukthi-Food-Place/store/543376. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 155: Bhukti Family Restaurant

- **Confidence:** medium
- **Input:** address: 33, Abbachikkanahalli, Nh7, Bb Road, Near Sai Baba Temple, Devanhalli, Doddaballapur Road, Bangalore, Bangalore · locality: Doddaballapur-Road · city: Bangalore · phone: +918197246801 · coords: 13.2780896, 77.7213829 · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Bhukti-Family-Restaurant/store/82433 · cuisine: Andhra, Chinese, North Indian, Biryani, Street Food · listing_rating: 3.9 · listing_reviews: 116 · checked_on: 2026-10-11 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur-Road' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). External listing rating 3.9/116 recorded with source URL + check date — NEVER a Foodie community value. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 154 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.2780896, 77.7213829 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Bhukti-Family-Restaurant/store/82433. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 156: Café Coffee Day

- **Confidence:** medium
- **Input:** address: HPCL Devanahalli, Bengaluru, Kurubarakunte, Karnataka 562164, Doddaballapur Road, Bangalore, Bangalore · locality: Doddaballapur-Road · city: Bangalore · phone: +918001025093 · coords: 13.281977999999999, 77.72233949999999 · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Café-Coffee-Day/store/1975710 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur-Road' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 189, 194, 230, 372 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.281977999999999, 77.72233949999999 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Caf%C3%A9-Coffee-Day/store/1975710. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 157: Chaatimes

- **Confidence:** medium
- **Input:** address: 29/5, Hoysala Corpus, Bb Road, International Airport, Bangalore, Doddaballapur Road, Bangalore, Bangalore · locality: Doddaballapur-Road · city: Bangalore · phone: +919513551338 · coords: 13.2684048, 77.71955492 · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Chaatimes/store/16a2842 · cuisine: Street Food, Fast Food · listing_rating: 3.6 · listing_reviews: 95 · checked_on: 2026-10-11 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur-Road' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). External listing rating 3.6/95 recorded with source URL + check date — NEVER a Foodie community value. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 162, 165, 177, 185, 186, 218, 221, 225, 226, 241 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.2684048, 77.71955492 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Chaatimes/store/16a2842. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 158: Chai Memories

- **Confidence:** medium
- **Input:** address: Fort circle, Bipass, Devanahally, Devanahalli, Southegowdanahalli, Devanahalli, Karnataka 562110, Doddaballapur Road, Bangalore, Bangalore · locality: Doddaballapur-Road · city: Bangalore · phone: +917899947939 · coords: 13.2504177, 77.70726839999999 · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Chai-Memories/store/2072842 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur-Road' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 203 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.2504177, 77.70726839999999 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Chai-Memories/store/2072842. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 159: Chai Point - Nandi Hills

- **Confidence:** medium
- **Input:** address: Ground Floor, No. 975/119/2, NH Service Road, near Rani Circle, Devanahalli, Karnataka 562110, Doddaballapur Road, Bangalore, Bangalore · locality: Doddaballapur-Road · city: Bangalore · phone: +918880141000 · coords: 13.264046899999999, 77.7183735 · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Chai-Point-Nandi-Hills/store/20468aa · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur-Road' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 145, 163, 164, 166, 169, 170, 171, 172, 173, 175, 176, 178, 192, 222, 228, 229, 238, 239, 240 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.264046899999999, 77.7183735 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Chai-Point-Nandi-Hills/store/20468aa. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 160: Chai Park

- **Confidence:** medium
- **Input:** address: Farm House, Devanahalli Fort, Dharmarya Temple Street, near Tippu, Devanahalli, Southegowdanahalli, Devanahalli, Karnataka 562110, Doddaballapur Road, Bangalore, Bangalore · locality: Doddaballapur-Road · city: Bangalore · phone: +916364647154 · coords: 13.250464599999999, 77.7112952 · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Chai-Park/store/1cca695 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur-Road' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 224 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.250464599999999, 77.7112952 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Chai-Park/store/1cca695. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 161: Chikkaveeranna sweets

- **Confidence:** medium
- **Input:** address: Nandagokula, A/C veg restorent, bypass, Devanahalli, Southegowdanahalli, Devanahalli, Karnataka 562110, Doddaballapur Road, Bangalore, Bangalore · locality: Doddaballapur-Road · city: Bangalore · coords: 13.257782599999999, 77.7138086 · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Chikkaveeranna-Sweets/store/3bac443 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur-Road' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 147, 148, 180, 206, 213, 215 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.257782599999999, 77.7138086 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Chikkaveeranna-Sweets/store/3bac443. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 162: Chill D Monk

- **Confidence:** medium
- **Input:** address: Hoysala Corpus, BB Road, Opposite New RTO Office, International Airport, Bangalore, Doddaballapur Road, Bangalore, Bangalore · locality: Doddaballapur-Road · city: Bangalore · phone: +919880508039 · coords: 13.26861207, 77.71938321 · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Chill-D-Monk/store/1597958 · cuisine: Ice Cream, Desserts · listing_rating: 3.5 · listing_reviews: 1 · checked_on: 2026-10-11 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur-Road' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). External listing rating 3.5/1 recorded with source URL + check date — NEVER a Foodie community value. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 157, 165, 177, 185, 186, 218, 221, 225, 226, 241 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.26861207, 77.71938321 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Chill-D-Monk/store/1597958. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 163: Deepa Idly

- **Confidence:** medium
- **Input:** address: Rani Circle, Kurubarakunte, International Airport, Bengaluru, Doddaballapur Road, Bangalore, Bangalore · locality: Doddaballapur-Road · city: Bangalore · phone: +918095964738 · coords: 13.26403808, 77.71849966 · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Deepa-Idly/store/1758a39 · listing_rating: 4 · listing_reviews: 12 · checked_on: 2026-10-11 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur-Road' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). External listing rating 4/12 recorded with source URL + check date — NEVER a Foodie community value. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 145, 159, 164, 166, 169, 170, 171, 172, 173, 175, 176, 178, 192, 222, 228, 229, 238, 239, 240 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.26403808, 77.71849966 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Deepa-Idly/store/1758a39. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 164: Costa Coffee

- **Confidence:** medium
- **Input:** address: 7P79+JCH, Devanahalli, Karnataka 562110, Doddaballapur Road, Bangalore, Bangalore · locality: Doddaballapur-Road · city: Bangalore · phone: +919525146873 · coords: 13.264143599999999, 77.718406 · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Costa-Coffee/store/20876b5 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur-Road' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 145, 159, 163, 166, 169, 170, 171, 172, 173, 175, 176, 178, 192, 222, 228, 229, 238, 239, 240 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.264143599999999, 77.718406 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Costa-Coffee/store/20876b5. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 165: Dera Punjab

- **Confidence:** medium
- **Input:** address: 29/5, Hoysala Corpus, Rani Circle, BB Road, Devanahalli, Bangalore, Doddaballapur Road, Bangalore, Bangalore · locality: Doddaballapur-Road · city: Bangalore · phone: +919686600544 · coords: 13.26919, 77.71933 · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Dera-Punjab/store/1765129 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur-Road' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 157, 162, 177, 185, 186, 218, 221, 225, 226, 241, 250 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.26919, 77.71933 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Dera-Punjab/store/1765129. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 166: Desi Masala

- **Confidence:** medium
- **Input:** address: Ward No. 10, Khata No 975/119/2, Building no 2,Bye Pass Road, Rani circle,Devanahalli Town, Devanahalli Taluk, Bengaluru Rural, Doddaballapur Road, Bangalore, Bangalore · locality: Doddaballapur-Road · city: Bangalore · phone: +919886065592 · coords: 13.2639967, 77.71840999999999 · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Desi-Masala/store/16c2c3b · cuisine: Restaurant, Vegetarian restaurant · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur-Road' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 145, 159, 163, 164, 169, 170, 171, 172, 173, 175, 176, 178, 192, 222, 228, 229, 238, 239, 240 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.2639967, 77.71840999999999 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Desi-Masala/store/16c2c3b. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 167: Dk nattiy style restaurant

- **Confidence:** medium
- **Input:** address: Bypass road, Devanahalli, Karnataka 562110, Doddaballapur Road, Bangalore, Bangalore · locality: Doddaballapur-Road · city: Bangalore · phone: +919916704400 · coords: 13.2561308, 77.7111188 · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Dk-Nattiy-Style-Restaurant/store/3b0bba3 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur-Road' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 149, 211, 244 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.2561308, 77.7111188 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Dk-Nattiy-Style-Restaurant/store/3b0bba3. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 169: EasyBites By Empire

- **Confidence:** medium
- **Input:** address: Survey 191/6, Anekal Taluk, Devanahalli, International Airport, Bangalore, Doddaballapur Road, Bangalore, Bangalore · locality: Doddaballapur-Road · city: Bangalore · phone: +918040414141 · coords: 13.2632865, 77.7179268 · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Easybites-By-Empire/store/1632558 · cuisine: Fast food restaurant · listing_rating: 4.2 · listing_reviews: 2 · checked_on: 2026-10-11 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur-Road' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). External listing rating 4.2/2 recorded with source URL + check date — NEVER a Foodie community value. Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 145, 146, 159, 163, 164, 166, 170, 171, 172, 173, 178, 192, 217, 228, 238, 239, 240 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.2632865, 77.7179268 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Easybites-By-Empire/store/1632558. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 170: Empire Juices and Desserts

- **Confidence:** medium
- **Input:** address: Survey 191/6, Anekal Taluk, International Airport, Bangalore, Doddaballapur Road, Bangalore, Bangalore · locality: Doddaballapur-Road · city: Bangalore · phone: +918040414141 · coords: 13.26321911, 77.71784247 · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Empire-Juices-And-Desserts/store/1673c76 · cuisine: Juices, Light Bites, Shakes, Ice Cream, Desserts · listing_rating: 4.5 · listing_reviews: 2 · checked_on: 2026-10-11 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur-Road' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). External listing rating 4.5/2 recorded with source URL + check date — NEVER a Foodie community value. Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 145, 146, 159, 163, 164, 166, 169, 171, 172, 173, 178, 192, 217, 238, 239, 240 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.26321911, 77.71784247 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Empire-Juices-And-Desserts/store/1673c76. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 171: Empire restaurant since 1966

- **Confidence:** medium
- **Input:** address: 7P78+CVX, Kurubarakunte, Doddaballapur Road, Bangalore, Bangalore · locality: Doddaballapur-Road · city: Bangalore · phone: +919870000000 · coords: 13.2632005, 77.71784339999999 · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Empire-Restaurant-Since-1966/store/1694655 · cuisine: Restaurant, Kebab shop · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur-Road' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 145, 146, 159, 163, 164, 166, 169, 170, 172, 173, 178, 192, 217, 238, 239, 240 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.2632005, 77.71784339999999 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Empire-Restaurant-Since-1966/store/1694655. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 172: Empire Restaurant-Devanahalli

- **Confidence:** medium
- **Input:** address: Kurubarakunte, Karnataka 562110, Doddaballapur Road, Bangalore, Bangalore · locality: Doddaballapur-Road · city: Bangalore · phone: +918040414141 · coords: 13.2632005, 77.71784339999999 · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Empire-Restaurant-devanahalli/store/186c284 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur-Road' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 145, 146, 159, 163, 164, 166, 169, 170, 171, 173, 178, 192, 217, 238, 239, 240 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.2632005, 77.71784339999999 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Empire-Restaurant-devanahalli/store/186c284. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 173: Empire Restaurant

- **Confidence:** medium
- **Input:** address: Survey 191/6, Anekal Taluk, International Airport, Bangalore, Doddaballapur Road, Bangalore, Bangalore · locality: Doddaballapur-Road · city: Bangalore · phone: +918040414141 · coords: 13.26321911, 77.71784247 · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Empire-Restaurant/store/1632557 · cuisine: North Indian, Biryani, Kebab, South Indian, Mughlai, Chinese, Seafood, Shawarma · listing_rating: 3.6 · listing_reviews: 48 · checked_on: 2026-10-11 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur-Road' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). External listing rating 3.6/48 recorded with source URL + check date — NEVER a Foodie community value. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 145, 146, 159, 163, 164, 166, 169, 170, 171, 172, 178, 192, 217, 238, 239, 240 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.26321911, 77.71784247 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Empire-Restaurant/store/1632557. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 174: FISH LAND

- **Confidence:** medium
- **Input:** address: Doddaballapura railway station scout camp Opp. Max, Doddaballapur Road, Bangalore, Doddaballapur Road, Bangalore, Bangalore · locality: Doddaballapur-Road · city: Bangalore · phone: +919538940416 · coords: 13.1993646, 77.5617449 · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Fish-Land/store/1747740 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur-Road' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 372, 463 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.1993646, 77.5617449 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Fish-Land/store/1747740. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 175: Gagan Devanhalli

- **Confidence:** medium
- **Input:** address: Bangalore Hyderabad Highway, Near Rto Office, On The Foothills Of Jain Temple, 10 Minutes From Bangalore International Airport Guttahalli, Kasba Hobli, Doddaballapur Road, Bangalore, Bangalore · locality: Doddaballapur-Road · city: Bangalore · phone: +919986987650 · coords: 13.264827, 77.7181485 · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Gagan-Devanhalli/store/924aca · cuisine: Fast Food · listing_rating: 4.9 · listing_reviews: 2 · checked_on: 2026-10-11 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur-Road' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). External listing rating 4.9/2 recorded with source URL + check date — NEVER a Foodie community value. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 145, 159, 163, 164, 166, 176, 222, 228, 229, 239, 249 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.264827, 77.7181485 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Gagan-Devanhalli/store/924aca. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 176: Gagan

- **Confidence:** medium
- **Input:** address: Bangalore Hyderabad Highway, Near RTO Office, On the Foothills Of Jain Temple, 10 Minutes from Bangalore International Airport Guttahalli, Kasba Hobli, Devanahalli, Bengaluru, Karnataka 562110, Doddaballapur Road, Bangalore, Bangalore · locality: Doddaballapur-Road · city: Bangalore · phone: +919986987650 · coords: 13.264826999999999, 77.7181485 · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Gagan/store/19842c6 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur-Road' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 145, 159, 163, 164, 166, 175, 222, 228, 229, 239, 249 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.264826999999999, 77.7181485 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Gagan/store/19842c6. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 177: Gireema's Kitchen

- **Confidence:** medium
- **Input:** address: Guttahalli Rani Cross, Ward 10, BB Road, Devanahalli, Bangalore, Doddaballapur Road, Bangalore, Bangalore · locality: Doddaballapur-Road · city: Bangalore · phone: +919901115499 · coords: 13.269506, 77.719952 · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Gireemas-Kitchen/store/17934ac · listing_rating: 3.8 · listing_reviews: 68 · checked_on: 2026-10-11 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur-Road' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). External listing rating 3.8/68 recorded with source URL + check date — NEVER a Foodie community value. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 157, 162, 165, 186, 202, 216, 218, 221, 225, 226, 241, 250 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.269506, 77.719952 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Gireemas-Kitchen/store/17934ac. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 178: Galaxy restaurant

- **Confidence:** medium
- **Input:** address: Hyderabad highway, kurubara kunte, Devanahalli, Bengaluru, Karnataka 562110, Doddaballapur Road, Bangalore, Bangalore · locality: Doddaballapur-Road · city: Bangalore · coords: 13.2634873, 77.7173406 · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Galaxy-Restaurant/store/1c32c15 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur-Road' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 145, 146, 159, 163, 164, 166, 169, 170, 171, 172, 173, 192, 220, 238, 240 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.2634873, 77.7173406 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Galaxy-Restaurant/store/1c32c15. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 179: Gowdru Dum Biriyani Hotel

- **Confidence:** medium
- **Input:** address: opp.to jain temple, signal, Devanahalli, Vijayapura Town, Binnamangala, Karnataka 562110, Doddaballapur Road, Bangalore, Bangalore · locality: Doddaballapur-Road · city: Bangalore · coords: 13.256748799999999, 77.71709729999999 · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Gowdru-Dum-Biriyani-Hotel/store/1aa029c · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur-Road' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 181, 183, 205, 235, 251, 394 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.256748799999999, 77.71709729999999 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Gowdru-Dum-Biriyani-Hotel/store/1aa029c. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 180: Gowdru Mane Oota

- **Confidence:** medium
- **Input:** address: Karnataka 562110, Doddaballapur Road, Bangalore, Bangalore · locality: Doddaballapur-Road · city: Bangalore · coords: 13.2576801, 77.712651 · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Gowdru-Mane-Oota/store/1b03854 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur-Road' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 147, 148, 150, 161, 206, 213, 248 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.2576801, 77.712651 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Gowdru-Mane-Oota/store/1b03854. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 181: Gowdru Dum Biriyani

- **Confidence:** medium
- **Input:** address: Vijayapura Signal, Opposite Jain Temple, International Airport, Bangalore, Doddaballapur Road, Bangalore, Bangalore · locality: Doddaballapur-Road · city: Bangalore · phone: +918660861899 · coords: 13.25670873, 77.71707058 · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Gowdru-Dum-Biriyani/store/16894c2 · cuisine: Biryani, Kebab · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur-Road' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 179, 183, 205, 235, 251 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.25670873, 77.71707058 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Gowdru-Dum-Biriyani/store/16894c2. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 183: Green Park Restaurant

- **Confidence:** medium
- **Input:** address: 168/1, Devnahalli Bypass Road, International Airport, Bangalore, Doddaballapur Road, Bangalore, Bangalore · locality: Doddaballapur-Road · city: Bangalore · phone: +917026468889 · coords: 13.25564266, 77.71719554 · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Green-Park-Restaurant/store/51cb39 · cuisine: North Indian, Mughlai, Seafood, Chinese, Kebab, Street Food, Ice Cream · listing_rating: 4.9 · listing_reviews: 1 · checked_on: 2026-10-11 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur-Road' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). External listing rating 4.9/1 recorded with source URL + check date — NEVER a Foodie community value. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 179, 181, 204, 235, 244, 251 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.25564266, 77.71719554 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Green-Park-Restaurant/store/51cb39. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 184: Halli Mane Oota

- **Confidence:** medium
- **Input:** address: 191, Dvanahalli Town, Dodabalapura Road, International Airport, Bangalore, Doddaballapur Road, Bangalore, Bangalore · locality: Doddaballapur-Road · city: Bangalore · phone: +918884827468 · coords: 13.2569966, 77.7152497 · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Halli-Mane-Oota/store/1642275 · cuisine: South Indian · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur-Road' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 205, 208, 249 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.2569966, 77.7152497 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Halli-Mane-Oota/store/1642275. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 185: Honey Comb

- **Confidence:** medium
- **Input:** address: Kurubarakunte, Doddaballapur Road, Bangalore, Bangalore · locality: Doddaballapur-Road · city: Bangalore · phone: +919945386386 · coords: 13.2680657, 77.7195399 · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Honey-Comb/store/925801 · cuisine: Cake · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur-Road' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 157, 162, 165, 186, 212, 221, 225, 226, 241 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.2680657, 77.7195399 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Honey-Comb/store/925801. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 186: India Sweet House

- **Confidence:** medium
- **Input:** address: 29/5, Hoysala Corpus, Bb Road, Rani Circle, International Airport, Bangalore, Doddaballapur Road, Bangalore, Bangalore · locality: Doddaballapur-Road · city: Bangalore · phone: +917349596592 · coords: 13.2684048, 77.71955492 · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/India-Sweet-House/store/1634548 · cuisine: Mithai, Street Food · listing_rating: 4.9 · listing_reviews: 1 · checked_on: 2026-10-11 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur-Road' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). External listing rating 4.9/1 recorded with source URL + check date — NEVER a Foodie community value. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 157, 162, 165, 177, 185, 189, 218, 221, 225, 226, 241 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.2684048, 77.71955492 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/India-Sweet-House/store/1634548. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 187: Indian Paratha Company

- **Confidence:** medium
- **Input:** address: 1/2, Guttahalli, Kasaba Hobli, Devanahalli, International Airport, Doddaballapur Road, Bangalore, Bangalore · locality: Doddaballapur-Road · city: Bangalore · coords: 13.2622242, 77.7163153 · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Indian-Paratha-Company/store/21301 · cuisine: Birthday / Group Parties, Home Delivery · listing_rating: 4.2 · listing_reviews: 1170 · checked_on: 2026-10-11 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur-Road' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). External listing rating 4.2/1170 recorded with source URL + check date — NEVER a Foodie community value. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 153, 188, 190, 207, 214, 220 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.2622242, 77.7163153 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Indian-Paratha-Company/store/21301. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 188: Indian Paratha Company-Chai Paratha More

- **Confidence:** medium
- **Input:** address: Survey No ½, Guttahalli, Kasaba Hobli, Hyderabad - Bangalore Hwy, Devanahally, Karnataka 562110, Doddaballapur Road, Bangalore, Bangalore · locality: Doddaballapur-Road · city: Bangalore · phone: +919880883061 · coords: 13.2623363, 77.7163226 · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Indian-Paratha-Company-chai-Paratha-More/store/185069a · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur-Road' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 153, 187, 190, 207, 214, 220 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.2623363, 77.7163226 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Indian-Paratha-Company-chai-Paratha-More/store/185069a. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 189: Indian sweet house

- **Confidence:** medium
- **Input:** address: 7PJF+X7G, near Sai baba temple attibele, Avati, Kurubarakunte, Karnataka 562164, Doddaballapur Road, Bangalore, Bangalore · locality: Doddaballapur-Road · city: Bangalore · coords: 13.2815978, 77.7228125 · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Indian-Sweet-House/store/2081720 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur-Road' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 156, 186, 194, 230 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.2815978, 77.7228125 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Indian-Sweet-House/store/2081720. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 190: IRANI CHAI TEA

- **Confidence:** medium
- **Input:** address: 7P68+MP9, NH Service Road, Kurubarakunte, Devanahalli, Karnataka 562110, Doddaballapur Road, Bangalore, Bangalore · locality: Doddaballapur-Road · city: Bangalore · coords: 13.261666199999999, 77.7168647 · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Irani-Chai-Tea/store/2072843 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur-Road' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 153, 187, 188, 207, 214, 220 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.261666199999999, 77.7168647 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Irani-Chai-Tea/store/2072843. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 191: J K Kabab

- **Confidence:** medium
- **Input:** address: 7P27+8Vf, Doddaballapur Road, Bangalore, Bangalore · locality: Doddaballapur-Road · city: Bangalore · phone: +919845764698 · coords: 13.2508145, 77.7146804 · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/J-K-Kabab/store/bc03c4 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur-Road' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 210, 219, 233, 236 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.2508145, 77.7146804 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/J-K-Kabab/store/bc03c4. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 192: Karavali Grand

- **Confidence:** medium
- **Input:** address: 10,  Parivatagutta,  Nh 7,  International Airport,  Bengaluru, Near Old Bus Stand, Bypass Road, Devanahalli, Bangalore-562110, Karnataka, Doddaballapur Road, Bangalore, Bangalore · locality: Doddaballapur-Road · city: Bangalore · phone: +917625055461 · coords: 13.2634723, 77.7173411 · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Karavali-Grand/store/18216c8 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur-Road' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Matches to existing records:**
  - `60cc569b` **Sri Ganesh Grand** · locality: Bashettihalli — similarity 0.5 (name-ambiguous-proper-token) · distance: 17.886 km · existing coords: 13.2679055, 77.5521405 — confidence low
  - `987dad98` **Shri Manjunatha Grand Veg** · locality: Doddaballapura Railway Station — similarity 0.4 (name-ambiguous-proper-token) · existing coords: NULL — confidence low
- **Intra-file duplicates:** rows 145, 146, 159, 163, 164, 166, 169, 170, 171, 172, 173, 178, 220, 238, 240 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.2634723, 77.7173411 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Karavali-Grand/store/18216c8. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `LOCALITY_CONFLICT`, `LOCALITY_CONFLICT`, `EXISTING_COORDINATES_DIFFER`, `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 194: Koteshwaram-The Temple of Divine Food

- **Confidence:** medium
- **Input:** address: Sy No 15, Abbachikkanahalli, Southegowdanahalli, Kurubarakunte, Karnataka 562164, Doddaballapur Road, Bangalore, Bangalore · locality: Doddaballapur-Road · city: Bangalore · phone: +918971510111 · coords: 13.281445699999999, 77.7228772 · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Koteshwaram-the-Temple-Of-Divine-Food/store/1c2c0c2 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur-Road' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 156, 189, 230 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.281445699999999, 77.7228772 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Koteshwaram-the-Temple-Of-Divine-Food/store/1c2c0c2. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 195: Kushal Tiffin Centre And Snacks

- **Confidence:** medium
- **Input:** address: 7Pf8+5F8, Neeleri, Doddaballapur Road, Bangalore, Bangalore · locality: Doddaballapur-Road · city: Bangalore · phone: +919663556699 · coords: 13.271809, 77.7168493 · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Kushal-Tiffin-Centre-And-Snacks/store/1172bb1 · cuisine: South Indian · listing_rating: 3 · listing_reviews: 6 · checked_on: 2026-10-11 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur-Road' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). External listing rating 3/6 recorded with source URL + check date — NEVER a Foodie community value. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 246 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.271809, 77.7168493 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Kushal-Tiffin-Centre-And-Snacks/store/1172bb1. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 199: Maggi near nandi hills

- **Confidence:** medium
- **Input:** address: 7PG7+J99, SH 104, Lalagondanahalli, Karnataka 562110, Doddaballapur Road, Bangalore, Bangalore · locality: Doddaballapur-Road · city: Bangalore · phone: +919945966341 · coords: 13.2765395, 77.7134789 · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Maggi-Near-Nandi-Hills/store/1984059 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur-Road' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 234 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.2765395, 77.7134789 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Maggi-Near-Nandi-Hills/store/1984059. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 200: Mahalakshmi kulfi ice cream

- **Confidence:** medium
- **Input:** address: 7P89+MV7, Rani Circle, Devanahalli, Karnataka 562110, Doddaballapur Road, Bangalore, Bangalore · locality: Doddaballapur-Road · city: Bangalore · coords: 13.2666703, 77.719673 · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Mahalakshmi-Kulfi-Ice-Cream/store/447b863 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur-Road' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 212 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.2666703, 77.719673 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Mahalakshmi-Kulfi-Ice-Cream/store/447b863. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 201: Mahalakshmi Spice Heritage Family Restaurant

- **Confidence:** medium
- **Input:** address: next to indian petrol bunk, near sai baba Temple, Avati, Karnataka 562110, Doddaballapur Road, Bangalore, Bangalore · locality: Doddaballapur-Road · city: Bangalore · phone: +919148278837 · coords: 13.288513499999999, 77.7242523 · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Mahalakshmi-Spice-Heritage-Family-Restaurant/store/3b0bba4 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur-Road' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 231, 243, 247 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.288513499999999, 77.7242523 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Mahalakshmi-Spice-Heritage-Family-Restaurant/store/3b0bba4. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 202: Mast Punjabi

- **Confidence:** medium
- **Input:** address: 9, Kurubarakunte, B B Road, Devanahalli, Bangalore, Doddaballapur Road, Bangalore, Bangalore · locality: Doddaballapur-Road · city: Bangalore · phone: +918970099737 · coords: 13.270448, 77.720154 · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Mast-Punjabi/store/1870212 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur-Road' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 177, 216, 218, 250 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.270448, 77.720154 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Mast-Punjabi/store/1870212. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 203: MAYURA CAFE

- **Confidence:** medium
- **Input:** address: Hyderabad - Bangalore Hwy, Devanahalli, Southegowdanahalli, Karnataka 562110, Doddaballapur Road, Bangalore, Bangalore · locality: Doddaballapur-Road · city: Bangalore · phone: +918943264218 · coords: 13.2506728, 77.7067864 · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Mayura-Cafe/store/1852928 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur-Road' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 158 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.2506728, 77.7067864 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Mayura-Cafe/store/1852928. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 204: Mayura Motte Bandi

- **Confidence:** medium
- **Input:** address: Near D-Mart, Devanahalli, Bangalore, Doddaballapur Road, Bangalore, Bangalore · locality: Doddaballapur-Road · city: Bangalore · phone: +919538377723 · coords: 13.2549655944, 77.716825226 · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Mayura-Motte-Bandi/store/1767b31 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur-Road' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 183, 251 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.2549655944, 77.716825226 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Mayura-Motte-Bandi/store/1767b31. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 205: Nagarajappa Hotel

- **Confidence:** medium
- **Input:** address: 7P48+QJR, Devanahalli, Binnamangala, Karnataka 562110, Doddaballapur Road, Bangalore, Bangalore · locality: Doddaballapur-Road · city: Bangalore · coords: 13.2569763, 77.7165035 · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Nagarajappa-Hotel/store/1a5372c · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur-Road' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 179, 181, 184, 235, 251 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.2569763, 77.7165035 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Nagarajappa-Hotel/store/1a5372c. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 206: Nandagokula Ac Veg Restaurant

- **Confidence:** medium
- **Input:** address: Shri Nakoda Avanti 108 Parshwanath Jain Temple, State Highway 96, Doddaballapur Road, Bangalore, Bangalore · locality: Doddaballapur-Road · city: Bangalore · phone: +919663332342 · coords: 13.2576378, 77.7135308 · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Nandagokula-Ac-Veg-Restaurant/store/929701 · cuisine: North Indian · listing_rating: 4.3 · listing_reviews: 3 · checked_on: 2026-10-11 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur-Road' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). External listing rating 4.3/3 recorded with source URL + check date — NEVER a Foodie community value. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 147, 148, 161, 180, 213, 215 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.2576378, 77.7135308 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Nandagokula-Ac-Veg-Restaurant/store/929701. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 207: Nandi Udupi Cafe

- **Confidence:** medium
- **Input:** address: Southegowdanahalli, Devanahalli, Binnamangala, Bangalore, Karnataka 562110, Doddaballapur Road, Bangalore, Bangalore · locality: Doddaballapur-Road · city: Bangalore · phone: +916361317454 · coords: 13.261707699999999, 77.7168999 · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Nandi-Udupi-Cafe/store/3ab794c · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur-Road' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 153, 187, 188, 190, 214, 217, 220 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.261707699999999, 77.7168999 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Nandi-Udupi-Cafe/store/3ab794c. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 208: Nandi Upchar

- **Confidence:** medium
- **Input:** address: Nh-7, B.B Road, Rani Circle, Devanhalli, Doddaballapur Road, Bangalore, Bangalore · locality: Doddaballapur-Road · city: Bangalore · phone: +917026628185 · coords: 13.25722, 77.715106 · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Nandi-Upchar/store/a36aa · cuisine: North Indian · listing_rating: 4.2 · listing_reviews: 553 · checked_on: 2026-10-11 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur-Road' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). External listing rating 4.2/553 recorded with source URL + check date — NEVER a Foodie community value. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 184, 249 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.25722, 77.715106 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Nandi-Upchar/store/a36aa. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 210: Nandini Milk Parlour

- **Confidence:** medium
- **Input:** address: Devanahalli, Gokare, Karnataka 562110, Doddaballapur Road, Bangalore, Bangalore · locality: Doddaballapur-Road · city: Bangalore · coords: 13.250992799999999, 77.71345989999999 · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Nandini-Milk-Parlour/store/1835041 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur-Road' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 191, 424 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.250992799999999, 77.71345989999999 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Nandini-Milk-Parlour/store/1835041. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 211: Nayana Andhra Food Zone

- **Confidence:** medium
- **Input:** address: Bypass Road, Devanahalli, Bangalore, Doddaballapur Road, Bangalore, Bangalore · locality: Doddaballapur-Road · city: Bangalore · phone: +917780495266 · coords: 13.2560576, 77.7099028 · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Nayana-Andhra-Food-Zone/store/1870214 · listing_rating: 3.3 · listing_reviews: 22 · checked_on: 2026-10-11 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur-Road' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). External listing rating 3.3/22 recorded with source URL + check date — NEVER a Foodie community value. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 149, 167, 244 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.2560576, 77.7099028 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Nayana-Andhra-Food-Zone/store/1870214. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 212: New Friends Biriyani Corner

- **Confidence:** medium
- **Input:** address: Kurubarakunte, Kurubarakunte, Doddaballapur Road, Bangalore, Bangalore · locality: Doddaballapur-Road · city: Bangalore · phone: +919901107183 · coords: 13.2669918, 77.7192874 · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/New-Friends-Biriyani-Corner/store/543370 · cuisine: Biryani, South Indian · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur-Road' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 185, 200 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.2669918, 77.7192874 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/New-Friends-Biriyani-Corner/store/543370. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 213: New Prashanth Hotel Nati Style

- **Confidence:** medium
- **Input:** address: 7P57+76G, NH Service Road, Binnamangala, Karnataka 562110, Doddaballapur Road, Bangalore, Bangalore · locality: Doddaballapur-Road · city: Bangalore · coords: 13.258186, 77.7130909 · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/New-Prashanth-Hotel-Nati-Style/store/1b0c76a · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur-Road' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 147, 148, 150, 161, 180, 206, 215, 248 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.258186, 77.7130909 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/New-Prashanth-Hotel-Nati-Style/store/1b0c76a. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 214: NH7 Refuel Restaurant

- **Confidence:** medium
- **Input:** address: Hyderabad - Bangalore Hwy, Devanahalli, Kurubarakunte, Karnataka 562110, Doddaballapur Road, Bangalore, Bangalore · locality: Doddaballapur-Road · city: Bangalore · coords: 13.262185299999999, 77.71630069999999 · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Nh7-Refuel-Restaurant/store/1852967 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur-Road' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 153, 187, 188, 190, 207, 220 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.262185299999999, 77.71630069999999 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Nh7-Refuel-Restaurant/store/1852967. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 215: NM Foodhub

- **Confidence:** medium
- **Input:** address: 7P57+FF6, Devanahalli, Southegowdanahalli, Devanahalli, Karnataka 562110, Doddaballapur Road, Bangalore, Bangalore · locality: Doddaballapur-Road · city: Bangalore · coords: 13.2586701, 77.71365 · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Nm-Foodhub/store/39c1cba · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur-Road' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 147, 148, 161, 206, 213 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.2586701, 77.71365 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Nm-Foodhub/store/39c1cba. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 216: North Indian Highway Bhukkad

- **Confidence:** medium
- **Input:** address: 45, Kurubarakunte, BB Road, Near SBI Temple, Devanahalli, Bangalore, Doddaballapur Road, Bangalore, Bangalore · locality: Doddaballapur-Road · city: Bangalore · phone: +918970099737 · coords: 13.270448, 77.720154 · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/North-Indian-Highway-Bhukkad/store/1870213 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur-Road' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 177, 202, 218, 250 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.270448, 77.720154 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/North-Indian-Highway-Bhukkad/store/1870213. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 217: Raja Bar and restaurant

- **Confidence:** medium
- **Input:** address: 7P69+R7M, SH 104, Binnamangala, Karnataka 562110, Doddaballapur Road, Bangalore, Bangalore · locality: Doddaballapur-Road · city: Bangalore · coords: 13.262099099999999, 77.71817879999999 · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Raja-Bar-And-Restaurant/store/1a54864 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur-Road' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 169, 170, 171, 172, 173, 207, 238, 240 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.262099099999999, 77.71817879999999 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Raja-Bar-And-Restaurant/store/1a54864. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 218: Punjabi Dhaba

- **Confidence:** medium
- **Input:** address: Panjabi dhaba, Devanahalli, Karnataka 562110, Doddaballapur Road, Bangalore, Bangalore · locality: Doddaballapur-Road · city: Bangalore · phone: +919901115499 · coords: 13.2695292, 77.72004919999999 · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Punjabi-Dhaba/store/3aa2496 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur-Road' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 157, 162, 165, 177, 186, 202, 216, 221, 225, 226, 241, 250, 273 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.2695292, 77.72004919999999 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Punjabi-Dhaba/store/3aa2496. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 219: Ramakrishna Bar & Restaurant

- **Confidence:** medium
- **Input:** address: 7P28+F88, NH 207, Devanahalli, Bengaluru, Binnamangala, Karnataka 562110, Doddaballapur Road, Bangalore, Bangalore · locality: Doddaballapur-Road · city: Bangalore · coords: 13.2511575, 77.7158323 · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Ramakrishna-Bar-and-Restaurant/store/1a54861 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur-Road' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 191, 233, 236 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.2511575, 77.7158323 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Ramakrishna-Bar-and-Restaurant/store/1a54861. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 220: Rigaan Resto bar

- **Confidence:** medium
- **Input:** address: Survey No. 1/1, NH7 Highway,Guttahalli village, taluk, Kasaba hobli, Devanahally, Karnataka 562110, Doddaballapur Road, Bangalore, Bangalore · locality: Doddaballapur-Road · city: Bangalore · phone: +917483860149 · coords: 13.2625537, 77.7165569 · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Rigaan-Resto-Bar/store/19a1463 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur-Road' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 146, 153, 178, 187, 188, 190, 192, 207, 214 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.2625537, 77.7165569 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Rigaan-Resto-Bar/store/19a1463. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 221: Rigan Multi Cuisine Restaurant

- **Confidence:** medium
- **Input:** address: NH7 Highway,  Devanahalli, Near Shell Fuel Station, National Highway, Devanahalli, Bangalore-562110, Karnataka, Doddaballapur Road, Bangalore, Bangalore · locality: Doddaballapur-Road · city: Bangalore · phone: +918971759323 · coords: 13.268330847903, 77.719974190034 · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Rigan-Multi-Cuisine-Restaurant/store/1820a17 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur-Road' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 157, 162, 165, 177, 185, 186, 218, 225, 226, 241 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.268330847903, 77.719974190034 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Rigan-Multi-Cuisine-Restaurant/store/1820a17. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 222: Roz Shawarma & Rolls

- **Confidence:** medium
- **Input:** address: Pillappa Acrade, 1st Floor, 10th Ward, Parivara Gutta, Near BB Road, Deveanahalli Town, Devanahalli Taluk, Bengaluru Rural District -562110, Karnataka-562110, Doddaballapur Road, Bangalore, Bangalore · locality: Doddaballapur-Road · city: Bangalore · phone: +916366004393 · coords: 13.26465684, 77.7184746 · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Roz-Shawarma-and-Rolls/store/1765602 · cuisine: Rolls · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur-Road' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 145, 159, 163, 164, 166, 175, 176, 228, 229, 239 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.26465684, 77.7184746 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Roz-Shawarma-and-Rolls/store/1765602. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 224: Ruthu's Thindi

- **Confidence:** medium
- **Input:** address: 38/D, Farm House, Dharamaraya Temple Street, International Airport, Bangalore, Doddaballapur Road, Bangalore, Bangalore · locality: Doddaballapur-Road · city: Bangalore · phone: +919980896885 · coords: 13.25045448, 77.71095493 · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Ruthus-Thindi/store/16b683c · cuisine: South Indian · listing_rating: 4.2 · listing_reviews: 196 · checked_on: 2026-10-11 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur-Road' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). External listing rating 4.2/196 recorded with source URL + check date — NEVER a Foodie community value. Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 160 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.25045448, 77.71095493 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Ruthus-Thindi/store/16b683c. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 225: SB Bakery&Sweets Nandi Hills Road New RTO

- **Confidence:** medium
- **Input:** address: 7P99+HHR, Nandhi Hills Rd, Kurubarakunte, Karnataka 562110, Doddaballapur Road, Bangalore, Bangalore · locality: Doddaballapur-Road · city: Bangalore · phone: +919980322131 · coords: 13.268990299999999, 77.718884 · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Sb-Bakeryandsweets-Nandi-Hills-Road-New-Rto/store/191246c · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur-Road' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 157, 162, 165, 177, 185, 186, 218, 221, 226, 241 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.268990299999999, 77.718884 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Sb-Bakeryandsweets-Nandi-Hills-Road-New-Rto/store/191246c. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 226: Sb Bakery&Sweets

- **Confidence:** medium
- **Input:** address: Nandhi Hills Rd, Kurubarakunte, Doddaballapur Road, Bangalore, Bangalore · locality: Doddaballapur-Road · city: Bangalore · phone: +919980322131 · coords: 13.2687507, 77.718986 · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Sb-Bakeryandsweets/store/92c0c7 · cuisine: Cake · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur-Road' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 157, 162, 165, 177, 185, 186, 218, 221, 225, 241 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.2687507, 77.718986 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Sb-Bakeryandsweets/store/92c0c7. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 228: Seasons Mandi Restaurant

- **Confidence:** medium
- **Input:** address: Kurubarkunte, Devanahalli, Bangalore, Doddaballapur Road, Bangalore, Bangalore · locality: Doddaballapur-Road · city: Bangalore · phone: +919110613866 · coords: 13.2643815, 77.7186501 · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Seasons-Mandi-Restaurant/store/176757b · listing_rating: 4.3 · listing_reviews: 1172 · checked_on: 2026-10-11 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur-Road' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). External listing rating 4.3/1172 recorded with source URL + check date — NEVER a Foodie community value. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 145, 159, 163, 164, 166, 169, 175, 176, 222, 229, 239, 240 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.2643815, 77.7186501 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Seasons-Mandi-Restaurant/store/176757b. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 229: Sharief Bhai Biryani

- **Confidence:** medium
- **Input:** address: Pillappa Acrade, 1st Floor, 10th Ward, Parivara Gutta, Near BB Road, Deveanahalli Town, Devanahalli Taluk, Bengaluru Rural District -562110, Karnataka-562110, Doddaballapur Road, Bangalore, Bangalore · locality: Doddaballapur-Road · city: Bangalore · phone: +916366004393 · coords: 13.26465684, 77.7184746 · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Sharief-Bhai-Biryani/store/1758987 · cuisine: Biryani, Shawarma, Kebab, Mughlai, Arabian, Rolls, Street Food, Tea, Desserts · listing_rating: 4.1 · listing_reviews: 1386 · checked_on: 2026-10-11 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur-Road' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). External listing rating 4.1/1386 recorded with source URL + check date — NEVER a Foodie community value. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 145, 159, 163, 164, 166, 175, 176, 222, 228, 239 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.26465684, 77.7184746 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Sharief-Bhai-Biryani/store/1758987. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 230: SNACKS HOUSE

- **Confidence:** medium
- **Input:** address: Abbachikkanahalli, Devanahally, Kurubarakunte, Karnataka 562164, Doddaballapur Road, Bangalore, Bangalore · locality: Doddaballapur-Road · city: Bangalore · phone: +917892828518 · coords: 13.281244, 77.7233803 · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Snacks-House/store/1981632 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur-Road' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 156, 189, 194 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.281244, 77.7233803 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Snacks-House/store/1981632. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 231: Spice Heritage Family Restaurant

- **Confidence:** medium
- **Input:** address: near Sai Baba Temple, next to India Petrol Bunk, Avati, Karnataka 562164, Doddaballapur Road, Bangalore, Bangalore · locality: Doddaballapur-Road · city: Bangalore · coords: 13.288488, 77.7242433 · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Spice-Heritage-Family-Restaurant/store/1b04506 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur-Road' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 201, 243, 247 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.288488, 77.7242433 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Spice-Heritage-Family-Restaurant/store/1b04506. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 233: Sri Bhairaveshwara Chicken Centre

- **Confidence:** medium
- **Input:** address: Near, gangamma road, Devanahalli, Southegowdanahalli, Gokare, Karnataka 562110, Doddaballapur Road, Bangalore, Bangalore · locality: Doddaballapur-Road · city: Bangalore · coords: 13.250435699999999, 77.715706 · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Sri-Bhairaveshwara-Chicken-Centre/store/1b0c046 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur-Road' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 191, 219, 236 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.250435699999999, 77.715706 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Sri-Bhairaveshwara-Chicken-Centre/store/1b0c046. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 234: SRI NANDISHWARA HOTEL

- **Confidence:** medium
- **Input:** address: Karnataka 562110, Doddaballapur Road, Bangalore, Bangalore · locality: Doddaballapur-Road · city: Bangalore · coords: 13.2773873, 77.71267809999999 · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Sri-Nandishwara-Hotel/store/1b05ba4 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur-Road' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 199 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.2773873, 77.71267809999999 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Sri-Nandishwara-Hotel/store/1b05ba4. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 235: Sri Raghavendra Furniture's

- **Confidence:** medium
- **Input:** address: BB Rd, opp. Jain Temple, near Vijayapura Cross, Devanahalli, Binnamangala, Karnataka 562110, Doddaballapur Road, Bangalore, Bangalore · locality: Doddaballapur-Road · city: Bangalore · coords: 13.2563146, 77.7170208 · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Sri-Raghavendra-Furnitures/store/1a5300c · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur-Road' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 179, 181, 183, 205, 251 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.2563146, 77.7170208 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Sri-Raghavendra-Furnitures/store/1a5300c. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 236: Sri Sairam Tent House

- **Confidence:** medium
- **Input:** address: N H 7 Devanali Town, Near Manasa Hospital, Maralubagilu Road, Devanahalli, Bangalore-562110, Karnataka, Doddaballapur Road, Bangalore, Bangalore · locality: Doddaballapur-Road · city: Bangalore · phone: +919845335694 · coords: 13.2506479, 77.7156346 · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Sri-Sairam-Tent-House/store/1803412 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur-Road' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 191, 219, 233 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.2506479, 77.7156346 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Sri-Sairam-Tent-House/store/1803412. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 238: Starbucks

- **Confidence:** medium
- **Input:** address: Gr Floor, Empire Building, No 2, NH 44 Tadipatri, Hyderabad - Bangalore Hwy, Kurubarakunte, Karnataka 562110, Doddaballapur Road, Bangalore, Bangalore · locality: Doddaballapur-Road · city: Bangalore · phone: +918602660010 · coords: 13.2630883, 77.7178356 · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Starbucks/store/1853122 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur-Road' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 145, 146, 159, 163, 164, 166, 169, 170, 171, 172, 173, 178, 192, 217, 240 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.2630883, 77.7178356 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Starbucks/store/1853122. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 239: Subway Sudheer Kirthi

- **Confidence:** medium
- **Input:** address: Unit No. 3, Ground Floor NH Service Road, NH 7, Bypass, Devanahally, Bengaluru, Karnataka 560034, Doddaballapur Road, Bangalore, Bangalore · locality: Doddaballapur-Road · city: Bangalore · coords: 13.264368, 77.7184439 · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Subway-Sudheer-Kirthi/store/1a62357 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur-Road' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 145, 159, 163, 164, 166, 169, 170, 171, 172, 173, 175, 176, 222, 228, 229, 240 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.264368, 77.7184439 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Subway-Sudheer-Kirthi/store/1a62357. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 240: Swadh Veg

- **Confidence:** medium
- **Input:** address: 975/119/2, E-Khata 35/1/189D, Bypass Road, Near Rani Circle, Devanahalli, Bangalore, Doddaballapur Road, Bangalore, Bangalore · locality: Doddaballapur-Road · city: Bangalore · coords: 13.2632129128, 77.717972761 · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Swadh-Veg/store/379c707 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur-Road' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 145, 146, 159, 163, 164, 166, 169, 170, 171, 172, 173, 178, 192, 217, 228, 238, 239 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.2632129128, 77.717972761 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Swadh-Veg/store/379c707. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 241: The Arabs

- **Confidence:** medium
- **Input:** address: 29/9, NH 44, Rani Circle, BB Road, International Airport, Bangalore, Doddaballapur Road, Bangalore, Bangalore · locality: Doddaballapur-Road · city: Bangalore · phone: +919513317404 · coords: 13.26884236, 77.71987382 · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/The-Arabs/store/4c93b6 · cuisine: North Indian, Mughlai, Chinese, Seafood, Biryani, Desserts, Shakes · listing_rating: 4.7 · listing_reviews: 49 · checked_on: 2026-10-11 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur-Road' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). External listing rating 4.7/49 recorded with source URL + check date — NEVER a Foodie community value. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 157, 162, 165, 177, 185, 186, 218, 221, 225, 226, 250 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.26884236, 77.71987382 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/The-Arabs/store/4c93b6. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 243: The Green House Restaurant

- **Confidence:** medium
- **Input:** address: NH 44, Near Indian Oil, Avati, Doddaballapur Road, Bangalore, Bangalore · locality: Doddaballapur-Road · city: Bangalore · phone: +918050910406 · coords: 13.2884772, 77.7242471 · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/The-Green-House-Restaurant/store/604b93 · listing_rating: 4.2 · listing_reviews: 7 · checked_on: 2026-10-11 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur-Road' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). External listing rating 4.2/7 recorded with source URL + check date — NEVER a Foodie community value. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 201, 231, 247 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.2884772, 77.7242471 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/The-Green-House-Restaurant/store/604b93. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 244: The Green Park Family Restaurant

- **Confidence:** medium
- **Input:** address: Bengaluru, Karnataka 562110, Doddaballapur Road, Bangalore, Bangalore · locality: Doddaballapur-Road · city: Bangalore · phone: +919341238889 · coords: 13.2566784, 77.7105983 · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/The-Green-Park-Family-Restaurant/store/198116c · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur-Road' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 149, 167, 183, 211 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.2566784, 77.7105983 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/The-Green-Park-Family-Restaurant/store/198116c. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 246: Thindi Mane & Cafe

- **Confidence:** medium
- **Input:** address: Nandhi Hills Rd, next to Teja Nursery Thindimane and Cafe, Devanahalli, Devanahally, Kurubarakunte, Karnataka 562110, Doddaballapur Road, Bangalore, Bangalore · locality: Doddaballapur-Road · city: Bangalore · coords: 13.2712319, 77.71729309999999 · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Thindi-Mane-and-Cafe/store/1ab178c · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur-Road' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 195 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.2712319, 77.71729309999999 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Thindi-Mane-and-Cafe/store/1ab178c. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 247: Thirumala Dhaba

- **Confidence:** medium
- **Input:** address: 7PQF+3C7, Kurubarakunte, Karnataka 562164, Doddaballapur Road, Bangalore, Bangalore · locality: Doddaballapur-Road · city: Bangalore · coords: 13.2876745, 77.72355309999999 · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Thirumala-Dhaba/store/1a53002 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur-Road' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 201, 231, 243 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.2876745, 77.72355309999999 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Thirumala-Dhaba/store/1a53002. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 248: Tippu Star Hotel

- **Confidence:** medium
- **Input:** address: NH 7 Rode, Near  Nandagokul Restorent, LNT Bypass, Devanahalli, Bangalore-562110, Karnataka, Doddaballapur Road, Bangalore, Bangalore · locality: Doddaballapur-Road · city: Bangalore · phone: +919845751578 · coords: 13.2573245, 77.712142 · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Tippu-Star-Hotel/store/180312a · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur-Road' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 150, 180, 213 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.2573245, 77.712142 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Tippu-Star-Hotel/store/180312a. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 249: Twisted Indian Cuisine

- **Confidence:** medium
- **Input:** address: Nh Service Road, Rani Cross(Nandi Cross), Kurubarakunte, Doddaballapur Road, Bangalore, Bangalore · locality: Doddaballapur-Road · city: Bangalore · phone: +919986987650 · coords: 13.25722, 77.715106 · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Twisted-Indian-Cuisine/store/cb798 · cuisine: North Indian, Chinese, Fast Food · listing_rating: 4 · listing_reviews: 102 · checked_on: 2026-10-11 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur-Road' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). External listing rating 4/102 recorded with source URL + check date — NEVER a Foodie community value. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 175, 176, 184, 208 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.25722, 77.715106 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Twisted-Indian-Cuisine/store/cb798. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 250: Up Punjabi Dhaba

- **Confidence:** medium
- **Input:** address: Nh 44, Bengaluru, Doddaballapur Road, Bangalore, Bangalore · locality: Doddaballapur-Road · city: Bangalore · phone: +919900562031 · coords: 13.2700817, 77.7199016 · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Up-Punjabi-Dhaba/store/5122b9 · cuisine: North Indian, Chinese · listing_rating: 4.9 · listing_reviews: 1 · checked_on: 2026-10-11 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur-Road' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). External listing rating 4.9/1 recorded with source URL + check date — NEVER a Foodie community value. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 165, 177, 202, 216, 218, 241 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.2700817, 77.7199016 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Up-Punjabi-Dhaba/store/5122b9. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 251: VR Cafeteria

- **Confidence:** medium
- **Input:** address: Near Hyundai Showroom, BB Road, Devanahalli, Bangalore, Doddaballapur Road, Bangalore, Bangalore · locality: Doddaballapur-Road · city: Bangalore · phone: +919066661231 · coords: 13.25587, 77.71664 · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Vr-Cafeteria/store/178cc97 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur-Road' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 179, 181, 183, 204, 205, 235 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.25587, 77.71664 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Vr-Cafeteria/store/178cc97. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 252: A1 fish center

- **Confidence:** medium
- **Input:** address: Doddaballapura, Karnataka 561203, Doddaballapur, Bangalore, Bangalore · locality: Doddaballapur · city: Bangalore · phone: +919731348145 · coords: 13.292752199999999, 77.5345287 · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/A1-Fish-Center/store/1831c63 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 281, 291, 292, 296, 306, 307, 318 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.292752199999999, 77.5345287 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/A1-Fish-Center/store/1831c63. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 253: Adarsha Chats

- **Confidence:** medium
- **Input:** address: Doddaballapura, Doddaballapur, Bangalore, Bangalore · locality: Doddaballapur · city: Bangalore · phone: +918105054688 · coords: 13.2986901, 77.5421995 · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Adarsha-Chats/store/543397 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 257, 260, 295 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.2986901, 77.5421995 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Adarsha-Chats/store/543397. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 254: An Pan Beeda

- **Confidence:** medium
- **Input:** address: 8G8Q+67C, Mallathahalli, Bengaluru, Doddaballapur, Bangalore, Bangalore · locality: Doddaballapur · city: Bangalore · phone: +919538927687 · coords: 13.3155512, 77.5381304 · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/An-Pan-Beeda/store/107b904 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 269, 280 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.3155512, 77.5381304 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/An-Pan-Beeda/store/107b904. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 257: Aparna Panipuri

- **Confidence:** medium
- **Input:** address: 46, Doddaballapura, Karnataka 561203, Doddaballapur, Bangalore, Bangalore · locality: Doddaballapur · city: Bangalore · phone: +917975068707 · coords: 13.2986605, 77.541117 · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Aparna-Panipuri/store/14605c1 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 253, 260, 295 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.2986605, 77.541117 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Aparna-Panipuri/store/14605c1. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 258: Bande Narayanappa Hotel

- **Confidence:** medium
- **Input:** address: Doddaballapura, Karnataka 561203, Doddaballapur, Bangalore, Bangalore · locality: Doddaballapur · city: Bangalore · coords: 13.292044299999999, 77.5396528 · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Bande-Narayanappa-Hotel/store/1835159 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 319 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.292044299999999, 77.5396528 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Bande-Narayanappa-Hotel/store/1835159. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 259: Bhadranna giri tiffen center

- **Confidence:** medium
- **Input:** address: 8G6R+W9C T B Circle, Gauribidanur Bypass Road, Doddaballapura, Karnataka 561203, Doddaballapur, Bangalore, Bangalore · locality: Doddaballapur · city: Bangalore · coords: 13.3123063, 77.5408958 · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Bhadranna-Giri-Tiffen-Center/store/3a12c26 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Matches to existing records:**
  - `fe248fda` **Priyanka Tiffen Center** · locality: Doddaballapura town — similarity 0.607 (name-ambiguous-proper-token) · existing coords: NULL — confidence low
- **Intra-file duplicates:** rows 267, 271 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.3123063, 77.5408958 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Bhadranna-Giri-Tiffen-Center/store/3a12c26. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `LOCALITY_CONFLICT`, `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 260: Bhadranna Tiffin Centre

- **Confidence:** medium
- **Input:** address: 7GXR+99H, Court Rd, Doddaballapura, Karnataka 561203, Doddaballapur, Bangalore, Bangalore · locality: Doddaballapur · city: Bangalore · coords: 13.2982154, 77.5409506 · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Bhadranna-Tiffin-Centre/store/3a12c35 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 253, 257, 295 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.2982154, 77.5409506 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Bhadranna-Tiffin-Centre/store/3a12c35. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 263: Bismilla Pan Centre

- **Confidence:** medium
- **Input:** address: 01, Doddaballapura, Karnataka 561203, Doddaballapur, Bangalore, Bangalore · locality: Doddaballapur · city: Bangalore · phone: +919538480780 · coords: 13.2732063, 77.5517261 · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Bismilla-Pan-Centre/store/1384370 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 131, 144 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.2732063, 77.5517261 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Bismilla-Pan-Centre/store/1384370. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 264: Brundhavana Grand Veg Restaurant Doddaballapur

- **Confidence:** low
- **Input:** address: Muthur Railway Station Gauribidanur Road, Doddaballapura, Bangalore, Karnataka 561203, Doddaballapur, Bangalore, Bangalore · locality: Doddaballapur · city: Bangalore · coords: 13.286319599999999, 77.551457 · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Brundhavana-Grand-Veg-Restaurant-Doddaballapur/store/2472737 · cuisine: Restaurant, Breakfast restaurant, Chinese restaurant, Family restaurant, North Indian restaurant, South Indian restaurant, Tiffin center, Vegetarian restaurant · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Matches to existing records:**
  - `987dad98` **Shri Manjunatha Grand Veg** · locality: Doddaballapura Railway Station — similarity 0.343 (name-ambiguous-proper-token) · existing coords: NULL — confidence low
- **Coordinates awaiting confirmation:** 13.286319599999999, 77.551457 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Brundhavana-Grand-Veg-Restaurant-Doddaballapur/store/2472737. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `LOCALITY_CONFLICT`
- **Recommended initial verification_status:** unverified

### Row 265: Bunny's Burgers And Fried Chicken

- **Confidence:** medium
- **Input:** address: 447, Alahalli, 4th Ward, Gangadharapura, Near Doddaballapura Locality, Doddaballapura, Doddaballapur, Bangalore, Bangalore · locality: Doddaballapur · city: Bangalore · phone: +917019309223 · coords: 13.3065854, 77.5426317 · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Bunnys-Burgers-And-Fried-Chicken/store/16b682c · cuisine: Burger, Fast Food · listing_rating: 4.7 · listing_reviews: 300 · checked_on: 2026-10-11 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). External listing rating 4.7/300 recorded with source URL + check date — NEVER a Foodie community value. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 266 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.3065854, 77.5426317 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Bunnys-Burgers-And-Fried-Chicken/store/16b682c. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 266: Bunny's Burgers'n fried chicken

- **Confidence:** medium
- **Input:** address: opposite to civil court, Doddaballapura, Karnataka 561203, Doddaballapur, Bangalore, Bangalore · locality: Doddaballapur · city: Bangalore · phone: +917019309223 · coords: 13.3063966, 77.5425775 · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Bunnys-Burgersn-Fried-Chicken/store/19b3753 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 265 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.3063966, 77.5425775 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Bunnys-Burgersn-Fried-Chicken/store/19b3753. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 267: Chaithra Tiffin Center

- **Confidence:** medium
- **Input:** address: 22, 562101, Nelamangala - Chikkaballapura, 4th Ward, Karnataka 561203, Doddaballapur, Bangalore, Bangalore · locality: Doddaballapur · city: Bangalore · phone: +919740497768 · coords: 13.311446499999999, 77.5417705 · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Chaithra-Tiffin-Center/store/3ca300c · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 259, 276 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.311446499999999, 77.5417705 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Chaithra-Tiffin-Center/store/3ca300c. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 269: Chitra Condiments

- **Confidence:** medium
- **Input:** address: 8G8Q+435, Palanajogalli, Gauribidanur Road, Doddaballapur, Bangalore, Bangalore · locality: Doddaballapur · city: Bangalore · phone: +919902074167 · coords: 13.3152672, 77.5377482 · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Chitra-Condiments/store/9997c2 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 254, 280 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.3152672, 77.5377482 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Chitra-Condiments/store/9997c2. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 270: Chowdeshwari tifan centre kantanakunte

- **Confidence:** medium
- **Input:** address: 8GPJ+WG4, SH 9, Kantanakunte, Vaddarahalli, Karnataka 561203, Doddaballapur, Bangalore, Bangalore · locality: Doddaballapur · city: Bangalore · coords: 13.337416399999999, 77.5314004 · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Chowdeshwari-Tifan-Centre-Kantanakunte/store/1b14741 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 315 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.337416399999999, 77.5314004 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Chowdeshwari-Tifan-Centre-Kantanakunte/store/1b14741. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 271: condiments and solutions

- **Confidence:** medium
- **Input:** address: 8G6R+X25, SH 9, Doddaballapura, Karnataka 561203, Doddaballapur, Bangalore, Bangalore · locality: Doddaballapur · city: Bangalore · coords: 13.3124413, 77.5400856 · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Condiments-And-Solutions/store/4848c58 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 259 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.3124413, 77.5400856 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Condiments-And-Solutions/store/4848c58. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 272: Cooking Contract And Catering

- **Confidence:** medium
- **Input:** address: Talagavara, Chikaballapura, Doddaballapur, Bangalore, Bangalore · locality: Doddaballapur · city: Bangalore · phone: +919164432061 · coords: 13.3016965, 77.4931403 · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Cooking-Contract-And-Catering/store/13b9274 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 297 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.3016965, 77.4931403 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Cooking-Contract-And-Catering/store/13b9274. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 273: Doon Punjabi Family Dhaba Veg

- **Confidence:** medium
- **Input:** address: SHRINIVAS NURSERY, Kestur, Karnataka 561203, Doddaballapur, Bangalore, Bangalore · locality: Doddaballapur · city: Bangalore · phone: +917975650751 · coords: 13.2995682, 77.4903897 · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Doon-Punjabi-Family-Dhaba-Veg/store/184aa81 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 218 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.2995682, 77.4903897 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Doon-Punjabi-Family-Dhaba-Veg/store/184aa81. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 276: Food truck BMW (best meal on wheels) by chef Nagesh

- **Confidence:** medium
- **Input:** address: 8G6R+88C, Doddaballapura, Pindakuru Thimmanahalli, Karnataka 561203, Doddaballapur, Bangalore, Bangalore · locality: Doddaballapur · city: Bangalore · coords: 13.310824799999999, 77.54077939999999 · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Food-Truck-Bmw-(Best-Meal-On-Wheels)-By-Chef-Nagesh/store/1a62571 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 267 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.310824799999999, 77.54077939999999 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Food-Truck-Bmw-(Best-Meal-On-Wheels)-By-Chef-Nagesh/store/1a62571. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 277: Hallimane Hotel

- **Confidence:** medium
- **Input:** address: Shanthinagara, Kucchappapet Road, Doddaballapur, Bangalore, Bangalore · locality: Doddaballapur · city: Bangalore · coords: 13.2900874, 77.5390609 · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Hallimane-Hotel/store/543386 · listing_rating: 3.9 · listing_reviews: 3 · checked_on: 2026-10-11 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). External listing rating 3.9/3 recorded with source URL + check date — NEVER a Foodie community value. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 288 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.2900874, 77.5390609 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Hallimane-Hotel/store/543386. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 280: Harsha Condiments

- **Confidence:** medium
- **Input:** address: Mallathahalli, Doddaballapur, Bangalore, Bangalore · locality: Doddaballapur · city: Bangalore · phone: +919448079997 · coords: 13.3153775, 77.5380315 · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Harsha-Condiments/store/108436c · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 254, 269 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.3153775, 77.5380315 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Harsha-Condiments/store/108436c. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 281: KAVITHA RS

- **Confidence:** medium
- **Input:** address: Dodsbalallpura, 7, Karnataka 561203, Doddaballapur, Bangalore, Bangalore · locality: Doddaballapur · city: Bangalore · phone: +916366479791 · coords: 13.2935406, 77.5346428 · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Kavitha-Rs/store/4473a95 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 252, 291, 292, 296, 307, 318 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.2935406, 77.5346428 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Kavitha-Rs/store/4473a95. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 285: Madhu Mess

- **Confidence:** medium
- **Input:** address: Dcross Road Doddballapur, Near Ayyappa Swamy Temple Road, Bengaluru, Doddaballapur, Bangalore, Bangalore · locality: Doddaballapur · city: Bangalore · phone: +919036159833 · coords: 13.3045159, 77.5449727 · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Madhu-Mess/store/968a92 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 300 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.3045159, 77.5449727 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Madhu-Mess/store/968a92. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 288: Manju bar and restaurant

- **Confidence:** medium
- **Input:** address: 3 rd cross, D Cross Rd, behind petrol bunk, Shanthinagar, Doddaballapura, Karnataka 561203, Doddaballapur, Bangalore, Bangalore · locality: Doddaballapur · city: Bangalore · phone: +918945637867 · coords: 13.289440899999999, 77.5396415 · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Manju-Bar-And-Restaurant/store/1940b70 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 277 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.289440899999999, 77.5396415 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Manju-Bar-And-Restaurant/store/1940b70. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 290: Manjunatha Hotel

- **Confidence:** medium
- **Input:** address: Near Kanakadasa Circle, Nelamangla Road, Doddaballapur, Bangalore-561203, Karnataka, Doddaballapur, Bangalore, Bangalore · locality: Doddaballapur · city: Bangalore · phone: +919739215666 · coords: 13.2893749, 77.5437629 · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Manjunatha-Hotel/store/1808063 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Matches to existing records:**
  - `987dad98` **Shri Manjunatha Grand Veg** · locality: Doddaballapura Railway Station — similarity 0.5 (name-ambiguous-proper-token) · existing coords: NULL — confidence low
- **Intra-file duplicates:** rows 304, 309 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.2893749, 77.5437629 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Manjunatha-Hotel/store/1808063. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `LOCALITY_CONFLICT`, `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 291: Meher Chicken Center

- **Confidence:** medium
- **Input:** address: 7GVM+CWR, Sri Kongadiyappa College Rd, Chaitanya Nagar, Doddaballapura, Karnataka 561203, Doddaballapur, Bangalore, Bangalore · locality: Doddaballapur · city: Bangalore · phone: +919342528272 · coords: 13.2936096, 77.5347807 · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Meher-Chicken-Center/store/33380b4 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 252, 281, 292, 296, 318 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.2936096, 77.5347807 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Meher-Chicken-Center/store/33380b4. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 292: Mtr Iyengar Bakery-Sweets & Chats

- **Confidence:** medium
- **Input:** address: Doddaballapura, Karnataka 561203, Doddaballapur, Bangalore, Bangalore · locality: Doddaballapur · city: Bangalore · coords: 13.2933693, 77.5346149 · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Mtr-Iyengar-Bakery-sweets-and-Chats/store/1b07ca5 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 252, 281, 291, 296, 306, 307, 318 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.2933693, 77.5346149 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Mtr-Iyengar-Bakery-sweets-and-Chats/store/1b07ca5. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 293: Nandi Paradise

- **Confidence:** medium
- **Input:** address: Doddaballapur To Nandhi Hills, Doddaballapur, Bangalore, Bangalore · locality: Doddaballapur · city: Bangalore · phone: +919845242623 · coords: 13.313799, 77.5463952 · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Nandi-Paradise/store/5122c5 · listing_rating: 3.5 · listing_reviews: 2 · checked_on: 2026-10-11 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). External listing rating 3.5/2 recorded with source URL + check date — NEVER a Foodie community value. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 294 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.313799, 77.5463952 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Nandi-Paradise/store/5122c5. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 294: Nandhi Paradise

- **Confidence:** medium
- **Input:** address: Nandi hills, road, Doddaballapura, Karnataka 561203, Doddaballapur, Bangalore, Bangalore · locality: Doddaballapur · city: Bangalore · phone: +919845242623 · coords: 13.314012527778, 77.546470638889 · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Nandhi-Paradise/store/1831a2a · cuisine: Restaurant · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 293 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.314012527778, 77.546470638889 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Nandhi-Paradise/store/1831a2a. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 295: Nandini K

- **Confidence:** medium
- **Input:** address: 46, Doddaballapura, Karnataka 561203, Doddaballapur, Bangalore, Bangalore · locality: Doddaballapur · city: Bangalore · phone: +919353268525 · coords: 13.2986589, 77.541117 · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Nandini-K/store/14728bc · cuisine: Biryani, Chinese, North Indian · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 253, 257, 260 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.2986589, 77.541117 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Nandini-K/store/14728bc. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 296: NAWAZ BIRYANI KAKAB CENTRE

- **Confidence:** medium
- **Input:** address: 7GVM+FX4, Doddaballapura, Karnataka 561203, Doddaballapur, Bangalore, Bangalore · locality: Doddaballapur · city: Bangalore · coords: 13.293602199999999, 77.5350378 · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Nawaz-Biryani-Kakab-Centre/store/4087923 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 252, 281, 291, 292, 318 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.293602199999999, 77.5350378 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Nawaz-Biryani-Kakab-Centre/store/4087923. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 297: Nireeh Foods Pvt Ltd

- **Confidence:** medium
- **Input:** address: 19/3, Talagavara, Bengaluru, Doddaballapur, Bangalore, Bangalore · locality: Doddaballapur · city: Bangalore · phone: +918035928325 · coords: 13.3016965, 77.4931403 · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Nireeh-Foods-Pvt-Ltd/store/1473172 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 272 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.3016965, 77.4931403 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Nireeh-Foods-Pvt-Ltd/store/1473172. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 300: Prince Chai

- **Confidence:** medium
- **Input:** address: 8G3V+CPQ, D Cross Rd, Doddaballapura, Karnataka 561203, Doddaballapur, Bangalore, Bangalore · locality: Doddaballapur · city: Bangalore · coords: 13.3035932, 77.5443438 · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Prince-Chai/store/4828591 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 285 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.3035932, 77.5443438 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Prince-Chai/store/4828591. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 301: Priyanka's Kitchen Corner

- **Confidence:** medium
- **Input:** address: 1st Floor, Kiadb Industrial Area, 3rd Cross, MA Prakash Layout, Opposite Of SMS Apartment, Doddaballapura Locality, Doddaballapura, Doddaballapur, Bangalore, Bangalore · locality: Doddaballapur · city: Bangalore · phone: +919777903606 · coords: 13.2781924, 77.5566928 · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Priyankas-Kitchen-Corner/store/16b6835 · cuisine: North Indian, Chinese, Biryani · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 132 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.2781924, 77.5566928 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Priyankas-Kitchen-Corner/store/16b6835. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 303: Repeat Taste

- **Confidence:** medium
- **Input:** address: 64, Infocity 1, Raghunathpur, Doddaballapura Locality, Doddaballapura, Doddaballapur, Bangalore, Bangalore · locality: Doddaballapur · city: Bangalore · phone: +918660803413 · coords: 13.28727155, 77.57698417 · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Repeat-Taste/store/1572250 · cuisine: South Indian, Chinese, North Indian · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 141 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.28727155, 77.57698417 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Repeat-Taste/store/1572250. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 304: S.L.V. COFFEE BAR

- **Confidence:** medium
- **Input:** address: 496, Tank Rd, Shanthinagar, Doddaballapura, Karnataka 561203, Doddaballapur, Bangalore, Bangalore · locality: Doddaballapur · city: Bangalore · coords: 13.289495899999999, 77.5435675 · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/S.l.v.-Coffee-Bar/store/1b0c8a9 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 290 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.289495899999999, 77.5435675 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/S.l.v.-Coffee-Bar/store/1b0c8a9. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 306: SGS Non Veg Gundu Palav

- **Confidence:** medium
- **Input:** address: Ground Floor, Kongadiappa College Road, Doddaballapura Locality, Doddaballapura, Doddaballapur, Bangalore, Bangalore · locality: Doddaballapur · city: Bangalore · phone: +917353995401 · coords: 13.2921126301, 77.5342032437 · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Sgs-Non-Veg-Gundu-Palav/store/1794b95 · listing_rating: 3.8 · listing_reviews: 563 · checked_on: 2026-10-11 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). External listing rating 3.8/563 recorded with source URL + check date — NEVER a Foodie community value. Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 252, 292, 307, 318 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.2921126301, 77.5342032437 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Sgs-Non-Veg-Gundu-Palav/store/1794b95. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 307: SGS Nonveg Gundu Palav @Doddaballapur

- **Confidence:** medium
- **Input:** address: SGS Non-Veg Gundu Palav, Sri Kongadiyappa College Rd, opposite to National Pride School, Tyagaraj nagar, Doddaballapura, Karnataka 561203, Doddaballapur, Bangalore, Bangalore · locality: Doddaballapur · city: Bangalore · coords: 13.2923341, 77.5342812 · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Sgs-Nonveg-Gundu-Palav-@Doddaballapur/store/204572a · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 252, 281, 292, 306, 318 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.2923341, 77.5342812 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Sgs-Nonveg-Gundu-Palav-@Doddaballapur/store/204572a. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 309: Shri manjunatha hotel

- **Confidence:** medium
- **Input:** address: Shri manjunatha hotel, Sri Kongadiyappa College Road Doddaballapur, Doddaballapur, Bangalore, Bangalore · locality: Doddaballapur · city: Bangalore · phone: +919739215666 · coords: 13.284286999999999, 77.5316471 · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Shri-Manjunatha-Hotel/store/1832850 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Matches to existing records:**
  - `987dad98` **Shri Manjunatha Grand Veg** · locality: Doddaballapura Railway Station — similarity 0.5 (name-ambiguous-proper-token) · existing coords: NULL — confidence low
- **Intra-file duplicates:** rows 290 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.284286999999999, 77.5316471 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Shri-Manjunatha-Hotel/store/1832850. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `LOCALITY_CONFLICT`, `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 310: Sihi Catering service Doddaballapura

- **Confidence:** medium
- **Input:** address: near ganesha temple, basaveshwara nagara, Doddaballapura, Karnataka 561203, Doddaballapur, Bangalore, Bangalore · locality: Doddaballapur · city: Bangalore · phone: +919035590255 · coords: 13.2927312, 77.5438756 · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Sihi-Catering-Service-Doddaballapura/store/190a470 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 311 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.2927312, 77.5438756 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Sihi-Catering-Service-Doddaballapura/store/190a470. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 311: Sihi Catering Services

- **Confidence:** medium
- **Input:** address: Near Ganesha Temple, Basaweshara Nagar 2nd Ward Main Road Town, Doddaballapur, Bangalore-561203, Karnataka, Doddaballapur, Bangalore, Bangalore · locality: Doddaballapur · city: Bangalore · phone: +919035590255 · coords: 13.2927312, 77.5438756 · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Sihi-Catering-Services/store/18030b5 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 310 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.2927312, 77.5438756 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Sihi-Catering-Services/store/18030b5. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 313: Sri Balaji Dhaba

- **Confidence:** medium
- **Input:** address: Doddaballapura, Tumkur, Khb Colony, Basaveshwar Nagar, Bengaluru, Chord Road, Doddaballapur, Bangalore, Bangalore · locality: Doddaballapur · city: Bangalore · phone: +919886875998 · coords: 13.3074446, 77.534155 · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Sri-Balaji-Dhaba/store/5122c3 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 314, 322 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.3074446, 77.534155 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Sri-Balaji-Dhaba/store/5122c3. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 314: Sri Sai Bake

- **Confidence:** medium
- **Input:** address: Doddaballapura, Karnataka 561203, Doddaballapur, Bangalore, Bangalore · locality: Doddaballapur · city: Bangalore · coords: 13.3072085, 77.53409049999999 · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Sri-Sai-Bake/store/1833573 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 313, 322 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.3072085, 77.53409049999999 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Sri-Sai-Bake/store/1833573. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 315: Sri Venkateshwar Tiffin Centre

- **Confidence:** medium
- **Input:** address: 8GPJ+GJG, Kanakunte, Doddaballapura, Vaddarahalli, Karnataka 561203, Doddaballapur, Bangalore, Bangalore · locality: Doddaballapur · city: Bangalore · coords: 13.3363024, 77.5315663 · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Sri-Venkateshwar-Tiffin-Centre/store/1b02cb1 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 270 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.3363024, 77.5315663 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Sri-Venkateshwar-Tiffin-Centre/store/1b02cb1. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 316: Sri Venkateshwara Non Veg Hotel

- **Confidence:** medium
- **Input:** address: Sri venkateshwara non veg hotel, Jalappa College Main Road, Dodda Ballapura, Bengaluru, Karnataka 561203, Doddaballapur, Bangalore, Bangalore · locality: Doddaballapur · city: Bangalore · phone: +919741322742 · coords: 13.301449, 77.51762 · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Sri-Venkateshwara-Non-Veg-Hotel/store/1849211 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 511 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.301449, 77.51762 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Sri-Venkateshwara-Non-Veg-Hotel/store/1849211. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 318: The Royal Juice And Chai

- **Confidence:** medium
- **Input:** address: 45, Sri Kongadiyappa College Rd, Chaitanya Nagar, Doddaballapura, Karnataka 561203, Doddaballapur, Bangalore, Bangalore · locality: Doddaballapur · city: Bangalore · phone: +916360493318 · coords: 13.293252899999999, 77.5345555 · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/The-Royal-Juice-And-Chai/store/19927ab · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 252, 281, 291, 292, 296, 306, 307 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.293252899999999, 77.5345555 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/The-Royal-Juice-And-Chai/store/19927ab. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 319: Two Brother Catering & Service

- **Confidence:** medium
- **Input:** address: Palana Jogihalli Doddaballapura, Doddaballapur, Bangalore, Bangalore · locality: Doddaballapur · city: Bangalore · phone: +917892716669 · coords: 13.2927263, 77.538907 · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Two-Brother-Catering-and-Service/store/1213905 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 258 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.2927263, 77.538907 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Two-Brother-Catering-and-Service/store/1213905. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 320: Udupi Krishna Dhama Veg Restaurant

- **Confidence:** medium
- **Input:** address: No. 75, Near Railway Station,  Behind Apperal Park, Main Road, Doddaballapur, Bangalore-561203, Karnataka, Doddaballapur, Bangalore, Bangalore · locality: Doddaballapur · city: Bangalore · phone: +918762541166 · coords: 13.3176394, 77.5380925 · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Udupi-Krishna-Dhama-Veg-Restaurant/store/1803404 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 144 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.3176394, 77.5380925 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Udupi-Krishna-Dhama-Veg-Restaurant/store/1803404. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 322: V.S.Wine Tavern

- **Confidence:** medium
- **Input:** address: Doddaballapura, Karnataka 561203, Doddaballapur, Bangalore, Bangalore · locality: Doddaballapur · city: Bangalore · coords: 13.3076403, 77.53477629999999 · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/V.s.wine-Tavern/store/1b718a6 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Doddaballapur' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 313, 314 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.3076403, 77.53477629999999 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/V.s.wine-Tavern/store/1b718a6. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 324: Rajanukunte Donne Biriyani

- **Confidence:** medium
- **Input:** address: Avalahalli, Doddaballapura Main Road, Near BMSIT College, Yelahanka, Bangalore, Nagenahalli, Bangalore, Bangalore · locality: Nagenahalli · city: Bangalore · coords: 13.1334442375, 77.569721245 · source: https://magicpin.in/Bangalore/Nagenahalli/Restaurant/Rajanukunte-Donne-Biriyani/store/2b09352 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Nagenahalli' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 465 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.1334442375, 77.569721245 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Nagenahalli/Restaurant/Rajanukunte-Donne-Biriyani/store/2b09352. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 328: Bashveshwara Chats

- **Confidence:** medium
- **Input:** address: 3, Sondekoppa Main Rd, opposite to S J Iyengar Bakery, Venkatapura, Bengaluru, Karnataka 562162, Soladevanahalli, Bangalore, Bangalore · locality: Soladevanahalli · city: Bangalore · phone: +916362291256 · coords: 13.059339699999999, 77.3936176 · source: https://magicpin.in/Bangalore/Soladevanahalli/Restaurant/Bashveshwara-Chats/store/197c6b5 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Soladevanahalli' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 337, 345, 347 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.059339699999999, 77.3936176 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Soladevanahalli/Restaurant/Bashveshwara-Chats/store/197c6b5. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 330: Annapoorna Fresh Sweets Mr KAUSHIK MAKHAL

- **Confidence:** medium
- **Input:** address: No 85 Tavarekere Main Road, Sondekoppa Main Rd, Bengaluru, Nelamangala Town, Karnataka 562130, Soladevanahalli, Bangalore, Bangalore · locality: Soladevanahalli · city: Bangalore · phone: +919064201927 · coords: 13.0295091, 77.38732949999999 · source: https://magicpin.in/Bangalore/Soladevanahalli/Restaurant/Annapoorna-Fresh-Sweets-Mr-Kaushik-Makhal/store/1976298 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Soladevanahalli' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 335 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.0295091, 77.38732949999999 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Soladevanahalli/Restaurant/Annapoorna-Fresh-Sweets-Mr-Kaushik-Makhal/store/1976298. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 335: Khamadhenu benne dose hotel

- **Confidence:** medium
- **Input:** address: 29HP+PX2, Sondekoppa, Mantana Kurchi, Karnataka 562130, Soladevanahalli, Bangalore, Bangalore · locality: Soladevanahalli · city: Bangalore · phone: +919036202983 · coords: 13.029262399999999, 77.3873808 · source: https://magicpin.in/Bangalore/Soladevanahalli/Restaurant/Khamadhenu-Benne-Dose-Hotel/store/426a3b0 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Soladevanahalli' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 330 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.029262399999999, 77.3873808 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Soladevanahalli/Restaurant/Khamadhenu-Benne-Dose-Hotel/store/426a3b0. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 337: MSIL MRP OUTLET

- **Confidence:** medium
- **Input:** address: 395V+JF5, Cross, Hullegowdana Halli, Venkatapura, Bengaluru, Karnataka 562162, Soladevanahalli, Bangalore, Bangalore · locality: Soladevanahalli · city: Bangalore · coords: 13.0590239, 77.3937266 · source: https://magicpin.in/Bangalore/Soladevanahalli/Restaurant/Msil-Mrp-Outlet/store/1a54454 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Soladevanahalli' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 328, 345, 347 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.0590239, 77.3937266 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Soladevanahalli/Restaurant/Msil-Mrp-Outlet/store/1a54454. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 339: Parampara Restaurant

- **Confidence:** medium
- **Input:** address: Shop #3 MSPP Colony Rd- soladevanahalli main road , Soladevanahalli, Bangalore, Bangalore · locality: Soladevanahalli · city: Bangalore · phone: +918792539785 · coords: 13.0875901, 77.4876615 · source: https://magicpin.in/Bangalore/Soladevanahalli/Restaurant/Parampara-Restaurant/store/17a2513 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Soladevanahalli' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 340 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.0875901, 77.4876615 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Soladevanahalli/Restaurant/Parampara-Restaurant/store/17a2513. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 340: Parampara

- **Confidence:** medium
- **Input:** address: Shop #3 MSPP colony Rd, Soladevanahalli maim road, Soladevanahalli, Bangalore, Bangalore · locality: Soladevanahalli · city: Bangalore · phone: +918792539785 · coords: 13.0885831, 77.48789769999999 · source: https://magicpin.in/Bangalore/Soladevanahalli/Restaurant/Parampara/store/17a2512 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Soladevanahalli' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 339 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.0885831, 77.48789769999999 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Soladevanahalli/Restaurant/Parampara/store/17a2512. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 341: Rayappa

- **Confidence:** medium
- **Input:** address: 165 2nd cross 1st main Ragavendra Layout Chikkabanavara , Soladevanahalli, Bangalore, Bangalore · locality: Soladevanahalli · city: Bangalore · phone: +919480592861 · coords: 13.0715153, 77.5165621 · source: https://magicpin.in/Bangalore/Soladevanahalli/Restaurant/Rayappa/store/182cc64 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Soladevanahalli' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 342 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.0715153, 77.5165621 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Soladevanahalli/Restaurant/Rayappa/store/182cc64. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 342: Savitha R

- **Confidence:** medium
- **Input:** address: 165 1main road 2nd cross Ragavendra Layout Near Krishna College Chikkabanavara , Soladevanahalli, Bangalore, Bangalore · locality: Soladevanahalli · city: Bangalore · phone: +919194805928 · coords: 13.070779112287031, 77.51578901438117 · source: https://magicpin.in/Bangalore/Soladevanahalli/Restaurant/Savitha-R/store/17ca440 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Soladevanahalli' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 341 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.070779112287031, 77.51578901438117 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Soladevanahalli/Restaurant/Savitha-R/store/17ca440. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 343: Shiva Udipi Hotel

- **Confidence:** medium
- **Input:** address: 24, 2nd Cross, Avaragere Colony, Near Maa Gayatri Mandir, Mysore Road, Bangalore, Soladevanahalli, Bangalore, Bangalore · locality: Soladevanahalli · city: Bangalore · phone: +917996187534 · coords: 13.061858885747247, 77.38271275807155 · source: https://magicpin.in/Bangalore/Soladevanahalli/Restaurant/Shiva-Udipi-Hotel/store/170baaa · cuisine: South Indian · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Soladevanahalli' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 344 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.061858885747247, 77.38271275807155 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Soladevanahalli/Restaurant/Shiva-Udipi-Hotel/store/170baaa. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 344: Shiva Restaurant

- **Confidence:** medium
- **Input:** address: 24, Ground Floor, Avaragere Colony, 2nd Cross, Bidadi, Near Maa Gayatri Mandir, Avalahalli, Bangalore, Soladevanahalli, Bangalore, Bangalore · locality: Soladevanahalli · city: Bangalore · phone: +917026602962 · coords: 13.061892605226939, 77.38269113196701 · source: https://magicpin.in/Bangalore/Soladevanahalli/Restaurant/Shiva-Restaurant/store/170baac · cuisine: North Indian, Chinese · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Soladevanahalli' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 343 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.061892605226939, 77.38269113196701 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Soladevanahalli/Restaurant/Shiva-Restaurant/store/170baac. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 345: Shree Krishna Bar & Restaurant

- **Confidence:** medium
- **Input:** address: 395V+Cj2, Hullegowdanahalli Cross, Venkatapura, Soladevanahalli, Bangalore, Bangalore · locality: Soladevanahalli · city: Bangalore · coords: 13.0585049, 77.3940034 · source: https://magicpin.in/Bangalore/Soladevanahalli/Restaurant/Shree-Krishna-Bar-and-Restaurant/store/b7ba57 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Soladevanahalli' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 328, 337, 347 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.0585049, 77.3940034 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Soladevanahalli/Restaurant/Shree-Krishna-Bar-and-Restaurant/store/b7ba57. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 347: SJ BAKERY

- **Confidence:** medium
- **Input:** address: Bengaluru, Venkatapura, Karnataka 562162, Soladevanahalli, Bangalore, Bangalore · locality: Soladevanahalli · city: Bangalore · phone: +919148314459 · coords: 13.0593516, 77.3939608 · source: https://magicpin.in/Bangalore/Soladevanahalli/Restaurant/Sj-Bakery/store/19a304b · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Soladevanahalli' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 328, 337, 345 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.0593516, 77.3939608 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Soladevanahalli/Restaurant/Sj-Bakery/store/19a304b. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 348: 1997 Hotel Coorg Special

- **Confidence:** medium
- **Input:** address: 60/15, Rajanakunte, Yelahanka, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · coords: 13.172031, 77.559616 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/1997-Hotel-Coorg-Special/store/1557c4a · cuisine: Assamese, South Indian · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 352, 364, 365, 439, 442, 514, 515, 516 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.172031, 77.559616 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/1997-Hotel-Coorg-Special/store/1557c4a. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 349: Sri Chowdeshwari Chicken Center

- **Confidence:** medium
- **Input:** address: Averahalli Cross, Near Ravathna Halli, Dasanapura Hobli, Kittanahalli Post, Bangalore North - 562130, 562162, Soladevanahalli, Bangalore, Bangalore · locality: Soladevanahalli · city: Bangalore · phone: +918105805917 · coords: 13.0330959, 77.420962 · source: https://magicpin.in/Bangalore/Soladevanahalli/Restaurant/Sri-Chowdeshwari-Chicken-Center/store/19781aa · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Soladevanahalli' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 497 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.0330959, 77.420962 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Soladevanahalli/Restaurant/Sri-Chowdeshwari-Chicken-Center/store/19781aa. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 351: 7th Mile

- **Confidence:** medium
- **Input:** address: Ground Floor, Dibbur Main Road, Rajanukunte, Yelahanka, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · phone: +919686416777 · coords: 13.1725077, 77.53232563 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/7th-Mile/store/1744881 · cuisine: South Indian, Biryani, Chinese · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 374, 388, 452, 541, 542 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.1725077, 77.53232563 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/7th-Mile/store/1744881. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 352: Aice Spice Cafe

- **Confidence:** medium
- **Input:** address: 1, Venugopal Swamy Layout, Rajanukunte, Kakolu Road, Yelahanka, Bangalore, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · phone: +918884899998 · coords: 13.1721799, 77.5609492 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Aice-Spice-Cafe/store/1552080 · cuisine: Sandwich, Burger, Momos, Street Food, Fast Food · listing_rating: 3.7 · listing_reviews: 4 · checked_on: 2026-10-11 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). External listing rating 3.7/4 recorded with source URL + check date — NEVER a Foodie community value. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 348, 364, 371, 373, 378, 381, 384, 392, 403, 407, 410, 413, 414, 419, 430, 439, 442, 450, 451, 457, 470, 480, 489, 498, 506, 512, 515, 516, 519, 525, 529, 549, 551 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.1721799, 77.5609492 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Aice-Spice-Cafe/store/1552080. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 353: AKSHAYA JUICE & CONDIMENTS

- **Confidence:** medium
- **Input:** address: Suryodaya Layout, Rajanukunte, Karnataka 560119, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · coords: 13.1707337, 77.5643767 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Akshaya-Juice-and-Condiments/store/1acc149 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 361, 447, 465, 472, 484, 485, 494, 507, 510, 526 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.1707337, 77.5643767 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Akshaya-Juice-and-Condiments/store/1acc149. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 354: All Things Homemade

- **Confidence:** medium
- **Input:** address: Villa 7, Aakruthi Solitaire, Rajanukunte, Doddaballapur Road, Yelahanka, Bangalore, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · phone: +918310693173 · coords: 13.181387, 77.5619614 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/All-Things-Homemade/store/1670644 · cuisine: Healthy Food · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 454 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.181387, 77.5619614 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/All-Things-Homemade/store/1670644. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 355: AMBUR HOT BIRIYANI

- **Confidence:** medium
- **Input:** address: Rajanukunte, Karnataka 560119, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · coords: 13.1726309, 77.56453139999999 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Ambur-Hot-Biriyani/store/1b16a37 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 361, 404, 411, 447, 465, 484, 485, 488, 501, 504, 508, 510 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.1726309, 77.56453139999999 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Ambur-Hot-Biriyani/store/1b16a37. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 358: Annapurneshwari Bramins Tiffins

- **Confidence:** medium
- **Input:** address: 05, Shop 5, 6 & 7, Ground Floor, Shiva Complex, Opposite Presidency University, Kakol Road, Hesaraghatta, Bangalore, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · coords: 13.1720045, 77.5357667 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Annapurneshwari-Bramins-Tiffins/store/15957b1 · cuisine: South Indian, Chinese, North Indian · listing_rating: 3.7 · listing_reviews: 129 · checked_on: 2026-10-11 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). External listing rating 3.7/129 recorded with source URL + check date — NEVER a Foodie community value. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 368, 383, 386, 387, 398, 402, 412, 415, 416, 421, 467, 493, 523, 524, 533, 534, 538, 543, 546, 547, 548 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.1720045, 77.5357667 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Annapurneshwari-Bramins-Tiffins/store/15957b1. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 359: Asha Home Made Food

- **Confidence:** medium
- **Input:** address: Room 04, 1st Floor, Revansiddeshwar Nilaya, Rajanukunte, Adde Vishwanathapura Road, Near Ganesh Medical, Yelahanka, Bangalore, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · phone: +918197046326 · coords: 13.1735304606, 77.5609267876 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Asha-Home-Made-Food/store/179b315 · cuisine: Home Delivery · listing_rating: 4.5 · listing_reviews: 200 · checked_on: 2026-10-11 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). External listing rating 4.5/200 recorded with source URL + check date — NEVER a Foodie community value. Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 371, 384, 392, 403, 407, 410, 413, 419, 430, 480, 489, 498, 512, 519, 529, 549, 551 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.1735304606, 77.5609267876 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Asha-Home-Made-Food/store/179b315. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 360: Atithi Grand Nati Style

- **Confidence:** medium
- **Input:** address: 5GFH+48Q, Dibbur, Rajanukunte, Karnataka 560089, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · coords: 13.1728407, 77.5283547 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Atithi-Grand-Nati-Style/store/1b082b8 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 363, 482, 483 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.1728407, 77.5283547 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Atithi-Grand-Nati-Style/store/1b082b8. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 361: Bangarpet Chats

- **Confidence:** medium
- **Input:** address: 679, Sangeetha Complex, Rajankunte, Vishwanthapura Main Road, Yelahanka, Bangalore, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · phone: +919206610161 · coords: 13.1718518, 77.564489 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Bangarpet-Chats/store/1595c84 · cuisine: Street Food · listing_rating: 3 · listing_reviews: 22 · checked_on: 2026-10-11 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). External listing rating 3/22 recorded with source URL + check date — NEVER a Foodie community value. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 8, 353, 355, 362, 404, 411, 447, 465, 472, 484, 485, 488, 501, 504, 508, 510, 526 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.1718518, 77.564489 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Bangarpet-Chats/store/1595c84. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 362: Bangarpete Chaats

- **Confidence:** medium
- **Input:** address: Rajunkunte, Kakolu Road, Yelahanka, Bangalore, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · phone: +919206610161 · coords: 13.17252368, 77.56258808 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Bangarpete-Chaats/store/1687029 · cuisine: Street Food · listing_rating: 4.2 · listing_reviews: 320 · checked_on: 2026-10-11 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). External listing rating 4.2/320 recorded with source URL + check date — NEVER a Foodie community value. Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 8, 361, 371, 373, 378, 381, 384, 392, 403, 407, 410, 413, 414, 422, 424, 430, 450, 451, 457, 470, 478, 480, 489, 496, 498, 519, 525, 529, 549, 551 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.17252368, 77.56258808 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Bangarpete-Chaats/store/1687029. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 363: Basaveshwara Upahara Mandira

- **Confidence:** medium
- **Input:** address: 5GFH+2PR, Madhure Temple Road, Dibbur, Karnataka 560089, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · coords: 13.1726049, 77.5292786 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Basaveshwara-Upahara-Mandira/store/1b15b90 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 360, 375, 390, 391, 417, 436, 482, 483, 497, 505, 528, 537 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.1726049, 77.5292786 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Basaveshwara-Upahara-Mandira/store/1b15b90. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 364: Bawarchi Kabab Corner

- **Confidence:** medium
- **Input:** address: Kakolu Road, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · phone: +918123941376 · coords: 13.17198633, 77.56082285 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Bawarchi-Kabab-Corner/store/bab004 · cuisine: North Indian, Biryani, Kebab · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 348, 352, 371, 373, 378, 384, 392, 403, 407, 410, 413, 414, 430, 439, 442, 450, 457, 480, 489, 498, 506, 515, 516, 519, 529, 549, 551 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.17198633, 77.56082285 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Bawarchi-Kabab-Corner/store/bab004. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 365: Benne Dosa Camp

- **Confidence:** medium
- **Input:** address: 5HC5+JF5, Rajanukunte, Karnataka 560119, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · phone: +918142797392 · coords: 13.1715158, 77.55871979999999 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Benne-Dosa-Camp/store/19a5884 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 348, 460, 502, 514, 515, 516 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.1715158, 77.55871979999999 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Benne-Dosa-Camp/store/19a5884. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 366: Bhoosiri Dum Biryani And Food Point

- **Confidence:** medium
- **Input:** address: Rajanukunte, Chokkanahalli Bus Stop, Yelahanka, Bangalore, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · phone: +919066703328 · coords: 13.174144, 77.5403056 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Bhoosiri-Dum-Biryani-And-Food-Point/store/16689a5 · cuisine: Biryani, South Indian, Kebab · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 367, 377, 401, 427, 433, 517 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.174144, 77.5403056 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Bhoosiri-Dum-Biryani-And-Food-Point/store/16689a5. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 367: Bhoosiri Dum Biryani & Food Point

- **Confidence:** medium
- **Input:** address: Bus Stop, opp. Chokkanahalli Main Road, near PRESIDENCY UNIVERSITY, Rajanukunte, Bengaluru, Karnataka 560119, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · phone: +919066703328 · coords: 13.174144, 77.5403056 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Bhoosiri-Dum-Biryani-and-Food-Point/store/1993622 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 366, 377, 401, 427, 433, 517 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.174144, 77.5403056 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Bhoosiri-Dum-Biryani-and-Food-Point/store/1993622. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 368: Big Bo Cafe

- **Confidence:** medium
- **Input:** address: Shop No -04, Madhure Temple Road, near PRESIDENCY UNIVERSITY, Chokkanahalli, Bengaluru, Karnataka 560089, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · coords: 13.1728028, 77.53647339999999 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Big-Bo-Cafe/store/3b58350 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 358, 383, 386, 387, 398, 400, 412, 415, 416, 421, 467, 493, 503, 523, 524, 533, 538, 543, 546, 548 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.1728028, 77.53647339999999 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Big-Bo-Cafe/store/3b58350. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 369: Biriyani House

- **Confidence:** medium
- **Input:** address: Surdenapura, Yelahanka, Bangalore, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · phone: +919663411966 · coords: 13.19500618, 77.55227499 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Biriyani-House/store/1671721 · cuisine: Biryani, South Indian, Chinese, Shakes · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 131 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.19500618, 77.55227499 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Biriyani-House/store/1671721. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 371: Burger It Up

- **Confidence:** medium
- **Input:** address: Rajanukunte, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · phone: +917411908515 · coords: 13.173067, 77.561563 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Burger-It-Up/store/1741711 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 352, 359, 362, 364, 373, 378, 381, 384, 392, 403, 407, 410, 413, 414, 419, 422, 424, 430, 450, 451, 457, 470, 478, 480, 489, 496, 498, 506, 512, 519, 525, 529, 549, 551 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.173067, 77.561563 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Burger-It-Up/store/1741711. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 372: Cafe Coffee Day

- **Confidence:** medium
- **Input:** address: Inside The Sai Leela Hotel, Singanayakanahalli Doddaballapur Road, Yelahanka, Uttarahalli Hobli, Bengaluru, 560082, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · phone: +919341906371 · coords: 13.1993646, 77.5617449 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Cafe-Coffee-Day/store/923902 · cuisine: Cafe, Bakery, Tea, Shakes, Juices, Light Bites, Sandwich, Desserts · listing_rating: 4.9 · listing_reviews: 1 · checked_on: 2026-10-11 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). External listing rating 4.9/1 recorded with source URL + check date — NEVER a Foodie community value. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 156, 174, 463 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.1993646, 77.5617449 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Cafe-Coffee-Day/store/923902. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 373: C.K Hotel

- **Confidence:** medium
- **Input:** address: Hesaraghatta Hobli, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · phone: +919741331635 · coords: 13.17234543, 77.56167647 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/C.k-Hotel/store/bab33c · cuisine: South Indian, Chinese · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 352, 362, 364, 371, 378, 381, 384, 392, 403, 407, 410, 413, 414, 419, 422, 424, 430, 450, 451, 457, 470, 478, 480, 489, 496, 498, 506, 512, 519, 525, 529, 549, 551 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.17234543, 77.56167647 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/C.k-Hotel/store/bab33c. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 374: Cafe Culture 22

- **Confidence:** medium
- **Input:** address: 8/1, Dibbur Gate, Near A N Fitness, Yelahanka, Bangalore, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · phone: +918884141663 · coords: 13.1724585, 77.530942 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Cafe-Culture-22/store/17a2955 · listing_rating: 3.8 · listing_reviews: 20 · checked_on: 2026-10-11 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). External listing rating 3.8/20 recorded with source URL + check date — NEVER a Foodie community value. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 351, 375, 388, 390, 391, 417, 436, 497, 505, 528, 537 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.1724585, 77.530942 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Cafe-Culture-22/store/17a2955. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 375: Cafe Culture

- **Confidence:** medium
- **Input:** address: Dibbur Gate, Kakolu Main Road, Hesaraghatta, Bangalore, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · phone: +917090601003 · coords: 13.17254657, 77.53039969 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Cafe-Culture/store/175954a · listing_rating: 4.1 · listing_reviews: 198 · checked_on: 2026-10-11 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). External listing rating 4.1/198 recorded with source URL + check date — NEVER a Foodie community value. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 363, 374, 388, 390, 391, 417, 436, 497, 505, 528, 537 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.17254657, 77.53039969 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Cafe-Culture/store/175954a. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 376: Cafe Jatayu

- **Confidence:** medium
- **Input:** address: Chokkanahalli, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · phone: +919980734043 · coords: 13.173869, 77.5376814 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Cafe-Jatayu/store/50ca73 · cuisine: Fast Food · listing_rating: 3.7 · listing_reviews: 2 · checked_on: 2026-10-11 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). External listing rating 3.7/2 recorded with source URL + check date — NEVER a Foodie community value. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 400, 441, 487, 503 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.173869, 77.5376814 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Cafe-Jatayu/store/50ca73. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 377: Cafe Odyssey

- **Confidence:** medium
- **Input:** address: 18, 19/1, Near Featherlite Private Ltd Company, Chokkanahalli, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · phone: +917204035272 · coords: 13.174217, 77.5402718 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Cafe-Odyssey/store/a71917 · cuisine: Fast Food, Italian · listing_rating: 4.9 · listing_reviews: 1 · checked_on: 2026-10-11 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). External listing rating 4.9/1 recorded with source URL + check date — NEVER a Foodie community value. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 366, 367, 401, 427, 433, 517 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.174217, 77.5402718 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Cafe-Odyssey/store/a71917. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 378: Cart-O-Cafe Rajanukunte

- **Confidence:** medium
- **Input:** address: 1A Rajanukunte, Doddaballapur Main Rd, Bengaluru, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · phone: +919035447976 · coords: 13.1721739, 77.561327 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Cart-o-cafe-Rajanukunte/store/923215 · cuisine: Pizza · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 352, 362, 364, 371, 373, 381, 384, 392, 403, 407, 410, 413, 414, 419, 422, 424, 430, 439, 442, 450, 451, 457, 465, 470, 480, 489, 496, 498, 506, 512, 519, 525, 529, 549, 551 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.1721739, 77.561327 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Cart-o-cafe-Rajanukunte/store/923215. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 379: Charan Condiments

- **Confidence:** medium
- **Input:** address: 5GPR+3VF, Rajanukunte, Karnataka 560119, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · coords: 13.174937, 77.54306 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Charan-Condiments/store/1b56898 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 389, 396, 469, 530, 531, 532 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.174937, 77.54306 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Charan-Condiments/store/1b56898. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 381: Chimney Restaurant

- **Confidence:** medium
- **Input:** address: 1st Floor, Lakshmi Venkateshwara Complex, Rajanukunte Village, Kakolun Road, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · phone: +917829393636 · coords: 13.17261181, 77.56211662 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Chimney-Restaurant/store/16bbb40 · cuisine: Biryani, North Indian, Chinese · listing_rating: 3.9 · listing_reviews: 29 · checked_on: 2026-10-11 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). External listing rating 3.9/29 recorded with source URL + check date — NEVER a Foodie community value. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 352, 362, 371, 373, 378, 384, 392, 403, 407, 410, 413, 414, 419, 422, 424, 430, 450, 451, 457, 470, 478, 480, 489, 496, 498, 506, 512, 519, 525, 529, 549, 551 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.17261181, 77.56211662 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Chimney-Restaurant/store/16bbb40. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 382: CHINNU MESS

- **Confidence:** medium
- **Input:** address: 05, 2nd Cross, Dibbur Village, Itagalpura Main Road, Hesaraghatta, Bangalore, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · phone: +918152873647 · coords: 13.16765499, 77.52892314 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Chinnu-Mess/store/17106c3 · cuisine: South Indian · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 449 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.16765499, 77.52892314 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Chinnu-Mess/store/17106c3. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 383: Crazy Pizza

- **Confidence:** medium
- **Input:** address: Shop 4, Dibbur, Opposite Presidency University, Yelahanka, Bangalore, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · phone: +919394856784 · coords: 13.17234871, 77.53638824 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Crazy-Pizza/store/1762646 · listing_rating: 3.7 · listing_reviews: 75 · checked_on: 2026-10-11 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). External listing rating 3.7/75 recorded with source URL + check date — NEVER a Foodie community value. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 358, 368, 386, 387, 398, 400, 402, 412, 415, 416, 421, 467, 493, 503, 523, 524, 533, 534, 538, 543, 546, 548 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.17234871, 77.53638824 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Crazy-Pizza/store/1762646. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 384: Cupcake Bliss Cakes & Desserts

- **Confidence:** medium
- **Input:** address: Rajanukunte, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · coords: 13.173067, 77.561563 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Cupcake-Bliss-Cakes-and-Desserts/store/1741713 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 352, 359, 362, 364, 371, 373, 378, 381, 392, 403, 407, 410, 413, 414, 419, 422, 424, 430, 450, 451, 457, 470, 478, 480, 489, 496, 498, 506, 512, 519, 525, 529, 549, 551 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.173067, 77.561563 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Cupcake-Bliss-Cakes-and-Desserts/store/1741713. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 385: Daily Bread

- **Confidence:** medium
- **Input:** address: 54, Doddaballapura Main Rd, Yelahanka, Bengaluru, Sreeramanahalli, Karnataka 560119, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · coords: 13.1919773, 77.5630875 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Daily-Bread/store/2043cc3 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 420 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.1919773, 77.5630875 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Daily-Bread/store/2043cc3. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 386: Delhi Rolls And Juice Junction

- **Confidence:** medium
- **Input:** address: Dibburu, Opposite Presidency University, Kakolu Road, Yelahanka, Bangalore, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · phone: +916360600756 · coords: 13.17229383, 77.53565502 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Delhi-Rolls-And-Juice-Junction/store/1762653 · listing_rating: 3.7 · listing_reviews: 48 · checked_on: 2026-10-11 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). External listing rating 3.7/48 recorded with source URL + check date — NEVER a Foodie community value. Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 358, 368, 383, 387, 398, 402, 412, 415, 416, 421, 467, 493, 503, 523, 524, 533, 534, 538, 543, 546, 547, 548 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.17229383, 77.53565502 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Delhi-Rolls-And-Juice-Junction/store/1762653. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 387: Dew & Duo Cafe

- **Confidence:** medium
- **Input:** address: 5GCP+V7P, Ittagallpura, Bengaluru, Karnataka 560119, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · phone: +917708720348 · coords: 13.1721509, 77.5356667 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Dew-and-Duo-Cafe/store/3bca9bc · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 358, 368, 383, 386, 398, 402, 412, 415, 416, 421, 467, 493, 503, 523, 524, 533, 534, 538, 543, 546, 547, 548 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.1721509, 77.5356667 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Dew-and-Duo-Cafe/store/3bca9bc. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 388: Dibbur Cafe

- **Confidence:** medium
- **Input:** address: Dibbur Gate, Kakolu Main Road, Hesaraghatta, Bangalore, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · phone: +918884141663 · coords: 13.1723745, 77.5309829 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Dibbur-Cafe/store/17a2961 · listing_rating: 4 · listing_reviews: 97 · checked_on: 2026-10-11 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). External listing rating 4/97 recorded with source URL + check date — NEVER a Foodie community value. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 351, 374, 375, 390, 391, 417, 436, 497, 505, 528, 537 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.1723745, 77.5309829 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Dibbur-Cafe/store/17a2961. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 389: F16 Resto

- **Confidence:** medium
- **Input:** address: 20/9, Chokkanahalli Village, Itgalpur, Near Presidency University, Kogilu Main Road, Yelahanka, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · phone: +919844573335 · coords: 13.17515068, 77.54309417 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/F16-Resto/store/1738720 · cuisine: North Indian, Biryani · listing_rating: 4.2 · listing_reviews: 1 · checked_on: 2026-10-11 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). External listing rating 4.2/1 recorded with source URL + check date — NEVER a Foodie community value. Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 379, 396, 469, 530, 531, 532 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.17515068, 77.54309417 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/F16-Resto/store/1738720. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 390: Food Planet Resto Cafe

- **Confidence:** medium
- **Input:** address: Dibbur Gate, Kakolu Main Road, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · phone: +916363754642 · coords: 13.1724588, 77.5303304 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Food-Planet-Resto-Cafe/store/1555590 · cuisine: Chinese, Sichuan, Biryani, Rolls, Momos, Street Food, North Indian · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 363, 374, 375, 388, 391, 417, 436, 497, 505, 528, 537 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.1724588, 77.5303304 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Food-Planet-Resto-Cafe/store/1555590. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 391: Food Planet

- **Confidence:** medium
- **Input:** address: Dibbur, Gate, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · coords: 13.172527, 77.5299019 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Food-Planet/store/1102245 · cuisine: Chinese, Sichuan, Biryani, Rolls, Momos, Street Food, North Indian · listing_rating: 4.2 · listing_reviews: 1 · checked_on: 2026-10-11 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). External listing rating 4.2/1 recorded with source URL + check date — NEVER a Foodie community value. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 363, 374, 375, 388, 390, 417, 436, 482, 483, 497, 505, 528, 537 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.172527, 77.5299019 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Food-Planet/store/1102245. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 392: Gossip and gulp

- **Confidence:** medium
- **Input:** address: Rajanukunte, Karnataka 560119, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · coords: 13.1724375, 77.5613125 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Gossip-And-Gulp/store/1cc538c · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 352, 359, 362, 364, 371, 373, 378, 381, 384, 403, 407, 410, 413, 414, 419, 422, 424, 430, 439, 442, 450, 451, 457, 470, 480, 489, 496, 498, 506, 512, 519, 525, 529, 549, 551 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.1724375, 77.5613125 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Gossip-And-Gulp/store/1cc538c. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 394: Gowdru Hotel

- **Confidence:** medium
- **Input:** address: 5Hf7+Mj9, Sh 9, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · phone: +919945752979 · coords: 13.17420948, 77.56416321 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Gowdru-Hotel/store/a819cc · cuisine: Biryani · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 179, 408, 409, 411, 464, 488, 504 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.17420948, 77.56416321 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Gowdru-Hotel/store/a819cc. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 396: Green Tribes Family Restaurant

- **Confidence:** medium
- **Input:** address: Rajanukunte - Kakolu, Main Road, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · phone: +919916682669 · coords: 13.1751145, 77.54321945 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Green-Tribes-Family-Restaurant/store/385213 · cuisine: North Indian, Chinese, Mughlai, South Indian, Biryani · listing_rating: 4.1 · listing_reviews: 26 · checked_on: 2026-10-11 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). External listing rating 4.1/26 recorded with source URL + check date — NEVER a Foodie community value. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 379, 389, 469, 530, 531, 532 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.1751145, 77.54321945 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Green-Tribes-Family-Restaurant/store/385213. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 397: Hasty Tasty

- **Confidence:** medium
- **Input:** address: 5GJW+X8X, Chokkanahalli Main Rd, Rajanukunte, Karnataka 562163, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · coords: 13.1824891, 77.5458732 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Hasty-Tasty/store/1b0a169 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 431 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.1824891, 77.5458732 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Hasty-Tasty/store/1b0a169. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 398: Hotel Akhanda Biryanis

- **Confidence:** medium
- **Input:** address: Shop 1, Rajankunte, Opposite To Presidency University, Yelahanka, Bangalore, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · phone: +919513448448 · coords: 13.172305, 77.535818 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Hotel-Akhanda-Biryanis/store/16b9653 · cuisine: Plain Dosa, Masala Dosa, Karam Dosa, Ghee Podi Dosa, Onion Dosa · listing_rating: 4.2 · listing_reviews: 376 · checked_on: 2026-10-11 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). External listing rating 4.2/376 recorded with source URL + check date — NEVER a Foodie community value. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 358, 368, 383, 386, 387, 402, 412, 415, 416, 421, 467, 493, 503, 523, 524, 533, 534, 538, 543, 546, 547, 548 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.172305, 77.535818 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Hotel-Akhanda-Biryanis/store/16b9653. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 400: Hotel Y N Senate

- **Confidence:** medium
- **Input:** address: Beside Presidency University, Maduri Temple Road, Rajankunte, Yelahanka, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · phone: +919535404046 · coords: 13.17347823, 77.53698807 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Hotel-Y-N-Senate/store/39685b · cuisine: South Indian, Chinese, Rolls · listing_rating: 4.4 · listing_reviews: 4 · checked_on: 2026-10-11 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). External listing rating 4.4/4 recorded with source URL + check date — NEVER a Foodie community value. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 368, 376, 383, 412, 416, 441, 467, 503, 523, 524 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.17347823, 77.53698807 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Hotel-Y-N-Senate/store/39685b. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 401: Hotel Shri Rama Bhavan

- **Confidence:** medium
- **Input:** address: 88, Ittagalpura Grama, Chokkanahalli Gate, Rajankunte, Yelahanka, Bangalore, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · phone: +918861459599 · coords: 13.17377334, 77.54061677 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Hotel-Shri-Rama-Bhavan/store/159a731 · cuisine: South Indian, Chinese, North Indian · listing_rating: 4 · listing_reviews: 4 · checked_on: 2026-10-11 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). External listing rating 4/4 recorded with source URL + check date — NEVER a Foodie community value. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 366, 367, 377, 427, 433, 517 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.17377334, 77.54061677 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Hotel-Shri-Rama-Bhavan/store/159a731. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 402: Howrah Jn Restaurant

- **Confidence:** medium
- **Input:** address: opposite PRESIDENCY UNIVERSITY, Dibbur, Bangalore, Karnataka 560089, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · coords: 13.1719089, 77.5352047 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Howrah-Jn-Restaurant/store/42b0037 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 358, 383, 386, 387, 398, 415, 416, 421, 493, 533, 534, 538, 543, 546, 547, 548 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.1719089, 77.5352047 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Howrah-Jn-Restaurant/store/42b0037. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 403: Indiana Burgers

- **Confidence:** medium
- **Input:** address: Rajanukunte, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · phone: +917411908515 · coords: 13.173067, 77.561563 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Indiana-Burgers/store/1741705 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 352, 359, 362, 364, 371, 373, 378, 381, 384, 392, 407, 410, 413, 414, 419, 422, 424, 430, 450, 451, 457, 470, 478, 480, 489, 496, 498, 506, 512, 519, 525, 529, 549, 551 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.173067, 77.561563 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Indiana-Burgers/store/1741705. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 404: Iyengar Bakery's Cake of the Day

- **Confidence:** medium
- **Input:** address: 5HC7+XP7, Suryodaya Layout, Rajanukunte, Karnataka 560119, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · coords: 13.1724176, 77.5642818 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Iyengar-Bakerys-Cake-Of-The-Day/store/1b09c4a · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 355, 361, 411, 447, 465, 484, 485, 488, 501, 504, 508, 510 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.1724176, 77.5642818 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Iyengar-Bakerys-Cake-Of-The-Day/store/1b09c4a. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 405: J.J.BAKERY

- **Confidence:** medium
- **Input:** address: 1, Mailappana Halli Main Road, Shivakote Post, Bangalore, Bengaluru, Karnataka 89, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · phone: +919341189236 · coords: 13.1379819, 77.5311497 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/J.j.bakery/store/1995133 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 419, 446 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.1379819, 77.5311497 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/J.j.bakery/store/1995133. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 407: Jai Maruthi Hotel

- **Confidence:** medium
- **Input:** address: NEAR Smart, Rajanukunte, Bangalore, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · phone: +916363153589 · coords: 13.172812471725742, 77.56145455949789 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Jai-Maruthi-Hotel/store/174a962 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 352, 359, 362, 364, 371, 373, 378, 381, 384, 392, 403, 410, 413, 414, 419, 422, 424, 430, 450, 451, 457, 470, 478, 480, 489, 496, 498, 506, 512, 519, 525, 529, 549, 551 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.172812471725742, 77.56145455949789 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Jai-Maruthi-Hotel/store/174a962. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 408: JUST BAKE RAJANUKUNTE

- **Confidence:** medium
- **Input:** address: JustBake, Doddaballapura Main Rd, opposite to police station, Bangalore, Rajanukunte, Karnataka 560119, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · phone: +919740474445 · coords: 13.1744949, 77.564139 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Just-Bake-Rajanukunte/store/1863907 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 394, 409, 464, 465 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.1744949, 77.564139 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Just-Bake-Rajanukunte/store/1863907. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 409: Just Bake

- **Confidence:** medium
- **Input:** address: 1, Opposite Rajankunte Police Station, Doddaballapura Main Road, Yelahanka, Bangalore, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · phone: +918970020111 · coords: 13.1740980718, 77.5640303852 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Just-Bake/store/17a2948 · cuisine: Bakery and Cake Shop, Cake shop, Sweet shop, Cupcake shop, Sweets and dessert buffet, Donut shop, Indian sweets shop, Pastry shop · listing_rating: 4.2 · listing_reviews: 104 · checked_on: 2026-10-11 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). External listing rating 4.2/104 recorded with source URL + check date — NEVER a Foodie community value. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 394, 408, 411, 464, 488, 504 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.1740980718, 77.5640303852 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Just-Bake/store/17a2948. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 410: Kaati Zone Rolls and Wraps

- **Confidence:** medium
- **Input:** address: Rajanukunte, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · phone: +917411908515 · coords: 13.173067, 77.561563 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Kaati-Zone-Rolls-And-Wraps/store/1741a90 · cuisine: Fast food restaurant · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 352, 359, 362, 364, 371, 373, 378, 381, 384, 392, 403, 407, 413, 414, 419, 422, 424, 430, 450, 451, 457, 470, 478, 480, 489, 496, 498, 506, 512, 519, 525, 529, 549, 551 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.173067, 77.561563 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Kaati-Zone-Rolls-And-Wraps/store/1741a90. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 411: Kalmi Factory

- **Confidence:** medium
- **Input:** address: Yelahanka, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · phone: +917676643066 · coords: 13.172977, 77.564227 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Kalmi-Factory/store/175c307 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 355, 361, 394, 404, 409, 447, 465, 485, 488, 501, 504, 508, 510 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.172977, 77.564227 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Kalmi-Factory/store/175c307. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 412: KKFC (Kranchy Krispy Fried Chicken)

- **Confidence:** medium
- **Input:** address: Shop No -6, Madhure Temple Road, near Presidency University, Chokkanahalli, Bengaluru, Karnataka 560089, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · phone: +919972479226 · coords: 13.1728442, 77.5364932 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Kkfc-(Kranchy-Krispy-Fried-Chicken)/store/4032572 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 358, 368, 383, 386, 387, 398, 400, 415, 416, 421, 467, 493, 503, 523, 524, 533, 538, 546, 548 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.1728442, 77.5364932 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Kkfc-(Kranchy-Krispy-Fried-Chicken)/store/4032572. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 413: Kouzina Kafe - The Food Court

- **Confidence:** medium
- **Input:** address: Rajanukunte, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · phone: +917411908515 · coords: 13.173067, 77.561563 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Kouzina-Kafe-The-Food-Court/store/1741a8b · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 352, 359, 362, 364, 371, 373, 378, 381, 384, 392, 403, 407, 410, 414, 419, 422, 424, 430, 450, 451, 457, 470, 478, 480, 489, 496, 498, 506, 512, 519, 525, 529, 549, 551 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.173067, 77.561563 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Kouzina-Kafe-The-Food-Court/store/1741a8b. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 414: Kolkata Famous Kati Roll

- **Confidence:** medium
- **Input:** address: Rajankunte, Kokolu Main Road, Yelahanka, Bangalore, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · phone: +918073757941 · coords: 13.172286, 77.561743 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Kolkata-Famous-Kati-Roll/store/159b81c · cuisine: Rolls · listing_rating: 3.6 · listing_reviews: 28 · checked_on: 2026-10-11 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). External listing rating 3.6/28 recorded with source URL + check date — NEVER a Foodie community value. Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 352, 362, 364, 371, 373, 378, 381, 384, 392, 403, 407, 410, 413, 419, 422, 424, 430, 450, 451, 457, 470, 478, 480, 489, 496, 498, 506, 512, 519, 525, 529, 549, 551 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.172286, 77.561743 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Kolkata-Famous-Kati-Roll/store/159b81c. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 415: Krunchy Krispy Fried Chicken

- **Confidence:** medium
- **Input:** address: Shop 6, Ground Floor, Madhure Temple Road, Yelahanka, Bangalore, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · coords: 13.1719218418, 77.5356587466 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Krunchy-Krispy-Fried-Chicken/store/20034ca · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 358, 368, 383, 386, 387, 398, 402, 412, 416, 421, 467, 493, 523, 524, 533, 534, 538, 543, 546, 547, 548 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.1719218418, 77.5356587466 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Krunchy-Krispy-Fried-Chicken/store/20034ca. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 416: Kubera grand

- **Confidence:** medium
- **Input:** address: Dibru Residency University College, Bengaluru, Chokkanahalli, Karnataka 560119, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · phone: +919611614164 · coords: 13.1725067, 77.53630009999999 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Kubera-Grand/store/1b063a3 · listing_rating: 4.1 · listing_reviews: 656 · checked_on: 2026-10-11 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). External listing rating 4.1/656 recorded with source URL + check date — NEVER a Foodie community value. Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Matches to existing records:**
  - `60cc569b` **Sri Ganesh Grand** · locality: Bashettihalli — similarity 0.583 (name-ambiguous-proper-token) · distance: 10.746 km · existing coords: 13.2679055, 77.5521405 — confidence low
  - `987dad98` **Shri Manjunatha Grand Veg** · locality: Doddaballapura Railway Station — similarity 0.4 (name-ambiguous-proper-token) · existing coords: NULL — confidence low
- **Intra-file duplicates:** rows 358, 368, 383, 386, 387, 398, 400, 402, 412, 415, 421, 467, 493, 503, 523, 524, 533, 534, 538, 543, 546, 548 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.1725067, 77.53630009999999 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Kubera-Grand/store/1b063a3. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `LOCALITY_CONFLICT`, `LOCALITY_CONFLICT`, `EXISTING_COORDINATES_DIFFER`, `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 417: Kushank Hotel

- **Confidence:** medium
- **Input:** address: Dibbur Gate, Ground Floor, Jyothi Complex, Hesarghatta, Madhure Main Road, Near Presidency Collage, Yelahanka, Bangalore, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · phone: +918971692283 · coords: 13.1725377574, 77.5305084633 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Kushank-Hotel/store/17a3266 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 363, 374, 375, 388, 390, 391, 436, 497, 505, 528, 537 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.1725377574, 77.5305084633 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Kushank-Hotel/store/17a3266. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 419: L.J. IYENGAR BAKERY & SWEETS

- **Confidence:** medium
- **Input:** address: Rajanukunte, Karnataka 560119, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · coords: 13.173456799999999, 77.5612163 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/L.j.-Iyengar-Bakery-and-Sweets/store/1a5cc69 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 352, 359, 371, 373, 378, 381, 384, 392, 403, 405, 407, 410, 413, 414, 430, 457, 470, 480, 489, 498, 506, 512, 519, 529, 549, 551 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.173456799999999, 77.5612163 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/L.j.-Iyengar-Bakery-and-Sweets/store/1a5cc69. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 420: Lassi And More

- **Confidence:** medium
- **Input:** address: 1, Doddaballapur Main Rd, Yelahanka, Bengaluru, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · phone: +918088990146 · coords: 13.1919773, 77.5630875 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Lassi-And-More/store/92806c · cuisine: Fast Food, Ice Cream, Desserts, Shakes, Juices, Coffee · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 64, 385 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.1919773, 77.5630875 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Lassi-And-More/store/92806c. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 421: Lassi Shop

- **Confidence:** medium
- **Input:** address: Opposite To Presidency University, Bengaluru, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · phone: +919686930621 · coords: 13.1721634, 77.5361186 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Lassi-Shop/store/ca2335 · cuisine: Fast Food · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 358, 368, 383, 386, 387, 398, 402, 412, 415, 416, 467, 493, 503, 523, 524, 533, 534, 538, 543, 546, 547, 548 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.1721634, 77.5361186 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Lassi-Shop/store/ca2335. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 422: Lickees

- **Confidence:** medium
- **Input:** address: Muninanjappa Sankeerna Adhe, Vishwanathapura Road, Yelahanka, Bangalore, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · phone: +919538014185 · coords: 13.1725217, 77.5626632 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Lickees/store/1762782 · listing_rating: 3.5 · listing_reviews: 9 · checked_on: 2026-10-11 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). External listing rating 3.5/9 recorded with source URL + check date — NEVER a Foodie community value. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 362, 371, 373, 378, 381, 384, 392, 403, 407, 410, 413, 414, 424, 430, 450, 451, 457, 470, 478, 480, 489, 496, 498, 512, 519, 525, 529, 549, 551 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.1725217, 77.5626632 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Lickees/store/1762782. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 423: M.M Family Restaurant

- **Confidence:** medium
- **Input:** address: Kakolu Main Road, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · phone: +919066739200 · coords: 13.17070103, 77.55503387 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/M.m-Family-Restaurant/store/16bb95b · cuisine: South Indian, Mughlai, Chinese · listing_rating: 3.6 · listing_reviews: 3 · checked_on: 2026-10-11 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). External listing rating 3.6/3 recorded with source URL + check date — NEVER a Foodie community value. Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 443, 474, 511 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.17070103, 77.55503387 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/M.m-Family-Restaurant/store/16bb95b. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 424: Mahadeshwara Nandini Milk Parlour

- **Confidence:** medium
- **Input:** address: Nandini milk Parlour, Kakolu Rd, near Union Bank, Rajanukunte, Bengaluru, Karnataka 560119, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · phone: +919108740428 · coords: 13.1726554, 77.56248819999999 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Mahadeshwara-Nandini-Milk-Parlour/store/18334a9 · cuisine: Ice cream shop, Milk delivery service · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 210, 362, 371, 373, 378, 381, 384, 392, 403, 407, 410, 413, 414, 422, 430, 450, 451, 457, 470, 478, 480, 489, 496, 498, 519, 525, 529, 549, 551 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.1726554, 77.56248819999999 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Mahadeshwara-Nandini-Milk-Parlour/store/18334a9. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 425: Mallanna Hotel Rajanakunte

- **Confidence:** medium
- **Input:** address: 5GFX+X99, Chokkanahalli, Karnataka 560119, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · coords: 13.1749159, 77.5484867 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Mallanna-Hotel-Rajanakunte/store/42ab8b5 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 471, 477, 544 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.1749159, 77.5484867 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Mallanna-Hotel-Rajanakunte/store/42ab8b5. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 426: Mirage Bar

- **Confidence:** medium
- **Input:** address: Angsana Hotels & Resorts, Main Doddaballapur Road, Addevishwanathapura Village, Rajankunte, Yelahanka, Bangalore, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · phone: +918028468896 · coords: 13.18220808, 77.5638048 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Mirage-Bar/store/5ab6ab · cuisine: North Indian, Continental · listing_rating: 3.7 · listing_reviews: 19 · checked_on: 2026-10-11 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). External listing rating 3.7/19 recorded with source URL + check date — NEVER a Foodie community value. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 520, 527 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.18220808, 77.5638048 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Mirage-Bar/store/5ab6ab. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 427: MANU DUM BIRIYANI

- **Confidence:** medium
- **Input:** address: MM Bar Opposite Chokkanahalli , chikka mudhre road, Chokkanahalli Main Rd, Rajanukunte, Karnataka 560119, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · coords: 13.1741022, 77.5405926 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Manu-Dum-Biriyani/store/1b12738 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 366, 367, 377, 401, 433, 517 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.1741022, 77.5405926 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Manu-Dum-Biriyani/store/1b12738. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 428: Meals Ready

- **Confidence:** medium
- **Input:** address: Doddabllapure Main Road, Rajankunda, Yelahanka, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · phone: +919341350312 · coords: 13.16912951, 77.56478045 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Meals-Ready/store/bb09a3 · cuisine: Biryani, South Indian · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 507, 513 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.16912951, 77.56478045 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Meals-Ready/store/bb09a3. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 429: Moeen Maggi Point

- **Confidence:** medium
- **Input:** address: 5GCP+8JJ, Presidency University Rd, Dibbur, Ittagallpura, Karnataka 560119, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · coords: 13.1708485, 77.5365075 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Moeen-Maggi-Point/store/1b0a105 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 493, 538, 548 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.1708485, 77.5365075 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Moeen-Maggi-Point/store/1b0a105. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 430: Momo Zone - The Momo Company

- **Confidence:** medium
- **Input:** address: Rajanukunte, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · coords: 13.173067, 77.561563 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Momo-Zone-The-Momo-Company/store/1741a91 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 352, 359, 362, 364, 371, 373, 378, 381, 384, 392, 403, 407, 410, 413, 414, 419, 422, 424, 450, 451, 457, 470, 478, 480, 489, 496, 498, 506, 512, 519, 525, 529, 549, 551 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.173067, 77.561563 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Momo-Zone-The-Momo-Company/store/1741a91. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 431: Munch Resto Cafe

- **Confidence:** medium
- **Input:** address: NO.87/2A1/15B, Chokkanahalli Main Rd, near PRESIDENCY BOYS & GIRLS HOSTEL, Adde Vishwanathapura, Bengaluru, Rajanukunte, Karnataka 562163, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · phone: +917411410463 · coords: 13.182464999999999, 77.5459157 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Munch-Resto-Cafe/store/19753b3 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 397 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.182464999999999, 77.5459157 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Munch-Resto-Cafe/store/19753b3. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 432: Mylari Mane Badoota

- **Confidence:** medium
- **Input:** address: 28, Rajanukunte, Bengaluru, Karnataka 560119, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · coords: 13.1762316, 77.56413049999999 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Mylari-Mane-Badoota/store/1b21b8b · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 437, 438, 440, 459 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.1762316, 77.56413049999999 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Mylari-Mane-Badoota/store/1b21b8b. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 433: Naati kitchen MMR RESTO BAR

- **Confidence:** medium
- **Input:** address: 5GFR+H64, Rajanukunte, Karnataka 560119, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · coords: 13.1737241, 77.5407161 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Naati-Kitchen-Mmr-Resto-Bar/store/1b08652 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 366, 367, 377, 401, 427, 517 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.1737241, 77.5407161 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Naati-Kitchen-Mmr-Resto-Bar/store/1b08652. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 434: Naati Cafe

- **Confidence:** medium
- **Input:** address: 67, Rajanukunte, Adde Vishwanathapura, Kakolu Road, Near Brundavan Apartment, Yelahanka, Bangalore, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · phone: +916360384103 · coords: 13.1700357553, 77.5522458181 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Naati-Cafe/store/17a83ca · listing_rating: 3.8 · listing_reviews: 263 · checked_on: 2026-10-11 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). External listing rating 3.8/263 recorded with source URL + check date — NEVER a Foodie community value. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 461, 500 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.1700357553, 77.5522458181 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Naati-Cafe/store/17a83ca. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 436: Nakshatra Tiffin And Chats Point

- **Confidence:** medium
- **Input:** address: Dibbur Gate, Kakolu Road, Hesaraghatta, Bangalore, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · phone: +917406677455 · coords: 13.17253221, 77.53054778 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Nakshatra-Tiffin-And-Chats-Point/store/1762800 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 363, 374, 375, 388, 390, 391, 417, 497, 505, 528, 537 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.17253221, 77.53054778 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Nakshatra-Tiffin-And-Chats-Point/store/1762800. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 437: Namma Halli Mane naati style

- **Confidence:** medium
- **Input:** address: Doddaballapura Main Rd, opp. to nandini parlour, Rajanukunte, Karnataka 560119, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · phone: +917338355619 · coords: 13.1760501, 77.5640313 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Namma-Halli-Mane-Naati-Style/store/197b0ca · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 40, 432, 438, 440, 459 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.1760501, 77.5640313 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Namma-Halli-Mane-Naati-Style/store/197b0ca. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 438: Namma Halli Mane

- **Confidence:** medium
- **Input:** address: Rajankunte, Doddaballapur Main Road, Yelahanka, Bangalore, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · phone: +918104666415 · coords: 13.1760337, 77.56443048 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Namma-Halli-Mane/store/175954c · cuisine: Biryani, Mughlai · listing_rating: 2.8 · listing_reviews: 5 · checked_on: 2026-10-11 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). External listing rating 2.8/5 recorded with source URL + check date — NEVER a Foodie community value. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 432, 437, 440, 459 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.1760337, 77.56443048 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Namma-Halli-Mane/store/175954c. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 439: Nammura Badoota

- **Confidence:** medium
- **Input:** address: Kakolu Rd, Rajanukunte, Karnataka 560119, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · coords: 13.172136, 77.5600031 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Nammura-Badoota/store/1aa0bb9 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 348, 352, 364, 378, 392, 442, 506, 514, 515, 516 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.172136, 77.5600031 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Nammura-Badoota/store/1aa0bb9. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 440: Nandhini Milk Shop

- **Confidence:** medium
- **Input:** address: 5HG7+FR5, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · phone: +917760060085 · coords: 13.1761284, 77.5646121 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Nandhini-Milk-Shop/store/1036493 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 432, 437, 438, 459 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.1761284, 77.5646121 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Nandhini-Milk-Shop/store/1036493. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 441: Nandini cafe moo

- **Confidence:** medium
- **Input:** address: 5GFP+HW, taluk, Yelahanka, Chokkanahalli, Bengaluru, Karnataka 560119, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · phone: +919535375786 · coords: 13.1739375, 77.5373125 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Nandini-Cafe-Moo/store/197a347 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 376, 400, 487, 503, 524 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.1739375, 77.5373125 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Nandini-Cafe-Moo/store/197a347. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 442: Nati Style Donne Biriyani Mane

- **Confidence:** medium
- **Input:** address: 5Hc6+R2J, 163, Rajanukunte, Bengaluru, Karnataka 560119, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · phone: +919945972738 · coords: 13.1721372, 77.56002409999999 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Nati-Style-Donne-Biriyani-Mane/store/1979a2a · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 348, 352, 364, 378, 392, 439, 506, 514, 515, 516 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.1721372, 77.56002409999999 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Nati-Style-Donne-Biriyani-Mane/store/1979a2a. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 443: Navam Military Hotel

- **Confidence:** medium
- **Input:** address: Ground Floor, Rajanukunte, Near Siri Enclave, Kakol Road, Yelahanka, Bangalore, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · phone: +919632826535 · coords: 13.1704664, 77.5549121 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Navam-Military-Hotel/store/1762803 · listing_rating: 4 · listing_reviews: 26 · checked_on: 2026-10-11 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). External listing rating 4/26 recorded with source URL + check date — NEVER a Foodie community value. Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 423, 474, 511 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.1704664, 77.5549121 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Navam-Military-Hotel/store/1762803. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 444: Naveen Catering Contractor

- **Confidence:** medium
- **Input:** address: No.88, Pallavi Nivas, Near Blue Bell School, CQAL Layout,  3rd Phase Altu, Yelahanka New Town, Bangalore-560064, Karnataka, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · phone: +918970149423 · coords: 13.174525669892, 77.559444718669 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Naveen-Catering-Contractor/store/182b92c · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 445, 456 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.174525669892, 77.559444718669 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Naveen-Catering-Contractor/store/182b92c. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 445: Naveen

- **Confidence:** medium
- **Input:** address: 5HC8+799, Rajanukunte, Karnataka 560119, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · coords: 13.170671899999999, 77.5659838 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Naveen/store/1b1c641 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 444, 448, 494 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.170671899999999, 77.5659838 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Naveen/store/1b1c641. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 446: Navmi hotel

- **Confidence:** medium
- **Input:** address: 4GPJ+Q82, Mylappanahalli, Bengaluru, Karnataka 560089, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · coords: 13.1368954, 77.53106609999999 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Navmi-Hotel/store/1b059ab · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 405 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.1368954, 77.53106609999999 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Navmi-Hotel/store/1b059ab. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 447: New Taj Hotel

- **Confidence:** medium
- **Input:** address: 76/77, Rajankunte, Opposite Bus Stop, Yelahanka, Bangalore, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · phone: +918310342756 · coords: 13.171701262, 77.5642437787 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/New-Taj-Hotel/store/17a83c8 · listing_rating: 4.2 · listing_reviews: 3455 · checked_on: 2026-10-11 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). External listing rating 4.2/3455 recorded with source URL + check date — NEVER a Foodie community value. Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 353, 355, 361, 404, 411, 465, 472, 484, 485, 488, 494, 501, 504, 508, 510, 526 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.171701262, 77.5642437787 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/New-Taj-Hotel/store/17a83c8. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 448: Night Coocking

- **Confidence:** medium
- **Input:** address: Rajan Kunte, Honnenahalli, Ramada, Yelahanka, Bangalore, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · phone: +916305327139 · coords: 13.1710066, 77.5664197 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Night-Coocking/store/15a0677 · cuisine: South Indian · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 445 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.1710066, 77.5664197 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Night-Coocking/store/15a0677. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 449: NISARAGA  HOME FOOD

- **Confidence:** medium
- **Input:** address: 05, 2nd Cross, Dibbur Village, Avverahalli, Ittagallpura Main Road, Hesaraghatta, Bangalore, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · phone: +918152873647 · coords: 13.16817577, 77.52938303 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Nisaraga-Home-Food/store/17106b0 · cuisine: South Indian, North Indian · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 382 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.16817577, 77.52938303 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Nisaraga-Home-Food/store/17106b0. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 450: Nisha Home Foods

- **Confidence:** medium
- **Input:** address: 534/1/2, Rajanukunte, Kakolu Road, Yelahanka, Bangalore, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · phone: +917483765606 · coords: 13.1723209, 77.5621611 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Nisha-Home-Foods/store/1642c37 · cuisine: South Indian, Biryani · listing_rating: 3.1 · listing_reviews: 623 · checked_on: 2026-10-11 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). External listing rating 3.1/623 recorded with source URL + check date — NEVER a Foodie community value. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 352, 362, 364, 371, 373, 378, 381, 384, 392, 403, 407, 410, 413, 414, 422, 424, 430, 451, 457, 470, 478, 480, 489, 496, 498, 506, 519, 525, 529, 549, 551 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.1723209, 77.5621611 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Nisha-Home-Foods/store/1642c37. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 451: NISHA's FAMILY RESTAURANT

- **Confidence:** medium
- **Input:** address: Kakolu Rd, Suryodaya Layout, Rajanukunte, Karnataka 560119, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · phone: +918618598319 · coords: 13.172357, 77.5622645 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Nishas-Family-Restaurant/store/1c2bc55 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 352, 362, 371, 373, 378, 381, 384, 392, 403, 407, 410, 413, 414, 422, 424, 430, 450, 457, 470, 478, 480, 489, 496, 498, 506, 519, 525, 529, 549, 551 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.172357, 77.5622645 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Nishas-Family-Restaurant/store/1c2bc55. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 452: Northern Spices

- **Confidence:** medium
- **Input:** address: 1Rupee 5, 1, 5Gcj+V2H, Madhure Temple Road, Dinnur, Dibbur, Karnataka 560119, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · phone: +919901759311 · coords: 13.1724097, 77.53337239999999 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Northern-Spices/store/198b768 · cuisine: Restaurant · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 351, 541, 542 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.1724097, 77.53337239999999 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Northern-Spices/store/198b768. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 454: Nutrition With Neev

- **Confidence:** medium
- **Input:** address: Villa 7, Aakruthi Solitaire, Rajanukunte, Doddaballapur Road, Yelahanka, Bangalore, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · phone: +918310693173 · coords: 13.1814929, 77.5620315 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Nutrition-With-Neev/store/15912a1 · cuisine: Healthy Food · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 354 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.1814929, 77.5620315 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Nutrition-With-Neev/store/15912a1. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 456: only99

- **Confidence:** medium
- **Input:** address: default, default  , Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · phone: +917411764204 · coords: 13.175457, 77.559735 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Only99/store/16a5cbb · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 444 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.175457, 77.559735 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Only99/store/16a5cbb. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 457: Pakhwan Restaurant

- **Confidence:** medium
- **Input:** address: Shop 1, Rajankunte, Kakola Main Road, Yelahanka, Bangalore, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · phone: +918217703121 · coords: 13.1722716, 77.5614579 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Pakhwan-Restaurant/store/1642c36 · cuisine: North Indian, Chinese, Sichuan · listing_rating: 3.8 · listing_reviews: 299 · checked_on: 2026-10-11 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). External listing rating 3.8/299 recorded with source URL + check date — NEVER a Foodie community value. Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 352, 362, 364, 371, 373, 378, 381, 384, 392, 403, 407, 410, 413, 414, 419, 422, 424, 430, 450, 451, 458, 470, 480, 489, 496, 498, 506, 512, 519, 525, 529, 549, 551 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.1722716, 77.5614579 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Pakhwan-Restaurant/store/1642c36. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 458: Pakwan Restaurant

- **Confidence:** medium
- **Input:** address: Near Ranjanukunte Kakolu Road, Hesaraghatta, Bangalore, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · phone: +918217703121 · coords: 13.18415, 77.51851 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Pakwan-Restaurant/store/15914cc · cuisine: Chinese, North Indian · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 457 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.18415, 77.51851 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Pakwan-Restaurant/store/15914cc. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 459: Pooja Hotel

- **Confidence:** medium
- **Input:** address: Rajanukunte, Doddaballapura Main Road, Near Ramesh Shop, Yelahanka, Bangalore, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · phone: +918104666415 · coords: 13.1762465, 77.5641117 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Pooja-Hotel/store/51486b · cuisine: Biryani, South Indian, North Indian, Chinese · listing_rating: 4.9 · listing_reviews: 2 · checked_on: 2026-10-11 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). External listing rating 4.9/2 recorded with source URL + check date — NEVER a Foodie community value. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 432, 437, 438, 440 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.1762465, 77.5641117 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Pooja-Hotel/store/51486b. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 460: Prathayi

- **Confidence:** medium
- **Input:** address: 10, Khatha 1085/67, Ground Floor, 1st Main, Kakolu Road, Yelahanka, Bangalore, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · phone: +918660205945 · coords: 13.1723538, 77.5580779 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Prathayi/store/1791425 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 365, 502 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.1723538, 77.5580779 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Prathayi/store/1791425. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 461: Raamu Dhaba

- **Confidence:** medium
- **Input:** address: 67, Adde Vishwanathapura, Rajanukunte, Kakolu Road, Yelahanka, Bangalore, Bengaluru, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · coords: 13.1700556692, 77.5521737337 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Raamu-Dhaba/store/4694739 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 434, 500 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.1700556692, 77.5521737337 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Raamu-Dhaba/store/4694739. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 462: Rachana Bar by Golden Amulya

- **Confidence:** medium
- **Input:** address: Doddaballapura Main Rd, east colony, Bengaluru, J.I.Suradenapura, Karnataka 562110, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · phone: +919686331162 · coords: 13.2006949, 77.5612931 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Rachana-Bar-By-Golden-Amulya/store/200802a · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 463 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.2006949, 77.5612931 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Rachana-Bar-By-Golden-Amulya/store/200802a. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 463: RACHANA MRP

- **Confidence:** medium
- **Input:** address: Suradhenupura, J.I.Suradenapura, Karnataka 562110, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · phone: +917975905595 · coords: 13.2004796, 77.5613442 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Rachana-Mrp/store/200802b · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 174, 372, 462 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.2004796, 77.5613442 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Rachana-Mrp/store/200802b. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 464: Rajankunte Just Bake

- **Confidence:** medium
- **Input:** address: 1, Opposite Rajanukunte Police Station, Doddaballapur Main Road, Yelahanka, Bangalore, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · phone: +919740474445 · coords: 13.1744949, 77.564139 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Rajankunte-Just-Bake/store/1762845 · listing_rating: 4.2 · listing_reviews: 44 · checked_on: 2026-10-11 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). External listing rating 4.2/44 recorded with source URL + check date — NEVER a Foodie community value. Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 394, 408, 409 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.1744949, 77.564139 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Rajankunte-Just-Bake/store/1762845. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 465: Rajanukunte

- **Confidence:** medium
- **Input:** address: 15, Suryodaya Layout, Rajanukunte, Bengaluru, Karnataka 560119, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · coords: 13.1717348, 77.5643048 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Rajanukunte/store/1b092bc · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 324, 353, 355, 361, 378, 404, 408, 411, 447, 472, 484, 485, 488, 494, 501, 504, 508, 510, 526 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.1717348, 77.5643048 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Rajanukunte/store/1b092bc. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 467: Rayalaseema Spice

- **Confidence:** medium
- **Input:** address: near PRESIDENCY UNIVERSITY, Rajanukunte, Bengaluru, Karnataka 560089, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · coords: 13.1726975, 77.5364896 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Rayalaseema-Spice/store/1b12924 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 358, 368, 383, 386, 387, 398, 400, 412, 415, 416, 421, 493, 503, 523, 524, 533, 538, 543, 546, 548 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.1726975, 77.5364896 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Rayalaseema-Spice/store/1b12924. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 469: RocKings Cafe

- **Confidence:** medium
- **Input:** address: Itgalpura, behind Essar Fuel Station, Bengaluru, Chokkanahalli, Karnataka 560119, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · coords: 13.1749704, 77.54238649999999 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Rockings-Cafe/store/3cc27a9 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 379, 389, 396, 530, 531, 532 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.1749704, 77.54238649999999 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Rockings-Cafe/store/3cc27a9. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 470: Royal Dining

- **Confidence:** medium
- **Input:** address: Rajanukunte, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · phone: +919742663310 · coords: 13.1726527, 77.5622247 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Royal-Dining/store/92b589 · cuisine: Kerala, Chinese, BBQ · listing_rating: 4.9 · listing_reviews: 1 · checked_on: 2026-10-11 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). External listing rating 4.9/1 recorded with source URL + check date — NEVER a Foodie community value. · notes: Round-4 single-source lead (2026-10-11).
- **Matches to existing records:**
  - `e989603f` **Hotel Royal Nandhana** · locality: Arehalli Guddadahalli — similarity 0.571 (name-ambiguous-proper-token) · existing coords: NULL — confidence low
- **Intra-file duplicates:** rows 352, 362, 371, 373, 378, 381, 384, 392, 403, 407, 410, 413, 414, 419, 422, 424, 430, 450, 451, 457, 478, 480, 489, 496, 498, 506, 512, 519, 525, 529, 549, 551 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.1726527, 77.5622247 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Royal-Dining/store/92b589. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `LOCALITY_CONFLICT`, `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 471: Rua

- **Confidence:** medium
- **Input:** address: Survey 90, 94 & 95, Ground Floor, Rajanakunte, Yelahanka, Bangalore, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · phone: +918884440278 · coords: 13.1755063361, 77.5477215239 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Rua/store/18701cc · listing_rating: 4 · listing_reviews: 45 · checked_on: 2026-10-11 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). External listing rating 4/45 recorded with source URL + check date — NEVER a Foodie community value. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 425, 477, 509 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.1755063361, 77.5477215239 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Rua/store/18701cc. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 472: Royal Juice Corner

- **Confidence:** medium
- **Input:** address: Doddaballapura Main Road, Near Chiguru Hospital, Yelahanka, Bangalore, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · phone: +918123642781 · coords: 13.17094265, 77.56437946 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Royal-Juice-Corner/store/15a205b · cuisine: Juices, Shakes, Ice Cream, Desserts · listing_rating: 4 · listing_reviews: 66 · checked_on: 2026-10-11 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). External listing rating 4/66 recorded with source URL + check date — NEVER a Foodie community value. Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 353, 361, 447, 465, 484, 485, 494, 501, 507, 510, 526 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.17094265, 77.56437946 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Royal-Juice-Corner/store/15a205b. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 474: S B Tea Cafe

- **Confidence:** medium
- **Input:** address: 249/1, BMR Complex, Rajanukunte, Kakolu Road, Yelahanka, Bangalore, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · phone: +919686685839 · coords: 13.1706828, 77.5538882 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/S-B-Tea-Cafe/store/1762868 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 423, 443, 511 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.1706828, 77.5538882 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/S-B-Tea-Cafe/store/1762868. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 475: S G Iyengar Bakery

- **Confidence:** medium
- **Input:** address: Adhiganahalli., Rajanakunte, Bengaluru, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · phone: +918147516308 · coords: 13.1728946, 77.5694325 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/S-G-Iyengar-Bakery/store/92b725 · cuisine: Cake · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 540 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.1728946, 77.5694325 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/S-G-Iyengar-Bakery/store/92b725. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 477: S R V CORNER DHABA AND FAMILY RESTAURANT

- **Confidence:** medium
- **Input:** address: Arakere Cross, Kakol Road, Itagalpura Main Rd, Rajanukunte, Bengaluru, Karnataka 560119, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · phone: +918088307568 · coords: 13.174961, 77.5483278 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/S-R-V-Corner-Dhaba-And-Family-Restaurant/store/186c163 · cuisine: Dinner, Lunch · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 425, 471, 509, 544 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.174961, 77.5483278 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/S-R-V-Corner-Dhaba-And-Family-Restaurant/store/186c163. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 478: S.L.V Cake Corner

- **Confidence:** medium
- **Input:** address: 8, 5Hf7+248, 9, Division, Suryodaya Layout, Rajanukunte, Bengaluru, Karnataka 560119, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · phone: +919986558271 · coords: 13.1727378, 77.5627926 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/S.l.v-Cake-Corner/store/19a2b74 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 362, 371, 373, 381, 384, 403, 407, 410, 413, 414, 422, 424, 430, 450, 451, 470, 480, 489, 496, 498, 519, 525, 529, 549, 551 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.1727378, 77.5627926 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/S.l.v-Cake-Corner/store/19a2b74. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 480: Seoul Fried Chicken

- **Confidence:** medium
- **Input:** address: yelahanka, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · coords: 13.173067, 77.561563 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Seoul-Fried-Chicken/store/174170b · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 352, 359, 362, 364, 371, 373, 378, 381, 384, 392, 403, 407, 410, 413, 414, 419, 422, 424, 430, 450, 451, 457, 470, 478, 489, 496, 498, 506, 512, 519, 525, 529, 549, 551 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.173067, 77.561563 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Seoul-Fried-Chicken/store/174170b. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 482: SHREE ANNAPOORNESHWARI IDLI HOTEL

- **Confidence:** medium
- **Input:** address: Shanubhoganahalli Rd, Shanubhoganahalli, Karnataka 560089, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · coords: 13.172649799999999, 77.5285785 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Shree-Annapoorneshwari-Idli-Hotel/store/47828b8 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 360, 363, 391, 483, 497 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.172649799999999, 77.5285785 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Shree-Annapoorneshwari-Idli-Hotel/store/47828b8. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 483: Shree Annapoorneswari Idli Hotel

- **Confidence:** medium
- **Input:** address: Shop 1, Guru Plaza, Madhure Main Road, Shanubhoganahalli, Rajanukunte, Hesaraghatta, Bangalore, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · coords: 13.1726010707, 77.5285592287 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Shree-Annapoorneswari-Idli-Hotel/store/2c6b3a5 · listing_rating: 4 · listing_reviews: 31 · checked_on: 2026-10-11 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). External listing rating 4/31 recorded with source URL + check date — NEVER a Foodie community value. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 360, 363, 391, 482, 497 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.1726010707, 77.5285592287 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Shree-Annapoorneswari-Idli-Hotel/store/2c6b3a5. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 484: Shree Nandi Cake Palace & Sweets

- **Confidence:** medium
- **Input:** address: 5HC7+HPJ, Suryodaya Layout, Rajanukunte, Karnataka 560119, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · coords: 13.1714731, 77.5642621 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Shree-Nandi-Cake-Palace-and-Sweets/store/1b07641 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 353, 355, 361, 404, 447, 465, 472, 485, 494, 501, 508, 510, 526 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.1714731, 77.5642621 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Shree-Nandi-Cake-Palace-and-Sweets/store/1b07641. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 485: Shreeshaila Khanavali

- **Confidence:** medium
- **Input:** address: Doddaballapur Main Road, Rajankunte, Yelahanka, Bangalore, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · phone: +919591252666 · coords: 13.171808, 77.564304 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Shreeshaila-Khanavali/store/162caa4 · cuisine: South Indian · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 353, 355, 361, 404, 411, 447, 465, 472, 484, 488, 501, 504, 508, 510, 526 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.171808, 77.564304 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Shreeshaila-Khanavali/store/162caa4. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 487: Siri Vruksha Cafe

- **Confidence:** medium
- **Input:** address: Presidency University Rd, beside SLV Girls PG, Rajanukunte, Bengaluru, Karnataka 560119, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · phone: +919108682218 · coords: 13.1738988, 77.5386023 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Siri-Vruksha-Cafe/store/199573b · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 376, 441 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.1738988, 77.5386023 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Siri-Vruksha-Cafe/store/199573b. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 488: SLN Hotel & Tasty Rolls Center

- **Confidence:** medium
- **Input:** address: 49, Ground Floor, Varane Complex, Rajanukunte, Yelahanka, Bangalore, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · phone: +919844392962 · coords: 13.1729901, 77.5644142 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Sln-Hotel-and-Tasty-Rolls-Center/store/176289a · listing_rating: 3.2 · listing_reviews: 10 · checked_on: 2026-10-11 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). External listing rating 3.2/10 recorded with source URL + check date — NEVER a Foodie community value. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 355, 361, 394, 404, 409, 411, 447, 465, 485, 501, 504, 508, 510 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.1729901, 77.5644142 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Sln-Hotel-and-Tasty-Rolls-Center/store/176289a. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 489: Slurpy Shakes

- **Confidence:** medium
- **Input:** address: Rajanukunte, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · coords: 13.173067, 77.561563 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Slurpy-Shakes/store/1743240 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 352, 359, 362, 364, 371, 373, 378, 381, 384, 392, 403, 407, 410, 413, 414, 419, 422, 424, 430, 450, 451, 457, 470, 478, 480, 496, 498, 506, 512, 519, 525, 529, 549, 551 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.173067, 77.561563 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Slurpy-Shakes/store/1743240. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 493: Spicy Kadai

- **Confidence:** medium
- **Input:** address: 83/3, Ground Floor, Dibbur Road, Opposite Presidency University, Yelahanka, Bangalore, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · phone: +918159999681 · coords: 13.1720575, 77.53652237 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Spicy-Kadai/store/17628ab · listing_rating: 3 · listing_reviews: 6 · checked_on: 2026-10-11 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). External listing rating 3/6 recorded with source URL + check date — NEVER a Foodie community value. Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 358, 368, 383, 386, 387, 398, 402, 412, 415, 416, 421, 429, 467, 503, 523, 524, 533, 534, 538, 543, 546, 548 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.1720575, 77.53652237 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Spicy-Kadai/store/17628ab. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 494: Sri Annapoorneshwari Hotel Pure Veg

- **Confidence:** medium
- **Input:** address: 14, Rajanukunte, Karnataka 560119, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · coords: 13.170490099999999, 77.56462119999999 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Sri-Annapoorneshwari-Hotel-Pure-Veg/store/1a5a339 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Matches to existing records:**
  - `f74252ef` **Sri Annapoorneshwari Tiffin Center** · locality: Doddaballapura town — similarity 0.633 (name-ambiguous-proper-token) · existing coords: NULL — confidence low
- **Intra-file duplicates:** rows 353, 445, 447, 465, 472, 484, 507, 526 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.170490099999999, 77.56462119999999 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Sri-Annapoorneshwari-Hotel-Pure-Veg/store/1a5a339. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `LOCALITY_CONFLICT`, `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 495: Sri Banshankari Donne Biryani House

- **Confidence:** low
- **Input:** address: default, default  , Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · phone: +918867233265 · coords: 13.152616, 77.534034 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Sri-Banshankari-Donne-Biryani-House/store/16a8119 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Matches to existing records:**
  - `5218d019` **Chickpet Donne Biryani House** — similarity 0.71 (name-ambiguous-proper-token) · existing coords: NULL — confidence low
- **Coordinates awaiting confirmation:** 13.152616, 77.534034 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Sri-Banshankari-Donne-Biryani-House/store/16a8119. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Recommended initial verification_status:** unverified

### Row 496: Sri curries

- **Confidence:** medium
- **Input:** address: Kakolu Rd, Suryodaya Layout, Rajanukunte, Karnataka 560064, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · phone: +919008479105 · coords: 13.1725067, 77.5623955 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Sri-Curries/store/1ac66cc · listing_rating: 4 · listing_reviews: 172 · checked_on: 2026-10-11 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). External listing rating 4/172 recorded with source URL + check date — NEVER a Foodie community value. Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 362, 371, 373, 378, 381, 384, 392, 403, 407, 410, 413, 414, 422, 424, 430, 450, 451, 457, 470, 478, 480, 489, 498, 506, 519, 525, 529, 549, 551 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.1725067, 77.5623955 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Sri-Curries/store/1ac66cc. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 497: SRI CHOWDESWARI CHICKEN CENTER

- **Confidence:** medium
- **Input:** address: Madhure Temple Road, Dibbur, Karnataka 560119, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · phone: +917353663333 · coords: 13.172600399999999, 77.5298128 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Sri-Chowdeswari-Chicken-Center/store/19ab71c · cuisine: Chicken & Mutton Shop · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 349, 363, 374, 375, 388, 390, 391, 417, 436, 482, 483, 505, 528, 537 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.172600399999999, 77.5298128 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Sri-Chowdeswari-Chicken-Center/store/19ab71c. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 498: Sri Bramhalingeshwara Condiments

- **Confidence:** medium
- **Input:** address: Rajanukunte Rajanukunte, Bengaluru, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · phone: +918762183508 · coords: 13.1725738, 77.5615901 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Sri-Bramhalingeshwara-Condiments/store/930215 · cuisine: Cake · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 352, 359, 362, 364, 371, 373, 378, 381, 384, 392, 403, 407, 410, 413, 414, 419, 422, 424, 430, 450, 451, 457, 470, 478, 480, 489, 496, 506, 512, 519, 525, 529, 549, 551 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.1725738, 77.5615901 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Sri-Bramhalingeshwara-Condiments/store/930215. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 499: Sri Durga Farm Fresh

- **Confidence:** medium
- **Input:** address: 35, Addiganahalli, Rajanukunte, Yelahanka, Bangalore, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · phone: +919535229646 · coords: 13.1691392, 77.5711996 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Sri-Durga-Farm-Fresh/store/1737a73 · cuisine: Salad, Juices, Shakes · listing_rating: 3.8 · listing_reviews: 2 · checked_on: 2026-10-11 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). External listing rating 3.8/2 recorded with source URL + check date — NEVER a Foodie community value. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 535 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.1691392, 77.5711996 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Sri-Durga-Farm-Fresh/store/1737a73. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 500: Sri Gurudarshini Veg Cafe

- **Confidence:** medium
- **Input:** address: 67, Adde Vishwanathapura, Rajanukunte, Kakolu Road, Yelahanka, Bangalore, Bengaluru, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · coords: 13.16994, 77.552135 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Sri-Gurudarshini-Veg-Cafe/store/4121074 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 434, 461 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.16994, 77.552135 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Sri-Gurudarshini-Veg-Cafe/store/4121074. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 501: Sri Krishna Bakery

- **Confidence:** medium
- **Input:** address: 5HC7+VPC, SH 9, Suryodaya Layout, Rajanukunte, Karnataka 560119, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · coords: 13.172197599999999, 77.56425949999999 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Sri-Krishna-Bakery/store/1b01639 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 355, 361, 404, 411, 447, 465, 472, 484, 485, 488, 504, 508, 510, 526 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.172197599999999, 77.56425949999999 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Sri-Krishna-Bakery/store/1b01639. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 502: Sri Lakshmi Venkateshwara Iyengar Bakery

- **Confidence:** medium
- **Input:** address: Sri Banashankari Layout, Rajanukunte, Karnataka 560119, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · coords: 13.1714141, 77.5581946 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Sri-Lakshmi-Venkateshwara-Iyengar-Bakery/store/1a558b2 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 365, 460 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.1714141, 77.5581946 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Sri-Lakshmi-Venkateshwara-Iyengar-Bakery/store/1a558b2. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 503: Sri manjunath juice and condiments

- **Confidence:** medium
- **Input:** address: Presidency University Rd, Rajanukunte, Chokkanahalli, Karnataka 560064, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · coords: 13.173041399999999, 77.5366754 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Sri-Manjunath-Juice-And-Condiments/store/1b0757b · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 368, 376, 383, 386, 387, 398, 400, 412, 416, 421, 441, 467, 493, 523, 524, 538, 548 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.173041399999999, 77.5366754 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Sri-Manjunath-Juice-And-Condiments/store/1b0757b. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 504: SRI MANJUNATHA BAKERY & SWEET

- **Confidence:** medium
- **Input:** address: Suryodaya Layout, Rajanukunte, Karnataka 560119, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · coords: 13.172883599999999, 77.5642733 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Sri-Manjunatha-Bakery-and-Sweet/store/1a53545 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 355, 361, 394, 404, 409, 411, 447, 465, 485, 488, 501, 508, 510 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.172883599999999, 77.5642733 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Sri-Manjunatha-Bakery-and-Sweet/store/1a53545. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 505: Sri Maruti Hotel

- **Confidence:** medium
- **Input:** address: No 8, Devraj Building, Kakolu Main Road, Dibbur, Bengaluru, Karnataka 560119, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · phone: +919964794132 · coords: 13.1724786, 77.5305789 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Sri-Maruti-Hotel/store/19853c3 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 363, 374, 375, 388, 390, 391, 417, 436, 497, 528, 537 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.1724786, 77.5305789 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Sri-Maruti-Hotel/store/19853c3. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 506: Sri Raghavendra Hotel

- **Confidence:** medium
- **Input:** address: 5HC6+VF6, Suryodaya Layout, Rajanukunte, Karnataka 560119, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · coords: 13.172150499999999, 77.5611536 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Sri-Raghavendra-Hotel/store/1b07a9a · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 352, 364, 371, 373, 378, 381, 384, 392, 403, 407, 410, 413, 414, 419, 430, 439, 442, 450, 451, 457, 470, 480, 489, 496, 498, 512, 519, 525, 529, 549, 551 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.172150499999999, 77.5611536 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Sri-Raghavendra-Hotel/store/1b07a9a. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 507: Sri Sai Boarding & Lodging Attached Bar & Restaurant

- **Confidence:** medium
- **Input:** address: 8, 5Hc7+2W6, 9, Division, Suryodaya Layout, Rajanukunte, Bengaluru, Karnataka 560119, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · phone: +917899976504 · coords: 13.169994599999999, 77.5643362 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Sri-Sai-Boarding-and-Lodging-Attached-Bar-and-Restaurant/store/18acc30 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 353, 428, 472, 494, 526 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.169994599999999, 77.5643362 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Sri-Sai-Boarding-and-Lodging-Attached-Bar-and-Restaurant/store/18acc30. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 508: Sri Sai Krishna Hot Chips

- **Confidence:** medium
- **Input:** address: Rajanukunte, Karnataka 560119, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · coords: 13.172631299999999, 77.5645341 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Sri-Sai-Krishna-Hot-Chips/store/1b01435 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 355, 361, 404, 411, 447, 465, 484, 485, 488, 501, 504, 510 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.172631299999999, 77.5645341 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Sri-Sai-Krishna-Hot-Chips/store/1b01435. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 509: Sri Samarth Grand Pure Veg Hotel

- **Confidence:** medium
- **Input:** address: Kakolu Main Road, Rajankunte, Yelahanka, Bangalore, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · phone: +916364689180 · coords: 13.17551104, 77.54712446 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Sri-Samarth-Grand-Pure-Veg-Hotel/store/1561a22 · cuisine: South Indian, North Indian, Biryani, Chinese, Street Food, Fast Food, Juices, Shakes · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Matches to existing records:**
  - `987dad98` **Shri Manjunatha Grand Veg** · locality: Doddaballapura Railway Station — similarity 0.455 (name-ambiguous-proper-token) · existing coords: NULL — confidence low
  - `60cc569b` **Sri Ganesh Grand** · locality: Bashettihalli — similarity 0.364 (name-ambiguous-proper-token) · distance: 10.288 km · existing coords: 13.2679055, 77.5521405 — confidence low
- **Intra-file duplicates:** rows 471, 477 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.17551104, 77.54712446 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Sri-Samarth-Grand-Pure-Veg-Hotel/store/1561a22. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `LOCALITY_CONFLICT`, `LOCALITY_CONFLICT`, `EXISTING_COORDINATES_DIFFER`, `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 510: Sri Shaila Khanavali

- **Confidence:** medium
- **Input:** address: Rajakunte, Doddaballapura Road, Yelahanka, Bangalore, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · phone: +919743966655 · coords: 13.1720622, 77.5642466 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Sri-Shaila-Khanavali/store/1773611 · listing_rating: 4.1 · listing_reviews: 84 · checked_on: 2026-10-11 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). External listing rating 4.1/84 recorded with source URL + check date — NEVER a Foodie community value. Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 353, 355, 361, 404, 411, 447, 465, 472, 484, 485, 488, 501, 504, 508, 526 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.1720622, 77.5642466 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Sri-Shaila-Khanavali/store/1773611. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 511: Sri Venkateshwara Hotel

- **Confidence:** medium
- **Input:** address: Rajankunte, Kakol Road, Yelahanka, Bangalore, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · coords: 13.17117476, 77.55515099 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Sri-Venkateshwara-Hotel/store/155080c · cuisine: South Indian · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 316, 423, 443, 474 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.17117476, 77.55515099 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Sri-Venkateshwara-Hotel/store/155080c. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 512: Sri Venkateswara Juice Corner

- **Confidence:** medium
- **Input:** address: Rajunkunte Gowramma, Muninanjappa Sankeerna Adhe, Vishwanathapura Road, Yelahanka, Bangalore, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · phone: +919538014185 · coords: 13.1734845, 77.5612142 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Sri-Venkateswara-Juice-Corner/store/17628b4 · listing_rating: 4.4 · listing_reviews: 142 · checked_on: 2026-10-11 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). External listing rating 4.4/142 recorded with source URL + check date — NEVER a Foodie community value. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 352, 359, 371, 373, 378, 381, 384, 392, 403, 407, 410, 413, 414, 419, 422, 430, 457, 470, 480, 489, 498, 506, 519, 529, 549, 551 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.1734845, 77.5612142 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Sri-Venkateswara-Juice-Corner/store/17628b4. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 513: Sri Vishnu Garden

- **Confidence:** medium
- **Input:** address: 18/5, Rajabukunte, Hesaraghstta Hobli, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · phone: +919972614632 · coords: 13.16810801, 77.56498665 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Sri-Vishnu-Garden/store/16bc740 · cuisine: Birthday Party, Wedding, Takeaway Available, Home Delivery, North Indian, Pure Veg · listing_rating: 4 · listing_reviews: 7 · checked_on: 2026-10-11 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). External listing rating 4/7 recorded with source URL + check date — NEVER a Foodie community value. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 428 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.16810801, 77.56498665 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Sri-Vishnu-Garden/store/16bc740. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 514: Srinivas Bar and Restaurant

- **Confidence:** medium
- **Input:** address: Unnamed Road, Kakolu Rd, Rajanukunte, Karnataka 560119, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · coords: 13.1724737, 77.5594824 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Srinivas-Bar-And-Restaurant/store/1a5a981 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 348, 365, 439, 442, 515, 516 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.1724737, 77.5594824 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Srinivas-Bar-And-Restaurant/store/1a5a981. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 515: Stir Fry Chinese Restaurant

- **Confidence:** medium
- **Input:** address: Shop 7/8, NMR Complex, Rajanukunte, Kakulo Road, Yelahanka, Bangalore, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · phone: +918147075400 · coords: 13.1720279, 77.5597062 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Stir-Fry-Chinese-Restaurant/store/1561934 · cuisine: Good Place for Kids, Family Friendly, Group Friendly, Dinner, Lunch, Veg Options Available, Halal Meat, Home Delivery · listing_rating: 4.9 · listing_reviews: 1 · checked_on: 2026-10-11 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). External listing rating 4.9/1 recorded with source URL + check date — NEVER a Foodie community value. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 348, 352, 364, 365, 439, 442, 514, 516 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.1720279, 77.5597062 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Stir-Fry-Chinese-Restaurant/store/1561934. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 516: STIR-FRY CHINESE RESTA

- **Confidence:** medium
- **Input:** address: OPP. SVIT COLLEGE GATE, Rajanukunte, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · phone: +919867885168 · coords: 13.172041182269266, 77.55970873891792 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Stir-fry-Chinese-Resta/store/15783b2 · cuisine: Chinese · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 348, 352, 364, 365, 439, 442, 514, 515 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.172041182269266, 77.55970873891792 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Stir-fry-Chinese-Resta/store/15783b2. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 517: Street 64 Cafe

- **Confidence:** medium
- **Input:** address: 5GFR+H64, Ittagallpura, Karnataka 560119, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · phone: +919739446906 · coords: 13.1738436, 77.54053569999999 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Street-64-Cafe/store/40a1571 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 366, 367, 377, 401, 427, 433 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.1738436, 77.54053569999999 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Street-64-Cafe/store/40a1571. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 519: Sundae Everyday Ice Creams

- **Confidence:** medium
- **Input:** address: Rajanukunte, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · phone: +917411908515 · coords: 13.173067, 77.561563 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Sundae-Everyday-Ice-Creams/store/1741a8c · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 352, 359, 362, 364, 371, 373, 378, 381, 384, 392, 403, 407, 410, 413, 414, 419, 422, 424, 430, 450, 451, 457, 470, 478, 480, 489, 496, 498, 506, 512, 525, 529, 549, 551 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.173067, 77.561563 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Sundae-Everyday-Ice-Creams/store/1741a8c. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 520: Sundance The Bistro

- **Confidence:** medium
- **Input:** address: Angsana Hotels & Resorts, Main Doddaballapur Road, Addevishwanathapura Village, Rajankunte, Near Yelahanka, Yelahanka, Bangalore, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · phone: +919870318067 · coords: 13.18220841, 77.56379239 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Sundance-The-Bistro/store/5ab6aa · cuisine: Continental, Italian, Desserts · listing_rating: 3.6 · listing_reviews: 34 · checked_on: 2026-10-11 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). External listing rating 3.6/34 recorded with source URL + check date — NEVER a Foodie community value. Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 426, 527 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.18220841, 77.56379239 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Sundance-The-Bistro/store/5ab6aa. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 523: Suto Cafe - Near Presidency University

- **Confidence:** medium
- **Input:** address: Arikere panchayat, Shop No. 1 & 2, Ground Floor,1st Cross, 9th Main Road, Chokkanahalli Village, Kakol Post, Taluk, near presidency University Yelahanka, Bengaluru, Karnataka 560089, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · coords: 13.172662299999999, 77.536506 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Suto-Cafe-Near-Presidency-University/store/1b08551 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 358, 368, 383, 386, 387, 398, 400, 412, 415, 416, 421, 467, 493, 503, 524, 533, 538, 543, 546, 548 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.172662299999999, 77.536506 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Suto-Cafe-Near-Presidency-University/store/1b08551. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 524: Suto Cafe

- **Confidence:** medium
- **Input:** address: 01/02, Ground Floor, Doddaballapura, Yelahanka, Bangalore, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · phone: +918217466334 · coords: 13.1729134167, 77.5365173067 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Suto-Cafe/store/17c7c93 · listing_rating: 3.8 · listing_reviews: 48 · checked_on: 2026-10-11 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). External listing rating 3.8/48 recorded with source URL + check date — NEVER a Foodie community value. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 358, 368, 383, 386, 387, 398, 400, 412, 415, 416, 421, 441, 467, 493, 503, 523, 538, 546, 548 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.1729134167, 77.5365173067 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Suto-Cafe/store/17c7c93. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 525: Tadipatri Dum Biryani Restaurant

- **Confidence:** medium
- **Input:** address: Shop 01, Kakolu Road, Rajanakunte, Opposite SBI, Yelahanka, Bangalore, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · phone: +919440044980 · coords: 13.172394, 77.562194 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Tadipatri-Dum-Biryani-Restaurant/store/1583232 · cuisine: Chinese, North Indian, Mughlai, Biryani, Kebab · listing_rating: 4 · listing_reviews: 7 · checked_on: 2026-10-11 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). External listing rating 4/7 recorded with source URL + check date — NEVER a Foodie community value. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 352, 362, 371, 373, 378, 381, 384, 392, 403, 407, 410, 413, 414, 422, 424, 430, 450, 451, 457, 470, 478, 480, 489, 496, 498, 506, 519, 529, 549, 551 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.172394, 77.562194 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Tadipatri-Dum-Biryani-Restaurant/store/1583232. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 526: Taj Hotel

- **Confidence:** medium
- **Input:** address: Db Pur, Dasarahalli Main Rd, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · phone: +918310342756 · coords: 13.1710401, 77.5642984 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Taj-Hotel/store/9312c2 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 353, 361, 447, 465, 472, 484, 485, 494, 501, 507, 510 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.1710401, 77.5642984 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Taj-Hotel/store/9312c2. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 527: Tangerine

- **Confidence:** medium
- **Input:** address: Angsana Hotels & Resorts, Main Doddaballapur Road, Addevishwanathapura Village, Rajankunte, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · phone: +918028468892 · coords: 13.18221592, 77.56379005 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Tangerine/store/1c93c · cuisine: North Indian, South Indian, Biryani, Italian, Fast Food, Desserts · listing_rating: 4.4 · listing_reviews: 13 · checked_on: 2026-10-11 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). External listing rating 4.4/13 recorded with source URL + check date — NEVER a Foodie community value. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 426, 520 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.18221592, 77.56379005 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Tangerine/store/1c93c. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 528: THE ADDA CAFE

- **Confidence:** medium
- **Input:** address: Dibbur gate , Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · phone: +918509670455 · coords: 13.1725531, 77.530183 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/The-Adda-Cafe/store/2250cbb · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 363, 374, 375, 388, 390, 391, 417, 436, 497, 505, 537 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.1725531, 77.530183 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/The-Adda-Cafe/store/2250cbb. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 529: The Dessert Zone

- **Confidence:** medium
- **Input:** address: Rajanukunte, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · coords: 13.173067, 77.561563 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/The-Dessert-Zone/store/1742335 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 352, 359, 362, 364, 371, 373, 378, 381, 384, 392, 403, 407, 410, 413, 414, 419, 422, 424, 430, 450, 451, 457, 470, 478, 480, 489, 496, 498, 506, 512, 519, 525, 549, 551 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.173067, 77.561563 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/The-Dessert-Zone/store/1742335. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 530: the gooden pavilion

- **Confidence:** medium
- **Input:** address: default, default  , Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · phone: +919618800173 · coords: 13.175011, 77.542944 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/The-Gooden-Pavilion/store/16a7399 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 379, 389, 396, 469, 531, 532 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.175011, 77.542944 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/The-Gooden-Pavilion/store/16a7399. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 531: The Golden Pavilion

- **Confidence:** medium
- **Input:** address: Opposite Tene Food Products, Yelahanka, Bangalore, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · phone: +919618800173 · coords: 13.17490352, 77.54295599 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/The-Golden-Pavilion/store/1665463 · cuisine: North Indian, Chinese · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 379, 389, 396, 469, 530, 532 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.17490352, 77.54295599 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/The-Golden-Pavilion/store/1665463. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 532: The Golden Pavilion Multi Cuisine Restaurant

- **Confidence:** medium
- **Input:** address: Itagalpura, Rajanukunte, Yelahanka, Bangalore, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · phone: +917893600173 · coords: 13.1749199, 77.5429394 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/The-Golden-Pavilion-Multi-Cuisine-Restaurant/store/1628815 · cuisine: South Indian, North Indian, Chinese, Sandwich, Fast Food, Street Food, Shakes · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 379, 389, 396, 469, 530, 531 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.1749199, 77.5429394 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/The-Golden-Pavilion-Multi-Cuisine-Restaurant/store/1628815. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 533: THE HOMEAWAY RESTAURANT

- **Confidence:** medium
- **Input:** address: 06,KNO-20, 5GCP+V5Q, 15/06, Madhure Temple Road, Dibburu, HGATTA (HOBLI, Dibbur, Bengaluru, Karnataka 560119, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · coords: 13.1719821, 77.535471 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/The-Homeaway-Restaurant/store/1b09c71 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 358, 368, 383, 386, 387, 398, 402, 412, 415, 416, 421, 467, 493, 523, 534, 538, 543, 546, 547, 548 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.1719821, 77.535471 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/The-Homeaway-Restaurant/store/1b09c71. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 534: The HomeAway

- **Confidence:** medium
- **Input:** address: 6, KNO-20/15/06, Ground Floor, Dibbur Village, H Ghatta, Yelahanka, Bangalore, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · phone: +919380557107 · coords: 13.17188919, 77.53530587 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/The-Homeaway/store/174a321 · cuisine: Biryani, South Indian, North Indian, Desserts · listing_rating: 4 · listing_reviews: 494 · checked_on: 2026-10-11 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). External listing rating 4/494 recorded with source URL + check date — NEVER a Foodie community value. Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 358, 383, 386, 387, 398, 402, 415, 416, 421, 493, 533, 538, 543, 546, 547, 548 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.17188919, 77.53530587 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/The-Homeaway/store/174a321. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 535: The loaded bun

- **Confidence:** medium
- **Input:** address: Addiganahalli , 1st crops Shree residency 2nd floor 204, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · phone: +919515901515 · coords: 13.1700716, 77.57096159999999 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/The-Loaded-Bun/store/17a2378 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 499 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.1700716, 77.57096159999999 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/The-Loaded-Bun/store/17a2378. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 537: The Paradice Restaurant

- **Confidence:** medium
- **Input:** address: Shanubhoganahalli, Karnataka 560085, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · coords: 13.172312499999999, 77.5303125 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/The-Paradice-Restaurant/store/4252007 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 363, 374, 375, 388, 390, 391, 417, 436, 497, 505, 528 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.172312499999999, 77.5303125 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/The-Paradice-Restaurant/store/4252007. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 538: The Student Cafe

- **Confidence:** medium
- **Input:** address: Shop 8, Opposite Presidnecy University, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · phone: +919035773315 · coords: 13.171849, 77.536212 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/The-Student-Cafe/store/3967aa · cuisine: Fast Food · listing_rating: 4.6 · listing_reviews: 5 · checked_on: 2026-10-11 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). External listing rating 4.6/5 recorded with source URL + check date — NEVER a Foodie community value. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 358, 368, 383, 386, 387, 398, 402, 412, 415, 416, 421, 429, 467, 493, 503, 523, 524, 533, 534, 543, 546, 548 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.171849, 77.536212 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/The-Student-Cafe/store/3967aa. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 540: V S D K Dum Biriyani Center

- **Confidence:** medium
- **Input:** address: G K Complex, Addiganahalli, Yelahanka, Bangalore, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · phone: +919008818817 · coords: 13.173263, 77.568473 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/V-S-D-K-Dum-Biriyani-Center/store/15a7830 · cuisine: Biryani, South Indian, Street Food · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 475 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.173263, 77.568473 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/V-S-D-K-Dum-Biriyani-Center/store/15a7830. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 541: Vamika Kitchen Cafe

- **Confidence:** medium
- **Input:** address: Shanubhogana Halli, Rajankunte, Dibur Main Road, Opposite KIOC Turf Ground, Hesaraghatta, Bangalore, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · phone: +919398719622 · coords: 13.1724597, 77.5324758 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Vamika-Kitchen-Cafe/store/1781102 · listing_rating: 4.2 · listing_reviews: 537 · checked_on: 2026-10-11 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). External listing rating 4.2/537 recorded with source URL + check date — NEVER a Foodie community value. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 351, 452, 542 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.1724597, 77.5324758 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Vamika-Kitchen-Cafe/store/1781102. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 542: Variar Cake House

- **Confidence:** medium
- **Input:** address: 5Gcp+R53, 5, Madhure Temple Road, Dinnur, Bengaluru, Dibbur, Karnataka 560119, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · phone: +919686200560 · coords: 13.1724097, 77.53337239999999 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Variar-Cake-House/store/1988310 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 351, 452, 541 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.1724097, 77.53337239999999 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Variar-Cake-House/store/1988310. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 543: Vcre8- Snacks & Drinks Cafe

- **Confidence:** medium
- **Input:** address: Vcre8 Cafe, Opposite to Presidency University 2-wheeler parking Madhure Temple Road, Dibbur, Bengaluru, Karnataka 560119, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · coords: 13.172012599999999, 77.5353547 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Vcre8-Snacks-and-Drinks-Cafe/store/1b33020 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 358, 368, 383, 386, 387, 398, 402, 415, 416, 421, 467, 493, 523, 533, 534, 538, 546, 547, 548 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.172012599999999, 77.5353547 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Vcre8-Snacks-and-Drinks-Cafe/store/1b33020. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 544: Vintage Liquors

- **Confidence:** medium
- **Input:** address: SY 24/2, Chokkanahalli, Yelahanka, Bangalore, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · phone: +919731356828 · coords: 13.17404418, 77.54814827 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Vintage-Liquors/store/1680b44 · cuisine: Mughlai, South Indian, Chinese, Salad, Bar Food, Biryani, North Indian, Street Food · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 425, 477, 545 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.17404418, 77.54814827 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Vintage-Liquors/store/1680b44. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 545: Vintage Restaurant

- **Confidence:** medium
- **Input:** address: Survey 24/2, Chokkanahalli, Arekera, Yelahanka, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · phone: +919731356828 · coords: 13.172219, 77.547791 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Vintage-Restaurant/store/1557799 · cuisine: North Indian, Mughlai, Chinese · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 544 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.172219, 77.547791 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Vintage-Restaurant/store/1557799. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 546: Vip engineer’s cafe and restaurant

- **Confidence:** medium
- **Input:** address: 5GCP+R7R, Madhure Temple Road, Dibbur, Karnataka 560119, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · coords: 13.172108, 77.5356013 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Vip-Engineer’s-Cafe-And-Restaurant/store/1a9c0b8 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 358, 368, 383, 386, 387, 398, 402, 412, 415, 416, 421, 467, 493, 523, 524, 533, 534, 538, 543, 547, 548 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.172108, 77.5356013 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Vip-Engineer%E2%80%99s-Cafe-And-Restaurant/store/1a9c0b8. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 547: Vismaya Food Court

- **Confidence:** medium
- **Input:** address: Survey 15/1 & 30/5, Ground Floor, Dibburu, Madhure Temple Road, Near Presidency University, Yelahanka, Bangalore, Bengaluru, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · coords: 13.1721547737, 77.5348621117 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Vismaya-Food-Court/store/3cbba16 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 358, 386, 387, 398, 402, 415, 421, 533, 534, 543, 546, 548 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.1721547737, 77.5348621117 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Vismaya-Food-Court/store/3cbba16. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 548: Waffle World

- **Confidence:** medium
- **Input:** address: 5Gcp+Rfv, Chokkanahalli, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · phone: +918484867576 · coords: 13.17212018, 77.53617704 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Waffle-World/store/1448b62 · cuisine: Waffles, Shakes · listing_rating: 4.9 · listing_reviews: 3 · checked_on: 2026-10-11 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). External listing rating 4.9/3 recorded with source URL + check date — NEVER a Foodie community value. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 358, 368, 383, 386, 387, 398, 402, 412, 415, 416, 421, 429, 467, 493, 503, 523, 524, 533, 534, 538, 543, 546, 547 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.17212018, 77.53617704 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Waffle-World/store/1448b62. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 549: WarmOven Cake & Desserts

- **Confidence:** medium
- **Input:** address: Rajanukunte, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · coords: 13.173067, 77.561563 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Warmoven-Cake-and-Desserts/store/1742336 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 352, 359, 362, 364, 371, 373, 378, 381, 384, 392, 403, 407, 410, 413, 414, 419, 422, 424, 430, 450, 451, 457, 470, 478, 480, 489, 496, 498, 506, 512, 519, 525, 529, 551 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.173067, 77.561563 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Warmoven-Cake-and-Desserts/store/1742336. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 551: Yablaka Foods

- **Confidence:** medium
- **Input:** address: Rajanukunte, Yelahanka, Bangalore, Rajanukunte, Bangalore, Bangalore · locality: Rajanukunte · city: Bangalore · phone: +917897877588 · coords: 13.17298148, 77.56148806 · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Yablaka-Foods/store/176298c · listing_rating: 4 · listing_reviews: 14 · checked_on: 2026-10-11 · evidence: directory_reported · uncertainty: Round-4 corridor continuation (2026-10-11): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim. SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6). magicpin files this store under area 'Rajanukunte' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation). External listing rating 4/14 recorded with source URL + check date — NEVER a Foodie community value. · notes: Round-4 single-source lead (2026-10-11).
- **Intra-file duplicates:** rows 352, 359, 362, 364, 371, 373, 378, 381, 384, 392, 403, 407, 410, 413, 414, 419, 422, 424, 430, 450, 451, 457, 470, 478, 480, 489, 496, 498, 506, 512, 519, 525, 529, 549 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.17298148, 77.56148806 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Yablaka-Foods/store/176298c. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

## Insufficient evidence (1)

### Row 74: Biryani Cafe

- **Confidence:** low
- **Input:** review_decision: needs_more_research · uncertainty: Fully generic name. Searches combining the name with Nagadenahalli, Doddaballapura and GITAM (2026-10-09) returned no matching listing in the target zones; several unrelated businesses elsewhere in Bengaluru share the name. The Phase 3C region grouping is the only locality hint and it is unverified. · notes: No listing found; nothing asserted about existence or newness. Row kept so the open question stays visible.
- **Recommended initial verification_status:** unverified

## Invalid or missing data (0)

_None._

## 6. Candidate coordinates awaiting confirmation (513)

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
| 128 | Brahmalingeshwara Hotel | possible_duplicate | 13.2632836, 77.5536407 | directory_reported | https://magicpin.in/Bangalore/Bashettihalli/Restaurant/Brahmalingeshwara-Hotel/store/1b19452 |
| 129 | DURGA PAN SHOP (ROYAL NANDANA) | potential_new | 13.2704995, 77.5517875 | directory_reported | https://magicpin.in/Bangalore/Bashettihalli/Restaurant/Durga-Pan-Shop-(Royal-Nandana)/store/1b00101 |
| 130 | Harika Restaurant | potential_new | 13.286655999999999, 77.56829739999999 | directory_reported | https://magicpin.in/Bangalore/Bashettihalli/Restaurant/Harika-Restaurant/store/2008145 |
| 131 | HJ biriyani house | possible_duplicate | 13.2744378, 77.55219459999999 | directory_reported | https://magicpin.in/Bangalore/Bashettihalli/Restaurant/Hj-Biriyani-House/store/1848494 |
| 132 | Hotel Divyabavani | possible_duplicate | 13.278393, 77.5561961 | directory_reported | https://magicpin.in/Bangalore/Bashettihalli/Restaurant/Hotel-Divyabavani/store/a2b502 |
| 133 | Hotel Shivakrupa | possible_duplicate | 13.257886899999999, 77.5533688 | directory_reported | https://magicpin.in/Bangalore/Bashettihalli/Restaurant/Hotel-Shivakrupa/store/4251c28 |
| 134 | HOTEL SHREE HANUMAN | potential_new | 13.267978099999999, 77.56561789999999 | directory_reported | https://magicpin.in/Bangalore/Bashettihalli/Restaurant/Hotel-Shree-Hanuman/store/47b3224 |
| 135 | Jnanav Food Court | possible_duplicate | 13.2621818234, 77.55420984 | directory_reported | https://magicpin.in/Bangalore/Bashettihalli/Restaurant/Jnanav-Food-Court/store/24812cc |
| 136 | Kanti Sweets Horamavu | possible_duplicate | 13.26131861308676, 77.55385110146638 | directory_reported | https://magicpin.in/Bangalore/Bashettihalli/Restaurant/Kanti-Sweets-Horamavu/store/155b4c1 |
| 137 | Lakshmi Caterers | Doddaballapur Industrial Area | potential_new | 13.286240099999999, 77.5712096 | directory_reported | https://magicpin.in/Bangalore/Bashettihalli/Restaurant/Lakshmi-Caterers-|-Doddaballapur-Industrial-Area/store/18b9325 |
| 138 | MANOj K C | possible_duplicate | 13.2630771, 77.5540426 | directory_reported | https://magicpin.in/Bangalore/Bashettihalli/Restaurant/Manoj-K-C/store/1976004 |
| 139 | Shiva Chats | potential_new | 13.26205039, 77.55608548 | directory_reported | https://magicpin.in/Bangalore/Bashettihalli/Restaurant/Shiva-Chats/store/17587c3 |
| 140 | Shree Dhaba Restaurant | potential_new | 13.272928499999999, 77.5445039 | directory_reported | https://magicpin.in/Bangalore/Bashettihalli/Restaurant/Shree-Dhaba-Restaurant/store/1849c26 |
| 141 | Sunil general store and condiment | possible_duplicate | 13.288587, 77.5771089 | directory_reported | https://magicpin.in/Bangalore/Bashettihalli/Restaurant/Sunil-General-Store-And-Condiment/store/1b0982b |
| 142 | Super Chai CLUB | possible_duplicate | 13.257717, 77.55349199999999 | directory_reported | https://magicpin.in/Bangalore/Bashettihalli/Restaurant/Super-Chai-Club/store/4474011 |
| 143 | Tejas Tefan Centre | potential_new | 13.2751596, 77.5814554 | directory_reported | https://magicpin.in/Bangalore/Bashettihalli/Restaurant/Tejas-Tefan-Centre/store/1506588 |
| 144 | Udupi Krishna Dhama | possible_duplicate | 13.272257, 77.552384 | directory_reported | https://magicpin.in/Bangalore/Bashettihalli/Restaurant/Udupi-Krishna-Dhama/store/1906789 |
| 145 | A2B - Adyar Ananda Bhavan | possible_duplicate | 13.26404, 77.718243 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/A2b-Adyar-Ananda-Bhavan/store/170243a |
| 146 | Aaradhya Grand | possible_duplicate | 13.263593, 77.7168845 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Aaradhya-Grand/store/22594bb |
| 147 | Amaravathi Gardenia Andhra Style Multi Cuisine Nonveg Restau | possible_duplicate | 13.2576758, 77.713668 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Amaravathi-Gardenia-Andhra-Style-Multi-Cuisine-Nonveg-Restau/store/18502c3 |
| 148 | Amaravathi Gardenia Andhra Style Multi Cuisine Nonveg Restaurant | possible_duplicate | 13.2576758, 77.713668 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Amaravathi-Gardenia-Andhra-Style-Multi-Cuisine-Nonveg-Restaurant/store/1981440 |
| 149 | Anjinappa Military Hotel | possible_duplicate | 13.2561753, 77.7099846 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Anjinappa-Military-Hotel/store/1791427 |
| 150 | Ayodhya Bela | possible_duplicate | 13.257391499999999, 77.71206939999999 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Ayodhya-Bela/store/443c3c5 |
| 151 | BAITH AL BHATKAL BIRYANI | potential_new | 13.1138529, 77.5795077 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Baith-Al-Bhatkal-Biryani/store/3734698 |
| 152 | Baskin Robbins | potential_new | 13.2609807, 77.7140271 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Baskin-Robbins/store/1c0377c |
| 153 | Belgian Waffle Factory | possible_duplicate | 13.261664, 77.7168631 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Belgian-Waffle-Factory/store/1a54136 |
| 154 | Bhukthi Food Place | possible_duplicate | 13.2784475, 77.7212777 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Bhukthi-Food-Place/store/543376 |
| 155 | Bhukti Family Restaurant | possible_duplicate | 13.2780896, 77.7213829 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Bhukti-Family-Restaurant/store/82433 |
| 156 | Café Coffee Day | possible_duplicate | 13.281977999999999, 77.72233949999999 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Caf%C3%A9-Coffee-Day/store/1975710 |
| 157 | Chaatimes | possible_duplicate | 13.2684048, 77.71955492 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Chaatimes/store/16a2842 |
| 158 | Chai Memories | possible_duplicate | 13.2504177, 77.70726839999999 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Chai-Memories/store/2072842 |
| 159 | Chai Point - Nandi Hills | possible_duplicate | 13.264046899999999, 77.7183735 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Chai-Point-Nandi-Hills/store/20468aa |
| 160 | Chai Park | possible_duplicate | 13.250464599999999, 77.7112952 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Chai-Park/store/1cca695 |
| 161 | Chikkaveeranna sweets | possible_duplicate | 13.257782599999999, 77.7138086 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Chikkaveeranna-Sweets/store/3bac443 |
| 162 | Chill D Monk | possible_duplicate | 13.26861207, 77.71938321 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Chill-D-Monk/store/1597958 |
| 163 | Deepa Idly | possible_duplicate | 13.26403808, 77.71849966 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Deepa-Idly/store/1758a39 |
| 164 | Costa Coffee | possible_duplicate | 13.264143599999999, 77.718406 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Costa-Coffee/store/20876b5 |
| 165 | Dera Punjab | possible_duplicate | 13.26919, 77.71933 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Dera-Punjab/store/1765129 |
| 166 | Desi Masala | possible_duplicate | 13.2639967, 77.71840999999999 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Desi-Masala/store/16c2c3b |
| 167 | Dk nattiy style restaurant | possible_duplicate | 13.2561308, 77.7111188 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Dk-Nattiy-Style-Restaurant/store/3b0bba3 |
| 168 | Domino's Chicken Fiesta | potential_new | 13.258235, 77.717834 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Dominos-Chicken-Fiesta/store/1785319 |
| 169 | EasyBites By Empire | possible_duplicate | 13.2632865, 77.7179268 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Easybites-By-Empire/store/1632558 |
| 170 | Empire Juices and Desserts | possible_duplicate | 13.26321911, 77.71784247 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Empire-Juices-And-Desserts/store/1673c76 |
| 171 | Empire restaurant since 1966 | possible_duplicate | 13.2632005, 77.71784339999999 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Empire-Restaurant-Since-1966/store/1694655 |
| 172 | Empire Restaurant-Devanahalli | possible_duplicate | 13.2632005, 77.71784339999999 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Empire-Restaurant-devanahalli/store/186c284 |
| 173 | Empire Restaurant | possible_duplicate | 13.26321911, 77.71784247 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Empire-Restaurant/store/1632557 |
| 174 | FISH LAND | possible_duplicate | 13.1993646, 77.5617449 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Fish-Land/store/1747740 |
| 175 | Gagan Devanhalli | possible_duplicate | 13.264827, 77.7181485 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Gagan-Devanhalli/store/924aca |
| 176 | Gagan | possible_duplicate | 13.264826999999999, 77.7181485 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Gagan/store/19842c6 |
| 177 | Gireema's Kitchen | possible_duplicate | 13.269506, 77.719952 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Gireemas-Kitchen/store/17934ac |
| 178 | Galaxy restaurant | possible_duplicate | 13.2634873, 77.7173406 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Galaxy-Restaurant/store/1c32c15 |
| 179 | Gowdru Dum Biriyani Hotel | possible_duplicate | 13.256748799999999, 77.71709729999999 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Gowdru-Dum-Biriyani-Hotel/store/1aa029c |
| 180 | Gowdru Mane Oota | possible_duplicate | 13.2576801, 77.712651 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Gowdru-Mane-Oota/store/1b03854 |
| 181 | Gowdru Dum Biriyani | possible_duplicate | 13.25670873, 77.71707058 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Gowdru-Dum-Biriyani/store/16894c2 |
| 182 | Grandpaw Pet Resort | potential_new | 13.28344858, 77.70805467 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Grandpaw-Pet-Resort/store/a81a18 |
| 183 | Green Park Restaurant | possible_duplicate | 13.25564266, 77.71719554 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Green-Park-Restaurant/store/51cb39 |
| 184 | Halli Mane Oota | possible_duplicate | 13.2569966, 77.7152497 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Halli-Mane-Oota/store/1642275 |
| 185 | Honey Comb | possible_duplicate | 13.2680657, 77.7195399 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Honey-Comb/store/925801 |
| 186 | India Sweet House | possible_duplicate | 13.2684048, 77.71955492 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/India-Sweet-House/store/1634548 |
| 187 | Indian Paratha Company | possible_duplicate | 13.2622242, 77.7163153 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Indian-Paratha-Company/store/21301 |
| 188 | Indian Paratha Company-Chai Paratha More | possible_duplicate | 13.2623363, 77.7163226 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Indian-Paratha-Company-chai-Paratha-More/store/185069a |
| 189 | Indian sweet house | possible_duplicate | 13.2815978, 77.7228125 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Indian-Sweet-House/store/2081720 |
| 190 | IRANI CHAI TEA | possible_duplicate | 13.261666199999999, 77.7168647 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Irani-Chai-Tea/store/2072843 |
| 191 | J K Kabab | possible_duplicate | 13.2508145, 77.7146804 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/J-K-Kabab/store/bc03c4 |
| 192 | Karavali Grand | possible_duplicate | 13.2634723, 77.7173411 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Karavali-Grand/store/18216c8 |
| 193 | keshava Annapoorneshwari catering and flower decoration | potential_new | 13.2521715, 77.7105012 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Keshava-Annapoorneshwari-Catering-And-Flower-Decoration/store/1848638 |
| 194 | Koteshwaram-The Temple of Divine Food | possible_duplicate | 13.281445699999999, 77.7228772 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Koteshwaram-the-Temple-Of-Divine-Food/store/1c2c0c2 |
| 195 | Kushal Tiffin Centre And Snacks | possible_duplicate | 13.271809, 77.7168493 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Kushal-Tiffin-Centre-And-Snacks/store/1172bb1 |
| 196 | Lakshya Cafe | potential_new | 13.2555246353, 77.7147979736 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Lakshya-Cafe/store/37229c3 |
| 197 | Lokesh Shop | potential_new | 13.2827774, 77.7047328 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Lokesh-Shop/store/14c428b |
| 198 | M.R. CHICKEN CENTER | potential_new | 13.2509955, 77.70137749999999 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/M.r.-Chicken-Center/store/1976a59 |
| 199 | Maggi near nandi hills | possible_duplicate | 13.2765395, 77.7134789 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Maggi-Near-Nandi-Hills/store/1984059 |
| 200 | Mahalakshmi kulfi ice cream | possible_duplicate | 13.2666703, 77.719673 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Mahalakshmi-Kulfi-Ice-Cream/store/447b863 |
| 201 | Mahalakshmi Spice Heritage Family Restaurant | possible_duplicate | 13.288513499999999, 77.7242523 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Mahalakshmi-Spice-Heritage-Family-Restaurant/store/3b0bba4 |
| 202 | Mast Punjabi | possible_duplicate | 13.270448, 77.720154 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Mast-Punjabi/store/1870212 |
| 203 | MAYURA CAFE | possible_duplicate | 13.2506728, 77.7067864 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Mayura-Cafe/store/1852928 |
| 204 | Mayura Motte Bandi | possible_duplicate | 13.2549655944, 77.716825226 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Mayura-Motte-Bandi/store/1767b31 |
| 205 | Nagarajappa Hotel | possible_duplicate | 13.2569763, 77.7165035 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Nagarajappa-Hotel/store/1a5372c |
| 206 | Nandagokula Ac Veg Restaurant | possible_duplicate | 13.2576378, 77.7135308 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Nandagokula-Ac-Veg-Restaurant/store/929701 |
| 207 | Nandi Udupi Cafe | possible_duplicate | 13.261707699999999, 77.7168999 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Nandi-Udupi-Cafe/store/3ab794c |
| 208 | Nandi Upchar | possible_duplicate | 13.25722, 77.715106 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Nandi-Upchar/store/a36aa |
| 209 | NANDI UPAHAR MANDIRA | potential_new | 13.266783199999999, 77.6729476 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Nandi-Upahar-Mandira/store/1b20ba9 |
| 210 | Nandini Milk Parlour | possible_duplicate | 13.250992799999999, 77.71345989999999 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Nandini-Milk-Parlour/store/1835041 |
| 211 | Nayana Andhra Food Zone | possible_duplicate | 13.2560576, 77.7099028 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Nayana-Andhra-Food-Zone/store/1870214 |
| 212 | New Friends Biriyani Corner | possible_duplicate | 13.2669918, 77.7192874 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/New-Friends-Biriyani-Corner/store/543370 |
| 213 | New Prashanth Hotel Nati Style | possible_duplicate | 13.258186, 77.7130909 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/New-Prashanth-Hotel-Nati-Style/store/1b0c76a |
| 214 | NH7 Refuel Restaurant | possible_duplicate | 13.262185299999999, 77.71630069999999 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Nh7-Refuel-Restaurant/store/1852967 |
| 215 | NM Foodhub | possible_duplicate | 13.2586701, 77.71365 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Nm-Foodhub/store/39c1cba |
| 216 | North Indian Highway Bhukkad | possible_duplicate | 13.270448, 77.720154 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/North-Indian-Highway-Bhukkad/store/1870213 |
| 217 | Raja Bar and restaurant | possible_duplicate | 13.262099099999999, 77.71817879999999 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Raja-Bar-And-Restaurant/store/1a54864 |
| 218 | Punjabi Dhaba | possible_duplicate | 13.2695292, 77.72004919999999 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Punjabi-Dhaba/store/3aa2496 |
| 219 | Ramakrishna Bar & Restaurant | possible_duplicate | 13.2511575, 77.7158323 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Ramakrishna-Bar-and-Restaurant/store/1a54861 |
| 220 | Rigaan Resto bar | possible_duplicate | 13.2625537, 77.7165569 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Rigaan-Resto-Bar/store/19a1463 |
| 221 | Rigan Multi Cuisine Restaurant | possible_duplicate | 13.268330847903, 77.719974190034 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Rigan-Multi-Cuisine-Restaurant/store/1820a17 |
| 222 | Roz Shawarma & Rolls | possible_duplicate | 13.26465684, 77.7184746 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Roz-Shawarma-and-Rolls/store/1765602 |
| 223 | RSM CANDIMENTS | potential_new | 13.258008, 77.7091581 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Rsm-Candiments/store/4471b68 |
| 224 | Ruthu's Thindi | possible_duplicate | 13.25045448, 77.71095493 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Ruthus-Thindi/store/16b683c |
| 225 | SB Bakery&Sweets Nandi Hills Road New RTO | possible_duplicate | 13.268990299999999, 77.718884 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Sb-Bakeryandsweets-Nandi-Hills-Road-New-Rto/store/191246c |
| 226 | Sb Bakery&Sweets | possible_duplicate | 13.2687507, 77.718986 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Sb-Bakeryandsweets/store/92c0c7 |
| 227 | Sangeetha Dhaba | potential_new | 13.285047899999999, 77.7236293 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Sangeetha-Dhaba/store/19a2138 |
| 228 | Seasons Mandi Restaurant | possible_duplicate | 13.2643815, 77.7186501 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Seasons-Mandi-Restaurant/store/176757b |
| 229 | Sharief Bhai Biryani | possible_duplicate | 13.26465684, 77.7184746 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Sharief-Bhai-Biryani/store/1758987 |
| 230 | SNACKS HOUSE | possible_duplicate | 13.281244, 77.7233803 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Snacks-House/store/1981632 |
| 231 | Spice Heritage Family Restaurant | possible_duplicate | 13.288488, 77.7242433 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Spice-Heritage-Family-Restaurant/store/1b04506 |
| 232 | Sreyo | potential_new | 13.2745015, 77.7106821 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Sreyo/store/17891ca |
| 233 | Sri Bhairaveshwara Chicken Centre | possible_duplicate | 13.250435699999999, 77.715706 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Sri-Bhairaveshwara-Chicken-Centre/store/1b0c046 |
| 234 | SRI NANDISHWARA HOTEL | possible_duplicate | 13.2773873, 77.71267809999999 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Sri-Nandishwara-Hotel/store/1b05ba4 |
| 235 | Sri Raghavendra Furniture's | possible_duplicate | 13.2563146, 77.7170208 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Sri-Raghavendra-Furnitures/store/1a5300c |
| 236 | Sri Sairam Tent House | possible_duplicate | 13.2506479, 77.7156346 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Sri-Sairam-Tent-House/store/1803412 |
| 237 | Sri Veerabadra Tiffen | potential_new | 13.251832, 77.718401 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Sri-Veerabadra-Tiffen/store/1476a38 |
| 238 | Starbucks | possible_duplicate | 13.2630883, 77.7178356 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Starbucks/store/1853122 |
| 239 | Subway Sudheer Kirthi | possible_duplicate | 13.264368, 77.7184439 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Subway-Sudheer-Kirthi/store/1a62357 |
| 240 | Swadh Veg | possible_duplicate | 13.2632129128, 77.717972761 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Swadh-Veg/store/379c707 |
| 241 | The Arabs | possible_duplicate | 13.26884236, 77.71987382 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/The-Arabs/store/4c93b6 |
| 242 | The Daily Table | potential_new | 12.9628669, 77.57750899999999 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/The-Daily-Table/store/17a2a5c |
| 243 | The Green House Restaurant | possible_duplicate | 13.2884772, 77.7242471 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/The-Green-House-Restaurant/store/604b93 |
| 244 | The Green Park Family Restaurant | possible_duplicate | 13.2566784, 77.7105983 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/The-Green-Park-Family-Restaurant/store/198116c |
| 245 | The Mangalore Kitchen | potential_new | 13.2555968646, 77.7229501935 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/The-Mangalore-Kitchen/store/177ab52 |
| 246 | Thindi Mane & Cafe | possible_duplicate | 13.2712319, 77.71729309999999 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Thindi-Mane-and-Cafe/store/1ab178c |
| 247 | Thirumala Dhaba | possible_duplicate | 13.2876745, 77.72355309999999 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Thirumala-Dhaba/store/1a53002 |
| 248 | Tippu Star Hotel | possible_duplicate | 13.2573245, 77.712142 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Tippu-Star-Hotel/store/180312a |
| 249 | Twisted Indian Cuisine | possible_duplicate | 13.25722, 77.715106 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Twisted-Indian-Cuisine/store/cb798 |
| 250 | Up Punjabi Dhaba | possible_duplicate | 13.2700817, 77.7199016 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Up-Punjabi-Dhaba/store/5122b9 |
| 251 | VR Cafeteria | possible_duplicate | 13.25587, 77.71664 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur-Road/Restaurant/Vr-Cafeteria/store/178cc97 |
| 252 | A1 fish center | possible_duplicate | 13.292752199999999, 77.5345287 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur/Restaurant/A1-Fish-Center/store/1831c63 |
| 253 | Adarsha Chats | possible_duplicate | 13.2986901, 77.5421995 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Adarsha-Chats/store/543397 |
| 254 | An Pan Beeda | possible_duplicate | 13.3155512, 77.5381304 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur/Restaurant/An-Pan-Beeda/store/107b904 |
| 255 | Amulya Chats and Fast Food | potential_new | 13.2921778, 77.5365631 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Amulya-Chats-And-Fast-Food/store/3cb6a81 |
| 256 | Andhra Ruchulu, Doddaballapura | potential_new | 13.327593799999999, 77.5327921 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Andhra-Ruchulu,-Doddaballapura/store/1974c9c |
| 257 | Aparna Panipuri | possible_duplicate | 13.2986605, 77.541117 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Aparna-Panipuri/store/14605c1 |
| 258 | Bande Narayanappa Hotel | possible_duplicate | 13.292044299999999, 77.5396528 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Bande-Narayanappa-Hotel/store/1835159 |
| 259 | Bhadranna giri tiffen center | possible_duplicate | 13.3123063, 77.5408958 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Bhadranna-Giri-Tiffen-Center/store/3a12c26 |
| 260 | Bhadranna Tiffin Centre | possible_duplicate | 13.2982154, 77.5409506 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Bhadranna-Tiffin-Centre/store/3a12c35 |
| 261 | Bhargavi Daba | potential_new | 13.296726, 77.5299754 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Bhargavi-Daba/store/1a55792 |
| 262 | Bilari Condiments | potential_new | 13.2949297, 77.5437987 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Bilari-Condiments/store/999700 |
| 263 | Bismilla Pan Centre | possible_duplicate | 13.2732063, 77.5517261 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Bismilla-Pan-Centre/store/1384370 |
| 264 | Brundhavana Grand Veg Restaurant Doddaballapur | possible_duplicate | 13.286319599999999, 77.551457 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Brundhavana-Grand-Veg-Restaurant-Doddaballapur/store/2472737 |
| 265 | Bunny's Burgers And Fried Chicken | possible_duplicate | 13.3065854, 77.5426317 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Bunnys-Burgers-And-Fried-Chicken/store/16b682c |
| 266 | Bunny's Burgers'n fried chicken | possible_duplicate | 13.3063966, 77.5425775 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Bunnys-Burgersn-Fried-Chicken/store/19b3753 |
| 267 | Chaithra Tiffin Center | possible_duplicate | 13.311446499999999, 77.5417705 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Chaithra-Tiffin-Center/store/3ca300c |
| 268 | Cheftalk Food and Hospitality Services Pvt Ltd | potential_new | 13.3379038, 77.53642529999999 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Cheftalk-Food-And-Hospitality-Services-Pvt-Ltd/store/1922a08 |
| 269 | Chitra Condiments | possible_duplicate | 13.3152672, 77.5377482 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Chitra-Condiments/store/9997c2 |
| 270 | Chowdeshwari tifan centre kantanakunte | possible_duplicate | 13.337416399999999, 77.5314004 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Chowdeshwari-Tifan-Centre-Kantanakunte/store/1b14741 |
| 271 | condiments and solutions | possible_duplicate | 13.3124413, 77.5400856 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Condiments-And-Solutions/store/4848c58 |
| 272 | Cooking Contract And Catering | possible_duplicate | 13.3016965, 77.4931403 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Cooking-Contract-And-Catering/store/13b9274 |
| 273 | Doon Punjabi Family Dhaba Veg | possible_duplicate | 13.2995682, 77.4903897 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Doon-Punjabi-Family-Dhaba-Veg/store/184aa81 |
| 274 | Durgashree Samruddhi Samrat | potential_new | 13.2906719, 77.5520587 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Durgashree-Samruddhi-Samrat/store/47c29a5 |
| 275 | Food Bar | potential_new | 13.287328899999999, 77.54391869999999 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Food-Bar/store/34630b8 |
| 276 | Food truck BMW (best meal on wheels) by chef Nagesh | possible_duplicate | 13.310824799999999, 77.54077939999999 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Food-Truck-Bmw-(Best-Meal-On-Wheels)-By-Chef-Nagesh/store/1a62571 |
| 277 | Hallimane Hotel | possible_duplicate | 13.2900874, 77.5390609 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Hallimane-Hotel/store/543386 |
| 278 | HAP Daily | potential_new | 13.2966897, 77.5345081 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Hap-Daily/store/aa749b |
| 279 | Hamsa Condiments | potential_new | 13.3173823, 77.5367226 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Hamsa-Condiments/store/999a41 |
| 280 | Harsha Condiments | possible_duplicate | 13.3153775, 77.5380315 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Harsha-Condiments/store/108436c |
| 281 | KAVITHA RS | possible_duplicate | 13.2935406, 77.5346428 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Kavitha-Rs/store/4473a95 |
| 282 | Komb | potential_new | 13.265678504901885, 77.56030392613965 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Komb/store/15a9908 |
| 283 | Krishnappa military Hotel | potential_new | 13.2896662, 77.5415046 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Krishnappa-Military-Hotel/store/1a96ab2 |
| 284 | Krs New Grand Hotel | potential_new | 13.279224, 77.6248938 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Krs-New-Grand-Hotel/store/511b46 |
| 285 | Madhu Mess | possible_duplicate | 13.3045159, 77.5449727 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Madhu-Mess/store/968a92 |
| 286 | Malenadasiri | potential_new | 13.2808792, 77.5504708 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Malenadasiri/store/147165c |
| 287 | Maltose Marriage Village | potential_new | 13.29840556, 77.53911389 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Maltose-Marriage-Village/store/17cc208 |
| 288 | Manju bar and restaurant | possible_duplicate | 13.289440899999999, 77.5396415 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Manju-Bar-And-Restaurant/store/1940b70 |
| 289 | MANJU CHICKEN CENTER | potential_new | 13.2861736, 77.5395837 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Manju-Chicken-Center/store/198107b |
| 290 | Manjunatha Hotel | possible_duplicate | 13.2893749, 77.5437629 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Manjunatha-Hotel/store/1808063 |
| 291 | Meher Chicken Center | possible_duplicate | 13.2936096, 77.5347807 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Meher-Chicken-Center/store/33380b4 |
| 292 | Mtr Iyengar Bakery-Sweets & Chats | possible_duplicate | 13.2933693, 77.5346149 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Mtr-Iyengar-Bakery-sweets-and-Chats/store/1b07ca5 |
| 293 | Nandi Paradise | possible_duplicate | 13.313799, 77.5463952 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Nandi-Paradise/store/5122c5 |
| 294 | Nandhi Paradise | possible_duplicate | 13.314012527778, 77.546470638889 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Nandhi-Paradise/store/1831a2a |
| 295 | Nandini K | possible_duplicate | 13.2986589, 77.541117 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Nandini-K/store/14728bc |
| 296 | NAWAZ BIRYANI KAKAB CENTRE | possible_duplicate | 13.293602199999999, 77.5350378 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Nawaz-Biryani-Kakab-Centre/store/4087923 |
| 297 | Nireeh Foods Pvt Ltd | possible_duplicate | 13.3016965, 77.4931403 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Nireeh-Foods-Pvt-Ltd/store/1473172 |
| 298 | One Snacks | potential_new | 13.30101234, 77.51970176 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur/Restaurant/One-Snacks/store/1572678 |
| 299 | Paavani Condiments | potential_new | 13.2967815, 77.5385309 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Paavani-Condiments/store/4473a96 |
| 300 | Prince Chai | possible_duplicate | 13.3035932, 77.5443438 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Prince-Chai/store/4828591 |
| 301 | Priyanka's Kitchen Corner | possible_duplicate | 13.2781924, 77.5566928 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Priyankas-Kitchen-Corner/store/16b6835 |
| 302 | Raghavendra Sweets | potential_new | 13.2826674, 77.5591844 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Raghavendra-Sweets/store/a058c2 |
| 303 | Repeat Taste | possible_duplicate | 13.28727155, 77.57698417 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Repeat-Taste/store/1572250 |
| 304 | S.L.V. COFFEE BAR | possible_duplicate | 13.289495899999999, 77.5435675 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur/Restaurant/S.l.v.-Coffee-Bar/store/1b0c8a9 |
| 305 | Sathish chiken kabab centre | potential_new | 13.290821399999999, 77.5402758 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Sathish-Chiken-Kabab-Centre/store/448043b |
| 306 | SGS Non Veg Gundu Palav | possible_duplicate | 13.2921126301, 77.5342032437 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Sgs-Non-Veg-Gundu-Palav/store/1794b95 |
| 307 | SGS Nonveg Gundu Palav @Doddaballapur | possible_duplicate | 13.2923341, 77.5342812 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Sgs-Nonveg-Gundu-Palav-@Doddaballapur/store/204572a |
| 308 | Shree Srinivasa Tiffins | potential_new | 13.429128, 77.5142781 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Shree-Srinivasa-Tiffins/store/5122c6 |
| 309 | Shri manjunatha hotel | possible_duplicate | 13.284286999999999, 77.5316471 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Shri-Manjunatha-Hotel/store/1832850 |
| 310 | Sihi Catering service Doddaballapura | possible_duplicate | 13.2927312, 77.5438756 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Sihi-Catering-Service-Doddaballapura/store/190a470 |
| 311 | Sihi Catering Services | possible_duplicate | 13.2927312, 77.5438756 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Sihi-Catering-Services/store/18030b5 |
| 312 | Smoked Out BBQ | potential_new | 13.300251, 77.538529 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Smoked-Out-Bbq/store/1781419 |
| 313 | Sri Balaji Dhaba | possible_duplicate | 13.3074446, 77.534155 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Sri-Balaji-Dhaba/store/5122c3 |
| 314 | Sri Sai Bake | possible_duplicate | 13.3072085, 77.53409049999999 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Sri-Sai-Bake/store/1833573 |
| 315 | Sri Venkateshwar Tiffin Centre | possible_duplicate | 13.3363024, 77.5315663 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Sri-Venkateshwar-Tiffin-Centre/store/1b02cb1 |
| 316 | Sri Venkateshwara Non Veg Hotel | possible_duplicate | 13.301449, 77.51762 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Sri-Venkateshwara-Non-Veg-Hotel/store/1849211 |
| 317 | SRI VINAYAKA CATERING & TENT HOUSE | potential_new | 13.2872649, 77.5412879 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Sri-Vinayaka-Catering-and-Tent-House/store/17cc22b |
| 318 | The Royal Juice And Chai | possible_duplicate | 13.293252899999999, 77.5345555 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur/Restaurant/The-Royal-Juice-And-Chai/store/19927ab |
| 319 | Two Brother Catering & Service | possible_duplicate | 13.2927263, 77.538907 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Two-Brother-Catering-and-Service/store/1213905 |
| 320 | Udupi Krishna Dhama Veg Restaurant | possible_duplicate | 13.3176394, 77.5380925 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Udupi-Krishna-Dhama-Veg-Restaurant/store/1803404 |
| 321 | Udupi Nandikeshwara Upahara | potential_new | 13.2861733, 77.5375739 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Udupi-Nandikeshwara-Upahara/store/931ca9 |
| 322 | V.S.Wine Tavern | possible_duplicate | 13.3076403, 77.53477629999999 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur/Restaurant/V.s.wine-Tavern/store/1b718a6 |
| 323 | VINAYAKA CONDIMENTS | potential_new | 13.3120367, 77.543341 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Vinayaka-Condiments/store/1b08cb1 |
| 324 | Rajanukunte Donne Biriyani | possible_duplicate | 13.1334442375, 77.569721245 | directory_reported | https://magicpin.in/Bangalore/Nagenahalli/Restaurant/Rajanukunte-Donne-Biriyani/store/2b09352 |
| 325 | Oyster mushroom hotel, Soladevanahalli | potential_new | 13.0905349, 77.49276069999999 | directory_reported | https://magicpin.in/Bangalore/Hessarghatta-Road/Restaurant/Oyster-Mushroom-Hotel,-Soladevanahalli/store/1979b2b |
| 326 | Al LABBAIK RESTAURANT | potential_new | 13.0847246, 77.4831032 | directory_reported | https://magicpin.in/Bangalore/Soladevanahalli/Restaurant/Al-Labbaik-Restaurant/store/1780376 |
| 327 | Amn Kitchen | potential_new | 13.0417725, 77.42727116 | directory_reported | https://magicpin.in/Bangalore/Soladevanahalli/Restaurant/Amn-Kitchen/store/16cb529 |
| 328 | Bashveshwara Chats | possible_duplicate | 13.059339699999999, 77.3936176 | directory_reported | https://magicpin.in/Bangalore/Soladevanahalli/Restaurant/Bashveshwara-Chats/store/197c6b5 |
| 329 | Bhoomithra Resorts | potential_new | 13.052724, 77.355516 | directory_reported | https://magicpin.in/Bangalore/Soladevanahalli/Restaurant/Bhoomithra-Resorts/store/538a93 |
| 330 | Annapoorna Fresh Sweets Mr KAUSHIK MAKHAL | possible_duplicate | 13.0295091, 77.38732949999999 | directory_reported | https://magicpin.in/Bangalore/Soladevanahalli/Restaurant/Annapoorna-Fresh-Sweets-Mr-Kaushik-Makhal/store/1976298 |
| 331 | Brahmi Condiments JAYARAMA SHETTY | potential_new | 13.0184558, 77.3842963 | directory_reported | https://magicpin.in/Bangalore/Soladevanahalli/Restaurant/Brahmi-Condiments-Jayarama-Shetty/store/4476533 |
| 332 | Bismillah Hotel | potential_new | 13.0272966, 77.3855535 | directory_reported | https://magicpin.in/Bangalore/Soladevanahalli/Restaurant/Bismillah-Hotel/store/1329322 |
| 333 | FOOD FACTORY | potential_new | 13.0837321, 77.4844784 | directory_reported | https://magicpin.in/Bangalore/Soladevanahalli/Restaurant/Food-Factory/store/2088543 |
| 334 | Kuttus Cafe | potential_new | 13.009109, 77.350382 | directory_reported | https://magicpin.in/Bangalore/Soladevanahalli/Restaurant/Kuttus-Cafe/store/18740c0 |
| 335 | Khamadhenu benne dose hotel | possible_duplicate | 13.029262399999999, 77.3873808 | directory_reported | https://magicpin.in/Bangalore/Soladevanahalli/Restaurant/Khamadhenu-Benne-Dose-Hotel/store/426a3b0 |
| 336 | Madeena chicken center | potential_new | 13.032826799999999, 77.38893449999999 | directory_reported | https://magicpin.in/Bangalore/Soladevanahalli/Restaurant/Madeena-Chicken-Center/store/19774b8 |
| 337 | MSIL MRP OUTLET | possible_duplicate | 13.0590239, 77.3937266 | directory_reported | https://magicpin.in/Bangalore/Soladevanahalli/Restaurant/Msil-Mrp-Outlet/store/1a54454 |
| 338 | Padmashree Juice And Condiments.Tea Time. | potential_new | 13.0392066, 77.3910793 | directory_reported | https://magicpin.in/Bangalore/Soladevanahalli/Restaurant/Padmashree-Juice-And-Condiments.tea-Time./store/1b14711 |
| 339 | Parampara Restaurant | possible_duplicate | 13.0875901, 77.4876615 | directory_reported | https://magicpin.in/Bangalore/Soladevanahalli/Restaurant/Parampara-Restaurant/store/17a2513 |
| 340 | Parampara | possible_duplicate | 13.0885831, 77.48789769999999 | directory_reported | https://magicpin.in/Bangalore/Soladevanahalli/Restaurant/Parampara/store/17a2512 |
| 341 | Rayappa | possible_duplicate | 13.0715153, 77.5165621 | directory_reported | https://magicpin.in/Bangalore/Soladevanahalli/Restaurant/Rayappa/store/182cc64 |
| 342 | Savitha R | possible_duplicate | 13.070779112287031, 77.51578901438117 | directory_reported | https://magicpin.in/Bangalore/Soladevanahalli/Restaurant/Savitha-R/store/17ca440 |
| 343 | Shiva Udipi Hotel | possible_duplicate | 13.061858885747247, 77.38271275807155 | directory_reported | https://magicpin.in/Bangalore/Soladevanahalli/Restaurant/Shiva-Udipi-Hotel/store/170baaa |
| 344 | Shiva Restaurant | possible_duplicate | 13.061892605226939, 77.38269113196701 | directory_reported | https://magicpin.in/Bangalore/Soladevanahalli/Restaurant/Shiva-Restaurant/store/170baac |
| 345 | Shree Krishna Bar & Restaurant | possible_duplicate | 13.0585049, 77.3940034 | directory_reported | https://magicpin.in/Bangalore/Soladevanahalli/Restaurant/Shree-Krishna-Bar-and-Restaurant/store/b7ba57 |
| 346 | Shree Rathnam | potential_new | 13.043387, 77.350459 | directory_reported | https://magicpin.in/Bangalore/Soladevanahalli/Restaurant/Shree-Rathnam/store/39652a |
| 347 | SJ BAKERY | possible_duplicate | 13.0593516, 77.3939608 | directory_reported | https://magicpin.in/Bangalore/Soladevanahalli/Restaurant/Sj-Bakery/store/19a304b |
| 348 | 1997 Hotel Coorg Special | possible_duplicate | 13.172031, 77.559616 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/1997-Hotel-Coorg-Special/store/1557c4a |
| 349 | Sri Chowdeshwari Chicken Center | possible_duplicate | 13.0330959, 77.420962 | directory_reported | https://magicpin.in/Bangalore/Soladevanahalli/Restaurant/Sri-Chowdeshwari-Chicken-Center/store/19781aa |
| 350 | 11:11 Cafe (pg street) | potential_new | 13.17377, 77.5329467 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/11:11-Cafe-(Pg-Street)/store/1b23ac1 |
| 351 | 7th Mile | possible_duplicate | 13.1725077, 77.53232563 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/7th-Mile/store/1744881 |
| 352 | Aice Spice Cafe | possible_duplicate | 13.1721799, 77.5609492 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Aice-Spice-Cafe/store/1552080 |
| 353 | AKSHAYA JUICE & CONDIMENTS | possible_duplicate | 13.1707337, 77.5643767 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Akshaya-Juice-and-Condiments/store/1acc149 |
| 354 | All Things Homemade | possible_duplicate | 13.181387, 77.5619614 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/All-Things-Homemade/store/1670644 |
| 355 | AMBUR HOT BIRIYANI | possible_duplicate | 13.1726309, 77.56453139999999 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Ambur-Hot-Biriyani/store/1b16a37 |
| 356 | Angsana Oasis Spa & Resort | potential_new | 13.182591, 77.559762 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Angsana-Oasis-Spa-and-Resort/store/442bc6 |
| 357 | Arena 53 Cafe | potential_new | 13.1560959907, 77.5592022569 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Arena-53-Cafe/store/179b313 |
| 358 | Annapurneshwari Bramins Tiffins | possible_duplicate | 13.1720045, 77.5357667 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Annapurneshwari-Bramins-Tiffins/store/15957b1 |
| 359 | Asha Home Made Food | possible_duplicate | 13.1735304606, 77.5609267876 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Asha-Home-Made-Food/store/179b315 |
| 360 | Atithi Grand Nati Style | possible_duplicate | 13.1728407, 77.5283547 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Atithi-Grand-Nati-Style/store/1b082b8 |
| 361 | Bangarpet Chats | possible_duplicate | 13.1718518, 77.564489 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Bangarpet-Chats/store/1595c84 |
| 362 | Bangarpete Chaats | possible_duplicate | 13.17252368, 77.56258808 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Bangarpete-Chaats/store/1687029 |
| 363 | Basaveshwara Upahara Mandira | possible_duplicate | 13.1726049, 77.5292786 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Basaveshwara-Upahara-Mandira/store/1b15b90 |
| 364 | Bawarchi Kabab Corner | possible_duplicate | 13.17198633, 77.56082285 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Bawarchi-Kabab-Corner/store/bab004 |
| 365 | Benne Dosa Camp | possible_duplicate | 13.1715158, 77.55871979999999 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Benne-Dosa-Camp/store/19a5884 |
| 366 | Bhoosiri Dum Biryani And Food Point | possible_duplicate | 13.174144, 77.5403056 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Bhoosiri-Dum-Biryani-And-Food-Point/store/16689a5 |
| 367 | Bhoosiri Dum Biryani & Food Point | possible_duplicate | 13.174144, 77.5403056 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Bhoosiri-Dum-Biryani-and-Food-Point/store/1993622 |
| 368 | Big Bo Cafe | possible_duplicate | 13.1728028, 77.53647339999999 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Big-Bo-Cafe/store/3b58350 |
| 369 | Biriyani House | possible_duplicate | 13.19500618, 77.55227499 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Biriyani-House/store/1671721 |
| 370 | Bonker's Hub | potential_new | 13.1854754289, 77.5306220958 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Bonkers-Hub/store/1765603 |
| 371 | Burger It Up | possible_duplicate | 13.173067, 77.561563 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Burger-It-Up/store/1741711 |
| 372 | Cafe Coffee Day | possible_duplicate | 13.1993646, 77.5617449 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Cafe-Coffee-Day/store/923902 |
| 373 | C.K Hotel | possible_duplicate | 13.17234543, 77.56167647 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/C.k-Hotel/store/bab33c |
| 374 | Cafe Culture 22 | possible_duplicate | 13.1724585, 77.530942 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Cafe-Culture-22/store/17a2955 |
| 375 | Cafe Culture | possible_duplicate | 13.17254657, 77.53039969 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Cafe-Culture/store/175954a |
| 376 | Cafe Jatayu | possible_duplicate | 13.173869, 77.5376814 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Cafe-Jatayu/store/50ca73 |
| 377 | Cafe Odyssey | possible_duplicate | 13.174217, 77.5402718 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Cafe-Odyssey/store/a71917 |
| 378 | Cart-O-Cafe Rajanukunte | possible_duplicate | 13.1721739, 77.561327 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Cart-o-cafe-Rajanukunte/store/923215 |
| 379 | Charan Condiments | possible_duplicate | 13.174937, 77.54306 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Charan-Condiments/store/1b56898 |
| 380 | Chikpete Donne Biriyani - Avalahalli | potential_new | 13.135784, 77.569248 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Chikpete-Donne-Biriyani-Avalahalli/store/1703156 |
| 381 | Chimney Restaurant | possible_duplicate | 13.17261181, 77.56211662 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Chimney-Restaurant/store/16bbb40 |
| 382 | CHINNU MESS | possible_duplicate | 13.16765499, 77.52892314 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Chinnu-Mess/store/17106c3 |
| 383 | Crazy Pizza | possible_duplicate | 13.17234871, 77.53638824 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Crazy-Pizza/store/1762646 |
| 384 | Cupcake Bliss Cakes & Desserts | possible_duplicate | 13.173067, 77.561563 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Cupcake-Bliss-Cakes-and-Desserts/store/1741713 |
| 385 | Daily Bread | possible_duplicate | 13.1919773, 77.5630875 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Daily-Bread/store/2043cc3 |
| 386 | Delhi Rolls And Juice Junction | possible_duplicate | 13.17229383, 77.53565502 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Delhi-Rolls-And-Juice-Junction/store/1762653 |
| 387 | Dew & Duo Cafe | possible_duplicate | 13.1721509, 77.5356667 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Dew-and-Duo-Cafe/store/3bca9bc |
| 388 | Dibbur Cafe | possible_duplicate | 13.1723745, 77.5309829 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Dibbur-Cafe/store/17a2961 |
| 389 | F16 Resto | possible_duplicate | 13.17515068, 77.54309417 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/F16-Resto/store/1738720 |
| 390 | Food Planet Resto Cafe | possible_duplicate | 13.1724588, 77.5303304 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Food-Planet-Resto-Cafe/store/1555590 |
| 391 | Food Planet | possible_duplicate | 13.172527, 77.5299019 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Food-Planet/store/1102245 |
| 392 | Gossip and gulp | possible_duplicate | 13.1724375, 77.5613125 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Gossip-And-Gulp/store/1cc538c |
| 393 | Fresh choice 2 floor P block hit refresh | potential_new | 13.1679595, 77.53379149999999 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Fresh-Choice-2-Floor-P-Block-Hit-Refresh/store/1acb5c3 |
| 394 | Gowdru Hotel | possible_duplicate | 13.17420948, 77.56416321 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Gowdru-Hotel/store/a819cc |
| 395 | Grasa Community & Courtyard | potential_new | 13.16441404, 77.56522568 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Grasa-Community-and-Courtyard/store/1666317 |
| 396 | Green Tribes Family Restaurant | possible_duplicate | 13.1751145, 77.54321945 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Green-Tribes-Family-Restaurant/store/385213 |
| 397 | Hasty Tasty | possible_duplicate | 13.1824891, 77.5458732 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Hasty-Tasty/store/1b0a169 |
| 398 | Hotel Akhanda Biryanis | possible_duplicate | 13.172305, 77.535818 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Hotel-Akhanda-Biryanis/store/16b9653 |
| 399 | Hotel Durga Sagar | potential_new | 13.1977387, 77.5624131 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Hotel-Durga-Sagar/store/5142cc |
| 400 | Hotel Y N Senate | possible_duplicate | 13.17347823, 77.53698807 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Hotel-Y-N-Senate/store/39685b |
| 401 | Hotel Shri Rama Bhavan | possible_duplicate | 13.17377334, 77.54061677 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Hotel-Shri-Rama-Bhavan/store/159a731 |
| 402 | Howrah Jn Restaurant | possible_duplicate | 13.1719089, 77.5352047 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Howrah-Jn-Restaurant/store/42b0037 |
| 403 | Indiana Burgers | possible_duplicate | 13.173067, 77.561563 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Indiana-Burgers/store/1741705 |
| 404 | Iyengar Bakery's Cake of the Day | possible_duplicate | 13.1724176, 77.5642818 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Iyengar-Bakerys-Cake-Of-The-Day/store/1b09c4a |
| 405 | J.J.BAKERY | possible_duplicate | 13.1379819, 77.5311497 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/J.j.bakery/store/1995133 |
| 406 | Jashika Food Products | potential_new | 13.18086177, 77.51916868 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Jashika-Food-Products/store/1775c98 |
| 407 | Jai Maruthi Hotel | possible_duplicate | 13.172812471725742, 77.56145455949789 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Jai-Maruthi-Hotel/store/174a962 |
| 408 | JUST BAKE RAJANUKUNTE | possible_duplicate | 13.1744949, 77.564139 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Just-Bake-Rajanukunte/store/1863907 |
| 409 | Just Bake | possible_duplicate | 13.1740980718, 77.5640303852 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Just-Bake/store/17a2948 |
| 410 | Kaati Zone Rolls and Wraps | possible_duplicate | 13.173067, 77.561563 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Kaati-Zone-Rolls-And-Wraps/store/1741a90 |
| 411 | Kalmi Factory | possible_duplicate | 13.172977, 77.564227 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Kalmi-Factory/store/175c307 |
| 412 | KKFC (Kranchy Krispy Fried Chicken) | possible_duplicate | 13.1728442, 77.5364932 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Kkfc-(Kranchy-Krispy-Fried-Chicken)/store/4032572 |
| 413 | Kouzina Kafe - The Food Court | possible_duplicate | 13.173067, 77.561563 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Kouzina-Kafe-The-Food-Court/store/1741a8b |
| 414 | Kolkata Famous Kati Roll | possible_duplicate | 13.172286, 77.561743 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Kolkata-Famous-Kati-Roll/store/159b81c |
| 415 | Krunchy Krispy Fried Chicken | possible_duplicate | 13.1719218418, 77.5356587466 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Krunchy-Krispy-Fried-Chicken/store/20034ca |
| 416 | Kubera grand | possible_duplicate | 13.1725067, 77.53630009999999 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Kubera-Grand/store/1b063a3 |
| 417 | Kushank Hotel | possible_duplicate | 13.1725377574, 77.5305084633 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Kushank-Hotel/store/17a3266 |
| 418 | Kusuma Andhra Ruchulu | potential_new | 13.1562580065, 77.5608985754 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Kusuma-Andhra-Ruchulu/store/1784981 |
| 419 | L.J. IYENGAR BAKERY & SWEETS | possible_duplicate | 13.173456799999999, 77.5612163 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/L.j.-Iyengar-Bakery-and-Sweets/store/1a5cc69 |
| 420 | Lassi And More | possible_duplicate | 13.1919773, 77.5630875 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Lassi-And-More/store/92806c |
| 421 | Lassi Shop | possible_duplicate | 13.1721634, 77.5361186 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Lassi-Shop/store/ca2335 |
| 422 | Lickees | possible_duplicate | 13.1725217, 77.5626632 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Lickees/store/1762782 |
| 423 | M.M Family Restaurant | possible_duplicate | 13.17070103, 77.55503387 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/M.m-Family-Restaurant/store/16bb95b |
| 424 | Mahadeshwara Nandini Milk Parlour | possible_duplicate | 13.1726554, 77.56248819999999 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Mahadeshwara-Nandini-Milk-Parlour/store/18334a9 |
| 425 | Mallanna Hotel Rajanakunte | possible_duplicate | 13.1749159, 77.5484867 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Mallanna-Hotel-Rajanakunte/store/42ab8b5 |
| 426 | Mirage Bar | possible_duplicate | 13.18220808, 77.5638048 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Mirage-Bar/store/5ab6ab |
| 427 | MANU DUM BIRIYANI | possible_duplicate | 13.1741022, 77.5405926 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Manu-Dum-Biriyani/store/1b12738 |
| 428 | Meals Ready | possible_duplicate | 13.16912951, 77.56478045 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Meals-Ready/store/bb09a3 |
| 429 | Moeen Maggi Point | possible_duplicate | 13.1708485, 77.5365075 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Moeen-Maggi-Point/store/1b0a105 |
| 430 | Momo Zone - The Momo Company | possible_duplicate | 13.173067, 77.561563 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Momo-Zone-The-Momo-Company/store/1741a91 |
| 431 | Munch Resto Cafe | possible_duplicate | 13.182464999999999, 77.5459157 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Munch-Resto-Cafe/store/19753b3 |
| 432 | Mylari Mane Badoota | possible_duplicate | 13.1762316, 77.56413049999999 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Mylari-Mane-Badoota/store/1b21b8b |
| 433 | Naati kitchen MMR RESTO BAR | possible_duplicate | 13.1737241, 77.5407161 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Naati-Kitchen-Mmr-Resto-Bar/store/1b08652 |
| 434 | Naati Cafe | possible_duplicate | 13.1700357553, 77.5522458181 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Naati-Cafe/store/17a83ca |
| 435 | Naga Kaaba Center | potential_new | 13.1490952, 77.55394 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Naga-Kaaba-Center/store/9656c1 |
| 436 | Nakshatra Tiffin And Chats Point | possible_duplicate | 13.17253221, 77.53054778 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Nakshatra-Tiffin-And-Chats-Point/store/1762800 |
| 437 | Namma Halli Mane naati style | possible_duplicate | 13.1760501, 77.5640313 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Namma-Halli-Mane-Naati-Style/store/197b0ca |
| 438 | Namma Halli Mane | possible_duplicate | 13.1760337, 77.56443048 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Namma-Halli-Mane/store/175954c |
| 439 | Nammura Badoota | possible_duplicate | 13.172136, 77.5600031 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Nammura-Badoota/store/1aa0bb9 |
| 440 | Nandhini Milk Shop | possible_duplicate | 13.1761284, 77.5646121 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Nandhini-Milk-Shop/store/1036493 |
| 441 | Nandini cafe moo | possible_duplicate | 13.1739375, 77.5373125 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Nandini-Cafe-Moo/store/197a347 |
| 442 | Nati Style Donne Biriyani Mane | possible_duplicate | 13.1721372, 77.56002409999999 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Nati-Style-Donne-Biriyani-Mane/store/1979a2a |
| 443 | Navam Military Hotel | possible_duplicate | 13.1704664, 77.5549121 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Navam-Military-Hotel/store/1762803 |
| 444 | Naveen Catering Contractor | possible_duplicate | 13.174525669892, 77.559444718669 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Naveen-Catering-Contractor/store/182b92c |
| 445 | Naveen | possible_duplicate | 13.170671899999999, 77.5659838 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Naveen/store/1b1c641 |
| 446 | Navmi hotel | possible_duplicate | 13.1368954, 77.53106609999999 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Navmi-Hotel/store/1b059ab |
| 447 | New Taj Hotel | possible_duplicate | 13.171701262, 77.5642437787 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/New-Taj-Hotel/store/17a83c8 |
| 448 | Night Coocking | possible_duplicate | 13.1710066, 77.5664197 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Night-Coocking/store/15a0677 |
| 449 | NISARAGA  HOME FOOD | possible_duplicate | 13.16817577, 77.52938303 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Nisaraga-Home-Food/store/17106b0 |
| 450 | Nisha Home Foods | possible_duplicate | 13.1723209, 77.5621611 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Nisha-Home-Foods/store/1642c37 |
| 451 | NISHA's FAMILY RESTAURANT | possible_duplicate | 13.172357, 77.5622645 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Nishas-Family-Restaurant/store/1c2bc55 |
| 452 | Northern Spices | possible_duplicate | 13.1724097, 77.53337239999999 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Northern-Spices/store/198b768 |
| 453 | Number 1 Burger | potential_new | 13.1502035, 77.56943695 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Number-1-Burger/store/1759549 |
| 454 | Nutrition With Neev | possible_duplicate | 13.1814929, 77.5620315 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Nutrition-With-Neev/store/15912a1 |
| 455 | On Time Nisarga Kitchen | potential_new | 13.18450792, 77.56899389 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/On-Time-Nisarga-Kitchen/store/16b9652 |
| 456 | only99 | possible_duplicate | 13.175457, 77.559735 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Only99/store/16a5cbb |
| 457 | Pakhwan Restaurant | possible_duplicate | 13.1722716, 77.5614579 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Pakhwan-Restaurant/store/1642c36 |
| 458 | Pakwan Restaurant | possible_duplicate | 13.18415, 77.51851 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Pakwan-Restaurant/store/15914cc |
| 459 | Pooja Hotel | possible_duplicate | 13.1762465, 77.5641117 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Pooja-Hotel/store/51486b |
| 460 | Prathayi | possible_duplicate | 13.1723538, 77.5580779 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Prathayi/store/1791425 |
| 461 | Raamu Dhaba | possible_duplicate | 13.1700556692, 77.5521737337 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Raamu-Dhaba/store/4694739 |
| 462 | Rachana Bar by Golden Amulya | possible_duplicate | 13.2006949, 77.5612931 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Rachana-Bar-By-Golden-Amulya/store/200802a |
| 463 | RACHANA MRP | possible_duplicate | 13.2004796, 77.5613442 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Rachana-Mrp/store/200802b |
| 464 | Rajankunte Just Bake | possible_duplicate | 13.1744949, 77.564139 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Rajankunte-Just-Bake/store/1762845 |
| 465 | Rajanukunte | possible_duplicate | 13.1717348, 77.5643048 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Rajanukunte/store/1b092bc |
| 466 | Rajkutty Home Foods | potential_new | 13.174867, 77.5280657 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Rajkutty-Home-Foods/store/176284c |
| 467 | Rayalaseema Spice | possible_duplicate | 13.1726975, 77.5364896 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Rayalaseema-Spice/store/1b12924 |
| 468 | Rich Cream Ice Cream Parlour | potential_new | 13.196292, 77.571365 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Rich-Cream-Ice-Cream-Parlour/store/16a7434 |
| 469 | RocKings Cafe | possible_duplicate | 13.1749704, 77.54238649999999 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Rockings-Cafe/store/3cc27a9 |
| 470 | Royal Dining | possible_duplicate | 13.1726527, 77.5622247 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Royal-Dining/store/92b589 |
| 471 | Rua | possible_duplicate | 13.1755063361, 77.5477215239 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Rua/store/18701cc |
| 472 | Royal Juice Corner | possible_duplicate | 13.17094265, 77.56437946 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Royal-Juice-Corner/store/15a205b |
| 473 | Royal fresh chicken | potential_new | 13.1755591, 77.56944469999999 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Royal-Fresh-Chicken/store/1b1c907 |
| 474 | S B Tea Cafe | possible_duplicate | 13.1706828, 77.5538882 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/S-B-Tea-Cafe/store/1762868 |
| 475 | S G Iyengar Bakery | possible_duplicate | 13.1728946, 77.5694325 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/S-G-Iyengar-Bakery/store/92b725 |
| 476 | s k Cafe mother hood hospital | potential_new | 13.1568086, 77.54395079999999 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/S-K-Cafe-Mother-Hood-Hospital/store/2665b49 |
| 477 | S R V CORNER DHABA AND FAMILY RESTAURANT | possible_duplicate | 13.174961, 77.5483278 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/S-R-V-Corner-Dhaba-And-Family-Restaurant/store/186c163 |
| 478 | S.L.V Cake Corner | possible_duplicate | 13.1727378, 77.5627926 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/S.l.v-Cake-Corner/store/19a2b74 |
| 479 | Salt & Sage | potential_new | 13.1529131, 77.54048735 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Salt-and-Sage/store/16b6b11 |
| 480 | Seoul Fried Chicken | possible_duplicate | 13.173067, 77.561563 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Seoul-Fried-Chicken/store/174170b |
| 481 | Sai Surabhi Cool Drinks | potential_new | 13.1849838, 77.575341 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Sai-Surabhi-Cool-Drinks/store/92b9c2 |
| 482 | SHREE ANNAPOORNESHWARI IDLI HOTEL | possible_duplicate | 13.172649799999999, 77.5285785 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Shree-Annapoorneshwari-Idli-Hotel/store/47828b8 |
| 483 | Shree Annapoorneswari Idli Hotel | possible_duplicate | 13.1726010707, 77.5285592287 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Shree-Annapoorneswari-Idli-Hotel/store/2c6b3a5 |
| 484 | Shree Nandi Cake Palace & Sweets | possible_duplicate | 13.1714731, 77.5642621 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Shree-Nandi-Cake-Palace-and-Sweets/store/1b07641 |
| 485 | Shreeshaila Khanavali | possible_duplicate | 13.171808, 77.564304 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Shreeshaila-Khanavali/store/162caa4 |
| 486 | Silver Oak Resort | potential_new | 13.1847953, 77.5606807 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Silver-Oak-Resort/store/170a595 |
| 487 | Siri Vruksha Cafe | possible_duplicate | 13.1738988, 77.5386023 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Siri-Vruksha-Cafe/store/199573b |
| 488 | SLN Hotel & Tasty Rolls Center | possible_duplicate | 13.1729901, 77.5644142 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Sln-Hotel-and-Tasty-Rolls-Center/store/176289a |
| 489 | Slurpy Shakes | possible_duplicate | 13.173067, 77.561563 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Slurpy-Shakes/store/1743240 |
| 490 | SLV Chicken Centre, Wholesale and Retail | potential_new | 13.1673791, 77.56205659999999 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Slv-Chicken-Centre,-Wholesale-And-Retail/store/1b30c58 |
| 491 | Sodexo | potential_new | 13.1684276, 77.53610259999999 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Sodexo/store/1acc309 |
| 492 | Sonis cafe | potential_new | 13.187484, 77.543673 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Sonis-Cafe/store/16a53c9 |
| 493 | Spicy Kadai | possible_duplicate | 13.1720575, 77.53652237 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Spicy-Kadai/store/17628ab |
| 494 | Sri Annapoorneshwari Hotel Pure Veg | possible_duplicate | 13.170490099999999, 77.56462119999999 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Sri-Annapoorneshwari-Hotel-Pure-Veg/store/1a5a339 |
| 495 | Sri Banshankari Donne Biryani House | possible_duplicate | 13.152616, 77.534034 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Sri-Banshankari-Donne-Biryani-House/store/16a8119 |
| 496 | Sri curries | possible_duplicate | 13.1725067, 77.5623955 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Sri-Curries/store/1ac66cc |
| 497 | SRI CHOWDESWARI CHICKEN CENTER | possible_duplicate | 13.172600399999999, 77.5298128 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Sri-Chowdeswari-Chicken-Center/store/19ab71c |
| 498 | Sri Bramhalingeshwara Condiments | possible_duplicate | 13.1725738, 77.5615901 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Sri-Bramhalingeshwara-Condiments/store/930215 |
| 499 | Sri Durga Farm Fresh | possible_duplicate | 13.1691392, 77.5711996 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Sri-Durga-Farm-Fresh/store/1737a73 |
| 500 | Sri Gurudarshini Veg Cafe | possible_duplicate | 13.16994, 77.552135 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Sri-Gurudarshini-Veg-Cafe/store/4121074 |
| 501 | Sri Krishna Bakery | possible_duplicate | 13.172197599999999, 77.56425949999999 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Sri-Krishna-Bakery/store/1b01639 |
| 502 | Sri Lakshmi Venkateshwara Iyengar Bakery | possible_duplicate | 13.1714141, 77.5581946 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Sri-Lakshmi-Venkateshwara-Iyengar-Bakery/store/1a558b2 |
| 503 | Sri manjunath juice and condiments | possible_duplicate | 13.173041399999999, 77.5366754 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Sri-Manjunath-Juice-And-Condiments/store/1b0757b |
| 504 | SRI MANJUNATHA BAKERY & SWEET | possible_duplicate | 13.172883599999999, 77.5642733 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Sri-Manjunatha-Bakery-and-Sweet/store/1a53545 |
| 505 | Sri Maruti Hotel | possible_duplicate | 13.1724786, 77.5305789 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Sri-Maruti-Hotel/store/19853c3 |
| 506 | Sri Raghavendra Hotel | possible_duplicate | 13.172150499999999, 77.5611536 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Sri-Raghavendra-Hotel/store/1b07a9a |
| 507 | Sri Sai Boarding & Lodging Attached Bar & Restaurant | possible_duplicate | 13.169994599999999, 77.5643362 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Sri-Sai-Boarding-and-Lodging-Attached-Bar-and-Restaurant/store/18acc30 |
| 508 | Sri Sai Krishna Hot Chips | possible_duplicate | 13.172631299999999, 77.5645341 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Sri-Sai-Krishna-Hot-Chips/store/1b01435 |
| 509 | Sri Samarth Grand Pure Veg Hotel | possible_duplicate | 13.17551104, 77.54712446 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Sri-Samarth-Grand-Pure-Veg-Hotel/store/1561a22 |
| 510 | Sri Shaila Khanavali | possible_duplicate | 13.1720622, 77.5642466 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Sri-Shaila-Khanavali/store/1773611 |
| 511 | Sri Venkateshwara Hotel | possible_duplicate | 13.17117476, 77.55515099 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Sri-Venkateshwara-Hotel/store/155080c |
| 512 | Sri Venkateswara Juice Corner | possible_duplicate | 13.1734845, 77.5612142 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Sri-Venkateswara-Juice-Corner/store/17628b4 |
| 513 | Sri Vishnu Garden | possible_duplicate | 13.16810801, 77.56498665 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Sri-Vishnu-Garden/store/16bc740 |
| 514 | Srinivas Bar and Restaurant | possible_duplicate | 13.1724737, 77.5594824 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Srinivas-Bar-And-Restaurant/store/1a5a981 |
| 515 | Stir Fry Chinese Restaurant | possible_duplicate | 13.1720279, 77.5597062 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Stir-Fry-Chinese-Restaurant/store/1561934 |
| 516 | STIR-FRY CHINESE RESTA | possible_duplicate | 13.172041182269266, 77.55970873891792 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Stir-fry-Chinese-Resta/store/15783b2 |
| 517 | Street 64 Cafe | possible_duplicate | 13.1738436, 77.54053569999999 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Street-64-Cafe/store/40a1571 |
| 518 | Sugar Rush By Kamini | potential_new | 13.1782, 77.56094 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Sugar-Rush-By-Kamini/store/1633562 |
| 519 | Sundae Everyday Ice Creams | possible_duplicate | 13.173067, 77.561563 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Sundae-Everyday-Ice-Creams/store/1741a8c |
| 520 | Sundance The Bistro | possible_duplicate | 13.18220841, 77.56379239 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Sundance-The-Bistro/store/5ab6aa |
| 521 | Sushma's hut | potential_new | 13.146444, 77.52044 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Sushmas-Hut/store/16a60c7 |
| 522 | Suss Sis Gourmet Bakery & Cafe | potential_new | 13.1432164, 77.5642494 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Suss-Sis-Gourmet-Bakery-and-Cafe/store/16b47a4 |
| 523 | Suto Cafe - Near Presidency University | possible_duplicate | 13.172662299999999, 77.536506 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Suto-Cafe-Near-Presidency-University/store/1b08551 |
| 524 | Suto Cafe | possible_duplicate | 13.1729134167, 77.5365173067 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Suto-Cafe/store/17c7c93 |
| 525 | Tadipatri Dum Biryani Restaurant | possible_duplicate | 13.172394, 77.562194 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Tadipatri-Dum-Biryani-Restaurant/store/1583232 |
| 526 | Taj Hotel | possible_duplicate | 13.1710401, 77.5642984 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Taj-Hotel/store/9312c2 |
| 527 | Tangerine | possible_duplicate | 13.18221592, 77.56379005 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Tangerine/store/1c93c |
| 528 | THE ADDA CAFE | possible_duplicate | 13.1725531, 77.530183 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/The-Adda-Cafe/store/2250cbb |
| 529 | The Dessert Zone | possible_duplicate | 13.173067, 77.561563 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/The-Dessert-Zone/store/1742335 |
| 530 | the gooden pavilion | possible_duplicate | 13.175011, 77.542944 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/The-Gooden-Pavilion/store/16a7399 |
| 531 | The Golden Pavilion | possible_duplicate | 13.17490352, 77.54295599 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/The-Golden-Pavilion/store/1665463 |
| 532 | The Golden Pavilion Multi Cuisine Restaurant | possible_duplicate | 13.1749199, 77.5429394 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/The-Golden-Pavilion-Multi-Cuisine-Restaurant/store/1628815 |
| 533 | THE HOMEAWAY RESTAURANT | possible_duplicate | 13.1719821, 77.535471 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/The-Homeaway-Restaurant/store/1b09c71 |
| 534 | The HomeAway | possible_duplicate | 13.17188919, 77.53530587 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/The-Homeaway/store/174a321 |
| 535 | The loaded bun | possible_duplicate | 13.1700716, 77.57096159999999 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/The-Loaded-Bun/store/17a2378 |
| 536 | The Living Room | potential_new | 13.20007388, 77.58213943 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/The-Living-Room/store/612a6a |
| 537 | The Paradice Restaurant | possible_duplicate | 13.172312499999999, 77.5303125 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/The-Paradice-Restaurant/store/4252007 |
| 538 | The Student Cafe | possible_duplicate | 13.171849, 77.536212 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/The-Student-Cafe/store/3967aa |
| 539 | Uttara Karnataka Jolada Rotti Kendra | potential_new | 13.17412917, 77.57001612 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Uttara-Karnataka-Jolada-Rotti-Kendra/store/1632c06 |
| 540 | V S D K Dum Biriyani Center | possible_duplicate | 13.173263, 77.568473 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/V-S-D-K-Dum-Biriyani-Center/store/15a7830 |
| 541 | Vamika Kitchen Cafe | possible_duplicate | 13.1724597, 77.5324758 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Vamika-Kitchen-Cafe/store/1781102 |
| 542 | Variar Cake House | possible_duplicate | 13.1724097, 77.53337239999999 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Variar-Cake-House/store/1988310 |
| 543 | Vcre8- Snacks & Drinks Cafe | possible_duplicate | 13.172012599999999, 77.5353547 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Vcre8-Snacks-and-Drinks-Cafe/store/1b33020 |
| 544 | Vintage Liquors | possible_duplicate | 13.17404418, 77.54814827 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Vintage-Liquors/store/1680b44 |
| 545 | Vintage Restaurant | possible_duplicate | 13.172219, 77.547791 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Vintage-Restaurant/store/1557799 |
| 546 | Vip engineer’s cafe and restaurant | possible_duplicate | 13.172108, 77.5356013 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Vip-Engineer%E2%80%99s-Cafe-And-Restaurant/store/1a9c0b8 |
| 547 | Vismaya Food Court | possible_duplicate | 13.1721547737, 77.5348621117 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Vismaya-Food-Court/store/3cbba16 |
| 548 | Waffle World | possible_duplicate | 13.17212018, 77.53617704 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Waffle-World/store/1448b62 |
| 549 | WarmOven Cake & Desserts | possible_duplicate | 13.173067, 77.561563 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Warmoven-Cake-and-Desserts/store/1742336 |
| 550 | White House cafe | potential_new | 13.192274, 77.5694716 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/White-House-Cafe/store/1b05a64 |
| 551 | Yablaka Foods | possible_duplicate | 13.17298148, 77.56148806 | directory_reported | https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Yablaka-Foods/store/176298c |

## Next step

Nothing has been imported. Resolve rows flagged for manual review, fix invalid rows, then re-run this validator until the report is clean. Only after explicit human approval may an import be prepared — via a reviewed SQL/insert path, never by this tool.
