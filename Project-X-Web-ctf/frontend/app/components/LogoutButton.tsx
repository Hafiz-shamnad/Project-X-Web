'use client';

import React, { useState } from 'react';
import { LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LogoutButtonProps {
  backendURL: string;
}

export default function LogoutButton({ backendURL }: LogoutButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await fetch(`${backendURL}/auth/logout`, {
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
      {/* 🔴 Main Logout Button */}
      <button
        onClick={() => setShowConfirm(true)}
        disabled={loading}
        className="flex items-center gap-2 text-sm bg-red-600 hover:bg-red-500 px-4 py-2 rounded font-bold text-white transition"
      >
        <LogOut className="w-4 h-4" />
        {loading ? 'Logging out...' : 'Logout'}
      </button>

      {/* 🧠 Confirmation Modal */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-gray-900 border border-green-500 p-8 rounded-xl text-center shadow-lg"
            >
              <h3 className="text-xl font-bold mb-4 text-green-400">
                Confirm Logout
              </h3>
              <p className="text-green-300 mb-6">
                Are you sure you want to leave this session?
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={handleLogout}
                  className="bg-green-500 text-black px-5 py-2 rounded font-bold hover:bg-green-400"
                >
                  Yes, Logout
                </button>
                <button
                  onClick={() => setShowConfirm(false)}
                  className="bg-gray-700 text-green-400 px-5 py-2 rounded font-bold hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
