/**
 * Foodie — Batch 2 research (GITAM-side), Round 2: gap-filling + geography.
 * Evidence-only; print whatever the web returns.
 */
import ZAI from "z-ai-web-dev-sdk";

const QUERIES: Array<[string, string, number]> = [
  ["01 EPICURUS DETAILS", "Epicurus Multi Cuisine Restaurant Nagadenahalli Doddaballapura rating phone", 8],
  ["02 ADINARAYANAHOSAHALLI GEO", "Adinarayanahosahalli Doddaballapura taluk location Nagadenahalli NH 207", 6],
  ["03 HANGOUTS VARIANTS", "\"Hangouts\" Doddaballapur restaurant NH-207", 8],
  ["04 HANGOUTS VARIANTS 2", "Hangout cafe restaurant GITAM Doddaballapura Nagadenahalli JustDial", 8],
  ["05 THE SHRI CAFE DETAILS", "\"The Shri Cafe And Restaurant\" Nagadenahalli JustDial phone rating", 8],
  ["06 SS BIRYANI ZONE DETAILS", "SS Hyderabadi Biriyani Zone Doddaballapura rating reviews phone Swiggy Zomato", 8],
  ["07 AMIGOS DETAILS", "Amigos Cafe Doddaballapur JustDial rating phone hours", 8],
  ["08 ABHIRAM + MOPARAHALLI GEO", "Moparahalli Doddaballapura pin code village NH-207 Nagadenahalli distance", 8],
  ["09 ABHIRAM DETAILS", "\"Abhiram Food Court\" Moparahalli Doddaballapura phone rating JustDial", 8],
  ["10 GARUDA CAFE DETAILS", "Garuda Cafe Restaurant Adhinarayanahosahalli JustDial rating phone", 8],
  ["11 GITAM CANTEEN DETAILS", "\"Gitam University Canteen\" Heggadahalli JustDial address", 6],
  ["12 HEGGADAHALLI GEO", "Heggadahalli Doddaballapura Nagadenahalli location village", 6],
  ["13 SRI GANESH GRAND", "Sri Ganesh Grand Bashettihalli Doddaballapura rating phone Tripadvisor", 8],
  ["14 HOTEL KESARI NAGADENAHALLI", "Hotel Kesari Nagadenahalli Doddaballapura restaurant", 6],
  ["15 MEAL COMPANY + MORE", "Meal Company Doddaballapura Swiggy Nagadenahalli Bashettihalli", 8],
  ["16 HOYSALA FAMILY RESTAURANT", "Hoysala Family Restaurant Doddaballapura Bashettihalli address rating", 8],
  ["17 BASHETTIHALLI PIZZA JUNCTION", "Pizza Junction Bashettihalli Doddaballapura Swiggy", 6],
  ["18 MORE GITAM-SIDE PLACES", "hotels restaurants Nagadenahalli Doddaballapura highway dhaba", 8],
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
    await new Promise((r) => setTimeout(r, 800));
  }
}

main().catch((e) => {
  console.error("FATAL", e);
  process.exit(1);
});
