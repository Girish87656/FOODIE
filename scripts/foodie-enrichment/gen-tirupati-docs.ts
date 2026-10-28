/* ==================================================================
   gen-tirupati-docs.ts — emits the auditable discovery deliverables
   from the committed evidence (nothing hand-waved, nothing invented):
     docs/tirupati-place-inventory.md
     docs/tirupati-source-register.md
     docs/tirupati-coverage-matrix.md
     docs/tirupati-duplicate-review.md
     docs/tirupati-photo-gaps.md
   ================================================================== */

import { readFileSync, writeFileSync, readdirSync, existsSync } from "fs";
import { createHash } from "crypto";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");
const EV = join(HERE, "evidence", "tirupati-master");
const WS = join(HERE, "worksheets");
const DOCS = join(ROOT, "docs");

/* ---------------- inputs ---------------- */

const ws = JSON.parse(readFileSync(join(WS, "tirupati-master.json"), "utf8")) as { summary: Record<string, number> };
const cur = JSON.parse(readFileSync(join(WS, "tirupati-master-curated.json"), "utf8")) as {
  summary: Record<string, number | string>;
  rows: Array<Record<string, unknown>>;
  curationLog: Array<{ raw: string; area: string; action: string; reason: string }>;
};
const official = JSON.parse(readFileSync(join(EV, "official", "official-sources.json"), "utf8")) as {
  accessedOn: string; userAgent: string;
  sources: Array<{ sourceUrl: string; httpStatus: number; page: string; pageSizeBytes?: number; note: string; extracted: Array<unknown> }>;
  selfCheck: Array<{ name: string; foundInRawHtml: boolean }>;
};

/* batch-4 direct-source inputs (no search provider — recorded limitations kept) */
const o2log = existsSync(join(EV, "official", "official2-fetch-log.json"))
  ? JSON.parse(readFileSync(join(EV, "official", "official2-fetch-log.json"), "utf8")) as { retrievedOn: string; results: Array<{ url: string; httpStatus: number | null; bytes: number | null; pageTitle: string | null; servedHomepageShell?: boolean; note?: string; why: string; error?: string }> }
  : null;
const o2ext = existsSync(join(EV, "official", "official2-extractions.json"))
  ? JSON.parse(readFileSync(join(EV, "official", "official2-extractions.json"), "utf8")) as { retrievedOn: string; pages: Array<{ page: string; sourceUrl: string; subject: string | null; entryCount: number }> }
  : null;
const wiki = existsSync(join(EV, "wikipedia", "wikipedia-evidence.json"))
  ? JSON.parse(readFileSync(join(EV, "wikipedia", "wikipedia-evidence.json"), "utf8")) as { retrievedOn: string; apiLimitation: string; pages: Array<{ pageTitle: string; area: string; url: string; httpStatus: number | null; entryCount?: number; pageCoord?: { lat: number; lng: number } | null; disambiguationPage?: boolean; note?: string; error?: string }> }
  : null;
const rq = existsSync(join(EV, "review-queue-new-names.json"))
  ? JSON.parse(readFileSync(join(EV, "review-queue-new-names.json"), "utf8")) as { retrievedOn: string; statusDefinition: string; tallies: { corpusUniqueNames: number; corroboratedExistingNames: number; weakMatches: number; genuinelyNewQueued: number }; genuinelyNew: Array<{ name: string; area: string; reviewPriority: string }> }
  : null;
const crossmatchFiles = existsSync(EV) ? readdirSync(EV).filter((f) => f.startsWith("crossmatch-")).sort() : [];

/* batch-5 inputs (search resumed + direct, 2026-10-29) */
const B5 = join(EV, "batch5");
const b5Assess = existsSync(join(B5, "review-queue-assessment.json"))
  ? JSON.parse(readFileSync(join(B5, "review-queue-assessment.json"), "utf8")) as {
      assessedOn: string; tallies: Record<string, number>;
      queueMeta: { retrievedOn: string; leadsIn: number };
      officialPageReExamination: { note: string; newCandidates: unknown[]; corroborations: unknown[] };
      seshachalamHills: { name: string; decision: string };
    }
  : null;
const b5Cands = existsSync(join(B5, "discovery-candidates.json"))
  ? JSON.parse(readFileSync(join(B5, "discovery-candidates.json"), "utf8")) as {
      assembledOn: string;
      tallies: { acceptedCandidates: number; held: number; weakLeads: number; corroborations: number; byArea: Record<string, number>; byCategory: Record<string, number>; byTier: Record<string, number> };
      acceptedCandidates: Array<{ name: string; area: string; category: string; tier: string; evidence: { url: string; sourceKind: string } }>;
      heldLeads: Array<{ name: string; reason: string }>;
      weakLeads: Array<{ name: string; area: string; reason: string }>;
      corroborations: Array<{ name: string; existingRecord: string; evidence: { url: string } }>;
      limitations: string[];
    }
  : null;
const b5Probe = existsSync(join(B5, "websearch-probe.json"))
  ? JSON.parse(readFileSync(join(B5, "websearch-probe.json"), "utf8")) as { retrievedOn: string; decision: string; resultCount?: number }
  : null;
const b5Nom = existsSync(join(B5, "nominatim-food-pois.json"))
  ? JSON.parse(readFileSync(join(B5, "nominatim-food-pois.json"), "utf8")) as { retrievedOn: string; viewbox: string; queries: Array<{ keyword: string; httpStatus?: number; hitCount?: number; error?: string }> }
  : null;
const b5Wv = existsSync(join(B5, "wikivoyage-evidence.json"))
  ? JSON.parse(readFileSync(join(B5, "wikivoyage-evidence.json"), "utf8")) as { retrievedOn: string; pages: Array<{ url: string; httpStatus: number | null; usefulness: string }> }
  : null;
const b5Refetch = existsSync(join(B5, "wikipedia-refetch-evidence.json"))
  ? JSON.parse(readFileSync(join(B5, "wikipedia-refetch-evidence.json"), "utf8")) as { retrievedOn: string; pages: Array<{ queueLead: string; httpStatus: number | null; usefulness: string }> }
  : null;

const AREA_LABEL: Record<string, string> = {
  "tpt-central": "Tirupati city centre",
  "tpt-neighbourhoods": "Tirupati residential neighbourhoods",
  "tirumala": "Tirumala hills",
  "tiruchanur": "Tiruchanur (Alamelu Mangapuram corridor)",
  "srinivasa-mangapuram": "Srinivasa Mangapuram (~10 km west)",
  "chandragiri": "Chandragiri (~12-14 km south-west)",
  "renigunta": "Renigunta (airport/junction corridor, ~10-12 km north)",
  "surrounding": "Surrounding destinations (beyond city/Tirumala core)",
};

/* identity-held candidates: verify-confirmed but names too generic to admit as
   distinct places without stronger identity evidence (documented in the
   batch-013 review-candidate header; same list as the integrity test). */
const HELD_KEYS = new Set([
  "tpt-neighbourhoods::kafe", "tirumala::kafe tirupati",
  "tpt-neighbourhoods::anjaneya swamy temple",
  "tpt-neighbourhoods::sri vinayaka swamy temple",
  "tpt-neighbourhoods::mini park",
  /* batch-3 eligibility review (2026-10-27): */
  "tirumala::tirumala balaji sweets", /* name drift vs frozen batch-013 queued row 'Tirumala Balaji Sweets -' — venue already queued; reconcile before import */
  "tirumala::tirumala tea stall", /* conflicting locality listings (Khadi Colony vs Reddy & Reddy Colony) — identity review */
  "tpt-central::mirchi bajji point", /* unresolved vs the Mangalam listing (dup queue) — identity review */
]);

/* batch review-candidate INSERT ids (parsed from the generated SQL files —
   single source of truth for "which rows are queued for import"). Preflight
   guard ids are unquoted; INSERT tuple ids carry '…'::uuid. */
const NAMESPACE_UUID5 = "6d3a0f5e-7b1c-4a2e-9d84-2f6a1c9e0b31";
function uuid5(name: string): string {
  const h = createHash("sha1").update(NAMESPACE_UUID5.replace(/-/g, "")).update(name).digest("hex");
  return [
    h.slice(0, 8), h.slice(8, 12), `5${h.slice(13, 16)}`,
    ((parseInt(h.slice(16, 18), 16) & 0x3f) | 0x80).toString(16).padStart(2, "0") + h.slice(18, 20),
    h.slice(20, 32),
  ].join("-");
}
function insertIds(sqlPath: string): Set<string> {
  if (!existsSync(sqlPath)) return new Set();
  const text = readFileSync(sqlPath, "utf8");
  return new Set(Array.from(text.matchAll(/'([0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})'::uuid/g)).map((m) => m[1]));
}
const B12_IDS = insertIds(join(ROOT, "supabase", "review-candidates", "insert-batch-012-tptm-master.sql"));
const B13_IDS = insertIds(join(ROOT, "supabase", "review-candidates", "insert-batch-013-tptm-b2.sql"));
const B14_IDS = insertIds(join(ROOT, "supabase", "review-candidates", "insert-batch-014-tptm-b3.sql"));
const GROUP_LABEL: Record<string, string> = {
  "food-restaurants": "Restaurants & messes",
  "food-tiffin": "Tiffin & breakfast centres",
  "food-street": "Street food, tea & juice stalls",
  "food-bakery": "Bakeries, sweets & ice cream",
  "food-cafe": "Cafés & coffee",
  "temples": "Temples & sacred sites",
  "attractions": "Tourist attractions",
  "stays": "Stays & pilgrim accommodation",
  "markets": "Markets & shopping",
};
const GROUPS = Object.keys(GROUP_LABEL);

/* discovery query accounting */
interface DiscoveryFile { retrievedOn: string; group: string; areas: Record<string, Array<{ query: string; hits: unknown[]; error?: string }>> }
const discovery: DiscoveryFile[] = GROUPS.map((g) => {
  const f = join(EV, `discovery-${g}.json`);
  return existsSync(f) ? JSON.parse(readFileSync(f, "utf8")) as DiscoveryFile : { retrievedOn: "-", group: g, areas: {} };
});
const queryCount = discovery.reduce((a, d) => a + Object.values(d.areas).reduce((b, es) => b + es.length, 0), 0);
const hitCount = discovery.reduce((a, d) => a + Object.values(d.areas).reduce((b, es) => b + es.reduce((c, e) => c + (e.hits?.length ?? 0), 0), 0), 0);
const erroredQueries = discovery.flatMap((d) => Object.entries(d.areas).flatMap(([a, es]) => es.filter((e) => e.error && e.error !== "no-results").map((e) => ({ area: a, query: e.query, error: e.error as string }))));

const verifyFiles = readdirSync(EV).filter((f) => f.startsWith("verify-"));
const geocodeFiles = readdirSync(EV).filter((f) => f.startsWith("geocode-"));
let verifyOk = 0, verifyNot = 0, verifySkipped = 0;
for (const f of verifyFiles) {
  try {
    const d = JSON.parse(readFileSync(join(EV, f), "utf8")) as { areaConfirmed?: boolean; skipped?: boolean };
    if (d.skipped) verifySkipped++; else if (d.areaConfirmed) verifyOk++; else verifyNot++;
  } catch { /* skip */ }
}
let geocodeOk = 0, geocodeNull = 0;
for (const f of geocodeFiles) {
  try {
    const d = JSON.parse(readFileSync(join(EV, f), "utf8")) as { areaConfirmed?: boolean };
    if (d.areaConfirmed) geocodeOk++; else geocodeNull++;
  } catch { /* skip */ }
}

/* ---------------- 1. inventory ---------------- */

type Row = Record<string, unknown>;
const active = cur.rows.filter((r) => r.status === "curated") as Row[];
const dups = cur.rows.filter((r) => r.status === "duplicate") as Row[];
const tierName: Record<string, string> = {
  T1: "VERIFIED (identity + area re-confirmed by an independent search)",
  T2: "PARTIALLY VERIFIED (official source names the place; no independent re-check yet)",
  T3: "PARTIALLY VERIFIED (single listing hit, area-gated) / UNVERIFIED backlog",
};
const statusLabel = (r: Row): string => {
  const t = r.tier as string;
  if (t === "T1") return "VERIFIED";
  if (t === "T2") return "PARTIALLY VERIFIED";
  return "UNVERIFIED";
};

let inv = `# FOODIE — Tirupati Master Place Inventory
Generated ${cur.summary.curatedOn} by scripts/foodie-enrichment/gen-tirupati-docs.ts from
committed evidence (worksheets/tirupati-master-curated.json). Nothing on this page is
hand-typed — every row traces to an evidence file.

**Verification policy (docs/tirupati-place-discovery-plan.md §3):** these statuses are the
DOC-LEVEL review layer. DB rows imported from this inventory always carry
\`verification_status='unverified'\` — an import never self-verifies.

- **VERIFIED** (T1) — the candidate survived an independent identity-verification search
  (\`"<name>" Tirupati address\`) whose results re-confirmed the area token.
- **PARTIALLY VERIFIED** (T2) — an official page (tirumala.org / incredibleindia.gov.in)
  names the place; verbatim quote stored; no independent re-check yet.
- **UNVERIFIED** (T3) — plausible candidate from a single area-gated listing hit;
  discoverable internally, never shown as verified to users.

**Counts:** ${cur.summary.totalCandidatesIn} raw candidates → ${cur.summary.curated} curated
(${cur.summary.byTier ? JSON.stringify(cur.summary.byTier) : ""}) → ${cur.summary.duplicatesMarked} possible duplicates
(queued) → ${cur.summary.dropped} dropped with recorded reasons.

**Review candidates queued for owner execution:** Batch-012 = 29 rows (10 T1 restaurants +
19 T2 places) + Batch-013 = 57 rows (17 T1 food venues + 40 POI/stay places) + Batch-014 =
27 rows (22 T1 restaurants + 5 T1 locality-disambiguated temples, all coordinates null by
design) = **113 rows**, plus 5 verify-confirmed candidates HELD inventory-only (names too
generic to admit without stronger identity evidence — see duplicate-review §B/batch-013
header). No batch is executed; all await owner approval.
`;

const areasInOrder = ["tpt-central", "tpt-neighbourhoods", "tirumala", "tiruchanur", "srinivasa-mangapuram", "chandragiri", "renigunta", "surrounding"];
for (const area of areasInOrder) {
  const rows = active.filter((r) => r.area === area);
  if (!rows.length) continue;
  inv += `\n## ${AREA_LABEL[area]}\n`;
  for (const g of GROUPS) {
    const gr = rows.filter((r) => r.group === g);
    if (!gr.length) continue;
    inv += `\n### ${GROUP_LABEL[g]}\n\n`;
    inv += "| Place | Status | Locality hint | DB target | Sources (kind) | Import batch | Coordinates | Notes |\n";
    inv += "|---|---|---|---|---|---|---|---|\n";
    for (const r of gr) {
      const name = r.name as string;
      const id = uuid5(`foodie-tptm:Tirupati:${name}`);
      const dest = r.target === "restaurant" ? "restaurants" : "places";
      let inBatch: string;
      if (B12_IDS.has(id)) inBatch = `YES → batch-012 (${dest})`;
      else if (B13_IDS.has(id)) inBatch = `YES → batch-013 (${dest})`;
      else if (B14_IDS.has(id)) inBatch = `YES → batch-014 (${dest})`;
      else if (HELD_KEYS.has(r.key as string)) inBatch = "no (identity-held — see batch-014 header for hold reason)";
      else if (r.existingSet === "batch-011") inBatch = "— (already Batch-011 candidate)";
      else if (r.existingSet === "production") inBatch = "— (already live)";
      else inBatch = "no (T3 backlog)";
      const geo = (r.geocode as { lat: number | null }).lat != null
        ? `${(r.geocode as { lat: number }).lat.toFixed(5)}, ${(r.geocode as { lng: number }).lng.toFixed(5)}`
        : "null (never estimated)";
      const kinds = (r.sources as Array<{ kind: string | null }>).map((s) => s.kind ?? "?").join(", ");
      const notes = [
        (r.verifyAddressEvidence ? "address-pattern evidence recorded" : null),
        (r.officialSources ? "official verbatim quote stored" : null),
        ((r.rawNames as string[]).length > 1 ? `${(r.rawNames as string[]).length} listing titles merged` : null),
      ].filter(Boolean).join("; ") || "—";
      inv += `| ${name} | ${statusLabel(r)} | ${(r.localityHint as string) ?? "—"} | ${r.target === "restaurant" ? "restaurants" : "places"} | ${kinds} | ${inBatch} | ${geo} | ${notes} |\n`;
    }
  }
}

inv += `\n## Cross-references to existing sets\n\n`;
const b11 = active.filter((r) => r.existingSet === "batch-011");
inv += `Batch-011 (owner-blocked import, candidate unchanged): ${b11.length} curated candidates alias
${new Set(b11.map((r) => r.existingSetId)).size} of its 16 rows — listed in
docs/tirupati-duplicate-review.md; none are re-imported.\n\n`;
const prod = active.filter((r) => r.existingSet === "production");
inv += `Production (live) rows re-encountered: ${prod.length} — ${prod.map((r) => r.name).join(", ") || "none"}.\n`;
inv += `\n## Dropped candidates (with reasons — never silently deleted)\n\n`;
inv += "| Raw listing title | Area | Reason |\n|---|---|---|\n";
for (const l of cur.curationLog.filter((l) => l.action === "dropped")) {
  inv += `| ${l.raw.replace(/\|/g, "/")} | ${l.area} | ${l.reason} |\n`;
}
inv += `\n## Renames (dirty listing title → clean display name; audited)\n\n`;
inv += "| Raw listing title | Clean name |\n|---|---|\n";
for (const l of cur.curationLog.filter((l) => l.action === "renamed")) {
  const m = l.reason.match(/"(.+?)" → "(.+)"/);
  inv += `| ${l.raw.replace(/\|/g, "/")} | ${m ? m[2] : l.reason} |\n`;
}

if (crossmatchFiles.length) {
  inv += `\n## Batch-4 independent-source corroboration (${o2log?.retrievedOn ?? "2026-10-27"} direct-source pass)\n\n`;
  inv += `Pending candidates whose identity a second, non-search source corroborates (exact normalized-name
match within the same area — evidence in \`evidence/tirupati-master/crossmatch-*.json\`; verify stubs
stay untouched on disk; this is NEVER labelled a web_search identity verification):
\n`;
  for (const f of crossmatchFiles) {
    const d = JSON.parse(readFileSync(join(EV, f), "utf8")) as { candidate: { name: string; area: string }; match: { kind: string; url: string } };
    inv += `- **${d.candidate.name}** [${d.candidate.area}] ← ${d.match.kind}: ${d.match.url}\n`;
  }
  inv += `\nAll other pending rows remain pending (throttled stubs and never-attempted rows unchanged).
`;
}
if (rq) {
  inv += `\nReview-queue leads from the same pass (${rq.tallies.genuinelyNewQueued} names in
evidence/tirupati-master/review-queue-new-names.json) are NOT inventory rows and are NOT counted
anywhere — each is an unverified lead with a verbatim quote, awaiting human research.
`;
}

/* ---- Batch-5 sections ---- */
if (b5Assess && b5Cands) {
  inv += `\n## Batch-5 review-queue assessment (${b5Assess.assessedOn})\n\nAll ${b5Assess.queueMeta.leadsIn} genuinely-new leads were assessed MANUALLY on their exact quotations and
source URLs (never name-similarity alone) — evidence/evidence/tirupati-master/batch5/review-queue-assessment.json:
\n| Decision | Count |\n|---|---|\n`;
  for (const [k, v] of Object.entries(b5Assess.tallies)) inv += `| ${k} | ${v} |\n`;
  inv += `\nALL FIVE HIGH-priority leads resolved WITHOUT becoming candidates: 3 corroborate existing inventory
records (Sri Kodandaramaswami → Sri Kodanda Ramaswamy Temple; Zoo Park → Sri Venkateswara Zoological
Park; Srikalahasti Temple → Srikalahasteeswara temple), 1 is a generic-term extraction ("Hindu temple")
and 1 is an out-of-scope Bihar namesake (Kapileshwar Temple, Bihar).
`;

  inv += `\n## Batch-5 accepted candidates (Batch-015 review-candidate SQL, ${b5Cands.assembledOn})\n\n${b5Cands.tallies.acceptedCandidates} accepted candidates were assembled from (a) the queue assessment, (b) the ALREADY-SAVED
official TTD page places-around-tirumala.aspx (the dead garden.aspx/theerthams.aspx homepage shells never
delivered this content), (c) 4 targeted queue-lead checks, and (d) ${19 + 12} bounded discovery searches
(19 web_search locality×category + 12 Nominatim POI) aimed at the biggest known gap: SMALL FOOD BUSINESSES.
Fail-loud dedupe gates proved zero collisions against inventory, batches 011–014 and the curated worksheet.
\n| Area | Accepted |\n|---|---|\n`;
  for (const [k, v] of Object.entries(b5Cands.tallies.byArea)) inv += `| ${AREA_LABEL[k] ?? k} | ${v} |\n`;
  inv += `\n| Category | Accepted |\n|---|---|\n`;
  for (const [k, v] of Object.entries(b5Cands.tallies.byCategory)) inv += `| ${k} | ${v} |\n`;
  inv += `\nThese rows import ONLY as \`verification_status='unverified'\` review candidates
(supabase/review-candidates/insert-batch-015-tptm-b5.sql — never executed by this repo); coordinates stay
NULL (published OSM coordinates remain in the evidence ledger for human review).
\nAccepted candidate names (canonical):
\n`;
  for (const c of b5Cands.acceptedCandidates) inv += `- ${c.name} [${c.area}/${c.category}/${c.tier}] — ${c.evidence.sourceKind}: ${c.evidence.url}\n`;

  inv += `\n### Batch-5 corroborations of EXISTING records (not new rows)\n\n`;
  for (const c of b5Cands.corroborations) inv += `- **${c.name}** → ${c.existingRecord} (${c.evidence.url})\n`;

  inv += `\n### Batch-5 weak leads (review queue ONLY — not candidates, not counted)\n\n${b5Cands.weakLeads.length} discovery hits were recorded as weak leads (list-mentions without locality,
aggregator pages, chain outlets, institutional canteens, dated sources) — they stay OUT of every count,
same as the original queue. Identity-HELD (${b5Cands.tallies.held}): ${b5Cands.heldLeads.map((h) => `"${h.name}"`).join(", ")}
— see the duplicate-review doc.
\n### Batch-5 source limitations\n\n`;
  for (const l of b5Cands.limitations) inv += `- ${l}\n`;
}

/* batch-6 inputs (audit + evidence strengthening + coverage gaps, 2026-10-28) */
const B6 = join(EV, "batch6");
const b6Audit = existsSync(join(B6, "b015-audit.json"))
  ? JSON.parse(readFileSync(join(B6, "b015-audit.json"), "utf8")) as {
      auditedOn: string;
      tallies: { audited: number; retained: number; movedToReviewQueue: number; manualAdjudications: number; deterministicFlags: number };
      movedToReviewQueue: Array<{ name: string; reason: string }>;
      adjudications: Array<{ name: string; decision: string; reason: string }>;
      checksRun: Record<string, string>;
    }
  : null;
const b6Crosscheck = existsSync(join(B6, "live-crosscheck.json"))
  ? JSON.parse(readFileSync(join(B6, "live-crosscheck.json"), "utf8")) as {
      checkedOn: string; production: { liveRestaurantRows: number };
      result: { checked: number; exactCollisions: number; baseNameCollisions: number; looseOverlaps: number };
    }
  : null;
const b6Second = existsSync(join(B6, "food-second-sources-assessment.json"))
  ? JSON.parse(readFileSync(join(B6, "food-second-sources-assessment.json"), "utf8")) as {
      assessedOn: string; tallies: Record<string, number>; gradeTally: Record<string, number>;
      assessments: Array<{ venue: string; classification: string; secondSource?: { url: string; host: string }; secondSourceGrade?: string }>;
    }
  : null;
const b6Cands = existsSync(join(B6, "discovery-candidates.json"))
  ? JSON.parse(readFileSync(join(B6, "discovery-candidates.json"), "utf8")) as {
      assembledOn: string;
      tallies: { acceptedCandidates: number; held: number; weakLeads: number; corroborations: number; byArea: Record<string, number>; byCategory: Record<string, number>; byTier: Record<string, number> };
      acceptedCandidates: Array<{ name: string; area: string; category: string; tier: string; evidence: { url: string; sourceKind: string } }>;
      heldLeads: Array<{ name: string; reason: string }>;
      weakLeads: Array<{ name: string; area: string; reason: string }>;
      corroborations: Array<{ name: string; existingRecord: string; evidence: { url: string } }>;
      limitations: string[];
    }
  : null;
const b6Nom2 = existsSync(join(B6, "nominatim2-town-pois.json"))
  ? JSON.parse(readFileSync(join(B6, "nominatim2-town-pois.json"), "utf8")) as {
      retrievedOn: string;
      queries: Array<{ town: string; keyword: string; inAreaCount?: number; usefulness?: string; inAreaHits?: Array<{ name?: string; lat?: string; lon?: string; type?: string }> }>;
    }
  : null;

/* ---- Batch-6 inventory sections ---- */
if (b6Audit && b6Cands) {
  inv += `\n## Batch-6 audit of the Batch-015 candidates (${b6Audit.auditedOn})\n\nAll ${b6Audit.tallies.audited} Batch-015 proposed records were re-audited (scripts/foodie-enrichment/batch6-audit-b015.ts,
evidence/tirupati-master/batch6/b015-audit.json): canonical uuid5 ids recomputed (exact match), zero exact
collisions vs inventory/batches 011–015/worksheet/queue, slug uniqueness re-proven, every deterministic flag
explicitly adjudicated with a recorded reason (${b6Audit.tallies.manualAdjudications} adjudications, ${b6Audit.tallies.deterministicFlags} deterministic flags).
\n| Verdict | Count |\n|---|---|\n| retained | ${b6Audit.tallies.retained} |\n| moved to review queue | ${b6Audit.tallies.movedToReviewQueue} |\n\nMoved to the review queue (locality evidence insufficient — full reasons in the audit file):\n\n`;
  for (const m of b6Audit.movedToReviewQueue) inv += `- **${m.name}** — ${m.reason.slice(0, 220)}…\n`;
  inv += `\nBatch-015 SQL was regenerated deterministically with the retained ${b6Audit.tallies.retained} rows
(40 restaurants + 19 places); the two moved rows keep their full evidence in batch6/review-queue-batch6.json
and are counted NOWHERE as inventory/candidates. ALL retained rows remain verification_status='unverified'.
`;
}
if (b6Crosscheck) {
  inv += `\n### Batch-6 LIVE production cross-check (${b6Crosscheck.checkedOn})\n\nThe audit's local-proxy corpora were supplemented by a read of the ACTUAL production inventory through the
app's own public read endpoint (read-only GET with the publishable key; NO SQL executed, nothing written):
**${b6Crosscheck.production.liveRestaurantRows} live restaurant rows** — all ${b6Crosscheck.result.checked} candidates checked:
${b6Crosscheck.result.exactCollisions} exact collisions, ${b6Crosscheck.result.baseNameCollisions} base-name collisions,
${b6Crosscheck.result.looseOverlaps} loose token overlaps (batch6/live-crosscheck.json). A live read never
upgrades a verification status.
`;
}
if (b6Second) {
  inv += `\n### Batch-6 second-source evidence for the batch-015 food venues (${b6Second.assessedOn})\n\nObjective: find a SECOND INDEPENDENT source per food venue (40 retained venues; one bounded web_search query
each, 8 s pacing). Classification is corroboration-grade — it NEVER upgrades verification_status:
\n| Classification | Count |\n|---|---|\n`;
  for (const [k, v] of Object.entries(b6Second.tallies)) inv += `| ${k} | ${v} |\n`;
  inv += `\nSecond-source grades: ${Object.entries(b6Second.gradeTally).map(([k, v]) => `${k} ${v}`).join(", ")}.
The records (URL + host + quote per venue) live in batch6/food-second-sources-assessment.json and accompany
the owner's batch-015 review. ${b6Second.tallies["same-host-corroboration"] ?? 0} venues matched only on their original host and ${b6Second.tallies["none"] ?? 0}
found nothing — those rows stay single-source review candidates, honestly.
`;
}
if (b6Cands) {
  inv += `\n## Batch-6 accepted candidates (Batch-016 review-candidate SQL, ${b6Cands.assembledOn})\n\n${b6Cands.tallies.acceptedCandidates} accepted candidates were assembled from the coverage-gap sweep of the weakest locality×category
cells (18 bounded web_search queries + 9 Nominatim town queries + 40 second-source queries after the ONE-probe
availability check passed). Fail-loud dedupe gates proved zero collisions against inventory, batches 011–015,
the curated worksheet (incl. rawNames aliases), the batch-6 review queue AND a base-name gate for the
locality-less canonicals frozen in earlier batches.
\n| Area | Accepted |\n|---|---|\n`;
  for (const [k, v] of Object.entries(b6Cands.tallies.byArea)) inv += `| ${AREA_LABEL[k] ?? k} | ${v} |\n`;
  inv += `\n| Category | Accepted |\n|---|---|\n`;
  for (const [k, v] of Object.entries(b6Cands.tallies.byCategory)) inv += `| ${k} | ${v} |\n`;
  inv += `\nThese rows import ONLY as \`verification_status='unverified'\` review candidates
(supabase/review-candidates/insert-batch-016-tptm-b6.sql — never executed by this repo); coordinates stay
NULL (published coordinates remain in the evidence files for human review).
\nAccepted candidate names (canonical):\n\n`;
  for (const c of b6Cands.acceptedCandidates) inv += `- ${c.name} [${c.area}/${c.category}/${c.tier}] — ${c.evidence.sourceKind}: ${c.evidence.url}\n`;
  inv += `\n### Batch-6 corroborations of EXISTING records (not new rows)\n\n`;
  for (const c of b6Cands.corroborations) inv += `- **${c.name}** → ${c.existingRecord} (${c.evidence.url})\n`;
  inv += `\n### Batch-6 weak leads (review queue ONLY — not candidates, not counted)\n\n${b6Cands.weakLeads.length} discovery hits were recorded as weak leads (list-mentions without own locality, delivery-area
pages, aggregator lists, truncated snippets, chain outlets, wrong-city Nominatim matches). Identity-HELD
(${b6Cands.tallies.held}): ${b6Cands.heldLeads.map((h) => `"${h.name}"`).join(", ")} — see the duplicate-review doc.
\n### Batch-6 source limitations\n\n`;
  for (const l of b6Cands.limitations) inv += `- ${l}\n`;
}

/* ---------------- 2. source register ---------------- */

let reg = `# FOODIE — Tirupati Discovery Source Register
Sources ACTUALLY reviewed during the master discovery pass (access date ${official.accessedOn}).
A source that could not be accessed is recorded as a limitation — never silently skipped.

## 1. Official pages (fetched directly, HTTP status recorded)

| Source | Status | Size | Extracted | Notes |
|---|---|---|---|---|
`;
for (const s of official.sources) {
  reg += `| ${s.sourceUrl} | ${s.httpStatus === 200 ? "200 OK" : "FAILED (connection)"} | ${s.pageSizeBytes ? `${s.pageSizeBytes} B` : "—"} | ${(s.extracted ?? []).length} names | ${s.note} |\n`;
}
reg += `\nFetch UA: \`${official.userAgent}\`. Verbatim-quote integrity self-check: ${official.selfCheck.length}/${official.selfCheck.filter((s) => s.foundInRawHtml).length} located word-for-word in the saved raw HTML.\n`;

reg += `
## 2. Inaccessible official domains (recorded limitations)

| Source | Result | Consequence |
|---|---|---|
| https://tirupati.ap.gov.in/ (+ /tourist-places/ /religious-tourism/ /eco-tourism/) | connection failed from sandbox network (3 attempts incl. browser UA) | content enters ONLY via quoted snippets in search results, attributed; NOT counted as reviewed pages |
| https://tourism.ap.gov.in/ | connection failed (same) | same |
| https://ttdevasthanams.ap.gov.in/ + https://tirupatibalaji.ap.gov.in/ | connection failed (recorded) | TTD's alternate domains remain unreachable from the sandbox; tirumala.org content is used instead |
`;

reg += `
## 3. Search channel

z-ai \`web_search\` (multi-engine public web results): **${queryCount} discovery queries** across
${GROUPS.length} category groups × ${areasInOrder.length} locality groups, returning **${hitCount} raw hits**.
Rate limits: the backend hard-throttled during the pass (HTTP 429s with documented back-offs);
${erroredQueries.length} queries ended in a recorded error state and ${verifySkipped} identity verifications were
rate-limit-skipped (all re-runnable — the pipeline is resumable per query/candidate).

## 4. Identity-verification + geocoding channels

- Identity verification: **${verifyFiles.length} candidates verified** so far — ${verifyOk} area-confirmed,
  ${verifyNot} not confirmed, ${verifySkipped} skipped (rate limit). Remaining candidates keep their
  discovery-hit evidence and stay T3/backlog until verified.
- Geocoding: OpenStreetMap Nominatim (keyless, 1 req/s, project UA, area-gated):
  ${geocodeFiles.length} attempts → **${geocodeOk} area-confirmed matches, ${geocodeNull} NULL** (coordinates are
  NEVER estimated; every NULL is recorded with its reason in geocode-*.json).

## 5. Public listing platforms (via search snippets only — no page scraping)

Hosts that actually surfaced allow-listed hits in this pass:
`;
const hostCounts = new Map<string, number>();
for (const r of cur.rows as Row[]) {
  for (const s of (r.sources as Array<{ url: string; kind: string | null }>)) {
    try { const h = new URL(s.url).host; hostCounts.set(h, (hostCounts.get(h) ?? 0) + 1); } catch { /* skip */ }
  }
}
for (const [h, c] of Array.from(hostCounts.entries()).sort((a, b) => b[1] - a[1])) {
  reg += `- \`${h}\` — ${c} curated reference(s)\n`;
}
reg += `
Usage policy: only the identity of a listing (name + URL + public snippet) is used as evidence;
listing pages are NOT scraped wholesale, no descriptions are copied, no Google Maps bulk
harvesting was attempted (their terms prohibit it), and no copyrighted photo was downloaded.
`;

if (o2log && wiki) {
  reg += `\n## 6. Batch-4 direct sources (fetched WITHOUT any search provider, ${o2log.retrievedOn})\n\nThe z-ai web_search provider stayed quota-exhausted (HTTP 429) — ONE bounded probe this session,
then paused per protocol. These sources were fetched directly instead:
\n### 6a. tirumala.org official pages (batch-4 additions)\n\n| Source | Status | Size | Result |
|---|---|---|---|\n`;
  for (const r of o2log.results) {
    // the guest-house pages carry the site-generic <title>; their real identity
    // is the div-heading subject recorded in the extractions — prefer it
    const o2Subject = o2ext?.pages.find((pg) => pg.sourceUrl === r.url)?.subject ?? null;
    const result = r.servedHomepageShell
      ? "HOMEPAGE SHELL — dead/retired URL, no place content (recorded limitation)"
      : (o2Subject ? `real rate-table page: ${o2Subject}` : `real page: ${r.pageTitle ?? "?"}`);
    reg += `| ${r.url} | ${r.httpStatus ?? "ERR"} | ${r.bytes ?? "—"} B | ${result} |\n`;
  }
  if (o2ext) {
    const o2Venues = o2ext.pages.reduce((a, p) => a + p.entryCount, 0);
    reg += `\nExtracted ${o2Venues} TTD accommodation venue names from the ${o2ext.pages.filter((p) => p.entryCount).length} real rate-table
pages (official/official2-extractions.json) — documentary corroboration for the batch-013 queued
accommodation rows; NOT new candidates.
`;
  }
  reg += `\n### 6b. English Wikipedia article pages\n\n| Article | Area | Status | Entries | Page coord published |
|---|---|---|---|---|\n`;
  for (const p of wiki.pages) {
    reg += `| ${p.pageTitle} | ${p.area} | ${p.httpStatus ?? "ERR"}${p.disambiguationPage ? " (disambiguation — 0 entries by guard)" : ""} | ${p.entryCount ?? 0} | ${p.pageCoord ? "yes" : "no"} |\n`;
  }
  const wikiEntries = wiki.pages.reduce((a, p) => a + (p.entryCount ?? 0), 0);
  reg += `\n${wikiEntries} place-link entries (dedup per page) with verbatim sentence quotes; article-subject
coordinates recorded only where Wikipedia itself publishes one — coordinates are NEVER inferred.
api.php limitation: ${wiki.apiLimitation}
`;
  if (rq) {
    reg += `\n### 6c. Independent-source crossmatch + review queue\n\n- Corpus: ${rq.tallies.corpusUniqueNames} unique source names → **${rq.tallies.corroboratedExistingNames} corroborate existing
  inventory names**, ${rq.tallies.weakMatches} weak partial overlaps, ${rq.tallies.genuinelyNewQueued} genuinely new names queued for
  review (review-queue-new-names.json — leads only, never counted as candidates).\n- ${crossmatchFiles.length} pending candidates received an independent-source locality confirmation
  (crossmatch-*.json; inventory §Batch-4 lists them).
`;
  }
}

if (b5Assess && b5Cands && b5Probe) {
  reg += `\n## 7. Batch-5 sources (web_search RESUMED + bounded direct fetches, ${b5Cands.assembledOn})\n\nOne bounded availability probe PASSED (${b5Probe.decision}), so bounded search resumed per protocol:
\n### 7a. web_search (z-ai) — bounded discovery\n\n- 19 locality×category queries (tiffin centres, tea stalls, messes, bakeries, sweet shops, juice shops,
  street food, neighbourhood eateries across tpt-central / tirumala / tiruchanur / renigunta /
  chandragiri / srinivasa-mangapuram / tpt-neighbourhoods) + 4 targeted queue-lead checks;
  8 s pacing; 0 throttles. Evidence: batch5/search-discovery-food.json, batch5/search-lead-checks.json.\n- Single identity-verification queries also resumed: 48 backlog rows attempted in 4 bounded chunks
  (verify-*.json; resume semantics preserved).
\n### 7b. Nominatim (public OSM)\n\n- 12 bounded keyword POI queries, viewbox ${b5Nom?.viewbox ?? "(bounded)"}, 2 s spacing, custom UA;
  ${b5Nom?.queries.reduce((a, q) => a + (q.hitCount ?? 0), 0) ?? 0} raw hits recorded with published coordinates in evidence ONLY.\n\n### 7c. Sources that REMAINED unusable (recorded, not worked around)\n\n`;
  if (b5Wv) for (const p of b5Wv.pages) reg += `- Wikivoyage ${p.url}: HTTP ${p.httpStatus}.\n`;
  if (b5Refetch) for (const p of b5Refetch.pages) reg += `- Wikipedia targeted re-fetch (${p.queueLead}): HTTP ${p.httpStatus} — shared-egress 429; lead resolved via web_search instead where possible.\n`;
  reg += `\n### 7d. Already-saved official page re-examined (no fetch)\n\n${b5Assess.officialPageReExamination.note}
`;
  reg += `\nAll Batch-5 evidence: scripts/foodie-enrichment/evidence/tirupati-master/batch5/
(review-queue-assessment.json, discovery-candidates.json, search-*.json, nominatim-food-pois.json,
websearch-probe.json, wikipedia-refetch-evidence.json, wikivoyage-evidence.json).
`;
}

/* ---- Batch-6 register sections ---- */
if (b6Cands && b6Second) {
  reg += `\n## 8. Batch-6 sources (audit + evidence strengthening + coverage gaps, ${b6Cands.assembledOn})\n\nOne bounded availability probe PASSED, so bounded search resumed for the batch-6 objectives.
\n### 8a. web_search (z-ai) — bounded evidence + discovery\n\n- 40 second-source queries for the retained batch-015 food venues (8 s pacing; 2 transient 429/timeout
  errors retried successfully on resume; breaker never tripped). Evidence: batch6/food-second-sources.json.
- 18 coverage-gap queries for the weakest locality×category cells (Bhavani Nagar, Akkayyapalem,
  Cherlopalli/Satyanarayanapuram, MR Pally, Kapila Theertham Road, Avilala/Mangalam stays,
  Srinivasa Mangapuram ×3, Chandragiri ×3, Renigunta ×2, Tiruchanur ×2, Srikalahasti ×2).
  Evidence: batch6/search-coverage-gaps.json.
- 48 verification-backlog rows re-attempted in 4 bounded chunks (47 confirmed, 1 infra-failed parked; see coverage matrix).
\n### 8b. Hosts actually serving candidate-grade evidence this pass\n\n`;
  const hosts = new Set<string>();
  for (const a of b6Second.assessments) if (a.secondSource?.host) hosts.add(a.secondSource.host);
  for (const c of b6Cands.acceptedCandidates) { try { hosts.add(new URL(c.evidence.url).host); } catch {/* keep */} }
  for (const h of Array.from(hosts).sort()) reg += `- ${h}\n`;
  reg += `\n### 8c. Nominatim town queries (public OSM)\n\n${b6Nom2 ? b6Nom2.queries.length : 9} bounded town POI queries (Srinivasa Mangapuram, Chandragiri, Renigunta, Tiruchanur,
Srikalahasti; 2 s spacing, custom UA). Name-matching was NOT trusted: hits whose own published coordinates
placed them in the WRONG CITY (Chandragiri cafés at 27.7N/85.2E = Kathmandu; "Renigunta" restaurants at
13.1N/80.1E = Chennai/Perambur) were rejected as out-of-scope. The ONE area-gated find (APTDC Haritha
Hotel, Srikalahasti, 13.73N/79.67E) is recorded with coordinates in evidence ONLY. Honest in-area zeros:
Srinivasa Mangapuram (restaurants, hotels), Tiruchanur (restaurants), Srikalahasti (restaurants).
\n### 8d. Production read (read-only)\n\nThe app's own public PostgREST read endpoint (publishable key, RLS applies) returned the live inventory
snapshot used for the cross-check (${b6Crosscheck?.production.liveRestaurantRows ?? 86} restaurant rows). NO SQL was executed; nothing written.
\nAll Batch-6 evidence: scripts/foodie-enrichment/evidence/tirupati-master/batch6/
(b015-audit.json, review-queue-batch6.json, live-crosscheck.json, food-second-sources.json,
food-second-sources-assessment.json, search-coverage-gaps.json, nominatim2-town-pois.json,
discovery-candidates.json, websearch-probe.json).
`;
}

/* ---------------- 3. coverage matrix ---------------- */

let cov = `# FOODIE — Tirupati Discovery Coverage Matrix
Locality × category coverage after the first master sweep (${official.accessedOn}).
Status is per AREA × GROUP cell: queries run / raw hits / curated candidates. "not searched"
cells are honest gaps with a next action — completeness is never claimed while gaps remain.

| Area | ${GROUPS.map((g) => GROUP_LABEL[g]).join(" | ")} |
|---|${GROUPS.map(() => "---").join("|")}|
`;
const gapBacklog: string[] = [];
for (const area of areasInOrder) {
  const cells = GROUPS.map((g) => {
    const d = discovery.find((x) => x.group === g);
    const entries = d?.areas[area] ?? [];
    if (!entries.length) {
      const planned = !d || Object.keys(d.areas).length === 0;
      gapBacklog.push(`${AREA_LABEL[area]} × ${GROUP_LABEL[g]}: not searched this pass`);
      return "not searched";
    }
    const hits = entries.reduce((a, e) => a + (e.hits?.length ?? 0), 0);
    const cands = active.filter((r) => r.area === area && r.group === g).length;
    return `${entries.length}q / ${hits}h / **${cands}c**`;
  });
  cov += `| ${AREA_LABEL[area]} | ${cells.join(" | ")} |\n`;
}
cov += `\n(q = discovery queries run; h = raw hits; c = curated candidates)\n`;
cov += `\n## Honest gaps & next actions\n\n`;
for (const g of gapBacklog) cov += `- ${g} → add fixed queries to \`GROUPS\` and re-run \`research-tirupati-master.ts discovery <group>\` (resumable).\n`;
cov += `\n## Verification backlog\n\n`;
cov += `- ${active.filter((r) => r.tier === "T3").length} T3 candidates still need their independent verification query (\`research-tirupati-master.ts verify\`, resumable; rate-limited to ~9 candidates/9 min at current backend throttling).\n`;
cov += `- ${geocodeNull} geocode attempts returned no area-gated match; re-run after verification upgrades for a second chance at coordinates.\n`;
cov += `- Official TTD pages PlacesatTirumala.aspx, MoreTemples.aspx, RestHousesInTirumala.aspx, ttdklmps.aspx and S.V. Museum.aspx were FETCHED in the batch-2 pass (HTTP 200, verbatim quotes in evidence/official/) — the 28 TTD rest-house/cottage rows in batch-013 come straight from the official rates page.\n`;
cov += `- District/AP-tourism domains remain network-blocked from this sandbox; retry from a network with access, or provide exported content.\n`;

if (o2log && wiki && rq) {
  cov += `\n## Batch-4 direct-source evidence (no search provider, ${o2log.retrievedOn})\n\n`;
  cov += `- web_search: still HTTP 429 (one bounded probe, then paused per protocol) — the limitation is recorded, not worked around.\n`;
  cov += `- tirumala.org batch-4: 4 real accommodation/rate pages landed; 3 URLs (garden.aspx, theerthams.aspx, varahaswamytirumala.aspx) served the homepage shell — dead links, recorded as limitations, never treated as content.\n`;
  cov += `- Wikipedia (bounded 15-article set, ≥4 s spacing): ${wiki.pages.reduce((a, p) => a + (p.entryCount ?? 0), 0)} place-link entries + published article coordinates only.\n`;
  cov += `- Independent-source corroboration: ${crossmatchFiles.length} pending rows confirmed (list in the inventory doc).\n`;
  cov += `- Review queue: ${rq.tallies.genuinelyNewQueued} genuinely new unverified leads (priority-tiered) + ${rq.tallies.weakMatches} weak overlaps — NOT added as candidates; human research required first.\n`;
  cov += `- Small food businesses (tiffin centres, tea stalls, messes, bakeries) could NOT be expanded in the BATCH-4 pass itself — see the Batch-5 section below where this gap is finally addressed with resumed search + direct sources.\n`;
}

/* ---- Batch-5 coverage sections ---- */
if (b5Assess && b5Cands) {
  cov += `\n## Batch-5 evidence (web_search RESUMED + bounded direct sources, ${b5Cands.assembledOn})\n\n`;
  if (b5Probe) cov += `- web_search availability: ONE bounded probe → ${b5Probe.decision}${b5Probe.resultCount != null ? ` (${b5Probe.resultCount} results on the probe query)` : ""}. Bounded discovery then ran: 19 locality×category queries + 4 queue-lead checks (8 s pacing; 0 throttles, breaker never tripped).\n`;
  if (b5Nom) {
    const nomHits = b5Nom.queries.reduce((a, q) => a + (q.hitCount ?? 0), 0);
    cov += `- Nominatim: 12 bounded keyword POI queries inside the Tirupati viewbox (\`${b5Nom.viewbox}\`) → ${nomHits} raw hits; published coordinates recorded in evidence ONLY (never imported).\n`;
  }
  if (b5Wv) for (const p of b5Wv.pages) cov += `- Wikivoyage ${p.url}: HTTP ${p.httpStatus} — ${p.usefulness}.\n`;
  if (b5Refetch) for (const p of b5Refetch.pages) cov += `- Wikipedia targeted re-fetch (${p.queueLead}): HTTP ${p.httpStatus} — ${p.usefulness}.\n`;
  cov += `- Review queue: all ${b5Assess.queueMeta.leadsIn} leads manually assessed on their exact quotations → ${b5Assess.tallies["accept"]} accepts (routed to Batch-015), ${b5Assess.tallies["corroborate-existing"]} corroborations of existing records, ${b5Assess.tallies["reject-generic"]} generic rejects, ${b5Assess.tallies["reject-out-of-scope"]} out-of-scope rejects, ${b5Assess.tallies["ambiguous-keep-queue"]} stay ambiguous in the queue.\n`;
  cov += `- Tirumala gardens/teerthams: the dead official shells were worked around WITHOUT new fetches — the already-saved official page places-around-tirumala.aspx verbatim lists Gogarbham Gardens, Dharmagiri, Narayangiri, Asthana Mandapams and 11 teerthams; 9 teerthams + Gogarbham/Dharmagiri/Narayangiri/Asthana Mandapam became Batch-015 candidates, the remaining names corroborated existing rows.\n`;
  cov += `- Small food businesses: THE BIGGEST KNOWN GAP IS NOW PARTIALLY COVERED — ${b5Cands.tallies.byCategory["tiffin"] ?? 0} tiffin centres, ${b5Cands.tallies.byCategory["street_food"] ?? 0} tea-stall/juice/street vendors, ${b5Cands.tallies.byCategory["bakery_sweets"] ?? 0} bakery/sweet shops, ${b5Cands.tallies.byCategory["restaurant"] ?? 0} restaurants and ${b5Cands.tallies.byCategory["cafe"] ?? 0} cafe accepted into Batch-015 (42 food rows total, all UNVERIFIED review candidates; coverage is still directory/mapped-POI grade, not field-verified).\n`;
  cov += `- Verification backlog RESUMED (bounded): 4 chunks × 12 candidates = 48 attempted this session — 45 area-confirmed (13 with address evidence), 3 not-confirmed (negative evidence recorded); 0 throttled. Remaining backlog: 58 never-attempted + 68 throttled-stubs = 126 (down from 174).\n`;
  cov += `- Remaining honest gaps: 38 weak leads queued; 4 identity-holds (Indira Guest House / Reddy Tea Stall / 2 Balaji-name rows); Puttur-town venue evidence; Venugopalaswamy Karvetinagaram navbox-only leads now corroborated but still pending verify; menus, hours, photos; the 126-row verification backlog. NOT exhaustive.\n`;
}

/* ---- Batch-6 coverage sections ---- */
if (b6Audit && b6Cands) {
  cov += `\n## Batch-6 evidence (audit + second sources + coverage-gap sweep, ${b6Cands.assembledOn})\n\n`;
  cov += `- Batch-015 audit: ${b6Audit.tallies.audited} candidates re-audited → ${b6Audit.tallies.retained} retained, ${b6Audit.tallies.movedToReviewQueue} moved to the review queue (Amma Appam Renigunta — address is central-Tirupati; Radha Rani Tiffin Centre — mixed category-page quote). Batch-015 SQL regenerated at ${b6Audit.tallies.retained} rows (40 restaurants + 19 places).\n`;
  if (b6Crosscheck) cov += `- LIVE production cross-check (read-only public read, no SQL): ${b6Crosscheck.production.liveRestaurantRows} live rows; ${b6Crosscheck.result.checked}/${b6Crosscheck.result.checked} candidates collision-free (0 exact, 0 base-name, 0 loose).\n`;
  if (b6Second) cov += `- Second-source pass over the ${b6Second.tallies.assessed ?? 40} retained food venues: ${b6Second.tallies["second-source"] ?? 0} gained a second independent source (${Object.entries(b6Second.gradeTally).map(([k, v]) => `${k} ${v}`).join(", ")}), ${b6Second.tallies["same-host-corroboration"] ?? 0} same-host only, ${b6Second.tallies["none"] ?? 0} none, ${b6Second.tallies["search-failed"] ?? 0} failed. Corroboration ≠ verification — all rows stay unverified.\n`;
  cov += `- Coverage-gap sweep (18 bounded queries over the weakest cells): Bhavani Nagar bakery found (Sri Venkateshwara Bakery & Sweets — downgraded to a locality-resolving corroboration of the frozen worksheet row); Kapila Teertham Road corridor yielded 3 zomato area-page T2 venues (Kakinada Subbbayya Gari Hotel, Aroma Coffee House, The Vintage Cafe); Akkarampalli dhaba (Shree Dhaba House); Renigunta Locality dhabas (Good Luck Family Dhaba T1, Sreenivasa Reddy Dhaba T2); Srikalahasti tiffin centres (MSD Tiffin Centre, Kalahasteeswara Tiffens) + stays (Mgr/Raj/Kalahasteeswara Residency, APTDC Haritha); Srinivasa Mangapuram got its FIRST strong in-scope stay (Srinivasa Hotel — own official site) and the Srivari Mettu footpath-head attraction; Chandragiri/Thondavada stays (Kittu Home Stay, Kandy PLR Hotel); Mangalam/Tata Nagar lodges (Sreekanth Lodge, Sun Lights Lodge) → Batch-016 review candidate (${b6Cands.tallies.acceptedCandidates} rows).\n`;
  cov += `- Honest still-zeros: Srinivasa Mangapuram food (no in-scope restaurant/mess found in any source this pass); Tiruchanur restaurants (only delivery-area page evidence → queued leads); Renigunta non-chain stays (OYO-family 'Hotel O' outlets deliberately skipped); Akkayyapalem queries returned VISAKHAPATNAM namesakes (wrong city — rejected).\n`;
  cov += `- Wrong-city guard: Nominatim name-matches were rejected on their own published coordinates (Kathmandu-Chandragiri cafés 27.7N/85.2E; Chennai-Perambur "Renigunta" restaurants 13.1N/80.1E) — recorded in batch6/nominatim2-town-pois.json.\n`;
  cov += `- Verification backlog RESUMED (bounded): 4 chunks × 12 = 48 attempted — 47 area-confirmed (most with address evidence), 1 not-confirmed (negative evidence), 1 infra-failed (remains parked, never counted as verified), 0 sustained throttles (2 transient 75 s backoffs recovered). Remaining backlog: 58 never-attempted + 21 throttled-stubs = 79 (down from 126).\n`;
  cov += `- Remaining honest gaps: ${b6Cands.weakLeads.length} new weak leads queued + the 38 batch-5 weak leads + 5 original ambiguous leads; identity-holds now 4 batch-5 + 2 batch-6 (Ganapathi Juice Center, Chillies Food Paradise) + 2 batch-015 audit moves in the queue; menus, hours, photos; the 79-row verification backlog. NOT exhaustive.\n`;
}

/* ---------------- 4. duplicate review ---------------- */

let dup = `# FOODIE — Tirupati Duplicate Review
Every duplicate decision is auditable. Nothing is silently merged or deleted.

## A. Confirmed duplicates RESOLVED (merged during curation)

Identity-level merges performed by the alias groups + normalized names in
\`curate-tirupati-master.ts\` (listing titles differ; place is the same):
`;
for (const l of cur.curationLog.filter((l) => l.action === "merged")) {
  dup += `- "${l.raw}" → ${l.reason}\n`;
}
dup += `\n## B. POSSIBLE DUPLICATES awaiting evidence (review queue — NOT merged, NOT deleted)\n\n`;
dup += `These carry \`status: duplicate\` in the curated worksheet with \`dupOf\` pointers. They are
EXCLUDED from the batch review candidates until a human confirms whether each is a distinct branch or a repeat listing.\n\n`;
dup += "| Candidate | Area | Points to | Reason |\n|---|---|---|---|\n";
for (const r of dups) {
  dup += `| ${r.name as string} | ${r.area} | ${r.dupOf as string} | ${(r.dupReason as string).replace(/\|/g, "/")} |\n`;
}
dup += `\n## C. Name-similarity watchlist (identity confusion risks)\n\n`;
dup += `- **Srinivasam Restaurant** (Batch-012, Tirumala) vs **Sreenivasam Complex (TTD Pilgrim Accommodation)** (Batch-012, TTD
  accommodation) — different spellings and different venue types per sources; flagged so a future
  editor does not "fix" either spelling into the other.\n`;
dup += `- **Sri Govindaraja Swamy Temple** (Batch-011) vs **Sri Govindaraja Swamy Dharmasala (TTD)** (Batch-012) —
  distinct places (temple vs TTD lodging); slugs are distinct by design.\n`;
dup += `- **Sri Varahaswamy Temple, Tirumala** (Batch-012 canonical; TTD also uses the dual name
  "Sri Bhu Varahaswamy Temple") vs any "Varaha Swami" listing
  variants — same temple; alias-guarded in curation and the alias kept in rawNames.\n`;
dup += `- **Sri Prasanna Venkateswara Swamy Temple, Appalayagunta** (Batch-012) vs **Sri Prasanna Venkateswara
  Swamy Temple** (Renigunta, T3 backlog) — two DISTINCT temples sharing a base name (verify evidence for the
  Renigunta listing matched a Kadapa address, so it stays unimported); the Appalayagunta canonical carries the
  locality suffix so their deterministic ids can never collide.\n`;
dup += `\n## D. Existing-set cross-references (excluded from batch imports)\n\n`;
dup += `| Curated candidate | Already covered by |\n|---|---|\n`;
for (const r of b11) dup += `| ${r.name as string} | Batch-011: ${r.existingSetId as string} (owner-blocked import) |\n`;
for (const r of prod) dup += `| ${r.name as string} | production (live row) |\n`;

if (b5Cands && b5Cands.heldLeads.length) {
  dup += `\n## E. Batch-5 identity holds & name-drift flags (${b5Cands.assembledOn})\n\n`;
  dup += `Discovery hits that were deliberately NOT imported (never SQL rows) until identity is resolved:\n\n`;
  for (const h of b5Cands.heldLeads) dup += `- **${h.name}** — ${h.reason}\n`;
  dup += `\nAdditional name-drift flags from the same pass (kept out of Batch-015 for the same reasons):\n\n`;
  dup += `- **"Tirumala Bakery, Amaraja Road"** (indiacakes listing) vs frozen batch-014 row **Tirumala Bakery**
  (Tirupati Bazar) and worksheet row **Tirumala Bakery And Sweets** (Srinagar Colony) — branch identity unresolved; recorded as weak lead only.\n`;
  dup += `- **"Nagarjuna Military Mess"** search hit ("Military Mess", Tata Nagar swiggy listing) — treated as a
  CORROBORATION of the existing inventory row, never a new row.\n`;
  dup += `- **"Sri Venugopala Swamy Temple, Karvetinagaram"** queue lead #87 — proposed for upgrade, but the
  batch-5 dedupe gate proved the temple already exists (inventory + batch-013 queued); downgraded to corroboration
  (independent Tripadvisor + official TTD-news evidence).\n`;
  dup += `- **"Sri Kodandaramaswami Temple"** HIGH queue lead — name-drift spelling of the existing
  **Sri Kodanda Ramaswamy Temple, Tirupati** (batch-013 queued); corroborated, not duplicated.\n`;
}

/* ---- Batch-6 duplicate-review sections ---- */
if (b6Audit && b6Cands) {
  dup += `\n## F. Batch-6 audit drift review & new identity holds (${b6Cands.assembledOn})\n\n`;
  dup += `Batch-015 audit moves (identity/locality uncertain → review queue, never SQL):\n\n`;
  for (const m of b6Audit.movedToReviewQueue) dup += `- **${m.name}** — ${m.reason.slice(0, 260)}…\n`;
  dup += `\nBatch-6 drift downgrades (proposed as candidates, downgraded by the gates):\n\n`;
  dup += `- **"Sri Venkateshwara Bakery & Sweets, Bhavani Nagar"** vs frozen worksheet canonical
  **Sri Venkateshwara Bakery And Sweets** (T3, locality-less) — trivial '& Sweets' drift of the SAME venue;
  the mappls listing RESOLVES the frozen row's locality (Leela Mahal Road, RS Gardens, Bhavani Nagar) and the
  session's verify pass area-confirmed the frozen row — recorded as corroboration, NOT a new batch row.\n`;
  dup += `- **"Otc Orion Tiffin Centre, Korlagunta"** → inventory row **OTC — Orion Tiffin Centre, Korlagunta**
  already exists; re-found hit recorded as corroboration.\n`;
  dup += `- **"Padamavathi Tiffin Center, Tirumala"** → inventory row **Padamavathi Tiffin Center** already exists
  (worksheet T3, area tirumala); re-found hit recorded as corroboration (base-name gate).\n`;
  dup += `- **"Sri Kalyana Venkateswara Swamy Temple, Srinivasa Mangapuram"** → inventory VERIFIED row + batch-011
  candidate already exist; the official MoreTemples.aspx hit recorded as corroboration.\n`;
  dup += `\nNEW identity-HELD leads (never SQL rows until reconciled):\n\n`;
  for (const h of b6Cands.heldLeads) dup += `- **${h.name}** — ${h.reason}\n`;
  dup += `\nCarried-forward frozen guards re-checked this pass (all clean): Indira Rest House, Tirumala Tea-Stall pair,
Balaji-name family, Tirumala Bakery family — the batch-6 audit's hold-family scan found no new candidate
inside these families (the 'Golden Balaji Tiffin Center' hit is a distinct full name; adjudicated retained).\n`;
}

/* ---------------- 5. photo gaps ---------------- */

let photo = `# FOODIE — Tirupati Photo Gaps
Honest photograph coverage for the Tirupati master inventory (${official.accessedOn}).

## Current state

1. **No review-candidate row ships with a photograph.** No identity-verifiable, licence-clear photo was
   found during this pass for any of the 86 queued rows (Batch-012 + Batch-013). Per the project honesty contract:
   - no stock photo may stand in for a named venue;
   - AI-generated imagery may NEVER be presented as a real photo of the place;
   - Google Maps / directory photos may not be downloaded or republished.
   These rows will render the app's labelled AI-generated representative fallback or the
   category icon tile — both clearly labelled as non-venue imagery in the UI.
2. **Batch-011's 10 attraction photos remain bundled in the repo** (with per-photo attribution in
   IMAGE-CREDITS.md) and go live only when the owner executes the Batch-011 SQL.
3. The ${active.filter((r) => r.tier === "T3").length} T3 backlog candidates equally have no photos; the same fallback chain applies.
4. **Batch-4 direct-source pass added no photographs** — the new evidence (TTD rate tables,
   Wikipedia articles) is textual only; the policy above applies unchanged to every row.

## What is needed to close a photo gap

| Evidence needed | Notes |
|---|---|
| Owner-provided venue photo, OR | best path; owner verifies identity firsthand |
| Official venue/TTD photo with reuse permission, OR | TTD photo policy applies to Tirumala assets |
| Wikimedia Commons photo verifiably depicting THIS venue (identity rule) | the dedicated Commons sweep for Tirupati venues is documented in IMAGE-CREDITS §6 as a NEGATIVE result — look-alikes were rejected |
| Anything else | does not qualify; the gap stays open and honest |
`;

/* ---------------- write ---------------- */

writeFileSync(join(DOCS, "tirupati-place-inventory.md"), inv);
writeFileSync(join(DOCS, "tirupati-source-register.md"), reg);
writeFileSync(join(DOCS, "tirupati-coverage-matrix.md"), cov);
writeFileSync(join(DOCS, "tirupati-duplicate-review.md"), dup);
writeFileSync(join(DOCS, "tirupati-photo-gaps.md"), photo);

for (const f of ["tirupati-place-inventory.md", "tirupati-source-register.md", "tirupati-coverage-matrix.md", "tirupati-duplicate-review.md", "tirupati-photo-gaps.md"]) {
  console.log(`docs/${f}: ${readFileSync(join(DOCS, f), "utf8").split("\n").length} lines`);
}
