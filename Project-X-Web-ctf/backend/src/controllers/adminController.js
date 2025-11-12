const crypto = require('crypto');
const { prisma } = require('../config/db');
const fs = require('fs');

const FLAG_SALT = process.env.FLAG_SALT || '';

function hashFlag(flag) {
  return crypto.createHash('sha256').update(FLAG_SALT + flag.trim()).digest('hex');
}

// 🧱 Create challenge
exports.createChallenge = async (req, res) => {
  try {
    const { name, category, difficulty, points, description, flag, released } = req.body;
    let filePath = null;
    if (req.file) filePath = req.file.path;

    const data = {
      name,
      category,
      difficulty,
      points: Number(points),
      description,
      filePath,
      released: released === 'true',
      flagHash: flag ? hashFlag(flag) : null,
    };

    const ch = await prisma.challenge.create({ data });
    res.json({ ok: true, challenge: ch });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server_error' });
  }
};

// ✏️ Update challenge
exports.updateChallenge = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, difficulty, points, description, flag } = req.body;

    const update = {
      name,
      category,
      difficulty,
      points: Number(points),
      description,
    };
    if (flag) update.flagHash = hashFlag(flag);
    if (req.file) update.filePath = req.file.path;

    const ch = await prisma.challenge.update({
      where: { id: Number(id) },
      data: update,
    });

    res.json({ ok: true, challenge: ch });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server_error' });
  }
};

// ❌ Delete challenge
exports.deleteChallenge = async (req, res) => {
  try {
    const { id } = req.params;
    const ch = await prisma.challenge.findUnique({ where: { id: Number(id) } });

    if (ch?.filePath && fs.existsSync(ch.filePath)) fs.unlinkSync(ch.filePath);
    await prisma.challenge.delete({ where: { id: Number(id) } });

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server_error' });
  }
};

// 📜 Get all challenges
exports.getAllChallenges = async (req, res) => {
  try {
    const challenges = await prisma.challenge.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        difficulty: true,
        points: true,
        filePath: true,
        createdAt: true,
        released: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(challenges);
  } catch (err) {
    console.error('❌ Error fetching challenges:', err);
    res.status(500).json({ error: 'Failed to fetch challenges' });
  }
};

// 🔁 Toggle release / stop
exports.toggleRelease = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { released } = req.body;

    const updated = await prisma.challenge.update({
      where: { id },
      data: { released },
    });

    res.json({ ok: true, updated });
  } catch (err) {
    console.error('❌ Error toggling release:', err);
    res.status(500).json({ error: 'Failed to toggle release' });
  }
};

// 📊 Get all registered teams with members and solve count
exports.getAllTeams = async (req, res) => {
  try {
    const teams = await prisma.team.findMany({
      orderBy: { createdAt: "desc" }, // ✅ no score field, sort by creation time
      include: {
        members: {
          select: { id: true, username: true },
        },
        solved: { // ✅ matches your relation name
          select: { id: true, challengeId: true, createdAt: true, points: true },
        },
      },
    });

    const formatted = teams.map((team) => ({
      id: team.id,
      name: team.name,
      members: team.members,
      solvedCount: team.solved.length,
      totalScore: team.solved.reduce((acc, s) => acc + (s.points || 0), 0),
      createdAt: team.createdAt,
    }));

    res.json(formatted);
  } catch (err) {
    console.error("❌ Error fetching teams:", err);
    res.status(500).json({
      error: "Failed to fetch teams",
      details: err.message,
    });
  }
};
