"use client";

import { useState, useCallback } from "react";
import { apiFetch } from "@/app/lib/api";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [form, setForm] = useState({ username: "", password: "" });
  const [status, setStatus] = useState({ loading: false, error: "" });

  const handleChange = useCallback((e: any) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }, []);

  const handleLogin = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setStatus({ loading: true, error: "" });

      try {
        const data = await apiFetch("/auth/login", {
          method: "POST",
          json: form,
        });

        // SAVE TOKEN
        localStorage.setItem("token", data.token);

        router.push(data.user.role === "admin" ? "/admin" : "/dashboard");
      } catch (err: any) {
        setStatus({
          loading: false,
          error: err.message || "Login failed",
        });
      }
    },
    [form, router]
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <form onSubmit={handleLogin} className="bg-gray-900 p-6 rounded-lg">
        <input
          name="username"
          placeholder="Username"
          onChange={handleChange}
          className="block w-full p-2 mb-3"
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          onChange={handleChange}
          className="block w-full p-2 mb-3"
        />

        {status.error && <p className="text-red-400">{status.error}</p>}

        <button
          type="submit"
          disabled={status.loading}
          className="bg-blue-600 px-4 py-2 rounded"
        >
          {status.loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}
