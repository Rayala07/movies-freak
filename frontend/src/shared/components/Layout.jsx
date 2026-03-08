import Navbar from "./Navbar";

/**
 * Layout — shared wrapper for all protected pages.
 * Renders Navbar at the top, page content below.
 *
 * Usage in routes.jsx:
 *   element: <Layout><HomePage /></Layout>
 */
const Layout = ({ children }) => {
  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--bg-primary)", color: "var(--text-primary)" }}
    >
      <Navbar />
      <main>{children}</main>
    </div>
  );
};

export default Layout;
