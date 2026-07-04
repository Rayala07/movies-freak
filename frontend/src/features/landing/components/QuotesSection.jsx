import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const quotes = [
  {
    text: "Cinema is a matter of what's in the frame and what's out.",
    author: "Martin Scorsese",
    role: "Director",
    color: "#a855f7",
  },
  {
    text: "Every great film should seem new every time you see it.",
    author: "Roger Ebert",
    role: "Film Critic",
    color: "#3b82f6",
  },
  {
    text: "I don't dream at night, I dream at day, I dream all day; I'm dreaming for a living.",
    author: "Steven Spielberg",
    role: "Director",
    color: "#10b981",
  },
  {
    text: "A film is – or should be – more like music than like fiction. It should be a progression of moods and feelings.",
    author: "Stanley Kubrick",
    role: "Director",
    color: "#f59e0b",
  },
];

const AUTO_ADVANCE_MS = 5500;

const QuotesSection = () => {
  const [index, setIndex] = useState(0);
  const active = quotes[index];

  useEffect(() => {
    const t = setTimeout(() => setIndex((i) => (i + 1) % quotes.length), AUTO_ADVANCE_MS);
    return () => clearTimeout(t);
  }, [index]);

  return (
    <section className="py-28 md:py-36 bg-[var(--bg-secondary)] border-y border-[var(--border)] relative overflow-hidden">
      <div className="max-w-3xl mx-auto px-6 relative z-10 text-center">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="w-10 h-px mx-auto mb-5" style={{ background: "var(--accent)" }} />
          <h2 className="text-3xl md:text-4xl font-bold mb-2">The Magic of Movies</h2>
          <p className="text-[var(--text-muted)]">Find the films that move you.</p>
        </motion.div>

        {/* Rotating quote - fixed-height stage so content never shifts the layout below */}
        <div className="mt-16 md:mt-20 h-40 sm:h-36 flex items-center justify-center px-2">
          <AnimatePresence mode="wait">
            <motion.p
              key={index}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="font-serif italic font-medium text-2xl sm:text-3xl md:text-4xl leading-snug tracking-tight max-w-2xl"
              style={{ color: "var(--text-primary)" }}
            >
              "{active.text}"
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Attribution */}
        <div className="mt-10 h-16 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
              className="flex flex-col items-center gap-2"
            >
              <span className="w-8 h-px" style={{ background: active.color }} />
              <p className="text-sm font-semibold uppercase tracking-widest" style={{ color: active.color }}>
                {active.author}
              </p>
              <p className="text-xs uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                {active.role}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Dot navigation */}
        <div className="flex items-center justify-center gap-2.5 mt-4">
          {quotes.map((q, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              aria-label={`Show quote ${i + 1}`}
              className="w-2 h-2 rounded-full cursor-pointer transition-all duration-300"
              style={{
                background: i === index ? q.color : "var(--border-hover)",
                transform: i === index ? "scale(1.3)" : "scale(1)",
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default QuotesSection;
