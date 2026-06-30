const https = require("https");

/**
 * TMDB Service — Mood-Based Discovery
 * -------------------------------------
 * Translates LLM-generated parameters into a TMDB /discover/movie call.
 * Uses Node's built-in https module — no extra npm package required.
 *
 * TMDB Discover endpoint allows filtering by:
 *   - Genre IDs (e.g., 28 = Action, 18 = Drama)
 *   - Minimum vote average (quality filter)
 *   - Sort order (popularity, rating, release date)
 *   - Minimum vote count (avoids obscure films with a single high rating)
 *
 * @param {Object} params - Parsed from LLM output by ai.service
 * @returns {Array} Array of TMDB movie objects
 */

/** Helper: perform an HTTPS GET and return parsed JSON */
const httpsGet = (url) =>
  new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error("Failed to parse TMDB response")); }
      });
    }).on("error", reject);
  });

const discoverByMood = async ({ genreIds, minRating, sortBy, page = 1 }) => {
  const token = process.env.TMDB_READ_ACCESS_TOKEN;
  if (!token) throw new Error("TMDB_READ_ACCESS_TOKEN is not set.");

  const query = new URLSearchParams({
    include_adult: "false",
    include_video: "false",
    language: "en-US",
    page: String(page),
    sort_by: sortBy || "popularity.desc",
    "vote_average.gte": String(minRating || 6.5),
    "vote_count.gte": "100",
  });

  if (genreIds && genreIds.length > 0) {
    // Pipe-separated = OR logic (match any of these genres)
    query.set("with_genres", genreIds.join("|"));
  }

  const url = new URL(`https://api.themoviedb.org/3/discover/movie?${query.toString()}`);

  // Attach bearer token via Authorization header using a manual request
  const data = await new Promise((resolve, reject) => {
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
        catch (e) { reject(new Error("Failed to parse TMDB response")); }
      });
    });
    req.on("error", reject);
    req.end();
  });

  if (!data.results) throw new Error("Unexpected TMDB response shape.");
  return data.results;
};

module.exports = { discoverByMood };
