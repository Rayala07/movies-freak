import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Sun, Moon, Film, Sparkles, Play } from "lucide-react";
import useTheme from "../../../shared/hooks/useTheme";

/**
 * LandingPage — "/"
 * ------------------
 * The first page unauthenticated users see.
 * Full-viewport hero with:
 *   - MoviesFreak branding
 *   - Cinematic tagline
 *   - Register & Login CTA buttons
 *   - Dark / Light theme toggle
 *   - Subtle Framer Motion entrance animations
 */
const LandingPage = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div
      className="relative min-h-screen flex flex-col overflow-hidden"
      style={{ background: "var(--bg-primary)", color: "var(--text-primary)" }}
    >
      {/* ── Background decorative elements ─────────────────────────── */}
      {/* Radial glow — accent color, top-center */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(124,58,237,0.18) 0%, transparent 70%)",
        }}
      />
      {/* Bottom vignette */}
      <div
        className="absolute bottom-0 left-0 right-0 h-64 pointer-events-none"
        style={{
          background:
            "linear-gradient(to top, var(--bg-primary) 0%, transparent 100%)",
        }}
      />

      {/* ── Navbar strip ───────────────────────────────────────────── */}
      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative z-10 flex items-center justify-between px-8 py-6"
      >
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Film
            size={22}
            style={{ color: "var(--accent)" }}
          />
          <span
            className="text-lg font-semibold tracking-tight"
            style={{ color: "var(--text-primary)" }}
          >
            MoviesFreak
          </span>
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200"
          style={{
            background: "var(--bg-card)",
            color: "var(--text-secondary)",
            border: "1px solid var(--border)",
          }}
          aria-label="Toggle theme"
        >
          {theme === "dark" ? (
            <>
              <Sun size={14} />
              <span>Light</span>
            </>
          ) : (
            <>
              <Moon size={14} />
              <span>Dark</span>
            </>
          )}
        </button>
      </motion.header>

      {/* ── Hero content ───────────────────────────────────────────── */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 py-16">

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium mb-8"
          style={{
            background: "var(--accent-light)",
            color: "var(--accent)",
            border: "1px solid rgba(124,58,237,0.25)",
          }}
        >
          <Sparkles size={12} />
          Discover · Watch · Enjoy
        </motion.div>

        {/* Main heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
          className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-none mb-6"
          style={{ color: "var(--text-primary)" }}
        >
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
        </motion.h1>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
          className="text-base sm:text-lg max-w-lg mx-auto mb-10 leading-relaxed"
          style={{ color: "var(--text-secondary)" }}
        >
          Explore trending movies, discover TV shows, watch trailers, and build
          your personal collection — all in one place.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4, ease: "easeOut" }}
          className="flex items-center gap-4 flex-wrap justify-center"
        >
          {/* Primary — Register */}
          <Link to="/register">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 px-7 py-3 rounded-full text-sm font-semibold transition-colors duration-200"
              style={{
                background: "var(--accent)",
                color: "#ffffff",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "var(--accent-hover)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "var(--accent)")
              }
            >
              <Play size={14} fill="white" />
              Get Started
            </motion.button>
          </Link>

          {/* Secondary — Login */}
          <Link to="/login">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="px-7 py-3 rounded-full text-sm font-semibold transition-all duration-200"
              style={{
                background: "transparent",
                color: "var(--text-primary)",
                border: "1px solid var(--border-hover)",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.borderColor = "var(--accent)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.borderColor = "var(--border-hover)")
              }
            >
              Sign In
            </motion.button>
          </Link>
        </motion.div>

        {/* Social proof / feature chips */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="flex items-center gap-6 mt-16 flex-wrap justify-center"
          style={{ color: "var(--text-muted)" }}
        >
          {["Trending Movies", "Real-time Search", "Watch Trailers", "Personal Favorites"].map(
            (feature) => (
              <span
                key={feature}
                className="flex items-center gap-1.5 text-xs font-medium"
              >
                <span
                  className="w-1 h-1 rounded-full"
                  style={{ background: "var(--accent)" }}
                />
                {feature}
              </span>
            )
          )}
        </motion.div>
      </main>

      {/* ── Footer strip ───────────────────────────────────────────── */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.7 }}
        className="relative z-10 text-center pb-8 text-xs"
        style={{ color: "var(--text-muted)" }}
      >
        Powered by TMDB · Built with React & Node.js
      </motion.footer>
    </div>
  );
};

export default LandingPage;
