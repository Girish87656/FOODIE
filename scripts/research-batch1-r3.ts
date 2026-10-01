/**
 * Foodie — Batch 1 research, ROUND 3: hunt direct listing URLs
 * (restaurant-guru / magicpin / district pages, for addresses + plus codes).
 */
import ZAI from "z-ai-web-dev-sdk";

const QUERIES: Array<[string, string]> = [
  ["R3-01 RG Ayyappa", "restaurant-guru Ayyappa Tiffin Room Doddaballapur"],
  ["R3-02 RG Brundhavana Grand", "restaurant-guru Brundhavana Grand Veg Restaurant Doddaballapur"],
  ["R3-03 RG Priyanka", "restaurant-guru Priyanka Tiffen Center Doddaballapura address"],
  ["R3-04 RG Bhadranna", "restaurant-guru Bhadranna Doddaballapura tiffen"],
  ["R3-05 RG Annapoorneshwari", "restaurant-guru Sri Annapoorneshwari tiffin Center Doddaballapur"],
  ["R3-06 MP Ayyappa store", "magicpin Ayyappa Tiffin Room Doddaballapur Scout Camp"],
  ["R3-07 MP Annapoorneshwari", "magicpin Sri Annapoorneshwari tiffin Center Doddaballapur store"],
  ["R3-08 MP Priyanka", "magicpin Priyanka Tiffen Center Doddaballapur D Cross"],
  ["R3-09 MP Abhiram", "magicpin Abhiram Food Court Moparahalli OR Doddaballapur"],
  ["R3-10 Halli Nanasu guru", "restaurant-guru Hotel Halli Nanasu Doddaballapura"],
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

function clean(s: string, max = 300) {
  return (s || "").replace(/\s+/g, " ").trim().slice(0, max);
}

async function main() {
  const zai = await ZAI.create();
  for (const [label, query] of QUERIES) {
    console.log(`\n===== ${label} :: "${query}" =====`);
    try {
      const results = await searchWithRetry(zai, query, 5);
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
