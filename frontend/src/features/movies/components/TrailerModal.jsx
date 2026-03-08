import { useEffect } from "react";
import { RiCloseLine } from "@remixicon/react";

/**
 * TrailerModal — Phase F5
 * -----------------------
 * Pure CSS overlay modal that embeds a YouTube trailer.
 * Closes via X button, click-outside, or Escape key.
 */
const TrailerModal = ({ videoKey, onClose }) => {
  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  if (!videoKey) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0, 0, 0, 0.85)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      {/* Modal content — stop propagation so clicking inside doesn't close */}
      <div
        className="relative w-full max-w-4xl animate-trailer-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 flex items-center justify-center w-10 h-10 rounded-full cursor-pointer border-0"
          style={{
            background: "rgba(255, 255, 255, 0.1)",
            backdropFilter: "blur(4px)",
            border: "1px solid rgba(255, 255, 255, 0.15)",
          }}
          aria-label="Close trailer"
        >
          <RiCloseLine size={22} style={{ color: "#fff" }} />
        </button>

        {/* 16:9 responsive iframe container */}
        <div
          className="relative w-full overflow-hidden rounded-xl"
          style={{
            aspectRatio: "16 / 9",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            boxShadow: "0 25px 80px rgba(0, 0, 0, 0.6)",
          }}
        >
          <iframe
            src={`https://www.youtube.com/embed/${videoKey}?autoplay=1&rel=0`}
            title="Movie Trailer"
            className="absolute inset-0 w-full h-full"
            style={{ border: "none" }}
            allow="autoplay; encrypted-media; fullscreen"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
};

export default TrailerModal;
