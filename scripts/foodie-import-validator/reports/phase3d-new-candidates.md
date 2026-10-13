# Foodie — Phase 3D Newly Discovered / Researched Candidates

**Date:** 2026-10-09 · All rows are `directory_reported`, `unverified`, and NOT
imported. "New" below means *new to the research worksheet*, and — where
`distinct_new_business` is recorded — *affirmatively not any of the 14 existing
records* (different address and/or phone, corroborated by ≥2 sources). It never
means "verified" or "import-approved".

## A. Phase 3C candidates with researched evidence (22 rows)

### Distinct-new-business calls (8) — distinct address/phone vs all existing records, ≥2 corroborating sources
| Row | Candidate | Key evidence (source, 2026-10-09) |
| ---: | --- | --- |
| 2 | The Shri Cafe and Restaurant | JD + Snapchat place page: NH 648, Nagadenahalli; +91 98449 29931 |
| 4 | Epicurus Multi Cuisine Restaurant | district.in + printed menu (Scribd) + Instagram: Munilakshmamma, Nagadenahalli; +91 90359 72563; ₹300 for two |
| 8 | Lotus Gardenia | JD (4.0/2410) + TripAdvisor mention: opp. Indian Oil Petrol Bunk, near Railway Station; bar+rooms |
| 12 | Best Choice Bakery | magicpin verified (4.0/386, +91 99802 13680, 10:00–20:00) + JD (4.0/398): D Cross Rd |
| 14 | Rainbow Huts Family Restaurant | magicpin verified (4.6/49, +91 89513 68020) + JD (4.4): Bashettihalli, near NS Convention Hall |
| 15 | Hotel Bindushree Family Restaurant | magicpin (4.2/5, plus-code address) + JD + Yandex: K.G Govindapura, Bashettihalli |
| 17 | Sri Vinayaka Food Point | magicpin verified (4.1/4731, +91 81970 52687, 08:00–21:30) + district.in + JD: Railway Station locality |
| 20 | Hotel Krishnamoorthy | magicpin verified (4.3/2, +91 97426 63255, 10:00–22:00) + Mappls (pin 13.280305, 77.551956): Scout Camp Rd |

### Needs-more-research calls (11)
| Row | Candidate | Why |
| ---: | --- | --- |
| 3 | Garuda Cafe Restaurant | JD-only; area (A N Hosahalli) confirmed in-area, no address/phone |
| 7 | Venture's Hungry Birds | no dedicated listing anywhere; cross-lists only |
| 10 | Appu Chats | only listing is Tubugere — outside target zones |
| 11 | Iyengar's Cake N Bake | rating 4.0/95 but no address captured; spelling variants |
| 13 | Wild Woods BBQ Grill & Chill | name variant + zone placement inferred from index address blocks |
| 16 | Karavali Hotel | two JD pages (restaurant + lodging); canonical identity unresolved |
| 18 | Hotel Radha | two same-family JD listings (Hotel Radha / New Hotel Radha) |
| 19 | Siri Chicken Centre | raw-chicken retailer — no pilot category; category left blank |
| 21 | Ganesh Darshan & Chats | held (duplicate-token + conflicting plus code) — see duplicates report |
| 22 | Lakshmi Biriyani Point | **closure signal**: magicpin banner "The outlet has shutdown"; JD still live (4.7/10) |
| 23 | Kiran Tiffin Room | held (RG slug vs existing Ayyappa Tiffin Room) — see duplicates report |

### Held (possible_duplicate_hold): rows 1 (GITAM Cafe), 6, 9, 21, 23 — details in `phase3d-matches-and-duplicates.md`.
*(Rows 1/9/21/23 are part of the 20 above; the split here is by decision column.)*

## B. In-zone discoveries added to the worksheet (8 rows)
| Row | Candidate | Zone | Evidence captured |
| ---: | --- | --- | --- |
| 24 | Mantralaya Hotel (pure veg) | 2 — near Railway Station | JD listing; hours 06:00–21:30 |
| 25 | Ss Food Cafe | 1 — Nagadenahalli (opp. SBI) | JD listing title only |
| 26 | Amrutha Food Court | 1 — Nagadenahalli | JD listing title only |
| 27 | Siri Bucket Biriyani | 2 — Thammasettihalli / Scout Camp Rd | JD index: 3.9/17, opp. Bank of India |
| 28 | Sanje Time Veg Restaurant & Chaats | 2 — Kasbhag | JD: 4.0/2 |
| 29 | Hoysala Family Restaurant | edge — Doddaballapur town (zone unconfirmed) | JD: 4.0/331; cuisine; menu index |
| 30 | Grillland | 2-ish — Basettihalli | JD listing title only |
| 31 | Rajanna Nati Style Biryani | 2 — Bhuvaneswari Nagar (station area) | JD biryani index address row |

## C. Validator classification (dry-run `research-2026-10-09`)
- Potential new businesses: **27** (rows 2, 3, 4, 7–20, 22, 23 and discovery rows
  25–31)
- Possible duplicates / ambiguous: **3** (rows 1, 6, 24)
- Insufficient evidence: **1** (row 5, Biryani Cafe)
- Invalid rows: **0** — errors 0, warnings 0
- Candidate coordinates awaiting confirmation: **3** (rows 9, 15, 20)

## D. Observed but intentionally NOT added (research queue — 40+ names)
See the closing section of `phase3d-research-log.md`. None of them has been
checked out, and none may be treated as new or absent.
