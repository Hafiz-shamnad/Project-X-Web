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

/* ---------------------------------------
   TYPES
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
  onConfirm: (value: string) => void;
  onCancel: () => void;
}

export default function InputModal({
  isOpen,
  title = "Enter Value",
  message = "Please provide the required input.",
  label = "Value",
  inputType = "text",
  placeholder = "",
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
}: InputModalProps) {
  const [value, setValue] = useState("");
  const [mounted, setMounted] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  /* ---------------------------------------
     SSR-SAFE MOUNT
  ---------------------------------------- */
  useEffect(() => {
    setMounted(true);
  }, []);

  /* ---------------------------------------
     RESET VALUE ON CLOSE
  ---------------------------------------- */
  useEffect(() => {
    if (!isOpen) setValue("");
  }, [isOpen]);

  /* ---------------------------------------
     KEYBOARD SHORTCUTS (useCallback safe)
  ---------------------------------------- */
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

  /* ---------------------------------------
     Auto Focus on Open
  ---------------------------------------- */
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [isOpen]);

  /* ---------------------------------------
     Memoize portal root (avoid recreating)
  ---------------------------------------- */
  const portalRoot = useMemo(
    () => (typeof document !== "undefined" ? document.body : null),
    []
  );

  if (!mounted || !portalRoot) return null;

  /* ---------------------------------------
     Framer Motion Animations (typed)
  ---------------------------------------- */
  const modalTransition: Transition = {
    type: "spring",
    stiffness: 200,
    damping: 18,
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center 
                     bg-black/80 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          onClick={(e) => e.target === e.currentTarget && onCancel()}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="
              relative bg-gray-950 border border-green-500/60 
              rounded-xl p-7 shadow-[0_0_25px_rgba(0,255,150,0.35)]
              max-w-sm w-full overflow-hidden
            "
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.85, opacity: 0 }}
            transition={modalTransition}
          >
            {/* Green glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent pointer-events-none" />

            {/* Title */}
            <h3 className="text-xl font-bold text-green-400 mb-3 tracking-wide">
              {title}
            </h3>

            {/* Message */}
            <p className="text-green-300/90 text-sm mb-6 leading-relaxed">
              {message}
            </p>

            {/* Input Field */}
            <label className="block text-sm text-green-400 mb-2">{label}</label>

            <input
              ref={inputRef}
              type={inputType}
              value={value}
              placeholder={placeholder}
              onChange={(e) => setValue(e.target.value)}
              className="
                w-full p-3 bg-gray-800 text-white text-sm rounded
                border border-green-500 focus:ring-2 focus:ring-green-400 
                focus:outline-none placeholder-green-300/40
              "
            />

            {/* Buttons */}
            <div className="flex justify-end gap-3 mt-7">
              <button
                onClick={onCancel}
                className="
                  px-4 py-2 rounded text-green-300 bg-gray-800
                  hover:bg-gray-700 transition border border-green-500/30
                "
              >
                {cancelText}
              </button>

              <button
                onClick={() => onConfirm(value)}
                disabled={!value.trim()}
                className="
                  px-5 py-2 rounded font-semibold text-black
                  bg-green-500 hover:bg-green-400 transition
                  disabled:opacity-50 disabled:cursor-not-allowed
                "
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    portalRoot
  );
}
