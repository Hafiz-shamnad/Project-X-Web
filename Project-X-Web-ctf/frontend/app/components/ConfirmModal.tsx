"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

interface ConfirmModalProps {
  isOpen: boolean;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  isOpen,
  title = "Confirm Action",
  message = "Are you sure you want to continue?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const [mounted, setMounted] = useState(false);

  // Set mounted state only once (safe for SSR)
  useEffect(() => {
    setMounted(true);
  }, []);

  // Memoize portal root
  const portalRoot = useMemo(() => {
    if (typeof document !== "undefined") return document.body;
    return null;
  }, []);

  // Stable handlers (avoid re-renders)
  const handleConfirm = useCallback(() => onConfirm(), [onConfirm]);
  const handleCancel = useCallback(() => onCancel(), [onCancel]);

  if (!mounted || !portalRoot) return null;

  /* ----------------- Shared Animations ----------------- */
  const overlayAnim = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  };

  const modalAnim = {
    initial: { scale: 0.85, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.85, opacity: 0 },
    transition: {
      type: "spring",
      stiffness: 180,
      damping: 20,
    } as const,
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          {...overlayAnim}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-modal-title"
          aria-describedby="confirm-modal-message"
        >
          <motion.div
            {...modalAnim}
            className="bg-gray-900 border border-green-500 p-8 rounded-xl text-center shadow-lg max-w-sm w-full"
          >
            {/* Title */}
            <h3
              id="confirm-modal-title"
              className="text-xl font-semibold mb-4 text-green-400"
            >
              {title}
            </h3>

            {/* Message */}
            <p id="confirm-modal-message" className="text-green-300 mb-6">
              {message}
            </p>

            {/* Buttons */}
            <div className="flex justify-center gap-4">
              <button
                onClick={handleConfirm}
                className="bg-green-500 text-black px-5 py-2 rounded font-bold hover:bg-green-400 transition-colors"
              >
                {confirmText}
              </button>

              <button
                onClick={handleCancel}
                className="bg-gray-700 text-green-400 px-5 py-2 rounded font-bold hover:bg-gray-600 transition-colors"
              >
                {cancelText}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    portalRoot
  );
}
