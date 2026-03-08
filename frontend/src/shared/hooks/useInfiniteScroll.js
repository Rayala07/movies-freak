import { useEffect, useRef, useCallback } from "react";

/**
 * useInfiniteScroll
 * -----------------
 * A simple, high-performance hook for infinite scrolling.
 * Uses IntersectionObserver to trigger 'callback' when the observed element enters the viewport.
 * 
 * @param {Function} callback - Function to run when bottom is reached.
 * @param {Boolean} hasMore - Sentinel to prevent fetching if no more data exists.
 * @param {Boolean} loading - Sentinel to prevent concurrent fetches.
 * @returns {Object} ref - Attach this to the "Sentinel" element at the bottom of your list.
 */
const useInfiniteScroll = (callback, hasMore, loading) => {
  const observer = useRef();

  const lastElementRef = useCallback(
    (node) => {
      // If we are currently loading, don't restart the observer
      if (loading) return;

      // Clean up previous observer
      if (observer.current) observer.current.disconnect();

      // Create new observer
      observer.current = new IntersectionObserver((entries) => {
        // If the sentinel is visible AND we have more data to fetch...
        if (entries[0].isIntersecting && hasMore) {
          callback();
        }
      });

      // Start observing the node
      if (node) observer.current.observe(node);
    },
    [loading, hasMore, callback]
  );

  return lastElementRef;
};

export default useInfiniteScroll;
