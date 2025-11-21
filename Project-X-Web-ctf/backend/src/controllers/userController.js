/**
 * User Controller (ESM + Secured + Optimized)
 */

import prisma from "../config/db.js";

/* -------------------------------------------------------------------------- */
/*                                 AUTH HELPER                                 */
/* -------------------------------------------------------------------------- */

function requireUser(req) {
  if (!req.user?.id) {
    const err = new Error("Unauthorized");
    err.status = 401;
    throw err;
  }
  return req.user.id;
}

/* -------------------------------------------------------------------------- */
/*                       Create or Fetch Existing User                         */
/* -------------------------------------------------------------------------- */

export async function createOrGetUser(req, res) {
  try {
    const { username } = req.body;

    if (!username || typeof username !== "string" || !username.trim()) {
      return res.status(400).json({ error: "Valid username is required" });
    }

    const clean = username.trim();

    let user = await prisma.user.findUnique({
      where: { username: clean },
      select: { id: true, username: true, createdAt: true },
    });

    if (!user) {
      user = await prisma.user.create({
        data: { username: clean },
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
  try {
    const { username } = req.params;

    if (!username || typeof username !== "string") {
      return res.status(400).json({ error: "Invalid username" });
    }

    const clean = username.trim();

    const user = await prisma.user.findUnique({
      where: { username: clean },
      include: {
        solved: {
          include: { challenge: true },
          orderBy: { solvedAt: "asc" },  // ✅ Using solvedAt
        },
      },
    });

    if (!user) {
      return res.json({
        id: null,
        username: clean,
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
  try {
    const userId = requireUser(req);
    const { challengeId } = req.body;

    if (!challengeId) {
      return res.status(400).json({ error: "challengeId is required" });
    }

    const cId = Number(challengeId);
    if (isNaN(cId)) {
      return res.status(400).json({ error: "Invalid challenge ID" });
    }

    const existing = await prisma.solved.findFirst({
      where: { userId, challengeId: cId },
      select: { id: true },
    });

    // If already solved → remove it
    if (existing) {
      await prisma.solved.delete({ where: { id: existing.id } });

      return res.json({
        status: "removed",
        message: "Solve removed",
      });
    }

    // Else create new solve
    const solve = await prisma.solved.create({
      data: {
        userId,
        challengeId: cId,
        solvedAt: new Date(),
      },
    });

    return res.json({
      status: "added",
      message: "Solve recorded",
      solve,
    });
  } catch (error) {
    console.error("toggleSolve error:", error);
    return res.status(error.status || 500).json({
      error: error.status === 401 ? "Unauthorized" : "Internal server error",
    });
  }
}

export default {
  createOrGetUser,
  getUser,
  toggleSolve,
};
