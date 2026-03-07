const mongoose = require("mongoose");

/**
 * Favorite Schema
 * ---------------
 * Stores a user's favorited movies or TV shows.
 * Since TMDB data is fetched live, we save a small "snapshot" of the movie data
 * (title, poster, rating) so we can display the favorites page without
 * making extra TMDB API calls every time.
 *
 * Each user can only favorite a specific movie once (enforced by unique index).
 */
const favoriteSchema = new mongoose.Schema(
  {
    // Reference to the User who saved this favorite
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // TMDB ID of the movie or TV show (e.g., "550" for Fight Club)
    tmdbId: {
      type: String,
      required: true,
    },

    // Whether this is a movie, TV show, or a person (actor/director)
    mediaType: {
      type: String,
      enum: ["movie", "tv", "person"],
      required: true,
    },


    /**
     * movieData — Snapshot of key TMDB fields
     * We save this so the favorites page loads instantly
     * without making another call to TMDB for every item.
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
 * Ensures a user cannot add the same movie to favorites twice.
 * MongoDB will throw a duplicate key error if tried.
 */
favoriteSchema.index({ userId: 1, tmdbId: 1 }, { unique: true });

module.exports = mongoose.model("Favorite", favoriteSchema);
