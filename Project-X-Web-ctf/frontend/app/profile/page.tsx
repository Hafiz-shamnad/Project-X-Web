'use client';
import { useEffect, useState } from 'react';
import { User, Flag, Users, Trophy, MapPin, RefreshCw, Edit3, Save, X } from 'lucide-react';
import { apiFetch } from '@/lib/api';

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ bio: '', country: '', avatarUrl: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    setLoading(true);
    try {
      const data = await apiFetch('/profile/me');
      setProfile(data);
      setForm({
        bio: data.bio || '',
        country: data.country || '',
        avatarUrl: data.avatarUrl || '',
      });
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  }

  async function saveProfile() {
    setSaving(true);
    try {
      const res = await apiFetch('/profile/me', {
        method: 'PUT',
        body: JSON.stringify(form),
      });
      if (res.user) {
        setProfile(res.user);
        setEditing(false);
      }
    } catch (err) {
      console.error('Save error:', err);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-green-500">
        <RefreshCw className="w-6 h-6 animate-spin mr-2" /> Loading profile...
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center text-green-400 p-10">
        <p>No profile found. Please log in again.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-green-500 p-6">
      <div className="max-w-3xl mx-auto border border-green-600 rounded-lg p-8 bg-gray-900/50">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-green-400">&gt; Profile</h1>
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-1 px-3 py-1 text-sm font-semibold border border-green-600 rounded hover:bg-green-900/30"
            >
              <Edit3 className="w-4 h-4" /> Edit
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={saveProfile}
                disabled={saving}
                className="flex items-center gap-1 px-3 py-1 text-sm font-semibold bg-green-500 text-black rounded hover:bg-green-400"
              >
                <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={() => setEditing(false)}
                className="flex items-center gap-1 px-3 py-1 text-sm font-semibold border border-red-500 text-red-400 rounded hover:bg-red-900/30"
              >
                <X className="w-4 h-4" /> Cancel
              </button>
            </div>
          )}
        </div>

        {/* USER INFO */}
        <div className="flex items-center space-x-6 mb-8">
          <img
            src={form.avatarUrl || '/default-avatar.png'}
            alt="avatar"
            className="w-20 h-20 rounded-full border-2 border-green-500 object-cover"
          />
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-white">{profile.username}</h2>

            {!editing ? (
              <p className="text-green-300 text-sm mt-1">{profile.bio || 'No bio added yet.'}</p>
            ) : (
              <textarea
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                className="w-full p-2 mt-2 text-sm bg-black border border-green-600 rounded text-green-400"
                rows={2}
              />
            )}

            <div className="flex items-center space-x-4 mt-3 text-sm">
              {!editing ? (
                <>
                  {profile.country && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" /> {profile.country}
                    </div>
                  )}
                  {profile.team && (
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" /> {profile.team.name}
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col gap-2">
                  <input
                    placeholder="Country"
                    value={form.country}
                    onChange={(e) => setForm({ ...form, country: e.target.value })}
                    className="p-2 bg-black border border-green-600 rounded text-green-400 text-sm"
                  />
                  <input
                    placeholder="Avatar URL"
                    value={form.avatarUrl}
                    onChange={(e) => setForm({ ...form, avatarUrl: e.target.value })}
                    className="p-2 bg-black border border-green-600 rounded text-green-400 text-sm"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
          <div className="border border-green-600 rounded-lg p-4 text-center">
            <Trophy className="w-6 h-6 mx-auto mb-1" />
            <div className="text-xl font-bold">{profile.totalPoints}</div>
            <p className="text-xs text-green-400">Total Points</p>
          </div>
          <div className="border border-green-600 rounded-lg p-4 text-center">
            <Flag className="w-6 h-6 mx-auto mb-1" />
            <div className="text-xl font-bold">
              {profile.challengesSolved?.length || 0}
            </div>
            <p className="text-xs text-green-400">Challenges Solved</p>
          </div>
          <div className="border border-green-600 rounded-lg p-4 text-center">
            <User className="w-6 h-6 mx-auto mb-1" />
            <div className="text-xl font-bold">
              {new Date(profile.createdAt).toLocaleDateString()}
            </div>
            <p className="text-xs text-green-400">Joined</p>
          </div>
        </div>

        {/* SOLVED CHALLENGES */}
        <h2 className="text-xl font-bold mb-3 border-b border-green-600 pb-2">
          Solved Challenges
        </h2>
        <div className="space-y-3">
          {profile.challengesSolved?.length > 0 ? (
            profile.challengesSolved.map((c: any) => (
              <div
                key={c.id}
                className="border border-green-700 rounded-lg p-3 flex justify-between items-center bg-black/50"
              >
                <div>
                  <div className="font-semibold text-white">{c.name}</div>
                  <div className="text-xs text-green-400">{c.category}</div>
                </div>
                <span className="text-green-300 font-bold">{c.points} pts</span>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-400">No challenges solved yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
