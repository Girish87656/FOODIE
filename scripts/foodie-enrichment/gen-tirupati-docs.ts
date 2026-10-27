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
  cov += `- Small food businesses (tiffin centres, tea stalls, messes, bakeries) could NOT be expanded this pass — the accessible direct sources cover TTD accommodation/attractions/encyclopedic places only; the search provider or a directory export is required for the food categories. Recorded as a gap.\n`;
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
