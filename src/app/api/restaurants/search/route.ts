/**
 * GET /api/restaurants/search?q=..
 *
 * Free-text search across restaurant name, description, address and city.
 * Responds { mode, places, notice? }.
 */

import { NextRequest, NextResponse } from "next/server";
import { loadRestaurantsBySearch } from "@/lib/foodie/data/serverRepository";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") ?? "";
  if (!q.trim()) {
    return NextResponse.json(
      { error: "A non-empty 'q' search query is required." },
      { status: 400 }
    );
  }
  if (q.length > 120) {
    return NextResponse.json({ error: "Search query is too long." }, { status: 400 });
  }

  try {
    const result = await loadRestaurantsBySearch(q);
    return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("[api/restaurants/search] unexpected failure:", error);
    return NextResponse.json(
      { error: "Search isn't working right now. Please try again." },
      { status: 500 }
    );
  }
}
