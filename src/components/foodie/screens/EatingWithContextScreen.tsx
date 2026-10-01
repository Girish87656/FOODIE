"use client";

import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useFoodieStore } from "@/lib/foodie/store";
import { EAT_CONTEXTS, APP_NAME } from "@/lib/foodie/constants";
import type { EatContext } from "@/lib/foodie/types";
import { cn } from "@/lib/utils";

/** Screen 3 — onboarding step 1/2: companionship context */
export function EatingWithContextScreen() {
  const go = useFoodieStore((s) => s.go);
  const eatContext = useFoodieStore((s) => s.eatContext);
  const setEatContext = useFoodieStore((s) => s.setEatContext);
  const userName = useFoodieStore((s) => s.userName);

  function select(ctx: EatContext) {
    setEatContext(ctx);
    // auto-advance feels right for a single-choice question
    window.setTimeout(() => go("onboarding-prefs"), 260);
  }

  return (
    <div className="flex h-full flex-col">
      {/* progress */}
      <div className="flex items-center gap-3 px-5 pt-5">
        <button
          type="button"
          onClick={() => go("auth")}
          aria-label="Go back"
          className="grid size-10 place-items-center rounded-full border border-border bg-card text-foreground shadow-sm transition-colors hover:bg-accent"
        >
          <ArrowLeft className="size-4.5" />
        </button>
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-stone-100" role="presentation">
          <div className="foodie-gradient h-full w-1/2 rounded-full" />
        </div>
        <span className="text-[11px] font-bold text-muted-foreground">1 of 2</span>
      </div>

      <div className="flex flex-1 flex-col px-6">
        <motion.div
          initial={{ y: 14, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="mt-8"
        >
          <p className="text-[13px] font-bold uppercase tracking-widest text-primary">
            {APP_NAME} onboarding
          </p>
          <h1 className="mt-2 text-[26px] font-extrabold leading-tight tracking-tight text-foreground">
            {userName ? `Hey ${userName}, who are` : "Who are"} you eating with?
          </h1>
          <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">
            We&apos;ll tune every suggestion to match the mood of your table.
          </p>
        </motion.div>

        <div className="mt-7 grid grid-cols-2 gap-3" role="radiogroup" aria-label="Who are you eating with?">
          {EAT_CONTEXTS.map((ctx, i) => {
            const selected = eatContext === ctx.id;
            const wide = ctx.id === "Travelling";
            return (
              <motion.button
                key={ctx.id}
                type="button"
                role="radio"
                aria-checked={selected}
                initial={{ y: 18, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.08 * i, duration: 0.35 }}
                onClick={() => select(ctx.id)}
                className={cn(
                  "relative flex flex-col items-start gap-2 rounded-2xl border-2 p-4 text-left transition-all active:scale-[0.97]",
                  wide && "col-span-2 flex-row items-center",
                  selected
                    ? "border-primary bg-orange-50 shadow-lg shadow-orange-600/15"
                    : "border-border/70 bg-card hover:border-primary/40 hover:shadow-md"
                )}
              >
                <span
                  className={cn(
                    "grid size-12 shrink-0 place-items-center rounded-xl text-2xl",
                    selected ? "bg-primary/10" : "bg-stone-100"
                  )}
                  aria-hidden="true"
                >
                  {ctx.emoji}
                </span>
                <span className="min-w-0">
                  <span className="block text-[15px] font-bold text-foreground">{ctx.label}</span>
                  <span className="block truncate text-[12px] text-muted-foreground">{ctx.hint}</span>
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      <div className="px-6 pb-7" style={{ paddingBottom: "max(1.75rem, env(safe-area-inset-bottom))" }}>
        <button
          type="button"
          onClick={() => go("onboarding-prefs")}
          className="flex h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-foreground text-[15.5px] font-bold text-white shadow-xl transition-all hover:bg-foreground/90 active:scale-[0.98]"
        >
          Continue
          <ArrowRight className="size-4.5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
