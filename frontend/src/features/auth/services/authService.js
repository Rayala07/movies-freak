import axiosInstance from "../../../shared/utils/axiosInstance";

/**
 * Auth Service — Layer 4
 * ----------------------
 * All HTTP calls for authentication.
 * Uses axiosInstance which has baseURL + withCredentials: true
 * so httpOnly cookies are automatically attached/received.
 *
 * Never import this directly into components — always go via useAuth hook.
 */

/**
 * Register a new user
 * @param {{ name: string, email: string, password: string }} data
 */
const register = (data) => axiosInstance.post("/api/auth/register", data);

/**
 * Login an existing user
 * @param {{ email: string, password: string }} data
 */
const login = (data) => axiosInstance.post("/api/auth/login", data);

/**
 * Logout the current user
 * Backend blacklists the JWT and clears the httpOnly cookie
 */
const logout = () => axiosInstance.post("/api/auth/logout");

/**
 * Get the currently logged-in user (restores session from cookie)
 * Called once on app load in App.jsx
 */
const getMe = () => axiosInstance.get("/api/auth/me");

export { register, login, logout, getMe };
