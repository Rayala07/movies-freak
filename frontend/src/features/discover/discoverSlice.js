import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import discoverService from "./services/discoverService";

// ─── Thunk ─────────────────────────────────────────────────────────────────

/**
 * moodSearch thunk
 * ----------------
 * Sends the user's mood string to the backend → Mistral LLM → TMDB.
 * Returns { rationale, params, results } on success.
 */
export const moodSearch = createAsyncThunk(
  "discover/moodSearch",
  async (mood, { rejectWithValue }) => {
    try {
      const data = await discoverService.moodSearch(mood);
      return data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch mood results"
      );
    }
  }
);

// ─── Slice ─────────────────────────────────────────────────────────────────

const discoverSlice = createSlice({
  name: "discover",
  initialState: {
    query: "",           // The current mood text the user typed
    status: "idle",      // "idle" | "loading" | "succeeded" | "failed"
    results: [],         // Array of TMDB movie objects
    rationale: "",       // AI-generated one-liner: "Why these picks"
    params: null,        // { genres, keywords, minRating, sortBy } for display
    error: null,
  },
  reducers: {
    setQuery: (state, action) => {
      state.query = action.payload;
    },
    clearResults: (state) => {
      state.results = [];
      state.rationale = "";
      state.params = null;
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(moodSearch.pending, (state) => {
        state.status = "loading";
        state.error = null;
        state.results = [];
        state.rationale = "";
      })
      .addCase(moodSearch.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.results = action.payload.results || [];
        state.rationale = action.payload.rationale || "";
        state.params = action.payload.params || null;
      })
      .addCase(moodSearch.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { setQuery, clearResults } = discoverSlice.actions;
export default discoverSlice.reducer;
