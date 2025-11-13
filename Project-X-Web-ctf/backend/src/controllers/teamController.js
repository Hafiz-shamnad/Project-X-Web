/**
 * Team Controller
 * ---------------
 * Handles:
 *  - Creating a team
 *  - Joining a team
 *  - Fetching the authenticated user's team
 *  - Fetching team solve history
 */

const { prisma } = require("../config/db");
const crypto = require("crypto");

/* -------------------------------------------------------------------------- */
/*                            Utility: Join Code Generator                     */
/* -------------------------------------------------------------------------- */

/**
 * Generate a 6-character alphanumeric team join code.
 * @returns {string}
 */
function generateJoinCode() {
  return crypto.randomBytes(3).toString("hex").toUpperCase(); // Example: A3F9D2
}

/* -------------------------------------------------------------------------- */
/*                                  Create Team                                */
/* -------------------------------------------------------------------------- */

/**
 * Create a new team and add the authenticated user as the first member.
 * @route POST /api/team/create
 */
exports.createTeam = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { name } = req.body;
    if (!name || typeof name !== "string") {
      return res.status(400).json({ error: "Team name is required" });
    }

    // Check if user already belongs to a team
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { team: true },
    });

    if (existingUser?.team) {
      return res.status(400).json({ error: "User already belongs to a team" });
    }

    const joinCode = generateJoinCode();

    const team = await prisma.team.create({
      data: {
        name,
        joinCode,
        members: { connect: { id: userId } },
      },
      include: { members: true },
    });

    return res.json({ team });
  } catch (err) {
    console.error("Error creating team:", err);
    return res.status(500).json({ error: "Server error creating team" });
  }
};

/* -------------------------------------------------------------------------- */
/*                                   Join Team                                 */
/* -------------------------------------------------------------------------- */

/**
 * Join a team using a join code.
 * @route POST /api/team/join
 */
exports.joinTeam = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { joinCode } = req.body;
    if (!joinCode || typeof joinCode !== "string") {
      return res.status(400).json({ error: "Join code is required" });
    }

    const team = await prisma.team.findUnique({
      where: { joinCode },
      include: { members: true },
    });

    if (!team) {
      return res.status(404).json({ error: "Invalid join code" });
    }

    // Set the user's team reference
    await prisma.user.update({
      where: { id: userId },
      data: { teamId: team.id },
    });

    const updatedTeam = await prisma.team.findUnique({
      where: { id: team.id },
      include: { members: true },
    });

    return res.json({ team: updatedTeam });
  } catch (err) {
    console.error("Error joining team:", err);
    return res.status(500).json({ error: "Server error joining team" });
  }
};

/* -------------------------------------------------------------------------- */
/*                            Get Authenticated User Team                      */
/* -------------------------------------------------------------------------- */

/**
 * Return the team the authenticated user belongs to.
 * @route GET /api/team/me
 */
exports.getMyTeam = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        team: {
          include: { members: true },
        },
      },
    });

    if (!user?.team) {
      return res.status(404).json({ error: "User does not belong to a team" });
    }

    const teamId = user.team.id;

    const teamScore = await prisma.solved.aggregate({
      where: { teamId },
      _sum: { points: true },
    });

    return res.json({
      team: {
        id: user.team.id,
        name: user.team.name,
        joinCode: user.team.joinCode,
        totalPoints: teamScore._sum.points || 0,
        members: user.team.members.map((m) => ({
          id: m.id,
          username: m.username,
        })),
      },
    });
  } catch (err) {
    console.error("Error fetching team:", err);
    return res.status(500).json({ error: "Server error fetching team" });
  }
};

/* -------------------------------------------------------------------------- */
/*                                 Team Solves                                 */
/* -------------------------------------------------------------------------- */

/**
 * Fetch all solves made by members of a team.
 * @route GET /api/team/:id/solves
 */
exports.getTeamSolves = async (req, res) => {
  try {
    const teamId = Number(req.params.id);

    if (isNaN(teamId)) {
      return res.status(400).json({ error: "Invalid team ID" });
    }

    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        members: {
          include: {
            solved: {
              include: { challenge: true },
              orderBy: { createdAt: "asc" },
            },
          },
        },
      },
    });

    if (!team) {
      return res.status(404).json({ error: "Team not found" });
    }

    const solves = team.members.flatMap((member) =>
      member.solved.map((solve) => ({
        username: member.username,
        challengeId: solve.challengeId,
        createdAt: solve.createdAt,
        challenge: solve.challenge,
      }))
    );

    return res.json({ teamId, solved: solves });
  } catch (err) {
    console.error("Error fetching team solves:", err);
    return res.status(500).json({ error: "Server error fetching team solves" });
  }
};
