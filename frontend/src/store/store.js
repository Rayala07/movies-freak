import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import movieReducer from "../features/movies/movieSlice";
import searchReducer from "../features/movies/searchSlice";
import favoriteReducer from "../features/favorites/favoriteSlice";
import watchlistReducer from "../features/watchlist/watchlistSlice";
import historyReducer from "../features/history/historySlice";
import adminReducer from "../features/admin/adminSlice";

/**
 * Redux Store
 * -----------
 * F2  → authReducer ✅
 * F4  → movieReducer ✅
 * F6  → searchReducer ✅
 * F7  → favoriteReducer ✅, watchlistReducer ✅, historyReducer ✅
 * F8  → adminReducer ✅
 */
const store = configureStore({
  reducer: {
    auth: authReducer,
    movies: movieReducer,
    search: searchReducer,
    favorites: favoriteReducer,
    watchlist: watchlistReducer,
    history: historyReducer,
    admin: adminReducer,
  },
});

export default store;

