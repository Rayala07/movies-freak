import { Link } from "react-router-dom";
import { RiFireFill, RiStarFill } from "@remixicon/react";

/**
 * TrendingStrip — Horizontal showcase of the top 5 trending movies.
 * Each card navigates to its detail page on click.
 */
const TrendingStrip = ({ movies = [] }) => {
  if (movies.length === 0) return null;

  return (
    <div className="section-container py-16">
      <h2
        className="text-3xl font-bold mb-12"
        style={{ color: "var(--text-primary)" }}
      >
        Trending Now
      </h2>

      <div className="flex gap-5 overflow-x-auto scrollbar-hide pb-4">
        {movies.map((movie, i) => {
          const mediaType = movie.media_type === "tv" ? "tv" : "movie";
          const linkPath = `/${mediaType}/${movie.id}`;
          const rating = movie.vote_average?.toFixed(1);

          return (
            <Link
              key={movie.id}
              to={linkPath}
              className="relative flex-shrink-0 w-36 md:w-44 rounded-xl overflow-hidden cursor-pointer card-hover group no-underline"
              style={{ display: "block" }}
            >
              {/* Poster */}
              <img
                src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                alt={movie.title || movie.name}
                className="w-full aspect-[2/3] object-cover"
                loading="lazy"
              />

              {/* Rank badge */}
              <div
                className="absolute top-2 left-2 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black"
                style={{
                  background: "rgba(0,0,0,0.5)",
                  backdropFilter: "blur(8px)",
                  color: "#fff",
                  border: "1px solid rgba(255,255,255,0.15)",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                }}
              >
                {i + 1}
              </div>

              {/* Bottom gradient */}
              <div
                className="absolute inset-x-0 bottom-0 h-1/2 pointer-events-none"
                style={{ background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)" }}
              />

              {/* Title + rating */}
              <div className="absolute inset-x-0 bottom-0 p-3">
                <p className="text-xs font-semibold line-clamp-1" style={{ color: "#fff" }}>
                  {movie.title || movie.name}
                </p>
                {rating && (
                  <p className="text-[10px] mt-0.5 flex items-center gap-1" style={{ color: "rgba(255,255,255,0.7)" }}>
                    <RiStarFill size={9} className="text-yellow-400" />
                    {rating}
                  </p>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default TrendingStrip;
