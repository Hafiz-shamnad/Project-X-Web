'use client';

import { motion, AnimatePresence } from 'framer-motion';
import React from 'react';
import { createPortal } from 'react-dom';

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
  title = 'Confirm Action',
  message = 'Are you sure you want to continue?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (typeof window === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="bg-gray-900 border border-green-500 p-8 rounded-xl text-center shadow-lg max-w-sm w-full"
          >
            <h3 className="text-xl font-bold mb-4 text-green-400">{title}</h3>
            <p className="text-green-300 mb-6">{message}</p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={onConfirm}
                className="bg-green-500 text-black px-5 py-2 rounded font-bold hover:bg-green-400 transition"
              >
                {confirmText}
              </button>
              <button
                onClick={onCancel}
                className="bg-gray-700 text-green-400 px-5 py-2 rounded font-bold hover:bg-gray-600 transition"
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
