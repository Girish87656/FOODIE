/**
 * Foodie — Prototype 2 enrichment: license-aware PHOTO research (READ-ONLY).
 *
 * Sources (keyless, deliberately license-aware — mirroring the repo's
 * established photo-provenance precedent from scripts/research-round2-photos.ts):
 *   1. Wikimedia Commons API  — search + imageinfo/extmetadata
 *      (returns license short name, artist, description, direct file URL).
 *   2. Openverse API          — license-filtered (cc0, pdm, by, by-sa)
 *      results carrying license, creator and landing page.
 *
 * Deliberately NOT used: generic image-scrape services that return web images
 * with no usage-rights information — a photo without established rights must
 * not enter the database (see supabase/migration-006-photo-licensing.sql).
 *
 * Machine verdicts are CONSERVATIVE: a candidate is auto-approvable only when
 * (a) the source title contains the place's distinctive name token ("exact")
 * and (b) the license is recorded verbatim. Everything else is persisted as
 * evidence for human review and NEVER becomes SQL.
 *
 * Output: evidence/photos/<slug>.json (one per place) — raw and reviewable.
 * No git writes, no DB writes, no app changes.
 */

import { mkdirSync, writeFileSync, existsSync, readFileSync } from "fs";
import { join } from "path";
import { fetchLivePlaces, politeFetch, RESEARCH_UA, slugify, nameMatchKind } from "./lib/live";
import type { PhotoCandidate, PlaceEvidence } from "./lib/types";

/** Repo root — pipeline scripts are always run from the repo root (bun scripts/foodie-enrichment/…). */
const ROOT = process.cwd();
const HERE = join(ROOT, "scripts", "foodie-enrichment");
const OUT = join(HERE, "evidence", "photos");
mkdirSync(OUT, { recursive: true });
const RETRIEVED = new Date().toISOString().slice(0, 10);

interface Args {
  fromIndex: number; // 1-based resume index
  only: string | null; // exact place name filter
}
const args: Args = {
  fromIndex: Number(process.argv[2] ?? "1") || 1,
  only: process.argv[3] ?? null,
};

async function commonsSearch(query: string): Promise<Array<{ title: string; pageid: number }>> {
  const url =
    `https://commons.wikimedia.org/w/api.php?action=query&format=json&list=search` +
    `&srnamespace=6&srlimit=5&srsearch=${encodeURIComponent(query)}`;
  const res = await politeFetch(url, { "User-Agent": RESEARCH_UA, Accept: "application/json" });
  if (!res.ok) throw new Error(`commons search ${res.status}`);
  const data = (await res.json()) as { query?: { search?: Array<{ title: string; pageid: number }> } };
  return data.query?.search ?? [];
}

interface CommonsImageInfo {
  url: string;
  descriptionurl: string;
  extmetadata?: Record<string, { value?: string }>;
}

async function commonsImageInfo(title: string): Promise<CommonsImageInfo | null> {
  const url =
    `https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=imageinfo` +
    `&iiprop=url|extmetadata&titles=${encodeURIComponent(title)}`;
  const res = await politeFetch(url, { "User-Agent": RESEARCH_UA, Accept: "application/json" });
  if (!res.ok) throw new Error(`commons imageinfo ${res.status}`);
  const data = (await res.json()) as {
    query?: { pages?: Record<string, { imageinfo?: CommonsImageInfo[] }> };
  };
  const pages = Object.values(data.query?.pages ?? {});
  return pages[0]?.imageinfo?.[0] ?? null;
}

function stripHtml(s: string | undefined): string {
  if (!s) return "";
  return s
    .replace(/<[^>]*>/g, " ")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 160);
}

async function openverseSearch(query: string): Promise<
  Array<{ title: string | null; url: string; foreign_landing_url: string | null; license: string; license_version: string | null; creator: string | null }>
> {
  const url =
    `https://api.openverse.org/v1/images/?page_size=5` +
    `&license=cc0,pdm,by,by-sa&q=${encodeURIComponent(query)}`;
  const res = await politeFetch(url, { "User-Agent": RESEARCH_UA, Accept: "application/json" });
  if (res.status === 429) throw new Error("openverse rate-limited (429) — backing off");
  if (!res.ok) throw new Error(`openverse ${res.status}`);
  const data = (await res.json()) as { results?: Array<Record<string, unknown>> };
  return (data.results ?? []).map((r) => ({
    title: (r.title as string | null) ?? null,
    url: String(r.url ?? ""),
    foreign_landing_url: (r.foreign_landing_url as string | null) ?? null,
    license: String(r.license ?? ""),
    license_version: (r.license_version as string | null) ?? null,
    creator: (r.creator as string | null) ?? null,
  }));
}

async function researchPlace(name: string, id: string, city: string): Promise<PlaceEvidence<PhotoCandidate>> {
  const queries = [`${name} ${city}`, name];
  const candidates: PhotoCandidate[] = [];
  const errors: string[] = [];

  // --- Wikimedia Commons -------------------------------------------------
  for (const q of queries.slice(0, 1)) {
    try {
      const hits = await commonsSearch(q);
      for (const hit of hits.slice(0, 3)) {
        try {
          const info = await commonsImageInfo(hit.title);
          if (!info?.url) continue;
          const license = stripHtml(info.extmetadata?.LicenseShortName?.value);
          const artist = stripHtml(info.extmetadata?.Artist?.value);
          const matchKind = nameMatchKind(hit.title, name);
          candidates.push({
            restaurantId: id,
            restaurantName: name,
            sourceKind: "wikimedia_commons",
            imageUrl: info.url,
            sourceUrl: info.descriptionurl || `https://commons.wikimedia.org/wiki/${encodeURIComponent(hit.title)}`,
            license,
            attribution: artist,
            matchKind,
            matchNotes: `Commons file "${hit.title}" vs place "${name}" → ${matchKind}${license ? ` · license ${license}` : " · NO LICENSE RECORDED"}`,
            retrievedOn: RETRIEVED,
          });
        } catch (err) {
          errors.push(`${name}: imageinfo ${hit.title}: ${(err as Error).message}`);
        }
      }
    } catch (err) {
      errors.push(`${name}: commons search: ${(err as Error).message}`);
    }
  }

  // --- Openverse (license-filtered) ---------------------------------------
  try {
    const hits = await openverseSearch(queries[0]);
    for (const hit of hits) {
      if (!hit.url) continue;
      const title = hit.title ?? "";
      const license = [hit.license.toUpperCase(), hit.license_version].filter(Boolean).join(" ");
      const matchKind = nameMatchKind(title, name);
      candidates.push({
        restaurantId: id,
        restaurantName: name,
        sourceKind: "openverse",
        imageUrl: hit.url,
        sourceUrl: hit.foreign_landing_url ?? hit.url,
        license,
        attribution: hit.creator ?? "",
        matchKind,
        matchNotes: `Openverse "${title || "(untitled)"}" vs place "${name}" → ${matchKind}${license ? ` · license ${license}` : " · NO LICENSE"}`,
        retrievedOn: RETRIEVED,
      });
    }
  } catch (err) {
    errors.push(`${name}: openverse: ${(err as Error).message}`);
  }

  return { restaurantId: id, restaurantName: name, queries, candidates, errors, retrievedOn: RETRIEVED };
}

async function main() {
  const places = await fetchLivePlaces();
  const targets = places
    .map((p, i) => ({ ...p, index: i + 1 }))
    .filter((p) => p.index >= args.fromIndex)
    .filter((p) => (args.only ? p.name === args.only : true));

  console.log(`[photos] ${places.length} live places; researching ${targets.length} (from #${args.fromIndex}${args.only ? `, only "${args.only}"` : ""})`);
  let done = 0;
  let approved = 0;
  for (const place of targets) {
    const file = join(OUT, `${slugify(place.name)}.json`);
    if (existsSync(file) && !args.only) {
      try {
        const prev = JSON.parse(readFileSync(file, "utf8")) as PlaceEvidence<PhotoCandidate>;
        if (prev.retrievedOn === RETRIEVED) {
          approved += prev.candidates.filter((c) => c.matchKind === "exact" && c.license).length;
          done++;
          continue; // already researched today — resumable
        }
      } catch {
        /* stale evidence — re-research */
      }
    }
    const evidence = await researchPlace(place.name, place.id, place.city);
    writeFileSync(file, JSON.stringify(evidence, null, 2));
    const ok = evidence.candidates.filter((c) => c.matchKind === "exact" && c.license).length;
    approved += ok;
    done++;
    if (done % 10 === 0 || ok > 0) {
      console.log(`[photos] ${done}/${targets.length} researched · ${place.name}: ${evidence.candidates.length} candidates (${ok} auto-approvable)${evidence.errors.length ? ` · ERRORS: ${evidence.errors.join("; ")}` : ""}`);
    }
  }
  console.log(`[photos] DONE — ${done} places researched, ${approved} machine-approvable candidates total. Evidence: ${OUT}`);
}

main().catch((err) => {
  console.error("[photos] FATAL:", err);
  process.exit(1);
});
