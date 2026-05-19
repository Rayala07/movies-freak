const mongoose = require("mongoose");
const { nanoid } = require("nanoid");

/**
 * Session Model (Group Mode)
 * --------------------------
 * Represents a room where multiple people submit movie preferences.
 * Uses a short UUID for easy link sharing.
 * Auto-expires after 24 hours to keep the database clean.
 */
const sessionSchema = new mongoose.Schema(
  {
    // The shareable link ID (e.g., /discover/abc-123)
    sessionId: {
      type: String,
      required: true,
      unique: true,
      default: () => nanoid(10), // 10 chars is plenty for collision resistance here
    },
    // The user who created the room
    hostUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    hostName: {
      type: String,
      required: true,
    },
    // Expected size of the group
    expectedMembers: {
      type: Number,
      required: true,
      min: 2,
      max: 10,
    },
    // State machine: waiting → discovering → results
    status: {
      type: String,
      enum: ["waiting", "discovering", "results"],
      default: "waiting",
    },
    // Stored results from Gemini/TMDB after the group is reconciled
    // So latecomers can still see the outcome
    results: {
      type: Object,
      default: null,
    },
    // TTL Index: automatically delete the document 24 hours after creation
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 86400, // 24 hours in seconds
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Session", sessionSchema);
