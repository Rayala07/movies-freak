import axiosInstance from "../../../shared/utils/axiosInstance";

/**
 * Discover Service - Layer 4
 * --------------------------
 * Raw API call to our backend AI endpoint.
 * No Redux state, no side effects - pure axios.
 *
 * POST /api/ai/mood-search
 * Body: { mood: "string" }
 * Returns: { success, rationale, params, results }
 */
const discoverService = {
  moodSearch: async (mood) => {
    const { data } = await axiosInstance.post("/api/ai/mood-search", { mood });
    return data;
  },
};

export default discoverService;
