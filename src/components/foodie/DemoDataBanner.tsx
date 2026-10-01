"use client";

/**
 * DemoDataBanner — the honest "you are looking at sample data" strip.
 *
 * Rendered on Home whenever the data layer reports `mode: "demo"` (Supabase
 * not connected, or a Supabase query failed). Tapping it explains exactly
 * how to switch to the real database.
 */

import { FlaskConical } from "lucide-react";
import { toast } from "sonner";

export function DemoDataBanner({ notice }: { notice?: string | null }) {
  return (
    <button
      type="button"
      onClick={() =>
        toast.info("You're browsing demo data", {
          description:
            notice ??
            "Connect a Supabase project (NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in .env — legacy NEXT_PUBLIC_SUPABASE_ANON_KEY still accepted) and run supabase/schema.sql to switch Foodie to your real restaurant database. Full guide: supabase/README.md.",
          duration: 10_000,
        })
      }
      className="flex w-full items-center gap-2.5 rounded-2xl border border-dashed border-amber-300/80 bg-amber-50/80 px-3.5 py-2.5 text-left transition-colors hover:bg-amber-50"
      aria-label="Demo data is being shown. Tap for details on connecting Supabase."
    >
      <FlaskConical className="size-4 shrink-0 text-amber-600" aria-hidden="true" />
      <span className="min-w-0 flex-1">
        <span className="block text-[12px] font-extrabold uppercase tracking-wide text-amber-700">
          Demo data — not real restaurants
        </span>
        <span className="mt-0.5 block truncate text-[11.5px] text-amber-700/80">
          {notice ?? "Connect Supabase to switch to your real database. Tap for how."}
        </span>
      </span>
    </button>
  );
}
