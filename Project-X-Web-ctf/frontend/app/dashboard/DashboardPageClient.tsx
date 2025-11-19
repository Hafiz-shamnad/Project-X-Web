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
<<<<<<< HEAD
    // ❗ block SSR
=======
    // ❗ Prevent SSR (localStorage does NOT exist on server)
>>>>>>> f82ae639a93256d5d58f1601fd97f5076c662ae4
    if (typeof window === "undefined") return;

    let cancelled = false;

    async function checkAuth() {
<<<<<<< HEAD
      // ❗ Ensure token exists before sending /auth/me
=======
      // ❗ Ensure token exists BEFORE making /auth/me request
>>>>>>> f82ae639a93256d5d58f1601fd97f5076c662ae4
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

<<<<<<< HEAD
    // Delay to ensure hydration completed (fixes early null localStorage)
    setTimeout(checkAuth, 0);

=======
    checkAuth();
>>>>>>> f82ae639a93256d5d58f1601fd97f5076c662ae4
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (loading) return <LoadingScreen />;
  if (!allowed) return null;

  return <ProjectXCTF />;
}