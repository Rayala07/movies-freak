import React, { useEffect, useState } from "react";
import { RiUser3Line, RiGroupLine, RiSparkling2Fill, RiRefreshLine } from "@remixicon/react";
import useDiscover from "../hooks/useDiscover";
import DiscoverInput from "../components/DiscoverInput";
import DiscoverResults from "../components/DiscoverResults";
import ConversationBubble from "../components/ConversationBubble";
import GroupMode from "../components/GroupMode";
import GroupSummary from "../components/GroupSummary";
import ResultsSkeleton from "../components/ResultsSkeleton";

/**
 * DiscoverPage
 * ------------
 * The main AI discovery page. Two modes:
 *
 *   Solo  — conversational, multi-turn, one person
 *   Group — shared session link, AI reconciles competing preferences
 *
 * The page handles all state transitions between modes, loading states,
 * errors, and results for both modes through the useDiscover hook.
 */
const DiscoverPage = () => {
  const [activeMode, setActiveMode] = useState("solo"); // 'solo' | 'group'
  const [groupSessionId, setGroupSessionId] = useState(null);
  const [isGroupMode, setIsGroupMode] = useState(false);

  const {
    messages,
    results,
    reasoning,
    vibeTag,
    isRelaxed,
    groupSummary,
    conflictNote,
    perPersonNotes,
    loading,
    groupLoading,
    error,
    groupError,
    sendMessage,
    sendGroupDiscover,
    resetDiscover,
  } = useDiscover();

  // Reset all state on unmount
  useEffect(() => {
    return () => resetDiscover();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleModeSwitch = (mode) => {
    resetDiscover();
    setGroupSessionId(null);
    setIsGroupMode(false);
    setActiveMode(mode);
  };

  // Called by GroupMode when all members have submitted and host clicks "Find Movies"
  const handleGroupDiscoverReady = (sessionId) => {
    setGroupSessionId(sessionId);
    setIsGroupMode(true);
    sendGroupDiscover(sessionId);
  };

  const hasHistory = messages.length > 0;
  const hasResults = results && results.length > 0;
  const isGroupResults = isGroupMode && hasResults && !groupLoading;
  const isAnyLoading = loading || groupLoading;
  const currentError = error || groupError;

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col">

      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <div className="text-center mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-4">
          <RiSparkling2Fill size={14} />
          Powered by Gemini AI
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-3" style={{ color: "var(--text-primary)" }}>
          AI Discover
        </h1>
        <p className="text-lg max-w-xl mx-auto" style={{ color: "var(--text-secondary)" }}>
          Tell AI what you're in the mood for — alone or with your whole group.
        </p>
      </div>

      {/* ── Mode Tabs ───────────────────────────────────────────────────── */}
      {!isGroupMode && (
        <div className="flex justify-center mb-8">
          <div
            className="flex gap-1 p-1 rounded-2xl"
            style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}
          >
            <button
              onClick={() => handleModeSwitch("solo")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                activeMode === "solo"
                  ? "bg-primary text-primary-content shadow-sm"
                  : "text-secondary-content hover:opacity-80"
              }`}
              style={activeMode !== "solo" ? { color: "var(--text-secondary)" } : {}}
            >
              <RiUser3Line size={16} />
              Solo
            </button>
            <button
              onClick={() => handleModeSwitch("group")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                activeMode === "group"
                  ? "bg-primary text-primary-content shadow-sm"
                  : "text-secondary-content hover:opacity-80"
              }`}
              style={activeMode !== "group" ? { color: "var(--text-secondary)" } : {}}
            >
              <RiGroupLine size={16} />
              Group
            </button>
          </div>
        </div>
      )}

      {/* ── Group Results Header (replaces tabs after group discover runs) ── */}
      {isGroupMode && (
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2 text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
            <RiGroupLine size={16} />
            Group Session Results
          </div>
          <button
            onClick={() => handleModeSwitch("group")}
            className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg transition-colors hover:opacity-70"
            style={{ color: "var(--text-muted)", border: "1px solid var(--border)" }}
          >
            <RiRefreshLine size={14} />
            New Session
          </button>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* ── SOLO MODE ─────────────────────────────────────────────────── */}
      {/* ════════════════════════════════════════════════════════════════ */}
      {activeMode === "solo" && !isGroupMode && (
        <>
          {/* Input — sticky after first query */}
          <div className={`transition-all duration-500 z-20 ${hasHistory ? "sticky top-20 mb-8" : "mb-0 mt-4"}`}>
            <DiscoverInput
              onSendMessage={sendMessage}
              isLoading={loading}
              hasHistory={hasHistory}
            />
          </div>

          {/* Error */}
          {error && (
            <div
              className="text-center mt-8 p-4 rounded-xl text-sm max-w-2xl mx-auto"
              style={{
                background: "rgba(239, 68, 68, 0.08)",
                border: "1px solid rgba(239, 68, 68, 0.2)",
                color: "var(--error)",
              }}
            >
              {error}
            </div>
          )}

          {/* Results Section */}
          <div className="flex-1 mt-8 relative">
            {/* Loading state */}
            {loading && !hasHistory && <ResultsSkeleton />}

            {/* Inline loading indicator (follow-up queries) */}
            {loading && hasHistory && (
              <div className="flex items-center gap-3 my-6 justify-center" style={{ color: "var(--accent)" }}>
                <RiSparkling2Fill size={20} className="animate-pulse" />
                <span className="text-sm font-medium animate-pulse">Thinking...</span>
              </div>
            )}

            {/* Chat history + results */}
            {hasHistory && (
              <div className="flex flex-col gap-8">
                {/* Older messages (dimmed for focus) */}
                {messages.length > 2 && (
                  <div className="flex flex-col gap-2 opacity-40 hover:opacity-80 transition-opacity duration-500">
                    {messages.slice(0, messages.length - (loading ? 1 : 2)).map((msg, idx) => (
                      <ConversationBubble key={idx} message={msg} />
                    ))}
                  </div>
                )}

                {/* Most recent user message */}
                {!loading && messages.length >= 2 && messages[messages.length - 2]?.role === "user" && (
                  <ConversationBubble message={messages[messages.length - 2]} />
                )}
                {loading && messages.length >= 1 && messages[messages.length - 1]?.role === "user" && (
                  <ConversationBubble message={messages[messages.length - 1]} />
                )}

                {/* Results */}
                {!loading && (
                  <DiscoverResults
                    results={results}
                    reasoning={reasoning}
                    vibeTag={vibeTag}
                    isRelaxed={isRelaxed}
                  />
                )}
              </div>
            )}

            {/* No results state */}
            {!loading && hasHistory && !hasResults && !error && (
              <div className="text-center mt-16">
                <p className="text-2xl font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
                  No movies found
                </p>
                <p style={{ color: "var(--text-secondary)" }}>
                  Try broadening your description or use different words.
                </p>
              </div>
            )}
          </div>
        </>
      )}

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* ── GROUP MODE — Setup / Waiting Room ─────────────────────────── */}
      {/* ════════════════════════════════════════════════════════════════ */}
      {activeMode === "group" && !isGroupMode && (
        <div className="mt-4 flex-1">
          <GroupMode onGroupDiscoverReady={handleGroupDiscoverReady} />
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* ── GROUP MODE — AI is reconciling ─────────────────────────────── */}
      {/* ════════════════════════════════════════════════════════════════ */}
      {isGroupMode && groupLoading && (
        <div className="flex-1 mt-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3" style={{ color: "var(--accent)" }}>
              <RiSparkling2Fill size={28} className="animate-pulse" />
              <span className="text-lg font-medium animate-pulse">AI is reconciling everyone's tastes...</span>
            </div>
            <p className="text-sm mt-2" style={{ color: "var(--text-muted)" }}>
              This usually takes 5–10 seconds
            </p>
          </div>
          <ResultsSkeleton />
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* ── GROUP MODE — Results ────────────────────────────────────────── */}
      {/* ════════════════════════════════════════════════════════════════ */}
      {isGroupResults && (
        <div className="flex-1 flex flex-col gap-8 mt-4">
          {/* Group analysis panel */}
          <GroupSummary
            reasoning={reasoning}
            vibeTag={vibeTag}
            groupSummary={groupSummary}
            conflictNote={conflictNote}
            perPersonNotes={perPersonNotes}
          />

          {/* Movie grid */}
          <DiscoverResults
            results={results}
            reasoning={null}  // GroupSummary already shows reasoning
            vibeTag={null}    // GroupSummary already shows vibe tag
            isRelaxed={isRelaxed}
          />
        </div>
      )}

      {/* Group error state */}
      {isGroupMode && groupError && !groupLoading && (
        <div className="mt-8 text-center">
          <div
            className="inline-block p-4 rounded-xl text-sm"
            style={{
              background: "rgba(239, 68, 68, 0.08)",
              border: "1px solid rgba(239, 68, 68, 0.2)",
              color: "var(--error)",
            }}
          >
            {groupError}
          </div>
          <div className="mt-4">
            <button
              onClick={() => sendGroupDiscover(groupSessionId)}
              className="flex items-center gap-2 mx-auto px-4 py-2 rounded-xl text-sm font-medium bg-primary text-primary-content hover:bg-primary/90 transition-colors"
            >
              <RiRefreshLine size={16} />
              Try Again
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default DiscoverPage;
