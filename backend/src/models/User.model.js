const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

/**
 * User Schema
 * -----------
 * Represents every registered user in the platform.
 * Roles: "user" (default) or "admin" (manually set in DB).
 * Passwords are NOT stored as plain text — bcrypt hashes them before saving.
 */
const userSchema = new mongoose.Schema(
  {
    // Full name of the user
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },

    // Email must be unique — used as login identifier
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    // Stored as a bcrypt hash — never expose this in API responses
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false,
    },

    // "user" = normal user, "admin" = has access to admin dashboard
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    // Admin can ban a user — banned users cannot log in
    isBanned: {
      type: Boolean,
      default: false,
    },
  },
  {
    // Automatically adds createdAt and updatedAt fields
    timestamps: true,
  }
);

/**
 * Pre-save Hook
 * -------------
 * Runs automatically BEFORE saving a user document to the DB.
 * Hashes the password only if it was newly set or modified.
 * This ensures we never store a plain text password.
 *
 * ⚠️ Mongoose v7+ Rule:
 * When using async functions in pre hooks, do NOT use the next() callback.
 * Just use async/await — return to skip, throw to signal an error.
 * Mongoose handles the rest automatically.
 */
userSchema.pre("save", async function () {
  // Only hash if the password field was changed (or is new)
  if (!this.isModified("password")) return;

  // Salt rounds = 10 (higher = more secure, but slower)
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

/**
 * Instance Method: comparePassword
 * ---------------------------------
 * Called during login to compare the entered password
 * against the stored hash. Returns true if they match.
 */
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
