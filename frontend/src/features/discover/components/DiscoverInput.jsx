import React, { useState } from "react";
import { RiSendPlane2Fill, RiSparklingFill } from "@remixicon/react";

/**
 * DiscoverInput Component
 * -----------------------
 * The AI chat-style input for solo discovery.
 * Shows example prompt pills on first load (before any history).
 * Supports Enter to submit, Shift+Enter for newlines.
 */
const examplePrompts = [
  "cozy movies for a rainy night",
  "something like Interstellar but more emotional",
  "80s action movies that are actually fun",
  "a movie to watch with my parents, nothing awkward",
  "mind-bending thriller, not too gory",
];

const DiscoverInput = ({ onSendMessage, isLoading, hasHistory }) => {
  const [input, setInput] = useState("");

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

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-4">

      {/* Example Prompts — shown only before first search */}
      {!hasHistory && !isLoading && (
        <div className="flex flex-wrap justify-center gap-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {examplePrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => onSendMessage(prompt)}
              className="px-4 py-2 rounded-full text-sm font-medium transition-all hover:-translate-y-0.5"
              style={{
                background: "var(--bg-secondary)",
                border: "1px solid var(--border)",
                color: "var(--text-secondary)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--accent)";
                e.currentTarget.style.color = "var(--accent)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border)";
                e.currentTarget.style.color = "var(--text-secondary)";
              }}
            >
              "{prompt}"
            </button>
          ))}
        </div>
      )}

      {/* Input Box */}
      <form
        onSubmit={handleSubmit}
        className="relative flex items-center w-full rounded-2xl overflow-hidden transition-all duration-200"
        style={{
          background: "var(--bg-secondary)",
          border: "1px solid var(--border)",
          boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = "var(--accent)";
          e.currentTarget.style.boxShadow = "0 0 0 3px var(--accent-light), 0 4px 24px rgba(0,0,0,0.12)";
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = "var(--border)";
          e.currentTarget.style.boxShadow = "0 4px 24px rgba(0,0,0,0.12)";
        }}
      >
        <div className="pl-4" style={{ color: isLoading ? "var(--accent)" : "var(--text-muted)" }}>
          <RiSparklingFill size={20} className={isLoading ? "animate-pulse" : ""} />
        </div>

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={hasHistory ? "Refine your search..." : "What are you in the mood for?"}
          className="flex-1 bg-transparent border-none py-4 px-4 text-base focus:outline-none"
          style={{ color: "var(--text-primary)" }}
          disabled={isLoading}
          autoFocus
        />

        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="mr-2 p-2.5 rounded-xl transition-all"
          style={{
            background: input.trim() && !isLoading ? "var(--accent)" : "var(--bg-hover)",
            color: input.trim() && !isLoading ? "#fff" : "var(--text-muted)",
          }}
        >
          {isLoading ? (
            <span
              className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin block"
              style={{ borderColor: "var(--accent) transparent var(--accent) var(--accent)" }}
            />
          ) : (
            <RiSendPlane2Fill size={18} />
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
