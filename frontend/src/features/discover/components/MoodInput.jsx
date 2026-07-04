import { useRef, useEffect } from "react";
import { RiSparklingFill, RiSendPlaneFill, RiCloseLine } from "@remixicon/react";

/**
 * MoodInput
 * ---------
 * The hero input component on the Discover page.
 * A large, cinematic text area with animated placeholder suggestions.
 * On submit, calls handleSearch with the current text value.
 */

const SUGGESTIONS = [
  "Something intense and emotional, but not too heavy...",
  "A feel-good movie I can watch with family tonight",
  "I want to be on the edge of my seat - psychological thriller",
  "A visually stunning sci-fi with great world-building",
  "Light romantic comedy, nothing too serious",
  "A dark crime thriller with clever plot twists",
];

const MoodInput = ({ value, onChange, onSearch, onClear, isLoading }) => {
  const textareaRef = useRef(null);

  // Auto-focus on mount
  useEffect(() => {
    if (textareaRef.current) textareaRef.current.focus();
  }, []);

  const handleKeyDown = (e) => {
    // Submit on Enter (not Shift+Enter)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading && value.trim()) onSearch();
    }
  };

  const handleSuggestion = (text) => {
    onChange(text);
    onSearch(text);
  };

  return (
    <div style={{ width: "100%", maxWidth: 760, margin: "0 auto" }}>

      {/* ── Main Input Card ─────────────────────────────── */}
      <div
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 20,
          padding: "20px 24px",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          boxShadow: "0 8px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)",
          transition: "border-color 0.2s",
        }}
      >
        {/* Label row */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <RiSparklingFill size={16} style={{ color: "#a78bfa" }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Describe your mood
          </span>
        </div>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          id="mood-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g. Something thrilling but not violent, with a great story..."
          rows={3}
          style={{
            width: "100%",
            background: "transparent",
            border: "none",
            outline: "none",
            resize: "none",
            color: "var(--text-primary)",
            fontSize: 17,
            fontWeight: 400,
            lineHeight: 1.6,
            fontFamily: "inherit",
            caretColor: "#a78bfa",
          }}
        />

        {/* Actions row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 16, paddingTop: 14, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <span style={{ fontSize: 12, color: "var(--text-tertiary)" }}>
            Press Enter or click Search
          </span>

          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {value && (
              <button
                onClick={() => { onChange(""); onClear(); }}
                style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--text-secondary)", padding: "6px", borderRadius: 8, display: "flex", alignItems: "center" }}
                aria-label="Clear"
              >
                <RiCloseLine size={18} />
              </button>
            )}

            <button
              id="mood-search-btn"
              onClick={() => onSearch()}
              disabled={isLoading || !value.trim()}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "9px 20px",
                background: isLoading || !value.trim()
                  ? "rgba(167,139,250,0.2)"
                  : "linear-gradient(135deg, #7c3aed, #a78bfa)",
                border: "none",
                borderRadius: 12,
                color: isLoading || !value.trim() ? "var(--text-tertiary)" : "#fff",
                fontSize: 13,
                fontWeight: 600,
                cursor: isLoading || !value.trim() ? "not-allowed" : "pointer",
                transition: "all 0.2s",
                fontFamily: "inherit",
              }}
            >
              {isLoading ? (
                <>
                  <span style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", display: "inline-block", animation: "spin 0.8s linear infinite" }} />
                  Reading the room...
                </>
              ) : (
                <>
                  <RiSendPlaneFill size={14} />
                  Search
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── Quick Suggestion Pills ───────────────────────── */}
      {!value && (
        <div style={{ marginTop: 18, display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
          {SUGGESTIONS.slice(0, 4).map((s) => (
            <button
              key={s}
              onClick={() => handleSuggestion(s)}
              style={{
                padding: "7px 14px",
                background: "rgba(124,58,237,0.12)",
                border: "1px solid rgba(124,58,237,0.25)",
                borderRadius: 100,
                color: "var(--text-secondary)",
                fontSize: 12,
                cursor: "pointer",
                transition: "all 0.18s",
                fontFamily: "inherit",
                maxWidth: 280,
                textAlign: "left",
                lineHeight: 1.4,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(124,58,237,0.25)";
                e.currentTarget.style.color = "#fff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(124,58,237,0.12)";
                e.currentTarget.style.color = "var(--text-secondary)";
              }}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Spinner keyframe */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default MoodInput;
