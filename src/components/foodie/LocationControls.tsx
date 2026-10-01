"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Building2,
  ChevronRight,
  CloudOff,
  FlaskConical,
  Loader2,
  LocateFixed,
  MapPin,
  MonitorX,
  ShieldAlert,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  GITAM_TEST_COORDS,
  GITAM_TEST_LOCATION,
  MANUAL_CITIES,
  PROTOTYPE_CITY,
  formatLatLng,
} from "@/lib/foodie/location";
import { useLocationStore, type LocationStatus } from "@/lib/foodie/locationStore";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Location prompt banner — the clear "📍 Use my current location" CTA */
/* shown on Home until a real fix is acquired or a city is picked.     */
/* ------------------------------------------------------------------ */
export function LocationPromptBanner({ onOpen }: { onOpen: () => void }) {
  const status = useLocationStore((s) => s.status);
  const source = useLocationStore((s) => s.source);
  if (source === "manual" || source === "test" || status === "granted") return null;

  const copy: Record<string, { title: string; sub: string }> = {
    idle: {
      title: "Use my current location",
      sub: "Get real distances from where you actually are",
    },
    locating: {
      title: "Finding you…",
      sub: "Allow the browser prompt if asked",
    },
    denied: {
      title: "Location permission required",
      sub: "Tap to retry, review options or pick a city",
    },
    error: {
      title: "Location unavailable — tap to retry",
      sub: "You can also pick a city manually below",
    },
    unsupported: {
      title: "Location not available here",
      sub: "Pick a city manually to keep exploring",
    },
  };
  const c = copy[status] ?? copy.idle;

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onOpen}
      aria-haspopup="dialog"
      className="flex w-full items-center gap-3 rounded-2xl border border-primary/30 bg-orange-50/80 px-4 py-3 text-left shadow-sm transition-all hover:border-primary/50 hover:bg-orange-50 focus-visible:ring-2 focus-visible:ring-primary active:scale-[0.99]"
    >
      <span className="foodie-gradient grid size-10 shrink-0 place-items-center rounded-xl text-white shadow-md shadow-orange-600/30">
        <LocateFixed className="size-5" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[13.5px] font-bold text-foreground">{c.title}</span>
        <span className="block truncate text-[12px] text-muted-foreground">{c.sub}</span>
      </span>
      <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
    </motion.button>
  );
}

/* ------------------------------------------------------------------ */
/* Status card content per state                                       */
/* ------------------------------------------------------------------ */
function StatusCard() {
  const status = useLocationStore((s) => s.status);
  const source = useLocationStore((s) => s.source);
  const coords = useLocationStore((s) => s.coords);
  const accuracyMeters = useLocationStore((s) => s.accuracyMeters);
  const areaLabel = useLocationStore((s) => s.areaLabel);
  const resolvingArea = useLocationStore((s) => s.resolvingArea);
  const errorMessage = useLocationStore((s) => s.errorMessage);

  const styles = {
    info: "border-border bg-card",
    good: "border-emerald-200 bg-emerald-50",
    warn: "border-amber-200 bg-amber-50",
    bad: "border-rose-200 bg-rose-50",
  } as const;

  type Tone = keyof typeof styles;

  let tone: Tone = "info";
  let icon = <Building2 className="size-5" aria-hidden="true" />;
  let iconWrap = "bg-stone-100 text-stone-500";
  let title = "Prototype origin";
  let desc =
    `You're browsing Foodie's prototype corridor around ${PROTOTYPE_CITY.area}, ${PROTOTYPE_CITY.city}. Share your location for real, live distances.`;

  if (status === "locating") {
    tone = "info";
    iconWrap = "bg-orange-100 text-primary";
    icon = <Loader2 className="size-5 animate-spin" aria-hidden="true" />;
    title = "Finding you…";
    desc = "Requesting a GPS fix from your browser — choose “Allow” if prompted.";
  } else if (source === "test") {
    tone = "warn";
    iconWrap = "bg-amber-100 text-amber-600";
    icon = <FlaskConical className="size-5" aria-hidden="true" />;
    title = GITAM_TEST_LOCATION.label;
    desc =
      "Development testing origin pinned to the GITAM campus corridor reference. Distances are measured from here — not from your real position.";
  } else if (status === "granted" && source === "browser") {
    tone = "good";
    iconWrap = "bg-emerald-100 text-emerald-600";
    icon = <MapPin className="size-5" aria-hidden="true" />;
    title = "Using your current location";
    desc = resolvingArea
      ? "Resolving your area name…"
      : (areaLabel ?? "Location locked in") +
        (accuracyMeters != null ? ` · ±${Math.round(accuracyMeters)} m accuracy` : "");
  } else if (status === "denied") {
    tone = "warn";
    iconWrap = "bg-amber-100 text-amber-600";
    icon = <ShieldAlert className="size-5" aria-hidden="true" />;
    title = "Location permission required";
    desc =
      (errorMessage ?? "") +
      " If Foodie is inside a preview frame, open it in a new tab and retry — or pick a city below.";
  } else if (status === "error") {
    tone = "bad";
    iconWrap = "bg-rose-100 text-rose-600";
    icon = <CloudOff className="size-5" aria-hidden="true" />;
    title = "Couldn't get your location";
    desc = errorMessage ?? "Something went wrong. Please try again.";
  } else if (status === "unsupported") {
    tone = "info";
    iconWrap = "bg-stone-100 text-stone-500";
    icon = <MonitorX className="size-5" aria-hidden="true" />;
    title = "Location not available here";
    desc = errorMessage ?? "This browser/context can't provide location.";
  }

  return (
    <div className={cn("flex items-start gap-3 rounded-2xl border p-4", styles[tone])} role="status">
      <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl", iconWrap)}>
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-[14px] font-bold text-foreground">{title}</p>
        <p className="mt-0.5 text-[12.5px] leading-snug text-stone-600">{desc}</p>
        {status === "granted" && coords && (
          <p className="mt-1.5 font-mono text-[11px] text-stone-500">
            {formatLatLng(coords)}
          </p>
        )}
        {source === "test" && (
          <p className="mt-1.5 font-mono text-[11px] text-stone-500">
            {formatLatLng(GITAM_TEST_COORDS)}
          </p>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Location sheet — status, GPS button, manual city fallback           */
/* ------------------------------------------------------------------ */
export function LocationSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const status = useLocationStore((s) => s.status);
  const source = useLocationStore((s) => s.source);
  const manualCityId = useLocationStore((s) => s.manualCityId);
  const requestLocation = useLocationStore((s) => s.requestLocation);
  const selectCity = useLocationStore((s) => s.selectCity);
  const selectGitamTestArea = useLocationStore((s) => s.selectGitamTestArea);
  const resetToPrototype = useLocationStore((s) => s.usePrototypeCity);

  // Escape closes the sheet
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  async function handleUseGps() {
    await requestLocation();
    const st = useLocationStore.getState();
    if (st.status === "granted" && st.source === "browser") {
      toast.success("Using your current location", {
        description: "Distances are now measured from where you actually are.",
      });
      onClose();
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="location-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="absolute inset-0 z-30 bg-stone-950/45 backdrop-blur-[2px]"
            aria-hidden="true"
          />
          <motion.div
            key="location-sheet"
            role="dialog"
            aria-modal="true"
            aria-label="Your location"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="thin-scrollbar absolute inset-x-0 bottom-0 z-40 max-h-[88%] overflow-y-auto rounded-t-3xl border-t border-border/60 bg-background p-5 shadow-2xl"
            style={{ paddingBottom: "max(1.25rem, env(safe-area-inset-bottom))" }}
          >
            <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-stone-200" aria-hidden="true" />

            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-[17px] font-extrabold tracking-tight text-foreground">
                Your location
              </h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close location panel"
                className="grid size-8 place-items-center rounded-full border border-border bg-card text-stone-500 transition-colors hover:bg-accent"
              >
                <X className="size-4" />
              </button>
            </div>

            <StatusCard />

            {status !== "unsupported" && (
              <button
                type="button"
                onClick={handleUseGps}
                disabled={status === "locating"}
                className="foodie-gradient mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-2xl text-[15px] font-bold text-white shadow-lg shadow-orange-600/30 transition-all hover:opacity-95 active:scale-[0.98] disabled:cursor-wait disabled:opacity-70"
              >
                {status === "locating" ? (
                  <Loader2 className="size-4.5 animate-spin" aria-hidden="true" />
                ) : (
                  <LocateFixed className="size-4.5" aria-hidden="true" />
                )}
                {status === "locating" ? "Finding you…" : "Use my current location"}
              </button>
            )}

            <div className="my-4 flex items-center gap-3" aria-hidden="true">
              <span className="h-px flex-1 bg-border" />
              <span className="text-[11px] font-bold uppercase tracking-widest text-stone-400">
                or
              </span>
              <span className="h-px flex-1 bg-border" />
            </div>

            <p className="mb-2 text-[13px] font-bold text-foreground">Pick a city manually</p>
            <div className="grid grid-cols-2 gap-2">
              {MANUAL_CITIES.map((city) => {
                const active = source === "manual" && manualCityId === city.id;
                return (
                  <button
                    key={city.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => {
                      selectCity(city.id);
                      toast.success(`Showing places near ${city.label}`, {
                        description: "Distances recalculated from the selected city.",
                      });
                      onClose();
                    }}
                    className={cn(
                      "flex items-center gap-2 rounded-xl border px-3 py-2.5 text-[13px] font-semibold transition-all active:scale-95",
                      active
                        ? "border-primary bg-orange-50 text-primary shadow-sm"
                        : "border-border bg-card text-foreground hover:border-primary/40 hover:bg-accent"
                    )}
                  >
                    <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
                    {city.label}
                  </button>
                );
              })}
            </div>

            {(source === "manual" || source === "test") && (
              <button
                type="button"
                onClick={() => {
                  resetToPrototype();
                  toast.info("Back to Foodie's prototype city", {
                    description: `Distances measured from ${PROTOTYPE_CITY.area}, ${PROTOTYPE_CITY.city}.`,
                  });
                }}
                className="mt-3 w-full rounded-xl border border-dashed border-border px-3 py-2.5 text-[12.5px] font-semibold text-stone-600 transition-colors hover:bg-accent"
              >
                ↩ Back to Foodie&apos;s prototype city
              </button>
            )}

            {/* development testing — clearly separated, never styled like a real fix */}
            <div className="mt-5 rounded-2xl border border-dashed border-amber-300 bg-amber-50/70 p-3">
              <div className="mb-2 flex items-center gap-1.5">
                <FlaskConical className="size-3.5 text-amber-600" aria-hidden="true" />
                <p className="text-[10.5px] font-extrabold uppercase tracking-widest text-amber-700">
                  Development
                </p>
              </div>
              <button
                type="button"
                aria-pressed={source === "test"}
                onClick={() => {
                  selectGitamTestArea();
                  toast.warning(`Using ${GITAM_TEST_LOCATION.label}`, {
                    description:
                      "Distances are measured from the GITAM campus test point — not your real position.",
                  });
                  onClose();
                }}
                className={cn(
                  "flex w-full items-center gap-2 rounded-xl border px-3 py-2.5 text-[13px] font-semibold transition-all active:scale-[0.98]",
                  source === "test"
                    ? "border-amber-400 bg-amber-100 text-amber-900 shadow-sm"
                    : "border-amber-300/80 bg-card text-foreground hover:bg-amber-50"
                )}
              >
                <FlaskConical className="size-3.5 shrink-0 text-amber-600" aria-hidden="true" />
                <span className="min-w-0 flex-1 text-left">{GITAM_TEST_LOCATION.optionLabel}</span>
                <span className="shrink-0 rounded-full bg-amber-200/90 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-amber-900">
                  TEST LOCATION — GITAM
                </span>
              </button>
              <p className="mt-2 text-[11px] leading-snug text-amber-800/80">
                Testing tool for the GITAM pilot area. Restaurants without verified coordinates
                show &ldquo;Location pending verification&rdquo; — never a guessed distance.
              </p>
            </div>

            <p className="mt-4 text-center text-[11px] leading-relaxed text-stone-400">
              Prototype places are centered on the pilot corridor (GITAM University → Doddaballapura). Distances are always
              honestly calculated (Haversine) from your chosen origin — real restaurant coordinates
              arrive with the places API.
            </p>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export type { LocationStatus };
