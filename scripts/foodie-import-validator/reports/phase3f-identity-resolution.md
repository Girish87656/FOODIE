# Foodie — Phase 3F Identity Resolution

**Date:** 2026-10-09 (later the same day as Phases 3D/3E) · **Method:** 17 targeted web searches + 8 page reads, all permitted public sources (Justdial/magicpin/district.in/Restaurant Guru/Yandex/Snapchat/Instagram/Facebook **snippets**, official bios, printed menu). No scraping, no paywalled or gated content, no paid APIs, no bypassing of access restrictions. Google Maps was not scraped.

**Inputs:** `phase3e-human-review.md` · `phase3e-maps-evidence-gaps.md` · `input/research-worksheet-phase3d.csv` · `WORKFLOW.md`

**Worksheet changes:** applied where new evidence supported them (row-by-row change log in `phase3f-maps-evidence-update.md`). Updated dry-run: `research-2026-10-09-phase3f.dry-run.md` — 0 errors · 0 warnings.

---

## 1. Resolution summary

| Hold | Phase 3E state | Phase 3F outcome |
| --- | --- | --- |
| A. Kiran Tiffin Room vs existing Ayyappa Tiffin Room | possible_duplicate_hold | **RESOLVED — distinct.** Row 23 → `distinct_new_business` |
| B. GITAM Cafe vs GITAM University Canteen | possible_duplicate_hold | **Improved, hold kept** (leaning distinct; still no distinguishing phone/address) |
| C. Mantralaya pair (rows 6/24) | possible_duplicate_hold ×2 | **RESOLVED — two distinct listings.** Row 6 → `needs_more_research` (with hours + mapping inference documented); row 24 → `needs_more_research` |
| D. Amrutha Food Court vs existing Abhiram Food Court | flagged in 3E | **RESOLVED — distinct.** Row 26 evidence updated |
| E. Lakshmi Biriyani Point operating status | needs_more_research (closure hold) | **UNRESOLVED** — both signals re-confirmed today; JD hours recorded; phone check remains decisive |
| **F. NEW: Hotel Krishnamoorthy (row 20) vs existing Ayyappa Tiffin Room** | ready_for_human_approval | **NEW HOLD** — row 20 → `possible_duplicate_hold` (alias claim + ~150 m proximity) |

Decision roll-up after 3F (31 rows): `distinct_new_business` 8 (rows 2, 4, 8, 12, 14, 15, 17, 23) · `needs_more_research` 12 (rows 3, 5, 6, 7, 10, 11, 13, 16, 18, 19, 22, 24) · `possible_duplicate_hold` 4 (rows 1, 9, 20, 21) · blank (discovery rows, 3E recommendation stands) 7 (rows 25–31) · `do_not_import` recommended for rows 5, 10 per the 3E report.

---

## 2. Hold A — Kiran Tiffin Room vs Ayyappa Tiffin Room → **RESOLVED: distinct**

**What settled it:** both businesses have their own separate Justdial listings, separate phones, separate locations on different station-corridor roads, and completely different profiles.

| | Kiran Tiffin Room (row 23) | Ayyappa Tiffin Room (existing `02a34d5f`) |
| --- | --- | --- |
| Justdial | Own listing "Kiran Tifen Room", Near Railway Station (id `080PXX80-XX80-170928175119`) | Own listing "Ayyappa Tifin Room" (id `080PXX80-XX80-170928162242`), **4.0 / 580 reviews**, hours 7:00 am – 9:00/10:00 pm |
| Phone | **+919663965135 — three directories agree**: Restaurant Guru, Yandex, and a **magicpin VERIFIED listing (page-read today)** | +918088599999 (DB; Yandex org page agrees) + 8722593803 / 7348832292 (Instagram reels) |
| Place | Kasbhag Rd, near railway station, K.G Govindapura, 562163 (magicpin) | Scout Camp Rd, near railway station (DB; Instagram reel gives the same road) |
| Profile | Evening pulao spot — Instagram reel: "Timings: 6-30pm to 10pm" (partial-day claim, **not** recorded as opening_hours) | "Breakfast & meals legend since 1978" (Facebook + Instagram reels by local page *Nammuru Doddaballapura*); South-Indian breakfast identity |

**RG slug explained:** Restaurant Guru's URL slug `Aiyappa-Tiffin-Center-Doddaballapura` under a page titled "Kiran Tiffin Room" is a rename artifact of RG's own listing — it does not tie Kiran to the existing record. A third same-name family, **Swamy Ayyappa Tiffan Centre** (Mallathahalli, Dabaspet Rd), is unrelated.

**Worksheet:** row 23 `review_decision` → `distinct_new_business`; uncertainty notes rewritten with the full evidence chain; magicpin page-read + both JD listing URLs cited.

---

## 3. Hold B — GITAM Cafe vs GITAM University Canteen → **improved; hold kept (leaning distinct)**

New evidence (2026-10-09):
1. **The canteen itself has TWO separate JD listings** ("Gitam University Canteen, Heggadahalli", ids `…231118160725-V3I8` and `…231204171807-K5Y1`; the second gives the address "Byradenahalli, Doddaballapur Road, Heggadahalli").
2. **"Gitam Cafe" has its own JD listing** (id `9999P8152-8152-240418121301-Y3M3`, rating 3.7) **with its own categories/hours page showing 8:00 am – 9:00 pm** — hours now recorded on row 1 (`08:00-21:00`, JD categories-page snippet).
3. **"GITAM Cafe" is a brand name GITAM uses at other campuses** — e.g. an official-posted GITAM Cafe at Abbigere, Bengaluru 560015 (12 PM–10 PM) — a **different city; do not confuse** with the Doddaballapura listing.

**Why the hold stays:** two independent platforms (JD + Snapchat's place-nearby list) list "Gitam Cafe" apart from the canteen, and the JD listing has its own rating and hours — but the candidate still has **no distinguishing phone or street address**, and JD demonstrably multi-lists this campus. WORKFLOW rule 6's bar for a `distinct_new_business` call (different address AND different phone AND/OR clearly different business at a distinct location) is not yet met on paper.

**Settled by:** on-site check at the campus edge (Heggadahalli side) or any phone for the cafe listing.

---

## 4. Hold C — Mantralaya pair → **RESOLVED: two distinct listings**

Today's snippets completed both listings:

| | Row 6 — "Mantralaya Tiifins And Chats" | Row 24 — "Mantralaya Hotel" |
| --- | --- | --- |
| Address | Near Anjineya Temple, Basettihalli | Near Railway Station |
| Hours (JD snippets, today) | **6:00 am – 10:00 pm Mon–Sun** (recorded on row 6) | 6:00 am – 9:30 pm (re-confirmed) |
| Rating | 4.8 / 15 (re-confirmed) | none captured |
| Character | chaats/tiffins, breakfast-lunch-dinner | pure-veg hotel (eatery) |

**Resolution:** distinct names, addresses, hours and listings — the `INTRA_FILE_DUPLICATE` pair is two real businesses, not one double-listed shop. The Phase 3C candidate name "Mantralaya Hotel **& Chats**" matches row 6's listing on the "& Chats" element — recorded as an **inference for the human reviewer to confirm** (the 3C grouping "Near GITAM/Nagadenahalli" matches neither listing). Neither row is ready: both remain JD-only, snippet-level, no phones. Row 6 → `needs_more_research` (with hours), row 24 → `needs_more_research`. Unrelated same-name family excluded: vyaparify "Manthralayahotel" (lodging), Bengaluru "Mantralaya Cafe" (12th Cross).

---

## 5. Hold D — Amrutha Food Court vs existing Abhiram Food Court → **RESOLVED: distinct**

- **Amrutha Food Court** — own JD listing (Nagadenahalli, id `…221230011506-V3T1`, created 2022-12-30); rating renderings **conflict (3.0/46 vs 3.2/48) → left blank** per the conflict rule.
- **Abhiram Food Court** (existing, Moparahalli) — own JD listing (id `…240328201241-R7U4`, created 2024-03-28, **4.0/5**); an Instagram popular page states coordinates **13.284964, 77.596301 — matching the DB record (13.2849612, 77.5963066)**.
- Different listings, ratings, localities and creation dates. The 3E spelling-similarity flag is closed. Row 26 evidence updated; row stays `needs_more_research` (still no phone/address). Unrelated family excluded: "Amrutha Multi Cuisine Restaurant" (Sarjapur Rd, Bengaluru).

---

## 6. Hold E — Lakshmi Biriyani Point operating status → **UNRESOLVED (honestly)**

Re-checked today:
- magicpin page **re-read**: the banner **"The outlet has shutdown" is still displayed** (page renders "October, 2026"; verified listing, phone 9845263318, ₹500 for two).
- Justdial listing **still live**: rating 4.7/10 unchanged, and its snippet now shows **structured hours "9:30 am – 10:00 pm"** — recorded on row 22 (`09:30-22:00`, JD source) with an explicit caveat that these are a live listing's claim and may be stale if the outlet has closed.

**Bottom line:** the two signals still contradict; remote sources cannot settle open-vs-closed. The call to **+91 98452 63318** (or an on-site pass on the station corridor) remains the decisive step. Row stays `needs_more_research`; no rating/status was invented or resolved by assumption.

---

## 7. Hold F — **NEW: Hotel Krishnamoorthy (row 20) vs existing Ayyappa Tiffin Room → possible_duplicate_hold**

Discovered during the evidence round: a Facebook video caption by the local Doddaballapura food page *Nammuru Doddaballapura* describes **"Sri Ayyappa Tiffin Room, also known as Krishnamurthy Hotel, a family-run establishment founded in 1978."**

| Supports SAME business | Supports DISTINCT |
| --- | --- |
| Explicit alias claim in the FB caption ("also known as Krishnamurthy Hotel") | Different phones: magicpin verified **+919742663255** vs existing record's **+918088599999** |
| Pins ~150 m apart on the same road: Mappls 13.280305, 77.551956 vs DB 13.279913, 77.552234 | Separate magicpin VERIFIED listing with its own menu and hours (10:00–22:00, re-confirmed today) |
| Both South-Indian station-cluster eateries | Separate Mappls place entry (OD43DN, pincode 562163, DIGIPIN 4PF-T72-7L8F); no JD listing for "Hotel Krishnamoorthy" surfaced |
| | "Krishnamurthy" may be the **founder's name**, not a trading alias (common Karnataka pattern) |

**Action taken:** row 20 downgraded `distinct_new_business` → `possible_duplicate_hold` (worksheet + this report). The Phase 3E ready-list loses row 20 (7 ready remain). A call to both numbers or an on-site check decides. **Nothing was declared same-as-existing or verified** — the row waits.

Related tool behaviour: the fresh directory pins for rows 17 and 20 (~85 m apart in the station cluster) triggered a new advisory `INTRA_FILE_DUPLICATE` flag (17↔20) in the phase-3f dry-run. That is **proximity, not identity evidence** — different names, phones, listings; recorded as understood-and-accepted in the report.

---

## 8. What was accessible (and what wasn't)

- **Readable today:** magicpin listing pages (Kiran, Lakshmi), district.in structured pages (Epicurus, Sri Vinayaka — JSON-LD with geo/hours/phone), Yandex org pages (Bindushree, Ayyappa), Justdial/Instagram/Facebook **search snippets**, the Google Maps short-link **preview payload** for row 9.
- **Not accessible:** Justdial page bodies (anti-bot; snippet-level only), YouTube Shorts page body (empty via page reader), Facebook page bodies (login wall — snippet-level only), Google Maps as an interactive/searchable service (JS wall; no scraping — see the maps-evidence report).

## 9. Observed, deliberately NOT added (queue note)

- **Abhis Food Court** — Railway Station, Scout Camp Road, Doddaballapura (₹300 for two, opens 5:00 PM, +916361695837, magicpin 4.9/1; Zomato listing exists). An in-zone lead surfaced while researching Abhiram/Amrutha. Adding discovery rows is outside Phase 3F's scope — logged here for a future research phase; no worksheet row was created and nothing is claimed beyond the cited snippets.

**Nothing was imported, no SQL was written, no app code / schema / live data was touched. STOP for human review.**
