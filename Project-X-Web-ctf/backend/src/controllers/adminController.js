/**
 * Admin Controller
 * -----------------
 * Handles:
 *  - Challenge management (create, update, delete, list, toggle release)
 *  - Team management (list teams, scoring, penalties, bans)
 */

const fs = require("fs");
const { prisma } = require("../config/db");
const hashFlag = require("../utils/hashFlag");

/* -------------------------------------------------------------------------- */
/*                               Create Challenge                              */
/* -------------------------------------------------------------------------- */

/**
 * Create a new challenge.
 * @route POST /api/admin/challenge
 */
exports.createChallenge = async (req, res) => {
  try {
    const { name, category, difficulty, points, description, flag, released } =
      req.body;

    const filePath = req.file ? req.file.path : null;

    const challengeData = {
      name,
      category,
      difficulty,
      description,
      filePath,
      points: Number(points),
      released: released === "true",
      flagHash: flag ? hashFlag(flag) : null,
    };

    const challenge = await prisma.challenge.create({ data: challengeData });
    return res.json({ ok: true, challenge });
  } catch (err) {
    console.error("Error creating challenge:", err);
    return res.status(500).json({ error: "Failed to create challenge" });
  }
};

/* -------------------------------------------------------------------------- */
/*                               Update Challenge                              */
/* -------------------------------------------------------------------------- */

/**
 * Update an existing challenge.
 * @route PUT /api/admin/challenge/:id
 */
exports.updateChallenge = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, difficulty, points, description, flag } = req.body;

    const updateData = {
      name,
      category,
      difficulty,
      description,
      points: Number(points),
    };

    if (flag) updateData.flagHash = hashFlag(flag);
    if (req.file) updateData.filePath = req.file.path;

    const challenge = await prisma.challenge.update({
      where: { id: Number(id) },
      data: updateData,
    });

    return res.json({ ok: true, challenge });
  } catch (err) {
    console.error("Error updating challenge:", err);
    return res.status(500).json({ error: "Failed to update challenge" });
  }
};

/* -------------------------------------------------------------------------- */
/*                               Delete Challenge                              */
/* -------------------------------------------------------------------------- */

/**
 * Delete a challenge and remove its file.
 * @route DELETE /api/admin/challenge/:id
 */
exports.deleteChallenge = async (req, res) => {
  try {
    const { id } = req.params;

    const challenge = await prisma.challenge.findUnique({
      where: { id: Number(id) },
    });

    if (!challenge) {
      return res.status(404).json({ error: "Challenge not found" });
    }

    if (challenge.filePath && fs.existsSync(challenge.filePath)) {
      fs.unlinkSync(challenge.filePath);
    }

    await prisma.challenge.delete({ where: { id: Number(id) } });

    return res.json({ ok: true });
  } catch (err) {
    console.error("Error deleting challenge:", err);
    return res.status(500).json({ error: "Failed to delete challenge" });
  }
};

/* -------------------------------------------------------------------------- */
/*                               List Challenges                               */
/* -------------------------------------------------------------------------- */

/**
 * Retrieve all challenges.
 * @route GET /api/admin/challenges
 */
exports.getAllChallenges = async (req, res) => {
  try {
    const challenges = await prisma.challenge.findMany({
      select: {
        id: true,
        name: true,
        category: true,
        difficulty: true,
        points: true,
        description: true,
        filePath: true,
        released: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return res.json(challenges);
  } catch (err) {
    console.error("Error fetching challenges:", err);
    return res.status(500).json({ error: "Failed to fetch challenges" });
  }
};

/* -------------------------------------------------------------------------- */
/*                           Toggle Challenge Release                          */
/* -------------------------------------------------------------------------- */

/**
 * Toggle the release status of a challenge.
 * @route PATCH /api/admin/challenge/:id/release
 */
exports.toggleRelease = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { released } = req.body;

    const challenge = await prisma.challenge.update({
      where: { id },
      data: { released },
    });

    return res.json({ ok: true, challenge });
  } catch (err) {
    console.error("Error toggling challenge release:", err);
    return res.status(500).json({ error: "Failed to toggle release status" });
  }
};

/* -------------------------------------------------------------------------- */
/*                                 List Teams                                  */
/* -------------------------------------------------------------------------- */

/**
 * Retrieve all teams with:
 *  - Members
 *  - Unique solves
 *  - Raw score
 *  - Final score after penalties
 *  - Ban status
 */
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
              include: { challenge: true },
            },
          },
        },
      },
    });

    const formatted = teams.map((team) => {
      const solves = team.members.flatMap((member) => member.solved);

      // Deduplicate solves by challenge ID
      const uniqueChallenges = new Map();
      for (const solve of solves) {
        const challengeId = solve.challenge.id;
        if (!uniqueChallenges.has(challengeId)) {
          uniqueChallenges.set(challengeId, solve);
        }
      }

      const uniqueSolves = Array.from(uniqueChallenges.values());

      const rawScore = uniqueSolves.reduce(
        (sum, solve) => sum + (solve.challenge.points || 0),
        0
      );

      const penalty = team.penaltyPoints || 0;
      const totalScore = Math.max(0, rawScore - penalty);

      return {
        id: team.id,
        name: team.name,
        createdAt: team.createdAt,
        bannedUntil: team.bannedUntil,

        members: team.members.map((m) => ({
          id: m.id,
          username: m.username,
        })),

        solvedCount: uniqueSolves.length,
        rawScore,
        totalScore,
        penaltyPoints: penalty,
      };
    });

    return res.json(formatted);
  } catch (err) {
    console.error("Error fetching teams:", err);
    return res.status(500).json({ error: "Failed to fetch teams" });
  }
};

/* -------------------------------------------------------------------------- */
/*                                   Ban Team                                  */
/* -------------------------------------------------------------------------- */

/**
 * Ban a team temporarily or permanently.
 * @route POST /api/admin/team/:id/ban
 */
exports.banTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const { durationMinutes } = req.body;

    let bannedUntil;

    if (durationMinutes === 0) {
      // Permanent ban → store far-future date
      bannedUntil = new Date("9999-12-31T23:59:59Z");
    } else if (durationMinutes > 0) {
      // Temporary ban
      bannedUntil = new Date(Date.now() + durationMinutes * 60 * 1000);
    } else {
      return res.status(400).json({ error: "Invalid ban duration" });
    }

    await prisma.team.update({
      where: { id: Number(id) },
      data: { bannedUntil },
    });

    return res.json({
      ok: true,
      message:
        durationMinutes === 0
          ? "Team permanently banned"
          : `Team banned for ${durationMinutes} minutes`,
    });

  } catch (err) {
    console.error("Error banning team:", err);
    return res.status(500).json({ error: "Failed to ban team" });
  }
};


/* -------------------------------------------------------------------------- */
/*                                 Unban Team                                  */
/* -------------------------------------------------------------------------- */

/**
 * Remove ban from a team.
 * @route POST /api/admin/team/:id/unban
 */
exports.unbanTeam = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.team.update({
      where: { id: Number(id) },
      data: { bannedUntil: null },
    });

    return res.json({
      ok: true,
      message: "Team unbanned successfully",
    });
  } catch (err) {
    console.error("Error unbanning team:", err);
    return res.status(500).json({ error: "Failed to unban team" });
  }
};

/* -------------------------------------------------------------------------- */
/*                             Apply Team Penalty                              */
/* -------------------------------------------------------------------------- */

/**
 * Apply penalty points to a team.
 * @route POST /api/admin/team/:id/penalty
 */
exports.reduceTeamScore = async (req, res) => {
  try {
    const { id } = req.params;
    const { penalty } = req.body;

    const team = await prisma.team.findUnique({
      where: { id: Number(id) },
      include: {
        solved: { include: { challenge: true } },
      },
    });

    if (!team) {
      return res.status(404).json({ error: "Team not found" });
    }

    const rawScore = team.solved.reduce(
      (sum, solve) => sum + (solve.challenge.points || 0),
      0
    );

    const updatedPenalty = (team.penaltyPoints || 0) + Number(penalty);
    const finalScore = Math.max(0, rawScore - updatedPenalty);

    await prisma.team.update({
      where: { id: Number(id) },
      data: { penaltyPoints: updatedPenalty },
    });

    return res.json({
      ok: true,
      message: `Penalty applied: ${penalty}. Total penalty: ${updatedPenalty}`,
      rawScore,
      finalScore,
    });
  } catch (err) {
    console.error("Error applying penalty:", err);
    return res.status(500).json({ error: "Failed to apply penalty" });
  }
};
