import { Link } from "react-router-dom";
import {
  RiFilmLine,
  RiSunLine,
  RiMoonLine,
  RiSparklingLine,
  RiPlayFill,
  RiArrowRightLine,
} from "@remixicon/react";
import useTheme from "../../../shared/hooks/useTheme";

const LandingPage = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    /* Outermost shell — full screen, no padding, holds the glow */
    <div
      className="relative min-h-screen overflow-hidden"
      style={{ background: "var(--bg-primary)", color: "var(--text-primary)" }}
    >
      {/* Radial violet glow — decorative only */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 55% at 50% -5%, rgba(93, 0, 255, 0.37) 0%, transparent 70%)",
        }}
      />

      {/* ── Centered max-width container ── all content lives here */}
      <div className="relative z-10 max-w-8xl mx-auto px-6 lg:px-12 flex flex-col min-h-screen">

        {/* ── Header ─────────────────────────────────────────────── */}
        <header className="animate-in flex items-center justify-between py-6">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <RiFilmLine size={20} style={{ color: "var(--accent)" }} />
            <span className="text-base font-semibold tracking-tight">
              MoviesFreak
            </span>
          </div>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="group flex items-center justify-center w-8 h-8 rounded-full cursor-pointer transition-all duration-200 active:scale-95"
            style={{
              background: "var(--bg-hover)",
              border: "1px solid var(--border)",
              color: "var(--text-secondary)",
            }}
            aria-label="Toggle theme"
          >
            <div className="transition-transform duration-300 group-hover:rotate-12 group-active:rotate-45">
              {theme === "dark" ? <RiSunLine size={14} /> : <RiMoonLine size={14} />}
            </div>
          </button>
        </header>

        {/* ── Hero Content ─────────────────────────────────────────── */}
        <main className="flex-1 flex flex-col items-center justify-center text-center py-10">

          {/* Badge */}
          <div
            className="animate-in delay-100 inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-medium mb-10"
            style={{
              background: "var(--accent-light)",
              color: "var(--accent)",
              border: "1px solid rgba(124,58,237,0.25)",
            }}
          >
            <RiSparklingLine size={13} />
            Discover · Watch · Enjoy
          </div>

          {/* Headline */}
          <h1 className="animate-in delay-200 text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-tight mb-7">
            Your world of
            <br />
            <span
              style={{
                background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #c084fc 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              movies & shows
            </span>
          </h1>

          {/* Subtext */}
          <p
            className="animate-in delay-300 text-base sm:text-lg max-w-md leading-relaxed mb-20"
            style={{ color: "var(--text-secondary)" }}
          >
            Explore trending movies, discover TV shows, watch trailers, and build
            your personal collection. All in one place.
          </p>

          {/* CTA Buttons */}
          <div className="animate-in delay-400 flex items-center gap-4 flex-wrap justify-center mb-16">
            {/* Primary — Get Started */}
            <Link to="/register">
              <button
                className="btn-fill-primary relative overflow-hidden flex items-center gap-2.5 px-8 py-3.5 rounded-full text-sm font-semibold cursor-pointer border-0 text-white"
                style={{ background: "var(--accent)" }}
              >
                <RiPlayFill size={14} className="relative z-10" />
                <span className="relative z-10">Get Started</span>
              </button>
            </Link>

            {/* Secondary — Sign In */}
            <Link to="/login">
              <button
                className="btn-fill-secondary relative overflow-hidden flex items-center gap-2.5 px-8 py-3.5 rounded-full text-sm font-semibold cursor-pointer"
                style={{
                  background: "transparent",
                  color: "var(--text-primary)",
                  border: "1px solid var(--border-hover)",
                }}
              >
                <span className="relative z-10">Sign In</span>
                <RiArrowRightLine size={14} className="relative z-10" />
              </button>
            </Link>
          </div>


          {/* Feature chips */}
          <div
            className="animate-in delay-500 flex items-center gap-8 flex-wrap justify-center"
            style={{ color: "var(--text-muted)" }}
          >
            {["Trending Movies", "Real-time Search", "Watch Trailers", "Personal Favorites"].map((f) => (
              <span key={f} className="flex items-center gap-2 text-xs font-medium">
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "var(--accent)" }} />
                {f}
              </span>
            ))}
          </div>
        </main>

        {/* ── Footer ───────────────────────────────────────────────── */}
        <footer
          className="animate-in delay-500 text-center pb-2 text-xs"
          style={{ color: "var(--text-muted)" }}
        >
          Powered by TMDB
        </footer>

      </div>{/* end max-w container */}
    </div>
  );
};

export default LandingPage;
