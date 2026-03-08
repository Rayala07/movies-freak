import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

/**
 * AdminRoute
 * ----------
 * Double guard — user must be BOTH authenticated AND have role === "admin".
 * Non-admins are sent to home, unauthenticated users to /login.
 *
 * Usage in routes.jsx:
 *   element: <AdminRoute><AdminDashboardPage /></AdminRoute>
 *
 * Security note:
 *   This only controls what the frontend renders.
 *   Every admin API endpoint on the backend ALSO checks adminOnly middleware.
 *   Both guards must be in place — this prevents admin UI from ever loading
 *   for non-admins, and the backend ensures no unauthorized data access.
 */
const AdminRoute = ({ children }) => {
  const { isAuthenticated, loading, currentUser } = useSelector((state) => state.auth);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p>Loading...</p>
      </div>
    );
  }

  // Not logged in → go to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Logged in but not admin → go to home
  if (currentUser?.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminRoute;
