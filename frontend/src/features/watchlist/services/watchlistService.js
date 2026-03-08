import axiosInstance from "../../../shared/utils/axiosInstance";

/**
 * Watchlist Service — Layer 4
 * ---------------------------
 * All API calls related to the user's watchlist.
 */
const watchlistService = {
  /** GET /api/watchlist */
  getWatchlist: async () => {
    const { data } = await axiosInstance.get("/api/watchlist");
    return data;
  },

  /** POST /api/watchlist */
  addToWatchlist: async ({ tmdbId, mediaType, movieData }) => {
    const { data } = await axiosInstance.post("/api/watchlist", {
      tmdbId,
      mediaType,
      movieData,
    });
    return data;
  },

  /** DELETE /api/watchlist/:tmdbId */
  removeFromWatchlist: async (tmdbId) => {
    const { data } = await axiosInstance.delete(`/api/watchlist/${tmdbId}`);
    return data;
  },
};

export default watchlistService;
