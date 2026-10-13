/**
 * Foodie — import validator: normalization + string/geo primitives.
 *
 * Pure functions only. Normalization is used for MATCHING and REPORTING; the
 * raw input is always preserved alongside so evidence is never lost.
 */

/* ------------------------------------------------------------------ */
/* Name normalization + similarity                                     */
/* ------------------------------------------------------------------ */

/**
 * Tokens that carry no distinguishing information for matching
 * (honorifics / generic business words). Kept intentionally small:
 * content words like "biryani", "cafe", "chats" are NOT stripped.
 */
const GENERIC_TOKENS = new Set([
  "the",
  "sri",
  "shri",
  "shree",
  "hotel",
  "family",
  "restaurant",
  "food",
  "court",
]);

/**
 * Words that name a *type* of business rather than the individual business.
 * Used for the proper-noun ambiguity heuristic (NOT for core fuzzy matching,
 * which keeps the smaller GENERIC_TOKENS stop-list so typos still score).
 */
const BUSINESS_TYPE_TOKENS = new Set([
  ...GENERIC_TOKENS,
  "cafe",
  "chats",
  "chaat",
  "tiffin",
  "room",
  "center",
  "centre",
  "canteen",
  "sweets",
  "bakery",
  "biriyani",
  "biryani",
  "point",
  "zone",
  "house",
  "veg",
  "multi",
  "cuisine",
]);

export function normalizeName(raw: string): string {
  return raw
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "") // strip diacritics
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

export function nameTokens(normalizedName: string): string[] {
  return normalizedName.split(" ").filter(Boolean);
}

/** Name with generic tokens removed — used for fuzzy comparison only. */
export function coreName(normalizedName: string): string {
  return nameTokens(normalizedName)
    .filter((t) => !GENERIC_TOKENS.has(t))
    .join(" ");
}

/** Proper-noun tokens (non-generic, non-business-type) — used for the ambiguity heuristic. */
export function properTokens(normalizedName: string): string[] {
  return nameTokens(normalizedName).filter((t) => !BUSINESS_TYPE_TOKENS.has(t));
}

export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  let prev = new Array<number>(b.length + 1);
  let curr = new Array<number>(b.length + 1);
  for (let j = 0; j <= b.length; j++) prev[j] = j;
  for (let i = 1; i <= a.length; i++) {
    curr[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
    }
    [prev, curr] = [curr, prev];
  }
  return prev[b.length];
}

export function levenshteinRatio(a: string, b: string): number {
  if (a === "" && b === "") return 1;
  const max = Math.max(a.length, b.length);
  if (max === 0) return 1;
  return 1 - levenshtein(a, b) / max;
}

export function jaccard(a: string[], b: string[]): number {
  if (a.length === 0 && b.length === 0) return 1;
  const setA = new Set(a);
  const setB = new Set(b);
  const intersection = [...setA].filter((t) => setB.has(t)).length;
  const union = new Set([...a, ...b]).size;
  return union === 0 ? 0 : intersection / union;
}

/** |A ∩ B| / min(|A|, |B|) — 1.0 when one token set fully contains the other. */
export function containment(a: string[], b: string[]): number {
  const setA = new Set(a);
  const setB = new Set(b);
  const min = Math.min(setA.size, setB.size);
  if (min === 0) return 0;
  const intersection = [...setA].filter((t) => setB.has(t)).length;
  return intersection / min;
}

/* ------------------------------------------------------------------ */
/* Phone normalization (India)                                         */
/* ------------------------------------------------------------------ */

export interface PhoneResult {
  ok: boolean;
  e164?: string;
  digits?: string;
  reason?: string;
}

/**
 * Normalize an Indian phone number to +91XXXXXXXXXX.
 * Accepts: +91 98765 43210 · 91XXXXXXXXXX · 0XXXXXXXXXX (landline with STD)
 * · XXXXXXXXXX (mobile 6-9 or landline subscriber 2-5 with context).
 * Anything else is rejected — never guessed.
 */
export function normalizeIndianPhone(raw: string): PhoneResult {
  const trimmed = raw.trim();
  if (trimmed === "") return { ok: false, reason: "empty" };
  const hasPlus = trimmed.startsWith("+");
  const cleaned = trimmed.replace(/[^\d]/g, "");
  let d = cleaned;

  if (d.startsWith("00")) d = d.slice(2); // international dialing prefix
  if (hasPlus || d.length === 12 || d.startsWith("91")) {
    if (d.length === 12 && d.startsWith("91")) d = d.slice(2);
    else if (hasPlus && d.length === 12 && d.startsWith("91")) d = d.slice(2);
    else if (hasPlus && d.length !== 10) {
      return { ok: false, reason: `+${cleaned.length} digits after '+' (expected 91 + 10)` };
    }
  }
  if (d.length === 11 && d.startsWith("0")) d = d.slice(1);
  if (d.length === 12 && d.startsWith("91")) d = d.slice(2);

  if (d.length === 10 && /^[2-9]/.test(d)) {
    return { ok: true, e164: `+91${d}`, digits: d };
  }
  if (d.length === 10 && /^[01]/.test(d)) {
    return { ok: false, reason: "10-digit numbers cannot start with 0 or 1" };
  }
  return {
    ok: false,
    reason: `unexpected digit count (${d.length} digits after normalization)`,
  };
}

/* ------------------------------------------------------------------ */
/* Coordinates                                                         */
/* ------------------------------------------------------------------ */

/** Generous bounding boxes used for soft sanity checks (never hard rejections). */
export const INDIA_BBOX = { minLat: 6.0, maxLat: 38.0, minLng: 66.0, maxLng: 98.0 } as const;
/** Pilot corridor: GITAM Bengaluru / Nagadenahalli → Doddaballapura (generous). */
export const PILOT_CORRIDOR_BBOX = { minLat: 12.8, maxLat: 13.6, minLng: 77.2, maxLng: 78.0 } as const;

export interface CoordinateResult {
  ok: boolean;
  value?: number;
  reason?: string;
  /** Looks like the lat/lng pair was swapped (both inside the other's India range). */
  swapLikely?: boolean;
}

export function parseLatitude(raw: string): CoordinateResult {
  const trimmed = raw.trim();
  if (trimmed === "") return { ok: false, reason: "empty" };
  const v = Number(trimmed);
  if (!Number.isFinite(v)) return { ok: false, reason: `"${trimmed}" is not a number` };
  if (v < -90 || v > 90) return { ok: false, reason: `${v} outside latitude range [-90, 90]` };
  if (v >= INDIA_BBOX.minLng && v <= INDIA_BBOX.maxLng) {
    return {
      ok: false,
      value: v,
      reason: `${v} looks like an Indian longitude, not a latitude — possible lat/lng swap`,
      swapLikely: true,
    };
  }
  return { ok: true, value: v };
}

export function parseLongitude(raw: string): CoordinateResult {
  const trimmed = raw.trim();
  if (trimmed === "") return { ok: false, reason: "empty" };
  const v = Number(trimmed);
  if (!Number.isFinite(v)) return { ok: false, reason: `"${trimmed}" is not a number` };
  if (v < -180 || v > 180) return { ok: false, reason: `${v} outside longitude range [-180, 180]` };
  if (v >= INDIA_BBOX.minLat && v <= INDIA_BBOX.maxLat) {
    return {
      ok: false,
      value: v,
      reason: `${v} looks like an Indian latitude, not a longitude — possible lat/lng swap`,
      swapLikely: true,
    };
  }
  return { ok: true, value: v };
}

/** Great-circle distance in km (same Haversine formula as the app + RPC). */
export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(a));
}

/* ------------------------------------------------------------------ */
/* Misc                                                               */
/* ------------------------------------------------------------------ */

export function formatDistance(km: number | null): string {
  if (km == null) return "—";
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(2)} km`;
}
