import { describe, expect, test } from "bun:test";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { PLACE_CATEGORIES, POI_PLACE_TYPES } from "../src/lib/foodie/constants";
import {
  REPRESENTATIVE_IMAGES,
  REPRESENTATIVE_LICENSE,
  representativeImageFor,
} from "../src/data/representative-images";
import { responsiveSrcSet } from "../src/lib/foodie/categoryImages";

/**
 * Prototype 4.1 image-integrity gate for the REPRESENTATIVE category-image
 * registry (AI-generated illustrations).
 *
 * The UI renders these as premium fallback imagery WITH a visible
 * "AI-generated" chip — so the registry itself must stay perfect:
 *   • it covers EVERY real food category and place type (no gaps, no
 *     stray keys — drift in PLACE_CATEGORIES / POI_PLACE_TYPES breaks
 *     these tests, keeping taxonomy and imagery locked together);
 *   • every image is unique — never reused across unrelated categories;
 *   • every entry ships as a bundled asset (master + `-small` sibling,
 *     because `responsiveSrcSet` references the sibling);
 *   • every alt text is HONEST — it says "Representative", "AI-generated"
 *     and "not the actual venue", so no render can silently impersonate
 *     a real venue photo.
 */

const PUBLIC_DIR = join(import.meta.dir, "..", "public");

describe("representative category-image registry integrity", () => {
  const entries = Object.entries(REPRESENTATIVE_IMAGES);

  test("covers EVERY food category id (food:<id>)", () => {
    for (const category of PLACE_CATEGORIES) {
      const img = REPRESENTATIVE_IMAGES[`food:${category.id}`];
      expect(img).toBeDefined();
      expect(img!.src.endsWith(".webp")).toBe(true);
    }
  });

  test("covers EVERY place-type id (poi:<id>)", () => {
    for (const type of POI_PLACE_TYPES) {
      expect(REPRESENTATIVE_IMAGES[`poi:${type.id}`]).toBeDefined();
    }
  });

  test("registry size exactly matches the taxonomy (no stray keys)", () => {
    expect(entries.length).toBe(PLACE_CATEGORIES.length + POI_PLACE_TYPES.length);
  });

  test("every image is UNIQUE — never reused across unrelated categories", () => {
    const srcs = entries.map(([, img]) => img.src);
    expect(new Set(srcs).size).toBe(srcs.length);
  });

  test("every entry ships master + -small under /images/representative/", () => {
    for (const [, img] of entries) {
      expect(img.src.startsWith("/images/representative/")).toBe(true);
      expect(existsSync(join(PUBLIC_DIR, img.src))).toBe(true);
      const small = img.src.replace(".webp", "-small.webp");
      expect(existsSync(join(PUBLIC_DIR, small))).toBe(true);
    }
  });

  test("srcset resolves for every entry and every candidate exists on disk", () => {
    for (const [, img] of entries) {
      const srcSet = responsiveSrcSet(img.src);
      expect(srcSet).not.toBeNull();
      expect(srcSet!).toContain("320w");
      for (const candidate of srcSet!.split(", ")) {
        expect(existsSync(join(PUBLIC_DIR, candidate.split(" ")[0]))).toBe(true);
      }
    }
  });

  test("every alt text is honest (Representative + AI-generated + not the actual venue)", () => {
    for (const [, img] of entries) {
      expect(img.alt.startsWith("Representative image")).toBe(true);
      expect(img.alt).toContain("AI-generated");
      expect(img.alt).toContain("not the actual venue");
      expect(img.alt.length).toBeGreaterThan(30);
    }
  });

  test("license constant claims in-house generation only (no third-party rights)", () => {
    expect(REPRESENTATIVE_LICENSE).toBe("AI-generated (in-house)");
  });

  test("resolver hits registry keys and returns null for unknown / cross-kind ids", () => {
    expect(representativeImageFor("food", "cafe")).toBe(REPRESENTATIVE_IMAGES["food:cafe"]);
    expect(representativeImageFor("poi", "temple")).toBe(REPRESENTATIVE_IMAGES["poi:temple"]);
    expect(representativeImageFor("food", "not-a-category")).toBeNull();
    expect(representativeImageFor("food", null)).toBeNull();
    expect(representativeImageFor("food", undefined)).toBeNull();
    expect(representativeImageFor("poi", "restaurant")).toBeNull();
  });
});
