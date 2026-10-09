# Foodie — Phase 3E Google Maps Evidence Gaps

**Review date:** 2026-10-09 · Companion to `phase3e-human-review.md`
**Scope:** which candidates lack usable Google Maps place-page evidence, and exactly what verification work remains. **No research was re-run; no Maps access was attempted or bypassed.**

**Compliance line (unchanged from Phase 3D):** Google Maps was not scraped and will not be. No access restriction was bypassed; no automated bulk collection exists or is proposed. Everything below describes **manual, human-performed lookups** that respect Google's terms, recording only permitted references (place URLs, displayed names/addresses) — the same discipline the Phase 3D log followed when it captured the single place URL from a public short link.

---

## 1. Ground truth — what Maps evidence actually exists today

| Fact | Value |
| --- | --- |
| Rows carrying a **real Google Maps place-page URL** | **1 of 31** (row 9, Vaibhava Sweets & Chats — via public short link `https://maps.app.goo.gl/rPxFWqwwEaH2o4Wr8`) |
| Rows carrying only search links / snippets / other directories | **30 of 31** (`maps_listing_url` blank) |
| Businesses whose identity is **verified by Google Maps** | **0** — no such claim may be made; even row 9's evidence is a place page *viewed once*, not a verification act |
| Rows whose coordinates came from a Google Maps place marker | 1 (row 9 — marker read from the place-page preview payload) |
| Rows whose coordinates came from **non-Google** directory pins | 2 (row 15 — plus code published by magicpin, decoded; row 20 — Mappls page payload) — **not** Google Maps evidence |
| Rows with independently confirmed coordinates (T4) | **0 of 31** |

**Standing rule (Phase 3E objective 5):** a Google Maps *search* link, a directory listing, or a search-result snippet is **never** recorded as Google Maps place-page evidence. The validator enforces this mechanically (search URLs are flagged `MAPS_URL_IS_SEARCH_NOT_LISTING` and rejected as identity anchors); this review enforces it editorially. Nothing in the Phase 3D record claims otherwise — the worksheet's single Maps URL is a genuine place page.

Why the gap exists (from `phase3d-research-log.md`): Maps place pages could not be browsed in the research environment (JS/consent wall; scraping prohibited), so the researcher recorded place evidence only where a legitimate public reference existed.

---

## 2. What a legitimate place-page lookup must record (procedure for the human)

For each business below, one manual visit to its Google Maps place page should capture — each item with the check date, and only what the page itself displays:

1. **Canonical place URL** (a `/maps/place/…` URL or a `maps.app.goo.gl` short link that resolves to the place — never a `/maps/search/…` result URL).
2. **Place name exactly as displayed** (for spelling-family rows — 9, 11, 13, 22 — this alone can resolve identity).
3. **CID / feature id** if visible in the URL or share payload (row 9's precedent: CID `0x3bb1e1fef9f204d5:0xcbcea14369c0d063`).
4. **Displayed address** and locality.
5. **Displayed opening hours** (only if shown as business hours).
6. **Displayed rating + review count** — recorded as *external Maps rating*, `rating_checked_on` set, kept strictly separate from Foodie community reviews.
7. **Marker coordinate** via the UI's "copy coordinates" (right-click the pin) — recorded as **directory-reported (T3)**, *never* as independently confirmed.
8. **Per-field provenance:** the place URL goes into `maps_listing_url` and the relevant `*_source_url` columns at the next worksheet edit.

Acceptance rule per row: place page found → name matches the candidate (or the mismatch is explained) → address/pin consistent with the recorded locality. A Maps place page remains **directory-class (T1) evidence**: it can corroborate identity and pin placement but, per the WORKFLOW rule "cross-directory agreement ≠ independently_confirmed", it can never by itself set `evidence_level=independently_confirmed` or `coordinates_verified=true`.

---

## 3. Priority A — place-page lookups for the 8 approval-ready rows

These rows are otherwise decision-ready; a place page (plus, where noted, the named check) is the main missing corroboration.

| Row | Candidate | Other evidence already held (T2/T3) | What the Maps place page should confirm |
| ---: | --- | --- | --- |
| 2 | The Shri Cafe and Restaurant | JD + Snapchat place page (address, phone +919844929931) + Instagram | NH 648 / Nagadenahalli placement; displayed hours & rating (would also settle the JD 4.5-vs-5.0 conflict) |
| 4 | Epicurus Multi Cuisine Restaurant | district.in + printed menu + Instagram (phone +919035972563) | Munilakshmamma, Nagadenahalli pin; displayed hours (JD 12:00–23:00 vs district 10:00–22:00 conflict) |
| 8 | Lotus Gardenia | JD 4.0/2410 + TripAdvisor mention | Opp. Indian Oil Petrol Bunk near the station; bar+rooms profile; displayed phone |
| 12 | Best Choice Bakery | magicpin verified + JD + RG (phone +919980213680) | D Cross Rd pin; displayed hours (magicpin 10:00–20:00 vs Instagram claim) |
| 14 | Rainbow Huts Family Restaurant | magicpin verified + JD (phone +918951368020) | Bashettihalli / near NS Convention Hall pin; displayed hours (lunch-window conflict) |
| 15 | Hotel Bindushree Family Restaurant | magicpin + JD + Yandex; plus-code pin (T3) | Pin cross-check: does the Maps marker match 13.2799, 77.556969? |
| 17 | Sri Vinayaka Food Point | magicpin verified + district + JD (phone, hours, menu) | Temple-road placement (JD "Nageshwara Temple" vs Swiggy slug vs "Railway Station locality") |
| 20 | Hotel Krishnamoorthy | magicpin verified + Mappls (pin, place id OD43DN) + OneFiveNine | Pin cross-check vs 13.280305, 77.551956; displayed rating to offset the 2-rating magicpin base |

Row 9 (Vaibhava Sweets & Chats) already has its place URL; its **completion** work sits in Priority B (Hold D of the companion report): displayed hours/rating/phone were never captured from the page, and the pin (13.2869155, 77.5747334) still needs the human cross-check against the actual shop in Raghunathapura.

## 4. Priority B — place-page lookups for the 6 holds

A place page can materially resolve each hold:

| Row | Candidate | What Maps could resolve |
| ---: | --- | --- |
| 1 | GITAM Cafe | Does a distinct "Gitam Cafe" place exist near the campus (separate from "GITAM University Canteen")? A place page with its own address/phone would break Hold B. |
| 6 | Mantralaya Hotel & Chats | Own place page near Anjineya Temple, Basettihalli? |
| 9 | Vaibhava Sweets & Chats | Confirm displayed name/spelling ("Vaibhava Sweets&Chats"), hours, rating; pin cross-check; does Maps also show a separate "Vybhava Sweets" on Fort Rd? |
| 21 | Ganesh Darshan & Chats | Where does Maps place it (opp. the station vs the chotu plus-code spot ~2 km away)? A displayed address would also separate it from Sri Ganesh Grand. |
| 23 | Kiran Tiffin Room | Is there a "Kiran Tiffin Room" place distinct from any "Ayyappa Tiffin Room" place? Compare displayed names, addresses, phones, CIDs — the core of Hold A. |
| 24 | Mantralaya Hotel | Own place page near the Railway Station? Distinct CID from row 6's listing would confirm two places. |

## 5. Priority C — place-page lookups for the remaining rows

| Row | Candidate | What Maps could add |
| ---: | --- | --- |
| 3 | Garuda Cafe Restaurant | Existence corroboration; address/phone (JD page unreadable remotely) |
| 5 | Biryani Cafe | Whether any such place exists in the target zones (generic name — a null result would be informative) |
| 7 | Venture's Hungry Birds | Whether a dedicated place exists at all |
| 10 | Appu Chats | Whether any same-named place exists near GITAM (the only known listing is Tubugere — out of zone) |
| 11 | Iyengar's Cake N Bake | Displayed name + address (spelling identity vs JD "Iyengar Cake And Bake") |
| 13 | Wild Woods BBQ Grill & Chill | Full trading name ("Wild Woods Bbq" variant); exact placement in Bhuvaneswari Nagar |
| 16 | Karavali Hotel | Restaurant vs lodging places — separate CIDs? |
| 18 | Hotel Radha | "Hotel Radha" (Govindapura) vs "New Hotel Radha" (near station) — one place or two |
| 19 | Siri Chicken Centre | Placement (opp. Tanuja Wines, Scout Kamp Rd); displayed category |
| 22 | Lakshmi Biriyani Point | Whether Maps shows the place as **permanently closed** or operationally marked — an independent closure signal beside the magicpin banner |
| 25 | Ss Food Cafe | Existence + basic details (opp. SBI, Nagadenahalli) |
| 26 | Amrutha Food Court | Own address/phone — also serves the **new Abhiram Food Court spelling-flag** from the companion report |
| 27 | Siri Bucket Biriyani | Existence (only index-snippet evidence today); opp. Bank of India, Thammasettihalli |
| 28 | Sanje Time Veg Restaurant & Chaats | Address/phone/hours (snippet-only today) |
| 29 | Hoysala Family Restaurant | Street address; zone membership (town vs corridor) |
| 30 | Grillland | Existence + basic details (Basettihalli) |
| 31 | Rajanna Nati Style Biryani | Dedicated place page ("Rajanna nati style hotel" in RG's index) |

---

## 6. Coordinate cross-check register (bucket 6 — 3 rows)

| Row | Candidate | Candidate pin (T3) | Derivation | Cross-check work |
| ---: | --- | --- | --- | --- |
| 9 | Vaibhava Sweets & Chats | 13.2869155, 77.5747334 | Google Maps place marker (public short link); corroborated ~2 m by YouTube plus code `7HPF+QV9` | Human: right-click pin → copy coordinates on the place page; on-site confirm the shop opposite NS Convention Hall |
| 15 | Hotel Bindushree Family Restaurant | 13.2799, 77.556969 | Plus code `7Hh4+Xq9` from magicpin's address, decoded (decoder validated against a known DB point) | Compare Maps marker vs decoded pin; on-site confirm at K.G Govindapura, Bashettihalli |
| 20 | Hotel Krishnamoorthy | 13.280305, 77.551956 | Mappls page payload (zdata), place id OD43DN | Compare Maps marker vs Mappls pin; on-site confirm on Scout Camp Road |

Until those checks happen, all three pins stay **candidate coordinates awaiting confirmation** — the validator quarantines them in bucket 6 regardless of any other progress.

---

## 7. Counts and closure criteria

- **Rows without usable Maps place-page evidence: 30** (every row except 9).
- **Rows with a place URL but incomplete place-page capture: 1** (row 9 — no hours/rating/phone recorded from the page; pin cross-check pending).
- **Rows needing a Maps lookup in Priority A / B / C: 8 / 6 / 17** (= 31 total row-visits, one page per business).
- Definition of done per row: canonical place URL recorded + displayed name/address consistent + (for coordinate rows) pin cross-checked + displayed rating (if any) recorded with a fresh `rating_checked_on`. Even then, **verification stays a human act**: T1 evidence upgrades confidence and resolves spelling/identity questions, but only on-site/phone fieldwork (companion report §6) can produce `independently_confirmed` rows.

**No scraping, no bypassing, no bulk collection.** One manual page visit per business; only permitted references recorded; source terms respected throughout.
