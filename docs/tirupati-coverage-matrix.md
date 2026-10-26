# FOODIE — Tirupati Discovery Coverage Matrix
Locality × category coverage after the first master sweep (2026-10-26).
Status is per AREA × GROUP cell: queries run / raw hits / curated candidates. "not searched"
cells are honest gaps with a next action — completeness is never claimed while gaps remain.

| Area | Restaurants & messes | Tiffin & breakfast centres | Street food, tea & juice stalls | Bakeries, sweets & ice cream | Cafés & coffee | Temples & sacred sites | Tourist attractions | Stays & pilgrim accommodation | Markets & shopping |
|---|---|---|---|---|---|---|---|---|---|
| Tirupati city centre | 7q / 49h / **4c** | 5q / 38h / **3c** | 5q / 31h / **5c** | 5q / 42h / **9c** | 3q / 18h / **2c** | 10q / 77h / **5c** | 7q / 52h / **3c** | 6q / 51h / **1c** | 5q / 39h / **4c** |
| Tirupati residential neighbourhoods | 6q / 45h / **7c** | 3q / 14h / **12c** | 2q / 15h / **4c** | 2q / 15h / **11c** | 1q / 8h / **4c** | 4q / 29h / **2c** | 2q / 8h / **1c** | 2q / 10h / **0c** | 2q / 18h / **4c** |
| Tirumala hills | 2q / 17h / **6c** | 1q / 6h / **4c** | 1q / 6h / **0c** | 2q / 15h / **3c** | 1q / 7h / **2c** | 6q / 44h / **4c** | 3q / 14h / **1c** | 3q / 27h / **2c** | 1q / 8h / **1c** |
| Tiruchanur (Alamelu Mangapuram corridor) | 1q / 7h / **0c** | 1q / 9h / **1c** | 1q / 8h / **0c** | 1q / 6h / **2c** | 1q / 7h / **2c** | 1q / 10h / **0c** | 1q / 0h / **0c** | 1q / 9h / **0c** | 1q / 8h / **0c** |
| Srinivasa Mangapuram (~10 km west) | 1q / 7h / **0c** | 1q / 5h / **1c** | 1q / 5h / **0c** | 1q / 7h / **0c** | 1q / 7h / **0c** | 1q / 7h / **0c** | 1q / 8h / **0c** | 1q / 9h / **0c** | 1q / 7h / **1c** |
| Chandragiri (~12-14 km south-west) | 1q / 8h / **1c** | 1q / 5h / **1c** | 1q / 5h / **1c** | 1q / 8h / **2c** | 1q / 0h / **0c** | 2q / 13h / **1c** | 2q / 17h / **0c** | 1q / 10h / **0c** | 1q / 8h / **0c** |
| Renigunta (airport/junction corridor, ~10-12 km north) | 1q / 9h / **2c** | 1q / 7h / **1c** | 1q / 8h / **0c** | 1q / 7h / **2c** | 1q / 8h / **3c** | 1q / 8h / **1c** | 1q / 8h / **0c** | 2q / 20h / **0c** | 1q / 8h / **2c** |
| Surrounding destinations (beyond city/Tirumala core) | 2q / 16h / **0c** | 1q / 6h / **0c** | 1q / 7h / **0c** | 1q / 8h / **0c** | 1q / 7h / **0c** | 2q / 17h / **3c** | 8q / 60h / **4c** | 1q / 9h / **0c** | 1q / 7h / **0c** |

(q = discovery queries run; h = raw hits; c = curated candidates)

## Honest gaps & next actions


## Verification backlog

- 87 T3 candidates still need their independent verification query (`research-tirupati-master.ts verify`, resumable; rate-limited to ~9 candidates/9 min at current backend throttling).
- 98 geocode attempts returned no area-gated match; re-run after verification upgrades for a second chance at coordinates.
- Official TTD pages discovered but unfetched: PlacesatTirumala.aspx, MoreTemples.aspx, RestHousesInTirumala.aspx, ttdklmps.aspx, S.V. Museum.aspx.
- District/AP-tourism domains remain network-blocked from this sandbox; retry from a network with access, or provide exported content.
