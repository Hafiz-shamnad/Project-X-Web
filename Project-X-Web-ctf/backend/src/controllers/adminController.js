const crypto = require("crypto");
const { prisma } = require("../config/db");
const fs = require("fs");

const FLAG_SALT = process.env.FLAG_SALT || "";

// 🔐 Hash flag securely
function hashFlag(flag) {
  return crypto
    .createHash("sha256")
    .update(FLAG_SALT + flag.trim())
    .digest("hex");
}

// 🧱 Create challenge
exports.createChallenge = async (req, res) => {
  try {
    const { name, category, difficulty, points, description, flag, released } =
      req.body;
    let filePath = null;
    if (req.file) filePath = req.file.path;

    const data = {
      name,
      category,
      difficulty,
      points: Number(points),
      description,
      filePath,
      released: released === "true",
      flagHash: flag ? hashFlag(flag) : null,
    };

    const ch = await prisma.challenge.create({ data });
    res.json({ ok: true, challenge: ch });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error" });
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
    res.status(500).json({ error: "server_error" });
  }
};

// ❌ Delete challenge
exports.deleteChallenge = async (req, res) => {
  try {
    const { id } = req.params;
    const ch = await prisma.challenge.findUnique({
      where: { id: Number(id) },
    });

    if (ch?.filePath && fs.existsSync(ch.filePath)) fs.unlinkSync(ch.filePath);
    await prisma.challenge.delete({ where: { id: Number(id) } });

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error" });
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
      orderBy: { createdAt: "desc" },
    });
    res.json(challenges);
  } catch (err) {
    console.error("❌ Error fetching challenges:", err);
    res.status(500).json({ error: "Failed to fetch challenges" });
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
    console.error("❌ Error toggling release:", err);
    res.status(500).json({ error: "Failed to toggle release" });
  }
};

// 📊 Get all registered teams with members and solve count
exports.getAllTeams = async (req, res) => {
  try {
    const teams = await prisma.team.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        members: {
          select: {
            id: true,
            username: true,
            solved: {
              include: { challenge: true }, // include challenge to get latest points
            },
          },
        },
      },
    });

    const formatted = teams.map((team) => {
      const allSolves = team.members.flatMap((m) => m.solved);

      // Deduplicate challenges (avoid duplicate solves by same team)
      const uniqueChallenges = new Map();
      for (const solve of allSolves) {
        if (!uniqueChallenges.has(solve.challenge.id)) {
          uniqueChallenges.set(solve.challenge.id, solve);
        }
      }
      const uniqueSolves = Array.from(uniqueChallenges.values());

      const rawScore = uniqueSolves.reduce(
        (sum, s) => sum + (s.challenge?.points || 0),
        0
      );

      const penalty = team.penaltyPoints || 0;
      const totalScore = Math.max(0, rawScore - penalty);

      return {
        id: team.id,
        name: team.name,
        members: team.members.map((m) => ({
          id: m.id,
          username: m.username,
        })),
        solvedCount: uniqueSolves.length,
        rawScore,
        totalScore,
        penaltyPoints: penalty,
        createdAt: team.createdAt,
        bannedUntil: team.bannedUntil,
      };
    });

    res.json(formatted);
  } catch (err) {
    console.error("❌ Error fetching teams:", err);
    res.status(500).json({
      error: "Failed to fetch teams",
      details: err.message,
    });
  }
};


// 🚫 Temporarily or permanently ban a team
exports.banTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const { durationMinutes } = req.body; // 0 means permanent

    const bannedUntil =
      durationMinutes && durationMinutes > 0
        ? new Date(Date.now() + durationMinutes * 60 * 1000)
        : null; // null = permanent

    await prisma.team.update({
      where: { id: Number(id) },
      data: { bannedUntil },
    });

    res.json({
      ok: true,
      message:
        durationMinutes > 0
          ? `Team banned for ${durationMinutes} minutes`
          : "Team permanently banned",
    });
  } catch (err) {
    console.error("❌ Error banning team:", err);
    res.status(500).json({ error: "Failed to ban team" });
  }
};

// ♻️ Unban team (optional: reset penalties)
exports.unbanTeam = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.team.update({
      where: { id: Number(id) },
      data: {
        bannedUntil: null,
        // Uncomment next line if you want to reset penalty on unban
        // penaltyPoints: 0,
      },
    });

    res.json({ ok: true, message: "Team unbanned successfully" });
  } catch (err) {
    console.error("❌ Error unbanning team:", err);
    res.status(500).json({ error: "Failed to unban team" });
  }
};

exports.reduceTeamScore = async (req, res) => {
  try {
    const { id } = req.params;
    const { penalty } = req.body; // e.g. 100

    const team = await prisma.team.findUnique({
      where: { id: Number(id) },
      include: {
        solved: { include: { challenge: true } },
      },
    });

    if (!team) return res.status(404).json({ error: "Team not found" });

    // Calculate current score before applying new penalty
    const rawScore = team.solved.reduce(
      (sum, s) => sum + (s.challenge?.points || 0),
      0
    );

    // Add to existing penalty
    const updatedPenalty = (team.penaltyPoints || 0) + Number(penalty);
    const finalScore = Math.max(0, rawScore - updatedPenalty);

    await prisma.team.update({
      where: { id: Number(id) },
      data: { penaltyPoints: updatedPenalty },
    });

    res.json({
      ok: true,
      message: `Penalty of ${penalty} points applied. Total penalty: ${updatedPenalty}`,
      rawScore,
      finalScore,
    });
  } catch (err) {
    console.error("❌ Error reducing team score:", err);
    res.status(500).json({ error: "Failed to apply penalty" });
  }
};

