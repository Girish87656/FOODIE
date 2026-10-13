/**
 * Foodie — Round 2 research: legitimately-licensed PHOTO sourcing for the
 * 28 known Foodie places (14 live + 14 proposed), Doddaballapura taluk.
 *
 * READ-ONLY research. No git, no DB, no app-code changes, no image downloads.
 * Evidence sources (all keyless, license-aware):
 *   1. Wikimedia Commons API  (search + imageinfo/extmetadata → license, author, url)
 *   2. Openverse API          (license=cc0,by,by-sa; anonymous, strictly rate-limited)
 *   3. z-ai web_search        (owner-published pages / commons / flickr leads)
 *
 * Raw evidence → /home/z/my-project/tool-results/research2/photos/ (gitignored).
 * Verdicts are decided by a human-reviewed pass over these raw outputs.
 *
 * Modeled on scripts/research-batch2-gitam.ts (sequential + delays + retries).
 * Optional CLI arg: 1-based place index to resume from (default 1).
 */
import ZAI from "z-ai-web-dev-sdk";
import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";

const OUT = "/home/z/my-project/tool-results/research2/photos";
mkdirSync(OUT, { recursive: true });

const RETRIEVED = "2026-10-11";
const UA =
  "FoodiePhotoProvenanceResearch/1.0 (https://github.com/Girish87656/FOODIE; contact: repo issue tracker)";
// NOTE: Wikimedia Commons 403s User-Agents without a contact URL (bot filter).

type Place = { id: number; name: string; area: string; kind: "live" | "proposed" };

const PLACES: Place[] = [
  // LIVE (14)
  { id: 1,  name: "Abhiram Food Court",                 area: "Moparahalli",                 kind: "live" },
  { id: 2,  name: "Amigos Cafe",                        area: "Nagadenahalli",               kind: "live" },
  { id: 3,  name: "Ayyappa Tiffin Room",                area: "Doddaballapura Railway Station, Scout Camp Rd", kind: "live" },
  { id: 4,  name: "Brundavana Family Restaurant",       area: "Scout Camp Road",             kind: "live" },
  { id: 5,  name: "Chickpet Donne Biryani House",       area: "Doddaballapura",              kind: "live" },
  { id: 6,  name: "GITAM University Canteen",           area: "GITAM campus, Nagadenahalli", kind: "live" },
  { id: 7,  name: "Hotel Halli Nanasu",                 area: "Doddaballapura",              kind: "live" },
  { id: 8,  name: "Hotel Royal Nandhana",               area: "Arehalli Guddadahalli",       kind: "live" },
  { id: 9,  name: "Priyanka Tiffen Center",             area: "Doddaballapura",              kind: "live" },
  { id: 10, name: "Shri Manjunatha Grand Veg",          area: "Doddaballapura Railway Station", kind: "live" },
  { id: 11, name: "Sri Annapoorneshwari Tiffin Center", area: "Doddaballapura",              kind: "live" },
  { id: 12, name: "Sri Ganesh Grand",                   area: "Bashettihalli",               kind: "live" },
  { id: 13, name: "SS Hyderabadi Biriyani Zone",        area: "Nagadenahalli",               kind: "live" },
  { id: 14, name: "The Biryani Shack",                  area: "Heggadahalli",                kind: "live" },
  // PROPOSED (14)
  { id: 15, name: "The Shri Cafe and Restaurant",       area: "Nagadenahalli",               kind: "proposed" },
  { id: 16, name: "Epicurus Multi Cuisine Restaurant",  area: "Nagadenahalli",               kind: "proposed" },
  { id: 17, name: "Lotus Gardenia",                     area: "Nagadenahalli",               kind: "proposed" },
  { id: 18, name: "Best Choice Bakery",                 area: "Doddaballapura",              kind: "proposed" },
  { id: 19, name: "Rainbow Huts Family Restaurant",     area: "Bashettihalli",               kind: "proposed" },
  { id: 20, name: "Hotel Bindushree Family Restaurant", area: "Bashettihalli",               kind: "proposed" },
  { id: 21, name: "Sri Vinayaka Food Point",            area: "Doddaballapura Railway Station", kind: "proposed" },
  { id: 22, name: "Kiran Tiffin Room",                  area: "Kasbhag Road",                kind: "proposed" },
  { id: 23, name: "Abhis Food Court",                   area: "Scout Camp Rd",               kind: "proposed" },
  { id: 24, name: "Burger Time",                        area: "Doddaballapura",              kind: "proposed" },
  { id: 25, name: "Bbq Junction",                       area: "Doddaballapura",              kind: "proposed" },
  { id: 26, name: "Rajashree Veg And Non-Veg Family Restaurant", area: "Doddaballapura", kind: "proposed" },
  { id: 27, name: "Maha Naati Ruchi",                   area: "Doddaballapura",              kind: "proposed" },
  { id: 28, name: "Palav Ramu Hotel",                   area: "Doddaballapura bus stand",    kind: "proposed" },
];

// Locality/landmark sweeps (shared across places — context only, NOT restaurant matches)
const COMMONS_SWEEPS: Array<[string, string]> = [
  ["sweep-doddaballapura", "Doddaballapura"],
  ["sweep-doddaballapura-railway-station", "Doddaballapura railway station"],
  ["sweep-nagadenahalli", "Nagadenahalli"],
  ["sweep-bashettihalli", "Bashettihalli"],
  ["sweep-gitam-bengaluru", "GITAM University Bengaluru"],
  ["sweep-bengaluru-rural", "Bengaluru Rural district"],
];

// Openverse: anonymous tier is hard rate-limited (~5 req/hr) — keep to 5 targeted queries.
const OPENVERSE_QUERIES: Array<[string, string]> = [
  ["ov-doddaballapura", "Doddaballapura"],
  ["ov-doddaballapura-railway-station", "Doddaballapura railway station"],
  ["ov-chickpet-donne-biryani", "Chickpet Donne Biryani"],
  ["ov-gitam-bengaluru", "GITAM University Bengaluru"],
  ["ov-nagadenahalli", "Nagadenahalli Bangalore Rural"],
];

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 48);
}
function save(name: string, data: unknown) {
  writeFileSync(join(OUT, `${name}.json`), JSON.stringify(data, null, 1));
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function jfetch(url: string, tries = 3, timeoutMs = 20000): Promise<any> {
  let lastErr: unknown;
  for (let attempt = 1; attempt <= tries; attempt++) {
    const ac = new AbortController();
    const t = setTimeout(() => ac.abort(), timeoutMs);
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": UA, Accept: "application/json" },
        signal: ac.signal,
      });
      clearTimeout(t);
      if (res.status === 429 || res.status >= 500) {
        lastErr = new Error(`HTTP ${res.status}`);
        if (attempt < tries) {
          await sleep(2500 * attempt);
          continue;
        }
        return { __http_error: res.status };
      }
      if (!res.ok) return { __http_error: res.status };
      return await res.json();
    } catch (e) {
      clearTimeout(t);
      lastErr = e;
      if (attempt < tries) {
        await sleep(2000 * attempt);
        continue;
      }
    }
  }
  return { __fetch_error: String(lastErr).slice(0, 200) };
}

async function commonsSearch(query: string, limit = 12) {
  const u =
    "https://commons.wikimedia.org/w/api.php?action=query&list=search&srnamespace=6" +
    `&srsearch=${encodeURIComponent(query)}&srlimit=${limit}&format=json`;
  const j = await jfetch(u);
  if (j?.__http_error || j?.__fetch_error) return { query, error: j, hits: [] as string[] };
  const hits: string[] = (j?.query?.search ?? []).map((s: any) => s.title as string);
  return { query, hits };
}

async function commonsImageInfo(titles: string[]) {
  const u =
    "https://commons.wikimedia.org/w/api.php?action=query&format=json" +
    `&titles=${encodeURIComponent(titles.join("|"))}&prop=imageinfo|categories` +
    "&iiprop=url|extmetadata&cllimit=50&clshow=!hidden";
  const j = await jfetch(u, 4);
  if (j?.__http_error || j?.__fetch_error) return { titles, error: j, pages: [] as any[] };
  const pages: any[] = Object.values(j?.query?.pages ?? {});
  return {
    titles,
    pages: pages.map((p) => {
      const ii = p?.imageinfo?.[0] ?? {};
      const em = ii.extmetadata ?? {};
      const strip = (h?: string) =>
        (h ?? "").replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
      return {
        title: p?.title,
        missing: !!p?.missing,
        image_url: ii.url ?? null,
        description_url: ii.descriptionurl ?? null,
        license: strip(em.LicenseShortName?.value) || null,
        license_url: strip(em.LicenseUrl?.value) || null,
        artist: strip(em.Artist?.value).slice(0, 200) || null,
        credit: strip(em.Credit?.value).slice(0, 160) || null,
        attribution_required: strip(em.AttributionRequired?.value) || null,
        description: strip(em.ImageDescription?.value).slice(0, 400) || null,
        date: strip(em.DateTimeOriginal?.value).slice(0, 60) || null,
        categories: (p?.categories ?? []).map((c: any) => c.title).slice(0, 12),
      };
    }),
  };
}

async function openverseSearch(query: string) {
  const u =
    "https://api.openverse.org/v1/images/?page_size=8" +
    `&license=cc0,by,by-sa&q=${encodeURIComponent(query)}`;
  const j = await jfetch(u);
  if (j?.__http_error || j?.__fetch_error)
    return { query, error: j, results: [] as any[] };
  const results: any[] = (j?.results ?? []).map((r: any) => ({
    title: r.title,
    url: r.url,
    foreign_landing_url: r.foreign_landing_url,
    license: r.license,
    license_version: r.license_version,
    creator: r.creator,
    source: r.source,
    shown: (r.title + " " + (r.tags ?? []).map((t: any) => t.name).join(",")).slice(0, 220),
  }));
  return { query, results };
}

async function webSearchWithRetry(
  zai: Awaited<ReturnType<typeof ZAI.create>>,
  query: string,
  num: number,
  retries = 3,
) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const results = (await zai.functions.invoke("web_search", { query, num })) as Array<{
        name: string; url: string; snippet: string; host_name: string;
      }>;
      if (Array.isArray(results)) return results;
      throw new Error("non-array response");
    } catch (err) {
      if (attempt === retries) return [{ name: "ERROR", url: "", host_name: "", snippet: String(err).slice(0, 160) }];
      await sleep(1500 * attempt);
    }
  }
  return [];
}

async function main() {
  const from = Number(process.argv[2] ?? 1);
  const zai = await ZAI.create();

  const candidateTitles = new Set<string>();
  const summary: any = { retrieved: RETRIEVED, places: {}, sweeps: {}, openverse: {}, imageinfo_batches: 0 };

  // ---- Shared locality sweeps on Commons (context; cannot match a restaurant) ----
  for (const [key, q] of COMMONS_SWEEPS) {
    const r = await commonsSearch(q);
    summary.sweeps[key] = r;
    for (const h of r.hits) candidateTitles.add(h);
    console.log(`[sweep] ${key}: ${r.hits.length} hits${r.error ? " ERROR" : ""}`);
    await sleep(700);
  }

  // ---- Per-place searches ----
  for (const p of PLACES) {
    if (p.id < from) continue;
    console.log(`\n=== #${p.id} ${p.name} (${p.area}) [${p.kind}] ===`);

    // 1) Commons: name-only (recall) and name+area (precision)
    const c1 = await commonsSearch(p.name);
    await sleep(600);
    const c2 = await commonsSearch(`${p.name} ${p.area.split(",")[0]}`);
    for (const h of [...c1.hits, ...c2.hits]) candidateTitles.add(h);
    summary.places[p.id] = {
      name: p.name, area: p.area, kind: p.kind,
      commons_name: c1, commons_name_area: c2, web: [], web_owner: [],
    };
    console.log(`  commons: name=${c1.hits.length} hits, name+area=${c2.hits.length} hits`);
    if (c1.hits.length || c2.hits.length) {
      console.log(`  commons titles: ${[...c1.hits, ...c2.hits].slice(0, 6).join(" | ").slice(0, 300)}`);
    }
    await sleep(600);

    // 2) Web: business presence (official site / directories / photo pages)
    const w1 = await webSearchWithRetry(zai, `${p.name} ${p.area.split(",")[0]} Doddaballapura`, 8);
    summary.places[p.id].web = w1.map((r) => ({ host: r.host_name, url: r.url, title: (r.name ?? "").slice(0, 110), snippet: (r.snippet ?? "").slice(0, 200) }));
    for (const r of w1.slice(0, 4)) console.log(`  web: [${r.host_name}] ${(r.url || "").slice(0, 110)}`);
    await sleep(900);

    const w2 = await webSearchWithRetry(zai, `${p.name} Doddaballapura photos menu official`, 6);
    summary.places[p.id].web_owner = w2.map((r) => ({ host: r.host_name, url: r.url, title: (r.name ?? "").slice(0, 110) }));
    await sleep(900);
  }

  // ---- Openverse (5 targeted, anonymous rate-limit aware) ----
  console.log("\n=== Openverse ===");
  for (const [key, q] of OPENVERSE_QUERIES) {
    const r = await openverseSearch(q);
    summary.openverse[key] = r;
    console.log(`  ${key}: ${r.results.length} results${r.error ? ` (error ${JSON.stringify(r.error).slice(0, 60)})` : ""}`);
    await sleep(3500);
  }

  // ---- License/author verification for every Commons candidate ----
  const all = [...candidateTitles].filter(Boolean).sort();
  console.log(`\n=== Commons imageinfo for ${all.length} candidate file(s) ===`);
  const imageinfos: any[] = [];
  for (let i = 0; i < all.length; i += 15) {
    const batch = all.slice(i, i + 15);
    const r = await commonsImageInfo(batch);
    summary.imageinfo_batches++;
    imageinfos.push(...(r.pages ?? []));
    if (r.error) console.log(`  batch ${i}: ERROR ${JSON.stringify(r.error).slice(0, 80)}`);
    await sleep(1000);
  }
  for (const f of imageinfos) {
    if (f.missing) continue;
    console.log(`  FILE ${f.title} | ${f.license} | ${String(f.artist).slice(0, 60)} | cats=${(f.categories ?? []).slice(0, 4).join(",")}`);
  }

  save("summary", summary);
  save("imageinfo", { retrieved: RETRIEVED, count: imageinfos.length, files: imageinfos });

  // Compact final digest for the reviewing human/agent
  const digest = PLACES.map((p) => {
    const s = summary.places[p.id];
    if (!s) return null;
    const ct = [...s.commons_name.hits, ...s.commons_name_area.hits];
    return {
      id: p.id, name: p.name, area: p.area, kind: p.kind,
      commons_titles: ct,
      web_hosts: [...new Set([...s.web, ...s.web_owner].map((w: any) => w.host))].slice(0, 10),
    };
  }).filter(Boolean);
  save("digest", { retrieved: RETRIEVED, places: digest });
  console.log(`\nDONE → ${OUT}/{summary,imageinfo,digest}.json`);
}

main().catch((e) => {
  console.error("FATAL", e);
  process.exit(1);
});
