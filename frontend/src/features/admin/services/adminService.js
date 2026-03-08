import axiosInstance from "../../../shared/utils/axiosInstance";

/**
 * Admin Service — Layer 4
 * -----------------------
 * Covers both /api/movies (CRUD) and /api/users (management).
 * POST/PUT use FormData for multipart (Cloudinary poster uploads).
 */
const adminService = {
  // ── Movies ──────────────────────────────────────────────────────────────

  /** GET /api/movies?page=1&limit=20 */
  getMovies: async (page = 1, limit = 50) => {
    const { data } = await axiosInstance.get(`/api/movies?page=${page}&limit=${limit}`);
    return data;
  },

  /** GET /api/movies/:id — single admin movie by MongoDB _id */
  getMovieById: async (id) => {
    const { data } = await axiosInstance.get(`/api/movies/${id}`);
    return data;
  },

  /**
   * POST /api/movies — multipart/form-data
   * Fields: title, description, releaseDate, trailerUrl, genre, category, poster (file)
   */
  createMovie: async (formData) => {
    const { data } = await axiosInstance.post("/api/movies", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  /** PUT /api/movies/:id — multipart/form-data */
  updateMovie: async (id, formData) => {
    const { data } = await axiosInstance.put(`/api/movies/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  /** DELETE /api/movies/:id */
  deleteMovie: async (id) => {
    const { data } = await axiosInstance.delete(`/api/movies/${id}`);
    return data;
  },

  // ── Users ───────────────────────────────────────────────────────────────

  /** GET /api/users */
  getUsers: async () => {
    const { data } = await axiosInstance.get("/api/users");
    return data;
  },

  /** PATCH /api/users/:id/ban — toggles ban/unban */
  toggleBan: async (id) => {
    const { data } = await axiosInstance.patch(`/api/users/${id}/ban`);
    return data;
  },

  /** DELETE /api/users/:id */
  deleteUser: async (id) => {
    const { data } = await axiosInstance.delete(`/api/users/${id}`);
    return data;
  },
};

export default adminService;
