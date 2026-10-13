/**
 * GET /api/destination-foods/[id]/places
 *
 * The curated REAL places serving one destination food (migration-004
 * links). Destination foods are destination-level records and the link
 * table is evidence-gated: relationships are NEVER inferred from category,
 * name or cuisine similarity. Strictly READ-ONLY.
 *
 * 404 when the id is missing/malformed/unknown (or the food's destination
 * is inactive) so callers can react honestly; an existing food may
 * legitimately have ZERO linked places — an honest empty list. Random
 * nearby restaurants are never substituted.
 *
 * Responds { mode, food: DestinationFood, places: Place[], notice? }.
 */

import { NextRequest, NextResponse } from "next/server";
import { loadDestinationFoodPlaces } from "@/lib/foodie/data/serverRepository";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Destination food id is required." }, { status: 400 });
  }

  try {
    const result = await loadDestinationFoodPlaces(decodeURIComponent(id));
    if (!result.food) {
      return NextResponse.json(
        { error: "Destination food not found." },
        { status: 404, headers: { "Cache-Control": "no-store" } }
      );
    }
    return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("[api/destination-foods/[id]/places] unexpected failure:", error);
    return NextResponse.json(
      { error: "Couldn't load the places serving this food right now. Please try again." },
      { status: 500 }
    );
  }
}
