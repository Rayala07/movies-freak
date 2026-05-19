import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import discoverService from "./services/discoverService";

/**
 * Async Thunk: Fetch AI Movie Recommendations
 */
export const fetchAIDiscovery = createAsyncThunk(
  "discover/fetchAIDiscovery",
  async ({ message, conversationHistory }, thunkAPI) => {
    try {
      return await discoverService.getAIRecommendations(message, conversationHistory);
    } catch (error) {
      const message =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        "Failed to get AI recommendations.";
      return thunkAPI.rejectWithValue(message);
    }
  }
);

/**
 * Async Thunk: Fetch Group AI Reconciliation
 * Calls the groupDiscover backend endpoint with the session ID.
 */
export const fetchGroupDiscovery = createAsyncThunk(
  "discover/fetchGroupDiscovery",
  async ({ sessionId }, thunkAPI) => {
    try {
      return await discoverService.groupDiscover(sessionId);
    } catch (error) {
      const msg =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        "Failed to reconcile group preferences.";
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

const initialState = {
  // Solo Mode State
  messages: [], // Array of { role: 'user' | 'ai', content: string }
  results: [], // Current movie results
  reasoning: "", // AI's reasoning text
  vibeTag: "", // e.g., 'cozy', 'dark'
  isRelaxed: false, // True if TMDB constraints had to be loosened
  paramsUsed: null,
  referenceMovie: null,
  loading: false,
  error: null,

  // Group Mode State
  sessionId: null,
  sessionStatus: "idle",
  sessionMembers: [],
  groupSummary: "",
  conflictNote: "",
  perPersonNotes: [],
  groupLoading: false,
  groupError: null,
};

const discoverSlice = createSlice({
  name: "discover",
  initialState,
  reducers: {
    // Basic state resets
    clearDiscoverError: (state) => {
      state.error = null;
    },
    clearDiscoverState: (state) => {
      // Reset everything back to initial state
      return initialState;
    },
    // Manually add a message to history (used right before dispatching thunk)
    addUserMessage: (state, action) => {
      state.messages.push({ role: "user", content: action.payload });
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAIDiscovery.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAIDiscovery.fulfilled, (state, action) => {
        state.loading = false;
        state.results = action.payload.movies;
        state.reasoning = action.payload.reasoning;
        state.vibeTag = action.payload.vibeTag;
        state.isRelaxed = action.payload.isRelaxed;
        state.paramsUsed = action.payload.paramsUsed;
        state.referenceMovie = action.payload.referenceMovie;

        // Add AI response to conversation history
        state.messages.push({ role: "ai", content: action.payload.reasoning });
      })
      .addCase(fetchAIDiscovery.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // ── Group Discovery ────────────────────────────────────────────────
      .addCase(fetchGroupDiscovery.pending, (state) => {
        state.groupLoading = true;
        state.groupError = null;
      })
      .addCase(fetchGroupDiscovery.fulfilled, (state, action) => {
        state.groupLoading = false;
        // Shared result fields
        state.results = action.payload.movies;
        state.reasoning = action.payload.reasoning;
        state.vibeTag = action.payload.vibeTag;
        state.isRelaxed = action.payload.isRelaxed;
        // Group-specific fields
        state.groupSummary = action.payload.groupSummary;
        state.conflictNote = action.payload.conflictNote;
        state.perPersonNotes = action.payload.perPersonNotes;
      })
      .addCase(fetchGroupDiscovery.rejected, (state, action) => {
        state.groupLoading = false;
        state.groupError = action.payload;
      });
  },
});

export const { clearDiscoverError, clearDiscoverState, addUserMessage } = discoverSlice.actions;
export default discoverSlice.reducer;
