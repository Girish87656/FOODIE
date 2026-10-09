# Foodie — Phase 3C → 3D Research-Priority Report

**Scope:** classification of the 35 Phase 3C candidates for the next
data-collection round. Companion to
`reports/candidates-phase3c.dry-run.md` (v1.1.0).

**Method and honesty limits.** This report was produced ONLY from (a) the
Phase 3C dry-run report and (b) the read-only baseline snapshot of the 14 live
restaurants (`fixtures/baseline-snapshot.json`, 2026-10-09). **No web research,
no Maps lookups and no external checks were performed in this step.** Every
assignment below is therefore a *research-plan decision* ("what to do next"),
not an evidence claim: nothing here asserts that a listing exists, that a
business is active, or that any candidate is new. Categories 2–4 describe the
*next action* per candidate; category 5 is a cross-cutting status. No candidate
moves anywhere until a human approves research output through the validator
(`WORKFLOW.md`).

---

## 0. Why all 35 candidates produced ZERO "potential new businesses"

The Phase 3C input (`input/candidates-phase3c.csv`) contained exactly two
columns per row: `name` and `notes` (region grouping). Given that, the
validator's bucket logic could only ever produce three outcomes:

| Outcome | Count | Why |
| --- | ---: | --- |
| Existing-record matches (bucket 2) | 12 | 11 name-exact + 1 name-subset (`Amigos` ⊂ `Amigos Cafe`) matches against the 14 live records — these are not "new" at all; creating second records for them is forbidden |
| Possible duplicate / ambiguous (bucket 3) | 1 | `GITAM Cafe` shares the proper token "gitam" with existing `GITAM University Canteen` — flagged for manual review, not classified as new |
| Insufficient evidence (bucket 4) | 22 | Every remaining row was **name-only**. "Potential new" (bucket 1) requires valid data *beyond the name* (address/locality/phone/coords/hours/price/rating or a specific listing URL) **and** zero existing matches. A name alone can never qualify — by design |

So the zero is the intended behaviour, not a failure: with no researched data
in the file, the tool refuses to call anything "new". **What is missing for
every candidate is the evidence layer itself** — category, full address and
locality, Google Maps place-page URL, coordinates (only when evidence-backed),
publicly listed phone and hours, cuisine/menu where reliably published, and
external rating/review count **with source and check date**, each with a
source URL where practical. Appendix A states the gap per candidate.

---

## 1. Category 1 — Existing restaurants to PRESERVE (12)

Do **not** import these. They matched live records by name (11 exact,
1 subset) and must never get second records. Any future improvement to their
data (e.g. filling a missing phone) is a separate, reviewed **UPDATE**
workflow — not an import.

| Row | Candidate | Live record (`id…`) | Live locality | Live coords | Live-record gaps (optional enrichment, out of import scope) |
| ---: | --- | --- | --- | --- | --- |
| 6 | SS Hyderabadi Biriyani Zone | `f37d212b` | Nagadenahalli | 13.2846389, 77.6011256 | no `source_url`/`last_verified_at`; all `*_verified` flags NULL |
| 7 | Amigos | `973a6f0e` **Amigos Cafe** | Nagadenahalli | 13.2845564, 77.5966293 | hours, phone NULL; same provenance NULLs |
| 8 | Abhiram Food Court | `c3936dec` | Moparahalli | 13.2849612, 77.5963066 | phone NULL; same provenance NULLs |
| 9 | GITAM University Canteen | `7259037f` | GITAM campus | NULL | coords, phone, hours NULL; same provenance NULLs |
| 23 | Ayyappa Tiffin Room | `02a34d5f` | Doddaballapura Railway Station | 13.279913, 77.552234 | hours NULL; same provenance NULLs |
| 24 | Sri Annapoorneshwari Tiffin Center | `f74252ef` | Doddaballapura town | NULL | coords, hours NULL; same provenance NULLs |
| 25 | Shri Manjunatha Grand Veg | `987dad98` | Doddaballapura Railway Station | NULL | coords, phone NULL; same provenance NULLs |
| 26 | Brundavana Family Restaurant | `343812c9` | Scout Camp Road | NULL | coords, phone, hours NULL; same provenance NULLs |
| 27 | Chickpet Donne Biryani House | `5218d019` | NULL | NULL | locality, coords, phone, hours NULL |
| 28 | Hotel Halli Nanasu | `e6ba7907` | Doddaballapura town | NULL | coords, phone NULL |
| 29 | Hotel Royal Nandhana | `e989603f` | Arehalli Guddadahalli | NULL | coords, phone, hours NULL |
| 30 | Priyanka Tiffen Center | `fe248fda` | Doddaballapura town | NULL | coords, phone, hours NULL |

Note: these matches are name-based (the candidate file carried no phone/geo to
corroborate). High confidence, but the human review that precedes any future
enrichment should re-confirm identity the same way as for any other row.

## 2. Category 2 — Candidates needing GOOGLE MAPS LISTING research (20)

First action: locate the exact **place page** on Google Maps (a
`/maps/place/…` or `place_id`-bearing URL — never a search-results URL), then
capture whatever the listing publicly shows into
`input/research-worksheet-phase3d.csv` per `WORKFLOW.md`. **No claim is made
that any listing exists** — finding out IS the task. After one listing is
documented, every one of these moves to Category 3 (second source required).

| Row | Candidate | Region group |
| ---: | --- | --- |
| 3 | Garuda Cafe Restaurant | Near GITAM / Nagadenahalli |
| 4 | Epicurus Multi Cuisine Restaurant | Near GITAM / Nagadenahalli |
| 10 | Mantralaya Hotel & Chats | Near GITAM / Nagadenahalli |
| 11 | Venture's Hungry Birds | Near GITAM / Nagadenahalli |
| 12 | Lotus Gardenia | Near GITAM / Nagadenahalli |
| 13 | Vaibhava Sweets & Chats | Near GITAM / Nagadenahalli |
| 14 | Appu Chats | Near GITAM / Nagadenahalli |
| 15 | Iyengar's Cake N Bake | Near GITAM / Nagadenahalli |
| 16 | Best Choice Bakery | Near GITAM / Nagadenahalli |
| 17 | Wild Woods BBQ Grill & Chill | Near GITAM / Nagadenahalli |
| 18 | Rainbow Huts Family Restaurant | Near GITAM / Nagadenahalli |
| 19 | Hotel Bindushree Family Restaurant | Near GITAM / Nagadenahalli |
| 20 | Karavali Hotel | Near GITAM / Nagadenahalli |
| 21 | Sri Vinayaka Food Point | Near GITAM / Nagadenahalli |
| 22 | Hotel Radha | Near GITAM / Nagadenahalli |
| 31 | Siri Chicken Centre | Toward Doddaballapura / Railway Station Road |
| 32 | Hotel Krishnamoorthy | Toward Doddaballapura / Railway Station Road |
| 33 | Ganesh Darshan & Chats | Toward Doddaballapura / Railway Station Road |
| 34 | Lakshmi Biriyani Point | Toward Doddaballapura / Railway Station Road |
| 35 | Kiran Tiffin Room | Toward Doddaballapura / Railway Station Road |

Row-specific caution: **Ganesh Darshan & Chats** (33) shares the token "ganesh"
with existing `Sri Ganesh Grand` (13.2679, 77.5521, Bashettihalli). The tool
did *not* flag it (containment below threshold), but during research, capture a
distinguishing address/phone before any identity decision.

## 3. Category 3 — Candidates needing a SECOND INDEPENDENT source (0 today)

Empty **today, by definition**: not one of the 35 candidates has a single
documented source yet, so nobody has reached the "second source" stage.
Category 3 is a pipeline stage, not a static property: **every Category 2
candidate enters this category the moment its first directory listing is
documented.** Per policy, one directory source is never a decision — a second,
independent source is required before `distinct_new_business` /
`same_as_existing` can be justified, and cross-directory agreement still counts
only as `directory_reported` (never `independently_confirmed`).

(Separately: the 12 Category 1 live records, if ever enriched, will need
second-source confirmation per field — that is the future UPDATE workflow, not
this import track.)

## 4. Category 4 — Ambiguous businesses (3)

No candidate is classified "possibly inactive" — **no inactivity evidence
exists for any candidate**, and none may be invented. The three below are
ambiguous in *identity*:

| Row | Candidate | Why ambiguous | Resolution path |
| ---: | --- | --- | --- |
| 1 | GITAM Cafe | Tool-flagged possible duplicate: shares the proper token "gitam" with existing `GITAM University Canteen` (`7259037f`) | Field research must establish whether a separately-branded cafe exists distinct from the canteen (distinct address/phone/maps listing) — or that it is the same thing. Import nothing either way until resolved; record via `review_decision` + `existing_match_id` |
| 5 | Biryani Cafe | Fully generic name — zero proper tokens once honorifics/business-type words are stripped. Any Maps search returns many unrelated businesses; the name alone cannot pin an identity | Research must capture a distinguishing address/phone before ANY match decision; treat every search hit as unconfirmed |
| 2 | The Shri Cafe and Restaurant | Core name reduces to generic words ("cafe and restaurant" + honorific "shri") — same misidentification risk | Same as row 5 |

## 5. Category 5 — Candidates that should NOT be imported yet (cross-cutting: all 23 non-preserved candidates)

**Zero candidates are import-ready today.** Concretely:

- The 12 Category 1 candidates are **never imports** (they exist; preserve, no
  second records).
- The 20 Category 2 + 3 Category 4 candidates carry **no sourced field at
  all** — no address, phone, coordinates, listing URL, rating, or any source
  URL. Importing any of them now would violate every evidence rule in
  `WORKFLOW.md`.
- "Not importable yet" is **not** a judgment that a business doesn't exist and
  **not** an implication that it is new — it is a statement that the evidence
  layer is still entirely missing (see the warning about declaring candidates
  new from absent details).

Accounting: 12 (Cat 1) + 20 (Cat 2) + 0 (Cat 3) + 3 (Cat 4) = 35 ✓; Cat 5 is a
status covering the 23 non-preserved candidates.

---

## Appendix A — Evidence status per candidate (all 35)

"Missing evidence" = the researched fields that do not exist yet (all must stay
blank until captured with a source per `WORKFLOW.md`). Live-record gaps for
Category 1 are enrichment context only.

| Row | Candidate | Dry-run bucket | Evidence missing / next step |
| ---: | --- | --- | --- |
| 1 | GITAM Cafe | possible_duplicate | Everything (see §0) + the disambiguation evidence vs `7259037f` (distinct address/phone/listing, or proof of sameness) |
| 2 | The Shri Cafe and Restaurant | insufficient_evidence | Everything (see §0); distinguishing address/phone FIRST (generic name) |
| 3 | Garuda Cafe Restaurant | insufficient_evidence | Everything (see §0); Maps listing research |
| 4 | Epicurus Multi Cuisine Restaurant | insufficient_evidence | Everything (see §0); Maps listing research |
| 5 | Biryani Cafe | insufficient_evidence | Everything (see §0); distinguishing address/phone FIRST (generic name) |
| 6 | SS Hyderabadi Biriyani Zone | existing_match `f37d212b` | Nothing for import — never re-import. Live record: `*_verified` flags + source_url NULL |
| 7 | Amigos | existing_match `973a6f0e` (Amigos Cafe) | Nothing for import. Live record: hours/phone NULL |
| 8 | Abhiram Food Court | existing_match `c3936dec` | Nothing for import. Live record: phone NULL |
| 9 | GITAM University Canteen | existing_match `7259037f` | Nothing for import. Live record: coords/phone/hours NULL |
| 10 | Mantralaya Hotel & Chats | insufficient_evidence | Everything (see §0); Maps listing research |
| 11 | Venture's Hungry Birds | insufficient_evidence | Everything (see §0); Maps listing research |
| 12 | Lotus Gardenia | insufficient_evidence | Everything (see §0); Maps listing research |
| 13 | Vaibhava Sweets & Chats | insufficient_evidence | Everything (see §0); Maps listing research |
| 14 | Appu Chats | insufficient_evidence | Everything (see §0); Maps listing research |
| 15 | Iyengar's Cake N Bake | insufficient_evidence | Everything (see §0); Maps listing research |
| 16 | Best Choice Bakery | insufficient_evidence | Everything (see §0); Maps listing research |
| 17 | Wild Woods BBQ Grill & Chill | insufficient_evidence | Everything (see §0); Maps listing research |
| 18 | Rainbow Huts Family Restaurant | insufficient_evidence | Everything (see §0); Maps listing research |
| 19 | Hotel Bindushree Family Restaurant | insufficient_evidence | Everything (see §0); Maps listing research |
| 20 | Karavali Hotel | insufficient_evidence | Everything (see §0); Maps listing research |
| 21 | Sri Vinayaka Food Point | insufficient_evidence | Everything (see §0); Maps listing research |
| 22 | Hotel Radha | insufficient_evidence | Everything (see §0); Maps listing research |
| 23 | Ayyappa Tiffin Room | existing_match `02a34d5f` | Nothing for import. Live record: hours NULL |
| 24 | Sri Annapoorneshwari Tiffin Center | existing_match `f74252ef` | Nothing for import. Live record: coords/hours NULL |
| 25 | Shri Manjunatha Grand Veg | existing_match `987dad98` | Nothing for import. Live record: coords/phone NULL |
| 26 | Brundavana Family Restaurant | existing_match `343812c9` | Nothing for import. Live record: coords/phone/hours NULL |
| 27 | Chickpet Donne Biryani House | existing_match `5218d019` | Nothing for import. Live record: locality/coords/phone/hours NULL |
| 28 | Hotel Halli Nanasu | existing_match `e6ba7907` | Nothing for import. Live record: coords/phone NULL |
| 29 | Hotel Royal Nandhana | existing_match `e989603f` | Nothing for import. Live record: coords/phone/hours NULL |
| 30 | Priyanka Tiffen Center | existing_match `fe248fda` | Nothing for import. Live record: coords/phone/hours NULL |
| 31 | Siri Chicken Centre | insufficient_evidence | Everything (see §0); Maps listing research |
| 32 | Hotel Krishnamoorthy | insufficient_evidence | Everything (see §0); Maps listing research |
| 33 | Ganesh Darshan & Chats | insufficient_evidence | Everything (see §0); Maps listing research; caution: "ganesh" token shared with `Sri Ganesh Grand` |
| 34 | Lakshmi Biriyani Point | insufficient_evidence | Everything (see §0); Maps listing research |
| 35 | Kiran Tiffin Room | insufficient_evidence | Everything (see §0); Maps listing research |

*(§0 = category, full address/locality, Maps place-page URL, evidence-backed
coordinates only, publicly listed phone/hours, cuisine/menu where reliably
published, external rating + review count with source and check date, source
URL per field, evidence level, uncertainty notes.)*

---

## Recommended sequence (after this report is approved)

1. Fill `input/research-worksheet-phase3d.csv` for Category 2 + 4 candidates
   following `WORKFLOW.md` (Maps place-page first, one source per field,
   blanks stay blank).
2. Validate each round: `bun scripts/foodie-import-validator/validate.ts
   --input scripts/foodie-import-validator/input/research-worksheet-phase3d.csv
   --label research-<date>`; resolve errors, read warnings.
3. Record `review_decision` per row once the dry-run report justifies it;
   resolve the GITAM Cafe ambiguity explicitly.
4. Second independent source per surviving candidate (Category 3 stage).
5. Present the final clean dry-run report for human approval. Only after
   approval may an import be prepared — via a reviewed SQL path, never via
   this tool. **This phase ends here; nothing is imported.**
