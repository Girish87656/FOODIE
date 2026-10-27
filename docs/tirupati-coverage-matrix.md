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
