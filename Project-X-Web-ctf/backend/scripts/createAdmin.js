/**
 * Administrative CLI Tool
 * -----------------------
 * Provides interactive admin user management:
 *  - Create new admin accounts
 *  - List existing admins
 *  - Reset admin passwords
 *  - Delete admin accounts
 */

const readline = require("readline");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

const prisma = new PrismaClient();
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question) {
  return new Promise((resolve) => rl.question(question, resolve));
}

function generatePassword(length = 14) {
  return crypto.randomBytes(length).toString("base64").slice(0, length);
}

/* -------------------------------------------------------------------------- */
/*                                 Menu Logic                                  */
/* -------------------------------------------------------------------------- */

async function showMenu() {
  console.log("\nAdministrative Management Tool");
  console.log("1) Create Administrator");
  console.log("2) List Administrators");
  console.log("3) Reset Administrator Password");
  console.log("4) Delete Administrator");
  console.log("5) Exit\n");

  const choice = await ask("Select an option: ");
  switch (choice.trim()) {
    case "1":
      return createAdmin();
    case "2":
      return listAdmins();
    case "3":
      return resetPassword();
    case "4":
      return deleteAdmin();
    case "5":
      closeCLI();
      return;
    default:
      console.log("Invalid option.");
      return showMenu();
  }
}

/* -------------------------------------------------------------------------- */
/*                                CLI Actions                                  */
/* -------------------------------------------------------------------------- */

async function createAdmin() {
  try {
    console.log("\nCreate Administrator");

    const username = await ask("Enter username: ");
    const email = await ask("Enter email: ");
    const password = await ask("Enter password (leave blank for auto-generated): ");

    const finalPassword = password.trim() || generatePassword();
    const passwordHash = await bcrypt.hash(finalPassword, 12);

    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing) {
      console.log(`User "${username}" already exists.`);
      return showMenu();
    }

    await prisma.user.create({
      data: {
        username,
        email,
        passwordHash,
        role: "admin",
      },
    });

    console.log("\nAdministrator created successfully.");
    console.log("Credentials:");
    console.log(" Username:", username);
    console.log(" Email:   ", email);
    console.log(" Password:", finalPassword);

  } catch (err) {
    console.error("Error creating administrator:", err);
  }
  return showMenu();
}

async function listAdmins() {
  try {
    console.log("\nAdministrator Accounts:");

    const admins = await prisma.user.findMany({
      where: { role: "admin" },
      select: { id: true, username: true, email: true, createdAt: true },
      orderBy: { id: "asc" },
    });

    if (admins.length === 0) {
      console.log("No administrators found.");
    } else {
      admins.forEach((admin) => {
        console.log(
          `- ID: ${admin.id}, Username: ${admin.username}, Email: ${admin.email}, Created: ${admin.createdAt.toISOString()}`
        );
      });
    }

  } catch (err) {
    console.error("Error listing administrators:", err);
  }
  return showMenu();
}

async function resetPassword() {
  try {
    console.log("\nReset Administrator Password");

    const username = await ask("Enter username: ");
    const admin = await prisma.user.findUnique({ where: { username } });

    if (!admin || admin.role !== "admin") {
      console.log(`Administrator "${username}" not found.`);
      return showMenu();
    }

    const newPassword = generatePassword();
    const passwordHash = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { username },
      data: { passwordHash },
    });

    console.log("\nPassword reset successfully.");
    console.log("New password:", newPassword);

  } catch (err) {
    console.error("Error resetting password:", err);
  }
  return showMenu();
}

async function deleteAdmin() {
  try {
    console.log("\nDelete Administrator");

    const username = await ask("Enter username: ");
    const admin = await prisma.user.findUnique({ where: { username } });

    if (!admin || admin.role !== "admin") {
      console.log(`Administrator "${username}" not found.`);
      return showMenu();
    }

    const confirm = await ask(
      `Are you sure you want to delete "${username}"? This action cannot be undone (y/n): `
    );

    if (confirm.trim().toLowerCase() === "y") {
      await prisma.user.delete({ where: { username } });
      console.log("Administrator deleted successfully.");
    } else {
      console.log("Operation cancelled.");
    }

  } catch (err) {
    console.error("Error deleting administrator:", err);
  }
  return showMenu();
}

/* -------------------------------------------------------------------------- */
/*                               Cleanup Methods                               */
/* -------------------------------------------------------------------------- */

function closeCLI() {
  console.log("Exiting Administrative Tool.");
  rl.close();
  prisma.$disconnect();
}

/* -------------------------------------------------------------------------- */
/*                                    Start                                    */
/* -------------------------------------------------------------------------- */

(async () => {
  console.clear();
  console.log("Administrative User Management CLI");
  await showMenu();
})();
