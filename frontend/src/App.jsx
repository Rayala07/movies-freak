import { RouterProvider } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { routes } from "./routes";

const App = () => {
  return (
    <>
      <RouterProvider router={routes} />
      {/* Global toast notifications — positioned top-right */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 2500,
          style: {
            background: "#16161f",
            color: "#f1f1f3",
            border: "1px solid rgba(255,255,255,0.08)",
            fontFamily: "Inter, sans-serif",
            fontSize: "14px",
          },
          success: {
            iconTheme: { primary: "#10b981", secondary: "#16161f" },
          },
          error: {
            iconTheme: { primary: "#ef4444", secondary: "#16161f" },
          },
        }}
      />
    </>
  );
};

export default App;