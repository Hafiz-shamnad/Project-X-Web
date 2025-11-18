/**
 * Database Initialization (ESM + Optimized)
 * -----------------------------------------
 * - Provides a singleton Prisma client
 * - Initializes DB only once at startup
 * - Ensures clean shutdown on SIGTERM/SIGINT
 */

import { PrismaClient } from "@prisma/client";

// Singleton Prisma instance
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "development"
    ? ["query", "error", "warn"]
    : ["error"]
});

/**
 * Initialize and verify database connection.
 */
export async function initDB() {
  try {
    await prisma.$connect();
    console.log("🗄️  Database connection established");
  } catch (err) {
    console.error("❌ Database connection failed:", err);
    process.exit(1);
  }
}

/**
 * Graceful shutdown
 */
async function shutdown() {
  try {
    console.log("🔌 Closing database connection...");
    await prisma.$disconnect();
    process.exit(0);
  } catch (err) {
    console.error("❌ Error during DB shutdown:", err);
    process.exit(1);
  }
}

// OS signals for cleanup
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

export default prisma;
