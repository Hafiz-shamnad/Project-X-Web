/**
 * Challenge Controller (ESM + Optimized)
 */

import prisma from "../config/db.js";
import {
  startChallengeContainer,
  stopChallengeContainer,
  extendChallengeContainer
} from "../services/containerService.js";

/* -------------------------------------------------------------------------- */
/*                               Get Challenge                                 */
/* -------------------------------------------------------------------------- */

export async function getChallengeById(req, res) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });

    const ch = await prisma.challenge.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        difficulty: true,
        points: true,
        filePath: true
      }
    });

    if (!ch) return res.status(404).json({ error: "Challenge not found" });

    const base = `${req.protocol}://${req.get("host")}`;

    return res.json({
      ...ch,
      fileUrl: ch.filePath ? `${base}/${ch.filePath}` : null
    });
  } catch (err) {
    console.error("getChallenge error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}

/* -------------------------------------------------------------------------- */
/*                             Get Challenges                                  */
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

/* Public released challenges */
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
        createdAt: true
      },
      orderBy: { createdAt: "desc" }
    });

    return res.json(challenges);
  } catch (err) {
    return res
      .status(500)
      .json({ error: "Failed to fetch public challenges" });
  }
}

/* -------------------------------------------------------------------------- */
/*                   Docker Challenge Instance Management                     */
/* -------------------------------------------------------------------------- */

export async function startChallenge(req, res) {
  try {
    const userId = req.user?.id;
    const challengeId = Number(req.params.id);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const result = await startChallengeContainer(userId, challengeId);
    return res.json(result);
  } catch (err) {
    console.error("startChallenge error:", err);
    return res.status(500).json({ error: err.message });
  }
}

export async function stopChallenge(req, res) {
  try {
    const userId = req.user?.id;
    const challengeId = Number(req.params.id);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const result = await stopChallengeContainer(userId, challengeId);
    return res.json(result);
  } catch (err) {
    console.error("stopChallenge error:", err);
    return res.status(500).json({ error: err.message });
  }
}

export async function getChallengeInstance(req, res) {
  try {
    const userId = req.user?.id;
    const challengeId = Number(req.params.id);

    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const ch = await prisma.challenge.findUnique({
      where: { id: challengeId },
      select: { hasContainer: true }
    });

    if (!ch) return res.status(404).json({ error: "Not found" });
    if (!ch.hasContainer) return res.json({ status: "no-container" });

    const inst = await prisma.userContainer.findFirst({
      where: { userId, challengeId }
    });

    if (!inst) return res.json({ status: "none" });

    return res.json({
      status: "running",
      port: inst.port,
      url: `http://localhost:${inst.port}`,
      expiresAt: inst.expiresAt
    });
  } catch (err) {
    console.error("getInstance error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}

export async function spawnChallengeInstance(req, res) {
  try {
    const userId = req.user?.id;
    const challengeId = Number(req.params.id);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const result = await startChallengeContainer(userId, challengeId);

    return res.json({
      status: result.status,
      port: result.port,
      url: `http://localhost:${result.port}`,
      expiresAt: result.expiresAt
    });
  } catch (err) {
    console.error("spawn error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}

export async function extendInstance(req, res) {
  try {
    const result = await extendChallengeContainer(
      req.user.id,
      Number(req.params.id)
    );

    if (result.error) return res.status(400).json(result);
    return res.json(result);
  } catch (err) {
    console.error("extend error:", err);
    return res
      .status(500)
      .json({ error: "Failed to extend challenge instance" });
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
