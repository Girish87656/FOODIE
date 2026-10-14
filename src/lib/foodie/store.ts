"use client";

import { create } from "zustand";
import type { EatContext } from "./types";

/**
 * Application screen — a tiny client-side "router".
 * The whole v1 experience is a single mobile app flow, so state-based
 * navigation keeps it simple and lets us swap in real routes later.
 */
export type Screen =
  | "splash"
  | "auth"
  | "onboarding-context"
  | "onboarding-prefs"
  | "home"
  | "detail"
  | "destination"
  | "food";

interface FoodieState {
  screen: Screen;
  /** last non-detail screen, so detail can navigate back correctly */
  returnScreen: Screen;
  authMode: "login" | "signup";
  userName: string;
  eatContext: EatContext | null;
  /** selected category ids from onboarding */
  preferences: string[];
  /** home quick-filter category (null = All) */
  activeCategory: string | null;
  searchQuery: string;
  selectedPlaceId: string | null;
  /** destination currently presented on the "destination" screen */
  selectedDestinationId: string | null;
  /** destination food currently presented on the "food" screen */
  selectedDestinationFoodId: string | null;
  /** distance filter in km (null = any distance) */
  distanceFilterKm: number | null;
  /** discovery list sorting — "nearest" needs the user's origin (always available) */
  sortBy: "nearest" | "rating";

  go: (screen: Screen) => void;
  setAuthMode: (mode: "login" | "signup") => void;
  setUserName: (name: string) => void;
  setEatContext: (ctx: EatContext) => void;
  togglePreference: (categoryId: string) => void;
  setActiveCategory: (categoryId: string | null) => void;
  setSearchQuery: (q: string) => void;
  openPlace: (placeId: string) => void;
  backFromDetail: () => void;
  /** Destination → Famous Foods discovery flow */
  openDestination: (destinationId: string) => void;
  openDestinationFood: (foodId: string, destinationId: string) => void;
  backFromDestination: () => void;
  backFromFood: () => void;
  setDistanceFilter: (km: number | null) => void;
  setSortBy: (sortBy: "nearest" | "rating") => void;
  reset: () => void;
}

const initialFlow = {
  authMode: "signup" as const,
  userName: "",
  eatContext: null as EatContext | null,
  preferences: [] as string[],
};

export const useFoodieStore = create<FoodieState>((set, get) => ({
  screen: "splash",
  returnScreen: "home",
  activeCategory: null,
  searchQuery: "",
  selectedPlaceId: null,
  selectedDestinationId: null,
  selectedDestinationFoodId: null,
  distanceFilterKm: null,
  sortBy: "nearest" as const,
  ...initialFlow,

  go: (screen) =>
    set((s) => ({
      screen,
      // remember where we were before jumping into a detail view
      returnScreen:
        s.screen === "detail" ? s.returnScreen : s.screen === "splash" ? "home" : s.screen,
    })),

  setAuthMode: (authMode) => set({ authMode }),
  setUserName: (userName) => set({ userName }),

  setEatContext: (eatContext) => set({ eatContext }),

  togglePreference: (categoryId) =>
    set((s) => ({
      preferences: s.preferences.includes(categoryId)
        ? s.preferences.filter((id) => id !== categoryId)
        : [...s.preferences, categoryId],
    })),

  setActiveCategory: (activeCategory) => set({ activeCategory }),
  setSearchQuery: (searchQuery) => set({ searchQuery, activeCategory: null }),

  openPlace: (placeId) =>
    set({
      selectedPlaceId: placeId,
      returnScreen: get().screen === "detail" ? get().returnScreen : get().screen,
      screen: "detail",
    }),

  backFromDetail: () =>
    set({ screen: get().returnScreen, selectedPlaceId: null, searchQuery: "", activeCategory: null }),

  // Destination → Famous Foods → Places. `openPlace` keeps working from the
  // destination/food screens: it stores the current screen as returnScreen,
  // so detail navigates back to exactly where the user came from.
  openDestination: (destinationId) =>
    set((s) => ({
      selectedDestinationId: destinationId,
      selectedDestinationFoodId: null,
      returnScreen: s.screen === "detail" ? s.returnScreen : s.screen === "splash" ? "home" : s.screen,
      screen: "destination",
    })),

  openDestinationFood: (foodId, destinationId) =>
    set((s) => ({
      selectedDestinationFoodId: foodId,
      selectedDestinationId: destinationId,
      returnScreen: s.screen === "detail" ? s.returnScreen : s.screen === "splash" ? "home" : s.screen,
      screen: "food",
    })),

  backFromDestination: () =>
    set({ screen: "home", selectedDestinationId: null, selectedDestinationFoodId: null }),

  backFromFood: () =>
    set({ screen: "destination", selectedDestinationFoodId: null }),

  setDistanceFilter: (distanceFilterKm) => set({ distanceFilterKm }),
  setSortBy: (sortBy) => set({ sortBy }),

  reset: () =>
    set({
      screen: "splash",
      selectedPlaceId: null,
      selectedDestinationId: null,
      selectedDestinationFoodId: null,
      searchQuery: "",
      activeCategory: null,
      ...initialFlow,
    }),
}));
