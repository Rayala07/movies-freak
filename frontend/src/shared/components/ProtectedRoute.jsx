import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

/**
 * ProtectedRoute
 * --------------
 * Blocks any unauthenticated user from accessing a route.
 * Shows a loading state while fetchMe is still running on app load.
 *
 * Usage in routes.jsx:
 *   element: <ProtectedRoute><HomePage /></ProtectedRoute>
 *
 * Flow:
 *   loading = true  → show spinner (fetchMe not done yet)
 *   isAuthenticated → render children
 *   else            → redirect to /login
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useSelector((state) => state.auth);

  // Wait for session restoration to complete before making a routing decision
  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
