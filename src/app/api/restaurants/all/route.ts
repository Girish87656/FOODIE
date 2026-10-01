/**
 * GET /api/restaurants/all
 *
 * Every discoverable restaurant in the database — INCLUDING rows whose
 * coordinates are still NULL (shown in the app as "Location pending
 * verification"). Strictly READ-ONLY: this endpoint never inserts, updates
 * or deletes anything, and never attaches distances to NULL-coordinate rows
 * (distance annotation happens client-side, only for coordinate-bearing rows).
 *
 * Responds { mode: "supabase" | "demo", places: Place[], notice? }.
 */

import { NextResponse } from "next/server";
import { loadAllRestaurants } from "@/lib/foodie/data/serverRepository";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const result = await loadAllRestaurants();
    return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("[api/restaurants/all] unexpected failure:", error);
    return NextResponse.json(
      { error: "Couldn't load the places list right now. Please try again." },
      { status: 500 }
    );
  }
}
