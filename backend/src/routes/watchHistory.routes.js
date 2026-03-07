const express = require("express");
const router = express.Router();

const {
  addToHistory,
  getHistory,
  removeFromHistory,
} = require("../controllers/watchHistory.controller");
const { protectRoute } = require("../middleware/auth.middleware");

/**
 * Watch History Routes
 * --------------------
 * Base path: /api/history  (mounted in app.js)
 *
 * ALL routes are protected — user must be logged in.
 * Each user can only access and modify their OWN history (enforced via req.user._id).
 *
 *   GET    /api/history     → get full watch history (newest first)
 *   POST   /api/history     → log a new watch entry
 *   DELETE /api/history/:id → remove a specific entry by its MongoDB _id
 */

router.get("/", protectRoute, getHistory);
router.post("/", protectRoute, addToHistory);
router.delete("/:id", protectRoute, removeFromHistory);

module.exports = router;
