import { motion } from "framer-motion";
import { RiCheckLine, RiStarFill } from "@remixicon/react";

const IMG_BASE = "https://image.tmdb.org/t/p/w342";

const achievements = [
  "Never waste 30 minutes scrolling Netflix menus again.",
  "Discover critically acclaimed Hidden Gems you would have never found on your own.",
  "Get recommendations that actually understand your language and era preferences.",
  "Build a personal cinematic library of your all-time favorites."
];

const listVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.14, delayChildren: 0.2 } },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};

/** Tilted stack of real posters standing in for a "your library" visual */
const PosterStack = ({ movies }) => {
  const shown = movies.slice(0, 3);
  const offsets = [
    { rotate: -8, x: -70, z: 0, scale: 0.92 },
    { rotate: 0, x: 0, z: 2, scale: 1 },
    { rotate: 8, x: 70, z: 1, scale: 0.92 },
  ];

  return (
    <div className="relative w-full aspect-square max-w-md mx-auto flex items-center justify-center">
      <div className="absolute inset-0 bg-gradient-to-tr from-[var(--accent)] to-fuchsia-500 rounded-full blur-[80px] opacity-20 animate-pulse" />

      {shown.length === 3 ? (
        shown.map((movie, idx) => {
          const o = offsets[idx];
          return (
            <motion.div
              key={movie.id}
              initial={{ opacity: 0, y: 40, rotate: 0, x: o.x, scale: o.scale }}
              whileInView={{ opacity: 1, y: 0, rotate: o.rotate, x: o.x, scale: o.scale }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.8, delay: 0.15 + idx * 0.12, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -12, rotate: 0, scale: 1.04, zIndex: 10 }}
              className="absolute w-40 sm:w-48 rounded-2xl overflow-hidden border border-[var(--border)]"
              style={{
                zIndex: o.z,
                boxShadow: "0 30px 60px -12px rgba(0,0,0,0.5)",
              }}
            >
              <img
                src={`${IMG_BASE}${movie.poster_path}`}
                alt={movie.title}
                className="w-full aspect-[2/3] object-cover"
                loading="lazy"
              />
              <div className="absolute inset-x-0 bottom-0 p-3" style={{ background: "var(--gradient-card)" }}>
                <p className="text-xs font-semibold text-white line-clamp-1">{movie.title}</p>
                {movie.vote_average ? (
                  <p className="text-[10px] mt-0.5 flex items-center gap-1 text-white/70">
                    <RiStarFill size={9} className="text-yellow-400" />
                    {movie.vote_average.toFixed(1)}
                  </p>
                ) : null}
              </div>
            </motion.div>
          );
        })
      ) : (
        // Fallback skeleton while posters are loading / unavailable
        <div className="absolute inset-4 bg-[var(--bg-primary)] border border-[var(--border)] rounded-3xl shadow-2xl overflow-hidden flex flex-col">
          <div className="h-12 border-b border-[var(--border)] bg-[rgba(255,255,255,0.02)] flex items-center px-4 gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/50" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
            <div className="w-3 h-3 rounded-full bg-green-500/50" />
          </div>
          <div className="flex-1 p-8 flex flex-col justify-center gap-4">
            <div className="h-4 w-3/4 bg-[var(--border-hover)] rounded-full animate-pulse" />
            <div className="h-4 w-full bg-[var(--border)] rounded-full animate-pulse delay-75" />
            <div className="h-4 w-5/6 bg-[var(--border)] rounded-full animate-pulse delay-150" />
          </div>
        </div>
      )}
    </div>
  );
};

const Achievements = ({ movies = [] }) => {
  return (
    <section className="py-24 bg-[var(--bg-secondary)] border-y border-[var(--border)] overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center gap-16">

        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="flex-1"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">
            Stop searching.<br/>
            <span className="text-[var(--accent)]">Start watching.</span>
          </h2>
          <p className="text-lg text-[var(--text-secondary)] mb-8 max-w-md leading-relaxed">
            Kineo is designed to solve the modern paradox of choice. Here is what you achieve when you let AI curate your cinema experience.
          </p>

          <motion.ul
            variants={listVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="space-y-5"
          >
            {achievements.map((item, idx) => (
              <motion.li key={idx} variants={itemVariants} className="flex items-start gap-4">
                <div className="mt-1 bg-[rgba(16,185,129,0.15)] text-emerald-500 rounded-full p-1 flex-shrink-0">
                  <RiCheckLine size={16} />
                </div>
                <span className="text-[var(--text-primary)] font-medium leading-relaxed">{item}</span>
              </motion.li>
            ))}
          </motion.ul>
        </motion.div>

        <div className="flex-1">
          <PosterStack movies={movies} />
        </div>

      </div>
    </section>
  );
};

export default Achievements;
