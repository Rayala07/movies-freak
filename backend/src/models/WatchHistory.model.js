const mongoose = require("mongoose");

/**
 * WatchHistory Schema
 * -------------------
 * Automatically records when a user:
 *   1. Opens a movie/TV show detail page
 *   2. Watches a trailer
 *
 * This enables the "Recently Watched" section on the user's profile.
 * Entries are sorted by `watchedAt` (newest first) on the frontend.
 */
const watchHistorySchema = new mongoose.Schema({
  // Reference to the User who watched this
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  // TMDB ID of the content that was watched
  tmdbId: {
    type: String,
    required: true,
  },

  // Whether this is a movie or TV show (person does not apply to watch history)
  mediaType: {
    type: String,
    enum: ["movie", "tv"],
    required: true,
  },


  /**
   * movieData — Snapshot of key TMDB fields
   * Saved so the watch history page loads instantly
   * without needing extra API calls.
   */
  movieData: {
    title: { type: String, default: "Unknown" },
    poster: { type: String, default: "" },
    rating: { type: Number, default: 0 },
    releaseDate: { type: String, default: "" },
    overview: { type: String, default: "Description not available" },
  },

  // Exact timestamp of when the user watched/opened this content
  watchedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("WatchHistory", watchHistorySchema);
