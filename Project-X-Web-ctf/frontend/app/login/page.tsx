"use client";

import React, { useCallback, useState } from "react";
import { apiFetch } from "@/app/lib/api";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const [status, setStatus] = useState({
    loading: false,
    error: "",
  });

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleLogin = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setStatus({ loading: true, error: "" });

      try {
        const response = await apiFetch("/auth/login", {
          method: "POST",
          body: form as any,
        });

        const role = response?.user?.role;

        if (!role) {
          setStatus({
            loading: false,
            error: "Invalid server response.",
          });
          return;
        }

        router.push(role === "admin" ? "/admin" : "/dashboard");
      } catch (err: any) {
        setStatus({
          loading: false,
          error: err?.message || "Unexpected server error. Please try again.",
        });
      }
    },
    [form, router]
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0f1f] to-[#0d1b2a] text-blue-200 p-4">
      <div className="w-full max-w-sm p-8 rounded-2xl bg-white/10 backdrop-blur-xl border border-blue-500/30 shadow-xl shadow-blue-900/40 relative">
        {/* Glow */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-32 h-32 bg-blue-500/40 blur-3xl rounded-full pointer-events-none" />

        <h2 className="text-3xl font-bold mb-6 text-center text-blue-300 tracking-wide drop-shadow">
          Welcome Back
        </h2>

        <form onSubmit={handleLogin} className="space-y-5">
          {/* USERNAME */}
          <input
            name="username"
            value={form.username}
            onChange={handleChange}
            required
            placeholder="Username"
            autoComplete="username"
            className="w-full p-3 rounded-lg bg-[#0a0f1f]/70 border border-blue-700/40 text-blue-100 placeholder-blue-400/40 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/30 outline-none transition"
          />

          {/* PASSWORD */}
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            required
            placeholder="Password"
            autoComplete="current-password"
            className="w-full p-3 rounded-lg bg-[#0a0f1f]/70 border border-blue-700/40 text-blue-100 placeholder-blue-400/40 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 outline-none transition"
          />

          {/* ERROR MSG */}
          {status.error && (
            <div className="text-red-400 text-sm font-semibold bg-red-900/20 p-2 rounded border border-red-500/40 shadow-red-900/30 shadow-sm animate-pulse">
              {status.error}
            </div>
          )}

          {/* BUTTON */}
          <button
            type="submit"
            disabled={status.loading}
            className={`w-full py-3 rounded-lg font-bold transition-all duration-200 relative overflow-hidden
              ${
                status.loading
                  ? "bg-blue-800 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-900/30"
              }
            `}
          >
            {status.loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-blue-300 border-t-transparent rounded-full animate-spin" />
                Logging in…
              </span>
            ) : (
              "Login"
            )}
          </button>
        </form>

        {/* REGISTER */}
        <p className="mt-4 text-center text-sm text-blue-300/80">
          Don’t have an account?{" "}
          <a
            href="/register"
            className="text-blue-300 underline hover:text-blue-200 transition"
          >
            Register
          </a>
        </p>
      </div>
    </div>
  );
}
