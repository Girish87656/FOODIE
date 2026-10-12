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
const EVIDENCE_MENUS = join(HERE, "evidence", "menus");
const OUT = join(HERE, "worksheets");

function loadEvidence<T>(dir: string): PlaceEvidence<T>[] {
  const out: PlaceEvidence<T>[] = [];
  for (const f of readdirSync(dir)) {
    if (!f.endsWith(".json")) continue;
    try {
      out.push(JSON.parse(readFileSync(join(dir, f), "utf8")) as PlaceEvidence<T>);
    } catch {
      /* unreadable evidence file — skip, reported below by counts */
    }
  }
  return out;
}

function main() {
  const photos = loadEvidence<PhotoCandidate>(EVIDENCE_PHOTOS);
  const menus = loadEvidence<DishCandidate>(EVIDENCE_MENUS);

  // ---- photos ---------------------------------------------------------------
  const photoRows: PhotoWorksheetRow[] = [];
  const seenUrls = new Map<string, string>(); // normalized url -> first key
  const norm = (u: string) => u.trim().replace(/^https?:\/\//, "").toLowerCase();
  const sortedPhotoCandidates = photos
    .flatMap((p) => p.candidates)
    .sort((a, b) =>
      a.restaurantName.localeCompare(b.restaurantName) || a.imageUrl.localeCompare(b.imageUrl)
    );
  for (const c of sortedPhotoCandidates) {
    const key = `${c.restaurantId}|${norm(c.imageUrl)}`;
    const first = seenUrls.get(norm(c.imageUrl));
    const verdict: PhotoWorksheetRow["verdict"] =
      c.matchKind === "exact" && c.license.trim() ? "approved_machine" : "needs_human_review";
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
