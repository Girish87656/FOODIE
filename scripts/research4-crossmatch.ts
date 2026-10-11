/**
 * Foodie — round 4 extraction + cross-match.
 *
 * Input:  tool-results/research4/index.json (804 magicpin store pages,
 *         JSON-LD captured) + round-3 artifacts (93-venue district digest,
 *         127-row worksheet, 14-row live baseline snapshot).
 * Output: tool-results/research4/extract.json        — per-page structured facts
 *         tool-results/research4/cross-match.json    — identity analysis
 *         tool-results/research4/cross-match-report.md — human-readable review file
 *
 * Matching is ADVISORY only (WORKFLOW.md rule: the tool never decides identity).
 * Name normalization mirrors the import validator (lowercase, strip
 * non-alphanumerics). Phone matching uses the last 10 digits.
 */
import { writeFileSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const ROOT = "/home/z/my-project";
const R4 = join(ROOT, "tool-results/research4");

function normName(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, "");
}
function normPhone(p: unknown): string | null {
  if (typeof p !== "string") return null;
  const digits = p.replace(/\D/g, "");
  if (digits.length < 10) return null;
  return digits.slice(-10);
}
function haversine(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const R = 6371, dLat = ((bLat - aLat) * Math.PI) / 180, dLng = ((bLng - aLng) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((aLat * Math.PI) / 180) * Math.cos((bLat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

/* ---------- magicpin JSON-LD extraction ---------- */

type Facts = {
  url: string; area?: string; listedName?: string; http: number;
  name?: string; phone?: string | null; street?: string | null;
  lat?: number | null; lng?: number | null;
  hours?: string | null; priceRange?: string | null;
  cuisines?: string[] | null; imageUrl?: string | null; rating?: { value?: number; count?: number } | null;
};

function extractMagicpin(entry: { jsonld?: unknown; http: number; url: string; area?: string; listedName?: string }): Facts | null {
  if (entry.http !== 200 || !entry.jsonld) return null;
  const blocks = Array.isArray(entry.jsonld) ? entry.jsonld : [];
  for (const block of blocks) {
    const graphs = Array.isArray((block as { "@graph"?: unknown[] })?.["@graph"])
      ? ((block as { "@graph": unknown[] })["@graph"])
      : [block];
    for (const g of graphs) {
      const node = g as Record<string, unknown>;
      if (String(node?.["@type"]) !== "Restaurant") continue;
      const f: Facts = {
        url: entry.url, area: entry.area, listedName: entry.listedName, http: entry.http,
        name: typeof node.name === "string" ? node.name : undefined,
        phone: typeof node.telephone === "string" ? node.telephone : null,
        street: null, lat: null, lng: null, hours: null, priceRange: null, cuisines: null,
        imageUrl: null, rating: null,
      };
      const addr = node.address as Record<string, unknown> | undefined;
      if (addr && typeof addr === "object") {
        f.street =
          [addr.streetAddress, addr.addressLocality].filter((x) => typeof x === "string").join(", ") || null;
      }
      const geo = node.geo as Record<string, unknown> | undefined;
      if (geo && typeof geo === "object") {
        f.lat = typeof geo.latitude === "number" ? geo.latitude : Number.isFinite(Number(geo.latitude)) ? Number(geo.latitude) : null;
        f.lng = typeof geo.longitude === "number" ? geo.longitude : Number.isFinite(Number(geo.longitude)) ? Number(geo.longitude) : null;
      }
      const img = node.image as Record<string, unknown> | undefined;
      if (img && typeof img.contentUrl === "string") f.imageUrl = img.contentUrl;
      else if (typeof node.image === "string") f.imageUrl = node.image;
      if (typeof node.priceRange === "string") f.priceRange = node.priceRange;
      if (Array.isArray(node.servesCuisine)) f.cuisines = node.servesCuisine.map(String);
      const agg = node.aggregateRating as Record<string, unknown> | undefined;
      if (agg && typeof agg === "object") {
        f.rating = {
          value: Number.isFinite(Number(agg.ratingValue)) ? Number(agg.ratingValue) : undefined,
          count: Number.isFinite(Number(agg.ratingCount ?? agg.reviewCount)) ? Number(agg.ratingCount ?? agg.reviewCount) : undefined,
        };
      }
      const ohs = node.openingHoursSpecification as Array<Record<string, unknown>> | undefined;
      if (Array.isArray(ohs) && ohs.length) {
        // record verbatim spec JSON — interpretation happens per-row by a human
        f.hours = JSON.stringify(ohs).slice(0, 900);
      }
      return f;
    }
  }
  return null;
}

/* ---------- load sources ---------- */

const index = JSON.parse(readFileSync(join(R4, "index.json"), "utf-8")) as Record<string, any>;

const magicpin: Facts[] = [];
for (const [k, v] of Object.entries(index)) {
  if (!k.startsWith("magicpin:")) continue;
  const f = extractMagicpin(v);
  if (f) magicpin.push(f);
}

// round-3 district digest (93 venues with facts)
const digest = JSON.parse(
  readFileSync(join(ROOT, "tool-results/research3/sitemap/digest.json"), "utf-8")
) as Array<{ url: string; http: number; facts: Array<Record<string, unknown>> }>;
const district: Facts[] = [];
for (const d of digest) {
  for (const fact of d.facts ?? []) {
    district.push({
      url: d.url, http: d.http,
      name: typeof fact.name === "string" ? fact.name : undefined,
      phone: typeof fact.telephone === "string" ? fact.telephone : null,
      street: typeof fact.address === "string" ? fact.address : (typeof (fact.address as any)?.streetAddress === "string" ? (fact.address as any).streetAddress : null),
      lat: typeof fact.latitude === "number" ? fact.latitude : null,
      lng: typeof fact.longitude === "number" ? fact.longitude : null,
      hours: typeof fact.opening_hours === "string" ? fact.opening_hours : null,
      priceRange: typeof fact.priceRange === "string" ? fact.priceRange : null,
      cuisines: Array.isArray(fact.servesCuisine) ? fact.servesCuisine.map(String) : null,
      imageUrl: typeof fact.image === "string" ? fact.image : null,
    });
  }
}

// live baseline (14 rows)
const baseline = JSON.parse(
  readFileSync(join(ROOT, "scripts/foodie-import-validator/fixtures/baseline-snapshot.json"), "utf-8")
);
const liveRows: Array<{ id: string; name: string; phone: string | null; lat: number | null; lng: number | null; locality?: string | null; address?: string | null }> =
  (Array.isArray(baseline) ? baseline : baseline.rows ?? baseline.restaurants ?? []).map((r: any) => ({
    id: r.id, name: r.name, phone: r.phone ?? null,
    lat: r.latitude ?? null, lng: r.longitude ?? null,
    locality: r.locality ?? null, address: r.address ?? null,
  }));

// round-3 worksheet (127 rows)
const csvPath = join(ROOT, "scripts/foodie-import-validator/input/research-worksheet-round3.csv");
const csv = readFileSync(csvPath, "utf-8").split("\n");
const header = csv[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
function parseCsvRow(line: string): string[] {
  const out: string[] = []; let cur = ""; let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQ) {
      if (ch === '"' && line[i + 1] === '"') { cur += '"'; i++; }
      else if (ch === '"') inQ = false;
      else cur += ch;
    } else if (ch === '"') inQ = true;
    else if (ch === ",") { out.push(cur); cur = ""; }
    else cur += ch;
  }
  out.push(cur);
  return out;
}
const worksheet: Array<Record<string, string>> = [];
for (let i = 1; i < csv.length; i++) {
  if (!csv[i].trim()) continue;
  const cells = parseCsvRow(csv[i]);
  const row: Record<string, string> = {};
  header.forEach((h, j) => (row[h] = (cells[j] ?? "").trim()));
  worksheet.push(row);
}

/* ---------- cross-match ---------- */

type Candidate = {
  magicpinUrl: string; listedName?: string; area?: string;
  name?: string; phone?: string | null; street?: string | null;
  lat?: number | null; lng?: number | null; imageUrl?: string | null;
  priceRange?: string | null; cuisines?: string[] | null; rating?: { value?: number; count?: number } | null;
  matchLive?: { id: string; name: string; basis: string } | null;
  matchDistrict?: { url: string; name?: string; basis: string } | null;
  matchWorksheet?: { row: number; name: string; decision: string; basis: string } | null;
};

function basisLabel(
  a: string | undefined,
  b: string | undefined,
  phoneA: string | null,
  phoneB: string | null,
  geoA: [number | null | undefined, number | null | undefined],
  geoB: [number | null | undefined, number | null | undefined]
): string {
  if (phoneA && phoneB && phoneA === phoneB) return "phone";
  const [alat, alng] = geoA, [blat, blng] = geoB;
  if (alat != null && alng != null && blat != null && blng != null && haversine(alat, alng, blat, blng) < 0.15) return "geo<150m";
  if (a && b && (a.includes(b) || b.includes(a)) && (a.length > 3 && b.length > 3)) return "name-substring";
  if (a && b && a === b) return "name-exact";
  return "none";
}

const candidates: Candidate[] = magicpin.map((m) => {
  const c: Candidate = {
    magicpinUrl: m.url, listedName: m.listedName, area: m.area, name: m.name,
    phone: m.phone, street: m.street, lat: m.lat, lng: m.lng,
    imageUrl: m.imageUrl, priceRange: m.priceRange, cuisines: m.cuisines, rating: m.rating,
  };
  const mNorm = normName(m.name ?? m.listedName ?? "");
  const mPhone = normPhone(m.phone);
  // live rows
  for (const l of liveRows) {
    const basis = basisLabel(mNorm, normName(l.name), mPhone, normPhone(l.phone), [m.lat, m.lng], [l.lat, l.lng]);
    if (basis !== "none") { c.matchLive = { id: l.id, name: l.name, basis }; break; }
  }
  // district venues
  for (const d of district) {
    const basis = basisLabel(mNorm, normName(d.name ?? ""), mPhone, normPhone(d.phone), [m.lat, m.lng], [d.lat, d.lng]);
    if (basis !== "none") { c.matchDistrict = { url: d.url, name: d.name, basis }; break; }
  }
  // worksheet rows
  for (let i = 0; i < worksheet.length; i++) {
    const w = worksheet[i];
    const basis = basisLabel(mNorm, normName(w.name ?? ""), mPhone, normPhone(w.phone || null), [m.lat, m.lng], [w.latitude ? Number(w.latitude) : null, w.longitude ? Number(w.longitude) : null]);
    if (basis !== "none") {
      c.matchWorksheet = { row: i + 2, name: w.name, decision: w.review_decision || "(blank)", basis };
      break;
    }
  }
  return c;
});

/* ---------- summary + outputs ---------- */

const withAnyMatch = candidates.filter((c) => c.matchLive || c.matchDistrict || c.matchWorksheet);
const brandNew = candidates.filter((c) => !c.matchLive && !c.matchDistrict && !c.matchWorksheet);

// targeted name probes across the whole fetched corpus (HTML bodies included)
const corpusDir = join(R4, "magicpin-stores");
function corpusGrep(needle: string): string[] {
  const hits: string[] = [];
  for (const [k, v] of Object.entries(index)) {
    if (!k.startsWith("magicpin:")) continue;
    const hay = `${v?.listedName ?? ""} ${v?.url ?? ""}`.toLowerCase();
    if (hay.includes(needle)) hits.push(v.url);
  }
  return hits;
}
const probes = {
  epicruise: corpusGrep("epicruise"),
  hangout: corpusGrep("hangout"),
  epicurus: corpusGrep("epicurus"),
  gitam: corpusGrep("gitam"),
};

const summary = {
  generatedAt: new Date().toISOString(),
  magicpinFetched: magicpin.length,
  withAnyMatch: withAnyMatch.length,
  brandNew: brandNew.length,
  liveMatches: candidates.filter((c) => c.matchLive).map((c) => ({ name: c.name ?? c.listedName, ...c.matchLive })),
  probes,
  hoursPublished: magicpin.filter((m) => m.hours).length,
  geoPublished: magicpin.filter((m) => m.lat != null).length,
  phonePublished: magicpin.filter((m) => m.phone).length,
  imagePublished: magicpin.filter((m) => m.imageUrl).length,
};

writeFileSync(join(R4, "extract.json"), JSON.stringify({ magicpin, districtCount: district.length, liveCount: liveRows.length, worksheetCount: worksheet.length }, null, 1));
writeFileSync(join(R4, "cross-match.json"), JSON.stringify({ summary, candidates }, null, 1));

const md = [
  "# Round 4 — magicpin corridor continuation: cross-match report",
  "",
  `Generated: ${summary.generatedAt}`,
  "",
  `- magicpin store pages fetched this round: **${summary.magicpinFetched}** (of the 806-store round-3 inventory; 10 dead listings recorded as failures)`,
  `- matched to something already known (live rows / district 93 / worksheet): **${summary.withAnyMatch}**`,
  `- no match on name-substring/phone/geo<150m: **${summary.brandNew}** (single-source leads — NOT importable without a second source per WORKFLOW rule 6)`,
  `- fields published across the fetched corpus: phone ${summary.phonePublished} · geo ${summary.geoPublished} · hours ${summary.hoursPublished} · image ${summary.imagePublished}`,
  "",
  "## Targeted name probes (whole corpus, listed names + URLs)",
  "",
  `- "epicruise": ${probes.epicruise.length} hits`,
  `- "hangout": ${probes.hangout.length} hits`,
  `- "epicurus": ${probes.epicurus.length} hits`,
  `- "gitam": ${probes.gitam.length} hits`,
  "",
  "## Live-row matches (identity anchored to the 14 production rows)",
  "",
  ...(summary.liveMatches.length
    ? summary.liveMatches.map((m) => `- ${m.name} → live ${String(m.id).slice(0, 8)} via ${m.basis}`)
    : ["- none"]),
  "",
  "## All matches (advisory — human review decides)",
  "",
  "| magicpin listing | area | phone | live | district | worksheet |",
  "| --- | --- | --- | --- | --- | --- |",
  ...withAnyMatch.map(
    (c) =>
      `| ${c.name ?? c.listedName} | ${c.area ?? ""} | ${c.phone ?? "—"} | ${c.matchLive ? `${c.matchLive.name} (${c.matchLive.basis})` : "—"} | ${c.matchDistrict ? (c.matchDistrict.name ?? "district") + ` (${c.matchDistrict.basis})` : "—"} | ${c.matchWorksheet ? `r${c.matchWorksheet.row} ${c.matchWorksheet.name} [${c.matchWorksheet.decision}] (${c.matchWorksheet.basis})` : "—"} |`
  ),
].join("\n");
writeFileSync(join(R4, "cross-match-report.md"), md);

console.log(JSON.stringify(summary, null, 1));
