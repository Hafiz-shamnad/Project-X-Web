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
    // ❗ Prevent SSR (localStorage does NOT exist on server)
    if (typeof window === "undefined") return;

    let cancelled = false;

    async function checkAuth() {
      // ❗ Ensure token exists BEFORE making /auth/me request
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
      } catch (err) {
        router.replace("/login");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    checkAuth();
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (loading) return <LoadingScreen />;
  if (!allowed) return null;

  return <ProjectXCTF />;
}