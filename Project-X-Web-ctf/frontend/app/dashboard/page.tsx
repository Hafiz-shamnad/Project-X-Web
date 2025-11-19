"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LoadingScreen from "../components/LoadingScreen";
import { apiFetch } from "../lib/api";
import ProjectXCTF from "./ProjectXCTF";

export default function DashboardPage() {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function checkAuth() {
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

    checkAuth();
    return () => { cancelled = true };
  }, [router]);

  if (loading) return <LoadingScreen />;
  if (!allowed) return null;

  return <ProjectXCTF />;
}
