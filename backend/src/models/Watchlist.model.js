const mongoose = require("mongoose");

/**
 * Watchlist Schema
 * ----------------
 * Stores movies or TV shows a user wants to watch in the future.
 * This is DIFFERENT from Favorites:
 *   - Favorites = "I loved this"
 *   - Watchlist  = "I want to watch this later"
 *
 * Like Favorites, we store a snapshot of the movie data
 * to avoid repeated TMDB API calls on the watchlist page.
 *
 * A user cannot add the same movie to their watchlist twice (unique index).
 */
const watchlistSchema = new mongoose.Schema(
  {
    // Reference to the User who added this to their watchlist
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // TMDB ID of the movie or TV show
    tmdbId: {
      type: String,
      required: true,
    },

    // Whether this is a movie or a TV show
    mediaType: {
      type: String,
      enum: ["movie", "tv"],
      required: true,
    },

    /**
     * movieData — Snapshot of key TMDB fields
     * Saved for fast rendering on the watchlist page.
     */
    movieData: {
      title: { type: String, default: "Unknown" },
      poster: { type: String, default: "" },
      rating: { type: Number, default: 0 },
      releaseDate: { type: String, default: "" },
      overview: { type: String, default: "Description not available" },
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Compound Unique Index
 * ----------------------
 * Ensures a user cannot add the same movie to their watchlist twice.
 */
watchlistSchema.index({ userId: 1, tmdbId: 1 }, { unique: true });

module.exports = mongoose.model("Watchlist", watchlistSchema);
