'use client';

import React, { useEffect, useState } from 'react';
import { Terminal, Lock, Unlock, Flag, Trophy, Users, Target, Shield, Code, Zap } from 'lucide-react';

export default function ProjectXCTF() {
  const [activeTab, setActiveTab] = useState<'challenges' | 'leaderboard'>('challenges');
  const [challenges, setChallenges] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [solvedChallenges, setSolvedChallenges] = useState<number[]>([]);
  const [username, setUsername] = useState('H4ck3rPr0');
  const [loading, setLoading] = useState(true);

  const backendURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

  // Fetch challenges + leaderboard
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [challengeRes, leaderboardRes, userRes] = await Promise.all([
          fetch(`${backendURL}/challenges`),
          fetch(`${backendURL}/leaderboard`),
          fetch(`${backendURL}/user/${username}`)
        ]);

        const challengeData = await challengeRes.json();
        const leaderboardData = await leaderboardRes.json();
        const userData = await userRes.json();

        setChallenges(challengeData);
        setLeaderboard(leaderboardData);
        setSolvedChallenges(userData.solved.map((s: any) => s.challengeId || s)); // works with Prisma schema
      } catch (err) {
        console.error('❌ Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [backendURL, username]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return 'text-green-500';
      case 'Medium':
        return 'text-yellow-500';
      case 'Hard':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const toggleSolve = async (id: number) => {
    try {
      const res = await fetch(`${backendURL}/user/solve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, challengeId: id })
      });
      const data = await res.json();

      if (data.status === 'solved') {
        setSolvedChallenges((prev) => [...prev, id]);
      } else if (data.status === 'unsolved') {
        setSolvedChallenges((prev) => prev.filter((cId) => cId !== id));
      }
    } catch (err) {
      console.error('Error toggling challenge:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-green-500">
        <Terminal className="w-8 h-8 mr-2 animate-spin" /> Loading challenges...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-green-500">
      {/* HEADER */}
      <header className="border-b-2 border-green-500 bg-black sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="w-8 h-8 text-green-500" />
              <h1 className="text-3xl font-bold text-green-500">&gt; PROJECT_X</h1>
            </div>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Trophy className="w-5 h-5" />
                <span className="text-sm">Rank: #42</span>
              </div>
              <div className="flex items-center space-x-2">
                <Flag className="w-5 h-5" />
                <span className="text-sm">
                  Score:{' '}
                  {solvedChallenges.reduce(
                    (sum, id) => sum + (challenges.find((c) => c.id === id)?.points || 0),
                    0
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* HERO */}
      <div className="bg-black py-16 border-b border-green-500">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <Terminal className="w-16 h-16 mx-auto mb-4 text-green-500" />
          <h2 className="text-4xl font-bold mb-4">
            <span className="text-white">CAPTURE THE </span>
            <span className="text-green-500">FLAG</span>
          </h2>
          <p className="text-green-300 text-lg max-w-2xl mx-auto">
            Test your hacking skills against real security challenges powered by our live PostgreSQL backend.
          </p>
          <div className="flex justify-center space-x-4 mt-8">
            <div className="bg-gray-900 border border-green-500 px-6 py-3 rounded">
              <Code className="w-6 h-6 inline-block mr-2" />
              <span className="font-bold">{challenges.length}</span> Active Challenges
            </div>
            <div className="bg-gray-900 border border-green-500 px-6 py-3 rounded">
              <Users className="w-6 h-6 inline-block mr-2" />
              <span className="font-bold">1,337</span> Hackers Online
            </div>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="max-w-7xl mx-auto px-4 mt-8">
        <div className="flex space-x-4 border-b border-green-500">
          <button
            onClick={() => setActiveTab('challenges')}
            className={`px-6 py-3 font-bold ${
              activeTab === 'challenges'
                ? 'border-b-2 border-green-500 text-green-500'
                : 'text-gray-500 hover:text-green-500'
            }`}
          >
            <Target className="w-4 h-4 inline-block mr-2" />
            CHALLENGES
          </button>
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`px-6 py-3 font-bold ${
              activeTab === 'leaderboard'
                ? 'border-b-2 border-green-500 text-green-500'
                : 'text-gray-500 hover:text-green-500'
            }`}
          >
            <Trophy className="w-4 h-4 inline-block mr-2" />
            LEADERBOARD
          </button>
        </div>
      </div>

      {/* CHALLENGES */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'challenges' && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {challenges.map((challenge) => (
              <div
                key={challenge.id}
                className="bg-gray-900 border border-green-500 rounded-lg p-6 hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    {solvedChallenges.includes(challenge.id) ? (
                      <Unlock className="w-5 h-5 text-green-500" />
                    ) : (
                      <Lock className="w-5 h-5 text-red-500" />
                    )}
                    <span className="text-xs bg-gray-800 px-2 py-1 rounded text-green-500">
                      {challenge.category}
                    </span>
                  </div>
                  <span className={`text-sm font-bold ${getDifficultyColor(challenge.difficulty)}`}>
                    {challenge.difficulty}
                  </span>
                </div>

                <h3 className="text-xl font-bold mb-2 text-white">{challenge.name}</h3>
                <p className="text-green-300 text-sm mb-4">{challenge.description}</p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Zap className="w-4 h-4" />
                    <span className="font-bold">{challenge.points} pts</span>
                  </div>
                  <button
                    onClick={() => toggleSolve(challenge.id)}
                    className={`px-4 py-2 rounded font-bold transition-colors ${
                      solvedChallenges.includes(challenge.id)
                        ? 'bg-green-500 text-black hover:bg-green-400'
                        : 'bg-gray-800 text-green-500 border border-green-500 hover:bg-green-500 hover:text-black'
                    }`}
                  >
                    {solvedChallenges.includes(challenge.id) ? 'SOLVED' : 'HACK'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* LEADERBOARD */}
        {activeTab === 'leaderboard' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-gray-900 border border-green-500 rounded-lg overflow-hidden">
              <div className="bg-gray-800 px-6 py-4 border-b border-green-500">
                <h3 className="text-xl font-bold text-white">TOP HACKERS</h3>
              </div>
              <div>
                {leaderboard.map((user) => (
                  <div
                    key={user.rank}
                    className="px-6 py-4 flex items-center justify-between border-b border-gray-800 hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-center space-x-6">
                      <span
                        className={`text-2xl font-bold w-8 ${
                          user.rank === 1
                            ? 'text-yellow-500'
                            : user.rank === 2
                            ? 'text-gray-400'
                            : user.rank === 3
                            ? 'text-orange-500'
                            : 'text-green-500'
                        }`}
                      >
                        #{user.rank}
                      </span>
                      <div>
                        <div className="font-bold text-white text-lg">{user.username}</div>
                        <div className="text-sm text-green-300">
                          <Flag className="w-3 h-3 inline-block mr-1" />
                          {user.solved} challenges solved
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-500">{user.score}</div>
                      <div className="text-xs text-gray-500">POINTS</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <footer className="border-t border-green-500 mt-16 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500">
          <p className="text-sm">
            <span className="text-green-500">&gt;</span> PROJECT_X CTF Platform |
            <span className="text-green-500"> root@localhost</span>:~# hack_the_planet
          </p>
        </div>
      </footer>
    </div>
  );
}
