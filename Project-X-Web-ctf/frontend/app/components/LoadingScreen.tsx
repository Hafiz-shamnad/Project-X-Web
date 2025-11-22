"use client";

import { memo } from "react";
import { Zap } from "lucide-react";

function LoadingScreenComponent() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-cyan-950 overflow-hidden relative">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-screen filter blur-3xl opacity-15 animate-pulse" style={{ animationDelay: "1s" }}></div>
      </div>

      <div className="relative z-10 flex flex-col items-center gap-8">
        <div className="flex items-center gap-4">
          <Zap className="w-12 h-12 text-cyan-400 animate-bounce" />
          <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-600 tracking-tighter">
            CTF ARENA
          </div>
          <Zap className="w-12 h-12 text-cyan-400 animate-bounce" style={{ animationDelay: "0.2s" }} />
        </div>

        <div className="flex gap-2">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="w-3 h-8 bg-gradient-to-t from-cyan-400 to-blue-500 rounded-full"
              style={{
                animation: `pulse 0.6s ease-in-out infinite`,
                animationDelay: `${i * 0.1}s`,
              }}
            ></div>
          ))}
        </div>

        <div className="text-cyan-300 text-sm font-bold tracking-[0.3em] animate-pulse">
          LOADING...
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scaleY(0.5); }
          50% { opacity: 1; transform: scaleY(1); }
        }
      `}</style>
    </div>
  );
}

export default memo(LoadingScreenComponent);