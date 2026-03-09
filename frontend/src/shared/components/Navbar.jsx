import { useState, useRef, useEffect } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import {
  RiFilmLine,
  RiHomeLine,
  RiSearchLine,
  RiHeartLine,
  RiTimeLine,
  RiBookmarkLine,
  RiDashboardLine,
  RiSunLine,
  RiMoonLine,
  RiLogoutBoxLine,
} from "@remixicon/react";
import useAuth from "../../features/auth/hooks/useAuth";
import useTheme from "../hooks/useTheme";
import SearchBar from "./SearchBar";

/**
 * Derives 1–2 letter initials from a user's full name.
 * "John Doe"  → "JD"
 * "Madonna"   → "M"
 */
const getInitials = (name = "") => {
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

/**
 * Nav links shared between regular users and admins.
 * Admin-only links added conditionally below.
 */
const NAV_LINKS = [
  { to: "/home",       label: "Home",       icon: RiHomeLine    },
  { to: "/search",     label: "Search",     icon: RiSearchLine  },
  { to: "/favorites",  label: "Favorites",  icon: RiHeartLine   },
  { to: "/watchlist",  label: "Watchlist",  icon: RiBookmarkLine },
  { to: "/history",    label: "History",    icon: RiTimeLine    },
  { to: "/collection", label: "Collection", icon: null          },
];

const ADMIN_LINK = { to: "/admin", label: "Admin", icon: RiDashboardLine };

const Navbar = () => {
  const { user, isAdmin, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
  };

  const visibleLinks = isAdmin ? [...NAV_LINKS, ADMIN_LINK] : NAV_LINKS;
  const initials = getInitials(user?.name);

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 w-full"
        style={{
          background: "transparent",
        }}
      >
        {/* Subtle top gradient for text legibility over hero — invisible on non-hero pages */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "linear-gradient(to bottom, rgba(0,0,0,0.52) 0%, rgba(0,0,0,0.18) 60%, transparent 100%)",
          }}
        />
        <div className="relative z-10 max-w-8xl mx-auto px-6 lg:px-12 flex items-center justify-between h-14">

          {/* ── Logo ──────────────────────────────────────── */}
          <Link
            to="/home"
            className="flex items-center gap-2 flex-shrink-0"
            style={{ textDecoration: "none" }}
          >
            {/* <RiFilmLine size={18} style={{ color: "var(--accent)" }} /> */}
            <span
              className="text-md font-semibold tracking-tight"
              style={{ color: "#fff", textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}
            >
              Movies Freak
            </span>
          </Link>

          {/* ── Nav Links (Desktop Only) ────────────────────── */}
          <div className="hidden lg:flex items-center gap-2.5">
            {visibleLinks.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className="relative nav-link-glass px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200"
                style={({ isActive }) => ({
                  color: isActive ? "#fff" : "rgba(255,255,255,0.72)",
                  textDecoration: "none",
                  fontWeight: isActive ? 600 : 400,
                  background: isActive
                    ? "rgba(255,255,255,0.14)"
                    : "transparent",
                  backdropFilter: isActive ? "blur(14px)" : "none",
                  WebkitBackdropFilter: isActive ? "blur(14px)" : "none",
                  border: isActive
                    ? "1px solid rgba(255,255,255,0.18)"
                    : "1px solid transparent",
                  boxShadow: isActive
                    ? "inset 0 1px 0 rgba(255,255,255,0.1), 0 2px 12px rgba(0,0,0,0.18)"
                    : "none",
                })}
              >
                {label}
              </NavLink>
            ))}
          </div>

          {/* ── Right: Search + Theme + Avatar ─────────────────────── */}
          <div className="flex items-center gap-2">
            <SearchBar />

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="group flex items-center justify-center w-8 h-8 rounded-full cursor-pointer transition-all duration-200 active:scale-95"
              style={{
                background: "rgba(255,255,255,0.1)",
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "rgba(255,255,255,0.8)",
              }}
              aria-label="Toggle theme"
            >
              <div className="transition-transform duration-300 group-hover:rotate-12 group-active:rotate-45">
                {theme === "dark" ? <RiSunLine size={14} /> : <RiMoonLine size={14} />}
              </div>
            </button>

            {/* Avatar + dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen((o) => !o)}
                className="flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold cursor-pointer flex-shrink-0"
                style={{
                  background: "var(--accent)",
                  color: "#fff",
                  letterSpacing: "0.05em",
                }}
                aria-label="Account menu"
              >
                {initials}
              </button>

              {/* Dropdown */}
              {dropdownOpen && (
                <div
                  className="absolute right-0 top-10 w-44 rounded-xl py-1 z-50"
                  style={{
                    background: "var(--bg-card)",
                    border: "1px solid var(--border)",
                    boxShadow: "0 12px 32px rgba(0,0,0,0.3)",
                  }}
                >
                  {/* User info */}
                  <div
                    className="px-4 py-2.5 border-b"
                    style={{ borderColor: "var(--border)" }}
                  >
                    <p className="text-xs font-semibold truncate" style={{ color: "var(--text-primary)" }}>
                      {user?.name}
                    </p>
                    <p className="text-xs truncate mt-0.5" style={{ color: "var(--text-muted)" }}>
                      {user?.email}
                    </p>
                  </div>

                  {/* Logout */}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left text-xs cursor-pointer transition-opacity hover:opacity-70"
                    style={{ color: "var(--error)", background: "transparent", border: "none" }}
                  >
                    <RiLogoutBoxLine size={13} />
                    <span>Log out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* ── Mobile Bottom Navigation ─────────────────────── */}
      <div 
        className="lg:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-[60] flex items-center justify-around gap-1 px-3 h-11 rounded-2xl w-[96vw] max-w-md"
        style={{
          background: "rgba(15, 15, 15, 0.82)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.06)",
          boxShadow: "0 10px 40px rgba(0,0,0,0.5)"
        }}
      >
        {visibleLinks.filter(link => ["Home", "Search", "Favorites", "Watchlist", "History", "Collection"].includes(link.label)).map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            className="flex items-center justify-center px-1.5 h-full rounded-xl transition-all duration-300 flex-1"
            style={({ isActive }) => ({
              color: isActive ? "#fff" : "rgba(255,255,255,0.45)",
              background: isActive ? "var(--accent)" : "transparent",
              textDecoration: "none",
            })}
          >
            <span className="text-[8px] font-black uppercase tracking-widest text-center">
              {label}
            </span>
          </NavLink>
        ))}
      </div>
    </>
  );
};

export default Navbar;
