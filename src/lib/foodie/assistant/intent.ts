/**
 * Foodie AI Assistant — intent parsing (SERVER ONLY).
 *
 * Step 1 of the pipeline: turn one natural-language message into a
 * structured `FoodieQuery`. The LLM proposes; Zod disposes:
 *   - the model's raw JSON is parsed defensively (fences stripped, braces
 *     recovered) and validated against a strict schema;
 *   - anything the model cannot state confidently is absent → the
 *     deterministic executor runs a BROAD search instead of inventing a
 *     category/filter;
 *   - any LLM/parse failure collapses to `null` → broad search, honest reply.
 *
 * Also owns the Zod schemas for the API request body (message + context),
 * so untrusted client input is validated in one place.
 */

import { z } from "zod";
import {
  ASSISTANT_MESSAGE_MAX_LENGTH,
  ASSISTANT_MESSAGE_MIN_LENGTH,
  type AssistantContext,
  type FoodieQuery,
} from "./types";
import { INTENT_SYSTEM_PROMPT } from "./prompt";
import { chatText } from "./llm";

/* ------------------------------------------------------------------ */
/* Schemas                                                             */
/* ------------------------------------------------------------------ */

/** The exact 7 pilot place categories (mirrors PLACE_CATEGORIES / DB check). */
const CATEGORY_IDS = [
  "restaurant",
  "hotel",
  "tiffin",
  "cafe",
  "fast_food",
  "street_food",
  "bakery_sweets",
] as const;

const EAT_CONTEXT_IDS = ["Alone", "Family", "Partner", "Friends", "Travelling"] as const;
const PRICE_LEVELS = ["₹", "₹₹", "₹₹₹"] as const;
const LOCATION_SOURCES = ["browser", "manual", "test"] as const;

/**
 * The model's proposed query. `null` in the JSON means "not confidently
 * extractable" and is normalized to absent — never guessed.
 */
const foodieQuerySchema = z.object({
  keywords: z
    .array(z.string().trim().min(1).max(60))
    .max(4)
    .default([]),
  category: z.enum(CATEGORY_IDS).nullable().optional(),
  budget: z.enum(PRICE_LEVELS).nullable().optional(),
  radiusKm: z.number().min(0.5).max(50).nullable().optional(),
  modeHint: z.enum(EAT_CONTEXT_IDS).nullable().optional(),
  preferenceHint: z.boolean().nullable().optional(),
});

/** Client-supplied context — validated, never trusted beyond this shape. */
export const assistantContextSchema = z.object({
  foodMode: z.enum(EAT_CONTEXT_IDS).nullable(),
  origin: z
    .object({
      lat: z.number().finite().min(-90).max(90),
      lng: z.number().finite().min(-180).max(180),
      source: z.enum(LOCATION_SOURCES),
      areaLabel: z.string().trim().max(120).nullable(),
    })
    .nullable(),
  preferences: z.array(z.string().trim().min(1).max(40)).max(20),
  discoveryMode: z.enum(["supabase", "demo"]).optional(),
});

/** POST /api/assistant/chat body. */
export const assistantRequestSchema = z.object({
  message: z.string(),
  context: assistantContextSchema.optional(),
});

/* ------------------------------------------------------------------ */
/* Request parsing                                                     */
/* ------------------------------------------------------------------ */

export interface ParsedAssistantRequest {
  message: string;
  context: AssistantContext;
}

/**
 * Validate the raw request body into `{ message, context }`.
 * Returns a plain error string (client-safe) when the body is malformed.
 */
export function parseAssistantRequest(body: unknown): ParsedAssistantRequest | { error: string } {
  const parsed = assistantRequestSchema.safeParse(body);
  if (!parsed.success) {
    return { error: "Invalid request — expected { message: string, context?: AssistantContext }." };
  }

  const message = parsed.data.message.trim();
  if (message.length < ASSISTANT_MESSAGE_MIN_LENGTH) {
    return { error: "Please type a message first." };
  }
  if (message.length > ASSISTANT_MESSAGE_MAX_LENGTH) {
    return { error: `Message is too long (max ${ASSISTANT_MESSAGE_MAX_LENGTH} characters).` };
  }

  const raw = parsed.data.context;
  const context: AssistantContext = raw
    ? {
        foodMode: raw.foodMode,
        origin: raw.origin,
        preferences: raw.preferences,
        // Informational only — the response mode always comes from the
        // server's own loaders, never from this client-supplied value.
        discoveryMode: raw.discoveryMode,
      }
    : { foodMode: null, origin: null, preferences: [] };

  return { message, context };
}

/* ------------------------------------------------------------------ */
/* LLM-backed extraction                                               */
/* ------------------------------------------------------------------ */

/** Strip markdown fences the model may wrap its JSON in. */
function stripFences(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const inner = fenced ? fenced[1] : text;
  // Last-resort recovery: keep only the outermost brace block.
  const first = inner.indexOf("{");
  const last = inner.lastIndexOf("}");
  return first >= 0 && last > first ? inner.slice(first, last + 1) : inner;
}

/** Normalize a schema-valid raw query into the app's FoodieQuery shape. */
function toFoodieQuery(raw: z.infer<typeof foodieQuerySchema>): FoodieQuery {
  const query: FoodieQuery = { keywords: raw.keywords.slice(0, 4) };
  if (raw.category) query.category = raw.category;
  if (raw.budget) query.budget = raw.budget;
  if (raw.radiusKm != null) query.radiusKm = raw.radiusKm;
  if (raw.modeHint) query.modeHint = raw.modeHint;
  if (raw.preferenceHint === true) query.preferenceHint = true;
  return query;
}

/**
 * Ask the LLM to extract a FoodieQuery from one message.
 *
 * Resolves `null` on ANY failure (timeout, bad JSON, schema mismatch) — the
 * caller then executes a broad search, which is the honest fallback. Never
 * throws.
 */
export async function extractFoodieQuery(
  message: string,
  context: AssistantContext
): Promise<FoodieQuery | null> {
  const contextNote = [
    context.foodMode ? `Food Mode: ${context.foodMode}` : "Food Mode: not set",
    context.origin
      ? `User location: available (${context.origin.source}${context.origin.areaLabel ? ` — ${context.origin.areaLabel}` : ""})`
      : "User location: NOT available",
    context.preferences.length > 0
      ? `Saved onboarding categories: ${context.preferences.join(", ")}`
      : "Saved onboarding categories: none",
  ].join("; ");

  try {
    const raw = await chatText(
      [
        { role: "system", content: INTENT_SYSTEM_PROMPT },
        {
          role: "user",
          content: `Context: ${contextNote}\nUser message: ${message}`,
        },
      ],
      "assistant intent extraction"
    );

    const parsed = foodieQuerySchema.safeParse(JSON.parse(stripFences(raw)));
    if (!parsed.success) return null;
    return toFoodieQuery(parsed.data);
  } catch {
    // Intent extraction is best-effort — broad search keeps the answer honest.
    return null;
  }
}
