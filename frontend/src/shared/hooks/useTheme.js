import { useEffect, useState } from "react";

/**
 * useTheme Hook
 * -------------
 * Manages dark / light theme by toggling the data-theme attribute on <html>.
 * The CSS variables in global.css handle all color changes automatically.
 *
 * Persists the user's preference to localStorage so it survives page refresh.
 *
 * Returns:
 *   theme       → "dark" | "light" (current theme)
 *   toggleTheme → function to flip between dark and light
 *   isChanging  → boolean (true while transition is active)
 */
const useTheme = () => {
  const [isChanging, setIsChanging] = useState(false);
  // Read from localStorage on first load, default to "dark"
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("moviesfreak-theme") || "dark";
  });

  useEffect(() => {
    // Apply the theme to the root <html> element
    document.documentElement.setAttribute("data-theme", theme);
    // Persist choice
    localStorage.setItem("moviesfreak-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setIsChanging(true);
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
    // Reset changing state after animation duration
    setTimeout(() => setIsChanging(false), 500);
  };

  return { theme, toggleTheme, isChanging };
};

export default useTheme;
