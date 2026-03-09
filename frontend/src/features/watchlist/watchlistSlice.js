import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import watchlistService from "./services/watchlistService";

// ─── Thunks ────────────────────────────────────────────────────────────────

export const fetchWatchlist = createAsyncThunk(
  "watchlist/fetchWatchlist",
  async (_, { rejectWithValue }) => {
    try {
      const data = await watchlistService.getWatchlist();
      return data.watchlist;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch watchlist");
    }
  }
);

export const addToWatchlist = createAsyncThunk(
  "watchlist/addToWatchlist",
  async (payload, { rejectWithValue }) => {
    try {
      const data = await watchlistService.addToWatchlist(payload);
      return data.watchlistItem;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to add to watchlist");
    }
  }
);

export const removeFromWatchlist = createAsyncThunk(
  "watchlist/removeFromWatchlist",
  async (tmdbId, { rejectWithValue }) => {
    try {
      await watchlistService.removeFromWatchlist(tmdbId);
      return tmdbId;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to remove from watchlist");
    }
  }
);

// ─── Slice ─────────────────────────────────────────────────────────────────

const watchlistSlice = createSlice({
  name: "watchlist",
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetchWatchlist
      .addCase(fetchWatchlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWatchlist.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload || [];
      })
      .addCase(fetchWatchlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // addToWatchlist
      .addCase(addToWatchlist.fulfilled, (state, action) => {
        if (action.payload) {
          state.items.unshift(action.payload);
        }
      })
      // removeFromWatchlist
      .addCase(removeFromWatchlist.fulfilled, (state, action) => {
        state.items = state.items.filter((w) => w.tmdbId !== action.payload);
      });
  },
});

export default watchlistSlice.reducer;
