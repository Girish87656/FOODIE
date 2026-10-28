# FOODIE — Tirupati Discovery Coverage Matrix
Locality × category coverage after the first master sweep (2026-10-26).
Status is per AREA × GROUP cell: queries run / raw hits / curated candidates. "not searched"
cells are honest gaps with a next action — completeness is never claimed while gaps remain.

| Area | Restaurants & messes | Tiffin & breakfast centres | Street food, tea & juice stalls | Bakeries, sweets & ice cream | Cafés & coffee | Temples & sacred sites | Tourist attractions | Stays & pilgrim accommodation | Markets & shopping |
|---|---|---|---|---|---|---|---|---|---|
| Tirupati city centre | 7q / 49h / **4c** | 8q / 56h / **4c** | 8q / 52h / **11c** | 8q / 66h / **10c** | 4q / 25h / **3c** | 14q / 111h / **17c** | 11q / 86h / **8c** | 9q / 79h / **7c** | 9q / 72h / **12c** |
| Tirupati residential neighbourhoods | 6q / 45h / **7c** | 5q / 31h / **14c** | 4q / 31h / **4c** | 4q / 34h / **12c** | 1q / 8h / **4c** | 7q / 51h / **4c** | 4q / 25h / **5c** | 4q / 29h / **0c** | 4q / 35h / **4c** |
| Tirumala hills | 2q / 17h / **6c** | 2q / 14h / **4c** | 2q / 15h / **1c** | 3q / 24h / **4c** | 2q / 12h / **3c** | 8q / 61h / **13c** | 5q / 26h / **8c** | 5q / 39h / **30c** | 2q / 18h / **2c** |
| Tiruchanur (Alamelu Mangapuram corridor) | 2q / 16h / **0c** | 2q / 10h / **1c** | 2q / 17h / **1c** | 2q / 13h / **3c** | 1q / 7h / **2c** | 3q / 25h / **3c** | 2q / 6h / **0c** | 2q / 17h / **1c** | 2q / 16h / **2c** |
| Srinivasa Mangapuram (~10 km west) | 2q / 17h / **0c** | 2q / 10h / **1c** | 1q / 5h / **0c** | 1q / 7h / **0c** | 1q / 7h / **0c** | 2q / 16h / **0c** | 1q / 8h / **0c** | 2q / 19h / **1c** | 1q / 7h / **1c** |
| Chandragiri (~12-14 km south-west) | 2q / 18h / **2c** | 2q / 9h / **1c** | 2q / 13h / **1c** | 2q / 17h / **2c** | 1q / 0h / **0c** | 3q / 21h / **2c** | 4q / 31h / **0c** | 2q / 20h / **0c** | 2q / 17h / **0c** |
| Renigunta (airport/junction corridor, ~10-12 km north) | 2q / 16h / **2c** | 2q / 16h / **4c** | 2q / 8h / **0c** | 2q / 16h / **5c** | 2q / 17h / **5c** | 2q / 17h / **4c** | 2q / 17h / **2c** | 3q / 30h / **0c** | 1q / 8h / **3c** |
| Surrounding destinations (beyond city/Tirumala core) | 4q / 33h / **1c** | 3q / 18h / **0c** | 2q / 8h / **0c** | 2q / 8h / **0c** | 2q / 16h / **0c** | 5q / 35h / **16c** | 11q / 73h / **6c** | 3q / 26h / **0c** | 2q / 16h / **0c** |

(q = discovery queries run; h = raw hits; c = curated candidates)

## Honest gaps & next actions


## Verification backlog

- 137 T3 candidates still need their independent verification query (`research-tirupati-master.ts verify`, resumable; rate-limited to ~9 candidates/9 min at current backend throttling).
- 151 geocode attempts returned no area-gated match; re-run after verification upgrades for a second chance at coordinates.
- Official TTD pages PlacesatTirumala.aspx, MoreTemples.aspx, RestHousesInTirumala.aspx, ttdklmps.aspx and S.V. Museum.aspx were FETCHED in the batch-2 pass (HTTP 200, verbatim quotes in evidence/official/) — the 28 TTD rest-house/cottage rows in batch-013 come straight from the official rates page.
- District/AP-tourism domains remain network-blocked from this sandbox; retry from a network with access, or provide exported content.

## Batch-4 direct-source evidence (no search provider, 2026-10-27)

- web_search: still HTTP 429 (one bounded probe, then paused per protocol) — the limitation is recorded, not worked around.
- tirumala.org batch-4: 4 real accommodation/rate pages landed; 3 URLs (garden.aspx, theerthams.aspx, varahaswamytirumala.aspx) served the homepage shell — dead links, recorded as limitations, never treated as content.
- Wikipedia (bounded 15-article set, ≥4 s spacing): 494 place-link entries + published article coordinates only.
- Independent-source corroboration: 6 pending rows confirmed (list in the inventory doc).
- Review queue: 133 genuinely new unverified leads (priority-tiered) + 53 weak overlaps — NOT added as candidates; human research required first.
- Small food businesses (tiffin centres, tea stalls, messes, bakeries) could NOT be expanded in the BATCH-4 pass itself — see the Batch-5 section below where this gap is finally addressed with resumed search + direct sources.

## Batch-5 evidence (web_search RESUMED + bounded direct sources, 2026-10-28)

- web_search availability: ONE bounded probe → provider AVAILABLE — bounded verification may resume this session (3 results on the probe query). Bounded discovery then ran: 19 locality×category queries + 4 queue-lead checks (8 s pacing; 0 throttles, breaker never tripped).
- Nominatim: 12 bounded keyword POI queries inside the Tirupati viewbox (`79.25,13.78,79.55,13.50`) → 21 raw hits; published coordinates recorded in evidence ONLY (never imported).
- Wikivoyage https://en.wikivoyage.org/wiki/Tirupati: HTTP 403 — fetch failed (HTTP 403) — recorded as limitation.
- Wikipedia targeted re-fetch (Vaikuntam Queue Complex): HTTP 200 — page served but target strings absent — lead stays queued.
- Wikipedia targeted re-fetch (Siddheswara Swamy Temple): HTTP 200 — content retrieved; findings require manual locality check.
- Review queue: all 133 leads manually assessed on their exact quotations → 3 accepts (routed to Batch-015), 18 corroborations of existing records, 53 generic rejects, 54 out-of-scope rejects, 5 stay ambiguous in the queue.
- Tirumala gardens/teerthams: the dead official shells were worked around WITHOUT new fetches — the already-saved official page places-around-tirumala.aspx verbatim lists Gogarbham Gardens, Dharmagiri, Narayangiri, Asthana Mandapams and 11 teerthams; 9 teerthams + Gogarbham/Dharmagiri/Narayangiri/Asthana Mandapam became Batch-015 candidates, the remaining names corroborated existing rows.
- Small food businesses: THE BIGGEST KNOWN GAP IS NOW PARTIALLY COVERED — 13 tiffin centres, 9 tea-stall/juice/street vendors, 5 bakery/sweet shops, 14 restaurants and 1 cafe accepted into Batch-015 (42 food rows total, all UNVERIFIED review candidates; coverage is still directory/mapped-POI grade, not field-verified).
- Verification backlog RESUMED (bounded): 4 chunks × 12 candidates = 48 attempted this session — 45 area-confirmed (13 with address evidence), 3 not-confirmed (negative evidence recorded); 0 throttled. Remaining backlog: 58 never-attempted + 68 throttled-stubs = 126 (down from 174).
- Remaining honest gaps: 38 weak leads queued; 4 identity-holds (Indira Guest House / Reddy Tea Stall / 2 Balaji-name rows); Puttur-town venue evidence; Venugopalaswamy Karvetinagaram navbox-only leads now corroborated but still pending verify; menus, hours, photos; the 126-row verification backlog. NOT exhaustive.
