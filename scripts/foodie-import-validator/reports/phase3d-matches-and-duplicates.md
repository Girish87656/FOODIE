# Foodie — Phase 3D Existing Matches & Possible Duplicates

**Date:** 2026-10-09 · Companion to `research-2026-10-09.dry-run.md` (v1.1.0, 0 errors / 0 warnings).

Tool matching is advisory; human-readable decisions live in the worksheet's
`review_decision` column. Nothing was merged, updated or imported.

---

## 1. Existing records PRESERVED (never imports)

The 12 Phase 3C name-matched candidates remain existing records and were excluded
from the Phase 3D worksheet by design (a second record is forbidden):

| Existing record (`id…`) | Name | Live locality |
| --- | --- | --- |
| `f37d212b` | SS Hyderabadi Biriyani Zone | Nagadenahalli |
| `973a6f0e` | Amigos Cafe | Nagadenahalli |
| `c3936dec` | Abhiram Food Court | Moparahalli |
| `7259037f` | GITAM University Canteen | GITAM campus |
| `02a34d5f` | Ayyappa Tiffin Room | Doddaballapura Railway Station |
| `f74252ef` | Sri Annapoorneshwari Tiffin Center | Doddaballapura town |
| `987dad98` | Shri Manjunatha Grand Veg | Doddaballapura Railway Station |
| `343812c9` | Brundavana Family Restaurant | Scout Camp Road |
| `5218d019` | Chickpet Donne Biryani House | NULL |
| `e6ba7907` | Hotel Halli Nanasu | Doddaballapura town |
| `e989603f` | Hotel Royal Nandhana | Arehalli Guddadahalli |
| `fe248fda` | Priyanka Tiffen Center | Doddaballapura town |

Also existing and untouched: `Sri Ganesh Grand` (`60cc569b`, Bashettihalli) and
`The Biryani Shack` (`3f25ba72`, Heggadahalli, outlier ~12 km).

## 2. Tool-flagged duplicates in this run (3)

| Row | Candidate | Flag | What the tool found | Human action recorded |
| ---: | --- | --- | --- | --- |
| 1 | GITAM Cafe | proper-token "gitam" + `LOCALITY_CONFLICT` | low-confidence match to `7259037f` GITAM University Canteen | `possible_duplicate_hold` — field research must establish distinct address/phone/listing or sameness |
| 6 | Mantralaya Hotel & Chats | `INTRA_FILE_DUPLICATE` (row 24) | name-subset of the new discovery row "Mantralaya Hotel" | `needs_more_research` — two real JD listings; which one the 3C candidate meant is unresolved |
| 24 | Mantralaya Hotel | `INTRA_FILE_DUPLICATE` (row 6) | as above | undecided (discovery row) |

## 3. Identity hazards found during research (tool silent — human must still decide)

1. **Kiran Tiffin Room (row 23) ↔ existing `Ayyappa Tiffin Room` (`02a34d5f`).**
   Restaurant Guru's URL slug is `Aiyappa-Tiffin-Center-Doddaballapura` while the
   page is titled "Kiran Tiffin Room" — RG appears to have renamed a former
   "Aiyappa Tiffin Center" listing. Kiran's address (Kasbhag Rd, near railway
   station) sits in the same station cluster as the existing record (Scout Camp
   Road, near railway station). Different phone (+91 96639 65135 vs +91 80885
   99999). Held: `possible_duplicate_hold`; explicit human disambiguation required
   before any import.
2. **Ganesh Darshan & Chats (row 21) ↔ existing `Sri Ganesh Grand` (`60cc569b`).**
   Shares the proper token "ganesh" (tool did not flag: containment below
   threshold). Different name and area, but a distinguishing phone/address is
   still needed; a plus code published by chotu decodes ~2 km away from JD's
   "Opposite Railway Station" placement. Held: `possible_duplicate_hold`.
3. **Vaibhava Sweets & Chats (row 9) ↔ magicpin "Vybhava Sweets" (Fort Rd).**
   Spelling family Vaibhava/Vybhava/Vaibhav appears across Google Maps, YouTube,
   Instagram and Justdial; the Fort Rd magicpin entry (+91 8027622143, 4.2/55) may
   be a distinct older shop. Not merged; held: `possible_duplicate_hold`.
4. **Hotel Radha (row 18) ↔ "New Hotel Radha" (JD).** Exact-name listing sits in
   Govindapura (06:00–21:00); "New Hotel Radha" (5.0/11) is near the railway
   station — rename or two branches, unresolved. Held: `needs_more_research`.
5. **Rainbow Huts Family Restaurant (row 14) ↔ JD "Rainbow Huts" (near MLA
   Krishnappa Layout).** Possibly the same business double-listed. Distinctness
   vs existing records is well supported (distinct address+phone); the intra-family
   question is recorded in uncertainty notes.
6. **Epicurus (row 4):** JD carries a second listing under Adhinarayanahosahall;
   the phone is tied to Nagadenahalli by district.in + the printed menu — likely a
   JD double listing. Recorded in uncertainty notes.
7. **Biryani Cafe (row 5):** generic name; tool matched it toward existing `The
   Biryani Shack` territory but it landed in *insufficient evidence* — correctly
   treated as unresolved, not new.
8. **"Ss Food Cafe" (row 25)** shares the token "ss" with `SS Hyderabadi
   Biriyani Zone`; **Siri Bucket Biriyani (row 27)** shares "siri" with row 19 and
   "biriyani" with `SS Hyderabadi Biriyani Zone` — no tool flags fired; noted for
   the reviewer.
9. **"Chickpet Donne Biryani Cafe"** (Justdial naming, observed in cross-lists) is
   almost certainly the existing `Chickpet Donne Biryani House` (`5218d019`) — it
   was never a worksheet row; no second record may be created.

## 4. Zero `same_as_existing` decisions

No Phase 3D row was declared `same_as_existing` — none of the 31 rows carries an
`existing_match_id`, and no enrichment of existing records was attempted (that is
a separate, future UPDATE workflow).
