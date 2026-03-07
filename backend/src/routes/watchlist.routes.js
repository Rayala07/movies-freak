const express = require("express");
const router = express.Router();

const {
  addToWatchlist,
  removeFromWatchlist,
  getWatchlist,
} = require("../controllers/watchlist.controller");
const { protectRoute } = require("../middleware/auth.middleware");

/**
 * Watchlist Routes
 * ----------------
 * Base path: /api/watchlist  (mounted in app.js)
 *
 * ALL routes are protected — user must be logged in.
 * Each user accesses and modifies only their OWN watchlist (req.user._id).
 *
 *   GET    /api/watchlist          → get all watchlist items
 *   POST   /api/watchlist          → add a movie/show to watchlist
 *   DELETE /api/watchlist/:tmdbId  → remove by TMDB ID
 */

router.get("/", protectRoute, getWatchlist);
router.post("/", protectRoute, addToWatchlist);
router.delete("/:tmdbId", protectRoute, removeFromWatchlist);

module.exports = router;
