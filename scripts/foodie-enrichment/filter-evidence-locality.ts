/**
 * Foodie — one-off evidence guard (audit repair, 2026-10-12).
 *
 * The first research run accepted web_search snippets from SAME-NAME
 * businesses in other localities (a "Hotel Karavali, BTM" menu under Palav
 * Ramu Hotel; "Pizza Palace, Sultanpur"/"Marathahalli" menus under the
 * Doddaballapura Pizza Palace; an HSR-layout Mathsya Darshini menu; …).
 *
 * This script re-applies the provenance-locality guard (lib/live.ts
 * `snippetMatchesPlace`) to every RECORDED candidate, using the verbatim
 * evidence quote each candidate carries. Search-snippet candidates that fail
 * the guard are DELETED from the evidence files (the drop is logged here for
 * the audit trail). page_reader/worksheet candidates are exempt — their URL
 * is the place's own recorded listing.
 *
 * Future research runs enforce the same guard at capture time; this script
 * exists to clean evidence that was recorded before the guard was added.
 */

import { readdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { snippetMatchesPlace } from "./lib/live";
import { isValidDishName } from "./lib/menuParse";
import type { DishCandidate, PlaceEvidence } from "./lib/types";

const ROOT = process.cwd();
const DIR = join(ROOT, "scripts", "foodie-enrichment", "evidence", "menus");

let dropped = 0;
let kept = 0;

for (const f of readdirSync(DIR)) {
  if (!f.endsWith(".json")) continue;
  const path = join(DIR, f);
  const data = JSON.parse(readFileSync(path, "utf8")) as PlaceEvidence<DishCandidate>;
  const before = data.candidates.length;
  data.candidates = data.candidates.filter((c) => {
    // (1) name re-validation against the CURRENT parser rules — candidates
    // recorded by older parser versions may carry chrome that is now
    // rejected (time-of-day fragments, "Budget eateries may start around…")
    if (!isValidDishName(c.name)) {
      dropped++;
      console.log(`DROP(name-rule) ${data.restaurantName} :: "${c.name}" (Rs ${c.price}) :: ${c.evidence.slice(0, 90)}`);
      return false;
    }
    // (2) provenance-locality guard for search-snippet candidates (the
    // place's own recorded listing / reviewed worksheet rows are exempt)
    const isSnippet = c.evidence.startsWith("[search snippet");
    if (isSnippet && !snippetMatchesPlace(c.evidence, data.restaurantName)) {
      dropped++;
      console.log(`DROP(locality) ${data.restaurantName} :: "${c.name}" (Rs ${c.price}) :: ${c.evidence.slice(0, 90)}`);
      return false;
    }
    kept++;
    return true;
  });
  if (data.candidates.length !== before) {
    writeFileSync(path, JSON.stringify(data, null, 2));
  }
}

console.log(`[guard] kept ${kept} candidate(s), dropped ${dropped} candidate(s) (wrong-place or stale-name chrome)`);
