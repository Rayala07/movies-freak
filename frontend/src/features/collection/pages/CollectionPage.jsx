import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchAdminMovies } from "../../admin/adminSlice";
import { RiInboxLine } from "@remixicon/react";

/**
 * CollectionPage — MoviesFreak Collection
 * ----------------------------------------
 * Renders movies added by the admin from the backend DB (/api/movies).
 * Data path: adminService → adminSlice → this page.
 * COMPLETELY ISOLATED from TMDB data — no shared state, no shared routes.
 *
 * Clicking a card → /collection/:id (CollectionDetailPage)
 * NOT /movie/:id (which uses TMDB data)
 */
const moviePlaceholder =
  "https://res.cloudinary.com/dr3icbigy/image/upload/v1772899683/placeholder_image_scac1b.png";

const CollectionPage = () => {
  const dispatch = useDispatch();
  const { movies, totalMovies, moviesLoading } = useSelector((state) => state.admin);

  useEffect(() => {
    // Always refresh on mount so admin changes take effect immediately
    dispatch(fetchAdminMovies({ page: 1, limit: 50 }));
  }, [dispatch]);

  return (
    <div className="min-h-[calc(100vh-3.5rem)] pt-12" style={{ background: "var(--bg-primary)" }}>
      <div className="section-container pb-20">

        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className="mb-10 animate-in">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1
                className="text-2xl md:text-3xl font-bold mb-1"
                style={{ color: "var(--text-primary)" }}
              >
                MoviesFreak Collection
              </h1>
              <div className="text-sm">
                <p style={{ color: "var(--text-muted)" }}>
                  {moviesLoading
                    ? "Loading…"
                    : `${totalMovies} ${totalMovies === 1 ? "title" : "titles"} curated by our team`}
                </p>
                <p className="mt-1 font-medium" style={{ color: "var(--text-highlighted)" }}>
                  Check out the must watch recommendations by the Developer.
                </p>
              </div>
            </div>
            <div
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold"
              style={{
                background: "var(--accent-light)",
                border: "1px solid rgba(124,58,237,0.25)",
                color: "var(--accent)",
              }}
            >
              Curated Collection
            </div>
          </div>

          {/* Decorative divider */}
          <div
            className="mt-6 h-px w-full rounded-full"
            style={{ background: "linear-gradient(to right, var(--accent), transparent)" }}
          />
        </div>

        {/* ── Loading Skeletons ──────────────────────────────────────── */}
        {moviesLoading && movies.length === 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-5 gap-y-10">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="flex flex-col gap-3">
                <div
                  className="aspect-[2/3] rounded-2xl animate-pulse"
                  style={{ background: "var(--bg-hover)" }}
                />
                <div className="space-y-1.5">
                  <div className="h-3 rounded animate-pulse w-3/4" style={{ background: "var(--bg-hover)" }} />
                  <div className="h-3 rounded animate-pulse w-1/2" style={{ background: "var(--bg-hover)" }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Movie Grid ─────────────────────────────────────────────── */}
        {!moviesLoading && movies.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-5 gap-y-10 animate-in delay-100">
            {movies.map((movie) => (
              <Link
                key={movie._id}
                to={`/collection/${movie._id}`}
                className="group flex flex-col gap-3 cursor-pointer no-underline"
              >
                {/* Poster */}
                <div
                  className="relative aspect-[2/3] overflow-hidden rounded-2xl card-hover"
                  style={{ border: "1px solid var(--border)" }}
                >
                  <img
                    src={movie.poster || moviePlaceholder}
                    alt={movie.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                    onError={(e) => { e.target.src = moviePlaceholder; }}
                  />

                  {/* Genre badge */}
                  {movie.genre && (
                    <div
                      className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-bold backdrop-blur-md"
                      style={{
                        background: "rgba(124,58,237,0.65)",
                        color: "#fff",
                        border: "1px solid rgba(255,255,255,0.15)",
                      }}
                    >
                      {movie.genre}
                    </div>
                  )}

                  {/* Category tag */}
                  {movie.category && (
                    <div
                      className="absolute bottom-3 right-3 px-2 py-0.5 rounded-md text-[9px] font-bold backdrop-blur-md"
                      style={{
                        background: "rgba(0,0,0,0.55)",
                        color: "rgba(255,255,255,0.85)",
                        border: "1px solid rgba(255,255,255,0.1)",
                      }}
                    >
                      {movie.category}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex flex-col gap-0.5">
                  <h3
                    className="text-sm font-semibold truncate transition-colors duration-200"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {movie.title}
                  </h3>
                  <p className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
                    {movie.releaseDate
                      ? new Date(movie.releaseDate).getFullYear()
                      : "TBA"}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* ── Empty State ─────────────────────────────────────────────── */}
        {!moviesLoading && movies.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 text-center animate-in">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
              style={{ background: "var(--bg-hover)", border: "1px solid var(--border)" }}
            >
              <RiInboxLine size={40} style={{ color: "var(--text-muted)" }} />
            </div>
            <h2 className="text-xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
              No titles yet
            </h2>
            <p className="text-sm max-w-xs" style={{ color: "var(--text-muted)" }}>
              The admin hasn't added any movies to the collection yet.
            </p>
          </div>
        )}

      </div>
    </div>
  );
};

export default CollectionPage;
