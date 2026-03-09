import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { fetchFavorites, removeFavorite } from "../favoriteSlice";
import {
  RiHeartFill,
  RiStarFill,
  RiHeartLine,
} from "@remixicon/react";

/**
 * FavoritesPage — Phase F7
 * -------------------------
 * Displays all movies/TV shows the user has favorited.
 * Data comes from backend snapshots — no TMDB calls needed.
 */
const FavoritesPage = () => {
  const dispatch = useDispatch();
  const { items, loading } = useSelector((state) => state.favorites);

  useEffect(() => {
    dispatch(fetchFavorites());
  }, [dispatch]);

  const handleRemove = (tmdbId, e) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(removeFavorite(tmdbId));
  };

  const moviePlaceholder =
    "https://res.cloudinary.com/dr3icbigy/image/upload/v1772899683/placeholder_image_scac1b.png";

  return (
    <div className="min-h-[calc(100vh-3.5rem)] pt-12" style={{ background: "var(--bg-primary)" }}>
      <div className="section-container">
        {/* Header */}
        <div className="flex flex-col gap-2 mb-8 animate-in">
          <h1
            className="text-2xl md:text-3xl font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            My Favorites
          </h1>
          <p className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>
            {items.length} {items.length === 1 ? "item" : "items"} saved
          </p>
        </div>

        {/* Grid */}
        {loading && items.length === 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-6 gap-y-10">
            {[...Array(6)].map((_, i) => (
              <div
                key={`skel-${i}`}
                className="aspect-[2/3] rounded-2xl animate-pulse"
                style={{ background: "var(--bg-hover)" }}
              />
            ))}
          </div>
        ) : items.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-6 gap-y-10 animate-in delay-100">
            {items.map((fav, index) => {
              const linkPath =
                fav.mediaType === "tv"
                  ? `/tv/${fav.tmdbId}`
                  : `/movie/${fav.tmdbId}`;
              const posterUrl = fav.movieData?.poster
                ? `https://image.tmdb.org/t/p/w500${fav.movieData.poster}`
                : moviePlaceholder;

              return (
                <Link
                  key={`${fav.tmdbId}-${index}`}
                  to={linkPath}
                  className="group flex flex-col gap-3 cursor-pointer no-underline"
                >
                  <div
                    className="relative aspect-[2/3] overflow-hidden rounded-2xl card-hover"
                    style={{ border: "1px solid var(--border)" }}
                  >
                    <img
                      src={posterUrl}
                      alt={fav.movieData?.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    {/* Rating badge */}
                    {fav.movieData?.rating > 0 && (
                      <div
                        className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold backdrop-blur-md"
                        style={{
                          background: "rgba(0,0,0,0.5)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          color: "#fff",
                        }}
                      >
                        <RiStarFill size={10} className="text-yellow-400" />
                        {fav.movieData.rating.toFixed(1)}
                      </div>
                    )}
                    {/* Remove button */}
                    <button
                      onClick={(e) => handleRemove(fav.tmdbId, e)}
                      className="absolute top-3 left-3 flex items-center justify-center w-8 h-8 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{
                        background: "rgba(0,0,0,0.5)",
                        backdropFilter: "blur(8px)",
                        border: "1px solid rgba(255,255,255,0.12)",
                      }}
                      title="Remove from favorites"
                    >
                      <RiHeartFill size={14} style={{ color: "#ef4444" }} />
                    </button>
                  </div>
                  <div className="flex flex-col gap-1">
                    <h3
                      className="text-sm font-semibold truncate"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {fav.movieData?.title}
                    </h3>
                    <p
                      className="text-xs font-medium"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {fav.movieData?.releaseDate?.split("-")[0] || "TBA"}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center animate-in">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
              style={{ background: "var(--bg-hover)", border: "1px solid var(--border)" }}
            >
              <RiHeartLine size={40} style={{ color: "var(--text-muted)" }} />
            </div>
            <h2 className="text-xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
              No favorites yet
            </h2>
            <p className="max-w-xs text-sm" style={{ color: "var(--text-muted)" }}>
              Start exploring and tap the heart icon on movies you love.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;
