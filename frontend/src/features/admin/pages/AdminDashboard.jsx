import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAdminMovies,
  createMovie,
  updateMovie,
  deleteMovie,
  fetchUsers,
  toggleBanUser,
  deleteUser,
} from "../adminSlice";
import MovieFormModal from "../components/MovieFormModal";
import {
  RiFilmLine,
  RiGroupLine,
  RiAddLine,
  RiEditLine,
  RiDeleteBin6Line,
  RiShieldUserLine,
  RiShieldLine,
  RiImageLine,
  RiMovieLine,
  RiUserLine,
  RiProhibitedLine,
} from "@remixicon/react";
import toast from "react-hot-toast";

/**
 * AdminDashboard — Phase F8
 * --------------------------
 * Premium tabbed CMS dashboard:
 *   Tab 1 — Movies: CRUD for admin-managed movie catalog
 *   Tab 2 — Users: View, ban/unban, delete platform users
 */

// ── Stat Card ──────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, color }) => (
  <div
    className="flex items-center gap-4 px-5 py-4 rounded-2xl"
    style={{
      background: "var(--bg-secondary)",
      border: "1px solid var(--border)",
    }}
  >
    <div
      className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
      style={{ background: `${color}18`, border: `1px solid ${color}30` }}
    >
      <Icon size={20} style={{ color }} />
    </div>
    <div>
      <p className="text-2xl font-black" style={{ color: "var(--text-primary)" }}>
        {value}
      </p>
      <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
        {label}
      </p>
    </div>
  </div>
);

// ── Avatar initials ─────────────────────────────────────────────────────────
const Avatar = ({ name }) => {
  const initials = (name || "?").split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
  return (
    <div
      className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
      style={{ background: "var(--accent-light)", color: "var(--accent)" }}
    >
      {initials}
    </div>
  );
};

// ── Main Dashboard ─────────────────────────────────────────────────────────
const AdminDashboard = () => {
  const dispatch = useDispatch();
  const {
    movies, totalMovies, moviesLoading,
    users, usersLoading,
  } = useSelector((state) => state.admin);

  const [activeTab, setActiveTab] = useState("movies");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null); // id of item to confirm delete
  const [confirmDeleteType, setConfirmDeleteType] = useState(null); // "movie" | "user"

  const moviePlaceholder =
    "https://res.cloudinary.com/dr3icbigy/image/upload/v1772899683/placeholder_image_scac1b.png";

  useEffect(() => {
    dispatch(fetchAdminMovies());
    dispatch(fetchUsers());
  }, [dispatch]);

  // ── Movie form submit ────────────────────────────────────────────────────
  const handleFormSubmit = async (formData) => {
    setFormLoading(true);
    try {
      if (editingMovie) {
        await dispatch(updateMovie({ id: editingMovie._id, formData })).unwrap();
        toast.success("Movie updated successfully");
      } else {
        await dispatch(createMovie(formData)).unwrap();
        toast.success("Movie added successfully 🎬");
      }
      setModalOpen(false);
      setEditingMovie(null);
    } catch (err) {
      toast.error(err || "Something went wrong");
    } finally {
      setFormLoading(false);
    }
  };

  const openAdd = () => { setEditingMovie(null); setModalOpen(true); };
  const openEdit = (movie) => { setEditingMovie(movie); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditingMovie(null); };

  // ── Delete with two-tap confirm ─────────────────────────────────────────
  const handleDelete = (id, type) => {
    if (confirmDelete === id) {
      // Second tap — execute
      if (type === "movie") {
        dispatch(deleteMovie(id))
          .unwrap()
          .then(() => toast.success("Movie deleted"))
          .catch((e) => toast.error(e || "Failed to delete"));
      } else {
        dispatch(deleteUser(id))
          .unwrap()
          .then(() => toast.success("User deleted"))
          .catch((e) => toast.error(e || "Failed to delete"));
      }
      setConfirmDelete(null);
      setConfirmDeleteType(null);
    } else {
      setConfirmDelete(id);
      setConfirmDeleteType(type);
      setTimeout(() => setConfirmDelete(null), 3000);
    }
  };

  const handleBanToggle = (user) => {
    dispatch(toggleBanUser(user._id))
      .unwrap()
      .then((u) => toast.success(u.isBanned ? `${u.name} banned` : `${u.name} unbanned`))
      .catch((e) => toast.error(e || "Failed"));
  };

  // Stats data
  const bannedCount = users.filter((u) => u.isBanned).length;
  const adminCount = users.filter((u) => u.role === "admin").length;

  const tabs = [
    { id: "movies", label: "Movies", icon: RiFilmLine },
    { id: "users", label: "Users", icon: RiGroupLine },
  ];

  return (
    <div className="min-h-[calc(100vh-3.5rem)] pt-8" style={{ background: "var(--bg-primary)" }}>
      <div className="section-container pb-20">

        {/* ── Page Header ──────────────────────────────────────────── */}
        <div className="mb-8 animate-in">
          <h1 className="text-2xl md:text-3xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>
            Admin Dashboard
          </h1>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Manage content and users across the platform
          </p>
        </div>

        {/* ── Stats Row ────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 animate-in delay-100">
          <StatCard icon={RiMovieLine} label="Total Movies" value={totalMovies} color="#7c3aed" />
          <StatCard icon={RiUserLine} label="Total Users" value={users.length} color="#06b6d4" />
          <StatCard icon={RiProhibitedLine} label="Banned Users" value={bannedCount} color="#ef4444" />
          <StatCard icon={RiShieldUserLine} label="Admins" value={adminCount} color="#10b981" />
        </div>

        {/* ── Tabs ─────────────────────────────────────────────────── */}
        <div
          className="flex items-center gap-1 p-1 rounded-xl mb-6 w-fit animate-in delay-150"
          style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}
        >
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold cursor-pointer transition-all duration-200"
              style={{
                background: activeTab === id ? "var(--accent)" : "transparent",
                color: activeTab === id ? "#fff" : "var(--text-secondary)",
                border: "none",
              }}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* ── Movies Tab ─────────────────────────────────────────── */}
        {/* ═══════════════════════════════════════════════════════════ */}
        {activeTab === "movies" && (
          <div className="animate-in">
            {/* Tab header */}
            <div className="flex items-center justify-between mb-5">
              <p className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>
                {totalMovies} {totalMovies === 1 ? "movie" : "movies"} in catalog
              </p>
              <button
                onClick={openAdd}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white cursor-pointer transition-all duration-200 active:scale-95"
                style={{ background: "var(--accent)", border: "none" }}
              >
                <RiAddLine size={16} />
                Add Movie
              </button>
            </div>

            {/* Movie table */}
            {moviesLoading && movies.length === 0 ? (
              <div className="flex flex-col gap-3">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="h-16 rounded-xl animate-pulse"
                    style={{ background: "var(--bg-hover)" }}
                  />
                ))}
              </div>
            ) : movies.length > 0 ? (
              <div
                className="rounded-2xl overflow-hidden"
                style={{ border: "1px solid var(--border)" }}
              >
                {/* Table header */}
                <div
                  className="grid grid-cols-12 gap-4 px-5 py-3 text-xs font-bold uppercase tracking-wider"
                  style={{
                    background: "var(--bg-secondary)",
                    borderBottom: "1px solid var(--border)",
                    color: "var(--text-muted)",
                  }}
                >
                  <div className="col-span-1">Poster</div>
                  <div className="col-span-4">Title</div>
                  <div className="col-span-2 hidden md:block">Genre</div>
                  <div className="col-span-2 hidden md:block">Category</div>
                  <div className="col-span-3 md:col-span-3 text-right">Actions</div>
                </div>

                {/* Table rows */}
                {movies.map((movie, i) => (
                  <div
                    key={movie._id}
                    className="grid grid-cols-12 gap-4 px-5 py-3 items-center transition-colors duration-150"
                    style={{
                      borderBottom: i < movies.length - 1 ? "1px solid var(--border)" : "none",
                      background: "var(--bg-primary)",
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-hover)"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "var(--bg-primary)"}
                  >
                    {/* Poster thumbnail */}
                    <div className="col-span-1">
                      {movie.poster ? (
                        <img
                          src={movie.poster}
                          alt={movie.title}
                          className="w-9 h-12 rounded-lg object-cover"
                          style={{ border: "1px solid var(--border)" }}
                          onError={(e) => { e.target.src = moviePlaceholder; }}
                        />
                      ) : (
                        <div
                          className="w-9 h-12 rounded-lg flex items-center justify-center"
                          style={{ background: "var(--bg-hover)", border: "1px solid var(--border)" }}
                        >
                          <RiImageLine size={14} style={{ color: "var(--text-muted)" }} />
                        </div>
                      )}
                    </div>

                    {/* Title */}
                    <div className="col-span-4">
                      <p className="text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>
                        {movie.title}
                      </p>
                      {movie.releaseDate && (
                        <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                          {new Date(movie.releaseDate).getFullYear()}
                        </p>
                      )}
                    </div>

                    {/* Genre */}
                    <div className="col-span-2 hidden md:block">
                      {movie.genre ? (
                        <span
                          className="px-2 py-0.5 rounded-md text-xs font-semibold"
                          style={{ background: "var(--accent-light)", color: "var(--accent)" }}
                        >
                          {movie.genre}
                        </span>
                      ) : (
                        <span style={{ color: "var(--text-muted)", fontSize: "12px" }}>—</span>
                      )}
                    </div>

                    {/* Category */}
                    <div className="col-span-2 hidden md:block">
                      <p className="text-xs font-medium truncate" style={{ color: "var(--text-secondary)" }}>
                        {movie.category || "—"}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="col-span-3 flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(movie)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all duration-200"
                        style={{
                          background: "var(--bg-hover)",
                          border: "1px solid var(--border)",
                          color: "var(--text-secondary)",
                        }}
                      >
                        <RiEditLine size={13} />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(movie._id, "movie")}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all duration-200 active:scale-95"
                        style={{
                          background: confirmDelete === movie._id
                            ? "rgba(239,68,68,0.15)" : "var(--bg-hover)",
                          border: confirmDelete === movie._id
                            ? "1px solid rgba(239,68,68,0.4)" : "1px solid var(--border)",
                          color: confirmDelete === movie._id ? "#ef4444" : "var(--text-secondary)",
                        }}
                      >
                        <RiDeleteBin6Line size={13} />
                        {confirmDelete === movie._id ? "Confirm?" : "Delete"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Empty state */
              <div
                className="flex flex-col items-center justify-center py-24 rounded-2xl text-center"
                style={{ border: "1px dashed var(--border)" }}
              >
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
                  style={{ background: "var(--accent-light)" }}
                >
                  <RiFilmLine size={32} style={{ color: "var(--accent)" }} />
                </div>
                <h3 className="text-lg font-bold mb-2" style={{ color: "var(--text-primary)" }}>
                  No movies yet
                </h3>
                <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
                  Add the first movie to your catalog.
                </p>
                <button
                  onClick={openAdd}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer"
                  style={{ background: "var(--accent)", border: "none" }}
                >
                  <RiAddLine size={16} /> Add Movie
                </button>
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* ── Users Tab ──────────────────────────────────────────── */}
        {/* ═══════════════════════════════════════════════════════════ */}
        {activeTab === "users" && (
          <div className="animate-in">
            <p className="text-sm font-medium mb-5" style={{ color: "var(--text-muted)" }}>
              {users.length} registered {users.length === 1 ? "user" : "users"}
            </p>

            {usersLoading && users.length === 0 ? (
              <div className="flex flex-col gap-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 rounded-xl animate-pulse" style={{ background: "var(--bg-hover)" }} />
                ))}
              </div>
            ) : users.length > 0 ? (
              <div
                className="rounded-2xl overflow-hidden"
                style={{ border: "1px solid var(--border)" }}
              >
                {/* Table header */}
                <div
                  className="grid grid-cols-12 gap-4 px-5 py-3 text-xs font-bold uppercase tracking-wider"
                  style={{
                    background: "var(--bg-secondary)",
                    borderBottom: "1px solid var(--border)",
                    color: "var(--text-muted)",
                  }}
                >
                  <div className="col-span-1">Avatar</div>
                  <div className="col-span-4">Name / Email</div>
                  <div className="col-span-2 hidden md:block">Role</div>
                  <div className="col-span-2 hidden md:block">Status</div>
                  <div className="col-span-3 text-right">Actions</div>
                </div>

                {/* User rows */}
                {users.map((user, i) => (
                  <div
                    key={user._id}
                    className="grid grid-cols-12 gap-4 px-5 py-3 items-center transition-colors duration-150"
                    style={{
                      borderBottom: i < users.length - 1 ? "1px solid var(--border)" : "none",
                      background: user.isBanned ? "rgba(239,68,68,0.04)" : "var(--bg-primary)",
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = user.isBanned ? "rgba(239,68,68,0.07)" : "var(--bg-hover)"}
                    onMouseLeave={(e) => e.currentTarget.style.background = user.isBanned ? "rgba(239,68,68,0.04)" : "var(--bg-primary)"}
                  >
                    {/* Avatar */}
                    <div className="col-span-1">
                      <Avatar name={user.name} />
                    </div>

                    {/* Name + Email */}
                    <div className="col-span-4">
                      <p className="text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>
                        {user.name}
                      </p>
                      <p className="text-xs truncate mt-0.5" style={{ color: "var(--text-muted)" }}>
                        {user.email}
                      </p>
                    </div>

                    {/* Role */}
                    <div className="col-span-2 hidden md:block">
                      <span
                        className="px-2 py-0.5 rounded-md text-xs font-semibold"
                        style={
                          user.role === "admin"
                            ? { background: "rgba(16,185,129,0.15)", color: "#10b981" }
                            : { background: "var(--bg-hover)", color: "var(--text-secondary)" }
                        }
                      >
                        {user.role}
                      </span>
                    </div>

                    {/* Status */}
                    <div className="col-span-2 hidden md:block">
                      <span
                        className="px-2 py-0.5 rounded-md text-xs font-semibold"
                        style={
                          user.isBanned
                            ? { background: "rgba(239,68,68,0.15)", color: "#ef4444" }
                            : { background: "rgba(16,185,129,0.12)", color: "#10b981" }
                        }
                      >
                        {user.isBanned ? "Banned" : "Active"}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="col-span-3 flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleBanToggle(user)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all duration-200"
                        style={{
                          background: user.isBanned ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.1)",
                          border: user.isBanned
                            ? "1px solid rgba(16,185,129,0.3)"
                            : "1px solid rgba(239,68,68,0.3)",
                          color: user.isBanned ? "#10b981" : "#ef4444",
                        }}
                      >
                        {user.isBanned ? <RiShieldLine size={13} /> : <RiShieldUserLine size={13} />}
                        {user.isBanned ? "Unban" : "Ban"}
                      </button>
                      <button
                        onClick={() => handleDelete(user._id, "user")}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all duration-200 active:scale-95"
                        style={{
                          background: confirmDelete === user._id
                            ? "rgba(239,68,68,0.15)" : "var(--bg-hover)",
                          border: confirmDelete === user._id
                            ? "1px solid rgba(239,68,68,0.4)" : "1px solid var(--border)",
                          color: confirmDelete === user._id ? "#ef4444" : "var(--text-secondary)",
                        }}
                      >
                        <RiDeleteBin6Line size={13} />
                        {confirmDelete === user._id ? "Confirm?" : "Delete"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 rounded-2xl text-center"
                style={{ border: "1px dashed var(--border)" }}>
                <RiGroupLine size={40} style={{ color: "var(--text-muted)", marginBottom: "16px" }} />
                <p className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>No users found</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Movie Form Modal ──────────────────────────────────────── */}
      {modalOpen && (
        <MovieFormModal
          movie={editingMovie}
          onClose={closeModal}
          onSubmit={handleFormSubmit}
          loading={formLoading}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
