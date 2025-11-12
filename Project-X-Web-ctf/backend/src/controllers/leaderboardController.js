const { prisma } = require('../config/db');

// 🧩 GLOBAL USER LEADERBOARD
exports.getLeaderboard = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: { solved: { include: { challenge: true } } },
    });

    const leaderboard = users
      .map((u) => {
        const score = u.solved.reduce(
          (sum, s) => sum + (s.challenge.points || 0),
          0
        );
        return {
          id: u.id,
          username: u.username,
          score,
          solved: u.solved.length,
          solves: u.solved.map((s) => ({
            challenge: { id: s.challenge.id, points: s.challenge.points },
            createdAt: s.createdAt,
          })),
        };
      })
      .sort((a, b) => b.score - a.score)
      .map((u, i) => ({ rank: i + 1, ...u }));

    res.json(leaderboard);
  } catch (err) {
    console.error("❌ User leaderboard error:", err);
    res.status(500).json({ error: err.message });
  }
};

// 🏆 TEAM LEADERBOARD
exports.getTeamLeaderboard = async (req, res) => {
  try {
    const teams = await prisma.team.findMany({
      include: {
        members: {
          include: {
            solved: {
              include: { challenge: true },
            },
          },
        },
      },
    });

    const leaderboard = teams
      // hide teams that are currently banned
      .filter((team) => !team.bannedUntil || new Date(team.bannedUntil) < new Date())
      .map((team) => {
        // 🔹 Combine all solves from members
        const allSolves = team.members.flatMap((m) => m.solved);

        // 🔹 Deduplicate by challenge ID (one challenge = one score)
        const uniqueChallenges = new Map();
        for (const solve of allSolves) {
          const cid = solve.challenge.id;
          if (!uniqueChallenges.has(cid)) uniqueChallenges.set(cid, solve);
        }

        const uniqueSolves = Array.from(uniqueChallenges.values());

        // 🔹 Compute rawScore & totalScore
        const rawScore = uniqueSolves.reduce(
          (sum, s) => sum + (s.challenge?.points || 0),
          0
        );

        const penalty = team.penaltyPoints || 0;
        const totalScore = Math.max(0, rawScore - penalty);

        return {
          id: team.id,
          teamName: team.name,
          rawScore,
          score: totalScore,
          solved: uniqueSolves.length,
          penaltyPoints: penalty,
          bannedUntil: team.bannedUntil,
          solves: uniqueSolves.map((s) => ({
            challenge: { id: s.challenge.id, points: s.challenge.points },
            createdAt: s.createdAt,
          })),
        };
      })
      .sort((a, b) => b.score - a.score)
      .map((team, i) => ({ rank: i + 1, ...team }));

    res.json(leaderboard);
  } catch (err) {
    console.error("❌ Team leaderboard error:", err);
    res.status(500).json({ error: err.message });
  }
};


// 👥 TEAM MEMBER LEADERBOARD (within a team)
exports.getTeamMembersLeaderboard = async (req, res) => {
  try {
    const teamId = parseInt(req.params.id, 10);
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        members: {
          include: {
            solved: { include: { challenge: true } },
          },
        },
      },
    });

    if (!team) return res.status(404).json({ error: "Team not found" });

    const leaderboard = team.members
      .map((m) => {
        const score = m.solved.reduce(
          (sum, s) => sum + (s.challenge.points || 0),
          0
        );
        return {
          id: m.id,
          username: m.username,
          score,
          solved: m.solved.length,
          solves: m.solved.map((s) => ({
            challenge: { id: s.challenge.id, points: s.challenge.points },
            createdAt: s.createdAt,
          })),
        };
      })
      .sort((a, b) => b.score - a.score)
      .map((u, i) => ({ rank: i + 1, ...u }));

    res.json({
      teamId: team.id,
      teamName: team.name,
      leaderboard,
    });
  } catch (err) {
    console.error("❌ Team member leaderboard error:", err);
    res.status(500).json({ error: err.message });
  }
};
