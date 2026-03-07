const jwt = require("jsonwebtoken");
const User = require("../models/User.model");
const BlacklistedToken = require("../models/BlacklistedToken.model");

/**
 * Auth Middleware — protectRoute
 * --------------------------------
 * This middleware runs BEFORE any protected controller.
 * It ensures the request is coming from a logged-in user
 * by verifying the JWT token stored in an httpOnly cookie.
 *
 * Why cookies instead of Authorization headers?
 *   - httpOnly cookies cannot be accessed by JavaScript (safer against XSS)
 *   - The browser automatically sends the cookie with every request
 *   - No need to manually attach a token on every frontend API call
 *
 * How to use on a route:
 *   router.get("/profile", protectRoute, getProfile);
 *
 * Cookie expected: "token" (set during login/register)
 */
const protectRoute = async (req, res, next) => {
  try {
    // Step 1: Read the JWT token from the "token" cookie
    // cookie-parser (in app.js) makes cookies available via req.cookies
    const token = req.cookies.token;

    // Step 2: Check if the cookie exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. Please log in first.",
      });
    }

    // Step 3: Check if this token has been blacklisted (i.e., user logged out)
    // This catches stolen tokens that were copied before the user logged out
    const isBlacklisted = await BlacklistedToken.findOne({ token });
    if (isBlacklisted) {
      return res.status(401).json({
        success: false,
        message: "Token is no longer valid. Please log in again.",
      });
    }

    // Step 4: Verify the token using our JWT_SECRET
    // If the token is expired or tampered, jwt.verify() will throw an error
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Step 5: Fetch the user from the DB using the ID stored in the token
    // Password is excluded automatically (select: false in User model)
    const user = await User.findById(decoded.id);

    // Step 6: Make sure the user still exists (could be deleted after token issued)
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User no longer exists.",
      });
    }

    // Step 7: Check if the user has been banned by an admin
    if (user.isBanned) {
      return res.status(403).json({
        success: false,
        message: "Your account has been banned. Contact support.",
      });
    }

    // Step 8: Attach user to the request object for use in controllers
    req.user = user;

    // Step 9: Move to the next middleware or controller
    next();
  } catch (error) {
    // Handle specific JWT errors with clear messages
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token. Please log in again.",
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Session expired. Please log in again.",
      });
    }

    // Pass any other error to the global error handler
    next(error);
  }
};

module.exports = { protectRoute };

