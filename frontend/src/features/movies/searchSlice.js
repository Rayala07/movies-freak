import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import tmdbService from "./services/tmdbService";

/**
 * Async Thunk for Multi-Search
 * ----------------------------
 * Fetches movies, TV shows, and people based on the query.
 */
export const performSearch = createAsyncThunk(
  "search/performSearch",
  async ({ query, page }, { rejectWithValue }) => {
    try {
      const data = await tmdbService.searchMulti(query, page);
      return {
        results: data.results,
        page: data.page,
        hasMore: data.page < data.total_pages,
        totalResults: data.total_results,
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.status_message || "Failed to search"
      );
    }
  }
);

/**
 * searchSlice — Layer 3 (State)
 */
const searchSlice = createSlice({
  name: "search",
  initialState: {
    query: "",
    results: [],
    page: 1,
    hasMore: true,
    loading: false,
    error: null,
    totalResults: 0,
  },
  reducers: {
    setQuery: (state, action) => {
      state.query = action.payload;
    },
    clearSearch: (state) => {
      state.results = [];
      state.page = 1;
      state.hasMore = true;
      state.totalResults = 0;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(performSearch.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(performSearch.fulfilled, (state, action) => {
        state.loading = false;
        // If it's page 1, replace results. Otherwise, append.
        if (action.meta.arg.page === 1) {
          state.results = action.payload.results;
        } else {
          state.results = [...state.results, ...action.payload.results];
        }
        state.page = action.payload.page + 1;
        state.hasMore = action.payload.hasMore;
        state.totalResults = action.payload.totalResults;
      })
      .addCase(performSearch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setQuery, clearSearch } = searchSlice.actions;
export default searchSlice.reducer;
