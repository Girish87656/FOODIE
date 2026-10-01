import { cn } from "@/lib/utils";

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

/** Foodie brand logo — gradient utensils mark + lowercase wordmark */
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
        <svg viewBox="0 0 64 64" className="size-[62%]" fill="none">
          <g fill="#ffffff">
            <path d="M22.5 12c-3.6 0-6.5 4.2-6.5 9.4 0 3.9 1.7 7.2 4 8.5V50a2.5 2.5 0 0 0 5 0V29.9c2.3-1.3 4-4.6 4-8.5 0-5.2-2.9-9.4-6.5-9.4z" />
            <path d="M42 12v12.5a1.5 1.5 0 0 1-3 0V12h-2.5v12.5a1.5 1.5 0 0 1-3 0V12H31v14.8c0 2.9 1.9 5.3 4.5 6.1V50a2.5 2.5 0 0 0 5 0V32.9c2.6-.8 4.5-3.2 4.5-6.1V12H42z" />
          </g>
        </svg>
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
          <span className="text-primary">.</span>
        </span>
      )}
    </div>
  );
}
