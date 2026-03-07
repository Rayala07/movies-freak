const jwt = require("jsonwebtoken");
const User = require("../models/User.model");
const BlacklistedToken = require("../models/BlacklistedToken.model");


/**
 * Helper Function — generateTokenAndSetCookie
 * ---------------------------------------------
 * Creates a signed JWT token and stores it in an httpOnly browser cookie.
 *
 * JWT Payload includes:
 *   - id   → used to fetch the user on protected routes
 *   - role → used by the frontend (via /me) to show/hide Admin Dashboard
 *
 * @param {Object} res    - Express response object (to set the cookie)
 * @param {Object} user   - The User document from MongoDB
 */
const generateTokenAndSetCookie = (res, user) => {
  // Sign the JWT with user id and role — expires in 7 days
  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" },
  );

  // Set the token as an httpOnly cookie in the browser
  res.cookie("token", token, {
    httpOnly: true, // JS cannot access this cookie (XSS protection)
    secure: process.env.NODE_ENV === "production", // HTTPS only in production
    sameSite: "strict", // Prevents CSRF attacks
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  });
};

// ─────────────────────────────────────────────────────────────────────────────

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user account
 * @access  Public
 *
 * Request body: { name, email, password }
 * On success: sets httpOnly cookie + returns user data (no password)
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Step 1: Validate that all required fields are provided
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, email, and password.",
      });
    }

    // Step 1b: Validate password length — must be at least 6 characters
    // This matches the minlength: 6 constraint set in User.model.js
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long.",
      });
    }

    // Step 2: Check if a user with this email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    // Step 3: Create the new user
    // Password is automatically hashed by the pre-save hook in User.model.js
    const user = await User.create({ name, email, password });

    // Step 4: Generate JWT and set it in the httpOnly cookie
    generateTokenAndSetCookie(res, user);

    // Step 5: Return the new user's data (exclude password from response)
    res.status(201).json({
      success: true,
      message: "Account created successfully.",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role, // frontend uses this to show/hide Admin Dashboard
        isBanned: user.isBanned,
      },
    });
  } catch (error) {
    next(error); // passes to global error handler in error.middleware.js
  }
};

// ─────────────────────────────────────────────────────────────────────────────

/**
 * @route   POST /api/auth/login
 * @desc    Log in with email and password
 * @access  Public
 *
 * Request body: { email, password }
 * On success: sets httpOnly cookie + returns user data (no password)
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Step 1: Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password.",
      });
    }

    // Step 2: Find user by email
    // We use .select("+password") to include the password field
    // because it is set to { select: false } in the User model
    const user = await User.findOne({ email }).select("+password");

    // Step 3: If no user found with that email
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Step 4: Check if the user is banned
    if (user.isBanned) {
      return res.status(403).json({
        success: false,
        message: "Your account has been banned. Contact support.",
      });
    }

    // Step 5: Compare the entered password with the stored hash
    // comparePassword() is the instance method defined in User.model.js
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Step 6: Generate JWT and set it in the httpOnly cookie
    generateTokenAndSetCookie(res, user);

    // Step 7: Return user data (exclude password from response)
    res.status(200).json({
      success: true,
      message: "Logged in successfully.",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role, // frontend uses this to show/hide Admin Dashboard
        isBanned: user.isBanned,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────

/**
 * @route   POST /api/auth/logout
 * @desc    Log out the current user
 * @access  Public
 *
 * Steps:
 *   1. Read the "token" cookie from the request
 *   2. Store it in the BlacklistedToken collection (invalidates it immediately)
 *   3. Clear the cookie from the browser
 *
 * Why blacklist the token?
 *   JWT tokens stay cryptographically valid until they expire (7 days).
 *   Simply clearing the cookie isn't enough — if someone copied the token
 *   before logout, they could still use it. Blacklisting the token ensures
 *   the protectRoute middleware will reject it even if presented again.
 */
const logout = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    // If there's a token in the cookie, blacklist it
    if (token) {
      // Store the token in the blacklist with a 7-day expiry
      // MongoDB TTL index on BlacklistedToken will auto-delete it after expiry
      await BlacklistedToken.create({
        token,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });
    }

    // Clear the "token" cookie from the browser
    res.cookie("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 0, // expires immediately
    });

    res.status(200).json({
      success: true,
      message: "Logged out successfully.",
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────

/**
 * @route   GET /api/auth/me
 * @desc    Get the currently logged-in user's data
 * @access  Protected (requires valid token cookie)
 *
 * This is called by the frontend on every app load to:
 *   1. Check if the user's session is still valid
 *   2. Get the user's role to show/hide the Admin Dashboard link
 *
 * req.user is already attached by protectRoute middleware.
 */
const getMe = async (req, res, next) => {
  try {
    // req.user is set by protectRoute middleware — just return it
    res.status(200).json({
      success: true,
      user: {
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        isBanned: req.user.isBanned,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, logout, getMe };
