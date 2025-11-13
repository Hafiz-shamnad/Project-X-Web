/**
 * Database Initialization
 * -----------------------
 * Provides a connected Prisma client instance and initializes the database
 * connection at application startup.
 */

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

/**
 * Initialize and verify database connection.
 * Exits the process on failure.
 */
const initDB = async () => {
  try {
    await prisma.$connect();
    console.log("Database connection established");
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1);
  }
};

module.exports = { initDB, prisma };
