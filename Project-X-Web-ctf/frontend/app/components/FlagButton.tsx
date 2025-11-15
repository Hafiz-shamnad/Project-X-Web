// app/projectx/components/FlagButton.tsx
"use client";

interface FlagButtonProps {
  disabled: boolean;
  onClick: () => void;
}

export default function FlagButton({ disabled, onClick }: FlagButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full px-8 py-5 rounded-2xl font-bold text-lg transition-all ${
        disabled
          ? "bg-slate-800/50 text-slate-500 cursor-not-allowed border border-slate-700/50"
          : "bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white shadow-xl shadow-blue-500/30 border border-blue-400/30"
      }`}
    >
      {disabled ? "FLAG SUBMITTED" : "SUBMIT FLAG"}
    </button>
  );
}