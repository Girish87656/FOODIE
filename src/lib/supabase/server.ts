/**
 * Supabase client factory (server-side — used inside Next.js API routes).
 *
 * The client is created with the PUBLIC publishable/anon key, so every query
 * is governed by Row Level Security exactly like a browser client would be.
 * This keeps
 * database access centralized in the API layer: the UI never talks to
 * Supabase directly, it talks to `/api/restaurants/*`.
 *
 * Swapping to a service-role client later (for trusted admin writes) only
 * requires changing this one file — call sites stay untouched.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL, isSupabaseConfigured } from "./config";

let cachedClient: SupabaseClient | null = null;

/**
 * Returns the shared Supabase client, or `null` when credentials are not
 * configured yet (callers then fall back to the demo dataset).
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  if (!cachedClient) {
    cachedClient = createClient(SUPABASE_URL.trim(), SUPABASE_PUBLISHABLE_KEY, {
      auth: {
        // The API layer is anonymous for now — real user sessions arrive
        // with Supabase Auth and must persist per-browser, not per-server.
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }
  return cachedClient;
}
