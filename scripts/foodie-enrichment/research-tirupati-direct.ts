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
 *   extract-official2 — parse the 4 REAL saved rate-table pages into venue
 *                 names + verbatim quotes → official/official2-extractions.json
 *                 (documentary corroboration for batch-013 queued rows; shells
 *                 excluded; subjects taken from page headings, not filenames).
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
if (!["official2", "wikipedia", "extract-official2", "crossmatch", "new-names"].includes(phase)) {
  console.error("usage: research-tirupati-direct.ts <official2|wikipedia|extract-official2|crossmatch|new-names>");
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
  const results: Array<{ url: string; file: string | null; httpStatus: number | null; bytes: number | null; pageTitle?: string | null; servedHomepageShell?: boolean; note?: string; error?: string; why: string }> = [];
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
  { title: "Chandragiri", area: "chandragiri", areaTokens: /\bchandragiri\b/i },
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
  /** how the locality attribution was established (recorded per entry) */
  areaEvidence: "sentence-locality" | "paragraph-locality" | "name-locality";
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
/** Wikipedia navigation-chrome links (sidebar/menu namespaces). The first
 *  run leaked these into entries because the collapsed whole-page sentence
 *  context let them pass the gates — this blocklist runs FIRST now, and
 *  extraction is scoped to the article body (see runWikipedia). */
const WIKI_CHROME_LINK = /^(Main Page|Wikipedia:|Special:|Help:|Category:|Portal:|Template:|File:|Talk:|Draft:|MOS:|Manual:|MediaWiki:)/i;
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
        // disambiguation guard: a disambig page's links are OTHER same-named
        // places elsewhere — they would pass the locality gate spuriously
        // (e.g. "Chandragiri, Kerala" naming "Chandragiri"). Such pages are
        // recorded honestly with ZERO entries, never mined for candidates.
        if (/may refer to/i.test(raw.slice(0, 6000))) {
          rec.disambiguationPage = true;
          rec.entries = [];
          rec.entryCount = 0;
          out.pages.push(rec);
          console.log(`[wikipedia] ${rec.httpStatus} "${p.title}" → DISAMBIGUATION PAGE — 0 entries (guard)`);
          await sleep(4000);
          continue;
        }
        // scope extraction to the ARTICLE BODY — sidebar/nav chrome lives
        // outside mw-content-text (the first run's whole-page collapse let
        // "Main Page"/"Special:Random" links leak into entries; fixed here)
        const bodyStart = raw.indexOf('id="mw-content-text"');
        const bodyEndIdx = Math.min(...[raw.indexOf('id="catlinks"'), raw.indexOf("printfooter"), raw.length].filter((n) => n > 0));
        const articleBody = bodyStart >= 0 ? raw.slice(bodyStart, bodyEndIdx > bodyStart ? bodyEndIdx : undefined) : raw;
        if (bodyStart < 0) rec.note = "mw-content-text marker not found — extraction fell back to full HTML (chrome-leak risk; recorded)";
        const seen = new Map<string, WikiEntry>();
        // anchors in the served HTML come in TWO forms: relative
        // (/wiki/X — nav chrome) and ABSOLUTE with attributes before href
        // (<a rel="mw:WikiLink" href="https://en.wikipedia.org/wiki/X"> —
        // article-body wikilinks). Both must match; chrome filtering then
        // removes the relative-form namespace links.
        const linkRe = /<a\s[^>]*?href="(?:https:\/\/en\.wikipedia\.org)?\/wiki\/([^"#?][^"]*)"[^>]*?>([\s\S]*?)<\/a>/g;
        let m: RegExpExecArray | null;
        while ((m = linkRe.exec(articleBody)) !== null) {
          const hrefTitle = decodeURIComponent(m[1].replace(/_/g, " "));
          const label = cleanText(m[2]) || hrefTitle;
          if (!label || label.length < 4 || label.length > 80) continue;
          if (hrefTitle.length < 4 || hrefTitle.length > 100) continue;
          if (WIKI_CHROME_LINK.test(hrefTitle) || hrefTitle.includes(":")) continue; // namespace chrome — blocked FIRST
          if (WIKI_LINK_BLOCK.test(hrefTitle) || WIKI_LINK_BLOCK.test(label)) continue;
          if (/^(List of|Index of|Outline of)/i.test(hrefTitle)) continue;
          const name = hrefTitle.split("(")[0].trim();
          if (!name || name.length < 4) continue;
          // LOCAL sentence: ±400 chars around the anchor inside the article
          // body, cleaned and sentence-split (no global whole-page collapse —
          // that is what let chrome links pass in the first run).
          const from = Math.max(0, (m.index ?? 0) - 400);
          const win = cleanText(articleBody.slice(from, (m.index ?? 0) + m[0].length + 400));
          const esc = (v: string) => v.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
          const sent =
            win.split(SENTENCE_SPLIT).find((s) => new RegExp(`\\b${esc(label)}\\b`, "i").test(s))
            ?? win.split(SENTENCE_SPLIT).find((s) => new RegExp(`\\b${esc(name)}\\b`, "i").test(s))
            ?? null;
          if (!sent) continue;
          if (!PLACEISH.test(label) && !PLACEISH.test(name) && !PLACEISH.test(sent)) continue;
          // locality gate, with the evidence tier recorded per entry:
          //   sentence-locality — the sentence itself names the area;
          //   paragraph-locality — the ±1200 paragraph names the area (the
          //     article's locality narrative; the sentence alone often omits
          //     the area word — e.g. teertham descriptions inside the Tirumala
          //     article body);
          //   name-locality — the link name itself carries the area token.
          const wide = cleanText(articleBody.slice(Math.max(0, (m.index ?? 0) - 1200), (m.index ?? 0) + m[0].length + 1200));
          let areaEvidence: WikiEntry["areaEvidence"] | null = null;
          if (p.areaTokens.test(sent)) areaEvidence = "sentence-locality";
          else if (p.areaTokens.test(label) || p.areaTokens.test(name)) areaEvidence = "name-locality";
          else if (p.areaTokens.test(wide)) areaEvidence = "paragraph-locality";
          if (!areaEvidence) continue;
          if (seen.has(name)) continue;
          const quote = sent.slice(0, 300);
          seen.set(name, { name, area: p.area, sourceUrl: url, pageTitle: p.title, verbatimQuote: quote, areaEvidence, pageCoord: (rec.pageCoord as { lat: number; lng: number } | null) ?? null });
        }
        // The article SUBJECT itself is independent-source evidence for its own
        // name+area: the page documents the place (infobox location, body lede,
        // published coordinate). Wikipedia never self-links the subject, so the
        // link loop above cannot capture it — add it explicitly, quoted from
        // the first body sentence that names it.
        const subjName = p.title.split("(")[0].trim();
        if (subjName.length >= 4 && !seen.has(subjName)) {
          const subjRe = new RegExp(`\\b${subjName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
          const subjSent = cleanText(articleBody).split(SENTENCE_SPLIT).find((s) => subjRe.test(s)) ?? null;
          if (subjSent) {
            seen.set(subjName, { name: subjName, area: p.area, sourceUrl: url, pageTitle: p.title, verbatimQuote: subjSent.slice(0, 300), areaEvidence: "sentence-locality", pageCoord: (rec.pageCoord as { lat: number; lng: number } | null) ?? null });
          }
        }
        const entriesFinal = Array.from(seen.values());
        rec.entries = entriesFinal;
        rec.entryCount = entriesFinal.length;
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
/* Phase B2: extract-official2 — venue names from the 4 REAL official   */
/* ------------------------------------------------------------------ */

/** The 4 REAL official2 pages (the other 3 URLs served the homepage shell —
 *  see official2-fetch-log.json). Subjects are derived from each page's own
 *  heading, never from the filename; a page with no guest-house heading gets
 *  subject:null and only its rate-table venue rows are mined. */
const O2_REAL_PAGES: Array<{ file: string; url: string }> = [
  { file: "ttd-marriagehallcotteges.html", url: "https://www.tirumala.org/marriagehallcotteges.aspx" },
  { file: "ttd-sripadmavathiguesthouse.html", url: "https://www.tirumala.org/sripadmavathiguesthouse.aspx" },
  { file: "ttd-srivenkateswaraguesthouse.html", url: "https://www.tirumala.org/srivenkateswaraguesthouse.aspx" },
  { file: "ttd-varahaswamiguesthouse.html", url: "https://www.tirumala.org/varahaswamiguesthouse.aspx" },
];

function cellText(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&#160;|&nbsp;/g, " ")
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

/** rate-table header cells — never venue names */
const O2_HEADER_CELL = /^(sl\s*no\.?|s\.?no\.?|name|rate per unit.*|per day.*|cost|cottage|no\.?|number|description)$/i;
/** unit sub-descriptions inside a venue row — "2 suites", "- Single rooms",
 *  "Corner Suite", "Deluxe Cottages", "3 master suites" — never venue names */
const O2_UNIT_DESC = /^(\d+\s+)?(-\s*)?(single|double|corner|deluxe|big|small|other|master|ordinary|\d+)?\s*(suites?|suits?|rooms?|cottages?)(\s+no\.?\s*[\d,]+)?$/i;

/** display-name trimmer: strips unit sub-descriptions / rate numbers that the
 *  page glues into a venue name cell ("Gayathri Sadan 2500.00 1500.00" →
 *  "Gayathri Sadan"; "Alwar Tank Cottages - Single rooms" → "Alwar Tank
 *  Cottages"; "Mangala Bavi Cottages 2 suites 4 cottages" → "Mangala Bavi
 *  Cottages"). The verbatim quote keeps the full raw cell; only the display
 *  name is normalized. Safe-by-construction: a bare trailing unit word is
 *  NEVER stripped ("Mangala Bavi Cottages" stays whole) — stripping requires
 *  a leading digit or a dash separator. */
function trimNameTail(v: string): string {
  let s = v;
  for (;;) {
    const next = s
      .replace(/\s+\d+(?:\.\d{1,2})?\s*(?:[a-z]+\s+)?(?:suites?|suits?|rooms?|cottages?)\s*$/i, "")
      .replace(/\s*[-–]\s*(?:single|double|corner|deluxe|big|small|other|master|ordinary)?\s*(?:suites?|suits?|rooms?|cottages?)(?:\s+no\.?\s*[\d,]+)?\s*$/i, "")
      .replace(/(?:\s+\d+(?:\.\d{1,2})?)+\s*$/, "")
      .replace(/\s*[-–]\s*$/, "");
    if (next === s) return s.trim();
    s = next;
  }
}

async function runExtractOfficial2(): Promise<void> {
  const out = {
    retrievedOn: RETRIEVED,
    sourceHost: "www.tirumala.org (official TTD website)",
    areaBasis: "area assigned 'tirumala' — these are tirumala.org TIRUMALA-side accommodation rate tables; venue locality names (Alwar Tank, Narayanagiri, Hill View, Sanku Mitta) are Tirumala localities",
    provenance: "documentary corroboration for the batch-013 queued TTD accommodation rows (cross-checked in the prior session). These named venues are NOT new raw-worksheet candidates — no new place claims are created from these pages; unit-level rate rows are recorded with verbatim quotes for human review.",
    shellExclusions: ["ttd-garden.html", "ttd-theerthams.html", "ttd-varahaswamytirumala.html"].map((f) => `${f} (served homepage shell — no content)`),
    pages: [] as Array<Record<string, unknown>>,
  };
  for (const p of O2_REAL_PAGES) {
    const raw = readFileSync(join(OFFICIAL_DIR, p.file), "utf8");
    // page subject from the page's own heading (never the filename) — the TTD
    // site titles guest-house pages with a styled <div>, not <h1>/<h2>
    const heading = /<h[12][^>]*>([\s\S]*?)<\/h[12]>/i.exec(raw)?.[1]
      ?? /<(?:div|span|p)[^>]*class="[^"]*(?:title|heading|header)[^"]*"[^>]*>([\s\S]{0,300}?)<\/(?:div|span|p)>/i.exec(raw)?.[1]
      ?? "";
    const subjectRaw = cellText(heading);
    const subject = /guest\s*house/i.test(subjectRaw) ? subjectRaw : null;
    // rate-table rows → venue-name cells
    const extracted = new Map<string, { name: string; verbatimQuote: string | null }>();
    const rows = raw.match(/<tr[^>]*>[\s\S]*?<\/tr>/gi) ?? [];
    for (const tr of rows) {
      if (!/rate\s*per\s*unit/i.test(tr) && !/\d{2,4}\.\d{2}/.test(tr)) continue; // rate rows only
      const cells = (tr.match(/<t[dh][^>]*>[\s\S]*?<\/t[dh]>/gi) ?? []).map((c) => cellText(c.replace(/^<t[dh][^>]*>|<\/t[dh]>$/gi, "")));
      const quote = cells.filter(Boolean).join(" | ").slice(0, 300);
      for (const c of cells) {
        if (!c || !/[A-Za-z]{4}/.test(c)) continue; // needs ≥4 letters
        if (/^[\d.,\s&()/-]+$/.test(c)) continue; // pure numbers/rates
        if (O2_HEADER_CELL.test(c)) continue;
        if (O2_UNIT_DESC.test(c)) continue;
        const key0 = c.replace(/^\s+/, "");
        const key = trimNameTail(key0) || key0;
        if (!extracted.has(key)) extracted.set(key, { name: key, verbatimQuote: quote });
      }
    }
    const entries = Array.from(extracted.values());
    if (subject && !entries.some((e) => e.name === subject)) entries.unshift({ name: subject, verbatimQuote: `page heading on ${p.url}` });
    out.pages.push({ page: p.file, sourceUrl: p.url, subject, area: "tirumala", extracted: entries, entryCount: entries.length });
    console.log(`[extract-official2] ${p.file}: subject="${subject ?? "—"}" venues=${entries.length}`);
  }
  writeFileSync(join(OFFICIAL_DIR, "official2-extractions.json"), JSON.stringify(out, null, 2));
  const total = out.pages.reduce((a, pg) => a + ((pg.entryCount as number) ?? 0), 0);
  console.log(`[extract-official2] DONE — ${out.pages.length} pages, ${total} venue names → official/official2-extractions.json`);
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

interface SourceName { name: string; norm: string; area: string; kind: string; url: string; quote: string | null; pageTitle?: string | null; areaEvidence?: string | null }

/** independent-source name corpus — shared by crossmatch (pending-row
 *  confirmation) and new-names (review queue) */
async function buildCorpus(): Promise<SourceName[]> {
  const corpus: SourceName[] = [];
  // wikipedia entries
  const wikiPath = join(WIKI_DIR, "wikipedia-evidence.json");
  if (existsSync(wikiPath)) {
    const wiki = JSON.parse(readFileSync(wikiPath, "utf8")) as { pages: Array<{ area: string; url: string; pageTitle: string; entries?: Array<{ name: string; verbatimQuote: string | null; areaEvidence?: string | null }> }> };
    for (const page of wiki.pages) {
      for (const e of page.entries ?? []) {
        corpus.push({ name: e.name, norm: norm(e.name), area: page.area, kind: "wikipedia", url: page.url, quote: e.verbatimQuote, pageTitle: page.pageTitle, areaEvidence: e.areaEvidence ?? null });
      }
    }
  }
  // NEW official page extractions (official2 pages only — their per-page
  // area is known; the legacy 18 pages' places already flow via OFFICIAL_NAME_MAP)
  const o2Path = join(OFFICIAL_DIR, "official2-extractions.json");
  if (existsSync(o2Path)) {
    const o2 = JSON.parse(readFileSync(o2Path, "utf8")) as { pages: Array<{ area: string; sourceUrl: string; page: string; extracted: Array<{ name: string; verbatimQuote: string | null }> }> };
    for (const page of o2.pages) {
      for (const e of page.extracted ?? []) {
        corpus.push({ name: e.name, norm: norm(e.name), area: page.area, kind: "official-ttd", url: page.sourceUrl, quote: e.verbatimQuote, pageTitle: page.page });
      }
    }
  }
  return corpus;
}

async function runCrossmatch(): Promise<void> {
  // 1. load the raw worksheet (evidence-derived candidates)
  const ws = JSON.parse(readFileSync(join(HERE, "worksheets", "tirupati-master.json"), "utf8")) as {
    rows: Array<{ area: string; name: string; verification: { queried: boolean; areaConfirmed: boolean }; verificationThrottled?: boolean; sourceUrl: string; group: string }>;
  };
  // 2. build the independent-source name corpus (per area) from NEW sources
  const corpus = await buildCorpus();
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

/* ------------------------------------------------------------------ */
/* Phase D: new-names — genuinely NEW names → REVIEW QUEUE (never       */
/* counted as candidates; each needs human research before any batch)  */
/* ------------------------------------------------------------------ */

/** obvious non-place concepts that slip past PLACEISH via their context —
 *  excluded from the review queue (they are never place claims) */
const GENERIC_NAME = /^(vishnu|lakshmi|krishna|shiva|venkateswara|venkateshwara|andhra pradesh|tirupati district|tirupati \(dist.*\)|india|indian state|postal code|time zone|vehicle registration.*|dam|gravity dam|drainage basin|village|middle ages|britannica|encyclop|krishnadevaraya|vijayanagara empire|east india company|eastern ghats|divya desam|alvars?|vaishnavism|deciduous|laddu|tirupati laddu|matsya|garuda|ramanuja|bhoga srinivasa|eparchaean unconformity|swarnamukhi|venkata|sapthagiri|gopuram|vimana|mandal|ib-settlement.*|mw-.*)$/i;
/** place vocabulary that must appear in the NAME itself (not just context)
 *  for a queue entry */
const PLACE_TOKEN_IN_NAME = /\b(temple|swamy|swami|theertham|teertham|kshetram|shrine|mutt|matha|ashram|church|dargah|masjid|mosque|fort|mahal|palace|museum|zoo|park|garden|dam|lake|falls|waterfall|hill|hills|peak|cave|reservoir|pushkarini|kone|guest house|cottages?|kuteer|sadan|nivas|bhavan|arch|beach|valley|bungalow|ghat)\b/i;

async function runNewNames(): Promise<void> {
  // 1. inventory universe: raw + curated worksheet names (batches 011-014 are
  //    generated FROM this same universe; no separate name set exists)
  const ws = JSON.parse(readFileSync(join(HERE, "worksheets", "tirupati-master.json"), "utf8")) as { rows: Array<{ area: string; name: string }> };
  const cur = JSON.parse(readFileSync(join(HERE, "worksheets", "tirupati-master-curated.json"), "utf8")) as { rows: Array<{ area: string; name: string; rawNames?: string[] }> };
  const invNames = new Set<string>();
  for (const r of ws.rows) invNames.add(norm(r.name));
  for (const r of cur.rows) {
    invNames.add(norm(r.name));
    for (const rn of r.rawNames ?? []) invNames.add(norm(rn));
  }
  // 2. corpus
  const corpus = await buildCorpus();
  const seenName = new Set<string>();
  const genuinelyNew: Array<Record<string, unknown>> = [];
  const weakMatches: Array<Record<string, unknown>> = [];
  let exactExisting = 0;
  for (const c of corpus) {
    if (seenName.has(c.norm)) continue;
    seenName.add(c.norm);
    if (GENERIC_NAME.test(c.norm)) continue;
    if (invNames.has(c.norm)) { exactExisting++; continue; } // corroboration of a known name — not new
    // weak overlap: one name contains the other (shorter side ≥6 chars)
    let weak: string | null = null;
    for (const inv of invNames) {
      if (inv.length < 6) continue;
      if (c.norm.includes(inv) || inv.includes(c.norm)) { weak = inv; break; }
    }
    const rec = { name: c.name, area: c.area, kind: c.kind, url: c.url, pageTitle: c.pageTitle ?? null, verbatimQuote: c.quote };
    if (weak) { weakMatches.push({ ...rec, overlapsKnownName: weak }); continue; }
    // queue bar: a place token IN the name, or sentence-locality evidence
    const placeToken = PLACE_TOKEN_IN_NAME.test(c.name);
    const strongSentence = c.areaEvidence === "sentence-locality";
    if (!placeToken && !strongSentence) continue; // noise — not queued
    // review priority: proximity language in the quote ("in/at/near Tirupati",
    // possessives) is the strongest human signal; corpus entries can also be
    // UNRELATED places that merely share article context (e.g. Khajuraho/
    // Bhubaneswar temples cited in architecture comparisons) — the quote is
    // the arbiter, and LOW priority flags exactly those for fast triage.
    const proximity = /\b(?:in|at|near|around|of|from)\s+(?:Tirupati|Tirumala|Tiruchanoor|Tiruchanur|Chandragiri|Renigunta|Srinivasa\s+Mangapuram|Nagalapuram|Srikalahasti|Narayanavanam|Chittoor)|\bTirupati's\b|\bTirumala's\b/i.test(c.quote ?? "");
    const reviewPriority = placeToken && proximity ? "HIGH" : (placeToken || (strongSentence && proximity)) ? "MEDIUM" : "LOW";
    genuinelyNew.push({ ...rec, areaEvidence: c.areaEvidence ?? null, placeTokenInName: placeToken, proximityInQuote: proximity, reviewPriority });
  }
  const out = {
    retrievedOn: RETRIEVED,
    statusDefinition: "REVIEW QUEUE ONLY — these names are NOT counted as candidates anywhere in the pipeline; they carry no verification beyond the quoted source text; each requires human research (address, operation status, category) before any batch could ever be generated. NOTE: entries include UNRELATED places that share article context (architecture comparisons, history mentions) — the verbatimQuote is the arbiter; reviewPriority HIGH means the quote itself ties the name to the locality with proximity language.",
    whyNotCandidates: "web_search is quota-exhausted (recorded limitation); identity verification therefore cannot run for new names this session — they enter the queue as leads with provenance, never as verified or even partially-verified records",
    universe: { rawWorksheetRows: ws.rows.length, curatedWorksheetRows: cur.rows.length, inventoryNameNorms: invNames.size },
    tallies: { corpusUniqueNames: seenName.size + exactExisting, corroboratedExistingNames: exactExisting, weakMatches: weakMatches.length, genuinelyNewQueued: genuinelyNew.length },
    genuinelyNew,
    weakMatches,
  };
  writeFileSync(join(EV, "review-queue-new-names.json"), JSON.stringify(out, null, 2));
  console.log(`[new-names] corpus unique: ${seenName.size + exactExisting}, corroborated existing: ${exactExisting}, weak: ${weakMatches.length}, genuinely new queued: ${genuinelyNew.length} → review-queue-new-names.json`);
}

switch (phase) {
  case "official2":
    runOfficial2().catch((e) => { console.error("FATAL:", e); process.exit(1); });
    break;
  case "wikipedia":
    runWikipedia().catch((e) => { console.error("FATAL:", e); process.exit(1); });
    break;
  case "extract-official2":
    runExtractOfficial2().catch((e) => { console.error("FATAL:", e); process.exit(1); });
    break;
  case "crossmatch":
    runCrossmatch().catch((e) => { console.error("FATAL:", e); process.exit(1); });
    break;
  case "new-names":
    runNewNames().catch((e) => { console.error("FATAL:", e); process.exit(1); });
    break;
}
