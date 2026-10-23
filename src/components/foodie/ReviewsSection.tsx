"use client";

/**
 * Reviews section for PlaceDetailScreen — real user reviews from the
 * `reviews` table ONLY (no fabricated rows, ever).
 *
 *  - READ: public (works logged-out) via /api/restaurants/[id]/reviews.
 *  - WRITE: logged-in users only, through src/lib/foodie/data/reviews.ts
 *    (browser session + RLS; user_id always = the authenticated user).
 *  - The signed-in user sees their own review pinned as "Your review" with
 *    Edit/Delete; nobody can modify anyone else's review (RLS-enforced and
 *    double-filtered by user_id in the write layer).
 *  - "Foodie reviews" average/count is computed from these real rows and is
 *    kept SEPARATE from the place's seeded "Listed rating" shown at the top
 *    of the detail screen — the two ratings are never merged here.
 *  - Display names never include emails: other reviewers show as
 *    "Foodie User"; the signed-in author sees their own profile name.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  MessageCircle,
  Pencil,
  PenLine,
  RefreshCw,
  Star,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { useFoodieStore } from "@/lib/foodie/store";
import { useAuthStore } from "@/lib/foodie/authStore";
import { getReviews } from "@/lib/foodie/data/repository";
import {
  createReview,
  deleteReview,
  updateReview,
  validateReviewInput,
} from "@/lib/foodie/data/reviews";
import type { ReviewRow } from "@/lib/foodie/data/types";
import {
  REVIEW_TEXT_MAX_LENGTH,
} from "@/lib/foodie/data/types";
import { cn } from "@/lib/utils";

/** "Mar 5, 2026" style date for review rows. */
function reviewDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

/** Read-only star row (filled stars = earned rating). */
function Stars({ rating, size = "size-3.5" }: { rating: number; size?: string }) {
  return (
    <span
      className="inline-flex items-center gap-0.5"
      role="img"
      aria-label={`Rated ${rating} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          aria-hidden="true"
          className={cn(
            size,
            n <= rating ? "fill-amber-400 text-amber-400" : "fill-stone-200 text-stone-200"
          )}
        />
      ))}
    </span>
  );
}

/** Interactive star picker for the write/edit form. */
function StarPicker({
  value,
  onChange,
  disabled,
}: {
  value: number;
  onChange: (n: number) => void;
  disabled: boolean;
}) {
  const [hover, setHover] = useState(0);
  const shown = hover || value;
  return (
    <div className="flex items-center gap-1" onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={disabled}
          aria-label={`Rate ${n} star${n > 1 ? "s" : ""}`}
          aria-pressed={value === n}
          onMouseEnter={() => setHover(n)}
          onFocus={() => setHover(n)}
          onBlur={() => setHover(0)}
          onClick={() => onChange(n)}
          className="rounded-md p-0.5 transition-transform hover:scale-110 focus-visible:outline-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Star
            aria-hidden="true"
            className={cn(
              "size-8 transition-colors",
              n <= shown ? "fill-amber-400 text-amber-400" : "fill-stone-100 text-stone-300"
            )}
          />
        </button>
      ))}
      <span className="ml-1.5 text-[12px] font-semibold text-stone-500" aria-live="polite">
        {shown > 0 ? `${shown}/5` : "Tap to rate"}
      </span>
    </div>
  );
}

type FormMode = "closed" | "create" | "edit";

/** A completed (or failed) reviews fetch, tagged with the request it belongs to. */
type ReviewsOutcome =
  | { key: string; kind: "ready"; reviews: ReviewRow[]; notice: string | null }
  | { key: string; kind: "error" };

export function ReviewsSection({ placeId }: { placeId: string }) {
  const go = useFoodieStore((s) => s.go);

  // Real auth state (Supabase session) — read-only use here; writes re-check
  // the session server-side via auth.getUser() inside the write layer.
  const session = useAuthStore((s) => s.session);
  const user = useAuthStore((s) => s.user);
  const signedIn = !!session?.user;
  const myUserId = user?.id ?? session?.user?.id ?? null;

  // My own profile name for "Your review" (never an email — metadata only).
  const myName = useMemo(() => {
    const meta = user?.user_metadata?.full_name;
    if (typeof meta === "string" && meta.trim()) return meta.trim().split(/\s+/)[0];
    return "Foodie User";
  }, [user]);

  const [attempt, setAttempt] = useState(0);
  const [formMode, setFormMode] = useState<FormMode>("closed");
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const load = useCallback(() => setAttempt((n) => n + 1), []);

  /**
   * Keyed fetch outcome (same pattern as PlaceDetailScreen): results are
   * tagged with the request they belong to, so a placeId change or refetch
   * immediately reads as "loading" without setState inside the effect body.
   */
  const loadKey = `${placeId}|${attempt}`;
  const [outcome, setOutcome] = useState<ReviewsOutcome | null>(null);
  useEffect(() => {
    if (!placeId) return;
    let cancelled = false;
    getReviews(placeId)
      .then((res) => {
        if (cancelled) return;
        setOutcome({
          key: loadKey,
          kind: "ready",
          reviews: res.reviews,
          notice: res.notice ?? null,
        });
      })
      .catch(() => {
        if (!cancelled) setOutcome({ key: loadKey, kind: "error" });
      });
    return () => {
      cancelled = true;
    };
  }, [placeId, loadKey]);

  const current = outcome?.key === loadKey ? outcome : null;
  const reviews = current?.kind === "ready" ? current.reviews : [];
  // A FAILED fetch (network/API error) — retryable, so it carries a Retry
  // button. A ready-but-empty result with a notice (e.g. demo mode: reviews
  // only ever come from the real database) is NOT an error — it must render
  // the honest empty state with the notice as INFORMATION, never a Retry
  // affordance for a response that was actually correct.
  const loadError =
    current?.kind === "error" ? "Couldn't load reviews right now. Please try again." : null;
  const loadNotice = current?.kind === "ready" ? current.notice : null;

  const myReview = useMemo(
    () => (myUserId ? reviews?.find((r) => r.user_id === myUserId) ?? null : null),
    [reviews, myUserId]
  );
  const otherReviews = useMemo(
    () => reviews?.filter((r) => r.user_id !== myUserId) ?? [],
    [reviews, myUserId]
  );
  const average = useMemo(() => {
    if (!reviews || reviews.length === 0) return null;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return Math.round((sum / reviews.length) * 10) / 10;
  }, [reviews]);

  function openCreate() {
    setFormMode("create");
    setRating(0);
    setText("");
    setFormError(null);
  }
  function openEdit() {
    if (!myReview) return;
    setFormMode("edit");
    setRating(myReview.rating);
    setText(myReview.review);
    setFormError(null);
  }
  function closeForm() {
    setFormMode("closed");
    setFormError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    const input = validateReviewInput(rating, text);
    if ("error" in input) {
      setFormError(input.error);
      return;
    }
    setSubmitting(true);
    setFormError(null);

    const res =
      formMode === "edit" && myReview
        ? await updateReview(myReview.id, rating, text)
        : await createReview(placeId, rating, text);

    setSubmitting(false);
    if (!res.ok) {
      setFormError(res.error ?? "Couldn't save your review right now.");
      if (res.needsLogin) toast.error("Please log in to review this place.");
      return;
    }
    toast.success(formMode === "edit" ? "Review updated" : "Review posted — thank you!");
    closeForm();
    load(); // refresh list → new/updated review, count and average all recompute
  }

  async function handleDelete() {
    if (!myReview || deleting) return;
    setDeleting(true);
    const res = await deleteReview(myReview.id);
    setDeleting(false);
    if (!res.ok) {
      toast.error(res.error ?? "Couldn't delete your review right now.");
      return;
    }
    toast.success("Your review was deleted");
    if (formMode === "edit") closeForm();
    load();
  }

  const trimmedLen = text.trim().length;
  const canSubmit = rating >= 1 && trimmedLen >= 1 && trimmedLen <= REVIEW_TEXT_MAX_LENGTH && !submitting;

  return (
    <section className="mt-6" aria-label={`Reviews of this place`}>
      <h2 className="flex items-center gap-1.5 text-[15.5px] font-bold text-foreground">
        <MessageCircle className="size-4 text-primary" aria-hidden="true" />
        Reviews
        {reviews && reviews.length > 0 && (
          <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[11px] font-bold text-stone-500">
            {reviews.length}
          </span>
        )}
      </h2>

      {/* summary — Foodie reviews average from the REAL rows only */}
      <div className="mt-2.5 flex items-center gap-3 rounded-2xl border border-border/70 bg-card p-3.5 shadow-sm">
        <span className="text-[26px] font-extrabold leading-none text-foreground" aria-hidden="true">
          {average != null ? average.toFixed(1) : "—"}
        </span>
        <div className="min-w-0">
          {average != null ? (
            <>
              <Stars rating={Math.round(average)} />
              <p className="mt-0.5 text-[12px] font-semibold text-stone-500">
                {reviews!.length} review{reviews!.length === 1 ? "" : "s"} · Foodie reviews
              </p>
            </>
          ) : (
            <p className="text-[12px] font-semibold text-stone-500">
              No Foodie reviews yet
            </p>
          )}
        </div>
        <span
          className="ml-auto hidden shrink-0 text-right text-[10.5px] leading-snug text-stone-400 sm:block"
          title="The place's listed rating (shown above) and Foodie user reviews are kept separate"
        >
          Listed rating above is
          <br />
          shown separately
        </span>
      </div>

      {/* write area — authentication split */}
      {!signedIn ? (
        <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-dashed border-stone-200 bg-stone-50 px-3.5 py-3">
          <p className="text-[12.5px] font-semibold text-stone-600">
            Log in to write a review.
          </p>
          <button
            type="button"
            onClick={() => go("auth")}
            className="rounded-full bg-primary px-4 py-2 text-[12.5px] font-bold text-white shadow-sm transition-all hover:opacity-95 active:scale-[0.98]"
          >
            Log in
          </button>
        </div>
      ) : formMode === "closed" ? (
        myReview ? (
          /* -------- own review card -------- */
          <div className="mt-2.5 rounded-2xl border border-primary/25 bg-orange-50/60 p-3.5">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[12px] font-extrabold uppercase tracking-wide text-primary">
                Your review
              </p>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={openEdit}
                  className="flex items-center gap-1 rounded-full border border-border bg-card px-2.5 py-1.5 text-[11.5px] font-bold text-stone-600 transition-colors hover:bg-accent active:scale-[0.98]"
                >
                  <Pencil className="size-3" aria-hidden="true" />
                  Edit
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-[11.5px] font-bold text-rose-600 transition-colors hover:bg-rose-100 active:scale-[0.98] disabled:opacity-60"
                >
                  <Trash2 className="size-3" aria-hidden="true" />
                  {deleting ? "Deleting…" : "Delete"}
                </button>
              </div>
            </div>
            <div className="mt-1.5 flex items-center gap-2">
              <Stars rating={myReview.rating} />
              <span className="text-[11px] font-medium text-stone-400">
                {reviewDate(myReview.created_at)}
              </span>
            </div>
            <p className="mt-1.5 whitespace-pre-wrap text-[13px] leading-snug text-stone-700">
              {myReview.review}
            </p>
            <button
              type="button"
              onClick={openEdit}
              className="mt-2 flex items-center gap-1 text-[11.5px] font-bold text-primary hover:underline"
            >
              <PenLine className="size-3" aria-hidden="true" />
              Edit your review
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={openCreate}
            className="mt-2.5 flex w-full items-center justify-center gap-2 rounded-2xl border border-primary/30 bg-orange-50 px-4 py-3 text-[13.5px] font-bold text-primary transition-all hover:bg-orange-100 active:scale-[0.99]"
          >
            <PenLine className="size-4" aria-hidden="true" />
            Write a review
          </button>
        )
      ) : (
        /* -------- create / edit form -------- */
        <form
          onSubmit={handleSubmit}
          className="mt-2.5 rounded-2xl border border-border/70 bg-card p-3.5 shadow-sm"
          aria-label={formMode === "edit" ? "Edit your review" : "Write a review"}
        >
          <div className="flex items-center justify-between">
            <p className="text-[12px] font-extrabold uppercase tracking-wide text-stone-500">
              {formMode === "edit" ? "Edit your review" : "New review"}
            </p>
            <button
              type="button"
              onClick={closeForm}
              className="text-[12px] font-bold text-stone-400 hover:text-stone-600"
            >
              Cancel
            </button>
          </div>

          <div className="mt-2.5">
            <p className="mb-1 text-[12.5px] font-bold text-foreground">Rating</p>
            <StarPicker value={rating} onChange={setRating} disabled={submitting} />
          </div>

          <div className="mt-3">
            <label htmlFor="review-text" className="mb-1 block text-[12.5px] font-bold text-foreground">
              Review
            </label>
            <textarea
              id="review-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={4}
              maxLength={REVIEW_TEXT_MAX_LENGTH}
              placeholder="How was the food, service and vibe?"
              className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2.5 text-[13px] leading-snug text-foreground placeholder:text-stone-400 focus-visible:outline-2 focus-visible:outline-primary"
            />
            <p className="mt-1 text-right text-[10.5px] font-medium text-stone-400">
              {text.trim().length}/{REVIEW_TEXT_MAX_LENGTH}
            </p>
          </div>

          {formError && (
            <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-[12.5px] font-semibold text-rose-700">
              {formError}
            </p>
          )}

          <button
            type="submit"
            disabled={!canSubmit}
            className="foodie-gradient mt-2 flex h-[46px] w-full items-center justify-center gap-2 rounded-2xl text-[14px] font-bold text-white shadow-lg shadow-orange-600/25 transition-all hover:opacity-95 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
          >
            {submitting && (
              <span
                className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                aria-hidden="true"
              />
            )}
            {submitting ? "Submitting…" : "Submit Review"}
          </button>
        </form>
      )}

      {/* loading / error / empty / list of other reviews */}
      {reviews === null ? (
        <div className="mt-3 space-y-2" aria-live="polite" aria-busy="true">
          <div className="h-16 animate-pulse rounded-2xl bg-stone-100" />
          <div className="h-16 animate-pulse rounded-2xl bg-stone-100" />
        </div>
      ) : loadError ? (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-3.5 py-3">
          <p className="text-[12.5px] font-semibold text-amber-800">{loadError}</p>
          <button
            type="button"
            onClick={load}
            className="flex items-center gap-1 rounded-full border border-amber-300 bg-card px-3 py-1.5 text-[11.5px] font-bold text-amber-800"
          >
            <RefreshCw className="size-3" aria-hidden="true" />
            Retry
          </button>
        </div>
      ) : otherReviews.length === 0 ? (
        reviews.length === 0 ? (
          <div aria-live="polite">
            <p className="mt-3 rounded-2xl border border-dashed border-stone-200 bg-stone-50 px-4 py-5 text-center text-[13px] font-semibold text-stone-500">
              No reviews yet. Be the first to review this place.
            </p>
            {loadNotice && (
              <p className="mt-2 text-center text-[11.5px] font-medium leading-snug text-stone-400">
                {loadNotice}
              </p>
            )}
          </div>
        ) : (
          <p className="mt-3 text-center text-[12px] font-medium text-stone-400" aria-live="polite">
            You&apos;re the only one who has reviewed this place so far.
          </p>
        )
      ) : (
        <ul className="mt-3 space-y-2.5">
          {otherReviews.map((r) => (
            <li
              key={r.id}
              className="rounded-2xl border border-border/70 bg-card p-3.5 shadow-sm"
            >
              <div className="flex items-center gap-2.5">
                <span
                  className="grid size-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-orange-400 to-amber-500 text-[12px] font-extrabold text-white"
                  aria-hidden="true"
                >
                  F
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-bold text-foreground">Foodie User</p>
                  <div className="flex items-center gap-1.5">
                    <Stars rating={r.rating} size="size-3" />
                    <span className="text-[10.5px] font-medium text-stone-400">
                      {reviewDate(r.created_at)}
                    </span>
                  </div>
                </div>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-[13px] leading-snug text-stone-700">
                {r.review}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
