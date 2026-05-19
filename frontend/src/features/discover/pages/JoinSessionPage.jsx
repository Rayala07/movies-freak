import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { RiSparkling2Fill, RiCheckLine } from "@remixicon/react";
import discoverService from "../services/discoverService";
import toast from "react-hot-toast";

/**
 * JoinSessionPage
 * ---------------
 * The page guests see when they open a shared session link.
 * No login required.
 *
 * Route: /discover/:sessionId
 * 
 * States:
 *   "loading"   → fetching session details
 *   "input"     → show name + preference form
 *   "submitted" → success state, tell user to wait
 *   "error"     → session not found / expired
 */
const JoinSessionPage = () => {
  const { sessionId } = useParams();
  const [pageState, setPageState] = useState("loading");
  const [session, setSession] = useState(null);
  const [memberName, setMemberName] = useState("");
  const [preferenceText, setPreferenceText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch session info on mount to validate the link
  useEffect(() => {
    const loadSession = async () => {
      try {
        const data = await discoverService.getSession(sessionId);
        setSession(data.session);
        setPageState("input");
      } catch {
        setPageState("error");
      }
    };
    loadSession();
  }, [sessionId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!memberName.trim() || !preferenceText.trim()) return;

    setIsSubmitting(true);
    try {
      await discoverService.joinSession(sessionId, memberName, preferenceText);
      setPageState("submitted");
    } catch (error) {
      const msg = error?.response?.data?.message || "Could not submit. Please try again.";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Loading ───────────────────────────────────────────────────────────────
  if (pageState === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────────
  if (pageState === "error") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
        <h1 className="text-3xl font-bold">Session Not Found</h1>
        <p className="text-base-content/60 max-w-sm">
          This room doesn't exist or has expired. Ask your host to create a new one.
        </p>
      </div>
    );
  }

  // ── Submitted ─────────────────────────────────────────────────────────────
  if (pageState === "submitted") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-5 text-center px-4 animate-in fade-in duration-500">
        <div className="w-16 h-16 rounded-full bg-success/20 text-success flex items-center justify-center">
          <RiCheckLine size={32} />
        </div>
        <h1 className="text-3xl font-bold">You're in!</h1>
        <p className="text-base-content/60 max-w-sm">
          Your preference has been submitted. Once everyone's in, {session?.hostName} will
          find movies for the group. You can keep this tab open.
        </p>
      </div>
    );
  }

  // ── Input Form ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/15 rounded-full text-primary text-sm font-medium mb-4">
            <RiSparkling2Fill size={16} />
            Movie Night
          </div>
          <h1 className="text-3xl font-bold mb-2">
            {session?.hostName}'s Group
          </h1>
          <p className="text-base-content/60 text-sm">
            Tell us what you're in the mood for. No one else can see your answer.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-base-content/80">Your name</label>
            <input
              type="text"
              value={memberName}
              onChange={(e) => setMemberName(e.target.value)}
              placeholder="e.g., Ananya"
              maxLength={30}
              className="w-full px-4 py-3 rounded-xl bg-base-200 border border-base-300 focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition-all"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-base-content/80">
              What are you in the mood for?
            </label>
            <textarea
              value={preferenceText}
              onChange={(e) => setPreferenceText(e.target.value)}
              placeholder="e.g., something funny, nothing too intense, I'd love a heist movie..."
              rows={3}
              maxLength={500}
              className="w-full px-4 py-3 rounded-xl bg-base-200 border border-base-300 focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition-all resize-none"
              required
            />
            <span className="text-xs text-base-content/40 text-right">
              {preferenceText.length}/500
            </span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !memberName.trim() || !preferenceText.trim()}
            className="w-full py-4 rounded-2xl bg-primary text-primary-content font-bold text-base flex items-center justify-center gap-2 hover:bg-primary/90 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:scale-100"
          >
            {isSubmitting ? (
              <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : null}
            {isSubmitting ? "Submitting..." : "Submit My Pick"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default JoinSessionPage;
