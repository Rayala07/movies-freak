import axios from "axios";

/**
 * Axios Instance
 * --------------
 * Pre-configured axios for all calls to our Express backend.
 *
 * baseURL   → reads from .env (VITE_API_BASE_URL = http://localhost:3000)
 * withCredentials: true → CRITICAL — tells the browser to attach the
 *   httpOnly cookie on every request so our JWT auth works cross-origin
 *   (frontend on port 5173 → backend on port 3000)
 */
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
  timeout: 60000, // 60s — Gemini + TMDB can take up to ~30s; without this, a hanging request keeps groupLoading=true forever
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosInstance;
