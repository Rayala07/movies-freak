import { RiSparklingLine } from "@remixicon/react";

const MoodRationale = ({ rationale, params, communityPicks }) => {
  if (!rationale) return null;

  const tags = [
    ...(params?.genres || []),
    ...(params?.keywords || []),
  ].filter(Boolean).slice(0, 6);

  const hasCommunity = communityPicks?.available && communityPicks?.count > 0;

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
        <p style={{ margin: 0, fontSize: 13, color: "var(--text-primary)", lineHeight: 1.5 }}>
          {rationale}
        </p>
      </div>

      {/* Community picks pill - only shown when consensus returned results */}
      {hasCommunity && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, paddingLeft: 25 }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              padding: "3px 10px",
              background: "rgba(249,115,22,0.12)",
              border: "1px solid rgba(249,115,22,0.3)",
              borderRadius: 100,
              fontSize: 11,
              color: "#fb923c",
              fontWeight: 600,
            }}
          >
            🧡 {communityPicks.count} Loved by the Community
          </span>
          <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
            · based on internet consensus
          </span>
        </div>
      )}

      {/* Interpreted AI tags */}
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
