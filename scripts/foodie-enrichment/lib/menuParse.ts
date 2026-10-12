/**
 * Foodie — menu evidence parsing (no invention).
 *
 * Extraction is a mechanical global scan for "Item name … Rs/₹ N" pairs:
 * an item enters the pipeline ONLY when the source text literally contains
 * the item name immediately followed by an explicit rupee amount. Items
 * without a published price are NOT extracted (name-only parsing produced
 * page chrome in testing — "Open", "Read more" — so it is deliberately gone).
 *
 * Preserved verbatim: quantities ("3 Poori"), bracket counts ("[6 pc]"),
 * spelling. Trailing sentence punctuation is trimmed; the verbatim fragment
 * always travels with the item as its evidence quote. Page chrome ("Cost ₹1000
 * for two", "Open now", "Home Delivery Restaurants in…") is rejected by rule.
 */

const DISH_PRICE_GLOBAL =
  /((?:\d{1,2}\s+)?[A-Za-z][A-Za-z0-9 ()&'+.,[\]-]{2,60}?)\s*(?:Rs\.?|₹|INR)\s*(\d{1,5})(?:\s*\/-)?\b/g;

/**
 * Names that mark the match as page chrome rather than a menu item:
 * listing UI ("Price range per person", "Open now", "ADD customizable"),
 * distance/address fragments ("… 1.06 km", "… Doddaballapura Locality"),
 * prose ("advertised at", "starting at").
 */
const REJECT_RE =
  /(^|[^a-z])(advertised|onwards|starting|cost|location|youtube|instagram|http|www\.|menu|order|online|delivery|restaurants?\s+in|read\s+more|see\s+more|cuisines|rating|reviews|offer|discount|use\s+code|min\s|free|off\b|outlet|timing|open|closed|price|per\s+person|customizable|everything|at\s+just|budget|may\s+start|locality|bus\s+stand|bangalore|doddaballapura?|huskur|circle|godown|tamil\s+nadu|yelahanka|btm|hsr|marathahalli|sultanpur|kattigenahalli|basaveshwara)/i;

/** Time-of-day chrome ("00 PM. Chicken Fried Rice") — never an item. */
const TIME_RE = /\b[01]?\d\s*[.:]?\s*(?:am|pm)\b/i;

/** Name starts with connective chrome ("for one 25 min", "ADD …") → reject. */
const LEADING_REJECT_RE = /^(for|and|with|at|of|near|add|ear|more|enjoy|am|pm|see)\b/i;

function cleanName(raw: string): string {
  let n = raw
    .replace(/^[\s\-–*·>#"'“”]+/, "")
    // listing pages prefix items with a veg/egg category label ("Veg. Paneer
    // Fried Rice") — the label is chrome; the item itself is what follows.
    .replace(/^(egg|veg|non\s?veg)\.\s+/i, "")
    .replace(/[\s.,!?]+$/, "")
    .replace(/\s+/g, " ")
    .trim();
  // balance parentheses: a lazy capture can end inside "Bajji (4 pc)"'s
  // bracket — drop a trailing unmatched "(" rather than an unmatched ")".
  while (n.split("(").length > n.split(")").length && /[(\s]$/.test(n)) {
    n = n.replace(/[(\s]+$/, "").trim();
  }
  return n;
}

export function isValidDishName(name: string): boolean {
  if (name.length < 3 || name.length > 60) return false;
  if (!/[A-Za-z]/.test(name)) return false;
  if (name.includes(":")) return false;
  // a leading number must be a plausible food quantity ("3 Poori"), not a
  // price/list index that bled in from a flattened page ("39 Tiny …")
  const leadingQty = /^(\d{1,2})\s+/.exec(name);
  if (leadingQty && Number(leadingQty[1]) > 12) return false;
  if (name.split(/\s+/).length > 7) return false;
  // two quantity units → flattened duplicate chrome ("Crackle 70ml … 70ml")
  const unitTokens = name.match(/\b\d+\s*(?:ml|gms?|gm|kg|ltr)\b/gi)?.length ?? 0;
  if (unitTokens >= 2) return false;
  if (REJECT_RE.test(name)) return false;
  if (TIME_RE.test(name)) return false;
  if (LEADING_REJECT_RE.test(name)) return false;
  return true;
}

export interface ParsedDish {
  name: string;
  price: number;
  evidence: string;
}

/**
 * Scan a text blob for published item+price pairs. `cap` bounds noise from
 * over-large pages; duplicates (same normalized name) keep the first match.
 */
export function parseMenuBlob(blob: string, cap = 12): ParsedDish[] {
  const out: ParsedDish[] = [];
  const seen = new Set<string>();
  for (const match of blob.matchAll(DISH_PRICE_GLOBAL)) {
    const name = cleanName(match[1]);
    const price = Number(match[2]);
    if (!isValidDishName(name) || !(price > 0 && price <= 9999)) continue;
    const key = name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    // verbatim fragment around the match as the evidence quote
    const start = Math.max(0, match.index - 0);
    out.push({ name, price, evidence: blob.slice(start, start + 160).trim() });
    if (out.length >= cap) break;
  }
  return out;
}
