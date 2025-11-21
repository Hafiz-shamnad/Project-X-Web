/**
 * User Controller (ESM + Secured + Optimized)
 * -------------------------------------------
 * Handles:
 *  - Creating a user if not exists
 *  - Fetching a user with solve history
 *  - Toggling a solve entry (authenticated)
 */

import prisma from "../config/db.js";

/* -------------------------------------------------------------------------- */
/*                       Create or Fetch Existing User                         */
/* -------------------------------------------------------------------------- */

export async function createOrGetUser(req, res) {
  const { username } = req.body;

  if (!username || typeof username !== "string") {
    return res.status(400).json({ error: "Valid username is required" });
  }

  try {
    let user = await prisma.user.findUnique({
      where: { username },
      select: { id: true, username: true, createdAt: true },
    });

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

export async function toggleSolve(req, res) {
  const { challengeId } = req.body;

  // 🔒 Always use authenticated user
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({
      error: "Unauthorized: Missing user from token",
    });
  }

  if (!challengeId) {
    return res.status(400).json({
      error: "challengeId is required",
    });
  }

  try {
    const cId = Number(challengeId);

    const existing = await prisma.solved.findFirst({
      where: { userId, challengeId: cId },
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

    // Else create solve
    const solve = await prisma.solved.create({
      data: { userId, challengeId: cId },
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
