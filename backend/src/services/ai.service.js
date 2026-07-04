const Groq = require("groq-sdk");

/**
 * AI Service - Kineo Mood-Based Discovery
 * ----------------------------------------
 * LLM: Qwen3-32B via Groq
 * SDK: groq-sdk (native, no OpenAI wrapper)
 *
 * Qwen3 note: The model outputs a <think>...</think> reasoning block
 * before the actual JSON. We strip this before parsing.
 */

// TMDB genre name → genre ID mapping
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
  thriller: 53,
  war: 10752,
  western: 37,
};

const getClient = () => {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not set in environment variables.");
  }
  return new Groq({ apiKey: process.env.GROQ_API_KEY });
};

const { LANG_LABELS } = require("./tasteProfile.service");

/**
 * buildTasteContext
 * -----------------
 * Converts a structured taste profile into a rich, LLM-readable context block.
 * This replaces the old flat title list - the LLM now understands the USER's
 * actual taste preferences, not just what they've watched.
 *
 * Key difference: The mood-ambiguity resolution instruction at the bottom
 * tells the LLM HOW to break ties using the user's taste data.
 */
const buildTasteContext = (tasteProfile) => {
  if (!tasteProfile || tasteProfile.totalSamples === 0) {
    return "No personal history available. Use the user's request literally.";
  }

  const lines = [];

  // ── Genre affinity ────────────────────────────────────────────────────────
  if (Object.keys(tasteProfile.genreAffinity).length > 0) {
    const genreList = Object.entries(tasteProfile.genreAffinity)
      .map(([genre, score]) => `${genre} (${Math.round(score * 100)}% of watches)`)
      .join(", ");
    lines.push(`Genre preferences: ${genreList}`);
  }

  // ── Language affinity ─────────────────────────────────────────────────────
  const nonEnglishLangs = Object.entries(tasteProfile.languageAffinity)
    .filter(([lang]) => lang !== "en")
    .map(([lang, score]) => `${LANG_LABELS[lang] || lang} (${Math.round(score * 100)}%)`)
    .join(", ");
  if (nonEnglishLangs) {
    lines.push(`Non-English cinema affinity: ${nonEnglishLangs}`);
  }

  // ── Era affinity ──────────────────────────────────────────────────────────
  if (tasteProfile.topEra) {
    lines.push(`Preferred era: films from the ${tasteProfile.topEra}`);
  }

  // ── Discovery tier ────────────────────────────────────────────────────────
  const tierDescriptions = [
    "new user - recommend safe, popular mainstream picks",
    "casual viewer - mix of popular and well-rated films",
    "engaged cinephile - prioritize quality and craft, open to lesser-known films",
    "film enthusiast - actively seek hidden gems, avoid obvious mainstream picks",
  ];
  lines.push(`User engagement level: ${tierDescriptions[tasteProfile.discoveryTier]}`);

  // ── Mood-ambiguity resolution (the key insight) ───────────────────────────
  if (tasteProfile.topGenres.length > 0) {
    const topTwo = tasteProfile.topGenres.slice(0, 2).join(" and ");
    lines.push(
      `CRITICAL: When the user's mood is ambiguous between multiple genres, ` +
      `ALWAYS bias toward their strongest taste signals: ${topTwo}.`
    );
  }
  if (tasteProfile.topLanguage && tasteProfile.topLanguage !== "en") {
    const langName = LANG_LABELS[tasteProfile.topLanguage] || tasteProfile.topLanguage;
    lines.push(
      `CRITICAL: Unless the user's request explicitly specifies a different language/country, ` +
      `prefer ${langName}-language films since this user watches them heavily.`
    );
  }

  return lines.join("\n");
};

/**
 * extractJSON
 * -----------
 * Robustly extracts a JSON object from raw LLM output.
 * Handles three common LLM response formats:
 *   1. Qwen3 <think>...</think> reasoning block preceding the JSON
 *   2. Markdown code fences: ```json { ... } ```
 *   3. Raw JSON object directly in the response
 */
const extractJSON = (raw) => {
  let text = raw.trim();

  // Strip Qwen3 reasoning block (everything inside <think>...</think>)
  text = text.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();

  // Strip markdown code fences
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) return fenceMatch[1].trim();

  // Extract first raw JSON object found
  const objectMatch = text.match(/\{[\s\S]*\}/);
  if (objectMatch) return objectMatch[0];

  return text;
};

/**
 * parseMoodToTMDBParams
 * ----------------------
 * LLM Call #1 in the discovery pipeline.
 * Reads the user's natural language mood → structured TMDB params.
 *
 * Qwen3-32B is significantly stronger than the previous Llama 3.1 8B:
 * - Better multilingual understanding (critical for regional cinema detection)
 * - More precise JSON adherence
 * - Built-in reasoning (think block) improves parameter quality
 */
const parseMoodToTMDBParams = async (moodText, tasteProfile = null) => {
  const client = getClient();
  const contextString = buildTasteContext(tasteProfile);

  const systemPrompt = `You are an expert film curator for Kineo, a premium movie discovery platform.
Analyze the user's mood/request and return a JSON object with movie discovery parameters.

STRICT RULES:
1. Return ONLY raw JSON. No markdown, no code fences, no explanation.
2. "genres": array of 1-2 strings. ONLY genres the user EXPLICITLY mentions or directly implies. Choose from: action, adventure, animation, comedy, crime, documentary, drama, family, fantasy, history, horror, music, mystery, romance, science fiction, thriller, war, western. Do NOT add extra genres the user did not ask for.
3. "thematicKeywords": array of 0-3 strings. ONLY cultural/geographic/cinematic identifiers. Examples: "bollywood", "anime", "k-drama", "french cinema", "telugu", "south korean film". Leave EMPTY [] for no cultural context. Do NOT put mood words here.
4. "moodTags": array of 1-3 mood descriptors for UI display only. Examples: "feel-good", "intense", "heartwarming". NOT used for TMDB search.
5. "language": ISO 639-1 code if user mentions a language or cultural origin. "hi" for Hindi/Bollywood/India, "ko" for Korean, "ja" for Japanese, "fr" for French, "es" for Spanish, "zh" for Chinese, "ta" for Tamil, "te" for Telugu. Set to "" if NOT specified.
6. "originCountry": ISO 3166-1 alpha-2 if user mentions a country. "IN" for India, "KR" for Korea, "JP" for Japan, "FR" for France. Set to "" if not specified.
7. "minRating": 6.0 for casual, 7.0 for quality-focused. Never exceed 7.5.
8. "sortBy": "popularity.desc" normally, "vote_average.desc" for quality-focused.
9. "rationale": ONE sentence, max 12 words.

CRITICAL EXAMPLES:
- "Indian comedy movies" → genres:["comedy"], thematicKeywords:["bollywood"], language:"hi", originCountry:"IN"
- "hindi comedy" → genres:["comedy"], thematicKeywords:["bollywood"], language:"hi", originCountry:"IN"
- "Korean romance drama" → genres:["romance","drama"], thematicKeywords:["k-drama"], language:"ko", originCountry:"KR"
- "Japanese anime thriller" → genres:["thriller","animation"], thematicKeywords:["anime"], language:"ja", originCountry:"JP"
- "Tamil action" → genres:["action"], thematicKeywords:["kollywood"], language:"ta", originCountry:"IN"
- "something intense and dark" → genres:["thriller"], thematicKeywords:[], language:"", originCountry:""
- "feel-good family movie" → genres:["family","comedy"], thematicKeywords:[], language:"", originCountry:""
- "French thriller" → genres:["thriller"], thematicKeywords:["french cinema"], language:"fr", originCountry:"FR"

OUTPUT SCHEMA (exact structure, raw JSON only):
{"genres":["string"],"thematicKeywords":["string"],"moodTags":["string"],"language":"string","originCountry":"string","minRating":number,"sortBy":"string","rationale":"string"}`;

  const userPrompt = `User request: "${moodText}"

USER TASTE PROFILE (use this to resolve ambiguity - do NOT override explicit user requests):
${contextString}

Return the JSON now.`;

  try {
    const response = await client.chat.completions.create({
      model: "qwen/qwen3-32b",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 2048,
    });

    const raw = response.choices[0]?.message?.content;
    if (!raw) throw new Error("Empty response from Qwen3");

    console.log("[ai.service] Raw Qwen3 response:", raw.slice(0, 300), raw.length > 300 ? "..." : "");

    const jsonString = extractJSON(raw);
    const parsed = JSON.parse(jsonString);

    // Resolve genre names → TMDB genre IDs
    const genreIds = (parsed.genres || [])
      .map((g) => GENRE_MAP[g.toLowerCase().trim()])
      .filter(Boolean);

    const result = {
      genres:           parsed.genres || [],
      genreIds,
      thematicKeywords: parsed.thematicKeywords || [],
      moodTags:         parsed.moodTags || [],
      keywords:         parsed.moodTags || [],  // backward-compat for UI rationale display
      minRating:        parsed.minRating ?? 6.0,
      sortBy:           parsed.sortBy || "popularity.desc",
      rationale:        parsed.rationale || "Curated picks based on your mood.",
      originCountry:    parsed.originCountry || "",
      language:         parsed.language || "",
    };

    console.log("[ai.service] Parsed result:", {
      genres:           result.genres,
      genreIds:         result.genreIds,
      thematicKeywords: result.thematicKeywords,
      language:         result.language,
      originCountry:    result.originCountry,
      sortBy:           result.sortBy,
    });

    return result;
  } catch (err) {
    console.error("[ai.service] Qwen3 call failed:", err.message);
    if (err.status) console.error("[ai.service] HTTP status:", err.status);
    return {
      genres:           [],
      genreIds:         [],
      thematicKeywords: [],
      moodTags:         [],
      keywords:         [],
      minRating:        6.5,
      sortBy:           "popularity.desc",
      rationale:        "Top picks for you right now.",
      originCountry:    "",
      language:         "",
    };
  }
};

/**
 * generateCommunityPicks - LLM Call #2
 * -------------------------------------
 * Acts as an "AI Consensus Engine". Uses the LLM's vast training data
 * of internet discussions (Reddit, Letterboxd, IMDb) to generate the top 5
 * most highly regarded community favorites for the requested mood.
 *
 * @param {string} moodText - Original user mood
 * @returns {Promise<string[]>} - Array of movie/show title strings
 */
const generateCommunityPicks = async (moodText) => {
  const client = getClient();

  const prompt = `Based on popular consensus from internet movie communities (like Reddit, Letterboxd, and IMDb), what are the top 5 most highly recommended movies for this specific mood/request: "${moodText}"?

Rules:
- Return ONLY a JSON array of exact movie title strings. Nothing else.
- Include only widely beloved community favorites that perfectly match the request.
- Max 5 titles.
- Do not include opinions, reasons, or descriptions - just the titles.
- Return ONLY the raw JSON array.`;

  try {
    const response = await client.chat.completions.create({
      model: "qwen/qwen3-32b",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.1,
      max_tokens: 2048,
    });

    const raw = response.choices[0]?.message?.content || "";
    console.log("[ai.service] Community Picks raw generation:", raw.slice(0, 150) + "...");

    // Strip thinking block
    let text = raw.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
    
    // Strip markdown formatting if the model wrapped it in ```json ... ```
    const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fenceMatch) text = fenceMatch[1].trim();

    // Extract JSON array
    const arrayMatch = text.match(/\[[\s\S]*?\]/);
    if (!arrayMatch) return [];

    const titles = JSON.parse(arrayMatch[0]);
    const validTitles = Array.isArray(titles)
      ? titles.filter((t) => typeof t === "string" && t.length > 0)
      : [];

    console.log(`[ai.service] Generated ${validTitles.length} community picks:`, validTitles);
    return validTitles;
  } catch (err) {
    console.error("[ai.service] Community picks generation failed:", err.message);
    return [];
  }
};

module.exports = { parseMoodToTMDBParams, generateCommunityPicks, buildTasteContext };
