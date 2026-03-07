const mongoose = require("mongoose");

/**
 * Movie Schema (Admin-Managed)
 * ----------------------------
 * These are CUSTOM movies created by the admin from the dashboard.
 * This is separate from TMDB data (which is fetched live from the API).
 * Admin provides all fields manually including a YouTube trailer link.
 */
const movieSchema = new mongoose.Schema(
  {
    // Title of the movie
    title: {
      type: String,
      required: [true, "Movie title is required"],
      trim: true,
    },

    // URL to the movie poster image (external link or uploaded URL)
    // Falls back to a placeholder if not provided
    poster: {
      type: String,
      default:
        "https://res.cloudinary.com/dr3icbigy/image/upload/v1772899683/placeholder_image_scac1b.png",
    },

    // Short description or synopsis
    description: {
      type: String,
      default: "Description not available",
    },

    // A unique identifier for this movie (can match TMDB ID or be custom)
    movieId: {
      type: String,
      required: [true, "Movie ID is required"],
      unique: true,
      trim: true,
    },

    // Release date as a string e.g., "2024-03-15"
    releaseDate: {
      type: String,
      default: "",
    },

    // Full YouTube video link e.g., "https://www.youtube.com/watch?v=abc123"
    // If empty, the frontend will show "Trailer not available"
    trailerUrl: {
      type: String,
      default: "",
    },

    // Genre e.g., "Action", "Comedy", "Thriller"
    genre: {
      type: String,
      default: "General",
    },

    // Category helps organize movies — e.g., "Trending", "Hollywood", "Bollywood"
    category: {
      type: String,
      default: "General",
    },
  },
  {
    // Automatically adds createdAt and updatedAt fields
    timestamps: true,
  },
);

module.exports = mongoose.model("Movie", movieSchema);
