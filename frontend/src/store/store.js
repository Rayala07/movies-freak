import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import movieReducer from "../features/movies/movieSlice";

/**
 * Redux Store
 * -----------
 * F2  → authReducer ✅
 * F4  → movieReducer ✅
 * F6  → searchReducer
 * F7  → favoriteReducer, watchlistReducer, watchHistoryReducer
 * F8  → adminReducer
 */
const store = configureStore({
  reducer: {
    auth: authReducer,
    movies: movieReducer,
  },
});

export default store;

