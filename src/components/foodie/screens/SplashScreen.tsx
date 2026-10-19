"use client";

import { useEffect, useState } from "react";
import { MotionConfig, motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { LOGO_MARK_PATHS } from "../Logo";
import { useFoodieStore } from "@/lib/foodie/store";
import { needsOnboarding, useAuthStore } from "@/lib/foodie/authStore";
import { APP_TAGLINE } from "@/lib/foodie/constants";

/** How long the brand animation plays before routing continues (ms). */
const BRAND_MS = 1400;

const WORDMARK = "foodie".split("");

const markStroke = {
  stroke: "#fff",
  strokeWidth: 4,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

/**
 * Screen 1 — Foodie brand splash.
 *
 * Every app open plays a short (~1.4s) original logo animation: the mark
 * tile springs in, the fork & spoon strokes draw themselves, the wordmark
 * letters settle and the tagline fades up. When it finishes:
 *   - returning (authenticated) users go straight to home — they are never
 *     pushed through onboarding or a long splash;
 *   - first-time visitors stay on this screen, which settles into the
 *     welcome state (Get Started / Log in) while the brand lockup holds.
 *
 * Replaces the old emoji-based splash — pure Foodie branding, no floats.
 */
export function SplashScreen() {
  const go = useFoodieStore((s) => s.go);
  const authStatus = useAuthStore((s) => s.status);
  const session = useAuthStore((s) => s.session);
  const user = useAuthStore((s) => s.user);
  // Auth config errors (missing Supabase env) mean accounts can NEVER work
  // in this environment — the welcome screen then offers the honest demo
  // exploration path instead of a dead-end signup form.
  const authConfigError = useAuthStore((s) => s.configError);
  const [brandDone, setBrandDone] = useState(false);

  // The brand animation always plays in full — once per app open, 1.4s.
  useEffect(() => {
    const t = window.setTimeout(() => setBrandDone(true), BRAND_MS);
    return () => window.clearTimeout(t);
  }, []);

  // Once the animation has finished AND auth has resolved, hand off:
  // authenticated users go straight to home (or finish onboarding),
  // everyone else stays here and the screen settles into its welcome state
  // (phase is derived below — no extra state updates needed).
  useEffect(() => {
    if (brandDone && authStatus === "ready" && session) {
      go(needsOnboarding(user) ? "onboarding-context" : "home");
    }
  }, [brandDone, authStatus, session, user, go]);

  const authResolved = authStatus === "ready";
  const phase = brandDone && authResolved && !session ? "welcome" : "brand";

  return (
    <MotionConfig reducedMotion="user">
      <div className="foodie-gradient relative flex h-full flex-col overflow-hidden">
        <div className="foodie-dots absolute inset-0" aria-hidden="true" />

        <div className="relative flex flex-1 flex-col items-center justify-center px-8 text-center">
          {/* ── brand mark: tile springs in, utensils draw themselves ── */}
          <motion.div
            initial={{ scale: 0.55, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 16 }}
            className="relative"
          >
            <div className="foodie-gradient grid size-24 place-items-center rounded-[1.75rem] shadow-2xl shadow-black/25">
              <svg viewBox="0 0 64 64" className="size-[64%]" fill="none" aria-hidden="true">
                <g {...markStroke} transform="rotate(-7 25 31)">
                  <motion.path
                    d={LOGO_MARK_PATHS.forkTines}
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ delay: 0.3, duration: 0.45, ease: "easeInOut" }}
                  />
                  <motion.path
                    d={LOGO_MARK_PATHS.forkBody}
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ delay: 0.38, duration: 0.5, ease: "easeInOut" }}
                  />
                </g>
                <g {...markStroke} transform="rotate(7 41 31)">
                  <motion.path
                    d={LOGO_MARK_PATHS.spoonBowl}
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ delay: 0.45, duration: 0.45, ease: "easeInOut" }}
                  />
                  <motion.path
                    d={LOGO_MARK_PATHS.spoonStem}
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ delay: 0.55, duration: 0.35, ease: "easeInOut" }}
                  />
                </g>
              </svg>
            </div>
            {/* one soft glow pulse as the mark lands */}
            <motion.span
              initial={{ opacity: 0.55, scale: 0.9 }}
              animate={{ opacity: 0, scale: 1.5 }}
              transition={{ delay: 0.25, duration: 0.85, ease: "easeOut" }}
              className="absolute inset-0 rounded-[1.75rem] ring-2 ring-white/70"
              aria-hidden="true"
            />
          </motion.div>

          {/* ── wordmark ── */}
          <div
            aria-label="Foodie"
            className="mt-5 flex items-baseline text-[2.6rem] font-extrabold leading-none tracking-tight text-white"
          >
            {WORDMARK.map((ch, i) => (
              <motion.span
                key={i}
                aria-hidden="true"
                initial={{ y: 16, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.55 + i * 0.045, duration: 0.3, ease: "easeOut" }}
              >
                {ch}
              </motion.span>
            ))}
            <motion.span
              aria-hidden="true"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.9, type: "spring", stiffness: 420, damping: 14 }}
              className="ml-0.5 text-white/70"
            >
              .
            </motion.span>
          </div>

          {/* ── tagline ── */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.02, duration: 0.35 }}
            className="mt-3.5 max-w-[17rem] text-[15.5px] font-medium leading-snug text-white/90"
          >
            {APP_TAGLINE}
          </motion.p>

          {/* ── welcome-only: trust chips (no emoji floats) ── */}
          {phase === "welcome" && (
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mt-4 flex flex-wrap items-center justify-center gap-x-1.5 gap-y-1 text-[12.5px] font-medium text-white/80"
            >
              <Sparkles className="size-3.5" aria-hidden="true" />
              <span>Hidden gems</span>
              <span aria-hidden="true" className="text-white/40">
                •
              </span>
              <span>Local favorites</span>
              <span aria-hidden="true" className="text-white/40">
                •
              </span>
              <span>Budget eats</span>
            </motion.div>
          )}
        </div>

        {/* ── bottom: hold dots while auth restores, CTAs once welcome ── */}
        {phase === "brand" && brandDone && !authResolved && (
          <div
            className="relative flex items-center justify-center gap-1.5 pb-10"
            role="status"
            aria-label="Starting Foodie"
          >
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="size-1.5 rounded-full bg-white/80"
                animate={{ opacity: [0.25, 1, 0.25] }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.18, ease: "easeInOut" }}
              />
            ))}
          </div>
        )}

        {phase === "welcome" && (
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="relative space-y-4 px-7"
            style={{ paddingBottom: "max(2rem, env(safe-area-inset-bottom))" }}
          >
            <button
              type="button"
              onClick={() => go("auth")}
              className="group flex h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-white text-[15.5px] font-bold text-orange-600 shadow-xl shadow-black/15 transition-all hover:bg-orange-50 active:scale-[0.98]"
            >
              Get Started
              <ArrowRight
                className="size-4.5 transition-transform group-hover:translate-x-1"
                aria-hidden="true"
              />
            </button>
            <button
              type="button"
              onClick={() => go("auth")}
              className="mx-auto block text-[13.5px] font-medium text-white/85 transition-colors hover:text-white"
            >
              Already have an account?{" "}
              <span className="font-bold underline underline-offset-2">Log in</span>
            </button>
            {authConfigError && (
              <button
                type="button"
                onClick={() => go("home")}
                className="mx-auto block max-w-[280px] text-[12.5px] font-semibold leading-snug text-white/70 underline decoration-white/40 underline-offset-2 transition-colors hover:text-white"
              >
                Accounts aren&apos;t available right now — explore the clearly-labelled
                demo data instead
              </button>
            )}
          </motion.div>
        )}
      </div>
    </MotionConfig>
  );
}
