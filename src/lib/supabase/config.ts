/**
 * Supabase environment configuration (Foodie).
 *
 * Credentials come ONLY from environment variables — never hardcoded:
 *
 *   NEXT_PUBLIC_SUPABASE_URL
 *   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY   ← current Supabase naming
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY          ← legacy name, still accepted
 *
 * `SUPABASE_PUBLISHABLE_KEY` resolves to whichever public-key variable is
 * set (publishable naming wins). Both names refer to the same class of
 * browser-safe key; the publishable name is canonical going forward.
 *
 * When the URL or key is missing, `isSupabaseConfigured()` returns false and:
 * - every Foodie DATA function transparently falls back to the clearly
 *   labelled DEMO DATA mode (see `src/lib/foodie/data/`), while
 * - AUTHENTICATION never falls back to anything fake — `authStore` surfaces
 *   an explicit configuration error instead (no silent demo accounts).
 *
 * Only the PUBLIC key is ever referenced here. It is safe for browsers
 * because Row Level Security (see `supabase/schema.sql`) governs what it can
 * read/write. The service-role/secret key must never appear in this codebase
 * or in any NEXT_PUBLIC_ variable.
 */

/**
 * Pure resolution of the three Supabase env inputs — the single place the
 * missing-variable / naming-migration / malformed-value rules live. Exported
 * so tests can cover every branch (missing vars, legacy fallback, bad URL,
 * short key) WITHOUT touching process.env or re-loading this module.
 */
export interface SupabaseEnvResolution {
  url: string;
  publishableKey: string;
  configured: boolean;
}

export function resolveSupabaseEnv(env: {
  url?: string;
  publishableKey?: string;
  legacyAnonKey?: string;
}): SupabaseEnvResolution {
  const url = (env.url ?? "").trim();
  const publishableKey = (env.publishableKey ?? "").trim() || (env.legacyAnonKey ?? "").trim();
  return { url, publishableKey, configured: looksLikeSupabaseUrl(url) && looksLikePublicKey(publishableKey) };
}

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

const PUBLISHABLE_KEY_ENV = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";
const LEGACY_ANON_KEY_ENV = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/** Resolved browser-safe public key (publishable naming first, legacy anon fallback). */
export const SUPABASE_PUBLISHABLE_KEY = PUBLISHABLE_KEY_ENV.trim() || LEGACY_ANON_KEY_ENV.trim();

/**
 * @deprecated Legacy alias kept so existing imports keep working during the
 * naming migration. Always identical to SUPABASE_PUBLISHABLE_KEY.
 */
export const SUPABASE_ANON_KEY = SUPABASE_PUBLISHABLE_KEY;

/** A URL looks like https://<project-ref>.supabase.co */
export function looksLikeSupabaseUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

/** A public key (legacy anon JWT or `sb_publishable_…`) is a long string; anything shorter means "not set up yet". */
export function looksLikePublicKey(key: string): boolean {
  return key.trim().length >= 30;
}

/**
 * True only when the URL AND a public key are both present and well-formed.
 * Used by the API routes to decide between the Supabase backend and the
 * demo backend, and by the UI to label the active data mode honestly.
 */
export function isSupabaseConfigured(): boolean {
  return looksLikeSupabaseUrl(SUPABASE_URL.trim()) && looksLikePublicKey(SUPABASE_PUBLISHABLE_KEY);
}
