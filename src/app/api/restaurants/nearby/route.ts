/**
 * GET /api/restaurants/nearby?lat=..&lng=..&radiusKm=..
 *
 * Nearby search against the restaurants' REAL stored coordinates.
 * `lat`/`lng` must be the user's actual position (browser Geolocation fix,
 * manual city pick, or the labelled prototype fallback — the client decides,
 * the server never injects a location).
 *
 * Responds { mode: "supabase" | "demo", places: PlaceWithDistance[], notice? }
 * — mode: "demo" whenever Supabase isn't configured (clearly-labelled demo
 * data, the app does not crash).
 */

import { NextRequest, NextResponse } from "next/server";
import { loadNearbyRestaurants } from "@/lib/foodie/data/serverRepository";
import { DEFAULT_DISCOVERY_RADIUS_KM } from "@/lib/foodie/data/types";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const lat = Number(sp.get("lat"));
  const lng = Number(sp.get("lng"));
  const radiusRaw = Number(sp.get("radiusKm") ?? DEFAULT_DISCOVERY_RADIUS_KM);

  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
    return NextResponse.json(
      { error: "Valid 'lat' and 'lng' query parameters are required (WGS-84 degrees)." },
      { status: 400 }
    );
  }
  const radiusKm =
    Number.isFinite(radiusRaw) && radiusRaw > 0 ? Math.min(radiusRaw, 2000) : DEFAULT_DISCOVERY_RADIUS_KM;

  try {
    const result = await loadNearbyRestaurants(lat, lng, radiusKm);
    return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("[api/restaurants/nearby] unexpected failure:", error);
    return NextResponse.json(
      { error: "Couldn't load nearby restaurants right now. Please try again." },
      { status: 500 }
    );
  }
}
