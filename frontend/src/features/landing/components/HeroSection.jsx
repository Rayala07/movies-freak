import { Link } from "react-router-dom";
import { RiSparklingLine, RiPlayFill, RiArrowRightLine } from "@remixicon/react";

const HeroSection = () => {
  return (
    <section className="relative flex flex-col items-center justify-center text-center py-20 lg:py-32 min-h-[85vh]">
      
      {/* Background visual - radial gradient specific to hero */}
      <div
        className="absolute inset-0 pointer-events-none opacity-60"
        style={{
          background: "radial-gradient(circle 800px at 50% 30%, rgba(124, 58, 237, 0.15) 0%, transparent 100%)",
        }}
      />

      {/* Badge */}
      <div
        className="animate-in delay-100 inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-medium mb-10 relative z-10"
        style={{
          background: "var(--accent-light)",
          color: "var(--accent)",
          border: "1px solid rgba(124,58,237,0.25)",
          animation: "fadeSlideUp 0.8s ease-out forwards",
        }}
      >
        <RiSparklingLine size={13} />
        AI-Powered Discovery
      </div>

      {/* Headline */}
      <h1 
        className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-tight mb-7 relative z-10"
        style={{ animation: "fadeSlideUp 0.8s ease-out 0.1s forwards", opacity: 0 }}
      >
        Find your next <br className="hidden sm:block" />
        <span
          style={{
            background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #c084fc 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          perfect watch
        </span>
      </h1>

      {/* Subtext */}
      <p
        className="text-base sm:text-lg md:text-xl max-w-2xl leading-relaxed mb-14 relative z-10 mx-auto"
        style={{ color: "var(--text-secondary)", animation: "fadeSlideUp 0.8s ease-out 0.2s forwards", opacity: 0 }}
      >
        Describe how you're feeling and our AI will find movies that match
        your exact vibe - personalized to your Taste DNA.
      </p>

      {/* CTA Buttons */}
      <div 
        className="flex items-center gap-5 flex-wrap justify-center relative z-10"
        style={{ animation: "fadeSlideUp 0.8s ease-out 0.3s forwards", opacity: 0 }}
      >
        <Link to="/register">
          <button
            className="relative overflow-hidden flex items-center gap-2.5 px-9 py-4 rounded-full text-sm font-bold cursor-pointer border-0 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
            style={{ 
              background: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)",
              boxShadow: "0 10px 25px -5px rgba(124, 58, 237, 0.4)"
            }}
          >
            <RiPlayFill size={18} className="relative z-10" />
            <span className="relative z-10">Start Discovering</span>
          </button>
        </Link>

        <Link to="/login">
          <button
            className="relative overflow-hidden flex items-center gap-2.5 px-9 py-4 rounded-full text-sm font-bold cursor-pointer transition-all duration-300 hover:bg-[rgba(255,255,255,0.05)] hover:-translate-y-1"
            style={{
              background: "transparent",
              color: "var(--text-primary)",
              border: "1px solid var(--border-hover)",
            }}
          >
            <span className="relative z-10">Sign In</span>
            <RiArrowRightLine size={18} className="relative z-10" />
          </button>
        </Link>
      </div>

    </section>
  );
};

export default HeroSection;
