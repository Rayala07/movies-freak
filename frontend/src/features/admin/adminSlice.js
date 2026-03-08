import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import adminService from "./services/adminService";

// ─── Movie Thunks ──────────────────────────────────────────────────────────

export const fetchAdminMovies = createAsyncThunk(
  "admin/fetchMovies",
  async ({ page = 1, limit = 20 } = {}, { rejectWithValue }) => {
    try {
      return await adminService.getMovies(page, limit);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch movies");
    }
  }
);

export const createMovie = createAsyncThunk(
  "admin/createMovie",
  async (formData, { rejectWithValue }) => {
    try {
      const data = await adminService.createMovie(formData);
      return data.movie;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to create movie");
    }
  }
);

export const updateMovie = createAsyncThunk(
  "admin/updateMovie",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const data = await adminService.updateMovie(id, formData);
      return data.movie;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to update movie");
    }
  }
);

export const deleteMovie = createAsyncThunk(
  "admin/deleteMovie",
  async (id, { rejectWithValue }) => {
    try {
      await adminService.deleteMovie(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to delete movie");
    }
  }
);

// ─── User Thunks ───────────────────────────────────────────────────────────

export const fetchUsers = createAsyncThunk(
  "admin/fetchUsers",
  async (_, { rejectWithValue }) => {
    try {
      const data = await adminService.getUsers();
      return data.users;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch users");
    }
  }
);

export const toggleBanUser = createAsyncThunk(
  "admin/toggleBan",
  async (id, { rejectWithValue }) => {
    try {
      const data = await adminService.toggleBan(id);
      return data.user; // updated user object returned by backend
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to update user");
    }
  }
);

export const deleteUser = createAsyncThunk(
  "admin/deleteUser",
  async (id, { rejectWithValue }) => {
    try {
      await adminService.deleteUser(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to delete user");
    }
  }
);

// ── Collection Detail (isolated from TMDB movieDetail) ────────────────────
export const fetchCollectionDetail = createAsyncThunk(
  "admin/fetchCollectionDetail",
  async (id, { rejectWithValue }) => {
    try {
      const data = await adminService.getMovieById(id);
      return data.movie;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Movie not found");
    }
  }
);

// ─── Slice ─────────────────────────────────────────────────────────────────

const adminSlice = createSlice({
  name: "admin",
  initialState: {
    // Movies
    movies: [],
    totalMovies: 0,
    totalPages: 1,
    moviesLoading: false,
    moviesError: null,

    // Users
    users: [],
    usersLoading: false,
    usersError: null,

    // Collection Detail — isolated from TMDB state
    collectionDetail: null,
    collectionDetailLoading: false,
    collectionDetailError: null,
  },
  reducers: {
    clearCollectionDetail: (state) => {
      state.collectionDetail = null;
      state.collectionDetailLoading = false;
      state.collectionDetailError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchAdminMovies
      .addCase(fetchAdminMovies.pending, (state) => {
        state.moviesLoading = true;
        state.moviesError = null;
      })
      .addCase(fetchAdminMovies.fulfilled, (state, action) => {
        state.moviesLoading = false;
        state.movies = action.payload.movies;
        state.totalMovies = action.payload.totalMovies;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchAdminMovies.rejected, (state, action) => {
        state.moviesLoading = false;
        state.moviesError = action.payload;
      })

      // createMovie
      .addCase(createMovie.fulfilled, (state, action) => {
        state.movies.unshift(action.payload);
        state.totalMovies += 1;
      })

      // updateMovie
      .addCase(updateMovie.fulfilled, (state, action) => {
        const idx = state.movies.findIndex((m) => m._id === action.payload._id);
        if (idx !== -1) state.movies[idx] = action.payload;
      })

      // deleteMovie
      .addCase(deleteMovie.fulfilled, (state, action) => {
        state.movies = state.movies.filter((m) => m._id !== action.payload);
        state.totalMovies -= 1;
      })

      // fetchUsers
      .addCase(fetchUsers.pending, (state) => {
        state.usersLoading = true;
        state.usersError = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.usersLoading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.usersLoading = false;
        state.usersError = action.payload;
      })

      // toggleBanUser — backend returns updated user object
      .addCase(toggleBanUser.fulfilled, (state, action) => {
        const idx = state.users.findIndex((u) => u._id === action.payload._id);
        if (idx !== -1) state.users[idx] = { ...state.users[idx], ...action.payload };
      })

      // deleteUser
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter((u) => u._id !== action.payload);
      })

      // fetchCollectionDetail
      .addCase(fetchCollectionDetail.pending, (state) => {
        state.collectionDetailLoading = true;
        state.collectionDetailError = null;
      })
      .addCase(fetchCollectionDetail.fulfilled, (state, action) => {
        state.collectionDetailLoading = false;
        state.collectionDetail = action.payload;
      })
      .addCase(fetchCollectionDetail.rejected, (state, action) => {
        state.collectionDetailLoading = false;
        state.collectionDetailError = action.payload;
      });
  },
});

export const { clearCollectionDetail } = adminSlice.actions;
export default adminSlice.reducer;
