/**
 * ResultsSkeleton
 * ---------------
 * Loading skeleton grid shown while the LLM + TMDB request is in flight.
 * Matches the aspect ratio of real movie cards to prevent layout shift.
 */
const ResultsSkeleton = ({ count = 12 }) => (
  <div
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
      gap: 16,
      maxWidth: 1200,
      margin: "0 auto",
    }}
  >
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} style={{ animation: `skeletonPulse 1.6s ease-in-out ${i * 0.05}s infinite` }}>
        {/* Poster placeholder */}
        <div
          style={{
            width: "100%",
            aspectRatio: "2/3",
            borderRadius: 12,
            background: "var(--bg-hover)",
          }}
        />
        {/* Title placeholder */}
        <div
          style={{
            height: 12,
            width: "70%",
            borderRadius: 6,
            background: "var(--border)",
            marginTop: 10,
          }}
        />
        {/* Rating placeholder */}
        <div
          style={{
            height: 10,
            width: "40%",
            borderRadius: 6,
            background: "var(--border)",
            marginTop: 6,
          }}
        />
      </div>
    ))}
    <style>{`
      @keyframes skeletonPulse {
        0%, 100% { opacity: 0.5; }
        50% { opacity: 1; }
      }
    `}</style>
  </div>
);

export default ResultsSkeleton;
