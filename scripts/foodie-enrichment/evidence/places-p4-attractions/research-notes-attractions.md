# Phase B Step 3 — Tirupati/Tirumala ATTRACTIONS research notes (Task ID: 3-a)

- Retrieval date for ALL sources below: **2026-10-18** (single session; every URL was fetched live via the z-ai CLI `web_search` / `page_reader`; raw CLI outputs stored unmodified in this directory).
- Research-only task: NO SQL was written, NO app code modified, NO git actions, NO credentials read.
- Evidence dir: `/home/z/my-project/scripts/foodie-enrichment/evidence/places-p4-attractions/` (raw JSON files, filenames are slugs of the query/page, never hand-edited).

## DB-READINESS (applies to EVERY attraction below — restated per file convention)

**ALL 10 attractions are HELD OUT for DB insert pending an approved schema change.** The Foodie `restaurants` table constrains `category` to exactly 7 values (restaurant | hotel | tiffin | cafe | fast_food | street_food | bakery_sweets). **There is NO 'attraction' category.** Nothing in this file is DB-ready; statuses below describe the *evidence quality*, not DB readiness. Do not insert any of these rows under a food category.

## Method note

- 8 web searches + 11 page fetches, all run sequentially with sleeps (no parallel calls); **0 failures, 0 rate-limit events this session**.
- Priority observed: official sources fetched first (tirumala.org, ttdevasthanams.ap.gov.in, tirupati.ap.gov.in, incredibleindia.gov.in, tirupatizoo.com, iskcontirupati.info, whc.unesco.org). Wikipedia/Google Maps/tripadvisor were used only as search-result context and were NOT fetched this session — no ratings, review counts, or prices were recorded as data anywhere in this file.
- Hour "Open | Closes HH:MM PM IST" strings on ttdevasthanams.ap.gov.in/temples are what the official portal *displayed* on retrieval date — they are not a documented schedule and were NOT copied into any dataset; noted as evidence only.

---

## 1. Sri Venkateswara Swamy Temple, Tirumala

- **Canonical name (per best source):** "Sri Venkateswara Swamy Temple" — exactly as the official TTD website spells it.
- **Place type:** temple (Hindu/Vaishnavite pilgrimage temple).
- **Locality/area:** Tirumala — supported by TTD site grouping "At Tirumala" directly above the temple name.
- **Sources:**
  1. https://www.tirumala.org (Tirumala Tirupati Devasthanams Official Website) — fetched 2026-10-18. Supports: canonical name, "At Tirumala" grouping, official-domain existence.
  2. https://www.tirumala.org/TTDTempleHistory.aspx — fetched 2026-10-18. Supports: name + temple description.
  3. https://whc.unesco.org/en/tentativelists/6894 — fetched 2026-10-18 (supplementary corroboration). Supports: existence + "near the Tirumala Venkateswara Temple".
- **Verbatim quotes:**
  - tirumala.org home: menu block heading `At Tirumala` followed by `Sri Venkateswara Swamy Temple`.
  - TTDTempleHistory.aspx: "THE DIVINE STRUCTURE OF THE TIRUMALA MAIN TEMPLE — Lord Sri Venkateswara, also known as Srinivasa, Balaji, and Veṅkaṭachalapati, made Tirumala his abode five thousand years ago."
  - UNESCO: "The Natural Arch of Tirumala Hills, also known as Silathoranam, is a unique rock formation located near the Tirumala Venkateswara Temple in Andhra Pradesh, India." (corroborates the temple as an established landmark).
- **Conflicts/unresolved:** None on name. ("Tirumala Venkateswara Temple" is the UNESCO phrasing of the same temple; the Foodie live destination description also uses "Tirumala Venkateswara Temple".)
- **Recommended status:** **verified** for name + existence + "At Tirumala" grouping (official TTD, fetched). Locality granularity beyond "Tirumala hill town" not pursued.
- **NOT verified:** address string, exact coordinates, opening/closing hours, fees, entry policies.

## 2. Sri Padmavathi Ammavari Temple, Tiruchanoor

- **Canonical name (per best source):** "Sri Padmavathi Ammavari Temple" — as on both ttdevasthanams.ap.gov.in and tirumala.org.
- **Place type:** temple (Goddess Padmavathi / Ammavari temple).
- **Locality/area:** Tiruchanoor (TTD official spelling).
- **Sources:**
  1. https://ttdevasthanams.ap.gov.in/temples (TTD Official Booking Portal) — fetched 2026-10-18. Supports: name + locality + displayed closing time.
  2. https://www.tirumala.org/PatAtThiruchanoorSevas.aspx — fetched 2026-10-18. Supports: name + TTD's own "At Tiruchanoor" temple section (Temple Legend / Arjitha Sevas).
  3. https://www.tirumala.org/Places%20to%20see%20around%20Tirumala.aspx — fetched 2026-10-18. Supports: "At Tiruchanoor Sri Padmavathi Ammavari Temple" menu grouping.
  4. https://tirupati.ap.gov.in/religious-tourism — fetched 2026-10-18. Supports: locality sentence.
- **Verbatim quotes:**
  - ttdevasthanams.ap.gov.in/temples: "Sri Padmavathi Ammavari Temple, Tiruchanoor … Open | Closes 9:30 PM IST" (portal display on retrieval date — NOT a stored field).
  - tirumala.org PatAtThiruchanoorSevas.aspx: menu block heading "Sri Padmavathi Ammavari Temple" with links "Temple Legend", "Arjitha Sevas".
  - tirupati.ap.gov.in/religious-tourism: "The temple is situated in Tiruchanur, Tirupati in Tirupati district of Andhra Pradesh, India."
- **Conflicts/unresolved:** Spelling — official TTD uses **"Tiruchanoor"**, Tirupati district site uses **"Tiruchanur"**. Same place; TTD spelling recommended if ever stored.
- **Recommended status:** **verified** for name + locality (two official TTD domains + district page, all fetched).
- **NOT verified:** street address, coordinates, full opening schedule, fees, darshan timings detail.

## 3. Sri Govindaraja Swamy Temple, Tirupati

- **Canonical name (per best source):** "Sri Govindaraja Swamy Temple" (TTD portal spelling). District site writes "Sri Govindarajaswamy Temple", tirumala.org nav writes "Sri Govindarajaswami Temple" — same temple, minor orthographic variants.
- **Place type:** temple (Hindu-Vaishnavite).
- **Locality/area:** Tirupati city — "at the heart of the Tirupati city" (district page).
- **Sources:**
  1. https://ttdevasthanams.ap.gov.in/temples — fetched 2026-10-18. Supports: name + locality token "Tirupati" + displayed closing time.
  2. https://tirupati.ap.gov.in/religious-tourism — fetched 2026-10-18. Supports: name, locality, founding/consecration facts, TTD administration.
  3. https://www.tirumala.org/Places%20to%20see%20around%20Tirumala.aspx — fetched 2026-10-18. Supports: "At Tirupathi — Sri Govindarajaswami Temple" grouping.
- **Verbatim quotes:**
  - ttdevasthanams.ap.gov.in/temples: "Sri Govindaraja Swamy Temple, Tirupati … Open | Closes 9:00 PM IST".
  - tirupati.ap.gov.in/religious-tourism: "Sri Govindarajaswamy Temple is an ancient Hindu-Vaishnavite temple situated at the heart of the Tirupati city in Tirupati District of Andhra Pradesh state in India. The temple was built during 12 century and was consecrated in the year 1130 AD by Saint Ramanujacharya."
- **Conflicts/unresolved:** Name orthography only (Govindaraja Swamy / Govindarajaswamy / Govindarajaswami).
- **Recommended status:** **verified** for name + existence + "heart of Tirupati city" locality (official TTD + district, fetched).
- **NOT verified:** street address, coordinates, hours, fees.

## 4. Kapila Theertham (TTD listing: "Sri Kapilatheertham Temple")

- **Canonical name (per best source):** **"Kapila Theertham"** as written by the Tirupati district site; the official TTD booking portal lists it as **"Sri Kapilatheertham Temple, Tirupati"**. Recommended canonical: "Sri Kapilatheertham Temple" if the TTD listing is taken as primary, with "Kapila Theertham" as the district-site variant. (Decision deferred with the held-out record.)
- **Place type:** temple (Saivite) + theertham (temple water-tank/waterfall pool) at the foot of the Tirumala hills.
- **Locality/area:** Tirupati, "at the entrance to a mountain cave … at the foot of the Tirumala hills which are part of Seshachalam Hills" (district page).
- **Sources:**
  1. https://ttdevasthanams.ap.gov.in/temples — fetched 2026-10-18. Supports: official TTD listing name + locality token "Tirupati" + displayed closing time.
  2. https://tirupati.ap.gov.in/religious-tourism — fetched 2026-10-18. Supports: name, description, setting.
- **Verbatim quotes:**
  - ttdevasthanams.ap.gov.in/temples: "Sri Kapilatheertham Temple, Tirupati … Open | Closes 8:00 PM IST".
  - tirupati.ap.gov.in/religious-tourism: "Kapila Theertham is a famous Saivite Temple and Theertham, located at Tirupati. … The temple stands at the entrance to a mountain cave in one of the steep and vertical faces at the foot of the Tirumala hills which are part of Seshachalam Hills, where the waters of the mountain stream fall directly into Temple Pushkarini known as "Kapila Theertham"."
- **Conflicts/unresolved:** Name variants — TTD portal "Sri Kapilatheertham Temple"; district "Kapila Theertham"; tirumala.org nav menu lists "Sri Kapliswaraswamy Temple" (apparent same-site variant, lower confidence; identity match not independently confirmed this session).
- **Recommended status:** **verified** for existence + Tirupati locality; **partially_verified** for exact canonical spelling (3+ variants across official sources).
- **NOT verified:** street address, coordinates, hours, fees, waterfall-stream details beyond quoted description.

## 5. Sri Kalyana Venkateswara Swamy Temple, Srinivasa Mangapuram

- **Canonical name (per best source):** "Sri Kalyana Venkateswara Swamy Temple" — identical spelling on both official sources.
- **Place type:** temple (Vaishnavite; ASI-protected monument maintained by TTD).
- **Locality/area:** Srinivasa Mangapuram, "about 10 km in the west part of Tirupati city" (district page).
- **Sources:**
  1. https://ttdevasthanams.ap.gov.in/temples — fetched 2026-10-18. Supports: name + locality "Srinivasa Mangapuram" + displayed closing time.
  2. https://tirupati.ap.gov.in/religious-tourism — fetched 2026-10-18. Supports: name, locality, distance/direction, ASI/TTD administration.
- **Verbatim quotes:**
  - ttdevasthanams.ap.gov.in/temples: "Sri Kalyana Venkateswara Swamy Temple, Srinivasa Mangapuram … Open | Closes 8:15 PM IST".
  - tirupati.ap.gov.in/religious-tourism: "The ancient temple of Sri Kalyana Venkateswara Swamy is located in Srinivasa Mangapuram, about 10 km in the west part of Tirupati city. This ancient temple which is under the control of Archaeological Survey of India (ASI) is maintained by Tirumala Tirupati Devasthanams since 1967…"
- **Conflicts/unresolved:** None on name/locality. (District page separately covers a different "Kalyana Venkateswara Temple, Narayanavanam" — distinct temple, do not conflate.)
- **Recommended status:** **verified** for name + locality + distance claim as quoted (official sources).
- **NOT verified:** street address, coordinates, hours, fees.

## 6. ISKCON Tirupati

- **Canonical name (per best source):** **"ISKCON Tirupati"** (official site title/branding; about page: "ISKCON Tirupati Temple").
- **Place type:** religious_site (Hare Krishna movement temple, with vegetarian restaurant "Govinda" and guest house on site).
- **Locality/area:** Ramachandra Nagar / Hare Krishna Road, Vinayaka Nagar, Tirupati 517507 — per the official site's own text and footer address.
- **Sources:**
  1. https://iskcontirupati.info/about-iskcon-tirupati — fetched 2026-10-18. Supports: name ("ISKCON Tirupati", "ISKCON Tirupati Temple", "Hare Rama Hare Krishna temple"), locality, distance-to-transport claims, on-site amenities (Govinda restaurant, Goshala).
- **Verbatim quotes:**
  - "Popularly also known as Hare Rama Hare Krishna temple, located in the Ramachandra Nagar, on the Hare Rama Hare Krishna Road, ISKCON Tirupati Temple is easily accessible. It is about 4 km away from Tirupati Bus Stand and at a distance of 5 km from Tirupati railway station."
  - Footer ADDRESS: "Hare Krishna Land, Hare Krishna Road, Vinayaka Nagar, Tirupati - 517507. Andhra Pradesh."
  - "There is a vegetarian restaurants Govinda, offering healthy vegetarian food in a hygienic environment."
- **Conflicts/unresolved:** The task's candidate phrasing "Sri Venkateswara Temple of the Hare Krishna movement" was **NOT found** on the fetched official about page (zero occurrences of "Venkateswara"). Also: the domain is **iskcontirupati.info** (verified live), NOT iskcontirupati.com — the .com was not found in search results and no .com claim is made. Recommended canonical name: "ISKCON Tirupati".
- **Recommended status:** **verified** for name + existence + official locality/address line (attraction's own official site, fetched).
- **NOT verified:** coordinates, precise opening hours (the page displays "Daily darshan … starts from 4.15 AM to 5:00 AM & 7:30 AM to 8:30 PM" — recorded as quote only, not a verified schedule), fees.

## 7. Silathoranam / Natural Arch, Tirumala hills

- **Canonical name (per best sources):** **"Natural Arch, Tirumala hills"** (UNESCO; district page), "also known as Silathoranam" (both). District page heading: "Silathoranam, Tirumala".
- **Place type:** viewpoint / natural geo-heritage monument (natural rock arch).
- **Locality/area:** Tirumala hills, near the Tirumala temple / Chakra Teertham — "a distinctive geological feature 1 km (0.6 mi) north of the Tirumala hills temple, near the Chakra Teertham" (district page).
- **Sources:**
  1. https://whc.unesco.org/en/tentativelists/6894 (UNESCO World Heritage Centre — Tentative List "Natural Heritage of Tirumala Hills") — fetched 2026-10-18. Supports: name, "also known as Silathoranam", proximity to the temple, and published coordinates "13°41′14″N 79°20′25″ E" (from the UNESCO page itself).
  2. https://tirupati.ap.gov.in/religious-tourism — fetched 2026-10-18. Supports: name, geo-heritage status, 1 km north / Chakra Teertham location.
- **Verbatim quotes:**
  - UNESCO: "The Natural Arch of Tirumala Hills, also known as Silathoranam, is a unique rock formation located near the Tirumala Venkateswara Temple in Andhra Pradesh, India."
  - UNESCO coordinate line: "Natural Arch, Tirumala hills - 13°41′14″N 79°20′25″ E".
  - District: "Natural Arch, Tirumala hills , a notified National Geo-heritage Monument , is a distinctive geological feature 1 km (0.6 mi) north of the Tirumala hills temple, near the Chakra Teertham…"
- **Conflicts/unresolved:** None on identity. Coordinate format is DMS from UNESCO; any DB use would require a schema-approved conversion step — moot while held out.
- **Recommended status:** **verified** for name + existence + coarse location (two high-authority sources, fetched). Coordinates: source-supported by UNESCO (recorded above; still held out for DB).
- **NOT verified:** street address, hours, fees.

## 8. Talakona Waterfall

- **Canonical name (per best source):** "Talakona Waterfall" — district heading "Talakona Waterfall, Yerravaripalem".
- **Place type:** waterfall (in Sri Venkateswara National Park).
- **Locality/area:** Yerravaripalem / Sri Venkateswara National Park, Tirupati District — per the official district page heading and body.
- **Sources:**
  1. https://tirupati.ap.gov.in/forest-tourism (Tirupati District, Government of Andhra Pradesh) — fetched 2026-10-18. Supports: name, locality, national-park setting, height claim, nearby temple.
- **Verbatim quotes:**
  - Heading: "Talakona Waterfall, Yerravaripalem".
  - Body: "The Talakona waterfall is in Sri Venkateswara National Park, Tirupati District of Andhra pradesh in India. With a 270 feet-fall, Talakona is the highest waterfall in the Andhra pradesh state. Talakona is also known for the Lord Siddheswara Swamy Temple, which is located close to the waterfall."
- **Conflicts/unresolved:** None on identity/locality from the fetched official source. (Search-result titles from travel portals place it in "Tirupati, Chittoor District" — Chittoor is the pre-reorganization district name; the current official district page says Tirupati District. No conflict to resolve for this task; Chittoor vs Tirupati district naming is a reorganization artifact, not an identity conflict.)
- **Recommended status:** **verified** for name + locality/setting (official district page, fetched).
- **NOT verified:** coordinates, access road details, hours, fees, seasonal water flow.

## 9. Chandragiri Fort

- **Canonical name (per best source):** "Chandragiri Fort" (Incredible India title "Explore the Historic Chandragiri Fort in Tirupati"); district page heading "Vijayanagar Empire (Chandragiri Fort), Chandragiri". Tripadvisor brand "Chandragiri Palaces and Fort" was search-only and NOT adopted.
- **Place type:** fort (with Raja Mahal palace/archaeological museum).
- **Locality/area:** Chandragiri, Tirupati district — per both official pages ("Fort in Tirupati"; heading "…, Chandragiri").
- **Sources:**
  1. https://www.incredibleindia.gov.in/en/andhra-pradesh/tirupati/chandragiri-fort (Ministry of Tourism, Government of India) — fetched 2026-10-18. Supports: name, Tirupati association, construction-century claim, Raja/Rani Mahal + museum description.
  2. https://tirupati.ap.gov.in/religious-tourism — fetched 2026-10-18. Supports: name, Vijayanagara-capital history, "The Raja Mahal Palace is now an archaeological museum."
- **Verbatim quotes:**
  - Incredible India (meta description): "Explore the majestic Chandragiri Fort in Tirupati, India. Built in the 11th century, this impressive fort has a rich history and breathtaking views."
  - Incredible India (body): "you'll discover the well-preserved Raja Mahal and Rani Mahal … Raja Mahal stands tall with its three-storeyed grandeur, now home to a mesmerising museum…"
  - District: "Chandragiri was the 4th capital of Vijayanagara Empire, Rayas shifted their capital to here when the Golconda sultans attacked Penukonda. … The Raja Mahal Palace is now an archaeological museum."
- **Conflicts/unresolved:** Construction date — Incredible India says "Built in the 11th century"; the district page gives Vijayanagara-period (14th–17th c.) rule history without a construction date. Recorded as a source disagreement; no date field should be stored without resolving this.
- **Recommended status:** **verified** for name + existence + Chandragiri/Tirupati locality (two official government sources, fetched). Century/date claim: conflicting → treat as partially_verified.
- **NOT verified:** address, coordinates, hours, ticket fees, light-show schedule.

## 10. Sri Venkateswara Zoological Park, Tirupati

- **Canonical name (per best source):** "Sri Venkateswara Zoological Park" — identical on the district page and the zoo's own site (site title "Sri Venkateswara Zoological Park Tirupati").
- **Place type:** zoo.
- **Locality/area:** Tirupati, Andhra Pradesh — "a zoo in Tirupati, Andhra Pradesh" (district page). No street/locality granularity from fetched sources.
- **Sources:**
  1. https://tirupati.ap.gov.in/forest-tourism — fetched 2026-10-18. Supports: name, "zoo in Tirupati", establishment date, AP Forest Department management, pointer to official website.
  2. https://tirupatizoo.com/ (the zoo's own official website, linked from the district page) — fetched 2026-10-18. Supports: name, official web presence.
- **Verbatim quotes:**
  - District: "Sri Venkateswara Zoological Park is a zoo in Tirupati, Andhra Pradesh. … Sri Venkateswara Zoological Park was started on 29 September 1987 and is one of the three zoological parks managed by the Andhra Pradesh Forest Department. Website Link: https://tirupatizoo.com/"
  - tirupatizoo.com: page `<title>` = "Sri Venkateswara Zoological Park Tirupati"; og:site_name = "SV ZOO - Tirupati Zoo".
- **Conflicts/unresolved:** The district page claims "reputed to be the second largest zoo in the Asian continent" and species counts — these are unverified portal-style claims on an otherwise official page; do NOT store. Zoo homepage fetched did not expose an address block.
- **Recommended status:** **verified** for name + existence + Tirupati locality (official district page + zoo's own site, fetched).
- **NOT verified:** street address/locality beyond "Tirupati", coordinates, hours, fees.

---

## Candidate substitutions

None needed — all 10 task-listed candidates were independently verified by at least one fetched official-or-equivalent page. No attraction was dropped and no substitute was required.

## Evidence inventory (raw CLI outputs, this directory)

Searches (8):
- search-sri-venkateswara-swamy-temple-tirumala-ttd-official.json
- search-sri-padmavathi-ammavari-temple-tiruchanoor-official.json
- search-iskcon-tirupati-official.json
- search-silathoranam-tirumala-natural-arch.json
- search-talakona-waterfall-ap-tourism.json
- search-chandragiri-fort-official.json
- search-tirupati-district-gov-chandragiri.json
- search-incredible-india-chandragiri-fort.json

Page fetches (11):
- page-tirumala-org-home.json
- page-tirumala-org-temple-history.json
- page-tirumala-org-places-to-see-around-tirumala.json
- page-tirumala-org-pat-at-thiruchanoor-sevas.json
- page-ttdevasthanams-aptmp-temples.json
- page-iskcontirupati-info-about.json
- page-unesco-tentative-natural-heritage-tirumala-hills.json
- page-tirupati-ap-gov-in-forest-tourism.json
- page-tirupati-ap-gov-in-religious-tourism.json
- page-incredible-india-chandragiri-fort.json
- page-tirupatizoo-com-home.json

## Failures / rate limits

- None. 8/8 searches and 11/11 page reads returned content on first attempt (sequential execution, ~3 s spacing).

## Explicitly NOT verified anywhere in this research

- Street-level addresses (except the ISKCON footer address line, quoted from the attraction's own site) and pinpoint coordinates (except the UNESCO-published DMS line for the Natural Arch, recorded verbatim above).
- Opening/closing hours and darshan schedules (only the TTD portal's displayed "Closes HH:MM PM IST" strings on 2026-10-18 were observed; not documented schedules).
- Entry fees, ticket prices, donation amounts — nothing recorded.
- Ratings, review counts, and any tripadvisor/makemytrip-style metrics — deliberately excluded (NOT-FOR-DB); no travel-portal page was fetched.
- Photos, contact phone numbers, official emails.
