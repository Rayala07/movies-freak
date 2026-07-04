import { Link } from "react-router-dom";
import { RiArrowUpLine } from "@remixicon/react";

const columns = [
  {
    heading: "Product",
    links: [
      { label: "How it works", href: "#how-it-works" },
      { label: "Discover", to: "/discover" },
      { label: "Search", to: "/search" },
    ],
  },
  {
    heading: "Account",
    links: [
      { label: "Sign in", to: "/login" },
      { label: "Create account", to: "/register" },
    ],
  },
];

const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="relative pt-20 pb-8 border-t border-[var(--border)] bg-[var(--bg-primary)]">
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-md h-px pointer-events-none"
        style={{ background: "linear-gradient(to right, transparent, var(--accent), transparent)", opacity: 0.4 }}
      />

      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-14 pb-14">

          {/* Brand */}
          <div className="max-w-xs">
            <img src="/kineo_logo.png" alt="Kineo" className="h-7 w-auto object-contain mb-4" />
            <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              AI-driven personalized movie discovery, built for people tired of scrolling and just want to watch something great.
            </p>
          </div>

          {/* Link columns */}
          <div className="flex flex-wrap gap-14">
            {columns.map((col) => (
              <div key={col.heading}>
                <h3
                  className="text-xs font-semibold uppercase tracking-wider mb-4"
                  style={{ color: "var(--text-muted)" }}
                >
                  {col.heading}
                </h3>
                <ul className="space-y-3">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      {link.to ? (
                        <Link
                          to={link.to}
                          className="text-sm transition-colors duration-200 hover:text-[var(--accent)]"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          {link.label}
                        </Link>
                      ) : (
                        <a
                          href={link.href}
                          className="text-sm transition-colors duration-200 hover:text-[var(--accent)]"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          {link.label}
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="flex flex-col-reverse sm:flex-row items-center justify-between gap-4 pt-8 border-t"
          style={{ borderColor: "var(--border)" }}
        >
          <p className="text-xs text-center sm:text-left" style={{ color: "var(--text-muted)" }}>
            © {year} Kineo. Powered by TMDB. Built with love towards cinema by Rayala Viswanath.
          </p>

          <button
            onClick={scrollToTop}
            aria-label="Back to top"
            className="group flex items-center justify-center w-9 h-9 rounded-full cursor-pointer transition-all duration-300 active:scale-95 flex-shrink-0"
            style={{
              background: "var(--bg-secondary)",
              border: "1px solid var(--border)",
              color: "var(--text-secondary)",
            }}
          >
            <RiArrowUpLine size={16} className="transition-transform duration-300 group-hover:-translate-y-0.5" />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
