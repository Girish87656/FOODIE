# FOODIE — Tirupati Master Place Inventory
Generated 2026-10-27 by scripts/foodie-enrichment/gen-tirupati-docs.ts from
committed evidence (worksheets/tirupati-master-curated.json). Nothing on this page is
hand-typed — every row traces to an evidence file.

**Verification policy (docs/tirupati-place-discovery-plan.md §3):** these statuses are the
DOC-LEVEL review layer. DB rows imported from this inventory always carry
`verification_status='unverified'` — an import never self-verifies.

- **VERIFIED** (T1) — the candidate survived an independent identity-verification search
  (`"<name>" Tirupati address`) whose results re-confirmed the area token.
- **PARTIALLY VERIFIED** (T2) — an official page (tirumala.org / incredibleindia.gov.in)
  names the place; verbatim quote stored; no independent re-check yet.
- **UNVERIFIED** (T3) — plausible candidate from a single area-gated listing hit;
  discoverable internally, never shown as verified to users.

**Counts:** 351 raw candidates → 273 curated
({"T1":81,"T3":137,"T2":55}) → 13 possible duplicates
(queued) → 65 dropped with recorded reasons.

**Review candidates queued for owner execution:** Batch-012 = 29 rows (10 T1 restaurants +
19 T2 places) + Batch-013 = 57 rows (17 T1 food venues + 40 POI/stay places) + Batch-014 =
27 rows (22 T1 restaurants + 5 T1 locality-disambiguated temples, all coordinates null by
design) = **113 rows**, plus 5 verify-confirmed candidates HELD inventory-only (names too
generic to admit without stronger identity evidence — see duplicate-review §B/batch-013
header). No batch is executed; all await owner approval.

## Tirupati city centre

### Restaurants & messes

| Place | Status | Locality hint | DB target | Sources (kind) | Import batch | Coordinates | Notes |
|---|---|---|---|---|---|---|---|
| Garuda Cafe | VERIFIED | — | restaurants | facebook-page | YES → batch-012 (restaurants) | null (never estimated) | address-pattern evidence recorded |
| Bhai Ka Biryani | VERIFIED | Gandhi Road | restaurants | justdial | YES → batch-012 (restaurants) | null (never estimated) | address-pattern evidence recorded |
| Mana Hari Villu Family Restaurant | UNVERIFIED | — | restaurants | zomato | no (T3 backlog) | null (never estimated) | — |
| Mayura Garden Family Restaurant, Korlagunta | UNVERIFIED | — | restaurants | zomato | no (T3 backlog) | null (never estimated) | — |

### Tiffin & breakfast centres

| Place | Status | Locality hint | DB target | Sources (kind) | Import batch | Coordinates | Notes |
|---|---|---|---|---|---|---|---|
| Vinayaka Tiffin Centre | UNVERIFIED | Tirupati Bazar | restaurants | justdial | no (T3 backlog) | null (never estimated) | — |
| Sri Venkateswara Tiffin Center | UNVERIFIED | KT Road | restaurants | justdial | no (T3 backlog) | null (never estimated) | — |
| Nagarjuna Military Mess | UNVERIFIED | — | restaurants | facebook-page | no (T3 backlog) | null (never estimated) | — |
| 99 variety Dosa | Street Food | UNVERIFIED | — | restaurants | facebook-page | no (T3 backlog) | null (never estimated) | address-pattern evidence recorded |

### Street food, tea & juice stalls

| Place | Status | Locality hint | DB target | Sources (kind) | Import batch | Coordinates | Notes |
|---|---|---|---|---|---|---|---|
| Ganapathi Juice Shop | UNVERIFIED | Tilak Road | restaurants | justdial | no (T3 backlog) | null (never estimated) | — |
| Mr's Juice Bar | UNVERIFIED | Kapilateertham Road | restaurants | justdial | no (T3 backlog) | null (never estimated) | — |
| Ganesh Juice Center | UNVERIFIED | Tilak Road | restaurants | justdial | no (T3 backlog) | null (never estimated) | — |
| Hygien Pani Puri Hot Chats | UNVERIFIED | — | restaurants | swiggy | no (T3 backlog) | null (never estimated) | — |
| Pani Puri Centre | UNVERIFIED | — | restaurants | wanderlog | no (T3 backlog) | null (never estimated) | — |
| Mirchi Bajji Point | VERIFIED | — | restaurants | wanderlog | no (identity-held — see batch-014 header for hold reason) | null (never estimated) | address-pattern evidence recorded |
| Vasavi Snack Bazar | UNVERIFIED | — | restaurants | facebook-page | no (T3 backlog) | null (never estimated) | — |
| Ramadevi Foods Store | VERIFIED | — | restaurants | facebook-page | YES → batch-014 (restaurants) | null (never estimated) | address-pattern evidence recorded |
| The Sugar Cane Co | VERIFIED | — | restaurants | justdial | YES → batch-014 (restaurants) | null (never estimated) | address-pattern evidence recorded |
| Eswar Sugar Cane Shop | VERIFIED | — | restaurants | justdial | YES → batch-014 (restaurants) | null (never estimated) | address-pattern evidence recorded |
| Ganesh Juice Corner | VERIFIED | Tilak Road | restaurants | justdial | YES → batch-014 (restaurants) | null (never estimated) | address-pattern evidence recorded |

### Bakeries, sweets & ice cream

| Place | Status | Locality hint | DB target | Sources (kind) | Import batch | Coordinates | Notes |
|---|---|---|---|---|---|---|---|
| Mayura Bakery | UNVERIFIED | Gandhi Road | restaurants | justdial | no (T3 backlog) | null (never estimated) | — |
| Babas Bakery | UNVERIFIED | TK Street | restaurants | justdial | no (T3 backlog) | null (never estimated) | — |
| Amrutha Swagruha Foods | VERIFIED | — | restaurants | swiggy | YES → batch-014 (restaurants) | null (never estimated) | address-pattern evidence recorded |
| Cream Stone | UNVERIFIED | Tata Nagar | restaurants | justdial | no (T3 backlog) | null (never estimated) | — |
| Havmor Ice Cream | UNVERIFIED | Ramanuja Circle | restaurants | justdial | no (T3 backlog) | null (never estimated) | — |
| Grand Cakes & Bakes | UNVERIFIED | Nethaji Road | restaurants | justdial | no (T3 backlog) | null (never estimated) | — |
| Balaji Bakery And Sweets | UNVERIFIED | — | restaurants | justdial | no (T3 backlog) | null (never estimated) | — |
| Mithaiwala | UNVERIFIED | KT Road | restaurants | justdial | no (T3 backlog) | null (never estimated) | — |
| Tirumala Bakery | VERIFIED | Tirupati Bazar | restaurants | justdial | YES → batch-014 (restaurants) | null (never estimated) | address-pattern evidence recorded |
| Tirumala Sweets | VERIFIED | Gandhi Road | restaurants | justdial | YES → batch-013 (restaurants) | null (never estimated) | address-pattern evidence recorded |

### Cafés & coffee

| Place | Status | Locality hint | DB target | Sources (kind) | Import batch | Coordinates | Notes |
|---|---|---|---|---|---|---|---|
| Minerva Coffee Shop | VERIFIED | — | restaurants | tripadvisor | YES → batch-014 (restaurants) | null (never estimated) | address-pattern evidence recorded |
| Srinivasa Cafe | UNVERIFIED | Tilak Road | restaurants | justdial | no (T3 backlog) | null (never estimated) | — |
| Tea Time, Srinivasa Nagar | VERIFIED | — | restaurants | zomato | YES → batch-014 (restaurants) | null (never estimated) | address-pattern evidence recorded |

### Temples & sacred sites

| Place | Status | Locality hint | DB target | Sources (kind) | Import batch | Coordinates | Notes |
|---|---|---|---|---|---|---|---|
| Sri Govindaraja Swamy Temple, Tirupati | VERIFIED | — | places | official, wikipedia, tripadvisor | — (already Batch-011 candidate) | null (never estimated) | address-pattern evidence recorded; official verbatim quote stored; 3 listing titles merged |
| Sri Kalyana Venkateswara Swamy Temple, Srinivasa Mangapuram | VERIFIED | — | places | official, wikipedia, goibibo | — (already Batch-011 candidate) | null (never estimated) | address-pattern evidence recorded; 3 listing titles merged |
| Sri Kapileswara Swamy Temple (Kapila Theertham) | VERIFIED | — | places | wikipedia, official, tripadvisor, official | — (already Batch-011 candidate) | 13.65658, 79.42103 | address-pattern evidence recorded; official verbatim quote stored; 4 listing titles merged |
| Sri Padmavathi Ammavari Temple, Tiruchanur | VERIFIED | — | places | official, tripadvisor | — (already Batch-011 candidate) | 13.60797, 79.45001 | 2 listing titles merged |
| ISKCON | UNVERIFIED | — | places | tripadvisor | — (already Batch-011 candidate) | null (never estimated) | — |
| Anjaneya Swamy Temple, Vedullacheruvu | VERIFIED | — | places | justdial | YES → batch-014 (places) | null (never estimated) | address-pattern evidence recorded |
| Sri Bala Anjaneya Swamy Temple | VERIFIED | Gandhi Road | places | justdial, justdial | YES → batch-014 (places) | null (never estimated) | address-pattern evidence recorded; 2 listing titles merged |
| Anjaneya Temple, Bairagi Patteda | VERIFIED | — | places | justdial | YES → batch-014 (places) | null (never estimated) | address-pattern evidence recorded |
| Sri Anjaneya Swami Temple, Nehru Nagar | VERIFIED | — | places | justdial | YES → batch-014 (places) | null (never estimated) | address-pattern evidence recorded |
| Sri Anjaneya Swami Temple, Karakambadi | VERIFIED | — | places | justdial | YES → batch-014 (places) | null (never estimated) | address-pattern evidence recorded |
| Sri Vara Siddhi Vinayaka Ayyappa Swamy Temple | UNVERIFIED | — | places | justdial | no (T3 backlog) | null (never estimated) | — |
| Varasiddi Vinayaka Swamy Temple | UNVERIFIED | — | places | justdial | no (T3 backlog) | null (never estimated) | — |
| Sri Ramulavari Temple | UNVERIFIED | — | places | justdial | no (T3 backlog) | null (never estimated) | — |
| Venkateswara Temple | VERIFIED | — | places | justdial | — (already Batch-011 candidate) | 13.68312, 79.34685 | address-pattern evidence recorded |
| Tirupati Golden Temple in Tata Nagar | UNVERIFIED | Tata Nagar | places | justdial | no (T3 backlog) | null (never estimated) | — |
| Tirumala Mandir | UNVERIFIED | Alipiri | places | justdial | no (T3 backlog) | null (never estimated) | — |
| Sri Kodanda Ramaswamy Temple, Tirupati | PARTIALLY VERIFIED | — | places | official | YES → batch-013 (places) | null (never estimated) | official verbatim quote stored |

### Tourist attractions

| Place | Status | Locality hint | DB target | Sources (kind) | Import batch | Coordinates | Notes |
|---|---|---|---|---|---|---|---|
| Sri Venkateswara Zoological Park, Tirupati | VERIFIED | — | places | wikipedia, tripadvisor, tripadvisor | — (already Batch-011 candidate) | 13.62936, 79.36217 | address-pattern evidence recorded; 3 listing titles merged |
| Sri Venkateswara National Park | VERIFIED | — | places | wikipedia, tripadvisor, makemytrip | YES → batch-013 (places) | 13.79535, 79.29986 | address-pattern evidence recorded; 3 listing titles merged |
| Deer Park, Alipiri | VERIFIED | Alipiri | places | tripadvisor, justdial | YES → batch-013 (places) | null (never estimated) | address-pattern evidence recorded; 2 listing titles merged |
| Tirupati Historic Sites & Districts to Visit | UNVERIFIED | — | places | tripadvisor | no (T3 backlog) | null (never estimated) | — |
| Tirupati Regional Centre | UNVERIFIED | — | places | official | no (T3 backlog) | null (never estimated) | — |
| TTD Gardens | UNVERIFIED | — | places | makemytrip | no (T3 backlog) | null (never estimated) | — |
| Tirupati Artist Colony in Bommagunta | UNVERIFIED | — | places | justdial | no (T3 backlog) | null (never estimated) | — |
| Regional Science Centre, Tirupati | PARTIALLY VERIFIED | — | places | official | YES → batch-012 (places) | null (never estimated) | official verbatim quote stored |

### Stays & pilgrim accommodation

| Place | Status | Locality hint | DB target | Sources (kind) | Import batch | Coordinates | Notes |
|---|---|---|---|---|---|---|---|
| Accommodation at | UNVERIFIED | — | places | official | no (T3 backlog) | null (never estimated) | — |
| Treebo Sripadha Residency Alipiri Road | UNVERIFIED | Alipiri | places | booking | no (T3 backlog) | null (never estimated) | — |
| Sreenivasam Complex (TTD Pilgrim Accommodation) | PARTIALLY VERIFIED | — | places | official | YES → batch-012 (places) | null (never estimated) | official verbatim quote stored |
| Sri Venkateswara Dharmasala (TTD) | PARTIALLY VERIFIED | — | places | official | YES → batch-012 (places) | null (never estimated) | official verbatim quote stored |
| Sri Venkateswara Guest House, Tirupati | PARTIALLY VERIFIED | — | places | official | YES → batch-013 (places) | null (never estimated) | official verbatim quote stored |
| Sri Govindaraja Swamy Dharmasala (TTD) | PARTIALLY VERIFIED | — | places | official | YES → batch-012 (places) | null (never estimated) | official verbatim quote stored |
| Vishnu Nivasam (TTD Free Accommodation) | PARTIALLY VERIFIED | — | places | official | YES → batch-012 (places) | null (never estimated) | official verbatim quote stored |

### Markets & shopping

| Place | Status | Locality hint | DB target | Sources (kind) | Import batch | Coordinates | Notes |
|---|---|---|---|---|---|---|---|
| Lepakshi Handicrafts Emporium | UNVERIFIED | — | places | justdial | no (T3 backlog) | null (never estimated) | — |
| Garuda Mall | UNVERIFIED | Madhavapuram | places | justdial | no (T3 backlog) | null (never estimated) | — |
| Sirikala Shopping Mall | UNVERIFIED | — | places | justdial | no (T3 backlog) | null (never estimated) | — |
| Tirupathi Vegetable Market | UNVERIFIED | TK Street | places | justdial | no (T3 backlog) | null (never estimated) | — |
| Day Fresh vegetables | UNVERIFIED | Tirupati Bazar | places | justdial | no (T3 backlog) | null (never estimated) | — |
| APURVA TEXTILES | UNVERIFIED | — | places | justdial | no (T3 backlog) | null (never estimated) | — |
| Sunil Textiles | UNVERIFIED | — | places | justdial | no (T3 backlog) | null (never estimated) | — |
| 20+ 1 Gram Gold Jewellery Wholesalers | UNVERIFIED | — | places | justdial | no (T3 backlog) | null (never estimated) | — |
| 20+ 1 Gram White Gold Jewellery Dealers | UNVERIFIED | — | places | justdial | no (T3 backlog) | null (never estimated) | — |
| 20+ Italian 1 Gram Gold Jewellery Dealers | UNVERIFIED | — | places | justdial | no (T3 backlog) | null (never estimated) | — |
| AR SUPER SHOPPE | UNVERIFIED | Tirupati Bazar | places | justdial | no (T3 backlog) | null (never estimated) | — |
| Provision Plaza | UNVERIFIED | Gandhi Road | places | justdial | no (T3 backlog) | null (never estimated) | — |

## Tirupati residential neighbourhoods

### Restaurants & messes

| Place | Status | Locality hint | DB target | Sources (kind) | Import batch | Coordinates | Notes |
|---|---|---|---|---|---|---|---|
| Mayuri Restaurant | VERIFIED | Vidyut Nagar | restaurants | zomato | YES → batch-012 (restaurants) | null (never estimated) | address-pattern evidence recorded |
| Bhagni's Family Restaurant | UNVERIFIED | — | restaurants | district | no (T3 backlog) | null (never estimated) | — |
| Bhavani Bhojnalaya | UNVERIFIED | Ramchandra Nagar | restaurants | justdial | no (T3 backlog) | null (never estimated) | — |
| Manju Foods | VERIFIED | Bhavani Nagar | restaurants | justdial | YES → batch-012 (restaurants) | null (never estimated) | address-pattern evidence recorded |
| Shankar Chats | VERIFIED | MR Palli | restaurants | facebook-page | YES → batch-012 (restaurants) | null (never estimated) | address-pattern evidence recorded |
| Chillies Restaurant | VERIFIED | AIR Bypass Road | restaurants | swiggy | YES → batch-012 (restaurants) | null (never estimated) | address-pattern evidence recorded |
| Southern Spice, Avilala | VERIFIED | Avilala | restaurants | tripadvisor, zomato, swiggy, zomato | YES → batch-012 (restaurants) | null (never estimated) | 4 listing titles merged |

### Tiffin & breakfast centres

| Place | Status | Locality hint | DB target | Sources (kind) | Import batch | Coordinates | Notes |
|---|---|---|---|---|---|---|---|
| Kumari Tiffin Center | UNVERIFIED | Korlagunta | restaurants | justdial | no (T3 backlog) | null (never estimated) | — |
| Madras Tiffin Center | UNVERIFIED | Korlagunta | restaurants | justdial, justdial | no (T3 backlog) | null (never estimated) | — |
| Gayatri Tiffin Center | UNVERIFIED | Bhavani Nagar | restaurants | justdial | no (T3 backlog) | null (never estimated) | — |
| Naidu Tiffin Center | UNVERIFIED | Maruthi Nagar | restaurants | justdial | no (T3 backlog) | null (never estimated) | — |
| Chandra Mess | UNVERIFIED | STV Nagar | restaurants | justdial | no (T3 backlog) | null (never estimated) | — |
| Revathi Mess & Catering | UNVERIFIED | Hathiramji Colony | restaurants | justdial | no (T3 backlog) | null (never estimated) | — |
| Sri Padmavathi Mess | UNVERIFIED | Bhavani Nagar | restaurants | justdial | no (T3 backlog) | null (never estimated) | — |
| Deepika Mess | UNVERIFIED | Reddy & Reddy Colony | restaurants | justdial | no (T3 backlog) | null (never estimated) | — |
| Gokul Mess | UNVERIFIED | AIR Bypass Road | restaurants | justdial | no (T3 backlog) | null (never estimated) | — |
| OTC — Orion Tiffin Centre, Korlagunta | UNVERIFIED | Korlagunta | restaurants | zomato, swiggy | no (T3 backlog) | null (never estimated) | 2 listing titles merged |
| Lovely breakfast at Hotel Orion | UNVERIFIED | — | restaurants | facebook-page | no (T3 backlog) | null (never estimated) | — |
| Tirupati early morning non-veg breakfast | UNVERIFIED | — | restaurants | facebook-page | no (T3 backlog) | null (never estimated) | — |
| Renuka Tiffin Center | VERIFIED | — | restaurants | justdial | YES → batch-014 (restaurants) | null (never estimated) | address-pattern evidence recorded |
| Ruchi Tiffins | VERIFIED | — | restaurants | justdial | YES → batch-014 (restaurants) | null (never estimated) | address-pattern evidence recorded |

### Street food, tea & juice stalls

| Place | Status | Locality hint | DB target | Sources (kind) | Import batch | Coordinates | Notes |
|---|---|---|---|---|---|---|---|
| Vasundhara Tea Stall | UNVERIFIED | Bhavani Nagar | restaurants | magicpin | no (T3 backlog) | null (never estimated) | — |
| Venkat Sai Tea Stall | UNVERIFIED | Bhavani Nagar | restaurants | justdial | no (T3 backlog) | null (never estimated) | — |
| Dessertezy | UNVERIFIED | Bhavani Nagar | restaurants | facebook-page | no (T3 backlog) | null (never estimated) | — |
| 18th Street Kitchen | UNVERIFIED | — | restaurants | swiggy | no (T3 backlog) | null (never estimated) | — |

### Bakeries, sweets & ice cream

| Place | Status | Locality hint | DB target | Sources (kind) | Import batch | Coordinates | Notes |
|---|---|---|---|---|---|---|---|
| Tirumala Bakery House | UNVERIFIED | Bhavani Nagar | restaurants | justdial | no (T3 backlog) | null (never estimated) | — |
| Bakers Delight | UNVERIFIED | SV Nagar | restaurants | justdial | no (T3 backlog) | null (never estimated) | — |
| Tirumala Bakery And Sweets | UNVERIFIED | Sri Nagar Colony | restaurants | justdial | no (T3 backlog) | null (never estimated) | — |
| NiC Natural Ice Creams | UNVERIFIED | TML Bypass Road | restaurants | justdial | no (T3 backlog) | null (never estimated) | — |
| Shivam Ice Cream | UNVERIFIED | Shiv Jyoti Nagar | restaurants | justdial | no (T3 backlog) | null (never estimated) | — |
| Tirumala Cake House | UNVERIFIED | Bhavani Nagar | restaurants | justdial | no (T3 backlog) | null (never estimated) | — |
| Vijaya Kitchen | UNVERIFIED | — | restaurants | swiggy | no (T3 backlog) | null (never estimated) | — |
| Sri Krishna Ayyangar Sweets & Bakery | UNVERIFIED | Korlagunta | restaurants | justdial | no (T3 backlog) | null (never estimated) | — |
| Bangalore Bakery | UNVERIFIED | Korlagunta | restaurants | zomato | no (T3 backlog) | null (never estimated) | — |
| Sri Venkateshwara Bakery And Sweets | UNVERIFIED | — | restaurants | justdial | no (T3 backlog) | null (never estimated) | — |
| Meghana Sweets And Bakery | UNVERIFIED | — | restaurants | swiggy | no (T3 backlog) | null (never estimated) | — |
| PERAMBUR SRINIVASA SWEETS AND SNACKS | VERIFIED | — | restaurants | tripadvisor | — (already live) | null (never estimated) | address-pattern evidence recorded |

### Cafés & coffee

| Place | Status | Locality hint | DB target | Sources (kind) | Import batch | Coordinates | Notes |
|---|---|---|---|---|---|---|---|
| Iyer's Cafe | VERIFIED | — | restaurants | swiggy | YES → batch-013 (restaurants) | null (never estimated) | address-pattern evidence recorded |
| Amor Fati Cafe | VERIFIED | Korlagunta | restaurants | zomato, district | YES → batch-013 (restaurants) | null (never estimated) | 2 listing titles merged |
| Retro Cafe & Restaurant | VERIFIED | Korlagunta | restaurants | justdial | YES → batch-013 (restaurants) | null (never estimated) | address-pattern evidence recorded |
| Kafe | VERIFIED | Korlagunta | restaurants | magicpin | no (identity-held — see batch-014 header for hold reason) | null (never estimated) | — |

### Temples & sacred sites

| Place | Status | Locality hint | DB target | Sources (kind) | Import batch | Coordinates | Notes |
|---|---|---|---|---|---|---|---|
| Anjaneya Swamy Temple | VERIFIED | Bhavani Nagar | places | justdial | no (identity-held — see batch-014 header for hold reason) | null (never estimated) | address-pattern evidence recorded |
| Sri Vinayaka Swamy Temple | VERIFIED | — | places | justdial | no (identity-held — see batch-014 header for hold reason) | null (never estimated) | address-pattern evidence recorded |
| Avilala Church | UNVERIFIED | Avilala | places | justdial | no (T3 backlog) | null (never estimated) | — |
| Sri Padmavathi Ammavari Temple | VERIFIED | — | places | official | — (already Batch-011 candidate) | 13.60797, 79.45001 | — |

### Tourist attractions

| Place | Status | Locality hint | DB target | Sources (kind) | Import batch | Coordinates | Notes |
|---|---|---|---|---|---|---|---|
| Srinivasa Auditorium - Mr Palli Circle | UNVERIFIED | MR Palli | places | justdial | no (T3 backlog) | null (never estimated) | — |
| Mini Park | VERIFIED | Korlagunta | places | justdial | no (identity-held — see batch-014 header for hold reason) | null (never estimated) | — |
| Tummalagunta Playground | UNVERIFIED | — | places | justdial | no (T3 backlog) | null (never estimated) | — |
| Activity Toy in Tirupati - Engaging, Fun & Educational | UNVERIFIED | — | places | justdial | no (T3 backlog) | null (never estimated) | — |
| Kids Zone | UNVERIFIED | — | places | justdial | no (T3 backlog) | null (never estimated) | — |

### Markets & shopping

| Place | Status | Locality hint | DB target | Sources (kind) | Import batch | Coordinates | Notes |
|---|---|---|---|---|---|---|---|
| BNR Mall | UNVERIFIED | STV Nagar | places | justdial | no (T3 backlog) | null (never estimated) | — |
| Lucky Shopping Mall | UNVERIFIED | Bhavani Nagar | places | justdial | no (T3 backlog) | null (never estimated) | — |
| Lucky Food Plaza | UNVERIFIED | Korlagunta | places | justdial | no (T3 backlog) | null (never estimated) | — |
| Majida Stores | UNVERIFIED | — | places | justdial | no (T3 backlog) | null (never estimated) | — |

## Tirumala hills

### Restaurants & messes

| Place | Status | Locality hint | DB target | Sources (kind) | Import batch | Coordinates | Notes |
|---|---|---|---|---|---|---|---|
| Di Table 9 | UNVERIFIED | Tirumala | restaurants | zomato | no (T3 backlog) | null (never estimated) | — |
| Srinivasam Restaurant | VERIFIED | Tirumala | restaurants | justdial | YES → batch-012 (restaurants) | null (never estimated) | address-pattern evidence recorded |
| Srivari Naivedyam | UNVERIFIED | Tirumala | restaurants | justdial | no (T3 backlog) | null (never estimated) | — |
| Saravana Bhavan Pure Veg Restaurant | UNVERIFIED | Tirumala | restaurants | zomato | no (T3 backlog) | null (never estimated) | — |
| Anandan Vasavi Vegetarian Restaurant | VERIFIED | — | restaurants | zomato | YES → batch-012 (restaurants) | null (never estimated) | address-pattern evidence recorded |
| Meenakshi Pure Veg Restaurant | VERIFIED | Tirumala | restaurants | zomato | YES → batch-012 (restaurants) | null (never estimated) | — |

### Tiffin & breakfast centres

| Place | Status | Locality hint | DB target | Sources (kind) | Import batch | Coordinates | Notes |
|---|---|---|---|---|---|---|---|
| Padamavathi Tiffin Center | UNVERIFIED | Tirumala | restaurants | justdial | no (T3 backlog) | null (never estimated) | — |
| Lavanya Tiffin Center | UNVERIFIED | Tirumala | restaurants | justdial | no (T3 backlog) | null (never estimated) | — |
| Morning Breakfast | UNVERIFIED | Tirumala | restaurants | facebook-page | no (T3 backlog) | null (never estimated) | — |
| Tirumala Tiffins online in Hyderabad | UNVERIFIED | Tirumala | restaurants | swiggy | no (T3 backlog) | null (never estimated) | — |

### Street food, tea & juice stalls

| Place | Status | Locality hint | DB target | Sources (kind) | Import batch | Coordinates | Notes |
|---|---|---|---|---|---|---|---|
| Tirumala Tea Stall | VERIFIED | Tirumala | restaurants | justdial, magicpin | no (identity-held — see batch-014 header for hold reason) | null (never estimated) | address-pattern evidence recorded; 2 listing titles merged |

### Bakeries, sweets & ice cream

| Place | Status | Locality hint | DB target | Sources (kind) | Import batch | Coordinates | Notes |
|---|---|---|---|---|---|---|---|
| Ice Stone | UNVERIFIED | Tirumala | restaurants | justdial | no (T3 backlog) | null (never estimated) | — |
| Prasadalayam (TTD) | VERIFIED | Tirumala | restaurants | justdial | YES → batch-014 (restaurants) | null (never estimated) | address-pattern evidence recorded |
| Tirumala Balaji Sweets | VERIFIED | Tirumala | restaurants | justdial | no (identity-held — see batch-014 header for hold reason) | null (never estimated) | — |
| GUPTHA BALAJI SWEETS | VERIFIED | Tirumala | restaurants | justdial | YES → batch-013 (restaurants) | null (never estimated) | — |

### Cafés & coffee

| Place | Status | Locality hint | DB target | Sources (kind) | Import batch | Coordinates | Notes |
|---|---|---|---|---|---|---|---|
| Kafe Tirupati | VERIFIED | Tirumala | restaurants | zomato, zomato | no (identity-held — see batch-014 header for hold reason) | null (never estimated) | — |
| Tirumala Cafe | VERIFIED | Tirumala | restaurants | facebook-page | YES → batch-013 (restaurants) | null (never estimated) | address-pattern evidence recorded |
| Balasubramanyam Tea Stall | VERIFIED | Tirumala | restaurants | justdial | YES → batch-014 (restaurants) | null (never estimated) | address-pattern evidence recorded |

### Temples & sacred sites

| Place | Status | Locality hint | DB target | Sources (kind) | Import batch | Coordinates | Notes |
|---|---|---|---|---|---|---|---|
| Sri Venkateswara Swamy Temple, Tirumala | VERIFIED | Tirumala | places | wikipedia, wikipedia, wikipedia | — (already Batch-011 candidate) | 13.68312, 79.34685 | address-pattern evidence recorded; official verbatim quote stored |
| Sri Bedi Anjaneya Swamy Temple, Tirumala | VERIFIED | Tirumala | places | justdial, official, tripadvisor, official | YES → batch-012 (places) | 13.68342, 79.34924 | official verbatim quote stored; 4 listing titles merged |
| Tirupati Balaji Temple in | UNVERIFIED | Tirumala | places | justdial | no (T3 backlog) | null (never estimated) | — |
| Vinayaka Temple | UNVERIFIED | Tirumala | places | justdial | no (T3 backlog) | null (never estimated) | — |
| Sri Varahaswamy Temple, Tirumala | VERIFIED | — | places | wikipedia, tripadvisor | YES → batch-012 (places) | 13.68488, 79.34764 | address-pattern evidence recorded; official verbatim quote stored; 2 listing titles merged |
| Natural Arch, Tirumala hills (Silathoranam) | VERIFIED | Tirumala | places | wikipedia, tripadvisor | — (already Batch-011 candidate) | null (never estimated) | address-pattern evidence recorded; official verbatim quote stored; 2 listing titles merged |
| Tirumala | UNVERIFIED | Tirumala | places | wikipedia | no (T3 backlog) | null (never estimated) | — |
| Weekly Sevas | UNVERIFIED | — | places | official | no (T3 backlog) | null (never estimated) | — |
| SV Temple Amaravathi | UNVERIFIED | — | places | official | no (T3 backlog) | null (never estimated) | — |
| Thomala Seva | UNVERIFIED | — | places | official | no (T3 backlog) | null (never estimated) | — |
| TTD Information Centres and Kalyana Mandapams | UNVERIFIED | — | places | official | no (T3 backlog) | null (never estimated) | — |
| Sri Hathiramjee Mutt, Tirumala | PARTIALLY VERIFIED | — | places | official | YES → batch-012 (places) | null (never estimated) | official verbatim quote stored |
| Sri Anjaneyaswami Temple, Tirumala | PARTIALLY VERIFIED | — | places | official | YES → batch-013 (places) | null (never estimated) | official verbatim quote stored |

### Tourist attractions

| Place | Status | Locality hint | DB target | Sources (kind) | Import batch | Coordinates | Notes |
|---|---|---|---|---|---|---|---|
| Sannidhi Park | UNVERIFIED | Tirumala | places | justdial | no (T3 backlog) | null (never estimated) | — |
| Akasha Ganga Theertham, Tirumala | UNVERIFIED | — | places | tripadvisor | no (T3 backlog) | null (never estimated) | — |
| Sri Venkateswara Museum, Tirumala | PARTIALLY VERIFIED | — | places | official | YES → batch-012 (places) | null (never estimated) | official verbatim quote stored |
| Swami Pushkarini | PARTIALLY VERIFIED | — | places | official | YES → batch-012 (places) | null (never estimated) | official verbatim quote stored |
| Akasha Ganga Theertham | PARTIALLY VERIFIED | — | places | official | YES → batch-012 (places) | null (never estimated) | official verbatim quote stored |
| Chakra Theertham | PARTIALLY VERIFIED | — | places | official | YES → batch-012 (places) | null (never estimated) | official verbatim quote stored |
| Vaikuntha Teertham | PARTIALLY VERIFIED | — | places | official | YES → batch-012 (places) | null (never estimated) | official verbatim quote stored |
| Papavinasam Theertham | PARTIALLY VERIFIED | — | places | official | YES → batch-012 (places) | null (never estimated) | official verbatim quote stored |

### Stays & pilgrim accommodation

| Place | Status | Locality hint | DB target | Sources (kind) | Import batch | Coordinates | Notes |
|---|---|---|---|---|---|---|---|
| Rest Houses in | UNVERIFIED | Tirumala | places | official | no (T3 backlog) | null (never estimated) | — |
| free accommodation in | UNVERIFIED | Tirumala | places | official | no (T3 backlog) | null (never estimated) | — |
| Ampro Rest House, Tirumala | PARTIALLY VERIFIED | — | places | official | YES → batch-013 (places) | null (never estimated) | official verbatim quote stored |
| Bela Kuteeram, Tirumala | PARTIALLY VERIFIED | — | places | official | YES → batch-013 (places) | null (never estimated) | official verbatim quote stored |
| Gayathri Sadan, Tirumala | PARTIALLY VERIFIED | — | places | official | YES → batch-013 (places) | null (never estimated) | official verbatim quote stored |
| Hari Sadan Guest House, Tirumala | PARTIALLY VERIFIED | — | places | official | YES → batch-013 (places) | null (never estimated) | official verbatim quote stored |
| Hill View Cottages, Tirumala | PARTIALLY VERIFIED | — | places | official | YES → batch-013 (places) | null (never estimated) | official verbatim quote stored |
| Indira Rest House, Tirumala | PARTIALLY VERIFIED | — | places | official | YES → batch-013 (places) | null (never estimated) | official verbatim quote stored |
| Jagannadha Bhavan, Tirumala | PARTIALLY VERIFIED | — | places | official | YES → batch-013 (places) | null (never estimated) | official verbatim quote stored |
| Karam Nivas, Tirumala | PARTIALLY VERIFIED | — | places | official | YES → batch-013 (places) | null (never estimated) | official verbatim quote stored |
| Lakshmi Nivas, Tirumala | PARTIALLY VERIFIED | — | places | official | YES → batch-013 (places) | null (never estimated) | official verbatim quote stored |
| RajyaLakshmi Guest House, Tirumala | PARTIALLY VERIFIED | — | places | official | YES → batch-013 (places) | null (never estimated) | official verbatim quote stored |
| SP Guest House, Tirumala | PARTIALLY VERIFIED | — | places | official | YES → batch-013 (places) | null (never estimated) | official verbatim quote stored |
| Srinikethan, Tirumala | PARTIALLY VERIFIED | — | places | official | YES → batch-013 (places) | null (never estimated) | official verbatim quote stored |
| Srinivasa Nilayam, Tirumala | PARTIALLY VERIFIED | — | places | official | YES → batch-013 (places) | null (never estimated) | official verbatim quote stored |
| Venkata Vijayam Guest House, Tirumala | PARTIALLY VERIFIED | — | places | official | YES → batch-013 (places) | null (never estimated) | official verbatim quote stored |
| Vidya Sadan, Tirumala | PARTIALLY VERIFIED | — | places | official | YES → batch-013 (places) | null (never estimated) | official verbatim quote stored |
| Sri Venkateswara Guest House, Tirumala | PARTIALLY VERIFIED | — | places | official | YES → batch-013 (places) | null (never estimated) | official verbatim quote stored |
| Narayanagiri Guest House, Tirumala | PARTIALLY VERIFIED | — | places | official | YES → batch-013 (places) | null (never estimated) | official verbatim quote stored |
| Srivari Kuteer Guest House, Tirumala | PARTIALLY VERIFIED | — | places | official | YES → batch-013 (places) | null (never estimated) | official verbatim quote stored |
| Surapuram Thota Cottages, Tirumala | PARTIALLY VERIFIED | — | places | official | YES → batch-013 (places) | null (never estimated) | official verbatim quote stored |
| Alwar Tank Cottages, Tirumala | PARTIALLY VERIFIED | — | places | official | YES → batch-013 (places) | null (never estimated) | official verbatim quote stored |
| Anjanadri Nagar Cottages, Tirumala | PARTIALLY VERIFIED | — | places | official | YES → batch-013 (places) | null (never estimated) | official verbatim quote stored |
| Garudadri Nagar Cottages, Tirumala | PARTIALLY VERIFIED | — | places | official | YES → batch-013 (places) | null (never estimated) | official verbatim quote stored |
| Mangala Bavi Cottages, Tirumala | PARTIALLY VERIFIED | — | places | official | YES → batch-013 (places) | null (never estimated) | official verbatim quote stored |
| Ram Bagicha Guest House, Tirumala | PARTIALLY VERIFIED | — | places | official | YES → batch-013 (places) | null (never estimated) | official verbatim quote stored |
| Sanku Mitta Cottages, Tirumala | PARTIALLY VERIFIED | — | places | official | YES → batch-013 (places) | null (never estimated) | official verbatim quote stored |
| Seshadri Nagar Cottages, Tirumala | PARTIALLY VERIFIED | — | places | official | YES → batch-013 (places) | null (never estimated) | official verbatim quote stored |
| TB Cottages, Tirumala | PARTIALLY VERIFIED | — | places | official | YES → batch-013 (places) | null (never estimated) | official verbatim quote stored |
| Valley View Cottages, Tirumala | PARTIALLY VERIFIED | — | places | official | YES → batch-013 (places) | null (never estimated) | official verbatim quote stored |

### Markets & shopping

| Place | Status | Locality hint | DB target | Sources (kind) | Import batch | Coordinates | Notes |
|---|---|---|---|---|---|---|---|
| Chandra Provision | UNVERIFIED | Tirumala | places | justdial | no (T3 backlog) | null (never estimated) | — |
| Tirumala Shopping Complex - Balaji Nagar | UNVERIFIED | Tirumala | places | justdial | no (T3 backlog) | null (never estimated) | — |

## Tiruchanur (Alamelu Mangapuram corridor)

### Tiffin & breakfast centres

| Place | Status | Locality hint | DB target | Sources (kind) | Import batch | Coordinates | Notes |
|---|---|---|---|---|---|---|---|
| Muthunagar | UNVERIFIED | — | restaurants | justdial | no (T3 backlog) | null (never estimated) | — |

### Street food, tea & juice stalls

| Place | Status | Locality hint | DB target | Sources (kind) | Import batch | Coordinates | Notes |
|---|---|---|---|---|---|---|---|
| Padmavathi Juice Center | VERIFIED | Tiruchanur | restaurants | justdial | YES → batch-014 (restaurants) | null (never estimated) | address-pattern evidence recorded |

### Bakeries, sweets & ice cream

| Place | Status | Locality hint | DB target | Sources (kind) | Import batch | Coordinates | Notes |
|---|---|---|---|---|---|---|---|
| Sri Venkateswara Sweet & Bakery | VERIFIED | Tiruchanur | restaurants | justdial | YES → batch-013 (restaurants) | null (never estimated) | — |
| Nandini Sweets And Bakery, Tiruchanur | VERIFIED | Tiruchanur | restaurants | zomato | YES → batch-013 (restaurants) | null (never estimated) | — |
| Perambur Srinivasa Sweets Ps4 Veg Restaurant (Tiruchanoor | VERIFIED | Tiruchanur | restaurants | facebook-page | — (already live) | null (never estimated) | address-pattern evidence recorded |

### Cafés & coffee

| Place | Status | Locality hint | DB target | Sources (kind) | Import batch | Coordinates | Notes |
|---|---|---|---|---|---|---|---|
| Explore Citrus Cafe | UNVERIFIED | Tiruchanur | restaurants | eazydiner | no (T3 backlog) | null (never estimated) | — |
| Giri Prasad Cafe | VERIFIED | Tiruchanur | restaurants | justdial | YES → batch-013 (restaurants) | null (never estimated) | address-pattern evidence recorded |

### Temples & sacred sites

| Place | Status | Locality hint | DB target | Sources (kind) | Import batch | Coordinates | Notes |
|---|---|---|---|---|---|---|---|
| Sri Krishna Swamy Temple (Alagiyaperumal Shrine), Tiruchanoor | PARTIALLY VERIFIED | — | places | official | YES → batch-012 (places) | null (never estimated) | official verbatim quote stored |
| Sri Varada Raja Swamy Temple, Tiruchanoor | PARTIALLY VERIFIED | — | places | official | YES → batch-012 (places) | null (never estimated) | official verbatim quote stored |
| Sri Suryanarayana Swamy Temple, Tiruchanoor | PARTIALLY VERIFIED | — | places | official | YES → batch-012 (places) | null (never estimated) | official verbatim quote stored |

### Stays & pilgrim accommodation

| Place | Status | Locality hint | DB target | Sources (kind) | Import batch | Coordinates | Notes |
|---|---|---|---|---|---|---|---|
| Amrutha Home Stay | UNVERIFIED | Tiruchanur | places | booking | no (T3 backlog) | null (never estimated) | — |

### Markets & shopping

| Place | Status | Locality hint | DB target | Sources (kind) | Import batch | Coordinates | Notes |
|---|---|---|---|---|---|---|---|
| Km Gifts And Fancy | UNVERIFIED | Tiruchanur | places | justdial | no (T3 backlog) | null (never estimated) | — |
| Padmavati Jewellers | UNVERIFIED | Tiruchanur | places | justdial | no (T3 backlog) | null (never estimated) | — |

## Srinivasa Mangapuram (~10 km west)

### Tiffin & breakfast centres

| Place | Status | Locality hint | DB target | Sources (kind) | Import batch | Coordinates | Notes |
|---|---|---|---|---|---|---|---|
| Sri Venkateswara Annaprasadam Trust | UNVERIFIED | — | restaurants | official | no (T3 backlog) | null (never estimated) | address-pattern evidence recorded |

### Stays & pilgrim accommodation

| Place | Status | Locality hint | DB target | Sources (kind) | Import batch | Coordinates | Notes |
|---|---|---|---|---|---|---|---|
| Srinivasa Mangapuram hotels & places to stay | UNVERIFIED | Srinivasa Mangapuram | places | agoda | no (T3 backlog) | null (never estimated) | — |

### Markets & shopping

| Place | Status | Locality hint | DB target | Sources (kind) | Import batch | Coordinates | Notes |
|---|---|---|---|---|---|---|---|
| Murali Grocery Shop | UNVERIFIED | Srinivasa Mangapuram | places | justdial | no (T3 backlog) | null (never estimated) | — |

## Chandragiri (~12-14 km south-west)

### Restaurants & messes

| Place | Status | Locality hint | DB target | Sources (kind) | Import batch | Coordinates | Notes |
|---|---|---|---|---|---|---|---|
| Raja Food Centre | UNVERIFIED | Chandragiri | restaurants | justdial | no (T3 backlog) | null (never estimated) | — |
| Happi Family Dhaba | VERIFIED | Chandragiri | restaurants | justdial, district, magicpin | YES → batch-014 (restaurants) | null (never estimated) | address-pattern evidence recorded; 3 listing titles merged |

### Tiffin & breakfast centres

| Place | Status | Locality hint | DB target | Sources (kind) | Import batch | Coordinates | Notes |
|---|---|---|---|---|---|---|---|
| Geetha General Stores & Tiffin Centre | UNVERIFIED | Chandragiri | restaurants | magicpin | no (T3 backlog) | null (never estimated) | — |

### Street food, tea & juice stalls

| Place | Status | Locality hint | DB target | Sources (kind) | Import batch | Coordinates | Notes |
|---|---|---|---|---|---|---|---|
| KK TEA STALL | VERIFIED | Chandragiri | restaurants | magicpin | YES → batch-013 (restaurants) | null (never estimated) | address-pattern evidence recorded |

### Bakeries, sweets & ice cream

| Place | Status | Locality hint | DB target | Sources (kind) | Import batch | Coordinates | Notes |
|---|---|---|---|---|---|---|---|
| Sri Nandini Bakery & Sweets | VERIFIED | Chandragiri | restaurants | justdial | YES → batch-013 (restaurants) | null (never estimated) | — |
| BNR Sweets & Bakery | VERIFIED | Chandragiri | restaurants | magicpin | YES → batch-013 (restaurants) | null (never estimated) | address-pattern evidence recorded |

### Temples & sacred sites

| Place | Status | Locality hint | DB target | Sources (kind) | Import batch | Coordinates | Notes |
|---|---|---|---|---|---|---|---|
| Chandragiri Fort (Raja Mahal & Rani Mahal) | VERIFIED | Chandragiri | places | official, tripadvisor, wikipedia, official, tripadvisor, wikipedia, justdial | — (already Batch-011 candidate) | 13.58303, 79.30528 | official verbatim quote stored; 7 listing titles merged |
| Shri Ramulavari Temple | UNVERIFIED | Chandragiri | places | justdial | no (T3 backlog) | null (never estimated) | — |

## Renigunta (airport/junction corridor, ~10-12 km north)

### Restaurants & messes

| Place | Status | Locality hint | DB target | Sources (kind) | Import batch | Coordinates | Notes |
|---|---|---|---|---|---|---|---|
| Ugadhi Restaurant (Ugadhi Restrent) | UNVERIFIED | — | restaurants | justdial | no (T3 backlog) | null (never estimated) | — |
| Star Kitchen, Renigunta | UNVERIFIED | Renigunta | restaurants | justdial | no (T3 backlog) | null (never estimated) | — |

### Tiffin & breakfast centres

| Place | Status | Locality hint | DB target | Sources (kind) | Import batch | Coordinates | Notes |
|---|---|---|---|---|---|---|---|
| Ujwal Tiffin Center | VERIFIED | Renigunta | restaurants | justdial | YES → batch-014 (restaurants) | null (never estimated) | address-pattern evidence recorded |
| Aapam Tiffin Center, Renigunta | UNVERIFIED | Renigunta | restaurants | facebook-page | no (T3 backlog) | null (never estimated) | — |
| SVT Tiffin Center | VERIFIED | Renigunta | restaurants | justdial | YES → batch-014 (restaurants) | null (never estimated) | address-pattern evidence recorded |
| Aha Tiffens | VERIFIED | Renigunta | restaurants | justdial | YES → batch-014 (restaurants) | null (never estimated) | address-pattern evidence recorded |

### Bakeries, sweets & ice cream

| Place | Status | Locality hint | DB target | Sources (kind) | Import batch | Coordinates | Notes |
|---|---|---|---|---|---|---|---|
| Bangalore Ayengar Bakery | VERIFIED | Renigunta | restaurants | justdial | YES → batch-013 (restaurants) | null (never estimated) | — |
| Sri Laxmi Sweet Stall & Bakery | VERIFIED | Renigunta | restaurants | justdial | YES → batch-013 (restaurants) | null (never estimated) | — |
| Tirumalai Sweets And Bakery | VERIFIED | Renigunta | restaurants | justdial | YES → batch-014 (restaurants) | null (never estimated) | address-pattern evidence recorded |
| Master Sweets Shop | VERIFIED | — | restaurants | justdial | YES → batch-014 (restaurants) | null (never estimated) | address-pattern evidence recorded |
| Sri Gomathi Bhavani Lala Sweets And Bakery | VERIFIED | — | restaurants | justdial | YES → batch-014 (restaurants) | null (never estimated) | address-pattern evidence recorded |

### Cafés & coffee

| Place | Status | Locality hint | DB target | Sources (kind) | Import batch | Coordinates | Notes |
|---|---|---|---|---|---|---|---|
| Chota Cafe | UNVERIFIED | Mangalam (Renigunta corridor) | restaurants | zomato | no (T3 backlog) | null (never estimated) | — |
| Chai Ka Damki, Mangalam | VERIFIED | Mangalam (Renigunta corridor) | restaurants | zomato | YES → batch-014 (restaurants) | null (never estimated) | address-pattern evidence recorded |
| Zamzam restaurant | VERIFIED | — | restaurants | facebook-page | YES → batch-013 (restaurants) | null (never estimated) | address-pattern evidence recorded |
| MAMATHA'S COFFEE CAFE | VERIFIED | Renigunta | restaurants | magicpin | YES → batch-013 (restaurants) | null (never estimated) | address-pattern evidence recorded |
| Rameshvaram Coffee | UNVERIFIED | — | restaurants | district | no (T3 backlog) | null (never estimated) | address-pattern evidence recorded |

### Temples & sacred sites

| Place | Status | Locality hint | DB target | Sources (kind) | Import batch | Coordinates | Notes |
|---|---|---|---|---|---|---|---|
| Sri Prasanna Venkateswara Swamy Temple | UNVERIFIED | — | places | tripadvisor | no (T3 backlog) | null (never estimated) | address-pattern evidence recorded |
| Renigunta | UNVERIFIED | Renigunta | places | justdial | no (T3 backlog) | null (never estimated) | — |
| Mathamma Temple | UNVERIFIED | Renigunta | places | justdial | no (T3 backlog) | null (never estimated) | — |
| Sai Baba Temple | UNVERIFIED | Renigunta | places | justdial | no (T3 backlog) | null (never estimated) | — |

### Tourist attractions

| Place | Status | Locality hint | DB target | Sources (kind) | Import batch | Coordinates | Notes |
|---|---|---|---|---|---|---|---|
| Stores and Outlets | UNVERIFIED | Renigunta | places | justdial | no (T3 backlog) | null (never estimated) | — |
| Videos from Well-kept | UNVERIFIED | Renigunta | places | justdial | no (T3 backlog) | null (never estimated) | — |

### Markets & shopping

| Place | Status | Locality hint | DB target | Sources (kind) | Import batch | Coordinates | Notes |
|---|---|---|---|---|---|---|---|
| Venky Vegetables Market | UNVERIFIED | Mangalam (Renigunta corridor) | places | justdial | no (T3 backlog) | null (never estimated) | — |
| Renigunta Weekend Market | UNVERIFIED | Renigunta | places | justdial | no (T3 backlog) | null (never estimated) | — |
| Sri Dharshini Enterprises Fancy &Gifts Store | UNVERIFIED | — | places | justdial | no (T3 backlog) | null (never estimated) | — |

## Surrounding destinations (beyond city/Tirumala core)

### Restaurants & messes

| Place | Status | Locality hint | DB target | Sources (kind) | Import batch | Coordinates | Notes |
|---|---|---|---|---|---|---|---|
| AP 39 Cafe & Restaurant | VERIFIED | — | restaurants | justdial | YES → batch-014 (restaurants) | null (never estimated) | address-pattern evidence recorded |

### Temples & sacred sites

| Place | Status | Locality hint | DB target | Sources (kind) | Import batch | Coordinates | Notes |
|---|---|---|---|---|---|---|---|
| Srikalahasteeswara temple | VERIFIED | — | places | wikipedia | YES → batch-013 (places) | null (never estimated) | — |
| Sri Govindaraja Swamy temple | VERIFIED | — | places | official | — (already Batch-011 candidate) | null (never estimated) | address-pattern evidence recorded |
| Sri Kalyana Venkateswara Swamy | VERIFIED | — | places | official | — (already Batch-011 candidate) | null (never estimated) | address-pattern evidence recorded |
| Om Shakthi Temple in Nagari,Chittoor | UNVERIFIED | — | places | justdial | no (T3 backlog) | null (never estimated) | — |
| Skms Temple in Nagari,Chittoor | UNVERIFIED | — | places | justdial | no (T3 backlog) | null (never estimated) | — |
| Perumal Temple in Nagari, Chittoor | UNVERIFIED | — | places | justdial | no (T3 backlog) | null (never estimated) | — |
| Kalyana Venkateswara Temple, Narayanavanam | UNVERIFIED | — | places | wikipedia | — (already Batch-011 candidate) | null (never estimated) | — |
| Sri Prasanna Venkateswara Swamy Temple, Appalayagunta | PARTIALLY VERIFIED | — | places | official | YES → batch-012 (places) | null (never estimated) | official verbatim quote stored |
| Sri Sridevi Bhudevi Sametha Thondamanadu Temple | PARTIALLY VERIFIED | — | places | official | YES → batch-012 (places) | null (never estimated) | official verbatim quote stored |
| Sri Prasanna Venkateswara Swamy Temple, Kosuvari Palle | PARTIALLY VERIFIED | — | places | official | YES → batch-013 (places) | null (never estimated) | official verbatim quote stored |
| Sri Konetiraya Swamy Temple, Keelapatla | PARTIALLY VERIFIED | — | places | official | YES → batch-013 (places) | null (never estimated) | official verbatim quote stored |
| Sri Kalyana Venkateswara Swamy Temple, Narayanavanam | PARTIALLY VERIFIED | — | places | official | — (already Batch-011 candidate) | null (never estimated) | official verbatim quote stored |
| Sri Vedanarayana Swamy Temple, Nagalapuram | PARTIALLY VERIFIED | — | places | official | YES → batch-013 (places) | null (never estimated) | official verbatim quote stored |
| Sri Venugopala Swamy Temple, Karvetinagaram | PARTIALLY VERIFIED | — | places | official | YES → batch-013 (places) | null (never estimated) | official verbatim quote stored |
| Sri Kari Manikya Swamy Temple, Nagari | PARTIALLY VERIFIED | — | places | official | YES → batch-013 (places) | null (never estimated) | official verbatim quote stored |
| Sri Lakshmi Narasimha Swamy Temple, Tarigonda | PARTIALLY VERIFIED | — | places | official | YES → batch-013 (places) | null (never estimated) | official verbatim quote stored |

### Tourist attractions

| Place | Status | Locality hint | DB target | Sources (kind) | Import batch | Coordinates | Notes |
|---|---|---|---|---|---|---|---|
| Talakona Waterfall | VERIFIED | — | places | makemytrip, official, wikipedia, tripadvisor | — (already Batch-011 candidate) | 13.81166, 79.21578 | address-pattern evidence recorded; official verbatim quote stored; 4 listing titles merged |
| Kalyani Dam | UNVERIFIED | — | places | wikipedia, tripadvisor, official | no (T3 backlog) | null (never estimated) | 3 listing titles merged |
| Horsley Hills | UNVERIFIED | — | places | makemytrip, official | no (T3 backlog) | null (never estimated) | 2 listing titles merged |
| 9 Waterfalls near Tirupati That Every Traveller Must Visit | UNVERIFIED | — | places | holidify | no (T3 backlog) | null (never estimated) | — |
| Ubbalamadugu Falls | UNVERIFIED | — | places | wikipedia, tripadvisor | no (T3 backlog) | null (never estimated) | 2 listing titles merged |
| Tada Falls | UNVERIFIED | — | places | makemytrip | no (T3 backlog) | null (never estimated) | — |

## Cross-references to existing sets

Batch-011 (owner-blocked import, candidate unchanged): 16 curated candidates alias
10 of its 16 rows — listed in
docs/tirupati-duplicate-review.md; none are re-imported.

Production (live) rows re-encountered: 2 — PERAMBUR SRINIVASA SWEETS AND SNACKS, Perambur Srinivasa Sweets Ps4 Veg Restaurant (Tiruchanoor.

## Dropped candidates (with reasons — never silently deleted)

| Raw listing title | Area | Reason |
|---|---|---|
| Tirupati - Find Verified Local Businesses Near You on | tpt-central | generic directory/category page, not a place |
| Order Non Veg Food Online in Central Tirupati | tpt-central | swiggy search page, not a place |
| Locations of Trends in Tirupati | tpt-neighbourhoods | retail chain store-locator page |
| Tirumala Restaurants, Tirupati | tirumala | generic directory/category page, not a place |
| Tiruchanur Restaurants, Tirupati | tiruchanur | generic directory/category page, not a place |
| Renigunta Restaurants | renigunta | generic directory/category page, not a place |
| Varadaraja Nagar, Tirupati Restaurants | surrounding | generic directory/category page, not a place |
| Popular Restaurants Serving Upma in Tirupati | tpt-central | generic listicle page |
| OTC - Orion Tiffin Centre | tpt-neighbourhoods | name empty/too short after cleaning |
| Tea Restaurants in Tirupati | tpt-central | generic directory/category page, not a place |
| Popular Packaged Juice Manufacturers in Tirupati | tpt-central | generic listicle page |
| Stainless Steel Sugarcane Juice Machine Distributors | tpt-central | equipment-dealer category page, not a food venue |
| Cane Fresh Semi Automatic Sugarcane Juice Machine | tpt-central | equipment-dealer category page, not a food venue |
| Craving something sweet, delightful, and utterly irresistible? | tpt-neighbourhoods | social-media noise, no place identity |
| Korlagunta Restaurants, Tirupati | tpt-neighbourhoods | generic directory/category page, not a place |
| Renigunta Locality Restaurants, Tirupati | renigunta | directory page title, not a place |
| Ice Cream in Tirupati - Creamy Delights & Flavorful Treats | tpt-central | generic directory/category page, not a place |
| cakes and sweet in KT Road,Tirupati | tpt-central | generic listing name without a distinct business identity (identity rule) |
| Tirupati Sri Venkateswara laddu available for order | tpt-central | social-media post, not a place |
| Tirupati laddu prasadam details and significance | tirumala | article title, not a place |
| Tirumala Temple Laddu Prasadam Counter Inside Visuals | tirumala | video title, not a place |
| United Tirupati Tirumala | tirumala | social-media fan page, not a place |
| Reviews for Tirumala Tirupati Devasthanams in KT Road | tirumala | organisation listing, not a place |
| Sudarshan Nc1 - Tirumala, Tirupati | tirumala | TTD accommodation block caught by a food sweep — not a food venue (retained in raw evidence for a future facilities review) |
| Pilgrims Waiting Halls - Tirumala, Tirupati | tirumala | TTD pilgrim facility caught by a food sweep — not a food venue (retained in raw evidence for a future facilities review) |
| Govinda Nilayam - Tirumala, Tirupati | tirumala | listing entity type unclear (facility/guest house caught by a food sweep) — not a food venue |
| Are Tirumala Laddus available at AP Bhavan or anywhere | tirumala | social-media Q&A post, not a place |
| Tirumala Traders in Tiruchanoor Road, Tirupati | tirumala | trade-shop listing without food-category evidence — identity and category unconfirmed |
| Tiruchanoor Padmavati Ammavari Prasadam Sheera, | tiruchanur | prasadam product post, not a place |
| Tiruchanoor Laddu Prasadam from Tirupati Tirumala | tiruchanur | prasadam product post, not a place |
| Asian Restaurants in Tirupati | tpt-central | cuisine directory page, not a place |
| Tirupati Restaurants | tpt-central | generic directory/category page, not a place |
| Tirumala Restaurants, Tirupati | tpt-central | generic directory/category page, not a place |
| Order from Cafe Manasa online in Tirupati | tpt-neighbourhoods | generic directory/category page, not a place |
| Cafe Extra, Renigunta Locality order online | renigunta | generic directory/category page, not a place |
| Tirumala Tirupati Devasthanams | tpt-central | organisation, not a place |
| Religious Tourism | tpt-central | generic directory/category page, not a place |
| Prominent Churches in Tirupati – Worship & Peaceful Places | tpt-central | listicle page title, not a single place |
| Religious Tourism | tpt-neighbourhoods | generic directory/category page, not a place |
| Tirumala Tirupati Devasthanams | tirumala | organisation, not a place |
| Religious Tourism | tirumala | generic directory/category page, not a place |
| SACRED TEERTHAMS OF TIRUMALA SESHACHALA RANGES | tirumala | article/listicle title, not a single place |
| Tirumala Tirupati Devasthanams | tiruchanur | organisation, not a place |
| Religious Tourism | tiruchanur | generic directory/category page, not a place |
| Tirumala Tirupati Devasthanams | srinivasa-mangapuram | organisation, not a place |
| Religious Tourism | srinivasa-mangapuram | generic directory/category page, not a place |
| Chandragiri | chandragiri | ambiguous single-token name — source title does not establish whether it denotes Chandragiri Fort, the town, or another POI (identity rule; held out rather than guessed) |
| Religious Tourism | chandragiri | generic directory/category page, not a place |
| Religious Tourism | renigunta | generic directory/category page, not a place |
| Religious Tourism | surrounding | generic directory/category page, not a place |
| Museums in Tirupati | tpt-central | generic category page title, not a place |
| Nature & Parks in Tirupati | tpt-central | generic category page title, not a place |
| Others | tpt-central | generic directory/category page, not a place |
| Tirupati - Find Verified Local Businesses Near You on India's | tpt-central | generic directory/category page, not a place |
| Nature & Parks in Tirupati | tpt-neighbourhoods | generic category page title, not a place |
| Must View in Tirumala - Review of Papavinasam | tirumala | generic page title, not a place |
| Forest Tourism | surrounding | generic directory/category page, not a place |
| 5 Star hotels near Tirupati Railway Station Tirupati | tpt-central | generic hotel listing page |
| Online Hotel Booking | tpt-central | generic directory/category page, not a place |
| 10 Places to Stay Near Tirumala Temple - Tirupati Hotels | tirumala | generic hotel listing page |
| 10 Top Hotels in Renigunta | renigunta | generic hotel listing page |
| Tirupati | tpt-central | generic directory/category page, not a place |
| Trends in Bhavani Nagar,Tirupati | tpt-neighbourhoods | retail chain store-locator page |
| 198 Photos of Trends in Bhavani Nagar, Tirupati | tpt-neighbourhoods | retail chain store-locator page |
| Tirupati - Find Verified Local Businesses Near You on India's | tpt-neighbourhoods | generic directory/category page, not a place |

## Renames (dirty listing title → clean display name; audited)

| Raw listing title | Clean name |
|---|---|
| Shankar Chats MR Palli Junction,Tirupati Credits | Shankar Chats |
| Saravana Bhavan Pure Veg Restaurant - Tirumala | Saravana Bhavan Pure Veg Restaurant |
| Ugadhi Restrent - Pure Veg Restaurants In Tirupati | Ugadhi Restaurant (Ugadhi Restrent) |
| Star Kitchen in Renigunta,Tirupati - Order Food Online | Star Kitchen, Renigunta |
| Ap 39Cafe& Restaurant in Nagari,Chittoor | AP 39 Cafe & Restaurant |
| Vinayaka Tiffin Centre in Tirupati Bazar | Vinayaka Tiffin Centre |
| Revathi Mess & Catering'S - Hathiramji Colony, Tirupati | Revathi Mess & Catering |
| Nagarjuna Military Mess, Tirupati Authentic Andhra-style | Nagarjuna Military Mess |
| Revathi Mess & Catering Veg & Non Veg - Tirupati | Revathi Mess & Catering |
| Aapam Tiffin center, Renigunta | Aapam Tiffin Center, Renigunta |
| Mr'S Juice Bar in Kapilateertham Road,Tirupati | Mr's Juice Bar |
| Dessertezy in Bhavani Nagar Tirupati: Buy 2 Get 1 Free | Dessertezy |
| Order from 18Th Street Kitchen online in Tirupati | 18th Street Kitchen |
| Padmavathi juice center in Tiruchanoor Road,Tirupati | Padmavathi Juice Center |
| Nic Natural Ice Creams in tml by pass road,Tirupati | NiC Natural Ice Creams |
| Grand cakes & bakes in Nethaji Road,Tirupati | Grand Cakes & Bakes |
| balaji bakery and sweets - Cake Shops In Tirupati | Balaji Bakery And Sweets |
| 140 Reviews for Prasadalayam Ttd in Tirumala, Tirupati | Prasadalayam (TTD) |
| 140 Reviews for Prasadalayam Ttd in Tirumala, Tirupati | category bakery_sweets → restaurant (TTD free-meals complex; bakery-sweep default category overridden after review) |
| Bangalore Bakery , Korlagunta order online - Tirupati | Bangalore Bakery |
| Chota Cafe, Mangalam order online | Chota Cafe |
| Tirumala Tea Stall, Reddy and Reddy's Colony, Tirupati, Tea | Tirumala Tea Stall |
| Anjaneya Swamy Temple in Vedullacheruvu,Tirupati | Anjaneya Swamy Temple, Vedullacheruvu |
| Anjaneya Temple in Bairagi Patteda,Tirupati | Anjaneya Temple, Bairagi Patteda |
| Sri Anjaneya Swami Temple in Nehru Nagar,Tirupati | Sri Anjaneya Swami Temple, Nehru Nagar |
| Anjaneya Swamy Temple in Bhavani Nagar,Tirupati | Anjaneya Swamy Temple, Vedullacheruvu |
| Sri Anjaneya Swami in Karakambadi,Tirupati - Temples | Sri Anjaneya Swami Temple, Karakambadi |
| Bnr Mall in Stv Nagar,Tirupati | BNR Mall |

## Batch-4 independent-source corroboration (2026-10-27 direct-source pass)

Pending candidates whose identity a second, non-search source corroborates (exact normalized-name
match within the same area — evidence in `evidence/tirupati-master/crossmatch-*.json`; verify stubs
stay untouched on disk; this is NEVER labelled a web_search identity verification):

- **Kalyana Venkateswara Temple, Narayanavanam** [surrounding] ← wikipedia: https://en.wikipedia.org/wiki/Narayanavanam
- **Kalyani Dam** [surrounding] ← wikipedia: https://en.wikipedia.org/wiki/Kalyani_Dam
- **Talakona** [surrounding] ← wikipedia: https://en.wikipedia.org/wiki/Talakona
- **Ubbalamadugu Falls** [surrounding] ← wikipedia: https://en.wikipedia.org/wiki/Talakona
- **Tirumala** [tirumala] ← wikipedia: https://en.wikipedia.org/wiki/Tirumala
- **Tirupati** [tpt-central] ← wikipedia: https://en.wikipedia.org/wiki/Tirupati

All other pending rows remain pending (throttled stubs and never-attempted rows unchanged).

Review-queue leads from the same pass (133 names in
evidence/tirupati-master/review-queue-new-names.json) are NOT inventory rows and are NOT counted
anywhere — each is an unverified lead with a verbatim quote, awaiting human research.

## Batch-5 review-queue assessment (2026-10-28)

All 133 genuinely-new leads were assessed MANUALLY on their exact quotations and
source URLs (never name-similarity alone) — evidence/evidence/tirupati-master/batch5/review-queue-assessment.json:

| Decision | Count |
|---|---|
| accept | 3 |
| corroborate-existing | 18 |
| reject-generic | 53 |
| reject-out-of-scope | 54 |
| ambiguous-keep-queue | 5 |

ALL FIVE HIGH-priority leads resolved WITHOUT becoming candidates: 3 corroborate existing inventory
records (Sri Kodandaramaswami → Sri Kodanda Ramaswamy Temple; Zoo Park → Sri Venkateswara Zoological
Park; Srikalahasti Temple → Srikalahasteeswara temple), 1 is a generic-term extraction ("Hindu temple")
and 1 is an out-of-scope Bihar namesake (Kapileshwar Temple, Bihar).

## Batch-5 accepted candidates (Batch-015 review-candidate SQL, 2026-10-28)

61 accepted candidates were assembled from (a) the queue assessment, (b) the ALREADY-SAVED
official TTD page places-around-tirumala.aspx (the dead garden.aspx/theerthams.aspx homepage shells never
delivered this content), (c) 4 targeted queue-lead checks, and (d) 31 bounded discovery searches
(19 web_search locality×category + 12 Nominatim POI) aimed at the biggest known gap: SMALL FOOD BUSINESSES.
Fail-loud dedupe gates proved zero collisions against inventory, batches 011–014 and the curated worksheet.

| Area | Accepted |
|---|---|
| Tirupati city centre | 34 |
| Tirumala hills | 20 |
| Tiruchanur (Alamelu Mangapuram corridor) | 1 |
| Tirupati residential neighbourhoods | 4 |
| Renigunta (airport/junction corridor, ~10-12 km north) | 1 |
| Surrounding destinations (beyond city/Tirumala core) | 1 |

| Category | Accepted |
|---|---|
| tiffin | 13 |
| restaurant | 14 |
| street_food | 9 |
| bakery_sweets | 5 |
| cafe | 1 |
| hotel | 1 |
| attraction | 6 |
| sacred_water | 9 |
| temple | 3 |

These rows import ONLY as `verification_status='unverified'` review candidates
(supabase/review-candidates/insert-batch-015-tptm-b5.sql — never executed by this repo); coordinates stay
NULL (published OSM coordinates remain in the evidence ledger for human review).

Accepted candidate names (canonical):

- Babu Tiffin Centre [tpt-central/tiffin/T1] — facebook-page: https://www.facebook.com/fb-answers/best-tiffin-services-in-tirupati/
- Shankar Tiffin Center, Srinivasa Nagar [tpt-central/tiffin/T1] — directory-listing: https://tirupati.idbf.in/788403/tiffin-center
- Jayalakshmi Tiffin Center, Srinagar [tpt-central/tiffin/T1] — directory-listing: https://www.justdial.com/Tirupati/Jayalakshmi-Tiffin-Center-Srinagar/9999PX877-X877-2
- Uday Tiffin Center, Maruthi Nagar [tpt-central/tiffin/T1] — directory-listing: https://www.justdial.com/Tirupati/Uday-Tiffin-Center-Maruthi-Nagar/9999PX877-X877-200
- Nellore Mess, Prakasam Road [tpt-central/restaurant/T1] — swiggy-listing: https://www.swiggy.com/city/tirupati/nellore-mess-prakasam-road-rest126018
- Deva Tea Stall, Korlagunta [tpt-central/street_food/T1] — directory-listing: https://tirupati.idbf.in/4017588/deva-tea-stall
- Sk Babu Tea Stall, Ashok Nagar [tpt-central/street_food/T1] — directory-listing: https://www.justdial.com/Tirupati/Coffee-Shops-having-Tea/nct-10104727-att-cou22
- Chai Buster Tea Stall, Dhanalakshmi Nagar [tpt-central/street_food/T2] — directory-listing: https://www.justdial.com/Tirupati/Juice-Centres-having-Tea/nct-10283258-att-cou22
- R.K. Tea Stall, Narula Market [tpt-central/street_food/T2] — facebook-page: https://www.facebook.com/ItsMyTirupathi/posts/buy-1-tea-get-1-free-rkgrandbanquethall
- Cakevilla Bakery Sweets, TK Street [tpt-central/bakery_sweets/T1] — directory-listing: https://www.justdial.com/Tirupati/Cakevilla-Bakery-Sweets-Opp-Sai-Baba-Temple-Tk-Stre
- Sri Bhavani Sweets & Bakery, TML By Pass Road [tpt-central/bakery_sweets/T1] — directory-listing: https://www.justdial.com/Tirupati/Sri-Bhavani-Sweets-Bakery-Near-Leelamahal-Junction-
- Tirupati Bakery, Tata Nagar [tpt-central/bakery_sweets/T1] — directory-listing: https://www.district.in/dining/tirupati/tirupati-bakery-tata-nagar
- Aswani Sweets & Bakery, Vasavi Nagar [tpt-central/bakery_sweets/T1] — directory-listing: https://www.justdial.com/Tirupati/Aswani-Sweets-Bakery-Vasavinagar/9999PX877-X877-250
- Doss Bakery [tpt-central/bakery_sweets/T2] — osm-nominatim: https://nominatim.openstreetmap.org/search?q=bakery+Tirupati&format=jsonv2&viewbox=79.25,13.78,79.55,13.50&bounded=1
- Rainbow Vegetarian Restaurant [tpt-central/restaurant/T2] — osm-nominatim: https://nominatim.openstreetmap.org/search?q=restaurant+Tirupati&format=jsonv2&viewbox=79.25,13.78,79.55,13.50&bounded=1
- SAI Juices & Tea Center, V V Mahal Road [tpt-central/street_food/T1] — directory-listing: https://www.justdial.com/Tirupati/SAI-Juices-Tea-Center-V-V-Mahal-Road/9999PX877-X877
- Saral Juice Shop, Pudipatla [tpt-central/street_food/T1] — directory-listing: https://www.justdial.com/Tirupati/Juice-Centres-in-Vidya-Nagar-Road/nct-10283258
- T Nageshwara Rao Juice Shop, Tata Nagar [tpt-central/street_food/T1] — directory-listing: https://tirupati.idbf.in/4246612/juice-junktion
- Taj Juice Centre, Bairagi Patteda [tpt-central/street_food/T1] — directory-listing: https://tirupati.idbf.in/4246612/juice-junktion
- Garlic Family Restaurant, Mangalam [tpt-central/restaurant/T1] — directory-listing: https://www.justdial.com/Tirupati/Restaurants-Family-Friendly-in-Kt-Road/nct-10408936
- Springs Restaurant [tpt-central/restaurant/T2] — osm-nominatim: https://nominatim.openstreetmap.org/search?q=restaurant+Tirupati&format=jsonv2&viewbox=79.25,13.78,79.55,13.50&bounded=1
- SFC Restaurant [tpt-central/restaurant/T2] — osm-nominatim: https://nominatim.openstreetmap.org/search?q=restaurant+Tirupati&format=jsonv2&viewbox=79.25,13.78,79.55,13.50&bounded=1
- Yalamuri Bar And Restaurant [tpt-central/restaurant/T2] — osm-nominatim: https://nominatim.openstreetmap.org/search?q=restaurant+Tirupati&format=jsonv2&viewbox=79.25,13.78,79.55,13.50&bounded=1
- Hotel Sri Nandhi Restaurant [tpt-central/restaurant/T2] — osm-nominatim: https://nominatim.openstreetmap.org/search?q=restaurant+Tirupati&format=jsonv2&viewbox=79.25,13.78,79.55,13.50&bounded=1
- Carrots Restaurant [tpt-central/restaurant/T2] — osm-nominatim: https://nominatim.openstreetmap.org/search?q=restaurant+Tirupati&format=jsonv2&viewbox=79.25,13.78,79.55,13.50&bounded=1
- Harika Bar And Restaurant [tpt-central/restaurant/T2] — osm-nominatim: https://nominatim.openstreetmap.org/search?q=restaurant+Tirupati&format=jsonv2&viewbox=79.25,13.78,79.55,13.50&bounded=1
- Manal Restaurant [tpt-central/restaurant/T2] — osm-nominatim: https://nominatim.openstreetmap.org/search?q=restaurant+Tirupati&format=jsonv2&viewbox=79.25,13.78,79.55,13.50&bounded=1
- Sunlight Veg Restaurant [tpt-central/restaurant/T2] — osm-nominatim: https://nominatim.openstreetmap.org/search?q=restaurant+Tirupati&format=jsonv2&viewbox=79.25,13.78,79.55,13.50&bounded=1
- Imperial Spice Restaurant [tpt-central/restaurant/T2] — osm-nominatim: https://nominatim.openstreetmap.org/search?q=restaurant+Tirupati&format=jsonv2&viewbox=79.25,13.78,79.55,13.50&bounded=1
- Manasa Vihar Cafe [tpt-central/cafe/T2] — osm-nominatim: https://nominatim.openstreetmap.org/search?q=cafe+Tirupati&format=jsonv2&viewbox=79.25,13.78,79.55,13.50&bounded=1
- Vanam Restaurant, Alipiri Road [tpt-central/restaurant/T2] — osm-nominatim: https://nominatim.openstreetmap.org/search?q=restaurant+Tirumala&format=jsonv2&viewbox=79.25,13.78,79.55,13.50&bounded=1
- Golden Balaji Tiffin Center, Tirumala [tirumala/tiffin/T1] — directory-listing: https://www.justdial.com/Tirupati/Golden-Balaji-Tiffin-Center-Tirumala/9999PX877-X877
- Chandra Tiffin Shop, Tirumala [tirumala/tiffin/T1] — zomato-listing: https://www.zomato.com/tirupati/chandra-tiffin-shop-tirumala/order
- V Mohan Tea Stall, Tirumala [tirumala/street_food/T1] — directory-listing: https://www.justdial.com/Tirupati/V-Mohan-Tea-Stall-Tirumala/9999PX877-X877-230406172
- Sri Guru Tiffin Centre, Tirumala [tirumala/tiffin/T1] — directory-listing: https://tirupati.idbf.in/4016107/sri-guru-tiffin-centre
- Saarangi Restaurant, Tirumala [tirumala/restaurant/T2] — tripadvisor-listing: https://www.tripadvisor.com/Restaurants-g1985457-Tirumala_Chittoor_District_Andhra_Pradesh.html
- Radha Rani Tiffin Centre, Padmavathi Nagar [tiruchanur/tiffin/T1] — directory-listing: https://tirupati.idbf.in/788403/tiffin-center
- Vls Tiffin Centre And Catering, Mangalam [tpt-neighbourhoods/tiffin/T1] — directory-listing: https://www.justdial.com/Tirupati/Vls-Tiffin-Centre-And-Catering-Mangalam/9999PX877-X
- Tasvija Tiffin Centre, Mangalam [tpt-neighbourhoods/tiffin/T1] — directory-listing: https://www.justdial.com/Tirupati/Tasvija-Tiffin-Centre-Mangalam/9999PX877-X877-23040
- Sumathi Tiffin Centre, Mangalam [tpt-neighbourhoods/tiffin/T1] — magicpin-listing: https://magicpin.in/Tirupati/Mangalam/Restaurant/Sumathi-Tiffin-Centre/store/3c6ac43
- J Bebamma Tiffin Center, Renigunta Road [tpt-neighbourhoods/tiffin/T1] — directory-listing: https://www.justdial.com/Tirupati/J-Bebamma-Tiffin-Center-Diamond-Collection-Renigunt
- Amma Appam, Renigunta [renigunta/tiffin/T1] — directory-listing: https://www.justdial.com/Tirupati/Tiffin-Services-For-Rajasthani-Food-in-Renigunta/nc
- VarahaSwami Guest House, Tirumala [tirumala/hotel/T1] — official-ttd: https://www.tirumala.org/varahaswamiguesthouse.aspx
- Seshachalam Hills [tpt-central/attraction/T1] — wikipedia: https://en.wikipedia.org/wiki/Sri_Venkateswara_National_Park
- Gogarbham Gardens, Tirumala [tirumala/attraction/T1] — official-ttd: https://www.tirumala.org/places-around-tirumala.aspx
- Dharmagiri, Tirumala [tirumala/attraction/T1] — official-ttd: https://www.tirumala.org/places-around-tirumala.aspx
- Narayangiri, Tirumala [tirumala/attraction/T1] — official-ttd: https://www.tirumala.org/places-around-tirumala.aspx
- Asthana Mandapam, Tirumala [tirumala/attraction/T1] — official-ttd: https://www.tirumala.org/places-around-tirumala.aspx
- Pandava Teertham, Tirumala [tirumala/sacred_water/T1] — official-ttd: https://www.tirumala.org/places-around-tirumala.aspx
- Kumaradhara Teertham, Tirumala [tirumala/sacred_water/T1] — official-ttd: https://www.tirumala.org/places-around-tirumala.aspx
- Tumbhuru Teertham, Tirumala [tirumala/sacred_water/T1] — official-ttd: https://www.tirumala.org/places-around-tirumala.aspx
- Ramakrishna Teertham, Tirumala [tirumala/sacred_water/T1] — official-ttd: https://www.tirumala.org/places-around-tirumala.aspx
- Sesha Teertham, Tirumala [tirumala/sacred_water/T1] — official-ttd: https://www.tirumala.org/places-around-tirumala.aspx
- Sitamma Teertham, Tirumala [tirumala/sacred_water/T1] — official-ttd: https://www.tirumala.org/places-around-tirumala.aspx
- Pasupu Teertham, Tirumala [tirumala/sacred_water/T1] — official-ttd: https://www.tirumala.org/places-around-tirumala.aspx
- Jupali Teertham, Tirumala [tirumala/sacred_water/T1] — official-ttd: https://www.tirumala.org/places-around-tirumala.aspx
- Sanaka Sanandana Teertham, Tirumala [tirumala/sacred_water/T1] — official-ttd: https://www.tirumala.org/places-around-tirumala.aspx
- Srivari Padalamandapam Temple, Tirupati [tpt-central/temple/T1] — official-ttd: https://www.tirumala.org/places-around-tirumala.aspx
- Sri Lakshmi Narayana Swamy Temple, Tirupati [tpt-central/temple/T1] — official-ttd: https://www.tirumala.org/places-around-tirumala.aspx
- Vaikuntam Queue Complex, Tirumala [tirumala/attraction/T1] — news: https://www.thehansindia.com/news/cities/tirupathi/ttd-to-take-up-feasibility-study-for-vqc-3
- Siddeswara Swamy Temple, Talakona [surrounding/temple/T1] — wikipedia: https://en.wikipedia.org/wiki/Talakona

### Batch-5 corroborations of EXISTING records (not new rows)

- **Nagarjuna Military Mess** → Nagarjuna Military Mess (inventory) (https://www.swiggy.com/city/tirupati/military-mess-tata-nagar-rest1295934)
- **Mayura Bakery** → Mayura Bakery (inventory) (https://nominatim.openstreetmap.org/search?q=bakery+Tirupati&format=jsonv2&viewbox=79.25,13.78,79.55,13.50&bounded=1)
- **Ganapathi Juice Shop** → Ganapathi Juice Shop (inventory) (https://www.justdial.com/Tirupati/Juice-Centres-in-T-P-Area/nct-10283258)
- **Sri Venkateswara Annaprasadam Trust** → Sri Venkateswara Annaprasadam Trust (inventory) (https://www.tirumala.org/SRIVENKATESWARAANNAPRASADAMTRUST.aspx)
- **BNR Sweets & Bakery** → BNR Sweets & Bakery (inventory) (https://magicpin.in/Tirupati/Chandragiri/Restaurant/Bnr-Sweets-and-Bakery/store/22289)
- **Balasubramanyam Tea Stall** → Balasubramanyam Tea Stall (inventory) (https://www.justdial.com/Tirupati/Balasubramanyam-Tea-Stall-Tirumala/9999PX877-X877-2)
- **Vinayaka Tiffin Centre** → Vinayaka Tiffin Centre (inventory) (https://www.mappls.com/place-vinayaka+tiffin+centre-tirumala+reddy+nagar-mangalam-tir)
- **Nandini Sweets And Bakery, Tiruchanur** → Nandini Sweets And Bakery, Tiruchanur (inventory) (https://www.justdial.com/Tirupati/Sweet-Shops-in-Tiruchanoor/nct-10465567)
- **Tirumala Bakery And Sweets** → Tirumala Bakery And Sweets (curated worksheet row) (https://www.indiacakes.com/cake-shop/tirupati/tirumala-bakery-and-sweets-tirupati)
- **Chillies Restaurant** → Chillies Restaurant (inventory) (https://nominatim.openstreetmap.org/search?q=restaurant+Tirupati&format=jsonv2&viewbox=79.25,13.78,79.55,13.50&bounded=1)
- **Manju Foods** → Manju Foods (inventory) (https://nominatim.openstreetmap.org/search?q=restaurant+Tirupati&format=jsonv2&viewbox=79.25,13.78,79.55,13.50&bounded=1)
- **SVT Tiffin Center** → SVT Tiffin Center (inventory) (https://www.justdial.com/Tirupati/Tiffin-Services-For-Veg-Food-in-Renigunta/nct-10481)
- **Amor Fati Cafe** → Amor Fati Cafe (inventory) (https://www.zomato.com/tirupati/restaurants/street-food)
- **Tea Time, Srinivasa Nagar** → Tea Time, Srinivasa Nagar (inventory, batch-014) (https://biashara.cybo.com/IN/tirumala/mkahawa-wa-chai)
- **Di Table 9** → Di Table 9 (inventory) (https://www.zomato.com/tirupati/restaurants)
- **Srikalahasteeswara temple** → Srikalahasteeswara temple (inventory) (https://www.incredibleindia.gov.in/en/andhra-pradesh/tirupati/srikalahasti-temple)
- **Sri Venugopala Swamy Temple, Karvetinagaram** → Sri Venugopala Swamy Temple, Karvetinagaram (inventory, batch-013 queued) (https://news.tirumala.org/grand-pushpa-yagam-performed-at-sri-venugopala-swamy-temple-karvetinagaram)

### Batch-5 weak leads (review queue ONLY — not candidates, not counted)

38 discovery hits were recorded as weak leads (list-mentions without locality,
aggregator pages, chain outlets, institutional canteens, dated sources) — they stay OUT of every count,
same as the original queue. Identity-HELD (4): "Indira Guest House, Tirumala", "Reddy Tea Stall, Tirumala", "Sri Balaji Tea Stall, Tirumala", "Balaji Sweets & Bakery, Korramenugunta"
— see the duplicate-review doc.

### Batch-5 source limitations

- Wikivoyage blocked (HTTP 403) — recorded, not retried
- Wikipedia re-fetches rate-limited (HTTP 429, shared egress IP) — the two targeted re-fetches failed; their leads were instead resolved via web_search lead-checks
- Srinivasa Mangapuram locality query returned only out-of-city matches — 0 in-scope leads recorded honestly
- national chain outlets (Cafe Coffee Day, Just Bake/Justbake, Fnp Cakes, Khetlaapa Chai, Tea Time additional outlets) deliberately skipped — not distinct local places
