import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import favoriteService from "./services/favoriteService";

// ─── Thunks ────────────────────────────────────────────────────────────────

export const fetchFavorites = createAsyncThunk(
  "favorites/fetchFavorites",
  async (_, { rejectWithValue }) => {
    try {
      const data = await favoriteService.getFavorites();
      return data.favorites;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch favorites");
    }
  }
);

export const addFavorite = createAsyncThunk(
  "favorites/addFavorite",
  async (payload, { rejectWithValue }) => {
    try {
      const data = await favoriteService.addFavorite(payload);
      return data.favorite;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to add favorite");
    }
  }
);

export const removeFavorite = createAsyncThunk(
  "favorites/removeFavorite",
  async (tmdbId, { rejectWithValue }) => {
    try {
      await favoriteService.removeFavorite(tmdbId);
      return tmdbId;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to remove favorite");
    }
  }
);

// ─── Slice ─────────────────────────────────────────────────────────────────

const favoriteSlice = createSlice({
  name: "favorites",
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetchFavorites
      .addCase(fetchFavorites.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFavorites.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload || [];
      })
      .addCase(fetchFavorites.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // addFavorite
      .addCase(addFavorite.fulfilled, (state, action) => {
        if (action.payload) {
          state.items.unshift(action.payload);
        }
      })
      // removeFavorite
      .addCase(removeFavorite.fulfilled, (state, action) => {
        state.items = state.items.filter((f) => f.tmdbId !== action.payload);
      });
  },
});

export default favoriteSlice.reducer;
