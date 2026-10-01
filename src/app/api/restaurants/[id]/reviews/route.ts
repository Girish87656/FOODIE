/**
 * GET /api/restaurants/[id]/reviews
 *
 * Real user reviews for one restaurant. Public read (RLS: reviews are
 * readable by everyone) — no session needed. Responds { mode, reviews }.
 *
 * There is NO demo fallback with fabricated rows: demo mode and Supabase
 * failures both produce an honestly-labelled EMPTY list. Review WRITES do
 * not go through this route at all — they go browser→Supabase with the
 * user's own authenticated session (see src/lib/foodie/data/reviews.ts)
 * so RLS can enforce `user_id = auth.uid()`.
 */

import { NextRequest, NextResponse } from "next/server";
import { loadReviews } from "@/lib/foodie/data/serverRepository";

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
    const result = await loadReviews(decodeURIComponent(id));
    return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("[api/restaurants/[id]/reviews] unexpected failure:", error);
    return NextResponse.json(
      { error: "Couldn't load reviews right now. Please try again." },
      { status: 500 }
    );
  }
}
