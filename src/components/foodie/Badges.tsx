import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

/** Green rating pill, the universally-recognized "food app" signal.
 *  A rating of 0 means "not yet captured" in the database — the badge is
 *  hidden rather than showing a misleading 0.0★. */
export function RatingBadge({
  rating,
  className,
}: {
  rating: number;
  className?: string;
}) {
  if (!(rating > 0)) return null;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-1.5 py-0.5 text-[11px] font-bold text-white shadow-sm",
        className
      )}
      aria-label={`Rated ${rating} out of 5`}
    >
      {rating.toFixed(1)}
      <Star className="size-3 fill-white" aria-hidden="true" />
    </span>
  );
}

const badgeStyles: Record<string, string> = {
  "Hidden Gem": "bg-violet-500/95",
  "Local Favorite": "bg-rose-500/95",
  Popular: "bg-amber-500/95",
  "Budget Pick": "bg-emerald-600/95",
};

/** Small ribbon label for place cards */
export function PlaceBadge({
  label,
  className,
}: {
  label: keyof typeof badgeStyles | string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm",
        badgeStyles[label] ?? "bg-stone-700/95",
        className
      )}
    >
      {label}
    </span>
  );
}
