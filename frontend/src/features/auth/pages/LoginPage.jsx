import { Link } from "react-router-dom";
import { RiFilmLine, RiSunLine, RiMoonLine } from "@remixicon/react";
import LoginForm from "../components/LoginForm";
import useTheme from "../../../shared/hooks/useTheme";

/**
 * LoginPage
 * Design language: identical shell to LandingPage.
 * Same bg, same glow, same header, same max-w container.
 * Content: centered card with form.
 */
const LoginPage = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div
      className="relative min-h-screen overflow-hidden"
      style={{ background: "var(--bg-primary)", color: "var(--text-primary)" }}
    >
      {/* Same violet glow as LandingPage */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% -10%, rgba(93,0,255,0.28) 0%, transparent 70%)",
        }}
      />

      {/* Centered container */}
      <div className="relative z-10 max-w-8xl mx-auto px-6 lg:px-12 flex flex-col min-h-screen">

        {/* Header — same as LandingPage */}
        <header className="animate-in flex items-center justify-between py-6">
          <Link to="/" className="flex items-center gap-2.5" style={{ textDecoration: "none" }}>
            <RiFilmLine size={20} style={{ color: "var(--accent)" }} />
            <span className="text-base font-semibold tracking-tight">MoviesFreak</span>
          </Link>
          <button
            onClick={toggleTheme}
            className="flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium cursor-pointer transition-colors duration-200"
            style={{
              background: "var(--bg-card)",
              color: "var(--text-secondary)",
              border: "1px solid var(--border)",
            }}
          >
            {theme === "dark" ? <><RiSunLine size={15} /><span>Light</span></> : <><RiMoonLine size={15} /><span>Dark</span></>}
          </button>
        </header>

        {/* Centered card */}
        <main className="flex-1 flex items-center justify-center py-10">
          <div className="animate-in delay-200 w-full max-w-sm">
            {/* Card */}
            <div
              className="rounded-2xl p-8"
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                boxShadow: "0 24px 64px rgba(0,0,0,0.25)",
              }}
            >
              {/* Card heading */}
              <div className="mb-8">
                <h1 className="text-xl font-bold tracking-tight mb-1.5">
                  Welcome back
                </h1>
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  Sign in to your MoviesFreak account
                </p>
              </div>

              {/* Form */}
              <LoginForm />

              {/* Divider */}
              <div className="flex items-center gap-3 my-6">
                <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>or</span>
                <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
              </div>

              {/* Switch to register */}
              <p className="text-center text-sm" style={{ color: "var(--text-secondary)" }}>
                Don&apos;t have an account?{" "}
                <Link
                  to="/register"
                  className="font-medium"
                  style={{ color: "var(--accent)", textDecoration: "none" }}
                >
                  Create one
                </Link>
              </p>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="text-center pb-6 text-xs" style={{ color: "var(--text-muted)" }}>
          Powered by TMDB
        </footer>
      </div>
    </div>
  );
};

export default LoginPage;
