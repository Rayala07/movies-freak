import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchTrendingHeroes,
  fetchDiscoveryMovies,
  fetchPopularAll,
  fetchPopularMovies,
  fetchPopularTV,
} from "../movieSlice";
import useInfiniteScroll from "../../../shared/hooks/useInfiniteScroll";
import Hero from "../components/Hero";
import TrendingStrip from "../components/TrendingStrip";
import SectionRow from "../components/SectionRow";
import MovieGrid from "../components/MovieGrid";
import { RiCompassLine } from "@remixicon/react";

/**
 * HomePage — Phase F4 (Enhanced)
 * --------------------------------
 * Layout (top → bottom):
 *   1. Cinematic Hero carousel
 *   2. Trending Now strip (numbered cards)
 *   3. Popular  — Trending all/week mix
 *   4. Movies   — Popular movies
 *   5. TV Shows — Popular TV
 *   6. Discover Movies — Infinite scroll grid
 */
const HomePage = () => {
  const dispatch = useDispatch();
  const {
    heroMovies, heroLoading,
    discoveryMovies, page, loading, hasMore,
    popularAll, popularMovies, popularTV, sectionsLoading,
  } = useSelector((state) => state.movies);

  // Detect theme live
  const [isDark, setIsDark] = useState(() => !document.documentElement.classList.contains("light"));
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(!document.documentElement.classList.contains("light"));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  // Initial load
  useEffect(() => {
    if (heroMovies.length === 0) dispatch(fetchTrendingHeroes());
    if (discoveryMovies.length === 0) dispatch(fetchDiscoveryMovies(1));
    if (popularAll.length === 0) dispatch(fetchPopularAll());
    if (popularMovies.length === 0) dispatch(fetchPopularMovies());
    if (popularTV.length === 0) dispatch(fetchPopularTV());
  }, [dispatch]);

  // Infinite scroll for discovery grid
  const handleLoadMore = () => {
    if (!loading && hasMore) dispatch(fetchDiscoveryMovies(page));
  };
  const lastElementRef = useInfiniteScroll(handleLoadMore, hasMore, loading);

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "var(--bg-primary)" }}>

      {/* 1. Hero */}
      <section className="-mt-14">
        {heroLoading ? (
          <div className="w-full h-[75vh] md:h-[85vh] animate-pulse" style={{ background: "var(--bg-hover)" }} />
        ) : (
          <Hero movies={heroMovies} isDark={isDark} />
        )}
      </section>

      {/* 2. Trending Now strip */}
      {heroMovies.length > 0 && (
        <section className="animate-in delay-100">
          <TrendingStrip movies={heroMovies} />
        </section>
      )}

      {/* 3. Popular (Trending all/week) */}
      <section className="animate-in delay-150">
        <SectionRow
          title="Popular Right Now"
          movies={popularAll}
          loading={sectionsLoading && popularAll.length === 0}
          accentColor="#f97316"
        />
      </section>

      {/* 4. Movies */}
      <section className="animate-in delay-200">
        <SectionRow
          title="Movies"
          movies={popularMovies}
          loading={sectionsLoading && popularMovies.length === 0}
          accentColor="#7c3aed"
        />
      </section>

      {/* 5. TV Shows */}
      <section className="animate-in delay-200">
        <SectionRow
          title="TV Shows"
          movies={popularTV.map((t) => ({ ...t, media_type: "tv" }))}
          loading={sectionsLoading && popularTV.length === 0}
          accentColor="#06b6d4"
        />
      </section>
      
      {/* 6. Discover Movies — Infinite scroll grid */}
      <MovieGrid
        movies={discoveryMovies}
        loading={loading}
        sentinelRef={lastElementRef}
      />


      {/* End of collection */}
      {!hasMore && discoveryMovies.length > 0 && (
        <div
          className="section-container text-center py-12 text-xs font-medium"
          style={{ color: "var(--text-muted)" }}
        >
          You've reached the end of the collection.
        </div>
      )}
    </div>
  );
};

export default HomePage;
