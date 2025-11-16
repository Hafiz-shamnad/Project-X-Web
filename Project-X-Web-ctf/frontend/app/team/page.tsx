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

export default function TeamPage() {
  const [team, setTeam] = useState<Team | null>(null);
  const [teamName, setTeamName] = useState('');
  const [joinCode, setJoinCode] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  /* ---------------------------------------------
   * SHOW SUCCESS (auto hide)
   * --------------------------------------------- */
  const showSuccess = useCallback((msg: string) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(null), 2500);
  }, []);

  /* ---------------------------------------------
   * FETCH MY TEAM
   * --------------------------------------------- */
  const fetchMyTeam = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await apiFetch('/team/me');

      if (!res.team || res.error) {
        setTeam(null);
      } else {
        const t = res.team;
        setTeam({
          id: t.id,
          name: t.name,
          joinCode: t.joinCode,
          totalPoints: t.totalPoints ?? 0,
          members: t.members || [],
        });
      }
    } catch {
      setError('Failed to load team.');
      setTeam(null);
    } finally {
      setLoading(false);
    }
  }, []);

  /* ---------------------------------------------
   * CREATE TEAM
   * --------------------------------------------- */
  const createTeam = useCallback(async () => {
    if (!teamName.trim()) return setError('Team name required.');

    setSaving(true);
    setError(null);

    try {
      const res = await apiFetch('/team/create', {
        method: 'POST',
        body: JSON.stringify({ name: teamName }),
      });

      if (res.error) setError(res.error);
      else {
        showSuccess('Team created.');
        fetchMyTeam();
      }
    } catch {
      setError('Server error.');
    } finally {
      setSaving(false);
      setTeamName('');
    }
  }, [teamName, fetchMyTeam, showSuccess]);

  /* ---------------------------------------------
   * JOIN TEAM
   * --------------------------------------------- */
  const joinTeam = useCallback(async () => {
    if (!joinCode.trim()) return setError('Join code required.');

    setSaving(true);
    setError(null);

    try {
      const res = await apiFetch('/team/join', {
        method: 'POST',
        body: JSON.stringify({ joinCode }),
      });

      if (res.error) setError(res.error);
      else {
        showSuccess('Joined team.');
        fetchMyTeam();
      }
    } catch {
      setError('Server error.');
    } finally {
      setSaving(false);
      setJoinCode('');
    }
  }, [joinCode, fetchMyTeam, showSuccess]);

  /* ---------------------------------------------
   * COPY JOIN CODE
   * --------------------------------------------- */
  const copyJoin = useCallback(() => {
    if (!team?.joinCode) return;
    navigator.clipboard.writeText(team.joinCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1000);
  }, [team]);

  /* ---------------------------------------------
   * LOAD TEAM ON MOUNT
   * --------------------------------------------- */
  useEffect(() => {
    fetchMyTeam();
  }, [fetchMyTeam]);

  /* ---------------------------------------------
   * LOADING
   * --------------------------------------------- */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0f1f] text-blue-300">
        <RefreshCw className="animate-spin w-8 h-8" />
        <span className="ml-3">Loading team...</span>
      </div>
    );
  }

  /* ---------------------------------------------
   * MAIN RENDER
   * --------------------------------------------- */
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0f1f] to-[#0d1b2a] text-blue-200 p-6">
      <div className="max-w-5xl mx-auto">

        {/* SUCCESS */}
        {success && (
          <div className="mb-5 bg-blue-900/30 border border-blue-400/40 p-3 rounded-lg flex items-center gap-2 text-blue-200">
            <Check className="w-5 h-5" />
            {success}
          </div>
        )}

        {/* ERROR */}
        {error && (
          <div className="mb-5 bg-red-900/30 border border-red-400/40 p-3 rounded-lg text-red-300">
            {error}
          </div>
        )}

        {/* TEAM EXISTS */}
        {team ? (
          <>
            {/* TEAM CARD */}
            <div className="p-6 rounded-2xl bg-[#0b1428]/70 backdrop-blur-xl border border-blue-500/20 shadow-xl shadow-blue-900/40 mb-10">

              {/* Header */}
              <div className="flex justify-between items-center mb-4">
                <h1 className="text-3xl font-bold text-blue-200 flex items-center gap-2">
                  <Shield className="w-7 h-7 text-blue-400" />
                  {team.name}
                </h1>

                <button
                  onClick={fetchMyTeam}
                  className="p-2 border border-blue-500/30 rounded-lg hover:bg-blue-900/30 transition"
                >
                  <RefreshCw className="w-5 h-5 text-blue-300" />
                </button>
              </div>

              {/* Points */}
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="w-6 h-6 text-yellow-400" />
                <p className="text-lg font-semibold text-blue-300">
                  {team.totalPoints} pts
                </p>
              </div>

              {/* Join Code */}
              {team.joinCode && (
                <div className="flex items-center gap-2 mt-2">
                  <Sparkles className="w-5 h-5 text-blue-300" />
                  <code className="px-3 py-1 rounded bg-black/40 border border-blue-500/20 font-mono">
                    {team.joinCode}
                  </code>
                  <button
                    onClick={copyJoin}
                    className="px-3 py-1 border border-blue-500/30 rounded hover:bg-blue-900/30 transition"
                  >
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
              )}
            </div>

            {/* Members & Leaderboard */}
            <Leaderboard
              backendUrl={
                process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'
              }
              teamId={team.id}
            />
          </>
        ) : (
          /* ---------------------------------------------
           * NO TEAM — JOIN OR CREATE
           * --------------------------------------------- */
          <div className="text-center mt-20 space-y-10">

            <h2 className="text-3xl font-bold text-blue-200">
              Join or Create a Team
            </h2>

            <div className="grid sm:grid-cols-2 gap-8">

              {/* Create Team */}
              <div className="p-6 rounded-xl bg-[#0b1428]/70 border border-blue-500/20 backdrop-blur-xl shadow shadow-blue-900/30">
                <h3 className="font-bold text-xl mb-3 flex items-center gap-2 text-blue-300">
                  <Plus className="w-5 h-5" /> Create Team
                </h3>

                <input
                  placeholder="Team name"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="w-full p-3 mb-3 rounded bg-[#0a0f1f] border border-blue-500/20 text-blue-200 outline-none focus:border-blue-400"
                />

                <button
                  disabled={!teamName.trim() || saving}
                  onClick={createTeam}
                  className="w-full py-3 rounded-lg font-semibold bg-blue-500 text-black hover:bg-blue-400 disabled:opacity-50 transition"
                >
                  {saving ? 'Creating...' : 'Create'}
                </button>
              </div>

              {/* Join Team */}
              <div className="p-6 rounded-xl bg-[#0b1428]/70 border border-blue-500/20 backdrop-blur-xl shadow shadow-blue-900/30">
                <h3 className="font-bold text-xl mb-3 flex items-left gap-2 text-blue-300">
                  <LogIn className="w-5 h-5" /> Join Team
                </h3>

                <input
                  placeholder="Join code"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  className="w-full p-3 mb-3 rounded bg-[#0a0f1f] border border-blue-500/20 text-blue-200 outline-none focus:border-blue-400"
                />

                <button
                  disabled={!joinCode.trim() || saving}
                  onClick={joinTeam}
                  className="w-full py-3 rounded-lg font-semibold bg-blue-500 text-black hover:bg-blue-400 disabled:opacity-50 transition"
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
