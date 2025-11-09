// app/page.tsx
'use client';

import React, { useState } from 'react';
import { Terminal, Lock, Unlock, Flag, Trophy, Users, Target, Shield, Code, Zap } from 'lucide-react';

export default function ProjectXCTF() {
  const [activeTab, setActiveTab] = useState('challenges');
  const [solvedChallenges, setSolvedChallenges] = useState<number[]>([]);

  const challenges = [
    { id: 1, name: 'Web Exploit 101', difficulty: 'Easy', points: 100, category: 'Web', description: 'Find the hidden flag in the vulnerable web application' },
    { id: 2, name: 'SQL Injection Master', difficulty: 'Medium', points: 250, category: 'Web', description: 'Bypass authentication using SQL injection techniques' },
    { id: 3, name: 'Cryptic Messages', difficulty: 'Medium', points: 300, category: 'Crypto', description: 'Decrypt the encoded message to reveal the flag' },
    { id: 4, name: 'Binary Exploitation', difficulty: 'Hard', points: 500, category: 'PWN', description: 'Exploit the buffer overflow vulnerability' },
    { id: 5, name: 'Reverse Engineering', difficulty: 'Hard', points: 450, category: 'Reverse', description: 'Analyze the binary and extract the hidden flag' },
    { id: 6, name: 'Network Forensics', difficulty: 'Easy', points: 150, category: 'Forensics', description: 'Analyze the packet capture file' },
  ];

  const leaderboard = [
    { rank: 1, username: 'H4ck3rPr0', score: 2500, solved: 15 },
    { rank: 2, username: 'CyberNinja', score: 2100, solved: 12 },
    { rank: 3, username: 'ByteMaster', score: 1850, solved: 11 },
    { rank: 4, username: 'RootAccess', score: 1600, solved: 9 },
    { rank: 5, username: 'ExploitKing', score: 1400, solved: 8 },
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch(difficulty) {
      case 'Easy': return 'text-green-500';
      case 'Medium': return 'text-yellow-500';
      case 'Hard': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const toggleSolve = (id: number) => {
    setSolvedChallenges(prev => 
      prev.includes(id) ? prev.filter(cId => cId !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-black text-green-500">
      <header className="border-b-2 border-green-500 bg-black sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="w-8 h-8 text-green-500" />
              <h1 className="text-3xl font-bold">
                <span className="text-green-500">&gt; PROJECT_X</span>
              </h1>
            </div>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Trophy className="w-5 h-5" />
                <span className="text-sm">Rank: #42</span>
              </div>
              <div className="flex items-center space-x-2">
                <Flag className="w-5 h-5" />
                <span className="text-sm">Score: {solvedChallenges.reduce((sum, id) => sum + (challenges.find(c => c.id === id)?.points || 0), 0)}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="bg-black py-16 border-b border-green-500">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <Terminal className="w-16 h-16 mx-auto mb-4 text-green-500" />
          <h2 className="text-4xl font-bold mb-4">
            <span className="text-white">CAPTURE THE </span>
            <span className="text-green-500">FLAG</span>
          </h2>
          <p className="text-green-300 text-lg max-w-2xl mx-auto">
            Test your hacking skills against our advanced security challenges. 
            Can you break in and capture all the flags?
          </p>
          <div className="flex justify-center space-x-4 mt-8">
            <div className="bg-gray-900 border border-green-500 px-6 py-3 rounded">
              <Code className="w-6 h-6 inline-block mr-2" />
              <span className="font-bold">6</span> Active Challenges
            </div>
            <div className="bg-gray-900 border border-green-500 px-6 py-3 rounded">
              <Users className="w-6 h-6 inline-block mr-2" />
              <span className="font-bold">1,337</span> Hackers Online
            </div>
          </div>
        </div>
      </div>

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
                      <span className={`text-2xl font-bold w-8 ${
                        user.rank === 1 ? 'text-yellow-500' :
                        user.rank === 2 ? 'text-gray-400' :
                        user.rank === 3 ? 'text-orange-500' :
                        'text-green-500'
                      }`}>
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
