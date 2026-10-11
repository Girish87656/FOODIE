/**
 * Foodie — Research Round 2, Task 3-b (GITAM campus corridor systematic discovery).
 * Zone: Nagadenahalli, Bashettihalli, Heggadahalli, Byradenahalli, Moparahalli,
 * Kodihalli, Gundlahalli, Madarasanahalli + GITAM main-gate stretch (NH-648).
 * NOT Doddaballapura town / railway station / industrial area.
 *
 * Evidence-only: print + save raw JSON of what the web returns.
 * No derivation, no invention. Output dir is gitignored.
 */
import ZAI from "z-ai-web-dev-sdk";
import { writeFileSync, existsSync } from "node:fs";

const OUT_DIR = "/home/z/my-project/tool-results/research2/campus";

const QUERIES: Array<[string, string, number]> = [
  // --- directory index discovery ---
  ["01 RG INDEX", "restaurantguru Doddaballapura restaurants", 8],
  ["02 DISTRICT INDEX", "district.in Doddaballapura restaurants dining", 6],
  ["03 MAGICPIN INDEX", "magicpin Doddaballapur restaurants list", 6],
  ["04 YANDEX INDEX", "yandex maps Doddaballapura restaurants Nagadenahalli", 6],
  // --- locality x category ---
  ["05 CAFES GITAM", "cafes near GITAM University Bengaluru Nagadenahalli Doddaballapura", 8],
  ["06 STUDENT HANGOUT", "student hangout cafe GITAM college Doddaballapura main road", 8],
  ["07 NAGADENAHALLI REST", "restaurants Nagadenahalli Doddaballapura NH-648", 8],
  ["08 BASHETTIHALLI FOOD", "Bashettihalli restaurants food Doddaballapura", 8],
  ["09 BASHETTIHALLI BAKERY", "bakery sweets Bashettihalli Doddaballapura", 8],
  ["10 HEGGADAHALLI REST", "Heggadahalli restaurant Doddaballapura", 8],
  ["11 BYRADENAHALLI", "Byradenahalli Doddaballapura food restaurant", 8],
  ["12 MOPARAHALLI", "Moparahalli Doddaballapura restaurant food court", 8],
  ["13 KODIHALLI", "Kodihalli Doddaballapura restaurant food", 8],
  ["14 GUNDLA MADARASA", "Gundlahalli Madarasanahalli Doddaballapura restaurant food", 8],
  ["15 NH648 REST", "NH-648 NH-207 restaurants Doddaballapura highway food", 8],
  ["16 DHABA NH648", "dhaba NH-648 Nagadenahalli Doddaballapura highway", 8],
  ["17 BAKERY NAGADENA", "bakery Nagadenahalli Doddaballapura cake", 8],
  ["18 TIFFIN GITAM RD", "tiffin center GITAM road Nagadenahalli Doddaballapura idli dosa", 8],
  ["19 STREET FOOD", "street food chats stall Nagadenahalli Doddaballapura panipuri", 8],
  ["20 JUICE ICECREAM", "juice centre ice cream parlour Nagadenahalli Doddaballapura GITAM", 8],
  ["21 SHAWARMA MOMO", "shawarma momo fried chicken Nagadenahalli GITAM Doddaballapura", 8],
  ["22 PIZZA BURGER", "pizza burger Bashettihalli Nagadenahalli Doddaballapura", 8],
  ["23 MEALS HOTEL", "meals hotel mess Nagadenahalli Doddaballapura unlimited lunch", 8],
  ["24 NS CONVENTION", "NS Convention Hall Bashettihalli restaurant nearby", 8],
  ["25 GITAM CIRCLE", "Gitam Circle Doddaballapura food cafe", 8],
  // --- unresolved leads, fresh phrasing ---
  ["26 ZEN CAFE", "\"Zen Cafe\" Nagadenahalli Doddaballapura coffee", 8],
  ["27 RAJPUTANA", "Rajputana restaurant Nagadenahalli Bashettihalli NH-648 Doddaballapura", 8],
  ["28 ANANYA VANA", "\"Ananya Vana\" restaurant Doddaballapura", 8],
  ["29 MR3519", "\"MR3519\" family restaurant Doddaballapura", 8],
  ["30 SRI MATHA SAGAR", "\"Sri Matha Sagar\" Doddaballapura", 8],
  ["31 SARANGI", "\"Sarangi Fine Dine\" Doddaballapura", 8],
  ["32 DARBAR CAFE", "\"Darbar The Cafe\" Doddaballapura", 8],
  ["33 NIPPAT MASALE", "\"Nippat Masale\" stall Doddaballapura", 8],
  ["34 HANGOUTS RETRY", "Hangouts cafe restaurant Doddaballapura Nagadenahalli GITAM", 8],
  ["35 NEW OPENINGS", "new cafe restaurant opened near GITAM university Bangalore campus 2025 2026", 8],
];

async function searchWithRetry(
  zai: Awaited<ReturnType<typeof ZAI.create>>,
  query: string,
  num: number,
  retries = 5
) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const results = (await zai.functions.invoke("web_search", { query, num })) as Array<{
        name: string; url: string; snippet: string; host_name: string;
      }>;
      if (Array.isArray(results)) return results;
      throw new Error("non-array response");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (attempt === retries) throw err;
      // 429 → longer cool-down before retry
      await new Promise((r) => setTimeout(r, /429|Too many/i.test(msg) ? 15000 * attempt : 1500 * attempt));
    }
  }
  return [];
}

function clean(s: string, max = 260) {
  return (s || "").replace(/\s+/g, " ").trim().slice(0, max);
}

async function main() {
  const zai = await ZAI.create();
  for (const [label, query, num] of QUERIES) {
    const slug = query.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 48);
    const outfile = `${OUT_DIR}/s-${label.split(" ")[0].toLowerCase()}-${slug}.json`;
    if (existsSync(outfile)) {
      console.log(`\n===== ${label} :: SKIP (saved) =====`);
      continue;
    }
    console.log(`\n===== ${label} :: "${query}" =====`);
    try {
      const results = await searchWithRetry(zai, query, num);
      writeFileSync(
        outfile,
        JSON.stringify({ label, query, saved_at: new Date().toISOString(), results }, null, 2)
      );
      if (!results.length) {
        console.log("  (no results)");
        continue;
      }
      for (const r of results) {
        console.log(`- [${r.host_name}] ${clean(r.name, 120)}`);
        console.log(`  URL: ${r.url}`);
        console.log(`  ${clean(r.snippet)}`);
      }
    } catch (e) {
      console.log(`  ERROR: ${e instanceof Error ? e.message : String(e)}`);
    }
    await new Promise((r) => setTimeout(r, 2500)); // rate-limit friendly
  }
}

main().catch((e) => {
  console.error("FATAL", e);
  process.exit(1);
});
