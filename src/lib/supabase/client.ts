/**
 * Supabase browser client (Foodie).
 *
 * Used ONLY in client components ("use client") for real authentication:
 * sign up, sign in, sign out, session persistence and the auth-state
 * listener live on this client.
 *
 * - The PUBLIC publishable/anon key only (never a service-role key — see
 *   config.ts for the naming migration: NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
 *   with legacy NEXT_PUBLIC_SUPABASE_ANON_KEY fallback).
 * - persistSession: true   → the session is stored in browser storage and
 *   restored automatically on reload, so returning users stay logged in.
 * - autoRefreshToken: true → access tokens refresh silently in the
 *   background before they expire.
 * - detectSessionInUrl: true → completes sign-in automatically when the
 *   user returns from an email-confirmation link carrying tokens in the
 *   URL fragment.
 *
 * All queries still flow through RLS exactly like the server-side client:
 * the browser client holds the user's own JWT, so `auth.uid()` policies
 * (e.g. "users can write their own reviews") govern every write.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL, isSupabaseConfigured } from "./config";

let cachedBrowserClient: SupabaseClient | null = null;

/**
 * Returns the shared browser Supabase client, or `null` when credentials
 * are not configured (authStore then surfaces an explicit AUTH_CONFIG_ERROR
 * — authentication NEVER falls back to demo/fake mode) or when called
 * outside a browser context (SSR).
 */
export function getBrowserSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  if (typeof window === "undefined") return null;
  if (!cachedBrowserClient) {
    cachedBrowserClient = createClient(SUPABASE_URL.trim(), SUPABASE_PUBLISHABLE_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }
  return cachedBrowserClient;
}
