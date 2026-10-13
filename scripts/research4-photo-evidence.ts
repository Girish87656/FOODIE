/**
 * Foodie — round 4 photo-evidence inventory.
 *
 * For every place in the two import packages (batch-005 62 rows + batch-006 1
 * row) plus the 14 live rows, record whether a photo EXISTS on its directory
 * listing (magicpin/district) — as EVIDENCE ONLY. Nothing is imported: the
 * listing-hosted images are third-party CDN assets with no stated license, so
 * their usage rights are UNCLEAR and per the task rules they are left unset.
 *
 * Output: tool-results/research4/photo-evidence.json
 */
import { writeFileSync, readFileSync } from "node:fs";

const ROOT = "/home/z/my-project";
const R4 = `${ROOT}/tool-results/research4`;

type PlaceRef = { name: string; pkg: string; sourceUrl?: string | null; phone?: string | null };

const r3 = JSON.parse(readFileSync(`${ROOT}/scripts/foodie-import-validator/reports/round3-import-manifest.json`, "utf-8"));
const r4 = JSON.parse(readFileSync(`${ROOT}/scripts/foodie-import-validator/reports/round4-import-manifest.json`, "utf-8"));
const cm = JSON.parse(readFileSync(`${R4}/cross-match.json`, "utf-8"));

const places: PlaceRef[] = [
  ...(r3.proposed_records ?? []).map((r: any) => ({ name: r.name, pkg: "batch-005", sourceUrl: r.source_url ?? null, phone: r.phone ?? null })),
  ...r4.proposed_insert_set.map((r: any) => ({ name: r.name, pkg: "batch-006", sourceUrl: r.source_url ?? null, phone: r.phone ?? null })),
];

function normName(s: string): string {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");
}
function normPhone(p: unknown): string | null {
  if (typeof p !== "string") return null;
  const d = p.replace(/\D/g, "");
  return d.length >= 10 ? d.slice(-10) : null;
}

const records = [
  ...cm.candidates.map((c: any) => ({ name: c.name ?? c.listedName ?? "", url: c.magicpinUrl, phone: c.phone, image: c.imageUrl, src: "magicpin" })),
];

const out = places.map((p) => {
  const nn = normName(p.name);
  const np = normPhone(p.phone);
  const hit = records.find((r) => {
    if (np && normPhone(r.phone) === np && np) return true;
    const rn = normName(r.name);
    return rn && nn && (rn === nn || (rn.includes(nn) && nn.length > 5) || (nn.includes(rn) && rn.length > 5));
  });
  return {
    place: p.name,
    package: p.pkg,
    photo_available_on_listing: Boolean(hit?.image),
    image_url: hit?.image ?? null,
    listing_url: hit?.url ?? null,
    decision: "NOT IMPORTED — image hosted by the directory listing; no stated license, usage rights unclear (task rule: leave unset when rights are unclear). Recorded as evidence for a future human licensing decision.",
  };
});

const summary = {
  generatedAt: new Date().toISOString(),
  places_checked: out.length,
  with_listing_photo: out.filter((o) => o.photo_available_on_listing).length,
  without_listing_photo: out.filter((o) => !o.photo_available_on_listing).length,
  imported_photos: 0,
  rule: "Only open/CC/PD-licensed, business-matched images with stable URLs are importable. Wikimedia Commons (24 queries), Openverse (24 queries) and Mapillary were exhausted in round 3 (photos3) with ZERO matches for this zone; the round-4 re-check adds this listing-image inventory as documented evidence only.",
};
writeFileSync(`${R4}/photo-evidence.json`, JSON.stringify({ summary, places: out }, null, 1));
console.log(JSON.stringify(summary, null, 1));
