const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
const { HumanMessage, SystemMessage } = require("@langchain/core/messages");
const Session = require("../models/Session.model");
const Preference = require("../models/Preference.model");

/**
 * AI Controller
 * =============
 * Handles the AI-powered movie discovery feature.
 * Uses Google Gemini (via LangChain) to interpret natural language
 * and extract TMDB search parameters, then calls TMDB to fetch movies.
 *
 * Flow:
 *   1. User sends a natural language message ("cozy rainy night movies")
 *   2. We send it to Gemini with a system prompt that extracts TMDB params
 *   3. Gemini returns JSON: { with_genres, sort_by, reasoning, vibe_tag, ... }
 *   4. We call TMDB /discover/movie with those params
 *   5. If the user mentioned a specific film ("like Interstellar"),
 *      we also call TMDB /search/movie → /movie/{id}/similar
 *   6. If results are empty, retry with relaxed constraints
 *   7. Return movies + reasoning + vibe_tag to frontend
 */

// ─── Gemini Model Setup ─────────────────────────────────────────────────────

/**
 * Initialize the Gemini model via LangChain.
 * We use gemini-2.0-flash for fast, cost-effective responses.
 * The API key comes from the backend .env (never exposed to frontend).
 */
const geminiModel = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
  apiKey: process.env.GEMINI_API_KEY,
  temperature: 0.7,
});

// ─── TMDB Helper ────────────────────────────────────────────────────────────

/**
 * Makes a request to the TMDB API.
 * Uses the same read access token stored in backend .env.
 *
 * @param {string} endpoint - TMDB API path (e.g. "/discover/movie")
 * @param {Object} params   - Query parameters to send
 * @returns {Object}        - Parsed JSON response from TMDB
 */
const callTMDB = async (endpoint, params = {}) => {
  const url = new URL(`https://api.themoviedb.org/3${endpoint}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== "" && value !== undefined && value !== null) {
      url.searchParams.append(key, value);
    }
  });

  // AbortController gives us a hard 12-second timeout.
  // Without this, a dropped TMDB connection hangs the entire request forever.
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);

  try {
    const response = await fetch(url.toString(), {
      signal: controller.signal,
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${process.env.TMDB_READ_ACCESS_TOKEN}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`TMDB API error (${response.status}): ${errorText}`);
    }

    return response.json();
  } finally {
    clearTimeout(timeout);
  }
};


// ─── System Prompt ──────────────────────────────────────────────────────────

/**
 * The system prompt tells Gemini exactly what to do:
 *   - Interpret the user's mood/description
 *   - Extract structured TMDB search parameters as JSON
 *   - Provide a one-sentence reasoning + a one-word vibe tag
 *
 * We list all TMDB genre IDs so Gemini picks the right ones.
 * We're strict about JSON-only output to make parsing reliable.
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
2. For follow-up messages, the conversation history is included. Use it to understand context (e.g. "less intense" means reduce the intensity of the previous recommendation).
3. If the user mentions a specific movie by name, ALWAYS set reference_movie to that title.
4. Keep reasoning concise (one sentence) but insightful.
5. Choose vibe_tag carefully — it should capture the emotional essence of the request.
6. Prefer sort_by "popularity.desc" unless the user specifically asks for highest-rated or newest.
7. NEVER return anything outside the JSON object. No markdown. No backticks. Just raw JSON.`;

// ─── JSON Parsing Helper ────────────────────────────────────────────────────

/**
 * Extracts a JSON object from Gemini's response text.
 *
 * Sometimes Gemini wraps the JSON in markdown code fences (```json ... ```)
 * even though we told it not to. This function handles both cases:
 *   1. Try parsing the raw text directly
 *   2. If that fails, use regex to find JSON within code fences
 *   3. If both fail, throw a clear error
 *
 * @param {string} text - Raw text response from Gemini
 * @returns {Object}    - Parsed JSON object
 */
const parseGeminiJSON = (text) => {
  // Attempt 1: Direct parse (ideal case — Gemini returns clean JSON)
  try {
    return JSON.parse(text.trim());
  } catch {
    // Attempt 2: Extract from markdown code fences
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[1].trim());
      } catch {
        // Fall through to attempt 3
      }
    }

    // Attempt 3: Find the first { ... } block in the text
    const braceMatch = text.match(/\{[\s\S]*\}/);
    if (braceMatch) {
      try {
        return JSON.parse(braceMatch[0]);
      } catch {
        // All attempts failed
      }
    }

    throw new Error("Could not parse AI response as JSON");
  }
};

// ─── TMDB Discover Call with Retry ──────────────────────────────────────────

/**
 * Calls TMDB /discover/movie with the AI-extracted parameters.
 *
 * If the first call returns 0 results, we retry with progressively
 * relaxed constraints. This prevents the "too specific" problem where
 * the AI picks very niche filters and TMDB finds nothing.
 *
 * Relaxation order:
 *   Drop 1: Remove date range (primary_release_date_gte/lte)
 *   Drop 2: Remove language filter (with_original_language)
 *   Drop 3: Remove vote average threshold (vote_average_gte)
 *
 * @param {Object} params   - AI-extracted TMDB parameters
 * @returns {Object}        - { movies: [...], isRelaxed: boolean, paramsUsed: {...} }
 */
const discoverWithRetry = async (params) => {
  // Build the initial TMDB query params
  const baseParams = {
    language: "en-US",
    include_adult: false,
    page: 1,
    sort_by: params.sort_by || "popularity.desc",
  };

  // Only add non-empty values
  if (params.with_genres) baseParams.with_genres = params.with_genres;
  if (params.vote_average_gte)
    baseParams["vote_average.gte"] = params.vote_average_gte;
  if (params.with_original_language)
    baseParams.with_original_language = params.with_original_language;
  if (params.primary_release_date_gte)
    baseParams["primary_release_date.gte"] = params.primary_release_date_gte;
  if (params.primary_release_date_lte)
    baseParams["primary_release_date.lte"] = params.primary_release_date_lte;

  // Attempt 1: Full params
  let data = await callTMDB("/discover/movie", baseParams);
  if (data.results && data.results.length > 0) {
    return {
      movies: data.results,
      isRelaxed: false,
      paramsUsed: { ...baseParams },
    };
  }

  // Attempt 2: Drop date range
  const relaxed1 = { ...baseParams };
  delete relaxed1["primary_release_date.gte"];
  delete relaxed1["primary_release_date.lte"];
  data = await callTMDB("/discover/movie", relaxed1);
  if (data.results && data.results.length > 0) {
    return { movies: data.results, isRelaxed: true, paramsUsed: relaxed1 };
  }

  // Attempt 3: Also drop language
  const relaxed2 = { ...relaxed1 };
  delete relaxed2.with_original_language;
  data = await callTMDB("/discover/movie", relaxed2);
  if (data.results && data.results.length > 0) {
    return { movies: data.results, isRelaxed: true, paramsUsed: relaxed2 };
  }

  // Attempt 4: Also drop vote threshold — most relaxed
  const relaxed3 = { ...relaxed2 };
  delete relaxed3["vote_average.gte"];
  data = await callTMDB("/discover/movie", relaxed3);
  return {
    movies: data.results || [],
    isRelaxed: true,
    paramsUsed: relaxed3,
  };
};

// ─── Reference Movie Handler ────────────────────────────────────────────────

/**
 * If the user mentioned a specific movie ("like Interstellar"),
 * this function finds that movie on TMDB and gets similar movies.
 *
 * Flow:
 *   1. Search TMDB for the movie title → get TMDB ID
 *   2. Call /movie/{id}/similar → get similar movies
 *
 * If the movie isn't found or the similar endpoint returns nothing,
 * we return an empty array — the main discover flow will still work.
 *
 * @param {string} movieTitle - The movie name extracted by AI
 * @returns {Array}           - Array of similar movies, or []
 */
const getSimilarMovies = async (movieTitle) => {
  try {
    // Step 1: Search for the movie by title
    const searchData = await callTMDB("/search/movie", {
      query: movieTitle,
      language: "en-US",
      page: 1,
    });

    if (!searchData.results || searchData.results.length === 0) {
      return [];
    }

    // Take the first (most relevant) result
    const movieId = searchData.results[0].id;

    // Step 2: Get similar movies
    const similarData = await callTMDB(`/movie/${movieId}/similar`, {
      language: "en-US",
      page: 1,
    });

    return similarData.results || [];
  } catch {
    // If anything fails, return empty — don't break the main flow
    return [];
  }
};

// ─── Main Controller: Solo Discover ─────────────────────────────────────────

/**
 * @route   POST /api/ai/discover
 * @desc    AI-powered movie discovery (solo mode)
 * @access  Protected (logged-in users only)
 *
 * Request body:
 *   {
 *     message              : "something cozy for a rainy night"  ← user's input
 *     conversationHistory  : [                                    ← previous messages (optional)
 *       { role: "user", content: "thriller movies" },
 *       { role: "ai", content: "..." }
 *     ]
 *   }
 *
 * Response:
 *   {
 *     success   : true,
 *     reasoning : "Looking for warm, comforting dramas...",
 *     vibeTag   : "cozy",
 *     movies    : [ { id, title, poster_path, vote_average, ... }, ... ],
 *     isRelaxed : false,          ← true if we had to loosen filters
 *     paramsUsed: { ... }         ← the actual TMDB params that were used
 *   }
 */
const soloDiscover = async (req, res, next) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    // Step 1: Validate input — don't waste an AI call on empty text
    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please describe what kind of movie you're looking for.",
      });
    }

    // Step 2: Check if Gemini API key is configured
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        success: false,
        message:
          "AI service is not configured. Please add GEMINI_API_KEY to the server environment.",
      });
    }

    // Step 3: Build the message array for Gemini
    // We include the conversation history so Gemini understands follow-ups
    // like "less intense" or "something older" in context.
    // We limit history to the last 10 messages to keep token usage reasonable.
    const trimmedHistory = conversationHistory.slice(-10);

    const messages = [new SystemMessage(SYSTEM_PROMPT)];

    // Add conversation history as alternating human/AI messages
    for (const msg of trimmedHistory) {
      if (msg.role === "user") {
        messages.push(new HumanMessage(msg.content));
      }
      // We skip AI messages in history — Gemini doesn't need its own past responses
      // to understand the user's follow-ups. The user messages provide enough context.
    }

    // Add the current user message
    messages.push(new HumanMessage(message));

    // Step 4: Call Gemini
    const response = await geminiModel.invoke(messages);
    const rawText = response.content;

    // Step 5: Parse Gemini's JSON response
    let aiParams;
    try {
      aiParams = parseGeminiJSON(rawText);
    } catch {
      return res.status(500).json({
        success: false,
        message:
          "I had trouble understanding that. Could you rephrase your request?",
      });
    }

    // Step 6: Handle reference movie (if the user mentioned a specific film)
    // e.g. "like Interstellar" → find similar movies via TMDB
    let similarMovies = [];
    if (aiParams.reference_movie) {
      similarMovies = await getSimilarMovies(aiParams.reference_movie);
    }

    // Step 7: Call TMDB /discover/movie with AI-extracted params
    const discoverResult = await discoverWithRetry(aiParams);

    // Step 8: Merge results — similar movies first (more relevant), then discover results
    // Remove duplicates by TMDB ID
    let allMovies = [];
    const seenIds = new Set();

    // Add similar movies first (higher relevance when user referenced a film)
    for (const movie of similarMovies) {
      if (!seenIds.has(movie.id) && movie.poster_path) {
        seenIds.add(movie.id);
        allMovies.push(movie);
      }
    }

    // Then add discover results
    for (const movie of discoverResult.movies) {
      if (!seenIds.has(movie.id) && movie.poster_path) {
        seenIds.add(movie.id);
        allMovies.push(movie);
      }
    }

    // Cap at 20 results — more than enough for a clean UI
    allMovies = allMovies.slice(0, 20);

    // Step 9: Send the response back to the frontend
    res.status(200).json({
      success: true,
      reasoning: aiParams.reasoning || "Here are some movies you might enjoy.",
      vibeTag: aiParams.vibe_tag || "fun",
      movies: allMovies,
      isRelaxed: discoverResult.isRelaxed,
      paramsUsed: discoverResult.paramsUsed,
      referenceMovie: aiParams.reference_movie || null,
    });
  } catch (error) {
    // Handle specific Gemini API errors with clear messages
    if (error.message?.includes("API key")) {
      return res.status(500).json({
        success: false,
        message: "AI service configuration error. Please check the API key.",
      });
    }

    if (error.message?.includes("quota") || error.message?.includes("429")) {
      return res.status(429).json({
        success: false,
        message:
          "AI service is currently at capacity (quota exceeded). Please try again later.",
      });
    }

    // Handle TMDB network failures specifically
    if (
      error.name === "AbortError" ||
      error.message?.includes("fetch failed") ||
      error.message?.includes("ECONNRESET") ||
      error.message?.includes("TMDB API error")
    ) {
      return res.status(503).json({
        success: false,
        message:
          "Could not reach the movie database right now. Please try again in a moment.",
      });
    }

    // Pass any other error to the global error handler
    next(error);
  }
};

// ─── Phase 4: Group Session Management ──────────────────────────────────────

/**
 * @route   POST /api/ai/sessions
 * @desc    Create a new group session room
 * @access  Protected (logged-in host only)
 *
 * Body: { expectedMembers: 3 }
 */
const createSession = async (req, res, next) => {
  try {
    const { expectedMembers } = req.body;

    if (!expectedMembers || expectedMembers < 2 || expectedMembers > 10) {
      return res
        .status(400)
        .json({
          success: false,
          message: "A group must be between 2 and 10 people.",
        });
    }

    const session = await Session.create({
      hostUserId: req.user._id,
      hostName: req.user.name.split(" ")[0], // First name only
      expectedMembers,
    });

    res.status(201).json({ success: true, sessionId: session.sessionId });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/ai/sessions/:sessionId
 * @desc    Get session status and list of submitted members
 * @access  Public (guests need to see this via the link)
 */
const getSession = async (req, res, next) => {
  try {
    const { sessionId } = req.params;

    const session = await Session.findOne({ sessionId });
    if (!session) {
      return res
        .status(404)
        .json({ success: false, message: "Session not found or has expired." });
    }

    // Get all preferences submitted so far
    const preferences = await Preference.find({ sessionId }).sort({
      createdAt: 1,
    });

    // We only return the NAMES to the frontend for the waiting room
    // The actual preference text is kept hidden from other guests to avoid bias
    const members = preferences.map((p) => ({
      name: p.memberName,
      submitted: true,
    }));

    res.status(200).json({
      success: true,
      session: {
        sessionId: session.sessionId,
        hostName: session.hostName,
        expectedMembers: session.expectedMembers,
        status: session.status,
        results: session.results, // Will be populated in Phase 6
      },
      members,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/ai/sessions/:sessionId/join
 * @desc    Guest submits their preference to a room
 * @access  Public (no login needed)
 *
 * Body: { memberName: "Ananya", preferenceText: "comedy movies" }
 */
const joinSession = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const { memberName, preferenceText } = req.body;

    if (!memberName || !preferenceText) {
      return res
        .status(400)
        .json({ success: false, message: "Name and preference are required." });
    }

    // Ensure session exists and is still waiting
    const session = await Session.findOne({ sessionId });
    if (!session) {
      return res
        .status(404)
        .json({ success: false, message: "Session not found." });
    }
    if (session.status !== "waiting") {
      return res
        .status(400)
        .json({
          success: false,
          message: "This session has already finished gathering inputs.",
        });
    }

    // Enforce max capacity
    const currentCount = await Preference.countDocuments({ sessionId });
    if (currentCount >= session.expectedMembers) {
      return res
        .status(400)
        .json({ success: false, message: "This room is already full." });
    }

    // Add preference (unique compound index handles duplicate names)
    try {
      await Preference.create({ sessionId, memberName, preferenceText });
    } catch (err) {
      if (err.code === 11000) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Someone with that name already submitted. Use a different name.",
          });
      }
      throw err;
    }

    res.status(201).json({ success: true, message: "Preference saved." });
  } catch (error) {
    next(error);
  }
};

// ─── Phase 6: Group AI Reconciliation ───────────────────────────────────────

/**
 * The Group System Prompt
 * -----------------------
 * Unlike solo mode (one person), this receives MULTIPLE inputs and asks
 * Gemini to act as a negotiator — find common ground, explain conflicts,
 * return per-person compatibility notes.
 */
const GROUP_SYSTEM_PROMPT = `You are a movie night reconciler. A group of friends want to watch something together but have different tastes. Your job is to find movies that make EVERYONE reasonably happy.

You will receive each person's preference as a labeled input. Analyze all inputs together.

You MUST respond with ONLY a valid JSON object. No markdown, no backticks, no explanation outside the JSON.

The JSON must have exactly these fields:
{
  "with_genres": "comma-separated TMDB genre IDs (Action=28, Adventure=12, Animation=16, Comedy=35, Crime=80, Documentary=99, Drama=18, Family=10751, Fantasy=14, History=36, Horror=27, Music=10402, Mystery=9648, Romance=10749, Science Fiction=878, Thriller=53, War=10752, Western=37)",
  "sort_by": "one of: popularity.desc, vote_average.desc, primary_release_date.desc, revenue.desc",
  "primary_release_date_gte": "YYYY-MM-DD or empty string",
  "primary_release_date_lte": "YYYY-MM-DD or empty string",
  "vote_average_gte": "number 0-10 or empty string",
  "with_original_language": "ISO 639-1 code or empty string",
  "reference_movie": "exact title if anyone mentioned a specific film, otherwise empty string",
  "reasoning": "one sentence — the core common ground you found across all inputs",
  "vibe_tag": "exactly one word from: cozy, dark, mind-bending, emotional, thrilling, adventurous, nostalgic, weird, heartwarming, intense, dreamy, gritty, fun, epic, peaceful, mysterious, romantic, inspiring, haunting, whimsical",
  "group_summary": "2-3 sentences explaining how you balanced everyone's tastes. Be honest about the compromise.",
  "conflict_note": "one sentence describing the main tension between preferences, or empty string if everyone roughly agreed",
  "per_person_notes": [
    { "name": "PersonName", "compatibility": "one sentence why these picks work for this person" }
  ]
}

Rules:
1. Find GENUINE common ground — do not just pick the most popular genre.
2. If tastes conflict, acknowledge it in conflict_note and explain your compromise in group_summary.
3. If there is no real overlap, pick something crowd-pleasing for the group's overall profile.
4. Fill per_person_notes for EVERY person in the group.
5. Use empty strings for TMDB params you cannot confidently determine.
6. NEVER return anything outside the JSON object.`;

/**
 * @route   POST /api/ai/sessions/:sessionId/discover
 * @desc    Host triggers group AI reconciliation
 * @access  Protected (host only)
 */
const groupDiscover = async (req, res, next) => {
  const { sessionId } = req.params;
  try {
    // Step 1: Verify session and ownership
    const session = await Session.findOne({ sessionId });
    if (!session) {
      return res
        .status(404)
        .json({ success: false, message: "Session not found or has expired." });
    }
    if (session.hostUserId.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Only the host can trigger movie discovery.",
        });
    }

    // Step 2: Collect all preferences
    const preferences = await Preference.find({ sessionId }).sort({
      createdAt: 1,
    });
    if (preferences.length < 2) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Need at least 2 submissions before discovering movies.",
        });
    }

    // Step 3: Check Gemini API key
    if (!process.env.GEMINI_API_KEY) {
      return res
        .status(500)
        .json({ success: false, message: "AI service is not configured." });
    }

    // Step 4: Build group prompt with all preferences listed
    const preferencesList = preferences
      .map((p, i) => `Person ${i + 1} (${p.memberName}): "${p.preferenceText}"`)
      .join("\n");
    const userMessage = `Here are the group's preferences:\n\n${preferencesList}\n\nReconcile these and find the best movie direction for this group.`;

    // Step 5: Mark session as 'discovering' to prevent duplicate calls
    await Session.findOneAndUpdate({ sessionId }, { status: "discovering" });

    // Step 6: Call Gemini with the group reconciliation prompt
    let rawText;
    try {
      const aiMessages = [
        new SystemMessage(GROUP_SYSTEM_PROMPT),
        new HumanMessage(userMessage),
      ];
      const response = await geminiModel.invoke(aiMessages);
      rawText = response.content;
    } catch (aiError) {
      await Session.findOneAndUpdate({ sessionId }, { status: "waiting" });
      if (
        aiError.message?.includes("quota") ||
        aiError.message?.includes("429")
      ) {
        return res.status(429).json({
          success: false,
          message:
            "AI service is at capacity. Please wait a moment and try again.",
        });
      }
      console.error("Gemini invocation failed in groupDiscover:", aiError);
      throw aiError;
    }

    // Step 7: Parse Gemini response
    let aiParams;
    try {
      aiParams = parseGeminiJSON(rawText);
    } catch {
      await Session.findOneAndUpdate({ sessionId }, { status: "waiting" });
      return res.status(500).json({
        success: false,
        message: "AI couldn't process the group preferences. Please try again.",
      });
    }

    // Step 8: Handle reference movie if anyone mentioned a specific film
    let similarMovies = [];
    if (aiParams.reference_movie) {
      similarMovies = await getSimilarMovies(aiParams.reference_movie);
    }

    // Step 9: Call TMDB with extracted params (with auto-retry on empty results)
    const discoverResult = await discoverWithRetry(aiParams);

    // Step 10: Merge and deduplicate results
    let allMovies = [];
    const seenIds = new Set();
    for (const movie of similarMovies) {
      if (!seenIds.has(movie.id) && movie.poster_path) {
        seenIds.add(movie.id);
        allMovies.push(movie);
      }
    }
    for (const movie of discoverResult.movies) {
      if (!seenIds.has(movie.id) && movie.poster_path) {
        seenIds.add(movie.id);
        allMovies.push(movie);
      }
    }
    allMovies = allMovies.slice(0, 20);

    // Step 11: Build result payload
    const results = {
      reasoning:
        aiParams.reasoning ||
        "Here are movies that balance your group's tastes.",
      vibeTag: aiParams.vibe_tag || "fun",
      groupSummary: aiParams.group_summary || "",
      conflictNote: aiParams.conflict_note || "",
      perPersonNotes: aiParams.per_person_notes || [],
      movies: allMovies,
      isRelaxed: discoverResult.isRelaxed,
    };

    // Step 12: Persist results so latecomers can still see them via getSession
    await Session.findOneAndUpdate(
      { sessionId },
      { status: "results", results },
    );

    res.status(200).json({ success: true, ...results });
  } catch (error) {
    console.error("groupDiscover global catch:", error);
    try {
      await Session.findOneAndUpdate({ sessionId }, { status: "waiting" });
    } catch {
      /* ignore — best effort reset */
    }
    next(error);
  }
};

module.exports = {
  soloDiscover,
  createSession,
  getSession,
  joinSession,
  groupDiscover,
};
