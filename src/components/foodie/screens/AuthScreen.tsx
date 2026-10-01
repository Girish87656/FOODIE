"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Eye, EyeOff, Loader2, Mail, MailCheck, User } from "lucide-react";
import { toast } from "sonner";
import { Logo } from "../Logo";
import { useFoodieStore } from "@/lib/foodie/store";
import { needsOnboarding, useAuthStore } from "@/lib/foodie/authStore";
import { cn } from "@/lib/utils";

type Mode = "login" | "signup";

/**
 * Screen 2 — Login / Sign up (real Supabase Auth).
 * Same UI and validation as the original mock; the submit now talks to
 * Supabase Auth. Failures are shown as short friendly messages (never raw
 * technical errors), email-confirmation signups land on a dedicated
 * "Check your email" state instead of pretending to be logged in, and a
 * missing Supabase configuration shows an explicit setup error — there is
 * no demo/fake authentication fallback.
 */
export function AuthScreen() {
  const go = useFoodieStore((s) => s.go);
  const setUserName = useFoodieStore((s) => s.setUserName);
  const authConfigError = useAuthStore((s) => s.configError);
  const [mode, setMode] = useState<Mode>("signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [checkEmail, setCheckEmail] = useState(false);

  const valid = email.includes("@") && password.length >= 6 && (mode === "login" || name.trim().length >= 2);

  function switchMode(next: Mode) {
    setMode(next);
    setServerError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid || submitting) return;
    setSubmitting(true);
    setServerError(null);

    if (mode === "signup") {
      const res = await useAuthStore
        .getState()
        .signUp(email.trim(), password, name.trim());
      setSubmitting(false);
      if (!res.ok) {
        setServerError(res.error ?? "Something went wrong. Please try again.");
        return;
      }
      if (res.needsConfirmation) {
        // Account created, email confirmation pending — no session yet.
        setCheckEmail(true);
        return;
      }
      setUserName(name.trim().split(" ")[0]);
      toast.success(`Welcome aboard, ${name.trim().split(" ")[0]}! 🎉`, {
        description: "Let's personalize your foodie experience.",
      });
      go("onboarding-context");
    } else {
      const res = await useAuthStore.getState().signIn(email.trim(), password);
      setSubmitting(false);
      if (!res.ok) {
        setServerError(res.error ?? "Something went wrong. Please try again.");
        return;
      }
      // Profile name is synced from the real session by the auth store;
      // keep the original email-derived fallback if it's still empty.
      if (!useFoodieStore.getState().userName) {
        const fallbackName = email.split("@")[0].replace(/[._-].*/, "");
        setUserName(fallbackName.charAt(0).toUpperCase() + fallbackName.slice(1));
      }
      toast.success("Welcome back! 👋", { description: "Craving something nice?" });
      // First-time users (confirmed via email but never onboarded) still get
      // the full Alone/Family → Preferences flow; returning users go home.
      if (needsOnboarding(useAuthStore.getState().user)) {
        go("onboarding-context");
      } else {
        go("home");
      }
    }
  }

  /* ------------------------- check your email ------------------------- */
  if (checkEmail) {
    return (
      <div className="flex h-full flex-col overflow-y-auto thin-scrollbar">
        <div className="px-5 pt-4">
          <button
            type="button"
            onClick={() => go("splash")}
            aria-label="Go back"
            className="grid size-10 place-items-center rounded-full border border-border bg-card text-foreground shadow-sm transition-colors hover:bg-accent"
          >
            <ArrowLeft className="size-4.5" />
          </button>
        </div>

        <div className="flex flex-1 flex-col px-6 pb-8">
          <div className="mb-7 mt-4 flex flex-col items-center text-center">
            <Logo size="md" showWordmark={false} />
            <span className="mt-5 grid size-14 place-items-center rounded-2xl bg-emerald-50 text-emerald-600 shadow-sm">
              <MailCheck className="size-7" aria-hidden="true" />
            </span>
            <h1 className="mt-4 text-[22px] font-extrabold tracking-tight text-foreground">
              Check your email
            </h1>
            <p className="mt-2 text-[13.5px] leading-relaxed text-muted-foreground">
              Your account was created! We sent a confirmation link to{" "}
              <span className="font-bold text-foreground">{email}</span>.
            </p>
            <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
              Open that link to activate your account, then come back and log in.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setCheckEmail(false);
              switchMode("login");
            }}
            className="flex h-12 w-full items-center justify-center rounded-xl bg-primary text-[15px] font-bold text-primary-foreground shadow-lg shadow-orange-600/25 transition-all hover:bg-primary/90 active:scale-[0.98]"
          >
            Back to log in
          </button>
          <button
            type="button"
            onClick={() => {
              setCheckEmail(false);
              switchMode("signup");
              setName("");
              setPassword("");
            }}
            className="mt-3 w-full rounded-xl border border-border px-3 py-2.5 text-[13px] font-semibold text-stone-600 transition-colors hover:bg-accent"
          >
            Use a different email
          </button>
        </div>
      </div>
    );
  }

  const inputCls =
    "h-12 w-full rounded-xl border border-border bg-card pl-10 pr-4 text-sm font-medium outline-none transition-all placeholder:text-muted-foreground focus:border-primary/60 focus:ring-4 focus:ring-primary/10";

  return (
    <div className="flex h-full flex-col overflow-y-auto thin-scrollbar">
      <div className="px-5 pt-4">
        <button
          type="button"
          onClick={() => go("splash")}
          aria-label="Go back"
          className="grid size-10 place-items-center rounded-full border border-border bg-card text-foreground shadow-sm transition-colors hover:bg-accent"
        >
          <ArrowLeft className="size-4.5" />
        </button>
      </div>

      <div className="flex flex-1 flex-col px-6 pb-8">
        <div className="mb-7 mt-4 flex flex-col items-center text-center">
          <Logo size="md" showWordmark={false} />
          <h1 className="mt-3 text-[22px] font-extrabold tracking-tight text-foreground">
            {mode === "signup" ? "Create your account" : "Welcome back"}
          </h1>
          <p className="mt-1 text-[13.5px] text-muted-foreground">
            {mode === "signup"
              ? "Find your next favorite food spot"
              : "Log in to continue your food journey"}
          </p>
        </div>

        {/* mode switch */}
        <div
          className="mb-6 grid grid-cols-2 rounded-xl bg-stone-100 p-1"
          role="tablist"
          aria-label="Authentication mode"
        >
          {(["signup", "login"] as const).map((m) => (
            <button
              key={m}
              type="button"
              role="tab"
              aria-selected={mode === m}
              onClick={() => switchMode(m)}
              className={cn(
                "relative h-9 rounded-lg text-[13.5px] font-bold transition-all",
                mode === m ? "bg-white text-primary shadow-sm" : "text-stone-500 hover:text-stone-700"
              )}
            >
              {m === "signup" ? "Sign Up" : "Log In"}
            </button>
          ))}
        </div>

        {authConfigError && (
          <p
            role="alert"
            aria-live="assertive"
            className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-[12.5px] font-semibold leading-snug text-amber-800"
          >
            {authConfigError}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === "signup" && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              className="relative"
            >
              <User className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                autoComplete="name"
                aria-label="Full name"
                className={inputCls}
                required
              />
            </motion.div>
          )}

          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              autoComplete="email"
              aria-label="Email address"
              className={inputCls}
              required
            />
          </div>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password (min 6 characters)"
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              aria-label="Password"
              minLength={6}
              className={cn(inputCls, "pr-11")}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>

          {serverError && (
            <p
              role="alert"
              className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-[12.5px] font-semibold leading-snug text-rose-700"
            >
              {serverError}
            </p>
          )}

          <button
            type="submit"
            disabled={!valid || submitting}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-[15px] font-bold text-primary-foreground shadow-lg shadow-orange-600/25 transition-all hover:bg-primary/90 active:scale-[0.98] disabled:opacity-40"
          >
            {submitting && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
            {mode === "signup" ? "Create account" : "Log in"}
          </button>
        </form>

        <p className="mt-auto pt-6 text-center text-[12px] leading-relaxed text-muted-foreground">
          By continuing you agree to Foodie&apos;s{" "}
          <span className="font-semibold text-foreground underline underline-offset-2">Terms</span>{" "}
          &amp;{" "}
          <span className="font-semibold text-foreground underline underline-offset-2">
            Privacy Policy
          </span>
          . This creates a real account with your email — used for sign-in only.
        </p>
      </div>
    </div>
  );
}
