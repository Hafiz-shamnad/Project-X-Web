'use client';
import { useEffect, useState } from 'react';
import { Users, Copy, RefreshCw, Trophy, Plus, LogIn, Check, Sparkles, Crown, Shield } from 'lucide-react';
import { apiFetch } from '@/lib/api';

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
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchMyTeam();
  }, []);

  // Show success message temporarily
  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

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
        showSuccess('Team created successfully!');
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
        showSuccess('Successfully joined team!');
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

  const copyJoinCode = () => {
    if (!team?.joinCode) return;
    navigator.clipboard.writeText(team.joinCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-green-500 flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <RefreshCw className="w-12 h-12 animate-spin text-green-500" />
            <div className="absolute inset-0 blur-xl bg-green-500/30 animate-pulse"></div>
          </div>
          <p className="text-sm text-green-400 font-medium">Loading team info...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-green-500 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-gradient-to-r from-green-950/50 to-emerald-950/50 border border-green-500/50 rounded-xl text-green-300 text-sm flex items-center gap-3 animate-in slide-in-from-top-2 duration-300 shadow-lg shadow-green-500/20">
            <Check className="w-5 h-5 text-green-400" />
            {successMessage}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-gradient-to-r from-red-950/50 to-red-900/50 border border-red-500/50 rounded-xl text-red-300 text-sm animate-in slide-in-from-top-2 duration-300 shadow-lg shadow-red-500/20">
            {error}
          </div>
        )}

        {team ? (
          // Team Dashboard
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Team Header Card */}
            <div className="relative border border-green-500/50 rounded-2xl p-6 sm:p-8 bg-gradient-to-br from-green-950/30 via-gray-900/50 to-black backdrop-blur-sm overflow-hidden group hover:border-green-400/60 transition-all duration-300">
              {/* Background Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="relative">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="relative">
                        <Shield className="w-10 h-10 text-green-400" />
                        <div className="absolute inset-0 blur-lg bg-green-400/30"></div>
                      </div>
                      <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                        {team.name}
                      </h1>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-black/50 rounded-lg w-fit border border-green-500/30">
                      <Trophy className="w-6 h-6 text-yellow-400" />
                      <div>
                        <p className="text-xs text-green-400 mb-0.5">Total Points</p>
                        <span className="text-2xl font-bold text-green-300">
                          {team.totalPoints ?? 0}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={fetchMyTeam}
                    className="p-3 hover:bg-green-900/30 rounded-xl transition-all duration-200 border border-green-500/50 hover:border-green-400 hover:scale-105 active:scale-95 group"
                    title="Refresh team data"
                  >
                    <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                  </button>
                </div>

                {/* Join Code Section */}
                {team.joinCode && (
                  <div className="p-4 bg-gradient-to-br from-black/70 to-green-950/20 border border-green-500/30 rounded-xl backdrop-blur-sm hover:border-green-400/50 transition-all duration-300">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Sparkles className="w-4 h-4 text-green-400" />
                          <p className="text-xs text-green-400 font-medium">Team Join Code</p>
                        </div>
                        <p className="text-xl sm:text-2xl font-mono text-green-300 tracking-wider font-bold">
                          {team.joinCode}
                        </p>
                      </div>
                      <button
                        onClick={copyJoinCode}
                        className="px-4 py-3 hover:bg-green-900/40 rounded-lg transition-all duration-200 border border-green-500/30 hover:border-green-400 hover:scale-105 active:scale-95 group"
                        title="Copy join code"
                      >
                        {copied ? (
                          <div className="flex items-center gap-2 text-green-400">
                            <Check className="w-5 h-5" />
                            <span className="text-sm font-medium">Copied!</span>
                          </div>
                        ) : (
                          <Copy className="w-5 h-5 text-green-400 group-hover:text-green-300" />
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Members Section */}
            <div className="border border-green-500/50 rounded-2xl p-6 sm:p-8 bg-gradient-to-br from-green-950/20 via-gray-900/50 to-black backdrop-blur-sm hover:border-green-400/60 transition-all duration-300">
              <div className="flex items-center gap-3 mb-6">
                <Users className="w-6 h-6 text-green-400" />
                <h3 className="text-xl sm:text-2xl font-semibold text-green-300">
                  Team Members
                </h3>
                <span className="px-3 py-1 bg-green-900/40 border border-green-500/30 rounded-full text-sm font-semibold">
                  {team.members?.length ?? 0}
                </span>
              </div>

              {Array.isArray(team.members) && team.members.length > 0 ? (
                <div className="grid gap-3">
                  {team.members.map((m, idx) => (
                    <div
                      key={m.id}
                      className="group p-4 bg-gradient-to-r from-green-950/20 to-transparent border border-green-500/30 rounded-xl flex items-center gap-4 hover:bg-green-900/20 hover:border-green-400/50 transition-all duration-300 hover:scale-[1.02] active:scale-100"
                    >
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-lg font-bold text-black shadow-lg">
                          {idx === 0 ? <Crown className="w-6 h-6" /> : idx + 1}
                        </div>
                        {idx === 0 && (
                          <div className="absolute inset-0 rounded-full blur-md bg-yellow-400/30 -z-10"></div>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <p className="font-semibold text-green-300 text-lg">
                          {m.username}
                        </p>
                        {idx === 0 && (
                          <p className="text-xs text-yellow-400 font-medium">Team Leader</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 mx-auto mb-3 text-green-600/50" />
                  <p className="text-gray-400">No members yet</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          // No Team - Create/Join UI
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Hero Section */}
            <div className="text-center py-8 sm:py-12">
              <div className="relative inline-block mb-6">
                <Shield className="w-20 h-20 sm:w-24 sm:h-24 mx-auto text-green-500" />
                <div className="absolute inset-0 blur-2xl bg-green-500/30 animate-pulse"></div>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-3 bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                Join the Competition
              </h2>
              <p className="text-green-400 text-sm sm:text-base max-w-md mx-auto">
                Create your own team or join forces with existing players to dominate the leaderboard
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Create Team Card */}
              <div className="border border-green-500/50 rounded-2xl p-6 sm:p-8 bg-gradient-to-br from-green-950/30 via-gray-900/50 to-black backdrop-blur-sm hover:border-green-400/60 transition-all duration-300 hover:scale-[1.02]">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-green-900/30 rounded-lg border border-green-500/30">
                    <Plus className="w-6 h-6 text-green-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-green-300">Create New Team</h3>
                </div>
                
                <input
                  placeholder="Enter your team name"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !saving && teamName.trim() && createTeam()}
                  className="p-4 border border-green-500/50 bg-black/70 text-white rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent mb-4 transition-all duration-200 placeholder:text-gray-500"
                />
                
                <button
                  onClick={createTeam}
                  disabled={saving || !teamName.trim()}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 text-black px-6 py-4 rounded-xl w-full font-semibold hover:from-green-400 hover:to-emerald-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-green-500/30 hover:shadow-green-500/50 hover:scale-105 active:scale-100 disabled:hover:scale-100"
                >
                  {saving ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5" />
                      Create Team
                    </>
                  )}
                </button>
              </div>

              {/* Join Team Card */}
              <div className="border border-green-500/50 rounded-2xl p-6 sm:p-8 bg-gradient-to-br from-green-950/30 via-gray-900/50 to-black backdrop-blur-sm hover:border-green-400/60 transition-all duration-300 hover:scale-[1.02]">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-green-900/30 rounded-lg border border-green-500/30">
                    <LogIn className="w-6 h-6 text-green-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-green-300">Join Existing Team</h3>
                </div>
                
                <input
                  placeholder="Enter team join code"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !saving && joinCode.trim() && joinTeam()}
                  className="p-4 border border-green-500/50 bg-black/70 text-white rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent mb-4 font-mono text-lg tracking-wider transition-all duration-200 placeholder:text-gray-500 placeholder:font-sans placeholder:text-base placeholder:tracking-normal"
                />
                
                <button
                  onClick={joinTeam}
                  disabled={saving || !joinCode.trim()}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 text-black px-6 py-4 rounded-xl w-full font-semibold hover:from-green-400 hover:to-emerald-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-green-500/30 hover:shadow-green-500/50 hover:scale-105 active:scale-100 disabled:hover:scale-100"
                >
                  {saving ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Joining...
                    </>
                  ) : (
                    <>
                      <LogIn className="w-5 h-5" />
                      Join Team
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}