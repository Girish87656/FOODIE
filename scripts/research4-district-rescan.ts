/**
 * Foodie — round 4 district.in sitemap RESCAN (separate from the running
 * direct runner so indexes don't interleave).
 *
 * Round 3 captured 93 town venue pages from cdn.district.in/sitemap/sitemap-dining.xml.
 * That file is NOW an index of region-sharded sitemap-restaurant-pagesN.xml.gz
 * files (regenerated, lastmod 2026-09-28), and a first scan of shards 1-8 found
 * ~0 Doddaballapura-area URLs. This script:
 *   1. reads robots.txt for the authoritative sitemap list,
 *   2. downloads EVERY restaurant-pages shard, records per-shard region sample
 *      + any target-area URLs,
 *   3. fetches the Doddaballapura town listing page (with pagination) as an
 *      alternate discovery channel,
 *   4. diffs whatever it finds against the 93 known URLs.
 * Output: tool-results/research4/district-rescan.json (+ raw HTML of any new
 * listing pages under tool-results/research4/district-new/).
 */
import { mkdirSync, writeFileSync, existsSync, readFileSync, appendFileSync } from "node:fs";
import { join } from "node:path";
import { gunzipSync } from "node:zlib";

const ROOT = "/home/z/my-project";
const OUT = join(ROOT, "tool-results/research4");
const DISTRICT = join(OUT, "district-new");
const LOG = join(OUT, "logs/district-rescan.log");
mkdirSync(DISTRICT, { recursive: true });
mkdirSync(join(OUT, "logs"), { recursive: true });

function log(line: string) {
  const row = `[${new Date().toISOString()}] ${line}`;
  try { appendFileSync(LOG, row + "\n"); } catch {}
  console.log(row);
}

const UA = "Mozilla/5.0 (X11; Linux x86_64; rv:120.0) Gecko/20100101 Firefox/120.0";
const AREA_TOKENS = [
  "doddaballapura", "doddaballapur", "bashettihalli", "nagadenahalli", "nagenahalli",
  "rajanukunte", "soladevanahalli", "moparahalli", "heggadahalli", "dabaspet",
  "scout-camp", "byradenahalli", "kodihalli", "thimmasandra",
];

function sleep(ms: number) { return new Promise((r) => setTimeout(r, ms)); }

async function getText(url: string, timeoutMs = 45_000): Promise<{ http: number; body: string }> {
  const res = await fetch(url, {
    headers: { "User-Agent": UA, "Accept-Language": "en-US,en;q=0.9" },
    signal: AbortSignal.timeout(timeoutMs),
  });
  return { http: res.status, body: await res.text() };
}

function extractJsonLd(html: string): unknown[] {
  const out: unknown[] = [];
  const re = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    try { out.push(JSON.parse(m[1])); } catch {}
  }
  return out;
}

async function main() {
  const report: Record<string, unknown> = { startedAt: new Date().toISOString() };

  // 1) robots.txt
  let sitemaps: string[] = [];
  try {
    const r = await getText("https://www.district.in/robots.txt");
    const lines = r.body.split("\n").filter((l) => /^sitemap:/i.test(l));
    sitemaps = lines.map((l) => l.replace(/^sitemap:\s*/i, "").trim());
    log(`robots.txt: HTTP ${r.http}, ${sitemaps.length} sitemaps declared`);
  } catch (e) {
    log(`robots.txt FAIL: ${(e as Error).message.slice(0, 100)}`);
  }
  report.robotsSitemaps = sitemaps;

  // expand sitemap indexes one level
  const shardUrls: string[] = [];
  for (const sm of sitemaps) {
    try {
      if (sm.endsWith(".gz")) {
        const res = await fetch(sm, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(45_000) });
        const xml = gunzipSync(Buffer.from(await res.arrayBuffer())).toString("utf-8");
        if (/<sitemapindex/.test(xml)) {
          for (const m of xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)) shardUrls.push(m[1]);
          log(`index ${sm}: -> ${shardUrls.length} cumulative shard refs`);
        }
      } else if (sm.includes("sitemap")) {
        shardUrls.push(sm);
      }
    } catch (e) {
      log(`sitemap ${sm} FAIL: ${(e as Error).message.slice(0, 80)}`);
    }
  }
  report.shardUrls = shardUrls;
  log(`total shard files: ${shardUrls.length}`);

  // 2) scan every shard for region + area URLs
  const known = new Set<string>(
    (JSON.parse(readFileSync(join(ROOT, "tool-results/research3/sitemap/digest.json"), "utf-8")) as Array<{ url: string }>).map((d) => d.url.replace(/\/+$/, ""))
  );
  log(`known round-3 URLs: ${known.size}`);

  const areaUrls = new Map<string, string>(); // url -> shard
  const shardSamples: Array<{ shard: string; sample: string; locs: number; areaHits: number }> = [];
  async function scanShard(shardUrl: string) {
    const label = shardUrl.split("/").pop() ?? shardUrl;
    try {
      let xml: string;
      if (shardUrl.endsWith(".gz")) {
        const res = await fetch(shardUrl, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(60_000) });
        if (!res.ok) { log(`${label}: HTTP ${res.status}`); return; }
        xml = gunzipSync(Buffer.from(await res.arrayBuffer())).toString("utf-8");
      } else {
        const r = await getText(shardUrl);
        if (r.http !== 200) { log(`${label}: HTTP ${r.http}`); return; }
        xml = r.body;
      }
      const locs = [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((m) => m[1]);
      if (/<sitemapindex/.test(xml)) {
        // index file -> queue its children for scanning
        for (const m of locs) {
          if (!shardUrls.includes(m)) shardUrls.push(m);
        }
        log(`${label}: INDEX -> queued ${locs.length} children`);
        return;
      }
      let hits = 0;
      for (const loc of locs) {
        const low = loc.toLowerCase();
        if (!low.includes("/dining/")) continue;
        if (AREA_TOKENS.some((t) => low.includes(t))) { areaUrls.set(loc.replace(/\/+$/, ""), label); hits++; }
      }
      shardSamples.push({ shard: label, sample: (locs[0] ?? "").slice(0, 90), locs: locs.length, areaHits: hits });
      log(`${label}: ${locs.length} locs, ${hits} area hits, sample=${(locs[0] ?? "none").slice(0, 70)}`);
    } catch (e) {
      shardSamples.push({ shard: label, sample: `FAIL ${(e as Error).message.slice(0, 60)}`, locs: 0, areaHits: 0 });
      log(`${label}: FAIL ${(e as Error).message.slice(0, 100)}`);
    }
    await sleep(1000);
  }
  // iterate as a worklist: index files queue children that must also be scanned
  {
    const seen = new Set<string>();
    const worklist = [...shardUrls];
    while (worklist.length) {
      const shard = worklist.shift()!;
      if (seen.has(shard)) continue;
      seen.add(shard);
      await scanShard(shard); // may queue children into shardUrls
      for (const u of shardUrls) if (!seen.has(u) && !worklist.includes(u)) worklist.push(u);
    }
  }
  report.shardSamples = shardSamples;

  // 3) town listing page (alternate discovery) — probe slug variants
  const listingPages: Array<{ url: string; http: number; venueLinks: number }> = [];
  const listingVariants = [
    "https://www.district.in/dining/doddaballapura",
    "https://www.district.in/dining/doddaballapura-locality",
    "https://www.district.in/dining/bangalore/doddaballapura-locality",
    "https://www.district.in/dining/bangalore/doddaballapura",
  ];
  for (const url of listingVariants) {
    try {
      const r = await getText(url);
      const links = new Set<string>();
      if (r.http === 200) {
        for (const m of r.body.matchAll(/href="(\/dining\/[^"#?]+)/g)) {
          const href = m[1];
          const low = href.toLowerCase();
          if (AREA_TOKENS.some((t) => low.includes(t))) links.add(`https://www.district.in${href.replace(/\/+$/, "")}`);
        }
        for (const l of links) if (!areaUrls.has(l)) areaUrls.set(l, "town-listing");
      }
      listingPages.push({ url, http: r.http, venueLinks: links.size });
      log(`listing variant ${url}: HTTP ${r.http}, ${links.size} area venue links`);
      writeFileSync(join(OUT, `district-listing-${url.replace(/^https?:\/\//, "").replace(/[^a-zA-Z0-9]+/g, "-").slice(0, 80)}.html`), r.body);
    } catch (e) {
      listingPages.push({ url, http: 0, venueLinks: 0 });
      log(`listing variant ${url} FAIL: ${(e as Error).message.slice(0, 80)}`);
    }
    await sleep(1500);
  }
  report.listingPages = listingPages;

  // 4) diff
  const fresh = [...areaUrls.keys()].filter((u) => !known.has(u));
  report.areaUrlsTotal = areaUrls.size;
  report.freshVsRound3 = fresh;
  log(`AREA URLS total: ${areaUrls.size}, NEW vs round-3: ${fresh.length}`);

  // 5) fetch fresh pages (JSON-LD)
  const fetched: Array<{ url: string; http: number; name?: string }> = [];
  for (const url of fresh) {
    try {
      const r = await getText(url);
      writeFileSync(join(DISTRICT, `${url.replace(/^https?:\/\//, "").replace(/[^a-zA-Z0-9]+/g, "-").slice(0, 150)}.html`), r.body);
      let name: string | undefined;
      try {
        const ld = extractJsonLd(r.body) as Array<{ "@graph"?: Array<{ "@type"?: string; name?: string }> }>;
        for (const block of ld) {
          for (const g of block?.["@graph"] ?? []) {
            if (String(g?.["@type"]) === "Restaurant" && g.name) name = g.name;
          }
        }
      } catch {}
      fetched.push({ url, http: r.http, name });
      log(`fresh fetch ${r.http} ${name ?? ""} ${url.slice(-55)}`);
    } catch (e) {
      fetched.push({ url, http: 0 });
      log(`fresh fetch FAIL ${url.slice(-55)}: ${(e as Error).message.slice(0, 70)}`);
    }
    await sleep(1400);
  }
  report.fetched = fetched;
  report.finishedAt = new Date().toISOString();
  writeFileSync(join(OUT, "district-rescan.json"), JSON.stringify(report, null, 1));
  log("rescan complete -> district-rescan.json");
}

main();
