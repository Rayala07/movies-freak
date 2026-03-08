import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  RiEyeLine,
  RiEyeOffLine,
  RiMailLine,
  RiLockLine,
  RiUserLine,
} from "@remixicon/react";
import useAuth from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

/**
 * RegisterForm — Layer 1 (styled)
 * 4 fields: name, email, password, confirmPassword.
 * confirmPassword is frontend-only — stripped before API call.
 */
const RegisterForm = () => {
  const { register: registerUser, loading, error } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const password = watch("password");

  const onSubmit = (data) => {
    const { confirmPassword, ...userData } = data;
    registerUser(userData);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
      {/* Name */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
          Full Name
        </label>
        <div className="relative">
          <RiUserLine
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: "var(--text-muted)" }}
          />
          <input
            type="text"
            placeholder="Your full name"
            className="auth-input w-full pl-10 pr-4 py-3 rounded-xl text-sm"
            style={{
              background: "var(--bg-hover)",
              border: "1px solid var(--border)",
              color: "var(--text-primary)",
            }}
            {...register("name", {
              required: "Name is required",
              minLength: { value: 2, message: "At least 2 characters" },
            })}
          />
        </div>
        {errors.name && <p className="text-xs" style={{ color: "var(--error)" }}>{errors.name.message}</p>}
      </div>

      {/* Email */}
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
        {errors.email && <p className="text-xs" style={{ color: "var(--error)" }}>{errors.email.message}</p>}
      </div>

      {/* Password */}
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
        {errors.password && <p className="text-xs" style={{ color: "var(--error)" }}>{errors.password.message}</p>}
      </div>

      {/* Confirm Password */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
          Confirm Password
        </label>
        <div className="relative">
          <RiLockLine
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: "var(--text-muted)" }}
          />
          <input
            type={showConfirm ? "text" : "password"}
            placeholder="Repeat your password"
            className="auth-input w-full pl-10 pr-11 py-3 rounded-xl text-sm"
            style={{
              background: "var(--bg-hover)",
              border: "1px solid var(--border)",
              color: "var(--text-primary)",
            }}
            {...register("confirmPassword", {
              required: "Please confirm your password",
              validate: (v) => v === password || "Passwords do not match",
            })}
          />
          <button
            type="button"
            onClick={() => setShowConfirm((p) => !p)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 cursor-pointer"
            style={{ color: "var(--text-muted)" }}
            tabIndex={-1}
          >
            {showConfirm ? <RiEyeOffLine size={15} /> : <RiEyeLine size={15} />}
          </button>
        </div>
        {errors.confirmPassword && <p className="text-xs" style={{ color: "var(--error)" }}>{errors.confirmPassword.message}</p>}
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
        className="btn-fill-primary relative overflow-hidden w-full py-2.5 rounded-full text-sm font-semibold mt-1 cursor-pointer border-0 disabled:opacity-60 disabled:cursor-not-allowed text-white"
        style={{ background: "var(--accent)" }}
      >
        <span className="relative z-10">{loading ? "Creating account..." : "Create Account"}</span>
      </button>
    </form>
  );
};

export default RegisterForm;
