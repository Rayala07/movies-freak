import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import {
  RiCloseLine,
  RiUploadCloud2Line,
  RiImageLine,
} from "@remixicon/react";

/**
 * MovieFormModal — Phase F8
 * -------------------------
 * Slide-in drawer modal for creating or editing a movie.
 * Handles poster file preview + FormData submission.
 */
const GENRES = [
  "Action", "Adventure", "Animation", "Comedy", "Crime",
  "Documentary", "Drama", "Fantasy", "Horror", "Mystery",
  "Romance", "Sci-Fi", "Thriller", "Western",
];

const CATEGORIES = ["Trending", "Featured", "New Release", "Classic", "Hidden Gem"];

const MovieFormModal = ({ movie = null, onClose, onSubmit, loading }) => {
  const isEdit = !!movie;
  const fileInputRef = useRef();
  const [posterPreview, setPosterPreview] = useState(movie?.poster || null);
  const [posterFile, setPosterFile] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: movie?.title || "",
      description: movie?.description || "",
      releaseDate: movie?.releaseDate?.split("T")[0] || "",
      trailerUrl: movie?.trailerUrl || "",
      genre: movie?.genre || "",
      category: movie?.category || "",
    },
  });

  useEffect(() => {
    reset({
      title: movie?.title || "",
      description: movie?.description || "",
      releaseDate: movie?.releaseDate?.split("T")[0] || "",
      trailerUrl: movie?.trailerUrl || "",
      genre: movie?.genre || "",
      category: movie?.category || "",
    });
    setPosterPreview(movie?.poster || null);
    setPosterFile(null);
  }, [movie, reset]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPosterFile(file);
    const reader = new FileReader();
    reader.onload = () => setPosterPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;
    setPosterFile(file);
    const reader = new FileReader();
    reader.onload = () => setPosterPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const onFormSubmit = (fields) => {
    const fd = new FormData();
    Object.entries(fields).forEach(([k, v]) => { if (v) fd.append(k, v); });
    if (posterFile) fd.append("poster", posterFile);
    onSubmit(fd);
  };

  // Shared input style
  const inputStyle = {
    background: "var(--bg-hover)",
    border: "1px solid var(--border)",
    color: "var(--text-primary)",
    borderRadius: "10px",
    padding: "10px 14px",
    fontSize: "14px",
    width: "100%",
    outline: "none",
    transition: "border-color 0.2s",
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)" }}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className="fixed top-0 right-0 h-full z-50 flex flex-col overflow-y-auto"
        style={{
          width: "min(480px, 100vw)",
          background: "var(--bg-secondary)",
          borderLeft: "1px solid var(--border)",
          boxShadow: "-20px 0 60px rgba(0,0,0,0.4)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-5 flex-shrink-0"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <div>
            <h2 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
              {isEdit ? "Edit Movie" : "Add New Movie"}
            </h2>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
              {isEdit ? "Update the movie details below" : "Fill in the movie details to publish"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-9 h-9 rounded-full cursor-pointer transition-colors duration-200"
            style={{ background: "var(--bg-hover)", border: "1px solid var(--border)" }}
          >
            <RiCloseLine size={18} style={{ color: "var(--text-secondary)" }} />
          </button>
        </div>

        {/* Form body */}
        <form
          onSubmit={handleSubmit(onFormSubmit)}
          className="flex flex-col gap-5 px-6 py-6 flex-1"
        >
          {/* Poster Upload */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
              Poster Image
            </label>
            <div
              className="relative flex flex-col items-center justify-center rounded-xl cursor-pointer transition-colors duration-200"
              style={{
                border: "2px dashed var(--border)",
                background: "var(--bg-hover)",
                height: posterPreview ? "auto" : "160px",
                minHeight: posterPreview ? "0" : "160px",
              }}
              onClick={() => fileInputRef.current.click()}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
            >
              {posterPreview ? (
                <div className="relative w-full">
                  <img
                    src={posterPreview}
                    alt="Preview"
                    className="w-full rounded-xl object-cover"
                    style={{ maxHeight: "220px", objectFit: "cover" }}
                  />
                  <div
                    className="absolute inset-0 flex items-center justify-center rounded-xl opacity-0 hover:opacity-100 transition-opacity duration-200"
                    style={{ background: "rgba(0,0,0,0.5)" }}
                  >
                    <p className="text-xs font-semibold text-white">Click to change</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3 py-8 px-4 text-center">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.3)" }}
                  >
                    <RiUploadCloud2Line size={22} style={{ color: "var(--accent)" }} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                      Drop poster here or click to browse
                    </p>
                    <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                      JPG, PNG, WebP — max 5MB
                    </p>
                  </div>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
              Title <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <input
              {...register("title", { required: "Title is required" })}
              placeholder="e.g. Inception"
              style={inputStyle}
            />
            {errors.title && (
              <p className="text-xs" style={{ color: "#ef4444" }}>{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
              Description
            </label>
            <textarea
              {...register("description")}
              placeholder="Brief overview of the movie..."
              rows={4}
              style={{ ...inputStyle, resize: "vertical", lineHeight: "1.6" }}
            />
          </div>

          {/* Release Date + Genre side by side */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                Release Date
              </label>
              <input
                {...register("releaseDate")}
                type="date"
                style={inputStyle}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                Genre
              </label>
              <select {...register("genre")} style={inputStyle}>
                <option value="">Select genre</option>
                {GENRES.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
          </div>

          {/* Category */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
              Category
            </label>
            <select {...register("category")} style={inputStyle}>
              <option value="">Select category</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Trailer URL */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
              Trailer URL
            </label>
            <input
              {...register("trailerUrl")}
              placeholder="https://youtube.com/watch?v=..."
              style={inputStyle}
            />
          </div>

          {/* Footer buttons */}
          <div className="flex gap-3 mt-auto pt-4" style={{ borderTop: "1px solid var(--border)" }}>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl text-sm font-semibold cursor-pointer transition-colors duration-200"
              style={{
                background: "var(--bg-hover)",
                border: "1px solid var(--border)",
                color: "var(--text-secondary)",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 rounded-xl text-sm font-bold text-white cursor-pointer transition-all duration-200 active:scale-95"
              style={{
                background: loading ? "var(--bg-hover)" : "var(--accent)",
                border: "none",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? "Saving…" : isEdit ? "Save Changes" : "Add Movie"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default MovieFormModal;
