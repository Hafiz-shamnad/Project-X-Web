/**
 * Container Service
 * -----------------
 * Responsible for lifecycle management of per-user, per-challenge containers.
 * This service abstracts Docker operations and ensures synchronization with
 * the persistent database layer (Prisma).
 *
 * Key Responsibilities:
 * - Start a new container instance for a user attempting a challenge.
 * - Prevent multiple containers for the same (user, challenge) pair.
 * - Allocate a random host port and bind container port 80.
 * - Stop and clean up containers when the user ends the challenge or on expiry.
 */

const { prisma } = require("../config/db");
const docker = require("../lib/docker");
const { getRandomPort } = require("../lib/portAllocator");

/**
 * Starts a container for a user and challenge.
 * - Ensures idempotency: if container exists, returns existing instance.
 * - Creates Docker container with challenge image.
 * - Persists metadata for tracking and auto-expiry.
 */
async function startChallengeContainer(userId, challengeId) {
    // Check if container already exists for this user/challenge
    const existing = await prisma.userContainer.findFirst({
        where: { userId, challengeId }
    });

    if (existing) {
        return {
            status: "running",
            port: existing.port
        };
    }

    // Fetch challenge metadata (e.g., Docker image)
    const challenge = await prisma.challenge.findUnique({
        where: { id: challengeId },
        select: {
            hasContainer: true,
            imageName: true,
        },
    });

    if (!challenge.imageName) {
        throw new Error("Challenge does not have a Docker imageName");
    }

    const image = challenge.imageName;

    const port = getRandomPort();

    /**
     * Create Docker container
     * - AutoRemove: container is removed automatically when stopped
     * - PortBindings: maps container port 80 to selected host port
     * - Env: inject metadata inside container for auditing or logging
     */
    const container = await docker.createContainer({
        Image: image, 
        name: `user_${userId}_challenge_${challengeId}`,
        HostConfig: {
            AutoRemove: true,
            PortBindings: {
                "80/tcp": [{ HostPort: `${port}` }]
            }
        },
        Env: [
            `USER_ID=${userId}`,
            `CHALLENGE_ID=${challengeId}`
        ]
    });

    await container.start();

    // Persist container record to enable auto-stop and UI visibility
    await prisma.userContainer.create({
        data: {
            userId,
            challengeId,
            containerId: container.id,
            port,
            expiresAt: new Date(Date.now() + 45 * 60 * 1000) // 45-minute TTL
        }
    });

    return { status: "created", port };
}

/**
 * Stops a running challenge container.
 * - Gracefully stops Docker container.
 * - Removes metadata record.
 */
async function stopChallengeContainer(userId, challengeId) {
    const record = await prisma.userContainer.findFirst({
        where: { userId, challengeId }
    });

    if (!record) {
        return { status: "none" };
    }

    try {
        const container = docker.getContainer(record.containerId);

        // Stop may fail if container already crashed or was removed externally
        await container.stop().catch(() => { });
    } catch (err) {
        console.error("Container stop error:", err.message);
    }

    // Remove DB record to maintain integrity
    await prisma.userContainer.delete({
        where: { id: record.id }
    });

    return { status: "destroyed" };
}

module.exports = {
    startChallengeContainer,
    stopChallengeContainer
};
