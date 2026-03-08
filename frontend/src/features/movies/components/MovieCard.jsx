import { RiStarFill } from "@remixicon/react";

/**
 * MovieCard — Phase F4
 * -------------------
 * The atomic unit of our discovery grid.
 * Design: Minimal, high-quality lift on hover, clean info.
 */
const MovieCard = ({ movie }) => {
  // TMDB image helper
  const posterUrl = movie.poster_path 
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : "https://via.placeholder.com/500x750?text=No+Poster";

  return (
    <div className="group flex flex-col gap-3 cursor-pointer">
      {/* Poster Container */}
      <div className="relative aspect-[2/3] overflow-hidden rounded-2xl card-hover" style={{ border: "1px solid var(--border)" }}>
        <img 
          src={posterUrl} 
          alt={movie.title || movie.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        
        {/* Subtle rating badge overlay — top right */}
        <div 
          className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold backdrop-blur-md" 
          style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff" }}
        >
          <RiStarFill size={10} className="text-yellow-400" />
          {movie.vote_average?.toFixed(1) || "N/A"}
        </div>
      </div>

      {/* Info container */}
      <div className="flex flex-col gap-1">
        <h3 
          className="text-sm font-semibold truncate transition-colors duration-200" 
          style={{ color: "var(--text-primary)" }}
        >
          {movie.title || movie.name}
        </h3>
        <p className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
          {new Date(movie.release_date || movie.first_air_date).getFullYear() || "TBA"}
        </p>
      </div>
    </div>
  );
};

export default MovieCard;
