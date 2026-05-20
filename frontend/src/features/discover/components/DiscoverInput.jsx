import React, { useState } from "react";
import { RiSendPlane2Fill, RiSparklingFill } from "@remixicon/react";

const examplePrompts = [
  "cozy movies for a rainy night",
  "something like Interstellar but more emotional",
  "80s action movies that are actually fun",
  "a movie to watch with my parents, nothing awkward",
  "mind-bending thriller, not too gory",
];

const DiscoverInput = ({ onSendMessage, isLoading, hasHistory }) => {
  const [input, setInput] = useState("");
  const [focused, setFocused] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const canSubmit = input.trim() && !isLoading;

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-4">

      {/* ── Prompt Pills ─────────────────────────────────────────── */}
      {!hasHistory && !isLoading && (
        <div className="flex flex-wrap justify-center gap-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {examplePrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => onSendMessage(prompt)}
              className="group px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
              style={{
                background: "var(--bg-secondary)",
                border: "1px solid var(--border)",
                color: "var(--text-secondary)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "linear-gradient(135deg, rgba(var(--accent-rgb, 139,92,246),0.12), rgba(var(--accent-rgb, 139,92,246),0.05))";
                e.currentTarget.style.borderColor = "var(--accent)";
                e.currentTarget.style.color = "var(--accent)";
                e.currentTarget.style.boxShadow = "0 4px 16px rgba(139,92,246,0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "var(--bg-secondary)";
                e.currentTarget.style.borderColor = "var(--border)";
                e.currentTarget.style.color = "var(--text-secondary)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              ✦ {prompt}
            </button>
          ))}
        </div>
      )}

      {/* ── Input Box ────────────────────────────────────────────── */}
      <form
        onSubmit={handleSubmit}
        className="relative flex items-center w-full rounded-2xl overflow-hidden transition-all duration-300"
        style={{
          background: "var(--bg-secondary)",
          border: `1.5px solid ${focused ? "var(--accent)" : "var(--border)"}`,
          boxShadow: focused
            ? "0 0 0 3px rgba(139,92,246,0.12), 0 8px 32px rgba(0,0,0,0.16)"
            : "0 4px 20px rgba(0,0,0,0.1)",
        }}
      >
        {/* Sparkle icon */}
        <div
          className="pl-4 flex-shrink-0 transition-all duration-300"
          style={{ color: isLoading ? "var(--accent)" : focused ? "var(--accent)" : "var(--text-muted)" }}
        >
          <RiSparklingFill size={20} className={isLoading ? "animate-pulse" : ""} />
        </div>

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={hasHistory ? "Refine your search..." : "What are you in the mood for?"}
          className="flex-1 bg-transparent border-none py-4 px-4 text-base focus:outline-none"
          style={{ color: "var(--text-primary)" }}
          disabled={isLoading}
          autoFocus
        />

        {/* Send button — premium gradient */}
        <button
          type="submit"
          disabled={!canSubmit}
          className="mr-2 flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200"
          style={{
            background: canSubmit
              ? "linear-gradient(135deg, #7c3aed, #a855f7)"
              : "var(--bg-hover)",
            color: canSubmit ? "#fff" : "var(--text-muted)",
            boxShadow: canSubmit ? "0 4px 14px rgba(124,58,237,0.4)" : "none",
            transform: canSubmit ? "scale(1)" : "scale(0.95)",
          }}
          onMouseEnter={(e) => {
            if (canSubmit) {
              e.currentTarget.style.boxShadow = "0 6px 20px rgba(124,58,237,0.55)";
              e.currentTarget.style.transform = "scale(1.05)";
            }
          }}
          onMouseLeave={(e) => {
            if (canSubmit) {
              e.currentTarget.style.boxShadow = "0 4px 14px rgba(124,58,237,0.4)";
              e.currentTarget.style.transform = "scale(1)";
            }
          }}
        >
          {isLoading ? (
            <span
              className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin block"
              style={{ borderColor: "var(--accent) transparent var(--accent) var(--accent)" }}
            />
          ) : (
            <RiSendPlane2Fill size={17} />
          )}
        </button>
      </form>

      {!hasHistory && (
        <p className="text-center text-xs" style={{ color: "var(--text-muted)" }}>
          Be as descriptive as you like — mood, reference movies, time period, anything.
        </p>
      )}
    </div>
  );
};

export default DiscoverInput;
