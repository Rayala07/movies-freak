import MovieCard from "../../movies/components/MovieCard";
import { RiFilmLine } from "@remixicon/react";

/**
 * DiscoverResults - Sectioned Horizontal-Scroll Layout
 * ------------------------------------------------------
 * Results are split into three sections based on _tag:
 *   1. "community"   → Loved by the Community
 *   2. "hidden_gem"  → Hidden Gems for You
 *   3. (untagged)    → More for Your Mood
 *
 * Each section is a single horizontally scrollable row (Netflix-style).
 * Sections only render when they have at least 1 item.
 */

const SECTION_CONFIG = {
  community: {
    icon: "🧡",
    title: "Loved by the Community",
    subtitle: "Top picks that movie lovers across the internet can't stop recommending",
    accentColor: "#f97316",
    accentBg: "rgba(249,115,22,0.12)",
    accentBorder: "rgba(249,115,22,0.3)",
  },
  hidden_gem: {
    icon: "💎",
    title: "Hidden Gems for You",
    subtitle: "Critically acclaimed and off the radar - surfaced specifically for your taste",
    accentColor: "#0d9488",
    accentBg: "rgba(13,148,136,0.12)",
    accentBorder: "rgba(13,148,136,0.3)",
  },
  general: {
    icon: "🎬",
    title: "More for Your Mood",
    subtitle: "Quality picks that match what you're feeling right now",
    accentColor: "#7c3aed",
    accentBg: "rgba(124,58,237,0.12)",
    accentBorder: "rgba(124,58,237,0.3)",
  },
};

/**
 * Section
 * -------
 * A labeled section with a horizontally scrollable movie row.
 * Only renders if movies.length > 0.
 */
const Section = ({ config, movies }) => {
  if (!movies || movies.length === 0) return null;
  const { icon, title, subtitle, accentColor, accentBg, accentBorder } = config;

  return (
    <div style={{ marginBottom: 40 }}>

      {/* ── Section Header ─────────────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 16 }}>

        {/* Vertical accent bar */}
        <div style={{
          width: 3,
          height: 44,
          background: accentColor,
          borderRadius: 3,
          flexShrink: 0,
          marginTop: 1,
          boxShadow: `0 0 10px ${accentColor}60`,
        }} />

        <div>
          {/* Title row */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
            <h3 style={{
              margin: 0,
              fontSize: 15,
              fontWeight: 700,
              color: "var(--text-primary)",
              letterSpacing: "-0.015em",
            }}>
              {icon} {title}
            </h3>
            {/* Count pill */}
            <span style={{
              fontSize: 10,
              fontWeight: 700,
              color: accentColor,
              background: accentBg,
              border: `1px solid ${accentBorder}`,
              padding: "2px 8px",
              borderRadius: 20,
              letterSpacing: "0.02em",
            }}>
              {movies.length}
            </span>
          </div>

          {/* Subtitle */}
          <p style={{
            margin: 0,
            fontSize: 12,
            color: "var(--text-muted)",
            lineHeight: 1.45,
          }}>
            {subtitle}
          </p>
        </div>
      </div>

      {/* ── Horizontal Scroll Row ──────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          gap: 14,
          overflowX: "auto",
          paddingBottom: 12,   // space for custom scrollbar
          paddingLeft: 2,
          paddingRight: 24,    // trailing space so last card doesn't clip
          scrollbarWidth: "thin",
          scrollbarColor: `${accentColor}40 transparent`,
          WebkitOverflowScrolling: "touch",
          scrollSnapType: "x mandatory",
        }}
      >
        {movies.map((movie, i) => (
          <div
            key={movie.id}
            style={{
              flexShrink: 0,
              width: 150,
              scrollSnapAlign: "start",
              animation: "fadeSlideUp 0.4s ease both",
              animationDelay: `${i * 0.05}s`,
            }}
          >
            <MovieCard movie={{ ...movie, media_type: movie.media_type || "movie" }} />
          </div>
        ))}
      </div>
    </div>
  );
};

const DiscoverResults = ({ results }) => {
  if (!results || results.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--text-muted)" }}>
        <RiFilmLine size={36} style={{ margin: "0 auto 16px", opacity: 0.4 }} />
        <p style={{ fontSize: 14 }}>No results found. Try rephrasing your mood.</p>
      </div>
    );
  }

  const communityPicks = results.filter((m) => m._tag === "community");
  const hiddenGems     = results.filter((m) => m._tag === "hidden_gem");
  const general        = results.filter((m) => !m._tag);

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto" }}>

      <Section config={SECTION_CONFIG.community}  movies={communityPicks} />
      <Section config={SECTION_CONFIG.hidden_gem} movies={hiddenGems} />
      <Section config={SECTION_CONFIG.general}    movies={general} />

      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default DiscoverResults;
