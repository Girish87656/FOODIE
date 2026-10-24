# Image asset provenance — public/images/

This file records where every bundled image comes from. It exists so no
image in this repository is ever an unattributed or mispresented asset.

## 1. Category illustrations (`public/images/categories/*.webp`) — AI-GENERATED ARTWORK

All 14 files were generated for this project with a text-to-image model
(z-ai image generation, 2026-10-23) from a consistent prompt family
("editorial flat illustration, warm terracotta/amber/cream palette …").
They are **category artwork, NOT photos of any real venue**:

| File | Represents |
|---|---|
| `restaurant.webp` | FOOD category `restaurant` |
| `hotel-meals.webp` | FOOD category `hotel` — the LOCAL "meals place" (rice-thali eatery), NOT lodging |
| `tiffin.webp` | FOOD category `tiffin` |
| `cafe.webp` | FOOD category `cafe` |
| `fast-food.webp` | FOOD category `fast_food` |
| `street-food.webp` | FOOD category `street_food` |
| `bakery-sweets.webp` | FOOD category `bakery_sweets` |
| `temple.webp` | place_type `temple` |
| `waterfall.webp` | place_type `waterfall` |
| `fort.webp` | place_type `fort` |
| `zoo.webp` | place_type `zoo` |
| `natural-arch.webp` | place_type `natural_arch` |
| `poi-other.webp` | place_type `other` |
| `hotel-stay.webp` | place_type `hotel` — LODGING stays |

The UI never presents these as venue photos: detail heroes show
"Illustration · not a venue photo", and alt text / aria labels say
"category illustration". Because they are category artwork, the same image
is shared by every place in that category **by design** — that is not the
"one image reused across venues" anti-pattern, which applies to real photos.

## 2. Venue photos (`public/images/places/*.webp`) — WIKIMEDIA COMMONS, licensed & attributed

Retrieved 2026-10-23 via the Wikimedia Commons API (authorised API, license
metadata), thumbnails ≤800px, re-encoded WebP q78. Every entry below was
(1) license-checked against an allowlist (CC BY / CC BY-SA / CC0 / Public
domain — no NC/ND), and (2) **visually verified to depict the named venue**
(one search hit — a generic "Tirupati hills from train" photo returned for a
temple query — was REJECTED and is not bundled).

| Venue (place uuid5 prefix) | Commons file | Author (as published) | License |
|---|---|---|---|
| Sri Venkateswara Swamy Temple (`9cbbed7e`) | [File:Tirumala Venkateswara temple entrance 09062015.JPG](https://commons.wikimedia.org/wiki/File:Tirumala_Venkateswara_temple_entrance_09062015.JPG) | Nikhilb239 | CC BY-SA 4.0 |
| Sri Govindaraja Swamy Temple (`065ed977`) | [File:Govindaraja Swamy Temple - Tirupati (3).jpg](https://commons.wikimedia.org/wiki/File:Govindaraja_Swamy_Temple_-_Tirupati_(3).jpg) | Muralikrishna m | CC BY-SA 4.0 |
| Sri Kapilatheertham Temple (`f0034b71`) | [File:Kapila Theertham waterfalls Tirupati 2015 1.jpg](https://commons.wikimedia.org/wiki/File:Kapila_Theertham_waterfalls_Tirupati_2015_1.jpg) | Agasthyathepirate | CC BY-SA 4.0 |
| ISKCON Tirupati (`632a8627`) | [File:ISKCON Tirupathi.jpg](https://commons.wikimedia.org/wiki/File:ISKCON_Tirupathi.jpg) | Raji.srinivas at English Wikipedia | Public domain |
| Natural Arch, Silathoranam (`23e44a85`) | [File:Natural stone arch in tirumala.JPG](https://commons.wikimedia.org/wiki/File:Natural_stone_arch_in_tirumala.JPG) | Á at English Wikipedia | CC BY 3.0 |
| Talakona Waterfall (`7f2c91c5`) | [File:Talakona Waterfalls near Tirupati India.jpg](https://commons.wikimedia.org/wiki/File:Talakona_Waterfalls_near_Tirupati_India.jpg) | Eyeofshahval | CC BY-SA 4.0 |
| Chandragiri Fort (`544ffb45`) | [File:Chandragiri Fort, Chandragiri, Tirupati, Andhra Pradesh, India (2017).jpg](https://commons.wikimedia.org/wiki/File:Chandragiri_Fort,_Chandragiri,_Tirupati,_Andhra_Pradesh,_India_(2017).jpg) | Laxmanvety | CC BY-SA 4.0 |
| Sri Venkateswara Zoological Park (`7a69de5b`) | [File:Sambar Deer in S.V. zoo,Tirupathi (May 2019) 3.jpg](https://commons.wikimedia.org/wiki/File:Sambar_Deer_in_S.V._zoo,Tirupathi_(May_2019)_3.jpg) | iMahesh | CC BY-SA 4.0 |
| Sri Padmavathi Ammavari Temple (`550f0ee2`) | [File:Padmavathi Ammavari Temple.JPG](https://commons.wikimedia.org/wiki/File:Padmavathi_Ammavari_Temple.JPG) | Vedamurthy.j | CC BY-SA 3.0 |
| Sri Kalyana Venkateswara Swamy Temple (`7ca7b062`) | [File:Kalyana Venkateshwara Swamy Temple View.jpg](https://commons.wikimedia.org/wiki/File:Kalyana_Venkateshwara_Swamy_Temple_View.jpg) | Ramya Srivastav | CC BY-SA 4.0 |

The two 2026-10-23 additions were each VISUALLY verified against the named
venue before bundling (the Padmavathi photo's festival banner names the
temple in Telugu; the Kalyana Venkateswara file description names Srinivasa
Mangapuram and the gopuram matches an independent photographer's file of
the same temple). Two other Tiruchanur candidates were inspected and
REJECTED on visual check (see section 3).

The running app renders each photo's credit and links its source page on
the venue detail hero (`src/data/venue-images.ts`). No Google Maps/Google
Images content was used. Venues without an entry above intentionally use
the category illustration — no photo is hotlinked from official venue
pages (venue copyright) and no photo is reused across venues.

## 3. Venue-photo candidates deliberately NOT bundled

| Venue | Reason |
|---|---|
| `File:Tiruchanur 02.JPG` (Padmavathi pass) | Gopuram mostly occluded by compound wall + market stalls — not a clear depiction of the temple |
| `File:Tiruchanur 03.JPG` (Padmavathi pass) | Street-side shrine facade — not verifiably the main Padmavathi Ammavari Temple |
| All 6 lodging hotels | Official-site photos are venue copyright; no licensed source found → illustration |
| All food places (77 + 9 Batch-009) | No licensed per-venue sources captured → category illustration |

## 4. Responsive variants (generated derivatives — same provenance as §1/§2)

Every bundled master WebP above also ships generated, provenance-identical
smaller siblings (sharp resize + WebP q78, 2026-10-23), served through the
`responsiveSrcSet` helper (`src/lib/foodie/categoryImages.ts`) so chips and
tiles download kilobytes instead of the full-size master:

| Pattern | Candidates | Used by |
|---|---|---|
| `categories/<name>-small.webp` | 320w | chips (20-40px), POI list tiles (76px) |
| `categories/<name>-md.webp` | 640w | food place cards (200-248px) |
| `categories/<name>.webp` | 1344w (master, §1) | detail heroes (~430px @2x) |
| `places/<name>-small.webp` | 320w | POI list tiles (76px) |
| `places/<name>.webp` | 800w (master, §2) | venue detail heroes (~430px @2x) |

RULE: whenever a new master `.webp` is added to either folder, its
`-small.webp` (and, for categories, `-md.webp`) sibling MUST be generated
in the same pass — the srcset references these files unconditionally, so a
missing sibling would break the responsive candidates.
