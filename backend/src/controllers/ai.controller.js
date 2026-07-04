const { parseMoodToTMDBParams, generateCommunityPicks } = require("../services/ai.service");
const { buildTasteContext }                             = require("../services/ai.service");
const { discoverByMood, searchMoviesByTitles }         = require("../services/tmdb.service");
const { deriveTasteProfile }                            = require("../services/tasteProfile.service");
const WatchHistory = require("../models/WatchHistory.model");
const Favorite     = require("../models/Favorite.model");

/**
 * @route   POST /api/ai/mood-search
 * @desc    Personalized mood-based discovery pipeline:
 *
 *   Step 1 - User context fetch (parallel DB reads)
 *   Step 2 - Taste DNA derivation (live, weighted TMDB enrichment)
 *   Step 3 - LLM Call #1: Intent Parser, now informed by taste profile
 *              ├─ Branch A: TMDB discover (4-stage fallback, tier-aware)
 *              └─ Branch B: AI Consensus Engine (community picks)
 *   Step 4 - Merge & deduplicate
 *   Step 5 - Return with taste metadata
 *
 * @access  Protected
 */
const moodSearch = async (req, res, next) => {
  try {
    const mood   = req.sanitizedMood;
    const userId = req.user._id;

    // ── Step 1: Fetch user context from MongoDB ───────────────────────────────
    const [watchHistory, favorites] = await Promise.all([
      WatchHistory.find({ userId }).sort({ watchedAt: -1 }).limit(20),
      Favorite.find({ userId }).limit(30),
    ]);

    const watchedTmdbIds = new Set(watchHistory.map((h) => String(h.tmdbId)));

    // ── Step 2: Taste DNA - live derivation ───────────────────────────────────
    // Enriches watch history + favorites with TMDB genre/language data to build
    // a weighted preference profile. Favorites count 2-3× over watch-only.
    const tasteProfile = await deriveTasteProfile(watchHistory, favorites);
    const discoveryTier = tasteProfile?.discoveryTier ?? 0;

    // ── Step 3: LLM Call #1 - Intent parsing with taste context ─────────────
    // tasteProfile is injected into the LLM's system prompt as structured
    // preference signals (genre %, language affinity, discovery tier).
    const tmdbParams = await parseMoodToTMDBParams(mood, tasteProfile);

    // Propagate the discovery tier from the taste profile into TMDB params
    tmdbParams.discoveryTier = discoveryTier;

    // ── Step 3 Branches: TMDB Discover + AI Consensus (parallel) ─────────────
    const [tmdbResult, aiPicksResult] = await Promise.allSettled([
      discoverByMood(tmdbParams),
      generateCommunityPicks(mood),
    ]);

    const tmdbMovies      = tmdbResult.status === "fulfilled"    ? tmdbResult.value    : [];
    const extractedTitles = aiPicksResult.status === "fulfilled" ? aiPicksResult.value : [];

    // ── Step 3B: TMDB title lookup for AI consensus picks ────────────────────
    let communityMovies = [];
    if (extractedTitles.length > 0) {
      communityMovies = await searchMoviesByTitles(extractedTitles, "consensus");
      console.log(`[controller] ${communityMovies.length} titles resolved from TMDB`);
    }

    // ── Step 4: Tag + Merge + Deduplicate ────────────────────────────────────

    /**
     * tagMovie - assigns a trust signal to each result
     *
     * "community"   → AI consensus pick (LLM sourced from Reddit/IMDb knowledge)
     * "hidden_gem"  → Low mainstream exposure but high critical quality,
     *                 surfaced specifically by the user's taste profile.
     *                 Heuristic: vote_count < 800 (not mainstream) +
     *                            vote_average >= 7.0 (critically praised)
     * null          → Standard quality result, no badge shown (reduces noise)
     */
    const hasTasteProfile = !!(tasteProfile && tasteProfile.totalSamples > 0);

    const tagMovie = (movie) => {
      if (movie._source === "consensus") return "community";
      if (
        hasTasteProfile &&
        (movie.vote_count || 0) < 800 &&
        (movie.vote_average || 0) >= 7.0
      ) return "hidden_gem";
      return null;
    };

    const filteredCommunity = communityMovies
      .filter((m) => !watchedTmdbIds.has(String(m.id)))
      .map((m) => ({ ...m, _tag: tagMovie(m) }));

    const hiddenFromUI = communityMovies.length - filteredCommunity.length;
    if (hiddenFromUI > 0) {
      console.log(`[controller] ${hiddenFromUI} community pick(s) hidden (already in watch history) → ${filteredCommunity.length} shown`);
    }

    const communityIds = new Set(filteredCommunity.map((m) => String(m.id)));

    const filteredTmdb = tmdbMovies
      .filter((m) => !watchedTmdbIds.has(String(m.id)))
      .filter((m) => !communityIds.has(String(m.id)))
      .map((m) => ({ ...m, _tag: tagMovie(m) }));

    const hiddenGemCount = filteredTmdb.filter(m => m._tag === "hidden_gem").length;
    if (hiddenGemCount > 0) {
      console.log(`[controller] ${hiddenGemCount} hidden gem(s) identified from taste profile`);
    }

    const mergedResults = [
      ...filteredCommunity,
      ...filteredTmdb,
    ].slice(0, 20);


    // ── Step 5: Response ─────────────────────────────────────────────────────
    res.status(200).json({
      success: true,
      rationale: tmdbParams.rationale,
      params: {
        genres:    tmdbParams.genres,
        keywords:  tmdbParams.moodTags || tmdbParams.keywords,
        minRating: tmdbParams.minRating,
        sortBy:    tmdbParams.sortBy,
      },
      communityPicks: {
        count:     filteredCommunity.length,
        source:    "consensus",
        available: filteredCommunity.length > 0,
      },
      // Taste metadata - useful for frontend to show personalisation cues
      tasteMeta: tasteProfile ? {
        discoveryTier,
        topGenres:    tasteProfile.topGenres,
        topLanguage:  tasteProfile.topLanguage,
        totalSamples: tasteProfile.totalSamples,
      } : null,
      results: mergedResults,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/ai/taste-profile
 * -------------------------
 * Diagnostic endpoint - returns the full derived taste profile for the
 * logged-in user + the exact LLM context string that gets injected.
 * Lets you verify that personalization is working correctly.
 */
const tasteProfileDebug = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const [watchHistory, favorites] = await Promise.all([
      WatchHistory.find({ userId }).sort({ watchedAt: -1 }).limit(20),
      Favorite.find({ userId }).limit(30),
    ]);

    const tasteProfile = await deriveTasteProfile(watchHistory, favorites);

    // Build the exact context string that would be injected into the LLM
    const llmContextString = buildTasteContext(tasteProfile);

    const TIER_DESCRIPTIONS = [
      "Tier 0 - New user: popularity.desc, vote_count ≥ 500 (mainstream picks)",
      "Tier 1 - Casual viewer: popularity.desc, vote_count ≥ 100",
      "Tier 2 - Engaged cinephile: vote_average.desc, vote_count ≥ 50 (quality-focused)",
      "Tier 3 - Film enthusiast: vote_average.desc, vote_count ≥ 20 (hidden gems)",
    ];

    res.status(200).json({
      success: true,
      message: "This is the exact taste profile derived from your history and favorites.",
      inputs: {
        watchHistoryCount: watchHistory.length,
        favoritesCount:    favorites.length,
        totalSignals:      watchHistory.length + favorites.length,
      },
      tasteProfile: tasteProfile || { message: "No history yet - add favorites or watch some movies first." },
      discoveryTierExplained: tasteProfile
        ? TIER_DESCRIPTIONS[tasteProfile.discoveryTier]
        : TIER_DESCRIPTIONS[0],
      llmContextInjected: llmContextString,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { moodSearch, tasteProfileDebug };
