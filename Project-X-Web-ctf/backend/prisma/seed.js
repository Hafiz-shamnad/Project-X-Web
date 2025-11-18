/**
 * Prisma Seed Script (ESM + Optimized + Secure)
 * --------------------------------------------
 * Usage:
 *   npx prisma db seed
 * Or:
 *   node prisma/seed.js
 */

import path from "path";
import crypto from "crypto";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const prisma = new PrismaClient();
const FLAG_SALT = process.env.FLAG_SALT || "";

/* --------------------------------------------
 * Flag Hash Utility
 * -------------------------------------------- */
function hashFlag(flag) {
  return crypto
    .createHash("sha256")
    .update(FLAG_SALT + flag.trim())
    .digest("hex");
}

/* --------------------------------------------
 * Seed Data
 * -------------------------------------------- */
const challengeSeeds = [
  {
    name: "Web Exploit 101",
    category: "Web",
    difficulty: "Easy",
    points: 100,
    description: "Find the hidden flag in the vulnerable web application.",
    flag: "FLAG{web_exploit_101}",
  },
  {
    name: "SQL Injection Master",
    category: "Web",
    difficulty: "Medium",
    points: 250,
    description: "Bypass authentication using SQL injection techniques.",
    flag: "FLAG{sql_mastery}",
  },
  {
    name: "Cryptic Messages",
    category: "Crypto",
    difficulty: "Medium",
    points: 300,
    description: "Decrypt the encoded message to reveal the flag.",
    flag: "FLAG{cryptic_msg}",
  },
  {
    name: "Binary Exploitation",
    category: "PWN",
    difficulty: "Hard",
    points: 500,
    description: "Exploit the buffer overflow vulnerability.",
    flag: "FLAG{pwn_overflow}",
  },
  {
    name: "Reverse Engineering",
    category: "Reverse",
    difficulty: "Hard",
    points: 450,
    description: "Analyze the binary and extract the hidden flag.",
    flag: "FLAG{rev_engineer}",
  },
  {
    name: "Network Forensics",
    category: "Forensics",
    difficulty: "Easy",
    points: 150,
    description: "Analyze the packet capture file.",
    flag: "FLAG{net_forensics}",
  },
];

/* --------------------------------------------
 * Main Seeder
 * -------------------------------------------- */
async function main() {
  console.log("\n🚀 Starting Prisma seed (salted flags enabled)\n");

  if (!FLAG_SALT) {
    console.log("⚠️  FLAG_SALT is missing — using empty salt!");
  }

  for (const ch of challengeSeeds) {
    const flagHash = hashFlag(ch.flag);

    await prisma.challenge.upsert({
      where: { name: ch.name },
      update: {
        category: ch.category,
        difficulty: ch.difficulty,
        points: ch.points,
        description: ch.description,
        flagHash,
      },
      create: {
        name: ch.name,
        category: ch.category,
        difficulty: ch.difficulty,
        points: ch.points,
        description: ch.description,
        flagHash,
      },
    });

    console.log(`✔ Seeded: ${ch.name}  (hash: ${flagHash.slice(0, 10)}...)`);
  }

  // Optional seed user
  await prisma.user.upsert({
    where: { username: "H4ck3rPr0" },
    update: {},
    create: { username: "H4ck3rPr0", passwordHash: "" },
  });

  console.log("\n🌱 Seed process completed\n");
}

/* --------------------------------------------
 * Execute Seeder
 * -------------------------------------------- */
main()
  .catch((err) => {
    console.error("❌ Seed error:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
