import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RiSearchLine, RiCloseLine } from "@remixicon/react";
import { setQuery } from "../../features/movies/searchSlice";
import useDebounce from "../hooks/useDebounce";

/**
 * SearchBar — Phase F6
 * -------------------
 * Global search input with smooth expansion and debouncing.
 * Dynamically updates URL query params.
 */
const SearchBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const reduxQuery = useSelector((state) => state.search.query);
  const [localQuery, setLocalQuery] = useState(reduxQuery);
  const [isExpanded, setIsExpanded] = useState(false);
  const inputRef = useRef(null);
  
  const debouncedQuery = useDebounce(localQuery, 500);

  // 1. Sync local state with URL if on search page (Mount or URL change)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get("q") || "";
    if (location.pathname === "/search" && q !== localQuery) {
      setLocalQuery(q);
      dispatch(setQuery(q));
    }
  }, [location.pathname, location.search, dispatch]);

  // 2. Navigate on DEBOUNCED query change ONLY IF FOCUSED
  // This prevents "snapback" when user navigates away via other links
  useEffect(() => {
    const isInputFocused = document.activeElement === inputRef.current;
    
    if (debouncedQuery.trim() && isInputFocused) {
      navigate(`/search?q=${encodeURIComponent(debouncedQuery.trim())}`);
    } else if (location.pathname === "/search" && !debouncedQuery.trim() && isInputFocused) {
      navigate("/search", { replace: true });
    }
    
    // Always sync redux if query changes (for SearchPage to catch up)
    dispatch(setQuery(debouncedQuery.trim()));
  }, [debouncedQuery, navigate, dispatch]); // Removed location.pathname

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
    if (!isExpanded) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleClear = () => {
    setLocalQuery("");
    inputRef.current?.focus();
  };

  return (
    <div 
      className={`relative flex items-center transition-all duration-300 ease-in-out ${
        isExpanded ? "w-48 md:w-64" : "w-10"
      }`}
    >
      {/* Search Icon / Toggle */}
      <button
        onClick={toggleExpand}
        className="flex items-center justify-center w-10 h-10 rounded-full cursor-pointer transition-colors"
        style={{
          background: isExpanded ? "transparent" : "var(--bg-hover)",
          border: isExpanded ? "none" : "1px solid var(--border)",
          color: "var(--text-secondary)",
        }}
        aria-label="Toggle search"
      >
        <RiSearchLine size={16} />
      </button>

      {/* Input */}
      <div 
        className={`absolute left-0 right-0 flex items-center h-9 ml-1 transition-opacity duration-300 ${
          isExpanded ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <input
          ref={inputRef}
          type="text"
          value={localQuery}
          onChange={(e) => setLocalQuery(e.target.value)}
          placeholder="Movies, TV, People..."
          className="w-full h-full bg-transparent outline-none text-xs font-medium px-8 rounded-full"
          style={{ 
            color: "var(--text-primary)", 
            background: "var(--bg-hover)",
            border: "1px solid var(--border)",
          }}
        />
        
        {/* Inner Search Icon */}
        <RiSearchLine 
          size={14} 
          className="absolute left-3" 
          style={{ color: "var(--text-muted)" }} 
        />

        {/* Clear Button */}
        {localQuery && (
          <button
            onClick={handleClear}
            className="absolute right-3 flex items-center justify-center cursor-pointer border-0 bg-transparent p-0"
            style={{ color: "var(--text-muted)" }}
          >
            <RiCloseLine size={14} />
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
