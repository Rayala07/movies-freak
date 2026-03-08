import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  loginUser,
  registerUser,
  logoutUser,
  clearError,
} from "../authSlice";

/**
 * useAuth Hook — Layer 2
 * ----------------------
 * The ONLY way components interact with auth state & actions.
 * Components never import authSlice or authService directly.
 *
 * Returns:
 *   user          — full user object or null
 *   isAuthenticated — boolean
 *   isAdmin       — boolean (role === "admin") — use for admin UI guards
 *   loading       — boolean
 *   error         — last error string or null
 *   login()       — async, navigates to / on success
 *   register()    — async, navigates to / on success
 *   logout()      — async, navigates to /login on success
 */
const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { currentUser, isAuthenticated, loading, error } = useSelector(
    (state) => state.auth
  );

  // Derive isAdmin from role — never hardcode role checks in components
  const isAdmin = currentUser?.role === "admin";

  /**
   * Login handler
   * @param {{ email: string, password: string }} credentials
   */
  const login = async (credentials) => {
    dispatch(clearError());
    const result = await dispatch(loginUser(credentials));

    if (loginUser.fulfilled.match(result)) {
      toast.success(`Welcome back, ${result.payload.name}!`);
      navigate("/home");
    } else {
      toast.error(result.payload || "Login failed.");
    }
  };

  /**
   * Register handler
   * @param {{ name: string, email: string, password: string }} userData
   */
  const register = async (userData) => {
    dispatch(clearError());
    const result = await dispatch(registerUser(userData));

    if (registerUser.fulfilled.match(result)) {
      toast.success(`Welcome to MoviesFreak, ${result.payload.name}!`);
      navigate("/home");
    } else {
      toast.error(result.payload || "Registration failed.");
    }
  };

  /**
   * Logout handler — clears session, always redirects to /login
   */
  const logout = async () => {
    await dispatch(logoutUser());
    toast.success("Logged out successfully.");
    navigate("/login");
  };

  return {
    user: currentUser,
    isAuthenticated,
    isAdmin,
    loading,
    error,
    login,
    register,
    logout,
  };
};

export default useAuth;
