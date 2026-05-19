import React, { useState } from "react";
import { RiGroupLine, RiArrowRightLine, RiSparkling2Fill } from "@remixicon/react";
import discoverService from "../services/discoverService";
import toast from "react-hot-toast";
import WaitingRoom from "./WaitingRoom";

/**
 * GroupMode Component
 * -------------------
 * Handles the host flow for creating a group session.
 *
 * States:
 *   "setup"    → choose member count, click Create Room
 *   "waiting"  → show WaitingRoom (share link, poll for submissions)
 *   "results"  → Phase 6: will render GroupSummary + DiscoverResults
 */
const GroupMode = ({ onGroupDiscoverReady }) => {
  const [step, setStep] = useState("setup");
  const [expectedMembers, setExpectedMembers] = useState(3);
  const [sessionId, setSessionId] = useState(null);
  const [session, setSession] = useState(null);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateSession = async () => {
    setIsCreating(true);
    try {
      const data = await discoverService.createSession(expectedMembers);
      setSessionId(data.sessionId);
      setSession({ expectedMembers, hostName: "You" });
      setStep("waiting");
    } catch (error) {
      const msg = error?.response?.data?.message || "Could not create session. Please try again.";
      toast.error(msg);
    } finally {
      setIsCreating(false);
    }
  };

  // Called from WaitingRoom when all members have submitted
  const handleReadyToDiscover = () => {
    // Notify the parent (DiscoverPage) with the sessionId
    // Phase 6 will do the actual AI call here
    onGroupDiscoverReady(sessionId);
  };

  // ── Render: Setup Step ────────────────────────────────────────────────────
  if (step === "setup") {
    return (
      <div className="w-full max-w-md mx-auto flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary/15 rounded-full text-secondary text-sm font-medium mb-4">
            <RiGroupLine size={16} />
            Group Mode
          </div>
          <h2 className="text-2xl font-bold mb-2">Movie Night for Everyone</h2>
          <p className="text-base-content/60 text-sm">
            Create a room, share the link, and everyone picks their mood independently.
            AI will find movies that make the whole group happy.
          </p>
        </div>

        {/* Member Count Picker */}
        <div className="bg-base-200 border border-base-300 rounded-2xl p-5 flex flex-col gap-4">
          <label className="text-sm font-semibold text-base-content/80">
            How many people in your group?
          </label>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setExpectedMembers(m => Math.max(2, m - 1))}
              className="w-10 h-10 rounded-xl bg-base-300 text-base-content font-bold text-xl hover:bg-base-content hover:text-base-100 transition-colors"
            >
              −
            </button>
            <span className="text-4xl font-bold text-primary w-12 text-center">
              {expectedMembers}
            </span>
            <button
              onClick={() => setExpectedMembers(m => Math.min(10, m + 1))}
              className="w-10 h-10 rounded-xl bg-base-300 text-base-content font-bold text-xl hover:bg-base-content hover:text-base-100 transition-colors"
            >
              +
            </button>
            <span className="text-base-content/60 text-sm ml-2">people</span>
          </div>
          <p className="text-xs text-base-content/40">
            Each person will get their own private input — no one sees what others type.
          </p>
        </div>

        {/* Create Button */}
        <button
          onClick={handleCreateSession}
          disabled={isCreating}
          className="w-full py-4 rounded-2xl bg-primary text-primary-content font-bold text-lg flex items-center justify-center gap-3 hover:bg-primary/90 transition-all hover:scale-[1.02] disabled:opacity-60 disabled:scale-100"
        >
          {isCreating ? (
            <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <RiArrowRightLine size={22} />
          )}
          {isCreating ? "Creating room..." : "Create Room"}
        </button>
      </div>
    );
  }

  // ── Render: Waiting Room Step ──────────────────────────────────────────────
  if (step === "waiting") {
    return (
      <WaitingRoom
        session={session}
        sessionId={sessionId}
        onReadyToDiscover={handleReadyToDiscover}
      />
    );
  }

  return null;
};

export default GroupMode;
