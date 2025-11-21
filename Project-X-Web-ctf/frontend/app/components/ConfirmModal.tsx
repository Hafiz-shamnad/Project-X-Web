"use client";

import { createPortal } from "react-dom";
import { AlertTriangle, CheckCircle, X } from "lucide-react";

export type ConfirmVariant = "danger" | "success" | "warning";

export interface ConfirmModalProps {
  isOpen: boolean;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
  variant?: ConfirmVariant;
}

export default function ConfirmModal({
  isOpen,
  title = "Confirm Action",
  message = "Are you sure you want to continue?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  variant = "warning",
}: ConfirmModalProps) {

  if (!isOpen || typeof document === "undefined") return null;

  const styles = {
    danger: {
      iconBg: "from-red-500/20 to-orange-500/10",
      iconBorder: "border-red-500/40",
      icon: <AlertTriangle className="w-8 h-8 text-red-400" />,
      titleColor: "text-red-300",
      confirmBg: "from-red-500 to-orange-500",
      confirmHover: "hover:from-red-600 hover:to-orange-600",
      glow: "bg-red-500/20",
    },
    success: {
      iconBg: "from-emerald-500/20 to-green-500/10",
      iconBorder: "border-emerald-500/40",
      icon: <CheckCircle className="w-8 h-8 text-emerald-400" />,
      titleColor: "text-emerald-300",
      confirmBg: "from-emerald-500 to-green-500",
      confirmHover: "hover:from-emerald-600 hover:to-green-600",
      glow: "bg-emerald-500/20",
    },
    warning: {
      iconBg: "from-yellow-500/20 to-amber-500/10",
      iconBorder: "border-yellow-500/40",
      icon: <AlertTriangle className="w-8 h-8 text-yellow-400" />,
      titleColor: "text-yellow-300",
      confirmBg: "from-blue-500 to-cyan-500",
      confirmHover: "hover:from-blue-600 hover:to-cyan-600",
      glow: "bg-yellow-500/20",
    },
  }[variant];

  return createPortal(
    <div
      className="
        fixed inset-0 z-[999999] flex items-center justify-center p-4
        bg-black/80 backdrop-blur-xl
      "
      onClick={onCancel}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="
          relative bg-slate-900/90 border border-blue-500/30 
          rounded-2xl shadow-[0_8px_32px_rgba(59,130,246,0.2)] 
          max-w-md w-full p-8 overflow-hidden
        "
      >
        <div className={`absolute top-0 right-0 w-48 h-48 ${styles.glow} rounded-full blur-3xl pointer-events-none`} />

        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />

        <button
          onClick={onCancel}
          className="absolute top-4 right-4 z-10 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="relative text-center">
          <div className="flex justify-center mb-6">
            <div
              className={`p-4 rounded-2xl bg-gradient-to-br ${styles.iconBg} border ${styles.iconBorder} backdrop-blur-sm`}
            >
              {styles.icon}
            </div>
          </div>

          <h3 className={`text-2xl font-black mb-4 ${styles.titleColor}`}>
            {title}
          </h3>

          <p className="text-slate-300 text-base leading-relaxed mb-8">
            {message}
          </p>

          <div className="flex gap-3 justify-center">
            <button
              onClick={onConfirm}
              className={`
                px-6 py-3 rounded-xl font-bold text-white 
                bg-gradient-to-r ${styles.confirmBg} ${styles.confirmHover} 
                shadow-lg transition-all duration-300 hover:scale-105
              `}
            >
              {confirmText}
            </button>

            <button
              onClick={onCancel}
              className="
                px-6 py-3 rounded-xl font-bold text-slate-300 
                bg-slate-800/50 border border-slate-700 
                hover:bg-slate-800 hover:text-white hover:border-slate-600 
                transition-all duration-300
              "
            >
              {cancelText}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
