import axiosInstance from "../../../shared/utils/axiosInstance";
import tmdbInstance from "../../../shared/utils/tmdbInstance";

/**
 * discoverService (Layer 4)
 * -------------------------
 * Handles AI movie discovery entirely on the frontend to avoid backend TLS issues.
 * 1. Calls backend /api/ai/discover to get Gemini-extracted search parameters.
 * 2. Makes TMDB API calls directly from the browser using the returned parameters.
 */
const discoverService = {
  getAIRecommendations: async (message, conversationHistory = []) => {
    // 1. Ask Gemini for parameters
    const aiResponse = await axiosInstance.post("/api/ai/discover", {
      message,
      conversationHistory,
    });
    
    const { aiParams } = aiResponse.data;
    
    // 2. Extract base components
    const reasoning = aiParams.reasoning || "Here are some movies you might enjoy.";
    const vibeTag = aiParams.vibe_tag || "fun";
    let similarMovies = [];

    // 3. Handle reference movie (if mentioned)
    if (aiParams.reference_movie) {
      try {
        const searchRes = await tmdbInstance.get("/search/movie", {
          params: { query: aiParams.reference_movie, language: "en-US", page: 1 }
        });
        if (searchRes.data.results && searchRes.data.results.length > 0) {
          const movieId = searchRes.data.results[0].id;
          const similarRes = await tmdbInstance.get(`/movie/${movieId}/similar`, {
            params: { language: "en-US", page: 1 }
          });
          similarMovies = similarRes.data.results || [];
        }
      } catch (err) {
        console.warn("Failed to fetch similar movies:", err);
      }
    }

    // 4. Discover with retry logic (progressive relaxation of constraints)
    const baseParams = {
      language: "en-US",
      include_adult: false,
      page: 1,
      sort_by: aiParams.sort_by || "popularity.desc",
    };

    if (aiParams.with_genres) baseParams.with_genres = aiParams.with_genres;
    if (aiParams.vote_average_gte) baseParams["vote_average.gte"] = aiParams.vote_average_gte;
    if (aiParams.with_original_language) baseParams.with_original_language = aiParams.with_original_language;
    if (aiParams.primary_release_date_gte) baseParams["primary_release_date.gte"] = aiParams.primary_release_date_gte;
    if (aiParams.primary_release_date_lte) baseParams["primary_release_date.lte"] = aiParams.primary_release_date_lte;

    let discoverResult = { movies: [], isRelaxed: false, paramsUsed: null };
    
    try {
      // Attempt 1: Full params
      let res = await tmdbInstance.get("/discover/movie", { params: baseParams });
      if (res.data.results && res.data.results.length > 0) {
        discoverResult = { movies: res.data.results, isRelaxed: false, paramsUsed: { ...baseParams } };
      } else {
        // Attempt 2: Drop date range
        const relaxed1 = { ...baseParams };
        delete relaxed1["primary_release_date.gte"];
        delete relaxed1["primary_release_date.lte"];
        res = await tmdbInstance.get("/discover/movie", { params: relaxed1 });
        
        if (res.data.results && res.data.results.length > 0) {
          discoverResult = { movies: res.data.results, isRelaxed: true, paramsUsed: relaxed1 };
        } else {
          // Attempt 3: Drop language
          const relaxed2 = { ...relaxed1 };
          delete relaxed2.with_original_language;
          res = await tmdbInstance.get("/discover/movie", { params: relaxed2 });
          
          if (res.data.results && res.data.results.length > 0) {
            discoverResult = { movies: res.data.results, isRelaxed: true, paramsUsed: relaxed2 };
          } else {
            // Attempt 4: Drop vote threshold
            const relaxed3 = { ...relaxed2 };
            delete relaxed3["vote_average.gte"];
            res = await tmdbInstance.get("/discover/movie", { params: relaxed3 });
            discoverResult = { movies: res.data.results || [], isRelaxed: true, paramsUsed: relaxed3 };
          }
        }
      }
    } catch (err) {
      throw new Error("Could not reach the movie database right now. Please try again in a moment.");
    }

    // 5. Merge and deduplicate results
    let allMovies = [];
    const seenIds = new Set();
    
    for (const movie of similarMovies) {
      if (!seenIds.has(movie.id) && movie.poster_path) {
        seenIds.add(movie.id);
        allMovies.push(movie);
      }
    }
    
    for (const movie of discoverResult.movies) {
      if (!seenIds.has(movie.id) && movie.poster_path) {
        seenIds.add(movie.id);
        allMovies.push(movie);
      }
    }
    
    return {
      success: true,
      reasoning,
      vibeTag,
      movies: allMovies.slice(0, 20),
      isRelaxed: discoverResult.isRelaxed,
      paramsUsed: discoverResult.paramsUsed,
      referenceMovie: aiParams.reference_movie || null,
    };
  }
};

export default discoverService;
