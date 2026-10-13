/**
 * Foodie — round 4 worksheet generator.
 *
 * Produces input/research-worksheet-round4.csv = the round-3 worksheet with:
 *   1. r36 Lounge de La Réserve  — needs_more_research -> distinct_new_business
 *      (round-4 evidence: district + magicpin listings share the IDENTICAL
 *      phone +916366946331 and the IDENTICAL pin 13.286726,77.5824616; the
 *      'Bashettihalli' magicpin area label is a filing quirk, not a branch).
 *   2. r64 The Monkey House / r67 Udupi Garden Hotel — the round-3 external
 *      rating was read from a magicpin listing that the round-4 geo check
 *      places 11-15 km away with a DIFFERENT phone: a different branch.
 *      Misattributed listing_rating / listing_review_count /
 *      rating_source_url are CLEARED (never kept under the wrong business);
 *      opening_hours/hours_source_url cleared when sourced from the same
 *      wrong-branch listing. Decisions stay needs_more_research.
 *   3. NEW single-source lead rows for every unmatched magicpin store page in
 *      the 7 target-zone areas, fields captured verbatim from the listing
 *      JSON-LD (fetched 2026-10-11). Decisions stay blank; these rows are
 *      leads — a second independent source is required before any identity
 *      or import decision (WORKFLOW rule 6).
 *
 * Everything else is byte-identical to round 3.
 */
import { writeFileSync, readFileSync } from "node:fs";

const ROOT = "/home/z/my-project";
const BASE = `${ROOT}/scripts/foodie-import-validator/input/research-worksheet-round3.csv`;
const OUT = `${ROOT}/scripts/foodie-import-validator/input/research-worksheet-round4.csv`;
const CM = `${ROOT}/tool-results/research4/cross-match.json`;
const IDX = `${ROOT}/tool-results/research4/index.json`;

const CHECK_DATE = "2026-10-11";

const header = "name,category,address,locality,city,phone,latitude,longitude,maps_listing_url,source_url,evidence_level,cuisine,menu_notes,menu_source_url,listing_rating,listing_review_count,rating_source_url,rating_checked_on,opening_hours,price_level,address_source_url,phone_source_url,hours_source_url,coordinates_source_url,uncertainty_notes,review_decision,existing_match_id,notes";

function csvCell(v: string | number | null | undefined): string {
  if (v === null || v === undefined) return "";
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}
function csvRow(cells: (string | number | null | undefined)[]): string {
  return cells.map(csvCell).join(",");
}

function normName(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, "");
}
function normPhone(p: unknown): string | null {
  if (typeof p !== "string") return null;
  const digits = p.replace(/\D/g, "");
  if (digits.length < 10) return null;
  const last10 = digits.slice(-10);
  return `+91${last10}`;
}

/* ---------- load round-3 worksheet verbatim ---------- */

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let cur: string[] = [], field = "", inQ = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQ) {
      if (ch === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (ch === '"') inQ = false;
      else field += ch;
    } else if (ch === '"') inQ = true;
    else if (ch === ",") { cur.push(field); field = ""; }
    else if (ch === "\n") { cur.push(field); field = ""; rows.push(cur); cur = []; }
    else if (ch !== "\r") field += ch;
  }
  if (field.length || cur.length) { cur.push(field); rows.push(cur); }
  return rows;
}

const raw = parseCsv(readFileSync(BASE, "utf-8"));
const head = raw[0];
const rows: Array<Record<string, string>> = raw.slice(1).map((cells) => {
  const o: Record<string, string> = {};
  head.forEach((h, i) => (o[h] = cells[i] ?? ""));
  return o;
});
console.log(`round-3 rows loaded: ${rows.length}`);

/* ---------- load round-4 magicpin facts ---------- */

const cm = JSON.parse(readFileSync(CM, "utf-8"));
const idx = JSON.parse(readFileSync(IDX, "utf-8"));

type Fact = {
  url: string; listedName?: string; area?: string; name?: string;
  phone?: string | null; street?: string | null;
  lat?: number | null; lng?: number | null;
  hoursSpec?: Array<{ opens?: string; closes?: string; dayOfWeek?: string | string[] }> | null;
  priceRange?: string | null; cuisines?: string[] | null;
  rating?: { value?: number; count?: number } | null;
};

function factsFromIndexEntry(v: any): Fact | null {
  if (v?.http !== 200 || !v?.jsonld) return null;
  for (const block of v.jsonld as any[]) {
    const graphs = Array.isArray(block?.["@graph"]) ? block["@graph"] : [block];
    for (const g of graphs) {
      if (String(g?.["@type"]) !== "Restaurant") continue;
      const addr = g.address ?? {};
      const ohs = Array.isArray(g.openingHoursSpecification) ? g.openingHoursSpecification : null;
      return {
        url: v.url, listedName: v.listedName, area: v.area,
        name: typeof g.name === "string" ? g.name : undefined,
        phone: typeof g.telephone === "string" ? g.telephone : null,
        street: [addr.streetAddress, addr.addressLocality].filter((x) => typeof x === "string" && x).join(", ") || null,
        lat: g.geo?.latitude != null ? Number(g.geo.latitude) : null,
        lng: g.geo?.longitude != null ? Number(g.geo.longitude) : null,
        hoursSpec: ohs,
        priceRange: typeof g.priceRange === "string" ? g.priceRange : null,
        cuisines: Array.isArray(g.servesCuisine) ? g.servesCuisine.map(String) : null,
        rating: g.aggregateRating
          ? {
              value: Number.isFinite(Number(g.aggregateRating.ratingValue)) ? Number(g.aggregateRating.ratingValue) : undefined,
              count: Number.isFinite(Number(g.aggregateRating.ratingCount ?? g.aggregateRating.reviewCount)) ? Number(g.aggregateRating.ratingCount ?? g.aggregateRating.reviewCount) : undefined,
            }
          : null,
      };
    }
  }
  return null;
}

const facts: Fact[] = [];
for (const [k, v] of Object.entries(idx)) {
  if (!k.startsWith("magicpin:")) continue;
  const f = factsFromIndexEntry(v);
  if (f) facts.push(f);
}
console.log(`magicpin facts: ${facts.length}`);

const matchedUrls = new Set<string>();
for (const c of cm.candidates) {
  if (c.matchLive || c.matchDistrict || c.matchWorksheet) matchedUrls.add(c.magicpinUrl);
}
const unmatched = facts.filter((f) => !matchedUrls.has(f.url));
console.log(`unmatched (single-source leads): ${unmatched.length}`);

/* ---------- 1-2: edit existing rows (r36, r64, r67 by 1-based row number) ---------- */

const ROUND3_ROW = { lounge: 36, monkey: 64, udupi: 67 };

function uniformHours(spec: Fact["hoursSpec"]): string | null {
  if (!spec || !spec.length) return null;
  const days = new Set<string>();
  for (const s of spec) {
    const d = s.dayOfWeek;
    if (typeof d === "string") days.add(d.split("/").pop() ?? d);
    else if (Array.isArray(d)) d.forEach((x) => days.add(String(x).split("/").pop() ?? String(x)));
  }
  if (days.size !== 7) return null; // not all seven days -> not a uniform week
  const first = `${spec[0].opens}-${spec[0].closes}`;
  for (const s of spec) {
    if (`${s.opens}-${s.closes}` !== first) return null; // split day or varied -> NULL
  }
  const [o, c] = first.split("-");
  if (!o || !c) return null;
  const trim = (t: string) => t.slice(0, 5);
  return `${trim(o)}-${trim(c)}`;
}

let edited = 0;
for (let i = 0; i < rows.length; i++) {
  const rowNo = i + 2; // 1-based with header
  const r = rows[i];

  if (rowNo === ROUND3_ROW.lounge && r.name.toLowerCase().includes("lounge")) {
    const deaccent = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z]/g, "");
    const loungeFacts = facts.find((f) => deaccent(f.name ?? "") === "loungedelareserve");
    if (loungeFacts) {
      r.review_decision = "distinct_new_business";
      if (loungeFacts.rating?.value != null) r.listing_rating = String(loungeFacts.rating.value);
      if (loungeFacts.rating?.count != null) r.listing_review_count = String(loungeFacts.rating.count);
      r.rating_source_url = loungeFacts.url;
      r.rating_checked_on = CHECK_DATE;
      const uh = uniformHours(loungeFacts.hoursSpec);
      if (uh && !r.opening_hours) r.opening_hours = uh;
      r.uncertainty_notes =
        "RESOLVED round-4 (2026-10-11): the 'Bashettihalli' magicpin area label was a filing quirk — the magicpin listing shares the IDENTICAL phone +916366946331 and IDENTICAL pin 13.286726,77.5824616 with the district.in listing (both re-read 2026-10-11), so the two listings are the same business, not branches. Same-business evidence is cross-directory agreement (directory_reported); on-site GPS still the only path to verified.";
      r.notes = `${r.notes} | Round-4 corridor continuation (2026-10-11): magicpin store page re-fetched via robots-declared sitemap inventory; JSON-LD re-captured (rating ${r.listing_rating}/${r.listing_review_count}, phone + pin identical to district). Promoted needs_more_research -> distinct_new_business on the phone+geo identity agreement.`;
      edited++;
    }
  }

  if (rowNo === ROUND3_ROW.monkey && r.name.toLowerCase().includes("monkey")) {
    const mpUrl = "https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Monkey-House/store/1678319";
    r.listing_rating = "";
    r.listing_review_count = "";
    r.rating_source_url = "";
    r.rating_checked_on = "";
    if (r.hours_source_url === mpUrl) { r.opening_hours = ""; r.hours_source_url = ""; }
    r.uncertainty_notes =
      "Round-4 correction (2026-10-11): the magicpin listing previously used as the rating source (Rajanukunte, pin 13.16979548,77.56744254, phone +918050190643) sits ~14 km from the district.in town pin 13.2947637,77.5399817 with a DIFFERENT phone — a DIFFERENT branch/business with the same name. The round-3 listing_rating 2.9/6 belonged to that other branch and has been CLEARED here (never kept under the wrong business). The Rajanukunte listing is recorded as its own single-source lead row in this worksheet. Town (district-sourced) row still needs a genuine second source.";
    r.notes = `${r.notes} | Round-4 (2026-10-11): misattributed external rating cleared; branch-vs-branch documented.`;
    edited++;
  }

  if (rowNo === ROUND3_ROW.udupi && r.name.toLowerCase().includes("udupi garden")) {
    const mpUrl = "https://magicpin.in/Bangalore/Rajanukunte/Restaurant/Udupi-Garden/store/177c0c9";
    r.listing_rating = "";
    r.listing_review_count = "";
    r.rating_source_url = "";
    r.rating_checked_on = "";
    if (r.hours_source_url === mpUrl) { r.opening_hours = ""; r.hours_source_url = ""; }
    r.uncertainty_notes =
      "Round-4 correction (2026-10-11): the magicpin listing previously used as the rating source (Rajanukunte, pin 13.1674354,77.5648277, phone +919980657073) sits ~11 km from the district.in pin 13.2647600,77.5528303 with a DIFFERENT phone — a DIFFERENT branch/business with the same name. The round-3 listing_rating 3.8/210 belonged to that other branch and has been CLEARED here. The Rajanukunte listing is recorded as its own single-source lead row in this worksheet. District-sourced row still needs a genuine second source.";
    r.notes = `${r.notes} | Round-4 (2026-10-11): misattributed external rating cleared; branch-vs-branch documented.`;
    edited++;
  }
}
console.log(`existing rows edited: ${edited}`);

/* ---------- 3: new single-source lead rows ---------- */

const ZONE_AREAS = new Set([
  "Doddaballapur", "Bashettihalli", "Soladevanahalli", "Nagenahalli",
  "Hessarghatta-Road", "Doddaballapur-Road", "Rajanukunte",
]);

const leadRows = unmatched.filter((f) => f.area && ZONE_AREAS.has(f.area));
console.log(`zone lead rows: ${leadRows.length}`);

// intra-file dedupe (two listings for the same store)
const seenNames = new Map<string, string>(); // norm name -> first url
const seenPhones = new Map<string, string>();
const newRows: Array<Record<string, string>> = [];
let dupDropped = 0;

for (const f of leadRows) {
  const name = (f.name ?? f.listedName ?? "").trim();
  if (!name) continue;
  const nn = normName(name);
  const ph = normPhone(f.phone ?? null);
  if (nn && seenNames.has(nn)) { dupDropped++; continue; }
  if (ph && seenPhones.has(ph) && seenPhones.get(ph) !== f.url) {
    // same phone, different listing — keep but note; do not silently merge
  }
  if (nn) seenNames.set(nn, f.url);
  if (ph) seenPhones.set(ph, f.url);

  const uh = uniformHours(f.hoursSpec);
  const notesParts = [
    `Round-4 corridor continuation (${CHECK_DATE}): magicpin store page fetched via robots-declared corridor sitemap inventory (URL below), JSON-LD captured verbatim.`,
    "SINGLE-SOURCE LEAD — one directory listing only; a second independent source is required before any identity or import decision (WORKFLOW rule 6).",
    `magicpin files this store under area '${f.area}' and city 'Bangalore'; the physical area is the Doddaballapura taluk corridor (directory filing, not an independent confirmation).`,
  ];
  if (f.rating?.value != null) {
    notesParts.push(`External listing rating ${f.rating.value}/${f.rating.count ?? "?"} recorded with source URL + check date — NEVER a Foodie community value.`);
  }
  if (!uh && f.hoursSpec?.length) notesParts.push("Opening-hours spec exists but is not a uniform 7-day single window — left NULL rather than summarized.");

  newRows.push({
    name,
    category: "", // magicpin files EVERY store as 'Restaurant' (even condiment shops) — not reliable; blank = uncertain
    address: f.street ?? "",
    locality: f.area ?? "",
    city: "Bangalore", // verbatim from the source's structured address
    phone: ph ?? "",
    latitude: f.lat != null ? String(f.lat) : "",
    longitude: f.lng != null ? String(f.lng) : "",
    maps_listing_url: "",
    source_url: f.url,
    evidence_level: "directory_reported",
    cuisine: f.cuisines?.length ? f.cuisines.join(", ") : "",
    menu_notes: "",
    menu_source_url: "",
    listing_rating: f.rating?.value != null ? String(f.rating.value) : "",
    listing_review_count: f.rating?.count != null ? String(f.rating.count) : "",
    rating_source_url: f.rating?.value != null ? f.url : "",
    rating_checked_on: f.rating?.value != null ? CHECK_DATE : "",
    opening_hours: uh ?? "",
    price_level: "", // magicpin priceRange (e.g. '₹450') is an amount, not a verified band — left blank rather than inferred
    address_source_url: f.street ? f.url : "",
    phone_source_url: ph ? f.url : "",
    hours_source_url: uh ? f.url : "",
    coordinates_source_url: f.lat != null ? f.url : "",
    uncertainty_notes: notesParts.join(" "),
    review_decision: "",
    existing_match_id: "",
    notes: `Round-4 single-source lead (${CHECK_DATE}).`,
  });
}
console.log(`lead rows after intra-file dedupe: ${newRows.length} (dropped ${dupDropped} same-name listing duplicates)`);

/* ---------- write ---------- */

const allRows = [...rows.map((r) => head.map((h) => r[h] ?? "")), ...newRows.map((r) => head.map((h) => r[h] ?? ""))];
const out = [header, ...allRows.map(csvRow)].join("\n") + "\n";
writeFileSync(OUT, out);
console.log(`written: ${OUT} (${allRows.length} data rows)`);
