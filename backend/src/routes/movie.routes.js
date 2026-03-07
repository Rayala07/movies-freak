const express = require("express");
const router = express.Router();

const {
  createMovie,
  getAllMovies,
  getMovieById,
  updateMovie,
  deleteMovie,
} = require("../controllers/movie.controller");

const { protectRoute } = require("../middleware/auth.middleware");
const { adminOnly } = require("../middleware/admin.middleware");
const upload = require("../middleware/upload.middleware");

/**
 * Movie Routes
 * ------------
 * Base path: /api/movies  (mounted in app.js)
 *
 * ALL routes require a valid login (protectRoute) — no public access.
 * Admin-managed movies are visible to ALL logged-in users on the platform.
 * Only admins can create, update, or delete movies.
 *
 * Logged-in user routes:
 *   GET  /api/movies        → browse all admin-added movies (paginated)
 *   GET  /api/movies/:id    → view a single movie's details
 *
 * Admin-only routes:
 *   POST   /api/movies      → add a new movie (with optional poster image upload)
 *   PUT    /api/movies/:id  → edit movie (with optional new poster upload)
 *   DELETE /api/movies/:id  → remove a movie (also deletes poster from Cloudinary)
 *
 * upload.single("poster"):
 *   Multer middleware that parses the multipart/form-data request.
 *   It reads the file from the "poster" field and stores it in memory as req.file.
 *   The controller then uploads req.file.buffer to Cloudinary.
 */

// Logged-in user routes — any authenticated user can view
router.get("/", protectRoute, getAllMovies);
router.get("/:id", protectRoute, getMovieById);

// Admin-only routes — upload.single("poster") runs before the controller
router.post("/", protectRoute, adminOnly, upload.single("poster"), createMovie);
router.put("/:id", protectRoute, adminOnly, upload.single("poster"), updateMovie);
router.delete("/:id", protectRoute, adminOnly, deleteMovie);

module.exports = router;

