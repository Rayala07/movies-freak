import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import historyService from "./services/historyService";

// ─── Thunks ────────────────────────────────────────────────────────────────

export const fetchHistory = createAsyncThunk(
  "history/fetchHistory",
  async (_, { rejectWithValue }) => {
    try {
      const data = await historyService.getHistory();
      return data.history;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch history");
    }
  }
);

export const addToHistory = createAsyncThunk(
  "history/addToHistory",
  async (payload, { rejectWithValue }) => {
    try {
      const data = await historyService.addToHistory(payload);
      return data.historyEntry;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to add to history");
    }
  }
);

export const removeFromHistory = createAsyncThunk(
  "history/removeFromHistory",
  async (id, { rejectWithValue }) => {
    try {
      await historyService.removeFromHistory(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to remove from history");
    }
  }
);

export const clearAllHistory = createAsyncThunk(
  "history/clearAllHistory",
  async (_, { rejectWithValue }) => {
    try {
      await historyService.clearAllHistory();
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to clear history");
    }
  }
);

// ─── Slice ─────────────────────────────────────────────────────────────────

const historySlice = createSlice({
  name: "history",
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetchHistory
      .addCase(fetchHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload || [];
      })
      .addCase(fetchHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // addToHistory
      .addCase(addToHistory.fulfilled, (state, action) => {
        if (action.payload) {
          state.items.unshift(action.payload);
        }
      })
      // removeFromHistory — uses MongoDB _id
      .addCase(removeFromHistory.fulfilled, (state, action) => {
        state.items = state.items.filter((h) => h._id !== action.payload);
      })
      // clearAllHistory
      .addCase(clearAllHistory.fulfilled, (state) => {
        state.items = [];
      });
  },
});

export default historySlice.reducer;
