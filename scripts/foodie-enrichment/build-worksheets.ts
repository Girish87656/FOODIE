/**
 * Foodie — enrichment worksheets: merge raw research evidence into
 * reviewable, deduplicated worksheets that feed the SQL generator.
 *
 * Verdict rules (conservative, recorded — never hidden):
 *   photos: auto-approved ONLY when matchKind === "exact" AND license is
 *           recorded. Everything else -> needs_human_review (excluded from SQL).
 *   menus:  every candidate keeps its verbatim evidence + source URL; items
 *           without any source URL are DROPPED (no provenance, no row).
 *
 * Dedup guarantees:
 *   photos: one candidate per normalized image URL (first wins by stable sort).
 *   menus:  one candidate per (restaurantId, lower(name)).
 */

import { readdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { slugify } from "./lib/live";
import type {
  DishCandidate,
  MenuWorksheetRow,
  PhotoCandidate,
  PhotoWorksheetRow,
  PlaceEvidence,
} from "./lib/types";

/** Repo root — pipeline scripts are always run from the repo root (bun scripts/foodie-enrichment/…). */
const ROOT = process.cwd();
const HERE = join(ROOT, "scripts", "foodie-enrichment");
const EVIDENCE_PHOTOS = join(HERE, "evidence", "photos");
const EVIDENCE_PHOTOS_DEEP = join(HERE, "evidence", "photos-deep");
const EVIDENCE_MENUS = join(HERE, "evidence", "menus");
const OUT = join(HERE, "worksheets");

function loadEvidence<T>(dir: string, prefix: string | null = null): PlaceEvidence<T>[] {
  const out: PlaceEvidence<T>[] = [];
  for (const f of readdirSync(dir)) {
    if (!f.endsWith(".json")) continue;
    if (prefix && !f.startsWith(prefix)) continue;
    try {
      out.push(JSON.parse(readFileSync(join(dir, f), "utf8")) as PlaceEvidence<T>);
    } catch {
      /* unreadable evidence file — skip, reported below by counts */
    }
  }
  return out;
}

/**
 * Corridor identity gate (worksheet-level, independent of the researcher's
 * own gate — defense in depth). A photo candidate may only ever become SQL
 * when the SOURCE TEXT carries a corridor location token (doddaballapur /
 * doddaballapura / nagadenahalli / gitam / the place's own locality). Same
 * name alone is NOT identity: "Udupi Upahar, Wilson Garden, Bangalore" is a
 * different business from "Udupi Upahar, Kasaba Police Station Road,
 * Doddaballapur". Candidates failing this gate are downgraded to
 * needs_human_review with the reason recorded — never silently dropped.
 */
function corridorIdentityOk(row: PhotoCandidate): boolean {
  const tokens = ["doddaballapur", "doddaballapura", "nagadenahalli", "gitam"];
  const haystack = `${row.matchNotes} ${row.description ?? ""}`.toLowerCase();
  return tokens.some((t) => haystack.includes(t));
}

function main() {
  const photos = loadEvidence<PhotoCandidate>(EVIDENCE_PHOTOS);
  // Deep second pass (research-photos-deep.ts) — commons-*/openverse-* files
  // carry candidates; other prefixes (townwide summaries, web scans) differ in
  // shape and are excluded.
  const deepPhotos = [
    ...loadEvidence<PhotoCandidate>(EVIDENCE_PHOTOS_DEEP, "commons-"),
    ...loadEvidence<PhotoCandidate>(EVIDENCE_PHOTOS_DEEP, "openverse-"),
  ].filter((e) => Array.isArray((e as unknown as { candidates?: unknown }).candidates));
  const menus = loadEvidence<DishCandidate>(EVIDENCE_MENUS);

  // ---- photos ---------------------------------------------------------------
  const photoRows: PhotoWorksheetRow[] = [];
  const seenUrls = new Map<string, string>(); // normalized url -> first key
  const norm = (u: string) => u.trim().replace(/^https?:\/\//, "").toLowerCase();
  const cleanUrl = (u: string) => u.replace(/\?utm_source=[^\s]*$/, ""); // strip Commons imageinfo utm params
  const sortedPhotoCandidates = [...photos, ...deepPhotos]
    .flatMap((p) => p.candidates)
    .sort((a, b) =>
      a.restaurantName.localeCompare(b.restaurantName) || a.imageUrl.localeCompare(b.imageUrl)
    );
  let corridorDowngraded = 0;
  for (const c0 of sortedPhotoCandidates) {
    const c = { ...c0, imageUrl: cleanUrl(c0.imageUrl) };
    const key = `${c.restaurantId}|${norm(c.imageUrl)}`;
    const first = seenUrls.get(norm(c.imageUrl));
    let verdict: PhotoWorksheetRow["verdict"] =
      c.matchKind === "exact" && c.license.trim() ? "approved_machine" : "needs_human_review";
    if (verdict === "approved_machine" && !corridorIdentityOk(c)) {
      verdict = "needs_human_review";
      corridorDowngraded++;
      c.matchKind = "fuzzy";
      c.matchNotes += " · WORKSHEET GATE: no corridor location token — same-name match is NOT this place";
    }
    photoRows.push({ ...c, verdict, duplicateOf: first ? first : null });
    if (!first) seenUrls.set(norm(c.imageUrl), key);
  }
  const approved = photoRows.filter((r) => r.verdict === "approved_machine" && !r.duplicateOf);

  // ---- menus ------------------------------------------------------------------
  const menuRows: MenuWorksheetRow[] = [];
  const seenDishes = new Set<string>();
  const sortedMenuCandidates = menus
    .flatMap((p) => p.candidates)
    .sort((a, b) =>
      a.restaurantName.localeCompare(b.restaurantName) ||
      a.name.localeCompare(b.name) ||
      (a.price ?? 0) - (b.price ?? 0)
    );
  let droppedNoSource = 0;
  for (const c of sortedMenuCandidates) {
    if (!c.sourceUrl.trim()) {
      droppedNoSource++;
      continue; // no provenance → no row (honesty rule)
    }
    const key = `${c.restaurantId}|${c.name.toLowerCase()}`;
    if (seenDishes.has(key)) continue;
    seenDishes.add(key);
    menuRows.push(c);
  }

  writeFileSync(
    join(OUT, "photo-enrichment.json"),
    JSON.stringify(
      {
        generatedOn: new Date().toISOString(),
        counts: {
          candidates: photoRows.length,
          approvedMachine: approved.length,
          needsHumanReview: photoRows.filter((r) => r.verdict === "needs_human_review").length,
          duplicatesSkipped: photoRows.filter((r) => r.duplicateOf).length,
          corridorDowngraded,
        },
        rows: photoRows,
      },
      null,
      2
    )
  );
  writeFileSync(
    join(OUT, "menu-enrichment.json"),
    JSON.stringify(
      {
        generatedOn: new Date().toISOString(),
        counts: {
          candidates: sortedMenuCandidates.length,
          rows: menuRows.length,
          droppedNoSource,
          placesWithItems: new Set(menuRows.map((r) => r.restaurantId)).size,
        },
        rows: menuRows,
      },
      null,
      2
    )
  );

  console.log(`[worksheet] photos: ${photoRows.length} candidates → ${approved.length} machine-approved (deduped), ${photoRows.filter((r) => r.verdict === "needs_human_review").length} need human review`);
  for (const r of approved) console.log(`  ✓ ${r.restaurantName} ← ${r.sourceKind} · ${r.license} · ${r.imageUrl.slice(0, 90)}`);
  console.log(`[worksheet] menus: ${menuRows.length} items across ${new Set(menuRows.map((r) => r.restaurantId)).size} places (dropped ${droppedNoSource} without source URL)`);
  const byPlace = new Map<string, number>();
  for (const r of menuRows) byPlace.set(r.restaurantName, (byPlace.get(r.restaurantName) ?? 0) + 1);
  for (const [name, n] of [...byPlace.entries()].sort()) console.log(`  • ${name}: ${n} items`);
}

main();
