const User = require("../models/User.model");

/**
 * @route   GET /api/users
 * @desc    Admin — Get all registered users
 * @access  Protected + Admin only
 *
 * Returns all users sorted by newest registration first.
 * Password is excluded automatically (select: false in User model).
 * Admin uses this to view and manage all platform users.
 */
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────

/**
 * @route   PATCH /api/users/:id/ban
 * @desc    Admin — Toggle ban/unban a user
 * @access  Protected + Admin only
 *
 * This single endpoint handles BOTH banning AND unbanning.
 * It flips the current isBanned state:
 *   isBanned: false → sets to true  (user is banned)
 *   isBanned: true  → sets to false (user is unbanned)
 *
 * Effect of ban:
 *   The protectRoute middleware checks isBanned on every request.
 *   A banned user's existing valid token will be rejected with 403.
 *
 * Safety Rule:
 *   Admin cannot ban themselves — this would lock them out of the system.
 */
const banUser = async (req, res, next) => {
  try {
    // Safety check: admin cannot ban themselves
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot ban your own account.",
      });
    }

    // Find the user to be banned/unbanned
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Toggle: flip the current isBanned value
    user.isBanned = !user.isBanned;
    await user.save();

    res.status(200).json({
      success: true,
      message: user.isBanned
        ? `${user.name} has been banned.`
        : `${user.name} has been unbanned.`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isBanned: user.isBanned,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────

/**
 * @route   DELETE /api/users/:id
 * @desc    Admin — Permanently delete a user account
 * @access  Protected + Admin only
 *
 * Removes the user document from the database entirely.
 * Their favorites, watchlist, and history are orphaned (not cascaded).
 *
 * Safety Rule:
 *   Admin cannot delete their own account — this would permanently
 *   remove the admin from the platform with no way to recover.
 */
const deleteUser = async (req, res, next) => {
  try {
    // Safety check: admin cannot delete themselves
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own account.",
      });
    }

    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: `User "${user.name}" has been permanently deleted.`,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllUsers, banUser, deleteUser };
