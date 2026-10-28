/**
 * Foodie — TIRUPATI BATCH-5 network research (owner-directed 2026-10-29).
 *
 * Phases (each bounded, logged, politely spaced):
 *
 *   probe       — ONE z-ai web_search availability probe. The provider was
 *                 quota-exhausted (HTTP 429) in batches 4; per protocol we
 *                 probe ONCE and then either resume or record the limitation
 *                 and STOP. Never spun against.
 *   refetch     — TWO targeted Wikipedia article re-fetches (bounded) for
 *                 queue leads whose stored quotes were junk:
 *                   - Tirumala Venkateswara Temple → Vaikuntam Queue Complex
 *                   - Talakona                     → Siddheswara Swamy Temple
 *                 A lead upgrades to candidate ONLY if a clean locality
 *                 sentence is found; otherwise it stays queued.
 *   nominatim   — SMALL-FOOD-BUSINESS discovery (the biggest known gap):
 *                 bounded keyword POI searches (tiffin / mess / bakery /
 *                 sweets / juice / tea / cafe / restaurant / biryani /
 *                 canteen) against the public Nominatim endpoint, strictly
 *                 bounded to a Tirupati/Tirumala viewbox. Every hit recorded
 *                 with its published coordinates for HUMAN review — batch
 *                 rows still import with coordinates NULL (never estimated,
 *                 per batches 009–014 convention).
 *   wikivoyage  — Wikivoyage Tirupati page (Eat/Drink/Sleep listings) as an
 *                 alternative legitimate small-food-business source. Names
 *                 are recorded as LEADS with quotes — assessed by hand, not
 *                 auto-accepted.
 *
 * Honesty contract (identical to the master/direct harnesses):
 *   * every extraction carries source URL + verbatim quote + retrieval date;
 *   * >=4 s spacing between Wikipedia/Wikivoyage hits, >=2 s for Nominatim;
 *   * HTTP 200 alone is never treated as usefulness (content checks);
 *   * nothing pushed, nothing deployed, no production SQL.
 *
 * Usage: bun scripts/foodie-enrichment/research-tirupati-batch5.ts <probe|refetch|nominatim|wikivoyage>
 */

import { mkdirSync, writeFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { politeFetch, RESEARCH_UA } from "./lib/live";

const HERE = dirname(fileURLToPath(import.meta.url));
const EV = join(HERE, "evidence", "tirupati-master");
const B5 = join(EV, "batch5");
mkdirSync(B5, { recursive: true });
const RETRIEVED = new Date().toISOString().slice(0, 10);

const phase = (process.argv[2] ?? "").toLowerCase();
if (!["probe", "refetch", "nominatim", "wikivoyage", "search"].includes(phase)) {
  console.error("usage: research-tirupati-batch5.ts <probe|refetch|nominatim|wikivoyage|search>");
  process.exit(2);
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/* ------------------------------------------------------------------ */
/* Phase: probe — ONE web_search availability check                    */
/* ------------------------------------------------------------------ */

async function probe() {
  const out = join(B5, "websearch-probe.json");
  if (existsSync(out)) {
    console.log("[probe] evidence already exists — resume semantics: kept");
    return;
  }
  const rec: Record<string, unknown> = { task: "batch-5 single web_search availability probe", retrievedOn: RETRIEVED, userAgent: RESEARCH_UA };
  try {
    const { default: ZAI } = await import("z-ai-web-dev-sdk");
    const zai = await (ZAI as any).create();
    const t0 = Date.now();
    const results = (await zai.functions.invoke("web_search", { query: "Tirupati tiffin centre", num: 3 })) as Array<Record<string, unknown>>;
    rec.httpLike = "ok";
    rec.latencyMs = Date.now() - t0;
    rec.resultCount = Array.isArray(results) ? results.length : 0;
    rec.results = Array.isArray(results) ? results.slice(0, 3) : [];
    rec.decision = "provider AVAILABLE — bounded verification may resume this session";
  } catch (e) {
    const msg = String((e as Error).message ?? e);
    const status = /429/.test(msg) ? 429 : /40[0-9]/.test(msg) ? Number(msg.match(/40[0-9]/)?.[0] ?? 0) : null;
    rec.error = msg.slice(0, 400);
    rec.inferredStatus = status;
    rec.decision =
      status === 429
        ? "provider STILL quota-exhausted (429) — paused for this session per protocol; single probe only, no retries"
        : "provider failed — paused for this session; single probe only, no retries";
  }
  writeFileSync(out, JSON.stringify(rec, null, 2) + "\n");
  console.log(`[probe] ${rec.decision}`);
}

/* ------------------------------------------------------------------ */
/* Phase: refetch — two targeted Wikipedia article re-fetches          */
/* ------------------------------------------------------------------ */

const REFETCH_TARGETS: Array<{
  file: string;
  url: string;
  targets: Array<{ name: string; needle: RegExp }>;
  queueLead: string;
}> = [
  {
    file: "tirumala-venkateswara-temple.html",
    url: "https://en.wikipedia.org/wiki/Tirumala_Venkateswara_Temple",
    queueLead: "Vaikuntam Queue Complex",
    targets: [
      { name: "Vaikuntam Queue Complex", needle: /Vaikuntha?m Queue Complex/i },
      { name: "Vaikuntam Queue Complex II", needle: /Queue Complex[- ]?II/i },
    ],
  },
  {
    file: "talakona.html",
    url: "https://en.wikipedia.org/wiki/Talakona",
    queueLead: "Siddheswara Swamy Temple",
    targets: [
      { name: "Siddheswara Swamy Temple", needle: /Siddh[a-z]*\s*Swamy\s*[Tt]emple/i },
      { name: "Siddheswara", needle: /Siddh[a-z]*/i },
    ],
  },
];

const cleanText = (s: string) => s.replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();

async function refetch() {
  const out = join(B5, "wikipedia-refetch-evidence.json");
  const recs: Array<Record<string, unknown>> = [];
  for (const t of REFETCH_TARGETS) {
    const file = join(B5, t.file);
    let html: string | null = null;
    let httpStatus: number | null = null;
    let error: string | null = null;
    if (existsSync(file)) {
      html = await Bun.file(file).text();
      httpStatus = 200;
      console.log(`[refetch] ${t.file} — resume semantics: reusing saved HTML`);
    } else {
      try {
        const res = await politeFetch(t.url, { "User-Agent": RESEARCH_UA, Accept: "text/html" });
        httpStatus = res.status;
        if (res.ok) {
          html = await res.text();
          writeFileSync(file, html);
        } else {
          error = `HTTP ${res.status}`;
        }
      } catch (e) {
        error = String((e as Error).message ?? e).slice(0, 300);
      }
    }
    await sleep(4000);

    const rec: Record<string, unknown> = {
      article: t.queueLead,
      url: t.url,
      httpStatus,
      error,
      retrievedOn: RETRIEVED,
      userAgent: RESEARCH_UA,
      queueLead: t.queueLead,
      usefulness: "not-assessed",
    };
    const findings: Array<{ name: string; verbatimQuote: string; upgradeDecision: string }> = [];
    if (html) {
      const bodyStart = html.indexOf('id="mw-content-text"');
      const articleBody = bodyStart >= 0 ? html.slice(bodyStart) : html;
      if (bodyStart < 0) rec.note = "mw-content-text marker not found — full-HTML fallback (chrome-leak risk; recorded)";
      const text = cleanText(articleBody);
      for (const tgt of t.targets) {
        const m = tgt.needle.exec(text);
        if (!m) continue;
        const from = Math.max(0, m.index - 300);
        const win = text.slice(from, m.index + m[0].length + 300);
        const sentence = win.split(/(?<=[.!?])\s+/).find((s) => tgt.needle.test(s)) ?? win;
        findings.push({ name: tgt.name, verbatimQuote: sentence.slice(0, 500), upgradeDecision: "manual — locality must be IN the sentence" });
      }
      rec.findings = findings;
      rec.usefulness = findings.length > 0 ? "content retrieved; findings require manual locality check" : "page served but target strings absent — lead stays queued";
    } else {
      rec.usefulness = `fetch failed (${error}) — lead stays queued`;
    }
    recs.push(rec);
  }
  const outRec = { task: "batch-5 targeted wikipedia refetch", retrievedOn: RETRIEVED, pages: recs };
  writeFileSync(out, JSON.stringify(outRec, null, 2) + "\n");
  for (const r of recs) {
    console.log(`[refetch] ${r.queueLead}: status=${r.httpStatus} findings=${(r.findings as unknown[]).length} → ${r.usefulness}`);
    for (const f of r.findings as Array<{ name: string; verbatimQuote: string }>) console.log(`   • ${f.name}: ${f.verbatimQuote.slice(0, 200)}`);
  }
}

/* ------------------------------------------------------------------ */
/* Phase: nominatim — bounded small-food-business POI discovery        */
/* ------------------------------------------------------------------ */

/** Tirupati+Tirumala viewbox (left,top,right,bottom = lon,lat): roughly
 *  Tirumala (13.66–13.72 N, 79.33–79.37 E) through central/east Tirupati
 *  (13.60–13.67 N, 79.38–79.47 E) plus a margin. bounded=1 keeps results
 *  inside. */
const VIEWBOX = "79.25,13.78,79.55,13.50";
const KEYWORDS = [
  "tiffin centre Tirupati",
  "mess Tirupati",
  "bakery Tirupati",
  "sweets Tirupati",
  "juice shop Tirupati",
  "tea stall Tirupati",
  "cafe Tirupati",
  "restaurant Tirupati",
  "biryani Tirupati",
  "canteen Tirumala",
  "tiffin centre Tirumala",
  "restaurant Tirumala",
];

async function nominatim() {
  const out = join(B5, "nominatim-food-pois.json");
  const recs: Array<Record<string, unknown>> = [];
  for (const kw of KEYWORDS) {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(kw)}&format=jsonv2&limit=25&viewbox=${VIEWBOX}&bounded=1&addressdetails=1&accept-language=en`;
    const rec: Record<string, unknown> = { keyword: kw, url, retrievedOn: RETRIEVED, userAgent: RESEARCH_UA };
    try {
      const res = await politeFetch(url, { "User-Agent": RESEARCH_UA, Accept: "application/json" });
      rec.httpStatus = res.status;
      if (res.ok) {
        const rows = (await res.json()) as Array<Record<string, unknown>>;
        rec.hits = rows.map((r) => ({
          name: r.name ?? r.display_name,
          displayName: r.display_name,
          osmType: r.osm_type,
          osmId: r.osm_id,
          category: r.category,
          type: r.type,
          lat: r.lat,
          lon: r.lon,
          importance: r.importance,
        }));
        rec.hitCount = rows.length;
        rec.usefulness = rows.length > 0 ? "hits recorded (names + published coordinates for human review; batch rows still import coordinates-NULL)" : "no bounded hits";
      } else {
        rec.error = `HTTP ${res.status}`;
        rec.usefulness = "failed — recorded as limitation";
      }
    } catch (e) {
      rec.error = String((e as Error).message ?? e).slice(0, 300);
      rec.usefulness = "failed — recorded as limitation";
    }
    recs.push(rec);
    console.log(`[nominatim] ${kw}: status=${rec.httpStatus ?? "?"} hits=${rec.hitCount ?? 0}`);
    await sleep(2000);
  }
  writeFileSync(out, JSON.stringify({ task: "batch-5 nominatim small-food-business discovery", retrievedOn: RETRIEVED, viewbox: VIEWBOX, queries: recs }, null, 2) + "\n");
  console.log(`[nominatim] written → ${out}`);
}

/* ------------------------------------------------------------------ */
/* Phase: wikivoyage — Eat/Drink/Sleep listings                        */
/* ------------------------------------------------------------------ */

const WIKIVOYAGE_PAGES = [{ file: "wikivoyage-tirupati.html", url: "https://en.wikivoyage.org/wiki/Tirupati" }];

async function wikivoyage() {
  const out = join(B5, "wikivoyage-evidence.json");
  const pages: Array<Record<string, unknown>> = [];
  for (const p of WIKIVOYAGE_PAGES) {
    const file = join(B5, p.file);
    let html: string | null = null;
    let httpStatus: number | null = null;
    let error: string | null = null;
    if (existsSync(file)) {
      html = await Bun.file(file).text();
      httpStatus = 200;
      console.log(`[wikivoyage] ${p.file} — resume semantics: reusing saved HTML`);
    } else {
      try {
        const res = await politeFetch(p.url, { "User-Agent": RESEARCH_UA, Accept: "text/html" });
        httpStatus = res.status;
        if (res.ok) {
          html = await res.text();
          writeFileSync(file, html);
        } else {
          error = `HTTP ${res.status}`;
        }
      } catch (e) {
        error = String((e as Error).message ?? e).slice(0, 300);
      }
    }
    await sleep(4000);
    const rec: Record<string, unknown> = { url: p.url, httpStatus, error, retrievedOn: RETRIEVED, userAgent: RESEARCH_UA, sections: [] as unknown[] };
    if (html) {
      /* Wikivoyage listings are structured <div class="vcard"> blocks with
         name/address/content spans — extract them verbatim. */
      const vcards: Array<{ name: string; address?: string; content?: string; direction?: string; phone?: string }> = [];
      for (const m of html.matchAll(/<div class="vcard"[^>]*>([\s\S]*?)<\/div>\s*(?=<div class="vcard"|<\/ul>|<\/div class)/g)) {
        const blk = m[1];
        const nm = /<span class="fn org"[^>]*>([\s\S]*?)<\/span>/.exec(blk) ?? /<span class="listing-name"[^>]*>([\s\S]*?)<\/span>/.exec(blk);
        const ad = /<span class="listing-address"[^>]*>([\s\S]*?)<\/span>/.exec(blk);
        const ct = /<span class="listing-content"[^>]*>([\s\S]*?)<\/span>/.exec(blk);
        const dr = /<span class="listing-directions"[^>]*>([\s\S]*?)<\/span>/.exec(blk);
        const ph = /<span class="listing-phone"[^>]*>([\s\S]*?)<\/span>/.exec(blk);
        if (nm) {
          vcards.push({
            name: cleanText(nm[1]),
            address: ad ? cleanText(ad[1]) : undefined,
            content: ct ? cleanText(ct[1]).slice(0, 400) : undefined,
            direction: dr ? cleanText(dr[1]) : undefined,
            phone: ph ? cleanText(ph[1]) : undefined,
          });
        }
      }
      (rec.sections as unknown[]).push({ kind: "vcard-listings", count: vcards.length, items: vcards });
      rec.usefulness = vcards.length > 0 ? `structured listings found (${vcards.length}) — LEADS ONLY, manual assessment next` : "no structured vcard listings in served HTML — page recorded, not treated as useful";
    } else {
      rec.usefulness = `fetch failed (${error}) — recorded as limitation`;
    }
    pages.push(rec);
  }
  writeFileSync(out, JSON.stringify({ task: "batch-5 wikivoyage small-food-business leads", retrievedOn: RETRIEVED, pages }, null, 2) + "\n");
  for (const p of pages) {
    const s0 = (p.sections as Array<{ count: number }>)[0];
    console.log(`[wikivoyage] ${p.url}: status=${p.httpStatus} listings=${s0?.count ?? 0}`);
  }
}

/* ------------------------------------------------------------------ */
/* Phase: search — bounded small-food-business discovery + lead checks */
/* ------------------------------------------------------------------ */

type Hit = { url: string; name?: string | null; snippet?: string | null; host?: string };

async function webSearch(query: string, num: number): Promise<Hit[]> {
  const { default: ZAI } = await import("z-ai-web-dev-sdk");
  const zai = await (ZAI as any).create();
  const results = (await zai.functions.invoke("web_search", { query, num })) as Array<{
    url?: string;
    name?: string;
    snippet?: string;
  }>;
  return (results ?? [])
    .filter((r) => r.url)
    .map((r) => ({ url: r.url as string, name: r.name ?? null, snippet: r.snippet ?? null }));
}

const hostOf = (u: string) => { try { return new URL(u).host; } catch { return null; } };

/** Locality-by-locality, category-by-category BOUNDED query set — exactly the
 *  small-food-business categories the owner listed. 19 discovery queries. */
const DISCOVERY_QUERIES: Array<{ area: string; query: string; category: string }> = [
  { area: "tpt-central", query: "\"tiffin centre\" Tirupati", category: "food-tiffin" },
  { area: "tpt-central", query: "\"tea stall\" Tirupati", category: "food-street" },
  { area: "tpt-central", query: "mess Tirupati meals", category: "food-restaurants" },
  { area: "tpt-central", query: "bakery Tirupati", category: "food-bakery" },
  { area: "tpt-central", query: "\"sweet shop\" Tirupati", category: "food-bakery" },
  { area: "tpt-central", query: "\"juice shop\" OR \"juice centre\" Tirupati", category: "food-street" },
  { area: "tpt-central", query: "\"street food\" Tirupati", category: "food-street" },
  { area: "tpt-central", query: "\"family restaurant\" Tirupati", category: "food-restaurants" },
  { area: "tirumala", query: "\"tiffin centre\" Tirumala", category: "food-tiffin" },
  { area: "tirumala", query: "\"tea stall\" Tirumala", category: "food-street" },
  { area: "tirumala", query: "canteen Tirumala", category: "food-restaurants" },
  { area: "tirumala", query: "\"sweet shop\" Tirumala", category: "food-bakery" },
  { area: "tiruchanur", query: "\"tiffin centre\" OR bakery Tiruchanur", category: "food-tiffin" },
  { area: "renigunta", query: "\"tiffin centre\" OR bakery Renigunta", category: "food-tiffin" },
  { area: "chandragiri", query: "\"tea stall\" OR bakery Chandragiri Tirupati", category: "food-bakery" },
  { area: "srinivasa-mangapuram", query: "\"tiffin centre\" OR mess Srinivasa Mangapuram", category: "food-tiffin" },
  { area: "tpt-neighbourhoods", query: "\"tiffin centre\" Mangalam Tirupati", category: "food-tiffin" },
  { area: "tpt-neighbourhoods", query: "bakery OR \"sweet shop\" Avilala Tirupati", category: "food-bakery" },
  { area: "tpt-neighbourhoods", query: "\"juice shop\" OR \"tea stall\" KTC Chew Tirupati", category: "food-street" },
];

/** Targeted checks for the 4 ambiguous review-queue leads (upgrade ONLY on
 *  clean locality evidence, decided by hand from the recorded hits). */
const LEAD_CHECK_QUERIES: Array<{ lead: string; query: string }> = [
  { lead: "Vaikuntam Queue Complex", query: "\"Vaikuntam Queue Complex\" Tirumala" },
  { lead: "Siddheswara Swamy Temple", query: "\"Siddheswara Swamy Temple\" Talakona" },
  { lead: "Venugopalaswamy Temple, Karvetinagaram", query: "\"Venugopalaswamy Temple\" Karvetinagaram" },
  { lead: "Puttur, Andhra Pradesh", query: "Puttur Tirupati district places to visit" },
];

const SEARCH_PACING_MS = 8_000;

async function runSearchBatch(kind: "discovery" | "lead-checks") {
  const out = join(B5, kind === "discovery" ? "search-discovery-food.json" : "search-lead-checks.json");
  const queries = kind === "discovery" ? DISCOVERY_QUERIES : LEAD_CHECK_QUERIES;
  const recs: Array<Record<string, unknown>> = [];
  let throttled = 0;
  for (const q of queries) {
    const rec: Record<string, unknown> = kind === "discovery" ? { area: (q as { area: string }).area, category: (q as { category: string }).category, query: q.query } : { lead: (q as { lead: string }).lead, query: q.query };
    rec.retrievedOn = RETRIEVED;
    try {
      const hits = await webSearch(q.query, 8);
      rec.hits = hits.map((h) => ({ ...h, host: hostOf(h.url) }));
      rec.hitCount = hits.length;
      throttled = 0;
      console.log(`[search:${kind}] ${q.query} → ${hits.length} hits`);
    } catch (e) {
      const msg = String((e as Error).message ?? e);
      rec.error = msg.slice(0, 300);
      rec.hits = [];
      throttled++;
      console.log(`[search:${kind}] ${q.query} → ERROR ${msg.slice(0, 120)}`);
      if (throttled >= 3) {
        recs.push(rec);
        console.log(`[search:${kind}] 3 consecutive errors — pausing source this run (bounded); completed queries preserved.`);
        break;
      }
    }
    recs.push(rec);
    await sleep(SEARCH_PACING_MS);
  }
  writeFileSync(out, JSON.stringify({ task: `batch-5 web_search ${kind}`, retrievedOn: RETRIEVED, pacingMs: SEARCH_PACING_MS, queries: recs }, null, 2) + "\n");
  console.log(`[search:${kind}] written → ${out}`);
}

if (phase === "probe") probe();
else if (phase === "refetch") refetch();
else if (phase === "nominatim") nominatim();
else if (phase === "wikivoyage") wikivoyage();
else if (phase === "search") runSearchBatch((process.argv[3] ?? "discovery") === "lead-checks" ? "lead-checks" : "discovery");
