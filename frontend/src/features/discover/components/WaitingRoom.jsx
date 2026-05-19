import React, { useState } from "react";
import { RiGroupLine, RiSparklingFill, RiCheckLine, RiTimeLine } from "@remixicon/react";
import discoverService from "../services/discoverService";
import toast from "react-hot-toast";

/**
 * WaitingRoom Component
 * ---------------------
 * Displayed to the host after creating a group session.
 * Shows the shareable link, who has submitted, and
 * activates the "Find Movies" button when everyone is in.
 *
 * Polls the backend every 3 seconds for updates.
 */
const WaitingRoom = ({ session, sessionId, onReadyToDiscover }) => {
  const [members, setMembers] = React.useState([]);
  const [isCopied, setIsCopied] = React.useState(false);

  const shareUrl = `${window.location.origin}/discover/${sessionId}`;
  const submittedCount = members.length;
  const isReady = submittedCount >= session.expectedMembers;

  // Poll every 3 seconds for member updates
  React.useEffect(() => {
    const poll = async () => {
      try {
        const data = await discoverService.getSession(sessionId);
        setMembers(data.members || []);
      } catch {
        // Silently fail — if the session expired, the next poll
        // will also fail and the user can just refresh
      }
    };

    // Poll immediately on mount, then every 3 seconds
    poll();
    const interval = setInterval(poll, 3000);
    return () => clearInterval(interval);
  }, [sessionId]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setIsCopied(true);
      toast.success("Link copied!");
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      toast.error("Could not copy link.");
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/15 rounded-full text-primary text-sm font-medium mb-3">
          <RiGroupLine size={16} />
          Group Session
        </div>
        <h2 className="text-2xl font-bold">Waiting for your crew</h2>
        <p className="text-base-content/60 mt-1">
          Share the link below. Everyone submits independently, then you find movies together.
        </p>
      </div>

      {/* Share Link Box */}
      <div className="bg-base-200 border border-base-300 rounded-2xl p-4 flex items-center gap-3">
        <div className="flex-1 text-sm text-base-content/70 truncate font-mono">
          {shareUrl}
        </div>
        <button
          onClick={handleCopy}
          className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            isCopied
              ? "bg-success/20 text-success border border-success/30"
              : "bg-primary text-primary-content hover:bg-primary/90"
          }`}
        >
          {isCopied ? <RiCheckLine size={16} /> : null}
          {isCopied ? "Copied!" : "Copy Link"}
        </button>
      </div>

      {/* Member Status */}
      <div className="bg-base-200 border border-base-300 rounded-2xl p-5 flex flex-col gap-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-semibold text-base-content/80 uppercase tracking-wider">
            Submissions
          </span>
          <span className="text-sm font-bold text-primary">
            {submittedCount} / {session.expectedMembers}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-base-300 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-700"
            style={{ width: `${(submittedCount / session.expectedMembers) * 100}%` }}
          />
        </div>

        {/* Member List */}
        <div className="flex flex-col gap-2 mt-2">
          {/* Submitted members */}
          {members.map((m, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-success/20 text-success flex items-center justify-center">
                <RiCheckLine size={14} />
              </div>
              <span className="text-base-content font-medium">{m.name}</span>
              <span className="text-xs text-success ml-auto">submitted ✓</span>
            </div>
          ))}

          {/* Pending slots */}
          {Array.from({ length: session.expectedMembers - submittedCount }).map((_, idx) => (
            <div key={`pending-${idx}`} className="flex items-center gap-3 opacity-40">
              <div className="w-8 h-8 rounded-full bg-base-300 flex items-center justify-center">
                <RiTimeLine size={14} className="text-base-content/50" />
              </div>
              <span className="text-base-content/50 italic text-sm">waiting...</span>
            </div>
          ))}
        </div>
      </div>

      {/* Find Movies Button */}
      <button
        onClick={onReadyToDiscover}
        disabled={!isReady}
        className={`w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all duration-300 ${
          isReady
            ? "bg-primary text-primary-content hover:bg-primary/90 shadow-xl shadow-primary/25 scale-100 hover:scale-[1.02]"
            : "bg-base-200 text-base-content/30 cursor-not-allowed"
        }`}
      >
        <RiSparklingFill size={22} className={isReady ? "animate-pulse" : ""} />
        {isReady ? "Find Movies for Everyone 🎬" : `Waiting for ${session.expectedMembers - submittedCount} more...`}
      </button>
    </div>
  );
};

export default WaitingRoom;
