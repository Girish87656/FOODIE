/**
 * Foodie — Prototype 3 place research (Tirupati Area A + GITAM corridor expansion).
 *
 * Three resumable phases, all strictly read-only against external services:
 *   1. discovery — a FIXED, small set of listing queries per area (z-ai web_search).
 *      Candidate extraction is conservative: only title/url patterns from real
 *      listing platforms; aggregator city pages and directories are dropped.
 *   2. verify — ONE identity query per candidate: `"<name>" <area> address`.
 *      A candidate keeps its evidence (title, snippet, url, host) and is
 *      area-gated: the verification text MUST name the area (the same-name
 *      trap lesson from the photo deep pass — a metro name is NOT area proof).
 *   3. geocode — OpenStreetMap Nominatim (public, keyless, 1 req/s, UA set).
 *      Area-gated too: display_name must contain the area token, else the row
 *      keeps NULL coordinates (the live schema supports NULL = "Location
 *      pending verification"). Coordinates are geocoded, never estimated.
 *
 * Outputs (evidence first, worksheet second):
 *   evidence/places-p3/discovery.json
 *   evidence/places-p3/verify-<slug>.json
 *   evidence/places-p3/geocode-<slug>.json
 *   worksheets/places-p3.json          ← consolidated, human-reviewed rows
 *
 * Usage:
 *   bun scripts/foodie-enrichment/research-places-p3.ts discovery
 *   bun scripts/foodie-enrichment/research-places-p3.ts verify   [slug]
 *   bun scripts/foodie-enrichment/research-places-p3.ts geocode  [slug]
 *   bun scripts/foodie-enrichment/research-places-p3.ts worksheet
 */

import { mkdirSync, writeFileSync, existsSync, readFileSync } from "fs";
import { join } from "path";
import { politeFetch, RESEARCH_UA, slugify } from "./lib/live";

const ROOT = process.cwd();
const HERE = join(ROOT, "scripts", "foodie-enrichment");
const EV = join(HERE, "evidence", "places-p3");
const WS = join(HERE, "worksheets");
mkdirSync(EV, { recursive: true });
mkdirSync(WS, { recursive: true });
const RETRIEVED = new Date().toISOString().slice(0, 10);

const phase = (process.argv[2] ?? "").toLowerCase();
const only = process.argv[3] ?? null;

if (!["discovery", "verify", "geocode", "worksheet"].includes(phase)) {
  console.error("usage: research-places-p3.ts <discovery|verify|geocode|worksheet> [slug]");
  process.exit(2);
}

/* ------------------------------------------------------------------ */
/* Area definitions — the two Prototype 3 test areas                   */
/* ------------------------------------------------------------------ */

interface Area {
  key: "tirupati" | "gitam";
  city: string; // exact restaurants.city value for the destination browser
  areaTokens: RegExp; // case-insensitive gate on verification text
  discovery: string[]; // fixed listing queries (num results each)
  categoryHints: Array<{ test: RegExp; category: string; tag?: string }>;
}

const AREAS: Area[] = [
  {
    key: "tirupati",
    city: "Tirupati",
    areaTokens: /\btirupati\b/i,
    // Primary tourism & hospitality area: hotels/resorts/lodges + food.
    discovery: [
      "hotels in Tirupati Andhra Pradesh",
      "resorts near Tirupati Andhra Pradesh",
      "lodges near Tirupati railway station",
      "best restaurants in Tirupati",
      "cafes in Tirupati",
      "bakeries in Tirupati",
      "family restaurants Tirupati Andhra Pradesh",
      // round 2 — individual verified leads + platform-targeted food queries
      '"Holiday Inn Tirupati" Tirumala',
      '"Lake Valley Resort" Tirupati',
      '"Starlit Suites" Tirupati Club Mahindra',
      '"Tirupati Lodge"',
      "Tirupati famous biryani restaurant",
      "South Indian thali restaurant Tirupati",
      "Tirupati street food famous justdial",
      "cake shop Tirupati justdial",
      // round 3 — dedicated food-platform queries (rounds 1-2 were hotel-heavy)
      "Tirupati restaurants zomato",
      "Tirupati dining swiggy restaurant",
      "eazydiner Tirupati restaurants deals",
      "magicpin Tirupati restaurants",
    ],
    categoryHints: [
      { test: /resort/i, category: "hotel", tag: "resort" },
      { test: /lodge/i, category: "hotel", tag: "lodge" },
      { test: /\bhotel\b|guest ?house|inn\b/i, category: "hotel" },
      { test: /\bcafe\b|coffee/i, category: "cafe" },
      { test: /bakery|sweets|ice cream/i, category: "bakery_sweets" },
      { test: /tiffin|breakfast|idli|dosa|vada/i, category: "tiffin" },
      { test: /restaurant|dining|food|grill|biryani/i, category: "restaurant" },
    ],
  },
  {
    key: "gitam",
    city: "Doddaballapura",
    areaTokens: /\b(doddaballapur(a)?|gitam|nagadenahalli)\b/i,
    discovery: [
      '"Epicruise" Doddaballapur',
      '"Epicruise" Doddaballapura food',
      '"Hangouts" GITAM University Doddaballapur',
      "restaurants near GITAM University Doddaballapur Bengaluru",
      "cafes and bakeries Doddaballapura town",
      // round 2 — identity verification for discovered corridor businesses
      '"Desi Family Dhaba" Nagadenahalli',
      '"Nanjundeshwara Bakery" Doddaballapur',
      '"Kouzina Kafe" Doddaballapura',
      '"Home\'s Kitchen" Doddaballapura',
    ],
    categoryHints: [
      { test: /\bcafe\b|coffee/i, category: "cafe" },
      { test: /bakery|sweets|ice cream/i, category: "bakery_sweets" },
      { test: /tiffin|breakfast/i, category: "tiffin" },
      { test: /restaurant|dining|food|biryani|grill/i, category: "restaurant" },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Listing-platform extraction — conservative on purpose               */
/* ------------------------------------------------------------------ */

/** Hosts that are business listing pages (candidate source of truth). */
const LISTING_HOSTS: Array<{ test: RegExp; kind: string }> = [
  { test: /(^|\.)justdial\.com$/i, kind: "justdial" },
  { test: /(^|\.)zomato\.com$/i, kind: "zomato" },
  { test: /(^|\.)magicpin\.in$/i, kind: "magicpin" },
  { test: /(^|\.)district\.in$/i, kind: "district" },
  { test: /(^|\.)oyorooms\.com$/i, kind: "oyo" },
  { test: /(^|\.)makemytrip\.com$/i, kind: "makemytrip" },
  { test: /(^|\.)goibibo\.com$/i, kind: "goibibo" },
  { test: /(^|\.)booking\.com$/i, kind: "booking" },
  { test: /(^|\.)agoda\.com$/i, kind: "agoda" },
  { test: /(^|\.)fabhotels\.com$/i, kind: "fabhotels" },
  { test: /(^|\.)treebo\.com$/i, kind: "treebo" },
  { test: /(^|\.)easemytrip\.com$/i, kind: "easemytrip" },
  { test: /(^|\.)yatra\.com$/i, kind: "yatra" },
  { test: /(^|\.)cleartrip\.com$/i, kind: "cleartrip" },
  { test: /(^|\.)(eazydiner|wanderlog)\.com$/i, kind: "eazydiner" },
  // OFFICIAL brand/property domains — the STRONGEST identity evidence
  { test: /(^|\.)ihg\.com$/i, kind: "official" },
  { test: /(^|\.)tajhotels\.com$/i, kind: "official" },
  { test: /(^|\.)clubmahindra\.com$/i, kind: "official" },
  { test: /(^|\.)lakevalleyresort\.in$/i, kind: "official" },
  { test: /(^|\.)tirupatilodge\.com$/i, kind: "official" },
  { test: /(^|\.)yatradham\.org$/i, kind: "official" },
  { test: /(^|\.)justbake\.in$/i, kind: "official" },
];

const AGGREGATOR_URL_HINT = /(top-|best-|list|near-me|hotels-in-|restaurants-in-|\/collection\/)/i;

interface Hit {
  url: string;
  name: string | null;
  snippet: string | null;
  host: string;
  kind: string | null;
}

interface Candidate {
  area: string;
  name: string;
  category: string;
  tags: string[];
  sourceUrl: string;
  sourceKind: string;
  evidenceUrl: string; // the discovery hit URL it was extracted from
  verification: {
    queried: boolean;
    areaConfirmed: boolean;
    addressEvidence: string | null;
    hits: Hit[];
    errors: string[];
    retrievedOn: string | null;
  };
  geocode: {
    queried: boolean;
    lat: number | null;
    lng: number | null;
    displayName: string | null;
    osmType: string | null;
    areaConfirmed: boolean;
    note: string | null;
    retrievedOn: string | null;
  };
  review: "needs_human_review" | "approved";
  reviewNotes: string[];
}

function hostOf(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    return "?";
  }
}

function classifyHit(url: string): string | null {
  const host = hostOf(url);
  const found = LISTING_HOSTS.find((l) => l.test.test(host));
  return found ? found.kind : null;
}

/** Extract a business name from a listing title, stripping site suffixes. */
function extractName(title: string, kind: string | null): string | null {
  let t = title.trim();
  if (!t) return null;
  // drop common site suffixes: " | JustDial", " - Zomato", "· MakeMyTrip"…
  t = t.replace(/\s*[|·—\-–]\s*(justdial|zomato|magicpin|district|oyo|makemytrip|make my trip|goibibo|booking\.com|agoda|fabhotels|treebo|easemytrip|yatra|cleartrip|tripadvisor).*$/i, "");
  t = t.replace(/\s*\|\s*.{0,40}$/i, (m) => (m.length > 4 ? "" : m));
  // hotel-aggregator titles often look like "Minerva Grand Tirupati" — fine.
  t = t.replace(/\s*\((?:[^)]{0,30})\)\s*$/, " "); // trailing parenthetical
  t = t.replace(/\s{2,}/g, " ").trim();
  if (t.length < 4 || t.length > 80) return null;
  // reject obvious directory/aggregate page titles
  if (/\b(THE\s+)?\d*\s*BEST\b|\bTOP\s+\d+\b|CLOSEST|CHECKOUT\b|FIND AND COMPARE|PRICE/i.test(t)) return null;
  if (/^(top|best|list of|book |search |highly rated|iconic|aesthetic|good |best \d+)/i.test(t)) return null;
  if (/^(hotels?|resorts?|lodges?|restaurants?|cafes?|cafe|bakeries?|places?|things to do|accommodation)\b.*\b(in|near|at|from|to)\b/i.test(t)) return null;
  if (/\b(hotels?|resorts?|lodges?|restaurants?|cafes?|bakeries?)\s+(in|near|at)\s+\w/i.test(t) && /\b(best|top|book|find|compare|search|from \$|@|list)/i.test(t)) return null;
  if (/cake delivery|order (online|cakes)|page \d+|travel[- ]guide|route (guide|guidline)/i.test(t)) return null;
  // "near me" style
  if (/near me|nearby/i.test(t)) return null;
  if (!kind) return null; // candidates must come from a known listing platform
  return t;
}

function categorize(area: Area, name: string): { category: string; tags: string[] } {
  for (const hint of area.areaTokens ? area.categoryHints : []) {
    if (hint.test.test(name)) return { category: hint.category, tags: hint.tag ? [hint.tag] : [] };
  }
  return { category: "restaurant", tags: [] };
}

/* ------------------------------------------------------------------ */
/* web_search (z-ai) with pacing                                       */
/* ------------------------------------------------------------------ */

async function webSearch(query: string, num: number): Promise<Hit[]> {
  const { default: ZAI } = await import("z-ai-web-dev-sdk");
  const zai = await ZAI.create();
  const results = (await zai.functions.invoke("web_search", { query, num })) as Array<{
    url?: string;
    name?: string;
    snippet?: string;
  }>;
  return (results ?? [])
    .filter((r) => r.url)
    .map((r) => ({
      url: r.url as string,
      name: r.name ?? null,
      snippet: r.snippet ?? null,
      host: hostOf(r.url as string),
      kind: classifyHit(r.url as string),
    }));
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/* ------------------------------------------------------------------ */
/* Phase 1: discovery                                                  */
/* ------------------------------------------------------------------ */

async function runDiscovery(): Promise<void> {
  // Resumable per-query: an existing discovery.json keeps its results; only
  // queries not yet recorded are executed (budget discipline).
  const prevFile = join(EV, "discovery.json");
  const all: Record<string, Array<{ query: string; hits: Hit[]; retrievedOn: string; error?: string }>> =
    existsSync(prevFile)
      ? (JSON.parse(readFileSync(prevFile, "utf8")).areas as typeof all)
      : {};
  for (const area of AREAS) {
    all[area.key] = all[area.key] ?? [];
    for (const query of area.discovery) {
      if (all[area.key].some((e) => e.query === query)) continue; // already recorded
      console.log(`[discovery] ${area.key}: "${query}"`);
      let hits: Hit[] = [];
      let err: string | null = null;
      try {
        hits = await webSearch(query, 10);
      } catch (e) {
        err = (e as Error).message;
        if (/429|rate/i.test(err)) {
          console.log("[discovery] 429 — backing off 45s");
          await sleep(45_000);
          try {
            hits = await webSearch(query, 10);
            err = null;
          } catch (e2) {
            err = `retry failed: ${(e2 as Error).message}`;
          }
        } else if (/No search results/i.test(err)) {
          // a 422 "no results" is itself recorded evidence (e.g. Epicruise)
          console.log("[discovery] no results (recorded as evidence)");
          hits = [];
          err = "no-results";
        }
      }
      all[area.key].push(err ? { query, hits, retrievedOn: RETRIEVED, error: err } : { query, hits, retrievedOn: RETRIEVED });
      console.log(`  → ${hits.length} hits`);
      writeFileSync(prevFile, JSON.stringify({ retrievedOn: RETRIEVED, areas: all }, null, 2)); // persist per query
      await sleep(3500); // gentle pacing between queries
    }
  }
  console.log("[discovery] DONE → evidence/places-p3/discovery.json");
}

/* ------------------------------------------------------------------ */
/* Phase 2: candidate extraction + identity verification               */
/* ------------------------------------------------------------------ */

interface DiscoveryFile {
  retrievedOn: string;
  areas: Record<string, Array<{ query: string; hits: Hit[] }>>;
}

function loadDiscovery(): DiscoveryFile {
  return JSON.parse(readFileSync(join(EV, "discovery.json"), "utf8")) as DiscoveryFile;
}

function buildCandidates(): Candidate[] {
  const disc = loadDiscovery();
  const bySlug = new Map<string, Candidate>();
  for (const area of AREAS) {
    for (const entry of disc.areas[area.key] ?? []) {
      for (const hit of entry.hits ?? []) {
        if (!hit.kind || !hit.name) continue;
        if (AGGREGATOR_URL_HINT.test(hit.url)) continue;
        const name = extractName(hit.name, hit.kind);
        if (!name) continue;
        // area gate on the TITLE: the listing must name the area itself
        if (!area.areaTokens.test(hit.name) && !area.areaTokens.test(hit.snippet ?? "")) continue;
        const slug = slugify(`${area.key}-${name}`);
        if (bySlug.has(slug)) continue;
        const { category, tags } = categorize(area, name);
        bySlug.set(slug, {
          area: area.key,
          name,
          category,
          tags,
          sourceUrl: hit.url,
          sourceKind: hit.kind,
          evidenceUrl: hit.url,
          verification: { queried: false, areaConfirmed: false, addressEvidence: null, hits: [], errors: [], retrievedOn: null },
          geocode: { queried: false, lat: null, lng: null, displayName: null, osmType: null, areaConfirmed: false, note: null, retrievedOn: null },
          review: "needs_human_review",
          reviewNotes: [`extracted from ${hit.kind} listing (title area-gated)`],
        });
      }
    }
  }
  return [...bySlug.values()];
}

async function runVerify(onlySlug: string | null): Promise<void> {
  const candidates = buildCandidates();
  console.log(`[verify] ${candidates.length} candidates extracted from discovery`);
  let done = 0;
  for (const c of candidates) {
    const slug = slugify(`${c.area}-${c.name}`);
    if (onlySlug && slug !== onlySlug) continue;
    const file = join(EV, `verify-${slug}.json`);
    if (existsSync(file)) {
      const prev = JSON.parse(readFileSync(file, "utf8")) as { retrievedOn: string };
      if (prev.retrievedOn === RETRIEVED) {
        done++;
        continue;
      }
    }
    const area = AREAS.find((a) => a.key === c.area)!;
    const query = `"${c.name}" ${area.city} address`;
    let hits: Hit[] = [];
    const errors: string[] = [];
    try {
      hits = await webSearch(query, 6);
    } catch (e) {
      const msg = (e as Error).message;
      errors.push(msg);
      if (/429|rate/i.test(msg)) {
        console.log(`[verify] 429 at ${c.name} — backing off 60s`);
        await sleep(60_000);
        try {
          hits = await webSearch(query, 6);
          errors.pop();
        } catch (e2) {
          errors.push(`retry failed: ${(e2 as Error).message}`);
          writeFileSync(file, JSON.stringify({ candidate: { name: c.name, area: c.area }, query, hits: [], errors, retrievedOn: RETRIEVED, skipped: true }, null, 2));
          done++;
          continue;
        }
      }
    }
    const allText = hits.map((h) => `${h.name ?? ""} ${h.snippet ?? ""}`).join(" \n ");
    const areaConfirmed = area.areaTokens.test(allText);
    // address evidence: a snippet that carries pincode/road/locality patterns
    const addressHit = hits.find((h) =>
      /\b\d{6}\b|road|street|nagar|colony|layout|circle| OPP\.|opp\.|near /i.test(`${h.name ?? ""} ${h.snippet ?? ""}`)
    );
    const payload = {
      candidate: { name: c.name, area: c.area, sourceUrl: c.sourceUrl },
      query,
      hits,
      areaConfirmed,
      addressEvidence: addressHit ? `${addressHit.name ?? ""} :: ${addressHit.snippet ?? ""}`.slice(0, 400) : null,
      errors,
      retrievedOn: RETRIEVED,
    };
    writeFileSync(file, JSON.stringify(payload, null, 2));
    done++;
    console.log(`[verify] ${done}: ${c.name} — area:${areaConfirmed ? "OK" : "NOT-CONFIRMED"} addr:${addressHit ? "yes" : "no"}`);
    await sleep(3500);
  }
  console.log(`[verify] DONE — ${done} candidates`);
}

/* ------------------------------------------------------------------ */
/* Phase 3: geocoding (Nominatim, keyless, 1 req/s, area-gated)        */
/* ------------------------------------------------------------------ */

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
  osm_type?: string;
  type?: string;
  importance?: number;
}

async function runGeocode(onlySlug: string | null): Promise<void> {
  const candidates = buildCandidates();
  for (const c of candidates) {
    const slug = slugify(`${c.area}-${c.name}`);
    if (onlySlug && slug !== onlySlug) continue;
    const vFile = join(EV, `verify-${slug}.json`);
    if (!existsSync(vFile)) continue; // not verified yet
    const v = JSON.parse(readFileSync(vFile, "utf8")) as { areaConfirmed?: boolean };
    if (!v.areaConfirmed) continue; // never geocode an area-unconfirmed name
    const gFile = join(EV, `geocode-${slug}.json`);
    if (existsSync(gFile)) {
      const prev = JSON.parse(readFileSync(gFile, "utf8")) as { retrievedOn: string };
      if (prev.retrievedOn === RETRIEVED) continue;
    }
    const area = AREAS.find((a) => a.key === c.area)!;
    const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=3&countrycodes=in&q=${encodeURIComponent(`${c.name}, ${area.city}`)}`;
    let note: string | null = null;
    let best: NominatimResult | null = null;
    try {
      const res = await politeFetch(url, { "User-Agent": RESEARCH_UA, Accept: "application/json" });
      if (!res.ok) {
        note = `nominatim HTTP ${res.status}`;
      } else {
        const results = (await res.json()) as NominatimResult[];
        // Area gate: the matched place MUST sit in the area (city/district token)
        const gated = results.find((r) => area.areaTokens.test(r.display_name));
        if (!gated) {
          note = `no result with area token (${results.length} candidates, all outside ${area.city})`;
        } else {
          best = gated;
        }
      }
    } catch (e) {
      note = (e as Error).message;
    }
    const payload = {
      candidate: { name: c.name, area: c.area },
      query: `${c.name}, ${area.city}`,
      lat: best ? Number(best.lat) : null,
      lng: best ? Number(best.lon) : null,
      displayName: best?.display_name ?? null,
      osmType: best ? `${best.osm_type ?? "?"}/${best.type ?? "?"}` : null,
      areaConfirmed: !!best,
      note,
      retrievedOn: RETRIEVED,
    };
    writeFileSync(gFile, JSON.stringify(payload, null, 2));
    console.log(`[geocode] ${c.name} → ${best ? `${payload.lat},${payload.lng} (${payload.osmType})` : `NULL (${note ?? "?"})`}`);
  }
  console.log("[geocode] DONE");
}

/* ------------------------------------------------------------------ */
/* Phase 4: worksheet consolidation (human review happens HERE)        */
/* ------------------------------------------------------------------ */

async function runWorksheet(): Promise<void> {
  const candidates = buildCandidates();
  const rows: Candidate[] = [];
  for (const c of candidates) {
    const slug = slugify(`${c.area}-${c.name}`);
    const vFile = join(EV, `verify-${slug}.json`);
    const gFile = join(EV, `geocode-${slug}.json`);
    const row: Candidate = { ...c, reviewNotes: [...c.reviewNotes] };
    if (existsSync(vFile)) {
      const v = JSON.parse(readFileSync(vFile, "utf8")) as {
        areaConfirmed?: boolean; addressEvidence?: string | null; hits?: Hit[]; retrievedOn?: string; skipped?: boolean;
      };
      row.verification = {
        queried: true,
        areaConfirmed: !!v.areaConfirmed,
        addressEvidence: v.addressEvidence ?? null,
        hits: v.hits ?? [],
        errors: [],
        retrievedOn: v.retrievedOn ?? null,
      };
      if (v.skipped) row.reviewNotes.push("verification rate-limited (skipped run)");
      if (!v.areaConfirmed) row.reviewNotes.push("AREA NOT CONFIRMED — candidate excluded from SQL");
    } else {
      row.reviewNotes.push("verification pending");
    }
    if (existsSync(gFile)) {
      const g = JSON.parse(readFileSync(gFile, "utf8")) as {
        lat: number | null; lng: number | null; displayName: string | null; osmType: string | null; areaConfirmed: boolean; note: string | null; retrievedOn: string;
      };
      row.geocode = {
        queried: true,
        lat: g.lat,
        lng: g.lng,
        displayName: g.displayName,
        osmType: g.osmType,
        areaConfirmed: g.areaConfirmed,
        note: g.note,
        retrievedOn: g.retrievedOn,
      };
      if (g.areaConfirmed) row.reviewNotes.push("coordinates geocoded via OSM Nominatim (area-gated)");
      else row.reviewNotes.push(`coordinates NULL (${g.note ?? "geocode failed"})`);
    }
    rows.push(row);
  }
  const summary = {
    retrievedOn: RETRIEVED,
    total: rows.length,
    byArea: rows.reduce<Record<string, number>>((acc, r) => ((acc[r.area] = (acc[r.area] ?? 0) + 1), acc), {}),
    byCategory: rows.reduce<Record<string, number>>((acc, r) => ((acc[r.category] = (acc[r.category] ?? 0) + 1), acc), {}),
    areaConfirmed: rows.filter((r) => r.verification.areaConfirmed).length,
    geocoded: rows.filter((r) => r.geocode.areaConfirmed).length,
    note: "rows are candidates with recorded evidence; only area-confirmed rows with reviewed identity enter a generated SQL batch, after explicit human approval",
  };
  writeFileSync(join(WS, "places-p3.json"), JSON.stringify({ summary, rows }, null, 2));
  console.log(`[worksheet] ${rows.length} rows (${summary.areaConfirmed} area-confirmed, ${summary.geocoded} geocoded) → worksheets/places-p3.json`);
}

switch (phase) {
  case "discovery":
    runDiscovery().catch((e) => { console.error("FATAL:", e); process.exit(1); });
    break;
  case "verify":
    runVerify(only).catch((e) => { console.error("FATAL:", e); process.exit(1); });
    break;
  case "geocode":
    runGeocode(only).catch((e) => { console.error("FATAL:", e); process.exit(1); });
    break;
  case "worksheet":
    runWorksheet().catch((e) => { console.error("FATAL:", e); process.exit(1); });
    break;
}
