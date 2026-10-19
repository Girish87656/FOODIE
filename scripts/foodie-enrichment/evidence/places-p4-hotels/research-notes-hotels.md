# Phase B Step 3 — Tirupati QUALITY LODGING HOTELS research notes

Task ID: 3-b · Research-only agent · Retrieval date for EVERY source below: **2026-10-18**
Evidence dir: `scripts/foodie-enrichment/evidence/places-p4-hotels/` (all raw CLI JSON, never hand-edited)

Scope: 4–8 quality ACCOMMODATION hotels in Tirupati city (Andhra Pradesh; addresses pinned 517501/517507 — NOT Tirumala hilltop 517504), excluding the two Batch-009 lodging rows already in REV 2 ("Holiday Inn Tirupati Tirumala", "Starlit Suites") and the four food places ("Tirupati Foods", "Ni Cake World", "Ps4 Restaurant", "The 99 Pizza"). Name-overlap check against all six: NO overlap for any candidate below.

Honesty baseline: `verification_status='unverified'`, rating 0, price_level '₹₹', NULL lat/lng — unchanged by this research. NOTHING below verifies coordinates, prices, star ratings, check-in times, or amenities. Ratings/prices seen on portals are labelled NOT-FOR-DB.

RESULT SUMMARY: 7 insertable candidates (all with a successfully fetched official property/brand page): 1 Marasa Sarovar Premiere, 2 Fortune Select Grand Ridge, 3 Minerva Grand, 4 Ramee Guestline Hotel, 5 Ekanté Bliss (IHCL SeleQtions), 6 Kalyan Residency, 7 Hotel Nivaara Tirupati. Shortlist drops: Hotel Bhimas (no live official site), Hotel PLR Grand (held out — official domain rebranded to "Hotel Nivaara", continuity unprovable).

---

## 1. Marasa Sarovar Premiere, Tirupati  — recommended status: verified (identity + address, official page)

- Canonical name (official page spelling): "Marasa Sarovar Premiere, Tirupati" (page headline: "Marasa Sarovar Premiere, Tirupati - A 5 Star Hotel in Tirupati").
- Lodging confirmed? YES (official page states rooms inventory).
  - Quote: "121 spacious rooms across 3 categories A multi-cuisine restaurant, a vegetarian restaurant, and a bar … 2 banquet halls and 2 board rooms Fitness centre" (hotel facilities block on the official page).
- Address — official page states it verbatim; supports `address` (+ `locality` "Upadhyaya Nagar"):
  - Quote: "Upadhyaya Nagar, Karakambadi Road, Tirupati - 517507 Andhra Pradesh" (official page contact block, adjacent to headline).
- Sources:
  - https://www.sarovarhotels.com/marasa-sarovar-premiere-tirupati-hotels — fetched OK (page-sarovarhotels-marasa-sarovar-premiere-tirupati.json; page title "Marasa Sarovar Premiere | Tirupati Hotel | Tirumala Hotels"; meta description: "Marasa Sarovar Premiere, Tirupati is Trip Advisor's Top rated 5 star Tirupati hotel - located close to Tirumala hills and Lord Venkateshwara temple."). Supports: name, address, lodging (rooms), official brand page. [2026-10-18]
  - https://www.louvrehotels.com/en-us/hotels/marasa-sarovar-premiere-tirupati — search snippet only ("…serene rooms, dining, a pool, a spa… +91 877 6660000 Upadhaya … located at …"). Supports: existence, chain-brand page (Louvre/Sarovar). [2026-10-18]
  - https://www.travelweekly.com/Hotels/Tirupati-India/Marasa-Sarovar-Premiere-p50749387 — search snippet only ("Upadyaya Nagar, Karakambadi Rd, Tirupati , India 517507"). Corroborates address. [2026-10-18]
- Conflicts/unresolved:
  - The shortlist hint domain **marasasarovar.com does NOT resolve** — page_reader failed twice ("Domain 'www.marasasarovar.com' could not be resolved", then "Failed to resolve domain 'marasasarovar.com' (EAI_AGAIN)"). No marasasarovar.com evidence file exists. The working official page is the chain site sarovarhotels.com (Sarovar Hotels manages the property; LinkedIn company page cites that same URL as its official website).
  - Minor spelling variance in third parties: "Upadhaya" (Louvre/TravelWeekly snippets) vs "Upadhyaya" (official page). Official spelling used.
  - Pin 517507 (not 517501) per official page — do not "normalize" to 517501.
- Status rationale: identity + address directly stated on the fetched official brand page → 'verified' for those fields only. Star rating ("5 Star") seen but NOT-FOR-DB (star rating not a stored field).

## 2. Fortune Select Grand Ridge, Tirupati  — recommended status: verified (identity + address, official page)

- Canonical name (official page spelling): "Fortune Select Grand Ridge, Tirupati" (page title).
- Lodging confirmed? YES.
  - Quote: "Accommodation All All Rooms Suites … Deluxe Room Our Deluxe Rooms offer an elegant contemporary ambience for a comfortable good night's sleep. The rooms are available with an option of either a king size bed or twin bed. Room Area: 29.7 sq. m" (official page Accommodation section).
- Address — official page states it verbatim; supports `address` (+ `locality` "Shilparamam"):
  - Quote: "LOCATION Shilparamam, Tiruchanoor Road Tirupati - 517 501, Andhra Pradesh" (official page LOCATION block).
- Sources:
  - https://www.itchotels.com/in/en/fortuneselectgrandridge-tirupati — fetched OK (page-itchotels-fortune-select-grand-ridge-tirupati.json; title "Fortune Select Grand Ridge, Tirupati"; meta "Relax at Fortune Select grandridge Tirupati, perfect for family holidays or weekend getaways, with spacious rooms, multi-cuisine dining, and ITC Hotel's trusted hospitality."). Supports: name, address, lodging. Fortune is an ITC Hotels group brand. [2026-10-18]
  - https://www.fortunehotels.in/tirupati-fortune-select-grand-ridge-dining.dhm.29 — search snippet only ("Fortune Select Grand Ridge, Tirupati offers fine dining vegetarian restaurants, 24 hour coffee shop and bakery shop in Tirupati…"). Supports: property exists on the fortunehotels.in chain site (dining subpage; the hint domain is live). [2026-10-18]
  - Booking portals (Booking.com / Expedia / TripAdvisor) — search snippets only; corroborate existence. Booking.com snippet "100% nonsmoking rooms with an outdoor pool, spa, fitness center…" NOT-FOR-DB (amenities/pricing claims unverified). [2026-10-18]
- Conflicts/unresolved:
  - Pin written "517 501" (spaced) on the official page = 517501. No conflict.
  - Shortlist hint said fortunehotels.in; the fetched official page is the parent-brand itchotels.com page. Both are official ITC/Fortune properties; the fortunehotels.in property page was NOT separately fetched (only its dining subpage appeared in search) — if the later import wants the fortunehotels.in URL instead, that page must be fetched first.
- Status rationale: identity + address directly stated on the fetched official page → 'verified' for those fields.

## 3. Minerva Grand Tirupati  — recommended status: partially_verified (identity + lodging verified; exact street address NOT on official page)

- Canonical name (official site spelling): "Minerva Grand Tirupati" (used in body text: "Minerva Grand Tirupati Rooms", "…located on ground floor of Minerva Grand Tirupati…"; page title names the property by locator only: "Destination – Tirupati – Renigunta Road - Minerva Group of Hotels").
- Lodging confirmed? YES.
  - Quote: "In each of the 69 luxurious rooms & suites and in the array of business, dining and comfortable facilities…" and "ROOMS & SUITES PREMIUM ROOM Our Premium Rooms offers an elegant contemporary ambience for a comfortable good night's sleep. … No. of rooms: 33, Area: 235 sft."
- Address — the official page does NOT state a full street address. It states only the road locator and distances:
  - Quote: "The hotel is located 1 km (5 minutes drive) from Tirupati Railway Station & 14 kms (20 minutes drive) from Renigunta Airport. It is also in close proximity to Bus stand, Renigunta Railway station and the highways." (official page)
  - Locality token "Renigunta Road – Tirupati" appears throughout the official site navigation/footer. Supports `locality`='Renigunta Road' at best; NOT a street address.
  - Third-party street addresses exist but were NOT fetched from any official page and must NOT be stored as verified: MakeMyTrip snippet "Near Railway Flyover, Renigunta Road, Beside Reliance mart, Tirupati-517501"; meetings-conventions snippet "National Highway 205, Renigunta Rd, Ne Tirupati, India 517501". Supplementary only. [2026-10-18]
- Sources:
  - https://minervahotels.in/tirupati-renigunta-road — fetched OK (page-minervahotels-tirupati-renigunta-road.json). Supports: name ("Minerva Grand Tirupati"), lodging (69 rooms & suites), locality (Renigunta Road), official group page. [2026-10-18]
  - https://www.justdial.com/Tirupati/Minerva-Grand-Hotel-Renigunta-Road/… — search snippet only. Corroborates existence + locality. [2026-10-18]
- Conflicts/unresolved:
  - Chain name is "Minerva Group of Hotels" (Hyderabad/Secunderabad/Vijayawada/Nellore/Tirupati); the Tirupati property brands as "Minerva Grand" while some third parties list "Minerva Grand Hotel". Same property (same Justdial/booking listings); canonical name should follow the official body text "Minerva Grand Tirupati".
  - No exact street address on official page → address stays UNKNOWN for import purposes unless a later agent fetches a page that states it.
- Status rationale: 'partially_verified' — identity + lodging directly supported by fetched official page; address not stated there.

## 4. Ramee Guestline Hotel, Tirupati  — recommended status: verified (identity + address via official page JSON-LD)

- Canonical name (official site spelling): "Ramee Guestline Hotel, Tirupati" (schema.org JSON-LD `name` served by the official page; page title "Ramee Guestline Tirupati - official website").
- Lodging confirmed? YES — the served JSON-LD declares `@type: "LodgingBusiness"` with brand "Ramee Group of Hotels"; room-rate UI assets ("RoomCard.css", "priceRange: $$-$$$") are embedded in the official page's served HTML.
  - JSON-LD quote (verbatim from official page source): `{"@context":"https://schema.org","@type":"LodgingBusiness","name":"Ramee Guestline Hotel, Tirupati",… "address":{"@type":"PostalAddress","streetAddress":"14/37 Karakambadi Rd, Mangalam, Tirupati, Andhra Pradesh 517507, India ","addressCountry":"IN"},"telephone":"+91 9505504406","email":"reservations.tirupati@rameehotels.com","brand":{"@type":"Brand","name":"Ramee Group of Hotels"},"priceRange":"$$-$$$"}`
- Address — official page JSON-LD states it verbatim; supports `address` (+ `locality` "Mangalam"):
  - Quote: "14/37 Karakambadi Rd, Mangalam, Tirupati, Andhra Pradesh 517507, India"
- Sources:
  - https://rameehotels.com/ramee-guestline-hotel-tirupati — fetched OK (page-rameehotels-guestline-tirupati.json). NOTE: React SPA — extracted body text is only the title ("Ramee Guestline Tirupati - official website"), but the SERVED HTML embeds the JSON-LD block quoted above; name + address + LodgingBusiness type all come from the official domain's own served markup. [2026-10-18]
  - Search snippet of the same URL: "- Official Site. Ramee Guestline Hotel, Tirupati 14/37 Karakambadi Rd, Mangalam, Tirupati , Andhra Pradesh 517507" — corroborates. [2026-10-18]
  - Third-party locality variance: EaseMyTrip snippet says "14-37, Karakambadi Rd, Akkarampalle, Tirupati, Andhra Pradesh" vs official "Mangalam". Official wins; noted as conflict.
- Conflicts/unresolved:
  - TripAdvisor legacy name "Ramee Guestline Days Hotel, Tirupati" (search snippet) — older branding; current official name has no "Days".
  - SPA rendering: the visual page body could not be text-extracted; evidence rests on the served JSON-LD (still first-party official markup). Acceptable; flagged for the reviewer.
- Status rationale: identity + address directly stated by the fetched official page (JSON-LD) → 'verified' for those fields. Note 517507 pin (not 517501).

## 5. Ekanté Bliss, Tirupati (IHCL SeleQtions)  — shortlist entry was "Bliss Hotel Tirupati" — recommended status: verified (identity + address, official page)

- Canonical name (official page spelling): "Ekanté Bliss, Tirupati - IHCL SeleQtions" (page title: "Ekante Bliss, Tirupati - IHCL SeleQtions | Luxury Hotel near Tirumala Temple, Tirupati"; body: "EKANTÉ BLISS, TIRUPATI - IHCL SELEQTIONS").
- NAME-CHANGE ALERT: the shortlist name "Bliss Hotel Tirupati" is the property's OLD identity. IHCL (Indian Hotels Company / Taj group) opened "Ekante Bliss - IHCL SeleQtions" in Tirupati in Feb 2024 (Economic Times Hospitality news snippet, dated 2024-02-18: "IHCL has announced the opening of Ekante Bliss, an IHCL SeleQtions branded hotel in Tirupati"). Booking portals (MakeMyTrip/Trip.com) already list it as "Ekante' Bliss Tirupati - IHCL SeleQtions". Canonical name = official "Ekanté Bliss, Tirupati".
- Lodging confirmed? YES.
  - Quote: "Rooms & Suites 113 Rooms & 5 Suites" (official page essentials block) and "ROOM DETAILS Deluxe Room Twin Bed Situated on our higher floors…".
- Address — official page states it verbatim; supports `address` (+ `locality` "Near Ramanuja Circle"):
  - Quote: "Contact Address 19-3-45, Near Ramanuja Circle, Renigunta Rd, Tirupati, Andhra Pradesh , 517501, India" (official page HOTEL ESSENTIALS block).
- Sources:
  - https://www.seleqtionshotels.com/en-in/hotels/ekante-bliss-tirupati — fetched OK (page-seleqtionshotels-ekante-bliss-tirupati.json). Supports: name, address, lodging, official brand page (IHCL SeleQtions). [2026-10-18]
  - https://hospitality.economictimes.indiatimes.com/news/hotels/ihcl-opens-ekante-bliss-ihcl-seleqtions-in-tirupati-andhra-pradesh/107778859 — search snippet only (2024-02-18). Supports: rebrand/opening history. [2026-10-18]
  - Facebook page snippet: "19-3-45, Near Ramanuja Circle, Renigunta Rd, Andhra Pradesh, Tirupati , India, 517501" — corroborates address. [2026-10-18]
- Conflicts/unresolved:
  - Old vs new name: "Bliss Hotel" (shortlist, booking-portal legacy titles like ph.trip.com "Bliss Hotel") vs "Ekanté Bliss, Tirupati" (current official). Import should use the official spelling; do NOT store the old name.
  - Email on official page "book.ekantebliss@seleqtionshotels.com" — not needed for DB.
  - Hotel pages display live rates (e.g. calendar "₹5.4K") — NOT-FOR-DB.
- Status rationale: identity + address directly stated on the fetched official page → 'verified' for those fields.

## 6. Kalyan Residency, Tirupati  — recommended status: verified (identity + address, official page)

- Canonical name (official site spelling): "Kalyan Residency" (site title "Kalyan Residency Hotel Tirupati | Book Tirupati Hotel Online"; body: "Kalyan Residency Hotel in Tirupati").
- Lodging confirmed? YES.
  - Quote: "Kalyan Residency is an elegant 3 star hotel with 58 well appointed rooms designed for a comfortable stay in Tirupati. The hotel is centrally air-conditioned and has a tranquil ambiance." (official home page) — room categories follow ("SUPERIOR ROOMS CLASSIC PREMIUM BIG SIZE BED ROOM…").
- Address — official page states it verbatim (repeated 3× on the page); supports `address` (+ `locality` "Tata Nagar"):
  - Quote: "No.177, Tata Nagar Rd, Near Central Bus Stand, Tata Nagar, Tirupati, Andhra Pradesh 517501, India"
- Sources:
  - https://www.kalyanresidency.com — fetched OK (page-kalyanresidency-home.json). Supports: name, address, lodging, official property site. [2026-10-18]
  - Booking portals (Booking.com/TripAdvisor/Trivago/Agoda) — search snippets only; corroborate existence ("Located just a 5-minute drive from Kapila Theertham Temple…"). NOT-FOR-DB for any prices. [2026-10-18]
- Conflicts/unresolved:
  - PIN CONFLICT: official site footer/address says **517501**; the hotel's own Facebook snippet says "177,T.P.AREA, Tirupati, India, 517502" and locality "T.P. Area" vs official "Tata Nagar". Official site wins (fetched first-party); flag for reviewer — both names refer to the same block near Central Bus Stand, but this is not proven here.
- Status rationale: identity + address directly stated on the fetched official property site → 'verified' for those fields. Star rating "3 star" appears on the official page but star ratings are NOT-FOR-DB.

## 7. Hotel Nivaara Tirupati  — ADDITIONAL candidate found during PLR Grand research — recommended status: partially_verified

- Canonical name (official page spelling): "Hotel Nivaara Tirupati" (page title "Hotel Nivaara Tirupati — Best Luxury Hotel Near Tirumala Temple"; JSON-LD `@type: "Hotel"`, `name: "Hotel Nivaara Tirupati"`).
- Lodging confirmed? YES.
  - Quote: "Stay Rooms & Suites Ninety premium rooms in two crafted typologies — king and superior." and "Rooms & Tariffs … 288 Sq Ft … Superior Room … Book Now".
- Address — official page states it verbatim (footer + JSON-LD); supports `address`:
  - Footer quote: "Next to APSRTC Central Bus Station, Tirupati - 517501, AP, India"
  - JSON-LD quote: `"streetAddress":"Next to APSRTC Central Bus Station","addressLocality":"Tirupati","postalCode":"517501","addressRegion":"AP","addressCountry":"IN"`
- Sources:
  - http://www.hotelplrgrand.com/ — fetched OK (page-hotelplrgrand-home.json) — THIS DOMAIN NOW SERVES THE HOTEL NIVAARA SITE (see conflicts). Supports: name, address, lodging. [2026-10-18]
  - https://www.plrprojects.com/plrgrand.html — fetched OK (page-plrprojects-plrgrand.json) — owner group page listing "PLR Grand Hotel" as a group company: "Website: www.hotelplrgrand.com Hotel grand *** is a three star hotel with 100 spacious, richly decorated rooms distributed over five floors. … The hotel is right next to the central Bus station…" [2026-10-18]
  - Booking portals (Agoda/Trivago) still list "Hotel PLR Grand" at "Jayasyam Rd, Behind Central Bus Stand, Tata Nagar, Tirupati, 517501" — search snippets only; supplementary; NOT-FOR-DB. [2026-10-18]
- Conflicts/unresolved (IMPORTANT):
  - REBRAND CONFLICT, continuity unproven: the domain hotelplrgrand.com (which the owner group page cites for "PLR Grand Hotel") now serves a site that NEVER mentions "PLR" (0 occurrences in served HTML) and brands itself "Hotel Nivaara Tirupati" with 90 rooms (group page said 100 rooms) at the same central-bus-station location, same contact domain (res.tpt@nivaarahotels.com). NO fetched source explicitly states that Hotel Nivaara IS the former Hotel PLR Grand. It could be a rename, a rebranded re-opening, or a new property on the same site. Treat as TWO separate records with this caveat; do not merge without stronger evidence.
  - No independent corroboration for "Nivaara" beyond its own site fetched in this batch (booking portals still use the old name).
- Status rationale: 'partially_verified' — identity + address + lodging directly stated by the fetched official page, but the property's identity history/external corroboration is unresolved. If imported: name "Hotel Nivaara Tirupati", tags should disambiguate (e.g. 'lodging', 'new_brand_uncertain_history' is NOT a real tag — use existing tag vocabulary; suggest 'lodging' + 'brand_chain' per plan conventions, reviewer to decide).

## 8. Hotel Bhimas, Tirupati  — DROPPED from shortlist

- Drop reason: NO LIVE OFFICIAL WEBSITE could be substantiated.
  - https://www.hotelbhimas.com → page_reader FAILED twice: "Domain 'www.hotelbhimas.com' could not be resolved" then same for bare domain (page-hotelbhimas-home.json / page-hotelbhimas-home-retry.json NOT created). The domain was cited by the hotel's own Facebook snippet ("hotelbhimas.com") but does not resolve.
  - https://bhimasresidency.com → fetched OK but the page is a GoDaddy EXPIRED/PARKED notice: "bhimasresidency.com has expired and is parked free, courtesy of GoDaddy.com." (page-bhimasresidency-home.json). Not an official property page.
  - Alternate-domain search (search-bhimas-group-alternate-domains.json) surfaced only booking portals (guestreservations "Bhimas Deluxe Hotel", TripAdvisor "42 G Car Street, Tirupati 517501"), the group's Facebook page, and the corporate registry (zaubacorp: "BHIMAS HOTELS PRIVATE LIMITED … 34-38 G, CAR STREET, TIRUPATHI … 517501"). No live first-party property page.
- Residual evidence (for the record, NOT sufficient for insert): existence as a lodging hotel is corroborated by multiple portals ("Hotel Bhimas", "Bhimas Deluxe Hotel", G. Car Street, 517501), and a "Bhimas Residency" property at "19-3-41, Near Ramanuja Circle, Renigunta Road, Tirupati, Andhra Pradesh 517501" appears in a cached bhimasresidency.com contact-page snippet — all snippet-level, no fetched official page, plus name variants (Hotel Bhimas / Bhimas Deluxe / Bhimas Residency) that would need disambiguation first.
- Status: unverified → NOT insertable under the rules. If a future agent finds a live official domain, re-run research.

## 9. Hotel PLR Grand, Tirupati  — HELD OUT from shortlist

- Hold reason: the property's own domain no longer names it. http://www.hotelplrgrand.com now serves the "Hotel Nivaara Tirupati" site (0 occurrences of "PLR" in the served HTML — page-hotelplrgrand-home.json). The owner group page (plrprojects.com, fetched) still lists "PLR Grand Hotel" and cites www.hotelplrgrand.com — i.e., first-party sources contradict each other on the current brand. No live official page states the name "Hotel PLR Grand" as a current property; booking portals (Agoda/Trivago snippets) still use the old name but are supplementary-only under the rules.
- What IS supported: the group page confirms a lodging hotel ("three star hotel with 100 spacious… rooms", "right next to the central Bus station" [Tirupati context]) named "PLR Grand Hotel" at some point; the location profile matches Nivaara's ("Next to APSRTC Central Bus Station").
- Status: held_out. Successor candidate "Hotel Nivaara Tirupati" (#7) carries the conflict note. Do not insert both without resolving the rebrand question; prefer NOT to insert "Hotel PLR Grand" at all unless a fetched official source re-uses that name.

---

## Searches/pages that FAILED (recorded; no files created for failures)

| Target | Call | Error | Attempts |
|---|---|---|---|
| https://www.hotelbhimas.com | page_reader | 422 "Domain 'www.hotelbhimas.com' could not be resolved" | 1 |
| http://hotelbhimas.com | page_reader (retry) | 422 "Domain 'hotelbhimas.com' could not be resolved" | 1 |
| https://www.marasasarovar.com | page_reader | 422 "Domain 'www.marasasarovar.com' could not be resolved" | 1 |
| http://marasasarovar.com | page_reader (retry) | 422 "Failed to resolve domain 'marasasarovar.com' (EAI_AGAIN)" | 1 |

No 429 rate-limit events occurred in this batch; all failures were DNS-resolution (dead domains), consistent with the sequential-calls-with-sleeps method. All successful outputs were saved via `-o` and verified by file size + content read.

## Explicitly NOT verified (do not store any of these as data)

- Coordinates (latitude/longitude) — none; stay NULL.
- Room prices / tariffs / rate calendars seen on official and portal pages (Marosa/Bliss/Nivaara/portal snippets) — NOT-FOR-DB.
- Star ratings / "luxury" / "4-star"/"5-star"/"3-star" self-claims — NOT-FOR-DB (rating stays 0).
- Check-in/check-out times, phone numbers, emails, GSTIN — recorded here only as quoted page evidence; not DB fields for this import plan.
- Amenities lists (pools, gyms, restaurants on-site) — quoted only to prove LODGING, not for storage.
- Any exact street address for Minerva Grand (official page omits it) and any address at all for the dropped Hotel Bhimas.
- The PLR Grand → Nivaara continuity (rebrand) — unresolved.
