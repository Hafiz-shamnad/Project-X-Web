/**
 * Authentication Middleware (ESM)
 * -------------------------------
 */

import jwt from "jsonwebtoken";

export function authenticate(req, res, next) {
  try {
    const token = req.cookies?.token;
    if (!token) {
      return res.status(401).json({ error: "Authentication token missing" });
    }

    const secret = process.env.JWT_SECRET || "supersecretkey";
    const decoded = jwt.verify(token, secret);

    const userId = decoded.userId || decoded.id;
    if (!userId) {
      return res.status(401).json({ error: "Invalid token: missing user ID" });
    }

    req.user = {
      id: userId,
      username: decoded.username || null,
      role: decoded.role || "user",
    };

    next();
  } catch (err) {
    console.error("Authentication error:", err.message);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

export function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ error: "Access denied: admin only" });
  }
  next();
}

export default { authenticate, requireAdmin };
