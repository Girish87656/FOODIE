import { describe, expect, test } from "bun:test";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { VENUE_IMAGES, venueImageFor } from "../src/data/venue-images";

/**
 * Prototype 4 image-integrity gate for the VERIFIED venue-photo registry.
 *
 * The UI renders these photos as genuine venue imagery with an on-image
 * credit — so the registry itself must be structurally perfect:
 *   • every entry ships as a bundled asset (master + `-small` sibling,
 *     because `responsiveSrcSet` references the sibling unconditionally);
 *   • every entry carries complete attribution (credit / license /
 *     sourcePage) — a missing field would render an unattributed photo;
 *   • every license stays inside the allowlist (CC BY / CC BY-SA / CC0 /
 *     Public domain — never NC/ND);
 *   • `venueImageFor` only ever resolves ids that are actually in the
 *     registry (no phantom lookups).
 */

const PUBLIC_DIR = join(import.meta.dir, "..", "public");
const LICENSE_ALLOWLIST = ["CC BY", "CC BY-SA", "CC0", "Public domain"];

describe("verified venue-photo registry integrity", () => {
  const entries = Object.entries(VENUE_IMAGES);

  test("registry is non-empty (the premium photo layer has content)", () => {
    expect(entries.length).toBeGreaterThan(0);
  });

  test("every entry has complete attribution fields", () => {
    for (const [id, img] of entries) {
      expect(typeof img.credit).toBe("string");
      expect(img.credit.length).toBeGreaterThan(0);
      expect(typeof img.license).toBe("string");
      expect(img.license.length).toBeGreaterThan(0);
      expect(typeof img.sourcePage).toBe("string");
      expect(img.sourcePage.startsWith("https://")).toBe(true);
      expect(typeof img.alt).toBe("string");
      expect(img.alt.length).toBeGreaterThan(10);
      expect(img.src.startsWith("/images/places/")).toBe(true);
      void id;
    }
  });

  test("every license is inside the allowlist (never NC/ND)", () => {
    for (const [, img] of entries) {
      const allowed = LICENSE_ALLOWLIST.some((prefix) => img.license.startsWith(prefix));
      expect(allowed).toBe(true);
      expect(/NC|ND/.test(img.license)).toBe(false);
    }
  });

  test("every master asset AND its -small sibling exist on disk", () => {
    for (const [, img] of entries) {
      const master = join(PUBLIC_DIR, img.src);
      expect(existsSync(master)).toBe(true);
      const small = join(PUBLIC_DIR, img.src.replace(".webp", "-small.webp"));
      expect(existsSync(small)).toBe(true);
    }
  });

  test("srcset helper resolves candidates for every entry", async () => {
    const { responsiveSrcSet } = await import("../src/lib/foodie/categoryImages");
    for (const [, img] of entries) {
      const srcSet = responsiveSrcSet(img.src);
      expect(srcSet).not.toBeNull();
      expect(srcSet!).toContain("320w");
      // each referenced candidate must exist on disk
      for (const candidate of srcSet!.split(", ")) {
        const file = candidate.split(" ")[0];
        expect(existsSync(join(PUBLIC_DIR, file))).toBe(true);
      }
    }
  });

  test("venueImageFor resolves registry ids and null elsewhere", () => {
    const [knownId, known] = entries[0]!;
    expect(venueImageFor(knownId)).toEqual(known);
    expect(venueImageFor("not-a-real-place-id")).toBeNull();
  });
});

