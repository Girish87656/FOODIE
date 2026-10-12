/**
 * Foodie — Prototype 2 enrichment: MENU research (READ-ONLY).
 *
 * Two evidence tiers, both strictly "as published":
 *   1. WORKSHEET — the already-human-reviewed menu_notes + menu_source_url
 *      columns of scripts/foodie-import-validator/input/research-worksheet-round3.csv.
 *      Fragments that literally contain "Item ... Rs N" become priced
 *      candidates; the verbatim fragment is kept as the evidence quote.
 *   2. LIVE LISTING PAGES — the place's own recorded source_url (district.in /
 *      magicpin / restaurant-guru / justdial) read through the z-ai page_reader
 *      skill, plus a bounded web_search fallback for places whose page yields
 *      nothing. Snippet/page text is parsed with the same mechanical extractor;
 *      the source URL travels with every item.
 *
 * Nothing is invented: no price is ever derived, interpolated or guessed; an
 * item without a published price is stored with price NULL; pages that fail to
 * read are recorded as errors, never as "no menu".
 *
 * Output: evidence/menus/<slug>.json (one per place).
 */

import { mkdirSync, writeFileSync, existsSync, readFileSync } from "fs";
import { join } from "path";
import ZAI from "z-ai-web-dev-sdk";
import { fetchLivePlaces, slugify, snippetMatchesPlace } from "./lib/live";
import { parseMenuBlob } from "./lib/menuParse";
import type { DishCandidate, PlaceEvidence } from "./lib/types";

/** Repo root — pipeline scripts are always run from the repo root (bun scripts/foodie-enrichment/…). */
const ROOT = process.cwd();
const HERE = join(ROOT, "scripts", "foodie-enrichment");
const OUT = join(HERE, "evidence", "menus");
mkdirSync(OUT, { recursive: true });
const RETRIEVED = new Date().toISOString().slice(0, 10);

const WORKSHEET = join(HERE, "..", "foodie-import-validator", "input", "research-worksheet-round3.csv");

interface WorksheetMenuRow {
  name: string;
  menuNotes: string;
  menuSourceUrl: string;
}

function parseWorksheet(): WorksheetMenuRow[] {
  const lines = readFileSync(WORKSHEET, "utf8").split("\n").filter((l) => l.trim());
  const parse = (line: string): string[] => {
    const out: string[] = [];
    let cur = "";
    let q = false;
    for (const ch of line) {
      if (ch === '"') q = !q;
      else if (ch === "," && !q) {
        out.push(cur);
        cur = "";
      } else cur += ch;
    }
    out.push(cur);
    return out;
  };
  const header = parse(lines[0]);
  const ni = header.indexOf("name");
  const mi = header.indexOf("menu_notes");
  const msi = header.indexOf("menu_source_url");
  const rows: WorksheetMenuRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const r = parse(lines[i]);
    rows.push({ name: r[ni], menuNotes: r[mi] ?? "", menuSourceUrl: r[msi] ?? "" });
  }
  return rows;
}

async function readPage(
  zai: Awaited<ReturnType<typeof ZAI.create>>,
  url: string,
  retries = 3
): Promise<{ title?: string; text: string } | null> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = (await zai.functions.invoke("page_reader", { url })) as {
        data?: { title?: string; html?: string; text?: string; content?: string };
      };
      const html = res?.data?.html ?? res?.data?.text ?? res?.data?.content ?? "";
      if (!html) return null;
      const text = html
        .replace(/<script[\s\S]*?<\/script>/gi, " ")
        .replace(/<style[\s\S]*?<\/style>/gi, " ")
        .replace(/<[^>]*>/g, " ")
        .replace(/&nbsp;/gi, " ")
        .replace(/&amp;/gi, "&")
        .replace(/\s+/g, " ");
      return { title: res?.data?.title, text };
    } catch (err) {
      const rate = /429|Too many/i.test(String(err));
      if (attempt === retries) return null;
      // rate limits need real cooling-off, not 1.5s
      await new Promise((r) => setTimeout(r, rate ? 45_000 : 5_000 * attempt));
    }
  }
  return null;
}

async function searchSnippets(
  zai: Awaited<ReturnType<typeof ZAI.create>>,
  query: string,
  num = 6
): Promise<Array<{ name: string; url: string; snippet: string }>> {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const results = (await zai.functions.invoke("web_search", { query, num })) as Array<{
        name?: string;
        url?: string;
        snippet?: string;
      }>;
      return (results ?? [])
        .filter((r) => r.url && r.snippet)
        .map((r) => ({ name: r.name ?? "", url: String(r.url), snippet: String(r.snippet) }));
    } catch (err) {
      const rate = /429|Too many/i.test(String(err));
      if (attempt === 3) return [];
      await new Promise((r) => setTimeout(r, rate ? 45_000 : 10_000));
    }
  }
  return [];
}

const MENU_HINT = /(menu|price|rs\s?\d|₹|thali|dosa|idli|biryani|meals|plate|piece|pc)/i;

async function main() {
  const onlyArg = process.argv[2] ?? null;
  const zai = await ZAI.create();
  const places = await fetchLivePlaces();
  const targets = places.filter((p) => (onlyArg ? p.name === onlyArg : true));
  const byLowerName = new Map(places.map((p) => [p.name.toLowerCase(), p]));
  console.log(`[menus] ${places.length} live places; researching ${targets.length}`);

  // ---- tier 1: reviewed worksheet menu_notes --------------------------------
  const ws = parseWorksheet();
  let wsHits = 0;
  for (const row of ws) {
    const place = byLowerName.get(row.name.toLowerCase());
    if (!place || !row.menuNotes.trim()) continue;
    const file = join(OUT, `${slugify(place.name)}.json`);
    if (existsSync(file)) continue; // resumable
    const dishes = parseMenuBlob(row.menuNotes, 12);
    if (dishes.length === 0) continue;
    const candidates: DishCandidate[] = dishes.map((d) => ({
      restaurantId: place.id,
      restaurantName: place.name,
      name: d.name,
      price: d.price,
      sourceUrl: row.menuSourceUrl || place.sourceUrl || "",
      evidence: `[round3 worksheet menu_notes] ${d.evidence}`,
      isSignature: false,
      retrievedOn: RETRIEVED,
    }));
    const evidence: PlaceEvidence<DishCandidate> = {
      restaurantId: place.id,
      restaurantName: place.name,
      queries: ["worksheet:menu_notes"],
      candidates,
      errors: [],
      retrievedOn: RETRIEVED,
    };
    writeFileSync(file, JSON.stringify(evidence, null, 2));
    wsHits++;
    console.log(`[menus] worksheet → ${place.name}: ${candidates.length} items`);
  }
  console.log(`[menus] tier-1 worksheet parse: ${wsHits} places`);

  // ---- tier 2: live listing pages (bounded) ---------------------------------
  let done = 0;
  for (const place of targets) {
    const file = join(OUT, `${slugify(place.name)}.json`);
    if (existsSync(file)) {
      // resumable — but a file with NO candidates AND recorded errors means the
      // place was never really researched (rate limit / transient failure):
      // treat it as stale so the next run retries it.
      try {
        const prev = JSON.parse(readFileSync(file, "utf8")) as PlaceEvidence<DishCandidate>;
        const retryable = prev.candidates.length === 0 && prev.errors.length > 0;
        if (!retryable) continue;
      } catch {
        /* corrupt evidence — re-research */
      }
    }
    done++;
    if (done > 40) {
      console.log(`[menus] bounded stop at 40 live-page reads this run (repeat to continue)`);
      break;
    }
    const candidates: DishCandidate[] = [];
    const errors: string[] = [];
    const queries: string[] = [];

    if (place.sourceUrl) {
      const page = await readPage(zai, place.sourceUrl);
      if (page) {
        if (MENU_HINT.test(page.text)) {
          for (const d of parseMenuBlob(page.text, 12)) {
            candidates.push({
              restaurantId: place.id,
              restaurantName: place.name,
              name: d.name,
              price: d.price,
              sourceUrl: place.sourceUrl,
              evidence: `[listing page${page.title ? `: ${page.title.slice(0, 80)}` : ""}] ${d.evidence}`,
              isSignature: /popular|signature|special/i.test(d.evidence),
              retrievedOn: RETRIEVED,
            });
          }
        } else {
          errors.push(`page read OK but no menu-shaped text: ${place.sourceUrl}`);
        }
      } else {
        errors.push(`page unreadable: ${place.sourceUrl}`);
      }
    }

    // web_search fallback ONLY when the page path yielded nothing.
    // PROVENANCE-LOCALITY GUARD: snippets must match the place's distinctive
    // name AND name the pilot-corridor town (Doddaballapura) — search engines
    // otherwise return same-name businesses in other areas, and a wrong-place
    // menu is worse than no menu.
    if (candidates.length === 0) {
      queries.push(`websearch:"${place.name} ${place.city} menu price"`);
      const snippets = await searchSnippets(zai, `${place.name} ${place.city} menu price`);
      for (const s of snippets.slice(0, 4)) {
        const titleAndText = `${s.name} ${s.snippet}`;
        if (!MENU_HINT.test(s.snippet)) continue;
        if (!snippetMatchesPlace(titleAndText, place.name)) continue;
        for (const d of parseMenuBlob(s.snippet, 4)) {
          candidates.push({
            restaurantId: place.id,
            restaurantName: place.name,
            name: d.name,
            price: d.price,
            sourceUrl: s.url,
            evidence: `[search snippet · ${s.name.slice(0, 80)}] ${d.evidence}`,
            isSignature: /popular|signature|special/i.test(s.snippet),
            retrievedOn: RETRIEVED,
          });
        }
      }
    }

    // dedupe per place by lower(name) — keep the first (best-tier) occurrence
    const seen = new Set<string>();
    const deduped = candidates.filter((c) => {
      const k = c.name.toLowerCase();
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });

    const evidence: PlaceEvidence<DishCandidate> = {
      restaurantId: place.id,
      restaurantName: place.name,
      queries: place.sourceUrl ? [`page_reader:${place.sourceUrl}`, ...queries] : [...queries],
      candidates: deduped.slice(0, 12),
      errors,
      retrievedOn: RETRIEVED,
    };
    writeFileSync(file, JSON.stringify(evidence, null, 2));
    if (deduped.length > 0 || errors.length) {
      console.log(`[menus] ${place.name}: ${deduped.length} items${errors.length ? ` · ${errors.join("; ")}` : ""}`);
    }
  }

  const total = targets.reduce((acc, p) => {
    const f = join(OUT, `${slugify(p.name)}.json`);
    if (!existsSync(f)) return acc;
    try {
      return acc + (JSON.parse(readFileSync(f, "utf8")) as PlaceEvidence<DishCandidate>).candidates.length;
    } catch {
      return acc;
    }
  }, 0);
  console.log(`[menus] DONE — candidate items recorded: ${total}. Evidence: ${OUT}`);
}

main().catch((err) => {
  console.error("[menus] FATAL:", err);
  process.exit(1);
});
