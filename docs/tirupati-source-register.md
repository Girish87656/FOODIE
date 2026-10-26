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
| https://tirupati.ap.gov.in/ | FAILED (connection) | — | 0 names | LIMITATION: district official site unreachable from sandbox network. Single curl attempt (per task directive): curl -sSL exited with http_code=000 (connection could not be established). Not retried further. No content recorded from it. |
| https://tourism.ap.gov.in/ | FAILED (connection) | — | 0 names | LIMITATION: AP Tourism official site unreachable from sandbox network. Single curl attempt (per task directive): http_code=000. Not retried further. No content recorded from it. |

Fetch UA: `FOODIE-Research/1.0 (place-discovery-audit)`. Verbatim-quote integrity self-check: 5/5 located word-for-word in the saved raw HTML.

## 2. Inaccessible official domains (recorded limitations)

| Source | Result | Consequence |
|---|---|---|
| https://tirupati.ap.gov.in/ (+ /tourist-places/ /religious-tourism/ /eco-tourism/) | connection failed from sandbox network (3 attempts incl. browser UA) | content enters ONLY via quoted snippets in search results, attributed; NOT counted as reviewed pages |
| https://tourism.ap.gov.in/ | connection failed (same) | same |
| https://www.tirumala.org/PlacesatTirumala.aspx, /MoreTemples.aspx, /RestHousesInTirumala.aspx, /ttdklmps.aspx, S.V. Museum.aspx | discovered via nav, NOT yet fetched | explicit backlog for the next pass |

## 3. Search channel

z-ai `web_search` (multi-engine public web results): **115 discovery queries** across
9 category groups × 8 locality groups, returning **854 raw hits**.
Rate limits: the backend hard-throttled during the pass (HTTP 429s with documented back-offs);
0 queries ended in a recorded error state and 74 identity verifications were
rate-limit-skipped (all re-runnable — the pipeline is resumable per query/candidate).

## 4. Identity-verification + geocoding channels

- Identity verification: **104 candidates verified** so far — 26 area-confirmed,
  4 not confirmed, 74 skipped (rate limit). Remaining candidates keep their
  discovery-hit evidence and stay T3/backlog until verified.
- Geocoding: OpenStreetMap Nominatim (keyless, 1 req/s, project UA, area-gated):
  28 attempts → **1 area-confirmed matches, 27 NULL** (coordinates are
  NEVER estimated; every NULL is recorded with its reason in geocode-*.json).

## 5. Public listing platforms (via search snippets only — no page scraping)

Hosts that actually surfaced allow-listed hits in this pass:
- `www.justdial.com` — 56 curated reference(s)
- `www.tirumala.org` — 27 curated reference(s)
- `www.tripadvisor.com` — 25 curated reference(s)
- `en.wikipedia.org` — 17 curated reference(s)
- `www.zomato.com` — 14 curated reference(s)
- `www.swiggy.com` — 11 curated reference(s)
- `www.facebook.com` — 8 curated reference(s)
- `www.incredibleindia.gov.in` — 5 curated reference(s)
- `magicpin.in` — 3 curated reference(s)
- `www.makemytrip.com` — 3 curated reference(s)
- `www.district.in` — 2 curated reference(s)
- `news.tirumala.org` — 2 curated reference(s)
- `wanderlog.com` — 1 curated reference(s)
- `www.goibibo.com` — 1 curated reference(s)
- `tirupati.ap.gov.in` — 1 curated reference(s)
- `obms-tourist.rajasthan.gov.in` — 1 curated reference(s)
- `irrigation.ap.gov.in` — 1 curated reference(s)
- `indiacinehub.gov.in` — 1 curated reference(s)
- `www.holidify.com` — 1 curated reference(s)
- `www.agoda.com` — 1 curated reference(s)
- `www.booking.com` — 1 curated reference(s)

Usage policy: only the identity of a listing (name + URL + public snippet) is used as evidence;
listing pages are NOT scraped wholesale, no descriptions are copied, no Google Maps bulk
harvesting was attempted (their terms prohibit it), and no copyrighted photo was downloaded.
