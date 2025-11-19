"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LoadingScreen from "../components/LoadingScreen";
import { apiFetch } from "../lib/api";
import ProjectXCTF from "./ProjectXCTF";

export default function DashboardClient() {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ✔ Prevent server-side execution
    if (typeof window === "undefined") return;

    let cancelled = false;

    async function checkAuth() {
      // Wait until token exists before calling /auth/me
      const token = localStorage.getItem("token");

      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        const res = await apiFetch("/auth/me", { auth: true });

        if (!cancelled) {
          if (res?.user) {
            setAllowed(true);
          } else {
            router.replace("/login");
          }
        }
      } catch (err) {
        console.error("Auth failed:", err);
        router.replace("/login");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    // Run on next tick to ensure hydration finished
    setTimeout(checkAuth, 0);

    return () => {
      cancelled = true;
    };
  }, [router]);

  if (loading) return <LoadingScreen />;
  if (!allowed) return null;

  return <ProjectXCTF />;
}
