/**
 * Container Service (ESM + Hardened + Optimized)
 * -----------------------------------------------
 * Handles:
 *   - Per-user Docker container lifecycle
 *   - TTL extension logic
 *   - DB synchronization
 */

import prisma from "../config/db.js";
import docker from "../lib/docker.js";
import { getRandomPort } from "../lib/portAllocator.js";

/* ========================================================================== */
/*                               START INSTANCE                                */
/* ========================================================================== */

export async function startChallengeContainer(userId, challengeId) {
  const now = new Date();

  // Check existing instance ---------------------------------------------------
  const existing = await prisma.userContainer.findFirst({
    where: { userId, challengeId },
  });

  if (existing) {
    // If expired, clean it up instantly
    if (new Date(existing.expiresAt) <= now) {
      await stopChallengeContainer(userId, challengeId);
    } else {
      return {
        status: "running",
        port: existing.port,
        expiresAt: existing.expiresAt,
      };
    }
  }

  // Fetch challenge info ------------------------------------------------------
  const challenge = await prisma.challenge.findUnique({
    where: { id: challengeId },
    select: { hasContainer: true, imageName: true },
  });

  if (!challenge) throw new Error("Challenge not found");
  if (!challenge.hasContainer) throw new Error("Challenge has no container");
  if (!challenge.imageName) throw new Error("Challenge imageName missing");

  // Validate image exists -----------------------------------------------------
  const images = await docker.listImages();
  const imageExists = images.some((img) =>
    img.RepoTags?.includes(challenge.imageName)
  );

  if (!imageExists) {
    throw new Error(`Docker image not found: ${challenge.imageName}`);
  }

  // Allocate random port ------------------------------------------------------
  const port = await getRandomPort();

  // Create container ----------------------------------------------------------
  const container = await docker.createContainer({
    Image: challenge.imageName,
    name: `u${userId}_c${challengeId}_${Date.now()}`,
    HostConfig: {
      AutoRemove: true,
      PortBindings: { "80/tcp": [{ HostPort: `${port}` }] },
      Memory: 256 * 1024 * 1024, // 256MB default cap
    },
    Env: [
      `USER_ID=${userId}`,
      `CHALLENGE_ID=${challengeId}`,
    ],
  });

  await container.start();

  const expiresAt = new Date(Date.now() + 45 * 60 * 1000); // 45min TTL

  // Save instance in DB -------------------------------------------------------
  await prisma.userContainer.create({
    data: {
      userId,
      challengeId,
      containerId: container.id,
      port,
      expiresAt,
    },
  });

  return {
    status: "created",
    port,
    expiresAt,
  };
}

/* ========================================================================== */
/*                               STOP INSTANCE                                 */
/* ========================================================================== */

export async function stopChallengeContainer(userId, challengeId) {
  const instance = await prisma.userContainer.findFirst({
    where: { userId, challengeId },
  });

  if (!instance) return { status: "none" };

  try {
    const container = docker.getContainer(instance.containerId);

    // Ensure container exists before stopping
    const exists = await container.inspect().catch(() => null);

    if (exists) {
      await container.stop({ t: 2 }).catch(() => {});
    }
  } catch (err) {
    console.error("Stop container error:", err.message);
  }

  // Always delete DB entry
  await prisma.userContainer.delete({
    where: { id: instance.id },
  });

  return { status: "destroyed" };
}

/* ========================================================================== */
/*                             EXTEND INSTANCE TTL                              */
/* ========================================================================== */

export async function extendChallengeContainer(userId, challengeId) {
  const instance = await prisma.userContainer.findFirst({
    where: { userId, challengeId },
  });

  if (!instance) {
    return { error: "No active container" };
  }

  const now = new Date();
  const expiresAt = new Date(instance.expiresAt);

  // Expired? Stop immediately
  if (expiresAt <= now) {
    await stopChallengeContainer(userId, challengeId);
    return { error: "Container expired" };
  }

  const remainingSec = (expiresAt - now) / 1000;

  const MAX_TTL = 60 * 60; // 60 minutes
  const EXTEND_SEC = 30 * 60;

  if (remainingSec >= MAX_TTL) {
    return {
      status: "max_reached",
      remainingSeconds: remainingSec,
    };
  }

  const newTTL = Math.min(remainingSec + EXTEND_SEC, MAX_TTL);
  const newExpiry = new Date(now.getTime() + newTTL * 1000);

  await prisma.userContainer.update({
    where: { id: instance.id },
    data: { expiresAt: newExpiry },
  });

  return {
    status: "extended",
    expiresAt: newExpiry,
  };
}

export default {
  startChallengeContainer,
  stopChallengeContainer,
  extendChallengeContainer,
};
