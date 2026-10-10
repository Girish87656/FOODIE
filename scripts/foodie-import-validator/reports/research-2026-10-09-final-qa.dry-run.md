# Foodie — Restaurant Import Dry-Run Report

**Mode:** dry-run (read-only) · **Tool:** foodie-restaurant-import-validator v1.1.0

## Run context

| Item | Value |
| --- | --- |
| Input file | `/home/z/my-project/scripts/foodie-import-validator/input/research-worksheet-phase3d.csv` |
| Input sha256 | `03b94f4135d70b460e016d028befe8dd8840cb58118f79807b6a41f4d05165b4` |
| Rows in input | 45 |
| Baseline source | snapshot |
| Baseline file | `/home/z/my-project/scripts/foodie-import-validator/fixtures/baseline-snapshot.json` |
| Baseline sha256 | `11a4407a6d8e106fd71c2a8917871da50fa27c385d4abc56d0b8fb6c6b12cafb` |
| Baseline fetched at | 2026-10-10T14:47:42.003Z |
| Baseline rows (existing restaurants) | 14 |

## Summary

| Bucket | Rows |
| --- | ---: |
| 1. Potential new businesses | 35 |
| 2. Existing-record matches | 0 |
| 3. Possible duplicates / ambiguous | 9 |
| 4. Insufficient evidence | 1 |
| 5. Invalid or missing data | 0 |
| 6. Candidate coordinates awaiting confirmation (cross-cutting) | 16 |
| **Total rows** | **45** |
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

## Potential new businesses (35)

### Row 2: The Shri Cafe and Restaurant

- **Confidence:** medium
- **Input:** address: NH 648, Doddaballapur Main Road Nagadenahalli Village Doddaballapur Taluk, Nagadenhalli, Karnataka · locality: Nagadenahalli · city: Doddaballapura · phone: +919844929931 · source: https://www.justdial.com/Bangalore/The-Shri-Cafe-And-Restaurant-Nagadenahalii/080PXX80-XX80-251224194043-V6Q3_BZDET · cuisine: South Indian tiffins, chats, juices, coffee · listing_rating: 4.5 · listing_reviews: 17 · checked_on: 2026-10-09 · evidence: directory_reported · review_decision: distinct_new_business · uncertainty: Justdial rating renderings conflicted in the Phase 3D reads (4.5 vs 5.0, both '17 ratings'); re-reads later the same day (Phase 3F) consistently show 4.5 with 17 reviews (JD reviews page: 'average rating of 4.5') - recorded as 4.5/17. Cuisine per the official Instagram bio ('fresh coffee, delicious tiffins, chats, juices' at NH 648, Nagadenahalli). Hours not captured; JD page body still unreadable (snippet-level evidence). · notes: Corroborated by two independent directories: Justdial listing (name + Nagadenahalli area) and Snapchat place page (address + phone 098449 29931), plus official Instagram @theshricafeofficial. Distinct address and phone vs all 14 existing records. | Phase 3F update (2026-10-09): rating 4.5/17 recorded (consistent across two JD snippet renderings); cuisine from official Instagram bio.
- **Recommended initial verification_status:** unverified

### Row 3: Garuda Cafe Restaurant

- **Confidence:** medium
- **Input:** locality: Adinarayana Hosahalli · city: Doddaballapura · source: https://www.justdial.com/Bangalore/Garuda-Cafe-Restaurant-Adhinarayanahosahall/080PXX80-XX80-220728212033-M3V4_BZDET · evidence: directory_reported · review_decision: needs_more_research · uncertainty: Justdial places the cafe in Adhinarayanahosahall (a.k.a. A N Hosahalli), a Doddaballapura-taluk village about 2 km from Doddaballapura town and ~3 km from Kasbhag (Wikipedia/OneFiveNine) - inside the research area. No address, phone, hours or rating captured: the JD page is not readable here and search snippets carried only boilerplate text. · notes: Category 'cafe' inferred from the name (JD title 'Garuda Cafe Restaurant'); not independently confirmed. Appears in JD cross-lists for Moparahalli/Byradenahalli/Kundana area pages.
- **Recommended initial verification_status:** unverified

### Row 4: Epicurus Multi Cuisine Restaurant

- **Confidence:** medium
- **Input:** address: Munilakshmamma, Nagadenahali, Doddaballapura Thaluk, Bengaluru Rural, Karnataka -561 203 · locality: Nagadenahalli · city: Doddaballapura · phone: +919035972563 · coords: 13.2852505, 77.598904 · source: https://www.district.in/dining/doddaballapura/epicurus-multi-cuisine-restaurant-doddaballapura-locality · cuisine: North Indian, Chinese, Middle-Eastern · evidence: directory_reported · review_decision: distinct_new_business · uncertainty: Opening hours conflict: district.in structured data (JSON-LD, read 2026-10-09) shows 10:00-22:00 all seven days while a Justdial listing shows 12:00 pm - 11:00 pm - opening_hours left blank. Coordinates are district.in's structured geo (directory-reported, awaiting confirmation). Address now verbatim from the printed menu (Scribd), adding pincode 561 203. A JD listing places 'Epicurus Multi Cuisine Restaurant' in Adhinarayanahosahall; phone 9035972563 is tied to the Nagadenahalli address by district.in and the printed menu, so the JD entry is likely the same restaurant mis-located or a second listing - unresolved. district.in shows no rating (0.0). Swiggy (Soladevanahalli) and Zomato (HSR) 'Epicurus' outlets are unrelated. · notes: Three independent sources agree on name+area+phone: district.in, the printed menu (Scribd) and Instagram. district.in shows 'Rs 300 for two' (price band Rs is the researcher's classification). Distinct address and phone vs all 14 existing records. | Phase 3F update (2026-10-09): district.in structured geo recorded (13.2852505, 77.598904) and structured hours 10:00-22:00 documented; address upgraded to the printed-menu verbatim (pincode 561 203); JD 12:00-23:00 re-confirmed - hours stay blank.
- **Coordinates awaiting confirmation:** 13.2852505, 77.598904 — evidence level: directory_reported · source: https://www.district.in/dining/doddaballapura/epicurus-multi-cuisine-restaurant-doddaballapura-locality. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Recommended initial verification_status:** unverified

### Row 7: Venture’s Hungry Birds

- **Confidence:** medium
- **Input:** locality: Doddaballapur · city: Doddaballapura · source: https://www.justdial.com/Bangalore/Burger-Time-Near-Raj-Kamal-Theater-Doddaballapur/080PXX80-XX80-220418220006-W2T8_BZDET · evidence: directory_reported · review_decision: needs_more_research · uncertainty: No dedicated listing found on any directory. Name appears only in JD cross-listings ('Ventures Hungry Birds Doddaballapur - 0.0, 0 ratings') and in Restaurant Guru's Doddaballapura index as 'Ventures Hungry Bird's Venture's PIZZA'. 3C grouping said 'Near GITAM/Nagadenahalli' but the only area evidence points to Doddaballapur town; zone membership unconfirmed. No rating recorded (JD shows 0 ratings). · notes: Category fast_food inferred from the burger/pizza context of the cross-listings; unconfirmed.
- **Recommended initial verification_status:** unverified

### Row 8: Lotus Gardenia

- **Confidence:** medium
- **Input:** address: Opposite Indian Oil Petrol Bunk, Near Railway Station, Doddaballapur · locality: Nagadenahalli · city: Doddaballapura · source: https://www.justdial.com/Bangalore/Lotus-Gardenia-Restaurants-Bar-Rooms-Opposite-Indian-Oil-Petrol-BunkNear-Railway-Station-Doddaballapur/080PXX80-XX80-210421154401-X4L9_BZDET · listing_rating: 4.0 · listing_reviews: 2410 · checked_on: 2026-10-09 · evidence: directory_reported · review_decision: distinct_new_business · uncertainty: JD area tags disagree: the photos page is filed under 'Nagadenahalii' while the listing slug says 'Near Railway Station, Doddaballapur' - both recorded. Listing combines restaurant + bar + rooms (JD categories include 'Home Stay'); cuisine not captured (a TripAdvisor nearby-restaurant mention suggests Chinese, low confidence). 'Established 03-2020' per JD. JD's 'bookings typically 9:00 AM to 8:00 PM' refers to booking hours, not business hours - opening_hours left blank. Phase 3F (2026-10-09): a JD snippet shows structured hours 'Open 24 Hrs' (not recorded in opening_hours - a 24-hour claim does not fit the HH:MM-HH:MM field, and the Phase 3D booking-hours caveat stands); the JD rating count drifted 2410 -> 2404 between same-day reads (4.0 unchanged); hotel-OTA pages (Goibibo 2.9/5, MakeMyTrip, PlanetOfHotels - restaurant + bar + 24-hour front desk) corroborate the mixed profile; a TripAdvisor restaurant page for Lotus Gardenia, Doddaballapur was located. · notes: Rated 4.0 with 2410 all-time ratings on Justdial (search snippet, 2026-10-09; JD page itself not readable). Different name, address and profile vs all 14 existing records; TripAdvisor also lists a 'Lotus Gardenia' restaurant near Brahmi Resort, Nagadenahalli. | Phase 3F update (2026-10-09): 'Open 24 Hrs' JD claim noted (not recorded as hours); rating-count drift 2410->2404 noted; TripAdvisor + OTA corroboration added.
- **Recommended initial verification_status:** unverified

### Row 9: Vaibhava Sweets & Chats

- **Confidence:** medium
- **Input:** address: Scout Camp Road, Opposite NS Convention Hall, Raghunathapura · locality: Raghunathapura · city: Doddaballapura · coords: 13.2869155, 77.5747334 · maps_listing: https://www.google.com/maps/place/Vaibhava+Sweets%26Chats/@13.2894872,77.5378,14z/data=!4m7!3m6!1s0x3bb1e1fef9f204d5:0xcbcea14369c0d063!8m2!3d13.2869155!4d77.5747334!16s%2Fg%2F11j8w16cbc · source: https://www.youtube.com/watch?v=HMjTk-zVNoU · evidence: directory_reported · review_decision: possible_duplicate_hold · uncertainty: Name spelling varies across sources: 'Vaibhava Sweets&Chats' (Google Maps place via short link), 'Vybhava Sweets & Chats' (YouTube/Instagram), 'Vaibhav Sweets & Chats' (Justdial, 'Near MLA Krishnappa Layout', open 09:30-21:30) - treated as one business but not proven. magicpin lists a separate 'Vybhava Sweets' on Fort Rd (+91 8027622143, 4.2/55) which may be a different, older shop - not merged. The YouTube plus code 7HPF+QV9 decodes to 13.28690, 77.57472, matching the Maps marker to ~2 m. No phone/hours/rating captured for this place. Instagram address string was truncated in the snippet. Phase 3F re-read (2026-10-09): the public short link was re-opened and its preview payload yielded the CANONICAL place URL (now in maps_listing_url) carrying CID 0x3bb1e1fef9f204d5:0xcbcea14369c0d063, feature /g/11j8w16cbc and marker !3d13.2869155!4d77.5747334 - matching the recorded candidate pin exactly. Google's own search-context token inside the payload decodes to 'vybhava sweets doddaballapura photos', corroborating the Vaibhava/Vybhava spelling family. The pin remains directory-reported (awaiting confirmation). · notes: Google Maps place confirmed via the public short link published in the YouTube description: place name 'Vaibhava Sweets&Chats', CID 0x3bb1e1fef9f204d5:0xcbcea14369c0d063. Marker coordinates read from the Maps preview payload on 2026-10-09 - directory-reported, awaiting confirmation. | Phase 3F update (2026-10-09): canonical /maps/place/ URL captured from the re-read short-link payload; short link (provenance source) was https://maps.app.goo.gl/rPxFWqwwEaH2o4Wr8; marker matches recorded pin; spelling-family token noted.
- **Coordinates awaiting confirmation:** 13.2869155, 77.5747334 — evidence level: directory_reported · source: https://www.youtube.com/watch?v=HMjTk-zVNoU. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Recommended initial verification_status:** unverified

### Row 10: Appu Chats

- **Confidence:** medium
- **Input:** address: Tubagere, Doddaballapura, Lakshmidevipura, Near College, Tubugere, Bangalore-561205 · locality: Tubugere · city: Doddaballapura · source: https://www.justdial.com/Bangalore/Appu-Chats-Near-College/080PXX80-XX80-240911201805-K6B7_BZDET · evidence: directory_reported · review_decision: needs_more_research · uncertainty: The only 'Appu Chats' listing found is in Tubugere (near College), a village roughly 10 km north-west of Doddaballapura town - outside the two target zones - while the 3C grouping said 'Near GITAM/Nagadenahalli'. Whether a same-named stall exists near GITAM is unknown. Address taken from the JD search snippet (page not readable in this environment). · notes: Zone mismatch flagged honestly; nothing asserted about the candidate's existence near GITAM.
- **Recommended initial verification_status:** unverified

### Row 11: Iyengar’s Cake N Bake

- **Confidence:** medium
- **Input:** locality: Doddaballapur · city: Doddaballapura · source: https://www.justdial.com/Bangalore/Iyengar-Cake-And-Bake-Doddaballapur/080PXX80-XX80-220921011904-Z7L7_BZDET · listing_rating: 4.0 · listing_reviews: 95 · checked_on: 2026-10-09 · evidence: directory_reported · review_decision: needs_more_research · uncertainty: Address not captured (JD page not readable). Spelling differs across sources: JD 'Iyengar Cake And Bake' vs candidate/Zomato 'Iyengar's Cake N Bake' - likely the same Doddaballapura bakery but not proven. Distinct from 'Hasanamba Iyengar Bakery' (Jalappa College Rd) and 'Iyengar Bakery And Cake Palace' (Lakshmipura). · notes: Zomato and Swiggy carry listings for 'Iyengar's Cake N Bake' in Doddaballapura (existence reference only - no proprietary data copied): zomato.com/pl/doddaballapura/iyengars-cake-n-bake-doddaballapura-locality/order and swiggy.com/city/doddaballapura/iyengars-cake-and-bake-doddaballapura-rest1408585
- **Recommended initial verification_status:** unverified

### Row 12: Best Choice Bakery

- **Confidence:** medium
- **Input:** address: D Cross Rd, Doddaballapur, Bangalore · locality: Doddaballapur town · city: Doddaballapura · phone: +919980213680 · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Best-Choice-Bakery/store/922554 · listing_rating: 4.0 · listing_reviews: 386 · checked_on: 2026-10-09 · evidence: directory_reported · review_decision: distinct_new_business · uncertainty: Hours are now a THREE-WAY conflict (Phase 3F re-check): magicpin verified listing 10:00-20:00 (Phase 3D's recorded value), Justdial structured hours 7:00 am - 10:00 pm (two JD snippet renderings), Instagram popular-page 9:00 AM - 10:00 PM - opening_hours left blank per the conflict rule. Ratings differ by source: magicpin 4.0/386 (recorded), Justdial 4.0/392-398 (count drifted between same-day reads), Restaurant Guru 3.5/393. JD slug places it 'Near By Aiyapa Swami Temple'; JD address line: 'Doddaballapura, Near By Aiyapa Swami Temple, D Cross Road'. magicpin shows Rs 500 for two (price band Rs is the researcher's classification). · notes: Second sources: https://www.justdial.com/Bangalore/Best-Choice-Bakery-Near-By-Aiyapa-Swami-Temple-Doddaballapur/080PXX80-XX80-170928162846-B6G9_BZDET (4.0/398) and restaurant-guru.in/Best-Choice-Bakery-Doddaballapura (3.5/393). Verified magicpin listing with phone; D Cross Rd matches the Priyanka Tiffen Center street (different business). | Phase 3F update (2026-10-09): JD structured hours 07:00-22:00 surfaced -> three-way conflict -> opening_hours blanked (magicpin value retained in this note); JD rating count drift noted.
- **Recommended initial verification_status:** unverified

### Row 13: Wild Woods BBQ Grill & Chill

- **Confidence:** medium
- **Input:** address: Near Ssv Power Gym, Bhuvaneswari Nagar · locality: Bhuvaneswari Nagar · city: Doddaballapura · source: https://www.justdial.com/Bangalore/Wild-Woods-Bbq-Near-Ssv-Power-Gym-Bhuvaneswari-Nagar/080PXX80-XX80-250710211946-I4J6_BZDET · evidence: directory_reported · review_decision: needs_more_research · uncertainty: JD lists 'Wild Woods Bbq' (name variant; candidate says 'BBQ Grill & Chill') near Ssv Power Gym, Bhuvaneswari Nagar. Bhuvaneswari Nagar appears inside the JD Railway-Station address block 'Railway Station, Doddaballapura, K.G Govindapura, Bhuvaneswari Nagar, Bangalore - 561203', suggesting zone-2 placement, but the exact street address is not captured. No phone/hours/rating captured. · notes: Also indexed under the JD 'Barbeque Restaurants in Nagadenahalli' area page.
- **Recommended initial verification_status:** unverified

### Row 14: Rainbow Huts Family Restaurant

- **Confidence:** medium
- **Input:** address: Doddaballapur, Bashettihalli, Bangalore · locality: Bashettihalli · city: Doddaballapura · phone: +918951368020 · source: https://magicpin.in/Bangalore/Bashettihalli/Restaurant/Rainbow-Huts-Family-Restaurant/store/184787c · listing_rating: 4.6 · listing_reviews: 49 · checked_on: 2026-10-09 · evidence: directory_reported · review_decision: distinct_new_business · uncertainty: Hours are now a THREE-WAY conflict (Phase 3F re-check): magicpin Family-Restaurant listing '11:30 AM - 2:00 PM' (lunch-window-looking), a SECOND magicpin listing 'Rainbow Huts' (store/1758a35) showing '12:30 PM - 10:15 PM' WITH THE SAME PHONE +918951368020 - indicating the same business double-listed on magicpin with a stale/partial hours entry - and Zomato's card 'opens 12:15pm'. opening_hours left blank per the conflict rule. Ratings differ sharply: magicpin 4.6/49 (recorded), Justdial 4.4/12, Zomato 3.2 (referenced only, no data copied). Zomato cuisines (North Indian, Biryani, Chinese, Kebab, Seafood, Grilled Chicken) noted as existence reference. A second JD page 'Rainbow Huts' exists near MLA Krishnappa Layout - possibly the same business double-listed; unresolved. · notes: Second source: https://www.justdial.com/Bangalore/Rainbow-Huts-Family-Restaurant-Near-Ns-Convention-Hall-Hamam/080PXX80-XX80-240703160205-B5C8_BZDET (4.4). Verified magicpin phone. Near NS Convention Hall places it on the Scout Camp Road side of Bashettihalli (zone 2). | Phase 3F update (2026-10-09): same-phone magicpin double-listing found (12:30-22:15) -> three-way hours conflict -> opening_hours blanked; Zomato cuisines existence-reference noted.
- **Recommended initial verification_status:** unverified

### Row 16: Karavali Hotel

- **Confidence:** medium
- **Input:** locality: Doddaballapura Railway Station · city: Doddaballapura · source: https://www.justdial.com/Bangalore/Hotel-Karavali-Doddaballapur/080PXX80-XX80-231108081001-E8R8_BZDET · evidence: directory_reported · review_decision: needs_more_research · uncertainty: Justdial carries two pages likely for one property: 'Hotel Karavali' (restaurant) and 'Karavali Hotel Near Railway Station' (lodging). Which page is canonical and whether a separately-branded restaurant exists is unresolved; no phone/hours/rating captured. Unrelated Bengaluru 'Hotel Karavali' entities (BTM/JP Nagar coastal cuisine) excluded. · notes: Second JD page: https://www.justdial.com/Bangalore/Karavali-Hotel-Near-Railway-Station-Doddaballapur/080PXX80-XX80-250113180101-X6J2_BZDET. 3C grouping said 'Near GITAM/Nagadenahalli'; JD places it near the Railway Station.
- **Recommended initial verification_status:** unverified

### Row 18: Hotel Radha

- **Confidence:** medium
- **Input:** locality: Govindapura · city: Doddaballapura · source: https://www.justdial.com/Bangalore/Hotel-Radha-Govindapura/080PXX80-XX80-180831182321-U3J8_BZDET · evidence: directory_reported · review_decision: needs_more_research · uncertainty: Two same-family Justdial listings: 'Hotel Radha' (Govindapura, 06:00-21:00, listed under home-delivery restaurants) and 'New Hotel Radha' (Near Railway Station, 5.0/11) - possibly a rename or two branches; unresolved remotely. No phone captured. Unrelated 'Hotel Radha Regent' (Bengaluru) excluded. · notes: Second JD page: https://www.justdial.com/Bangalore/New-Hotel-Radha-Near-Railway-Station-Doddaballapur/080PXX80-XX80-230826200751-G6H9_BZDET (5.0/11, Restaurants).
- **Recommended initial verification_status:** unverified

### Row 19: Siri Chicken Centre

- **Confidence:** medium
- **Input:** address: Near Railway Station, Opposite to Tanuja Wines, Doddaballapur · locality: Doddaballapura Railway Station · city: Doddaballapura · source: https://www.justdial.com/Bangalore/Siri-Chicken-Centre-Near-Railway-Stationopposite-To-Tanuja-Wines-Doddaballapur/080PXX80-XX80-180627015044-S2I1_BZDET · listing_rating: 4.3 · listing_reviews: 3 · checked_on: 2026-10-09 · evidence: directory_reported · review_decision: needs_more_research · uncertainty: JD's primary classification is 'Chicken Retailers' (raw-meat shop) with a secondary 'Restaurants' classification - no pilot category fits a raw-chicken retailer, so category left blank for human review. JD's chicken-retailer index gives 'Scout Kamp Road Doddaballapur - 561203'. No phone/hours captured. A different 'Siri Chicken Centre' exists on Nitte Meenakshi College Road, Ganganahalli (~17 km) - unrelated. · notes: Zone 2 (Scout Camp Road / railway station side) placement per JD index page.
- **Recommended initial verification_status:** unverified

### Row 21: Ganesh Darshan & Chats

- **Confidence:** medium
- **Input:** address: Opposite Railway Station, Doddaballapur · locality: Doddaballapura Railway Station · city: Doddaballapura · source: https://www.justdial.com/Bangalore/Ganesh-Darshan-Chats-Opposite-Railway-Station-Doddaballapur/080PXX80-XX80-171013222937-E1Q5_BZDET · listing_rating: 3.6 · listing_reviews: 6 · checked_on: 2026-10-09 · evidence: directory_reported · review_decision: possible_duplicate_hold · uncertainty: chotu lists a plus code '7GXH+RMR, near muthyalamma temple, Doddaballapura 561203' which decodes to ~13.2996, 77.5291 - about 2 km from the railway station, conflicting with JD's 'Opposite Railway Station'; coordinates left blank pending field check. Shares the proper token 'ganesh' with existing 'Sri Ganesh Grand' (Bashettihalli) - different name and area, but a distinguishing phone/address is needed before any identity call. A Facebook food post and an Instagram reel also mention 'Ganesh darshan' / 'New Ganesh darshan hotel' (Chamrajpet main road) - possible same-name family in town. · notes: chotu index: https://chotu.com/local/chat-bhandar-in-rest-of-bengaluru-bengaluru-karnataka-india/ct-1637768
- **Recommended initial verification_status:** unverified

### Row 22: Lakshmi Biriyani Point

- **Confidence:** medium
- **Input:** address: Near Railway Station, Doddaballapur, Bangalore - 561203 · locality: Doddaballapura Railway Station · city: Doddaballapura · phone: +919845263318 · source: https://www.justdial.com/Bangalore/Lakshmi-Biriyani-Point-Near-Railway-Station-Doddaballapur/080PXX80-XX80-171013224908-C2Y3_BZDET · cuisine: Biryani · listing_rating: 4.7 · listing_reviews: 10 · checked_on: 2026-10-09 · evidence: directory_reported · review_decision: needs_more_research · uncertainty: CLOSURE SIGNAL: magicpin displays the banner 'The outlet has shutdown' (checked 2026-10-09) while the Justdial listing (4.7, 10 ratings) is still live - operational status unresolved; treat as possibly inactive. OneFiveNine's Kasbhag index places it 0.2-0.3 km from the railway station. Hours not published on any captured source. Phase 3F re-check (2026-10-09, later the same day): magicpin's 'The outlet has shutdown' banner is STILL displayed (page re-read); the Justdial listing is still live and now shows structured hours 9:30 am - 10:00 pm (recorded) with rating 4.7/10. Operational status remains UNRESOLVED - the recorded hours are the live JD listing's claim and may be stale if the outlet has closed. A call to +91 98452 63318 or an on-site pass remains the decisive step. · notes: Second sources: https://magicpin.in/Bangalore/Bashettihalli/Restaurant/Lakshmi-Biriyani-Point/store/543377 (shutdown banner, phone 9845263318) and onefivenine.com Kasbhag/Kasbhag Road village indexes. | Phase 3F update (2026-10-09): JD hours 09:30-22:00 recorded from snippet; magicpin shutdown banner re-confirmed on page re-read; status hold stands.
- **Recommended initial verification_status:** unverified

### Row 23: Kiran Tiffin Room

- **Confidence:** medium
- **Input:** address: Kasbhag Rd, near railway station, Doddaballapura, Karnataka · locality: Kasbhag Road · city: Doddaballapura · phone: +919663965135 · source: https://restaurant-guru.in/Aiyappa-Tiffin-Center-Doddaballapura · listing_rating: 4.8 · listing_reviews: 78 · checked_on: 2026-10-09 · evidence: directory_reported · review_decision: distinct_new_business · uncertainty: IDENTITY RESOLVED (Phase 3F, 2026-10-09): Restaurant Guru's slug 'Aiyappa-Tiffin-Center-Doddaballapura' is a rename artifact of RG's own listing; Kiran Tiffin Room and the existing 'Ayyappa Tiffin Room' are distinct businesses. Kiran: phone +919663965135 confirmed by THREE directories (Restaurant Guru, Yandex, and a magicpin VERIFIED listing page-read today); own Justdial listing 'Kiran Tifen Room' (Near Railway Station, id 080PXX80-XX80-170928175119); magicpin address 'Kasbhag Rd, near railway station, Doddaballapura, K.G Govindapura, 562163'; an Instagram reel describes an evening pulao service 'Timings: 6-30pm to 10pm' (partial day coverage - not recorded as opening_hours). The existing record 'Ayyappa Tiffin Room' is a separate, distinct business: its own JD listing (4.0/580, hours 7:00 am - 9:00/10:00 pm), a since-1978 breakfast-and-meals identity on Scout Camp Rd (Facebook/Instagram reels by local page 'Nammuru Doddaballapura'), phones +918088599999 (DB + Yandex org page) and 8722593803/7348832292 (Instagram reel). Different phone + different road placement + different profile. A third same-name family, 'Swamy Ayyappa Tiffan Centre' (Mallathahalli/Dabaspet Rd), is unrelated. · notes: Second sources: yandex.ru/maps/org/kiran_tiffin_room/227484367804 (same phone +91 9663 96 51 35) and magicpin.in/Bangalore/Bashettihalli/Other/Kiran-Tiffin-Room/store/1964951 (Kasbhag Rd, K.G Govindapura, 562163). beyondyatra.com lists it 4.3 with 'Must Taste: Masala Dosa'. | Phase 3F update (2026-10-09): magicpin verified listing page-read (phone +919663965135, Kasbhag Rd address); JD 'Kiran Tifen Room' listing (170928175119) and JD 'Ayyappa Tifin Room' listing (170928162242, 4.0/580) documented as separate listings; IG reel timings noted. Hold resolved as distinct.
- **Recommended initial verification_status:** unverified

### Row 25: Ss Food Cafe

- **Confidence:** medium
- **Input:** locality: Nagadenahalli · city: Doddaballapura · source: https://www.justdial.com/Bangalore/Ss-Food-Cafe-Opposite-Sbi-Nagadenahalii/080PXX80-XX80-251218025234-B9J4_BZDET · evidence: directory_reported · uncertainty: Sparse: JD page not readable in this environment; only the listing title ('Opposite SBI, Nagadenahalii') and its cross-listing block were captured. Name shares the token 'ss' with existing 'SS Hyderabadi Biriyani Zone' - different business type/area, but watch for tool flags. · notes: Discovery (zone 1) via JD cross-listings in Nagadenahalli on 2026-10-09.
- **Recommended initial verification_status:** unverified

### Row 26: Amrutha Food Court

- **Confidence:** medium
- **Input:** locality: Nagadenahalli · city: Doddaballapura · source: https://www.justdial.com/Bangalore/Amrutha-Food-Court-Nagadenahalli/080PXX80-XX80-221230011506-V3T1_BZDET · evidence: directory_reported · uncertainty: Spelling-variant question RESOLVED (Phase 3F, 2026-10-09): distinct from existing 'Abhiram Food Court' (Moparahalli) - separate Justdial listings (Amrutha created 2022-12-30 in Nagadenahalli; Abhiram created 2024-03-28, rated 4.0/5) and an Instagram popular-page coordinate for Abhiram (13.284964, 77.596301) matching the existing DB record. JD rating renderings conflict (3.0/46 vs 3.2/48) - left blank per the conflict rule. Still sparse: no phone, address or hours captured. Unrelated same-name family: 'Amrutha Multi Cuisine Restaurant' (Sarjapur Rd/Halanayakanahalli, Bengaluru) excluded. · notes: Discovery (zone 1) via JD Nagadenahalli area pages on 2026-10-09. | Phase 3F update (2026-10-09): Amrutha vs Abhiram hold resolved as DISTINCT (separate JD listings, separate ratings, matching DB coords for Abhiram). Rating conflict documented, left blank.
- **Recommended initial verification_status:** unverified

### Row 27: Siri Bucket Biriyani

- **Confidence:** medium
- **Input:** address: Opposite Bank Of India, Thammasettihalli · locality: Thammasettihalli · city: Doddaballapura · source: https://www.justdial.com/Bangalore/Chicken-Biryani-Dish-Restaurants-in-Doddaballapur · listing_rating: 3.9 · listing_reviews: 17 · checked_on: 2026-10-09 · evidence: directory_reported · uncertainty: Rating/count read from a JD index-page snippet ('Siri Bucket Biryani. 3.9 17 Ratings. Scout Camp Road Thammasettihalli - 2.61 km'), not from a dedicated listing page. Shares the token 'siri' with the Siri Chicken Centre row - different businesses. Zone 2 (Scout Camp Road side). · notes: Discovery (zone 2) via JD 'Restaurants with Counter Service near Railway Station' and biryani indexes on 2026-10-09. Also listed at 'Railway Station, Doddaballapura, K.G Govindapura, Bhuvaneswari Nagar, Bangalore - 561203' in the JD biryani index (nct-10047018).
- **Recommended initial verification_status:** unverified

### Row 28: Sanje Time Veg Restaurant & Chaats

- **Confidence:** medium
- **Input:** locality: Kasbhag · city: Doddaballapura · source: https://www.justdial.com/Bangalore/Sanje-Time-Veg-Restaurant-Chaats-Doddaballapur/080PXX80-XX80-220312235807-D3L6_BZDET · listing_rating: 4.0 · listing_reviews: 2 · checked_on: 2026-10-09 · evidence: directory_reported · uncertainty: Sparse: JD page not readable; '4.0 2 Ratings' and 'Kasbhag Dodballapur' read from JD area-page snippets. · notes: Discovery (zone 2, Kasbhag Road) via the JD 'Best Restaurants near Railway Station Doddaballapur' index on 2026-10-09.
- **Recommended initial verification_status:** unverified

### Row 29: Hoysala Family Restaurant

- **Confidence:** medium
- **Input:** locality: Doddaballapur · city: Doddaballapura · source: https://www.justdial.com/Bangalore/Hoysala-Family-Restaurant-Doddaballapur/080PXX80-XX80-230609201003-C1B4_BZDET · cuisine: North Indian, South Indian, Seafood · listing_rating: 4.0 · listing_reviews: 331 · checked_on: 2026-10-09 · evidence: directory_reported · uncertainty: Exact street address not captured; JD places it in Doddaballapur town - zone membership unconfirmed. Instagram @hoysalafamily and a magicpin listing also exist. · notes: Discovery via the JD Nagadenahalli group-friendly index on 2026-10-09. magicpin: magicpin.in/Bangalore/Doddaballapur/Restaurant/Hoysala-Family-Restaurant/store/168a001
- **Recommended initial verification_status:** unverified

### Row 30: Grillland

- **Confidence:** medium
- **Input:** locality: Basettihalli · city: Doddaballapura · source: https://www.justdial.com/Bangalore/Grillland-Doddaballapura-Basettihalli/080PXX80-XX80-240305141018-Z1J7_BZDET · evidence: directory_reported · uncertainty: Sparse: JD page not readable; only name/locality captured. Listed under JD Fast Food near Doddaballapura, Basettihalli. · notes: Discovery via JD cross-listing on the Lakshmi Biriyani Point search on 2026-10-09.
- **Recommended initial verification_status:** unverified

### Row 31: Rajanna Nati Style Biryani

- **Confidence:** medium
- **Input:** address: Railway Station, Doddaballapura, K.G Govindapura, Bhuvaneswari Nagar, Bangalore - 561203 · locality: Bhuvaneswari Nagar · city: Doddaballapura · source: https://www.justdial.com/Bangalore/Biryani-Restaurants-in-Railway-Station-Doddaballapur-Doddaballapur/nct-10047018 · evidence: directory_reported · uncertainty: Sparse: address from a JD index-page row; no dedicated listing captured. Name listed as 'Rajanna Nati Style Biryani' on the JD biryani index; other sources render it 'Rajanna nati style hotel'. · notes: Discovery (zone 2) via the JD biryani index for the Railway Station area on 2026-10-09. Restaurant Guru's Doddaballapura index also lists 'Rajanna nati style hotel'.
- **Recommended initial verification_status:** unverified

### Row 33: Burger Time

- **Confidence:** medium
- **Input:** address: Shop 17, Raj Kamal Theater, Near Doddaballapur Town, Doddaballapura Locality, Doddaballapura · locality: Doddaballapura town · city: Doddaballapura · phone: +918553717034 · coords: 13.291965, 77.542015 · source: https://www.district.in/dining/doddaballapura/burger-time-doddaballapura-locality · cuisine: American, Continental · listing_rating: 3.9 · listing_reviews: 6 · checked_on: 2026-10-10 · evidence: directory_reported · review_decision: distinct_new_business · uncertainty: JD page body anti-bot blocked (snippet only: 'Near Raj Kamal Theater', hours 10:45 am - 8:45 pm agree with district). Phone corroborated by the official Instagram bio (call 8553717034). Coordinates are district.in JSON-LD geo (directory-reported, bucket 6). magicpin + Zomato + Swiggy existence-references only. · notes: Phase 3H discovery round (2026-10-10): district.in JSON-LD page-read (streetAddress, geo, aggregateRating 3.9/6, hours Mon-Sun 10:45-20:45, Rs 400 for two). Town-proper location (zone 2). No name/phone/address overlap with any existing record.
- **Coordinates awaiting confirmation:** 13.291965, 77.542015 — evidence level: directory_reported · source: https://www.district.in/dining/doddaballapura/burger-time-doddaballapura-locality. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Recommended initial verification_status:** unverified

### Row 34: Bbq Junction

- **Confidence:** medium
- **Input:** address: Green Valley Layout gate, Sri Kongadiyappa College Rd, next to KMH Convention Hall, Sree, Doddaballapura, Karnataka 561203 · locality: Doddaballapura town · city: Doddaballapura · phone: +919945071428 · coords: 13.285751, 77.5311807 · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Bbq-Junction/store/1835603 · cuisine: BBQ, tandoori, shakes · listing_rating: 4.7 · listing_reviews: 14 · checked_on: 2026-10-10 · evidence: directory_reported · review_decision: distinct_new_business · uncertainty: Opening hours conflict - left blank: magicpin window 11:30 AM - 2:00 PM vs JD snippet Tue-Sun 5:30 pm - 10:00 pm (Mon closed) vs IG reel caption 6:30PM-9:30PM. JD rating snippets conflict across pages (4.9/26, 5.0/25, 4.7) - not recorded. Coordinates are magicpin JSON-LD geo (directory-reported, bucket 6). · notes: Phase 3H discovery round (2026-10-10): magicpin VERIFIED listing page-read (phone +919945071428, address, Rs 500 for two, rating 4.7/14). JD snippet corroborates address ('Next Green Valley Layout Near Kmh Convention Hall'). Verified magicpin listing with unique phone; hours conflict is a field-level gap, not an identity problem.
- **Coordinates awaiting confirmation:** 13.285751, 77.5311807 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Bbq-Junction/store/1835603. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Recommended initial verification_status:** unverified

### Row 35: Rajashree Veg And Non-Veg Family Restaurant

- **Confidence:** medium
- **Input:** address: Survey 142/5A, D Cross, Ward 3, Doddaballapura Locality, Doddaballapura · locality: Doddaballapura town · city: Doddaballapura · phone: +919030376363 · coords: 13.301893, 77.55085 · source: https://www.district.in/dining/doddaballapura/rajashree-veg-and-non-veg-family-restaurant-doddaballapura-locality · cuisine: North Indian, Chinese · evidence: directory_reported · review_decision: distinct_new_business · uncertainty: Two different numbers published - both recorded, not reconciled: district.in JSON-LD +919030376363 (recorded) and Snapchat 'Call 098859 97294'. Opening hours conflict - left blank: district JSON-LD 12:30-22:30 x7 days vs Snapchat 07:15-22:00. district.in shows 0.0 (no-review default) and Snapchat shows 22 ratings with no average - no rating recorded. district pin sits ~2 km north of the town core - pin-check list. 'Rajashree Comforts' brand relationship (delivery arm?) unresolved. · notes: Phase 3H discovery round (2026-10-10): district.in JSON-LD page-read + Snapchat place page independently corroborates the identical address. Rs 750 for two (district). Zomato existence-reference only.
- **Coordinates awaiting confirmation:** 13.301893, 77.55085 — evidence level: directory_reported · source: https://www.district.in/dining/doddaballapura/rajashree-veg-and-non-veg-family-restaurant-doddaballapura-locality. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Recommended initial verification_status:** unverified

### Row 36: Maha Naati Ruchi

- **Confidence:** medium
- **Input:** address: Vinayakanagara, Rojipura Court Road, Doddaballapura Locality, Doddaballapura · locality: Doddaballapura town · city: Doddaballapura · phone: +918095788474 · coords: 13.3044077, 77.5425688 · source: https://www.district.in/dining/doddaballapura/maha-naati-ruchi-3-doddaballapura-locality · cuisine: North Indian, Indo-Chinese, South Indian, Hyderabadi · listing_rating: 4.2 · listing_reviews: 546 · checked_on: 2026-10-10 · evidence: directory_reported · review_decision: distinct_new_business · uncertainty: district.in JSON-LD publishes a second phone +916363286209, corroborated by the FB page ('Prop:Sri Kuber -6363286209'). Opening hours left blank: district JSON-LD covers Tue-Sun 09:00-22:00 but Monday is absent from the spec (gap noted). Price for two conflict: district Rs 1000 vs magicpin snippet Rs 500. JD rating 4.2/546 is snippet-only evidence (page body anti-bot blocked). JD area tag says 'Mallathahalli' vs the Court Road address - area tag or second branch, unresolved. · notes: Phase 3H discovery round (2026-10-10): district.in JSON-LD page-read (address, two phones, cuisine, geo); phone cross-corroborated by the owner's FB page. Coordinates are district.in JSON-LD geo (directory-reported, bucket 6). Zomato existence-reference only.
- **Coordinates awaiting confirmation:** 13.3044077, 77.5425688 — evidence level: directory_reported · source: https://www.district.in/dining/doddaballapura/maha-naati-ruchi-3-doddaballapura-locality. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Recommended initial verification_status:** unverified

### Row 37: Palav Ramu Hotel

- **Confidence:** medium
- **Input:** address: 7GVR+GP3, Doddaballapura, Karnataka 561203 · locality: Doddaballapura bus stand area · city: Doddaballapura · source: https://restaurant-guru.in/PALAV-RAMU-HOTEL-Doddaballapura · cuisine: Palav (pulao) specialty · listing_rating: 3.9 · listing_reviews: 97 · checked_on: 2026-10-10 · evidence: directory_reported · review_decision: distinct_new_business · uncertainty: Phone not captured (none on the RG page or in snippets). Address is the plus code 7GVR+GP3 published as the address by RG and magicpin - recorded as a string, never converted to coordinates. JD separately shows 4.0/95 and Explurger 3.9/53 - not recorded (RG-displayed Google aggregate recorded). No numeric geo published by any source (RG embeds an OSM map without coordinates). · notes: Phase 3H discovery round (2026-10-10): Restaurant Guru page-read (hours Mon-Sun 12PM-10PM, Google 3.9/97 as displayed by RG, price band INR 1-200 per person). Iconic local palav house near the bus stand (zone 2). No overlap with existing records.
- **Recommended initial verification_status:** unverified

### Row 38: Shawarma Cartel

- **Confidence:** medium
- **Input:** address: Ground Floor, Market Road, Doddaballapura Locality, Doddaballapura · locality: Doddaballapura town · city: Doddaballapura · phone: +918095562868 · coords: 13.2934035, 77.5414015 · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Shawarma-Cartel/store/17934a0 · cuisine: Fast food, shawarma · listing_rating: 4.1 · listing_reviews: 251 · checked_on: 2026-10-10 · evidence: directory_reported · review_decision: needs_more_research · uncertainty: Address conflict - unresolved: magicpin 'Ground Floor, Market Road' vs JD 'Hemavathipet 2nd Cross St, 561203' vs IG bio '3rd branch... Doddaballapura Main Road'. Multi-branch claim (IG 'officially OPEN') must be settled (one call) before identity work. FavHiker displays Google 4.8/35 separately (recorded here only as a separate external value, never merged). Plus code '7GVR+9H9' published by FavHiker - recorded as string, not converted. Pin points north of town center - unverified. · notes: Phase 3H discovery round (2026-10-10): magicpin VERIFIED listing page-read (phone, 3:30 PM - 10:30 PM, Rs 400 for two, 4.1/251) + JD/FavHiker snippets. Strong listings exist but the street-level address conflict and multi-branch claim block an identity decision.
- **Coordinates awaiting confirmation:** 13.2934035, 77.5414015 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Shawarma-Cartel/store/17934a0. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Recommended initial verification_status:** unverified

### Row 39: Udupi Upahar

- **Confidence:** medium
- **Input:** address: JP Vybhav Party Hall & Lodging, Kasaba Police Station Road, Doddaballapur - 561203 · locality: Doddaballapura town · city: Doddaballapura · phone: +919845186664 · coords: 13.3071176, 77.5375286 · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Udupi-Upahar/store/1833086 · cuisine: South Indian · listing_rating: 4.2 · listing_reviews: 9 · checked_on: 2026-10-10 · evidence: directory_reported · review_decision: needs_more_research · uncertainty: A family of same-name listings, not one clean candidate: magicpin VERIFIED (this row); JD 'Udupi Uahar'; JD 'Hotel New Udupi Uphar' (hours 6:00 am - 3:00 pm); Zomato existence-reference displays a 'temporarily closed' banner (signal noted, no data copied). Opening hours left blank: magicpin window 11:30 AM - 2:00 PM looks like a lunch display, JD says 6:00-15:00, Zomato banner says temporarily closed - three signals conflict. Which listing is the intended business is unresolved. · notes: Phase 3H discovery round (2026-10-10): magicpin VERIFIED listing page-read (phone, Rs 500 for two, 4.2/9, geo). Identity of 'the' candidate must be established first.
- **Coordinates awaiting confirmation:** 13.3071176, 77.5375286 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Udupi-Upahar/store/1833086. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Recommended initial verification_status:** unverified

### Row 40: Hasanamba Iyengar Bakery

- **Confidence:** medium
- **Input:** locality: Jalappa College Road · city: Doddaballapura · source: https://www.instagram.com/reel/DDyZ28MPkOn/?hl=en · cuisine: Old-style bakery (puff, dilpasand, honey cake per IG caption/hashtags) · review_decision: needs_more_research · uncertainty: No directory listing found for a Doddaballapura 'Hasanamba Iyengar Bakery' in this round's searches. The only in-zone signal is an Instagram reel naming it on Jalappa College Rd (snippet-only, login-walled). Same-name family elsewhere (Madavara JD, 'New Hasan Iyengar Bakery' Kadnur Mara, 'Hassan Iyengar Bakery' hassanib.com 562106) are different places. Needs an on-site pass or a JD/Maps lookup. · notes: Phase 3H discovery round (2026-10-10): snippet-only evidence; no listing/phone/rating anywhere yet. Real and locally-loved per IG, but no directory identity exists - nothing claimable yet.
- **Recommended initial verification_status:** unverified

### Row 42: Desi Family Dhaba And Restaurant

- **Confidence:** medium
- **Input:** address: Near GITAM University, Nagadenahalli, Doddaballapura Main Road · locality: Nagadenahalli · city: Doddaballapura · source: https://www.justdial.com/Bangalore/Desi-Family-Dhaba-And-Restaurant-Near-Gitam-University-Nagadenahalli-Nagadenahalii/080PXX80-XX80-251105213416-R8X7_BZDET · evidence: directory_reported · review_decision: needs_more_research · uncertainty: Snippet-only round-trip (JD page body anti-bot blocked). JD rating snippets conflict (5.0/11 on a category page vs 4.8/12 on the photos page) - rating left unrecorded per the conflict rule. No phone captured. 'Opens in 3 mins' badge is not hour evidence. JD listing id created 2025-11-05 (new 2025 listing). In-zone (GITAM gate / Nagadenahalli) - the highest-value in-zone discovery of the round; needs a second source (different directory page-read, phone, or Maps work). · notes: Phase 3H discovery round (2026-10-10): JD listing + JD category-page snippets (Rs 1000 for two). No second independent directory surfaced.
- **Recommended initial verification_status:** unverified

### Row 43: Zoop Cafe

- **Confidence:** medium
- **Input:** address: Abhi Nivas, Near Anand Comfort, Jalappa College Road, Doddaballapura Locality, Doddaballapura · locality: Doddaballapura town · city: Doddaballapura · phone: +917026911121 · coords: 13.2999467004, 77.5283644348 · source: https://www.district.in/dining/doddaballapura/zoop-cafe-doddaballapura-locality · cuisine: Street Food, American, Continental · evidence: directory_reported · review_decision: needs_more_research · uncertainty: Queued name 'Diamond Zoop Cafe' does not match any source - the verified listing identity is 'Zoop Cafe' (human to confirm the intended identity). Opening hours left blank: district JSON-LD publishes only Sunday 11:00-21:30 (incomplete spec); page status observed 2026-10-10: 'Closed - Opens on 11 Oct' (temporary-closure signal, recorded verbatim). district shows '0.0 based on 1 rating' - no meaningful rating recorded. Out-of-zone namesake at Dabaspet/Sompura exists (not this listing). · notes: Phase 3H discovery round (2026-10-10): district.in JSON-LD page-read (address, phone, cuisine, geo, Rs 300 for two) + JD/magicpin/Zomato existence-references.
- **Coordinates awaiting confirmation:** 13.2999467004, 77.5283644348 — evidence level: directory_reported · source: https://www.district.in/dining/doddaballapura/zoop-cafe-doddaballapura-locality. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Recommended initial verification_status:** unverified

### Row 45: Lounge de La Reserve

- **Confidence:** medium
- **Input:** address: No. 63, Raghunathapura, Devanahalli Road, Doddaballapur, Bengaluru · locality: Raghunathapura · city: Doddaballapura · phone: +916366946331 · coords: 13.286726, 77.5824616 · source: https://www.district.in/dining/doddaballapura/lounge-de-la-r%C3%A9serve-2-doddaballapura-locality · cuisine: Continental, Asian, Mediterranean · listing_rating: 4.1 · listing_reviews: 26 · checked_on: 2026-10-10 · evidence: directory_reported · review_decision: needs_more_research · uncertainty: OUT-OF-ZONE FINDING - recorded recommendation do_not_import: every address variant places it on the Devanahalli Road at Raghunathapura near Grover Zampa Vineyards - the Doddaballapura-Devanahalli stretch, outside both agreed zones (queued name was 'La Reserve Lounge'; the listing identity is 'Lounge de La Reserve'; the decision enum has no do_not_import value so needs_more_research is recorded with this recommendation, same practice as rows 5 and 10). Opening hours conflict - left blank: district JSON-LD 10:00-17:00 x7 vs EazyDiner 09:00 AM - 05:00 PM x7. Price for two conflict: district Rs 1100 vs EazyDiner Rs 2000. Official Grover Zampa winery-tours page corroborates the phone. Human may override the zone call. · notes: Phase 3H discovery round (2026-10-10): district.in + EazyDiner page-reads. Recorded in full because the name was human-queued, but it fails the zone statement.
- **Coordinates awaiting confirmation:** 13.286726, 77.5824616 — evidence level: directory_reported · source: https://www.district.in/dining/doddaballapura/lounge-de-la-r%C3%A9serve-2-doddaballapura-locality. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Recommended initial verification_status:** unverified

## Existing-record matches (no action taken — never auto-merged) (0)

_None._

## Possible duplicates / ambiguous — MANUAL REVIEW REQUIRED (9)

### Row 1: GITAM Cafe

- **Confidence:** low
- **Input:** locality: Heggadahalli · city: Doddaballapura · source: https://www.justdial.com/Bangalore/Gitam-Cafe-Heggadahalli/9999P8152-8152-240418121301-Y3M3_BZDET/reviews · listing_rating: 3.7 · checked_on: 2026-10-09 · evidence: directory_reported · review_decision: possible_duplicate_hold · uncertainty: Justdial carries 'Gitam Cafe' (3.7, own categories/hours page showing 8:00 am - 9:00 pm) separately from TWO 'Gitam University Canteen' listings (created 2023-11 and 2023-12, address 'Byradenahalli, Doddaballapur Road, Heggadahalli'); the Snapchat place-nearby list also carries both separately (Phase 3D). 'GITAM Cafe' is a brand name GITAM uses at other campuses (an Abbigere, Bengaluru cafe exists - different city, not this one). Two independent platforms list the cafe apart from the canteen, but no distinguishing phone or street address has been captured for the cafe, so the duplicate hold stays pending a field check or distinguishing contact. Review count not visible in the captured snippet. · notes: Phase 3C candidate (possible-duplicate bucket). JD listing located in Heggadahalli (village cluster by GITAM/Nagadenahalli). Rating 3.7 read from the JD reviews-page snippet on 2026-10-09; JD page body not readable in this environment (anti-bot), so address/phone stay blank. | Phase 3F update (2026-10-09): JD categories-page snippet gives hours 8:00 am - 9:00 pm; canteen's two separate JD listings and the Abbigere GITAM Cafe documented. Hold kept - no distinguishing phone/address yet.
- **Matches to existing records:**
  - `7259037f` **GITAM University Canteen** · locality: GITAM campus — similarity 0.375 (name-ambiguous-proper-token) · existing coords: NULL — confidence low
- **Flags:** `LOCALITY_CONFLICT`
- **Recommended initial verification_status:** unverified

### Row 6: Mantralaya Hotel & Chats

- **Confidence:** medium
- **Input:** address: Near Anjineya Temple, Doddaballapur · locality: Basettihalli · city: Doddaballapura · source: https://www.justdial.com/Bangalore/Mantralaya-Tiifins-And-Chats-Near-Anjineya-Temple-Doddaballapur/080PXX80-XX80-230328182140-Q5M6_BZDET/reviews · listing_rating: 4.8 · listing_reviews: 15 · checked_on: 2026-10-09 · evidence: directory_reported · review_decision: needs_more_research · uncertainty: Two Mantralaya-branded Justdial listings are DISTINCT businesses (Phase 3F, 2026-10-09): (a) this row - 'Mantralaya Tiifins And Chats', Near Anjineya Temple, Basettihalli, rated 4.8/15, hours 6:00 am - 10:00 pm Mon-Sun (JD snippet, breakfast/lunch/dinner); (b) 'Mantralaya Hotel', Near Railway Station (separate worksheet row 24), pure veg, 6:00 am - 9:30 pm. The Phase 3C candidate name 'Mantralaya Hotel & Chats' matches this listing on the '& Chats' element - recorded as the closer match, an inference the human reviewer should confirm. Neither listing is in Nagadenahalli (the 3C grouping said 'Near GITAM/Nagadenahalli'). A vyaparify 'Manthralayahotel' lodging page and a Bengaluru 'Mantralaya Cafe' (12th Cross) are unrelated. This row remains JD-only (snippet-level); a phone would complete its identity. · notes: Row matched to the Tiffins-And-Chats listing on name evidence ('& Chats'); identity still requires field confirmation. A vyaparify 'Manthralayahotel' lodging page also exists (different business type). | Phase 3F update (2026-10-09): full weekly hours from JD snippet (6:00 am - 10:00 pm); rows 6/24 confirmed as distinct listings; 3C-name mapping to this row documented as an inference.
- **Intra-file duplicates:** rows 24 — both entries stay separate; a human must decide.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 15: Hotel Bindushree Family Restaurant

- **Confidence:** medium
- **Input:** address: 7Hh4+Xq9, K.G Govindapura, Bashettihalli, Bangalore · locality: Bashettihalli · city: Doddaballapura · coords: 13.2799, 77.556969 · source: https://magicpin.in/Bangalore/Bashettihalli/Hotel/Hotel-Bindushree-Family-Restaurant/store/1174189 · listing_rating: 4.2 · listing_reviews: 5 · checked_on: 2026-10-09 · evidence: directory_reported · review_decision: distinct_new_business · uncertainty: Hours conflict: Justdial 6:00 am - 10:00 pm (breakfast/lunch/dinner) vs magicpin 10:00 AM-10:00 PM - opening_hours left blank. Coordinates derived from the plus code '7Hh4+Xq9' published in magicpin's address field (decoded 13.27990, 77.55697 with a Doddaballapura-station reference; the decoder was validated against a known database point) - directory-reported, awaiting confirmation. JD cross-list ties the name to 'K.G Govindapura, Basettihalli - 562163', consistent with magicpin. Phase 3F (2026-10-09): the Yandex org page was re-read - 'Phone number not specified', 'No reviews yet', business hours shown only as 'Open until 10:00 PM' (closing-time claim, not a full-day window) - adds no new fields; the JD-vs-magicpin hours conflict stands and opening_hours stays blank; coordinates remain the decoded plus-code pin (directory-reported, awaiting confirmation). magicpin also describes 'lodging options' alongside the restaurant. · notes: Second sources: https://www.justdial.com/Bangalore/Hotel-Bindushree-Family-Restaurant-Basettihalli/080PXX80-XX80-220317215349-N3C9_BZDET and yandex.com/maps/org/hotel_bindushree_family_restaurant/7787971394 ('open until 10:00 PM'). | Phase 3F update (2026-10-09): Yandex page re-read (no phone published; 'Open until 10:00 PM' only) - no field changes.
- **Intra-file duplicates:** rows 32, 44 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.2799, 77.556969 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Bashettihalli/Hotel/Hotel-Bindushree-Family-Restaurant/store/1174189. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 17: Sri Vinayaka Food Point

- **Confidence:** medium
- **Input:** address: Railway Station, Doddaballapura Locality, Doddaballapura · locality: Doddaballapura Railway Station · city: Doddaballapura · phone: +918197052687 · coords: 13.279693, 77.5515242 · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Sri-Vinayaka-Food-Point/store/15a4365 · cuisine: South Indian, North Indian, Chinese, Street Food, Fast Food, Juices, Shakes, Desserts · listing_rating: 4.1 · listing_reviews: 4731 · checked_on: 2026-10-09 · evidence: directory_reported · review_decision: distinct_new_business · uncertainty: Hours now conflict (Phase 3F re-check): magicpin verified listing 8:00 AM - 9:30 PM vs district.in structured hours 12:00-22:00 all seven days - opening_hours left blank per the conflict rule. Coordinates are district.in's structured geo (directory-reported, awaiting confirmation; station-cluster pin). Two Justdial listings exist: 'Railway Station, Doddaballapura Locality' and 'No. 01, 1st Floor, Opposite Nageshwara Temple, Kongadiyappa Main Road, Basettihalli, Bangalore-562163' - the temple-road and station-locality placements remain unreconciled. district.in shows rating 3.9 and Rs 300 for two vs magicpin 4.1/4731 and Rs 500 for two; magicpin's 4,731 count is an all-source aggregate. Zomato's dining page displays 4.3 / 4,930 (existence reference only - no proprietary data copied). Swiggy/Zomato listings referenced for existence only. · notes: Second sources: https://www.district.in/dining/doddaballapura/sri-vinayaka-food-point-doddaballapura-locality (3.9) and https://www.justdial.com/Bangalore/Sri-Vinayaka-Food-Point-Opposite-Nageshwara-Temple-Basettihalli/080PXX80-XX80-220929135021-Q4T9_BZDET. | Phase 3F update (2026-10-09): district.in structured geo recorded (13.279693, 77.5515242); magicpin-vs-district hours conflict -> opening_hours blanked; JD Basettihalli verbatim address line documented; Zomato 4.3/4,930 existence-ref noted.
- **Intra-file duplicates:** rows 20 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.279693, 77.5515242 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Sri-Vinayaka-Food-Point/store/15a4365. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 20: Hotel Krishnamoorthy

- **Confidence:** medium
- **Input:** address: Near Railway Station, Scout Camp Road, Doddaballapura, Karnataka 562163 · locality: Doddaballapura Railway Station · city: Doddaballapura · phone: +919742663255 · coords: 13.280305, 77.551956 · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Hotel-Krishnamoorthy/store/525080 · cuisine: South Indian, Chinese, Juices, Street Food · listing_rating: 4.3 · listing_reviews: 2 · checked_on: 2026-10-09 · evidence: directory_reported · review_decision: possible_duplicate_hold · uncertainty: IDENTITY HOLD RAISED (Phase 3F, 2026-10-09): a Facebook video caption by the local Doddaballapura food page 'Nammuru Doddaballapura' describes 'Sri Ayyappa Tiffin Room, also known as Krishnamurthy Hotel, a family-run establishment founded in 1978' - and the existing DB record 'Ayyappa Tiffin Room' sits on the same Scout Camp Road near the railway station (~150 m from the Mappls pin). Contradicting evidence: different phones (magicpin verified +919742663255 vs the existing record's +918088599999), a separate magicpin verified listing with its own menu and hours (10:00 AM - 10:00 PM, re-confirmed today), and a separate Mappls place entry (OD43DN, pincode 562163, DIGIPIN 4PF-T72-7L8F); no Justdial listing for 'Hotel Krishnamoorthy' surfaced. 'Krishnamurthy' may also be the founder's name rather than a trading alias. Remote sources cannot settle same-vs-distinct - downgrade from distinct_new_business; a call to both numbers or an on-site check decides. · notes: Second sources: the Mappls place page (address + coordinates) and onefivenine.com village indexes ('hotel krishnamoorthy. near railwayStation; scout Camp Road'). magicpin files it under 'Restaurant'; recorded as category 'hotel' to match the pilot's convention for 'Hotel X' eateries (existing DB precedent: Hotel Halli Nanasu, Hotel Royal Nandhana). | Phase 3F update (2026-10-09): FB alias claim ('Ayyappa Tiffin Room, also known as Krishnamurthy Hotel') + ~150 m proximity -> possible_duplicate_hold. magicpin hours 10:00-22:00 re-confirmed.
- **Intra-file duplicates:** rows 17 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.280305, 77.551956 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Hotel-Krishnamoorthy/store/525080. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 24: Mantralaya Hotel

- **Confidence:** medium
- **Input:** address: Near Railway Station, Doddaballapur · locality: Doddaballapura Railway Station · city: Doddaballapura · source: https://www.justdial.com/Bangalore/Mantralaya-Hotel-Near-Railway-Station-Doddaballapur/080PXX80-XX80-250115082342-Q8K8_BZDET · evidence: directory_reported · review_decision: needs_more_research · uncertainty: Pure-veg hotel (eatery) per JD title; JD page not readable in this environment, so phone/rating/address details beyond the listing slug are not captured. Name overlap with the 'Mantralaya Hotel & Chats' candidate row is expected - the tool should flag the pair for human review. Phase 3F (2026-10-09): confirmed a DISTINCT listing from row 6 ('Mantralaya Tiifins And Chats', Basettihalli) - different name, address and hours; this row's hours 6:00 am - 9:30 pm re-confirmed by the JD snippet. No phone or rating captured yet; a dedicated search surfaced no second source beyond JD. · notes: Discovery (zone 2). Hours '6:00 am - 9:30 pm' read from the JD snippet on 2026-10-09. | Phase 3F update (2026-10-09): distinctness from row 6 documented; stays needs_more_research (JD-only, sparse).
- **Intra-file duplicates:** rows 6 — both entries stay separate; a human must decide.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 32: Abhis Food Court

- **Confidence:** medium
- **Input:** address: Railway Station, Scout Camp Road, Doddaballapura Locality, Doddaballapura · locality: Doddaballapura Railway Station / Scout Camp Road · city: Doddaballapura · phone: +916361695837 · coords: 13.2798556, 77.5561673 · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Abhis-Food-Court/store/1575606 · cuisine: Pizza, fast food, beverages · listing_rating: 4.9 · listing_reviews: 1 · checked_on: 2026-10-10 · evidence: directory_reported · review_decision: distinct_new_business · uncertainty: Price for two conflict: district.in Rs 300 vs magicpin Rs 400 - band recorded, exact value unresolved. A second JD listing 'Abhis Food Court' in Thammasettihalli (561205, 10:00 am - 10:00 pm) exists - unresolved (possible second outlet or JD misfile). Name adjacency to existing 'Abhiram Food Court' (Moparahalli, ~4 km, different phone) reviewed as distinct. magicpin rating base is a single review (1). district.in hasMap is a query URL - not a listing URL (WORKFLOW rule 4). · notes: Phase 3H discovery round (2026-10-10): lead queued in Phase 3F. magicpin VERIFIED listing + district.in JSON-LD page-reads; hours 17:00-22:00 agree across magicpin, district JSON-LD (Mon-Sun 17:00-22:00) and a JD snippet. Coordinates are district.in JSON-LD geo with the identical pair independently published in magicpin JSON-LD (directory-reported, bucket 6). Zomato existence-reference only.
- **Intra-file duplicates:** rows 15, 44 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.2798556, 77.5561673 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Abhis-Food-Court/store/1575606. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

### Row 41: Durgashree Samruddhi Grand Veg

- **Confidence:** low
- **Input:** address: Muthasandra, Karnataka 561203 · locality: Muthasandra · city: Doddaballapura · phone: +919148101848 · coords: 13.3091042, 77.5379518 · maps_listing: https://www.google.com/maps/place/Durgashree+Samruddhi+Grand+Veg/@13.3091042,77.5353769,17z/data=!3m1!4b1!4m6!3m5!1s0x3bb1de6b5c3814af:0xb198b1f7b3d9867b!8m2!3d13.3091042!4d77.5379518!16s%2Fg%2F11fzvms4ld · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Durgashree-Samruddhi-Grand-Veg/store/1836915 · cuisine: Pure veg · listing_rating: 3.9 · listing_reviews: 868 · checked_on: 2026-10-10 · evidence: directory_reported · review_decision: needs_more_research · uncertainty: Name-family and address split unresolved: JD 'Durgashree Samruddhi Grand' near Kasaba Police Station vs this magicpin 'Grand Veg' at Muthasandra vs JD/district 'Durgashree Samruddhi Garden' (Bengaluru Hindupur Rd, Opposite Town Police Station) - the human must confirm which family member is the candidate. Opening hours left blank: magicpin window 11:30 AM - 2:00 PM (lunch display) conflicts with the family's other listings. maps_listing_url is a canonical /maps/place/ URL legitimately expanded from a short link published in a YouTube video description - no place-page content readable (marker coordinates identical to magicpin JSON-LD; directory-class evidence only). Plus code 8G5Q+J5W recorded as string. · notes: Phase 3H discovery round (2026-10-10): magicpin VERIFIED listing page-read (3.9/868, Rs 500 for two, phone, geo) + first rule-4-compliant Maps place URL captured in the project. Strong listings, but the Grand/Garden identity split must be settled first.
- **Matches to existing records:**
  - `987dad98` **Shri Manjunatha Grand Veg** · locality: Doddaballapura Railway Station — similarity 0.433 (name-ambiguous-proper-token) · existing coords: NULL — confidence low
- **Coordinates awaiting confirmation:** 13.3091042, 77.5379518 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Durgashree-Samruddhi-Grand-Veg/store/1836915. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `LOCALITY_CONFLICT`
- **Recommended initial verification_status:** unverified

### Row 44: Five Star Kohli Hut

- **Confidence:** medium
- **Input:** address: Ward 3, Near Indian Petrol Bunk, Scout Camp, Doddaballapura Locality, Doddaballapura · locality: Scout Camp Road · city: Doddaballapura · phone: +916363693426 · coords: 13.2796588, 77.5567803 · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Five-Star-Kohli-Hut/store/1644707 · cuisine: Fast Food · evidence: directory_reported · review_decision: needs_more_research · uncertainty: Relationship to the JD 'Five Star Chicken - Koli Hut' listing (Basettihalli, Near Indian Overseas Bank) and to the national 'Five Star Chicken' brand is unresolved (one call decides; no conflict with the existing DB). No rating shown on the magicpin listing. Coordinates are magicpin JSON-LD geo (directory-reported, bucket 6) and sit ~30 m from row 15's plus-code decode - a proximity artifact across directories, both pins awaiting confirmation. · notes: Phase 3H discovery round (2026-10-10): magicpin VERIFIED listing page-read (phone, 11:00 AM - 8:00 PM, Rs 450 for two, geo). Exact-name verified listing; brand-naming question blocks promotion.
- **Intra-file duplicates:** rows 15, 32 — both entries stay separate; a human must decide.
- **Coordinates awaiting confirmation:** 13.2796588, 77.5567803 — evidence level: directory_reported · source: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Five-Star-Kohli-Hut/store/1644707. Candidate pin only — do NOT treat as confirmed GPS until independently checked against the exact business.
- **Flags:** `INTRA_FILE_DUPLICATE`
- **Recommended initial verification_status:** unverified

## Insufficient evidence (1)

### Row 5: Biryani Cafe

- **Confidence:** low
- **Input:** review_decision: needs_more_research · uncertainty: Fully generic name. Searches combining the name with Nagadenahalli, Doddaballapura and GITAM (2026-10-09) returned no matching listing in the target zones; several unrelated businesses elsewhere in Bengaluru share the name. The Phase 3C region grouping is the only locality hint and it is unverified. · notes: No listing found; nothing asserted about existence or newness. Row kept so the open question stays visible.
- **Recommended initial verification_status:** unverified

## Invalid or missing data (0)

_None._

## 6. Candidate coordinates awaiting confirmation (16)

Every pin below stays a CANDIDATE until its relationship to the exact business is independently confirmed. A directory-published pin or a map-search result is NOT proof of an exact coordinate.

| Row | Candidate | Bucket | Coordinates | Evidence | Source URL |
| ---: | --- | --- | --- | --- | --- |
| 4 | Epicurus Multi Cuisine Restaurant | potential_new | 13.2852505, 77.598904 | directory_reported | https://www.district.in/dining/doddaballapura/epicurus-multi-cuisine-restaurant-doddaballapura-locality |
| 9 | Vaibhava Sweets & Chats | potential_new | 13.2869155, 77.5747334 | directory_reported | https://www.youtube.com/watch?v=HMjTk-zVNoU |
| 15 | Hotel Bindushree Family Restaurant | possible_duplicate | 13.2799, 77.556969 | directory_reported | https://magicpin.in/Bangalore/Bashettihalli/Hotel/Hotel-Bindushree-Family-Restaurant/store/1174189 |
| 17 | Sri Vinayaka Food Point | possible_duplicate | 13.279693, 77.5515242 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Sri-Vinayaka-Food-Point/store/15a4365 |
| 20 | Hotel Krishnamoorthy | possible_duplicate | 13.280305, 77.551956 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Hotel-Krishnamoorthy/store/525080 |
| 32 | Abhis Food Court | possible_duplicate | 13.2798556, 77.5561673 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Abhis-Food-Court/store/1575606 |
| 33 | Burger Time | potential_new | 13.291965, 77.542015 | directory_reported | https://www.district.in/dining/doddaballapura/burger-time-doddaballapura-locality |
| 34 | Bbq Junction | potential_new | 13.285751, 77.5311807 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Bbq-Junction/store/1835603 |
| 35 | Rajashree Veg And Non-Veg Family Restaurant | potential_new | 13.301893, 77.55085 | directory_reported | https://www.district.in/dining/doddaballapura/rajashree-veg-and-non-veg-family-restaurant-doddaballapura-locality |
| 36 | Maha Naati Ruchi | potential_new | 13.3044077, 77.5425688 | directory_reported | https://www.district.in/dining/doddaballapura/maha-naati-ruchi-3-doddaballapura-locality |
| 38 | Shawarma Cartel | potential_new | 13.2934035, 77.5414015 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Shawarma-Cartel/store/17934a0 |
| 39 | Udupi Upahar | potential_new | 13.3071176, 77.5375286 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Udupi-Upahar/store/1833086 |
| 41 | Durgashree Samruddhi Grand Veg | possible_duplicate | 13.3091042, 77.5379518 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Durgashree-Samruddhi-Grand-Veg/store/1836915 |
| 43 | Zoop Cafe | potential_new | 13.2999467004, 77.5283644348 | directory_reported | https://www.district.in/dining/doddaballapura/zoop-cafe-doddaballapura-locality |
| 44 | Five Star Kohli Hut | possible_duplicate | 13.2796588, 77.5567803 | directory_reported | https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Five-Star-Kohli-Hut/store/1644707 |
| 45 | Lounge de La Reserve | potential_new | 13.286726, 77.5824616 | directory_reported | https://www.district.in/dining/doddaballapura/lounge-de-la-r%C3%A9serve-2-doddaballapura-locality |

## Next step

Nothing has been imported. Resolve rows flagged for manual review, fix invalid rows, then re-run this validator until the report is clean. Only after explicit human approval may an import be prepared — via a reviewed SQL/insert path, never by this tool.
