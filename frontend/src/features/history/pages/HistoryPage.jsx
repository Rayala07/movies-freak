import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { fetchHistory, removeFromHistory, clearAllHistory } from "../historySlice";
import {
  RiTimeLine,
  RiStarFill,
  RiCloseLine,
  RiDeleteBin6Line,
} from "@remixicon/react";
import toast from "react-hot-toast";

/**
 * HistoryPage — Phase F7
 * -----------------------
 * Displays the user's recently viewed movies and TV shows.
 * Features:
 *   - "Clear History" button in header wipes all entries at once
 *   - Hover X on each card removes that single entry
 */
const HistoryPage = () => {
  const dispatch = useDispatch();
  const { items, loading } = useSelector((state) => state.history);
  const [confirmClear, setConfirmClear] = useState(false);

  useEffect(() => {
    dispatch(fetchHistory());
  }, [dispatch]);

  const handleRemove = (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(removeFromHistory(id));
  };

  const handleClearAll = () => {
    if (!confirmClear) {
      // First click — ask for confirmation
      setConfirmClear(true);
      // Auto-cancel after 3 seconds
      setTimeout(() => setConfirmClear(false), 3000);
      return;
    }
    // Second click — confirmed, execute
    dispatch(clearAllHistory());
    toast.success("Watch history cleared");
    setConfirmClear(false);
  };

  const moviePlaceholder =
    "https://res.cloudinary.com/dr3icbigy/image/upload/v1772899683/placeholder_image_scac1b.png";

  return (
    <div className="min-h-[calc(100vh-3.5rem)] pt-12" style={{ background: "var(--bg-primary)" }}>
      <div className="section-container">

        {/* ── Header ─────────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-8 animate-in">
          <div className="flex flex-col gap-1">
            <h1
              className="text-2xl md:text-3xl font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              Watch History
            </h1>
            <p className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>
              {items.length} {items.length === 1 ? "item" : "items"} viewed
            </p>
          </div>

          {/* Clear History button — only visible when there are items */}
          {items.length > 0 && (
            <button
              onClick={handleClearAll}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold cursor-pointer transition-all duration-300 active:scale-95"
              style={{
                background: confirmClear
                  ? "rgba(239, 68, 68, 0.2)"
                  : "rgba(255, 255, 255, 0.06)",
                backdropFilter: "blur(12px)",
                border: confirmClear
                  ? "1.5px solid rgba(239, 68, 68, 0.5)"
                  : "1.5px solid var(--border)",
                color: confirmClear ? "#ef4444" : "var(--text-secondary)",
              }}
            >
              <RiDeleteBin6Line size={15} />
              {confirmClear ? "Tap again to confirm" : "Clear History"}
            </button>
          )}
        </div>

        {/* ── Grid ───────────────────────────────────────────────── */}
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
            {items.map((entry, index) => {
              const linkPath =
                entry.mediaType === "tv"
                  ? `/tv/${entry.tmdbId}`
                  : `/movie/${entry.tmdbId}`;
              const posterUrl = entry.movieData?.poster
                ? `https://image.tmdb.org/t/p/w500${entry.movieData.poster}`
                : moviePlaceholder;

              return (
                <Link
                  key={`${entry._id}-${index}`}
                  to={linkPath}
                  className="group flex flex-col gap-3 cursor-pointer no-underline"
                >
                  <div
                    className="relative aspect-[2/3] overflow-hidden rounded-2xl card-hover"
                    style={{ border: "1px solid var(--border)" }}
                  >
                    <img
                      src={posterUrl}
                      alt={entry.movieData?.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />

                    {/* Rating badge */}
                    {entry.movieData?.rating > 0 && (
                      <div
                        className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold backdrop-blur-md"
                        style={{
                          background: "rgba(0,0,0,0.5)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          color: "#fff",
                        }}
                      >
                        <RiStarFill size={10} className="text-yellow-400" />
                        {entry.movieData.rating.toFixed(1)}
                      </div>
                    )}

                    {/* Remove (X) button — appears on hover */}
                    <button
                      onClick={(e) => handleRemove(entry._id, e)}
                      className="absolute top-3 left-3 flex items-center justify-center w-8 h-8 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{
                        background: "rgba(0,0,0,0.55)",
                        backdropFilter: "blur(8px)",
                        border: "1px solid rgba(255,255,255,0.15)",
                      }}
                      title="Remove from history"
                    >
                      <RiCloseLine size={16} style={{ color: "#fff" }} />
                    </button>
                  </div>

                  <div className="flex flex-col gap-1">
                    <h3
                      className="text-sm font-semibold truncate"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {entry.movieData?.title}
                    </h3>
                    <p
                      className="text-xs font-medium"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {entry.movieData?.releaseDate?.split("-")[0] || "TBA"}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          /* ── Empty state ─────────────────────────────────────── */
          <div className="flex flex-col items-center justify-center py-24 text-center animate-in">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
              style={{ background: "var(--bg-hover)", border: "1px solid var(--border)" }}
            >
              <RiTimeLine size={40} style={{ color: "var(--text-muted)" }} />
            </div>
            <h2 className="text-xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
              No history yet
            </h2>
            <p className="max-w-xs text-sm" style={{ color: "var(--text-muted)" }}>
              Your recently viewed movies and shows will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;
