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
          json: {
            username: form.username,
            password: form.password,
          },
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
          error: err?.message || "Unexpected server error.",
        });
      }
    },
    [form, router]
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0f1f] to-[#0d1b2a] text-blue-200 p-4">
      <div className="w-full max-w-sm p-8 rounded-2xl bg-white/10 backdrop-blur-xl border border-blue-500/30 shadow-xl shadow-blue-900/40 relative">
        <h2 className="text-3xl font-bold mb-6 text-center text-blue-300">
          Welcome Back
        </h2>

        <form onSubmit={handleLogin} className="space-y-5">
          <input
            name="username"
            value={form.username}
            onChange={handleChange}
            required
            placeholder="Username"
            autoComplete="username"
            className="w-full p-3 rounded-lg bg-[#0a0f1f]/70 border border-blue-700/40 text-blue-100"
          />

          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            required
            placeholder="Password"
            autoComplete="current-password"
            className="w-full p-3 rounded-lg bg-[#0a0f1f]/70 border border-blue-700/40 text-blue-100"
          />

          {status.error && (
            <div className="text-red-400 text-sm font-semibold bg-red-900/20 p-2 rounded border border-red-500/40">
              {status.error}
            </div>
          )}

          <button
            type="submit"
            disabled={status.loading}
            className={`w-full py-3 rounded-lg font-bold ${
              status.loading
                ? "bg-blue-800 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-500"
            }`}
          >
            {status.loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
