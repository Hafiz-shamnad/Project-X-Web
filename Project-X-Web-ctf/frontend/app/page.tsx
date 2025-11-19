"use client";

import { useEffect } from "react";
import { apiFetch } from "@/app/lib/api";
import { useRouter } from "next/navigation";

/**
 * Root page:
 * - Automatically redirects authenticated users to /dashboard
 * - Redirects guests to /login
 * - Works entirely on the client to avoid Next.js caching issues
 */
export default function Home() {
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    async function checkAuth() {
      try {
        const res = await apiFetch("/auth/me");

        // Prevent redirect after component unmount
        if (!isMounted) return;

        if (res && !res.error) {
          router.replace("/dashboard");
        } else {
          router.replace("/login");
        }
      } catch (err) {
        console.error("Authentication check failed:", err);
        router.replace("/login");
      }
    }

    checkAuth();

    return () => {
      // Cleanup to prevent state updates on unmounted component
      isMounted = false;
    };
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-black text-green-500">
      <div className="animate-pulse text-lg font-semibold">
        Checking session...
      </div>
    </div>
  );
}
