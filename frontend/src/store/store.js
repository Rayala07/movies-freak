import { configureStore } from "@reduxjs/toolkit";

/**
 * Redux Store
 * -----------
 * Central state container for the entire app.
 * Each feature slice is imported and registered here as phases are built.
 *
 * Current slices: none yet (added per phase)
 * F2 → authSlice
 * F4 → movieSlice
 * F6 → searchSlice
 * F7 → favoriteSlice, watchlistSlice, watchHistorySlice
 * F8 → adminSlice
 */
const store = configureStore({
  reducer: {
    // Slices added progressively per phase
  },
});

export default store;
