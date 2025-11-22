/**
 * Challenge Controller (ESM + Secured + Optimized)
 */

import prisma from "../config/db.js";
import {
  startChallengeContainer,
  stopChallengeContainer,
  extendChallengeContainer
} from "../services/containerService.js";

/* -------------------------------------------------------------------------- */
/*                             Helper Functions                                */
/* -------------------------------------------------------------------------- */

function getBaseUrl(req) {
  return `${req.protocol}://${req.get("host")}`;
}

function requireUser(req) {
  if (!req.user?.id) {
    const error = new Error("Unauthorized");
    error.status = 401;
    throw error;
  }
  return req.user.id;
}

async function ensureChallengeExists(challengeId) {
  return prisma.challenge.findUnique({
    where: { id: challengeId },
    select: {
      id: true,
      released: true,
      hasContainer: true
    }
  });
}

/* -------------------------------------------------------------------------- */
/*                               Get Challenge                                 */
/* -------------------------------------------------------------------------- */

export async function getChallengeById(req, res) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });

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
        released: true,
        hasContainer: true,
        createdAt: true
      }
    });

    if (!challenge) return res.status(404).json({ error: "Challenge not found" });

    const base = getBaseUrl(req);

    return res.json({
      ...challenge,
      fileUrl: challenge.filePath
        ? `${base}/uploads/${challenge.filePath.split("/").pop()}`
        : null
    });
  } catch (err) {
    console.error("getChallengeById error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}

/* -------------------------------------------------------------------------- */
/*                             Get All Challenges                              */
/* -------------------------------------------------------------------------- */

export async function getChallenges(req, res) {
  try {
    const challenges = await prisma.challenge.findMany({
      orderBy: { createdAt: "desc" }
    });

    return res.json(challenges);
  } catch (err) {
    console.error("getChallenges error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}

/* -------------------------------------------------------------------------- */
/*                        Public Released Challenges                           */
/* -------------------------------------------------------------------------- */

export async function getPublicChallenges(req, res) {
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
        hasContainer: true
      },
      orderBy: { createdAt: "desc" }
    });

    return res.json(challenges);
  } catch (err) {
    console.error("getPublicChallenges error:", err);
    return res.status(500).json({ error: "Failed to fetch public challenges" });
  }
}

/* -------------------------------------------------------------------------- */
/*                     Docker Challenge Instance Management                    */
/* -------------------------------------------------------------------------- */

export async function startChallenge(req, res) {
  try {
    const userId = requireUser(req);
    const challengeId = Number(req.params.id);

    const challenge = await ensureChallengeExists(challengeId);
    if (!challenge) return res.status(404).json({ error: "Challenge not found" });

    if (!challenge.released) {
      return res.status(403).json({ error: "Challenge not yet released" });
    }
    if (!challenge.hasContainer) {
      return res.status(400).json({ error: "Challenge does not have a container instance" });
    }

    const result = await startChallengeContainer(userId, challengeId);
    return res.json(result);
  } catch (err) {
    console.error("startChallenge error:", err);
    return res.status(err.status || 500).json({ error: err.message });
  }
}

export async function stopChallenge(req, res) {
  try {
    const userId = requireUser(req);
    const challengeId = Number(req.params.id);

    const challenge = await ensureChallengeExists(challengeId);
    if (!challenge) return res.status(404).json({ error: "Challenge not found" });

    if (!challenge.hasContainer) {
      return res.status(400).json({ error: "Challenge has no container instance" });
    }

    const result = await stopChallengeContainer(userId, challengeId);
    return res.json(result);
  } catch (err) {
    console.error("stopChallenge error:", err);
    return res.status(err.status || 500).json({ error: err.message });
  }
}

export async function getChallengeInstance(req, res) {
  try {
    const userId = requireUser(req);
    const challengeId = Number(req.params.id);

    const challenge = await ensureChallengeExists(challengeId);
    if (!challenge) return res.status(404).json({ error: "Challenge not found" });

    if (!challenge.hasContainer) return res.json({ status: "no-container" });

    const inst = await prisma.userContainer.findFirst({
      where: { userId, challengeId }
    });

    if (!inst) return res.json({ status: "none" });

    const base = getBaseUrl(req);

    return res.json({
      status: "running",
      port: inst.port,
      url: `${base}:${inst.port}`,
      expiresAt: inst.expiresAt
    });
  } catch (err) {
    console.error("getChallengeInstance error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}

export async function spawnChallengeInstance(req, res) {
  try {
    const userId = requireUser(req);
    const challengeId = Number(req.params.id);

    const challenge = await ensureChallengeExists(challengeId);
    if (!challenge) return res.status(404).json({ error: "Challenge not found" });

    if (!challenge.released) {
      return res.status(403).json({ error: "Challenge not released" });
    }
    if (!challenge.hasContainer) {
      return res.status(400).json({ error: "Challenge has no container instance" });
    }

    const result = await startChallengeContainer(userId, challengeId);
    const base = getBaseUrl(req);

    return res.json({
      status: result.status,
      port: result.port,
      url: `${base}:${result.port}`,
      expiresAt: result.expiresAt
    });
  } catch (err) {
    console.error("spawnChallengeInstance error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}

export async function extendInstance(req, res) {
  try {
    const userId = requireUser(req);
    const challengeId = Number(req.params.id);

    const challenge = await ensureChallengeExists(challengeId);
    if (!challenge) return res.status(404).json({ error: "Challenge not found" });

    const result = await extendChallengeContainer(userId, challengeId);

    if (result.error) return res.status(400).json(result);
    return res.json(result);
  } catch (err) {
    console.error("extendInstance error:", err);
    return res.status(500).json({ error: "Failed to extend challenge instance" });
  }
}

export default {
  getChallengeById,
  getChallenges,
  getPublicChallenges,
  startChallenge,
  stopChallenge,
  getChallengeInstance,
  spawnChallengeInstance,
  extendInstance
};
