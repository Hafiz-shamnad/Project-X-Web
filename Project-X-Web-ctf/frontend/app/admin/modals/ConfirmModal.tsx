"use client";
export default function ConfirmModal({ open, title, message, onConfirm, onCancel }: any) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="p-6 bg-gray-800 rounded">
        <h2>{title}</h2>
        <p>{message}</p>
        <button onClick={onConfirm}>OK</button>
        <button onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}
