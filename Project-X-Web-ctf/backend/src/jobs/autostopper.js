/**
 * Auto-Stopper Job
 * ----------------
 * Scheduled job responsible for identifying expired user containers and
 * gracefully terminating them.
 *
 * Responsibilities:
 * 1. Query containers whose expiration timestamp has passed.
 * 2. Stop the Docker container (non-blocking if already stopped).
 * 3. Remove associated metadata from the database to avoid stale entries.
 *
 * This prevents abandoned or idle containers from consuming system resources.
 */

const prisma = require("../config/db").prisma;
const docker = require("../lib/docker");

async function autoStopExpiredContainers() {
  const now = new Date();

  // Fetch containers that have reached expiration
  const expired = await prisma.userContainer.findMany({
    where: {
      expiresAt: { lte: now }
    }
  });

  for (const entry of expired) {
    try {
      console.log("Auto-stopping expired container:", entry.containerId);

      const container = docker.getContainer(entry.containerId);

      // Silently continue if container is already stopped or removed
      await container.stop().catch(() => {});
    } catch (err) {
      console.error("Error auto-stopping container:", err.message);
    }

    // Remove record from DB regardless of container stop outcome
    await prisma.userContainer.delete({
      where: { id: entry.id }
    });

    console.log("Removed container record:", entry.id);
  }
}

module.exports = { autoStopExpiredContainers };
