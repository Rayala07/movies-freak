const OpenAI = require("openai");

/**
 * AI Service — Kineo Mood-Based Discovery
 * ----------------------------------------
 * Uses NVIDIA's OpenAI-compatible API to run Mistral LLM.
 * The client is initialized with NVIDIA's base URL and your NVIDIA API key.
 * No OpenAI account needed — only your NVIDIA key is used.
 */

// TMDB genre name → genre ID mapping
// We tell the LLM to return genre names (human-readable),
// then convert them here before calling TMDB.
const GENRE_MAP = {
  action: 28,
  adventure: 12,
  animation: 16,
  comedy: 35,
  crime: 80,
  documentary: 99,
  drama: 18,
  family: 10751,
  fantasy: 14,
  history: 36,
  horror: 27,
  music: 10402,
  mystery: 9648,
  romance: 10749,
  "science fiction": 878,
  "sci-fi": 878,
  scifi: 878,
  "tv movie": 10770,
  thriller: 53,
  war: 10752,
  western: 37,
};

/**
 * Initialize the OpenAI client pointed at NVIDIA's inference endpoint.
 * This works because NVIDIA exposes an OpenAI-compatible /v1/chat/completions API.
 */
const getClient = () => {
  if (!process.env.MISTRAL_API_KEY) {
    throw new Error("MISTRAL_API_KEY is not set in environment variables.");
  }
  return new OpenAI({
    apiKey: process.env.MISTRAL_API_KEY,
    baseURL: "https://integrate.api.nvidia.com/v1",
  });
};

/**
 * buildContextString
 * ------------------
 * Takes the user's watch history and favorites from MongoDB and builds
 * a plain-text string to inject into the prompt.
 * This allows the LLM to avoid recommending already-watched content
 * and understand the user's taste.
 *
 * @param {Array} watchHistory - Last N WatchHistory documents
 * @param {Array} favorites    - User's Favorite documents
 * @returns {string}
 */
const buildContextString = (watchHistory, favorites) => {
  const watchedTitles = watchHistory
    .map((h) => h.movieData?.title)
    .filter(Boolean);

  const favoriteTitles = favorites
    .map((f) => f.movieData?.title)
    .filter(Boolean);

  let context = "";

  if (watchedTitles.length > 0) {
    context += `User has recently watched: ${watchedTitles.join(", ")}. `;
  }
  if (favoriteTitles.length > 0) {
    context += `User's favorite movies/shows: ${favoriteTitles.join(", ")}. `;
  }
  if (!context) {
    context = "No personal history available — treat this as a fresh user. ";
  }

  return context;
};

/**
 * parseMoodToTMDBParams
 * ----------------------
 * Core function: sends the user's mood string to Mistral via NVIDIA API.
 * Returns a structured object of TMDB discovery parameters + a human-readable rationale.
 *
 * Prompt engineering strategy:
 *   - Role: Expert film curator
 *   - Task: Parse mood → structured JSON
 *   - Context: User history injected to avoid already-seen content
 *   - Output format: Strict JSON schema (prevents hallucinations)
 *   - Safety: Fallback values if LLM returns unexpected output
 *
 * @param {string} moodText    - Free-form mood input from the user
 * @param {Array}  watchHistory - User's recent watch history
 * @param {Array}  favorites    - User's favorites
 * @returns {Object} { genres, genreIds, keywords, minRating, sortBy, rationale }
 */
const parseMoodToTMDBParams = async (moodText, watchHistory = [], favorites = []) => {
  const client = getClient();

  const contextString = buildContextString(watchHistory, favorites);

  const systemPrompt = `You are an expert film curator for Kineo, a premium movie discovery platform.
Your job is to analyze a user's mood and return a JSON object of movie discovery parameters.

RULES:
1. Return ONLY valid JSON. No explanation, no markdown, no code blocks.
2. genres must be an array of 1-3 strings from this list ONLY: action, adventure, animation, comedy, crime, documentary, drama, family, fantasy, history, horror, music, mystery, romance, science fiction, thriller, war, western.
3. keywords must be an array of 1-4 short strings (e.g. "redemption arc", "underdog story", "plot twist") that describe the mood.
4. minRating must be a number between 0 and 10. For casual moods use 6.5, for quality-focused moods use 7.5.
5. sortBy must be one of: "popularity.desc", "vote_average.desc", "release_date.desc".
6. rationale must be a single sentence (max 15 words) explaining why these picks match the mood.
7. Never recommend content from the user's watch history.

OUTPUT SCHEMA (return exactly this structure):
{
  "genres": ["string"],
  "keywords": ["string"],
  "minRating": number,
  "sortBy": "string",
  "rationale": "string"
}`;

  const userPrompt = `User mood: "${moodText}"
User context: ${contextString}
Return the JSON discovery parameters now.`;

  try {
    const response = await client.chat.completions.create({
      model: "mistralai/mistral-7b-instruct-v0.3",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.4,  // Low temperature = more predictable, structured output
      max_tokens: 300,
      response_format: { type: "json_object" },
    });

    const raw = response.choices[0]?.message?.content;
    if (!raw) throw new Error("Empty response from Mistral");

    const parsed = JSON.parse(raw);

    // Resolve genre names → TMDB genre IDs
    const genreIds = (parsed.genres || [])
      .map((g) => GENRE_MAP[g.toLowerCase().trim()])
      .filter(Boolean);

    return {
      genres: parsed.genres || [],
      genreIds,
      keywords: parsed.keywords || [],
      minRating: parsed.minRating ?? 6.5,
      sortBy: parsed.sortBy || "popularity.desc",
      rationale: parsed.rationale || "Curated picks based on your mood.",
    };
  } catch (err) {
    console.error("[ai.service] Mistral parse error:", err.message);
    // Graceful fallback — return popular movies if LLM fails
    return {
      genres: [],
      genreIds: [],
      keywords: [],
      minRating: 6.5,
      sortBy: "popularity.desc",
      rationale: "Top picks for you right now.",
    };
  }
};

module.exports = { parseMoodToTMDBParams };
