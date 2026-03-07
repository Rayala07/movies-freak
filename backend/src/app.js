const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

// Route imports
const authRoutes = require("./routes/auth.routes");
const movieRoutes = require("./routes/movie.routes");
const favoriteRoutes = require("./routes/favorite.routes");
const watchHistoryRoutes = require("./routes/watchHistory.routes");
const watchlistRoutes = require("./routes/watchlist.routes");
const userRoutes = require("./routes/user.routes");

// Global error handler (imported last — mounted after all routes)
const { errorHandler } = require("./middleware/error.middleware");

const app = express();

/**
 * CORS Configuration
 * ------------------
 * credentials: true → allows the browser to send httpOnly cookies
 * cross-origin (frontend on 5173 → backend on 3000).
 * origin must be the exact frontend URL — wildcard (*) breaks credentials.
 */
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);

// Parses incoming JSON request bodies → available as req.body
app.use(express.json());

// Parses cookies from incoming requests → available as req.cookies
app.use(cookieParser());

/**
 * API Routes
 * ----------
 * All routes are prefixed with /api
 *
 * Auth       → register, login, logout, getMe
 * Movies     → Admin CRUD + Cloudinary image upload
 * Favorites  → add, remove, get (per user)
 * History    → log, get, remove watch entries (per user)
 * Watchlist  → add, remove, get "watch later" (per user)
 * Users      → Admin: list, ban/unban, delete users
 */
app.use("/api/auth", authRoutes);
app.use("/api/movies", movieRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/history", watchHistoryRoutes);
app.use("/api/watchlist", watchlistRoutes);
app.use("/api/users", userRoutes);

/**
 * Global Error Handler
 * --------------------
 * MUST be mounted AFTER all routes.
 * Express identifies this as an error handler because it has 4 params: (err, req, res, next).
 * All controllers call next(error) to forward errors here.
 * Handles: Mongoose validation, duplicate key, CastError, and generic 500 errors.
 */
app.use(errorHandler);

module.exports = app;
