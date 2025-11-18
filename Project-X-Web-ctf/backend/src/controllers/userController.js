/**
 * User Controller (ESM + Optimized)
 * ---------------------------------
 * Handles:
 *  - Creating a user if not exists
 *  - Fetching a user with solve history
 *  - Toggling a solve entry
 */

import prisma from "../config/db.js";

/* -------------------------------------------------------------------------- */
/*                       Create or Fetch Existing User                         */
/* -------------------------------------------------------------------------- */

/**
 * Create a new user if they do not exist, otherwise return existing user.
 * POST /api/user
 */
export async function createOrGetUser(req, res) {
  const { username } = req.body;

  if (!username || typeof username !== "string") {
    return res.status(400).json({ error: "Valid username is required" });
  }

  try {
    // Fast fetch (indexed field)
    let user = await prisma.user.findUnique({
      where: { username },
      select: { id: true, username: true, createdAt: true },
    });

    // Create if missing
    if (!user) {
      user = await prisma.user.create({
        data: { username },
        select: { id: true, username: true, createdAt: true },
      });
    }

    return res.json(user);
  } catch (error) {
    console.error("createOrGetUser error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

/* -------------------------------------------------------------------------- */
/*                               Get User Profile                              */
/* -------------------------------------------------------------------------- */

/**
 * Fetch a public user profile including solved challenges.
 * GET /api/user/:username
 */
export async function getUser(req, res) {
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

    // Return empty if user not found (keeps UI consistent)
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
      solved: user.solved ?? [],
    });
  } catch (error) {
    console.error("getUser error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

/* -------------------------------------------------------------------------- */
/*                                 Toggle Solve                                */
/* -------------------------------------------------------------------------- */

/**
 * Toggle solved status for a user on a challenge.
 * POST /api/user/toggle-solve
 */
export async function toggleSolve(req, res) {
  const { username, challengeId } = req.body;

  if (!username || !challengeId) {
    return res.status(400).json({
      error: "username and challengeId required",
    });
  }

  try {
    // Fetch user fast
    const user = await prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const cId = Number(challengeId);

    const existing = await prisma.solved.findFirst({
      where: { userId: user.id, challengeId: cId },
      select: { id: true },
    });

    // If solved → remove it
    if (existing) {
      await prisma.solved.delete({ where: { id: existing.id } });

      return res.json({
        status: "removed",
        message: "Solve removed",
      });
    }

    // Otherwise create solve
    const solve = await prisma.solved.create({
      data: { userId: user.id, challengeId: cId },
    });

    return res.json({
      status: "added",
      message: "Solve recorded",
      solve,
    });
  } catch (error) {
    console.error("toggleSolve error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export default {
  createOrGetUser,
  getUser,
  toggleSolve,
};
