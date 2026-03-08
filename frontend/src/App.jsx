import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useDispatch } from "react-redux";
import { routes } from "./routes";
import { fetchMe } from "./features/auth/authSlice";
import useTheme from "./shared/hooks/useTheme";

const App = () => {
  const dispatch = useDispatch();
  const { theme } = useTheme();

  /**
   * On every app load/refresh, try to restore the session.
   */
  useEffect(() => {
    dispatch(fetchMe());
  }, [dispatch]);

  return (
    <>
      <RouterProvider router={routes} />
      
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 2500,
          style: {
            background: "var(--bg-card)",
            color: "var(--text-primary)",
            border: "1px solid var(--border)",
            backdropFilter: "blur(8px)",
            fontFamily: "Inter, sans-serif",
            fontSize: "14px",
          },
          success: {
            iconTheme: { primary: "var(--accent)", secondary: "var(--bg-card)" },
          },
          error: {
            iconTheme: { primary: "#ef4444", secondary: "var(--bg-card)" },
          },
        }}
      />
    </>
  );
};

export default App;