import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log("\n🌱 Starting Admin Seed...\n");

  // Pre-hashed password: "admin123"
  // bcrypt hash: $2b$12$bK2iy6tifeJFTqIVGSYQt.0tX71om.UmOrinFX5fRyJwyv/Qe7S4y
  const passwordHash =
    "$2b$12$bK2iy6tifeJFTqIVGSYQt.0tX71om.UmOrinFX5fRyJwyv/Qe7S4y";

  const admin = await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      email: "admin@projectx.com",
      passwordHash,
      role: "admin",
    },
  });

  console.log("✔ Admin created or already exists:", admin.username);
  console.log("\n🎉 Admin Seed Completed!\n");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
