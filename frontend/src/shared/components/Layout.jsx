import Navbar from "./Navbar";

/**
 * Layout — shared wrapper for all protected pages.
 * Navbar floats on top (z-50). Children can extend behind it
 * via negative margin (e.g. the Hero section on HomePage).
 */
const Layout = ({ children }) => {
  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--bg-primary)", color: "var(--text-primary)" }}
    >
      <Navbar />
      {children}
    </div>
  );
};

export default Layout;
