import React from "react";
import { RiGroupLine, RiAlertLine, RiCheckLine } from "@remixicon/react";
import VibeTag from "./VibeTag";

/**
 * GroupSummary Component
 * ----------------------
 * Displays the AI's group analysis panel:
 *   - The overall reasoning / common ground found
 *   - The vibe tag
 *   - The group summary (2-3 sentences of the compromise explanation)
 *   - The conflict note if tastes clashed
 *   - Per-person compatibility notes
 *
 * This transparency is what makes the feature feel intelligent.
 */
const GroupSummary = ({ reasoning, vibeTag, groupSummary, conflictNote, perPersonNotes = [] }) => {
  if (!reasoning) return null;

  return (
    <div className="w-full flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700">

      {/* Main Reasoning Card */}
      <div className="bg-base-200/50 backdrop-blur-md rounded-2xl p-6 border border-base-300 shadow-sm relative overflow-hidden">
        {/* Decorative glow */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col gap-4">
          {/* Header row */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 text-primary text-sm font-semibold uppercase tracking-wider">
              <RiGroupLine size={16} />
              Group Analysis
            </div>
            <VibeTag vibe={vibeTag} />
          </div>

          {/* Core reasoning */}
          <p className="text-xl font-medium text-base-content leading-relaxed">
            {reasoning}
          </p>

          {/* Group Summary */}
          {groupSummary && (
            <p className="text-base text-base-content/70 leading-relaxed border-t border-base-300 pt-4">
              {groupSummary}
            </p>
          )}

          {/* Conflict Note */}
          {conflictNote && (
            <div className="flex items-start gap-2 text-sm text-warning/90 bg-warning/10 border border-warning/20 rounded-xl px-4 py-3">
              <RiAlertLine size={16} className="flex-shrink-0 mt-0.5" />
              <span>{conflictNote}</span>
            </div>
          )}
        </div>
      </div>

      {/* Per-Person Compatibility Cards */}
      {perPersonNotes.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {perPersonNotes.map((note, idx) => (
            <div
              key={idx}
              className="bg-base-200/40 border border-base-300 rounded-xl p-4 flex flex-col gap-2 animate-in fade-in slide-in-from-bottom-4"
              style={{ animationDelay: `${idx * 80}ms`, animationFillMode: "both" }}
            >
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-success/20 text-success flex items-center justify-center flex-shrink-0">
                  <RiCheckLine size={14} />
                </div>
                <span className="font-semibold text-sm text-base-content">{note.name}</span>
              </div>
              <p className="text-xs text-base-content/60 leading-relaxed pl-9">
                {note.compatibility}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GroupSummary;
