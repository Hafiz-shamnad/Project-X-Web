'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface ConfirmModalProps {
  /** Controls visibility of the modal */
  isOpen: boolean;

  /** Title displayed at the top of the modal */
  title?: string;

  /** Message body/content inside the modal */
  message?: string;

  /** Label for the confirmation button */
  confirmText?: string;

  /** Label for the cancel button */
  cancelText?: string;

  /** Called when user confirms the action */
  onConfirm: () => void;

  /** Called when user cancels the dialog */
  onCancel: () => void;
}

/**
 * ConfirmModal
 * ------------
 * A reusable confirmation modal rendered through a React portal.
 * Provides smooth animations (Framer Motion), accessibility attributes,
 * and SSR-safe mounting for Next.js applications.
 */
export default function ConfirmModal({
  isOpen,
  title = 'Confirm Action',
  message = 'Are you sure you want to continue?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const [mounted, setMounted] = useState(false);

  // Ensure portal is only mounted on client (Next.js SSR safe)
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-modal-title"
          aria-describedby="confirm-modal-message"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-gray-900 border border-green-500 p-8 rounded-xl text-center shadow-lg max-w-sm w-full"
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.85, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 180, damping: 20 }}
          >
            <h3
              id="confirm-modal-title"
              className="text-xl font-semibold mb-4 text-green-400"
            >
              {title}
            </h3>

            <p id="confirm-modal-message" className="text-green-300 mb-6">
              {message}
            </p>

            <div className="flex justify-center gap-4">
              <button
                onClick={onConfirm}
                className="bg-green-500 text-black px-5 py-2 rounded font-bold hover:bg-green-400 transition-colors"
              >
                {confirmText}
              </button>

              <button
                onClick={onCancel}
                className="bg-gray-700 text-green-400 px-5 py-2 rounded font-bold hover:bg-gray-600 transition-colors"
              >
                {cancelText}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
