# FOODIE — Tirupati Master Place Discovery Plan

**Owner directive:** broadest practical, source-backed inventory of places across Tirupati and
Tirumala — famous and small/obscure alike — with honest locality grouping, auditable evidence,
and no invented data. This document is the plan of record; `docs/tirupati-discovery-worklog.md`
records what was ACTUALLY done; `docs/tirupati-source-register.md` lists sources actually
reviewed; `docs/tirupati-coverage-matrix.md` tracks searched/not-searched status per locality ×
category.

**Status of this pass:** BATCHES 1–2 COMPLETE (two discovery sweeps + curation +
Batch-012 review candidate [29 rows] + Batch-013 review candidate [57 rows] generated,
never executed; see `docs/tirupati-discovery-worklog.md` for the factual record and
backlog). Batch-012 was REBASED onto the batch-2 worksheet canonicals (2026-10-27) after
the batch-2 curation renamed canons — the previously generated SQL was never executed, so
the rebase is safe and documented. The completeness standard is
"broadest practical, not absolute" — unfinished work is preserved as an explicit backlog, never
claimed complete.

---

## 1. Scope

### 1.1 Geographic areas (honest grouping; no district-wide relabelling as "Tirupati city")

| Area key | DB `locality` label | DB `city` | Grouping rule |
|---|---|---|---|
| `tpt-central` | Tirupati city centre | Tirupati | core city — bazaar, Tilak Rd, Gandhi Rd, JC Rd, Tiruchanoor Rd corridors |
| `tpt-neighbourhoods` | Tirupati residential neighbourhoods | Tirupati | Korlagunta, Bhavani Nagar, Satyanarayanapuram, MR Pally, AIR Bypass Rd, Cherlopalli, Avilala, etc. |
| `tirumala` | Tirumala hills | Tirupati | the hill town — temples, prasadam, TTD accommodation, visitor food |
| `tiruchanur` | Tiruchanur (Alamelu Mangapuram corridor) | Tirupati | immediately adjacent temple hamlet on the Tiruchanoor Rd corridor — tagged `surrounding-corridor` |
| `srinivasa-mangapuram` | Srinivasa Mangapuram (about 10 km west of Tirupati city, per district page) | Tirupati | tagged `surrounding-corridor` |
| `chandragiri` | Chandragiri (about 12-14 km south-west of Tirupati city) | Tirupati | tagged `surrounding-corridor` |
| `renigunta` | Renigunta (airport / railway junction corridor, about 10-12 km north) | Tirupati | tagged `surrounding-corridor` |
| `surrounding` | Surrounding destinations (beyond the city/Tirumala core — clearly-labelled group) | Tirupati | e.g. Talakona, Nagalapuram, Srikalahasti, Kalyani dam — tagged `surrounding` |

The `tags` array + `locality` text carry the honest group label so the UI/docs never present a
Talakona or Srikalahasti place as being "inside Tirupati city".

### 1.2 Category families (and DB targets)

| Family | DB target | DB category / place_type | Tags for finer types |
|---|---|---|---|
| Food — full-service restaurants, messes, food courts | `restaurants` | `restaurant` | vegetarian, non-vegetarian, biryani, mess |
| Food — tiffin / breakfast centres | `restaurants` | `tiffin` | mess |
| Food — street food, tea stalls, juice/chaat | `restaurants` | `street_food` | tea_stall, juice_shop |
| Food — bakeries, sweet shops, ice cream, prasadam counters | `restaurants` | `bakery_sweets` | bakery, sweets, ice_cream |
| Food — cafés / coffee | `restaurants` | `cafe` | — |
| Fast food / quick-service | `restaurants` | `fast_food` | — |
| Temples, shrines, churches, mosques, ashrams, mutts, teerthams | `places` | `temple` / `other` | church, mosque, ashram, teertham |
| Tourist attractions — forts, waterfalls, zoo, natural arch, museums, parks, lakes, viewpoints, treks | `places` | `fort` / `waterfall` / `zoo` / `natural_arch` / `other` | museum, nature |
| Stays — hotels, lodges, guesthouses, hostels, resorts, homestays, choultries/pilgrim accommodation | `places` | `hotel` | lodge, resort, guesthouse, hostel, homestay, pilgrim_accommodation |
| Markets, bazaars, shopping streets/centres, craft emporia | `places` | `other` | market, shopping, handicraft |

The `places` table (migration-008) constrains `place_type` to
`temple | waterfall | fort | zoo | natural_arch | other | hotel`; anything finer is a tag —
never a new enum value. The `restaurants` table constrains `category` to the 7 pilot values.

### 1.3 Out of scope (unless evidence is overwhelming)

Hospitals, transport hubs, public facilities — FOODIE's current category system does not model
them; adding new enums is a schema change requiring owner approval. Recorded here as a
deliberate scope boundary, not an oversight.

---

## 2. Source list (planned)

| # | Source | Kind | Status this pass |
|---|---|---|---|
| 1 | z-ai `web_search` (multi-engine results over public web) | search channel | **USABLE** — proven in batches 005-009 |
| 2 | https://www.tirumala.org/PlacesToVisit.aspx (+ temple directory pages) | official (TTD) | **USABLE** — HTTP 200 verified from sandbox |
| 3 | https://www.incredibleindia.gov.in/en/andhra-pradesh/tirupati | official (Ministry of Tourism) | **USABLE** — HTTP 200 verified (JS-heavy; parsed conservatively) |
| 4 | https://tirupati.ap.gov.in/ (+ tourist-places / religious-tourism / eco-tourism) | official (District) | **BLOCKED from sandbox network** (connection fails, 3 attempts, browser UA too) — recorded as limitation, not silently skipped |
| 5 | https://tourism.ap.gov.in/ | official (AP Tourism) | **BLOCKED from sandbox network** (same) |
| 6 | Public listing platforms: justdial, zomato, magicpin, district.in, swiggy (food); oyo/makemytrip/goibibo/booking/agoda/treebo/fabhotels/yatra/cleartrip (stays) | directories | usable **via search snippets only** — no scraping of their page HTML; candidates cite the listing URL |
| 7 | tripadvisor / holidify / wikipedia / official venue domains | POI evidence | usable via search results, identity area-gated |
| 8 | Google Maps category listings | maps | **NOT directly harvestable** — automated bulk download would violate access controls; used only indirectly (place names surfaced through public search results). NEVER claimed as "all results downloaded". |
| 9 | OSM Nominatim (keyless, 1 req/s, UA set) | geocoding only | usable — area-gated; coordinates never estimated |

Honest limitations: (a) the two `.ap.gov.in` domains are unreachable from this sandbox network;
their content enters ONLY via quoted snippets in search results, clearly attributed;
(b) Google Maps is not bulk-harvested; (c) justdial/zomato pages are not scraped for full
detail — only the identity of the listing (name + URL) is used as evidence.

## 3. Query strategy

- Per **area × category-family** fixed query lists (see
  `scripts/foodie-enrichment/research-tirupati-master.ts` → `GROUPS`), including Telugu/alternate
  spellings where meaningful (e.g. "Tiruchanoor"/"Tiruchanur", "Sila Thoranam"/"Silathoranam",
  "mess"/"meals hotel").
- Conservative candidate extraction: names only from allow-listed host kinds; aggregator
  listicle URLs dropped; every hit (title/url/snippet/host) is persisted as evidence **before**
  any decision.
- **Area gate**: a candidate is kept only when the result title/snippet itself names the area
  (the same-name trap lesson from the photo deep pass — "Tirupati" in Bangalore is NOT Tirupati).
- **Identity verification**: one `"<name>" <city> address` query per candidate; area re-gated;
  address-pattern evidence recorded when present.
- **Geocoding**: Nominatim with the area token gate — NULL coordinates otherwise (the UI has an
  honest "Location pending verification" state). Never estimated, never copied from snippets.
- **Verification statuses** (Phase E policy): `VERIFIED / PARTIALLY VERIFIED / UNVERIFIED /
  POSSIBLY CLOSED / CLOSED / POSSIBLE DUPLICATE`. Imports never self-verify: every imported row
  carries `verification_status='unverified'`; doc-level statuses are the *review layer* and are
  auditable in `docs/tirupati-place-inventory.md`.

## 4. Integration plan (no homepage changes)

- Existing architecture untouched; food rows → `restaurants`, POI/stays → `places`
  (destination-linked via the guarded Tirupati destination id).
- Stable IDs: `uuid5("foodie-tptm:<city>:<name>")` over the fixed project namespace
  (`6d3a0f5e-7b1c-4a2e-9d84-2f6a1c9e0b31`) — same algorithm as batches 009-011, distinct prefix
  so no cross-batch collision.
- Import batches are **generated, guarded, reviewable SQL** (preflight state gates; no
  delete/update of existing rows; re-run safe). Production writes happen ONLY via owner
  approval in the Supabase SQL editor (established protocol).
- Unverified records stay `unverified` in DB; `docs/tirupati-photo-gaps.md` tracks photo gaps;
  no AI imagery is presented as venue photos.

## 5. Baseline (Phase A audit — measured, not assumed)

Production probes (2026-10-26, read-only):

- `/api/restaurants/all` → **86 rows**: restaurant 46, bakery_sweets 11, fast_food 10, cafe 8,
  tiffin 4, hotel 4, street_food 3. By city: **Doddaballapura 80, Tirupati 6** (Holiday Inn
  Tirupati Tirumala, Starlit Suites, Tirupati Foods, Ni Cake World, Ps4 Restaurant, The 99 Pizza).
- Tirupati localities already present: Temple Town, Tilak Road, Gandhi Road, Korlagunta ×2.
- `/api/destinations` → 3 (Bengaluru, Mumbai, Tirupati). Tirupati destination foods → 1
  (Tirupati Laddu). Tirupati attractions (`places` table) → **0 rows live** (Batch-011's 16
  reviewed candidates remain owner-blocked; candidate file + sha256s unchanged).
- Batch inventory: batches 001-009 applied & verified historically; batch-011 (16 POI rows)
  pending owner SQL; migration-010 (push) pending owner VAPID env.
- Existing Tirupati-area seed docs: `docs/image-inventory.md` (102 rows across the four
  previously requested place sets).

Gap this pass must close: Tirupati has **6** food/stay rows and **0** POI rows in production —
the master sweep targets the broad inventory the owner asked for, as generated review batches
(docs + SQL candidates), with owner execution as the final step.
