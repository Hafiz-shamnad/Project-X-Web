"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LoadingScreen from "../components/LoadingScreen";
import { apiFetch } from "../lib/api";
import ProjectXCTF from "./ProjectXCTF";

export default function DashboardPageClient() {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ❗ block SSR
    if (typeof window === "undefined") return;

    let cancelled = false;

    async function checkAuth() {
      // ❗ Ensure token exists before sending /auth/me
      const token = localStorage.getItem("token");
      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        const res = await apiFetch("/auth/me");

        if (!cancelled) {
          if (res?.user) {
            setAllowed(true);
          } else {
            router.replace("/login");
          }
        }
      } catch {
        router.replace("/login");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    // Delay to ensure hydration completed (fixes early null localStorage)
    setTimeout(checkAuth, 0);

    return () => {
      cancelled = true;
    };
  }, [router]);

  if (loading) return <LoadingScreen />;
  if (!allowed) return null;

  return <ProjectXCTF />;
}
