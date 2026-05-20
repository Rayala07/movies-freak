import React, { useEffect } from "react";
import { RiSparkling2Fill } from "@remixicon/react";
import useDiscover from "../hooks/useDiscover";
import DiscoverInput from "../components/DiscoverInput";
import DiscoverResults from "../components/DiscoverResults";
import ConversationBubble from "../components/ConversationBubble";
import ResultsSkeleton from "../components/ResultsSkeleton";

/**
 * DiscoverPage
 * ------------
 * The main AI discovery page for Solo mode.
 */
const DiscoverPage = () => {
  const {
    messages,
    results,
    reasoning,
    vibeTag,
    isRelaxed,
    loading,
    error,
    sendMessage,
    resetDiscover,
  } = useDiscover();

  // Reset all state on unmount
  useEffect(() => {
    return () => resetDiscover();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const hasHistory = messages.length > 0;
  const hasResults = results && results.length > 0;

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
          Tell AI what you're in the mood for.
        </p>
      </div>

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

    </div>
  );
};

export default DiscoverPage;
