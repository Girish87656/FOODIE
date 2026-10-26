# Image asset provenance — public/images/

This file records where every bundled image comes from. It exists so no
image in this repository is ever an unattributed or mispresented asset.

## 1. Category artwork — REMOVED in Prototype 4 (2026-10-26)

Prototype 3 shipped 14 AI-generated flat-illustration category WebPs
(`public/images/categories/*.webp`). **Prototype 4 removed them from the
interface and from the repository**: premium Foodie uses real, verified,
attributed photographs where they exist, and a professional CATEGORY ICON
TILE (Lucide glyph on a quiet warm-neutral gradient,
`src/components/foodie/MediaTiles.tsx`) for everything else. An icon tile
reads as interface chrome — like an avatar with initials — so nothing can
be mistaken for a venue photo, and no raster artwork is deployed for
categories at all.

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
the category icon tile — no photo is hotlinked from official venue
pages (venue copyright) and no photo is reused across venues.

## 3. Venue-photo candidates deliberately NOT bundled

| Venue | Reason |
|---|---|
| `File:Tiruchanur 02.JPG` (Padmavathi pass) | Gopuram mostly occluded by compound wall + market stalls — not a clear depiction of the temple |
| `File:Tiruchanur 03.JPG` (Padmavathi pass) | Street-side shrine facade — not verifiably the main Padmavathi Ammavari Temple |
| All 6 lodging hotels | Official-site photos are venue copyright; no licensed source found → icon tile |
| All food places (77 + 9 Batch-009) | No licensed per-venue sources captured → category icon tile |

## 4. Responsive variants (generated derivatives — same provenance as §2)

Every bundled venue-photo master WebP also ships a generated,
provenance-identical smaller sibling (sharp resize + WebP q78, 2026-10-23),
served through the `responsiveSrcSet` helper
(`src/lib/foodie/categoryImages.ts`) so tiles download kilobytes instead of
the full-size master:

| Pattern | Candidates | Used by |
|---|---|---|
| `places/<name>-small.webp` | 320w | POI list tiles (76px), featured-destination card @1x |
| `places/<name>.webp` | 800w (master, §2) | venue detail heroes + featured card (~430px @2x) |

RULE: whenever a new master `.webp` is added to `public/images/places/`,
its `-small.webp` sibling MUST be generated in the same pass — the srcset
references these files unconditionally, so a missing sibling would break
the responsive candidates.
