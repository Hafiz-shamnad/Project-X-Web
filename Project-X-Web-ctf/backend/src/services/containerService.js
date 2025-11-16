/**
 * Container Service
 * -----------------
 * Handles starting/stopping user-specific Docker containers.
 */

const { prisma } = require("../config/db");
const docker = require("../lib/docker");
const { getRandomPort } = require("../lib/portAllocator");

/**
 * Start per-user container instance
 */
async function startChallengeContainer(userId, challengeId) {
  // Check if instance already exists
  const existing = await prisma.userContainer.findFirst({
    where: { userId, challengeId },
  });

  if (existing) {
    return {
      status: "running",
      port: existing.port,
      expiresAt: existing.expiresAt,
    };
  }

  // Get challenge info
  const challenge = await prisma.challenge.findUnique({
    where: { id: challengeId },
    select: {
      hasContainer: true,
      imageName: true,
    },
  });

  if (!challenge) throw new Error("Challenge not found");
  if (!challenge.hasContainer) throw new Error("Challenge has no container");
  if (!challenge.imageName) throw new Error("Challenge imageName missing");

  const port = getRandomPort();

  // Create Docker container
  const container = await docker.createContainer({
    Image: challenge.imageName,
    name: `u${userId}_c${challengeId}_${Date.now()}`,
    HostConfig: {
      AutoRemove: true,
      PortBindings: {
        "80/tcp": [{ HostPort: `${port}` }],
      },
    },
    Env: [
      `USER_ID=${userId}`,
      `CHALLENGE_ID=${challengeId}`,
    ],
  });

  await container.start();

  const expiresAt = new Date(Date.now() + 45 * 60 * 1000);

  // Save instance in DB
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

/**
 * Stop and delete container
 */
async function stopChallengeContainer(userId, challengeId) {
  const instance = await prisma.userContainer.findFirst({
    where: { userId, challengeId },
  });

  if (!instance) return { status: "none" };

  try {
    const container = docker.getContainer(instance.containerId);
    await container.stop().catch(() => {});
  } catch (err) {
    console.error("Stop error:", err.message);
  }

  await prisma.userContainer.delete({
    where: { id: instance.id },
  });

  return { status: "destroyed" };
}

/**
 * Extend container expiry by +30 minutes (does NOT recreate container)
 */
async function extendChallengeContainer(userId, challengeId) {
  const instance = await prisma.userContainer.findFirst({
    where: { userId, challengeId },
  });

  if (!instance) {
    return { error: "No active container" };
  }

  const now = new Date();
  const currentRemaining = (new Date(instance.expiresAt).getTime() - now.getTime()) / 1000;

  const MAX_TIME_SECONDS = 60 * 60; // 60 minutes

  // Already at or above max time?
  if (currentRemaining >= MAX_TIME_SECONDS) {
    return { status: "max_reached", remainingSeconds: currentRemaining };
  }

  // How much we can extend?
  const extendSeconds = 30 * 60; // 30 minutes
  const newTotal = currentRemaining + extendSeconds;

  // Clamp to max
  const allowedNewTotal = Math.min(newTotal, MAX_TIME_SECONDS);

  const newExpiry = new Date(now.getTime() + allowedNewTotal * 1000);

  await prisma.userContainer.update({
    where: { id: instance.id },
    data: { expiresAt: newExpiry },
  });

  return {
    status: "extended",
    expiresAt: newExpiry,
  };
}


module.exports = {
  startChallengeContainer,
  stopChallengeContainer,
  extendChallengeContainer,
};
