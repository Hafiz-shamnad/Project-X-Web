"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/app/lib/api";

export default function AuthGuard({
  children,
  adminOnly = false,
}: {
  children: React.ReactNode;
  adminOnly?: boolean;
}) {
  const [ready, setReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    async function check() {
      try {
        const res = await apiFetch("/auth/me");

        if (!mounted) return;

        if (!res?.user) {
          router.replace("/login");
          return;
        }

        if (adminOnly && res.user.role !== "admin") {
          router.replace("/dashboard");
          return;
        }

        setReady(true);
      } catch {
        router.replace("/login");
      }
    }

    check();
    return () => {
      mounted = false;
    };
  }, [router, adminOnly]);

  if (!ready) return null; // Or loading spinner

  return <>{children}</>;
}
