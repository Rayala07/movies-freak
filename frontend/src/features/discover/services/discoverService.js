import axiosInstance from "../../../shared/utils/axiosInstance";

/**
 * discoverService (Layer 4)
 * -------------------------
 * Handles API calls to the AI discovery endpoints on our backend.
 * All functions return raw data or throw errors. No state management here.
 */
const discoverService = {
  /**
   * Solo discovery mode — ask AI for movie recommendations
   * @param {string} message - The user's natural language request
   * @param {Array} conversationHistory - Previous messages for context
   */
  getAIRecommendations: async (message, conversationHistory = []) => {
    const response = await axiosInstance.post("/api/ai/discover", {
      message,
      conversationHistory,
    });
    return response.data;
  },

  // ── Group Session ──────────────────────────────────────────────────────────

  /**
   * Host creates a new group session room
   * @param {number} expectedMembers - How many people will join (2–10)
   * @returns {{ sessionId: string }}
   */
  createSession: async (expectedMembers) => {
    const response = await axiosInstance.post("/api/ai/sessions", { expectedMembers });
    return response.data;
  },

  /**
   * Anyone polls a session for current status and member list
   * Called every 3 seconds from the waiting room
   * @param {string} sessionId - The room ID from the URL
   */
  getSession: async (sessionId) => {
    // Uses axiosInstance here even though it's public — guests won't
    // have a cookie so it just won't send one. The endpoint still works.
    const response = await axiosInstance.get(`/api/ai/sessions/${sessionId}`);
    return response.data;
  },

  /**
   * Guest submits their preference to a session
   * @param {string} sessionId
   * @param {string} memberName  - Guest's display name
   * @param {string} preferenceText - Their movie preference description
   */
  joinSession: async (sessionId, memberName, preferenceText) => {
    const response = await axiosInstance.post(`/api/ai/sessions/${sessionId}/join`, {
      memberName,
      preferenceText,
    });
    return response.data;
  },

  /**
   * Host triggers the group AI reconciliation
   * @param {string} sessionId - The session to reconcile
   */
  groupDiscover: async (sessionId) => {
    const response = await axiosInstance.post(`/api/ai/sessions/${sessionId}/discover`);
    return response.data;
  },
};

export default discoverService;
