/**
 * Foodie — enrichment research helpers: live-baseline reader + polite HTTP.
 *
 * The live reader performs ONE read-only GET against the project's PostgREST
 * endpoint using the PUBLIC publishable key from .env.local (same key the app
 * itself uses; RLS applies). Nothing else in the pipeline touches Supabase.
 */

import { readFileSync, existsSync } from "fs";
import type { LivePlace } from "./types";

/** Read the public env pair exactly the way the app does. */
function loadPublicEnv(): { url: string; key: string } {
  // scripts run from the repo root via `bun scripts/...`
  // .env.local is optional (the repo may only ship .env); missing ≠ error
  const localLines = existsSync(".env.local") ? readFileSync(".env.local", "utf8").split("\n") : [];
  const lines = [
    ...localLines,
    ...readFileSync(".env", "utf8").split("\n"),
  ];
  let url = "";
  let key = "";
  for (const line of lines) {
    const m = /^([A-Z0-9_]+)=(.*)$/.exec(line.trim());
    if (!m) continue;
    if (m[1] === "NEXT_PUBLIC_SUPABASE_URL") url = m[2].trim();
    if (m[1] === "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY") key = m[2].trim();
    if (m[1] === "NEXT_PUBLIC_SUPABASE_ANON_KEY" && !key) key = m[2].trim();
  }
  if (!/^https:\/\//.test(url) || key.length < 30) {
    throw new Error("Supabase public env not found — cannot read live baseline (read-only).");
  }
  return { url, key };
}

/**
 * Read ALL discoverable restaurants (SELECT only — the same public read the
 * app's /api/restaurants/all performs). Sorted by name for stable output.
 */
export async function fetchLivePlaces(): Promise<LivePlace[]> {
  const { url, key } = loadPublicEnv();
  const res = await fetch(`${url}/rest/v1/restaurants?select=id,name,category,address,city,locality,latitude,longitude,source_url,source&order=name.asc`, {
    headers: { apikey: key, Authorization: `Bearer ${key}`, Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`PostgREST read failed: ${res.status} ${await res.text()}`);
  const rows = (await res.json()) as Array<Record<string, unknown>>;
  return rows.map((r) => ({
    id: String(r.id),
    name: String(r.name),
    category: String(r.category ?? ""),
    address: String(r.address ?? ""),
    city: String(r.city ?? ""),
    locality: (r.locality as string | null) ?? null,
    latitude: (r.latitude as number | null) ?? null,
    longitude: (r.longitude as number | null) ?? null,
    sourceUrl: (r.source_url as string | null) ?? null,
  }));
}

const lastHitByHost = new Map<string, number>();

/** Polite fetch: >= SAME_HOST_DELAY_MS between hits on the same host. */
export async function politeFetch(url: string, headers: Record<string, string> = {}, timeoutMs = 15_000): Promise<Response> {
  const host = new URL(url).host;
  const now = Date.now();
  const last = lastHitByHost.get(host) ?? 0;
  const wait = Math.max(0, 1200 - (now - last));
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  lastHitByHost.set(host, Date.now());

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      headers,
      signal: controller.signal,
      redirect: "follow",
    });
  } finally {
    clearTimeout(timer);
  }
}

export const RESEARCH_UA =
  "FoodieEnrichmentResearch/1.0 (https://github.com/Girish87656/FOODIE; contact: repo issue tracker)";

/** Stable file slug for evidence filenames. */
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/**
 * Match rule for photo/snippet candidates: the SOURCE TITLE must contain a
 * meaningful token of the restaurant name (>= 5 chars, not a stopword like
 * "hotel"/"restaurant"). "exact" = the distinctive-name token appears;
 * otherwise a candidate is at best a "lead" — never auto-approved.
 */
const STOPWORDS = new Set(["hotel", "restaurant", "family", "grand", "cafe", "the", "and", "sri", "shree"]);
export function nameMatchKind(sourceTitle: string, restaurantName: string): "exact" | "fuzzy" | "lead" {
  const title = sourceTitle.toLowerCase();
  const tokens = restaurantName
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length >= 5 && !STOPWORDS.has(t));
  if (tokens.length === 0) return "lead";
  const hit = tokens.find((t) => title.includes(t));
  if (hit) {
    // require the hit to be the distinctive part (first meaningful token)
    return tokens.indexOf(hit) <= 1 ? "exact" : "fuzzy";
  }
  return "lead";
}

/**
 * Provenance-locality guard for search-snippet candidates: search engines
 * return SAME-NAME businesses in other areas ("Pizza Palace, Sultanpur",
 * "Ayodhya Grand, Nagarbhavi") and NEAR-NAME businesses in the same town
 * ("Burger Point" for "Burger Time"), so a snippet may only feed a place's
 * menu when (a) the FULL place name (whitespace-normalized) appears in the
 * snippet title/text and (b) the text names the pilot-corridor town
 * (Doddaballapura). Single-token/fuzzy matches are deliberately rejected:
 * a wrong-place menu is worse than no menu. Items from a place's OWN
 * recorded source_url (page_reader tier) are exempt — that URL is the
 * human-reviewed listing.
 */
export function snippetMatchesPlace(titleAndText: string, restaurantName: string): boolean {
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim();
  const text = norm(titleAndText);
  if (!/doddaballapur/.test(text)) return false;
  return text.includes(norm(restaurantName));
}
