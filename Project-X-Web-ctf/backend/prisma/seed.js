import { PrismaClient } from "@prisma/client";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();
const FLAG_SALT = process.env.FLAG_SALT || "";

// Hash flag
function hashFlag(flag) {
  return crypto
    .createHash("sha256")
    .update(FLAG_SALT + flag)
    .digest("hex");
}

async function main() {
  console.log("\n🌱 Starting Project-X Full Seed...\n");

  /* ======================================================
     1. ADMIN USER
  ====================================================== */
  const admin = await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      email: "admin@projectx.com",
      passwordHash: "$2b$12$bK2iy6tifeJFTqIVGSYQt.0tX71om.UmOrinFX5fRyJwyv/Qe7S4y",
      role: "admin",
    },
  });

  console.log("✔ Admin created");

  /* ======================================================
     2. TEAMS
  ====================================================== */
  const teamNames = [
    "ShadowHunters",
    "ZeroDayMasters",
    "PacketWarriors",
    "CyberKnights",
    "BinaryBots",
  ];

  const teams = [];

  for (const name of teamNames) {
    const t = await prisma.team.create({
      data: {
        name,
        joinCode: crypto.randomBytes(4).toString("hex"),
      },
    });
    teams.push(t);
  }

  console.log("✔ Teams created:", teams.length);

  /* ======================================================
     3. USERS
  ====================================================== */
  const usernames = [
    "neo",
    "trinity",
    "morpheus",
    "ghost",
    "akira",
    "cipherx",
    "switch",
  ];

  const users = [];

  for (const u of usernames) {
    const team = teams[Math.floor(Math.random() * teams.length)];

    const user = await prisma.user.create({
      data: {
        username: u,
        passwordHash: "",
        teamId: team.id,
      },
    });

    users.push(user);
  }

  console.log("✔ Users created:", users.length);

  /* ======================================================
     4. CHALLENGES
  ====================================================== */
  const challengeList = [
    { name: "Web Basic 1", category: "Web", difficulty: "Easy" },
    { name: "SQLi Pro", category: "Web", difficulty: "Medium" },
    { name: "RSA Crack", category: "Crypto", difficulty: "Hard" },
    { name: "PWN Overflow", category: "PWN", difficulty: "Hard" },
    { name: "Forensics Dump", category: "Forensics", difficulty: "Medium" },
  ];

  const challenges = [];

  for (const ch of challengeList) {
    const c = await prisma.challenge.create({
      data: {
        name: ch.name,
        category: ch.category,
        difficulty: ch.difficulty,
        points: Math.floor(Math.random() * 400) + 100,
        description: "Sample challenge description.",
        flagHash: hashFlag(`FLAG{${ch.name.replace(" ", "_")}}`),
        released: true,
        hasContainer: false,
      },
    });
    challenges.push(c);
  }

  console.log("✔ Challenges created:", challenges.length);

  /* ======================================================
     5. SOLVES
  ====================================================== */
  const solveData = [];

  for (const user of users) {
    const randomChallenge =
      challenges[Math.floor(Math.random() * challenges.length)];

    solveData.push({
      userId: user.id,
      challengeId: randomChallenge.id,
      teamId: user.teamId,
      points: randomChallenge.points,
    });
  }

  await prisma.solved.createMany({
    data: solveData,
    skipDuplicates: true,
  });

  console.log("✔ Solves inserted:", solveData.length);

  /* ======================================================
     6. ATTEMPTS
  ====================================================== */
  const attemptData = [];

  for (const user of users) {
    attemptData.push({
      userId: user.id,
      challengeId: challenges[0].id,
      ip: "127.0.0.1",
      correct: false,
    });
  }

  await prisma.attempt.createMany({ data: attemptData });

  console.log("✔ Attempts inserted:", attemptData.length);

  /* ======================================================
     7. ANNOUNCEMENTS
  ====================================================== */
  const anns = await prisma.announcement.createMany({
    data: [
      { title: "🚀 Launch", message: "Project-X CTF is now live!" },
      { title: "🔥 New Challenges", message: "3 new challenges released!" },
      { title: "⚠ Maintenance", message: "Downtime at midnight." },
    ],
  });

  console.log("✔ Announcements created");

  /* ======================================================
     8. ANNOUNCEMENT READS
  ====================================================== */
  const allAnns = await prisma.announcement.findMany();
  const reads = [];

  for (const user of users) {
    const ann = allAnns[Math.floor(Math.random() * allAnns.length)];
    reads.push({
      userId: user.id,
      announcementId: ann.id,
    });
  }

  await prisma.announcementRead.createMany({
    data: reads,
    skipDuplicates: true,
  });

  console.log("✔ Announcement reads inserted");

  /* ======================================================
     DONE
  ====================================================== */
  console.log("\n🎉 SEED COMPLETED SUCCESSFULLY!\n");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
