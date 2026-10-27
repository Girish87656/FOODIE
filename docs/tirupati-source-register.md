# FOODIE — Tirupati Discovery Source Register
Sources ACTUALLY reviewed during the master discovery pass (access date 2026-10-26).
A source that could not be accessed is recorded as a limitation — never silently skipped.

## 1. Official pages (fetched directly, HTTP status recorded)

| Source | Status | Size | Extracted | Notes |
|---|---|---|---|---|
| https://www.tirumala.org/PlacesToVisit.aspx | 200 OK | 56815 B | 10 names | TTD official hub page 'Places to Visit'. Left-nav temple directory + section link to PlacesatTirumala.aspx. |
| https://www.tirumala.org/TemplesAtTirupathi.aspx | 200 OK | 75393 B | 24 names | TTD official page: 6 main TTD-managed Tirupati temples (anchors id1-id6) + 16-18 numbered sub-temples in the Govindarajaswami premises. |
| https://www.tirumala.org/ | 200 OK | 217085 B | 11 names | TTD homepage: fetched for nav discovery. Body is news/announcements; value = nav links to other official place/temple/accommodation pages. Nav labels quoted; 'name' here = nav label, not a place claim. |
| https://www.tirumala.org/Places%20to%20see%20around%20Tirumala.aspx | 200 OK | 54108 B | 24 names | TTD official 'Places To Visit Around Tirumala': 13 must-visit places + 11 named teerthams, both as prose lists (no per-place links). |
| https://www.tirumala.org/AccommodationAtTirumala.aspx | 200 OK | 57021 B | 6 names | TTD official accommodation page for Tirumala: 4 named guest-house/cottage AREAS + free choultries & dormitory halls described in prose. No individual named choultry list on this page. |
| https://www.tirumala.org/AccommodationAtTirupati.aspx | 200 OK | 67878 B | 7 names | TTD official accommodation page for Tirupati: 7 named choultries/guest houses with contact + rates (Rs.50-1300) in the page tables. |
| https://www.tirumala.org/TemplesAtTiruchanoor.aspx | 200 OK | 75302 B | 6 names | TTD official Tiruchanoor (Sri Padmavathi) page: 2 sub-shrines inside the Padmavathi compound + Suryanarayana (opposite Padma Sarovaram) + 2 outside temples under SRI PAT (Appalayagunta, Thondamanadu). |
| https://www.incredibleindia.gov.in/en/andhra-pradesh/tirupati | 200 OK | 592196 B | 15 names | Ministry of Tourism 'Incredible India' Tirupati destination page. NOT a Next.js shell as anticipated: server-rendered HTML (AEM path content/incredible-india-v2; 0 self.__next_f chunks, 0 __NEXT_DATA__) — full text + 10 attraction card links extractable. |
| https://www.tirumala.org/PlacesatTirumala.aspx | 200 OK | 61784 B | 6 names | TTD official 'Places at Tirumala' (batch 2). 4 named temples (incl. TWO distinct Anjaneya temples per the page's own prose) + Swami Pushkarini + Silathoranam. |
| https://www.tirumala.org/S.V. Museum.aspx | 200 OK | 69029 B | 2 names | TTD official S.V. Museum page (batch 2): museum officially named Sri Venkateswara Dhyana Jnana Mandiram, Tirumala; 6000+ items, ten sections. |
| https://www.tirumala.org/RestHousesInTirumala.aspx | 200 OK | 76257 B | 34 names | TTD official Rest Houses in Tirumala (batch 2): 34 named rows across 4 sections (Sri Padmavathi GH Area 15, Sri Venkateswara GH Area 6 named, TBC Area 12, Marriage Halls 1 new name) with official rates. NOT extracted (recorded here instead): 'NGC VVGH HRG MBC Cottages' row — internal booking codes, not a place name. |
| https://www.tirumala.org/ttdklmps.aspx | 200 OK | 113640 B | 2 names | TTD official Kalyana Mandapam directory (batch 2): ~160 rows across Indian cities/towns. SCOPE FINDING: ZERO Tirupati or Tirumala rows in the directory table (checked programmatically — 'Tirupati'/'Tirumala' hits are all page-nav text, not table rows). Page reviewed and recorded; NO candidates from it — out of Tirupati scope by the page's own content. |
| https://www.tirumala.org/MoreTemples.aspx | 200 OK | 149703 B | 15 names | TTD official 'More Temples' (batch 2): 9 Tirupati-region TTD-managed temple candidates + 4 sub-temple names 'in Pattabhiramalayam' (location unstated on page — kept as evidence only) + 2 OUT-OF-REGION Kadapa temples (recorded, excluded from inventory by scope). |
| https://www.tirumala.org/KalyanaKatta.aspx | 200 OK | 60092 B | 6 names | TTD official Kalyana Katta page (batch 3): main tonsuring centre + 5 named rest houses carrying Kalyanakatta counters. Internal shift-table codes (KKC/PAC1/PAC2/SPRH/SVRH/GNC/NDRH/HVC/KTRH/SGRH) recorded here but NOT extracted as place names. |
| https://www.tirumala.org/PackageTours.aspx | 200 OK | 57022 B | 13 names | TTD official Package Tours page (batch 3): Local Temples Tour (6 named stops) + Surrounding Temples Tour (7 named stops) with fares/durations. Tour logistics (Srinivasam/Vishnu Nivasam start points) quoted in prose. |
| https://www.tirumala.org/TirumalatoTirupathiOnFoot.aspx | 200 OK | 56585 B | 3 names | TTD official On-Foot page (batch 3): two sopanamargas with named access points (Alipiri start, Gali Gopuram, Srivari Mettu) + pilgrim facilities (luggage token, P.A.C., free buses). |
| https://www.tirumala.org/MoreLinks.aspx | 200 OK | 61728 B | 0 names | TTD 'More Links' directory page (batch 3): reviewed; NO new place names (only links to already-covered pages/services). Recorded as an honest negative so nav coverage is complete. |
| https://www.incredibleindia.gov.in/en/andhra-pradesh/tirupati/sri-venkateswara-swamy-vaari-temple | 200 OK | 460135 B | 1 names | Incredible India attraction sub-page for the main temple (batch 3): the ONLY attraction sub-link embedded in the saved Tirupati destination page. Server-rendered like the parent page. Names only the main temple (already Batch-011 candidate) — recorded for source completeness. |
| https://tirupati.ap.gov.in/ | FAILED (connection) | — | 0 names | LIMITATION: district official site unreachable from sandbox network. Single curl attempt (per task directive): curl -sSL exited with http_code=000 (connection could not be established). Not retried further. No content recorded from it. |
| https://tourism.ap.gov.in/ | FAILED (connection) | — | 0 names | LIMITATION: AP Tourism official site unreachable from sandbox network. Single curl attempt (per task directive): http_code=000. Not retried further. No content recorded from it. |

Fetch UA: `FOODIE-Research/1.0 (place-discovery-audit)`. Verbatim-quote integrity self-check: 20/20 located word-for-word in the saved raw HTML.

## 2. Inaccessible official domains (recorded limitations)

| Source | Result | Consequence |
|---|---|---|
| https://tirupati.ap.gov.in/ (+ /tourist-places/ /religious-tourism/ /eco-tourism/) | connection failed from sandbox network (3 attempts incl. browser UA) | content enters ONLY via quoted snippets in search results, attributed; NOT counted as reviewed pages |
| https://tourism.ap.gov.in/ | connection failed (same) | same |
| https://ttdevasthanams.ap.gov.in/ + https://tirupatibalaji.ap.gov.in/ | connection failed (recorded) | TTD's alternate domains remain unreachable from the sandbox; tirumala.org content is used instead |

## 3. Search channel

z-ai `web_search` (multi-engine public web results): **251 discovery queries** across
9 category groups × 8 locality groups, returning **1858 raw hits**.
Rate limits: the backend hard-throttled during the pass (HTTP 429s with documented back-offs);
0 queries ended in a recorded error state and 118 identity verifications were
rate-limit-skipped (all re-runnable — the pipeline is resumable per query/candidate).

## 4. Identity-verification + geocoding channels

- Identity verification: **304 candidates verified** so far — 165 area-confirmed,
  21 not confirmed, 118 skipped (rate limit). Remaining candidates keep their
  discovery-hit evidence and stay T3/backlog until verified.
- Geocoding: OpenStreetMap Nominatim (keyless, 1 req/s, project UA, area-gated):
  170 attempts → **19 area-confirmed matches, 151 NULL** (coordinates are
  NEVER estimated; every NULL is recorded with its reason in geocode-*.json).

## 5. Public listing platforms (via search snippets only — no page scraping)

Hosts that actually surfaced allow-listed hits in this pass:
- `www.justdial.com` — 138 curated reference(s)
- `www.tirumala.org` — 71 curated reference(s)
- `www.tripadvisor.com` — 30 curated reference(s)
- `en.wikipedia.org` — 19 curated reference(s)
- `www.zomato.com` — 18 curated reference(s)
- `www.facebook.com` — 14 curated reference(s)
- `www.swiggy.com` — 12 curated reference(s)
- `magicpin.in` — 8 curated reference(s)
- `www.incredibleindia.gov.in` — 5 curated reference(s)
- `www.makemytrip.com` — 5 curated reference(s)
- `www.district.in` — 4 curated reference(s)
- `www.booking.com` — 3 curated reference(s)
- `wanderlog.com` — 2 curated reference(s)
- `www.agoda.com` — 2 curated reference(s)
- `www.eazydiner.com` — 1 curated reference(s)
- `www.goibibo.com` — 1 curated reference(s)
- `tirupati.ap.gov.in` — 1 curated reference(s)
- `news.tirumala.org` — 1 curated reference(s)
- `obms-tourist.rajasthan.gov.in` — 1 curated reference(s)
- `or.wikipedia.org` — 1 curated reference(s)
- `ttdevasthanams.ap.gov.in` — 1 curated reference(s)
- `ignca.gov.in` — 1 curated reference(s)
- `irrigation.ap.gov.in` — 1 curated reference(s)
- `indiacinehub.gov.in` — 1 curated reference(s)
- `www.holidify.com` — 1 curated reference(s)

Usage policy: only the identity of a listing (name + URL + public snippet) is used as evidence;
listing pages are NOT scraped wholesale, no descriptions are copied, no Google Maps bulk
harvesting was attempted (their terms prohibit it), and no copyrighted photo was downloaded.

## 6. Batch-4 direct sources (fetched WITHOUT any search provider, 2026-10-27)

The z-ai web_search provider stayed quota-exhausted (HTTP 429) — ONE bounded probe this session,
then paused per protocol. These sources were fetched directly instead:

### 6a. tirumala.org official pages (batch-4 additions)

| Source | Status | Size | Result |
|---|---|---|---|
| https://www.tirumala.org/garden.aspx | 200 | 218151 B | HOMEPAGE SHELL — dead/retired URL, no place content (recorded limitation) |
| https://www.tirumala.org/theerthams.aspx | 200 | 218151 B | HOMEPAGE SHELL — dead/retired URL, no place content (recorded limitation) |
| https://www.tirumala.org/marriagehallcotteges.aspx | 200 | 61898 B | real page: Marriage halls and Cottages |
| https://www.tirumala.org/sripadmavathiguesthouse.aspx | 200 | 59685 B | real rate-table page: Sri Padmavathi Guest House |
| https://www.tirumala.org/srivenkateswaraguesthouse.aspx | 200 | 55624 B | real rate-table page: Sri Venkateswara Guest House |
| https://www.tirumala.org/varahaswamiguesthouse.aspx | 200 | 60566 B | real rate-table page: VarahaSwami Guest House |
| https://www.tirumala.org/varahaswamytirumala.aspx | 200 | 218151 B | HOMEPAGE SHELL — dead/retired URL, no place content (recorded limitation) |

Extracted 42 TTD accommodation venue names from the 4 real rate-table
pages (official/official2-extractions.json) — documentary corroboration for the batch-013 queued
accommodation rows; NOT new candidates.

### 6b. English Wikipedia article pages

| Article | Area | Status | Entries | Page coord published |
|---|---|---|---|---|
| Tirupati | tpt-central | 200 | 81 | yes |
| Tirumala | tirumala | 200 | 86 | yes |
| Tirumala Venkateswara Temple | tirumala | 200 | 142 | no |
| Alamelu Mangapuram | tiruchanur | 200 | 15 | no |
| Srinivasa Mangapuram | srinivasa-mangapuram | 200 | 14 | yes |
| Chandragiri | chandragiri | 200 | 15 | yes |
| Srikalahasti | surrounding | 200 | 9 | yes |
| Nagalapuram | surrounding | 200 | 12 | yes |
| Talakona | surrounding | 200 | 19 | no |
| Kapila Theertham | tpt-central | 200 | 16 | no |
| Sri Venkateswara National Park | surrounding | 200 | 28 | no |
| Narayanavanam | surrounding | 200 | 4 | yes |
| Kalyani Dam | surrounding | 200 | 23 | no |
| Sri Venkateswara Zoological Park | tpt-neighbourhoods | 200 | 21 | yes |
| Renigunta | renigunta | 200 | 9 | yes |

494 place-link entries (dedup per page) with verbatim sentence quotes; article-subject
coordinates recorded only where Wikipedia itself publishes one — coordinates are NEVER inferred.
api.php limitation: en.wikipedia.org api.php returned HTTP 429 from this shared sandbox egress IP (recorded limitation); ARTICLE pages fetch fine and were used instead. Bounded set, >=4 s spacing, page-subject data only — no bulk harvesting.

### 6c. Independent-source crossmatch + review queue

- Corpus: 352 unique source names → **41 corroborate existing
  inventory names**, 53 weak partial overlaps, 133 genuinely new names queued for
  review (review-queue-new-names.json — leads only, never counted as candidates).
- 6 pending candidates received an independent-source locality confirmation
  (crossmatch-*.json; inventory §Batch-4 lists them).
