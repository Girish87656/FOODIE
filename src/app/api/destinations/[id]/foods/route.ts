/**
 * GET /api/destinations/[id]/foods
 *
 * One destination plus its curated famous/local foods (real Supabase rows).
 * The companion `destination_food_places` links are intentionally not joined
 * yet — that table stays empty until evidence-based restaurant connections
 * are curated, and the UI must never substitute random nearby restaurants.
 *
 * Responds { mode, destination, foods, notice? }
 *   400 — id is not a uuid
 *   404 — no destination with that id
 */

import { NextRequest, NextResponse } from "next/server";
import { loadDestinationFoods } from "@/lib/foodie/data/serverRepository";
import { isUuid } from "@/lib/foodie/data/mappers";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id || !isUuid(id)) {
    return NextResponse.json(
      { error: "'id' must be a destination uuid." },
      { status: 400 }
    );
  }

  try {
    const result = await loadDestinationFoods(id);
    if (!result.destination) {
      return NextResponse.json(
        { error: "Destination not found." },
        { status: 404, headers: { "Cache-Control": "no-store" } }
      );
    }
    return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("[api/destinations/[id]/foods] unexpected failure:", error);
    return NextResponse.json(
      { error: "Couldn't load this destination's foods right now. Please try again." },
      { status: 500 }
    );
  }
}
