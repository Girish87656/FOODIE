# Foodie — Phase 3D Missing-Data & Uncertainty Report

**Date:** 2026-10-09 · Rule of the round: *blank means unknown* — every gap below
is deliberately empty in `input/research-worksheet-phase3d.csv`, never guessed.

---

## 1. Cross-cutting limitations (affect most rows)

1. **Google Maps place pages could not be browsed.** JS/consent wall + no-scraping
   rule → exactly one Maps place URL captured (row 9, via a public short link).
   `maps_listing_url` is blank on 30/31 rows. This is the single biggest gap vs
   the Phase 3D field list.
2. **Justdial listing pages are not readable** by the page reader (anti-bot).
   For JD-only rows the recorded fields come from search-result snippets of those
   listing pages (titles/slugs, structured hours/rating text, index rows) and are
   cited per row. Anything the snippets did not show (phones, full addresses,
   menus) is blank.
3. **No independent confirmation exists anywhere.** No visits, no calls, no GPS:
   every row is `evidence_level=directory_reported`; `coordinates_verified` and
   `verification_status` are left empty by design.
4. **Zomato/Swiggy data was not copied** (restrictions). Their listings are cited
   as existence references only, so menu/price details that only they publish are
   missing.
5. **Ratings are external directory ratings** observed on 2026-10-09 — never
   Foodie community values (kept strictly separate; the worksheet forbids
   `community_rating`/`review_count` columns).

## 2. Row-level gaps (field → why blank)

| Row | Candidate | Missing (blank) fields & reason |
| ---: | --- | --- |
| 1 | GITAM Cafe | address, phone, review count — JD reviews page snippet showed only name/area/rating 3.7 |
| 2 | The Shri Cafe and Restaurant | listing_rating (JD snippets disagree: 4.5 vs 5.0, both "17 ratings"), cuisine, hours |
| 3 | Garuda Cafe Restaurant | address, phone, hours, rating — JD page unreadable, snippets boilerplate-only |
| 4 | Epicurus | opening_hours (district.in 10:00–22:00 vs JD 12:00–23:00 → conflict → blank), rating (district shows none) |
| 5 | Biryani Cafe | everything — no listing found in target zones (generic name) |
| 6 | Mantralaya Hotel & Chats | phone, full address, hours ("until 10:00 pm" partial → blank) |
| 7 | Venture's Hungry Birds | address, phone, rating (JD cross-list shows 0 ratings), maps URL — no dedicated listing exists |
| 8 | Lotus Gardenia | phone, cuisine, hours (JD "booking hours 9:00–20:00" ≠ business hours) |
| 9 | Vaibhava Sweets & Chats | phone, hours, rating, full street address (Instagram caption truncated; no Maps-address text captured) |
| 10 | Appu Chats | phone, hours, rating; zone mismatch (Tubugere vs "Near GITAM") |
| 11 | Iyengar's Cake N Bake | address, phone, hours — JD unreadable |
| 12 | Best Choice Bakery | cuisine specifics (bakery items only) — hours/rating conflicts noted, not left blank incorrectly |
| 13 | Wild Woods BBQ Grill & Chill | phone, hours, rating, exact street address |
| 14 | Rainbow Huts Family Restaurant | opening_hours (magicpin 11:30–14:00 partial vs Zomato 12:15 — conflict → blank); intra-family double-listing unresolved |
| 15 | Hotel Bindushree | opening_hours (JD 06:00–22:00 vs magicpin 10:00–22:00 → conflict → blank), phone |
| 16 | Karavali Hotel | phone, hours, rating — two JD pages (restaurant vs lodging) unresolved |
| 17 | Sri Vinayaka Food Point | full street address (magicpin gives area-level only); rating differs by source (4.1/4731 vs district 3.9) — primary recorded, conflict noted |
| 18 | Hotel Radha | phone, rating (5.0/11 belongs to "New Hotel Radha"), address detail |
| 19 | Siri Chicken Centre | **category blank** — JD classifies it primarily as a raw-chicken retailer; no pilot category fits; phone, hours |
| 20 | Hotel Krishnamoorthy | larger rating base (magicpin 4.3 is from only 2 ratings) |
| 21 | Ganesh Darshan & Chats | **coordinates blank** — chotu plus code 7GXH+RMR decodes ~2 km from JD's "Opposite Railway Station"; phone, hours |
| 22 | Lakshmi Biriyani Point | hours; **operational status unresolved** (magicpin shutdown banner vs live JD listing); price left blank given the closure signal |
| 23 | Kiran Tiffin Room | hours ("No info on opening hours" per RG); identity vs existing Ayyappa record unresolved |

## 3. Coordinates discipline (bucket 6 — awaiting confirmation)

Only three rows carry coordinates, all directory-reported with sources, all
correctly quarantined by the validator:

| Row | Candidate | Coordinates | Derivation |
| ---: | --- | --- | --- |
| 9 | Vaibhava Sweets & Chats | 13.2869155, 77.5747334 | Google Maps place marker (public short link) |
| 15 | Hotel Bindushree | 13.2799, 77.556969 | plus code `7Hh4+Xq9` in magicpin's address, decoded with the station-area reference (decoder validated against a known DB point) |
| 20 | Hotel Krishnamoorthy | 13.280305, 77.551956 | Mappls page payload (zdata), place id OD43DN |

Deliberately NOT recorded as coordinates: Ganesh Darshan (plus code conflicts with
its JD placement), Vybhava's plus code (agrees with row 9 — kept as a note only).

## 4. Known internal conflicts (documented, unresolved)

- Shri Cafe rating 4.5 vs 5.0 (both 17 ratings, two JD renderings) → rating blank.
- Epicurus hours 10:00–22:00 (district.in) vs 12:00–23:00 (JD) → hours blank.
- Bindushree hours 06:00–22:00 (JD) vs 10:00–22:00 (magicpin) → hours blank.
- Rainbow Huts rating 4.6 (magicpin) vs 4.4 (JD) vs 3.2 (Zomato, reference only).
- Best Choice hours 10:00–20:00 (magicpin verified) vs 09:00–22:00 (Instagram
  popular-page claim) — stronger source recorded, conflict noted.
- Sri Vinayaka: JD "Opposite Nageshwara Temple, Basettihalli" vs Swiggy slug
  "Shri Nagareshwara Temple Main Road" vs magicpin "Railway Station locality" —
  probably one temple-road location, not proven.
- Pincode variance across the station corridor (561203 vs 562163) — recorded
  verbatim per source.
- Price bands (₹) are the researcher's classification from published figures
  ("₹300/₹500 for two", "INR 1–200 per person"); figures are preserved in notes.

## 5. Coverage honesty (what was checked vs not)

**Checked (dedicated queries + listing/index reads):** all 23 Phase 3C candidate
names; JD area indexes for Nagadenahalli, Railway-Station Doddaballapur, fast
food / biryani / BBQ near the station; OneFiveNine Kasbhag & A N Hosahalli village
pages; Mappls station-area page.

**NOT checked (no claim of exhaustive coverage):** a systematic street-by-street
walk of Nagadenahalli or of Scout Camp / Kasbhag Road; the GITAM campus interior
(canteen counters, hostel-side stalls — not publicly enumerable; G-Diner is the
campus app ecosystem, Hyderabad-centric in results); the 40+ queued names in the
research log; any verification of open/closed status beyond the two signals found
(Lakshmi Biriyani Point banner; "Open Now" badges, which were never used as hours).
