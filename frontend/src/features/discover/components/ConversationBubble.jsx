import React from "react";
import { RiUser3Line, RiSparkling2Fill } from "@remixicon/react";

/**
 * ConversationBubble Component
 * ----------------------------
 * Displays a single message in the conversation history.
 * Distinguishes visually between user messages and AI responses.
 */
const ConversationBubble = ({ message }) => {
  const isUser = message.role === "user";

  return (
    <div className={`flex w-full ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      <div 
        className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 flex gap-3 ${
          isUser 
            ? "bg-primary text-primary-content rounded-tr-sm" 
            : "bg-base-200 border border-base-300 text-base-content rounded-tl-sm shadow-sm"
        }`}
      >
        {/* Avatar/Icon */}
        <div className="flex-shrink-0 mt-0.5">
          {isUser ? (
            <div className="w-6 h-6 rounded-full bg-primary-content/20 flex items-center justify-center">
              <RiUser3Line size={14} />
            </div>
          ) : (
            <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center">
              <RiSparkling2Fill size={14} />
            </div>
          )}
        </div>

        {/* Message Content */}
        <div className="text-sm md:text-base leading-relaxed">
          {message.content}
        </div>
      </div>
    </div>
  );
};

export default ConversationBubble;
