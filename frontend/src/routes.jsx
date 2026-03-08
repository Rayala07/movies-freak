import { createBrowserRouter } from "react-router-dom";
import LandingPage from "./features/landing/pages/LandingPage";
import LoginPage from "./features/auth/pages/LoginPage";
import RegisterPage from "./features/auth/pages/RegisterPage";
import ProtectedRoute from "./shared/components/ProtectedRoute";
import AdminRoute from "./shared/components/AdminRoute";
import HomePage from "./features/movies/pages/HomePage";
import MovieDetailPage from "./features/movies/pages/MovieDetailPage";
import SearchPage from "./features/movies/pages/SearchPage";
import FavoritesPage from "./features/favorites/pages/FavoritesPage";
import WatchlistPage from "./features/watchlist/pages/WatchlistPage";
import HistoryPage from "./features/history/pages/HistoryPage";
import AdminDashboard from "./features/admin/pages/AdminDashboard";
import CollectionPage from "./features/collection/pages/CollectionPage";
import CollectionDetailPage from "./features/collection/pages/CollectionDetailPage";
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
          <HomePage />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/movie/:id",
    element: (
      <ProtectedRoute>
        <Layout>
          <MovieDetailPage mediaType="movie" />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/tv/:id",
    element: (
      <ProtectedRoute>
        <Layout>
          <MovieDetailPage mediaType="tv" />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/search",
    element: (
      <ProtectedRoute>
        <Layout>
          <SearchPage />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/favorites",
    element: (
      <ProtectedRoute>
        <Layout>
          <FavoritesPage />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/watchlist",
    element: (
      <ProtectedRoute>
        <Layout>
          <WatchlistPage />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/history",
    element: (
      <ProtectedRoute>
        <Layout>
          <HistoryPage />
        </Layout>
      </ProtectedRoute>
    ),
  },

  {
    path: "/collection",
    element: (
      <ProtectedRoute>
        <Layout>
          <CollectionPage />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/collection/:id",
    element: (
      <ProtectedRoute>
        <Layout>
          <CollectionDetailPage />
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
          <AdminDashboard />
        </Layout>
      </AdminRoute>
    ),
  },

  // ── 404 ─────────────────────────────────────────────────────────────
  { path: "*", element: <div className="p-8">404 — Page not found</div> },
]);