const express = require("express");
const router = express.Router();
const rateLimit = require("express-rate-limit");
const { moodSearch } = require("../controllers/ai.controller");
const { protectRoute } = require("../middleware/auth.middleware");
const { validateMoodSearch } = require("../middleware/validateMoodSearch.middleware");

/**
 * AI-Specific Rate Limiter
 * ------------------------
 * LLM calls are significantly more expensive than standard API calls
 * (latency, token cost, NVIDIA API quota). We apply a stricter limit
 * specifically on the AI route: 10 requests per 5 minutes per IP.
 *
 * This is independent of the general 100/15min limiter in app.js.
 * Both apply — whichever is hit first will reject the request.
 *
 * Why per-IP and not per-user?
 *   Per-IP is simpler and doesn't require reading the JWT before limiting.
 *   Per-user limiting would require decoding the token first, which adds
 *   latency before we even know we should reject the request.
 */
const aiRateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,  // 5-minute window
  max: 10,                   // Max 10 AI requests per IP per 5 minutes
  message: {
    success: false,
    message: "Too many AI requests. Please wait a few minutes before trying again.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * AI Routes — /api/ai
 * --------------------
 * Middleware chain (in order):
 *   1. aiRateLimiter   — Reject if IP exceeded 10 requests/5 min (no token spend)
 *   2. protectRoute    — Reject if JWT is missing/invalid/expired/blacklisted
 *   3. validateMoodSearch — Reject if mood field is missing, wrong type,
 *                          too short (<5), too long (>500), or contains
 *                          prompt-injection patterns
 *   4. moodSearch      — Safe to run: user is authenticated, input is validated
 *
 * POST /api/ai/mood-search
 *   Body: { mood: "string" }
 *   Returns: { success, rationale, params, results }
 */
router.post(
  "/mood-search",
  aiRateLimiter,
  protectRoute,
  validateMoodSearch,
  moodSearch
);

module.exports = router;
