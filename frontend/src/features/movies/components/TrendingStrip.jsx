import { RiFireFill } from "@remixicon/react";

/**
 * TrendingStrip — Horizontal showcase of the top 5 trending movies.
 * Sits between the Hero carousel and the Discovery Grid.
 * Clean, minimal — poster cards with rank badges.
 */
const TrendingStrip = ({ movies = [] }) => {
  if (movies.length === 0) return null;

  return (
    <div className="section-container py-8">
      <h2
        className="text-lg font-bold mb-6 flex items-center gap-2"
        style={{ color: "var(--text-primary)" }}
      >
        <RiFireFill size={20} style={{ color: "var(--accent)" }} />
        Trending Now
      </h2>

      <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
        {movies.map((movie, i) => (
          <div
            key={movie.id}
            className="relative flex-shrink-0 w-36 md:w-44 rounded-xl overflow-hidden cursor-pointer card-hover group"
          >
            {/* Poster */}
            <img
              src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
              alt={movie.title}
              className="w-full aspect-[2/3] object-cover"
              loading="lazy"
            />

            {/* Rank badge */}
            <div
              className="absolute top-2 left-2 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black"
              style={{
                background: "rgba(0, 0, 0, 0.5)",
                backdropFilter: "blur(8px)",
                color: "#fff",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
              }}
            >
              {i + 1}
            </div>

            {/* Bottom gradient overlay */}
            <div
              className="absolute inset-x-0 bottom-0 h-1/2 pointer-events-none"
              style={{
                background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)",
              }}
            />

            {/* Title on hover */}
            <div className="absolute inset-x-0 bottom-0 p-3">
              <p className="text-xs font-semibold line-clamp-1" style={{ color: "#fff" }}>
                {movie.title}
              </p>
              <p className="text-[10px] mt-0.5" style={{ color: "rgba(255,255,255,0.6)" }}>
                ⭐ {movie.vote_average?.toFixed(1)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrendingStrip;
