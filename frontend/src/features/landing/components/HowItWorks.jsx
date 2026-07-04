import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RiSearchLine, RiFingerprintLine, RiFilmLine, RiSparklingFill } from "@remixicon/react";

const IMG_BASE = "https://image.tmdb.org/t/p/w342";

const PROMPTS = ["something intense and dark…", "a feel-good rainy day movie…"];

const TASTE_TAGS = [
  { label: "Thriller", pct: 94 },
  { label: "Character-driven drama", pct: 81 },
  { label: "Korean cinema", pct: 76 },
  { label: "90s classics", pct: 68 },
];

const steps = [
  {
    icon: RiSearchLine,
    title: "Tell us your mood",
    description: "Don't search by title. Just describe what you're feeling — no menus, no filters.",
    color: "#a855f7",
  },
  {
    icon: RiFingerprintLine,
    title: "We analyze your Taste DNA",
    description: "Your request gets cross-referenced against your watching habits, genres, and language preferences.",
    color: "#3b82f6",
  },
  {
    icon: RiFilmLine,
    title: "Get your perfect watch",
    description: "A personalized, deduplicated list featuring community favorites and hidden gems - just for you.",
    color: "#10b981",
  },
];

const PHASE_DURATIONS = [2600, 2200, 2800];

/** Typing reveal via clip-path - looks identical regardless of string length */
const TypedLine = ({ text, animKey }) => (
  <span className="relative inline-block align-bottom">
    <motion.span
      key={animKey}
      initial={{ clipPath: "inset(0 100% 0 0)" }}
      animate={{ clipPath: "inset(0 0% 0 0)" }}
      transition={{ duration: 1.2, ease: "easeInOut" }}
      className="inline-block whitespace-nowrap"
    >
      {text}
    </motion.span>
    <motion.span
      animate={{ opacity: [1, 1, 0, 0] }}
      transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
      className="ml-0.5 inline-block"
      style={{ color: "var(--accent)" }}
    >
      |
    </motion.span>
  </span>
);

/** The animated "app" mockup: typing a mood → Taste DNA analysis → real poster results */
const DemoPanel = ({ phase, promptIdx, movies }) => {
  const resultPosters = movies.filter((m) => m.poster_path).slice(6, 10);

  return (
    <div
      className="rounded-2xl overflow-hidden border"
      style={{ background: "var(--bg-primary)", borderColor: "var(--border)", boxShadow: "0 30px 70px -20px rgba(0,0,0,0.5)" }}
    >
      {/* Window chrome */}
      <div className="h-11 border-b flex items-center px-4 gap-2" style={{ borderColor: "var(--border)", background: "rgba(255,255,255,0.02)" }}>
        <div className="w-3 h-3 rounded-full bg-red-500/50" />
        <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
        <div className="w-3 h-3 rounded-full bg-green-500/50" />
      </div>

      {/* Mood input bar - always visible, text changes per prompt */}
      <div className="px-6 pt-6">
        <div
          className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm"
          style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}
        >
          <RiSparklingFill size={15} style={{ color: "var(--accent)" }} />
          <TypedLine text={PROMPTS[promptIdx]} animKey={promptIdx} />
        </div>
      </div>

      {/* Phase content - fixed height so switching phases never shifts layout below */}
      <div className="px-6 py-8 h-55 flex items-center">
        <AnimatePresence mode="wait">
          {phase === 0 && (
            <motion.p
              key="p0"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4 }}
              className="text-sm"
              style={{ color: "var(--text-muted)" }}
            >
              Waiting for your vibe...
            </motion.p>
          )}

          {phase === 1 && (
            <motion.div
              key="p1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full flex flex-wrap gap-2.5"
            >
              {TASTE_TAGS.map((tag, i) => (
                <motion.div
                  key={tag.label}
                  initial={{ opacity: 0, scale: 0.85, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: i * 0.15, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
                  style={{ background: "var(--accent-light)", color: "var(--accent)", border: "1px solid rgba(124,58,237,0.25)" }}
                >
                  {tag.label}
                  <span className="opacity-60">{tag.pct}%</span>
                </motion.div>
              ))}
            </motion.div>
          )}

          {phase === 2 && (
            <motion.div
              key="p2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full h-full grid grid-cols-4 gap-3"
            >
              {resultPosters.map((movie, i) => (
                <motion.div
                  key={movie.id}
                  initial={{ opacity: 0, y: 16, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: i * 0.12, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  className="h-full rounded-lg overflow-hidden border"
                  style={{ borderColor: "var(--border)" }}
                >
                  <img
                    src={`${IMG_BASE}${movie.poster_path}`}
                    alt={movie.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const HowItWorks = ({ movies = [] }) => {
  const [phase, setPhase] = useState(0);
  const [promptIdx, setPromptIdx] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => {
      setPhase((p) => {
        const next = (p + 1) % 3;
        if (next === 0) setPromptIdx((i) => (i + 1) % PROMPTS.length);
        return next;
      });
    }, PHASE_DURATIONS[phase]);
    return () => clearTimeout(t);
  }, [phase]);

  return (
    <section className="py-24 relative" id="how-it-works">
      <div className="max-w-6xl mx-auto px-6">

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">How Kineo Works</h2>
          <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
            Stop scrolling endlessly. Watch how one line about your mood turns into your next favorite movie.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="grid lg:grid-cols-[0.85fr_1.15fr] gap-12 lg:gap-16 items-center"
        >
          {/* Stepper */}
          <div className="space-y-3">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              const active = phase === idx;
              return (
                <div
                  key={idx}
                  className="flex items-start gap-4 rounded-2xl p-4 transition-colors duration-500"
                  style={{
                    background: active ? "var(--bg-secondary)" : "transparent",
                    border: `1px solid ${active ? "var(--border-hover)" : "transparent"}`,
                  }}
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-500"
                    style={{
                      background: active ? `linear-gradient(135deg, ${step.color}33, ${step.color}55)` : "var(--bg-hover)",
                      color: active ? step.color : "var(--text-muted)",
                      border: `1px solid ${active ? step.color + "55" : "var(--border)"}`,
                    }}
                  >
                    <Icon size={20} />
                  </div>
                  <div>
                    <h3
                      className="text-base font-bold mb-1 transition-colors duration-500"
                      style={{ color: active ? "var(--text-primary)" : "var(--text-muted)" }}
                    >
                      {idx + 1}. {step.title}
                    </h3>
                    <p
                      className="text-sm leading-relaxed transition-colors duration-500"
                      style={{ color: active ? "var(--text-secondary)" : "var(--text-muted)" }}
                    >
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Live demo panel */}
          <DemoPanel phase={phase} promptIdx={promptIdx} movies={movies} />
        </motion.div>

      </div>
    </section>
  );
};

export default HowItWorks;
