import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as authService from "./services/authService";

/**
 * Auth Slice — Layer 3
 * --------------------
 * Single source of truth for all authentication state.
 *
 * State shape:
 *   currentUser    — full user object from backend ({ _id, name, email, role, isBanned })
 *   isAuthenticated — boolean, true when user has a valid session
 *   loading        — true while any async thunk is pending
 *   error          — last error message string, or null
 *
 * Role checking:
 *   Never check role in components — use isAdmin from useAuth hook instead.
 *   role comes directly from the backend JWT payload via GET /api/auth/me
 */

// ─── Async Thunks ────────────────────────────────────────────────────────────

/**
 * Restore session on app load.
 * Backend reads the httpOnly cookie and returns the user or 401.
 */
export const fetchMe = createAsyncThunk("auth/fetchMe", async (_, thunkAPI) => {
  try {
    const res = await authService.getMe();
    return res.data.user;
  } catch (error) {
    // 401 = no valid session, not an error we surface to the user
    return thunkAPI.rejectWithValue(null);
  }
});

/**
 * Login with email + password.
 * Backend sets httpOnly cookie on success.
 */
export const loginUser = createAsyncThunk("auth/loginUser", async (credentials, thunkAPI) => {
  try {
    const res = await authService.login(credentials);
    return res.data.user;
  } catch (error) {
    const message = error.response?.data?.message || "Login failed. Please try again.";
    return thunkAPI.rejectWithValue(message);
  }
});

/**
 * Register a new account.
 * Backend creates user and sets httpOnly cookie on success.
 */
export const registerUser = createAsyncThunk("auth/registerUser", async (userData, thunkAPI) => {
  try {
    const res = await authService.register(userData);
    return res.data.user;
  } catch (error) {
    const message = error.response?.data?.message || "Registration failed. Please try again.";
    return thunkAPI.rejectWithValue(message);
  }
});

/**
 * Logout the current user.
 * Backend blacklists the token and clears the cookie.
 */
export const logoutUser = createAsyncThunk("auth/logoutUser", async (_, thunkAPI) => {
  try {
    await authService.logout();
  } catch (error) {
    // Always clear local state even if backend call fails
    return thunkAPI.rejectWithValue(null);
  }
});

// ─── Slice ───────────────────────────────────────────────────────────────────

const authSlice = createSlice({
  name: "auth",
  initialState: {
    currentUser: null,
    isAuthenticated: false,
    loading: true, // true initially so app waits for fetchMe before rendering
    error: null,
  },
  reducers: {
    // Manual clear — used as fallback if needed
    clearAuth: (state) => {
      state.currentUser = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // ── fetchMe ──
    builder
      .addCase(fetchMe.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(fetchMe.rejected, (state) => {
        state.loading = false;
        state.currentUser = null;
        state.isAuthenticated = false;
      });

    // ── loginUser ──
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ── registerUser ──
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ── logoutUser ──
    builder
      .addCase(logoutUser.fulfilled, (state) => {
        state.currentUser = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state) => {
        // Still clear local state even on backend error
        state.currentUser = null;
        state.isAuthenticated = false;
      });
  },
});

export const { clearAuth, clearError } = authSlice.actions;
export default authSlice.reducer;
