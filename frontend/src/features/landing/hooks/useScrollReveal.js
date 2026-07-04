import { useEffect, useRef, useState } from "react";

/**
 * useScrollReveal
 * ---------------
 * A custom hook that uses IntersectionObserver to trigger animations
 * when an element scrolls into the viewport.
 * 
 * Returns: [ref, isVisible]
 * Usage:
 *   const [ref, isVisible] = useScrollReveal({ threshold: 0.1 });
 *   <div ref={ref} className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
 */
export const useScrollReveal = (options = { threshold: 0.1, triggerOnce: true }) => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        if (options.triggerOnce && ref.current) {
          observer.unobserve(ref.current);
        }
      } else if (!options.triggerOnce) {
        setIsVisible(false);
      }
    }, {
      threshold: options.threshold,
    });

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [options.threshold, options.triggerOnce]);

  return [ref, isVisible];
};

export default useScrollReveal;
