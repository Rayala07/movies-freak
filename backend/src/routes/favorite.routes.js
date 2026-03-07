const express = require("express");
const router = express.Router();

const { addFavorite, removeFavorite, getFavorites } = require("../controllers/favorite.controller");
const { protectRoute } = require("../middleware/auth.middleware");

/**
 * Favorites Routes
 * ----------------
 * Base path: /api/favorites  (mounted in app.js)
 *
 * ALL routes are protected — user must be logged in.
 * Each user can only access their OWN favorites (enforced in controller via req.user._id).
 *
 *   GET    /api/favorites         → get all favorites for current user
 *   POST   /api/favorites         → add a movie/show to favorites
 *   DELETE /api/favorites/:tmdbId → remove by TMDB ID (not MongoDB _id)
 */

router.get("/", protectRoute, getFavorites);
router.post("/", protectRoute, addFavorite);
router.delete("/:tmdbId", protectRoute, removeFavorite);

module.exports = router;
