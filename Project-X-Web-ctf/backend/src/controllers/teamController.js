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

    // Get user -> team
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { teamId: true },
    });

    if (!user?.teamId) {
      return res.status(404).json({ error: "User does not belong to a team" });
    }

    const teamId = user.teamId;

    // Fetch team with full member solve history
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        members: {
          include: {
            solved: {
              include: {
                challenge: {
                  select: {
                    id: true,
                    name: true,
                    points: true,
                    category: true,
                    difficulty: true,
                  },
                },
              },
              orderBy: { createdAt: "asc" },
            },
          },
        },
        solved: true,
      },
    });

    if (!team) {
      return res.status(404).json({ error: "Team not found" });
    }

    // Total team points
    const totalPoints = team.solved.reduce(
      (sum, s) => sum + s.points,
      0
    );

    // Member-level data mapping
    const members = team.members.map((m) => {
      const memberPoints = m.solved.reduce((sum, s) => sum + s.points, 0);

      const solves = m.solved.map((s) => ({
        challengeId: s.challenge.id,
        challengeName: s.challenge.name,
        points: s.points,
        solvedAt: s.solvedAt,
        category: s.challenge.category,
        difficulty: s.challenge.difficulty,
      }));

      return {
        id: m.id,
        username: m.username,
        points: memberPoints,
        solves,
        solveCount: solves.length,
      };
    });

    return res.json({
      team: {
        id: team.id,
        name: team.name,
        joinCode: team.joinCode,
        totalPoints,
        members,
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
