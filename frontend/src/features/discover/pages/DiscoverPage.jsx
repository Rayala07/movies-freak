import useDiscover from "../hooks/useDiscover";
import MoodInput from "../components/MoodInput";
import MoodRationale from "../components/MoodRationale";
import DiscoverResults from "../components/DiscoverResults";
import ResultsSkeleton from "../components/ResultsSkeleton";
import { RiSparklingFill } from "@remixicon/react";

/**
 * DiscoverPage — Kineo Mood-Based Movie Surfing
 * -----------------------------------------------
 * The full-page AI discovery experience.
 *
 * Layout (top to bottom):
 *   1. Cinematic header: title + subtitle
 *   2. MoodInput: textarea + suggestion pills
 *   3. MoodRationale: AI "Why these?" blurb + tag pills
 *   4. DiscoverResults: movie card grid (or skeleton/error state)
 */
const DiscoverPage = () => {
  const {
    query,
    status,
    results,
    rationale,
    params,
    error,
    isLoading,
    isSucceeded,
    handleSearch,
    handleClear,
    handleQueryChange,
  } = useDiscover();

  return (
    <div>
      {/* ── Page Header ─────────────────────────────────────── */}
      <div style={{ textAlign: "center", padding: "40px 20px 36px" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "5px 14px",
            background: "rgba(124,58,237,0.12)",
            border: "1px solid rgba(124,58,237,0.25)",
            borderRadius: 100,
            marginBottom: 20,
          }}
        >
          <RiSparklingFill size={13} style={{ color: "#a78bfa" }} />
          <span style={{ fontSize: 11, fontWeight: 600, color: "#a78bfa", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            AI-Powered Discovery
          </span>
        </div>

        <h1
          style={{
            fontSize: "clamp(28px, 5vw, 48px)",
            fontWeight: 800,
            color: "var(--text-primary)",
            letterSpacing: "-0.02em",
            lineHeight: 1.15,
            margin: "0 0 12px",
          }}
        >
          Find your next{" "}
          <span
            style={{
              background: "linear-gradient(135deg, #7c3aed, #a78bfa, #c4b5fd)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            perfect watch
          </span>
        </h1>

        <p
          style={{
            fontSize: 15,
            color: "var(--text-secondary)",
            maxWidth: 480,
            margin: "0 auto",
            lineHeight: 1.6,
          }}
        >
          Describe how you're feeling and our AI will find movies that
          match your exact vibe — personalized to your taste.
        </p>
      </div>

      {/* ── Main Content ─────────────────────────────────────── */}
      <div style={{ padding: "0 20px" }}>

        {/* Mood Input */}
        <div style={{ marginBottom: 36 }}>
          <MoodInput
            value={query}
            onChange={handleQueryChange}
            onSearch={handleSearch}
            onClear={handleClear}
            isLoading={isLoading}
          />
        </div>

        {/* Loading Skeleton */}
        {isLoading && (
          <div style={{ padding: "0 0 20px" }}>
            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", fontStyle: "italic" }}>
                ✨ Analysing your mood with Mistral AI...
              </p>
            </div>
            <ResultsSkeleton count={12} />
          </div>
        )}

        {/* Error State */}
        {status === "failed" && error && (
          <div
            style={{
              maxWidth: 500,
              margin: "0 auto 28px",
              padding: "14px 20px",
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.2)",
              borderRadius: 12,
              textAlign: "center",
            }}
          >
            <p style={{ margin: 0, fontSize: 13, color: "rgba(255,100,100,0.9)" }}>
              {error}
            </p>
          </div>
        )}

        {/* Results */}
        {isSucceeded && !isLoading && (
          <>
            {/* Result count header */}
            <div style={{ maxWidth: 1200, margin: "0 auto 16px" }}>
              <p style={{ margin: 0, fontSize: 13, color: "var(--text-secondary)" }}>
                {results.length > 0
                  ? `Found ${results.length} movies matching your mood`
                  : "No matches found"}
              </p>
            </div>

            {/* AI Rationale */}
            <MoodRationale rationale={rationale} params={params} />

            {/* Movie Grid */}
            <DiscoverResults results={results} />
          </>
        )}

        {/* Idle empty state */}
        {status === "idle" && (
          <div style={{ textAlign: "center", paddingTop: 20, color: "var(--text-tertiary)", fontSize: 13 }}>
            Your results will appear here
          </div>
        )}
      </div>
    </div>
  );
};

export default DiscoverPage;
