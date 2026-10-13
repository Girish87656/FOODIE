/**
 * Foodie — Research round 3 background runner (Task 3-a).
 *
 * Patient, checkpointed, sequential web research via z-ai-web-dev-sdk
 * (web_search + page_reader). Survives long 429 quota windows by waiting
 * with exponential backoff + jitter, cycling un-finished items to the end.
 * Every raw response is saved to tool-results/research3/raw/ BEFORE parsing;
 * finished items are skipped on re-run (idempotent checkpoints).
 *
 * Usage:  bun scripts/research3-runner.ts [maxMinutes]
 * Default wall time: 150 minutes. Safe to re-run — it resumes.
 */
import ZAI from "z-ai-web-dev-sdk";
import { mkdirSync, writeFileSync, existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = "/home/z/my-project";
const OUT = join(ROOT, "tool-results/research3");
const RAW = join(OUT, "raw");
const LOG = join(OUT, "logs/runner3.log");
const MAX_MINUTES = Number(process.argv[2] ?? 150);
const DEADLINE = Date.now() + MAX_MINUTES * 60_000;

mkdirSync(RAW, { recursive: true });
mkdirSync(join(OUT, "logs"), { recursive: true });

function log(line: string) {
  const ts = new Date().toISOString();
  const row = `[${ts}] ${line}`;
  try { appendFileSync(LOG, row + "\n"); } catch { /* keep going */ }
  console.log(row);
}
import { appendFileSync } from "node:fs";

/* ---------------- plan ---------------- */

type Item = { kind: "search" | "read"; label: string; target: string; num?: number };

// Directory index pages FIRST (backbone enumeration)
const READS: Item[] = [
  ...[1, 2, 3, 4, 5, 6, 7, 8].map((p): Item => ({
    kind: "read",
    label: `rg-doddaballapura-p${p}`,
    target: `https://restaurant-guru.in/Doddaballapura${p > 1 ? `?page=${p}` : ""}`,
  })),
  { kind: "read", label: "magicpin-doddaballapur", target: "https://magicpin.in/Bangalore/Doddaballapur/restaurants/" },
  { kind: "read", label: "district-doddaballapura", target: "https://www.district.in/dining/doddaballapura" },
  { kind: "read", label: "rg-gitam-nearby", target: "https://restaurant-guru.in/restaurants-near-GITAM-University-Bengaluru" },
];

// Category + locality sweep
const SWEEP_QUERIES: Array<[string, number]> = [
  ["Doddaballapura restaurants", 10],
  ["Doddaballapura bakery", 8],
  ["Doddaballapura sweets shop", 8],
  ["Doddaballapura tiffin center", 8],
  ["Doddaballapura cafe", 8],
  ["Doddaballapura fast food", 8],
  ["Doddaballapura dhaba", 8],
  ["Doddaballapura biryani", 8],
  ["Doddaballapura non veg restaurant", 8],
  ["Doddaballapura family restaurant", 8],
  ["Doddaballapura tea stall", 6],
  ["Doddaballapura ice cream", 6],
  ["Doddaballapura pizza burger", 6],
  ["Doddaballapura juice center", 6],
  ["restaurants near GITAM University Bengaluru", 10],
  ["restaurants Nagadenahalli Doddaballapura", 8],
  ["restaurants Doddaballapura Railway Station", 8],
  ["restaurants Scout Camp Road Doddaballapura", 8],
  ["restaurants KIADB Doddaballapura industrial area", 8],
  ["restaurants Bashettihalli", 6],
  ["restaurants Soladevanahalli Doddaballapura", 6],
  ["restaurants Moparahalli Doddaballapura", 6],
  ["restaurants Rajanukunte", 6],
  ["restaurants Devanahalli highway Doddaballapura", 6],
  ["food joints Doddaballapura bus stand", 8],
  ["Doddaballapura food street", 8],
  ["best food Doddaballapura", 10],
  ["Doddaballapura hotel menu phone", 8],
];

// Epicruise / Epicurus identity (the full round-2 query plan — all previously 429'd)
const EPICRUISE_QUERIES: Array<[string, number]> = [
  ["Epicruise", 10],
  ["Epicruise cafe Doddaballapura", 8],
  ["Epicruise restaurant GITAM", 8],
  ["Epicruise Nagadenahalli", 8],
  ["Epicruise Bengaluru Rural 561203", 8],
  ["Epicruise Doddaballapura restaurant", 8],
  ["Epicruise Justdial", 8],
  ["Epicruise magicpin", 8],
  ["Epicruise Zomato", 8],
  ["Epicruise Swiggy", 8],
  ["Epicruize restaurant Doddaballapura", 8],
  ["Epic cruise restaurant Doddaballapura GITAM", 8],
  ["Epicurus Epicruise", 8],
  ["Epicurus Multi Cuisine Restaurant renamed", 8],
  ["Epicurus restaurant Doddaballapura new name", 8],
  ["epicurus_original Instagram", 8],
  ["Epicurus Munilakshmamma Nagadenahalli", 8],
  ["Epicurus 101 MSPP Colony Soladevanahalli", 8],
  ["Epicurus 9035972563", 8],
  ["Epicurus Multi Cuisine Restaurant Doddaballapura Nagadenahalli GITAM", 8],
  ["site:justdial.com Epicruise", 6],
  ["site:magicpin.in Epicruise", 6],
  ["site:district.in Epicruise", 6],
  ["cruise themed cafe restaurant near GITAM University Doddaballapura", 8],
];

const PLAN: Item[] = [
  ...READS,
  ...EPICRUISE_QUERIES.map(([q, n]): Item => ({ kind: "search", label: `q-epicruise-${q.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 60)}`, target: q, num: n })),
  ...SWEEP_QUERIES.map(([q, n]): Item => ({ kind: "search", label: `q-sweep-${q.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 60)}`, target: q, num: n })),
];

// Per-candidate enrichment queries built from the committed research worksheet
// + the staged phase3h manifest (names only — no values are invented here).
function enrichmentQueries(): Item[] {
  const names = new Set<string>();
  try {
    const csv = readFileSync(join(ROOT, "scripts/foodie-import-validator/input/research-worksheet-phase3d.csv"), "utf8");
    for (const line of csv.split("\n").slice(1)) {
      const first = line.split(",")[0]?.trim().replace(/^"|"$/g, "");
      if (first && first.length > 2) names.add(first);
    }
    const manifest = JSON.parse(readFileSync(join(ROOT, "scripts/foodie-import-validator/reports/phase3h-proposed-import-manifest.json"), "utf8"));
    const rows = manifest?.rows ?? manifest?.proposed ?? manifest?.records ?? [];
    for (const r of rows as Array<Record<string, unknown>>) if (typeof r?.name === "string") names.add(r.name);
  } catch (e) {
    log(`enrichment source read failed: ${(e as Error).message}`);
  }
  log(`enrichment candidates: ${names.size}`);
  return [...names].slice(0, 60).map((n): Item => ({
    kind: "search",
    label: `q-cand-${n.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 60)}`,
    target: `${n} Doddaballapura address phone`,
    num: 8,
  }));
}

/* ---------------- engine ---------------- */

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

type SearchResult = { name?: string; url?: string; snippet?: string; host_name?: string };
type PageData = { title?: string; html?: string; url?: string };

function okName(kind: Item["kind"], label: string) {
  return join(RAW, `${kind === "read" ? "p" : "s"}-${label}.json`);
}

/** A saved item is "done" only when its capture carries real payload. */
function isDone(item: Item): boolean {
  const path = okName(item.kind, item.label);
  if (!existsSync(path)) return false;
  try {
    const j = JSON.parse(readFileSync(path, "utf8"));
    if (j.error) return false;
    if (item.kind === "search") return Array.isArray(j.results);
    return typeof j.text_full === "string" && j.text_full.length > 200;
  } catch {
    return false;
  }
}

async function withPatientRetry(zai: Awaited<ReturnType<typeof ZAI.create>>, item: Item): Promise<boolean> {
  // 429 backoff ladder (seconds): quota windows are minutes long.
  const waits = [90, 150, 240, 330, 420, 600];
  for (let attempt = 0; attempt <= waits.length; attempt++) {
    if (Date.now() > DEADLINE) return false;
    try {
      if (item.kind === "search") {
        const results = (await zai.functions.invoke("web_search", { query: item.target, num: item.num ?? 8 })) as SearchResult[];
        const path = okName(item.kind, item.label);
        writeFileSync(path, JSON.stringify({ label: item.label, query: item.target, num: item.num, fetched_at: new Date().toISOString(), results }, null, 2));
        log(`SEARCH OK ${item.label} -> ${results?.length ?? 0} results`);
        return true;
      } else {
        const res = (await zai.functions.invoke("page_reader", { url: item.target })) as { data?: PageData };
        const html = res?.data?.html ?? "";
        const text = html
          .replace(/<script[\s\S]*?<\/script>/gi, " ")
          .replace(/<style[\s\S]*?<\/style>/gi, " ")
          .replace(/<[^>]+>/g, " ")
          .replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'")
          .replace(/&nbsp;/g, " ").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
          .replace(/\s+/g, " ")
          .trim();
        const path = okName(item.kind, item.label);
        writeFileSync(path, JSON.stringify({
          label: item.label, url: item.target, final_url: res?.data?.url ?? null,
          title: res?.data?.title ?? null, fetched_at: new Date().toISOString(),
          text_excerpt: text.slice(0, 6000), text_full_length: text.length, text_full: text.slice(0, 300_000),
        }, null, 2));
        log(`READ OK ${item.label} -> ${text.length} chars (title: ${(res?.data?.title ?? "?").slice(0, 60)})`);
        return true;
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      const is429 = /429/.test(msg);
      if (attempt === waits.length || !is429) {
        const path = okName(item.kind, item.label);
        writeFileSync(path, JSON.stringify({ label: item.label, [item.kind === "search" ? "query" : "url"]: item.target, fetched_at: new Date().toISOString(), error: msg.slice(0, 300) }, null, 2));
        log(`${item.kind.toUpperCase()} FAIL ${item.label}: ${msg.slice(0, 120)}`);
        return !is429; // non-429 failures are final; 429s will retry next cycle
      }
      const waitMs = waits[attempt] * 1000 + Math.floor(Math.random() * 20_000);
      log(`429 ${item.label} attempt ${attempt + 1}; waiting ${Math.round(waitMs / 1000)}s`);
      await sleep(waitMs);
    }
  }
  return false;
}

async function main() {
  const zai = await ZAI.create();
  const full = [...PLAN, ...enrichmentQueries()];
  log(`PLAN START ${full.length} items (maxMinutes=${MAX_MINUTES})`);
  let pending = full.filter((i) => !isDone(i));
  log(`pending after checkpoint-skip: ${pending.length} (done=${full.length - pending.length})`);

  let cycles = 0;
  while (pending.length > 0 && Date.now() < DEADLINE) {
    cycles += 1;
    const item = pending[0];
    const ok = await withPatientRetry(zai, item);
    pending = pending.filter((i) => i !== item || !ok);
    if (!ok) pending.push(item); // retry later (429 or transient)
    // pacing between successful calls
    await sleep(ok ? 4000 + Math.floor(Math.random() * 2500) : 5000);
    if (cycles % 10 === 0) log(`CYCLE ${cycles}: pending=${pending.length}`);
  }
  log(`PLAN STOP: pending=${pending.length} (unresolved are saved with error fields and retried on next run)`);
}

main().catch((e) => {
  log(`FATAL ${(e as Error).stack?.slice(0, 400)}`);
  process.exit(1);
});
