/**
 * POST /api/assistant/chat — the Foodie AI Assistant (Phase 1).
 *
 * Pipeline (all server-side; the browser never sees AI credentials):
 *   1. Validate body  { message, context? }            (Zod, untrusted client)
 *   2. LLM extracts a structured FoodieQuery             (Zod-validated; any
 *      failure → broad search, never an invented filter)
 *   3. Deterministic Foodie loaders run the actual search (serverRepository
 *      → Supabase or the clearly-labelled demo set). The user's SAVED
 *      onboarding categories may narrow a GENERIC ask (never an explicit
 *      one, and never when the intent failed); Food Mode never filters —
 *      the data has no companionship attributes to map it to.
 *   4. LLM composes the reply from ONLY the returned Place rows
 *      (any failure → honest deterministic reply; places are still real)
 *   5. Respond { reply, places, mode, notice }
 *
 * The AI NEVER invents restaurants, prices, ratings, distances, opening
 * hours, phone numbers or dishes — every restaurant fact in the response
 * comes from Foodie's existing data layer, and the client renders the real
 * Place rows as cards. No new restaurant API, no direct browser→Supabase
 * queries, no conversation persistence.
 */

import { NextRequest, NextResponse } from "next/server";
import { extractFoodieQuery, parseAssistantRequest } from "@/lib/foodie/assistant/intent";
import { COMPOSE_SYSTEM_PROMPT } from "@/lib/foodie/assistant/prompt";
import {
  executeFoodieQuery,
  serializePlacesForLLM,
  serializeSearchMeta,
} from "@/lib/foodie/assistant/search";
import { chatText } from "@/lib/foodie/assistant/llm";
import { GITAM_TEST_LOCATION } from "@/lib/foodie/location";
import type { AssistantContext } from "@/lib/foodie/assistant/types";

export const dynamic = "force-dynamic";

/** Honest deterministic replies used when the composer LLM is unavailable. */
const FALLBACK_REPLY_WITH_PLACES =
  "Here's what I found in Foodie's data — tap a card below for details.";
const FALLBACK_REPLY_EMPTY =
  "I couldn't find a matching place in the current Foodie data.";

/** Label distances honestly when they come from the development test origin. */
function testOriginNotice(context: AssistantContext, searchedNearby: boolean): string | null {
  if (context.origin?.source === "test" && searchedNearby) {
    return `Distances are measured from the development test origin (${GITAM_TEST_LOCATION.label}), not your real position.`;
  }
  return null;
}

export async function POST(req: NextRequest) {
  // ---- 1) Validate the untrusted request body ----
  let rawBody: unknown;
  try {
    rawBody = await req.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const parsed = parseAssistantRequest(rawBody);
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  const { message, context } = parsed;

  try {
    // ---- 2) Intent extraction (best-effort; failure → broad search) ----
    const query = await extractFoodieQuery(message, context);
    const intentFailed = query === null;
    const effectiveQuery = query ?? { keywords: [] };

    // ---- 3) Deterministic search over the EXISTING data layer ----
    // When the intent step failed, stored preferences must NOT narrow the
    // fallback search — an unreadable request is never reinterpreted.
    const outcome = await executeFoodieQuery(effectiveQuery, context, {
      allowPreferenceOverlay: !intentFailed,
    });

    // ---- 4) Grounded reply composed from the returned rows ONLY ----
    let reply: string;
    try {
      // context carries only what is REALLY known about the user; what
      // actually shaped the selection arrives via the search meta below
      // (usedPreferences / preferenceCategories / modeHintFromMessage).
      const grounding = {
        message,
        context: {
          foodMode: context.foodMode,
          location: context.origin
            ? { available: true, source: context.origin.source, areaLabel: context.origin.areaLabel }
            : { available: false },
        },
        search: serializeSearchMeta(outcome),
        places: serializePlacesForLLM(outcome.places),
      };
      const composed = await chatText(
        [
          { role: "system", content: COMPOSE_SYSTEM_PROMPT },
          { role: "user", content: JSON.stringify(grounding) },
        ],
        "assistant reply composition"
      );
      reply = composed.trim();
      if (!reply) throw new Error("composer returned an empty reply");
      // Deterministic honesty guard: a composer that produced the no-match
      // wording while REAL rows were returned gets replaced by the honest
      // fallback — the cards below are real and must not be contradicted.
      if (
        outcome.places.length > 0 &&
        /couldn't find (a|any) matching place/i.test(reply)
      ) {
        console.warn("[api/assistant/chat] composer claimed no match despite results — using fallback reply");
        reply = FALLBACK_REPLY_WITH_PLACES;
      }
    } catch (composeError) {
      // Never fail the request over prose — the places below are still real.
      console.error("[api/assistant/chat] reply composition failed:", composeError);
      reply = outcome.places.length > 0 ? FALLBACK_REPLY_WITH_PLACES : FALLBACK_REPLY_EMPTY;
    }

    // ---- 5) Honest notices (demo mode / widened search / test origin) ----
    const notices: (string | null | undefined)[] = [outcome.notice];
    if (intentFailed) {
      notices.push("I couldn't fully read your request, so I searched Foodie's data broadly.");
    }
    notices.push(testOriginNotice(context, outcome.searchedNearby));
    const notice = notices.filter(Boolean).join(" ") || undefined;

    return NextResponse.json(
      { reply, places: outcome.places, mode: outcome.mode, notice },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("[api/assistant/chat] unexpected failure:", error);
    return NextResponse.json(
      { error: "The Foodie AI couldn't finish your request. Please try again in a moment." },
      { status: 500 }
    );
  }
}
