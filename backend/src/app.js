const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require("path");


// Route imports
const authRoutes = require("./routes/auth.routes");
const movieRoutes = require("./routes/movie.routes");
const favoriteRoutes = require("./routes/favorite.routes");
const watchHistoryRoutes = require("./routes/watchHistory.routes");
const watchlistRoutes = require("./routes/watchlist.routes");
const userRoutes = require("./routes/user.routes");

// Global error handler (mounted after all routes)
const { errorHandler } = require("./middleware/error.middleware");

const app = express();

/**
 * Security — Helmet
 * -----------------
 * Sets a collection of secure HTTP response headers automatically.
 * Protects against well-known web vulnerabilities:
 *   - XSS (Cross-Site Scripting) — via Content-Security-Policy
 *   - Clickjacking — via X-Frame-Options
 *   - MIME sniffing — via X-Content-Type-Options
 *   - Information leakage — removes X-Powered-By: Express header
 */
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        // API calls: our backend + TMDB
        connectSrc: [
          "'self'",
          "https://api.themoviedb.org",
          "https://res.cloudinary.com",
        ],
        // Images: TMDB CDN, Cloudinary, data URIs (base64 placeholders)
        imgSrc: [
          "'self'",
          "data:",
          "blob:",
          "https://image.tmdb.org",
          "https://res.cloudinary.com",
          "https://www.youtube.com",
          "https://i.ytimg.com",
        ],
        // YouTube iframes for trailers
        frameSrc: [
          "https://www.youtube.com",
          "https://youtube.com",
        ],
        // Vite production build uses inline scripts
        scriptSrc: ["'self'", "'unsafe-inline'"],
        // Tailwind/inline styles + Google Fonts
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        // Required for YouTube embeds
        mediaSrc: ["'self'", "https://www.youtube.com"],
      },
    },
  })
);

/**
 * Security — Rate Limiting
 * -------------------------
 * Limits how many requests a single IP can make within a time window.
 * Protects against:
 *   - Brute force attacks (e.g. repeatedly guessing passwords)
 *   - Denial of Service (DoS) from a single client
 *
 * Auth routes have a stricter limit (30 per 15 min).
 * All other API routes have a general limit (100 per 15 min).
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30,                   // max 30 requests per IP per window
  message: {
    success: false,
    message: "Too many requests from this IP. Please try again after 15 minutes.",
  },
  standardHeaders: true, // returns rate limit info in RateLimit-* headers
  legacyHeaders: false,
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,                  // max 100 requests per IP per window
  message: {
    success: false,
    message: "Too many requests from this IP. Please try again after 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * CORS Configuration
 * ------------------
 * credentials: true → allows browser to send httpOnly cookies cross-origin.
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
 * Auth routes get the stricter rate limiter.
 * All others use the general limiter.
 */
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/movies", generalLimiter, movieRoutes);
app.use("/api/favorites", generalLimiter, favoriteRoutes);
app.use("/api/history", generalLimiter, watchHistoryRoutes);
app.use("/api/watchlist", generalLimiter, watchlistRoutes);
app.use("/api/users", generalLimiter, userRoutes);

/**
 * Global Error Handler
 * --------------------
 * MUST be mounted AFTER all routes.
 * All controllers call next(error) to route errors here.
 * Handles: Mongoose validation, duplicate key, CastError, generic 500 errors.
 */
app.use(errorHandler);

/**
 * Production — Serve React Frontend
 * -----------------------------------
 * When NODE_ENV=production, Express serves the Vite build from backend/client/.
 * The catch-all '*' sends index.html for every non-API route so React Router
 * can handle client-side navigation (e.g. /movie/123, /favorites, etc.).
 * In development this block is skipped entirely.
 */
if (process.env.NODE_ENV === "production") {
  const clientPath = path.join(__dirname, "..", "client");
  app.use(express.static(clientPath));
  app.get("/*splat", (req, res) => {
    res.sendFile(path.join(clientPath, "index.html"));
  });
}

module.exports = app;
