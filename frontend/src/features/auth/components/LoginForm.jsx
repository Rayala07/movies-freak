import { useState } from "react";
import { useForm } from "react-hook-form";
import { RiEyeLine, RiEyeOffLine, RiMailLine, RiLockLine } from "@remixicon/react";
import useAuth from "../hooks/useAuth";

/**
 * LoginForm — Layer 1 (styled)
 * Handles its own form state via react-hook-form.
 * All submission logic in useAuth hook.
 */
const LoginForm = () => {
  const { login, loading, error } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = (data) => login(data);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      {/* Email field */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
          Email address
        </label>
        <div className="relative">
          <RiMailLine
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: "var(--text-muted)" }}
          />
          <input
            type="email"
            placeholder="you@example.com"
            className="auth-input w-full pl-10 pr-4 py-3 rounded-xl text-sm"
            style={{
              background: "var(--bg-hover)",
              border: "1px solid var(--border)",
              color: "var(--text-primary)",
            }}
            {...register("email", {
              required: "Email is required",
              pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Enter a valid email" },
            })}
          />
        </div>
        {errors.email && (
          <p className="text-xs" style={{ color: "var(--error)" }}>{errors.email.message}</p>
        )}
      </div>

      {/* Password field */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
          Password
        </label>
        <div className="relative">
          <RiLockLine
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: "var(--text-muted)" }}
          />
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Min. 6 characters"
            className="auth-input w-full pl-10 pr-11 py-3 rounded-xl text-sm"
            style={{
              background: "var(--bg-hover)",
              border: "1px solid var(--border)",
              color: "var(--text-primary)",
            }}
            {...register("password", {
              required: "Password is required",
              minLength: { value: 6, message: "At least 6 characters" },
            })}
          />
          <button
            type="button"
            onClick={() => setShowPassword((p) => !p)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 cursor-pointer"
            style={{ color: "var(--text-muted)" }}
            tabIndex={-1}
          >
            {showPassword ? <RiEyeOffLine size={15} /> : <RiEyeLine size={15} />}
          </button>
        </div>
        {errors.password && (
          <p className="text-xs" style={{ color: "var(--error)" }}>{errors.password.message}</p>
        )}
      </div>

      {/* Backend error */}
      {error && (
        <p
          className="text-xs px-3 py-2.5 rounded-lg"
          style={{ color: "var(--error)", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}
        >
          {error}
        </p>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="btn-fill-primary relative overflow-hidden w-full py-3 rounded-full text-sm font-semibold mt-1 cursor-pointer border-0 disabled:opacity-60 disabled:cursor-not-allowed text-white"
        style={{ background: "var(--accent)" }}
      >
        <span className="relative z-10">{loading ? "Signing in..." : "Sign In"}</span>
      </button>
    </form>
  );
};

export default LoginForm;
