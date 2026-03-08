import axiosInstance from "../../../shared/utils/axiosInstance";

/**
 * Watch History Service — Layer 4
 * --------------------------------
 * All API calls related to the user's viewing history.
 */
const historyService = {
  /** GET /api/history */
  getHistory: async () => {
    const { data } = await axiosInstance.get("/api/history");
    return data;
  },

  /** POST /api/history */
  addToHistory: async ({ tmdbId, mediaType, movieData }) => {
    const { data } = await axiosInstance.post("/api/history", {
      tmdbId,
      mediaType,
      movieData,
    });
    return data;
  },

  /** DELETE /api/history/:id (uses MongoDB _id) */
  removeFromHistory: async (id) => {
    const { data } = await axiosInstance.delete(`/api/history/${id}`);
    return data;
  },

  /** DELETE /api/history — wipes entire history for user */
  clearAllHistory: async () => {
    const { data } = await axiosInstance.delete("/api/history");
    return data;
  },
};

export default historyService;
