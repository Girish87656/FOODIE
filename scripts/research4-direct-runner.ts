/**
 * Foodie — Research round 4 direct runner (Part 2).
 *
 * Systematic CONTINUATION of the round-3 enumeration using only channels that
 * are proven accessible from this sandbox (general search engines are walled:
 * Bing serves canned content, DDG/Mojeek refuse connections, Ecosia 403,
 * Yandex captcha-redirect, z-ai gateway 429-quota-exhausted — probes logged in
 * tool-results/research4/logs/access-probes.log).
 *
 * Channels used here (same legitimacy basis as round 3):
 *   1. district.in robots-declared dining sitemap shards -> NEW venue pages
 *      (diffed against the 93 already fetched in round 3), JSON-LD captured.
 *   2. magicpin robots-declared corridor store sitemaps -> the 806-store
 *      inventory from round 3, now FETCHED systematically (JSON-LD with
 *      phone/geo/hours where published), priority-ordered by target zone.
 *   3. OpenStreetMap Overpass API (ODbL) -> food POIs across the target-area
 *      bboxes for cross-matching (single-source leads by themselves).
 *
 * Checkpointed + idempotent: raw response per URL is saved BEFORE parsing;
 * finished items are skipped on re-run. Index: tool-results/research4/index.json.
 *
 * Usage: bun scripts/research4-direct-runner.ts [maxMinutes] (default 45)
 */
import { mkdirSync, writeFileSync, existsSync, readFileSync, appendFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const ROOT = "/home/z/my-project";
const OUT = join(ROOT, "tool-results/research4");
const DISTRICT = join(OUT, "district-new");
const MAGICPIN = join(OUT, "magicpin-stores");
const OSM = join(OUT, "osm");
const LOG = join(OUT, "logs/runner-direct.log");
const INDEX = join(OUT, "index.json");
const MAX_MINUTES = Number(process.argv[2] ?? 45);
const DEADLINE = Date.now() + MAX_MINUTES * 60_000;

for (const d of [DISTRICT, MAGICPIN, OSM, join(OUT, "logs")]) mkdirSync(d, { recursive: true });

function log(line: string) {
  const ts = new Date().toISOString();
  const row = `[${ts}] ${line}`;
  try { appendFileSync(LOG, row + "\n"); } catch { /* keep going */ }
  console.log(row);
}

const UA = "Mozilla/5.0 (X11; Linux x86_64; rv:120.0) Gecko/20100101 Firefox/120.0";

async function get(url: string, timeoutMs = 30_000): Promise<{ http: number; body: string; finalUrl: string }> {
  const res = await fetch(url, {
    headers: { "User-Agent": UA, "Accept-Language": "en-US,en;q=0.9" },
    signal: AbortSignal.timeout(timeoutMs),
    redirect: "follow",
  });
  const body = await res.text();
  return { http: res.status, body, finalUrl: res.url || url };
}

function safeName(url: string): string {
  return url
    .replace(/^https?:\/\//, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .slice(0, 150)
    .replace(/-+$/, "");
}

function extractJsonLd(html: string): unknown[] {
  const out: unknown[] = [];
  const re = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    try { out.push(JSON.parse(m[1])); } catch { /* malformed block ignored */ }
  }
  return out;
}

/* ---------------- index ---------------- */

type PageRecord = {
  url: string; http: number; finalUrl?: string; fetchedAt: string;
  jsonld?: unknown; textLength?: number; error?: string; source: string;
  area?: string; listedName?: string;
};

function loadIndex(): Record<string, PageRecord> {
  if (existsSync(INDEX)) {
    try { return JSON.parse(readFileSync(INDEX, "utf-8")); } catch { return {}; }
  }
  return {};
}
const index = loadIndex();
function saveIndex() { writeFileSync(INDEX, JSON.stringify(index, null, 1)); }

/* ---------------- 1. district shard diff ---------------- */

const AREA_TOKENS = [
  "doddaballapura", "doddaballapur", "bashettihalli", "nagadenahalli", "nagenahalli",
  "rajanukunte", "soladevanahalli", "moparahalli", "heggadahalli", "dabaspet",
  "scout-camp", "byradenahalli", "kodihalli", "thimmasandra",
];

async function districtShardDiff(): Promise<string[]> {
  const known = new Set<string>();
  const digestPath = join(ROOT, "tool-results/research3/sitemap/digest.json");
  if (existsSync(digestPath)) {
    const digest = JSON.parse(readFileSync(digestPath, "utf-8")) as Array<{ url: string }>;
    for (const d of digest) known.add(d.url.replace(/\/+$/, ""));
  }
  log(`district diff baseline: ${known.size} known venue URLs from round 3`);

  const candidates = new Set<string>();
  for (let i = 1; i <= 8; i++) {
    const shard = `https://cdn.district.in/sitemap/sitemap-restaurant-pages${i}.xml.gz`;
    try {
      const res = await fetch(shard, {
        headers: { "User-Agent": UA },
        signal: AbortSignal.timeout(60_000),
      });
      if (!res.ok) { log(`shard ${i}: HTTP ${res.status}`); continue; }
      const buf = Buffer.from(await res.arrayBuffer());
      const { gunzipSync } = await import("node:zlib");
      const xml = gunzipSync(buf).toString("utf-8");
      const locs = [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((m) => m[1]);
      let hit = 0;
      for (const loc of locs) {
        const low = loc.toLowerCase();
        if (!low.includes("/dining/")) continue;
        if (AREA_TOKENS.some((t) => low.includes(t))) { candidates.add(loc.replace(/\/+$/, "")); hit++; }
      }
      log(`shard ${i}: ${locs.length} locs, ${hit} area candidates`);
    } catch (e) {
      log(`shard ${i} FAIL: ${(e as Error).message.slice(0, 100)}`);
    }
    await new Promise((r) => setTimeout(r, 1200));
  }
  const fresh = [...candidates].filter((u) => !known.has(u));
  log(`district diff: ${candidates.size} area URLs total, ${fresh.length} NEW vs round-3`);
  writeFileSync(join(OUT, "district-new-urls.json"), JSON.stringify({ total: candidates.size, fresh, knownCount: known.size }, null, 1));
  return fresh;
}

async function fetchDistrictNew(urls: string[]) {
  let done = 0;
  for (const url of urls) {
    if (Date.now() > DEADLINE) { log("deadline: district fetch pause"); return; }
    const key = `district:${url}`;
    if (index[key]) { done++; continue; }
    try {
      const r = await get(url);
      writeFileSync(join(DISTRICT, `${safeName(url)}.html`), r.body);
      const rec: PageRecord = {
        url, http: r.http, finalUrl: r.finalUrl, fetchedAt: new Date().toISOString(),
        jsonld: extractJsonLd(r.body), textLength: r.body.length, source: "district.in-venue-page",
      };
      index[key] = rec;
      saveIndex();
      log(`district [${++done}/${urls.length}] ${r.http} ${url.slice(-60)}`);
    } catch (e) {
      index[key] = { url, http: 0, fetchedAt: new Date().toISOString(), error: (e as Error).message.slice(0, 160), source: "district.in-venue-page" };
      saveIndex();
      log(`district [${++done}/${urls.length}] FAIL ${url.slice(-60)}: ${(e as Error).message.slice(0, 80)}`);
    }
    await new Promise((r) => setTimeout(r, 1400 + Math.random() * 800));
  }
}

/* ---------------- 2. magicpin corridor stores ---------------- */

async function magicpinStores() {
  let stores: Array<{ area: string; cat: string; name: string; url: string; sid: string }> = [];
  const src = "/tmp/magicpin-corridor-food-stores.json";
  if (existsSync(src)) stores = JSON.parse(readFileSync(src, "utf-8"));
  if (!stores.length) { log("magicpin inventory missing — skip"); return; }

  // priority zones first (immediate target area), then wider corridor
  const PRIORITY = ["Doddaballapur", "Bashettihalli", "Soladevanahalli", "Nagenahalli", "Hessarghatta-Road", "Doddaballapur-Road"];
  const ordered = [
    ...stores.filter((s) => PRIORITY.includes(s.area)),
    ...stores.filter((s) => s.area === "Rajanukunte"),
    ...stores.filter((s) => s.area === "Nandi-Hills"),
  ];

  // skip URLs whose raw html already exists from round 3 (any dir)
  const priorHtml = new Set<string>();
  for (const dir of ["tool-results/research3/direct", "tool-results/research3/crossmatch", "tool-results/research3/branches"]) {
    const p = join(ROOT, dir);
    if (existsSync(p)) {
      for (const f of readdirSync(p)) {
        if (f.endsWith(".html")) priorHtml.add(f.replace(/\.html$/, ""));
      }
    }
  }

  let done = 0;
  const CONCURRENCY = Number(process.env.RESEARCH4_CONCURRENCY ?? 3);
  async function worker(wid: number) {
    for (;;) {
      if (Date.now() > DEADLINE) return;
      const s = ordered[done];
      if (!s) return;
      done++;
      const key = `magicpin:${s.sid}`;
      const fname = safeName(s.url);
      if (index[key] || priorHtml.has(fname)) continue;
      try {
        const r = await get(s.url);
        writeFileSync(join(MAGICPIN, `${fname}.html`), r.body);
        index[key] = {
          url: s.url, http: r.http, finalUrl: r.finalUrl, fetchedAt: new Date().toISOString(),
          jsonld: extractJsonLd(r.body), textLength: r.body.length,
          source: "magicpin-store-page", area: s.area, listedName: s.name,
        };
        saveIndex();
        log(`magicpin w${wid} ${r.http} ${s.area}/${s.name}`);
      } catch (e) {
        index[key] = { url: s.url, http: 0, fetchedAt: new Date().toISOString(), error: (e as Error).message.slice(0, 160), source: "magicpin-store-page", area: s.area, listedName: s.name };
        saveIndex();
        log(`magicpin w${wid} FAIL ${s.area}/${s.name}: ${(e as Error).message.slice(0, 80)}`);
      }
      await new Promise((r2) => setTimeout(r2, 1500 + Math.random() * 900));
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, (_, i) => worker(i + 1)));
}

/* ---------------- 3. OSM Overpass sweep ---------------- */

const BBOXES: Array<{ label: string; bbox: string }> = [
  { label: "town-core", bbox: "13.2550,77.5200,13.3050,77.5750" },
  { label: "station-corridor", bbox: "13.2650,77.5400,13.3000,77.5700" },
  { label: "gitam-nagadenahalli", bbox: "13.2700,77.5750,13.3300,77.6300" },
  { label: "bashettihalli", bbox: "13.2400,77.5000,13.2900,77.5450" },
  { label: "soladevanahalli", bbox: "13.0600,77.4500,13.1200,77.5200" },
  { label: "rajanukunte", bbox: "13.1700,77.5000,13.2300,77.5600" },
  { label: "moparahalli-byradenahalli", bbox: "13.2700,77.5900,13.3200,77.6400" },
  { label: "dabaspet-road", bbox: "13.2500,77.4300,13.3100,77.4900" },
];

async function osmSweep() {
  const unions = BBOXES.map(
    (b) => `node["amenity"~"restaurant|cafe|fast_food|food_court|ice_cream|pub|bar"](${b.bbox});way["amenity"~"restaurant|cafe|fast_food|food_court|ice_cream|pub|bar"](${b.bbox});node["shop"~"bakery|pastry|convenience|tea|coffee"](${b.bbox});`
  ).join("");
  const q = `[out:json][timeout:90];(${unions});out center tags;`;
  try {
    const res = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded", "User-Agent": UA },
      body: `data=${encodeURIComponent(q)}`,
      signal: AbortSignal.timeout(120_000),
    });
    const body = await res.text();
    writeFileSync(join(OSM, "overpass-round4.json"), body);
    log(`osm sweep: HTTP ${res.status}, ${body.length} bytes saved`);
    try {
      const j = JSON.parse(body);
      const n = (j.elements ?? []).length;
      log(`osm sweep: ${n} elements`);
    } catch { log("osm sweep: non-JSON body"); }
  } catch (e) {
    log(`osm sweep FAIL: ${(e as Error).message.slice(0, 120)}`);
  }
}

/* ---------------- main ---------------- */

async function main() {
  log(`runner-direct started (max ${MAX_MINUTES} min)`);
  await districtShardDiff();
  const fresh = JSON.parse(readFileSync(join(OUT, "district-new-urls.json"), "utf-8")).fresh as string[];
  await fetchDistrictNew(fresh);
  await osmSweep();
  await magicpinStores();
  saveIndex();
  log(`runner-direct finished: ${Object.keys(index).length} pages indexed`);
}

main();
