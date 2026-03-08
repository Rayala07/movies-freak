import { Link } from "react-router-dom";
import { RiStarFill } from "@remixicon/react";

/**
 * MovieCard — Phase F4
 * -------------------
 * The atomic unit of our discovery grid.
 * Design: Minimal, high-quality lift on hover, clean info.
 * Clicking navigates to the detail page (F5).
 */
const MovieCard = ({ movie }) => {
  const isPerson = movie.media_type === "person";
  const moviePlaceholder = "https://res.cloudinary.com/dr3icbigy/image/upload/v1772899683/placeholder_image_scac1b.png";
  const personPlaceholder = "https://res.cloudinary.com/dr3icbigy/image/upload/v1772977435/download_sgd3rm.jpg";

  // TMDB image helper
  const posterUrl = isPerson
    ? (movie.profile_path ? `https://image.tmdb.org/t/p/w500${movie.profile_path}` : personPlaceholder)
    : (movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : moviePlaceholder);

  // Determine route: /tv/ for TV shows, /movie/ for everything else
  // Note: People don't have a detail page yet, so we'll prevent navigation or link to a search for them
  const linkPath = isPerson
    ? `/search?q=${encodeURIComponent(movie.name)}` // Temporary navigation for people
    : movie.media_type === "tv"
      ? `/tv/${movie.id}`
      : `/movie/${movie.id}`;

  const rating = movie.vote_average?.toFixed(1);

  return (
    <Link to={linkPath} className="group flex flex-col gap-3 cursor-pointer no-underline">
      {/* Poster Container */}
      <div className="relative aspect-[2/3] overflow-hidden rounded-2xl card-hover" style={{ border: "1px solid var(--border)" }}>
        <img 
          src={posterUrl} 
          alt={movie.title || movie.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        
        {/* Subtle rating badge overlay — top right (Hide for people) */}
        {!isPerson && rating && (
          <div 
            className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold backdrop-blur-md" 
            style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff" }}
          >
            <RiStarFill size={10} className="text-yellow-400" />
            {rating}
          </div>
        )}
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
          {isPerson 
            ? movie.known_for_department 
            : new Date(movie.release_date || movie.first_air_date).getFullYear() || "TBA"}
        </p>
      </div>
    </Link>

  );
};

export default MovieCard;
