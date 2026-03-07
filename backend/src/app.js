const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

// Route imports
const authRoutes = require("./routes/auth.routes");
const movieRoutes = require("./routes/movie.routes");


const app = express();

/**
 * CORS Configuration
 * ------------------
 * We set "credentials: true" so the browser is allowed to send
 * cookies along with cross-origin requests (frontend on 5173 → backend on 3000).
 * "origin" must be the exact frontend URL — not a wildcard (*) when using credentials.
 */
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);

// Parses incoming JSON request bodies (req.body)
app.use(express.json());

// Parses cookies from incoming requests and makes them available via req.cookies
app.use(cookieParser());

/**
 * API Routes
 * ----------
 * All routes are prefixed with /api
 * More route files will be added here as each phase is built.
 */
app.use("/api/auth", authRoutes);
app.use("/api/movies", movieRoutes);


module.exports = app;
