const express = require("express");
const router = express.Router();

const {
  soloDiscover,
  createSession,
  getSession,
  joinSession,
  groupDiscover,
} = require("../controllers/ai.controller");
const { protectRoute } = require("../middleware/auth.middleware");

/**
 * AI Routes
 * ---------
 * Base path: /api/ai  (mounted in app.js)
 *
 * Solo Mode:
 *   POST /api/ai/discover                    → AI mood search (login required)
 *
 * Group Mode:
 *   POST /api/ai/sessions                    → host creates a room (login required)
 *   GET  /api/ai/sessions/:sessionId         → anyone polls room status (public)
 *   POST /api/ai/sessions/:sessionId/join    → guest submits preference (public)
 *   POST /api/ai/sessions/:sessionId/discover→ host triggers group AI (Phase 6, login required)
 *
 * Why are GET and join public?
 *   Guests follow a link — they have no account. They only need
 *   the session ID to interact with that specific room. The session
 *   ID is a random UUID — practically unguessable by outsiders.
 */

// ── Solo ────────────────────────────────────────────────────────────────────
router.post("/discover", protectRoute, soloDiscover);

// ── Group Session ────────────────────────────────────────────────────────────
router.post("/sessions", protectRoute, createSession);                  // host: create room
router.get("/sessions/:sessionId", getSession);                          // anyone: poll status
router.post("/sessions/:sessionId/join", joinSession);                   // guest: submit preference
router.post("/sessions/:sessionId/discover", protectRoute, groupDiscover); // host: trigger AI

module.exports = router;
