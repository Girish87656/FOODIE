# Foodie — Phase 3D Research & Data-Collection Workflow

How to research candidate businesses and record what you actually found, so the
result can be validated (`validate.ts`) and — only after explicit human
approval — prepared for import via a reviewed SQL path.

**This document describes data COLLECTION only.** Nothing in this workflow
writes to Supabase. The validator is dry-run-only; the import itself is a
separate, human-approved step that does not exist yet.

---

## 0. The iron rules (read first)

1. **Blank means unknown.** Every field you could not capture stays empty.
   An empty field is honest; a guessed field is contamination. Missing
   coordinates, phone numbers, hours, prices, ratings and menu data must stay
   NULL all the way into any future import.
2. **Never invent or "complete" a value.** No inferring an address from a
   locality, no reconstructing hours from a rating page's cache, no rounding
   coordinates "close enough".
3. **Never claim verification.** Leave `coordinates_verified` and
   `verification_status` empty. A researcher (and this workflow) can never set
   them; only a human reviewer with real evidence can, and only outside this
   file.
4. **A Google Maps *search* URL proves nothing.** A URL of the form
   `/maps/search/…` (or any query-style maps URL) is a list of results, not a
   business. Record only the exact **place page** URL (`/maps/place/…`, or a
   URL carrying `place_id`/`cid`; expanded short links `maps.app.goo.gl/…` are
   acceptable). The validator flags search URLs with
   `MAPS_URL_IS_SEARCH_NOT_LISTING`.
5. **A listing URL — even a perfect place URL — is not coordinate evidence.**
   It documents that a listing exists and what the listing says. It never sets
   `coordinates_verified`, and coordinates copied from a listing are always
   `evidence_level=directory_reported` (bucket 6: awaiting confirmation).
6. **One source is never a decision.** No import candidate is declared "new"
   (or "same as existing") from a single directory listing. A second,
   independent source is required before any identity decision.
7. **Do not declare a candidate new merely because the current research file
   lacks details.** Absence of a match in the file is not evidence of
   newness — it usually means nobody has looked yet. "Potential new" is only
   ever concluded from affirmative evidence, never from missing evidence.
8. **No scraping Zomato/Swiggy or other proprietary datasets.** Record only
   what you may legitimately note with a public URL: the fact a listing
   exists, its publicly shown name/address/phone/hours/rating as observed on
   the check date. No bulk copying, no paywalled or gated content.
9. **No paid APIs, no keys, no credentials** in research artifacts. Free
   public pages and tools only.
10. **Cross-directory agreement is still directory data.** Two directories
    showing the same address raises confidence but is NOT
    `independently_confirmed`. That level is reserved for evidence that does
    not derive from a listing at all (you visited, you called, you captured
    GPS on site).

---

## 1. The loop

```
 fill one row of input/research-worksheet-phase3d.csv
   → run: bun scripts/foodie-import-validator/validate.ts \
              --input scripts/foodie-import-validator/input/research-worksheet-phase3d.csv \
              --label research-<date>
   → read reports/research-<date>.dry-run.md
   → fix errors, resolve warnings, record review_decision where the report
     justifies one
   → repeat until the report is clean
   → STOP: present the report for human review. Nothing is imported.
```

Every run is idempotent (byte-identical reports for identical inputs), so
re-running after edits always produces a meaningful diff.

---

## 2. Field-by-field collection guide

Column order in `input/research-worksheet-phase3d.csv` and
`input/template.csv` matches this table. Aliases (e.g. `lat`, `phone_number`,
`hours`) are accepted; unknown columns are rejected (`UNKNOWN_COLUMNS`) and
`community_rating` / `review_count` / `rating_count` are forbidden
(trigger-maintained by migration-005).

| # | Column | What to capture | Acceptable evidence | Leave blank when |
| --- | --- | --- | --- | --- |
| 1 | `name` | Business name exactly as the best source spells it | Any source | Never (required) |
| 2 | `category` | One of the 7 pilot categories: `restaurant`, `hotel`, `tiffin`, `cafe`, `fast_food`, `street_food`, `bakery_sweets` | Listing says, or category is unambiguous from the name/menu | Uncertain |
| 3 | `address` | Full street address, verbatim from the source — do not re-format or abbreviate | Listing, board photo, business sign | Only a vague area is known |
| 4 | `locality` | The village/area/landmark locality (e.g. Nagadenahalli, Scout Camp Road) | Same sources as address | Uncertain |
| 5 | `city` | Usually `Doddaballapura` in this pilot; copy what the source says | Listing | Unknown |
| 6 | `phone` | Publicly listed phone; any Indian format; normalized to `+91XXXXXXXXXX` | Listing, official site, signboard | Not publicly listed |
| 7 | `latitude` | Numeric degrees WGS84. **Only when supported by evidence** — see rule 5 and §3 | Listing pin (directory_reported) or on-site GPS (needs human confirmation) | No evidence — never "approximately here" |
| 8 | `longitude` | As above | As above | As above |
| 9 | `maps_listing_url` | The exact **place page** URL on Google Maps (rule 4) | Google Maps only | No listing found yet; non-Google listings go in `source_url` |
| 10 | `source_url` | The main source URL for the row as a whole (directory listing, news mention, official page) | Any public http(s) page | No source |
| 11 | `evidence_level` | `directory_reported` (default) or `independently_confirmed` — definitions in §3 | — | Defaults to `directory_reported` |
| 12 | `cuisine` | Free text, e.g. `South Indian, snacks` — only what a reliable source shows | Menu, listing description | Not documented |
| 13 | `menu_notes` | Dishes/items a reliable public source shows; paraphrase sparingly, no prices unless published | Menu photo/page, listing menu tab | Not documented |
| 14 | `menu_source_url` | URL of the page the menu details came from | http(s) | No separate menu source |
| 15 | `listing_rating` | The EXTERNAL directory rating (0–5) observed on your check date. Never a Foodie community value | Directory listing | Not shown |
| 16 | `listing_review_count` | The EXTERNAL review count observed on your check date | Directory listing | Not shown |
| 17 | `rating_source_url` | Where rating/count were read (may equal `maps_listing_url` or `source_url`) | http(s) | No rating captured |
| 18 | `rating_checked_on` | Date you read the rating/count, `YYYY-MM-DD` | — | Required whenever 15/16 are filled (warning otherwise) |
| 19 | `opening_hours` | Publicly listed hours, `HH:MM-HH:MM` 24h (e.g. `08:00-22:30`) | Listing, official site | Not published — never guess from "open now" badges |
| 20 | `price_level` | `₹`, `₹₹` or `₹₹₹` | Directory price band or clear published pricing | Not published |
| 21 | `address_source_url` | URL backing the address field specifically | http(s) | When `source_url` already covers it |
| 22 | `phone_source_url` | URL backing the phone specifically | http(s) | When `source_url` already covers it |
| 23 | `hours_source_url` | URL backing the hours specifically | http(s) | When `source_url` already covers it |
| 24 | `coordinates_source_url` | Where the coordinates came from (e.g. the listing pin page) | http(s) | When `source_url` already covers it |
| 25 | `uncertainty_notes` | Everything unresolved: same-name businesses nearby, stale-looking listing, pin looks offset, transliteration doubts, closed-sign reports | — | Nothing uncertain (rare) |
| 26 | `review_decision` | Your human duplicate-review call **after** reading a dry-run report: `distinct_new_business` · `same_as_existing` · `possible_duplicate_hold` · `needs_more_research` | The dry-run report + your corroboration | Undecided (default) |
| 27 | `existing_match_id` | With `same_as_existing`: the full UUID of the existing record (copy from the report) | Dry-run report | Any other decision |
| 28 | `notes` | Provenance and context for a reviewer | — | — |

Practical rules for per-field sources (21–24): fill them when the backing
source **differs from** or is **more specific than** `source_url`; duplicating
the same URL everywhere is noise, not evidence.

---

## 3. Evidence levels

- `directory_reported` — the value was read from a listing/directory (Google
  Maps, any other directory, a news mention). Includes every coordinate
  copied from any listing pin. **Default for everything.**
- `independently_confirmed` — the value rests on evidence that does not
  derive from a listing: you visited the premises, you spoke to the business,
  you captured GPS on site. Declaring this in the file is a **claim** — the
  validator records it, never trusts it, and a human must still review the
  evidence before any DB verification flag changes. Cross-directory agreement
  (rule 10) does not qualify.

Coordinates and bucket 6: any row carrying coordinates that are not
`independently_confirmed` **with** a source URL lands in the cross-cutting
"candidate coordinates awaiting confirmation" section of the report. That is
the expected, correct state for directory pins — not an error to be argued
away.

---

## 4. Duplicate-review decision protocol

The validator's matching (names, phones, geo, locality) is advisory. The human
decision is recorded in `review_decision`, and the two are kept separate
forever:

- `same_as_existing` — you have corroborated that the candidate IS an existing
  record. Require `existing_match_id`. Never create a second record; any
  enrichment of the existing record is a separate, reviewed UPDATE workflow
  (out of scope for imports).
- `distinct_new_business` — you have affirmative evidence the candidate is
  NOT any existing record (different address AND different phone AND/OR
  clearly different business at a distinct location). If the tool still shows
  a strong match, the row is flagged `REVIEW_DECISION_CONFLICTS_WITH_MATCH`
  and must be resolved by a human before anything else happens.
- `possible_duplicate_hold` — evidence conflicts or is incomplete. The row
  waits. It must not be imported and must not be merged.
- `needs_more_research` — obvious even to a careful reader that more field
  work is required.

The tool rejects invalid enum values, `same_as_existing` without an id, and
ids that do not exist in the current baseline (`EXISTING_MATCH_ID_NOT_IN_BASELINE`
— refresh the snapshot with `bun scripts/foodie-import-validator/fetch-baseline.ts`).

---

## 5. What "done" looks like per row

A row is **research-complete** when: every field you could support has a
value + source; every field you could not support is empty; uncertainty is
written down; and the validator runs with zero errors and only understood,
accepted warnings. A row is **import-ready** only after that AND a human
reviewer approves it — which happens outside this workflow.

## 6. Explicitly out of scope here

- Any write to Supabase (the validator is dry-run-only by construction).
- Marking anything `verified` in the database.
- Merging, deleting or updating existing records (enrichment is a separate
  future workflow).
- Scraping proprietary aggregator datasets (Zomato/Swiggy) or any paid API.
- Deciding the final import set — that is the human approval step after the
  dry-run report is presented.
