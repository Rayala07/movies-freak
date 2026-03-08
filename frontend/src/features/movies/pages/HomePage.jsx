import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchTrendingHeroes, fetchDiscoveryMovies } from "../movieSlice";
import useInfiniteScroll from "../../../shared/hooks/useInfiniteScroll";
import Hero from "../components/Hero";
import MovieGrid from "../components/MovieGrid";
import TrendingStrip from "../components/TrendingStrip";

/**
 * HomePage — Phase F4 (Revamped)
 * ------------------------------
 * Cinematic Hero carousel + Trending strip + Infinite Discovery grid.
 * Hero overlaps behind navbar via negative margin (-mt-14).
 */
const HomePage = () => {
  const dispatch = useDispatch();
  const {
    heroMovies,
    discoveryMovies,
    page,
    loading,
    hasMore,
    heroLoading,
  } = useSelector((state) => state.movies);

  // 1. Initial Load
  useEffect(() => {
    if (heroMovies.length === 0) dispatch(fetchTrendingHeroes());
    if (discoveryMovies.length === 0) dispatch(fetchDiscoveryMovies(1));
  }, [dispatch, heroMovies.length, discoveryMovies.length]);

  // 2. Infinite Scroll
  const handleLoadMore = () => {
    if (!loading && hasMore) {
      dispatch(fetchDiscoveryMovies(page));
    }
  };
  const lastElementRef = useInfiniteScroll(handleLoadMore, hasMore, loading);

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "var(--bg-primary)" }}>
      {/* Hero — pulled behind navbar with negative margin */}
      <section className="-mt-14">
        {heroLoading ? (
          <div className="w-full h-[85vh] animate-pulse" style={{ background: "var(--bg-hover)" }} />
        ) : (
          <Hero movies={heroMovies} />
        )}
      </section>

      {/* Trending Now — horizontal strip of the 5 hero movies */}
      {heroMovies.length > 0 && (
        <section className="animate-in delay-100 pt-10">
          <TrendingStrip movies={heroMovies} />
        </section>
      )}

      {/* Discovery Feed */}
      <main className="animate-in delay-200">
        <MovieGrid
          movies={discoveryMovies}
          loading={loading}
          sentinelRef={lastElementRef}
        />
      </main>

      {/* End of collection */}
      {!hasMore && discoveryMovies.length > 0 && (
        <div className="section-container text-center py-12 text-xs font-medium" style={{ color: "var(--text-muted)" }}>
          You've reached the end of the collection. ✨
        </div>
      )}
    </div>
  );
};

export default HomePage;
