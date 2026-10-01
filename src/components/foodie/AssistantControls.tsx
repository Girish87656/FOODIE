"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Info, Loader2, Send, Sparkles, X } from "lucide-react";
import { useFoodieStore } from "@/lib/foodie/store";
import { useLocationStore } from "@/lib/foodie/locationStore";
import { GITAM_TEST_LOCATION } from "@/lib/foodie/location";
import type { EatContext } from "@/lib/foodie/types";
import type {
  AssistantChatMessage,
  AssistantContext,
  AssistantResponse,
} from "@/lib/foodie/assistant/types";
import { ListRow } from "./PlaceCards";
import { DemoDataBanner } from "./DemoDataBanner";
import { cn } from "@/lib/utils";

/**
 * AssistantControls — the Foodie AI entry point on Home.
 *
 * A floating "Foodie AI" button opens a bottom sheet (same visual language
 * and #foodie-app-frame portal pattern as the account/location sheets):
 *   - suggestion chips tuned to the CURRENT Food Mode,
 *   - a chat transcript kept for THIS open sheet only (never persisted),
 *   - real Place rows rendered with the existing ListRow cards — tapping one
 *     opens the existing restaurant detail screen.
 *
 * Sending: POST /api/assistant/chat with { message, context }. The context
 * is built at SEND time from the EXISTING stores (Food Mode, location when
 * genuinely available, onboarding preferences) — no new store, no
 * conversation persistence, no client-side AI. While waiting the Send
 * button is disabled and a "Thinking..." bubble shows; on any failure the
 * transcript shows an honest error message — never a fabricated answer.
 */

/** Example prompts per Food Mode — the first chip is mode-specific. */
const MODE_SUGGESTIONS: Record<EatContext, string> = {
  Alone: "Find something quick near me",
  Family: "Suggest a family-friendly place",
  Partner: "Find a nice place for two",
  Friends: "Where can we get biryani?",
  Travelling: "What should I try around here?",
};

const GENERIC_SUGGESTIONS = ["Find something cheap near me", "What can I eat near me?"];

/** Honest failure message — never a fabricated answer. */
const CONNECT_ERROR = "Sorry, I couldn't connect to Foodie AI right now.";

/** Honest one-line summary of the context sent with messages. */
function locationSummary(source: string, areaLabel: string | null): string {
  if (source === "browser") return areaLabel ?? "your current location";
  if (source === "manual") return `${areaLabel ?? "selected area"} (manual pick)`;
  if (source === "test") return `${GITAM_TEST_LOCATION.label} (development test origin)`;
  return "location not shared";
}

export function AssistantControls() {
  const eatContext = useFoodieStore((s) => s.eatContext);
  const openPlace = useFoodieStore((s) => s.openPlace);
  const locSource = useLocationStore((s) => s.source);
  const locAreaLabel = useLocationStore((s) => s.areaLabel);

  const [open, setOpen] = useState(false);
  const [frameEl, setFrameEl] = useState<HTMLElement | null>(null);
  const [messages, setMessages] = useState<AssistantChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  function closeSheet() {
    setOpen(false);
  }

  // Escape closes the sheet (same behaviour as the other sheets)
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeSheet();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Keep the newest message visible while the transcript grows.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, sending]);

  /** Opens a FRESH session — history belongs to the current open sheet only. */
  function openSheet() {
    setFrameEl((el) => el ?? document.getElementById("foodie-app-frame"));
    setMessages([]);
    setInput("");
    setOpen(true);
  }

  /**
   * Context snapshot taken at SEND time from the EXISTING stores — no new
   * global store, no duplication of Food Mode state, nothing persisted.
   * The prototype origin is deliberately excluded: it's Foodie's browsing
   * fallback, not a user location, so location is only sent when a real
   * browser fix, a manual pick or the labelled test origin is active.
   */
  function buildAssistantContext(): AssistantContext {
    const foodie = useFoodieStore.getState();
    const loc = useLocationStore.getState();
    const origin =
      loc.source === "browser" || loc.source === "manual" || loc.source === "test"
        ? { lat: loc.origin.lat, lng: loc.origin.lng, source: loc.source, areaLabel: loc.areaLabel }
        : null;
    return {
      foodMode: foodie.eatContext,
      origin,
      preferences: [...foodie.preferences],
    };
  }

  /** One message → one POST /api/assistant/chat → one grounded reply. */
  async function send(rawText: string) {
    const text = rawText.trim();
    if (!text || sending) return;

    // Snapshot the context BEFORE the optimistic user bubble (send-time read).
    const context = buildAssistantContext();
    setMessages((m) => [...m, { role: "user", text }]);
    setInput("");
    setSending(true);

    try {
      const res = await fetch("/api/assistant/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, context }),
      });
      if (!res.ok) throw new Error("Foodie AI request failed");
      const data = (await res.json()) as AssistantResponse;
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          text: data.reply,
          places: data.places,
          mode: data.mode,
          notice: data.notice,
        },
      ]);
    } catch {
      // Never fabricate an answer on failure — show the honest error.
      setMessages((m) => [
        ...m,
        { role: "assistant", isError: true, text: CONNECT_ERROR },
      ]);
    } finally {
      setSending(false);
    }
  }

  /** Card tap → the EXISTING detail screen (no second detail implementation). */
  function handleSelectPlace(id: string) {
    closeSheet();
    openPlace(id);
  }

  const suggestions = [
    ...(eatContext ? [MODE_SUGGESTIONS[eatContext]] : []),
    ...GENERIC_SUGGESTIONS,
  ];

  const latestMode = [...messages].reverse().find((m) => m.role === "assistant")?.mode;
  const latestNotice = [...messages].reverse().find((m) => m.role === "assistant")?.notice;

  const overlay = (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="assistant-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeSheet}
            className="absolute inset-0 z-30 bg-stone-950/45 backdrop-blur-[2px]"
            aria-hidden="true"
          />
          <motion.div
            key="assistant-sheet"
            role="dialog"
            aria-modal="true"
            aria-label="Foodie AI assistant"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="absolute inset-x-0 bottom-0 z-40 flex max-h-[85%] flex-col rounded-t-3xl border-t border-border/60 bg-background shadow-2xl"
            style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
          >
            <div className="mx-auto mb-3 mt-4 h-1.5 w-10 shrink-0 rounded-full bg-stone-200" aria-hidden="true" />

            {/* header */}
            <div className="flex shrink-0 items-start justify-between gap-3 px-5">
              <div className="min-w-0">
                <h2 className="flex items-center gap-2 text-[17px] font-extrabold tracking-tight text-foreground">
                  <span className="foodie-gradient grid size-7 place-items-center rounded-full text-white shadow-sm shadow-orange-600/30">
                    <Sparkles className="size-4" aria-hidden="true" />
                  </span>
                  Foodie AI
                </h2>
                <p className="mt-1 text-[12.5px] text-muted-foreground">Ask me where to eat.</p>
                {/* honest context line — Food Mode the assistant will read */}
                <p className="mt-1 truncate text-[11px] text-stone-400">
                  {eatContext ? `${eatContext} mode · ` : ""}
                  {`📍 ${locationSummary(locSource, locAreaLabel)}`}
                </p>
              </div>
              <button
                type="button"
                onClick={closeSheet}
                aria-label="Close Foodie AI"
                className="grid size-8 shrink-0 place-items-center rounded-full border border-border bg-card text-stone-500 transition-colors hover:bg-accent"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* transcript */}
            <div
              ref={scrollRef}
              className="thin-scrollbar mt-3 min-h-0 flex-1 space-y-3 overflow-y-auto px-5 pb-2"
              aria-live="polite"
            >
              {messages.length === 0 && !sending && (
                <div className="pt-2">
                  <p className="text-[13px] leading-relaxed text-muted-foreground">
                    Tell me what you&apos;re craving, who you&apos;re eating with, or your budget —
                    I&apos;ll search Foodie&apos;s real place data for you.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2" aria-label="Suggested questions">
                    {suggestions.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => void send(s)}
                        className="rounded-full border border-primary/30 bg-orange-50 px-3.5 py-2 text-[12.5px] font-semibold text-foreground transition-all hover:border-primary/60 hover:bg-orange-100 active:scale-95"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {latestMode === "demo" && (
                <div className="pt-1">
                  <DemoDataBanner notice={latestNotice} />
                </div>
              )}

              {messages.map((msg, i) =>
                msg.role === "user" ? (
                  <div key={i} className="flex justify-end">
                    <p className="max-w-[85%] rounded-2xl rounded-br-md foodie-gradient px-3.5 py-2.5 text-[13.5px] font-medium leading-snug text-white shadow-sm shadow-orange-600/20">
                      {msg.text}
                    </p>
                  </div>
                ) : (
                  <div key={i} className="flex justify-start">
                    <div
                      className={cn(
                        "max-w-[92%] space-y-2.5 rounded-2xl rounded-bl-md border border-border/60 bg-card px-3.5 py-3",
                        msg.isError && "border-rose-200 bg-rose-50/60"
                      )}
                    >
                      <p className="whitespace-pre-wrap text-[13.5px] leading-relaxed text-foreground">
                        {msg.text}
                      </p>
                      {!msg.isError && msg.notice && msg.mode !== "demo" && (
                        <p className="flex items-start gap-1.5 text-[11px] leading-snug text-stone-500">
                          <Info className="mt-0.5 size-3 shrink-0" aria-hidden="true" />
                          {msg.notice}
                        </p>
                      )}
                      {msg.places && msg.places.length > 0 && (
                        <div className="space-y-2 pt-0.5">
                          {msg.places.map((place) => (
                            <ListRow
                              key={place.id}
                              place={place}
                              onSelect={handleSelectPlace}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )
              )}

              {sending && (
                <div className="flex justify-start" aria-label="Foodie AI is thinking">
                  <div className="flex items-center gap-2 rounded-2xl rounded-bl-md border border-border/60 bg-card px-3.5 py-3">
                    <Loader2 className="size-4 animate-spin text-primary" aria-hidden="true" />
                    <span className="text-[12.5px] text-muted-foreground">Thinking...</span>
                  </div>
                </div>
              )}
            </div>

            {/* input */}
            <form
              className="flex shrink-0 items-center gap-2 px-5 pb-1 pt-2"
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="e.g. biryani under ₹300 near me"
                maxLength={500}
                enterKeyHint="send"
                aria-label="Ask Foodie AI"
                className="h-11 min-w-0 flex-1 rounded-full border border-border bg-card px-4 text-[13.5px] text-foreground placeholder:text-stone-400 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <button
                type="submit"
                disabled={sending || input.trim().length === 0}
                aria-label="Send message"
                className="foodie-gradient grid size-11 shrink-0 place-items-center rounded-full text-white shadow-md shadow-orange-600/30 transition-all hover:brightness-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {sending ? (
                  <Loader2 className="size-4.5 animate-spin" aria-hidden="true" />
                ) : (
                  <Send className="size-4.5" aria-hidden="true" />
                )}
              </button>
            </form>

            <p className="shrink-0 px-5 pt-1.5 text-center text-[10.5px] leading-snug text-stone-400">
              Answers use only Foodie&apos;s own place data — always check the place page for details.
            </p>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return (
    <>
      {/* Floating AI button — bottom-right of the Home screen */}
      <button
        type="button"
        onClick={openSheet}
        aria-haspopup="dialog"
        aria-label="Ask Foodie AI where to eat"
        className="foodie-gradient absolute bottom-5 right-5 z-20 flex size-14 items-center justify-center rounded-full text-white shadow-xl shadow-orange-600/40 transition-transform hover:scale-105 active:scale-95"
      >
        <Sparkles className="size-6" aria-hidden="true" />
        <span className="absolute -bottom-0.5 -right-0.5 grid size-5 place-items-center rounded-full bg-white text-[9px] font-extrabold text-primary shadow-sm">
          AI
        </span>
      </button>

      {/* Full-frame overlay — portalled so it anchors to the app frame, not
          to the header (whose backdrop-blur is its containing block). */}
      {frameEl ? createPortal(overlay, frameEl) : overlay}
    </>
  );
}
