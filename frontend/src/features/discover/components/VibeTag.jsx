import React from "react";

/**
 * Maps vibe tags to specific Tailwind color classes for a premium feel.
 * Any unrecognized vibe falls back to a neutral glassmorphic gray.
 */
const vibeColors = {
  cozy: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  dark: "bg-slate-800 text-slate-300 border-slate-700",
  "mind-bending": "bg-purple-500/20 text-purple-300 border-purple-500/30",
  emotional: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  thrilling: "bg-red-500/20 text-red-300 border-red-500/30",
  adventurous: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  nostalgic: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  weird: "bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/30",
  heartwarming: "bg-rose-500/20 text-rose-300 border-rose-500/30",
  intense: "bg-orange-600/20 text-orange-400 border-orange-600/30",
  dreamy: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
  gritty: "bg-stone-700/50 text-stone-300 border-stone-600",
  fun: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  epic: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  peaceful: "bg-teal-500/20 text-teal-300 border-teal-500/30",
  mysterious: "bg-violet-500/20 text-violet-300 border-violet-500/30",
  romantic: "bg-pink-500/20 text-pink-300 border-pink-500/30",
  inspiring: "bg-sky-500/20 text-sky-300 border-sky-500/30",
  haunting: "bg-zinc-800/80 text-zinc-300 border-zinc-700",
  whimsical: "bg-lime-500/20 text-lime-300 border-lime-500/30",
  default: "bg-gray-500/20 text-gray-300 border-gray-500/30",
};

/**
 * VibeTag Component
 * -----------------
 * A beautifully styled pill component that visually represents the mood
 * of the AI's recommendation.
 */
const VibeTag = ({ vibe = "" }) => {
  if (!vibe) return null;

  const normalizedVibe = vibe.toLowerCase().trim();
  const colorClass = vibeColors[normalizedVibe] || vibeColors.default;

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border backdrop-blur-md shadow-sm transition-all duration-300 hover:shadow-md ${colorClass}`}
    >
      #{normalizedVibe}
    </span>
  );
};

export default VibeTag;
