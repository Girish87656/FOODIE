/**
 * GET /api/restaurants/category/[category]
 *
 * All restaurants in one pilot place category id
 * (restaurant | hotel | tiffin | cafe | fast_food | street_food | bakery_sweets).
 * Responds { mode, places, notice? }.
 */

import { NextResponse } from "next/server";
import { loadRestaurantsByCategory } from "@/lib/foodie/data/serverRepository";
import { PLACE_CATEGORIES } from "@/lib/foodie/constants";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ category: string }> }
) {
  const { category } = await params;
  const categoryId = decodeURIComponent(category).trim();

  if (!PLACE_CATEGORIES.some((c) => c.id === categoryId)) {
    return NextResponse.json(
      {
        error: `Unknown category '${categoryId}'. Valid ids: ${PLACE_CATEGORIES.map((c) => c.id).join(", ")}.`,
      },
      { status: 400 }
    );
  }

  try {
    const result = await loadRestaurantsByCategory(categoryId);
    return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("[api/restaurants/category] unexpected failure:", error);
    return NextResponse.json(
      { error: "Couldn't load this category right now. Please try again." },
      { status: 500 }
    );
  }
}
