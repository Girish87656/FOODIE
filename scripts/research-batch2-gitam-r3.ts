/**
 * Foodie — Batch 2 research (GITAM-side), Round 3: conflict resolution +
 * remaining candidates. Evidence-only; print whatever the web returns.
 */
import ZAI from "z-ai-web-dev-sdk";

const QUERIES: Array<[string, string, number]> = [
  ["01 MOPARAHALLI GEO", "Moparahalli village Doddaballapur taluk location distance Nagadenahalli", 6],
  ["02 ABHIRAM RATING PHONE", "Abhiram Food Court Moparahalli Bangalore JustDial rating reviews phone number", 8],
  ["03 EPICRUISE AS SPELLED", "Epicruise Nagadenahalli Doddaballapura cafe", 6],
  ["04 HANGOUTS SOCIAL", "Hangouts cafe Doddaballapur instagram snapchat zomato", 8],
  ["05 SHRI CAFE JD PAGE", "The Shri Cafe And Restaurant Nagadenahalii Bangalore JustDial reviews ratings", 8],
  ["06 HOTEL KESARI CLUSTER", "Hotel Kesari Nagadenahalli JustDial Doddaballapur restaurant rating", 8],
  ["07 BIRYANI SHACK HEGGADAHALLI", "Biryani Shack Heggadahalli Doddaballapura JustDial rating phone", 8],
  ["08 MANJUNATHA BAR HEGGADAHALLI", "Manjunatha Bar And Restaurant Heggadahalli Doddaballapur JustDial", 6],
  ["09 UMASHANKAR NAGADENAHALLI", "Hotel Umashankar And Condiments Nagadenahalii JustDial rating", 6],
  ["10 DHABARIYA POLYWOOD", "Dhabariya Polywood dhaba Nagadenahalli Obadenahalli Doddaballapura", 8],
  ["11 MEAL COMPANY LOCATION", "\"Meal Company\" Doddaballapura Swiggy South Indian Chettinad address", 8],
  ["12 SNACKS AT 7", "Snacks @7 Doddaballapura Swiggy address", 6],
  ["13 GARUDA CAFE RETRY", "Garuda Cafe Restaurant Doddaballapur JustDial 24 hours rating", 8],
  ["14 AMIGOS PHONE RATING", "Amigos cafe near Gitam University Doddaballapur phone number rating JustDial reviews", 8],
  ["15 GITAM CAMPUS COORDS", "GITAM (Deemed to be University) Bengaluru wikipedia coordinates Nagadenahalli", 6],
  ["16 SS BIRYANI JD RATING", "\"SS Hyderabadi\" OR \"Hyd Ss Biryani Zone\" Doddaballapur JustDial rated", 8],
  ["17 PIZZA JUNCTION DETAILS", "Pizza Junction Doddaballapur Bashettihalli JustDial rating address hours", 8],
  ["18 SRI GANESH GRAND DETAILS", "Sri Ganesh Grand Doddaballapur Bashettihalli phone hours JustDial Zomato rating", 8],
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

function clean(s: string, max = 280) {
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
