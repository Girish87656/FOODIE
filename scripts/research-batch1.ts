/**
 * Foodie — Batch 1 research: search real business listings for the 13
 * pilot-corridor candidates. Evidence-only: we print what the web returns,
 * we do NOT derive coordinates or fill unknowns.
 */
import ZAI from "z-ai-web-dev-sdk";

const QUERIES: Array<[string, string]> = [
  ["01 ABHIRAM FOOD COURT", "Abhiram Food Court Doddaballapura"],
  ["02 AMIGOS CAFE", "Amigos Cafe Doddaballapura"],
  ["03 AYYAPPA TIFFIN ROOM", "Ayyappa Tiffin Room Doddaballapura"],
  ["04 LOTUS GARDENIA", "Lotus Gardenia Doddaballapura"],
  ["05 HOTEL ROYAL NANDHANA", "Hotel Royal Nandhana Doddaballapura"],
  ["06 SHRI MANJUNATHA GRAND VEG", "Shri Manjunatha Grand Veg Doddaballapura"],
  ["07 HOTEL HALLI NANASU", "Hotel Halli Nanasu Doddaballapura"],
  ["08 BRUNDAVANA FAMILY RESTAURANT", "Brundavana Family Restaurant Doddaballapura"],
  ["09 CHICKPET DONNE BIRYANI HOUSE", "Chickpet Donne Biryani House Doddaballapura"],
  ["10 BRUNDHAVANA GRAND VEG", "Brundhavana Grand Veg Restaurant Doddaballapura"],
  ["11 PRIYANKA TIFFEN CENTER", "Priyanka Tiffin Center Doddaballapura"],
  ["12 SRI ANNAPOORNESHWARI TIFFIN CENTER", "Sri Annapoorneshwari Tiffin Center Doddaballapura"],
  ["13 BHADRARNA TIFFIN CENTRE", "Bhadranna Tiffin Centre Doddaballapura"],
  ["X1 CROSS-CHECK station area", "restaurants near Doddaballapura railway station"],
  ["X2 CROSS-CHECK town area", "best restaurants Doddaballapura town"],
];

async function searchWithRetry(zai: Awaited<ReturnType<typeof ZAI.create>>, query: string, num: number, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const results = (await zai.functions.invoke("web_search", { query, num })) as Array<{
        name: string; url: string; snippet: string; host_name: string;
      }>;
      if (Array.isArray(results)) return results;
      throw new Error("non-array response");
    } catch (err) {
      if (attempt === retries) throw err;
      await new Promise((r) => setTimeout(r, 1500 * attempt));
    }
  }
  return [];
}

function clean(s: string, max = 260) {
  return (s || "").replace(/\s+/g, " ").trim().slice(0, max);
}

async function main() {
  const zai = await ZAI.create();
  for (const [label, query] of QUERIES) {
    console.log(`\n===== ${label} :: "${query}" =====`);
    try {
      const results = await searchWithRetry(zai, query, 6);
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
    await new Promise((r) => setTimeout(r, 800)); // rate-limit friendly
  }
}

main().catch((e) => {
  console.error("FATAL", e);
  process.exit(1);
});
