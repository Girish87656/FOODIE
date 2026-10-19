/**
 * GET /api/destinations/[id]/attractions
 *
 * The NON-FOOD discovery list for one destination: tourist attractions AND
 * lodging hotels from the approved `public.places` model
 * (supabase/migration-008-places.sql — currently a REVIEW CANDIDATE that has
 * NOT been applied; while that is true the response is an honestly EMPTY
 * list with PLACES_TABLE_NOT_READY_NOTICE, never an error and never
 * invented places).
 *
 * Strictly READ-ONLY. The match is places.destination_id (relational path)
 * OR lower(places.city) = lower(destinations.name) (primitive fallback) —
 * exactly the dual path the approved design documents. No city is ever
 * hardcoded; nothing writes anywhere.
 *
 * 404 only when the destination id is unknown AND there is no notice — an
 * unapplied migration keeps a 200-with-notice so the UI can explain the
 * honest state instead of a misleading "not available".
 *
 * Responds { mode, destination: Destination, attractions: PointOfInterest[], notice? }.
 */

import { NextRequest, NextResponse } from "next/server";
import { loadDestinationAttractions } from "@/lib/foodie/data/serverRepository";

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
    const result = await loadDestinationAttractions(decodeURIComponent(id));
    if (!result.destination && !result.notice) {
      return NextResponse.json(
        { error: "Destination not found." },
        { status: 404, headers: { "Cache-Control": "no-store" } }
      );
    }
    return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("[api/destinations/[id]/attractions] unexpected failure:", error);
    return NextResponse.json(
      { error: "Couldn't load the attractions for this destination right now. Please try again." },
      { status: 500 }
    );
  }
}
