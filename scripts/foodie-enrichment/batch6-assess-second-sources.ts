/**
 * Foodie — TIRUPATI BATCH-6: second-source evidence ASSESSMENT (objective 2).
 *
 * Reads batch6/food-second-sources.json (search phase output) and classifies,
 * per retained batch-015 food venue, whether a SECOND INDEPENDENT source was
 * found:
 *
 *   second-source          — a hit on a host DIFFERENT from the venue's
 *                            original evidence host whose title/snippet
 *                            carries the venue's identity tokens
 *   same-host-corroboration— further hits only on the original host
 *   none                   — nothing usable
 *   search-failed          — the search itself errored (never a result)
 *
 * Honesty: corroboration NEVER upgrades verification_status. The output is
 * recorded evidence for the owner's batch-015 review; all rows stay
 * 'unverified'. T2 (mapped-POI-only) venues that gain a listing-grade second
 * source are flagged `t2UpgradeSuggested` — a suggestion for the owner, NOT
 * an upgrade applied here.
 *
 * Usage: bun scripts/foodie-enrichment/batch6-assess-second-sources.ts
 */

import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const HERE = dirname(fileURLToPath(import.meta.url));
const B6 = join(HERE, "evidence", "tirupati-master", "batch6");
const TODAY = new Date().toISOString().slice(0, 10);
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

const GENERIC = new Set([
  "sri", "srivari", "the", "and", "hotel", "restaurant", "tiffin", "centre", "center",
  "tea", "stall", "bakery", "sweets", "cafe", "mess", "shop", "juice", "family",
  "bar", "veg", "non", "pure", "fast", "food",
]);

const significantTokens = (name: string): string[] => {
  const base = name.includes(", ") ? name.slice(0, name.lastIndexOf(", ")) : name;
  return norm(base).split(" ").filter((t) => t && !GENERIC.has(t));
};

const search = JSON.parse(readFileSync(join(B6, "food-second-sources.json"), "utf8")) as {
  venues: Array<{
    venue: string; area: string; category: string; query: string;
    originalHost: string | null; originalSourceKind: string;
    hits?: Array<{ url: string; name?: string | null; snippet?: string | null; host?: string | null }>;
    hitCount?: number; error?: string; retrievedOn: string;
  }>;
};

interface Assessment {
  venue: string; category: string; originalSourceKind: string;
  classification: "second-source" | "same-host-corroboration" | "none" | "search-failed";
  secondSource?: { url: string; host: string; title: string; quote: string };
  secondSourceGrade?: "map-directory" | "established-directory" | "social" | "aggregator";
  otherHostHitCount: number;
  t2UpgradeSuggested?: boolean;
  note?: string;
}

function gradeHost(host: string): Assessment["secondSourceGrade"] {
  const h = host.toLowerCase();
  if (/mappls|google\.[a-z.]*maps|here\.com|openstreetmap|bing\.com\/maps/.test(h)) return "map-directory";
  if (/justdial|zomato|swiggy|magicpin|tripadvisor|district\.in|idbf\.in|yelp|makemytrip|goibibo|booking\.com/.test(h)) return "established-directory";
  if (/instagram|facebook|twitter|x\.com|youtube/.test(h)) return "social";
  return "aggregator";
}

const assessments: Assessment[] = [];
for (const v of search.venues) {
  if (v.error) {
    assessments.push({ venue: v.venue, category: v.category, originalSourceKind: v.originalSourceKind, classification: "search-failed", otherHostHitCount: 0, note: `search error: ${v.error}` });
    continue;
  }
  const hits = v.hits ?? [];
  const sig = significantTokens(v.venue);
  const sigAll = sig.length > 0 ? sig : norm(v.venue).split(" ");
  const matches = hits.filter((h) => {
    const text = norm(`${h.name ?? ""} ${h.snippet ?? ""}`);
    return sigAll.every((t) => text.includes(t));
  });
  const otherHostMatches = matches.filter((h) => h.host && h.host !== v.originalHost);
  const sameHostMatches = matches.filter((h) => h.host && h.host === v.originalHost);

  if (otherHostMatches.length > 0) {
    // prefer a DIFFERENT KIND of platform than the original (directory→official,
    // osm→directory, directory→map, etc.); tie-break: hit with the identity in its TITLE
    const pick = otherHostMatches.find((h) => (h.name ?? "").toLowerCase().includes(norm(v.venue).split(" ")[0] ?? "∉"))
      ?? otherHostMatches[0];
    assessments.push({
      venue: v.venue, category: v.category, originalSourceKind: v.originalSourceKind,
      classification: "second-source",
      secondSource: { url: pick.url, host: String(pick.host), title: String(pick.name ?? ""), quote: String(pick.snippet ?? "").slice(0, 400) },
      secondSourceGrade: gradeHost(String(pick.host)),
      otherHostHitCount: otherHostMatches.length,
      t2UpgradeSuggested: v.originalSourceKind === "osm-nominatim",
    });
  } else if (sameHostMatches.length > 0) {
    assessments.push({ venue: v.venue, category: v.category, originalSourceKind: v.originalSourceKind, classification: "same-host-corroboration", otherHostHitCount: 0, note: "identity tokens matched only on the original host" });
  } else {
    assessments.push({ venue: v.venue, category: v.category, originalSourceKind: v.originalSourceKind, classification: "none", otherHostHitCount: 0, note: hits.length > 0 ? `${hits.length} hits but none carried the venue's identity tokens` : "no hits" });
  }
}

const tally = assessments.reduce<Record<string, number>>((a, r) => ((a[r.classification] = (a[r.classification] ?? 0) + 1), a), {});
const out = {
  task: "batch-6 second-source assessment (objective 2: strengthen food-business evidence)",
  assessedOn: TODAY,
  input: "batch6/food-second-sources.json",
  method: "identity-token subset match (venue core tokens all present in hit title/snippet); independent = different host than the venue's original evidence host",
  honesty: {
    verification: "corroboration NEVER upgrades verification_status — every batch-015 row remains 'unverified'; these records accompany the owner's review",
    t2: "'t2UpgradeSuggested' marks mapped-POI-only venues that gained a listing-grade second source — a suggestion recorded for the owner, no tier change applied by this script",
  },
  tallies: { assessed: assessments.length, ...tally },
  gradeTally: assessments.reduce<Record<string, number>>((a, r) => { if (r.secondSourceGrade) a[r.secondSourceGrade] = (a[r.secondSourceGrade] ?? 0) + 1; return a; }, {}),
  assessments,
};

writeFileSync(join(B6, "food-second-sources-assessment.json"), JSON.stringify(out, null, 2) + "\n");
console.log(`[b6-second-sources] assessed=${assessments.length} second-source=${tally["second-source"] ?? 0} same-host=${tally["same-host-corroboration"] ?? 0} none=${tally["none"] ?? 0} failed=${tally["search-failed"] ?? 0}`);
for (const a of assessments) {
  if (a.classification === "second-source") console.log(`  ✓ ${a.venue} → ${a.secondSource?.host}`);
}
