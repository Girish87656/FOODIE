#!/usr/bin/env python3
"""
TIR-3c — OFFICIAL source pages sweep: extraction script.

Reads the saved raw HTML files in this directory (fetched 2026-10-26 with
User-Agent "FOODIE-Research/1.0 (place-discovery-audit)") and produces:
  - official-sources.json  (structured extraction with verbatim quotes)
  - official-sources.md    (human-readable per-source notes + self-check)

Honesty contract: every extracted name below was located by this script inside
the saved HTML at run time; verbatimQuote windows are cut from the page's own
visible text (whitespace-collapsed, HTML entities unescaped — documented
normalization, no wording changes). If a name is NOT found, the script records
quote=null for that entry instead of inventing text.
"""
import html as htmllib
import json
import re
import subprocess
from pathlib import Path

DIR = Path(__file__).resolve().parent
ACCESSED = "2026-10-26"
UA = "FOODIE-Research/1.0 (place-discovery-audit)"
BASE_TTD = "https://www.tirumala.org/"
BASE_II = "https://www.incredibleindia.gov.in"


def fetch_size(name: str) -> int:
    return (DIR / name).stat().st_size


def status_of(name: str) -> str:
    """Re-derive status from the fetch log embedded in md? No — statuses were
    captured live during fetch; they are hard-coded in SOURCES below."""
    return ""


def clean_text(raw_html: str) -> str:
    body = re.sub(r"<script.*?</script>", " ", raw_html, flags=re.S | re.I)
    body = re.sub(r"<style.*?</style>", " ", body, flags=re.S | re.I)
    body = re.sub(r"<!--.*?-->", " ", body, flags=re.S)
    text = re.sub(r"<[^>]+>", "\n", body)
    text = htmllib.unescape(text)
    text = text.replace("\xa0", " ")
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def make_quote(text: str, name: str, maxwords: int = 30, occurrence: int = 1):
    """Return a <=30-word verbatim window from `text` containing `name`.
    occurrence=N picks the Nth appearance in the text (1-based)."""
    if not name:
        return None
    pat = re.compile(re.escape(name).replace(r"\ ", r"\s+"), re.I)
    ms = list(pat.finditer(text))
    if len(ms) < occurrence:
        return None
    m = ms[occurrence - 1]
    if not m:
        return None
    words = text.split(" ")
    # map char offsets -> word index
    starts = []
    pos = 0
    for w in words:
        starts.append(pos)
        pos += len(w) + 1
    # word index containing match start / end
    wi = max(i for i, s in enumerate(starts) if s <= m.start())
    wj = min(i for i, s in enumerate(starts) if s + len(words[i]) >= m.end())
    before = maxwords // 3
    lo = max(0, wi - before)
    hi = lo + maxwords
    if hi <= wj:
        hi = wj + 1
        lo = max(0, hi - maxwords)
    return " ".join(words[lo:hi]).strip()


def entry(text, name, href, maxwords=30, occurrence=1):
    return {"name": name, "hrefOrDetail": href,
            "verbatimQuote": make_quote(text, name, maxwords, occurrence)}


def ttd(href: str) -> str:
    return BASE_TTD + href


# --------------------------------------------------------------------------
# Load saved pages
# --------------------------------------------------------------------------
P = {}
for key, fn in {
    "ptv": "places-to-visit.html",
    "tat": "temples-at-tirupati.html",
    "home": "home.html",
    "pat": "places-around-tirumala.html",
    "acct": "accommodation-tirumala.html",
    "accp": "accommodation-tirupati.html",
    "tch": "temples-at-tiruchanoor.html",
    "ii": "incredibleindia-tirupati.html",
    # batch-2 fetches (same session day, same UA + method)
    "ptm": "ttd-PlacesatTirumala.html",
    "svm": "ttd-S.V.-Museum.html",
    "rh": "ttd-RestHousesInTirumala.html",
    "kl": "ttd-ttdklmps.html",
    "mt": "ttd-MoreTemples.html",
}.items():
    P[key] = clean_text((DIR / fn).read_text(encoding="utf-8", errors="replace"))

SOURCES = []

# ---------------------------------------------------------------- Source 1
ptv = [
    entry(P["ptv"], "Places in and around Tirumala", ttd("PlacesatTirumala.aspx")),
    entry(P["ptv"], "Sri Bhu Varaha Swamy Temple",
          "left-nav heading 'At Tirumala' (no own href on this page; block links: " + ttd("Varaha_TempleLegend.aspx") + ")"),
    entry(P["ptv"], "Sri Bedi Anjaneya Swamy Temple",
          "left-nav heading 'At Tirumala' (no own href on this page; block links: " + ttd("Anjaneya_TempleLegend.aspx") + ")"),
    entry(P["ptv"], "Sri Padmavathi Ammavari Temple",
          "left-nav heading 'At Tiruchanoor' (no own href on this page; block links: " + ttd("TemplesAtTiruchanoor.aspx") + ")"),
    entry(P["ptv"], "Sri Govindarajaswami Temple", ttd("TemplesAtTirupathi.aspx#id1")),
    entry(P["ptv"], "Srivari Padalamandapam Temple", ttd("TemplesAtTirupathi.aspx#id2")),
    entry(P["ptv"], "Sri Lakshmi Narayana Swamy Temple", ttd("TemplesAtTirupathi.aspx#id3")),
    entry(P["ptv"], "Sri Vinayaka Swamy Temple", ttd("TemplesAtTirupathi.aspx#id4")),
    entry(P["ptv"], "Sri Kapliswaraswamy Temple", ttd("TemplesAtTirupathi.aspx#id5")),
    entry(P["ptv"], "Sri Kodandarama Swamy Temple", ttd("TemplesAtTirupathi.aspx#id6")),
]
SOURCES.append({
    "sourceUrl": ttd("PlacesToVisit.aspx"), "httpStatus": 200,
    "accessedOn": ACCESSED, "page": "places-to-visit.html",
    "pageSizeBytes": fetch_size("places-to-visit.html"),
    "note": "TTD official hub page 'Places to Visit'. Left-nav temple directory + section link to PlacesatTirumala.aspx.",
    "extracted": ptv,
})

# ---------------------------------------------------------------- Source 2
tat_names = [
    "Sri Govindarajaswami Temple",
    "Srivari Padala Mandapam, Alipiri",
    "Sri Lakshmi Narayana Swamy Temple",
    "Sri Vinayaka Swamy Temple, 2nd Ghat Road",
    "Sri Kapileswara Swamy Temple",
    "Sri Kodanda Ramaswamy Temple",
    "Sri Partha Sarathi Swamy Temple",
    "Sri Kalyana Venkateswara Swamy Temple",
    "Sri Choodikudutha Nachiyar Ammavari Temple(SriAndal)",
    "Sri Salai Nachiyar Ammavari Temple(Sri Pundarikavalli Temple)",
    "Sri Bhasyakarla vari Temple",
    "Sri Anajaneya swamy Temple near(opposite) Dwajasthambham",
    "Sri Thirumangai Alwar Temple",
    "Sri Kurath Alwar Temple",
    "Sri Madhurakavi and Ananda Alwar Temple",
    "Sri Chakrathalwar Temple",
    "Sri Mudal Alwar Temple",
    "Sri Manavala Mahamuni Temple",
    "Sri Vedantha Desikar Temple",
    "Sri Anjaneya Swamy Vari Temple",
    "Sri Nammalwar Temple",
    "Sri Sanjeevaraya swamy Temple( Mattam Anjaneya Swamy Temple)",
    "Sri Tirumala Nambi Sannidhi",
    "Sri Lakshmi Narayana Swamy Temple, G.S. Mada Street, Tirupati(taken over temple)",
]
tat = [
    entry(P["tat"], n,
          ttd("TemplesAtTirupathi.aspx") + ("#id1..id6 main sections" if i < 6 else " — numbered sub-temple list inside Sri Govindarajaswami Temple premises (no individual href)"),
          occurrence=1)  # full '…G.S. Mada Street…(taken over temple)' string is unique in page text
    for i, n in enumerate(tat_names)
]
SOURCES.append({
    "sourceUrl": ttd("TemplesAtTirupathi.aspx"), "httpStatus": 200,
    "accessedOn": ACCESSED, "page": "temples-at-tirupati.html",
    "pageSizeBytes": fetch_size("temples-at-tirupati.html"),
    "note": "TTD official page: 6 main TTD-managed Tirupati temples (anchors id1-id6) + 16-18 numbered sub-temples in the Govindarajaswami premises.",
    "extracted": tat,
})

# ---------------------------------------------------------------- Source 3 (home nav)
home_nav = [
    ("Places to Visit", "PlacesToVisit.aspx"),
    ("Places to Visit Around Tirumala", "Places to see around Tirumala.aspx"),
    ("Sri Govindarajaswami Temple", "TemplesAtTirupathi.aspx"),
    ("More Temples", "TemplesAtTiruchanoor.aspx"),
    ("more..", "MoreTemples.aspx"),
    ("Accommodation", "AccommodationAtTirumala.aspx"),
    ("Accommodation", "AccommodationAtTirupati.aspx"),
    ("Rest Houses", "RestHousesInTirumala.aspx"),
    ("TTD Kalyana Mandapams", "ttdklmps.aspx"),
    ("Package Tours", "PackageTours.aspx"),
    ("S.V. Museum", "S.V. Museum.aspx"),
]
home = [
    entry(P["home"], label, ttd(href), maxwords=14) for label, href in home_nav
]
SOURCES.append({
    "sourceUrl": ttd(""), "httpStatus": 200,
    "accessedOn": ACCESSED, "page": "home.html",
    "pageSizeBytes": fetch_size("home.html"),
    "note": "TTD homepage: fetched for nav discovery. Body is news/announcements; value = nav links to other official place/temple/accommodation pages. Nav labels quoted; 'name' here = nav label, not a place claim.",
    "extracted": home,
})

# ---------------------------------------------------------------- Source 4
pat_names = [
    "Swami Pushkarini", "Sri Bhu Varaha Swamy temple", "Sri Hathiramjee Mutt",
    "Sri Bedi Anjaneya Swamy temple", "Srivari Sikhara Darshanam", "Sila Thoranam",
    "Dharmagiri", "Narayangiri", "Papavinasanam", "Akasa Ganga water falls",
    "Temple Museum", "Asthana Mandapams", "Gogarbham Gardens",
    "Pandava Teertham", "Kumaradhara Teertham", "Tumbhuru Teertham",
    "Ramakrishna Teertham", "Chakra Teertham", "Vaikuntha Teertham",
    "Sesha Teertham", "Sitamma Teertham", "Pasupu Teertham", "Jupali Teertham",
    "Sanaka Sanandana Teertham",
]
pat = [
    entry(P["pat"], n,
          "prose list on page (no individual href); page: " + ttd("Places%20to%20see%20around%20Tirumala.aspx"))
    for n in pat_names
]
SOURCES.append({
    "sourceUrl": ttd("Places%20to%20see%20around%20Tirumala.aspx"), "httpStatus": 200,
    "accessedOn": ACCESSED, "page": "places-around-tirumala.html",
    "pageSizeBytes": fetch_size("places-around-tirumala.html"),
    "note": "TTD official 'Places To Visit Around Tirumala': 13 must-visit places + 11 named teerthams, both as prose lists (no per-place links).",
    "extracted": pat,
})

# ---------------------------------------------------------------- Source 5
acct_names = [
    "Sri Padmavathi Guest House area - Tirumala",
    "Sri Venkateswara Guest House area - Tirumala",
    "Varahaswami Guest House, Rambagicha, HUDC, Travellers Bungalows Cottages Area",
    "Marriage Halls and Cottages",
]
acct = [entry(P["acct"], n, "accommodation category area (no individual href)") for n in acct_names]
acct.append({
    "name": "Free choultries (category)",
    "hrefOrDetail": "accommodation type — prose; contact Central Reception Office, near the bus stand in Tirumala",
    "verbatimQuote": make_quote(P["acct"], "There are several large choultries with free rooms", 30),
})
acct.append({
    "name": "Dormitory Halls (category)",
    "hrefOrDetail": "accommodation type — prose (TTD dormitory halls)",
    "verbatimQuote": make_quote(P["acct"], "Dormitory Halls provided by TTD", 30),
})
SOURCES.append({
    "sourceUrl": ttd("AccommodationAtTirumala.aspx"), "httpStatus": 200,
    "accessedOn": ACCESSED, "page": "accommodation-tirumala.html",
    "pageSizeBytes": fetch_size("accommodation-tirumala.html"),
    "note": "TTD official accommodation page for Tirumala: 4 named guest-house/cottage AREAS + free choultries & dormitory halls described in prose. No individual named choultry list on this page.",
    "extracted": acct,
})

# ---------------------------------------------------------------- Source 6
accp_names = [
    "Sreenivasam Complex", "Madhavam Guest House", "Sri Venkateswara Dharmasala",
    "Sri Venkateswara Guest House", "Sri Govindaraja Dharmasala (2ndNC)",
    "Sri Kodanda rama Swamy Dharmasala (3rdNC)", "Vishnu Nivasam",
]
accp = [
    entry(P["accp"], n, "named paid TTD accommodation at Tirupati (rates table on page; no individual href)")
    for n in accp_names
]
SOURCES.append({
    "sourceUrl": ttd("AccommodationAtTirupati.aspx"), "httpStatus": 200,
    "accessedOn": ACCESSED, "page": "accommodation-tirupati.html",
    "pageSizeBytes": fetch_size("accommodation-tirupati.html"),
    "note": "TTD official accommodation page for Tirupati: 7 named choultries/guest houses with contact + rates (Rs.50-1300) in the page tables.",
    "extracted": accp,
})

# ---------------------------------------------------------------- Source 7
tch_names = [
    "Sri Krishna Swamy Temple, (Alagiyaperumal Shrine),Tiruchanoor",
    "Sri Sundaraja Swamy Temple, (Varada Raja Shrine), Tiruchanoor",
    "Sri Suryanarayana Swamy Temple",
    "Sri Prasanna Venkateswara Swamy Temple, Appalayagunta",
    "Sridevi Bhudevi Sametha Venkateswara Swamy Temple, Thondamanadu",
]
tch = [
    entry(P["tch"], n, "section heading on page (no individual href); page: " + ttd("TemplesAtTiruchanoor.aspx"))
    for n in tch_names
]
tch.append(entry(P["tch"], "Sri Padmavathi Ammavari Temple",
                 "context mention — sub-shrines described as inside its compound at Tiruchanoor"))
SOURCES.append({
    "sourceUrl": ttd("TemplesAtTiruchanoor.aspx"), "httpStatus": 200,
    "accessedOn": ACCESSED, "page": "temples-at-tiruchanoor.html",
    "pageSizeBytes": fetch_size("temples-at-tiruchanoor.html"),
    "note": "TTD official Tiruchanoor (Sri Padmavathi) page: 2 sub-shrines inside the Padmavathi compound + Suryanarayana (opposite Padma Sarovaram) + 2 outside temples under SRI PAT (Appalayagunta, Thondamanadu).",
    "extracted": tch,
})

# ---------------------------------------------------------------- Source 8
ii_base = BASE_II + "/en/andhra-pradesh/tirupati/"
ii_cards = [
    ("Padmavathi Temple", "padmavathi-temple"),
    ("Silathoranam", "silathoranam"),
    ("Sri Govindaraja Swamy Temple", "sri-govindaraja-swamy-temple"),
    ("Chandragiri Fort", "chandragiri-fort"),
    ("Sri Venkateswara National Park", "sri-venkateswara-national-park"),
    ("Sri Venkateswara Swamy Vaari Temple", "sri-venkateswara-swamy-vaari-temple"),
    ("Srikalahasti Temple", "srikalahasti-temple"),
    ("Talakona Waterfall", "talakona-waterfall"),
    ("Kailasakona Waterfall", "kailasakona-waterfall"),
    ("Regional Science Centre", "regional-science-centre"),
]
ii = [entry(P["ii"], n, ii_base + slug) for n, slug in ii_cards]
ii += [
    entry(P["ii"], "Srivari Padalu", "narrative mention only (no link on this page)"),
    entry(P["ii"], "Akasaganga Theertham", "narrative mention only (no link on this page)"),
    entry(P["ii"], "Papavinasam", "narrative mention only (no link on this page)"),
    entry(P["ii"], "Chakra Theertham", "narrative mention only — 'sacred waterfall surrounded by shrines'"),
    entry(P["ii"], "Tirumala Temple", "narrative mention only"),
]
SOURCES.append({
    "sourceUrl": BASE_II + "/en/andhra-pradesh/tirupati", "httpStatus": 200,
    "accessedOn": ACCESSED, "page": "incredibleindia-tirupati.html",
    "pageSizeBytes": fetch_size("incredibleindia-tirupati.html"),
    "note": "Ministry of Tourism 'Incredible India' Tirupati destination page. NOT a Next.js shell as anticipated: server-rendered HTML (AEM path content/incredible-india-v2; 0 self.__next_f chunks, 0 __NEXT_DATA__) — full text + 10 attraction card links extractable.",
    "extracted": ii,
})

# ---------------------------------------------------------------- Source 9 (batch 2)
# PlacesatTirumala.aspx — fetched in the batch-2 sweep (same UA + method).
ptm = [
    entry(P["ptm"], "Sri Venkateswara Temple", ttd("PlacesatTirumala.aspx") + " — main temple section"),
    entry(P["ptm"], "Sri Varaha Swami Temple", ttd("PlacesatTirumala.aspx") + " — section: north of the Sri Venkateswara Temple, banks of Varaha Pushkarini"),
    entry(P["ptm"], "Sri Bedi AnjaneyaswamiTemple", ttd("PlacesatTirumala.aspx") + " — section: Sannidhi Street, opposite the main temple (page writes this name without a space)"),
    entry(P["ptm"], "Sri Anjaneyaswami Temple", ttd("PlacesatTirumala.aspx") + " — section: opposite the Pushkarini, at Sri Varahaswami temple (DISTINCT from Bedi Anjaneyaswami per the page itself)"),
    entry(P["ptm"], "Swami Pushkarini", ttd("PlacesatTirumala.aspx") + " — teerthams section", occurrence=1),
    entry(P["ptm"], "Silathoranam", ttd("PlacesatTirumala.aspx") + " — 'Other Places' section (natural rock arch near Chakra Tirtham)"),
]
SOURCES.append({
    "sourceUrl": ttd("PlacesatTirumala.aspx"), "httpStatus": 200,
    "accessedOn": ACCESSED, "page": "ttd-PlacesatTirumala.html",
    "pageSizeBytes": fetch_size("ttd-PlacesatTirumala.html"),
    "note": "TTD official 'Places at Tirumala' (batch 2). 4 named temples (incl. TWO distinct Anjaneya temples per the page's own prose) + Swami Pushkarini + Silathoranam.",
    "extracted": ptm,
})

# ---------------------------------------------------------------- Source 10 (batch 2)
svm = [
    entry(P["svm"], "S.V. Museum", ttd("S.V. Museum.aspx") + " — page subject", occurrence=2),
    entry(P["svm"], "Sri Venkateswara Dhyana Jnana Mandiram", ttd("S.V. Museum.aspx") + " — official building name (opposite Vaikuntham Queue Complex, Tirumala)"),
]
SOURCES.append({
    "sourceUrl": ttd("S.V. Museum.aspx"), "httpStatus": 200,
    "accessedOn": ACCESSED, "page": "ttd-S.V.-Museum.html",
    "pageSizeBytes": fetch_size("ttd-S.V.-Museum.html"),
    "note": "TTD official S.V. Museum page (batch 2): museum officially named Sri Venkateswara Dhyana Jnana Mandiram, Tirumala; 6000+ items, ten sections.",
    "extracted": svm,
})

# ---------------------------------------------------------------- Source 11 (batch 2)
rh_names = [
    # Sri Padmavathi Guest House Area (15 rows)
    "Ampro Rest House", "Bela Kuteeram A/C", "Gayathri Sadan A/C", "Hari Sadan Guest House A/C",
    "Hill View Cottages Deluxe", "Indira Rest House A/C", "Jagannadha Bhavan", "Karam Nivas",
    "Lakshmi Nivas", "RajyaLakshmi Guest House A/C", "SP Guest House (Main)", "Srinikethan A/C",
    "Srinivasa Nilayam A/C", "Venkata Vijayam Guest House A/C", "Vidya Sadan",
    # Sri Venkateswara Guest House Area (named rows; NGC/VVGH/HRG/MBC code-style row deliberately NOT extracted — booking codes, not place names)
    "Sri Venkateswara Guest House Corner Suites",
    "Narayanagiri Guest House - I", "Narayanagiri Guest House - II", "Narayanagiri Guest House - III",
    "Srivari Kuteer Guest House", "Surapuram Thota Cottages",
    # Travellers Bungalow Cottages Area (12 rows)
    "Alwar Tank Cottages", "Anjanadri Nagar Cottages", "Garudadri Nagar Cottages",
    "Hill View Cottages (Ordinary)", "Mangala Bavi Cottages",
    "Ram Bagicha Guest House - I", "Ram Bagicha Guest House - II", "Ram Bagicha Guest House - III",
    "Sanku Mitta Cottages", "Seshadri Nagar Cottages", "TB Cottages", "Valley View Cottages",
    # Marriage Halls and Cottages section (3 rows)
    "Alwar Tank Cottage No. 99",
]
rh = [
    entry(P["rh"], n, "named TTD rest-house/cottage row in a rates table (no individual href); page: " + ttd("RestHousesInTirumala.aspx"))
    for n in rh_names
]
SOURCES.append({
    "sourceUrl": ttd("RestHousesInTirumala.aspx"), "httpStatus": 200,
    "accessedOn": ACCESSED, "page": "ttd-RestHousesInTirumala.html",
    "pageSizeBytes": fetch_size("ttd-RestHousesInTirumala.html"),
    "note": "TTD official Rest Houses in Tirumala (batch 2): 34 named rows across 4 sections (Sri Padmavathi GH Area 15, Sri Venkateswara GH Area 6 named, TBC Area 12, Marriage Halls 1 new name) with official rates. NOT extracted (recorded here instead): 'NGC VVGH HRG MBC Cottages' row — internal booking codes, not a place name.",
    "extracted": rh,
})

# ---------------------------------------------------------------- Source 12 (batch 2)
kl = [
    entry(P["kl"], "Kalyana Mandapams", ttd("ttdklmps.aspx") + " — page subject (pan-India directory; page heading: 'TTD Information Centres and Kalyana Mandapams')"),
    entry(P["kl"], "Bangalore", ttd("ttdklmps.aspx") + " — example directory row: 'Manager TTD Information Centre 16th Cross, Vyalikavel Bangalore - 560 003'"),
]
SOURCES.append({
    "sourceUrl": ttd("ttdklmps.aspx"), "httpStatus": 200,
    "accessedOn": ACCESSED, "page": "ttd-ttdklmps.html",
    "pageSizeBytes": fetch_size("ttd-ttdklmps.html"),
    "note": "TTD official Kalyana Mandapam directory (batch 2): ~160 rows across Indian cities/towns. SCOPE FINDING: ZERO Tirupati or Tirumala rows in the directory table (checked programmatically — 'Tirupati'/'Tirumala' hits are all page-nav text, not table rows). Page reviewed and recorded; NO candidates from it — out of Tirupati scope by the page's own content.",
    "extracted": kl,
})

# ---------------------------------------------------------------- Source 13 (batch 2)
mt_region = [
    entry(P["mt"], "Sri Prasanna Venkateswara Swamy temple, Kosuvari Palle", ttd("MoreTemples.aspx") + " — prose section (TTD-managed, Tirupati region)"),
    entry(P["mt"], "Sri Konetiraya Swamy, Keelapatla", ttd("MoreTemples.aspx") + " — prose section (village Keelapatla; TTD-managed)"),
    entry(P["mt"], "Sri Kalyana Venkateswara Swamy temple, Narayanavanam", ttd("MoreTemples.aspx") + " — prose section (DISTINCT from the Srinivasa Mangapuram Kalyana Venkateswara temple)"),
    entry(P["mt"], "Sri Vedanarayana Swamy Temple, Nagalapuram", ttd("MoreTemples.aspx") + " — prose section"),
    entry(P["mt"], "Sri Venugopala Swamy Vari temple, Karvetinagaram", ttd("MoreTemples.aspx") + " — prose section (rates table spells the village 'Karveti Nagaram')"),
    entry(P["mt"], "Sri Karivarada Raja Swamy vari temple, Satravada", ttd("MoreTemples.aspx") + " — prose section (rates table also carries 'Sri Kati Varadaraja Swamy Temple, Sathravada' — same-village name ambiguity flagged for review, not resolved here)"),
    entry(P["mt"], "Sri Kodandarama Swamy Temple, Tirupati", ttd("MoreTemples.aspx") + " — rates-table row (Tirupati city)"),
    entry(P["mt"], "Sri Kari Manikya Swamy Temple, Nagari", ttd("MoreTemples.aspx") + " — rates-table row"),
    entry(P["mt"], "Sri Lakshmi Narasimha Swamy temple, Tarigonda", ttd("MoreTemples.aspx") + " — prose section (TTD-managed)"),
]
mt_sub = [
    entry(P["mt"], "Sri Ranganatha Temple", "'Other sub-temples in Pattabhiramalayam' prose list — Pattabhiramalayam's own location is NOT stated on this page; recorded, not mapped to an area"),
    entry(P["mt"], "Sri Panduranga Vittaleshwara Swamy temple", "'Other sub-temples in Pattabhiramalayam' prose list — location not stated on page"),
    entry(P["mt"], "Sri Mahalakshmi Temple", "'Other sub-temples in Pattabhiramalayam' prose list — location not stated on page"),
    entry(P["mt"], "Sri Veeranjaneya Swamy temple", "'Other sub-temples in Pattabhiramalayam' prose list — location not stated on page"),
]
mt_out = [
    entry(P["mt"], "Sri Narapura Venkateswara Swamy vari Temple, Jammalamadugu", "OUT-OF-REGION: Jammalamadugu, YSR Kadapa district (~200 km) — TTD-managed but NOT a Tirupati-region destination; recorded, not an inventory candidate"),
    entry(P["mt"], "Sri Siddeswara Swamy Vari Temple, Thallapaka", "OUT-OF-REGION: Thallapaka, Rajampeta Mandal, YSR Kadapa district — recorded, not an inventory candidate"),
]
SOURCES.append({
    "sourceUrl": ttd("MoreTemples.aspx"), "httpStatus": 200,
    "accessedOn": ACCESSED, "page": "ttd-MoreTemples.html",
    "pageSizeBytes": fetch_size("ttd-MoreTemples.html"),
    "note": "TTD official 'More Temples' (batch 2): 9 Tirupati-region TTD-managed temple candidates + 4 sub-temple names 'in Pattabhiramalayam' (location unstated on page — kept as evidence only) + 2 OUT-OF-REGION Kadapa temples (recorded, excluded from inventory by scope).",
    "extracted": mt_region + mt_sub + mt_out,
})

# ---------------------------------------------------------------- Blocked sources
SOURCES.append({
    "sourceUrl": "https://tirupati.ap.gov.in/", "httpStatus": 0,
    "accessedOn": ACCESSED, "page": "(not saved — connection failed)",
    "pageSizeBytes": 0,
    "note": "LIMITATION: district official site unreachable from sandbox network. Single curl attempt (per task directive): curl -sSL exited with http_code=000 (connection could not be established). Not retried further. No content recorded from it.",
    "extracted": [],
})
SOURCES.append({
    "sourceUrl": "https://tourism.ap.gov.in/", "httpStatus": 0,
    "accessedOn": ACCESSED, "page": "(not saved — connection failed)",
    "pageSizeBytes": 0,
    "note": "LIMITATION: AP Tourism official site unreachable from sandbox network. Single curl attempt (per task directive): http_code=000. Not retried further. No content recorded from it.",
    "extracted": [],
})

# --------------------------------------------------------------------------
# SELF-CHECK: re-open ONE saved HTML file raw and verify 3 extracted names
# --------------------------------------------------------------------------
raw_pat = (DIR / "places-around-tirumala.html").read_text(encoding="utf-8", errors="replace")
raw_pat_flat = htmllib.unescape(re.sub(r"\s+", " ", raw_pat))
selfcheck = []
for nm in ["Swami Pushkarini", "Sila Thoranam", "Vaikuntha Teertham"]:
    i = raw_pat_flat.find(nm)
    if i >= 0:
        ctx = raw_pat_flat[max(0, i - 130): i + len(nm) + 130]
        ctx = re.sub(r"\s+", " ", ctx)
        selfcheck.append({"name": nm, "foundInRawHtml": True, "context": ctx})
    else:
        selfcheck.append({"name": nm, "foundInRawHtml": False, "context": None})

# Also cross-check batch-2 names in their raw saved files
raw_rh = (DIR / "ttd-RestHousesInTirumala.html").read_text(encoding="utf-8", errors="replace")
raw_rh_flat = htmllib.unescape(re.sub(r"\s+", " ", raw_rh))
for nm in ["Ampro Rest House", "Narayanagiri Guest House - II", "Alwar Tank Cottage No. 99"]:
    i = raw_rh_flat.find(nm)
    if i >= 0:
        ctx = raw_rh_flat[max(0, i - 110): i + len(nm) + 110]
        ctx = re.sub(r"\s+", " ", ctx)
        selfcheck.append({"name": nm, "foundInRawHtml": True, "context": ctx})
    else:
        selfcheck.append({"name": nm, "foundInRawHtml": False, "context": None})

raw_mt = (DIR / "ttd-MoreTemples.html").read_text(encoding="utf-8", errors="replace")
raw_mt_flat = htmllib.unescape(re.sub(r"\s+", " ", raw_mt))
for nm in ["Sri Vedanarayana Swamy Temple, Nagalapuram", "Sri Kalyana Venkateswara Swamy temple, Narayanavanam"]:
    i = raw_mt_flat.find(nm)
    if i >= 0:
        ctx = raw_mt_flat[max(0, i - 110): i + len(nm) + 110]
        ctx = re.sub(r"\s+", " ", ctx)
        selfcheck.append({"name": nm, "foundInRawHtml": True, "context": ctx})
    else:
        selfcheck.append({"name": nm, "foundInRawHtml": False, "context": None})

# Also cross-check 2 names in temples-at-tirupati.html raw
raw_tat = (DIR / "temples-at-tirupati.html").read_text(encoding="utf-8", errors="replace")
raw_tat_flat = htmllib.unescape(re.sub(r"\s+", " ", raw_tat))
for nm in ["SRI GOVINDARAJASWAMI TEMPLE", "Sri Kodanda rama Swamy Dharmasala"]:
    pass  # (Kodanda rama Dharmasala belongs to accommodation file; kept to 1 file per task)
for nm in ["SRI GOVINDARAJASWAMI TEMPLE", "SRI KAPILESWARA SWAMY TEMPLE"]:
    i = raw_tat_flat.find(nm)
    if i >= 0:
        ctx = raw_tat_flat[max(0, i - 110): i + len(nm) + 110]
        ctx = re.sub(r"\s+", " ", ctx)
        selfcheck.append({"name": nm, "foundInRawHtml": True, "context": ctx})
    else:
        selfcheck.append({"name": nm, "foundInRawHtml": False, "context": None})

# --------------------------------------------------------------------------
# Write JSON
# --------------------------------------------------------------------------
out_json = DIR / "official-sources.json"
out_json.write_text(json.dumps({
    "task": "TIR-3c OFFICIAL source pages sweep",
    "userAgent": UA,
    "accessedOn": ACCESSED,
    "normalization": "verbatimQuote windows are cut from page visible text after removing tags/scripts, unescaping HTML entities and collapsing whitespace; wording untouched. quote=null means the name string was not located (nothing invented).",
    "selfCheck": selfcheck,
    "sources": SOURCES,
}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

# --------------------------------------------------------------------------
# Write Markdown
# --------------------------------------------------------------------------
def fmt_quote(q):
    if q is None:
        return "_name string not located in page text — quote omitted (nothing invented)_"
    return ">" + " " + q

lines = []
lines.append("# TIR-3c — OFFICIAL Source Pages Sweep (Tirupati/Tirumala)")
lines.append("")
lines.append(f"- Access date: {ACCESSED} (UTC)")
lines.append(f'- Fetch command pattern: `curl -sSL -A "{UA}" -o <file> <url>`')
lines.append(f"- Evidence dir: `scripts/foodie-enrichment/evidence/tirupati-master/official/`")
lines.append("- Honesty contract: only what was actually fetched is recorded. Verbatim quotes are cut from the saved pages' own text (tags stripped, entities unescaped, whitespace collapsed — wording untouched). Nothing substituted from memory.")
lines.append("")
lines.append("## Fetch summary")
lines.append("")
lines.append("| # | URL | HTTP | Bytes | Saved as |")
lines.append("|---|-----|------|-------|----------|")
for i, s in enumerate(SOURCES, 1):
    saved = s["page"]
    status = s["httpStatus"] if s["httpStatus"] else "000 (connection failed)"
    lines.append(f"| {i} | {s['sourceUrl']} | {status} | {s['pageSizeBytes']} | {saved} |")
lines.append("")
lines.append("Extraction totals (place/temple/accommodation names): " + ", ".join(
    f"`{s['page']}`={len([e for e in s['extracted']])}" for s in SOURCES))
lines.append("")

for s in SOURCES:
    lines.append(f"## {s['sourceUrl']}")
    lines.append("")
    status = s["httpStatus"] if s["httpStatus"] else "000 — connection failed (see limitation)"
    lines.append(f"- HTTP status: **{status}** | bytes: {s['pageSizeBytes']} | saved: `{s['page']}` | accessed: {s['accessedOn']}")
    lines.append(f"- {s['note']}")
    lines.append("")
    if not s["extracted"]:
        lines.append("- Extracted: **0** (source not fetched — recorded as a limitation, not skipped silently)")
        lines.append("")
        continue
    lines.append(f"- Extracted **{len(s['extracted'])}** names:")
    lines.append("")
    for e in s["extracted"]:
        lines.append(f"### {e['name']}")
        lines.append(f"- href/detail: {e['hrefOrDetail']}")
        lines.append(f"- verbatim: {fmt_quote(e['verbatimQuote'])}")
    lines.append("")

lines.append("## Limitations (explicit)")
lines.append("")
lines.append("1. `https://tirupati.ap.gov.in/` and `https://tourism.ap.gov.in/` are network-unreachable from this sandbox (single attempt each on " + ACCESSED + ", curl `http_code=000`). Per task directive they were NOT retried further; no content from them enters this evidence.")
lines.append("2. `PlacesatTirumala.aspx`, `MoreTemples.aspx`, `RestHousesInTirumala.aspx`, `ttdklmps.aspx` and `S.V. Museum.aspx` were discovered via saved nav pages in the batch-1 pass and FETCHED in the batch-2 sweep (same day, same UA + method) — all five HTTP 200; their extractions are Sources 9-13 above. `ttdklmps.aspx` was confirmed to contain ZERO Tirupati/Tirumala directory rows (pan-India table; scope finding recorded on the source itself).")
lines.append("3. `Places to see around Tirumala.aspx` and both accommodation pages present their lists as prose/tables WITHOUT per-place hyperlinks — names are quoted from prose; hrefOrDetail records that reality.")
lines.append("4. The incredibleindia.gov.in page was anticipated to be a JS-heavy Next.js shell with a `self.__next_f` payload; in reality it is **server-rendered** (AEM v2; 0 `self.__next_f` chunks, 0 `__NEXT_DATA__`), so extraction was better than expected: full narrative text + 10 attraction card links came through statically. No browser rendering was needed or used.")
lines.append("5. tirumala.org nav `Advance Reservation / Seva / Darshan / Accommodation` online-booking links point to `ttdevasthanams.ap.gov.in` and `tirupatibalaji.ap.gov.in` — related official domains, not fetched this pass (outside the 4-page cap).")
lines.append("")
lines.append("## Self-check (extraction verification)")
lines.append("")
lines.append("Re-opened the RAW saved files (not the cleaned text) and located 5 extracted names; surrounding raw-HTML text quoted verbatim below:")
lines.append("")
for sc in selfcheck:
    ok = "FOUND" if sc["foundInRawHtml"] else "NOT FOUND"
    lines.append(f'- **{sc["name"]}** — {ok} in raw saved HTML.')
    if sc["context"]:
        lines.append(f'  - surrounding text: `{sc["context"]}`')
lines.append("")
lines.append("### Full quote-integrity re-verification (programmatic)")
lines.append("")
_q_ok = _q_all = 0
for _s in SOURCES:
    if not str(_s["page"]).endswith(".html"):
        continue
    # re-clean identically to how quotes were cut:
    _b = re.sub(r"<script.*?</script>", " ", (DIR / _s["page"]).read_text(encoding="utf-8", errors="replace"), flags=re.S | re.I)
    _b = re.sub(r"<style.*?</style>", " ", _b, flags=re.S | re.I)
    _b = re.sub(r"<!--.*?-->", " ", _b, flags=re.S)
    _t = htmllib.unescape(re.sub(r"<[^>]+>", "\n", _b)).replace("\xa0", " ")
    _t = re.sub(r"\s+", " ", _t).strip()
    for _e in _s["extracted"]:
        if not _e["verbatimQuote"]:
            continue
        _q_all += 1
        if _e["verbatimQuote"] in _t:
            _q_ok += 1
        else:
            print(f"INTEGRITY FAIL: {_s['page']} :: {_e['name']}")
lines.append(f"- {_q_ok}/{_q_all} verbatim quotes re-located word-for-word inside their saved page's visible text (same tag-stripped, entity-unescaped, whitespace-collapsed normalization used to cut them). {_q_all - _q_ok} mismatches.")
lines.append("")
lines.append("*Generated by extract_official_sources.py (this directory); input = the saved raw HTML files fetched on " + ACCESSED + ".*")

out_md = DIR / "official-sources.md"
out_md.write_text("\n".join(lines) + "\n", encoding="utf-8")

# console summary
total = sum(len(s["extracted"]) for s in SOURCES)
nulls = sum(1 for s in SOURCES for e in s["extracted"] if e["verbatimQuote"] is None)
print(f"sources: {len(SOURCES)} | extracted names: {total} | quotes not located (null, honest): {nulls}")
for s in SOURCES:
    print(f"  {s['httpStatus']:>3} {s['pageSizeBytes']:>7}B  {len(s['extracted']):>2} names  {s['sourceUrl']}")
print("self-check:", ", ".join(f'{sc["name"]}:{ "OK" if sc["foundInRawHtml"] else "MISS" }' for sc in selfcheck))
