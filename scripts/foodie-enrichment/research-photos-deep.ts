/**
 * Foodie — Prototype 2 photo enrichment: DEEP second-pass research (READ-ONLY).
 *
 * Why this exists: the first pass (research-photos.ts) searched Commons and
 * Openverse with ONE query variant per place and found zero candidates. This
 * pass is deliberately broader, per the publication checklist:
 *
 *   Tier A — Wikimedia Commons API (keyless, free-license host):
 *     - per place: "<name> <city>", "<name>", "<name> Doddaballapur"
 *     - town-wide scans (once, not per place): Doddaballapur / Doddaballapura
 *       / GITAM University Bangalore / Nagadenahalli etc.
 *     - Category namespace (ns=14) search for local categories, then
 *       categorymembers enumeration of any found category (files only).
 *     - One generator=search + prop=imageinfo call per query (url + extmetadata
 *       + mime + size), so license/artist come from the authoritative
 *       file-page metadata.
 *
 *   Tier B — Openverse API (keyless anonymous, RATE-LIMITED):
 *     - per place: "<name>" page_size=10, NO license filter — the response
 *       carries each hit's license, creator and landing page, so a single
 *       call both discovers and documents. Acceptance still requires a
 *       permissive license (cc0/pdm/by/by-sa) later in the pipeline.
 *     - budget-aware: probe once first; on repeated 429 stop the tier and
 *       record partial coverage honestly.
 *
 *   Tier C — official web presence (z-ai web_search, paced):
 *     - one query per place: "<name>" + locality/city — classifying results:
 *       official-domain sites, official social pages (facebook/instagram),
 *       listing platforms (magicpin/justdial/zomato — photos NOT reusable),
 *       news/other. Any official-site lead is stored as evidence; an
 *       official site does NOT by itself grant reuse rights — only an
 *       explicit license/permission statement on the page could, and that is
 *       recorded for human review, never auto-accepted.
 *
 *   (Google Places Photos tier is CLOSED for this project: no Google Maps
 *    credentials exist in the repository environment — checked, names only.)
 *
 * Machine verdicts stay CONSERVATIVE and are only computed for Commons/
 * Openverse rows: auto-approvable requires
 *   (a) distinctive-name token in the source title ("exact"),
 *   (b) location evidence (doddaballapur/bengaluru/bangalore/gitam or the
 *       place's own locality token) in title+description,
 *   (c) a recorded license (Commons) or a permissive license (Openverse),
 *   (d) an image mime type.
 * Everything else persists as evidence and NEVER becomes SQL.
 *
 * Tiers are runnable independently and resumable:
 *   bun scripts/foodie-enrichment/research-photos-deep.ts commons
 *   bun scripts/foodie-enrichment/research-photos-deep.ts openverse
 *   bun scripts/foodie-enrichment/research-photos-deep.ts web [fromIndex]
 *
 * Output: evidence/photos-deep/<tier>-<slug>.json (+ a coverage summary
 * written per tier). No DB writes, no app changes, no git writes.
 */

import { mkdirSync, writeFileSync, existsSync, readFileSync } from "fs";
import { join } from "path";
import { fetchLivePlaces, politeFetch, RESEARCH_UA, slugify, nameMatchKind } from "./lib/live";
import type { PhotoCandidate, PlaceEvidence } from "./lib/types";

const ROOT = process.cwd();
const HERE = join(ROOT, "scripts", "foodie-enrichment");
const OUT = join(HERE, "evidence", "photos-deep");
mkdirSync(OUT, { recursive: true });
const RETRIEVED = new Date().toISOString().slice(0, 10);

const tier = (process.argv[2] ?? "").toLowerCase();
const fromIndex = Number(process.argv[3] ?? "1") || 1;
const only = process.argv[4] ?? null;

if (!["commons", "openverse", "web"].includes(tier)) {
  console.error("usage: research-photos-deep.ts <commons|openverse|web> [fromIndex] [onlyExactName]");
  process.exit(2);
}

/** Town-wide tokens — every live place sits on the GITAM–Doddaballapur corridor. */
const TOWN_SCANS = [
  "Doddaballapur",
  "Doddaballapura",
  "Doddaballapur restaurant",
  "GITAM University Bangalore",
  "GITAM Bengaluru campus",
  "Nagadenahalli Bengaluru",
];

interface Candidate extends PhotoCandidate {
  mime?: string;
  width?: number;
  height?: number;
  licenseUrl?: string | null;
  description?: string;
  tierB?: string; // which deep tier produced the row
}

// ---------------------------------------------------------------------------
// Wikimedia Commons
// ---------------------------------------------------------------------------

interface CommonsPage {
  title: string;
  imageinfo?: Array<{
    url: string;
    descriptionurl: string;
    mime?: string;
    width?: number;
    height?: number;
    extmetadata?: Record<string, { value?: string }>;
  }>;
}

function stripHtml(s: string | undefined): string {
  if (!s) return "";
  return s
    .replace(/<[^>]*>/g, " ")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 240);
}

async function commonsGeneratorSearch(query: string): Promise<CommonsPage[]> {
  const url =
    `https://commons.wikimedia.org/w/api.php?action=query&format=json&generator=search` +
    `&gsrnamespace=6&gsrlimit=10&prop=imageinfo&iiprop=url|mime|size|extmetadata` +
    `&gsrsearch=${encodeURIComponent(query)}`;
  const res = await politeFetch(url, { "User-Agent": RESEARCH_UA, Accept: "application/json" });
  if (!res.ok) throw new Error(`commons search ${res.status}`);
  const data = (await res.json()) as { query?: { pages?: Record<string, CommonsPage> } };
  return Object.values(data.query?.pages ?? {});
}

async function commonsCategorySearch(query: string): Promise<string[]> {
  const url =
    `https://commons.wikimedia.org/w/api.php?action=query&format=json&list=search` +
    `&srnamespace=14&srlimit=10&srsearch=${encodeURIComponent(query)}`;
  const res = await politeFetch(url, { "User-Agent": RESEARCH_UA, Accept: "application/json" });
  if (!res.ok) throw new Error(`commons category search ${res.status}`);
  const data = (await res.json()) as { query?: { search?: Array<{ title: string }> } };
  return (data.query?.search ?? []).map((s) => s.title);
}

async function commonsCategoryMembers(category: string): Promise<string[]> {
  const url =
    `https://commons.wikimedia.org/w/api.php?action=query&format=json&list=categorymembers` +
    `&cmtitle=${encodeURIComponent(category)}&cmtype=file&cmlimit=50`;
  const res = await politeFetch(url, { "User-Agent": RESEARCH_UA, Accept: "application/json" });
  if (!res.ok) throw new Error(`commons categorymembers ${res.status}`);
  const data = (await res.json()) as { query?: { categorymembers?: Array<{ title: string }> } };
  return (data.query?.categorymembers ?? []).map((m) => m.title);
}

function commonsPageToCandidate(p: CommonsPage, restaurantId: string, restaurantName: string): Candidate | null {
  const info = p.imageinfo?.[0];
  if (!info?.url) return null;
  if (info.mime && !/^image\/(jpeg|png|webp)$/.test(info.mime)) return null;
  const license = stripHtml(info.extmetadata?.LicenseShortName?.value);
  const artist = stripHtml(info.extmetadata?.Artist?.value);
  const credit = stripHtml(info.extmetadata?.Credit?.value);
  const description = stripHtml(info.extmetadata?.ImageDescription?.value);
  const licenseUrl = stripHtml(info.extmetadata?.LicenseUrl?.value) || null;
  const matchKind = nameMatchKind(p.title, restaurantName);
  return {
    restaurantId,
    restaurantName,
    sourceKind: "wikimedia_commons",
    imageUrl: info.url,
    sourceUrl: info.descriptionurl || `https://commons.wikimedia.org/wiki/${encodeURIComponent(p.title)}`,
    license,
    attribution: artist || credit,
    matchKind,
    mime: info.mime,
    width: info.width,
    height: info.height,
    licenseUrl,
    description,
    matchNotes:
      `Commons file "${p.title}" vs place "${restaurantName}" → ${matchKind}` +
      `${license ? ` · license ${license}` : " · NO LICENSE RECORDED"}` +
      `${description ? ` · desc: ${description.slice(0, 120)}` : ""}`,
    retrievedOn: RETRIEVED,
    tierB: "commons-deep",
  };
}

async function runCommons(): Promise<void> {
  const places = await fetchLivePlaces();
  const targets = places
    .map((p, i) => ({ ...p, index: i + 1 }))
    .filter((p) => p.index >= fromIndex)
    .filter((p) => (only ? p.name === only : true));

  console.log(`[commons-deep] ${places.length} live places; tier A pass over ${targets.length} (from #${fromIndex})`);

  // Town-wide scans first — one shared pool of location evidence.
  const townWide: CommonsPage[] = [];
  const townErrors: string[] = [];
  for (const q of TOWN_SCANS) {
    try {
      const pages = await commonsGeneratorSearch(q);
      console.log(`[commons-deep] town scan "${q}" → ${pages.length} file hits`);
      townWide.push(...pages);
      // category namespace scan
      const cats = await commonsCategorySearch(q);
      for (const cat of cats) {
        try {
          const members = await commonsCategoryMembers(cat);
          console.log(`[commons-deep] category "${cat}" → ${members.length} files`);
          for (const title of members) {
            townWide.push({ title }); // imageinfo filled below (batch)
          }
        } catch (err) {
          townErrors.push(`category ${cat}: ${(err as Error).message}`);
        }
      }
    } catch (err) {
      townErrors.push(`scan ${q}: ${(err as Error).message}`);
    }
  }
  // Fill imageinfo for members that lack it, and keep only pages whose
  // title/description mentions a specific business-like token (we keep all
  // here; matching happens per place below).
  const infoFilled: CommonsPage[] = [];
  for (const p of townWide) {
    if (p.imageinfo?.length) {
      infoFilled.push(p);
      continue;
    }
    try {
      const pages = await commonsGeneratorSearch(`intitle:"${p.title.replace(/^File:/, "")}"`);
      if (pages.length) infoFilled.push(...pages);
      else infoFilled.push(p); // keep title-only row for the record
    } catch (err) {
      townErrors.push(`imageinfo ${p.title}: ${(err as Error).message}`);
    }
  }
  writeFileSync(join(OUT, `summary-commons-townwide.json`), JSON.stringify({
    tier: "commons",
    kind: "town-wide-scan",
    queries: TOWN_SCANS,
    fileHits: infoFilled.map((p) => ({
      title: p.title,
      url: p.imageinfo?.[0]?.url ?? null,
      license: stripHtml(p.imageinfo?.[0]?.extmetadata?.LicenseShortName?.value) || null,
      description: stripHtml(p.imageinfo?.[0]?.extmetadata?.ImageDescription?.value) || null,
    })),
    errors: townErrors,
    retrievedOn: RETRIEVED,
  }, null, 2));
  console.log(`[commons-deep] town-wide: ${infoFilled.length} distinct file hits (summary written)`);

  // Per-place pass.
  let done = 0;
  let autoApproved = 0;
  /** Corridor tokens only — the metro name (Bengaluru/Bangalore) is NOT a
   *  location proof for corridor businesses (same-name trap, see task notes). */
  const corridorTokens = (locality: string | null): string[] => {
    const base = ["doddaballapur", "doddaballapura", "nagadenahalli", "gitam"];
    if (locality && locality.trim().length >= 4) base.push(locality.trim().toLowerCase());
    return base;
  };
  for (const place of targets) {
    const file = join(OUT, `commons-${slugify(place.name)}.json`);
    if (existsSync(file)) {
      try {
        const prev = JSON.parse(readFileSync(file, "utf8")) as PlaceEvidence<Candidate>;
        if (prev.retrievedOn === RETRIEVED) {
          autoApproved += prev.candidates.filter((c) => c.matchKind === "exact" && c.license).length;
          done++;
          continue;
        }
      } catch {
        /* stale — re-research */
      }
    }
    const city = place.city || "Bengaluru";
    const queries = [`${place.name} ${city}`, place.name];
    const localityPart = (place.locality ?? "").trim();
    if (localityPart && !queries.some((q) => q.includes(localityPart))) {
      queries.push(`${place.name} ${localityPart}`);
    }
    const candidates: Candidate[] = [];
    const errors: string[] = [];
    const seen = new Set<string>();
    for (const q of queries) {
      try {
        const pages = await commonsGeneratorSearch(q);
        for (const p of pages) {
          if (seen.has(p.title)) continue;
          seen.add(p.title);
          const c = commonsPageToCandidate(p, place.id, place.name);
          if (c) candidates.push(c);
        }
      } catch (err) {
        errors.push(`query "${q}": ${(err as Error).message}`);
      }
    }
    // Location gate: auto-approvable additionally requires CORRIDOR location
    // evidence. "Bengaluru/Bangalore" alone is deliberately NOT accepted — the
    // metro region is ~35 km wide and contains same-name businesses (e.g.
    // "Udupi Upahar, Wilson Garden" vs our Doddaballapur-town Udupi Upahar).
    const tokens = corridorTokens(place.locality);
    for (const c of candidates) {
      const haystack = `${c.matchNotes} ${c.description ?? ""}`.toLowerCase();
      const hasLoc = tokens.some((t) => haystack.includes(t));
      if (c.matchKind === "exact" && c.license.trim() && !hasLoc) {
        c.matchKind = "fuzzy"; // downgraded: correct-sounding name, no corridor evidence
        c.matchNotes += " · DOWNGRADED: no corridor location token (doddaballapur/nagadenahalli/gitam/locality) — same-name businesses elsewhere are NOT this place";
      }
    }
    const evidence: PlaceEvidence<Candidate> = {
      restaurantId: place.id,
      restaurantName: place.name,
      queries,
      candidates,
      errors,
      retrievedOn: RETRIEVED,
    };
    writeFileSync(file, JSON.stringify(evidence, null, 2));
    const ok = candidates.filter((c) => c.matchKind === "exact" && c.license).length;
    autoApproved += ok;
    done++;
    if (done % 10 === 0 || candidates.length > 0 || errors.length > 0) {
      console.log(
        `[commons-deep] ${done}/${targets.length} · ${place.name}: ${candidates.length} candidates (${ok} auto-approvable)` +
        (errors.length ? ` · ERRORS: ${errors.join("; ")}` : "")
      );
    }
  }
  writeFileSync(join(OUT, `summary-commons.json`), JSON.stringify({
    tier: "commons",
    placesResearched: done,
    autoApprovedTotal: autoApproved,
    retrievedOn: RETRIEVED,
  }, null, 2));
  console.log(`[commons-deep] DONE — ${done} places, ${autoApproved} auto-approvable candidates`);
}

// ---------------------------------------------------------------------------
// Openverse
// ---------------------------------------------------------------------------

interface OpenverseHit {
  title: string | null;
  url: string;
  foreign_landing_url: string | null;
  license: string;
  license_version: string | null;
  creator: string | null;
  source?: string | null;
  tags?: Array<{ name?: string }>;
}

async function openverseSearch(query: string, pageSize = 10): Promise<OpenverseHit[]> {
  const url =
    `https://api.openverse.org/v1/images/?page_size=${pageSize}` +
    `&mature=false&q=${encodeURIComponent(query)}`;
  const res = await politeFetch(url, { "User-Agent": RESEARCH_UA, Accept: "application/json" });
  if (res.status === 429) throw new Error("openverse rate-limited (429)");
  if (!res.ok) throw new Error(`openverse ${res.status}`);
  const data = (await res.json()) as { results?: Array<Record<string, unknown>> };
  return (data.results ?? []).map((r) => ({
    title: (r.title as string | null) ?? null,
    url: String(r.url ?? ""),
    foreign_landing_url: (r.foreign_landing_url as string | null) ?? null,
    license: String(r.license ?? ""),
    license_version: (r.license_version as string | null) ?? null,
    creator: (r.creator as string | null) ?? null,
    source: (r.source as string | null) ?? null,
    tags: (r.tags as Array<{ name?: string }>) ?? [],
  }));
}

async function runOpenverse(): Promise<void> {
  const places = await fetchLivePlaces();
  const targets = places
    .map((p, i) => ({ ...p, index: i + 1 }))
    .filter((p) => p.index >= fromIndex)
    .filter((p) => (only ? p.name === only : true));

  console.log(`[openverse-deep] ${places.length} live places; tier B pass over ${targets.length} (from #${fromIndex})`);

  // Budget probe: one call; if 429 immediately, record and stop the tier.
  try {
    await openverseSearch("Doddaballapur", 3);
    console.log("[openverse-deep] probe OK — budget available");
  } catch (err) {
    writeFileSync(join(OUT, `summary-openverse.json`), JSON.stringify({
      tier: "openverse",
      status: "blocked-at-probe",
      error: (err as Error).message,
      retrievedOn: RETRIEVED,
    }, null, 2));
    console.log(`[openverse-deep] probe FAILED (${(err as Error).message}) — tier stopped, recorded honestly`);
    return;
  }

  const PERMISSIVE = new Set(["cc0", "pdm", "by", "by-sa"]);
  let done = 0;
  let autoApproved = 0;
  let backoffs = 0;
  for (const place of targets) {
    const file = join(OUT, `openverse-${slugify(place.name)}.json`);
    if (existsSync(file)) {
      try {
        const prev = JSON.parse(readFileSync(file, "utf8")) as PlaceEvidence<Candidate>;
        if (prev.retrievedOn === RETRIEVED) {
          done++;
          continue;
        }
      } catch {
        /* stale */
      }
    }
    const candidates: Candidate[] = [];
    const errors: string[] = [];
    const queries = [place.name, `${place.name} Bengaluru`];
    const seen = new Set<string>();
    try {
      for (const q of queries) {
        let hits: OpenverseHit[] = [];
        try {
          hits = await openverseSearch(q);
        } catch (err) {
          if ((err as Error).message.includes("429") && backoffs < 3) {
            backoffs++;
            console.log(`[openverse-deep] 429 — backing off 60s (${backoffs}/3)`);
            await new Promise((r) => setTimeout(r, 60_000));
            hits = await openverseSearch(q); // single retry after backoff
          } else {
            throw err;
          }
        }
        for (const hit of hits) {
          if (!hit.url || seen.has(hit.url)) continue;
          seen.add(hit.url);
          const title = hit.title ?? "";
          const license = [hit.license.toUpperCase(), hit.license_version].filter(Boolean).join(" ");
          const matchKind = nameMatchKind(title, place.name);
          const permissive = PERMISSIVE.has(hit.license.toLowerCase());
          candidates.push({
            restaurantId: place.id,
            restaurantName: place.name,
            sourceKind: "openverse",
            imageUrl: hit.url,
            sourceUrl: hit.foreign_landing_url ?? hit.url,
            license: permissive ? license : `${license} (NOT permissive for reuse)`,
            attribution: hit.creator ?? "",
            matchKind,
            licenseUrl: hit.foreign_landing_url,
            description: `openverse source=${hit.source ?? "?"} tags=${(hit.tags ?? []).map((t) => t.name).filter(Boolean).slice(0, 6).join(",")}`,
            matchNotes:
              `Openverse "${title || "(untitled)"}" vs place "${place.name}" → ${matchKind}` +
              `${license ? ` · license ${license}` : " · NO LICENSE"}` +
              `${permissive ? "" : " · EXCLUDED: license not in cc0/pdm/by/by-sa"}`,
            retrievedOn: RETRIEVED,
            tierB: "openverse-deep",
          });
        }
      }
    } catch (err) {
      errors.push(`${place.name}: ${(err as Error).message}`);
    }
    const evidence: PlaceEvidence<Candidate> = {
      restaurantId: place.id,
      restaurantName: place.name,
      queries,
      candidates,
      errors,
      retrievedOn: RETRIEVED,
    };
    writeFileSync(file, JSON.stringify(evidence, null, 2));
    const ok = candidates.filter(
      (c) => c.matchKind === "exact" && !c.license.includes("NOT permissive") && c.license.trim()
    ).length;
    autoApproved += ok;
    done++;
    if (done % 10 === 0 || candidates.length > 0 || errors.length > 0) {
      console.log(
        `[openverse-deep] ${done}/${targets.length} · ${place.name}: ${candidates.length} hits (${ok} auto-approvable)` +
        (errors.length ? ` · ERRORS: ${errors.join("; ")}` : "")
      );
    }
  }
  writeFileSync(join(OUT, `summary-openverse.json`), JSON.stringify({
    tier: "openverse",
    placesResearched: done,
    autoApprovedTotal: autoApproved,
    backoffs,
    retrievedOn: RETRIEVED,
  }, null, 2));
  console.log(`[openverse-deep] DONE — ${done} places, ${autoApproved} auto-approvable, ${backoffs} backoffs`);
}

// ---------------------------------------------------------------------------
// Tier C — official web presence via z-ai web_search (paced)
// ---------------------------------------------------------------------------

interface WebHit {
  url: string;
  name: string | null;
  snippet: string | null;
  host: string;
  classification: "official-domain" | "facebook" | "instagram" | "listing-platform" | "news" | "other";
}

const LISTING_HOSTS = /(magicpin|justdial|zomato|swiggy|restaurant-guru|google\.|tripadvisor|ubereats|drinkpossible|navamis|district\.in|lazzo|wowdish|foodie\.in)/i;

function classify(url: string, placeName: string): WebHit["classification"] {
  let host = "?";
  try {
    host = new URL(url).host.toLowerCase();
  } catch {
    return "other";
  }
  if (/facebook\.com|fb\.com|fb\.watch/.test(host)) return "facebook";
  if (/instagram\.com/.test(host)) return "instagram";
  if (LISTING_HOSTS.test(host)) return "listing-platform";
  // official-domain heuristic: distinctive name token (>=5 chars, not a stopword)
  const tokens = placeName.toLowerCase().split(/[^a-z0-9]+/).filter((t) => t.length >= 5);
  const distinctive = tokens.find((t) => !["hotel", "restaurant", "family", "grand", "style", "point", "court"].includes(t));
  if (distinctive && host.includes(distinctive)) return "official-domain";
  if (/news|times|today|post|herald|patrol/.test(host)) return "news";
  return "other";
}

async function runWeb(): Promise<void> {
  const { default: ZAI } = await import("z-ai-web-dev-sdk");
  const zai = await ZAI.create();
  const places = await fetchLivePlaces();
  const targets = places
    .map((p, i) => ({ ...p, index: i + 1 }))
    .filter((p) => p.index >= fromIndex)
    .filter((p) => (only ? p.name === only : true));

  console.log(`[web-official] ${places.length} live places; tier C pass over ${targets.length} (from #${fromIndex})`);

  let done = 0;
  let rateLimitHits = 0;
  for (const place of targets) {
    const file = join(OUT, `web-${slugify(place.name)}.json`);
    if (existsSync(file)) {
      try {
        const prev = JSON.parse(readFileSync(file, "utf8")) as { retrievedOn: string };
        if (prev.retrievedOn === RETRIEVED) {
          done++;
          continue;
        }
      } catch {
        /* stale */
      }
    }
    const area = (place.locality && place.locality.trim()) || place.city || "Bengaluru";
    const query = `"${place.name}" ${area}`;
    const hits: WebHit[] = [];
    const errors: string[] = [];
    try {
      const results = (await zai.functions.invoke("web_search", { query, num: 8 })) as Array<{
        url?: string;
        name?: string;
        snippet?: string;
      }>;
      for (const r of results ?? []) {
        if (!r.url) continue;
        hits.push({
          url: r.url,
          name: r.name ?? null,
          snippet: r.snippet ?? null,
          host: (() => { try { return new URL(r.url).host; } catch { return "?"; } })(),
          classification: classify(r.url, place.name),
        });
      }
    } catch (err) {
      const msg = (err as Error).message;
      if (/429|rate/i.test(msg)) {
        rateLimitHits++;
        errors.push(`rate-limited (${rateLimitHits})`);
        if (rateLimitHits <= 3) {
          console.log(`[web-official] 429 — backing off 45s (${rateLimitHits}/3) at ${place.name}`);
          await new Promise((r) => setTimeout(r, 45_000));
          // retry once after backoff
          try {
            const results = (await zai.functions.invoke("web_search", { query, num: 8 })) as Array<{
              url?: string; name?: string; snippet?: string;
            }>;
            for (const r of results ?? []) {
              if (!r.url) continue;
              hits.push({
                url: r.url,
                name: r.name ?? null,
                snippet: r.snippet ?? null,
                host: (() => { try { return new URL(r.url).host; } catch { return "?"; } })(),
                classification: classify(r.url, place.name),
              });
            }
          } catch (err2) {
            errors.push(`retry failed: ${(err2 as Error).message}`);
          }
        } else {
          errors.push("persistent rate limit — remaining places skipped this run (resumable)");
          writeFileSync(file, JSON.stringify({ place, query, hits, errors, retrievedOn: RETRIEVED, skipped: true }, null, 2));
          done++;
          continue;
        }
      } else {
        errors.push(msg);
      }
    }
    writeFileSync(file, JSON.stringify({ place: { id: place.id, name: place.name }, query, hits, errors, retrievedOn: RETRIEVED }, null, 2));
    done++;
    const interesting = hits.filter((h) => h.classification === "official-domain" || h.classification === "facebook" || h.classification === "instagram");
    if (interesting.length > 0 || errors.length > 0 || done % 10 === 0) {
      console.log(
        `[web-official] ${done}/${targets.length} · ${place.name}: ${hits.length} hits` +
        (interesting.length ? ` · OFFICIAL/SOCIAL: ${interesting.map((h) => `${h.classification}:${h.host}`).join(", ")}` : "") +
        (errors.length ? ` · ERRORS: ${errors.join("; ")}` : "")
      );
    }
  }
  console.log(`[web-official] DONE — ${done} places scanned, ${rateLimitHits} rate-limit events`);
}

switch (tier) {
  case "commons":
    runCommons().catch((err) => { console.error("[commons-deep] FATAL:", err); process.exit(1); });
    break;
  case "openverse":
    runOpenverse().catch((err) => { console.error("[openverse-deep] FATAL:", err); process.exit(1); });
    break;
  case "web":
    runWeb().catch((err) => { console.error("[web-official] FATAL:", err); process.exit(1); });
    break;
}
