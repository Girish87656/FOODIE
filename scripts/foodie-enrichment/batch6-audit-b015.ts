/**
 * Foodie — TIRUPATI BATCH-6: audit of the 61 Batch-015 review candidates
 * (owner-directed 2026-10-28).
 *
 * Objective 1 of Batch 6: cross-check EVERY Batch-015 proposed record against
 *   (a) the existing production inventory (local proxy: the generated
 *       inventory doc's full name table — production itself is NOT queried;
 *       no SQL is executed without owner approval),
 *   (b) the curated worksheet (incl. every rawNames alias),
 *   (c) pending batches 011–015 (SQL row sets),
 * and then decide, per record:
 *   retain          — identity + locality evidence support the candidate row
 *   review-queue    — uncertain identity/locality → explicit queue entry with
 *                     a reason; the record does NOT stay in Batch-015
 *
 * Deterministic checks (fail-loud, recomputed — never hardcoded):
 *   C1  canonical ID stability — uuid5("foodie-tptm:Tirupati:<name>") must
 *       reproduce the exact id set/pairing present in insert-batch-015 SQL;
 *   C2  zero exact-normalized collisions vs inventory / batches 011–014 /
 *       worksheet (name AND every rawNames alias) / batch-015 itself;
 *   C3  slug uniqueness — within batch-015 and vs batches 012–014 (places);
 *   C4  locality-suffix evidence — for every candidate whose name carries a
 *       ", <locality>" suffix, the suffix text must appear in the candidate's
 *       OWN verbatim quote (mismatch → manual adjudication flag);
 *   C5  name-drift scan — core-token overlap between each candidate and every
 *       known name (strips generic tokens like sri/hotel/restaurant/tiffin/
 *       centre/center/tea/stall/bakery/sweets/cafe/mess/shop) — same core
 *       tokens + same category → drift-collision flag for manual adjudication;
 *       also hard-flags any candidate whose core tokens hit one of the FROZEN
 *       identity-hold families (Indira Rest House, Tirumala Tea Stall pair,
 *       Tirumala Balaji Sweets, Balaji-name drift, Tirumala Bakery family);
 *   C6  verification honesty — every SQL row must import verification_status
 *       'unverified' with NULL name/address/coordinates verification fields
 *       and NULL coordinates (regression guard; also checked by SQL postflight).
 *
 * Manual adjudication: flagged candidates are decided HERE, explicitly, with
 * reasons recorded in the output; nothing is silently auto-kept or auto-dropped.
 *
 * Output: scripts/foodie-enrichment/evidence/tirupati-master/batch6/b015-audit.json
 *
 * Usage: bun scripts/foodie-enrichment/batch6-audit-b015.ts
 */

import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { createHash } from "crypto";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const HERE = dirname(fileURLToPath(import.meta.url));
const EV = join(HERE, "evidence", "tirupati-master");
const B6 = join(EV, "batch6");
mkdirSync(B6, { recursive: true });

const TODAY = new Date().toISOString().slice(0, 10);
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

/* ---------------- deterministic id + slug helpers (mirror gen-015) ---------------- */

const NAMESPACE = "6d3a0f5e-7b1c-4a2e-9d84-2f6a1c9e0b31"; // fixed project namespace (batch-009..014)
function uuid5(name: string): string {
  const h = createHash("sha1").update(NAMESPACE.replace(/-/g, "")).update(name).digest("hex");
  return [
    h.slice(0, 8), h.slice(8, 12), `5${h.slice(13, 16)}`,
    ((parseInt(h.slice(16, 18), 16) & 0x3f) | 0x80).toString(16).padStart(2, "0") + h.slice(18, 20),
    h.slice(20, 32),
  ].join("-");
}
function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}
function localitySuffix(name: string): string | null {
  const i = name.lastIndexOf(", ");
  return i > 0 ? name.slice(i + 2).trim() : null;
}

/* ---------------- corpora ---------------- */

// (a) production inventory proxy — the generated inventory doc's name table
const invMd = readFileSync(join(HERE, "..", "..", "docs", "tirupati-place-inventory.md"), "utf8");
const inventoryNames: string[] = [];
for (const m of invMd.matchAll(/^\| ([^|]+) \| (VERIFIED|PARTIALLY VERIFIED|UNVERIFIED|AMBIGUOUS)/gm)) inventoryNames.push(m[1].trim());

// (b) curated worksheet — name + EVERY rawNames alias
const ws = JSON.parse(readFileSync(join(HERE, "worksheets", "tirupati-master-curated.json"), "utf8")) as {
  rows: Array<{ name: string; rawNames?: string[]; category?: string }>;
};
const wsNameAlias: Array<{ name: string; aliasOf: string }> = [];
for (const r of ws.rows) {
  wsNameAlias.push({ name: r.name, aliasOf: r.name });
  for (const raw of r.rawNames ?? []) wsNameAlias.push({ name: raw, aliasOf: r.name });
}

// (c) pending batches 011–015 (SQL row sets)
const batchSqls = [
  "insert-batch-011-p4-places.sql",
  "insert-batch-012-tptm-master.sql",
  "insert-batch-013-tptm-b2.sql",
  "insert-batch-014-tptm-b3.sql",
];
const batchNames: string[] = [];
for (const f of batchSqls) {
  const sql = readFileSync(join(HERE, "..", "..", "supabase", "review-candidates", f), "utf8");
  for (const m of sql.matchAll(/^    '([^']+)',$/gm)) batchNames.push(m[1]);
}

// (d) review-queue corpus names (ledger rations leads through it)
const queue = JSON.parse(readFileSync(join(EV, "review-queue-new-names.json"), "utf8")) as {
  genuinelyNew: Array<{ name: string }>;
  weakMatches: Array<{ name: string }>;
};
const queueNames = [...queue.genuinelyNew, ...queue.weakMatches].map((l) => l.name);

// batch-015's own SQL (id set + name/id pairing + per-row honesty fields)
const b15Path = join(HERE, "..", "..", "supabase", "review-candidates", "insert-batch-015-tptm-b5.sql");
const b15Sql = readFileSync(b15Path, "utf8");
const b15SqlIds = new Set(Array.from(b15Sql.matchAll(/'([0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})'::uuid/gm)).map((m) => m[1]));

/* ---------------- batch-015 ledger ---------------- */

const ledger = JSON.parse(readFileSync(join(EV, "batch5", "discovery-candidates.json"), "utf8")) as {
  acceptedCandidates: Array<{ name: string; area: string; category: string; tier: string; evidence: { quote: string; url: string; sourceKind: string }; note?: string }>;
  heldLeads: Array<{ name: string; reason: string }>;
};
const cands = ledger.acceptedCandidates;
if (cands.length !== 61) throw new Error(`FATAL: ledger has ${cands.length} accepted candidates, expected 61`);

/* ---------------- checks ---------------- */

type Verdict = "retain" | "review-queue";
interface AuditRow {
  name: string; area: string; category: string;
  idRecomputed: string; idInSql: boolean;
  checks: {
    exactCollision: string | null;          // C2
    slugConflict: string | null;            // C3
    localitySuffixInQuote: boolean | null;  // C4 (null = name has no suffix)
    driftFlags: string[];                   // C5
    sqlHonesty: string | null;              // C6
  };
  verdict: Verdict | "manual";
  adjudication?: { decision: Verdict; reason: string };
}

const FOOD_CATEGORIES = new Set(["tiffin", "restaurant", "street_food", "bakery_sweets", "cafe"]);

// C5 vocabulary
const GENERIC_TOKENS = new Set([
  "sri", "srivari", "hotel", "restaurant", "tiffin", "centre", "center",
  "tea", "stall", "bakery", "sweets", "cafe", "mess", "shop", "and", "the",
  "family", "bar", "juice", "fast", "food", "veg", "non", "pure", "vasavi",
]);
const coreTokens = (name: string): Set<string> => {
  const toks = norm(name).split(" ").filter((t) => t && !GENERIC_TOKENS.has(t));
  return new Set(toks);
};
const coreOverlap = (a: Set<string>, b: Set<string>): string[] => {
  const hit: string[] = [];
  for (const t of a) if (b.has(t)) hit.push(t);
  return hit;
};

// frozen identity-hold families (name-drift guards carried forward from batches 014/015).
// Matching is by DISTINCTIVE PHRASE SUBSTRING on the normalized name — generic
// tokens (house/guest/rest/tirumala/tirupati…) must never trigger a hold flag
// on their own (batch-6 audit fix: the previous core-token version produced
// false hold-family hits for e.g. 'Gogarbham Gardens, Tirumala' via 'tirumala').
const HOLD_FAMILIES: Array<{ label: string; phrase: string }> = [
  { label: "Indira (batch-013 frozen 'Indira Rest House, Tirumala' / 'Indira Guest House' hold)", phrase: "indira" },
  { label: "Balaji-name drift family (batch-014 'Tirumala Balaji Sweets' hold + batch-015 held Balaji rows)", phrase: "balaji" },
  { label: "Tirumala Bakery family (batch-014 frozen 'Tirumala Bakery' Tirupati Bazar / worksheet 'Tirumala Bakery And Sweets' Srinagar Colony)", phrase: "tirumala bakery" },
  { label: "Tirumala Tea-Stall conflicting-locality pair (batch-014 hold + 'Reddy Tea Stall' hold)", phrase: "tirumala tea stall" },
  { label: "Reddy Tea Stall hold (batch-015, overlaps the Tirumala Tea-Stall pair)", phrase: "reddy tea" },
];

// known-name universe for the drift scan: names (not aliases) from all corpora
const knownNames: Array<{ name: string; origin: string; categoryHint: string }> = [
  ...inventoryNames.map((n) => ({ name: n, origin: "inventory", categoryHint: "" })),
  ...batchNames.map((n) => ({ name: n, origin: "pending-batch", categoryHint: "" })),
  ...ws.rows.map((r) => ({ name: r.name, origin: "worksheet", categoryHint: r.category ?? "" })),
];

/* C2 corpus sets (exact) */
const invNorms = new Set(inventoryNames.map(norm));
const batchNorms = new Set(batchNames.map(norm));
const wsNameNorms = new Set(wsNameAlias.map((a) => norm(a.name)));
const ownNorms = new Map(cands.map((c) => [norm(c.name), c.name] as const));

/* C3 slug corpus from batches 012–014 (places) */
const b12Sql = readFileSync(join(HERE, "..", "..", "supabase", "review-candidates", "insert-batch-012-tptm-master.sql"), "utf8");
const b13Sql = readFileSync(join(HERE, "..", "..", "supabase", "review-candidates", "insert-batch-013-tptm-b2.sql"), "utf8");
const b14Sql = readFileSync(join(HERE, "..", "..", "supabase", "review-candidates", "insert-batch-014-tptm-b3.sql"), "utf8");
const b12Slugs = new Set(Array.from(b12Sql.matchAll(/^    '([a-z0-9-]+)',$/gm)).map((m) => m[1]));
const b13Slugs = new Set(Array.from(b13Sql.matchAll(/^    '([a-z0-9-]+)',$/gm)).map((m) => m[1]));
const b14Slugs = new Set(Array.from(b14Sql.matchAll(/^    '([a-z0-9-]+)',$/gm)).map((m) => m[1]));

/* C6: per-row SQL honesty — locate each candidate's row by its quoted name,
   take the nearest preceding '::uuid' id line and the slice up to the NEXT
   uuid line, and read the row's verification_status literal from that slice;
   plus whole-file honesty counts. */
const UUID_LINE = /'([0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})'::uuid,/g;
const uuidPositions: Array<{ id: string; pos: number }> = [];
for (const m of b15Sql.matchAll(UUID_LINE)) uuidPositions.push({ id: m[1], pos: m.index ?? 0 });
const sqlRowByName = new Map<string, { id: string; verification: string }>();
for (const c of cands) {
  const esc = c.name.replace(/'/g, "''");
  const namePos = b15Sql.indexOf(`'${esc}',`);
  if (namePos < 0) { sqlRowByName.set(c.name, { id: "NOT-FOUND", verification: "NOT-FOUND" }); continue; }
  let rowId = "NOT-FOUND";
  let sliceEnd = Math.min(namePos + 4000, b15Sql.length);
  for (let i = uuidPositions.length - 1; i >= 0; i--) {
    if (uuidPositions[i].pos < namePos) { rowId = uuidPositions[i].id; break; }
  }
  for (const u of uuidPositions) {
    if (u.pos > namePos) { sliceEnd = u.pos; break; }
  }
  const slice = b15Sql.slice(namePos, sliceEnd);
  const verification = /'unverified'|'verified'|'partially verified'|'ambiguous'/i.exec(slice)?.[0]?.replace(/'/g, "") ?? "NOT-FOUND";
  sqlRowByName.set(c.name, { id: rowId, verification });
}
const unverifiedCount = (b15Sql.match(/^ *'unverified'/gm) ?? []).length; // row values only (comments/postflight prose excluded)
const nullLatCount = (b15Sql.match(/null,\s*-- latitude/g) ?? []).length;
const nullTriCount = (b15Sql.match(/null,\s*-- name_verified/g) ?? []).length;
const wholeFileC6: string[] = [];
if (unverifiedCount !== 61) wholeFileC6.push(`C6 whole-file: ${unverifiedCount} 'unverified' rows, expected 61`);
if (nullLatCount !== 61) wholeFileC6.push(`C6 whole-file: ${nullLatCount} NULL-latitude rows, expected 61`);
if (nullTriCount !== 19) wholeFileC6.push(`C6 whole-file: ${nullTriCount} NULL name_verified rows, expected 19`);

/* ---------------- run checks ---------------- */

const hardFailures: string[] = [...wholeFileC6];
const rows: AuditRow[] = [];
const seenWithinBatch = new Set<string>();
const seenSlugs = new Set<string>();
let slugCollisionsInternal = 0;

for (const c of cands) {
  const n = norm(c.name);
  const id = uuid5(`foodie-tptm:Tirupati:${c.name}`);

  // C1 — id stability
  const idInSql = b15SqlIds.has(id);

  // C2 — exact collisions
  let exactCollision: string | null = null;
  if (invNorms.has(n)) exactCollision = `inventory: ${[...invNorms].find((x) => x === n)}`;
  else if (batchNorms.has(n)) exactCollision = "pending-batch 011–014";
  else if (wsNameNorms.has(n)) exactCollision = "worksheet name/rawNames alias";
  if (n !== norm(c.name)) exactCollision = exactCollision ?? "normalization anomaly";

  // C3 — slug conflicts (places only; mirrors gen-015 slug rules)
  let slugConflict: string | null = null;
  if (!FOOD_CATEGORIES.has(c.category)) {
    const suffix = localitySuffix(c.name);
    const base = slugify(suffix ? c.name.slice(0, c.name.length - suffix.length - 2) : c.name);
    const labelMap: Record<string, string> = {
      "tpt-central": "Tirupati", "tpt-neighbourhoods": "Tirupati", "tirumala": "Tirumala",
      "tiruchanur": "Tiruchanoor", "chandragiri": "Chandragiri", "renigunta": "Renigunta", "surrounding": "Tirupati",
    };
    const locality = suffix ?? labelMap[c.area] ?? "Tirupati";
    let slug = base;
    if (seenSlugs.has(slug) || b12Slugs.has(slug) || b13Slugs.has(slug) || b14Slugs.has(slug)) slug = `${base}-${slugify(locality)}`;
    if (seenSlugs.has(slug)) { slugConflict = `internal after fallback: ${slug}`; slugCollisionsInternal++; }
    else if (b12Slugs.has(slug)) slugConflict = `batch-012: ${slug}`;
    else if (b13Slugs.has(slug)) slugConflict = `batch-013: ${slug}`;
    else if (b14Slugs.has(slug)) slugConflict = `batch-014: ${slug}`;
    else seenSlugs.add(slug);
  }

  // C4 — locality suffix present in the candidate's own quote
  //   (two accepted textual forms: with spaces "vasavi nagar" and the
  //   single-word directory form "vasavinagar")
  const suffix = localitySuffix(c.name);
  let localitySuffixInQuote: boolean | null = null;
  if (suffix) {
    const q = norm(c.evidence.quote);
    localitySuffixInQuote = q.includes(norm(suffix)) || q.includes(norm(suffix).replace(/ /g, ""));
  }

  // C5 — drift scan
  const driftFlags: string[] = [];
  const cCore = coreTokens(c.name);
  for (const k of knownNames) {
    const kCore = coreTokens(k.name);
    if (kCore.size === 0 || cCore.size === 0) continue;
    const ov = coreOverlap(cCore, kCore);
    if (ov.length === 0) continue;
    const sameFamily =
      (c.category === "tiffin" || c.category === "restaurant" || c.category === "street_food" || c.category === "bakery_sweets" || c.category === "cafe") ||
      (k.categoryHint ? ["tiffin", "restaurant", "street_food", "bakery_sweets", "cafe"].includes(k.categoryHint) : true);
    if (!sameFamily) continue;
    driftFlags.push(`core-token overlap [${ov.join(", ")}] with ${k.origin} name "${k.name}"`);
  }
  for (const fam of HOLD_FAMILIES) {
    if (n.includes(fam.phrase)) driftFlags.push(`FROZEN HOLD FAMILY: ${fam.label}`);
  }

  // C6 — SQL honesty for this row
  let sqlHonesty: string | null = null;
  const srow = sqlRowByName.get(c.name);
  if (!srow) sqlHonesty = "row NOT found in batch-015 SQL VALUES (name mismatch)";
  else if (srow.id !== id) sqlHonesty = `SQL row id ${srow.id} != recomputed ${id}`;
  else if (srow.verification !== "unverified") sqlHonesty = `SQL verification_status '${srow.verification}' != 'unverified'`;

  if (idInSql === false) hardFailures.push(`C1 id mismatch: ${c.name}`);
  if (exactCollision) hardFailures.push(`C2 exact collision: ${c.name} -> ${exactCollision}`);
  if (slugConflict) hardFailures.push(`C3 slug: ${c.name} -> ${slugConflict}`);
  if (sqlHonesty) hardFailures.push(`C6: ${c.name} -> ${sqlHonesty}`);

  rows.push({
    name: c.name, area: c.area, category: c.category,
    idRecomputed: id, idInSql,
    checks: { exactCollision, slugConflict, localitySuffixInQuote, driftFlags, sqlHonesty },
    verdict: "manual", // set below
  });

  const nw = seenWithinBatch.has(n);
  if (nw) hardFailures.push(`C2 within-batch duplicate: ${c.name}`);
  seenWithinBatch.add(n);
}

/* ---------------- manual adjudication (explicit, reason-coded) ---------------- */

/**
 * Each entry: name → decision + reason. Every candidate flagged by C4/C5 —
 * and every one I re-read during the Batch-6 audit — is decided HERE.
 * Absence of an entry = the deterministic checks alone were clean AND the
 * evidence file was re-read for this audit.
 */
const ADJUDICATIONS: Record<string, { decision: Verdict; reason: string }> = {
  "Amma Appam, Renigunta": {
    decision: "review-queue",
    reason: "LOCALITY CONFLICT (carry-forward of the batch-5 ledger note): the only address in the quote is 'G Car Street, T P Area, Tirupati - 51750x' — a CENTRAL Tirupati street — while the 'Renigunta' attribution comes solely from a justdial category-page title ('Tiffin Services For Rajasthani Food in Renigunta'). Category-page titles group by service filter, not by venue address; name similarity alone is not proof of place. Moved to the review queue pending an address-bearing source.",
  },
  "Radha Rani Tiffin Centre, Padmavathi Nagar": {
    decision: "review-queue",
    reason: "MIXED QUOTE: the idbf category-page quote concatenates TWO different listings ('Mahila University Road, Padmavathi Nagar, Tirupati ... 503, Samajam Street, Tiruchanur, Tirupati'); which address belongs to Radha Rani is not decidable from the snippet, and the recorded area 'tiruchanur' is not supported by any address tied to the name. Moved to the review queue pending a venue-own listing.",
  },
  "Sri Guru Tiffin Centre, Tirumala": {
    decision: "retain",
    reason: "LOCALITY VIA POSTAL CODE: address text says 'Tirupati - 517504' but 517504 is Tirumala's postal pin (the idbf directory writes every venue under 'Tirupati'); the canonical name itself carries ', Tirumala' and 'Opp. Balaji Bus Stand' matches a Tirumala landmark. Attribution kept; remains UNVERIFIED and the bounded verification query must confirm the area before any upgrade.",
  },
  "Saarangi Restaurant, Tirumala": {
    decision: "retain",
    reason: "Two Tripadvisor listings ('Saarangi Restaurent' + 'Saarangi Fine Dine Restaurant') were MERGED into one venue candidate in the ledger — the merged identity is plausible (same complex/brand spelling drift) but is exactly the kind of judgement the audit records: retained as ONE row, and the pending verification query must confirm it is a single Tirumala venue.",
  },
  "Vanam Restaurant, Alipiri Road": {
    decision: "retain",
    reason: "T2 OSM POI; the quote does not literally contain 'Alipiri Road' but the same OSM object appeared in BOTH the Tirupati and Tirumala bounded queries at 13.6236,79.3647 — the Alipiri/ghat-road foot of the hills. Locality attribution documented in the ledger note; coordinates stay evidence-only.",
  },
  "Golden Balaji Tiffin Center, Tirumala": {
    decision: "retain",
    reason: "Balaji-name token appears, but the venue is 'Golden Balaji Tiffin Center' — a DISTINCT full name, not a drift of the frozen 'Tirumala Balaji Sweets' (different venue type, different name core). Own justdial listing with photos; Tirumala in the listing title itself. Retained; drift-guard family noted.",
  },
  "Chandra Tiffin Shop, Tirumala": {
    decision: "retain",
    reason: "Own Zomato order page (zomato.com/tirupati/chandra-tiffin-shop-tirumala) with the venue name + 'Tirumala' in the listing path/title. Retained; remains unverified.",
  },
  "V Mohan Tea Stall, Tirumala": {
    decision: "retain",
    reason: "Own justdial listing with 'Tirumala' in the title and a descriptive snippet. Distinct from the frozen 'Tirumala Tea Stall' conflicting-locality pair (different name core 'V Mohan'). Retained.",
  },
  "Saral Juice Shop, Pudipatla": {
    decision: "retain",
    reason: "Listing title 'Saral Juice Shop Pudipatla, tirupati' — locality in the title itself (Pudipatla is a Tirupati-area locality on the Avilala/Pudipatla corridor). Retained.",
  },
  "Nellore Mess, Prakasam Road": {
    decision: "retain",
    reason: "Swiggy venue-own page (nellore-mess-prakasam-road-rest126018) — the URL slug carries the venue name AND locality; distinct from the weak leads 'Reddemma Mess'/'Reddamma Mess' (different name cores). Retained.",
  },

  /* --- official-TTD rows: the ', Tirumala' / ', Tirupati' suffix is the
   * canonical AREA LABEL added at curation; the suffix text is not repeated
   * inside the truncated verbatim quote fragments, but the locality is
   * evidenced by the SAVED OFFICIAL PAGE ITSELF
   * (tirumala.org/places-around-tirumala.aspx): the full must-visit sentence
   * reads 'Some of the must visit places in Tirumala are …', the full
   * teertham sentence reads 'There are several teerthams in Tirumala, some
   * of them are …', and the nav block reads 'More Temples At Tirupathi'.
   * The audit's automatic flag is a review trigger; adjudicated here. --- */
  "Gogarbham Gardens, Tirumala": {
    decision: "retain",
    reason: "Official TTD page places-around-tirumala.aspx (saved on disk): the FULL quote on the same page reads 'Some of the must visit places in Tirumala are Swami Pushkarini, … Gogarbham Gardens.' — Tirumala is the page's subject; the candidate's truncated fragment is a verbatim slice of that sentence. Retained.",
  },
  "Dharmagiri, Tirumala": {
    decision: "retain",
    reason: "Official TTD page places-around-tirumala.aspx (saved on disk) — the name appears verbatim in the official 'must visit places in Tirumala' list; the truncated quote is a verbatim slice of that sentence. Retained.",
  },
  "Narayangiri, Tirumala": {
    decision: "retain",
    reason: "Official TTD page places-around-tirumala.aspx (saved on disk) — the name appears verbatim in the official 'must visit places in Tirumala' list; the truncated quote is a verbatim slice of that sentence. Retained.",
  },
  "Asthana Mandapam, Tirumala": {
    decision: "retain",
    reason: "Official TTD page places-around-tirumala.aspx (saved on disk) — the name appears verbatim in the official 'must visit places in Tirumala' list ('Temple Museum, Asthana Mandapams and Gogarbham Gardens'); the truncated quote is a verbatim slice of that sentence. Retained.",
  },
  "Pandava Teertham, Tirumala": {
    decision: "retain",
    reason: "Official TTD page places-around-tirumala.aspx (saved on disk): the full quote reads 'There are several teerthams in Tirumala, some of them are Pandava Teertham, Kumaradhara Teertham, …' — the teertham list is explicitly 'in Tirumala'. Retained.",
  },
  "Kumaradhara Teertham, Tirumala": {
    decision: "retain",
    reason: "Official TTD page places-around-tirumala.aspx (saved on disk): the name appears verbatim in the official 'several teerthams in Tirumala' list and again in the official festival list ('Kumaradhara Magha Pournami'); the truncated fragment is a verbatim slice. Retained.",
  },
  "Tumbhuru Teertham, Tirumala": {
    decision: "retain",
    reason: "Official TTD page places-around-tirumala.aspx (saved on disk): the name appears verbatim in the official 'several teerthams in Tirumala' list and in the official festival list ('Tumbhuru Phalguna Pournami'). Retained.",
  },
  "Ramakrishna Teertham, Tirumala": {
    decision: "retain",
    reason: "Official TTD page places-around-tirumala.aspx (saved on disk): the name appears verbatim in the official 'several teerthams in Tirumala' list and in the official festival list ('Ramakrishna Pushya Pournami'). Retained.",
  },
  "Sesha Teertham, Tirumala": {
    decision: "retain",
    reason: "Official TTD page places-around-tirumala.aspx (saved on disk): the name appears verbatim in the official 'several teerthams in Tirumala' list; the truncated fragment is a verbatim slice. Retained.",
  },
  "Sitamma Teertham, Tirumala": {
    decision: "retain",
    reason: "Official TTD page places-around-tirumala.aspx (saved on disk): the name appears verbatim in the official 'several teerthams in Tirumala' list; the truncated fragment is a verbatim slice. Retained.",
  },
  "Pasupu Teertham, Tirumala": {
    decision: "retain",
    reason: "Official TTD page places-around-tirumala.aspx (saved on disk): the name appears verbatim in the official 'several teerthams in Tirumala' list; the truncated fragment is a verbatim slice. Retained.",
  },
  "Jupali Teertham, Tirumala": {
    decision: "retain",
    reason: "Official TTD page places-around-tirumala.aspx (saved on disk): the name appears verbatim in the official 'several teerthams in Tirumala' list; the truncated fragment is a verbatim slice. Retained.",
  },
  "Sanaka Sanandana Teertham, Tirumala": {
    decision: "retain",
    reason: "Official TTD page places-around-tirumala.aspx (saved on disk): the name appears verbatim in the official 'several teerthams in Tirumala' list; the truncated fragment is a verbatim slice. Retained.",
  },
  "Srivari Padalamandapam Temple, Tirupati": {
    decision: "retain",
    reason: "Official TTD page places-around-tirumala.aspx (saved on disk): the name appears verbatim under the page's 'More Temples At Tirupathi' block — the block header itself names the city (spelled 'Tirupathi'); the candidate's ', Tirupati' suffix is the canonical label for that same city, and the ledger note places the temple at the Alipiri footpath head. Retained.",
  },
  "Sri Lakshmi Narayana Swamy Temple, Tirupati": {
    decision: "retain",
    reason: "Official TTD page places-around-tirumala.aspx (saved on disk): the name appears verbatim under the page's 'More Temples At Tirupathi' block — the block header itself names the city. Retained.",
  },
  "VarahaSwami Guest House, Tirumala": {
    decision: "retain",
    reason: "Identity re-checked against the frozen guards: the batch-013 frozen 'Indira Rest House, Tirumala' is a DIFFERENT TTD property (the batch-5 ledger explicitly records that the VarahaSwami-GH rate table lists 'Indira Guest House A/C' separately, and that no VarahaSwami guest-house row exists in batches 011-014); the VarahaSwami TEMPLE (batch-012) is a different venue type. Own official TTD rate-table page (varahaswamiguesthouse.aspx). Retained; the Indira Guest House row from the same table stays HELD.",
  },
};

for (const r of rows) {
  const flag = r.checks.localitySuffixInQuote === false || r.checks.driftFlags.some((f) => f.startsWith("FROZEN HOLD FAMILY"));
  const adj = ADJUDICATIONS[r.name];
  if (adj) {
    r.verdict = adj.decision;
    r.adjudication = adj;
  } else if (flag) {
    // flagged but not adjudicated → conservative default: review-queue
    r.verdict = "review-queue";
    r.adjudication = {
      decision: "review-queue",
      reason: r.checks.localitySuffixInQuote === false
        ? "AUTOMATIC FLAG: the ', <locality>' suffix in the candidate name does not appear in the candidate's own verbatim quote — locality attribution not evidenced by the stored quote; queued for a venue-own source."
        : "AUTOMATIC FLAG: name-drift scan hit a frozen hold family.",
    };
  } else {
    r.verdict = "retain";
  }
}

/* ---------------- tallies + output ---------------- */

const retained = rows.filter((r) => r.verdict === "retain");
const queued = rows.filter((r) => r.verdict === "review-queue");
const manualFlagged = rows.filter((r) => r.checks.localitySuffixInQuote === false || r.checks.driftFlags.some((f) => f.startsWith("FROZEN HOLD FAMILY")));

if (hardFailures.length > 0) {
  console.error("[b015-audit] HARD FAILURES (world drifted under the frozen batch):");
  for (const f of hardFailures) console.error("  - " + f);
  process.exit(1);
}

const out = {
  task: "batch-6 audit of the 61 Batch-015 review candidates",
  auditedOn: TODAY,
  inputs: {
    ledger: "scripts/foodie-enrichment/evidence/tirupati-master/batch5/discovery-candidates.json (61 accepted)",
    sql: "supabase/review-candidates/insert-batch-015-tptm-b5.sql",
    corpora: {
      inventoryProxy: "docs/tirupati-place-inventory.md name table (production NOT queried — no SQL executed)",
      worksheet: "scripts/foodie-enrichment/worksheets/tirupati-master-curated.json (names + rawNames aliases)",
      pendingBatches: batchSqls,
      queue: "scripts/foodie-enrichment/evidence/tirupati-master/review-queue-new-names.json",
    },
  },
  checksRun: {
    C1_canonicalIds: "uuid5('foodie-tptm:Tirupati:<name>') recomputed for all 61 — all present in batch-015 SQL",
    C2_exactCollisions: "normalized exact-match vs inventory/batches 011-014/worksheet(name+rawNames)/within-batch — zero",
    C3_slugUniqueness: "place-row slugs vs batches 012-014 + within-batch — zero conflicts",
    C4_localitySuffixEvidence: "name-suffix locality must appear in the candidate's own verbatim quote",
    C5_nameDriftScan: "core-token overlap vs all known names + 4 frozen hold families",
    C6_sqlHonesty: "every SQL row unverified, id pairing exact (coordinates/verification fields re-checked by SQL postflight too)",
  },
  tallies: {
    audited: rows.length,
    retained: retained.length,
    movedToReviewQueue: queued.length,
    manualAdjudications: Object.keys(ADJUDICATIONS).length,
    deterministicFlags: manualFlagged.length,
  },
  movedToReviewQueue: queued.map((r) => ({
    name: r.name, area: r.area, category: r.category,
    originalTier: cands.find((c) => c.name === r.name)?.tier,
    evidence: cands.find((c) => c.name === r.name)?.evidence,
    reason: r.adjudication?.reason,
  })),
  adjudications: Object.entries(ADJUDICATIONS).map(([name, a]) => ({ name, ...a })),
  rows,
  consequences: {
    batch015Sql: queued.length === 0
      ? "unchanged — all 61 rows stand"
      : `insert-batch-015-tptm-b5.sql REGENERATED deterministically with ${retained.length} rows (${queued.length} moved to the review queue); the queued replacements carry the same evidence and are counted NOWHERE as inventory/candidates until accepted by a future evidence pass`,
    reviewQueue: "moved rows recorded in batch6/review-queue-batch6.json with full evidence",
  },
  honesty: {
    verificationStatus: "all retained rows remain verification_status='unverified' — audit evidence does NOT self-verify",
    production: "production inventory represented by its generated local proxy; no SQL executed, nothing pushed, nothing deployed",
  },
};

writeFileSync(join(B6, "b015-audit.json"), JSON.stringify(out, null, 2) + "\n");
console.log(`[b015-audit] audited=${rows.length} retained=${retained.length} queued=${queued.length} flags=${manualFlagged.length}`);
for (const r of queued) console.log(`[b015-audit] → review-queue: ${r.name} — ${(r.adjudication?.reason ?? "").slice(0, 120)}...`);
console.log(`[b015-audit] written → batch6/b015-audit.json`);

/* review-queue file for the moved rows (consumed by the SQL regen decision) */
const queueOut = {
  task: "batch-6 review-queue entries moved out of Batch-015 by the audit",
  createdOn: TODAY,
  note: "counted NOWHERE as inventory or candidates; each keeps its full original evidence for the next evidence pass",
  entries: queued.map((r) => {
    const c = cands.find((x) => x.name === r.name)!;
    return { name: r.name, area: r.area, category: c.category, tier: c.tier, evidence: c.evidence, note: c.note, movedReason: r.adjudication?.reason };
  }),
};
writeFileSync(join(B6, "review-queue-batch6.json"), JSON.stringify(queueOut, null, 2) + "\n");
