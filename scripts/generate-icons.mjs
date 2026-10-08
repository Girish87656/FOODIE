/**
 * Foodie brand asset generator.
 *
 * The mark geometry below MUST mirror `LOGO_MARK_PATHS` in
 * src/components/foodie/Logo.tsx (the single source of truth for the logo).
 * If you change the mark in Logo.tsx, update the paths here to match and run:
 *
 *   bun scripts/generate-icons.mjs
 *
 * Emits (all original Foodie artwork — no external/copyrighted assets):
 *   public/icon.svg             SVG favicon / "any" icon (rounded tile)
 *   public/icon-192.png         PWA icon, any purpose
 *   public/icon-512.png         PWA icon, any purpose
 *   public/icon-maskable-512.png PWA icon, maskable (full-bleed tile; the mark
 *                               already sits well inside the 80% safe circle)
 *   public/apple-touch-icon.png 180×180 full-bleed tile (iOS applies its own
 *                               corner mask, so the square must be full-bleed)
 */
import { writeFileSync } from "node:fs";
import sharp from "sharp";

const PATHS = {
  forkTines: "M19.5 15v11M25 15v11M30.5 15v11",
  forkBody: "M19.5 26c0 3 2.46 4.8 5.5 4.8s5.5-1.8 5.5-4.8M25 30.8V48",
  spoonBowl: "M36.4 20.5c0-3.3 2.06-6 4.6-6s4.6 2.7 4.6 6-2.06 6-4.6 6-4.6-2.7-4.6-6Z",
  spoonStem: "M41 26.5V48",
};

/** Saffron gradient tile + fanned fork & spoon — mirrors the CSS `foodie-gradient`. */
function brandSvg({ size, rx, markScale = 1 }) {
  const inner =
    markScale === 1
      ? ""
      : ` transform="translate(32 32) scale(${markScale}) translate(-32 -32)"`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="${size}" height="${size}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#fb923c"/>
      <stop offset="1" stop-color="#ea580c"/>
    </linearGradient>
  </defs>
  <rect width="64" height="64" rx="${rx}" fill="url(#g)"/>
  <g fill="none" stroke="#ffffff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"${inner}>
    <g transform="rotate(-7 25 31)"><path d="${PATHS.forkTines}"/><path d="${PATHS.forkBody}"/></g>
    <g transform="rotate(7 41 31)"><path d="${PATHS.spoonBowl}"/><path d="${PATHS.spoonStem}"/></g>
  </g>
</svg>`;
}

const out = "/home/z/my-project/public";

// SVG favicon — rendered at any size by the browser.
writeFileSync(`${out}/icon.svg`, brandSvg({ size: 64, rx: 17 }));

// PNG "any" icons (rounded tile, transparent corners).
for (const size of [192, 512]) {
  await sharp(Buffer.from(brandSvg({ size, rx: 17 }))).png().toFile(`${out}/icon-${size}.png`);
}

// Maskable: full-bleed square; the mark's bounding radius (~22.6/32) already
// fits inside the 80%-diameter safe circle, so no extra scaling is needed.
await sharp(Buffer.from(brandSvg({ size: 512, rx: 0 })))
  .png()
  .toFile(`${out}/icon-maskable-512.png`);

// Apple touch icon: full-bleed 180×180 (iOS rounds the corners itself).
await sharp(Buffer.from(brandSvg({ size: 180, rx: 0 })))
  .png()
  .toFile(`${out}/apple-touch-icon.png`);

console.log("Foodie brand assets generated:");
console.log("  public/icon.svg, icon-192.png, icon-512.png, icon-maskable-512.png, apple-touch-icon.png");
