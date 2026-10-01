/**
 * Foodie — Batch 2 research (GITAM-side): search real business listings for
 * places near GITAM Deemed to be University Bengaluru (Nagadenahalli /
 * NH-207 / Bashettihalli). Evidence-only: we print what the web returns,
 * we do NOT derive coordinates or fill unknowns.
 *
 * The station-road/town batch (Task 8/9) is NOT touched here.
 */
import ZAI from "z-ai-web-dev-sdk";

const QUERIES: Array<[string, string, number]> = [
  ["01 GITAM CAMPUS REFERENCE", "GITAM Deemed to be University Bengaluru campus Nagadenahalli Doddaballapura address pin code", 6],
  ["02 AMIGOS", "Amigos cafe GITAM University Doddaballapura Nagadenahalli", 8],
  ["03 ABHIRAM FOOD COURT", "Abhiram Food Court Doddaballapura Nagadenahalli GITAM", 8],
  ["04 EPICRUISE", "Epicruise cafe Doddaballapura GITAM Nagadenahalli", 8],
  ["05 HANGOUTS", "Hangouts cafe restaurant Doddaballapura GITAM Nagadenahalli", 8],
  ["06 THE SHRI CAFE AND RESTAURANT", "The Shri Cafe and Restaurant Doddaballapura Nagadenahalli", 8],
  ["07 SS BIRYANI ZONE", "SS Biryani Zone Doddaballapura Nagadenahalli", 8],
  ["08 GARUDA CAFE RESTAURANT", "Garuda Cafe Restaurant Doddaballapura Nagadenahalli", 8],
  ["09 GITAM CANTEEN", "GITAM University Bengaluru canteen food court Nagadenahalli", 6],
  ["X1 AREA DISCOVERY", "restaurants near GITAM University Bengaluru campus", 8],
  ["X2 AREA DISCOVERY", "food places cafes near Nagadenahalli Doddaballapura NH-207", 8],
  ["X3 AREA DISCOVERY", "restaurants near Bashettihalli Doddaballapura", 8],
  ["X4 AREA DISCOVERY", "best cafes hangout spots near GITAM college Doddaballapura students", 8],
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
  for (const [label, query, num] of QUERIES) {
    console.log(`\n===== ${label} :: "${query}" =====`);
    try {
      const results = await searchWithRetry(zai, query, num);
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
