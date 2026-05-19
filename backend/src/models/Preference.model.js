const mongoose = require("mongoose");

/**
 * Preference Model (Group Mode)
 * -----------------------------
 * Represents a single user's input within a group session.
 * We store these separately from the Session model so multiple guests
 * can push their preferences concurrently without document locking issues.
 */
const preferenceSchema = new mongoose.Schema(
  {
    // The session this belongs to (ties back to Session.sessionId)
    sessionId: {
      type: String,
      required: true,
      index: true,
    },
    // The guest's display name
    memberName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 30,
    },
    // What they typed ("something fun", "thriller", etc.)
    preferenceText: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500, // generous limit for descriptions
    },
    // TTL Index matching the session (expires after 24 hours)
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 86400,
    },
  },
  { timestamps: true }
);

// A member can only submit once per session
preferenceSchema.index({ sessionId: 1, memberName: 1 }, { unique: true });

module.exports = mongoose.model("Preference", preferenceSchema);
