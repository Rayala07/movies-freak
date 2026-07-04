import useTheme from "../../../shared/hooks/useTheme";
import { RiSunLine, RiMoonLine } from "@remixicon/react";

// Components
import HeroSection from "../components/HeroSection";
import HowItWorks from "../components/HowItWorks";
import Achievements from "../components/Achievements";
import Features from "../components/Features";
import QuotesSection from "../components/QuotesSection";
import Footer from "../components/Footer";

const LandingPage = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div
      className="relative overflow-x-hidden min-h-screen"
      style={{ background: "var(--bg-primary)", color: "var(--text-primary)" }}
    >
      {/* ── Fixed Header ─────────────────────────────────────────────── */}
      <header className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between py-6 px-6 lg:px-12 max-w-7xl mx-auto">
        {/* Logo */}
        <div className="flex items-center">
          <img 
            src="/kineo_logo.png" 
            alt="Kineo" 
            className="h-8 w-auto object-contain"
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
        <HeroSection />
        <HowItWorks />
        <Achievements />
        <Features />
        <QuotesSection />
      </main>

      <Footer />

      {/* ── Global Styles for Landing Page Animations ────────────────── */}
      <style>{`
        @keyframes fadeSlideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
