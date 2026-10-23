/**
 * VERIFIED venue photos — per-venue, licensed, attributed.
 *
 * HONESTY CONTRACT (read before editing):
 *   * An entry exists ONLY for a venue whose photo was retrieved from
 *     Wikimedia Commons via its authorised API WITH license metadata, whose
 *     license is in the allowlist (CC BY / CC BY-SA / CC0 / Public domain —
 *     never NC/ND), AND whose content was VISUALLY verified to depict THIS
 *     specific venue (one candidate was rejected exactly this way: a generic
 *     "Tirupati hills from train" photo surfaced for a temple query and is
 *     NOT included — see worklog B-asset pass).
 *   * `credit` / `license` / `sourcePage` are recorded EXACTLY as the source
 *     publishes them — never invented, never paraphrased. The detail hero
 *     renders the credit and links the source page (the license requires
 *     attribution; we also add a link to the license where available).
 *   * Venues WITHOUT an entry (all 86+9 food places, the 6 lodging hotels,
 *     2 temples with no verifiably-licensed Commons photo) intentionally
 *     render the honest category illustration instead — a photo is never
 *     borrowed across venues and never hotlinked from official pages
 *     (venue-copyright).
 *   * Assets ship from public/images/places/ (WebP, width ≤ 800px, quality
 *     78) so the browser caches them; no third-party image host is hotlinked
 *     at runtime.
 */

export interface VenueImage {
  /** Bundled asset path. */
  src: string;
  /** What the photo actually shows — stated precisely, never oversold. */
  alt: string;
  /** Author/username as published on the Commons file page. */
  credit: string;
  /** License short name exactly as recorded by the Commons API. */
  license: string;
  /** Commons file page — the required attribution link. */
  sourcePage: string;
}

export const VENUE_IMAGES: Record<string, VenueImage> = {
  "9cbbed7e-b526-5167-ba53-30214cfe3c44": {
    // Sri Venkateswara Swamy Temple (Tirumala)
    src: "/images/places/sri-venkateswara-swamy-temple.webp",
    alt: "Entrance gopuram of Sri Venkateswara Swamy Temple, Tirumala, with pilgrims in the courtyard",
    credit: "Nikhilb239",
    license: "CC BY-SA 4.0",
    sourcePage:
      "https://commons.wikimedia.org/wiki/File:Tirumala_Venkateswara_temple_entrance_09062015.JPG",
  },
  "065ed977-26c1-5fa7-814a-b299f52672a1": {
    // Sri Govindaraja Swamy Temple
    src: "/images/places/sri-govindaraja-swamy-temple.webp",
    alt: "Gateway gopuram of Sri Govindaraja Swamy Temple with its Telugu name board",
    credit: "Muralikrishna m",
    license: "CC BY-SA 4.0",
    sourcePage:
      "https://commons.wikimedia.org/wiki/File:Govindaraja_Swamy_Temple_-_Tirupati_(3).jpg",
  },
  "f0034b71-18fd-51cc-be00-b26dc17cec72": {
    // Sri Kapilatheertham Temple
    src: "/images/places/sri-kapilatheertham-temple.webp",
    alt: "Kapila Theertham waterfall cascading beside the temple at the foot of the Tirumala hills",
    credit: "Agasthyathepirate",
    license: "CC BY-SA 4.0",
    sourcePage:
      "https://commons.wikimedia.org/wiki/File:Kapila_Theertham_waterfalls_Tirupati_2015_1.jpg",
  },
  "632a8627-baca-5d32-ab42-cf7328af8da1": {
    // ISKCON Tirupati
    src: "/images/places/iskcon-tirupati.webp",
    alt: "Ornate white-and-gold temple towers of ISKCON Tirupati",
    credit: "Raji.srinivas at English Wikipedia",
    license: "Public domain",
    sourcePage: "https://commons.wikimedia.org/wiki/File:ISKCON_Tirupathi.jpg",
  },
  "23e44a85-1086-58df-8a58-928830569f04": {
    // Natural Arch, Tirumala hills (Silathoranam)
    src: "/images/places/natural-arch-tirumala-hills-silathoranam.webp",
    alt: "The natural stone arch formation (Silathoranam) on the Tirumala hills",
    credit: "Á at English Wikipedia",
    license: "CC BY 3.0",
    sourcePage:
      "https://commons.wikimedia.org/wiki/File:Natural_stone_arch_in_tirumala.JPG",
  },
  "7f2c91c5-35c7-57d8-9d7a-833b033a4ef1": {
    // Talakona Waterfall
    src: "/images/places/talakona-waterfall.webp",
    alt: "Talakona waterfall dropping through the forest of Sri Venkateswara National Park",
    credit: "Eyeofshahval",
    license: "CC BY-SA 4.0",
    sourcePage:
      "https://commons.wikimedia.org/wiki/File:Talakona_Waterfalls_near_Tirupati_India.jpg",
  },
  "544ffb45-63d2-582b-8272-155f032b4901": {
    // Chandragiri Fort
    src: "/images/places/chandragiri-fort.webp",
    alt: "Raja Mahal palace of Chandragiri Fort with its tiered Vijayanagara-era facades",
    credit: "Laxmanvety",
    license: "CC BY-SA 4.0",
    sourcePage:
      "https://commons.wikimedia.org/wiki/File:Chandragiri_Fort,_Chandragiri,_Tirupati,_Andhra_Pradesh,_India_(2017).jpg",
  },
  "7a69de5b-7744-5fa6-b972-f3a7ebb4f0fb": {
    // Sri Venkateswara Zoological Park
    src: "/images/places/sri-venkateswara-zoological-park.webp",
    alt: "Sambar deer in the open enclosure of Sri Venkateswara Zoological Park",
    credit: "iMahesh",
    license: "CC BY-SA 4.0",
    sourcePage:
      "https://commons.wikimedia.org/wiki/File:Sambar_Deer_in_S.V._zoo,Tirupathi_(May_2019)_3.jpg",
  },
};

/** Venue image for a place id, or null when no verified photo exists. */
export function venueImageFor(placeId: string): VenueImage | null {
  return VENUE_IMAGES[placeId] ?? null;
}
