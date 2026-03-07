const Favorite = require("../models/Favorite.model");

/**
 * @route   POST /api/favorites
 * @desc    Add a movie or TV show to the user's favorites
 * @access  Protected (logged-in users only)
 *
 * Request body:
 *   {
 *     tmdbId    : "550"           ← TMDB movie/show ID (string)
 *     mediaType : "movie"|"tv"    ← type of content
 *     movieData : {               ← snapshot of key display fields
 *       title, poster, rating, releaseDate, overview
 *     }
 *   }
 *
 * Why save movieData (snapshot)?
 *   TMDB data is always fetched live — we don't store it permanently.
 *   But the favorites page needs to display movie cards (title, poster, etc.)
 *   without making a separate TMDB API call for EACH favorited movie.
 *   So we save a small copy ("snapshot") of those display fields at the time
 *   the user favorites the movie. This makes the favorites page load instantly.
 */
const addFavorite = async (req, res, next) => {
  try {
    const { tmdbId, mediaType, movieData } = req.body;

    // Step 1: Validate required fields
    if (!tmdbId || !mediaType) {
      return res.status(400).json({
        success: false,
        message: "tmdbId and mediaType are required.",
      });
    }

    // Step 2: Validate mediaType — must be movie, tv, or person (actor/director)
    if (!["movie", "tv", "person"].includes(mediaType)) {
      return res.status(400).json({
        success: false,
        message: "mediaType must be 'movie', 'tv', or 'person'.",
      });
    }


    // Step 3: Save the favorite
    // If the user already favorited this movie, the unique compound index
    // { userId, tmdbId } will throw a duplicate key error (code 11000),
    // which the global errorHandler catches and returns as a clean 400 message.
    const favorite = await Favorite.create({
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
      message: "Added to favorites.",
      favorite,
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────

/**
 * @route   DELETE /api/favorites/:tmdbId
 * @desc    Remove a movie or TV show from favorites
 * @access  Protected
 *
 * We identify the favorite by userId + tmdbId (not MongoDB _id).
 * Reason: The frontend knows the TMDB ID of the movie being displayed,
 * not the internal MongoDB _id of the Favorite document.
 */
const removeFavorite = async (req, res, next) => {
  try {
    const { tmdbId } = req.params;

    // Find and delete the favorite belonging to this specific user
    const favorite = await Favorite.findOneAndDelete({
      userId: req.user._id,
      tmdbId,
    });

    // If no document matched, the movie wasn't in favorites
    if (!favorite) {
      return res.status(404).json({
        success: false,
        message: "Favorite not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Removed from favorites.",
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────

/**
 * @route   GET /api/favorites
 * @desc    Get all favorites for the currently logged-in user
 * @access  Protected
 *
 * Returns stored movieData snapshots — no TMDB API call needed.
 * Sorted newest first so recently added favorites appear at the top.
 */
const getFavorites = async (req, res, next) => {
  try {
    const favorites = await Favorite.find({ userId: req.user._id }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: favorites.length,
      favorites,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { addFavorite, removeFavorite, getFavorites };
