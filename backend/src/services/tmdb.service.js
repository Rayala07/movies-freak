const https = require("https");

/**
 * TMDB Service - Dynamic Mood-Based Discovery
 * ---------------------------------------------
 * Three-stage pipeline:
 *
 *  Stage 1 - Keyword Resolution:
 *    LLM outputs `thematicKeywords` (e.g. "bollywood", "anime").
 *    We query TMDB's /search/keyword for each to get their numeric IDs.
 *    This is DYNAMIC - no hardcoded ID tables.
 *
 *  Stage 2 - Discover:
 *    Call /discover/movie with all applicable filters:
 *      with_keywords (resolved IDs), with_original_language, with_origin_country, with_genres
 *
 *  Stage 3 - Smart Fallback:
 *    If keyword-filtered results < 5 (too restrictive), retry without keywords
 *    but keep language + country + genre filters.
 *    If still < 5, retry with only genre filter (broadest possible).
 */

/**
 * Authenticated TMDB API request using Bearer token.
 * @param {string} path - e.g. "/search/keyword?query=bollywood"
 * @param {string} token - TMDB_READ_ACCESS_TOKEN
 * @returns {Promise<Object>}
 */
const tmdbRequest = (path, token) =>
  new Promise((resolve, reject) => {
    const url = new URL(`https://api.themoviedb.org/3${path}`);
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    };
    const req = https.request(options, (res) => {
      let body = "";
      res.on("data", (c) => (body += c));
      res.on("end", () => {
        try { resolve(JSON.parse(body)); }
        catch (e) { reject(new Error(`Failed to parse TMDB response for ${path}`)); }
      });
    });
    req.on("error", reject);
    req.end();
  });

/**
 * resolveKeywords
 * ---------------
 * Dynamically converts cultural/geographic keyword strings into TMDB keyword IDs
 * by querying TMDB's /search/keyword endpoint.
 *
 * Strategy:
 *   - Try exact name match first (case-insensitive)
 *   - Fall back to top result if no exact match
 *   - Run all resolutions in parallel for speed
 *   - Silently skip any keyword that fails to resolve
 *
 * @param {string[]} keywords - e.g. ["bollywood", "anime", "k-drama"]
 * @param {string}   token    - TMDB_READ_ACCESS_TOKEN
 * @returns {Promise<number[]>} - Array of TMDB keyword IDs
 */
const resolveKeywords = async (keywords, token) => {
  if (!keywords || keywords.length === 0) return [];

  const results = await Promise.all(
    keywords.map(async (kw) => {
      try {
        const data = await tmdbRequest(
          `/search/keyword?query=${encodeURIComponent(kw)}&page=1`,
          token
        );
        const list = data.results || [];
        // Prefer exact match, fall back to best match
        const exact = list.find((r) => r.name.toLowerCase() === kw.toLowerCase());
        const best = exact || list[0];
        if (best) {
          console.log(`[tmdb.service] Keyword "${kw}" → ID ${best.id} ("${best.name}")`);
          return best.id;
        }
        console.warn(`[tmdb.service] No TMDB keyword found for "${kw}"`);
        return null;
      } catch (e) {
        console.warn(`[tmdb.service] Keyword resolution failed for "${kw}":`, e.message);
        return null;
      }
    })
  );

  return results.filter(Boolean);
};

/**
 * DISCOVERY TIER SETTINGS
 * ------------------------
 * Controls how adventurous the TMDB query is based on user engagement level.
 * Tier 0 = new user (mainstream), Tier 3 = cinephile (hidden gems).
 */
const TIER_SETTINGS = [
  { voteCountMin: 500, sortOverride: "popularity.desc" },  // Tier 0: new user
  { voteCountMin: 100, sortOverride: null },                // Tier 1: casual
  { voteCountMin: 50,  sortOverride: "vote_average.desc" }, // Tier 2: engaged
  { voteCountMin: 20,  sortOverride: "vote_average.desc" }, // Tier 3: cinephile
];

/**
 * buildDiscoverQuery
 * ------------------
 * Builds URLSearchParams for /discover/movie.
 * Now accepts discoveryTier to personalise vote_count and sort_by thresholds.
 */
const buildDiscoverQuery = ({
  keywordIds, genreIds, language, originCountry,
  minRating, sortBy, page, withKeywords, discoveryTier = 0,
}) => {
  const tier = TIER_SETTINGS[discoveryTier] || TIER_SETTINGS[0];

  // Regional cinema (non-English) naturally has fewer TMDB votes - keep threshold low
  const isRegional = language && language !== "en";
  const voteCountMin = isRegional
    ? Math.min(tier.voteCountMin, 20)   // never block regional films
    : tier.voteCountMin;

  // Discovery tier can override sort_by, but explicit user preference wins
  const effectiveSortBy = tier.sortOverride || sortBy || "popularity.desc";

  const query = new URLSearchParams({
    include_adult:       "false",
    include_video:       "false",
    page:                String(page || 1),
    sort_by:             effectiveSortBy,
    "vote_average.gte":  String(minRating || 6.0),
    "vote_count.gte":    String(voteCountMin),
  });

  if (withKeywords && keywordIds && keywordIds.length > 0) {
    query.set("with_keywords", keywordIds[0]);
  }

  if (language && language !== "en" && language !== "") {
    query.set("with_original_language", language);
  }

  if (originCountry && originCountry !== "") {
    query.set("with_origin_country", originCountry);
  }

  if (genreIds && genreIds.length > 0) {
    query.set("with_genres", genreIds.join(","));
  }

  return query;
};

/**
 * discoverByMood
 * --------------
 * Main export. Executes the 3-stage discovery pipeline.
 *
 * @param {Object}   params
 * @param {number[]} params.genreIds
 * @param {string[]} params.thematicKeywords  - Cultural keywords for resolution
 * @param {number}   params.minRating
 * @param {string}   params.sortBy
 * @param {string}   params.language
 * @param {string}   params.originCountry
 * @param {number}   params.page
 * @returns {Promise<Object[]>} TMDB movie result objects
 */
const discoverByMood = async ({
  genreIds,
  thematicKeywords,
  minRating,
  sortBy,
  language,
  originCountry,
  discoveryTier = 0,
  page = 1,
}) => {
  const token = process.env.TMDB_READ_ACCESS_TOKEN;
  if (!token) throw new Error("TMDB_READ_ACCESS_TOKEN is not set.");

  const baseOpts = { genreIds, language, originCountry, minRating, sortBy, page, discoveryTier };

  // ── Stage 1: Resolve cultural keywords → TMDB keyword IDs ────────────────
  const keywordIds = await resolveKeywords(thematicKeywords, token);

  // ── Stage 2: Query with keywords + all filters ───────────────────────────
  if (keywordIds.length > 0) {
    const query = buildDiscoverQuery({ ...baseOpts, keywordIds, withKeywords: true });
    console.log("[tmdb.service] Stage 2 query (with keywords):", query.toString());
    const data = await tmdbRequest(`/discover/movie?${query.toString()}`, token);

    if (data.results && data.results.length >= 5) {
      console.log(`[tmdb.service] Stage 2 returned ${data.results.length} results ✓`);
      return data.results;
    }
    console.log(`[tmdb.service] Stage 2 returned only ${data.results?.length || 0} results, trying Stage 3`);
  }

  // ── Stage 3: Fallback - language + country + genre only (no keywords) ────
  const fallbackQuery = buildDiscoverQuery({ ...baseOpts, withKeywords: false });
  console.log("[tmdb.service] Stage 3 query (language+country+genre):", fallbackQuery.toString());
  const fallbackData = await tmdbRequest(`/discover/movie?${fallbackQuery.toString()}`, token);

  if (fallbackData.results && fallbackData.results.length >= 5) {
    console.log(`[tmdb.service] Stage 3 returned ${fallbackData.results.length} results ✓`);
    return fallbackData.results;
  }

  // ── Stage 4: Final fallback - genre only, all languages ──────────────────
  console.log("[tmdb.service] Stage 4 query (genre only, broadest)");
  const broadQuery = buildDiscoverQuery({
    genreIds, minRating, sortBy, page, discoveryTier,
    language: "", originCountry: "", withKeywords: false,
  });
  const broadData = await tmdbRequest(`/discover/movie?${broadQuery.toString()}`, token);

  if (!broadData.results) throw new Error("Unexpected TMDB response shape.");
  console.log(`[tmdb.service] Stage 4 returned ${broadData.results.length} results`);
  return broadData.results;
};

/**
 * searchMoviesByTitles
 * ---------------------
 * Takes an array of movie title strings (generated by AI Consensus Engine)
 * and looks each one up on TMDB's /search/movie endpoint.
 * Returns full TMDB movie objects tagged with { _source: "consensus" }.
 *
 * @param {string[]} titles    - Movie titles extracted from AI
 * @param {string}   source    - Source tag (e.g. "consensus")
 * @returns {Promise<Object[]>} - TMDB movie objects with source metadata
 */
const searchMoviesByTitles = async (titles, source = "consensus") => {
  const token = process.env.TMDB_READ_ACCESS_TOKEN;
  if (!token || !titles || titles.length === 0) return [];

  const results = await Promise.all(
    titles.map(async (title) => {
      try {
        const data = await tmdbRequest(
          `/search/movie?query=${encodeURIComponent(title)}&page=1`,
          token
        );
        const candidates = data.results?.slice(0, 5) || [];
        if (candidates.length === 0) return null;

        // TMDB search ranks by textual relevance, not by cultural prominence.
        // A new film named "The Crucifix: Blood of the Exorcist" can outrank
        // the 1973 "The Exorcist". Fix: among the top 5 results, pick the one
        // with the most votes - this reliably identifies the canonical film.
        const best = candidates.reduce((top, m) =>
          (m.vote_count || 0) > (top.vote_count || 0) ? m : top
        , candidates[0]);

        console.log(`[tmdb.service] Consensus title "${title}" → TMDB: "${best.title}" (ID: ${best.id}, votes: ${best.vote_count})`);
        return { ...best, _source: source };
      } catch {
        return null;
      }
    })
  );

  return results.filter(Boolean);
};

module.exports = { discoverByMood, searchMoviesByTitles };
