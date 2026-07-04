import { useScrollReveal } from "../hooks/useScrollReveal";

const quotes = [
  {
    text: "Cinema is a matter of what's in the frame and what's out.",
    author: "Martin Scorsese",
    movie: "Director"
  },
  {
    text: "Every great film should seem new every time you see it.",
    author: "Roger Ebert",
    movie: "Film Critic"
  },
  {
    text: "I don't dream at night, I dream at day, I dream all day; I'm dreaming for a living.",
    author: "Steven Spielberg",
    movie: "Director"
  },
  {
    text: "A film is – or should be – more like music than like fiction. It should be a progression of moods and feelings.",
    author: "Stanley Kubrick",
    movie: "Director"
  }
];

const QuotesSection = () => {
  const [ref, isVisible] = useScrollReveal({ threshold: 0.1 });

  return (
    <section className="py-24 bg-[var(--bg-secondary)] border-y border-[var(--border)] relative overflow-hidden">
      
      {/* Decorative background typography */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[15rem] font-bold text-[rgba(255,255,255,0.015)] whitespace-nowrap pointer-events-none -rotate-6 select-none z-0">
        CINEMA
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-2">The Magic of Movies</h2>
          <p className="text-[var(--text-muted)]">Find the films that move you.</p>
        </div>

        <div 
          ref={ref}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {quotes.map((quote, idx) => (
            <div 
              key={idx}
              className={`bg-[var(--bg-primary)] border border-[var(--border)] p-8 rounded-2xl flex flex-col justify-between transition-all duration-1000 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
              style={{ transitionDelay: `${idx * 150}ms` }}
            >
              <p className="text-lg font-serif italic text-[var(--text-primary)] mb-6 leading-relaxed relative">
                <span className="text-4xl absolute -top-4 -left-3 text-[var(--accent)] opacity-20 font-serif">"</span>
                {quote.text}
                <span className="text-4xl absolute -bottom-6 -right-1 text-[var(--accent)] opacity-20 font-serif">"</span>
              </p>
              <div>
                <p className="font-bold text-sm text-[var(--text-primary)]">{quote.author}</p>
                <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider mt-1">{quote.movie}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default QuotesSection;
