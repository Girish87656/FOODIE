# Foodie — Phase 3E Human Review (row-by-row evidence review)

**Review date:** 2026-10-09 · **Reviewer:** automated assistant (evidence review only; no new research, no on-site checks, no calls)
**Inputs reviewed (all Phase 3D artifacts, read in full):**
`research-2026-10-09.dry-run.md` (+ `.json`) · `phase3d-research-log.md` · `phase3d-matches-and-duplicates.md` · `phase3d-new-candidates.md` · `phase3d-missing-data-uncertainty.md` · `input/research-worksheet-phase3d.csv` (31 rows) · `fixtures/baseline-snapshot.json` (14 existing restaurants, fetched 2026-10-09T14:23Z)

**Status of this document:** review and recommendations ONLY. Nothing was imported, no SQL was written, no app code / schema / live Supabase data was touched, nothing committed.

---

## 0. Verdict summary

| Recommended decision | Rows | Count |
| --- | --- | ---: |
| `ready_for_human_approval` | 2, 4, 8, 12, 14, 15, 17, 20 | 8 |
| `needs_more_research` | 3, 7, 11, 13, 16, 18, 19, 22, 25, 26, 27, 28, 29, 30, 31 | 15 |
| `possible_duplicate_hold` | 1, 6, 9, 21, 23, 24 | 6 |
| `do_not_import` | 5, 10 | 2 |
| **Total reviewed** | | **31** |

Key messages for the human reviewer:

1. **Nothing is "Google Maps verified".** Exactly one row (9) carries a real Google Maps place-page URL (a public short link). Every other Maps-related artefact in the record is a search link, a snippet, or a different directory. See `phase3e-maps-evidence-gaps.md`.
2. **Every row is `evidence_level=directory_reported`.** No visit, call, or on-site GPS exists anywhere in the record; zero rows have independently confirmed coordinates.
3. **`ready_for_human_approval` ≠ verified.** It means: identity and distinctness-vs-existing are supported by ≥2 corroborating directory sources with distinct address and/or phone, core fields are present, and no unresolved conflict blocks a human decision. Any future import would still enter the database as `unverified`.
4. All 31 rows were re-checked against the recorded evidence and against the 14 existing records (Section 5). No Phase 3D decision was found to rest on unsupported claims; one **new** spelling-variant risk was found (row 26 Amrutha Food Court ↔ existing Abhiram Food Court) and is flagged.

---

## 1. Evidence tiers used in this review (explicit distinctions)

| Tier | Meaning | Rows that have it |
| --- | --- | --- |
| **T1 — Google Maps place-page evidence** | An actual Google Maps place page was accessed (never a `/maps/search/` URL, never a snippet) | **Row 9 only** (public short link → place "Vaibhava Sweets&Chats", CID `0x3bb1e1fef9f204d5:0xcbcea14369c0d063`) |
| **T2 — Other directory evidence** | Listing pages or listing snippets from Justdial, magicpin, district.in, Restaurant Guru, Mappls, Snapchat Places, Yandex, OneFiveNine, TripAdvisor, chotu, beyondyatra; existence-only references to Zomato/Swiggy (no proprietary data copied) | All 31 rows |
| **T3 — Directory-reported coordinates** | A pin derived from a Maps place marker, a Mappls page payload, or a decoded plus code published by a directory — **candidate pins only, never proof** | Rows 9 (Maps marker), 15 (plus-code decode), 20 (Mappls payload) |
| **T4 — Independently confirmed coordinates** | On-site GPS / field verification against the exact business | **NONE (0 of 31)** |
| **T5 — Missing or conflicting information** | Fields deliberately left blank (blank = unknown) or recorded conflicts between sources | Documented per row below |

Standing rule (Phase 3E objective 5): **a search link, a directory, or a snippet is never counted as Google Maps place-page evidence.** No claim of Maps verification exists or is made anywhere in this review.

---

## 2. Master review table — the 27 potential-new candidates

Compact view. Full source URLs, uncertainty notes and conflicts per row in Section 3. "Rating" is always an **external directory rating** (`listing_rating` + count + source + check date 2026-10-09) — never a Foodie community value.

| Row | Candidate | Category | Locality | Phone | Hours | Ext. rating | Coordinates (tier) | Maps place page | Decision |
| ---: | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 2 | The Shri Cafe and Restaurant | restaurant | Nagadenahalli | +919844929931 | — | — (conflict blanked) | — | — | **ready_for_human_approval** |
| 3 | Garuda Cafe Restaurant | cafe | Adinarayana Hosahalli | — | — | — | — | — | needs_more_research |
| 4 | Epicurus Multi Cuisine Restaurant | restaurant | Nagadenahalli | +919035972563 | — (conflict blanked) | — | — | — | **ready_for_human_approval** |
| 7 | Venture's Hungry Birds | fast_food | Doddaballapur | — | — | — (0 ratings) | — | — | needs_more_research |
| 8 | Lotus Gardenia | restaurant | Nagadenahalli / Near Railway St. | — | — (booking-hours ≠ business) | 4.0 / 2410 (JD) | — | — | **ready_for_human_approval** |
| 9 | Vaibhava Sweets & Chats | bakery_sweets | Raghunathapura | — | — | — | 13.2869155, 77.5747334 (T3, Maps marker) | **YES** (public short link) | possible_duplicate_hold |
| 10 | Appu Chats | fast_food | Tubugere | — | — | — | — | — | **do_not_import** (out of zone) |
| 11 | Iyengar's Cake N Bake | bakery_sweets | Doddaballapur | — | — | 4.0 / 95 (JD) | — | — | needs_more_research |
| 12 | Best Choice Bakery | bakery_sweets | Doddaballapur town | +919980213680 | 10:00–20:00 (conflict noted) | 4.0 / 386 (magicpin) | — | — | **ready_for_human_approval** |
| 13 | Wild Woods BBQ Grill & Chill | restaurant | Bhuvaneswari Nagar | — | — | — | — | — | needs_more_research |
| 14 | Rainbow Huts Family Restaurant | restaurant | Bashettihalli | +918951368020 | — (conflict blanked) | 4.6 / 49 (magicpin) | — | — | **ready_for_human_approval** |
| 15 | Hotel Bindushree Family Restaurant | restaurant | Bashettihalli | — | — (conflict blanked) | 4.2 / 5 (magicpin) | 13.2799, 77.556969 (T3, plus code) | — | **ready_for_human_approval** |
| 16 | Karavali Hotel | hotel | Doddaballapura Railway Station | — | — | — | — | — | needs_more_research |
| 17 | Sri Vinayaka Food Point | restaurant | Doddaballapura Railway Station | +918197052687 | 08:00–21:30 | 4.1 / 4731 (magicpin) | — | — | **ready_for_human_approval** |
| 18 | Hotel Radha | hotel | Govindapura | — | 06:00–21:00 | — (5.0/11 belongs to "New Hotel Radha") | — | — | needs_more_research |
| 19 | Siri Chicken Centre | — (blank: raw-chicken retailer) | Doddaballapura Railway Station | — | — | 4.3 / 3 (JD) | — | — | needs_more_research |
| 20 | Hotel Krishnamoorthy | hotel | Doddaballapura Railway Station | +919742663255 | 10:00–22:00 | 4.3 / 2 (magicpin) | 13.280305, 77.551956 (T3, Mappls) | — | **ready_for_human_approval** |
| 21 | Ganesh Darshan & Chats | fast_food | Doddaballapura Railway Station | — | — | 3.6 / 6 (JD) | — (conflicting plus code → blank) | — | possible_duplicate_hold |
| 22 | Lakshmi Biriyani Point | fast_food | Doddaballapura Railway Station | +919845263318 | — | 4.7 / 10 (JD) | — | — | needs_more_research (closure hold) |
| 23 | Kiran Tiffin Room | tiffin | Kasbhag Road | +919663965135 | — ("no info" per RG) | 4.8 / 78 (RG) | — | — | possible_duplicate_hold |
| 25 | Ss Food Cafe | cafe | Nagadenahalli | — | — | — | — | — | needs_more_research |
| 26 | Amrutha Food Court | restaurant | Nagadenahalli | — | — | — | — | — | needs_more_research |
| 27 | Siri Bucket Biriyani | restaurant | Thammasettihalli | — | — | 3.9 / 17 (JD index) | — | — | needs_more_research |
| 28 | Sanje Time Veg Restaurant & Chaats | restaurant | Kasbhag | — | — | 4.0 / 2 (JD snippet) | — | — | needs_more_research |
| 29 | Hoysala Family Restaurant | restaurant | Doddaballapur | — | — | 4.0 / 331 (JD) | — | — | needs_more_research |
| 30 | Grillland | fast_food | Basettihalli | — | — | — | — | — | needs_more_research |
| 31 | Rajanna Nati Style Biryani | restaurant | Bhuvaneswari Nagar | — | — | — | — | — | needs_more_research |

---

## 3. Per-row evidence cards (27 potential-new candidates)

Fields shown when available; "—" = deliberately blank (unknown). URLs are the primary evidence; exhaustive per-field provenance lives in the worksheet's `*_source_url` columns. **T1/T2/T3/T4/T5 = evidence tiers from Section 1.**

### Group R — `ready_for_human_approval` (8)

**Row 2 — The Shri Cafe and Restaurant** · restaurant · Nagadenahalli
- **T1 Maps:** none. **T2 Directories:** Justdial listing (name + Nagadenahalli area) + Snapchat place page (address + phone) + official Instagram `@theshricafeofficial` — two independent directories agree.
- **Address:** NH 648, Doddaballapur Main Road, Nagadenahalli Village, Doddaballapur Taluk (Snapchat). **Phone:** +919844929931 (Snapchat). **Hours:** — (T5, not captured). **Rating:** — (T5 conflict: JD snippets show "4.5/17" on one page, "5.0/17" on another → blanked).
- **Sources:** `justdial.com/Bangalore/The-Shri-Cafe-And-Restaurant-Nagadenahalii/080PXX80-XX80-251224194043-V6Q3_BZDET` · `snapchat.com/place/the-shri-cafe-and-restaurant/9acd55f3-42e9-460d-abc1-ddeed2eda817`
- **Distinctness:** distinct address + phone vs all 14 existing records; Snapchat's nearby list shows it alongside (not as) GITAM Cafe, Amigos Cafe, Epicurus, SS Hyderabadi, Shri Manjunatha Grand Veg.
- **Why ready:** identity + distinctness proven by two independent directories; no unresolved identity conflict. **Upgrade path:** Maps place page; resolve the JD rating conflict; capture cuisine/hours.

**Row 4 — Epicurus Multi Cuisine Restaurant** · restaurant · Nagadenahalli
- **T1 Maps:** none. **T2 Directories:** district.in (full page) + printed menu on Scribd + Instagram `@epicurus_original` — three independent sources agree on name + area + phone.
- **Address:** Munilakshmamma, Nagadenahalli, Doddaballapura Locality. **Phone:** +919035972563 (district.in + printed menu). **Cuisine:** North Indian, Chinese, Middle-Eastern. **Price:** ₹ (district.in "Rs 300 for two"). **Hours:** — (T5 conflict: district.in 10:00–22:00 vs JD 12:00–23:00 → blanked). **Rating:** — (district.in shows none).
- **Sources:** `district.in/dining/doddaballapura/epicurus-multi-cuisine-restaurant-doddaballapura-locality` · Scribd printed menu · Instagram.
- **T5 note:** a JD listing files "Epicurus Multi Cuisine Restaurant" under Adinarayana Hosahalli; the phone is tied to Nagadenahalli by two sources → likely a JD mis-location/double-listing, unresolved but non-blocking.
- **Why ready:** three independent sources; distinct address + phone vs all 14 existing.

**Row 8 — Lotus Gardenia** · restaurant (JD profile: restaurant + bar + rooms, incl. "Home Stay" category) · Nagadenahalli / Near Railway Station (both JD tags recorded)
- **T1 Maps:** none. **T2 Directories:** Justdial (4.0/2410 all-time, search snippet) + TripAdvisor nearby-restaurant mention.
- **Address:** Opposite Indian Oil Petrol Bunk, Near Railway Station, Doddaballapur (JD slug). **Phone:** —. **Hours:** — (T5: JD's "9:00 AM–8:00 PM" is booking hours, not business hours → blanked). **Rating:** 4.0/2410 (JD, checked 2026-10-09). **Cuisine:** — (TripAdvisor hint "Chinese", low confidence → blank).
- **Sources:** `justdial.com/Bangalore/Lotus-Gardenia-Restaurants-Bar-Rooms-Opposite-Indian-Oil-Petrol-BunkNear-Railway-Station-Doddaballapur/080PXX80-XX80-210421154401-X4L9_BZDET` · TripAdvisor mention.
- **Why ready:** huge rating base, slug-address, second-directory existence; distinct name/address/profile vs all 14 existing. **Caveats for the approver:** bar+rooms mixed profile (scope call); no phone; T5 area-tag disagreement recorded verbatim.

**Row 12 — Best Choice Bakery** · bakery_sweets · Doddaballapur town (D Cross Rd — same street as existing Priyanka Tiffen Center, different business)
- **T1 Maps:** none. **T2 Directories:** magicpin verified listing + Justdial (4.0/398) + Restaurant Guru (3.5/393).
- **Address:** D Cross Rd, Doddaballapur (magicpin). **Phone:** +919980213680 (magicpin verified). **Hours:** 10:00–20:00 (magicpin; T5 conflict with an Instagram claim of 9:00–22:00 — stronger source kept, conflict noted). **Rating:** 4.0/386 (magicpin, checked 2026-10-09). **Price:** ₹ (magicpin "Rs 500 for two"). **Menu:** bakery items, cakes, snacks; "Since 2011".
- **Sources:** `magicpin.in/Bangalore/Doddaballapur/Restaurant/Best-Choice-Bakery/store/922554` · `justdial.com/Bangalore/Best-Choice-Bakery-Near-By-Aiyapa-Swami-Temple-Doddaballapur/080PXX80-XX80-170928162846-B6G9_BZDET` · `restaurant-guru.in/Best-Choice-Bakery-Doddaballapura`
- **Why ready:** verified-listing phone, three rating bases (386/398/393), distinct address+phone vs all 14 existing.

**Row 14 — Rainbow Huts Family Restaurant** · restaurant · Bashettihalli (near NS Convention Hall — Scout Camp Road side, zone 2)
- **T1 Maps:** none. **T2 Directories:** magicpin verified listing + Justdial (4.4) + Zomato existence reference only (no data copied).
- **Address:** Doddaballapur, Bashettihalli (magicpin). **Phone:** +918951368020 (magicpin verified). **Hours:** — (T5: magicpin "11:30 AM–2:00 PM" looks like a lunch window, Zomato card says opens 12:15 → blanked). **Rating:** 4.6/49 (magicpin; T5 spread: 4.6/49 vs JD 4.4 vs Zomato 3.2). **Menu note:** party hall for 20+ (magicpin).
- **Sources:** `magicpin.in/Bangalore/Bashettihalli/Restaurant/Rainbow-Huts-Family-Restaurant/store/184787c` · `justdial.com/Bangalore/Rainbow-Huts-Family-Restaurant-Near-Ns-Convention-Hall-Hamam/080PXX80-XX80-240703160205-B5C8_BZDET`
- **Distinctness:** distinct address+phone vs all 14 existing. **T5 note:** a second JD page "Rainbow Huts" near MLA Krishnappa Layout may be the same business double-listed — intra-family, does not affect distinctness from the DB; phone check recommended.
- **Why ready:** verified phone, two directory ratings, distinctness proven.

**Row 15 — Hotel Bindushree Family Restaurant** · restaurant · Bashettihalli (K.G Govindapura)
- **T1 Maps:** none. **T2 Directories:** magicpin listing (4.2/5, plus-code address) + Justdial cross-list ("K.G Govindapura, Basettihalli - 562163") + Yandex ("open until 10:00 PM").
- **Address:** 7Hh4+Xq9, K.G Govindapura, Bashettihalli (magicpin address field). **Phone:** —. **Hours:** — (T5 conflict: JD 06:00–22:00 vs magicpin 10:00–22:00 → blanked). **Rating:** 4.2/5 (magicpin, checked 2026-10-09 — very small base).
- **Coordinates (T3, candidate only):** 13.2799, 77.556969 — decoded from the plus code `7Hh4+Xq9` published in magicpin's address (decoder validated against a known DB point). **NOT independently confirmed.**
- **Sources:** `magicpin.in/Bangalore/Bashettihalli/Hotel/Hotel-Bindushree-Family-Restaurant/store/1174189` · `justdial.com/Bangalore/Hotel-Bindushree-Family-Restaurant-Basettihalli/080PXX80-XX80-220317215349-N3C9_BZDET` · `yandex.com/maps/org/hotel_bindushree_family_restaurant/7787971394`
- **Why ready:** name + place corroborated by three directories; distinct vs all 14 existing. **Caveats:** tiny rating base; no phone; pin is plus-code-derived (T3).

**Row 17 — Sri Vinayaka Food Point** · restaurant · Doddaballapura Railway Station
- **T1 Maps:** none. **T2 Directories:** magicpin verified listing + district.in (3.9) + Justdial + Swiggy/Zomato existence references only.
- **Address:** Railway Station, Doddaballapura Locality (magicpin — area-level only). **Phone:** +918197052687 (magicpin verified). **Hours:** 08:00–21:30 (magicpin). **Rating:** 4.1/4731 (magicpin all-source aggregate; T5: district.in shows 3.9 — conflict noted, primary recorded). **Price:** ₹ (magicpin "Rs 500 for two" vs district "Rs 300 for two" — noted). **Menu:** Bajji ₹45/4pc, Rava Idli ₹65, 3 Poori ₹70, Paper Plain Dosa ₹80, Idli+vada ₹80 (magicpin, 2026-10-09). **Cuisine:** South Indian, North Indian, Chinese, Street Food, Fast Food, Juices, Shakes, Desserts.
- **Sources:** `magicpin.in/Bangalore/Doddaballapur/Restaurant/Sri-Vinayaka-Food-Point/store/15a4365` · `district.in/dining/doddaballapura/sri-vinayaka-food-point-doddaballapura-locality` · `justdial.com/Bangalore/Sri-Vinayaka-Food-Point-Opposite-Nageshwara-Temple-Basettihalli/080PXX80-XX80-220929135021-Q4T9_BZDET`
- **T5 note:** JD "Opposite Nageshwara Temple, Basettihalli" vs Swiggy slug "Shri Nagareshwara Temple Main Road" vs magicpin "Railway Station locality" — probably one temple-road location, not proven.
- **Why ready:** verified phone + hours + large rating base + menu; distinct vs all 14 existing.

**Row 20 — Hotel Krishnamoorthy** · hotel (eatery convention) · Doddaballapura Railway Station (Scout Camp Road)
- **T1 Maps:** none. **T2 Directories:** magicpin verified listing + Mappls place page (address + payload pin, place id OD43DN) + OneFiveNine village index ("hotel krishnamoorthy. near railwayStation; scout Camp Road").
- **Address:** Near Railway Station, Scout Camp Road, Doddaballapura, Karnataka 562163 (Mappls). **Phone:** +919742663255 (magicpin verified). **Hours:** 10:00–22:00 (magicpin). **Rating:** 4.3/2 (magicpin — tiny base; treat as anecdotal). **Cuisine:** South Indian, Chinese, Juices, Street Food. **Menu:** Cup Curd ₹30, Roasted Papad ₹40, Fried Papad ₹45, Curd Bowl ₹55, Boondi Raita ₹75; reviewers mention Paneer Manchurian, Handi Dum Biryani.
- **Coordinates (T3, candidate only):** 13.280305, 77.551956 — read from Mappls page payload (zdata), place id OD43DN. **NOT independently confirmed.**
- **Sources:** `magicpin.in/Bangalore/Doddaballapur/Restaurant/Hotel-Krishnamoorthy/store/525080` · `mappls.com/place-hotel+krishnamoorthy-near+railway+station-scout+camp+road-doddaballapura-dodballapura-bengaluru+rural+district-karnataka-562163-OD43DN`
- **T5 note:** Mappls pincode 562163 vs JD/OneFiveNine area pincode 561203 (known corridor-wide variance, recorded verbatim per source).
- **Why ready:** verified phone + hours + three corroborating sources; distinct vs all 14 existing.

### Group N — `needs_more_research` (15)

**Row 3 — Garuda Cafe Restaurant** · cafe (inferred from name — unconfirmed) · Adinarayana Hosahalli (A N Hosahalli)
- **T2 only:** JD listing exists (page unreadable, snippets boilerplate-only); village confirmed in-area via Wikipedia/OneFiveNine (~2 km from town, ~3 km from Kasbhag).
- **Missing (T5):** address, phone, hours, rating. **Sources:** `justdial.com/Bangalore/Garuda-Cafe-Restaurant-Adhinarayanahosahall/080PXX80-XX80-220728212033-M3V4_BZDET`
- **Why not ready:** a name + area alone is not a decidable identity (WORKFLOW: one source is never a decision).

**Row 7 — Venture's Hungry Birds** · fast_food (inferred — unconfirmed) · Doddaballapur (zone unconfirmed)
- **T2 only:** no dedicated listing anywhere; appears in JD cross-lists ("0.0, 0 ratings") and RG's index ("Ventures Hungry Bird's Venture's PIZZA").
- **Missing (T5):** address, phone, rating (0 ratings shown). **Source:** `justdial.com/Bangalore/Burger-Time-Near-Raj-Kamal-Theater-Doddaballapur/080PXX80-XX80-220418220006-W2T8_BZDET` (cross-list context).
- **Why not ready:** existence as an independent business is not established.

**Row 11 — Iyengar's Cake N Bake** · bakery_sweets · Doddaballapur
- **T2:** JD listing (4.0/95, page unreadable) + Zomato/Swiggy existence references (URLs only, no data copied).
- **Missing (T5):** address, phone, hours. Spelling variants: JD "Iyengar Cake And Bake" vs candidate "Iyengar's Cake N Bake" — likely same bakery, not proven. **Sources:** `justdial.com/Bangalore/Iyengar-Cake-And-Bake-Doddaballapur/080PXX80-XX80-220921011904-Z7L7_BZDET` · `zomato.com/pl/doddaballapura/iyengars-cake-n-bake-doddaballapura-locality/order` · `swiggy.com/city/doddaballapura/iyengars-cake-and-bake-doddaballapura-rest1408585`
- **Why not ready:** no address; identity across spellings unproven.

**Row 13 — Wild Woods BBQ Grill & Chill** · restaurant · Bhuvaneswari Nagar (zone-2 placement inferred from the JD station address block)
- **T2:** JD listing "Wild Woods Bbq" (name variant), "Near Ssv Power Gym". Also indexed under JD "Barbeque Restaurants in Nagadenahalli".
- **Missing (T5):** exact street address, phone, hours, rating. **Source:** `justdial.com/Bangalore/Wild-Woods-Bbq-Near-Ssv-Power-Gym-Bhuvaneswari-Nagar/080PXX80-XX80-250710211946-I4J6_BZDET`
- **Why not ready:** name variant + inferred placement; needs full identity.

**Row 16 — Karavali Hotel** · hotel · Doddaballapura Railway Station
- **T2:** two JD pages likely for one property — "Hotel Karavali" (restaurant) and "Karavali Hotel Near Railway Station" (lodging).
- **Missing (T5):** phone, hours, rating; canonical identity. **Sources:** `justdial.com/Bangalore/Hotel-Karavali-Doddaballapur/080PXX80-XX80-231108081001-E8R8_BZDET` · `justdial.com/Bangalore/Karavali-Hotel-Near-Railway-Station-Doddaballapur/080PXX80-XX80-250113180101-X6J2_BZDET`
- **Why not ready:** can't yet tell whether a separately-branded restaurant exists (the pilot tracks restaurants, not lodgings).

**Row 18 — Hotel Radha** · hotel · Govindapura
- **T2:** two same-family JD listings — "Hotel Radha" (Govindapura, 06:00–21:00) and "New Hotel Radha" (Near Railway Station, 5.0/11).
- **Missing (T5):** phone; which listing is the Phase 3C candidate. **Sources:** `justdial.com/Bangalore/Hotel-Radha-Govindapura/080PXX80-XX80-180831182321-U3J8_BZDET` · `justdial.com/Bangalore/New-Hotel-Radha-Near-Railway-Station-Doddaballapur/080PXX80-XX80-230826200751-G6H9_BZDET`
- **Why not ready:** rename vs two branches unresolved (Hold-adjacent; see Section 6 list).

**Row 19 — Siri Chicken Centre** · category **blank** · Doddaballapura Railway Station (opp. Tanuja Wines)
- **T2:** JD listing — primary classification "Chicken Retailers" (raw-meat shop), secondary "Restaurants"; chicken-retailer index gives "Scout Kamp Road Doddaballapur - 561203".
- **Rating:** 4.3/3 (JD, checked 2026-10-09). **Missing (T5):** phone, hours, **category** (no pilot category fits a raw-chicken retailer — left for human scope decision).
- **Source:** `justdial.com/Bangalore/Siri-Chicken-Centre-Near-Railway-Stationopposite-To-Tanuja-Wines-Doddaballapur/080PXX80-XX80-180627015044-S2I1_BZDET`
- **Why not ready:** scope decision first; if a raw retailer is out of pilot scope, this becomes `do_not_import`.

**Row 22 — Lakshmi Biriyani Point** · fast_food · Doddaballapura Railway Station (0.2–0.3 km from station per OneFiveNine) — **PRIORITY HOLD: closure signal**
- **T2:** JD listing live (4.7/10, checked 2026-10-09) vs **magicpin banner "The outlet has shutdown"** (checked 2026-10-09). Phone +919845263318 (magicpin). Cuisine: Biryani.
- **Missing (T5):** hours; operational status. **Sources:** `justdial.com/Bangalore/Lakshmi-Biriyani-Point-Near-Railway-Station-Doddaballapur/080PXX80-XX80-171013224908-C2Y3_BZDET` · `magicpin.in/Bangalore/Bashettihalli/Restaurant/Lakshmi-Biriyani-Point/store/543377` · OneFiveNine Kasbhag indexes.
- **Why not ready:** identity is solid but **operational status is unresolved**; do not approve while a shutdown banner stands uncontradicted. Full analysis in Section 4, Hold D.

**Row 25 — Ss Food Cafe** · cafe · Nagadenahalli (opp. SBI)
- **T2 only:** JD listing title + cross-listing block. **Missing (T5):** everything else. **Source:** `justdial.com/Bangalore/Ss-Food-Cafe-Opposite-Sbi-Nagadenahalii/080PXX80-XX80-251218025234-B9J4_BZDET`
- **Name-family note:** shares token "SS" with existing SS Hyderabadi Biriyani Zone — different type/area (Section 5).

**Row 26 — Amrutha Food Court** · restaurant · Nagadenahalli
- **T2 only:** JD listing title ("Amrutha Food Court Nagadenahalli"). **Missing (T5):** everything else. **Source:** `justdial.com/Bangalore/Amrutha-Food-Court-Nagadenahalli/080PXX80-XX80-221230011506-V3T1_BZDET`
- **NEW Phase 3E flag (Section 5):** phonetically near existing **Abhiram Food Court** (Moparahalli, coords 13.2849612,77.5963066) + identical head noun "Food Court" — a distinguishing phone/address is required before this row could ever be approved.

**Row 27 — Siri Bucket Biriyani** · restaurant · Thammasettihalli (opp. Bank of India, Scout Camp Road side)
- **T2 only:** JD index-page snippet ("3.9 · 17 Ratings · Scout Camp Road Thammasettihalli - 2.61 km") + a biryani-index row; no dedicated listing read.
- **Missing (T5):** phone, hours, dedicated listing. **Source:** `justdial.com/Bangalore/Chicken-Biryani-Dish-Restaurants-in-Doddaballapur`
- **Name-family note:** "Siri" token shared with row 19 (different businesses per JD addresses).

**Row 28 — Sanje Time Veg Restaurant & Chaats** · restaurant · Kasbhag
- **T2 only:** JD snippet "4.0 · 2 Ratings · Kasbhag Dodballapur". **Missing (T5):** address, phone, hours. **Source:** `justdial.com/Bangalore/Sanje-Time-Veg-Restaurant-Chaats-Doddaballapur/080PXX80-XX80-220312235807-D3L6_BZDET`

**Row 29 — Hoysala Family Restaurant** · restaurant · Doddaballapur (zone membership unconfirmed)
- **T2:** JD listing (4.0/331) + menu index (42 main-course items incl. Chicken Mughlai; garlic naan; Singapuri fried rice) + Instagram `@hoysalafamily` + magicpin listing existence.
- **Missing (T5):** exact street address; zone membership (JD places it in Doddaballapur town, discovered via a Nagadenahalli index). **Sources:** `justdial.com/Bangalore/Hoysala-Family-Restaurant-Doddaballapur/080PXX80-XX80-230609201003-C1B4_BZDET` · `magicpin.in/Bangalore/Doddaballapur/Restaurant/Hoysala-Family-Restaurant/store/168a001`
- **Why not ready:** the two-zone scope constraint requires confirmed placement.

**Row 30 — Grillland** · fast_food · Basettihalli
- **T2 only:** JD listing title ("Doddaballapura Basettihalli", fast-food index). **Missing (T5):** everything else. **Source:** `justdial.com/Bangalore/Grillland-Doddaballapura-Basettihalli/080PXX80-XX80-240305141018-Z1J7_BZDET`

**Row 31 — Rajanna Nati Style Biryani** · restaurant · Bhuvaneswari Nagar (station area)
- **T2 only:** JD biryani-index address row ("Railway Station, Doddaballapura, K.G Govindapura, Bhuvaneswari Nagar, Bangalore - 561203") + RG index rendering "Rajanna nati style hotel".
- **Missing (T5):** dedicated listing, phone, hours, rating. **Source:** `justdial.com/Bangalore/Biryani-Restaurants-in-Railway-Station-Doddaballapur-Doddaballapur/nct-10047018`

### Group H — `possible_duplicate_hold` (3, within the 27)

**Row 9 — Vaibhava Sweets & Chats** · bakery_sweets · Raghunathapura (Scout Camp Road, opp. NS Convention Hall)
- **T1 Maps: YES** — the only row with a real Maps place page: public short link `maps.app.goo.gl/rPxFWqwwEaH2o4Wr8` (published in a public YouTube video description) resolved to place **"Vaibhava Sweets&Chats"**, CID `0x3bb1e1fef9f204d5:0xcbcea14369c0d063`, feature `/g/11j8w16cbc`.
- **Coordinates (T3, candidate only):** 13.2869155, 77.5747334 — Maps marker read from the page preview payload; independently corroborated to ~2 m by the YouTube plus code `7HPF+QV9` (13.28690, 77.57472). **NOT independently confirmed.**
- **Address:** Scout Camp Road, opp. NS Convention Hall, Raghunathapura (Instagram; caption was truncated in the snippet).
- **Why held:** spelling family Vaibhava/Vybhava/Vaibhav across Maps/YouTube/Instagram/Justdial treated as one business but **not proven**; magicpin lists a separate **"Vybhava Sweets", Fort Rd** (+91 8027622143, 4.2/55) that may be a distinct older shop. Human must confirm which listing the Phase 3C candidate meant. Details in Section 4 context and `phase3d-matches-and-duplicates.md`.

**Row 21 — Ganesh Darshan & Chats** · fast_food · Doddaballapura Railway Station (opp.)
- **T2:** JD listing (3.6/6, checked 2026-10-09) + chotu index (plus code `7GXH+RMR, near muthyalamma temple, 561203`).
- **Coordinates: deliberately blank (T5 conflict)** — the chotu plus code decodes to ~13.2996, 77.5291, ~2 km from the station, contradicting JD's "Opposite Railway Station". A Facebook post / Instagram reel also mention "Ganesh darshan" / "New Ganesh darshan hotel" (Chamrajpet main road) — same-name family in town.
- **Why held:** shares the proper token "ganesh" with existing **Sri Ganesh Grand** (Bashettihalli, coords 13.2679055,77.5521405); no distinguishing phone/address; conflicting location evidence. See Section 5 and Hold list.

**Row 23 — Kiran Tiffin Room** · tiffin · Kasbhag Road — **PRIORITY HOLD: identity vs existing record**
- **T2:** Restaurant Guru page titled "Kiran Tiffin Room" (4.8/78, checked 2026-10-09; "No info on opening hours"; delivery+takeaway; INR 1–200/person) + Yandex (same phone) + magicpin ("Kasbhag Rd, K.G Govindapura, 562163") + beyondyatra (4.3, "Must Taste: Masala Dosa").
- **Address:** Kasbhag Rd, near railway station. **Phone:** +919663965135.
- **Why held:** RG's URL slug is `Aiyappa-Tiffin-Center-Doddaballapura` — RG appears to have renamed a former "Aiyappa Tiffin Center" listing — while the DB already holds **Ayyappa Tiffin Room** (`02a34d5f`, Scout Camp Road near Railway Station, +918088599999, coords 13.279913,77.552234) in the same station cluster. Full analysis in Section 4, Hold A.

---

## 4. Priority identity holds (Objective 6)

### Hold A — Kiran Tiffin Room (row 23) vs existing Ayyappa Tiffin Room (`02a34d5f`) — possible_duplicate_hold

| | Kiran Tiffin Room (candidate) | Ayyappa Tiffin Room (existing) |
| --- | --- | --- |
| Name sources | RG page title "Kiran Tiffin Room"; Yandex org `kiran_tiffin_room`; magicpin "Kiran-Tiffin-Room" | DB record; JD listing |
| Address | Kasbhag Rd, near railway station (RG); K.G Govindapura, 562163 (magicpin) | Scout Camp Road, near Railway Station |
| Phone | +9196 6396 5135 (RG + Yandex agree) | +918088599999 |
| Coordinates | none | 13.279913, 77.552234 |
| Rating | 4.8/78 (RG) | n/a |

- **The problem:** RG hosts Kiran's data under the slug `Aiyappa-Tiffin-Center-Doddaballapura`. Two readings: (a) RG renamed a listing that was once "Aiyappa Tiffin Center" — possibly the same business as the existing record (renamed, re-listed, or ownership change); (b) an unrelated tiffin room in the same cluster that RG historically mislabelled. Different phones and slightly different road names (Kasbhag Rd vs Scout Camp Road — adjacent station-corridor roads) are consistent with **either** reading.
- **Decision:** `possible_duplicate_hold`. **Do not import until resolved.**
- **Disambiguation work:** call +9196 6396 5135 and ask whether the business was/is also known as "Aiyappa Tiffin Center"; call the existing record's +918088599999 and ask whether it operates as "Kiran Tiffin Room"; on-site check of whether the Kasbhag Rd address and the Scout Camp Road address are one establishment; then a human picks: same business (no import; existing record may get an alias note) or distinct (row 23 proceeds as a candidate).

### Hold B — GITAM Cafe (row 1) vs existing GITAM University Canteen (`7259037f`) — possible_duplicate_hold

- **Evidence:** JD listing "Gitam Cafe, Heggadahalli" (rating 3.7 from a reviews-page snippet; page body unreadable); Snapchat's place-nearby list carries **both** "Gitam Cafe" **and** the university canteen as separate entries. The tool matched it to the canteen at similarity 0.375 (`name-ambiguous-proper-token`) with a `LOCALITY_CONFLICT` flag (Heggadahalli village cluster vs "GITAM campus").
- **Missing (T5):** address, phone, review count.
- **Decision:** `possible_duplicate_hold`. Remote sources cannot establish whether "Gitam Cafe" is a genuinely separate cafe at the campus edge or a second listing of the canteen.
- **Disambiguation work:** on-site check around the GITAM/Nagadenahalli campus edge (Heggadahalli side) for a standalone "Gitam Cafe" signboard distinct from the canteen counters; any phone number from the JD listing via human-browsed access.

### Hold C — Mantralaya pair: row 6 "Mantralaya Hotel & Chats" vs row 24 "Mantralaya Hotel" — possible_duplicate_hold (both)

- **Evidence:** two real, distinct Justdial listings: (a) "Mantralaya Tiifins And Chats", Near Anjineya Temple, Basettihalli — 4.8/15; (b) "Mantralaya Hotel", Near Railway Station — pure veg, 06:00–21:30. The tool flagged `INTRA_FILE_DUPLICATE` between rows 6 and 24. The Phase 3C candidate ("Mantralaya Hotel & Chats", grouped "Near GITAM/Nagadenahalli") matches **neither** listing's locality — both are outside Nagadenahalli. A vyaparify "Manthralayahotel" lodging page also exists (different business type).
- **Decision:** `possible_duplicate_hold` on **both** rows; they stay separate in the worksheet (never merged by the tool).
- **Disambiguation work:** a human decides which listing (if either) the Phase 3C candidate referred to; phone/on-site check to establish whether the two listings are one brand with two outlets, one business double-listed, or unrelated. If the Basettihalli listing is confirmed as a distinct chaats outlet it remains zone-2-adjacent (Bashettihalli side); the station listing is in-zone-2. Note the row-6 rating 4.8/15 belongs to the Tiffins-And-Chats listing only.

### Hold D — Lakshmi Biriyani Point (row 22) — reported shutdown — needs_more_research (status hold)

- **Evidence for closure:** magicpin displays the banner **"The outlet has shutdown"** (checked 2026-10-09) on `magicpin.in/Bangalore/Bashettihalli/Restaurant/Lakshmi-Biriyani-Point/store/543377` (that page also carries phone 9845263318).
- **Evidence against closure:** the Justdial listing is still live (4.7/10, checked 2026-10-09); OneFiveNine's Kasbhag index places it 0.2–0.3 km from the railway station.
- **Decision:** `needs_more_research` — treat as **possibly inactive**; do not approve for import while the closure signal stands uncontradicted.
- **Disambiguation work:** call +91 98452 63318 (is the outlet operating? has it moved?); on-site pass on the station corridor. If confirmed closed → `do_not_import` (record the finding); if open → identity evidence (name + address + phone + rating with sources) is otherwise sufficient to move toward `ready_for_human_approval`.

---

## 5. Spelling/name-variant duplicate check vs the 14 existing records (Objective 7)

**Method:** every one of the 27 potential-new names was compared against all 14 existing names (Abhiram Food Court · Amigos Cafe · Ayyappa Tiffin Room · Brundavana Family Restaurant · Chickpet Donne Biryani House · GITAM University Canteen · Hotel Halli Nanasu · Hotel Royal Nandhana · Priyanka Tiffen Center · Shri Manjunatha Grand Veg · Sri Annapoorneshwari Tiffin Center · Sri Ganesh Grand · SS Hyderabadi Biriyani Zone · The Biryani Shack) by core-token overlap + fuzzy similarity, then each hit was judged manually against recorded addresses/phones.

**Result: no potential-new row is, on current evidence, a duplicate of an existing record under a different spelling.** All overlaps found:

| Candidate (row) | Existing record | Shared material | Verdict |
| --- | --- | --- | --- |
| **26 Amrutha Food Court** | **Abhiram Food Court** (Moparahalli) | Phonetically near "Amrutha/Abhiram" + identical head noun "Food Court"; Nagadenahalli and Moparahalli are adjacent villages in the same eastern cluster | **NEW FLAG (this review).** Cannot be resolved remotely — row 26 has no phone/address. Requires distinguishing phone/address before any approval. Keep `needs_more_research`. |
| 25 Ss Food Cafe | SS Hyderabadi Biriyani Zone (Nagadenahalli) | Initialism "SS" | Distinct type (cafe vs biryani zone) and different spot (opp. SBI); noted, no flag. |
| 23 Kiran Tiffin Room | Ayyappa Tiffin Room | RG slug rename + same station cluster + "tiffin room" | **Already held** — Hold A. |
| 22 Lakshmi Biriyani Point | SS Hyderabadi Biriyani Zone | Generic dish token "biriyani" | Distinct proper tokens, localities (station vs Nagadenahalli) and phone. Distinct. |
| 27 Siri Bucket Biriyani | SS Hyderabadi Biriyani Zone | Generic "biriyani" | Distinct proper name + locality (Thammasettihalli). Distinct. |
| 31 Rajanna Nati Style Biryani | Chickpet Donne Biryani House; The Biryani Shack | Generic "biryani" | Distinct proper tokens and localities. Distinct. (The JD rendering "Chickpet Donne Biryani Cafe" = the existing House record; it was never a worksheet row.) |
| 17 Sri Vinayaka Food Point | Sri Annapoorneshwari Tiffin Center; Sri Ganesh Grand | Honorific "Sri" | Distinct names, categories, localities; verified phone. Distinct. |
| 2 The Shri Cafe and Restaurant | Shri Manjunatha Grand Veg | Honorific "Shri" | Distinct names/areas; Snapchat's nearby list shows both as separate places. Distinct. |
| 19 Siri Chicken Centre ↔ 27 Siri Bucket Biriyani (intra-file) | — | Token "Siri" | Two different JD listings at different addresses (opp. Tanuja Wines vs opp. Bank of India). Different businesses; noted for the reviewer. |

Generic-token overlaps (biriyani/biryani, Sri/Shri, hotel/cafe head nouns) are not identity evidence and none was treated as such.

---

## 6. Businesses requiring an on-site check or phone confirmation (Objective 8)

### 6a. Priority — identity/status holds (phone or on-site decides the row)

| # | Business | Why | Contact / where |
| ---: | --- | --- | --- |
| 1 | Kiran Tiffin Room (23) | Same as existing Ayyappa Tiffin Room, or a renamed/new business? | Phone +91 96639 65135; Kasbhag Rd near station; also call existing record's +918088599999 |
| 2 | GITAM Cafe (1) | Separate cafe or second listing of GITAM University Canteen? | On-site at the GITAM/Heggadahalli campus edge |
| 3 | Mantralaya Hotel & Chats (6) + Mantralaya Hotel (24) | Which listing is the 3C candidate; one brand or two? | On-site/phone: Anjineya Temple, Basettihalli + Near Railway Station |
| 4 | Vaibhava Sweets & Chats (9) | One shop or two (vs magicpin "Vybhava Sweets", Fort Rd, +918027622143)? Which listing did 3C mean? | On-site Scout Camp Rd/Raghunathapura; verify the Maps pin against the actual shop |
| 5 | Ganesh Darshan & Chats (21) | True location (JD "opp. Railway Station" vs chotu plus-code ~2 km away); distinct from Sri Ganesh Grand? | On-site station front; JD listing phone via human-browsed access |
| 6 | Lakshmi Biriyani Point (22) | **Open or shut?** (magicpin shutdown banner vs live JD) | Phone +919845263318; station corridor |

### 6b. Standard phone/on-site enrichment (needs_more_research rows)

| Business (row) | What to obtain |
| --- | --- |
| Garuda Cafe Restaurant (3) | Any address/phone/hours (JD page unreadable remotely) |
| Venture's Hungry Birds (7) | Does it exist as a business at all; where |
| Iyengar's Cake N Bake (11) | Street address; spelling identity vs JD "Iyengar Cake And Bake" |
| Wild Woods BBQ Grill & Chill (13) | Full trading name; exact street address |
| Karavali Hotel (16) | Restaurant vs lodging; is there a separately-branded restaurant |
| Hotel Radha (18) | Hotel Radha vs New Hotel Radha — rename or two branches |
| Siri Chicken Centre (19) | Scope call (raw retailer in/out of pilot); phone/hours if in |
| Ss Food Cafe (25) | Basic details (title-only row) |
| Amrutha Food Court (26) | Phone/address — **and explicitly distinguish from existing Abhiram Food Court** |
| Siri Bucket Biriyani (27) | Dedicated listing or on-site details |
| Sanje Time Veg Restaurant & Chaats (28) | Address/phone/hours |
| Hoysala Family Restaurant (29) | Street address; zone membership |
| Grillland (30) | Basic details (title-only row) |
| Rajanna Nati Style Biryani (31) | Dedicated listing or on-site details |
| Appu Chats (10) | Only if a near-GITAM stall is found — otherwise out of zone |
| Biryani Cafe (5) | Whether it exists in the target zones at all |

### 6c. Coordinate confirmation (on-site GPS or equivalent field verification)

All three coordinate-bearing rows remain **candidate pins (T3)** — none is independently confirmed (T4):
1. **Vaibhava Sweets & Chats** (9): Maps marker 13.2869155, 77.5747334 → confirm the pin sits on the actual shop (opp. NS Convention Hall, Raghunathapura).
2. **Hotel Bindushree Family Restaurant** (15): plus-code pin 13.2799, 77.556969 → confirm on the ground (K.G Govindapura, Bashettihalli).
3. **Hotel Krishnamoorthy** (20): Mappls pin 13.280305, 77.551956 → confirm on the ground (Scout Camp Road).

The 8 approval-ready rows currently have **no coordinates at all** — if the human approves them, on-site GPS capture should accompany any future import so they do not enter the DB as pinless entries.

---

## 7. The four rows outside the potential-new bucket (reviewed for completeness)

| Row | Candidate | Validator bucket | Phase 3E decision | Reason |
| ---: | --- | --- | --- | --- |
| 1 | GITAM Cafe | possible_duplicates | **possible_duplicate_hold** | Hold B (Section 4) |
| 5 | Biryani Cafe | insufficient_evidence | **do_not_import** | Fully generic name; no listing found in the target zones after dedicated searches; there is no identity to approve. Row stays visible in the worksheet so the open question is not lost; if a real listing surfaces near GITAM/Nagadenahalli it becomes a fresh candidate. |
| 6 | Mantralaya Hotel & Chats | possible_duplicates | **possible_duplicate_hold** | Hold C |
| 24 | Mantralaya Hotel | possible_duplicates (discovery row) | **possible_duplicate_hold** | Hold C |

---

## 8. Validator report check (Objective 10)

Verified against `research-2026-10-09.dry-run.md` and by direct programmatic checks of the worksheet (10 scripted checks, this review):

1. **Missing fields remain blank — confirmed.** Blank-means-unknown holds: no value was invented to fill a gap. Field census across all 31 rows (scripted count): phones on 8 rows (2, 4, 12, 14, 17, 20, 22, 23) · addresses on 19 rows · opening_hours on 5 rows (12, 17, 18, 20, 24) · coordinates on exactly 3 rows (9, 15, 20) · cuisines on 5 · price levels on 5 · menu notes on 6. Hours-conflict rows (4, 14, 15) and the rating-conflict row (2) are blank, not guessed — exactly as the missing-data report documents, row by row.
2. **External ratings remain strictly separate from Foodie community reviews — confirmed.** The worksheet header contains **no** `community_rating`, `review_count`, `rating_count`, `coordinates_verified`, or `verification_status` columns. Every `listing_rating` value (16 rows) and `listing_review_count` value (15 rows) is paired with a `rating_source_url` and `rating_checked_on=2026-10-09` — zero unprovenanced ratings. The validator's policy line holds: community fields are trigger-maintained (migration-005) and rejected in imports.
3. **Validator run state:** 0 validation errors, 0 warnings; buckets 27/0/3/1/0 with 3 candidate coordinates quarantined (cross-cutting bucket 6); no row carries `existing_match_id`; `same_as_existing` decisions: zero.
4. **Coordinates discipline:** every coordinate row is `directory_reported` with a `coordinates_source_url`; no `coordinates_verified=true` claim exists anywhere (the tool rejects unsupported claims by design).
5. **Determinism:** the report is a deterministic function of input + baseline snapshot (idempotency proven in Phase 3D; re-verified by re-running in this phase — same bucket counts, 0 errors/0 warnings).

**Worksheet hygiene findings (non-blocking; recorded for a future human-approved edit — NOT changed in Phase 3E):**
- 14 field-provenance pairings rely on the row-level `source_url` instead of the dedicated per-field column (rows 6, 8, 10, 13, 15, 19, 21, 22, 23, 24, 27, 31 — address; rows 22, 23 — phone). The validator accepts row-level `source_url` as provenance (its warnings fire only when no source exists at all), so this is precision, not a violation. Notably, row 22's phone is actually sourced from the magicpin page (named in notes) and row 23's phone/address from RG — backfilling `phone_source_url`/`address_source_url` at the next worksheet edit would make provenance exact.
- Row 5 (Biryani Cafe) has blank `evidence_level` and `source_url` — correct and intentional: no listing exists to cite.

---

## 9. What would change a decision — and the stop

- `needs_more_research` → `ready_for_human_approval`: dedicated listing or on-site details that supply identity (address and/or phone), zone membership confirmed, conflicts resolved or source-decided.
- `possible_duplicate_hold` → either "same as existing" (row never imports; existing record may later get an enrichment UPDATE in a separate workflow) or "distinct" (proceeds as a candidate with distinguishing phone/address).
- `ready_for_human_approval` rows stay approval-ready as long as their evidence stands; a Maps place page (T1) plus an operational-status check would make each of them a confident approval.
- `do_not_import` rows (5, 10) revert to research status only if in-zone evidence appears.

**STOP.** Per the Phase 3E instruction this review ends here: no import, no SQL, no app/database changes, nothing committed. The two deliverables (`phase3e-human-review.md`, `phase3e-maps-evidence-gaps.md`) and the re-run validator/test results are submitted for **human approval**.
