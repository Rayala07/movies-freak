import MovieCard from "./MovieCard";
import SkeletonCard from "./SkeletonCard";

/**
 * MovieGrid — Phase F4
 * -------------------
 * Renders a responsive vertical grid of movies.
 * Features: Infinite scroll sentinel, loading states.
 */
const MovieGrid = ({ movies, loading, sentinelRef }) => {
  return (
    <div className="section-container py-10">
      {/* Grid Header */}
      <h2 className="text-xl font-bold mb-8 flex items-center gap-3">
        Discover Movies
        {loading && (
          <div className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: "var(--accent)" }} />
        )}
      </h2>

      {/* The Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-6 gap-y-10">
        {movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}

        {/* Loading Skeleton batch while fetching more */}
        {loading && (
          <>
            {[...Array(10)].map((_, i) => (
              <SkeletonCard key={`skeleton-${i}`} />
            ))}
          </>
        )}
      </div>

      {/* The Sentinel — intersection observer watches this */}
      <div ref={sentinelRef} className="h-20 w-full" />
    </div>
  );
};

export default MovieGrid;
