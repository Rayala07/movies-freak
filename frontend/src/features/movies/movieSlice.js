import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import tmdbService from "./services/tmdbService";

/**
 * Async Thunks
 */

// Fetch top 5 trending movies for the Hero carousel
export const fetchTrendingHeroes = createAsyncThunk(
  "movies/fetchTrendingHeroes",
  async (_, { rejectWithValue }) => {
    try {
      const data = await tmdbService.getTrending(1);
      // Take first 5 that have a backdrop image
      return data.results
        .filter((m) => m.backdrop_path)
        .slice(0, 5);
    } catch (error) {
      return rejectWithValue(error.response?.data?.status_message || "Failed to fetch trending");
    }
  }
);

// Fetch paginated discovery movies (trending/popular mix)
export const fetchDiscoveryMovies = createAsyncThunk(
  "movies/fetchDiscovery",
  async (page, { rejectWithValue }) => {
    try {
      const data = await tmdbService.getTrending(page);
      return {
        results: data.results,
        page: data.page,
        hasMore: data.page < data.total_pages,
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.status_message || "Failed to fetch movies");
    }
  }
);

/**
 * movieSlice — Layer 3 (State)
 */
const movieSlice = createSlice({
  name: "movies",
  initialState: {
    heroMovies: [],       // Top 5 trending for the carousel
    discoveryMovies: [],
    page: 1,
    loading: false,
    heroLoading: false,
    hasMore: true,
    error: null,
  },
  reducers: {
    resetDiscovery: (state) => {
      state.discoveryMovies = [];
      state.page = 1;
      state.hasMore = true;
    },
  },
  extraReducers: (builder) => {
    builder
      // Trending Heroes (carousel)
      .addCase(fetchTrendingHeroes.pending, (state) => {
        state.heroLoading = true;
      })
      .addCase(fetchTrendingHeroes.fulfilled, (state, action) => {
        state.heroLoading = false;
        state.heroMovies = action.payload;
      })
      .addCase(fetchTrendingHeroes.rejected, (state, action) => {
        state.heroLoading = false;
        state.error = action.payload;
      })
      // Discovery Movies (Infinite Scroll)
      .addCase(fetchDiscoveryMovies.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchDiscoveryMovies.fulfilled, (state, action) => {
        state.loading = false;
        state.discoveryMovies = [...state.discoveryMovies, ...action.payload.results];
        state.page = action.payload.page + 1;
        state.hasMore = action.payload.hasMore;
      })
      .addCase(fetchDiscoveryMovies.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetDiscovery } = movieSlice.actions;
export default movieSlice.reducer;
