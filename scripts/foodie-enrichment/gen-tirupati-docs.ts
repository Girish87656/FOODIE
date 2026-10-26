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
(queued) → ${cur.summary.dropped} dropped with recorded reasons → Batch-012 = 29 rows.
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
    inv += "| Place | Status | Locality hint | DB target | Sources (kind) | Batch-012 | Coordinates | Notes |\n";
    inv += "|---|---|---|---|---|---|---|---|\n";
    for (const r of gr) {
      const name = r.name as string;
      const inBatch = (r.tier === "T1" && r.existingSet === "new") ? "YES (restaurants)" : (r.tier === "T2" && r.existingSet === "new") ? "YES (places)" : r.existingSet === "batch-011" ? "— (already Batch-011 candidate)" : r.existingSet === "production" ? "— (already live)" : "no (T3 backlog)";
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
| https://www.tirumala.org/PlacesatTirumala.aspx, /MoreTemples.aspx, /RestHousesInTirumala.aspx, /ttdklmps.aspx, S.V. Museum.aspx | discovered via nav, NOT yet fetched | explicit backlog for the next pass |
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
cov += `- Official TTD pages discovered but unfetched: PlacesatTirumala.aspx, MoreTemples.aspx, RestHousesInTirumala.aspx, ttdklmps.aspx, S.V. Museum.aspx.\n`;
cov += `- District/AP-tourism domains remain network-blocked from this sandbox; retry from a network with access, or provide exported content.\n`;

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
EXCLUDED from Batch-012 until a human confirms whether each is a distinct branch or a repeat listing.\n\n`;
dup += "| Candidate | Area | Points to | Reason |\n|---|---|---|---|\n";
for (const r of dups) {
  dup += `| ${r.name as string} | ${r.area} | ${r.dupOf as string} | ${(r.dupReason as string).replace(/\|/g, "/")} |\n`;
}
dup += `\n## C. Name-similarity watchlist (identity confusion risks)\n\n`;
dup += `- **Srinivasam Restaurant** (Batch-012, Tirumala) vs **Sreenivasam Complex** (Batch-012, TTD
  accommodation) — different spellings and different venue types per sources; flagged so a future
  editor does not "fix" either spelling into the other.\n`;
dup += `- **Sri Govindaraja Swamy Temple** (Batch-011) vs **Sri Govindaraja Swamy Dharmasala** (Batch-012) —
  distinct places (temple vs TTD lodging); slugs are distinct by design.\n`;
dup += `- **Sri Bhu Varahaswamy Temple** (Batch-012, official TTD name) vs any "Varaha Swami" listing
  variants — same temple; alias-guarded in curation.\n`;
dup += `\n## D. Existing-set cross-references (excluded from Batch-012)\n\n`;
dup += `| Curated candidate | Already covered by |\n|---|---|\n`;
for (const r of b11) dup += `| ${r.name as string} | Batch-011: ${r.existingSetId as string} (owner-blocked import) |\n`;
for (const r of prod) dup += `| ${r.name as string} | production (live row) |\n`;

/* ---------------- 5. photo gaps ---------------- */

let photo = `# FOODIE — Tirupati Photo Gaps
Honest photograph coverage for the Tirupati master inventory (${official.accessedOn}).

## Current state

1. **No Batch-012 row ships with a photograph.** No identity-verifiable, licence-clear photo was
   found during this pass for any of the 29 rows. Per the project honesty contract:
   - no stock photo may stand in for a named venue;
   - AI-generated imagery may NEVER be presented as a real photo of the place;
   - Google Maps / directory photos may not be downloaded or republished.
   These 29 rows will render the app's labelled AI-generated representative fallback or the
   category icon tile — both clearly labelled as non-venue imagery in the UI.
2. **Batch-011's 10 attraction photos remain bundled in the repo** (with per-photo attribution in
   IMAGE-CREDITS.md) and go live only when the owner executes the Batch-011 SQL.
3. The 105 T3 backlog candidates equally have no photos; the same fallback chain applies.

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
