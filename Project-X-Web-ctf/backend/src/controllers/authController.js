// src/controllers/authController.js
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../config/db.js";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;
const BCRYPT_ROUNDS = Number(process.env.BCRYPT_ROUNDS || 12);

/* ---------------------------------------------------------
   Helper: Generate JWT Token
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
    const isProd = process.env.NODE_ENV === "production";

    if (!username || !password)
      return res.status(400).json({ error: "Username and password required" });

    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing)
      return res.status(409).json({ error: "Username already exists" });

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    const user = await prisma.user.create({
      data: { username, passwordHash, email, role: "user" },
    });

    const token = generateToken(user);

    // API token (secure, httpOnly)
    res.cookie("token", token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // WS Token (readable by frontend)
    res.cookie("wsToken", token, {
      httpOnly: false,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      message: "Registration successful",
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
   LOGIN USER (Cookie-based Auth + WebSocket token)
--------------------------------------------------------- */
export async function login(req, res) {
  try {
    console.log("🔐 LOGIN:", req.body);

    const { username, password } = req.body || {};
    const isProd = process.env.NODE_ENV === "production";

    if (!username || !password)
      return res.status(400).json({ error: "Username and password required" });

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

    if (!user)
      return res.status(401).json({ error: "Invalid username or password" });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid)
      return res.status(401).json({ error: "Invalid username or password" });

    const token = generateToken(user);

    // API token (secure, httpOnly)
    res.cookie("token", token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      partitioned: isProd,
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // WS Token (readable by frontend)
    res.cookie("wsToken", token, {
      httpOnly: false,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      partitioned: true,
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      message: "Login successful",
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
   LOGOUT (clears both cookies)
--------------------------------------------------------- */
export function logout(req, res) {
  const isProd = process.env.NODE_ENV === "production";

  res.clearCookie("token", {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    path: "/",
  });

  res.clearCookie("wsToken", {
    httpOnly: false,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    path: "/",
  });

  return res.json({ message: "Logged out successfully" });
}

/* ---------------------------------------------------------
   /me (Authenticated user info)
--------------------------------------------------------- */
export async function me(req, res) {
  try {
    if (!req.user?.id)
      return res.status(401).json({ error: "Not authenticated" });

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
    console.error("🔥 ME ERROR:", err);
    return res.status(500).json({ error: "Server error" });
  }
}

export default { register, login, logout, me };
