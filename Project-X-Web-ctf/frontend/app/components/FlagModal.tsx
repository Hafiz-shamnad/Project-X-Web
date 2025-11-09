'use client';
import React, { useState } from 'react';

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess: (data: any) => void;
  username: string;
  challengeId: number | null;
  backendUrl: string;
};

export default function FlagModal({ open, onClose, onSuccess, username, challengeId, backendUrl }: Props) {
  const [flag, setFlag] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  if (!open) return null;
  if (!challengeId) return null; 

  const submit = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`${backendUrl}/flag/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, challengeId, flag })
      });
      const data = await res.json();
      if (res.ok) {
        onSuccess(data);
        setMessage(data.message || 'Response received');
      } else {
        setMessage(data.error || data.message || 'Error');
      }
    } catch (err) {
      setMessage('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-green-500 rounded p-6 w-full max-w-md">
        <h3 className="text-lg font-bold mb-2 text-white">Submit Flag</h3>
        <p className="text-sm text-green-300 mb-4">Enter flag for challenge #{challengeId}</p>
        <input
          value={flag}
          onChange={(e) => setFlag(e.target.value)}
          placeholder="FLAG{...}"
          className="w-full p-2 rounded bg-black border border-gray-700 mb-3 text-white"
        />
        {message && <div className="mb-3 text-sm text-green-300">{message}</div>}
        <div className="flex justify-end space-x-2">
          <button className="px-4 py-2 rounded border border-gray-700" onClick={onClose} disabled={loading}>Cancel</button>
          <button
            className="px-4 py-2 rounded bg-green-500 text-black font-bold"
            onClick={submit}
            disabled={loading || !flag.trim()}
          >
            {loading ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </div>
    </div>
  );
}
