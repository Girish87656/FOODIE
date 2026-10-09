# Foodie — Phase 3G Pre-Import Review Package

**Date:** 2026-10-09 · **Purpose:** the human-approval package for the next import round. **Nothing has been imported; nothing will be imported without explicit human approval.**

**Inputs:** updated `input/research-worksheet-phase3d.csv` (sha256 `721bf9c5…`) · `phase3f-identity-resolution.md` · `phase3f-maps-evidence-update.md` · `research-2026-10-09-phase3f.dry-run.md` · fresh read-only baseline (re-fetched 2026-10-09T15:57:25Z — **14 rows, identical names to the prior snapshot**).
**Companion artifact:** `phase3g-proposed-import-manifest.json` (review artifact only — no executable SQL, no writes).
**Fresh validator run:** `research-2026-10-09-phase3g.dry-run.md` — **25 / 0 / 5 / 1 / 0 buckets · 5 candidate coordinates · 0 errors · 0 warnings.**

**Evidence vocabulary used throughout (objective 9):**
- `directory_reported` — value read from a listing/directory page or snippet (every field in this package).
- `candidate_coordinates` — a directory-published pin, quarantined in validator bucket 6; **never** proof of the exact position.
- `independently confirmed` — visit / call / on-site GPS by a human. **Zero rows in this package have any independently confirmed evidence. Nothing here is labeled verified; the recommended import state for every row is `unverified`.**

**Count note (important):** Phase 3E left seven rows approval-ready; Phase 3F then moved row 20 (Hotel Krishnamoorthy) to a hold but promoted row 23 (Kiran Tiffin Room) when Hold A resolved. The worksheet therefore carries **eight** `distinct_new_business` rows today: the seven surviving candidates **plus** row 23. All eight appear below with row 23 clearly marked as the Phase 3F promotion — the human approver can exclude it with a single strike if "seven" was meant literally.

---

## 1. Human-approval table (8 rows = 7 carried + 1 promoted)

| Row | Candidate | Category | Address (as sourced) | Phone | Hours | Ext. rating (source · date) | Coordinate status | Decision |
| ---: | --- | --- | --- | --- | --- | --- | --- | --- |
| 2 | The Shri Cafe and Restaurant | restaurant | NH 648, Doddaballapur Main Road, Nagadenahalli Village (Snapchat) | +919844929931 | — | 4.5/17 (JD · 2026-10-09) | none | **ready_for_human_approval** |
| 4 | Epicurus Multi Cuisine Restaurant | restaurant | Munilakshmamma, Nagadenahali, Doddaballapura Thaluk, Bengaluru Rural, Karnataka -561 203 (printed menu) | +919035972563 | — (conflict blanked) | — | `candidate_coordinates` (district.in JSON-LD) | **ready_for_human_approval** |
| 8 | Lotus Gardenia | restaurant | Opposite Indian Oil Petrol Bunk, Near Railway Station, Doddaballapur (JD slug) | — | — ("Open 24 Hrs" claim noted) | 4.0/2410 (JD · 2026-10-09) | none | **ready_for_human_approval** |
| 12 | Best Choice Bakery | bakery_sweets | D Cross Rd, Doddaballapur (magicpin) | +919980213680 | — (3-way conflict blanked) | 4.0/386 (magicpin · 2026-10-09) | none | **ready_for_human_approval** |
| 14 | Rainbow Huts Family Restaurant | restaurant | Doddaballapur, Bashettihalli (magicpin) | +918951368020 | — (3-way conflict blanked) | 4.6/49 (magicpin · 2026-10-09) | none | **ready_for_human_approval** |
| 15 | Hotel Bindushree Family Restaurant | restaurant | 7Hh4+Xq9, K.G Govindapura, Bashettihalli (magicpin) | — | — (conflict blanked) | 4.2/5 (magicpin · 2026-10-09) | `candidate_coordinates` (plus-code decode) | **ready_for_human_approval** |
| 17 | Sri Vinayaka Food Point | restaurant | Railway Station, Doddaballapura Locality (magicpin) | +918197052687 | — (conflict blanked) | 4.1/4731 (magicpin · 2026-10-09) | `candidate_coordinates` (district.in JSON-LD) | **ready_for_human_approval** |
| 23 | Kiran Tiffin Room *(promoted in 3F — Hold A resolved)* | tiffin | Kasbhag Rd, near railway station, Doddaballapura (RG) | +919663965135 (3 directories agree) | — (evening claim noted) | 4.8/78 (RG · 2026-10-09) | none | **ready_for_human_approval** |

Every rating above is an **external directory rating** with source URL + check date — strictly separate from Foodie community reviews (none exist; those are trigger-maintained and rejected in imports).

---

## 2. Per-candidate review cards (unresolved uncertainties explicit)

**Row 2 — The Shri Cafe and Restaurant** · Nagadenahalli · zone 1
- Sources: JD listing + JD reviews page (rating) · Snapchat place page (address + phone) · official Instagram `@theshricafeofficial` (cuisine: tiffins, chats, juices, coffee).
- Distinctness: distinct address + phone vs all 14 baseline records.
- Unresolved: opening_hours blank; no coordinates; no Maps place URL; a JD rendering had shown 5.0/17 in the Phase 3D read (today's consistent reading 4.5/17 was recorded).

**Row 4 — Epicurus Multi Cuisine Restaurant** · Nagadenahalli · zone 1
- Sources: district.in full page + structured JSON-LD (geo + hours + phone) · printed menu on Scribd (verbatim address, pincode 561 203) · Instagram `@epicurus_original` (buffet ₹349).
- Distinctness: 3 independent sources agree on name + area + phone.
- Unresolved: opening_hours blank (district structured 10:00–22:00 all days vs JD 12:00–23:00); no directory rating (district shows none); coordinates are `candidate_coordinates` from district.in JSON-LD (note: district's image assets come from a Zomato CDN, so the pin may derive from an aggregator record — still directory-class).

**Row 8 — Lotus Gardenia** · Nagadenahalli / Near Railway Station (both JD tags recorded) · corridor
- Sources: JD listing (4.0/2410 all-time; slug-address) · TripAdvisor restaurant page · hotel-OTA pages (Goibibo 2.9/5 etc. — mixed restaurant+bar+rooms profile).
- Distinctness: different name/address/profile vs all 14 baseline records.
- Unresolved: phone blank; cuisine blank; hours blank (JD "Open 24 Hrs" does not fit the HH:MM-HH:MM field; 3D's "booking hours" caveat stands); no coordinates; the mixed bar+rooms/home-stay profile needs a scope nod from the approver.

**Row 12 — Best Choice Bakery** · Doddaballapur town (D Cross Rd) · corridor per 3C candidacy
- Sources: magicpin verified listing (phone + hours + price) · JD (4.0/392–398) · Restaurant Guru (3.5/393).
- Distinctness: verified phone + distinct address vs all 14 baseline records.
- Unresolved: opening_hours blank — **three-way conflict** (magicpin 10:00–20:00 vs JD 07:00–22:00 vs Instagram 09:00–22:00); no coordinates; no Maps place URL.

**Row 14 — Rainbow Huts Family Restaurant** · Bashettihalli (near NS Convention Hall) · corridor
- Sources: magicpin verified listing (phone) · JD 4.4/12 · Zomato existence-reference only (cuisines noted, no data copied).
- Distinctness: verified phone + distinct address vs all 14 baseline records.
- Unresolved: opening_hours blank — **three-way conflict** (magicpin 11:30–14:00 vs same-phone magicpin double-listing 12:30–22:15 vs Zomato 12:15); the intra-family "Rainbow Huts" double-listing (JD near MLA Krishnappa Layout) is unresolved but does not affect distinctness from the DB; no coordinates.

**Row 15 — Hotel Bindushree Family Restaurant** · Bashettihalli (K.G Govindapura) · corridor
- Sources: magicpin listing (4.2/5, plus-code address) · JD cross-list · Yandex ("Phone number not specified", "No reviews yet", "Open until 10:00 PM").
- Distinctness: name + place corroborated by three directories vs all 14 baseline records.
- Unresolved: phone blank; opening_hours blank (JD 06:00–22:00 vs magicpin 10:00–22:00); **very small rating base (5)**; coordinates are `candidate_coordinates` decoded from the magicpin plus code — the weakest pin derivation of the five.

**Row 17 — Sri Vinayaka Food Point** · Doddaballapura Railway Station · corridor
- Sources: magicpin verified listing (phone, hours-claim, menu items, 4.1/4731 all-source aggregate) · district.in structured page (geo + 12:00–22:00 + 3.9 + ₹300) · two JD listings (station-locality + temple-road verbatim) · Swiggy/Zomato existence-references.
- Distinctness: verified phone + distinct profile vs all 14 baseline records.
- Unresolved: opening_hours blank (magicpin 08:00–21:30 vs district 12:00–22:00); full street address still area-level; the temple-road vs station-locality placement across listings is unreconciled; coordinates are `candidate_coordinates` (see §4).

**Row 23 — Kiran Tiffin Room** · Kasbhag Road · corridor *(Phase 3F promotion — Hold A resolved)*
- Sources: Restaurant Guru (4.8/78, address, price band) · Yandex org page (same phone) · **magicpin VERIFIED listing (page-read: same phone + full address)** · own JD listing "Kiran Tifen Room" · Instagram reel (evening timings 6:30–10 pm — partial, noted only).
- Distinctness: different phone (+91 96639 65135 vs the existing record's +91 80885 99999), different road (Kasbhag Rd vs Scout Camp Rd), different profile (evening pulao vs since-1978 breakfast/meals) — vs all 14 baseline records.
- Unresolved: opening_hours blank (RG: "No info"; the IG evening claim is partial-day); no coordinates; no Maps place URL; RG's slug remains a rename artifact (documented, not an identity link).

---

## 3. Held rows (objective 3 & 4)

| Row | Candidate | State | Why held |
| ---: | --- | --- | --- |
| 20 | Hotel Krishnamoorthy | `possible_duplicate_hold` | Facebook caption by a local food page: *"Sri Ayyappa Tiffin Room, also known as Krishnamurthy Hotel"* + pins ~150 m apart. Different phones (+91 97426 63255 vs +91 80885 99999) and separate magicpin/Mappls listings point the other way; a call to both numbers or an on-site check decides. **Excluded from the manifest.** |
| 1 | GITAM Cafe | `possible_duplicate_hold` | Leaning distinct (own JD listing 3.7 with hours 08:00–21:00; separate Snapchat entry; canteen has two JD listings of its own) but **no distinguishing phone/address** — on-site check pending. **Excluded from the manifest.** |
| 22 | Lakshmi Biriyani Point | `needs_more_research` — **excluded pending current-operation confirmation** | magicpin shutdown banner re-confirmed 2026-10-09 vs live JD listing (4.7/10, hours 09:30–22:00 recorded with a staleness caveat). Call +91 98452 63318 or on-site. **Excluded from the manifest.** |
| 9, 21 | Vaibhava Sweets & Chats; Ganesh Darshan & Chats | `possible_duplicate_hold` | Spelling family / Fort-Rd sibling (9); plus-code conflict + "ganesh" token (21). **Excluded.** |

Mantralaya rows 6 & 24 (`needs_more_research`), Biryani Cafe (5) and Appu Chats (10) (`do_not_import` recommended in 3E), and discovery rows 25–31 (3E recommendations stand) are likewise outside the manifest.

## 4. The two Mantralaya identities — confirmed and address-distinguished (objective 5)

| | Row 6 — Mantralaya Tiifins And Chats | Row 24 — Mantralaya Hotel |
| --- | --- | --- |
| JD listing | `…/Mantralaya-Tiifins-And-Chats-Near-Anjineya-Temple-Doddaballapur/080PXX80-XX80-230328182140-Q5M6_BZDET` | `…/Mantralaya-Hotel-Near-Railway-Station-Doddaballapur/080PXX80-XX80-250115082342-Q8K8_BZDET` |
| Address | **Near Anjineya Temple, Basettihalli** | **Near Railway Station, Doddaballapur** |
| Hours (JD snippets, 2026-10-09) | 06:00–22:00 Mon–Sun | 06:00–21:30 |
| Rating | 4.8 / 15 | none captured |
| Character | chaats/tiffins; breakfast-lunch-dinner | pure-veg eatery |

The addresses distinguish the two listings unambiguously (temple-side Basettihalli vs station-side). The `INTRA_FILE_DUPLICATE` advisory flag stays in the validator report; the human decision recorded is **two distinct businesses**. The Phase 3C name "Mantralaya Hotel & Chats" maps to row 6 by the "& Chats" element — an inference the approver should confirm. Neither row is in the manifest (both remain JD-only, no phones).

## 5. The five quarantined coordinates and their promotion requirements (objective 6)

All five are `candidate_coordinates` (validator bucket 6, `directory_reported`). **None can be promoted by any directory — including Google Maps.** Per WORKFLOW rule 10 and §3, promotion to `independently confirmed` requires evidence that does not derive from a listing: an on-site visit with GPS capture at the exact premises (or an equivalent human field check), recorded with the checker and date, and reviewed by a human.

| Row | Candidate | Pin | Derivation | To promote to independently confirmed |
| ---: | --- | --- | --- | --- |
| 9 | Vaibhava Sweets & Chats | 13.2869155, 77.5747334 | Google Maps place marker (canonical place URL captured; corroborated ~2 m by a YouTube plus code) | On-site GPS at the shop opp. NS Convention Hall, Raghunathapura, matching the pin; the Maps marker can **corroborate** but never promote |
| 4 | Epicurus Multi Cuisine Restaurant | 13.2852505, 77.598904 | district.in structured JSON-LD geo (aggregator-class) | On-site GPS at Munilakshmamma, Nagadenahalli; confirm the pin is on the premises, not a centroid |
| 17 | Sri Vinayaka Food Point | 13.279693, 77.5515242 | district.in structured JSON-LD geo | On-site GPS **after** settling which premises is right (station-locality vs temple-road JD listings) |
| 15 | Hotel Bindushree | 13.2799, 77.556969 | Plus code `7Hh4+Xq9` decoded from magicpin's address field (weakest derivation) | On-site GPS at K.G Govindapura; treat the pin as area-level until then |
| 20 | Hotel Krishnamoorthy | 13.280305, 77.551956 | Mappls page payload (OD43DN) | **Gated by the hold:** if same-as-Ayyappa, the pin never imports; if distinct, on-site GPS on Scout Camp Road + the two phone calls |

## 6. Baseline recheck (objective 7)

The read-only validator was run against a **freshly re-fetched baseline** (single GET, zero writes, 2026-10-09T15:57:25Z): **14 rows, names identical** to the Phase 3D/3F snapshot. Result: **0 existing-record matches, 0 errors, 0 warnings** — none of the eight approval candidates duplicates any of the 14 live records under any spelling (the 3E token-overlap audit + 3F resolutions stand; the only live-name collisions ever found were the held rows 1 and 20).

## 7. Remaining work to expand discovery coverage in the agreed zones (objective 10)

1. **Maps place-page lookups** (per `phase3e-maps-evidence-gaps.md`, still valid): 0 of 8 approval rows have a Maps place URL; priorities A (8 rows) / B (holds) / C (17 rows) unchanged. Manual, ToS-compliant visits only.
2. **Phone confirmations that harden the manifest**: Kiran hours (row 23), Epicurus hours decision (row 4), Best Choice & Rainbow Huts hours (rows 12/14), Bindushree phone (row 15), Lotus Gardenia phone (row 8), Shri Cafe hours (row 2), Sri Vinayaka placement (row 17).
3. **Holds to settle**: Krishnamoorthy↔Ayyappa (two calls / on-site), GITAM Cafe (campus-edge on-site), Lakshmi open/closed (+91 98452 63318), Vaibhava↔Vybhava Fort Rd (on-site), Ganesh Darshan location (on-site).
4. **Research queue** (unchanged, 40+ names in `phase3d-research-log.md`): La Reserve Lounge, Burger Time, Bbq Junction, Five Star Chicken (Tubagere), Shawarma Cartel, Rajashree Veg & Non-Veg, Maha Naati Ruchi, PALAV RAMU, Udupi Upahar, Hasanamba Iyengar Bakery, Durgashree Samruddhi Grand, Desi Family Dhaba, Diamond Zoop Cafe, Five Star Kohli Hut, etc. — none checked, none claimable.
5. **New in-zone lead from 3F**: **Abhis Food Court** (Railway Station, Scout Camp Road; ₹300 for two; opens 5:00 PM; +91 63616 95837; magicpin 4.9/1; Zomato listing exists) — observed during Hold-D' research, deliberately not added to the worksheet; a ready first candidate for the next discovery round.
6. **Coverage honesty (carried from 3D)**: no systematic street-by-street walk of Nagadenahalli or Scout Camp/Kasbhag Road has been done; the GITAM campus interior remains unenumerated; no claim of exhaustive coverage is made.

---

## 8. Approval checklist for the human

- [ ] Approve / amend / strike each of the 8 rows in §1 (strike row 23 if "seven" was literal).
- [ ] Confirm row 8's mixed bar+rooms profile is in pilot scope.
- [ ] Confirm the row-6 3C-name mapping inference (§4).
- [ ] Choose the next action for the holds (§3) and the five candidate pins (§5).
- [ ] Only after approval: a separate, reviewed import SQL path is prepared (never by this tool) — all rows enter as `unverified`, missing values as NULL, community-rating fields untouched.

**Safety: no live Supabase writes or migrations; no app source changes; no commits/pushes/deployment; no secrets; no executable write SQL anywhere; nothing imported. STOP — explicit human approval required.**
