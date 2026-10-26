/**
 * Foodie's professional icon system (single source of truth).
 *
 * Every category / place-type / eating-context glyph in the UI comes from
 * here — consistent Lucide stroke icons in Foodie's orange palette. This
 * replaces the old emoji glyphs so the whole app shares ONE visual language
 * (the custom picture-style illustrations remain the media layer; these
 * icons are the UI-chrome layer: chips, section headers, fallback tiles).
 *
 * Rules:
 * - Icons are never presented AS a venue photo — the photo/illustration
 *   layers (venue-images.ts, categoryImages.ts) sit above this fallback.
 * - Unknown ids fall back to safe neutral icons, never to emoji.
 */

import {
  BedDouble,
  CakeSlice,
  Castle,
  Clock,
  Coffee,
  CookingPot,
  Gem,
  Heart,
  Landmark,
  Luggage,
  MapPin,
  Mountain,
  PartyPopper,
  PawPrint,
  Pizza,
  Plane,
  Sandwich,
  Soup,
  TrendingUp,
  UserRound,
  Users,
  UtensilsCrossed,
  Wallet,
  Waves,
  type LucideIcon,
} from "lucide-react";

import type { EatContext, PlaceCategory, PlaceType } from "./types";

/** The 7 pilot FOOD categories — `PLACE_CATEGORIES` ids. Every id gets its
 *  OWN unique glyph (Prototype 4.1: no shared icons across categories). */
export const FOOD_CATEGORY_ICONS: Record<PlaceCategory, LucideIcon> = {
  restaurant: UtensilsCrossed,
  hotel: Soup, // local "hotel" = meals place (never lodging — see POI_TYPE_ICONS.hotel)
  tiffin: Sandwich, // idli/dosa/breakfast rooms
  cafe: Coffee,
  fast_food: Pizza,
  street_food: CookingPot,
  bakery_sweets: CakeSlice,
};

/** The 7 NON-FOOD place types — `POI_PLACE_TYPES` ids (mirrors the places CHECK constraint). */
export const POI_TYPE_ICONS: Record<PlaceType, LucideIcon> = {
  temple: Landmark,
  waterfall: Waves,
  fort: Castle,
  zoo: PawPrint,
  natural_arch: Mountain,
  other: MapPin,
  hotel: BedDouble, // lodging — never the meals-place "hotel"
};

/** The 5 eating-with contexts — `EAT_CONTEXTS` ids. */
export const EAT_CONTEXT_ICONS: Record<EatContext, LucideIcon> = {
  Alone: UserRound,
  Family: Users,
  Partner: Heart,
  Friends: PartyPopper,
  Travelling: Plane,
};

/** Hero-tile variants for the home greeting (slightly richer than the chips). */
export const EAT_CONTEXT_HERO_ICONS: Record<EatContext, LucideIcon> = {
  ...EAT_CONTEXT_ICONS,
  Travelling: Luggage,
};

/** Home discovery section headers. */
export const HOME_SECTION_ICONS = {
  nearby: MapPin,
  gems: Gem,
  favorites: Heart,
  popular: TrendingUp,
  budget: Wallet,
  pending: Clock,
} as const;

/**
 * Fallback chip icon for ANY category-like id (food categories, place types,
 * destination chips) without a picture illustration. Destinations and any
 * unknown id get the neutral MapPin.
 */
export function categoryIconFor(id: string): LucideIcon {
  return (
    FOOD_CATEGORY_ICONS[id as PlaceCategory] ??
    POI_TYPE_ICONS[id as PlaceType] ??
    MapPin
  );
}
