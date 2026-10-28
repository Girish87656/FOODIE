/**
 * Foodie — TIRUPATI BATCH-6 network research (owner-directed 2026-10-28).
 *
 * Phases (each bounded, logged, politely spaced; identical honesty contract
 * to the batch-4/batch-5 harnesses):
 *
 *   evidence    — OBJECTIVE 2: for each RETAINED batch-015 food venue (40
 *                 after the batch-6 audit moved 2), ONE bounded web_search
 *                 query looking for a SECOND INDEPENDENT source (an official
 *                 business page, a different directory/map platform, or a
 *                 recent public listing). Corroboration ≠ verification: a
 *                 second source never flips a row to verified; it is recorded
 *                 for the owner's review alongside the batch-015 candidate.
 *   coverage    — OBJECTIVE 4: locality-by-locality queries for the WEAKEST
 *                 coverage-matrix cells (Srinivasa Mangapuram, Chandragiri,
 *                 Renigunta, Tiruchanur, surrounding destinations' food/stays,
 *                 and specific uncovered Tirupati neighbourhoods). Names are
 *                 recorded as LEADS with verbatim quotes — assessed by hand,
 *                 never auto-accepted.
 *   nominatim2  — bounded Nominatim POI queries for the towns the batch-5
 *                 pass did not cover (Srinivasa Mangapuram, Chandragiri,
 *                 Renigunta, Tiruchanur, Srikalahasti); published coordinates
 *                 stay evidence-only.
 *
 * Rate-limit protocol: 8 s pacing between web_search calls, 3 consecutive
 * errors = bounded pause for this run (completed queries preserved); 2 s
 * pacing for Nominatim; HTTP 200 alone is never usefulness (content checks).
 * Resume semantics: completed per-item records are never re-fetched.
 *
 * Usage: bun scripts/foodie-enrichment/research-tirupati-batch6.ts <probe|evidence|coverage|nominatim2>
 */

import { mkdirSync, writeFileSync, existsSync, readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { politeFetch, RESEARCH_UA } from "./lib/live";

const HERE = dirname(fileURLToPath(import.meta.url));
const EV = join(HERE, "evidence", "tirupati-master");
const B6 = join(EV, "batch6");
mkdirSync(B6, { recursive: true });
const RETRIEVED = new Date().toISOString().slice(0, 10);

const phase = (process.argv[2] ?? "").toLowerCase();
if (!["probe", "evidence", "coverage", "nominatim2"].includes(phase)) {
  console.error("usage: research-tirupati-batch6.ts <probe|evidence|coverage|nominatim2>");
  process.exit(2);
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

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
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

/* ------------------------------------------------------------------ */
/* Phase: probe — ONE web_search availability check for this session    */
/* ------------------------------------------------------------------ */

async function probe() {
  const out = join(B6, "websearch-probe.json");
  if (existsSync(out)) {
    console.log("[probe] batch-6 probe evidence already exists — resume semantics: kept");
    return;
  }
  const rec: Record<string, unknown> = { task: "batch-6 single web_search availability probe", retrievedOn: RETRIEVED, userAgent: RESEARCH_UA };
  try {
    const results = await webSearch("Tirupati restaurant", 3);
    rec.resultCount = results.length;
    rec.decision = "provider AVAILABLE — bounded batch-6 verification/discovery may proceed this session";
  } catch (e) {
    const msg = String((e as Error).message ?? e);
    rec.error = msg.slice(0, 400);
    rec.decision = /429/.test(msg)
      ? "provider quota-exhausted (429) — paused for this session per protocol; single probe only, no retries"
      : "provider failed — paused for this session; single probe only, no retries";
  }
  writeFileSync(out, JSON.stringify(rec, null, 2) + "\n");
  console.log(`[probe] ${rec.decision}`);
}

/* ------------------------------------------------------------------ */
/* Shared venue universe: the 40 RETAINED batch-015 food venues        */
/* ------------------------------------------------------------------ */

const FOOD_CATEGORIES = new Set(["tiffin", "restaurant", "street_food", "bakery_sweets", "cafe"]);

function retainedFoodVenues(): Array<{ name: string; area: string; category: string; originalHost: string | null; sourceKind: string; sourceUrl: string }> {
  const ledger = JSON.parse(readFileSync(join(EV, "batch5", "discovery-candidates.json"), "utf8")) as {
    acceptedCandidates: Array<{ name: string; area: string; category: string; evidence: { url: string; sourceKind: string } }>;
  };
  const audit = JSON.parse(readFileSync(join(B6, "b015-audit.json"), "utf8")) as {
    movedToReviewQueue: Array<{ name: string }>;
  };
  const moved = new Set(audit.movedToReviewQueue.map((m) => m.name));
  return ledger.acceptedCandidates
    .filter((c) => FOOD_CATEGORIES.has(c.category) && !moved.has(c.name))
    .map((c) => ({ name: c.name, area: c.area, category: c.category, originalHost: hostOf(c.evidence.url), sourceKind: c.evidence.sourceKind, sourceUrl: c.evidence.url }));
}

const AREA_QUERY_LABEL: Record<string, string> = {
  "tpt-central": "Tirupati",
  "tpt-neighbourhoods": "Tirupati",
  "tirumala": "Tirumala",
  "tiruchanur": "Tiruchanoor Tirupati",
  "chandragiri": "Chandragiri",
  "renigunta": "Renigunta",
  "surrounding": "Tirupati",
};

const SEARCH_PACING_MS = 8_000;
const BREAKER_MAX = 3;

/* ------------------------------------------------------------------ */
/* Phase: evidence — second independent source per food venue          */
/* ------------------------------------------------------------------ */

async function evidence() {
  const out = join(B6, "food-second-sources.json");
  const venues = retainedFoodVenues();
  const recs: Array<Record<string, unknown>> = [];
  let consecutiveErrors = 0;
  let paused = false;

  // resume semantics: keep completed venue records
  if (existsSync(out)) {
    try {
      const prev = JSON.parse(readFileSync(out, "utf8")) as { venues: Array<Record<string, unknown>> };
      for (const v of prev.venues ?? []) {
        if (v && typeof v.query === "string" && !v.error) recs.push(v);
      }
      console.log(`[evidence] resume: ${recs.length} completed venue records kept`);
    } catch {
      console.log("[evidence] previous evidence unreadable — starting fresh (previous file will be replaced)");
    }
  }
  const done = new Set(recs.map((r) => r.venue as string));

  for (const v of venues) {
    if (done.has(v.name)) continue;
    const suffix = v.name.includes(", ") ? v.name.slice(v.name.lastIndexOf(", ") + 2) : null;
    const base = suffix ? v.name.slice(0, v.name.length - suffix.length - 2) : v.name;
    const label = suffix ?? AREA_QUERY_LABEL[v.area] ?? "Tirupati";
    // quote only the venue BASE name; the locality goes in unquoted (quoting
    // name+suffix together yielded HTTP 422 'no results' on the two venues
    // that were retried — search providers treat the doubled locality badly)
    const query = suffix ? `"${base}" ${suffix}` : `"${v.name}" ${label}`;
    const rec: Record<string, unknown> = { venue: v.name, area: v.area, category: v.category, query, originalHost: v.originalHost, originalSourceKind: v.sourceKind, retrievedOn: RETRIEVED };

    try {
      const hits = await webSearch(query, 6);
      const mapped = hits.map((h) => ({ ...h, host: hostOf(h.url) }));
      rec.hits = mapped;
      rec.hitCount = mapped.length;
      // deterministic pre-classification — FINAL classification is recorded by
      // the assessor (batch6-assess.ts); corroboration never equals verification
      const otherHost = mapped.filter((h) => h.host && h.host !== v.originalHost);
      rec.hitsOnOtherHosts = otherHost.length;
      consecutiveErrors = 0;
      console.log(`[evidence] ${v.name} → ${mapped.length} hits (${otherHost.length} on other hosts)`);
    } catch (e) {
      const msg = String((e as Error).message ?? e);
      rec.error = msg.slice(0, 300);
      rec.hits = [];
      consecutiveErrors++;
      console.log(`[evidence] ${v.name} → ERROR ${msg.slice(0, 120)}`);
      if (consecutiveErrors >= BREAKER_MAX) {
        recs.push(rec);
        console.log(`[evidence] ${BREAKER_MAX} consecutive errors — pausing the web_search source for this run (bounded); completed records preserved.`);
        paused = true;
        break;
      }
    }
    recs.push(rec);
    await sleep(SEARCH_PACING_MS);
  }

  writeFileSync(out, JSON.stringify({
    task: "batch-6 second-source evidence search for the retained batch-015 food venues",
    retrievedOn: RETRIEVED,
    pacingMs: SEARCH_PACING_MS,
    breaker: `pause after ${BREAKER_MAX} consecutive errors`,
    pausedThisRun: paused,
    honesty: "a second source is CORROBORATION for owner review — it NEVER flips verification_status (an import never self-verifies)",
    venues: recs,
  }, null, 2) + "\n");
  console.log(`[evidence] written ${recs.length}/${venues.length} venue records → ${out}`);
}

/* ------------------------------------------------------------------ */
/* Phase: coverage — weakest locality/category cells                   */
/* ------------------------------------------------------------------ */

/** Objective 4: bounded query set for the weakest coverage-matrix cells.
 *  18 queries; leads only — hand-assessed afterwards. */
const COVERAGE_QUERIES: Array<{ area: string; query: string; category: string; gap: string }> = [
  { area: "tpt-neighbourhoods", query: "restaurant OR mess Akkayyapalem Tirupati", category: "food-restaurants", gap: "neighbourhoods: Akkayyapalem not yet searched" },
  { area: "tpt-neighbourhoods", query: "bakery OR \"sweet shop\" Bhavani Nagar Tirupati", category: "food-bakery", gap: "neighbourhoods: Bhavani Nagar not yet searched" },
  { area: "tpt-neighbourhoods", query: "\"tiffin centre\" Cherlopalli OR Satyanarayanapuram Tirupati", category: "food-tiffin", gap: "neighbourhoods: Cherlopalli/Satyanarayanapuram not yet searched" },
  { area: "tpt-neighbourhoods", query: "\"juice shop\" OR \"tea stall\" \"MR Pally\" OR M.R. Palle Tirupati", category: "food-street", gap: "neighbourhoods: MR Pally not yet searched" },
  { area: "tpt-neighbourhoods", query: "restaurant near \"Kapila Theertham\" Tirupati", category: "food-restaurants", gap: "neighbourhoods: Kapila Theertham road corridor not yet searched" },
  { area: "tpt-neighbourhoods", query: "lodge OR hotel Avilala OR Mangalam Tirupati", category: "stays", gap: "neighbourhoods: stays cell 0 candidates" },
  { area: "srinivasa-mangapuram", query: "restaurant OR mess \"Srinivasa Mangapuram\"", category: "food-restaurants", gap: "Srinivasa Mangapuram: restaurants cell 0 candidates" },
  { area: "srinivasa-mangapuram", query: "\"Srinivasa Mangapuram\" bakery OR \"tea stall\" OR hotel", category: "food-bakery", gap: "Srinivasa Mangapuram: bakery/street/stays cells 0 candidates" },
  { area: "srinivasa-mangapuram", query: "places to visit \"Srinivasa Mangapuram\" temple", category: "attractions", gap: "Srinivasa Mangapuram: attractions cell 0 candidates" },
  { area: "chandragiri", query: "cafe OR restaurant near Chandragiri Fort", category: "food-restaurants", gap: "Chandragiri: cafés cell 0 raw hits" },
  { area: "chandragiri", query: "places to visit Chandragiri beyond the fort Tirupati", category: "attractions", gap: "Chandragiri: attractions cell 0 candidates" },
  { area: "chandragiri", query: "hotel OR lodge Chandragiri Tirupati", category: "stays", gap: "Chandragiri: stays cell 0 candidates" },
  { area: "renigunta", query: "\"street food\" OR dhaba Renigunta Tirupati", category: "food-street", gap: "Renigunta: street-food cell 0 candidates" },
  { area: "renigunta", query: "hotel OR lodge Renigunta airport Tirupati", category: "stays", gap: "Renigunta: stays cell 0 candidates" },
  { area: "tiruchanur", query: "restaurant OR meals Tiruchanur Alamelu Mangapuram", category: "food-restaurants", gap: "Tiruchanur: restaurants cell 0 candidates" },
  { area: "tiruchanur", query: "places to visit near Padmavathi Ammavari Temple Tiruchanoor", category: "attractions", gap: "Tiruchanur: attractions cell 0 candidates" },
  { area: "surrounding", query: "restaurant OR tiffin centre Srikalahasti", category: "food-restaurants", gap: "surrounding: tiffin/restaurants cells 0 candidates" },
  { area: "surrounding", query: "hotel OR lodge near Srikalahasti temple", category: "stays", gap: "surrounding: stays cell 0 candidates" },
];

async function coverage() {
  const out = join(B6, "search-coverage-gaps.json");
  const recs: Array<Record<string, unknown>> = [];
  let consecutiveErrors = 0;
  let paused = false;
  for (const q of COVERAGE_QUERIES) {
    const rec: Record<string, unknown> = { area: q.area, category: q.category, gap: q.gap, query: q.query, retrievedOn: RETRIEVED };
    try {
      const hits = await webSearch(q.query, 8);
      rec.hits = hits.map((h) => ({ ...h, host: hostOf(h.url) }));
      rec.hitCount = hits.length;
      consecutiveErrors = 0;
      console.log(`[coverage] ${q.query} → ${hits.length} hits`);
    } catch (e) {
      const msg = String((e as Error).message ?? e);
      rec.error = msg.slice(0, 300);
      rec.hits = [];
      consecutiveErrors++;
      console.log(`[coverage] ${q.query} → ERROR ${msg.slice(0, 120)}`);
      if (consecutiveErrors >= BREAKER_MAX) {
        recs.push(rec);
        console.log(`[coverage] ${BREAKER_MAX} consecutive errors — pausing this run (bounded); completed queries preserved.`);
        paused = true;
        break;
      }
    }
    recs.push(rec);
    await sleep(SEARCH_PACING_MS);
  }
  writeFileSync(out, JSON.stringify({
    task: "batch-6 coverage-gap discovery (weakest locality×category cells)",
    retrievedOn: RETRIEVED,
    pacingMs: SEARCH_PACING_MS,
    pausedThisRun: paused,
    honesty: "hits are LEADS with verbatim titles/snippets — hand-assessed next; never auto-accepted as candidates",
    queries: recs,
  }, null, 2) + "\n");
  console.log(`[coverage] written → ${out}`);
}

/* ------------------------------------------------------------------ */
/* Phase: nominatim2 — bounded POI queries for uncovered towns         */
/* ------------------------------------------------------------------ */

/** Nominatim queries for towns batch-5's viewbox pass did not cover. Each
 *  query is area-gated by the RESULT's own address components (the town name
 *  must appear in the result's display_name/address) — hits outside the named
 *  town are recorded but marked out-of-area. Published coordinates stay
 *  evidence-only (batch rows import coordinates-NULL). */
const NOMINATIM2_QUERIES: Array<{ town: string; kw: string }> = [
  { town: "Srinivasa Mangapuram", kw: "restaurant Srinivasa Mangapuram" },
  { town: "Srinivasa Mangapuram", kw: "hotel Srinivasa Mangapuram" },
  { town: "Chandragiri", kw: "cafe Chandragiri" },
  { town: "Chandragiri", kw: "hotel Chandragiri" },
  { town: "Renigunta", kw: "restaurant Renigunta" },
  { town: "Renigunta", kw: "hotel Renigunta" },
  { town: "Tiruchanur", kw: "restaurant Tiruchanur" },
  { town: "Srikalahasti", kw: "restaurant Srikalahasti" },
  { town: "Srikalahasti", kw: "hotel Srikalahasti" },
];

async function nominatim2() {
  const out = join(B6, "nominatim2-town-pois.json");
  const recs: Array<Record<string, unknown>> = [];
  for (const q of NOMINATIM2_QUERIES) {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q.kw)}&format=jsonv2&limit=15&addressdetails=1&accept-language=en`;
    const rec: Record<string, unknown> = { town: q.town, keyword: q.kw, url, retrievedOn: RETRIEVED, userAgent: RESEARCH_UA };
    try {
      const res = await politeFetch(url, { "User-Agent": RESEARCH_UA, Accept: "application/json" });
      rec.httpStatus = res.status;
      if (res.ok) {
        const rows = (await res.json()) as Array<Record<string, unknown>>;
        const inArea: Array<Record<string, unknown>> = [];
        const outArea: Array<Record<string, unknown>> = [];
        for (const r of rows) {
          const dn = String(r.display_name ?? "");
          const hit = { name: r.name ?? dn, displayName: dn, osmType: r.osm_type, osmId: r.osm_id, category: r.category, type: r.type, lat: r.lat, lon: r.lon, importance: r.importance };
          if (dn.toLowerCase().includes(q.town.toLowerCase())) inArea.push(hit);
          else outArea.push(hit);
        }
        rec.inAreaHits = inArea;
        rec.outOfAreaHits = outArea;
        rec.inAreaCount = inArea.length;
        rec.usefulness = inArea.length > 0
          ? `${inArea.length} area-gated hits (published coordinates evidence-only)`
          : rows.length > 0
            ? `served ${rows.length} rows, NONE inside ${q.town} — honest zero for this town`
            : "no rows";
      } else {
        rec.error = `HTTP ${res.status}`;
        rec.usefulness = "failed — recorded as limitation";
      }
    } catch (e) {
      rec.error = String((e as Error).message ?? e).slice(0, 300);
      rec.usefulness = "failed — recorded as limitation";
    }
    recs.push(rec);
    console.log(`[nominatim2] ${q.kw}: status=${rec.httpStatus ?? "?"} inArea=${rec.inAreaCount ?? 0}`);
    await sleep(2000);
  }
  writeFileSync(out, JSON.stringify({ task: "batch-6 nominatim town POI queries (uncovered towns)", retrievedOn: RETRIEVED, queries: recs }, null, 2) + "\n");
  console.log(`[nominatim2] written → ${out}`);
}

if (phase === "probe") probe();
else if (phase === "evidence") evidence();
else if (phase === "coverage") coverage();
else if (phase === "nominatim2") nominatim2();
