import { RiSparklingLine } from "@remixicon/react";

/**
 * MoodRationale
 * -------------
 * Displays the AI-generated one-liner explaining why these movies were picked.
 * Also shows the interpreted genre/keyword tags so the user can trust the AI's logic.
 */
const MoodRationale = ({ rationale, params }) => {
  if (!rationale) return null;

  const tags = [
    ...(params?.genres || []),
    ...(params?.keywords || []),
  ].filter(Boolean).slice(0, 6);

  return (
    <div
      style={{
        maxWidth: 760,
        margin: "0 auto 28px",
        padding: "14px 20px",
        background: "rgba(124,58,237,0.08)",
        border: "1px solid rgba(124,58,237,0.2)",
        borderRadius: 14,
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      {/* Rationale line */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
        <RiSparklingLine
          size={15}
          style={{ color: "#a78bfa", flexShrink: 0, marginTop: 2 }}
        />
        <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.75)", lineHeight: 1.5 }}>
          {rationale}
        </p>
      </div>

      {/* Interpreted tags */}
      {tags.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, paddingLeft: 25 }}>
          {tags.map((tag) => (
            <span
              key={tag}
              style={{
                padding: "3px 10px",
                background: "rgba(167,139,250,0.15)",
                border: "1px solid rgba(167,139,250,0.25)",
                borderRadius: 100,
                fontSize: 11,
                color: "#c4b5fd",
                fontWeight: 500,
                textTransform: "capitalize",
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default MoodRationale;
