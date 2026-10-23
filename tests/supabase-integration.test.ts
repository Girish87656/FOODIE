/// <reference types="bun-types" />
/**
 * Unit tests for the Supabase integration surface — the pure logic that
 * keeps every read honestly labelled and every failure honestly classified.
 *
 * Scope (all server-side pure functions — NO database is contacted, NO
 * migrations are executed, NO production data is touched):
 *   1. Environment configuration — missing variables, legacy-key fallback,
 *      publishable-key precedence, malformed URL, too-short key.
 *   2. Invalid IDs — uuid validation gating every real-table query, demo
 *      id tagging/untagging.
 *   3. Error classification — RLS/permission refusals, missing-table
 *      (migration-008 pending), timeouts, generic server errors, and the
 *      honest-notice mapping for both fallback contexts.
 *   4. Empty / unknown results — row mappers' NULL-safety, unknown place
 *      types, unknown verification statuses, honest notices that never
 *      claim data that is not being shown.
 *
 * The full network flow (real Supabase queries, RLS behaviour on live
 * policies, storage uploads) needs the owner's configured project and is
 * exercised by the manual verification steps — never faked here.
 *
 * Run: bun test tests/supabase-integration.test.ts
 */

import { describe, expect, test } from "bun:test";

import {
  looksLikePublicKey,
  looksLikeSupabaseUrl,
  resolveSupabaseEnv,
} from "../src/lib/supabase/config";
import {
  SupabaseQueryTimeoutError,
  QUERY_TIMEOUT_MS,
  classifySupabaseError,
  isMissingPlacesTable,
  withQueryTimeout,
} from "../src/lib/foodie/data/serverRepository";
import {
  DEMO_ID_PREFIX,
  fromDemoId,
  isUuid,
  parseVerificationStatus,
  placeRowToPointOfInterest,
  restaurantRowToPlace,
  toDemoId,
} from "../src/lib/foodie/data/mappers";
import { mapPhotoInsertError, mapStorageError } from "../src/lib/foodie/data/photos";
import type { PhotoRecord } from "../src/lib/foodie/data/mappers";
import type { RestaurantRow, PlaceRow } from "../src/lib/foodie/data/types";
import {
  DEMO_MODE_NOTICE,
  PLACES_TABLE_NOT_READY_NOTICE,
  REVIEW_TEXT_MAX_LENGTH,
  REVIEW_TEXT_MIN_LENGTH,
  SUPABASE_ERROR_NOTICE,
  SUPABASE_PERMISSION_NOTICE,
  SUPABASE_TIMEOUT_NOTICE,
  SUPABASE_UNAVAILABLE_NOTICE,
} from "../src/lib/foodie/data/types";
import { mapReviewError } from "../src/lib/foodie/data/reviews";
import { validateReviewInput } from "../src/lib/foodie/data/reviews";

/* ------------------------------------------------------------------ */
/* 1. Environment configuration — missing vars never fake a connection */
/* ------------------------------------------------------------------ */

describe("supabase env configuration", () => {
  test("missing env vars → configured:false (demo mode, never a fake connection)", () => {
    const resolved = resolveSupabaseEnv({});
    expect(resolved.url).toBe("");
    expect(resolved.publishableKey).toBe("");
    expect(resolved.configured).toBe(false);
  });

  test("empty-string env vars behave exactly like missing ones", () => {
    expect(resolveSupabaseEnv({ url: "", publishableKey: "" }).configured).toBe(false);
    expect(resolveSupabaseEnv({ url: "   ", publishableKey: "   " }).configured).toBe(false);
  });

  test("a URL without a key is not configured (and vice versa)", () => {
    expect(
      resolveSupabaseEnv({ url: "https://ref.supabase.co", publishableKey: "" }).configured
    ).toBe(false);
    expect(
      resolveSupabaseEnv({ url: "", publishableKey: "x".repeat(40) }).configured
    ).toBe(false);
  });

  test("legacy NEXT_PUBLIC_SUPABASE_ANON_KEY still resolves", () => {
    const resolved = resolveSupabaseEnv({
      url: "https://ref.supabase.co",
      legacyAnonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.legacy.anon",
    });
    expect(resolved.configured).toBe(true);
    expect(resolved.publishableKey).toBe("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.legacy.anon");
  });

  test("publishable naming wins over the legacy anon key", () => {
    const resolved = resolveSupabaseEnv({
      url: "https://ref.supabase.co",
      publishableKey: "sb_publishable_abcdefghijklmnopqrstuvwxyz123456",
      legacyAnonKey: "legacy-key-that-is-long-enough-to-pass-the-shape-check",
    });
    expect(resolved.configured).toBe(true);
    expect(resolved.publishableKey.startsWith("sb_publishable_")).toBe(true);
  });

  test("malformed URLs are rejected (not a Supabase project URL)", () => {
    expect(looksLikeSupabaseUrl("not-a-url")).toBe(false);
    expect(looksLikeSupabaseUrl("ftp://ref.supabase.co")).toBe(false);
    expect(looksLikeSupabaseUrl("")).toBe(false);
    expect(looksLikeSupabaseUrl("https://ref.supabase.co")).toBe(true);
    expect(looksLikeSupabaseUrl("http://localhost:54321")).toBe(true); // local dev stack
  });

  test("keys shorter than 30 chars are treated as not-set-up", () => {
    expect(looksLikePublicKey("short")).toBe(false);
    expect(looksLikePublicKey("x".repeat(29))).toBe(false);
    expect(looksLikePublicKey("x".repeat(30))).toBe(true);
  });

  test("whitespace is trimmed before validation", () => {
    const resolved = resolveSupabaseEnv({
      url: "  https://ref.supabase.co  ",
      publishableKey: "   " + "x".repeat(40) + "   ",
    });
    expect(resolved.configured).toBe(true);
    expect(resolved.url).toBe("https://ref.supabase.co");
  });
});

/* ------------------------------------------------------------------ */
/* 2. Invalid IDs — demo/uuid separation on every query path           */
/* ------------------------------------------------------------------ */

const REAL_UUID = "123e4567-e89b-12d3-a456-426614174000";

describe("id validation", () => {
  test("valid uuids pass", () => {
    expect(isUuid(REAL_UUID)).toBe(true);
    expect(isUuid(REAL_UUID.toUpperCase())).toBe(true);
  });

  test("invalid IDs are rejected — demo ids, empty strings, malformations", () => {
    expect(isUuid("")).toBe(false);
    expect(isUuid(`${DEMO_ID_PREFIX}gitam-campus-cafe`)).toBe(false);
    expect(isUuid("gitam-campus-cafe")).toBe(false);
    expect(isUuid("123e4567e89b12d3a456426614174000")).toBe(false); // no dashes
    expect(isUuid("123e4567-e89b-12d3-a456-42661417400g")).toBe(false); // hex typo
    expect(isUuid("../../etc/passwd")).toBe(false);
  });

  test("demo ids round-trip through the prefix and never collide with uuids", () => {
    const tagged = toDemoId("gitam-campus-cafe");
    expect(tagged.startsWith(DEMO_ID_PREFIX)).toBe(true);
    expect(fromDemoId(tagged)).toBe("gitam-campus-cafe");
    expect(fromDemoId(REAL_UUID)).toBe(REAL_UUID); // untouched real id
    expect(isUuid(tagged)).toBe(false); // demo ids can never pass the uuid gate
  });
});

/* ------------------------------------------------------------------ */
/* 3. Error classification — RLS, missing table, timeout, server error */
/* ------------------------------------------------------------------ */

describe("supabase error classification", () => {
  test("the server-side time budget is finite (a hung query cannot hang the API)", () => {
    expect(QUERY_TIMEOUT_MS).toBeGreaterThan(0);
    expect(QUERY_TIMEOUT_MS).toBeLessThan(60_000);
  });

  test("withQueryTimeout passes a fast result through unchanged", async () => {
    const result = await withQueryTimeout(Promise.resolve("ok"));
    expect(result).toBe("ok");
  });

  test("withQueryTimeout propagates the underlying rejection", async () => {
    await expect(
      withQueryTimeout(Promise.reject(new Error("postgres boom")))
    ).rejects.toThrow("postgres boom");
  });

  test("our own timeout error classifies as timeout", () => {
    expect(classifySupabaseError(new SupabaseQueryTimeoutError())).toBe("timeout");
  });

  test("RLS / permission refusals are recognized (code and message shapes)", () => {
    expect(classifySupabaseError({ code: "42501" })).toBe("permission");
    expect(classifySupabaseError({ code: "PGRST301" })).toBe("permission");
    expect(classifySupabaseError(new Error("new row violates row-level security policy"))).toBe(
      "permission"
    );
    expect(classifySupabaseError(new Error("permission denied for table restaurants"))).toBe(
      "permission"
    );
    expect(classifySupabaseError(new Error("insufficient_privilege"))).toBe("permission");
  });

  test("missing-table (migration-008 pending) matches all real PostgREST shapes", () => {
    expect(
      classifySupabaseError(
        new Error("Could not find the table 'public.places' in the schema cache")
      )
    ).toBe("missing-table");
    expect(classifySupabaseError(new Error('relation "public.places" does not exist'))).toBe(
      "missing-table"
    );
    expect(classifySupabaseError(new Error("schema cache error"))).toBe("missing-table");
    expect(isMissingPlacesTable({ code: "PGRST205" })).toBe(false); // code alone is not enough
  });

  test("timeout-flavoured messages classify as timeout, generic failures as server-error", () => {
    expect(classifySupabaseError(new Error("operation was aborted"))).toBe("timeout");
    expect(classifySupabaseError(new Error("request timed out"))).toBe("timeout");
    expect(classifySupabaseError(new Error("duplicate key value violates unique constraint"))).toBe(
      "server-error"
    );
    expect(classifySupabaseError(new Error("fetch failed"))).toBe("server-error");
    expect(classifySupabaseError(null)).toBe("server-error");
    expect(classifySupabaseError(undefined)).toBe("server-error");
    expect(classifySupabaseError("string error")).toBe("server-error");
  });

  test("permission beats missing-table when both appear (RLS is checked first)", () => {
    expect(
      classifySupabaseError(new Error("permission denied: relation does not exist"))
    ).toBe("permission");
  });
});

/* ------------------------------------------------------------------ */
/* 4. Honest notices — the labelling contract                          */
/* ------------------------------------------------------------------ */

describe("honest notice strings", () => {
  test("demo-fallback notice DOES say demo data is being shown (restaurant feeds)", () => {
    expect(SUPABASE_ERROR_NOTICE).toContain("demo data is being shown");
  });

  test("honest-empty notices NEVER claim demo data (nothing is substituted there)", () => {
    expect(SUPABASE_UNAVAILABLE_NOTICE).not.toContain("demo data is being shown");
    expect(SUPABASE_TIMEOUT_NOTICE).not.toContain("demo data is being shown");
    expect(SUPABASE_PERMISSION_NOTICE).not.toContain("demo data is being shown");
    expect(SUPABASE_UNAVAILABLE_NOTICE).toContain("nothing was substituted");
  });

  test("every notice is a non-empty user-readable sentence", () => {
    for (const notice of [
      DEMO_MODE_NOTICE,
      SUPABASE_ERROR_NOTICE,
      SUPABASE_UNAVAILABLE_NOTICE,
      SUPABASE_TIMEOUT_NOTICE,
      SUPABASE_PERMISSION_NOTICE,
      PLACES_TABLE_NOT_READY_NOTICE,
    ]) {
      expect(notice.length).toBeGreaterThan(20);
      expect(notice).not.toMatch(/error code|PGRST|42501|stack/i);
    }
  });

  test("places-not-ready notice states the honest no-guessing behaviour", () => {
    expect(PLACES_TABLE_NOT_READY_NOTICE).toContain("nothing is shown rather than guessed");
  });
});

/* ------------------------------------------------------------------ */
/* 5. RLS write-path error mapping (reviews / photos)                  */
/* ------------------------------------------------------------------ */

describe("RLS error mapping — reviews", () => {
  test("42501 / row-level security → friendly message + needsLogin", () => {
    const byCode = mapReviewError({ code: "42501" });
    expect(byCode.needsLogin).toBe(true);
    expect(byCode.error).toContain("log in");

    const byMessage = mapReviewError(new Error("new row violates row-level security policy"));
    expect(byMessage.needsLogin).toBe(true);
  });

  test("duplicate review (23505) → edit-or-delete guidance, no login claim", () => {
    const result = mapReviewError({ code: "23505" });
    expect(result.error).toContain("already reviewed");
    expect(result.needsLogin).toBeUndefined();
  });

  test("check violation (23514) → validation guidance", () => {
    expect(mapReviewError({ code: "23514" }).error).toContain("isn't valid");
  });

  test("network failures → retry guidance, never a fake success", () => {
    expect(mapReviewError(new Error("fetch failed")).error).toContain("try again");
  });

  test("unknown failures get a generic safe message (raw SQL never surfaces)", () => {
    const result = mapReviewError(new Error('column "weird" of relation "reviews" does not exist'));
    expect(result.error).not.toContain("weird");
    expect(result.error).not.toContain("relation");
  });

  test("review input validation bounds match the DB CHECK", () => {
    expect("error" in validateReviewInput(0, "x")).toBe(true);
    expect("error" in validateReviewInput(6, "x")).toBe(true);
    expect("error" in validateReviewInput(5, "   ")).toBe(true);
    expect("error" in validateReviewInput(5, "a".repeat(REVIEW_TEXT_MAX_LENGTH + 1))).toBe(true);
    const ok = validateReviewInput(4, "a".repeat(REVIEW_TEXT_MIN_LENGTH));
    expect(!("error" in ok) && ok.rating).toBe(4);
  });
});

describe("RLS error mapping — photos", () => {
  test("storage 403/404 → migration-009 not applied message (no upload claimed)", () => {
    const result = mapStorageError({ status: 403 });
    expect(result.error).toContain("isn't set up on the server yet");
    expect(result.needsLogin).toBeUndefined();
  });

  test("photo insert RLS refusal → needsLogin", () => {
    expect(mapPhotoInsertError({ code: "42501" }).needsLogin).toBe(true);
  });

  test("foreign key (23503) → place unavailable, no retry loop", () => {
    expect(mapPhotoInsertError({ code: "23503" }).error).toContain("isn't available");
  });

  test("oversize payload (413) → size guidance", () => {
    expect(mapStorageError({ status: 413 }).error).toContain("5 MB");
  });
});

/* ------------------------------------------------------------------ */
/* 6. Row mappers — NULL-safety, unknown values, honest empty results  */
/* ------------------------------------------------------------------ */

function minimalRestaurantRow(overrides: Partial<RestaurantRow> = {}): RestaurantRow {
  return {
    id: REAL_UUID,
    name: "Real Restaurant",
    description: null,
    category: "restaurant",
    address: "1 Real Street",
    city: "Tirupati",
    latitude: null,
    longitude: null,
    rating: 4.2,
    price_level: null,
    opening_hours: null,
    phone: null,
    website: null,
    is_hidden_gem: false,
    is_local_favorite: false,
    created_at: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

describe("restaurantRowToPlace NULL-safety", () => {
  test("NULL coordinates / price / hours / phone stay unknown — never guessed", () => {
    const place = restaurantRowToPlace(minimalRestaurantRow());
    expect(place.latitude).toBeUndefined();
    expect(place.longitude).toBeUndefined();
    expect(place.priceRange).toBeUndefined();
    expect(place.costForTwo).toBeUndefined();
    expect(place.openingHours).toBeUndefined();
    expect(place.phone).toBeUndefined();
    expect(place.verificationStatus).toBeUndefined(); // missing column ≠ verified
  });

  test("a NULL verification_status never renders as verified", () => {
    const place = restaurantRowToPlace(minimalRestaurantRow({ verification_status: undefined }));
    expect(place.badges.verified).toBe(false);
  });

  test("community aggregates stay separate from the listed rating", () => {
    const place = restaurantRowToPlace(
      minimalRestaurantRow({ review_count: 0, community_rating: null })
    );
    expect(place.reviewCount).toBe(0); // real zero preserved
    expect(place.communityRating).toBeUndefined(); // NULL stays unknown
    expect(place.rating).toBe(4.2); // listed rating untouched
  });

  test("photos without licensing metadata carry NO invented attribution", () => {
    const place = restaurantRowToPlace(minimalRestaurantRow(), [], [
      { image_url: "https://example.com/a.jpg" } as PhotoRecord,
    ]);
    expect(place.photos).toEqual(["https://example.com/a.jpg"]);
    expect(place.photoCredits).toBeUndefined();
  });

  test("photos WITH licensing metadata keep their credits intact", () => {
    const place = restaurantRowToPlace(minimalRestaurantRow(), [], [
      {
        image_url: "https://example.com/b.jpg",
        license: "CC BY-SA 4.0",
        attribution: "Photographer Name",
        source_url: "https://commons.example.org/b.jpg",
      } as PhotoRecord,
    ]);
    expect(place.photoCredits).toEqual([
      {
        url: "https://example.com/b.jpg",
        license: "CC BY-SA 4.0",
        attribution: "Photographer Name",
        sourceUrl: "https://commons.example.org/b.jpg",
      },
    ]);
  });
});

describe("placeRowToPointOfInterest — public.places mapping", () => {
  function minimalPlaceRow(overrides: Partial<PlaceRow> = {}): PlaceRow {
    return {
      id: "596b875e-23d5-5458-95e6-1e60e9b0f2af",
      slug: "marasa-sarovar-premiere",
      place_type: "hotel",
      name: "Marasa Sarovar Premiere",
      description: null,
      address: null,
      locality: null,
      city: "Tirupati",
      destination_id: null,
      latitude: null,
      longitude: null,
      tags: [],
      source: "p4-research-import",
      source_url: "https://www.sarovarhotels.com/marasa-sarovar-premiere-tirupati-hotels",
      last_verified_at: null,
      name_verified: null,
      address_verified: null,
      coordinates_verified: null,
      verification_status: "unverified",
      is_active: true,
      created_at: "2026-01-01T00:00:00Z",
      ...overrides,
    };
  }

  test("import defaults survive the mapping (unverified, tri-states NULL)", () => {
    const poi = placeRowToPointOfInterest(minimalPlaceRow());
    expect(poi.verificationStatus).toBe("unverified");
    expect(poi.nameVerified).toBeNull();
    expect(poi.addressVerified).toBeNull();
    expect(poi.coordinatesVerified).toBeNull();
    expect(poi.lastVerifiedAt).toBeNull();
    expect(poi.latitude).toBeNull();
    expect(poi.longitude).toBeNull();
  });

  test("an unexpected place_type falls back to 'other', never an invented label", () => {
    const poi = placeRowToPointOfInterest(minimalPlaceRow({ place_type: "palace" }));
    expect(poi.placeType).toBe("other");
  });

  test("an unexpected verification_status falls back to 'unverified', never 'verified'", () => {
    const poi = placeRowToPointOfInterest(
      minimalPlaceRow({ verification_status: "definitely-real" })
    );
    expect(poi.verificationStatus).toBe("unverified");
  });

  test("empty/NULL tags map to an empty array, never a crash", () => {
    expect(placeRowToPointOfInterest(minimalPlaceRow({ tags: null })).tags).toEqual([]);
  });
});

describe("verification status parsing", () => {
  test("only the DB CHECK union values parse; anything else is unknown", () => {
    expect(parseVerificationStatus("verified")).toBe("verified");
    expect(parseVerificationStatus("community_submitted")).toBe("community_submitted");
    expect(parseVerificationStatus("unverified")).toBe("unverified");
    expect(parseVerificationStatus("closed")).toBe("closed");
    expect(parseVerificationStatus("trusted")).toBeUndefined();
    expect(parseVerificationStatus("")).toBeUndefined();
    expect(parseVerificationStatus(null)).toBeUndefined();
    expect(parseVerificationStatus(undefined)).toBeUndefined();
  });
});
