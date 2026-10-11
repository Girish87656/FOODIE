/**
 * Foodie — Research round 2: Epicruise/Epicurus identity resolution.
 *
 * Evidence-only: searches the web for BOTH spellings independently
 * ("Epicruise" vs "Epicurus") around Doddaballapura / Nagadenahalli / GITAM,
 * saves every raw result set as JSON under tool-results/research2/epicruise/
 * (gitignored). No values are derived, completed or verified here.
 *
 * Usage:
 *   bun scripts/research-round2-epicruise.ts search
 *   bun scripts/research-round2-epicruise.ts read <url> [<url> ...]
 */
import ZAI from "z-ai-web-dev-sdk";
import { mkdirSync, writeFileSync, existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const OUT_DIR = "/home/z/my-project/tool-results/research2/epicruise";

/** Round-1 search queries: both spellings, site-targeted variants, neighbours. */
const QUERIES: Array<[string, string, number]> = [
  ["01 EPICRUISE BARE", "Epicruise", 10],
  ["02 EPICRUISE CAFE DODDABALLAPURA", "Epicruise cafe Doddaballapura", 8],
  ["03 EPICRUISE GITAM", "Epicruise restaurant GITAM", 8],
  ["04 EPICRUISE NAGADENAHALLI", "Epicruise Nagadenahalli", 8],
  ["05 EPICRUISE 561203", "Epicruise Bengaluru Rural 561203", 8],
  ["06 EPICRUISE DODDABALLAPURA", "Epicruise Doddaballapura restaurant", 8],
  ["07 EPICRUISE JUSTDIAL", "Epicruise Justdial", 8],
  ["08 EPICRUISE MAGICPIN", "Epicruise magicpin", 8],
  ["09 EPICRUISE ZOMATO", "Epicruise Zomato", 8],
  ["10 EPICRUISE SWIGGY", "Epicruise Swiggy", 8],
  ["11 EPICRUIZE MISSPELL", "Epicruize restaurant Doddaballapura", 8],
  ["12 EPIC CRUISE SPELLING", "Epic cruise restaurant Doddaballapura GITAM", 8],
  ["13 EPICRUISE EPICURUS", "Epicurus Epicruise", 8],
  ["14 EPICURUS RENAMED", "Epicurus Multi Cuisine Restaurant renamed", 8],
  ["15 EPICURUS NEW NAME", "Epicurus restaurant Doddaballapura new name", 8],
  ["16 EPICURUS IG", "epicurus_original Instagram", 8],
  ["17 EPICURUS MUNILAKSHMAMMA", "Epicurus Munilakshmamma Nagadenahalli", 8],
  ["18 EPICURUS 101 MSPP", "Epicurus 101 MSPP Colony Soladevanahalli", 8],
  ["19 EPICURUS PHONE", "Epicurus 9035972563", 8],
  ["20 EPICURUS CORRIDOR", "Epicurus Multi Cuisine Restaurant Doddaballapura Nagadenahalli GITAM", 8],
  ["21 SITE-JD EPICRUISE", "site:justdial.com Epicruise", 6],
  ["22 SITE-MAGICPIN EPICRUISE", "site:magicpin.in Epicruise", 6],
  ["23 SITE-DISTRICT EPICRUISE", "site:district.in Epicruise", 6],
  ["24 NEARBY CRUISE-THEMED", "cruise themed cafe restaurant near GITAM University Doddaballapura", 8],
];

type SearchResult = { name: string; url: string; snippet: string; host_name: string };

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function searchWithRetry(zai: Awaited<ReturnType<typeof ZAI.create>>, query: string, num: number, retries = 5) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const results = (await zai.functions.invoke("web_search", { query, num })) as SearchResult[];
      if (Array.isArray(results)) return results;
      throw new Error("non-array response");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (attempt === retries) throw err;
      // 429 = rate limited: wait long (quota windows are ~minutes, not seconds)
      await sleep(/429/.test(msg) ? 45000 * attempt : 3000 * attempt);
    }
  }
  return [];
}

type PageData = { title?: string; html?: string; url?: string };

async function readWithRetry(zai: Awaited<ReturnType<typeof ZAI.create>>, url: string, retries = 5) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = (await zai.functions.invoke("page_reader", { url })) as { data?: PageData };
      if (res?.data) return res.data;
      throw new Error("no data in response");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (attempt === retries) throw err;
      await sleep(/429/.test(msg) ? 45000 * attempt : 4000 * attempt);
    }
  }
  return {};
}

function slug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80) || "untitled";
}

function save(name: string, payload: unknown) {
  mkdirSync(OUT_DIR, { recursive: true });
  const path = join(OUT_DIR, name);
  writeFileSync(path, JSON.stringify(payload, null, 2));
  console.log(`  saved -> ${path}`);
}

function clean(s: string, max = 300) {
  return (s || "").replace(/\s+/g, " ").trim().slice(0, max);
}

function alreadyOk(label: string) {
  const path = join(OUT_DIR, `s-${slug(label)}.json`);
  if (!existsSync(path)) return false;
  try {
    const j = JSON.parse(readFileSync(path, "utf8"));
    return !j.error && Array.isArray(j.results);
  } catch {
    return false;
  }
}

async function runSearches() {
  const zai = await ZAI.create();
  for (const [label, query, num] of QUERIES) {
    if (alreadyOk(label)) {
      console.log(`\n===== ${label} :: SKIP (already saved OK) =====`);
      continue;
    }
    console.log(`\n===== ${label} :: "${query}" =====`);
    try {
      const results = await searchWithRetry(zai, query, num);
      save(`s-${slug(label)}.json`, { label, query, num, fetched_at: new Date().toISOString(), results });
      if (!results.length) {
        console.log("  (no results)");
        continue;
      }
      for (const r of results) {
        console.log(`- [${r.host_name}] ${clean(r.name, 120)}`);
        console.log(`  URL: ${r.url}`);
        console.log(`  ${clean(r.snippet)}`);
      }
    } catch (e) {
      save(`s-${slug(label)}.json`, { label, query, num, fetched_at: new Date().toISOString(), error: e instanceof Error ? e.message : String(e) });
      console.log(`  ERROR: ${e instanceof Error ? e.message : String(e)}`);
    }
    await sleep(2500); // rate-limit friendly
  }
}

async function runReads(urls: string[]) {
  const zai = await ZAI.create();
  let i = 0;
  for (const url of urls) {
    i += 1;
    console.log(`\n===== READ p${String(i).padStart(2, "0")} :: ${url} =====`);
    try {
      const data = await readWithRetry(zai, url);
      const html = data.html || "";
      const text = html
        .replace(/<script[\s\S]*?<\/script>/gi, " ")
        .replace(/<style[\s\S]*?<\/style>/gi, " ")
        .replace(/<[^>]+>/g, " ")
        .replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'")
        .replace(/&nbsp;/g, " ").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
        .replace(/\s+/g, " ")
        .trim();
      save(`p-${String(i).padStart(2, "0")}-${slug(url).slice(0, 60)}.json`, {
        url,
        final_url: data.url || null,
        title: data.title || null,
        fetched_at: new Date().toISOString(),
        text_excerpt: text.slice(0, 6000),
        text_full_length: text.length,
        text_full: text.slice(0, 200000),
      });
      console.log(`  title: ${clean(data.title || "(none)", 160)}`);
      console.log(`  text: ${text.slice(0, 1200)}`);
    } catch (e) {
      save(`p-${String(i).padStart(2, "0")}-${slug(url).slice(0, 60)}.json`, { url, fetched_at: new Date().toISOString(), error: e instanceof Error ? e.message : String(e) });
      console.log(`  ERROR: ${e instanceof Error ? e.message : String(e)}`);
    }
    await sleep(2500);
  }
}

async function main() {
  const mode = process.argv[2] || "search";
  if (mode === "search") await runSearches();
  else if (mode === "read") {
    const urls = process.argv.slice(3);
    if (!urls.length) {
      console.error("usage: bun scripts/research-round2-epicruise.ts read <url> [...]");
      process.exit(1);
    }
    await runReads(urls);
  } else {
    console.error(`unknown mode: ${mode} (use "search" or "read")`);
    process.exit(1);
  }
}

main().catch((e) => {
  console.error("FATAL", e);
  process.exit(1);
});
