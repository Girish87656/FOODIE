"use client";

/**
 * PhotoUploader — the "add a photo" control for the food-place detail
 * screen's Photos section.
 *
 *  - CONFIG HONESTY: without a live Supabase backend (demo mode) the control
 *    renders an explicit "can't store uploads here" note — it never fakes an
 *    upload and never pretends a photo was added.
 *  - AUTH GATE: identical to the reviews section — logged-out users get a
 *    "Log in to add a photo" prompt; writes re-validate the session inside
 *    the write layer (photos.ts) and RLS enforces ownership.
 *  - FLOW: pick → client-side validation (JPG/PNG/WebP, ≤5 MB) → local
 *    preview → upload with REAL byte-level progress → gallery refresh via
 *    the parent's onUploaded callback (the detail refetch then shows the
 *    stored photo WITH its recorded credit — nothing is optimistically
 *    faked into the list).
 */

import { useEffect, useRef, useState } from "react";
import { Camera, ImageUp, LogIn, X } from "lucide-react";
import { toast } from "sonner";
import { useFoodieStore } from "@/lib/foodie/store";
import { useAuthStore } from "@/lib/foodie/authStore";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import {
  PHOTO_MAX_BYTES,
  uploadRestaurantPhoto,
  validatePhotoFile,
} from "@/lib/foodie/data/photos";
import { cn } from "@/lib/utils";

export function PhotoUploader({
  restaurantId,
  onUploaded,
}: {
  restaurantId: string;
  /** Called after a REAL successful upload so the parent can refetch the gallery. */
  onUploaded: () => void;
}) {
  const go = useFoodieStore((s) => s.go);
  const session = useAuthStore((s) => s.session);
  const signedIn = !!session?.user;
  const configured = isSupabaseConfigured();

  const inputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Object-URL lifecycle WITHOUT a setState-in-effect: the URL is created in
  // the pick handler (never during render), and the effect below only ever
  // REGISTERS the cleanup, so the browser reclaims the blob when the preview
  // is cleared or the component unmounts.
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function reset() {
    setFile(null);
    setProgress(null);
    setError(null);
    // previewUrl is revoked by the cleanup effect when it flips to null.
    setPreviewUrl(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  function handlePick(e: React.ChangeEvent<HTMLInputElement>) {
    setError(null);
    const picked = e.target.files?.[0] ?? null;
    if (!picked) return;
    const invalid = validatePhotoFile(picked);
    if (invalid) {
      setError(invalid);
      e.target.value = "";
      return;
    }
    // A previous preview is impossible here (the picker only renders when no
    // file is selected), but stay defensive about blob leaks anyway.
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(picked);
    setPreviewUrl(URL.createObjectURL(picked));
  }

  async function handleUpload() {
    if (!file || uploading) return;
    setUploading(true);
    setError(null);
    setProgress(0);
    const res = await uploadRestaurantPhoto(restaurantId, file, (fraction) =>
      setProgress(fraction)
    );
    setUploading(false);
    setProgress(null);
    if (!res.ok) {
      setError(res.error ?? "Couldn't upload the photo right now.");
      if (res.needsLogin) toast.error("Please log in to add a photo.");
      return;
    }
    toast.success("Photo added — thank you!", {
      description: "It will appear in the gallery after a quick refresh.",
    });
    reset();
    onUploaded();
  }

  /* ------------- honest states ------------- */

  if (!configured) {
    return (
      <div className="mt-2.5 rounded-2xl border border-dashed border-stone-200 bg-stone-50 px-4 py-3.5 text-center">
        <p className="text-[12.5px] font-semibold text-stone-600">
          Photo uploads need Foodie&apos;s live backend — demo mode can&apos;t
          store photos.
        </p>
        <p className="mt-0.5 text-[11px] leading-snug text-stone-400">
          Nothing is faked here: no photo is ever added unless a real upload
          succeeds.
        </p>
      </div>
    );
  }

  if (!signedIn) {
    return (
      <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-dashed border-stone-200 bg-stone-50 px-3.5 py-3">
        <p className="text-[12.5px] font-semibold text-stone-600">
          Log in to add a photo of this place.
        </p>
        <button
          type="button"
          onClick={() => go("auth")}
          className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-[12.5px] font-bold text-white shadow-sm transition-all hover:opacity-95 active:scale-[0.98]"
        >
          <LogIn className="size-3.5" aria-hidden="true" />
          Log in
        </button>
      </div>
    );
  }

  /* ------------- signed-in flow ------------- */

  return (
    <div className="mt-2.5 rounded-2xl border border-primary/25 bg-orange-50/50 p-3.5">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handlePick}
        disabled={uploading}
        className="hidden"
        aria-label="Choose a photo to upload (JPG, PNG or WebP, up to 5 MB)"
      />

      {!file ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-primary/30 bg-card px-4 py-3 text-[13.5px] font-bold text-primary transition-all hover:bg-orange-100 active:scale-[0.99] disabled:opacity-60"
        >
          <Camera className="size-4" aria-hidden="true" />
          Add a photo
        </button>
      ) : (
        <div>
          <div className="flex items-start gap-3">
            {previewUrl && (
              <img
                src={previewUrl}
                alt="Preview of the photo you selected"
                className="size-20 shrink-0 rounded-xl border border-border object-cover"
              />
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12.5px] font-bold text-foreground" title={file.name}>
                {file.name}
              </p>
              <p className="mt-0.5 text-[11px] font-medium text-stone-400">
                {(file.size / (1024 * 1024)).toFixed(1)} MB · JPG, PNG or WebP · up to{" "}
                {Math.round(PHOTO_MAX_BYTES / (1024 * 1024))} MB
              </p>
              {progress != null && (
                <div
                  className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-stone-200"
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={Math.round(progress * 100)}
                  aria-label="Upload progress"
                >
                  <div
                    className="foodie-gradient h-full rounded-full transition-[width] duration-200"
                    style={{ width: `${Math.max(4, Math.round(progress * 100))}%` }}
                  />
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={reset}
              disabled={uploading}
              aria-label="Cancel this photo"
              className="grid size-8 shrink-0 place-items-center rounded-full border border-border bg-card text-stone-500 transition-colors hover:bg-accent disabled:opacity-50"
            >
              <X className="size-3.5" aria-hidden="true" />
            </button>
          </div>

          {error && (
            <p role="alert" className="mt-2.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-[12px] font-semibold text-rose-700">
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={handleUpload}
            disabled={uploading}
            className={cn(
              "foodie-gradient mt-2.5 flex h-[44px] w-full items-center justify-center gap-2 rounded-2xl text-[13.5px] font-bold text-white shadow-lg shadow-orange-600/25 transition-all hover:opacity-95 active:scale-[0.99]",
              "disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none"
            )}
          >
            {uploading && (
              <span
                className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                aria-hidden="true"
              />
            )}
            <ImageUp className="size-4" aria-hidden="true" />
            {uploading
              ? progress != null && progress < 1
                ? `Uploading… ${Math.round(progress * 100)}%`
                : "Saving photo…"
              : "Upload photo"}
          </button>
          <p className="mt-1.5 text-center text-[10.5px] leading-snug text-stone-400">
            Only upload photos you took yourself. Your photo is stored with a
            &ldquo;Foodie community photo&rdquo; credit.
          </p>
        </div>
      )}
    </div>
  );
}
