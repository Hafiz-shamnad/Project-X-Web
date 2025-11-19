"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadUser = async () => {
    try {
      const res = await apiFetch("/auth/me");
      if (!res.ok) {
        setUser(null);
      } else {
        const data = await res.json();
        setUser(data.user);
      }
    } catch (err) {
      console.error("Auth load error:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadUser();
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return { user, loading, logout, reloadUser: loadUser };
}
