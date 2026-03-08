import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { performSearch, clearSearch } from "../searchSlice";
import MovieGrid from "../components/MovieGrid";
import useInfiniteScroll from "../../../shared/hooks/useInfiniteScroll";
import { RiSearchLine, RiInformationLine } from "@remixicon/react";

/**
 * SearchPage — Phase F6
 * -------------------
 * Displays search results for movies, TV shows, and people.
 * Reuses MovieGrid and handles infinite scroll.
 */
const SearchPage = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const { results, page, loading, hasMore, totalResults } = useSelector(
    (state) => state.search
  );

  // Extract query from URL
  const query = new URLSearchParams(location.search).get("q") || "";

  // Trigger search when query changes
  useEffect(() => {
    if (query) {
      dispatch(clearSearch());
      dispatch(performSearch({ query, page: 1 }));
    } else {
      dispatch(clearSearch());
    }
  }, [query, dispatch]);

  const handleLoadMore = () => {
    if (!loading && hasMore && query) {
      dispatch(performSearch({ query, page }));
    }
  };

  const lastElementRef = useInfiniteScroll(handleLoadMore, hasMore, loading);

  return (
    <div className="min-h-screen pt-12" style={{ background: "var(--bg-primary)" }}>
      <div className="section-container">
        
        {/* Header */}
        <div className="flex flex-col gap-2 mb-8 animate-in">
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
            <RiSearchLine size={28} className="text-accent" style={{ color: "var(--accent)" }} />
            {query ? (
              <span>Search results for "{query}"</span>
            ) : (
              <span>Explore Everything</span>
            )}
          </h1>
          {query && !loading && (
            <p className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>
              Found {totalResults.toLocaleString()} results
            </p>
          )}
        </div>

        {/* Results Grid */}
        <main className="animate-in delay-100">
          {results.length > 0 ? (
            <MovieGrid 
              movies={results} 
              loading={loading} 
              sentinelRef={lastElementRef} 
            />
          ) : !loading && query ? (
            // No results found
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div 
                className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
                style={{ background: "var(--bg-hover)", border: "1px solid var(--border)" }}
              >
                <RiInformationLine size={40} style={{ color: "var(--text-muted)" }} />
              </div>
              <h2 className="text-xl font-bold mb-2">No results found</h2>
              <p className="max-w-xs text-sm" style={{ color: "var(--text-muted)" }}>
                We couldn't find anything matching "{query}". Try checking for typos or searching something else.
              </p>
            </div>
          ) : !loading && !query ? (
            // Idle / empty search
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div 
                className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
                style={{ background: "var(--bg-hover)", border: "1px solid var(--border)" }}
              >
                <RiSearchLine size={40} style={{ color: "var(--text-muted)" }} />
              </div>
              <h2 className="text-xl font-bold mb-2">Ready to search?</h2>
              <p className="max-w-xs text-sm" style={{ color: "var(--text-muted)" }}>
                Search for your favorite movies, TV shows, actors, and directors.
              </p>
            </div>
          ) : null}

          {/* Loading indicator for pagination */}
          {loading && results.length > 0 && (
            <div className="py-12 flex justify-center">
              <div className="w-8 h-8 rounded-full border-2 border-t-accent animate-spin" style={{ borderColor: "var(--border)", borderTopColor: "var(--accent)" }} />
            </div>
          )}
        </main>

        {/* End of list message */}
        {!hasMore && results.length > 0 && (
          <div className="text-center py-12 text-xs font-medium" style={{ color: "var(--text-muted)" }}>
            That's all the results we have for now. ✨
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
