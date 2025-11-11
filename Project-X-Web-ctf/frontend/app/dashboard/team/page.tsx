'use client';
import { useEffect, useState } from 'react';
import { Users, Copy, RefreshCw, Trophy, Plus, LogIn } from 'lucide-react';
import { apiFetch } from '@/lib/api'; // ✅ use your real API util (must include credentials)

type Member = { id: number; username: string };
type Team = {
  id: number;
  name: string;
  joinCode?: string;
  totalPoints?: number;
  members?: Member[];
};

export default function TeamPage() {
  const [team, setTeam] = useState<Team | null>(null);
  const [joinCode, setJoinCode] = useState('');
  const [teamName, setTeamName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // 🔹 Fetch current user’s team on mount
  useEffect(() => {
    fetchMyTeam();
  }, []);

  // 🧭 Load current user’s team data
  async function fetchMyTeam() {
    setLoading(true);
    setError(null);
    try {
      const res: any = await apiFetch('/team/me');
      const t = res?.team ?? null;

      if (!t || res.error || res.message?.toLowerCase().includes('not in a team')) {
        setTeam(null);
      } else {
        setTeam({
          id: t.id,
          name: t.name,
          joinCode: t.joinCode,
          totalPoints: t.totalPoints ?? 0,
          members: Array.isArray(t.members) ? t.members : [],
        });
      }
    } catch (err) {
      console.error('❌ Team fetch error:', err);
      setError('Unable to load team information.');
      setTeam(null);
    } finally {
      setLoading(false);
    }
  }

  // 🧱 Create new team
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
        await fetchMyTeam();
      }
    } catch (err) {
      console.error('Create team error:', err);
      setError('Server error while creating team.');
    } finally {
      setSaving(false);
      setTeamName('');
    }
  };

  // 🔑 Join existing team
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
        await fetchMyTeam();
      }
    } catch (err) {
      console.error('Join team error:', err);
      setError('Server error while joining team.');
    } finally {
      setSaving(false);
      setJoinCode('');
    }
  };

  // 📋 Copy join code to clipboard
  const copyJoinCode = () => {
    if (!team?.joinCode) return;
    navigator.clipboard.writeText(team.joinCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 🌀 Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-black text-green-500 flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 animate-spin" />
          <p className="text-sm">Loading team info...</p>
        </div>
      </div>
    );
  }

  // 🧩 Render UI
  return (
    <div className="min-h-screen bg-black text-green-500 p-6">
      <div className="max-w-2xl mx-auto">
        {error && (
          <div className="mb-4 p-3 bg-red-950 border border-red-600 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        {team ? (
          // ✅ Team Dashboard
          <div className="space-y-6">
            {/* Team Header */}
            <div className="border border-green-600 rounded-lg p-6 bg-gradient-to-br from-green-950/20 to-black">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
                    <Users className="w-8 h-8" />
                    {team.name}
                  </h1>
                  <div className="flex items-center gap-2 text-green-300">
                    <Trophy className="w-5 h-5" />
                    <span className="text-xl font-semibold">
                      {team.totalPoints ?? 0} pts
                    </span>
                  </div>
                </div>

                <button
                  onClick={fetchMyTeam}
                  className="p-2 hover:bg-green-900/30 rounded-lg transition-colors border border-green-600"
                  title="Refresh"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
              </div>

              {team.joinCode && (
                <div className="mt-4 p-3 bg-black/50 border border-green-700 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-green-400 mb-1">Join Code</p>
                      <p className="text-lg font-mono text-green-300">{team.joinCode}</p>
                    </div>
                    <button
                      onClick={copyJoinCode}
                      className="p-2 hover:bg-green-900/30 rounded-lg transition-colors"
                      title="Copy code"
                    >
                      {copied ? (
                        <span className="text-xs text-green-400">Copied!</span>
                      ) : (
                        <Copy className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Members List */}
            <div className="border border-green-600 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Team Members ({team.members?.length ?? 0})
              </h3>

              {Array.isArray(team.members) && team.members.length > 0 ? (
                <div className="grid gap-2">
                  {team.members.map((m, idx) => (
                    <div
                      key={m.id}
                      className="p-3 bg-green-950/20 border border-green-800 rounded-lg flex items-center gap-3 hover:bg-green-900/20 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-green-900/50 border border-green-600 flex items-center justify-center text-sm font-semibold">
                        {idx + 1}
                      </div>
                      <span className="font-medium">{m.username}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm">No members yet</p>
              )}
            </div>
          </div>
        ) : (
          // 🧠 No Team Yet → Create / Join UI
          <div className="space-y-6">
            <div className="text-center py-8">
              <Users className="w-16 h-16 mx-auto mb-4 text-green-600" />
              <h2 className="text-2xl font-bold mb-2">Join the Competition</h2>
              <p className="text-green-300 text-sm">
                Create a new team or join an existing one to get started
              </p>
            </div>

            {/* Create Team */}
            <div className="border border-green-600 rounded-lg p-6 bg-gradient-to-br from-green-950/20 to-black">
              <div className="flex items-center gap-2 mb-4">
                <Plus className="w-5 h-5" />
                <h3 className="text-lg font-semibold">Create New Team</h3>
              </div>
              <input
                placeholder="Enter team name"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !saving && createTeam()}
                className="p-3 border border-green-500 bg-black text-white rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-green-500 mb-3"
              />
              <button
                onClick={createTeam}
                disabled={saving || !teamName.trim()}
                className="bg-green-500 text-black px-6 py-3 rounded-lg w-full font-semibold hover:bg-green-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Create Team
                  </>
                )}
              </button>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-green-700"></div>
              <span className="text-green-400 text-sm">OR</span>
              <div className="flex-1 h-px bg-green-700"></div>
            </div>

            {/* Join Team */}
            <div className="border border-green-600 rounded-lg p-6 bg-gradient-to-br from-green-950/20 to-black">
              <div className="flex items-center gap-2 mb-4">
                <LogIn className="w-5 h-5" />
                <h3 className="text-lg font-semibold">Join Existing Team</h3>
              </div>
              <input
                placeholder="Enter join code"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !saving && joinTeam()}
                className="p-3 border border-green-500 bg-black text-white rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-green-500 mb-3 font-mono"
              />
              <button
                onClick={joinTeam}
                disabled={saving || !joinCode.trim()}
                className="bg-green-500 text-black px-6 py-3 rounded-lg w-full font-semibold hover:bg-green-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Joining...
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    Join Team
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
