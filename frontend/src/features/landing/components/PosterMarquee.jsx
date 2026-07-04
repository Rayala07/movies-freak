const IMG_BASE = "https://image.tmdb.org/t/p/w342";

/**
 * PosterMarquee
 * -------------
 * Two rows of real movie posters drifting in opposite directions.
 * Purely decorative - gives the hero area a living, cinematic backdrop.
 * Each row's content is duplicated so the CSS animation loops seamlessly.
 */
const PosterMarquee = ({ movies = [] }) => {
  if (movies.length < 8) return null;

  const rowA = movies.slice(0, 10);
  const rowB = movies.slice(10, 20);

  const renderRow = (row) =>
    row.map((movie) => (
      <div
        key={movie.id}
        className="relative flex-shrink-0 w-28 sm:w-36 rounded-xl overflow-hidden"
        style={{ boxShadow: "0 12px 30px rgba(0,0,0,0.35)" }}
      >
        <img
          src={`${IMG_BASE}${movie.poster_path}`}
          alt={movie.title}
          className="w-full aspect-[2/3] object-cover"
          loading="lazy"
        />
        <div
          className="absolute inset-0"
          style={{ boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.08)" }}
        />
      </div>
    ));

  return (
    <section className="relative py-6 overflow-hidden select-none" aria-hidden="true">
      <div className="marquee-mask flex flex-col gap-4">
        <div className="marquee-row overflow-hidden">
          <div className="marquee-track-left flex gap-4 w-max">
            {renderRow(rowA)}
            {renderRow(rowA)}
          </div>
        </div>
        <div className="marquee-row overflow-hidden">
          <div className="marquee-track-right flex gap-4 w-max">
            {renderRow(rowB)}
            {renderRow(rowB)}
          </div>
        </div>
      </div>

      {/* Fade to page background at top/bottom so it blends with sections */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, var(--bg-primary) 0%, transparent 15%, transparent 85%, var(--bg-primary) 100%)",
        }}
      />
    </section>
  );
};

export default PosterMarquee;
