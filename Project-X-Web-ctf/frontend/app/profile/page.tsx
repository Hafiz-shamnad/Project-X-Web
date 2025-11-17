'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  User,
  Flag,
  Users,
  Trophy,
  MapPin,
  RefreshCw,
  Edit3,
  Save,
  X,
  Award,
  Calendar,
  Target,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

interface Profile {
  id: number;
  username: string;
  bio: string;
  country: string;
  avatarUrl: string;
  createdAt: string;
  totalPoints: number;
  challengesSolved: {
    id: number;
    name: string;
    category: string;
    points: number;
  }[];
  team?: { id: number; name: string } | null;
}

interface ProfileForm {
  bio: string;
  country: string;
  avatarUrl: string;
}

// API helper function
async function apiFetch(endpoint: string, options?: any) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
  const res = await fetch(`${baseUrl}${endpoint}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  });
  return res.json();
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [form, setForm] = useState<ProfileForm>({
    bio: '',
    country: '',
    avatarUrl: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

  /** Fetch Profile — Optimized */
  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiFetch('/profile/me');

      setProfile(data);
      setForm({
        bio: data.bio || '',
        country: data.country || '',
        avatarUrl: data.avatarUrl || '',
      });
    } catch (err) {
      console.error('Profile fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /** Save Profile */
  const saveProfile = useCallback(async () => {
    try {
      setSaving(true);
      const res = await apiFetch('/profile/me', {
        method: 'PUT',
        body: JSON.stringify(form),
      });

      if (res.user) {
        setProfile(res.user);
        setEditing(false);
      }
    } catch (err) {
      console.error('Profile update error:', err);
    } finally {
      setSaving(false);
    }
  }, [form]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  /* ----------------------------------------------------------------------
   * LOADING
   * ---------------------------------------------------------------------- */
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
          <p className="text-blue-400 text-lg font-mono">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 flex items-center justify-center">
        <div className="text-center p-10 rounded-2xl bg-slate-900/50 border border-blue-500/30 backdrop-blur-sm">
          <User className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-blue-300 text-lg">No profile found. Please log in.</p>
        </div>
      </div>
    );
  }

  /* ----------------------------------------------------------------------
   * MAIN UI
   * ---------------------------------------------------------------------- */
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 p-6 max-w-5xl mx-auto">
        {/* Profile Card */}
        <div className="backdrop-blur-md bg-slate-900/40 border border-blue-500/30 shadow-[0_8px_32px_rgba(59,130,246,0.2)] rounded-3xl overflow-hidden">
          
          {/* Header Banner */}
          <div className="relative h-32 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-cyan-500/20 border-b border-blue-500/30">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.05)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
            
            {/* Edit Button */}
            <div className="absolute top-6 right-6">
              {!editing ? (
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 backdrop-blur-sm rounded-xl transition-all duration-300 text-blue-200 font-semibold"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit Profile
                </button>
              ) : (
                <div className="flex gap-3">
                  <button
                    onClick={saveProfile}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-500/80 hover:bg-emerald-500 backdrop-blur-sm rounded-xl transition-all duration-300 text-white font-semibold disabled:opacity-50 shadow-lg"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? 'Saving...' : 'Save'}
                  </button>

                  <button
                    onClick={() => setEditing(false)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 backdrop-blur-sm rounded-xl transition-all duration-300 text-red-300 font-semibold"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="p-8 -mt-16">
            {/* Avatar & Info Section */}
            <div className="flex flex-col md:flex-row gap-8 mb-8">
              {/* Avatar */}
              <div className="relative">
                <div className="relative w-32 h-32 rounded-2xl overflow-hidden border-4 border-slate-900 shadow-[0_8px_32px_rgba(59,130,246,0.3)]">
                  <img
                    src={form.avatarUrl || '/default-avatar.png'}
                    alt={profile.username}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-500/20 to-transparent"></div>
                </div>
                <div className="absolute -bottom-2 -right-2 p-2 rounded-xl bg-gradient-to-br from-blue-500/80 to-cyan-500/80 border border-blue-400/50 shadow-lg">
                  <Trophy className="w-5 h-5 text-white" />
                </div>
              </div>

              {/* User Info */}
              <div className="flex-1">
                <div className="mb-4">
                  <h1 className="text-4xl font-black bg-gradient-to-r from-blue-200 via-cyan-200 to-purple-200 bg-clip-text text-transparent mb-2">
                    {profile.username}
                  </h1>
                  
                  {/* Bio */}
                  {!editing ? (
                    <p className="text-slate-300 text-base leading-relaxed">
                      {profile.bio || '✨ No bio added yet. Click Edit Profile to add one!'}
                    </p>
                  ) : (
                    <textarea
                      rows={3}
                      value={form.bio}
                      onChange={(e) => setForm({ ...form, bio: e.target.value })}
                      placeholder="Tell us about yourself..."
                      className="w-full p-4 bg-slate-800/50 border border-blue-500/30 rounded-xl text-slate-200 placeholder:text-slate-500 focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                  )}
                </div>

                {/* Meta Info */}
                <div className="flex flex-wrap gap-4">
                  {!editing ? (
                    <>
                      {profile.country && (
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-500/10 border border-blue-500/30">
                          <MapPin className="w-4 h-4 text-blue-400" />
                          <span className="text-blue-200 text-sm font-medium">{profile.country}</span>
                        </div>
                      )}

                      {profile.team && (
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-purple-500/10 border border-purple-500/30">
                          <Users className="w-4 h-4 text-purple-400" />
                          <span className="text-purple-200 text-sm font-medium">{profile.team.name}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-500/10 border border-slate-500/30">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-200 text-sm font-medium">
                          Joined {new Date(profile.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col gap-3 w-full max-w-md">
                      <input
                        placeholder="🌍 Country (e.g., United States)"
                        value={form.country}
                        onChange={(e) => setForm({ ...form, country: e.target.value })}
                        className="p-3 bg-slate-800/50 border border-blue-500/30 rounded-xl text-slate-200 placeholder:text-slate-500 focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                      />

                      <input
                        placeholder="🖼️ Avatar URL (https://...)"
                        value={form.avatarUrl}
                        onChange={(e) => setForm({ ...form, avatarUrl: e.target.value })}
                        className="p-3 bg-slate-800/50 border border-blue-500/30 rounded-xl text-slate-200 placeholder:text-slate-500 focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
              <ProfileStat 
                icon={Trophy} 
                value={profile.totalPoints} 
                label="Total Points"
                color="yellow"
              />
              <ProfileStat
                icon={Flag}
                value={profile.challengesSolved?.length || 0}
                label="Challenges Solved"
                color="green"
              />
              <ProfileStat
                icon={Target}
                value={`${Math.round((profile.challengesSolved?.length || 0) / Math.max(1, profile.totalPoints / 100) * 100)}%`}
                label="Success Rate"
                color="blue"
              />
            </div>

            {/* Solved Challenges */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-emerald-500/20 border border-emerald-500/30">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                </div>
                <h2 className="text-2xl font-bold text-blue-200">Solved Challenges</h2>
                <span className="ml-auto px-3 py-1 rounded-lg bg-blue-500/20 border border-blue-500/30 text-blue-300 text-sm font-mono">
                  {profile.challengesSolved.length} completed
                </span>
              </div>

              {profile.challengesSolved.length > 0 ? (
                <div className="grid gap-3">
                  {profile.challengesSolved.map((c, idx) => (
                    <div
                      key={c.id}
                      className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-slate-800/40 via-slate-900/40 to-slate-800/40 border border-blue-500/20 p-5 backdrop-blur-sm hover:border-blue-500/40 hover:shadow-[0_4px_20px_rgba(59,130,246,0.15)] transition-all duration-300"
                      style={{ animationDelay: `${idx * 30}ms` }}
                    >
                      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-cyan-500 via-blue-500 to-purple-500 opacity-50 group-hover:opacity-100 transition-opacity"></div>
                      
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="p-2 rounded-lg bg-blue-500/20 border border-blue-500/30">
                            <Award className="w-5 h-5 text-blue-400" />
                          </div>
                          
                          <div>
                            <div className="text-blue-100 font-bold text-lg">{c.name}</div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="px-2 py-0.5 rounded-md bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-medium">
                                {c.category}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="px-4 py-2 rounded-lg bg-emerald-500/20 border border-emerald-500/30">
                            <span className="text-emerald-300 font-black text-xl">{c.points}</span>
                            <span className="text-emerald-400/70 text-sm ml-1">pts</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 rounded-xl bg-slate-800/30 border border-slate-700/50">
                  <Sparkles className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400 text-lg">No challenges solved yet.</p>
                  <p className="text-slate-500 text-sm mt-2">Start your hacking journey today! 🚀</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
 * Reusable Stat Component
 * ========================================================================== */
function ProfileStat({
  icon: Icon,
  value,
  label,
  color = 'blue',
}: {
  icon: any;
  value: any;
  label: string;
  color?: 'blue' | 'green' | 'yellow';
}) {
  const colorSchemes = {
    blue: {
      bg: 'from-blue-500/10 to-cyan-500/5',
      border: 'border-blue-500/30',
      icon: 'text-blue-400',
      value: 'text-blue-100',
      label: 'text-blue-300',
    },
    green: {
      bg: 'from-emerald-500/10 to-green-500/5',
      border: 'border-emerald-500/30',
      icon: 'text-emerald-400',
      value: 'text-emerald-100',
      label: 'text-emerald-300',
    },
    yellow: {
      bg: 'from-yellow-500/10 to-amber-500/5',
      border: 'border-yellow-500/30',
      icon: 'text-yellow-400',
      value: 'text-yellow-100',
      label: 'text-yellow-300',
    },
  };

  const scheme = colorSchemes[color];

  return (
    <div className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${scheme.bg} border ${scheme.border} p-6 backdrop-blur-sm hover:shadow-lg transition-all duration-300 group`}>
      <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-all duration-300"></div>
      
      <div className="relative">
        <Icon className={`w-8 h-8 ${scheme.icon} mb-3`} />
        <div className={`text-3xl font-black ${scheme.value} mb-1`}>{value}</div>
        <p className={`text-sm font-medium ${scheme.label}`}>{label}</p>
      </div>
    </div>
  );
}