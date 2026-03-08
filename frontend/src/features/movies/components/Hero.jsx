import { useState, useEffect, useCallback } from "react";
import { RiPlayFill, RiAddLine, RiInformationLine } from "@remixicon/react";

/**
 * Hero — Cinematic Carousel
 * -------------------------
 * Rotates through up to 5 trending movies every 5 seconds.
 * Uses CSS opacity crossfade — zero libraries needed.
 *
 * Key design decisions:
 *   - object-position: center 20% → keeps faces/upper-body visible
 *   - Dark overlay ALWAYS applied (not theme-dependent) so white text is
 *     readable over any backdrop in both dark AND light themes
 *   - Bottom gradient uses var(--bg-primary) to blend into page
 *   - Dot indicators use var(--text-muted) for inactive state
 */
const INTERVAL_MS = 5000;

const Hero = ({ movies = [] }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const count = movies.length;

  // Auto-rotate
  useEffect(() => {
    if (count <= 1) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % count);
    }, INTERVAL_MS);
    return () => clearInterval(timer);
  }, [count]);

  const goTo = useCallback((i) => setActiveIndex(i), []);

  if (count === 0) return <div className="h-[80vh]" />;

  const active = movies[activeIndex];

  return (
    <div className="relative w-full h-[85vh] overflow-hidden">
      {/* Stacked backdrop images — crossfade via opacity */}
      {movies.map((movie, i) => (
        <img
          key={movie.id}
          src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
          alt={movie.title}
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            objectPosition: "center 20%",
            opacity: i === activeIndex ? 1 : 0,
            transition: "opacity 1.2s ease-in-out",
          }}
          loading={i === 0 ? "eager" : "lazy"}
        />
      ))}

      {/*
        Dark cinematic overlay — ALWAYS dark regardless of theme.
        Two layers: left-side for text readability + overall vignette for depth.
      */}
      {/* Layer 1: Left-side darkness for text area */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(to right, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 40%, rgba(0,0,0,0.05) 70%, transparent 100%)",
        }}
      />
      {/* Layer 2: Overall bottom vignette for depth */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.2) 30%, transparent 60%)",
        }}
      />

      {/* Bottom gradient — seamless feather into --bg-primary */}
      <div
        className="absolute inset-x-0 bottom-0 h-[20%] pointer-events-none"
        style={{
          background:
            "linear-gradient(to top, var(--bg-primary) 0%, var(--bg-primary) 20%, transparent 100%)",
        }}
      />

      {/* Top vignette — covers the navbar border-radius gap cleanly */}
      <div
        className="absolute inset-x-0 top-0 h-20 pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 100%)",
        }}
      />

      {/* Content — vertically centered in the lower portion */}
      <div className="absolute inset-0 flex flex-col justify-end section-container pb-12">
        <div className="max-w-2xl animate-in delay-100" key={active.id}>
          {/* Badge */}
          <div
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[10px] font-bold mb-4 uppercase tracking-widest"
            style={{
              background: "rgba(0, 0, 0, 0.4)",
              backdropFilter: "blur(8px)",
              color: "#fff",
              border: "1px solid rgba(255, 255, 255, 0.12)",
            }}
          >
            🔥 Trending Now
          </div>

          {/* Title — always white, heavy text shadow for any background */}
          <h1
            className="text-4xl md:text-6xl font-black tracking-tighter leading-tight mb-3"
            style={{
              color: "#fff",
              textShadow: "0 2px 20px rgba(0,0,0,0.7), 0 4px 40px rgba(0,0,0,0.4)",
            }}
          >
            {active.title}
          </h1>

          {/* Meta line */}
          <p
            className="text-sm mb-5 font-medium flex items-center gap-3"
            style={{
              color: "rgba(255,255,255,0.8)",
              textShadow: "0 1px 8px rgba(0,0,0,0.5)",
            }}
          >
            <span>⭐ {active.vote_average?.toFixed(1)}</span>
            <span>•</span>
            <span>{active.release_date?.split("-")[0]}</span>
          </p>

          {/* Overview */}
          <p
            className="text-sm md:text-base mb-8 line-clamp-2 font-normal"
            style={{
              color: "rgba(255,255,255,0.85)",
              textShadow: "0 1px 6px rgba(0,0,0,0.4)",
            }}
          >
            {active.overview}
          </p>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button
              className="btn-fill-primary relative overflow-hidden flex items-center gap-2 px-8 py-3 rounded-full text-sm font-bold text-white cursor-pointer border-0"
              style={{ background: "var(--accent)" }}
            >
              <RiPlayFill size={18} className="relative z-10" />
              <span className="relative z-10">Play Now</span>
            </button>

            <button
              className="flex items-center justify-center w-11 h-11 rounded-full cursor-pointer"
              style={{
                background: "rgba(255,255,255,0.12)",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(255,255,255,0.2)",
              }}
              aria-label="Add to list"
            >
              <RiAddLine size={20} style={{ color: "#fff" }} />
            </button>

            <button
              className="flex items-center justify-center w-11 h-11 rounded-full cursor-pointer"
              style={{
                background: "rgba(255,255,255,0.12)",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(255,255,255,0.2)",
              }}
              aria-label="More Info"
            >
              <RiInformationLine size={20} style={{ color: "#fff" }} />
            </button>
          </div>
        </div>

        {/* Dot indicators — theme-aware inactive color */}
        {count > 1 && (
          <div className="flex items-center gap-2 mt-6">
            {movies.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className="rounded-full cursor-pointer border-0"
                style={{
                  width: i === activeIndex ? 24 : 8,
                  height: 8,
                  background:
                    i === activeIndex
                      ? "var(--accent)"
                      : "var(--text-muted)",
                  transition: "all 0.4s ease",
                }}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Hero;
