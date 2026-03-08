import { RiUserLine } from "@remixicon/react";

/**
 * CastScroller — Phase F5
 * -----------------------
 * Horizontal scrolling list of cast members.
 * Shows profile image (or fallback icon), actor name, and character name.
 */
const CastScroller = ({ cast = [] }) => {
  if (cast.length === 0) return null;

  // Show top 20 cast members
  const visible = cast.slice(0, 20);

  return (
    <section className="section-container py-8">
      <h2
        className="text-xl font-bold mb-5"
        style={{ color: "var(--text-primary)" }}
      >
        Cast & Crew
      </h2>

      <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
        {visible.map((person) => (
          <div
            key={person.credit_id || person.id}
            className="flex-shrink-0 w-28 flex flex-col items-center gap-2 group cursor-pointer"
          >
            {/* Profile image or fallback */}
            <div
              className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center"
              style={{
                background: person.profile_path
                  ? "transparent"
                  : "var(--bg-hover)",
                border: "2px solid var(--border)",
                transition: "border-color 0.3s ease, transform 0.3s ease",
              }}
            >
              <img
                src={person.profile_path 
                  ? `https://image.tmdb.org/t/p/w185${person.profile_path}` 
                  : "https://res.cloudinary.com/dr3icbigy/image/upload/v1772977435/download_sgd3rm.jpg"
                }
                alt={person.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>

            {/* Name */}
            <p
              className="text-xs font-semibold text-center truncate w-full"
              style={{ color: "var(--text-primary)" }}
            >
              {person.name}
            </p>

            {/* Character */}
            <p
              className="text-[10px] text-center truncate w-full -mt-1"
              style={{ color: "var(--text-secondary)" }}
            >
              {person.character || person.job || ""}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default CastScroller;
