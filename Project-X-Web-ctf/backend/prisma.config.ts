import "dotenv/config";
import { defineConfig, env } from "prisma/config";

/**
 * Prisma Configuration
 * --------------------
 * Defines:
 *  - Schema path
 *  - Migration directory
 *  - Query engine selection
 *  - Datasource configuration
 */

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic",
  datasource: {
    url: env("DATABASE_URL"),
  },
});
