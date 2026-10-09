# Foodie — Phase 3H Discovery Evidence (Research-Only Round)

**Round date (per task directive):** 2026-10-10
**Actual execution window:** all searches and page reads were executed 2026-10-09 16:10–17:40 UTC (i.e. late evening IST). `rating_checked_on` throughout this report is recorded as **2026-10-10**, the round date under which this evidence is submitted; every rating is traceable to the exact source URL listed beside it.
**Agent:** research sub-agent (Task ID 4-a) · **Scope:** research ONLY. No code changes, no database access, no imports, no fabrication.

---

## 1. Zone statement

Only these two geographic zones were researched:

1. **GITAM Bengaluru campus (Doddaballapura Main Rd) and Nagadenahalli village.**
2. **The corridor toward Doddaballapura Railway Station Road, including Scout Camp Road, Kasbhag Road, and Doddaballapur town proper.**

Every candidate below was checked against these zones. Where the evidence puts a business outside both zones, that is stated explicitly and flagged in the proposed decision.

## 2. Method summary

- **CLI:** the documented `z-ai web-search` / `z-ai web_search` subcommands **do not exist** in the current CLI build (`z-ai --help` lists chat/vision/tts/asr/image/image-edit/image-search/video/async-result/function only). The skill-documented equivalent was used instead, exactly as prior phases' cached scripts show:
  - Web search: `z-ai function -n web_search -a '{"query": "...", "num": 8}'` — run **sequentially**, with a retry wrapper (up to 4 attempts, backoff) for robustness.
  - Page reads: `z-ai function -n page_reader -a '{"url": "..."}'`.
- **Volume:** **17 web searches** (1 priority lead + Zomato existence-ref, 13 secondary queue, 2 discovery) and **16 page reads** (p01–p16). Raw outputs cached in `/tmp/phase3h/` (s01–s17, p01–p16) — deliberately **not** committed anywhere.
- **Evidence labels:** every field below is labeled **[PAGE-READ]** (content read from the page itself this session) or **[SNIPPET]** (search-result snippet only — weaker evidence), each with its exact source URL.
- **Dedup baseline:** all candidates were compared against the 14 known existing restaurants (Abhiram Food Court, Amigos Cafe, Ayyappa Tiffin Room, Brundavana, Chickpet Donne Biryani House, GITAM University Canteen, Hotel Halli Nanasu, Hotel Royal Nandhana, Priyanka Tiffen Center, Shri Manjunatha Grand Veg, Sri Annapoorneshwari Tiffin Center, Sri Ganesh Grand, SS Hyderabadi Biriyani Zone, The Biryani Shack) **and** against the 8 records already proposed in `phase3g-proposed-import-manifest.json` (The Shri Cafe and Restaurant, Epicurus Multi Cuisine Restaurant, Lotus Gardenia, Best Choice Bakery, Rainbow Huts Family Restaurant, Hotel Bindushree Family Restaurant, Sri Vinayaka Food Point, Kiran Tiffin Room). **No candidate in this round duplicates any of those 22 names** (one phonetic adjacency noted for Abhis Food Court — see §3).
- **No scraping** of Zomato/Swiggy proprietary data: Zomato/Swiggy appearances are recorded as **existence-reference only** (URL, at most a banner-level operational signal), per the task rules. Google Maps was not searched, scraped or bypassed; the single Maps artifact below (§13) came from legitimately expanding a short link published in a public YouTube video description, the same procedure Phase 3F documented.

## 3. Source accessibility notes

| Source | Status this session |
| --- | --- |
| magicpin listing pages | **Readable** (page-read). JSON-LD frequently publishes `geo`, `priceRange`, `telephone`, `servesCuisine`, `aggregateRating` — labeled "magicpin JSON-LD" where used. |
| district.in dining pages | **Readable** (page-read). JSON-LD (`@type: Restaurant`) reliably publishes geo, telephone, priceRange, servesCuisine, full `openingHoursSpecification`, sometimes `aggregateRating`. |
| Restaurant Guru | **Readable** (page-read). Attributes its rating aggregate to Google ("Google (3.9/5) 97"). |
| EazyDiner | **Readable** (page-read). |
| Snapchat place pages | **Readable** (page-read). |
| Google Maps | **JS-walled.** One short link (`maps.app.goo.gl/…`) published in a YouTube video description was expanded via page reader; the preview payload yielded a canonical `/maps/place/…` URL + embedded marker coordinates (§13). No place-page content (rating/hours) was readable. Search URLs were never treated as listings (WORKFLOW rule 4). |
| Justdial | **Anti-bot blocked** — snippet-level evidence only, as in Phases 3D/3F. |
| Zomato / Swiggy | Existence-reference only (URL/slug). No listing data copied. |
| Instagram / Facebook / YouTube | Snippet-level only (login walls). |

---

## 4. PRIORITY LEAD — Abhis Food Court

*(Queued in Phase 3F, `phase3f-identity-resolution.md` §9: "Railway Station, Scout Camp Road… ₹300 for two, opens 5:00 PM, +916361695837, magicpin 4.9/1; Zomato listing exists.")*

| Field | Value | Evidence |
| --- | --- | --- |
| name | Abhis Food Court | [PAGE-READ] magicpin + [PAGE-READ] district.in, URLs below |
| address | Railway Station, Scout Camp Road, Doddaballapura Locality, Doddaballapura (magicpin appends "Doddaballapur, Bangalore") | [PAGE-READ] https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Abhis-Food-Court/store/1575606 ; [PAGE-READ] https://www.district.in/dining/doddaballapura/abhis-food-court-doddaballapura-locality (identical streetAddress in district JSON-LD) |
| phone | +91 63616 95837 | [PAGE-READ] magicpin ("✓ Verified listing") ; [PAGE-READ] district.in JSON-LD `telephone":"+916361695837"`. Two independent directories agree. |
| opening hours | 17:00-22:00, all 7 days | [PAGE-READ] magicpin "5:00 PM – 10:00 PM"; [PAGE-READ] district.in JSON-LD `openingHoursSpecification` Mon–Sun 17:00→22:00; [SNIPPET] JD listing "Monday:- 5:00 pm - 10:00 pm" (https://www.justdial.com/Bangalore/Abhis-Food-Court-Doddatumkur/080PXX80-XX80-230619120424-N4U2_BZDET). Three sources agree. |
| cuisine | Pizza (magicpin JSON-LD `servesCuisine:["Pizza"]`, page header "Pizza"); district page shows "Cuisines: Beverages" | [PAGE-READ] magicpin; [PAGE-READ] district.in |
| menu_notes | Veg Fingers [6 pc] ₹60; Veg Sandwich ₹60; Egg Sandwich ₹70; Chicken Leg Piece ₹80; Chicken Sandwich ₹80 ("Popular Items") | [PAGE-READ] magicpin store page (Items section) |
| price_level | district: "₹300 for two"; magicpin: "₹400 for two" (JSON-LD `priceRange":"₹400"`) — **conflict recorded, not reconciled**; suggested band ₹ | [PAGE-READ] district.in; [PAGE-READ] magicpin |
| listing_rating / review_count | **4.9 / 1** (magicpin; single review by "Chirag Sharma, May 6, 2024") — recommended listing_rating. district.in displays "0.0" with no review count (no-reviews default) — recorded, not used. | [PAGE-READ] magicpin store page ("4.9 (1)"); [PAGE-READ] district.in ("0.0 Rating icon for 0 stars"). rating_source_url = magicpin URL above; rating_checked_on = 2026-10-10 |
| coordinates | **13.2798556, 77.5561673** — derivation: **district.in JSON-LD GeoCoordinates**; the **identical** pair is independently published in **magicpin JSON-LD GeoCoordinates**. Directory-reported (bucket 6), never verified. | [PAGE-READ] both JSON-LD blocks (URLs above) |
| maps_listing_url | none captured. district.in JSON-LD `hasMap` is a **query URL** (`https://maps.google.com/?q=Abhis+Food+Court+...`) — rejected as a listing URL per WORKFLOW rule 4. | — |
| Zomato | existence-reference only: https://www.zomato.com/doddaballapura/abhis-food-court-doddaballapura-locality/order (slug confirms the listing exists; no data copied) | [SNIPPET] |
| second JD listing (uncertainty) | A second JD listing "Abhis Food Court — Coffee Shops in Thammasettihalli" exists: https://www.justdial.com/Bangalore/Abhis-Food-Court-Thammasettihalli/080PXX80-XX80-230614180022-Q6S8_BZDET — snippet shows "Doddaballapura, Scout Camp Road, Thammasettihalli, Bangalore-561205… 10:00 am - 10:00 pm". Different pincode (562163 vs 561205) and hours (10 am–10 pm vs 5–10 pm). Possible second outlet or JD misfile; unresolved. | [SNIPPET] |

**Uncertainty notes:** (a) price conflict ₹300 (district) vs ₹400 (magicpin) — both recorded; (b) second JD Thammasettihalli listing as above; (c) name-adjacency to existing **Abhiram Food Court** (Moparahalli) — different road (Scout Camp Rd), different phone, no DB match on name/phone; treated as distinct, reviewer to eyeball; (d) single magicpin review = thin rating base.

**Proposed worksheet row:** name `Abhis Food Court` · category `fast_food` (pizza/snacks evening food court; magicpin categorizes under Restaurant; "food court" naming + pizza/fast-food menu → `fast_food`; reviewer may prefer `restaurant`) · locality `Doddaballapura Railway Station / Scout Camp Road` · city `Doddaballapura` · phone `+916361695837` · hours `17:00-22:00` · cuisine `Pizza, fast food, beverages` · menu_notes as above · price_level `₹` · listing_rating `4.9` · listing_review_count `1` · rating_source_url magicpin URL · rating_checked_on `2026-10-10` · coordinates `13.2798556, 77.5561673` (district.in JSON-LD geo; corroborated by magicpin JSON-LD) · source_url magicpin URL · uncertainty: price conflict; second JD listing; Abhiram adjacency.

**review_decision suggestion: `distinct_new_business`** — two page-read directory listings with a unique verified phone, a unique station-corridor address, and no match to any existing record; the strongest evidence package of the round. Coordinates land in bucket 6 (directory-reported) as always.

---

## 5. La Reserve Lounge (Doddaballapura) — listing identity: "Lounge de La Réserve"

| Field | Value | Evidence |
| --- | --- | --- |
| name | Lounge de La Réserve (no separate "La Reserve Lounge" Doddaballapura listing found; a JD "La Reserve Lounge" exists in **Devanahalli** — different place) | [PAGE-READ] district.in; [SNIPPET] https://www.justdial.com/Bangalore/La-Reserve-Lounge-Near-Suraksha-Hospital-Devanahalli/080PXX80-XX80-170113011947-K5U3_BZDET |
| address | district JSON-LD: "Raghunathapur, Doddaballapura Locality, Doddaballapura"; EazyDiner: "No. 63, Raghunathapura, Devanahalli Road, Doddaballapur, Bengaluru" | [PAGE-READ] https://www.district.in/dining/doddaballapura/lounge-de-la-r%C3%A9serve-2-doddaballapura-locality ; [PAGE-READ] https://www.eazydiner.com/bengaluru/lounge-de-la-reserve-doddaballapura-main-road-north-bengaluru-684623 |
| phone | +91 63669 46331 | [PAGE-READ] district.in JSON-LD; corroborated by official Grover Zampa page [SNIPPET] https://www.groverzampa.in/winery-tours ("La Reserve Lounge… Tel: +91 63669 46331… 9am – 7pm") |
| hours | **CONFLICT:** district JSON-LD 10:00-17:00 ×7 days vs EazyDiner "09:00 AM to 05:00 PM" ×7 days | [PAGE-READ] both |
| cuisine | Continental, Asian, Mediterranean (district JSON-LD); "European" (EazyDiner) | [PAGE-READ] both |
| price_level | district "₹1100 for two"; EazyDiner "₹2000 for two approx." — conflict recorded | [PAGE-READ] both |
| listing_rating / review_count | 4.1 / 26 ratings (EazyDiner page shows "4.1 26 ratings", "8 reviews and 26 ratings"; search snippet labels these Google ratings). district shows 0.0 (no-review default). | [PAGE-READ] EazyDiner; rating_source_url = EazyDiner URL; rating_checked_on = 2026-10-10 |
| coordinates | **13.286726, 77.5824616** — derivation: **district.in JSON-LD geo** | [PAGE-READ] district.in |
| Zomato / Swiggy | existence-reference only: https://www.zomato.com/doddaballapura/lounge-de-la-r%C3%A9serve-2-doddaballapura-locality/order ; https://www.swiggy.com/restaurants/bangalore/doddaballapura/lounge-de-la-reserve-658220/dineout | [SNIPPET] |

**Zone check (important):** every address variant places it on the **Devanahalli Road at Raghunathapura, near Grover Zampa Vineyards** — i.e. on the Doddaballapura–Devanahalli stretch, **not** on the GITAM/Nagadenahalli Main-Rd stretch and **not** in the station corridor or town proper. EazyDiner's area label "Doddaballapura Main Road, North Bengaluru" is a marketing label, contradicted by its own location block. The name was human-queued, so the evidence is recorded in full, but on the zone statement it fails.

**Proposed decision: `do_not_import`** — located outside both agreed zones (Raghunathapura, Devanahalli Rd); human may override since the name was queued. Evidence quality: page-read ×2.

---

## 6. Burger Time (Doddaballapura)

| Field | Value | Evidence |
| --- | --- | --- |
| name | Burger Time | [PAGE-READ] district.in |
| address | Shop 17, Raj Kamal Theater, Near Doddaballapur Town, Doddaballapura Locality, Doddaballapura | [PAGE-READ] https://www.district.in/dining/doddaballapura/burger-time-doddaballapura-locality (JSON-LD streetAddress); [SNIPPET] JD "Near Raj Kamal Theater" (https://www.justdial.com/Bangalore/Burger-Time-Near-Raj-Kamal-Theater-Doddaballapur/080PXX80-XX80-220418220006-W2T8_BZDET) |
| phone | +91 85537 17034 | [PAGE-READ] district.in JSON-LD; corroborated [SNIPPET] Instagram bio "call 8553717034" (https://www.instagram.com/burger_time_doddaballapur) |
| hours | 10:45-20:45 ×7 days (district JSON-LD); JD snippet agrees ("10:45 am - 8:45 pm") | [PAGE-READ] district.in; [SNIPPET] JD |
| cuisine | American, Continental (district JSON-LD); JD snippet "breakfast, lunch, and dinner" | [PAGE-READ] + [SNIPPET] |
| price_level | ₹400 for two | [PAGE-READ] district.in (page + JSON-LD) |
| listing_rating / review_count | **3.9 / 6** — derivation: district.in JSON-LD `aggregateRating` (ratingValue 3.9, ratingCount 6) | [PAGE-READ] district.in; rating_source_url = district URL; rating_checked_on = 2026-10-10 |
| coordinates | **13.291965, 77.542015** — derivation: **district.in JSON-LD geo** | [PAGE-READ] district.in |
| Other listings | magicpin store https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Burger-Time/store/96499b [SNIPPET]; Zomato existence-ref https://www.zomato.com/doddaballapura/burger-time-doddaballapura-locality/order [SNIPPET]; Swiggy existence-ref https://www.swiggy.com/city/doddaballapura/burger-time-doddaballapura-rest1360353 [SNIPPET] | |

**Uncertainty:** none material; JD page body unreadable (snippet only). Town-proper location (zone 2). No name/phone/address overlap with any existing record.

**Proposed decision: `distinct_new_business`** — unique phone + address + page-read directory data with cross-source phone/hours agreement. Evidence quality: page-read.

---

## 7. Bbq Junction (Doddaballapura)

| Field | Value | Evidence |
| --- | --- | --- |
| name | BBQ Junction (candidate spelling "Bbq Junction" = same listing) | [PAGE-READ] magicpin |
| address | Green Valley Layout gate, Sri Kongadiyappa College Rd, next to KMH Convention Hall, Sree, Doddaballapura, Karnataka 561203 | [PAGE-READ] https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Bbq-Junction/store/1835603 ("✓ Verified listing"); [SNIPPET] JD "Next Green Valley Layout Near Kmh Convention Hall" (https://www.justdial.com/Bangalore/Bbq-Junction-Next-Green-Valley-Layout-Near-Kmh-Convention-Hall-Doddaballapur/080PXX80-XX80-240711140029-M9W5_BZDET) |
| phone | +91 99450 71428 | [PAGE-READ] magicpin ("✓ Verified listing") |
| hours | **CONFLICT — not reconciled:** magicpin window "11:30 AM – 2:00 PM"; JD snippet "Monday:- Closed, Tuesday:- 5:30 pm - 10:00 pm"; IG reel caption "Opens Evening 6:30PM to 9:30 PM" (https://www.instagram.com/p/DUk4vPfExpO). Suggest leaving `opening_hours` blank with all three claims noted. | [PAGE-READ] magicpin; [SNIPPET] JD + IG |
| cuisine / menu_notes | BBQ/tandoori character: IG reel caption "We use Only Cold Pressed Groundnut Oil. We have tandoori, milkshakes, boba shakes"; magicpin site field "www.aaharnava.com" | [SNIPPET] IG; [PAGE-READ] magicpin |
| price_level | ₹500 for two | [PAGE-READ] magicpin |
| listing_rating / review_count | **4.7 / 14** (magicpin). JD rating snippets **conflict across pages** (4.9/26 on listing snippet, 5.0/25 on photos snippet, 4.7 on reviews snippet) — left unrecorded per the conflict rule. | [PAGE-READ] magicpin; rating_source_url = magicpin URL; rating_checked_on = 2026-10-10 |
| coordinates | **13.285751, 77.5311807** — derivation: **magicpin JSON-LD geo** | [PAGE-READ] magicpin |

**Zone check:** Sri Kongadiyappa College Rd / Green Valley Layout is Doddaballapura town-side (zone 2, loosely; corridor-adjacent). No overlap with existing records (SS Hyderabadi Biriyani Zone is a different name/phone/concept).

**Proposed decision: `distinct_new_business`** — verified magicpin listing with unique phone; hours conflict is a field-level gap, not an identity problem. Evidence quality: page-read.

---

## 8. Shawarma Cartel (Doddaballapura)

| Field | Value | Evidence |
| --- | --- | --- |
| name | Shawarma Cartel | [PAGE-READ] magicpin |
| address | **CONFLICT — not reconciled:** magicpin: "Ground Floor, Market Road, Doddaballapura Locality…" vs JD: "Hemavathipet 2nd Cross St, Doddaballapura… 561203" (https://www.justdial.com/Bangalore/Shawarma-Cartel/080PXX80-XX80-251009142154-T4G9_BZDET) vs IG bio claiming "3rd branch… Doddaballapura Main Road" (https://www.instagram.com/shawarma_cartel_) | [PAGE-READ] https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Shawarma-Cartel/store/17934a0 ; [SNIPPET] JD + IG |
| phone | +91 80955 62868 | [PAGE-READ] magicpin ("✓ Verified listing") |
| hours | 15:30-22:30 (magicpin "3:30 PM – 10:30 PM") | [PAGE-READ] magicpin |
| cuisine / menu_notes | Fast food / shawarma; FavHiker snippet lists Google menu family (existence only); Zomato existence-ref https://www.zomato.com/doddaballapura/shawarma-cartel-2-doddaballapura-locality/order | [PAGE-READ] magicpin ("₹400 for two"); [SNIPPET] |
| price_level | ₹400 for two | [PAGE-READ] magicpin |
| listing_rating / review_count | **4.1 / 251** (magicpin). Separately, FavHiker displays **Google 4.8 (35 reviews)** and JD snippet shows "average rating of 4.8" over "35 Reviews" — recorded as separate external values, not merged. | [PAGE-READ] magicpin; [SNIPPET] https://www.favhiker.com/city/bengaluru-553/restaurants/shawarma-cartel-bengaluru-6a79b6de9af0c144e8de75a2 |
| coordinates | **13.2934035, 77.5414015** — derivation: **magicpin JSON-LD geo** | [PAGE-READ] magicpin |
| Other | YouTube opening-day vlog exists: https://www.youtube.com/watch?v=pUhoZP4FWzw [SNIPPET]; plus code "7GVR+9H9, Hemavathipet 2nd Cross St" published by FavHiker [SNIPPET] — recorded as published plus-code string, **not** converted to coordinates. | |

**Uncertainty:** multi-branch claim (IG "3rd branch… officially OPEN") + three different streets across sources. Which shop is *the* Doddaballapura candidate (Market Rd vs Hemavathipet vs Main Rd) is unresolved remotely. Pin points north of town center (Main Rd corridor direction) — unverified.

**Proposed decision: `needs_more_research`** — strong listings exist (verified magicpin + JD), but the street-level address conflict and multi-branch claim must be settled (one phone call) before any identity/row work. Evidence quality: page-read.

---

## 9. Rajashree Veg & Non-Veg (Doddaballapura) — listing identity: "Rajashree Veg And Non-Veg Family Restaurant"

| Field | Value | Evidence |
| --- | --- | --- |
| name | Rajashree Veg And Non-Veg Family Restaurant | [PAGE-READ] district.in |
| address | Survey 142/5A, D Cross, Ward 3, Doddaballapura Locality, Doddaballapura | [PAGE-READ] https://www.district.in/dining/doddaballapura/rajashree-veg-and-non-veg-family-restaurant-doddaballapura-locality ; independently corroborated [PAGE-READ] Snapchat place https://www.snapchat.com/place/rajashree-veg-and-nonveg-family-restaurant/fdbc9caa-5eb8-11ef-bce0-8b9bc6cb1ad7 (identical address) |
| phone | **Two different numbers published — both recorded, not reconciled:** district JSON-LD +919030376363; Snapchat "Call 098859 97294". (A related brand "Rajashree Comforts" FB page shows 94493 38484 / 89711 30482 — https://www.facebook.com/people/Rajashree-Comforts/61586372615914 [SNIPPET] — possibly the delivery arm; Swiggy lists Rajashree Comforts at Muthsandra [existence-ref].) | [PAGE-READ] district.in + Snapchat |
| hours | **CONFLICT — not reconciled:** district JSON-LD 12:30-22:30 ×7 days vs Snapchat "Monday - Sunday 07:15 - 22:00" | [PAGE-READ] both |
| cuisine | North Indian, Chinese (district JSON-LD `servesCuisine`) | [PAGE-READ] district.in |
| menu_notes | district menu tab exists ("Updated 2 years ago", 1 page — content not readable); magicpin store + menu page: https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Rajashree-Veg-And-Non-veg-Family-Restaurant/store/16b6837/menu [SNIPPET: "Mughlai…"] | |
| price_level | ₹750 for two | [PAGE-READ] district.in |
| listing_rating / review_count | district displays 0.0 (no-review default) — no meaningful count. Snapchat shows "22 ratings" with no average displayed. **No rating recorded.** | [PAGE-READ] both |
| coordinates | **13.301893, 77.55085** — derivation: **district.in JSON-LD geo** | [PAGE-READ] district.in |
| Zomato | existence-reference only: https://www.zomato.com/doddaballapura/rajashree-veg-and-non-veg-family-restaurant-doddaballapura-locality/order | [SNIPPET] |

**Uncertainty:** phone disagreement (two numbers for one address); hours conflict; district pin sits ~2 km north of the town core — recorded as published, flagged for the reviewer's pin-check list; "Rajashree Comforts" relationship (same family? delivery brand?) unresolved.

**Proposed decision: `distinct_new_business`** — address corroborated by two page-read sources; name/address unlike every existing record. Phone/hours conflicts are field gaps for a one-call fix. Evidence quality: page-read ×2.

---

## 10. Maha Naati Ruchi (Doddaballapura)

| Field | Value | Evidence |
| --- | --- | --- |
| name | Maha Naati Ruchi | [PAGE-READ] district.in |
| address | Vinayakanagara, Rojipura Court Road, Doddaballapura Locality, Doddaballapura | [PAGE-READ] https://www.district.in/dining/doddaballapura/maha-naati-ruchi-3-doddaballapura-locality (JSON-LD); FB page "court road, Dod Ballapur, 561203" [SNIPPET] https://www.facebook.com/mahanaatiruchi agrees; JD snippet instead says "Mallathahalli Doddaballapura" (JD area tag) — https://www.justdial.com/Bangalore/Maha-Naati-Ruchi-Mallathahalli-Doddaballapura/080PXX80-XX80-220313232646-D8Q1_BZDET |
| phone | **+918095788474, +916363286209** (district JSON-LD, two numbers); the second matches FB page-2 "Prop:Sri Kuber -6363286209" (https://www.facebook.com/p/Maha-naati-Ruchi-Hotel-100076263060488 [SNIPPET]) — nice cross-source corroboration | [PAGE-READ] district.in; [SNIPPET] FB |
| hours | 09:00-22:00 — district JSON-LD covers **Tue–Sun only; Monday absent from the spec** (caveat recorded). FB displays "Always open" (not hour evidence). | [PAGE-READ] district.in; [SNIPPET] FB |
| cuisine | North Indian, Indo-Chinese, South Indian, Hyderabadi (district JSON-LD); magicpin reviews-page snippet: "Mughlai, North Indian, Biryani, Chinese, Ice Cream, Street Food" (https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Maha-Naati-Ruchi/store/ca3689/reviews) | [PAGE-READ] + [SNIPPET] |
| menu_notes | district menu tab "Updated a year ago", 3 pages (content not readable) | [PAGE-READ] district.in |
| price_level | ₹1000 for two (district); magicpin snippet "Cost for two: ₹500" — conflict recorded | [PAGE-READ] district.in; [SNIPPET] magicpin |
| listing_rating / review_count | district displays 0.0 (no-review default). JD snippet: "Rated 4.2 based on 546 Customer Reviews" (rating_source_url = JD URL; rating_checked_on = 2026-10-10). IG-popular snippet repeats "Google rating of 4.2" (secondary). Recommended listing_rating: JD 4.2/546 (largest published base), source labeled snippet-only. | [SNIPPET] JD; [PAGE-READ] district.in |
| coordinates | **13.3044077, 77.5425688** — derivation: **district.in JSON-LD geo** | [PAGE-READ] district.in |
| Zomato | existence-reference only: https://www.zomato.com/doddaballapura/maha-naati-ruchi-3-doddaballapura-locality/order | [SNIPPET] |

**Uncertainty:** JD's "Mallathahalli" tag vs Court Road address (JD area tag or second branch — unresolved); Monday hours missing; price conflict.

**Proposed decision: `distinct_new_business`** — page-read district data with a phone corroborated across two sources; unique name/profile vs all existing records. Evidence quality: page-read (+ JD rating snippet).

---

## 11. PALAV RAMU (Doddaballapura) — listing identity: "Palav Ramu Hotel"

| Field | Value | Evidence |
| --- | --- | --- |
| name | Palav Ramu Hotel (candidate's "PALAV RAMU" is the same listing) | [PAGE-READ] Restaurant Guru |
| address | 7GVR+GP3, Doddaballapura, Karnataka 561203 (plus code published **as the address** by RG and magicpin); IG-popular snippet: "located near the Doddaballapur bus [stand]" | [PAGE-READ] https://restaurant-guru.in/PALAV-RAMU-HOTEL-Doddaballapura ; [SNIPPET] https://www.instagram.com/popular/palav-ramu-hotel/?hl=en ; magicpin store https://magicpin.in/Bangalore/Doddaballapur/Hotel/Palav-Ramu-Hotel/store/131c5ba [SNIPPET: "Address. 7Gvr+…"] |
| phone | not captured (no phone on RG page; none in snippets) | — |
| hours | 12:00-22:00 ×7 days (RG "Sunday…Saturday 12PM-10PM"; "Closes soon: 10PM") | [PAGE-READ] RG |
| cuisine / menu_notes | palav specialty, "over 54 years" (IG-popular snippet); RG food tags "vada fritters rice", features "Takeaway"; visitor review snippet "Don't miss Pulav, Vada & Poori"; YouTube short: "Location: Doddaballapura bus stand… ₹20/- vada" (https://www.youtube.com/shorts/kyRPIkQiBhY) | [PAGE-READ] RG; [SNIPPET] IG/YT |
| price_level | RG "Price range per person INR 1 - INR 200" → band ₹ | [PAGE-READ] RG |
| listing_rating / review_count | **Google 3.9 / 97** as displayed by RG ("Ratings of PALAV RAMU HOTEL — Google (3.9/5) 97"; "73" RG visitor reviews shown separately). JD snippet separately: "Rated 4.0 based on 95 Customer Reviews" (https://www.justdial.com/Bangalore/Palav-Ramu-Hotel-Doddaballapur/080PXX80-XX80-230624201123-A3F1_BZDET); Explurger snippet "Rated 3.9 of 5 by 53 Users". Recommended: RG-displayed Google 3.9/97 with rating_source_url = RG URL; rating_checked_on = 2026-10-10. | [PAGE-READ] RG; [SNIPPET] JD/Explurger |
| coordinates | **not captured** — RG embeds an OSM map but published no numeric geo; the plus code 7GVR+GP3 is recorded as a published string, not converted. | — |

**Zone check:** Doddaballapura bus-stand area = town proper (zone 2). No overlap with existing records.

**Proposed decision: `distinct_new_business`** — iconic local palav house with multi-source ratings and a stable identity; missing phone is the only gap. Evidence quality: page-read.

---

## 12. Udupi Upahar (Doddaballapura)

| Field | Value | Evidence |
| --- | --- | --- |
| What exists | A **family of same-name listings**, not one clean candidate: (1) magicpin "Udupi Upahar" — verified, phone +919845186664, address "JP VYBHAV PARTY HALL & LODGING, Kasaba Police Station Road, Doddaballapur - 561203 / 6/16, Muthasandra…", hours shown as "11:30 AM – 2:00 PM", ₹500 for two, rating **4.2 / 9**, geo **13.3071176, 77.5375286** (magicpin JSON-LD) [PAGE-READ] https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Udupi-Upahar/store/1833086 ; (2) JD "Udupi Uahar" https://www.justdial.com/Bangalore/Udupi-Uahar-Doddaballapur/080PXX80-XX80-221122230323-P8Y7_BZDET [SNIPPET] ; (3) JD "Hotel New Udupi Uphar" — hours "6:00 am - 3:00 pm, Sunday 6:00 am - 1:00 pm" https://www.justdial.com/Bangalore/Hotel-New-Udupi-Uphar-Doddaballapur/080PXX80-XX80-230323001748-Q9J5_BZDET [SNIPPET] ; (4) Zomato "Udupi Upahara, Doddaballapura Locality" — existence-ref only, search snippet displays a "temporarily closed" banner (signal noted, no data copied) https://www.zomato.com/doddaballapura/udupi-upahara-doddaballapura-locality/order [SNIPPET] ; (5) out-of-zone namesake "Udupi Upahara", Yelahanka (Bengaluru) — https://www.district.in/dining/bangalore/udupi-upahara-1-yelahanka-bangalore [SNIPPET] — **not** the candidate. |
| Proposed worksheet fields | If promoted: name `Udupi Upahar` (magicpin spelling) · category `restaurant` · locality `Kasaba Police Station Road / Muthasandra` · phone `+919845186664` · rating `4.2/9` (magicpin URL) · coordinates `13.3071176, 77.5375286` (magicpin JSON-LD geo) · hours **blank** (magicpin's 11:30-14:00 looks like a lunch window, JD says 6:00-15:00, Zomato banner says temporarily closed — three signals conflict). |

**Proposed decision: `needs_more_research`** — must first establish which of the 3–4 local listings is the business the human means (and whether it still operates, given the Zomato banner). Evidence quality: page-read (one listing) + snippets.

---

## 13. Hasanamba Iyengar Bakery (Doddaballapura)

| Field | Value | Evidence |
| --- | --- | --- |
| What exists | **No directory listing found for a Doddaballapura "Hasanamba Iyengar Bakery"** in this round's search. The only in-zone signal is an Instagram reel naming it with a locality: "Hasanamba Iyengar Bakery **Jalappa college rd**, Doddaballapura #oldbakery #hiddengem #puff #dilpasand #honeycake" — https://www.instagram.com/reel/DDyZ28MPkOn/?hl=en [SNIPPET]. Same-name family elsewhere (not candidates): JD Madavara https://www.justdial.com/Bangalore/Hasanamba-Iyengar-Bakery-Sweets-Madavara/080PXX80-XX80-200703022135-K6L4_BZDET [SNIPPET]; "New Hasan Iyengar Bakery And Sweets", Kadnur Mara Circle (StoreKing) https://storeking.in/8861492393 [SNIPPET]; "Hassan Iyengar Bakery" hassanib.com (different brand, 562106) [SNIPPET]. |
| Proposed worksheet fields | If promoted: name `Hasanamba Iyengar Bakery` · category `bakery_sweets` · locality `Jalappa College Road` · everything else **not captured**. |

**Proposed decision: `needs_more_research`** — real, locally-famous per IG, but no listing/phone/rating anywhere yet; needs an on-site pass or a JD/Maps lookup on Jalappa College Rd. Evidence quality: snippet-only.

---

## 14. Durgashree Samruddhi Grand (Doddaballapura)

| Field | Value | Evidence |
| --- | --- | --- |
| What exists | A **name family**: (1) **"Durgashree Samruddhi Grand Veg"** — magicpin verified listing, rating **3.9 / 868**, "Since 2018", ₹500 for two, phone +919148101848, address "Muthasandra, Karnataka 561203", hours shown "11:30 AM – 2:00 PM", geo **13.3091042, 77.5379518** (magicpin JSON-LD) [PAGE-READ] https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Durgashree-Samruddhi-Grand-Veg/store/1836915 ; (2) **Maps place URL (rule-4-compliant)** expanded this session from the short link published in a YouTube video description: canonical `https://www.google.com/maps/place/Durgashree+Samruddhi+Grand+Veg/@13.3091042,77.5353769,17z/data=!3m1!4b1!4m6!3m5!1s0x3bb1de6b5c3814af:0xb198b1f7b3d9867b!8m2!3d13.3091042!4d77.5379518!16s%2Fg%2F11fzvms4ld` — marker coordinates 13.3091042, 77.5379518 (identical to magicpin JSON-LD); no place-page content readable. Source short link: https://maps.app.goo.gl/SZYBHyziuhBiP3KJA via https://www.youtube.com/watch?v=WPJEnL0c-GM [PAGE-READ of the expanded payload]. (3) JD "Durgashree Samruddhi **Grand**" — "near Kasaba Police Station" https://www.justdial.com/Bangalore/Durgashree-Samruddhi-Grand-Kasaba-Police-Station-Doddaballapur/080PXX80-XX80-180323184113-P4X4_BZDET [SNIPPET]; (4) "Durgashree Samruddhi **Garden**" — JD https://www.justdial.com/Bangalore/Hotel-Durgashree-Samruddhi-Garden-Doddaballapur/080PXX80-XX80-220920214522-V5H7_BZDET [SNIPPET] + district.in "Bengaluru Hindupur Road, Opposite Town Police Station… ₹650 for two… Opens 7:00 AM" https://www.district.in/dining/doddaballapura/durgashree-samruddhi-garden-1-doddaballapura-locality [SNIPPET] + Zomato existence-ref …/durgashree-samruddhi-garden-1… [SNIPPET]; (5) Wikimapia: "vegetarian restaurant… NH 207 (Dabaspet - Doddaballapur - Devanahalli - Hoskote Road)" http://wikimapia.org/38968298/Durgashree-Samruddhi-Grand [SNIPPET]; IG @samruddhigrand_db_pur "Samrudhi Grand Veg Pure Veg Restaurant Doddaballapur" [SNIPPET]. YouTube description also publishes plus code **8G5Q+J5W** [SNIPPET — recorded as string, not converted]. |
| Read | The candidate name as queued ("Durgashree Samruddhi Grand") matches the JD "Grand" listing (Kasaba Police Station) and the magicpin/Maps "Grand Veg" (Muthasandra). Grand-vs-Garden identity and the Kasaba-Police-Station vs Muthasandra address split are unresolved. |
| Proposed worksheet fields | If promoted (for the "Grand Veg" entity, the best-evidenced): name `Durgashree Samruddhi Grand Veg` · category `restaurant` · locality `Muthasandra` · phone `+919148101848` · hours **blank** (lunch-window display conflict) · price_level `₹` · rating `3.9/868` (magicpin URL) · coordinates `13.3091042, 77.5379518` (magicpin JSON-LD geo; Maps place-URL marker agrees) · maps_listing_url = the canonical place URL above (first rule-4-compliant Maps URL captured in the project) · zone: Muthasandra sits on the Main-Rd corridor north of town (toward Nagadenahalli) — reviewer to confirm fit. |

**Proposed decision: `needs_more_research`** — genuinely strong listings (verified magicpin + a real Maps place URL), but the human must first say which family member ("Grand" town / "Grand Veg" Muthasandra / "Garden") the candidate means. Evidence quality: page-read + Maps place URL + snippets.

---

## 15. Desi Family Dhaba (Doddaballapura) — "Desi Family Dhaba And Restaurant"

| Field | Value | Evidence |
| --- | --- | --- |
| name | Desi Family Dhaba And Restaurant | [SNIPPET] JD |
| address / locality | "Near Gitam University Nagadenahalli" / "Doddaballapura Main Road Nagadenahalii" | [SNIPPET] https://www.justdial.com/Bangalore/Desi-Family-Dhaba-And-Restaurant-Near-Gitam-University-Nagadenahalli-Nagadenahalii/080PXX80-XX80-251105213416-R8X7_BZDET (JD listing id created 2025-11-05 → **new 2025 listing**); JD category page https://www.justdial.com/Bangalore/Dhaba-Restaurants-in-Kodigehalli-Doddaballapura/nct-10158813 shows "Doddaballapura Main Road Nagadenahalii - 9.63 km … ₹ 1000 Price for two" [SNIPPET] |
| phone | not captured | — |
| hours | not captured ("Opens in 3 mins" badge only — not hour evidence per WORKFLOW) | — |
| price_level | ₹1000 for two (JD category-page snippet) | [SNIPPET] |
| listing_rating / review_count | **JD snippets conflict (5.0/11 on category page vs 4.8/12 on photos page https://www.justdial.com/…R8X7_BZDET/photos)** → rating left unrecorded per conflict rule. | [SNIPPET] ×2 |
| coordinates | not captured | — |

**Zone check:** squarely in zone 1 (GITAM gate / Nagadenahalli) — the highest-value in-zone discovery of the round. JD page body anti-bot blocked → snippet-only round-trip; no second independent directory surfaced.

**Proposed decision: `needs_more_research`** — in-zone and promising, but evidence is snippet-only with a JD rating conflict and no phone; needs a second source (page-read attempt on a different directory, or phone/Maps work). Evidence quality: snippet-only.

---

## 16. Diamond Zoop Cafe (Doddaballapura) — listing identity: "Zoop Cafe"

| Field | Value | Evidence |
| --- | --- | --- |
| name | **"Zoop Cafe" — the "Diamond" prefix was not found on any source this session** (district page, JD snippet, Zomato slug, magicpin). Either the queued name is a misremember or "Diamond Zoop Cafe" is an unlisted separate shop. | [PAGE-READ] district.in |
| address | Abhi Nivas, Near Anand Comfort, Jalappa College Road, Doddaballapura Locality, Doddaballapura | [PAGE-READ] https://www.district.in/dining/doddaballapura/zoop-cafe-doddaballapura-locality (JSON-LD) |
| phone | +91 70269 11121 | [PAGE-READ] district.in JSON-LD |
| hours | JSON-LD publishes **only Sunday 11:00-21:30** (incomplete spec); page status line observed "Closed • Opens on 11 Oct" (temporary-closure signal, recorded verbatim with date) | [PAGE-READ] district.in |
| cuisine | Street Food, American, Continental (JSON-LD `servesCuisine`) | [PAGE-READ] district.in |
| price_level | ₹300 for two | [PAGE-READ] district.in |
| listing_rating / review_count | district displays "0.0 … Based on 1 rating" — no meaningful rating recorded | [PAGE-READ] district.in |
| coordinates | **13.2999467004, 77.5283644348** — derivation: **district.in JSON-LD geo** | [PAGE-READ] district.in |
| Other listings | JD https://www.justdial.com/Bangalore/Zoop-Cafe-Doddaballapur/080PXX80-XX80-230615001215-K1U3_BZDET [SNIPPET]; magicpin https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Zoop-Cafe/store/163b9c7 [SNIPPET]; Zomato existence-ref https://www.zomato.com/doddaballapura/zoop-cafe-doddaballapura-locality/order [SNIPPET]; out-of-zone namesake at Dobbaspet/Sompura 562111 (IG https://www.instagram.com/zoop_cafe_dabaspetea + FavHiker 4.1/43) [SNIPPET] — **not** the candidate. |

**Proposed decision: `needs_more_research`** — a real "Zoop Cafe" exists on Jalappa College Rd with solid page-read data, but the queued name "Diamond Zoop Cafe" does not match anything found; the human must confirm the intended identity before any row is created. Evidence quality: page-read.

---

## 17. Five Star Kohli Hut (Doddaballapura)

| Field | Value | Evidence |
| --- | --- | --- |
| name | Five Star Kohli Hut (exact-name match on magicpin) | [PAGE-READ] magicpin |
| address | Ward 3, Near Indian Petrol Bunk, Scout Camp, Doddaballapura Locality, Doddaballapura, Doddaballapur, Bangalore | [PAGE-READ] https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Five-Star-Kohli-Hut/store/1644707 ("✓ Verified listing") — Scout Camp = zone 2 |
| phone | +91 63636 93426 | [PAGE-READ] magicpin ("✓ Verified listing") |
| hours | 11:00-20:00 (magicpin "11:00 AM – 8:00 PM") | [PAGE-READ] magicpin |
| cuisine | Fast Food | [PAGE-READ] magicpin |
| price_level | ₹450 for two | [PAGE-READ] magicpin |
| listing_rating / review_count | none shown on the magicpin listing — not captured | — |
| coordinates | **13.2796588, 77.5567803** — derivation: **magicpin JSON-LD geo** | [PAGE-READ] magicpin |
| Brand-family context | "Five Star Chicken - Koli Hut" JD listing at Basettihalli (Near Indian Overseas Bank) https://www.justdial.com/Bangalore/Five-Star-Chicken-Koli-Hut-Near-Indian-Overseas-Bank-Basettihalli/080PXX80-XX80-220331210423-M8M6_BZDET [SNIPPET]; "Five Star Chicken" JD (Mallathahalli Doddaballapura, Opp. Old Bus Stop, 4.0/407) [SNIPPET]; national brand fivestarchicken.com [SNIPPET]; Zomato existence-ref https://www.zomato.com/doddaballapura/five-star-chicken-koli-hut-doddaballapura-locality/order [SNIPPET]. Whether magicpin "Five Star Kohli Hut" and JD "Five Star Chicken - Koli Hut" (Basettihalli) are the same outlet or two franchise listings is **unresolved**. |

**Proposed decision: `needs_more_research`** — an exact-name verified listing with phone/hours/coordinates exists and is unlike every existing record, but the relationship to the JD "Five Star Chicken - Koli Hut" (Basettihalli) listing and the brand naming must be settled first (one call; note the existing-DB has no conflict). Evidence quality: page-read.

---

## 18. Discovery observations (2025-2026 openings, GITAM/Nagadenahalli + town) — recorded as leads only

From the two discovery searches (`restaurants near GITAM University Bengaluru Doddaballapura main road 2026 new`; `new cafe Nagadenahalli Doddaballapura opened 2025`). No worksheet rows created (same practice as Phase 3F's queue note); each is snippet-only until researched.

| Lead | Evidence (all [SNIPPET]) | Zone fit |
| --- | --- | --- |
| **Zen Cafe** — Nagadenahalli; JD listing id `080PXX80-XX80-250908192353-F2N7` created **2025-09-08** ("Coffee Shops in Nagadenahalii") | https://www.justdial.com/Bangalore/Zen-Cafe-Nagadenahalii/080PXX80-XX80-250908192353-F2N7_BZDET | **In zone 1** — strongest new-opening lead |
| **Rajputana Restaurant** — "in Kundanahalli… 648, Nagandenahalli, Bashettihalli, Karnataka" (NH-648 = Doddaballapura Main Rd) | https://www.instagram.com/reel/DIWNciBvmI4 | In/near zone 1 corridor |
| **Ananya Vana** — "upcoming garden-style restaurant set to open in early July 2026, veg and non-veg + event space" | https://www.instagram.com/popular/doddaballapura-restaurants | Doddaballapura area; exact site unknown |
| **MR3519 Family Restaurant** — "GRAND OPENING TODAY!" (#doddaballapura), no location in snippet | https://www.instagram.com/p/DcfwIbyRxT5 | Unknown |
| **Sri Matha Sagar** — multicuisine, Doddaballapur (JD category-page mention) | https://www.justdial.com/Bangalore/Multicuisine-Restaurants-in-Doddaballapur/nct-10332161 | Town (zone 2) |
| **Sarangi Fine Dine Restaurant** — Tripadvisor listing, 0 reviews | https://www.tripadvisor.com/Restaurants-g1675597-Doddaballapur_Bangalore_Rural_District_Karnataka.html | Town (zone 2) |
| **Darbar The Cafe** — "Near Muthyalamma Temple, Doddaballapur Bazaar", hours snippet "10:00 am - 10:00 pm" | https://www.justdial.com/Bangalore/Darbar-The-Cafe-Near-Muthyalamma-Temple-Doddaballapur-Bazaar/080PXX80-XX80-240306184639-J3Y6_BZDET/photos | Town (zone 2) |
| **Nippat Masale Stall** — fast-food, appears in Snapchat's "You May Also Like" beside Rajashree | https://www.snapchat.com/place/rajashree-veg-and-nonveg-family-restaurant/fdbc9caa-5eb8-11ef-bce0-8b9bc6cb1ad7 | Unknown |
| EazyDiner "Doddaballapura Main Road, North Bengaluru" names (Trippy Goat, Nysa Sky Bar, Chin Lung Resto Bar, F5, The Pizza Bakery) | https://www.eazydiner.com/restaurants?location=doddaballapura-main-road | **Zone fit doubtful** — that EazyDiner label covers the airport-side stretch; not researched further |

---

## 19. Final summary table

| # | Candidate | Evidence quality | Coordinates (bucket-6) | Proposed decision (one line) |
| --- | --- | --- | --- | --- |
| 1 | Abhis Food Court | **page-read ×2** (magicpin verified + district JSON-LD) | 13.2798556, 77.5561673 | **distinct_new_business** — unique verified phone/address on Scout Camp Rd; three sources agree on hours; price conflict + Abhiram adjacency noted |
| 2 | La Reserve Lounge ("Lounge de La Réserve") | page-read ×2 | 13.286726, 77.5824616 | **do_not_import** — located Raghunathapura, Devanahalli Rd (near Grover Zampa): outside both agreed zones; human may override |
| 3 | Burger Time | page-read | 13.291965, 77.542015 | **distinct_new_business** — unique phone (IG-corroborated), town-proper address, hours agree across two sources |
| 4 | Bbq Junction | page-read | 13.285751, 77.5311807 | **distinct_new_business** — verified magicpin listing w/ phone; hours conflict left blank |
| 5 | Shawarma Cartel | page-read (+JD/FavHiker snippets) | 13.2934035, 77.5414015 | **needs_more_research** — Market Rd vs Hemavathipet vs "3rd branch Main Rd" conflict must be settled |
| 6 | Rajashree Veg & Non-Veg | page-read ×2 | 13.301893, 77.55085 | **distinct_new_business** — address corroborated by two page-read sources; two published phones + hours conflict noted |
| 7 | Maha Naati Ruchi | page-read (+JD 4.2/546 snippet) | 13.3044077, 77.5425688 | **distinct_new_business** — Court Rd address, phone corroborated by FB; JD "Mallathahalli" tag + Monday-hours gap noted |
| 8 | PALAV RAMU ("Palav Ramu Hotel") | page-read | not captured (plus code 7GVR+GP3 as string) | **distinct_new_business** — 54-year bus-stand palav house; Google 3.9/97 via RG; phone missing |
| 9 | Udupi Upahar | page-read (1 listing) + snippets | 13.3071176, 77.5375286 (magicpin listing) | **needs_more_research** — 3–4 same-name local listings + Zomato temp-closed banner; identity of "the" candidate unclear |
| 10 | Hasanamba Iyengar Bakery | snippet-only | — | **needs_more_research** — IG reel only (Jalappa College Rd); no listing/phone found |
| 11 | Durgashree Samruddhi Grand | page-read + Maps place URL + snippets | 13.3091042, 77.5379518 (Grand Veg, Muthasandra) | **needs_more_research** — Grand/Garden family + Kasaba-Police-Stn vs Muthasandra split; Maps place URL captured (project first) |
| 12 | Desi Family Dhaba | snippet-only | — | **needs_more_research** — in-zone (GITAM/Nagadenahalli) 2025 JD listing; rating conflict; no phone; needs 2nd source |
| 13 | Diamond Zoop Cafe | page-read | 13.2999467004, 77.5283644348 | **needs_more_research** — "Zoop Cafe" verified on Jalappa College Rd but "Diamond" prefix found nowhere; identity intent to confirm |
| 14 | Five Star Kohli Hut | page-read | 13.2796588, 77.5567803 | **needs_more_research** — exact-name verified listing exists; resolve vs JD "Five Star Chicken - Koli Hut" (Basettihalli) and brand naming |

Roll-up: **6 distinct_new_business** (1, 3, 4, 6, 7, 8) · **7 needs_more_research** (5, 9, 10, 11, 12, 13, 14) · **1 do_not_import** (2, out-of-zone) · **0 possible_duplicate_hold** · **0 existing_match**.

## 20. Statement of non-interference

**Nothing was imported.** No Supabase/database access of any kind was made this round (no reads, no writes, no baseline refresh). No app source (`src/`), schema, migration, worksheet CSV, or validator code was touched. The only files created are this report and the appended worklog entry. Raw CLI outputs live in `/tmp/phase3h/` and are not committed. No Zomato/Swiggy data was copied (existence-references only); Google Maps was not searched or scraped; no credentials or secrets were accessed or printed; every recorded value traces to a URL actually read this session, and every unknown remains explicitly "not captured".

*STOP — this is an evidence report for human review. Per WORKFLOW.md, no import preparation may proceed from it without explicit human approval.*
