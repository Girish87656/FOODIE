"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Sparkles } from "lucide-react";
import { useFoodieStore } from "@/lib/foodie/store";
import { markOnboardingComplete } from "@/lib/foodie/authStore";
import { PLACE_CATEGORIES } from "@/lib/foodie/constants";
import { CategoryTile } from "../CategoryChip";

/** Screen 4 — onboarding step 2/2: food preferences */
export function PreferencesScreen() {
  const go = useFoodieStore((s) => s.go);
  const preferences = useFoodieStore((s) => s.preferences);
  const togglePreference = useFoodieStore((s) => s.togglePreference);
  const eatContext = useFoodieStore((s) => s.eatContext);

  function finish() {
    if (preferences.length === 0) {
      togglePreference(PLACE_CATEGORIES[2].id); // sensible default: Tiffin (corridor staple)
    }
    // Persist onboarding completion to the user's auth metadata (no-op in
    // demo mode) so returning users aren't forced through this again.
    void markOnboardingComplete();
    go("home");
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 px-5 pt-5">
        <button
          type="button"
          onClick={() => go("onboarding-context")}
          aria-label="Go back"
          className="grid size-10 place-items-center rounded-full border border-border bg-card text-foreground shadow-sm transition-colors hover:bg-accent"
        >
          <ArrowLeft className="size-4.5" />
        </button>
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-stone-100" role="presentation">
          <div className="foodie-gradient h-full w-full rounded-full" />
        </div>
        <span className="text-[11px] font-bold text-muted-foreground">2 of 2</span>
      </div>

      <div className="flex flex-1 flex-col overflow-hidden px-6">
        <motion.div
          initial={{ y: 14, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="mt-8"
        >
          <p className="text-[13px] font-bold uppercase tracking-widest text-primary">
            Almost there
          </p>
          <h1 className="mt-2 text-[26px] font-extrabold leading-tight tracking-tight text-foreground">
            What do you love eating?
          </h1>
          <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">
            Pick a few cravings
            {eatContext ? ` — perfect for ${eatContext.toLowerCase()} dining` : ""}. You can
            change these anytime.
          </p>
        </motion.div>

        <div
          className="thin-scrollbar mt-7 grid flex-1 grid-cols-3 content-start gap-2.5 overflow-y-auto pb-4 sm:max-h-none"
          role="group"
          aria-label="Food preferences"
        >
          {PLACE_CATEGORIES.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.04 * i, duration: 0.3 }}
            >
              <CategoryTile
                category={cat}
                selected={preferences.includes(cat.id)}
                onToggle={() => togglePreference(cat.id)}
              />
            </motion.div>
          ))}
        </div>
      </div>

      <div
        className="space-y-2.5 px-6"
        style={{ paddingBottom: "max(1.75rem, env(safe-area-inset-bottom))" }}
      >
        <button
          type="button"
          onClick={finish}
          className="foodie-gradient flex h-[52px] w-full items-center justify-center gap-2 rounded-2xl text-[15.5px] font-bold text-white shadow-xl shadow-orange-600/30 transition-all hover:opacity-95 active:scale-[0.98]"
        >
          <Sparkles className="size-4.5" aria-hidden="true" />
          {preferences.length > 0
            ? `Show me ${preferences.length} flavor${preferences.length > 1 ? "s" : ""}`
            : "Start exploring"}
        </button>
        <button
          type="button"
          onClick={() => {
            void markOnboardingComplete();
            go("home");
          }}
          className="mx-auto block text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}
