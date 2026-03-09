import Navbar from "./Navbar";
import { useLocation } from "react-router-dom";

/**
 * Layout — shared wrapper for all protected pages.
 * Navbar is fixed/transparent (cinematic streaming style).
 * Hero pages start at the very top (extend behind navbar).
 * All other pages get a pt-14 spacer so content isn't hidden behind navbar.
 */
const HERO_ROUTES = ["/home", "/movie", "/tv"];

const Layout = ({ children }) => {
  const { pathname } = useLocation();
  const isHeroPage = HERO_ROUTES.some((r) => pathname.startsWith(r));

  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--bg-primary)", color: "var(--text-primary)" }}
    >
      <Navbar />
      {/* Spacer: only for non-hero pages so content doesn't hide behind the fixed navbar */}
      {!isHeroPage && <div className="h-14" aria-hidden="true" />}
      {children}
    </div>
  );
};

export default Layout;
