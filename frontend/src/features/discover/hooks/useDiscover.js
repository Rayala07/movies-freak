import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  fetchAIDiscovery,
  clearDiscoverError,
  clearDiscoverState,
  addUserMessage,
} from "../discoverSlice";

/**
 * useDiscover Hook (Layer 2)
 * --------------------------
 * Bridge between UI components and Redux state for AI discovery.
 */
const useDiscover = () => {
  const dispatch = useDispatch();
  const state = useSelector((state) => state.discover);

  /**
   * Send a message to the AI.
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
   * Reset the entire discover state (called on unmount).
   */
  const resetDiscover = () => {
    dispatch(clearDiscoverState());
  };

  return {
    ...state,
    sendMessage,
    resetDiscover,
  };
};

export default useDiscover;
