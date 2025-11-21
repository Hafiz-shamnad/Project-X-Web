/**
 * Profile Controller (ESM + Schema-Accurate + Optimized)
 */

import prisma from "../config/db.js";

/* -------------------------------------------------------------------------- */
/*                               REQ USER HELPER                              */
/* -------------------------------------------------------------------------- */

function requireUser(req) {
  if (!req.user?.id) {
    const error = new Error("Unauthorized");
    error.status = 401;
    throw error;
  }
  return req.user.id;
}

/* -------------------------------------------------------------------------- */
/*                        GET AUTHENTICATED PROFILE                            */
/* -------------------------------------------------------------------------- */

export async function getMyProfile(req, res) {
  try {
    const userId = requireUser(req);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        team: true,
        solved: {
          include: { challenge: true },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!user) return res.status(404).json({ error: "User not found" });

    const totalPoints = user.solved.reduce(
      (sum, s) => sum + (s.challenge?.points ?? 0),
      0
    );

    return res.json({
      id: user.id,
      username: user.username,
      bio: user.bio,
      country: user.country,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,

      team: user.team
        ? { id: user.team.id, name: user.team.name }
        : null,

      totalPoints,

      challengesSolved: user.solved.map((s) => ({
        solveId: s.id,
        challengeId: s.challenge.id,
        name: s.challenge.name,
        category: s.challenge.category,
        points: s.challenge.points,
        solvedAt: s.solvedAt,
      })),
    });
  } catch (err) {
    console.error("getMyProfile error:", err);
    return res.status(err.status || 500).json({ error: "Server error" });
  }
}

/* -------------------------------------------------------------------------- */
/*                           GET PUBLIC PROFILE                                */
/* -------------------------------------------------------------------------- */

export async function getPublicProfile(req, res) {
  try {
    const { username } = req.params;

    if (!username?.trim()) {
      return res.status(400).json({ error: "Invalid username" });
    }

    const user = await prisma.user.findUnique({
      where: { username },
      include: {
        team: true,
        solved: {
          include: { challenge: true },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!user) return res.status(404).json({ error: "User not found" });

    const totalPoints = user.solved.reduce(
      (sum, s) => sum + (s.challenge?.points ?? 0),
      0
    );

    return res.json({
      username: user.username,
      bio: user.bio,
      country: user.country,
      avatarUrl: user.avatarUrl,
      team: user.team ? user.team.name : null,
      solveCount: user.solved.length,
      totalPoints,
    });
  } catch (err) {
    console.error("getPublicProfile error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}

/* -------------------------------------------------------------------------- */
/*                       UPDATE AUTHENTICATED PROFILE                          */
/* -------------------------------------------------------------------------- */

export async function updateMyProfile(req, res) {
  try {
    const userId = requireUser(req);

    const { bio, country, avatarUrl } = req.body ?? {};

    // Basic sanitization
    const sanitized = {
      bio: typeof bio === "string" ? bio.trim() : "",
      country: typeof country === "string" ? country.trim() : "",
      avatarUrl: typeof avatarUrl === "string" ? avatarUrl.trim() : "",
    };

    const user = await prisma.user.update({
      where: { id: userId },
      data: sanitized,
      select: {
        id: true,
        username: true,
        bio: true,
        country: true,
        avatarUrl: true,
        createdAt: true,
      },
    });

    return res.json({
      message: "Profile updated successfully",
      user,
    });
  } catch (err) {
    console.error("updateMyProfile error:", err);
    return res.status(500).json({ error: "Server error updating profile" });
  }
}

export default {
  getMyProfile,
  getPublicProfile,
  updateMyProfile,
};
