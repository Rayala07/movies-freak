import { RiBrainLine, RiGroupLine, RiDatabase2Line, RiMagicLine } from "@remixicon/react";
import { useScrollReveal } from "../hooks/useScrollReveal";

const features = [
  {
    icon: RiBrainLine,
    title: "AI Taste DNA Profiling",
    description: "Every time you favorite a movie, we calculate your affinity across 19 genres, dozens of languages, and cinematic eras. The AI learns exactly what makes you tick.",
  },
  {
    icon: RiGroupLine,
    title: "Internet Consensus Engine",
    description: "We bypass generic database queries. The AI taps into Letterboxd, IMDb, and Reddit consensus to surface hand-curated 'Community Picks' that humans actually love.",
  },
  {
    icon: RiMagicLine,
    title: "Dynamic Discovery Tiers",
    description: "Start with high-quality mainstream hits. As you use the app, you unlock Tier 3 cinephile mode, surfacing obscure but critically praised Hidden Gems.",
  },
  {
    icon: RiDatabase2Line,
    title: "Real-time TMDB Integration",
    description: "Powered by the world's most extensive movie database, ensuring metadata, posters, and cast information are always up to date and beautifully rendered.",
  }
];

const Features = () => {
  const [ref, isVisible] = useScrollReveal({ threshold: 0.1 });

  return (
    <section className="py-24 relative">
      <div className="max-w-6xl mx-auto px-6">
        
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Under the Hood</h2>
          <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
            Not just another movie wrapper. We engineered a multi-layered discovery pipeline.
          </p>
        </div>

        <div 
          ref={ref}
          className="grid md:grid-cols-2 gap-6"
        >
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div 
                key={idx}
                className={`bg-[rgba(255,255,255,0.02)] border border-[var(--border)] rounded-2xl p-8 transition-all duration-700 transform hover:bg-[rgba(255,255,255,0.04)] ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
                style={{ transitionDelay: `${idx * 150}ms` }}
              >
                <div className="w-12 h-12 rounded-xl bg-[var(--bg-hover)] border border-[var(--border)] flex items-center justify-center mb-5 text-[var(--accent)]">
                  <Icon size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3">{feat.title}</h3>
                <p className="text-[var(--text-secondary)] leading-relaxed text-sm">
                  {feat.description}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default Features;
