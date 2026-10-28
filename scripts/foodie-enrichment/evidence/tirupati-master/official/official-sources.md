# TIR-3c — OFFICIAL Source Pages Sweep (Tirupati/Tirumala)

- Access date: 2026-10-26 (UTC)
- Fetch command pattern: `curl -sSL -A "FOODIE-Research/1.0 (place-discovery-audit)" -o <file> <url>`
- Evidence dir: `scripts/foodie-enrichment/evidence/tirupati-master/official/`
- Honesty contract: only what was actually fetched is recorded. Verbatim quotes are cut from the saved pages' own text (tags stripped, entities unescaped, whitespace collapsed — wording untouched). Nothing substituted from memory.

## Fetch summary

| # | URL | HTTP | Bytes | Saved as |
|---|-----|------|-------|----------|
| 1 | https://www.tirumala.org/PlacesToVisit.aspx | 200 | 56815 | places-to-visit.html |
| 2 | https://www.tirumala.org/TemplesAtTirupathi.aspx | 200 | 75393 | temples-at-tirupati.html |
| 3 | https://www.tirumala.org/ | 200 | 217085 | home.html |
| 4 | https://www.tirumala.org/Places%20to%20see%20around%20Tirumala.aspx | 200 | 54108 | places-around-tirumala.html |
| 5 | https://www.tirumala.org/AccommodationAtTirumala.aspx | 200 | 57021 | accommodation-tirumala.html |
| 6 | https://www.tirumala.org/AccommodationAtTirupati.aspx | 200 | 67878 | accommodation-tirupati.html |
| 7 | https://www.tirumala.org/TemplesAtTiruchanoor.aspx | 200 | 75302 | temples-at-tiruchanoor.html |
| 8 | https://www.incredibleindia.gov.in/en/andhra-pradesh/tirupati | 200 | 592196 | incredibleindia-tirupati.html |
| 9 | https://www.tirumala.org/PlacesatTirumala.aspx | 200 | 61784 | ttd-PlacesatTirumala.html |
| 10 | https://www.tirumala.org/S.V. Museum.aspx | 200 | 69029 | ttd-S.V.-Museum.html |
| 11 | https://www.tirumala.org/RestHousesInTirumala.aspx | 200 | 76257 | ttd-RestHousesInTirumala.html |
| 12 | https://www.tirumala.org/ttdklmps.aspx | 200 | 113640 | ttd-ttdklmps.html |
| 13 | https://www.tirumala.org/MoreTemples.aspx | 200 | 149703 | ttd-MoreTemples.html |
| 14 | https://www.tirumala.org/KalyanaKatta.aspx | 200 | 60092 | ttd-KalyanaKatta.html |
| 15 | https://www.tirumala.org/PackageTours.aspx | 200 | 57022 | ttd-PackageTours.html |
| 16 | https://www.tirumala.org/TirumalatoTirupathiOnFoot.aspx | 200 | 56585 | ttd-TirumalatoTirupathiOnFoot.html |
| 17 | https://www.tirumala.org/MoreLinks.aspx | 200 | 61728 | ttd-MoreLinks.html |
| 18 | https://www.incredibleindia.gov.in/en/andhra-pradesh/tirupati/sri-venkateswara-swamy-vaari-temple | 200 | 460135 | incredibleindia-sv-temple.html |
| 19 | https://tirupati.ap.gov.in/ | 000 (connection failed) | 0 | (not saved — connection failed) |
| 20 | https://tourism.ap.gov.in/ | 000 (connection failed) | 0 | (not saved — connection failed) |

Extraction totals (place/temple/accommodation names): `places-to-visit.html`=10, `temples-at-tirupati.html`=24, `home.html`=11, `places-around-tirumala.html`=24, `accommodation-tirumala.html`=6, `accommodation-tirupati.html`=7, `temples-at-tiruchanoor.html`=6, `incredibleindia-tirupati.html`=15, `ttd-PlacesatTirumala.html`=6, `ttd-S.V.-Museum.html`=2, `ttd-RestHousesInTirumala.html`=34, `ttd-ttdklmps.html`=2, `ttd-MoreTemples.html`=15, `ttd-KalyanaKatta.html`=6, `ttd-PackageTours.html`=13, `ttd-TirumalatoTirupathiOnFoot.html`=3, `ttd-MoreLinks.html`=0, `incredibleindia-sv-temple.html`=1, `(not saved — connection failed)`=0, `(not saved — connection failed)`=0

## https://www.tirumala.org/PlacesToVisit.aspx

- HTTP status: **200** | bytes: 56815 | saved: `places-to-visit.html` | accessed: 2026-10-26
- TTD official hub page 'Places to Visit'. Left-nav temple directory + section link to PlacesatTirumala.aspx.

- Extracted **10** names:

### Places in and around Tirumala
- href/detail: https://www.tirumala.org/PlacesatTirumala.aspx
- verbatim: > pilgrims, there is a wide choice of places to visit. Places in and around Tirumala Other Temples Places in and around Tirupati Package Tours Other Links : Festivals Advance Booking
### Sri Bhu Varaha Swamy Temple
- href/detail: left-nav heading 'At Tirumala' (no own href on this page; block links: https://www.tirumala.org/Varaha_TempleLegend.aspx)
- verbatim: > Kalyanam How to Reach Tirumala Places to Visit Around Tirumala Sri Bhu Varaha Swamy Temple Temple Legend Sri Bedi Anjaneya Swamy Temple Temple Legend At Tiruchanoor Sri Padmavathi Ammavari Temple
### Sri Bedi Anjaneya Swamy Temple
- href/detail: left-nav heading 'At Tirumala' (no own href on this page; block links: https://www.tirumala.org/Anjaneya_TempleLegend.aspx)
- verbatim: > Visit Around Tirumala Sri Bhu Varaha Swamy Temple Temple Legend Sri Bedi Anjaneya Swamy Temple Temple Legend At Tiruchanoor Sri Padmavathi Ammavari Temple Temple Legend Arjitha Sevas More Temples At
### Sri Padmavathi Ammavari Temple
- href/detail: left-nav heading 'At Tiruchanoor' (no own href on this page; block links: https://www.tirumala.org/TemplesAtTiruchanoor.aspx)
- verbatim: > Legend Sri Bedi Anjaneya Swamy Temple Temple Legend At Tiruchanoor Sri Padmavathi Ammavari Temple Temple Legend Arjitha Sevas More Temples At Tirupathi Sri Govindarajaswami Temple Srivari Padalamandapam Temple Sri Lakshmi
### Sri Govindarajaswami Temple
- href/detail: https://www.tirumala.org/TemplesAtTirupathi.aspx#id1
- verbatim: > Ammavari Temple Temple Legend Arjitha Sevas More Temples At Tirupathi Sri Govindarajaswami Temple Srivari Padalamandapam Temple Sri Lakshmi Narayana Swamy Temple Sri Vinayaka Swamy Temple Sri Kapliswaraswamy Temple Sri Kodandarama
### Srivari Padalamandapam Temple
- href/detail: https://www.tirumala.org/TemplesAtTirupathi.aspx#id2
- verbatim: > Legend Arjitha Sevas More Temples At Tirupathi Sri Govindarajaswami Temple Srivari Padalamandapam Temple Sri Lakshmi Narayana Swamy Temple Sri Vinayaka Swamy Temple Sri Kapliswaraswamy Temple Sri Kodandarama Swamy Temple more..
### Sri Lakshmi Narayana Swamy Temple
- href/detail: https://www.tirumala.org/TemplesAtTirupathi.aspx#id3
- verbatim: > More Temples At Tirupathi Sri Govindarajaswami Temple Srivari Padalamandapam Temple Sri Lakshmi Narayana Swamy Temple Sri Vinayaka Swamy Temple Sri Kapliswaraswamy Temple Sri Kodandarama Swamy Temple more.. Piligrim Services Darshan
### Sri Vinayaka Swamy Temple
- href/detail: https://www.tirumala.org/TemplesAtTirupathi.aspx#id4
- verbatim: > Govindarajaswami Temple Srivari Padalamandapam Temple Sri Lakshmi Narayana Swamy Temple Sri Vinayaka Swamy Temple Sri Kapliswaraswamy Temple Sri Kodandarama Swamy Temple more.. Piligrim Services Darshan Sarvadarshan Special Entry Darshan Divya
### Sri Kapliswaraswamy Temple
- href/detail: https://www.tirumala.org/TemplesAtTirupathi.aspx#id5
- verbatim: > Temple Sri Lakshmi Narayana Swamy Temple Sri Vinayaka Swamy Temple Sri Kapliswaraswamy Temple Sri Kodandarama Swamy Temple more.. Piligrim Services Darshan Sarvadarshan Special Entry Darshan Divya Darshan (for pedestrians) Special
### Sri Kodandarama Swamy Temple
- href/detail: https://www.tirumala.org/TemplesAtTirupathi.aspx#id6
- verbatim: > Narayana Swamy Temple Sri Vinayaka Swamy Temple Sri Kapliswaraswamy Temple Sri Kodandarama Swamy Temple more.. Piligrim Services Darshan Sarvadarshan Special Entry Darshan Divya Darshan (for pedestrians) Special Darshan for Physically

## https://www.tirumala.org/TemplesAtTirupathi.aspx

- HTTP status: **200** | bytes: 75393 | saved: `temples-at-tirupati.html` | accessed: 2026-10-26
- TTD official page: 6 main TTD-managed Tirupati temples (anchors id1-id6) + 16-18 numbered sub-temples in the Govindarajaswami premises.

- Extracted **24** names:

### Sri Govindarajaswami Temple
- href/detail: https://www.tirumala.org/TemplesAtTirupathi.aspx#id1..id6 main sections
- verbatim: > Ammavari Temple Temple Legend Arjitha Sevas More Temples At Tirupathi Sri Govindarajaswami Temple Srivari Padalamandapam Temple Sri Lakshmi Narayana Swamy Temple Sri Vinayaka Swamy Temple Sri Kapliswaraswamy Temple Sri Kodandarama
### Srivari Padala Mandapam, Alipiri
- href/detail: https://www.tirumala.org/TemplesAtTirupathi.aspx#id1..id6 main sections
- verbatim: > 5/- per head 7. Quick Dharshan Rs 20/- per head SRIVARI PADALA MANDAPAM, ALIPIRI The Srivari Padalamandapam temple located at Alipiri-the Gate Way to Tirumala temple, is under administrative control
### Sri Lakshmi Narayana Swamy Temple
- href/detail: https://www.tirumala.org/TemplesAtTirupathi.aspx#id1..id6 main sections
- verbatim: > More Temples At Tirupathi Sri Govindarajaswami Temple Srivari Padalamandapam Temple Sri Lakshmi Narayana Swamy Temple Sri Vinayaka Swamy Temple Sri Kapliswaraswamy Temple Sri Kodandarama Swamy Temple more.. Piligrim Services Darshan
### Sri Vinayaka Swamy Temple, 2nd Ghat Road
- href/detail: https://www.tirumala.org/TemplesAtTirupathi.aspx#id1..id6 main sections
- verbatim: > - 7.30 PM to 8.00 PM – Rs.10.00 per head SRI VINAYAKA SWAMY TEMPLE, 2nd GHAT ROAD This is also a sub-temple of Srivari Padalamandapam, Alipiri. And pilgirms who reach
### Sri Kapileswara Swamy Temple
- href/detail: https://www.tirumala.org/TemplesAtTirupathi.aspx#id1..id6 main sections
- verbatim: > 6.00 AM to 7.00 PM – Rs. 50.00 per one SRI KAPILESWARA SWAMY TEMPLE History of Sri Kapileswara Swamy Temple According to mythology, this temple derived its name from Maharshi
### Sri Kodanda Ramaswamy Temple
- href/detail: https://www.tirumala.org/TemplesAtTirupathi.aspx#id1..id6 main sections
- verbatim: > You can book for Seva well in advance through ttdevasthanams.ap.gov.in SRI KODANDA RAMASWAMY TEMPLE Sri Kodandarama Swamy Temple is one of the local temples situated in heart of Tirupati city
### Sri Partha Sarathi Swamy Temple
- href/detail: https://www.tirumala.org/TemplesAtTirupathi.aspx — numbered sub-temple list inside Sri Govindarajaswami Temple premises (no individual href)
- verbatim: > can book for Seva well in advance through ttdevasthanams.ap.gov.in 01. Sri Partha Sarathi Swamy Temple. 02 Sri Kalyana Venkateswara Swamy Temple. 03 Sri Choodikudutha Nachiyar Ammavari Temple(SriAndal) 04. Sri Salai
### Sri Kalyana Venkateswara Swamy Temple
- href/detail: https://www.tirumala.org/TemplesAtTirupathi.aspx — numbered sub-temple list inside Sri Govindarajaswami Temple premises (no individual href)
- verbatim: > advance through ttdevasthanams.ap.gov.in 01. Sri Partha Sarathi Swamy Temple. 02 Sri Kalyana Venkateswara Swamy Temple. 03 Sri Choodikudutha Nachiyar Ammavari Temple(SriAndal) 04. Sri Salai Nachiyar Ammavari Temple(Sri Pundarikavalli Temple) 05.
### Sri Choodikudutha Nachiyar Ammavari Temple(SriAndal)
- href/detail: https://www.tirumala.org/TemplesAtTirupathi.aspx — numbered sub-temple list inside Sri Govindarajaswami Temple premises (no individual href)
- verbatim: > Sarathi Swamy Temple. 02 Sri Kalyana Venkateswara Swamy Temple. 03 Sri Choodikudutha Nachiyar Ammavari Temple(SriAndal) 04. Sri Salai Nachiyar Ammavari Temple(Sri Pundarikavalli Temple) 05. Sri Bhasyakarla vari Temple 06. Sri
### Sri Salai Nachiyar Ammavari Temple(Sri Pundarikavalli Temple)
- href/detail: https://www.tirumala.org/TemplesAtTirupathi.aspx — numbered sub-temple list inside Sri Govindarajaswami Temple premises (no individual href)
- verbatim: > Venkateswara Swamy Temple. 03 Sri Choodikudutha Nachiyar Ammavari Temple(SriAndal) 04. Sri Salai Nachiyar Ammavari Temple(Sri Pundarikavalli Temple) 05. Sri Bhasyakarla vari Temple 06. Sri Anajaneya swamy Temple near(opposite) Dwajasthambham 07.
### Sri Bhasyakarla vari Temple
- href/detail: https://www.tirumala.org/TemplesAtTirupathi.aspx — numbered sub-temple list inside Sri Govindarajaswami Temple premises (no individual href)
- verbatim: > Temple(SriAndal) 04. Sri Salai Nachiyar Ammavari Temple(Sri Pundarikavalli Temple) 05. Sri Bhasyakarla vari Temple 06. Sri Anajaneya swamy Temple near(opposite) Dwajasthambham 07. Sri Thirumangai Alwar Temple 08. Sri Kurath Alwar
### Sri Anajaneya swamy Temple near(opposite) Dwajasthambham
- href/detail: https://www.tirumala.org/TemplesAtTirupathi.aspx — numbered sub-temple list inside Sri Govindarajaswami Temple premises (no individual href)
- verbatim: > Ammavari Temple(Sri Pundarikavalli Temple) 05. Sri Bhasyakarla vari Temple 06. Sri Anajaneya swamy Temple near(opposite) Dwajasthambham 07. Sri Thirumangai Alwar Temple 08. Sri Kurath Alwar Temple 09. Sri Madhurakavi and
### Sri Thirumangai Alwar Temple
- href/detail: https://www.tirumala.org/TemplesAtTirupathi.aspx — numbered sub-temple list inside Sri Govindarajaswami Temple premises (no individual href)
- verbatim: > vari Temple 06. Sri Anajaneya swamy Temple near(opposite) Dwajasthambham 07. Sri Thirumangai Alwar Temple 08. Sri Kurath Alwar Temple 09. Sri Madhurakavi and Ananda Alwar Temple 10. Sri Chakrathalwar Temple
### Sri Kurath Alwar Temple
- href/detail: https://www.tirumala.org/TemplesAtTirupathi.aspx — numbered sub-temple list inside Sri Govindarajaswami Temple premises (no individual href)
- verbatim: > swamy Temple near(opposite) Dwajasthambham 07. Sri Thirumangai Alwar Temple 08. Sri Kurath Alwar Temple 09. Sri Madhurakavi and Ananda Alwar Temple 10. Sri Chakrathalwar Temple 11. Sri Mudal Alwar Temple
### Sri Madhurakavi and Ananda Alwar Temple
- href/detail: https://www.tirumala.org/TemplesAtTirupathi.aspx — numbered sub-temple list inside Sri Govindarajaswami Temple premises (no individual href)
- verbatim: > Sri Thirumangai Alwar Temple 08. Sri Kurath Alwar Temple 09. Sri Madhurakavi and Ananda Alwar Temple 10. Sri Chakrathalwar Temple 11. Sri Mudal Alwar Temple 12. Sri Manavala Mahamuni Temple
### Sri Chakrathalwar Temple
- href/detail: https://www.tirumala.org/TemplesAtTirupathi.aspx — numbered sub-temple list inside Sri Govindarajaswami Temple premises (no individual href)
- verbatim: > Alwar Temple 09. Sri Madhurakavi and Ananda Alwar Temple 10. Sri Chakrathalwar Temple 11. Sri Mudal Alwar Temple 12. Sri Manavala Mahamuni Temple 13. Sri Vedantha Desikar Temple 14. Sri
### Sri Mudal Alwar Temple
- href/detail: https://www.tirumala.org/TemplesAtTirupathi.aspx — numbered sub-temple list inside Sri Govindarajaswami Temple premises (no individual href)
- verbatim: > Madhurakavi and Ananda Alwar Temple 10. Sri Chakrathalwar Temple 11. Sri Mudal Alwar Temple 12. Sri Manavala Mahamuni Temple 13. Sri Vedantha Desikar Temple 14. Sri Anjaneya Swamy Vari Temple
### Sri Manavala Mahamuni Temple
- href/detail: https://www.tirumala.org/TemplesAtTirupathi.aspx — numbered sub-temple list inside Sri Govindarajaswami Temple premises (no individual href)
- verbatim: > 10. Sri Chakrathalwar Temple 11. Sri Mudal Alwar Temple 12. Sri Manavala Mahamuni Temple 13. Sri Vedantha Desikar Temple 14. Sri Anjaneya Swamy Vari Temple 15. Sri Nammalwar Temple 16.
### Sri Vedantha Desikar Temple
- href/detail: https://www.tirumala.org/TemplesAtTirupathi.aspx — numbered sub-temple list inside Sri Govindarajaswami Temple premises (no individual href)
- verbatim: > Sri Mudal Alwar Temple 12. Sri Manavala Mahamuni Temple 13. Sri Vedantha Desikar Temple 14. Sri Anjaneya Swamy Vari Temple 15. Sri Nammalwar Temple 16. Sri Sanjeevaraya swamy Temple( Mattam
### Sri Anjaneya Swamy Vari Temple
- href/detail: https://www.tirumala.org/TemplesAtTirupathi.aspx — numbered sub-temple list inside Sri Govindarajaswami Temple premises (no individual href)
- verbatim: > Sri Manavala Mahamuni Temple 13. Sri Vedantha Desikar Temple 14. Sri Anjaneya Swamy Vari Temple 15. Sri Nammalwar Temple 16. Sri Sanjeevaraya swamy Temple( Mattam Anjaneya Swamy Temple) 17. Sri
### Sri Nammalwar Temple
- href/detail: https://www.tirumala.org/TemplesAtTirupathi.aspx — numbered sub-temple list inside Sri Govindarajaswami Temple premises (no individual href)
- verbatim: > Vedantha Desikar Temple 14. Sri Anjaneya Swamy Vari Temple 15. Sri Nammalwar Temple 16. Sri Sanjeevaraya swamy Temple( Mattam Anjaneya Swamy Temple) 17. Sri Tirumala Nambi Sannidhi 18. Sri Lakshmi
### Sri Sanjeevaraya swamy Temple( Mattam Anjaneya Swamy Temple)
- href/detail: https://www.tirumala.org/TemplesAtTirupathi.aspx — numbered sub-temple list inside Sri Govindarajaswami Temple premises (no individual href)
- verbatim: > Sri Anjaneya Swamy Vari Temple 15. Sri Nammalwar Temple 16. Sri Sanjeevaraya swamy Temple( Mattam Anjaneya Swamy Temple) 17. Sri Tirumala Nambi Sannidhi 18. Sri Lakshmi Narayana Swamy Temple, G.S.
### Sri Tirumala Nambi Sannidhi
- href/detail: https://www.tirumala.org/TemplesAtTirupathi.aspx — numbered sub-temple list inside Sri Govindarajaswami Temple premises (no individual href)
- verbatim: > 16. Sri Sanjeevaraya swamy Temple( Mattam Anjaneya Swamy Temple) 17. Sri Tirumala Nambi Sannidhi 18. Sri Lakshmi Narayana Swamy Temple, G.S. Mada Street, Tirupati(taken over temple) Temple Legend When South
### Sri Lakshmi Narayana Swamy Temple, G.S. Mada Street, Tirupati(taken over temple)
- href/detail: https://www.tirumala.org/TemplesAtTirupathi.aspx — numbered sub-temple list inside Sri Govindarajaswami Temple premises (no individual href)
- verbatim: > Mattam Anjaneya Swamy Temple) 17. Sri Tirumala Nambi Sannidhi 18. Sri Lakshmi Narayana Swamy Temple, G.S. Mada Street, Tirupati(taken over temple) Temple Legend When South India was invaded by Muslim

## https://www.tirumala.org/

- HTTP status: **200** | bytes: 217085 | saved: `home.html` | accessed: 2026-10-26
- TTD homepage: fetched for nav discovery. Body is news/announcements; value = nav links to other official place/temple/accommodation pages. Nav labels quoted; 'name' here = nav label, not a place claim.

- Extracted **11** names:

### Places to Visit
- href/detail: https://www.tirumala.org/PlacesToVisit.aspx
- verbatim: > How to Reach Tirumala Places to Visit Around Tirumala Sri Bhu Varaha Swamy Temple
### Places to Visit Around Tirumala
- href/detail: https://www.tirumala.org/Places to see around Tirumala.aspx
- verbatim: > How to Reach Tirumala Places to Visit Around Tirumala Sri Bhu Varaha Swamy Temple
### Sri Govindarajaswami Temple
- href/detail: https://www.tirumala.org/TemplesAtTirupathi.aspx
- verbatim: > More Temples At Tirupathi Sri Govindarajaswami Temple Srivari Padalamandapam Temple Sri Lakshmi Narayana Swamy
### More Temples
- href/detail: https://www.tirumala.org/TemplesAtTiruchanoor.aspx
- verbatim: > Temple Legend Arjitha Sevas More Temples At Tirupathi Sri Govindarajaswami Temple Srivari Padalamandapam Temple
### more..
- href/detail: https://www.tirumala.org/MoreTemples.aspx
- verbatim: > Sri Kodandarama Swamy Temple more.. Piligrim Services Darshan Sarvadarshan Special Entry Darshan Divya Darshan
### Accommodation
- href/detail: https://www.tirumala.org/AccommodationAtTirumala.aspx
- verbatim: > Annual or Periodical Sevas Accommodation at Tirumala Accommodation Advance Reservation Current Booking Rest Houses
### Accommodation
- href/detail: https://www.tirumala.org/AccommodationAtTirupati.aspx
- verbatim: > Annual or Periodical Sevas Accommodation at Tirumala Accommodation Advance Reservation Current Booking Rest Houses
### Rest Houses
- href/detail: https://www.tirumala.org/RestHousesInTirumala.aspx
- verbatim: > Advance Reservation Current Booking Rest Houses Accommodation at Tirupati Accommodation Transport To Reach Tirupati
### TTD Kalyana Mandapams
- href/detail: https://www.tirumala.org/ttdklmps.aspx
- verbatim: > Books SVETA Voluntary Services TTD Kalyana Mandapams HMV Active Tenders Archives Information : Home
### Package Tours
- href/detail: https://www.tirumala.org/PackageTours.aspx
- verbatim: > Return Journey From Tirumala Package Tours Railway Booking Office Automobile Clinic Others Anna Prasadam
### S.V. Museum
- href/detail: https://www.tirumala.org/S.V. Museum.aspx
- verbatim: > Venkateswara Bhakthi Channel Brahmotsavams S.V. Museum TTD Management Administration TTD Trust Board Board Resolutions

## https://www.tirumala.org/Places%20to%20see%20around%20Tirumala.aspx

- HTTP status: **200** | bytes: 54108 | saved: `places-around-tirumala.html` | accessed: 2026-10-26
- TTD official 'Places To Visit Around Tirumala': 13 must-visit places + 11 named teerthams, both as prose lists (no per-place links).

- Extracted **24** names:

### Swami Pushkarini
- href/detail: prose list on page (no individual href); page: https://www.tirumala.org/Places%20to%20see%20around%20Tirumala.aspx
- verbatim: > hills. Some of the must visit places in Tirumala are Swami Pushkarini, Sri Bhu Varaha Swamy temple, Sri Hathiramjee Mutt, Sri Bedi Anjaneya Swamy temple, Srivari Sikhara Darshanam, Sila Thoranam,
### Sri Bhu Varaha Swamy temple
- href/detail: prose list on page (no individual href); page: https://www.tirumala.org/Places%20to%20see%20around%20Tirumala.aspx
- verbatim: > Kalyanam How to Reach Tirumala Places to Visit Around Tirumala Sri Bhu Varaha Swamy Temple Temple Legend Sri Bedi Anjaneya Swamy Temple Temple Legend At Tiruchanoor Sri Padmavathi Ammavari Temple
### Sri Hathiramjee Mutt
- href/detail: prose list on page (no individual href); page: https://www.tirumala.org/Places%20to%20see%20around%20Tirumala.aspx
- verbatim: > in Tirumala are Swami Pushkarini, Sri Bhu Varaha Swamy temple, Sri Hathiramjee Mutt, Sri Bedi Anjaneya Swamy temple, Srivari Sikhara Darshanam, Sila Thoranam, Dharmagiri, Narayangiri, Papavinasanam, Akasa Ganga water falls,
### Sri Bedi Anjaneya Swamy temple
- href/detail: prose list on page (no individual href); page: https://www.tirumala.org/Places%20to%20see%20around%20Tirumala.aspx
- verbatim: > Visit Around Tirumala Sri Bhu Varaha Swamy Temple Temple Legend Sri Bedi Anjaneya Swamy Temple Temple Legend At Tiruchanoor Sri Padmavathi Ammavari Temple Temple Legend Arjitha Sevas More Temples At
### Srivari Sikhara Darshanam
- href/detail: prose list on page (no individual href); page: https://www.tirumala.org/Places%20to%20see%20around%20Tirumala.aspx
- verbatim: > Swamy temple, Sri Hathiramjee Mutt, Sri Bedi Anjaneya Swamy temple, Srivari Sikhara Darshanam, Sila Thoranam, Dharmagiri, Narayangiri, Papavinasanam, Akasa Ganga water falls, Temple Museum, Asthana Mandapams and Gogarbham Gardens. Theeerthams
### Sila Thoranam
- href/detail: prose list on page (no individual href); page: https://www.tirumala.org/Places%20to%20see%20around%20Tirumala.aspx
- verbatim: > Hathiramjee Mutt, Sri Bedi Anjaneya Swamy temple, Srivari Sikhara Darshanam, Sila Thoranam, Dharmagiri, Narayangiri, Papavinasanam, Akasa Ganga water falls, Temple Museum, Asthana Mandapams and Gogarbham Gardens. Theeerthams There are several
### Dharmagiri
- href/detail: prose list on page (no individual href); page: https://www.tirumala.org/Places%20to%20see%20around%20Tirumala.aspx
- verbatim: > Sri Bedi Anjaneya Swamy temple, Srivari Sikhara Darshanam, Sila Thoranam, Dharmagiri, Narayangiri, Papavinasanam, Akasa Ganga water falls, Temple Museum, Asthana Mandapams and Gogarbham Gardens. Theeerthams There are several teerthams in
### Narayangiri
- href/detail: prose list on page (no individual href); page: https://www.tirumala.org/Places%20to%20see%20around%20Tirumala.aspx
- verbatim: > Bedi Anjaneya Swamy temple, Srivari Sikhara Darshanam, Sila Thoranam, Dharmagiri, Narayangiri, Papavinasanam, Akasa Ganga water falls, Temple Museum, Asthana Mandapams and Gogarbham Gardens. Theeerthams There are several teerthams in Tirumala,
### Papavinasanam
- href/detail: prose list on page (no individual href); page: https://www.tirumala.org/Places%20to%20see%20around%20Tirumala.aspx
- verbatim: > Anjaneya Swamy temple, Srivari Sikhara Darshanam, Sila Thoranam, Dharmagiri, Narayangiri, Papavinasanam, Akasa Ganga water falls, Temple Museum, Asthana Mandapams and Gogarbham Gardens. Theeerthams There are several teerthams in Tirumala, some
### Akasa Ganga water falls
- href/detail: prose list on page (no individual href); page: https://www.tirumala.org/Places%20to%20see%20around%20Tirumala.aspx
- verbatim: > Swamy temple, Srivari Sikhara Darshanam, Sila Thoranam, Dharmagiri, Narayangiri, Papavinasanam, Akasa Ganga water falls, Temple Museum, Asthana Mandapams and Gogarbham Gardens. Theeerthams There are several teerthams in Tirumala, some of
### Temple Museum
- href/detail: prose list on page (no individual href); page: https://www.tirumala.org/Places%20to%20see%20around%20Tirumala.aspx
- verbatim: > Darshanam, Sila Thoranam, Dharmagiri, Narayangiri, Papavinasanam, Akasa Ganga water falls, Temple Museum, Asthana Mandapams and Gogarbham Gardens. Theeerthams There are several teerthams in Tirumala, some of them are Pandava Teertham,
### Asthana Mandapams
- href/detail: prose list on page (no individual href); page: https://www.tirumala.org/Places%20to%20see%20around%20Tirumala.aspx
- verbatim: > Thoranam, Dharmagiri, Narayangiri, Papavinasanam, Akasa Ganga water falls, Temple Museum, Asthana Mandapams and Gogarbham Gardens. Theeerthams There are several teerthams in Tirumala, some of them are Pandava Teertham, Kumaradhara Teertham,
### Gogarbham Gardens
- href/detail: prose list on page (no individual href); page: https://www.tirumala.org/Places%20to%20see%20around%20Tirumala.aspx
- verbatim: > Papavinasanam, Akasa Ganga water falls, Temple Museum, Asthana Mandapams and Gogarbham Gardens. Theeerthams There are several teerthams in Tirumala, some of them are Pandava Teertham, Kumaradhara Teertham, Tumbhuru Teertham, Ramakrishna
### Pandava Teertham
- href/detail: prose list on page (no individual href); page: https://www.tirumala.org/Places%20to%20see%20around%20Tirumala.aspx
- verbatim: > There are several teerthams in Tirumala, some of them are Pandava Teertham, Kumaradhara Teertham, Tumbhuru Teertham, Ramakrishna Teertham, Chakra Teertham, Vaikuntha Teertham, Sesha Teertham, Sitamma Teertham, Pasupu Teertham, Jupali Teertham,
### Kumaradhara Teertham
- href/detail: prose list on page (no individual href); page: https://www.tirumala.org/Places%20to%20see%20around%20Tirumala.aspx
- verbatim: > several teerthams in Tirumala, some of them are Pandava Teertham, Kumaradhara Teertham, Tumbhuru Teertham, Ramakrishna Teertham, Chakra Teertham, Vaikuntha Teertham, Sesha Teertham, Sitamma Teertham, Pasupu Teertham, Jupali Teertham, Sanaka Sanandana
### Tumbhuru Teertham
- href/detail: prose list on page (no individual href); page: https://www.tirumala.org/Places%20to%20see%20around%20Tirumala.aspx
- verbatim: > in Tirumala, some of them are Pandava Teertham, Kumaradhara Teertham, Tumbhuru Teertham, Ramakrishna Teertham, Chakra Teertham, Vaikuntha Teertham, Sesha Teertham, Sitamma Teertham, Pasupu Teertham, Jupali Teertham, Sanaka Sanandana Teertham. Important
### Ramakrishna Teertham
- href/detail: prose list on page (no individual href); page: https://www.tirumala.org/Places%20to%20see%20around%20Tirumala.aspx
- verbatim: > some of them are Pandava Teertham, Kumaradhara Teertham, Tumbhuru Teertham, Ramakrishna Teertham, Chakra Teertham, Vaikuntha Teertham, Sesha Teertham, Sitamma Teertham, Pasupu Teertham, Jupali Teertham, Sanaka Sanandana Teertham. Important festivals that
### Chakra Teertham
- href/detail: prose list on page (no individual href); page: https://www.tirumala.org/Places%20to%20see%20around%20Tirumala.aspx
- verbatim: > them are Pandava Teertham, Kumaradhara Teertham, Tumbhuru Teertham, Ramakrishna Teertham, Chakra Teertham, Vaikuntha Teertham, Sesha Teertham, Sitamma Teertham, Pasupu Teertham, Jupali Teertham, Sanaka Sanandana Teertham. Important festivals that are held
### Vaikuntha Teertham
- href/detail: prose list on page (no individual href); page: https://www.tirumala.org/Places%20to%20see%20around%20Tirumala.aspx
- verbatim: > Pandava Teertham, Kumaradhara Teertham, Tumbhuru Teertham, Ramakrishna Teertham, Chakra Teertham, Vaikuntha Teertham, Sesha Teertham, Sitamma Teertham, Pasupu Teertham, Jupali Teertham, Sanaka Sanandana Teertham. Important festivals that are held at the
### Sesha Teertham
- href/detail: prose list on page (no individual href); page: https://www.tirumala.org/Places%20to%20see%20around%20Tirumala.aspx
- verbatim: > Kumaradhara Teertham, Tumbhuru Teertham, Ramakrishna Teertham, Chakra Teertham, Vaikuntha Teertham, Sesha Teertham, Sitamma Teertham, Pasupu Teertham, Jupali Teertham, Sanaka Sanandana Teertham. Important festivals that are held at the teerthams are
### Sitamma Teertham
- href/detail: prose list on page (no individual href); page: https://www.tirumala.org/Places%20to%20see%20around%20Tirumala.aspx
- verbatim: > Tumbhuru Teertham, Ramakrishna Teertham, Chakra Teertham, Vaikuntha Teertham, Sesha Teertham, Sitamma Teertham, Pasupu Teertham, Jupali Teertham, Sanaka Sanandana Teertham. Important festivals that are held at the teerthams are -Kumaradhara Magha
### Pasupu Teertham
- href/detail: prose list on page (no individual href); page: https://www.tirumala.org/Places%20to%20see%20around%20Tirumala.aspx
- verbatim: > Ramakrishna Teertham, Chakra Teertham, Vaikuntha Teertham, Sesha Teertham, Sitamma Teertham, Pasupu Teertham, Jupali Teertham, Sanaka Sanandana Teertham. Important festivals that are held at the teerthams are -Kumaradhara Magha Pournami, Ramakrishna
### Jupali Teertham
- href/detail: prose list on page (no individual href); page: https://www.tirumala.org/Places%20to%20see%20around%20Tirumala.aspx
- verbatim: > Chakra Teertham, Vaikuntha Teertham, Sesha Teertham, Sitamma Teertham, Pasupu Teertham, Jupali Teertham, Sanaka Sanandana Teertham. Important festivals that are held at the teerthams are -Kumaradhara Magha Pournami, Ramakrishna Pushya Pournami
### Sanaka Sanandana Teertham
- href/detail: prose list on page (no individual href); page: https://www.tirumala.org/Places%20to%20see%20around%20Tirumala.aspx
- verbatim: > Vaikuntha Teertham, Sesha Teertham, Sitamma Teertham, Pasupu Teertham, Jupali Teertham, Sanaka Sanandana Teertham. Important festivals that are held at the teerthams are -Kumaradhara Magha Pournami, Ramakrishna Pushya Pournami Tumbhuru Phalguna

## https://www.tirumala.org/AccommodationAtTirumala.aspx

- HTTP status: **200** | bytes: 57021 | saved: `accommodation-tirumala.html` | accessed: 2026-10-26
- TTD official accommodation page for Tirumala: 4 named guest-house/cottage AREAS + free choultries & dormitory halls described in prose. No individual named choultry list on this page.

- Extracted **6** names:

### Sri Padmavathi Guest House area - Tirumala
- href/detail: accommodation category area (no individual href)
- verbatim: > 200% after 48 hours, 400% after 72 hours. Categories > Sri Padmavathi Guest House area - Tirumala > Sri Venkateswara Guest House area - Tirumala > Varahaswami Guest House, Rambagicha,
### Sri Venkateswara Guest House area - Tirumala
- href/detail: accommodation category area (no individual href)
- verbatim: > Categories > Sri Padmavathi Guest House area - Tirumala > Sri Venkateswara Guest House area - Tirumala > Varahaswami Guest House, Rambagicha, HUDC, Travellers Bungalows Cottages Area > Marriage Halls
### Varahaswami Guest House, Rambagicha, HUDC, Travellers Bungalows Cottages Area
- href/detail: accommodation category area (no individual href)
- verbatim: > Tirumala > Sri Venkateswara Guest House area - Tirumala > Varahaswami Guest House, Rambagicha, HUDC, Travellers Bungalows Cottages Area > Marriage Halls and Cottages Free There are several large choultries
### Marriage Halls and Cottages
- href/detail: accommodation category area (no individual href)
- verbatim: > Varahaswami Guest House, Rambagicha, HUDC, Travellers Bungalows Cottages Area > Marriage Halls and Cottages Free There are several large choultries with free rooms for families to stay in reasonable comfort.
### Free choultries (category)
- href/detail: accommodation type — prose; contact Central Reception Office, near the bus stand in Tirumala
- verbatim: > Travellers Bungalows Cottages Area > Marriage Halls and Cottages Free There are several large choultries with free rooms for families to stay in reasonable comfort. Electricity and water are provided
### Dormitory Halls (category)
- href/detail: accommodation type — prose (TTD dormitory halls)
- verbatim: > the bus stand in Tirumala. Pilgrims can also rest in Dormitory Halls provided by TTD. Other Links : Festivals Advance Booking e-Darshan Counters CDs Video Cassettes SriVenkateshwara Recording Project Alwar

## https://www.tirumala.org/AccommodationAtTirupati.aspx

- HTTP status: **200** | bytes: 67878 | saved: `accommodation-tirupati.html` | accessed: 2026-10-26
- TTD official accommodation page for Tirupati: 7 named choultries/guest houses with contact + rates (Rs.50-1300) in the page tables.

- Extracted **7** names:

### Sreenivasam Complex
- href/detail: named paid TTD accommodation at Tirupati (rates table on page; no individual href)
- verbatim: > Accommodation at Tirupati On Payment Name Contact Rate Per Day Sreenivasam Complex (Opposite to R.T.C bus Stand in Tirupati) The Superintendent, Phone: 0877-2264541 Non A.C.Rooms : Rs.200.00 A/C Rooms :
### Madhavam Guest House
- href/detail: named paid TTD accommodation at Tirupati (rates table on page; no individual href)
- verbatim: > Rs.200.00 A/C Rooms : Rs.400.00 A/C Deluxe Rooms : Rs.600.00 Madhavam Guest House (adjacent to Srinivasm complex in Tirupati) The Superintendent, Phone:0877-2264541 A.C.Ordinary Suits: Rs. 800.00 A.C.Deluxe Suits: Rs.1,000.00 Only
### Sri Venkateswara Dharmasala
- href/detail: named paid TTD accommodation at Tirupati (rates table on page; no individual href)
- verbatim: > 800.00 A.C.Deluxe Suits: Rs.1,000.00 Only Current Booking (No Advance Booking) Sri Venkateswara Dharmasala (opposite the Tirupati Railway Station) The Superintendent Phone: 0877-2225144 Single : Rs.50.00 Double : Rs.100.00 Four Bed
### Sri Venkateswara Guest House
- href/detail: named paid TTD accommodation at Tirupati (rates table on page; no individual href)
- verbatim: > Single : Rs.50.00 Double : Rs.100.00 Four Bed : Rs.100.00 Sri Venkateswara Guest House (to the north of the Tirupati Railway Station) (Non-AC) Deputy Executive Officer (Reception) Phone : 0877-2264507
### Sri Govindaraja Dharmasala (2ndNC)
- href/detail: named paid TTD accommodation at Tirupati (rates table on page; no individual href)
- verbatim: > Executive Officer (Reception) Phone : 0877-2264507 51 rooms @ Rs.150.00 Sri Govindaraja Dharmasala (2ndNC) The Superintendent Central Reception Office (at the respective Dharmasala) Tirupati Free Locker facility and rooms @50.00
### Sri Kodanda rama Swamy Dharmasala (3rdNC)
- href/detail: named paid TTD accommodation at Tirupati (rates table on page; no individual href)
- verbatim: > the respective Dharmasala) Tirupati Free Locker facility and rooms @50.00 Sri Kodanda rama Swamy Dharmasala (3rdNC) The Superintendent Central Reception Office (at the respective Dharmasala) Tirupati Free Locker facility and
### Vishnu Nivasam
- href/detail: named paid TTD accommodation at Tirupati (rates table on page; no individual href)
- verbatim: > the respective Dharmasala) Tirupati Free Locker facility and rooms @50.00 Vishnu Nivasam Name of the Choultry / Guest House Total No.of Rooms Allotment to Pilgrims L.F. Charges per Day each

## https://www.tirumala.org/TemplesAtTiruchanoor.aspx

- HTTP status: **200** | bytes: 75302 | saved: `temples-at-tiruchanoor.html` | accessed: 2026-10-26
- TTD official Tiruchanoor (Sri Padmavathi) page: 2 sub-shrines inside the Padmavathi compound + Suryanarayana (opposite Padma Sarovaram) + 2 outside temples under SRI PAT (Appalayagunta, Thondamanadu).

- Extracted **6** names:

### Sri Krishna Swamy Temple, (Alagiyaperumal Shrine),Tiruchanoor
- href/detail: section heading on page (no individual href); page: https://www.tirumala.org/TemplesAtTiruchanoor.aspx
- verbatim: > Don'ts FAQs Dress Code Contact US Sub-temples at Tiruchanoor Premises Sri Krishna Swamy Temple, (Alagiyaperumal Shrine),Tiruchanoor This is the earliest of the shrines found inside the compound of Sri Padmavathi
### Sri Sundaraja Swamy Temple, (Varada Raja Shrine), Tiruchanoor
- href/detail: section heading on page (no individual href); page: https://www.tirumala.org/TemplesAtTiruchanoor.aspx
- verbatim: > Krishna in Kaliya mardana pose and Sri Lakshmi Narasimha Swamy. SRI SUNDARAJA SWAMY TEMPLE, (VARADA RAJA SHRINE), TIRUCHANOOR This shrine is found inside the compound of Sri Padmavathi Ammavari Temple
### Sri Suryanarayana Swamy Temple
- href/detail: section heading on page (no individual href); page: https://www.tirumala.org/TemplesAtTiruchanoor.aspx
- verbatim: > every year in the month of July for three days. SRI SURYANARAYANA SWAMY TEMPLE The one of its kind Lord Sri Suryanarayana Swamy temple is located opposite to Padma Saraovaram-the
### Sri Prasanna Venkateswara Swamy Temple, Appalayagunta
- href/detail: section heading on page (no individual href); page: https://www.tirumala.org/TemplesAtTiruchanoor.aspx
- verbatim: > advance through ttdevasthanams.ap.gov.in OUTSIDE TEMPLES FUNCTIONING UNDER - (SRI PAT),TIRUCHANOOR SRI PRASANNA VENKATESWARA SWAMY TEMPLE, APPALAYAGUNTA The Prasanna Venkateswara Swamy temple is located at a distance of about 16km, from
### Sridevi Bhudevi Sametha Venkateswara Swamy Temple, Thondamanadu
- href/detail: section heading on page (no individual href); page: https://www.tirumala.org/TemplesAtTiruchanoor.aspx
- verbatim: > Sravana Nakshatram (Every Month) Kalyanotsavam 11:00 AM to 12.30 PM SRIDEVI BHUDEVI SAMETHA VENKATESWARA SWAMY TEMPLE, THONDAMANADU This historical temple was constructed by Sri Thondaman Chakravarthy, king of “Thondamandalam” and
### Sri Padmavathi Ammavari Temple
- href/detail: context mention — sub-shrines described as inside its compound at Tiruchanoor
- verbatim: > Legend Sri Bedi Anjaneya Swamy Temple Temple Legend At Tiruchanoor Sri Padmavathi Ammavari Temple Temple Legend Arjitha Sevas More Temples At Tirupathi Sri Govindarajaswami Temple Srivari Padalamandapam Temple Sri Lakshmi

## https://www.incredibleindia.gov.in/en/andhra-pradesh/tirupati

- HTTP status: **200** | bytes: 592196 | saved: `incredibleindia-tirupati.html` | accessed: 2026-10-26
- Ministry of Tourism 'Incredible India' Tirupati destination page. NOT a Next.js shell as anticipated: server-rendered HTML (AEM path content/incredible-india-v2; 0 self.__next_f chunks, 0 __NEXT_DATA__) — full text + 10 attraction card links extractable.

- Extracted **15** names:

### Padmavathi Temple
- href/detail: https://www.incredibleindia.gov.in/en/andhra-pradesh/tirupati/padmavathi-temple
- verbatim: > the embrace of the divine. Attractions worth a thousand stories Padmavathi Temple Explore Silathoranam Explore Sri Govindaraja Swamy Temple Explore Chandragiri Fort Explore Sri Venkateswara National Park Explore Sri Venkateswara
### Silathoranam
- href/detail: https://www.incredibleindia.gov.in/en/andhra-pradesh/tirupati/silathoranam
- verbatim: > history of the region. Don't miss the spellbinding sights of Silathoranam, a stunning geological formation dating back 1,500 million years, and the serene Chakra Theertham sacred waterfall surrounded by shrines.
### Sri Govindaraja Swamy Temple
- href/detail: https://www.incredibleindia.gov.in/en/andhra-pradesh/tirupati/sri-govindaraja-swamy-temple
- verbatim: > Attractions worth a thousand stories Padmavathi Temple Explore Silathoranam Explore Sri Govindaraja Swamy Temple Explore Chandragiri Fort Explore Sri Venkateswara National Park Explore Sri Venkateswara Swamy Vaari Temple Explore Srikalahasti
### Chandragiri Fort
- href/detail: https://www.incredibleindia.gov.in/en/andhra-pradesh/tirupati/chandragiri-fort
- verbatim: > serene Chakra Theertham sacred waterfall surrounded by shrines. The majestic Chandragiri Fort is another marvel to visit, with its beautiful architecture and historical signifcance that captivates everyone. You must also
### Sri Venkateswara National Park
- href/detail: https://www.incredibleindia.gov.in/en/andhra-pradesh/tirupati/sri-venkateswara-national-park
- verbatim: > Park Mount Manipur National Park Andhra Pradesh Kondakarla Bird Sanctuary Sri Venkateswara National Park Veerapuram Bird Sanctuary Arunachal Pradesh Namdapha National Park Assam Dibru Saikhowa National Park Delhi National Zoological
### Sri Venkateswara Swamy Vaari Temple
- href/detail: https://www.incredibleindia.gov.in/en/andhra-pradesh/tirupati/sri-venkateswara-swamy-vaari-temple
- verbatim: > Temple Explore Chandragiri Fort Explore Sri Venkateswara National Park Explore Sri Venkateswara Swamy Vaari Temple Explore Srikalahasti Temple Explore Talakona Waterfall Explore Kailasakona Waterfall Explore Regional Science Centre Explore Previous
### Srikalahasti Temple
- href/detail: https://www.incredibleindia.gov.in/en/andhra-pradesh/tirupati/srikalahasti-temple
- verbatim: > Venkateswara National Park Explore Sri Venkateswara Swamy Vaari Temple Explore Srikalahasti Temple Explore Talakona Waterfall Explore Kailasakona Waterfall Explore Regional Science Centre Explore Previous Next Discover more A trove of
### Talakona Waterfall
- href/detail: https://www.incredibleindia.gov.in/en/andhra-pradesh/tirupati/talakona-waterfall
- verbatim: > the opportunity to pay homage to the Supreme Lord Venkateswara. Talakona Waterfall, Tirupati A city of mysterious origins The temple of Lord Venkateshwara has a mysterious origin, with various kingdoms
### Kailasakona Waterfall
- href/detail: https://www.incredibleindia.gov.in/en/andhra-pradesh/tirupati/kailasakona-waterfall
- verbatim: > Swamy Vaari Temple Explore Srikalahasti Temple Explore Talakona Waterfall Explore Kailasakona Waterfall Explore Regional Science Centre Explore Previous Next Discover more A trove of fascinating facts A trove of fascinating
### Regional Science Centre
- href/detail: https://www.incredibleindia.gov.in/en/andhra-pradesh/tirupati/regional-science-centre
- verbatim: > Explore Srikalahasti Temple Explore Talakona Waterfall Explore Kailasakona Waterfall Explore Regional Science Centre Explore Previous Next Discover more A trove of fascinating facts A trove of fascinating facts Sri Venkateswara
### Srivari Padalu
- href/detail: narrative mention only (no link on this page)
- verbatim: > and historical signifcance that captivates everyone. You must also visit Srivari Padalu, the place where legend claims Lord Venkateswara first set foot on Earth, and experience the grandeur of the
### Akasaganga Theertham
- href/detail: narrative mention only (no link on this page)
- verbatim: > completed in 1130 CE. Afterwards, explore the breathtaking sight of Akasaganga Theertham and seek spiritual purification at Papavinasam. Also, you can embark on a spiritual quest at the revered Shaivite
### Papavinasam
- href/detail: narrative mention only (no link on this page)
- verbatim: > breathtaking sight of Akasaganga Theertham and seek spiritual purification at Papavinasam. Also, you can embark on a spiritual quest at the revered Shaivite pilgrimage site of Srikalahasti and experience its
### Chakra Theertham
- href/detail: narrative mention only — 'sacred waterfall surrounded by shrines'
- verbatim: > geological formation dating back 1,500 million years, and the serene Chakra Theertham sacred waterfall surrounded by shrines. The majestic Chandragiri Fort is another marvel to visit, with its beautiful architecture
### Tirumala Temple
- href/detail: narrative mention only
- verbatim: > offering One of the most sacred rituals performed at the Tirumala Temple is the offering of "Tirupati Laddu," a delectable sweetmeat made from gram flour, ghee, sugar, and dry fruits.

## https://www.tirumala.org/PlacesatTirumala.aspx

- HTTP status: **200** | bytes: 61784 | saved: `ttd-PlacesatTirumala.html` | accessed: 2026-10-26
- TTD official 'Places at Tirumala' (batch 2). 4 named temples (incl. TWO distinct Anjaneya temples per the page's own prose) + Swami Pushkarini + Silathoranam.

- Extracted **6** names:

### Sri Venkateswara Temple
- href/detail: https://www.tirumala.org/PlacesatTirumala.aspx — main temple section
- verbatim: > and Don'ts FAQs Dress Code Contact US Places at Tirumala Sri Venkateswara Temple The ancient and sacred temple of Sri Venkateswara is located on the seventh peak, Venkatachala (Venkata Hill)
### Sri Varaha Swami Temple
- href/detail: https://www.tirumala.org/PlacesatTirumala.aspx — section: north of the Sri Venkateswara Temple, banks of Varaha Pushkarini
- verbatim: > mukti, only by worshipping Venkata Nayaka or Sri Venkateswara. More... Sri Varaha Swami Temple Sri Varaha Swami TempleSri Varahaswami Temple in Tirumala is to the north of the Sri Venkateswara
### Sri Bedi AnjaneyaswamiTemple
- href/detail: https://www.tirumala.org/PlacesatTirumala.aspx — section: Sannidhi Street, opposite the main temple (page writes this name without a space)
- verbatim: > permission that Lord Sri Venkateswara took up residence here. More... Sri Bedi AnjaneyaswamiTemple Sri Bedi Anjaneyaswami Temple is located on Sannidhi Street, opposite the main temple. (In the Vaishnavite tradition,
### Sri Anjaneyaswami Temple
- href/detail: https://www.tirumala.org/PlacesatTirumala.aspx — section: opposite the Pushkarini, at Sri Varahaswami temple (DISTINCT from Bedi Anjaneyaswami per the page itself)
- verbatim: > every Sunday and special offerings are made on Hanuman Jayanti. Sri Anjaneyaswami Temple Sri Anjaneyaswami Temple is located opposite to the Pushkarini , at Sri Varahaswami temple on the north-eastern
### Swami Pushkarini
- href/detail: https://www.tirumala.org/PlacesatTirumala.aspx — teerthams section
- verbatim: > Seshachalam ranges and lies on the southern banks of Sri Swami Pushkarini. It is by the Lord’s presidency over Venkatachala, that He has received the appellation, Venkateswara (Lord of the
### Silathoranam
- href/detail: https://www.tirumala.org/PlacesatTirumala.aspx — 'Other Places' section (natural rock arch near Chakra Tirtham)
- verbatim: > day of the fortnight of Dhanur Masa). More... Other Places Silathoranam is a natural rock formation in the form of an arch, near the Chakra Tirtham. Geologists have identified the

## https://www.tirumala.org/S.V. Museum.aspx

- HTTP status: **200** | bytes: 69029 | saved: `ttd-S.V.-Museum.html` | accessed: 2026-10-26
- TTD official S.V. Museum page (batch 2): museum officially named Sri Venkateswara Dhyana Jnana Mandiram, Tirumala; 6000+ items, ten sections.

- Extracted **2** names:

### S.V. Museum
- href/detail: https://www.tirumala.org/S.V. Museum.aspx — page subject
- verbatim: > General Information Do's and Don'ts FAQs Dress Code Contact US S.V. Museum Sri Venkateswara Dhyana Jnana Mandiram,Tirumala The Hall of Antiques was first established in 1980 in Thousand Piller mandapam
### Sri Venkateswara Dhyana Jnana Mandiram
- href/detail: https://www.tirumala.org/S.V. Museum.aspx — official building name (opposite Vaikuntham Queue Complex, Tirumala)
- verbatim: > Do's and Don'ts FAQs Dress Code Contact US S.V. Museum Sri Venkateswara Dhyana Jnana Mandiram,Tirumala The Hall of Antiques was first established in 1980 in Thousand Piller mandapam opposite to

## https://www.tirumala.org/RestHousesInTirumala.aspx

- HTTP status: **200** | bytes: 76257 | saved: `ttd-RestHousesInTirumala.html` | accessed: 2026-10-26
- TTD official Rest Houses in Tirumala (batch 2): 34 named rows across 4 sections (Sri Padmavathi GH Area 15, Sri Venkateswara GH Area 6 named, TBC Area 12, Marriage Halls 1 new name) with official rates. NOT extracted (recorded here instead): 'NGC VVGH HRG MBC Cottages' row — internal booking codes, not a place name.

- Extracted **34** names:

### Ampro Rest House
- href/detail: named TTD rest-house/cottage row in a rates table (no individual href); page: https://www.tirumala.org/RestHousesInTirumala.aspx
- verbatim: > No Name Rate per unit per day (INR) * 1. Ampro Rest House 750.00 1500.00 2. Bela Kuteeram A/C ( 6 suites) 500.00 3. Gayathri Sadan A/C 1500.00 2500.00 4.
### Bela Kuteeram A/C
- href/detail: named TTD rest-house/cottage row in a rates table (no individual href); page: https://www.tirumala.org/RestHousesInTirumala.aspx
- verbatim: > day (INR) * 1. Ampro Rest House 750.00 1500.00 2. Bela Kuteeram A/C ( 6 suites) 500.00 3. Gayathri Sadan A/C 1500.00 2500.00 4. Hari Sadan Guest House A/C (7
### Gayathri Sadan A/C
- href/detail: named TTD rest-house/cottage row in a rates table (no individual href); page: https://www.tirumala.org/RestHousesInTirumala.aspx
- verbatim: > 1500.00 2. Bela Kuteeram A/C ( 6 suites) 500.00 3. Gayathri Sadan A/C 1500.00 2500.00 4. Hari Sadan Guest House A/C (7 suites) 1500.00 5. Hill View Cottages Deluxe 50.00
### Hari Sadan Guest House A/C
- href/detail: named TTD rest-house/cottage row in a rates table (no individual href); page: https://www.tirumala.org/RestHousesInTirumala.aspx
- verbatim: > 6 suites) 500.00 3. Gayathri Sadan A/C 1500.00 2500.00 4. Hari Sadan Guest House A/C (7 suites) 1500.00 5. Hill View Cottages Deluxe 50.00 100.00 150.00 1500.00 6. Indira Rest
### Hill View Cottages Deluxe
- href/detail: named TTD rest-house/cottage row in a rates table (no individual href); page: https://www.tirumala.org/RestHousesInTirumala.aspx
- verbatim: > 4. Hari Sadan Guest House A/C (7 suites) 1500.00 5. Hill View Cottages Deluxe 50.00 100.00 150.00 1500.00 6. Indira Rest House A/C( 4 suites ) 2000.00 7. Jagannadha Bhavan
### Indira Rest House A/C
- href/detail: named TTD rest-house/cottage row in a rates table (no individual href); page: https://www.tirumala.org/RestHousesInTirumala.aspx
- verbatim: > 5. Hill View Cottages Deluxe 50.00 100.00 150.00 1500.00 6. Indira Rest House A/C( 4 suites ) 2000.00 7. Jagannadha Bhavan ( 4 suites ) 2500.00 3500.00 8. Karam Nivas
### Jagannadha Bhavan
- href/detail: named TTD rest-house/cottage row in a rates table (no individual href); page: https://www.tirumala.org/RestHousesInTirumala.aspx
- verbatim: > 6. Indira Rest House A/C( 4 suites ) 2000.00 7. Jagannadha Bhavan ( 4 suites ) 2500.00 3500.00 8. Karam Nivas 1500.00 2500.00 9. Lakshmi Nivas 500.00 600.00 10. RajyaLakshmi
### Karam Nivas
- href/detail: named TTD rest-house/cottage row in a rates table (no individual href); page: https://www.tirumala.org/RestHousesInTirumala.aspx
- verbatim: > 7. Jagannadha Bhavan ( 4 suites ) 2500.00 3500.00 8. Karam Nivas 1500.00 2500.00 9. Lakshmi Nivas 500.00 600.00 10. RajyaLakshmi Guest House A/C 1000.00 2500.00 3000.00 3500.00 11. SP
### Lakshmi Nivas
- href/detail: named TTD rest-house/cottage row in a rates table (no individual href); page: https://www.tirumala.org/RestHousesInTirumala.aspx
- verbatim: > suites ) 2500.00 3500.00 8. Karam Nivas 1500.00 2500.00 9. Lakshmi Nivas 500.00 600.00 10. RajyaLakshmi Guest House A/C 1000.00 2500.00 3000.00 3500.00 11. SP Guest House (Main) 1500.00 2500.00
### RajyaLakshmi Guest House A/C
- href/detail: named TTD rest-house/cottage row in a rates table (no individual href); page: https://www.tirumala.org/RestHousesInTirumala.aspx
- verbatim: > Karam Nivas 1500.00 2500.00 9. Lakshmi Nivas 500.00 600.00 10. RajyaLakshmi Guest House A/C 1000.00 2500.00 3000.00 3500.00 11. SP Guest House (Main) 1500.00 2500.00 12. Srinikethan A/C ( 3
### SP Guest House (Main)
- href/detail: named TTD rest-house/cottage row in a rates table (no individual href); page: https://www.tirumala.org/RestHousesInTirumala.aspx
- verbatim: > 10. RajyaLakshmi Guest House A/C 1000.00 2500.00 3000.00 3500.00 11. SP Guest House (Main) 1500.00 2500.00 12. Srinikethan A/C ( 3 suites ) 6000.00 13. Srinivasa Nilayam A/C 2500.00 3500.00
### Srinikethan A/C
- href/detail: named TTD rest-house/cottage row in a rates table (no individual href); page: https://www.tirumala.org/RestHousesInTirumala.aspx
- verbatim: > 3000.00 3500.00 11. SP Guest House (Main) 1500.00 2500.00 12. Srinikethan A/C ( 3 suites ) 6000.00 13. Srinivasa Nilayam A/C 2500.00 3500.00 14. Venkata Vijayam Guest House A/C 3
### Srinivasa Nilayam A/C
- href/detail: named TTD rest-house/cottage row in a rates table (no individual href); page: https://www.tirumala.org/RestHousesInTirumala.aspx
- verbatim: > 2500.00 12. Srinikethan A/C ( 3 suites ) 6000.00 13. Srinivasa Nilayam A/C 2500.00 3500.00 14. Venkata Vijayam Guest House A/C 3 master suites 6 other suites 1500.00 2500.00 15.
### Venkata Vijayam Guest House A/C
- href/detail: named TTD rest-house/cottage row in a rates table (no individual href); page: https://www.tirumala.org/RestHousesInTirumala.aspx
- verbatim: > suites ) 6000.00 13. Srinivasa Nilayam A/C 2500.00 3500.00 14. Venkata Vijayam Guest House A/C 3 master suites 6 other suites 1500.00 2500.00 15. Vidya Sadan 1500.00 * Rate per
### Vidya Sadan
- href/detail: named TTD rest-house/cottage row in a rates table (no individual href); page: https://www.tirumala.org/RestHousesInTirumala.aspx
- verbatim: > A/C 3 master suites 6 other suites 1500.00 2500.00 15. Vidya Sadan 1500.00 * Rate per unit = Rate per Room/Cottage Sri Venkateswara Guest House Area S. No Name Rate
### Sri Venkateswara Guest House Corner Suites
- href/detail: named TTD rest-house/cottage row in a rates table (no individual href); page: https://www.tirumala.org/RestHousesInTirumala.aspx
- verbatim: > No Name Rate per unit per day (INR) * 1. Sri Venkateswara Guest House Corner Suites 1500.00 2000.00 2. NGC VVGH HRG MBC Cottages (Number: 20 and 22) 2000.00, 2500.00
### Narayanagiri Guest House - I
- href/detail: named TTD rest-house/cottage row in a rates table (no individual href); page: https://www.tirumala.org/RestHousesInTirumala.aspx
- verbatim: > Bungalow Cottages) A/C (13 nos.) 50.00 100.00 200.00 500.00 4. Narayanagiri Guest House - I Corner Suite 1500.00 2000.00 5. Narayanagiri Guest House - II Corner Suite 1500.00 2000.00 6.
### Narayanagiri Guest House - II
- href/detail: named TTD rest-house/cottage row in a rates table (no individual href); page: https://www.tirumala.org/RestHousesInTirumala.aspx
- verbatim: > Narayanagiri Guest House - I Corner Suite 1500.00 2000.00 5. Narayanagiri Guest House - II Corner Suite 1500.00 2000.00 6. Narayanagiri Guest House - III Corner Suite 1500.00 2000.00 7.
### Narayanagiri Guest House - III
- href/detail: named TTD rest-house/cottage row in a rates table (no individual href); page: https://www.tirumala.org/RestHousesInTirumala.aspx
- verbatim: > Narayanagiri Guest House - II Corner Suite 1500.00 2000.00 6. Narayanagiri Guest House - III Corner Suite 1500.00 2000.00 7. Srivari Kuteer Guest House (A/C) Suite No.1 to 4 entire
### Srivari Kuteer Guest House
- href/detail: named TTD rest-house/cottage row in a rates table (no individual href); page: https://www.tirumala.org/RestHousesInTirumala.aspx
- verbatim: > Narayanagiri Guest House - III Corner Suite 1500.00 2000.00 7. Srivari Kuteer Guest House (A/C) Suite No.1 to 4 entire Guest House 200.00 1500.00 8. Surapuram Thota Cottages 1500.00 *
### Surapuram Thota Cottages
- href/detail: named TTD rest-house/cottage row in a rates table (no individual href); page: https://www.tirumala.org/RestHousesInTirumala.aspx
- verbatim: > Suite No.1 to 4 entire Guest House 200.00 1500.00 8. Surapuram Thota Cottages 1500.00 * Rate per unit = Rate per Room/Cottage Travellers Bungalow Cottages Area S. No Name Rate
### Alwar Tank Cottages
- href/detail: named TTD rest-house/cottage row in a rates table (no individual href); page: https://www.tirumala.org/RestHousesInTirumala.aspx
- verbatim: > No Name Rate per unit per day (INR) * 1. Alwar Tank Cottages Single rooms 50.00 100.00 2. Anjanadri Nagar Cottages 50.00 3. Garudadri Nagar Cottages 50.00 4. Hill View
### Anjanadri Nagar Cottages
- href/detail: named TTD rest-house/cottage row in a rates table (no individual href); page: https://www.tirumala.org/RestHousesInTirumala.aspx
- verbatim: > * 1. Alwar Tank Cottages Single rooms 50.00 100.00 2. Anjanadri Nagar Cottages 50.00 3. Garudadri Nagar Cottages 50.00 4. Hill View Cottages (Ordinary) 50.00 5. Mangala Bavi Cottages 2
### Garudadri Nagar Cottages
- href/detail: named TTD rest-house/cottage row in a rates table (no individual href); page: https://www.tirumala.org/RestHousesInTirumala.aspx
- verbatim: > Single rooms 50.00 100.00 2. Anjanadri Nagar Cottages 50.00 3. Garudadri Nagar Cottages 50.00 4. Hill View Cottages (Ordinary) 50.00 5. Mangala Bavi Cottages 2 suites 4 cottages 100.00 200.00
### Hill View Cottages (Ordinary)
- href/detail: named TTD rest-house/cottage row in a rates table (no individual href); page: https://www.tirumala.org/RestHousesInTirumala.aspx
- verbatim: > Anjanadri Nagar Cottages 50.00 3. Garudadri Nagar Cottages 50.00 4. Hill View Cottages (Ordinary) 50.00 5. Mangala Bavi Cottages 2 suites 4 cottages 100.00 200.00 6. Ram Bagicha Guest House
### Mangala Bavi Cottages
- href/detail: named TTD rest-house/cottage row in a rates table (no individual href); page: https://www.tirumala.org/RestHousesInTirumala.aspx
- verbatim: > Nagar Cottages 50.00 4. Hill View Cottages (Ordinary) 50.00 5. Mangala Bavi Cottages 2 suites 4 cottages 100.00 200.00 6. Ram Bagicha Guest House - I 100.00 7. Ram Bagicha
### Ram Bagicha Guest House - I
- href/detail: named TTD rest-house/cottage row in a rates table (no individual href); page: https://www.tirumala.org/RestHousesInTirumala.aspx
- verbatim: > Mangala Bavi Cottages 2 suites 4 cottages 100.00 200.00 6. Ram Bagicha Guest House - I 100.00 7. Ram Bagicha Guest House - II 100.00 8. Ram Bagicha Guest House
### Ram Bagicha Guest House - II
- href/detail: named TTD rest-house/cottage row in a rates table (no individual href); page: https://www.tirumala.org/RestHousesInTirumala.aspx
- verbatim: > 200.00 6. Ram Bagicha Guest House - I 100.00 7. Ram Bagicha Guest House - II 100.00 8. Ram Bagicha Guest House - III 100.00 9. Sanku Mitta Cottages 50.00
### Ram Bagicha Guest House - III
- href/detail: named TTD rest-house/cottage row in a rates table (no individual href); page: https://www.tirumala.org/RestHousesInTirumala.aspx
- verbatim: > 100.00 7. Ram Bagicha Guest House - II 100.00 8. Ram Bagicha Guest House - III 100.00 9. Sanku Mitta Cottages 50.00 10. Seshadri Nagar Cottages 50.00 11. TB Cottages
### Sanku Mitta Cottages
- href/detail: named TTD rest-house/cottage row in a rates table (no individual href); page: https://www.tirumala.org/RestHousesInTirumala.aspx
- verbatim: > 100.00 8. Ram Bagicha Guest House - III 100.00 9. Sanku Mitta Cottages 50.00 10. Seshadri Nagar Cottages 50.00 11. TB Cottages 2 suites Single rooms Outside cottages 50.00 100.00
### Seshadri Nagar Cottages
- href/detail: named TTD rest-house/cottage row in a rates table (no individual href); page: https://www.tirumala.org/RestHousesInTirumala.aspx
- verbatim: > House - III 100.00 9. Sanku Mitta Cottages 50.00 10. Seshadri Nagar Cottages 50.00 11. TB Cottages 2 suites Single rooms Outside cottages 50.00 100.00 200.00 500.00 12. Valley View
### TB Cottages
- href/detail: named TTD rest-house/cottage row in a rates table (no individual href); page: https://www.tirumala.org/RestHousesInTirumala.aspx
- verbatim: > Sanku Mitta Cottages 50.00 10. Seshadri Nagar Cottages 50.00 11. TB Cottages 2 suites Single rooms Outside cottages 50.00 100.00 200.00 500.00 12. Valley View Cottages 100.00 200.00 * Rate
### Valley View Cottages
- href/detail: named TTD rest-house/cottage row in a rates table (no individual href); page: https://www.tirumala.org/RestHousesInTirumala.aspx
- verbatim: > suites Single rooms Outside cottages 50.00 100.00 200.00 500.00 12. Valley View Cottages 100.00 200.00 * Rate per unit = Rate per Room/Cottage Marriage Halls and Cottages S.No Name Rate
### Alwar Tank Cottage No. 99
- href/detail: named TTD rest-house/cottage row in a rates table (no individual href); page: https://www.tirumala.org/RestHousesInTirumala.aspx
- verbatim: > S.No Name Rate per unit per day (INR) * 1. Alwar Tank Cottage No. 99 200.00 2. Sanku Mitta Cottages (10 cottages) 200.00 3. Travellers Bungalow Cottages (5 cottages) 200.00

## https://www.tirumala.org/ttdklmps.aspx

- HTTP status: **200** | bytes: 113640 | saved: `ttd-ttdklmps.html` | accessed: 2026-10-26
- TTD official Kalyana Mandapam directory (batch 2): ~160 rows across Indian cities/towns. SCOPE FINDING: ZERO Tirupati or Tirumala rows in the directory table (checked programmatically — 'Tirupati'/'Tirumala' hits are all page-nav text, not table rows). Page reviewed and recorded; NO candidates from it — out of Tirupati scope by the page's own content.

- Extracted **2** names:

### Kalyana Mandapams
- href/detail: https://www.tirumala.org/ttdklmps.aspx — page subject (pan-India directory; page heading: 'TTD Information Centres and Kalyana Mandapams')
- verbatim: > Don'ts FAQs Dress Code Contact US TTD Information Centres and Kalyana Mandapams TTD has established Kalyana Mandapams cum Information Centres in Pondicherry and at all metropolitan cities. TTD also runs
### Bangalore
- href/detail: https://www.tirumala.org/ttdklmps.aspx — example directory row: 'Manager TTD Information Centre 16th Cross, Vyalikavel Bangalore - 560 003'
- verbatim: > will be levied for the Kalyana Mandapams at Hyderabad and Bangalore. At the centres in all metropolitan cities and at all district headquarters, you can book accommodation (only rooms costing

## https://www.tirumala.org/MoreTemples.aspx

- HTTP status: **200** | bytes: 149703 | saved: `ttd-MoreTemples.html` | accessed: 2026-10-26
- TTD official 'More Temples' (batch 2): 9 Tirupati-region TTD-managed temple candidates + 4 sub-temple names 'in Pattabhiramalayam' (location unstated on page — kept as evidence only) + 2 OUT-OF-REGION Kadapa temples (recorded, excluded from inventory by scope).

- Extracted **15** names:

### Sri Prasanna Venkateswara Swamy temple, Kosuvari Palle
- href/detail: https://www.tirumala.org/MoreTemples.aspx — prose section (TTD-managed, Tirupati region)
- verbatim: > important religious fete that is being observed in this temple. Sri Prasanna Venkateswara Swamy temple, Kosuvari Palle This is yet another important and ancient temple which was recently taken over
### Sri Konetiraya Swamy, Keelapatla
- href/detail: https://www.tirumala.org/MoreTemples.aspx — prose section (village Keelapatla; TTD-managed)
- verbatim: > the month of Magha-(January/February) in the advent of Sravana Nakshatram. Sri Konetiraya Swamy, Keelapatla This ancient temple is located in the village of Keelaptla, Gangavaram mandal in Palamaneru, about 110km
### Sri Kalyana Venkateswara Swamy temple, Narayanavanam
- href/detail: https://www.tirumala.org/MoreTemples.aspx — prose section (DISTINCT from the Srinivasa Mangapuram Kalyana Venkateswara temple)
- verbatim: > 11-00 AM TO 11-30 AM Temples outside Tirupati (outside temples) Sri Kalyana Venkateswara Swamy temple, Narayanavanam It is yet another ancient temple of mythological significance located about 60 km from
### Sri Vedanarayana Swamy Temple, Nagalapuram
- href/detail: https://www.tirumala.org/MoreTemples.aspx — prose section
- verbatim: > in advance through ttdevasthanams.ap.gov.in Click here to view Temple Program Sri Vedanarayana Swamy Temple, Nagalapuram This is one of the most important and ancient sub-shrines under the umbrella of Tirumala
### Sri Venugopala Swamy Vari temple, Karvetinagaram
- href/detail: https://www.tirumala.org/MoreTemples.aspx — prose section (rates table spells the village 'Karveti Nagaram')
- verbatim: > in advance through ttdevasthanams.ap.gov.in Click here to view Temple Program Sri Venugopala Swamy Vari temple, Karvetinagaram (taken over temple): The presiding deity in this ancient shrine is Sri Venugopala Swamy
### Sri Karivarada Raja Swamy vari temple, Satravada
- href/detail: https://www.tirumala.org/MoreTemples.aspx — prose section (rates table also carries 'Sri Kati Varadaraja Swamy Temple, Sathravada' — same-village name ambiguity flagged for review, not resolved here)
- verbatim: > Moksham in the Bhagavatam. Click here to view Temple Program Sri Karivarada Raja Swamy vari temple, Satravada (taken over temple): Both the Nagari and Satravada temples are considered to have
### Sri Kodandarama Swamy Temple, Tirupati
- href/detail: https://www.tirumala.org/MoreTemples.aspx — rates-table row (Tirupati city)
- verbatim: > Sevas and Weekly Sevas Annual Utsavams, Fairs and Festivals 1 Sri Kodandarama Swamy Temple, Tirupati 5.00 am to 9.00 pm Suprabatham Archana Abhishekam (weekly) Unjal Seva (on every Saturday) Kalyanotsavam
### Sri Kari Manikya Swamy Temple, Nagari
- href/detail: https://www.tirumala.org/MoreTemples.aspx — rates-table row
- verbatim: > Gokulastami Brahmotsavams Anivara Asthanam Varalakshmi Vratham Deepavali Asthanam Danurmasam 5 Sri Kari Manikya Swamy Temple, Nagari 5.30 am to 12.30 pm and 4.00pm to 8.30pm Suprabatham Archana Abhishekam (weekly) Ekantha
### Sri Lakshmi Narasimha Swamy temple, Tarigonda
- href/detail: https://www.tirumala.org/MoreTemples.aspx — prose section (TTD-managed)
- verbatim: > Vittaleshwara Swamy temple Sri Mahalakshmi Temple Sri Veeranjaneya Swamy temple Sri Lakshmi Narasimha Swamy temple, Tarigonda This famous temple of Sri Lakshmi Narasimha Swamy is located in the village of
### Sri Ranganatha Temple
- href/detail: 'Other sub-temples in Pattabhiramalayam' prose list — Pattabhiramalayam's own location is NOT stated on this page; recorded, not mapped to an area
- verbatim: > fortnight of Chaitra (March/April) every year. Other sub-temples in Pattabhiramalayam: Sri Ranganatha Temple Sri Panduranga Vittaleshwara Swamy temple Sri Mahalakshmi Temple Sri Veeranjaneya Swamy temple Sri Lakshmi Narasimha Swamy temple,
### Sri Panduranga Vittaleshwara Swamy temple
- href/detail: 'Other sub-temples in Pattabhiramalayam' prose list — location not stated on page
- verbatim: > (March/April) every year. Other sub-temples in Pattabhiramalayam: Sri Ranganatha Temple Sri Panduranga Vittaleshwara Swamy temple Sri Mahalakshmi Temple Sri Veeranjaneya Swamy temple Sri Lakshmi Narasimha Swamy temple, Tarigonda This famous
### Sri Mahalakshmi Temple
- href/detail: 'Other sub-temples in Pattabhiramalayam' prose list — location not stated on page
- verbatim: > in Pattabhiramalayam: Sri Ranganatha Temple Sri Panduranga Vittaleshwara Swamy temple Sri Mahalakshmi Temple Sri Veeranjaneya Swamy temple Sri Lakshmi Narasimha Swamy temple, Tarigonda This famous temple of Sri Lakshmi Narasimha
### Sri Veeranjaneya Swamy temple
- href/detail: 'Other sub-temples in Pattabhiramalayam' prose list — location not stated on page
- verbatim: > Ranganatha Temple Sri Panduranga Vittaleshwara Swamy temple Sri Mahalakshmi Temple Sri Veeranjaneya Swamy temple Sri Lakshmi Narasimha Swamy temple, Tarigonda This famous temple of Sri Lakshmi Narasimha Swamy is located
### Sri Narapura Venkateswara Swamy vari Temple, Jammalamadugu
- href/detail: OUT-OF-REGION: Jammalamadugu, YSR Kadapa district (~200 km) — TTD-managed but NOT a Tirupati-region destination; recorded, not an inventory candidate
- verbatim: > General Information Do's and Don'ts FAQs Dress Code Contact US Sri Narapura Venkateswara Swamy vari Temple, Jammalamadugu According to the legend, there was a big tank with thick Jambu bushes
### Sri Siddeswara Swamy Vari Temple, Thallapaka
- href/detail: OUT-OF-REGION: Thallapaka, Rajampeta Mandal, YSR Kadapa district — recorded, not an inventory candidate
- verbatim: > From then all poojas are performed as per Pancharatra Agama. Sri Siddeswara Swamy Vari Temple, Thallapaka Sri Kamakshi Sametha Sri Siddeswara Swamy was a temple dedicated to Lord Shiva, constructed

## https://www.tirumala.org/KalyanaKatta.aspx

- HTTP status: **200** | bytes: 60092 | saved: `ttd-KalyanaKatta.html` | accessed: 2026-10-27
- TTD official Kalyana Katta page (batch 3): main tonsuring centre + 5 named rest houses carrying Kalyanakatta counters. Internal shift-table codes (KKC/PAC1/PAC2/SPRH/SVRH/GNC/NDRH/HVC/KTRH/SGRH) recorded here but NOT extracted as place names.

- Extracted **6** names:

### Kalyana Katta
- href/detail: https://www.tirumala.org/KalyanaKatta.aspx — main tonsuring centre, Tirumala (page title + nav; body describes facilities/timings)
- verbatim: > Incase of vehicle break down / accident Others Anna Prasadam Kalyana Katta Medical Fulfilling Vows Online Services Seva Darshan Accommodation Hundi Donation Publications Kalyana Vedika Kalyanamandapam News and Events TTD
### Nandhakam Rest House
- href/detail: https://www.tirumala.org/KalyanaKatta.aspx — named among rest houses running a Kalyanakatta counter
- verbatim: > Rest House(SVRH), Sri Padmavathi Rest House(SPRH), HVC, GNC, PAC1, PAC2, Nandhakam Rest House, Kousthubham rest House(KTRH) and Sapthagiri Rest House(SGRH). Tonsuring is done at free of cost at all Kalyanakattas.
### Kousthubham rest House
- href/detail: https://www.tirumala.org/KalyanaKatta.aspx — named with code (KTRH)
- verbatim: > Padmavathi Rest House(SPRH), HVC, GNC, PAC1, PAC2, Nandhakam Rest House, Kousthubham rest House(KTRH) and Sapthagiri Rest House(SGRH). Tonsuring is done at free of cost at all Kalyanakattas. Antiseptics are mixed
### Sapthagiri Rest House
- href/detail: https://www.tirumala.org/KalyanaKatta.aspx — named with code (SGRH)
- verbatim: > GNC, PAC1, PAC2, Nandhakam Rest House, Kousthubham rest House(KTRH) and Sapthagiri Rest House(SGRH). Tonsuring is done at free of cost at all Kalyanakattas. Antiseptics are mixed with water and applied
### Sri Venkateswara Rest House
- href/detail: https://www.tirumala.org/KalyanaKatta.aspx — named with code (SVRH); distinct from the TTD Guest Houses on RestHousesInTirumala.aspx
- verbatim: > to the pilgrims staying in cottages and guesthouses. Such as Sri Venkateswara Rest House(SVRH), Sri Padmavathi Rest House(SPRH), HVC, GNC, PAC1, PAC2, Nandhakam Rest House, Kousthubham rest House(KTRH) and Sapthagiri
### Sri Padmavathi Rest House
- href/detail: https://www.tirumala.org/KalyanaKatta.aspx — named with code (SPRH); distinct from the Guest House Area on RestHousesInTirumala.aspx
- verbatim: > in cottages and guesthouses. Such as Sri Venkateswara Rest House(SVRH), Sri Padmavathi Rest House(SPRH), HVC, GNC, PAC1, PAC2, Nandhakam Rest House, Kousthubham rest House(KTRH) and Sapthagiri Rest House(SGRH). Tonsuring is

## https://www.tirumala.org/PackageTours.aspx

- HTTP status: **200** | bytes: 57022 | saved: `ttd-PackageTours.html` | accessed: 2026-10-27
- TTD official Package Tours page (batch 3): Local Temples Tour (6 named stops) + Surrounding Temples Tour (7 named stops) with fares/durations. Tour logistics (Srinivasam/Vishnu Nivasam start points) quoted in prose.

- Extracted **13** names:

### Sri Padmavathi Ammavari Temple, Tiruchanoor
- href/detail: https://www.tirumala.org/PackageTours.aspx — Local Temples Tour itinerary (strengthens existing row)
- verbatim: > Nivasam Complex opposite railway station, Tirupati. These tours cover: • SRI PADMAVATHI AMMAVARI TEMPLE, TIRUCHANOOR • SRI KALYANA VENKATESWAA SWAMYVARI TEMPLE, SRINIVASA MANGAPURAM • SRI AGASTHEESWARA SWAMYVARI TEMPLE, THONDAWADA •
### Sri Kalyana Venkateswaa Swamyvari Temple, Srinivasa Mangapuram
- href/detail: https://www.tirumala.org/PackageTours.aspx — Local Temples Tour itinerary (page's own spelling; same temple as Batch-011 candidate)
- verbatim: > These tours cover: • SRI PADMAVATHI AMMAVARI TEMPLE, TIRUCHANOOR • SRI KALYANA VENKATESWAA SWAMYVARI TEMPLE, SRINIVASA MANGAPURAM • SRI AGASTHEESWARA SWAMYVARI TEMPLE, THONDAWADA • SRI KAPILESWRASWAMYVARI TEMPLE, KAPILATHEERTHAM, TIRUPATI •
### Sri Agastheeswara Swamyvari Temple, Thondawada
- href/detail: https://www.tirumala.org/PackageTours.aspx — Local Temples Tour itinerary (NEW: Thondavada village, on the Chandragiri road)
- verbatim: > TIRUCHANOOR • SRI KALYANA VENKATESWAA SWAMYVARI TEMPLE, SRINIVASA MANGAPURAM • SRI AGASTHEESWARA SWAMYVARI TEMPLE, THONDAWADA • SRI KAPILESWRASWAMYVARI TEMPLE, KAPILATHEERTHAM, TIRUPATI • SRI GOVINDARAJA SWAMYVARI TEMPLE, TIRUPATI. • SRI VAKULAMATHA
### Sri Kapileswraswamyvari Temple, Kapilatheertham, Tirupati
- href/detail: https://www.tirumala.org/PackageTours.aspx — Local Temples Tour itinerary (page's own spelling; same temple as Batch-011 candidate)
- verbatim: > TEMPLE, SRINIVASA MANGAPURAM • SRI AGASTHEESWARA SWAMYVARI TEMPLE, THONDAWADA • SRI KAPILESWRASWAMYVARI TEMPLE, KAPILATHEERTHAM, TIRUPATI • SRI GOVINDARAJA SWAMYVARI TEMPLE, TIRUPATI. • SRI VAKULAMATHA TEMPLE, TIRUPATI. Note : The duration
### Sri Govindaraja Swamyvari Temple, Tirupati
- href/detail: https://www.tirumala.org/PackageTours.aspx — Local Temples Tour itinerary (same temple as Batch-011 candidate)
- verbatim: > SWAMYVARI TEMPLE, THONDAWADA • SRI KAPILESWRASWAMYVARI TEMPLE, KAPILATHEERTHAM, TIRUPATI • SRI GOVINDARAJA SWAMYVARI TEMPLE, TIRUPATI. • SRI VAKULAMATHA TEMPLE, TIRUPATI. Note : The duration of the tour is 5 hours
### Sri Vakulamatha Temple, Tirupati
- href/detail: https://www.tirumala.org/PackageTours.aspx — Local Temples Tour itinerary (NEW)
- verbatim: > TEMPLE, KAPILATHEERTHAM, TIRUPATI • SRI GOVINDARAJA SWAMYVARI TEMPLE, TIRUPATI. • SRI VAKULAMATHA TEMPLE, TIRUPATI. Note : The duration of the tour is 5 hours and fare charged is Rs.200/- per
### Sri Venugopalaswamyvari Temple, Karvetinagaram
- href/detail: https://www.tirumala.org/PackageTours.aspx — Surrounding Temples Tour itinerary (strengthens existing batch-013 row)
- verbatim: > to APSRTC Central Bus Station, Tirupati. These tours cover: • SRI VENUGOPALASWAMYVARI TEMPLE, KARVETINAGARAM • SRI KALYANAVENKAESWARASWAMYVARI TEMPLE, NARAYANAVARAM • SRI PALLIKONDESWARA SWAMYVARI TEMPLE, SURUTUPALLI • SRI VEDANARAYANASWAMYVARI TEMPLE, NAGALAPURAM
### Sri Kalyanavenkaeswaraswamyvari Temple, Narayanavaram
- href/detail: https://www.tirumala.org/PackageTours.aspx — Surrounding Temples Tour itinerary (page's own spelling of Narayanavanam; strengthens existing batch-013 row)
- verbatim: > Tirupati. These tours cover: • SRI VENUGOPALASWAMYVARI TEMPLE, KARVETINAGARAM • SRI KALYANAVENKAESWARASWAMYVARI TEMPLE, NARAYANAVARAM • SRI PALLIKONDESWARA SWAMYVARI TEMPLE, SURUTUPALLI • SRI VEDANARAYANASWAMYVARI TEMPLE, NAGALAPURAM • SRI KARIYA MANIKYA SWAMYVARI
### Sri Pallikondeswara Swamyvari Temple, Surutupalli
- href/detail: https://www.tirumala.org/PackageTours.aspx — Surrounding Temples Tour itinerary (NEW)
- verbatim: > SRI VENUGOPALASWAMYVARI TEMPLE, KARVETINAGARAM • SRI KALYANAVENKAESWARASWAMYVARI TEMPLE, NARAYANAVARAM • SRI PALLIKONDESWARA SWAMYVARI TEMPLE, SURUTUPALLI • SRI VEDANARAYANASWAMYVARI TEMPLE, NAGALAPURAM • SRI KARIYA MANIKYA SWAMYVARI TMPLE, NAGARI • SRI KASI
### Sri Vedanarayanaswamyvari Temple, Nagalapuram
- href/detail: https://www.tirumala.org/PackageTours.aspx — Surrounding Temples Tour itinerary (strengthens existing batch-013 row)
- verbatim: > KALYANAVENKAESWARASWAMYVARI TEMPLE, NARAYANAVARAM • SRI PALLIKONDESWARA SWAMYVARI TEMPLE, SURUTUPALLI • SRI VEDANARAYANASWAMYVARI TEMPLE, NAGALAPURAM • SRI KARIYA MANIKYA SWAMYVARI TMPLE, NAGARI • SRI KASI VISESWARA SWAMYVARI TEMPLE, BUGGA • SRI
### Sri Kariya Manikya Swamyvari Tmple, Nagari
- href/detail: https://www.tirumala.org/PackageTours.aspx — Surrounding Temples Tour itinerary (page's own spelling incl. 'TMPLE' typo nearby; strengthens existing batch-013 row)
- verbatim: > PALLIKONDESWARA SWAMYVARI TEMPLE, SURUTUPALLI • SRI VEDANARAYANASWAMYVARI TEMPLE, NAGALAPURAM • SRI KARIYA MANIKYA SWAMYVARI TMPLE, NAGARI • SRI KASI VISESWARA SWAMYVARI TEMPLE, BUGGA • SRI PRASANNA VENKATESWARASWAMYVARI TEMPLE, APPPALAYAGUNTA Note
### Sri Kasi Viseswara Swamyvari Temple, Bugga
- href/detail: https://www.tirumala.org/PackageTours.aspx — Surrounding Temples Tour itinerary (NEW: Bugga village)
- verbatim: > TEMPLE, NAGALAPURAM • SRI KARIYA MANIKYA SWAMYVARI TMPLE, NAGARI • SRI KASI VISESWARA SWAMYVARI TEMPLE, BUGGA • SRI PRASANNA VENKATESWARASWAMYVARI TEMPLE, APPPALAYAGUNTA Note : The duration of the tour is
### Sri Prasanna Venkateswaraswamyvari Temple, Apppalayagunta
- href/detail: https://www.tirumala.org/PackageTours.aspx — Surrounding Temples Tour itinerary (page's own spelling with 3 P's; same temple as Batch-012 row)
- verbatim: > TMPLE, NAGARI • SRI KASI VISESWARA SWAMYVARI TEMPLE, BUGGA • SRI PRASANNA VENKATESWARASWAMYVARI TEMPLE, APPPALAYAGUNTA Note : The duration of the tour is 8 hours and the fare charged is

## https://www.tirumala.org/TirumalatoTirupathiOnFoot.aspx

- HTTP status: **200** | bytes: 56585 | saved: `ttd-TirumalatoTirupathiOnFoot.html` | accessed: 2026-10-27
- TTD official On-Foot page (batch 3): two sopanamargas with named access points (Alipiri start, Gali Gopuram, Srivari Mettu) + pilgrim facilities (luggage token, P.A.C., free buses).

- Extracted **3** names:

### Alipiri
- href/detail: https://www.tirumala.org/TirumalatoTirupathiOnFoot.aspx — the 11 km sopanamarga footpath 'starts from Alipiri at the foot of the hills' (Tirupati side)
- verbatim: > The more ancient of the two sopanamargas which starts from Alipiri at the foot of the hills, is about 11 km in length, and is the commonly-used route. Token facility
### Gali Gopuram
- href/detail: https://www.tirumala.org/TirumalatoTirupathiOnFoot.aspx — named pedestrian access point with bio-metric counter on the footpath
- verbatim: > provided for pedestrian who come on foot to Tirumala through Gali Gopuram or Srivari Mettu. Bio-Metric counters are established on these foot paths, to facilitate free darshan, free accommodation (P.A.C.)
### Srivari Mettu
- href/detail: https://www.tirumala.org/TirumalatoTirupathiOnFoot.aspx — named pedestrian access point with bio-metric counter on the footpath
- verbatim: > who come on foot to Tirumala through Gali Gopuram or Srivari Mettu. Bio-Metric counters are established on these foot paths, to facilitate free darshan, free accommodation (P.A.C.) and free food

## https://www.tirumala.org/MoreLinks.aspx

- HTTP status: **200** | bytes: 61728 | saved: `ttd-MoreLinks.html` | accessed: 2026-10-27
- TTD 'More Links' directory page (batch 3): reviewed; NO new place names (only links to already-covered pages/services). Recorded as an honest negative so nav coverage is complete.

- Extracted: **0** (source not fetched — recorded as a limitation, not skipped silently)

## https://www.incredibleindia.gov.in/en/andhra-pradesh/tirupati/sri-venkateswara-swamy-vaari-temple

- HTTP status: **200** | bytes: 460135 | saved: `incredibleindia-sv-temple.html` | accessed: 2026-10-27
- Incredible India attraction sub-page for the main temple (batch 3): the ONLY attraction sub-link embedded in the saved Tirupati destination page. Server-rendered like the parent page. Names only the main temple (already Batch-011 candidate) — recorded for source completeness.

- Extracted **1** names:

### Sri Venkateshwara Swami Vaari Temple
- href/detail: https://www.incredibleindia.gov.in/en/andhra-pradesh/tirupati/sri-venkateswara-swamy-vaari-temple — Ministry of Tourism's own attraction sub-page (page's official spelling; same temple as Batch-011 candidate)
- verbatim: > Visit the Sri Venkateshwara Swami Vaari Temple in Tirupati | Incredible India Hi, User name My profile Logout Incredible India Content Hub Travel For LiFE Colours of India FAQs Contact

## https://tirupati.ap.gov.in/

- HTTP status: **000 — connection failed (see limitation)** | bytes: 0 | saved: `(not saved — connection failed)` | accessed: 2026-10-26
- LIMITATION: district official site unreachable from sandbox network. Single curl attempt (per task directive): curl -sSL exited with http_code=000 (connection could not be established). Not retried further. No content recorded from it.

- Extracted: **0** (source not fetched — recorded as a limitation, not skipped silently)

## https://tourism.ap.gov.in/

- HTTP status: **000 — connection failed (see limitation)** | bytes: 0 | saved: `(not saved — connection failed)` | accessed: 2026-10-26
- LIMITATION: AP Tourism official site unreachable from sandbox network. Single curl attempt (per task directive): http_code=000. Not retried further. No content recorded from it.

- Extracted: **0** (source not fetched — recorded as a limitation, not skipped silently)

## Limitations (explicit)

1. `https://tirupati.ap.gov.in/` and `https://tourism.ap.gov.in/` are network-unreachable from this sandbox (single attempt each on 2026-10-26, curl `http_code=000`). Per task directive they were NOT retried further; no content from them enters this evidence.
2. `PlacesatTirumala.aspx`, `MoreTemples.aspx`, `RestHousesInTirumala.aspx`, `ttdklmps.aspx` and `S.V. Museum.aspx` were discovered via saved nav pages in the batch-1 pass and FETCHED in the batch-2 sweep (same day, same UA + method) — all five HTTP 200; their extractions are Sources 9-13 above. `ttdklmps.aspx` was confirmed to contain ZERO Tirupati/Tirumala directory rows (pan-India table; scope finding recorded on the source itself).
3. `Places to see around Tirumala.aspx` and both accommodation pages present their lists as prose/tables WITHOUT per-place hyperlinks — names are quoted from prose; hrefOrDetail records that reality.
4. The incredibleindia.gov.in page was anticipated to be a JS-heavy Next.js shell with a `self.__next_f` payload; in reality it is **server-rendered** (AEM v2; 0 `self.__next_f` chunks, 0 `__NEXT_DATA__`), so extraction was better than expected: full narrative text + 10 attraction card links came through statically. No browser rendering was needed or used.
5. tirumala.org nav `Advance Reservation / Seva / Darshan / Accommodation` online-booking links point to `ttdevasthanams.ap.gov.in` and `tirupatibalaji.ap.gov.in` — related official domains, not fetched this pass (outside the 4-page cap).

## Self-check (extraction verification)

Re-opened the RAW saved files (not the cleaned text) and located 5 extracted names; surrounding raw-HTML text quoted verbatim below:

- **Swami Pushkarini** — FOUND in raw saved HTML.
  - surrounding text: `e, there are many other places to visit and things to admire on the Tirumala hills. Some of the must visit places in Tirumala are Swami Pushkarini, Sri Bhu Varaha Swamy temple, Sri Hathiramjee Mutt, Sri Bedi Anjaneya Swamy temple, Srivari Sikhara Darshanam, Sila Thoranam, Dha`
- **Sila Thoranam** — FOUND in raw saved HTML.
  - surrounding text: `e Swami Pushkarini, Sri Bhu Varaha Swamy temple, Sri Hathiramjee Mutt, Sri Bedi Anjaneya Swamy temple, Srivari Sikhara Darshanam, Sila Thoranam, Dharmagiri, Narayangiri, Papavinasanam, Akasa Ganga water falls, Temple Museum, Asthana Mandapams and Gogarbham Gardens.</div> <`
- **Vaikuntha Teertham** — FOUND in raw saved HTML.
  - surrounding text: `s in Tirumala, some of them are Pandava Teertham, Kumaradhara Teertham, Tumbhuru Teertham, Ramakrishna Teertham, Chakra Teertham, Vaikuntha Teertham, Sesha Teertham, Sitamma Teertham, Pasupu Teertham, Jupali Teertham, Sanaka Sanandana Teertham. Important festivals that are held`
- **Ampro Rest House** — FOUND in raw saved HTML.
  - surrounding text: `per day (INR) * </strong> </td> </tr> <tr class="RowHeight"> <td class="gridbg1">1. </td> <td class="gridbg1">Ampro Rest House <td class="gridbg1"> 750.00 <br /> 1500.00 </td> </tr> <tr class="RowHeight"> <td class="gridbg2">2. </td> <t`
- **Narayanagiri Guest House - II** — FOUND in raw saved HTML.
  - surrounding text: `2">1500.00 <br /> 2000.00 </td> </tr> <tr class="RowHeight"> <td class="gridbg1">5. </td> <td class="gridbg1">Narayanagiri Guest House - II <br /> Corner Suite </td> <td class="gridbg1">1500.00 <br /> 2000.00 </td> </tr> <tr class="RowHeight"> <td c`
- **Alwar Tank Cottage No. 99** — FOUND in raw saved HTML.
  - surrounding text: ` per day (INR) *</strong> </td> </tr> <tr class="RowHeight"> <td class="gridbg1">1. </td> <td class="gridbg1">Alwar Tank Cottage No. 99 </td> <td class="gridbg1">200.00 </td> </tr> <tr class="RowHeight"> <td class="gridbg2">2. </td> <td class="g`
- **Sri Vedanarayana Swamy Temple, Nagalapuram** — FOUND in raw saved HTML.
  - surrounding text: `Program</a> </p> </div> </div> </td> </tr> <tr> <td align="left" valign="middle"> <div class="pg-sub-header"> Sri Vedanarayana Swamy Temple, Nagalapuram </div> <div style="float: left;"> <div class="detailsAbnBody"> <p> This is one of the most important and anci`
- **Sri Kalyana Venkateswara Swamy temple, Narayanavanam** — FOUND in raw saved HTML.
  - surrounding text: `(outside temples)</div> </div> </td> </tr> <tr> <td align="left" valign="middle"> <div class="pg-sub-header"> Sri Kalyana Venkateswara Swamy temple, Narayanavanam </div> <div style="float: left;"> <div class="detailsAbnBody"> <p> It is yet another ancient temple of mythol`
- **Nandhakam Rest House** — FOUND in raw saved HTML.
  - surrounding text: `uesthouses. Such as Sri Venkateswara Rest House(SVRH), Sri Padmavathi Rest House(SPRH), HVC, GNC, PAC1, PAC2, Nandhakam Rest House, Kousthubham rest House(KTRH) and Sapthagiri Rest House(SGRH).</li> <li>Tonsuring is done at free of cost at `
- **Kousthubham rest House** — FOUND in raw saved HTML.
  - surrounding text: `i Venkateswara Rest House(SVRH), Sri Padmavathi Rest House(SPRH), HVC, GNC, PAC1, PAC2, Nandhakam Rest House, Kousthubham rest House(KTRH) and Sapthagiri Rest House(SGRH).</li> <li>Tonsuring is done at free of cost at all Kalyanakattas.</li> `
- **Sapthagiri Rest House** — FOUND in raw saved HTML.
  - surrounding text: `Sri Padmavathi Rest House(SPRH), HVC, GNC, PAC1, PAC2, Nandhakam Rest House, Kousthubham rest House(KTRH) and Sapthagiri Rest House(SGRH).</li> <li>Tonsuring is done at free of cost at all Kalyanakattas.</li> <li>Antiseptics are mixed with w`
- **SRI AGASTHEESWARA SWAMYVARI TEMPLE, THONDAWADA** — FOUND in raw saved HTML.
  - surrounding text: `AMMAVARI TEMPLE, TIRUCHANOOR <br /> • SRI KALYANA VENKATESWAA SWAMYVARI TEMPLE, SRINIVASA MANGAPURAM <br /> • SRI AGASTHEESWARA SWAMYVARI TEMPLE, THONDAWADA <br /> • SRI KAPILESWRASWAMYVARI TEMPLE, KAPILATHEERTHAM, TIRUPATI <br /> • SRI GOVINDARAJA SWAMYVARI TEMPLE,`
- **SRI PALLIKONDESWARA SWAMYVARI TEMPLE, SURUTUPALLI** — FOUND in raw saved HTML.
  - surrounding text: `OPALASWAMYVARI TEMPLE, KARVETINAGARAM <br /> • SRI KALYANAVENKAESWARASWAMYVARI TEMPLE, NARAYANAVARAM <br /> • SRI PALLIKONDESWARA SWAMYVARI TEMPLE, SURUTUPALLI <br /> • SRI VEDANARAYANASWAMYVARI TEMPLE, NAGALAPURAM <br /> • SRI KARIYA MANIKYA SWAMYVARI TMPLE, NAGARI <b`
- **SRI KASI VISESWARA SWAMYVARI TEMPLE, BUGGA** — FOUND in raw saved HTML.
  - surrounding text: ` • SRI VEDANARAYANASWAMYVARI TEMPLE, NAGALAPURAM <br /> • SRI KARIYA MANIKYA SWAMYVARI TMPLE, NAGARI <br /> • SRI KASI VISESWARA SWAMYVARI TEMPLE, BUGGA <br /> • SRI PRASANNA VENKATESWARASWAMYVARI TEMPLE, APPPALAYAGUNTA <br /><br /> <b>Note </b>: <ul> <li>The du`
- **SRI VAKULAMATHA TEMPLE** — FOUND in raw saved HTML.
  - surrounding text: `SWRASWAMYVARI TEMPLE, KAPILATHEERTHAM, TIRUPATI <br /> • SRI GOVINDARAJA SWAMYVARI TEMPLE, TIRUPATI. <br /> • SRI VAKULAMATHA TEMPLE, TIRUPATI. <br /> <br /> <b>Note </b>: <ul> <li>The duration of the tour is 5 hours and fare charged is Rs.20`
- **SRI KALYANA VENKATESWAA SWAMYVARI TEMPLE** — FOUND in raw saved HTML.
  - surrounding text: `ite railway station, Tirupati. These tours cover: </p> • SRI PADMAVATHI AMMAVARI TEMPLE, TIRUCHANOOR <br /> • SRI KALYANA VENKATESWAA SWAMYVARI TEMPLE, SRINIVASA MANGAPURAM <br /> • SRI AGASTHEESWARA SWAMYVARI TEMPLE, THONDAWADA <br /> • SRI KAPILESWRASWAMYVAR`
- **SRI KARIYA MANIKYA SWAMYVARI TMPLE** — FOUND in raw saved HTML.
  - surrounding text: `PALLIKONDESWARA SWAMYVARI TEMPLE, SURUTUPALLI <br /> • SRI VEDANARAYANASWAMYVARI TEMPLE, NAGALAPURAM <br /> • SRI KARIYA MANIKYA SWAMYVARI TMPLE, NAGARI <br /> • SRI KASI VISESWARA SWAMYVARI TEMPLE, BUGGA <br /> • SRI PRASANNA VENKATESWARASWAMYVARI TEMPL`
- **Gali Gopuram or Srivari Mettu** — FOUND in raw saved HTML.
  - surrounding text: `"Images/RightArrowBold.png" /> Token facility is provided for pedestrian who come on foot to Tirumala through Gali Gopuram or Srivari Mettu. </p> <div> <p> <img alt="" src="Images/RightArrowBold.png" /> Bio-Metric counters are established on these f`
- **SRI GOVINDARAJASWAMI TEMPLE** — FOUND in raw saved HTML.
  - surrounding text: `<td> <div id="id1"> <tr> <td align="left" valign="middle"> <div style="float: left;"> <div class="Pg-Heading">SRI GOVINDARAJASWAMI TEMPLE</div> </div> </td> </tr> <tr> <td align="left" valign="middle"> <div style="float: left;"> <div class="detail`
- **SRI KAPILESWARA SWAMY TEMPLE** — FOUND in raw saved HTML.
  - surrounding text: `<td> <div id="id5"> <tr> <td align="left" valign="middle"> <div style="float: left;"> <div class="Pg-Heading">SRI KAPILESWARA SWAMY TEMPLE</div> </div> </td> </tr> <tr> <td align="left" valign="middle"> <div class="pg-sub-header">History of Sri Kap`

### Full quote-integrity re-verification (programmatic)

- 185/185 verbatim quotes re-located word-for-word inside their saved page's visible text (same tag-stripped, entity-unescaped, whitespace-collapsed normalization used to cut them). 0 mismatches.

*Generated by extract_official_sources.py (this directory); input = the saved raw HTML files fetched on 2026-10-26.*
