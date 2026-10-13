# Foodie — Phase 3F Maps Evidence Update

**Date:** 2026-10-09 · Companion to `phase3f-identity-resolution.md`
**Scope:** what changed for the eight `ready_for_human_approval` candidates' Maps evidence, what the environment can and cannot legitimately access, and the exact worksheet change log. **No scraping; no access restriction bypassed; nothing labeled verified without adequate evidence.**

---

## 1. Google Maps accessibility state (re-tested today)

| Question | Answer (2026-10-09) |
| --- | --- |
| Can Maps place pages be read at all? | **Partially.** Re-opening the known public short link (row 9) returned the place preview payload (207 KB) — "Enable JavaScript to see Google Maps" wall is present, but the payload carries the place's canonical URL, CID, feature id and marker coordinates. Same mechanism Phase 3D used. |
| Did any of 17 new web searches surface a Maps place URL for the 8 candidates? | **No. Zero** Maps URLs of any kind appeared in the search results (`maps.app.goo.gl` / `google.com/maps` — none). |
| Can a Maps place URL be constructed or searched for? | **No.** Searching Maps as a service is not possible without scraping/bypassing; constructing query URLs proves nothing (WORKFLOW rule 4 — the validator rejects `/maps/search/`-style URLs). |
| Do other readable pages embed Maps links? | Only **query URLs** — e.g. district.in's `hasMap` is `maps.google.com/?q=<name>` (a query, not a place page). Correctly **not recorded** as Maps evidence. |

**Bottom line (objective 4 honored):** for the eight candidates, **direct Google Maps place-page evidence remains UNAVAILABLE through permitted means.** Nothing below claims otherwise; the improvements recorded are from other independent public sources, and every one of them is labeled `directory_reported`. Row 9's existing Maps evidence (not one of the eight) was re-confirmed and strengthened.

---

## 2. Row 9 — Vaibhava Sweets & Chats (Maps evidence strengthened)

The public short link (`https://maps.app.goo.gl/rPxFWqwwEaH2o4Wr8`, published in a public YouTube video description) was **re-opened today**; its preview payload yielded the **canonical place URL**, now recorded in `maps_listing_url`:

```
https://www.google.com/maps/place/Vaibhava+Sweets%26Chats/@13.2894872,77.5378,14z/data=!4m7!3m6!1s0x3bb1e1fef9f204d5:0xcbcea14369c0d063!8m2!3d13.2869155!4d77.5747334!16s%2Fg%2F11j8w16cbc
```

- Carries CID `0x3bb1e1fef9f204d5:0xcbcea14369c0d063`, feature `/g/11j8w16cbc`, and marker `!3d13.2869155!4d77.5747334` — **exactly matching the recorded candidate pin**.
- Google's own search-context token inside the payload decodes to *"vybhava sweets doddaballapura photos"* — corroborating the Vaibhava/Vybhava spelling family (the Fort Rd "Vybhava Sweets" question stays open; row 9 remains `possible_duplicate_hold`).
- The short link is preserved in the row's notes as the provenance source.
- The pin is still **directory-reported (T3), awaiting confirmation** — a Maps payload is not field verification.

---

## 3. The eight ready candidates — evidence status after Phase 3F

| Row | Candidate | Maps place-page evidence | Other independent-source improvements recorded today | Decision |
| ---: | --- | --- | --- | --- |
| 2 | The Shri Cafe and Restaurant | **UNAVAILABLE** (none found) | Rating **4.5/17 recorded** (JD reviews page; resolves the 3D 4.5-vs-5.0 conflict — 5.0 rendering noted); cuisine from the official Instagram bio (tiffins, chats, juices, coffee) | distinct_new_business |
| 4 | Epicurus Multi Cuisine Restaurant | **UNAVAILABLE** (page has only query-URLs) | **Coordinates recorded (13.2852505, 77.598904)** from district.in structured data (JSON-LD); address upgraded to the printed-menu verbatim incl. pincode 561 203; district structured hours 10:00–22:00 documented → still conflicts JD 12:00–23:00 → **hours stay blank** | distinct_new_business |
| 8 | Lotus Gardenia | **UNAVAILABLE** | JD "Open 24 Hrs" claim noted (not recorded — format + booking-hours caveat); rating-count drift 2410→2404 noted; TripAdvisor page + hotel-OTA pages (Goibibo 2.9/5 etc.) corroborate the restaurant+bar+rooms profile | distinct_new_business |
| 12 | Best Choice Bakery | **UNAVAILABLE** | JD structured hours 07:00–22:00 surfaced → **three-way hours conflict (magicpin 10:00–20:00 / JD 07:00–22:00 / IG 09:00–22:00) → hours BLANKED** per the conflict rule (prior value preserved in the note); JD 4.0/392–398 drift noted | distinct_new_business |
| 14 | Rainbow Huts Family Restaurant | **UNAVAILABLE** | Second magicpin listing "Rainbow Huts" (12:30–22:15) **with the same phone +918951368020** → same business double-listed; **three-way hours conflict → hours BLANKED**; Zomato cuisines as existence-reference | distinct_new_business |
| 15 | Hotel Bindushree Family Restaurant | **UNAVAILABLE** | Yandex org page re-read: "Phone number not specified", "No reviews yet", "Open until 10:00 PM" only — **no new fields**; hours conflict stands (blank); plus-code pin unchanged (T3) | distinct_new_business |
| 17 | Sri Vinayaka Food Point | **UNAVAILABLE** | **Coordinates recorded (13.279693, 77.5515242)** from district.in structured data; magicpin 08:00–21:30 vs district structured 12:00–22:00 → **hours BLANKED**; JD Basettihalli verbatim address line documented; Zomato 4.3/4,930 noted as existence-reference only | distinct_new_business |
| 20 | Hotel Krishnamoorthy | **UNAVAILABLE** | magicpin hours 10:00–22:00 re-confirmed; **BUT a Facebook alias claim ("Ayyappa Tiffin Room, also known as Krishnamurthy Hotel") + ~150 m proximity to the existing record → row moved to `possible_duplicate_hold`** (see identity report, Hold F) | **possible_duplicate_hold** |

**Net:** 7 of 8 remain `ready_for_human_approval`; row 20 is held. **Zero of the eight received direct Google Maps place-page evidence** — every improvement is other-directory evidence, properly sourced and quarantined where it is a coordinate.

---

## 4. New coordinates and the conflict rule (nothing invented)

- Rows 4 and 17 now carry **district.in structured geo** — recorded with `coordinates_source_url`, `evidence_level=directory_reported`. They join rows 9, 15, 20 in bucket 6 ("candidate coordinates awaiting confirmation"), which grew **3 → 5**. None is verified; all five await on-site confirmation.
- Hours conflicts (rows 12, 14, 17) were **blanked, not averaged**: where a new source contradicted a previously recorded hours value, the field went empty and every claim (with sources) was preserved in the uncertainty notes — the same blank-means-unknown discipline as Phase 3D.
- Row 2's rating 4.5/17 and row 1's hours 08:00–21:00 and row 22's hours 09:30–22:00 were **added only where a source shows them**; row 22's hours carry an explicit staleness caveat (shutdown banner).

---

## 5. Worksheet change log (all changes evidence-backed)

| Row | Fields changed | Change |
| ---: | --- | --- |
| 1 GITAM Cafe | opening_hours, hours_source_url, uncertainty_notes, notes | +hours 08:00–21:00 (JD categories snippet); hold kept, evidence documented |
| 2 The Shri Cafe | listing_rating, listing_review_count, rating_source_url, rating_checked_on, cuisine, uncertainty_notes, notes | +4.5/17 (JD); +cuisine (official IG bio) |
| 4 Epicurus | latitude, longitude, coordinates_source_url, address, address_source_url, uncertainty_notes, notes | +district geo (T3); address → printed-menu verbatim (Scribd) |
| 6 Mantralaya H&C | opening_hours, hours_source_url, uncertainty_notes, notes | +hours 06:00–22:00 (JD snippet); distinctness from row 24 documented; decision → needs_more_research |
| 8 Lotus Gardenia | uncertainty_notes, notes | "Open 24 Hrs" claim + count drift + TripAdvisor/OTA corroboration |
| 9 Vaibhava | maps_listing_url, uncertainty_notes, notes | canonical /maps/place/ URL; payload details; spelling token |
| 12 Best Choice | opening_hours (→ blank), hours_source_url (→ blank), uncertainty_notes, notes | 3-way conflict → blanked |
| 14 Rainbow Huts | opening_hours (→ blank), hours_source_url (→ blank), uncertainty_notes, notes | 3-way conflict + same-phone double listing → blanked |
| 15 Hotel Bindushree | uncertainty_notes, notes | Yandex re-read outcome (no new fields) |
| 17 Sri Vinayaka | latitude, longitude, coordinates_source_url, opening_hours (→ blank), hours_source_url (→ blank), uncertainty_notes, notes | +district geo (T3); hours conflict → blanked; JD address line; Zomato existence-ref |
| 20 Hotel Krishnamoorthy | review_decision (→ possible_duplicate_hold), uncertainty_notes, notes | NEW HOLD (FB alias + proximity) |
| 22 Lakshmi Biriyani Point | opening_hours, hours_source_url, uncertainty_notes, notes | +JD hours 09:30–22:00 with staleness caveat; banner re-confirmed; hold stands |
| 23 Kiran Tiffin Room | review_decision (→ distinct_new_business), uncertainty_notes, notes | Hold A resolved (3-directory phone agreement, separate JD listings, distinct profiles) |
| 24 Mantralaya Hotel | review_decision (→ needs_more_research), uncertainty_notes, notes | distinctness from row 6 documented |
| 26 Amrutha Food Court | uncertainty_notes, notes | Amrutha↔Abhiram resolved DISTINCT; rating conflict blanked |

Untouched: rows 3, 5, 7, 10, 11, 13, 16, 18, 19, 21, 25, 27–31 (no new evidence sought or found in scope).

---

## 6. Validator & tests (all re-run after the worksheet changes)

- `research-2026-10-09-phase3f.dry-run.md` (+ `.json`): **25 potential-new / 0 existing-matches / 5 possible-duplicates / 1 insufficient / 0 invalid · 0 errors · 0 warnings**, bucket-6 coordinates **5** (rows 4, 9, 15, 17, 20 — all directory-reported).
  - The 5 duplicate rows: 1 (GITAM Cafe, low-confidence existing match — Hold B), 6↔24 (resolved as distinct listings; advisory flag stands), **17↔20 (NEW advisory flag — proximity artifact of the two fresh pins, ~85 m apart; different names/phones/listings — understood and accepted)**.
  - Row 20's manual hold (Hold F) and row 23's resolution (Hold A) are recorded in `review_decision`; the tool's buckets remain advisory, as designed.
- All 6 test fixtures re-run: **byte-identical** to their Phase 3D outputs (validator code untouched). Zero-write proof: **PASS** (single GET, no write verbs).
- `bun run lint`: exit 0.

**No live Supabase writes or migrations; no changes to `src/`, auth, reviews or AI pipeline; nothing imported; no secrets in any report. STOP for human review.**
