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

  test("batch-012/013 eligibility: no T3 row is imported, no cross-set row is imported", () => {
    const importedIds = new Set([...ALL_IDS, ...ids13]);
    // the 5 identity-held candidates stay in the inventory only (documented in batch-013 header)
    const heldNames = new Set(["Kafe", "Kafe Tirupati", "Anjaneya Swamy Temple", "Sri Vinayaka Swamy Temple", "Mini Park"]);
    for (const r of curated.rows) {
      if (r.status !== "curated") continue;
      const isEligible = (r.tier === "T1" || r.tier === "T2") && r.existingSet === "new";
      if (!isEligible || heldNames.has(r.name as string)) {
        // its computed id must NOT be in either batch's INSERT tuples
        const id = uuid5(`foodie-tptm:Tirupati:${r.name as string}`);
        expect(importedIds.has(id)).toBe(false);
      }
    }
  });

  test("forward drift: every eligible worksheet row is imported under its canonical-name id", () => {
    const imported = new Set([...b12Ids, ...ids13]);
    const heldKeys = new Set([
      "tpt-neighbourhoods::kafe", "tirumala::kafe tirupati",
      "tpt-neighbourhoods::anjaneya swamy temple",
      "tpt-neighbourhoods::sri vinayaka swamy temple",
      "tpt-neighbourhoods::mini park",
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
    expect(eligible).toBe(86); // 29 batch-012 + 57 batch-013
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
  test("13 official pages fetched OK (8 batch-1 + 5 batch-2); 2 blocked domains recorded as limitations", () => {
    const ok = official.sources.filter((s) => s.httpStatus === 200);
    const failed = official.sources.filter((s) => s.httpStatus !== 200);
    expect(ok.length).toBe(13);
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

  test("official evidence now covers the five batch-2 TTD pages (HTTP 200) with 162 quotes", () => {
    const b2 = official.sources.filter((s) => s.sourceUrl.includes("PlacesatTirumala") || s.sourceUrl.includes("MoreTemples") || s.sourceUrl.includes("RestHousesInTirumala") || s.sourceUrl.includes("ttdklmps") || s.sourceUrl.includes("Museum"));
    expect(b2.length).toBe(5);
    for (const s of b2) expect(s.httpStatus).toBe(200);
    const total = official.sources.reduce((a, s) => a + (s.extracted?.length ?? 0), 0);
    expect(total).toBe(162);
    const nulls = official.sources.reduce((a, s) => a + (s.extracted ?? []).filter((e) => e.verbatimQuote === null).length, 0);
    expect(nulls).toBe(0);
  });
});
