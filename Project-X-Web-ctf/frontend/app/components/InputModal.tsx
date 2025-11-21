"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, type Transition } from "framer-motion";
import { AlertCircle, X } from "lucide-react";

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
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!isOpen) setValue("");
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

  if (!mounted || !portalRoot) return null;

  const modalTransition: Transition = {
    type: "spring",
    stiffness: 220,
    damping: 20,
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/80 backdrop-blur-xl"
          onClick={(e) => e.target === e.currentTarget && onCancel()}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="
              relative bg-slate-900/90 border border-blue-500/30 rounded-2xl 
              p-8 max-w-md w-full shadow-[0_8px_32px_rgba(59,130,246,0.25)]
              overflow-hidden
            "
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.85, opacity: 0 }}
            transition={modalTransition}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Glow */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/20 blur-3xl pointer-events-none" />

            {/* Grid pattern */}
            <div className="
                absolute inset-0 pointer-events-none 
                bg-[linear-gradient(rgba(59,130,246,0.04)_1px,transparent_1px),
                     linear-gradient(90deg,rgba(59,130,246,0.04)_1px,transparent_1px)]
                bg-[size:20px_20px]
            " />

            {/* Close button */}
            <button
              onClick={onCancel}
              className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 transition"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Content */}
            <div className="relative">
              {/* Title */}
              <h3 className="text-2xl font-black text-blue-300 mb-3 flex items-center gap-2">
                <AlertCircle className="w-6 h-6 text-blue-400" />
                {title}
              </h3>

              {/* Message */}
              <p className="text-slate-300 text-sm mb-6 leading-relaxed">
                {message}
              </p>

              {/* Label */}
              <label className="block text-sm text-blue-400 mb-2">{label}</label>

              {/* Input */}
              <input
                ref={inputRef}
                type={inputType}
                placeholder={placeholder}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="
                  w-full p-3 bg-slate-800/60 rounded-xl text-blue-200 
                  border border-blue-500/30 placeholder-blue-500/40
                  focus:outline-none focus:border-blue-400
                  focus:ring-2 focus:ring-blue-600/40
                  transition
                "
              />

              {/* Buttons */}
              <div className="flex justify-end gap-3 mt-7">
                <button
                  onClick={onCancel}
                  className="
                    px-5 py-2 rounded-xl font-semibold
                    bg-slate-800/50 border border-slate-700 text-slate-300
                    hover:bg-slate-800 hover:text-white hover:border-slate-600
                    transition-all
                  "
                >
                  {cancelText}
                </button>

                <button
                  disabled={!value.trim()}
                  onClick={() => onConfirm(value)}
                  className="
                    px-5 py-2 rounded-xl font-bold text-white
                    bg-gradient-to-r from-blue-500 to-cyan-500
                    hover:from-blue-600 hover:to-cyan-600
                    shadow-lg transition-all hover:scale-105
                    disabled:opacity-40 disabled:cursor-not-allowed
                  "
                >
                  {confirmText}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    portalRoot
  );
}
