import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  fetchAIDiscovery,
  fetchGroupDiscovery,
  clearDiscoverError,
  clearDiscoverState,
  addUserMessage,
} from "../discoverSlice";

/**
 * useDiscover Hook (Layer 2)
 * --------------------------
 * Bridge between UI components and Redux state for AI discovery.
 * Handles both Solo and Group mode actions.
 */
const useDiscover = () => {
  const dispatch = useDispatch();
  const state = useSelector((state) => state.discover);

  /**
   * Solo mode — send a message to the AI.
   * Appends user message to history, then dispatches the thunk.
   */
  const sendMessage = async (text) => {
    if (!text.trim()) return;
    dispatch(clearDiscoverError());
    dispatch(addUserMessage(text));

    const result = await dispatch(
      fetchAIDiscovery({
        message: text,
        conversationHistory: state.messages,
      })
    );

    if (fetchAIDiscovery.rejected.match(result)) {
      toast.error(result.payload || "AI failed to respond. Please try again.");
    }
  };

  /**
   * Group mode — trigger reconciliation for a completed session.
   * @param {string} sessionId - The session ID to reconcile
   */
  const sendGroupDiscover = async (sessionId) => {
    const result = await dispatch(fetchGroupDiscovery({ sessionId }));
    if (fetchGroupDiscovery.rejected.match(result)) {
      toast.error(result.payload || "AI failed to reconcile group preferences.");
    }
  };

  /**
   * Reset the entire discover state (called on unmount or mode switch).
   */
  const resetDiscover = () => {
    dispatch(clearDiscoverState());
  };

  return {
    ...state,
    sendMessage,
    sendGroupDiscover,
    resetDiscover,
  };
};

export default useDiscover;
