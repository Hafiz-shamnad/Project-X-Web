"use client";

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  open,
  title,
  message,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center 
                 bg-black/60 backdrop-blur-sm animate-fade-in"
    >
      <div
        className="bg-gray-900/90 border border-blue-500/30 
                   rounded-xl p-6 w-full max-w-md
                   shadow-[0_0_20px_rgba(56,189,248,0.25)]
                   animate-scale-in"
      >
        {/* Title */}
        <h2 className="text-xl font-semibold text-cyan-300 mb-2">
          {title}
        </h2>

        {/* Message */}
        <p className="text-gray-300 mb-6">{message}</p>

        {/* Buttons */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg 
                       bg-gray-800 text-gray-300 
                       border border-gray-600 
                       hover:bg-gray-700 transition"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg 
                       bg-blue-600/20 text-cyan-300 
                       border border-blue-400/40
                       hover:bg-blue-600/30 hover:border-blue-400 
                       shadow-[0_0_10px_rgba(56,189,248,0.3)]
                       transition"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
