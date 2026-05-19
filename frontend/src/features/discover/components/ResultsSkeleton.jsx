import React from "react";

/**
 * ResultsSkeleton Component (Phase 7 — Polish)
 * ----------------------------------------------
 * A shimmer placeholder shown while AI results are loading.
 * Mimics the shape of the actual results (reasoning card + movie grid)
 * so the page doesn't feel empty or broken during the wait.
 */
const ResultsSkeleton = () => {
  return (
    <div className="w-full flex flex-col gap-6 animate-pulse">
      {/* Reasoning Card Skeleton */}
      <div
        className="rounded-2xl p-6 flex flex-col gap-4"
        style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}
      >
        <div className="flex items-center gap-3">
          <div className="h-4 w-24 rounded-full" style={{ background: "var(--bg-hover)" }} />
          <div className="h-5 w-16 rounded-full" style={{ background: "var(--bg-hover)" }} />
        </div>
        <div className="h-6 w-3/4 rounded-lg" style={{ background: "var(--bg-hover)" }} />
        <div className="h-4 w-1/2 rounded-lg" style={{ background: "var(--bg-hover)" }} />
      </div>

      {/* Movie Grid Skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-3">
            {/* Poster */}
            <div
              className="w-full rounded-2xl"
              style={{
                aspectRatio: "2/3",
                background: "var(--bg-hover)",
                animationDelay: `${i * 50}ms`,
              }}
            />
            {/* Title */}
            <div className="h-3 w-4/5 rounded" style={{ background: "var(--bg-hover)" }} />
            <div className="h-3 w-2/5 rounded" style={{ background: "var(--bg-hover)" }} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResultsSkeleton;
