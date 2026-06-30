/**
 * validateMoodSearch — Request Validation Middleware
 * ---------------------------------------------------
 * Sits between protectRoute and the moodSearch controller.
 * Validates and sanitizes the incoming mood string before
 * any expensive LLM or DB call is made.
 *
 * Checks:
 *   1. Body must be JSON (Content-Type enforcement)
 *   2. mood field must be present
 *   3. mood must be a string
 *   4. mood must be at least 5 characters (too short = meaningless)
 *   5. mood must be at most 500 characters (prevents prompt injection & token abuse)
 *   6. mood must not be pure whitespace
 *   7. mood must not contain suspicious prompt-injection patterns
 *
 * On pass: attaches `req.sanitizedMood` (trimmed) and calls next().
 * On fail: returns 400 immediately — controller never runs.
 */

// Patterns that suggest prompt injection attempts.
// We don't need to be paranoid, just block obvious structural attacks.
const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?previous\s+instructions/i,
  /system\s*:/i,
  /\<\|im_start\|\>/i,  // ChatML injection token
  /\<\|endoftext\|\>/i,  // GPT-2 token
  /\[INST\]/i,           // Mistral instruction token
  /\[\/INST\]/i,
];

const validateMoodSearch = (req, res, next) => {
  const { mood } = req.body;

  // 1. Field presence
  if (mood === undefined || mood === null) {
    return res.status(400).json({
      success: false,
      message: "Request body must include a 'mood' field.",
    });
  }

  // 2. Type check
  if (typeof mood !== "string") {
    return res.status(400).json({
      success: false,
      message: "'mood' must be a string.",
    });
  }

  const trimmed = mood.trim();

  // 3. Empty / whitespace check
  if (trimmed.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Mood cannot be empty or only whitespace.",
    });
  }

  // 4. Minimum length
  if (trimmed.length < 5) {
    return res.status(400).json({
      success: false,
      message: "Please describe your mood in at least 5 characters.",
    });
  }

  // 5. Maximum length — hard cap to prevent prompt injection & token abuse
  if (trimmed.length > 500) {
    return res.status(400).json({
      success: false,
      message: "Mood description must be 500 characters or fewer.",
    });
  }

  // 6. Prompt injection guard
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(trimmed)) {
      return res.status(400).json({
        success: false,
        message: "Invalid input. Please describe your movie mood naturally.",
      });
    }
  }

  // All checks passed — attach sanitized value for the controller
  req.sanitizedMood = trimmed;
  next();
};

module.exports = { validateMoodSearch };
