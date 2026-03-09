import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchCollectionDetail, clearCollectionDetail } from "../../admin/adminSlice";
import {
  RiPlayFill,
  RiArrowLeftLine,
  RiCalendarLine,
  RiCloseLine,
} from "@remixicon/react";

/**
 * CollectionDetailPage — MoviesFreak Collection
 * -----------------------------------------------
 * Clean premium layout: full-width blurred poster background + card UI.
 * Data path: adminService.getMovieById → adminSlice.collectionDetail
 *
 * ISOLATION RULES:
 *   - Reads from state.admin.collectionDetail  (NOT state.movies.movieDetail)
 *   - Uses adminService  (NOT tmdbService)
 *   - Route is /collection/:id  (NOT /movie/:id or /tv/:id)
 *   - Trailer uses stored trailerUrl from DB  (NOT TMDB videos API)
 */

// ── Helpers ──────────────────────────────────────────────────────────────────
const extractYouTubeKey = (url) => {
  if (!url) return null;
  const short = url.match(/youtu\.be\/([^?&#]+)/);
  if (short) return short[1];
  const embed = url.match(/\/embed\/([^?&#]+)/);
  if (embed) return embed[1];
  const query = url.match(/[?&]v=([^&#]+)/);
  if (query) return query[1];
  return null;
};

// ── Trailer Modal ─────────────────────────────────────────────────────────────
const TrailerModal = ({ videoKey, onClose }) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center p-4"
    style={{ background: "rgba(0,0,0,0.92)", backdropFilter: "blur(8px)" }}
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
        style={{
          background: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(255,255,255,0.2)",
        }}
      >
        <RiCloseLine size={20} style={{ color: "#fff" }} />
      </button>
    </div>
  </div>
);

// ── Main Page ─────────────────────────────────────────────────────────────────
const CollectionDetailPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { collectionDetail: movie, collectionDetailLoading, collectionDetailError } =
    useSelector((state) => state.admin);
  const [showTrailer, setShowTrailer] = useState(false);

  useEffect(() => {
    dispatch(fetchCollectionDetail(id));
    window.scrollTo(0, 0);
    return () => dispatch(clearCollectionDetail());
  }, [dispatch, id]);

  const placeholder =
    "https://res.cloudinary.com/dr3icbigy/image/upload/v1772899683/placeholder_image_scac1b.png";

  const trailerKey = extractYouTubeKey(movie?.trailerUrl);
  const posterSrc = movie?.poster || placeholder;
  const year = movie?.releaseDate ? new Date(movie.releaseDate).getFullYear() : null;

  // ── Loading ────────────────────────────────────────────────────────────────
  if (collectionDetailLoading) {
    return (
      <div className="min-h-screen pt-20" style={{ background: "var(--bg-primary)" }}>
        <div className="section-container">
          <div className="flex flex-col md:flex-row gap-10 animate-pulse">
            <div className="w-56 md:w-72 aspect-[2/3] rounded-2xl flex-shrink-0" style={{ background: "var(--bg-hover)" }} />
            <div className="flex-1 flex flex-col gap-5 pt-4">
              <div className="h-10 w-2/3 rounded-xl" style={{ background: "var(--bg-hover)" }} />
              <div className="h-5 w-1/4 rounded-lg" style={{ background: "var(--bg-hover)" }} />
              <div className="h-32 rounded-xl" style={{ background: "var(--bg-hover)" }} />
              <div className="h-12 w-48 rounded-full" style={{ background: "var(--bg-hover)" }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  if (collectionDetailError || !movie) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4"
        style={{ background: "var(--bg-primary)" }}>
        <p className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>Movie not found</p>
        <Link to="/collection" className="text-sm font-semibold no-underline" style={{ color: "var(--accent)" }}>
          ← Back to Collection
        </Link>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col"
      style={{ background: "var(--bg-primary)", minHeight: "calc(100vh - 56px)", overflowX: "hidden" }}
    >

      {/* ── Full-page blurred background ──────────────────────────────── */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{ opacity: 0.12 }}
        aria-hidden="true"
      >
        <img
          src={posterSrc}
          alt=""
          className="w-full h-full object-cover"
          style={{ filter: "blur(60px)" }}
          onError={(e) => { e.target.style.display = "none"; }}
        />
      </div>

      {/* ── Page content ─────────────────────────────────────────────── */}
      <div className="relative z-10 section-container flex-1 flex flex-col justify-center pt-10 pb-28 lg:py-10">

        {/* Back nav */}
        <Link
          to="/collection"
          className="inline-flex items-center gap-2 mb-10 text-sm font-medium no-underline group transition-colors duration-200"
          style={{ color: "var(--text-muted)" }}
        >
          <RiArrowLeftLine size={16} style={{ color: "var(--text-muted)" }} />
          <span className="group-hover:underline" style={{ color: "var(--text-secondary)" }}>
            Collection
          </span>
        </Link>

        {/* ── Main card ─────────────────────────────────────────────── */}
        <div
          className="flex flex-col md:flex-row gap-10 md:gap-14 animate-in"
        >
          {/* Poster */}
          <div className="flex-shrink-0 mx-auto md:mx-0">
            <img
              src={posterSrc}
              alt={movie.title}
              className="w-52 sm:w-64 md:w-72 rounded-2xl object-cover"
              style={{
                boxShadow: "0 24px 64px rgba(0,0,0,0.45)",
                border: "1px solid var(--border)",
              }}
              onError={(e) => { e.target.src = placeholder; }}
            />
          </div>

          {/* Details */}
          <div className="flex flex-col gap-5 justify-center max-w-xl">

            {/* Badge */}
            <div
              className="inline-flex items-center w-fit px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest"
              style={{
                background: "rgba(124,58,237,0.12)",
                border: "1px solid rgba(124,58,237,0.25)",
                color: "var(--accent)",
              }}
            >
              MoviesFreak Collection
            </div>

            {/* Title */}
            <h1
              className="text-3xl md:text-4xl xl:text-5xl font-black tracking-tight leading-tight"
              style={{ color: "var(--text-primary)" }}
            >
              {movie.title}
            </h1>

            {/* Meta chips */}
            <div className="flex flex-wrap items-center gap-2">
              {year && (
                <span
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                  style={{ background: "var(--bg-hover)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}
                >
                  <RiCalendarLine size={12} />
                  {year}
                </span>
              )}
              {movie.genre && (
                <span
                  className="px-3 py-1 rounded-full text-xs font-bold"
                  style={{ background: "var(--accent-light)", color: "var(--accent)" }}
                >
                  {movie.genre}
                </span>
              )}
              {movie.category && (
                <span
                  className="px-3 py-1 rounded-full text-xs font-semibold"
                  style={{ background: "var(--bg-hover)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}
                >
                  {movie.category}
                </span>
              )}
            </div>

            {/* Divider */}
            <div className="h-px w-full" style={{ background: "var(--border)" }} />

            {/* Description */}
            {movie.description ? (
              <p
                className="text-sm md:text-base leading-relaxed"
                style={{ color: "var(--text-secondary)" }}
              >
                {movie.description}
              </p>
            ) : (
              <p className="text-sm italic" style={{ color: "var(--text-muted)" }}>
                No description available.
              </p>
            )}

            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {trailerKey ? (
                <button
                  onClick={() => setShowTrailer(true)}
                  className="flex items-center gap-2 px-7 py-3 rounded-full text-sm font-bold text-white cursor-pointer border-0 transition-all duration-200 active:scale-95 hover:opacity-90"
                  style={{ background: "var(--accent)" }}
                >
                  <RiPlayFill size={18} />
                  Watch Trailer
                </button>
              ) : (
                <div
                  className="flex items-center gap-2 px-7 py-3 rounded-full text-sm font-semibold"
                  style={{
                    background: "var(--bg-hover)",
                    border: "1px solid var(--border)",
                    color: "var(--text-muted)",
                    cursor: "default",
                  }}
                >
                  No trailer available
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* Trailer Modal */}
      {showTrailer && trailerKey && (
        <TrailerModal videoKey={trailerKey} onClose={() => setShowTrailer(false)} />
      )}
    </div>
  );
};

export default CollectionDetailPage;
