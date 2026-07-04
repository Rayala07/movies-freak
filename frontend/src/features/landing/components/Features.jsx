import { useState } from "react";
import { motion } from "framer-motion";
import { RiBrainLine, RiGroupLine, RiDatabase2Line, RiMagicLine } from "@remixicon/react";

const features = [
  {
    icon: RiBrainLine,
    title: "Gets to know your taste",
    description: "Every movie you favorite sharpens your profile across genres, languages, and eras - so recommendations get more you with every visit, not less.",
  },
  {
    icon: RiGroupLine,
    title: "Picks people actually love",
    description: "No generic 'most popular' filler. We surface the movies real communities on Letterboxd, IMDb, and Reddit are raving about right now.",
  },
  {
    icon: RiMagicLine,
    title: "Always something new to find",
    description: "Start with crowd-pleasing hits, then unlock deeper cuts as you explore - critically loved hidden gems you'd never have stumbled onto alone.",
  },
  {
    icon: RiDatabase2Line,
    title: "Never out of date",
    description: "Posters, ratings, cast, and where-to-watch info stay fresh and accurate, powered by the world's most extensive movie database.",
  }
];

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  }),
};

/** Card with a soft glow that follows the cursor - premium "spotlight" hover */
const FeatureCard = ({ feat, idx }) => {
  const Icon = feat.icon;
  const [pos, setPos] = useState({ x: 50, y: 50 });

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  return (
    <motion.div
      custom={idx}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={cardVariants}
      whileHover={{ y: -6 }}
      onMouseMove={handleMouseMove}
      className="group relative bg-[rgba(255,255,255,0.02)] border border-[var(--border)] rounded-2xl p-8 overflow-hidden transition-colors duration-300 hover:border-[var(--border-hover)]"
    >
      {/* Cursor-following spotlight */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `radial-gradient(320px circle at ${pos.x}% ${pos.y}%, rgba(124,58,237,0.12), transparent 70%)`,
        }}
      />

      <div className="relative z-10">
        <div className="w-12 h-12 rounded-xl bg-[var(--bg-hover)] border border-[var(--border)] flex items-center justify-center mb-5 text-[var(--accent)] transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
          <Icon size={24} />
        </div>
        <h3 className="text-xl font-bold mb-3">{feat.title}</h3>
        <p className="text-[var(--text-secondary)] leading-relaxed text-sm">
          {feat.description}
        </p>
      </div>
    </motion.div>
  );
};

const Features = () => {
  return (
    <section className="py-24 relative">
      <div className="max-w-6xl mx-auto px-6">

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Why you'll love Kineo</h2>
          <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
            Every recommendation is built around one thing: what you'll actually want to watch.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {features.map((feat, idx) => (
            <FeatureCard key={idx} feat={feat} idx={idx} />
          ))}
        </div>

      </div>
    </section>
  );
};

export default Features;
