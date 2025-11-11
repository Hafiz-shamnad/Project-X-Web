// src/controllers/teamController.js
const { prisma } = require('../config/db');
const crypto = require('crypto');

// 🧩 Generate short random join codes
function generateJoinCode() {
  return crypto.randomBytes(3).toString('hex').toUpperCase(); // e.g. "A3F9D2"
}

// 🚀 Create a new team
exports.createTeam = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'Unauthorized: user missing' });
    }

    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Team name required' });
    }

    // Check if user is already in a team
    const existingUser = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { team: true },
    });

    if (existingUser.team) {
      return res.status(400).json({ error: 'Already in a team' });
    }

    const joinCode = generateJoinCode();

    const team = await prisma.team.create({
      data: {
        name,
        joinCode,
        members: { connect: { id: req.user.id } }, // link user to team
      },
      include: { members: true },
    });

    return res.json({ team });
  } catch (err) {
    console.error('❌ Error creating team:', err);
    res.status(500).json({ error: 'Server error creating team' });
  }
};

// 🚪 Join an existing team
exports.joinTeam = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'Unauthorized: user missing' });
    }

    const { joinCode } = req.body;
    if (!joinCode) {
      return res.status(400).json({ error: 'Join code required' });
    }

    const team = await prisma.team.findUnique({
      where: { joinCode },
      include: { members: true },
    });

    if (!team) {
      return res.status(404).json({ error: 'Invalid join code' });
    }

    // Update user's teamId
    await prisma.user.update({
      where: { id: req.user.id },
      data: { teamId: team.id },
    });

    const updatedTeam = await prisma.team.findUnique({
      where: { id: team.id },
      include: { members: true },
    });

    return res.json({ team: updatedTeam });
  } catch (err) {
    console.error('❌ Error joining team:', err);
    res.status(500).json({ error: 'Server error joining team' });
  }
};

// 👥 Get current user's team
exports.getMyTeam = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { team: { include: { members: true } } },
    });

    if (!user?.team) {
      return res.status(404).json({ error: 'You are not in a team' });
    }

    const totalPoints = await prisma.solved.aggregate({
      where: { teamId: user.team.id },
      _sum: { points: true },
    });

    return res.json({
      team: {
        id: user.team.id,
        name: user.team.name,
        joinCode: user.team.joinCode,
        totalPoints: totalPoints._sum.points || 0,
        members: user.team.members.map((m) => ({
          id: m.id,
          username: m.username,
        })),
      },
    });
  } catch (err) {
    console.error('❌ Error fetching team:', err);
    res.status(500).json({ error: 'Server error fetching team' });
  }
};

exports.getTeamSolves = async (req, res) => {
  try {
    const teamId = parseInt(req.params.id, 10);
    if (isNaN(teamId)) {
      return res.status(400).json({ error: "Invalid team ID" });
    }

    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        members: {
          include: {
            solved: { // ✅ correct relation name
              include: { challenge: true },
              orderBy: { createdAt: "asc" },
            },
          },
        },
      },
    });

    if (!team) return res.status(404).json({ error: "Team not found" });

    // Flatten all solves with user info
    const solves = team.members?.flatMap((m) =>
      m.solved?.map((s) => ({
        username: m.username,
        challengeId: s.challengeId,
        createdAt: s.createdAt,
        challenge: s.challenge,
      })) || []
    ) || [];

    res.json({ teamId, solved: solves });
  } catch (err) {
    console.error("❌ Team solves error:", err);
    res.status(500).json({ error: "Server error fetching team solves" });
  }
};

