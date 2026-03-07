const mongoose = require("mongoose");

/**
 * BlacklistedToken Schema
 * ------------------------
 * When a user logs out, their current JWT is stored here.
 *
 * Why?
 *   JWT tokens are stateless — once issued, they remain valid until expiry.
 *   Without a blacklist, a stolen token can be used even AFTER the real user logs out.
 *   By storing the token here on logout, the auth middleware can reject it
 *   even if the JWT signature is technically still valid.
 *
 * Auto-expiry:
 *   The `expiresAt` field with a TTL index tells MongoDB to automatically
 *   delete this document once the token's own expiry time is reached.
 *   This prevents the collection from growing forever.
 */
const blacklistedTokenSchema = new mongoose.Schema({
  // The full JWT string that has been invalidated
  token: {
    type: String,
    required: true,
    unique: true,
  },

  // When the token naturally expires — MongoDB auto-deletes the document at this time
  // This must match the JWT's own expiry (7 days from issue)
  expiresAt: {
    type: Date,
    required: true,
  },
});

/**
 * TTL Index
 * ---------
 * MongoDB removes the document automatically when `expiresAt` is reached.
 * `expireAfterSeconds: 0` means "delete at exactly the expiresAt time".
 * This keeps the blacklist collection clean without any manual cleanup.
 */
blacklistedTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("BlacklistedToken", blacklistedTokenSchema);
