/**
 * Prisma Seed Script
 * ------------------
 * Usage:
 *   - Ensure FLAG_SALT is defined in the project root .env file.
 *   - Run using:
 *       node prisma/seed.js
 *       or
 *       npx prisma db seed
 *
 * Notes:
 *   - The script expects plaintext flags in the "flag" field of each seed entry.
 *   - After verification, consider removing plaintext flags from seed data.
 */

const path = require("path");
const dotenv = require("dotenv");
const crypto = require("crypto");
const { PrismaClient } = require("@prisma/client");

// Load environment variables from project root
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const prisma = new PrismaClient();
const FLAG_SALT = process.env.FLAG_SALT || "";

/**
 * Compute a salted SHA-256 hash of a plaintext flag.
 */
function hashFlag(flag) {
  const value = typeof flag === "string" ? flag.trim() : String(flag || "");
  return crypto.createHash("sha256").update(FLAG_SALT + value).digest("hex");
}

async function main() {
  console.log("Starting Prisma seed process (salted flag hashes).");
  console.log(`FLAG_SALT provided: ${FLAG_SALT ? "yes" : "no"}`);
  console.log("");

  const challenges = [
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

  for (const ch of challenges) {
    if (!ch.flag) {
      console.warn(`Skipping "${ch.name}" — no plaintext flag provided.`);
      continue;
    }

    const hashed = hashFlag(ch.flag);

    await prisma.challenge.upsert({
      where: { name: ch.name },
      update: {
        category: ch.category,
        difficulty: ch.difficulty,
        points: ch.points,
        description: ch.description,
        flagHash: hashed,
      },
      create: {
        name: ch.name,
        category: ch.category,
        difficulty: ch.difficulty,
        points: ch.points,
        description: ch.description,
        flagHash: hashed,
      },
    });

    console.log(`Upserted challenge: ${ch.name} (hash prefix: ${hashed.slice(0, 8)}...)`);
  }

  // Optional seed user
  await prisma.user.upsert({
    where: { username: "H4ck3rPr0" },
    update: {},
    create: { username: "H4ck3rPr0", passwordHash: "" },
  });

  console.log("\nSeed process completed. Review the data and consider removing plaintext flags.");
}

main()
  .catch((err) => {
    console.error("Seed error:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log("Prisma client disconnected.");
  });
