const https = require("https");

/**
 * Taste Profile Service - Taste DNA Engine
 * -----------------------------------------
 * Derives a per-user preference profile live from watch history + favorites
 * by enriching each entry with TMDB attribute data (genres, original_language, release_date).
 *
 * Signal weights:
 *   - Watched AND favorited: 3× (strongest signal - user committed)
 *   - Favorited only:        2× (strong signal - user loved it)
 *   - Watched only:          1× (neutral signal - user saw it)
 *
 * This produces a structured taste profile injected into:
 *   1. The LLM system prompt (as rich personalization context)
 *   2. The TMDB query (via discoveryTier to unlock hidden gems)
 */

// TMDB genre ID → human-readable name
const TMDB_GENRE_NAMES = {
  28: "action",    12: "adventure",  16: "animation",  35: "comedy",
  80: "crime",     99: "documentary",18: "drama",       10751: "family",
  14: "fantasy",   36: "history",    27: "horror",      10402: "music",
  9648: "mystery", 10749: "romance", 878: "science fiction", 53: "thriller",
  10752: "war",    37: "western",
};

// ISO 639-1 language code → human-readable cinema label
const LANG_LABELS = {
  ko: "Korean", hi: "Hindi", ja: "Japanese", fr: "French",
  es: "Spanish", zh: "Chinese", ta: "Tamil", te: "Telugu",
  pt: "Portuguese", de: "German", it: "Italian", ru: "Russian",
};

/**
 * fetchTMDBDetails
 * ----------------
 * Fetches genre + language + era data for a single movie/TV show from TMDB.
 * Silently resolves to null on any error to keep the profile derivation resilient.
 */
const fetchTMDBDetails = (tmdbId, mediaType) =>
  new Promise((resolve) => {
    const token = process.env.TMDB_READ_ACCESS_TOKEN;
    const endpoint = mediaType === "tv" ? "tv" : "movie";
    const path = `/3/${endpoint}/${tmdbId}`;

    const options = {
      hostname: "api.themoviedb.org",
      path,
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
        catch { resolve(null); }
      });
    });
    req.on("error", () => resolve(null));
    req.setTimeout(4000, () => { req.destroy(); resolve(null); });
    req.end();
  });

/**
 * computeDiscoveryTier
 * ---------------------
 * Tiers control how adventurous TMDB /discover queries should be.
 *
 * Tier 0 - New user    (<5 entries)  : popularity.desc, vote_count >= 500
 * Tier 1 - Casual      (5-19)        : popularity.desc, vote_count >= 100
 * Tier 2 - Engaged     (20-49)       : vote_average.desc, vote_count >= 50
 * Tier 3 - Cinephile   (50+)         : vote_average.desc, vote_count >= 20 (hidden gems)
 */
const computeDiscoveryTier = (totalConsumed) => {
  if (totalConsumed < 5)  return 0;
  if (totalConsumed < 20) return 1;
  if (totalConsumed < 50) return 2;
  return 3;
};

/**
 * deriveTasteProfile
 * -------------------
 * Main export. Builds a live taste profile from the user's watch history and favorites.
 *
 * @param {Array} watchHistory - WatchHistory documents from MongoDB
 * @param {Array} favorites    - Favorite documents from MongoDB
 * @returns {Object|null}      - Taste profile, or null if no data available
 */
const deriveTasteProfile = async (watchHistory, favorites) => {
  const totalConsumed = watchHistory.length + favorites.length;
  if (totalConsumed === 0) return null;

  // ── Build weighted entry map (deduplicated by tmdbId) ─────────────────────
  // Favorites override watch history if both exist for the same title.
  const entryMap = new Map();

  watchHistory.forEach((h) => {
    entryMap.set(h.tmdbId, {
      tmdbId: h.tmdbId,
      mediaType: h.mediaType || "movie",
      weight: 1,  // watched = neutral
    });
  });

  favorites.forEach((f) => {
    if (entryMap.has(f.tmdbId)) {
      // Watched AND favorited → strongest signal
      entryMap.get(f.tmdbId).weight = 3;
    } else {
      // Favorited only (user added without tracking watch) → strong signal
      entryMap.set(f.tmdbId, {
        tmdbId: f.tmdbId,
        mediaType: f.mediaType || "movie",
        weight: 2,
      });
    }
  });

  // Limit TMDB enrichment calls for latency (most recent/relevant 15 entries)
  const entries = [...entryMap.values()].slice(0, 15);

  console.log(`[taste] Enriching ${entries.length} unique entries from TMDB...`);

  // ── Fetch TMDB details in parallel ────────────────────────────────────────
  const details = await Promise.all(
    entries.map(async ({ tmdbId, mediaType, weight }) => {
      const data = await fetchTMDBDetails(tmdbId, mediaType);
      return data ? { ...data, _weight: weight } : null;
    })
  );

  const enriched = details.filter(Boolean);
  if (enriched.length === 0) return null;

  // ── Aggregate weighted scores ─────────────────────────────────────────────
  const genreScores    = {};
  const languageScores = {};
  const eraScores      = {};

  enriched.forEach(({ genres = [], original_language, release_date, first_air_date, _weight }) => {
    // Genre affinity
    genres.forEach(({ id }) => {
      const name = TMDB_GENRE_NAMES[id];
      if (name) genreScores[name] = (genreScores[name] || 0) + _weight;
    });

    // Language affinity
    if (original_language) {
      languageScores[original_language] = (languageScores[original_language] || 0) + _weight;
    }

    // Era affinity (decade)
    const yearStr = (release_date || first_air_date || "").slice(0, 4);
    const year = parseInt(yearStr);
    if (!isNaN(year)) {
      const decade = `${Math.floor(year / 10) * 10}s`;
      eraScores[decade] = (eraScores[decade] || 0) + _weight;
    }
  });

  // ── Sort and normalize to 0–1 scores ─────────────────────────────────────
  const totalWeight = enriched.reduce((sum, m) => sum + m._weight, 0) || 1;

  const sortedAndNormalize = (map, limit = 5) =>
    Object.fromEntries(
      Object.entries(map)
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([k, v]) => [k, parseFloat((v / totalWeight).toFixed(2))])
    );

  const genreAffinity    = sortedAndNormalize(genreScores, 6);
  const languageAffinity = sortedAndNormalize(languageScores, 4);
  const eraAffinity      = sortedAndNormalize(eraScores, 3);

  const topGenres   = Object.keys(genreAffinity).slice(0, 3);
  const topLanguage = Object.keys(languageAffinity)[0] || null;
  const topEra      = Object.keys(eraAffinity)[0] || null;

  const profile = {
    genreAffinity,
    languageAffinity,
    eraAffinity,
    topGenres,
    topLanguage,
    topEra,
    langLabel:     LANG_LABELS[topLanguage] || null,
    totalSamples:  enriched.length,
    discoveryTier: computeDiscoveryTier(totalConsumed),
  };

  console.log(
    `[taste] Profile → genres: ${JSON.stringify(genreAffinity)}, ` +
    `topLang: ${topLanguage}, tier: ${profile.discoveryTier}`
  );

  return profile;
};

module.exports = { deriveTasteProfile, computeDiscoveryTier, LANG_LABELS };
