const { prisma } = require('../config/db');

// 🧩 GLOBAL USER LEADERBOARD
exports.getLeaderboard = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: { solved: { include: { challenge: true } } },
    });

    const leaderboard = users
      .map((u) => {
        const score = u.solved.reduce((sum, s) => sum + (s.challenge.points || 0), 0);
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
            solved: { include: { challenge: true } },
          },
        },
      },
    });

    const leaderboard = teams
      .map((team) => {
        const teamSolves = team.members.flatMap((m) => m.solved);
        const totalScore = teamSolves.reduce(
          (sum, s) => sum + (s.challenge?.points || 0),
          0
        );

        return {
          id: team.id,
          teamName: team.name,
          score: totalScore,
          solved: teamSolves.length,
          solves: teamSolves.map((s) => ({
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
