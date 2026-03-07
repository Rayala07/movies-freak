const express = require("express");
const router = express.Router();

const { register, login, logout, getMe } = require("../controllers/auth.controller");
const { protectRoute } = require("../middleware/auth.middleware");

/**
 * Auth Routes
 * -----------
 * Base path: /api/auth  (mounted in app.js)
 *
 * Public routes — no token required:
 *   POST /api/auth/register  → create a new account
 *   POST /api/auth/login     → log in and receive a cookie
 *   POST /api/auth/logout    → clear the cookie
 *
 * Protected route — valid token cookie required:
 *   GET  /api/auth/me        → get current logged-in user's data
 *                              (used by frontend on app load to restore session)
 */

// Public routes
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);

// Protected route — protectRoute middleware validates the cookie first
router.get("/me", protectRoute, getMe);

module.exports = router;
