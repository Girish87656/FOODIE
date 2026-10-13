/**
 * Foodie — Research round 3 plan runner (Task 3-a).
 * Sequential ONLY. Every raw response saved before parsing.
 * 429 -> 60-90 s wait. Hard per-invoke timeout 120 s.
 * Runs in FOREGROUND up to MAX_RUNTIME_MS (default 470 s) then stops gracefully,
 * so the sandbox does not kill a long background process.
 * Failed / unfinished items have no success file and are retried when the same plan re-runs.
 *
 * Usage: bun scripts/research3-region.ts run-plan <plan.json> [maxRuntimeMs]
 */
import ZAI from "z-ai-web-dev-sdk";
import { mkdirSync, writeFileSync, existsSync, readFileSync, appendFileSync } from "node:fs";
import { join } from "node:path";

const OUT_DIR = "/home/z/my-project/tool-results/research3/raw";
const LOG = "/home/z/my-project/tool-results/research3/logs/plan-runner.log";

type SearchResult = { name: string; url: string; snippet: string; host_name: string };
type PageData = { title?: string; html?: string; url?: string };
type Item = { kind: "search" | "read"; label: string; query?: string; url?: string; num?: number };

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();

function log(line: string) {
  const full = `[${ts()}] ${line}`;
  console.log(full);
  try { appendFileSync(LOG, full + "\n"); } catch { /* ignore */ }
}

function slug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 90) || "untitled";
}

function save(name: string, payload: unknown) {
  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(join(OUT_DIR, name), JSON.stringify(payload, null, 2));
}

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return Promise.race([p, new Promise<T>((_, rej) => setTimeout(() => rej(new Error(`hard-timeout ${ms}ms`)), ms))]);
}

function textFromHtml(html: string) {
  return (html || "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function searchOk(label: string) {
  const p = join(OUT_DIR, `s-${slug(label)}.json`);
  if (!existsSync(p)) return false;
  try { const j = JSON.parse(readFileSync(p, "utf8")); return !j.error && Array.isArray(j.results); } catch { return false; }
}
function readOk(label: string) {
  const p = join(OUT_DIR, `p-${slug(label)}.json`);
  if (!existsSync(p)) return false;
  try { const j = JSON.parse(readFileSync(p, "utf8")); return !j.error && typeof j.text_full === "string" && j.text_full.length > 0; } catch { return false; }
}

async function attemptOnce(zai: Awaited<ReturnType<typeof ZAI.create>>, item: Item) {
  if (item.kind === "search") {
    const results = (await withTimeout(
      zai.functions.invoke("web_search", { query: item.query!, num: item.num ?? 8 }), 120000)) as SearchResult[];
    if (!Array.isArray(results)) throw new Error("non-array response");
    save(`s-${slug(item.label)}.json`, { label: item.label, query: item.query, num: item.num ?? 8, fetched_at: ts(), results });
    log(`OK search ${item.label} (${results.length} results)`);
    for (const r of results) log(`  - [${r.host_name}] ${r.name} | ${r.url}`);
  } else {
    const res = (await withTimeout(
      zai.functions.invoke("page_reader", { url: item.url! }), 120000)) as { data?: PageData };
    if (!res?.data) throw new Error("no data in response");
    const html = res.data.html || "";
    const text = textFromHtml(html);
    save(`p-${slug(item.label)}.json`, {
      label: item.label, url: item.url, final_url: res.data.url || null, title: res.data.title || null,
      fetched_at: ts(), html_length: html.length, text_full_length: text.length,
      text_excerpt: text.slice(0, 6000), text_full: text.slice(0, 300000),
    });
    log(`OK read ${item.label} (html ${html.length} chars) title="${(res.data.title || "").replace(/\s+/g, " ").slice(0, 120)}"`);
  }
}

async function runItem(zai: Awaited<ReturnType<typeof ZAI.create>>, item: Item, deadline: number) {
  const attempts = 6;
  for (let a = 1; a <= attempts; a++) {
    const started = Date.now();
    try {
      await attemptOnce(zai, item);
      return "ok" as const;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      const rate = /429/.test(msg) || /hard-timeout/.test(msg) === false && /timeout/.test(msg) === false;
      log(`attempt ${a} FAILED ${item.kind} ${item.label}: ${msg.slice(0, 140)} (${Date.now() - started}ms)`);
      if (a === attempts) {
        if (item.kind === "search") save(`s-${slug(item.label)}.json`, { label: item.label, query: item.query, num: item.num ?? 8, fetched_at: ts(), error: msg });
        else save(`p-${slug(item.label)}.json`, { label: item.label, url: item.url, fetched_at: ts(), error: msg });
        return "failed" as const;
      }
      const wait = /429/.test(msg) ? 60000 + Math.round(Math.random() * 30000) : 8000 * a;
      if (Date.now() + wait > deadline - 5000) { log(`out of time mid-item ${item.label}; stopping run (item will retry next run)`); return "incomplete" as const; }
      log(`waiting ${wait} ms`);
      await sleep(wait);
      if (Date.now() > deadline - 150000) { log(`out of time mid-item ${item.label}; stopping run (item will retry next run)`); return "incomplete" as const; }
    }
  }
  return "failed" as const;
}

async function main() {
  const planPath = process.argv[3];
  const maxRuntime = Number(process.argv[4] || 470000);
  if (!planPath) { console.error("usage: run-plan <plan.json> [maxRuntimeMs]"); process.exit(1); }
  const plan = JSON.parse(readFileSync(planPath, "utf8")) as Item[];
  const deadline = Date.now() + maxRuntime;
  log(`PLAN START ${planPath} (${plan.length} items, maxRuntime ${maxRuntime}ms)`);
  const zai = await ZAI.create();
  let okCount = 0, skipCount = 0, failCount = 0;
  for (let i = 0; i < plan.length; i++) {
    const item = plan[i];
    if (Date.now() > deadline - 150000) { log(`[${i + 1}/${plan.length}] out of time; stopping (remaining items retry next run)`); break; }
    const done = item.kind === "search" ? searchOk(item.label) : readOk(item.label);
    if (done) { skipCount++; log(`[${i + 1}/${plan.length}] SKIP ${item.kind} ${item.label}`); continue; }
    log(`[${i + 1}/${plan.length}] RUN ${item.kind} ${item.label}${item.kind === "search" ? ` :: "${item.query}"` : ` :: ${item.url}`}`);
    const r = await runItem(zai, item, deadline);
    if (r === "ok") okCount++;
    else if (r === "failed") failCount++;
    else break;
    await sleep(4000 + Math.round(Math.random() * 2000));
  }
  log(`PLAN STOP ${planPath}: ok=${okCount} skip=${skipCount} fail=${failCount}`);
}

process.on("uncaughtException", (e) => { log(`UNCAUGHT: ${e?.stack || e}`); });
process.on("unhandledRejection", (e) => { log(`UNHANDLED: ${String(e)}`); });
main().catch((e) => { log(`FATAL ${e?.stack || e}`); process.exit(1); });
