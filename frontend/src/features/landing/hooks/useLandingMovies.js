import { useEffect, useState } from "react";
import tmdbService from "../../movies/services/tmdbService";

/**
 * useLandingMovies
 * ----------------
 * Fetches a batch of real trending posters so the landing page can show
 * actual cinema instead of placeholder shapes. Fails silently to an empty
 * array - the landing page renders its decorative gradients either way.
 */
export const useLandingMovies = () => {
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const [dayTrending, weekTrending] = await Promise.all([
          tmdbService.getTrending(1),
          tmdbService.getPopularMovies(1),
        ]);

        const combined = [...(dayTrending?.results || []), ...(weekTrending?.results || [])]
          .filter((m) => m.poster_path)
          .reduce((acc, m) => {
            if (!acc.some((x) => x.id === m.id)) acc.push(m);
            return acc;
          }, []);

        if (!cancelled) setMovies(combined);
      } catch {
        if (!cancelled) setMovies([]);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return movies;
};

export default useLandingMovies;
