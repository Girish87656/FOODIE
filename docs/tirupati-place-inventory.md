# FOODIE — Tirupati Master Place Inventory
Generated 2026-10-26 by scripts/foodie-enrichment/gen-tirupati-docs.ts from
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

**Counts:** 228 raw candidates → 190 curated
({"T1":48,"T3":87,"T2":55}) → 7 possible duplicates
(queued) → 43 dropped with recorded reasons → Batch-012 = 29 rows.

## Tirupati city centre

### Restaurants & messes

| Place | Status | Locality hint | DB target | Sources (kind) | Batch-012 | Coordinates | Notes |
|---|---|---|---|---|---|---|---|
| Garuda Cafe | VERIFIED | — | restaurants | facebook-page | YES (restaurants) | null (never estimated) | address-pattern evidence recorded |
| Bhai Ka Biryani | VERIFIED | Gandhi Road | restaurants | justdial | YES (restaurants) | null (never estimated) | address-pattern evidence recorded |
| Mana Hari Villu Family Restaurant | UNVERIFIED | — | restaurants | zomato | no (T3 backlog) | null (never estimated) | — |
| Mayura Garden Family Restaurant, Korlagunta | UNVERIFIED | — | restaurants | zomato | no (T3 backlog) | null (never estimated) | — |

### Tiffin & breakfast centres

| Place | Status | Locality hint | DB target | Sources (kind) | Batch-012 | Coordinates | Notes |
|---|---|---|---|---|---|---|---|
| Vinayaka Tiffin Centre | UNVERIFIED | Tirupati Bazar | restaurants | justdial | no (T3 backlog) | null (never estimated) | — |
| Sri Venkateswara Tiffin Center | UNVERIFIED | KT Road | restaurants | justdial | no (T3 backlog) | null (never estimated) | — |
| Nagarjuna Military Mess | UNVERIFIED | — | restaurants | facebook-page | no (T3 backlog) | null (never estimated) | — |

### Street food, tea & juice stalls

| Place | Status | Locality hint | DB target | Sources (kind) | Batch-012 | Coordinates | Notes |
|---|---|---|---|---|---|---|---|
| Ganapathi Juice Shop | UNVERIFIED | Tilak Road | restaurants | justdial | no (T3 backlog) | null (never estimated) | — |
| Mr's Juice Bar | UNVERIFIED | Kapilateertham Road | restaurants | justdial | no (T3 backlog) | null (never estimated) | — |
| Ganesh Juice Center | UNVERIFIED | Tilak Road | restaurants | justdial | no (T3 backlog) | null (never estimated) | — |
| Hygien Pani Puri Hot Chats | UNVERIFIED | — | restaurants | swiggy | no (T3 backlog) | null (never estimated) | — |
| Pani Puri Centre | UNVERIFIED | — | restaurants | wanderlog | no (T3 backlog) | null (never estimated) | — |

### Bakeries, sweets & ice cream

| Place | Status | Locality hint | DB target | Sources (kind) | Batch-012 | Coordinates | Notes |
|---|---|---|---|---|---|---|---|
| Mayura Bakery | UNVERIFIED | Gandhi Road | restaurants | justdial | no (T3 backlog) | null (never estimated) | — |
| Babas Bakery | UNVERIFIED | TK Street | restaurants | justdial | no (T3 backlog) | null (never estimated) | — |
| Amrutha Swagruha Foods | UNVERIFIED | — | restaurants | swiggy | no (T3 backlog) | null (never estimated) | — |
| Cream Stone | UNVERIFIED | Tata Nagar | restaurants | justdial | no (T3 backlog) | null (never estimated) | — |
| Havmor Ice Cream | UNVERIFIED | Ramanuja Circle | restaurants | justdial | no (T3 backlog) | null (never estimated) | — |
| Grand Cakes & Bakes | UNVERIFIED | Nethaji Road | restaurants | justdial | no (T3 backlog) | null (never estimated) | — |
| Balaji Bakery And Sweets | UNVERIFIED | — | restaurants | justdial | no (T3 backlog) | null (never estimated) | — |
| Mithaiwala | UNVERIFIED | KT Road | restaurants | justdial | no (T3 backlog) | null (never estimated) | — |
| Tirumala Sweets | VERIFIED | Gandhi Road | restaurants | justdial | YES (restaurants) | null (never estimated) | address-pattern evidence recorded |

### Cafés & coffee

| Place | Status | Locality hint | DB target | Sources (kind) | Batch-012 | Coordinates | Notes |
|---|---|---|---|---|---|---|---|
| Minerva Coffee Shop | UNVERIFIED | — | restaurants | tripadvisor | no (T3 backlog) | null (never estimated) | — |
| Srinivasa Cafe | UNVERIFIED | Tilak Road | restaurants | justdial | no (T3 backlog) | null (never estimated) | — |

### Temples & sacred sites

| Place | Status | Locality hint | DB target | Sources (kind) | Batch-012 | Coordinates | Notes |
|---|---|---|---|---|---|---|---|
| Sri Govindaraja Swamy Temple, Tirupati | VERIFIED | — | places | official, wikipedia, tripadvisor | — (already Batch-011 candidate) | null (never estimated) | address-pattern evidence recorded; official verbatim quote stored; 3 listing titles merged |
| Sri Kalyana Venkateswara Swamy Temple, Srinivasa Mangapuram | VERIFIED | — | places | official, wikipedia, goibibo | — (already Batch-011 candidate) | null (never estimated) | address-pattern evidence recorded; 3 listing titles merged |
| Sri Kapileswara Swamy Temple (Kapila Theertham) | VERIFIED | — | places | wikipedia, official, tripadvisor, official | — (already Batch-011 candidate) | 13.65658, 79.42103 | address-pattern evidence recorded; official verbatim quote stored; 4 listing titles merged |
| Sri Padmavathi Ammavari Temple, Tiruchanur | VERIFIED | — | places | official, tripadvisor | — (already Batch-011 candidate) | 13.60797, 79.45001 | 2 listing titles merged |
| ISKCON | UNVERIFIED | — | places | tripadvisor | — (already Batch-011 candidate) | null (never estimated) | — |

### Tourist attractions

| Place | Status | Locality hint | DB target | Sources (kind) | Batch-012 | Coordinates | Notes |
|---|---|---|---|---|---|---|---|
| Sri Venkateswara Zoological Park, Tirupati | VERIFIED | — | places | wikipedia, tripadvisor, tripadvisor | — (already Batch-011 candidate) | 13.62936, 79.36217 | address-pattern evidence recorded; 3 listing titles merged |
| Sri Venkateswara National Park | VERIFIED | — | places | wikipedia, tripadvisor, makemytrip | YES (restaurants) | 13.79535, 79.29986 | 3 listing titles merged |
| Deer Park, Alipiri | VERIFIED | Alipiri | places | tripadvisor, justdial | YES (restaurants) | null (never estimated) | address-pattern evidence recorded; 2 listing titles merged |

### Stays & pilgrim accommodation

| Place | Status | Locality hint | DB target | Sources (kind) | Batch-012 | Coordinates | Notes |
|---|---|---|---|---|---|---|---|
| Accommodation at | UNVERIFIED | — | places | official | no (T3 backlog) | null (never estimated) | — |

### Markets & shopping

| Place | Status | Locality hint | DB target | Sources (kind) | Batch-012 | Coordinates | Notes |
|---|---|---|---|---|---|---|---|
| Lepakshi Handicrafts Emporium | UNVERIFIED | — | places | justdial | no (T3 backlog) | null (never estimated) | — |
| Garuda Mall | UNVERIFIED | Madhavapuram | places | justdial | no (T3 backlog) | null (never estimated) | — |
| Sirikala Shopping Mall | UNVERIFIED | — | places | justdial | no (T3 backlog) | null (never estimated) | — |
| Tirupathi Vegetable Market | UNVERIFIED | TK Street | places | justdial | no (T3 backlog) | null (never estimated) | — |

## Tirupati residential neighbourhoods

### Restaurants & messes

| Place | Status | Locality hint | DB target | Sources (kind) | Batch-012 | Coordinates | Notes |
|---|---|---|---|---|---|---|---|
| Mayuri Restaurant | VERIFIED | Vidyut Nagar | restaurants | zomato | YES (restaurants) | null (never estimated) | address-pattern evidence recorded |
| Bhagni's Family Restaurant | UNVERIFIED | — | restaurants | district | no (T3 backlog) | null (never estimated) | — |
| Bhavani Bhojnalaya | UNVERIFIED | Ramchandra Nagar | restaurants | justdial | no (T3 backlog) | null (never estimated) | — |
| Manju Foods | VERIFIED | Bhavani Nagar | restaurants | justdial | YES (restaurants) | null (never estimated) | address-pattern evidence recorded |
| Shankar Chats | VERIFIED | MR Palli | restaurants | facebook-page | YES (restaurants) | null (never estimated) | address-pattern evidence recorded |
| Chillies Restaurant | VERIFIED | AIR Bypass Road | restaurants | swiggy | YES (restaurants) | null (never estimated) | address-pattern evidence recorded |
| Southern Spice, Avilala | VERIFIED | Avilala | restaurants | tripadvisor, zomato, swiggy, zomato | YES (restaurants) | null (never estimated) | address-pattern evidence recorded; 4 listing titles merged |

### Tiffin & breakfast centres

| Place | Status | Locality hint | DB target | Sources (kind) | Batch-012 | Coordinates | Notes |
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

### Street food, tea & juice stalls

| Place | Status | Locality hint | DB target | Sources (kind) | Batch-012 | Coordinates | Notes |
|---|---|---|---|---|---|---|---|
| Vasundhara Tea Stall | UNVERIFIED | Bhavani Nagar | restaurants | magicpin | no (T3 backlog) | null (never estimated) | — |
| Venkat Sai Tea Stall | UNVERIFIED | Bhavani Nagar | restaurants | justdial | no (T3 backlog) | null (never estimated) | — |
| Dessertezy | UNVERIFIED | Bhavani Nagar | restaurants | facebook-page | no (T3 backlog) | null (never estimated) | — |
| 18th Street Kitchen | UNVERIFIED | — | restaurants | swiggy | no (T3 backlog) | null (never estimated) | — |

### Bakeries, sweets & ice cream

| Place | Status | Locality hint | DB target | Sources (kind) | Batch-012 | Coordinates | Notes |
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

### Cafés & coffee

| Place | Status | Locality hint | DB target | Sources (kind) | Batch-012 | Coordinates | Notes |
|---|---|---|---|---|---|---|---|
| Iyer's Cafe | VERIFIED | — | restaurants | swiggy | YES (restaurants) | null (never estimated) | address-pattern evidence recorded |
| Amor Fati Cafe | VERIFIED | Korlagunta | restaurants | zomato, district | YES (restaurants) | null (never estimated) | address-pattern evidence recorded; 2 listing titles merged |
| Retro Cafe & Restaurant | VERIFIED | Korlagunta | restaurants | justdial | YES (restaurants) | null (never estimated) | address-pattern evidence recorded |
| Kafe | VERIFIED | Korlagunta | restaurants | magicpin | YES (restaurants) | null (never estimated) | — |

### Temples & sacred sites

| Place | Status | Locality hint | DB target | Sources (kind) | Batch-012 | Coordinates | Notes |
|---|---|---|---|---|---|---|---|
| Anjaneya Swamy Temple | VERIFIED | Bhavani Nagar | places | justdial | YES (restaurants) | null (never estimated) | address-pattern evidence recorded |
| Sri Vinayaka Swamy Temple | VERIFIED | — | places | justdial | YES (restaurants) | null (never estimated) | address-pattern evidence recorded |

### Tourist attractions

| Place | Status | Locality hint | DB target | Sources (kind) | Batch-012 | Coordinates | Notes |
|---|---|---|---|---|---|---|---|
| Mini Park | VERIFIED | Korlagunta | places | justdial | YES (restaurants) | null (never estimated) | — |

### Markets & shopping

| Place | Status | Locality hint | DB target | Sources (kind) | Batch-012 | Coordinates | Notes |
|---|---|---|---|---|---|---|---|
| BNR Mall | UNVERIFIED | STV Nagar | places | justdial | no (T3 backlog) | null (never estimated) | — |
| Trends | UNVERIFIED | Bhavani Nagar | places | justdial | no (T3 backlog) | null (never estimated) | — |
| 198 Photos of Trends | UNVERIFIED | Bhavani Nagar | places | justdial | no (T3 backlog) | null (never estimated) | — |
| Lucky Shopping Mall | UNVERIFIED | Bhavani Nagar | places | justdial | no (T3 backlog) | null (never estimated) | — |

## Tirumala hills

### Restaurants & messes

| Place | Status | Locality hint | DB target | Sources (kind) | Batch-012 | Coordinates | Notes |
|---|---|---|---|---|---|---|---|
| Di Table 9 | UNVERIFIED | Tirumala | restaurants | zomato | no (T3 backlog) | null (never estimated) | — |
| Srinivasam Restaurant | VERIFIED | Tirumala | restaurants | justdial | YES (restaurants) | null (never estimated) | address-pattern evidence recorded |
| Srivari Naivedyam | UNVERIFIED | Tirumala | restaurants | justdial | no (T3 backlog) | null (never estimated) | — |
| Saravana Bhavan Pure Veg Restaurant | UNVERIFIED | Tirumala | restaurants | zomato | no (T3 backlog) | null (never estimated) | — |
| Anandan Vasavi Vegetarian Restaurant | VERIFIED | — | restaurants | zomato | YES (restaurants) | null (never estimated) | address-pattern evidence recorded |
| Meenakshi Pure Veg Restaurant | VERIFIED | Tirumala | restaurants | zomato | YES (restaurants) | null (never estimated) | — |

### Tiffin & breakfast centres

| Place | Status | Locality hint | DB target | Sources (kind) | Batch-012 | Coordinates | Notes |
|---|---|---|---|---|---|---|---|
| Padamavathi Tiffin Center | UNVERIFIED | Tirumala | restaurants | justdial | no (T3 backlog) | null (never estimated) | — |
| Lavanya Tiffin Center | UNVERIFIED | Tirumala | restaurants | justdial | no (T3 backlog) | null (never estimated) | — |
| Morning Breakfast | UNVERIFIED | Tirumala | restaurants | facebook-page | no (T3 backlog) | null (never estimated) | — |
| Tirumala Tiffins online in Hyderabad | UNVERIFIED | Tirumala | restaurants | swiggy | no (T3 backlog) | null (never estimated) | — |

### Bakeries, sweets & ice cream

| Place | Status | Locality hint | DB target | Sources (kind) | Batch-012 | Coordinates | Notes |
|---|---|---|---|---|---|---|---|
| Ice Stone | UNVERIFIED | Tirumala | restaurants | justdial | no (T3 backlog) | null (never estimated) | — |
| Tirumala Balaji Sweets - | VERIFIED | Tirumala | restaurants | justdial | YES (restaurants) | null (never estimated) | — |
| GUPTHA BALAJI SWEETS | VERIFIED | Tirumala | restaurants | justdial | YES (restaurants) | null (never estimated) | — |

### Cafés & coffee

| Place | Status | Locality hint | DB target | Sources (kind) | Batch-012 | Coordinates | Notes |
|---|---|---|---|---|---|---|---|
| Kafe Tirupati | VERIFIED | Tirumala | restaurants | zomato, zomato | YES (restaurants) | null (never estimated) | — |
| Tirumala Cafe | VERIFIED | Tirumala | restaurants | facebook-page | YES (restaurants) | null (never estimated) | address-pattern evidence recorded |

### Temples & sacred sites

| Place | Status | Locality hint | DB target | Sources (kind) | Batch-012 | Coordinates | Notes |
|---|---|---|---|---|---|---|---|
| Sri Venkateswara Swamy Temple, Tirumala | VERIFIED | Tirumala | places | wikipedia, wikipedia, wikipedia | — (already Batch-011 candidate) | 13.68312, 79.34685 | address-pattern evidence recorded; official verbatim quote stored |
| Sri Varahaswamy Temple, Tirumala | VERIFIED | — | places | wikipedia, tripadvisor | YES (restaurants) | 13.68488, 79.34764 | address-pattern evidence recorded; official verbatim quote stored; 2 listing titles merged |
| Sri Bedi Anjaneya Swamy Temple, Tirumala | VERIFIED | — | places | official, tripadvisor, official | YES (restaurants) | 13.68342, 79.34924 | address-pattern evidence recorded; official verbatim quote stored; 3 listing titles merged |
| Natural Arch, Tirumala hills (Silathoranam) | VERIFIED | Tirumala | places | wikipedia, tripadvisor | — (already Batch-011 candidate) | null (never estimated) | address-pattern evidence recorded; official verbatim quote stored; 2 listing titles merged |

### Tourist attractions

| Place | Status | Locality hint | DB target | Sources (kind) | Batch-012 | Coordinates | Notes |
|---|---|---|---|---|---|---|---|
| Akasha Ganga Theertham, Tirumala | UNVERIFIED | — | places | tripadvisor | no (T3 backlog) | null (never estimated) | — |

### Stays & pilgrim accommodation

| Place | Status | Locality hint | DB target | Sources (kind) | Batch-012 | Coordinates | Notes |
|---|---|---|---|---|---|---|---|
| Rest Houses in | UNVERIFIED | Tirumala | places | official | no (T3 backlog) | null (never estimated) | — |
| free accommodation in | UNVERIFIED | Tirumala | places | official | no (T3 backlog) | null (never estimated) | — |

### Markets & shopping

| Place | Status | Locality hint | DB target | Sources (kind) | Batch-012 | Coordinates | Notes |
|---|---|---|---|---|---|---|---|
| Tirumala Shopping Complex - Balaji Nagar | UNVERIFIED | Tirumala | places | justdial | no (T3 backlog) | null (never estimated) | — |

## Tiruchanur (Alamelu Mangapuram corridor)

### Tiffin & breakfast centres

| Place | Status | Locality hint | DB target | Sources (kind) | Batch-012 | Coordinates | Notes |
|---|---|---|---|---|---|---|---|
| Muthunagar | UNVERIFIED | — | restaurants | justdial | no (T3 backlog) | null (never estimated) | — |

### Bakeries, sweets & ice cream

| Place | Status | Locality hint | DB target | Sources (kind) | Batch-012 | Coordinates | Notes |
|---|---|---|---|---|---|---|---|
| Sri Venkateswara Sweet & Bakery | VERIFIED | Tiruchanur | restaurants | justdial | YES (restaurants) | null (never estimated) | — |
| Nandini Sweets And Bakery, Tiruchanur | VERIFIED | Tiruchanur | restaurants | zomato | YES (restaurants) | null (never estimated) | — |

### Cafés & coffee

| Place | Status | Locality hint | DB target | Sources (kind) | Batch-012 | Coordinates | Notes |
|---|---|---|---|---|---|---|---|
| Explore Citrus Cafe | UNVERIFIED | Tiruchanur | restaurants | eazydiner | no (T3 backlog) | null (never estimated) | — |
| Giri Prasad Cafe | VERIFIED | Tiruchanur | restaurants | justdial | YES (restaurants) | null (never estimated) | address-pattern evidence recorded |

## Srinivasa Mangapuram (~10 km west)

### Tiffin & breakfast centres

| Place | Status | Locality hint | DB target | Sources (kind) | Batch-012 | Coordinates | Notes |
|---|---|---|---|---|---|---|---|
| Sri Venkateswara Annaprasadam Trust | UNVERIFIED | — | restaurants | official | no (T3 backlog) | null (never estimated) | address-pattern evidence recorded |

### Markets & shopping

| Place | Status | Locality hint | DB target | Sources (kind) | Batch-012 | Coordinates | Notes |
|---|---|---|---|---|---|---|---|
| Murali Grocery Shop | UNVERIFIED | Srinivasa Mangapuram | places | justdial | no (T3 backlog) | null (never estimated) | — |

## Chandragiri (~12-14 km south-west)

### Restaurants & messes

| Place | Status | Locality hint | DB target | Sources (kind) | Batch-012 | Coordinates | Notes |
|---|---|---|---|---|---|---|---|
| Raja Food Centre | UNVERIFIED | Chandragiri | restaurants | justdial | no (T3 backlog) | null (never estimated) | — |

### Tiffin & breakfast centres

| Place | Status | Locality hint | DB target | Sources (kind) | Batch-012 | Coordinates | Notes |
|---|---|---|---|---|---|---|---|
| Geetha General Stores & Tiffin Centre | UNVERIFIED | Chandragiri | restaurants | magicpin | no (T3 backlog) | null (never estimated) | — |

### Street food, tea & juice stalls

| Place | Status | Locality hint | DB target | Sources (kind) | Batch-012 | Coordinates | Notes |
|---|---|---|---|---|---|---|---|
| KK TEA STALL | VERIFIED | Chandragiri | restaurants | magicpin | YES (restaurants) | null (never estimated) | address-pattern evidence recorded |

### Bakeries, sweets & ice cream

| Place | Status | Locality hint | DB target | Sources (kind) | Batch-012 | Coordinates | Notes |
|---|---|---|---|---|---|---|---|
| Sri Nandini Bakery & Sweets | VERIFIED | Chandragiri | restaurants | justdial | YES (restaurants) | null (never estimated) | — |
| BNR Sweets & Bakery | VERIFIED | Chandragiri | restaurants | magicpin | YES (restaurants) | null (never estimated) | address-pattern evidence recorded |

### Temples & sacred sites

| Place | Status | Locality hint | DB target | Sources (kind) | Batch-012 | Coordinates | Notes |
|---|---|---|---|---|---|---|---|
| Chandragiri Fort (Raja Mahal & Rani Mahal) | VERIFIED | Chandragiri | places | official, tripadvisor, wikipedia, official, tripadvisor | — (already Batch-011 candidate) | 13.58303, 79.30528 | official verbatim quote stored; 5 listing titles merged |

## Renigunta (airport/junction corridor, ~10-12 km north)

### Restaurants & messes

| Place | Status | Locality hint | DB target | Sources (kind) | Batch-012 | Coordinates | Notes |
|---|---|---|---|---|---|---|---|
| Ugadhi Restaurant (Ugadhi Restrent) | UNVERIFIED | — | restaurants | justdial | no (T3 backlog) | null (never estimated) | — |
| Star Kitchen, Renigunta | UNVERIFIED | Renigunta | restaurants | justdial | no (T3 backlog) | null (never estimated) | — |

### Tiffin & breakfast centres

| Place | Status | Locality hint | DB target | Sources (kind) | Batch-012 | Coordinates | Notes |
|---|---|---|---|---|---|---|---|
| Aapam Tiffin Center, Renigunta | UNVERIFIED | Renigunta | restaurants | facebook-page | no (T3 backlog) | null (never estimated) | — |

### Bakeries, sweets & ice cream

| Place | Status | Locality hint | DB target | Sources (kind) | Batch-012 | Coordinates | Notes |
|---|---|---|---|---|---|---|---|
| Bangalore Ayengar Bakery | VERIFIED | Renigunta | restaurants | justdial | YES (restaurants) | null (never estimated) | — |
| Sri Laxmi Sweet Stall & Bakery | VERIFIED | Renigunta | restaurants | justdial | YES (restaurants) | null (never estimated) | — |

### Cafés & coffee

| Place | Status | Locality hint | DB target | Sources (kind) | Batch-012 | Coordinates | Notes |
|---|---|---|---|---|---|---|---|
| Chota Cafe | UNVERIFIED | Mangalam (Renigunta corridor) | restaurants | zomato | no (T3 backlog) | null (never estimated) | — |
| Zamzam restaurant | VERIFIED | — | restaurants | facebook-page | YES (restaurants) | null (never estimated) | address-pattern evidence recorded |
| MAMATHA'S COFFEE CAFE | VERIFIED | Renigunta | restaurants | magicpin | YES (restaurants) | null (never estimated) | address-pattern evidence recorded |

### Temples & sacred sites

| Place | Status | Locality hint | DB target | Sources (kind) | Batch-012 | Coordinates | Notes |
|---|---|---|---|---|---|---|---|
| Sri Prasanna Venkateswara Swamy Temple | UNVERIFIED | — | places | tripadvisor | no (T3 backlog) | null (never estimated) | address-pattern evidence recorded |

### Markets & shopping

| Place | Status | Locality hint | DB target | Sources (kind) | Batch-012 | Coordinates | Notes |
|---|---|---|---|---|---|---|---|
| Renigunta Weekend Market | UNVERIFIED | Renigunta | places | justdial | no (T3 backlog) | null (never estimated) | — |
| Sri Dharshini Enterprises Fancy &Gifts Store - | UNVERIFIED | — | places | justdial | no (T3 backlog) | null (never estimated) | — |

## Surrounding destinations (beyond city/Tirumala core)

### Temples & sacred sites

| Place | Status | Locality hint | DB target | Sources (kind) | Batch-012 | Coordinates | Notes |
|---|---|---|---|---|---|---|---|
| Srikalahasteeswara temple | VERIFIED | — | places | wikipedia | YES (restaurants) | null (never estimated) | — |
| Sri Govindaraja Swamy temple | VERIFIED | — | places | official | — (already Batch-011 candidate) | null (never estimated) | address-pattern evidence recorded |
| Sri Kalyana Venkateswara Swamy | VERIFIED | — | places | official | — (already Batch-011 candidate) | null (never estimated) | address-pattern evidence recorded |

### Tourist attractions

| Place | Status | Locality hint | DB target | Sources (kind) | Batch-012 | Coordinates | Notes |
|---|---|---|---|---|---|---|---|
| Talakona Waterfall | VERIFIED | — | places | makemytrip, official, wikipedia, tripadvisor | — (already Batch-011 candidate) | 13.81166, 79.21578 | address-pattern evidence recorded; official verbatim quote stored; 4 listing titles merged |
| Kalyani Dam | UNVERIFIED | — | places | wikipedia, tripadvisor, official | no (T3 backlog) | null (never estimated) | 3 listing titles merged |
| Horsley Hills | UNVERIFIED | — | places | makemytrip, official | no (T3 backlog) | null (never estimated) | 2 listing titles merged |
| 9 Waterfalls near Tirupati That Every Traveller Must Visit | UNVERIFIED | — | places | holidify | no (T3 backlog) | null (never estimated) | — |

## Cross-references to existing sets

Batch-011 (owner-blocked import, candidate unchanged): 13 curated candidates alias
10 of its 16 rows — listed in
docs/tirupati-duplicate-review.md; none are re-imported.

Production (live) rows re-encountered: 0 — none.

## Dropped candidates (with reasons — never silently deleted)

| Raw listing title | Area | Reason |
|---|---|---|
| Tirupati - Find Verified Local Businesses Near You on | tpt-central | generic directory/category page, not a place |
| Order Non Veg Food Online in Central Tirupati | tpt-central | swiggy search page, not a place |
| Locations of Trends in Tirupati | tpt-neighbourhoods | retail chain store-locator page |
| Tirumala Restaurants, Tirupati | tirumala | generic directory/category page, not a place |
| Tiruchanur Restaurants, Tirupati | tiruchanur | generic directory/category page, not a place |
| Renigunta Restaurants | renigunta | generic directory/category page, not a place |
| Popular Restaurants Serving Upma in Tirupati | tpt-central | generic listicle page |
| OTC - Orion Tiffin Centre | tpt-neighbourhoods | name empty/too short after cleaning |
| Tea Restaurants in Tirupati | tpt-central | generic directory/category page, not a place |
| Popular Packaged Juice Manufacturers in Tirupati | tpt-central | generic listicle page |
| Craving something sweet, delightful, and utterly irresistible? | tpt-neighbourhoods | social-media noise, no place identity |
| Korlagunta Restaurants, Tirupati | tpt-neighbourhoods | generic directory/category page, not a place |
| Renigunta Locality Restaurants, Tirupati | renigunta | directory page title, not a place |
| Ice Cream in Tirupati - Creamy Delights & Flavorful Treats | tpt-central | generic directory/category page, not a place |
| Tirupati laddu prasadam details and significance | tirumala | article title, not a place |
| Tirumala Temple Laddu Prasadam Counter Inside Visuals | tirumala | video title, not a place |
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
| Tirumala Tirupati Devasthanams | srinivasa-mangapuram | organisation, not a place |
| Chandragiri | chandragiri | ambiguous single-token name — source title does not establish whether it denotes Chandragiri Fort, the town, or another POI (identity rule; held out rather than guessed) |
| Religious Tourism | chandragiri | generic directory/category page, not a place |
| Religious Tourism | renigunta | generic directory/category page, not a place |
| Religious Tourism | surrounding | generic directory/category page, not a place |
| Museums in Tirupati | tpt-central | generic category page title, not a place |
| Nature & Parks in Tirupati | tpt-central | generic category page title, not a place |
| Others | tpt-central | generic directory/category page, not a place |
| Nature & Parks in Tirupati | tpt-neighbourhoods | generic category page title, not a place |
| Must View in Tirumala - Review of Papavinasam | tirumala | generic page title, not a place |
| Religious Tourism | srinivasa-mangapuram | generic directory/category page, not a place |
| Forest Tourism | surrounding | generic directory/category page, not a place |
| 5 Star hotels near Tirupati Railway Station Tirupati | tpt-central | generic hotel listing page |
| Online Hotel Booking | tpt-central | generic directory/category page, not a place |
| 10 Places to Stay Near Tirumala Temple - Tirupati Hotels | tirumala | generic hotel listing page |
| 10 Top Hotels in Renigunta | renigunta | generic hotel listing page |
| Tirupati | tpt-central | generic directory/category page, not a place |

## Renames (dirty listing title → clean display name; audited)

| Raw listing title | Clean name |
|---|---|
| Shankar Chats MR Palli Junction,Tirupati Credits | Shankar Chats |
| Saravana Bhavan Pure Veg Restaurant - Tirumala | Saravana Bhavan Pure Veg Restaurant |
| Ugadhi Restrent - Pure Veg Restaurants In Tirupati | Ugadhi Restaurant (Ugadhi Restrent) |
| Star Kitchen in Renigunta,Tirupati - Order Food Online | Star Kitchen, Renigunta |
| Vinayaka Tiffin Centre in Tirupati Bazar | Vinayaka Tiffin Centre |
| Revathi Mess & Catering'S - Hathiramji Colony, Tirupati | Revathi Mess & Catering |
| Nagarjuna Military Mess, Tirupati Authentic Andhra-style | Nagarjuna Military Mess |
| Revathi Mess & Catering Veg & Non Veg - Tirupati | Revathi Mess & Catering |
| Aapam Tiffin center, Renigunta | Aapam Tiffin Center, Renigunta |
| Mr'S Juice Bar in Kapilateertham Road,Tirupati | Mr's Juice Bar |
| Pani Puri Centre, Tirupati, India - Reviews, Ratings, Tips | Pani Puri Centre |
| Dessertezy in Bhavani Nagar Tirupati: Buy 2 Get 1 Free | Dessertezy |
| Order from 18Th Street Kitchen online in Tirupati | 18th Street Kitchen |
| Nic Natural Ice Creams in tml by pass road,Tirupati | NiC Natural Ice Creams |
| Grand cakes & bakes in Nethaji Road,Tirupati | Grand Cakes & Bakes |
| balaji bakery and sweets - Cake Shops In Tirupati | Balaji Bakery And Sweets |
| Bangalore Bakery , Korlagunta order online - Tirupati | Bangalore Bakery |
| Sri Venkateshwara Bakery And Sweets - Tirupati | Sri Venkateshwara Bakery And Sweets |
| Chota Cafe, Mangalam order online | Chota Cafe |
| Bnr Mall in Stv Nagar,Tirupati | BNR Mall |
