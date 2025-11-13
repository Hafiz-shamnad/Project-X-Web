/**
 * Challenge Query Controller
 * --------------------------
 * Handles:
 *  - Fetching a single challenge by ID
 *  - Fetching all challenges (admin)
 *  - Fetching public released challenges (players)
 */

const { prisma } = require("../config/db");

/* -------------------------------------------------------------------------- */
/*                           Get Challenge by ID                               */
/* -------------------------------------------------------------------------- */

/**
 * Return a single challenge including file download URL.
 * @route GET /api/challenges/:id
 */
exports.getChallengeById = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid challenge ID" });
    }

    const challenge = await prisma.challenge.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        difficulty: true,
        points: true,
        filePath: true,
      },
    });

    if (!challenge) {
      return res.status(404).json({ error: "Challenge not found" });
    }

    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const fileUrl = challenge.filePath
      ? `${baseUrl}/${challenge.filePath}`
      : null;

    return res.json({
      ...challenge,
      fileUrl,
    });
  } catch (err) {
    console.error("Error fetching challenge by ID:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

/* -------------------------------------------------------------------------- */
/*                            Get All Challenges                               */
/* -------------------------------------------------------------------------- */

/**
 * Retrieve all challenges (admin).
 * @route GET /api/challenges
 */
exports.getChallenges = async (req, res) => {
  try {
    const challenges = await prisma.challenge.findMany({
      orderBy: { createdAt: "desc" },
    });

    return res.json(challenges);
  } catch (err) {
    console.error("Error fetching challenges:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

/* -------------------------------------------------------------------------- */
/*                         Get Public Released Challenges                      */
/* -------------------------------------------------------------------------- */

/**
 * Retrieve only released challenges (players).
 * @route GET /api/challenges/public
 */
exports.getPublicChallenges = async (req, res) => {
  try {
    const challenges = await prisma.challenge.findMany({
      where: { released: true },
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        difficulty: true,
        points: true,
        filePath: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return res.json(challenges);
  } catch (err) {
    console.error("Error fetching public challenges:", err);
    return res
      .status(500)
      .json({ error: "Failed to fetch public challenges" });
  }
};
