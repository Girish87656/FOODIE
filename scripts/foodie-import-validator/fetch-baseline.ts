/**
 * Foodie — import-validator baseline fetcher.
 *
 * READ-ONLY by construction: performs a single HTTP GET against the Supabase
 * PostgREST `restaurants` table (the same public, RLS-protected endpoint the
 * app itself reads) and writes the rows to a local snapshot JSON file.
 *
 * The snapshot is what makes repeated validator runs deterministic and
 * idempotent: the dry-run report embeds the snapshot's row count + hash, so
 * the same input + same snapshot always produce the same report.
 *
 * There is no write path in this file: `method: "GET"` is the only HTTP verb
 * used, and the publishable/anon key cannot write `restaurants` anyway
 * (no INSERT/UPDATE/DELETE policy for anon — see supabase/schema.sql §5).
 *
 * Usage:
 *   bun scripts/foodie-import-validator/fetch-baseline.ts [output.json]
 *
 * Env (Bun auto-loads .env from the project root):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY  (or legacy NEXT_PUBLIC_SUPABASE_ANON_KEY)
 *
 * The key is never printed, logged or embedded in the snapshot.
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { ensurePublicEnvLoaded } from "./lib/baseline";

const TABLE = "restaurants";

function requireEnv(name: string): string {
  const v = process.env[name]?.trim();
  if (!v) {
    throw new Error(
      `Missing env var ${name}. Required: NEXT_PUBLIC_SUPABASE_URL and ` +
        `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (or legacy NEXT_PUBLIC_SUPABASE_ANON_KEY).`
    );
  }
  return v;
}

async function main(): Promise<void> {
  ensurePublicEnvLoaded();
  const outArg = process.argv[2];
  const outPath = resolve(
    outArg ?? new URL("./fixtures/baseline-snapshot.json", import.meta.url).pathname
  );

  const base = requireEnv("NEXT_PUBLIC_SUPABASE_URL").replace(/\/+$/, "");
  const key = (
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    ""
  ).trim();
  if (!key) {
    throw new Error(
      "Missing publishable/anon key env var (NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY)."
    );
  }

  // GET only — PostgREST select with a stable ordering so snapshots are comparable.
  const endpoint = `${base}/rest/v1/${TABLE}?select=*&order=name.asc`;
  const res = await fetch(endpoint, {
    method: "GET",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      Accept: "application/json",
    },
  });
  if (!res.ok) {
    throw new Error(`Supabase GET failed: HTTP ${res.status} ${res.statusText}`);
  }
  const rows: unknown = await res.json();
  if (!Array.isArray(rows)) {
    throw new Error("Unexpected PostgREST response (expected a JSON array).");
  }

  const snapshot = {
    table: TABLE,
    fetched_at: new Date().toISOString(),
    mode: "live-read-only-get",
    count: rows.length,
    rows,
  };

  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, JSON.stringify(snapshot, null, 2) + "\n", "utf8");
  console.log(
    `Baseline snapshot written: ${outPath} (${snapshot.count} rows, single GET, zero writes)`
  );
}

main().catch((err: unknown) => {
  console.error("FATAL", err instanceof Error ? err.message : err);
  process.exit(1);
});
