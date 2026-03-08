const WatchHistory = require("../models/WatchHistory.model");

/**
 * @route   POST /api/history
 * @desc    Log a movie or TV show as watched
 * @access  Protected
 *
 * Triggered when:
 *   - User opens a movie detail page
 *   - User plays a trailer
 *
 * Request body:
 *   {
 *     tmdbId    : "550"
 *     mediaType : "movie" | "tv"
 *     movieData : { title, poster, rating, releaseDate, overview }
 *   }
 *
 * No duplicate check here — the same movie CAN appear multiple times.
 * Every watch session is its own separate log entry.
 * This is how "Continue Watching" / "Recently Watched" works.
 */
const addToHistory = async (req, res, next) => {
  try {
    const { tmdbId, mediaType, movieData } = req.body;

    // Step 1: Validate required fields
    if (!tmdbId || !mediaType) {
      return res.status(400).json({
        success: false,
        message: "tmdbId and mediaType are required.",
      });
    }

    // Step 2: Validate mediaType — only movie and tv (person cannot be 'watched')
    if (!["movie", "tv"].includes(mediaType)) {
      return res.status(400).json({
        success: false,
        message: "mediaType must be 'movie' or 'tv'.",
      });
    }


    // Step 3: Create the history log entry
    // watchedAt defaults to Date.now() as defined in WatchHistory.model.js
    const historyEntry = await WatchHistory.create({
      userId: req.user._id,
      tmdbId,
      mediaType,
      movieData: {
        title: movieData?.title || "Unknown",
        poster: movieData?.poster || "",
        rating: movieData?.rating || 0,
        releaseDate: movieData?.releaseDate || "",
        overview: movieData?.overview || "Description not available",
      },
    });

    res.status(201).json({
      success: true,
      message: "Added to watch history.",
      historyEntry,
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────

/**
 * @route   GET /api/history
 * @desc    Get the current user's full watch history
 * @access  Protected
 *
 * Sorted by watchedAt descending — most recently watched appears first.
 * Returns stored movieData snapshots — no TMDB API call needed.
 */
const getHistory = async (req, res, next) => {
  try {
    const history = await WatchHistory.find({ userId: req.user._id }).sort({
      watchedAt: -1, // newest watch entries first
    });

    res.status(200).json({
      success: true,
      count: history.length,
      history,
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────

/**
 * @route   DELETE /api/history/:id
 * @desc    Remove a specific watch history entry
 * @access  Protected
 *
 * WHY we use MongoDB _id here (not tmdbId):
 *   The same movie can exist MULTIPLE times in watch history
 *   (e.g. user watched Fight Club on Monday and again on Friday).
 *   Using tmdbId would delete ALL entries for that movie.
 *   Using the MongoDB _id targets that ONE specific watch entry the user wants to remove.
 *
 * Security: we filter by BOTH _id AND userId so a user can never
 * delete another user's history entry even if they guess the _id.
 */
const removeFromHistory = async (req, res, next) => {
  try {
    const historyEntry = await WatchHistory.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id, // ensures users can only delete their own entries
    });

    if (!historyEntry) {
      return res.status(404).json({
        success: false,
        message: "History entry not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Removed from watch history.",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/history
 * @desc    Clear ALL watch history for the current user at once
 * @access  Protected
 */
const clearAllHistory = async (req, res, next) => {
  try {
    await WatchHistory.deleteMany({ userId: req.user._id });
    res.status(200).json({
      success: true,
      message: "Watch history cleared.",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { addToHistory, getHistory, removeFromHistory, clearAllHistory };
