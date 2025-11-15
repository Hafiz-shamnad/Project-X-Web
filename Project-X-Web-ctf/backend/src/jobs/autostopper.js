/**
 * Auto Stopper Job
 */

const { prisma } = require("../config/db");
const docker = require("../lib/docker");

async function autoStopExpiredContainers() {
  const now = new Date();

  const expired = await prisma.userContainer.findMany({
    where: { expiresAt: { lte: now } },
  });

  for (const entry of expired) {
    try {
      console.log("Auto-stopping:", entry.containerId);

      const container = docker.getContainer(entry.containerId);
      await container.stop().catch(() => {});

    } catch (err) {
      console.error("Auto-stop error:", err.message);
    }

    await prisma.userContainer.delete({
      where: { id: entry.id },
    });

    console.log("Removed expired record:", entry.id);
  }
}

module.exports = { autoStopExpiredContainers };
