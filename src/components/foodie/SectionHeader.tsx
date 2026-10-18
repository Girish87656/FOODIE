"use client";

import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  emoji?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

/** Consistent section title row used across the Home screen */
export function SectionHeader({
  title,
  subtitle,
  emoji,
  actionLabel,
  onAction,
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn("mb-3 flex items-end justify-between gap-3 px-4", className)}>
      <div className="min-w-0">
        <h2 className="flex items-center gap-1.5 text-[17px] font-extrabold leading-tight tracking-tight text-foreground">
          {emoji && <span aria-hidden="true">{emoji}</span>}
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
