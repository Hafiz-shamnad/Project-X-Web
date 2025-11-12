'use client';

import { motion, AnimatePresence } from 'framer-motion';
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

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

  // Reset input when modal opens/closes
  useEffect(() => {
    if (!isOpen) setValue('');
  }, [isOpen]);

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
            <h3 className="text-xl font-bold mb-3 text-green-400">{title}</h3>
            <p className="text-green-300 mb-4">{message}</p>

            <label className="block text-left text-sm text-green-400 mb-2">{label}</label>
            <input
              type={inputType}
              value={value}
              placeholder={placeholder}
              onChange={(e) => setValue(e.target.value)}
              className="w-full p-2 bg-gray-800 text-white border border-green-500 rounded mb-6 focus:outline-none focus:ring-2 focus:ring-green-400"
            />

            <div className="flex justify-center space-x-4">
              <button
                onClick={() => onConfirm(value)}
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
