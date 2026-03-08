import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";

/**
 * Redux Store
 * -----------
 * F2  → authReducer ✅
 * F4  → movieReducer (added in Phase F4)
 * F6  → searchReducer
 * F7  → favoriteReducer, watchlistReducer, watchHistoryReducer
 * F8  → adminReducer
 */
const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});

export default store;

