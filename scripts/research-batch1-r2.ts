/**
 * Foodie — Batch 1 research, ROUND 2: gap-filling searches.
 * Prints full URLs so we can pick pages to read in round 3.
 */
import ZAI from "z-ai-web-dev-sdk";

const QUERIES: Array<[string, string]> = [
  ["R2-01 Abhiram address", "Abhiram Food Court Moparahalli Doddaballapura address"],
  ["R2-02 Amigos detail", "Amigos Gitam cafe Kodihalli Nagadenahalli Doddaballapura"],
  ["R2-03 Lotus rating", "Lotus Gardenia Doddaballapur restaurant Scout Camp Road rating"],
  ["R2-04 Brundhavana Grand addr", "\"Brundhavana Grand Veg Restaurant\" Doddaballapur address location"],
  ["R2-05 Priyanka addr", "\"Priyanka Tiffen Center\" Doddaballapur address"],
  ["R2-06 Annapoorneshwari addr", "\"Sri Annapoorneshwari Tiffin Center\" Doddaballapur address phone"],
  ["R2-07 Bhadranna addr", "\"Bhadranna Tiffins\" Doddaballapur address phone"],
  ["R2-08 Ayyappa phone/rating", "\"Ayyappa Tifin Room\" Doddaballapur phone rating"],
  ["R2-09 Manjunatha page", "favhiker Shri Manjunatha Grand Veg Doddaballapura"],
  ["R2-10 Guru listings", "restaurant-guru.in Doddaballapura restaurants"],
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
