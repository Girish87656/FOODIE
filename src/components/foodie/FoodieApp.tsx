"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useFoodieStore, type Screen } from "@/lib/foodie/store";
import { needsOnboarding, stopAuthListener, useAuthStore } from "@/lib/foodie/authStore";
import { APP_TAGLINE } from "@/lib/foodie/constants";
import { Logo } from "./Logo";
import { SplashScreen } from "./screens/SplashScreen";
import { AuthScreen } from "./screens/AuthScreen";
import { EatingWithContextScreen } from "./screens/EatingWithContextScreen";
import { PreferencesScreen } from "./screens/PreferencesScreen";
import { HomeScreen } from "./screens/HomeScreen";
import { PlaceDetailScreen } from "./screens/PlaceDetailScreen";

const SCREENS: Record<Screen, React.ComponentType> = {
  splash: SplashScreen,
  auth: AuthScreen,
  "onboarding-context": EatingWithContextScreen,
  "onboarding-prefs": PreferencesScreen,
  home: HomeScreen,
  detail: PlaceDetailScreen,
};

/** Desktop-only side branding shown next to the phone mockup */
function DesktopSidePanel() {
  return (
    <aside className="pointer-events-none fixed left-[8%] top-1/2 z-0 hidden max-w-sm -translate-y-1/2 xl:block">
      <Logo size="lg" tone="light" />
      <p className="mt-5 text-3xl font-extrabold leading-tight tracking-tight text-white">
        {APP_TAGLINE}
      </p>
      <p className="mt-4 text-[15px] leading-relaxed text-stone-400">
        Discover hidden gems, local favorites and budget eats around you — matched to who
        you&apos;re eating with and what you&apos;re craving.
      </p>
      <ul className="mt-6 space-y-2.5 text-[14px] font-medium text-stone-300">
        <li className="flex items-center gap-2.5">
          <span aria-hidden="true">💎</span> Hidden gems only locals know
        </li>
        <li className="flex items-center gap-2.5">
          <span aria-hidden="true">❤️</span> Favorites loved by your neighborhood
        </li>
        <li className="flex items-center gap-2.5">
          <span aria-hidden="true">💸</span> Budget eats that hit the spot
        </li>
      </ul>
      <p className="mt-8 text-[11px] font-medium uppercase tracking-widest text-stone-600">
        Foodie v1 — discovery preview
      </p>
    </aside>
  );
}

/**
 * Root of the Foodie app.
 * Mobile-first: full-bleed app on phones, a device mockup on desktop.
 * All screens live in one flow (state-routed), now with real Supabase Auth
 * gating the boot: authenticated users land on home, everyone else on splash.
 */
export function FoodieApp() {
  const screen = useFoodieStore((s) => s.screen);
  const authStatus = useAuthStore((s) => s.status);
  const session = useAuthStore((s) => s.session);
  const Screen = SCREENS[screen];

  // Boot: initialize real Supabase Auth — restores any persisted session and
  // subscribes to auth-state changes. No-op in demo mode (stays "ready").
  useEffect(() => {
    useAuthStore.getState().init();
    return () => stopAuthListener();
  }, []);

  // Returning authenticated users skip straight to discovery — they never
  // re-onboard on refresh. First-time users (no onboarding flag in their
  // auth metadata) keep the Splash → Auth → Context → Preferences → Home
  // flow exactly as before; new/unauthenticated users start at splash.
  useEffect(() => {
    if (
      authStatus === "ready" &&
      session &&
      useFoodieStore.getState().screen === "splash"
    ) {
      const first = needsOnboarding(session.user);
      useFoodieStore.getState().go(first ? "onboarding-context" : "home");
    }
  }, [authStatus, session]);

  // Keep the browser tab title honest with the current context
  useEffect(() => {
    document.title =
      screen === "home" || screen === "detail"
        ? "Foodie — Discover"
        : "Foodie — Your Personal Food Companion";
  }, [screen]);

  return (
    <div className="relative min-h-dvh w-full overflow-hidden bg-stone-950">
      {/* warm ambient backdrop (desktop) */}
      <div
        className="absolute inset-0 hidden bg-[radial-gradient(60rem_40rem_at_20%_20%,oklch(0.32_0.09_45/0.5),transparent),radial-gradient(50rem_36rem_at_85%_80%,oklch(0.28_0.07_30/0.55),transparent)] sm:block"
        aria-hidden="true"
      />
      <div className="foodie-dots absolute inset-0 hidden opacity-40 sm:block" aria-hidden="true" />

      <DesktopSidePanel />

      <div className="relative z-10 flex min-h-dvh w-full items-center justify-center sm:p-6">
        {/* app surface — full screen on mobile, device frame on desktop.
            `foodie-app-frame` is the portal target for full-frame overlays
            (account sheet): elements inside <header> can't host them because
            the header's backdrop-blur makes it their containing block. */}
        <div
          id="foodie-app-frame"
          className="relative flex h-dvh w-full max-w-[430px] flex-col overflow-hidden bg-background shadow-2xl shadow-black/60 sm:h-[min(880px,94dvh)] sm:rounded-[2.4rem] sm:ring-1 sm:ring-white/10"
          role="application"
          aria-label="Foodie app"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={screen}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
              className="absolute inset-0"
            >
              <Screen />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
