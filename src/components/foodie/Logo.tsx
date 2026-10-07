import { cn } from "@/lib/utils";

/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  Foodie logo — SINGLE SOURCE OF TRUTH
 *
 *  Every Foodie logo inside the app renders from this file. The static brand
 *  assets (public/icon.svg, the PNG app icons and the apple-touch icon) are
 *  generated from the same mark geometry via `scripts/generate-icons.mjs`.
 *
 *  If you change the mark or paths here, re-run:  bun scripts/generate-icons.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 */

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showWordmark?: boolean;
  /** light = white text (for dark/gradient backgrounds) */
  tone?: "dark" | "light";
  className?: string;
}

const sizes = {
  sm: { mark: "size-9 rounded-xl", word: "text-xl" },
  md: { mark: "size-14 rounded-2xl", word: "text-3xl" },
  lg: { mark: "size-20 rounded-[1.4rem]", word: "text-4xl" },
} as const;

/**
 * Fork + spoon stroke geometry (viewBox 0 0 64 64) — shared with
 * `scripts/generate-icons.mjs`, which emits the favicon/app icons from it.
 * Kept as raw path data so the splash animation can draw the strokes.
 */
export const LOGO_MARK_PATHS = {
  forkTines: "M19.5 15v11M25 15v11M30.5 15v11",
  forkBody: "M19.5 26c0 3 2.46 4.8 5.5 4.8s5.5-1.8 5.5-4.8M25 30.8V48",
  spoonBowl: "M36.4 20.5c0-3.3 2.06-6 4.6-6s4.6 2.7 4.6 6-2.06 6-4.6 6-4.6-2.7-4.6-6Z",
  spoonStem: "M41 26.5V48",
} as const;

/**
 * The Foodie mark — a white fork & spoon, gently fanned apart like a place
 * setting, on the signature saffron gradient tile. Drawn with strokes (not
 * fills) so it stays crisp from a 16px favicon up to the desktop panel.
 * This is Foodie's own mark — deliberately not any aggregator's branding.
 */
export function FoodieMark({
  className,
  strokeWidth = 4,
}: {
  className?: string;
  strokeWidth?: number;
}) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" aria-hidden="true">
      <g
        stroke="#fff"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        transform="rotate(-7 25 31)"
      >
        <path d={LOGO_MARK_PATHS.forkTines} />
        <path d={LOGO_MARK_PATHS.forkBody} />
      </g>
      <g
        stroke="#fff"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        transform="rotate(7 41 31)"
      >
        <path d={LOGO_MARK_PATHS.spoonBowl} />
        <path d={LOGO_MARK_PATHS.spoonStem} />
      </g>
    </svg>
  );
}

/** Foodie brand logo — gradient mark tile + lowercase "foodie." wordmark */
export function Logo({ size = "md", showWordmark = true, tone = "dark", className }: LogoProps) {
  const s = sizes[size];
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div
        className={cn(
          "foodie-gradient grid shrink-0 place-items-center shadow-lg shadow-orange-600/25",
          s.mark
        )}
        aria-hidden="true"
      >
        <FoodieMark className="size-[64%]" />
      </div>
      {showWordmark && (
        <span
          className={cn(
            "font-extrabold tracking-tight",
            s.word,
            tone === "light" ? "text-white" : "text-foreground"
          )}
        >
          foodie
          {/* on the orange gradient the primary-orange dot would vanish — use a
              soft white dot for the light tone, brand orange on light surfaces */}
          <span className={tone === "light" ? "text-white/70" : "text-primary"}>.</span>
        </span>
      )}
    </div>
  );
}
