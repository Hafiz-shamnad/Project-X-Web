import "dotenv/config";
import { defineConfig, env } from "prisma/config";

/**
 * Prisma Configuration for Supabase (Fully Correct)
 * -------------------------------------------------
 * - DATABASE_URL  → pooled connection (pgbouncer/6543)
 * - DIRECT_URL    → direct connection (5432) for migrations
 * - Engine: classic (recommended for server environments)
 */

export default defineConfig({
  schema: "prisma/schema.prisma",

  migrations: {
    path: "prisma/migrations",
  },

  engine: "classic", // good for production

  datasource: {
    url: env("DATABASE_URL"),
    directUrl: env("DIRECT_URL"),
  },
  
});
