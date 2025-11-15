/**
 * Challenge Query Controller
 * --------------------------
 * This controller governs all read and lifecycle operations related to CTF
 * challenges. It acts as the boundary between routes and the service/database
 * layers, ensuring:
 *
 *  - Input validation and error normalization.
 *  - Authorization enforcement (where applicable).
 *  - Structured API responses for client applications.
 *
 * Responsibilities:
 *  - Fetching challenge metadata (public or admin-level).
 *  - Fetching a single challenge by ID, including file URLs.
 *  - Orchestrating the lifecycle of Docker-based challenge instances.
 */

const { prisma } = require("../config/db");
const {
  startChallengeContainer,
  stopChallengeContainer,
} = require("../services/containerService");

/* -------------------------------------------------------------------------- */
/*                           Get Challenge by ID                               */
/* -------------------------------------------------------------------------- */

/**
 * GET /api/challenges/:id
 * ------------------------
 * Retrieves metadata for a single challenge, including optional file URLs.
 *
 * Behaviors:
 *  - Validates that the ID parameter is numeric.
 *  - Returns only selected fields to prevent accidental leakage of admin-only data.
 *  - If the challenge includes a downloadable file, a fully qualified URL is
 *    constructed based on the current hostname and protocol.
 *
 * Error Handling:
 *  - Invalid ID → 400
 *  - Not found → 404
 *  - Unexpected errors → 500
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

    // Build fully qualified file URL if file exists
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
 * GET /api/challenges
 * -------------------
 * Retrieves all challenges. Intended primarily for administrative dashboards or
 * internal systems that require visibility into all challenge definitions.
 *
 * Notes:
 *  - No filters applied here; authentication/authorization should be enforced
 *    via middleware or controller logic depending on platform design.
 *  - Ordered newest-first for consistency with leaderboard and analytics flows.
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
 * GET /api/challenges/public
 * ---------------------------
 * Retrieves challenges that are marked as released and therefore visible to
 * players. This endpoint powers the challenge listing page on the user side.
 *
 * Notes:
 *  - Only a subset of fields is returned to avoid disclosing internal metadata.
 *  - `released: true` ensures controlled rollout of challenges.
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
    return res.status(500).json({
      error: "Failed to fetch public challenges",
    });
  }
};

/* -------------------------------------------------------------------------- */
/*                     Docker-Based Challenge Lifecycle                        */
/* -------------------------------------------------------------------------- */
/* START CONTAINER */
exports.startChallenge = async (req, res) => {
  const userId = req.user?.id;
  const challengeId = Number(req.params.id);

  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  try {
    const result = await startChallengeContainer(userId, challengeId);
    res.json(result);
  } catch (err) {
    console.error("Start error:", err);
    res.status(500).json({ error: err.message });
  }
};

/* STOP CONTAINER */
exports.stopChallenge = async (req, res) => {
  const userId = req.user?.id;
  const challengeId = Number(req.params.id);

  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  try {
    const result = await stopChallengeContainer(userId, challengeId);
    res.json(result);
  } catch (err) {
    console.error("Stop error:", err);
    res.status(500).json({ error: err.message });
  }
};

/* GET INSTANCE */
exports.getChallengeInstance = async (req, res) => {
  const userId = req.user?.id;
  const challengeId = Number(req.params.id);

  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  try {
    const challenge = await prisma.challenge.findUnique({
      where: { id: challengeId },
      select: { hasContainer: true },
    });

    if (!challenge) return res.status(404).json({ error: "Not found" });
    if (!challenge.hasContainer) return res.json({ status: "no-container" });

    const instance = await prisma.userContainer.findFirst({
      where: { userId, challengeId },
    });

    if (!instance) return res.json({ status: "none" });

    res.json({
      status: "running",
      port: instance.port,
      url: `http://localhost:${instance.port}`,
      expiresAt: instance.expiresAt,
    });
  } catch (err) {
    console.error("Get instance error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

/* SPAWN OR RETURN INSTANCE */
exports.spawnChallengeInstance = async (req, res) => {
  const userId = req.user?.id;
  const challengeId = Number(req.params.id);

  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  try {
    const challenge = await prisma.challenge.findUnique({
      where: { id: challengeId },
      select: { hasContainer: true },
    });

    if (!challenge) return res.status(404).json({ error: "Not found" });
    if (!challenge.hasContainer) return res.json({ status: "no-container" });

    const result = await startChallengeContainer(userId, challengeId);

    res.json({
      status: result.status,
      port: result.port,
      url: `http://localhost:${result.port}`,
      expiresAt: result.expiresAt,
    });
  } catch (err) {
    console.error("Spawn error:", err);
    res.status(500).json({ error: "Server error" });
  }
};