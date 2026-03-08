import axiosInstance from "../../../shared/utils/axiosInstance";

/**
 * Favorite Service — Layer 4
 * --------------------------
 * All API calls related to user favorites.
 * Uses the backend Snapshot Pattern (stores movieData on save).
 */
const favoriteService = {
  /** GET /api/favorites — returns all favorites with stored snapshots */
  getFavorites: async () => {
    const { data } = await axiosInstance.get("/api/favorites");
    return data;
  },

  /**
   * POST /api/favorites
   * Body: { tmdbId, mediaType, movieData: { title, poster, rating, releaseDate, overview } }
   */
  addFavorite: async ({ tmdbId, mediaType, movieData }) => {
    const { data } = await axiosInstance.post("/api/favorites", {
      tmdbId,
      mediaType,
      movieData,
    });
    return data;
  },

  /** DELETE /api/favorites/:tmdbId */
  removeFavorite: async (tmdbId) => {
    const { data } = await axiosInstance.delete(`/api/favorites/${tmdbId}`);
    return data;
  },
};

export default favoriteService;
