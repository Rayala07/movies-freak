const Watchlist = require("../models/Watchlist.model");

/**
 * @route   POST /api/watchlist
 * @desc    Add a movie or TV show to the user's "watch later" list
 * @access  Protected
 *
 * Request body:
 *   {
 *     tmdbId    : "550"
 *     mediaType : "movie" | "tv"   ← no "person" — you can't "watch later" an actor
 *     movieData : { title, poster, rating, releaseDate, overview }
 *   }
 *
 * Unique compound index { userId, tmdbId } on the model prevents 
 * the same movie from being added to the watchlist twice.
 */
const addToWatchlist = async (req, res, next) => {
  try {
    const { tmdbId, mediaType, movieData } = req.body;

    // Step 1: Validate required fields
    if (!tmdbId || !mediaType) {
      return res.status(400).json({
        success: false,
        message: "tmdbId and mediaType are required.",
      });
    }

    // Step 2: Validate mediaType — only movie and tv (no person)
    if (!["movie", "tv"].includes(mediaType)) {
      return res.status(400).json({
        success: false,
        message: "mediaType must be 'movie' or 'tv'.",
      });
    }

    // Step 3: Add to watchlist
    // Duplicate key error from the unique index is caught by the global errorHandler
    const watchlistItem = await Watchlist.create({
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
      message: "Added to watchlist.",
      watchlistItem,
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────

/**
 * @route   DELETE /api/watchlist/:tmdbId
 * @desc    Remove a movie or TV show from the watchlist
 * @access  Protected
 *
 * Uses tmdbId (not MongoDB _id) because each user can only have ONE
 * entry per movie in their watchlist (enforced by the unique index).
 * So tmdbId is enough to uniquely identify which item to remove.
 */
const removeFromWatchlist = async (req, res, next) => {
  try {
    const { tmdbId } = req.params;

    const watchlistItem = await Watchlist.findOneAndDelete({
      userId: req.user._id,
      tmdbId,
    });

    if (!watchlistItem) {
      return res.status(404).json({
        success: false,
        message: "Item not found in watchlist.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Removed from watchlist.",
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────

/**
 * @route   GET /api/watchlist
 * @desc    Get all items in the current user's watchlist
 * @access  Protected
 *
 * Returns stored movieData snapshots — no TMDB API call required.
 * Sorted newest first so recently added items appear at the top.
 */
const getWatchlist = async (req, res, next) => {
  try {
    const watchlist = await Watchlist.find({ userId: req.user._id }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: watchlist.length,
      watchlist,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { addToWatchlist, removeFromWatchlist, getWatchlist };
