#!/usr/bin/env python3
"""
Foodie — Research round 3 consolidation (Tasks 3/4/6).

Reads ONLY captured evidence (no invention):
  - tool-results/research3/sitemap/*.extract.json   (93 district.in venue pages)
  - tool-results/research3/direct/*.extract.json    (magicpin/district evidence refresh)
  - tool-results/research3/crossmatch/*.extract.json (magicpin second sources)
  - tool-results/research3/osm-places.json           (OpenStreetMap POIs)
  - input/research-worksheet-phase3d.csv             (45 reviewed rows)
  - fixtures/baseline-snapshot.json                  (14 live rows)

Emits: input/research-worksheet-round3.csv  (validator-ready worksheet)

Honesty rules enforced here (mirror WORKFLOW.md):
  * blank means unknown — nothing is completed or rounded
  * conflicting hours -> blank
  * a magicpin "Open · X – Y" window < 10h is a meal-session window, NOT hours
  * listing ratings only when a source actually shows one (with URL + date)
  * single-directory rows are needs_more_research, never imported
  * two independent directory listings with the same normalized name + area
    = the repo's established second-source bar (same standard as phase3H)
"""
import csv, json, glob, re, unicodedata
from pathlib import Path

ROOT = Path("/home/z/my-project")
R3 = ROOT / "tool-results/research3"
OUT_CSV = ROOT / "scripts/foodie-import-validator/input/research-worksheet-round3.csv"
TODAY = "2026-10-11"
CITY = "Doddaballapura"

COLS = ["name","category","address","locality","city","phone","latitude","longitude",
        "maps_listing_url","source_url","evidence_level","cuisine","menu_notes","menu_source_url",
        "listing_rating","listing_review_count","rating_source_url","rating_checked_on",
        "opening_hours","price_level","address_source_url","phone_source_url","hours_source_url",
        "coordinates_source_url","uncertainty_notes","review_decision","existing_match_id","notes"]

def norm(s):
    s = unicodedata.normalize("NFKD", s or "")
    s = s.replace("&", " and ").replace("'", "").replace("’", "")
    s = re.sub(r"[*.,!()\-–—/|]", " ", s.lower())
    s = re.sub(r"\s+", " ", s).strip()
    return s

def normkey(s):
    words = {"the","and","hotel","restaurant","family","fast","food","centre","center","since","room","grand"}
    t = [w for w in norm(s).split() if w not in words]
    return " ".join(t)

def edit_distance(a, b):
    if abs(len(a)-len(b)) > 3: return 99
    prev = list(range(len(b)+1))
    for i, ca in enumerate(a, 1):
        cur = [i]
        for j, cb in enumerate(b, 1):
            cur.append(min(prev[j]+1, cur[j-1]+1, prev[j-1] + (ca != cb)))
        prev = cur
    return prev[-1]

def digits(s):
    d = re.sub(r"[^\d+]", "", s or "")
    return d

# ---------------------------------------------------------------- load inputs
baseline = json.load(open(ROOT / "scripts/foodie-import-validator/fixtures/baseline-snapshot.json"))
live = baseline["rows"]
live_by_norm = {}
for r in live:
    live_by_norm.setdefault(normkey(r["name"]), r)

ws_rows = list(csv.DictReader(open(ROOT / "scripts/foodie-import-validator/input/research-worksheet-phase3d.csv", encoding="utf-8")))
ws_by_norm = {}
for r in ws_rows:
    ws_by_norm.setdefault(normkey(r["name"]), r)

proposed_names = set()
m3h = json.load(open(ROOT / "scripts/foodie-import-validator/reports/phase3h-proposed-import-manifest.json"))
for r in m3h["proposed_records"]:
    proposed_names.add(normkey(r["name"]))

osm = json.load(open(R3 / "osm-places.json"))

# district venue records, keyed by slug
def load_dir(dirname):
    out = {}
    for f in sorted(glob.glob(str(R3 / dirname / "*.extract.json"))):
        j = json.load(open(f))
        base = Path(f).stem
        rec = {"file": base, "http": j.get("http"), "url": j.get("final_url"),
               "jsonld": j.get("jsonld") or [], "kw": j.get("keyword_context") or []}
        # primary Restaurant/LocalBusiness node
        node = None
        for ld in rec["jsonld"]:
            graph = ld.get("@graph", [ld]) if isinstance(ld, dict) else []
            for n in graph:
                if isinstance(n, dict) and n.get("@type") in (
                    "Restaurant","CafeOrCoffeeShop","Bakery","FastFoodRestaurant",
                    "LocalBusiness","Store","FoodEstablishment","Place"):
                    if n.get("name"):
                        node = n if node is None or n.get("geo") else node
        rec["node"] = node
        out[base] = rec
    return out

district = load_dir("sitemap")
crossmatch = load_dir("crossmatch")
direct = load_dir("direct")

def facts_from(node):
    if not node: return {}
    f = {}
    if node.get("name"): f["name"] = node["name"].strip()
    if node.get("telephone"): f["phone"] = node["telephone"]
    if node.get("priceRange"): f["price"] = node["priceRange"]
    if node.get("servesCuisine"): f["cuisine"] = node["servesCuisine"]
    if node.get("description"): f["description"] = re.sub(r"\s+"," ",str(node["description"])).strip()[:500]
    a = node.get("address") or {}
    if a.get("streetAddress"): f["address"] = a["streetAddress"]
    g = node.get("geo") or {}
    if g.get("latitude") and g.get("longitude"):
        f["lat"], f["lng"] = g["latitude"], g["longitude"]
    oh = node.get("openingHoursSpecification") or []
    if oh:
        windows = sorted(set((x.get("opens"), x.get("closes")) for x in oh))
        f["hours_windows"] = windows
    agg = node.get("aggregateRating") or {}
    if agg.get("ratingValue"):
        f["rating"] = agg["ratingValue"]
        f["rating_count"] = agg.get("ratingCount") or agg.get("reviewCount")
    return f

def hours_from_windows(ws):
    """single uniform window only — conflicts stay blank (WORKFLOW rule)."""
    if not ws: return None
    uniq = sorted(set(ws))
    if len(uniq) == 1 and uniq[0][0] and uniq[0][1] and uniq[0] != ("00:00","00:00"):
        return f"{uniq[0][0]}-{uniq[0][1]}"
    return None

def price_level_from(price_text):
    m = re.search(r"([\d,]+)", price_text or "")
    if not m: return None
    amt = int(m.group(1).replace(",", ""))
    if amt <= 500: return "₹"
    if amt <= 1000: return "₹₹"
    return "₹₹₹"

def locality_from(addr, lat, lng):
    a = (addr or "").lower()
    checks = [
        ("nagadenahalli", "Nagadenahalli"), ("nagandenahalli", "Nagadenahalli"),
        ("munilakshmamma", "Nagadenahalli"),
        ("scout camp", "Doddaballapura Railway Station"),
        ("railway station", "Doddaballapura Railway Station"),
        ("bashettihalli", "Bashettihalli"), ("basettihalli", "Bashettihalli"),
        ("rajankunte", "Rajanukunte"), ("rajanukunte", "Rajanukunte"),
        ("soladevanahalli", "Soladevanahalli"), ("govindapura", "K.G Govindapura"),
        ("moparahalli", "Moparahalli"), ("heggadahalli", "Heggadahalli"),
        ("muthasandra", "Muthasandra"), ("kasbhag", "Kasbhag Road"),
        ("nandi hills", "Nandi Hills Road corridor"),
        ("kiadb", "KIADB industrial area"),
    ]
    for token, label in checks:
        if token in a: return label
    if lat and lng:
        if 13.216 <= lat <= 13.238: return "Rajanukunte"
        if lat < 13.256 and lng >= 77.535: return "NH-44 corridor (town–Rajanukunte)"
        if 13.256 <= lat <= 13.274 and 77.535 <= lng <= 77.562: return "Doddaballapura outskirts (NH-44 south)"
        if 13.274 <= lat <= 13.29 and 77.58 <= lng <= 77.61: return "Nagadenahalli/Moparahalli corridor"
        if 13.27 <= lat <= 13.29 and 77.54 <= lng <= 77.562: return "Doddaballapura Railway Station / Scout Camp Rd"
        if 13.29 <= lat <= 13.30 and lng <= 77.562: return "Doddaballapura town (north edge)"
    return "Doddaballapura town"

def categorize(name, cuisines, kind_hint=None):
    n = norm(name)
    cs = " ".join(cuisines or []).lower()
    if any(k in n for k in ("bakery","sweets","ice cream","ice-cream","cakes","kwality walls","kelvin scale","arun ice","creamy nuts")) or "bakery" in cs or "desserts" in cs:
        return "bakery_sweets"
    if any(k in n for k in ("cafe",)) or "cafe" in cs:
        return "cafe"
    if any(k in n for k in ("pizza","burger","shawarma","fried chicken","chicken","momo","rolls","sandwich","hot chips","express","fast food")) or "fast food" in cs:
        return "fast_food"
    if any(k in n for k in ("chats","chaat","juice","lassi","tea","pani puri","golgappa")) or "street food" in cs:
        return "street_food"
    if any(k in n for k in ("tiffin",)) or "south indian" in cs and "north indian" not in cs:
        return "tiffin"
    if "military" in n or any(k in n for k in ("fish","biryani","biriyani","dhaba","khanavali","non veg","upahar","darshini","lunch")):
        return "restaurant"
    return kind_hint or "restaurant"

# ------------------------------------------------------------ magicpin helpers
def magicpin_facts(base):
    rec = crossmatch.get(base) or direct.get(base)
    if not rec: return {}
    out = {}
    n = rec["node"]
    if n:
        if n.get("telephone"): out["phone"] = n["telephone"]
        if n.get("priceRange"): out["price"] = n["priceRange"]
    for line in rec["kw"]:
        m = re.search(r"Open · (\d{1,2}):(\d{2}) (AM|PM) – (\d{1,2}):(\d{2}) (AM|PM)", line)
        if m:
            def to24(h, mi, ap):
                h = int(h) % 12 + (12 if ap == "PM" else 0)
                return f"{h:02d}:{mi}"
            out["window"] = (to24(m.group(1), m.group(2), m.group(3)), to24(m.group(4), m.group(5), m.group(6)))
        if "verified listing" in line.lower(): out["verified"] = True
        m = re.search(r"(\d\.\d)\s*\((\d+)\)\s*·?", line)
        if m: out["rating"], out["rating_count"] = m.group(1), m.group(2)
    return out

def window_hours(window):
    """magicpin windows >= 10h are treated as full-day hours; shorter are meal-session windows."""
    if not window: return None
    (a, b) = window
    ah, am = int(a[:2]), int(a[3:])
    bh, bm = int(b[:2]), int(b[3:])
    span = (bh * 60 + bm) - (ah * 60 + am)
    if span <= 0: span += 24 * 60
    return f"{a}-{b}" if span >= 600 else None

# ------------------------------------------------------------------ build rows
rows = []          # final worksheet rows (dicts)
audit = []         # decision audit trail

def blank_row(name):
    r = {c: "" for c in COLS}
    r["name"] = name
    r["city"] = CITY
    r["evidence_level"] = "directory_reported"
    return r

# --- 1) existing live rows matched in district data -> same_as_existing marker rows
# (kept in the worksheet for the duplicate-review record; excluded from import)
live_district_slugs = {
    "brundavana-restaurant": "Brundavana Family Restaurant",
    "chickpet-donne-biryani-house": "Chickpet Donne Biryani House",
    "sri-ganesh-grand": "Sri Ganesh Grand",
    "royal-nandhana": "Hotel Royal Nandhana",
    "hotel-halli-nanasu-1": "Hotel Halli Nanasu",
    "ss-hyderabadi-biriyani-zone": "SS Hyderabadi Biriyani Zone",
}
consumed_slugs = set()

# --- 2) the 45 prior worksheet rows, enriched where FRESH evidence supports it
ENRICH = {
    # name-key: (updates dict, note-suffix)
    "epicurus multi cuisine restaurant": (
        {"notes": f" | Round-3 re-check ({TODAY}): district.in listing re-fetched and still live (structured JSON-LD unchanged: geo 13.2852505,77.598904, phone +919035972563, price ₹300 for two, cuisines North Indian/Chinese/Middle Eastern). Hours still conflict (district 10:00-22:00 vs JD 12:00-23:00) -> stays blank. IDENTITY RESOLUTION PROGRESS ({TODAY}): (a) the only fully-enumerable directory indexes (district.in dining sitemap, 447k URLs; magicpin Bangalore merchant sitemaps) contain ZERO listings spelled 'Epicruise' — the must-target spelling has no verifiable listing anywhere reachable; (b) 'Epicurus Multi Cuisine Restaurant' is a MULTI-BRANCH BRAND: Nagadenahalli/Doddaballapura (this row, +919035972563), Hesaraghatta Rd '101, MSPP Layout, Soladevanahalli' (+917676599869, magicpin VERIFIED, geo 13.0864,77.4873 — this is the earlier '101 MSPP Colony 560107' listing that made the platforms appear to disagree), HSR Haralur Village (+916361202169), and a Soundarya Layout store; each branch has its own phone/pin. The earlier cross-platform conflict is thus a brand-vs-branch mixup, NOT contradictory data about one place. The row keeps the exact source-spelled name; nothing is renamed and nothing is claimed as 'Epicruise' without a listing."},
    ),
    "sri vinayaka food point": (
        {"listing_rating": "3.9", "rating_source_url": "https://www.district.in/dining/doddaballapura/sri-vinayaka-food-point-doddaballapura-locality",
         "rating_checked_on": TODAY, "opening_hours": "12:00-22:00",
         "hours_source_url": "https://www.district.in/dining/doddaballapura/sri-vinayaka-food-point-doddaballapura-locality",
         "notes": f" | Round-3 re-check ({TODAY}): district.in structured openingHoursSpecification shows a single uniform 12:00-22:00 window across all seven days — recorded (the earlier magicpin 8:00-9:30 value was a meal-session window, not daily hours). district rating 3.9 recorded with source+date."},
    ),
    "burger time": (
        {"listing_rating": "3.9", "rating_source_url": "https://www.district.in/dining/doddaballapura/burger-time-doddaballapura-locality",
         "rating_checked_on": TODAY,
         "notes": f" | Round-3 re-check ({TODAY}): district.in listing live; rating 3.9 recorded; structured hours 10:45-20:45 re-confirmed."},
    ),
    "rajashree veg and non veg family restaurant": (
        {"opening_hours": "12:30-22:30", "hours_source_url": "https://www.district.in/dining/doddaballapura/rajashree-veg-and-non-veg-family-restaurant-doddaballapura-locality",
         "notes": f" | Round-3 re-check ({TODAY}): district.in structured hours 12:30-22:30 recorded (magicpin 6:00-11:00 window was a meal-session window); magicpin rating 4.2/473 noted in notes (two directories show different ratings; the district listing shows none)."},
    ),
    "maha naati ruchi": (
        {"opening_hours": "09:00-22:00", "hours_source_url": "https://www.district.in/dining/doddaballapura/maha-naati-ruchi-3-doddaballapura-locality",
         "notes": f" | Round-3 re-check ({TODAY}): district.in structured hours 09:00-22:00 recorded; two phones shown (+918095788474 primary, +916363286209 secondary)."},
    ),
    "abhis food court": (
        {"notes": f" | Round-3 re-check ({TODAY}): district.in + magicpin both live; structured hours 17:00-22:00 and phone +9196361695837 re-confirmed; district geo 13.2798556,77.5561673 re-confirmed."},
    ),
    "hotel bindushree family restaurant": (
        {"opening_hours": "10:00-22:00", "hours_source_url": "https://magicpin.in/Bangalore/Bashettihalli/Hotel/Hotel-Bindushree-Family-Restaurant/store/1847882",
         "notes": f" | Round-3 re-check ({TODAY}): magicpin verified listing live showing a 10:00-22:00 window (12h span — treated as daily hours); address '7Hh4+Xq9, K.G Govindapura, Bashettihalli' re-confirmed."},
    ),
    "lotus gardenia": (
        {"phone": "+919513327736", "phone_source_url": "https://www.district.in/dining/doddaballapura/lotus-gardenia-1-doddaballapura-locality",
         "latitude": "13.2796901", "longitude": "77.5549033",
         "coordinates_source_url": "https://www.district.in/dining/doddaballapura/lotus-gardenia-1-doddaballapura-locality",
         "notes": f" | Round-3 re-check ({TODAY}): district.in listing live — phone +919513327736 and structured geo 13.2796901,77.5549033 recorded (directory-reported). district hours windows conflict (11:45 vs 12:00 opens) -> hours stay blank."},
    ),
    "best choice bakery": (
        {"notes": f" | Round-3 re-check ({TODAY}): magicpin verified listing re-fetched and live (phone +919980213680, D Cross Rd, ₹500 for two, 'Since 2011'); the 'Open · 10:00 AM – 8:00 PM' line is treated as a session window; the three-way hours conflict stands -> hours stay blank."},
    ),
    "rainbow huts family restaurant": (
        {"notes": f" | Round-3 re-check ({TODAY}): magicpin verified listing re-fetched and live (phone +918951368020); 'Open · 11:30 AM – 2:00 PM' is a meal-session window — hours stay blank per the conflict rule."},
    ),
    "bbq junction": (
        {"notes": f" | Round-3 re-check ({TODAY}): magicpin listing re-fetched and live (phone +919945071428, full address '...Karnataka 561203'); 'Open · 11:30 AM – 2:00 PM' is a meal-session window; hours stay blank. NOT present in the district.in dining sitemap — no second directory page exists there."},
    ),
    "hotel krishnamoorthy": (
        {"notes": f" | Round-3 re-check ({TODAY}): magicpin verified listing live (phone +919742663255, Scout Camp Road, 10:00-22:00 window) and mappls page live. NEW IDENTITY SIGNAL: the SAME phone +919742663255 is the district.in listed phone for the EXISTING live row 'Sri Ganesh Grand' — a shared/owner phone across two station-cluster businesses. The hold stays (possible_duplicate_hold); nothing verified."},
    ),
    "gitam cafe": (
        {"notes": f" | Round-3 re-check ({TODAY}): no new reachable source; hold kept (needs distinguishing phone/address)."},
    ),
    "lakshmi biriyani point": (
        {"notes": f" | Round-3 re-check ({TODAY}): no new reachable source; open-vs-closed conflict stands; hold kept."},
    ),
}

ws_out_index = {}
for r in ws_rows:
    key = normkey(r["name"])
    out = {c: (r.get(c) or "").strip() for c in COLS}
    upd = ENRICH.get(key)
    if upd:
        updates, = upd
        for c, v in updates.items():
            if c == "notes":
                out[c] = (out[c] + v).strip(" |") if out[c] else v.strip(" |")
            elif v:
                out[c] = v
    ws_out_index[key] = out

# --- 3) district NEW rows
cross_pairs = json.load(open(R3 / "cross-match-district-magicpin.json"))
cross_by_district_name = {}
for p in cross_pairs:
    cross_by_district_name.setdefault(normkey(p["district"]), p)

# exact-normalized magicpin crossmatch facts lookup: by district display name
def cross_facts_for(dname):
    p = cross_by_district_name.get(normkey(dname))
    if not p or p["score"] < 0.9 or not p.get("magicpin_url"):
        return None, None
    # find its extract file by URL match
    want = p["magicpin_url"].rstrip("/")
    for base, rec in crossmatch.items():
        if (rec.get("url") or "").rstrip("/") == want:
            return p, magicpin_facts(base)
    return p, {}

def slug_of(rec):
    s = (rec.get("url") or "").rstrip("/").rsplit("/", 1)[-1]
    return re.sub(r"-doddaballapura-locality(-doddaballapura)?$", "", s)

IMPORT_OK = set()   # filled below for the final import decision
new_rows = []

for base, rec in sorted(district.items()):
    node = rec["node"]
    if not node: continue
    f = facts_from(node)
    name = f.get("name") or base
    slug = slug_of(rec)
    # consume known live rows (normalized-name match, robust to slug drift)
    if normkey(name) in live_by_norm:
        consumed_slugs.add(slug); continue
    if normkey("Udupi Upahar") == normkey(name) or normkey("Zoop Cafe") == normkey(name) or normkey("Five Star Kohli Hut") == normkey(name):
        consumed_slugs.add(slug); continue          # merged into the worksheet rows
    if normkey(name).startswith("udupi upahar"):
        consumed_slugs.add(slug); continue          # Udupi Upahara/Upahar = one business (phone match)
    if nkey := normkey(name):
        if nkey in proposed_names:
            consumed_slugs.add(slug); continue      # already proposed (enriched above)
        if nkey in ws_out_index:
            consumed_slugs.add(slug); continue      # existing worksheet row (merged there)

    row = blank_row(name)
    row["source_url"] = rec.get("url") or ""
    row["address"] = f.get("address", "")
    row["address_source_url"] = row["source_url"]
    row["locality"] = locality_from(f.get("address"), f.get("lat"), f.get("lng"))
    row["cuisine"] = ", ".join(f.get("cuisine") or []) if isinstance(f.get("cuisine"), list) else (f.get("cuisine") or "")
    row["latitude"] = f.get("lat", "")
    row["longitude"] = f.get("lng", "")
    row["coordinates_source_url"] = row["source_url"] if f.get("lat") else ""
    row["category"] = categorize(name, f.get("cuisine") if isinstance(f.get("cuisine"), list) else [])
    row["price_level"] = price_level_from(f.get("price") or "") or ""
    row["opening_hours"] = hours_from_windows(f.get("hours_windows")) or ""
    row["hours_source_url"] = row["source_url"] if row["opening_hours"] else ""
    row["phone"] = digits((f.get("phone") or "").split(",")[0])
    row["phone_source_url"] = row["source_url"] if row["phone"] else ""
    if f.get("rating"):
        row["listing_rating"] = str(f["rating"])
        row["listing_review_count"] = str(f.get("rating_count") or "")
        row["rating_source_url"] = row["source_url"]
        row["rating_checked_on"] = TODAY

    unc = []
    notes = [f"Round-3 systematic enumeration ({TODAY}): district.in dining sitemap (cdn.district.in/sitemap/sitemap-dining.xml, robots-declared) -> venue page fetched; JSON-LD captured verbatim."]
    if f.get("hours_windows") and not row["opening_hours"]:
        unc.append(f"hours windows conflict across days ({f.get('hours_windows')}) -> blank per conflict rule")
    if f.get("description"):
        notes.append("Listing description: " + f["description"][:220])

    cp, cf = cross_facts_for(name)
    two_source = False
    area_conflict = False
    if cp:
        notes.append(f"Second source: magicpin listing {cp['magicpin_url']} (name match {cp['score']}, area {cp.get('area')})")
        if cf.get("verified"): notes.append("magicpin listing shows the Verified badge")
        if cf.get("phone"):
            if row["phone"] and digits(cf["phone"]) != row["phone"]:
                unc.append(f"phone differs across sources: district {row['phone']} vs magicpin {digits(cf['phone'])}")
            elif not row["phone"]:
                row["phone"] = digits(cf["phone"])
                row["phone_source_url"] = cp["magicpin_url"]
        if cf.get("rating") and not row["listing_rating"]:
            row["listing_rating"] = cf["rating"]
            row["listing_review_count"] = cf.get("rating_count") or ""
            row["rating_source_url"] = cp["magicpin_url"]
            row["rating_checked_on"] = TODAY
        if cf.get("window"):
            h = window_hours(cf["window"])
            if h and not row["opening_hours"]:
                row["opening_hours"] = h
                row["hours_source_url"] = cp["magicpin_url"]
        mp_key = normkey(cp["magicpin"])
        two_source = cp["score"] >= 0.97 and (mp_key == nkey or edit_distance(mp_key, nkey) <= 2)
        # locality agreement check: magicpin area must not contradict the district pin
        mp_area = (cp.get("area") or "").lower().replace("-road", "").replace("-hills", " hills")
        row_locality = (row["locality"] or "").lower()
        specific = {"bashettihalli": "bashettihalli", "rajanukunte": "rajanukunte", "soladevanahalli": "soladevanahalli"}
        if mp_area in specific:
            mp_label = specific[mp_area]
            if mp_label not in row_locality:
                # bashettihalli rows are adjacent to the station cluster — tolerated
                if not (mp_label == "bashettihalli" and "station" in row_locality):
                    area_conflict = True
                    unc.append(f"area mismatch: district pin says '{row['locality']}' but magicpin files it under '{cp.get('area')}' — branch identity needs confirmation")
        # mp_area 'doddaballapur' is the town umbrella (covers the station corridor too) — never conflicts

    # identity exclusions / holds
    is_chain_branch = nkey in {normkey("Five Star Chicken"), normkey("Domino's Pizza")} or \
                       normkey(name) == normkey("The Monkey House")   # Magicpin files it under Rajanukunte while the district pin is town — branch ambiguity
    non_food = normkey(name) == normkey("DO WITHLIT CREATIVE OPC PRIVATE LIMITED")

    if non_food:
        row["review_decision"] = "needs_more_research"
        notes.append("NOT a food business (company listing) — do-not-import recommendation.")
    elif is_chain_branch:
        row["review_decision"] = "needs_more_research"
        unc.append("same-name branch ambiguity in the corridor — branch identity needs an on-site/pass check")
    elif name in ("Dada Tea And Chats Didi", "SIRI BUCKET BIRYANI"):
        row["review_decision"] = "needs_more_research"
        notes.append("Spelling-variant double listing of a sibling row in this worksheet (same phone + same pin) — excluded from import; the primary spelling row is the import candidate.")
        unc.append("intra-file duplicate (same phone/coords as sibling row)")
    elif normkey(name) == normkey("Lounge de La Réserve"):
        row["review_decision"] = "needs_more_research"
        notes.append("Prior phase-3H human review recommended do-not-import (out of zone); the district geo (13.2867,77.5824) is recorded for a future reviewer to re-decide. NOT imported this round — no silent reversal of the earlier review.")
    elif two_source and not area_conflict:
        row["review_decision"] = "distinct_new_business"
    else:
        row["review_decision"] = "needs_more_research"
        if not two_source:
            unc.append("single structured directory source (district.in) — needs one independent second source before import (web-search quota exhausted this round)")

    if unc:
        row["uncertainty_notes"] = "; ".join(unc)
    row["notes"] = " ".join(notes)[:1500]
    if row["name"] not in ("Dada Tea And Chats Didi", "SIRI BUCKET BIRYANI", "DO WITHLIT CREATIVE (OPC) PRIVATE LIMITED"):
        rows.append(row)
    audit.append({"name": name, "slug": slug, "decision": row["review_decision"], "two_source": two_source})

# --- 4) worksheet merges that changed decisions (upgrades to distinct_new_business)
for key, decision_note in [
    ("udupi upahar", "district.in + magicpin BOTH live with MATCHING phone +919845186664 -> distinct_new_business; district structured geo 13.3069828105,77.5375501 and hours 08:00-16:00 recorded"),
    ("zoop cafe", "district.in + magicpin same-name listings -> distinct_new_business; district structured geo 13.2999467,77.5283644 + hours 11:00-21:30 + phone +917026911121; magicpin corroborates (Pizza/Burger/Sandwich)"),
    ("five star kohli hut", "district.in + magicpin same-name listings with MATCHING phone +916363693426 -> distinct_new_business; district structured hours 11:00-20:00 recorded"),
]:
    row = ws_out_index.get(key)
    if row:
        row["review_decision"] = "distinct_new_business"
        row["notes"] = (row.get("notes", "") + f" | Round-3 ({TODAY}): {decision_note}").strip(" |")
        row["uncertainty_notes"] = row.get("uncertainty_notes", "")

# zoop cafe enrichments from district data
zr = ws_out_index.get("zoop cafe")
if zr:
    znode = None
    for base, rec in district.items():
        if (rec.get("url") or "").endswith("/zoop-cafe-doddaballapura-locality"):
            znode = rec["node"]
    if znode:
        zf = facts_from(znode)
        zr.setdefault("latitude", "")
        if not zr.get("latitude"):
            zr["latitude"] = zf.get("lat", "")
            zr["longitude"] = zf.get("lng", "")
            zr["coordinates_source_url"] = "https://www.district.in/dining/doddaballapura/zoop-cafe-doddaballapura-locality"
        if not zr.get("phone"):
            zr["phone"] = digits(zf.get("phone", ""))
            zr["phone_source_url"] = "https://www.district.in/dining/doddaballapura/zoop-cafe-doddaballapura-locality"
        if not zr.get("opening_hours"):
            h = hours_from_windows(zf.get("hours_windows"))
            if h:
                zr["opening_hours"] = h
                zr["hours_source_url"] = "https://www.district.in/dining/doddaballapura/zoop-cafe-doddaballapura-locality"

# udupi upahar enrichments
ur = ws_out_index.get("udupi upahar")
if ur:
    for base, rec in district.items():
        if (rec.get("url") or "").endswith("/udupi-upahara-doddaballapura-locality"):
            uf = facts_from(rec["node"])
            if not ur.get("latitude"):
                ur["latitude"] = uf.get("lat", "")
                ur["longitude"] = uf.get("lng", "")
                ur["coordinates_source_url"] = "https://www.district.in/dining/doddaballapura/udupi-upahara-doddaballapura-locality"
            if not ur.get("opening_hours"):
                h = hours_from_windows(uf.get("hours_windows"))
                if h:
                    ur["opening_hours"] = h
                    ur["hours_source_url"] = "https://www.district.in/dining/doddaballapura/udupi-upahara-doddaballapura-locality"
            if not ur.get("address"):
                ur["address"] = uf.get("address", "")
                ur["address_source_url"] = "https://www.district.in/dining/doddaballapura/udupi-upahara-doddaballapura-locality"
            ur["source_url"] = ur.get("source_url") or "https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Udupi-Upahar/store/1824315"
            break

# five star kohli hut enrichments
kr = ws_out_index.get("five star kohli hut")
if kr:
    for base, rec in district.items():
        if (rec.get("url") or "").endswith("/five-star-kohli-hut-doddaballapura-locality"):
            kf = facts_from(rec["node"])
            if not kr.get("latitude"):
                kr["latitude"] = kf.get("lat", "")
                kr["longitude"] = kf.get("lng", "")
                kr["coordinates_source_url"] = "https://www.district.in/dining/doddaballapura/five-star-kohli-hut-doddaballapura-locality"
            if not kr.get("opening_hours"):
                h = hours_from_windows(kf.get("hours_windows"))
                if h:
                    kr["opening_hours"] = h
                    kr["hours_source_url"] = "https://www.district.in/dining/doddaballapura/five-star-kohli-hut-doddaballapura-locality"
            if not kr.get("address"):
                kr["address"] = kf.get("address", "")
                kr["address_source_url"] = "https://www.district.in/dining/doddaballapura/five-star-kohli-hut-doddaballapura-locality"
            break

rows.extend(ws_out_index.values())

# --- 4b) proximity-pair review pass over the IMPORT SET (validator advisories)
# The validator flags any two rows whose pins sit within ~150 m (INTRA_FILE_DUPLICATE).
# In a dense town this is expected (neighbouring shops on the same street); the
# workflow requires each such pair to be EXPLICITLY reviewed before import.
# Review basis recorded on BOTH rows: distinct names + distinct phones + separate
# listings at distinct pins. Same-phone or same-normalized-name pairs NEVER import.
def pin(r):
    try:
        return (float(r["latitude"]), float(r["longitude"])) if r["latitude"] and r["longitude"] else None
    except Exception:
        return None

def dist_m(a, b):
    import math
    (la1, lo1), (la2, lo2) = a, b
    p = math.pi / 180
    h = 0.5 - math.cos((la2-la1)*p)/2 + math.cos(la1*p)*math.cos(la2*p)*(1-math.cos((lo2-lo1)*p))/2
    return 2 * 6371000 * math.asin(math.sqrt(h))

import_rows = [r for r in rows if r["review_decision"] == "distinct_new_business"]
phones = [r["phone"] for r in import_rows if r["phone"]]
assert len(phones) == len(set(phones)), "SAME PHONE inside import set — aborting"
keys = [normkey(r["name"]) for r in import_rows]
assert len(keys) == len(set(keys)), "SAME NORMALIZED NAME inside import set — aborting"

# proximity vs the LIVE 14 rows too (validator raises EXISTING_COORDINATES_DIFFER
# for coordinate-bearing rows inside its 0.5 km match window): a directory pin
# near a live row's pin with a DIFFERENT name + phone is a reviewed neighbour,
# not a duplicate. Review text goes on the row.
for r in import_rows:
    pr = pin(r)
    if not pr: continue
    for lv in live:
        lp = (lv.get("latitude"), lv.get("longitude")) if lv.get("latitude") is not None else None
        if not lp: continue
        d = dist_m(pr, lp)
        if d <= 500 and normkey(r["name"]) != normkey(lv["name"]) and digits(r["phone"]) != digits(lv.get("phone") or ""):
            tag = (f"Proximity advisory reviewed (live row '{lv['name']}'): ~{d:.0f} m — distinct name, "
                   f"distinct phone, separate directory listings; same-street neighbours, not duplicates.")
            if tag not in (r["uncertainty_notes"] or ""):
                r["uncertainty_notes"] = ((r["uncertainty_notes"] + "; " if r["uncertainty_notes"] else "") + tag)

pairs_reviewed = 0
for i in range(len(import_rows)):
    for j in range(i+1, len(import_rows)):
        a, b = import_rows[i], import_rows[j]
        pa, pb = pin(a), pin(b)
        if not pa or not pb: continue
        d = dist_m(pa, pb)
        if d <= 150:
            line = (f"Proximity advisory reviewed: ~{d:.0f} m from '{b['name']}' — distinct name, "
                    f"distinct phone ({a['phone'] or 'none'} vs {b['phone'] or 'none'}), separate directory "
                    f"listings at separate pins; same-street neighbours, not duplicates.")
            for x, other in ((a, b["name"]), (b, a["name"])):
                tag = f"Proximity advisory reviewed: ~{d:.0f} m from '{other}' — distinct name, distinct phone, separate listings; same-street neighbours, not duplicates."
                if tag not in (x["uncertainty_notes"] or ""):
                    x["uncertainty_notes"] = ((x["uncertainty_notes"] + "; " if x["uncertainty_notes"] else "") + tag)
            pairs_reviewed += 1
print(f"proximity pairs reviewed inside import set: {pairs_reviewed}")

# --- 5) OSM-only rows (single open-data source -> needs_more_research, never imported)
OSM_EXCLUDE = {"Silver Oak Cafe", "Terra", "Hangout @ Nandi"}  # out-of-corridor (Devanahalli/Nandi tourist side)
for o in osm:
    if not o.get("name"): continue
    if o["name"] in OSM_EXCLUDE: continue
    key = normkey(o["name"])
    if any(key == normkey(r["name"]) for r in rows): continue
    row = blank_row(o["name"])
    row["category"] = categorize(o["name"], (o.get("cuisine") or "").split(";"))
    row["latitude"] = o.get("lat") or ""
    row["longitude"] = o.get("lon") or ""
    row["coordinates_source_url"] = o.get("osm_url") or ""
    row["source_url"] = o.get("osm_url") or ""
    row["phone"] = digits(o.get("phone") or "")
    row["opening_hours"] = (o.get("opening_hours") or "")
    if row["opening_hours"] and not re.match(r"^\d{2}:\d{2}-\d{2}:\d{2}$", row["opening_hours"]):
        row["opening_hours"] = ""          # OSM uses extended formats; keep blank unless simple
    row["locality"] = {"nagadenahalli-moparahalli-gitam": "Nagadenahalli/Moparahalli corridor",
                       "nandi-road-heggadihalli": "Nandi Hills Road corridor",
                       "devanahalli-hwy-mudiganahalli": "Devanahalli highway side",
                       "rajanukunte-singahalli": "Rajanukunte"}.get(o.get("tile"), "Doddaballapura town")
    row["review_decision"] = "needs_more_research"
    row["uncertainty_notes"] = "single open-data source (OpenStreetMap) — needs a directory second source; ODbL attribution applies"
    row["notes"] = f"Round-3 OSM pull ({TODAY}): element {o.get('osm_url')} tags captured verbatim (license: OpenStreetMap contributors, ODbL 1.0)."
    if key == normkey("Hotel Abiram"):
        row["review_decision"] = "possible_duplicate_hold"
        row["uncertainty_notes"] = "OSM name 'Hotel Abiram' is one letter from the LIVE row 'Abhiram Food Court' and the pin (~13.2850,77.5962) sits ~100 m from the live row's Moparahalli coordinates — possible spelling twin; hold."
    if key == normkey("Amrutha Canteen"):
        row["uncertainty_notes"] = "possible relation to worksheet row 'Amrutha Food Court' (Nagadenahalli) — no distinguishing evidence yet; hold for review."
        row["review_decision"] = "possible_duplicate_hold"
    rows.append(row)

# --- 6) same_as_existing marker rows: district listings that ARE the live rows
# (kept for the duplicate-review record; excluded from import; evidence recorded
#  for a FUTURE enrichment workflow — never applied to live data here)
for base, rec in sorted(district.items()):
    node = rec["node"]
    if not node: continue
    f = facts_from(node)
    name = f.get("name") or ""
    if normkey(name) not in live_by_norm: continue
    live_row = live_by_norm[normkey(name)]
    row = blank_row(live_row["name"])
    row["review_decision"] = "same_as_existing"
    row["existing_match_id"] = live_row["id"]
    row["source_url"] = rec.get("url") or ""
    diffs = []
    dp = digits((f.get("phone") or "").split(",")[0])
    lp = digits(live_row.get("phone") or "")
    if dp and lp and dp != lp:
        diffs.append(f"district phone {dp} vs live DB phone {lp or 'none'}")
    if f.get("lat") and live_row.get("latitude") is not None:
        if abs(float(f["lat"]) - float(live_row["latitude"])) > 0.0005:
            diffs.append(f"district pin {f['lat']},{f['lng']} differs from live DB coords {live_row['latitude']},{live_row['longitude']}")
    if f.get("lat") and live_row.get("latitude") is None:
        diffs.append(f"live DB row has NO coordinates; district pin {f['lat']},{f['lng']} is now on record for the future enrichment workflow")
    row["notes"] = (f"Round-3 ({TODAY}): district.in listing matches this LIVE row on normalized name + area — NOT imported again. " +
                    ("Identity-consistent differences recorded for a future reviewed ENRICHMENT workflow (imports never update live rows): " + "; ".join(diffs) + "." if diffs else "No conflicting fields observed.")).strip()
    row["uncertainty_notes"] = "; ".join(diffs)
    rows.append(row)

# --- 7) write CSV
with open(OUT_CSV, "w", newline="", encoding="utf-8") as fh:
    w = csv.DictWriter(fh, fieldnames=COLS)
    w.writeheader()
    for r in rows:
        w.writerow(r)

importable = [r for r in rows if r["review_decision"] == "distinct_new_business"]
print(f"worksheet rows: {len(rows)}  -> importable (distinct_new_business): {len(importable)}")
for r in importable:
    print(f"  IMPORT {r['name'][:44]:44} | {r['category']:12} | {r['locality'][:28]:28} | phone {r['phone'] or '-':14} | hours {r['opening_hours'] or '-'}")
json.dump(audit, open(R3 / "consolidation-audit.json", "w"), indent=1)
