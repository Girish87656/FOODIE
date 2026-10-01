/**
 * Foodie AI Assistant — LLM access layer (SERVER ONLY).
 *
 * Wraps the already-installed `z-ai-web-dev-sdk` (its contract is an
 * OpenAI-style `chat.completions.create({ messages })` returning a JSON
 * body with `choices[0].message.content`). The SDK resolves its own config
 * (baseUrl + key) from the environment's `.z-ai-config` file — no
 * credentials ever appear in this codebase, in responses, or in any client
 * bundle: this module is imported only by API-route code under
 * `src/app/api/assistant/` and `src/lib/foodie/assistant/`.
 *
 * Nothing here knows about restaurants — callers pass fully-built messages.
 */

import ZAI from "z-ai-web-dev-sdk";
import type { ChatMessage } from "z-ai-web-dev-sdk";

/** Hard cap per LLM call — the assistant degrades to honest fallbacks on timeout. */
const LLM_TIMEOUT_MS = 30_000;

/** Max characters of raw model output we accept (defensive cap). */
const LLM_OUTPUT_MAX_CHARS = 4000;

/**
 * Lazily-created singleton client. `ZAI.create()` reads config from disk;
 * caching the promise avoids re-reading it on every request while keeping
 * init lazy (never executed at module import / build time).
 */
let clientPromise: Promise<ZAI> | null = null;

async function getClient(): Promise<ZAI> {
  if (!clientPromise) {
    clientPromise = ZAI.create();
  }
  return clientPromise;
}

function withTimeout<T>(task: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`${label} timed out after ${ms}ms`));
    }, ms);
    task.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      }
    );
  });
}

/**
 * Pull the assistant's text out of an OpenAI-shaped completion response.
 * The SDK types the response as `any`, so every step is defensive.
 */
function extractContent(raw: unknown): string | null {
  if (raw == null || typeof raw !== "object") return null;
  const choices = (raw as { choices?: unknown }).choices;
  if (!Array.isArray(choices) || choices.length === 0) return null;
  const message = (choices[0] as { message?: unknown }).message;
  if (message == null || typeof message !== "object") return null;
  const content = (message as { content?: unknown }).content;
  if (typeof content !== "string") return null;
  return content;
}

/**
 * One non-streaming chat completion. Resolves with the model's text or
 * throws (timeout / transport / unexpected shape) — callers own the
 * honest fallback behaviour.
 */
export async function chatText(
  messages: ChatMessage[],
  label: string,
  timeoutMs: number = LLM_TIMEOUT_MS
): Promise<string> {
  const client = await getClient();
  const response = await withTimeout(
    client.chat.completions.create({
      messages,
      // thinking stays disabled (SDK default) — Phase 1 wants fast, cheap calls
      thinking: { type: "disabled" },
    }),
    timeoutMs,
    label
  );
  const text = extractContent(response);
  if (!text) throw new Error(`${label} returned an unexpected response shape`);
  if (text.length > LLM_OUTPUT_MAX_CHARS) {
    return text.slice(0, LLM_OUTPUT_MAX_CHARS);
  }
  return text;
}
