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

// Fetch full movie details (videos, credits, similar)
export const fetchMovieDetail = createAsyncThunk(
  "movies/fetchMovieDetail",
  async (movieId, { rejectWithValue }) => {
    try {
      return await tmdbService.getMovieDetails(movieId);
    } catch (error) {
      return rejectWithValue(error.response?.data?.status_message || "Failed to fetch movie details");
    }
  }
);

// Fetch full TV show details (videos, credits, similar)
export const fetchTVDetail = createAsyncThunk(
  "movies/fetchTVDetail",
  async (tvId, { rejectWithValue }) => {
    try {
      return await tmdbService.getTVDetails(tvId);
    } catch (error) {
      return rejectWithValue(error.response?.data?.status_message || "Failed to fetch TV details");
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
    // Detail page (F5)
    movieDetail: null,
    detailLoading: false,
    detailError: null,
  },
  reducers: {
    resetDiscovery: (state) => {
      state.discoveryMovies = [];
      state.page = 1;
      state.hasMore = true;
    },
    clearDetail: (state) => {
      state.movieDetail = null;
      state.detailLoading = false;
      state.detailError = null;
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
      })
      // Movie/TV Detail (F5)
      .addCase(fetchMovieDetail.pending, (state) => {
        state.detailLoading = true;
        state.detailError = null;
      })
      .addCase(fetchMovieDetail.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.movieDetail = action.payload;
      })
      .addCase(fetchMovieDetail.rejected, (state, action) => {
        state.detailLoading = false;
        state.detailError = action.payload;
      })
      .addCase(fetchTVDetail.pending, (state) => {
        state.detailLoading = true;
        state.detailError = null;
      })
      .addCase(fetchTVDetail.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.movieDetail = action.payload;
      })
      .addCase(fetchTVDetail.rejected, (state, action) => {
        state.detailLoading = false;
        state.detailError = action.payload;
      });
  },
});

export const { resetDiscovery, clearDetail } = movieSlice.actions;
export default movieSlice.reducer;
