/**
 * Profile Controller
 * ------------------
 * Handles:
 *  - Fetching authenticated user's profile
 *  - Fetching public user profiles
 *  - Updating authenticated user's profile
 */

const { prisma } = require("../config/db");

/* -------------------------------------------------------------------------- */
/*                        GET AUTHENTICATED USER PROFILE                       */
/* -------------------------------------------------------------------------- */

/**
 * Return the profile of the authenticated user.
 * @route GET /api/profile/me
 */
exports.getMyProfile = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

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

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const totalPoints = user.solved.reduce(
      (sum, s) => sum + (s.challenge?.points || 0),
      0
    );

    return res.json({
      id: user.id,
      username: user.username,
      bio: user.bio,
      country: user.country,
      team: user.team ? { id: user.team.id, name: user.team.name } : null,
      totalPoints,
      challengesSolved: user.solved.map((s) => ({
        id: s.challenge.id,
        name: s.challenge.name,
        category: s.challenge.category,
        points: s.challenge.points,
      })),
      createdAt: user.createdAt,
      avatarUrl: user.avatarUrl,
    });
  } catch (err) {
    console.error("Profile fetch error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

/* -------------------------------------------------------------------------- */
/*                           GET PUBLIC USER PROFILE                           */
/* -------------------------------------------------------------------------- */

/**
 * Return a public profile for a given username.
 * @route GET /api/profile/:username
 */
exports.getPublicProfile = async (req, res) => {
  try {
    const { username } = req.params;

    if (!username) {
      return res.status(400).json({ error: "Invalid username" });
    }

    const user = await prisma.user.findUnique({
      where: { username },
      include: {
        team: true,
        solves: { include: { challenge: true } },
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const totalPoints = user.solves.reduce(
      (sum, s) => sum + (s.challenge?.points || 0),
      0
    );

    return res.json({
      username: user.username,
      bio: user.bio,
      country: user.country,
      team: user.team ? user.team.name : null,
      totalPoints,
      solveCount: user.solves.length,
      avatarUrl: user.avatarUrl,
    });
  } catch (err) {
    console.error("Public profile error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

/* -------------------------------------------------------------------------- */
/*                        UPDATE AUTHENTICATED USER PROFILE                    */
/* -------------------------------------------------------------------------- */

/**
 * Update the profile of the authenticated user.
 * @route PUT /api/profile/me
 */
exports.updateMyProfile = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { bio, country, avatarUrl } = req.body;

    const updatedUser = await prisma.user.update({
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
      user: updatedUser,
    });
  } catch (err) {
    console.error("Profile update error:", err);
    return res.status(500).json({ error: "Server error updating profile" });
  }
};
