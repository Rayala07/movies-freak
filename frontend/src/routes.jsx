import { createBrowserRouter } from "react-router-dom";
import LandingPage from "./features/landing/pages/LandingPage";
import LoginPage from "./features/auth/pages/LoginPage";
import RegisterPage from "./features/auth/pages/RegisterPage";
import ProtectedRoute from "./shared/components/ProtectedRoute";
import AdminRoute from "./shared/components/AdminRoute";
import Layout from "./shared/components/Layout";
import "./shared/styles/global.css";

/**
 * Application Routes
 * ------------------
 * Public  → LandingPage, LoginPage, RegisterPage (no Layout)
 * Protected → wrapped in ProtectedRoute + Layout
 * Admin     → wrapped in AdminRoute + Layout
 *
 * Layout renders Navbar at the top of every protected page.
 * Added progressively — placeholder divs replaced as phases are built.
 */
export const routes = createBrowserRouter([
  // ── Public (no Navbar) ──────────────────────────────────────────────
  { path: "/",        element: <LandingPage /> },
  { path: "/login",   element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },

  // ── Protected (Navbar via Layout) ───────────────────────────────────
  {
    path: "/home",
    element: (
      <ProtectedRoute>
        <Layout>
          <div className="p-8">Home Page — Phase F4</div>
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/search",
    element: (
      <ProtectedRoute>
        <Layout>
          <div className="p-8">Search Page — Phase F6</div>
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/favorites",
    element: (
      <ProtectedRoute>
        <Layout>
          <div className="p-8">Favorites Page — Phase F7</div>
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/watchlist",
    element: (
      <ProtectedRoute>
        <Layout>
          <div className="p-8">Watchlist Page — Phase F7</div>
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/history",
    element: (
      <ProtectedRoute>
        <Layout>
          <div className="p-8">Watch History — Phase F7</div>
        </Layout>
      </ProtectedRoute>
    ),
  },

  // ── Admin (Navbar via Layout — admin link visible only to admins) ────
  {
    path: "/admin",
    element: (
      <AdminRoute>
        <Layout>
          <div className="p-8">Admin Dashboard — Phase F8</div>
        </Layout>
      </AdminRoute>
    ),
  },

  // ── 404 ─────────────────────────────────────────────────────────────
  { path: "*", element: <div className="p-8">404 — Page not found</div> },
]);