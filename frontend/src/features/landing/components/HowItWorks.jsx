import { RiSearchLine, RiFingerprintLine, RiFilmLine } from "@remixicon/react";
import { useScrollReveal } from "../hooks/useScrollReveal";

const steps = [
  {
    icon: RiSearchLine,
    title: "1. Tell us your mood",
    description: "Don't search by title. Just describe what you're feeling — 'something intense and dark' or 'a feel-good rainy day movie'.",
    color: "#a855f7"
  },
  {
    icon: RiFingerprintLine,
    title: "2. We analyze your Taste DNA",
    description: "Our AI cross-references your request with your unique watching habits, favored genres, and language preferences.",
    color: "#3b82f6"
  },
  {
    icon: RiFilmLine,
    title: "3. Get your perfect watch",
    description: "Receive a personalized, deduplicated list featuring community favorites and hidden gems tailored just for you.",
    color: "#10b981"
  }
];

const HowItWorks = () => {
  const [ref, isVisible] = useScrollReveal({ threshold: 0.2 });

  return (
    <section className="py-24 relative" id="how-it-works">
      <div className="max-w-6xl mx-auto px-6">
        
        <div 
          ref={ref}
          className={`text-center mb-16 transition-all duration-1000 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">How Kineo Works</h2>
          <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
            Stop scrolling endlessly. Let our AI do the heavy lifting to find the exact movie that fits your current vibe.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connecting line for desktop */}
          <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-transparent via-[var(--border-hover)] to-transparent -z-10" />

          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div 
                key={idx}
                className={`relative bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl p-8 text-center transition-all duration-700 transform hover:-translate-y-2 hover:border-[var(--border-hover)] hover:shadow-2xl ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
                style={{ transitionDelay: `${idx * 200}ms` }}
              >
                <div 
                  className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-6 shadow-lg"
                  style={{ background: `linear-gradient(135deg, ${step.color}22, ${step.color}44)`, color: step.color, border: `1px solid ${step.color}44` }}
                >
                  <Icon size={32} />
                </div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-[var(--text-secondary)] leading-relaxed text-sm">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default HowItWorks;
