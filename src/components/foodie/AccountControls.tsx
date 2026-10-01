"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Check, ChevronRight, Loader2, LogOut, Mail, X } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore, updateFoodMode } from "@/lib/foodie/authStore";
import { useFoodieStore } from "@/lib/foodie/store";
import { EAT_CONTEXTS } from "@/lib/foodie/constants";
import type { EatContext } from "@/lib/foodie/types";
import { cn } from "@/lib/utils";

/**
 * Account controls for real (Supabase Auth) sessions.
 *
 * Renders a small avatar button in the home header only when a real session
 * exists — in demo mode it renders nothing, so the existing experience stays
 * exactly as before. The button opens a bottom sheet (same visual language
 * as the location sheet) showing who is signed in, the persistent Food Mode
 * (changeable anytime, saved to the user's Supabase auth metadata), and
 * Sign Out, which returns the user to the splash/auth flow.
 *
 * The sheet is PORTALLED into the app frame (`#foodie-app-frame`): the
 * avatar button lives inside <header>, whose backdrop-blur makes it the
 * containing block for absolutely-positioned descendants — anchoring the
 * sheet there would clip it to the header band instead of the full app.
 * Portalling gives the sheet the same full-frame anchoring the location
 * sheet already has.
 */
export function AccountControls() {
  const user = useAuthStore((s) => s.user);
  const userName = useFoodieStore((s) => s.userName);
  const eatContext = useFoodieStore((s) => s.eatContext);
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<"menu" | "mode">("menu");
  const [savingMode, setSavingMode] = useState<EatContext | null>(null);
  const [signingOut, setSigningOut] = useState(false);
  const [frameEl, setFrameEl] = useState<HTMLElement | null>(null);

  // The mode object for the CURRENT saved value (null when not set yet —
  // e.g. accounts created before Food Mode existed; nothing is invented).
  const currentMode = EAT_CONTEXTS.find((c) => c.id === eatContext) ?? null;

  /** Closes the sheet and resets it to the menu view for the next open. */
  function closeSheet() {
    setOpen(false);
    setView("menu");
  }

  // Escape closes the sheet (same behaviour as the location sheet)
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeSheet();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // No real session → nothing to manage (demo/local flows unchanged)
  if (!user) return null;

  const email = user.email ?? "your account";
  const initial = (userName || email).charAt(0).toUpperCase();

  /** Opens the sheet, resolving the portal target at interaction time —
   *  client-only, the app frame exists by the time anything can be clicked. */
  function openSheet() {
    setFrameEl((el) => el ?? document.getElementById("foodie-app-frame"));
    setOpen(true);
  }

  async function handleModeChange(mode: EatContext) {
    if (savingMode) return; // one save at a time — no double submissions
    if (mode === eatContext) {
      setView("menu"); // picking the current mode is a no-op
      return;
    }
    setSavingMode(mode);
    const res = await updateFoodMode(mode);
    setSavingMode(null);
    if (res.ok) {
      // Return the user to the existing screen naturally: close the sheet
      // back on home, where the greeting already reflects the new mode.
      closeSheet();
      const emoji = EAT_CONTEXTS.find((c) => c.id === mode)?.emoji ?? "🍽️";
      toast.success(`Food mode set to ${mode}`, {
        description: `${emoji} Saved to your account — it'll be here when you come back.`,
      });
    } else {
      // Stay on the selection view so the user can retry immediately.
      toast.error("Couldn't update food mode", { description: res.error });
    }
  }

  async function handleSignOut() {
    setSigningOut(true);
    const res = await useAuthStore.getState().signOut();
    setSigningOut(false);
    if (res.ok) {
      closeSheet();
      // Clear the in-memory profile and return to the splash/auth flow
      useFoodieStore.getState().reset();
      toast.success("Signed out", { description: "See you at the next meal! 👋" });
    } else {
      toast.error("Couldn't sign out", { description: res.error });
    }
  }

  const overlay = (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="account-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeSheet}
            className="absolute inset-0 z-30 bg-stone-950/45 backdrop-blur-[2px]"
            aria-hidden="true"
          />
          <motion.div
            key="account-sheet"
            role="dialog"
            aria-modal="true"
            aria-label={view === "mode" ? "Food Mode" : "Account"}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="absolute inset-x-0 bottom-0 z-40 rounded-t-3xl border-t border-border/60 bg-background p-5 shadow-2xl"
            style={{ paddingBottom: "max(1.25rem, env(safe-area-inset-bottom))" }}
          >
              <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-stone-200" aria-hidden="true" />

              {view === "menu" ? (
                <>
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-[17px] font-extrabold tracking-tight text-foreground">Account</h2>
                    <button
                      type="button"
                      onClick={closeSheet}
                      aria-label="Close account panel"
                      className="grid size-8 place-items-center rounded-full border border-border bg-card text-stone-500 transition-colors hover:bg-accent"
                    >
                      <X className="size-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
                    <span className="foodie-gradient grid size-11 shrink-0 place-items-center rounded-full text-[16px] font-extrabold text-white shadow-md shadow-orange-600/30">
                      {initial}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-[14.5px] font-bold text-foreground">
                        {userName || "Foodie explorer"}
                      </p>
                      <p className="mt-0.5 flex items-center gap-1.5 text-[12.5px] text-muted-foreground">
                        <Mail className="size-3.5 shrink-0" aria-hidden="true" />
                        <span className="truncate">{email}</span>
                      </p>
                    </div>
                  </div>

                  {/* Food Mode — persistent, changeable anytime (requirement: shown
                      clearly with its current value; tapping opens the selector) */}
                  <button
                    type="button"
                    onClick={() => setView("mode")}
                    aria-haspopup="dialog"
                    aria-label={`Food Mode, current: ${currentMode?.label ?? "not set"}`}
                    className="mt-3 flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-4 text-left transition-all hover:border-primary/40 hover:shadow-md active:scale-[0.99]"
                  >
                    <span
                      className="grid size-11 shrink-0 place-items-center rounded-xl bg-stone-100 text-xl"
                      aria-hidden="true"
                    >
                      {currentMode?.emoji ?? "🍽️"}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[14.5px] font-bold text-foreground">Food Mode</span>
                      <span className="mt-0.5 block truncate text-[12.5px] text-muted-foreground">
                        {currentMode ? `Current: ${currentMode.label}` : "Current: Not set yet"}
                      </span>
                    </span>
                    <ChevronRight className="size-4.5 shrink-0 text-stone-400" aria-hidden="true" />
                  </button>

                  <button
                    type="button"
                    onClick={handleSignOut}
                    disabled={signingOut}
                    className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-border bg-card text-[15px] font-bold text-foreground transition-all hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700 active:scale-[0.98] disabled:cursor-wait disabled:opacity-60"
                  >
                    {signingOut ? (
                      <Loader2 className="size-4.5 animate-spin" aria-hidden="true" />
                    ) : (
                      <LogOut className="size-4.5" aria-hidden="true" />
                    )}
                    {signingOut ? "Signing out…" : "Sign out"}
                  </button>

                  <p className="mt-4 text-center text-[11px] leading-relaxed text-stone-400">
                    Signing out clears your session on this device. Your food mode is saved to
                    your account and will be here when you log back in — Foodie never posts
                    anywhere without asking.
                  </p>
                </>
              ) : (
                <>
                  {/* --- Food Mode selector (inside the same sheet) --- */}
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex min-w-0 items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setView("menu")}
                        aria-label="Back to account"
                        className="grid size-8 shrink-0 place-items-center rounded-full border border-border bg-card text-stone-500 transition-colors hover:bg-accent"
                      >
                        <ArrowLeft className="size-4" />
                      </button>
                      <h2 className="text-[17px] font-extrabold tracking-tight text-foreground">
                        Food Mode
                      </h2>
                    </div>
                    <button
                      type="button"
                      onClick={closeSheet}
                      aria-label="Close account panel"
                      className="grid size-8 place-items-center rounded-full border border-border bg-card text-stone-500 transition-colors hover:bg-accent"
                    >
                      <X className="size-4" />
                    </button>
                  </div>

                  <p className="mb-4 text-[13px] leading-relaxed text-muted-foreground">
                    Who are you eating with? Change it anytime — your pick is saved to your
                    account instantly.
                  </p>

                  <div
                    className="flex flex-col gap-2"
                    role="radiogroup"
                    aria-label="Choose your food mode"
                  >
                    {EAT_CONTEXTS.map((ctx) => {
                      const selected = eatContext === ctx.id;
                      const saving = savingMode === ctx.id;
                      return (
                        <button
                          key={ctx.id}
                          type="button"
                          role="radio"
                          aria-checked={selected}
                          disabled={savingMode !== null}
                          onClick={() => void handleModeChange(ctx.id)}
                          className={cn(
                            "flex items-center gap-3 rounded-2xl border-2 p-3.5 text-left transition-all active:scale-[0.98] disabled:cursor-wait",
                            selected
                              ? "border-primary bg-orange-50 shadow-md shadow-orange-600/10"
                              : "border-border/70 bg-card hover:border-primary/40 hover:shadow-sm",
                            savingMode !== null && !saving && "opacity-50"
                          )}
                        >
                          <span
                            className={cn(
                              "grid size-11 shrink-0 place-items-center rounded-xl text-xl",
                              selected ? "bg-primary/10" : "bg-stone-100"
                            )}
                            aria-hidden="true"
                          >
                            {ctx.emoji}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-[14.5px] font-bold text-foreground">
                              {ctx.label}
                            </span>
                            <span className="block truncate text-[12px] text-muted-foreground">
                              {ctx.hint}
                            </span>
                          </span>
                          {saving ? (
                            <Loader2 className="size-4.5 shrink-0 animate-spin text-primary" aria-hidden="true" />
                          ) : selected ? (
                            <Check className="size-4.5 shrink-0 text-primary" aria-label="Current mode" />
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <button
        type="button"
        onClick={openSheet}
        aria-haspopup="dialog"
        aria-label={`Account — signed in as ${email}`}
        className="foodie-gradient grid size-9 shrink-0 place-items-center rounded-full text-[13px] font-extrabold text-white shadow-md shadow-orange-600/30 transition-transform hover:scale-105 active:scale-95"
      >
        {initial}
      </button>

      {/* Full-frame overlay — portalled so it anchors to the app frame,
          not to the header (whose backdrop-blur is its containing block).
          Falls back to inline rendering if the frame element is missing. */}
      {frameEl ? createPortal(overlay, frameEl) : overlay}
    </>
  );
}
