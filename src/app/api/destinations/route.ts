/**
 * GET /api/destinations
 *
 * Every ACTIVE destination Foodie can surface famous/local food for —
 * real Supabase rows only (public SELECT via RLS; the table is curated
 * through the SQL editor and has no public write policy).
 *
 * Responds { mode: "supabase" | "demo", destinations: Destination[], notice? }
 * — there is NO demo dataset for destinations, so an unavailable database
 * yields an honestly EMPTY list with a notice, never fabricated cities.
 */

import { NextResponse } from "next/server";
import { loadDestinations } from "@/lib/foodie/data/serverRepository";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const result = await loadDestinations();
    return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("[api/destinations] unexpected failure:", error);
    return NextResponse.json(
      { error: "Couldn't load destinations right now. Please try again." },
      { status: 500 }
    );
  }
}
