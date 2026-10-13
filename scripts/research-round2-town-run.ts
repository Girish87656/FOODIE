/**
 * Foodie — Task 3-a queue runner (resilient).
 * Reads a queue JSON: [{ id, kind: "search"|"read", query?, url?, num? }]
 * For each item: if output file exists AND has no .error → skip (checkpoint/resume).
 * Writes /home/z/my-project/tool-results/research2/town/<id>.json
 * Long backoff on 429 (20s, 40s, 80s, 120s, 180s), 12s spacing between items.
 */
import ZAI from "z-ai-web-dev-sdk";
import { writeFileSync, readFileSync, existsSync } from "node:fs";

const OUT = "/home/z/my-project/tool-results/research2/town";
const queuePath = process.argv[2];
if (!queuePath) {
  console.error("usage: bun scripts/research-round2-town-run.ts <queue.json>");
  process.exit(1);
}

type Item = { id: string; kind: "search" | "read"; query?: string; url?: string; num?: number };

const items: Item[] = JSON.parse(readFileSync(queuePath, "utf8"));
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function withBackoff<T>(fn: () => Promise<T>, label: string): Promise<T> {
  const waits = [20000, 40000, 80000, 120000, 180000];
  let lastErr: unknown;
  for (let i = 0; i < waits.length; i++) {
    try {
      return await fn();
    } catch (e) {
      lastErr = e;
      const msg = e instanceof Error ? e.message : String(e);
      console.log(`  [retry ${i + 1}] ${label}: ${msg.slice(0, 120)}`);
      await sleep(waits[i]);
    }
  }
  throw lastErr;
}

function done(it: Item): boolean {
  const p = `${OUT}/${it.id}.json`;
  if (!existsSync(p)) return false;
  try {
    const j = JSON.parse(readFileSync(p, "utf8"));
    return !j.error;
  } catch {
    return false;
  }
}

async function main() {
  const zai = await ZAI.create();
  let ok = 0, skipped = 0, failed = 0;
  for (const it of items) {
    if (done(it)) {
      skipped++;
      continue;
    }
    process.stdout.write(`>> ${it.id} (${it.kind}) `);
    try {
      let record: Record<string, unknown>;
      if (it.kind === "search") {
        const results = await withBackoff(
          () => zai.functions.invoke("web_search", { query: it.query!, num: it.num ?? 8 }) as unknown as Promise<Array<{ name: string; url: string; snippet: string; host_name: string }>>,
          it.id
        );
        record = { id: it.id, kind: "search", query: it.query, results, read_at: new Date().toISOString() };
        console.log(`OK ${results.length} results`);
      } else {
        const r = await withBackoff(
          () => zai.functions.invoke("page_reader", { url: it.url! }) as unknown as Promise<{ data?: { title?: string; html?: string } }>,
          it.id
        );
        record = { id: it.id, kind: "read", url: it.url, title: r?.data?.title || "", html: (r?.data?.html || "").slice(0, 500000), read_at: new Date().toISOString() };
        console.log(`OK "${record.title}" html=${(record.html as string).length}`);
      }
      writeFileSync(`${OUT}/${it.id}.json`, JSON.stringify(record, null, 1));
      ok++;
    } catch (e) {
      const record = { id: it.id, kind: it.kind, query: it.query, url: it.url, error: e instanceof Error ? e.message : String(e), read_at: new Date().toISOString() };
      writeFileSync(`${OUT}/${it.id}.json`, JSON.stringify(record, null, 1));
      failed++;
      console.log("FAILED (recorded)");
    }
    await sleep(12000);
  }
  console.log(`\nRUNNER DONE ok=${ok} skipped=${skipped} failed=${failed}`);
}

main().catch((e) => {
  console.error("FATAL", e);
  process.exit(1);
});
