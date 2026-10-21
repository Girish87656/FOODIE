"use client";

/**
 * Foodie photo WRITES — the only module allowed to upload place photos.
 *
 * SECURITY MODEL (mirrors reviews.ts):
 *  - The upload runs on the BROWSER Supabase client with the signed-in
 *    user's own JWT, so Row Level Security is the enforcement point:
 *      storage: authenticated users may write ONLY inside their own
 *      `${auth.uid()}/…` folder (storage.objects policy — migration-009
 *      candidate), everyone may read the public bucket.
 *      database: `restaurant_photos` INSERT requires
 *      `uploaded_by = auth.uid()` (existing schema.sql policy).
 *  - `uploaded_by` is NEVER taken from client-controlled input. It is
 *    resolved from `supabase.auth.getUser()`, which validates the session's
 *    access token server-side.
 *  - There is NO demo fallback: without a real Supabase config or a real
 *    session the upload fails with an explicit error. No photo is ever
 *    faked, and no successful upload is ever claimed without it having
 *    happened.
 *
 * HONESTY: a user upload is an AUTHENTIC user-provided photo. Its licensing
 * record is written truthfully as license "user-upload" with the
 * attribution "Foodie community photo" — the credit overlay then renders a
 * real credit line, and `source_url` stays NULL because no external source
 * exists. Nothing is invented anywhere.
 *
 * Raw Supabase/Postgres/storage errors are never surfaced — every failure
 * maps to a short, user-safe message.
 */

import { getBrowserSupabase } from "@/lib/supabase/client";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "@/lib/supabase/config";
import { AUTH_CONFIG_ERROR } from "@/lib/foodie/authStore";

/** The single public storage bucket for place photos (see migration-009). */
export const PHOTO_BUCKET = "restaurant-photos";

/** Upload guard rails — enforced here AND by the bucket config. */
export const PHOTO_MAX_BYTES = 5 * 1024 * 1024; // 5 MB
export const PHOTO_ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

/** Licensing markers recorded on user uploads (migration-006 columns). */
export const USER_UPLOAD_LICENSE = "user-upload";
export const USER_UPLOAD_ATTRIBUTION = "Foodie community photo";

export interface UploadedPhotoRow {
  id: string;
  restaurant_id: string;
  image_url: string;
  uploaded_by: string | null;
  created_at: string;
}

export interface PhotoUploadResult {
  ok: boolean;
  /** Friendly, user-safe error message (never raw technical details). */
  error?: string;
  /** True when the operation failed because nobody is signed in. */
  needsLogin?: boolean;
  photo?: UploadedPhotoRow;
}

/** Pre-flight file validation shared by the picker UI and the write layer. */
export function validatePhotoFile(file: File): string | null {
  if (!(PHOTO_ALLOWED_TYPES as readonly string[]).includes(file.type)) {
    return "Please choose a JPG, PNG or WebP photo.";
  }
  if (file.size <= 0) {
    return "That file looks empty — please choose a real photo.";
  }
  if (file.size > PHOTO_MAX_BYTES) {
    return "Photos are limited to 5 MB — please choose a smaller image.";
  }
  return null;
}

/**
 * Content validation: reads the file's first bytes and matches them against
 * the real magic numbers of the allowed formats. The browser-reported
 * `file.type` only reflects the file EXTENSION, so a renamed non-image
 * (e.g. `payload.exe` → `payload.jpg`) would otherwise pass the MIME allowlist.
 * Returns the detected kind, or `null` when the bytes match nothing allowed.
 */
export async function sniffImageKind(blob: Blob): Promise<"jpeg" | "png" | "webp" | null> {
  const head = new Uint8Array(await blob.slice(0, 12).arrayBuffer());
  if (head.length < 12) return null;
  // JPEG: FF D8 FF
  if (head[0] === 0xff && head[1] === 0xd8 && head[2] === 0xff) return "jpeg";
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    head[0] === 0x89 && head[1] === 0x50 && head[2] === 0x4e && head[3] === 0x47 &&
    head[4] === 0x0d && head[5] === 0x0a && head[6] === 0x1a && head[7] === 0x0a
  ) {
    return "png";
  }
  // WebP: "RIFF" .... "WEBP"
  if (
    head[0] === 0x52 && head[1] === 0x49 && head[2] === 0x46 && head[3] === 0x46 &&
    head[8] === 0x57 && head[9] === 0x45 && head[10] === 0x42 && head[11] === 0x50
  ) {
    return "webp";
  }
  return null;
}

function extFor(kind: "jpeg" | "png" | "webp"): string {
  switch (kind) {
    case "png":
      return "png";
    case "webp":
      return "webp";
    default:
      return "jpg";
  }
}

/**
 * Only real restaurant rows may receive photos. Live ids are Postgres uuids;
 * validating BEFORE the storage path is built guarantees the object key can
 * never contain `/`, `..`, `?` or `#` from a caller-supplied id (the first
 * path segment is always the uploader's own id, so ownership was never at
 * risk — this keeps the path WELL-FORMED on top of that).
 */
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function isValidRestaurantId(id: string): boolean {
  return UUID_RE.test(id);
}

/**
 * Builds the storage object key:
 *   `<auth.uid()>/<restaurantId>/<timestamp>-<rand>.<jpg|png|webp>`
 * — exactly the layout the migration-009 storage policy authorizes
 * (first path segment = auth.uid()). Exported pure for tests.
 */
export function buildStoragePath(
  userId: string,
  restaurantId: string,
  kind: "jpeg" | "png" | "webp",
  now: number = Date.now(),
  rand: string = Math.random().toString(36).slice(2, 10)
): string {
  return `${userId}/${encodeURIComponent(restaurantId)}/${now}-${rand}.${extFor(kind)}`;
}

/** Maps raw database/RLS failures to short, user-safe messages. Exported for tests. */
export function mapPhotoInsertError(err: unknown): { error: string; needsLogin?: boolean } {
  const code = (err as { code?: string } | null)?.code ?? "";
  const message = err instanceof Error ? err.message.toLowerCase() : String(err ?? "").toLowerCase();
  if (code === "42501" || message.includes("row-level security") || message.includes("permission")) {
    return { error: "You can only add photos with your own account. Please log in again.", needsLogin: true };
  }
  if (code === "23503" || message.includes("foreign key")) {
    return { error: "This place isn't available for photo uploads anymore." };
  }
  if (message.includes("jwt") || message.includes("session") || message.includes("not authenticated")) {
    return { error: "Please log in to add a photo.", needsLogin: true };
  }
  if (message.includes("fetch") || message.includes("network") || message.includes("load failed")) {
    return { error: "Can't reach the photo service. Check your connection and try again." };
  }
  return { error: "Couldn't save the photo right now. Please try again in a moment." };
}

/** Maps storage-transfer failures to short, user-safe messages. Exported for tests. */
export function mapStorageError(err: unknown): { error: string } {
  const status = (err as { status?: number } | null)?.status ?? 0;
  const message = err instanceof Error ? err.message.toLowerCase() : String(err ?? "").toLowerCase();
  if (status === 403 || status === 404 || message.includes("bucket")) {
    // Bucket missing or policy not applied — migration-009 not run yet.
    return { error: "Photo storage isn't set up on the server yet. Your photo was not uploaded." };
  }
  if (status === 413 || message.includes("too large") || message.includes("payload")) {
    return { error: "That photo is too large for the server — please choose one under 5 MB." };
  }
  if (status === 401 || message.includes("jwt") || message.includes("expired")) {
    return { error: "Your session expired — please log in again.", };
  }
  if (message.includes("network") || message.includes("load failed")) {
    return { error: "Can't reach the photo service. Check your connection and try again." };
  }
  return { error: "The photo upload failed. Please try again in a moment." };
}

/**
 * Uploads one photo for a food place, end to end:
 *   auth → file validation → storage upload (REAL byte-level progress via
 *   XHR — the progress bar never fakes a fraction) → public URL →
 *   `restaurant_photos` INSERT with truthful licensing metadata.
 *
 * Returns an explicit failure (never a fabricated success) for every error
 * path, including "storage isn't set up yet".
 */
export async function uploadRestaurantPhoto(
  restaurantId: string,
  file: File,
  onProgress?: (fraction: number) => void
): Promise<PhotoUploadResult> {
  const invalid = validatePhotoFile(file);
  if (invalid) return { ok: false, error: invalid };

  // Content check BEFORE any network round-trip: the declared MIME type only
  // mirrors the file extension, so bytes are matched against the real magic
  // numbers. A mislabeled non-image never leaves the browser.
  const kind = await sniffImageKind(file);
  if (!kind) {
    return {
      ok: false,
      error: "That file doesn't look like a real JPG, PNG or WebP photo.",
    };
  }

  if (!isValidRestaurantId(restaurantId)) {
    return { ok: false, error: "This place can't receive photos right now." };
  }

  const sb = getBrowserSupabase();
  if (!sb) {
    return { ok: false, error: AUTH_CONFIG_ERROR };
  }

  // Resolve the REAL authenticated user (token verified server-side).
  let userId: string;
  let accessToken: string;
  try {
    const { data, error } = await sb.auth.getUser();
    if (error || !data?.user) {
      return { ok: false, needsLogin: true, error: "Please log in to add a photo." };
    }
    userId = data.user.id;
    const { data: sessionData } = await sb.auth.getSession();
    const token = sessionData.session?.access_token;
    if (!token) {
      return { ok: false, needsLogin: true, error: "Please log in to add a photo." };
    }
    accessToken = token;
  } catch {
    return { ok: false, needsLogin: true, error: "Please log in to add a photo." };
  }

  // Storage path: the FIRST folder segment is always the uploader's own id —
  // that is exactly what the migration-009 storage policy checks. The id was
  // UUID-validated above and the extension comes from the SNIFFED bytes, so
  // the key is URL-safe by construction.
  const path = buildStoragePath(userId, restaurantId, kind);

  // 1) transfer the bytes (XHR gives REAL upload progress events)
  try {
    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", `${SUPABASE_URL}/storage/v1/object/${PHOTO_BUCKET}/${path}`);
      xhr.setRequestHeader("apikey", SUPABASE_PUBLISHABLE_KEY);
      xhr.setRequestHeader("Authorization", `Bearer ${accessToken}`);
      xhr.setRequestHeader("Content-Type", file.type);
      xhr.setRequestHeader("Cache-Control", "3600");
      xhr.setRequestHeader("x-upsert", "false");
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && onProgress) {
          onProgress(Math.min(1, e.loaded / e.total));
        }
      };
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          const err = new Error(`storage upload failed (${xhr.status})`) as Error & { status?: number };
          err.status = xhr.status;
          reject(err);
        }
      };
      xhr.onerror = () => reject(new Error("network error during upload"));
      xhr.send(file);
    });
  } catch (err) {
    return { ok: false, ...mapStorageError(err) };
  }

  // 2) resolve the public URL for the stored object
  let publicUrl: string | undefined;
  try {
    const { data } = sb.storage.from(PHOTO_BUCKET).getPublicUrl(path);
    publicUrl = data?.publicUrl;
  } catch {
    publicUrl = undefined;
  }
  if (!publicUrl) {
    return { ok: false, error: "The photo uploaded but couldn't be linked — please try again." };
  }

  // 3) record the photo row (RLS enforces uploaded_by = auth.uid()).
  //    source_url stays NULL — a user photo has no external source — and the
  //    licensing fields carry the truthful user-upload markers.
  try {
    const { data, error } = await sb
      .from("restaurant_photos")
      .insert({
        restaurant_id: restaurantId,
        image_url: publicUrl,
        uploaded_by: userId, // resolved from the validated session — never client input
        license: USER_UPLOAD_LICENSE,
        attribution: USER_UPLOAD_ATTRIBUTION,
      })
      .select("id,restaurant_id,image_url,uploaded_by,created_at")
      .single();
    if (error) return { ok: false, ...mapPhotoInsertError(error) };
    return { ok: true, photo: data as UploadedPhotoRow };
  } catch (err) {
    return { ok: false, ...mapPhotoInsertError(err) };
  }
}
