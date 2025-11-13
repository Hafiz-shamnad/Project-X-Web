'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

//
// Types
//
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

/**
 * InputModal
 * ----------
 * Generic modal component that captures user input.
 * Features:
 *  - Fully SSR-safe in Next.js using client portal mount guards
 *  - Smooth presence animations
 *  - Reusable across admin prompts, penalty input, ban duration, etc.
 *  - Accessible design with role="dialog"
 */
export default function InputModal({
  isOpen,
  title = 'Enter Value',
  message = 'Please provide the required input.',
  label = 'Value',
  inputType = 'text',
  placeholder = '',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
}: InputModalProps) {
  const [value, setValue] = useState('');
  const [mounted, setMounted] = useState(false);

  // Ensure portal only mounts on client
  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset input when modal closes
  useEffect(() => {
    if (!isOpen) setValue('');
  }, [isOpen]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="input-modal-title"
          aria-describedby="input-modal-message"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => e.target === e.currentTarget && onCancel()}
        >
          <motion.div
            className="bg-gray-900 border border-green-500 p-7 rounded-xl shadow-lg max-w-sm w-full"
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.85, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 180, damping: 20 }}
          >
            {/* Title */}
            <h3
              id="input-modal-title"
              className="text-xl font-semibold mb-3 text-green-400"
            >
              {title}
            </h3>

            {/* Message */}
            <p
              id="input-modal-message"
              className="text-green-300 text-sm mb-5 leading-relaxed"
            >
              {message}
            </p>

            {/* Input Field */}
            <label className="block text-sm text-green-400 mb-2">
              {label}
            </label>
            <input
              type={inputType}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={placeholder}
              className="
                w-full p-3 bg-gray-800 text-white text-sm rounded border border-green-500
                focus:outline-none focus:ring-2 focus:ring-green-400
              "
            />

            {/* Actions */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={onCancel}
                className="px-4 py-2 rounded text-green-300 bg-gray-700 hover:bg-gray-600 transition"
              >
                {cancelText}
              </button>

              <button
                onClick={() => onConfirm(value)}
                disabled={!value.trim()}
                className="
                  px-5 py-2 rounded font-semibold text-black bg-green-500
                  hover:bg-green-400 transition disabled:opacity-60 disabled:cursor-not-allowed
                "
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
