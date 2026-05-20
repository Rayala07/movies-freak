const express = require("express");
const router = express.Router();
const rateLimit = require("express-rate-limit");

const { soloDiscover } = require("../controllers/ai.controller");
const { protectRoute } = require("../middleware/auth.middleware");

/**
 * AI-specific rate limiter — protects Gemini API quota.
 * 20 calls per IP per 15-minute window.
 */
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    message: "Too many AI requests. Please wait a few minutes before trying again.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * AI Routes
 * ---------
 * Base path: /api/ai  (mounted in app.js)
 *
 *   POST /api/ai/discover  → AI mood-based movie discovery (login required)
 */
router.post("/discover", protectRoute, aiLimiter, soloDiscover);

module.exports = router;
