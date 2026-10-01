/**
 * GET /api/restaurants/[id]
 *
 * Single restaurant by id (uuid for real Supabase rows, `demo:`-prefixed id
 * for the labelled demo dataset). Responds { mode, place } — 404 when the
 * id is unknown so the UI can show its "place moved" fallback.
 */

import { NextRequest, NextResponse } from "next/server";
import { loadRestaurantById } from "@/lib/foodie/data/serverRepository";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Restaurant id is required." }, { status: 400 });
  }

  try {
    const result = await loadRestaurantById(decodeURIComponent(id));
    if (!result.place) {
      return NextResponse.json(
        { error: "Restaurant not found." },
        { status: 404, headers: { "Cache-Control": "no-store" } }
      );
    }
    return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("[api/restaurants/[id]] unexpected failure:", error);
    return NextResponse.json(
      { error: "Couldn't load this restaurant right now. Please try again." },
      { status: 500 }
    );
  }
}
