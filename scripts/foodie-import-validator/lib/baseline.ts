/**
 * Foodie — import validator: baseline loader.
 *
 * The baseline is the set of existing `restaurants` rows used for duplicate
 * detection. Two read-only sources are supported:
 *
 *  1. snapshot file  (recommended): produced by fetch-baseline.ts or
 *     `--save-baseline`; makes repeated runs fully deterministic/idempotent.
 *  2. live GET       : a single PostgREST GET using the PUBLIC publishable/
 *     anon key from env. GET is the only HTTP verb this module can issue.
 *
 * There is deliberately NO write path anywhere in this module.
 */

import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { BaselineRestaurant, BaselineSnapshot } from "./types";

export interface BaselineSource {
  source: "snapshot" | "live-get";
  file: string | null;
  sha256: string | null;
  fetchedAt: string | null;
  rows: BaselineRestaurant[];
}

export interface BaselineOptions {
  /** Path to a snapshot JSON file. */
  baselineFile?: string;
  /** Fetch live (single GET) and also write the snapshot to this path. */
  saveBaselinePath?: string;
  /** Default snapshot path used when no flag is given (checked for existence). */
  defaultSnapshotPath?: string;
}

function isBaselineRestaurant(v: unknown): v is BaselineRestaurant {
  if (typeof v !== "object" || v === null) return false;
  const r = v as Record<string, unknown>;
  return typeof r.id === "string" && typeof r.name === "string";
}

/** Validate + narrow a parsed snapshot file. */
function parseSnapshot(json: unknown, file: string): BaselineSnapshot {
  if (typeof json !== "object" || json === null) {
    throw new Error(`Baseline file ${file} is not a JSON object.`);
  }
  const snap = json as Record<string, unknown>;
  if (!Array.isArray(snap.rows)) {
    throw new Error(`Baseline file ${file} has no "rows" array.`);
  }
  const rows = snap.rows.filter(isBaselineRestaurant);
  if (rows.length !== snap.rows.length) {
    throw new Error(
      `Baseline file ${file}: ${snap.rows.length - rows.length} row(s) are not restaurant objects (need id + name).`
    );
  }
  return {
    table: typeof snap.table === "string" ? snap.table : "restaurants",
    fetched_at: typeof snap.fetched_at === "string" ? snap.fetched_at : "unknown",
    mode: typeof snap.mode === "string" ? snap.mode : "snapshot",
    count: rows.length,
    rows: rows.map((r) => ({
      id: r.id,
      name: r.name,
      locality: r.locality ?? null,
      city: r.city ?? null,
      phone: r.phone ?? null,
      latitude: r.latitude ?? null,
      longitude: r.longitude ?? null,
    })),
  };
}

/**
 * Perform the single READ-ONLY GET against PostgREST. This is the ONLY
 * network call the whole validator can make — `method: "GET"` is hardcoded.
 * Exported so the zero-write proof (demo/no-write-proof.ts) can point it at
 * a local capture server and record every HTTP method that leaves the tool.
 */
export async function fetchRestaurantsGet(baseUrl: string, key: string): Promise<BaselineRestaurant[]> {
  const endpoint = `${baseUrl.replace(/\/+$/, "")}/rest/v1/restaurants?select=*&order=name.asc`;
  const res = await fetch(endpoint, {
    method: "GET", // READ-ONLY: the only verb this tool uses, anywhere.
    headers: { apikey: key, Authorization: `Bearer ${key}`, Accept: "application/json" },
  });
  if (!res.ok) {
    throw new Error(`Supabase GET failed: HTTP ${res.status} ${res.statusText}`);
  }
  const rowsRaw: unknown = await res.json();
  if (!Array.isArray(rowsRaw)) throw new Error("Unexpected PostgREST response.");
  const rows = rowsRaw.filter(isBaselineRestaurant);
  if (rows.length !== rowsRaw.length) {
    throw new Error("PostgREST returned rows without id/name — refusing to continue.");
  }
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    locality: r.locality ?? null,
    city: r.city ?? null,
    phone: r.phone ?? null,
    latitude: r.latitude ?? null,
    longitude: r.longitude ?? null,
  }));
}

/**
 * Bun auto-loads .env from the process CWD. When the validator is started
 * from another directory the public Supabase vars may be missing — this
 * loads them from the repo-root .env (THIS tool's repo layout:
 * lib/ → foodie-import-validator/ → scripts/ → repo root).
 *
 * Security: only the two PUBLIC variable names are read, values are never
 * printed, logged, or embedded in reports/snapshots.
 */
export function ensurePublicEnvLoaded(): void {
  const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const hasKey = !!(
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )?.trim();
  if (hasUrl && hasKey) return;
  const envPath = new URL("../../../.env", import.meta.url).pathname;
  try {
    if (!existsSync(envPath)) return;
    const text = readFileSync(envPath, "utf8");
    for (const line of text.split("\n")) {
      const m = line.match(
        /^\s*(NEXT_PUBLIC_SUPABASE_URL|NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY|NEXT_PUBLIC_SUPABASE_ANON_KEY)\s*=\s*(.*)\s*$/
      );
      if (!m) continue;
      let value = m[2].trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (!process.env[m[1]]?.trim() && value !== "") process.env[m[1]] = value;
    }
  } catch {
    // Unreadable .env is fine — the fetch error below explains what's missing.
  }
}

async function fetchLive(): Promise<{ rows: BaselineRestaurant[]; fetchedAt: string }> {
  ensurePublicEnvLoaded();
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  const key = (
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    ""
  ).trim();
  if (base === "" || key === "") {
    throw new Error(
      "Live baseline fetch needs NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY " +
        "(or legacy NEXT_PUBLIC_SUPABASE_ANON_KEY) in env — or pass --baseline <snapshot.json> / run fetch-baseline.ts once."
    );
  }
  const rows = await fetchRestaurantsGet(base, key);
  return { fetchedAt: new Date().toISOString(), rows };
}

/** Resolve the baseline according to the CLI options (priority: file > save+live > default snapshot > live). */
export async function loadBaseline(opts: BaselineOptions): Promise<BaselineSource> {
  if (opts.baselineFile) {
    const file = resolve(opts.baselineFile);
    if (!existsSync(file)) throw new Error(`Baseline snapshot not found: ${file}`);
    const text = readFileSync(file, "utf8");
    const snap = parseSnapshot(JSON.parse(text), file);
    return {
      source: "snapshot",
      file,
      sha256: null, // filled by the CLI (it already hashes the file bytes)
      fetchedAt: snap.fetched_at,
      rows: snap.rows,
    };
  }

  if (opts.saveBaselinePath) {
    const { writeFileSync, mkdirSync } = await import("node:fs");
    const { dirname } = await import("node:path");
    const { createHash } = await import("node:crypto");
    const live = await fetchLive();
    const outPath = resolve(opts.saveBaselinePath);
    const snapshot = {
      table: "restaurants",
      fetched_at: live.fetchedAt,
      mode: "live-read-only-get",
      count: live.rows.length,
      rows: live.rows,
    };
    mkdirSync(dirname(outPath), { recursive: true });
    const body = JSON.stringify(snapshot, null, 2) + "\n";
    writeFileSync(outPath, body, "utf8");
    return {
      source: "snapshot",
      file: outPath,
      sha256: createHash("sha256").update(body).digest("hex"),
      fetchedAt: live.fetchedAt,
      rows: live.rows,
    };
  }

  if (opts.defaultSnapshotPath && existsSync(opts.defaultSnapshotPath)) {
    const file = resolve(opts.defaultSnapshotPath);
    const text = readFileSync(file, "utf8");
    const snap = parseSnapshot(JSON.parse(text), file);
    return {
      source: "snapshot",
      file,
      sha256: null,
      fetchedAt: snap.fetched_at,
      rows: snap.rows,
    };
  }

  const live = await fetchLive();
  return { source: "live-get", file: null, sha256: null, fetchedAt: live.fetchedAt, rows: live.rows };
}
