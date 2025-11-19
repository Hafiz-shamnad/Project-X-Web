"use client";

import React, { useCallback, useState } from "react";
import { apiFetch } from "@/app/lib/api";
import { useRouter } from "next/navigation";

interface RegisterForm {
  username: string;
  email: string;
  password: string;
}

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState<RegisterForm>({
    username: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  /** Update Form — Optimized */
  const updateForm = useCallback((key: keyof RegisterForm, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  /** Input Validation — Fast, inline computation */
  const validate = useCallback(() => {
    if (form.username.trim().length < 3)
      return "Username must be at least 3 characters.";
    if (!/\S+@\S+\.\S+/.test(form.email)) return "Please enter a valid email.";
    if (form.password.length < 6)
      return "Password must be at least 6 characters.";
    return null;
  }, [form]);

  /** Register Handler — Optimized */
  const handleRegister = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");

      const validationError = validate();
      if (validationError) {
        setError(validationError);
        return;
      }

      setLoading(true);
      try {
        const res = await apiFetch("/auth/register", {
          method: "POST",
          body: JSON.stringify(form),
        });

        if (res.error) {
          setError(res.error);
        } else {
          router.push("/dashboard");
        }
      } catch (err) {
        console.error("Registration error:", err);
        setError("Unexpected server error. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [form, validate, router]
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-green-500 p-4">
      <div className="w-full max-w-sm bg-gray-900/80 p-8 rounded-xl border border-green-600 shadow-lg shadow-green-500/10 backdrop-blur-md">
        {/* Title */}
        <h2 className="text-3xl font-bold mb-6 text-center text-green-400 tracking-wide">
          Register
        </h2>

        {/* Form */}
        <form onSubmit={handleRegister} className="space-y-4">
          {/* Username */}
          <input
            type="text"
            placeholder="Username"
            value={form.username}
            onChange={(e) => updateForm("username", e.target.value)}
            className="w-full p-3 rounded bg-black border border-green-700 text-white placeholder-green-700/50 focus:border-green-400 outline-none transition"
          />

          {/* Email */}
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => updateForm("email", e.target.value)}
            className="w-full p-3 rounded bg-black border border-green-700 text-white placeholder-green-700/50 focus:border-green-400 outline-none transition"
          />

          {/* Password */}
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => updateForm("password", e.target.value)}
            className="w-full p-3 rounded bg-black border border-green-700 text-white placeholder-green-700/50 focus:border-green-400 outline-none transition"
          />

          {/* Error */}
          {error && (
            <p className="text-red-400 text-sm bg-red-900/20 p-2 rounded border border-red-700/40">
              {error}
            </p>
          )}

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded font-bold transition shadow-green-500/20 shadow
              ${
                loading
                  ? "bg-green-700 text-black cursor-not-allowed"
                  : "bg-green-500 hover:bg-green-400 text-black"
              }`}
          >
            {loading ? "Registering…" : "Register"}
          </button>
        </form>

        {/* Footer */}
        <p className="mt-4 text-center text-sm text-green-300">
          Already have an account?{" "}
          <a
            href="/login"
            className="text-green-400 underline hover:text-green-200 transition"
          >
            Login
          </a>
        </p>
      </div>
    </div>
  );
}
