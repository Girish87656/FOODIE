/**
 * GET /api/places/[id]
 *
 * One curated NON-FOOD place — a tourist attraction OR lodging hotel — by
 * its stable uuid5 id, from the approved `public.places` model
 * (supabase/migration-008-places.sql — currently a REVIEW CANDIDATE that has
 * NOT been applied). Strictly READ-ONLY; the food tables
 * (restaurants/dishes/reviews/restaurant_photos) are never touched.
 *
 * 404 when the id is unknown OR when the `public.places` table isn't live
 * yet — the error body carries the honest reason (e.g.
 * PLACES_TABLE_NOT_READY_NOTICE) so the detail screen can explain the state
 * instead of a bare "not found".
 *
 * Responds { mode, place: PointOfInterest | null, notice? }.
 */

import { NextRequest, NextResponse } from "next/server";
import { loadPointOfInterestById } from "@/lib/foodie/data/serverRepository";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Place id is required." }, { status: 400 });
  }

  try {
    const result = await loadPointOfInterestById(decodeURIComponent(id));
    if (!result.place) {
      return NextResponse.json(
        { error: result.notice ?? "Place not found." },
        { status: 404, headers: { "Cache-Control": "no-store" } }
      );
    }
    return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("[api/places/[id]] unexpected failure:", error);
    return NextResponse.json(
      { error: "Couldn't load this place right now. Please try again." },
      { status: 500 }
    );
  }
}
