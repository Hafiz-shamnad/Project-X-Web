"use client";

import { Shield, Lock } from "lucide-react";

interface BanScreenProps {
  type: "temp" | "perm";
  timer?: string;
}

export default function BanScreen({ type, timer }: BanScreenProps) {
  const isTemp = type === "temp";

  const title = isTemp ? "TEMPORARY BAN" : "PERMANENT BAN";
  const Icon = isTemp ? Shield : Lock;
  const message = isTemp
    ? "Your team violated rules. You may try again after the timer."
    : "Your team is permanently banned. Contact an administrator.";

  const handleButtonClick = () => {
    if (isTemp) {
      window.location.reload();
    } else {
      window.location.href = "/contact-admin";
    }
  };

  const ButtonText = isTemp ? "REFRESH" : "CONTACT ADMIN";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-blue-950/20 to-slate-950 font-mono text-red-400 relative overflow-hidden">

      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(239,68,68,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(239,68,68,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />

        <div className="absolute w-96 h-96 rounded-full blur-3xl animate-pulse top-1/4 left-1/4 bg-red-500/10" />
        <div className="absolute w-96 h-96 rounded-full blur-3xl animate-pulse bottom-1/4 right-1/4 bg-rose-500/10" />
      </div>

      {/* Card */}
      <div className="relative bg-gradient-to-br from-slate-900/90 to-slate-950/90 backdrop-blur-2xl border border-red-500/60 rounded-3xl p-10 max-w-lg shadow-2xl shadow-red-500/20 flex flex-col items-center">

        {/* Icon */}
        <Icon className="w-20 h-20 text-red-500 mb-4 animate-pulse" />

        {/* Title */}
        <h1 className="text-4xl font-black mb-3 tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-rose-500">
          {title}
        </h1>

        {/* Message */}
        <p className="text-base text-slate-300 text-center leading-relaxed px-4">
          {message}
        </p>

        {/* Timer */}
        {isTemp && timer && (
          <div className="mt-8 px-8 py-4 bg-slate-950/60 border border-red-500/40 rounded-2xl backdrop-blur-xl">
            <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-rose-400 tracking-[0.2em]">
              {timer}
            </div>
          </div>
        )}

        {/* Button */}
        <button
          onClick={handleButtonClick}
          className="mt-8 w-full px-6 py-3 border-2 border-red-500/60 rounded-xl bg-red-500/10 backdrop-blur-xl font-bold text-base hover:bg-gradient-to-r hover:from-red-600 hover:to-rose-600 hover:text-white hover:border-red-500 transition-all"
        >
          {ButtonText}
        </button>
      </div>
    </div>
  );
}
