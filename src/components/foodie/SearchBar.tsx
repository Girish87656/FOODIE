"use client";

import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

/** "What are you craving?" search */
export function SearchBar({
  value,
  onChange,
  placeholder = "What are you craving?",
  className,
}: SearchBarProps) {
  return (
    <div
      className={cn(
        "flex h-12 items-center gap-2.5 rounded-2xl border border-border/70 bg-card px-3.5 shadow-sm transition-all focus-within:border-primary/50 focus-within:shadow-md focus-within:ring-4 focus-within:ring-primary/10",
        className
      )}
      role="search"
    >
      <span
        className="grid size-7 shrink-0 place-items-center rounded-full bg-accent"
        aria-hidden="true"
      >
        <Search className="size-[15px] text-primary" />
      </span>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label="Search food places and dishes"
        className="h-full w-full bg-transparent text-sm font-medium text-foreground outline-none placeholder:text-muted-foreground [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="grid size-6 shrink-0 place-items-center rounded-full bg-stone-200 text-stone-500 transition-colors hover:bg-stone-300"
        >
          <X className="size-3.5" />
        </button>
      )}
    </div>
  );
}
