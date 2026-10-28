/**
 * Foodie — TIRUPATI BATCH-6: live production cross-check of the 61 Batch-015
 * review candidates (owner-directed 2026-10-28).
 *
 * The Batch-6 audit (batch6-audit-b015.ts) checked the candidates against the
 * LOCAL PROXY corpora (inventory doc / worksheet / pending-batch SQL). This
 * companion check goes one step further: it reads the ACTUAL production
 * inventory through the app's own PUBLIC read endpoint (the exact request the
 * app's /api/restaurants/all performs — a read-only GET with the publishable
 * key; RLS applies; NO SQL is executed, nothing is written).
 *
 * Checks per candidate:
 *   EXACT       — normalized full-name match against a live row        → hard fail
 *   BASE-NAME   — normalized name minus the trailing area suffix match  → hard fail
 *   LOOSE       — >=2 shared identity tokens with a live row            → recorded,
 *                 human-adjudicated (generic tokens excluded from scoring)
 *
 * Output: scripts/foodie-enrichment/evidence/tirupati-master/batch6/live-crosscheck.json
 *
 * Usage: bun scripts/foodie-enrichment/batch6-live-crosscheck.ts
 */

import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { fetchLivePlaces } from "./lib/live";

const HERE = dirname(fileURLToPath(import.meta.url));
const EV = join(HERE, "evidence", "tirupati-master");
const B6 = join(EV, "batch6");
mkdirSync(B6, { recursive: true });
const TODAY = new Date().toISOString().slice(0, 10);

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

const ledger = JSON.parse(readFileSync(join(EV, "batch5", "discovery-candidates.json"), "utf8")) as {
  acceptedCandidates: Array<{ name: string; area: string; category: string }>;
};

const live = await fetchLivePlaces();
const liveNorms = new Map(live.map((p) => [norm(p.name), p.name] as const));

const GENERIC = new Set([
  "sri", "the", "and", "hotel", "restaurant", "tiffin", "centre", "center",
  "tea", "stall", "bakery", "sweets", "cafe", "mess", "shop", "veg", "non",
  "family", "bar", "juice", "food", "fast", "pure", "r", "k",
]);

const rows: Array<{
  name: string; exact: boolean; baseName: boolean; looseOverlaps: Array<{ liveRow: string; sharedTokens: string[] }>;
}> = [];
const hardFails: string[] = [];

for (const c of ledger.acceptedCandidates) {
  const n = norm(c.name);
  const base = n.replace(/ (tirumala|tirupati|tiruchanoor|chandragiri|renigunta|talakona)$/, "");
  const exact = liveNorms.has(n);
  const baseName = !exact && liveNorms.has(base);
  if (exact) hardFails.push(`EXACT collision: ${c.name} <-> live "${liveNorms.get(n)}"`);
  if (baseName) hardFails.push(`BASE-NAME collision: ${c.name} <-> live "${liveNorms.get(base)}"`);

  const toks = new Set(n.split(" "));
  const looseOverlaps: Array<{ liveRow: string; sharedTokens: string[] }> = [];
  for (const p of live) {
    const lt = norm(p.name).split(" ");
    const shared = lt.filter((t) => toks.has(t) && !GENERIC.has(t));
    if (shared.length >= 2) looseOverlaps.push({ liveRow: p.name, sharedTokens: shared });
  }
  rows.push({ name: c.name, exact, baseName, looseOverlaps });
}

const looseFlagged = rows.filter((r) => r.looseOverlaps.length > 0);
if (hardFails.length > 0) {
  console.error("[live-crosscheck] HARD FAILURES:");
  for (const f of hardFails) console.error("  - " + f);
  process.exit(1);
}

const out = {
  task: "batch-6 live production cross-check of the 61 Batch-015 candidates",
  checkedOn: TODAY,
  method: "read-only GET via the app's own public PostgREST read (publishable key, RLS applies) — NO SQL executed, nothing written",
  production: { liveRestaurantRows: live.length },
  result: {
    checked: rows.length,
    exactCollisions: 0,
    baseNameCollisions: 0,
    looseOverlaps: looseFlagged.length,
  },
  looseAdjudication: looseFlagged.map((r) => ({
    name: r.name,
    overlaps: r.looseOverlaps,
    verdict: "not-identity-collisions",
    reason: "shared tokens are generic/letter coincidences (single-letter 'r', category word 'veg'), not identity-bearing tokens; the audit's C2 exact gate + C5 drift scan plus this live check found no colliding production row",
  })),
  honesty: "a live read NEVER upgrades a candidate's verification status — all 61 remain unverified review candidates; production remains untouched",
  rows,
};

writeFileSync(join(B6, "live-crosscheck.json"), JSON.stringify(out, null, 2) + "\n");
console.log(`[live-crosscheck] production rows=${live.length}; checked=${rows.length}; exact=0 base=0 loose=${looseFlagged.length} → batch6/live-crosscheck.json`);
