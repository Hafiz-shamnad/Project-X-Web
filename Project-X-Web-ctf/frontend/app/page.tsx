"use client";

import { useEffect } from "react";
import { apiFetch } from "@/app/lib/api";
import { useRouter } from "next/navigation";
import { Zap } from "lucide-react";

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
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-cyan-950 overflow-hidden relative">
      {/* Animated background glow */}
      <div className="absolute inset-0">
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-blue-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-cyan-500 rounded-full mix-blend-screen filter blur-3xl opacity-15 animate-pulse" style={{ animationDelay: "1s" }}></div>
      </div>

      <div className="relative z-10 flex flex-col items-center gap-6">
        <div className="flex items-center gap-3">
          <Zap className="w-8 h-8 text-cyan-400 animate-bounce" />
          <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
            Verifying Access...
          </div>
          <Zap className="w-8 h-8 text-cyan-400 animate-bounce" style={{ animationDelay: "0.2s" }} />
        </div>

        <div className="flex gap-2">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="w-2 h-6 bg-gradient-to-t from-cyan-400 to-blue-500 rounded-full"
              style={{
                animation: `pulse 0.5s ease-in-out infinite`,
                animationDelay: `${i * 0.08}s`,
              }}
            ></div>
          ))}
        </div>

        <div className="text-cyan-300/80 text-xs font-bold tracking-[0.2em]">
          AUTHENTICATING
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scaleY(0.4); }
          50% { opacity: 1; transform: scaleY(1); }
        }
      `}</style>
    </div>
  );
}