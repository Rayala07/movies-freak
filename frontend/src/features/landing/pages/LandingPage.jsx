import { motion, useScroll, useSpring } from "framer-motion";
import useTheme from "../../../shared/hooks/useTheme";
import { RiSunLine, RiMoonLine } from "@remixicon/react";
import { useLandingMovies } from "../hooks/useLandingMovies";

// Components
import HeroSection from "../components/HeroSection";
import PosterMarquee from "../components/PosterMarquee";
import HowItWorks from "../components/HowItWorks";
import Achievements from "../components/Achievements";
import Features from "../components/Features";
import QuotesSection from "../components/QuotesSection";
import FinalCTA from "../components/FinalCTA";
import Footer from "../components/Footer";

const LandingPage = () => {
  const { theme, toggleTheme } = useTheme();
  const movies = useLandingMovies();

  const { scrollYProgress } = useScroll();
  const progressBar = useSpring(scrollYProgress, { stiffness: 200, damping: 30, restDelta: 0.001 });

  return (
    <div
      className="relative overflow-x-hidden min-h-screen"
      style={{ background: "var(--bg-primary)", color: "var(--text-primary)" }}
    >
      {/* ── Scroll progress bar ─────────────────────────────────────── */}
      <motion.div
        className="scroll-progress-bar fixed top-0 left-0 right-0 h-0.5 z-60"
        style={{ scaleX: progressBar, background: "linear-gradient(90deg, #7c3aed, #c084fc)" }}
      />

      {/* ── Header - sits over the hero only, scrolls away with the page ── */}
      <header className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between py-4 px-6 lg:px-12 max-w-7xl mx-auto">
        {/* Logo */}
        <div className="flex items-center">
          <img
            src="/kineo_logo.png"
            alt="Kineo"
            className="h-20 w-auto object-contain"
          />
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="group flex items-center justify-center w-9 h-9 rounded-full cursor-pointer transition-all duration-300 active:scale-95 hover:shadow-lg"
          style={{
            background: "var(--bg-secondary)",
            border: "1px solid var(--border)",
            color: "var(--text-secondary)",
          }}
          aria-label="Toggle theme"
        >
          <div className="transition-transform duration-300 group-hover:rotate-12 group-active:rotate-45">
            {theme === "dark" ? <RiSunLine size={16} /> : <RiMoonLine size={16} />}
          </div>
        </button>
      </header>

      {/* ── Page Content ─────────────────────────────────────────────── */}
      <main>
        <HeroSection posters={movies} />
        <PosterMarquee movies={movies} />
        <HowItWorks movies={movies} />
        <Achievements movies={movies} />
        <Features />
        <QuotesSection />
        <FinalCTA />
      </main>

      <Footer />
    </div>
  );
};

export default LandingPage;
