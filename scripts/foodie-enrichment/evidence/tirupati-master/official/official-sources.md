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
| 9 | https://tirupati.ap.gov.in/ | 000 (connection failed) | 0 | (not saved — connection failed) |
| 10 | https://tourism.ap.gov.in/ | 000 (connection failed) | 0 | (not saved — connection failed) |

Extraction totals (place/temple/accommodation names): `places-to-visit.html`=10, `temples-at-tirupati.html`=24, `home.html`=11, `places-around-tirumala.html`=24, `accommodation-tirumala.html`=6, `accommodation-tirupati.html`=7, `temples-at-tiruchanoor.html`=6, `incredibleindia-tirupati.html`=15, `(not saved — connection failed)`=0, `(not saved — connection failed)`=0

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
2. `PlacesatTirumala.aspx` (teerthams/places in and around Tirumala), `MoreTemples.aspx`, `RestHousesInTirumala.aspx`, `ttdklmps.aspx` and `S.V. Museum.aspx` were DISCOVERED via saved nav pages (URLs recorded above) but NOT fetched — the task capped extra tirumala.org fetches at 4 and the cap was used on the two Accommodation pages, 'Places to see around Tirumala' and TemplesAtTiruchanoor. They remain the next official candidates.
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
- **SRI GOVINDARAJASWAMI TEMPLE** — FOUND in raw saved HTML.
  - surrounding text: `<td> <div id="id1"> <tr> <td align="left" valign="middle"> <div style="float: left;"> <div class="Pg-Heading">SRI GOVINDARAJASWAMI TEMPLE</div> </div> </td> </tr> <tr> <td align="left" valign="middle"> <div style="float: left;"> <div class="detail`
- **SRI KAPILESWARA SWAMY TEMPLE** — FOUND in raw saved HTML.
  - surrounding text: `<td> <div id="id5"> <tr> <td align="left" valign="middle"> <div style="float: left;"> <div class="Pg-Heading">SRI KAPILESWARA SWAMY TEMPLE</div> </div> </td> </tr> <tr> <td align="left" valign="middle"> <div class="pg-sub-header">History of Sri Kap`

### Full quote-integrity re-verification (programmatic)

- 103/103 verbatim quotes re-located word-for-word inside their saved page's visible text (same tag-stripped, entity-unescaped, whitespace-collapsed normalization used to cut them). 0 mismatches.

*Generated by extract_official_sources.py (this directory); input = the saved raw HTML files fetched on 2026-10-26.*
