import { useState, useEffect, useCallback, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { RiPlayFill, RiAddLine, RiInformationLine, RiCloseLine } from "@remixicon/react";
import tmdbService from "../services/tmdbService";

/**
 * Hero — Cinematic Carousel
 * -------------------------
 * Responsive:
 *   Mobile  → poster_path (portrait, no crop)
 *   Desktop → backdrop_path (landscape, cinematic)
 *
 * Play Now → fetches trailer on demand, plays in a modal.
 * Light theme → soft overlays instead of heavy black gradients.
 */
const INTERVAL_MS = 5000;

// ── Trailer Modal ─────────────────────────────────────────────────────────
const TrailerModal = ({ videoKey, onClose }) => (
  <>
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.88)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl rounded-2xl overflow-hidden"
        style={{ aspectRatio: "16/9", boxShadow: "0 30px 80px rgba(0,0,0,0.8)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <iframe
          src={`https://www.youtube.com/embed/${videoKey}?autoplay=1&rel=0&modestbranding=1`}
          title="Trailer"
          className="absolute inset-0 w-full h-full"
          frameBorder="0"
          allow="autoplay; encrypted-media; fullscreen"
          allowFullScreen
        />
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 flex items-center justify-center w-10 h-10 rounded-full cursor-pointer"
          style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.2)" }}
        >
          <RiCloseLine size={20} style={{ color: "#fff" }} />
        </button>
      </div>
    </div>
  </>
);

// ── Hero proper ───────────────────────────────────────────────────────────
const Hero = ({ movies = [], isDark = true }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [trailerKey, setTrailerKey] = useState(null);
  const [trailerOpen, setTrailerOpen] = useState(false);
  const [trailerLoading, setTrailerLoading] = useState(false);
  const trailerCache = useRef({});
  const navigate = useNavigate();
  const count = movies.length;

  // Auto-rotate — paused while trailer modal is open
  useEffect(() => {
    if (count <= 1 || trailerOpen) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % count);
    }, INTERVAL_MS);
    return () => clearInterval(timer);
  }, [count, trailerOpen]);

  // Reset trailer only when slide changes AND no trailer is open
  useEffect(() => {
    if (!trailerOpen) setTrailerKey(null);
  }, [activeIndex, trailerOpen]);

  const goTo = useCallback((i) => setActiveIndex(i), []);

  const handlePlayNow = async () => {
    const movie = movies[activeIndex];
    const mediaType = movie.media_type === "tv" ? "tv" : "movie";
    const cacheKey = `${mediaType}-${movie.id}`;

    // Use cached key if available
    if (trailerCache.current[cacheKey]) {
      setTrailerKey(trailerCache.current[cacheKey]);
      setTrailerOpen(true);
      return;
    }

    setTrailerLoading(true);
    try {
      const data = await tmdbService.getVideos(movie.id, mediaType);
      const trailer = data.results?.find(
        (v) => v.type === "Trailer" && v.site === "YouTube"
      ) || data.results?.[0];
      if (trailer?.key) {
        trailerCache.current[cacheKey] = trailer.key;
        setTrailerKey(trailer.key);
        setTrailerOpen(true);
      } else {
        // No trailer — navigate to detail page instead
        navigate(`/${mediaType}/${movie.id}`);
      }
    } catch {
      navigate(`/${mediaType}/${movie.id}`);
    } finally {
      setTrailerLoading(false);
    }
  };

  const handleCloseTrailer = () => {
    setTrailerKey(null);
    setTrailerOpen(false);
  };

  if (count === 0) return <div className="h-[75vh] md:h-[85vh]" />;
  const active = movies[activeIndex];
  const mediaType = active.media_type === "tv" ? "tv" : "movie";

  // ── Overlay styles — dark vs light ────────────────────────────────────
  const overlayLeft = isDark
    ? "linear-gradient(to right, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 40%, rgba(0,0,0,0.05) 70%, transparent 100%)"
    : "linear-gradient(to right, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.15) 50%, transparent 100%)";

  const overlayBottom = isDark
    ? "linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.2) 30%, transparent 60%)"
    : "linear-gradient(to top, rgba(0,0,0,0.35) 0%, transparent 60%)";

  const overlayBottomFade = isDark
    ? "linear-gradient(to top, var(--bg-primary) 0%, var(--bg-primary) 20%, transparent 100%)"
    : "linear-gradient(to top, var(--bg-primary) 0%, var(--bg-primary) 5%, transparent 15%)";

  const overlayTop = isDark
    ? "linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 100%)"
    : "linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, transparent 100%)";

  return (
    <>
      <div className="relative w-full h-[75vh] xl:h-[85vh] overflow-hidden">

        {/* Mobile + Tablet: portrait poster */}
        <div className="block xl:hidden absolute inset-0">
          {movies.map((movie, i) => (
            <img
              key={`mob-${movie.id}`}
              src={
                movie.poster_path
                  ? `https://image.tmdb.org/t/p/w780${movie.poster_path}`
                  : `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
              }
              alt={movie.title || movie.name}
              className="absolute inset-0 w-full h-full object-cover object-top"
              style={{ opacity: i === activeIndex ? 1 : 0, transition: "opacity 1.2s ease-in-out" }}
              loading={i === 0 ? "eager" : "lazy"}
            />
          ))}
        </div>

        {/* Desktop: landscape backdrop */}
        <div className="hidden xl:block absolute inset-0">
          {movies.map((movie, i) => (
            <img
              key={`dsk-${movie.id}`}
              src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
              alt={movie.title || movie.name}
              className="absolute inset-0 w-full h-full object-cover"
              style={{ objectPosition: "center 20%", opacity: i === activeIndex ? 1 : 0, transition: "opacity 1.2s ease-in-out" }}
              loading={i === 0 ? "eager" : "lazy"}
            />
          ))}
        </div>

        {/* Overlays */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: overlayLeft }} />
        <div className="absolute inset-0 pointer-events-none" style={{ background: overlayBottom }} />
        <div className="absolute inset-x-0 bottom-0 h-[30%] pointer-events-none" style={{ background: overlayBottomFade }} />
        <div className="absolute inset-x-0 top-0 h-24 pointer-events-none" style={{ background: overlayTop }} />

        {/* Content */}
        <div className="absolute inset-0 flex flex-col justify-end section-container pb-16 pt-20">
          <div className="max-w-2xl animate-in delay-100" key={active.id}>
            {/* Badge */}
            <div
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[10px] font-bold mb-4 uppercase tracking-widest"
              style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)", color: "#fff", border: "1px solid rgba(255,255,255,0.12)" }}
            >
              Trending Now
            </div>

            <h1
              className="text-4xl md:text-6xl font-black tracking-tighter leading-tight mb-3"
              style={{ color: "#fff", textShadow: "0 2px 20px rgba(0,0,0,0.7), 0 4px 40px rgba(0,0,0,0.4)" }}
            >
              {active.title || active.name}
            </h1>

            <p
              className="text-sm mb-5 font-medium flex items-center gap-3"
              style={{ color: "rgba(255,255,255,0.85)", textShadow: "0 1px 8px rgba(0,0,0,0.6)" }}
            >
              <span>⭐ {active.vote_average?.toFixed(1)}</span>
              <span>•</span>
              <span>{(active.release_date || active.first_air_date)?.split("-")[0]}</span>
            </p>

            <p
              className="text-sm md:text-base mb-8 line-clamp-2 font-normal"
              style={{ color: "rgba(255,255,255,0.85)", textShadow: "0 1px 6px rgba(0,0,0,0.5)" }}
            >
              {active.overview}
            </p>

            {/* Actions */}
            <div className="flex items-center gap-4">
              {/* Play Now — fetches trailer */}
              <button
                onClick={handlePlayNow}
                disabled={trailerLoading}
                className="btn-fill-primary relative overflow-hidden flex items-center gap-2 px-8 py-3 rounded-full text-sm font-bold text-white cursor-pointer border-0 transition-all duration-200 active:scale-95"
                style={{ background: trailerLoading ? "rgba(124,58,237,0.6)" : "var(--accent)", minWidth: "130px" }}
              >
                <RiPlayFill size={18} className="relative z-10" />
                <span className="relative z-10">{trailerLoading ? "Loading…" : "Play Now"}</span>
              </button>

              {/* + Button → watchlist shortcut (navigate to detail) */}
              <Link
                to={`/${mediaType}/${active.id}`}
                className="flex items-center justify-center w-11 h-11 rounded-full no-underline"
                style={{ background: "rgba(255,255,255,0.12)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.2)" }}
                aria-label="View details"
              >
                <RiAddLine size={20} style={{ color: "#fff" }} />
              </Link>

              {/* Info → detail page */}
              <Link
                to={`/${mediaType}/${active.id}`}
                className="flex items-center justify-center w-11 h-11 rounded-full no-underline"
                style={{ background: "rgba(255,255,255,0.12)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.2)" }}
                aria-label="More info"
              >
                <RiInformationLine size={20} style={{ color: "#fff" }} />
              </Link>
            </div>
          </div>

          {/* Dot indicators */}
          {count > 1 && (
            <div className="flex items-center gap-2 mt-8">
              {movies.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className="rounded-full cursor-pointer border-0"
                  style={{
                    width: i === activeIndex ? 24 : 8,
                    height: 8,
                    background: i === activeIndex ? "var(--accent)" : "var(--text-muted)",
                    transition: "all 0.4s ease",
                  }}
                  aria-label={`Slide ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Trailer Modal */}
      {trailerKey && trailerOpen && (
        <TrailerModal videoKey={trailerKey} onClose={handleCloseTrailer} />
      )}
    </>
  );
};

export default Hero;
