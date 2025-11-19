"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { apiFetch } from "../lib/api";

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: any) => {
    e.preventDefault();
    console.log("LOGIN PAYLOAD:", { username, password });

    const data = await apiFetch("/auth/login", {
      method: "POST",
      auth: false,
      json: { username, password },
    });

    console.log("LOGIN SUCCESS TOKEN:", data.token);

    localStorage.setItem("token", data.token);

    console.log("REDIRECTING TO /dashboard ...");
    router.replace("/dashboard");
  };

  return (
    <form onSubmit={handleLogin}>
      <input value={username} onChange={e => setUsername(e.target.value)} />
      <input value={password} onChange={e => setPassword(e.target.value)} type="password" />
      <button>Login</button>
    </form>
  );
}
