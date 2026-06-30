import { useDispatch, useSelector } from "react-redux";
import { moodSearch, setQuery, clearResults } from "../discoverSlice";

/**
 * useDiscover — Layer 2 Hook
 * ---------------------------
 * Bridge between the UI and Redux.
 * Components consume this hook — they never touch Redux or services directly.
 *
 * Returns:
 *   query     - Current mood text
 *   status    - "idle" | "loading" | "succeeded" | "failed"
 *   results   - Array of TMDB movie objects
 *   rationale - AI-generated reason string
 *   params    - { genres, keywords, minRating, sortBy }
 *   error     - Error message string or null
 *   handleSearch  - Triggers the LLM → TMDB search
 *   handleClear   - Resets all state
 *   handleQueryChange - Updates query text in Redux
 */
const useDiscover = () => {
  const dispatch = useDispatch();
  const { query, status, results, rationale, params, error } = useSelector(
    (state) => state.discover
  );

  const handleSearch = (moodText) => {
    const text = (moodText || query).trim();
    if (!text) return;
    dispatch(moodSearch(text));
  };

  const handleClear = () => {
    dispatch(clearResults());
  };

  const handleQueryChange = (value) => {
    dispatch(setQuery(value));
  };

  return {
    query,
    status,
    results,
    rationale,
    params,
    error,
    isLoading: status === "loading",
    isSucceeded: status === "succeeded",
    handleSearch,
    handleClear,
    handleQueryChange,
  };
};

export default useDiscover;
