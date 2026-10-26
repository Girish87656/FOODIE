/**
 * POST /api/push/test — deliver ONE real self-notification to the calling
 * user's own stored subscriptions.
 *
 * SECURITY & HONESTY CONTRACT:
 *   * Identity is resolved SERVER-SIDE: the caller's own Supabase access
 *     token (Authorization: Bearer …) is verified with auth.getUser() — a
 *     client-sent user id is never trusted. No token → 401.
 *   * The subscription read and every delete run through a client scoped to
 *     the CALLING USER's JWT (createUserScopedClient), so RLS ("own rows
 *     only") applies exactly as in the browser. There is no service-role
 *     path anywhere in this codebase.
 *   * The only sender is the real web-push library (pushServer.ts) with the
 *     server-only VAPID keys. Nothing is simulated: a 200 with sent === 0
 *     is an explicit "nothing could be delivered", never a success.
 *   * Stale-row cleanup: a push-service 404/410 (unknown/gone endpoint)
 *     deletes that row in the same pass (RLS-scoped), so the next test send
 *     reports the honest 404 "no subscription" state.
 *   * Duplicate prevention: the payload carries a fixed `tag`, so retries
 *     and repeated clicks collapse into one visible notification.
 *   * Logging is status-codes-only: subscription endpoints embed per-browser
 *     push tokens and are NEVER logged; raw Supabase errors never reach the
 *     browser (describeSubscriptionStoreError maps them).
 *   * No permission is requested here (the browser already granted it at
 *     subscribe time) and no subscription is ever created by this route —
 *     subscriptions are created only by the explicit client opt-in flow.
 */

import { NextRequest, NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import {
  createUserScopedClient,
  describeSubscriptionStoreError,
  getPushConfig,
  logDeliveryOutcome,
  parseBearerToken,
  sendToSubscription,
  withPushQueryTimeout,
} from "@/lib/foodie/pushServer";

export const dynamic = "force-dynamic";

/**
 * The self-notification content. Deliberately factual — it never invents
 * news the user didn't ask for (they clicked "Send a test notification").
 */
const TEST_PAYLOAD = {
  title: "Foodie",
  body: "Foodie notifications are on — this is your test notification.",
  url: "/",
  tag: "foodie-test",
} as const;

interface SubscriptionRow {
  id: string;
  endpoint: string;
  p256dh: string;
  auth_key: string;
}

export async function POST(request: NextRequest) {
  // 1) Caller identity — a missing token is a login problem, reported
  //    honestly BEFORE any configuration state.
  const token = parseBearerToken(request.headers.get("authorization"));
  if (!token) {
    return NextResponse.json(
      { error: "Sign in to send yourself a test notification." },
      { status: 401 }
    );
  }

  // 2) Honest configuration gates (each reported as what it actually is).
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Authentication isn't configured on the server yet." },
      { status: 503 }
    );
  }
  const config = getPushConfig();
  if (!config.configured || !config.privateKey || !config.subject) {
    return NextResponse.json(
      { error: "Push notifications aren't set up on the server yet — nothing has been sent." },
      { status: 503 }
    );
  }

  // Scoped to the CALLING USER's JWT: RLS governs every read/delete below.
  const sb = createUserScopedClient(token);

  try {
    // 3) Verify the token server-side (never trust a client-sent user id).
    const { data: userData, error: authError } = await withPushQueryTimeout(sb.auth.getUser());
    const user = userData?.user;
    if (authError || !user) {
      return NextResponse.json(
        { error: "Your session couldn't be verified — sign in again and retry." },
        { status: 401 }
      );
    }

    // 4) Own rows only — RLS scopes this read to auth.uid(); the explicit
    //    user_id filter is defence-in-depth.
    const { data: rows, error: readError } = await withPushQueryTimeout(
      sb
        .from("push_subscriptions")
        .select("id,endpoint,p256dh,auth_key")
        .eq("user_id", user.id)
    );
    if (readError) {
      // Status code only — the raw message never goes to browser or log.
      console.error(`[push] subscription read failed code=${readError.code ?? "unknown"}`);
      return NextResponse.json({ error: describeSubscriptionStoreError(readError) }, { status: 502 });
    }

    const subscriptions = (rows ?? []) as SubscriptionRow[];
    if (subscriptions.length === 0) {
      return NextResponse.json(
        {
          sent: 0,
          removedStale: 0,
          error: "No stored subscription was found for your account. Enable notifications on this device first.",
        },
        { status: 404 }
      );
    }

    // 5) Real delivery (one bounded retry per row inside sendToSubscription),
    //    with same-pass cleanup of endpoints the push service reports dead.
    let sent = 0;
    let removedStale = 0;
    let lastFailedStatus: number | null = null;

    for (const sub of subscriptions) {
      const result = await sendToSubscription(config, sub, TEST_PAYLOAD);
      if (result.ok) {
        sent += 1;
        continue;
      }
      logDeliveryOutcome(sub.id, result); // status code only
      if (result.status === 404 || result.status === 410) {
        const { error: deleteError } = await withPushQueryTimeout(
          sb
            .from("push_subscriptions")
            .delete()
            .eq("id", sub.id)
            .eq("user_id", user.id)
        );
        if (deleteError) {
          console.error(`[push] stale cleanup failed sub=${sub.id} code=${deleteError.code ?? "unknown"}`);
        } else {
          removedStale += 1;
        }
      } else {
        lastFailedStatus = result.status;
      }
    }

    // 6) Honest outcomes — sent is only > 0 when web-push actually accepted
    //    the notification; every zero-delivery path says so in words.
    if (sent > 0) {
      return NextResponse.json({ sent, removedStale });
    }
    if (removedStale > 0) {
      return NextResponse.json({
        sent: 0,
        removedStale,
        message: "No working subscription could be delivered to — enable notifications again.",
      });
    }
    return NextResponse.json({
      sent: 0,
      removedStale: 0,
      message: `The push service couldn't accept the notification (status ${lastFailedStatus ?? "unknown"}) — try again shortly.`,
    });
  } catch (err) {
    // PushQueryTimeoutError or an unexpected failure — generic, honest, and
    // nothing about the token/endpoints is ever logged.
    console.error("[push] test delivery failed:", err instanceof Error ? err.name : "unknown");
    return NextResponse.json(
      { error: "The notification service couldn't complete the request — try again." },
      { status: 500 }
    );
  }
}
