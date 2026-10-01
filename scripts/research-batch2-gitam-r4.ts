/**
 * Foodie — Batch 2 research (GITAM-side), Round 4 (final):
 * page reads of known JD category pages (Heggadahalli cluster) + last checks.
 * Evidence-only; print whatever the tools return.
 */
import ZAI from "z-ai-web-dev-sdk";

const QUERIES: Array<[string, string, number]> = [
  ["01 HANGOUTS/HIDEOUT VARIANT", "Hideout cafe Doddaballapura Nagadenahalli", 8],
  ["02 HOTEL KESARI GRAND CHECK", "Hotel Kesari Grand Raghunathapur Doddaballapur JustDial", 6],
  ["03 EPICURUS NAGADENAHALLI ADDRESS", "Epicurus Multi Cuisine Restaurant Nagadenahalli Doddaballapura address district.in", 8],
  ["04 GITAM CANTEEN PAGE", "Gitam University Canteen Heggadahalli JustDial rated address", 8],
  ["05 AMIGOS PHONE HUNT", "Amigos cafe Doddaballapur Nagadenahalli contact number NH-207", 6],
  ["06 SRI CAFE RATING HUNT", "\"Shri Cafe\" Nagadenahalli Doddaballapur cafe rating", 6],
];

const PAGES: Array<[string, string]> = [
  ["P1 JD Biryani Restaurants in Heggadahalli", "https://www.justdial.com/Bangalore/Biryani-Restaurants-in-Heggadahalli/nct-10047018"],
  ["P2 JD Restaurants in Heggadahalli", "https://www.justdial.com/Bangalore/Restaurants-in-Heggadahalli/nct-10408936"],
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

  for (const [label, url] of PAGES) {
    console.log(`\n===== ${label} :: ${url} =====`);
    try {
      const res = (await zai.functions.invoke("page_reader", { url })) as {
        title?: string; content?: string; text?: string;
      };
      const text = (res?.content || res?.text || "").replace(/\s+/g, " ").trim();
      console.log(`TITLE: ${clean(res?.title || "", 160)}`);
      if (!text) {
        console.log("  (no text extracted)");
        continue;
      }
      // print full-ish but bounded
      console.log(clean(text, 12000));
    } catch (e) {
      console.log(`  ERROR: ${e instanceof Error ? e.message : String(e)}`);
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
}

main().catch((e) => {
  console.error("FATAL", e);
  process.exit(1);
});
