"use client";

import { create } from "zustand";
import type { Session, User } from "@supabase/supabase-js";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { isEatContext, type EatContext } from "./types";
import { useFoodieStore } from "./store";

/**
 * Real Supabase Auth state for Foodie.
 *
 * - `init()` restores any persisted session on app startup and subscribes to
 *   `onAuthStateChange` so sign-in/sign-out/token-refresh stay in sync.
 * - `signIn` / `signUp` / `signOut` wrap the Supabase calls and NEVER surface
 *   raw technical errors — every failure is mapped to a short, friendly,
 *   user-safe message via `mapAuthError`.
 * - Passwords are only ever passed straight to `supabase.auth.signUp` /
 *   `signInWithPassword` — nothing is stored locally, logged, or sent
 *   anywhere else.
 *
 * There is NO demo/fake authentication: when the Supabase environment
 * variables are missing, auth operations fail with an explicit configuration
 * error (AUTH_CONFIG_ERROR) instead of silently pretending to authenticate.
 * The RESTAURANT data layer keeps its own clearly-labelled demo fallback;
 * auth does not.
 */

export type AuthStatus = "initializing" | "ready";

/**
 * Explicit development-facing error shown when the Supabase environment is
 * missing. Auth NEVER falls back to demo/fake accounts — the only honest
 * behaviour is to say loudly that configuration is absent.
 */
export const AUTH_CONFIG_ERROR =
  "Authentication isn't configured: NEXT_PUBLIC_SUPABASE_URL or its public key " +
  "(NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) is missing on this server. " +
  "Add them to .env / .env.local and restart the dev server.";

export interface AuthResult {
  ok: boolean;
  /**
   * signUp only — true when the account was created but email confirmation
   * is pending, so Supabase returned no session yet.
   */
  needsConfirmation?: boolean;
  /** Friendly, user-safe error message (never raw technical details). */
  error?: string;
}

interface AuthState {
  session: Session | null;
  user: User | null;
  status: AuthStatus;
  /** Non-null when Supabase auth env vars are missing (explicit config failure). */
  configError: string | null;
  init: () => void;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (email: string, password: string, fullName: string) => Promise<AuthResult>;
  signOut: () => Promise<AuthResult>;
}

/** Module-level unsubscribe handle — keeps init() idempotent across mounts. */
let unsubscribeListener: (() => void) | null = null;

/** Truly unsubscribes the auth listener (used on app unmount). */
export function stopAuthListener(): void {
  unsubscribeListener?.();
  unsubscribeListener = null;
}

/**
 * Maps any auth failure to a short, friendly message.
 * Raw Supabase error text (SQL hints, status codes, provider jargon) is
 * never shown to the user.
 */
function mapAuthError(err: unknown): string {
  const code = (err as { code?: string } | null)?.code ?? "";
  const message = err instanceof Error ? err.message.toLowerCase() : String(err ?? "").toLowerCase();

  if (code === "invalid_credentials" || message.includes("invalid login credentials")) {
    return "That email and password don't match an account. Double-check them and try again.";
  }
  if (
    code === "user_already_exists" ||
    code === "email_exists" ||
    message.includes("already registered") ||
    message.includes("already exists")
  ) {
    return "An account with this email already exists — try logging in instead.";
  }
  if (code === "email_address_invalid" || message.includes("invalid email") || message.includes("not a valid email")) {
    return "That email address isn't accepted. Please use your real email address (for example your GITAM email).";
  }
  if (code === "email_not_confirmed" || message.includes("not confirmed")) {
    return "Please confirm your email first — the confirmation link is in your inbox.";
  }
  if (
    code === "over_email_send_rate_limit" ||
    code === "over_request_rate_limit" ||
    message.includes("rate limit")
  ) {
    return "Too many attempts right now. Please wait a few minutes and try again.";
  }
  if (code === "weak_password" || message.includes("weak password") || message.includes("password")) {
    return "Please choose a stronger password (at least 6 characters).";
  }
  if (
    message.includes("fetch") ||
    message.includes("network") ||
    message.includes("load failed") ||
    message.includes("failed to fetch")
  ) {
    return "Can't reach the sign-in service. Check your connection and try again.";
  }
  if (message.includes("timeout")) {
    return "The sign-in service took too long to respond. Please try again.";
  }
  return "Something went wrong. Please try again in a moment.";
}

/** Best-effort display name from a real auth user (never shows raw email by default). */
function nameFromUser(user: User | null): string | null {
  if (!user) return null;
  const metaName =
    typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name.trim() : "";
  if (metaName) return metaName.split(/\s+/)[0];
  const email = user.email ?? "";
  if (email) {
    const base = email.split("@")[0].replace(/[._-].*/, "");
    if (base) return base.charAt(0).toUpperCase() + base.slice(1);
  }
  return null;
}

/**
 * True when a real user exists but hasn't completed the onboarding flow
 * (eat-context + preferences) yet. Persisted in the user's own auth
 * metadata — NOT in any database table — so returning users are never
 * forced through onboarding again, while first-time users keep the
 * Splash → Auth → Context → Preferences → Home flow even when email
 * confirmation is enabled.
 */
export function needsOnboarding(user: User | null): boolean {
  return !!user && user.user_metadata?.onboarded !== true;
}

/**
 * Persists onboarding completion to the signed-in user's auth metadata.
 * Fire-and-forget and non-fatal: onboarding still works offline/demo,
 * and a failed save simply means the user sees onboarding once more.
 */
export async function markOnboardingComplete(): Promise<void> {
  const sb = getBrowserSupabase();
  const current = useAuthStore.getState().user;
  if (!sb || !current) return;
  // Persist the Food Mode chosen during onboarding together with the
  // completion flag (one metadata write) so the mode survives refresh,
  // logout and login for first-time users too.
  const mode = useFoodieStore.getState().eatContext;
  try {
    const { data, error } = await sb.auth.updateUser({
      data: {
        onboarded: true,
        ...(isEatContext(mode) ? { food_mode: mode } : {}),
      },
    });
    if (!error && data.user) {
      useAuthStore.setState({ user: data.user, session: useAuthStore.getState().session });
    }
  } catch {
    // Non-fatal — onboarding completion is a UX nicety, not a gate.
  }
}

export interface FoodModeResult {
  ok: boolean;
  /** Friendly, user-safe error message (never raw technical details). */
  error?: string;
}

/** Maps a failed Food Mode save to a short, context-appropriate message. */
function mapModeError(err: unknown): string {
  const message = err instanceof Error ? err.message.toLowerCase() : String(err ?? "").toLowerCase();
  if (
    message.includes("fetch") ||
    message.includes("network") ||
    message.includes("load failed") ||
    message.includes("failed to fetch")
  ) {
    return "Couldn't save your food mode. Check your connection and try again.";
  }
  if (message.includes("timeout")) {
    return "Saving your food mode took too long. Please try again.";
  }
  return "Couldn't save your food mode. Please try again in a moment.";
}

/**
 * Persists a Food Mode change to the signed-in user's auth metadata
 * (`user_metadata.food_mode`) — the SAME Supabase Auth mechanism onboarding
 * uses for `onboarded`. GoTrue merges the provided keys into the existing
 * metadata, so `onboarded` / `full_name` are untouched: the session stays
 * alive and onboarding never restarts.
 *
 * - The user is always the server-validated session user (never client
 *   input, never a demo account).
 * - The in-app mode is mirrored into the Foodie store ONLY after a
 *   confirmed save, so UI and server never disagree.
 * - On failure nothing changes (no logout, no navigation, no store update).
 */
export async function updateFoodMode(mode: EatContext): Promise<FoodModeResult> {
  const sb = getBrowserSupabase();
  const current = useAuthStore.getState().user;
  if (!sb) return { ok: false, error: useAuthStore.getState().configError ?? AUTH_CONFIG_ERROR };
  if (!current) return { ok: false, error: "Please log in to change your food mode." };
  if (!isEatContext(mode)) return { ok: false, error: "That food mode isn't recognised." };
  try {
    const { data, error } = await sb.auth.updateUser({ data: { food_mode: mode } });
    if (error) return { ok: false, error: mapModeError(error) };
    if (data.user) {
      useAuthStore.setState({ user: data.user, session: useAuthStore.getState().session });
    }
    useFoodieStore.getState().setEatContext(mode);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: mapModeError(err) };
  }
}

/**
 * Keeps the existing Foodie profile state in sync with a real session.
 * Also restores the persisted Food Mode (`user_metadata.food_mode`) on
 * every session restore/login/refresh so the mode survives reloads,
 * logout/login and app restarts without repeating onboarding.
 */
function syncProfileFromSession(session: Session | null): void {
  if (!session?.user) return;
  const foodie = useFoodieStore.getState();
  if (!foodie.userName) {
    const name = nameFromUser(session.user);
    if (name) foodie.setUserName(name);
  }
  // Server metadata is authoritative for the saved mode — apply it whenever
  // it holds a valid value. Invalid/missing values leave the store alone.
  const savedMode = session.user.user_metadata?.food_mode;
  if (isEatContext(savedMode) && foodie.eatContext !== savedMode) {
    foodie.setEatContext(savedMode);
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  status: "initializing",
  configError: null,

  init: () => {
    if (unsubscribeListener) return; // already initialized
    const sb = getBrowserSupabase();
    if (!sb) {
      // Missing configuration is a LOUD failure, never a silent demo mode:
      // the auth screen shows an explicit configuration error and every
      // auth operation returns AUTH_CONFIG_ERROR. No fake accounts.
      set({ status: "ready", configError: AUTH_CONFIG_ERROR });
      return;
    }

    // Subscribe first so no transition is missed (also fires an immediate
    // INITIAL_SESSION event with any persisted session).
    const { data } = sb.auth.onAuthStateChange((_event, session) => {
      set({ session, user: session?.user ?? null, status: "ready" });
      syncProfileFromSession(session);
    });
    unsubscribeListener = () => data.subscription.unsubscribe();

    // Belt-and-braces: explicitly restore the persisted session at startup.
    void sb.auth
      .getSession()
      .then(({ data: restored }) => {
        set({
          session: restored.session,
          user: restored.session?.user ?? null,
          status: "ready",
        });
        syncProfileFromSession(restored.session);
      })
      .catch(() => {
        set({ status: "ready" });
      });
  },

  signIn: async (email, password) => {
    const sb = getBrowserSupabase();
    if (!sb) return { ok: false, error: useAuthStore.getState().configError ?? AUTH_CONFIG_ERROR };
    try {
      const { data, error } = await sb.auth.signInWithPassword({ email, password });
      if (error) return { ok: false, error: mapAuthError(error) };
      set({ session: data.session, user: data.user ?? null });
      syncProfileFromSession(data.session);
      return { ok: true };
    } catch (err) {
      return { ok: false, error: mapAuthError(err) };
    }
  },

  signUp: async (email, password, fullName) => {
    const sb = getBrowserSupabase();
    if (!sb) return { ok: false, error: useAuthStore.getState().configError ?? AUTH_CONFIG_ERROR };
    try {
      const { data, error } = await sb.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });
      if (error) return { ok: false, error: mapAuthError(error) };
      if (data.session) {
        set({ session: data.session, user: data.user ?? null });
        syncProfileFromSession(data.session);
        return { ok: true };
      }
      // Account created but no session — email confirmation is pending.
      // Never bypassed: the user must open the link from their inbox.
      return { ok: true, needsConfirmation: true };
    } catch (err) {
      return { ok: false, error: mapAuthError(err) };
    }
  },

  signOut: async () => {
    const sb = getBrowserSupabase();
    if (!sb) return { ok: false, error: useAuthStore.getState().configError ?? AUTH_CONFIG_ERROR };
    try {
      const { error } = await sb.auth.signOut();
      if (error) return { ok: false, error: mapAuthError(error) };
      set({ session: null, user: null });
      return { ok: true };
    } catch (err) {
      return { ok: false, error: mapAuthError(err) };
    }
  },
}));
