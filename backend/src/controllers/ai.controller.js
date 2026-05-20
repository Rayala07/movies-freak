const aiService = require("../services/ai.service");

/**
 * AI Controller (Refactored for Clean Architecture)
 * =================================================
 * Handles HTTP requests and responses. Delegates business logic to ai.service.js.
 */

/**
 * @route   POST /api/ai/discover
 * @desc    Get AI parameters for movie discovery
 */
const soloDiscover = async (req, res, next) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    const aiParams = await aiService.getDiscoverParams(message, conversationHistory);

    return res.status(200).json({
      success: true,
      aiParams,
    });
  } catch (error) {
    if (error.message === "EMPTY_MESSAGE") {
      return res.status(400).json({
        success: false,
        message: "Please describe what kind of movie you're looking for.",
      });
    }

    if (error.message === "MISSING_API_KEY" || error.message?.includes("API key")) {
      return res.status(500).json({
        success: false,
        message: "AI service is not configured. Please check the API key.",
      });
    }

    if (error.message === "JSON_PARSE_ERROR") {
      return res.status(500).json({
        success: false,
        message: "I had trouble understanding that. Could you rephrase your request?",
      });
    }

    if (error.message?.includes("quota") || error.message?.includes("429")) {
      return res.status(429).json({
        success: false,
        message: "AI service is currently at capacity. Please try again later.",
      });
    }

    // Pass unexpected errors to global error handler
    next(error);
  }
};

module.exports = { soloDiscover };
