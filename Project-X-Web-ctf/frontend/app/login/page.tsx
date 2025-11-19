"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "../lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await apiClient("/auth/login", {
        method: "POST",
        json: { username, password },
      });

      localStorage.setItem("token", res.token);
      localStorage.setItem("user", JSON.stringify(res.user));

      router.push("/admin");
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <form onSubmit={handleSubmit} className="bg-zinc-900 p-8 rounded w-full max-w-sm">
        <h1 className="text-white text-xl font-semibold mb-4">Admin Login</h1>

        {error && <div className="text-red-400 text-sm">{error}</div>}

        <input
          className="bg-zinc-800 text-white rounded p-2 w-full mt-3"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          className="bg-zinc-800 text-white rounded p-2 w-full mt-3"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded p-2 w-full mt-4"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}
