/**
 * Interactive Admin Creator (ESM)
 * --------------------------------
 * Run:
 *    node scripts/createAdmin.js
 */

import inquirer from "inquirer";
import chalk from "chalk";
import bcrypt from "bcrypt";
import prisma from "../src/config/db.js";

const BCRYPT_ROUNDS = 12;

async function askAdminDetails() {
  return inquirer.prompt([
    {
      type: "input",
      name: "username",
      message: "Enter admin username:",
      validate: (v) => v.length >= 3 || "Username must be at least 3 chars"
    },
    {
      type: "password",
      name: "password",
      mask: "*",
      message: "Enter admin password:",
      validate: (v) => v.length >= 6 || "Password must be at least 6 chars"
    },
    {
      type: "password",
      name: "confirmPassword",
      mask: "*",
      message: "Confirm password:",
      validate: (v, answers) =>
        v === answers.password || "Passwords do not match"
    }
  ]);
}

async function main() {
  console.log(chalk.cyan("\n🔐 Admin Account Creator\n"));

  const { username, password } = await askAdminDetails();

  console.log(chalk.yellow("Checking if admin already exists..."));

  const existing = await prisma.user.findUnique({ where: { username } });

  if (existing) {
    console.log(chalk.red("❌ Admin already exists! Choose another username."));
    process.exit(1);
  }

  console.log(chalk.yellow("Hashing password..."));
  const hash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  console.log(chalk.yellow("Creating admin user..."));

  const admin = await prisma.user.create({
    data: {
      username,
      passwordHash: hash,
      role: "admin"
    },
    select: {
      id: true,
      username: true,
      role: true,
      createdAt: true
    }
  });

  console.log(chalk.green("\n✅ Admin created successfully!\n"));
  console.log(admin);

  console.log(chalk.blue("\n🎉 You can now log in with your admin account.\n"));
  process.exit(0);
}

main().catch((err) => {
  console.error(chalk.red("\n❌ Failed to create admin:\n"), err);
  process.exit(1);
});
