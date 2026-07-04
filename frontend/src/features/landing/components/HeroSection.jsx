import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { RiSparklingLine, RiPlayFill, RiArrowRightLine, RiArrowDownLine } from "@remixicon/react";

const IMG_BASE = "https://image.tmdb.org/t/p/w342";

// Decorative poster positions around the headline (desktop only)
const POSTER_SLOTS = [
  { top: "12%", left: "6%", size: "w-24", tilt: "-8deg", depth: 30, delay: 0 },
  { top: "58%", left: "11%", size: "w-20", tilt: "6deg", depth: 55, delay: 0.4 },
  { top: "16%", right: "7%", size: "w-24", tilt: "9deg", depth: 30, delay: 0.15 },
  { top: "60%", right: "12%", size: "w-20", tilt: "-7deg", depth: 55, delay: 0.55 },
  { top: "78%", left: "23%", size: "w-16", tilt: "4deg", depth: 75, delay: 0.7 },
  { top: "80%", right: "26%", size: "w-16", tilt: "-5deg", depth: 75, delay: 0.85 },
];

const headline = ["Find", "your", "next"];

// Extracted so useTransform is always called a fixed number of times (one per slot),
// regardless of how many real posters have loaded yet.
const FloatingPoster = ({ slot, movie, sx, sy }) => {
  const depthX = useTransform(sx, (v) => v * slot.depth);
  const depthY = useTransform(sy, (v) => v * slot.depth);

  if (!movie) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.4 + slot.delay, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      style={{ position: "absolute", top: slot.top, left: slot.left, right: slot.right, x: depthX, y: depthY }}
    >
      <div
        className={`float-card ${slot.size} rounded-xl overflow-hidden`}
        style={{ "--tilt": slot.tilt, boxShadow: "0 20px 40px rgba(0,0,0,0.45)", animationDelay: `${slot.delay}s` }}
      >
        <img
          src={`${IMG_BASE}${movie.poster_path}`}
          alt=""
          className="w-full aspect-[2/3] object-cover opacity-80"
          loading="lazy"
        />
      </div>
    </motion.div>
  );
};

const wordVariants = {
  hidden: { opacity: 0, y: 24, filter: "blur(8px)" },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { delay: 0.15 + i * 0.09, duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  }),
};

const HeroSection = ({ posters = [] }) => {
  const sectionRef = useRef(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 60, damping: 20, mass: 0.6 });
  const sy = useSpring(my, { stiffness: 60, damping: 20, mass: 0.6 });

  const handleMouseMove = (e) => {
    const rect = sectionRef.current?.getBoundingClientRect();
    if (!rect) return;
    mx.set((e.clientX - rect.left) / rect.width - 0.5);
    my.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const decorativePosters = posters.filter((m) => m.poster_path).slice(0, POSTER_SLOTS.length);

  return (
    <section
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      className="relative flex flex-col items-center justify-center text-center py-24 min-h-screen overflow-hidden"
    >
      {/* ── Aurora background blobs ─────────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="aurora-blob absolute rounded-full"
          style={{
            width: 620, height: 620, top: "-12%", left: "-8%",
            background: "radial-gradient(circle, rgba(124,58,237,0.32) 0%, transparent 70%)",
            filter: "blur(20px)",
          }}
        />
        <div
          className="aurora-blob absolute rounded-full"
          style={{
            width: 560, height: 560, top: "5%", right: "-10%",
            background: "radial-gradient(circle, rgba(192,132,252,0.24) 0%, transparent 70%)",
            filter: "blur(20px)", animationDelay: "-6s",
          }}
        />
        <div
          className="aurora-blob absolute rounded-full"
          style={{
            width: 480, height: 480, bottom: "-15%", left: "30%",
            background: "radial-gradient(circle, rgba(59,130,246,0.18) 0%, transparent 70%)",
            filter: "blur(20px)", animationDelay: "-11s",
          }}
        />
        <div className="absolute inset-0 grain-overlay" />
      </div>

      {/* ── Floating real movie posters (desktop only) ──────────────── */}
      <div className="hidden lg:block absolute inset-0 pointer-events-none">
        {POSTER_SLOTS.map((slot, idx) => (
          <FloatingPoster
            key={idx}
            slot={slot}
            movie={decorativePosters[idx]}
            sx={sx}
            sy={sy}
          />
        ))}
      </div>

      {/* ── Badge ────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="inline-flex items-center gap-2 px-5 py-2 rounded-md text-xs font-medium mb-10 relative z-10"
        style={{
          background: "var(--accent-light)",
          color: "var(--accent)",
          border: "1px solid rgba(124,58,237,0.25)",
        }}
      >
        AI-Powered Discovery
      </motion.div>

      {/* ── Headline ─────────────────────────────────────────────────── */}
      <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-tight mb-7 relative z-10">
        {headline.map((word, i) => (
          <motion.span
            key={word}
            custom={i}
            initial="hidden"
            animate="visible"
            variants={wordVariants}
            className="inline-block mr-[0.28em]"
          >
            {word}
          </motion.span>
        ))}
        <br className="hidden sm:block" />
        <motion.span
          custom={headline.length}
          initial="hidden"
          animate="visible"
          variants={wordVariants}
          className="inline-block relative"
          style={{
            background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #c084fc 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            backgroundSize: "200% auto",
          }}
        >
          perfect watch
        </motion.span>
      </h1>

      {/* ── Subtext ──────────────────────────────────────────────────── */}
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="text-base sm:text-lg md:text-xl max-w-2xl leading-relaxed mb-14 relative z-10 mx-auto"
        style={{ color: "var(--text-secondary)" }}
      >
        Describe how you're feeling and our AI will find movies that match
        your exact vibe - personalized to your Taste DNA.
      </motion.p>

      {/* ── CTA Buttons ──────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-center gap-5 flex-wrap justify-center relative z-10"
      >
        <Link to="/register">
          <motion.button
            whileHover={{ y: -4, scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className="btn-shimmer relative overflow-hidden flex items-center gap-2.5 px-9 py-4 rounded-full text-sm font-bold cursor-pointer border-0 text-white shadow-xl hover:shadow-2xl"
            style={{
              background: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)",
              boxShadow: "0 10px 25px -5px rgba(124, 58, 237, 0.4)",
            }}
          >
            <RiPlayFill size={18} className="relative z-10" />
            <span className="relative z-10">Start Discovering</span>
          </motion.button>
        </Link>

        <Link to="/login">
          <motion.button
            whileHover={{ y: -4, scale: 1.02, background: "rgba(255,255,255,0.05)" }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className="relative overflow-hidden flex items-center gap-2.5 px-9 py-4 rounded-full text-sm font-bold cursor-pointer"
            style={{
              background: "transparent",
              color: "var(--text-primary)",
              border: "1px solid var(--border-hover)",
            }}
          >
            <span className="relative z-10">Sign In</span>
            <RiArrowRightLine size={18} className="relative z-10" />
          </motion.button>
        </Link>
      </motion.div>

      {/* ── Scroll cue ───────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
        style={{ color: "var(--text-muted)" }}
      >
        <span className="text-[10px] uppercase tracking-widest font-medium">Scroll</span>
        <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}>
          <RiArrowDownLine size={16} />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
