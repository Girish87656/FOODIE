/**
 * Foodie — Task 3-a, Doddaballapura town + railway-station corridor + KIADB industrial area.
 * BATCH 1: directory INDEX pages (Restaurant Guru paginated lists, district.in list,
 * magicpin browse, Tripadvisor list). Evidence-only: dump what the pages return,
 * extract business links/names. No derivation, no fabrication.
 */
import ZAI from "z-ai-web-dev-sdk";
import { writeFileSync, mkdirSync } from "node:fs";

const OUT = "/home/z/my-project/tool-results/research2/town";
mkdirSync(OUT, { recursive: true });

const PAGES: Array<[string, string]> = [
  ["rg-main", "https://restaurant-guru.in/Doddaballapura"],
  ["rg-p2", "https://restaurant-guru.in/Doddaballapura?page=2"],
  ["rg-p3", "https://restaurant-guru.in/Doddaballapura?page=3"],
  ["rg-p4", "https://restaurant-guru.in/Doddaballapura?page=4"],
  ["district-list", "https://www.district.in/dining/doddaballapura"],
  ["magicpin-browse", "https://magicpin.in/Bangalore/Doddaballapur/restaurants/"],
  ["tripadvisor", "https://www.tripadvisor.com/Restaurants-g1675597-Doddaballapur_Bangalore_Rural_District_Karnataka.html"],
];

function extractLinks(html: string): Array<{ href: string; label: string }> {
  const out = new Map<string, string>();
  const re = /<a[^>]*href="([^"#]+)"[^>]*>([\s\S]*?)<\/a>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    const href = m[1].trim();
    const label = m[2]
      .replace(/<[^>]*>/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&nbsp;/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    if (href && !out.has(href)) out.set(href, label.slice(0, 160));
  }
  return [...out].map(([href, label]) => ({ href, label }));
}

function textOf(html: string, max = 20000): string {
  return (html || "")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

async function readWithRetry(zai: Awaited<ReturnType<typeof ZAI.create>>, url: string, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return (await zai.functions.invoke("page_reader", { url })) as { data?: { title?: string; html?: string } };
    } catch (err) {
      if (attempt === retries) throw err;
      await new Promise((r) => setTimeout(r, 1500 * attempt));
    }
  }
  return {};
}

async function main() {
  const zai = await ZAI.create();
  for (const [label, url] of PAGES) {
    console.log(`\n===== INDEX PAGE ${label} :: ${url} =====`);
    const record: Record<string, unknown> = { label, url, read_at: new Date().toISOString() };
    try {
      const result = await readWithRetry(zai, url);
      const html = result?.data?.html || "";
      const title = result?.data?.title || "";
      const links = extractLinks(html);
      // business-looking links on RG: /<Name>-Doddaballapura ; district: /dining/doddaballapura/<slug>;
      // magicpin: /Bangalore/Doddaballapur/<Type>/<Name>/store/<id>
      const business = links.filter(({ href }) =>
        /-Doddaballapura[^/]*$/.test(href.replace(/[?#].*$/, "")) ||
        /\/dining\/doddaballapura\/[a-z0-9-]+/.test(href) ||
        /magicpin\.in\/Bangalore\/Doddaballapur\/(Restaurant|Hotel|Bakery|Cafe|Desserts)\/.+\/store\/\d+/.test(href)
      );
      record.title = title;
      record.text_length = html.length;
      record.link_count = links.length;
      record.business_links = business;
      record.text_excerpt = textOf(html);
      console.log(`title: ${title} | html len: ${html.length} | links: ${links.length} | business links: ${business.length}`);
      for (const b of business.slice(0, 120)) console.log(`  - ${b.href} :: ${b.label}`);
      if (business.length === 0) console.log(`  TEXT: ${textOf(html, 1200)}`);
    } catch (e) {
      record.error = e instanceof Error ? e.message : String(e);
      console.log(`READ FAILED: ${record.error}`);
    }
    writeFileSync(`${OUT}/index-${label}.json`, JSON.stringify(record, null, 1));
    await new Promise((r) => setTimeout(r, 1200));
  }
  console.log("\nDONE batch 1");
}

main().catch((e) => {
  console.error("FATAL", e);
  process.exit(1);
});
