'use client';

import { useEffect, useState } from 'react';
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
} from 'lucide-react';
import { apiFetch } from '@/lib/api';

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
  team?: {
    id: number;
    name: string;
  } | null;
}

interface ProfileForm {
  bio: string;
  country: string;
  avatarUrl: string;
}

/**
 * ProfilePage
 * -----------
 * Displays and updates user profile:
 *  - Bio
 *  - Country
 *  - Avatar URL
 *  - Solved challenges list
 *  - Stats summary
 */
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

  /**
   * Fetch authenticated user’s profile
   */
  const fetchProfile = async () => {
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
  };

  /**
   * Save profile updates
   */
  const saveProfile = async () => {
    setSaving(true);
    try {
      const response = await apiFetch('/profile/me', {
        method: 'PUT',
        body: JSON.stringify(form),
      });

      if (response.user) {
        setProfile(response.user);
        setEditing(false);
      }
    } catch (err) {
      console.error('Profile update error:', err);
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  /* --------------------------------------------------------------------------
   * LOADING STATE
   * -------------------------------------------------------------------------- */
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-green-400">
        <RefreshCw className="w-6 h-6 animate-spin mr-2" />
        Loading profile...
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center text-green-400 p-10">
        No profile found. Please log in.
      </div>
    );
  }

  /* --------------------------------------------------------------------------
   * MAIN UI
   * -------------------------------------------------------------------------- */
  return (
    <div className="min-h-screen bg-black text-green-500 p-6">
      <div className="max-w-3xl mx-auto border border-green-600 rounded-lg p-8 bg-gray-900/50 shadow-xl shadow-green-500/10">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-green-300">&gt; Profile</h1>

          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-2 px-3 py-1 text-sm font-semibold border border-green-600 rounded hover:bg-green-900/30 transition"
            >
              <Edit3 className="w-4 h-4" />
              Edit
            </button>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={saveProfile}
                disabled={saving}
                className="flex items-center gap-1 px-4 py-1 text-sm font-semibold bg-green-500 text-black rounded hover:bg-green-400 transition disabled:opacity-60"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save'}
              </button>

              <button
                onClick={() => setEditing(false)}
                className="flex items-center gap-1 px-4 py-1 text-sm font-semibold border border-red-500 text-red-400 rounded hover:bg-red-900/40 transition"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* USER INFO */}
        <div className="flex items-center gap-6 mb-10">
          <img
            src={form.avatarUrl || '/default-avatar.png'}
            alt="avatar"
            className="w-24 h-24 rounded-full border-2 border-green-500 object-cover"
          />

          <div className="flex-1">
            <h2 className="text-3xl font-bold text-white">
              {profile.username}
            </h2>

            {/* Bio */}
            {!editing ? (
              <p className="text-green-300 mt-1 text-sm">
                {profile.bio || 'No bio added yet.'}
              </p>
            ) : (
              <textarea
                rows={2}
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                className="w-full p-2 mt-2 bg-black border border-green-600 rounded text-green-300 text-sm"
              />
            )}

            {/* Country / Team */}
            <div className="flex items-center gap-4 mt-3 text-sm">
              {!editing ? (
                <>
                  {profile.country && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {profile.country}
                    </div>
                  )}

                  {profile.team && (
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {profile.team.name}
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col gap-2 w-full">
                  <input
                    placeholder="Country"
                    value={form.country}
                    onChange={(e) => setForm({ ...form, country: e.target.value })}
                    className="p-2 bg-black border border-green-600 rounded text-green-300 text-sm"
                  />

                  <input
                    placeholder="Avatar URL"
                    value={form.avatarUrl}
                    onChange={(e) => setForm({ ...form, avatarUrl: e.target.value })}
                    className="p-2 bg-black border border-green-600 rounded text-green-300 text-sm"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-10">
          {/* POINTS */}
          <ProfileStat
            icon={Trophy}
            value={profile.totalPoints}
            label="Total Points"
          />

          {/* CHALLENGES SOLVED */}
          <ProfileStat
            icon={Flag}
            value={profile.challengesSolved?.length || 0}
            label="Challenges Solved"
          />

          {/* DATE JOINED */}
          <ProfileStat
            icon={User}
            value={new Date(profile.createdAt).toLocaleDateString()}
            label="Joined"
          />
        </div>

        {/* SOLVED CHALLENGES */}
        <h2 className="text-xl font-bold mb-3 border-b border-green-700 pb-2">
          Solved Challenges
        </h2>

        {profile.challengesSolved.length > 0 ? (
          <div className="space-y-3">
            {profile.challengesSolved.map((c) => (
              <div
                key={c.id}
                className="border border-green-700 rounded-lg p-4 flex items-center justify-between bg-black/40"
              >
                <div>
                  <div className="text-white font-semibold">{c.name}</div>
                  <div className="text-xs text-green-400">{c.category}</div>
                </div>
                <span className="font-bold text-green-300">{c.points} pts</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-sm">No challenges solved yet.</p>
        )}
      </div>
    </div>
  );
}

/* ==========================================================================
 * Reusable stat card component
 * ========================================================================== */
function ProfileStat({
  icon: Icon,
  value,
  label,
}: {
  icon: any;
  value: any;
  label: string;
}) {
  return (
    <div className="border border-green-600 rounded-lg p-4 text-center shadow-green-500/10 shadow-md bg-gray-900/40">
      <Icon className="w-6 h-6 mx-auto mb-1 text-green-300" />
      <div className="text-xl font-bold">{value}</div>
      <p className="text-xs text-green-400">{label}</p>
    </div>
  );
}
