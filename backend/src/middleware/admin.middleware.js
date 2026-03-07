/**
 * Admin Middleware — adminOnly
 * ----------------------------
 * This middleware runs AFTER protectRoute.
 * It adds a second layer of protection for admin-only routes.
 *
 * Flow:
 *   protectRoute → verifies JWT and attaches req.user
 *   adminOnly    → checks if req.user.role === "admin"
 *
 * How to use on a route:
 *   router.post("/movies", protectRoute, adminOnly, createMovie);
 *
 * If a normal user tries to access an admin route:
 *   → Gets 403 Forbidden (even if they have a valid token)
 */
const adminOnly = (req, res, next) => {
  // req.user is set by protectRoute — always use adminOnly AFTER protectRoute
  if (req.user && req.user.role === "admin") {
    // User is an admin — allow the request to proceed
    next();
  } else {
    // User is authenticated but not an admin
    return res.status(403).json({
      success: false,
      message: "Access denied. Admins only.",
    });
  }
};

module.exports = { adminOnly };
