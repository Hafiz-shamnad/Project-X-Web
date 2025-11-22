"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { createPortal } from "react-dom";
import { AlertCircle, X, Edit3, Send, Keyboard } from "lucide-react";

/* ---------------------------------------
   PROPS
---------------------------------------- */
interface InputModalProps {
  isOpen: boolean;
  title?: string;
  message?: string;
  label?: string;
  inputType?: string;
  placeholder?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: (value: string) => void | Promise<void>;
  onCancel: () => void;
}

export default function InputModal({
  isOpen,
  title = "Enter Value",
  message = "Provide the required input.",
  label = "Value",
  inputType = "text",
  placeholder = "",
  confirmText = "Submit",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
}: InputModalProps) {
  const [value, setValue] = useState("");
  const [mounted, setMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      setValue("");
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  /* Keyboard shortcuts */
  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") onCancel();
      if (e.key === "Enter" && value.trim()) onConfirm(value);
    },
    [isOpen, value, onCancel, onConfirm]
  );

  useEffect(() => {
    if (!isOpen) return;
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, handleKey]);

  /* Autofocus */
  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 100);
  }, [isOpen]);

  const portalRoot = useMemo(
    () => (typeof document !== "undefined" ? document.body : null),
    []
  );

  if (!mounted || !portalRoot || !isVisible) return null;

  return createPortal(
    <div
      className={`fixed inset-0 z-[999999] flex items-center justify-center p-4 transition-all duration-300 ${
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      style={{ backdropFilter: isOpen ? "blur(8px)" : "blur(0px)" }}
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/80 transition-opacity duration-300"
        onClick={onCancel}
      />

      {/* Modal */}
      <div
        className={`relative z-[1000000] backdrop-blur-xl bg-slate-900/90 border border-blue-500/30 rounded-2xl shadow-[0_8px_32px_rgba(59,130,246,0.25)] max-w-lg w-full overflow-hidden transition-all duration-300 ${
          isOpen ? "scale-100 opacity-100" : "scale-90 opacity-0"
        }`}
      >
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Close Button */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 z-10 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="relative p-8">
          {/* Icon & Title */}
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500/20 via-cyan-500/10 to-transparent border border-blue-500/30 backdrop-blur-sm">
              <Edit3 className="w-8 h-8 text-blue-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-3xl font-black bg-gradient-to-r from-blue-300 via-cyan-300 to-purple-300 bg-clip-text text-transparent">
                {title}
              </h3>
            </div>
          </div>

          {/* Message */}
          {message && (
            <div className="mb-6 p-4 rounded-xl bg-slate-800/40 border border-slate-700/50">
              <p className="text-slate-300 text-sm leading-relaxed">
                {message}
              </p>
            </div>
          )}

          {/* Input Field */}
          <div className="space-y-3 mb-6">
            <label className="block text-sm font-semibold text-blue-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {label}
            </label>
            <div className="relative">
              <input
                ref={inputRef}
                type={inputType}
                placeholder={placeholder}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full p-4 pl-12 bg-slate-800/50 rounded-xl text-slate-200 border border-blue-500/30 placeholder:text-slate-500 focus:outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
              <Edit3 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-500/50" />
            </div>
          </div>

          {/* Keyboard Hint */}
          <div className="mb-6 flex items-center gap-2 text-xs text-slate-500">
            <Keyboard className="w-3 h-3" />
            <span>Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800/50 border border-slate-700 text-slate-400">Enter</kbd> to submit or <kbd className="px-1.5 py-0.5 rounded bg-slate-800/50 border border-slate-700 text-slate-400">Esc</kbd> to cancel</span>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 justify-end">
            <button
              onClick={onCancel}
              className="px-6 py-3 rounded-xl font-bold text-slate-300 bg-slate-800/50 border border-slate-700 hover:bg-slate-800 hover:text-white hover:border-slate-600 transition-all duration-300"
            >
              {cancelText}
            </button>

            <button
              disabled={!value.trim()}
              onClick={() => onConfirm(value)}
              className="px-6 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 shadow-[0_4px_20px_rgba(59,130,246,0.3)] transition-all duration-300 hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              {confirmText}
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        kbd {
          font-family: monospace;
          font-size: 0.75rem;
        }
      `}</style>
    </div>,
    portalRoot
  );
}