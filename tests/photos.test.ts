/// <reference types="bun-types" />
/**
 * Unit tests for the photo WRITE layer (src/lib/foodie/data/photos.ts).
 *
 * Scope: the pure security/validation helpers that guard every upload —
 * file validation, magic-byte content sniffing, restaurant-id validation,
 * storage-path construction, and the user-safe error mappers.
 * (The full network flow needs a live Supabase project and is exercised by
 * the owner's manual verification after migration-009 — never faked here.)
 *
 * Run: bun test tests/photos.test.ts
 */

import { describe, expect, test } from "bun:test";

import {
  PHOTO_ALLOWED_TYPES,
  PHOTO_BUCKET,
  PHOTO_MAX_BYTES,
  USER_UPLOAD_ATTRIBUTION,
  USER_UPLOAD_LICENSE,
  buildStoragePath,
  isValidRestaurantId,
  mapPhotoInsertError,
  mapStorageError,
  sniffImageKind,
  uploadRestaurantPhoto,
  validatePhotoFile,
} from "../src/lib/foodie/data/photos";

/* ------------------------------------------------------------------ */
/* helpers                                                             */
/* ------------------------------------------------------------------ */

function fakeFile(
  bytes: number[] | Uint8Array,
  type: string,
  sizeOverride?: number
): File {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  const f = new File([arr as unknown as BlobPart], "photo", { type });
  if (sizeOverride !== undefined) {
    Object.defineProperty(f, "size", { value: sizeOverride });
  }
  return f;
}

const JPEG_HEAD = [0xff, 0xd8, 0xff, 0xe0, 0, 0, 0x4a, 0x46, 0x49, 0x46, 0, 0x01];
const PNG_HEAD = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0];
const WEBP_HEAD = [0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50];
const GIF_HEAD = [0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0, 0, 0, 0, 0, 0];
const HTML_AS_JPG = Array.from(new TextEncoder().encode("<html><body>hi</body>")).concat(
  new Array(12).fill(0)
);

/* ------------------------------------------------------------------ */
/* validatePhotoFile                                                   */
/* ------------------------------------------------------------------ */

describe("validatePhotoFile", () => {
  test("accepts the three allowed image types", () => {
    for (const type of PHOTO_ALLOWED_TYPES) {
      expect(validatePhotoFile(fakeFile(JPEG_HEAD, type))).toBeNull();
    }
  });

  test("rejects disallowed MIME types (incl. SVG and PDF)", () => {
    expect(validatePhotoFile(fakeFile(JPEG_HEAD, "image/svg+xml"))).toMatch(/JPG, PNG or WebP/);
    expect(validatePhotoFile(fakeFile(JPEG_HEAD, "application/pdf"))).toMatch(/JPG, PNG or WebP/);
    expect(validatePhotoFile(fakeFile(JPEG_HEAD, ""))).toMatch(/JPG, PNG or WebP/);
  });

  test("rejects empty files", () => {
    expect(validatePhotoFile(fakeFile(JPEG_HEAD, "image/jpeg", 0))).toMatch(/empty/);
  });

  test("rejects files over 5 MB", () => {
    expect(
      validatePhotoFile(fakeFile(JPEG_HEAD, "image/jpeg", PHOTO_MAX_BYTES + 1))
    ).toMatch(/5 MB/);
  });

  test("accepts a file at exactly the 5 MB limit", () => {
    expect(validatePhotoFile(fakeFile(JPEG_HEAD, "image/jpeg", PHOTO_MAX_BYTES))).toBeNull();
  });
});

/* ------------------------------------------------------------------ */
/* sniffImageKind                                                      */
/* ------------------------------------------------------------------ */

describe("sniffImageKind", () => {
  test("detects real JPEG bytes", async () => {
    expect(await sniffImageKind(new Blob([new Uint8Array(JPEG_HEAD)]))).toBe("jpeg");
  });

  test("detects real PNG bytes", async () => {
    expect(await sniffImageKind(new Blob([new Uint8Array(PNG_HEAD)]))).toBe("png");
  });

  test("detects real WebP bytes", async () => {
    expect(await sniffImageKind(new Blob([new Uint8Array(WEBP_HEAD)]))).toBe("webp");
  });

  test("rejects a GIF (not in the allowlist)", async () => {
    expect(await sniffImageKind(new Blob([new Uint8Array(GIF_HEAD)]))).toBeNull();
  });

  test("rejects HTML/text bytes renamed to .jpg", async () => {
    expect(await sniffImageKind(new Blob([new Uint8Array(HTML_AS_JPG)]))).toBeNull();
  });

  test("rejects buffers shorter than 12 bytes", async () => {
    expect(await sniffImageKind(new Blob([new Uint8Array([0xff, 0xd8, 0xff])]))).toBeNull();
  });
});

/* ------------------------------------------------------------------ */
/* isValidRestaurantId                                                 */
/* ------------------------------------------------------------------ */

describe("isValidRestaurantId", () => {
  test("accepts canonical lowercase uuids", () => {
    expect(isValidRestaurantId("123e4567-e89b-12d3-a456-426614174000")).toBe(true);
  });

  test("accepts uppercase uuids (Postgres accepts them too)", () => {
    expect(isValidRestaurantId("123E4567-E89B-12D3-A456-426614174000")).toBe(true);
  });

  test("rejects demo-mode ids", () => {
    expect(isValidRestaurantId("demo:rest-1")).toBe(false);
  });

  test("rejects path-traversal and url-special payloads", () => {
    expect(isValidRestaurantId("../../evil")).toBe(false);
    expect(isValidRestaurantId("abc/def")).toBe(false);
    expect(isValidRestaurantId("abc?query=1")).toBe(false);
    expect(isValidRestaurantId("abc#frag")).toBe(false);
    expect(isValidRestaurantId("")).toBe(false);
  });

  test("rejects near-uuid strings with wrong shapes", () => {
    expect(isValidRestaurantId("123e4567e89b12d3a456426614174000")).toBe(false);
    expect(isValidRestaurantId("123e4567-e89b-12d3-a456-42661417400g")).toBe(false);
    expect(isValidRestaurantId("123e4567-e89b-12d3-a456-42661417400")).toBe(false);
  });
});

/* ------------------------------------------------------------------ */
/* buildStoragePath                                                    */
/* ------------------------------------------------------------------ */

describe("buildStoragePath", () => {
  const uid = "11111111-2222-3333-4444-555555555555";
  const rid = "123e4567-e89b-12d3-a456-426614174000";

  test("first segment is always the uploader's own id (the policy check)", () => {
    for (const kind of ["jpeg", "png", "webp"] as const) {
      expect(buildStoragePath(uid, rid, kind).split("/")[0]).toBe(uid);
    }
  });

  test("second segment is the (url-encoded) restaurant id", () => {
    expect(buildStoragePath(uid, rid, "jpeg").split("/")[1]).toBe(rid);
  });

  test("extension follows the sniffed kind", () => {
    expect(buildStoragePath(uid, rid, "jpeg").endsWith(".jpg")).toBe(true);
    expect(buildStoragePath(uid, rid, "png").endsWith(".png")).toBe(true);
    expect(buildStoragePath(uid, rid, "webp").endsWith(".webp")).toBe(true);
  });

  test("uses the provided timestamp + randomness", () => {
    const p = buildStoragePath(uid, rid, "jpeg", 1700000000000, "ab12cd34");
    expect(p).toBe(`${uid}/${rid}/1700000000000-ab12cd34.jpg`);
  });

  test("no segment of the path can escape the uploader folder", () => {
    // Even for a hostile (already uuid-rejected upstream) id, encoding
    // removes any `/` that could add path segments.
    const hostile = "123e4567-e89b-12d3-a456-426614174000/../../victim";
    const p = buildStoragePath(uid, hostile, "jpeg");
    expect(p.split("/")).toHaveLength(3);
    expect(p.split("/")[0]).toBe(uid);
  });

  test("encoding is the IDENTITY transform for real uuids (policy compatibility)", () => {
    // The migration-009 policy compares the first folder literally against
    // auth.uid()::text — so the encoding must NOT alter a real uuid.
    const p = buildStoragePath(uid, rid, "webp", 1700000000000, "zz");
    expect(p).toBe(`${uid}/${rid}/1700000000000-zz.webp`);
    expect(p.split("/")[0]).toBe(uid);
  });

  test("even a hostile userId cannot escape the uploader folder", () => {
    // Defense-in-depth: userId comes from auth.getUser() (a real uuid), but
    // the path stays 3-segment with NO raw traversal segment for ANY input —
    // a hostile id is percent-encoded into a single harmless folder name.
    const hostile = "../../victim/steal";
    const p = buildStoragePath(hostile, rid, "jpeg");
    expect(p.split("/")).toHaveLength(3);
    expect(p.split("/")[0]).toBe(encodeURIComponent(hostile));
    expect(p.split("/").every((seg) => seg !== "..")).toBe(true);
    expect(p).not.toContain("victim/");
  });
});

/* ------------------------------------------------------------------ */
/* client/migration-009 contract constants                             */
/* ------------------------------------------------------------------ */

describe("client contract constants", () => {
  test("bucket name matches the migration-009 candidate exactly", () => {
    expect(PHOTO_BUCKET).toBe("restaurant-photos");
  });

  test("user uploads carry a truthful, non-empty licensing record", () => {
    // migration-006 columns: license + attribution are written on every
    // user upload — the credit overlay renders from these stored values.
    expect(USER_UPLOAD_LICENSE).toBe("user-upload");
    expect(USER_UPLOAD_ATTRIBUTION.length).toBeGreaterThan(0);
    expect(USER_UPLOAD_ATTRIBUTION).toBe("Foodie community photo");
  });

  test("client size/mime limits mirror the bucket config byte-for-byte", () => {
    expect(PHOTO_MAX_BYTES).toBe(5242880); // migration-009 file_size_limit
    const allowed: string[] = [...PHOTO_ALLOWED_TYPES].sort();
    expect(allowed).toEqual(
      ["image/jpeg", "image/png", "image/webp"].sort() // migration-009 allowed_mime_types
    );
  });
});

/* ------------------------------------------------------------------ */
/* uploadRestaurantPhoto — network-free early returns                  */
/* ------------------------------------------------------------------ */

describe("uploadRestaurantPhoto early returns (no network, no Supabase client)", () => {
  test("rejects an HTML payload renamed to .jpg BEFORE any network call", async () => {
    const f = fakeFile(HTML_AS_JPG, "image/jpeg");
    const res = await uploadRestaurantPhoto("123e4567-e89b-12d3-a456-426614174000", f);
    expect(res.ok).toBe(false);
    expect(res.error).toMatch(/doesn't look like a real JPG, PNG or WebP/);
  });

  test("rejects a non-uuid restaurant id BEFORE any network call", async () => {
    const res = await uploadRestaurantPhoto("demo:rest-1", fakeFile(JPEG_HEAD, "image/jpeg"));
    expect(res.ok).toBe(false);
    expect(res.error).toMatch(/can't receive photos/);
  });

  test("rejects a path-traversal restaurant id BEFORE any network call", async () => {
    const res = await uploadRestaurantPhoto("../../evil", fakeFile(JPEG_HEAD, "image/jpeg"));
    expect(res.ok).toBe(false);
    expect(res.error).toMatch(/can't receive photos/);
  });

  test("validation failures never claim success and never return a photo", async () => {
    const res = await uploadRestaurantPhoto("nope", fakeFile(GIF_HEAD, "image/gif"));
    expect(res.ok).toBe(false);
    expect(res.photo).toBeUndefined();
    expect(res.error).toBeTruthy();
  });
});

/* ------------------------------------------------------------------ */
/* mapPhotoInsertError                                                 */
/* ------------------------------------------------------------------ */

describe("mapPhotoInsertError", () => {
  test("RLS violation (42501) → needsLogin", () => {
    const r = mapPhotoInsertError({ code: "42501", message: "new row violates row-level security" });
    expect(r.needsLogin).toBe(true);
    expect(r.error).toMatch(/own account/);
  });

  test("FK violation (23503) → place-gone message, no login prompt", () => {
    const r = mapPhotoInsertError({ code: "23503", message: "foreign key constraint" });
    expect(r.needsLogin).toBeUndefined();
    expect(r.error).toMatch(/isn't available/);
  });

  test("JWT/session failure → needsLogin", () => {
    expect(mapPhotoInsertError(new Error("JWT expired")).needsLogin).toBe(true);
  });

  test("network failure → connection message", () => {
    expect(mapPhotoInsertError(new Error("fetch failed")).error).toMatch(/reach the photo service/);
  });

  test("unknown failure → generic retry message (no raw details)", () => {
    const r = mapPhotoInsertError(new Error("some internal pg detail xyz"));
    expect(r.error).toMatch(/try again/);
    expect(r.error).not.toMatch(/pg/);
  });
});

/* ------------------------------------------------------------------ */
/* mapStorageError                                                     */
/* ------------------------------------------------------------------ */

describe("mapStorageError", () => {
  test("403/404 → honest bucket-not-set-up message", () => {
    for (const status of [403, 404]) {
      const err = Object.assign(new Error(`storage upload failed (${status})`), { status });
      expect(mapStorageError(err).error).toMatch(/isn't set up on the server yet/);
    }
  });

  test("413 → too-large message", () => {
    const err = Object.assign(new Error("storage upload failed (413)"), { status: 413 });
    expect(mapStorageError(err).error).toMatch(/too large/);
  });

  test("401 → session-expired message + needsLogin (UI prompts re-login)", () => {
    const err = Object.assign(new Error("storage upload failed (401)"), { status: 401 });
    const r = mapStorageError(err);
    expect(r.error).toMatch(/session expired/i);
    expect(r.needsLogin).toBe(true);
  });

  test("403/404 bucket case does NOT ask for re-login (it's a setup issue)", () => {
    const err = Object.assign(new Error("storage upload failed (404)"), { status: 404 });
    expect(mapStorageError(err).needsLogin).toBeUndefined();
  });

  test("network failure → connection message", () => {
    expect(mapStorageError(new Error("network error during upload")).error).toMatch(
      /reach the photo service/
    );
  });

  test("unknown failure → generic retry message", () => {
    expect(mapStorageError(new Error("storage upload failed (500)")).error).toMatch(/try again/);
  });
});
