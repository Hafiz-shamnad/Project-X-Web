// src/controllers/authController.js
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../config/db.js";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
const BCRYPT_ROUNDS = Number(process.env.BCRYPT_ROUNDS || 12);

// Create token
function generateToken(user) {
  return jwt.sign(
    { userId: user.id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

/* REGISTER */
export async function register(req, res) {
  try {
    console.log("📩 REGISTER BODY:", req.body);

    const { username, password, email } = req.body || {};

    if (!username || !password) {
      return res.status(400).json({ error: "Username and password required" });
    }

    const exists = await prisma.user.findUnique({ where: { username } });
    if (exists) {
      return res.status(409).json({ error: "Username already exists" });
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const user = await prisma.user.create({
      data: { username, passwordHash, email },
    });

    const token = generateToken(user);

    return res.json({
      message: "Registration successful",
      token,
      user: { id: user.id, username: user.username, role: user.role },
    });
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}

/* LOGIN */
export async function login(req, res) {
  try {
    console.log("🔐 LOGIN HEADERS:", req.headers);
    console.log("🔐 LOGIN BODY RAW:", req.body);

    // SAFE destructuring
    const { username, password } = req.body || {};

    if (!username || !password) {
      return res
        .status(400)
        .json({ error: "Username and password required" });
    }

    const user = await prisma.user.findUnique({
      where: { username },
      select: { id: true, username: true, role: true, passwordHash: true },
    });

    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: "Invalid credentials" });

    const token = generateToken(user);

    return res.json({
      message: "Login successful",
      token,
      user: { id: user.id, username: user.username, role: user.role },
    });
  } catch (err) {
    console.error("🔥 Login error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}

/* LOGOUT */
export function logout(req, res) {
  try {
    res.clearCookie("token");
  } catch (e) {}
  return res.json({ message: "Logged out" });
}

/* ME */
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
        team: { select: { id: true, name: true, bannedUntil: true } },
      },
    });

    if (!user) return res.status(404).json({ error: "User not found" });

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
    console.error("Auth /me error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}

export default { register, login, logout, me };
