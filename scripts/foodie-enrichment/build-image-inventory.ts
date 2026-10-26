/**
 * build-image-inventory.ts — auditable place-by-place image & menu inventory.
 *
 * PROTOTYPE 4.2 completion pass (owner directive §C/§F): for every place in
 * the four requested place sets, record
 *   - identity (name, category, locality, city) parsed from the batch SQL
 *     review candidates / applied batch files,
 *   - whether the row is LIVE in production (read-only GET probes against
 *     the deployed public API — no credentials, no writes),
 *   - the image the UI actually renders for it (verified venue photo →
 *     labelled AI-generated representative → icon tile),
 *   - menu rows (famous/signature dishes) + provenance hosts,
 *   - the remaining action, if any.
 *
 * HONESTY: the script reports what IS — it never invents a status. A place
 * that cannot be probed is recorded as "probe-failed", not "absent".
 *
 * Run:  bun scripts/foodie-enrichment/build-image-inventory.ts [--base URL]
 * Out:  scripts/foodie-enrichment/worksheets/image-inventory.json
 *       docs/image-inventory.md (human-readable, committed)
 */

import { VENUE_IMAGES } from "@/data/venue-images";
import { representativeImageFor } from "@/data/representative-images";
import { existsSync } from "node:fs";
import { join } from "node:path";

const BASE = process.argv.includes("--base")
  ? process.argv[process.argv.indexOf("--base") + 1]
  : "https://foodie-arjun-123b.vercel.app";

const ROOT = join(import.meta.dir, "..", "..");

interface Row {
  batch: string;
  set: string;
  id: string;
  slug?: string;
  name: string;
  category: string;
  city: string;
  locality?: string;
  sourceUrl?: string;
}

/** Parse restaurant insert tuples — select-style or values-style, id with or
 *  without a `::uuid` cast; trailing `-- comment` on a value line is allowed. */
async function parseRestaurantBatches(file: string, batch: string, set: string): Promise<Row[]> {
  const text = await Bun.file(join(ROOT, file)).text();
  const re =
    /'([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})'(?:\s*::\s*uuid)?,\s*\n\s*'([^']+)',\s*\n\s*'([a-z_]+)',\s*\n\s*'([^']*)',\s*\n\s*'([^']*)'/g;
  const rows: Row[] = [];
  for (const m of text.matchAll(re)) {
    const city = m[5] ?? "";
    rows.push({
      batch,
      // the REV2 candidate mixes Tirupati + Doddaballapura additions — classify by city
      set:
        city === "Tirupati"
          ? "tirupati-food"
          : set === "tirupati-food"
            ? "doddaballapura-nagadenahalli" // REV2's non-Tirupati additions belong to that set
            : set,
      id: m[1],
      name: m[2],
      category: m[3],
      city,
      locality: undefined,
    });
  }
  return rows;
}

/** Batch-011 `places` tuples: (uuid::uuid, 'slug', 'type', 'Name', …). */
async function parseBatch011(file: string): Promise<Row[]> {
  const text = await Bun.file(join(ROOT, file)).text();
  const re =
    /'([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})'::uuid,\s*\n\s*'([a-z0-9-]+)',\s*\n\s*'([a-z_]+)',\s*\n\s*'([^']+)',\s*\n\s*(?:null|'[^']*'),[^\n]*\n\s*(?:null|'([^']*)'),[^\n]*\n\s*'([^']*)'/g;
  const rows: Row[] = [];
  for (const m of text.matchAll(re)) {
    rows.push({
      batch: "011",
      set: "tirupati-hotels-attractions",
      id: m[1],
      slug: m[2],
      category: m[3],
      name: m[4],
      locality: m[5],
      city: m[6],
      sourceUrl: undefined,
    });
  }
  return rows;
}

async function getJson(path: string): Promise<unknown | null> {
  try {
    const res = await fetch(`${BASE}${path}`, {
      headers: { accept: "application/json" },
      signal: AbortSignal.timeout(20_000),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function mapLimit<T, R>(items: T[], limit: number, fn: (t: T) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let i = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (i < items.length) {
      const idx = i++;
      out[idx] = await fn(items[idx]);
    }
  });
  await Promise.all(workers);
  return out;
}

interface Probe {
  inProduction: boolean;
  prodId?: string;
  photos?: number;
  famous?: number;
  signature?: number;
  provenanceHosts?: string[];
  probeFailed?: boolean;
}

async function probeProduction(row: Row): Promise<Probe> {
  const search = (await getJson(
    `/api/restaurants/search?q=${encodeURIComponent(row.name)}`
  )) as { places?: { id: string; name: string }[] } | null;
  if (!search) return { inProduction: false, probeFailed: true };
  const hits = search.places ?? [];
  const exact = hits.find(
    (p) => p.name.trim().toLowerCase() === row.name.trim().toLowerCase()
  );
  if (!exact) return { inProduction: false };
  const detail = (await getJson(`/api/restaurants/${exact.id}`)) as {
    place?: {
      photos?: unknown[];
      famousDishes?: { name: string; sourceUrl?: string | null }[];
      signatureDishes?: { name: string; sourceUrl?: string | null }[];
      sourceUrl?: string | null;
    } | null;
  } | null;
  if (!detail?.place) return { inProduction: true, prodId: exact.id, probeFailed: true };
  const p = detail.place;
  const hosts = new Set<string>();
  for (const d of [...(p.famousDishes ?? []), ...(p.signatureDishes ?? [])]) {
    if (!d.sourceUrl) continue;
    try {
      hosts.add(new URL(d.sourceUrl).hostname.replace(/^www\./, ""));
    } catch {
      /* ignore malformed */
    }
  }
  if (p.sourceUrl) {
    try {
      hosts.add(`page:${new URL(p.sourceUrl).hostname.replace(/^www\./, "")}`);
    } catch {
      /* ignore */
    }
  }
  return {
    inProduction: true,
    prodId: exact.id,
    photos: p.photos?.length ?? 0,
    famous: p.famousDishes?.length ?? 0,
    signature: p.signatureDishes?.length ?? 0,
    provenanceHosts: [...hosts],
  };
}

/** What the UI renders for this place's imagery, in priority order. */
function imagePlan(row: Row, probe: Probe): string {
  const id = probe.prodId ?? row.id;
  const hasVenue = Boolean(VENUE_IMAGES[id]);
  const rep =
    representativeImageFor("food", row.category) ??
    representativeImageFor("poi", row.category);
  if (hasVenue) {
    const v = VENUE_IMAGES[id];
    return `venue photo (${v.license} — ${v.credit})`;
  }
  if (rep) return "labelled AI-generated representative";
  if ((probe.photos ?? 0) > 0) return `remote photos only (${probe.photos})`;
  return "icon tile fallback";
}

async function main() {
  const sets: { set: string; batch: string; rows: Row[] }[] = [
    {
      set: "doddaballapura-nagadenahalli",
      batch: "001",
      rows: await parseRestaurantBatches(
        "supabase/insert-batch-001-pilot-8.sql",
        "001",
        "doddaballapura-nagadenahalli"
      ),
    },
    {
      set: "gitam-road-corridor",
      batch: "002",
      rows: await parseRestaurantBatches(
        "supabase/insert-batch-002-gitam-6.sql",
        "002",
        "gitam-road-corridor"
      ),
    },
    {
      set: "doddaballapura-nagadenahalli",
      batch: "005",
      rows: await parseRestaurantBatches(
        "supabase/insert-batch-005-round3-62.sql",
        "005",
        "doddaballapura-nagadenahalli"
      ),
    },
    {
      set: "doddaballapura-nagadenahalli",
      batch: "006",
      rows: await parseRestaurantBatches(
        "supabase/insert-batch-006-round4-1.sql",
        "006",
        "doddaballapura-nagadenahalli"
      ),
    },
    {
      set: "tirupati-food",
      batch: "009-rev2",
      rows: await parseRestaurantBatches(
        "supabase/review-candidates/insert-batch-009-p3-places-revised.sql",
        "009-rev2",
        "tirupati-food"
      ),
    },
    {
      set: "tirupati-hotels-attractions",
      batch: "011",
      rows: await parseBatch011("supabase/review-candidates/insert-batch-011-p4-places.sql"),
    },
  ];

  console.error(
    "parsed rows:",
    sets.map((s) => `${s.batch}:${s.rows.length}`).join(" ")
  );

  // re-group by SET (a batch's rows may span sets — REV2 mixes cities),
  // preserving first-seen order and recording which batches fed each set
  const setOrder: string[] = [];
  const setBatches = new Map<string, Set<string>>();
  const setRows = new Map<string, Row[]>();
  for (const s of sets) {
    for (const r of s.rows) {
      if (!setRows.has(r.set)) {
        setRows.set(r.set, []);
        setBatches.set(r.set, new Set());
        setOrder.push(r.set);
      }
      setBatches.get(r.set)!.add(s.batch);
      setRows.get(r.set)!.push(r);
    }
  }
  // de-dupe within set by name (a name may appear in more than one batch file's
  // guard comments — the tuple regex should prevent this, but never assume)
  for (const [setName, rows] of setRows) {
    const seen = new Set<string>();
    setRows.set(
      setName,
      rows.filter((r) => {
        const k = r.name.toLowerCase();
        if (seen.has(k)) return false;
        seen.add(k);
        return true;
      })
    );
  }
  const allRows = sets.flatMap((s) => s.rows);
  console.error(
    `parsed ${allRows.length} rows:`,
    sets.map((s) => `${s.batch}:${s.rows.length}`).join(" ")
  );

  const probes = await mapLimit(allRows, 4, async (row) => {
    const probe = await probeProduction(row);
    return { row, probe };
  });

  let n = 0;
  const lines: string[] = [];
  const json: Record<string, unknown>[] = [];

  lines.push("# FOODIE — Place-by-Place Image & Menu Inventory");
  lines.push("");
  lines.push(
    `Generated by \`scripts/foodie-enrichment/build-image-inventory.ts\` on ${new Date().toISOString()} — READ-ONLY probes against \`${BASE}\` (public API, no credentials, no writes).`
  );
  lines.push("");
  lines.push(
    "Image chain per place (highest first): ① verified venue photo (bundled, licensed, attributed) → ② labelled AI-generated representative (category-level, never presented as the venue) → ③ remote photos stored on the row → ④ professional icon tile."
  );
  lines.push("");

  for (const setName of setOrder) {
    const rows = setRows.get(setName) ?? [];
    lines.push(
      `## Set: ${setName} — batches ${[...setBatches.get(setName)!].join(" + ")} (${rows.length} rows)`
    );
    lines.push("");
    lines.push(
      "| Place | Category | City | In production | Photos on row | Menu rows | Menu provenance | Rendered image | Action |"
    );
    lines.push("|---|---|---|---|---|---|---|---|---|");
    for (const { row, probe } of probes.filter((p) => p.row.set === setName)) {
      n++;
      const menu = (probe.famous ?? 0) + (probe.signature ?? 0);
      const action = !probe.inProduction
        ? probe.probeFailed
          ? "probe failed — re-run"
          : row.batch === "011"
            ? "owner-approved Batch-011 SQL (pending owner execution)"
            : "missing from production — owner decision"
        : (probe.photos ?? 0) === 0 && !VENUE_IMAGES[probe.prodId ?? row.id]
          ? "venue photo wanted (source not yet identified)"
          : "—";
      const plan = imagePlan(row, probe);
      lines.push(
        `| ${row.name} | ${row.category} | ${row.city} | ${probe.probeFailed ? "probe-failed" : probe.inProduction ? "YES" : "no"} | ${probe.photos ?? "—"} | ${menu || "—"} | ${(probe.provenanceHosts ?? []).join(", ") || "—"} | ${plan} | ${action} |`
      );
      json.push({
        set: setName,
        batch: row.batch,
        id: row.id,
        prodId: probe.prodId ?? null,
        slug: row.slug ?? null,
        name: row.name,
        category: row.category,
        city: row.city,
        inProduction: probe.inProduction,
        probeFailed: probe.probeFailed ?? false,
        photosOnRow: probe.photos ?? null,
        menuRows: menu,
        menuProvenance: probe.provenanceHosts ?? [],
        renderedImage: plan,
        action,
      });
    }
    lines.push("");
  }

  const summary = {
    total: json.length,
    inProduction: json.filter((r) => r.inProduction).length,
    withVenuePhoto: json.filter(
      (r) => VENUE_IMAGES[(r.prodId as string) ?? (r.id as string)]
    ).length,
    withMenuRows: json.filter((r) => (r.menuRows as number) > 0).length,
    missingFromProduction: json.filter(
      (r) => !r.inProduction && !r.probeFailed
    ).length,
  };
  lines.push("## Reconciliation by place set");
  lines.push("");
  lines.push(
    "| Set | Required | In production | Missing | Duplicates found | Verified venue photos | Sourced menu rows | Unresolved identities |"
  );
  lines.push("|---|---|---|---|---|---|---|---|");
  for (const setName of setOrder) {
    const rows = json.filter((r) => r.set === setName);
    const present = rows.filter((r) => r.inProduction).length;
    const missing = rows.filter((r) => !r.inProduction && !r.probeFailed).length;
    // duplicates: within-set name collisions removed during parsing (0 expected —
    // the batch guards prevent them); reported explicitly so an audit can trust it
    const totalParsed = setRows.get(setName)?.length ?? rows.length;
    const dupes = totalParsed - rows.length;
    const photos = rows.filter(
      (r) => VENUE_IMAGES[(r.prodId as string) ?? (r.id as string)]
    ).length;
    const menus = rows.filter((r) => (r.menuRows as number) > 0).length;
    const unresolved =
      setName === "epicruise-hangouts" ? rows.length : 0; // documented negatives — see worklog
    lines.push(
      `| ${setName} | ${rows.length} | ${present} | ${missing} | ${dupes} | ${photos} | ${menus} | ${unresolved} |`
    );
  }
  lines.push("");
  lines.push(
    "Notes: Batch-011 rows are the owner-approved import candidate — intentionally NOT executed here (production SQL requires the owner's manual Supabase SQL Editor run). Epicruise and Hangouts have no place rows: their identities were investigated and remain unresolved negative results in the project history — no replacement businesses were invented."
  );
  lines.push("");
  lines.push("## Totals");
  lines.push("");
  lines.push(`- Rows inventoried: **${summary.total}**`);
  lines.push(`- Live in production: **${summary.inProduction}**`);
  lines.push(`- Missing from production (owner-blocked/pending): **${summary.missingFromProduction}**`);
  lines.push(`- With verified bundled venue photo: **${summary.withVenuePhoto}**`);
  lines.push(`- With menu rows (sourced): **${summary.withMenuRows}**`);
  lines.push("");

  await Bun.write(
    join(ROOT, "scripts/foodie-enrichment/worksheets/image-inventory.json"),
    JSON.stringify({ generatedAt: new Date().toISOString(), base: BASE, summary, rows: json }, null, 2)
  );
  await Bun.write(join(ROOT, "docs/image-inventory.md"), lines.join("\n"));
  console.error(`inventoried ${n} rows → docs/image-inventory.md`);
  console.log(JSON.stringify(summary));
}

// venue asset existence sanity (bundled files must exist on disk)
for (const [id, v] of Object.entries(VENUE_IMAGES)) {
  const master = join(ROOT, "public", v.src);
  if (!existsSync(master)) {
    console.error(`VENUE ASSET MISSING on disk: ${id} -> ${v.src}`);
    process.exitCode = 1;
  }
}

await main();
