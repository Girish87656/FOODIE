/**
 * DestinationFoodBadge — small honesty chip for how strongly a destination
 * claims a food ('signature' | 'famous' | 'local'), mirroring the DB CHECK
 * on destination_foods.designation. Rendered only when a designation is
 * actually known (an unknown value is never dressed up as a claim).
 */

import { cn } from "@/lib/utils";
import type { DestinationFoodDesignation } from "@/lib/foodie/types";

const STYLES: Record<DestinationFoodDesignation, { label: string; className: string }> = {
  signature: {
    label: "Signature",
    className: "bg-primary/10 text-primary",
  },
  famous: {
    label: "Famous",
    className: "bg-amber-100 text-amber-700",
  },
  local: {
    label: "Local",
    className: "bg-emerald-100 text-emerald-700",
  },
};

export function DestinationFoodBadge({
  designation,
  className,
}: {
  designation?: DestinationFoodDesignation;
  className?: string;
}) {
  if (!designation) return null;
  const style = STYLES[designation];
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wide",
        style.className,
        className
      )}
    >
      {style.label}
    </span>
  );
}
