import tmdbInstance from "../../../shared/utils/tmdbInstance";

/**
 * tmdbService — Layer 4
 * --------------------
 * Pure functions to fetch data from TMDB.
 * Supports pagination via the 'page' parameter.
 */
const tmdbService = {
  /**
   * Fetch trending movies for the day.
   */
  getTrending: async (page = 1) => {
    const response = await tmdbInstance.get(`/trending/movie/day`, {
      params: { page, language: "en-US" },
    });
    return response.data;
  },

  /**
   * Fetch popular movies.
   */
  getPopular: async (page = 1) => {
    const response = await tmdbInstance.get(`/movie/popular`, {
      params: { page, language: "en-US" },
    });
    return response.data;
  },

  /**
   * Fetch movie details by ID.
   */
  getMovieDetails: async (movieId) => {
    const response = await tmdbInstance.get(`/movie/${movieId}`, {
      params: { append_to_response: "videos,credits,similar" },
    });
    return response.data;
  },

  /**
   * Fetch TV show details by ID (with videos, credits, similar).
   */
  getTVDetails: async (tvId) => {
    const response = await tmdbInstance.get(`/tv/${tvId}`, {
      params: { append_to_response: "videos,credits,similar" },
    });
    return response.data;
  },

  /**
   * Multi-search for movies, TV shows, and people.
   */
  searchMulti: async (query, page = 1) => {
    const response = await tmdbInstance.get(`/search/multi`, {
      params: { query, page, language: "en-US", include_adult: false },
    });
    return response.data;
  },

  /**
   * Trending all (movies + TV) used for Popular row.
   */
  getPopularAll: async (page = 1) => {
    const response = await tmdbInstance.get(`/trending/all/week`, {
      params: { page, language: "en-US" },
    });
    return response.data;
  },

  /**
   * Popular movies specifically.
   */
  getPopularMovies: async (page = 1) => {
    const response = await tmdbInstance.get(`/movie/popular`, {
      params: { page, language: "en-US" },
    });
    return response.data;
  },

  /**
   * Popular TV shows specifically.
   */
  getPopularTV: async (page = 1) => {
    const response = await tmdbInstance.get(`/tv/popular`, {
      params: { page, language: "en-US" },
    });
    return response.data;
  },

  /**
   * Fetch just the videos (trailers) for a given TMDB item.
   * Used by the Hero "Play Now" button.
   */
  getVideos: async (id, mediaType = "movie") => {
    const response = await tmdbInstance.get(`/${mediaType}/${id}/videos`, {
      params: { language: "en-US" },
    });
    return response.data;
  },
};

export default tmdbService;
