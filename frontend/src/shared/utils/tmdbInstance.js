import axios from "axios";

/**
 * TMDB Axios Instance
 * -------------------
 * Dedicated axios instance for talking to the TMDB API.
 * 
 * We use the Read Access Token (v4 auth) from the .env.
 */
const tmdbInstance = axios.create({
  baseURL: import.meta.env.VITE_TMDB_BASE_URL,
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${import.meta.env.VITE_TMDB_READ_ACCESS_TOKEN}`,
  },
});

export default tmdbInstance;
