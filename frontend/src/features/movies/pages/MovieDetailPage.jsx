import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchMovieDetail,
  fetchTVDetail,
  clearDetail,
} from "../movieSlice";
import { fetchFavorites, addFavorite, removeFavorite } from "../../favorites/favoriteSlice";
import { fetchWatchlist, addToWatchlist, removeFromWatchlist } from "../../watchlist/watchlistSlice";
import { addToHistory } from "../../history/historySlice";
import {
  RiPlayFill,
  RiStarFill,
  RiTimeLine,
  RiCalendarLine,
  RiArrowLeftLine,
  RiHeartLine,
  RiHeartFill,
  RiBookmarkLine,
  RiBookmarkFill,
} from "@remixicon/react";
import toast from "react-hot-toast";
import TrailerModal from "../components/TrailerModal";
import CastScroller from "../components/CastScroller";

/**
 * MovieDetailPage — Phase F5 + F7
 * --------------------------------
 * Full-page detail view for movies and TV shows.
 * F7 additions: Favorite toggle, Watchlist toggle, auto-History.
 */
const MovieDetailPage = ({ mediaType = "movie" }) => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { movieDetail: detail, detailLoading, detailError } = useSelector(
    (state) => state.movies
  );
  const favoriteItems = useSelector((state) => state.favorites.items);
  const watchlistItems = useSelector((state) => state.watchlist.items);
  const [showTrailer, setShowTrailer] = useState(false);
  const [isDark, setIsDark] = useState(() => !document.documentElement.classList.contains("light"));

  // Re-detect theme if user switches live
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(!document.documentElement.classList.contains("light"));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  // Derived: is this item already favorited / in watchlist?
  const isFavorited = favoriteItems.some((f) => f.tmdbId === String(id));
  const isInWatchlist = watchlistItems.some((w) => w.tmdbId === String(id));

  // Fetch detail + user lists on mount
  useEffect(() => {
    if (mediaType === "tv") {
      dispatch(fetchTVDetail(id));
    } else {
      dispatch(fetchMovieDetail(id));
    }
    dispatch(fetchFavorites());
    dispatch(fetchWatchlist());
    window.scrollTo(0, 0);
    return () => dispatch(clearDetail());
  }, [dispatch, id, mediaType]);

  // Auto-track watch history when detail is loaded
  useEffect(() => {
    if (detail && id) {
      dispatch(
        addToHistory({
          tmdbId: String(id),
          mediaType,
          movieData: {
            title: detail.title || detail.name || "Unknown",
            poster: detail.poster_path || "",
            rating: detail.vote_average || 0,
            releaseDate: detail.release_date || detail.first_air_date || "",
            overview: detail.overview || "",
          },
        })
      );
    }
  }, [detail, id, mediaType, dispatch]);

  // Build movieData snapshot for save calls
  const buildSnapshot = () => ({
    title: detail.title || detail.name || "Unknown",
    poster: detail.poster_path || "",
    rating: detail.vote_average || 0,
    releaseDate: detail.release_date || detail.first_air_date || "",
    overview: detail.overview || "",
  });

  const handleFavoriteToggle = () => {
    if (isFavorited) {
      dispatch(removeFavorite(String(id)));
      toast.success("Removed from favorites");
    } else {
      dispatch(
        addFavorite({
          tmdbId: String(id),
          mediaType,
          movieData: buildSnapshot(),
        })
      );
      toast.success("Added to favorites ❤️");
    }
  };

  const handleWatchlistToggle = () => {
    if (isInWatchlist) {
      dispatch(removeFromWatchlist(String(id)));
      toast.success("Removed from watchlist");
    } else {
      dispatch(
        addToWatchlist({
          tmdbId: String(id),
          mediaType,
          movieData: buildSnapshot(),
        })
      );
      toast.success("Added to watchlist 🔖");
    }
  };

  // Extract trailer key
  const trailerKey =
    detail?.videos?.results?.find(
      (v) => v.site === "YouTube" && v.type === "Trailer"
    )?.key ||
    detail?.videos?.results?.find((v) => v.site === "YouTube")?.key ||
    null;

  // --- Loading skeleton ---
  if (detailLoading || !detail) {
    return (
      <div className="min-h-screen" style={{ background: "var(--bg-primary)" }}>
        <div className="relative w-full h-[70vh] animate-pulse" style={{ background: "var(--bg-hover)" }} />
        <div className="section-container -mt-40 relative z-10">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-64 h-96 rounded-2xl animate-pulse flex-shrink-0" style={{ background: "var(--bg-hover)" }} />
            <div className="flex-1 flex flex-col gap-4 pt-4">
              <div className="w-3/4 h-8 rounded-lg animate-pulse" style={{ background: "var(--bg-hover)" }} />
              <div className="w-1/2 h-5 rounded-lg animate-pulse" style={{ background: "var(--bg-hover)" }} />
              <div className="w-full h-24 rounded-lg animate-pulse" style={{ background: "var(--bg-hover)" }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- Error state ---
  if (detailError) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--bg-primary)", color: "var(--text-primary)" }}
      >
        <div className="text-center">
          <p className="text-lg font-semibold mb-2">Something went wrong</p>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            {detailError}
          </p>
        </div>
      </div>
    );
  }

  // Helpers
  const title = detail.title || detail.name || "Untitled";
  const year = (detail.release_date || detail.first_air_date || "").split("-")[0];
  const runtime = detail.runtime
    ? `${Math.floor(detail.runtime / 60)}h ${detail.runtime % 60}m`
    : detail.episode_run_time?.[0]
      ? `${detail.episode_run_time[0]}m/ep`
      : null;
  const genres = detail.genres?.map((g) => g.name) || [];
  const rating = detail.vote_average?.toFixed(1) || "N/A";
  const backdropUrl = detail.backdrop_path
    ? `https://image.tmdb.org/t/p/original${detail.backdrop_path}`
    : null;
  const posterUrl = detail.poster_path
    ? `https://image.tmdb.org/t/p/w500${detail.poster_path}`
    : "https://res.cloudinary.com/dr3icbigy/image/upload/v1772899683/placeholder_image_scac1b.png";
  const cast = detail.credits?.cast || [];
  const similar = detail.similar?.results?.filter((m) => m.poster_path).slice(0, 12) || [];

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-primary)" }}>
      {/* ─── Cinematic Backdrop ─────────────────────────────────────── */}
      <div className="relative w-full h-[55vh] md:h-[70vh] overflow-hidden -mt-14">

        {/* Mobile: portrait poster — no cropping */}
        <div className="block md:hidden absolute inset-0">
          <img
            src={posterUrl}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover object-top"
          />
        </div>

        {/* Desktop: wide cinematic backdrop */}
        <div className="hidden md:block absolute inset-0">
          {backdropUrl && (
            <img
              src={backdropUrl}
              alt={title}
              className="absolute inset-0 w-full h-full object-cover"
              style={{ objectPosition: "center 20%" }}
            />
          )}
        </div>

        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: isDark
              ? "linear-gradient(to right, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.1) 100%)"
              : "linear-gradient(to right, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.1) 60%, transparent 100%)",
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: isDark
              ? "linear-gradient(to top, var(--bg-primary) 0%, rgba(0,0,0,0.5) 40%, transparent 70%)"
              : "linear-gradient(to top, var(--bg-primary) 0%, var(--bg-primary) 10%, rgba(255,255,255,0.05) 50%, transparent 80%)",
          }}
        />
        <Link
          to="/home"
          className="absolute top-20 left-6 z-10 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium no-underline"
          style={{
            background: "rgba(0, 0, 0, 0.4)",
            backdropFilter: "blur(8px)",
            color: "#fff",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            transition: "background 0.3s ease",
          }}
        >
          <RiArrowLeftLine size={16} />
          Back
        </Link>
      </div>

      {/* ─── Main Content ──────────────────────────────────────────── */}
      <div className="section-container relative z-10 -mt-32 md:-mt-52 pb-16">
        <div className="flex flex-col md:flex-row gap-8 animate-in">
          {/* Poster */}
          <div className="flex-shrink-0 mx-auto md:mx-0">
            <img
              src={posterUrl}
              alt={title}
              className="w-40 sm:w-48 md:w-64 rounded-2xl object-contain"
              style={{
                boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)",
                border: "1px solid var(--border)",
              }}
            />
          </div>

          {/* Info Pane */}
          <div className="flex-1 flex flex-col justify-end gap-3">
            <h1
              className="text-3xl md:text-5xl font-black tracking-tight leading-tight"
              style={{ color: "var(--text-primary)" }}
            >
              {title}
            </h1>

            <div
              className="flex flex-wrap items-center gap-3 text-sm font-medium"
              style={{ color: "var(--text-secondary)" }}
            >
              {year && (
                <span className="flex items-center gap-1">
                  <RiCalendarLine size={14} />
                  {year}
                </span>
              )}
              {runtime && (
                <span className="flex items-center gap-1">
                  <RiTimeLine size={14} />
                  {runtime}
                </span>
              )}
              {genres.length > 0 && <span>{genres.join(" · ")}</span>}
            </div>

            <div className="flex items-center gap-2">
              <div
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold"
                style={{
                  background: "var(--accent-light)",
                  color: "var(--accent)",
                }}
              >
                <RiStarFill size={14} />
                {rating}
              </div>
              {detail.vote_count && (
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                  ({detail.vote_count.toLocaleString()} votes)
                </span>
              )}
            </div>

            {detail.tagline && (
              <p className="text-sm italic mt-1" style={{ color: "var(--text-muted)" }}>
                "{detail.tagline}"
              </p>
            )}

            <p
              className="text-sm md:text-base leading-relaxed mt-2"
              style={{ color: "var(--text-secondary)" }}
            >
              {detail.overview || "No overview available."}
            </p>

            {/* ─── Action Buttons (Premium Glassmorphic) ─────────── */}
            <div className="flex items-center gap-4 mt-5 flex-wrap">
              {/* Watch Trailer */}
              {trailerKey && (
                <button
                  onClick={() => setShowTrailer(true)}
                  className="btn-fill-primary relative overflow-hidden flex items-center gap-2.5 px-8 py-3.5 rounded-full text-sm font-bold text-white cursor-pointer border-0"
                  style={{ background: "var(--accent)" }}
                >
                  <RiPlayFill size={18} className="relative z-10" />
                  <span className="relative z-10">Watch Trailer</span>
                </button>
              )}

              {/* Favorite Toggle */}
              <button
                onClick={handleFavoriteToggle}
                className="flex items-center gap-2.5 px-6 py-3.5 rounded-full text-sm font-semibold cursor-pointer transition-all duration-300 active:scale-95"
                style={{
                  background: isFavorited
                    ? "rgba(239, 68, 68, 0.15)"
                    : "rgba(255, 255, 255, 0.08)",
                  backdropFilter: "blur(12px)",
                  border: isFavorited
                    ? "1.5px solid rgba(239, 68, 68, 0.4)"
                    : "1.5px solid var(--border)",
                  color: isFavorited ? "#ef4444" : "var(--text-secondary)",
                }}
              >
                {isFavorited ? <RiHeartFill size={18} /> : <RiHeartLine size={18} />}
                {isFavorited ? "Favorited" : "Favorite"}
              </button>

              {/* Watchlist Toggle */}
              <button
                onClick={handleWatchlistToggle}
                className="flex items-center gap-2.5 px-6 py-3.5 rounded-full text-sm font-semibold cursor-pointer transition-all duration-300 active:scale-95"
                style={{
                  background: isInWatchlist
                    ? "rgba(124, 58, 237, 0.15)"
                    : "rgba(255, 255, 255, 0.08)",
                  backdropFilter: "blur(12px)",
                  border: isInWatchlist
                    ? "1.5px solid rgba(124, 58, 237, 0.4)"
                    : "1.5px solid var(--border)",
                  color: isInWatchlist ? "var(--accent)" : "var(--text-secondary)",
                }}
              >
                {isInWatchlist ? <RiBookmarkFill size={18} /> : <RiBookmarkLine size={18} />}
                {isInWatchlist ? "In Watchlist" : "Watchlist"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Cast Scroller ─────────────────────────────────────────── */}
      <CastScroller cast={cast} />

      {/* ─── Similar Movies / Shows ────────────────────────────────── */}
      {similar.length > 0 && (
        <section className="section-container py-8 animate-in delay-200">
          <h2
            className="text-xl font-bold mb-5"
            style={{ color: "var(--text-primary)" }}
          >
            Similar {mediaType === "tv" ? "Shows" : "Movies"}
          </h2>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
            {similar.map((item, index) => (
              <Link
                key={`${item.id}-${index}`}
                to={`/${mediaType}/${item.id}`}
                className="group flex flex-col gap-2 no-underline"
              >
                <div
                  className="relative aspect-[2/3] overflow-hidden rounded-xl card-hover"
                  style={{ border: "1px solid var(--border)" }}
                >
                  <img
                    src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                    alt={item.title || item.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div
                    className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold backdrop-blur-md"
                    style={{
                      background: "rgba(0,0,0,0.5)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "#fff",
                    }}
                  >
                    <RiStarFill size={10} className="text-yellow-400" />
                    {item.vote_average?.toFixed(1)}
                  </div>
                </div>
                <p
                  className="text-xs font-semibold truncate"
                  style={{ color: "var(--text-primary)" }}
                >
                  {item.title || item.name}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ─── Trailer Modal ─────────────────────────────────────────── */}
      {showTrailer && (
        <TrailerModal
          videoKey={trailerKey}
          onClose={() => setShowTrailer(false)}
        />
      )}
    </div>
  );
};

export default MovieDetailPage;
