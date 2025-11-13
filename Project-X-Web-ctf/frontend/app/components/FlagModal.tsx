'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { FileDown, Flag, Loader2, AlertTriangle, CheckCircle2, X } from 'lucide-react';

//
// Types
//
interface FlagModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (payload: any) => void;

  username: string;
  challengeId: number | null;
  backendUrl: string;
}

interface Challenge {
  id: number;
  name: string;
  description: string;
  points: number;
  category: string;
  difficulty: string;
  filePath?: string | null;
}

type MessageType = 'success' | 'error' | 'info';

interface Message {
  text: string;
  type: MessageType;
}

/**
 * FlagModal
 * ---------
 * Modal interface for:
 *  - fetching challenge details
 *  - submitting flags
 *  - showing result status
 *  - handling ban status messages
 *
 * Designed for professional, production frontend systems.
 */
export default function FlagModal({
  open,
  onClose,
  onSuccess,
  username,
  challengeId,
  backendUrl,
}: FlagModalProps) {
  const [flag, setFlag] = useState('');
  const [loading, setLoading] = useState(false);
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [message, setMessage] = useState<Message | null>(null);
  const [fetching, setFetching] = useState(false);

  /**
   * Fetch challenge details when modal opens.
   */
  const loadChallenge = useCallback(async () => {
    if (!challengeId) return;

    setFetching(true);

    try {
      const res = await fetch(`${backendUrl}/challenges/${challengeId}`, {
        credentials: 'include',
      });

      const data = await res.json();

      if (res.ok) setChallenge(data);
    } catch (err) {
      console.error('Error loading challenge:', err);
    } finally {
      setFetching(false);
    }
  }, [challengeId, backendUrl]);

  /**
   * Trigger challenge fetch on open.
   */
  useEffect(() => {
    if (open) loadChallenge();
  }, [open, loadChallenge]);

  /**
   * Flag submission logic.
   */
  const submitFlag = async () => {
    if (!flag.trim() || !challengeId) return;

    setLoading(true);
    setMessage({ text: 'Checking flag...', type: 'info' });

    try {
      const res = await fetch(`${backendUrl}/flag/submit`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, challengeId, flag }),
      });

      const data = await res.json();

      if (res.ok) {
        onSuccess(data);
        setMessage({
          text: data.message || 'Flag accepted.',
          type: 'success',
        });
        setFlag('');
      } else {
        setMessage({
          text: data.error || data.message || 'Incorrect flag.',
          type: 'error',
        });
      }
    } catch {
      setMessage({ text: 'Network error. Try again later.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Challenge Difficulty Color
   */
  const difficultyColor = (level: string) => {
    switch (level) {
      case 'Easy':
        return 'text-green-400';
      case 'Medium':
        return 'text-yellow-400';
      case 'Hard':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  /**
   * Banned Screen
   */
  if (message?.type === 'error' && message.text.toLowerCase().includes('banned')) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <div className="relative w-full max-w-md p-6 rounded-xl border border-red-500/40 bg-black/70 backdrop-blur shadow-lg">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-red-400 transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col items-center text-center">
            <AlertTriangle className="w-10 h-10 text-red-500 mb-3" />
            <h2 className="text-xl font-semibold text-red-400 mb-2">Access Restricted</h2>
            <p className="text-red-300 text-sm mb-4">{message.text}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!open) return null;

  /**
   * MAIN MODAL
   */
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative w-full max-w-lg p-6 rounded-xl border border-green-500/40 bg-black/70 backdrop-blur shadow-lg">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-green-400 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {fetching ? (
          <div className="flex flex-col items-center py-10 text-green-400">
            <Loader2 className="w-8 h-8 animate-spin mb-2" />
            <p>Loading challenge...</p>
          </div>
        ) : !challenge ? (
          <p className="text-green-300 text-center">Challenge not found.</p>
        ) : (
          <>
            {/* Header */}
            <div className="mb-4 border-b border-green-600/30 pb-3">
              <h3 className="text-xl font-semibold text-white">{challenge.name}</h3>
              <p className="text-sm text-green-300 mt-1">
                {challenge.category} •{' '}
                <span className={difficultyColor(challenge.difficulty)}>
                  {challenge.difficulty}
                </span>{' '}
                • {challenge.points} pts
              </p>
            </div>

            {/* Description */}
            <p className="text-green-200/90 text-sm mb-4 whitespace-pre-line">
              {challenge.description}
            </p>

            {/* File */}
            {challenge.filePath && (
              <a
                href={`${backendUrl}/download/${challenge.filePath.split('/').pop()}`}
                className="flex items-center gap-2 text-green-300 hover:text-green-200 text-sm mb-4"
              >
                <FileDown className="w-4 h-4" /> Download Attachment
              </a>
            )}

            {/* Flag Input */}
            <div className="border-t border-green-600/20 pt-4">
              <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                <Flag className="w-4 h-4 text-green-400" /> Submit Flag
              </h4>

              <input
                value={flag}
                onChange={(e) => setFlag(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && submitFlag()}
                placeholder="FLAG{example}"
                className="w-full px-4 py-3 text-green-200 bg-gray-900/50 rounded-md border border-green-600/40 focus:border-green-400 outline-none text-sm transition"
              />

              {/* Message */}
              {message && (
                <div
                  className={`mt-3 flex items-center gap-2 text-sm font-medium ${
                    message.type === 'success'
                      ? 'text-green-400'
                      : message.type === 'error'
                      ? 'text-red-400'
                      : 'text-yellow-300'
                  }`}
                >
                  {message.type === 'success' && <CheckCircle2 className="w-4 h-4" />}
                  {message.type === 'error' && <AlertTriangle className="w-4 h-4" />}
                  {message.text}
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-md border border-gray-600 text-gray-300 hover:text-white transition"
                >
                  Cancel
                </button>

                <button
                  onClick={submitFlag}
                  disabled={loading || !flag.trim()}
                  className={`px-6 py-2 rounded-md font-semibold text-black bg-green-500 hover:bg-green-400 transition ${
                    loading ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" /> Checking...
                    </span>
                  ) : (
                    'Submit'
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
