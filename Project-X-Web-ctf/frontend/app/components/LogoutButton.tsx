'use client';

import React, { useState } from 'react';
import { LogOut } from 'lucide-react';
import ConfirmModal from './ConfirmModal';

interface LogoutButtonProps {
  backendURL?: string;
}

export default function LogoutButton({ backendURL }: LogoutButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await fetch(`${backendURL || 'http://localhost:4000'}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
      window.location.href = '/login';
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setLoading(false);
      setShowConfirm(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        disabled={loading}
        className="flex items-center gap-2 text-sm bg-red-600 hover:bg-red-500 px-4 py-2 rounded font-bold text-white transition"
      >
        <LogOut className="w-4 h-4" />
        {loading ? 'Logging out...' : 'Logout'}
      </button>

      {/* 🧠 Use the reusable modal here */}
      <ConfirmModal
        isOpen={showConfirm}
        title="Confirm Logout"
        message="Are you sure you want to leave this session?"
        confirmText="Yes, Logout"
        cancelText="Cancel"
        onConfirm={handleLogout}
        onCancel={() => setShowConfirm(false)}
      />
    </>
  );
}
