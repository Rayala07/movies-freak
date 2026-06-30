const { parseMoodToTMDBParams } = require("../services/ai.service");
const { discoverByMood } = require("../services/tmdb.service");
const WatchHistory = require("../models/WatchHistory.model");
const Favorite = require("../models/Favorite.model");

/**
 * @route   POST /api/ai/mood-search
 * @desc    Accepts a free-form mood string, uses Mistral LLM via NVIDIA API
 *          to derive TMDB discovery params, fetches personalized movie results.
 * @access  Protected (req.user set by protectRoute middleware)
 *
 * Request body:
 *   { mood: "I want something intense but not too dark, maybe a thriller" }
 *
 * Response:
 *   {
 *     success: true,
 *     rationale: "Gripping psychological thrillers with emotional depth",
 *     params: { genres, keywords, minRating, sortBy },
 *     results: [ ...TMDB movie objects ]
 *   }
 */
const moodSearch = async (req, res, next) => {
  try {
    // req.sanitizedMood is set and validated by validateMoodSearch middleware.
    // By the time execution reaches here, the input is guaranteed to be:
    //   - a non-empty string
    //   - between 5–500 characters
    //   - free of prompt-injection patterns
    const mood = req.sanitizedMood;
    const userId = req.user._id;

    // Fetch user context from MongoDB in parallel for performance
    // Limit history to last 15 entries to keep the prompt concise
    const [watchHistory, favorites] = await Promise.all([
      WatchHistory.find({ userId }).sort({ watchedAt: -1 }).limit(15),
      Favorite.find({ userId }).limit(20),
    ]);

    // Step 1: Send mood + user context to Mistral → get structured TMDB params
    // mood is already trimmed and validated by the upstream middleware
    const tmdbParams = await parseMoodToTMDBParams(
      mood,
      watchHistory,
      favorites
    );

    // Step 2: Use the resolved params to query TMDB Discover
    const movies = await discoverByMood(tmdbParams);

    // Step 3: Filter out titles the user has already watched
    const watchedTmdbIds = new Set(watchHistory.map((h) => String(h.tmdbId)));
    const filteredMovies = movies.filter(
      (m) => !watchedTmdbIds.has(String(m.id))
    );

    res.status(200).json({
      success: true,
      rationale: tmdbParams.rationale,
      params: {
        genres: tmdbParams.genres,
        keywords: tmdbParams.keywords,
        minRating: tmdbParams.minRating,
        sortBy: tmdbParams.sortBy,
      },
      results: filteredMovies,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { moodSearch };
