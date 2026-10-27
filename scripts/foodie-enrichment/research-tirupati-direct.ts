/**
 * Foodie — TIRUPATI DIRECT-SOURCE discovery (owner-directed 2026-10-28).
 *
 * The z-ai web_search provider is quota-exhausted (HTTP 429 recorded — ONE
 * bounded probe this session; the provider was then PAUSED per protocol, not
 * spun against). This harness widens the evidence base through sources that
 * are directly accessible WITHOUT that provider:
 *
 *   official2   — fetch NEW tirumala.org official pages (nav links recorded in
 *                 the saved homepage but never fetched) and save raw HTML.
 *   wikipedia   — fetch a BOUNDED set of English Wikipedia ARTICLE pages
 *                 (the api.php endpoint is separately rate-limited from this
 *                 sandbox — recorded limitation; article pages themselves are
 *                 served fine) and extract place-name links + verbatim quotes
 *                 + the article subject coordinates (the page's own published
 *                 coordinate) into evidence/tirupati-master/wikipedia-evidence.json
 *   crossmatch  — exact normalized-name match of verification-PENDING
 *                 candidates (throttled stubs / never-attempted) against the
 *                 NEW independent sources. A match writes crossmatch-<slug>.json
 *                 recording an INDEPENDENT-SOURCE locality confirmation —
 *                 honestly distinct from the web_search identity verify; the
 *                 previous attempts / throttled stubs stay on disk untouched.
 *
 * Honesty contract (identical to the master harness):
 *   * every extraction carries its source URL + verbatim quote;
 *   * nothing is invented; no page is scraped beyond its place evidence;
 *   * rate limits are respected: >=1.2 s between hits on the same host
 *     (politeFetch), wikipedia fetches spaced >=4 s, total page set bounded;
 *   * robots/terms: only public article pages are fetched, no bulk
 *     harvesting, no Google Maps, no directory-page scraping.
 *
 * Usage:
 *   bun scripts/foodie-enrichment/research-tirupati-direct.ts official2
 *   bun scripts/foodie-enrichment/research-tirupati-direct.ts wikipedia
 *   bun scripts/foodie-enrichment/research-tirupati-direct.ts crossmatch
 */

import { mkdirSync, writeFileSync, existsSync, readFileSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { politeFetch, RESEARCH_UA, slugify } from "./lib/live";

const HERE = dirname(fileURLToPath(import.meta.url));
const EV = join(HERE, "evidence", "tirupati-master");
const OFFICIAL_DIR = join(EV, "official");
const WIKI_DIR = join(EV, "wikipedia");
mkdirSync(OFFICIAL_DIR, { recursive: true });
mkdirSync(WIKI_DIR, { recursive: true });
const RETRIEVED = new Date().toISOString().slice(0, 10);

const phase = (process.argv[2] ?? "").toLowerCase();
if (!["official2", "wikipedia", "crossmatch"].includes(phase)) {
  console.error("usage: research-tirupati-direct.ts <official2|wikipedia|crossmatch>");
  process.exit(2);
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/* ------------------------------------------------------------------ */
/* Phase A: official2 — new tirumala.org pages                         */
/* ------------------------------------------------------------------ */

/** New official pages discovered in the saved tirumala.org nav (never fetched
 *  by batches 1-3). Chosen for the owner's coverage gaps: parks/gardens,
 *  teerthams (sacred sites), marriage halls & cottages + named TTD guest
 *  houses (pilgrim lodges), and the Varahaswamy temple page (Tirumala). */
const OFFICIAL2_PAGES: Array<{ file: string; url: string; why: string }> = [
  { file: "ttd-garden.html", url: "https://www.tirumala.org/garden.aspx", why: "TTD gardens/parks page — parks & gardens coverage gap" },
  { file: "ttd-theerthams.html", url: "https://www.tirumala.org/theerthams.aspx", why: "TTD teerthams page — sacred sites coverage" },
  { file: "ttd-marriagehallcotteges.html", url: "https://www.tirumala.org/marriagehallcotteges.aspx", why: "TTD marriage halls & cottages — pilgrim accommodation coverage" },
  { file: "ttd-sripadmavathiguesthouse.html", url: "https://www.tirumala.org/sripadmavathiguesthouse.aspx", why: "named TTD guest house page — pilgrim lodges" },
  { file: "ttd-srivenkateswaraguesthouse.html", url: "https://www.tirumala.org/srivenkateswaraguesthouse.aspx", why: "named TTD guest house page — pilgrim lodges" },
  { file: "ttd-varahaswamiguesthouse.html", url: "https://www.tirumala.org/varahaswamiguesthouse.aspx", why: "named TTD guest house page — pilgrim lodges" },
  { file: "ttd-varahaswamytirumala.html", url: "https://www.tirumala.org/varahaswamytirumala.aspx", why: "TTD Varahaswamy temple (Tirumala) page — temple coverage" },
];

/** shell detection: generic TTD homepage title AND no rate-table content.
 *  Real pages (rate tables) carry the generic title too — content wins. */
function isHomepageShell(html: string): boolean {
  const genericTitle = /<title>\s*Tirumala Tirupati Devasthanams \(Official Website\)\s*<\/title>/i.test(html);
  const hasContent = /Rate Per Unit|Marriage halls and Cottages/i.test(html);
  return genericTitle && !hasContent;
}

async function runOfficial2(): Promise<void> {
  const results: Array<{ url: string; file: string | null; httpStatus: number | null; bytes: number | null; error?: string; why: string }> = [];
  for (const p of OFFICIAL2_PAGES) {
    const existing = join(OFFICIAL_DIR, p.file);
    if (existsSync(existing)) {
      const saved = readFileSync(existing, "utf8");
      const shellTitle = isHomepageShell(saved);
      results.push({
        url: p.url, file: p.file, httpStatus: 200, bytes: saved.length,
        pageTitle: /<title>([\s\S]*?)<\/title>/i.exec(saved)?.[1]?.trim() ?? null,
        servedHomepageShell: shellTitle,
        note: shellTitle ? "URL served the site's default homepage shell — dead/retired link; NO place content; recorded as limitation" : undefined,
        why: p.why + " (already fetched — resume semantics: kept)",
      });
      console.log(`[official2] SKIP (already saved${shellTitle ? ", HOMEPAGE SHELL" : ""}) ${p.url}`);
      continue;
    }
    try {
      const res = await politeFetch(p.url, { "User-Agent": RESEARCH_UA, Accept: "text/html" });
      const body = await res.text();
      (await import("fs")).writeFileSync(existing, body);
      // shell detection: the site serves its default homepage shell (generic
      // TTD title, nav+footer only, ~215 KB) for dead/retired URLs — such a
      // response carries NO page content and is recorded as a limitation,
      // never as a content page. NOTE: several REAL pages also carry the
      // generic <title>, so the shell test requires BOTH the generic title
      // AND the absence of the pages' actual content marker ("Rate Per Unit"
      // rate tables). Content presence always wins over the generic title.
      const shellTitle = isHomepageShell(body);
      const title = /<title>([\s\S]*?)<\/title>/i.exec(body)?.[1]?.trim() ?? null;
      results.push({
        url: p.url, file: p.file, httpStatus: res.status, bytes: body.length,
        pageTitle: title, servedHomepageShell: shellTitle,
        note: shellTitle ? "URL served the site's default homepage shell — dead/retired link; NO place content; recorded as limitation" : undefined,
        why: p.why,
      });
      console.log(`[official2] ${res.status} ${body.length}B ${shellTitle ? "(HOMEPAGE SHELL — no content)" : ""} ${p.url}`);
    } catch (e) {
      results.push({ url: p.url, file: null, httpStatus: null, bytes: null, error: (e as Error).message, why: p.why });
      console.log(`[official2] FAILED ${p.url}: ${(e as Error).message}`);
    }
    await sleep(2500);
  }
  writeFileSync(join(OFFICIAL_DIR, "official2-fetch-log.json"), JSON.stringify({ task: "batch-4 direct official fetch", userAgent: RESEARCH_UA, retrievedOn: RETRIEVED, results }, null, 2));
  console.log(`[official2] DONE → official/official2-fetch-log.json`);
}

/* ------------------------------------------------------------------ */
/* Phase B: wikipedia — bounded article fetch + extraction             */
/* ------------------------------------------------------------------ */

/** Bounded article set. Each page maps to ONE honest area (the master
 *  harness's area keys); the page's place links become candidates of that
 *  area unless their own text names another known locality. */
const WIKI_PAGES: Array<{ title: string; area: string; areaTokens: RegExp }> = [
  { title: "Tirupati", area: "tpt-central", areaTokens: /\btirupati\b/i },
  { title: "Tirumala", area: "tirumala", areaTokens: /\btirumala\b/i },
  { title: "Tirumala Venkateswara Temple", area: "tirumala", areaTokens: /\btirumala\b/i },
  { title: "Alamelu Mangapuram", area: "tiruchanur", areaTokens: /\btiruchan(oo|u)r\b|alamelu\s*manga/i },
  { title: "Srinivasa Mangapuram", area: "srinivasa-mangapuram", areaTokens: /srinivasa\s*manga/i },
  { title: "Chandragiri, Tirupati district", area: "chandragiri", areaTokens: /\bchandragiri\b/i },
  { title: "Srikalahasti", area: "surrounding", areaTokens: /\bsrikalahasti\b|\bchittoor\b/i },
  { title: "Nagalapuram", area: "surrounding", areaTokens: /\bnagalapuram\b|\bchittoor\b/i },
  { title: "Talakona", area: "surrounding", areaTokens: /\btalakona\b|\bchittoor\b|\btirupati\b/i },
  { title: "Kapila Theertham", area: "tpt-central", areaTokens: /\btirupati\b/i },
  { title: "Sri Venkateswara National Park", area: "surrounding", areaTokens: /\btirupati\b|\bchittoor\b/i },
  { title: "Narayanavanam", area: "surrounding", areaTokens: /\bnarayanavanam\b|\bchittoor\b/i },
  { title: "Kalyani Dam", area: "surrounding", areaTokens: /\btirupati\b|\bchittoor\b/i },
  { title: "Sri Venkateswara Zoological Park", area: "tpt-neighbourhoods", areaTokens: /\btirupati\b/i },
  { title: "Renigunta", area: "renigunta", areaTokens: /\brenigunta\b/i },
];

interface WikiEntry {
  name: string;
  area: string;
  sourceUrl: string;
  pageTitle: string;
  verbatimQuote: string | null;
  /** article subject coordinate when the page publishes one (geohack params) */
  pageCoord: { lat: number; lng: number } | null;
}

/** extract visible text (same normalization family as the official extractor) */
function cleanText(raw: string): string {
  return raw
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<[^>]+>/g, "\n")
    .replace(/&#160;|&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

/** non-place link titles — conservative blocklist (films, people topics,
 *  transport hubs, language/culture meta, lists, disambiguation). */
const WIKI_LINK_BLOCK = /(\bfilm\b|\bmovie\b|disambiguation|List of|airport|railway station|expressway|highway|National Highway|\broad\b|\bbus\b|\btrain\b|caste|language|cuisine \(|legend of|history of|timeline|portal:|Template:|File:|Category:|Help:)/i;
/** a link is place-ish when the title or the surrounding sentence carries
 *  place vocabulary AND the area gate can confirm locality context. */
const PLACEISH = /\b(temple|swamy|swami|theertham|teertham|kshetram|shrine|mutt|matha|ashram|church|dargah|masjid|mosque|fort|mahal|palace|museum|zoo|park|garden|dam|lake|falls|waterfall|hill|hills|peak|cave|village|suburb|neighbourhood|neighborhood|colony|nagar|petta|peta|bazaar|market|street|pushkarini|konelu|tirtham)\b/i;
const SENTENCE_SPLIT = /(?<=[.!?])\s+(?=[A-Z0-9])/;

async function runWikipedia(): Promise<void> {
  const out: { retrievedOn: string; userAgent: string; apiLimitation: string; pages: Array<Record<string, unknown>> } = {
    retrievedOn: RETRIEVED,
    userAgent: RESEARCH_UA,
    apiLimitation: "en.wikipedia.org api.php returned HTTP 429 from this shared sandbox egress IP (recorded limitation); ARTICLE pages fetch fine and were used instead. Bounded set, >=4 s spacing, page-subject data only — no bulk harvesting.",
    pages: [],
  };
  for (const p of WIKI_PAGES) {
    const url = `https://en.wikipedia.org/wiki/${encodeURIComponent(p.title.replace(/ /g, "_"))}`;
    const rec: Record<string, unknown> = { pageTitle: p.title, area: p.area, url, fetchedOn: RETRIEVED };
    try {
      const res = await politeFetch(url, { "User-Agent": RESEARCH_UA, Accept: "text/html" });
      rec.httpStatus = res.status;
      if (res.ok) {
        const raw = await res.text();
        // article subject coordinate from the geohack link (the page's own published coordinate)
        const geo = /geohack\.geohack\.geohack|geohack\.com?\/[^"']*params=([\d.]+)_N_([\d.]+)_E/i.exec(raw)
          ?? /params=([\d.]+)_N_([\d.]+)_E/i.exec(raw);
        rec.pageCoord = geo ? { lat: Number(geo[1]), lng: Number(geo[2]) } : null;
        // link extraction with sentence context
        const text = cleanText(raw);
        const sentences = text.split(SENTENCE_SPLIT);
        const seen = new Map<string, WikiEntry>();
        const linkRe = /<a\s+href="\/wiki\/([^"#?][^"]*)"[^>]*?(?:title="([^"]*)")?[^>]*>([\s\S]*?)<\/a>/g;
        let m: RegExpExecArray | null;
        while ((m = linkRe.exec(raw)) !== null) {
          const hrefTitle = decodeURIComponent(m[1].replace(/_/g, " "));
          const titleAttr = m[2] ? decodeURIComponent(m[2]) : hrefTitle;
          const label = cleanText(m[3]) || titleAttr;
          if (!label || label.length < 4 || label.length > 80) continue;
          if (WIKI_LINK_BLOCK.test(hrefTitle) || WIKI_LINK_BLOCK.test(label)) continue;
          if (/^(List of|Index of|Outline of)/i.test(hrefTitle)) continue;
          // find the sentence containing this label (first occurrence)
          const needle = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
          const sent = sentences.find((s) => new RegExp(`\\b${needle}\\b`, "i").test(s));
          if (!sent) continue;
          const contextText = sent;
          if (!PLACEISH.test(label) && !PLACEISH.test(hrefTitle) && !PLACEISH.test(contextText)) continue;
          // locality gate: the sentence or the title must name the page's area
          if (!p.areaTokens.test(contextText) && !p.areaTokens.test(label) && !p.areaTokens.test(hrefTitle)) continue;
          const name = titleAttr.split("(")[0].trim();
          if (!name || seen.has(name)) continue;
          const quote = contextText.slice(0, 300);
          seen.set(name, { name, area: p.area, sourceUrl: url, pageTitle: p.title, verbatimQuote: quote, pageCoord: (rec.pageCoord as { lat: number; lng: number } | null) ?? null });
        }
        rec.entries = Array.from(seen.values());
        rec.entryCount = rec.entries.length;
      } else {
        rec.note = `HTTP ${res.status} — recorded, not retried`;
      }
    } catch (e) {
      rec.httpStatus = null;
      rec.error = (e as Error).message;
    }
    out.pages.push(rec);
    console.log(`[wikipedia] ${rec.httpStatus ?? "ERR"} "${p.title}" → ${rec.entryCount ?? 0} place links (coord: ${rec.pageCoord ? "yes" : "no"})`);
    await sleep(4000); // bounded pacing — respectful of the shared egress
  }
  writeFileSync(join(WIKI_DIR, "wikipedia-evidence.json"), JSON.stringify(out, null, 2));
  const total = out.pages.reduce((a, p) => a + ((p.entryCount as number) ?? 0), 0);
  console.log(`[wikipedia] DONE — ${out.pages.length} pages, ${total} entries → evidence/tirupati-master/wikipedia/wikipedia-evidence.json`);
}

/* ------------------------------------------------------------------ */
/* Phase C: crossmatch — independent-source confirmation for PENDING   */
/* ------------------------------------------------------------------ */

const norm = (s: string) =>
  s.toLowerCase()
    .normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

interface SourceName { name: string; norm: string; area: string; kind: string; url: string; quote: string | null }

async function runCrossmatch(): Promise<void> {
  // 1. load the raw worksheet (evidence-derived candidates)
  const ws = JSON.parse(readFileSync(join(HERE, "worksheets", "tirupati-master.json"), "utf8")) as {
    rows: Array<{ area: string; name: string; verification: { queried: boolean; areaConfirmed: boolean }; verificationThrottled?: boolean; sourceUrl: string; group: string }>;
  };
  // 2. build the independent-source name corpus (per area) from NEW sources
  const corpus: SourceName[] = [];
  // 2a. wikipedia entries
  const wikiPath = join(WIKI_DIR, "wikipedia-evidence.json");
  if (existsSync(wikiPath)) {
    const wiki = JSON.parse(readFileSync(wikiPath, "utf8")) as { pages: Array<{ area: string; url: string; pageTitle: string; entries?: Array<{ name: string; verbatimQuote: string | null }> }> };
    for (const page of wiki.pages) {
      for (const e of page.entries ?? []) {
        corpus.push({ name: e.name, norm: norm(e.name), area: page.area, kind: "wikipedia", url: page.url, quote: e.verbatimQuote });
      }
    }
  }
  // 2b. NEW official page extractions (official2 pages only — their per-page
  //     area is known; the legacy 18 pages' places already flow via OFFICIAL_NAME_MAP)
  const o2Path = join(OFFICIAL_DIR, "official2-extractions.json");
  if (existsSync(o2Path)) {
    const o2 = JSON.parse(readFileSync(o2Path, "utf8")) as { pages: Array<{ area: string; sourceUrl: string; page: string; extracted: Array<{ name: string; verbatimQuote: string | null }> }> };
    for (const page of o2.pages) {
      for (const e of page.extracted ?? []) {
        corpus.push({ name: e.name, norm: norm(e.name), area: page.area, kind: "official-ttd", url: page.sourceUrl, quote: e.verbatimQuote });
      }
    }
  }
  console.log(`[crossmatch] corpus: ${corpus.length} independent-source names`);
  // 3. match PENDING candidates only (no completed verify evidence)
  const stats = { pending: 0, matched: 0, written: 0 };
  for (const row of ws.rows) {
    const slug = slugify(`${row.area}-${row.name}`);
    const vFile = join(EV, `verify-${slug}.json`);
    let pending = true;
    if (existsSync(vFile)) {
      try {
        const v = JSON.parse(readFileSync(vFile, "utf8")) as { skipped?: boolean };
        pending = !!v.skipped; // completed records stay completed
      } catch { pending = true; }
    }
    if (!pending) continue;
    stats.pending++;
    const nKey = norm(row.name);
    const hit = corpus.find((c) => c.norm === nKey && c.area === row.area);
    if (!hit) continue;
    stats.matched++;
    const cmFile = join(EV, `crossmatch-${slug}.json`);
    writeFileSync(cmFile, JSON.stringify({
      candidate: { name: row.name, area: row.area, sourceUrl: row.sourceUrl, group: row.group },
      match: { kind: hit.kind, name: hit.name, url: hit.url, verbatimQuote: hit.quote },
      rule: "exact normalized-name equality within the SAME honest area",
      meaning: "INDEPENDENT-SOURCE locality confirmation — the candidate's identity is corroborated by a second, non-search source. This is NOT a web_search identity verification and is never labelled as one.",
      previousVerifyState: "pending (throttled stub or never attempted) — stub file preserved untouched on disk",
      retrievedOn: RETRIEVED,
    }, null, 2));
    stats.written++;
    console.log(`[crossmatch] ✓ "${row.name}" [${row.area}] ← ${hit.kind}: ${hit.url}`);
  }
  console.log(`[crossmatch] TALLY — pending: ${stats.pending}, independent-source matches: ${stats.matched}, crossmatch files written: ${stats.written}`);
}

switch (phase) {
  case "official2":
    runOfficial2().catch((e) => { console.error("FATAL:", e); process.exit(1); });
    break;
  case "wikipedia":
    runWikipedia().catch((e) => { console.error("FATAL:", e); process.exit(1); });
    break;
  case "crossmatch":
    runCrossmatch().catch((e) => { console.error("FATAL:", e); process.exit(1); });
    break;
}
