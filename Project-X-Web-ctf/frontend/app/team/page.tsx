'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Users,
  Copy,
  RefreshCw,
  Trophy,
  Plus,
  LogIn,
  Check,
  Sparkles,
  Shield,
} from 'lucide-react';
import { apiFetch } from '@/lib/api';
import Leaderboard from '../components/Leaderboard';

//
// -------------------- Types --------------------
//

interface Member {
  id: number;
  username: string;
  points?: number;
}

interface Team {
  id: number;
  name: string;
  joinCode?: string;
  totalPoints?: number;
  members?: Member[];
}

//
// -------------------- Component --------------------
//

export default function TeamPage() {
  const [team, setTeam] = useState<Team | null>(null);

  const [joinCode, setJoinCode] = useState('');
  const [teamName, setTeamName] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  //
  // -------------------- Helpers --------------------
  //

  /** Display timed success messages */
  const showSuccess = useCallback((message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  }, []);

  /** Fetch the current team of the authenticated user */
  const fetchMyTeam = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await apiFetch('/team/me');

      // When user has no team OR backend error
      if (res.error || !res.team) {
        setTeam(null);
        return;
      }

      const t = res.team;

      setTeam({
        id: t.id,
        name: t.name,
        joinCode: t.joinCode,
        totalPoints: t.totalPoints ?? 0,
        members: Array.isArray(t.members)
          ? t.members.map((m: any) => ({
              id: m.id,
              username: m.username,
              points: m.points ?? 0,
            }))
          : [],
      });
    } catch (err) {
      console.error('Team fetch error:', err);
      setError('Unable to load team information.');
      setTeam(null);
    } finally {
      setLoading(false);
    }
  }, []);

  /** Create a new team */
  const createTeam = async () => {
    if (!teamName.trim()) return setError('Team name is required.');

    setSaving(true);
    setError(null);

    try {
      const res: any = await apiFetch('/team/create', {
        method: 'POST',
        body: JSON.stringify({ name: teamName }),
      });

      if (res.error) {
        setError(res.error);
      } else {
        showSuccess('Team created successfully.');
        await fetchMyTeam();
      }
    } catch {
      setError('Server error while creating team.');
    } finally {
      setSaving(false);
      setTeamName('');
    }
  };

  /** Join a team */
  const joinTeam = async () => {
    if (!joinCode.trim()) return setError('Join code is required.');

    setSaving(true);
    setError(null);

    try {
      const res: any = await apiFetch('/team/join', {
        method: 'POST',
        body: JSON.stringify({ joinCode }),
      });

      if (res.error) {
        setError(res.error);
      } else {
        showSuccess('Successfully joined team.');
        await fetchMyTeam();
      }
    } catch {
      setError('Server error while joining team.');
    } finally {
      setSaving(false);
      setJoinCode('');
    }
  };

  /** Copy join code to clipboard */
  const copyJoinCode = () => {
    if (!team?.joinCode) return;

    navigator.clipboard.writeText(team.joinCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  //
  // -------------------- Effects --------------------
  //

  useEffect(() => {
    fetchMyTeam();
  }, [fetchMyTeam]);

  //
  // -------------------- UI States --------------------
  //

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-green-400">
        <RefreshCw className="animate-spin w-8 h-8" />
        <span className="ml-3">Loading team info...</span>
      </div>
    );
  }

  //
  // -------------------- Render --------------------
  //

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-green-400 p-6">
      <div className="max-w-5xl mx-auto">

        {/* Success Message */}
        {successMessage && (
          <div className="mb-4 bg-green-900/30 border border-green-500/40 
                          p-3 rounded-lg text-green-300 flex items-center gap-2">
            <Check className="w-5 h-5" />
            {successMessage}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 bg-red-900/30 border border-red-500/40 
                          p-3 rounded-lg text-red-300">
            {error}
          </div>
        )}

        {/* -------------------- TEAM EXISTS -------------------- */}
        {team ? (
          <>
            {/* Team Header */}
            <div className="p-6 border border-green-500/30 rounded-2xl
                            bg-gradient-to-br from-green-950/30 via-gray-900/50 to-black mb-8">

              <div className="flex justify-between items-center mb-4">
                <h1 className="text-3xl font-bold text-green-400 flex items-center gap-2">
                  <Shield className="w-6 h-6" />
                  {team.name}
                </h1>

                <button
                  onClick={fetchMyTeam}
                  className="p-2 border border-green-500/30 rounded-lg hover:bg-green-900/30 transition"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center gap-3">
                <Trophy className="text-yellow-400 w-6 h-6" />
                <p className="text-lg font-semibold text-green-300">
                  Total Points: {team.totalPoints ?? 0}
                </p>
              </div>

              {/* Join Code */}
              {team.joinCode && (
                <div className="mt-3 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-green-400" />

                  <code className="bg-black/40 px-3 py-1 rounded-lg border border-green-500/30 font-mono">
                    {team.joinCode}
                  </code>

                  <button
                    onClick={copyJoinCode}
                    className="border border-green-500/40 px-3 py-1 rounded-lg hover:bg-green-900/30 transition"
                  >
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              )}
            </div>

            {/* Member Leaderboard */}
            <Leaderboard
              backendUrl={process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000/api'}
              teamId={team.id}
            />
          </>
        ) : (
          //
          // -------------------- NO TEAM: JOIN / CREATE --------------------
          //
          <div className="text-center mt-20 space-y-10">

            <h2 className="text-3xl font-bold text-green-400">
              Join or Create a Team to Start Competing
            </h2>

            <div className="grid sm:grid-cols-2 gap-6">
              {/* Create Team */}
              <div className="border border-green-500/40 p-6 rounded-xl bg-black/40">
                <h3 className="font-bold text-xl mb-3 flex items-center gap-2">
                  <Plus className="w-5 h-5" /> Create a Team
                </h3>

                <input
                  placeholder="Enter team name"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="w-full p-3 mb-3 rounded-lg bg-black/60 border border-green-500/30 text-white"
                />

                <button
                  onClick={createTeam}
                  disabled={!teamName.trim() || saving}
                  className="w-full bg-green-500 text-black py-3 rounded-lg font-semibold hover:bg-green-400 disabled:opacity-50 transition"
                >
                  {saving ? 'Creating...' : 'Create'}
                </button>
              </div>

              {/* Join Team */}
              <div className="border border-green-500/40 p-6 rounded-xl bg-black/40">
                <h3 className="font-bold text-xl mb-3 flex items-center gap-2">
                  <LogIn className="w-5 h-5" /> Join a Team
                </h3>

                <input
                  placeholder="Enter join code"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  className="w-full p-3 mb-3 rounded-lg bg-black/60 border border-green-500/30 text-white"
                />

                <button
                  onClick={joinTeam}
                  disabled={!joinCode.trim() || saving}
                  className="w-full bg-green-500 text-black py-3 rounded-lg font-semibold hover:bg-green-400 disabled:opacity-50 transition"
                >
                  {saving ? 'Joining...' : 'Join'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
