/**
 * Auto Stopper Job (ESM)
 * ----------------------
 * Stops expired Docker containers and removes them from the DB.
 */

import prisma from "../config/db.js";
import docker from "../lib/docker.js";

export async function autoStopExpiredContainers() {
  const now = new Date();

  // Find expired container instances
  const expired = await prisma.userContainer.findMany({
    where: { expiresAt: { lte: now } },
  });

  for (const entry of expired) {
    try {
      console.log("Auto-stopping container:", entry.containerId);

      const container = docker.getContainer(entry.containerId);

      // Attempt to stop container (ignore errors)
      await container.stop().catch(() => {});
    } catch (err) {
      console.error("Auto-stop error:", err.message);
    }

    // Remove instance record from DB
    await prisma.userContainer.delete({
      where: { id: entry.id },
    });

    console.log("Deleted expired container record:", entry.id);
  }
}

export default { autoStopExpiredContainers };
