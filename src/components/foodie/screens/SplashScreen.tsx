"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Logo } from "../Logo";
import { useFoodieStore } from "@/lib/foodie/store";
import { APP_TAGLINE } from "@/lib/foodie/constants";

const FLOATERS = [
  { emoji: "🍕", x: "8%", y: "18%", delay: 0, size: "text-4xl", duration: 5 },
  { emoji: "🍜", x: "76%", y: "12%", delay: 0.6, size: "text-5xl", duration: 6 },
  { emoji: "🌮", x: "16%", y: "66%", delay: 1.1, size: "text-4xl", duration: 5.5 },
  { emoji: "🍩", x: "82%", y: "58%", delay: 0.3, size: "text-4xl", duration: 6.5 },
  { emoji: "🍛", x: "60%", y: "76%", delay: 1.6, size: "text-3xl", duration: 5 },
  { emoji: "🥑", x: "36%", y: "8%", delay: 2, size: "text-3xl", duration: 7 },
];

/** Screen 1 — modern splash / welcome */
export function SplashScreen() {
  const go = useFoodieStore((s) => s.go);

  return (
    <div className="foodie-gradient relative flex h-full flex-col overflow-hidden">
      <div className="foodie-dots absolute inset-0" aria-hidden="true" />

      {/* floating food emojis */}
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        {FLOATERS.map((f) => (
          <motion.span
            key={f.emoji}
            className={`absolute ${f.size} drop-shadow-lg`}
            style={{ left: f.x, top: f.y }}
            animate={{ y: [0, -14, 0], rotate: [-6, 6, -6] }}
            transition={{
              duration: f.duration,
              repeat: Infinity,
              delay: f.delay,
              ease: "easeInOut",
            }}
          >
            {f.emoji}
          </motion.span>
        ))}
      </div>

      <div className="relative flex flex-1 flex-col items-center justify-center px-8 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 120, damping: 14 }}
        >
          <Logo size="lg" tone="light" />
        </motion.div>

        <motion.p
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.25, duration: 0.5 }}
          className="mt-4 max-w-[16rem] text-[17px] font-medium leading-snug text-white/95"
        >
          {APP_TAGLINE}
        </motion.p>

        <motion.div
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.45, duration: 0.5 }}
          className="mt-3 flex flex-wrap items-center justify-center gap-x-1.5 gap-y-1 text-[12.5px] font-medium text-white/80"
        >
          <Sparkles className="size-3.5" aria-hidden="true" />
          <span>Hidden gems</span>
          <span aria-hidden="true" className="text-white/40">•</span>
          <span>Local favorites</span>
          <span aria-hidden="true" className="text-white/40">•</span>
          <span>Budget eats</span>
        </motion.div>
      </div>

      <motion.div
        initial={{ y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.55, duration: 0.5 }}
        className="relative space-y-4 px-7 pb-safe"
        style={{ paddingBottom: "max(2rem, env(safe-area-inset-bottom))" }}
      >
        <button
          type="button"
          onClick={() => go("auth")}
          className="group flex h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-white text-[15.5px] font-bold text-orange-600 shadow-xl shadow-black/15 transition-all hover:bg-orange-50 active:scale-[0.98]"
        >
          Get Started
          <ArrowRight className="size-4.5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => go("auth")}
          className="mx-auto block text-[13.5px] font-medium text-white/85 transition-colors hover:text-white"
        >
          Already have an account?{" "}
          <span className="font-bold underline underline-offset-2">Log in</span>
        </button>
      </motion.div>
    </div>
  );
}
