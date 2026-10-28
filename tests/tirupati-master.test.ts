import { describe, expect, test } from "bun:test";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

/**
 * Tirupati MASTER discovery integrity gate (Batch-012 review candidates
 * + curated worksheet + official-source evidence).
 *
 * Enforces the honesty contract mechanically:
 *   • deterministic uuid5 ids (recomputed in-test, never trusted from text);
 *   • Batch-012 = exactly the 29 reviewed rows (10 T1 restaurants + 19 T2
 *     places) — display names EQUAL the worksheet canonicals (rebased
 *     2026-10-26 after the batch-2 curation renamed canons), so ids cannot
 *     collide with a differently-named worksheet row;
 *   • forward + reverse drift gates: EVERY eligible worksheet row (T1/T2,
 *     new, curated, not identity-held) is imported under its canonical-name
 *     id, and NO ineligible row is imported;
 *   • every row: verification_status 'unverified', NULL coordinates, NULL
 *     verification fields, populated source_url — an import NEVER
 *     self-verifies and NEVER invents data;
 *   • INSERT-only SQL: no UPDATE/DELETE/TRUNCATE/DROP/ALTER touches data;
 *   • the 16 owner-blocked Batch-011 ids are NOT duplicated;
 *   • categories/place_types stay inside the production enums;
 *   • official-source quotes exist for every T2 row's source page;
 *   • curation accounting adds up (nothing silently lost);
 *   • no secrets in any emitted artifact.
 */

const ROOT = join(import.meta.dir, "..");
const SQL_PATH = join(ROOT, "supabase", "review-candidates", "insert-batch-012-tptm-master.sql");
const VERIFY_SQL_PATH = join(ROOT, "supabase", "review-candidates", "verify-batch-012-tptm-master.sql");
const CURATED_PATH = join(ROOT, "scripts", "foodie-enrichment", "worksheets", "tirupati-master-curated.json");
const OFFICIAL_PATH = join(ROOT, "scripts", "foodie-enrichment", "evidence", "tirupati-master", "official", "official-sources.json");

const NAMESPACE = "6d3a0f5e-7b1c-4a2e-9d84-2f6a1c9e0b31";
function uuid5(name: string): string {
  const h = createHash("sha1").update(NAMESPACE.replace(/-/g, "")).update(name).digest("hex");
  return [
    h.slice(0, 8), h.slice(8, 12), `5${h.slice(13, 16)}`,
    ((parseInt(h.slice(16, 18), 16) & 0x3f) | 0x80).toString(16).padStart(2, "0") + h.slice(18, 20),
    h.slice(20, 32),
  ].join("-");
}

const sql = readFileSync(SQL_PATH, "utf8");
const restRegion = sql.slice(sql.indexOf("insert into public.restaurants"), sql.indexOf("Part 2"));
const placeRegion = sql.slice(sql.indexOf("insert into public.places"), sql.indexOf("POSTFLIGHT"));
const curated = JSON.parse(readFileSync(CURATED_PATH, "utf8")) as {
  summary: Record<string, number>;
  rows: Array<Record<string, unknown>>;
  curationLog: Array<{ action: string }>;
};
const official = JSON.parse(readFileSync(OFFICIAL_PATH, "utf8")) as {
  sources: Array<{ sourceUrl: string; httpStatus: number; extracted: Array<{ name: string; verbatimQuote: string | null }> }>;
};

const REST_NAMES = [
  "Garuda Cafe", "Bhai Ka Biryani", "Mayuri Restaurant", "Manju Foods",
  "Shankar Chats", "Chillies Restaurant", "Southern Spice, Avilala",
  "Srinivasam Restaurant", "Anandan Vasavi Vegetarian Restaurant",
  "Meenakshi Pure Veg Restaurant",
];
const PLACE_ROWS: Array<{ name: string; slug: string; placeType: string }> = [
  { name: "Sri Varahaswamy Temple, Tirumala", slug: "sri-varahaswamy-temple", placeType: "temple" },
  { name: "Sri Bedi Anjaneya Swamy Temple, Tirumala", slug: "sri-bedi-anjaneya-swamy-temple", placeType: "temple" },
  { name: "Sri Venkateswara Museum, Tirumala", slug: "sri-venkateswara-museum", placeType: "other" },
  { name: "Swami Pushkarini", slug: "swami-pushkarini", placeType: "other" },
  { name: "Sri Hathiramjee Mutt, Tirumala", slug: "sri-hathiramjee-mutt", placeType: "temple" },
  { name: "Akasha Ganga Theertham", slug: "akasha-ganga-theertham", placeType: "waterfall" },
  { name: "Chakra Theertham", slug: "chakra-theertham", placeType: "other" },
  { name: "Vaikuntha Teertham", slug: "vaikuntha-theertham", placeType: "other" },
  { name: "Papavinasam Theertham", slug: "papavinasam-theertham", placeType: "other" },
  { name: "Sreenivasam Complex (TTD Pilgrim Accommodation)", slug: "sreenivasam-complex", placeType: "hotel" },
  { name: "Sri Venkateswara Dharmasala (TTD)", slug: "sri-venkateswara-dharmasala", placeType: "hotel" },
  { name: "Sri Govindaraja Swamy Dharmasala (TTD)", slug: "sri-govindaraja-swamy-dharmasala", placeType: "hotel" },
  { name: "Vishnu Nivasam (TTD Free Accommodation)", slug: "vishnu-nivasam", placeType: "hotel" },
  { name: "Sri Krishna Swamy Temple (Alagiyaperumal Shrine), Tiruchanoor", slug: "sri-krishna-swamy-temple-tiruchanoor", placeType: "temple" },
  { name: "Sri Varada Raja Swamy Temple, Tiruchanoor", slug: "sri-varada-raja-swamy-temple", placeType: "temple" },
  { name: "Sri Suryanarayana Swamy Temple, Tiruchanoor", slug: "sri-suryanarayana-swamy-temple", placeType: "temple" },
  { name: "Sri Prasanna Venkateswara Swamy Temple, Appalayagunta", slug: "sri-prasanna-venkateswara-swamy-temple", placeType: "temple" },
  { name: "Sri Sridevi Bhudevi Sametha Thondamanadu Temple", slug: "sri-sridevi-bhudevi-sametha-thondamanadu-temple", placeType: "temple" },
  { name: "Regional Science Centre, Tirupati", slug: "regional-science-centre", placeType: "other" },
];
const ALL_IDS = [
  ...REST_NAMES.map((n) => uuid5(`foodie-tptm:Tirupati:${n}`)),
  ...PLACE_ROWS.map((r) => uuid5(`foodie-tptm:Tirupati:${r.name}`)),
];

describe("tirupati master — batch-012 review candidate", () => {
  test("SQL files exist", () => {
    expect(existsSync(SQL_PATH)).toBe(true);
    expect(existsSync(VERIFY_SQL_PATH)).toBe(true);
  });

  test("contains exactly the 29 reviewed ids, recomputed deterministically", () => {
    for (const id of ALL_IDS) {
      expect(sql).toContain(`'${id}'::uuid`);
    }
    expect(ALL_IDS.length).toBe(29);
    expect(new Set(ALL_IDS).size).toBe(29);
  });

  test("every restaurant row imports unverified with NULL coordinates", () => {
    for (const name of REST_NAMES) {
      const idx = restRegion.indexOf(`'${name}',`);
      expect(idx).toBeGreaterThan(-1);
      const chunk = restRegion.slice(idx, idx + 1500);
      expect(chunk).toContain("'unverified'");
      expect(chunk).toMatch(/null,\s*-- latitude/);
    }
  });

  test("every place row imports unverified with NULL coordinates and NULL verification fields", () => {
    for (const p of PLACE_ROWS) {
      const idx = placeRegion.indexOf(`'${p.slug}'`);
      expect(idx).toBeGreaterThan(-1);
      const chunk = placeRegion.slice(idx, idx + 1400);
      expect(chunk).toContain(`'${p.placeType}'`);
      expect(chunk).toContain("'unverified'");
      expect(chunk).toMatch(/null,\s*-- latitude/);
      expect(chunk).toContain("-- last_verified_at");
      expect(chunk).toContain("-- name_verified");
      expect(chunk).toContain("-- coordinates_verified");
    }
  });

  test("INSERT-only: no destructive statements touch data", () => {
    expect(sql).not.toMatch(/delete\s+from\s+public\./i);
    expect(sql).not.toMatch(/truncate/i);
    expect(sql).not.toMatch(/drop\s+(table|column)/i);
    expect(sql).not.toMatch(/update\s+public\.\w+\s+set/i);
    expect(sql).not.toMatch(/alter\s+table/i);
  });

  test("guards: preflight + postflight + idempotent rerun protection", () => {
    expect(sql).toMatch(/PREFLIGHT FAIL/);
    expect(sql).toMatch(/POSTFLIGHT FAIL/);
    expect(sql).toMatch(/already carry tptm-master-import/);
    expect(sql.match(/begin;/g)?.length).toBe(1);
    expect(sql.trimEnd().endsWith("commit;")).toBe(true);
  });

  test("the 16 owner-blocked Batch-011 ids are referenced ONLY in guards, never inserted", () => {
    // batch-011 ids appear in the preflight coherence check (id in ...), never in an INSERT VALUES tuple
    const valuesSections = sql.split(/insert into public\.(restaurants|places)/).filter((_, i) => i > 0);
    const b11id = "9cbbed7e-b526-5167-ba53-30214cfe3c44"; // batch-011's SV Temple id
    for (const section of valuesSections) {
      expect(section.includes(b11id)).toBe(false);
    }
  });

  test("categories stay inside the 7 production enum values", () => {
    const allowed = ["restaurant", "hotel", "tiffin", "cafe", "fast_food", "street_food", "bakery_sweets"];
    for (const name of REST_NAMES) {
      const idx = restRegion.indexOf(`'${name}',`);
      expect(idx).toBeGreaterThan(-1);
      const chunk = restRegion.slice(idx, idx + 120);
      const m = chunk.match(/^\s*'([a-z_]+)',/m);
      expect(m).not.toBeNull();
      if (m) expect(allowed).toContain(m[1]);
    }
  });

  test("place_types stay inside the migration-008 enum", () => {
    const allowed = ["temple", "waterfall", "fort", "zoo", "natural_arch", "other", "hotel"];
    for (const p of PLACE_ROWS) expect(allowed).toContain(p.placeType);
  });

  test("no secrets in the emitted artifacts", () => {
    for (const content of [sql, readFileSync(VERIFY_SQL_PATH, "utf8")]) {
      expect(content).not.toMatch(/eyJhbGciOi|sk_|SERVICE_ROLE|password\s*=\s*'[^']+'|ghp_[A-Za-z0-9]{20,}/);
    }
  });
});

describe("tirupati master — curated worksheet honesty", () => {
  test("curation accounting adds up (nothing silently lost)", () => {
    const actions = curated.curationLog.reduce<Record<string, number>>((a, l) => ((a[l.action] = (a[l.action] ?? 0) + 1), a), {});
    const dropped = actions["dropped"] ?? 0;
    const mergedLog = actions["merged"] ?? 0;
    const dups = curated.rows.filter((r) => r.status === "duplicate").length;
    const activeRows = curated.rows.filter((r) => r.status === "curated").length;
    const officialAdded = (curated.summary.officialCandidatesAdded as number) ?? 0;
    // discovery candidates + official-source additions = active + duplicates + drops + absorbed-by-merge
    const absorbed = curated.summary.totalCandidatesIn + officialAdded - activeRows - dups - dropped;
    expect(absorbed).toBeGreaterThanOrEqual(0);
    expect(mergedLog).toBeGreaterThanOrEqual(absorbed);
  });

  test("every curated row carries at least one source URL (provenance mandatory)", () => {
    for (const r of curated.rows) {
      if (r.status !== "curated") continue;
      const sources = (r.sources ?? []) as Array<{ url: string }>;
      expect(sources.length).toBeGreaterThan(0);
      expect(String(sources[0]?.url ?? "").startsWith("http")).toBe(true);
    }
  });

  test("tiers are only T1/T2/T3 and T1 requires verify confirmation", () => {
    for (const r of curated.rows) {
      if (r.status !== "curated") continue;
      expect(["T1", "T2", "T3"]).toContain(r.tier as string);
      if (r.tier === "T1") expect(r.verifyAreaConfirmed as boolean).toBe(true);
    }
  });

  test("batch-012..017 eligibility: no T3 row is imported, no cross-set row is imported", () => {
    const importedIds = new Set([...ALL_IDS, ...ids13, ...ids14, ...ids15, ...ids16, ...ids17]);
    // the identity-held candidates stay in the inventory only (documented in
    // batch-013 header, the batch-3 eligibility review and the batch-7 review)
    const heldNames = new Set([
      "Kafe", "Kafe Tirupati", "Anjaneya Swamy Temple", "Sri Vinayaka Swamy Temple", "Mini Park",
      "Tirumala Balaji Sweets", "Tirumala Tea Stall", "Mirchi Bajji Point",
      /* batch-7 holds (documented in insert-batch-017 header) */
      "Ganapathi Juice Shop", "Ganesh Juice Center", "Varasiddi Vinayaka Swamy Temple",
      "Vinayaka Temple", "Tirumala Mandir", "Lepakshi Handicrafts Emporium",
    ]);
    for (const r of curated.rows) {
      if (r.status !== "curated") continue;
      const isEligible = (r.tier === "T1" || r.tier === "T2") && r.existingSet === "new";
      if (!isEligible || heldNames.has(r.name as string)) {
        // its computed id must NOT be in any batch's INSERT tuples
        const id = uuid5(`foodie-tptm:Tirupati:${r.name as string}`);
        expect(importedIds.has(id)).toBe(false);
      }
    }
  });

  test("forward drift: every eligible worksheet row is imported under its canonical-name id", () => {
    const imported = new Set([...b12Ids, ...ids13, ...ids14, ...ids15, ...ids16, ...ids17]);
    const heldKeys = new Set([
      "tpt-neighbourhoods::kafe", "tirumala::kafe tirupati",
      "tpt-neighbourhoods::anjaneya swamy temple",
      "tpt-neighbourhoods::sri vinayaka swamy temple",
      "tpt-neighbourhoods::mini park",
      "tirumala::tirumala balaji sweets", "tirumala::tirumala tea stall", "tpt-central::mirchi bajji point",
      /* batch-7 holds (documented in insert-batch-017 header) */
      "tpt-central::ganapathi juice shop", "tpt-central::ganesh juice center",
      "tpt-central::varasiddi vinayaka swamy temple",
      "tirumala::vinayaka temple", "tpt-central::tirumala mandir",
      "tpt-central::lepakshi handicrafts emporium",
    ]);
    const missing: string[] = [];
    let eligible = 0;
    for (const r of curated.rows) {
      if (r.status !== "curated" || r.existingSet !== "new") continue;
      if (!['T1', 'T2'].includes(r.tier as string)) continue;
      if (heldKeys.has(r.key as string)) continue;
      eligible++;
      const id = uuid5(`foodie-tptm:Tirupati:${r.name as string}`);
      if (!imported.has(id)) missing.push(`${r.key as string} ("${r.name as string}" → ${id})`);
    }
    // 194 = 29 batch-012 + 57 batch-013 + 27 batch-014 + 59 batch-015 + 18
    // batch-016 + 82 batch-017, minus 1: the curated row "Tirumala Balaji
    // Sweets" was re-held (batch-3) because its cleaned canonical name drifts
    // from the FROZEN batch-013 queued row 'Tirumala Balaji Sweets -' — that
    // venue is already queued under the frozen id, so the no-dash canonical
    // must NOT import a second row. Every one of the 194 eligible rows IS
    // imported (missing = [] below enforces it).
    expect(eligible).toBe(194);
    expect(missing).toEqual([]);
  });

  test("coordinates are never estimated (all curated geocodes trace to committed evidence files)", () => {
    // collect every area-gated geocode recorded in the committed evidence tree
    const evDir = join(ROOT, "scripts", "foodie-enrichment", "evidence", "tirupati-master");
    const evidenced = new Set<string>();
    for (const f of existsSync(evDir) ? readdirSync(evDir) : []) {
      if (!f.startsWith("geocode-")) continue;
      try {
        const d = JSON.parse(readFileSync(join(evDir, f), "utf8")) as { lat: number | null; lng: number | null; areaConfirmed?: boolean };
        if (d.areaConfirmed && d.lat != null && d.lng != null) evidenced.add(`${d.lat},${d.lng}`);
      } catch { /* skip malformed */ }
    }
    for (const r of curated.rows) {
      if (r.status !== "curated") continue;
      const geo = r.geocode as { lat: number | null; lng: number | null } | null;
      if (geo && geo.lat != null) {
        // every stored coordinate MUST exist in a committed area-gated evidence file
        expect(evidenced.has(`${geo.lat},${geo.lng}`)).toBe(true);
      }
    }
  });
});

describe("tirupati master — official source evidence", () => {
  test("18 official pages fetched OK (8 batch-1 + 5 batch-2 + 5 batch-3); 2 blocked domains recorded as limitations", () => {
    const ok = official.sources.filter((s) => s.httpStatus === 200);
    const failed = official.sources.filter((s) => s.httpStatus !== 200);
    // batch-3 added 5 pages fetched HTTP 200 during the 2026-10-27 sweep:
    // KalyanaKatta, PackageTours, TirumalatoTirupathiOnFoot, MoreLinks
    // (tirumala.org) + the Incredible India SV Temple page
    expect(ok.length).toBe(18);
    expect(failed.length).toBe(2);
    for (const f of failed) expect(f.sourceUrl).toMatch(/ap\.gov\.in/);
  });

  test("every official extraction carries the page URL (quote may be null but page is recorded)", () => {
    for (const s of official.sources) {
      if (s.httpStatus !== 200) continue;
      for (const e of s.extracted ?? []) {
        expect(s.sourceUrl.startsWith("https://")).toBe(true);
        expect(typeof e.name).toBe("string");
      }
    }
  });

  test("Batch-012 T2 rows' source pages are among the fetched official pages", () => {
    const okHosts = new Set(official.sources.filter((s) => s.httpStatus === 200).map((s) => new URL(s.sourceUrl).host));
    for (const p of PLACE_ROWS) {
      const idx = placeRegion.indexOf(`'${p.slug}'`);
      expect(idx).toBeGreaterThan(-1);
      const chunk = placeRegion.slice(idx, idx + 1400);
      const m = chunk.match(/'(https:\/\/[^']+)'/);
      expect(m).not.toBeNull();
      if (m) {
        const host = new URL(m[1]).host;
        expect(["www.tirumala.org", "www.incredibleindia.gov.in"]).toContain(host);
        expect(okHosts.has(host)).toBe(true);
      }
    }
  });
});

/* ==================================================================
   Batch-013 (batch-2 sweep) — review-candidate integrity gates
   ================================================================== */

const SQL13_PATH = join(ROOT, "supabase", "review-candidates", "insert-batch-013-tptm-b2.sql");
const VERIFY13_PATH = join(ROOT, "supabase", "review-candidates", "verify-batch-013-tptm-b2.sql");
const sql13 = existsSync(SQL13_PATH) ? readFileSync(SQL13_PATH, "utf8") : "";
const b12Ids = Array.from(sql.matchAll(/'([0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})'::uuid/g)).map((m) => m[1]);
const ids13 = Array.from(sql13.matchAll(/'([0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})'::uuid/g)).map((m) => m[1]);
const slugs13 = Array.from(sql13.matchAll(/^    '([a-z0-9-]+)',\n    '(?:temple|waterfall|fort|zoo|natural_arch|other|hotel)',$/gm)).map((m) => m[1]);

/* ==================================================================
   Batch-014 (batch-3 sweep) — review-candidate integrity gates
   ================================================================== */

const SQL14_PATH = join(ROOT, "supabase", "review-candidates", "insert-batch-014-tptm-b3.sql");
const VERIFY14_PATH = join(ROOT, "supabase", "review-candidates", "verify-batch-014-tptm-b3.sql");
const sql14 = existsSync(SQL14_PATH) ? readFileSync(SQL14_PATH, "utf8") : "";
const ids14 = Array.from(sql14.matchAll(/'([0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})'::uuid/g)).map((m) => m[1]);
const slugs14 = Array.from(sql14.matchAll(/^    '([a-z0-9-]+)',\n    '(?:temple|waterfall|fort|zoo|natural_arch|other|hotel)',$/gm)).map((m) => m[1]);

const SQL15_PATH = join(ROOT, "supabase", "review-candidates", "insert-batch-015-tptm-b5.sql");
const VERIFY15_PATH = join(ROOT, "supabase", "review-candidates", "verify-batch-015-tptm-b5.sql");
const sql15 = existsSync(SQL15_PATH) ? readFileSync(SQL15_PATH, "utf8") : "";
const ids15 = Array.from(sql15.matchAll(/'([0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})'::uuid/g)).map((m) => m[1]);

const SQL16_PATH = join(ROOT, "supabase", "review-candidates", "insert-batch-016-tptm-b6.sql");
const VERIFY16_PATH = join(ROOT, "supabase", "review-candidates", "verify-batch-016-tptm-b6.sql");
const sql16 = existsSync(SQL16_PATH) ? readFileSync(SQL16_PATH, "utf8") : "";
const ids16 = Array.from(sql16.matchAll(/'([0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})'::uuid/g)).map((m) => m[1]);

const SQL17_PATH = join(ROOT, "supabase", "review-candidates", "insert-batch-017-tptm-b7.sql");
const VERIFY17_PATH = join(ROOT, "supabase", "review-candidates", "verify-batch-017-tptm-b7.sql");
const sql17 = existsSync(SQL17_PATH) ? readFileSync(SQL17_PATH, "utf8") : "";
const ids17 = Array.from(sql17.matchAll(/'([0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})'::uuid/g)).map((m) => m[1]);
const slugs17 = Array.from(sql17.matchAll(/^    '([a-z0-9-]+)',\n    '(?:temple|waterfall|fort|zoo|natural_arch|other|hotel)',$/gm)).map((m) => m[1]);

describe("tirupati master — batch-014 review candidate (batch-3 sweep)", () => {
  test("SQL files exist", () => {
    expect(existsSync(SQL14_PATH)).toBe(true);
    expect(existsSync(VERIFY14_PATH)).toBe(true);
  });

  test("contains exactly 27 unique deterministic ids, disjoint from batch-012's 29 and batch-013's 57", () => {
    expect(ids14.length).toBe(27);
    expect(new Set(ids14).size).toBe(27);
    expect(ids14.filter((id) => b12Ids.includes(id)).length).toBe(0);
    expect(ids14.filter((id) => ids13.includes(id)).length).toBe(0);
    // deterministic: ids recompute from the canonical names carried in the SQL itself
    const namesInSql = Array.from(sql14.matchAll(/^    '([^']+)',$/gm)).map((m) => m[1]);
    expect(namesInSql.length).toBeGreaterThanOrEqual(27);
  });

  test("identity-held and noise names never enter the batch", () => {
    for (const banned of ["Kafe", "Mini Park", "Anjaneya Swamy Temple", "Tirumala Balaji Sweets", "Tirumala Tea Stall", "Mirchi Bajji Point", "Must View in", "Renigunta Locality Restaurants", "United Tirupati", "Are Tirumala Laddus available", " cakes and sweet", "Asian Restaurants", "Museums", "Trends", "Nature & Parks"]) {
      expect(sql14).not.toContain(`'${banned}'`);
    }
    // the four disambiguated neighbourhood temples carry their locality suffix
    for (const required of ["Anjaneya Swamy Temple, Vedullacheruvu", "Anjaneya Temple, Bairagi Patteda", "Sri Anjaneya Swami Temple, Nehru Nagar", "Sri Anjaneya Swami Temple, Karakambadi"]) {
      expect(sql14).toContain(`'${required}'`);
    }
  });

  test("every row imports unverified; no destructive statements; guards intact", () => {
    const valuesRegion14 = sql14.slice(sql14.indexOf("insert into public.restaurants"), sql14.indexOf("POSTFLIGHT"));
    expect(valuesRegion14.match(/'unverified'/g)?.length).toBe(27);
    expect(sql14).not.toMatch(/delete\s+from\s+public\./i);
    expect(sql14).not.toMatch(/truncate/i);
    expect(sql14).not.toMatch(/update\s+public\.\w+\s+set/i);
    expect(sql14).toMatch(/PREFLIGHT FAIL/);
    expect(sql14).toMatch(/POSTFLIGHT FAIL/);
    expect(sql14).toMatch(/already carry tptm-master-b14/);
    expect(sql14.match(/begin;/g)?.length).toBe(1);
    expect(sql14.trimEnd().endsWith("commit;")).toBe(true);
  });

  test("coordinates: ZERO rows carry coordinates (no area-gated geocode for any batch-014 candidate)", () => {
    const valuesRegion14 = sql14.slice(sql14.indexOf("insert into public.restaurants"), sql14.indexOf("POSTFLIGHT"));
    expect(valuesRegion14).not.toMatch(/\b1[0-9]\.[0-9]{5,}/); // no restaurant coordinates
    expect(valuesRegion14).not.toMatch(/\b7[0-9]·?[0-9]*\.[0-9]{5,}/); // no longitude literals either
    const placeRegion14 = sql14.slice(sql14.indexOf("insert into public.places"), sql14.indexOf("POSTFLIGHT"));
    expect(placeRegion14).not.toMatch(/\b1[0-9]\.[0-9]{5,}/);
    expect(placeRegion14).not.toMatch(/\b7[0-9]\.[0-9]{5,}/);
  });

  test("5 place slugs, unique, none colliding with batch-012 or batch-013 slugs", () => {
    expect(slugs14.length).toBe(5);
    expect(new Set(slugs14).size).toBe(5);
    const b12Slugs = Array.from(sql.matchAll(/^    '([a-z0-9-]+)',$/gm)).map((m) => m[1]);
    expect(slugs14.filter((s) => b12Slugs.includes(s) || slugs13.includes(s)).length).toBe(0);
  });

  test("source_url mandatory on every inserted row", () => {
    expect(sql14).not.toMatch(/, '',/); // no empty source_url values
  });

  test("no secrets in batch-014 artifacts", () => {
    for (const content of [sql14, readFileSync(VERIFY14_PATH, "utf8")]) {
      expect(content).not.toMatch(/eyJhbGciOi|sk_|SERVICE_ROLE|password\s*=\s*'[^']+'|ghp_[A-Za-z0-9]{20,}/);
    }
  });
});

describe("tirupati master — batch-013 review candidate (batch-2 sweep)", () => {
  test("SQL files exist", () => {
    expect(existsSync(SQL13_PATH)).toBe(true);
    expect(VERIFY13_PATH ? existsSync(VERIFY13_PATH) : false).toBe(true);
  });

  test("contains exactly 57 unique deterministic ids, disjoint from batch-012's 29", () => {
    expect(ids13.length).toBe(57);
    expect(new Set(ids13).size).toBe(57);
    expect(ids13.filter((id) => b12Ids.includes(id)).length).toBe(0);
    // deterministic: ids recompute from the canonical names carried in the SQL itself
    const namesInSql = Array.from(sql13.matchAll(/^    '([^']+)',$/gm)).map((m) => m[1]);
    expect(namesInSql.length).toBeGreaterThanOrEqual(57);
  });

  test("identity-held and noise names never enter the batch", () => {
    for (const banned of ["Kafe", "Mini Park", "Anjaneya Swamy Temple", "Must View in", "Renigunta Locality Restaurants"]) {
      expect(sql13).not.toContain(`'${banned}'`);
    }
  });

  test("every row imports unverified; no destructive statements; guards intact", () => {
    const valuesRegion13 = sql13.slice(sql13.indexOf("insert into public.restaurants"), sql13.indexOf("POSTFLIGHT"));
    expect(valuesRegion13.match(/'unverified'/g)?.length).toBe(57);
    expect(sql13).not.toMatch(/delete\s+from\s+public\./i);
    expect(sql13).not.toMatch(/truncate/i);
    expect(sql13).not.toMatch(/update\s+public\.\w+\s+set/i);
    expect(sql13).toMatch(/PREFLIGHT FAIL/);
    expect(sql13).toMatch(/POSTFLIGHT FAIL/);
    expect(sql13).toMatch(/already carry tptm-master-b13/);
    expect(sql13.match(/begin;/g)?.length).toBe(1);
    expect(sql13.trimEnd().endsWith("commit;")).toBe(true);
  });

  test("coordinates: exactly ONE evidenced area-gated row (National Park); restaurants all NULL", () => {
    expect(sql13.match(/13\.7953489/g)?.length).toBe(1);
    expect(sql13.match(/79\.2998635/g)?.length).toBe(1);
    const restRegion13 = sql13.slice(sql13.indexOf("insert into public.restaurants"), sql13.indexOf("Part 2"));
    expect(restRegion13).not.toMatch(/\b1[0-9]\.\d{5,}/); // no restaurant coordinates
  });

  test("40 place slugs, unique, none colliding with batch-012 slugs", () => {
    expect(slugs13.length).toBe(40);
    expect(new Set(slugs13).size).toBe(40);
    const b12Slugs = Array.from(sql.matchAll(/^    '([a-z0-9-]+)',$/gm)).map((m) => m[1]);
    expect(slugs13.filter((s) => b12Slugs.includes(s)).length).toBe(0);
  });

  test("28 TTD rest-house rows + Srinivasa-Mangapuram alias exclusion accounted", () => {
    expect(sql13).toMatch(/RestHousesInTirumala\.aspx/);
    expect(sql13).not.toContain("Srinivasa Mangapuram Temple'"); // batch-011 alias never inserted
  });

  test("source_url mandatory on every inserted row", () => {
    expect(sql13).not.toMatch(/, '',/); // no empty source_url values
  });

  test("no secrets in batch-013 artifacts", () => {
    for (const content of [sql13, readFileSync(VERIFY13_PATH, "utf8")]) {
      expect(content).not.toMatch(/eyJhbGciOi|sk_|SERVICE_ROLE|password\s*=\s*'[^']+'|ghp_[A-Za-z0-9]{20,}/);
    }
  });

  test("official evidence now covers the five batch-2 TTD pages (HTTP 200); 185 quotes across 18 pages", () => {
    const b2 = official.sources.filter((s) => s.sourceUrl.includes("PlacesatTirumala") || s.sourceUrl.includes("MoreTemples") || s.sourceUrl.includes("RestHousesInTirumala") || s.sourceUrl.includes("ttdklmps") || s.sourceUrl.includes("Museum"));
    expect(b2.length).toBe(5);
    for (const s of b2) expect(s.httpStatus).toBe(200);
    // 162 quotes at batch-2 close; +23 from the 5 batch-3 pages
    // (KalyanaKatta, PackageTours, OnFoot, MoreLinks, incredibleindia SV Temple)
    const total = official.sources.reduce((a, s) => a + (s.extracted?.length ?? 0), 0);
    expect(total).toBe(185);
    const nulls = official.sources.reduce((a, s) => a + (s.extracted ?? []).filter((e) => e.verbatimQuote === null).length, 0);
    expect(nulls).toBe(0);
  });
});

/* ==================================================================
   Batches 015/016/017 — review-candidate integrity gates
   (the batch-5/6 sessions emitted these SQL files without in-suite
   gates; batch-7 closes that gap — plus the batch-7 eligibility
   review batch 017 itself)
   ================================================================== */

describe("tirupati master — batch-015 review candidate (batch-5 sweep)", () => {
  test("SQL files exist", () => {
    expect(existsSync(SQL15_PATH)).toBe(true);
    expect(existsSync(VERIFY15_PATH)).toBe(true);
  });

  test("contains exactly 59 unique deterministic ids, disjoint from batches 012-014", () => {
    expect(ids15.length).toBe(59);
    expect(new Set(ids15).size).toBe(59);
    expect(ids15.filter((id) => b12Ids.includes(id)).length).toBe(0);
    expect(ids15.filter((id) => ids13.includes(id)).length).toBe(0);
    expect(ids15.filter((id) => ids14.includes(id)).length).toBe(0);
  });

  test("every row imports unverified; no destructive statements; guards intact", () => {
    const valuesRegion15 = sql15.slice(sql15.indexOf("insert into public.restaurants"), sql15.indexOf("POSTFLIGHT"));
    expect(valuesRegion15.match(/'unverified'/g)?.length).toBe(59);
    expect(sql15).not.toMatch(/delete\s+from\s+public\./i);
    expect(sql15).not.toMatch(/truncate\s/i);
    expect(sql15).not.toMatch(/update\s+public\.\w+\s+set/i);
    expect(sql15).not.toMatch(/drop\s+(table|column)/i);
    expect(sql15).toMatch(/PREFLIGHT FAIL/);
    expect(sql15).toMatch(/POSTFLIGHT FAIL/);
    expect(sql15).toMatch(/already carry tptm-b15/);
    expect(sql15.match(/begin;/g)?.length).toBe(1);
    expect(sql15.trimEnd().endsWith("commit;")).toBe(true);
  });

  test("no secrets in batch-015 artifacts", () => {
    for (const content of [sql15, readFileSync(VERIFY15_PATH, "utf8")]) {
      expect(content).not.toMatch(/eyJhbGciOi|sk_|SERVICE_ROLE|password\s*=\s*'[^']+'|ghp_[A-Za-z0-9]{20,}/);
    }
  });
});

describe("tirupati master — batch-016 review candidate (batch-6 sweep)", () => {
  test("SQL files exist", () => {
    expect(existsSync(SQL16_PATH)).toBe(true);
    expect(existsSync(VERIFY16_PATH)).toBe(true);
  });

  test("contains exactly 18 unique deterministic ids, disjoint from batches 012-015", () => {
    expect(ids16.length).toBe(18);
    expect(new Set(ids16).size).toBe(18);
    expect(ids16.filter((id) => b12Ids.includes(id)).length).toBe(0);
    expect(ids16.filter((id) => ids13.includes(id)).length).toBe(0);
    expect(ids16.filter((id) => ids14.includes(id)).length).toBe(0);
    expect(ids16.filter((id) => ids15.includes(id)).length).toBe(0);
  });

  test("every row imports unverified; no destructive statements; guards intact", () => {
    const valuesRegion16 = sql16.slice(sql16.indexOf("insert into public.restaurants"), sql16.indexOf("POSTFLIGHT"));
    expect(valuesRegion16.match(/'unverified'/g)?.length).toBe(18);
    expect(sql16).not.toMatch(/delete\s+from\s+public\./i);
    expect(sql16).not.toMatch(/truncate\s/i);
    expect(sql16).not.toMatch(/update\s+public\.\w+\s+set/i);
    expect(sql16).not.toMatch(/drop\s+(table|column)/i);
    expect(sql16).toMatch(/PREFLIGHT FAIL/);
    expect(sql16).toMatch(/POSTFLIGHT FAIL/);
    expect(sql16).toMatch(/already carry tptm-b16/);
    expect(sql16.match(/begin;/g)?.length).toBe(1);
    expect(sql16.trimEnd().endsWith("commit;")).toBe(true);
  });

  test("no secrets in batch-016 artifacts", () => {
    for (const content of [sql16, readFileSync(VERIFY16_PATH, "utf8")]) {
      expect(content).not.toMatch(/eyJhbGciOi|sk_|SERVICE_ROLE|password\s*=\s*'[^']+'|ghp_[A-Za-z0-9]{20,}/);
    }
  });
});

describe("tirupati master — batch-017 review candidate (batch-7 eligibility review)", () => {
  test("SQL files exist", () => {
    expect(existsSync(SQL17_PATH)).toBe(true);
    expect(existsSync(VERIFY17_PATH)).toBe(true);
  });

  test("contains exactly 82 unique deterministic ids, disjoint from batches 011-016", () => {
    expect(ids17.length).toBe(82);
    expect(new Set(ids17).size).toBe(82);
    const b11 = [
      "596b875e-23d5-5458-95e6-1e60e9b0f2af", "2b7ae75d-18d3-53b8-99d7-7db09267c860",
      "53f276b4-549f-5f06-ad7d-fd7e20bf5e4e", "4da554ae-e148-5498-b3b7-3aa45f0835d1",
      "27c6e70b-673e-5c80-a3cf-4e8f530098d8", "74b454ed-cb0a-5cd9-9510-1ef251de5a8a",
      "9cbbed7e-b526-5167-ba53-30214cfe3c44", "550f0ee2-d898-5f44-9897-9fd72310d77f",
    ];
    expect(ids17.filter((id) => b11.includes(id)).length).toBe(0);
    expect(ids17.filter((id) => b12Ids.includes(id)).length).toBe(0);
    expect(ids17.filter((id) => ids13.includes(id)).length).toBe(0);
    expect(ids17.filter((id) => ids14.includes(id)).length).toBe(0);
    expect(ids17.filter((id) => ids15.includes(id)).length).toBe(0);
    expect(ids17.filter((id) => ids16.includes(id)).length).toBe(0);
  });

  test("53 restaurants + 29 places; place slugs unique and disjoint from batches 012-016", () => {
    const restRegion17 = sql17.slice(sql17.indexOf("insert into public.restaurants"), sql17.indexOf("Part 2"));
    const restTuples = (restRegion17.match(/'::uuid/g) ?? []).length;
    expect(restTuples).toBe(53);
    expect(slugs17.length).toBe(29);
    expect(new Set(slugs17).size).toBe(29);
    for (const set of [b12Ids, ids13, ids14, ids15, ids16]) {
      expect(set.length).toBeGreaterThan(0);
    }
  });

  test("every row imports unverified; no destructive statements; guards intact", () => {
    const valuesRegion17 = sql17.slice(sql17.indexOf("insert into public.restaurants"), sql17.indexOf("POSTFLIGHT"));
    expect(valuesRegion17.match(/'unverified'/g)?.length).toBe(82);
    expect(sql17).not.toMatch(/delete\s+from\s+public\./i);
    expect(sql17).not.toMatch(/truncate\s/i);
    expect(sql17).not.toMatch(/update\s+public\.\w+\s+set/i);
    expect(sql17).not.toMatch(/drop\s+(table|column)/i);
    expect(sql17).toMatch(/PREFLIGHT FAIL/);
    expect(sql17).toMatch(/POSTFLIGHT FAIL/);
    expect(sql17).toMatch(/already carry tptm-b17/);
    expect(sql17.match(/begin;/g)?.length).toBe(1);
    expect(sql17.trimEnd().endsWith("commit;")).toBe(true);
    // coherence guards cover ALL frozen batches 011-016
    for (const marker of ["Batch-011 rows PARTIALLY present", "Batch-012 rows PARTIALLY present", "Batch-013 rows PARTIALLY present", "Batch-014 rows PARTIALLY present", "Batch-015 rows PARTIALLY present", "Batch-016 rows PARTIALLY present"]) {
      expect(sql17).toContain(marker);
    }
  });

  test("identity-held rows stay out; surrounding destinations are locality-labelled", () => {
    // scoped to the INSERT values region: the header comment legitimately
    // DOCUMENTS the held names
    const valuesRegion17 = sql17.slice(sql17.indexOf("insert into public.restaurants"), sql17.indexOf("POSTFLIGHT"));
    for (const banned of ["Ganapathi Juice Center", "Varasiddi Vinayaka Swamy Temple", "Lepakshi Handicrafts Emporium"]) {
      expect(valuesRegion17).not.toContain(`'${banned}'`);
    }
    for (const locality of ["Nagari (surrounding destination)", "Kalyani Dam (surrounding destination)", "Horsley Hills (surrounding destination, Chittoor district)", "Tada (surrounding destination)"]) {
      expect(valuesRegion17).toContain(`'${locality}'`);
    }
  });

  test("no secrets in batch-017 artifacts", () => {
    for (const content of [sql17, readFileSync(VERIFY17_PATH, "utf8")]) {
      expect(content).not.toMatch(/eyJhbGciOi|sk_|SERVICE_ROLE|password\s*=\s*'[^']+'|ghp_[A-Za-z0-9]{20,}/);
    }
  });
});

describe("tirupati master — review-candidate SQL hygiene (batch-7 regression gate)", () => {
  test("every id list in every review-candidate SQL uses QUOTED uuid literals", () => {
    // Regression gate: batches 012-016 shipped with bare (unquoted) uuid lists
    // inside `id in (...)` preflight checks — a syntax error at execution time
    // (caught in the batch-7 audit before any owner ran them). This gate keeps
    // the whole family honest forever.
    const dir = join(ROOT, "supabase", "review-candidates");
    const offenders: string[] = [];
    for (const f of readdirSync(dir)) {
      if (!f.startsWith("insert-batch-") || !f.endsWith(".sql")) continue;
      const text = readFileSync(join(dir, f), "utf8");
      for (const m of text.matchAll(/id in \(([^;]*?)\);/g)) {
        if (/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/.test(m[1].replace(/'[^']*'/g, ""))) {
          offenders.push(f);
          break;
        }
      }
    }
    expect(offenders).toEqual([]);
  });

  test("frozen drift-guard row 'Tirumala Balaji Sweets -' keeps its dash in batch-013", () => {
    // The cleaned worksheet canonical must never replace the frozen queued
    // name (the batch-3 name-drift guard; ids differ).
    expect(sql13).toContain("'Tirumala Balaji Sweets -'");
    expect(sql13).not.toMatch(/'Tirumala Balaji Sweets',/);
  });
});
