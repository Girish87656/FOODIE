/**
 * Foodie — Research round 3: OSM systematic POI pull (Task 3-a, channel OSM).
 *
 * The OpenStreetMap REST API (api.openstreetmap.org, reachable from this
 * sandbox) is queried per cluster tile; elements with food/drink amenity or
 * shop tags are extracted with ALL their tags verbatim. ODbL data — every
 * record keeps its osm.org element URL as the source. No values invented;
 * anything OSM doesn't map simply doesn't appear.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const OUT = "/home/z/my-project/tool-results/research3";
mkdirSync(join(OUT, "osm"), { recursive: true });

const FOOD_AMENITIES = new Set([
  "restaurant", "cafe", "fast_food", "food_court", "ice_cream", "pub", "bar",
]);
const FOOD_SHOPS = new Set([
  "bakery", "pastry", "tea", "coffee", "confectionery", "deli", "dairy",
  "cheese", "chocolate", "ice_cream", "sports_nutrition",
]);

/** Cluster tiles: town, station corridor, KIADB/Bashettihalli, Nagadenahalli+GITAM, Rajanukunte, Nandi Rd corridor, Devanahalli-hwy side. */
const TILES: Array<[string, number, number, number, number]> = [
  ["doddaballapura-town", 13.284, 77.511, 13.314, 77.541],
  ["railway-station-scout-camp", 13.270, 77.540, 13.292, 77.564],
  ["kiadb-bashettihalli-kg-govindapura", 13.258, 77.528, 13.282, 77.556],
  ["nagadenahalli-moparahalli-gitam", 13.272, 77.582, 13.298, 77.612],
  ["rajanukunte-singahalli", 13.210, 77.538, 13.240, 77.572],
  ["nandi-road-heggadihalli", 13.344, 77.640, 13.366, 77.666],
  ["devanahalli-hwy-mudiganahalli", 13.336, 77.668, 13.360, 77.694],
  ["town-nh44-south", 13.262, 77.520, 13.284, 77.545],
];

const UA = "Foodie-Prototype-Research/1.0 (https://github.com/Girish87656/FOODIE)";

type OsmEl = {
  type: "node" | "way" | "relation";
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
};

function isFood(tags: Record<string, string>): boolean {
  const amenity = tags.amenity;
  const shop = tags.shop;
  if (amenity && FOOD_AMENITIES.has(amenity)) return true;
  if (shop && FOOD_SHOPS.has(shop)) return true;
  if (tags.cuisine) return true;
  return false;
}

async function pullTile([label, s, w, n, e]: [string, number, number, number, number], attempt = 1): Promise<OsmEl[]> {
  const url = `https://api.openstreetmap.org/api/0.6/map?bbox=${w},${s},${e},${n}`;
  try {
    const res = await fetch(url, { headers: { "User-Agent": UA } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const xml = await res.text();
    writeFileSync(join(OUT, "osm", `tile-${label}.osm`), xml);
    // parse elements with a tiny regex pass over the XML (name-bearing nodes/ways)
    const els: OsmEl[] = [];
    const re = /<(node|way)\b([^>]*?)(?:\/>|>([\s\S]*?)<\/\1>)/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(xml))) {
      const [, kind, attrs, body] = m;
      const el: OsmEl = { type: kind as "node" | "way", id: Number(/id="(\d+)"/.exec(attrs)?.[1] ?? 0) };
      const lat = /lat="([-\d.]+)"/.exec(attrs)?.[1];
      const lon = /lon="([-\d.]+)"/.exec(attrs)?.[1];
      if (lat && lon) { el.lat = Number(lat); el.lon = Number(lon); }
      const cLat = /lat="([-\d.]+)"/.exec(body ?? "")?.[1];
      const cLon = /lon="([-\d.]+)"/.exec(body ?? "")?.[1];
      if (!el.lat && cLat && cLon) { el.center = { lat: Number(cLat), lon: Number(cLon) }; }
      const tags: Record<string, string> = {};
      const tagRe = /<tag k="([^"]+)" v="([^"]*)"\s*\/?>/g;
      let t: RegExpExecArray | null;
      while ((t = tagRe.exec(body ?? ""))) tags[t[1]] = t[2];
      if (Object.keys(tags).length) el.tags = tags;
      if (el.tags && isFood(el.tags)) els.push(el);
    }
    return els;
  } catch (err) {
    if (attempt < 3) {
      await new Promise((r) => setTimeout(r, 5000 * attempt));
      return pullTile([label, s, w, n, e], attempt + 1);
    }
    console.error(`tile ${label} failed:`, (err as Error).message);
    return [];
  }
}

const all: Array<Record<string, unknown>> = [];
for (const tile of TILES) {
  const els = await pullTile(tile);
  console.log(`${tile[0]}: ${els.length} food/drink elements`);
  for (const el of els) {
    const tags = el.tags ?? {};
    all.push({
      name: tags.name ?? null,
      osm_type: el.type,
      osm_id: el.id,
      osm_url: `https://www.osm.org/${el.type}/${el.id}`,
      lat: el.lat ?? el.center?.lat ?? null,
      lon: el.lon ?? el.center?.lon ?? null,
      amenity: tags.amenity ?? null,
      shop: tags.shop ?? null,
      cuisine: tags.cuisine ?? null,
      "addr:street": tags["addr:street"] ?? null,
      "addr:housenumber": tags["addr:housenumber"] ?? null,
      "addr:city": tags["addr:city"] ?? null,
      "addr:postcode": tags["addr:postcode"] ?? null,
      phone: tags.phone ?? tags["contact:phone"] ?? null,
      website: tags.website ?? tags["contact:website"] ?? null,
      opening_hours: tags.opening_hours ?? null,
      diet: tags["diet:vegetarian"] ?? tags["diet:vegan"] ?? null,
      outdoor_seating: tags.outdoor_seating ?? null,
      takeaway: tags.takeaway ?? null,
      operator: tags.operator ?? null,
      building: tags.building ?? null,
      all_tags: tags,
      tile: tile[0],
      license: "OpenStreetMap contributors, ODbL 1.0",
    });
  }
  await new Promise((r) => setTimeout(r, 2500));
}

writeFileSync(join(OUT, "osm-places.json"), JSON.stringify(all, null, 2));
console.log(`TOTAL: ${all.length} OSM food/drink POIs saved -> tool-results/research3/osm-places.json`);
