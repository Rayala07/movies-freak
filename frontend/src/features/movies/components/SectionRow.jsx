import { Link } from "react-router-dom";
import { RiStarFill, RiArrowRightLine } from "@remixicon/react";

/**
 * SectionRow — Reusable horizontal scrollable movie/TV row.
 * Used for Popular, Movies, TV Shows sections on HomePage.
 */
const SectionRow = ({ title, icon: Icon, movies = [], loading = false, accentColor }) => {
  if (loading) {
    return (
      <div className="section-container py-16">
        <div className="h-8 w-48 rounded-lg animate-pulse mb-12" style={{ background: "var(--bg-hover)" }} />
        <div className="flex gap-4 overflow-hidden">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-36 md:w-40 aspect-[2/3] rounded-xl animate-pulse"
              style={{ background: "var(--bg-hover)" }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (!movies.length) return null;

  return (
    <div className="section-container py-5">
      {/* Section header */}
      <div className="mb-8 flex items-center justify-between">
        <h2
          className="text-3xl font-bold"
          style={{ color: "var(--text-primary)" }}
        >
          {title}
        </h2>
        <span
          className="text-xs font-semibold flex items-center gap-1"
          style={{ color: "var(--text-muted)" }}
        >
          Scroll <RiArrowRightLine size={13} />
        </span>
      </div>

      <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-3">
        {movies.map((movie) => {
          const isTV = movie.media_type === "tv" || (!movie.title && movie.name);
          const linkPath = isTV ? `/tv/${movie.id}` : `/movie/${movie.id}`;
          const title_text = movie.title || movie.name;
          const year = (movie.release_date || movie.first_air_date)?.split("-")[0];
          const rating = movie.vote_average?.toFixed(1);
          const moviePlaceholder = "https://res.cloudinary.com/dr3icbigy/image/upload/v1772899683/placeholder_image_scac1b.png";

          return (
            <Link
              key={movie.id}
              to={linkPath}
              className="group flex-shrink-0 w-36 md:w-40 flex flex-col gap-2 no-underline cursor-pointer"
            >
              {/* Poster */}
              <div
                className="relative aspect-[2/3] rounded-xl overflow-hidden card-hover"
                style={{ border: "1px solid var(--border)" }}
              >
                <img
                  src={
                    movie.poster_path
                      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                      : moviePlaceholder
                  }
                  alt={title_text}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                {/* Rating badge */}
                {rating > 0 && (
                  <div
                    className="absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold backdrop-blur-md"
                    style={{ background: "rgba(0,0,0,0.55)", border: "1px solid rgba(255,255,255,0.12)", color: "#fff" }}
                  >
                    <RiStarFill size={9} className="text-yellow-400" />
                    {rating}
                  </div>
                )}
                {/* TV badge */}
                {isTV && (
                  <div
                    className="absolute top-2 left-2 px-1.5 py-0.5 rounded-md text-[9px] font-bold"
                    style={{ background: "rgba(200, 255, 60, 0.7)", color: "#1b1b1bff", backdropFilter: "blur(4px)" }}
                  >
                    TV
                  </div>
                )}
              </div>
              {/* Info */}
              <div className="flex flex-col gap-0.5">
                <p className="text-xs font-semibold truncate" style={{ color: "var(--text-primary)" }}>
                  {title_text}
                </p>
                <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>{year || "TBA"}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default SectionRow;
