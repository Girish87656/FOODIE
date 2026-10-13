/**
 * Foodie — Research round 3: direct venue-page evidence refresh (Task 3-a).
 *
 * Fetches the exact directory venue URLs already committed in the phase-3D
 * research worksheet (district.in / magicpin / eazydiner / mappls / scribd),
 * saves each raw HTML as evidence, and extracts structured facts (JSON-LD,
 * embedded store JSON) WITHOUT interpreting or completing anything.
 * Sequential + polite. No SDK quota involved.
 */
import { mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = "/home/z/my-project";
const OUT = join(ROOT, "tool-results/research3");
const RAW = join(OUT, process.env.RAW_DIR ?? "direct");
mkdirSync(RAW, { recursive: true });

type Job = { url: string; kind: string; row: number; name: string; cols: string[] };
const jobFile = process.argv[2] ?? "direct-fetch-jobs.json";
const jobs: Job[] = JSON.parse(readFileSync(join(OUT, jobFile), "utf8"));

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function extract(jsonLdText: string): unknown {
  try { return JSON.parse(jsonLdText); } catch { return null; }
}

async function fetchJob(job: Job, attempt = 1): Promise<void> {
  const slug = job.url.replace(/^https?:\/\//, "").replace(/[^a-z0-9]+/gi, "-").slice(0, 80);
  const htmlPath = join(RAW, `v${job.row}-${job.kind}-${slug.slice(0, 60)}.html`);
  try {
    const res = await fetch(job.url, { headers: { "User-Agent": UA, "Accept-Language": "en" }, redirect: "follow" });
    const html = await res.text();
    const title = /<title>([\s\S]*?)<\/title>/.exec(html)?.[1]?.trim() ?? null;

    // ---- structured extractions (verbatim capture only) ----
    const found: Record<string, unknown> = { http: res.status, final_url: res.url, title };
    const jsonldChunks: unknown[] = [];

    for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
      const parsed = extract(m[1]);
      if (parsed) jsonldChunks.push(parsed);
    }
    if (jsonldChunks.length) found.jsonld = jsonldChunks;
    const nextData = /<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/.exec(html)?.[1];
    if (nextData) found.next_data = extract(nextData);

    // magicpin embedded store payload
    const storeJson = /window\.__INITIAL_STATE__\s*=\s*({[\s\S]*?});\s*<\/script>/.exec(html)?.[1];
    if (storeJson) found.initial_state = extract(storeJson);

    // verbatim keyword context lines (address/phone/hours/rating mentions)
    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/&amp;/g, "&").replace(/&nbsp;/g, " ").replace(/&quot;/g, '"').replace(/&#39;/g, "'")
      .replace(/\s+/g, " ")
      .trim();
    found.text_length = text.length;
    const kws = [job.name, "phone", "address", "timing", "hours", "open", "rating", "shutdown", "closed", "verified", "₹"];
    const ctx: string[] = [];
    for (const kw of kws) {
      let idx = text.toLowerCase().indexOf(kw.toLowerCase());
      let taken = 0;
      while (idx !== -1 && taken < 2) {
        ctx.push(`[${kw}] ${text.slice(Math.max(0, idx - 100), idx + 220)}`);
        taken += 1;
        idx = text.toLowerCase().indexOf(kw.toLowerCase(), idx + 240);
      }
    }
    found.keyword_context = ctx;

    writeFileSync(htmlPath, html);
    writeFileSync(htmlPath.replace(/\.html$/, ".extract.json"), JSON.stringify(found, null, 2));
    console.log(`OK r${job.row} ${job.name} [${job.kind}] http=${res.status} len=${html.length} title=${(title ?? "?").slice(0, 70)}`);
  } catch (err) {
    console.error(`FAIL r${job.row} ${job.name} [${job.kind}]: ${(err as Error).message.slice(0, 140)}`);
    if (attempt < 2) {
      await sleep(6000);
      return fetchJob(job, attempt + 1);
    }
  }
}

for (const job of jobs) {
  await fetchJob(job);
  await sleep(2200 + Math.floor(Math.random() * 1500));
}
console.log("direct evidence refresh complete");
