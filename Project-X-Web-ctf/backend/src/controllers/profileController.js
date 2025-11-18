/**
 * Profile Controller (ESM + Optimized)
 */

import prisma from "../config/db.js";

/* -------------------------------------------------------------------------- */
/*                           GET AUTHENTICATED PROFILE                         */
/* -------------------------------------------------------------------------- */

export async function getMyProfile(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        team: true,
        solved: {
          include: { challenge: true },
          orderBy: { id: "desc" },
        },
      },
    });

    if (!user) return res.status(404).json({ error: "User not found" });

    const totalPoints = user.solved.reduce(
      (sum, s) => sum + (s.challenge?.points || 0),
      0
    );

    return res.json({
      id: user.id,
      username: user.username,
      bio: user.bio,
      country: user.country,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
      team: user.team ? { id: user.team.id, name: user.team.name } : null,
      totalPoints,
      challengesSolved: user.solved.map((s) => ({
        id: s.challenge.id,
        name: s.challenge.name,
        category: s.challenge.category,
        points: s.challenge.points,
      })),
    });
  } catch (err) {
    console.error("getMyProfile error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}

/* -------------------------------------------------------------------------- */
/*                           GET PUBLIC PROFILE                                */
/* -------------------------------------------------------------------------- */

export async function getPublicProfile(req, res) {
  try {
    const { username } = req.params;
    if (!username) return res.status(400).json({ error: "Invalid username" });

    const user = await prisma.user.findUnique({
      where: { username },
      include: {
        team: true,
        solves: { include: { challenge: true } },
      },
    });

    if (!user) return res.status(404).json({ error: "User not found" });

    const totalPoints = user.solves.reduce(
      (a, b) => a + (b.challenge?.points || 0),
      0
    );

    return res.json({
      username: user.username,
      bio: user.bio,
      country: user.country,
      avatarUrl: user.avatarUrl,
      team: user.team ? user.team.name : null,
      solveCount: user.solves.length,
      totalPoints,
    });
  } catch (err) {
    console.error("getPublicProfile error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}

/* -------------------------------------------------------------------------- */
/*                         UPDATE AUTHENTICATED PROFILE                        */
/* -------------------------------------------------------------------------- */

export async function updateMyProfile(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { bio, country, avatarUrl } = req.body;

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        bio: bio ?? "",
        country: country ?? "",
        avatarUrl: avatarUrl ?? "",
      },
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
