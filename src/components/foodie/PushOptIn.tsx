"use client";

/**
 * PushOptIn — the notifications entry point (Home header bell).
 *
 * SECURITY & COURTESY CONTRACT (mirrors src/lib/foodie/push.ts):
 *   * The dialog opens ONLY on the user's click. Notification PERMISSION is
 *     requested ONLY from the explicit "Enable notifications" click inside
 *     it — never on page load, never from an effect.
 *   * Every state is honest: unsupported browser, server push not
 *     configured yet, needs sign-in, permission denied (with a recovery
 *     hint), ready, subscribed (test + turn-off), or a friendly error.
 *   * "Send a test notification" posts to /api/push/test which can only
 *     reach the CALLING user's own subscriptions — nothing is ever sent
 *     unsolicited, and delivery is NOT claimed to work until the owner has
 *     configured VAPID credentials AND verified it end-to-end.
 *   * Unsubscribe removes both the browser subscription and the stored row.
 */

import { useEffect, useState } from "react";
import { Bell, BellOff, Loader2, ShieldCheck, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/foodie/authStore";
import {
  disablePush,
  enablePush,
  fetchPushConfig,
  isSubscribed,
  pushSupport,
  type PushState,
} from "@/lib/foodie/push";

type DialogState =
  | { phase: "loading" }
  | { phase: "unsupported"; reason: string }
  | { phase: "not-configured" }
  | { phase: "needs-login" }
  | { phase: "denied" }
  | { phase: "ready" }
  | { phase: "subscribed" }
  | { phase: "error"; message: string };

/**
 * Pure evaluation of the CURRENT push situation — returns the dialog phase
 * instead of setting state, so the opening effect can use the .then()
 * callback pattern (no setState synchronously reachable from an effect).
 * Reads support, auth, server config and the browser's own subscription;
 * requests NO permission.
 */
async function evaluatePushPhase(): Promise<DialogState> {
  const config = await fetchPushConfig();
  const support = pushSupport();
  if (!support.supported) {
    return { phase: "unsupported", reason: support.reason ?? "This browser doesn't support web push." };
  }
  if (!useAuthStore.getState().user) {
    return { phase: "needs-login" };
  }
  if (!config.configured) {
    return { phase: "not-configured" };
  }
  const subscribed = await isSubscribed();
  return subscribed ? { phase: "subscribed" } : { phase: "ready" };
}

export function PushNotificationsButton({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Notifications settings"
        aria-haspopup="dialog"
        className={cn(
          "relative grid size-9 shrink-0 place-items-center rounded-full border border-border bg-card shadow-sm transition-colors hover:bg-accent",
          className
        )}
      >
        <Bell className="size-4" aria-hidden="true" />
      </button>
      {open && <PushOptInDialog onClose={() => setOpen(false)} />}
    </>
  );
}

function PushOptInDialog({ onClose }: { onClose: () => void }) {
  const [dialog, setDialog] = useState<DialogState>({ phase: "loading" });
  const [busy, setBusy] = useState<null | "enable" | "test" | "disable">(null);
  const user = useAuthStore((s) => s.user);

  // Evaluate the CURRENT state when the dialog opens (user gesture — no
  // permission prompt happens here; this only reads support/auth/config/
  // subscription). setState happens ONLY inside the .then() callbacks —
  // never synchronously within the effect body.
  useEffect(() => {
    let cancelled = false;
    evaluatePushPhase()
      .then((phase) => {
        if (!cancelled) setDialog(phase);
      })
      .catch(() => {
        if (!cancelled) setDialog({ phase: "error", message: "Couldn't check notification status." });
      });
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  // Escape closes; simple focus handling for the dialog surface.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const onEnable = async () => {
    setBusy("enable");
    const state: PushState = await enablePush();
    setBusy(null);
    switch (state.kind) {
      case "subscribed":
        setDialog({ phase: "subscribed" });
        toast.success("Notifications are on for this device");
        break;
      case "permission-denied":
        setDialog({ phase: "denied" });
        break;
      case "needs-login":
        setDialog({ phase: "needs-login" });
        break;
      case "not-configured":
        setDialog({ phase: "not-configured" });
        break;
      case "unsupported":
        setDialog({ phase: "unsupported", reason: state.reason });
        break;
      default:
        setDialog({ phase: "error", message: state.kind === "error" ? state.message : "Couldn't enable notifications." });
    }
  };

  const onTest = async () => {
    setBusy("test");
    try {
      const token = useAuthStore.getState().session?.access_token;
      const res = await fetch("/api/push/test", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      const data = (await res.json().catch(() => ({}))) as { sent?: number; error?: string; message?: string };
      if (res.ok && (data.sent ?? 0) > 0) {
        toast.success("Test notification sent — check your device");
      } else if (res.status === 404) {
        toast.error("No active subscription on this device — enable notifications again.");
        // Re-evaluate (setState inside this async callback, not an effect).
        evaluatePushPhase()
          .then((phase) => setDialog(phase))
          .catch(() => setDialog({ phase: "ready" }));
      } else {
        toast.error(data.message ?? data.error ?? "The test notification couldn't be delivered.");
      }
    } catch {
      toast.error("Couldn't reach the notification service.");
    }
    setBusy(null);
  };

  const onDisable = async () => {
    setBusy("disable");
    const state = await disablePush();
    setBusy(null);
    if (state.kind === "ready") {
      setDialog({ phase: "ready" });
      toast.success("Notifications are off for this device");
    } else {
      setDialog({ phase: "error", message: "Couldn't turn notifications off completely — please try again." });
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-end bg-black/40 backdrop-blur-[2px] sm:place-items-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Notifications settings"
        className="w-full max-w-md rounded-t-3xl border border-border/70 bg-card p-5 shadow-2xl sm:rounded-3xl"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="grid size-10 place-items-center rounded-2xl bg-orange-50 text-primary">
              <Bell className="size-5" aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-[16px] font-extrabold leading-tight text-foreground">Notifications</h2>
              <p className="text-[12px] text-muted-foreground">Only from Foodie, only on this device.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close notifications settings"
            className="grid size-8 shrink-0 place-items-center rounded-full border border-border bg-card text-stone-500 transition-colors hover:bg-accent"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-4 min-h-[120px]">
          {dialog.phase === "loading" && (
            <p className="flex items-center gap-2 text-[13px] text-muted-foreground" role="status">
              <Loader2 className="size-4 animate-spin" aria-hidden="true" /> Checking notification support…
            </p>
          )}

          {dialog.phase === "unsupported" && (
            <p className="text-[13px] leading-relaxed text-muted-foreground">
              {dialog.reason} Foodie can&apos;t show push notifications here.
            </p>
          )}

          {dialog.phase === "not-configured" && (
            <p className="text-[13px] leading-relaxed text-muted-foreground">
              Push notifications aren&apos;t set up on the server yet. Nothing is subscribed and nothing
              will be sent — this is honest, not an error on your side.
            </p>
          )}

          {dialog.phase === "needs-login" && (
            <p className="text-[13px] leading-relaxed text-muted-foreground">
              Sign in to turn on notifications — they belong to your account and only this device
              would be subscribed.
            </p>
          )}

          {dialog.phase === "denied" && (
            <div className="text-[13px] leading-relaxed text-muted-foreground">
              <p className="flex items-center gap-1.5 font-semibold text-foreground">
                <BellOff className="size-4" aria-hidden="true" /> Notifications are blocked for this site.
              </p>
              <p className="mt-1.5">
                To turn them on again, allow notifications for Foodie in your browser&apos;s site
                settings, then come back here.
              </p>
            </div>
          )}

          {dialog.phase === "ready" && (
            <p className="text-[13px] leading-relaxed text-muted-foreground">
              Turn on notifications for this device. You choose when — Foodie never asks on its own,
              and you can switch it off here at any time.
            </p>
          )}

          {dialog.phase === "subscribed" && (
            <p className="text-[13px] leading-relaxed text-muted-foreground">
              Notifications are <span className="font-semibold text-emerald-600">on for this device</span>.
              Send yourself a test to confirm delivery, or switch them off below.
            </p>
          )}

          {dialog.phase === "error" && (
            <p className="text-[13px] leading-relaxed text-red-600" role="alert">
              {dialog.message}
            </p>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {(dialog.phase === "ready" || dialog.phase === "error") && (
            <button
              type="button"
              onClick={onEnable}
              disabled={busy !== null}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-[13.5px] font-bold text-white shadow-md shadow-orange-600/25 transition-all hover:bg-primary/90 active:scale-95 disabled:opacity-60"
            >
              {busy === "enable" && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
              Enable notifications
            </button>
          )}
          {dialog.phase === "subscribed" && (
            <>
              <button
                type="button"
                onClick={onTest}
                disabled={busy !== null}
                className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-[13.5px] font-bold text-white shadow-md shadow-orange-600/25 transition-all hover:bg-primary/90 active:scale-95 disabled:opacity-60"
              >
                {busy === "test" && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
                Send a test notification
              </button>
              <button
                type="button"
                onClick={onDisable}
                disabled={busy !== null}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-5 py-2.5 text-[13.5px] font-bold text-foreground transition-colors hover:bg-accent disabled:opacity-60"
              >
                {busy === "disable" && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
                <BellOff className="size-4" aria-hidden="true" />
                Turn off
              </button>
            </>
          )}
        </div>

        <p className="mt-4 flex items-start gap-1.5 text-[11px] leading-snug text-stone-400">
          <ShieldCheck className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
          Your subscription is stored against your own account only (row-level security), this browser
          can unsubscribe at any time, and Foodie never sends notifications you didn&apos;t opt into.
        </p>
      </div>
    </div>
  );
}
