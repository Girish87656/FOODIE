"use client";

import { ChevronRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  /** Professional UI icon (Lucide) rendered in a tinted tile — no emoji. */
  icon?: LucideIcon;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

/** Consistent section title row used across the Home screen */
export function SectionHeader({
  title,
  subtitle,
  icon: Icon,
  actionLabel,
  onAction,
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn("mb-3 flex items-end justify-between gap-3 px-4", className)}>
      <div className="min-w-0">
        <h2 className="flex items-center gap-2 text-[17px] font-extrabold leading-tight tracking-tight text-foreground">
          {Icon && (
            <span
              aria-hidden="true"
              className="grid size-7 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary"
            >
              <Icon className="size-4" />
            </span>
          )}
          <span className="truncate">{title}</span>
        </h2>
        {subtitle && <p className="mt-0.5 truncate text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="-mr-2 flex shrink-0 items-center gap-0.5 rounded-full px-2.5 py-1.5 text-[13px] font-bold text-primary transition-colors hover:bg-accent active:scale-95"
        >
          {actionLabel}
          <ChevronRight className="size-3.5" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
