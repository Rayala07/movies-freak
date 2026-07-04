import { RiCheckLine } from "@remixicon/react";
import { useScrollReveal } from "../hooks/useScrollReveal";

const achievements = [
  "Never waste 30 minutes scrolling Netflix menus again.",
  "Discover critically acclaimed Hidden Gems you would have never found on your own.",
  "Get recommendations that actually understand your language and era preferences.",
  "Build a personal cinematic library of your all-time favorites."
];

const Achievements = () => {
  const [ref, isVisible] = useScrollReveal({ threshold: 0.3 });

  return (
    <section className="py-24 bg-[var(--bg-secondary)] border-y border-[var(--border)] overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center gap-16">
        
        <div 
          ref={ref}
          className={`flex-1 transition-all duration-1000 transform ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'}`}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">
            Stop searching.<br/>
            <span className="text-[var(--accent)]">Start watching.</span>
          </h2>
          <p className="text-lg text-[var(--text-secondary)] mb-8 max-w-md leading-relaxed">
            Kineo is designed to solve the modern paradox of choice. Here is what you achieve when you let AI curate your cinema experience.
          </p>

          <ul className="space-y-5">
            {achievements.map((item, idx) => (
              <li 
                key={idx} 
                className="flex items-start gap-4"
                style={{
                  transitionDelay: `${300 + (idx * 150)}ms`,
                  transitionProperty: 'opacity, transform',
                  transitionDuration: '700ms'
                }}
              >
                <div className="mt-1 bg-[rgba(16,185,129,0.15)] text-emerald-500 rounded-full p-1 flex-shrink-0">
                  <RiCheckLine size={16} />
                </div>
                <span className="text-[var(--text-primary)] font-medium leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div 
          className={`flex-1 relative transition-all duration-1000 transform delay-300 ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-16 scale-95'}`}
        >
          {/* Abstract visual representation of "achievement" */}
          <div className="relative w-full aspect-square max-w-md mx-auto">
            <div className="absolute inset-0 bg-gradient-to-tr from-[var(--accent)] to-fuchsia-500 rounded-full blur-[80px] opacity-20 animate-pulse" />
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
                <div className="mt-6 flex gap-4">
                  <div className="h-24 w-1/3 bg-gradient-to-t from-[var(--accent-light)] to-transparent rounded-lg border border-[var(--accent)]/30" />
                  <div className="h-24 w-1/3 bg-gradient-to-t from-[var(--accent-light)] to-transparent rounded-lg border border-[var(--accent)]/30" />
                  <div className="h-24 w-1/3 bg-gradient-to-t from-[var(--accent-light)] to-transparent rounded-lg border border-[var(--accent)]/30" />
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default Achievements;
