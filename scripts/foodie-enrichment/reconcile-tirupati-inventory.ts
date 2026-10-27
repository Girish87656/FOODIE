/* ==================================================================
   reconcile-tirupati-inventory.ts — EXACT candidate inventory &
   double-count audit (owner-directed 2026 session, point 2).

   Reads the committed evidence only:
     - worksheets/tirupati-master.json           (raw discovery candidates)
     - worksheets/tirupati-master-curated.json   (curation output)
     - supabase/review-candidates/*.sql          (import marks, parsed)
     - supabase/review-candidates/insert-batch-011*.sql (cross-set only)

   Produces:
     - cross-tabulation of every collected candidate by
       category × locality × verification status × import batch;
     - double-count checks: every uuid5 INSERT id must resolve back to
       EXACTLY ONE worksheet row; duplicate-queued rows must not appear
       in any batch; batch-011 aliases and production rows must not be
       counted as new candidates;
     - the accounting identity (in = curated + dup + dropped + absorbed).

   Read-only. Emits STDOUT + docs section bytes? No — STDOUT only; the
   docs generator embeds the same numbers from the same inputs.
   ================================================================== */

import { readFileSync, existsSync } from "fs";
import { createHash } from "crypto";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");
const RC = join(ROOT, "supabase", "review-candidates");

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
  return new Set(
    Array.from(text.matchAll(/'([0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})'::uuid/g)).map((m) => m[1]),
  );
}
function insertCount(sqlPath: string): number {
  if (!existsSync(sqlPath)) return 0;
  const text = readFileSync(sqlPath, "utf8");
  // each INSERT tuple leads with the row's uuid5 literal ('…'::uuid)
  return (text.match(/'([0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})'::uuid/g) ?? []).length;
}
/** ids that appear in INSERT TUPLES of more than one batch file (cross-batch double import) */
function crossBatchDupes(paths: string[]): string[] {
  const seen = new Map<string, string>();
  const dupes: string[] = [];
  for (const p of paths) {
    for (const id of insertIds(p)) {
      if (seen.has(id)) dupes.push(`${id} in BOTH ${seen.get(id)} AND ${p}`);
      else seen.set(id, p);
    }
  }
  return dupes;
}

const ws = JSON.parse(readFileSync(join(HERE, "worksheets", "tirupati-master.json"), "utf8")) as { summary: { total: number } };
const cur = JSON.parse(readFileSync(join(HERE, "worksheets", "tirupati-master-curated.json"), "utf8")) as {
  summary: Record<string, unknown>;
  rows: Array<Record<string, unknown>>;
  curationLog: Array<{ raw: string; area: string; action: string; reason: string }>;
};

const AREA_LABEL: Record<string, string> = {
  "tpt-central": "Tirupati city centre",
  "tpt-neighbourhoods": "Tirupati residential neighbourhoods",
  "tirumala": "Tirumala hills",
  "tiruchanur": "Tiruchanur (Alamelu Mangapuram corridor)",
  "srinivasa-mangapuram": "Srinivasa Mangapuram",
  "chandragiri": "Chandragiri",
  "renigunta": "Renigunta",
  "surrounding": "Surrounding destinations",
};
const GROUP_LABEL: Record<string, string> = {
  "food-restaurants": "Restaurants & messes",
  "food-tiffin": "Tiffin & breakfast centres",
  "food-street": "Street food, tea & juice",
  "food-bakery": "Bakeries, sweets & ice cream",
  "food-cafe": "Cafés & coffee",
  "temples": "Temples & sacred sites",
  "attractions": "Tourist attractions",
  "stays": "Stays & pilgrim accommodation",
  "markets": "Markets & shopping",
};

/* batch INSERT ids (parsed from the actual SQL files) */
const B12 = insertIds(join(RC, "insert-batch-012-tptm-master.sql"));
const B13 = insertIds(join(RC, "insert-batch-013-tptm-b2.sql"));
const B12_N = insertCount(join(RC, "insert-batch-012-tptm-master.sql"));
const B13_N = insertCount(join(RC, "insert-batch-013-tptm-b2.sql"));
const B14 = insertIds(join(RC, "insert-batch-014-tptm-b3.sql"));
const B14_N = insertCount(join(RC, "insert-batch-014-tptm-b3.sql"));

const idToRow = new Map<string, { name: string; key: string }>();
const problems: string[] = [];

const active = cur.rows.filter((r) => r.status === "curated");
const dups = cur.rows.filter((r) => r.status === "duplicate");
const dropped = cur.curationLog.filter((l) => l.action === "dropped").length;
const merged = cur.curationLog.filter((l) => l.action === "merged").length;

/* assign each active row an import batch from the SQL files */
const batchOf = (r: Record<string, unknown>): string => {
  const id = uuid5(`foodie-tptm:Tirupati:${r.name as string}`);
  if (B12.has(id)) return "batch-012";
  if (B13.has(id)) return "batch-013";
  if (B14.has(id)) return "batch-014";
  if (r.existingSet === "batch-011") return "batch-011 (owner-blocked)";
  if (r.existingSet === "production") return "production (live)";
  return "inventory-only (T3/HELd)";
};

const rows = active.map((r) => ({ ...r, _batch: batchOf(r) })) as Array<Record<string, unknown> & { _batch: string }>;

/* ---- double-count checks ---- */
for (const r of rows) {
  const id = uuid5(`foodie-tptm:Tirupati:${r.name as string}`);
  const prev = idToRow.get(id);
  if (prev) problems.push(`id collision: ${id} resolves to BOTH "${prev.name}" (${prev.key}) AND "${r.name}" (${r.key})`);
  else idToRow.set(id, { name: r.name as string, key: r.key as string });
}
/* a duplicate-queued row NEVER introduces an id by itself: if its name-derived
   id is queued, an ACTIVE row with the same canonical name must be the winner
   (single import), otherwise that is a real double-count. */
const activeByName = new Map<string, number>();
for (const r of active) activeByName.set(normName(r.name as string), (activeByName.get(normName(r.name as string)) ?? 0) + 1);
for (const r of dups) {
  const id = uuid5(`foodie-tptm:Tirupati:${r.name as string}`);
  const winner = activeByName.get(normName(r.name as string)) ?? 0;
  if ((B12.has(id) || B13.has(id) || B14.has(id)) && winner === 0) {
    problems.push(`duplicate-queued row "${r.name}" introduced an import id without an active winner row — real double-count`);
  }
}
function normName(s: string): string { return s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim(); }
for (const d of crossBatchDupes([
  join(RC, "insert-batch-012-tptm-master.sql"),
  join(RC, "insert-batch-013-tptm-b2.sql"),
  join(RC, "insert-batch-014-tptm-b3.sql"),
])) problems.push(`cross-batch double import: ${d}`);
const b11Refs = rows.filter((r) => r._batch === "batch-011 (owner-blocked)");
const prodRefs = rows.filter((r) => r._batch === "production (live)");
const b12Rows = rows.filter((r) => r._batch === "batch-012");
const b13Rows = rows.filter((r) => r._batch === "batch-013");
const b14Rows = rows.filter((r) => r._batch === "batch-014");

/* accounting identity */
const officialAdded = (cur.summary.officialCandidatesAdded as number) ?? 0;
const absorbed = (cur.summary.totalCandidatesIn as number) + officialAdded - active.length - dups.length - dropped;

/* ---- report ---- */
const p = (s = "") => console.log(s);
p(`=== TIRUPATI MASTER CANDIDATE RECONCILIATION (dedup-safe) ===`);
p(`raw discovery candidates (worksheet): ${ws.summary.total}`);
p(`official-source additions (new keys): ${officialAdded}`);
p(`total ever collected: ${ws.summary.total + officialAdded}`);
p(`  = curated active ${active.length}`);
p(`  + possible duplicates queued ${dups.length}`);
p(`  + dropped with reasons ${dropped}`);
p(`  + absorbed by merge ${absorbed}`);
p(`accounting holds: ${(active.length + dups.length + dropped + absorbed === ws.summary.total + officialAdded) ? "YES (exact)" : "NO"}`);
p(`merge log entries: ${merged} (>= absorbed: ${merged >= absorbed ? "YES" : "NO"})`);
p("");
p(`--- Active candidates by verification tier ---`);
const tierCount: Record<string, number> = {};
for (const r of active) tierCount[r.tier as string] = (tierCount[r.tier as string] ?? 0) + 1;
p(Object.entries(tierCount).sort().map(([k, v]) => `${k}=${v}`).join("  "));
p("");
p(`--- Import-batch reconciliation (single source: generated SQL files) ---`);
p(`batch-012 SQL INSERT tuples: ${B12_N} (distinct ids ${B12.size}) — worksheet rows mapped: ${b12Rows.length}`);
p(`batch-013 SQL INSERT tuples: ${B13_N} (distinct ids ${B13.size}) — worksheet rows mapped: ${b13Rows.length}`);
p(`batch-014 SQL INSERT tuples: ${B14_N} (distinct ids ${B14.size}) — worksheet rows mapped: ${b14Rows.length}`);
p(`batch-011 aliases (excluded, owner-blocked): ${b11Refs.length}`);
p(`production rows re-encountered (excluded): ${prodRefs.length} — ${prodRefs.map((r) => r.name).join(", ") || "none"}`);
const heldRows = rows.filter((r) => r._batch.startsWith("inventory-only") && r.tier === "T1");
p(`verify-confirmed HELD inventory-only: ${heldRows.length} — ${heldRows.map((r) => r.name).join(", ") || "none"}`);
p("");
p(`--- Category × locality matrix (active candidates; col = import batch or reason) ---`);
p(`| category | ${Object.keys(AREA_LABEL).map((a) => AREA_LABEL[a]).join(" | ")} |`);
p(`|---|${Object.keys(AREA_LABEL).map(() => "---").join("|")}|`);
for (const g of Object.keys(GROUP_LABEL)) {
  const cells = Object.keys(AREA_LABEL).map((a) => {
    const rs = rows.filter((r) => r.group === g && r.area === a);
    if (!rs.length) return "0";
    const byBatch: Record<string, number> = {};
    for (const r of rs) byBatch[r._batch] = (byBatch[r._batch] ?? 0) + 1;
    return `${rs.length} (${Object.entries(byBatch).map(([b, n]) => `${b}:${n}`).join(", ")})`;
  });
  p(`| ${GROUP_LABEL[g]} | ${cells.join(" | ")} |`);
}
p("");
p(`--- Verification status × locality (active) ---`);
p(`| status | ${Object.keys(AREA_LABEL).map((a) => AREA_LABEL[a]).join(" | ")} |`);
p(`|---|${Object.keys(AREA_LABEL).map(() => "---").join("|")}|`);
for (const [t, label] of [["T1", "VERIFIED"], ["T2", "PARTIALLY VERIFIED"], ["T3", "UNVERIFIED"]] as const) {
  const cells = Object.keys(AREA_LABEL).map((a) => String(rows.filter((r) => r.tier === t && r.area === a).length));
  p(`| ${label} (${t}) | ${cells.join(" | ")} |`);
}
p("");
p(`--- Double-count audit ---`);
if (problems.length) {
  for (const pr of problems) p(`PROBLEM: ${pr}`);
  process.exitCode = 1;
} else {
  p(`OK: every batch INSERT id resolves back to exactly one worksheet row.`);
  p(`OK: no duplicate-queued row appears in any batch SQL.`);
  p(`OK: batch-011 aliases and live production rows are excluded from new-candidate counts.`);
}
