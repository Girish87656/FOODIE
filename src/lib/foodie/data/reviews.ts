"use client";

/**
 * Foodie review WRITES — the only module allowed to create/update/delete
 * reviews.
 *
 * SECURITY MODEL (mirrors authStore):
 *  - Every operation runs on the BROWSER Supabase client with the signed-in
 *    user's own JWT, so Row Level Security is the enforcement point:
 *      INSERT requires `user_id = auth.uid()`   (authenticated only)
 *      UPDATE requires `user_id = auth.uid()`   (own row only)
 *      DELETE requires `user_id = auth.uid()`   (own row only)
 *  - `user_id` is NEVER taken from client-controlled input. It is resolved
 *    from `supabase.auth.getUser()`, which validates the session's access
 *    token server-side before returning the user. A tampered client cannot
 *    write reviews for someone else — and even if it tried, RLS rejects it.
 *  - UPDATE/DELETE additionally filter `.eq("user_id", user.id)` (defence in
 *    depth), so touching another user's review simply affects zero rows.
 *  - There is NO demo fallback: without a real Supabase config or a real
 *    session every write fails with an explicit error. Fake reviews are
 *    never written anywhere.
 *
 * Raw Postgres/Supabase errors are never surfaced — every failure maps to a
 * short, user-safe message (see mapReviewError).
 */

import { getBrowserSupabase } from "@/lib/supabase/client";
import { AUTH_CONFIG_ERROR } from "@/lib/foodie/authStore";
import type { ReviewRow } from "./types";
import {
  REVIEW_TEXT_MAX_LENGTH,
  REVIEW_TEXT_MIN_LENGTH,
} from "./types";

export interface ReviewWriteResult {
  ok: boolean;
  /** Friendly, user-safe error message (never raw technical details). */
  error?: string;
  /** True when the operation failed because nobody is signed in. */
  needsLogin?: boolean;
  /** The affected row (create/update) so the UI can react without refetching. */
  review?: ReviewRow;
}

export type ReviewRating = 1 | 2 | 3 | 4 | 5;

/** Validation shared by the form and the write layer (trim + length + rating). */
export function validateReviewInput(
  rating: number,
  text: string
): { rating: ReviewRating; review: string } | { error: string } {
  const review = text.trim();
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { error: "Please choose a star rating from 1 to 5." };
  }
  if (review.length < REVIEW_TEXT_MIN_LENGTH) {
    return { error: "Please write a short review before submitting." };
  }
  if (review.length > REVIEW_TEXT_MAX_LENGTH) {
    return { error: `Reviews are limited to ${REVIEW_TEXT_MAX_LENGTH} characters.` };
  }
  return { rating: rating as ReviewRating, review };
}

/**
 * Maps raw Supabase/Postgres failures to short, friendly, user-safe messages.
 * Codes of interest:
 *  - 23505 unique_violation  → the (restaurant_id, user_id) unique constraint
 *    (one review per user per restaurant) rejected a duplicate.
 *  - 23514 check_violation   → rating/text constraint rejected the row.
 *  - 42501 insufficient_privilege → RLS refused the write (not signed in, or
 *    trying to modify someone else's review).
 */
function mapReviewError(err: unknown): { error: string; needsLogin?: boolean } {
  const code = (err as { code?: string } | null)?.code ?? "";
  const message = err instanceof Error ? err.message.toLowerCase() : String(err ?? "").toLowerCase();

  if (code === "23505" || message.includes("duplicate key") || message.includes("reviews_restaurant_user_key")) {
    return { error: "You've already reviewed this place — you can edit or delete your review instead." };
  }
  if (code === "23514" || message.includes("check constraint")) {
    return { error: "That rating or review text isn't valid. Please adjust and try again." };
  }
  if (code === "42501" || message.includes("row-level security") || message.includes("permission")) {
    return { error: "You can only manage your own review. Please log in with your account.", needsLogin: true };
  }
  if (code === "pgrst116" || message.includes("no rows") || message.includes("0 rows")) {
    return { error: "That review doesn't exist anymore (or isn't yours to change)." };
  }
  if (message.includes("jwt") || message.includes("session") || message.includes("not authenticated")) {
    return { error: "Please log in to manage your reviews.", needsLogin: true };
  }
  if (message.includes("fetch") || message.includes("network") || message.includes("load failed")) {
    return { error: "Can't reach the review service. Check your connection and try again." };
  }
  return { error: "Couldn't save your review right now. Please try again in a moment." };
}

/** Resolves the REAL authenticated user (token verified server-side), or null. */
async function requireSignedInUser(): Promise<
  { sb: NonNullable<ReturnType<typeof getBrowserSupabase>>; userId: string } | { fail: ReviewWriteResult }
> {
  const sb = getBrowserSupabase();
  if (!sb) {
    return {
      fail: { ok: false, error: AUTH_CONFIG_ERROR },
    };
  }
  try {
    const { data, error } = await sb.auth.getUser();
    if (error || !data?.user) {
      return { fail: { ok: false, needsLogin: true, error: "Please log in to write a review." } };
    }
    return { sb, userId: data.user.id };
  } catch {
    return { fail: { ok: false, needsLogin: true, error: "Please log in to write a review." } };
  }
}

/** Creates the signed-in user's single review for a restaurant. */
export async function createReview(
  restaurantId: string,
  rating: number,
  text: string
): Promise<ReviewWriteResult> {
  const input = validateReviewInput(rating, text);
  if ("error" in input) return { ok: false, error: input.error };

  const auth = await requireSignedInUser();
  if ("fail" in auth) return auth.fail;
  const { sb, userId } = auth;

  try {
    const { data, error } = await sb
      .from("reviews")
      .insert({
        restaurant_id: restaurantId,
        user_id: userId, // resolved from the validated session — never client input
        rating: input.rating,
        review: input.review,
      })
      .select("id,restaurant_id,user_id,rating,review,created_at")
      .single();
    if (error) return { ok: false, ...mapReviewError(error) };
    return { ok: true, review: data as ReviewRow };
  } catch (err) {
    return { ok: false, ...mapReviewError(err) };
  }
}

/** Updates the signed-in user's OWN review (RLS + explicit user_id filter). */
export async function updateReview(
  reviewId: string,
  rating: number,
  text: string
): Promise<ReviewWriteResult> {
  const input = validateReviewInput(rating, text);
  if ("error" in input) return { ok: false, error: input.error };

  const auth = await requireSignedInUser();
  if ("fail" in auth) return auth.fail;
  const { sb, userId } = auth;

  try {
    const { data, error } = await sb
      .from("reviews")
      .update({ rating: input.rating, review: input.review })
      .eq("id", reviewId)
      .eq("user_id", userId) // defence in depth — RLS enforces the same rule
      .select("id,restaurant_id,user_id,rating,review,created_at")
      .single();
    if (error) return { ok: false, ...mapReviewError(error) };
    return { ok: true, review: data as ReviewRow };
  } catch (err) {
    return { ok: false, ...mapReviewError(err) };
  }
}

/** Deletes the signed-in user's OWN review (RLS + explicit user_id filter). */
export async function deleteReview(reviewId: string): Promise<ReviewWriteResult> {
  const auth = await requireSignedInUser();
  if ("fail" in auth) return auth.fail;
  const { sb, userId } = auth;

  try {
    const { data, error } = await sb
      .from("reviews")
      .delete()
      .eq("id", reviewId)
      .eq("user_id", userId) // defence in depth — RLS enforces the same rule
      .select("id");
    if (error) return { ok: false, ...mapReviewError(error) };
    if (!data || data.length === 0) {
      return { ok: false, error: "That review doesn't exist anymore (or isn't yours to change)." };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, ...mapReviewError(err) };
  }
}
