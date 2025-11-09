const { prisma } = require('../config/db');

exports.getLeaderboard = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: { solved: { include: { challenge: true } } },
    });

    const leaderboard = users.map(u => {
      const score = u.solved.reduce((sum, s) => sum + s.challenge.points, 0);
      return { username: u.username, score, solved: u.solved.length };
    }).sort((a, b) => b.score - a.score)
      .map((u, i) => ({ rank: i + 1, ...u }));

    res.json(leaderboard);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
