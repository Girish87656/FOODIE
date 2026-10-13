/**
 * Foodie — Research round 4 runner (Part 2).
 *
 * Executes the queries that were PLANNED in round 3 but never ran because the
 * z-ai gateway was quota-exhausted (HTTP 429 all session). Transport here is
 * Bing's public HTML search page (no API key, no paid service) + direct page
 * reads, with polite spacing and jitter.
 *
 * - Checkpointed + idempotent: every raw response is saved to
 *   tool-results/research4/raw/<label>.html BEFORE parsing; finished items are
 *   skipped on re-run.
 * - A parsed index (tool-results/research4/search-index.json) records, per
 *   query: title, decoded target URL, snippet, and the Bing search URL that
 *   produced it (provenance for the worksheet).
 * - No Zomato/Swiggy page bodies are fetched (forbidden proprietary scraping);
 *   their search-result SNIPPETS are recorded like any other public snippet.
 *
 * Usage: bun scripts/research4-bing-runner.ts [maxMinutes] (default 60)
 */
import { mkdirSync, writeFileSync, existsSync, readFileSync, appendFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = "/home/z/my-project";
const OUT = join(ROOT, "tool-results/research4");
const RAW = join(OUT, "raw");
const LOG = join(OUT, "logs/runner4.log");
const INDEX = join(OUT, "search-index.json");
const MAX_MINUTES = Number(process.argv[2] ?? 60);
const DEADLINE = Date.now() + MAX_MINUTES * 60_000;

mkdirSync(RAW, { recursive: true });
mkdirSync(join(OUT, "logs"), { recursive: true });

function log(line: string) {
  const ts = new Date().toISOString();
  const row = `[${ts}] ${line}`;
  try { appendFileSync(LOG, row + "\n"); } catch { /* keep going */ }
  console.log(row);
}

const UA =
  "Mozilla/5.0 (X11; Linux x86_64; rv:120.0) Gecko/20100101 Firefox/120.0";

function sleep(ms: number) { return new Promise((r) => setTimeout(r, ms)); }

/* ---------------- plan ---------------- */

type Item = { label: string; query: string };

// A. Epicruise identity plan (the 24 planned round-3 queries, never executed)
const EPICRUISE: Item[] = [
  { label: "epicruise-bare", query: `"Epicruise"` },
  { label: "epicruise-cafe-doddaballapura", query: `Epicruise cafe Doddaballapura` },
  { label: "epicruise-gitam", query: `Epicruise GITAM University` },
  { label: "epicruise-nagadenahalli", query: `Epicruise Nagadenahalli` },
  { label: "epicruise-561203", query: `Epicruise 561203` },
  { label: "epicruise-doddaballapura", query: `Epicruise Doddaballapura` },
  { label: "epicruise-justdial", query: `site:justdial.com Epicruise` },
  { label: "epicruise-magicpin", query: `site:magicpin.in Epicruise` },
  { label: "epicruise-zomato", query: `site:zomato.com Epicruise` },
  { label: "epicruise-swiggy", query: `site:swiggy.com Epicruise` },
  { label: "epicruize-misspell", query: `"Epicruize"` },
  { label: "epic-cruise-spelling", query: `"epic cruise" restaurant Doddaballapura` },
  { label: "epicruise-epicurus", query: `Epicruise Epicurus restaurant` },
  { label: "epicurus-renamed", query: `Epicurus Multi Cuisine Restaurant renamed new name` },
  { label: "epicurus-new-name", query: `"Epicurus" restaurant Doddaballapura "now" OR "new name"` },
  { label: "epicurus-ig", query: `Epicurus restaurant Doddaballapura instagram` },
  { label: "epicurus-munilakshmamma", query: `Epicurus Munilakshmamma Nagadenahalli` },
  { label: "epicurus-101-mspp", query: `Epicurus "101 MSPP" Soladevanahalli` },
  { label: "epicurus-phone", query: `"9035972563" OR "7676599869" Epicurus` },
  { label: "epicurus-corridor", query: `Epicurus restaurant Doddaballapura Road Bangalore` },
  { label: "site-jd-epicruise", query: `justdial "Epicruise"` },
  { label: "site-magicpin-epicruise", query: `magicpin "Epicruise"` },
  { label: "site-district-epicruise", query: `district.in "Epicruise"` },
  { label: "nearby-cruise-themed", query: `cruise themed restaurant near GITAM Doddaballapura` },
];

// B. Hangouts (the other must-target name)
const HANGOUTS: Item[] = [
  { label: "hangouts-doddaballapura", query: `"Hangouts" Doddaballapura` },
  { label: "hangouts-gitam", query: `Hangouts restaurant GITAM University Bangalore` },
  { label: "hangouts-nagadenahalli", query: `Hangouts Nagadenahalli` },
  { label: "hangout-cafe-doddaballapura", query: `"Hangout" cafe Doddaballapura` },
  { label: "hangouts-justdial", query: `justdial Hangouts Doddaballapura` },
  { label: "hangouts-562163", query: `Hangouts restaurant 562163 OR 561203` },
];

// C. Discovery leads recorded in round-2/3 but never researched
const LEADS: Item[] = [
  { label: "lead-zen-cafe", query: `"Zen Cafe" Doddaballapura OR GITAM` },
  { label: "lead-rajputana", query: `Rajputana restaurant Doddaballapura` },
  { label: "lead-ananya-vana", query: `"Ananya Vana" Doddaballapura` },
  { label: "lead-mr3519", query: `"MR3519" restaurant Bangalore` },
  { label: "lead-sri-matha-sagar", query: `"Sri Matha Sagar" Doddaballapura` },
  { label: "lead-sarangi-fine-dine", query: `"Sarangi Fine Dine" Doddaballapura` },
  { label: "lead-darbar-cafe", query: `"Darbar The Cafe" Doddaballapura` },
  { label: "lead-nippat-masale", query: `"Nippat" masale stall Doddaballapura` },
];

// D. Duplicate-hold resolution probes
const HOLDS: Item[] = [
  { label: "hold-gitam-cafe-phone", query: `"Gitam Cafe" Doddaballapura phone` },
  { label: "hold-gitam-cafe-jd", query: `justdial "Gitam Cafe" Heggadahalli` },
  { label: "hold-krishnamoorthy", query: `"Hotel Krishnamoorthy" Doddaballapura` },
  { label: "hold-krishnamurthy-ayyappa", query: `"Krishnamurthy Hotel" "Ayyappa" Doddaballapura` },
  { label: "hold-lakshmi-biriyani-status", query: `"Lakshmi Biriyani Point" Doddaballapura` },
  { label: "hold-mantralaya-basettihalli", query: `"Mantralaya" tiffin Basettihalli Doddaballapura phone` },
  { label: "hold-mantralaya-hotel", query: `"Mantralaya Hotel" Doddaballapura railway station phone` },
  { label: "hold-ganesh-darshan", query: `"Ganesh Darshan" chats Doddaballapura` },
  { label: "hold-vaibhava-sweets", query: `"Vaibhava" sweets chats Doddaballapura` },
];

// E. Official-site probes for photo/licensing research (importable set)
const OFFICIAL: Item[] = [
  { label: "off-sri-ganesh-grand", query: `"Sri Ganesh Grand" Doddaballapura` },
  { label: "off-ayyappa-tiffin-room", query: `"Ayyappa Tiffin Room" Doddaballapura official` },
  { label: "off-epicurus", query: `"Epicurus Multi Cuisine Restaurant" Nagadenahalli` },
  { label: "off-amigos-cafe", query: `"Amigos Cafe" GITAM Nagadenahalli` },
  { label: "off-ss-hyderabadi", query: `"SS Hyderabadi Biriyani Zone" Nagadenahalli` },
  { label: "off-biryani-shack", query: `"The Biryani Shack" Heggadahalli` },
  { label: "off-best-choice-bakery", query: `"Best Choice Bakery" Doddaballapura` },
  { label: "off-burger-time", query: `"Burger Time" Doddaballapura` },
  { label: "off-bbq-junction", query: `"Bbq Junction" Doddaballapura` },
  { label: "off-maha-naati-ruchi", query: `"Maha Naati Ruchi" Doddaballapura` },
  { label: "off-palav-ramu", query: `"Palav Ramu Hotel" Doddaballapura` },
  { label: "off-kiran-tiffin-room", query: `"Kiran Tiffin Room" Doddaballapura` },
  { label: "off-rainbow-huts", query: `"Rainbow Huts" family restaurant Doddaballapura` },
  { label: "off-bindushree", query: `"Hotel Bindushree" Doddaballapura` },
  { label: "off-sri-vinayaka-food-point", query: `"Sri Vinayaka Food Point" Doddaballapura` },
  { label: "off-rajashree", query: `"Rajashree" veg non-veg family restaurant Doddaballapura` },
  { label: "off-shri-cafe", query: `"The Shri Cafe and Restaurant" Doddaballapura` },
  { label: "off-lotus-gardenia", query: `"Lotus Gardenia" Doddaballapura` },
  { label: "off-abhis-food-court", query: `"Abhis Food Court" Doddaballapura` },
  { label: "off-abhiram-food-court", query: `"Abhiram Food Court" Moparahalli` },
];

// F. Area/category sweep (planned in round 3 as z-ai sweep; never ran)
const SWEEP: Item[] = [
  { label: "sweep-restaurants", query: `Doddaballapura restaurants list` },
  { label: "sweep-bakeries", query: `Doddaballapura bakery sweets shops` },
  { label: "sweep-tiffin", query: `Doddaballapura tiffin center breakfast` },
  { label: "sweep-cafes", query: `Doddaballapura cafes` },
  { label: "sweep-fastfood", query: `Doddaballapura fast food burgers pizza` },
  { label: "sweep-street", query: `Doddaballapura street food chats stalls` },
  { label: "sweep-biryani", query: `Doddaballapura biryani` },
  { label: "sweep-tea-juice", query: `Doddaballapura tea stall juice center` },
  { label: "sweep-gitam-nearby", query: `food places near GITAM University Bangalore` },
  { label: "sweep-station-road", query: `restaurants Doddaballapura railway station road` },
  { label: "sweep-scout-camp", query: `restaurants Scout Camp Road Doddaballapura` },
  { label: "sweep-bashettihalli", query: `restaurants Bashettihalli Doddaballapura` },
  { label: "sweep-soladevanahalli", query: `restaurants Soladevanahalli Hesaraghatta road` },
  { label: "sweep-moparahalli", query: `restaurants Moparahalli` },
  { label: "sweep-rajanukunte", query: `restaurants Rajanukunte` },
  { label: "sweep-dabaspet", query: `restaurants Dabaspet Doddaballapura` },
  { label: "sweep-kiadb", query: `restaurants KIADB Doddaballapura industrial area food` },
  { label: "sweep-bus-stand", query: `Doddaballapura bus stand food` },
];

const PLAN: Item[] = [...EPICRUISE, ...HANGOUTS, ...LEADS, ...HOLDS, ...OFFICIAL, ...SWEEP];

/* ---------------- bing ---------------- */

function decodeBingHref(href: string): string {
  try {
    if (href.includes("bing.com/ck/a")) {
      const m = href.match(/[?&]u=a1([^&]+)/);
      if (m) {
        const b64 = m[1].replace(/-/g, "+").replace(/_/g, "/");
        const pad = b64.length % 4 ? "=".repeat(4 - (b64.length % 4)) : "";
        const dec = Buffer.from(b64 + pad, "base64").toString("utf-8");
        if (dec.startsWith("http")) return dec;
      }
      return href; // opaque redirect; still a URL, kept as-is
    }
    return href;
  } catch {
    return href;
  }
}

function stripTags(s: string): string {
  return s
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .trim();
}

function parseBing(html: string) {
  const out: Array<{ title: string; url: string; snippet: string }> = [];
  const blocks = html.match(/<li class="b_algo"[\s\S]*?<\/li>/g) ?? [];
  for (const b of blocks) {
    const a = b.match(/<h2[^>]*>\s*<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/);
    if (!a) continue;
    const p = b.match(/<p[^>]*>([\s\S]*?)<\/p>/);
    out.push({
      title: stripTags(a[2]).slice(0, 200),
      url: decodeBingHref(a[1]).slice(0, 500),
      snippet: p ? stripTags(p[1]).slice(0, 400) : "",
    });
  }
  return out;
}

async function searchOne(item: Item): Promise<{ results: ReturnType<typeof parseBing>; searchUrl: string; http: number; note: string }> {
  const searchUrl = `https://www.bing.com/search?q=${encodeURIComponent(item.query)}&count=15&setlang=en`;
  let http = 0;
  let note = "";
  try {
    const res = await fetch(searchUrl, {
      headers: { "User-Agent": UA, "Accept-Language": "en-US,en;q=0.9" },
      signal: AbortSignal.timeout(45_000),
    });
    http = res.status;
    const html = await res.text();
    writeFileSync(join(RAW, `${item.label}.html`), html);
    if (http !== 200) return { results: [], searchUrl, http, note: `HTTP ${http}` };
    const results = parseBing(html);
    if (results.length === 0 && /b_no|There are no results/.test(html)) note = "0 results (explicit no-results page)";
    else if (results.length === 0) note = "0 parsed blocks (challenge page or layout change — raw saved)";
    return { results, searchUrl, http, note };
  } catch (e) {
    note = `FETCH FAIL: ${(e as Error).message.slice(0, 120)}`;
    return { results: [], searchUrl, http, note };
  }
}

/* ---------------- main ---------------- */

type IndexEntry = {
  label: string; query: string; searchUrl: string; http: number;
  note: string; fetchedAt: string; results: Array<{ title: string; url: string; snippet: string }>;
};

function loadIndex(): Record<string, IndexEntry> {
  if (existsSync(INDEX)) {
    try { return JSON.parse(readFileSync(INDEX, "utf-8")); } catch { return {}; }
  }
  return {};
}

async function main() {
  const index = loadIndex();
  let done = 0;
  for (const item of PLAN) {
    if (Date.now() > DEADLINE) { log(`deadline reached — stopping (${done}/${PLAN.length} this run)`); break; }
    if (index[item.label]) { done++; continue; } // checkpointed
    const r = await searchOne(item);
    index[item.label] = {
      label: item.label, query: item.query, searchUrl: r.searchUrl, http: r.http,
      note: r.note, fetchedAt: new Date().toISOString(), results: r.results,
    };
    writeFileSync(INDEX, JSON.stringify(index, null, 1));
    done++;
    log(`[${done}/${PLAN.length}] ${item.label}: http=${r.http} results=${r.results.length} ${r.note}`);
    await sleep(3500 + Math.floor(Math.random() * 3000)); // polite spacing
  }
  log(`runner4 finished: ${Object.keys(index).length}/${PLAN.length} total checkpointed`);
}

main();
