// app/projectx/components/BanScreen.tsx
"use client";
import { Shield, Lock } from "lucide-react";

interface BanScreenProps {
  type: "temp" | "perm";
  timer?: string;
}

export default function BanScreen({ type, timer }: BanScreenProps) {
  const isTemp = type === "temp";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-blue-950/20 to-slate-950 text-red-400 font-mono relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(239,68,68,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(239,68,68,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 mb-6">
        <div className="absolute inset-0 blur-3xl bg-red-500/20 animate-pulse" />
        <div className="relative bg-gradient-to-br from-slate-900/90 to-slate-950/90 backdrop-blur-2xl border border-red-500/60 rounded-3xl p-10 flex flex-col items-center shadow-2xl shadow-red-500/20 max-w-lg">
          {isTemp ? (
            <Shield className="w-20 h-20 text-red-500 mb-4 animate-pulse" />
          ) : (
            <Lock className="w-20 h-20 text-red-600 mb-4 animate-bounce" />
          )}
          
          <h1 className="text-4xl font-black mb-3 tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-rose-500">
            {isTemp ? "TEMPORARY BAN" : "PERMANENT BAN"}
          </h1>
          
          <p className="text-base text-slate-300 text-center leading-relaxed px-4">
            {isTemp
              ? "Your team violated rules. You may try again after the timer."
              : "Your team is permanently banned. Contact an administrator."}
          </p>
          
          {isTemp && timer && (
            <div className="mt-8 px-8 py-4 bg-slate-950/60 border border-red-500/40 rounded-2xl backdrop-blur-xl">
              <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-rose-400 tracking-[0.2em] font-mono">
                {timer}
              </div>
            </div>
          )}
          
          <div className="mt-8 flex gap-4 w-full">
            {isTemp && (
              <button
                onClick={() => window.location.reload()}
                className="flex-1 px-6 py-3 border-2 border-red-500/60 rounded-xl hover:bg-gradient-to-r hover:from-red-600 hover:to-rose-600 hover:text-white hover:border-red-500 transition-all text-base font-bold backdrop-blur-xl bg-red-500/10"
              >
                REFRESH
              </button>
            )}
            {!isTemp && (
              <button
                onClick={() => (window.location.href = "/contact-admin")}
                className="flex-1 px-6 py-3 border-2 border-red-500/60 rounded-xl hover:bg-gradient-to-r hover:from-red-600 hover:to-rose-600 hover:text-white hover:border-red-500 transition-all text-base font-bold backdrop-blur-xl bg-red-500/10"
              >
                CONTACT ADMIN
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}