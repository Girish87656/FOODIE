# Foodie — Restaurant Import Validator

A **local, dry-run-only** validation tool for candidate restaurant data before
anything is considered for import into the Supabase `restaurants` table.

> **ZERO DATABASE WRITES — by construction.**
> The only network operation in the entire tool is a single HTTP **GET** that
> reads the existing `restaurants` rows (the same public, RLS-protected
> endpoint the app reads). There is no insert/update/delete code path anywhere.
> See `demo/no-write-proof.ts` for an executable proof.

**Researching businesses for the next import round?** Start with
[`WORKFLOW.md`](./WORKFLOW.md) — the field-by-field Phase 3D data-collection
guide — and fill `input/research-worksheet-phase3d.csv`. This README documents
the tool itself.

## What it does

1. Reads candidates from a **CSV or JSON** file you provide.
2. Validates every field: names, categories, addresses, Indian phone numbers,
   coordinate ranges, source URLs, opening-hours format, price levels,
   evidence level and verification claims.
3. Compares candidates against the **live baseline** (existing restaurants) and
   flags likely duplicates and ambiguous same-name businesses — for **manual
   review only**, never auto-merged.
4. Produces a deterministic **dry-run report** (JSON + Markdown) that separates
   six buckets:

| # | Bucket | Meaning |
| --- | --- | --- |
| 1 | Potential new businesses | Valid, has data, no match to existing records |
| 2 | Existing-record matches | Strong match — **never** create a second record |
| 3 | Possible duplicates / ambiguous | Manual review required (fuzzy names, shared proper tokens, same phone, intra-file duplicates) |
| 4 | Insufficient evidence | Little more than a name — cannot be evaluated yet |
| 5 | Invalid or missing data | Failed a hard rule (bad phone/coords/URL/enum, forbidden field, unsupported verification claim) |
| 6 | Candidate coordinates awaiting confirmation | Cross-cutting: any row carrying coordinates that are not independently confirmed with a source URL |

Bucket precedence: `invalid_data` › `existing_match` › `possible_duplicate` ›
`insufficient_evidence` › `potential_new`. Flags (e.g. `INTRA_FILE_DUPLICATE`,
`LOCALITY_CONFLICT`) are preserved regardless of the primary bucket.

## Data-honesty policy enforced

- Missing values stay **NULL**. Nothing is guessed, defaulted or filled.
- A **directory-published pin is a candidate only** — never confirmed GPS
  evidence. All such rows land in bucket 6.
- `coordinates_verified=true` in an input is **rejected** unless the row also
  declares `evidence_level=independently_confirmed` **and** a `source_url`
  (and even then the tool only records the claim — a human grants real
  verification).
- `verification_status=verified` in an input is always rejected; the
  recommended start state for any future import is `unverified`.
- `community_rating` / `review_count` / `rating_count` are **forbidden** in
  imports — they are maintained by database triggers (migration-005).
- `listing_rating` (an external directory rating) is kept strictly separate
  from Foodie community reviews, and warns when it appears without a
  `source_url` (evidence without provenance).

## Quick start

```bash
# from the repo root (or anywhere — the tool finds the repo .env itself)

# 1. Refresh the baseline snapshot (single GET, read-only):
bun scripts/foodie-import-validator/fetch-baseline.ts

# 2. Validate a candidate file (uses fixtures/baseline-snapshot.json by default):
bun scripts/foodie-import-validator/validate.ts \
  --input scripts/foodie-import-validator/input/candidates-phase3c.csv \
  --label candidates-phase3c

# 3. Read the report:
#    scripts/foodie-import-validator/reports/candidates-phase3c.dry-run.md (+ .json)
```

Or via the repo-root npm scripts:

```bash
bun run foodie:validate -- --input <file.csv> --label my-run
bun run foodie:baseline -- [output.json]
```

### Options

| Flag | Meaning |
| --- | --- |
| `--input <path>` | Candidate file, `.csv` or `.json` (required) |
| `--baseline <path>` | Use this baseline snapshot (deterministic runs) |
| `--save-baseline <path>` | Fetch live rows once (GET) and save a snapshot, then use it |
| `--report-dir <dir>` | Report output directory (default: `<tool>/reports`) |
| `--label <name>` | Report file label (default: input basename) |
| `--strict` | Exit code 2 when any row lands in invalid/missing data |
| `--quiet` | Print only the summary |
| `--help` | Help |

Exit codes: `0` ran clean · `1` usage/IO/network error · `2` `--strict` and invalid rows exist.

## Input format

CSV headers or JSON keys are normalized (case/spacing/camelCase insensitive;
aliases like `lat`, `lng`, `phone_number`, `hours`, `url` accepted). Unknown
columns produce an `UNKNOWN_COLUMNS` flag (typo protection); trigger-managed
columns are rejected outright.

| Field | Required | Rules |
| --- | --- | --- |
| `name` | ✅ | 2–120 chars; matched fuzzily against existing records |
| `category` | – | One of the 7 pilot categories: `restaurant`, `hotel`, `tiffin`, `cafe`, `fast_food`, `street_food`, `bakery_sweets` |
| `address` / `locality` / `city` | – | Free text; preserved verbatim |
| `phone` | – | Indian formats: `+91 98765 43210`, `080…`, 10-digit mobile/landline → normalized to `+91XXXXXXXXXX` |
| `latitude` / `longitude` | – | Numeric ranges enforced; lat/lng swap detection; soft corridor check (warning) outside GITAM–Doddaballapura bbox |
| `source_url` | – | Must be `http(s)` |
| `evidence_level` | – | `directory_reported` (default) · `independently_confirmed` |
| `listing_rating` | – | 0–5; external rating only; warns without any source (`source_url` / `rating_source_url` / `maps_listing_url`) and without a check date |
| `opening_hours` | – | `HH:MM-HH:MM` 24h |
| `price_level` | – | `₹` · `₹₹` · `₹₹₹` |
| `coordinates_verified` | – | `true`/`false`; `true` requires independent evidence + source (else rejected) |
| `verification_status` | – | Enum; `verified` rejected; others warn (recommend leaving empty) |
| `notes` | – | Free text; preserved as evidence context |
| `maps_listing_url` | – | Google Maps **place-page** URL. Search-result URLs → `MAPS_URL_IS_SEARCH_NOT_LISTING` (and do not count as identity/source); non-Google URLs rejected (use `source_url`); never coordinate evidence |
| `cuisine` / `menu_notes` | – | Free text from reliable public sources; descriptive only — do NOT lift a name-only row out of insufficient evidence |
| `menu_source_url` | – | `http(s)`; backs the menu details specifically |
| `listing_review_count` | – | Non-negative integer; EXTERNAL directory count — never Foodie community data; warns without any source |
| `rating_source_url` | – | `http(s)`; where the rating/count were read |
| `rating_checked_on` | – | `YYYY-MM-DD` when the rating/count were observed; expected whenever a rating/count is present (`RATING_WITHOUT_CHECK_DATE` warning) |
| `address_source_url` / `phone_source_url` / `hours_source_url` / `coordinates_source_url` | – | Per-field provenance where practical |
| `uncertainty_notes` | – | Free text; everything unresolved about this row |
| `review_decision` | – | Human duplicate-review decision: `distinct_new_business` · `same_as_existing` · `possible_duplicate_hold` · `needs_more_research`; recorded verbatim, never overrides matching |
| `existing_match_id` | – | UUID of the existing record (required in practice for `same_as_existing`); checked for format and against the baseline (`EXISTING_MATCH_ID_NOT_IN_BASELINE` warning) |

Templates: `input/template.csv` and `input/template.json`.
Research worksheet for the 23 Phase 3D candidates:
`input/research-worksheet-phase3d.csv` (names + region only — fill per
`WORKFLOW.md`).

## Matching methodology (transparent, conservative)

- **Name normalization**: casefold, diacritics stripped, `&`→`and`,
  punctuation removed. Fuzzy scoring uses Levenshtein on "core" names
  (honorifics like *sri/shri/the/hotel* removed) plus token Jaccard;
  token **containment** catches `"Amigos"` ⊂ `"Amigos Cafe"`.
- **Confident match** (bucket 2): similarity ≥ 0.90, or ≥ 0.78 corroborated by
  an identical normalized phone, coordinates ≤ 150 m, or identical locality.
- **Ambiguous** (bucket 3): 0.65–0.90 similarity with the same first token, or
  a shared proper-noun token with ≥ 50 % token containment (e.g. *GITAM Cafe*
  vs *GITAM University Canteen*), or a phone match with a dissimilar name
  (`SAME_PHONE_DIFFERENT_NAME`), or matches to multiple existing records.
  Food-type words (biryani, chats, cafe, tiffin, …) do **not** count as proper
  tokens — generic names don't create false matches.
- **Intra-file duplicates**: pairwise strong name/phone/geo match between
  candidate rows → both flagged, neither merged.
- **Human decisions are recorded, never obeyed**: `review_decision=same_as_existing`
  does not create or merge anything; `distinct_new_business` against a strong
  tool match raises the `REVIEW_DECISION_CONFLICTS_WITH_MATCH` flag for a human
  to resolve.

## Determinism & idempotency

Reports contain **no wall-clock timestamps**. Same input bytes + same baseline
snapshot ⇒ **byte-identical report** (verified: repeated runs hash equal), so
re-running is always safe and diffs are meaningful. The baseline snapshot
embeds its own `fetched_at` for provenance.

## Zero-write proof

```bash
bun scripts/foodie-import-validator/demo/no-write-proof.ts
```

Starts a local capture server, points the tool's only network function at it,
runs the full pipeline, and asserts every captured request is a `GET`
(`POST/PATCH/PUT/DELETE` count: zero → PASS).

## Fixtures (test files)

| Fixture | Covers |
| --- | --- |
| `fixtures/test-valid.json` | Valid new businesses, directory vs independent evidence, same-phone-different-name |
| `fixtures/test-missing-fields.csv` | Name-only rows, blank/whitespace names, CSV quoting |
| `fixtures/test-malformed.json` | Bad lat/lng (range + swap), bad phones, bad URL, bad enums, bad hours, corridor warning |
| `fixtures/test-duplicates.json` | Exact + fuzzy intra-file duplicate pairs, existing-record matches |
| `fixtures/test-forbidden-fields.json` | Trigger-maintained fields, unsupported verification claims, rating without source/date |
| `fixtures/test-research-fields.json` | Phase 3D fields: place-anchored vs search Maps URLs, cuisine/menu-only rows, review counts, check dates, review decisions, match-id checks, decision-vs-match conflict |

`fixtures/baseline-snapshot.json` is a **read-only export** of the live
public `restaurants` rows (business listing data only — no keys) used to keep
runs deterministic between refreshes.

## Limitations (honest)

- The tool **cannot verify** any claim; it records and separates them.
  "independently_confirmed" is a declaration in your file, not a fact the
  tool checked.
- Matching is heuristic (names/phones/geo). Unusual transliterations of
  Kannada names may need human review even at moderate similarity.
- The CSV parser is a minimal RFC-4180 implementation (quoted fields, escaped
  quotes, CRLF). For exotic encodings, prefer JSON.
- Coordinates are only range/swap/corridor-checked. Whether a pin is at the
  *exact business* requires independent confirmation (Phase 3B workflow) — a
  map-search result or directory pin never verifies it.
- A place-anchored Google Maps URL is accepted as **evidence of the listing**,
  not of the coordinate; the tool cannot open URLs or check that a short link
  resolves to the claimed business.
- This tool is **not an importer**. It will never write to Supabase; a
  reviewed, human-approved SQL/insert path remains the only way data enters.
