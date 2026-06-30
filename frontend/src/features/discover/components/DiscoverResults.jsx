import MovieCard from "../../movies/components/MovieCard";
import { RiFilmLine } from "@remixicon/react";

/**
 * DiscoverResults
 * ---------------
 * Renders the mood-search results in a responsive grid.
 * Reuses the existing MovieCard component for visual consistency.
 * Each TMDB result from /discover/movie is a movie, so media_type defaults to "movie".
 */
const DiscoverResults = ({ results }) => {
  if (!results || results.length === 0) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "60px 20px",
          color: "var(--text-muted)",
        }}
      >
        <RiFilmLine size={36} style={{ margin: "0 auto 16px", opacity: 0.4 }} />
        <p style={{ fontSize: 14 }}>No results found. Try rephrasing your mood.</p>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
        gap: 20,
        maxWidth: 1200,
        margin: "0 auto",
      }}
    >
      {results.map((movie, i) => (
        <div
          key={movie.id}
          style={{
            animation: `fadeSlideUp 0.4s ease both`,
            animationDelay: `${i * 0.04}s`,
          }}
        >
          <MovieCard movie={{ ...movie, media_type: movie.media_type || "movie" }} />
        </div>
      ))}
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default DiscoverResults;
