const express = require("express");
const router = express.Router();

const { getAllUsers, banUser, deleteUser } = require("../controllers/user.controller");
const { protectRoute } = require("../middleware/auth.middleware");
const { adminOnly } = require("../middleware/admin.middleware");

/**
 * User Management Routes (Admin only)
 * -------------------------------------
 * Base path: /api/users  (mounted in app.js)
 *
 * ALL routes require protectRoute + adminOnly — regular users have zero access.
 *
 *   GET    /api/users         → list all users
 *   PATCH  /api/users/:id/ban → toggle ban/unban a user
 *   DELETE /api/users/:id     → permanently delete a user
 *
 * Safety rules enforced in controller:
 *   - Admin cannot ban themselves
 *   - Admin cannot delete themselves
 */

router.get("/", protectRoute, adminOnly, getAllUsers);
router.patch("/:id/ban", protectRoute, adminOnly, banUser);
router.delete("/:id", protectRoute, adminOnly, deleteUser);

module.exports = router;
