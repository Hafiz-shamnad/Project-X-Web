/**
 * User Controller
 * ---------------
 * Handles:
 *  - Creating a user if not exists
 *  - Fetching a user with solve history
 *  - Toggling a solve entry
 */

const { prisma } = require("../config/db");

/* -------------------------------------------------------------------------- */
/*                       Create or Fetch Existing User                         */
/* -------------------------------------------------------------------------- */

/**
 * Create a new user if they do not exist, otherwise return existing user.
 * @route POST /api/user
 */
const createOrGetUser = async (req, res) => {
  const { username } = req.body;

  if (!username || typeof username !== "string") {
    return res.status(400).json({ error: "Valid username is required" });
  }

  try {
    let user = await prisma.user.findUnique({ where: { username } });

    if (!user) {
      user = await prisma.user.create({
        data: { username },
        select: { id: true, username: true, createdAt: true },
      });
    }

    return res.json(user);
  } catch (error) {
    console.error("Error creating or fetching user:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/* -------------------------------------------------------------------------- */
/*                               Get User Profile                              */
/* -------------------------------------------------------------------------- */

/**
 * Fetch a public user profile including solved challenges.
 * @route GET /api/user/:username
 */
const getUser = async (req, res) => {
  const { username } = req.params;

  if (!username || typeof username !== "string") {
    return res.status(400).json({ error: "Invalid username" });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { username },
      include: {
        solved: {
          include: { challenge: true },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!user) {
      return res.json({
        id: null,
        username,
        solved: [],
      });
    }

    return res.json({
      id: user.id,
      username: user.username,
      solved: user.solved || [],
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/* -------------------------------------------------------------------------- */
/*                                 Toggle Solve                                */
/* -------------------------------------------------------------------------- */

/**
 * Toggle solved status for a user on a challenge.
 * If solve exists → remove it
 * If solve doesn't exist → add it
 * @route POST /api/user/toggle-solve
 */
const toggleSolve = async (req, res) => {
  const { username, challengeId } = req.body;

  if (!username || !challengeId) {
    return res.status(400).json({ error: "username and challengeId required" });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const existingSolve = await prisma.solved.findFirst({
      where: {
        userId: user.id,
        challengeId: Number(challengeId),
      },
    });

    // If already solved → remove it
    if (existingSolve) {
      await prisma.solved.delete({ where: { id: existingSolve.id } });

      return res.json({
        status: "removed",
        message: "Solve removed",
      });
    }

    // Otherwise create solve entry
    const solve = await prisma.solved.create({
      data: {
        userId: user.id,
        challengeId: Number(challengeId),
      },
    });

    return res.json({
      status: "added",
      message: "Solve recorded",
      solve,
    });
  } catch (error) {
    console.error("Error toggling solve:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/* -------------------------------------------------------------------------- */
/*                                   Exports                                   */
/* -------------------------------------------------------------------------- */

module.exports = {
  createOrGetUser,
  getUser,
  toggleSolve,
};
