/**
 * Foodie — Batch 1 research, ROUND 4:
 *  a) decode Ayyappa Tiffin Room's published Google plus code (7HH2+XV9)
 *     against the Doddaballapura railway-station reference (public source),
 *  b) read two magicpin store pages for full addresses / plus codes / phones.
 */
import ZAI from "z-ai-web-dev-sdk";
import { OpenLocationCode } from "open-location-code";

const olc = new OpenLocationCode();

// Reference: Doddaballapura Railway Station (public source, from location.ts MANUAL_CITIES)
const REF = { lat: 13.2797, lng: 77.5505 };

function decodePlusCode(short: string, refLat: number, refLng: number) {
  const full = olc.recoverNearest(short, refLat, refLng);
  const decoded = olc.decode(full);
  return { full, lat: decoded.latitudeCenter, lng: decoded.longitudeCenter };
}

console.log("=== PLUS CODE DECODE (evidence: magicpin listing) ===");
try {
  const ayyappa = decodePlusCode("7HH2+XV9", REF.lat, REF.lng);
  console.log(`Ayyappa Tiffin Room 7HH2+XV9 → full code ${ayyappa.full} → ${ayyappa.lat.toFixed(6)}, ${ayyappa.lng.toFixed(6)}`);
  // sanity: distance from station reference
  const dKm = haversine(REF.lat, REF.lng, ayyappa.lat, ayyappa.lng);
  console.log(`  distance from station ref: ${dKm.toFixed(2)} km (magicpin says "near railway station")`);
} catch (e) {
  console.log("decode failed:", e instanceof Error ? e.message : String(e));
}

function haversine(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

const PAGES: Array<[string, string]> = [
  ["magicpin Sri Annapoorneshwari store", "https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Sri-Annapoorneshwari-Tiffin-Center/store/1976343"],
  ["magicpin Brundhavana Grand Veg store", "https://magicpin.in/Bangalore/Doddaballapur/Restaurant/Brundhavana-Grand-Veg-Restaurant-Doddaballapur/store/2472737"],
];

function textOf(html: string) {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function around(text: string, needle: RegExp, before = 80, after = 320) {
  const m = text.match(needle);
  if (!m || m.index === undefined) return null;
  return text.slice(Math.max(0, m.index - before), m.index + after);
}

async function main() {
  const zai = await ZAI.create();
  for (const [label, url] of PAGES) {
    console.log(`\n===== PAGE: ${label} =====`);
    try {
      const result = (await zai.functions.invoke("page_reader", { url })) as { data?: { title?: string; html?: string } };
      const text = textOf(result?.data?.html || "");
      console.log(`title: ${result?.data?.title || "?"} | text length: ${text.length}`);
      const address = around(text, /Address/i);
      if (address) console.log(`ADDRESS ctx: ${address}`);
      const plus = text.match(/\b[23456789CFGHJMPQRVWX]{4}\+[23456789CFGHJMPQRVWX]{2,3}\b/g);
      if (plus) console.log(`PLUS CODES found: ${[...new Set(plus)].join(", ")}`);
      const phone = text.match(/\+91[\s-]?\d{5}[\s-]?\d{5}|\b[6-9]\d{9}\b/g);
      if (phone) console.log(`PHONES found: ${[...new Set(phone)].slice(0, 6).join(" | ")}`);
      const hours = around(text, /(Hours|Open now|Opening|Timings)/i, 0, 240);
      if (hours) console.log(`HOURS ctx: ${hours}`);
      const cost = text.match(/₹\s?[\d,]+\s?(for two|for 2)/i);
      if (cost) console.log(`COST: ${cost[0]}`);
    } catch (e) {
      console.log(`READ FAILED: ${e instanceof Error ? e.message : String(e)}`);
    }
  }
}

main().catch((e) => {
  console.error("FATAL", e);
  process.exit(1);
});
