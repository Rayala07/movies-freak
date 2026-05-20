import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import discoverService from "./services/discoverService";

/**
 * Async Thunk: Fetch AI Movie Recommendations (Solo Mode)
 */
export const fetchAIDiscovery = createAsyncThunk(
  "discover/fetchAIDiscovery",
  async ({ message, conversationHistory }, thunkAPI) => {
    try {
      return await discoverService.getAIRecommendations(message, conversationHistory);
    } catch (error) {
      const msg =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        "Failed to get AI recommendations.";
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

const initialState = {
  messages: [],    // Array of { role: 'user' | 'ai', content: string }
  results: [],     // Current movie results
  reasoning: "",   // AI's reasoning text
  vibeTag: "",     // e.g. 'cozy', 'dark'
  isRelaxed: false,
  paramsUsed: null,
  referenceMovie: null,
  loading: false,
  error: null,
};

const discoverSlice = createSlice({
  name: "discover",
  initialState,
  reducers: {
    clearDiscoverError: (state) => {
      state.error = null;
    },
    clearDiscoverState: () => initialState,
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
        state.messages.push({ role: "ai", content: action.payload.reasoning });
      })
      .addCase(fetchAIDiscovery.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearDiscoverError, clearDiscoverState, addUserMessage } = discoverSlice.actions;
export default discoverSlice.reducer;
