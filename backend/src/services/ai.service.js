const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
const { HumanMessage, SystemMessage } = require("@langchain/core/messages");

/**
 * AI Service
 * ==========
 * Handles the core business logic for AI communications.
 */

const SYSTEM_PROMPT = `You are a movie recommendation engine. Your job is to interpret natural language input from a user describing what kind of movie they want to watch and extract structured search parameters for the TMDB API.

The user may describe:
- A mood or feeling ("something uplifting", "dark and twisted")
- A vague situation ("movie night with my parents", "can't sleep")
- A reference to another movie ("like Parasite but funnier", "similar to Interstellar")
- Genre mashups ("romantic comedy with sci-fi elements")
- Time period preferences ("90s classics", "recent releases")
- Multi-turn follow-ups ("less intense", "something older", "more like the second result")

You MUST respond with ONLY a valid JSON object. No markdown, no backticks, no explanation outside the JSON.

The JSON must have exactly these fields:
{
  "with_genres": "comma-separated TMDB genre IDs (Action=28, Adventure=12, Animation=16, Comedy=35, Crime=80, Documentary=99, Drama=18, Family=10751, Fantasy=14, History=36, Horror=27, Music=10402, Mystery=9648, Romance=10749, Science Fiction=878, TV Movie=10770, Thriller=53, War=10752, Western=37)",
  "sort_by": "one of: popularity.desc, vote_average.desc, primary_release_date.desc, revenue.desc",
  "primary_release_date_gte": "YYYY-MM-DD or empty string if not applicable",
  "primary_release_date_lte": "YYYY-MM-DD or empty string if not applicable",
  "vote_average_gte": "number between 0-10 or empty string if not applicable",
  "with_original_language": "ISO 639-1 code (e.g. en, ko, ja) or empty string if not applicable",
  "reference_movie": "exact movie title if the user mentions a specific film, otherwise empty string",
  "reasoning": "one clear sentence explaining what you understood from the user's request — the user will see this",
  "vibe_tag": "exactly one word from this list: cozy, dark, mind-bending, emotional, thrilling, adventurous, nostalgic, weird, heartwarming, intense, dreamy, gritty, fun, epic, peaceful, mysterious, romantic, inspiring, haunting, whimsical"
}

Rules:
1. Use empty strings for any parameter you cannot confidently determine.
2. For follow-up messages, the conversation history is included. Use it to understand context.
3. If the user mentions a specific movie by name, ALWAYS set reference_movie to that title.
4. Keep reasoning concise (one sentence) but insightful.
5. Choose vibe_tag carefully — it should capture the emotional essence of the request.
6. Prefer sort_by "popularity.desc" unless the user specifically asks for highest-rated or newest.
7. NEVER return anything outside the JSON object. Just raw JSON.`;

const parseGeminiJSON = (text) => {
  try {
    return JSON.parse(text.trim());
  } catch {
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[1].trim());
      } catch {
        // Fall through
      }
    }
    const braceMatch = text.match(/\{[\s\S]*\}/);
    if (braceMatch) {
      try {
        return JSON.parse(braceMatch[0]);
      } catch {
        // All attempts failed
      }
    }
    throw new Error("JSON_PARSE_ERROR");
  }
};

class AIService {
  constructor() {
    this.geminiModel = null;
  }

  // Lazy load model to ensure env vars are populated
  getModel() {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("MISSING_API_KEY");
    }
    
    if (!this.geminiModel) {
      this.geminiModel = new ChatGoogleGenerativeAI({
        model: "gemini-flash-latest",
        apiKey: process.env.GEMINI_API_KEY,
        temperature: 0.7,
      });
    }
    return this.geminiModel;
  }

  /**
   * Processes a user's natural language request and returns structured TMDB parameters
   * @param {string} message - The user's input
   * @param {Array} conversationHistory - Previous messages for context
   * @returns {Object} Extracted JSON parameters
   */
  async getDiscoverParams(message, conversationHistory = []) {
    if (!message || !message.trim()) {
      throw new Error("EMPTY_MESSAGE");
    }

    const model = this.getModel();

    const trimmedHistory = conversationHistory.slice(-10);
    const messages = [new SystemMessage(SYSTEM_PROMPT)];
    
    for (const msg of trimmedHistory) {
      if (msg.role === "user") {
        messages.push(new HumanMessage(msg.content));
      }
    }
    messages.push(new HumanMessage(message));

    const response = await model.invoke(messages);
    return parseGeminiJSON(response.content);
  }
}

module.exports = new AIService();
