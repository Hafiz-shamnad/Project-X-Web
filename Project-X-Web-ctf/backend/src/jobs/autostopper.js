/**
 * Auto Stopper Job (ESM)
 * ----------------------
 * Stops expired Docker containers and removes corresponding DB entries.
 */

import prisma from "../config/db.js";
import docker from "../lib/docker.js";

export async function autoStopExpiredContainers() {
  try {
    const now = new Date();

    // Fetch expired containers
    const expired = await prisma.userContainer.findMany({
      where: { expiresAt: { lte: now } },
      select: {
        id: true,
        containerId: true,
      },
    });

    if (expired.length === 0) return;

    console.log(`🕒 AutoStop: Found ${expired.length} expired container(s)`);

    // Stop containers in parallel but safely
    await Promise.all(
      expired.map(async (entry) => {
        const { id, containerId } = entry;

        try {
          console.log(`⛔ Stopping container ${containerId}…`);

          const container = docker.getContainer(containerId);

          // Check if container exists before stopping
          const inspect = await container.inspect().catch(() => null);

          if (inspect) {
            await container.stop({ t: 2 }).catch(() => {});
            console.log(`🛑 Container stopped: ${containerId}`);
          } else {
            console.log(`⚠️ Container not found, skipping: ${containerId}`);
          }
        } catch (err) {
          console.error(`❌ Error stopping container ${containerId}:`, err.message);
        }

        // Remove instance record regardless of Docker success
        try {
          await prisma.userContainer.delete({ where: { id } });
          console.log(`🗑️ Deleted expired DB record: ${id}`);
        } catch (dbErr) {
          console.error(`❌ Failed to delete DB record ${id}:`, dbErr.message);
        }
      })
    );

    console.log("✅ AutoStop job completed.");
  } catch (error) {
    console.error("🔥 AutoStop job fatal error:", error.message);
  }
}

export default { autoStopExpiredContainers };
