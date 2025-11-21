// src/controllers/authController.js
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../config/db.js";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
const BCRYPT_ROUNDS = Number(process.env.BCRYPT_ROUNDS || 12);

/* ---------------------------------------------------------
   Helper: Generate JWT Token (clean + consistent)
--------------------------------------------------------- */
function generateToken(user) {
  return jwt.sign(
    {
      userId: user.id,
      username: user.username,
      role: user.role || "user",
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

/* ---------------------------------------------------------
   REGISTER USER
--------------------------------------------------------- */
export async function register(req, res) {
  try {
    console.log("📩 REGISTER:", req.body);

    const { username, password, email } = req.body || {};

    if (!username || !password) {
      return res.status(400).json({ error: "Username and password required" });
    }

    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing) {
      return res.status(409).json({ error: "Username already exists" });
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    const user = await prisma.user.create({
      data: { username, passwordHash, email, role: "user" },
    });

    const token = generateToken(user);

    return res.json({
      message: "Registration successful",
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("🔥 REGISTER ERROR:", err);
    return res.status(500).json({ error: "Server error" });
  }
}

/* ---------------------------------------------------------
   LOGIN USER (Bearer Token Only)
--------------------------------------------------------- */
export async function login(req, res) {
  try {
    console.log("🔐 LOGIN:", req.body);

    const { username, password } = req.body || {};

    if (!username || !password) {
      return res.status(400).json({ error: "Username and password required" });
    }

    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        passwordHash: true,
      },
    });

    if (!user) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const token = generateToken(user);

    return res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("🔥 LOGIN ERROR:", err);
    return res.status(500).json({ error: "Server error" });
  }
}

/* ---------------------------------------------------------
   LOGOUT (NOT USED IN BEARER VERSION, RETURN MESSAGE ONLY)
--------------------------------------------------------- */
export function logout(req, res) {
  return res.json({ message: "Logged out (remove token on client side)" });
}

/* ---------------------------------------------------------
   /me (Authenticated user info)
--------------------------------------------------------- */
export async function me(req, res) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
        team: {
          select: {
            id: true,
            name: true,
            bannedUntil: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        teamId: user.team?.id || null,
        teamName: user.team?.name || null,
        bannedUntil: user.team?.bannedUntil || null,
      },
    });
  } catch (err) {
    console.error("🔥 ME ERROR:", err);
    return res.status(500).json({ error: "Server error" });
  }
}

export default { register, login, logout, me };
