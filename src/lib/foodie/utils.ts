import type { Place, PlaceWithDistance, VerificationStatus } from "./types";

/**
 * Plain-language verification label — computed from the database's
 * `verification_status`, never stored or guessed. Rows that predate the
 * column (status undefined) read as "verification pending" rather than
 * silently pretending to be verified.
 */
export function verificationStatusLabel(
  status?: VerificationStatus
): { label: string; tone: "verified" | "unverified" | "neutral" } {
  switch (status) {
    case "verified":
      return { label: "Verified listing", tone: "verified" };
    case "community_submitted":
      return { label: "Community submitted", tone: "neutral" };
    case "unverified":
      return { label: "Unverified listing", tone: "unverified" };
    case "closed":
      return { label: "Marked closed", tone: "unverified" };
    default:
      return { label: "Verification pending", tone: "unverified" };
  }
}

/** 'self_service' ➜ 'Self Service' — display formatting for DB tags only. */
export function prettifyTag(tag: string): string {
  return tag
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/** Is the place open right now? (handles past-midnight closing like 1 AM) */
export function isOpenNow(place: Pick<Place, "opensAt" | "closesAt">, now = new Date()): boolean {
  const h = now.getHours() + now.getMinutes() / 60;
  if (place.closesAt <= place.opensAt) {
    // e.g. open 11:00 → 01:00
    return h >= place.opensAt || h < place.closesAt;
  }
  return h >= place.opensAt && h < place.closesAt;
}

export function formatHours(place: Pick<Place, "opensAt" | "closesAt">): string {
  const fmt = (h: number) => {
    const suffix = h < 12 || h === 24 ? "AM" : "PM";
    const hour12 = h % 12 === 0 ? 12 : h % 12;
    return `${hour12} ${suffix}`;
  };
  return `${fmt(place.opensAt)} – ${fmt(place.closesAt)}`;
}

/** Match a place against a free-text craving query */
export function matchesQuery(place: Place, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const haystack = [
    place.name,
    place.area,
    ...place.cuisines,
    ...place.famousDishes.map((d) => d.name),
    ...place.signatureDishes.map((d) => d.name),
  ]
    .join(" ")
    .toLowerCase();
  return q.split(/\s+/).every((token) => haystack.includes(token));
}

export const byRating = (a: Place, b: Place) => b.rating - a.rating;
export const byDistance = (a: PlaceWithDistance, b: PlaceWithDistance) =>
  a.distanceKm - b.distanceKm;
// Unknown price (NULL in DB) sorts to the end, never first.
export const byBudget = (a: Place, b: Place) =>
  (a.costForTwo ?? Number.POSITIVE_INFINITY) - (b.costForTwo ?? Number.POSITIVE_INFINITY);

export function hiddenGems(places: PlaceWithDistance[]): PlaceWithDistance[] {
  return places.filter((p) => p.badges.hiddenGem).sort(byRating);
}
export function localFavorites(places: PlaceWithDistance[]): PlaceWithDistance[] {
  return places.filter((p) => p.badges.localFavorite).sort(byRating);
}
export function popularPlaces(places: PlaceWithDistance[]): PlaceWithDistance[] {
  return places.filter((p) => p.badges.popular).sort(byRating);
}
export function budgetEats(places: PlaceWithDistance[]): PlaceWithDistance[] {
  return places.filter((p) => p.badges.budget).sort(byBudget);
}
export function nearbyPlaces(places: PlaceWithDistance[]): PlaceWithDistance[] {
  return [...places].sort(byDistance);
}

/** rupee formatting for dish prices / cost for two */
export function inr(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

export function priceLabel(place: Pick<Place, "costForTwo">): string {
  if (place.costForTwo == null) return "Price not captured";
  return `${inr(place.costForTwo)} for two`;
}
