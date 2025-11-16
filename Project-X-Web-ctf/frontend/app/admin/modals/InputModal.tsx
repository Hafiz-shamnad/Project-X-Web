"use client";

import { useState } from "react";
import { AlertCircle } from "lucide-react";

interface InputModalProps {
  open: boolean;
  title: string;
  message: string;
  label: string;
  onConfirm: (value: string) => Promise<void> | void;
  onCancel: () => void;
}

export default function InputModal({
  open,
  title,
  message,
  label,
  onConfirm,
  onCancel,
}: InputModalProps) {
  const [value, setValue] = useState("");

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-gray-900 border border-blue-500/40 p-6 rounded-xl shadow-xl w-full max-w-md animate-fadeIn">
        {/* Title */}
        <h2 className="text-xl font-bold text-blue-400 flex items-center gap-2 mb-2">
          <AlertCircle className="w-5 h-5 text-blue-400" />
          {title}
        </h2>

        {/* Message */}
        <p className="text-gray-300 text-sm mb-4">{message}</p>

        {/* Input */}
        <input
          type="text"
          placeholder={label}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoFocus
          className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-200
                     focus:border-blue-400 focus:outline-none"
        />

        {/* Buttons */}
        <div className="flex justify-end gap-3 mt-5">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 transition"
          >
            Cancel
          </button>

          <button
            onClick={() => onConfirm(value)}
            className="px-4 py-2 rounded-lg bg-blue-600/20 text-blue-300 
                       border border-blue-500/40 hover:bg-blue-600/30 transition"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
