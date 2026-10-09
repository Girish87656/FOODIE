# Foodie — Phase 3D Source-by-Source Research Log

**Date of research:** 2026-10-09 (all `rating_checked_on` values)
**Researcher:** automated assistant with web-search + web-reader tooling (no on-site visits, no calls)
**Input:** `input/research-worksheet-phase3d.csv` (23 Phase 3C candidates) + in-zone discovery
**Companion reports:** `research-2026-10-09.dry-run.md` (validator), `phase3d-matches-and-duplicates.md`, `phase3d-new-candidates.md`, `phase3d-missing-data-uncertainty.md`

**Honesty limits (read first).** Everything below is `directory_reported`. Nothing was
independently confirmed (no visit, no call, no on-site GPS). Google Maps place pages
could not be browsed in this environment (JS/consent wall; scraping prohibited) — a
Maps place URL was captured for exactly ONE business via a public short link.
Justdial listing pages are not readable by the page reader (anti-bot), so for
Justdial-only rows the recorded fields come from search-result snippets of those
same listing pages (titles/slugs, structured hours text, rating text, index rows),
cited per row. Where a field could not be evidenced, it is blank.

---

## Sources used, in order of contribution

### 1. Web search (z-ai `web_search`, 30 queries, 2026-10-09)
Discovery layer for every candidate and for in-zone discovery. Raw results cached
locally at `/tmp/phase3d/s01…s30-*.json` (not committed). Every worksheet row's
`source_url`/per-field URLs were taken from these results.

### 2. Google Maps — ONE place page, via a public short link (not scraped)
`https://maps.app.goo.gl/rPxFWqwwEaH2o4Wr8` (published in a public YouTube video
description) resolved to the place page **"Vaibhava Sweets&Chats"**
(CID `0x3bb1e1fef9f204d5:0xcbcea14369c0d063`, feature `/g/11j8w16cbc`) with marker
**13.2869155, 77.5747334** read from the page's preview payload. This is the only
`maps_listing_url` in the worksheet (30 of 31 rows have it blank — see limits above).
No bulk collection, no query-URL harvesting; a `/maps/search/…` URL would have been
rejected by the validator anyway.

### 3. magicpin listing pages (7 pages read)
Best Choice Bakery, Hotel Krishnamoorthy, Sri Vinayaka Food Point, Rainbow Huts
Family Restaurant, Hotel Bindushree Family Restaurant, Lakshmi Biriyani Point
(+ Vybhava Sweets, logged only). Yielded: verified-listing phones, hours, rating
aggregates, menu highlights, addresses (incl. Bindushree's plus code `7Hh4+Xq9`),
and the **"The outlet has shutdown"** banner on Lakshmi Biriyani Point.

### 4. district.in (Epicurus page read; Sri Vinayaka via snippet)
Epicurus: locality "Munilakshmamma, Nagadenahalli", cuisines, ₹300-for-two,
10:00–22:00, phone (cross-checked against the printed menu). Sri Vinayaka: 3.9
rating + Railway Station locality (second-source note).

### 5. restaurant-guru.in (Kiran Tiffin Room page read)
4.8 / 78 votes, address "Kasbhag Rd, near railway station", phone +91 96639 65135,
INR 1–200/person, delivery+takeaway, "No info on opening hours". Its URL slug
(`Aiyappa-Tiffin-Center-Doddaballapura`) triggered the row's identity hold.

### 6. Snapchat place page (The Shri Cafe and Restaurant)
Address "NH 648, Doddaballapur Main Road Nagadenahalli Village…", phone
098449 29931; its nearby-place list independently shows "Gitam Cafe", "AMIGOS
Cafe", "EPICURUS", "SS Hyderabadi Biriyani Zone", "SHRI MANJUNATHA GRAND VEG" —
corroboration for several identities.

### 7. Mappls (Hotel Krishnamoorthy)
Page shell only (JS-rendered), but the URL payload (`zdata`) carries the pin:
**13.280305, 77.551956**, place id OD43DN — recorded as directory-reported
coordinates with the Mappls URL as `coordinates_source_url`.

### 8. Justdial — snippets only (pages blocked)
~22 listing URLs captured and cited. Extractable from snippets: names, area tags,
hours blocks (e.g. Mantralaya Hotel 6:00–21:30; Bindushree 6:00–22:00; Hotel Radha
6:00–21:00), ratings+counts (Shri 4.5-or-5.0/17 — conflicting, therefore blank;
Lotus Gardenia 4.0/2410; Iyengar's 4.0/95; Best Choice 4.0/398; Ganesh Darshan
3.6/6; Lakshmi 4.7/10; Siri Chicken 4.3/3; Siri Bucket 3.9/17; Sanje 4.0/2;
Hoysala 4.0/331; Mantralaya Tiffins 4.8/15), address fragments (Appu Chats/Tubugere,
Siri Bucket/Thammasettihalli), and index rows (Rajanna Nati Style Biryani address;
Bhuvaneswari Nagar inside the Railway-Station address block).

### 9. Scribd (Epicurus printed menu)
Second source for the Nagadenahalli address and phone 90359 72563.

### 10. YouTube (A P Explore video on "Vybhava Sweets & Chats")
Published Google location short link (→ source 2) and plus code `7HPF+QV9`, which
decodes to 13.28690, 77.57472 — matching the Maps marker to ~2 m (decoder validated
against a known DB point).

### 11. Instagram posts
@theshricafeofficial (branding), @epicurus_original (buffet ₹349), the Vybhava
location post (Scout Camp Road, opp. NS Convention Hall, Raghunathapura).

### 12. Village geography references
Wikipedia/Bharatpedia/OneFiveNine: Adinarayana Hosahalli (Garuda's village) is in
Doddaballapura taluk, ~2 km from town, ~3 km from Kasbhag → in-area. OneFiveNine
Kasbhag/Kasbhag-Road indexes place Hotel Krishnamoorthy, Lakshmi Biriyani Point
(0.2–0.3 km from station) and Ganesh Darshan ("Opp railway station").

### 13. Yandex Maps (snippets)
Bindushree ("open until 10:00 PM"), Kiran (phone) — corroboration only.

### 14. Supabase baseline (read-only GET via `fetch-baseline.ts`)
14 existing restaurants refreshed at 2026-10-09T14:23Z; single GET, zero writes;
the key is never printed or stored. Used only for duplicate review.

### 15. Zomato / Swiggy — URL references ONLY
Listings exist for Iyengar's Cake N Bake, Sri Vinayaka Food Point, Rainbow Huts,
Hoysala, Vybhava/Vaibhav Sweets, Epicurus (other branches). Per restrictions, **no
proprietary data was copied** — only the fact of the listing + URL is noted.

---

## Respect for source terms
- No scraping of Google Maps; no bulk collection anywhere; one page per business.
- No Zomato/Swiggy data copied; existence + public URL only.
- No paywalled or gated content used; no paid APIs, keys or credentials.
- Per-field provenance lives in the worksheet (`source_url` + `*_source_url` columns).

## Observed but NOT researched (queue — no worksheet rows, no verification claims)
La Reserve Lounge (Nagadenahalli; lounge bar — no pilot category) · Lounge De La
Reserve · Burger Time (near Raj Kamal Theater) · Bunny's Burgers'N Fried Chicken
(Mallathahalli, opp. Civil Court) · Leon's Burgers & Wings · Bbq Junction (Green
Valley Layout, near KMH Convention Hall) · Annapurna Restaurant · Alankar Paradise
· Alankar Bar & Restaurant · Five Star Chicken (Tubagere) · Sri Sai Chats ·
Shawarma Cartel · Rajashree Veg And Non-Veg Family Restaurant · VRB Hotel Family
Restaurant · G P Non Veg Corner · R R Lunch House · RD Restaurant · Maha Naati
Ruchi · Dish Fish · Raju tiffin center · Shabari Bakery · Sri Lakshmivenkateshwara
Bakery · S.L.V Chinese Corner · PALAV RAMU · Udupi Upahar · Hasanamba Iyengar
Bakery (Jalappa College Rd) · Iyengar Bakery And Cake Palace (Lakshmipura) ·
Durgashree Samruddhi Grand · Raj Restaurant · Momoos Chinese And Biriyani Centre ·
Sri Lakshmi Pani Puri Center Ayush · New Udupi Kitchen Pure Veg Hotel · Deeksha
Hotel · Atithi Hotel · Sinchana Palace Restaurant (Mallathahalli) · Vybhava Sweets
(Fort Rd — possible sibling of row 9) · Desi Family Dhaba and Restaurant · Ramji
Hotel · Diamond Zoop Cafe · Five Star Kohli Hut. All observed in JD area indexes,
Snapchat nearby lists or RG's Doddaballapura index on 2026-10-09; none opened,
none verified, none added to the worksheet.
