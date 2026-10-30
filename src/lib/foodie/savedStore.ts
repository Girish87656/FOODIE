"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Saved places — the user's personal bookmark list (Foodie's "favorites").
 *
 * DESIGN (honest prototype scope):
 * - Persisted on-device (localStorage via zustand `persist`) — the same
 *   durability class the rest of the prototype uses for preferences. A
 *   signed-in Supabase sync is deliberately NOT claimed: until the owner
 *   provisions the profile-columns migration this list is explicitly
 *   device-local, and the UI never says otherwise.
 * - Stores a small honest snapshot (id, kind, name, area) so the Home
 *   "Saved" rail can still list a venue that isn't part of the currently
 *   loaded city feed — tapping it opens the real detail screen, which
 *   fetches the live row by id. No place is ever invented: if a saved row
 *   was removed server-side, its detail screen shows the real "not found"
 *   state.
 * - `kind` distinguishes food places from non-food attractions/lodging
 *   (public.places rows) so each opens through its own discovery route.
 */

export type SavedKind = "place" | "attraction";

export interface SavedItem {
  id: string;
  kind: SavedKind;
  name: string;
  /** Locality/area label as shown in lists — null when the row has none. */
  area: string | null;
  savedAt: string;
}

interface SavedState {
  items: SavedItem[];
  /** Add if absent, remove if present. Returns true when the item is now saved. */
  toggle: (item: Omit<SavedItem, "savedAt">) => boolean;
  remove: (id: string) => void;
  clear: () => void;
  isSaved: (id: string) => boolean;
}

export const useSavedStore = create<SavedState>()(
  persist(
    (set, get) => ({
      items: [],
      toggle: (item) => {
        const existing = get().items;
        const present = existing.some((i) => i.id === item.id);
        if (present) {
          set({ items: existing.filter((i) => i.id !== item.id) });
          return false;
        }
        const next: SavedItem = { ...item, savedAt: new Date().toISOString() };
        // Newest first — the rail mirrors "recently saved".
        set({ items: [next, ...existing] });
        return true;
      },
      remove: (id) => set({ items: get().items.filter((i) => i.id !== id) }),
      clear: () => set({ items: [] }),
      isSaved: (id) => get().items.some((i) => i.id === id),
    }),
    {
      name: "foodie-saved-places-v1",
      version: 1,
    }
  )
);

/** Sorted copy for rails — newest first, stable across renders. */
export function sortedSaved(items: SavedItem[]): SavedItem[] {
  return [...items].sort((a, b) => (a.savedAt < b.savedAt ? 1 : -1));
}
