/**
 * GET /api/push/config
 *
 * Public push configuration for the browser: the VAPID PUBLIC key (public
 * by design) and whether push delivery is configured at all. The PRIVATE
 * key and subject NEVER leave the server. No secrets, no PII.
 */

import { NextResponse } from "next/server";
import { getPushConfig } from "@/lib/foodie/pushServer";

export const dynamic = "force-dynamic";

export async function GET() {
  const config = getPushConfig();
  return NextResponse.json(
    {
      configured: config.configured,
      // The public key is safe to expose (VAPID application server key).
      publicKey: config.configured ? config.publicKey : null,
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
