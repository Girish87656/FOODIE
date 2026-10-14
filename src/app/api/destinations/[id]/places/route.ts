/**
 * GET /api/destinations/[id]/places
 *
 * Every discoverable place recorded in the destination's OWN city —
 * the reusable multi-area browser (Prototype 3 Area A: Tirupati).
 * Strictly READ-ONLY. The match is `lower(restaurants.city) =
 * lower(destinations.name)`, so NO city is ever hardcoded in the app and
 * the same query serves any future destination.
 *
 * 404 when the id is missing/malformed/unknown so callers can react
 * honestly; an existing destination may legitimately have ZERO city rows
 * yet — an honest empty list. Places from other cities are never mixed in.
 *
 * Responds { mode, destination: Destination, places: Place[], notice? }.
 */

import { NextRequest, NextResponse } from "next/server";
import { loadDestinationPlaces } from "@/lib/foodie/data/serverRepository";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Destination id is required." }, { status: 400 });
  }

  try {
    const result = await loadDestinationPlaces(decodeURIComponent(id));
    if (!result.destination) {
      return NextResponse.json(
        { error: "Destination not found." },
        { status: 404, headers: { "Cache-Control": "no-store" } }
      );
    }
    return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("[api/destinations/[id]/places] unexpected failure:", error);
    return NextResponse.json(
      { error: "Couldn't load the places in this destination right now. Please try again." },
      { status: 500 }
    );
  }
}
