import React from "react";
import MovieCard from "../../movies/components/MovieCard";
import VibeTag from "./VibeTag";

/**
 * DiscoverResults Component
 * -------------------------
 * Displays the AI's reasoning card (if provided), vibe tag,
 * and the grid of movie results from TMDB.
 *
 * Reasoning and vibeTag are optional — GroupSummary handles those
 * in group mode, so they're passed as null to avoid duplication.
 */
const DiscoverResults = ({ results, reasoning, vibeTag, isRelaxed }) => {
  if (!results || results.length === 0) return null;

  return (
    <div className="w-full flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700">

      {/* Reasoning Card — only shown in solo mode */}
      {reasoning && (
        <div
          className="rounded-2xl p-6 relative overflow-hidden shadow-sm"
          style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}
        >
          {/* Subtle glow decoration */}
          <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl pointer-events-none" style={{ background: "var(--accent-light)" }} />

          <div className="relative z-10 flex flex-col gap-3">
            <div className="flex items-center gap-3 flex-wrap">
              <span
                className="text-xs font-semibold uppercase tracking-wider"
                style={{ color: "var(--accent)" }}
              >
                AI Analysis
              </span>
              {vibeTag && <VibeTag vibe={vibeTag} />}
            </div>

            <p className="text-lg leading-relaxed" style={{ color: "var(--text-primary)" }}>
              {reasoning}
            </p>

            {isRelaxed && (
              <div
                className="mt-1 text-sm rounded-lg px-3 py-2 inline-flex items-center gap-2"
                style={{
                  background: "rgba(245, 158, 11, 0.08)",
                  border: "1px solid rgba(245, 158, 11, 0.2)",
                  color: "var(--warning)",
                }}
              >
                <span className="w-2 h-2 rounded-full inline-block" style={{ background: "var(--warning)" }} />
                We broadened the search a little to find you the best matches.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Relaxed notice for group mode (when reasoning is suppressed) */}
      {!reasoning && isRelaxed && (
        <div
          className="text-sm rounded-xl px-4 py-2.5 flex items-center gap-2"
          style={{
            background: "rgba(245, 158, 11, 0.08)",
            border: "1px solid rgba(245, 158, 11, 0.2)",
            color: "var(--warning)",
          }}
        >
          <span className="w-2 h-2 rounded-full flex-shrink-0 inline-block" style={{ background: "var(--warning)" }} />
          Search filters were broadened to find the best matches for your group.
        </div>
      )}

      {/* Movie Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
        {results.map((movie, index) => (
          <div
            key={movie.id}
            className="animate-in fade-in slide-in-from-bottom-4"
            style={{ animationDelay: `${index * 40}ms`, animationFillMode: "both" }}
          >
            <MovieCard movie={movie} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default DiscoverResults;
